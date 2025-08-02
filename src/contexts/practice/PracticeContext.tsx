// src/contexts/practice/PracticeContext.tsx
// ✅ ENHANCED: Firebase/Firestore integration while maintaining all existing functionality
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext'
import { useUser } from '../user/UserContext';

// ✅ FIREBASE IMPORTS
import { 
  getFirestore, 
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
  Timestamp 
} from 'firebase/firestore';

// ================================
// PRACTICE SESSION INTERFACES
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
// PRACTICE PROVIDER IMPLEMENTATION
// ================================
export const PracticeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData } = useAuth();
  const { syncProfile } = useUser();
  const [sessions, setSessions] = useState<PracticeSessionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIREBASE SETUP
  const db = getFirestore();

  // ================================
  // STORAGE UTILITIES
  // ================================
  const getStorageKey = useCallback((): string => {
    return currentUser?.uid ? `practiceSessions_${currentUser.uid}` : 'practiceSessions';
  }, [currentUser?.uid]);

  const generateId = useCallback((prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // ✅ FIREBASE COLLECTION REFERENCE
  const getSessionsCollection = useCallback(() => {
    if (!currentUser?.uid) return null;
    return collection(db, 'users', currentUser.uid, 'practiceSessions');
  }, [db, currentUser?.uid]);

  // ================================
  // ✅ ENHANCED: FIREBASE + LOCALSTORAGE HYBRID STORAGE
  // ================================
  const saveToFirestore = useCallback(async (sessionData: PracticeSessionData) => {
    if (!currentUser?.uid) {
      console.warn('No authenticated user - skipping Firestore save');
      return null;
    }

    try {
      const sessionsCollection = getSessionsCollection();
      if (!sessionsCollection) return null;

      // Create clean data for Firestore (without local-only fields)
      const firestoreData = {
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: currentUser.uid
      };

      const docRef = await addDoc(sessionsCollection, firestoreData);
      console.log('✅ Practice session saved to Firestore:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save to Firestore:', error);
      return null;
    }
  }, [currentUser?.uid, getSessionsCollection]);

  const updateInFirestore = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    if (!currentUser?.uid) return;

    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session?.firestoreId) {
        console.warn('No Firestore ID found for session:', sessionId);
        return;
      }

      const sessionDoc = doc(db, 'users', currentUser.uid, 'practiceSessions', session.firestoreId);
      await updateDoc(sessionDoc, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Practice session updated in Firestore:', session.firestoreId);
    } catch (error) {
      console.error('❌ Failed to update in Firestore:', error);
    }
  }, [currentUser?.uid, sessions, db]);

  const deleteFromFirestore = useCallback(async (sessionId: string) => {
    if (!currentUser?.uid) return;

    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session?.firestoreId) {
        console.warn('No Firestore ID found for session:', sessionId);
        return;
      }

      const sessionDoc = doc(db, 'users', currentUser.uid, 'practiceSessions', session.firestoreId);
      await deleteDoc(sessionDoc);
      console.log('✅ Practice session deleted from Firestore:', session.firestoreId);
    } catch (error) {
      console.error('❌ Failed to delete from Firestore:', error);
    }
  }, [currentUser?.uid, sessions, db]);

  const saveToStorage = useCallback((sessionData: PracticeSessionData[]) => {
    try {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(sessionData));
      
      // Legacy compatibility
      if (currentUser) {
        localStorage.setItem('practiceHistory', JSON.stringify(sessionData));
        localStorage.setItem('practice_sessions', JSON.stringify(sessionData));
        
        const mindRecoverySessions = sessionData.filter(s => s.sessionType === 'mind_recovery');
        localStorage.setItem('mindRecoveryHistory', JSON.stringify(mindRecoverySessions));
      }
      
      console.log(`💾 Saved ${sessionData.length} sessions to localStorage`);
    } catch (error) {
      console.warn('Failed to save practice data to localStorage:', error);
    }
  }, [getStorageKey, currentUser]);

  // ================================
  // ✅ ENHANCED: LOAD FROM FIREBASE + LOCALSTORAGE
  // ================================
  const loadFromFirestore = useCallback(async () => {
    if (!currentUser?.uid) return [];

    try {
      const sessionsCollection = getSessionsCollection();
      if (!sessionsCollection) return [];

      const q = query(sessionsCollection, orderBy('createdAt', 'desc'));
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

      console.log(`✅ Loaded ${firestoreSessions.length} sessions from Firestore`);
      return firestoreSessions;
    } catch (error) {
      console.error('❌ Failed to load from Firestore:', error);
      return [];
    }
  }, [currentUser?.uid, getSessionsCollection, generateId]);

  const loadFromStorage = useCallback(async () => {
    setIsLoading(true);
    
    try {
      let loadedSessions: PracticeSessionData[] = [];

      // ✅ PRIORITY 1: Try to load from Firestore (if authenticated)
      if (currentUser?.uid) {
        loadedSessions = await loadFromFirestore();
      }

      // ✅ PRIORITY 2: If no Firestore data, try localStorage
      if (loadedSessions.length === 0) {
        const storageKey = getStorageKey();
        const sessionData = localStorage.getItem(storageKey);
        
        if (sessionData) {
          const parsedSessions = JSON.parse(sessionData);
          loadedSessions = parsedSessions;
          console.log(`📦 Loaded ${loadedSessions.length} sessions from localStorage`);
        } else {
          // Try legacy storage
          const legacyData = localStorage.getItem('practiceHistory') || localStorage.getItem('practice_sessions');
          if (legacyData) {
            const legacySessions = JSON.parse(legacyData);
            loadedSessions = legacySessions;
            console.log(`📦 Loaded ${loadedSessions.length} sessions from legacy storage`);
          }
        }

        // ✅ MIGRATION: If we have localStorage data but user is authenticated, migrate to Firestore
        if (loadedSessions.length > 0 && currentUser?.uid) {
          console.log('🔄 Migrating localStorage sessions to Firestore...');
          for (const session of loadedSessions) {
            try {
              const firestoreId = await saveToFirestore(session);
              if (firestoreId) {
                session.firestoreId = firestoreId;
              }
            } catch (error) {
              console.warn('Failed to migrate session to Firestore:', error);
            }
          }
          console.log('✅ Migration to Firestore completed');
        }
      }

      setSessions(loadedSessions);
      
      // ✅ ALWAYS UPDATE LOCALSTORAGE (for offline access)
      if (loadedSessions.length > 0) {
        saveToStorage(loadedSessions);
      }

    } catch (error) {
      console.warn('Failed to load practice data:', error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, getStorageKey, loadFromFirestore, saveToFirestore, saveToStorage]);

  // ================================
  // CALCULATE STATISTICS (Unchanged)
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
  // ✅ ENHANCED: SESSION MANAGEMENT WITH FIREBASE
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
    saveToStorage(updatedSessions);
    
    // ✅ SAVE TO FIRESTORE (async, non-blocking)
    try {
      const firestoreId = await saveToFirestore(newSession);
      if (firestoreId) {
        // Update session with Firestore ID
        const finalSession = { ...newSession, firestoreId };
        setSessions(prev => prev.map(s => s.sessionId === newSession.sessionId ? finalSession : s));
        saveToStorage([...sessions.filter(s => s.sessionId !== newSession.sessionId), finalSession]);
      }
    } catch (error) {
      console.error('Failed to save session to Firestore:', error);
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
    
    syncProfile(newStats);
    
    if (currentUser && syncWithLocalData) {
      setTimeout(() => syncWithLocalData(), 200);
    }
  }, [sessions, generateId, saveToStorage, saveToFirestore, syncProfile, currentUser, syncWithLocalData]);

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
    saveToStorage(updatedSessions);
    
    // ✅ DELETE FROM FIRESTORE
    await deleteFromFirestore(sessionId);
    
    // ✅ SYNC STATS
    const newStats = calculateStats();
    syncProfile(newStats);
  }, [sessions, saveToStorage, deleteFromFirestore, calculateStats, syncProfile]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    const updatedSessions = sessions.map(session =>
      session.sessionId === sessionId ? { ...session, ...updates } : session
    );
    setSessions(updatedSessions);
    saveToStorage(updatedSessions);
    
    // ✅ UPDATE IN FIRESTORE
    await updateInFirestore(sessionId, updates);
  }, [sessions, saveToStorage, updateInFirestore]);

  // ================================
  // DATA RETRIEVAL METHODS (Unchanged)
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
  // STAGE PROGRESSION METHODS (Unchanged)
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
  // STATISTICS METHODS (Unchanged)
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
  // UTILITY METHODS (Enhanced)
  // ================================
  const clearPracticeData = useCallback(() => {
    setSessions([]);
    
    try {
      const storageKey = getStorageKey();
      localStorage.removeItem(storageKey);
      localStorage.removeItem('practiceHistory');
      localStorage.removeItem('mindRecoveryHistory');
      localStorage.removeItem('practice_sessions');
    } catch (error) {
      console.warn('Failed to clear practice data:', error);
    }
    
    saveToStorage([]);
  }, [getStorageKey, saveToStorage]);

  const exportPracticeData = useCallback(() => {
    return {
      sessions: sessions,
      stats: calculateStats(),
      exportedAt: new Date().toISOString(),
      source: 'firebase_enhanced'
    };
  }, [sessions, calculateStats]);

  // ================================
  // LEGACY COMPATIBILITY (Unchanged)
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
  // ✅ ENHANCED: EFFECTS WITH FIREBASE INTEGRATION
  // ================================
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // ✅ REAL-TIME FIRESTORE LISTENER
  useEffect(() => {
    if (!currentUser?.uid) return;

    const sessionsCollection = getSessionsCollection();
    if (!sessionsCollection) return;

    const q = query(sessionsCollection, orderBy('createdAt', 'desc'));
    
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
      saveToStorage(firestoreSessions); // Keep localStorage in sync
      console.log(`🔄 Real-time update: ${firestoreSessions.length} sessions`);
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });

    return () => unsubscribe();
  }, [currentUser?.uid, getSessionsCollection, generateId, saveToStorage]);

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