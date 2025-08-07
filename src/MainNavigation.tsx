// src/MainNavigation.tsx - Firebase-Only Universal Architecture Compatible
import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainNavigation.css';
// ✅ FIREBASE-ONLY: Using Universal Architecture compatible imports
import { useAuth } from './contexts/auth/AuthContext';
import { useAdmin } from './contexts/auth/AdminContext';

interface MainNavigationProps {
  onPracticeClick?: () => void;
  onProgressClick?: () => void;
  onLearnClick?: () => void;
  children?: React.ReactNode;
}

const MainNavigation: React.FC<MainNavigationProps> = ({
  onPracticeClick = () => {},
  onProgressClick = () => {},
  onLearnClick = () => {},
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { isAdmin, adminRole, adminLevel } = useAdmin();
  
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  // ✅ FIREBASE-ONLY: Use React state instead of sessionStorage for admin context
  const [isInAdminMode, setIsInAdminMode] = useState<boolean>(false);

  // Enhanced active tab calculation with admin context
  const activeTab = useMemo((): string => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/mind-recovery')) return 'mind-recovery';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/learn')) return 'learn';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/chatwithguru')) return 'chatwithguru';
    if (path === '/home' || path === '/') return 'home';
    return 'home';
  }, [location.pathname]);

  // ✅ FIREBASE-ONLY: Check admin context from path instead of sessionStorage
  const isInAdminContext = useMemo(() => {
    const inAdminPath = location.pathname.includes('/admin');
    // Update local state when path changes
    if (inAdminPath !== isInAdminMode) {
      setIsInAdminMode(inAdminPath);
    }
    return inAdminPath;
  }, [location.pathname, isInAdminMode]);

  const profileInitial = useMemo(() => {
    return currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U';
  }, [currentUser?.displayName]);

  // Enhanced tab click handler with proper admin navigation
  const handleTabClick = useCallback((tab: string) => {
    switch (tab) {
      case 'practice':
        onPracticeClick();
        break;
      case 'progress':
        onProgressClick();
        break;
      case 'learn':
        onLearnClick();
        break;
      case 'admin':
        if (isAdmin) {
          console.log('🛡️ Navigating to admin panel...');
          setIsInAdminMode(true);
          navigate('/admin');
        } else {
          console.warn('❌ Access denied: Admin privileges required');
          alert('Admin access required');
        }
        break;
      default:
        setIsInAdminMode(false);
        navigate('/home');
    }
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [onPracticeClick, onProgressClick, onLearnClick, navigate, isAdmin]);

  const handleNavigation = useCallback((path: string) => {
    console.log(`🔄 Navigating to: ${path}`);
    // ✅ FIREBASE-ONLY: Update admin mode based on path
    setIsInAdminMode(path.includes('/admin'));
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  // ✅ FIREBASE-ONLY: Enhanced home navigation without sessionStorage
  const handleHomeNavigation = useCallback(() => {
    console.log('🏠 Navigating to home (normal user context)');
    setIsInAdminMode(false);
    navigate('/home');
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  // ✅ FIREBASE-ONLY: Admin navigation with React state
  const handleAdminNavigation = useCallback(() => {
    if (isAdmin) {
      console.log(`🛡️ Accessing admin panel as ${adminRole} (Level ${adminLevel})`);
      setIsInAdminMode(true);
      navigate('/admin');
      setIsMobileMenuOpen(false);
      setShowProfileDropdown(false);
    } else {
      alert('🔒 Admin access required. Contact your administrator.');
    }
  }, [navigate, isAdmin, adminRole, adminLevel]);

  const handleMindRecoveryNavigation = useCallback(() => {
    setIsInAdminMode(false);
    navigate('/mind-recovery');
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  const handleNotesNavigation = useCallback(() => {
    setIsInAdminMode(false);
    navigate('/notes');
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  const handleAnalyticsNavigation = useCallback(() => {
    setIsInAdminMode(false);
    navigate('/analytics');
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  const handleChatNavigation = useCallback(() => {
    setIsInAdminMode(false);
    navigate('/chatwithguru');
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  const handleLearnClick = useCallback(() => {
    handleTabClick('learn');
  }, [handleTabClick]);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    setShowProfileDropdown(false);
  }, []);

  // ✅ FIREBASE-ONLY: Logout without sessionStorage
  const handleLogout = useCallback(() => {
    console.log('🚪 Logging out...');
    setIsInAdminMode(false);
    logout();
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
    navigate('/');
  }, [logout, navigate]);

  const handleMyDetailsClick = useCallback(() => {
    setShowProfileDropdown(false);
    setIsMobileMenuOpen(false);
    setIsInAdminMode(false);
    navigate('/profile');
  }, [navigate]);

  // ✅ FIREBASE-ONLY: Mobile navigation handlers without sessionStorage
  const handleMobileHomeNav = useCallback(() => {
    console.log('📱🏠 Mobile home navigation');
    setIsInAdminMode(false);
    handleNavigation('/home');
  }, [handleNavigation]);
  
  const handleMobileMindRecoveryNav = useCallback(() => {
    setIsInAdminMode(false);
    handleNavigation('/mind-recovery');
  }, [handleNavigation]);
  
  const handleMobileNotesNav = useCallback(() => {
    setIsInAdminMode(false);
    handleNavigation('/notes');
  }, [handleNavigation]);
  
  const handleMobileAnalyticsNav = useCallback(() => {
    setIsInAdminMode(false);
    handleNavigation('/analytics');
  }, [handleNavigation]);
  
  const handleMobileLearnNav = useCallback(() => {
    setIsInAdminMode(false);
    handleNavigation('/learn');
  }, [handleNavigation]);
  
  const handleMobileChatNav = useCallback(() => {
    setIsInAdminMode(false);
    handleNavigation('/chatwithguru');
  }, [handleNavigation]);
  
  const handleMobileProfileNav = useCallback(() => {
    setIsInAdminMode(false);
    handleNavigation('/profile');
  }, [handleNavigation]);
  
  const handleMobileAdminNav = useCallback(() => {
    if (isAdmin) {
      console.log('📱🛡️ Mobile admin navigation');
      setIsInAdminMode(true);
      handleNavigation('/admin');
    } else {
      alert('🔒 Admin access required');
    }
  }, [handleNavigation, isAdmin]);

  return (
    <div className="main-navigation">
      {/* Enhanced navigation with admin context indicator */}
      <nav className={`tab-navigation ${isInAdminContext ? 'admin-context' : 'user-context'}`}>
        {/* Mobile hamburger menu button */}
        <button 
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Context indicator (shows current mode) */}
        {isInAdminContext && (
          <div className="context-indicator admin-mode">
            <span className="context-icon">🛡️</span>
            <span className="context-text">Admin Mode</span>
          </div>
        )}

        {/* Desktop navigation tabs */}
        <div className="desktop-nav-tabs">
          {/* Enhanced home tab with clear user context */}
          <div 
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''} ${isInAdminContext ? 'user-return' : ''}`}
            onClick={handleHomeNavigation}
            title="Home - Normal User Interface"
          >
            <div className="tab-icon">🏠</div>
            <div className="tab-label">Home</div>
            {isInAdminContext && <span className="return-indicator">👤</span>}
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'mind-recovery' ? 'active' : ''}`}
            onClick={handleMindRecoveryNavigation}
          >
            <div className="tab-icon">🧠</div>
            <div className="tab-label">Mind Recovery</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={handleNotesNavigation}
          >
            <div className="tab-icon">📝</div>
            <div className="tab-label">Daily Notes</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={handleAnalyticsNavigation}
          >
            <div className="tab-icon">📊</div>
            <div className="tab-label">My Analytics</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={handleLearnClick}
          >
            <div className="tab-icon">📚</div>
            <div className="tab-label">Learn</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'chatwithguru' ? 'active' : ''}`}
            onClick={handleChatNavigation}
          >
            <div className="tab-icon">💬</div>
            <div className="tab-label">Wisdom Guide</div>
          </div>

          {/* Enhanced admin tab with better visibility and feedback */}
          {isAdmin && (
            <div 
              className={`nav-tab admin-tab ${activeTab === 'admin' ? 'active' : ''} ${isInAdminContext ? 'current-mode' : ''}`}
              onClick={handleAdminNavigation}
              title={`Admin Panel - ${adminRole} (Level ${adminLevel})`}
            >
              <div className="tab-icon">🛡️</div>
              <div className="tab-label">Admin</div>
              <div className="admin-level-badge">{adminLevel}</div>
            </div>
          )}
        </div>
        
        {/* Enhanced profile dropdown with better admin indication */}
        <div className="profile-dropdown-container">
          <div 
            className={`profile-button ${isAdmin ? 'admin-user' : 'regular-user'}`}
            onClick={toggleProfileDropdown}
            title={isAdmin ? `${currentUser?.email} - ${adminRole}` : currentUser?.email || 'User'}
          >
            <div className="profile-icon">
              {profileInitial}
            </div>
            {/* Enhanced admin badge with level */}
            {isAdmin && (
              <div className="admin-indicator" title={`${adminRole} - Level ${adminLevel}`}>
                <span className="admin-shield">🛡️</span>
                <span className="admin-level">{adminLevel}</span>
              </div>
            )}
          </div>
          {showProfileDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-item" onClick={handleMyDetailsClick}>
                <span className="dropdown-icon">👤</span>
                My Details
              </div>
              {/* Enhanced admin panel dropdown with status */}
              {isAdmin && (
                <div 
                  className={`dropdown-item admin-dropdown-item ${isInAdminContext ? 'current' : ''}`}
                  onClick={handleAdminNavigation}
                >
                  <span className="dropdown-icon">🛡️</span>
                  Admin Panel
                  {isInAdminContext && <span className="current-badge">Current</span>}
                </div>
              )}
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout-item" onClick={handleLogout}>
                <span className="dropdown-icon">🚪</span>
                Logout
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Enhanced mobile navigation with admin context awareness */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-menu">
          {/* Context header for mobile */}
          <div className="mobile-nav-header">
            <div className="mobile-user-info">
              <div className="mobile-user-avatar">{profileInitial}</div>
              <div className="mobile-user-details">
                <div className="mobile-user-email">{currentUser?.email}</div>
                {isAdmin && (
                  <div className="mobile-admin-badge">
                    🛡️ {adminRole} (Level {adminLevel})
                  </div>
                )}
              </div>
            </div>
            {isInAdminContext && (
              <div className="mobile-context-indicator">
                <span>🛡️ Admin Mode</span>
              </div>
            )}
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''} ${isInAdminContext ? 'user-return' : ''}`}
            onClick={handleMobileHomeNav}
          >
            <div className="mobile-nav-icon">🏠</div>
            <div className="mobile-nav-label">
              Home
              {isInAdminContext && <span className="return-text"> (User Mode)</span>}
            </div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'mind-recovery' ? 'active' : ''}`}
            onClick={handleMobileMindRecoveryNav}
          >
            <div className="mobile-nav-icon">🧠</div>
            <div className="mobile-nav-label">Mind Recovery</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={handleMobileNotesNav}
          >
            <div className="mobile-nav-icon">📝</div>
            <div className="mobile-nav-label">Daily Notes</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={handleMobileAnalyticsNav}
          >
            <div className="mobile-nav-icon">📊</div>
            <div className="mobile-nav-label">My Analytics</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={handleMobileLearnNav}
          >
            <div className="mobile-nav-icon">📚</div>
            <div className="mobile-nav-label">Learn</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'chatwithguru' ? 'active' : ''}`}
            onClick={handleMobileChatNav}
          >
            <div className="mobile-nav-icon">💬</div>
            <div className="mobile-nav-label">Wisdom Guide</div>
          </div>

          {/* Enhanced admin mobile item with status */}
          {isAdmin && (
            <div 
              className={`mobile-nav-item admin-mobile-item ${activeTab === 'admin' ? 'active' : ''} ${isInAdminContext ? 'current-mode' : ''}`}
              onClick={handleMobileAdminNav}
            >
              <div className="mobile-nav-icon">🛡️</div>
              <div className="mobile-nav-label">
                Admin Panel
                {isInAdminContext && <span className="current-badge">Current</span>}
              </div>
            </div>
          )}
          
          <div 
            className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={handleMobileProfileNav}
          >
            <div className="mobile-nav-icon">👤</div>
            <div className="mobile-nav-label">My Details</div>
          </div>
          
          <div className="mobile-nav-divider"></div>
          
          <div 
            className="mobile-nav-item logout-item"
            onClick={handleLogout}
          >
            <div className="mobile-nav-icon">🚪</div>
            <div className="mobile-nav-label">Logout</div>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainNavigation;