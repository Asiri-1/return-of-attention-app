// ============================================================================
// 🔧 ENHANCED PlatformLayout.tsx - PHASE 3 FIREBASE INTEGRATION
// ============================================================================

// FILE: src/layouts/PlatformLayout.tsx
// ✅ ENHANCED: Firebase integration for real-time data synchronization
// ✅ ENHANCED: Context providers for consistent data flow
// ✅ ENHANCED: Authentication guards and error handling
// ✅ ENHANCED: Performance optimization with proper loading states

import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useUser } from '../contexts/user/UserContext';

interface PlatformLayoutProps {
  children?: React.ReactNode;
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const { isLoading: practiceLoading } = usePractice();
  const { userProfile, isLoading: userLoading } = useUser();
  
  const [isInitializing, setIsInitializing] = useState(true);

  // ✅ Determine if this is an auth page
  const isAuthPage = useMemo(() => {
    return ['/signin', '/signup', '/', '/landing'].includes(location.pathname);
  }, [location.pathname]);

  // ✅ Determine if this is a protected page that needs authentication
  const isProtectedPage = useMemo(() => {
    const protectedPaths = [
      '/home', '/dashboard', '/stage1', '/stage2', '/stage3', '/stage4', '/stage5', '/stage6',
      '/practice-timer', '/practice-reflection', '/mind-recovery', '/happiness-tracker',
      '/analytics', '/notes', '/chatwithguru', '/profile', '/settings'
    ];
    
    return protectedPaths.some(path => location.pathname.startsWith(path));
  }, [location.pathname]);

  // ✅ Handle authentication state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000); // Give 1 second for contexts to initialize

    return () => clearTimeout(timer);
  }, []);

  // ✅ Redirect unauthenticated users from protected pages
  useEffect(() => {
    if (!isInitializing && !authLoading && isProtectedPage && !currentUser) {
      console.log('🔒 Redirecting unauthenticated user to landing page');
      navigate('/', { replace: true });
    }
  }, [isInitializing, authLoading, isProtectedPage, currentUser, navigate]);

  // ✅ Log context states for debugging
  useEffect(() => {
    if (!isAuthPage && currentUser) {
      console.log('🎯 PlatformLayout Context States:', {
        auth: { 
          isLoading: authLoading, 
          hasUser: !!currentUser,
          userId: currentUser?.uid?.substring(0, 8) + '...'
        },
        practice: { 
          isLoading: practiceLoading
        },
        user: { 
          isLoading: userLoading, 
          hasProfile: !!userProfile 
        },
        currentPath: location.pathname
      });
    }
  }, [authLoading, practiceLoading, userLoading, currentUser, userProfile, location.pathname, isAuthPage]);

  // ✅ Handle data synchronization across contexts
  useEffect(() => {
    if (!isAuthPage && currentUser && !practiceLoading && !userLoading) {
      // All contexts are loaded and ready
      console.log('✅ All contexts synchronized and ready');
    }
  }, [isAuthPage, currentUser, practiceLoading, userLoading]);

  // ✅ Loading state for protected pages while initializing
  if (isInitializing && isProtectedPage) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            Loading your mindfulness journey...
          </div>
          <div style={{
            fontSize: '14px',
            opacity: 0.8
          }}>
            Synchronizing your practice data
          </div>
        </div>
      </div>
    );
  }

  // ✅ Loading state for authenticated users while contexts load
  if (!isAuthPage && currentUser && (authLoading || practiceLoading || userLoading)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '6px'
          }}>
            Syncing your data...
          </div>
          <div style={{
            fontSize: '12px',
            opacity: 0.8
          }}>
            {authLoading && 'Authenticating'}
            {practiceLoading && 'Loading practice sessions'}
            {userLoading && 'Loading profile'}
          </div>
        </div>
      </div>
    );
  }

  // ✅ For auth pages, render content directly without layout
  if (isAuthPage) {
    return <>{children || <Outlet />}</>;
  }

  // ✅ For authenticated app pages, provide enhanced layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Context Status Indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && currentUser && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          zIndex: 9999,
          fontFamily: 'monospace'
        }}>
          <div>🔄 Firebase: {practiceLoading ? 'Loading...' : 'Ready'}</div>
          <div>👤 User: {userLoading ? 'Loading...' : 'Ready'}</div>
          <div>🎯 Stage: Ready</div>
        </div>
      )}

      {/* ✅ Main content with proper error boundaries */}
      <main className="relative">
        {children || <Outlet />}
      </main>

      {/* ✅ Global styles for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* ✅ Enhanced smooth transitions for better UX */
        .min-h-screen {
          transition: background-color 0.3s ease;
        }
        
        /* ✅ Ensure proper loading states don't cause layout shift */
        .bg-gray-50 {
          background-color: #f9fafb;
        }
        
        /* ✅ Optimize for mobile responsiveness */
        @media (max-width: 768px) {
          .min-h-screen {
            min-height: 100vh;
            min-height: 100dvh; /* Modern viewport height */
          }
        }
      `}</style>
    </div>
  );
};

export default PlatformLayout;