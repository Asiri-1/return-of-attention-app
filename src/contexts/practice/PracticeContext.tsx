// ===============================================
// 🔧 CORRECTED PRACTICE CONTEXT - WITH AUTHENTICATION GUARDS
// ===============================================

// FILE: src/contexts/practice/PracticeContext.tsx
// ✅ FIXED: Authentication guards to prevent Firebase permission errors
// ✅ FIXED: Stage progression based on HOURS, not sessions
// ✅ FIXED: Firebase persistence for stage progression
// ✅ FIXED: Data sanitization to prevent DataCloneError

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
  getDoc,
  setDoc,
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
// 🔧 CRITICAL FIX: Data Sanitization Function
// ================================
const sanitizeForFirebase = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'function') {
    return '[Function]';
  }
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeForFirebase(item));
    }
    
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        try {
          const value = data[key];
          
          // Skip functions and circular references
          if (typeof value === 'function') {
            continue;
          }
          if (value === data) {
            continue;
          }
          
          // Handle specific problematic types
          if (value instanceof Window || value instanceof Document || value instanceof Element) {
            continue;
          }
          
          // Recursively sanitize nested objects
          sanitized[key] = sanitizeForFirebase(value);
        } catch (error) {
          console.warn(`Skipping problematic field ${key}:`, error);
          continue;
        }
      }
    }
    return sanitized;
  }
  
  // Return primitive values as-is
  return data;
};

// ================================
// INTERFACES (Enhanced for all session types + T-LEVEL SUPPORT)
// ================================
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number; // in minutes
  sessionType: 'meditation' | 'mind_recovery';
  
  // Meditation-specific fields
  stageLevel?: number;
  stageLabel?: string;
  tLevel?: string;          // ✅ ADDED: "T1", "T2", etc.
  level?: string;           // ✅ ADDED: "t1", "t2", etc.
  
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
  totalHours: number;
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

interface StageProgressionData {
  currentStage: number;
  totalHours: number;
  lastUpdated: Timestamp;
  stageHistory: {
    [key: string]: {
      completedAt: Timestamp;
      hoursRequired: number;
      hoursCompleted: number;
    };
  };
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
  
  // Stage progression (hours-based, 6 stages)
  getCurrentStage: () => number;
  getStageProgress: (stage: number) => { completed: number; total: number; percentage: number };
  canAdvanceToStage: (stage: number) => boolean;
  getTotalPracticeHours: () => number;
  checkAndAdvanceStage: () => Promise<StageProgressionData>;
  saveStageProgression: (stage: number, hours: number) => Promise<void>;
  loadStageProgression: () => Promise<StageProgressionData | null>;
  
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
// PRACTICE PROVIDER WITH AUTHENTICATION GUARDS
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
  // STAGE PROGRESSION FUNCTIONS (6 STAGES: 5,10,15,20,25,30 HOURS)
  // ================================
  
  const getTotalPracticeHours = useCallback((): number => {
    const meditationSessions = sessions.filter(s => s.sessionType === 'meditation');
    const totalMinutes = meditationSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = totalMinutes / 60;
    
    console.log(`🔍 Total practice calculation: ${meditationSessions.length} sessions, ${totalMinutes} minutes, ${totalHours.toFixed(1)} hours`);
    return totalHours;
  }, [sessions]);

  const getCurrentStage = useCallback((): number => {
    const totalHours = getTotalPracticeHours();
    
    console.log(`🔍 Stage calculation - Total Hours: ${totalHours.toFixed(1)}`);
    
    // 6-stage progression system
    if (totalHours >= 30) return 6;  // 30+ hours for Stage 6
    if (totalHours >= 25) return 5;  // 25+ hours for Stage 5
    if (totalHours >= 20) return 4;  // 20+ hours for Stage 4  
    if (totalHours >= 15) return 3;  // 15+ hours for Stage 3
    if (totalHours >= 10) return 2;  // 10+ hours for Stage 2
    if (totalHours >= 5) return 2;   // 5+ hours advances to Stage 2
    return 1;                        // Less than 5 hours = Stage 1
  }, [getTotalPracticeHours]);

  const getStageProgress = useCallback((stage: number): { completed: number; total: number; percentage: number } => {
    const totalHours = getTotalPracticeHours();
    
    // Hour requirements for 6 stages
    const stageRequirements: { [key: number]: number } = {
      1: 5,    // 5 hours to complete Stage 1
      2: 10,   // 10 hours to complete Stage 2
      3: 15,   // 15 hours to complete Stage 3
      4: 20,   // 20 hours to complete Stage 4
      5: 25,   // 25 hours to complete Stage 5
      6: 30    // 30 hours to complete Stage 6
    };
    
    const required = stageRequirements[stage] || 5;
    const completed = Math.min(totalHours, required);
    const percentage = Math.min(Math.round((completed / required) * 100), 100);
    
    console.log(`🔍 Stage ${stage} progress: ${completed.toFixed(1)}/${required} hours (${percentage}%)`);
    
    return { 
      completed: Math.round(completed * 10) / 10,
      total: required, 
      percentage 
    };
  }, [getTotalPracticeHours]);

  const canAdvanceToStage = useCallback((targetStage: number): boolean => {
    const totalHours = getTotalPracticeHours();
    
    // Hour requirements to UNLOCK each stage (6 stages)
    const unlockRequirements: { [key: number]: number } = {
      1: 0,    // Stage 1 always unlocked
      2: 5,    // Need 5 hours to unlock Stage 2
      3: 10,   // Need 10 hours to unlock Stage 3
      4: 15,   // Need 15 hours to unlock Stage 4
      5: 20,   // Need 20 hours to unlock Stage 5
      6: 25    // Need 25 hours to unlock Stage 6
    };
    
    const requiredHours = unlockRequirements[targetStage] || 0;
    const canAdvance = totalHours >= requiredHours;
    
    console.log(`🔍 Can advance to Stage ${targetStage}? ${totalHours.toFixed(1)}/${requiredHours} hours = ${canAdvance}`);
    
    return canAdvance;
  }, [getTotalPracticeHours]);

  const saveStageProgression = useCallback(async (stage: number, hoursCompleted: number): Promise<void> => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.warn('⚠️ Cannot save stage progression - no authenticated user');
      return;
    }
    
    try {
      const userProgressRef = doc(db, 'userProgress', currentUser.uid);
      
      // Check if document exists
      const docSnap = await getDoc(userProgressRef);
      let existingData: any = {};
      
      if (docSnap.exists()) {
        existingData = docSnap.data();
      }
      
      // 6-stage progression data
      const progressData: StageProgressionData = {
        currentStage: stage,
        totalHours: hoursCompleted,
        lastUpdated: serverTimestamp() as Timestamp,
        stageHistory: {
          ...existingData.stageHistory,
          [`stage${stage}`]: {
            completedAt: serverTimestamp() as Timestamp,
            hoursRequired: [5, 10, 15, 20, 25, 30][stage - 1] || 5,
            hoursCompleted: hoursCompleted
          }
        }
      };
      
      // Sanitize data before saving to Firebase
      const sanitizedData = sanitizeForFirebase(progressData);
      
      await setDoc(userProgressRef, sanitizedData, { merge: true });
      console.log(`✅ Stage progression saved: Stage ${stage}, Hours: ${hoursCompleted.toFixed(1)}`);
    } catch (error) {
      console.error('❌ Failed to save stage progression:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const loadStageProgression = useCallback(async (): Promise<StageProgressionData | null> => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.log('⚠️ Cannot load stage progression - no authenticated user');
      return null;
    }
    
    try {
      const userProgressRef = doc(db, 'userProgress', currentUser.uid);
      const docSnap = await getDoc(userProgressRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as StageProgressionData;
        console.log(`✅ Stage progression loaded: Stage ${data.currentStage}, Hours: ${data.totalHours.toFixed(1)}`);
        return data;
      } else {
        console.log('📭 No saved stage progression found');
        return null;
      }
    } catch (error) {
      console.error('❌ Failed to load stage progression:', error);
      return null;
    }
  }, [currentUser?.uid]);

  const checkAndAdvanceStage = useCallback(async (): Promise<StageProgressionData> => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.warn('⚠️ Cannot check stage advancement - no authenticated user');
      throw new Error('User not authenticated');
    }

    const currentStage = getCurrentStage();
    const totalHours = getTotalPracticeHours();
    
    console.log(`🔍 Checking stage advancement: Current Stage ${currentStage}, Total Hours: ${totalHours.toFixed(1)}`);
    
    // Save current progression to Firebase
    await saveStageProgression(currentStage, totalHours);
    
    const progressionData: StageProgressionData = {
      currentStage,
      totalHours,
      lastUpdated: serverTimestamp() as Timestamp,
      stageHistory: {}
    };
    
    console.log(`📈 Stage progression updated: Stage ${currentStage}, Hours: ${totalHours.toFixed(1)}`);
    
    return progressionData;
  }, [currentUser?.uid, getCurrentStage, getTotalPracticeHours, saveStageProgression]);

  // ================================
  // FIREBASE OPERATIONS WITH AUTHENTICATION GUARDS
  // ================================
  const saveSessionToFirebase = useCallback(async (sessionData: PracticeSessionData) => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.error('❌ No user authenticated for session save');
      throw new Error('User not authenticated');
    }

    try {
      // Sanitize session data before saving
      const rawData: any = {
        sessionId: sessionData.sessionId,
        timestamp: sessionData.timestamp,
        duration: sessionData.duration,
        sessionType: sessionData.sessionType,
        userId: currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Only add defined fields to prevent "undefined" errors
      if (sessionData.stageLevel !== undefined) rawData.stageLevel = sessionData.stageLevel;
      if (sessionData.stageLabel !== undefined) rawData.stageLabel = sessionData.stageLabel;
      if (sessionData.tLevel !== undefined) rawData.tLevel = sessionData.tLevel;
      if (sessionData.level !== undefined) rawData.level = sessionData.level;
      if (sessionData.mindRecoveryContext !== undefined) rawData.mindRecoveryContext = sessionData.mindRecoveryContext;
      if (sessionData.mindRecoveryPurpose !== undefined) rawData.mindRecoveryPurpose = sessionData.mindRecoveryPurpose;
      if (sessionData.rating !== undefined) rawData.rating = sessionData.rating;
      if (sessionData.notes !== undefined) rawData.notes = sessionData.notes;
      if (sessionData.presentPercentage !== undefined) rawData.presentPercentage = sessionData.presentPercentage;
      if (sessionData.environment !== undefined) rawData.environment = sessionData.environment;
      if (sessionData.pahmCounts !== undefined) rawData.pahmCounts = sessionData.pahmCounts;
      if (sessionData.recoveryMetrics !== undefined) rawData.recoveryMetrics = sessionData.recoveryMetrics;
      if (sessionData.metadata !== undefined) rawData.metadata = sessionData.metadata;

      // Sanitize the complete data object
      const firestoreData = sanitizeForFirebase(rawData);

      // Use correct collection paths
      let collectionPath;
      if (sessionData.sessionType === 'mind_recovery') {
        collectionPath = 'mindRecoverySessions';
        console.log('💾 Saving Mind Recovery session to mindRecoverySessions collection');
      } else {
        collectionPath = 'practiceSessions';
        console.log('💾 Saving Meditation session to practiceSessions collection');
      }

      console.log('🔍 Sanitized Firestore data:', firestoreData);

      const docRef = await addDoc(collection(db, collectionPath), firestoreData);
      console.log(`✅ ${sessionData.sessionType} session saved to Firebase:`, docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save session to Firebase:', error);
      console.error('❌ Session data that failed:', sessionData);
      throw error;
    }
  }, [currentUser?.uid]);

  const updateSessionInFirebase = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.warn('⚠️ Cannot update session - no authenticated user');
      return;
    }

    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session?.firestoreId) {
        console.warn('No Firestore ID found for session:', sessionId);
        return;
      }

      const collectionPath = session.sessionType === 'mind_recovery' ? 'mindRecoverySessions' : 'practiceSessions';
      const sessionDoc = doc(db, collectionPath, session.firestoreId);
      
      // Sanitize updates before saving
      const cleanUpdates: any = { updatedAt: serverTimestamp() };
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined) {
          cleanUpdates[key] = value;
        }
      });
      
      const sanitizedUpdates = sanitizeForFirebase(cleanUpdates);
      
      await updateDoc(sessionDoc, sanitizedUpdates);
      console.log(`✅ Session updated in Firebase (${collectionPath}):`, session.firestoreId);
    } catch (error) {
      console.error('❌ Failed to update session in Firebase:', error);
    }
  }, [currentUser?.uid, sessions]);

  const deleteSessionFromFirebase = useCallback(async (sessionId: string) => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.warn('⚠️ Cannot delete session - no authenticated user');
      return;
    }

    try {
      const session = sessions.find(s => s.sessionId === sessionId);
      if (!session?.firestoreId) {
        console.warn('No Firestore ID found for session:', sessionId);
        return;
      }

      const collectionPath = session.sessionType === 'mind_recovery' ? 'mindRecoverySessions' : 'practiceSessions';
      const sessionDoc = doc(db, collectionPath, session.firestoreId);
      
      await deleteDoc(sessionDoc);
      console.log(`✅ Session deleted from Firebase (${collectionPath}):`, session.firestoreId);
    } catch (error) {
      console.error('❌ Failed to delete session from Firebase:', error);
    }
  }, [currentUser?.uid, sessions]);

  // ================================
  // ✅ CRITICAL: REAL-TIME LISTENERS WITH AUTHENTICATION GUARDS
  // ================================
  useEffect(() => {
    // ✅ CRITICAL: Authentication guard - Exit early if no user
    if (!currentUser?.uid) {
      console.log('❌ No authenticated user in PracticeContext - clearing sessions');
      setSessions([]);
      setIsLoading(false);
      return;
    }

    console.log(`🔄 Setting up real-time listeners for authenticated user: ${currentUser.uid.substring(0, 8)}...`);
    setIsLoading(true);

    let unsubscribeAll: (() => void) | null = null;

    try {
      // Real-time listener for Mind Recovery Sessions
      const mindRecoveryQuery = query(
        collection(db, 'mindRecoverySessions'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeMindRecovery = onSnapshot(mindRecoveryQuery, 
        (querySnapshot) => {
          const mindRecoverySessions: PracticeSessionData[] = [];
          querySnapshot.forEach((docSnapshot) => {
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
            mindRecoverySessions.push(session);
          });

          console.log(`🔄 Real-time Mind Recovery sessions update: ${mindRecoverySessions.length} sessions`);

          // Real-time listener for Practice Sessions
          const practiceQuery = query(
            collection(db, 'practiceSessions'),
            where('userId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
          );

          const unsubscribePractice = onSnapshot(practiceQuery, 
            (practiceSnapshot) => {
              const practiceSessions: PracticeSessionData[] = [];
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
                  tLevel: data.tLevel,
                  level: data.level,
                  rating: data.rating,
                  notes: data.notes,
                  presentPercentage: data.presentPercentage,
                  environment: data.environment,
                  pahmCounts: data.pahmCounts,
                  metadata: data.metadata,
                  createdAt: data.createdAt,
                  updatedAt: data.updatedAt
                };
                practiceSessions.push(session);
              });

              console.log(`🔄 Real-time Practice sessions update: ${practiceSessions.length} sessions`);
              console.log(`🔍 T-level sessions found:`, practiceSessions.filter(s => s.tLevel).map(s => ({ 
                tLevel: s.tLevel, 
                level: s.level, 
                stageLabel: s.stageLabel 
              })));

              // Combine and sort all sessions
              const allSessions = [...mindRecoverySessions, ...practiceSessions];
              allSessions.sort((a, b) => {
                const timeA = a.createdAt?.toDate?.()?.getTime() || new Date(a.timestamp).getTime();
                const timeB = b.createdAt?.toDate?.()?.getTime() || new Date(b.timestamp).getTime();
                return timeB - timeA;
              });

              setSessions(allSessions);
              setIsLoading(false);
              console.log(`✅ Real-time sessions update complete: ${allSessions.length} total sessions`);
            }, 
            (error) => {
              console.error('❌ Firebase practice sessions listener error:', error);
              setIsLoading(false);
            }
          );

          unsubscribeAll = () => {
            unsubscribePractice();
          };

          return unsubscribeAll;
        }, 
        (error) => {
          console.error('❌ Firebase mind recovery sessions listener error:', error);
          setIsLoading(false);
        }
      );

      unsubscribeAll = () => {
        unsubscribeMindRecovery();
      };

    } catch (error) {
      console.error('❌ Error setting up Firebase listeners:', error);
      setIsLoading(false);
    }

    return () => {
      if (unsubscribeAll) {
        unsubscribeAll();
      }
    };
  }, [currentUser?.uid, generateId]);

  // ================================
  // STATISTICS AND SESSION MANAGEMENT
  // ================================
  const calculateStats = useCallback((): PracticeStats => {
    const allSessions = sessions;
    const mindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery');
    const meditationSessions = sessions.filter(s => s.sessionType === 'meditation');
    
    const totalSessions = allSessions.length;
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const totalHours = totalMinutes / 60;
    const averageQuality = totalSessions > 0 ? 
      Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions) * 10) / 10 : 0;
    const averagePresentPercentage = totalSessions > 0 ?
      Math.round(allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / totalSessions) : 0;
    
    // Calculate streaks (simplified for now)
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
      totalHours,
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

  const addPracticeSession = useCallback(async (session: Omit<PracticeSessionData, 'sessionId'>) => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.error('❌ Cannot add session - no authenticated user');
      throw new Error('User not authenticated');
    }

    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session'),
      timestamp: session.timestamp || new Date().toISOString()
    };
    
    console.log('🔄 Adding practice session with stage tracking:', {
      sessionType: newSession.sessionType,
      duration: newSession.duration,
      stageLevel: newSession.stageLevel,
      stageLabel: newSession.stageLabel,
      tLevel: newSession.tLevel,
      level: newSession.level,
      mindRecoveryContext: newSession.mindRecoveryContext,
      hasRating: !!newSession.rating,
      hasNotes: !!newSession.notes
    });
    
    // Save to Firebase - real-time listener will update UI
    try {
      const firestoreId = await saveSessionToFirebase(newSession);
      console.log('✅ Session successfully saved with ID:', firestoreId);
      
      // Check and update stage progression after each meditation session
      if (newSession.sessionType === 'meditation') {
        console.log('📈 Checking stage progression after meditation session...');
        setTimeout(async () => {
          try {
            const progression = await checkAndAdvanceStage();
            console.log('📈 Stage progression updated:', progression);
          } catch (error) {
            console.error('❌ Error updating stage progression:', error);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Failed to save session to Firebase:', error);
      alert('Failed to save session. Please check your connection and try again.');
      throw error;
    }
    
    // Sync with user profile
    if (syncProfile) {
      syncProfile();
    }
  }, [currentUser?.uid, generateId, saveSessionToFirebase, syncProfile, checkAndAdvanceStage]);

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
    
    // Delete from Firebase - real-time listener will update UI
    await deleteSessionFromFirebase(sessionId);
    
    // Recalculate stage progression after deletion
    if (session?.sessionType === 'meditation') {
      setTimeout(async () => {
        try {
          const progression = await checkAndAdvanceStage();
          console.log('📈 Stage progression updated after deletion:', progression);
        } catch (error) {
          console.error('❌ Error updating stage progression after deletion:', error);
        }
      }, 1000);
    }
    
    // Sync stats
    if (syncProfile) {
      syncProfile();
    }
  }, [sessions, deleteSessionFromFirebase, syncProfile, checkAndAdvanceStage]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<PracticeSessionData>) => {
    console.log('📝 Updating session:', { sessionId, updates });
    
    // Update in Firebase - real-time listener will update UI
    await updateSessionInFirebase(sessionId, updates);
    
    // Recalculate stage progression if it was a meditation session
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session?.sessionType === 'meditation') {
      setTimeout(async () => {
        try {
          const progression = await checkAndAdvanceStage();
          console.log('📈 Stage progression updated after session update:', progression);
        } catch (error) {
          console.error('❌ Error updating stage progression after update:', error);
        }
      }, 1000);
    }
  }, [updateSessionInFirebase, sessions, checkAndAdvanceStage]);

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
        
        // Clear stage progression data
        const userProgressRef = doc(db, 'userProgress', currentUser.uid);
        batch.delete(userProgressRef);
        
        await batch.commit();
        console.log(`🧹 Practice data cleared in Firebase for user ${currentUser.uid.substring(0, 8)}...`);
        console.log('🔄 Real-time listener will update UI automatically...');
      } catch (error) {
        console.error('❌ Error clearing practice data in Firebase:', error);
      }
    }
  }, [currentUser?.uid]);

  const exportPracticeData = useCallback(() => {
    return {
      sessions: sessions,
      stats: calculateStats(),
      stageProgression: {
        currentStage: getCurrentStage(),
        totalHours: getTotalPracticeHours(),
        canAdvanceToStage2: canAdvanceToStage(2),
        canAdvanceToStage3: canAdvanceToStage(3),
        canAdvanceToStage4: canAdvanceToStage(4),
        canAdvanceToStage5: canAdvanceToStage(5),
        canAdvanceToStage6: canAdvanceToStage(6)
      },
      exportedAt: new Date().toISOString(),
      source: 'firebase_realtime_enhanced_with_tlevels_and_6stage_progression',
      summary: {
        totalSessions: sessions.length,
        mindRecoverySessions: sessions.filter(s => s.sessionType === 'mind_recovery').length,
        meditationSessions: sessions.filter(s => s.sessionType === 'meditation').length,
        tLevelSessions: sessions.filter(s => s.tLevel).length,
        totalHours: getTotalPracticeHours(),
        maxStage: 6
      }
    };
  }, [sessions, calculateStats, getCurrentStage, getTotalPracticeHours, canAdvanceToStage]);

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
    
    // Stage progression (hours-based, 6 stages)
    getCurrentStage,
    getStageProgress,
    canAdvanceToStage,
    getTotalPracticeHours,
    checkAndAdvanceStage,
    saveStageProgression,
    loadStageProgression,
    
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
    getTotalPracticeHours, checkAndAdvanceStage, saveStageProgression, loadStageProgression,
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