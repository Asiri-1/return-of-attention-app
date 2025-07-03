// ============================================================================
// src/layouts/PlatformLayout.tsx
// FIXED - Simple layout that works with your existing MainNavigation
// ============================================================================

import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';

interface PlatformLayoutProps {
  children?: React.ReactNode;
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Don't show any layout wrapper on landing, signin, signup pages
  const isAuthPage = ['/signin', '/signup', '/'].includes(location.pathname);

  if (isAuthPage) {
    // For auth pages, just render content directly
    return <>{children || <Outlet />}</>;
  }

  // For main app pages, just render the content
  // Your existing MainNavigation will handle the layout
  return (
    <div className="min-h-screen bg-gray-50">
      {children || <Outlet />}
    </div>
  );
};

export default PlatformLayout;