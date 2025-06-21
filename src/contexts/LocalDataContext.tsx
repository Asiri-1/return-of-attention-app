import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';

// 🏗️ ENHANCED DATA TYPES WITH 9-CATEGORY PAHM SYSTEM
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number; // Optional for mind recovery
  stageLabel?: string; // Optional for mind recovery
  // Mind recovery contexts - all are PAHM practices with different purposes
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'midday-reset' | 'work-home-transition' | 'evening-window' | 'breathing-reset' | 'thought-labeling' | 'body-scan' | 'single-point-focus' | 'loving-kindness' | 'gratitude-moment' | 'mindful-transition' | 'stress-release';
  // Mind recovery purpose categories
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
  // 🧠 UPGRADED TO 9-CATEGORY PAHM MATRIX
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
  // Mind recovery specific metrics
  recoveryMetrics?: {
    stressReduction: number; // 1-10 scale
    energyLevel: number; // 1-10 scale
    clarityImprovement: number; // 1-10 scale
    moodImprovement: number; // 1-10 scale
  };
}

interface EmotionalNoteData {
  noteId: string;
  timestamp: string;
  content: string;
  emotion: string;
  energyLevel?: number;
  tags?: string[];
  gratitude?: string[];
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
    // Mind recovery stats
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

// 🎯 ENHANCED CONTEXT INTERFACE WITH 9-CATEGORY PAHM
interface LocalDataContextType {
  userData: ComprehensiveUserData | null;
  isLoading: boolean;
  
  // Core methods
  populateSampleData: () => void;
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
  
  // Auth integration methods
  syncWithAuthContext: () => void;
  getOnboardingStatusFromAuth: () => { questionnaire: boolean; assessment: boolean };
  
  // Data manipulation
  addPracticeSession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
  addEmotionalNote: (note: Omit<EmotionalNoteData, 'noteId'>) => void;
  addReflection: (reflection: Omit<ReflectionData, 'reflectionId'>) => void;
  
  // Mind recovery session addition
  addMindRecoverySession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
}

// 🔧 CREATE CONTEXT
const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

// 🚀 ENHANCED PROVIDER WITH 9-CATEGORY PAHM SYSTEM
export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData } = useAuth(); // ✅ REMOVED unused getUserStorageKey
  const [userData, setUserData] = useState<ComprehensiveUserData | null>(null);
  const [isLoading] = useState(false); // ✅ REMOVED unused setIsLoading

  // 🔥 GENERATE UNIQUE IDS
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 🔥 GET USER STORAGE KEY
  const getStorageKey = (): string => {
    return currentUser?.uid ? `comprehensiveUserData_${currentUser.uid}` : 'comprehensiveUserData';
  };

  // 🔥 ENHANCED SAMPLE DATA WITH 9-CATEGORY PAHM SYSTEM
  const populateSampleData = () => {
    const sampleData: ComprehensiveUserData = {
      profile: {
        userId: currentUser?.uid || 'sample_user',
        displayName: currentUser?.displayName || 'Mindful Practitioner',
        email: currentUser?.email || 'user@example.com',
        totalSessions: 25, // 19 meditation + 6 mind recovery
        totalMinutes: 578, // Increased total
        currentStreak: 12,
        longestStreak: 18,
        averageQuality: 8.4,
        averagePresentPercentage: 82,
        // Mind recovery stats
        totalMindRecoverySessions: 6,
        totalMindRecoveryMinutes: 23,
        averageMindRecoveryRating: 8.5,
        currentProgress: {
          currentStage: 3,
          currentTLevel: "Intermediate",
          totalSessions: 25,
          totalMinutes: 578,
          longestStreak: 18,
          currentStreak: 12,
          averageQuality: 8.4,
          averagePresentPercentage: 82
        },
        preferences: {
          defaultSessionDuration: 25,
          reminderEnabled: true,
          favoriteStages: [2, 3, 4],
          optimalPracticeTime: "morning",
          notifications: {
            dailyReminder: true,
            streakReminder: true,
            weeklyProgress: true
          }
        }
      },
      practiceSessions: [
        // MEDITATION SESSIONS WITH 9-CATEGORY PAHM (19 sessions)
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-19T07:30:00.000Z',
          duration: 25,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 9,
          notes: 'Excellent awareness today. Mind feels very clear and stable. Natural lighting enhanced focus. The 9-category PAHM tracking reveals predominantly present-moment awareness with neutral emotional tone.',
          presentPercentage: 86,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_attachment: 15,
            present_neutral: 18,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-18T19:15:00.000Z',
          duration: 20,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 8,
          notes: 'Evening practice really helps with sleep quality. Felt deeply relaxed. The PAHM matrix shows good present-moment stability with minimal future anxiety.',
          presentPercentage: 82,
          environment: {
            posture: 'lying',
            location: 'indoor',
            lighting: 'dim',
            sounds: 'meditation music'
          },
          pahmCounts: {
            present_attachment: 12,
            present_neutral: 14,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 0,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-17T06:45:00.000Z',
          duration: 30,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 10,
          notes: 'Outdoor practice brings incredible clarity. Nature sounds enhance focus beautifully. Perfect balance across all 9 PAHM categories with strong present-moment dominance.',
          presentPercentage: 87,
          environment: {
            posture: 'sitting',
            location: 'outdoor',
            lighting: 'sunrise',
            sounds: 'nature'
          },
          pahmCounts: {
            present_attachment: 18,
            present_neutral: 22,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-16T12:30:00.000Z',
          duration: 15,
          sessionType: 'meditation',
          stageLevel: 1,
          stageLabel: 'Stage 1: Establishing a Practice',
          rating: 7,
          notes: 'Short lunch break meditation helped reset my afternoon focus. PAHM tracking shows more scattered attention but still beneficial.',
          presentPercentage: 73,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'artificial',
            sounds: 'silent'
          },
          pahmCounts: {
            present_attachment: 8,
            present_neutral: 10,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-15T07:00:00.000Z',
          duration: 35,
          sessionType: 'meditation',
          stageLevel: 4,
          stageLabel: 'Stage 4: Continuous Attention',
          rating: 9,
          notes: 'Rain sounds created perfect ambiance. Achieved sustained attention for long periods. Excellent PAHM distribution with minimal past/future wandering.',
          presentPercentage: 87,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'rain'
          },
          pahmCounts: {
            present_attachment: 20,
            present_neutral: 26,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 2,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-14T18:00:00.000Z',
          duration: 22,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 8,
          notes: 'Good consistency building. Evening sessions becoming a strong habit. PAHM matrix shows steady improvement in present-moment awareness.',
          presentPercentage: 78,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'warm',
            sounds: 'soft music'
          },
          pahmCounts: {
            present_attachment: 11,
            present_neutral: 13,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-13T07:15:00.000Z',
          duration: 28,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 9,
          notes: 'Morning clarity is exceptional. Mind feels refreshed and alert. The 9-category PAHM system captures the nuanced quality of morning awareness.',
          presentPercentage: 84,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'birds'
          },
          pahmCounts: {
            present_attachment: 16,
            present_neutral: 20,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-12T20:00:00.000Z',
          duration: 18,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 8,
          notes: 'Late evening session. Perfect for unwinding and letting go of the day. PAHM tracking shows effective transition from day stress to evening calm.',
          presentPercentage: 76,
          environment: {
            posture: 'lying',
            location: 'indoor',
            lighting: 'candle',
            sounds: 'silence'
          },
          pahmCounts: {
            present_attachment: 9,
            present_neutral: 11,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 2,
            past_aversion: 2,
            future_attachment: 1,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-11T06:30:00.000Z',
          duration: 32,
          sessionType: 'meditation',
          stageLevel: 4,
          stageLabel: 'Stage 4: Continuous Attention',
          rating: 10,
          notes: 'Breakthrough session! Sustained jhana-like states. Profound sense of unity and peace. The 9-category PAHM matrix perfectly captures this exceptional state.',
          presentPercentage: 92,
          environment: {
            posture: 'sitting',
            location: 'outdoor',
            lighting: 'dawn',
            sounds: 'water'
          },
          pahmCounts: {
            present_attachment: 22,
            present_neutral: 28,
            present_aversion: 2,
            past_attachment: 0,
            past_neutral: 1,
            past_aversion: 0,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-10T16:45:00.000Z',
          duration: 25,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 8,
          notes: 'Afternoon session after stressful work. Meditation restored balance and perspective. PAHM analysis shows effective stress transformation.',
          presentPercentage: 81,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'office ambient'
          },
          pahmCounts: {
            present_attachment: 13,
            present_neutral: 17,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 2,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-09T07:00:00.000Z',
          duration: 20,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 7,
          notes: 'Building momentum. Each day the practice feels more natural and effortless. The 9-category system shows gradual improvement patterns.',
          presentPercentage: 75,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_attachment: 10,
            present_neutral: 12,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-08T19:30:00.000Z',
          duration: 26,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 9,
          notes: 'Evening practice with incense. Aromatic anchor enhanced concentration beautifully. PAHM matrix reveals how sensory anchors support present-moment awareness.',
          presentPercentage: 83,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'soft',
            sounds: 'incense ambient'
          },
          pahmCounts: {
            present_attachment: 15,
            present_neutral: 19,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-07T08:15:00.000Z',
          duration: 24,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 8,
          notes: 'Weekend morning practice. No rush, just pure presence and awareness. The 9-category PAHM tracking captures the spacious quality of weekend practice.',
          presentPercentage: 79,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'distant traffic'
          },
          pahmCounts: {
            present_attachment: 12,
            present_neutral: 14,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-06T17:00:00.000Z',
          duration: 30,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 9,
          notes: 'Walking meditation in the park. Movement + mindfulness = perfect combination. PAHM analysis shows how movement supports present-moment awareness.',
          presentPercentage: 85,
          environment: {
            posture: 'walking',
            location: 'outdoor',
            lighting: 'afternoon sun',
            sounds: 'park atmosphere'
          },
          pahmCounts: {
            present_attachment: 17,
            present_neutral: 21,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-05T06:45:00.000Z',
          duration: 27,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 8,
          notes: 'Early bird session. The world is still quiet, mind follows suit naturally. Pre-dawn practice shows unique PAHM patterns in the 9-category matrix.',
          presentPercentage: 82,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'pre-dawn',
            sounds: 'silence'
          },
          pahmCounts: {
            present_attachment: 14,
            present_neutral: 18,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-04T21:00:00.000Z',
          duration: 19,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 7,
          notes: 'Night owl session. Sometimes evening practice is exactly what the mind needs. PAHM tracking shows how late practice differs from morning sessions.',
          presentPercentage: 74,
          environment: {
            posture: 'lying',
            location: 'indoor',
            lighting: 'moonlight',
            sounds: 'night sounds'
          },
          pahmCounts: {
            present_attachment: 9,
            present_neutral: 11,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 2,
            past_aversion: 2,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-03T07:30:00.000Z',
          duration: 33,
          sessionType: 'meditation',
          stageLevel: 4,
          stageLabel: 'Stage 4: Continuous Attention',
          rating: 10,
          notes: 'Another breakthrough! Extended periods of effortless concentration. The 9-category PAHM system beautifully maps these deeper states of awareness.',
          presentPercentage: 89,
          environment: {
            posture: 'sitting',
            location: 'outdoor',
            lighting: 'morning sun',
            sounds: 'gentle breeze'
          },
          pahmCounts: {
            present_attachment: 19,
            present_neutral: 25,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 2,
            future_aversion: 1
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-02T12:15:00.000Z',
          duration: 21,
          sessionType: 'meditation',
          stageLevel: 2,
          stageLabel: 'Stage 2: Sustained Attention',
          rating: 8,
          notes: 'Midday reset session. Perfect for breaking up the workday and returning to center. PAHM analysis reveals the restorative power of brief practice.',
          presentPercentage: 77,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'artificial',
            sounds: 'office quiet'
          },
          pahmCounts: {
            present_attachment: 11,
            present_neutral: 13,
            present_aversion: 2,
            past_attachment: 2,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-01T18:45:00.000Z',
          duration: 29,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 9,
          notes: 'Month-end reflection session. Grateful for the journey and excited for continued growth. The 9-category PAHM matrix shows beautiful progress patterns.',
          presentPercentage: 86,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'sunset',
            sounds: 'evening calm'
          },
          pahmCounts: {
            present_attachment: 16,
            present_neutral: 20,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 2,
            past_aversion: 1,
            future_attachment: 2,
            future_neutral: 2,
            future_aversion: 2
          }
        },

        // MIND RECOVERY SESSIONS WITH 9-CATEGORY PAHM (6 sessions)
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-18T14:30:00.000Z',
          duration: 3,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'midday-reset',
          mindRecoveryPurpose: 'mental-refresh',
          rating: 8,
          notes: 'Quick midday reset between meetings. Instant clarity and energy boost. PAHM tracking shows rapid shift from scattered to present awareness.',
          presentPercentage: 78,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'office ambient'
          },
          pahmCounts: {
            present_attachment: 5,
            present_neutral: 7,
            present_aversion: 1,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          },
          recoveryMetrics: {
            stressReduction: 7,
            energyLevel: 8,
            clarityImprovement: 8,
            moodImprovement: 7
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-16T17:45:00.000Z',
          duration: 4,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'work-home-transition',
          mindRecoveryPurpose: 'transition-support',
          rating: 9,
          notes: 'Perfect transition from work mode to home mode. Helps leave office stress behind. The 9-category PAHM system captures this mental gear-shifting beautifully.',
          presentPercentage: 82,
          environment: {
            posture: 'standing',
            location: 'outdoor',
            lighting: 'evening',
            sounds: 'traffic distant'
          },
          pahmCounts: {
            present_attachment: 6,
            present_neutral: 8,
            present_aversion: 1,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          },
          recoveryMetrics: {
            stressReduction: 9,
            energyLevel: 7,
            clarityImprovement: 8,
            moodImprovement: 9
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-14T06:15:00.000Z',
          duration: 5,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'morning-recharge',
          mindRecoveryPurpose: 'energy-boost',
          rating: 8,
          notes: 'Morning energy activation. Better than coffee! Sets positive tone for entire day. PAHM analysis shows how brief practice creates lasting effects.',
          presentPercentage: 85,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'dawn',
            sounds: 'birds'
          },
          pahmCounts: {
            present_attachment: 7,
            present_neutral: 9,
            present_aversion: 1,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 0,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          },
          recoveryMetrics: {
            stressReduction: 6,
            energyLevel: 9,
            clarityImprovement: 8,
            moodImprovement: 8
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-12T15:20:00.000Z',
          duration: 3,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'emotional-reset',
          mindRecoveryPurpose: 'emotional-balance',
          rating: 9,
          notes: 'Needed emotional reset after difficult conversation. Restored inner equilibrium quickly. The 9-category PAHM matrix shows emotional regulation in action.',
          presentPercentage: 80,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_attachment: 5,
            present_neutral: 8,
            present_aversion: 1,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          },
          recoveryMetrics: {
            stressReduction: 9,
            energyLevel: 7,
            clarityImprovement: 8,
            moodImprovement: 9
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-10T22:30:00.000Z',
          duration: 4,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'evening-window',
          mindRecoveryPurpose: 'sleep-preparation',
          rating: 8,
          notes: 'Pre-sleep wind-down session. Helps transition from day activity to restful sleep. PAHM tracking shows effective mental settling.',
          presentPercentage: 83,
          environment: {
            posture: 'lying',
            location: 'indoor',
            lighting: 'dim',
            sounds: 'silence'
          },
          pahmCounts: {
            present_attachment: 6,
            present_neutral: 9,
            present_aversion: 1,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          },
          recoveryMetrics: {
            stressReduction: 8,
            energyLevel: 6,
            clarityImprovement: 7,
            moodImprovement: 8
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-08T11:45:00.000Z',
          duration: 4,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'stress-release',
          mindRecoveryPurpose: 'stress-relief',
          rating: 9,
          notes: 'Emergency stress relief session during overwhelming day. Immediate relief and perspective shift. The 9-category PAHM system perfectly captures stress transformation.',
          presentPercentage: 79,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'artificial',
            sounds: 'office ambient'
          },
          pahmCounts: {
            present_attachment: 5,
            present_neutral: 8,
            present_aversion: 2,
            past_attachment: 1,
            past_neutral: 1,
            past_aversion: 1,
            future_attachment: 1,
            future_neutral: 1,
            future_aversion: 1
          },
          recoveryMetrics: {
            stressReduction: 10,
            energyLevel: 7,
            clarityImprovement: 9,
            moodImprovement: 9
          }
        }
      ],
      emotionalNotes: [
        {
          noteId: generateId('note'),
          timestamp: '2025-06-19T08:00:00.000Z',
          content: 'Feeling incredibly grateful for this practice. The 9-category PAHM system is revealing patterns I never noticed before. Present-moment awareness is becoming more natural and effortless.',
          emotion: 'gratitude',
          energyLevel: 9,
          tags: ['practice', 'awareness', 'gratitude', 'pahm'],
          gratitude: ['meditation practice', 'present moment awareness', 'inner peace']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-18T20:00:00.000Z',
          content: 'Evening sessions are becoming a beautiful ritual. The transition from day to night feels sacred. PAHM tracking shows how evening practice has different qualities than morning sessions.',
          emotion: 'peaceful',
          energyLevel: 7,
          tags: ['evening', 'ritual', 'transition', 'sacred'],
          gratitude: ['evening peace', 'daily rhythms', 'sacred moments']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-17T07:00:00.000Z',
          content: 'Outdoor meditation hits differently! Nature sounds, fresh air, and natural lighting create perfect conditions. The 9-category PAHM matrix shows how environment affects awareness quality.',
          emotion: 'joy',
          energyLevel: 9,
          tags: ['outdoor', 'nature', 'environment', 'joy'],
          gratitude: ['nature connection', 'fresh air', 'natural beauty']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-16T13:00:00.000Z',
          content: 'Short lunch break sessions are game-changers for work productivity. Just 15 minutes completely resets my mental state. PAHM analysis reveals the power of micro-practices.',
          emotion: 'energized',
          energyLevel: 8,
          tags: ['work', 'productivity', 'micro-practice', 'reset'],
          gratitude: ['work-life balance', 'mental clarity', 'productivity boost']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-15T07:30:00.000Z',
          content: 'Rain meditation was transcendent. The sound created perfect natural white noise. Achieved some of the deepest states yet. The 9-category PAHM tracking captured this beautifully.',
          emotion: 'bliss',
          energyLevel: 10,
          tags: ['rain', 'transcendent', 'deep states', 'bliss'],
          gratitude: ['rain sounds', 'deep peace', 'transcendent moments']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-14T18:30:00.000Z',
          content: 'Consistency is building momentum. Each session feels more natural. The habit is forming beautifully. PAHM patterns show steady improvement in present-moment stability.',
          emotion: 'confident',
          energyLevel: 8,
          tags: ['consistency', 'momentum', 'habit', 'improvement'],
          gratitude: ['steady progress', 'growing confidence', 'habit formation']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-13T07:45:00.000Z',
          content: 'Morning clarity is becoming my superpower. Starting the day with meditation sets such a positive tone. The 9-category PAHM system shows unique morning awareness patterns.',
          emotion: 'empowered',
          energyLevel: 9,
          tags: ['morning', 'clarity', 'superpower', 'positive'],
          gratitude: ['morning energy', 'mental clarity', 'positive start']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-12T20:30:00.000Z',
          content: 'Late evening practice helps process the day. Perfect for letting go and transitioning to rest. PAHM tracking shows how practice supports natural daily rhythms.',
          emotion: 'peaceful',
          energyLevel: 6,
          tags: ['evening', 'processing', 'letting go', 'rest'],
          gratitude: ['daily processing', 'peaceful transitions', 'restful sleep']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-11T07:00:00.000Z',
          content: 'Breakthrough session! Sustained jhana-like states felt incredible. The 9-category PAHM matrix perfectly mapped these deeper consciousness states. Profound sense of unity.',
          emotion: 'awe',
          energyLevel: 10,
          tags: ['breakthrough', 'jhana', 'unity', 'consciousness'],
          gratitude: ['profound experiences', 'consciousness exploration', 'unity awareness']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-10T17:00:00.000Z',
          content: 'Meditation after stressful work is like a reset button. Transforms perspective instantly. PAHM analysis shows how practice neutralizes stress patterns effectively.',
          emotion: 'relieved',
          energyLevel: 7,
          tags: ['stress relief', 'reset', 'perspective', 'transformation'],
          gratitude: ['stress relief', 'perspective shifts', 'emotional regulation']
        }
      ],
      reflections: [
        {
          reflectionId: generateId('reflection'),
          timestamp: '2025-06-19T22:00:00.000Z',
          type: 'evening',
          mood: 9,
          energy: 8,
          stress: 2,
          gratitude: ['successful meditation practice', 'peaceful day', 'growing awareness'],
          intention: 'Continue building consistent practice',
          insights: 'The 9-category PAHM system is revealing incredible insights about attention patterns. Present-moment awareness is becoming more stable and natural.'
        },
        {
          reflectionId: generateId('reflection'),
          timestamp: '2025-06-18T22:30:00.000Z',
          type: 'evening',
          mood: 8,
          energy: 7,
          stress: 3,
          gratitude: ['evening meditation ritual', 'restful sleep preparation', 'daily progress'],
          intention: 'Maintain evening practice consistency',
          insights: 'Evening sessions have unique qualities. The PAHM matrix shows different patterns compared to morning practice. Both are valuable.'
        },
        {
          reflectionId: generateId('reflection'),
          timestamp: '2025-06-17T06:30:00.000Z',
          type: 'morning',
          mood: 9,
          energy: 9,
          stress: 1,
          gratitude: ['outdoor meditation opportunity', 'nature connection', 'morning clarity'],
          intention: 'Incorporate more outdoor practice',
          insights: 'Outdoor meditation brings special qualities. Natural sounds and fresh air enhance awareness. The 9-category PAHM tracking captures these environmental effects.'
        }
      ],
      analytics: {
        totalPracticeTime: 578,
        averageSessionLength: 23.1,
        consistencyScore: 85,
        progressTrend: 'improving',
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(sampleData);
    saveDataToStorage(sampleData);
    console.log('🎯 Sample data populated with 9-category PAHM system!');
  };

  // 🔥 CLEAR ALL DATA
  const clearAllData = () => {
    setUserData(null);
    localStorage.removeItem(getStorageKey());
    console.log('🗑️ All data cleared!');
  };

  // 🔥 LOAD DATA FROM STORAGE - Made useCallback to fix dependency warning
  const loadDataFromStorage = useCallback(() => {
    try {
      const storedData = localStorage.getItem(getStorageKey());
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserData(parsedData);
        console.log('📊 Data loaded from storage');
      }
    } catch (error) {
      console.error('Error loading data from storage:', error);
    }
  }, [currentUser?.uid]); // ✅ Added dependency

  // 🔥 SAVE DATA TO STORAGE
  const saveDataToStorage = (data: ComprehensiveUserData) => {
    try {
      localStorage.setItem(getStorageKey(), JSON.stringify(data));
      console.log('💾 Data saved to storage');
    } catch (error) {
      console.error('Error saving data to storage:', error);
    }
  };

  // 🔥 DATA GETTERS
  const getPracticeSessions = (): PracticeSessionData[] => {
    return userData?.practiceSessions || [];
  };

  const getDailyEmotionalNotes = (): EmotionalNoteData[] => {
    return userData?.emotionalNotes || [];
  };

  const getReflections = (): ReflectionData[] => {
    return userData?.reflections || [];
  };

  const getMindRecoverySessions = (): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(session => session.sessionType === 'mind_recovery') || [];
  };

  const getMeditationSessions = (): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(session => session.sessionType === 'meditation') || [];
  };

  // 🧠 9-CATEGORY PAHM ANALYTICS
  const getPAHMData = (): PAHMAnalytics | null => {
    const sessions = getPracticeSessions().filter(session => session.pahmCounts);
    
    if (sessions.length === 0) return null;

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
        totalPAHM.present_attachment += session.pahmCounts.present_attachment;
        totalPAHM.present_neutral += session.pahmCounts.present_neutral;
        totalPAHM.present_aversion += session.pahmCounts.present_aversion;
        totalPAHM.past_attachment += session.pahmCounts.past_attachment;
        totalPAHM.past_neutral += session.pahmCounts.past_neutral;
        totalPAHM.past_aversion += session.pahmCounts.past_aversion;
        totalPAHM.future_attachment += session.pahmCounts.future_attachment;
        totalPAHM.future_neutral += session.pahmCounts.future_neutral;
        totalPAHM.future_aversion += session.pahmCounts.future_aversion;
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

    return {
      totalPAHM,
      totalCounts,
      timeDistribution,
      emotionalDistribution,
      presentPercentage: Math.round((timeDistribution.present / totalCounts) * 100),
      neutralPercentage: Math.round((emotionalDistribution.neutral / totalCounts) * 100),
      sessionsAnalyzed: sessions.length,
      totalObservations: totalCounts
    };
  };

  // 🌿 ENVIRONMENT ANALYTICS - ✅ FIXED TYPING
  const getEnvironmentData = (): EnvironmentAnalytics => {
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
  };

  // 🕐 MIND RECOVERY ANALYTICS
  const getMindRecoveryAnalytics = (): MindRecoveryAnalytics => {
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
  };

  // 📊 COMPREHENSIVE ANALYTICS
  const getAnalyticsData = (): ComprehensiveAnalytics => {
    const allSessions = getPracticeSessions();
    const meditationSessions = getMeditationSessions();
    const mindRecoverySessions = getMindRecoverySessions();
    const emotionalNotes = getDailyEmotionalNotes();
    
    const totalMinutes = allSessions.reduce((sum, session) => sum + session.duration, 0);
    const avgSessionLength = allSessions.length > 0 ? Math.round((totalMinutes / allSessions.length) * 10) / 10 : 0;
    const avgQuality = allSessions.length > 0 
      ? Math.round((allSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / allSessions.length) * 10) / 10 
      : 0;
    const avgPresent = allSessions.length > 0 
      ? Math.round((allSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / allSessions.length) * 10) / 10 
      : 0;

    return {
      totalSessions: allSessions.length,
      totalMeditationSessions: meditationSessions.length,
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalPracticeTime: totalMinutes,
      averageSessionLength: avgSessionLength,
      averageQuality: avgQuality,
      averagePresentPercentage: avgPresent,
      currentStreak: userData?.profile.currentStreak || 0,
      longestStreak: userData?.profile.longestStreak || 0,
      emotionalNotesCount: emotionalNotes.length,
      consistencyScore: userData?.analytics.consistencyScore || 0,
      progressTrend: userData?.analytics.progressTrend || 'stable',
      lastUpdated: new Date().toISOString()
    };
  };

  // 🔮 PREDICTIVE INSIGHTS
  const getPredictiveInsights = () => {
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
  };

  // 📈 PROGRESS TRENDS
  const getProgressTrends = () => {
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
  };

  // 📊 COMPREHENSIVE ANALYTICS FOR EXPORT
  const getComprehensiveAnalytics = () => {
    return {
      basicAnalytics: getAnalyticsData(),
      pahmAnalytics: getPAHMData(),
      environmentAnalytics: getEnvironmentData(),
      mindRecoveryAnalytics: getMindRecoveryAnalytics(),
      predictiveInsights: getPredictiveInsights(),
      progressTrends: getProgressTrends()
    };
  };

  // 📤 EXPORT DATA FOR ANALYSIS
  const exportDataForAnalysis = () => {
    return {
      userData,
      analytics: getComprehensiveAnalytics(),
      exportTimestamp: new Date().toISOString(),
      version: '9-category-pahm-v1.0'
    };
  };

  // 🔥 DATA MANIPULATION METHODS
  const addPracticeSession = (session: Omit<PracticeSessionData, 'sessionId'>) => {
    if (!userData) return;

    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session')
    };

    const updatedData = {
      ...userData,
      practiceSessions: [...userData.practiceSessions, newSession]
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
  };

  const addMindRecoverySession = (session: Omit<PracticeSessionData, 'sessionId'>) => {
    const mindRecoverySession: Omit<PracticeSessionData, 'sessionId'> = {
      ...session,
      sessionType: 'mind_recovery'
    };
    addPracticeSession(mindRecoverySession);
  };

  const addEmotionalNote = (note: Omit<EmotionalNoteData, 'noteId'>) => {
    if (!userData) return;

    const newNote: EmotionalNoteData = {
      ...note,
      noteId: generateId('note')
    };

    const updatedData = {
      ...userData,
      emotionalNotes: [...userData.emotionalNotes, newNote]
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
  };

  const addReflection = (reflection: Omit<ReflectionData, 'reflectionId'>) => {
    if (!userData) return;

    const newReflection: ReflectionData = {
      ...reflection,
      reflectionId: generateId('reflection')
    };

    const updatedData = {
      ...userData,
      reflections: [...userData.reflections, newReflection]
    };

    setUserData(updatedData);
    saveDataToStorage(updatedData);
  };

  // 🔄 AUTH INTEGRATION - Made useCallback to fix dependency warning
  const syncWithAuthContext = useCallback(() => {
    if (currentUser && syncWithLocalData) {
      syncWithLocalData(userData);
    }
  }, [currentUser, syncWithLocalData, userData]); // ✅ Added dependencies

  const getOnboardingStatusFromAuth = () => {
    return {
      questionnaire: currentUser?.questionnaireCompleted || false,
      assessment: currentUser?.assessmentCompleted || false
    };
  };

  // 🔄 LOAD DATA ON MOUNT AND USER CHANGE - Fixed dependencies
  useEffect(() => {
    loadDataFromStorage();
  }, [loadDataFromStorage]); // ✅ Added missing dependency

  // 🔄 SYNC WITH AUTH CONTEXT WHEN DATA CHANGES - Fixed dependencies
  useEffect(() => {
    if (userData) {
      syncWithAuthContext();
    }
  }, [userData, syncWithAuthContext]); // ✅ Added missing dependency

  // 🎯 CONTEXT VALUE
  const contextValue: LocalDataContextType = {
    userData,
    isLoading,
    
    // Core methods
    populateSampleData,
    clearAllData,
    
    // Data getters
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
    
    // Auth integration
    syncWithAuthContext,
    getOnboardingStatusFromAuth,
    
    // Data manipulation
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

