// ============================================================================
// 🔧 FIXED PracticeContext.tsx - HYBRID STAGE LOGIC (Sessions + Hours)
// ============================================================================
// FILE: src/contexts/practice/PracticeContext.tsx
// ✅ FIXED: Stage 1 uses SESSION-based progression (T1-T5 need 3 sessions each)
// ✅ FIXED: Stages 2-6 use HOURS-based progression (15 hours each)
// 🔍 ENHANCED: Comprehensive debug logging for stage calculations

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
  where,
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// 🔧 ENHANCED: Data Sanitization Function
// ================================
const sanitizeForFirebase = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === 'function') {
    return null; // Remove functions completely
  }
  
  if (data instanceof Date) {
    return data.toISOString();
  }
  
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      return data.map(item => sanitizeForFirebase(item)).filter(item => item !== null);
    }
    
    const sanitized: any = {};
    for (const key in data) {
      if (data.hasOwnProperty(key) && key !== '__proto__') {
        try {
          const value = data[key];
          
          // Skip functions, circular references, and DOM elements
          if (typeof value === 'function') continue;
          if (value === data) continue;
          if (value instanceof Window || value instanceof Document || value instanceof Element) continue;
          if (value instanceof HTMLElement) continue;
          
          // Handle undefined by skipping the field
          if (value === undefined) continue;
          
          // Recursively sanitize nested objects
          const sanitizedValue = sanitizeForFirebase(value);
          if (sanitizedValue !== null && sanitizedValue !== undefined) {
            sanitized[key] = sanitizedValue;
          }
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
// ENHANCED INTERFACES - Full Compatibility
// ================================
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number; // in minutes
  sessionType: 'meditation' | 'mind_recovery';
  
  // Meditation-specific fields
  stageLevel?: number;
  stageLabel?: string;
  tLevel?: string;          // "T1", "T2", etc.
  level?: string;           // "t1", "t2", etc.
  
  // Mind Recovery-specific fields
  mindRecoveryContext?: string;
  mindRecoveryPurpose?: string;
  practiceType?: string;
  type?: string;
  
  // Session quality and completion
  rating?: number;
  notes?: string;
  presentPercentage?: number;
  completed?: boolean;
  isCompleted?: boolean;
  sessionQuality?: number;
  totalObservations?: number;
  
  // Environment and context
  environment?: {
    posture: string;
    location: string;
    lighting: string;
    sounds: string;
  };
  
  // PAHM data
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
  
  // Recovery metrics and metadata
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
  userId?: string;
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
  addPracticeSession: (session: any) => Promise<void>;
  addMindRecoverySession: (session: any) => Promise<void>;
  deletePracticeSession: (sessionId: string) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<PracticeSessionData>) => Promise<void>;
  
  // Data retrieval
  getPracticeSessions: () => PracticeSessionData[];
  getMindRecoverySessions: () => PracticeSessionData[];
  getMeditationSessions: () => PracticeSessionData[];
  getSessionsByStage: (stage: number) => PracticeSessionData[];
  getSessionsByDateRange: (startDate: Date, endDate: Date) => PracticeSessionData[];
  getRecentSessions: (count: number) => PracticeSessionData[];
  
  // ✅ NEW: T-Level session counting for Stage 1
  getTStageSessionCount: (tLevel: string) => number;
  isStage1CompleteByTSessions: () => boolean;
  
  // ✅ NEW: Stage-specific hours calculation
  getStageSpecificHours: (stage: number) => number;
  
  // Stage progression (hybrid: sessions for Stage 1, hours for Stages 2-6)
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
  clearPracticeData: () => Promise<void>;
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
// PRACTICE PROVIDER WITH HYBRID STAGE LOGIC
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
  // ✅ NEW: T-LEVEL SESSION COUNTING (STAGE 1 LOGIC)
  // ================================
  
  const getTStageSessionCount = useCallback((tLevel: string): number => {
    try {
      const normalizedTLevel = tLevel.toUpperCase(); // Ensure consistent format (T1, T2, etc.)
      const lowerTLevel = tLevel.toLowerCase(); // Also check lowercase (t1, t2, etc.)
      
      const tStageSessions = sessions.filter((s: any) => {
        // Check multiple possible field combinations for T-level identification
        const matchesTLevel = s.tLevel === normalizedTLevel || s.tLevel === lowerTLevel;
        const matchesLevel = s.level === lowerTLevel || s.level === normalizedTLevel;
        const matchesStageLabel = s.stageLabel && (
          s.stageLabel.includes(normalizedTLevel) || 
          s.stageLabel.includes(lowerTLevel)
        );
        
        // Must be a meditation session and completed
        const isMeditation = s.sessionType === 'meditation' || !s.sessionType;
        const isCompleted = s.completed !== false && s.duration > 0;
        
        const isMatch = (matchesTLevel || matchesLevel || matchesStageLabel) && isMeditation && isCompleted;
        
        if (isMatch) {
          console.log(`🎯 Found ${normalizedTLevel} session:`, {
            sessionId: s.sessionId?.substring(0, 8) + '...',
            tLevel: s.tLevel,
            level: s.level, 
            stageLabel: s.stageLabel,
            duration: s.duration,
            completed: s.completed,
            sessionType: s.sessionType
          });
        }
        
        return isMatch;
      });
      
      const count = tStageSessions.length;
      console.log(`🔍 ${normalizedTLevel} session count: ${count}/3`);
      
      return count;
    } catch (error) {
      console.error(`Error counting ${tLevel} sessions:`, error);
      return 0;
    }
  }, [sessions]);

  const isStage1CompleteByTSessions = useCallback((): boolean => {
    try {
      const t1Sessions = getTStageSessionCount('T1');
      const t2Sessions = getTStageSessionCount('T2'); 
      const t3Sessions = getTStageSessionCount('T3');
      const t4Sessions = getTStageSessionCount('T4');
      const t5Sessions = getTStageSessionCount('T5');
      
      const allTStagesComplete = t1Sessions >= 3 && t2Sessions >= 3 && 
                               t3Sessions >= 3 && t4Sessions >= 3 && t5Sessions >= 3;
      
      console.log('🔍 STAGE 1 T-SESSION COMPLETION CHECK:', {
        t1: `${t1Sessions}/3 ${t1Sessions >= 3 ? '✅' : '❌'}`,
        t2: `${t2Sessions}/3 ${t2Sessions >= 3 ? '✅' : '❌'}`,
        t3: `${t3Sessions}/3 ${t3Sessions >= 3 ? '✅' : '❌'}`,
        t4: `${t4Sessions}/3 ${t4Sessions >= 3 ? '✅' : '❌'}`,
        t5: `${t5Sessions}/3 ${t5Sessions >= 3 ? '✅' : '❌'}`,
        totalTSessions: t1Sessions + t2Sessions + t3Sessions + t4Sessions + t5Sessions,
        allComplete: allTStagesComplete,
        result: allTStagesComplete ? 'STAGE 1 COMPLETE - UNLOCK STAGE 2' : 'STAGE 1 INCOMPLETE'
      });
      
      return allTStagesComplete;
    } catch (error) {
      console.error('Error checking Stage 1 T-session completion:', error);
      return false;
    }
  }, [getTStageSessionCount]);

  // ================================
  // ✅ NEW: STAGE-SPECIFIC HOURS CALCULATION
  // ================================
  const getStageSpecificHours = useCallback((stage: number): number => {
    try {
      // ✅ SPECIAL CASE: Stage 1 doesn't use hours (uses T-sessions)
      if (stage === 1) {
        return 0; // Stage 1 is session-based, not hours-based
      }
      
      // Count ONLY sessions for the specific stage
      const stageSessions = sessions.filter((session: any) => {
        // Check if session belongs to this specific stage
        const matchesStageLevel = session.stageLevel === stage;
        const matchesStage = session.stage === stage;
        const matchesStageLabel = session.stageLabel && session.stageLabel.includes(`Stage ${stage}`);
        const isCompleted = session.completed !== false && session.duration > 0;
        const isMeditation = session.sessionType === 'meditation' || !session.sessionType;
        
        return (matchesStageLevel || matchesStage || matchesStageLabel) && isCompleted && isMeditation;
      });
      
      const totalMinutes = stageSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const stageHours = totalMinutes / 60;
      
      console.log(`🔍 Stage ${stage} specific hours: ${stageHours.toFixed(1)} hours from ${stageSessions.length} sessions`);
      
      return stageHours;
    } catch (error) {
      console.error(`Error calculating Stage ${stage} specific hours:`, error);
      return 0;
    }
  }, [sessions]);

  // ================================
  // ✅ FIXED: HYBRID STAGE PROGRESSION (Sessions for Stage 1, Hours for Stages 2-6)
  // ================================
  
  const getTotalPracticeHours = useCallback((): number => {
    try {
      // Count ALL completed sessions (meditation + mind_recovery) for hours
      const completedSessions = sessions.filter(s => {
        // Session is completed if explicitly marked as completed, or if it has a duration > 0
        const isCompleted = s.completed !== false && s.duration > 0;
        return isCompleted;
      });
      
      const totalMinutes = completedSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      const totalHours = totalMinutes / 60;
      
      console.log(`🔍 Total practice calculation: ${completedSessions.length} sessions, ${totalMinutes} minutes, ${totalHours.toFixed(1)} hours`);
      return totalHours;
    } catch (error) {
      console.error('Error calculating total practice hours:', error);
      return 0;
    }
  }, [sessions]);

  const getCurrentStage = useCallback((): number => {
    try {
      // ✅ HYBRID LOGIC: Check Stage 1 completion by T-sessions first
      const stage1Complete = isStage1CompleteByTSessions();
      if (!stage1Complete) {
        console.log('🔍 STAGE CALCULATION: Still on Stage 1 (T-sessions incomplete)');
        return 1; // Still on Stage 1 until all T-sessions are complete
      }
      
      // ✅ FIXED: STAGES 2-6 - Each stage requires 15 hours to advance to NEXT stage
      const stage2Hours = getStageSpecificHours(2);
      const stage3Hours = getStageSpecificHours(3);
      const stage4Hours = getStageSpecificHours(4);
      const stage5Hours = getStageSpecificHours(5);
      const stage6Hours = getStageSpecificHours(6);
      
      console.log(`🔍 STAGE CALCULATION: Stage 1 Complete ✅`);
      console.log(`   Stage 2 Hours: ${stage2Hours.toFixed(1)}/15`);
      console.log(`   Stage 3 Hours: ${stage3Hours.toFixed(1)}/15`);
      console.log(`   Stage 4 Hours: ${stage4Hours.toFixed(1)}/15`);
      console.log(`   Stage 5 Hours: ${stage5Hours.toFixed(1)}/15`);
      console.log(`   Stage 6 Hours: ${stage6Hours.toFixed(1)}/15`);
      
      let currentStage = 2; // Default to Stage 2 once Stage 1 is complete
      
      // Check stage progression: each stage needs 15 hours to advance
      if (stage6Hours >= 15) currentStage = 6;        // Stage 6 complete
      else if (stage5Hours >= 15) currentStage = 6;   // On Stage 6, working toward completion
      else if (stage4Hours >= 15) currentStage = 5;   // On Stage 5, working toward completion  
      else if (stage3Hours >= 15) currentStage = 4;   // On Stage 4, working toward completion
      else if (stage2Hours >= 15) currentStage = 3;   // On Stage 3, working toward completion
      // else currentStage stays 2 (on Stage 2, working toward completion)
      
      console.log(`🎯 CURRENT STAGE: ${currentStage} (Logic: Stage-specific hours per stage)`);
      
      return currentStage;
    } catch (error) {
      console.error('Error calculating current stage:', error);
      return 1;
    }
  }, [isStage1CompleteByTSessions, getStageSpecificHours]);

  const getStageProgress = useCallback((stage: number): { completed: number; total: number; percentage: number } => {
    try {
      // ✅ SPECIAL CASE: Stage 1 uses T-session counts
      if (stage === 1) {
        const t1Sessions = getTStageSessionCount('T1');
        const t2Sessions = getTStageSessionCount('T2'); 
        const t3Sessions = getTStageSessionCount('T3');
        const t4Sessions = getTStageSessionCount('T4');
        const t5Sessions = getTStageSessionCount('T5');
        
        const totalTSessions = t1Sessions + t2Sessions + t3Sessions + t4Sessions + t5Sessions;
        const requiredTSessions = 15; // 3 sessions × 5 T-levels
        const completed = Math.min(totalTSessions, requiredTSessions);
        const percentage = Math.min(Math.round((completed / requiredTSessions) * 100), 100);
        
        console.log(`🔍 Stage 1 progress: ${completed}/${requiredTSessions} T-sessions (${percentage}%)`);
        
        return { 
          completed,
          total: requiredTSessions, 
          percentage 
        };
      }
      
      // ✅ FIXED: STAGES 2-6 - Each requires 15 hours AND uses stage-specific hours
      const stageSpecificHours = getStageSpecificHours(stage);
      const required = 15; // ✅ FIXED: Each stage requires 15 hours
      const completed = Math.min(stageSpecificHours, required);
      const percentage = Math.min(Math.round((completed / required) * 100), 100);
      
      console.log(`🔍 Stage ${stage} progress: ${completed.toFixed(1)}/${required} hours (${percentage}%) - STAGE SPECIFIC`);
      
      return { 
        completed: Math.round(completed * 10) / 10,
        total: required, 
        percentage 
      };
    } catch (error) {
      console.error(`Error getting stage ${stage} progress:`, error);
      return { completed: 0, total: 15, percentage: 0 }; // ✅ FIXED: Default to 15 hours
    }
  }, [getTStageSessionCount, getStageSpecificHours]);

  const canAdvanceToStage = useCallback((targetStage: number): boolean => {
    try {
      console.log(`🔍 CHECKING ACCESS TO STAGE ${targetStage}:`);
      
      // ✅ SPECIAL CASE: Stage 2 unlock based on Stage 1 T-session completion
      if (targetStage === 2) {
        const stage1Complete = isStage1CompleteByTSessions();
        console.log(`   Stage 2 Access: T-Sessions complete = ${stage1Complete}`);
        return stage1Complete;
      }
      
      // ✅ FIXED: STAGES 3-6 - Previous stage needs 15 hours to unlock next stage
      const previousStage = targetStage - 1;
      const previousStageHours = getStageSpecificHours(previousStage);
      const requiredHours = 15; // ✅ FIXED: Each stage needs 15 hours to unlock next
      const canAdvance = previousStageHours >= requiredHours;
      
      console.log(`   Stage ${targetStage} Access: Stage ${previousStage} has ${previousStageHours.toFixed(1)}/${requiredHours} hours = ${canAdvance}`);
      
      return canAdvance;
    } catch (error) {
      console.error(`Error checking advancement to stage ${targetStage}:`, error);
      return targetStage === 1;
    }
  }, [isStage1CompleteByTSessions, getStageSpecificHours]);

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
      
      // ✅ HYBRID: Stage progression data with both session and hour tracking
      const progressData: StageProgressionData = {
        currentStage: stage,
        totalHours: hoursCompleted,
        lastUpdated: serverTimestamp() as Timestamp,
        stageHistory: {
          ...existingData.stageHistory,
          [`stage${stage}`]: {
            completedAt: serverTimestamp() as Timestamp,
            hoursRequired: stage === 1 ? 0 : 15, // ✅ FIXED: 15 hours per stage
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
 }, [currentUser]);

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
        console.log(`✅ Stage progression loaded: Stage ${data.currentStage}, Hours: ${data.totalHours?.toFixed(1) || 0}`);
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
  // 🔥 CRITICAL FIX: ENHANCED FIREBASE OPERATIONS WITH USERID
  // ================================
  const saveSessionToFirebase = useCallback(async (sessionData: any): Promise<string> => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.error('❌ No user authenticated for session save');
      throw new Error('User not authenticated');
    }

    try {
      console.log('💾 Raw session data received:', sessionData);

      // ✅ ENHANCED: Create normalized session data with required fields
      const normalizedData: any = {
        // Core required fields
        sessionId: sessionData.sessionId || generateId('session'),
        timestamp: sessionData.timestamp || new Date().toISOString(),
        duration: Number(sessionData.duration) || 0,
        sessionType: sessionData.sessionType || sessionData.type || 'meditation',
        userId: currentUser.uid, // 🔥 CRITICAL: Always include userId
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Completion status
        completed: sessionData.completed !== false,
        isCompleted: sessionData.isCompleted !== false,
        
        // Quality and rating
        rating: sessionData.rating || sessionData.sessionQuality || 0,
        quality: sessionData.quality || sessionData.rating || 0,
        notes: sessionData.notes || '',
        
        // Meditation-specific fields
        stageLevel: sessionData.stageLevel,
        stageLabel: sessionData.stageLabel,
        tLevel: sessionData.tLevel,
        level: sessionData.level,
        
        // Mind Recovery-specific fields
        mindRecoveryContext: sessionData.mindRecoveryContext,
        mindRecoveryPurpose: sessionData.mindRecoveryPurpose,
        practiceType: sessionData.practiceType,
        
        // Optional fields
        presentPercentage: sessionData.presentPercentage,
        sessionQuality: sessionData.sessionQuality,
        totalObservations: sessionData.totalObservations,
        environment: sessionData.environment,
        pahmCounts: sessionData.pahmCounts,
        recoveryMetrics: sessionData.recoveryMetrics,
        metadata: sessionData.metadata
      };

      // Remove undefined fields
      Object.keys(normalizedData).forEach(key => {
        if (normalizedData[key] === undefined) {
          delete normalizedData[key];
        }
      });

      // Sanitize for Firebase
      const firestoreData = sanitizeForFirebase(normalizedData);

      // Determine collection based on session type
      let collectionPath = 'practiceSessions'; // default
      if (normalizedData.sessionType === 'mind_recovery' || 
          sessionData.mindRecoveryContext || 
          sessionData.practiceType) {
        collectionPath = 'mindRecoverySessions';
      }

      console.log(`💾 Saving to ${collectionPath} with data:`, firestoreData);

      // Save to Firebase
      const docRef = await addDoc(collection(db, collectionPath), firestoreData);
      
      console.log(`✅ Session saved to Firebase (${collectionPath}):`, docRef.id);
      console.log(`📊 SESSION DETAILS - ID: ${docRef.id}, Type: ${normalizedData.sessionType}, Duration: ${normalizedData.duration}min`);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Failed to save session to Firebase:', error);
      console.error('❌ Session data that failed:', sessionData);
      throw error;
    }
  }, [currentUser?.uid, generateId]);

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
  // ✅ FIXED: REAL-TIME LISTENERS WITH orderBy REMOVED
  // ================================
  useEffect(() => {
    console.log('🔍 USEEFFECT TRIGGERED');
    console.log('   Current User:', currentUser);
    console.log('   User UID:', currentUser?.uid);
    console.log('   User Email:', currentUser?.email);
    console.log('   Auth State:', !!currentUser);
    
    // ✅ NEW: Check if auth is still loading
    if (currentUser === undefined) {
      console.log('⏳ Auth still loading, waiting...');
      return;
    }
    
    if (!currentUser?.uid) {
      console.log('❌ No authenticated user in PracticeContext - clearing sessions');
      setSessions([]);
      setIsLoading(false);
      return;
    }

    console.log(`🔄 Setting up real-time listeners for authenticated user: ${currentUser.uid.substring(0, 8)}...`);
    setIsLoading(true);

    const unsubscribers: (() => void)[] = [];
    let mindRecoverySessions: PracticeSessionData[] = [];
    let practiceSessions: PracticeSessionData[] = [];

    // Function to combine and update sessions
    const updateAllSessions = () => {
      const allSessions = [...mindRecoverySessions, ...practiceSessions];
      allSessions.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || new Date(a.timestamp).getTime();
        const timeB = b.createdAt?.toDate?.()?.getTime() || new Date(b.timestamp).getTime();
        return timeB - timeA;
      });

      setSessions(allSessions);
      setIsLoading(false);
      console.log(`✅ Total sessions loaded: ${allSessions.length} (Mind Recovery: ${mindRecoverySessions.length}, Practice: ${practiceSessions.length})`);
    };

    try {
      // 🔥 LISTENER 1: Mind Recovery Sessions - orderBy REMOVED
      const mindRecoveryQuery = query(
        collection(db, 'mindRecoverySessions'),
        where('userId', '==', currentUser.uid)
        // ✅ REMOVED: orderBy('createdAt', 'desc') - No more index required!
      );

      const unsubscribeMindRecovery = onSnapshot(
        mindRecoveryQuery,
        (snapshot) => {
          console.log(`🔥 Mind Recovery Listener: ${snapshot.docs.length} documents found`);
          
          mindRecoverySessions = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            mindRecoverySessions.push({
              sessionId: data.sessionId || doc.id,
              firestoreId: doc.id,
              timestamp: data.timestamp || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              duration: data.duration || 0,
              sessionType: 'mind_recovery',
              userId: data.userId,
              completed: data.completed !== false,
              rating: data.rating || 0,
              notes: data.notes || '',
              mindRecoveryContext: data.mindRecoveryContext,
              mindRecoveryPurpose: data.mindRecoveryPurpose,
              practiceType: data.practiceType,
              presentPercentage: data.presentPercentage,
              environment: data.environment,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });

          console.log(`📦 Mind Recovery sessions loaded: ${mindRecoverySessions.length}`);
          updateAllSessions();
        },
        (error) => {
          console.error('❌ Mind recovery sessions listener error:', error);
          setIsLoading(false);
        }
      );

      // 🔥 LISTENER 2: Practice Sessions - orderBy REMOVED
      const practiceQuery = query(
        collection(db, 'practiceSessions'),
        where('userId', '==', currentUser.uid)
        // ✅ REMOVED: orderBy('createdAt', 'desc') - No more index required!
      );

      const unsubscribePractice = onSnapshot(
        practiceQuery,
        (practiceSnapshot) => {
          console.log(`🔥 Practice Listener: ${practiceSnapshot.docs.length} documents found`);
          console.log('🔍 User queried:', currentUser.uid);
          
          practiceSessions = [];
          practiceSnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📄 Practice session: ${doc.id}`, {
              userId: data.userId,
              tLevel: data.tLevel,
              sessionType: data.sessionType,
              duration: data.duration
            });
            
            practiceSessions.push({
              sessionId: data.sessionId || doc.id,
              firestoreId: doc.id,
              timestamp: data.timestamp || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              duration: data.duration || 0,
              sessionType: data.sessionType || 'meditation',
              userId: data.userId,
              completed: data.completed !== false,
              rating: data.rating || 0,
              notes: data.notes || '',
              stageLevel: data.stageLevel,
              stageLabel: data.stageLabel,
              tLevel: data.tLevel,
              level: data.level,
              presentPercentage: data.presentPercentage,
              environment: data.environment,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            });
          });

          console.log(`📦 Practice sessions loaded: ${practiceSessions.length}`);
          updateAllSessions();
        },
        (error) => {
          console.error('❌ Practice sessions listener error:', error);
          console.error('❌ Error details:', error.code, error.message);
          setIsLoading(false);
        }
      );

      unsubscribers.push(unsubscribeMindRecovery);
      unsubscribers.push(unsubscribePractice);

    } catch (error) {
      console.error('❌ Error setting up Firebase listeners:', error);
      setIsLoading(false);
    }

    return () => {
      unsubscribers.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.error('Error unsubscribing from Firebase listener:', error);
        }
      });
    };
  }, [currentUser]); // ✅ FIXED: Use [currentUser] instead of [currentUser?.uid]

  // ================================
  // STATISTICS AND SESSION MANAGEMENT
  // ================================
  const calculateStats = useCallback((): PracticeStats => {
    try {
      const allSessions = sessions;
      const mindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery');
      const meditationSessions = sessions.filter(s => s.sessionType === 'meditation');
      
      const totalSessions = allSessions.length;
      const totalMinutes = allSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
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
      const totalMindRecoveryMinutes = mindRecoverySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const averageMindRecoveryRating = totalMindRecoverySessions > 0 ?
        Math.round((mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / totalMindRecoverySessions) * 10) / 10 : 0;

      // Meditation specific stats
      const totalMeditationSessions = meditationSessions.length;
      const totalMeditationMinutes = meditationSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
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
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalSessions: 0, totalMinutes: 0, totalHours: 0, averageQuality: 0,
        averagePresentPercentage: 0, currentStreak: 0, longestStreak: 0,
        totalMindRecoverySessions: 0, totalMindRecoveryMinutes: 0, averageMindRecoveryRating: 0,
        totalMeditationSessions: 0, totalMeditationMinutes: 0, averageMeditationRating: 0
      };
    }
  }, [sessions]);

  const addPracticeSession = useCallback(async (session: any) => {
    // ✅ CRITICAL: Authentication guard
    if (!currentUser?.uid) {
      console.error('❌ Cannot add session - no authenticated user');
      throw new Error('User not authenticated');
    }

    console.log('🔄 Adding practice session:', session);
    
    try {
      // Create session with required fields
      const sessionToSave = {
        ...session,
        sessionId: session.sessionId || generateId('session'),
        timestamp: session.timestamp || new Date().toISOString(),
        userId: currentUser.uid,
        completed: session.completed !== false,
        duration: Number(session.duration) || 0,
        sessionType: session.sessionType || 'meditation'
      };
      
      console.log('💾 Saving session to Firebase:', sessionToSave);
      
      // Save to Firebase
      const firestoreId = await saveSessionToFirebase(sessionToSave);
      console.log('✅ Session saved with Firestore ID:', firestoreId);
      
      // Update stage progression if completed
      if (sessionToSave.completed && sessionToSave.duration > 0) {
        setTimeout(async () => {
          try {
            await checkAndAdvanceStage();
          } catch (error) {
            console.error('❌ Error updating stage progression:', error);
          }
        }, 1000);
      }
      
    } catch (error) {
      console.error('❌ Failed to save session:', error);
      throw error;
    }
  }, [currentUser?.uid, generateId, saveSessionToFirebase, checkAndAdvanceStage]);

  const addMindRecoverySession = useCallback(async (session: any) => {
    const mindRecoverySession = {
      ...session,
      sessionType: 'mind_recovery',
      type: 'mind_recovery'
    };
    
    console.log('🧘 Adding Mind Recovery session:', mindRecoverySession);
    
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
    if (session?.sessionType === 'meditation' || session?.completed) {
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
    
    // Recalculate stage progression if relevant fields changed
    const session = sessions.find(s => s.sessionId === sessionId);
    if (session && (updates.duration !== undefined || updates.completed !== undefined)) {
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
  // 🔍 ENHANCED DEBUG: CLEAR PRACTICE DATA WITH COMPREHENSIVE LOGGING
  // ================================
  const clearPracticeData = useCallback(async (): Promise<void> => {
    console.log('🧹 ============================================');
    console.log('🧹 STARTING COMPLETE DATA CLEAR OPERATION');
    console.log('🧹 ============================================');
    
    // ✅ CRITICAL: Authentication guard  
    if (!currentUser?.uid) {
      console.error('❌ CRITICAL ERROR: No authenticated user for clearing');
      console.error('❌ Current user object:', currentUser);
      throw new Error('User not authenticated');
    }

    console.log('🔍 AUTHENTICATION STATUS:');
    console.log('   ✅ User authenticated:', !!currentUser);
    console.log('   🆔 User UID:', currentUser.uid);
    console.log('   📧 User email:', currentUser.email);
    console.log('   🕐 User exists:', !!currentUser);

    try {
      console.log('🔍 FIREBASE CONNECTION STATUS:');
      console.log('   🔥 Database instance:', !!db);
      console.log('   🔧 Firebase config loaded:', !!db.app);

      // ✅ ENHANCED: Create batch with detailed logging
      const batch = writeBatch(db);
      let totalDocsToDelete = 0;

      console.log('🧹 STEP 1: CLEARING MIND RECOVERY SESSIONS');
      console.log('   🔍 Building query for mindRecoverySessions...');
      
      const mindRecoveryQuery = query(
        collection(db, 'mindRecoverySessions'),
        where('userId', '==', currentUser.uid)
      );

      console.log('   📡 Executing mindRecoverySessions query...');
      const mindRecoverySnapshot = await getDocs(mindRecoveryQuery);
      console.log(`   📊 Query result: ${mindRecoverySnapshot.docs.length} mind recovery sessions found`);

      if (mindRecoverySnapshot.docs.length > 0) {
        console.log('   🔍 Mind recovery sessions to delete:');
        mindRecoverySnapshot.docs.forEach((docSnapshot, index) => {
          const data = docSnapshot.data();
          console.log(`      ${index + 1}. Doc ID: ${docSnapshot.id}, UserId: ${data.userId}, Created: ${data.createdAt?.toDate?.()?.toISOString() || 'N/A'}`);
          batch.delete(docSnapshot.ref);
          totalDocsToDelete++;
        });
      } else {
        console.log('   ℹ️ No mind recovery sessions found for this user');
      }

      console.log('🧹 STEP 2: CLEARING PRACTICE SESSIONS');
      console.log('   🔍 Building query for practiceSessions...');
      
      const practiceQuery = query(
        collection(db, 'practiceSessions'),
        where('userId', '==', currentUser.uid)
      );

      console.log('   📡 Executing practiceSessions query...');
      const practiceSnapshot = await getDocs(practiceQuery);
      console.log(`   📊 Query result: ${practiceSnapshot.docs.length} practice sessions found`);

      if (practiceSnapshot.docs.length > 0) {
        console.log('   🔍 Practice sessions to delete:');
        practiceSnapshot.docs.forEach((docSnapshot, index) => {
          const data = docSnapshot.data();
          console.log(`      ${index + 1}. Doc ID: ${docSnapshot.id}, UserId: ${data.userId}, Created: ${data.createdAt?.toDate?.()?.toISOString() || 'N/A'}`);
          batch.delete(docSnapshot.ref);
          totalDocsToDelete++;
        });
      } else {
        console.log('   ℹ️ No practice sessions found for this user');
      }

      console.log('🧹 STEP 3: CLEARING USER PROGRESS');
      const userProgressRef = doc(db, 'userProgress', currentUser.uid);
      console.log(`   🔍 Checking userProgress document: ${currentUser.uid}`);
      
      const userProgressDoc = await getDoc(userProgressRef);
      if (userProgressDoc.exists()) {
        console.log('   ✅ UserProgress document exists, adding to batch delete');
        batch.delete(userProgressRef);
        totalDocsToDelete++;
      } else {
        console.log('   ℹ️ No userProgress document found');
      }

      console.log('🧹 STEP 4: EXECUTING BATCH DELETE');
      console.log(`   📊 Total documents to delete: ${totalDocsToDelete}`);
      
      if (totalDocsToDelete > 0) {
        console.log('   🔥 Executing batch commit...');
        const startTime = Date.now();
        
        await batch.commit();
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('🎉 ============================================');
        console.log('🎉 DATA CLEARING COMPLETED SUCCESSFULLY!');
        console.log('🎉 ============================================');
        console.log(`   ✅ Documents deleted: ${totalDocsToDelete}`);
        console.log(`   ⏱️ Operation duration: ${duration}ms`);
        console.log(`   🆔 User: ${currentUser.uid.substring(0, 8)}...`);
        console.log('   🔄 Real-time listeners will update UI automatically...');
        
        // ✅ ENHANCED: Wait a moment for real-time listeners to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('📊 CLEARING VERIFICATION:');
        console.log('   🔍 Re-checking Firebase collections...');
        
        // Verify clearing worked
        const verifyMindRecovery = await getDocs(mindRecoveryQuery);
        const verifyPractice = await getDocs(practiceQuery);
        
        console.log(`   ✅ Mind recovery sessions remaining: ${verifyMindRecovery.docs.length}`);
        console.log(`   ✅ Practice sessions remaining: ${verifyPractice.docs.length}`);
        
        if (verifyMindRecovery.docs.length === 0 && verifyPractice.docs.length === 0) {
          console.log('   🎯 PERFECT! All user data successfully cleared from Firebase');
        } else {
          console.warn('   ⚠️ Warning: Some documents may still exist after clearing');
        }
        
      } else {
        console.log('   ℹ️ No documents found to delete');
        console.log('🎯 CLEARING COMPLETED - NO DATA TO CLEAR');
      }

    } catch (error: any) {
      console.error('🚨 ============================================');
      console.error('🚨 CRITICAL ERROR DURING DATA CLEARING');
      console.error('🚨 ============================================');
      console.error('❌ Error object:', error);
      console.error('❌ Error name:', error?.name);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error stack:', error?.stack);
      
      if (error?.code) {
        console.error('🔍 FIREBASE ERROR DETAILS:');
        console.error('   📋 Error code:', error.code);
        console.error('   📝 Error message:', error.message);
        
        switch (error.code) {
          case 'permission-denied':
            console.error('   🚫 Permission denied - check Firestore security rules');
            break;
          case 'unauthenticated':
            console.error('   🔐 User not authenticated properly');
            break;
          case 'unavailable':
            console.error('   🌐 Firebase service unavailable');
            break;
          default:
            console.error('   ❓ Unknown Firebase error');
        }
      }
      
      throw error;
    }
  }, [currentUser?.uid]);

  const exportPracticeData = useCallback(() => {
    return {
      sessions: sessions,
      stats: calculateStats(),
      stageProgression: {
        currentStage: getCurrentStage(),
        totalHours: getTotalPracticeHours(),
        stage1CompleteByTSessions: isStage1CompleteByTSessions(),
        canAdvanceToStage2: canAdvanceToStage(2),
        canAdvanceToStage3: canAdvanceToStage(3),
        canAdvanceToStage4: canAdvanceToStage(4),
        canAdvanceToStage5: canAdvanceToStage(5),
        canAdvanceToStage6: canAdvanceToStage(6),
        tSessionCounts: {
          t1: getTStageSessionCount('T1'),
          t2: getTStageSessionCount('T2'),
          t3: getTStageSessionCount('T3'),
          t4: getTStageSessionCount('T4'),
          t5: getTStageSessionCount('T5')
        },
        stageSpecificHours: {
          stage2: getStageSpecificHours(2),
          stage3: getStageSpecificHours(3),
          stage4: getStageSpecificHours(4),
          stage5: getStageSpecificHours(5),
          stage6: getStageSpecificHours(6)
        }
      },
      exportedAt: new Date().toISOString(),
      source: 'firebase_hybrid_stage_logic_v3_corrected',
      summary: {
        totalSessions: sessions.length,
        mindRecoverySessions: sessions.filter(s => s.sessionType === 'mind_recovery').length,
        meditationSessions: sessions.filter(s => s.sessionType === 'meditation').length,
        tLevelSessions: sessions.filter(s => s.tLevel).length,
        totalHours: getTotalPracticeHours(),
        maxStage: 6,
        stage1Logic: 'T-Session Based (3 sessions per T1-T5)',
        stages2to6Logic: 'Hours Based (15 hours each stage - CORRECTED)'
      }
    };
  }, [sessions, calculateStats, getCurrentStage, getTotalPracticeHours, canAdvanceToStage, isStage1CompleteByTSessions, getTStageSessionCount, getStageSpecificHours]);

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
    
    // ✅ NEW: T-Level session counting for Stage 1
    getTStageSessionCount,
    isStage1CompleteByTSessions,
    
    // ✅ NEW: Stage-specific hours calculation
    getStageSpecificHours,
    
    // Stage progression (hybrid: sessions for Stage 1, hours for Stages 2-6)
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
    getTStageSessionCount, isStage1CompleteByTSessions, getStageSpecificHours,
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