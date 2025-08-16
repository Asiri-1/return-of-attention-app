// ===============================================
// 🔧 FIXED ProgressDashboard.tsx - FIREBASE INTEGRATION
// ===============================================

// FILE: src/ProgressDashboard.tsx
// ✅ FIXED: Real Firebase data through PracticeContext
// ✅ FIXED: Hours-based stage progression
// ✅ FIXED: Real-time updates from Firebase
// ✅ FIXED: Achievement system based on actual progress

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './ProgressDashboard.css';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

export interface ProgressDashboardProps {
  onBack: () => void;
  onViewSessionHistory: () => void;
  onViewAnalytics: () => void;
}

interface PracticeData {
  totalSessions: number;
  totalMinutes: number;
  totalHours: number;
  currentStreak: number;
  meditationSessions: number;
  mindRecoverySessions: number;
  averageRating: number;
  currentStage: number;
  completedTLevels: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  date?: Date;
  icon: string;
  category: 'practice' | 'streak' | 'stage' | 'time' | 'special';
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  onBack = () => {},
  onViewSessionHistory = () => {},
  onViewAnalytics = () => {}
}) => {
  const { currentUser } = useAuth();
  
  // ✅ CRITICAL: Get real Firebase data through contexts
  const { 
    sessions,
    isLoading: practiceLoading,
    stats,
    getCurrentStage,
    getTotalPracticeHours,
    calculateStats
  } = usePractice();
  
  const { 
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions
  } = useUser();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [forceRefresh, setForceRefresh] = useState<number>(0);

  // ✅ Calculate real practice data from Firebase
  const practiceData = useMemo((): PracticeData => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        totalHours: 0,
        currentStreak: 0,
        meditationSessions: 0,
        mindRecoverySessions: 0,
        averageRating: 0,
        currentStage: 1,
        completedTLevels: 0
      };
    }

    try {
      // Calculate real statistics
      const practiceStats = calculateStats();
      const currentStage = getCurrentStage();
      const totalHours = getTotalPracticeHours();
      
      // Calculate streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const uniqueDateSessions = [...sessions]
        .map(session => {
          const date = new Date(session.timestamp);
          date.setHours(0, 0, 0, 0);
          return date;
        })
        .sort((a, b) => b.getTime() - a.getTime())
        .filter((date, index, arr) => index === 0 || date.getTime() !== arr[index - 1].getTime());

      let streakCount = 0;
      let checkDate = new Date(today);

      for (const sessionDate of uniqueDateSessions) {
        const diffDays = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streakCount) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      currentStreak = streakCount;

      // Count completed T-levels
      const completedTLevels = [
        isT1Complete(), isT2Complete(), isT3Complete(), 
        isT4Complete(), isT5Complete()
      ].filter(Boolean).length;

      return {
        totalSessions: practiceStats.totalSessions,
        totalMinutes: practiceStats.totalMinutes,
        totalHours: totalHours,
        currentStreak,
        meditationSessions: practiceStats.totalMeditationSessions,
        mindRecoverySessions: practiceStats.totalMindRecoverySessions,
        averageRating: practiceStats.averageQuality,
        currentStage,
        completedTLevels
      };
    } catch (error) {
      console.error('Error calculating practice data:', error);
      return {
        totalSessions: 0,
        totalMinutes: 0,
        totalHours: 0,
        currentStreak: 0,
        meditationSessions: 0,
        mindRecoverySessions: 0,
        averageRating: 0,
        currentStage: 1,
        completedTLevels: 0
      };
    }
  }, [sessions, calculateStats, getCurrentStage, getTotalPracticeHours, 
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete, forceRefresh]);

  // ✅ Calculate real achievements based on Firebase data
  const achievements = useMemo((): Achievement[] => {
    const baseAchievements: Achievement[] = [
      // Practice Achievements
      {
        id: 'first-session',
        title: 'First Steps',
        description: 'Complete your first mindfulness session.',
        earned: practiceData.totalSessions >= 1,
        icon: '🌱',
        category: 'practice',
        date: sessions && sessions.length > 0 ? new Date(sessions[sessions.length - 1].timestamp) : undefined
      },
      {
        id: 'ten-sessions',
        title: 'Dedicated Practitioner',
        description: 'Complete 10 mindfulness sessions.',
        earned: practiceData.totalSessions >= 10,
        icon: '🎯',
        category: 'practice'
      },
      {
        id: 'fifty-sessions',
        title: 'Committed Seeker',
        description: 'Complete 50 mindfulness sessions.',
        earned: practiceData.totalSessions >= 50,
        icon: '🏆',
        category: 'practice'
      },
      
      // Streak Achievements
      {
        id: 'three-day-streak',
        title: 'Building Momentum',
        description: 'Complete a mindfulness session for 3 consecutive days.',
        earned: practiceData.currentStreak >= 3,
        icon: '🔥',
        category: 'streak'
      },
      {
        id: 'seven-day-streak',
        title: 'Week Warrior',
        description: 'Complete a mindfulness session for 7 consecutive days.',
        earned: practiceData.currentStreak >= 7,
        icon: '⚡',
        category: 'streak'
      },
      {
        id: 'thirty-day-streak',
        title: 'Mindfulness Master',
        description: 'Complete a mindfulness session for 30 consecutive days.',
        earned: practiceData.currentStreak >= 30,
        icon: '👑',
        category: 'streak'
      },
      
      // Time Achievements
      {
        id: 'five-hours',
        title: 'Time Keeper',
        description: 'Accumulate 5 hours of practice time.',
        earned: practiceData.totalHours >= 5,
        icon: '⏰',
        category: 'time'
      },
      {
        id: 'twenty-hours',
        title: 'Deep Diver',
        description: 'Accumulate 20 hours of practice time.',
        earned: practiceData.totalHours >= 20,
        icon: '🌊',
        category: 'time'
      },
      {
        id: 'fifty-hours',
        title: 'Meditation Monk',
        description: 'Accumulate 50 hours of practice time.',
        earned: practiceData.totalHours >= 50,
        icon: '🧘',
        category: 'time'
      },
      
      // Stage Achievements
      {
        id: 't5-complete',
        title: 'Physical Stillness Master',
        description: 'Complete all T1-T5 physical stillness practices.',
        earned: isT5Complete(),
        icon: '🎊',
        category: 'stage'
      },
      {
        id: 'stage-2-unlocked',
        title: 'Attention Trainee',
        description: 'Unlock Stage 2: PAHM Trainee.',
        earned: practiceData.currentStage >= 2,
        icon: '👁️',
        category: 'stage'
      },
      {
        id: 'stage-3-unlocked',
        title: 'Structured Practitioner',
        description: 'Unlock Stage 3: PAHM Beginner.',
        earned: practiceData.currentStage >= 3,
        icon: '🎯',
        category: 'stage'
      },
      {
        id: 'stage-4-unlocked',
        title: 'Advanced Seeker',
        description: 'Unlock Stage 4: PAHM Practitioner.',
        earned: practiceData.currentStage >= 4,
        icon: '⚡',
        category: 'stage'
      },
      {
        id: 'stage-5-unlocked',
        title: 'Refined Awareness',
        description: 'Unlock Stage 5: PAHM Master.',
        earned: practiceData.currentStage >= 5,
        icon: '✨',
        category: 'stage'
      },
      {
        id: 'stage-6-unlocked',
        title: 'Complete Mastery',
        description: 'Unlock Stage 6: PAHM Illuminator.',
        earned: practiceData.currentStage >= 6,
        icon: '🌟',
        category: 'stage'
      },
      
      // Special Achievements
      {
        id: 'mind-recovery-explorer',
        title: 'Mind Recovery Explorer',
        description: 'Complete 5 mind recovery sessions.',
        earned: practiceData.mindRecoverySessions >= 5,
        icon: '🌈',
        category: 'special'
      },
      {
        id: 'quality-seeker',
        title: 'Quality Seeker',
        description: 'Maintain an average session rating of 8+.',
        earned: practiceData.averageRating >= 8,
        icon: '⭐',
        category: 'special'
      }
    ];

    // Set dates for earned achievements (estimate based on session data)
    return baseAchievements.map(achievement => {
      if (achievement.earned && !achievement.date && sessions && sessions.length > 0) {
        // Estimate achievement date based on when criteria was likely met
        let estimatedDate = new Date();
        
        if (achievement.id === 'first-session') {
          estimatedDate = new Date(sessions[sessions.length - 1].timestamp);
        } else if (achievement.id.includes('sessions')) {
          const sessionCount = parseInt(achievement.id.split('-')[0]);
          if (sessions.length >= sessionCount) {
            estimatedDate = new Date(sessions[sessions.length - sessionCount].timestamp);
          }
        } else if (achievement.id.includes('hours')) {
          // Estimate when they hit the hour milestone
          estimatedDate = new Date(sessions[Math.floor(sessions.length / 2)]?.timestamp || Date.now());
        }
        
        return { ...achievement, date: estimatedDate };
      }
      return achievement;
    });
  }, [practiceData, sessions, isT5Complete]);

  // ✅ Set loading state based on real data availability
  useEffect(() => {
    if (!practiceLoading && currentUser) {
      setLoading(false);
    }
  }, [practiceLoading, currentUser]);

  // ✅ Listen for session updates to refresh data
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      console.log(`📊 ProgressDashboard: ${sessions.length} sessions loaded`);
      setForceRefresh(prev => prev + 1);
    }
  }, [sessions]);

  // ✅ Force refresh function
  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing progress dashboard...');
    setForceRefresh(prev => prev + 1);
  }, []);

  if (loading || practiceLoading) {
    return (
      <div className="progress-dashboard-container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '18px',
          color: '#667eea'
        }}>
          Loading your progress data...
        </div>
      </div>
    );
  }

  const earnedAchievements = achievements.filter(a => a.earned);
  const totalAchievements = achievements.length;

  return (
    <div className="progress-dashboard-container">
      <div className="progress-dashboard-header">
        <button onClick={onBack} className="back-button">Back</button>
        <h2>My Progress</h2>
        <button 
          onClick={handleRefresh} 
          className="refresh-button"
          style={{
            background: 'none',
            border: '1px solid #667eea',
            borderRadius: '6px',
            color: '#667eea',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* ✅ Real-time progress summary */}
      <div className="progress-summary">
        <div className="summary-card">
          <h3>{practiceData.totalSessions}</h3>
          <p>Total Sessions</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {practiceData.meditationSessions} meditation, {practiceData.mindRecoverySessions} recovery
          </div>
        </div>
        <div className="summary-card">
          <h3>{practiceData.totalHours.toFixed(1)}</h3>
          <p>Practice Hours</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {practiceData.totalMinutes} total minutes
          </div>
        </div>
        <div className="summary-card">
          <h3>{practiceData.currentStreak}</h3>
          <p>Day Streak</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {practiceData.currentStreak > 0 ? '🔥 Keep it up!' : 'Start your streak today!'}
          </div>
        </div>
        <div className="summary-card">
          <h3>Stage {practiceData.currentStage}</h3>
          <p>Current Stage</p>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            T-Levels: {practiceData.completedTLevels}/5
          </div>
        </div>
      </div>

      {/* ✅ Achievement progress indicator */}
      <div style={{
        background: '#f8f9fa',
        padding: '16px',
        borderRadius: '12px',
        margin: '20px 0',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#333' }}>
          Achievement Progress
        </h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
          {earnedAchievements.length}/{totalAchievements}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          {Math.round((earnedAchievements.length / totalAchievements) * 100)}% Complete
        </div>
      </div>

      {/* ✅ Real achievements based on Firebase data */}
      <div className="achievements-section">
        <h2>Achievements ({earnedAchievements.length} earned)</h2>
        <div className="achievements-list">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.earned ? achievement.icon : '🔒'}
              </div>
              <div className="achievement-details">
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                {achievement.earned && achievement.date && (
                  <div className="achievement-date">
                    Earned on {achievement.date.toLocaleDateString()}
                  </div>
                )}
                <div style={{
                  fontSize: '11px',
                  color: achievement.earned ? '#10b981' : '#999',
                  fontWeight: '600',
                  marginTop: '4px',
                  textTransform: 'uppercase'
                }}>
                  {achievement.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ✅ Action buttons */}
      <div className="progress-actions">
        <button className="action-button" onClick={onViewSessionHistory}>
          📊 View Session History
        </button>
        <button className="action-button" onClick={onViewAnalytics}>
          📈 View PAHM Analytics
        </button>
      </div>

      {/* ✅ Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f0f0f0',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <div><strong>Debug Info:</strong></div>
          <div>Sessions: {sessions?.length || 0}</div>
          <div>Current Stage: {practiceData.currentStage}</div>
          <div>Total Hours: {practiceData.totalHours.toFixed(2)}</div>
          <div>T5 Complete: {isT5Complete() ? 'Yes' : 'No'}</div>
          <div>Earned Achievements: {earnedAchievements.length}</div>
        </div>
      )}
    </div>
  );
};

export default ProgressDashboard;