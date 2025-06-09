import React, { useState, useEffect } from 'react';
import './SessionHistory.css';

interface SessionHistoryProps {
  onBack: () => void;
  onViewSession?: (sessionId: string) => void;
}

interface SessionData {
  id: string;
  date: string;
  duration: number;
  positions: {
    [key: string]: number;
  };
  notes?: string;
}

const SessionHistory: React.FC<SessionHistoryProps> = ({ onBack, onViewSession }) => {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('all');
  
  // Load sessions
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Load from local storage
        const savedSessions = localStorage.getItem('sessions');
        const parsedSessions = savedSessions ? JSON.parse(savedSessions) : [];
        
        // Sort by date (newest first)
        parsedSessions.sort((a: SessionData, b: SessionData) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setSessions(parsedSessions);
        setLoading(false);
      } catch (err) {
        setError('Failed to load session history');
        setLoading(false);
      }
    }, 1000);
  }, []);
  
  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    
    const sessionDate = new Date(session.date);
    const now = new Date();
    
    if (filter === 'week') {
      // Sessions from the last 7 days
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return sessionDate >= weekAgo;
    }
    
    if (filter === 'month') {
      // Sessions from the last 30 days
      const monthAgo = new Date();
      monthAgo.setDate(now.getDate() - 30);
      return sessionDate >= monthAgo;
    }
    
    return true;
  });
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format duration
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get most common position
  const getMostCommonPosition = (positions: {[key: string]: number}): string => {
    return Object.entries(positions).sort((a, b) => b[1] - a[1])[0][0];
  };
  
  // Handle session view
  const handleViewSession = (sessionId: string) => {
    if (onViewSession) {
      onViewSession(sessionId);
    }
  };
  
  return (
    <div className="session-history">
      <header className="history-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Session History</h1>
      </header>
      
      <div className="history-filters">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Time
        </button>
        <button 
          className={`filter-button ${filter === 'month' ? 'active' : ''}`}
          onClick={() => setFilter('month')}
        >
          Last 30 Days
        </button>
        <button 
          className={`filter-button ${filter === 'week' ? 'active' : ''}`}
          onClick={() => setFilter('week')}
        >
          Last 7 Days
        </button>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <p>Loading session history...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="no-sessions">
          <p>No practice sessions found for the selected time period.</p>
        </div>
      ) : (
        <div className="sessions-list">
          {filteredSessions.map(session => (
            <div 
              key={session.id}
              className="session-card"
              onClick={() => handleViewSession(session.id)}
            >
              <div className="session-date">
                {formatDate(session.date)}
              </div>
              
              <div className="session-details">
                <div className="session-duration">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{formatDuration(session.duration)}</span>
                </div>
                
                <div className="session-positions">
                  <span className="detail-label">Positions</span>
                  <span className="detail-value">
                    {Object.values(session.positions).reduce((sum, count) => sum + count, 0)}
                  </span>
                </div>
                
                <div className="session-most-common">
                  <span className="detail-label">Most Common</span>
                  <span className="detail-value">
                    {getMostCommonPosition(session.positions)}
                  </span>
                </div>
              </div>
              
              {session.notes && (
                <div className="session-notes">
                  <span className="notes-label">Notes:</span>
                  <p className="notes-content">{session.notes}</p>
                </div>
              )}
              
              <div className="view-details">View Details →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionHistory;
