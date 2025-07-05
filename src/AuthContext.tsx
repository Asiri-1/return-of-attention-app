import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  arrayUnion,
  increment
} from 'firebase/firestore';
import app from './firebase'; // ✅ This is correct now
import { useNavigate } from 'react-router-dom';

// Enhanced Local Storage Manager
class EnhancedLocalStorageManager {
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }
}

// Smart Intent Detection
class SmartIntentDetection {
  logUserAction(action: string, data: any) {
    console.log(`User action: ${action}`, data);
    // Add your intent logging logic here
  }
}

// Extended User interface to include custom properties
interface User extends FirebaseUser {
  currentStage?: string;
  goals?: string[];
  questionnaireCompleted?: boolean;
  assessmentCompleted?: boolean;
  selfAssessmentData?: any;
  questionnaireAnswers?: any;
  experienceLevel?: string;
  membershipType?: 'free' | 'premium' | 'admin';
}

// Define the shape of the user profile
interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date | null;
  lastLoginAt: Date | null;
  membershipType: 'free' | 'premium' | 'admin';
  memberSince: Date | null;
  membershipId: string;
  currentStage?: string;
  experienceLevel?: string;
  goals?: string[];
  practiceStats: {
    totalSessions: number;
    totalMinutes: number;
    lastSessionDate: Date | null;
    streakDays: number;
    longestStreak: number;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    soundEnabled: boolean;
    language: string;
    reminderTime: string | null;
  };
  questionnaire?: {
    completed: boolean;
    responses?: any;
  };
  selfAssessment?: {
    completed: boolean;
    lastUpdated?: Date | null;
    taste?: string;
    smell?: string;
    touch?: string;
    sight?: string;
    sound?: string;
    thought?: string;
    emotion?: string;
    bodyAwareness?: string;
    responses?: any;
    format?: string;
    version?: string;
    attachmentScore?: number;
    nonAttachmentCount?: number;
  };
  happinessPoints: number;
  achievements: string[];
  notes: any[];
  customFields?: Record<string, any>;
}

// 🔧 FIXED: Update AuthContext interface to match App.tsx expectations
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Authentication methods
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>; // Alias
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>; // Alias
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Profile management
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserProfileInContext: (data: Partial<UserProfile>) => Promise<void>; // Alias
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  
  // 🔧 FIXED: Make these functions instead of boolean properties to match App.tsx usage
  completeQuestionnaire: (responses: any) => Promise<void>;
  markQuestionnaireComplete: (responses: any) => Promise<void>; // Alias
  completeSelfAssessment: (responses: any) => Promise<void>;
  markSelfAssessmentComplete: (responses: any) => Promise<void>; // Alias
  isQuestionnaireCompleted: () => boolean; // 🔧 FIXED: Function instead of boolean
  isSelfAssessmentCompleted: () => boolean; // 🔧 FIXED: Function instead of boolean
  
  // Session management
  showLogoutWarning: boolean;
  sessionTimeRemaining: number;
  extendSession: () => void;
  syncWithLocalData: () => Promise<void>;
  
  // Gamification
  addHappinessPoints: (points: number, reason: string) => Promise<void>;
  addAchievement: (achievement: string) => Promise<void>;
  addNote: (note: any) => Promise<void>;
  updateLastSession: (duration: number) => Promise<void>;
  
  // Utility
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState<boolean>(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  const navigate = useNavigate();
  
  // Initialize local storage manager and intent detection
  const localStorageManager = new EnhancedLocalStorageManager();
  const intentDetection = new SmartIntentDetection();

  // Computed properties
  const isAuthenticated = !!currentUser;
  
  // 🔧 FIXED: Convert to functions to match App.tsx expectations
  const isQuestionnaireCompleted = useCallback((): boolean => {
    return userProfile?.questionnaire?.completed || false;
  }, [userProfile?.questionnaire?.completed]);
  
  const isSelfAssessmentCompleted = useCallback((): boolean => {
    return userProfile?.selfAssessment?.completed || false;
  }, [userProfile?.selfAssessment?.completed]);

  // ✅ FIX: Create missing user document helper function
  const createUserDocument = async (user: FirebaseUser): Promise<UserProfile> => {
    console.log('🔧 Creating missing user document for:', user.email);
    
    const membershipId = `SP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const newUserProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      createdAt: new Date(),
      lastLoginAt: new Date(),
      membershipType: 'free',
      memberSince: new Date(),
      membershipId: membershipId,
      currentStage: '1',
      experienceLevel: 'Seeker',
      goals: [],
      practiceStats: {
        totalSessions: 0,
        totalMinutes: 0,
        lastSessionDate: null,
        streakDays: 0,
        longestStreak: 0
      },
      preferences: {
        theme: 'system',
        notifications: true,
        soundEnabled: true,
        language: 'en',
        reminderTime: null
      },
      questionnaire: {
        completed: false
      },
      selfAssessment: {
        completed: false,
        lastUpdated: null
      },
      happinessPoints: 0,
      achievements: ['account_created'],
      notes: []
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...newUserProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      memberSince: serverTimestamp(),
      practiceStats: {
        ...newUserProfile.practiceStats,
        lastSessionDate: null
      },
      selfAssessment: {
        ...newUserProfile.selfAssessment,
        lastUpdated: null
      }
    });
    
    console.log('✅ User document created successfully');
    return newUserProfile;
  };

  // ✅ FIX: Enhanced user profile loader with automatic document creation
  const loadUserProfile = async (user: FirebaseUser) => {
    try {
      console.log('📊 Loading user profile for:', user.email);
      
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let profileData: UserProfile;
      
      if (!userDoc.exists()) {
        console.log('🔧 User document does not exist, creating new one...');
        // ✅ FIX: Create missing document instead of throwing error
        profileData = await createUserDocument(user);
      } else {
        console.log('✅ User document found, loading data...');
        const userData = userDoc.data();
        
        // Convert timestamps to dates and create extended user object
        profileData = {
          ...userData,
          createdAt: userData.createdAt ? userData.createdAt.toDate() : null,
          lastLoginAt: userData.lastLoginAt ? userData.lastLoginAt.toDate() : null,
          memberSince: userData.memberSince ? userData.memberSince.toDate() : null,
          practiceStats: {
            ...userData.practiceStats,
            lastSessionDate: userData.practiceStats?.lastSessionDate 
              ? userData.practiceStats.lastSessionDate.toDate() 
              : null
          },
          selfAssessment: {
            ...userData.selfAssessment,
            lastUpdated: userData.selfAssessment?.lastUpdated 
              ? userData.selfAssessment.lastUpdated.toDate() 
              : null
          }
        } as UserProfile;
        
        // Update last login time for existing users
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      }
      
      // Extend currentUser with custom properties
      const extendedUser = user as User;
      extendedUser.currentStage = profileData.currentStage || '1';
      extendedUser.goals = profileData.goals || [];
      extendedUser.questionnaireCompleted = profileData.questionnaire?.completed || false;
      extendedUser.assessmentCompleted = profileData.selfAssessment?.completed || false;
      extendedUser.selfAssessmentData = profileData.selfAssessment;
      extendedUser.questionnaireAnswers = profileData.questionnaire?.responses;
      extendedUser.experienceLevel = profileData.experienceLevel;
      extendedUser.membershipType = profileData.membershipType || 'free';
      
      setUserProfile(profileData);
      setCurrentUser(extendedUser);
      
      // Store user data in local storage for offline access
      localStorageManager.setItem('userProfile', JSON.stringify(profileData));
      
      // Log user intent
      intentDetection.logUserAction('profile_loaded', { userId: user.uid });
      
      console.log('✅ User profile loaded successfully');
      
    } catch (err) {
      console.error('❌ Error loading user profile:', err);
      setError('Error loading user profile');
      
      // Try to load from local storage as fallback
      const cachedProfile = localStorageManager.getItem('userProfile');
      if (cachedProfile) {
        try {
          setUserProfile(JSON.parse(cachedProfile));
          console.log('✅ Loaded user profile from local storage fallback');
        } catch (parseErr) {
          console.error('❌ Error parsing cached profile:', parseErr);
        }
      }
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔍 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      setCurrentUser(user as User);
      
      if (user) {
        await loadUserProfile(user);
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, [auth, db, localStorageManager, intentDetection]);

  // Session management
  useEffect(() => {
    if (currentUser) {
      // Set up session timeout (30 minutes)
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const warningTime = 5 * 60 * 1000; // 5 minutes before logout
      
      const timer = setTimeout(() => {
        setShowLogoutWarning(true);
        setSessionTimeRemaining(5 * 60); // 5 minutes in seconds
        
        // Start countdown
        const countdownTimer = setInterval(() => {
          setSessionTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(countdownTimer);
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
        return () => clearInterval(countdownTimer);
      }, sessionTimeout - warningTime);
      
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // Sign up function
  const signup = async (email: string, password: string, displayName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Starting signup process for:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName });
      await sendEmailVerification(user);
      
      // Create user document (this will be handled by the auth state listener)
      console.log('✅ Signup successful, user document will be created automatically');
      
      // Navigate to questionnaire after successful signup
      setTimeout(() => {
        navigate('/questionnaire');
      }, 1000);
      
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔧 Starting login process for:', email);
      
      await signInWithEmailAndPassword(auth, email, password);
      intentDetection.logUserAction('login', { email });
      
      console.log('✅ Login successful');
      
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        intentDetection.logUserAction('logout', { userId: currentUser.uid });
      }
      
      await signOut(auth);
      setShowLogoutWarning(false);
      setSessionTimeRemaining(0);
      navigate('/signin'); // 🔧 FIXED: Changed from '/login' to '/signin'
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await sendPasswordResetEmail(auth, email);
      intentDetection.logUserAction('reset_password', { email });
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification email function
  const sendVerificationEmail = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser) {
        await sendEmailVerification(currentUser);
        intentDetection.logUserAction('send_verification', { userId: currentUser.uid });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Send verification email error:', err);
      setError(err.message || 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user email function
  const updateUserEmail = async (newEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        
        await updateEmail(currentUser, newEmail);
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          email: newEmail
        });
        
        if (userProfile) {
          const updatedProfile = { ...userProfile, email: newEmail };
          setUserProfile(updatedProfile);
          localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        }
        
        intentDetection.logUserAction('update_email', { userId: currentUser.uid });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Update email error:', err);
      setError(err.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user password function
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && currentUser.email) {
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(currentUser, credential);
        
        await updatePassword(currentUser, newPassword);
        
        intentDetection.logUserAction('update_password', { userId: currentUser.uid });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Update password error:', err);
      setError(err.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to normalize self-assessment data format
  const normalizeSelfAssessmentData = (data: any) => {
    if (data.format === 'standard' && data.version === '2.0') {
      console.log('Data already in standardized format');
      return data;
    }
    
    const standardizedData: any = {
      format: 'standard',
      version: '2.0',
      completed: true,
      lastUpdated: new Date(),
      taste: 'none',
      smell: 'none',
      touch: 'none',
      sight: 'none',
      sound: 'none',
      thought: 'none',
      emotion: 'none',
      bodyAwareness: 'none',
      responses: {}
    };
    
    const allCategories = ['taste', 'smell', 'touch', 'sight', 'sound', 'thought', 'emotion', 'bodyAwareness'];
    
    if (data.taste || data.smell || data.touch) {
      console.log('Detected Format 1: Simple object with direct properties');
      
      allCategories.forEach(category => {
        if (data[category]) {
          standardizedData[category] = data[category];
          standardizedData.responses[category] = {
            level: data[category],
            details: data[`${category}Details`] || '',
            category: category
          };
        }
      });
    } else if (data.responses) {
      console.log('Detected Format 2: Object with responses property');
      
      standardizedData.responses = { ...data.responses };
      
      Object.keys(data.responses).forEach(category => {
        const response = data.responses[category];
        if (response) {
          if (typeof response === 'object') {
            standardizedData[category] = response.level || 'none';
          } else {
            standardizedData[category] = response || 'none';
          }
        }
      });
    } else if (data.intentBased) {
      console.log('Detected Format 3: Legacy intentBased format');
      
      allCategories.forEach(category => {
        const intentKey = `${category}Intent`;
        if (data[intentKey]) {
          standardizedData[category] = data[intentKey] === 'attached' ? 'high' : 
                                      data[intentKey] === 'averse' ? 'low' : 'none';
          
          standardizedData.responses[category] = {
            level: standardizedData[category],
            details: data[`${category}Details`] || '',
            category: category,
            intent: data[intentKey]
          };
        }
      });
    }
    
    standardizedData.attachmentScore = calculateAttachmentScore(standardizedData);
    standardizedData.nonAttachmentCount = calculateNonAttachmentCount(standardizedData);
    
    console.log('Normalized self-assessment data:', standardizedData);
    return standardizedData;
  };

  // Helper function to calculate attachment score
  const calculateAttachmentScore = (data: any): number => {
    if (data.taste || data.smell || data.touch) {
      const categories = ['taste', 'smell', 'touch', 'sight', 'sound', 'thought', 'emotion', 'bodyAwareness'];
      let attachmentCount = 0;
      let totalCategories = 0;
      
      categories.forEach(category => {
        if (data[category]) {
          totalCategories++;
          if (data[category] === 'high' || data[category] === 'attached') {
            attachmentCount++;
          }
        }
      });
      
      return totalCategories > 0 ? Math.round((attachmentCount / totalCategories) * 100) : 0;
    } else if (data.responses) {
      const responses = data.responses;
      let attachmentCount = 0;
      let totalCategories = 0;
      
      Object.keys(responses).forEach(category => {
        const response = responses[category];
        if (response) {
          totalCategories++;
          const level = typeof response === 'object' ? response.level : response;
          if (level === 'high' || level === 'attached') {
            attachmentCount++;
          }
        }
      });
      
      return totalCategories > 0 ? Math.round((attachmentCount / totalCategories) * 100) : 0;
    }
    
    return 0;
  };

  // Helper function to calculate non-attachment count
  const calculateNonAttachmentCount = (data: any): number => {
    if (data.taste || data.smell || data.touch) {
      const categories = ['taste', 'smell', 'touch', 'sight', 'sound', 'thought', 'emotion', 'bodyAwareness'];
      let nonAttachmentCount = 0;
      
      categories.forEach(category => {
        if (data[category] === 'none' || data[category] === 'neutral') {
          nonAttachmentCount++;
        }
      });
      
      return nonAttachmentCount;
    } else if (data.responses) {
      const responses = data.responses;
      let nonAttachmentCount = 0;
      
      Object.keys(responses).forEach(category => {
        const response = responses[category];
        if (response) {
          const level = typeof response === 'object' ? response.level : response;
          if (level === 'none' || level === 'neutral') {
            nonAttachmentCount++;
          }
        }
      });
      
      return nonAttachmentCount;
    }
    
    return 0;
  };

  // Update user profile function
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        // Handle self-assessment data specially to fix format issues
        if (data.selfAssessment) {
          data.selfAssessment = normalizeSelfAssessmentData(data.selfAssessment);
          localStorageManager.setItem('selfAssessment', JSON.stringify(data.selfAssessment));
          localStorageManager.removeItem('happinessCache');
        }
        
        // Update profile in Firestore
        await updateDoc(doc(db, 'users', currentUser.uid), data);
        
        // Update local profile
        const updatedProfile = { ...userProfile, ...data };
        setUserProfile(updatedProfile);
        
        // Update extended currentUser
        const extendedUser = { ...currentUser };
        if (data.currentStage) extendedUser.currentStage = data.currentStage;
        if (data.goals) extendedUser.goals = data.goals;
        if (data.questionnaire?.completed !== undefined) extendedUser.questionnaireCompleted = data.questionnaire.completed;
        if (data.selfAssessment?.completed !== undefined) extendedUser.assessmentCompleted = data.selfAssessment.completed;
        setCurrentUser(extendedUser as User);
        
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        
        intentDetection.logUserAction('update_profile', { 
          userId: currentUser.uid,
          fields: Object.keys(data)
        });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete questionnaire function
  const completeQuestionnaire = async (responses: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'questionnaire.completed': true,
          'questionnaire.responses': responses,
          'questionnaire.completedAt': serverTimestamp()
        });
        
        const updatedProfile = { 
          ...userProfile, 
          questionnaire: {
            completed: true,
            responses: responses
          }
        };
        setUserProfile(updatedProfile);
        
        // Update extended currentUser
        const extendedUser = { ...currentUser };
        extendedUser.questionnaireCompleted = true;
        extendedUser.questionnaireAnswers = responses;
        setCurrentUser(extendedUser as User);
        
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        
        await addHappinessPoints(50, 'Completed initial questionnaire');
        await addAchievement('questionnaire_completed');
        
        intentDetection.logUserAction('complete_questionnaire', { userId: currentUser.uid });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Complete questionnaire error:', err);
      setError(err.message || 'Failed to save questionnaire');
    } finally {
      setIsLoading(false);
    }
  };

  // Complete self-assessment function
  const completeSelfAssessment = async (responses: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        const normalizedData = normalizeSelfAssessmentData(responses);
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'selfAssessment.completed': true,
          'selfAssessment.lastUpdated': serverTimestamp(),
          'selfAssessment': normalizedData
        });
        
        const updatedProfile = { 
          ...userProfile, 
          selfAssessment: normalizedData
        };
        setUserProfile(updatedProfile);
        
        // Update extended currentUser
        const extendedUser = { ...currentUser };
        extendedUser.assessmentCompleted = true;
        extendedUser.selfAssessmentData = normalizedData;
        setCurrentUser(extendedUser as User);
        
        localStorageManager.setItem('selfAssessment', JSON.stringify(normalizedData));
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        localStorageManager.removeItem('happinessCache');
        
        const isFirstTime = !userProfile.selfAssessment?.completed;
        if (isFirstTime) {
          await addHappinessPoints(75, 'Completed first self-assessment');
          await addAchievement('self_assessment_completed');
        } else {
          await addHappinessPoints(25, 'Updated self-assessment');
        }
        
        intentDetection.logUserAction('complete_self_assessment', { 
          userId: currentUser.uid,
          isFirstTime
        });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Complete self-assessment error:', err);
      setError(err.message || 'Failed to save self-assessment');
    } finally {
      setIsLoading(false);
    }
  };

  // Add happiness points function
  const addHappinessPoints = async (points: number, reason: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          happinessPoints: increment(points)
        });
        
        await setDoc(doc(db, 'users', currentUser.uid, 'happinessLog', Date.now().toString()), {
          points,
          reason,
          timestamp: serverTimestamp()
        });
        
        const updatedProfile = { 
          ...userProfile, 
          happinessPoints: (userProfile.happinessPoints || 0) + points
        };
        setUserProfile(updatedProfile);
        
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        
        intentDetection.logUserAction('add_happiness_points', { 
          userId: currentUser.uid,
          points,
          reason
        });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Add happiness points error:', err);
      setError(err.message || 'Failed to add happiness points');
    } finally {
      setIsLoading(false);
    }
  };

  // Add achievement function
  const addAchievement = async (achievement: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        if (userProfile.achievements && userProfile.achievements.includes(achievement)) {
          console.log('Achievement already earned:', achievement);
          return;
        }
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          achievements: arrayUnion(achievement)
        });
        
        await setDoc(doc(db, 'users', currentUser.uid, 'achievementsLog', Date.now().toString()), {
          achievement,
          timestamp: serverTimestamp()
        });
        
        const updatedProfile = { 
          ...userProfile, 
          achievements: [...(userProfile.achievements || []), achievement]
        };
        setUserProfile(updatedProfile);
        
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        
        await addHappinessPoints(25, `Earned achievement: ${achievement}`);
        
        intentDetection.logUserAction('add_achievement', { 
          userId: currentUser.uid,
          achievement
        });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Add achievement error:', err);
      setError(err.message || 'Failed to add achievement');
    } finally {
      setIsLoading(false);
    }
  };

  // Add note function
  const addNote = async (note: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        const noteWithTimestamp = {
          ...note,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const noteDocRef = doc(db, 'users', currentUser.uid, 'notes', Date.now().toString());
        await setDoc(noteDocRef, noteWithTimestamp);
        
        const updatedProfile = { 
          ...userProfile, 
          notes: [...(userProfile.notes || []), { ...note, id: noteDocRef.id }]
        };
        setUserProfile(updatedProfile);
        
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        
        intentDetection.logUserAction('add_note', { 
          userId: currentUser.uid,
          noteType: note.type
        });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Add note error:', err);
      setError(err.message || 'Failed to add note');
    } finally {
      setIsLoading(false);
    }
  };

  // Update last session function
  const updateLastSession = async (duration: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (currentUser && userProfile) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streakDays = userProfile.practiceStats?.streakDays || 0;
        let longestStreak = userProfile.practiceStats?.longestStreak || 0;
        
        const lastSessionDate = userProfile.practiceStats?.lastSessionDate;
        if (lastSessionDate) {
          const lastDate = new Date(lastSessionDate);
          lastDate.setHours(0, 0, 0, 0);
          
          const diffTime = Math.abs(today.getTime() - lastDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            streakDays++;
            if (streakDays > longestStreak) {
              longestStreak = streakDays;
            }
          } else if (diffDays > 1) {
            streakDays = 1;
          }
        } else {
          streakDays = 1;
          longestStreak = 1;
        }
        
        await updateDoc(doc(db, 'users', currentUser.uid), {
          'practiceStats.totalSessions': increment(1),
          'practiceStats.totalMinutes': increment(duration),
          'practiceStats.lastSessionDate': serverTimestamp(),
          'practiceStats.streakDays': streakDays,
          'practiceStats.longestStreak': longestStreak
        });
        
        await setDoc(doc(db, 'users', currentUser.uid, 'sessionLog', Date.now().toString()), {
          duration,
          timestamp: serverTimestamp()
        });
        
        const updatedProfile = { 
          ...userProfile, 
          practiceStats: {
            ...userProfile.practiceStats,
            totalSessions: (userProfile.practiceStats?.totalSessions || 0) + 1,
            totalMinutes: (userProfile.practiceStats?.totalMinutes || 0) + duration,
            lastSessionDate: new Date(),
            streakDays,
            longestStreak
          }
        };
        setUserProfile(updatedProfile);
        
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        
        await addHappinessPoints(duration * 2, `Completed ${duration} minute practice session`);
        
        // Check for streak achievements
        if (streakDays === 3) {
          await addAchievement('streak_3_days');
        } else if (streakDays === 7) {
          await addAchievement('streak_7_days');
        } else if (streakDays === 30) {
          await addAchievement('streak_30_days');
        }
        
        // Check for session count achievements
        const totalSessions = (userProfile.practiceStats?.totalSessions || 0) + 1;
        if (totalSessions === 10) {
          await addAchievement('sessions_10');
        } else if (totalSessions === 50) {
          await addAchievement('sessions_50');
        } else if (totalSessions === 100) {
          await addAchievement('sessions_100');
        }
        
        intentDetection.logUserAction('complete_session', { 
          userId: currentUser.uid,
          duration,
          streakDays
        });
      } else {
        throw new Error('No user is logged in');
      }
    } catch (err: any) {
      console.error('Update last session error:', err);
      setError(err.message || 'Failed to update session data');
    } finally {
      setIsLoading(false);
    }
  };

  // Session management functions
  const extendSession = useCallback(() => {
    setShowLogoutWarning(false);
    setSessionTimeRemaining(0);
  }, []);

  const syncWithLocalData = useCallback(async () => {
    // Sync logic here if needed
    console.log('Syncing with local data...');
  }, []);

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Create context value
  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    error,
    isAuthenticated,
    
    // Authentication methods
    signup,
    signUp: signup, // Alias
    login,
    signIn: login, // Alias - 🔧 FIXED: Now maps to login function
    logout,
    resetPassword,
    
    // Profile management
    updateUserProfile,
    updateUserProfileInContext: updateUserProfile, // Alias
    updateUserEmail,
    updateUserPassword,
    sendVerificationEmail,
    
    // Questionnaire and Assessment
    completeQuestionnaire,
    markQuestionnaireComplete: completeQuestionnaire, // Alias
    completeSelfAssessment,
    markSelfAssessmentComplete: completeSelfAssessment, // Alias
    isQuestionnaireCompleted, // 🔧 FIXED: Now a function
    isSelfAssessmentCompleted, // 🔧 FIXED: Now a function
    
    // Session management
    showLogoutWarning,
    sessionTimeRemaining,
    extendSession,
    syncWithLocalData,
    
    // Gamification
    addHappinessPoints,
    addAchievement,
    addNote,
    updateLastSession,
    
    // Utility
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};