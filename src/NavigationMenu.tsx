import React, { useState } from 'react';
import './NavigationMenu.css';
import { Link, useLocation } from 'react-router-dom';

const NavigationMenu: React.FC = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  
  const handleMouseEnter = (section: string) => {
    setActiveDropdown(section);
  };
  
  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };
  
  // Get current path to highlight active section
  const currentPath = location.pathname;
  
  return (
    <nav className="horizontal-navigation">
      <div className="nav-brand">
        <h2>Welcome</h2>
      </div>
      
      <ul className="nav-menu">
        <li 
          className={`nav-item ${currentPath === '/home' || currentPath === '/' ? 'active' : ''}`}
          onMouseEnter={() => handleMouseEnter('main')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-link">Main</span>
          <div className={`dropdown-menu ${activeDropdown === 'main' ? 'active' : ''}`}>
            <Link to="/home" className="dropdown-item">Home Dashboard</Link>
            <Link to="/practice" className="dropdown-item">Start Practice</Link>
          </div>
        </li>
        
        <li 
          className={`nav-item ${currentPath.includes('/progress') ? 'active' : ''}`}
          onMouseEnter={() => handleMouseEnter('progress')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-link">Progress</span>
          <div className={`dropdown-menu ${activeDropdown === 'progress' ? 'active' : ''}`}>
            <Link to="/progress" className="dropdown-item">Progress Dashboard</Link>
            <Link to="/progress/history" className="dropdown-item">Session History</Link>
            <Link to="/progress/analytics" className="dropdown-item">PAHM Analytics</Link>
          </div>
        </li>
        
        <li 
          className="nav-item" 
          onMouseEnter={() => handleMouseEnter('learning')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-link">Learning</span>
          <div className={`dropdown-menu ${activeDropdown === 'learning' ? 'active' : ''}`}>
            <Link to="/learning/stages" className="dropdown-item">Stage Instructions</Link>
            <Link to="/learning/posture" className="dropdown-item">Posture Guide</Link>
            <Link to="/learning/pahm" className="dropdown-item">PAHM Explanation</Link>
          </div>
        </li>
        
        <li 
          className="nav-item" 
          onMouseEnter={() => handleMouseEnter('settings')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-link">Settings</span>
          <div className={`dropdown-menu ${activeDropdown === 'settings' ? 'active' : ''}`}>
            <Link to="/profile" className="dropdown-item">User Profile</Link>
            <Link to="/settings/notifications" className="dropdown-item">Notifications</Link>
            <Link to="/settings/app" className="dropdown-item">App Settings</Link>
          </div>
        </li>
        
        <li 
          className="nav-item" 
          onMouseEnter={() => handleMouseEnter('other')}
          onMouseLeave={handleMouseLeave}
        >
          <span className="nav-link">Other</span>
          <div className={`dropdown-menu ${activeDropdown === 'other' ? 'active' : ''}`}>
            <Link to="/assistant" className="dropdown-item">AI Assistant</Link>
            <Link to="/recovery" className="dropdown-item">Mind Recovery Hub</Link>
            <Link to="/short-practice" className="dropdown-item">Short Practice</Link>
          </div>
        </li>
      </ul>
      
      {/* Mobile menu toggle - would be expanded in a real implementation */}
      <div className="mobile-menu-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
};

export default NavigationMenu;
