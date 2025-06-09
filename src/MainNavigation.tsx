import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainNavigation.css';
import { useAuth } from './AuthContext';

interface MainNavigationProps {
  children?: React.ReactNode;
  onPracticeClick?: () => void;
  onProgressClick?: () => void;
  onLearnClick?: () => void;
}

const MainNavigation: React.FC<MainNavigationProps> = ({
  children
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  
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
          onClick={() => navigate('/learn')}
        >
          <div className="tab-icon">📚</div>
          <div className="tab-label">Learn</div>
        </div>
        
        <div className="profile-button-container">
          <button 
            className={`profile-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => navigate('/profile')}
          >
            <div className="profile-icon">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '👤'}
            </div>
          </button>
        </div>
        <button className="logout-button" onClick={() => { logout(); navigate("/signin"); }}>Sign Out</button>
      </nav>
      
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default MainNavigation;


