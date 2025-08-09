// ✅ COMPLETE UserContext with ALL Session Tracking - TypeScript Fixed
// File: src/contexts/user/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

// ✅ FIXED: Complete interfaces with proper index signatures
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

interface UserProfile {
  userId: string;
  displayName: string;
  email: string;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageQuality: number;
  averagePresentPercentage: number;
  totalMindRecoverySessions?: number;
  totalMindRecoveryMinutes?: number;
  averageMindRecoveryRating?: number;

  stageProgress?: {
    currentStage: number;
    devCurrentStage?: string;
    completedStages: number[];
    stageHours: { [key: string]: number };
    stageCompletionFlags: { [key: string]: boolean };
    completedStageIntros: string[];
    t5Completed?: boolean;
  };

  // ✅ FIXED: Use typed interfaces
  sessionCounts?: SessionCounts;
  stageHours?: StageHours;
  stageCompletionStatus?: StageCompletionStatus;
  lastSessions?: LastSessions;

  currentProgress?: {
    currentStage: number;
    currentTLevel: string;
    totalSessions: number;
    totalMinutes: number;
    longestStreak: number;
    currentStreak: number;
    averageQuality: number;
    averagePresentPercentage: number;
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
  updateStageProgress: (stageProgress: Partial<UserProfile['stageProgress']>) => Promise<void>;
  markStageComplete: (stage: number) => Promise<void>;
  setT5Completed: (completed: boolean) => Promise<void>;
  
  // ✅ FIXED: Add missing methods that your existing code uses
  addStageHours: (stage: number, hours: number) => Promise<void>;
  markStageIntroComplete: (stage: string) => Promise<void>;
  syncProfile: () => Promise<void>;
  
  // Happiness & achievements
  updateHappinessPoints: (points: number) => Promise<void>;
  addHappinessPoints: (points: number) => Promise<void>;
  addAchievement: (achievement: string) => Promise<void>;
  getAchievements: () => string[];
  hasAchievement: (achievement: string) => boolean;
  
  // ✅ T-Level Session Tracking (Stage 1)
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
  
  // ✅ Stage Session Tracking (Stages 2-6)
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
  
  // ✅ Hours Tracking (15 hours required for stages 2-6)
  getStage2Hours: () => number;
  getStage3Hours: () => number;
  getStage4Hours: () => number;
  getStage5Hours: () => number;
  getStage6Hours: () => number;
  addStageHoursDirect: (stageNumber: number, hours: number) => Promise<number>;
  
  // ✅ Completion Status
  isStage2CompleteByHours: () => boolean;
  isStage3CompleteByHours: () => boolean;
  isStage4CompleteByHours: () => boolean;
  isStage5CompleteByHours: () => boolean;
  isStage6CompleteByHours: () => boolean;
  
  // ✅ Progress Tracking
  getStageProgressPercentage: (stageNumber: number) => number;
  getTotalStage1Sessions: () => number;
  
  // Utility methods
  clearUserData: () => Promise<void>;
  exportUserData: () => UserProfile | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<string[]>([]);

  // ✅ Create default profile with all session tracking fields
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
        t5Completed: false
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
        averagePresentPercentage: 0
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
      updatedAt: new Date().toISOString()
    };
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // ✅ Enhanced Firebase save with proper error handling
  const saveToFirebase = useCallback(async (profile: UserProfile) => {
    if (!currentUser?.uid) {
      console.warn('⚠️ Cannot save to Firebase: No current user');
      return;
    }

    try {
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
        
        lastSessions: profile.lastSessions || {},
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userProfiles', currentUser.uid), cleanProfile, { merge: true });
      console.log(`✅ User profile saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      console.log('🔍 Saved session counts:', cleanProfile.sessionCounts);
      console.log('🔍 Saved stage hours:', cleanProfile.stageHours);
      
    } catch (error) {
      console.error('❌ Failed to save user profile to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  // ✅ Enhanced Firebase load with data migration
  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    
    try {
      const userDocRef = doc(db, 'userProfiles', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        
        const migratedProfile: UserProfile = {
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          
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
            ...(data.sessionCounts || {})
          },
          
          stageHours: {
            stage1Hours: 0,
            stage2Hours: 0,
            stage3Hours: 0,
            stage4Hours: 0,
            stage5Hours: 0,
            stage6Hours: 0,
            ...(data.stageHours || {})
          },
          
          stageCompletionStatus: {
            stage1Complete: false,
            stage2Complete: false,
            stage3Complete: false,
            stage4Complete: false,
            stage5Complete: false,
            stage6Complete: false,
            ...(data.stageCompletionStatus || {})
          },
          
          lastSessions: data.lastSessions || {}
        };
        
        setUserProfile(migratedProfile);
        setAchievements(migratedProfile.achievements || ['journey_started']);
        
        console.log(`📦 User profile loaded from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
        console.log('🔍 Loaded session counts:', migratedProfile.sessionCounts);
        console.log('🔍 Loaded stage hours:', migratedProfile.stageHours);
        
        if (!data.sessionCounts || !data.stageHours || !data.stageCompletionStatus) {
          console.log('🔄 Migrating profile to new format...');
          await saveToFirebase(migratedProfile);
        }
        
      } else {
        console.log(`🆕 Initializing default profile for new user ${currentUser.uid.substring(0, 8)}...`);
        const defaultProfile = createDefaultProfile();
        await saveToFirebase(defaultProfile);
        setUserProfile(defaultProfile);
        setAchievements(defaultProfile.achievements || ['journey_started']);
      }
    } catch (error) {
      console.error('❌ Failed to load user profile from Firebase:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, createDefaultProfile, saveToFirebase]);

  // ✅ FIXED: Core session counting logic - TypeScript safe with proper typing
  const updateSessionCount = useCallback(async (level: string, increment: number = 1) => {
    if (!userProfile) return 0;

    const sessionKey = `${level.toLowerCase()}Sessions`;
    const lastSessionKey = `last${level.charAt(0).toUpperCase() + level.slice(1)}Session`;
    
    console.log(`📊 Updating ${level} session count by ${increment}`);
    
    const currentSessionCounts = userProfile.sessionCounts || {} as SessionCounts;
    const currentCount = currentSessionCounts[sessionKey] || 0;
    const newCount = currentCount + increment;
    
    const newSessionCounts: SessionCounts = {
      ...currentSessionCounts,
      [sessionKey]: newCount,
    };

    // Update stage totals
    if (level.startsWith('t')) {
      newSessionCounts.stage1TotalSessions = currentSessionCounts.stage1TotalSessions + increment;
    } else if (level === 'stage2') {
      newSessionCounts.stage2TotalSessions = currentSessionCounts.stage2TotalSessions + increment;
    } else if (level === 'stage3') {
      newSessionCounts.stage3TotalSessions = currentSessionCounts.stage3TotalSessions + increment;
    } else if (level === 'stage4') {
      newSessionCounts.stage4TotalSessions = currentSessionCounts.stage4TotalSessions + increment;
    } else if (level === 'stage5') {
      newSessionCounts.stage5TotalSessions = currentSessionCounts.stage5TotalSessions + increment;
    } else if (level === 'stage6') {
      newSessionCounts.stage6TotalSessions = currentSessionCounts.stage6TotalSessions + increment;
    }

    const newLastSessions: LastSessions = {
      ...userProfile.lastSessions,
      [lastSessionKey]: new Date().toISOString()
    };
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      sessionCounts: newSessionCounts,
      lastSessions: newLastSessions,
      totalSessions: userProfile.totalSessions + increment,
      updatedAt: new Date().toISOString()
    };

    console.log(`✅ ${level} sessions: ${currentCount} → ${newCount}`);
    
    setUserProfile(updatedProfile);
    await saveToFirebase(updatedProfile);
    
    return newCount;
  }, [userProfile, saveToFirebase]);

  const getSessionCount = useCallback((level: string): number => {
    const sessionKey = `${level.toLowerCase()}Sessions`;
    const sessionCounts = userProfile?.sessionCounts || {} as SessionCounts;
    return sessionCounts[sessionKey] || 0;
  }, [userProfile]);

  // ✅ T-Level Session Methods (Stage 1)
  const getT1Sessions = useCallback(() => getSessionCount('t1'), [getSessionCount]);
  const getT2Sessions = useCallback(() => getSessionCount('t2'), [getSessionCount]);
  const getT3Sessions = useCallback(() => getSessionCount('t3'), [getSessionCount]);
  const getT4Sessions = useCallback(() => getSessionCount('t4'), [getSessionCount]);
  const getT5Sessions = useCallback(() => getSessionCount('t5'), [getSessionCount]);

  const incrementT1Sessions = useCallback(() => updateSessionCount('t1'), [updateSessionCount]);
  const incrementT2Sessions = useCallback(() => updateSessionCount('t2'), [updateSessionCount]);
  const incrementT3Sessions = useCallback(() => updateSessionCount('t3'), [updateSessionCount]);
  const incrementT4Sessions = useCallback(() => updateSessionCount('t4'), [updateSessionCount]);
  const incrementT5Sessions = useCallback(() => updateSessionCount('t5'), [updateSessionCount]);

  const isT1Complete = useCallback(() => getT1Sessions() >= 3, [getT1Sessions]);
  const isT2Complete = useCallback(() => getT2Sessions() >= 3, [getT2Sessions]);
  const isT3Complete = useCallback(() => getT3Sessions() >= 3, [getT3Sessions]);
  const isT4Complete = useCallback(() => getT4Sessions() >= 3, [getT4Sessions]);
  const isT5Complete = useCallback(() => getT5Sessions() >= 3, [getT5Sessions]);

  // ✅ Stage Session Methods (Stages 2-6)
  const getStage2Sessions = useCallback(() => getSessionCount('stage2'), [getSessionCount]);
  const getStage3Sessions = useCallback(() => getSessionCount('stage3'), [getSessionCount]);
  const getStage4Sessions = useCallback(() => getSessionCount('stage4'), [getSessionCount]);
  const getStage5Sessions = useCallback(() => getSessionCount('stage5'), [getSessionCount]);
  const getStage6Sessions = useCallback(() => getSessionCount('stage6'), [getSessionCount]);

  const incrementStage2Sessions = useCallback(() => updateSessionCount('stage2'), [updateSessionCount]);
  const incrementStage3Sessions = useCallback(() => updateSessionCount('stage3'), [updateSessionCount]);
  const incrementStage4Sessions = useCallback(() => updateSessionCount('stage4'), [updateSessionCount]);
  const incrementStage5Sessions = useCallback(() => updateSessionCount('stage5'), [updateSessionCount]);
  const incrementStage6Sessions = useCallback(() => updateSessionCount('stage6'), [updateSessionCount]);

  // ✅ FIXED: Hours tracking for 15-hour requirements
  const addStageHoursDirect = useCallback(async (stageNumber: number, hoursToAdd: number) => {
    if (!userProfile) return 0;

    const stageKey = `stage${stageNumber}Hours`;
    const completionKey = `stage${stageNumber}Complete`;
    
    console.log(`⏱️ Adding ${hoursToAdd} hours to Stage ${stageNumber}`);
    
    const currentStageHours = userProfile.stageHours || {} as StageHours;
    const currentHours = currentStageHours[stageKey] || 0;
    const newHours = currentHours + hoursToAdd;
    
    const requiredHours = stageNumber === 1 ? 0 : 15;
    const isComplete = newHours >= requiredHours;
    
    const newStageHours: StageHours = {
      ...currentStageHours,
      [stageKey]: newHours
    };

    const currentCompletionStatus = userProfile.stageCompletionStatus || {} as StageCompletionStatus;
    const newCompletionStatus: StageCompletionStatus = {
      ...currentCompletionStatus,
      [completionKey]: isComplete
    };
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      stageHours: newStageHours,
      stageCompletionStatus: newCompletionStatus,
      updatedAt: new Date().toISOString()
    };

    console.log(`✅ Stage ${stageNumber} hours: ${currentHours} → ${newHours} (Complete: ${isComplete})`);
    
    setUserProfile(updatedProfile);
    await saveToFirebase(updatedProfile);
    
    return newHours;
  }, [userProfile, saveToFirebase]);

  const getStageHours = useCallback((stageNumber: number): number => {
    const stageKey = `stage${stageNumber}Hours`;
    const stageHours = userProfile?.stageHours || {} as StageHours;
    return stageHours[stageKey] || 0;
  }, [userProfile]);

  const getStage2Hours = useCallback(() => getStageHours(2), [getStageHours]);
  const getStage3Hours = useCallback(() => getStageHours(3), [getStageHours]);
  const getStage4Hours = useCallback(() => getStageHours(4), [getStageHours]);
  const getStage5Hours = useCallback(() => getStageHours(5), [getStageHours]);
  const getStage6Hours = useCallback(() => getStageHours(6), [getStageHours]);

  const isStageCompleteByHours = useCallback((stageNumber: number): boolean => {
    if (stageNumber === 1) {
      return isT5Complete();
    }
    
    const completionKey = `stage${stageNumber}Complete`;
    const completionStatus = userProfile?.stageCompletionStatus || {} as StageCompletionStatus;
    return completionStatus[completionKey] || false;
  }, [userProfile, isT5Complete]);

  const isStage2CompleteByHours = useCallback(() => isStageCompleteByHours(2), [isStageCompleteByHours]);
  const isStage3CompleteByHours = useCallback(() => isStageCompleteByHours(3), [isStageCompleteByHours]);
  const isStage4CompleteByHours = useCallback(() => isStageCompleteByHours(4), [isStageCompleteByHours]);
  const isStage5CompleteByHours = useCallback(() => isStageCompleteByHours(5), [isStageCompleteByHours]);
  const isStage6CompleteByHours = useCallback(() => isStageCompleteByHours(6), [isStageCompleteByHours]);

  // ✅ Progress tracking
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
      return Math.min(Math.round((hours / 15) * 100), 100);
    }
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions, 
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete, getStageHours]);

  const getTotalStage1Sessions = useCallback((): number => {
    return getT1Sessions() + getT2Sessions() + getT3Sessions() + getT4Sessions() + getT5Sessions();
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions]);

  // ✅ FIXED: Core profile methods with proper typing
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    setUserProfile(updatedProfile);
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

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
    
    setUserProfile(updatedProfile);
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
    
    setUserProfile(updatedProfile);
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const updateStageProgress = useCallback(async (stageProgress: Partial<UserProfile['stageProgress']>) => {
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
        ...userProfile.stageProgress, 
        ...stageProgress 
      },
      updatedAt: new Date().toISOString()
    };
    
    setUserProfile(updatedProfile);
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

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

  // ✅ FIXED: Add missing methods that your existing code uses
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
      setAchievements(newAchievements);
      await updateProfile({ achievements: newAchievements });
    }
  }, [userProfile, updateProfile]);

  const getAchievements = useCallback(() => achievements, [achievements]);
  const hasAchievement = useCallback((achievement: string) => achievements.includes(achievement), [achievements]);

  const clearUserData = useCallback(async () => {
    const defaultProfile = createDefaultProfile();
    setUserProfile(defaultProfile);
    setAchievements(defaultProfile.achievements || []);
    await saveToFirebase(defaultProfile);
  }, [createDefaultProfile, saveToFirebase]);

  const exportUserData = useCallback(() => userProfile, [userProfile]);

  // Load profile when user changes
  useEffect(() => {
    if (currentUser) {
      loadFromFirebase();
    } else {
      setUserProfile(null);
      setAchievements([]);
      setIsLoading(false);
    }
  }, [currentUser, loadFromFirebase]);

  const contextValue = useMemo(() => ({
    userProfile,
    isLoading,
    achievements,
    
    // Core methods
    updateProfile,
    updatePreferences,
    updateProgress,
    updateStageProgress,
    markStageComplete,
    setT5Completed,
    
    // Missing methods
    addStageHours,
    markStageIntroComplete,
    syncProfile,
    
    // Happiness & achievements
    updateHappinessPoints,
    addHappinessPoints,
    addAchievement,
    getAchievements,
    hasAchievement,
    
    // T-Level tracking
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
    
    // Stage tracking
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
    
    // Hours tracking
    getStage2Hours,
    getStage3Hours,
    getStage4Hours,
    getStage5Hours,
    getStage6Hours,
    addStageHoursDirect,
    
    // Completion status
    isStage2CompleteByHours,
    isStage3CompleteByHours,
    isStage4CompleteByHours,
    isStage5CompleteByHours,
    isStage6CompleteByHours,
    
    // Progress tracking
    getStageProgressPercentage,
    getTotalStage1Sessions,
    
    // Utility
    clearUserData,
    exportUserData
  }), [
    userProfile, isLoading, achievements,
    updateProfile, updatePreferences, updateProgress, updateStageProgress, markStageComplete, setT5Completed,
    addStageHours, markStageIntroComplete, syncProfile,
    updateHappinessPoints, addHappinessPoints, addAchievement, getAchievements, hasAchievement,
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, incrementT4Sessions, incrementT5Sessions,
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    getStage2Sessions, getStage3Sessions, getStage4Sessions, getStage5Sessions, getStage6Sessions,
    incrementStage2Sessions, incrementStage3Sessions, incrementStage4Sessions, incrementStage5Sessions, incrementStage6Sessions,
    getStage2Hours, getStage3Hours, getStage4Hours, getStage5Hours, getStage6Hours, addStageHoursDirect,
    isStage2CompleteByHours, isStage3CompleteByHours, isStage4CompleteByHours, isStage5CompleteByHours, isStage6CompleteByHours,
    getStageProgressPercentage, getTotalStage1Sessions,
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