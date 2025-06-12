import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  experienceLevel: string;
  goals: string[];
  practiceTime: number;
  frequency: string;
  assessmentCompleted: boolean;
  currentStage: number;
  questionnaireCompleted: boolean; // New field
  questionnaireAnswers?: any; // New field to store questionnaire answers
  selfAssessmentData?: any; // New field to store self-assessment answers
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, name?: string) => {
    // For development, create a demo user
    // In a real application, you would send these credentials to a backend for authentication
    const user: User = {
      id: `user-${Date.now()}`,
      email: email,
      name: name || 'Demo User', // Use provided name, or default to 'Demo User'
      experienceLevel: 'beginner',
      goals: ['stress-reduction', 'focus'],
      practiceTime: 10,
      frequency: 'daily',
      assessmentCompleted: false,
      currentStage: 1,
      questionnaireCompleted: false,
      questionnaireAnswers: {} // Initialize with empty object
    };

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  const updateUser = (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
