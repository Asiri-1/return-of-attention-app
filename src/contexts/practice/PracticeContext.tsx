// ✅ FIREBASE-ONLY PracticeContext - No localStorage conflicts
// File: src/contexts/practice/PracticeContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useUser } from '../user/UserContext';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// PRACTICE SESSION INTERFACES (UNCHANGED)
// ================================
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number;
  stageLabel?: string;
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'mid-day-reset' | 'work-home-transition' | 'evening-wind-down' | 'breathing-reset' | 'thought-labeling' | 'body-scan' | 'single-point-focus' | 'loving-kindness' | 'gratitude-moment' | 'mindful-transition' | 'stress-release';
  mindRecoveryPurpose?: 'energy-boost' | 'stress-relief' | 'mental-refresh' | 'transition-support' | 'sleep-preparation' | 'emotional-balance' | 'quick-reset' | 'awareness-anchor';
  rating?: number;
  notes?: string;
  presentPercentage?: number;
  environment?: {
    posture: string;
    location: string;
    lighting: string;
    sounds: string;
  };
  pahmCounts?: {
    present_attachment: number;
    present_neutral: number;
    present_aversion: number;
    past_attachment: number;
    past_neutral: number;
    past_aversion: number;
    future_attachment: number;
    future_neutral: number;
    future_aversion: number;
  };
  recoveryMetrics?: {
    stressReduction: number;
    energyLevel: number;
    clarityImprovement: number;
    moodImprovement: number;
  };
  metadata?: any;
  // ✅ FIREBASE FIELDS
  firestoreId?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

interface PracticeStats {
  totalSessions: number;
  totalMinutes: number;
  averageQuality: number;
  averagePresentPercentage: number;
  currentStreak: number;
  longestStreak: number;
  totalMindRecoverySessions: number;
  totalMindRecoveryMinutes: number;
  averageMindRecoveryRating: number;
}

interface PracticeContextType {
  // Data
  sessions: PracticeSessionData[];
  isLoading: boolean;
  stats: PracticeStats;
  
  // Session management
  addPracticeSession: (session: Omit<PracticeSessionData, 'sessionId'>) => Promise<void>;
  addMindRecoverySession: (session: Omit<PracticeSessionData, 'sessionId'>) => Promise<void>;
  deletePracticeSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<PracticeSessionData>) => Promise<void>;
  
  // Data retrieval
  getPracticeSessions: () => PracticeSessionData[];
  getMindRecoverySessions: () => PracticeSessionData[];
  getMeditationSessions: () => PracticeSessionData[];
  getSessionsByStage: (stage: number) => PracticeSessionData[];
  getSessionsByDateRange: (startDate: Date, endDate: Date) => PracticeSessionData[];
  getRecentSessions: (count: number) => PracticeSessionData[];
  
  // Stage progression
  getCurrentStage: () => number;
  getStageProgress: (stage: number) => { completed: number; total: number; percentage: number };
  canAdvanceToStage: (stage: number) => boolean;
  
  // Statistics
  calculateStats: () => PracticeStats;
  getSessionFrequency: () => { daily: number; weekly: number; monthly: number };
  getProgressTrend: () => 'improving' | 'stable' | 'declining';
  
  // Utility
  clearPracticeData: () => void;
  exportPracticeData: () => any;
  
  // Legacy compatibility
  getLegacyPracticeHistory: () => PracticeSessionData[];
  getLegacyMindRecoveryHistory: () => PracticeSessionData[];
}

// ================================
// CREATE CONTEXT
// ================================
const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

// ================================
// FIREBASE-ONLY PRACTICE PROVIDER
// ================================
export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { syncProfile } = useUser();
  const [sessions, setSessions] = useState<PracticeSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // UTILITY FUNCTIONS
  // ================================
  const generateId = useCallback((prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ================================
  // FIREBASE-ONLY: Data persistence
  // ================================
  const saveSessionToFirebase = useCallback(async (sessionData: PracticeSessionData) => {
    if (!currentUser?.uid) return;

    try {
      // Create clean data for Firestore
      const firestoreData = {
        sessionId: sessionData.sessionId,
        timestamp: sessionData.timestamp,
        duration: sessionData.duration,
        sessionType: sessionData.sessionType,
        stageLevel: sessionData.stageLevel,
        stageLabel: sessionData.stageLabel,
        mindRecoveryContext: sessionData.mindRecoveryContext,
        mindRecoveryPurpose: sessionData.mindRecoveryPurpose,
        rating: sessionData.rating,
        notes: sessionData.notes,
        presentPercentage: sessionData.presentPercentage,
        environment: sessionData.environment,
        pahmCounts: sessionData.pahmCounts,
        recoveryMetrics: sessionData.recoveryMetrics,
        metadata: sessionData.metadata,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'userSessions', currentUser.uid, 'practiceSessions'), firestoreData);
      console.log(`✅ Practice session saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save session to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const updateSessionInFirebase = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    if (!currentUser?.uid) return;

    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session?.firestoreId) {
        console.warn('No Firestore ID found for session:', sessionId);
        return;
      }

      const sessionDoc = doc(db, 'userSessions', currentUser.uid, 'practiceSessions', session.firestoreId);
      await updateDoc(sessionDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log(`✅ Session updated in Firebase for user ${currentUser.uid.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Failed to update session in Firebase:', error);
    }
  }, [currentUser?.uid, sessions]);

  const deleteSessionFromFirebase = useCallback(async (sessionId: string) => {
    if (!currentUser?.uid) return;

    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session?.firestoreId) {
        console.warn('No Firestore ID found for session:', sessionId);
        return;
      }

      const sessionDoc = doc(db, 'userSessions', currentUser.uid, 'practiceSessions', session.firestoreId);
      await deleteDoc(sessionDoc);
      console.log(`✅ Session deleted from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Failed to delete session from Firebase:', error);
    }
  }, [currentUser?.uid, sessions]);

  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    
    try {
      const q = query(
        collection(db, 'userSessions', currentUser.uid, 'practiceSessions'), 
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const firestoreSessions: PracticeSessionData[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const session: PracticeSessionData = {
          sessionId: data.sessionId || generateId('session'),
          firestoreId: docSnapshot.id,
          timestamp: data.timestamp || (data.createdAt?.toDate?.()?.toISOString()) || new Date().toISOString(),
          duration: data.duration || 0,
          sessionType: data.sessionType || 'meditation',
          stageLevel: data.stageLevel,
          stageLabel: data.stageLabel,
          mindRecoveryContext: data.mindRecoveryContext,
          mindRecoveryPurpose: data.mindRecoveryPurpose,
          rating: data.rating,
          notes: data.notes,
          presentPercentage: data.presentPercentage,
          environment: data.environment,
          pahmCounts: data.pahmCounts,
          recoveryMetrics: data.recoveryMetrics,
          metadata: data.metadata,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        firestoreSessions.push(session);
      });

      setSessions(firestoreSessions);
      console.log(`📦 Loaded ${firestoreSessions.length} sessions from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
    } catch (error) {
      console.error('❌ Failed to load sessions from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, generateId]);

  // ================================
  // LOAD DATA ON USER CHANGE
  // ================================
  useEffect(() => {
    if (currentUser?.uid) {
      loadFromFirebase();
    } else {
      // Reset to defaults when no user
      setSessions([]);
    }
  }, [currentUser?.uid, loadFromFirebase]);

  // ================================
  // CALCULATE STATISTICS (UNCHANGED)
  // ================================
  const calculateStats = useCallback((): PracticeStats => {
    const allSessions = sessions;
    const mindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery');
    
    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageQuality = totalSessions > 0 ? 
      Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions) * 10) / 10 : 0;
    const averagePresentPercentage = totalSessions > 0 ?
      Math.round(allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / totalSessions) : 0;
    
    // Calculate streaks
    const sortedSessions = [...allSessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakCount = 0;
    let maxStreakCount = 0;
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreakCount) {
        currentStreakCount++;
        if (currentStreak === 0) currentStreak = currentStreakCount;
      } else if (daysDiff > currentStreakCount) {
        if (currentStreakCount > maxStreakCount) {
          maxStreakCount = currentStreakCount;
        }
        break;
      }
    }
    
    longestStreak = Math.max(maxStreakCount, currentStreak);
    
    // Mind recovery stats
    const totalMindRecoverySessions = mindRecoverySessions.length;
    const totalMindRecoveryMinutes = mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0);
    const averageMindRecoveryRating = totalMindRecoverySessions > 0 ?
      Math.round((mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalMindRecoverySessions) * 10) / 10 : 0;

    return {
      totalSessions,
      totalMinutes,
      averageQuality,
      averagePresentPercentage,
      currentStreak,
      longestStreak,
      totalMindRecoverySessions,
      totalMindRecoveryMinutes,
      averageMindRecoveryRating
    };
  }, [sessions]);

  // ================================
  // FIREBASE-ONLY: SESSION MANAGEMENT
  // ================================
  const addPracticeSession = useCallback(async (session: Omit<PracticeSessionData, 'sessionId'>) => {
    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session'),
      timestamp: session.timestamp || new Date().toISOString()
    };
    
    // ✅ IMMEDIATE UI UPDATE
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    
    // ✅ SAVE TO FIREBASE
    try {
      const firestoreId = await saveSessionToFirebase(newSession);
      if (firestoreId) {
        // Update session with Firestore ID
        const finalSession = { ...newSession, firestoreId };
        setSessions(prev => prev.map(s => s.sessionId === newSession.sessionId ? finalSession : s));
      }
    } catch (error) {
      console.error('Failed to save session to Firebase:', error);
      // Remove from UI if Firebase save failed
      setSessions(prev => prev.filter(s => s.sessionId !== newSession.sessionId));
      throw error;
    }
    
    // ✅ SYNC WITH USER PROFILE
    const newStats = {
      totalSessions: updatedSessions.length,
      totalMinutes: updatedSessions.reduce((sum, s) => sum + s.duration, 0),
      averageQuality: updatedSessions.length > 0 ? 
        Math.round((updatedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / updatedSessions.length) * 10) / 10 : 0,
      averagePresentPercentage: updatedSessions.length > 0 ?
        Math.round(updatedSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / updatedSessions.length) : 0,
      currentStreak: 0,
      longestStreak: 0,
      totalMindRecoverySessions: updatedSessions.filter(s => s.sessionType === 'mind_recovery').length,
      totalMindRecoveryMinutes: updatedSessions.filter(s => s.sessionType === 'mind_recovery').reduce((sum, s) => sum + s.duration, 0),
      averageMindRecoveryRating: 0
    };
    
    if (syncProfile) {
      syncProfile(newStats);
    }
  }, [sessions, generateId, saveSessionToFirebase, syncProfile]);

  const addMindRecoverySession = useCallback(async (session: Omit<PracticeSessionData, 'sessionId'>) => {
    const mindRecoverySession: Omit<PracticeSessionData, 'sessionId'> = {
      ...session,
      sessionType: 'mind_recovery'
    };
    await addPracticeSession(mindRecoverySession);
  }, [addPracticeSession]);

  const deletePracticeSession = useCallback(async (sessionId: string) => {
    const updatedSessions = sessions.filter(session => session.sessionId !== sessionId);
    setSessions(updatedSessions);
    
    // ✅ DELETE FROM FIREBASE
    await deleteSessionFromFirebase(sessionId);
    
    // ✅ SYNC STATS
    const newStats = calculateStats();
    if (syncProfile) {
      syncProfile(newStats);
    }
  }, [sessions, deleteSessionFromFirebase, calculateStats, syncProfile]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    const updatedSessions = sessions.map(session =>
      session.sessionId === sessionId ? { ...session, ...updates } : session
    );
    setSessions(updatedSessions);
    
    // ✅ UPDATE IN FIREBASE
    await updateSessionInFirebase(sessionId, updates);
  }, [sessions, updateSessionInFirebase]);

  // ================================
  // DATA RETRIEVAL METHODS (UNCHANGED)
  // ================================
  const getPracticeSessions = useCallback((): PracticeSessionData[] => {
    return sessions;
  }, [sessions]);

  const getMindRecoverySessions = useCallback((): PracticeSessionData[] => {
    return sessions.filter(session => session.sessionType === 'mind_recovery');
  }, [sessions]);

  const getMeditationSessions = useCallback((): PracticeSessionData[] => {
    return sessions.filter(session => session.sessionType === 'meditation');
  }, [sessions]);

  const getSessionsByStage = useCallback((stage: number): PracticeSessionData[] => {
    return sessions.filter(session => session.stageLevel === stage);
  }, [sessions]);

  const getSessionsByDateRange = useCallback((startDate: Date, endDate: Date): PracticeSessionData[] => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  }, [sessions]);

  const getRecentSessions = useCallback((count: number): PracticeSessionData[] => {
    return [...sessions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, count);
  }, [sessions]);

  // ================================
  // STAGE PROGRESSION METHODS (UNCHANGED)
  // ================================
  const getCurrentStage = useCallback((): number => {
    const meditationSessions = getMeditationSessions();
    if (meditationSessions.length === 0) return 1;
    
    const totalSessions = meditationSessions.length;
    const avgQuality = meditationSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalSessions;
    
    if (totalSessions >= 50 && avgQuality >= 4.0) return 5;
    if (totalSessions >= 30 && avgQuality >= 3.5) return 4;
    if (totalSessions >= 15 && avgQuality >= 3.0) return 3;
    if (totalSessions >= 5 && avgQuality >= 2.5) return 2;
    return 1;
  }, [getMeditationSessions]);

  const getStageProgress = useCallback((stage: number): { completed: number; total: number; percentage: number } => {
    const stageSessions = getSessionsByStage(stage);
    const stageRequirements = {
      1: 5,
      2: 10,
      3: 15,
      4: 20,
      5: 25
    };
    
    const required = stageRequirements[stage as keyof typeof stageRequirements] || 10;
    const completed = stageSessions.length;
    const percentage = Math.min(Math.round((completed / required) * 100), 100);
    
    return { completed, total: required, percentage };
  }, [getSessionsByStage]);

  const canAdvanceToStage = useCallback((stage: number): boolean => {
    const currentStage = getCurrentStage();
    return stage <= currentStage + 1;
  }, [getCurrentStage]);

  // ================================
  // STATISTICS METHODS (UNCHANGED)
  // ================================
  const getSessionFrequency = useCallback(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const daily = sessions.filter(s => new Date(s.timestamp) >= oneDayAgo).length;
    const weekly = sessions.filter(s => new Date(s.timestamp) >= oneWeekAgo).length;
    const monthly = sessions.filter(s => new Date(s.timestamp) >= oneMonthAgo).length;
    
    return { daily, weekly, monthly };
  }, [sessions]);

  const getProgressTrend = useCallback((): 'improving' | 'stable' | 'declining' => {
    if (sessions.length < 10) return 'stable';
    
    const recentSessions = sessions.slice(-5);
    const earlierSessions = sessions.slice(-10, -5);
    
    const recentAvg = recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length;
    const earlierAvg = earlierSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / earlierSessions.length;
    
    const difference = recentAvg - earlierAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  }, [sessions]);

  // ================================
  // UTILITY METHODS (FIREBASE-ONLY)
  // ================================
  const clearPracticeData = useCallback(async () => {
    setSessions([]);
    
    // Clear Firebase data
    if (currentUser?.uid) {
      try {
        const q = query(collection(db, 'userSessions', currentUser.uid, 'practiceSessions'));
        const querySnapshot = await getDocs(q);
        
        const batch = writeBatch(db);
        querySnapshot.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        await batch.commit();
        
        console.log(`🧹 Practice data cleared in Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      } catch (error) {
        console.error('❌ Error clearing practice data in Firebase:', error);
      }
    }
  }, [currentUser?.uid]);

  const exportPracticeData = useCallback(() => {
    return {
      sessions: sessions,
      stats: calculateStats(),
      exportedAt: new Date().toISOString(),
      source: 'firebase_only'
    };
  }, [sessions, calculateStats]);

  // ================================
  // LEGACY COMPATIBILITY (UNCHANGED)
  // ================================
  const getLegacyPracticeHistory = useCallback((): PracticeSessionData[] => {
    return getPracticeSessions();
  }, [getPracticeSessions]);

  const getLegacyMindRecoveryHistory = useCallback((): PracticeSessionData[] => {
    return getMindRecoverySessions();
  }, [getMindRecoverySessions]);

  // ================================
  // COMPUTED VALUES
  // ================================
  const stats = useMemo(() => calculateStats(), [calculateStats]);

  // ================================
  // REAL-TIME FIREBASE LISTENER
  // ================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, 'userSessions', currentUser.uid, 'practiceSessions'), 
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const firestoreSessions: PracticeSessionData[] = [];
      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        const session: PracticeSessionData = {
          sessionId: data.sessionId || generateId('session'),
          firestoreId: docSnapshot.id,
          timestamp: data.timestamp || (data.createdAt?.toDate?.()?.toISOString()) || new Date().toISOString(),
          duration: data.duration || 0,
          sessionType: data.sessionType || 'meditation',
          stageLevel: data.stageLevel,
          stageLabel: data.stageLabel,
          mindRecoveryContext: data.mindRecoveryContext,
          mindRecoveryPurpose: data.mindRecoveryPurpose,
          rating: data.rating,
          notes: data.notes,
          presentPercentage: data.presentPercentage,
          environment: data.environment,
          pahmCounts: data.pahmCounts,
          recoveryMetrics: data.recoveryMetrics,
          metadata: data.metadata,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        firestoreSessions.push(session);
      });

      setSessions(firestoreSessions);
      console.log(`🔄 Real-time update: ${firestoreSessions.length} sessions for user ${currentUser.uid.substring(0, 8)}...`);
    }, (error) => {
      console.error('❌ Firebase listener error:', error);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, generateId]);

  // ================================
  // CONTEXT VALUE (UNCHANGED)
  // ================================
  const contextValue: PracticeContextType = useMemo(() => ({
    // Data
    sessions,
    isLoading,
    stats,
    
    // Session management
    addPracticeSession,
    addMindRecoverySession,
    deletePracticeSession,
    updateSession,
    
    // Data retrieval
    getPracticeSessions,
    getMindRecoverySessions,
    getMeditationSessions,
    getSessionsByStage,
    getSessionsByDateRange,
    getRecentSessions,
    
    // Stage progression
    getCurrentStage,
    getStageProgress,
    canAdvanceToStage,
    
    // Statistics
    calculateStats,
    getSessionFrequency,
    getProgressTrend,
    
    // Utility
    clearPracticeData,
    exportPracticeData,
    
    // Legacy compatibility
    getLegacyPracticeHistory,
    getLegacyMindRecoveryHistory
  }), [
    sessions, isLoading, stats,
    addPracticeSession, addMindRecoverySession, deletePracticeSession, updateSession,
    getPracticeSessions, getMindRecoverySessions, getMeditationSessions,
    getSessionsByStage, getSessionsByDateRange, getRecentSessions,
    getCurrentStage, getStageProgress, canAdvanceToStage,
    calculateStats, getSessionFrequency, getProgressTrend,
    clearPracticeData, exportPracticeData,
    getLegacyPracticeHistory, getLegacyMindRecoveryHistory
  ]);

  return (
    <PracticeContext.Provider value={contextValue}>
      {children}
    </PracticeContext.Provider>
  );
};

// ================================
// CUSTOM HOOK (UNCHANGED)
// ================================
export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

export default PracticeContext;