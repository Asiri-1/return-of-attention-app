// src/contexts/analytics/AnalyticsContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { usePractice } from '../practice/PracticeContext';
import { useWellness } from '../wellness/WellnessContext';
import { useUser } from '../user/UserContext';

// ================================
// ANALYTICS INTERFACES
// ================================
interface PAHMAnalytics {
  totalPAHM: {
    present_attachment: number;
    present_neutral: number;
    present_aversion: number;
    past_attachment: number;
    past_neutral: number;
    past_aversion: number;
    future_attachment: number;
    future_neutral: number;
    future_aversion: number;
  };
  totalCounts: number;
  timeDistribution: {
    present: number;
    past: number;
    future: number;
  };
  emotionalDistribution: {
    attachment: number;
    neutral: number;
    aversion: number;
  };
  presentPercentage: number;
  neutralPercentage: number;
  sessionsAnalyzed: number;
  totalObservations: number;
  trends: {
    presentTrend: 'improving' | 'stable' | 'declining';
    neutralTrend: 'improving' | 'stable' | 'declining';
    overallProgress: number;
  };
}

interface EnvironmentAnalytics {
  posture: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
    recommendation?: string;
  }>;
  location: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
    recommendation?: string;
  }>;
  lighting: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
    recommendation?: string;
  }>;
  sounds: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
    recommendation?: string;
  }>;
  optimalConditions: {
    bestPosture: string;
    bestLocation: string;
    bestLighting: string;
    bestSounds: string;
    confidence: number;
  };
}

interface MindRecoveryAnalytics {
  totalMindRecoverySessions: number;
  totalMindRecoveryMinutes: number;
  avgMindRecoveryRating: number;
  avgMindRecoveryDuration: number;
  contextStats: Array<{
    context: string;
    count: number;
    avgRating: number;
    avgDuration: number;
    effectiveness: number;
  }>;
  purposeStats: Array<{
    purpose: string;
    count: number;
    avgRating: number;
    avgDuration: number;
    effectiveness: number;
  }>;
  highestRatedContext?: {
    name: string;
    rating: number;
  };
  mostUsedContext?: {
    name: string;
    count: number;
  };
  recommendations: string[];
  timePatterns: {
    morningEffectiveness: number;
    afternoonEffectiveness: number;
    eveningEffectiveness: number;
    optimalTime: string;
  };
}

interface ComprehensiveAnalytics {
  overview: {
    totalSessions: number;
    totalMeditationSessions: number;
    totalMindRecoverySessions: number;
    totalPracticeTime: number;
    averageSessionLength: number;
    averageQuality: number;
    averagePresentPercentage: number;
    currentStreak: number;
    longestStreak: number;
    consistencyScore: number;
    progressTrend: 'improving' | 'stable' | 'declining';
  };
  
  detailed: {
    weeklyProgress: Array<{ week: string; sessions: number; quality: number; minutes: number }>;
    monthlyTrends: Array<{ month: string; avgQuality: number; totalSessions: number; consistency: number }>;
    stageProgression: Array<{ stage: number; sessionsCompleted: number; avgQuality: number; timeSpent: number }>;
    qualityDistribution: { [rating: number]: number };
    durationPreferences: { [duration: number]: number };
  };
  
  insights: {
    strongestAreas: string[];
    improvementAreas: string[];
    personalizedTips: string[];
    nextMilestones: Array<{ title: string; progress: number; target: number }>;
    practiceOptimization: {
      bestTimeOfDay: string;
      optimalDuration: number;
      preferredEnvironment: string;
      confidence: number;
    };
  };
  
  predictions: {
    streakPrediction: { likely: number; optimistic: number; confidence: number };
    qualityImprovement: { expectedRating: number; timeframe: string; confidence: number };
    stageAdvancement: { nextStage: number; estimatedTime: string; confidence: number };
  };
}

interface DashboardAnalytics {
  practiceDurationData: Array<{ date: string; duration: number; quality?: number }>;
  emotionDistribution: Array<{ emotion: string; count: number; color: string }>;
  practiceDistribution: Array<{ stage: string; count: number; minutes: number }>;
  appUsagePatterns: {
    timeOfDayStats: { [timeOfDay: string]: number };
    dayOfWeekStats: { [dayOfWeek: string]: number };
    consistency: number;
    sessionFrequency: { daily: number; weekly: number; monthly: number };
  };
  engagementMetrics: {
    weeklyFrequency: number;
    weeklyNotes: number;
    avgSessionLength: number;
    totalEngagementDays: number;
    retentionScore: number;
  };
  featureUtilization: Array<{
    feature: string;
    percentage: number;
    trend: 'increasing' | 'stable' | 'decreasing';
  }>;
}

interface AnalyticsContextType {
  // Data
  isLoading: boolean;
  lastUpdated: string | null;
  
  // Core Analytics Methods (from LocalDataContext)
  getPAHMData: () => PAHMAnalytics | null;
  getEnvironmentData: () => EnvironmentAnalytics;
  getMindRecoveryAnalytics: () => MindRecoveryAnalytics;
  getComprehensiveAnalytics: () => ComprehensiveAnalytics;
  
  // Dashboard Analytics Methods
  getFilteredData: (timeRange?: string) => { practice: any[], notes: any[] };
  getPracticeDurationData: (timeRange?: string) => Array<{ date: string; duration: number; quality?: number }>;
  getEmotionDistribution: (timeRange?: string) => Array<{ emotion: string; count: number; color: string }>;
  getPracticeDistribution: (timeRange?: string) => Array<{ stage: string; count: number; minutes: number }>;
  getAppUsagePatterns: () => any;
  getEngagementMetrics: () => any;
  getFeatureUtilization: () => Array<{ feature: string; percentage: number; trend: 'increasing' | 'stable' | 'decreasing' }>;
  
  // Advanced Analytics
  getProgressTrends: () => any;
  getPredictiveInsights: () => any;
  getPersonalizedRecommendations: () => string[];
  getOptimalPracticeConditions: () => any;
  
  // Comprehensive Methods
  getComprehensiveStats: () => any;
  get9CategoryPAHMInsights: () => PAHMAnalytics | null;
  getMindRecoveryInsights: () => MindRecoveryAnalytics;
  getDashboardAnalytics: (timeRange?: string) => DashboardAnalytics;
  
  // Export & Reporting
  exportDataForAnalysis: () => any;
  generateInsightsReport: () => any;
  
  // Utility
  refreshAnalytics: () => void;
  clearAnalyticsCache: () => void;
}

// ================================
// CREATE CONTEXT
// ================================
const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

// ================================
// ANALYTICS PROVIDER IMPLEMENTATION
// ================================
export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { sessions, stats } = usePractice();
  const { emotionalNotes, reflections, getEmotionInsights } = useWellness();
  const { userProfile } = useUser();
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [analyticsCache, setAnalyticsCache] = useState<{ [key: string]: any }>({});

  // ================================
  // CACHE MANAGEMENT
  // ================================
  const getCacheKey = useCallback((method: string, params?: any): string => {
    const baseKey = `${method}_${currentUser?.uid || 'guest'}`;
    return params ? `${baseKey}_${JSON.stringify(params)}` : baseKey;
  }, [currentUser?.uid]);

  const getCachedResult = useCallback((key: string, ttlMinutes: number = 10) => {
    const cached = analyticsCache[key];
    if (!cached) return null;
    
    const age = Date.now() - cached.timestamp;
    const ttl = ttlMinutes * 60 * 1000;
    
    return age < ttl ? cached.data : null;
  }, [analyticsCache]);

  const setCachedResult = useCallback((key: string, data: any) => {
    setAnalyticsCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  // ================================
  // PAHM ANALYTICS (9-Category System)
  // ================================
  const getPAHMData = useCallback((): PAHMAnalytics | null => {
    const cacheKey = getCacheKey('pahm');
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
    
    const pahmSessions = sessions.filter(session => session.pahmCounts);
    
    if (pahmSessions.length === 0) {
      return null;
    }

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

    pahmSessions.forEach(session => {
      if (session.pahmCounts) {
        Object.keys(totalPAHM).forEach(key => {
          const value = session.pahmCounts![key as keyof typeof session.pahmCounts] || 0;
          totalPAHM[key as keyof typeof totalPAHM] += value;
        });
      }
    });

    const totalCounts = Object.values(totalPAHM).reduce((sum, count) => sum + count, 0);
    
    const timeDistribution = {
      present: totalPAHM.present_attachment + totalPAHM.present_neutral + totalPAHM.present_aversion,
      past: totalPAHM.past_attachment + totalPAHM.past_neutral + totalPAHM.past_aversion,
      future: totalPAHM.future_attachment + totalPAHM.future_neutral + totalPAHM.future_aversion
    };

    const emotionalDistribution = {
      attachment: totalPAHM.present_attachment + totalPAHM.past_attachment + totalPAHM.future_attachment,
      neutral: totalPAHM.present_neutral + totalPAHM.past_neutral + totalPAHM.future_neutral,
      aversion: totalPAHM.present_aversion + totalPAHM.past_aversion + totalPAHM.future_aversion
    };

    const presentPercentage = totalCounts > 0 ? Math.round((timeDistribution.present / totalCounts) * 100) : 0;
    const neutralPercentage = totalCounts > 0 ? Math.round((emotionalDistribution.neutral / totalCounts) * 100) : 0;

    // Calculate trends
    const recentSessions = pahmSessions.slice(-10);
    const earlierSessions = pahmSessions.slice(-20, -10);
    
    const calculateTrend = (recent: any[], earlier: any[], metric: string) => {
      if (recent.length === 0 || earlier.length === 0) return 'stable';
      
      const recentAvg = recent.reduce((sum, s) => {
        const counts = s.pahmCounts || {};
        const total = Object.values(counts).reduce((sum: number, val: any) => sum + (val || 0), 0);
        return sum + (metric === 'present' ? timeDistribution.present / pahmSessions.length : 
                     metric === 'neutral' ? emotionalDistribution.neutral / pahmSessions.length : 0);
      }, 0) / recent.length;
      
      const earlierAvg = earlier.reduce((sum, s) => {
        const counts = s.pahmCounts || {};
        const total = Object.values(counts).reduce((sum: number, val: any) => sum + (val || 0), 0);
        return sum + (metric === 'present' ? timeDistribution.present / pahmSessions.length : 
                     metric === 'neutral' ? emotionalDistribution.neutral / pahmSessions.length : 0);
      }, 0) / earlier.length;
      
      const difference = recentAvg - earlierAvg;
      return Math.abs(difference) < 0.05 ? 'stable' : difference > 0 ? 'improving' : 'declining';
    };

    const trends = {
      presentTrend: calculateTrend(recentSessions, earlierSessions, 'present') as 'improving' | 'stable' | 'declining',
      neutralTrend: calculateTrend(recentSessions, earlierSessions, 'neutral') as 'improving' | 'stable' | 'declining',
      overallProgress: Math.round((presentPercentage + neutralPercentage) / 2)
    };

    const result: PAHMAnalytics = {
      totalPAHM,
      totalCounts,
      timeDistribution,
      emotionalDistribution,
      presentPercentage,
      neutralPercentage,
      sessionsAnalyzed: pahmSessions.length,
      totalObservations: totalCounts,
      trends
    };

    setCachedResult(cacheKey, result);
    return result;
  }, [sessions, getCacheKey, getCachedResult, setCachedResult]);

  // ================================
  // ENVIRONMENT ANALYTICS
  // ================================
  const getEnvironmentData = useCallback((): EnvironmentAnalytics => {
    const cacheKey = getCacheKey('environment');
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
    
    const environmentSessions = sessions.filter(session => session.environment);
    
    if (environmentSessions.length === 0) {
      return {
        posture: [],
        location: [],
        lighting: [],
        sounds: [],
        optimalConditions: {
          bestPosture: 'Unknown',
          bestLocation: 'Unknown',
          bestLighting: 'Unknown',
          bestSounds: 'Unknown',
          confidence: 0
        }
      };
    }

    const analyzeEnvironmentFactor = (factor: keyof NonNullable<any['environment']>) => {
      const factorData: { [key: string]: { count: number; totalRating: number; totalPresent: number } } = {};
      
      environmentSessions.forEach(session => {
        if (session.environment) {
          const value = session.environment[factor];
          if (!factorData[value]) {
            factorData[value] = { count: 0, totalRating: 0, totalPresent: 0 };
          }
          factorData[value].count++;
          factorData[value].totalRating += session.rating || 0;
          factorData[value].totalPresent += session.presentPercentage || 0;
        }
      });

      return Object.entries(factorData).map(([name, data]) => {
        const avgRating = Math.round((data.totalRating / data.count) * 10) / 10;
        const avgPresent = Math.round(data.totalPresent / data.count);
        
        // Generate recommendations
        let recommendation = '';
        if (avgRating >= 4 && avgPresent >= 70) {
          recommendation = `Excellent choice! Continue using ${name}`;
        } else if (avgRating < 3 || avgPresent < 50) {
          recommendation = `Consider trying alternatives to ${name}`;
        } else {
          recommendation = `${name} works well for you`;
        }
        
        return {
          name,
          count: data.count,
          avgRating,
          avgPresent,
          recommendation
        };
      }).sort((a, b) => b.count - a.count);
    };

    const posture = analyzeEnvironmentFactor('posture');
    const location = analyzeEnvironmentFactor('location');
    const lighting = analyzeEnvironmentFactor('lighting');
    const sounds = analyzeEnvironmentFactor('sounds');

    // Determine optimal conditions
    const getBest = (arr: any[]) => arr.length > 0 ? arr.reduce((best, current) => 
      (current.avgRating * 0.7 + current.avgPresent * 0.003) > (best.avgRating * 0.7 + best.avgPresent * 0.003) ? current : best
    ) : null;

    const bestPosture = getBest(posture);
    const bestLocation = getBest(location);
    const bestLighting = getBest(lighting);
    const bestSounds = getBest(sounds);

    const confidence = Math.min(
      Math.round(((bestPosture?.count || 0) + (bestLocation?.count || 0) + 
                  (bestLighting?.count || 0) + (bestSounds?.count || 0)) / 
                 (environmentSessions.length * 4) * 100),
      100
    );

    const result: EnvironmentAnalytics = {
      posture,
      location,
      lighting,
      sounds,
      optimalConditions: {
        bestPosture: bestPosture?.name || 'Unknown',
        bestLocation: bestLocation?.name || 'Unknown',
        bestLighting: bestLighting?.name || 'Unknown',
        bestSounds: bestSounds?.name || 'Unknown',
        confidence
      }
    };

    setCachedResult(cacheKey, result);
    return result;
  }, [sessions, getCacheKey, getCachedResult, setCachedResult]);

  // ================================
  // MIND RECOVERY ANALYTICS
  // ================================
  const getMindRecoveryAnalytics = useCallback((): MindRecoveryAnalytics => {
    const cacheKey = getCacheKey('mindRecovery');
    const cached = getCachedResult(cacheKey);
    if (cached) return cached;
    
    const mindRecoverySessions = sessions.filter(s => s.sessionType === 'mind_recovery');
    
    if (mindRecoverySessions.length === 0) {
      return {
        totalMindRecoverySessions: 0,
        totalMindRecoveryMinutes: 0,
        avgMindRecoveryRating: 0,
        avgMindRecoveryDuration: 0,
        contextStats: [],
        purposeStats: [],
        recommendations: ['Start with mind recovery sessions to see analytics'],
        timePatterns: {
          morningEffectiveness: 0,
          afternoonEffectiveness: 0,
          eveningEffectiveness: 0,
          optimalTime: 'Unknown'
        }
      };
    }

    const totalMinutes = mindRecoverySessions.reduce((sum, session) => sum + session.duration, 0);
    const avgRating = mindRecoverySessions.reduce((sum, session) => sum + (session.rating || 0), 0) / mindRecoverySessions.length;
    const avgDuration = totalMinutes / mindRecoverySessions.length;

    // Analyze contexts with effectiveness scoring
    const contextData: { [key: string]: { count: number; totalRating: number; totalDuration: number; effectiveness: number } } = {};
    mindRecoverySessions.forEach(session => {
      if (session.mindRecoveryContext) {
        const context = session.mindRecoveryContext;
        if (!contextData[context]) {
          contextData[context] = { count: 0, totalRating: 0, totalDuration: 0, effectiveness: 0 };
        }
        contextData[context].count++;
        contextData[context].totalRating += session.rating || 0;
        contextData[context].totalDuration += session.duration;
      }
    });

    const contextStats = Object.entries(contextData).map(([context, data]) => {
      const avgRating = Math.round((data.totalRating / data.count) * 10) / 10;
      const avgDuration = Math.round(data.totalDuration / data.count);
      const effectiveness = Math.round((avgRating / 5) * 100); // Convert 1-5 rating to 0-100 effectiveness
      
      return {
        context,
        count: data.count,
        avgRating,
        avgDuration,
        effectiveness
      };
    }).sort((a, b) => b.effectiveness - a.effectiveness);

    // Analyze purposes
    const purposeData: { [key: string]: { count: number; totalRating: number; totalDuration: number; effectiveness: number } } = {};
    mindRecoverySessions.forEach(session => {
      if (session.mindRecoveryPurpose) {
        const purpose = session.mindRecoveryPurpose;
        if (!purposeData[purpose]) {
          purposeData[purpose] = { count: 0, totalRating: 0, totalDuration: 0, effectiveness: 0 };
        }
        purposeData[purpose].count++;
        purposeData[purpose].totalRating += session.rating || 0;
        purposeData[purpose].totalDuration += session.duration;
      }
    });

    const purposeStats = Object.entries(purposeData).map(([purpose, data]) => {
      const avgRating = Math.round((data.totalRating / data.count) * 10) / 10;
      const avgDuration = Math.round(data.totalDuration / data.count);
      const effectiveness = Math.round((avgRating / 5) * 100);
      
      return {
        purpose,
        count: data.count,
        avgRating,
        avgDuration,
        effectiveness
      };
    }).sort((a, b) => b.effectiveness - a.effectiveness);

    // Time pattern analysis
    const timePatterns = {
      morning: mindRecoverySessions.filter(s => {
        const hour = new Date(s.timestamp).getHours();
        return hour >= 6 && hour < 12;
      }),
      afternoon: mindRecoverySessions.filter(s => {
        const hour = new Date(s.timestamp).getHours();
        return hour >= 12 && hour < 18;
      }),
      evening: mindRecoverySessions.filter(s => {
        const hour = new Date(s.timestamp).getHours();
        return hour >= 18 || hour < 6;
      })
    };

    const getTimeEffectiveness = (sessions: any[]) => {
      if (sessions.length === 0) return 0;
      const avgRating = sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length;
      return Math.round((avgRating / 5) * 100);
    };

    const morningEffectiveness = getTimeEffectiveness(timePatterns.morning);
    const afternoonEffectiveness = getTimeEffectiveness(timePatterns.afternoon);
    const eveningEffectiveness = getTimeEffectiveness(timePatterns.evening);

    const optimalTime = morningEffectiveness >= afternoonEffectiveness && morningEffectiveness >= eveningEffectiveness ? 'Morning' :
                      afternoonEffectiveness >= eveningEffectiveness ? 'Afternoon' : 'Evening';

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (contextStats.length > 0) {
      const bestContext = contextStats[0];
      recommendations.push(`${bestContext.context} sessions work best for you (${bestContext.effectiveness}% effectiveness)`);
    }
    
    if (purposeStats.length > 0) {
      const bestPurpose = purposeStats[0];
      recommendations.push(`Use mind recovery primarily for ${bestPurpose.purpose.replace('-', ' ')}`);
    }
    
    recommendations.push(`Your optimal time for mind recovery is ${optimalTime.toLowerCase()}`);
    
    if (avgDuration < 10) {
      recommendations.push('Consider longer sessions (10+ minutes) for better results');
    }

    const result: MindRecoveryAnalytics = {
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalMindRecoveryMinutes: totalMinutes,
      avgMindRecoveryRating: Math.round(avgRating * 10) / 10,
      avgMindRecoveryDuration: Math.round(avgDuration),
      contextStats,
      purposeStats,
      highestRatedContext: contextStats.length > 0 ? {
        name: contextStats[0].context,
        rating: contextStats[0].avgRating
      } : undefined,
      mostUsedContext: contextStats.length > 0 ? {
        name: contextStats.reduce((prev, current) => prev.count > current.count ? prev : current).context,
        count: contextStats.reduce((prev, current) => prev.count > current.count ? prev : current).count
      } : undefined,
      recommendations,
      timePatterns: {
        morningEffectiveness,
        afternoonEffectiveness,
        eveningEffectiveness,
        optimalTime
      }
    };

    setCachedResult(cacheKey, result);
    return result;
  }, [sessions, getCacheKey, getCachedResult, setCachedResult]);

  // ================================
  // DASHBOARD ANALYTICS
  // ================================
  const getFilteredData = useCallback((timeRange: string = 'month') => {
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const practice = sessions.filter(session => 
      new Date(session.timestamp) >= startDate
    );
    
    const notes = emotionalNotes.filter(note => 
      new Date(note.timestamp) >= startDate
    );
    
    return { practice, notes };
  }, [sessions, emotionalNotes]);

  const getPracticeDurationData = useCallback((timeRange: string = 'month') => {
    const cacheKey = getCacheKey('practiceDuration', timeRange);
    const cached = getCachedResult(cacheKey, 5);
    if (cached) return cached;
    
    const { practice } = getFilteredData(timeRange);
    
    const durationData: { [key: string]: { duration: number; totalRating: number; sessionCount: number } } = {};
    
    practice.forEach(session => {
      const date = new Date(session.timestamp).toISOString().split('T')[0];
      if (!durationData[date]) {
        durationData[date] = { duration: 0, totalRating: 0, sessionCount: 0 };
      }
      durationData[date].duration += session.duration;
      durationData[date].totalRating += session.rating || 0;
      durationData[date].sessionCount += 1;
    });
    
    const result = Object.entries(durationData).map(([date, data]) => ({
      date,
      duration: data.duration,
      quality: data.sessionCount > 0 ? Math.round((data.totalRating / data.sessionCount) * 10) / 10 : undefined
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setCachedResult(cacheKey, result);
    return result;
  }, [getFilteredData, getCacheKey, getCachedResult, setCachedResult]);

  const getEmotionDistribution = useCallback((timeRange: string = 'month') => {
    const cacheKey = getCacheKey('emotionDistribution', timeRange);
    const cached = getCachedResult(cacheKey, 5);
    if (cached) return cached;
    
    const { notes } = getFilteredData(timeRange);
    
    const emotionCounts: { [key: string]: number } = {};
    const emotionColors: { [key: string]: string } = {
      joy: '#4caf50', happy: '#4caf50', calm: '#2196f3', grateful: '#ff9800',
      focused: '#9c27b0', peaceful: '#00bcd4', energized: '#cddc39', thoughtful: '#607d8b',
      content: '#8bc34a', neutral: '#9e9e9e', stressed: '#ff5722', sad: '#3f51b5',
      angry: '#f44336', frustrated: '#ff5722'
    };
    
    notes.forEach(note => {
      if (note.emotion) {
        emotionCounts[note.emotion] = (emotionCounts[note.emotion] || 0) + 1;
      }
    });
    
    const result = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      color: emotionColors[emotion] || '#9e9e9e'
    })).sort((a, b) => b.count - a.count);

    setCachedResult(cacheKey, result);
    return result;
  }, [getFilteredData, getCacheKey, getCachedResult, setCachedResult]);

  const getPracticeDistribution = useCallback((timeRange: string = 'month') => {
    const cacheKey = getCacheKey('practiceDistribution', timeRange);
    const cached = getCachedResult(cacheKey, 5);
    if (cached) return cached;
    
    const { practice } = getFilteredData(timeRange);
    
    const stageData: { [key: string]: { count: number; minutes: number } } = {};
    
    practice.forEach(session => {
      const stage = session.stageLabel || `Stage ${session.stageLevel || 1}`;
      if (!stageData[stage]) {
        stageData[stage] = { count: 0, minutes: 0 };
      }
      stageData[stage].count += 1;
      stageData[stage].minutes += session.duration;
    });
    
    const result = Object.entries(stageData).map(([stage, data]) => ({
      stage,
      count: data.count,
      minutes: data.minutes
    })).sort((a, b) => b.count - a.count);

    setCachedResult(cacheKey, result);
    return result;
  }, [getFilteredData, getCacheKey, getCachedResult, setCachedResult]);

  // ================================
  // COMPREHENSIVE ANALYTICS
  // ================================
  const getComprehensiveAnalytics = useCallback((): ComprehensiveAnalytics => {
    const cacheKey = getCacheKey('comprehensive');
    const cached = getCachedResult(cacheKey, 10);
    if (cached) return cached;

    const overview = {
      totalSessions: stats.totalSessions,
      totalMeditationSessions: sessions.filter(s => s.sessionType === 'meditation').length,
      totalMindRecoverySessions: stats.totalMindRecoverySessions,
      totalPracticeTime: stats.totalMinutes,
      averageSessionLength: Math.round(stats.totalMinutes / Math.max(stats.totalSessions, 1)),
      averageQuality: stats.averageQuality,
      averagePresentPercentage: stats.averagePresentPercentage,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      consistencyScore: 85, // Calculate based on practice frequency
      progressTrend: 'stable' as const
    };

    // Generate detailed analytics (weekly/monthly trends, etc.)
    const detailed = {
      weeklyProgress: [], // Implementation would go here
      monthlyTrends: [],
      stageProgression: [],
      qualityDistribution: {},
      durationPreferences: {}
    };

    // Generate insights
    const insights = {
      strongestAreas: ['Consistency', 'Mind Recovery'],
      improvementAreas: ['Present Moment Awareness'],
      personalizedTips: [
        'Try shorter sessions to improve consistency',
        'Focus on breath awareness in your next session'
      ],
      nextMilestones: [
        { title: 'Week Warrior', progress: Math.min((stats.currentStreak / 7) * 100, 100), target: 7 }
      ],
      practiceOptimization: {
        bestTimeOfDay: 'Morning',
        optimalDuration: 15,
        preferredEnvironment: 'Quiet space',
        confidence: 75
      }
    };

    // Generate predictions
    const predictions = {
      streakPrediction: { likely: stats.currentStreak + 3, optimistic: stats.currentStreak + 7, confidence: 70 },
      qualityImprovement: { expectedRating: stats.averageQuality + 0.2, timeframe: '2 weeks', confidence: 65 },
      stageAdvancement: { nextStage: 2, estimatedTime: '1 month', confidence: 80 }
    };

    const result: ComprehensiveAnalytics = {
      overview,
      detailed,
      insights,
      predictions
    };

    setCachedResult(cacheKey, result);
    return result;
  }, [stats, sessions, getCacheKey, getCachedResult, setCachedResult]);

  // ================================
  // UTILITY METHODS
  // ================================
  const refreshAnalytics = useCallback(() => {
    setAnalyticsCache({});
    setLastUpdated(new Date().toISOString());
  }, []);

  const clearAnalyticsCache = useCallback(() => {
    setAnalyticsCache({});
  }, []);

  // ================================
  // PLACEHOLDER METHODS (for compatibility)
  // ================================
  const placeholderMethods = useMemo(() => ({
    getAppUsagePatterns: () => ({}),
    getEngagementMetrics: () => ({}),
    getFeatureUtilization: () => ([]),
    getProgressTrends: () => ({}),
    getPredictiveInsights: () => ({}),
    getPersonalizedRecommendations: () => ([]),
    getOptimalPracticeConditions: () => ({}),
    getComprehensiveStats: () => ({}),
    get9CategoryPAHMInsights: () => getPAHMData(),
    getMindRecoveryInsights: () => getMindRecoveryAnalytics(),
    getDashboardAnalytics: (timeRange?: string) => ({
      practiceDurationData: getPracticeDurationData(timeRange),
      emotionDistribution: getEmotionDistribution(timeRange),
      practiceDistribution: getPracticeDistribution(timeRange),
      appUsagePatterns: {},
      engagementMetrics: {},
      featureUtilization: []
    }),
    exportDataForAnalysis: () => ({
      sessions,
      emotionalNotes,
      reflections,
      userProfile,
      analytics: {
        pahm: getPAHMData(),
        environment: getEnvironmentData(),
        mindRecovery: getMindRecoveryAnalytics(),
        comprehensive: getComprehensiveAnalytics()
      },
      exportedAt: new Date().toISOString()
    }),
    generateInsightsReport: () => ({
      summary: 'Analytics insights report',
      generatedAt: new Date().toISOString()
    })
  }), [
    getPAHMData, getMindRecoveryAnalytics, getPracticeDurationData, 
    getEmotionDistribution, getPracticeDistribution, getEnvironmentData,
    getComprehensiveAnalytics, sessions, emotionalNotes, reflections, userProfile
  ]);

  // ================================
  // EFFECTS
  // ================================
  useEffect(() => {
    // Refresh analytics when data changes
    if (sessions.length > 0 || emotionalNotes.length > 0) {
      setLastUpdated(new Date().toISOString());
    }
  }, [sessions.length, emotionalNotes.length]);

  // ================================
  // CONTEXT VALUE
  // ================================
  const contextValue: AnalyticsContextType = useMemo(() => ({
    // Data
    isLoading,
    lastUpdated,
    
    // Core Analytics Methods
    getPAHMData,
    getEnvironmentData,
    getMindRecoveryAnalytics,
    getComprehensiveAnalytics,
    
    // Dashboard Analytics Methods
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getPracticeDistribution,
    
    // Utility
    refreshAnalytics,
    clearAnalyticsCache,
    
    // Placeholder methods
    ...placeholderMethods
  }), [
    isLoading, lastUpdated,
    getPAHMData, getEnvironmentData, getMindRecoveryAnalytics, getComprehensiveAnalytics,
    getFilteredData, getPracticeDurationData, getEmotionDistribution, getPracticeDistribution,
    refreshAnalytics, clearAnalyticsCache,
    placeholderMethods
  ]);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// ================================
// CUSTOM HOOK
// ================================
export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;