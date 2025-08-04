// ✅ FIREBASE-ONLY UserContext - No localStorage conflicts
// File: src/contexts/user/UserContext.tsx

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase';

// ================================
// USER PROFILE INTERFACES (UNCHANGED)
// ================================
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

  // ✅ AUDIT COMPLIANCE - Stage completion tracking
  stageProgress?: {
    currentStage: number;
    devCurrentStage?: string;
    completedStages: number[];
    stageHours: { [key: string]: number }; // stage1Hours, stage2Hours, etc.
    stageCompletionFlags: { [key: string]: boolean }; // stage1Complete, stage2Complete, etc.
    completedStageIntros: string[]; // Track completed stage introductions
    t5Completed?: boolean; // T5 completion flag
  };

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

  // ✅ Firebase-specific fields (optional for backward compatibility)
  firestoreId?: string;
  createdAt?: string;
  updatedAt?: string;

  // ✅ NEW - Happiness Points Integration
  happiness_points?: number;
  achievements?: string[]; // Ensure achievements are part of the UserProfile for Firestore
}

interface UserContextType {
  // Data
  userProfile: UserProfile | null;
  achievements: string[];
  isLoading: boolean;

  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => Promise<void>;
  updateProgress: (progress: Partial<UserProfile['currentProgress']>) => Promise<void>;

  // ✅ AUDIT COMPLIANCE - Stage management methods
  updateStageProgress: (stageData: Partial<UserProfile['stageProgress']>) => Promise<void>;
  markStageComplete: (stage: number) => Promise<void>;
  addStageHours: (stage: number, hours: number) => Promise<void>;
  markStageIntroComplete: (stageIntro: string) => Promise<void>;
  setT5Completed: (completed: boolean) => Promise<void>;

  // ✅ NEW - Happiness Points Methods
  updateHappinessPoints: (points: number) => Promise<void>;
  addHappinessPoints: (points: number) => Promise<void>;

  // Achievement methods
  addAchievement: (achievement: string) => Promise<void>;
  getAchievements: () => string[];
  hasAchievement: (achievement: string) => boolean;

  // Utility methods
  clearUserData: () => Promise<void>;
  exportUserData: () => any;
  syncProfile: (sessionData?: any) => Promise<void>;
}

// ================================
// CREATE CONTEXT
// ================================
const UserContext = createContext<UserContextType | undefined>(undefined);

// ================================
// FIREBASE-ONLY USER PROVIDER
// ================================
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // ================================
  // CREATE DEFAULT PROFILE (UNCHANGED)
  // ================================
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

      // ✅ AUDIT COMPLIANCE - Initialize stage progress tracking
      stageProgress: {
        currentStage: 1,
        devCurrentStage: 'stage1',
        completedStages: [],
        stageHours: {},
        stageCompletionFlags: {},
        completedStageIntros: [],
        t5Completed: false
      },

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

      // ✅ Firebase fields
      happiness_points: 0, // NEW - Initialize happiness points
      achievements: ['journey_started'], // Default achievement
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // ================================
  // FIREBASE-ONLY: Data persistence
  // ================================
  const saveToFirebase = useCallback(async (profile: UserProfile) => {
    if (!currentUser?.uid) return;

    try {
      const userDoc = {
        ...profile,
        userId: currentUser.uid,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(doc(db, 'userProfiles', currentUser.uid), userDoc, { merge: true });
      console.log(`✅ User profile saved to Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      
    } catch (error) {
      console.error('❌ Failed to save user profile to Firebase:', error);
      throw error;
    }
  }, [currentUser?.uid]);

  const loadFromFirebase = useCallback(async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    
    try {
      const userDocRef = doc(db, 'userProfiles', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data() as UserProfile;
        
        // Convert timestamps if needed
        const profile: UserProfile = {
          ...data,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString()
        };
        
        setUserProfile(profile);
        setAchievements(profile.achievements || ['journey_started']);
        console.log(`📦 User profile loaded from Firebase for user ${currentUser.uid.substring(0, 8)}...`);
      } else {
        // Initialize new user with defaults
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

  // ================================
  // LOAD DATA ON USER CHANGE
  // ================================
  useEffect(() => {
    if (currentUser?.uid) {
      loadFromFirebase();
    } else {
      // Reset to defaults when no user
      setUserProfile(null);
      setAchievements([]);
    }
  }, [currentUser?.uid, loadFromFirebase]);

  // ================================
  // REAL-TIME FIREBASE LISTENER
  // ================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDocRef = doc(db, 'userProfiles', currentUser.uid);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        console.log(`🔄 Real-time profile update for user ${currentUser.uid.substring(0, 8)}...`);
        setUserProfile(data);
        setAchievements(data.achievements || ['journey_started']);
      }
    }, (error) => {
      console.error('❌ Firebase listener error:', error);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // ================================
  // PROFILE MANAGEMENT METHODS (FIREBASE-ONLY)
  // ================================
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const updatePreferences = useCallback(async (preferences: Partial<UserProfile['preferences']>) => {
    if (!userProfile?.preferences) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        ...preferences
      },
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const updateProgress = useCallback(async (progress: Partial<UserProfile['currentProgress']>) => {
    if (!userProfile?.currentProgress) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      currentProgress: {
        ...userProfile.currentProgress,
        ...progress
      },
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  // ================================
  // ✅ AUDIT COMPLIANCE - STAGE MANAGEMENT METHODS (FIREBASE-ONLY)
  // ================================
  const updateStageProgress = useCallback(async (stageData: Partial<UserProfile['stageProgress']>) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      stageProgress: {
        ...userProfile.stageProgress,
        ...stageData
      } as UserProfile['stageProgress'],
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const markStageComplete = useCallback(async (stage: number) => {
    if (!userProfile?.stageProgress) return;

    const stageKey = `stage${stage}Complete`;
    const updatedStageProgress = {
      ...userProfile.stageProgress,
      completedStages: [...(userProfile.stageProgress.completedStages || []), stage],
      stageCompletionFlags: {
        ...userProfile.stageProgress.stageCompletionFlags,
        [stageKey]: true
      }
    };

    await updateStageProgress(updatedStageProgress);
  }, [userProfile, updateStageProgress]);

  const addStageHours = useCallback(async (stage: number, hours: number) => {
    if (!userProfile?.stageProgress) return;

    const stageKey = `stage${stage}Hours`;
    const currentHours = userProfile.stageProgress.stageHours[stageKey] || 0;

    const updatedStageProgress = {
      ...userProfile.stageProgress,
      stageHours: {
        ...userProfile.stageProgress.stageHours,
        [stageKey]: currentHours + hours
      }
    };

    await updateStageProgress(updatedStageProgress);
  }, [userProfile, updateStageProgress]);

  const markStageIntroComplete = useCallback(async (stageIntro: string) => {
    if (!userProfile?.stageProgress) return;

    const currentIntros = userProfile.stageProgress.completedStageIntros || [];
    if (currentIntros.includes(stageIntro)) return;

    const updatedStageProgress = {
      ...userProfile.stageProgress,
      completedStageIntros: [...currentIntros, stageIntro]
    };

    await updateStageProgress(updatedStageProgress);
  }, [userProfile, updateStageProgress]);

  const setT5Completed = useCallback(async (completed: boolean) => {
    if (!userProfile?.stageProgress) return;

    const updatedStageProgress = {
      ...userProfile.stageProgress,
      t5Completed: completed
    };

    await updateStageProgress(updatedStageProgress);
  }, [userProfile, updateStageProgress]);

  // ================================
  // ✅ NEW - HAPPINESS POINTS METHODS (FIREBASE-ONLY)
  // ================================
  const updateHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      happiness_points: points,
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  const addHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;

    const currentPoints = userProfile.happiness_points || 0;
    const newPoints = currentPoints + points;

    await updateHappinessPoints(newPoints);
  }, [userProfile, updateHappinessPoints]);

  // ================================
  // ACHIEVEMENT MANAGEMENT (FIREBASE-ONLY)
  // ================================
  const addAchievement = useCallback(async (achievement: string) => {
    if (achievements.includes(achievement)) return;

    const updatedAchievements = [...achievements, achievement];
    setAchievements(updatedAchievements); // Optimistic UI update

    if (userProfile) {
      const updatedProfile = { 
        ...userProfile, 
        achievements: updatedAchievements,
        updatedAt: new Date().toISOString()
      };
      setUserProfile(updatedProfile);
      await saveToFirebase(updatedProfile);
    }
  }, [achievements, userProfile, saveToFirebase]);

  const getAchievements = useCallback((): string[] => {
    return achievements;
  }, [achievements]);

  const hasAchievement = useCallback((achievement: string): boolean => {
    return achievements.includes(achievement);
  }, [achievements]);

  // ================================
  // SYNC PROFILE (FIREBASE-ONLY)
  // ================================
  const syncProfile = useCallback(async (sessionData?: any) => {
    if (!userProfile || !sessionData) return;

    const { totalSessions, totalMinutes, averageQuality, averagePresentPercentage, currentStreak, longestStreak } = sessionData;

    const updatedProfile: UserProfile = {
      ...userProfile,
      totalSessions: totalSessions ?? userProfile.totalSessions,
      totalMinutes: totalMinutes ?? userProfile.totalMinutes,
      averageQuality: averageQuality ?? userProfile.averageQuality,
      averagePresentPercentage: averagePresentPercentage ?? userProfile.averagePresentPercentage,
      currentStreak: currentStreak ?? userProfile.currentStreak,
      longestStreak: longestStreak ?? userProfile.longestStreak,

      currentProgress: userProfile.currentProgress ? {
        ...userProfile.currentProgress,
        totalSessions: totalSessions ?? userProfile.currentProgress.totalSessions,
        totalMinutes: totalMinutes ?? userProfile.currentProgress.totalMinutes,
        averageQuality: averageQuality ?? userProfile.currentProgress.averageQuality,
        averagePresentPercentage: averagePresentPercentage ?? userProfile.currentProgress.averagePresentPercentage,
        currentStreak: currentStreak ?? userProfile.currentProgress.currentStreak,
        longestStreak: longestStreak ?? userProfile.currentProgress.longestStreak
      } : userProfile.currentProgress,

      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToFirebase(updatedProfile);
  }, [userProfile, saveToFirebase]);

  // ================================
  // UTILITY METHODS (FIREBASE-ONLY)
  // ================================
  const clearUserData = useCallback(async () => {
    const defaultProfile = createDefaultProfile();
    const defaultAchievements = ['journey_started'];

    setUserProfile(defaultProfile);
    setAchievements(defaultAchievements);

    // Clear Firebase data
    if (currentUser?.uid) {
      try {
        await deleteDoc(doc(db, 'userProfiles', currentUser.uid));
        console.log(`🧹 User data cleared in Firebase for user ${currentUser.uid.substring(0, 8)}...`);
        
        // Save default profile back to Firebase
        await saveToFirebase(defaultProfile);
      } catch (error) {
        console.error('❌ Error clearing user data in Firebase:', error);
      }
    }
  }, [createDefaultProfile, currentUser?.uid, saveToFirebase]);

  const exportUserData = useCallback(() => {
    return {
      profile: userProfile,
      achievements: achievements,
      exportedAt: new Date().toISOString(),
      source: 'firebase_only'
    };
  }, [userProfile, achievements]);

  // ================================
  // CONTEXT VALUE (UNCHANGED)
  // ================================
  const contextValue: UserContextType = useMemo(() => ({
    // Data
    userProfile,
    achievements,
    isLoading,

    // Profile methods
    updateProfile,
    updatePreferences,
    updateProgress,

    // ✅ Stage management methods
    updateStageProgress,
    markStageComplete,
    addStageHours,
    markStageIntroComplete,
    setT5Completed,

    // ✅ NEW - Happiness Points methods
    updateHappinessPoints,
    addHappinessPoints,

    // Achievement methods
    addAchievement,
    getAchievements,
    hasAchievement,

    // Utility methods
    clearUserData,
    exportUserData,
    syncProfile
  }), [
    userProfile, achievements, isLoading,
    updateProfile, updatePreferences, updateProgress,
    updateStageProgress, markStageComplete, addStageHours, markStageIntroComplete, setT5Completed,
    updateHappinessPoints, addHappinessPoints,
    addAchievement, getAchievements, hasAchievement,
    clearUserData, exportUserData, syncProfile
  ]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// ================================
// CUSTOM HOOK (UNCHANGED)
// ================================
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;