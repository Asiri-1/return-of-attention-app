import React, { useState } from 'react';
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

  // Determine active tab based on current path
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/mind-recovery')) return 'mind-recovery';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/learn')) return 'learn';
    if (path.includes('/profile')) return 'profile';
    return 'home'; // Default to home
  };

  const activeTab = getActiveTab();

  // Handle tab clicks
  const handleTabClick = (tab: string) => {
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
  };

  // Handle navigation with mobile menu close
  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
  };

  // Toggle quick actions menu
  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  // Handle quick start practice
  const handleQuickStart = () => {
    setShowQuickActions(false);
    onPracticeClick();
  };

  // Handle quick access to mind recovery
  const handleMindRecovery = () => {
    setShowQuickActions(false);
    navigate('/mind-recovery');
  };

  // Handle profile dropdown toggle
  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setShowProfileDropdown(false); // Close profile dropdown when opening mobile menu
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    setShowProfileDropdown(false);
    navigate('/'); // Redirect to sign-in or home after logout
  };

  // Handle My Details click
  const handleMyDetailsClick = () => {
    console.log('My Details clicked');
    setShowProfileDropdown(false); // Close dropdown
    setIsMobileMenuOpen(false); // Close mobile menu
    console.log('Navigating to /profile');
    navigate('/profile'); // Navigate to profile page
  };

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
            onClick={() => navigate('/home')}
          >
            <div className="tab-icon">🏠</div>
            <div className="tab-label">Home</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'mind-recovery' ? 'active' : ''}`}
            onClick={() => navigate('/mind-recovery')}
          >
            <div className="tab-icon">🧠</div>
            <div className="tab-label">Mind Recovery</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => navigate('/notes')}
          >
            <div className="tab-icon">📝</div>
            <div className="tab-label">Daily Notes</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => navigate('/analytics')}
          >
            <div className="tab-icon">📊</div>
            <div className="tab-label">My Analytics</div>
          </div>
          
          <div 
            className={`nav-tab ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => handleTabClick('learn')}
          >
            <div className="tab-icon">📚</div>
            <div className="tab-label">Learn</div>
          </div>
        </div>
        
        {/* Desktop profile dropdown */}
        <div className="profile-dropdown-container">
          <div 
            className="profile-button"
            onClick={toggleProfileDropdown}
          >
            <div className="profile-icon">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
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
            onClick={() => handleNavigation('/home')}
          >
            <div className="mobile-nav-icon">🏠</div>
            <div className="mobile-nav-label">Home</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'mind-recovery' ? 'active' : ''}`}
            onClick={() => handleNavigation('/mind-recovery')}
          >
            <div className="mobile-nav-icon">🧠</div>
            <div className="mobile-nav-label">Mind Recovery</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => handleNavigation('/notes')}
          >
            <div className="mobile-nav-icon">📝</div>
            <div className="mobile-nav-label">Daily Notes</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => handleNavigation('/analytics')}
          >
            <div className="mobile-nav-icon">📊</div>
            <div className="mobile-nav-label">My Analytics</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'learn' ? 'active' : ''}`}
            onClick={() => handleNavigation('/learn')}
          >
            <div className="mobile-nav-icon">📚</div>
            <div className="mobile-nav-label">Learn</div>
          </div>
          
          <div 
            className={`mobile-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavigation('/profile')}
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

