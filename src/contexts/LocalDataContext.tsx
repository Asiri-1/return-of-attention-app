import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

// 🏗️ ENHANCED DATA TYPES WITH MIND RECOVERY AS PAHM CONTEXTS
interface PracticeSessionData {
  sessionId: string;
  timestamp: string;
  duration: number;
  sessionType: 'meditation' | 'mind_recovery';
  stageLevel?: number; // Optional for mind recovery
  stageLabel?: string; // Optional for mind recovery
  // Mind recovery contexts - all are PAHM practices with different purposes
  mindRecoveryContext?: 'morning-recharge' | 'emotional-reset' | 'midday-reset' | 'work-home-transition' | 'evening-window';
  // Mind recovery purpose categories
  mindRecoveryPurpose?: 'energy-boost' | 'stress-relief' | 'mental-refresh' | 'transition-support' | 'sleep-preparation';
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
    present_happy: number;
    present_unhappy: number;
    absent_happy: number;
    absent_unhappy: number;
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

// 🎯 ENHANCED CONTEXT INTERFACE
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
  getAnalyticsData: () => any;
  
  // Mind recovery specific getters
  getMindRecoverySessions: () => PracticeSessionData[];
  getMeditationSessions: () => PracticeSessionData[];
  getMindRecoveryAnalytics: () => any;
  
  // Auth integration methods
  syncWithAuthContext: () => void;
  getOnboardingStatusFromAuth: () => { questionnaire: boolean; assessment: boolean };
  
  // Data manipulation
  addPracticeSession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
  addEmotionalNote: (note: Omit<EmotionalNoteData, 'noteId'>) => void;
  addReflection: (reflection: Omit<ReflectionData, 'reflectionId'>) => void;
  
  // Mind recovery session addition
  addMindRecoverySession: (session: Omit<PracticeSessionData, 'sessionId'>) => void;
  
  // Advanced analytics
  getPAHMData: () => any;
  getEnvironmentData: () => any;
  getProgressTrends: () => any;
}

// 🔧 CREATE CONTEXT
const LocalDataContext = createContext<LocalDataContextType | undefined>(undefined);

// 🚀 ENHANCED PROVIDER WITH MIND RECOVERY AS PAHM CONTEXTS
export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, syncWithLocalData, getUserStorageKey } = useAuth();
  const [userData, setUserData] = useState<ComprehensiveUserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔥 GENERATE UNIQUE IDS
  const generateId = (prefix: string): string => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 🔥 GET USER STORAGE KEY
  const getStorageKey = (): string => {
    return currentUser?.uid ? `comprehensiveUserData_${currentUser.uid}` : 'comprehensiveUserData';
  };

  // 🔥 ENHANCED SAMPLE DATA WITH MIND RECOVERY AS PAHM CONTEXTS
  const populateSampleData = () => {
    const sampleData: ComprehensiveUserData = {
      profile: {
        userId: currentUser?.uid || 'sample_user',
        displayName: currentUser?.displayName || 'Mindful Practitioner',
        email: currentUser?.email || 'user@example.com',
        totalSessions: 21, // 15 meditation + 6 mind recovery
        totalMinutes: 508, // Increased total
        currentStreak: 8,
        longestStreak: 15,
        averageQuality: 8.3,
        averagePresentPercentage: 80,
        // Mind recovery stats
        totalMindRecoverySessions: 6,
        totalMindRecoveryMinutes: 23,
        averageMindRecoveryRating: 8.5,
        currentProgress: {
          currentStage: 3,
          currentTLevel: "Intermediate",
          totalSessions: 21,
          totalMinutes: 508,
          longestStreak: 15,
          currentStreak: 8,
          averageQuality: 8.3,
          averagePresentPercentage: 80
        },
        preferences: {
          defaultSessionDuration: 25,
          reminderEnabled: true,
          favoriteStages: [2, 3],
          optimalPracticeTime: "morning",
          notifications: {
            dailyReminder: true,
            streakReminder: true,
            weeklyProgress: true
          }
        }
      },
      practiceSessions: [
        // MEDITATION SESSIONS (15 sessions)
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-19T07:30:00.000Z',
          duration: 25,
          sessionType: 'meditation',
          stageLevel: 3,
          stageLabel: 'Stage 3: Interrupted Attention',
          rating: 9,
          notes: 'Excellent awareness today. Mind feels very clear and stable. Natural lighting enhanced focus.',
          presentPercentage: 86,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_happy: 35,
            present_unhappy: 8,
            absent_happy: 4,
            absent_unhappy: 3
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
          notes: 'Evening practice really helps with sleep quality. Felt deeply relaxed.',
          presentPercentage: 82,
          environment: {
            posture: 'lying',
            location: 'indoor',
            lighting: 'dim',
            sounds: 'meditation music'
          },
          pahmCounts: {
            present_happy: 28,
            present_unhappy: 7,
            absent_happy: 3,
            absent_unhappy: 2
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
          notes: 'Outdoor practice brings incredible clarity. Nature sounds enhance focus beautifully.',
          presentPercentage: 87,
          environment: {
            posture: 'sitting',
            location: 'outdoor',
            lighting: 'sunrise',
            sounds: 'nature'
          },
          pahmCounts: {
            present_happy: 42,
            present_unhappy: 6,
            absent_happy: 2,
            absent_unhappy: 5
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
          notes: 'Short lunch break meditation helped reset my afternoon focus.',
          presentPercentage: 73,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'artificial',
            sounds: 'silent'
          },
          pahmCounts: {
            present_happy: 18,
            present_unhappy: 5,
            absent_happy: 4,
            absent_unhappy: 3
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
          notes: 'Rain sounds created perfect ambiance. Achieved sustained attention for long periods.',
          presentPercentage: 87,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'rain'
          },
          pahmCounts: {
            present_happy: 48,
            present_unhappy: 4,
            absent_happy: 2,
            absent_unhappy: 6
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
          notes: 'Good consistency building. Evening sessions becoming a strong habit.',
          presentPercentage: 78,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'warm',
            sounds: 'soft music'
          },
          pahmCounts: {
            present_happy: 26,
            present_unhappy: 8,
            absent_happy: 5,
            absent_unhappy: 4
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
          notes: 'Morning clarity is exceptional. Mind feels refreshed and alert.',
          presentPercentage: 84,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'birds'
          },
          pahmCounts: {
            present_happy: 38,
            present_unhappy: 7,
            absent_happy: 3,
            absent_unhappy: 4
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
          notes: 'Late evening session. Perfect for unwinding and letting go of the day.',
          presentPercentage: 76,
          environment: {
            posture: 'lying',
            location: 'indoor',
            lighting: 'candle',
            sounds: 'silence'
          },
          pahmCounts: {
            present_happy: 22,
            present_unhappy: 6,
            absent_happy: 6,
            absent_unhappy: 4
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
          notes: 'Breakthrough session! Sustained jhana-like states. Profound sense of unity and peace.',
          presentPercentage: 92,
          environment: {
            posture: 'sitting',
            location: 'outdoor',
            lighting: 'dawn',
            sounds: 'water'
          },
          pahmCounts: {
            present_happy: 52,
            present_unhappy: 3,
            absent_happy: 1,
            absent_unhappy: 2
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
          notes: 'Afternoon session after stressful work. Meditation restored balance and perspective.',
          presentPercentage: 81,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'office ambient'
          },
          pahmCounts: {
            present_happy: 32,
            present_unhappy: 9,
            absent_happy: 3,
            absent_unhappy: 6
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
          notes: 'Building momentum. Each day the practice feels more natural and effortless.',
          presentPercentage: 75,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_happy: 24,
            present_unhappy: 8,
            absent_happy: 5,
            absent_unhappy: 5
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
          notes: 'Evening practice with incense. Aromatic anchor enhanced concentration beautifully.',
          presentPercentage: 83,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'soft',
            sounds: 'incense ambient'
          },
          pahmCounts: {
            present_happy: 36,
            present_unhappy: 6,
            absent_happy: 4,
            absent_unhappy: 4
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
          notes: 'Weekend morning practice. No rush, just pure presence and awareness.',
          presentPercentage: 79,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'distant traffic'
          },
          pahmCounts: {
            present_happy: 28,
            present_unhappy: 7,
            absent_happy: 4,
            absent_unhappy: 5
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
          notes: 'Walking meditation in the park. Movement + mindfulness = perfect combination.',
          presentPercentage: 85,
          environment: {
            posture: 'walking',
            location: 'outdoor',
            lighting: 'afternoon sun',
            sounds: 'park atmosphere'
          },
          pahmCounts: {
            present_happy: 40,
            present_unhappy: 5,
            absent_happy: 3,
            absent_unhappy: 4
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
          notes: 'Early bird session. The world is still quiet, mind follows suit naturally.',
          presentPercentage: 82,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'pre-dawn',
            sounds: 'silence'
          },
          pahmCounts: {
            present_happy: 34,
            present_unhappy: 8,
            absent_happy: 3,
            absent_unhappy: 5
          }
        },
        
        // MIND RECOVERY SESSIONS - PAHM PRACTICE WITH DIFFERENT CONTEXTS (6 sessions)
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-19T06:30:00.000Z',
          duration: 5,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'morning-recharge',
          mindRecoveryPurpose: 'energy-boost',
          rating: 9,
          notes: 'Morning PAHM practice right after waking up. Perfect energy boost to start the day with clarity.',
          presentPercentage: 78,
          environment: {
            posture: 'lying',
            location: 'bedroom',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_happy: 18,
            present_unhappy: 4,
            absent_happy: 2,
            absent_unhappy: 1
          },
          recoveryMetrics: {
            stressReduction: 6,
            energyLevel: 9,
            clarityImprovement: 8,
            moodImprovement: 9
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-18T14:15:00.000Z',
          duration: 3,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'emotional-reset',
          mindRecoveryPurpose: 'stress-relief',
          rating: 8,
          notes: 'PAHM practice after a stressful meeting. Quickly restored emotional balance and perspective.',
          presentPercentage: 72,
          environment: {
            posture: 'sitting',
            location: 'office',
            lighting: 'artificial',
            sounds: 'office ambient'
          },
          pahmCounts: {
            present_happy: 11,
            present_unhappy: 6,
            absent_happy: 1,
            absent_unhappy: 2
          },
          recoveryMetrics: {
            stressReduction: 9,
            energyLevel: 6,
            clarityImprovement: 7,
            moodImprovement: 8
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-17T12:00:00.000Z',
          duration: 4,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'midday-reset',
          mindRecoveryPurpose: 'mental-refresh',
          rating: 8,
          notes: 'Midday PAHM practice to refresh mental clarity. Great reset for afternoon productivity.',
          presentPercentage: 75,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_happy: 14,
            present_unhappy: 5,
            absent_happy: 2,
            absent_unhappy: 1
          },
          recoveryMetrics: {
            stressReduction: 7,
            energyLevel: 8,
            clarityImprovement: 9,
            moodImprovement: 7
          }
        },
        {
          sessionId: generateId('session'),
          timestamp: '2025-06-16T18:30:00.000Z',
          duration: 4,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'work-home-transition',
          mindRecoveryPurpose: 'transition-support',
          rating: 9,
          notes: 'PAHM practice for work-to-home transition. Perfect way to leave work stress behind.',
          presentPercentage: 81,
          environment: {
            posture: 'sitting',
            location: 'car',
            lighting: 'evening',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_happy: 16,
            present_unhappy: 3,
            absent_happy: 2,
            absent_unhappy: 1
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
          timestamp: '2025-06-15T21:45:00.000Z',
          duration: 4,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'evening-window',
          mindRecoveryPurpose: 'sleep-preparation',
          rating: 8,
          notes: 'Evening PAHM practice before sleep. Wonderful way to unwind and prepare for rest.',
          presentPercentage: 76,
          environment: {
            posture: 'lying',
            location: 'bedroom',
            lighting: 'dim',
            sounds: 'silence'
          },
          pahmCounts: {
            present_happy: 15,
            present_unhappy: 4,
            absent_happy: 3,
            absent_unhappy: 2
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
          timestamp: '2025-06-14T10:30:00.000Z',
          duration: 3,
          sessionType: 'mind_recovery',
          mindRecoveryContext: 'emotional-reset',
          mindRecoveryPurpose: 'stress-relief',
          rating: 8,
          notes: 'PAHM practice after feeling overwhelmed. Quick and effective emotional reset.',
          presentPercentage: 74,
          environment: {
            posture: 'sitting',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_happy: 12,
            present_unhappy: 5,
            absent_happy: 2,
            absent_unhappy: 2
          },
          recoveryMetrics: {
            stressReduction: 9,
            energyLevel: 6,
            clarityImprovement: 7,
            moodImprovement: 8
          }
        }
      ],
      emotionalNotes: [
        {
          noteId: generateId('note'),
          timestamp: '2025-06-19T22:00:00.000Z',
          content: 'Morning recharge PAHM practice is becoming a powerful daily ritual. Sets such a positive tone.',
          emotion: 'joy',
          energyLevel: 8,
          tags: ['morning practice', 'energy boost', 'daily ritual'],
          gratitude: ['morning clarity', 'PAHM technique', 'consistent practice']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-18T21:30:00.000Z',
          content: 'The emotional reset PAHM practice saved my day. Amazing how quickly it shifted my state.',
          emotion: 'relieved',
          energyLevel: 7,
          tags: ['emotional balance', 'stress relief', 'quick recovery'],
          gratitude: ['emotional tools', 'quick relief', 'stress management']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-17T20:45:00.000Z',
          content: 'Work-home transition PAHM practice is a game changer. I arrive home truly present.',
          emotion: 'peaceful',
          energyLevel: 8,
          tags: ['transition', 'presence', 'work-life balance'],
          gratitude: ['smooth transitions', 'work-life balance', 'mindful presence']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-16T18:00:00.000Z',
          content: 'Midday reset with PAHM practice completely refreshed my mental energy. So effective.',
          emotion: 'refreshed',
          energyLevel: 8,
          tags: ['mental refresh', 'midday reset', 'productivity'],
          gratitude: ['mental clarity', 'afternoon energy', 'productive mindset']
        },
        {
          noteId: generateId('note'),
          timestamp: '2025-06-15T19:15:00.000Z',
          content: 'Evening window PAHM practice makes sleep so much deeper and more restorative.',
          emotion: 'serene',
          energyLevel: 6,
          tags: ['sleep preparation', 'evening ritual', 'deep rest'],
          gratitude: ['restful sleep', 'evening peace', 'day completion']
        }
      ],
      reflections: [
        {
          reflectionId: generateId('reflection'),
          timestamp: '2025-06-19T07:00:00.000Z',
          type: 'morning',
          mood: 8,
          energy: 8,
          stress: 2,
          gratitude: ['new day', 'morning PAHM practice', 'mental clarity'],
          intention: 'Use PAHM practice throughout the day for optimal balance'
        },
        {
          reflectionId: generateId('reflection'),
          timestamp: '2025-06-18T22:00:00.000Z',
          type: 'evening',
          mood: 9,
          energy: 7,
          stress: 2,
          gratitude: ['successful PAHM applications', 'emotional balance', 'peaceful evening'],
          insights: 'PAHM practice works amazingly in different contexts throughout the day'
        }
      ],
      analytics: {
        totalPracticeTime: 508,
        averageSessionLength: 24,
        consistencyScore: 0.88,
        progressTrend: 'improving',
        lastUpdated: new Date().toISOString()
      }
    };

    setUserData(sampleData);
    localStorage.setItem(getStorageKey(), JSON.stringify(sampleData));
    
    // Sync with AuthContext
    if (syncWithLocalData) {
      syncWithLocalData(sampleData);
    }
    
    console.log('✅ Enhanced sample data with Mind Recovery PAHM contexts populated!');
  };

  // 🔥 CLEAR ALL DATA
  const clearAllData = () => {
    setUserData(null);
    localStorage.removeItem(getStorageKey());
    
    // Also clear legacy keys
    localStorage.removeItem('basicUserData');
    localStorage.removeItem('comprehensivePracticeData');
    localStorage.removeItem('comprehensiveEmotionalNotes');
    localStorage.removeItem('comprehensiveAppUsage');
    
    console.log('🗑️ All comprehensive data cleared!');
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

  // Mind Recovery specific getters
  const getMindRecoverySessions = (): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(s => s.sessionType === 'mind_recovery') || [];
  };

  const getMeditationSessions = (): PracticeSessionData[] => {
    return userData?.practiceSessions.filter(s => s.sessionType === 'meditation') || [];
  };

  // Mind Recovery Analytics - PAHM PRACTICE BY CONTEXT
  const getMindRecoveryAnalytics = () => {
    if (!userData) return null;
    
    const mindRecoverySessions = getMindRecoverySessions();
    const meditationSessions = getMeditationSessions();
    
    if (mindRecoverySessions.length === 0) return null;
    
    // Context Distribution (timing/purpose)
    const contextStats: {[key: string]: {count: number, avgRating: number, avgDuration: number, avgPresent: number}} = {};
    
    mindRecoverySessions.forEach(session => {
      const context = session.mindRecoveryContext || 'unknown';
      if (!contextStats[context]) {
        contextStats[context] = {count: 0, avgRating: 0, avgDuration: 0, avgPresent: 0};
      }
      contextStats[context].count++;
      contextStats[context].avgRating = 
        (contextStats[context].avgRating * (contextStats[context].count - 1) + (session.rating || 0)) / contextStats[context].count;
      contextStats[context].avgDuration = 
        (contextStats[context].avgDuration * (contextStats[context].count - 1) + session.duration) / contextStats[context].count;
      contextStats[context].avgPresent = 
        (contextStats[context].avgPresent * (contextStats[context].count - 1) + (session.presentPercentage || 0)) / contextStats[context].count;
    });
    
    // Purpose Distribution
    const purposeStats: {[key: string]: {count: number, avgRating: number}} = {};
    
    mindRecoverySessions.forEach(session => {
      const purpose = session.mindRecoveryPurpose || 'unknown';
      if (!purposeStats[purpose]) {
        purposeStats[purpose] = {count: 0, avgRating: 0};
      }
      purposeStats[purpose].count++;
      purposeStats[purpose].avgRating = 
        (purposeStats[purpose].avgRating * (purposeStats[purpose].count - 1) + (session.rating || 0)) / purposeStats[purpose].count;
    });
    
    // Recovery Metrics Analysis
    const sessionsWithMetrics = mindRecoverySessions.filter(s => s.recoveryMetrics);
    let avgRecoveryMetrics = null;
    
    if (sessionsWithMetrics.length > 0) {
      avgRecoveryMetrics = {
        stressReduction: Math.round(sessionsWithMetrics.reduce((sum, s) => sum + (s.recoveryMetrics?.stressReduction || 0), 0) / sessionsWithMetrics.length * 10) / 10,
        energyLevel: Math.round(sessionsWithMetrics.reduce((sum, s) => sum + (s.recoveryMetrics?.energyLevel || 0), 0) / sessionsWithMetrics.length * 10) / 10,
        clarityImprovement: Math.round(sessionsWithMetrics.reduce((sum, s) => sum + (s.recoveryMetrics?.clarityImprovement || 0), 0) / sessionsWithMetrics.length * 10) / 10,
        moodImprovement: Math.round(sessionsWithMetrics.reduce((sum, s) => sum + (s.recoveryMetrics?.moodImprovement || 0), 0) / sessionsWithMetrics.length * 10) / 10
      };
    }
    
    // Most used context and highest rated
    const mostUsedContext = Object.entries(contextStats).reduce((max, [context, stats]) => 
      stats.count > max.count ? { context, count: stats.count, avgRating: stats.avgRating } : max, 
      { context: '', count: 0, avgRating: 0 }
    );
    
    const highestRatedContext = Object.entries(contextStats).reduce((max, [context, stats]) => 
      stats.avgRating > max.avgRating ? { context, avgRating: stats.avgRating, count: stats.count } : max, 
      { context: '', avgRating: 0, count: 0 }
    );
    
    // PAHM effectiveness by context
    const pahmByContext = Object.entries(contextStats).map(([context, stats]) => ({
      context: context.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      avgPresent: Math.round(stats.avgPresent),
      avgRating: Math.round(stats.avgRating * 10) / 10,
      count: stats.count,
      avgDuration: Math.round(stats.avgDuration)
    }));
    
    return {
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalMeditationSessions: meditationSessions.length,
      totalMindRecoveryTime: mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0),
      avgMindRecoveryDuration: Math.round(mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0) / mindRecoverySessions.length),
      avgMindRecoveryRating: Math.round(mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / mindRecoverySessions.length * 10) / 10,
      avgMindRecoveryPresent: Math.round(mindRecoverySessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / mindRecoverySessions.length),
      
      // Context breakdown (timing/purpose)
      contextStats: Object.entries(contextStats).map(([context, stats]) => ({
        context: context.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        count: stats.count,
        avgRating: Math.round(stats.avgRating * 10) / 10,
        avgDuration: Math.round(stats.avgDuration),
        avgPresent: Math.round(stats.avgPresent)
      })),
      
      // Purpose breakdown
      purposeStats: Object.entries(purposeStats).map(([purpose, stats]) => ({
        purpose: purpose.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        count: stats.count,
        avgRating: Math.round(stats.avgRating * 10) / 10
      })),
      
      avgRecoveryMetrics,
      mostUsedContext: mostUsedContext.context ? {
        name: mostUsedContext.context.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        count: mostUsedContext.count,
        avgRating: Math.round(mostUsedContext.avgRating * 10) / 10
      } : null,
      
      highestRatedContext: highestRatedContext.context ? {
        name: highestRatedContext.context.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        avgRating: Math.round(highestRatedContext.avgRating * 10) / 10,
        count: highestRatedContext.count
      } : null,
      
      pahmByContext,
      recentSessions: mindRecoverySessions.slice(-5)
    };
  };

  const getAnalyticsData = () => {
    if (!userData) return null;
    
    const sessions = userData.practiceSessions;
    const notes = userData.emotionalNotes;
    const mindRecoverySessions = getMindRecoverySessions();
    const meditationSessions = getMeditationSessions();
    
    return {
      totalSessions: sessions.length,
      totalMeditationSessions: meditationSessions.length,
      totalMindRecoverySessions: mindRecoverySessions.length,
      totalPracticeTime: sessions.reduce((sum, s) => sum + s.duration, 0),
      totalMeditationTime: meditationSessions.reduce((sum, s) => sum + s.duration, 0),
      totalMindRecoveryTime: mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0),
      averageSessionLength: sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length) : 0,
      averageQuality: sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.rating || 0), 0) / sessions.length * 10) / 10 : 0,
      averagePresentPercentage: sessions.length > 0 ? Math.round(sessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / sessions.length) : 0,
      currentStreak: userData.profile.currentStreak,
      longestStreak: userData.profile.longestStreak,
      emotionalNotesCount: notes.length,
      lastUpdated: userData.analytics.lastUpdated
    };
  };

  // 🔥 AUTH INTEGRATION
  const syncWithAuthContext = () => {
    if (userData && syncWithLocalData) {
      syncWithLocalData(userData);
    }
  };

  const getOnboardingStatusFromAuth = () => {
    return {
      questionnaire: currentUser?.questionnaireCompleted || false,
      assessment: currentUser?.assessmentCompleted || false
    };
  };

  // 🔥 DATA MANIPULATION
  const addPracticeSession = (session: Omit<PracticeSessionData, 'sessionId'>) => {
    if (!userData) return;
    
    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session'),
      sessionType: session.sessionType || 'meditation'
    };
    
    const updatedData = {
      ...userData,
      practiceSessions: [...userData.practiceSessions, newSession],
      profile: {
        ...userData.profile,
        totalSessions: userData.profile.totalSessions + 1,
        totalMinutes: userData.profile.totalMinutes + session.duration
      }
    };
    
    setUserData(updatedData);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedData));
  };

  // Add Mind Recovery Session
  const addMindRecoverySession = (session: Omit<PracticeSessionData, 'sessionId'>) => {
    if (!userData) return;
    
    const newSession: PracticeSessionData = {
      ...session,
      sessionId: generateId('session'),
      sessionType: 'mind_recovery'
    };
    
    const currentMindRecoverySessions = userData.profile.totalMindRecoverySessions || 0;
    const currentMindRecoveryMinutes = userData.profile.totalMindRecoveryMinutes || 0;
    
    const updatedData = {
      ...userData,
      practiceSessions: [...userData.practiceSessions, newSession],
      profile: {
        ...userData.profile,
        totalSessions: userData.profile.totalSessions + 1,
        totalMinutes: userData.profile.totalMinutes + session.duration,
        totalMindRecoverySessions: currentMindRecoverySessions + 1,
        totalMindRecoveryMinutes: currentMindRecoveryMinutes + session.duration
      }
    };
    
    setUserData(updatedData);
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedData));
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
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedData));
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
    localStorage.setItem(getStorageKey(), JSON.stringify(updatedData));
  };

  // 🔥 ADVANCED ANALYTICS (EXISTING FUNCTIONALITY)
  const getPAHMData = () => {
    if (!userData) return null;
    
    const sessionsWithPAHM = userData.practiceSessions.filter(s => s.pahmCounts);
    if (sessionsWithPAHM.length === 0) return null;
    
    const avgPresent = sessionsWithPAHM.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / sessionsWithPAHM.length;
    
    const totalPAHM = sessionsWithPAHM.reduce((totals, session) => {
      const counts = session.pahmCounts!;
      return {
        present_happy: totals.present_happy + counts.present_happy,
        present_unhappy: totals.present_unhappy + counts.present_unhappy,
        absent_happy: totals.absent_happy + counts.absent_happy,
        absent_unhappy: totals.absent_unhappy + counts.absent_unhappy
      };
    }, { present_happy: 0, present_unhappy: 0, absent_happy: 0, absent_unhappy: 0 });
    
    const totalCounts = Object.values(totalPAHM).reduce((sum, count) => sum + count, 0);
    
    return {
      averagePresent: Math.round(avgPresent),
      pahmDistribution: totalCounts > 0 ? {
        present_happy: Math.round((totalPAHM.present_happy / totalCounts) * 100),
        present_unhappy: Math.round((totalPAHM.present_unhappy / totalCounts) * 100),
        absent_happy: Math.round((totalPAHM.absent_happy / totalCounts) * 100),
        absent_unhappy: Math.round((totalPAHM.absent_unhappy / totalCounts) * 100)
      } : null,
      sessionsAnalyzed: sessionsWithPAHM.length,
      totalObservations: totalCounts,
      // Split by session type
      meditationPAHM: {
        sessions: sessionsWithPAHM.filter(s => s.sessionType === 'meditation').length,
        avgPresent: Math.round(sessionsWithPAHM.filter(s => s.sessionType === 'meditation').reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / Math.max(1, sessionsWithPAHM.filter(s => s.sessionType === 'meditation').length))
      },
      mindRecoveryPAHM: {
        sessions: sessionsWithPAHM.filter(s => s.sessionType === 'mind_recovery').length,
        avgPresent: Math.round(sessionsWithPAHM.filter(s => s.sessionType === 'mind_recovery').reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / Math.max(1, sessionsWithPAHM.filter(s => s.sessionType === 'mind_recovery').length))
      }
    };
  };

  const getEnvironmentData = () => {
    if (!userData) return null;
    
    const sessionsWithEnv = userData.practiceSessions.filter(s => s.environment);
    if (sessionsWithEnv.length === 0) return null;
    
    const postureStats: {[key: string]: {count: number, avgRating: number}} = {};
    const locationStats: {[key: string]: {count: number, avgRating: number}} = {};
    const lightingStats: {[key: string]: {count: number, avgRating: number}} = {};
    const soundStats: {[key: string]: {count: number, avgRating: number}} = {};
    
    sessionsWithEnv.forEach(session => {
      const env = session.environment!;
      const rating = session.rating || 0;
      
      [
        { key: 'posture', stats: postureStats, value: env.posture },
        { key: 'location', stats: locationStats, value: env.location },
        { key: 'lighting', stats: lightingStats, value: env.lighting },
        { key: 'sounds', stats: soundStats, value: env.sounds }
      ].forEach(({ stats, value }) => {
        if (!stats[value]) {
          stats[value] = {count: 0, avgRating: 0};
        }
        stats[value].count++;
        stats[value].avgRating = (stats[value].avgRating * (stats[value].count - 1) + rating) / stats[value].count;
      });
    });
    
    return {
      posture: Object.entries(postureStats).map(([key, val]) => ({
        name: key,
        count: val.count,
        avgRating: Math.round(val.avgRating * 10) / 10
      })),
      location: Object.entries(locationStats).map(([key, val]) => ({
        name: key,
        count: val.count,
        avgRating: Math.round(val.avgRating * 10) / 10
      })),
      lighting: Object.entries(lightingStats).map(([key, val]) => ({
        name: key,
        count: val.count,
        avgRating: Math.round(val.avgRating * 10) / 10
      })),
      sounds: Object.entries(soundStats).map(([key, val]) => ({
        name: key,
        count: val.count,
        avgRating: Math.round(val.avgRating * 10) / 10
      }))
    };
  };

  const getProgressTrends = () => {
    if (!userData || userData.practiceSessions.length < 5) return null;
    
    const recentSessions = userData.practiceSessions.slice(-10);
    const olderSessions = userData.practiceSessions.slice(-20, -10);
    
    if (olderSessions.length === 0) return null;
    
    const recentAvgQuality = recentSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / recentSessions.length;
    const olderAvgQuality = olderSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / olderSessions.length;
    
    const recentAvgPresent = recentSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / recentSessions.length;
    const olderAvgPresent = olderSessions.reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / olderSessions.length;
    
    return {
      qualityTrend: recentAvgQuality > olderAvgQuality ? 'improving' : 
                   recentAvgQuality < olderAvgQuality ? 'declining' : 'stable',
      presentTrend: recentAvgPresent > olderAvgPresent ? 'improving' : 
                   recentAvgPresent < olderAvgPresent ? 'declining' : 'stable',
      qualityChange: Math.round((recentAvgQuality - olderAvgQuality) * 10) / 10,
      presentChange: Math.round((recentAvgPresent - olderAvgPresent) * 10) / 10,
      recentAvgQuality: Math.round(recentAvgQuality * 10) / 10,
      recentAvgPresent: Math.round(recentAvgPresent)
    };
  };

  // 🔥 LOAD DATA ON MOUNT AND USER CHANGE
  useEffect(() => {
    const loadUserData = () => {
      const storageKey = getStorageKey();
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setUserData(parsedData);
          console.log('✅ Enhanced user data loaded from localStorage');
        } catch (error) {
          console.error('Error parsing saved user data:', error);
        }
      }
    };

    loadUserData();
  }, [currentUser?.uid]);

  // 🔥 SAVE DATA WHEN IT CHANGES
  useEffect(() => {
    if (userData) {
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(userData));
    }
  }, [userData, currentUser?.uid]);

  const value: LocalDataContextType = {
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
    
    // Mind recovery getters
    getMindRecoverySessions,
    getMeditationSessions,
    getMindRecoveryAnalytics,
    
    // Auth integration
    syncWithAuthContext,
    getOnboardingStatusFromAuth,
    
    // Data manipulation
    addPracticeSession,
    addEmotionalNote,
    addReflection,
    
    // Mind recovery session addition
    addMindRecoverySession,
    
    // Advanced analytics
    getPAHMData,
    getEnvironmentData,
    getProgressTrends
  };

  return (
    <LocalDataContext.Provider value={value}>
      {children}
    </LocalDataContext.Provider>
  );
};

// 🔥 HOOK TO USE CONTEXT
export const useLocalData = () => {
  const context = useContext(LocalDataContext);
  if (context === undefined) {
    throw new Error('useLocalData must be used within a LocalDataProvider');
  }
  return context;
};