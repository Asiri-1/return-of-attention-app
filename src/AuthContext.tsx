import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { apiService } from './services/api'; // Corrected import path

// Define your User interface (can be expanded based on your Firestore schema)
interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null; // Changed from 'name' to 'displayName'
  // Add other fields from your Firestore 'users' collection as needed
  experienceLevel?: string;
  goals?: string[];
  practiceTime?: number;
  frequency?: string;
  assessmentCompleted?: boolean;
  currentStage?: number | string; // Or string, depending on your schema
  questionnaireCompleted?: boolean;
  questionnaireAnswers?: any;
  selfAssessmentData?: any;
  // ... any other fields from your firestore-schema-design.md
}

interface AuthContextType {
  currentUser: AppUser | null;
  firebaseUser: FirebaseUser | null; // Store the raw Firebase user object if needed
  isAuthenticated: boolean;
  isLoading: boolean; // To handle loading state during auth checks
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfileInContext: (userData: Partial<AppUser>) => void; // Corrected function name
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => { // Explicitly typed 'user'
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        try {
          // Fetch user profile from Firestore
          const userProfile = await apiService.getUserProfile();
          setCurrentUser(userProfile.data as AppUser);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          // If profile doesn't exist, you might want to create a basic one
          // or handle it based on your app's logic.
          // For now, we'll set a minimal user based on Firebase auth data.
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          });
          setIsAuthenticated(true);
        }
      } else {
        setCurrentUser(null);
        setFirebaseUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting the user state
    } catch (error) {
      setIsLoading(false);
      console.error("Login error:", error);
      throw error; // Re-throw to handle in UI
    }
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      // After successful Firebase signup, create the user profile in Firestore
      const initialProfileData = {
        email: fbUser.email,
        displayName: displayName || fbUser.displayName || 'New User',
        // Add other default fields for a new user profile as per your schema
        experienceLevel: 'beginner',
        goals: [],
        practiceTime: 10,
        frequency: 'daily',
        assessmentCompleted: false,
        currentStage: 'Seeker', // Or 1, depending on your schema
        questionnaireCompleted: false,
      };
      await apiService.createUserProfile(initialProfileData);
      // onAuthStateChanged will handle setting the user state with the new profile
    } catch (error) {
      setIsLoading(false);
      console.error("Signup error:", error);
      throw error; // Re-throw to handle in UI
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will handle clearing user state
    } catch (error) {
      setIsLoading(false);
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Allows manual update of user profile in context if needed, e.g., after an API call
  const updateUserProfileInContext = (userData: Partial<AppUser>) => {
    if (currentUser) {
      setCurrentUser(prevUser => ({ ...prevUser, ...userData } as AppUser));
    }
  };

  const value = {
    currentUser,
    firebaseUser,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateUserProfileInContext,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
