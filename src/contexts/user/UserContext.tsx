import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

// ================================
// FIREBASE IMPORTS - Ensure these are correct and complete
// ================================
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase'; // Assuming your firebase config is exported as 'db'

// ================================
// USER PROFILE INTERFACES (Copied from your provided code)
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
// USER PROVIDER IMPLEMENTATION
// ================================
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Keep error state for UI feedback

  // ================================
  // FIREBASE UTILITIES (Copied from your provided code)
  // ================================
  const getUserProfileDoc = useCallback(() => {
    if (!currentUser?.uid) return null;
    return doc(db, 'users', currentUser.uid);
  }, [currentUser?.uid]);

  // NOTE: Your provided code uses a separate 'achievements' subcollection. 
  // For simplicity and to keep user profile and achievements together in one document 
  // (which is generally better for single-user data), I'm assuming achievements 
  // will be part of the main user profile document. If you specifically need 
  // a separate subcollection for achievements, let me know, and I can adjust.
  // For now, getUserAchievementsDoc is removed as achievements are in UserProfile.

  // ================================
  // STORAGE UTILITIES - Simplified as Firestore is primary
  // ================================
  const getStorageKey = useCallback((): string => {
    return currentUser?.uid ? `userProfile_${currentUser.uid}` : 'userProfile';
  }, [currentUser?.uid]);

  const getAchievementsKey = useCallback((): string => {
    return currentUser?.uid ? `achievements_${currentUser.uid}` : 'achievements';
  }, [currentUser?.uid]);

  // ================================
  // CREATE DEFAULT PROFILE - STABLE (Copied from your provided code)
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
  // FIREBASE OPERATIONS (Adjusted for single user doc)
  // ================================
  const saveProfileToFirestore = useCallback(async (profile: UserProfile): Promise<void> => {
    if (!currentUser?.uid) return;

    try {
      const userDoc = getUserProfileDoc();
      if (!userDoc) return;

      const firestoreData = {
        ...profile,
        updatedAt: serverTimestamp(),
        createdAt: profile.createdAt || serverTimestamp() // Only set createdAt if not already present
      };

      await setDoc(userDoc, firestoreData, { merge: true });
      console.log('✅ User profile saved to Firestore');
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('❌ Error saving profile to Firestore:', error);
      setError('Failed to save profile to cloud. Data saved locally.');
      throw error; // Re-throw to allow local fallback if needed
    }
  }, [currentUser?.uid, getUserProfileDoc]);

  const loadFromFirestore = useCallback(async (): Promise<{ profile: UserProfile | null }> => {
    if (!currentUser?.uid) {
      return { profile: null };
    }

    try {
      const userDoc = getUserProfileDoc();
      if (!userDoc) {
        return { profile: null };
      }

      const profileSnap = await getDoc(userDoc);

      const profile = profileSnap.exists() ? profileSnap.data() as UserProfile : null;

      console.log('✅ Data loaded from Firestore');
      return { profile };
    } catch (error) {
      console.error('❌ Error loading from Firestore:', error);
      setError('Failed to load from cloud. Using local data as fallback.');
      return { profile: null };
    }
  }, [currentUser?.uid, getUserProfileDoc]);

  // ================================
  // UNIFIED STORAGE SYSTEM (Adjusted to prioritize Firestore)
  // ================================
  const saveToStorage = useCallback(async (profile: UserProfile) => {
    try {
      // 1. Save to localStorage immediately (for immediate UI update and offline caching)
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();

      localStorage.setItem(storageKey, JSON.stringify(profile));
      localStorage.setItem(achievementsKey, JSON.stringify(profile.achievements || [])); // Save achievements to local storage as well

      // Legacy compatibility
      if (currentUser) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('achievements', JSON.stringify(profile.achievements || []));
      }

      // 2. Save to Firestore (async, with error handling)
      if (currentUser?.uid) {
        try {
          await saveProfileToFirestore(profile);
          setError(null); // Clear any previous errors
        } catch (firestoreError) {
          console.warn('Firestore save failed, data saved locally:', firestoreError);
          // Error already set by saveProfileToFirestore
        }
      }

    } catch (error) {
      console.error('Failed to save user data:', error);
      setError('Failed to save data locally.');
    }
  }, [getStorageKey, getAchievementsKey, currentUser, saveProfileToFirestore]);

  // ================================
  // LOAD FROM STORAGE WITH MIGRATION (Adjusted for real-time listener)
  // ================================
  // This useEffect now primarily sets up the real-time listener
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserProfile(null);
      setAchievements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const userDocRef = getUserProfileDoc();

    if (!userDocRef) {
      setIsLoading(false);
      return;
    }

    console.log('🔄 Setting up real-time Firestore sync...');

    const unsubscribe = onSnapshot(userDocRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        console.log('🔄 Profile updated from Firestore sync');
        setUserProfile(data);
        setAchievements(data.achievements || []);

        // Update localStorage cache
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(data));
        localStorage.setItem('userProfile', JSON.stringify(data)); // Legacy
        localStorage.setItem(getAchievementsKey(), JSON.stringify(data.achievements || []));
        localStorage.setItem('achievements', JSON.stringify(data.achievements || [])); // Legacy

      } else {
        // Document does not exist, check localStorage for migration
        const storageKey = getStorageKey();
        const achievementsKey = getAchievementsKey();

        const profileData = localStorage.getItem(storageKey);
        const achievementsData = localStorage.getItem(achievementsKey);

        let profileToSave: UserProfile;
        let achievementsToSave: string[];

        if (profileData) {
          profileToSave = JSON.parse(profileData);
          achievementsToSave = achievementsData ? JSON.parse(achievementsData) : [];
          console.log('🔄 Migrating localStorage data to Firestore...');
        } else {
          // No data in localStorage either, create default
          profileToSave = createDefaultProfile();
          achievementsToSave = profileToSave.achievements || [];
          console.log('🆕 Creating default profile in Firestore...');
        }

        // Ensure happiness_points field exists for new/migrated profiles
        if (typeof profileToSave.happiness_points === 'undefined') {
          profileToSave.happiness_points = 0;
        }

        // Set achievements in the profile object before saving
        profileToSave.achievements = achievementsToSave;

        // Save the profile (which includes achievements) to Firestore
        await saveProfileToFirestore(profileToSave);
        setUserProfile(profileToSave);
        setAchievements(achievementsToSave);
      }
      setIsLoading(false);
      setError(null); // Clear any errors on successful load/sync
    }, (err) => {
      console.error('❌ Firestore sync error:', err);
      setError('Real-time sync temporarily unavailable. Using local data.');
      setIsLoading(false);

      // Fallback to loading from localStorage if Firestore fails
      try {
        const storageKey = getStorageKey();
        const achievementsKey = getAchievementsKey();

        const profileData = localStorage.getItem(storageKey);
        const achievementsData = localStorage.getItem(achievementsKey);

        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
        if (achievementsData) {
          setAchievements(JSON.parse(achievementsData));
        }
      } catch (localError) {
        console.error('❌ Fallback to localStorage failed:', localError);
        setError('Failed to load any data.');
      }
    });

    return () => {
      unsubscribe();
      console.log('🔄 Firestore sync listener cleaned up');
    };
  }, [currentUser?.uid, getUserProfileDoc, getStorageKey, getAchievementsKey, createDefaultProfile, saveProfileToFirestore]);

  // ================================
  // PROFILE MANAGEMENT METHODS (Adjusted to use saveToStorage)
  // ================================
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToStorage(updatedProfile); // Persist to unified storage

    // Your existing syncWithLocalData call (if still needed for AuthContext)
    if (currentUser && syncWithLocalData) {
      setTimeout(() => syncWithLocalData(), 100);
    }
  }, [userProfile, saveToStorage, currentUser, syncWithLocalData]);

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
    await saveToStorage(updatedProfile); // Persist to unified storage
  }, [userProfile, saveToStorage]);

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
    await saveToStorage(updatedProfile); // Persist to unified storage
  }, [userProfile, saveToStorage]);

  // ================================
  // ✅ AUDIT COMPLIANCE - STAGE MANAGEMENT METHODS (Adjusted to use saveToStorage)
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
    await saveToStorage(updatedProfile); // Persist to unified storage
  }, [userProfile, saveToStorage]);

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
  // ✅ NEW - HAPPINESS POINTS METHODS (Adjusted to use saveToStorage)
  // ================================
  const updateHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;

    const updatedProfile: UserProfile = {
      ...userProfile,
      happiness_points: points,
      updatedAt: new Date().toISOString()
    };

    setUserProfile(updatedProfile); // Optimistic UI update
    await saveToStorage(updatedProfile); // Persist to unified storage
  }, [userProfile, saveToStorage]);

  const addHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;

    const currentPoints = userProfile.happiness_points || 0;
    const newPoints = currentPoints + points;

    await updateHappinessPoints(newPoints);
  }, [userProfile, updateHappinessPoints]);

  // ================================
  // ACHIEVEMENT MANAGEMENT (Adjusted to use saveToStorage)
  // ================================
  const addAchievement = useCallback(async (achievement: string) => {
    if (achievements.includes(achievement)) return;

    const updatedAchievements = [...achievements, achievement];
    setAchievements(updatedAchievements); // Optimistic UI update

    if (userProfile) {
      const updatedProfile = { ...userProfile, achievements: updatedAchievements };
      await saveToStorage(updatedProfile); // Persist to unified storage
    }
  }, [achievements, userProfile, saveToStorage]);

  const getAchievements = useCallback((): string[] => {
    return achievements;
  }, [achievements]);

  const hasAchievement = useCallback((achievement: string): boolean => {
    return achievements.includes(achievement);
  }, [achievements]);

  // ================================
  // SYNC PROFILE (Adjusted to use saveToStorage)
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
    await saveToStorage(updatedProfile); // Persist to unified storage
  }, [userProfile, saveToStorage]);

  // ================================
  // UTILITY METHODS (Adjusted to use Firestore delete)
  // ================================
  const clearUserData = useCallback(async () => {
    const defaultProfile = createDefaultProfile();
    const defaultAchievements = ['journey_started'];

    setUserProfile(defaultProfile);
    setAchievements(defaultAchievements);

    try {
      // Clear from localStorage
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();

      localStorage.removeItem(storageKey);
      localStorage.removeItem(achievementsKey);
      localStorage.removeItem('userProfile'); // Legacy
      localStorage.removeItem('achievements'); // Legacy

      // Clear from Firestore
      if (currentUser?.uid) {
        const userDoc = getUserProfileDoc();
        if (userDoc) {
          await deleteDoc(userDoc); // Delete the entire user document
          console.log('User data cleared from Firestore.');
        }
      }
    } catch (error) {
      console.warn('Failed to clear user data:', error);
      setError('Failed to clear user data completely.');
    }

    // After clearing, save the default profile to Firestore (will be handled by the useEffect listener)
    // No explicit saveToStorage here as the onSnapshot listener will create a default if doc doesn't exist
  }, [createDefaultProfile, getStorageKey, getAchievementsKey, currentUser, getUserProfileDoc]);

  const exportUserData = useCallback(() => {
    return {
      profile: userProfile,
      achievements: achievements,
      exportedAt: new Date().toISOString()
    };
  }, [userProfile, achievements]);

  // ================================
  // CONTEXT VALUE
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
// CUSTOM HOOK
// ================================
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;

