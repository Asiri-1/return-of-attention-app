import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainNavigation.css';
import { useAuth } from './AuthContext';

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
  
  const [showQuickActions, setShowQuickActions] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // ✅ PERFORMANCE: Memoized active tab calculation to prevent recalculation on every render
  const activeTab = useMemo((): string => {
    const path = location.pathname;
    if (path.includes('/mind-recovery')) return 'mind-recovery';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/learn')) return 'learn';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/chatwithguru')) return 'chatwithguru';
    return 'home'; // Default to home
  }, [location.pathname]);

  // ✅ PERFORMANCE: Memoized profile initial to prevent string operations on every render
  const profileInitial = useMemo(() => {
    return currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'D';
  }, [currentUser?.displayName]);

  // ✅ PERFORMANCE: Stable event handlers with useCallback to prevent unnecessary re-renders
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
      default:
        navigate('/home');
    }
  }, [onPracticeClick, onProgressClick, onLearnClick, navigate]);

  const handleNavigation = useCallback((path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  }, [navigate]);

  const handleHomeNavigation = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  const handleMindRecoveryNavigation = useCallback(() => {
    navigate('/mind-recovery');
  }, [navigate]);

  const handleNotesNavigation = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

  const handleAnalyticsNavigation = useCallback(() => {
    navigate('/analytics');
  }, [navigate]);

  const handleChatNavigation = useCallback(() => {
    navigate('/chatwithguru');
  }, [navigate]);

  const handleLearnClick = useCallback(() => {
    handleTabClick('learn');
  }, [handleTabClick]);

  const toggleQuickActions = useCallback(() => {
    setShowQuickActions(prev => !prev);
  }, []);

  const handleQuickStart = useCallback(() => {
    setShowQuickActions(false);
    onPracticeClick();
  }, [onPracticeClick]);

  const handleMindRecovery = useCallback(() => {
    setShowQuickActions(false);
    navigate('/mind-recovery');
  }, [navigate]);

  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
    setShowProfileDropdown(false); // Close profile dropdown when opening mobile menu
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
    navigate('/'); // Redirect to sign-in or home after logout
  }, [logout, navigate]);

  const handleMyDetailsClick = useCallback(() => {
    // ✅ CODE QUALITY: Removed debug console.log statements
    setShowProfileDropdown(false); // Close dropdown
    setIsMobileMenuOpen(false); // Close mobile menu
    navigate('/profile'); // Navigate to profile page
  }, [navigate]);

  // ✅ PERFORMANCE: Memoized mobile navigation handlers to prevent recreation
  const handleMobileHomeNav = useCallback(() => handleNavigation('/home'), [handleNavigation]);
  const handleMobileMindRecoveryNav = useCallback(() => handleNavigation('/mind-recovery'), [handleNavigation]);
  const handleMobileNotesNav = useCallback(() => handleNavigation('/notes'), [handleNavigation]);
  const handleMobileAnalyticsNav = useCallback(() => handleNavigation('/analytics'), [handleNavigation]);
  const handleMobileLearnNav = useCallback(() => handleNavigation('/learn'), [handleNavigation]);
  const handleMobileChatNav = useCallback(() => handleNavigation('/chatwithguru'), [handleNavigation]);
  const handleMobileProfileNav = useCallback(() => handleNavigation('/profile'), [handleNavigation]);

  return (
    <div className="main-navigation">
      <nav className="tab-navigation">
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

        {/* Desktop navigation tabs */}
        <div className="desktop-nav-tabs">
          <div 
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            onClick={handleHomeNavigation}
          >
            <div className="tab-icon">🏠</div>
            <div className="tab-label">Home</div>
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
          
          {/* Chat with Guru tab */}
          <div 
            className={`nav-tab ${activeTab === 'chatwithguru' ? 'active' : ''}`}
            onClick={handleChatNavigation}
          >
            <div className="tab-icon">💬</div>
            <div className="tab-label">Wisdom Guide</div>
          </div>
        </div>
        
        {/* Desktop profile dropdown */}
        <div className="profile-dropdown-container">
          <div 
            className="profile-button"
            onClick={toggleProfileDropdown}
          >
            <div className="profile-icon">
              {profileInitial}
            </div>
          </div>
          {showProfileDropdown && (
            <div className="profile-dropdown-menu">
              <div className="dropdown-item" onClick={handleMyDetailsClick}>
                My Details
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                Logout
              </div>
            </div>
          )}
        </div>
      </nav>
      
      {/* Mobile navigation menu overlay */}
      <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-menu">
          <div 
            className={`mobile-nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={handleMobileHomeNav}
          >
            <div className="mobile-nav-icon">🏠</div>
            <div className="mobile-nav-label">Home</div>
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
          
          {/* Chat with Guru mobile menu item */}
          <div 
            className={`mobile-nav-item ${activeTab === 'chatwithguru' ? 'active' : ''}`}
            onClick={handleMobileChatNav}
          >
            <div className="mobile-nav-icon">💬</div>
            <div className="mobile-nav-label">Wisdom Guide</div>
          </div>
          
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