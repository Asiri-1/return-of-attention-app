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
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'mid-day-reset' | 'work-home-transition' | 'evening-wind-down' | 'breathing-reset' | 'thought-labeling' | 'body-scan' | 'single-point-focus' | 'loving-kindness' | 'gratitude-moment' | 'mindful-transition' | 'stress-release';
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
  metadata?: any;
}

interface EmotionalNoteData {
  noteId: string;
  timestamp: string;
  content: string;
  emotion: string;
  energyLevel?: number;
  tags?: string[];
  gratitude?: string[];
  metadata?: any;
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

// ✅ FIXED: Complete Questionnaire Data Interface
interface QuestionnaireData {
  completed: boolean;
  completedAt?: string;
  responses: {
    // Demographics & Background (1-7)
    experience_level: number;
    goals: string[];
    age_range: string;
    location: string;
    occupation: string;
    education_level: string;
    meditation_background: string;
    
    // Lifestyle Patterns (8-15)  
    sleep_pattern: number;
    physical_activity: string;
    stress_triggers: string[];
    daily_routine: string;
    diet_pattern: string;
    screen_time: string;
    social_connections: string;
    work_life_balance: string;
    
    // Thinking Patterns (16-21)
    emotional_awareness: number;
    stress_response: string;
    decision_making: string;
    self_reflection: string;
    thought_patterns: string;
    mindfulness_in_daily_life: string;
    
    // Mindfulness Specific (22-27)
    mindfulness_experience: number;
    meditation_background_detail: string;
    practice_goals: string;
    preferred_duration: number;
    biggest_challenges: string;
    motivation: string;
    
    // Additional fields
    totalQuestions: number;
    answeredQuestions: number;
    [key: string]: any;
  };
}

// ✅ FIXED: Complete Self-Assessment Data Interface with ALL compatibility formats
interface SelfAssessmentData {
  // Completion status
  completed: boolean;
  completedAt?: string;
  
  // Format identifiers
  format?: 'standard' | string;
  version?: string;
  type?: 'selfAssessment' | string;
  
  // Direct category values (for simple access)
  taste: 'none' | 'some' | 'strong';
  smell: 'none' | 'some' | 'strong';
  sound: 'none' | 'some' | 'strong';
  sight: 'none' | 'some' | 'strong';
  touch: 'none' | 'some' | 'strong';
  mind: 'none' | 'some' | 'strong';
  
  // Categories object format (for LocalDataContext compatibility)
  categories: {
    taste: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    smell: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    sound: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    sight: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    touch: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    mind: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
  };
  
  // ✅ ESSENTIAL: Responses object (for happiness calculator compatibility)
  responses: {
    taste: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    smell: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    sound: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    sight: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    touch: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
    mind: {
      level: 'none' | 'some' | 'strong';
      details?: string;
      category: string;
    };
  };
  
  // Pre-calculated scores at top level (for SelfAssessmentCompletion compatibility)
  attachmentScore: number;
  nonAttachmentCount: number;
  
  // Metrics object (for backward compatibility)
  metrics: {
    nonAttachmentCount: number;
    attachmentScore: number;
    attachmentLevel: string;
  };
  
  // Legacy support (if needed)
  [key: string]: any;
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

// ✅ FIXED: ComprehensiveUserData interface
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
  
  // Questionnaire and Self-Assessment data
  questionnaire?: QuestionnaireData;
  selfAssessment?: SelfAssessmentData;
  
  achievements: string[];
  notes: any[];
  
  analytics: {
    totalPracticeTime: number;
    averageSessionLength: number;
    consistencyScore: number;
    progressTrend: 'improving' | 'stable' | 'declining';
    lastUpdated: string;
  };
}

// ✅ ENHANCED: LocalDataContextType interface WITH all missing direct properties
interface LocalDataContextType {
  userData: ComprehensiveUserData | null;
  isLoading: boolean;
  refreshTrigger: number;
  
  // ✅ CRITICAL: Direct properties for component compatibility
  comprehensiveUserData: ComprehensiveUserData | null;
  practiceSessions: PracticeSessionData[];
  emotionalNotes: EmotionalNoteData[];
  questionnaire: QuestionnaireData | null;
  selfAssessment: SelfAssessmentData | null;
  
  // Core methods
  clearAllData: () => void;
  
  // Data getters
  getPracticeSessions: () => PracticeSessionData[];
  getDailyEmotionalNotes: () => EmotionalNoteData[];
  getReflections: () => ReflectionData[];
  getAnalyticsData: () => ComprehensiveAnalytics;
  
  // Questionnaire and Self-Assessment getters
  getQuestionnaire: () => QuestionnaireData | null;
  getSelfAssessment: () => SelfAssessmentData | null;
  isQuestionnaireCompleted: () => boolean;
  isSelfAssessmentCompleted: () => boolean;
  
  getAchievements: () => string[];
  getNotes: () => any[];
  
  // Mind recovery specific getters
  getMindRecoverySessions: () => PracticeSessionData[];
  getMeditationSessions: () => PracticeSessionData[];
  getMindRecoveryAnalytics: () => MindRecoveryAnalytics;
  
  // 9-Category PAHM Analytics
  getPAHMData: () => PAHMAnalytics | null;
  getEnvironmentData: () => EnvironmentAnalytics;
  getProgressTrends: () => any;
  getComprehensiveAnalytics: () => any;
  getPredictiveInsights: () => any;
  exportDataForAnalysis: () => any;
  
  // Dashboard Analytics
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

  // ✅ FIXED: Questionnaire and Self-Assessment methods
  updateQuestionnaire: (questionnaireData: Omit<QuestionnaireData, 'completed' | 'completedAt'>) => void;
  updateSelfAssessment: (selfAssessmentData: Omit<SelfAssessmentData, 'completed' | 'completedAt'>) => void;
  markQuestionnaireComplete: (responses: any) => void;
  markSelfAssessmentComplete: (responses: any) => void;

  // Achievement methods
  addAchievement: (achievement: string) => void;
  addNote: (note: any) => void;

  // Delete methods for data management
  deleteEmotionalNote: (noteId: string) => void;
  deletePracticeSession: (sessionId: string) => void;
  deleteReflection: (reflectionId: string) => void;

  // Legacy compatibility methods
  getLegacyPracticeHistory: () => PracticeSessionData[];
  getLegacyEmotionalNotes: () => EmotionalNoteData[];
  getLegacyMindRecoveryHistory: () => PracticeSessionData[];
  syncLegacyStorageKeys: () => void;
}

// 🔧 CREATE CONTEXT
const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

// 🚀 ENHANCED PROVIDER WITH COMPLETE FUNCTIONALITY
export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData } = useAuth();
  const [userData, setUserData] = useState<ComprehensiveUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const getStorageKey = useCallback((): string => {
    return currentUser?.uid ? `comprehensiveUserData_${currentUser.uid}` : 'comprehensiveUserData';
  }, [currentUser?.uid]);

  // ✅ LEGACY STORAGE KEY MANAGEMENT
  const getLegacyStorageKeys = useCallback(() => {
    return {
      practiceHistory: 'practiceHistory',
      emotionalNotes: 'emotionalNotes', 
      mindRecoveryHistory: 'mindRecoveryHistory',
      userProfile: currentUser?.uid ? `userProfile_${currentUser.uid}` : 'userProfile',
      questionnaire: 'questionnaire_responses',
      selfAssessment: 'self_assessment_responses'
    };
  }, [currentUser?.uid]);

  // ✅ FIXED: Create empty user data
  const createEmptyUserData = useCallback((): ComprehensiveUserData => {
    return {
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
      questionnaire: undefined,
      selfAssessment: undefined,
      achievements: ['journey_started'],
      notes: [],
      analytics: {
        totalPracticeTime: 0,
        averageSessionLength: 0,
        consistencyScore: 0,
        progressTrend: 'stable',
        lastUpdated: new Date().toISOString()
      }
    };
  }, [currentUser]);

  // 🔥 CLEAR ALL DATA
  const clearAllData = useCallback(() => {
    setUserData(null);
    localStorage.removeItem(getStorageKey());
    
    const legacyKeys = getLegacyStorageKeys();
    Object.values(legacyKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    
    localStorage.removeItem('questionnaire_completed');
    localStorage.removeItem('self_assessment_completed');
    
    triggerAutoRefresh();
    console.log('🗑️ All data cleared and auto-refresh triggered!');
  }, [getStorageKey, getLegacyStorageKeys, triggerAutoRefresh]);

  // ✅ FIXED: Save data to storage
  const saveDataToStorage = useCallback((data: ComprehensiveUserData) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      console.log('💾 Data auto-saved to comprehensive storage');
      
      // Sync with legacy storage keys for component compatibility
      if (currentUser) {
        const legacyKeys = getLegacyStorageKeys();
        
        localStorage.setItem(legacyKeys.practiceHistory, JSON.stringify(data.practiceSessions));
        localStorage.setItem(legacyKeys.emotionalNotes, JSON.stringify(data.emotionalNotes));
        
        const mindRecoverySessions = data.practiceSessions.filter(s => s.sessionType === 'mind_recovery');
        localStorage.setItem(legacyKeys.mindRecoveryHistory, JSON.stringify(mindRecoverySessions));
        
        if (data.questionnaire) {
          localStorage.setItem(legacyKeys.questionnaire, JSON.stringify(data.questionnaire.responses));
          localStorage.setItem('questionnaire_completed', data.questionnaire.completed ? 'true' : 'false');
        }
        
        if (data.selfAssessment) {
          localStorage.setItem(legacyKeys.selfAssessment, JSON.stringify(data.selfAssessment));
          localStorage.setItem('self_assessment_completed', data.selfAssessment.completed ? 'true' : 'false');
        }
      }
      
      // Auto-sync with auth context
      if (currentUser && syncWithLocalData) {
        syncWithLocalData();
      }
      
      setTimeout(() => {
        triggerAutoRefresh();
      }, 50);
      
    } catch (error) {
      console.error('❌ Error saving data to storage:', error);
    }
  }, [getStorageKey, getLegacyStorageKeys, currentUser, syncWithLocalData, triggerAutoRefresh]);

  // 🔥 LOAD DATA FROM STORAGE
  const loadDataFromStorage = useCallback(() => {
    try {
      setIsLoading(true);
      const storedData = localStorage.getItem(getStorageKey());
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        console.log('📊 Data loaded from comprehensive storage');
      } else {
        const emptyData = createEmptyUserData();
        setUserData(emptyData);
        saveDataToStorage(emptyData);
      }
      
      triggerAutoRefresh();
    } catch (error) {
      console.error('❌ Error loading data from storage:', error);
      const emptyData = createEmptyUserData();
      setUserData(emptyData);
      saveDataToStorage(emptyData);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey, createEmptyUserData, saveDataToStorage, triggerAutoRefresh]);

  // 🔥 ENHANCED DATA GETTERS
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
  }, [userData?.reflections]);

  // Questionnaire and Self-Assessment getters
  const getQuestionnaire = useCallback((): QuestionnaireData | null => {
    const questionnaire = userData?.questionnaire || null;
    console.log(`📝 getQuestionnaire called - returning:`, questionnaire?.completed ? 'completed' : 'not completed');
    return questionnaire;
  }, [userData?.questionnaire]);

  const getSelfAssessment = useCallback((): SelfAssessmentData | null => {
    const selfAssessment = userData?.selfAssessment || null;
    console.log(`🧠 getSelfAssessment called - returning:`, selfAssessment?.completed ? 'completed' : 'not completed');
    return selfAssessment;
  }, [userData?.selfAssessment]);

  const isQuestionnaireCompleted = useCallback((): boolean => {
    return userData?.questionnaire?.completed || false;
  }, [userData?.questionnaire?.completed]);

  const isSelfAssessmentCompleted = useCallback((): boolean => {
    return userData?.selfAssessment?.completed || false;
  }, [userData?.selfAssessment?.completed]);

  const getAchievements = useCallback((): string[] => {
    const achievements = userData?.achievements || [];
    console.log(`🏆 getAchievements called - returning ${achievements.length} achievements (refresh #${refreshTrigger})`);
    return achievements;
  }, [userData?.achievements, refreshTrigger]);

  const getNotes = useCallback((): any[] => {
    const notes = userData?.notes || [];
    console.log(`📒 getNotes called - returning ${notes.length} notes (refresh #${refreshTrigger})`);
    return notes;
  }, [userData?.notes, refreshTrigger]);

  const getMindRecoverySessions = useCallback((): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(session => session.sessionType === 'mind_recovery') || [];
  }, [userData?.practiceSessions]);

  const getMeditationSessions = useCallback((): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(session => session.sessionType === 'meditation') || [];
  }, [userData?.practiceSessions]);

  // ✅ FIXED: COMPLETE PAHM ANALYTICS IMPLEMENTATION
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
  }, [getPracticeSessions]);

  // ✅ FIXED: COMPLETE ENVIRONMENT ANALYTICS IMPLEMENTATION
  const getEnvironmentData = useCallback((): EnvironmentAnalytics => {
    const sessions = getPracticeSessions().filter(session => session.environment);
    
    if (sessions.length === 0) {
      return {
        posture: [],
        location: [],
        lighting: [],
        sounds: []
      };
    }

    const analyzeEnvironmentFactor = (factor: keyof NonNullable<PracticeSessionData['environment']>) => {
      const factorData: { [key: string]: { count: number; totalRating: number; totalPresent: number } } = {};
      
      sessions.forEach(session => {
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

      return Object.entries(factorData).map(([name, data]) => ({
        name,
        count: data.count,
        avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
        avgPresent: Math.round(data.totalPresent / data.count)
      })).sort((a, b) => b.count - a.count);
    };

    return {
      posture: analyzeEnvironmentFactor('posture'),
      location: analyzeEnvironmentFactor('location'),
      lighting: analyzeEnvironmentFactor('lighting'),
      sounds: analyzeEnvironmentFactor('sounds')
    };
  }, [getPracticeSessions]);

  // ✅ FIXED: COMPLETE MIND RECOVERY ANALYTICS IMPLEMENTATION
  const getMindRecoveryAnalytics = useCallback((): MindRecoveryAnalytics => {
    const mindRecoverySessions = getMindRecoverySessions();
    
    if (mindRecoverySessions.length === 0) {
      return {
        totalMindRecoverySessions: 0,
        totalMindRecoveryMinutes: 0,
        avgMindRecoveryRating: 0,
        avgMindRecoveryDuration: 0,
        contextStats: [],
        purposeStats: [],
      };
    }

    const totalMinutes = mindRecoverySessions.reduce((sum, session) => sum + session.duration, 0);
    const avgRating = mindRecoverySessions.reduce((sum, session) => sum + (session.rating || 0), 0) / mindRecoverySessions.length;
    const avgDuration = totalMinutes / mindRecoverySessions.length;

    // Analyze contexts
    const contextData: { [key: string]: { count: number; totalRating: number; totalDuration: number } } = {};
    mindRecoverySessions.forEach(session => {
      if (session.mindRecoveryContext) {
        const context = session.mindRecoveryContext;
        if (!contextData[context]) {
          contextData[context] = { count: 0, totalRating: 0, totalDuration: 0 };
        }
        contextData[context].count++;
        contextData[context].totalRating += session.rating || 0;
        contextData[context].totalDuration += session.duration;
      }
    });

    const contextStats = Object.entries(contextData).map(([context, data]) => ({
      context,
      count: data.count,
      avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
      avgDuration: Math.round(data.totalDuration / data.count)
    })).sort((a, b) => b.count - a.count);

    // Analyze purposes
    const purposeData: { [key: string]: { count: number; totalRating: number; totalDuration: number } } = {};
    mindRecoverySessions.forEach(session => {
      if (session.mindRecoveryPurpose) {
        const purpose = session.mindRecoveryPurpose;
        if (!purposeData[purpose]) {
          purposeData[purpose] = { count: 0, totalRating: 0, totalDuration: 0 };
        }
        purposeData[purpose].count++;
        purposeData[purpose].totalRating += session.rating || 0;
        purposeData[purpose].totalDuration += session.duration;
      }
    });

    const purposeStats = Object.entries(purposeData).map(([purpose, data]) => ({
      purpose,
      count: data.count,
      avgRating: Math.round((data.totalRating / data.count) * 10) / 10,
      avgDuration: Math.round(data.totalDuration / data.count)
    })).sort((a, b) => b.count - a.count);

    const highestRatedContext = contextStats.length > 0 ? {
      name: contextStats.reduce((prev, current) => prev.avgRating > current.avgRating ? prev : current).context,
      rating: contextStats.reduce((prev, current) => prev.avgRating > current.avgRating ? prev : current).avgRating
    } : undefined;

    const mostUsedContext = contextStats.length > 0 ? {
      name: contextStats[0].context,
      count: contextStats[0].count
    } : undefined;

    return {
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalMindRecoveryMinutes: totalMinutes,
      avgMindRecoveryRating: Math.round(avgRating * 10) / 10,
      avgMindRecoveryDuration: Math.round(avgDuration),
      contextStats,
      purposeStats,
      highestRatedContext,
      mostUsedContext
    };
  }, [getMindRecoverySessions]);

  // ✅ FIXED: COMPLETE ANALYTICS DATA IMPLEMENTATION
  const getAnalyticsData = useCallback((): ComprehensiveAnalytics => {
    const allSessions = getPracticeSessions();
    const emotionalNotes = getDailyEmotionalNotes();
    const mindRecoverySessions = getMindRecoverySessions();
    
    const totalSessions = allSessions.length;
    const totalMeditationSessions = allSessions.filter(s => s.sessionType === 'meditation').length;
    const totalMindRecoverySessions = mindRecoverySessions.length;
    const totalPracticeTime = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = totalSessions > 0 ? Math.round(totalPracticeTime / totalSessions) : 0;
    const averageQuality = totalSessions > 0 ? 
      Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions) * 10) / 10 : 0;
    const averagePresentPercentage = totalSessions > 0 ?
      Math.round(allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / totalSessions) : 0;
    
    // Calculate streak
    const sortedSessions = [...allSessions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    let currentStreak = 0;
    let longestStreak = 0;
    let currentStreakCount = 0;
    let maxStreakCount = 0;
    
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreakCount) {
        currentStreakCount++;
        if (currentStreak === 0) currentStreak = currentStreakCount;
      } else if (daysDiff > currentStreakCount) {
        if (currentStreakCount > maxStreakCount) {
          maxStreakCount = currentStreakCount;
        }
        break;
      }
    }
    
    longestStreak = Math.max(maxStreakCount, currentStreak);
    
    const consistencyScore = calculateConsistencyScore(allSessions);
    const progressTrend = calculateProgressTrend(allSessions);

    return {
      totalSessions,
      totalMeditationSessions,
      totalMindRecoverySessions,
      totalPracticeTime,
      averageSessionLength,
      averageQuality,
      averagePresentPercentage,
      currentStreak,
      longestStreak,
      emotionalNotesCount: emotionalNotes.length,
      consistencyScore,
      progressTrend,
      lastUpdated: new Date().toISOString()
    };
  }, [getPracticeSessions, getDailyEmotionalNotes, getMindRecoverySessions]);

  // Helper functions for analytics
  const calculateConsistencyScore = (sessions: PracticeSessionData[]): number => {
    if (sessions.length === 0) return 0;
    
    const last30Days = sessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return sessionDate >= thirtyDaysAgo;
    });
    
    const daysWithSessions = new Set(last30Days.map(session => {
      const date = new Date(session.timestamp);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    })).size;
    
    return Math.round((daysWithSessions / 30) * 100);
  };

  const calculateProgressTrend = (sessions: PracticeSessionData[]): 'improving' | 'stable' | 'declining' => {
    if (sessions.length < 10) return 'stable';
    
    const recentSessions = sessions.slice(-5);
    const earlierSessions = sessions.slice(-10, -5);
    
    const recentAvg = recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length;
    const earlierAvg = earlierSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / earlierSessions.length;
    
    const difference = recentAvg - earlierAvg;
    
    if (difference > 0.5) return 'improving';
    if (difference < -0.5) return 'declining';
    return 'stable';
  };

  // ✅ NEW: Dashboard Analytics Methods
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
    
    const practice = getPracticeSessions().filter(session => 
      new Date(session.timestamp) >= startDate
    );
    
    const notes = getDailyEmotionalNotes().filter(note => 
      new Date(note.timestamp) >= startDate
    );
    
    return { practice, notes };
  }, [getPracticeSessions, getDailyEmotionalNotes]);

  const getPracticeDurationData = useCallback((timeRange: string = 'month') => {
    const { practice } = getFilteredData(timeRange);
    
    const durationData: { [key: string]: number } = {};
    
    practice.forEach(session => {
      const date = new Date(session.timestamp).toISOString().split('T')[0];
      durationData[date] = (durationData[date] || 0) + session.duration;
    });
    
    return Object.entries(durationData).map(([date, duration]) => ({
      date,
      duration
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [getFilteredData]);

  const getEmotionDistribution = useCallback((timeRange: string = 'month') => {
    const { notes } = getFilteredData(timeRange);
    
    const emotionCounts: { [key: string]: number } = {};
    const emotionColors: { [key: string]: string } = {
      joy: '#4caf50',
      happy: '#4caf50',
      calm: '#2196f3',
      grateful: '#ff9800',
      focused: '#9c27b0',
      peaceful: '#00bcd4',
      energized: '#cddc39',
      thoughtful: '#607d8b',
      content: '#8bc34a',
      neutral: '#9e9e9e',
      stressed: '#ff5722',
      sad: '#3f51b5',
      angry: '#f44336',
      frustrated: '#ff5722'
    };
    
    notes.forEach(note => {
      if (note.emotion) {
        emotionCounts[note.emotion] = (emotionCounts[note.emotion] || 0) + 1;
      }
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      color: emotionColors[emotion] || '#9e9e9e'
    })).sort((a, b) => b.count - a.count);
  }, [getFilteredData]);

  const getPracticeDistribution = useCallback((timeRange: string = 'month') => {
    const { practice } = getFilteredData(timeRange);
    
    const stageCounts: { [key: string]: number } = {};
    
    practice.forEach(session => {
      const stage = session.stageLabel || `Stage ${session.stageLevel || 1}`;
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });
    
    return Object.entries(stageCounts).map(([stage, count]) => ({
      stage,
      count
    })).sort((a, b) => b.count - a.count);
  }, [getFilteredData]);

  // ✅ NEW: Additional Analytics Methods
  const getAppUsagePatterns = useCallback(() => {
    const sessions = getPracticeSessions();
    
    const timeOfDayStats: { [key: string]: number } = {};
    const dayOfWeekStats: { [key: string]: number } = {};
    
    sessions.forEach(session => {
      const date = new Date(session.timestamp);
      const hour = date.getHours();
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      let timeOfDay: string;
      if (hour < 6) timeOfDay = 'Late Night';
      else if (hour < 12) timeOfDay = 'Morning';
      else if (hour < 17) timeOfDay = 'Afternoon';
      else if (hour < 21) timeOfDay = 'Evening';
      else timeOfDay = 'Night';
      
      timeOfDayStats[timeOfDay] = (timeOfDayStats[timeOfDay] || 0) + 1;
      dayOfWeekStats[dayOfWeek] = (dayOfWeekStats[dayOfWeek] || 0) + 1;
    });
    
    const consistency = calculateConsistencyScore(sessions);
    
    return {
      timeOfDayStats,
      dayOfWeekStats,
      consistency
    };
  }, [getPracticeSessions]);

  const getEngagementMetrics = useCallback(() => {
    const sessions = getPracticeSessions();
    const notes = getDailyEmotionalNotes();
    
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklySessionCount = sessions.filter(s => new Date(s.timestamp) >= lastWeek).length;
    const weeklyNotesCount = notes.filter(n => new Date(n.timestamp) >= lastWeek).length;
    
    const avgSessionLength = sessions.length > 0 ? 
      sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length : 0;
    
    return {
      weeklyFrequency: weeklySessionCount,
      weeklyNotes: weeklyNotesCount,
      avgSessionLength: Math.round(avgSessionLength),
      totalEngagementDays: new Set(sessions.map(s => new Date(s.timestamp).toDateString())).size
    };
  }, [getPracticeSessions, getDailyEmotionalNotes]);

  const getFeatureUtilization = useCallback(() => {
    const sessions = getPracticeSessions();
    const totalSessions = sessions.length;
    
    if (totalSessions === 0) return [];
    
    const mindRecoveryUsage = sessions.filter(s => s.sessionType === 'mind_recovery').length;
    const pahmUsage = sessions.filter(s => s.pahmCounts).length;
    const environmentTracking = sessions.filter(s => s.environment).length;
    const notesUsage = sessions.filter(s => s.notes && s.notes.length > 0).length;
    
    return [
      {
        feature: 'Mind Recovery',
        percentage: Math.round((mindRecoveryUsage / totalSessions) * 100)
      },
      {
        feature: 'PAHM Tracking',
        percentage: Math.round((pahmUsage / totalSessions) * 100)
      },
      {
        feature: 'Environment Tracking',
        percentage: Math.round((environmentTracking / totalSessions) * 100)
      },
      {
        feature: 'Session Notes',
        percentage: Math.round((notesUsage / totalSessions) * 100)
      }
    ];
  }, [getPracticeSessions]);

  // ✅ NEW: Delete Methods
  const deleteEmotionalNote = useCallback((noteId: string) => {
    if (!userData) return;
    
    const updatedData = {
      ...userData,
      emotionalNotes: userData.emotionalNotes.filter(note => note.noteId !== noteId),
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };
    
    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log(`✅ Emotional note ${noteId} deleted successfully`);
  }, [userData, saveDataToStorage]);

  const deletePracticeSession = useCallback((sessionId: string) => {
    if (!userData) return;
    
    const updatedData = {
      ...userData,
      practiceSessions: userData.practiceSessions.filter(session => session.sessionId !== sessionId),
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Recalculate profile stats
    const allSessions = updatedData.practiceSessions;
    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgQuality = allSessions.length > 0 ? allSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / allSessions.length : 0;
    const avgPresent = allSessions.length > 0 ? allSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / allSessions.length : 0;

    updatedData.profile = {
      ...updatedData.profile,
      totalSessions: allSessions.length,
      totalMinutes: totalMinutes,
      averageQuality: Math.round(avgQuality * 10) / 10,
      averagePresentPercentage: Math.round(avgPresent)
    };
    
    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log(`✅ Practice session ${sessionId} deleted successfully`);
  }, [userData, saveDataToStorage]);

  const deleteReflection = useCallback((reflectionId: string) => {
    if (!userData) return;
    
    const updatedData = {
      ...userData,
      reflections: userData.reflections.filter(reflection => reflection.reflectionId !== reflectionId),
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };
    
    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log(`✅ Reflection ${reflectionId} deleted successfully`);
  }, [userData, saveDataToStorage]);

  // ✅ FIXED: Data manipulation methods
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
    
    console.log('✅ Practice session added successfully');
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
    
    console.log('✅ Emotional note added successfully');
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
    
    console.log('✅ Reflection added successfully');
  }, [userData, saveDataToStorage]);

  // ✅ FIXED: Questionnaire and Self-Assessment methods
  const updateQuestionnaire = useCallback((questionnaireData: Omit<QuestionnaireData, 'completed' | 'completedAt'>) => {
    if (!userData) {
      console.error('❌ Cannot update questionnaire - userData is null');
      return;
    }

    console.log('📝 Updating questionnaire data:', questionnaireData);

    const updatedData = {
      ...userData,
      questionnaire: {
        ...questionnaireData,
        completed: true,
        completedAt: new Date().toISOString()
      },
      achievements: userData.achievements.includes('questionnaire_completed') 
        ? userData.achievements 
        : [...userData.achievements, 'questionnaire_completed'],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log('✅ Questionnaire updated successfully');
  }, [userData, saveDataToStorage]);

  const updateSelfAssessment = useCallback((selfAssessmentData: Omit<SelfAssessmentData, 'completed' | 'completedAt'>) => {
    if (!userData) {
      console.error('❌ Cannot update self-assessment - userData is null');
      return;
    }

    console.log('🧠 Updating self-assessment data:', selfAssessmentData);

    const updatedData = {
      ...userData,
      selfAssessment: {
        ...selfAssessmentData,
        completed: true,
        completedAt: new Date().toISOString()
      } as SelfAssessmentData,
      achievements: userData.achievements.includes('self_assessment_completed') 
        ? userData.achievements 
        : [...userData.achievements, 'self_assessment_completed'],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log('✅ Self-assessment updated successfully');
  }, [userData, saveDataToStorage]);

  // ✅ FIXED: markQuestionnaireComplete - handles raw responses and adds proper wrapper
  const markQuestionnaireComplete = useCallback((responses: any) => {
    console.log('📝 Marking questionnaire complete with raw responses:', responses);
    
    // ✅ FIXED: Handle both raw responses and already-structured data
    let cleanResponses = responses;
    
    // If responses already include completion metadata, extract just the data
    if (responses.completed || responses.completedAt) {
      console.log('⚠️ Detected pre-structured data - extracting raw responses');
      const { completed, completedAt, totalQuestions, answeredQuestions, ...rawData } = responses;
      cleanResponses = rawData;
    }
    
    const questionnaireData: QuestionnaireData = {
      completed: true,
      completedAt: new Date().toISOString(),
      responses: {
        experience_level: cleanResponses.experience_level || 1,
        goals: cleanResponses.goals || [],
        age_range: cleanResponses.age_range || '',
        location: cleanResponses.location || '',
        occupation: cleanResponses.occupation || '',
        education_level: cleanResponses.education_level || '',
        meditation_background: cleanResponses.meditation_background || '',
        sleep_pattern: cleanResponses.sleep_pattern || 5,
        physical_activity: cleanResponses.physical_activity || '',
        stress_triggers: cleanResponses.stress_triggers || [],
        daily_routine: cleanResponses.daily_routine || '',
        diet_pattern: cleanResponses.diet_pattern || '',
        screen_time: cleanResponses.screen_time || '',
        social_connections: cleanResponses.social_connections || '',
        work_life_balance: cleanResponses.work_life_balance || '',
        emotional_awareness: cleanResponses.emotional_awareness || 5,
        stress_response: cleanResponses.stress_response || '',
        decision_making: cleanResponses.decision_making || '',
        self_reflection: cleanResponses.self_reflection || '',
        thought_patterns: cleanResponses.thought_patterns || '',
        mindfulness_in_daily_life: cleanResponses.mindfulness_in_daily_life || '',
        mindfulness_experience: cleanResponses.mindfulness_experience || 1,
        meditation_background_detail: cleanResponses.meditation_background_detail || '',
        practice_goals: cleanResponses.practice_goals || '',
        preferred_duration: cleanResponses.preferred_duration || 10,
        biggest_challenges: cleanResponses.biggest_challenges || '',
        motivation: cleanResponses.motivation || '',
        totalQuestions: cleanResponses.totalQuestions || 27,
        answeredQuestions: cleanResponses.answeredQuestions || Object.keys(cleanResponses).length,
        ...cleanResponses
      }
    };
    
    console.log('✅ Created proper questionnaire structure:', questionnaireData);
    updateQuestionnaire(questionnaireData);
  }, [updateQuestionnaire]);

  // ✅ FIXED: markSelfAssessmentComplete with enhanced data format handling
  const markSelfAssessmentComplete = useCallback((responses: any) => {
    console.log('🧠 Marking self-assessment complete with responses:', responses);
    
    let selfAssessmentData: SelfAssessmentData;
    
    // Handle multiple input formats
    if (responses.categories || responses.responses) {
      // Enhanced format from SelfAssessment component
      const categories = responses.categories || responses.responses || {};
      
      selfAssessmentData = {
        completed: true,
        completedAt: new Date().toISOString(),
        format: responses.format || 'standard',
        version: responses.version || '2.0',
        type: responses.type || 'selfAssessment',
        
        // Direct category values (for simple access)
        taste: responses.taste || categories.taste?.level || 'none',
        smell: responses.smell || categories.smell?.level || 'none',
        sound: responses.sound || categories.sound?.level || 'none',
        sight: responses.sight || categories.sight?.level || 'none',
        touch: responses.touch || categories.touch?.level || 'none',
        mind: responses.mind || categories.mind?.level || 'none',
        
        // Categories object format (for LocalDataContext compatibility)
        categories: responses.categories || {
          taste: { level: responses.taste || categories.taste?.level || 'none', category: 'taste', details: categories.taste?.details || '' },
          smell: { level: responses.smell || categories.smell?.level || 'none', category: 'smell', details: categories.smell?.details || '' },
          sound: { level: responses.sound || categories.sound?.level || 'none', category: 'sound', details: categories.sound?.details || '' },
          sight: { level: responses.sight || categories.sight?.level || 'none', category: 'sight', details: categories.sight?.details || '' },
          touch: { level: responses.touch || categories.touch?.level || 'none', category: 'touch', details: categories.touch?.details || '' },
          mind: { level: responses.mind || categories.mind?.level || 'none', category: 'mind', details: categories.mind?.details || '' }
        },
        
        // ✅ CRITICAL: Responses object (for happiness calculator compatibility)
        responses: responses.responses || responses.categories || {
          taste: { level: responses.taste || categories.taste?.level || 'none', category: 'taste', details: categories.taste?.details || '' },
          smell: { level: responses.smell || categories.smell?.level || 'none', category: 'smell', details: categories.smell?.details || '' },
          sound: { level: responses.sound || categories.sound?.level || 'none', category: 'sound', details: categories.sound?.details || '' },
          sight: { level: responses.sight || categories.sight?.level || 'none', category: 'sight', details: categories.sight?.details || '' },
          touch: { level: responses.touch || categories.touch?.level || 'none', category: 'touch', details: categories.touch?.details || '' },
          mind: { level: responses.mind || categories.mind?.level || 'none', category: 'mind', details: categories.mind?.details || '' }
        },
        
        // Pre-calculated scores at top level
        attachmentScore: responses.attachmentScore || 0,
        nonAttachmentCount: responses.nonAttachmentCount || 0,
        
        // Metrics object (for backward compatibility)
        metrics: responses.metrics || {
          nonAttachmentCount: responses.nonAttachmentCount || 0,
          attachmentScore: responses.attachmentScore || 0,
          attachmentLevel: responses.attachmentLevel || 'Unknown'
        }
      };
    } else {
      // Legacy format handling
      selfAssessmentData = {
        completed: true,
        completedAt: new Date().toISOString(),
        format: 'standard',
        version: '2.0',
        type: 'selfAssessment',
        
        // Direct category values
        taste: responses.taste || 'none',
        smell: responses.smell || 'none',
        sound: responses.sound || 'none',
        sight: responses.sight || 'none',
        touch: responses.touch || 'none',
        mind: responses.mind || 'none',
        
        // Categories object
        categories: {
          taste: { level: responses.taste || 'none', category: 'taste' },
          smell: { level: responses.smell || 'none', category: 'smell' },
          sound: { level: responses.sound || 'none', category: 'sound' },
          sight: { level: responses.sight || 'none', category: 'sight' },
          touch: { level: responses.touch || 'none', category: 'touch' },
          mind: { level: responses.mind || 'none', category: 'mind' }
        },
        
        // ✅ CRITICAL: Responses object (duplicate of categories for compatibility)
        responses: {
          taste: { level: responses.taste || 'none', category: 'taste' },
          smell: { level: responses.smell || 'none', category: 'smell' },
          sound: { level: responses.sound || 'none', category: 'sound' },
          sight: { level: responses.sight || 'none', category: 'sight' },
          touch: { level: responses.touch || 'none', category: 'touch' },
          mind: { level: responses.mind || 'none', category: 'mind' }
        },
        
        // Pre-calculated scores
        attachmentScore: responses.attachmentScore || 0,
        nonAttachmentCount: responses.nonAttachmentCount || 0,
        
        // Metrics object
        metrics: {
          nonAttachmentCount: responses.nonAttachmentCount || 0,
          attachmentScore: responses.attachmentScore || 0,
          attachmentLevel: responses.attachmentLevel || 'Unknown'
        }
      };
    }
    
    console.log('✅ Created proper self-assessment structure:', selfAssessmentData);
    updateSelfAssessment(selfAssessmentData);
  }, [updateSelfAssessment]);

  // ✅ FIXED: addAchievement method
  const addAchievement = useCallback((achievement: string) => {
    if (!userData) {
      console.error('❌ Cannot add achievement - userData is null');
      return;
    }

    if (userData.achievements.includes(achievement)) {
      console.log(`⚠️ Achievement '${achievement}' already exists - skipping`);
      return;
    }

    console.log(`🏆 Adding achievement: ${achievement}`);

    const updatedData = {
      ...userData,
      achievements: [...userData.achievements, achievement],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log(`✅ Achievement '${achievement}' added successfully`);
  }, [userData, saveDataToStorage]);

  const addNote = useCallback((note: any) => {
    if (!userData) {
      console.error('❌ Cannot add note - userData is null');
      return;
    }

    const newNote = {
      ...note,
      id: generateId('note'),
      timestamp: new Date().toISOString(),
      userId: currentUser?.uid
    };

    console.log(`📒 Adding note: ${newNote.id}`);

    const updatedData = {
      ...userData,
      notes: [...userData.notes, newNote],
      analytics: {
        ...userData.analytics,
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
    
    console.log(`✅ Note added successfully`);
  }, [userData, saveDataToStorage, currentUser]);

  // Legacy compatibility methods
  const getLegacyPracticeHistory = useCallback((): PracticeSessionData[] => {
    return getPracticeSessions();
  }, [getPracticeSessions]);

  const getLegacyEmotionalNotes = useCallback((): EmotionalNoteData[] => {
    return getDailyEmotionalNotes();
  }, [getDailyEmotionalNotes]);

  const getLegacyMindRecoveryHistory = useCallback((): PracticeSessionData[] => {
    return getMindRecoverySessions();
  }, [getMindRecoverySessions]);

  const syncLegacyStorageKeys = useCallback(() => {
    if (userData && currentUser) {
      const legacyKeys = getLegacyStorageKeys();
      
      try {
        localStorage.setItem(legacyKeys.practiceHistory, JSON.stringify(userData.practiceSessions));
        localStorage.setItem(legacyKeys.emotionalNotes, JSON.stringify(userData.emotionalNotes));
        
        const mindRecoverySessions = userData.practiceSessions.filter(s => s.sessionType === 'mind_recovery');
        localStorage.setItem(legacyKeys.mindRecoveryHistory, JSON.stringify(mindRecoverySessions));

        if (userData.questionnaire) {
          localStorage.setItem(legacyKeys.questionnaire, JSON.stringify(userData.questionnaire.responses));
          localStorage.setItem('questionnaire_completed', userData.questionnaire.completed ? 'true' : 'false');
        }
        
        if (userData.selfAssessment) {
          localStorage.setItem(legacyKeys.selfAssessment, JSON.stringify(userData.selfAssessment));
          localStorage.setItem('self_assessment_completed', userData.selfAssessment.completed ? 'true' : 'false');
        }

        console.log('🔄 Legacy storage keys synced for component compatibility');
      } catch (error) {
        console.error('❌ Error syncing legacy storage keys:', error);
      }
    }
  }, [userData, currentUser, getLegacyStorageKeys]);

  // Auth integration
  const syncWithAuthContext = useCallback(() => {
    if (currentUser && syncWithLocalData) {
      syncWithLocalData();
    }
  }, [currentUser, syncWithLocalData]);

  const getOnboardingStatusFromAuth = useCallback(() => {
    return {
      questionnaire: isQuestionnaireCompleted(),
      assessment: isSelfAssessmentCompleted()
    };
  }, [isQuestionnaireCompleted, isSelfAssessmentCompleted]);

  // Placeholder methods that need to be implemented based on specific requirements
  const getProgressTrends = useCallback(() => ({}), []);
  const getComprehensiveAnalytics = useCallback(() => ({}), []);
  const getPredictiveInsights = useCallback(() => ({}), []);
  const exportDataForAnalysis = useCallback(() => ({}), []);
  const getComprehensiveStats = useCallback(() => ({}), []);
  const get9CategoryPAHMInsights = useCallback(() => getPAHMData(), [getPAHMData]);
  const getMindRecoveryInsights = useCallback(() => getMindRecoveryAnalytics(), [getMindRecoveryAnalytics]);

  // Load data on mount and user change
  useEffect(() => {
    loadDataFromStorage();
  }, [loadDataFromStorage]);

  // Automatic data sync
  useEffect(() => {
    if (userData && currentUser) {
      syncLegacyStorageKeys();
      
      if (syncWithLocalData) {
        syncWithLocalData();
      }
    }
  }, [userData, currentUser, syncWithLocalData, syncLegacyStorageKeys]);

  // ✅ ENHANCED: COMPLETE CONTEXT VALUE WITH all missing direct properties
  const contextValue: LocalDataContextType = {
    userData,
    isLoading,
    refreshTrigger,
    
    // ✅ CRITICAL: Direct properties for component compatibility
    comprehensiveUserData: userData,
    practiceSessions: userData?.practiceSessions || [],
    emotionalNotes: userData?.emotionalNotes || [],
    questionnaire: userData?.questionnaire || null,
    selfAssessment: userData?.selfAssessment || null,
    
    // Core methods
    clearAllData,
    
    // Data getters
    getPracticeSessions,
    getDailyEmotionalNotes,
    getReflections,
    getAnalyticsData,
    
    // Questionnaire and Self-Assessment getters
    getQuestionnaire,
    getSelfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    
    getAchievements,
    getNotes,
    
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
    
    // Dashboard Analytics
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
    
    // Data manipulation
    addPracticeSession,
    addEmotionalNote,
    addReflection,
    addMindRecoverySession,

    // ✅ FIXED: Questionnaire and Self-Assessment methods
    updateQuestionnaire,
    updateSelfAssessment,
    markQuestionnaireComplete,
    markSelfAssessmentComplete,

    // Achievement methods
    addAchievement,
    addNote,

    // Delete methods
    deleteEmotionalNote,
    deletePracticeSession,
    deleteReflection,

    // Legacy compatibility methods
    getLegacyPracticeHistory,
    getLegacyEmotionalNotes,
    getLegacyMindRecoveryHistory,
    syncLegacyStorageKeys
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