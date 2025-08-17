// ✅ COMPLETE BACKWARD-COMPATIBLE UserContext with PracticeContext Integration
// File: src/contexts/user/UserContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

// ✅ CRITICAL: Import PracticeContext for session data (handled via reference)
// We'll use a forward reference pattern to avoid circular dependencies

// ================================
// 🔧 CRITICAL FIX: Data Sanitization Function for UserContext
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

// ✅ BACKWARD COMPATIBLE: Full interfaces maintained
interface SessionCounts {
  t1Sessions: number;
  t2Sessions: number;
  t3Sessions: number;
  t4Sessions: number;
  t5Sessions: number;
  stage1TotalSessions: number;
  stage2TotalSessions: number;
  stage3TotalSessions: number;
  stage4TotalSessions: number;
  stage5TotalSessions: number;
  stage6TotalSessions: number;
  [key: string]: number;
}

interface StageHours {
  stage1Hours: number;
  stage2Hours: number;
  stage3Hours: number;
  stage4Hours: number;
  stage5Hours: number;
  stage6Hours: number;
  totalPracticeHours: number;
  [key: string]: number;
}

interface StageCompletionStatus {
  stage1Complete: boolean;
  stage2Complete: boolean;
  stage3Complete: boolean;
  stage4Complete: boolean;
  stage5Complete: boolean;
  stage6Complete: boolean;
  [key: string]: boolean;
}

interface LastSessions {
  lastT1Session?: string;
  lastT2Session?: string;
  lastT3Session?: string;
  lastT4Session?: string;
  lastT5Session?: string;
  lastStage2Session?: string;
  lastStage3Session?: string;
  lastStage4Session?: string;
  lastStage5Session?: string;
  lastStage6Session?: string;
  [key: string]: string | undefined;
}

interface StageProgression {
  currentStage: number;
  totalHours?: number;
  completedStages: number[];
  stageHours: { [key: string]: number };
  stageCompletionFlags: { [key: string]: boolean };
  completedStageIntros: string[];
  t5Completed?: boolean;
  devCurrentStage?: string;
  hasSeenTLevelIntro?: boolean;
  hourRequirements?: {
    stage1?: number;
    stage2?: number;
    stage3?: number;
    stage4?: number;
    stage5?: number;
    stage6?: number;
    [key: string]: number | undefined;
  };
}

interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  totalSessions: number;
  totalMinutes: number;
  totalHours?: number;
  currentStreak: number;
  longestStreak: number;
  averageQuality: number;
  averagePresentPercentage: number;
  totalMindRecoverySessions?: number;
  totalMindRecoveryMinutes?: number;
  averageMindRecoveryRating?: number;

  stageProgress?: StageProgression;
  sessionCounts?: SessionCounts;
  stageHours?: StageHours;
  stageCompletionStatus?: StageCompletionStatus;
  lastSessions?: LastSessions;

  currentProgress?: {
    currentStage: number;
    currentTLevel?: string;
    totalSessions?: number;
    totalMinutes?: number;
    totalHours?: number;
    longestStreak?: number;
    currentStreak?: number;
    averageQuality?: number;
    averagePresentPercentage?: number;
  };

  preferences?: {
    defaultSessionDuration: number;
    reminderEnabled: boolean;
    favoriteStages: number[];
    optimalPracticeTime: string;
    notifications: {
      dailyReminder: boolean;
      streakReminder: boolean;
      weeklyProgress: boolean;
    };
  };

  firestoreId?: string;
  createdAt?: string;
  updatedAt?: string;
  happiness_points?: number;
  achievements?: string[];
}

interface UserContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  achievements: string[];
  
  // Core profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
  updateProgress: (progress: Partial<UserProfile['currentProgress']>) => Promise<void>;
  updateStageProgress: (stageProgress: Partial<StageProgression>) => Promise<void>;
  markStageComplete: (stage: number) => Promise<void>;
  setT5Completed: (completed: boolean) => Promise<void>;
  
  addStageHours: (stage: number, hours: number) => Promise<void>;
  markStageIntroComplete: (stage: string) => Promise<void>;
  syncProfile: () => Promise<void>;
  
  // ✅ KEPT: Hours-based stage progression methods
  getTotalPracticeHours: () => number;
  getCurrentStageByHours: () => number;
  getStageProgressByHours: (stage: number) => { completed: number; total: number; percentage: number };
  canAdvanceToStageByHours: (stage: number) => boolean;
  updateTotalPracticeHours: (hours: number) => Promise<void>;
  
  // Happiness & achievements
  updateHappinessPoints: (points: number) => Promise<void>;
  addHappinessPoints: (points: number) => Promise<void>;
  addAchievement: (achievement: string) => Promise<void>;
  getAchievements: () => string[];
  hasAchievement: (achievement: string) => boolean;
  
  // ✅ KEPT: T-Level Session Tracking (now reads from PracticeContext)
  getT1Sessions: () => number;
  getT2Sessions: () => number;
  getT3Sessions: () => number;
  getT4Sessions: () => number;
  getT5Sessions: () => number;
  incrementT1Sessions: () => Promise<number>;
  incrementT2Sessions: () => Promise<number>;
  incrementT3Sessions: () => Promise<number>;
  incrementT4Sessions: () => Promise<number>;
  incrementT5Sessions: () => Promise<number>;
  isT1Complete: () => boolean;
  isT2Complete: () => boolean;
  isT3Complete: () => boolean;
  isT4Complete: () => boolean;
  isT5Complete: () => boolean;
  
  // ✅ KEPT: Stage Session Tracking
  getStage2Sessions: () => number;
  getStage3Sessions: () => number;
  getStage4Sessions: () => number;
  getStage5Sessions: () => number;
  getStage6Sessions: () => number;
  incrementStage2Sessions: () => Promise<number>;
  incrementStage3Sessions: () => Promise<number>;
  incrementStage4Sessions: () => Promise<number>;
  incrementStage5Sessions: () => Promise<number>;
  incrementStage6Sessions: () => Promise<number>;
  
  // ✅ KEPT: Hours Tracking
  getStage1Hours: () => number;
  getStage2Hours: () => number;
  getStage3Hours: () => number;
  getStage4Hours: () => number;
  getStage5Hours: () => number;
  getStage6Hours: () => number;
  addStageHoursDirect: (stageNumber: number, hours: number) => Promise<number>;
  
  // ✅ KEPT: Completion Status
  isStage1CompleteByHours: () => boolean;
  isStage2CompleteByHours: () => boolean;
  isStage3CompleteByHours: () => boolean;
  isStage4CompleteByHours: () => boolean;
  isStage5CompleteByHours: () => boolean;
  isStage6CompleteByHours: () => boolean;
  
  // ✅ KEPT: Progress Tracking
  getStageProgressPercentage: (stageNumber: number) => number;
  getTotalStage1Sessions: () => number;
  
  // ✅ ADDED: Missing methods that other components expect
  isStage1Complete: () => boolean;
  
  // Utility methods
  clearUserData: () => Promise<void>;
  exportUserData: () => UserProfile | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// ✅ CRITICAL: Forward reference for PracticeContext to avoid circular dependency
let practiceContextRef: any = null;

// ✅ Method to set PracticeContext reference
export const setPracticeContextReference = (practiceContext: any) => {
  practiceContextRef = practiceContext;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<string[]>([]);

  // ✅ Get PracticeContext sessions for T-level counting
  const getPracticeContextSessions = useCallback(() => {
    if (practiceContextRef && practiceContextRef.sessions) {
      return practiceContextRef.sessions;
    }
    return [];
  }, []);

  // ✅ KEPT: Create default profile with all fields
  const createDefaultProfile = useCallback((): UserProfile => {
    return {
      userId: currentUser?.uid || 'guest',
      displayName: currentUser?.displayName || 'User',
      email: currentUser?.email || '',
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      averageQuality: 0,
      averagePresentPercentage: 0,
      totalMindRecoverySessions: 0,
      totalMindRecoveryMinutes: 0,
      averageMindRecoveryRating: 0,

      stageProgress: {
        currentStage: 1,
        devCurrentStage: 'stage1',
        completedStages: [],
        stageHours: {},
        stageCompletionFlags: {},
        completedStageIntros: [],
        t5Completed: false,
        hasSeenTLevelIntro: false,
        totalHours: 0,
        hourRequirements: {
          stage1: 5,
          stage2: 10,
          stage3: 15,
          stage4: 20,
          stage5: 25,
          stage6: 30
        }
      },

      sessionCounts: {
        t1Sessions: 0,
        t2Sessions: 0,
        t3Sessions: 0,
        t4Sessions: 0,
        t5Sessions: 0,
        stage1TotalSessions: 0,
        stage2TotalSessions: 0,
        stage3TotalSessions: 0,
        stage4TotalSessions: 0,
        stage5TotalSessions: 0,
        stage6TotalSessions: 0,
      },
      
      stageHours: {
        stage1Hours: 0,
        stage2Hours: 0,
        stage3Hours: 0,
        stage4Hours: 0,
        stage5Hours: 0,
        stage6Hours: 0,
        totalPracticeHours: 0,
      },
      
      stageCompletionStatus: {
        stage1Complete: false,
        stage2Complete: false,
        stage3Complete: false,
        stage4Complete: false,
        stage5Complete: false,
        stage6Complete: false,
      },
      
      lastSessions: {},

      currentProgress: {
        currentStage: 1,
        currentTLevel: "Beginner",
        totalSessions: 0,
        totalMinutes: 0,
        longestStreak: 0,
        currentStreak: 0,
        averageQuality: 0,
        averagePresentPercentage: 0,
        totalHours: 0
      },

      preferences: {
        defaultSessionDuration: 20,
        reminderEnabled: true,
        favoriteStages: [1, 2],
        optimalPracticeTime: "morning",
        notifications: {
          dailyReminder: true,
          streakReminder: true,
          weeklyProgress: true
        }
      },

      happiness_points: 0,
      achievements: ['journey_started'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalHours: 0
    };
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // ✅ CRITICAL: Firebase save with AUTHENTICATION GUARD and DATA SANITIZATION
  const saveToFirebase = useCallback(async (profile: UserProfile) => {
    if (!currentUser?.uid) {
      console.warn('⚠️ Cannot save to Firebase: No authenticated user');
      return;
    }

    try {
      const stageHours = profile.stageHours || {} as StageHours;
      const totalPracticeHours = Object.keys(stageHours)
        .filter(key => key.startsWith('stage') && key.endsWith('Hours') && key !== 'totalPracticeHours')
        .reduce((sum, key) => sum + (stageHours[key] || 0), 0);

      const cleanProfile = {
        ...profile,
        userId: currentUser.uid,
        
        sessionCounts: {
          t1Sessions: 0,
          t2Sessions: 0,
          t3Sessions: 0,
          t4Sessions: 0,
          t5Sessions: 0,
          stage1TotalSessions: 0,
          stage2TotalSessions: 0,
          stage3TotalSessions: 0,
          stage4TotalSessions: 0,
          stage5TotalSessions: 0,
          stage6TotalSessions: 0,
          ...(profile.sessionCounts || {})
        },
        
        stageHours: {
          stage1Hours: 0,
          stage2Hours: 0,
          stage3Hours: 0,
          stage4Hours: 0,
          stage5Hours: 0,
          stage6Hours: 0,
          totalPracticeHours,
          ...(profile.stageHours || {})
        },
        
        stageCompletionStatus: {
          stage1Complete: false,
          stage2Complete: false,
          stage3Complete: false,
          stage4Complete: false,
          stage5Complete: false,
          stage6Complete: false,
          ...(profile.stageCompletionStatus || {})
        },
        
        stageProgress: {
          currentStage: 1,
          devCurrentStage: 'stage1',
          completedStages: [],
          stageHours: {},
          stageCompletionFlags: {},
          completedStageIntros: [],
          t5Completed: false,
          hasSeenTLevelIntro: false,
          ...profile.stageProgress,
          totalHours: totalPracticeHours,
          hourRequirements: {
            stage1: 5,
            stage2: 10,
            stage3: 15,
            stage4: 20,
            stage5: 25,
            stage6: 30
          }
        },
        
        currentProgress: {
          currentStage: 1,
          currentTLevel: "Beginner",
          totalSessions: 0,
          totalMinutes: 0,
          longestStreak: 0,
          currentStreak: 0,
          averageQuality: 0,
          averagePresentPercentage: 0,
          ...profile.currentProgress,
          totalHours: totalPracticeHours
        },
        
        lastSessions: profile.lastSessions || {},
        updatedAt: new Date().toISOString(),
        totalHours: totalPracticeHours
      };

      const sanitizedProfile = sanitizeForFirebase(cleanProfile);
      
      await setDoc(doc(db, 'users', currentUser.uid), sanitizedProfile, { merge: true });
      console.log(`✅ User profile saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save user profile to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  // ✅ CRITICAL: Real-time listener with AUTHENTICATION GUARD
  useEffect(() => {
    // ✅ CRITICAL: Authentication guard - Exit early if no user
    if (!currentUser?.uid) {
      console.log('❌ No authenticated user in UserContext - clearing profile');
      setUserProfile(null);
      setAchievements([]);
      setIsLoading(false);
      return;
    }

    console.log(`🔄 Setting up real-time user profile listener for user: ${currentUser.uid.substring(0, 8)}...`);
    setIsLoading(true);

    const userDocRef = doc(db, 'users', currentUser.uid);

    const unsubscribe = onSnapshot(userDocRef, 
      (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const data = docSnapshot.data() as UserProfile;
            
            const migratedProfile: UserProfile = {
              ...data,
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
              
              stageProgress: {
                currentStage: 1,
                completedStageIntros: [],
                devCurrentStage: 'stage1',
                hasSeenTLevelIntro: false,
                completedStages: [],
                stageHours: {},
                stageCompletionFlags: {},
                t5Completed: false,
                totalHours: 0,
                ...data.stageProgress
              } as StageProgression,
              
              preferences: {
                defaultSessionDuration: 20,
                reminderEnabled: true,
                favoriteStages: [1, 2],
                optimalPracticeTime: "morning",
                notifications: {
                  dailyReminder: true,
                  streakReminder: true,
                  weeklyProgress: true
                },
                ...data.preferences
              }
            };
            
            setUserProfile(migratedProfile);
            setAchievements(migratedProfile.achievements || ['journey_started']);
            setIsLoading(false);
            
            console.log(`🔄 Real-time user profile update for user ${currentUser.uid.substring(0, 8)}...`);
            
          } else {
            console.log(`🆕 Creating new profile for user ${currentUser.uid.substring(0, 8)}...`);
            const defaultProfile = createDefaultProfile();
            saveToFirebase(defaultProfile);
            setUserProfile(defaultProfile);
            setAchievements(defaultProfile.achievements || ['journey_started']);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('❌ Error processing user profile update:', error);
          setIsLoading(false);
        }
      }, 
      (error) => {
        console.error('❌ Firebase user profile listener error:', error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, createDefaultProfile, saveToFirebase]);

  // ✅ AUDIT COMPLIANT: T-Level methods using PracticeContext data
  const getT1Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T1' || s.level === 't1') && s.completed && s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT2Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T2' || s.level === 't2') && s.completed && s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT3Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T3' || s.level === 't3') && s.completed && s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT4Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T4' || s.level === 't4') && s.completed && s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT5Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T5' || s.level === 't5') && s.completed && s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  // ✅ AUDIT COMPLIANT: T-level completion checking (3 sessions each)
  const isT1Complete = useCallback((): boolean => {
    return getT1Sessions() >= 3;
  }, [getT1Sessions]);

  const isT2Complete = useCallback((): boolean => {
    return getT2Sessions() >= 3;
  }, [getT2Sessions]);

  const isT3Complete = useCallback((): boolean => {
    return getT3Sessions() >= 3;
  }, [getT3Sessions]);

  const isT4Complete = useCallback((): boolean => {
    return getT4Sessions() >= 3;
  }, [getT4Sessions]);

  const isT5Complete = useCallback((): boolean => {
    return getT5Sessions() >= 3;
  }, [getT5Sessions]);

  // ✅ KEPT: Increment methods (for backward compatibility, but these log that they should use PracticeContext)
  const incrementT1Sessions = useCallback(async (): Promise<number> => {
    console.log('⚠️ incrementT1Sessions called - sessions should be tracked via PracticeContext');
    const currentCount = getT1Sessions();
    return currentCount + 1;
  }, [getT1Sessions]);

  const incrementT2Sessions = useCallback(async (): Promise<number> => {
    console.log('⚠️ incrementT2Sessions called - sessions should be tracked via PracticeContext');
    const currentCount = getT2Sessions();
    return currentCount + 1;
  }, [getT2Sessions]);

  const incrementT3Sessions = useCallback(async (): Promise<number> => {
    console.log('⚠️ incrementT3Sessions called - sessions should be tracked via PracticeContext');
    const currentCount = getT3Sessions();
    return currentCount + 1;
  }, [getT3Sessions]);

  const incrementT4Sessions = useCallback(async (): Promise<number> => {
    console.log('⚠️ incrementT4Sessions called - sessions should be tracked via PracticeContext');
    const currentCount = getT4Sessions();
    return currentCount + 1;
  }, [getT4Sessions]);

  const incrementT5Sessions = useCallback(async (): Promise<number> => {
    console.log('⚠️ incrementT5Sessions called - sessions should be tracked via PracticeContext');
    const currentCount = getT5Sessions();
    return currentCount + 1;
  }, [getT5Sessions]);

  // ✅ KEPT: Hours-based stage progression methods (using PracticeContext data)
  const getTotalPracticeHours = useCallback((): number => {
    if (practiceContextRef && practiceContextRef.getTotalPracticeHours) {
      return practiceContextRef.getTotalPracticeHours();
    }
    return userProfile?.totalHours || userProfile?.stageHours?.totalPracticeHours || 0;
  }, [userProfile]);

  const getCurrentStageByHours = useCallback((): number => {
    if (practiceContextRef && practiceContextRef.getCurrentStage) {
      return practiceContextRef.getCurrentStage();
    }
    
    const totalHours = getTotalPracticeHours();
    if (totalHours >= 30) return 6;
    if (totalHours >= 25) return 5;
    if (totalHours >= 20) return 4;
    if (totalHours >= 15) return 3;
    if (totalHours >= 10) return 2;
    if (totalHours >= 5) return 2;
    return 1;
  }, [getTotalPracticeHours]);

  const getStageProgressByHours = useCallback((stage: number): { completed: number; total: number; percentage: number } => {
    if (practiceContextRef && practiceContextRef.getStageProgress) {
      return practiceContextRef.getStageProgress(stage);
    }
    
    const totalHours = getTotalPracticeHours();
    const stageRequirements: { [key: number]: number } = {
      1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30
    };
    
    const required = stageRequirements[stage] || 10;
    const completed = Math.min(totalHours, required);
    const percentage = Math.min(Math.round((completed / required) * 100), 100);
    
    return { 
      completed: Math.round(completed * 10) / 10,
      total: required, 
      percentage 
    };
  }, [getTotalPracticeHours]);

  const canAdvanceToStageByHours = useCallback((targetStage: number): boolean => {
    if (practiceContextRef && practiceContextRef.canAdvanceToStage) {
      return practiceContextRef.canAdvanceToStage(targetStage);
    }
    
    const totalHours = getTotalPracticeHours();
    const unlockRequirements: { [key: number]: number } = {
      1: 0, 2: 5, 3: 10, 4: 15, 5: 20, 6: 25
    };
    
    const requiredHours = unlockRequirements[targetStage] || 0;
    return totalHours >= requiredHours;
  }, [getTotalPracticeHours]);

  // ✅ KEPT: All stage session methods (for backward compatibility)
  const getStage2Sessions = useCallback(() => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => s.stageLevel === 2 && s.completed).length;
  }, [getPracticeContextSessions]);

  const getStage3Sessions = useCallback(() => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => s.stageLevel === 3 && s.completed).length;
  }, [getPracticeContextSessions]);

  const getStage4Sessions = useCallback(() => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => s.stageLevel === 4 && s.completed).length;
  }, [getPracticeContextSessions]);

  const getStage5Sessions = useCallback(() => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => s.stageLevel === 5 && s.completed).length;
  }, [getPracticeContextSessions]);

  const getStage6Sessions = useCallback(() => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => s.stageLevel === 6 && s.completed).length;
  }, [getPracticeContextSessions]);

  // ✅ KEPT: Stage increment methods (for backward compatibility)
  const incrementStage2Sessions = useCallback(async () => getStage2Sessions() + 1, [getStage2Sessions]);
  const incrementStage3Sessions = useCallback(async () => getStage3Sessions() + 1, [getStage3Sessions]);
  const incrementStage4Sessions = useCallback(async () => getStage4Sessions() + 1, [getStage4Sessions]);
  const incrementStage5Sessions = useCallback(async () => getStage5Sessions() + 1, [getStage5Sessions]);
  const incrementStage6Sessions = useCallback(async () => getStage6Sessions() + 1, [getStage6Sessions]);

  // ✅ KEPT: Stage hours methods (for backward compatibility)
  const getStageHours = useCallback((stageNumber: number): number => {
    const stageKey = `stage${stageNumber}Hours`;
    const stageHours = userProfile?.stageHours || {} as StageHours;
    return stageHours[stageKey] || 0;
  }, [userProfile]);

  const getStage1Hours = useCallback(() => getStageHours(1), [getStageHours]);
  const getStage2Hours = useCallback(() => getStageHours(2), [getStageHours]);
  const getStage3Hours = useCallback(() => getStageHours(3), [getStageHours]);
  const getStage4Hours = useCallback(() => getStageHours(4), [getStageHours]);
  const getStage5Hours = useCallback(() => getStageHours(5), [getStageHours]);
  const getStage6Hours = useCallback(() => getStageHours(6), [getStageHours]);

  // ✅ KEPT: Add stage hours method
  const addStageHoursDirect = useCallback(async (stageNumber: number, hoursToAdd: number) => {
    if (!currentUser?.uid || !userProfile) {
      console.warn('⚠️ Cannot add stage hours - no authenticated user or profile');
      return 0;
    }

    const stageKey = `stage${stageNumber}Hours`;
    const currentStageHours = userProfile.stageHours || {} as StageHours;
    const currentHours = currentStageHours[stageKey] || 0;
    const newHours = currentHours + hoursToAdd;
    
    const newStageHours: StageHours = {
      ...currentStageHours,
      [stageKey]: newHours
    };
    
    const totalPracticeHours = Object.keys(newStageHours)
      .filter(key => key.startsWith('stage') && key.endsWith('Hours') && key !== 'totalPracticeHours')
      .reduce((sum, key) => sum + (newStageHours[key] || 0), 0);
    
    newStageHours.totalPracticeHours = totalPracticeHours;

    const updatedProfile: UserProfile = {
      ...userProfile,
      stageHours: newStageHours,
      totalHours: totalPracticeHours,
      updatedAt: new Date().toISOString()
    };

    await saveToFirebase(updatedProfile);
    return newHours;
  }, [currentUser?.uid, userProfile, saveToFirebase]);

  // ✅ KEPT: Stage completion methods (for backward compatibility)
  const isStageCompleteByHours = useCallback((stageNumber: number): boolean => {
    if (stageNumber === 1) {
      return isT1Complete() && isT2Complete() && isT3Complete() && isT4Complete() && isT5Complete();
    }
    
    const completionKey = `stage${stageNumber}Complete`;
    const completionStatus = userProfile?.stageCompletionStatus || {} as StageCompletionStatus;
    return completionStatus[completionKey] || false;
  }, [userProfile, isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete]);

  const isStage1CompleteByHours = useCallback(() => isStageCompleteByHours(1), [isStageCompleteByHours]);
  const isStage2CompleteByHours = useCallback(() => isStageCompleteByHours(2), [isStageCompleteByHours]);
  const isStage3CompleteByHours = useCallback(() => isStageCompleteByHours(3), [isStageCompleteByHours]);
  const isStage4CompleteByHours = useCallback(() => isStageCompleteByHours(4), [isStageCompleteByHours]);
  const isStage5CompleteByHours = useCallback(() => isStageCompleteByHours(5), [isStageCompleteByHours]);
  const isStage6CompleteByHours = useCallback(() => isStageCompleteByHours(6), [isStageCompleteByHours]);

  // ✅ ADDED: Missing isStage1Complete method that other components expect
  const isStage1Complete = useCallback(() => {
    return isT1Complete() && isT2Complete() && isT3Complete() && isT4Complete() && isT5Complete();
  }, [isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete]);

  // ✅ KEPT: Progress tracking methods
  const getStageProgressPercentage = useCallback((stageNumber: number): number => {
    if (stageNumber === 1) {
      const t1 = isT1Complete() ? 1 : getT1Sessions() / 3;
      const t2 = isT2Complete() ? 1 : getT2Sessions() / 3;
      const t3 = isT3Complete() ? 1 : getT3Sessions() / 3;
      const t4 = isT4Complete() ? 1 : getT4Sessions() / 3;
      const t5 = isT5Complete() ? 1 : getT5Sessions() / 3;
      return Math.round(((t1 + t2 + t3 + t4 + t5) / 5) * 100);
    } else {
      const hours = getStageHours(stageNumber);
      const hourRequirements = userProfile?.stageProgress?.hourRequirements || {
        stage1: 5, stage2: 10, stage3: 15, stage4: 20, stage5: 25, stage6: 30
      };
      const required = hourRequirements[`stage${stageNumber}` as keyof typeof hourRequirements] || 15;
      return Math.min(Math.round((hours / required) * 100), 100);
    }
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions, 
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete, 
      getStageHours, userProfile]);

  const getTotalStage1Sessions = useCallback((): number => {
    return getT1Sessions() + getT2Sessions() + getT3Sessions() + getT4Sessions() + getT5Sessions();
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions]);

  // Profile methods with AUTHENTICATION GUARD
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!currentUser?.uid || !userProfile) {
      console.warn('⚠️ Cannot update profile - no authenticated user or profile');
      return;
    }
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await saveToFirebase(updatedProfile);
  }, [currentUser?.uid, userProfile, saveToFirebase]);

  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      preferences: { 
        defaultSessionDuration: 20,
        reminderEnabled: true,
        favoriteStages: [1, 2],
        optimalPracticeTime: "morning",
        notifications: {
          dailyReminder: true,
          streakReminder: true,
          weeklyProgress: true
        },
        ...userProfile.preferences, 
        ...preferences 
      },
      updatedAt: new Date().toISOString()
    };
    
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const updateProgress = useCallback(async (progress: Partial<UserProfile['currentProgress']>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      currentProgress: { 
        currentStage: 1,
        currentTLevel: "Beginner",
        totalSessions: 0,
        totalMinutes: 0,
        longestStreak: 0,
        currentStreak: 0,
        averageQuality: 0,
        averagePresentPercentage: 0,
        ...userProfile.currentProgress, 
        ...progress 
      },
      updatedAt: new Date().toISOString()
    };
    
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const updateStageProgress = useCallback(async (stageProgress: Partial<StageProgression>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      stageProgress: { 
        currentStage: 1,
        devCurrentStage: 'stage1',
        completedStages: [],
        stageHours: {},
        stageCompletionFlags: {},
        completedStageIntros: [],
        t5Completed: false,
        hasSeenTLevelIntro: false,
        totalHours: 0,
        ...userProfile.stageProgress, 
        ...stageProgress 
      } as StageProgression,
      updatedAt: new Date().toISOString()
    };
    
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const updateTotalPracticeHours = useCallback(async (hours: number) => {
    if (!currentUser?.uid || !userProfile) {
      console.warn('⚠️ Cannot update practice hours - no authenticated user or profile');
      return;
    }
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      stageHours: {
        ...userProfile.stageHours,
        totalPracticeHours: hours
      } as StageHours,
      stageProgress: {
        currentStage: 1,
        devCurrentStage: 'stage1',
        completedStages: [],
        stageHours: {},
        stageCompletionFlags: {},
        completedStageIntros: [],
        t5Completed: false,
        hasSeenTLevelIntro: false,
        ...userProfile.stageProgress,
        totalHours: hours
      } as StageProgression,
      currentProgress: {
        currentStage: 1,
        currentTLevel: "Beginner",
        totalSessions: 0,
        totalMinutes: 0,
        longestStreak: 0,
        currentStreak: 0,
        averageQuality: 0,
        averagePresentPercentage: 0,
        ...userProfile.currentProgress,
        totalHours: hours
      },
      updatedAt: new Date().toISOString(),
      totalHours: hours
    };
    
    await saveToFirebase(updatedProfile);
  }, [currentUser?.uid, userProfile, saveToFirebase]);

  const markStageComplete = useCallback(async (stage: number) => {
    if (!userProfile) return;
    
    const completedStages = [...(userProfile.stageProgress?.completedStages || [])];
    if (!completedStages.includes(stage)) {
      completedStages.push(stage);
    }
    
    await updateStageProgress({ completedStages });
  }, [userProfile, updateStageProgress]);

  const setT5Completed = useCallback(async (completed: boolean) => {
    await updateStageProgress({ t5Completed: completed });
  }, [updateStageProgress]);

  const addStageHours = useCallback(async (stage: number, hours: number) => {
    await addStageHoursDirect(stage, hours);
  }, [addStageHoursDirect]);

  const markStageIntroComplete = useCallback(async (stage: string) => {
    if (!userProfile) return;
    
    const completedStageIntros = [...(userProfile.stageProgress?.completedStageIntros || [])];
    if (!completedStageIntros.includes(stage)) {
      completedStageIntros.push(stage);
      await updateStageProgress({ completedStageIntros });
    }
  }, [userProfile, updateStageProgress]);

  const syncProfile = useCallback(async () => {
    if (userProfile) {
      await saveToFirebase(userProfile);
    }
  }, [userProfile, saveToFirebase]);

  const updateHappinessPoints = useCallback(async (points: number) => {
    await updateProfile({ happiness_points: points });
  }, [updateProfile]);

  const addHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;
    const currentPoints = userProfile.happiness_points || 0;
    await updateProfile({ happiness_points: currentPoints + points });
  }, [userProfile, updateProfile]);

  const addAchievement = useCallback(async (achievement: string) => {
    if (!userProfile) return;
    
    const currentAchievements = userProfile.achievements || [];
    if (!currentAchievements.includes(achievement)) {
      const newAchievements = [...currentAchievements, achievement];
      await updateProfile({ achievements: newAchievements });
    }
  }, [userProfile, updateProfile]);

  const getAchievements = useCallback(() => achievements, [achievements]);
  const hasAchievement = useCallback((achievement: string) => achievements.includes(achievement), [achievements]);

  const clearUserData = useCallback(async () => {
    const defaultProfile = createDefaultProfile();
    await saveToFirebase(defaultProfile);
  }, [createDefaultProfile, saveToFirebase]);

  const exportUserData = useCallback(() => userProfile, [userProfile]);

  const contextValue = useMemo(() => ({
    userProfile,
    isLoading,
    achievements,
    
    updateProfile,
    updatePreferences,
    updateProgress,
    updateStageProgress,
    markStageComplete,
    setT5Completed,
    
    addStageHours,
    markStageIntroComplete,
    syncProfile,
    
    getTotalPracticeHours,
    getCurrentStageByHours,
    getStageProgressByHours,
    canAdvanceToStageByHours,
    updateTotalPracticeHours,
    
    updateHappinessPoints,
    addHappinessPoints,
    addAchievement,
    getAchievements,
    hasAchievement,
    
    // ✅ BACKWARD COMPATIBLE: All T-level methods
    getT1Sessions,
    getT2Sessions,
    getT3Sessions,
    getT4Sessions,
    getT5Sessions,
    incrementT1Sessions,
    incrementT2Sessions,
    incrementT3Sessions,
    incrementT4Sessions,
    incrementT5Sessions,
    isT1Complete,
    isT2Complete,
    isT3Complete,
    isT4Complete,
    isT5Complete,
    
    // ✅ BACKWARD COMPATIBLE: All stage methods
    getStage2Sessions,
    getStage3Sessions,
    getStage4Sessions,
    getStage5Sessions,
    getStage6Sessions,
    incrementStage2Sessions,
    incrementStage3Sessions,
    incrementStage4Sessions,
    incrementStage5Sessions,
    incrementStage6Sessions,
    
    // ✅ BACKWARD COMPATIBLE: All hours methods
    getStage1Hours,
    getStage2Hours,
    getStage3Hours,
    getStage4Hours,
    getStage5Hours,
    getStage6Hours,
    addStageHoursDirect,
    
    // ✅ BACKWARD COMPATIBLE: All completion methods
    isStage1CompleteByHours,
    isStage2CompleteByHours,
    isStage3CompleteByHours,
    isStage4CompleteByHours,
    isStage5CompleteByHours,
    isStage6CompleteByHours,
    
    // ✅ BACKWARD COMPATIBLE: Progress methods
    getStageProgressPercentage,
    getTotalStage1Sessions,
    
    // ✅ ADDED: Missing method
    isStage1Complete,
    
    clearUserData,
    exportUserData
  }), [
    userProfile, isLoading, achievements,
    updateProfile, updatePreferences, updateProgress, updateStageProgress, markStageComplete, setT5Completed,
    addStageHours, markStageIntroComplete, syncProfile,
    getTotalPracticeHours, getCurrentStageByHours, getStageProgressByHours, canAdvanceToStageByHours, updateTotalPracticeHours,
    updateHappinessPoints, addHappinessPoints, addAchievement, getAchievements, hasAchievement,
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, incrementT4Sessions, incrementT5Sessions,
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    getStage2Sessions, getStage3Sessions, getStage4Sessions, getStage5Sessions, getStage6Sessions,
    incrementStage2Sessions, incrementStage3Sessions, incrementStage4Sessions, incrementStage5Sessions, incrementStage6Sessions,
    getStage1Hours, getStage2Hours, getStage3Hours, getStage4Hours, getStage5Hours, getStage6Hours, addStageHoursDirect,
    isStage1CompleteByHours, isStage2CompleteByHours, isStage3CompleteByHours, isStage4CompleteByHours, isStage5CompleteByHours, isStage6CompleteByHours,
    getStageProgressPercentage, getTotalStage1Sessions, isStage1Complete,
    clearUserData, exportUserData
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};