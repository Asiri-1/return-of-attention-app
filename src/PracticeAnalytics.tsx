import React, { useState } from 'react';
import './SessionHistory.css';
import { useNavigate } from 'react-router-dom';

interface SessionHistoryProps {
  onBack: () => void;
}

interface SessionData {
  date: string;
  duration: number;
  status: 'present' | 'past' | 'future' | 'judgment' | 'other';
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ onBack }) => {
  const navigate = useNavigate();
  
  // Mock data for session history
  const sessions: SessionData[] = [
    { date: 'April 22', duration: 5, status: 'present' },
    { date: 'April 21', duration: 5, status: 'past' },
    { date: 'April 20', duration: 5, status: 'future' },
    { date: 'April 19', duration: 5, status: 'other' },
    { date: 'April 17', duration: 5, status: 'judgment' },
    { date: 'April 16', duration: 5, status: 'present' },
    { date: 'April 15', duration: 5, status: 'past' },
    { date: 'April 14', duration: 5, status: 'future' },
    { date: 'April 13', duration: 5, status: 'other' }
  ];
  
  const [sortFilter, setSortFilter] = useState<boolean>(false);
  
  const getStatusColor = (status: string): string => {
    switch(status) {
      case 'present':
        return '#4285F4';
      case 'past':
        return '#34A853';
      case 'future':
        return '#FBBC05';
      case 'judgment':
        return '#EA4335';
      default:
        return '#9E9E9E';
    }
  };
  
  const toggleSortFilter = () => {
    setSortFilter(!sortFilter);
  };
  
  return (
    <div className="session-history">
      <div className="session-history-content">
        <h1>SESSION HISTORY</h1>
        
        <div className="sort-filter" onClick={toggleSortFilter}>
          <span>Sort and filter</span>
          <span className="dropdown-icon">▼</span>
          
          {sortFilter && (
            <div className="sort-filter-dropdown">
              <div className="filter-option">
                <input type="radio" id="date-desc" name="sort" defaultChecked />
                <label htmlFor="date-desc">Date (newest first)</label>
              </div>
              <div className="filter-option">
                <input type="radio" id="date-asc" name="sort" />
                <label htmlFor="date-asc">Date (oldest first)</label>
              </div>
              <div className="filter-option">
                <input type="radio" id="duration-desc" name="sort" />
                <label htmlFor="duration-desc">Duration (longest first)</label>
              </div>
              <div className="filter-option">
                <input type="radio" id="duration-asc" name="sort" />
                <label htmlFor="duration-asc">Duration (shortest first)</label>
              </div>
              <div className="filter-section">
                <h3>Filter by status</h3>
                <div className="filter-option">
                  <input type="checkbox" id="filter-present" defaultChecked />
                  <label htmlFor="filter-present">Present</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="filter-past" defaultChecked />
                  <label htmlFor="filter-past">Past</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="filter-future" defaultChecked />
                  <label htmlFor="filter-future">Future</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="filter-judgment" defaultChecked />
                  <label htmlFor="filter-judgment">Judgment</label>
                </div>
                <div className="filter-option">
                  <input type="checkbox" id="filter-other" defaultChecked />
                  <label htmlFor="filter-other">Other</label>
                </div>
              </div>
              <button className="apply-filter-button">Apply</button>
            </div>
          )}
        </div>
        
        <div className="sessions-list">
          {sessions.map((session, index) => (
            <div key={index} className="session-item">
              <div className="session-date">{session.date}</div>
              <div className="session-duration">{session.duration} min</div>
              <div 
                className="session-status-indicator"
                style={{ backgroundColor: getStatusColor(session.status) }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="tab-navigation">
        <button className="tab-button" onClick={() => navigate('/home')}>
          <div className="tab-icon">🏠</div>
          <div className="tab-label">Home</div>
        </button>
        <button className="tab-button" onClick={() => navigate('/practice')}>
          <div className="tab-icon">⏺</div>
          <div className="tab-label">Practice</div>
        </button>
        <button className="tab-button active" onClick={() => navigate('/progress')}>
          <div className="tab-icon">📊</div>
          <div className="tab-label">Progress</div>
        </button>
        <button className="tab-button" onClick={() => navigate('/profile')}>
          <div className="tab-icon">👤</div>
          <div className="tab-label">Profile</div>
        </button>
      </div>
    </div>
  );
};

export default SessionHistory;
