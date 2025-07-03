import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { auth } from './utils/firebase-config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
} from 'firebase/auth';

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
  // 🔒 ENHANCED: Updated login/signup signatures
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, displayName: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileInContext: (updates: Partial<AppUser>) => void;
  syncWithLocalData: (localData: any) => void;
  getUserStorageKey: () => string;
  firebaseUser: User | null;
  // 🔒 NEW: Security features
  sessionTimeRemaining: number;
  showLogoutWarning: boolean;
  extendSession: () => void;
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

  // 🔒 NEW: Security state
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  
  // 🔒 NEW: Security configuration
  const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout
  const SESSION_STORAGE_KEY = 'sessionData';
  
  // Refs for timers
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (isAdminUser(user.email || '')) {
      console.log('🔑 Admin user detected - marking all as completed');
      return {
        questionnaireCompleted: true,
        assessmentCompleted: true
      };
    }

    if (savedProfile) {
      return {
        questionnaireCompleted: savedProfile.questionnaireCompleted || false,
        assessmentCompleted: savedProfile.assessmentCompleted || false
      };
    }

    return {
      questionnaireCompleted: false,
      assessmentCompleted: false
    };
  };

  // 🔒 NEW: Clear all timers
  const clearAllTimers = useCallback(() => {
    if (sessionTimerRef.current) {
      clearTimeout(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // 🔒 NEW: Force logout due to session timeout
  const forceLogout = useCallback(async (reason: string = 'Session expired') => {
    console.log(`🔒 ${reason} - logging out user`);
    clearAllTimers();
    setShowLogoutWarning(false);
    
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error during force logout:', error);
    }
    
    // Clear all storage
    if (firebaseUser?.uid) {
      localStorage.removeItem(`userProfile_${firebaseUser.uid}`);
    }
    localStorage.removeItem('userProfile');
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    
    setCurrentUser(null);
    setFirebaseUser(null);
    setIsAuthenticated(false);
    setError('Your session has expired for security reasons. Please log in again.');
  }, [clearAllTimers, firebaseUser?.uid]);

  // 🔒 NEW: Start session countdown
  const startCountdown = useCallback(() => {
    setShowLogoutWarning(true);
    let timeLeft = WARNING_TIME;
    setSessionTimeRemaining(timeLeft);
    
    countdownTimerRef.current = setInterval(() => {
      timeLeft -= 1000;
      setSessionTimeRemaining(timeLeft);
      
      if (timeLeft <= 0) {
        forceLogout('Session timeout reached');
      }
    }, 1000);
  }, [forceLogout]);

  // 🔒 NEW: Reset session timer
  const resetSessionTimer = useCallback(() => {
    if (!isAuthenticated) return;
    
    clearAllTimers();
    setShowLogoutWarning(false);
    setLastActivityTime(Date.now());
    
    // Save session data
    const sessionData = {
      lastActivity: Date.now(),
      loginTime: Date.now()
    };
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    
    // Set main session timer (6 hours - 5 minutes warning)
    sessionTimerRef.current = setTimeout(() => {
      startCountdown();
    }, SESSION_DURATION - WARNING_TIME);
    
    console.log('🔒 Session timer reset - 6 hours until auto-logout');
  }, [isAuthenticated, clearAllTimers, startCountdown]);

  // 🔒 NEW: Extend session (when user clicks "Stay logged in")
  const extendSession = useCallback(() => {
    console.log('🔒 Session extended by user');
    resetSessionTimer();
  }, [resetSessionTimer]);

  // 🔒 NEW: Track user activity
  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = [
      'mousedown', 'mousemove', 'keypress', 'scroll', 
      'touchstart', 'click', 'keydown', 'touchmove'
    ];
    
    const handleActivity = () => {
      const now = Date.now();
      // Only reset if it's been more than 1 minute since last reset (avoid excessive resets)
      if (now - lastActivityTime > 60000) {
        resetSessionTimer();
      }
    };
    
    // Add activity listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });
    
    return () => {
      // Remove activity listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, lastActivityTime, resetSessionTimer]);

  // 🔒 NEW: Check for existing session on page load
  useEffect(() => {
    const checkExistingSession = () => {
      const sessionData = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionData && isAuthenticated) {
        try {
          const { lastActivity } = JSON.parse(sessionData);
          const timeSinceLastActivity = Date.now() - lastActivity;
          
          if (timeSinceLastActivity > SESSION_DURATION) {
            forceLogout('Session expired while away');
          } else {
            // Calculate remaining time and start appropriate timer
            const remainingTime = SESSION_DURATION - timeSinceLastActivity;
            if (remainingTime <= WARNING_TIME) {
              startCountdown();
            } else {
              resetSessionTimer();
            }
          }
        } catch (error) {
          console.error('Error checking session data:', error);
          resetSessionTimer();
        }
      }
    };
    
    checkExistingSession();
  }, [isAuthenticated, forceLogout, startCountdown, resetSessionTimer]);

  // ✅ PRESERVED: Your existing updateUserProfileInContext function
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
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      console.log('✅ User profile updated successfully');
    }
  };

  // ✅ PRESERVED: Your existing syncWithLocalData function
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

  // 🔒 ENHANCED: Your existing login function with optional rememberMe
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Attempting login for:', email, { rememberMe });
      
      // 🔒 NEW: Set persistence based on rememberMe option
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      // ✅ PRESERVED: Your existing profile loading logic
      const userStorageKey = `userProfile_${user.uid}`;
      const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
      let userProfile: AppUser | null = null;
      
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          const completionStatus = getCompletionStatus(user, parsedProfile);
          
          userProfile = {
            ...parsedProfile,
            questionnaireCompleted: completionStatus.questionnaireCompleted,
            assessmentCompleted: completionStatus.assessmentCompleted
          };
          
          console.log('✅ User profile loaded from localStorage');
        } catch (parseError) {
          console.error('❌ Error parsing saved profile:', parseError);
        }
      }
      
      if (!userProfile) {
        console.log('📝 No saved profile found, creating minimal profile for existing user');
        
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
      
      // 🔒 NEW: Start session timer
      resetSessionTimer();
      
      console.log('✅ Login successful for:', email, { 
        questionnaire: userProfile.questionnaireCompleted, 
        assessment: userProfile.assessmentCompleted,
        sessionType: rememberMe ? 'persistent' : 'session-only'
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

  // 🔒 ENHANCED: Your existing signup function with optional rememberMe
  const signup = async (email: string, password: string, displayName: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 Creating new user:', email, { rememberMe });
      
      // 🔒 NEW: Set persistence based on rememberMe option
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      await updateProfile(user, { displayName });
      
      const completionStatus = getCompletionStatus(user);
      
      // ✅ PRESERVED: Your existing profile structure
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
      
      console.log('💾 Saving user profile to localStorage only');
      
      setCurrentUser(newUserProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Save to localStorage
      const storageKey = getUserStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(newUserProfile));
      localStorage.setItem('userProfile', JSON.stringify(newUserProfile));
      
      // 🔒 NEW: Start session timer
      resetSessionTimer();
      
      console.log('✅ Signup successful for:', email, { 
        questionnaire: newUserProfile.questionnaireCompleted, 
        assessment: newUserProfile.assessmentCompleted,
        sessionType: rememberMe ? 'persistent' : 'session-only'
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

  // 🔒 ENHANCED: Your existing logout function with timer cleanup
  const logout = async (): Promise<void> => {
    try {
      // 🔒 NEW: Clear all security timers
      clearAllTimers();
      setShowLogoutWarning(false);
      
      await signOut(auth);
      
      // ✅ PRESERVED: Your existing cleanup logic
      if (firebaseUser?.uid) {
        localStorage.removeItem(`userProfile_${firebaseUser.uid}`);
      }
      localStorage.removeItem('userProfile');
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setError('');
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force local logout even if Firebase fails
      clearAllTimers();
      setShowLogoutWarning(false);
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
    }
  };

  // ✅ PRESERVED: Your existing auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('🔥 Auth state changed:', { user: user ? 'EXISTS' : 'NULL', email: user?.email });
      
      if (user) {
        setFirebaseUser(user);
        
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
        // 🔒 NEW: Clean up on sign out
        clearAllTimers();
        setShowLogoutWarning(false);
        setCurrentUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
        console.log('✅ User signed out');
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, [clearAllTimers]);

  // 🔒 NEW: Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

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
    firebaseUser,
    // 🔒 NEW: Security features
    sessionTimeRemaining,
    showLogoutWarning,
    extendSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};