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
  FieldValue
} from 'firebase/firestore';
import app from './firebase';

// Enhanced Local Storage Manager (for auth-only data)
class EnhancedLocalStorageManager {
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Silent error handling
    }
  }

  getItem(key: string): string | null {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      return null;
    }
  }

  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Silent error handling
    }
  }
}

// Smart Intent Detection (for auth actions only)
class SmartIntentDetection {
  logUserAction(action: string, data: any) {
    // Removed debug logging to prevent infinite loops
  }
}

// ✅ FIXED: Extended User interface with missing properties
interface User extends FirebaseUser {
  membershipType?: 'free' | 'premium' | 'admin';
  // ✅ ADD: Missing properties that other components expect
  currentStage?: string;
  goals?: string[];
  assessmentCompleted?: boolean;
}

// ✅ FIXED: Define the shape of the user profile with missing properties
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
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    soundEnabled: boolean;
    language: string;
    reminderTime: string | null;
  };
  customFields?: Record<string, any>;
  // ✅ ADD: Missing properties that other components expect
  currentStage?: string;
  selfAssessment?: any;
  goals?: string[];
}

// FirestoreUserProfile interface for Firestore operations
interface FirestoreUserProfile extends Omit<UserProfile, 'createdAt' | 'lastLoginAt' | 'memberSince'> {
  createdAt: FieldValue | null;
  lastLoginAt: FieldValue | null;
  memberSince: FieldValue | null;
}

// ✅ FIXED: AuthContext interface with missing methods
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
  
  // Profile management (auth-only)
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserProfileInContext: (data: Partial<UserProfile>) => Promise<void>;
  updateUserEmail: (newEmail: string, password: string) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  
  // Session management
  showLogoutWarning: boolean;
  sessionTimeRemaining: number;
  extendSession: () => void;
  syncWithLocalData: () => Promise<void>;
  
  // ✅ ADD: Missing data storage methods (deprecated - use LocalDataContext)
  markQuestionnaireComplete: (answers: any) => Promise<void>;
  markSelfAssessmentComplete: (data: any) => Promise<void>;
  isSelfAssessmentCompleted: () => boolean;
  
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
  
  // ✅ FIXED: Create stable instances to avoid dependency issues
  const localStorageManager = useCallback(() => new EnhancedLocalStorageManager(), []);
  const intentDetection = useCallback(() => new SmartIntentDetection(), []);

  // Computed properties
  const isAuthenticated = !!currentUser;

  // ✅ Create missing user document helper function
  const createUserDocument = useCallback(async (user: FirebaseUser): Promise<UserProfile> => {
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
      preferences: {
        theme: 'system',
        notifications: true,
        soundEnabled: true,
        language: 'en',
        reminderTime: null
      },
      // ✅ ADD: Initialize missing properties
      currentStage: '0',
      selfAssessment: null,
      goals: []
    };
    
    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...newUserProfile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        memberSince: serverTimestamp()
      } as FirestoreUserProfile);
    } catch (firestoreError) {
      // Continue with local profile even if Firestore fails
    }
    
    return newUserProfile;
  }, [db]);

  // ✅ Load user profile with enhanced error handling
  const loadUserProfile = useCallback(async (user: FirebaseUser): Promise<UserProfile | null> => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Convert Firestore timestamps to Date objects
        const profile: UserProfile = {
          ...data,
          createdAt: data.createdAt?.toDate() || null,
          lastLoginAt: data.lastLoginAt?.toDate() || null,
          memberSince: data.memberSince?.toDate() || null,
          // ✅ ADD: Ensure missing properties have defaults
          currentStage: data.currentStage || '0',
          selfAssessment: data.selfAssessment || null,
          goals: data.goals || []
        } as UserProfile;
        
        // ✅ ADD: Set additional properties on currentUser
        const enhancedUser = user as User;
        enhancedUser.currentStage = profile.currentStage;
        enhancedUser.goals = data.goals || [];
        enhancedUser.assessmentCompleted = !!data.selfAssessment?.completed;
        
        setCurrentUser(enhancedUser);
        
        return profile;
      } else {
        // Create new user document
        return await createUserDocument(user);
      }
    } catch (error) {
      // Fallback to creating a basic profile
      return await createUserDocument(user);
    }
  }, [db, createUserDocument]);

  // ✅ Profile management methods (auth-only)
  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    const storage = localStorageManager();
    const intent = intentDetection();
    
    try {
      if (!currentUser || !userProfile) {
        throw new Error('No user logged in');
      }

      const updatedProfile = { ...userProfile, ...data };
      setUserProfile(updatedProfile);
      
      // ✅ ADD: Update currentUser properties if they're being updated
      if (data.currentStage !== undefined) {
        const updatedUser = { ...currentUser, currentStage: data.currentStage };
        setCurrentUser(updatedUser);
      }
      
      // Update localStorage (auth profile only)
      storage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Update Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, data);
      
      intent.logUserAction('profile_updated', {
        userId: currentUser.uid,
        updatedFields: Object.keys(data)
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentUser, userProfile, db, localStorageManager, intentDetection]);

  // ✅ ADD: Deprecated data storage methods (for backward compatibility)
  const markQuestionnaireComplete = useCallback(async (answers: any) => {
    console.warn('⚠️ DEPRECATED: markQuestionnaireComplete in AuthContext. Use LocalDataContext instead.');
    // Delegate to LocalDataContext or provide minimal implementation
    try {
      // Minimal implementation - just log the call
      if (currentUser) {
        localStorage.setItem(`questionnaire_${currentUser.uid}`, JSON.stringify({
          completed: true,
          responses: answers,
          completedAt: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error in deprecated markQuestionnaireComplete:', error);
    }
  }, [currentUser]);

  const markSelfAssessmentComplete = useCallback(async (data: any) => {
    console.warn('⚠️ DEPRECATED: markSelfAssessmentComplete in AuthContext. Use LocalDataContext instead.');
    try {
      if (currentUser && userProfile) {
        // Update the user profile with self-assessment data
        await updateUserProfile({
          selfAssessment: {
            ...data,
            completed: true,
            completedAt: new Date().toISOString()
          }
        });
        
        // Update currentUser assessmentCompleted flag
        const updatedUser = { ...currentUser, assessmentCompleted: true };
        setCurrentUser(updatedUser);
      }
    } catch (error) {
      console.error('Error in deprecated markSelfAssessmentComplete:', error);
    }
  }, [currentUser, userProfile, updateUserProfile]);

  const isSelfAssessmentCompleted = useCallback(() => {
    console.warn('⚠️ DEPRECATED: isSelfAssessmentCompleted in AuthContext. Use LocalDataContext instead.');
    return !!(userProfile?.selfAssessment?.completed || currentUser?.assessmentCompleted);
  }, [userProfile, currentUser]);

  // ✅ FIXED: Logout function with useCallback
  const logout = useCallback(async () => {
    const storage = localStorageManager();
    const intent = intentDetection();
    
    try {
      setIsLoading(true);
      
      intent.logUserAction('user_logout', {
        userId: currentUser?.uid
      });
      
      await signOut(auth);
      setShowLogoutWarning(false);
      setSessionTimeRemaining(0);
      
      // Clear only auth-related localStorage
      storage.removeItem('userProfile');
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth, currentUser?.uid, localStorageManager, intentDetection]);

  // ✅ FIXED: Auth state change listener with proper dependencies
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await loadUserProfile(user);
        setUserProfile(profile);
        
        // Update last login time
        try {
          if (profile) {
            await updateDoc(doc(db, 'users', user.uid), {
              lastLoginAt: serverTimestamp()
            });
          }
        } catch (error) {
          // Silent error handling
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, [auth, db, loadUserProfile]);

  // ✅ FIXED: Session timeout management with proper dependencies
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningTimeoutId: NodeJS.Timeout;
    
    if (currentUser) {
      // Show warning 5 minutes before logout (25 minutes)
      warningTimeoutId = setTimeout(() => {
        setShowLogoutWarning(true);
        setSessionTimeRemaining(300); // 5 minutes
        
        // Start countdown
        const countdownInterval = setInterval(() => {
          setSessionTimeRemaining(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      }, 25 * 60 * 1000); // 25 minutes
      
      // Auto logout after 30 minutes
      timeoutId = setTimeout(() => {
        logout();
      }, 30 * 60 * 1000); // 30 minutes
    }
    
    return () => {
      clearTimeout(timeoutId);
      clearTimeout(warningTimeoutId);
    };
  }, [currentUser, logout]);

  // Extend session function
  const extendSession = useCallback(() => {
    setShowLogoutWarning(false);
    setSessionTimeRemaining(0);
  }, []);

  // ✅ Authentication methods
  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const intent = intentDetection();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Create user profile
      const profile = await createUserDocument(result.user);
      setUserProfile(profile);
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      intent.logUserAction('user_signup', {
        userId: result.user.uid,
        email: result.user.email
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth, createUserDocument, intentDetection]);

  // Alias for signup
  const signUp = signup;

  const login = useCallback(async (email: string, password: string) => {
    const intent = intentDetection();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      intent.logUserAction('user_login', {
        userId: result.user.uid,
        email: result.user.email
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth, intentDetection]);

  // Alias for login
  const signIn = login;

  const resetPassword = useCallback(async (email: string) => {
    const intent = intentDetection();
    
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      
      intent.logUserAction('password_reset_requested', {
        email
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [auth, intentDetection]);

  // Alias for updateUserProfile
  const updateUserProfileInContext = updateUserProfile;

  const updateUserEmail = useCallback(async (newEmail: string, password: string) => {
    const intent = intentDetection();
    
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update email
      await updateEmail(currentUser, newEmail);
      
      // Update profile
      await updateUserProfile({ email: newEmail });
      
      // Send verification email
      await sendEmailVerification(currentUser);
      
      intent.logUserAction('email_updated', {
        userId: currentUser.uid,
        newEmail
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentUser, updateUserProfile, intentDetection]);

  const updateUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    const intent = intentDetection();
    
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      intent.logUserAction('password_updated', {
        userId: currentUser.uid
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentUser, intentDetection]);

  const sendVerificationEmail = useCallback(async () => {
    const intent = intentDetection();
    
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await sendEmailVerification(currentUser);
      
      intent.logUserAction('verification_email_sent', {
        userId: currentUser.uid
      });
      
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, [currentUser, intentDetection]);

  // ✅ Sync with local data (placeholder - LocalDataContext handles all data now)
  const syncWithLocalData = useCallback(async () => {
    try {
      // This method now just serves as a placeholder
      // All data syncing is handled by LocalDataContext
      console.log('🔄 Auth context sync requested - LocalDataContext handles all data');
    } catch (err) {
      // Silent error handling
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ FIXED: Create context value with all required methods
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
    
    // Profile management (auth-only)
    updateUserProfile,
    updateUserProfileInContext,
    updateUserEmail,
    updateUserPassword,
    sendVerificationEmail,
    
    // Session management
    showLogoutWarning,
    sessionTimeRemaining,
    extendSession,
    syncWithLocalData,
    
    // ✅ ADD: Deprecated data storage methods (for backward compatibility)
    markQuestionnaireComplete,
    markSelfAssessmentComplete,
    isSelfAssessmentCompleted,
    
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