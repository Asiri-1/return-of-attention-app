import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';

// 🏗️ COMPLETE DATA TYPES WITH 9-CATEGORY PAHM SYSTEM
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number;
  stageLabel?: string;
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'midday-reset' | 'work-home-transition' | 'evening-window' | 'breathing-reset' | 'thought-labeling' | 'body-scan' | 'single-point-focus' | 'loving-kindness' | 'gratitude-moment' | 'mindful-transition' | 'stress-release';
  mindRecoveryPurpose?: 'energy-boost' | 'stress-relief' | 'mental-refresh' | 'transition-support' | 'sleep-preparation' | 'emotional-balance' | 'quick-reset' | 'awareness-anchor';
  rating?: number;
  notes?: string;
  presentPercentage?: number;
  environment?: {
    posture: string;
    location: string;
    lighting: string;
    sounds: string;
  };
  pahmCounts?: {
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
  recoveryMetrics?: {
    stressReduction: number;
    energyLevel: number;
    clarityImprovement: number;
    moodImprovement: number;
  };
  metadata?: any; // ✅ NEW: Additional metadata field
}

interface EmotionalNoteData {
  noteId: string;
  timestamp: string;
  content: string;
  emotion: string;
  energyLevel?: number;
  tags?: string[];
  gratitude?: string[];
  metadata?: any; // ✅ NEW: Additional metadata field
}

interface ReflectionData {
  reflectionId: string;
  timestamp: string;
  type: 'morning' | 'evening' | 'post_session';
  mood: number;
  energy: number;
  stress: number;
  gratitude: string[];
  intention?: string;
  insights?: string;
}

// 🧠 9-CATEGORY PAHM ANALYTICS INTERFACE
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
}

// 🌿 ENVIRONMENT ANALYTICS INTERFACE
interface EnvironmentAnalytics {
  posture: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
  }>;
  location: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
  }>;
  lighting: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
  }>;
  sounds: Array<{
    name: string;
    count: number;
    avgRating: number;
    avgPresent: number;
  }>;
}

// 🕐 MIND RECOVERY ANALYTICS INTERFACE
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
  }>;
  purposeStats: Array<{
    purpose: string;
    count: number;
    avgRating: number;
    avgDuration: number;
  }>;
  highestRatedContext?: {
    name: string;
    rating: number;
  };
  mostUsedContext?: {
    name: string;
    count: number;
  };
}

// 📊 COMPREHENSIVE ANALYTICS INTERFACE
interface ComprehensiveAnalytics {
  totalSessions: number;
  totalMeditationSessions: number;
  totalMindRecoverySessions: number;
  totalPracticeTime: number;
  averageSessionLength: number;
  averageQuality: number;
  averagePresentPercentage: number;
  currentStreak: number;
  longestStreak: number;
  emotionalNotesCount: number;
  consistencyScore: number;
  progressTrend: 'improving' | 'stable' | 'declining';
  lastUpdated: string;
}

interface ComprehensiveUserData {
  profile: {
    userId: string;
    displayName: string;
    email: string;
    totalSessions: number;
    totalMinutes: number;
    currentStreak: number;
    longestStreak: number;
    averageQuality: number;
    averagePresentPercentage: number;
    totalMindRecoverySessions?: number;
    totalMindRecoveryMinutes?: number;
    averageMindRecoveryRating?: number;
    currentProgress?: {
      currentStage: number;
      currentTLevel: string;
      totalSessions: number;
      totalMinutes: number;
      longestStreak: number;
      currentStreak: number;
      averageQuality: number;
      averagePresentPercentage: number;
    };
    preferences?: {
      defaultSessionDuration: number;
      reminderEnabled: boolean;
      favoriteStages: number[];
      optimalPracticeTime: string;
      notifications: {
        dailyReminder: boolean;
        streakReminder: boolean;
        weeklyProgress: boolean;
      };
    };
  };
  practiceSessions: PracticeSessionData[];
  emotionalNotes: EmotionalNoteData[];
  reflections: ReflectionData[];
  analytics: {
    totalPracticeTime: number;
    averageSessionLength: number;
    consistencyScore: number;
    progressTrend: 'improving' | 'stable' | 'declining';
    lastUpdated: string;
  };
}

// 🎯 ENHANCED CONTEXT INTERFACE WITH COMPLETE COVERAGE
interface LocalDataContextType {
  userData: ComprehensiveUserData | null;
  isLoading: boolean;
  refreshTrigger: number; // ✨ AUTO-REFRESH TRIGGER
  
  // Core methods (production only)
  clearAllData: () => void;
  
  // Data getters
  getPracticeSessions: () => PracticeSessionData[];
  getDailyEmotionalNotes: () => EmotionalNoteData[];
  getReflections: () => ReflectionData[];
  getAnalyticsData: () => ComprehensiveAnalytics;
  
  // Mind recovery specific getters
  getMindRecoverySessions: () => PracticeSessionData[];
  getMeditationSessions: () => PracticeSessionData[];
  getMindRecoveryAnalytics: () => MindRecoveryAnalytics;
  
  // 🧠 9-CATEGORY PAHM ANALYTICS
  getPAHMData: () => PAHMAnalytics | null;
  getEnvironmentData: () => EnvironmentAnalytics;
  getProgressTrends: () => any;
  getComprehensiveAnalytics: () => any;
  getPredictiveInsights: () => any;
  exportDataForAnalysis: () => any;
  
  // 📊 DASHBOARD ANALYTICS - ALL TABS SUPPORT
  getFilteredData: (timeRange?: string) => { practice: PracticeSessionData[], notes: EmotionalNoteData[] };
  getPracticeDurationData: (timeRange?: string) => { date: string, duration: number }[];
  getEmotionDistribution: (timeRange?: string) => { emotion: string, count: number, color: string }[];
  getPracticeDistribution: (timeRange?: string) => { stage: string, count: number }[];
  getAppUsagePatterns: () => any;
  getEngagementMetrics: () => any;
  getFeatureUtilization: () => any;
  getComprehensiveStats: () => any;
  get9CategoryPAHMInsights: () => any;
  getMindRecoveryInsights: () => any;
  
  // Auth integration methods
  syncWithAuthContext: () => void;
  getOnboardingStatusFromAuth: () => { questionnaire: boolean; assessment: boolean };
  
  // Data manipulation
  addPracticeSession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
  addEmotionalNote: (note: Omit<EmotionalNoteData, 'noteId'>) => void;
  addReflection: (reflection: Omit<ReflectionData, 'reflectionId'>) => void;
  addMindRecoverySession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
}

// 🔧 CREATE CONTEXT
const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

// 🚀 ENHANCED PROVIDER WITH IMPROVED AUTO-REFRESH + DATA CONSISTENCY
export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData } = useAuth();
  const [userData, setUserData] = useState<ComprehensiveUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✨ ENHANCED AUTO-REFRESH MECHANISM 
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🔥 ENHANCED AUTOMATIC REFRESH FUNCTION
  const triggerAutoRefresh = useCallback(() => {
    setRefreshTrigger(prev => {
      const newTrigger = prev + 1;
      console.log(`🔄 Auto-refresh triggered #${newTrigger} - all components will update automatically`);
      return newTrigger;
    });
  }, []);

  // 🔥 GENERATE UNIQUE IDS
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 🔥 GET USER STORAGE KEY
  const getStorageKey = (): string => {
    return currentUser?.uid ? `comprehensiveUserData_${currentUser.uid}` : 'comprehensiveUserData';
  };

  // 🔥 CLEAR ALL DATA
  const clearAllData = () => {
    setUserData(null);
    localStorage.removeItem(getStorageKey());
    triggerAutoRefresh();
    console.log('🗑️ All data cleared and auto-refresh triggered!');
  };

  // 🔥 LOAD DATA FROM STORAGE
  const loadDataFromStorage = useCallback(() => {
    try {
      setIsLoading(true);
      const storedData = localStorage.getItem(getStorageKey());
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        console.log('📊 Data loaded from storage');
      } else {
        // Initialize empty user data structure
        const emptyData: ComprehensiveUserData = {
          profile: {
            userId: currentUser?.uid || 'guest',
            displayName: currentUser?.displayName || 'User',
            email: currentUser?.email || '',
            totalSessions: 0,
            totalMinutes: 0,
            currentStreak: 0,
            longestStreak: 0,
            averageQuality: 0,
            averagePresentPercentage: 0,
            totalMindRecoverySessions: 0,
            totalMindRecoveryMinutes: 0,
            averageMindRecoveryRating: 0,
            currentProgress: {
              currentStage: 1,
              currentTLevel: "Beginner",
              totalSessions: 0,
              totalMinutes: 0,
              longestStreak: 0,
              currentStreak: 0,
              averageQuality: 0,
              averagePresentPercentage: 0
            },
            preferences: {
              defaultSessionDuration: 20,
              reminderEnabled: true,
              favoriteStages: [1, 2],
              optimalPracticeTime: "morning",
              notifications: {
                dailyReminder: true,
                streakReminder: true,
                weeklyProgress: true
              }
            }
          },
          practiceSessions: [],
          emotionalNotes: [],
          reflections: [],
          analytics: {
            totalPracticeTime: 0,
            averageSessionLength: 0,
            consistencyScore: 0,
            progressTrend: 'stable',
            lastUpdated: new Date().toISOString()
          }
        };
        setUserData(emptyData);
        saveDataToStorage(emptyData);
      }
      triggerAutoRefresh();
    } catch (error) {
      console.error('Error loading data from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email]);

  // 🔥 ENHANCED SAVE DATA TO STORAGE WITH BETTER AUTO-UPDATE
  const saveDataToStorage = useCallback((data: ComprehensiveUserData) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      console.log('💾 Data auto-saved to storage');
      
      // 🔧 FIXED: Auto-sync with auth context - removed parameter
      if (currentUser && syncWithLocalData) {
        syncWithLocalData();
      }
      
      // ✅ CRITICAL: Trigger auto-refresh AFTER save to ensure components update
      setTimeout(() => {
        triggerAutoRefresh();
      }, 50); // Small delay to ensure save completes
      
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  }, [getStorageKey, currentUser, syncWithLocalData, triggerAutoRefresh]);

  // 🔥 ENHANCED DATA GETTERS - All depend on refreshTrigger for automatic updates
  const getPracticeSessions = useCallback((): PracticeSessionData[] => {
    const sessions = userData?.practiceSessions || [];
    console.log(`📊 getPracticeSessions called - returning ${sessions.length} sessions (refresh #${refreshTrigger})`);
    return sessions;
  }, [userData?.practiceSessions, refreshTrigger]);

  const getDailyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    const notes = userData?.emotionalNotes || [];
    console.log(`💝 getDailyEmotionalNotes called - returning ${notes.length} notes (refresh #${refreshTrigger})`);
    return notes;
  }, [userData?.emotionalNotes, refreshTrigger]);

  const getReflections = useCallback((): ReflectionData[] => {
    return userData?.reflections || [];
  }, [userData?.reflections, refreshTrigger]);

  const getMindRecoverySessions = useCallback((): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(session => session.sessionType === 'mind_recovery') || [];
  }, [userData?.practiceSessions, refreshTrigger]);

  const getMeditationSessions = useCallback((): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(session => session.sessionType === 'meditation') || [];
  }, [userData?.practiceSessions, refreshTrigger]);

  // 🧠 ENHANCED 9-CATEGORY PAHM ANALYTICS with better data validation
  const getPAHMData = useCallback((): PAHMAnalytics | null => {
    const sessions = getPracticeSessions().filter(session => session.pahmCounts);
    
    if (sessions.length === 0) {
      console.log('🧠 No PAHM data found');
      return null;
    }

    console.log(`🧠 Analyzing PAHM data from ${sessions.length} sessions`);

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

    sessions.forEach(session => {
      if (session.pahmCounts) {
        Object.keys(totalPAHM).forEach(key => {
          const value = session.pahmCounts![key as keyof typeof session.pahmCounts] || 0;
          totalPAHM[key as keyof typeof totalPAHM] += value;
        });
      }
    });

    const totalCounts = Object.values(totalPAHM).reduce((sum, count) => sum + count, 0);
    console.log(`🧠 Total PAHM observations: ${totalCounts}`);
    
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

    return {
      totalPAHM,
      totalCounts,
      timeDistribution,
      emotionalDistribution,
      presentPercentage,
      neutralPercentage,
      sessionsAnalyzed: sessions.length,
      totalObservations: totalCounts
    };
  }, [getPracticeSessions, refreshTrigger]);

  // 🌿 ENVIRONMENT ANALYTICS - Auto-refreshing
  const getEnvironmentData = useCallback((): EnvironmentAnalytics => {
    const sessions = getPracticeSessions().filter(session => session.environment);
    
    const groupByEnvironmentFactor = (factor: 'posture' | 'location' | 'lighting' | 'sounds') => {
      const groups: { [key: string]: { ratings: number[], presents: number[], count: number } } = {};
      
      sessions.forEach(session => {
        if (session.environment && session.environment[factor]) {
          const value = session.environment[factor];
          if (!groups[value]) {
            groups[value] = { ratings: [], presents: [], count: 0 };
          }
          if (session.rating) groups[value].ratings.push(session.rating);
          if (session.presentPercentage) groups[value].presents.push(session.presentPercentage);
          groups[value].count++;
        }
      });

      return Object.entries(groups)
        .map(([name, data]) => ({
          name,
          count: data.count,
          avgRating: data.ratings.length > 0 ? Math.round((data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length) * 10) / 10 : 0,
          avgPresent: data.presents.length > 0 ? Math.round((data.presents.reduce((sum, p) => sum + p, 0) / data.presents.length) * 10) / 10 : 0
        }))
        .sort((a, b) => b.avgRating - a.avgRating);
    };

    return {
      posture: groupByEnvironmentFactor('posture'),
      location: groupByEnvironmentFactor('location'),
      lighting: groupByEnvironmentFactor('lighting'),
      sounds: groupByEnvironmentFactor('sounds')
    };
  }, [getPracticeSessions, refreshTrigger]);

  // 🕐 MIND RECOVERY ANALYTICS - Auto-refreshing
  const getMindRecoveryAnalytics = useCallback((): MindRecoveryAnalytics => {
    const mindRecoverySessions = getMindRecoverySessions();
    
    const contextStats = mindRecoverySessions.reduce((acc: any[], session) => {
      if (session.mindRecoveryContext) {
        const existing = acc.find(item => item.context === session.mindRecoveryContext);
        if (existing) {
          existing.count++;
          existing.ratings.push(session.rating || 0);
          existing.durations.push(session.duration);
        } else {
          acc.push({
            context: session.mindRecoveryContext,
            count: 1,
            ratings: [session.rating || 0],
            durations: [session.duration]
          });
        }
      }
      return acc;
    }, []).map(item => ({
      context: item.context,
      count: item.count,
      avgRating: Math.round((item.ratings.reduce((sum: number, r: number) => sum + r, 0) / item.ratings.length) * 10) / 10,
      avgDuration: Math.round((item.durations.reduce((sum: number, d: number) => sum + d, 0) / item.durations.length) * 10) / 10
    })).sort((a, b) => b.avgRating - a.avgRating);

    const purposeStats = mindRecoverySessions.reduce((acc: any[], session) => {
      if (session.mindRecoveryPurpose) {
        const existing = acc.find(item => item.purpose === session.mindRecoveryPurpose);
        if (existing) {
          existing.count++;
          existing.ratings.push(session.rating || 0);
          existing.durations.push(session.duration);
        } else {
          acc.push({
            purpose: session.mindRecoveryPurpose,
            count: 1,
            ratings: [session.rating || 0],
            durations: [session.duration]
          });
        }
      }
      return acc;
    }, []).map(item => ({
      purpose: item.purpose,
      count: item.count,
      avgRating: Math.round((item.ratings.reduce((sum: number, r: number) => sum + r, 0) / item.ratings.length) * 10) / 10,
      avgDuration: Math.round((item.durations.reduce((sum: number, d: number) => sum + d, 0) / item.durations.length) * 10) / 10
    })).sort((a, b) => b.avgRating - a.avgRating);

    const totalMinutes = mindRecoverySessions.reduce((sum, session) => sum + session.duration, 0);
    const avgRating = mindRecoverySessions.length > 0 
      ? Math.round((mindRecoverySessions.reduce((sum, session) => sum + (session.rating || 0), 0) / mindRecoverySessions.length) * 10) / 10
      : 0;
    const avgDuration = mindRecoverySessions.length > 0 
      ? Math.round((totalMinutes / mindRecoverySessions.length) * 10) / 10
      : 0;

    return {
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalMindRecoveryMinutes: totalMinutes,
      avgMindRecoveryRating: avgRating,
      avgMindRecoveryDuration: avgDuration,
      contextStats,
      purposeStats,
      highestRatedContext: contextStats.length > 0 ? { name: contextStats[0].context, rating: contextStats[0].avgRating } : undefined,
      mostUsedContext: contextStats.length > 0 ? { name: contextStats.sort((a, b) => b.count - a.count)[0].context, count: contextStats.sort((a, b) => b.count - a.count)[0].count } : undefined
    };
  }, [getMindRecoverySessions, refreshTrigger]);

  // 📊 ENHANCED COMPREHENSIVE ANALYTICS with better streak calculation
  const getAnalyticsData = useCallback((): ComprehensiveAnalytics => {
    const allSessions = getPracticeSessions();
    const meditationSessions = getMeditationSessions();
    const mindRecoverySessions = getMindRecoverySessions();
    const emotionalNotes = getDailyEmotionalNotes();
    
    console.log(`📊 Calculating analytics for ${allSessions.length} total sessions`);
    
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const avgSessionLength = allSessions.length > 0 ? Math.round((totalMinutes / allSessions.length) * 10) / 10 : 0;
    const avgQuality = allSessions.length > 0 
      ? Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / allSessions.length) * 10) / 10 
      : 0;
    const avgPresent = allSessions.length > 0 
      ? Math.round((allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / allSessions.length) * 10) / 10 
      : 0;

    // ✅ ENHANCED STREAK CALCULATION - More accurate
    const sortedSessions = allSessions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    if (sortedSessions.length > 0) {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      
      const lastSessionDate = new Date(sortedSessions[0].timestamp);
      const daysDiff = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 1) { // Session today or yesterday
        currentStreak = 1;
        tempStreak = 1;
        
        // Check consecutive days
        const sessionDates = new Set<string>();
        sortedSessions.forEach(session => {
          const dateStr = new Date(session.timestamp).toDateString();
          sessionDates.add(dateStr);
        });
        
        const uniqueDates = Array.from(sessionDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        
        for (let i = 1; i < uniqueDates.length; i++) {
          const currentDate = new Date(uniqueDates[i - 1]);
          const prevDate = new Date(uniqueDates[i]);
          const diff = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diff === 1) {
            currentStreak++;
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak);
      }
    }

    const progressTrend: 'improving' | 'stable' | 'declining' = 
      avgQuality >= 8 ? 'improving' : avgQuality >= 6 ? 'stable' : 'improving';

    const analytics: ComprehensiveAnalytics = {
      totalSessions: allSessions.length,
      totalMeditationSessions: meditationSessions.length,
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalPracticeTime: totalMinutes,
      averageSessionLength: avgSessionLength,
      averageQuality: avgQuality,
      averagePresentPercentage: avgPresent,
      currentStreak: currentStreak,
      longestStreak: longestStreak,
      emotionalNotesCount: emotionalNotes.length,
      consistencyScore: allSessions.length > 0 ? Math.min(100, Math.round((currentStreak / 30) * 100)) : 0,
      progressTrend,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Analytics calculated:', analytics);
    return analytics;
  }, [getPracticeSessions, getMeditationSessions, getMindRecoverySessions, getDailyEmotionalNotes, refreshTrigger]);

  // 🔮 PREDICTIVE INSIGHTS
  const getPredictiveInsights = useCallback(() => {
    const sessions = getPracticeSessions();
    if (sessions.length < 5) return null;

    const recentSessions = sessions.slice(-10);
    const avgDuration = recentSessions.reduce((sum, s) => sum + s.duration, 0) / recentSessions.length;
    const avgRating = recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length;
    
    // Analyze time patterns
    const timePatterns = recentSessions.reduce((acc: any, session) => {
      const hour = new Date(session.timestamp).getHours();
      const timeSlot = hour < 6 ? 'early-morning' : 
                     hour < 12 ? 'morning' : 
                     hour < 18 ? 'afternoon' : 'evening';
      
      if (!acc[timeSlot]) acc[timeSlot] = { count: 0, totalRating: 0 };
      acc[timeSlot].count++;
      acc[timeSlot].totalRating += session.rating || 0;
      return acc;
    }, {});

    const bestTimeSlot = Object.entries(timePatterns)
      .map(([time, data]: [string, any]) => ({ time, avgRating: data.totalRating / data.count }))
      .sort((a, b) => b.avgRating - a.avgRating)[0];

    return {
      optimalSessionLength: Math.round(avgDuration),
      bestPracticeTime: bestTimeSlot?.time || 'morning',
      streakProbability: Math.min(95, Math.round(avgRating * 10)),
      qualityTrend: avgRating >= 8 ? 'excellent' : avgRating >= 6 ? 'good' : 'developing'
    };
  }, [getPracticeSessions, refreshTrigger]);

  // 📈 PROGRESS TRENDS
  const getProgressTrends = useCallback(() => {
    const sessions = getPracticeSessions();
    if (sessions.length < 3) return null;

    const recentSessions = sessions.slice(-7);
    const olderSessions = sessions.slice(-14, -7);

    const recentAvgRating = recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length;
    const olderAvgRating = olderSessions.length > 0 
      ? olderSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / olderSessions.length 
      : recentAvgRating;

    const recentAvgPresent = recentSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / recentSessions.length;
    const olderAvgPresent = olderSessions.length > 0 
      ? olderSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / olderSessions.length 
      : recentAvgPresent;

    return {
      qualityTrend: recentAvgRating > olderAvgRating ? 'improving' : recentAvgRating < olderAvgRating ? 'declining' : 'stable',
      presentTrend: recentAvgPresent > olderAvgPresent ? 'improving' : recentAvgPresent < olderAvgPresent ? 'declining' : 'stable',
      qualityChange: Math.round((recentAvgRating - olderAvgRating) * 10) / 10,
      presentChange: Math.round((recentAvgPresent - olderAvgPresent) * 10) / 10
    };
  }, [getPracticeSessions, refreshTrigger]);

  // 📊 COMPREHENSIVE ANALYTICS FOR EXPORT
  const getComprehensiveAnalytics = useCallback(() => {
    return {
      basicAnalytics: getAnalyticsData(),
      pahmAnalytics: getPAHMData(),
      environmentAnalytics: getEnvironmentData(),
      mindRecoveryAnalytics: getMindRecoveryAnalytics(),
      predictiveInsights: getPredictiveInsights(),
      progressTrends: getProgressTrends()
    };
  }, [getAnalyticsData, getPAHMData, getEnvironmentData, getMindRecoveryAnalytics, getPredictiveInsights, getProgressTrends, refreshTrigger]);

  // 📤 EXPORT DATA FOR ANALYSIS
  const exportDataForAnalysis = useCallback(() => {
    return {
      userData,
      analytics: getComprehensiveAnalytics(),
      exportTimestamp: new Date().toISOString(),
      version: 'production-complete-v1.0'
    };
  }, [userData, getComprehensiveAnalytics, refreshTrigger]);

  // 📊 DASHBOARD ANALYTICS - ALL TABS SUPPORT
  
  // Filter data based on time range
  const getFilteredData = useCallback((timeRange: string = 'month') => {
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 1);
    }
    
    const practice = getPracticeSessions().filter(session => new Date(session.timestamp) >= cutoffDate);
    const notes = getDailyEmotionalNotes().filter(note => new Date(note.timestamp) >= cutoffDate);
    
    console.log(`📊 Filtered data for ${timeRange}: ${practice.length} sessions, ${notes.length} notes`);
    return { practice, notes };
  }, [getPracticeSessions, getDailyEmotionalNotes, refreshTrigger]);

  // Get practice duration trend data
  const getPracticeDurationData = useCallback((timeRange: string = 'month') => {
    const { practice } = getFilteredData(timeRange);
    
    if (practice.length === 0) return [];
    
    const durationByDate: {[key: string]: number} = {};
    practice.forEach(session => {
      const dateKey = new Date(session.timestamp).toLocaleDateString();
      durationByDate[dateKey] = (durationByDate[dateKey] || 0) + session.duration;
    });
    
    const sortedDates = Object.keys(durationByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    
    return sortedDates.map(date => ({
      date,
      duration: durationByDate[date]
    }));
  }, [getFilteredData, refreshTrigger]);

  // Get emotion distribution
  const getEmotionDistribution = useCallback((timeRange: string = 'month') => {
    const { notes } = getFilteredData(timeRange);
    const emotionCounts: {[key: string]: number} = {};
    
    notes.forEach(note => {
      const emotion = note.emotion || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    const getEmotionColor = (emotion: string): string => {
      const colors: {[key: string]: string} = {
        joy: '#FFD700', joyful: '#FFD700', content: '#90EE90', peaceful: '#87CEEB',
        relieved: '#98FB98', satisfied: '#DDA0DD', amazed: '#FF69B4', serene: '#B0E0E6',
        ecstatic: '#FF6347', transformed: '#9370DB', energized: '#32CD32', connected: '#20B2AA',
        focused: '#4169E1', blissful: '#DA70D6', accomplished: '#228B22', clear: '#00CED1',
        nurtured: '#DDA0DD', transcendent: '#8A2BE2', balanced: '#32CD32', integrated: '#4682B4',
        profound: '#800080', refreshed: '#00FA9A', loving: '#FF1493', grateful: '#FFA500',
        centered: '#6495ED', sadness: '#6495ED', anger: '#FF6347', fear: '#9370DB', neutral: '#A9A9A9',
        reflective: '#9370DB'
      };
      return colors[emotion.toLowerCase()] || '#A9A9A9';
    };
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      color: getEmotionColor(emotion)
    }));
  }, [getFilteredData, refreshTrigger]);

  // Get practice distribution by stage
  const getPracticeDistribution = useCallback((timeRange: string = 'month') => {
    const { practice } = getFilteredData(timeRange);
    
    if (practice.length === 0) return [];
    
    const countByStage: {[key: string]: number} = {};
    practice.forEach(session => {
      const stageKey = session.stageLevel 
        ? `Stage ${session.stageLevel}`
        : session.mindRecoveryContext
        ? 'Mind Recovery'
        : 'Unknown';
      countByStage[stageKey] = (countByStage[stageKey] || 0) + 1;
    });
    
    return Object.entries(countByStage).map(([stage, count]) => ({
      stage,
      count
    }));
  }, [getFilteredData, refreshTrigger]);

  // Get app usage patterns
  const getAppUsagePatterns = useCallback(() => {
    const practice = getPracticeSessions();
    
    // Session timing analysis
    const timeOfDayStats: {[key: string]: number} = {};
    const dayOfWeekStats: {[key: string]: number} = {};
    const sessionLengthDistribution: {[key: string]: number} = {};
    
    practice.forEach(session => {
      const date = new Date(session.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      // Time of day categorization
      let timeCategory = '';
      if (hour >= 5 && hour < 9) timeCategory = 'Early Morning (5-9 AM)';
      else if (hour >= 9 && hour < 12) timeCategory = 'Morning (9-12 PM)';
      else if (hour >= 12 && hour < 17) timeCategory = 'Afternoon (12-5 PM)';
      else if (hour >= 17 && hour < 21) timeCategory = 'Evening (5-9 PM)';
      else timeCategory = 'Night (9 PM-5 AM)';
      
      timeOfDayStats[timeCategory] = (timeOfDayStats[timeCategory] || 0) + 1;
      dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
      
      // Session length categorization
      let lengthCategory = '';
      if (session.duration <= 5) lengthCategory = '1-5 minutes';
      else if (session.duration <= 15) lengthCategory = '6-15 minutes';
      else if (session.duration <= 30) lengthCategory = '16-30 minutes';
      else lengthCategory = '30+ minutes';
      
      sessionLengthDistribution[lengthCategory] = (sessionLengthDistribution[lengthCategory] || 0) + 1;
    });
    
    return {
      timeOfDayStats,
      dayOfWeekStats,
      sessionLengthDistribution,
      totalSessions: practice.length,
      averageSessionsPerWeek: Math.round((practice.length / 4) * 10) / 10,
      consistency: practice.length > 20 ? 'High' : practice.length > 10 ? 'Medium' : 'Low'
    };
  }, [getPracticeSessions, refreshTrigger]);

  // Get engagement metrics
  const getEngagementMetrics = useCallback(() => {
    const practice = getPracticeSessions();
    const notes = getDailyEmotionalNotes();
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const lastWeekSessions = practice.filter(s => new Date(s.timestamp) >= weekAgo).length;
    const lastMonthSessions = practice.filter(s => new Date(s.timestamp) >= monthAgo).length;
    
    const avgSessionQuality = practice.length > 0 
      ? practice.reduce((sum, s) => sum + (s.rating || 0), 0) / practice.length 
      : 0;
    const notesPerSession = practice.length > 0 ? notes.length / practice.length : 0;
    
    return {
      weeklyFrequency: lastWeekSessions,
      monthlyFrequency: lastMonthSessions,
      averageQuality: Math.round(avgSessionQuality * 10) / 10,
      engagementLevel: avgSessionQuality >= 8 ? 'High' : avgSessionQuality >= 6 ? 'Medium' : 'Low',
      notesPerSession: Math.round(notesPerSession * 10) / 10,
      documentationHabit: notesPerSession >= 0.5 ? 'Excellent' : notesPerSession >= 0.25 ? 'Good' : 'Basic'
    };
  }, [getPracticeSessions, getDailyEmotionalNotes, refreshTrigger]);

  // Get feature utilization
  const getFeatureUtilization = useCallback(() => {
    const practice = getPracticeSessions();
    const notes = getDailyEmotionalNotes();
    
    const features = {
      meditation: practice.filter(s => s.sessionType === 'meditation').length,
      mindRecovery: practice.filter(s => s.sessionType === 'mind_recovery').length,
      emotionalNotes: notes.length,
      environmentTracking: practice.filter(s => s.environment).length,
      pahmTracking: practice.filter(s => s.pahmCounts).length,
      ratings: practice.filter(s => s.rating).length,
      personalNotes: practice.filter(s => s.notes).length
    };
    
    const totalFeatureUses = Object.values(features).reduce((sum, count) => sum + count, 0);
    
    return Object.entries(features).map(([feature, count]) => ({
      feature: feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      count,
      percentage: totalFeatureUses > 0 ? Math.round((count / totalFeatureUses) * 100) : 0
    })).sort((a, b) => b.count - a.count);
  }, [getPracticeSessions, getDailyEmotionalNotes, refreshTrigger]);

  // Get comprehensive statistics for overview
  const getComprehensiveStats = useCallback(() => {
    const practice = getPracticeSessions();
    const notes = getDailyEmotionalNotes();
    
    if (practice.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageRating: 0,
        averageDuration: 0,
        averagePresent: 0,
        meditationSessions: 0,
        mindRecoverySessions: 0,
        mindRecoveryUsage: 0,
        totalEmotionalNotes: 0,
        mostCommonEmotion: 'N/A',
        averageEnergyLevel: 0
      };
    }
    
    const totalMinutes = practice.reduce((sum, s) => sum + s.duration, 0);
    const averageRating = practice.reduce((sum, s) => sum + (s.rating || 0), 0) / practice.length;
    const averageDuration = totalMinutes / practice.length;
    const averagePresent = practice.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / practice.length;
    
    const meditationSessions = practice.filter(s => s.sessionType === 'meditation').length;
    const mindRecoverySessions = practice.filter(s => s.sessionType === 'mind_recovery').length;
    const mindRecoveryUsage = Math.round((mindRecoverySessions / practice.length) * 100);
    
    const emotionCounts: {[key: string]: number} = {};
    let totalEnergyLevel = 0;
    let energyLevelCount = 0;
    
    notes.forEach(note => {
      const emotion = note.emotion || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      
      if (note.energyLevel) {
        totalEnergyLevel += note.energyLevel;
        energyLevelCount++;
      }
    });
    
    const mostCommonEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      emotionCounts[a[0]] > emotionCounts[b[0]] ? a : b, ['neutral', 0])[0];
    
    return {
      totalSessions: practice.length,
      totalMinutes,
      averageRating: Math.round(averageRating * 10) / 10,
      averageDuration: Math.round(averageDuration),
      averagePresent: Math.round(averagePresent),
      meditationSessions,
      mindRecoverySessions,
      mindRecoveryUsage,
      totalEmotionalNotes: notes.length,
      mostCommonEmotion: mostCommonEmotion.charAt(0).toUpperCase() + mostCommonEmotion.slice(1),
      averageEnergyLevel: energyLevelCount > 0 ? Math.round((totalEnergyLevel / energyLevelCount) * 10) / 10 : 0
    };
  }, [getPracticeSessions, getDailyEmotionalNotes, refreshTrigger]);

  // Get 9-Category PAHM insights (alias for dashboard compatibility)
  const get9CategoryPAHMInsights = useCallback(() => {
    return getPAHMData();
  }, [getPAHMData, refreshTrigger]);

  // Get Mind Recovery insights (alias for dashboard compatibility)
  const getMindRecoveryInsights = useCallback(() => {
    const mindRecoverySessions = getMindRecoverySessions();
    
    if (mindRecoverySessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageRating: 0,
        averageDuration: 0,
        techniques: []
      };
    }
    
    const totalMinutes = mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0);
    const averageRating = mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / mindRecoverySessions.length;
    const averageDuration = totalMinutes / mindRecoverySessions.length;
    
    // Analyze techniques
    const techniqueStats: {[key: string]: {count: number, totalDuration: number, avgRating: number}} = {};
    
    mindRecoverySessions.forEach(session => {
      const technique = session.mindRecoveryContext || 'Unknown';
      if (!techniqueStats[technique]) {
        techniqueStats[technique] = {count: 0, totalDuration: 0, avgRating: 0};
      }
      techniqueStats[technique].count++;
      techniqueStats[technique].totalDuration += session.duration;
      techniqueStats[technique].avgRating = 
        (techniqueStats[technique].avgRating * (techniqueStats[technique].count - 1) + (session.rating || 0)) / techniqueStats[technique].count;
    });
    
    const techniques = Object.entries(techniqueStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        totalDuration: stats.totalDuration,
        avgDuration: Math.round(stats.totalDuration / stats.count),
        avgRating: Math.round(stats.avgRating * 10) / 10
      }))
      .sort((a, b) => b.avgRating - a.avgRating);
    
    return {
      totalSessions: mindRecoverySessions.length,
      totalMinutes,
      averageRating: Math.round(averageRating * 10) / 10,
      averageDuration: Math.round(averageDuration),
      techniques
    };
  }, [getMindRecoverySessions, refreshTrigger]);

  // 🔥 ENHANCED DATA MANIPULATION METHODS - Improved validation and auto-refresh
  const addPracticeSession = useCallback((session: Omit<PracticeSessionData, 'sessionId'>) => {
    if (!userData) {
      console.error('❌ Cannot add session - userData is null');
      return;
    }

    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session')
    };

    console.log('💾 Adding practice session:', {
      sessionId: newSession.sessionId,
      stageLevel: newSession.stageLevel,
      sessionType: newSession.sessionType,
      duration: newSession.duration,
      pahmCounts: newSession.pahmCounts
    });

    const updatedData = {
      ...userData,
      practiceSessions: [...userData.practiceSessions, newSession],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    // Update profile stats
    const allSessions = updatedData.practiceSessions;
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgQuality = allSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / allSessions.length;
    const avgPresent = allSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / allSessions.length;

    updatedData.profile = {
      ...updatedData.profile,
      totalSessions: allSessions.length,
      totalMinutes: totalMinutes,
      averageQuality: Math.round(avgQuality * 10) / 10,
      averagePresentPercentage: Math.round(avgPresent)
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log('✅ Practice session added successfully - auto-refresh will trigger');
  }, [userData, saveDataToStorage]);

  const addMindRecoverySession = useCallback((session: Omit<PracticeSessionData, 'sessionId'>) => {
    const mindRecoverySession: Omit<PracticeSessionData, 'sessionId'> = {
      ...session,
      sessionType: 'mind_recovery'
    };
    addPracticeSession(mindRecoverySession);
  }, [addPracticeSession]);

  const addEmotionalNote = useCallback((note: Omit<EmotionalNoteData, 'noteId'>) => {
    if (!userData) {
      console.error('❌ Cannot add note - userData is null');
      return;
    }

    const newNote: EmotionalNoteData = {
      ...note,
      noteId: generateId('note')
    };

    console.log('💝 Adding emotional note:', {
      noteId: newNote.noteId,
      emotion: newNote.emotion,
      contentLength: newNote.content.length
    });

    const updatedData = {
      ...userData,
      emotionalNotes: [...userData.emotionalNotes, newNote],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log('✅ Emotional note added successfully - auto-refresh will trigger');
  }, [userData, saveDataToStorage]);

  const addReflection = useCallback((reflection: Omit<ReflectionData, 'reflectionId'>) => {
    if (!userData) {
      console.error('❌ Cannot add reflection - userData is null');
      return;
    }

    const newReflection: ReflectionData = {
      ...reflection,
      reflectionId: generateId('reflection')
    };

    const updatedData = {
      ...userData,
      reflections: [...userData.reflections, newReflection],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log('✅ Reflection added successfully - auto-refresh will trigger');
  }, [userData, saveDataToStorage]);

  // 🔄 AUTH INTEGRATION
  const syncWithAuthContext = useCallback(() => {
    if (currentUser && syncWithLocalData) {
      // 🔧 FIXED: Removed parameter from syncWithLocalData call
      syncWithLocalData();
    }
  }, [currentUser, syncWithLocalData]);

  const getOnboardingStatusFromAuth = useCallback(() => {
    return {
      questionnaire: currentUser?.questionnaireCompleted || false,
      assessment: currentUser?.assessmentCompleted || false
    };
  }, [currentUser]);

  // 🔄 LOAD DATA ON MOUNT AND USER CHANGE
  useEffect(() => {
    loadDataFromStorage();
  }, [loadDataFromStorage]);

  // 🔄 AUTOMATIC DATA SYNC
  useEffect(() => {
    if (userData && currentUser && syncWithLocalData) {
      // 🔧 FIXED: Removed parameter from syncWithLocalData call
      syncWithLocalData();
    }
  }, [userData, currentUser, syncWithLocalData]);

  // 🎯 COMPLETE CONTEXT VALUE - ALL FUNCTIONALITY + ENHANCED AUTO-REFRESH
  const contextValue: LocalDataContextType = {
    userData,
    isLoading,
    refreshTrigger, // ✨ Expose refresh trigger for component updates
    
    // Core methods
    clearAllData,
    
    // Data getters (all auto-refreshing via refreshTrigger)
    getPracticeSessions,
    getDailyEmotionalNotes,
    getReflections,
    getAnalyticsData,
    
    // Mind recovery specific
    getMindRecoverySessions,
    getMeditationSessions,
    getMindRecoveryAnalytics,
    
    // 9-Category PAHM Analytics
    getPAHMData,
    getEnvironmentData,
    getProgressTrends,
    getComprehensiveAnalytics,
    getPredictiveInsights,
    exportDataForAnalysis,
    
    // Dashboard Analytics - ALL TABS SUPPORT (all auto-refreshing)
    getFilteredData,
    getPracticeDurationData,
    getEmotionDistribution,
    getPracticeDistribution,
    getAppUsagePatterns,
    getEngagementMetrics,
    getFeatureUtilization,
    getComprehensiveStats,
    get9CategoryPAHMInsights,
    getMindRecoveryInsights,
    
    // Auth integration
    syncWithAuthContext,
    getOnboardingStatusFromAuth,
    
    // Data manipulation (these trigger auto-refresh)
    addPracticeSession,
    addEmotionalNote,
    addReflection,
    addMindRecoverySession
  };

  return (
    <LocalDataContext.Provider value={contextValue}>
      {children}
    </LocalDataContext.Provider>
  );
};

// 🎯 CUSTOM HOOK
export const useLocalData = (): LocalDataContextType => {
  const context = useContext(LocalDataContext);
  if (!context) {
    throw new Error('useLocalData must be used within a LocalDataProvider');
  }
  return context;
};

export default LocalDataContext;