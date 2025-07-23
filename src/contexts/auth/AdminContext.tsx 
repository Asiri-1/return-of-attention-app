// src/AdminContext.tsx - Clean Secure Admin Context
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  // Admin status
  isAdmin: boolean;
  adminRole: string | null;
  adminLevel: number;
  adminPermissions: string[];
  adminLoading: boolean;
  adminError: string | null;
  lastChecked: string | null;
  
  // Helper functions
  hasPermission: (permission: string) => boolean;
  refreshAdminStatus: () => Promise<void>;
  
  // Role checks (convenience methods)
  isSuperAdmin: () => boolean;
  isStandardAdmin: () => boolean;
  isModerator: () => boolean;
  
  // Permission checks (convenience methods)
  canReadUsers: () => boolean;
  canWriteUsers: () => boolean;
  canReadAnalytics: () => boolean;
  canWriteContent: () => boolean;
  canModerateContent: () => boolean;
  
  // Level checks
  hasMinimumLevel: (minLevel: number) => boolean;
}

interface AdminProviderProps {
  children: ReactNode;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [adminLevel, setAdminLevel] = useState(0);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  // Check if user has specific permission
  const hasPermission = (permission: string): boolean => {
    if (!isAdmin || !adminPermissions) return false;
    
    // Super admin has all permissions
    if (adminPermissions.includes('*')) return true;
    
    // Check specific permission
    return adminPermissions.includes(permission);
  };

  // Refresh admin status by getting fresh token
  const refreshAdminStatus = async (): Promise<void> => {
    setAdminLoading(true);
    setAdminError(null);

    try {
      console.log('🔄 AdminContext: Refreshing admin status...');
      
      if (!isAuthenticated || !currentUser) {
        console.log('❌ AdminContext: User not authenticated');
        setIsAdmin(false);
        setAdminRole(null);
        setAdminLevel(0);
        setAdminPermissions([]);
        setAdminLoading(false);
        return;
      }

      // Get fresh token with custom claims
      if (!currentUser.getIdTokenResult) {
        console.log('❌ AdminContext: User object missing getIdTokenResult method');
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      const tokenResult = await currentUser.getIdTokenResult(true); // Force refresh
      const claims = tokenResult.claims;
      
      console.log('🔍 AdminContext: Checking claims:', {
        admin: claims.admin,
        role: claims.role,
        level: claims.level,
        permissions: claims.permissions
      });

      // Check if user has admin claims
      if (claims.admin && claims.role && claims.level && claims.permissions) {
        setIsAdmin(true);
        setAdminRole(claims.role as string);
        setAdminLevel(claims.level as number);
        setAdminPermissions(claims.permissions as string[] || []);
        setLastChecked(new Date().toISOString());
        
        console.log(`✅ AdminContext: Admin verified - ${claims.role} (Level ${claims.level})`);
      } else {
        setIsAdmin(false);
        setAdminRole(null);
        setAdminLevel(0);
        setAdminPermissions([]);
        
        console.log('❌ AdminContext: No admin claims found');
      }

    } catch (error: any) {
      console.error('❌ AdminContext: Error checking admin status:', error);
      setAdminError(error.message || 'Unknown error');
      setIsAdmin(false);
      setAdminRole(null);
      setAdminLevel(0);
      setAdminPermissions([]);
    } finally {
      setAdminLoading(false);
    }
  };

  // Check admin status when user changes or on mount
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      refreshAdminStatus();
    } else {
      // User not authenticated, clear admin status
      setIsAdmin(false);
      setAdminRole(null);
      setAdminLevel(0);
      setAdminPermissions([]);
      setAdminLoading(false);
    }
  }, [isAuthenticated, currentUser]);

  // Auto-refresh admin status every 5 minutes (in case claims change)
  useEffect(() => {
    if (isAdmin) {
      const interval = setInterval(() => {
        console.log('🔄 AdminContext: Auto-refreshing admin status...');
        refreshAdminStatus();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  // Debug logging
  useEffect(() => {
    console.log('🛡️ AdminContext State:', {
      isAdmin,
      adminRole,
      adminLevel,
      adminPermissions,
      adminLoading,
      adminError,
      lastChecked,
      userEmail: currentUser?.email
    });
  }, [isAdmin, adminRole, adminLevel, adminPermissions, adminLoading, adminError, lastChecked, currentUser]);

  const value: AdminContextType = {
    // Admin status
    isAdmin,
    adminRole,
    adminLevel,
    adminPermissions,
    adminLoading,
    adminError,
    lastChecked,
    
    // Helper functions
    hasPermission,
    refreshAdminStatus,
    
    // Role checks (convenience methods)
    isSuperAdmin: () => adminRole === 'SUPER_ADMIN',
    isStandardAdmin: () => adminRole === 'ADMIN',
    isModerator: () => adminRole === 'MODERATOR',
    
    // Permission checks (convenience methods)
    canReadUsers: () => hasPermission('users.read'),
    canWriteUsers: () => hasPermission('users.write'),
    canReadAnalytics: () => hasPermission('analytics.read'),
    canWriteContent: () => hasPermission('content.write'),
    canModerateContent: () => hasPermission('content.moderate'),
    
    // Level checks
    hasMinimumLevel: (minLevel: number) => adminLevel >= minLevel
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};