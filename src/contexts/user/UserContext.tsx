// src/contexts/user/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

// ================================
// USER PROFILE INTERFACES
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
}

interface UserContextType {
  // Data
  userProfile: UserProfile | null;
  achievements: string[];
  isLoading: boolean;
  
  // Profile methods
  updateProfile: (updates: Partial<UserProfile>) => void;
  updatePreferences: (preferences: Partial<UserProfile['preferences']>) => void;
  updateProgress: (progress: Partial<UserProfile['currentProgress']>) => void;
  
  // Achievement methods
  addAchievement: (achievement: string) => void;
  getAchievements: () => string[];
  hasAchievement: (achievement: string) => boolean;
  
  // Utility methods
  clearUserData: () => void;
  exportUserData: () => any;
  syncProfile: (sessionData?: any) => void;
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

  // ================================
  // STABLE STORAGE UTILITIES
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
      }
    };
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // ================================
  // ✅ FIXED: PREVENT CASCADING SAVES
  // ================================
  const saveToStorage = useCallback((profile: UserProfile, userAchievements: string[]) => {
    try {
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();
      
      localStorage.setItem(storageKey, JSON.stringify(profile));
      localStorage.setItem(achievementsKey, JSON.stringify(userAchievements));
      
      // Legacy compatibility
      if (currentUser) {
        localStorage.setItem('userProfile', JSON.stringify(profile));
        localStorage.setItem('achievements', JSON.stringify(userAchievements));
      }
      
      // ✅ CRITICAL FIX: Prevent infinite loops by NOT calling syncWithLocalData here
      // Let the caller decide when to sync
    } catch (error) {
      console.warn('Failed to save user data:', error);
    }
  }, [getStorageKey, getAchievementsKey, currentUser]);

  // ================================
  // ✅ FIXED: STABLE LOAD FUNCTION
  // ================================
  const loadFromStorage = useCallback(() => {
    setIsLoading(true);
    
    try {
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();
      
      const profileData = localStorage.getItem(storageKey);
      const achievementsData = localStorage.getItem(achievementsKey);
      
      if (profileData) {
        const profile = JSON.parse(profileData);
        setUserProfile(profile);
      } else {
        const defaultProfile = createDefaultProfile();
        setUserProfile(defaultProfile);
        // ✅ Save without triggering sync
        saveToStorage(defaultProfile, ['journey_started']);
      }
      
      if (achievementsData) {
        setAchievements(JSON.parse(achievementsData));
      } else {
        const defaultAchievements = ['journey_started'];
        setAchievements(defaultAchievements);
      }
    } catch (error) {
      console.warn('Failed to load user data:', error);
      const defaultProfile = createDefaultProfile();
      const defaultAchievements = ['journey_started'];
      setUserProfile(defaultProfile);
      setAchievements(defaultAchievements);
      saveToStorage(defaultProfile, defaultAchievements);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey, getAchievementsKey, createDefaultProfile, saveToStorage]);

  // ================================
  // PROFILE MANAGEMENT METHODS
  // ================================
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    if (!userProfile) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      ...updates
    };
    
    setUserProfile(updatedProfile);
    saveToStorage(updatedProfile, achievements);
    
    // ✅ CONTROLLED SYNC: Only sync when explicitly updating
    if (currentUser && syncWithLocalData) {
      setTimeout(() => syncWithLocalData(), 100);
    }
  }, [userProfile, achievements, saveToStorage, currentUser, syncWithLocalData]);

  const updatePreferences = useCallback((preferences: Partial<UserProfile['preferences']>) => {
    if (!userProfile?.preferences) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      preferences: {
        ...userProfile.preferences,
        ...preferences
      }
    };
    
    setUserProfile(updatedProfile);
    saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

  const updateProgress = useCallback((progress: Partial<UserProfile['currentProgress']>) => {
    if (!userProfile?.currentProgress) return;
    
    const updatedProfile: UserProfile = {
      ...userProfile,
      currentProgress: {
        ...userProfile.currentProgress,
        ...progress
      }
    };
    
    setUserProfile(updatedProfile);
    saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

  // ================================
  // ACHIEVEMENT MANAGEMENT
  // ================================
  const addAchievement = useCallback((achievement: string) => {
    if (achievements.includes(achievement)) return;
    
    const updatedAchievements = [...achievements, achievement];
    setAchievements(updatedAchievements);
    
    if (userProfile) {
      saveToStorage(userProfile, updatedAchievements);
    }
  }, [achievements, userProfile, saveToStorage]);

  const getAchievements = useCallback((): string[] => {
    return achievements;
  }, [achievements]);

  const hasAchievement = useCallback((achievement: string): boolean => {
    return achievements.includes(achievement);
  }, [achievements]);

  // ================================
  // ✅ FIXED: SYNC PROFILE WITHOUT CASCADING
  // ================================
  const syncProfile = useCallback((sessionData?: any) => {
    if (!userProfile || !sessionData) return;
    
    // This will be called by PracticeContext when sessions are updated
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
      } : userProfile.currentProgress
    };
    
    setUserProfile(updatedProfile);
    // ✅ CRITICAL: Don't trigger cascading saves - just save silently
    saveToStorage(updatedProfile, achievements);
  }, [userProfile, achievements, saveToStorage]);

  // ================================
  // UTILITY METHODS
  // ================================
  const clearUserData = useCallback(() => {
    const defaultProfile = createDefaultProfile();
    const defaultAchievements = ['journey_started'];
    
    setUserProfile(defaultProfile);
    setAchievements(defaultAchievements);
    
    try {
      const storageKey = getStorageKey();
      const achievementsKey = getAchievementsKey();
      
      localStorage.removeItem(storageKey);
      localStorage.removeItem(achievementsKey);
      localStorage.removeItem('userProfile');
      localStorage.removeItem('achievements');
    } catch (error) {
      console.warn('Failed to clear user data:', error);
    }
    
    saveToStorage(defaultProfile, defaultAchievements);
  }, [createDefaultProfile, getStorageKey, getAchievementsKey, saveToStorage]);

  const exportUserData = useCallback(() => {
    return {
      profile: userProfile,
      achievements: achievements,
      exportedAt: new Date().toISOString()
    };
  }, [userProfile, achievements]);

  // ================================
  // ✅ FIXED: EFFECTS WITH STABLE DEPENDENCIES
  // ================================
  useEffect(() => {
    loadFromStorage();
  }, [currentUser?.uid]); // ✅ CRITICAL FIX: Only depend on uid, not the entire loadFromStorage function

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