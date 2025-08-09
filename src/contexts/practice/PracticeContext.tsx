// ===============================================
// 🔧 FINAL FIXED PRACTICE CONTEXT - NO UNDEFINED FIELDS
// ===============================================

// FILE: src/contexts/practice/PracticeContext.tsx
// ✅ FIXED: Uses correct Firestore collections + filters undefined values

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
  where,
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// INTERFACES (Enhanced for all session types)
// ================================
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number; // in minutes
  sessionType: 'meditation' | 'mind_recovery';
  
  // Meditation-specific fields
  stageLevel?: number;
  stageLabel?: string;
  
  // Mind Recovery-specific fields
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'mid-day-reset' | 'work-home-transition' | 'bedtime-winddown' | 'breathing-reset' | 'thought-labeling' | 'body-scan' | 'single-point-focus' | 'loving-kindness' | 'gratitude-moment' | 'mindful-transition' | 'stress-release';
  mindRecoveryPurpose?: 'energy-boost' | 'stress-relief' | 'mental-refresh' | 'transition-support' | 'sleep-preparation' | 'emotional-balance' | 'quick-reset' | 'awareness-anchor';
  
  // Common fields
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
  
  // Firebase fields
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
  totalMeditationSessions: number;
  totalMeditationMinutes: number;
  averageMeditationRating: number;
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
// ENHANCED PRACTICE PROVIDER
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
  // ✅ FIXED: ENHANCED FIREBASE OPERATIONS - NO UNDEFINED VALUES
  // ================================
  const saveSessionToFirebase = useCallback(async (sessionData: PracticeSessionData) => {
    if (!currentUser?.uid) {
      console.error('❌ No user authenticated for session save');
      throw new Error('User not authenticated');
    }

    try {
      // ✅ FIXED: Create clean data for Firestore - filter out undefined values
      const firestoreData: any = {
        sessionId: sessionData.sessionId,
        timestamp: sessionData.timestamp,
        duration: sessionData.duration,
        sessionType: sessionData.sessionType,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // ✅ FIXED: Only add defined fields to prevent "undefined" errors
      if (sessionData.stageLevel !== undefined) firestoreData.stageLevel = sessionData.stageLevel;
      if (sessionData.stageLabel !== undefined) firestoreData.stageLabel = sessionData.stageLabel;
      if (sessionData.mindRecoveryContext !== undefined) firestoreData.mindRecoveryContext = sessionData.mindRecoveryContext;
      if (sessionData.mindRecoveryPurpose !== undefined) firestoreData.mindRecoveryPurpose = sessionData.mindRecoveryPurpose;
      if (sessionData.rating !== undefined) firestoreData.rating = sessionData.rating;
      if (sessionData.notes !== undefined) firestoreData.notes = sessionData.notes;
      if (sessionData.presentPercentage !== undefined) firestoreData.presentPercentage = sessionData.presentPercentage;
      if (sessionData.environment !== undefined) firestoreData.environment = sessionData.environment;
      if (sessionData.pahmCounts !== undefined) firestoreData.pahmCounts = sessionData.pahmCounts;
      if (sessionData.recoveryMetrics !== undefined) firestoreData.recoveryMetrics = sessionData.recoveryMetrics;
      if (sessionData.metadata !== undefined) firestoreData.metadata = sessionData.metadata;

      // ✅ FIXED: Use correct collection paths
      let collectionPath;
      if (sessionData.sessionType === 'mind_recovery') {
        collectionPath = 'mindRecoverySessions';
        console.log('💾 Saving Mind Recovery session to mindRecoverySessions collection');
      } else {
        collectionPath = 'practiceSessions';
        console.log('💾 Saving Meditation session to practiceSessions collection');
      }

      console.log('🔍 Clean Firestore data (no undefined values):', firestoreData);

      const docRef = await addDoc(collection(db, collectionPath), firestoreData);
      console.log(`✅ ${sessionData.sessionType} session saved to Firebase:`, docRef.id);
      console.log(`📊 Session data:`, {
        type: sessionData.sessionType,
        duration: sessionData.duration,
        rating: sessionData.rating,
        collection: collectionPath
      });
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save session to Firebase:', error);
      console.error('❌ Session data that failed:', sessionData);
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

      // Use correct collection path
      const collectionPath = session.sessionType === 'mind_recovery' ? 'mindRecoverySessions' : 'practiceSessions';
      const sessionDoc = doc(db, collectionPath, session.firestoreId);
      
      // ✅ FIXED: Filter out undefined values in updates too
      const cleanUpdates: any = { updatedAt: serverTimestamp() };
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });
      
      await updateDoc(sessionDoc, cleanUpdates);
      console.log(`✅ Session updated in Firebase (${collectionPath}):`, session.firestoreId);
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

      // Use correct collection path
      const collectionPath = session.sessionType === 'mind_recovery' ? 'mindRecoverySessions' : 'practiceSessions';
      const sessionDoc = doc(db, collectionPath, session.firestoreId);
      
      await deleteDoc(sessionDoc);
      console.log(`✅ Session deleted from Firebase (${collectionPath}):`, session.firestoreId);
    } catch (error) {
      console.error('❌ Failed to delete session from Firebase:', error);
    }
  }, [currentUser?.uid, sessions]);

  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    
    try {
      const allSessions: PracticeSessionData[] = [];

      // Load Mind Recovery Sessions
      try {
        const mindRecoveryQuery = query(
          collection(db, 'mindRecoverySessions'), 
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const mindRecoverySnapshot = await getDocs(mindRecoveryQuery);
        
        mindRecoverySnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const session: PracticeSessionData = {
            sessionId: data.sessionId || generateId('mind_recovery'),
            firestoreId: docSnapshot.id,
            timestamp: data.timestamp || (data.createdAt?.toDate?.()?.toISOString()) || new Date().toISOString(),
            duration: data.duration || 0,
            sessionType: 'mind_recovery',
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
          allSessions.push(session);
        });
        console.log(`📦 Loaded ${mindRecoverySnapshot.size} Mind Recovery sessions`);
      } catch (error) {
        console.error('❌ Error loading Mind Recovery sessions:', error);
      }

      // Load Meditation Sessions
      try {
        const practiceQuery = query(
          collection(db, 'practiceSessions'), 
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const practiceSnapshot = await getDocs(practiceQuery);
        
        practiceSnapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          const session: PracticeSessionData = {
            sessionId: data.sessionId || generateId('practice'),
            firestoreId: docSnapshot.id,
            timestamp: data.timestamp || (data.createdAt?.toDate?.()?.toISOString()) || new Date().toISOString(),
            duration: data.duration || 0,
            sessionType: data.sessionType || 'meditation',
            stageLevel: data.stageLevel,
            stageLabel: data.stageLabel,
            rating: data.rating,
            notes: data.notes,
            presentPercentage: data.presentPercentage,
            environment: data.environment,
            pahmCounts: data.pahmCounts,
            metadata: data.metadata,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          };
          allSessions.push(session);
        });
        console.log(`📦 Loaded ${practiceSnapshot.size} Meditation sessions`);
      } catch (error) {
        console.error('❌ Error loading Meditation sessions:', error);
      }

      // Sort all sessions by creation time
      allSessions.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || new Date(a.timestamp).getTime();
        const timeB = b.createdAt?.toDate?.()?.getTime() || new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      setSessions(allSessions);
      console.log(`📦 Total sessions loaded: ${allSessions.length}`);
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
      console.log(`🔄 Loading practice data for user: ${currentUser.uid.substring(0, 8)}...`);
      loadFromFirebase();
    } else {
      setSessions([]);
    }
  }, [currentUser?.uid, loadFromFirebase]);

  // ================================
  // ENHANCED STATISTICS
  // ================================
  const calculateStats = useCallback((): PracticeStats => {
    const allSessions = sessions;
    const mindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery');
    const meditationSessions = sessions.filter(s => s.sessionType === 'meditation');
    
    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageQuality = totalSessions > 0 ? 
      Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions) * 10) / 10 : 0;
    const averagePresentPercentage = totalSessions > 0 ?
      Math.round(allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / totalSessions) : 0;
    
    // Calculate streaks (simplified for now)
    const sortedSessions = [...allSessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    
    // Mind recovery specific stats
    const totalMindRecoverySessions = mindRecoverySessions.length;
    const totalMindRecoveryMinutes = mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0);
    const averageMindRecoveryRating = totalMindRecoverySessions > 0 ?
      Math.round((mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalMindRecoverySessions) * 10) / 10 : 0;

    // Meditation specific stats
    const totalMeditationSessions = meditationSessions.length;
    const totalMeditationMinutes = meditationSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageMeditationRating = totalMeditationSessions > 0 ?
      Math.round((meditationSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalMeditationSessions) * 10) / 10 : 0;

    return {
      totalSessions,
      totalMinutes,
      averageQuality,
      averagePresentPercentage,
      currentStreak,
      longestStreak,
      totalMindRecoverySessions,
      totalMindRecoveryMinutes,
      averageMindRecoveryRating,
      totalMeditationSessions,
      totalMeditationMinutes,
      averageMeditationRating
    };
  }, [sessions]);

  // ================================
  // SESSION MANAGEMENT WITH ENHANCED LOGGING
  // ================================
  const addPracticeSession = useCallback(async (session: Omit<PracticeSessionData, 'sessionId'>) => {
    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session'),
      timestamp: session.timestamp || new Date().toISOString()
    };
    
    console.log('🔄 Adding practice session:', {
      sessionType: newSession.sessionType,
      duration: newSession.duration,
      stageLevel: newSession.stageLevel,
      mindRecoveryContext: newSession.mindRecoveryContext,
      hasRating: !!newSession.rating,
      hasNotes: !!newSession.notes
    });
    
    // Immediate UI update
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    
    // Save to Firebase with enhanced error handling
    try {
      const firestoreId = await saveSessionToFirebase(newSession);
      if (firestoreId) {
        // Update session with Firestore ID
        const finalSession = { ...newSession, firestoreId };
        setSessions(prev => prev.map(s => s.sessionId === newSession.sessionId ? finalSession : s));
        console.log('✅ Session successfully saved with ID:', firestoreId);
      }
    } catch (error) {
      console.error('❌ Failed to save session to Firebase:', error);
      // Show user-friendly error
      alert('Failed to save session. Please check your connection and try again.');
      // Remove from UI if Firebase save failed
      setSessions(prev => prev.filter(s => s.sessionId !== newSession.sessionId));
      throw error;
    }
    
    // Sync with user profile
    const newStats = calculateStats();
    if (syncProfile) {
      syncProfile();
    }
  }, [sessions, generateId, saveSessionToFirebase, syncProfile, calculateStats]);

  const addMindRecoverySession = useCallback(async (session: Omit<PracticeSessionData, 'sessionId'>) => {
    const mindRecoverySession: Omit<PracticeSessionData, 'sessionId'> = {
      ...session,
      sessionType: 'mind_recovery'
    };
    
    console.log('🧘 Adding Mind Recovery session:', {
      context: mindRecoverySession.mindRecoveryContext,
      purpose: mindRecoverySession.mindRecoveryPurpose,
      duration: mindRecoverySession.duration
    });
    
    await addPracticeSession(mindRecoverySession);
  }, [addPracticeSession]);

  const deletePracticeSession = useCallback(async (sessionId: string) => {
    const session = sessions.find(s => s.sessionId === sessionId);
    console.log('🗑️ Deleting session:', {
      sessionId,
      sessionType: session?.sessionType,
      firestoreId: session?.firestoreId
    });
    
    const updatedSessions = sessions.filter(session => session.sessionId !== sessionId);
    setSessions(updatedSessions);
    
    // Delete from Firebase
    await deleteSessionFromFirebase(sessionId);
    
    // Sync stats
    const newStats = calculateStats();
    if (syncProfile) {
      syncProfile();
    }
  }, [sessions, deleteSessionFromFirebase, calculateStats, syncProfile]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    console.log('📝 Updating session:', { sessionId, updates });
    
    const updatedSessions = sessions.map(session =>
      session.sessionId === sessionId ? { ...session, ...updates } : session
    );
    setSessions(updatedSessions);
    
    // Update in Firebase
    await updateSessionInFirebase(sessionId, updates);
  }, [sessions, updateSessionInFirebase]);

  // ================================
  // DATA RETRIEVAL METHODS
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
  // STAGE PROGRESSION METHODS
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
  // STATISTICS METHODS
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
  // UTILITY METHODS
  // ================================
  const clearPracticeData = useCallback(async () => {
    console.log('🧹 Clearing all practice data...');
    setSessions([]);
    
    // Clear Firebase data from both collections
    if (currentUser?.uid) {
      try {
        const batch = writeBatch(db);
        
        // Clear mind recovery sessions
        const mindRecoveryQuery = query(
          collection(db, 'mindRecoverySessions'),
          where('userId', '==', currentUser.uid)
        );
        const mindRecoverySnapshot = await getDocs(mindRecoveryQuery);
        mindRecoverySnapshot.forEach((docSnapshot) => {
          batch.delete(docSnapshot.ref);
        });
        
        // Clear practice sessions
        const practiceQuery = query(
          collection(db, 'practiceSessions'),
          where('userId', '==', currentUser.uid)
        );
        const practiceSnapshot = await getDocs(practiceQuery);
        practiceSnapshot.forEach((docSnapshot) => {
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
      source: 'firebase_enhanced_no_undefined',
      summary: {
        totalSessions: sessions.length,
        mindRecoverySessions: sessions.filter(s => s.sessionType === 'mind_recovery').length,
        meditationSessions: sessions.filter(s => s.sessionType === 'meditation').length
      }
    };
  }, [sessions, calculateStats]);

  // ================================
  // LEGACY COMPATIBILITY
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
  // CONTEXT VALUE
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
// CUSTOM HOOK
// ================================
export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

export default PracticeContext;