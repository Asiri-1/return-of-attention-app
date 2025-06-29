// src/AdminContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  isLoading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isLoading: true,
});

export const useAdmin = () => useContext(AdminContext);

// Admin email - only this user gets admin features
const ADMIN_EMAIL = 'asiriamarasinghe35@gmail.com';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AdminContext Debug - Raw State:', {
      currentUser,
      currentUserEmail: currentUser?.email,
      isAuthenticated,
      authLoading,
      timestamp: new Date().toISOString()
    });

    // Simple approach: if we have a currentUser with email, check immediately
    if (currentUser && currentUser.email) {
      const userIsAdmin = currentUser.email === ADMIN_EMAIL;
      setIsAdmin(userIsAdmin);
      setIsLoading(false);
      
      if (userIsAdmin) {
        console.log('🔑 Admin access granted for:', currentUser.email);
      } else {
        console.log('👤 Regular user access for:', currentUser.email);
      }
    } 
    // If auth is not loading but no currentUser, user is not authenticated
    else if (!authLoading && !currentUser) {
      setIsAdmin(false);
      setIsLoading(false);
      console.log('❌ No user authenticated');
    }
    // Otherwise, keep loading
    else {
      setIsLoading(true);
      console.log('⏳ Waiting for user data...');
    }
  }, [currentUser, isAuthenticated, authLoading]);

  // Fallback timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Admin check timeout - forcing completion');
        setIsLoading(false);
        setIsAdmin(false);
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};