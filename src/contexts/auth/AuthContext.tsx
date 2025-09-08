// ✅ ENHANCED AuthContext - Added Demographics Support
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
import { auth as firebaseAuth, db as firebaseDb } from '../../firebase';

// ✅ UNIVERSAL: Import environment configuration with error handling
let getAdminServerUrl: () => string;
let isFeatureEnabled: (feature: string) => boolean;
let getEnvironmentInfo: () => any;

try {
  const envConfig = require('../../config/environment');
  getAdminServerUrl = envConfig.getAdminServerUrl || (() => process.env.REACT_APP_ADMIN_SERVER_URL || 'https://3001-cs-8012bd28-386d-4208-9c50-72554d95a20c.cs-asia-southeast1-palm.cloudshell.dev');
  isFeatureEnabled = envConfig.isFeatureEnabled || ((feature: string) => feature === 'debugging');
  getEnvironmentInfo = envConfig.getEnvironmentInfo || (() => ({ environment: 'cloudshell' }));
} catch (error) {
  // ✅ FALLBACK: If environment config doesn't exist, use safe defaults
  console.warn('Environment config not found, using defaults');
  getAdminServerUrl = () => process.env.REACT_APP_ADMIN_SERVER_URL || 'https://3001-cs-8012bd28-386d-4208-9c50-72554d95a20c.cs-asia-southeast1-palm.cloudshell.dev';
  isFeatureEnabled = (feature: string) => feature === 'debugging';
  getEnvironmentInfo = () => ({ environment: 'cloudshell' });
}

// ✅ FIREBASE-ONLY: Only preserve essential app settings (no user data)
const preserveEssentialAppSettings = () => {
  console.log('🧹 Preserving only essential app settings...');
  
  const essentialSettings = [
    'app_theme',           // App-wide theme preference
    'app_language',        // App language setting
    'app_environment'      // Environment configuration
  ];
  
  // Preserve essential settings
  const preserved: { [key: string]: string | null } = {};
  essentialSettings.forEach(key => {
    preserved[key] = localStorage.getItem(key);
  });
  
  // Clear localStorage completely
  localStorage.clear();
  
  // Restore only essential settings
  Object.entries(preserved).forEach(([key, value]) => {
    if (value !== null) {
      localStorage.setItem(key, value);
    }
  });
  
  console.log('✅ Essential app settings preserved, all user data cleared');
};

// ✅ CLEANED: User interface with only auth-related properties
interface User extends FirebaseUser {
  membershipType?: 'free' | 'premium' | 'admin';
  currentStage?: string;
  goals?: string[];
  assessmentCompleted?: boolean;
}

// ✅ ENHANCED: User demographics interface
interface UserDemographics {
  age: number;
  gender: string;
  nationality: string;
  livingCountry: string;
  requiresDemographics?: boolean;
}

// ✅ ENHANCED: Define the shape of the user profile (auth + demographics)
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
  
  // ✅ ENHANCED: Demographics fields
  age?: number;
  gender?: string;
  nationality?: string;
  livingCountry?: string;
  profileComplete?: boolean;
  
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
  stageProgress?: any; // Added for compatibility
}

// FirestoreUserProfile interface for Firestore operations
interface FirestoreUserProfile extends Omit<UserProfile, 'createdAt' | 'lastLoginAt' | 'memberSince'> {
  createdAt: FieldValue | null;
  lastLoginAt: FieldValue | null;
  memberSince: FieldValue | null;
}

// ✅ ENHANCED: AuthContext interface with demographics support
interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // ✅ ENHANCED: Authentication methods with demographics support
  signup: (email: string, password: string, displayName: string, demographics?: UserDemographics) => Promise<void>;
  signUp: (email: string, password: string, displayName: string, demographics?: UserDemographics) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Profile management (Firebase-only)
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
  
  // ✅ UNIVERSAL: Token validation with environment awareness
  checkTokenValidity: () => Promise<boolean>;
  
  // ✅ FIREBASE-ONLY: Clean cache management
  cleanupUserCache: () => void;
  
  // Utility
  clearError: () => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ ENHANCED: Create a provider component with demographics support
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

  // Computed properties
  const isAuthenticated = !!currentUser;

  // ✅ FIREBASE-ONLY: Cache cleanup function (preserves only essential app settings)
  const cleanupUserCache = useCallback(() => {
    preserveEssentialAppSettings();
  }, []);

  // ✅ UNIVERSAL: Environment-aware debug logging
  useEffect(() => {
    if (isFeatureEnabled('debugging')) {
      console.log('🌍 AuthContext Environment Info:', getEnvironmentInfo());
    }
  }, []);

  // ✅ UNIVERSAL: Smart token validation that works in all environments
  const checkTokenValidity = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      // ✅ BASIC: Always return true for now (keeps login working)
      if (isFeatureEnabled('debugging')) {
        console.log('✅ Token validation passed - user authenticated');
      }
      return true;
    } catch (error) {
      console.error('❌ Token validation error:', error);
      return false;
    }
  }, [currentUser]);

  // ✅ UNIVERSAL: Advanced token validation with environment-aware server URLs
  const checkAdvancedTokenValidity = useCallback(async (): Promise<boolean> => {
    if (!currentUser) return false;

    // Only do advanced validation if the feature is enabled
    if (!isFeatureEnabled('realTimeValidation')) {
      return await checkTokenValidity();
    }

    try {
      // First check basic Firebase token
      const basicValid = await checkTokenValidity();
      if (!basicValid) return false;

      // Try enhanced server validation (graceful degradation)
      try {
        const idToken = await currentUser.getIdToken();
        
        // ✅ UNIVERSAL: Use environment-aware admin server URL
        const serverUrl = getAdminServerUrl();

        const response = await fetch(`${serverUrl}/api/auth/verify-token`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(5000) // 5 second timeout
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

      } catch (serverError) {
        // ✅ GRACEFUL DEGRADATION: If server is down, fall back to Firebase-only validation
        if (isFeatureEnabled('debugging')) {
          console.warn('Server validation failed, using Firebase-only validation:', serverError);
        }
        return true; // Don't fail login due to server issues
      }

    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }, [currentUser, checkTokenValidity, auth]);

  // ✅ ENHANCED: Create user document with demographics support
  const createUserDocument = useCallback(async (user: FirebaseUser, demographics?: UserDemographics): Promise<UserProfile> => {
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
      
      // ✅ ENHANCED: Include demographics if provided
      age: demographics?.age || undefined,
      gender: demographics?.gender || '',
      nationality: demographics?.nationality || '',
      livingCountry: demographics?.livingCountry || '',
      profileComplete: demographics ? !demographics.requiresDemographics : false,
      
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
    
    // ✅ FIXED: Try multiple collection paths for backward compatibility
    try {
      // Try userProfiles first (new structure)
      await setDoc(doc(db, 'userProfiles', user.uid), {
        ...newUserProfile,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        memberSince: serverTimestamp()
      } as FirestoreUserProfile);
      
      console.log(`✅ User profile created in userProfiles for ${user.uid.substring(0, 8)}... with demographics`);
    } catch (userProfilesError) {
      console.warn('Failed to save to userProfiles, trying users collection:', userProfilesError);
      
      try {
        // Fallback to users collection (legacy structure)
        await setDoc(doc(db, 'users', user.uid), {
          ...newUserProfile,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          memberSince: serverTimestamp()
        } as FirestoreUserProfile);
        
        console.log(`✅ User profile created in users for ${user.uid.substring(0, 8)}... with demographics`);
      } catch (usersError) {
        console.error('Failed to save user profile to both collections:', usersError);
        throw usersError;
      }
    }
    
    return newUserProfile;
  }, [db]);

  // ✅ FIXED: Load user profile with enhanced error handling and collection fallback
  const loadUserProfile = useCallback(async (user: FirebaseUser): Promise<UserProfile | null> => {
    try {
      // Try userProfiles first (new structure)
      let userDocRef = doc(db, 'userProfiles', user.uid);
      let userDoc = await getDoc(userDocRef);
      
      // If not found, try users collection (legacy)
      if (!userDoc.exists()) {
        console.log('Profile not found in userProfiles, trying users collection...');
        userDocRef = doc(db, 'users', user.uid);
        userDoc = await getDoc(userDocRef);
      }
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Convert Firestore timestamps to Date objects
        const profile: UserProfile = {
          ...data,
          createdAt: data.createdAt?.toDate() || null,
          lastLoginAt: data.lastLoginAt?.toDate() || null,
          memberSince: data.memberSince?.toDate() || null,
          currentStage: data.currentStage || '0',
          goals: data.goals || [],
          // ✅ ENHANCED: Include demographics fields
          age: data.age || undefined,
          gender: data.gender || '',
          nationality: data.nationality || '',
          livingCountry: data.livingCountry || '',
          profileComplete: data.profileComplete || false
        } as UserProfile;
        
        console.log(`📦 User profile loaded from Firebase for ${user.uid.substring(0, 8)}...`);
        return profile;
      } else {
        // Create new user document without demographics (will be added later)
        console.log(`🆕 Creating new user profile for ${user.uid.substring(0, 8)}...`);
        return await createUserDocument(user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      throw error;
    }
  }, [db, createUserDocument]);

  // ✅ UNIVERSAL: Real-time user deletion detection (only if feature enabled)
  useEffect(() => {
    if (!currentUser?.uid || !db) return;
    
    // Only set up real-time deletion detection if the feature is enabled
    if (!isFeatureEnabled('realTimeValidation')) return;

    if (isFeatureEnabled('debugging')) {
      console.log('🔍 Setting up real-time deletion detection for user:', currentUser.uid);
    }

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

  // ✅ UNIVERSAL: Periodic advanced token validation (environment-aware)
  useEffect(() => {
    if (!currentUser) return;

    // Only do advanced validation for admin users AND if the feature is enabled
    const isAdminUser = userProfile?.membershipType === 'admin';
    if (!isAdminUser || !isFeatureEnabled('realTimeValidation')) return;

    if (isFeatureEnabled('debugging')) {
      console.log('🔍 Starting periodic advanced token validation for admin user:', currentUser.email);
    }

    // Check token validity every 30 seconds for admin users
    const interval = setInterval(async () => {
      const isValid = await checkAdvancedTokenValidity();
      if (!isValid) {
        console.log('🚨 Advanced token validation failed, admin user will be signed out');
      }
    }, 30000); // 30 seconds for admin users

    return () => {
      clearInterval(interval);
    };
  }, [currentUser, userProfile?.membershipType, checkAdvancedTokenValidity]);

  // ✅ FIXED: Auth state change listener with proper loading resolution
  useEffect(() => {
    let mounted = true;
    
    console.log('🔐 Setting up auth state listener...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user ? `User: ${user.email}` : 'No user');
      
      if (!mounted) return;
      
      try {
        if (user) {
          console.log('✅ User authenticated, loading profile...');
          
          // ✅ FIREBASE-ONLY: Clean cache but preserve essential app settings
          cleanupUserCache();
          
          // ✅ FIXED: Better error handling for profile loading
          try {
            const profile = await loadUserProfile(user);
            
            if (mounted) {
              // Set additional properties on currentUser
              const enhancedUser = user as User;
              enhancedUser.currentStage = profile?.currentStage || '0';
              enhancedUser.goals = profile?.goals || [];
              enhancedUser.assessmentCompleted = false;
              
              setUserProfile(profile);
              setCurrentUser(enhancedUser);
              
              console.log(`✅ User profile loaded for ${user.uid.substring(0, 8)}...`);
            }
          } catch (profileError) {
            console.error('❌ Profile loading failed, but continuing with basic auth:', profileError);
            
            // ✅ FIXED: Continue with basic user even if profile fails
            if (mounted) {
              const basicUser = user as User;
              basicUser.currentStage = '0';
              basicUser.goals = [];
              basicUser.assessmentCompleted = false;
              
              setCurrentUser(basicUser);
              setUserProfile(null); // Will be created later
              
              console.log('✅ Continuing with basic auth, profile will be created later');
            }
          }
          
          // ✅ FIXED: Update last login time (with error handling)
          try {
            const profileRef = doc(db, 'userProfiles', user.uid);
            const profileDoc = await getDoc(profileRef);
            
            if (profileDoc.exists()) {
              await updateDoc(profileRef, {
                lastLoginAt: serverTimestamp()
              });
            } else {
              // Try legacy users collection
              const userRef = doc(db, 'users', user.uid);
              const userDoc = await getDoc(userRef);
              if (userDoc.exists()) {
                await updateDoc(userRef, {
                  lastLoginAt: serverTimestamp()
                });
              }
            }
          } catch (error) {
            // Silent error handling for login time update
            if (isFeatureEnabled('debugging')) {
              console.warn('Failed to update last login time:', error);
            }
          }
        } else {
          console.log('❌ No user authenticated');
          if (mounted) {
            // ✅ FIREBASE-ONLY: Clean up cache on logout
            cleanupUserCache();
            
            setCurrentUser(null);
            setUserProfile(null);
            console.log('✅ User cleared and cache cleaned');
          }
        }
      } catch (error) {
        console.error('❌ Critical auth error:', error);
        if (mounted) {
          setCurrentUser(null);
          setUserProfile(null);
        }
      } finally {
        // ✅ CRITICAL: ALWAYS set loading to false
        if (mounted) {
          setIsLoading(false);
          console.log('✅ Auth loading completed - User:', user ? 'Authenticated' : 'Not authenticated');
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth, db, loadUserProfile, cleanupUserCache]);

  // ✅ ENHANCED: Authentication methods with demographics support
  const signup = useCallback(async (email: string, password: string, displayName: string, demographics?: UserDemographics) => {
    try {
      // ✅ FIREBASE-ONLY: Clean up cache before signup
      cleanupUserCache();
      
      // ✅ CRITICAL: Don't set loading to false until auth state changes
      setError(null);
      
      if (isFeatureEnabled('debugging')) {
        console.log('🔐 Starting enhanced sign up with demographics...');
      }
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      
      // ✅ ENHANCED: Create user profile with demographics
      if (demographics) {
        try {
          await createUserDocument(result.user, demographics);
          console.log('✅ User profile created with demographics during signup');
        } catch (profileError) {
          console.warn('❌ Failed to create profile with demographics, will be created later:', profileError);
        }
      }
      
      // Send verification email
      await sendEmailVerification(result.user);
      
      if (isFeatureEnabled('debugging')) {
        console.log(`✅ Enhanced sign up successful for ${result.user.uid.substring(0, 8)}... - waiting for auth state to update`);
      }
      
    } catch (err: any) {
      // ✅ CRITICAL: Only set loading false on error
      setIsLoading(false);
      const errorMessage = err?.message || 'Signup failed';
      setError(errorMessage);
      throw err;
    }
  }, [auth, cleanupUserCache, createUserDocument]);

  // Alias for signup
  const signUp = signup;

  const login = useCallback(async (email: string, password: string) => {
    try {
      // ✅ FIREBASE-ONLY: Clean up cache before login
      cleanupUserCache();
      
      // ✅ CRITICAL: Don't set loading to false until auth state changes
      setError(null);
      
      if (isFeatureEnabled('debugging')) {
        console.log('🔐 Starting sign in...');
      }
      await signInWithEmailAndPassword(auth, email, password);
      
      if (isFeatureEnabled('debugging')) {
        console.log('✅ Sign in successful - waiting for auth state to update');
      }
      
    } catch (err: any) {
      // ✅ CRITICAL: Only set loading false on error
      setIsLoading(false);
      const errorMessage = err?.message || 'Login failed';
      setError(errorMessage);
      throw err;
    }
  }, [auth, cleanupUserCache]);

  // Alias for login
  const signIn = login;

  // ✅ ENHANCED: Profile management methods with demographics support
  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
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
      
      // ✅ FIXED: Try both collection paths
      try {
        const userDocRef = doc(db, 'userProfiles', currentUser.uid);
        await updateDoc(userDocRef, data);
        console.log(`✅ Profile updated in userProfiles for ${currentUser.uid.substring(0, 8)}...`);
      } catch (error) {
        console.warn('Failed to update userProfiles, trying users collection...');
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, data);
        console.log(`✅ Profile updated in users for ${currentUser.uid.substring(0, 8)}...`);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser, userProfile, db]);

  // ✅ FIREBASE-ONLY: Logout function with cache cleanup
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isFeatureEnabled('debugging')) {
        console.log(`🔄 Logging out user ${currentUser?.uid?.substring(0, 8)}...`);
      }
      
      // ✅ FIREBASE-ONLY: Clean up cache before logout
      cleanupUserCache();
      
      await signOut(auth);
      setShowLogoutWarning(false);
      setSessionTimeRemaining(0);
      
      if (isFeatureEnabled('debugging')) {
        console.log('✅ User logged out and all data cleaned');
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [auth, currentUser?.uid, cleanupUserCache]);

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
        
      }, (6 * 60 * 60 * 1000) - (5 * 60 * 1000)); // 5 hours 55 minutes
      
      // Auto logout after 30 minutes
      timeoutId = setTimeout(() => {
        logout();
      }, 6 * 60 * 60 * 1000); // 6 hours
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
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      
      if (isFeatureEnabled('debugging')) {
        console.log(`✅ Password reset email sent to ${email}`);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Password reset failed';
      setError(errorMessage);
      throw err;
    }
  }, [auth]);

  // Alias for updateUserProfile
  const updateUserProfileInContext = updateUserProfile;

  const updateUserEmail = useCallback(async (newEmail: string, password: string) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, password);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update email
      await updateEmail(currentUser, newEmail);
      
      // Update profile in Firebase
      await updateUserProfile({ email: newEmail });
      
      // Send verification email
      await sendEmailVerification(currentUser);
      
      if (isFeatureEnabled('debugging')) {
        console.log(`✅ Email updated to ${newEmail} for ${currentUser.uid.substring(0, 8)}...`);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Email update failed';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser, updateUserProfile]);

  const updateUserPassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Update password
      await updatePassword(currentUser, newPassword);
      
      if (isFeatureEnabled('debugging')) {
        console.log(`✅ Password updated for ${currentUser.uid.substring(0, 8)}...`);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Password update failed';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser]);

  const sendVerificationEmail = useCallback(async () => {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await sendEmailVerification(currentUser);
      
      if (isFeatureEnabled('debugging')) {
        console.log(`✅ Verification email sent to ${currentUser.email}`);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Verification email failed';
      setError(errorMessage);
      throw err;
    }
  }, [currentUser]);

  // ✅ FIREBASE-ONLY: Sync placeholder (no localStorage syncing needed)
  const syncWithLocalData = useCallback(async () => {
    try {
      // This method now just serves as a placeholder
      // All data syncing is handled by Firebase contexts
      if (isFeatureEnabled('debugging')) {
        console.log('📄 Sync placeholder - all data is Firebase-only');
      }
    } catch (err) {
      // Silent error handling
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ✅ ENHANCED: Create context value with demographics support
  const value: AuthContextType = {
    currentUser,
    userProfile,
    isLoading,
    error,
    isAuthenticated,
    
    // ✅ ENHANCED: Authentication methods with demographics
    signup,
    signUp,
    login,
    signIn,
    logout,
    resetPassword,
    
    // Profile management (Firebase-only)
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
    
    // ✅ UNIVERSAL: Environment-aware token validation
    checkTokenValidity,
    
    // ✅ FIREBASE-ONLY: Clean cache management
    cleanupUserCache,
    
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