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
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = () => {
      if (currentUser?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
        console.log('🔑 Admin access granted for:', currentUser.email);
      } else {
        setIsAdmin(false);
        if (currentUser?.email) {
          console.log('👤 Regular user access for:', currentUser.email);
        }
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, [currentUser]);

  return (
    <AdminContext.Provider value={{ isAdmin, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
};