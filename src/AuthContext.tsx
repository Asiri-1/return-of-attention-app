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
// 🔧 REMOVED: import { apiService } from './services/api';

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
  syncWithLocalData: (localData: any) => void;
  getUserStorageKey: () => string;
  firebaseUser: User | null;
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

  // 🔧 ADMIN EMAIL CONSTANT
  const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';

  // Get user-specific storage key
  const getUserStorageKey = (): string => {
    return firebaseUser?.uid ? `userProfile_${firebaseUser.uid}` : 'userProfile';
  };

  // 🔧 HELPER: Check if user is admin
  const isAdminUser = (email: string): boolean => {
    return email === ADMIN_EMAIL;
  };

  // 🔧 HELPER: Get completion status with admin bypass
  const getCompletionStatus = (user: User, savedProfile?: any): { questionnaireCompleted: boolean; assessmentCompleted: boolean } => {
    // Admin users automatically have everything completed
    if (isAdminUser(user.email || '')) {
      console.log('🔑 Admin user detected - marking all as completed');
      return {
        questionnaireCompleted: true,
        assessmentCompleted: true
      };
    }

    // For regular users, check saved profile or default to false
    if (savedProfile) {
      return {
        questionnaireCompleted: savedProfile.questionnaireCompleted || false,
        assessmentCompleted: savedProfile.assessmentCompleted || false
      };
    }

    // New user defaults
    return {
      questionnaireCompleted: false,
      assessmentCompleted: false
    };
  };

  // Update user profile in context
  const updateUserProfileInContext = (updates: Partial<AppUser>): void => {
    if (currentUser) {
      console.log('🔄 Updating user profile with:', updates);
      
      const updatedUser: AppUser = { 
        ...currentUser, 
        ...updates 
      };
      
      // Handle enhanced profile updates
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
      setIsAuthenticated(true);
      
      // Save to localStorage
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(updatedUser));
      localStorage.setItem('userProfile', JSON.stringify(updatedUser)); // Backup
      
      console.log('✅ User profile updated successfully');
    }
  };

  // Sync with local data
  const syncWithLocalData = (localData: any): void => {
    if (!currentUser || !localData) {
      console.log('⚠️ Cannot sync - missing currentUser or localData');
      return;
    }

    try {
      const syncedUser: AppUser = {
        ...currentUser,
        currentStage: localData.profile?.currentProgress?.currentStage?.toString() || currentUser.currentStage,
        experienceLevel: localData.profile?.currentProgress?.currentTLevel || currentUser.experienceLevel,
        
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

  // Enhanced login - 🔧 REMOVED API CALLS, KEEP ALL OTHER LOGIC
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Attempting login for:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      // Check for saved profile
      const userStorageKey = `userProfile_${user.uid}`;
      const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
      let userProfile: AppUser | null = null;
      
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          const completionStatus = getCompletionStatus(user, parsedProfile);
          
          userProfile = {
            ...parsedProfile,
            // 🔧 PRESERVE completion status but apply admin bypass
            questionnaireCompleted: completionStatus.questionnaireCompleted,
            assessmentCompleted: completionStatus.assessmentCompleted
          };
          
          console.log('✅ User profile loaded from localStorage');
        } catch (parseError) {
          console.error('❌ Error parsing saved profile:', parseError);
        }
      }
      
      // 🔧 REMOVED: API fallback, but keep the minimal profile creation logic
      if (!userProfile) {
        console.log('📝 No saved profile found, creating minimal profile for existing user');
        
        // Minimal profile fallback (for existing users who somehow lost their localStorage)
        const completionStatus = getCompletionStatus(user);
        
        userProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'User',
          experienceLevel: '',
          goals: [],
          practiceTime: 0,
          frequency: '',
          assessmentCompleted: completionStatus.assessmentCompleted,
          currentStage: completionStatus.questionnaireCompleted ? '1' : 'questionnaire',
          questionnaireCompleted: completionStatus.questionnaireCompleted,
          questionnaireAnswers: null,
          selfAssessmentData: null
        };
      }
      
      setCurrentUser(userProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Save final profile
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(userProfile));
      
      console.log('✅ Login successful for:', email, { 
        questionnaire: userProfile.questionnaireCompleted, 
        assessment: userProfile.assessmentCompleted 
      });
      
    } catch (error: any) {
      console.error("❌ Login error:", error);
      setError(error.message || 'Failed to sign in');
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // Enhanced signup - 🔧 REMOVED API CALLS, KEEP ALL OTHER LOGIC
  const signup = async (email: string, password: string, displayName: string): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Creating new user:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      await updateProfile(user, { displayName });
      
      // Get completion status (admin bypass applies here too)
      const completionStatus = getCompletionStatus(user);
      
      const newUserProfile: AppUser = {
        uid: user.uid,
        email: user.email || '',
        displayName: displayName,
        experienceLevel: '',
        goals: [],
        practiceTime: 0,
        frequency: '',
        assessmentCompleted: completionStatus.assessmentCompleted,
        currentStage: completionStatus.questionnaireCompleted ? '1' : 'questionnaire',
        questionnaireCompleted: completionStatus.questionnaireCompleted,
        questionnaireAnswers: null,
        selfAssessmentData: null,
        
        enhancedProfile: {
          onboardingData: {
            questionnaireAnswers: null,
            selfAssessmentResults: null,
            questionnaireCompleted: completionStatus.questionnaireCompleted,
            assessmentCompleted: completionStatus.assessmentCompleted,
            onboardingCompletedAt: (completionStatus.questionnaireCompleted && completionStatus.assessmentCompleted) ? new Date().toISOString() : null
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
      
      // 🔧 REMOVED: API call to save profile, just save locally
      console.log('💾 Saving user profile to localStorage only');
      
      setCurrentUser(newUserProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Save to localStorage
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(newUserProfile));
      localStorage.setItem('userProfile', JSON.stringify(newUserProfile)); // Backup
      
      console.log('✅ Signup successful for:', email, { 
        questionnaire: newUserProfile.questionnaireCompleted, 
        assessment: newUserProfile.assessmentCompleted 
      });
      
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      setError(error.message || 'Failed to create account');
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      
      // Clean up storage
      if (firebaseUser?.uid) {
        localStorage.removeItem(`userProfile_${firebaseUser.uid}`);
      }
      localStorage.removeItem('userProfile');
      
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force local logout even if Firebase fails
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
    }
  };

  // 🔧 SIMPLIFIED AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('🔥 Auth state changed:', { user: user ? 'EXISTS' : 'NULL', email: user?.email });
      
      if (user) {
        setFirebaseUser(user);
        
        // Only load user if we don't already have one (avoid conflicts)
        if (!currentUser) {
          try {
            const userStorageKey = `userProfile_${user.uid}`;
            const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
            
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile);
              const completionStatus = getCompletionStatus(user, parsedProfile);
              
              const userProfile = {
                ...parsedProfile,
                questionnaireCompleted: completionStatus.questionnaireCompleted,
                assessmentCompleted: completionStatus.assessmentCompleted
              };
              
              setCurrentUser(userProfile);
              setIsAuthenticated(true);
              console.log('✅ User restored from localStorage');
            }
          } catch (error) {
            console.error('❌ Error restoring user:', error);
          }
        }
      } else {
        setCurrentUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
        console.log('✅ User signed out');
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []); // Empty dependency array to avoid loops

  const value: AuthContextType = {
    currentUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    updateUserProfileInContext,
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