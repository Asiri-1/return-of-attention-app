// src/contexts/auth/AdminContext.tsx - QUICK FIX
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  isAdmin: boolean;
  adminRole: string;
  adminLevel: number;
  adminLoading: boolean;
  permissions: string[];
  setAdminStatus: (isAdmin: boolean, role?: string, level?: number) => void;
  refreshAdminStatus: () => void;
  grantAdminAccess: (userEmail: string, role: string, level: number) => Promise<boolean>;
  revokeAdminAccess: (userEmail: string) => Promise<boolean>;
  getAllAdminUsers: () => Promise<any[]>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState('USER');
  const [adminLevel, setAdminLevel] = useState(0);
  const [adminLoading, setAdminLoading] = useState(true);
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser?.email) {
      // ✅ FIXED: Add your email to admin list
      const adminEmails = [
        'asiriamarasinghe35@gmail.com',  // ← YOUR EMAIL ADDED!
        'admin@example.com', 
        'superadmin@example.com'
      ];
      
      const email = currentUser.email.toLowerCase();
      const isUserAdmin = adminEmails.includes(email) || 
                         email.includes('admin') ||
                         localStorage.getItem('adminAccess') === 'true';
      
      if (isUserAdmin) {
        const role = email === 'asiriamarasinghe35@gmail.com' ? 'SUPER_ADMIN' : 
                     email.includes('super') ? 'SUPER_ADMIN' : 'ADMIN';
        const level = role === 'SUPER_ADMIN' ? 100 : 50;
        const perms = level >= 100 ? ['*'] : ['users.read', 'users.write', 'analytics.read'];
        
        setIsAdmin(true);
        setAdminRole(role);
        setAdminLevel(level);
        setPermissions(perms);
        
        console.log(`✅ Admin access granted: ${email} - ${role} (Level ${level})`);
      } else {
        setIsAdmin(false);
        setAdminRole('USER');
        setAdminLevel(0);
        setPermissions([]);
        
        console.log(`❌ No admin access: ${email}`);
      }
    } else {
      setIsAdmin(false);
      setAdminRole('USER');
      setAdminLevel(0);
      setPermissions([]);
    }
    
    setAdminLoading(false);
  }, [currentUser]);

  const setAdminStatus = (admin: boolean, role: string = 'ADMIN', level: number = 50) => {
    setIsAdmin(admin);
    setAdminRole(role);
    setAdminLevel(level);
    setPermissions(level >= 100 ? ['*'] : ['users.read', 'users.write']);
    localStorage.setItem('adminAccess', admin ? 'true' : 'false');
    
    console.log(`🔧 Admin status manually set: ${admin ? 'GRANTED' : 'REVOKED'} - ${role} (Level ${level})`);
  };

  const refreshAdminStatus = () => {
    console.log('🔄 Refreshing admin status...');
    // Trigger re-check by updating a dependency
    setAdminLoading(true);
    setTimeout(() => setAdminLoading(false), 100);
  };

  // Mock functions for compatibility with your existing AdminPanel
  const grantAdminAccess = async (userEmail: string, role: string, level: number): Promise<boolean> => {
    console.log(`🛡️ Would grant ${role} access to ${userEmail} (Level ${level})`);
    alert(`✅ Mock: Admin access granted to ${userEmail}!\n\nRole: ${role} (Level ${level})\n\nNote: This is a mock function. For real admin management, use the Universal Firestore system.`);
    return true;
  };

  const revokeAdminAccess = async (userEmail: string): Promise<boolean> => {
    console.log(`❌ Would revoke admin access from ${userEmail}`);
    alert(`✅ Mock: Admin access revoked from ${userEmail}!\n\nNote: This is a mock function.`);
    return true;
  };

  const getAllAdminUsers = async (): Promise<any[]> => {
    return [
      {
        id: 'asiriamarasinghe35@gmail.com',
        email: 'asiriamarasinghe35@gmail.com',
        role: 'SUPER_ADMIN',
        level: 100,
        isActive: true,
        createdAt: { seconds: Date.now() / 1000 },
        lastAccess: { seconds: Date.now() / 1000 }
      }
    ];
  };

  const contextValue: AdminContextType = {
    isAdmin,
    adminRole,
    adminLevel,
    adminLoading,
    permissions,
    setAdminStatus,
    refreshAdminStatus,
    grantAdminAccess,
    revokeAdminAccess,
    getAllAdminUsers
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;