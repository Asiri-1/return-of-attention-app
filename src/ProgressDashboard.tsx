import React, { useState, useEffect } from 'react';
import './ProgressDashboard.css';
import { useAuth } from './AuthContext';

export interface ProgressDashboardProps {
  onBack: () => void;
  onViewSessionHistory: () => void;
  onViewAnalytics: () => void;
}

interface PracticeData {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  date?: Date;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onBack = () => {},
  onViewSessionHistory = () => {},
  onViewAnalytics = () => {}
}) => {
  const { currentUser } = useAuth();
  const [practiceData, setPracticeData] = useState<PracticeData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Fetch user progress data
  useEffect(() => {
    // In a real app, this would fetch data from an API
    // For now, we'll initialize with zeros for new users
    
    // Simulate API delay
    const timer = setTimeout(() => {
      // Initialize practice data to zeros
      setPracticeData({
        totalSessions: 0,
        totalMinutes: 0,
        currentStreak: 0
      });
      
      // Mock achievements (these can remain as they are, or be dynamically loaded)
      setAchievements([
        {
          id: 'first-session',
          title: 'First Step',
          description: 'Complete your first practice session',
          earned: false, // Set to false initially
        },
        {
          id: 'three-day-streak',
          title: 'Momentum Builder',
          description: 'Practice for 3 consecutive days',
          earned: false,
        },
        {
          id: 'present-50',
          title: 'Present Mind',
          description: 'Achieve 50% present awareness in a session',
          earned: false,
        },
        {
          id: 'seven-day-streak',
          title: 'Consistent Practitioner',
          description: 'Practice for 7 consecutive days',
          earned: false
        }
      ]);
      
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (loading) {
    return (
      <div className="progress-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your progress...</p>
      </div>
    );
  }
  
  return (
    <div className="progress-dashboard">
      <div className="progress-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Progress Dashboard</h1>
      </div>
      
      <div className="progress-content">
        <div className="progress-summary">
          <h2>Your Progress</h2>
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total Sessions</h3>
              <p className="stat-value">{practiceData?.totalSessions || 0}</p>
            </div>
            <div className="stat-card">
              <h3>Practice Time</h3>
              <p className="stat-value">{practiceData ? (practiceData.totalMinutes / 60).toFixed(1) : 0} hours</p>
            </div>
            <div className="stat-card">
              <h3>Current Streak</h3>
              <p className="stat-value">{practiceData?.currentStreak || 0} days</p>
            </div>
          </div>
        </div>
        
        <div className="achievements-section">
          <h2>Achievements</h2>
          <div className="achievements-list">
            {achievements.map(achievement => (
              <div 
                key={achievement.id} 
                className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
              >
                <div className="achievement-icon">
                  {achievement.earned ? '🏆' : '🔒'}
                </div>
                <div className="achievement-details">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  {achievement.earned && achievement.date && (
                    <div className="achievement-date">
                      Earned on {achievement.date.toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="progress-actions">
          <button className="action-button" onClick={onViewSessionHistory}>
            View Session History
          </button>
          <button className="action-button" onClick={onViewAnalytics}>
            View PAHM Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
