import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './utils/firebase-config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { apiService } from './services/api';

// 🏆 ENHANCED USER INTERFACE - Backward Compatible + TypeScript Fixed
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  experienceLevel: string;
  goals: string[];
  practiceTime: number;
  frequency: string;
  assessmentCompleted: boolean;
  currentStage: string;
  questionnaireCompleted: boolean;
  questionnaireAnswers?: any;
  selfAssessmentData?: any;
  
  // 🔥 FIXED: Enhanced data structure (properly typed)
  enhancedProfile?: {
    onboardingData: {
      questionnaireAnswers: any;
      selfAssessmentResults: any;
      questionnaireCompleted: boolean;
      assessmentCompleted: boolean;
      onboardingCompletedAt: string | null;
    };
    preferences: {
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
    currentProgress: {
      currentStage: number;
      currentTLevel: string;
      totalSessions: number;
      totalMinutes: number;
      longestStreak: number;
      currentStreak: number;
      averageQuality: number;
      averagePresentPercentage: number;
    };
  };
}

interface AuthContextType {
  currentUser: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileInContext: (updates: Partial<AppUser>) => void;
  
  // 🔥 NEW: Enhanced methods for better data management
  syncWithLocalData: (localData: any) => void;
  getUserStorageKey: () => string;
  
  // 🔥 BACKWARD COMPATIBILITY: Keep existing interface
  firebaseUser: User | null; // Access to Firebase user object
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔥 GET USER-SPECIFIC STORAGE KEY
  const getUserStorageKey = (): string => {
    return firebaseUser?.uid ? `userProfile_${firebaseUser.uid}` : 'userProfile';
  };

  // 🔥 FIXED: Update user profile with proper TypeScript handling
  const updateUserProfileInContext = (updates: Partial<AppUser>): void => {
    if (currentUser) {
      // Create a properly typed updated user
      const updatedUser: AppUser = { 
        ...currentUser, 
        ...updates 
      };
      
      // 🔥 FIXED: Handle enhancedProfile updates properly
      if (updates.questionnaireAnswers !== undefined || updates.selfAssessmentData !== undefined) {
        const defaultPreferences = {
          defaultSessionDuration: 20,
          reminderEnabled: true,
          favoriteStages: [1],
          optimalPracticeTime: "morning",
          notifications: {
            dailyReminder: true,
            streakReminder: true,
            weeklyProgress: true
          }
        };

        const defaultProgress = {
          currentStage: parseInt(updatedUser.currentStage) || 1,
          currentTLevel: updatedUser.experienceLevel || "Beginner",
          totalSessions: 0,
          totalMinutes: 0,
          longestStreak: 0,
          currentStreak: 0,
          averageQuality: 0,
          averagePresentPercentage: 0
        };

        // 🔥 FIXED: Ensure preferences and currentProgress are always defined
        updatedUser.enhancedProfile = {
          onboardingData: {
            questionnaireAnswers: updates.questionnaireAnswers ?? currentUser.questionnaireAnswers,
            selfAssessmentResults: updates.selfAssessmentData ?? currentUser.selfAssessmentData,
            questionnaireCompleted: updates.questionnaireCompleted ?? currentUser.questionnaireCompleted,
            assessmentCompleted: updates.assessmentCompleted ?? currentUser.assessmentCompleted,
            onboardingCompletedAt: (updates.questionnaireCompleted && updates.assessmentCompleted) 
              ? new Date().toISOString() 
              : currentUser.enhancedProfile?.onboardingData?.onboardingCompletedAt || null
          },
          preferences: currentUser.enhancedProfile?.preferences || defaultPreferences,
          currentProgress: currentUser.enhancedProfile?.currentProgress || defaultProgress
        };
      }
      
      setCurrentUser(updatedUser);
      
      // Save to user-specific localStorage key
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updatedUser));
      
      console.log('✅ User profile updated in AuthContext');
    }
  };

  // 🔥 FIXED: Sync with LocalDataContext - Better error handling
  const syncWithLocalData = (localData: any): void => {
    if (!currentUser || !localData) {
      console.log('⚠️ Cannot sync - missing currentUser or localData');
      return;
    }

    try {
      // Simple sync without complex enhanced profile - avoid TypeScript issues
      const syncedUser: AppUser = {
        ...currentUser,
        // Only sync basic data to avoid type conflicts
        currentStage: localData.profile?.currentProgress?.currentStage?.toString() || currentUser.currentStage,
        experienceLevel: localData.profile?.currentProgress?.currentTLevel || currentUser.experienceLevel,
        
        // 🔥 FIXED: Properly sync enhancedProfile if it exists
        enhancedProfile: currentUser.enhancedProfile ? {
          ...currentUser.enhancedProfile,
          currentProgress: {
            ...currentUser.enhancedProfile.currentProgress,
            ...localData.profile?.currentProgress
          },
          preferences: {
            ...currentUser.enhancedProfile.preferences,
            ...localData.profile?.preferences
          }
        } : undefined
      };
      
      setCurrentUser(syncedUser);
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(syncedUser));
      
      console.log('✅ AuthContext synced with LocalDataContext');
    } catch (error) {
      console.error('❌ Error syncing with LocalDataContext:', error);
    }
  };

  // 🔥 ENHANCED LOGIN - Better data handling + Error handling
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      // Get user profile from API
      const userProfile = await apiService.getUserProfile();
      
      // Check for saved profile in user-specific localStorage
      const userStorageKey = `userProfile_${user.uid}`;
      const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
      let mergedProfile = userProfile.data;
      
      if (savedProfile) {
        try {
          const parsedSavedProfile = JSON.parse(savedProfile);
          mergedProfile = {
            ...userProfile.data,
            questionnaireCompleted: parsedSavedProfile.questionnaireCompleted || userProfile.data.questionnaireCompleted,
            assessmentCompleted: parsedSavedProfile.assessmentCompleted || userProfile.data.assessmentCompleted,
            questionnaireAnswers: parsedSavedProfile.questionnaireAnswers || userProfile.data.questionnaireAnswers,
            selfAssessmentData: parsedSavedProfile.selfAssessmentData || userProfile.data.selfAssessmentData,
            enhancedProfile: parsedSavedProfile.enhancedProfile || undefined
          };
        } catch (parseError) {
          console.error('Error parsing saved profile:', parseError);
          // Continue with API data if parsing fails
        }
      }
      
      setCurrentUser(mergedProfile as AppUser);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      console.log('✅ User logged in successfully');
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.message || 'Failed to sign in');
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // 🔥 ENHANCED SIGNUP - Better data structure + Better error handling
  const signup = async (email: string, password: string, displayName: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      await updateProfile(user, { displayName });
      
      // 🔥 ENHANCED: Create user with better structure - TYPESCRIPT SAFE
      const newUserProfile: AppUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        experienceLevel: '',
        goals: [],
        practiceTime: 0,
        frequency: '',
        assessmentCompleted: false,
        currentStage: 'questionnaire',
        questionnaireCompleted: false,
        questionnaireAnswers: null,
        selfAssessmentData: null,
        
        // 🔥 FIXED: Enhanced profile structure - FULLY DEFINED with proper types
        enhancedProfile: {
          onboardingData: {
            questionnaireAnswers: null,
            selfAssessmentResults: null,
            questionnaireCompleted: false,
            assessmentCompleted: false,
            onboardingCompletedAt: null
          },
          preferences: {
            defaultSessionDuration: 20,
            reminderEnabled: true,
            favoriteStages: [1],
            optimalPracticeTime: "morning",
            notifications: {
              dailyReminder: true,
              streakReminder: true,
              weeklyProgress: true
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
            averagePresentPercentage: 0
          }
        }
      };
      
      // 🔥 FIXED: Handle API errors gracefully
      try {
        await apiService.createUserProfile(newUserProfile);
      } catch (apiError) {
        console.error('API error creating profile, continuing with local data:', apiError);
        // Continue even if API fails - user can still use the app
      }
      
      setCurrentUser(newUserProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      console.log('✅ User signed up successfully');
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || 'Failed to create account');
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // 🔥 ENHANCED LOGOUT - Clean user-specific data + Better error handling
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      
      // Clean up user-specific storage but keep the general key for backward compatibility
      if (firebaseUser?.uid) {
        localStorage.removeItem(`userProfile_${firebaseUser.uid}`);
      }
      localStorage.removeItem('userProfile');
      
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout locally even if Firebase logout fails
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
    }
  };

  // 🔥 ENHANCED AUTH STATE LISTENER - Better error handling
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        setFirebaseUser(user);
        try {
          // Check user-specific localStorage first
          const userStorageKey = `userProfile_${user.uid}`;
          const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
          
          if (savedProfile) {
            try {
              const parsedProfile = JSON.parse(savedProfile);
              setCurrentUser(parsedProfile);
              setIsAuthenticated(true);
              console.log('✅ User profile loaded from localStorage');
            } catch (parseError) {
              console.error('Error parsing saved profile, falling back to API:', parseError);
              // Fall through to API call
              throw parseError;
            }
          } else {
            // Fallback to API
            try {
              const userProfile = await apiService.getUserProfile();
              setCurrentUser(userProfile.data as AppUser);
              setIsAuthenticated(true);
              console.log('✅ User profile loaded from API');
            } catch (apiError) {
              console.error('Error loading from API, creating minimal profile:', apiError);
              // Create minimal profile if API fails
              const minimalProfile: AppUser = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'User',
                experienceLevel: '',
                goals: [],
                practiceTime: 0,
                frequency: '',
                assessmentCompleted: false,
                currentStage: 'questionnaire',
                questionnaireCompleted: false,
                questionnaireAnswers: null,
                selfAssessmentData: null
              };
              setCurrentUser(minimalProfile);
              setIsAuthenticated(true);
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setCurrentUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setCurrentUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // 🎯 CONTEXT VALUE - Enhanced but backward compatible
  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateUserProfileInContext,
    
    // 🔥 NEW: Enhanced methods
    syncWithLocalData,
    getUserStorageKey,
    firebaseUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
