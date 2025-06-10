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

  // Determine active tab based on current path
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.includes('/mind-recovery')) return 'mind-recovery';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/notes')) return 'notes';
    if (path.includes('/learn')) return 'learn';
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

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/'); // Redirect to sign-in or home after logout
  };

  // Handle My Details click
  const handleMyDetailsClick = () => {
    console.log('My Details clicked');
    setShowProfileDropdown(false); // Close dropdown
    console.log('Navigating to /profile');
    navigate('/profile'); // Navigate to profile page
  };

  return (
    <div className="main-navigation">
      <nav className="tab-navigation">
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
        
        <div className="profile-dropdown-container">
          <div 
            className="profile-button"
            onClick={toggleProfileDropdown}
          >
            <div className="profile-icon">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
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
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainNavigation;


