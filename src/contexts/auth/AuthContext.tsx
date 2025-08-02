// ✅ ENHANCED AuthContext with Real-Time User Deletion Detection
// File: src/contexts/auth/AuthContext.tsx

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
  EmailAuthProvider,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  FieldValue,
  Firestore,
  onSnapshot
} from 'firebase/firestore';
import { FirebaseApp } from 'firebase/app';
import app, { auth as firebaseAuth, db as firebaseDb } from '../../firebase';

// Enhanced Local Storage Manager (for auth-only data)
class EnhancedLocalStorageManager {
  setItem(key: string, value: string): void {
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

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Silent error handling
    }
  }
}

// Smart Intent Detection (for auth actions only)
class SmartIntentDetection {
  logUserAction(action: string, data: any): void {
    // Production ready - no debug logging
  }
}

// ✅ CLEANED: User interface with only auth-related properties
interface User extends FirebaseUser {
  membershipType?: 'free' | 'premium' | 'admin';
  currentStage?: string;
  goals?: string[];
  assessmentCompleted?: boolean;
}

// ✅ CLEANED: Define the shape of the user profile (auth-only)
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
  currentStage?: string;
  goals?: string[];
}

// FirestoreUserProfile interface for Firestore operations
interface FirestoreUserProfile extends Omit<UserProfile, 'createdAt' | 'lastLoginAt' | 'memberSince'> {
  createdAt: FieldValue | null;
  lastLoginAt: FieldValue | null;
  memberSince: FieldValue | null;
}

// ✅ ENHANCED: AuthContext interface with real-time detection
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
  
  // ✅ NEW: Real-time token validation
  checkTokenValidity: () => Promise<boolean>;
  
  // Utility
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ ENHANCED: Create a provider component with real-time user deletion detection
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogoutWarning, setShowLogoutWarning] = useState<boolean>(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(0);
  
  // ✅ FIXED: Use pre-initialized Firebase instances from firebase.js
  const auth: Auth = firebaseAuth;
  const db: Firestore = firebaseDb;
  
  // ✅ PERFORMANCE FIX: Create stable instances to avoid dependency issues
  const localStorageManager = useCallback(() => new EnhancedLocalStorageManager(), []);
  const intentDetection = useCallback(() => new SmartIntentDetection(), []);

  // Computed properties
  const isAuthenticated = !!currentUser;

  // ✅ NEW: Real-time token validation with server
  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // Get current user's ID token
      const idToken = await currentUser.getIdToken();
      
      // Check with your admin server
      const response = await fetch('http://localhost:3001/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.shouldSignOut) {
          console.log('🚨 Server says user should sign out:', errorData.reason);
          await signOut(auth);
          return false;
        }
      }

      const data = await response.json();
      return data.valid === true;

    } catch (error) {
      console.error('Token validation failed:', error);
      // Don't force logout on network errors
      return true;
    }
  }, [currentUser, auth]);

  // Create missing user document helper function
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
      currentStage: '0',
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
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to save user profile to Firestore:', firestoreError);
      }
    }
    
    return newUserProfile;
  }, [db]);

  // Load user profile with enhanced error handling
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
          currentStage: data.currentStage || '0',
          goals: data.goals || []
        } as UserProfile;
        
        return profile;
      } else {
        // Create new user document
        return await createUserDocument(user);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Error loading user profile:', error);
      }
      // Fallback to creating a basic profile
      return await createUserDocument(user);
    }
  }, [db, createUserDocument]);

  // ✅ NEW: Real-time user deletion detection
  useEffect(() => {
    if (!currentUser?.uid || !db) return;

    console.log('🔍 Setting up real-time deletion detection for user:', currentUser.uid);

    // Listen to deletedUsers collection for this user
    const deletedUserRef = doc(db, 'deletedUsers', currentUser.uid);
    
    const unsubscribe = onSnapshot(deletedUserRef, (doc) => {
      if (doc.exists()) {
        console.log('🚨 User has been deleted from another device/admin panel');
        console.log('Deletion info:', doc.data());
        
        // Force immediate logout
        signOut(auth).then(() => {
          alert('Your account has been deleted by an administrator. You will be signed out.');
          window.location.reload();
        });
      }
    }, (error) => {
      console.error('Error listening for user deletion:', error);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, db, auth]);

  // ✅ NEW: Periodic token validation
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔍 Starting periodic token validation for user:', currentUser.email);

    // Check token validity every 5 minutes
    const interval = setInterval(async () => {
      const isValid = await checkTokenValidity();
      if (!isValid) {
        console.log('🚨 Token is no longer valid, user will be signed out');
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [currentUser, checkTokenValidity]);

  // ✅ CRITICAL FIX: Auth state change listener with proper race condition handling
  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? 'User logged in' : 'User logged out');
      
      if (!mounted) return;
      
      if (user) {
        try {
          // ✅ NEW: Check if user still exists on server
          const tokenValid = await checkTokenValidity();
          
          if (!tokenValid) {
            console.log('🚨 User token invalid during auth state change');
            if (mounted) {
              setCurrentUser(null);
              setUserProfile(null);
              setIsLoading(false);
            }
            return;
          }

          // ✅ CRITICAL: Wait for profile to load before setting user
          const profile = await loadUserProfile(user);
          
          if (mounted) {
            // Set additional properties on currentUser
            const enhancedUser = user as User;
            enhancedUser.currentStage = profile?.currentStage || '0';
            enhancedUser.goals = profile?.goals || [];
            enhancedUser.assessmentCompleted = false;
            
            setUserProfile(profile);
            setCurrentUser(enhancedUser);
            console.log('✅ User profile loaded and set');
            
            // Update last login time
            try {
              if (profile) {
                await updateDoc(doc(db, 'users', user.uid), {
                  lastLoginAt: serverTimestamp()
                });
              }
            } catch (error) {
              // Silent error handling
              if (process.env.NODE_ENV === 'development') {
                console.warn('Failed to update last login time:', error);
              }
            }
          }
        } catch (error) {
          console.error('❌ Error in auth state change:', error);
          if (mounted) {
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
      } else {
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
          console.log('✅ User cleared');
        }
      }
      
      // ✅ CRITICAL: Set loading to false AFTER state is fully updated
      if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth, db, loadUserProfile, checkTokenValidity]);

  // ✅ CRITICAL FIX: Authentication methods with proper state management
  const signup = useCallback(async (email: string, password: string, displayName: string) => {
    const intent = intentDetection();
    
    try {
      // ✅ CRITICAL: Don't set loading to false until auth state changes
      setError(null);
      
      console.log('🔐 Starting sign up...');
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      intent.logUserAction('user_signup', {
        userId: result.user.uid,
        email: result.user.email
      });
      
      // ✅ CRITICAL: Don't set loading false or navigate here
      // Let onAuthStateChanged handle the state update
      console.log('✅ Sign up successful - waiting for auth state to update');
      
    } catch (err: any) {
      // ✅ CRITICAL: Only set loading false on error
      setIsLoading(false);
      const errorMessage = err?.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    }
  }, [auth, intentDetection]);

  // Alias for signup
  const signUp = signup;

  const login = useCallback(async (email: string, password: string) => {
    const intent = intentDetection();
    
    try {
      // ✅ CRITICAL: Don't set loading to false until auth state changes
      setError(null);
      
      console.log('🔐 Starting sign in...');
      await signInWithEmailAndPassword(auth, email, password);
      
      intent.logUserAction('user_login', {
        email: email
      });
      
      // ✅ CRITICAL: Don't set loading false or navigate here
      // Let onAuthStateChanged handle the state update
      console.log('✅ Sign in successful - waiting for auth state to update');
      
    } catch (err: any) {
      // ✅ CRITICAL: Only set loading false on error
      setIsLoading(false);
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  }, [auth, intentDetection]);

  // Alias for login
  const signIn = login;

  // ✅ PERFORMANCE FIX: Profile management methods (auth-only)
  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    const storage = localStorageManager();
    const intent = intentDetection();
    
    try {
      if (!currentUser || !userProfile) {
        throw new Error('No user logged in');
      }

      const updatedProfile = { ...userProfile, ...data };
      setUserProfile(updatedProfile);
      
      // Update currentUser properties if they're being updated
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
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser, userProfile, db, localStorageManager, intentDetection]);

  // ✅ PERFORMANCE FIX: Logout function with useCallback
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
      const errorMessage = err?.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth, currentUser?.uid, localStorageManager, intentDetection]);

  // ✅ PERFORMANCE FIX: Session timeout management with proper dependencies
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    let warningTimeoutId: NodeJS.Timeout | undefined;
    let countdownInterval: NodeJS.Timeout | undefined;
    
    if (currentUser) {
      // Show warning 5 minutes before logout (25 minutes)
      warningTimeoutId = setTimeout(() => {
        setShowLogoutWarning(true);
        setSessionTimeRemaining(300); // 5 minutes
        
        // Start countdown
        countdownInterval = setInterval(() => {
          setSessionTimeRemaining(prev => {
            if (prev <= 1) {
              if (countdownInterval) clearInterval(countdownInterval);
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
      if (timeoutId) clearTimeout(timeoutId);
      if (warningTimeoutId) clearTimeout(warningTimeoutId);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [currentUser, logout]);

  // Extend session function
  const extendSession = useCallback(() => {
    setShowLogoutWarning(false);
    setSessionTimeRemaining(0);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const intent = intentDetection();
    
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      
      intent.logUserAction('password_reset_requested', {
        email
      });
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Password reset failed';
      setError(errorMessage);
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
      const errorMessage = err?.message || 'Email update failed';
      setError(errorMessage);
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
      const errorMessage = err?.message || 'Password update failed';
      setError(errorMessage);
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
      const errorMessage = err?.message || 'Verification email failed';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser, intentDetection]);

  // ✅ CLEANED: Sync with local data (placeholder - LocalDataContext handles all data now)
  const syncWithLocalData = useCallback(async () => {
    try {
      // This method now just serves as a placeholder
      // All data syncing is handled by LocalDataContext
    } catch (err) {
      // Silent error handling
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ ENHANCED: Create context value with real-time detection methods
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
    
    // ✅ NEW: Real-time token validation
    checkTokenValidity,
    
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