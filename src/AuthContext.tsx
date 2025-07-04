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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string, displayName: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileInContext: (updates: Partial<AppUser>) => void;
  syncWithLocalData: (localData: any) => void;
  getUserStorageKey: () => string;
  firebaseUser: User | null;
  sessionTimeRemaining: number;
  showLogoutWarning: boolean;
  extendSession: () => void;
  
  // 🔧 ENHANCED: Completion tracking methods with intent-based support
  userProfile: AppUser | null;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  updateUserProfile: (data: Partial<AppUser>) => Promise<void>;
  markQuestionnaireComplete: (answers: any) => Promise<void>;
  markSelfAssessmentComplete: (data: any) => Promise<void>;
  isQuestionnaireCompleted: () => boolean;
  isSelfAssessmentCompleted: () => boolean;
  resetCompletionStatus: () => Promise<void>;
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

  // Security state
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  
  // Security configuration
  const SESSION_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  const WARNING_TIME = 5 * 60 * 1000; // Show warning 5 minutes before logout
  const SESSION_STORAGE_KEY = 'sessionData';
  
  // Refs for timers
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';

  // Get user-specific storage key
  const getUserStorageKey = (): string => {
    return firebaseUser?.uid ? `userProfile_${firebaseUser.uid}` : 'userProfile';
  };

  // Check if user is admin
  const isAdminUser = (email: string): boolean => {
    return email === ADMIN_EMAIL;
  };

  // Get completion status with admin bypass
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

  // Clear all timers
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

  // Force logout due to session timeout
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

  // Start session countdown
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

  // Reset session timer
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

  // Extend session (when user clicks "Stay logged in")
  const extendSession = useCallback(() => {
    console.log('🔒 Session extended by user');
    resetSessionTimer();
  }, [resetSessionTimer]);

  // 🔧 ENHANCED: Universal self-assessment data compatibility function
  const normalizeSelfAssessmentData = (data: any): any => {
    if (!data) return null;

    console.log('🔧 ENHANCED: Normalizing self-assessment data:', data);

    // If it's already in the new intent-based format
    if (data.intentBased && data.format === 'levels' && data.responses) {
      console.log('✅ ENHANCED: Data is already in intent-based format');
      return data;
    }

    // If it's in the old text-based format, convert it
    if (data.responses && !data.intentBased) {
      console.log('🔄 ENHANCED: Converting old text-based data to new format');
      
      const normalizedResponses: Record<string, any> = {};
      
      // Convert old field names to new categories
      const fieldMapping: Record<string, string> = {
        'taste-preferences': 'taste',
        'taste_preferences': 'taste',
        'food': 'taste',
        'foods': 'taste',
        'Food Preferences': 'taste',
        'scent-preferences': 'smell',
        'smell-preferences': 'smell',
        'smell_preferences': 'smell',
        'audio-enjoyment': 'sound',
        'sound-preferences': 'sound',
        'music': 'sound',
        'visual-pleasure': 'sight',
        'sight-preferences': 'sight',
        'visual': 'sight',
        'physical-sensations': 'touch',
        'touch-preferences': 'touch',
        'touch_preferences': 'touch',
        'mental-imagery': 'mind',
        'mind-preferences': 'mind',
        'thoughts': 'mind'
      };

      // Convert old responses to new format
      Object.entries(data.responses).forEach(([oldKey, value]: [string, any]) => {
        const newKey = fieldMapping[oldKey] || oldKey;
        
        if (Array.isArray(value)) {
          // Convert array of preferences to level-based system
          const items = value.filter(item => item && item.trim().length > 0);
          
          if (items.length === 0) {
            normalizedResponses[newKey] = { level: 'none', details: '', category: newKey };
          } else if (items.length <= 2) {
            normalizedResponses[newKey] = { level: 'some', details: items.join(', '), category: newKey };
          } else {
            normalizedResponses[newKey] = { level: 'strong', details: items.join(', '), category: newKey };
          }
        } else if (typeof value === 'string') {
          // Convert string responses
          const cleanValue = value.trim().toLowerCase();
          
          if (!cleanValue || cleanValue === 'nothing' || cleanValue === 'none' || cleanValue === 'no') {
            normalizedResponses[newKey] = { level: 'none', details: '', category: newKey };
          } else if (cleanValue.length < 20) {
            normalizedResponses[newKey] = { level: 'some', details: value, category: newKey };
          } else {
            normalizedResponses[newKey] = { level: 'strong', details: value, category: newKey };
          }
        }
      });

      // Create new intent-based structure
      const convertedData = {
        intentBased: true,
        format: 'levels',
        version: '2.0',
        responses: normalizedResponses,
        completedAt: data.completedAt || new Date().toISOString(),
        migratedFrom: 'text-based',
        originalData: data, // Keep original for reference
        summary: {
          noneCount: Object.values(normalizedResponses).filter((r: any) => r.level === 'none').length,
          someCount: Object.values(normalizedResponses).filter((r: any) => r.level === 'some').length,
          strongCount: Object.values(normalizedResponses).filter((r: any) => r.level === 'strong').length,
          nonAttachmentPercentage: Math.round((Object.values(normalizedResponses).filter((r: any) => r.level === 'none').length / Object.values(normalizedResponses).length) * 100)
        }
      };

      console.log('✅ ENHANCED: Converted to intent-based format:', convertedData);
      return convertedData;
    }

    // If it's some other format, try to preserve it but add intent-based flag
    console.log('⚠️ ENHANCED: Unknown format, preserving as-is');
    return {
      ...data,
      intentBased: false,
      format: 'unknown',
      version: '1.0'
    };
  };

  // 🔧 ENHANCED: Improved immediate update function
  const updateUserProfileInContext = useCallback((updates: Partial<AppUser>): void => {
    if (!currentUser) {
      console.log('⚠️ No current user to update');
      return;
    }

    console.log('🔄 ENHANCED: Updating user profile with:', updates);
    
    // 🔧 ENHANCED: Normalize self-assessment data if provided
    let normalizedUpdates = { ...updates };
    if (updates.selfAssessmentData) {
      normalizedUpdates.selfAssessmentData = normalizeSelfAssessmentData(updates.selfAssessmentData);
      console.log('🎯 ENHANCED: Self-assessment data normalized:', normalizedUpdates.selfAssessmentData);
    }
    
    const updatedUser: AppUser = { 
      ...currentUser, 
      ...normalizedUpdates 
    };
    
    // Handle enhanced profile updates
    if (normalizedUpdates.questionnaireAnswers !== undefined || normalizedUpdates.selfAssessmentData !== undefined) {
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
          questionnaireAnswers: normalizedUpdates.questionnaireAnswers ?? currentUser.questionnaireAnswers,
          selfAssessmentResults: normalizedUpdates.selfAssessmentData ?? currentUser.selfAssessmentData,
          questionnaireCompleted: normalizedUpdates.questionnaireCompleted ?? currentUser.questionnaireCompleted,
          assessmentCompleted: normalizedUpdates.assessmentCompleted ?? currentUser.assessmentCompleted,
          onboardingCompletedAt: (normalizedUpdates.questionnaireCompleted && normalizedUpdates.assessmentCompleted) 
            ? new Date().toISOString() 
            : currentUser.enhancedProfile?.onboardingData?.onboardingCompletedAt || null
        },
        preferences: currentUser.enhancedProfile?.preferences || defaultPreferences,
        currentProgress: currentUser.enhancedProfile?.currentProgress || defaultProgress
      };
    }
    
    // 🔧 ENHANCED: Clear happiness cache before updating user data
    localStorage.removeItem('happiness_points');
    localStorage.removeItem('user_level');
    localStorage.removeItem('happiness_debug');
    
    // Update state immediately
    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    
    // 🔧 ENHANCED: Save to BOTH storage locations immediately and consistently
    const storageKey = getUserStorageKey();
    try {
      // Save to user-specific key
      localStorage.setItem(storageKey, JSON.stringify(updatedUser));
      // Save to generic key (for backward compatibility)
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
      
      console.log('✅ ENHANCED: User profile updated and saved successfully', {
        userSpecificKey: storageKey,
        hasQuestionnaireAnswers: !!updatedUser.questionnaireAnswers,
        hasSelfAssessmentData: !!updatedUser.selfAssessmentData,
        selfAssessmentFormat: updatedUser.selfAssessmentData?.format || 'unknown',
        intentBased: updatedUser.selfAssessmentData?.intentBased || false,
        questionnaireCompleted: updatedUser.questionnaireCompleted,
        assessmentCompleted: updatedUser.assessmentCompleted
      });
      
      // 🔧 ENHANCED: Debug log for happiness calculator
      if (updatedUser.selfAssessmentData) {
        console.log('🎯 ENHANCED: Self-assessment data saved for happiness calculation:', {
          intentBased: updatedUser.selfAssessmentData.intentBased,
          format: updatedUser.selfAssessmentData.format,
          hasResponses: !!updatedUser.selfAssessmentData.responses,
          responseCount: updatedUser.selfAssessmentData.responses ? Object.keys(updatedUser.selfAssessmentData.responses).length : 0,
          hasSummary: !!updatedUser.selfAssessmentData.summary,
          dataStructure: Object.keys(updatedUser.selfAssessmentData)
        });
      }
      
      // Trigger happiness recalculation
      window.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: updatedUser }));
      
    } catch (error) {
      console.error('❌ ENHANCED: Error saving user profile:', error);
    }
  }, [currentUser, getUserStorageKey]);

  // 🔧 ENHANCED: Improved completion tracking methods
  const markQuestionnaireComplete = useCallback(async (answers: any) => {
    if (!currentUser) {
      console.error('🔧 ENHANCED: No current user found for questionnaire completion');
      return;
    }

    console.log('🔧 ENHANCED: Marking questionnaire as complete');
    updateUserProfileInContext({
      questionnaireAnswers: answers,
      questionnaireCompleted: true
    });
  }, [currentUser, updateUserProfileInContext]);

  const markSelfAssessmentComplete = useCallback(async (data: any) => {
    if (!currentUser) {
      console.error('🔧 ENHANCED: No current user found for self-assessment completion');
      return;
    }

    console.log('🔧 ENHANCED: Marking self-assessment as complete with data:', data);
    
    // Normalize the data to ensure it's in the right format
    const normalizedData = normalizeSelfAssessmentData(data);
    
    updateUserProfileInContext({
      selfAssessmentData: normalizedData,
      assessmentCompleted: true
    });

    console.log('✅ ENHANCED: Self-assessment marked complete with normalized data');
  }, [currentUser, updateUserProfileInContext]);

  const isQuestionnaireCompleted = useCallback((): boolean => {
    const completed = currentUser?.questionnaireCompleted === true && currentUser?.questionnaireAnswers;
    console.log('🔧 ENHANCED: Questionnaire completed?', completed, currentUser?.questionnaireCompleted);
    return completed;
  }, [currentUser]);

  const isSelfAssessmentCompleted = useCallback((): boolean => {
    const completed = currentUser?.assessmentCompleted === true && currentUser?.selfAssessmentData;
    console.log('🔧 ENHANCED: Self-assessment completed?', completed, {
      assessmentCompleted: currentUser?.assessmentCompleted,
      hasSelfAssessmentData: !!currentUser?.selfAssessmentData,
      dataFormat: currentUser?.selfAssessmentData?.format
    });
    return completed;
  }, [currentUser]);

  const resetCompletionStatus = useCallback(async () => {
    if (!currentUser) return;

    console.log('🔧 ENHANCED: Resetting completion status');
    updateUserProfileInContext({
      questionnaireCompleted: false,
      assessmentCompleted: false,
      questionnaireAnswers: null,
      selfAssessmentData: null
    });

    // Clear happiness calculation
    localStorage.removeItem('happiness_points');
    localStorage.removeItem('happiness_debug');
  }, [currentUser, updateUserProfileInContext]);

  // Alias methods for compatibility
  const signUp = useCallback(async (email: string, password: string, name: string) => {
    await signup(email, password, name, true);
  }, []);

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    await login(email, password, rememberMe);
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<AppUser>) => {
    updateUserProfileInContext(data);
  }, [updateUserProfileInContext]);

  // Track user activity
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

  // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 ENHANCED: Attempting login for:', email, { rememberMe });
      
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      const userStorageKey = `userProfile_${user.uid}`;
      const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
      let userProfile: AppUser | null = null;
      
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          const completionStatus = getCompletionStatus(user, parsedProfile);
          
          // 🔧 ENHANCED: Normalize self-assessment data on login
          let normalizedSelfAssessment = null;
          if (parsedProfile.selfAssessmentData) {
            normalizedSelfAssessment = normalizeSelfAssessmentData(parsedProfile.selfAssessmentData);
            console.log('🎯 ENHANCED: Self-assessment data normalized on login');
          }
          
          userProfile = {
            ...parsedProfile,
            questionnaireCompleted: completionStatus.questionnaireCompleted,
            assessmentCompleted: completionStatus.assessmentCompleted,
            selfAssessmentData: normalizedSelfAssessment
          };
          
          // 🔧 FIXED: Add null check before console.log
          if (userProfile) {
            console.log('✅ ENHANCED: User profile loaded from localStorage', {
              hasQuestionnaireAnswers: !!userProfile.questionnaireAnswers,
              hasSelfAssessmentData: !!userProfile.selfAssessmentData,
              selfAssessmentFormat: userProfile.selfAssessmentData?.format,
              intentBased: userProfile.selfAssessmentData?.intentBased,
              questionnaireCompleted: userProfile.questionnaireCompleted,
              assessmentCompleted: userProfile.assessmentCompleted
            });
          }
        } catch (parseError) {
          console.error('❌ ENHANCED: Error parsing saved profile:', parseError);
        }
      }
      
      if (!userProfile) {
        console.log('📝 ENHANCED: No saved profile found, creating minimal profile for existing user');
        
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
      
      // 🔧 ENHANCED: Save to both locations consistently
      localStorage.setItem(userStorageKey, JSON.stringify(userProfile));
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Start session timer
      resetSessionTimer();
      
      console.log('✅ ENHANCED: Login successful for:', email, { 
        questionnaire: userProfile.questionnaireCompleted, 
        assessment: userProfile.assessmentCompleted,
        sessionType: rememberMe ? 'persistent' : 'session-only'
      });
      
    } catch (error: any) {
      console.error("❌ ENHANCED: Login error:", error);
      setError(error.message || 'Failed to sign in');
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, displayName: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log('🔄 ENHANCED: Creating new user:', email, { rememberMe });
      
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setFirebaseUser(user);
      
      await updateProfile(user, { displayName });
      
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
      
      setCurrentUser(newUserProfile);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // 🔧 ENHANCED: Save to both locations consistently
      const userStorageKey = `userProfile_${user.uid}`;
      localStorage.setItem(userStorageKey, JSON.stringify(newUserProfile));
      localStorage.setItem('userProfile', JSON.stringify(newUserProfile));
      
      // Start session timer
      resetSessionTimer();
      
      console.log('✅ ENHANCED: Signup successful for:', email, { 
        questionnaire: newUserProfile.questionnaireCompleted, 
        assessment: newUserProfile.assessmentCompleted,
        sessionType: rememberMe ? 'persistent' : 'session-only'
      });
      
    } catch (error: any) {
      console.error("❌ ENHANCED: Signup error:", error);
      setError(error.message || 'Failed to create account');
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      throw error;
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      clearAllTimers();
      setShowLogoutWarning(false);
      
      await signOut(auth);
      
      if (firebaseUser?.uid) {
        localStorage.removeItem(`userProfile_${firebaseUser.uid}`);
      }
      localStorage.removeItem('userProfile');
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      
      // 🔧 ENHANCED: Clear happiness cache on logout
      localStorage.removeItem('happiness_points');
      localStorage.removeItem('user_level');
      localStorage.removeItem('happiness_debug');
      
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
      setError('');
      
      console.log('✅ ENHANCED: Logout successful');
    } catch (error) {
      console.error("❌ ENHANCED: Logout error:", error);
      clearAllTimers();
      setShowLogoutWarning(false);
      setCurrentUser(null);
      setFirebaseUser(null);
      setIsAuthenticated(false);
    }
  };

  // Sync with local data
  const syncWithLocalData = useCallback((localData: any): void => {
    if (!currentUser || !localData) {
      console.log('⚠️ ENHANCED: Cannot sync - missing currentUser or localData');
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
      
      // 🔧 ENHANCED: Save to both locations consistently
      const userStorageKey = `userProfile_${firebaseUser?.uid}`;
      localStorage.setItem(userStorageKey, JSON.stringify(syncedUser));
      localStorage.setItem('userProfile', JSON.stringify(syncedUser));
      
      console.log('✅ ENHANCED: AuthContext synced with LocalDataContext');
    } catch (error) {
      console.error('❌ ENHANCED: Error syncing with LocalDataContext:', error);
    }
  }, [currentUser, firebaseUser?.uid]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      console.log('🔥 ENHANCED: Auth state changed:', { user: user ? 'EXISTS' : 'NULL', email: user?.email });
      
      if (user) {
        setFirebaseUser(user);
        
        // Only restore user if we don't already have one OR if the user ID changed
        if (!currentUser || currentUser.uid !== user.uid) {
          try {
            const userStorageKey = `userProfile_${user.uid}`;
            const savedProfile = localStorage.getItem(userStorageKey) || localStorage.getItem('userProfile');
            
            if (savedProfile) {
              const parsedProfile = JSON.parse(savedProfile);
              const completionStatus = getCompletionStatus(user, parsedProfile);
              
              // 🔧 ENHANCED: Normalize self-assessment data on auth state change
              let normalizedSelfAssessment = null;
              if (parsedProfile.selfAssessmentData) {
                normalizedSelfAssessment = normalizeSelfAssessmentData(parsedProfile.selfAssessmentData);
              }
              
              const userProfile = {
                ...parsedProfile,
                uid: user.uid,
                questionnaireCompleted: completionStatus.questionnaireCompleted,
                assessmentCompleted: completionStatus.assessmentCompleted,
                selfAssessmentData: normalizedSelfAssessment
              };
              
              setCurrentUser(userProfile);
              setIsAuthenticated(true);
              
              console.log('✅ ENHANCED: User restored from localStorage', {
                uid: userProfile.uid,
                hasQuestionnaireAnswers: !!userProfile.questionnaireAnswers,
                hasSelfAssessmentData: !!userProfile.selfAssessmentData,
                selfAssessmentFormat: userProfile.selfAssessmentData?.format,
                intentBased: userProfile.selfAssessmentData?.intentBased
              });
            }
          } catch (error) {
            console.error('❌ ENHANCED: Error restoring user:', error);
          }
        }
      } else {
        clearAllTimers();
        setShowLogoutWarning(false);
        setCurrentUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
        console.log('✅ ENHANCED: User signed out');
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Cleanup on unmount
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
    sessionTimeRemaining,
    showLogoutWarning,
    extendSession,
    
    // 🔧 ENHANCED: Completion tracking methods with intent-based support
    userProfile: currentUser, // Alias for compatibility
    signUp,
    signIn,
    updateUserProfile,
    markQuestionnaireComplete,
    markSelfAssessmentComplete,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    resetCompletionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};