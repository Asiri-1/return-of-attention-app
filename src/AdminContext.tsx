import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextType {
  isAdminMode: boolean;
  toggleAdminMode: () => void;
  adminSettings: {
    showDebugInfo: boolean;
    showAnalytics: boolean;
    showUserData: boolean;
  };
  updateAdminSettings: (settings: Partial<AdminContextType['adminSettings']>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminSettings, setAdminSettings] = useState({
    showDebugInfo: false,
    showAnalytics: true,
    showUserData: false
  });

  const toggleAdminMode = () => {
    setIsAdminMode(prev => !prev);
  };

  const updateAdminSettings = (settings: Partial<AdminContextType['adminSettings']>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  };

  const value: AdminContextType = {
    isAdminMode,
    toggleAdminMode,
    adminSettings,
    updateAdminSettings
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};