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
          title: 'First Session',
          description: 'Complete your first mindfulness session.',
          earned: true,
          date: new Date()
        },
        {
          id: 'seven-day-streak',
          title: '7-Day Streak',
          description: 'Complete a mindfulness session for 7 consecutive days.',
          earned: false
        },
        {
          id: 'thirty-sessions',
          title: '30 Sessions',
          description: 'Complete 30 mindfulness sessions.',
          earned: false
        }
      ]);
      setLoading(false);
    }, 500); // Simulate network delay

    return () => clearTimeout(timer);
  }, [currentUser]);

  if (loading) {
    return <div className="progress-dashboard-container">Loading analytics...</div>;
  }

  return (
    <div className="progress-dashboard-container">
      <div className="progress-dashboard-header">
        <button onClick={onBack} className="back-button">Back</button>
        <h2>My Progress</h2>
      </div>
      <div className="progress-summary">
        <div className="summary-card">
          <h3>{practiceData?.totalSessions ?? 0}</h3>
          <p>Total Sessions</p>
        </div>
        <div className="summary-card">
          <h3>{practiceData?.totalMinutes ? (practiceData.totalMinutes / 60).toFixed(1) : 0}</h3>
          <p>Practice Hours</p>
        </div>
        <div className="summary-card">
          <h3>{practiceData?.currentStreak ?? 0}</h3>
          <p>Day Streak</p>
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
  );
};

export default ProgressDashboard;
