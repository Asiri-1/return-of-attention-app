import React, { useState, useEffect } from 'react';
import './AnalyticsBoard.css';
import { useAuth } from './AuthContext';

interface PracticeSession {
  id: string;
  date: string;
  duration: number;
  stageLevel: string;
  position: string;
  rating?: number;
  notes?: string;
}

interface EmotionalNote {
  id: string;
  content: string;
  timestamp: string;
  emotion?: string;
  tags?: string[];
}

interface AppUsageData {
  lastLogin: string;
  totalSessions: number;
  totalPracticeTime: number;
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
}

const AnalyticsBoard: React.FC = () => {
  const { currentUser } = useAuth();
  const [practiceData, setPracticeData] = useState<PracticeSession[]>([]);
  const [emotionalNotes, setEmotionalNotes] = useState<EmotionalNote[]>([]);
  const [appUsage, setAppUsage] = useState<AppUsageData>({
    lastLogin: new Date().toISOString(),
    totalSessions: 0,
    totalPracticeTime: 0,
    averageSessionLength: 0,
    longestStreak: 0,
    currentStreak: 0
  });
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('month');
  
  // Load data from localStorage on component mount
  useEffect(() => {
    // Load practice sessions
    const savedPracticeData = localStorage.getItem('practiceData');
    if (savedPracticeData) {
      try {
        const parsedData = JSON.parse(savedPracticeData);
        if (parsedData.sessions) {
          setPracticeData(parsedData.sessions);
        }
      } catch (e) {
        console.error('Error parsing practice data:', e);
      }
    }
    
    // Load emotional notes
    const savedNotes = localStorage.getItem('emotionalNotes');
    if (savedNotes) {
      try {
        setEmotionalNotes(JSON.parse(savedNotes));
      } catch (e) {
        console.error('Error parsing emotional notes:', e);
      }
    }
    
    // Calculate app usage statistics
    calculateAppUsageStats();
  }, []);
  
  // Calculate app usage statistics
  const calculateAppUsageStats = () => {
    // This would normally come from a backend API
    // For now, we'll generate some mock data
    const mockUsage: AppUsageData = {
      lastLogin: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      totalSessions: 24,
      totalPracticeTime: 720, // minutes
      averageSessionLength: 30, // minutes
      longestStreak: 7,
      currentStreak: 3
    };
    
    setAppUsage(mockUsage);
  };
  
  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 1); // Default to month
    }
    
    return {
      practice: practiceData.filter(session => new Date(session.date) >= cutoffDate),
      notes: emotionalNotes.filter(note => new Date(note.timestamp) >= cutoffDate)
    };
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Get emotion distribution data
  const getEmotionDistribution = () => {
    const { notes } = getFilteredData();
    const emotionCounts: {[key: string]: number} = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      disgust: 0,
      surprise: 0,
      neutral: 0
    };
    
    notes.forEach(note => {
      const emotion = note.emotion || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      color: emotion === 'joy' ? '#FFD700' :
             emotion === 'sadness' ? '#6495ED' :
             emotion === 'anger' ? '#FF6347' :
             emotion === 'fear' ? '#9370DB' :
             emotion === 'disgust' ? '#8FBC8F' :
             emotion === 'surprise' ? '#FF69B4' : '#A9A9A9'
    }));
  };
  
  // Get practice duration data
  const getPracticeDurationData = () => {
    const { practice } = getFilteredData();
    
    // Group by date and calculate total duration per day
    const durationByDate: {[key: string]: number} = {};
    practice.forEach(session => {
      const dateKey = formatDate(session.date);
      durationByDate[dateKey] = (durationByDate[dateKey] || 0) + session.duration;
    });
    
    // Sort dates
    const sortedDates = Object.keys(durationByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    
    return sortedDates.map(date => ({
      date,
      duration: durationByDate[date]
    }));
  };
  
  // Get practice distribution by stage level
  const getPracticeDistribution = () => {
    const { practice } = getFilteredData();
    
    // Count sessions by stage level
    const countByStage: {[key: string]: number} = {};
    practice.forEach(session => {
      const stageKey = session.stageLevel.split(':')[0].trim();
      countByStage[stageKey] = (countByStage[stageKey] || 0) + 1;
    });
    
    return Object.entries(countByStage).map(([stage, count]) => ({
      stage,
      count
    }));
  };
  
  // Simple bar chart component
  const SimpleBarChart = ({ data, valueKey, labelKey, colorKey }: { 
    data: any[], 
    valueKey: string, 
    labelKey: string,
    colorKey?: string
  }) => {
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div className="simple-bar-chart">
        {data.map((item, index) => (
          <div key={index} className="chart-row">
            <div className="chart-label">{item[labelKey]}</div>
            <div className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ 
                  width: `${(item[valueKey] / maxValue) * 100}%`,
                  backgroundColor: colorKey ? item[colorKey] : '#3498db'
                }}
              ></div>
              <span className="chart-value">{item[valueKey]}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  // Simple line chart component
  const SimpleLineChart = ({ data }: { data: {date: string, duration: number}[] }) => {
    if (data.length === 0) return <div className="empty-chart">No data available</div>;
    
    const maxValue = Math.max(...data.map(item => item.duration));
    const chartHeight = 200;
    
    return (
      <div className="simple-line-chart" style={{ height: `${chartHeight}px` }}>
        <div className="chart-lines">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="chart-line" style={{ bottom: `${i * 25}%` }}></div>
          ))}
        </div>
        
        <div className="chart-points">
          {data.map((item, index) => {
            const heightPercent = (item.duration / maxValue) * 100;
            
            return (
              <div 
                key={index} 
                className="chart-point-container"
                style={{ 
                  left: `${(index / (data.length - 1)) * 100}%`,
                  height: '100%'
                }}
              >
                <div 
                  className="chart-point" 
                  style={{ 
                    bottom: `${heightPercent}%`
                  }}
                  title={`${item.date}: ${item.duration} minutes`}
                ></div>
                {index > 0 && (
                  <div 
                    className="chart-line-segment"
                    style={{
                      bottom: `${(data[index-1].duration / maxValue) * 100}%`,
                      height: `${Math.abs(heightPercent - (data[index-1].duration / maxValue) * 100)}%`,
                      transform: heightPercent > (data[index-1].duration / maxValue) * 100 ? 'scaleY(-1)' : 'none'
                    }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="chart-labels">
          {data.map((item, index) => (
            index % Math.ceil(data.length / 5) === 0 && (
              <div 
                key={index} 
                className="chart-label"
                style={{ 
                  left: `${(index / (data.length - 1)) * 100}%`
                }}
              >
                {item.date}
              </div>
            )
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="analytics-board">
      <header className="analytics-header">
        <h1>My Analytics</h1>
        <p className="analytics-description">
          Track your progress, emotional patterns, and practice insights.
        </p>
        
        <div className="analytics-controls">
          <div className="time-range-selector">
            <label>Time Range:</label>
            <div className="time-range-buttons">
              <button 
                className={`time-button ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                Week
              </button>
              <button 
                className={`time-button ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                Month
              </button>
              <button 
                className={`time-button ${timeRange === 'year' ? 'active' : ''}`}
                onClick={() => setTimeRange('year')}
              >
                Year
              </button>
            </div>
          </div>
        </div>
        
        <div className="analytics-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'practice' ? 'active' : ''}`}
            onClick={() => setActiveTab('practice')}
          >
            Practice
          </button>
          <button 
            className={`tab-button ${activeTab === 'emotional' ? 'active' : ''}`}
            onClick={() => setActiveTab('emotional')}
          >
            Emotional
          </button>
          <button 
            className={`tab-button ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            App Usage
          </button>
        </div>
      </header>
      
      <div className="analytics-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-summary">
              <div className="stat-card">
                <div className="stat-value">{appUsage.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{Math.round(appUsage.totalPracticeTime / 60)}</div>
                <div className="stat-label">Practice Hours</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{appUsage.currentStreak}</div>
                <div className="stat-label">Day Streak</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{emotionalNotes.length}</div>
                <div className="stat-label">Emotional Notes</div>
              </div>
            </div>
            
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Practice Duration Trend</h3>
                <SimpleLineChart data={getPracticeDurationData()} />
              </div>
              
              <div className="chart-container">
                <h3>Emotional Distribution</h3>
                <SimpleBarChart 
                  data={getEmotionDistribution()} 
                  valueKey="count" 
                  labelKey="emotion"
                  colorKey="color"
                />
              </div>
            </div>
            
            <div className="insights-section">
              <h3>Key Insights</h3>
              <div className="insights-list">
                <div className="insight-card">
                  <div className="insight-icon">⬆️</div>
                  <div className="insight-content">
                    <h4>Practice Consistency</h4>
                    <p>Your practice consistency has improved by 15% compared to last month.</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">📊</div>
                  <div className="insight-content">
                    <h4>Emotional Balance</h4>
                    <p>Your emotional wellbeing score has been trending upward over the past 2 weeks.</p>
                  </div>
                </div>
                
                <div className="insight-card">
                  <div className="insight-icon">🎯</div>
                  <div className="insight-content">
                    <h4>Next Goal</h4>
                    <p>Try to maintain a 5-day practice streak to unlock the next achievement.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div className="practice-tab">
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Practice Duration Trend</h3>
                <SimpleLineChart data={getPracticeDurationData()} />
              </div>
              
              <div className="chart-container">
                <h3>Practice by Stage</h3>
                <SimpleBarChart 
                  data={getPracticeDistribution()} 
                  valueKey="count" 
                  labelKey="stage"
                />
              </div>
            </div>
            
            <div className="practice-history">
              <h3>Recent Practice Sessions</h3>
              <div className="session-list">
                {getFilteredData().practice.length === 0 ? (
                  <div className="empty-state">No practice sessions in the selected time range.</div>
                ) : (
                  getFilteredData().practice.slice(0, 5).map(session => (
                    <div key={session.id} className="session-card">
                      <div className="session-date">{formatDate(session.date)}</div>
                      <div className="session-details">
                        <div className="session-stage">{session.stageLevel}</div>
                        <div className="session-duration">{session.duration} min</div>
                        {session.rating && (
                          <div className="session-rating">
                            Rating: {session.rating}/5
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Emotional Tab */}
        {activeTab === 'emotional' && (
          <div className="emotional-tab">
            <div className="charts-grid">
              <div className="chart-container">
                <h3>Emotion Distribution</h3>
                <SimpleBarChart 
                  data={getEmotionDistribution()} 
                  valueKey="count" 
                  labelKey="emotion"
                  colorKey="color"
                />
              </div>
            </div>
            
            <div className="emotional-notes-summary">
              <h3>Recent Emotional Notes</h3>
              <div className="notes-list">
                {getFilteredData().notes.length === 0 ? (
                  <div className="empty-state">No emotional notes in the selected time range.</div>
                ) : (
                  getFilteredData().notes.slice(0, 5).map(note => (
                    <div key={note.id} className="note-summary-card">
                      <div className="note-emotion-indicator" style={{
                        backgroundColor: note.emotion === 'joy' ? '#FFD700' :
                                        note.emotion === 'sadness' ? '#6495ED' :
                                        note.emotion === 'anger' ? '#FF6347' :
                                        note.emotion === 'fear' ? '#9370DB' :
                                        note.emotion === 'disgust' ? '#8FBC8F' :
                                        note.emotion === 'surprise' ? '#FF69B4' : '#A9A9A9'
                      }}></div>
                      <div className="note-summary-content">
                        <div className="note-summary-header">
                          <div className="note-emotion-name">
                            {note.emotion ? note.emotion.charAt(0).toUpperCase() + note.emotion.slice(1) : 'Neutral'}
                          </div>
                          <div className="note-date">{formatDate(note.timestamp)}</div>
                        </div>
                        <div className="note-text">{note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* App Usage Tab */}
        {activeTab === 'usage' && (
          <div className="usage-tab">
            <div className="usage-stats">
              <div className="stat-card large">
                <div className="stat-value">{appUsage.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              
              <div className="stat-card large">
                <div className="stat-value">{Math.round(appUsage.totalPracticeTime / 60)}</div>
                <div className="stat-label">Practice Hours</div>
              </div>
              
              <div className="stat-card large">
                <div className="stat-value">{appUsage.averageSessionLength}</div>
                <div className="stat-label">Avg. Session (min)</div>
              </div>
              
              <div className="stat-card large">
                <div className="stat-value">{appUsage.longestStreak}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
            </div>
            
            <div className="usage-details">
              <h3>App Usage Details</h3>
              <div className="usage-detail-card">
                <div className="detail-label">Current Streak</div>
                <div className="detail-value">{appUsage.currentStreak} days</div>
              </div>
              
              <div className="usage-detail-card">
                <div className="detail-label">Last Login</div>
                <div className="detail-value">{formatDate(appUsage.lastLogin)}</div>
              </div>
              
              <div className="usage-detail-card">
                <div className="detail-label">Notes Created</div>
                <div className="detail-value">{emotionalNotes.length}</div>
              </div>
              
              <div className="usage-detail-card">
                <div className="detail-label">Practice Completion Rate</div>
                <div className="detail-value">87%</div>
              </div>
            </div>
            
            <div className="achievements-section">
              <h3>Achievements</h3>
              <div className="achievements-grid">
                <div className="achievement-card unlocked">
                  <div className="achievement-icon">🏆</div>
                  <div className="achievement-name">First Steps</div>
                  <div className="achievement-description">Complete your first practice session</div>
                </div>
                
                <div className="achievement-card unlocked">
                  <div className="achievement-icon">📝</div>
                  <div className="achievement-name">Reflective Mind</div>
                  <div className="achievement-description">Create 5 emotional notes</div>
                </div>
                
                <div className="achievement-card">
                  <div className="achievement-icon">🔄</div>
                  <div className="achievement-name">Consistency Master</div>
                  <div className="achievement-description">Maintain a 7-day practice streak</div>
                </div>
                
                <div className="achievement-card">
                  <div className="achievement-icon">⏱️</div>
                  <div className="achievement-name">Time Dedicated</div>
                  <div className="achievement-description">Practice for a total of 10 hours</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsBoard;
