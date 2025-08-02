// src/contexts/user/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

// ================================
// FIREBASE IMPORTS - SIMPLIFIED
// ================================
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase'; // Updated import path to match your firebase.js

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
  const [error, setError] = useState<string | null>(null);

  // ================================
  // FIREBASE UTILITIES
  // ================================
  const getUserProfileDoc = useCallback(() => {
    if (!currentUser?.uid) return null;
    return doc(db, 'users', currentUser.uid);
  }, [currentUser?.uid]);

  const getUserAchievementsDoc = useCallback(() => {
    if (!currentUser?.uid) return null;
    return doc(db, 'users', currentUser.uid, 'data', 'achievements');
  }, [currentUser?.uid]);

  // ================================
  // STORAGE UTILITIES - SIMPLIFIED
  // ================================
  const getStorageKey = useCallback((): string => {
    return currentUser?.uid ? `userProfile_${currentUser.uid}` : 'userProfile';
  }, [currentUser?.uid]);

  const getAchievementsKey = useCallback((): string => {
    return currentUser?.uid ? `achievements_${currentUser.uid}` : 'achievements';
  }, [currentUser?.uid]);

  // ================================
  // CREATE DEFAULT PROFILE - STABLE
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // ================================
  // FIREBASE OPERATIONS
  // ================================
  const saveProfileToFirestore = useCallback(async (profile: UserProfile): Promise<void> => {
    if (!currentUser?.uid) return;
    
    try {
      const userDoc = getUserProfileDoc();
      if (!userDoc) return;

      const firestoreData = {
        ...profile,
        updatedAt: serverTimestamp(),
        createdAt: profile.createdAt || serverTimestamp()
      };

      await setDoc(userDoc, firestoreData, { merge: true });
      console.log('✅ User profile saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving profile to Firestore:', error);
      setError('Failed to save profile. Data saved locally.');
      throw error;
    }
  }, [currentUser?.uid, getUserProfileDoc]);

  const saveAchievementsToFirestore = useCallback(async (userAchievements: string[]): Promise<void> => {
    if (!currentUser?.uid) return;
    
    try {
      const achievementsDoc = getUserAchievementsDoc();
      if (!achievementsDoc) return;

      await setDoc(achievementsDoc, {
        achievements: userAchievements,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Achievements saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving achievements to Firestore:', error);
      setError('Failed to save achievements. Data saved locally.');
      throw error;
    }
  }, [currentUser?.uid, getUserAchievementsDoc]);

  const loadFromFirestore = useCallback(async (): Promise<{ profile: UserProfile | null, achievements: string[] }> => {
    if (!currentUser?.uid) {
      return { profile: null, achievements: [] };
    }
    
    try {
      const userDoc = getUserProfileDoc();
      const achievementsDoc = getUserAchievementsDoc();
      
      if (!userDoc || !achievementsDoc) {
        return { profile: null, achievements: [] };
      }

      const [profileSnap, achievementsSnap] = await Promise.all([
        getDoc(userDoc),
        getDoc(achievementsDoc)
      ]);

      const profile = profileSnap.exists() ? profileSnap.data() as UserProfile : null;
      const achievements = achievementsSnap.exists() ? achievementsSnap.data().achievements : [];

      console.log('✅ Data loaded from Firestore');
      return { profile, achievements };
    } catch (error) {
      console.error('❌ Error loading from Firestore:', error);
      setError('Failed to load from cloud. Using local data.');
      return { profile: null, achievements: [] };
    }
  }, [currentUser?.uid, getUserProfileDoc, getUserAchievementsDoc]);

  // ================================
  // UNIFIED STORAGE SYSTEM
  // ================================
  const saveToStorage = useCallback(async (profile: UserProfile, userAchievements: string[]) => {
    try {
      // 1. Save to localStorage immediately (for immediate UI update)
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();
      
      localStorage.setItem(storageKey, JSON.stringify(profile));
      localStorage.setItem(achievementsKey, JSON.stringify(userAchievements));
      
      // Legacy compatibility
      if (currentUser) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('achievements', JSON.stringify(userAchievements));
      }
      
      // 2. Save to Firestore (async, with error handling)
      if (currentUser?.uid) {
        try {
          await Promise.all([
            saveProfileToFirestore(profile),
            saveAchievementsToFirestore(userAchievements)
          ]);
          setError(null); // Clear any previous errors
        } catch (firestoreError) {
          console.warn('Firestore save failed, data saved locally:', firestoreError);
          // Data is still saved locally, so app continues to work
        }
      }
      
    } catch (error) {
      console.error('Failed to save user data:', error);
      setError('Failed to save data');
    }
  }, [getStorageKey, getAchievementsKey, currentUser, saveProfileToFirestore, saveAchievementsToFirestore]);

  // ================================
  // LOAD FROM STORAGE WITH MIGRATION
  // ================================
  const loadFromStorage = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let profile: UserProfile | null = null;
      let loadedAchievements: string[] = [];

      // 1. Try to load from Firestore first (if user is authenticated)
      if (currentUser?.uid) {
        const firestoreData = await loadFromFirestore();
        profile = firestoreData.profile;
        loadedAchievements = firestoreData.achievements;
      }

      // 2. Fall back to localStorage if Firestore fails or user not authenticated
      if (!profile) {
        const storageKey = getStorageKey();
        const achievementsKey = getAchievementsKey();
        
        const profileData = localStorage.getItem(storageKey);
        const achievementsData = localStorage.getItem(achievementsKey);
        
        if (profileData) {
          profile = JSON.parse(profileData);
        }
        
        if (achievementsData) {
          loadedAchievements = JSON.parse(achievementsData);
        }

        // 3. Migrate localStorage data to Firestore if user is authenticated
        if (profile && currentUser?.uid) {
          console.log('🔄 Migrating localStorage data to Firestore...');
          await saveToStorage(profile, loadedAchievements);
        }
      }

      // 4. Create default if nothing found
      if (!profile) {
        profile = createDefaultProfile();
        loadedAchievements = ['journey_started'];
        await saveToStorage(profile, loadedAchievements);
      }

      // 5. Ensure happiness_points field exists (migration)
      if (profile && typeof profile.happiness_points === 'undefined') {
        profile.happiness_points = 0;
        await saveToStorage(profile, loadedAchievements);
      }

      // 6. Update state
      setUserProfile(profile);
      setAchievements(loadedAchievements);

    } catch (error) {
      console.error('Failed to load user data:', error);
      setError('Failed to load user data');
      const defaultProfile = createDefaultProfile();
      const defaultAchievements = ['journey_started'];
      setUserProfile(defaultProfile);
      setAchievements(defaultAchievements);
      await saveToStorage(defaultProfile, defaultAchievements);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, getStorageKey, getAchievementsKey, createDefaultProfile, saveToStorage, loadFromFirestore]);

  // ================================
  // PROFILE MANAGEMENT METHODS (UNCHANGED FUNCTIONALITY)
  // ================================
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    setUserProfile(updatedProfile);
    await saveToStorage(updatedProfile, achievements);
    
    if (currentUser && syncWithLocalData) {
      setTimeout(() => syncWithLocalData(), 100);
    }
  }, [userProfile, achievements, saveToStorage, currentUser, syncWithLocalData]);

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
    
    setUserProfile(updatedProfile);
    await saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

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
    
    setUserProfile(updatedProfile);
    await saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

  // ================================
  // ✅ AUDIT COMPLIANCE - STAGE MANAGEMENT METHODS (UNCHANGED)
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
    
    setUserProfile(updatedProfile);
    await saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

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
  // ✅ NEW - HAPPINESS POINTS METHODS
  // ================================
  const updateHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      happiness_points: points,
      updatedAt: new Date().toISOString()
    };
    
    setUserProfile(updatedProfile);
    await saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

  const addHappinessPoints = useCallback(async (points: number) => {
    if (!userProfile) return;
    
    const currentPoints = userProfile.happiness_points || 0;
    const newPoints = currentPoints + points;
    
    await updateHappinessPoints(newPoints);
  }, [userProfile, updateHappinessPoints]);

  // ================================
  // ACHIEVEMENT MANAGEMENT (UNCHANGED)
  // ================================
  const addAchievement = useCallback(async (achievement: string) => {
    if (achievements.includes(achievement)) return;
    
    const updatedAchievements = [...achievements, achievement];
    setAchievements(updatedAchievements);
    
    if (userProfile) {
      await saveToStorage(userProfile, updatedAchievements);
    }
  }, [achievements, userProfile, saveToStorage]);

  const getAchievements = useCallback((): string[] => {
    return achievements;
  }, [achievements]);

  const hasAchievement = useCallback((achievement: string): boolean => {
    return achievements.includes(achievement);
  }, [achievements]);

  // ================================
  // SYNC PROFILE (UNCHANGED)
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
    
    setUserProfile(updatedProfile);
    await saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

  // ================================
  // UTILITY METHODS (UNCHANGED)
  // ================================
  const clearUserData = useCallback(async () => {
    const defaultProfile = createDefaultProfile();
    const defaultAchievements = ['journey_started'];
    
    setUserProfile(defaultProfile);
    setAchievements(defaultAchievements);
    
    try {
      // Clear localStorage
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();
      
      localStorage.removeItem(storageKey);
      localStorage.removeItem(achievementsKey);
      localStorage.removeItem('userProfile');
      localStorage.removeItem('achievements');

      // Clear Firestore
      if (currentUser?.uid) {
        const userDoc = getUserProfileDoc();
        const achievementsDoc = getUserAchievementsDoc();
        
        if (userDoc) await deleteDoc(userDoc);
        if (achievementsDoc) await deleteDoc(achievementsDoc);
      }
    } catch (error) {
      console.warn('Failed to clear user data:', error);
    }
    
    await saveToStorage(defaultProfile, defaultAchievements);
  }, [createDefaultProfile, getStorageKey, getAchievementsKey, currentUser, getUserProfileDoc, getUserAchievementsDoc, saveToStorage]);

  const exportUserData = useCallback(() => {
    return {
      profile: userProfile,
      achievements: achievements,
      exportedAt: new Date().toISOString()
    };
  }, [userProfile, achievements]);

  // ================================
  // REAL-TIME SYNC SETUP
  // ================================
  useEffect(() => {
    if (!currentUser?.uid) return;

    const userDoc = getUserProfileDoc();
    const achievementsDoc = getUserAchievementsDoc();
    
    if (!userDoc || !achievementsDoc) return;

    console.log('🔄 Setting up real-time Firestore sync...');

    const unsubscribeProfile = onSnapshot(userDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as UserProfile;
        console.log('🔄 Profile updated from Firestore sync');
        setUserProfile(data);
        
        // Update localStorage cache
        const storageKey = getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(data));
        localStorage.setItem('userProfile', JSON.stringify(data));
      }
    }, (error) => {
      console.error('❌ Profile sync error:', error);
      setError('Real-time sync temporarily unavailable');
    });

    const unsubscribeAchievements = onSnapshot(achievementsDoc, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        console.log('🔄 Achievements updated from Firestore sync');
        setAchievements(data.achievements || []);
        
        // Update localStorage cache
        const achievementsKey = getAchievementsKey();
        localStorage.setItem(achievementsKey, JSON.stringify(data.achievements || []));
        localStorage.setItem('achievements', JSON.stringify(data.achievements || []));
      }
    }, (error) => {
      console.error('❌ Achievements sync error:', error);
      setError('Real-time sync temporarily unavailable');
    });

    return () => {
      unsubscribeProfile();
      unsubscribeAchievements();
      console.log('🔄 Firestore sync listeners cleaned up');
    };
  }, [currentUser?.uid, getUserProfileDoc, getUserAchievementsDoc, getStorageKey, getAchievementsKey]);

  // ================================
  // LOAD DATA ON USER CHANGE
  // ================================
  useEffect(() => {
    loadFromStorage();
  }, [currentUser?.uid]);

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