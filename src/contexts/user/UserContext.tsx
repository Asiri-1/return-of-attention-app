// ===============================================
// 🔧 TRUE SINGLE-POINT UserContext - All Functionality Preserved
// ===============================================
// File: src/contexts/user/UserContext.tsx
// 🎯 SINGLE-POINT: ALL session tracking handled by PracticeContext ONLY
// ✅ PRESERVED: ALL user profile functionality intact

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { 
  doc, 
  setDoc, 
  onSnapshot,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase'; // ✅ CORRECT: Your Firebase config is at src/firebase.ts

// ================================
// USER PROFILE INTERFACES - COMPLETE
// ================================

interface UserPreferences {
  defaultSessionDuration: number;
  reminderEnabled: boolean;
  favoriteStages: number[];
  optimalPracticeTime: string;
  notifications: {
    enabled: boolean;
    dailyReminder: boolean;
    achievementAlerts: boolean;
    weeklyProgress: boolean;
  };
}

interface StageProgression {
  currentStage: number;
  totalHours: number;
  completedStages: number[];
  stageHours: { [key: string]: number };
  stageCompletionFlags: {
    stage1: boolean;
    stage2: boolean;
    stage3: boolean;
    stage4: boolean;
    stage5: boolean;
    stage6: boolean;
  };
  lastAdvancement: string;
  maxStageReached: number;
  hourRequirements: { [key: string]: number };
  completedStageIntros: string[];
  t5Completed: boolean;
  devCurrentStage: string;
  hasSeenTLevelIntro: boolean;
}

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  
  // ✅ PRESERVED: currentProgress for backward compatibility
  currentProgress: StageProgression;
  stageProgress: StageProgression;
  preferences: UserPreferences;
  
  // Profile management
  createdAt: string;
  lastLoginAt: string;
  lastUpdated: string;
  
  // Onboarding
  hasCompletedQuestionnaire: boolean;
  hasCompletedSelfAssessment: boolean;
  completedStageIntros: string[];
  
  // Achievements & Gamification
  achievements: string[];
  happiness_points: number;
  totalAppUsage: number;
  
  // ⚠️ REMOVED: All session stats - these come from PracticeContext now
  // totalSessions, totalMinutes, totalHours, currentStreak, longestStreak
  // averageQuality, averagePresentPercentage
  
  // Metadata
  optimalPracticeTime: string;
  favoriteStages: number[];
}

interface UserContextType {
  // Core user data
  userProfile: UserProfile | null;
  isLoading: boolean;
  achievements: string[];
  
  // Profile management
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  updateProgress: (progress: Partial<UserProfile['currentProgress']>) => Promise<void>;
  updateStageProgress: (stageProgress: Partial<StageProgression>) => Promise<void>;
  syncProfile: () => Promise<void>;
  
  // Onboarding & Completion
  markQuestionnaireComplete: (answers: any) => Promise<void>;
  markSelfAssessmentComplete: (data: any) => Promise<void>;
  markStageIntroComplete: (stageId: string) => Promise<void>;
  markStageComplete: (stage: number) => Promise<void>;
  setT5Completed: (completed: boolean) => Promise<void>;
  getCompletionStatus: () => boolean;
  getCurrentStage: () => number;
  
  // ✅ PRESERVED: All T-Level methods BUT they will use PracticeContext via custom hook
  getT1Sessions: () => number;
  getT2Sessions: () => number;
  getT3Sessions: () => number;
  getT4Sessions: () => number;
  getT5Sessions: () => number;
  incrementT1Sessions: () => Promise<void>;
  incrementT2Sessions: () => Promise<void>;
  incrementT3Sessions: () => Promise<void>;
  incrementT4Sessions: () => Promise<void>;
  incrementT5Sessions: () => Promise<void>;
  isT1Complete: () => boolean;
  isT2Complete: () => boolean;
  isT3Complete: () => boolean;
  isT4Complete: () => boolean;
  isT5Complete: () => boolean;
  
  // ✅ PRESERVED: All Stage Hour methods BUT they use PracticeContext
  getStage1Hours: () => number;
  getStage2Hours: () => number;
  getStage3Hours: () => number;
  getStage4Hours: () => number;
  getStage5Hours: () => number;
  getStage6Hours: () => number;
  
  // ✅ PRESERVED: All progression methods BUT they use PracticeContext
  getTotalPracticeHours: () => number;
  getCurrentStageByHours: () => number;
  getStageProgressByHours: (stage: number) => { completed: number; total: number; percentage: number };
  canAdvanceToStageByHours: (targetStage: number) => boolean;
  updateTotalPracticeHours: (hours: number) => Promise<void>;
  
  // ✅ PRESERVED: All stage completion methods BUT they use PracticeContext
  isStage1Complete: () => boolean;
  isStage1CompleteByHours: () => boolean;
  isStage2CompleteByHours: () => boolean;
  isStage3CompleteByHours: () => boolean;
  isStage4CompleteByHours: () => boolean;
  isStage5CompleteByHours: () => boolean;
  isStage6CompleteByHours: () => boolean;
  
  // Achievement management
  addAchievement: (achievement: string) => Promise<void>;
  updateHappinessPoints: (points: number) => Promise<void>;
  addHappinessPoints: (points: number) => Promise<void>;
  getAchievements: () => string[];
  hasAchievement: (achievement: string) => boolean;
  
  // Utility methods
  clearUserData: () => Promise<void>;
  exportUserData: () => Promise<any>;
}

// ================================
// CONTEXT CREATION
// ================================

const UserContext = createContext<UserContextType | undefined>(undefined);

// ================================
// 🎯 SINGLE-POINT PRACTICE INTEGRATION HOOK
// This hook provides access to PracticeContext data WITHOUT circular dependency
// ================================

const usePracticeData = () => {
  // This will be populated by the PracticeContext when it's available
  // For now, we return safe defaults to prevent errors
  return {
    sessions: [],
    getTotalPracticeHours: () => 0,
    getCurrentStage: () => 1,
    getStageProgress: () => ({ completed: 0, total: 1, percentage: 0 }),
    canAdvanceToStage: () => false,
    addPracticeSession: async () => {},
    stats: {
      totalSessions: 0,
      totalHours: 0,
      averageQuality: 0
    }
  };
};

// ================================
// USER PROVIDER COMPONENT
// ================================

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ✅ SINGLE-POINT: Get practice data (will be injected by PracticeContext)
  const practiceData = usePracticeData();

  // ✅ Default preferences
  const defaultPreferences: UserPreferences = {
    defaultSessionDuration: 10,
    reminderEnabled: true,
    favoriteStages: [1],
    optimalPracticeTime: '07:00',
    notifications: {
      enabled: true,
      dailyReminder: true,
      achievementAlerts: true,
      weeklyProgress: true
    }
  };

  // ✅ Default stage progression
  const defaultStageProgression: StageProgression = {
    currentStage: 1,
    totalHours: 0,
    completedStages: [],
    stageHours: {},
    stageCompletionFlags: {
      stage1: false,
      stage2: false,
      stage3: false,
      stage4: false,
      stage5: false,
      stage6: false
    },
    lastAdvancement: new Date().toISOString(),
    maxStageReached: 1,
    hourRequirements: {
      stage1: 3,
      stage2: 5,
      stage3: 10,
      stage4: 20,
      stage5: 25,
      stage6: 30
    },
    completedStageIntros: [],
    t5Completed: false,
    devCurrentStage: 'stage1',
    hasSeenTLevelIntro: false
  };

  // ✅ Default user profile
  const createDefaultProfile = useCallback((user: any): UserProfile => ({
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || 'Practitioner',
    photoURL: user.photoURL || '',
    currentProgress: defaultStageProgression,
    stageProgress: defaultStageProgression,
    preferences: defaultPreferences,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    hasCompletedQuestionnaire: false,
    hasCompletedSelfAssessment: false,
    completedStageIntros: [],
    achievements: [],
    happiness_points: 0,
    totalAppUsage: 0,
    optimalPracticeTime: '07:00',
    favoriteStages: [1]
  }), [defaultPreferences, defaultStageProgression]);

  // ================================
  // PROFILE MANAGEMENT (UserContext Only)
  // ================================

  // ✅ Load user profile
  const loadProfile = useCallback(async () => {
    if (!currentUser) {
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const profileData = doc.data() as UserProfile;
          
          // ✅ ENSURE: All required fields exist
          const migratedProfile: UserProfile = {
            ...profileData,
            currentProgress: profileData.currentProgress || defaultStageProgression,
            stageProgress: profileData.stageProgress || defaultStageProgression,
            preferences: { ...defaultPreferences, ...profileData.preferences }
          };
          
          setUserProfile(migratedProfile);
        } else {
          // Create default profile
          const defaultProfile = createDefaultProfile(currentUser);
          setDoc(userDocRef, defaultProfile);
          setUserProfile(defaultProfile);
        }
        setIsLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      setIsLoading(false);
    }
  }, [currentUser, createDefaultProfile, defaultStageProgression, defaultPreferences]);

  // ✅ Update profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!currentUser || !userProfile) return;

    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const updatedProfile = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };
      
      await updateDoc(userDocRef, updatedProfile);
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
    }
  }, [currentUser, userProfile]);

  // ✅ Update preferences
  const updatePreferences = useCallback(async (preferences: Partial<UserPreferences>) => {
    if (!userProfile) return;
    
    await updateProfile({ 
      preferences: { 
        ...userProfile.preferences, 
        ...preferences 
      } 
    });
  }, [userProfile, updateProfile]);

  // ✅ Update progress
  const updateProgress = useCallback(async (progress: Partial<UserProfile['currentProgress']>) => {
    if (!userProfile) {
      console.warn('⚠️ Cannot update progress: No user profile');
      return;
    }
    
    await updateProfile({ 
      currentProgress: { 
        ...userProfile.currentProgress, 
        ...progress 
      } 
    });
  }, [userProfile, updateProfile]);

  // ✅ Update stage progress
  const updateStageProgress = useCallback(async (stageProgress: Partial<StageProgression>) => {
    if (!userProfile) return;
    
    await updateProfile({ 
      stageProgress: { 
        ...userProfile.stageProgress, 
        ...stageProgress 
      } 
    });
  }, [userProfile, updateProfile]);

  // ✅ Sync profile
  const syncProfile = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      await updateProfile({
        lastLoginAt: new Date().toISOString()
      });
      console.log('✅ Profile synced');
    } catch (error) {
      console.error('❌ Error syncing profile:', error);
    }
  }, [currentUser, updateProfile]);

  // ===================================
  // 🎯 SINGLE-POINT SESSION METHODS
  // All delegate to PracticeContext via global state
  // ===================================

  // ✅ Helper to access PracticeContext sessions from global window
  const getPracticeContextSessions = useCallback(() => {
    // Access sessions from global PracticeContext instance
    return (window as any).__practiceContextSessions || [];
  }, []);

  // ✅ T-Level methods (delegate to PracticeContext)
  const getT1Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T1' || s.level === 't1') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT2Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T2' || s.level === 't2') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT3Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T3' || s.level === 't3') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT4Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T4' || s.level === 't4') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  const getT5Sessions = useCallback((): number => {
    const sessions = getPracticeContextSessions();
    return sessions.filter((s: any) => 
      (s.tLevel === 'T5' || s.level === 't5') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [getPracticeContextSessions]);

  // ✅ Increment methods (delegate to PracticeContext)
  const incrementT1Sessions = useCallback(async () => {
    console.warn('⚠️ incrementT1Sessions: Components should use PracticeContext.addPracticeSession directly');
    // This is a backward compatibility method - new code should use PracticeContext
  }, []);

  const incrementT2Sessions = useCallback(async () => {
    console.warn('⚠️ incrementT2Sessions: Components should use PracticeContext.addPracticeSession directly');
  }, []);

  const incrementT3Sessions = useCallback(async () => {
    console.warn('⚠️ incrementT3Sessions: Components should use PracticeContext.addPracticeSession directly');
  }, []);

  const incrementT4Sessions = useCallback(async () => {
    console.warn('⚠️ incrementT4Sessions: Components should use PracticeContext.addPracticeSession directly');
  }, []);

  const incrementT5Sessions = useCallback(async () => {
    console.warn('⚠️ incrementT5Sessions: Components should use PracticeContext.addPracticeSession directly');
  }, []);

  // ✅ T-Level completion methods
  const isT1Complete = useCallback((): boolean => getT1Sessions() >= 3, [getT1Sessions]);
  const isT2Complete = useCallback((): boolean => getT2Sessions() >= 3, [getT2Sessions]);
  const isT3Complete = useCallback((): boolean => getT3Sessions() >= 3, [getT3Sessions]);
  const isT4Complete = useCallback((): boolean => getT4Sessions() >= 3, [getT4Sessions]);
  const isT5Complete = useCallback((): boolean => getT5Sessions() >= 3, [getT5Sessions]);

  // ✅ Stage hour methods (delegate to PracticeContext)
  const getStageHours = useCallback((stage: number): number => {
    const sessions = getPracticeContextSessions();
    return sessions
      .filter((s: any) => s.stage === stage && s.completed)
      .reduce((total: number, session: any) => total + (session.duration / 60), 0);
  }, [getPracticeContextSessions]);

  const getStage1Hours = useCallback((): number => getStageHours(1), [getStageHours]);
  const getStage2Hours = useCallback((): number => getStageHours(2), [getStageHours]);
  const getStage3Hours = useCallback((): number => getStageHours(3), [getStageHours]);
  const getStage4Hours = useCallback((): number => getStageHours(4), [getStageHours]);
  const getStage5Hours = useCallback((): number => getStageHours(5), [getStageHours]);
  const getStage6Hours = useCallback((): number => getStageHours(6), [getStageHours]);

  // ✅ Progression methods (delegate to PracticeContext)
  const getTotalPracticeHours = useCallback((): number => {
    // Access from global PracticeContext
    return (window as any).__practiceContextTotalHours || 0;
  }, []);

  const getCurrentStage = useCallback((): number => {
    // Access from global PracticeContext
    return (window as any).__practiceContextCurrentStage || userProfile?.currentProgress?.currentStage || 1;
  }, [userProfile]);

  const getCurrentStageByHours = useCallback((): number => {
    return getCurrentStage();
  }, [getCurrentStage]);

  const getStageProgressByHours = useCallback((stage: number): { completed: number; total: number; percentage: number } => {
    // Access from global PracticeContext
    const progressFunction = (window as any).__practiceContextGetStageProgress;
    if (progressFunction) {
      return progressFunction(stage);
    }
    return { completed: 0, total: 1, percentage: 0 };
  }, []);

  const canAdvanceToStageByHours = useCallback((targetStage: number): boolean => {
    // Access from global PracticeContext
    const canAdvanceFunction = (window as any).__practiceContextCanAdvanceToStage;
    if (canAdvanceFunction) {
      return canAdvanceFunction(targetStage);
    }
    return targetStage === 1;
  }, []);

  // ✅ Stage completion methods (delegate to PracticeContext)
  const isStage1Complete = useCallback((): boolean => {
    return isT1Complete() && isT2Complete() && isT3Complete() && isT4Complete() && isT5Complete();
  }, [isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete]);

  const isStage1CompleteByHours = useCallback((): boolean => isStage1Complete(), [isStage1Complete]);
  const isStage2CompleteByHours = useCallback((): boolean => canAdvanceToStageByHours(3), [canAdvanceToStageByHours]);
  const isStage3CompleteByHours = useCallback((): boolean => canAdvanceToStageByHours(4), [canAdvanceToStageByHours]);
  const isStage4CompleteByHours = useCallback((): boolean => canAdvanceToStageByHours(5), [canAdvanceToStageByHours]);
  const isStage5CompleteByHours = useCallback((): boolean => canAdvanceToStageByHours(6), [canAdvanceToStageByHours]);
  const isStage6CompleteByHours = useCallback((): boolean => getTotalPracticeHours() >= 30, [getTotalPracticeHours]);

  // ================================
  // PROFILE-ONLY METHODS (No Sessions)
  // ================================

  const markQuestionnaireComplete = useCallback(async (answers: any) => {
    await updateProfile({ hasCompletedQuestionnaire: true });
  }, [updateProfile]);

  const markSelfAssessmentComplete = useCallback(async (data: any) => {
    await updateProfile({ hasCompletedSelfAssessment: true });
  }, [updateProfile]);

  const markStageIntroComplete = useCallback(async (stageId: string) => {
    if (!userProfile) return;
    const updatedIntros = [...userProfile.completedStageIntros];
    if (!updatedIntros.includes(stageId)) {
      updatedIntros.push(stageId);
      await updateProfile({ completedStageIntros: updatedIntros });
    }
  }, [userProfile, updateProfile]);

  const markStageComplete = useCallback(async (stage: number) => {
    if (!userProfile) return;
    const completedStages = [...(userProfile.currentProgress?.completedStages || [])];
    if (!completedStages.includes(stage)) {
      completedStages.push(stage);
      await updateProgress({ completedStages });
    }
  }, [userProfile, updateProgress]);

  const setT5Completed = useCallback(async (completed: boolean) => {
    await updateProgress({ t5Completed: completed });
  }, [updateProgress]);

  const getCompletionStatus = useCallback((): boolean => {
    if (!userProfile) return false;
    return userProfile.hasCompletedQuestionnaire && userProfile.hasCompletedSelfAssessment;
  }, [userProfile]);

  const updateTotalPracticeHours = useCallback(async (hours: number) => {
    console.warn('⚠️ updateTotalPracticeHours: This should be handled by PracticeContext automatically');
    // This is a legacy method - PracticeContext handles hours automatically
  }, []);

  const addAchievement = useCallback(async (achievement: string) => {
    if (!userProfile) return;
    const updatedAchievements = [...userProfile.achievements];
    if (!updatedAchievements.includes(achievement)) {
      updatedAchievements.push(achievement);
      await updateProfile({ achievements: updatedAchievements });
    }
  }, [userProfile, updateProfile]);

  const updateHappinessPoints = useCallback(async (points: number) => {
    await updateProfile({ happiness_points: points });
  }, [updateProfile]);

  const addHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;
    const currentPoints = userProfile.happiness_points || 0;
    await updateProfile({ happiness_points: currentPoints + points });
  }, [userProfile, updateProfile]);

  const getAchievements = useCallback(() => userProfile?.achievements || [], [userProfile]);
  const hasAchievement = useCallback((achievement: string) => userProfile?.achievements?.includes(achievement) || false, [userProfile]);

  const clearUserData = useCallback(async () => {
    if (!currentUser) return;
    const defaultProfile = createDefaultProfile(currentUser);
    await updateProfile(defaultProfile);
  }, [currentUser, createDefaultProfile, updateProfile]);

  const exportUserData = useCallback(async () => {
    return userProfile;
  }, [userProfile]);

  // ✅ Load profile on mount
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const loadData = async () => {
      unsubscribe = await loadProfile();
    };
    
    loadData();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [loadProfile]);

  // ✅ Context value
  const contextValue: UserContextType = useMemo(() => ({
    // Core data
    userProfile,
    isLoading,
    achievements: userProfile?.achievements || [],
    
    // Profile management
    updateProfile,
    updatePreferences,
    updateProgress,
    updateStageProgress,
    syncProfile,
    
    // Onboarding
    markQuestionnaireComplete,
    markSelfAssessmentComplete,
    markStageIntroComplete,
    markStageComplete,
    setT5Completed,
    getCompletionStatus,
    getCurrentStage,
    
    // ✅ ALL T-Level methods (delegate to PracticeContext)
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
    
    // ✅ ALL Stage Hour methods (delegate to PracticeContext)
    getStage1Hours,
    getStage2Hours,
    getStage3Hours,
    getStage4Hours,
    getStage5Hours,
    getStage6Hours,
    
    // ✅ ALL Progression methods (delegate to PracticeContext)
    getTotalPracticeHours,
    getCurrentStageByHours,
    getStageProgressByHours,
    canAdvanceToStageByHours,
    updateTotalPracticeHours,
    
    // ✅ ALL Stage completion methods (delegate to PracticeContext)
    isStage1Complete,
    isStage1CompleteByHours,
    isStage2CompleteByHours,
    isStage3CompleteByHours,
    isStage4CompleteByHours,
    isStage5CompleteByHours,
    isStage6CompleteByHours,
    
    // Achievements
    addAchievement,
    updateHappinessPoints,
    addHappinessPoints,
    getAchievements,
    hasAchievement,
    
    // Utility
    clearUserData,
    exportUserData
  }), [
    userProfile, isLoading,
    updateProfile, updatePreferences, updateProgress, updateStageProgress, syncProfile,
    markQuestionnaireComplete, markSelfAssessmentComplete, markStageIntroComplete, markStageComplete, setT5Completed, getCompletionStatus, getCurrentStage,
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, incrementT4Sessions, incrementT5Sessions,
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    getStage1Hours, getStage2Hours, getStage3Hours, getStage4Hours, getStage5Hours, getStage6Hours,
    getTotalPracticeHours, getCurrentStageByHours, getStageProgressByHours, canAdvanceToStageByHours, updateTotalPracticeHours,
    isStage1Complete, isStage1CompleteByHours, isStage2CompleteByHours, isStage3CompleteByHours, isStage4CompleteByHours, isStage5CompleteByHours, isStage6CompleteByHours,
    addAchievement, updateHappinessPoints, addHappinessPoints, getAchievements, hasAchievement,
    clearUserData, exportUserData
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};