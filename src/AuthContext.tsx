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
  increment,
  FieldValue
} from 'firebase/firestore';
import app from './firebase';
import { useNavigate } from 'react-router-dom';

// Enhanced Local Storage Manager
class EnhancedLocalStorageManager {
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      console.log(`✅ LocalStorage SET: ${key} = ${value}`);
    } catch (error) {
      console.error('Error setting localStorage item:', error);
    }
  }

  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      console.log(`📖 LocalStorage GET: ${key} = ${value}`);
      return value;
    } catch (error) {
      console.error('Error getting localStorage item:', error);
      return null;
    }
  }

  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ LocalStorage REMOVE: ${key}`);
    } catch (error) {
      console.error('Error removing localStorage item:', error);
    }
  }
}

// Smart Intent Detection
class SmartIntentDetection {
  logUserAction(action: string, data: any) {
    console.log(`User action: ${action}`, data);
  }
}

// Extended User interface
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
    completedAt?: Date | null;
  };
  selfAssessment?: {
    completed: boolean;
    lastUpdated?: Date | null;
    completedAt?: Date | null;
    // 🔧 PRESERVE EXISTING FORMAT - Don't normalize, keep as-is
    [key: string]: any;
  };
  happinessPoints: number;
  achievements: string[];
  notes: any[];
  customFields?: Record<string, any>;
}

// FirestoreUserProfile interface for Firestore operations
interface FirestoreUserProfile extends Omit<UserProfile, 'createdAt' | 'lastLoginAt' | 'memberSince' | 'practiceStats' | 'selfAssessment'> {
  createdAt: FieldValue | null;
  lastLoginAt: FieldValue | null;
  memberSince: FieldValue | null;
  practiceStats: {
    totalSessions: number;
    totalMinutes: number;
    lastSessionDate: FieldValue | null;
    streakDays: number;
    longestStreak: number;
  };
  selfAssessment?: {
    completed: boolean;
    lastUpdated?: FieldValue | null;
    completedAt?: FieldValue | null;
    [key: string]: any;
  };
}

// AuthContext interface
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Authentication methods
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Profile management
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserProfileInContext: (data: Partial<UserProfile>) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  
  // 🔧 FIXED: Completion management
  completeQuestionnaire: (responses: any) => Promise<void>;
  markQuestionnaireComplete: (responses: any) => Promise<void>;
  completeSelfAssessment: (responses: any) => Promise<void>;
  markSelfAssessmentComplete: (responses: any) => Promise<void>;
  isQuestionnaireCompleted: () => boolean;
  isSelfAssessmentCompleted: () => boolean;
  
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
  
  // 🔧 FIXED: Convert to functions with proper localStorage checking
  const isQuestionnaireCompleted = useCallback((): boolean => {
    console.log('🔍 Checking questionnaire completion...');
    
    // Method 1: Check userProfile
    if (userProfile?.questionnaire?.completed) {
      console.log('✅ Questionnaire completed via userProfile');
      return true;
    }
    
    // Method 2: Check localStorage  
    const localCompleted = localStorageManager.getItem('questionnaire_completed');
    if (localCompleted === 'true') {
      console.log('✅ Questionnaire completed via localStorage');
      return true;
    }
    
    // Method 3: Check currentUser extended properties
    if (currentUser?.questionnaireCompleted) {
      console.log('✅ Questionnaire completed via currentUser');
      return true;
    }
    
    console.log('❌ Questionnaire NOT completed');
    return false;
  }, [userProfile?.questionnaire?.completed, currentUser?.questionnaireCompleted]);
  
  const isSelfAssessmentCompleted = useCallback((): boolean => {
    console.log('🔍 Checking self-assessment completion...');
    
    // Method 1: Check userProfile
    if (userProfile?.selfAssessment?.completed) {
      console.log('✅ Self-assessment completed via userProfile');
      return true;
    }
    
    // Method 2: Check localStorage
    const localCompleted = localStorageManager.getItem('self_assessment_completed');
    if (localCompleted === 'true') {
      console.log('✅ Self-assessment completed via localStorage');
      return true;
    }
    
    // Method 3: Check currentUser extended properties
    if (currentUser?.assessmentCompleted) {
      console.log('✅ Self-assessment completed via currentUser');
      return true;
    }
    
    console.log('❌ Self-assessment NOT completed');
    return false;
  }, [userProfile?.selfAssessment?.completed, currentUser?.assessmentCompleted]);

  // ✅ Create missing user document helper function
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
    try {
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
    } catch (error) {
      console.error('❌ Error creating user document:', error);
      // Continue with local profile even if Firebase fails
    }
    
    return newUserProfile;
  };

  // ✅ Enhanced user profile loader with automatic document creation
  const loadUserProfile = async (user: FirebaseUser) => {
    try {
      console.log('📊 Loading user profile for:', user.email);
      
      let profileData: UserProfile;
      
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.log('🔧 User document does not exist, creating new one...');
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
      } catch (firebaseError) {
        console.error('❌ Firebase error, creating local profile:', firebaseError);
        // Create local profile if Firebase fails
        profileData = await createUserDocument(user);
      }
      
      // 🔧 FIXED: Store completion status in localStorage for reliability
      if (profileData.questionnaire?.completed) {
        localStorageManager.setItem('questionnaire_completed', 'true');
      }
      if (profileData.selfAssessment?.completed) {
        localStorageManager.setItem('self_assessment_completed', 'true');
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
      
      console.log('✅ User profile loaded successfully', {
        questionnaireCompleted: profileData.questionnaire?.completed,
        selfAssessmentCompleted: profileData.selfAssessment?.completed
      });
      
    } catch (err) {
      console.error('❌ Error loading user profile:', err);
      setError('Error loading user profile');
      
      // Try to load from local storage as fallback
      const cachedProfile = localStorageManager.getItem('userProfile');
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          setUserProfile(parsedProfile);
          
          // Also check localStorage for completion status
          const questCompleted = localStorageManager.getItem('questionnaire_completed') === 'true';
          const selfCompleted = localStorageManager.getItem('self_assessment_completed') === 'true';
          
          console.log('✅ Loaded user profile from local storage fallback', {
            questionnaireCompleted: questCompleted,
            selfAssessmentCompleted: selfCompleted
          });
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
        // Clear localStorage on logout
        localStorageManager.removeItem('questionnaire_completed');
        localStorageManager.removeItem('self_assessment_completed');
        localStorageManager.removeItem('userProfile');
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
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 Creating new user account:', email);
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update display name
      await updateProfile(user, { displayName });
      
      // Create user document in Firestore
      await createUserDocument(user);
      
      // Log user intent
      intentDetection.logUserAction('signup_completed', { userId: user.uid });
      
      console.log('✅ User account created successfully:', user.email);
    } catch (err: any) {
      console.error('❌ Error creating user account:', err);
      setError(err.message || 'Error creating account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alias for signup
  const signUp = signup;

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 Logging in user:', email);
      
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // Log user intent
      intentDetection.logUserAction('login_completed', { email });
      
      console.log('✅ User logged in successfully:', email);
    } catch (err: any) {
      console.error('❌ Error logging in:', err);
      setError(err.message || 'Error logging in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Alias for login
  const signIn = login;

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 Logging out user');
      
      // Sign out from Firebase Auth
      await signOut(auth);
      
      // Clear local state
      setCurrentUser(null);
      setUserProfile(null);
      
      // Clear localStorage
      localStorageManager.removeItem('questionnaire_completed');
      localStorageManager.removeItem('self_assessment_completed');
      localStorageManager.removeItem('userProfile');
      
      // Log user intent
      intentDetection.logUserAction('logout_completed', {});
      
      console.log('✅ User logged out successfully');
      
      // Redirect to login page
      navigate('/login');
    } catch (err: any) {
      console.error('❌ Error logging out:', err);
      setError(err.message || 'Error logging out');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔐 Sending password reset email to:', email);
      
      // Send password reset email
      await sendPasswordResetEmail(auth, email);
      
      // Log user intent
      intentDetection.logUserAction('password_reset_requested', { email });
      
      console.log('✅ Password reset email sent successfully');
    } catch (err: any) {
      console.error('❌ Error sending password reset email:', err);
      setError(err.message || 'Error sending password reset email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile function
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentUser || !userProfile) {
        console.error('❌ Cannot update profile: No current user');
        setError('User not authenticated');
        return;
      }
      
      console.log('📝 Updating user profile:', data);
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      
      // Create a separate object for Firestore with proper types
      const firestoreData: Record<string, any> = {};
      
      // Copy all fields from data to firestoreData
      Object.keys(data).forEach(key => {
        firestoreData[key] = data[key as keyof Partial<UserProfile>];
      });
      
      // Convert Date objects to Firestore timestamps
      if (data.lastLoginAt) {
        firestoreData.lastLoginAt = serverTimestamp();
      }
      
      if (data.selfAssessment?.lastUpdated) {
        if (!firestoreData.selfAssessment) firestoreData.selfAssessment = {};
        firestoreData.selfAssessment.lastUpdated = serverTimestamp();
      }
      
      if (data.practiceStats?.lastSessionDate) {
        if (!firestoreData.practiceStats) firestoreData.practiceStats = {};
        firestoreData.practiceStats.lastSessionDate = serverTimestamp();
      }
      
      await updateDoc(userDocRef, firestoreData);
      
      // Update local state
      const updatedProfile = { ...userProfile, ...data };
      setUserProfile(updatedProfile);
      
      // Update localStorage
      localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Update extended user properties if needed
      if (data.currentStage && currentUser.currentStage !== data.currentStage) {
        const extendedUser = { ...currentUser };
        extendedUser.currentStage = data.currentStage;
        setCurrentUser(extendedUser);
      }
      
      if (data.selfAssessment?.completed && !currentUser.assessmentCompleted) {
        const extendedUser = { ...currentUser };
        extendedUser.assessmentCompleted = true;
        setCurrentUser(extendedUser);
        localStorageManager.setItem('self_assessment_completed', 'true');
      }
      
      if (data.questionnaire?.completed && !currentUser.questionnaireCompleted) {
        const extendedUser = { ...currentUser };
        extendedUser.questionnaireCompleted = true;
        setCurrentUser(extendedUser);
        localStorageManager.setItem('questionnaire_completed', 'true');
      }
      
      // Log user intent
      intentDetection.logUserAction('profile_updated', { userId: currentUser.uid });
      
      console.log('✅ User profile updated successfully');
    } catch (err: any) {
      console.error('❌ Error updating user profile:', err);
      setError(err.message || 'Error updating profile');
      
      // Try to update localStorage even if Firestore fails
      if (userProfile) {
        const updatedProfile = { ...userProfile, ...data };
        localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
        console.log('⚠️ Updated profile in localStorage as fallback');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile in context only (no Firestore)
  const updateUserProfileInContext = async (data: Partial<UserProfile>) => {
    try {
      if (!userProfile) {
        console.error('❌ Cannot update profile in context: No user profile');
        return;
      }
      
      console.log('📝 Updating user profile in context:', data);
      
      // Update local state
      const updatedProfile = { ...userProfile, ...data };
      setUserProfile(updatedProfile);
      
      // Update localStorage
      localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
      
      console.log('✅ User profile updated in context successfully');
    } catch (err: any) {
      console.error('❌ Error updating user profile in context:', err);
    }
  };

  // Update user email function
  const updateUserEmail = async (newEmail: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentUser) {
        console.error('❌ Cannot update email: No current user');
        setError('User not authenticated');
        return;
      }
      
      console.log('📝 Updating user email to:', newEmail);
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update email
      await updateEmail(currentUser, newEmail);
      
      // Update user profile
      if (userProfile) {
        await updateUserProfile({ email: newEmail });
      }
      
      // Log user intent
      intentDetection.logUserAction('email_updated', { userId: currentUser.uid });
      
      console.log('✅ User email updated successfully');
    } catch (err: any) {
      console.error('❌ Error updating user email:', err);
      setError(err.message || 'Error updating email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user password function
  const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentUser) {
        console.error('❌ Cannot update password: No current user');
        setError('User not authenticated');
        return;
      }
      
      console.log('🔐 Updating user password');
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      // Log user intent
      intentDetection.logUserAction('password_updated', { userId: currentUser.uid });
      
      console.log('✅ User password updated successfully');
    } catch (err: any) {
      console.error('❌ Error updating user password:', err);
      setError(err.message || 'Error updating password');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Send verification email function
  const sendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentUser) {
        console.error('❌ Cannot send verification email: No current user');
        setError('User not authenticated');
        return;
      }
      
      console.log('📧 Sending verification email to:', currentUser.email);
      
      // Send verification email
      await sendEmailVerification(currentUser);
      
      // Log user intent
      intentDetection.logUserAction('verification_email_sent', { userId: currentUser.uid });
      
      console.log('✅ Verification email sent successfully');
    } catch (err: any) {
      console.error('❌ Error sending verification email:', err);
      setError(err.message || 'Error sending verification email');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 🔧 FIXED: Complete questionnaire function
  const completeQuestionnaire = async (responses: any): Promise<void> => {
    try {
      console.log('📝 Completing questionnaire:', responses);
      
      // Ensure we have a valid user profile
      if (!userProfile) {
        console.error('❌ Cannot complete questionnaire: No user profile');
        setError('User profile not loaded');
        return;
      }
      
      // Update user profile with questionnaire data
      const updatedProfile = {
        ...userProfile,
        questionnaire: {
          completed: true,
          responses: responses,
          completedAt: new Date()
        }
      };
      
      // Save to Firestore
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            'questionnaire.completed': true,
            'questionnaire.responses': responses,
            'questionnaire.completedAt': serverTimestamp()
          });
          console.log('✅ Questionnaire saved to Firestore');
        } catch (firestoreError) {
          console.error('❌ Error saving to Firestore:', firestoreError);
          // Continue with local updates even if Firestore fails
        }
      }
      
      // Update local state
      setUserProfile(updatedProfile);
      
      // Set localStorage flag
      localStorageManager.setItem('questionnaire_completed', 'true');
      localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Update extended user
      if (currentUser) {
        const extendedUser = {...currentUser} as User;
        extendedUser.questionnaireCompleted = true;
        extendedUser.questionnaireAnswers = responses;
        setCurrentUser(extendedUser);
      }
      
      console.log('✅ Questionnaire completed successfully');
    } catch (err) {
      console.error('❌ Error completing questionnaire:', err);
      setError('Error completing questionnaire');
    }
  };
  
  // Alias for completeQuestionnaire
  const markQuestionnaireComplete = completeQuestionnaire;

  // 🔧 FIXED: Complete self-assessment function
  const completeSelfAssessment = async (responses: any): Promise<void> => {
    try {
      console.log('📝 Completing self-assessment:', responses);
      
      // Ensure we have a valid user profile
      if (!userProfile) {
        console.error('❌ Cannot complete self-assessment: No user profile');
        setError('User profile not loaded');
        return;
      }
      
      // FIXED: Ensure the completed flag is explicitly set to true
      const selfAssessmentData = {
        ...responses,
        completed: true,
        lastUpdated: new Date(),
        completedAt: new Date()
      };
      
      // Update user profile with self-assessment data
      const updatedProfile = {
        ...userProfile,
        selfAssessment: selfAssessmentData
      };
      
      // Save to Firestore
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            'selfAssessment': {
              ...selfAssessmentData,
              lastUpdated: serverTimestamp(),
              completedAt: serverTimestamp()
            }
          });
          console.log('✅ Self-assessment saved to Firestore');
        } catch (firestoreError) {
          console.error('❌ Error saving to Firestore:', firestoreError);
          // Continue with local updates even if Firestore fails
        }
      }
      
      // Update local state
      setUserProfile(updatedProfile);
      
      // CRITICAL: Set localStorage flags
      localStorageManager.setItem('self_assessment_completed', 'true');
      localStorageManager.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Update extended user
      if (currentUser) {
        const extendedUser = {...currentUser} as User;
        extendedUser.assessmentCompleted = true;
        extendedUser.selfAssessmentData = responses;
        setCurrentUser(extendedUser);
      }
      
      // Clear happiness cache to force recalculation
      localStorageManager.removeItem('happiness_points_cache');
      
      console.log('✅ Self-assessment completed successfully');
    } catch (err) {
      console.error('❌ Error completing self-assessment:', err);
      setError('Error completing self-assessment');
    }
  };
  
  // Alias for completeSelfAssessment
  const markSelfAssessmentComplete = completeSelfAssessment;

  // Extend session function
  const extendSession = () => {
    setShowLogoutWarning(false);
    console.log('⏱️ Session extended');
  };

  // Sync with local data function
  const syncWithLocalData = async () => {
    try {
      console.log('🔄 Syncing with local data');
      
      // Check if we have a user profile
      if (!userProfile || !currentUser) {
        console.log('❌ Cannot sync: No user profile or current user');
        return;
      }
      
      // Load data from localStorage
      const cachedProfile = localStorageManager.getItem('userProfile');
      if (!cachedProfile) {
        console.log('❌ No cached profile found');
        return;
      }
      
      const parsedProfile = JSON.parse(cachedProfile);
      
      // Check if cached profile is newer than current profile
      const cachedLastUpdated = new Date(parsedProfile.lastLoginAt);
      const currentLastUpdated = userProfile.lastLoginAt || new Date(0);
      
      if (cachedLastUpdated > currentLastUpdated) {
        console.log('🔄 Cached profile is newer, updating...');
        
        // Update user profile in Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, parsedProfile);
        
        // Update local state
        setUserProfile(parsedProfile);
        
        console.log('✅ Synced with local data successfully');
      } else {
        console.log('✅ Current profile is up to date');
      }
    } catch (err) {
      console.error('❌ Error syncing with local data:', err);
    }
  };

  // Add happiness points function
  const addHappinessPoints = async (points: number, reason: string) => {
    try {
      console.log(`📈 Adding ${points} happiness points for: ${reason}`);
      
      if (!userProfile) {
        console.error('❌ Cannot add happiness points: No user profile');
        return;
      }
      
      // Calculate new total
      const newTotal = userProfile.happinessPoints + points;
      
      // Update user profile
      await updateUserProfile({
        happinessPoints: newTotal
      });
      
      // Update Firestore with increment
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            happinessPoints: increment(points)
          });
        } catch (firestoreError) {
          console.error('❌ Error updating Firestore:', firestoreError);
          // Continue with local updates even if Firestore fails
        }
      }
      
      // Log happiness points event
      const event = {
        userId: currentUser?.uid,
        points,
        reason,
        timestamp: new Date()
      };
      
      // Store in localStorage for offline tracking
      const eventsKey = 'happiness_points_events';
      const existingEvents = JSON.parse(localStorageManager.getItem(eventsKey) || '[]');
      existingEvents.push(event);
      localStorageManager.setItem(eventsKey, JSON.stringify(existingEvents));
      
      // Log user intent
      intentDetection.logUserAction('happiness_points_added', event);
      
      console.log(`✅ Added ${points} happiness points, new total: ${newTotal}`);
      
      // Dispatch custom event for other components to listen
      const customEvent = new CustomEvent('happinessUpdated', {
        detail: {
          happiness_points: newTotal,
          points_added: points,
          reason: reason
        }
      });
      window.dispatchEvent(customEvent);
      
    } catch (err) {
      console.error('❌ Error adding happiness points:', err);
    }
  };

  // Add achievement function
  const addAchievement = async (achievement: string) => {
    try {
      console.log(`🏆 Adding achievement: ${achievement}`);
      
      if (!userProfile) {
        console.error('❌ Cannot add achievement: No user profile');
        return;
      }
      
      // Check if achievement already exists
      if (userProfile.achievements.includes(achievement)) {
        console.log('⚠️ Achievement already exists, skipping');
        return;
      }
      
      // Update user profile
      const updatedAchievements = [...userProfile.achievements, achievement];
      await updateUserProfile({
        achievements: updatedAchievements
      });
      
      // Update Firestore with arrayUnion
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            achievements: arrayUnion(achievement)
          });
        } catch (firestoreError) {
          console.error('❌ Error updating Firestore:', firestoreError);
          // Continue with local updates even if Firestore fails
        }
      }
      
      // Log user intent
      intentDetection.logUserAction('achievement_added', {
        userId: currentUser?.uid,
        achievement
      });
      
      console.log(`✅ Achievement added: ${achievement}`);
      
      // Add happiness points for achievement
      await addHappinessPoints(10, `Achievement unlocked: ${achievement}`);
      
    } catch (err) {
      console.error('❌ Error adding achievement:', err);
    }
  };

  // Add note function
  const addNote = async (note: any) => {
    try {
      console.log(`📝 Adding note:`, note);
      
      if (!userProfile) {
        console.error('❌ Cannot add note: No user profile');
        return;
      }
      
      // Add timestamp to note
      const noteWithTimestamp = {
        ...note,
        timestamp: new Date()
      };
      
      // Update user profile
      const updatedNotes = [...userProfile.notes, noteWithTimestamp];
      await updateUserProfile({
        notes: updatedNotes
      });
      
      // Update Firestore with arrayUnion
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            notes: arrayUnion({
              ...noteWithTimestamp,
              timestamp: serverTimestamp()
            })
          });
        } catch (firestoreError) {
          console.error('❌ Error updating Firestore:', firestoreError);
          // Continue with local updates even if Firestore fails
        }
      }
      
      // Log user intent
      intentDetection.logUserAction('note_added', {
        userId: currentUser?.uid,
        noteId: noteWithTimestamp.id
      });
      
      console.log(`✅ Note added successfully`);
      
    } catch (err) {
      console.error('❌ Error adding note:', err);
    }
  };

  // Update last session function
  const updateLastSession = async (duration: number) => {
    try {
      console.log(`⏱️ Updating last session: ${duration} minutes`);
      
      if (!userProfile) {
        console.error('❌ Cannot update last session: No user profile');
        return;
      }
      
      // Calculate new stats
      const totalSessions = userProfile.practiceStats.totalSessions + 1;
      const totalMinutes = userProfile.practiceStats.totalMinutes + duration;
      
      // Calculate streak
      let streakDays = userProfile.practiceStats.streakDays;
      let longestStreak = userProfile.practiceStats.longestStreak;
      
      const lastSessionDate = userProfile.practiceStats.lastSessionDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (lastSessionDate) {
        const lastDate = new Date(lastSessionDate);
        lastDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day
          streakDays += 1;
          if (streakDays > longestStreak) {
            longestStreak = streakDays;
          }
        } else if (diffDays > 1) {
          // Streak broken
          streakDays = 1;
        }
        // If diffDays === 0, it's the same day, so don't change streak
      } else {
        // First session ever
        streakDays = 1;
        longestStreak = 1;
      }
      
      // Update user profile
      await updateUserProfile({
        practiceStats: {
          totalSessions,
          totalMinutes,
          lastSessionDate: new Date(),
          streakDays,
          longestStreak
        }
      });
      
      // Update Firestore
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            'practiceStats.totalSessions': increment(1),
            'practiceStats.totalMinutes': increment(duration),
            'practiceStats.lastSessionDate': serverTimestamp(),
            'practiceStats.streakDays': streakDays,
            'practiceStats.longestStreak': longestStreak
          });
        } catch (firestoreError) {
          console.error('❌ Error updating Firestore:', firestoreError);
          // Continue with local updates even if Firestore fails
        }
      }
      
      // Log user intent
      intentDetection.logUserAction('session_completed', {
        userId: currentUser?.uid,
        duration,
        streakDays
      });
      
      console.log(`✅ Last session updated successfully`);
      
      // Add happiness points for session
      await addHappinessPoints(Math.ceil(duration / 5), `Completed ${duration} minute practice session`);
      
      // Check for streak achievements
      if (streakDays === 3) {
        await addAchievement('three_day_streak');
      } else if (streakDays === 7) {
        await addAchievement('seven_day_streak');
      } else if (streakDays === 30) {
        await addAchievement('thirty_day_streak');
      }
      
      // Check for session count achievements
      if (totalSessions === 10) {
        await addAchievement('ten_sessions');
      } else if (totalSessions === 50) {
        await addAchievement('fifty_sessions');
      } else if (totalSessions === 100) {
        await addAchievement('hundred_sessions');
      }
      
    } catch (err) {
      console.error('❌ Error updating last session:', err);
    }
  };

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
    signUp,
    login,
    signIn,
    logout,
    resetPassword,
    
    // Profile management
    updateUserProfile,
    updateUserProfileInContext,
    updateUserEmail,
    updateUserPassword,
    sendVerificationEmail,
    
    // Completion management
    completeQuestionnaire,
    markQuestionnaireComplete,
    completeSelfAssessment,
    markSelfAssessmentComplete,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    
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

