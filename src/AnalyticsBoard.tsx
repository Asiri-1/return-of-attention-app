import React, { useState } from 'react';
import './AnalyticsBoard.css';
import { useAuth } from './AuthContext';
import { useLocalData } from './contexts/LocalDataContext';

const AnalyticsBoard: React.FC = () => {
  const { } = useAuth();
  const {
    isLoading,
    getAnalyticsData,
    getPAHMData,
    getEnvironmentData,
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getPracticeDistribution,
    getAppUsagePatterns,
    getEngagementMetrics,
    getFeatureUtilization,
    getMindRecoveryInsights,
    getPracticeSessions, // Added for debug
    refreshTrigger // ✅ Use refresh trigger for auto-updates
  } = useLocalData();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [activePAHMTab, setActivePAHMTab] = useState<string>('overall');

  // ✅ FIXED: All data getters now depend on refreshTrigger for auto-updates
  const analyticsData = getAnalyticsData();
  const pahmData = getPAHMData();
  const environmentData = getEnvironmentData();

  // Get filtered data based on time range
  const getFilteredAnalytics = () => {
    const filtered = getFilteredData(timeRange);
    return {
      practice: filtered.practice,
      notes: filtered.notes,
      practiceDuration: getPracticeDurationData(timeRange),
      emotionDistribution: getEmotionDistribution(timeRange),
      practiceDistribution: getPracticeDistribution(timeRange)
    };
  };

  const filteredData = getFilteredAnalytics();

  // ✅ NEW: Stage-specific PAHM analytics
  const getStageSpecificPAHMData = () => {
    // Debug: Let's see what data we actually have
    console.log('🔍 Debug Session Data:', {
      totalSessions: filteredData.practice.length,
      firstSession: filteredData.practice[0],
      sessionTypes: filteredData.practice.map(s => s.sessionType).slice(0, 5),
      stageLevels: filteredData.practice.map(s => s.stageLevel).slice(0, 5),
      hasPahmCounts: filteredData.practice.map(s => !!s.pahmCounts).slice(0, 5)
    });
    
    const sessions = filteredData.practice.filter(session => 
      session.sessionType === 'meditation' && 
      session.stageLevel && 
      session.stageLevel >= 2 && 
      session.stageLevel <= 6 &&
      session.pahmCounts
    );

    console.log('🎯 Filtered Sessions for Stage Evolution:', sessions.length);

    if (sessions.length === 0) return null;

    // Group by stage level
    const stageGroups: { [key: string]: any[] } = sessions.reduce((groups, session) => {
      const stage = session.stageLevel!.toString();
      if (!groups[stage]) {
        groups[stage] = [];
      }
      groups[stage].push(session);
      return groups;
    }, {} as { [key: string]: any[] });

    // Stage name mapping
    const stageNameMap: { [key: string]: string } = {
      "2": "PAHM Trainee",
      "3": "PAHM Apprentice", 
      "4": "PAHM Practitioner",
      "5": "PAHM Adept",
      "6": "PAHM Master"
    };

    // Calculate analytics for each stage
    const stageAnalytics = Object.entries(stageGroups).map(([stageLevel, stageSessions]) => {
      const totalPAHM = {
        present_attachment: 0,
        present_neutral: 0,
        present_aversion: 0,
        past_attachment: 0,
        past_neutral: 0,
        past_aversion: 0,
        future_attachment: 0,
        future_neutral: 0,
        future_aversion: 0
      };

      stageSessions.forEach(session => {
        if (session.pahmCounts) {
          Object.keys(totalPAHM).forEach(key => {
            totalPAHM[key as keyof typeof totalPAHM] += session.pahmCounts[key] || 0;
          });
        }
      });

      const totalCounts = Object.values(totalPAHM).reduce((sum, count) => sum + count, 0);
      
      const timeDistribution = {
        present: totalPAHM.present_attachment + totalPAHM.present_neutral + totalPAHM.present_aversion,
        past: totalPAHM.past_attachment + totalPAHM.past_neutral + totalPAHM.past_aversion,
        future: totalPAHM.future_attachment + totalPAHM.future_neutral + totalPAHM.future_aversion
      };

      const presentPercentage = totalCounts > 0 ? Math.round((timeDistribution.present / totalCounts) * 100) : 0;
      const avgRating = stageSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / stageSessions.length;
      const totalDuration = stageSessions.reduce((sum, s) => sum + s.duration, 0);

      const stageName = stageNameMap[stageLevel] || `Stage ${stageLevel}`;

      return {
        stageLevel: parseInt(stageLevel),
        stageName,
        sessionCount: stageSessions.length,
        totalObservations: totalCounts,
        presentPercentage,
        avgRating: Math.round(avgRating * 10) / 10,
        totalDuration,
        avgDuration: Math.round(totalDuration / stageSessions.length),
        totalPAHM,
        timeDistribution,
        lastSession: stageSessions[stageSessions.length - 1].timestamp
      };
    }).sort((a, b) => a.stageLevel - b.stageLevel);

    return stageAnalytics;
  };

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ========================================
  // REAL-TIME INSIGHTS LOGIC - ENHANCED
  // ========================================

  // PROGRESS ANALYSIS - Compares recent vs past performance
  const getProgressAnalysis = () => {
    const sessions = filteredData.practice;
    if (sessions.length < 2) return null;

    // Split sessions into recent and earlier periods
    const recent = sessions.slice(0, Math.floor(sessions.length / 2));
    const earlier = sessions.slice(Math.floor(sessions.length / 2));
    
    // Calculate average duration for each period
    const recentAvgDuration = recent.reduce((sum, s) => sum + s.duration, 0) / recent.length;
    const earlierAvgDuration = earlier.reduce((sum, s) => sum + s.duration, 0) / earlier.length;
    
    // Calculate average rating for each period
    const recentAvgRating = recent.reduce((sum, s) => sum + (s.rating || 0), 0) / recent.length;
    const earlierAvgRating = earlier.reduce((sum, s) => sum + (s.rating || 0), 0) / earlier.length;

    // Calculate percentage changes
    const durationChange = ((recentAvgDuration - earlierAvgDuration) / earlierAvgDuration) * 100;
    const ratingChange = ((recentAvgRating - earlierAvgRating) / earlierAvgRating) * 100;

    return {
      durationChange: Math.round(durationChange),
      ratingChange: Math.round(ratingChange),
      recentAvgDuration: Math.round(recentAvgDuration),
      recentAvgRating: Math.round(recentAvgRating * 10) / 10
    };
  };

  // PERSONALIZED RECOMMENDATIONS - Based on your actual data patterns
  const getPersonalizedRecommendations = () => {
    const usagePatterns = getAppUsagePatterns();
    const recommendations = [];

    // OPTIMAL TIME ANALYSIS - Find when you practice most consistently
    if (usagePatterns.timeOfDayStats) {
      const bestTime = Object.entries(usagePatterns.timeOfDayStats)
        .sort(([,a], [,b]) => (b as number) - (a as number))[0];
      if (bestTime) {
        recommendations.push({
          type: 'timing',
          title: 'Optimal Practice Time',
          message: `You're most consistent with ${bestTime[0]} sessions. Consider scheduling regular practice then.`,
          icon: '🌅'
        });
      }
    }

    // STREAK BUILDING LOGIC - Based on your current streak
    if ((analyticsData?.currentStreak || 0) < 7) {
      const daysToWeekly = 7 - (analyticsData?.currentStreak || 0);
      recommendations.push({
        type: 'consistency',
        title: 'Build Your Streak',
        message: `You're ${daysToWeekly} days away from a weekly streak! Set a daily reminder.`,
        icon: '🔥'
      });
    } else if ((analyticsData?.currentStreak || 0) >= 7 && (analyticsData?.currentStreak || 0) < 30) {
      const daysToMonthly = 30 - (analyticsData?.currentStreak || 0);
      recommendations.push({
        type: 'consistency',
        title: 'Reach Monthly Milestone',
        message: `Amazing ${analyticsData?.currentStreak || 0}-day streak! ${daysToMonthly} more days to reach 30 days.`,
        icon: '🏆'
      });
    }

    // PRESENT MOMENT AWARENESS - Based on PAHM data
    if (pahmData && typeof pahmData.presentPercentage === 'number' && pahmData.presentPercentage < 60) {
      recommendations.push({
        type: 'mindfulness',
        title: 'Present Moment Focus',
        message: 'Try shorter sessions with more PAHM tracking to build present-moment awareness.',
        icon: '🎯'
      });
    } else if (pahmData && typeof pahmData.presentPercentage === 'number' && pahmData.presentPercentage >= 80) {
      recommendations.push({
        type: 'mindfulness',
        title: 'Mindfulness Mastery',
        message: `Excellent ${pahmData.presentPercentage}% present awareness! Consider teaching others.`,
        icon: '🧘'
      });
    }

    // SESSION DURATION OPTIMIZATION - Based on average length
    const avgDuration = analyticsData?.averageSessionLength || 0;
    if (avgDuration < 10) {
      recommendations.push({
        type: 'duration',
        title: 'Extend Your Practice',
        message: 'Gradually increase session length by 2-3 minutes for deeper benefits.',
        icon: '⏰'
      });
    } else if (avgDuration > 45) {
      recommendations.push({
        type: 'duration',
        title: 'Balance Your Practice',
        message: 'Your long sessions are impressive! Try some shorter Mind Recovery sessions too.',
        icon: '⚖️'
      });
    }

    // EMOTIONAL AWARENESS - Based on notes frequency
    const notesPerSession = (analyticsData?.emotionalNotesCount || 0) / (analyticsData?.totalSessions || 1);
    if (notesPerSession < 0.3) {
      recommendations.push({
        type: 'reflection',
        title: 'Boost Self-Reflection',
        message: 'Try adding emotional notes after sessions to deepen your practice insights.',
        icon: '💝'
      });
    }

    return recommendations.slice(0, 4);
  };

  // PATTERN INSIGHTS - Automatic recognition of achievements and trends
  const getPatternInsights = () => {
    const insights = [];
    
    // CONSISTENCY ACHIEVEMENTS
    if (analyticsData?.currentStreak >= 30) {
      insights.push({
        type: 'positive',
        title: 'Meditation Master',
        message: `${analyticsData.currentStreak}-day streak shows exceptional dedication to your practice.`,
        icon: '🏆'
      });
    } else if (analyticsData?.currentStreak >= 14) {
      insights.push({
        type: 'positive',
        title: 'Strong Consistency',
        message: `${analyticsData.currentStreak}-day streak shows great commitment to your practice.`,
        icon: '🔥'
      });
    } else if (analyticsData?.currentStreak >= 7) {
      insights.push({
        type: 'positive',
        title: 'Weekly Achievement',
        message: `${analyticsData.currentStreak}-day streak! You've built a solid meditation habit.`,
        icon: '⭐'
      });
    }

    // QUALITY IMPROVEMENT DETECTION
    const progressAnalysis = getProgressAnalysis();
    if (progressAnalysis && typeof progressAnalysis.ratingChange === 'number' && progressAnalysis.ratingChange > 15) {
      insights.push({
        type: 'positive',
        title: 'Remarkable Improvement',
        message: `Your session ratings improved by ${progressAnalysis.ratingChange}% recently. Outstanding progress!`,
        icon: '📈'
      });
    } else if (progressAnalysis && typeof progressAnalysis.ratingChange === 'number' && progressAnalysis.ratingChange > 5) {
      insights.push({
        type: 'positive',
        title: 'Quality Improvement',
        message: `Your session ratings improved by ${progressAnalysis.ratingChange}% recently.`,
        icon: '📊'
      });
    }

    // DURATION PROGRESS
    if (progressAnalysis && typeof progressAnalysis.durationChange === 'number' && progressAnalysis.durationChange > 20) {
      insights.push({
        type: 'positive',
        title: 'Extended Practice',
        message: `Your session length increased by ${progressAnalysis.durationChange}% - great dedication!`,
        icon: '⏱️'
      });
    }

    // MIND RECOVERY INTEGRATION
    const mindRecoveryPercentage = Math.round(((analyticsData?.totalMindRecoverySessions || 0) / (analyticsData?.totalSessions || 1)) * 100);
    if (mindRecoveryPercentage > 40) {
      insights.push({
        type: 'positive',
        title: 'Excellent Integration',
        message: `${mindRecoveryPercentage}% Mind Recovery shows outstanding mindfulness integration into daily life.`,
        icon: '🕐'
      });
    } else if (mindRecoveryPercentage > 20) {
      insights.push({
        type: 'neutral',
        title: 'Balanced Practice Mix',
        message: `${mindRecoveryPercentage}% Mind Recovery shows good integration of mindfulness into daily life.`,
        icon: '⚖️'
      });
    }

    // EMOTIONAL INTELLIGENCE
    if ((analyticsData?.emotionalNotesCount || 0) > 50) {
      insights.push({
        type: 'positive',
        title: 'Exceptional Self-Awareness',
        message: `${analyticsData?.emotionalNotesCount} emotional notes demonstrate exceptional introspection habits.`,
        icon: '💝'
      });
    } else if ((analyticsData?.emotionalNotesCount || 0) > 20) {
      insights.push({
        type: 'positive',
        title: 'Strong Self-Awareness',
        message: `${analyticsData?.emotionalNotesCount} emotional notes demonstrate excellent introspection habits.`,
        icon: '💭'
      });
    }

    // PAHM MASTERY LEVELS
    if (pahmData && typeof pahmData.presentPercentage === 'number' && pahmData.presentPercentage >= 85) {
      insights.push({
        type: 'positive',
        title: 'Mindfulness Expert',
        message: `${pahmData.presentPercentage}% present awareness indicates advanced mindfulness mastery.`,
        icon: '🧠'
      });
    } else if (pahmData && typeof pahmData.presentPercentage === 'number' && pahmData.presentPercentage >= 70) {
      insights.push({
        type: 'positive',
        title: 'Excellent Awareness',
        message: `${pahmData.presentPercentage}% present awareness shows strong mindfulness development.`,
        icon: '🎯'
      });
    }

    return insights;
  };

  // ========================================
  // CHART COMPONENTS
  // ========================================

  // Enhanced Bar Chart Component
  const EnhancedBarChart: React.FC<{
    data: any[];
    valueKey: string;
    labelKey: string;
    colorKey?: string;
    title?: string;
  }> = ({ data, valueKey, labelKey, colorKey, title }) => {
    if (data.length === 0) {
      return (
        <div className="chart-empty">
          <div className="chart-empty-icon">📊</div>
          <div className="chart-empty-text">No data available</div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item[valueKey]));

    return (
      <div className="enhanced-bar-chart">
        {title && <h4 className="chart-title">{title}</h4>}
        <div className="bar-chart-container">
          {data.map((item, index) => (
            <div key={index} className="bar-chart-item">
              <div className="bar-label">{item[labelKey]}</div>
              <div className="bar-track">
                <div 
                  className="bar-fill"
                  style={{ 
                    width: `${(item[valueKey] / maxValue) * 100}%`,
                    background: colorKey ? item[colorKey] : undefined
                  }}
                />
              </div>
              <div className="bar-value">{item[valueKey]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced Line Chart Component
  const EnhancedLineChart: React.FC<{
    data: { date: string; duration: number }[];
    title?: string;
  }> = ({ data, title }) => {
    if (data.length === 0) {
      return (
        <div className="chart-empty">
          <div className="chart-empty-icon">📈</div>
          <div className="chart-empty-text">No practice data available</div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map(item => item.duration));
    const minValue = Math.min(...data.map(item => item.duration));

    return (
      <div className="enhanced-line-chart">
        {title && <h4 className="chart-title">{title}</h4>}
        <div className="line-chart-container">
          <svg width="100%" height="200" className="line-chart-svg">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>
            <polyline
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={data.map((item, index) => {
                const x = (index / (data.length - 1)) * 100;
                const y = 100 - ((item.duration - minValue) / (maxValue - minValue)) * 80;
                return `${x}%,${y}%`;
              }).join(' ')}
            />
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.duration - minValue) / (maxValue - minValue)) * 80;
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#4facfe"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="chart-stats">
            <span>Min: {minValue}min</span>
            <span>Max: {maxValue}min</span>
          </div>
        </div>
      </div>
    );
  };

  // PAHM Matrix Chart Component
  const PAHMMatrixChart: React.FC<{ insights: any }> = ({ insights }) => {
    if (!insights) return null;

    return (
      <div className="pahm-matrix-chart">
        <h4 className="chart-title">🧠 9-Category PAHM Matrix</h4>
        
        <div className="pahm-matrix-table">
          <table>
            <thead>
              <tr>
                <th>Time/Emotion</th>
                <th>Attachment</th>
                <th>Neutral</th>
                <th>Aversion</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="time-label present">Present</td>
                <td className="pahm-value present-attachment">{insights.totalPAHM.present_attachment}</td>
                <td className="pahm-value present-neutral">{insights.totalPAHM.present_neutral}</td>
                <td className="pahm-value present-aversion">{insights.totalPAHM.present_aversion}</td>
              </tr>
              <tr>
                <td className="time-label past">Past</td>
                <td className="pahm-value past-attachment">{insights.totalPAHM.past_attachment}</td>
                <td className="pahm-value past-neutral">{insights.totalPAHM.past_neutral}</td>
                <td className="pahm-value past-aversion">{insights.totalPAHM.past_aversion}</td>
              </tr>
              <tr>
                <td className="time-label future">Future</td>
                <td className="pahm-value future-attachment">{insights.totalPAHM.future_attachment}</td>
                <td className="pahm-value future-neutral">{insights.totalPAHM.future_neutral}</td>
                <td className="pahm-value future-aversion">{insights.totalPAHM.future_aversion}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pahm-summary">
          <div className="pahm-stat present-stat">
            <div className="stat-value">{insights.presentPercentage}%</div>
            <div className="stat-label">Present Moment</div>
          </div>
          <div className="pahm-stat neutral-stat">
            <div className="stat-value">{insights.neutralPercentage}%</div>
            <div className="stat-label">Neutral States</div>
          </div>
          <div className="pahm-stat total-stat">
            <div className="stat-value">{insights.totalObservations}</div>
            <div className="stat-label">Total Observations</div>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // TAB RENDER FUNCTIONS
  // ========================================

  // NEW: Enhanced Insights Tab Content with Real-Time Analytics
  const renderInsightsTab = () => {
    const progressAnalysis = getProgressAnalysis();
    const recommendations = getPersonalizedRecommendations();
    const patterns = getPatternInsights();

    return (
      <div className="insights-tab" key={refreshTrigger}>
        {/* Progress Overview */}
        <div className="insights-hero">
          <h3>💡 Your Practice Insights</h3>
          <p className="insights-subtitle">
            Personalized analysis based on your {timeRange} meditation data
          </p>
        </div>

        {/* Progress Analysis */}
        {progressAnalysis && (
          <div className="progress-analysis">
            <h4>📈 Progress Trends</h4>
            <div className="progress-grid">
              <div className="progress-card">
                <div className="progress-icon">⏱️</div>
                <div className="progress-content">
                  <div className="progress-value">
                    {progressAnalysis.durationChange > 0 ? '+' : ''}{progressAnalysis.durationChange}%
                  </div>
                  <div className="progress-label">Session Duration Change</div>
                  <div className="progress-insight">
                    Average {progressAnalysis.recentAvgDuration} minutes recently
                  </div>
                </div>
              </div>
              
              <div className="progress-card">
                <div className="progress-icon">⭐</div>
                <div className="progress-content">
                  <div className="progress-value">
                    {progressAnalysis.ratingChange > 0 ? '+' : ''}{progressAnalysis.ratingChange}%
                  </div>
                  <div className="progress-label">Quality Improvement</div>
                  <div className="progress-insight">
                    Average {progressAnalysis.recentAvgRating}/10 rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pattern Insights */}
        <div className="pattern-insights">
          <h4>🔍 What We've Noticed</h4>
          <div className="insights-grid">
            {patterns.map((insight, index) => (
              <div key={index} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">{insight.icon}</div>
                <h5>{insight.title}</h5>
                <p>{insight.message}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="recommendations">
          <h4>🎯 Personalized Recommendations</h4>
          <div className="recommendations-grid">
            {recommendations.map((rec, index) => (
              <div key={index} className="recommendation-card">
                <div className="recommendation-header">
                  <span className="recommendation-icon">{rec.icon}</span>
                  <h5>{rec.title}</h5>
                </div>
                <p>{rec.message}</p>
                <div className="recommendation-type">{rec.type}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Statistics Summary */}
        <div className="insights-summary">
          <h4>📊 Key Statistics Summary</h4>
          <div className="summary-grid">
            <div className="summary-stat">
              <div className="summary-value">{analyticsData?.totalSessions || 0}</div>
              <div className="summary-label">Total Sessions</div>
              <div className="summary-change">
                {analyticsData?.totalMeditationSessions || 0} meditation + {analyticsData?.totalMindRecoverySessions || 0} recovery
              </div>
            </div>
            
            <div className="summary-stat">
              <div className="summary-value">{Math.round((analyticsData?.totalPracticeTime || 0) / 60)}h</div>
              <div className="summary-label">Practice Hours</div>
              <div className="summary-change">
                {analyticsData?.averageSessionLength || 0}min average
              </div>
            </div>
            
            <div className="summary-stat">
              <div className="summary-value">{analyticsData?.currentStreak || 0}</div>
              <div className="summary-label">Current Streak</div>
              <div className="summary-change">
                Best: {analyticsData?.longestStreak || 0} days
              </div>
            </div>
            
            {pahmData && (
              <div className="summary-stat">
                <div className="summary-value">{pahmData.presentPercentage}%</div>
                <div className="summary-label">Present Awareness</div>
                <div className="summary-change">
                  {pahmData.neutralPercentage}% neutral states
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="next-steps">
          <h4>🚀 Suggested Next Steps</h4>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <h5>Continue Your Momentum</h5>
                <p>You're on a {analyticsData?.currentStreak || 0}-day streak. Maintain consistency with daily practice.</p>
              </div>
            </div>
            
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <h5>Explore Mind Recovery</h5>
                <p>Try more contextual sessions to integrate mindfulness throughout your day.</p>
              </div>
            </div>
            
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <h5>Track Environmental Factors</h5>
                <p>Experiment with different postures, locations, and times to optimize your practice.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Overview Tab Content (simplified - insights moved to separate tab)
  const renderOverviewTab = () => (
    <div className="overview-tab" key={refreshTrigger}>
      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card total-sessions">
          <div className="metric-icon">🧘</div>
          <div className="metric-value">{analyticsData?.totalSessions || 0}</div>
          <div className="metric-label">Total Sessions</div>
          <div className="metric-insight">
            {analyticsData?.totalMeditationSessions || 0} meditation + {analyticsData?.totalMindRecoverySessions || 0} recovery
          </div>
        </div>

        <div className="metric-card practice-hours">
          <div className="metric-icon">⏰</div>
          <div className="metric-value">{Math.round((analyticsData?.totalPracticeTime || 0) / 60)}</div>
          <div className="metric-label">Practice Hours</div>
          <div className="metric-insight">{analyticsData?.averageSessionLength || 0}min avg</div>
        </div>

        <div className="metric-card current-streak">
          <div className="metric-icon">🔥</div>
          <div className="metric-value">{analyticsData?.currentStreak || 0}</div>
          <div className="metric-label">Day Streak</div>
          <div className="metric-insight">Best: {analyticsData?.longestStreak || 0} days</div>
        </div>

        <div className="metric-card mind-recovery">
          <div className="metric-icon">🕐</div>
          <div className="metric-value">{analyticsData?.totalMindRecoverySessions || 0}</div>
          <div className="metric-label">Mind Recovery</div>
          <div className="metric-insight">Quick mindful resets</div>
        </div>

        <div className="metric-card emotional-notes">
          <div className="metric-icon">💝</div>
          <div className="metric-value">{analyticsData?.emotionalNotesCount || 0}</div>
          <div className="metric-label">Emotional Notes</div>
          <div className="metric-insight">Self-reflection entries</div>
        </div>

        {pahmData && (
          <div className="metric-card pahm-insight">
            <div className="metric-icon">🧠</div>
            <div className="metric-value">{pahmData.presentPercentage}%</div>
            <div className="metric-label">Present Attention</div>
            <div className="metric-insight">Quality: {analyticsData?.averageQuality || 0}/10</div>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <EnhancedLineChart 
          data={filteredData.practiceDuration} 
          title="📈 Practice Duration Trend"
        />
        <EnhancedBarChart 
          data={filteredData.emotionDistribution} 
          valueKey="count" 
          labelKey="emotion"
          colorKey="color"
          title="😊 Emotional Distribution"
        />
        {pahmData && (
          <div className="chart-full-width">
            <PAHMMatrixChart insights={pahmData} />
          </div>
        )}
      </div>

      {/* Recent Sessions */}
      <div className="recent-sessions">
        <h3>📊 Recent Sessions</h3>
        <div className="sessions-list">
          {filteredData.practice.slice(0, 5).map(session => (
            <div key={session.sessionId} className="session-card">
              <div className="session-header">
                <div className="session-info">
                  <h4>{session.stageLabel || session.mindRecoveryContext || 'Practice Session'}</h4>
                  <div className="session-meta">
                    {formatDate(session.timestamp)} • {session.duration} minutes
                  </div>
                </div>
                <div className="session-badges">
                  {session.presentPercentage && (
                    <span className="badge present-badge">
                      {session.presentPercentage}% present
                    </span>
                  )}
                  <span className={`badge rating-badge ${
                    session.rating && session.rating >= 8 ? 'rating-high' : 
                    session.rating && session.rating >= 6 ? 'rating-medium' : 'rating-low'
                  }`}>
                    ⭐ {session.rating}/10
                  </span>
                </div>
              </div>
              {session.notes && (
                <p className="session-notes">
                  {session.notes.length > 150 ? session.notes.substring(0, 150) + '...' : session.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ✅ ENHANCED PAHM Tab Content with Stage Evolution Analytics
  const renderPAHMTab = () => {
    const stageSpecificData = getStageSpecificPAHMData();
    
    // Debug: Log the stage data to see what we're getting
    console.log('🧠 PAHM Tab Debug:', {
      stageSpecificData,
      hasData: stageSpecificData && stageSpecificData.length > 0,
      filteredPractice: filteredData.practice.slice(0, 3) // Show first 3 sessions for debugging
    });

    // Enhanced Evolution Analytics
    const getStageEvolutionAnalytics = () => {
      if (!stageSpecificData || stageSpecificData.length === 0) {
        console.log('❌ No stage evolution data available');
        return null;
      }
      
      // Calculate evolution metrics
      const evolution = {
        presentAwarenessProgression: stageSpecificData.map(stage => ({
          stage: stage.stageLevel,
          stageName: stage.stageName,
          percentage: stage.presentPercentage,
          sessions: stage.sessionCount
        })),
        qualityProgression: stageSpecificData.map(stage => ({
          stage: stage.stageLevel,
          stageName: stage.stageName,
          quality: stage.avgRating,
          sessions: stage.sessionCount
        })),
        observationEvolution: stageSpecificData.map(stage => ({
          stage: stage.stageLevel,
          stageName: stage.stageName,
          totalObservations: stage.totalObservations,
          observationsPerSession: Math.round(stage.totalObservations / stage.sessionCount)
        })),
        durationEvolution: stageSpecificData.map(stage => ({
          stage: stage.stageLevel,
          stageName: stage.stageName,
          avgDuration: stage.avgDuration,
          totalDuration: stage.totalDuration
        }))
      };

      // Calculate improvement rates
      const improvementRates = {
        presentAwareness: evolution.presentAwarenessProgression.length > 1 ? 
          evolution.presentAwarenessProgression[evolution.presentAwarenessProgression.length - 1].percentage - 
          evolution.presentAwarenessProgression[0].percentage : 0,
        qualityImprovement: evolution.qualityProgression.length > 1 ?
          evolution.qualityProgression[evolution.qualityProgression.length - 1].quality -
          evolution.qualityProgression[0].quality : 0
      };

      return { evolution, improvementRates };
    };

    const evolutionData = getStageEvolutionAnalytics();

    // Get individual stage data
    const getIndividualStageData = (stageLevel: number) => {
      return stageSpecificData?.find(stage => stage.stageLevel === stageLevel) || null;
    };

    // Render individual stage tab content
    const renderStageTab = (stageLevel: number, stageName: string) => {
      const stageData = getIndividualStageData(stageLevel);
      
      if (!stageData) {
        return (
          <div className="stage-tab-content">
            <div className="stage-no-data">
              <div className="stage-no-data-icon">🧘</div>
              <h4>No {stageName} Data Yet</h4>
              <p>Complete meditation sessions in Stage {stageLevel} with PAHM tracking to see detailed analytics for this stage.</p>
              <div className="stage-preview">
                <h5>What you'll see once you practice Stage {stageLevel}:</h5>
                <ul>
                  <li>📊 Present-moment awareness percentage</li>
                  <li>⭐ Session quality ratings</li>
                  <li>👁️ Total PAHM observations</li>
                  <li>🎯 9-category emotion distribution</li>
                  <li>📈 Progress over time</li>
                </ul>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="stage-tab-content">
          <div className="stage-overview-card">
            <div className="stage-card-header">
              <div className="stage-number">Stage {stageData.stageLevel}</div>
              <div className="stage-title">{stageData.stageName}</div>
            </div>
            
            <div className="stage-key-metrics">
              <div className="key-metric">
                <div className="metric-icon">🎯</div>
                <div className="metric-value">{stageData.presentPercentage}%</div>
                <div className="metric-label">Present Awareness</div>
              </div>
              <div className="key-metric">
                <div className="metric-icon">⭐</div>
                <div className="metric-value">{stageData.avgRating}</div>
                <div className="metric-label">Avg Quality</div>
              </div>
              <div className="key-metric">
                <div className="metric-icon">🧘</div>
                <div className="metric-value">{stageData.sessionCount}</div>
                <div className="metric-label">Sessions</div>
              </div>
              <div className="key-metric">
                <div className="metric-icon">👁️</div>
                <div className="metric-value">{stageData.totalObservations}</div>
                <div className="metric-label">Observations</div>
              </div>
            </div>

            <div className="stage-progress-bar">
              <div className="progress-label">Present Moment Mastery</div>
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${stageData.presentPercentage}%`,
                    background: stageData.presentPercentage >= 80 ? 
                      'linear-gradient(90deg, #27ae60, #2ecc71)' :
                      stageData.presentPercentage >= 65 ?
                      'linear-gradient(90deg, #f39c12, #e67e22)' :
                      'linear-gradient(90deg, #3498db, #2980b9)'
                  }}
                ></div>
              </div>
              <div className="mastery-level">
                {stageData.presentPercentage >= 80 && <span className="level master">🏆 Master Level</span>}
                {stageData.presentPercentage >= 65 && stageData.presentPercentage < 80 && <span className="level advanced">⭐ Advanced</span>}
                {stageData.presentPercentage >= 50 && stageData.presentPercentage < 65 && <span className="level developing">🌱 Developing</span>}
                {stageData.presentPercentage < 50 && <span className="level beginning">🌱 Beginning</span>}
              </div>
            </div>
          </div>

          <div className="stage-detailed-analytics">
            <div className="stage-pahm-breakdown">
              <h4>🧠 9-Category PAHM Breakdown</h4>
              <div className="pahm-grid">
                <div className="pahm-time-section">
                  <h5>Present Moment</h5>
                  <div className="pahm-emotions">
                    <div className="emotion-item attachment">
                      <span className="emotion-label">Attachment</span>
                      <span className="emotion-value">{stageData.totalPAHM.present_attachment}</span>
                    </div>
                    <div className="emotion-item neutral">
                      <span className="emotion-label">Neutral</span>
                      <span className="emotion-value">{stageData.totalPAHM.present_neutral}</span>
                    </div>
                    <div className="emotion-item aversion">
                      <span className="emotion-label">Aversion</span>
                      <span className="emotion-value">{stageData.totalPAHM.present_aversion}</span>
                    </div>
                  </div>
                  <div className="time-total">Total: {stageData.timeDistribution.present}</div>
                </div>

                <div className="pahm-time-section">
                  <h5>Past</h5>
                  <div className="pahm-emotions">
                    <div className="emotion-item attachment">
                      <span className="emotion-label">Attachment</span>
                      <span className="emotion-value">{stageData.totalPAHM.past_attachment}</span>
                    </div>
                    <div className="emotion-item neutral">
                      <span className="emotion-label">Neutral</span>
                      <span className="emotion-value">{stageData.totalPAHM.past_neutral}</span>
                    </div>
                    <div className="emotion-item aversion">
                      <span className="emotion-label">Aversion</span>
                      <span className="emotion-value">{stageData.totalPAHM.past_aversion}</span>
                    </div>
                  </div>
                  <div className="time-total">Total: {stageData.timeDistribution.past}</div>
                </div>

                <div className="pahm-time-section">
                  <h5>Future</h5>
                  <div className="pahm-emotions">
                    <div className="emotion-item attachment">
                      <span className="emotion-label">Attachment</span>
                      <span className="emotion-value">{stageData.totalPAHM.future_attachment}</span>
                    </div>
                    <div className="emotion-item neutral">
                      <span className="emotion-label">Neutral</span>
                      <span className="emotion-value">{stageData.totalPAHM.future_neutral}</span>
                    </div>
                    <div className="emotion-item aversion">
                      <span className="emotion-label">Aversion</span>
                      <span className="emotion-value">{stageData.totalPAHM.future_aversion}</span>
                    </div>
                  </div>
                  <div className="time-total">Total: {stageData.timeDistribution.future}</div>
                </div>
              </div>
            </div>

            <div className="stage-insights">
              <h4>💡 Stage {stageLevel} Insights</h4>
              <div className="insights-grid">
                <div className="insight-item">
                  <h5>🎯 Attention Quality</h5>
                  <p>
                    Your present-moment awareness in Stage {stageLevel} is {stageData.presentPercentage}%.
                    {stageData.presentPercentage >= 70 && " Excellent mindfulness development!"}
                    {stageData.presentPercentage >= 50 && stageData.presentPercentage < 70 && " Good progress in attention training."}
                    {stageData.presentPercentage < 50 && " Focus on building stronger present-moment awareness."}
                  </p>
                </div>
                <div className="insight-item">
                  <h5>📊 Session Consistency</h5>
                  <p>
                    You've completed {stageData.sessionCount} sessions with an average rating of {stageData.avgRating}/10.
                    {stageData.avgRating >= 8 && " Outstanding session quality!"}
                    {stageData.avgRating >= 6 && stageData.avgRating < 8 && " Good meditation experience."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    return (
      <div className="pahm-tab enhanced-pahm-tab" key={refreshTrigger}>
        {/* PAHM Sub-Tabs */}
        <div className="pahm-sub-tabs">
          <div className="sub-tab-buttons">
            <button 
              className={`sub-tab-button ${activePAHMTab === 'overall' ? 'active' : ''}`}
              onClick={() => setActivePAHMTab('overall')}
            >
              📊 Overall Analysis
            </button>
            <button 
              className={`sub-tab-button ${activePAHMTab === 'stage2' ? 'active' : ''}`}
              onClick={() => setActivePAHMTab('stage2')}
            >
              2️⃣ PAHM Trainee
            </button>
            <button 
              className={`sub-tab-button ${activePAHMTab === 'stage3' ? 'active' : ''}`}
              onClick={() => setActivePAHMTab('stage3')}
            >
              3️⃣ PAHM Apprentice
            </button>
            <button 
              className={`sub-tab-button ${activePAHMTab === 'stage4' ? 'active' : ''}`}
              onClick={() => setActivePAHMTab('stage4')}
            >
              4️⃣ PAHM Practitioner
            </button>
            <button 
              className={`sub-tab-button ${activePAHMTab === 'stage5' ? 'active' : ''}`}
              onClick={() => setActivePAHMTab('stage5')}
            >
              5️⃣ PAHM Adept
            </button>
            <button 
              className={`sub-tab-button ${activePAHMTab === 'stage6' ? 'active' : ''}`}
              onClick={() => setActivePAHMTab('stage6')}
            >
              6️⃣ PAHM Master
            </button>
            {stageSpecificData && stageSpecificData.length > 1 && (
              <button 
                className={`sub-tab-button ${activePAHMTab === 'evolution' ? 'active' : ''}`}
                onClick={() => setActivePAHMTab('evolution')}
              >
                📈 Evolution
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Content */}
        <div className="pahm-sub-content">
          {activePAHMTab === 'overall' && (
            <div>
              {pahmData ? (
                <div className="overall-pahm-section">
                  <h3>🧠 Overall 9-Category PAHM Matrix Analysis</h3>
                  <PAHMMatrixChart insights={pahmData} />
                  
                  <div className="pahm-insights">
                    <h4>💡 PAHM Evolution Insights</h4>
                    <div className="insights-grid">
                      <div className="insight-card">
                        <h5>🎯 Present Moment Mastery</h5>
                        <p>
                          Overall {pahmData.presentPercentage}% present-moment awareness across {pahmData.sessionsAnalyzed} sessions.
                          {evolutionData && evolutionData.improvementRates.presentAwareness > 0 && 
                            ` You've improved by ${Math.round(evolutionData.improvementRates.presentAwareness)}% from your first to latest stage!`}
                        </p>
                      </div>
                      <div className="insight-card">
                        <h5>⚖️ Emotional Equanimity</h5>
                        <p>
                          {pahmData.neutralPercentage}% neutral emotional states indicating balanced equanimity development.
                          {pahmData.neutralPercentage >= 40 && " Excellent emotional balance across your practice evolution!"}
                        </p>
                      </div>
                      {stageSpecificData && stageSpecificData.length > 1 && (
                        <div className="insight-card">
                          <h5>📈 Stage Progression</h5>
                          <p>
                            You've practiced {stageSpecificData.length} different stages, showing commitment to comprehensive development.
                            {stageSpecificData.some(s => s.presentPercentage >= 80) && 
                              " You've achieved mastery level in some stages!"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">🧠</div>
                  <h3>No Overall PAHM Data Yet</h3>
                  <p>Complete meditation sessions with PAHM tracking to see your overall analysis.</p>
                </div>
              )}
            </div>
          )}

          {activePAHMTab === 'stage2' && renderStageTab(2, 'PAHM Trainee')}
          {activePAHMTab === 'stage3' && renderStageTab(3, 'PAHM Apprentice')}
          {activePAHMTab === 'stage4' && renderStageTab(4, 'PAHM Practitioner')}
          {activePAHMTab === 'stage5' && renderStageTab(5, 'PAHM Adept')}
          {activePAHMTab === 'stage6' && renderStageTab(6, 'PAHM Master')}

          {activePAHMTab === 'evolution' && evolutionData && (
            <div>
              {/* Stage Evolution Overview */}
              <div className="stage-evolution-overview">
                <h3>🎯 PAHM Mastery Evolution Across Stages</h3>
                <div className="evolution-summary">
                  <div className="evolution-highlight">
                    <div className="highlight-icon">📈</div>
                    <div className="highlight-content">
                      <div className="highlight-value">
                        {evolutionData.improvementRates.presentAwareness > 0 ? '+' : ''}
                        {Math.round(evolutionData.improvementRates.presentAwareness)}%
                      </div>
                      <div className="highlight-label">Present Awareness Growth</div>
                    </div>
                  </div>
                  <div className="evolution-highlight">
                    <div className="highlight-icon">⭐</div>
                    <div className="highlight-content">
                      <div className="highlight-value">
                        {evolutionData.improvementRates.qualityImprovement > 0 ? '+' : ''}
                        {evolutionData.improvementRates.qualityImprovement.toFixed(1)}
                      </div>
                      <div className="highlight-label">Quality Improvement</div>
                    </div>
                  </div>
                  <div className="evolution-highlight">
                    <div className="highlight-icon">🧘</div>
                    <div className="highlight-content">
                      <div className="highlight-value">{stageSpecificData?.length || 0}</div>
                      <div className="highlight-label">Stages Practiced</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Present Moment Mastery Evolution Chart */}
              <div className="present-mastery-evolution">
                <h4>🎯 Present Moment Mastery Evolution</h4>
                <div className="evolution-chart">
                  <div className="chart-container">
                    {evolutionData.evolution.presentAwarenessProgression.map((stage, index) => (
                      <div key={stage.stage} className="evolution-bar-item">
                        <div className="stage-info">
                          <div className="stage-number">Stage {stage.stage}</div>
                          <div className="stage-name">{stage.stageName}</div>
                          <div className="stage-sessions">{stage.sessions} sessions</div>
                        </div>
                        <div className="evolution-bar-track">
                          <div 
                            className={`evolution-bar-fill ${
                              stage.percentage >= 80 ? 'mastery' : 
                              stage.percentage >= 65 ? 'advanced' : 
                              stage.percentage >= 50 ? 'developing' : 'beginning'
                            }`}
                            style={{ width: `${stage.percentage}%` }}
                          >
                            <span className="bar-percentage">{stage.percentage}%</span>
                          </div>
                        </div>
                        <div className="mastery-indicator">
                          {stage.percentage >= 80 && <span className="mastery-badge master">🏆 Master</span>}
                          {stage.percentage >= 65 && stage.percentage < 80 && <span className="mastery-badge advanced">⭐ Advanced</span>}
                          {stage.percentage >= 50 && stage.percentage < 65 && <span className="mastery-badge developing">🌱 Developing</span>}
                          {stage.percentage < 50 && <span className="mastery-badge beginning">🌱 Beginning</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Environment Tab Content
  const renderEnvironmentTab = () => (
    <div className="environment-tab" key={refreshTrigger}>
      {environmentData && environmentData.posture.length > 0 ? (
        <>
          <h3>🌿 Environmental Factors Analysis</h3>
          <div className="environment-grid">
            <div className="environment-section">
              <h5>🧘 Posture Performance</h5>
              <div className="environment-list">
                {environmentData.posture.map((item, index) => (
                  <div key={index} className="environment-item">
                    <span className="env-name">{item.name}</span>
                    <div className="env-stats">
                      <span className="env-count">{item.count} sessions</span>
                      <span className={`env-rating ${item.avgRating >= 8 ? 'high' : item.avgRating >= 6 ? 'medium' : 'low'}`}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="environment-section">
              <h5>📍 Location Impact</h5>
              <div className="environment-list">
                {environmentData.location.map((item, index) => (
                  <div key={index} className="environment-item">
                    <span className="env-name">{item.name}</span>
                    <div className="env-stats">
                      <span className="env-count">{item.count} sessions</span>
                      <span className={`env-rating ${item.avgRating >= 8 ? 'high' : item.avgRating >= 6 ? 'medium' : 'low'}`}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="environment-section">
              <h5>💡 Lighting Effects</h5>
              <div className="environment-list">
                {environmentData.lighting.map((item, index) => (
                  <div key={index} className="environment-item">
                    <span className="env-name">{item.name}</span>
                    <div className="env-stats">
                      <span className="env-count">{item.count} sessions</span>
                      <span className={`env-rating ${item.avgRating >= 8 ? 'high' : item.avgRating >= 6 ? 'medium' : 'low'}`}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="environment-section">
              <h5>🔊 Sound Environment</h5>
              <div className="environment-list">
                {environmentData.sounds.map((item, index) => (
                  <div key={index} className="environment-item">
                    <span className="env-name">{item.name}</span>
                    <div className="env-stats">
                      <span className="env-count">{item.count} sessions</span>
                      <span className={`env-rating ${item.avgRating >= 8 ? 'high' : item.avgRating >= 6 ? 'medium' : 'low'}`}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🌿</div>
          <h3>No Environment Data Yet</h3>
          <p>Complete practice sessions with environment tracking to see your environmental analysis.</p>
        </div>
      )}
    </div>
  );

  // Mind Recovery Tab Content
  const renderMindRecoveryTab = () => {
    const mindRecoveryInsights = getMindRecoveryInsights();
    
    return (
      <div className="mind-recovery-tab" key={refreshTrigger}>
        {mindRecoveryInsights.totalSessions > 0 ? (
          <>
            <h3>🕐 Mind Recovery Analytics</h3>
            
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-icon">🕐</div>
                <div className="metric-value">{mindRecoveryInsights.totalSessions}</div>
                <div className="metric-label">Total Sessions</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-value">{mindRecoveryInsights.totalMinutes}min</div>
                <div className="metric-label">Total Time</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">⭐</div>
                <div className="metric-value">{mindRecoveryInsights.averageRating}</div>
                <div className="metric-label">Avg Rating</div>
              </div>
              <div className="metric-card">
                <div className="metric-icon">📊</div>
                <div className="metric-value">{mindRecoveryInsights.averageDuration}min</div>
                <div className="metric-label">Avg Duration</div>
              </div>
            </div>

            <div className="techniques-analysis">
              <h4>🎯 Mind Recovery Techniques</h4>
              <div className="techniques-list">
                {mindRecoveryInsights.techniques.map((technique: any, index: number) => (
                  <div key={index} className="technique-card">
                    <div className="technique-header">
                      <h5>{technique.name}</h5>
                      <div className="technique-badges">
                        <span className="badge count-badge">{technique.count} sessions</span>
                        <span className={`badge rating-badge ${technique.avgRating >= 8 ? 'high' : technique.avgRating >= 6 ? 'medium' : 'low'}`}>
                          ⭐ {technique.avgRating}/10
                        </span>
                        <span className="badge duration-badge">{technique.avgDuration}min avg</span>
                      </div>
                    </div>
                    <div className="technique-details">
                      Total time: {technique.totalDuration} minutes
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🕐</div>
            <h3>No Mind Recovery Data Yet</h3>
            <p>Complete Mind Recovery sessions to see your contextual mindfulness analytics.</p>
          </div>
        )}
      </div>
    );
  };

  // Emotional Tab Content
  const renderEmotionalTab = () => (
    <div className="emotional-tab" key={refreshTrigger}>
      <h3>😊 Emotional Distribution</h3>
      
      <div className="emotion-chart-container">
        <EnhancedBarChart 
          data={filteredData.emotionDistribution} 
          valueKey="count" 
          labelKey="emotion"
          colorKey="color"
          title="Emotion Distribution"
        />
      </div>

      <h3>💝 Recent Emotional Notes</h3>
      <div className="notes-list">
        {filteredData.notes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💝</div>
            <p>No emotional notes in the selected time range.</p>
          </div>
        ) : (
          filteredData.notes.slice(0, 8).map(note => (
            <div key={note.noteId} className="note-card">
              <div className="note-header">
                <div className="note-date">{formatDate(note.timestamp)}</div>
                {note.emotion && (
                  <span className="emotion-badge" style={{ background: getEmotionColor(note.emotion) }}>
                    {note.emotion}
                  </span>
                )}
              </div>
              
              <div className="note-content">{note.content}</div>
              
              <div className="note-meta">
                {note.energyLevel && <span>⚡ Energy: {note.energyLevel}/10</span>}
                {note.tags && note.tags.length > 0 && <span>🏷️ Tags: {note.tags.slice(0, 2).join(', ')}</span>}
              </div>
              
              {note.gratitude && note.gratitude.length > 0 && (
                <div className="note-gratitude">
                  <span className="gratitude-label">🙏 Gratitude: </span>
                  {note.gratitude.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // Usage Tab Content
  const renderUsageTab = () => {
    const usagePatterns = getAppUsagePatterns();
    const engagementMetrics = getEngagementMetrics();
    const featureUtilization = getFeatureUtilization();

    return (
      <div className="usage-tab" key={refreshTrigger}>
        <h3>📱 App Usage Analytics</h3>
        
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon">📊</div>
            <div className="metric-value">{analyticsData?.totalSessions || 0}</div>
            <div className="metric-label">Total Sessions</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">📅</div>
            <div className="metric-value">{engagementMetrics.weeklyFrequency}</div>
            <div className="metric-label">Weekly Sessions</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">⏱️</div>
            <div className="metric-value">{Math.round((analyticsData?.totalPracticeTime || 0) / 60)}h</div>
            <div className="metric-label">Total Practice Time</div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">🔥</div>
            <div className="metric-value">{usagePatterns.consistency}</div>
            <div className="metric-label">Consistency</div>
          </div>
        </div>

        <div className="usage-patterns">
          <h4>⏰ Session Timing Patterns</h4>
          <div className="patterns-grid">
            <div className="pattern-section">
              <h5>🌅 Time of Day</h5>
              <div className="pattern-list">
                {Object.entries(usagePatterns.timeOfDayStats || {}).map(([time, count]) => (
                  <div key={time} className="pattern-item">
                    <span className="pattern-label">{time}</span>
                    <span className="pattern-count">{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pattern-section">
              <h5>📅 Day of Week</h5>
              <div className="pattern-list">
                {Object.entries(usagePatterns.dayOfWeekStats || {}).map(([day, count]) => (
                  <div key={day} className="pattern-item">
                    <span className="pattern-label">{day}</span>
                    <span className="pattern-count">{String(count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="feature-utilization">
          <h4>🛠️ Feature Utilization</h4>
          <EnhancedBarChart 
            data={featureUtilization} 
            valueKey="percentage" 
            labelKey="feature"
            title="Feature Usage Distribution"
          />
        </div>
      </div>
    );
  };

  // Helper function for emotion colors
  const getEmotionColor = (emotion: string): string => {
    const colors: { [key: string]: string } = {
      joy: '#FFD700', peaceful: '#87CEEB', energized: '#32CD32',
      focused: '#4169E1', accomplished: '#228B22', grateful: '#FFA500',
      neutral: '#A9A9A9', sadness: '#6495ED', anger: '#FF6347'
    };
    return colors[emotion.toLowerCase()] || '#A9A9A9';
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  if (isLoading) {
    return (
      <div className="analytics-board">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div>Loading analytics...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-board">
      {/* Header */}
      <header className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <p className="analytics-description">
          Comprehensive meditation analytics with 9-category PAHM Matrix, Mind Recovery tracking, and progress insights.
        </p>
        
        {/* Time Range Selector */}
        <div className="time-range-selector">
          <label>Time Range:</label>
          <div className="time-range-buttons">
            {['week', 'month', 'quarter', 'year'].map(range => (
              <button 
                key={range}
                className={`time-button ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Navigation - NOW WITH INSIGHTS TAB */}
        <div className="analytics-tabs">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'insights', label: 'Insights', icon: '💡' },
            { key: 'pahm', label: '9-Category PAHM', icon: '🧠' },
            { key: 'environment', label: 'Environment', icon: '🌿' },
            { key: 'mind-recovery', label: 'Mind Recovery', icon: '🕐' },
            { key: 'emotional', label: 'Emotional', icon: '💝' },
            { key: 'usage', label: 'Usage', icon: '📱' }
          ].map(tab => (
            <button 
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>
      
      {/* Content Area */}
      <div className="analytics-content">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'pahm' && renderPAHMTab()}
        {activeTab === 'environment' && renderEnvironmentTab()}
        {activeTab === 'mind-recovery' && renderMindRecoveryTab()}
        {activeTab === 'emotional' && renderEmotionalTab()}
        {activeTab === 'usage' && renderUsageTab()}
      </div>
    </div>
  );
};

export default AnalyticsBoard;