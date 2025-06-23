import React, { useState, useEffect } from 'react';
import './AnalyticsBoard.css';
import { useAuth } from './AuthContext';
import { useLocalData } from './contexts/LocalDataContext';

interface PracticeSession {
  id: string;
  date: string;
  duration: number;
  stageLevel: string;
  position: string;
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
}

interface EmotionalNote {
  id: string;
  content: string;
  timestamp: string;
  emotion?: string;
  tags?: string[];
  energyLevel?: number;
  gratitude?: string[];
}

interface AppUsageData {
  lastLogin: string;
  totalSessions: number;
  totalPracticeTime: number;
  averageSessionLength: number;
  longestStreak: number;
  currentStreak: number;
  averageQuality?: number;
  averagePresentPercentage?: number;
}

// Add interface for environment analysis items
interface EnvironmentAnalysisItem {
  name: string;
  avgRating: number;
  count?: number;
  avgPresent?: number;
}

interface EnvironmentAnalysis {
  posture: EnvironmentAnalysisItem[];
  location: EnvironmentAnalysisItem[];
  lighting: EnvironmentAnalysisItem[];
  sounds: EnvironmentAnalysisItem[];
}

const AnalyticsBoard: React.FC = () => {
  const { currentUser } = useAuth();
  const { 
    userData,
    isLoading,
    populateSampleData: basicPopulate,
    clearAllData: basicClear,
    getPracticeSessions: basicGetSessions,
    getDailyEmotionalNotes: basicGetNotes,
    getMindRecoverySessions,
    getMeditationSessions,
    getMindRecoveryAnalytics,
    getAnalyticsData,
    getPAHMData,
    getEnvironmentData,
    getProgressTrends,
    getComprehensiveAnalytics,
    exportDataForAnalysis,
    getPredictiveInsights
  } = useLocalData();
  
  // Enhanced data states
  const [practiceData, setPracticeData] = useState<PracticeSession[]>([]);
  const [emotionalNotes, setEmotionalNotes] = useState<EmotionalNote[]>([]);
  const [appUsage, setAppUsage] = useState<AppUsageData>({
    lastLogin: new Date().toISOString(),
    totalSessions: 0,
    totalPracticeTime: 0,
    averageSessionLength: 0,
    longestStreak: 0,
    currentStreak: 0,
    averageQuality: 0,
    averagePresentPercentage: 0
  });
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('month');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Get analytics data from context
  const contextAnalytics = getAnalyticsData();
  const mindRecoveryAnalytics = getMindRecoveryAnalytics();
  const pahmInsights = getPAHMData();
  const environmentAnalysis = getEnvironmentData();
  const progressTrends = getProgressTrends();
  const comprehensiveAnalytics = getComprehensiveAnalytics();
  const predictiveInsights = getPredictiveInsights();


  // 🔥 COMPREHENSIVE SAMPLE DATA GENERATOR WITH 9-CATEGORY PAHM
  const populateComprehensiveSampleData = () => {
    const comprehensiveSessions: PracticeSession[] = [
      {
        id: 'session_001',
        date: '2025-06-19T07:30:00.000Z',
        duration: 25,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_002',
        date: '2025-06-18T19:15:00.000Z',
        duration: 20,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'lying',
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
        id: 'session_003',
        date: '2025-06-17T06:45:00.000Z',
        duration: 30,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_004',
        date: '2025-06-16T12:30:00.000Z',
        duration: 15,
        stageLevel: 'Stage 1: Establishing a Practice',
        position: 'sitting',
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
        id: 'session_005',
        date: '2025-06-15T07:00:00.000Z',
        duration: 35,
        stageLevel: 'Stage 4: Continuous Attention',
        position: 'sitting',
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
        id: 'session_006',
        date: '2025-06-14T18:00:00.000Z',
        duration: 22,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'sitting',
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
        id: 'session_007',
        date: '2025-06-13T07:15:00.000Z',
        duration: 28,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_008',
        date: '2025-06-12T20:00:00.000Z',
        duration: 18,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'lying',
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
        id: 'session_009',
        date: '2025-06-11T06:30:00.000Z',
        duration: 32,
        stageLevel: 'Stage 4: Continuous Attention',
        position: 'sitting',
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
        id: 'session_010',
        date: '2025-06-10T16:45:00.000Z',
        duration: 25,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_011',
        date: '2025-06-09T07:00:00.000Z',
        duration: 20,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'sitting',
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
        id: 'session_012',
        date: '2025-06-08T19:30:00.000Z',
        duration: 26,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_013',
        date: '2025-06-07T08:15:00.000Z',
        duration: 24,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'sitting',
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
        id: 'session_014',
        date: '2025-06-06T17:00:00.000Z',
        duration: 30,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'walking',
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
        id: 'session_015',
        date: '2025-06-05T06:45:00.000Z',
        duration: 27,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
          future_aversion: 1
        }
      },
      // Mind Recovery Sessions with 9-Category PAHM
      {
        id: 'session_016',
        date: '2025-06-19T06:30:00.000Z',
        duration: 3,
        stageLevel: 'Mind Recovery: Breathing Reset',
        position: 'lying',
        rating: 9,
        notes: 'Morning recharge with breathing reset. Perfect energy boost to start the day with clarity. The 9-category PAHM system works excellently for short sessions.',
        presentPercentage: 78,
        environment: {
          posture: 'lying',
          location: 'bedroom',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 8,
          present_neutral: 9,
          present_aversion: 1,
          past_attachment: 1,
          past_neutral: 1,
          past_aversion: 0,
          future_attachment: 1,
          future_neutral: 1,
          future_aversion: 0
        }
      },
      {
        id: 'session_017',
        date: '2025-06-18T14:15:00.000Z',
        duration: 5,
        stageLevel: 'Mind Recovery: Thought Labeling',
        position: 'sitting',
        rating: 8,
        notes: 'Thought labeling practice after a stressful meeting. Quickly restored emotional balance and perspective. PAHM matrix shows effective stress processing.',
        presentPercentage: 72,
        environment: {
          posture: 'sitting',
          location: 'office',
          lighting: 'artificial',
          sounds: 'office ambient'
        },
        pahmCounts: {
          present_attachment: 5,
          present_neutral: 6,
          present_aversion: 3,
          past_attachment: 1,
          past_neutral: 0,
          past_aversion: 1,
          future_attachment: 1,
          future_neutral: 1,
          future_aversion: 1
        }
      },
      {
        id: 'session_018',
        date: '2025-06-17T12:00:00.000Z',
        duration: 4,
        stageLevel: 'Mind Recovery: Body Scan',
        position: 'sitting',
        rating: 8,
        notes: 'Midday body scan to refresh mental clarity. Great reset for afternoon productivity. The 9-category system captures body-mind integration beautifully.',
        presentPercentage: 75,
        environment: {
          posture: 'sitting',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 6,
          present_neutral: 8,
          present_aversion: 2,
          past_attachment: 1,
          past_neutral: 1,
          past_aversion: 0,
          future_attachment: 1,
          future_neutral: 1,
          future_aversion: 1
        }
      },
      {
        id: 'session_019',
        date: '2025-06-16T18:30:00.000Z',
        duration: 4,
        stageLevel: 'Mind Recovery: Single Point Focus',
        position: 'sitting',
        rating: 9,
        notes: 'Single point focus for work-to-home transition. Perfect way to leave work stress behind. PAHM analysis shows clean transition patterns.',
        presentPercentage: 81,
        environment: {
          posture: 'sitting',
          location: 'car',
          lighting: 'evening',
          sounds: 'quiet'
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
          future_aversion: 0
        }
      },
      {
        id: 'session_020',
        date: '2025-06-15T21:45:00.000Z',
        duration: 3,
        stageLevel: 'Mind Recovery: Loving Kindness',
        position: 'lying',
        rating: 8,
        notes: 'Evening loving kindness before sleep. Wonderful way to unwind and prepare for rest. The 9-category PAHM matrix captures the heart-opening quality.',
        presentPercentage: 76,
        environment: {
          posture: 'lying',
          location: 'bedroom',
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
        }
      },
      {
        id: 'session_021',
        date: '2025-06-14T10:30:00.000Z',
        duration: 2,
        stageLevel: 'Mind Recovery: Gratitude Moment',
        position: 'sitting',
        rating: 8,
        notes: 'Gratitude moment during busy morning. Quick but powerful reset for positive mindset. Even 2-minute sessions show clear PAHM patterns.',
        presentPercentage: 74,
        environment: {
          posture: 'standing',
          location: 'kitchen',
          lighting: 'natural',
          sounds: 'morning sounds'
        },
        pahmCounts: {
          present_attachment: 5,
          present_neutral: 7,
          present_aversion: 1,
          past_attachment: 1,
          past_neutral: 1,
          past_aversion: 0,
          future_attachment: 1,
          future_neutral: 1,
          future_aversion: 0
        }
      },
      // Additional comprehensive sessions for robust data
      {
        id: 'session_022',
        date: '2025-06-13T15:20:00.000Z',
        duration: 12,
        stageLevel: 'Mind Recovery: Mindful Transition',
        position: 'walking',
        rating: 7,
        notes: 'Mindful walking between meetings. Helps maintain awareness throughout busy workday. PAHM tracking shows how movement supports mindfulness.',
        presentPercentage: 68,
        environment: {
          posture: 'walking',
          location: 'outdoor',
          lighting: 'cloudy',
          sounds: 'urban'
        },
        pahmCounts: {
          present_attachment: 8,
          present_neutral: 12,
          present_aversion: 3,
          past_attachment: 2,
          past_neutral: 1,
          past_aversion: 1,
          future_attachment: 3,
          future_neutral: 2,
          future_aversion: 2
        }
      },
      {
        id: 'session_023',
        date: '2025-06-12T11:45:00.000Z',
        duration: 8,
        stageLevel: 'Mind Recovery: Stress Release',
        position: 'sitting',
        rating: 8,
        notes: 'Quick stress release technique during overwhelming day. Immediate relief and clarity. The 9-category system captures stress transformation patterns.',
        presentPercentage: 71,
        environment: {
          posture: 'sitting',
          location: 'office',
          lighting: 'fluorescent',
          sounds: 'air conditioning'
        },
        pahmCounts: {
          present_attachment: 6,
          present_neutral: 10,
          present_aversion: 4,
          past_attachment: 1,
          past_neutral: 1,
          past_aversion: 2,
          future_attachment: 2,
          future_neutral: 1,
          future_aversion: 3
        }
      },
      {
        id: 'session_024',
        date: '2025-06-11T22:15:00.000Z',
        duration: 15,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'lying',
        rating: 9,
        notes: 'Late night session for sleep preparation. Deep relaxation and letting go. Perfect PAHM distribution for sleep transition.',
        presentPercentage: 83,
        environment: {
          posture: 'lying',
          location: 'bedroom',
          lighting: 'moonlight',
          sounds: 'night sounds'
        },
        pahmCounts: {
          present_attachment: 8,
          present_neutral: 16,
          present_aversion: 1,
          past_attachment: 1,
          past_neutral: 2,
          past_aversion: 0,
          future_attachment: 1,
          future_neutral: 1,
          future_aversion: 0
        }
      },
      {
        id: 'session_025',
        date: '2025-06-10T05:30:00.000Z',
        duration: 40,
        stageLevel: 'Stage 4: Continuous Attention',
        position: 'sitting',
        rating: 10,
        notes: 'Extended early morning session. Deepest states achieved so far. The 9-category PAHM matrix reveals exceptional present-moment stability.',
        presentPercentage: 94,
        environment: {
          posture: 'sitting',
          location: 'meditation room',
          lighting: 'candle',
          sounds: 'silence'
        },
        pahmCounts: {
          present_attachment: 25,
          present_neutral: 35,
          present_aversion: 1,
          past_attachment: 0,
          past_neutral: 1,
          past_aversion: 0,
          future_attachment: 1,
          future_neutral: 1,
          future_aversion: 0
        }
      }
    ];


    const comprehensiveNotes: EmotionalNote[] = [
      {
        id: 'note_001',
        content: 'Feeling incredibly centered and peaceful after this morning\'s meditation. The natural light streaming through the window created such a serene atmosphere. I noticed my mind was particularly stable today, with very few distractions pulling me away from the breath. There\'s a sense of deep contentment that seems to be growing stronger with each practice session. The 9-category PAHM system is revealing fascinating patterns in my mental states.',
        timestamp: '2025-06-19T08:00:00.000Z',
        emotion: 'peaceful',
        energyLevel: 8,
        tags: ['morning', 'centered', 'stable', 'PAHM-tracking'],
        gratitude: ['Beautiful sunrise', 'Quiet morning time', 'Growing inner peace', 'Advanced tracking system']
      },
      {
        id: 'note_002',
        content: 'Evening practice was exactly what I needed after a challenging day at work. The meditation music helped create a cocoon of tranquility. I could feel the stress and tension from the day melting away with each exhale. By the end of the session, I felt completely renewed and ready for a restful night\'s sleep. The PAHM matrix showed clear transition from stress to calm.',
        timestamp: '2025-06-18T20:00:00.000Z',
        emotion: 'relieved',
        energyLevel: 6,
        tags: ['evening', 'stress-relief', 'renewal', 'work-transition'],
        gratitude: ['Peaceful evening', 'Healing meditation music', 'Stress release', 'Effective techniques']
      },
      {
        id: 'note_003',
        content: 'Outdoor meditation was absolutely transformative today! The sounds of birds chirping and leaves rustling created the most perfect natural soundtrack. I felt so connected to nature and to something larger than myself. The fresh air and gentle breeze seemed to enhance every aspect of the practice. This is definitely something I want to do more often. The 9-category PAHM analysis captured this profound connection beautifully.',
        timestamp: '2025-06-17T07:30:00.000Z',
        emotion: 'connected',
        energyLevel: 9,
        tags: ['outdoor', 'nature', 'transformative', 'connection'],
        gratitude: ['Beautiful weather', 'Nature\'s symphony', 'Feeling of connection', 'Outdoor access']
      },
      {
        id: 'note_004',
        content: 'Short lunch break meditation was surprisingly effective. Even just 15 minutes made such a difference in my afternoon energy and focus. I was feeling scattered and overwhelmed before the session, but afterwards I felt clear-headed and ready to tackle the rest of my tasks. It\'s amazing how quickly meditation can shift our state of mind. The PAHM tracking shows how even brief sessions create measurable changes.',
        timestamp: '2025-06-16T13:00:00.000Z',
        emotion: 'focused',
        energyLevel: 7,
        tags: ['lunch-break', 'clarity', 'quick-reset', 'workplace'],
        gratitude: ['Time for self-care', 'Mental clarity', 'Renewed focus', 'Workplace flexibility']
      },
      {
        id: 'note_005',
        content: 'The sound of rain during today\'s meditation created such a beautiful, meditative atmosphere. I found myself naturally synchronizing my breath with the rhythm of the raindrops. There were moments of such profound stillness and presence that I lost all sense of time. These are the sessions that remind me why I love this practice so much. The 9-category PAHM matrix perfectly captured these timeless moments.',
        timestamp: '2025-06-15T07:45:00.000Z',
        emotion: 'blissful',
        energyLevel: 9,
        tags: ['rain', 'rhythm', 'timeless', 'profound'],
        gratitude: ['Soothing rain sounds', 'Deep stillness', 'Timeless moments', 'Perfect conditions']
      },
      {
        id: 'note_006',
        content: 'Building consistency is really paying off. I can feel my meditation "muscle" getting stronger each day. What used to feel like a struggle now feels more natural and effortless. The evening sessions are becoming a cherished part of my daily routine, a time I genuinely look forward to. It\'s wonderful to see how practice truly does make progress. The PAHM data confirms this gradual improvement.',
        timestamp: '2025-06-14T18:30:00.000Z',
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['consistency', 'progress', 'routine', 'growth'],
        gratitude: ['Growing discipline', 'Visible progress', 'Daily routine', 'Measurable improvement']
      },
      {
        id: 'note_007',
        content: 'Morning clarity continues to amaze me. There\'s something special about the quality of awareness in the early hours. My mind feels fresh, alert, and naturally inclined toward stillness. The bird songs outside my window seem to support and enhance the meditation rather than distract from it. I\'m grateful for these peaceful morning moments. The 9-category tracking reveals the unique quality of dawn practice.',
        timestamp: '2025-06-13T08:00:00.000Z',
        emotion: 'clear',
        energyLevel: 8,
        tags: ['morning-clarity', 'alertness', 'natural-stillness', 'dawn'],
        gratitude: ['Fresh morning mind', 'Bird songs', 'Peaceful moments', 'Natural support']
      },
      {
        id: 'note_008',
        content: 'Late evening session was perfect for letting go of the day. Lying down meditation felt so nurturing and restorative. The candlelight created such a warm, intimate atmosphere for practice. I could feel my body and mind naturally preparing for sleep. This is becoming my favorite way to transition from day to night. The PAHM analysis shows beautiful sleep preparation patterns.',
        timestamp: '2025-06-12T20:30:00.000Z',
        emotion: 'nurtured',
        energyLevel: 6,
        tags: ['evening', 'restorative', 'transition', 'sleep-prep'],
        gratitude: ['Candlelight ambiance', 'Restorative practice', 'Peaceful transition', 'Nurturing space']
      },
      {
        id: 'note_009',
        content: 'What an incredible breakthrough session! I experienced states of consciousness I\'ve never accessed before. There were periods of such profound unity and interconnectedness that brought tears of joy to my eyes. The sound of flowing water seemed to carry me deeper and deeper into meditation. I feel like I\'ve touched something sacred and eternal. The 9-category PAHM matrix captured this transcendent experience perfectly.',
        timestamp: '2025-06-11T07:15:00.000Z',
        emotion: 'transcendent',
        energyLevel: 10,
        tags: ['breakthrough', 'unity', 'sacred', 'transcendent'],
        gratitude: ['Profound experience', 'Flowing water sounds', 'Sacred moments', 'Breakthrough states']
      },
      {
        id: 'note_010',
        content: 'Afternoon meditation after a stressful work situation was exactly what I needed. I could feel the tension and anxiety literally dissolving as I settled into the practice. By the end of the session, I had gained a completely new perspective on the challenges I was facing. Meditation truly is a powerful tool for emotional regulation and mental clarity. The PAHM tracking shows clear stress transformation patterns.',
        timestamp: '2025-06-10T17:30:00.000Z',
        emotion: 'balanced',
        energyLevel: 7,
        tags: ['stress-relief', 'perspective', 'emotional-regulation', 'transformation'],
        gratitude: ['Stress relief', 'New perspective', 'Emotional balance', 'Effective tools']
      },
      {
        id: 'note_011',
        content: 'Mind Recovery breathing reset is becoming a powerful daily ritual. Sets such a positive tone for the entire day. The simplicity of focusing on breath for just a few minutes creates such profound shifts in energy and clarity. I love how accessible and effective these short practices are. The 9-category PAHM system works beautifully even for these brief sessions.',
        timestamp: '2025-06-19T08:00:00.000Z',
        emotion: 'energized',
        energyLevel: 9,
        tags: ['morning routine', 'breathing reset', 'daily ritual', 'accessibility'],
        gratitude: ['Morning clarity', 'Quick techniques', 'Consistent practice', 'Effective methods']
      },
      {
        id: 'note_012',
        content: 'The thought labeling practice saved my day. Amazing how quickly it shifted my emotional state after that stressful meeting. Just naming the thoughts and emotions as they arose created enough space to respond rather than react. This technique is becoming invaluable for workplace stress management. The PAHM matrix shows how labeling creates immediate present-moment awareness.',
        timestamp: '2025-06-18T15:00:00.000Z',
        emotion: 'relieved',
        energyLevel: 7,
        tags: ['emotional balance', 'stress relief', 'quick recovery', 'workplace'],
        gratitude: ['Emotional tools', 'Quick relief', 'Stress management', 'Workplace skills']
      },
      {
        id: 'note_013',
        content: 'Walking meditation in the park opened up a whole new dimension of practice. The combination of movement and mindfulness felt so natural and integrated. I noticed how each step could become an anchor for awareness, just like the breath in sitting meditation. The changing scenery and sounds became part of the meditation rather than distractions. The 9-category PAHM tracking reveals unique patterns for movement-based practice.',
        timestamp: '2025-06-06T17:30:00.000Z',
        emotion: 'integrated',
        energyLevel: 8,
        tags: ['walking meditation', 'movement', 'integration', 'nature'],
        gratitude: ['Movement practice', 'Park access', 'Natural integration', 'New dimensions']
      },
      {
        id: 'note_014',
        content: 'The extended 40-minute session this morning was a journey into uncharted territory. I experienced layers of consciousness I didn\'t know existed. There were periods where the sense of self completely dissolved into pure awareness. Coming back to ordinary consciousness felt like returning from a profound journey. These deep states are becoming more accessible with consistent practice. The PAHM data shows unprecedented present-moment stability.',
        timestamp: '2025-06-10T06:10:00.000Z',
        emotion: 'profound',
        energyLevel: 10,
        tags: ['extended session', 'deep states', 'consciousness', 'journey'],
        gratitude: ['Deep states', 'Extended time', 'Consciousness exploration', 'Consistent practice']
      },
      {
        id: 'note_015',
        content: 'Body scan practice during lunch break created such a refreshing reset. I could feel tension I didn\'t even know I was carrying just melting away. Starting from the top of my head and slowly moving down through each part of my body, I discovered areas of holding and stress. By the end, I felt like I had given myself a complete internal massage. The 9-category PAHM system captures the body-mind integration beautifully.',
        timestamp: '2025-06-17T12:30:00.000Z',
        emotion: 'refreshed',
        energyLevel: 8,
        tags: ['body scan', 'tension release', 'integration', 'lunch break'],
        gratitude: ['Body awareness', 'Tension release', 'Integration practice', 'Midday reset']
      },
      {
        id: 'note_016',
        content: 'Loving kindness practice before sleep has become such a beautiful way to end the day. Starting with sending love to myself, then extending it to loved ones, neutral people, difficult people, and finally all beings everywhere. My heart feels so open and connected by the end. It\'s amazing how this practice transforms any residual negativity from the day into warmth and compassion. The PAHM analysis shows the heart-opening quality clearly.',
        timestamp: '2025-06-15T22:00:00.000Z',
        emotion: 'loving',
        energyLevel: 7,
        tags: ['loving kindness', 'heart opening', 'compassion', 'bedtime'],
        gratitude: ['Open heart', 'Compassion practice', 'Connection', 'Peaceful sleep']
      },
      {
        id: 'note_017',
        content: 'The gratitude moment practice is such a simple yet powerful technique. Taking just two minutes to consciously appreciate three things from my day completely shifts my perspective. Even on challenging days, I can always find something to be grateful for. This practice is training my mind to naturally notice the positive aspects of life. The 9-category PAHM tracking shows how gratitude enhances present-moment awareness.',
        timestamp: '2025-06-14T10:45:00.000Z',
        emotion: 'grateful',
        energyLevel: 8,
        tags: ['gratitude', 'perspective shift', 'positivity', 'appreciation'],
        gratitude: ['Simple practices', 'Perspective shifts', 'Positive training', 'Daily appreciation']
      },
      {
        id: 'note_018',
        content: 'Mindful transition practice between meetings is becoming a game-changer for my workday. Instead of rushing from one thing to the next, I take a few conscious breaths and set an intention for the next activity. This creates space and prevents the accumulation of stress throughout the day. I arrive at each meeting more present and centered. The PAHM matrix shows how these micro-practices maintain awareness.',
        timestamp: '2025-06-13T15:45:00.000Z',
        emotion: 'centered',
        energyLevel: 7,
        tags: ['mindful transition', 'work practice', 'intention setting', 'presence'],
        gratitude: ['Workplace mindfulness', 'Transition practices', 'Centered presence', 'Stress prevention']
      },
      {
        id: 'note_019',
        content: 'The stress release technique during that overwhelming afternoon was like finding an oasis in the desert. I could feel my nervous system shifting from fight-or-flight into rest-and-digest mode. The technique of breathing into the belly while consciously relaxing each muscle group created immediate relief. It\'s incredible how quickly the body responds to conscious relaxation. The 9-category PAHM data shows clear stress transformation patterns.',
        timestamp: '2025-06-12T12:00:00.000Z',
        emotion: 'relieved',
        energyLevel: 6,
        tags: ['stress release', 'nervous system', 'relaxation', 'immediate relief'],
        gratitude: ['Stress relief tools', 'Body wisdom', 'Quick techniques', 'Nervous system healing']
      },
      {
        id: 'note_020',
        content: 'Late night meditation for sleep preparation has revolutionized my relationship with bedtime. Instead of lying awake with a racing mind, I now have a reliable way to transition into rest. The practice of progressive relaxation combined with breath awareness creates the perfect conditions for sleep. I fall asleep faster and sleep more deeply. The PAHM analysis reveals beautiful sleep preparation patterns.',
        timestamp: '2025-06-11T22:30:00.000Z',
        emotion: 'peaceful',
        energyLevel: 5,
        tags: ['sleep preparation', 'bedtime routine', 'progressive relaxation', 'deep sleep'],
        gratitude: ['Better sleep', 'Bedtime peace', 'Relaxation techniques', 'Restful nights']
      }
    ];

    setPracticeData(comprehensiveSessions);
    setEmotionalNotes(comprehensiveNotes);
    
    // Calculate comprehensive app usage
    const totalSessions = comprehensiveSessions.length;
    const totalPracticeTime = comprehensiveSessions.reduce((sum, session) => sum + session.duration, 0);
    const averageSessionLength = Math.round(totalPracticeTime / totalSessions);
    const averageQuality = comprehensiveSessions.reduce((sum, session) => sum + (session.rating || 0), 0) / totalSessions;
    const averagePresentPercentage = comprehensiveSessions.reduce((sum, session) => sum + (session.presentPercentage || 0), 0) / totalSessions;
    
    setAppUsage({
      lastLogin: new Date().toISOString(),
      totalSessions,
      totalPracticeTime,
      averageSessionLength,
      longestStreak: 18,
      currentStreak: 12,
      averageQuality: Math.round(averageQuality * 10) / 10,
      averagePresentPercentage: Math.round(averagePresentPercentage)
    });

    // Also populate basic data
    if (basicPopulate) {
      basicPopulate();
    }

    console.log('🎯 Comprehensive sample data with 9-Category PAHM Matrix populated!');
  };

  // Clear all data
  const clearAllData = () => {
  setPracticeData([]);
  setEmotionalNotes([]);
  setAppUsage({
    lastLogin: new Date().toISOString(),
    totalSessions: 0,
    totalPracticeTime: 0,
    averageSessionLength: 0,
    longestStreak: 0,
    currentStreak: 0,
    averageQuality: 0,
    averagePresentPercentage: 0
    });
    
    localStorage.removeItem('comprehensivePracticeData');
    localStorage.removeItem('comprehensiveEmotionalNotes');
    localStorage.removeItem('comprehensiveAppUsage');
    
    if (basicClear) {
      basicClear();
    }
    
    console.log('🗑️ All comprehensive data cleared!');
  };

  // Load data on mount and sync with context
  useEffect(() => {
    // Try to load from localStorage first
    const savedPracticeData = localStorage.getItem('comprehensivePracticeData');
    const savedEmotionalNotes = localStorage.getItem('comprehensiveEmotionalNotes');
    const savedAppUsage = localStorage.getItem('comprehensiveAppUsage');

    if (savedPracticeData) {
      try {
        setPracticeData(JSON.parse(savedPracticeData));
      } catch (e) {
        console.error('Error parsing practice data:', e);
      }
    }

    if (savedEmotionalNotes) {
      try {
        setEmotionalNotes(JSON.parse(savedEmotionalNotes));
      } catch (e) {
        console.error('Error parsing emotional notes:', e);
      }
    }

    if (savedAppUsage) {
      try {
        setAppUsage(JSON.parse(savedAppUsage));
      } catch (e) {
        console.error('Error parsing app usage:', e);
      }
    }

    // Sync with context data if available
    if (contextAnalytics && userData) {
      const sessions = basicGetSessions();
      const notes = basicGetNotes();
      
      // Convert context sessions to local format with 9-category PAHM
      const convertedSessions = sessions.map(session => ({
        id: session.sessionId,
        date: session.timestamp,
        duration: session.duration,
        stageLevel: session.sessionType === 'meditation' ? session.stageLabel || 'Unknown Stage' : 
                   session.mindRecoveryContext ? 
                   `Mind Recovery: ${session.mindRecoveryContext.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}` :
                   'Mind Recovery',
        position: session.environment?.posture || 'sitting',
        rating: session.rating,
        notes: session.notes,
        presentPercentage: session.presentPercentage,
        environment: session.environment,
        pahmCounts: session.pahmCounts
      }));
      
      // Convert emotional notes
      const convertedNotes = notes.map(note => ({
        id: note.noteId,
        content: note.content,
        timestamp: note.timestamp,
        emotion: note.emotion,
        tags: note.tags,
        energyLevel: note.energyLevel,
        gratitude: note.gratitude
      }));
      
      setPracticeData(convertedSessions);
      setEmotionalNotes(convertedNotes);
      
      // Update app usage from context
      setAppUsage({
        lastLogin: new Date().toISOString(),
        totalSessions: contextAnalytics.totalSessions,
        totalPracticeTime: contextAnalytics.totalPracticeTime,
        averageSessionLength: contextAnalytics.averageSessionLength,
        longestStreak: contextAnalytics.longestStreak,
        currentStreak: contextAnalytics.currentStreak,
        averageQuality: contextAnalytics.averageQuality,
        averagePresentPercentage: contextAnalytics.averagePresentPercentage
      });
    }
  }, [contextAnalytics, userData]);

  // Save data when it changes
  useEffect(() => {
    if (practiceData.length > 0) {
      localStorage.setItem('comprehensivePracticeData', JSON.stringify(practiceData));
    }
  }, [practiceData]);

  useEffect(() => {
    if (emotionalNotes.length > 0) {
      localStorage.setItem('comprehensiveEmotionalNotes', JSON.stringify(emotionalNotes));
    }
  }, [emotionalNotes]);

  useEffect(() => {
    if (appUsage.totalSessions > 0) {
      localStorage.setItem('comprehensiveAppUsage', JSON.stringify(appUsage));
    }
  }, [appUsage]);

  // Filter data based on time range
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
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        cutoffDate.setMonth(now.getMonth() - 1);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get emotion distribution
  const getEmotionDistribution = () => {
    const { notes } = getFilteredData();
    const emotionCounts: {[key: string]: number} = {};
    
    notes.forEach(note => {
      const emotion = note.emotion || 'neutral';
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion: emotion.charAt(0).toUpperCase() + emotion.slice(1),
      count,
      color: getEmotionColor(emotion)
    }));
  };

  // Get emotion color
  const getEmotionColor = (emotion: string): string => {
    const colors: {[key: string]: string} = {
      joy: '#FFD700',
      joyful: '#FFD700',
      content: '#90EE90',
      peaceful: '#87CEEB',
      relieved: '#98FB98',
      satisfied: '#DDA0DD',
      amazed: '#FF69B4',
      serene: '#B0E0E6',
      ecstatic: '#FF6347',
      transformed: '#9370DB',
      energized: '#32CD32',
      connected: '#20B2AA',
      focused: '#4169E1',
      blissful: '#DA70D6',
      accomplished: '#228B22',
      clear: '#00CED1',
      nurtured: '#DDA0DD',
      transcendent: '#8A2BE2',
      balanced: '#32CD32',
      integrated: '#4682B4',
      profound: '#800080',
      refreshed: '#00FA9A',
      loving: '#FF1493',
      grateful: '#FFA500',
      centered: '#6495ED',
      sadness: '#6495ED',
      anger: '#FF6347',
      fear: '#9370DB',
      neutral: '#A9A9A9'
    };
    return colors[emotion.toLowerCase()] || '#A9A9A9';
  };

  // Get practice duration trend
  const getPracticeDurationData = () => {
    const { practice } = getFilteredData();
    
    if (practice.length === 0) return [];
    
    const durationByDate: {[key: string]: number} = {};
    practice.forEach(session => {
      const dateKey = new Date(session.date).toLocaleDateString();
      durationByDate[dateKey] = (durationByDate[dateKey] || 0) + session.duration;
    });
    
    const sortedDates = Object.keys(durationByDate).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
    
    return sortedDates.map(date => ({
      date,
      duration: durationByDate[date]
    }));
  };

  // Get practice distribution by stage
  const getPracticeDistribution = () => {
    const { practice } = getFilteredData();
    
    if (practice.length === 0) return [];
    
    const countByStage: {[key: string]: number} = {};
    practice.forEach(session => {
      const stageKey = session.stageLevel.includes('Mind Recovery') ? 'Mind Recovery' : 
                      session.stageLevel.split(':')[0].trim();
      countByStage[stageKey] = (countByStage[stageKey] || 0) + 1;
    });
    
    return Object.entries(countByStage).map(([stage, count]) => ({
      stage,
      count
    }));
  };


  // Get comprehensive statistics
  const getComprehensiveStats = () => {
    const { practice, notes } = getFilteredData();
    
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
    
    const meditationSessions = practice.filter(s => !s.stageLevel.includes('Mind Recovery')).length;
    const mindRecoverySessions = practice.filter(s => s.stageLevel.includes('Mind Recovery')).length;
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
  };

  // Get 9-Category PAHM insights
  const get9CategoryPAHMInsights = () => {
    const { practice } = getFilteredData();
    
    const sessionsWithPAHM = practice.filter(s => s.pahmCounts);
    
    if (sessionsWithPAHM.length === 0) return null;
    
    // Aggregate all PAHM counts
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
    
    sessionsWithPAHM.forEach(session => {
      if (session.pahmCounts) {
        Object.keys(totalPAHM).forEach(key => {
          totalPAHM[key as keyof typeof totalPAHM] += session.pahmCounts![key as keyof typeof session.pahmCounts];
        });
      }
    });
    
    const totalCounts = Object.values(totalPAHM).reduce((sum, count) => sum + count, 0);
    
    // Calculate distributions
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
    
    const presentPercentage = Math.round((timeDistribution.present / totalCounts) * 100);
    const neutralPercentage = Math.round((emotionalDistribution.neutral / totalCounts) * 100);
    
    return {
      totalPAHM,
      totalCounts,
      timeDistribution,
      emotionalDistribution,
      presentPercentage,
      neutralPercentage,
      sessionsAnalyzed: sessionsWithPAHM.length,
      totalObservations: totalCounts
    };
  };

  // Get environment analysis
  const getEnvironmentAnalysis = (): EnvironmentAnalysis => {
    const { practice } = getFilteredData();
    const withEnv = practice.filter(s => s.environment);
    
    if (withEnv.length === 0) {
      return {
        posture: [],
        location: [],
        lighting: [],
        sounds: []
      };
    }
    
    const postureStats: {[key: string]: {count: number, avgRating: number, avgPresent: number}} = {};
    const locationStats: {[key: string]: {count: number, avgRating: number, avgPresent: number}} = {};
    const lightingStats: {[key: string]: {count: number, avgRating: number, avgPresent: number}} = {};
    const soundStats: {[key: string]: {count: number, avgRating: number, avgPresent: number}} = {};
    
    withEnv.forEach(session => {
      const env = session.environment!;
      const rating = session.rating || 0;
      const present = session.presentPercentage || 0;
      
      ['posture', 'location', 'lighting', 'sounds'].forEach(key => {
        const value = env[key as keyof typeof env];
        const stats = key === 'posture' ? postureStats : 
                     key === 'location' ? locationStats :
                     key === 'lighting' ? lightingStats : soundStats;
        
        if (!stats[value]) {
          stats[value] = {count: 0, avgRating: 0, avgPresent: 0};
        }
        stats[value].count++;
        stats[value].avgRating = (stats[value].avgRating * (stats[value].count - 1) + rating) / stats[value].count;
        stats[value].avgPresent = (stats[value].avgPresent * (stats[value].count - 1) + present) / stats[value].count;
      });
    });
    
    const formatStats = (stats: any) => 
      Object.entries(stats)
        .map(([key, val]: [string, any]) => ({
          name: key,
          count: val.count,
          avgRating: Math.round(val.avgRating * 10) / 10,
          avgPresent: Math.round(val.avgPresent)
        }))
        .sort((a, b) => b.avgRating - a.avgRating);
    
    return {
      posture: formatStats(postureStats),
      location: formatStats(locationStats),
      lighting: formatStats(lightingStats),
      sounds: formatStats(soundStats)
    };
  };

  // Get Mind Recovery insights
  const getMindRecoveryInsights = () => {
    const { practice } = getFilteredData();
    const mindRecoverySessions = practice.filter(s => s.stageLevel.includes('Mind Recovery'));
    
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
      const technique = session.stageLevel.replace('Mind Recovery: ', '');
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
  };

  // Get app usage patterns
  const getAppUsagePatterns = () => {
    const { practice } = getFilteredData();
    
    // Session timing analysis
    const timeOfDayStats: {[key: string]: number} = {};
    const dayOfWeekStats: {[key: string]: number} = {};
    const sessionLengthDistribution: {[key: string]: number} = {};
    
    practice.forEach(session => {
      const date = new Date(session.date);
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
      averageSessionsPerWeek: Math.round((practice.length / 4) * 10) / 10, // Assuming month view
      consistency: practice.length > 20 ? 'High' : practice.length > 10 ? 'Medium' : 'Low'
    };
  };

  // Get feature utilization
  const getFeatureUtilization = () => {
    const { practice, notes } = getFilteredData();
    
    const features = {
      meditation: practice.filter(s => !s.stageLevel.includes('Mind Recovery')).length,
      mindRecovery: practice.filter(s => s.stageLevel.includes('Mind Recovery')).length,
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
  };

  // Get engagement metrics
  const getEngagementMetrics = () => {
    const { practice, notes } = getFilteredData();
    
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const lastWeekSessions = practice.filter(s => new Date(s.date) >= weekAgo).length;
    const lastMonthSessions = practice.filter(s => new Date(s.date) >= monthAgo).length;
    
    const avgSessionQuality = practice.reduce((sum, s) => sum + (s.rating || 0), 0) / practice.length;
    const notesPerSession = notes.length / practice.length;
    
    return {
      weeklyFrequency: lastWeekSessions,
      monthlyFrequency: lastMonthSessions,
      averageQuality: Math.round(avgSessionQuality * 10) / 10,
      engagementLevel: avgSessionQuality >= 8 ? 'High' : avgSessionQuality >= 6 ? 'Medium' : 'Low',
      notesPerSession: Math.round(notesPerSession * 10) / 10,
      documentationHabit: notesPerSession >= 0.5 ? 'Excellent' : notesPerSession >= 0.25 ? 'Good' : 'Basic'
    };
  };

  // 🎨 RICH CHART COMPONENTS

  // Enhanced Bar Chart
  const EnhancedBarChart = ({ data, valueKey, labelKey, colorKey, title }: { 
    data: any[], 
    valueKey: string, 
    labelKey: string,
    colorKey?: string,
    title?: string
  }) => {
    if (data.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          No data available for {title || 'chart'}
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(item => item[valueKey]));
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {title && <h4 style={{ marginBottom: '20px', color: '#333' }}>{title}</h4>}
        <div style={{ display: 'grid', gap: '12px' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                minWidth: '100px', 
                fontSize: '14px', 
                fontWeight: '500',
                color: '#555'
              }}>
                {item[labelKey]}
              </div>
              <div style={{ 
                flex: 1, 
                background: '#f0f0f0', 
                height: '24px', 
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div 
                  style={{ 
                    width: `${(item[valueKey] / maxValue) * 100}%`,
                    height: '100%',
                    background: colorKey ? item[colorKey] : `linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)`,
                    borderRadius: '12px',
                    transition: 'width 0.8s ease-in-out'
                  }}
                />
              </div>
              <div style={{ 
                minWidth: '40px', 
                textAlign: 'right', 
                fontWeight: '600',
                color: '#333'
              }}>
                {item[valueKey]}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Enhanced Line Chart
  const EnhancedLineChart = ({ data, title }: { 
    data: {date: string, duration: number}[],
    title?: string 
  }) => {
    if (data.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          No practice data available
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(item => item.duration));
    const minValue = Math.min(...data.map(item => item.duration));
    const chartHeight = 200;
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {title && <h4 style={{ marginBottom: '20px', color: '#333' }}>{title}</h4>}
        <div style={{ 
          position: 'relative', 
          height: `${chartHeight}px`,
          background: 'linear-gradient(to bottom, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" style={{ position: 'absolute' }}>
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
          <div style={{ 
            position: 'absolute', 
            bottom: '10px', 
            left: '10px', 
            fontSize: '12px', 
            color: '#666' 
          }}>
            Min: {minValue}min
          </div>
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px', 
            fontSize: '12px', 
            color: '#666' 
          }}>
            Max: {maxValue}min
          </div>
        </div>
        <div style={{ 
          marginTop: '15px', 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#666'
        }}>
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </div>
    );
  };

  // 9-Category PAHM Matrix Chart
  const PAHMMatrixChart = ({ insights }: { insights: any }) => {
    if (!insights) return null;
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '25px', 
        borderRadius: '16px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        <h4 style={{ 
          fontSize: '1.3rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#333'
        }}>
          🧠 9-Category PAHM Matrix
        </h4>
        
        {/* Matrix Table */}
        <div style={{ 
          marginBottom: '20px',
          overflowX: 'auto'
        }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
            minWidth: '500px'
          }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <th style={{ 
                  padding: '12px', 
                  color: 'white', 
                  fontWeight: '700',
                  borderRadius: '8px 0 0 0'
                }}>
                  Time/Emotion
                </th>
                <th style={{ 
                  padding: '12px', 
                  color: 'white', 
                  fontWeight: '700'
                }}>
                  Attachment
                </th>
                <th style={{ 
                  padding: '12px', 
                  color: 'white', 
                  fontWeight: '700'
                }}>
                  Neutral
                </th>
                <th style={{ 
                  padding: '12px', 
                  color: 'white', 
                  fontWeight: '700',
                  borderRadius: '0 8px 0 0'
                }}>
                  Aversion
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: '#f8f9fa' }}>
                <td style={{ 
                  padding: '12px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white'
                }}>
                  Present
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.present_attachment}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.present_neutral}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.present_aversion}
                </td>
              </tr>
              <tr>
                <td style={{ 
                  padding: '12px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white'
                }}>
                  Past
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.past_attachment}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.past_neutral}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.past_aversion}
                </td>
              </tr>
              <tr style={{ background: '#f8f9fa' }}>
                <td style={{ 
                  padding: '12px', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white'
                }}>
                  Future
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.future_attachment}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.future_neutral}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
                  fontWeight: '600'
                }}>
                  {insights.totalPAHM.future_aversion}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Summary Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{ 
            textAlign: 'center',
            padding: '15px',
            background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {insights.presentPercentage}%
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Present Moment
            </div>
          </div>
          <div style={{ 
            textAlign: 'center',
            padding: '15px',
            background: 'linear-gradient(135deg, #9e9e9e 0%, #757575 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {insights.neutralPercentage}%
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Neutral States
            </div>
          </div>
          <div style={{ 
            textAlign: 'center',
            padding: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            color: 'white'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {insights.totalObservations}
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
              Total Observations
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mind Recovery Context Chart
  const MindRecoveryContextChart = ({ analytics }: { analytics: any }) => {
    if (!analytics || !analytics.contextStats) return null;
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ marginBottom: '20px', color: '#333' }}>🕐 Mind Recovery Contexts</h4>
        <div style={{ display: 'grid', gap: '10px' }}>
          {analytics.contextStats.slice(0, 5).map((context: any, index: number) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '10px',
              background: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <span style={{ fontWeight: '500', color: '#333' }}>
                {context.context.split('-').map((word: string) => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {context.count} sessions
                </span>
                <span style={{ 
                  fontWeight: '600',
                  color: '#fa709a'
                }}>
                  {context.avgRating}/10
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get current data for display
  const stats = getComprehensiveStats();
  const localPahmInsights = get9CategoryPAHMInsights();
  const environmentAnalysisLocal = getEnvironmentAnalysis();
  const mindRecoveryInsights = getMindRecoveryInsights();
  const currentPahmInsights = localPahmInsights;
  const currentMindRecoveryAnalytics = mindRecoveryAnalytics;


  // Render Overview Tab
  const renderOverviewTab = () => (
    <div>
      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '40px' 
      }}>
        {[
          {
            value: contextAnalytics?.totalSessions || stats.totalSessions,
            label: 'Total Sessions',
            icon: '🧘',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            insight: `${stats.meditationSessions} meditation + ${stats.mindRecoverySessions} recovery`
          },
          {
            value: Math.round((contextAnalytics?.totalPracticeTime || stats.totalMinutes) / 60),
            label: 'Practice Hours',
            icon: '⏰',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            insight: `${stats.averageDuration}min avg`
          },
          {
            value: contextAnalytics?.currentStreak || appUsage.currentStreak,
            label: 'Day Streak',
            icon: '🔥',
            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            insight: `Best: ${contextAnalytics?.longestStreak || appUsage.longestStreak} days`
          },
          {
            value: stats.mindRecoverySessions,
            label: 'Mind Recovery',
            icon: '🕐',
            color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            insight: 'PAHM in context'
          },
          {
            value: stats.totalEmotionalNotes,
            label: 'Emotional Notes',
            icon: '💝',
            color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            insight: 'Comprehensive tracking'
          }
        ].map((metric, index) => (
          <div key={index} style={{ 
            background: 'white',
            padding: '25px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            transition: 'transform 0.3s, box-shadow 0.3s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{metric.icon}</div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700',
              background: metric.color,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '8px'
            }}>
              {metric.value}
            </div>
            <div style={{ 
              color: '#666', 
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '5px'
            }}>
              {metric.label}
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#999',
              fontStyle: 'italic'
            }}>
              {metric.insight}
            </div>
          </div>
        ))}
        
        {/* PAHM Insight Card */}
        {currentPahmInsights && (
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '25px',
            borderRadius: '16px',
            textAlign: 'center',
            color: 'white',
            boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)',
            transition: 'transform 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🧠</div>
            <div style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              {currentPahmInsights.presentPercentage || 0}%
            </div>
            <div style={{ 
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '5px'
            }}>
              Present Attention
            </div>
            <div style={{ 
              fontSize: '0.9rem', 
              opacity: 0.9,
              fontStyle: 'italic'
            }}>
              Quality: {stats.averageRating}/10
            </div>
          </div>
        )}
      </div>
      
      {/* Charts Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: showAdvanced ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr 1fr',
        gap: '30px',
        marginBottom: '40px'
      }}>
        <EnhancedLineChart 
          data={getPracticeDurationData()} 
          title="📈 Practice Duration Trend"
        />
        <EnhancedBarChart 
          data={getEmotionDistribution()} 
          valueKey="count" 
          labelKey="emotion"
          colorKey="color"
          title="😊 Emotional Distribution"
        />
        {currentPahmInsights && (
          <div style={{ gridColumn: showAdvanced ? 'span 1' : 'span 2' }}>
            <PAHMMatrixChart insights={currentPahmInsights} />
          </div>
        )}
        {currentMindRecoveryAnalytics && (
          <MindRecoveryContextChart analytics={currentMindRecoveryAnalytics} />
        )}
      </div>
      
      {/* Key Insights */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#333'
        }}>
          💡 Key Insights
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            {
              icon: '🎯',
              title: 'Practice Consistency',
              content: `You've maintained a ${contextAnalytics?.currentStreak || appUsage.currentStreak}-day streak with ${stats.totalSessions} total sessions. Your average session length of ${stats.averageDuration} minutes shows excellent commitment to regular practice.`,
              color: '#4caf50'
            },
            {
              icon: '🧠',
              title: '9-Category PAHM Analysis',
              content: currentPahmInsights ? 
                `Your 3×3 PAHM matrix shows ${currentPahmInsights.presentPercentage}% present-moment awareness with ${currentPahmInsights.neutralPercentage}% neutral emotional states. This indicates ${currentPahmInsights.presentPercentage >= 80 ? 'excellent' : currentPahmInsights.presentPercentage >= 60 ? 'good' : 'developing'} mindfulness stability.` :
                'Complete more sessions with PAHM tracking to see your 9-category matrix analysis.',
              color: '#667eea'
            },
            {
              icon: '🕐',
              title: 'Mind Recovery Usage',
              content: `Mind Recovery represents ${stats.mindRecoveryUsage}% of your practice (${stats.mindRecoverySessions} sessions). These contextual mindfulness sessions average ${mindRecoveryInsights.averageDuration} minutes with ${mindRecoveryInsights.averageRating}/10 effectiveness.`,
              color: '#fa709a'
            },
            {
              icon: '💝',
              title: 'Emotional Patterns',
              content: `You've recorded ${stats.totalEmotionalNotes} emotional notes with "${stats.mostCommonEmotion}" being your most frequent state. Your average energy level is ${stats.averageEnergyLevel}/10, indicating ${stats.averageEnergyLevel >= 7 ? 'high' : stats.averageEnergyLevel >= 5 ? 'balanced' : 'developing'} vitality.`,
              color: '#ff9800'
            }
          ].map((insight, index) => (
            <div key={index} style={{ 
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: `2px solid ${insight.color}`,
              boxShadow: `0 4px 20px ${insight.color}20`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                <h4 style={{ color: insight.color, fontWeight: '600' }}>{insight.title}</h4>
              </div>
              <p style={{ color: '#555', lineHeight: '1.6' }}>{insight.content}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Recent Sessions */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ 
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#333'
        }}>
          📊 Recent Sessions
        </h3>
        <div style={{ display: 'grid', gap: '15px' }}>
          {getFilteredData().practice.slice(0, 5).map(session => (
            <div key={session.id} style={{ 
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateX(5px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                    {session.stageLevel}
                  </h4>
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    {formatDate(session.date)} • {session.duration} minutes
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  {session.presentPercentage && (
                    <span style={{ 
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: '600'
                    }}>
                      {session.presentPercentage}% present
                    </span>
                  )}
                  <span style={{ 
                    background: session.rating && session.rating >= 8 
                      ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                      : session.rating && session.rating >= 6
                      ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                      : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    ⭐ {session.rating}/10
                  </span>
                </div>
              </div>
              {session.notes && (
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#555', 
                  lineHeight: '1.5',
                  marginBottom: '10px'
                }}>
                  {session.notes.length > 150 ? session.notes.substring(0, 150) + '...' : session.notes}
                </p>
              )}
              {session.environment && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  fontSize: '0.8rem',
                  color: '#666'
                }}>
                  <span>🧘 {session.environment.posture}</span>
                  <span>📍 {session.environment.location}</span>
                  <span>💡 {session.environment.lighting}</span>
                  <span>🔊 {session.environment.sounds}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Advanced Analytics Section */}
      {showAdvanced && (
        <div>
          <h3 style={{ 
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '30px',
            color: '#333'
          }}>
            🔬 Advanced Analytics
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            {/* Predictive Insights */}
            {predictiveInsights && (
              <div style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #2196f3',
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)'
              }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#1976d2' }}>🔮 Predictive Insights</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Optimal Session Length:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.1rem',
                      color: '#2196f3'
                    }}>
                      {predictiveInsights.optimalSessionLength}min
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Best Practice Time:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1rem',
                      color: '#2196f3'
                    }}>
                      {predictiveInsights.bestPracticeTime}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Streak Probability:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1rem',
                      color: predictiveInsights.streakProbability >= 80 ? '#4caf50' : 
                            predictiveInsights.streakProbability >= 60 ? '#ff9800' : '#f44336'
                    }}>
                      {predictiveInsights.streakProbability}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mind Recovery Analytics */}
            {currentMindRecoveryAnalytics && (
              <div style={{ 
                background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #ff9800',
                boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
              }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#f57c00' }}>🕐 Mind Recovery Analytics</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Total Sessions:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#ff9800'
                    }}>
                      {currentMindRecoveryAnalytics.totalMindRecoverySessions}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Best Context:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1rem',
                      color: '#ff9800'
                    }}>
                      {currentMindRecoveryAnalytics.highestRatedContext?.name || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Avg Recovery Rating:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#fa709a'
                    }}>
                      {currentMindRecoveryAnalytics.avgMindRecoveryRating}/10
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {currentUser && (
              <div style={{ 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                padding: '25px',
                borderRadius: '16px',
                border: '2px solid #2196f3',
                boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)'
              }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#1976d2' }}>🔐 Account Information</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Display Name:</span>
                    <span style={{ fontWeight: '700', color: '#1976d2' }}>{currentUser.displayName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Email:</span>
                    <span style={{ fontWeight: '700', color: '#1976d2' }}>{currentUser.email}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Questionnaire:</span>
                    <span style={{ 
                      fontWeight: '700',
                      color: currentUser.questionnaireCompleted ? '#4caf50' : '#f44336'
                    }}>
                      {currentUser.questionnaireCompleted ? '✅ Completed' : '❌ Pending'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#555' }}>Assessment:</span>
                    <span style={{ 
                      fontWeight: '700',
                      color: currentUser.assessmentCompleted ? '#4caf50' : '#f44336'
                    }}>
                      {currentUser.assessmentCompleted ? '✅ Completed' : '❌ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Data Management */}
          <div style={{ 
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#333' }}>💾 Data Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
                  {stats.meditationSessions}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Meditation Sessions</div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fa709a', marginBottom: '5px' }}>
                  {stats.mindRecoverySessions}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Mind Recovery Sessions</div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4facfe', marginBottom: '5px' }}>
                  {stats.totalEmotionalNotes}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Emotional Notes</div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff9800', marginBottom: '5px' }}>
                  {currentPahmInsights?.totalObservations || 0}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>PAHM Observations</div>
              </div>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                background: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #dee2e6'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9c27b0', marginBottom: '5px' }}>
                  {currentPahmInsights?.sessionsAnalyzed || 0}
                </div>
                <div style={{ color: '#666', fontSize: '0.9rem' }}>Sessions with PAHM Data</div>
              </div>
            </div>
            
            {/* Mind Recovery Context Summary */}
            {currentMindRecoveryAnalytics && currentMindRecoveryAnalytics.contextStats && (
              <div style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>🕐 Mind Recovery Distribution</h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '10px' 
                }}>
                  {(currentMindRecoveryAnalytics.contextStats || []).map((item: any, index: number) => (
                    <div key={index} style={{ 
                      textAlign: 'center',
                      padding: '15px',
                      background: '#f0f8ff',
                      borderRadius: '8px',
                      border: '1px solid #e3f2fd'
                    }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fa709a', marginBottom: '3px' }}>
                        {item.count}
                      </div>
                      <div style={{ color: '#666', fontSize: '0.8rem', lineHeight: '1.2' }}>
                        {item.context || item.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );


  // Render 9-Category PAHM Matrix Tab
  const renderPAHMTab = () => (
    <div>
      {pahmInsights ? (
        <>
          {/* 3x3 PAHM Matrix Visualization */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#333'
            }}>
              🧠 9-Category PAHM Matrix Analysis
            </h3>
            
            {/* Matrix Table */}
            <div style={{ 
              background: 'white',
              padding: '30px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              marginBottom: '30px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                fontSize: '1rem'
              }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                    <th style={{ 
                      padding: '15px', 
                      color: 'white', 
                      fontWeight: '700',
                      borderRadius: '8px 0 0 0'
                    }}>
                      Time Dimension
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      color: 'white', 
                      fontWeight: '700'
                    }}>
                      Attachment
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      color: 'white', 
                      fontWeight: '700'
                    }}>
                      Neutral
                    </th>
                    <th style={{ 
                      padding: '15px', 
                      color: 'white', 
                      fontWeight: '700',
                      borderRadius: '0 8px 0 0'
                    }}>
                      Aversion
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ 
                      padding: '15px', 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                      color: 'white'
                    }}>
                      Present
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.present_attachment}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #f0f8ff 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.present_neutral}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #fff0f0 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.present_aversion}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ 
                      padding: '15px', 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                      color: 'white'
                    }}>
                      Past
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.past_attachment}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.past_neutral}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.past_aversion}
                    </td>
                  </tr>
                  <tr style={{ background: '#f8f9fa' }}>
                    <td style={{ 
                      padding: '15px', 
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      color: 'white'
                    }}>
                      Future
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.future_attachment}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.future_neutral}
                    </td>
                    <td style={{ 
                      padding: '15px', 
                      textAlign: 'center',
                      background: 'linear-gradient(135deg, #ffebee 0%, #ffffff 100%)',
                      fontWeight: '600',
                      fontSize: '1.2rem'
                    }}>
                      {pahmInsights.totalPAHM.future_aversion}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Distribution Charts */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '30px',
              marginBottom: '30px'
            }}>
              {/* Time Distribution */}
              <div style={{ 
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h4 style={{ 
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#333'
                }}>
                  ⏰ Time Dimension Distribution
                </h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { label: 'Present', value: pahmInsights.timeDistribution.present, color: '#4caf50', total: pahmInsights.totalCounts },
                    { label: 'Past', value: pahmInsights.timeDistribution.past, color: '#ff9800', total: pahmInsights.totalCounts },
                    { label: 'Future', value: pahmInsights.timeDistribution.future, color: '#2196f3', total: pahmInsights.totalCounts }
                  ].map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        minWidth: '60px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {item.label}
                      </span>
                      <div style={{ 
                        flex: 1,
                        height: '20px',
                        background: '#f0f0f0',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%',
                          width: `${(item.value / item.total) * 100}%`,
                          background: item.color,
                          borderRadius: '10px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                      <span style={{ 
                        minWidth: '80px',
                        fontWeight: '600',
                        color: item.color,
                        textAlign: 'right'
                      }}>
                        {item.value} ({Math.round((item.value / item.total) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emotional Distribution */}
              <div style={{ 
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h4 style={{ 
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#333'
                }}>
                  😊 Emotional Tone Distribution
                </h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { label: 'Attachment', value: pahmInsights.emotionalDistribution.attachment, color: '#e91e63', total: pahmInsights.totalCounts },
                    { label: 'Neutral', value: pahmInsights.emotionalDistribution.neutral, color: '#9e9e9e', total: pahmInsights.totalCounts },
                    { label: 'Aversion', value: pahmInsights.emotionalDistribution.aversion, color: '#f44336', total: pahmInsights.totalCounts }
                  ].map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        minWidth: '80px',
                        fontWeight: '600',
                        color: '#333'
                      }}>
                        {item.label}
                      </span>
                      <div style={{ 
                        flex: 1,
                        height: '20px',
                        background: '#f0f0f0',
                        borderRadius: '10px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          height: '100%',
                          width: `${(item.value / item.total) * 100}%`,
                          background: item.color,
                          borderRadius: '10px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                      <span style={{ 
                        minWidth: '80px',
                        fontWeight: '600',
                        color: item.color,
                        textAlign: 'right'
                      }}>
                        {item.value} ({Math.round((item.value / item.total) * 100)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* PAHM Insights */}
            <div style={{ 
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e1bee7'
            }}>
              <h4 style={{ 
                fontSize: '1.3rem',
                fontWeight: '700',
                marginBottom: '20px',
                color: '#333'
              }}>
                💡 9-Category PAHM Matrix Insights
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div>
                  <h5 style={{ color: '#4caf50', marginBottom: '10px' }}>🎯 Present Moment Mastery</h5>
                  <p style={{ color: '#555', lineHeight: '1.5' }}>
                    You maintain <strong>{pahmInsights.presentPercentage}% present-moment awareness</strong> across 
                    {pahmInsights.sessionsAnalyzed} analyzed sessions.
                    {pahmInsights.presentPercentage >= 80 && " Outstanding mindfulness practice!"}
                    {pahmInsights.presentPercentage >= 60 && pahmInsights.presentPercentage < 80 && " Good awareness development!"}
                    {pahmInsights.presentPercentage < 60 && " Focus on present-moment attention training."}
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#9e9e9e', marginBottom: '10px' }}>⚖️ Emotional Equanimity</h5>
                  <p style={{ color: '#555', lineHeight: '1.5' }}>
                    <strong>{pahmInsights.neutralPercentage}% of your mental states are emotionally neutral</strong>, 
                    indicating balanced equanimity.
                    {pahmInsights.neutralPercentage >= 40 && " Excellent emotional balance!"}
                    {pahmInsights.neutralPercentage >= 25 && pahmInsights.neutralPercentage < 40 && " Developing equanimity well!"}
                    {pahmInsights.neutralPercentage < 25 && " Practice observing emotions without attachment."}
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#667eea', marginBottom: '10px' }}>📊 Matrix Completeness</h5>
                  <p style={{ color: '#555', lineHeight: '1.5' }}>
                    Your 9-category PAHM matrix captures <strong>{pahmInsights.totalCounts} total observations</strong> 
                    across all time dimensions and emotional tones, providing comprehensive mindfulness insights.
                  </p>
                </div>
                <div>
                  <h5 style={{ color: '#e91e63', marginBottom: '10px' }}>🔍 Pattern Analysis</h5>
                  <p style={{ color: '#555', lineHeight: '1.5' }}>
                    The strongest pattern is <strong>Present + Neutral</strong> with {pahmInsights.totalPAHM.present_neutral} observations, 
                    showing excellent mindful equanimity. Past and future wandering account for 
                    <strong>{Math.round(((pahmInsights.timeDistribution.past + pahmInsights.timeDistribution.future) / pahmInsights.totalCounts) * 100)}%</strong> of mental activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          background: 'linear-gradient(135deg, #f8fafe 0%, #ffffff 100%)',
          borderRadius: '16px',
          border: '2px solid #e3f2fd'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🧠</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
            No 9-Category PAHM Matrix Data Yet
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
            Complete practice sessions with 9-category PAHM tracking to see your comprehensive matrix analysis.
          </p>
          <button 
            onClick={populateComprehensiveSampleData}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '15px 25px',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
          >
            🎯 Get Sample 9-Category PAHM Data
          </button>
        </div>
      )}
    </div>
  );

  // Render Environment Tab
  const renderEnvironmentTab = () => (
    <div>
      {environmentAnalysisLocal.posture.length > 0 ? (
        <>
          <h3 style={{ 
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '30px',
            color: '#333'
          }}>
            🌿 Environmental Factors Analysis
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '30px',
            marginBottom: '40px'
          }}>
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '15px', color: '#333', fontSize: '1.2rem', fontWeight: '600' }}>
                🧘 Posture Performance
              </h5>
              <div style={{ display: 'grid', gap: '8px' }}>
                {environmentAnalysisLocal.posture.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{item.count} sessions</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: item.avgRating >= 8 ? '#4caf50' : item.avgRating >= 6 ? '#ff9800' : '#f44336'
                      }}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '15px', color: '#333', fontSize: '1.2rem', fontWeight: '600' }}>
                📍 Location Impact
              </h5>
              <div style={{ display: 'grid', gap: '8px' }}>
                {environmentAnalysisLocal.location.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{item.count} sessions</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: item.avgRating >= 8 ? '#4caf50' : item.avgRating >= 6 ? '#ff9800' : '#f44336'
                      }}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '15px', color: '#333', fontSize: '1.2rem', fontWeight: '600' }}>
                💡 Lighting Effects
              </h5>
              <div style={{ display: 'grid', gap: '8px' }}>
                {environmentAnalysisLocal.lighting.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{item.count} sessions</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: item.avgRating >= 8 ? '#4caf50' : item.avgRating >= 6 ? '#ff9800' : '#f44336'
                      }}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '15px', color: '#333', fontSize: '1.2rem', fontWeight: '600' }}>
                🔊 Sound Environment
              </h5>
              <div style={{ display: 'grid', gap: '8px' }}>
                {environmentAnalysisLocal.sounds.map((item, index) => (
                  <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px',
                    border: '1px solid #e9ecef'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{item.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>{item.count} sessions</span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: '600',
                        color: item.avgRating >= 8 ? '#4caf50' : item.avgRating >= 6 ? '#ff9800' : '#f44336'
                      }}>
                        {item.avgRating}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <h3 style={{ 
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            🎯 Environmental Insights
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {[
              {
                icon: '🧘',
                title: 'Optimal Posture',
                content: `${environmentAnalysisLocal.posture[0]?.name || 'No data'} shows the highest performance at ${environmentAnalysisLocal.posture[0]?.avgRating || 0}/10 rating.`,
                color: '#4caf50'
              },
              {
                icon: '📍',
                title: 'Best Location',
                content: `${environmentAnalysisLocal.location[0]?.name || 'No data'} provides the most conducive environment with ${environmentAnalysisLocal.location[0]?.avgRating || 0}/10 average quality.`,
                color: '#2196f3'
              },
              {
                icon: '💡',
                title: 'Lighting Preference',
                content: `${environmentAnalysisLocal.lighting[0]?.name || 'No data'} lighting creates optimal conditions, averaging ${environmentAnalysisLocal.lighting[0]?.avgRating || 0}/10 session quality.`,
                color: '#ff9800'
              },
              {
                icon: '🔊',
                title: 'Sound Environment',
                content: `${environmentAnalysisLocal.sounds[0]?.name || 'No data'} sound environment supports your practice best with ${environmentAnalysisLocal.sounds[0]?.avgRating || 0}/10 performance.`,
                color: '#9c27b0'
              }
            ].map((insight, index) => (
              <div key={index} style={{ 
                background: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: `2px solid ${insight.color}`,
                boxShadow: `0 4px 20px ${insight.color}20`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
                  <h4 style={{ color: insight.color, fontWeight: '600' }}>{insight.title}</h4>
                </div>
                <p style={{ color: '#555', lineHeight: '1.6' }}>{insight.content}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          background: 'linear-gradient(135deg, #f0fff4 0%, #ffffff 100%)',
          borderRadius: '16px',
          border: '2px solid #c8e6c9'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌿</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
            No Environment Data Yet
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
            Complete practice sessions with environment tracking to see your environmental analysis.
          </p>
          <button 
            onClick={populateComprehensiveSampleData}
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              padding: '15px 25px',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
          >
            🌿 Get Sample Environment Data
          </button>
        </div>
      )}
    </div>
  );


  // Render Mind Recovery Tab
  const renderMindRecoveryTab = () => (
    <div>
      {mindRecoveryInsights.totalSessions > 0 ? (
        <>
          <h3 style={{ 
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '30px',
            color: '#333'
          }}>
            🕐 Mind Recovery Analytics
          </h3>
          
          {/* Mind Recovery Overview */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px', 
            marginBottom: '40px' 
          }}>
            {[
              {
                value: mindRecoveryInsights.totalSessions,
                label: 'Total Sessions',
                icon: '🕐',
                color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
              },
              {
                value: `${mindRecoveryInsights.totalMinutes}min`,
                label: 'Total Time',
                icon: '⏱️',
                color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
              },
              {
                value: mindRecoveryInsights.averageRating,
                label: 'Avg Rating',
                icon: '⭐',
                color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
              },
              {
                value: `${mindRecoveryInsights.averageDuration}min`,
                label: 'Avg Duration',
                icon: '📊',
                color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
              }
            ].map((metric, index) => (
              <div key={index} style={{ 
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                textAlign: 'center',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s, box-shadow 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{metric.icon}</div>
                <div style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: '700',
                  background: metric.color,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '8px'
                }}>
                  {metric.value}
                </div>
                <div style={{ 
                  fontSize: '1.1rem', 
                  fontWeight: '600',
                  color: '#333'
                }}>
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Techniques Analysis */}
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ 
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#333'
            }}>
              🎯 Mind Recovery Techniques
            </h4>
            <div style={{ 
              display: 'grid', 
              gap: '15px'
            }}>
              {mindRecoveryInsights.techniques.map((technique, index) => (
                <div key={index} style={{ 
                  background: 'white',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <h5 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: '600',
                      color: '#333',
                      margin: 0
                    }}>
                      {technique.name}
                    </h5>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {technique.count} sessions
                      </span>
                      <span style={{ 
                        background: technique.avgRating >= 8 
                          ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                          : technique.avgRating >= 6
                          ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                          : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        ⭐ {technique.avgRating}/10
                      </span>
                      <span style={{ 
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {technique.avgDuration}min avg
                      </span>
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    Total time: {technique.totalDuration} minutes
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mind Recovery Insights */}
          <div style={{ 
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)',
            padding: '25px',
            borderRadius: '16px',
            border: '1px solid #ffcc02'
          }}>
            <h4 style={{ 
              fontSize: '1.3rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#333'
            }}>
              💡 Mind Recovery Insights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div>
                <h5 style={{ color: '#fa709a', marginBottom: '10px' }}>🎯 Usage Pattern</h5>
                <p style={{ color: '#555', lineHeight: '1.5' }}>
                  You've completed <strong>{mindRecoveryInsights.totalSessions} Mind Recovery sessions</strong> 
                  totaling <strong>{mindRecoveryInsights.totalMinutes} minutes</strong>. 
                  This represents <strong>{stats.mindRecoveryUsage}%</strong> of your total practice time.
                </p>
              </div>
              <div>
                <h5 style={{ color: '#ff9800', marginBottom: '10px' }}>⭐ Effectiveness</h5>
                <p style={{ color: '#555', lineHeight: '1.5' }}>
                  Your average Mind Recovery rating is <strong>{mindRecoveryInsights.averageRating}/10</strong>, 
                  showing {mindRecoveryInsights.averageRating >= 8 ? 'excellent' : mindRecoveryInsights.averageRating >= 6 ? 'good' : 'developing'} 
                  effectiveness for quick mental resets and contextual mindfulness.
                </p>
              </div>
              <div>
                <h5 style={{ color: '#4caf50', marginBottom: '10px' }}>🕐 Efficiency</h5>
                <p style={{ color: '#555', lineHeight: '1.5' }}>
                  With an average duration of <strong>{mindRecoveryInsights.averageDuration} minutes</strong>, 
                  Mind Recovery provides efficient mindfulness practice that fits seamlessly into daily life.
                </p>
              </div>
              <div>
                <h5 style={{ color: '#2196f3', marginBottom: '10px' }}>🎨 Technique Variety</h5>
                <p style={{ color: '#555', lineHeight: '1.5' }}>
                  You've explored <strong>{mindRecoveryInsights.techniques.length} different techniques</strong>, 
                  with <strong>{mindRecoveryInsights.techniques[0]?.name || 'N/A'}</strong> being your most effective 
                  at <strong>{mindRecoveryInsights.techniques[0]?.avgRating || 0}/10</strong>.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px',
          background: 'linear-gradient(135deg, #fff8e1 0%, #ffffff 100%)',
          borderRadius: '16px',
          border: '2px solid #ffcc02'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🕐</div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
            No Mind Recovery Data Yet
          </h3>
          <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
            Complete Mind Recovery sessions to see your contextual mindfulness analytics.
          </p>
          <button 
            onClick={populateComprehensiveSampleData}
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              color: 'white',
              padding: '15px 25px',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(250, 112, 154, 0.3)'
            }}
          >
            🕐 Get Sample Mind Recovery Data
          </button>
        </div>
      )}
    </div>
  );

  // Render Emotional Tab
  const renderEmotionalTab = () => (
    <div>
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ 
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '20px',
          color: '#333'
        }}>
          😊 Emotional Distribution
        </h3>
        
        {/* Emotion Distribution Chart */}
        <div style={{ 
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          marginBottom: '30px'
        }}>
          {getEmotionDistribution().length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {getEmotionDistribution().map((emotion, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span style={{ 
                    minWidth: '100px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    {emotion.emotion}
                  </span>
                  <div style={{ 
                    flex: 1,
                    height: '25px',
                    background: '#f0f0f0',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%',
                      width: `${(emotion.count / Math.max(...getEmotionDistribution().map(e => e.count))) * 100}%`,
                      background: emotion.color,
                      borderRadius: '12px',
                      transition: 'width 0.5s ease'
                    }}></div>
                  </div>
                  <span style={{ 
                    minWidth: '60px',
                    fontWeight: '600',
                    color: emotion.color,
                    textAlign: 'right'
                  }}>
                    {emotion.count} notes
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#666'
            }}>
              No emotional data available for the selected time range.
            </div>
          )}
        </div>
      </div>
      
      <h3 style={{ 
        fontSize: '1.8rem',
        fontWeight: '700',
        marginBottom: '20px',
        color: '#333'
      }}>
        💝 Recent Emotional Notes
      </h3>
      <div style={{ display: 'grid', gap: '20px' }}>
        {getFilteredData().notes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#666',
            background: '#f8f9fa',
            borderRadius: '12px',
            border: '1px solid #dee2e6'
          }}>
            No emotional notes in the selected time range. Click "🎯 Populate Comprehensive Data" to see example notes.
          </div>
        ) : (
          getFilteredData().notes.slice(0, 8).map(note => (
            <div key={note.id} style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ 
                  fontSize: '1.1rem',
                  fontWeight: '700',
                  color: '#333'
                }}>
                  {formatDate(note.timestamp)}
                </div>
                {note.emotion && (
                  <span style={{ 
                    background: getEmotionColor(note.emotion),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    {note.emotion}
                  </span>
                )}
              </div>
              
              <div style={{ 
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#555',
                marginBottom: '15px'
              }}>
                {note.content}
              </div>
              
              <div style={{ display: 'flex', gap: '20px', fontSize: '0.9rem' }}>
                {note.energyLevel && (
                  <div style={{ color: '#666' }}>
                    ⚡ Energy: {note.energyLevel}/10
                  </div>
                )}
                {note.tags && note.tags.length > 0 && (
                  <div style={{ color: '#666' }}>
                    🏷️ Tags: {note.tags.slice(0, 2).join(', ')}
                  </div>
                )}
              </div>
              
              {note.gratitude && note.gratitude.length > 0 && (
                <div style={{ 
                  marginTop: '15px', 
                  padding: '12px', 
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)', 
                  borderRadius: '8px',
                  border: '1px solid #ffcc02',
                  fontSize: '0.9rem'
                }}>
                  <span style={{ fontWeight: '600', color: '#f57c00' }}>🙏 Gratitude: </span>
                  {note.gratitude.slice(0, 3).join(', ')}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  // NEW: Render Insights Tab
  const renderInsightsTab = () => {
    const usagePatterns = getAppUsagePatterns();
    const engagementMetrics = getEngagementMetrics();
    
    return (
      <div>
        <h3 style={{ 
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#333'
        }}>
          💡 Personalized Meditation Insights
        </h3>

        {/* Smart Recommendations */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '30px',
          borderRadius: '20px',
          color: 'white',
          marginBottom: '40px',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px' }}>
            🎯 Smart Recommendations
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>🕐 Optimal Practice Time</h5>
              <p style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                Based on your {stats.totalSessions} sessions, you perform best during <strong>{usagePatterns.timeOfDayStats && Object.entries(usagePatterns.timeOfDayStats).reduce((a, b) => usagePatterns.timeOfDayStats[a[0]] > usagePatterns.timeOfDayStats[b[0]] ? a : b)[0]}</strong>. 
                Consider scheduling your main practice during this peak window.
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>⏱️ Session Length Sweet Spot</h5>
              <p style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                Your average session of <strong>{stats.averageDuration} minutes</strong> with <strong>{stats.averageRating}/10</strong> quality suggests 
                {stats.averageDuration < 20 ? ' you could benefit from slightly longer sessions (20-25 min) for deeper states.' : 
                 stats.averageDuration > 35 ? ' shorter, more frequent sessions might maintain better consistency.' : 
                 ' you\'ve found an excellent balance for sustainable practice.'}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>🧠 PAHM Development Focus</h5>
              <p style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                {currentPahmInsights ? 
                  `With ${currentPahmInsights.presentPercentage}% present-moment awareness, focus on ${
                    currentPahmInsights.presentPercentage < 70 ? 'basic attention training and breath awareness' :
                    currentPahmInsights.presentPercentage < 85 ? 'maintaining longer periods of sustained attention' :
                    'exploring deeper states and meta-cognitive awareness'
                  }.` :
                  'Start with basic PAHM tracking to understand your mental patterns and focus areas.'
                }
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>🌿 Environment Optimization</h5>
              <p style={{ lineHeight: '1.5', fontSize: '0.95rem' }}>
                {environmentAnalysisLocal.posture.length > 0 ? 
                  `Your best environment: ${environmentAnalysisLocal.posture[0]?.name} posture, ${environmentAnalysisLocal.location[0]?.name} location, ${environmentAnalysisLocal.sounds[0]?.name} sounds. Recreate these conditions more often.` :
                  'Track your environment settings to discover which conditions support your best sessions.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Progress Insights */}
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            📈 Progress & Pattern Analysis
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Consistency Analysis */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ color: '#4caf50', marginBottom: '15px', fontSize: '1.2rem' }}>🎯 Consistency Insights</h5>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Streak:</span>
                  <strong style={{ color: '#4caf50' }}>{appUsage.currentStreak} days</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Weekly Frequency:</span>
                  <strong>{engagementMetrics.weeklyFrequency} sessions</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Practice Stability:</span>
                  <strong style={{ color: usagePatterns.consistency === 'High' ? '#4caf50' : '#ff9800' }}>
                    {usagePatterns.consistency}
                  </strong>
                </div>
              </div>
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                background: '#f0f8ff', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                💡 {usagePatterns.consistency === 'High' ? 
                  'Excellent consistency! Your regular practice is building strong mindfulness habits.' :
                  'Consider setting a specific daily time for practice to improve consistency.'
                }
              </div>
            </div>

            {/* Quality Trends */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ color: '#667eea', marginBottom: '15px', fontSize: '1.2rem' }}>⭐ Quality Trends</h5>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Average Rating:</span>
                  <strong style={{ color: stats.averageRating >= 8 ? '#4caf50' : '#ff9800' }}>
                    {stats.averageRating}/10
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Engagement Level:</span>
                  <strong>{engagementMetrics.engagementLevel}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Documentation:</span>
                  <strong>{engagementMetrics.documentationHabit}</strong>
                </div>
              </div>
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                background: '#f8f4ff', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                💡 {stats.averageRating >= 8 ? 
                  'High-quality sessions indicate excellent practice depth and technique.' :
                  'Focus on creating optimal conditions and trying different techniques to improve session quality.'
                }
              </div>
            </div>

            {/* Emotional Intelligence */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ color: '#fa709a', marginBottom: '15px', fontSize: '1.2rem' }}>💝 Emotional Intelligence</h5>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Emotional Notes:</span>
                  <strong>{stats.totalEmotionalNotes}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Dominant Emotion:</span>
                  <strong>{stats.mostCommonEmotion}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Energy Level:</span>
                  <strong style={{ color: stats.averageEnergyLevel >= 7 ? '#4caf50' : '#ff9800' }}>
                    {stats.averageEnergyLevel}/10
                  </strong>
                </div>
              </div>
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                background: '#fff0f5', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                💡 Your emotional awareness through journaling shows {stats.averageEnergyLevel >= 7 ? 'high vitality' : 'developing energy'} and good self-reflection habits.
              </div>
            </div>

            {/* Mind Recovery Intelligence */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ color: '#ff9800', marginBottom: '15px', fontSize: '1.2rem' }}>🕐 Contextual Wisdom</h5>
              <div style={{ display: 'grid', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Quick Sessions:</span>
                  <strong>{stats.mindRecoverySessions}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Efficiency Rating:</span>
                  <strong>{mindRecoveryInsights.averageRating}/10</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Integration Level:</span>
                  <strong>{stats.mindRecoveryUsage}% of practice</strong>
                </div>
              </div>
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                background: '#fff8e1', 
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: '#555'
              }}>
                💡 {stats.mindRecoveryUsage >= 30 ? 
                  'Excellent integration of mindfulness into daily life through contextual practice.' :
                  'Consider using more Mind Recovery sessions for better mindfulness integration.'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Predictive Insights */}
        {predictiveInsights && (
          <div style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            padding: '30px',
            borderRadius: '20px',
            border: '2px solid #2196f3',
            marginBottom: '40px'
          }}>
            <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#1976d2' }}>
              🔮 Predictive Analytics & Future Insights
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
                <h5 style={{ color: '#2196f3', marginBottom: '10px' }}>📊 Optimal Session Length</h5>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1976d2', marginBottom: '5px' }}>
                  {predictiveInsights.optimalSessionLength} min
                </div>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  Based on your quality ratings and completion patterns
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
                <h5 style={{ color: '#2196f3', marginBottom: '10px' }}>⏰ Best Practice Window</h5>
                <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1976d2', marginBottom: '5px' }}>
                  {predictiveInsights.bestPracticeTime}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  Your highest-rated sessions occur during this time
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
                <h5 style={{ color: '#2196f3', marginBottom: '10px' }}>🔥 Streak Probability</h5>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: predictiveInsights.streakProbability >= 80 ? '#4caf50' : '#ff9800', marginBottom: '5px' }}>
                  {predictiveInsights.streakProbability}%
                </div>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  Likelihood of maintaining your current practice streak
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Growth Recommendations */}
        <div>
          <h4 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            🌱 Personalized Growth Recommendations
          </h4>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {[
              {
                icon: '🎯',
                title: 'Next Level Challenge',
                content: (currentPahmInsights?.presentPercentage ?? 0) >= 80 ? 
                  'You\'ve mastered present-moment awareness! Try exploring meta-cognitive practices and teaching others.' :
                  (currentPahmInsights?.presentPercentage ?? 0) >= 60 ? 
                  'Focus on extending periods of continuous attention. Try 30+ minute sessions with minimal mind-wandering.' :
                  'Build stronger foundational attention. Practice basic breath awareness and PAHM tracking consistently.',
                color: '#667eea',
                priority: 'High'
              },
              {
                icon: '🕐',
                title: 'Mind Recovery Expansion',
                content: stats.mindRecoveryUsage >= 30 ? 
                  'Excellent contextual practice! Experiment with advanced techniques like micro-meditations and transition awareness.' :
                  'Integrate more Mind Recovery sessions into daily activities. Try 2-5 minute practices between tasks.',
                color: '#fa709a',
                priority: stats.mindRecoveryUsage < 20 ? 'High' : 'Medium'
              },
              {
                icon: '🌿',
                title: 'Environment Mastery',
                content: environmentAnalysisLocal.posture.length > 0 ? 
                  `Your ${environmentAnalysisLocal.posture[0]?.name} setup works well. Try practicing in challenging environments to build adaptability.` :
                  'Start tracking environmental factors to discover your optimal practice conditions.',
                color: '#4caf50',
                priority: 'Medium'
              },
              {
                icon: '💝',
                title: 'Emotional Intelligence',
                content: stats.averageEnergyLevel >= 7 ? 
                  'High emotional awareness! Explore advanced practices like loving-kindness and emotional regulation techniques.' :
                  'Develop deeper emotional awareness through regular journaling and energy tracking.',
                color: '#ff9800',
                priority: stats.averageEnergyLevel < 5 ? 'High' : 'Medium'
              }
            ].map((rec, index) => (
              <div key={index} style={{ 
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                border: `2px solid ${rec.color}`,
                boxShadow: `0 4px 20px ${rec.color}20`,
                position: 'relative'
              }}>
                <div style={{ 
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: rec.priority === 'High' ? '#f44336' : '#ff9800',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: '600'
                }}>
                  {rec.priority} Priority
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <span style={{ fontSize: '2rem' }}>{rec.icon}</span>
                  <h5 style={{ color: rec.color, fontWeight: '700', fontSize: '1.2rem' }}>{rec.title}</h5>
                </div>
                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '1rem' }}>{rec.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render Usage Tab
  const renderUsageTab = () => {
    const usagePatterns = getAppUsagePatterns();
    const featureUtilization = getFeatureUtilization();
    const engagementMetrics = getEngagementMetrics();
    
    return (
      <div>
        <h3 style={{ 
          fontSize: '1.8rem',
          fontWeight: '700',
          marginBottom: '30px',
          color: '#333'
        }}>
          📱 App Usage Analytics
        </h3>

        {/* Usage Overview */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '20px', 
          marginBottom: '40px' 
        }}>
          {[
            {
              value: appUsage.totalSessions,
              label: 'Total Sessions',
              icon: '📊',
              color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              insight: 'All-time usage'
            },
            {
              value: engagementMetrics.weeklyFrequency,
              label: 'Weekly Sessions',
              icon: '📅',
              color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              insight: 'Recent activity'
            },
            {
              value: `${Math.round(appUsage.totalPracticeTime / 60)}h`,
              label: 'Total Practice Time',
              icon: '⏱️',
              color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              insight: 'Lifetime meditation'
            },
            {
              value: `${appUsage.averageSessionLength}min`,
              label: 'Avg Session Length',
              icon: '🎯',
              color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              insight: 'Time per session'
            },
            {
              value: usagePatterns.consistency,
              label: 'Practice Consistency',
              icon: '🔥',
              color: usagePatterns.consistency === 'High' ? 
                'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : 
                'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
              insight: 'Habit strength'
            }
          ].map((metric, index) => (
            <div key={index} style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              textAlign: 'center',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s, box-shadow 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{metric.icon}</div>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                background: metric.color,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '8px'
              }}>
                {metric.value}
              </div>
              <div style={{ 
                color: '#666', 
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '5px'
              }}>
                {metric.label}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#999',
                fontStyle: 'italic'
              }}>
                {metric.insight}
              </div>
            </div>
          ))}
        </div>

        {/* Session Patterns */}
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            ⏰ Session Timing Patterns
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
            {/* Time of Day Analysis */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '20px', color: '#333', fontSize: '1.2rem' }}>🌅 Preferred Practice Times</h5>
              <div style={{ display: 'grid', gap: '10px' }}>
                {Object.entries(usagePatterns.timeOfDayStats || {}).map(([time, count]) => (
                  <div key={time} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{time}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: `${(count / Math.max(...Object.values(usagePatterns.timeOfDayStats || {}))) * 100}px`,
                        maxWidth: '100px',
                        height: '8px',
                        background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
                        borderRadius: '4px'
                      }}></div>
                      <span style={{ fontWeight: '600', color: '#4facfe', minWidth: '30px' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Day of Week Pattern */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '20px', color: '#333', fontSize: '1.2rem' }}>📅 Weekly Practice Pattern</h5>
              <div style={{ display: 'grid', gap: '10px' }}>
                {Object.entries(usagePatterns.dayOfWeekStats || {}).map(([day, count]) => (
                  <div key={day} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{day}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: `${(count / Math.max(...Object.values(usagePatterns.dayOfWeekStats || {}))) * 100}px`,
                        maxWidth: '100px',
                        height: '8px',
                        background: 'linear-gradient(90deg, #fa709a 0%, #fee140 100%)',
                        borderRadius: '4px'
                      }}></div>
                      <span style={{ fontWeight: '600', color: '#fa709a', minWidth: '30px' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Session Length Distribution */}
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '1px solid #e0e0e0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <h5 style={{ marginBottom: '20px', color: '#333', fontSize: '1.2rem' }}>⏱️ Session Length Preferences</h5>
              <div style={{ display: 'grid', gap: '10px' }}>
                {Object.entries(usagePatterns.sessionLengthDistribution || {}).map(([length, count]) => (
                  <div key={length} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8f9fa',
                    borderRadius: '6px'
                  }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>{length}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: `${(count / Math.max(...Object.values(usagePatterns.sessionLengthDistribution || {}))) * 100}px`,
                        maxWidth: '100px',
                        height: '8px',
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '4px'
                      }}></div>
                      <span style={{ fontWeight: '600', color: '#667eea', minWidth: '30px' }}>{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Utilization */}
        <div style={{ marginBottom: '40px' }}>
          <h4 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            🛠️ Feature Utilization Analysis
          </h4>
          
          <div style={{ 
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            border: '1px solid #e0e0e0',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'grid', gap: '15px' }}>
              {featureUtilization.map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px'
                }}>
                  <div style={{ 
                    minWidth: '180px',
                    fontWeight: '500',
                    color: '#333'
                  }}>
                    {feature.feature}
                  </div>
                  <div style={{ 
                    flex: 1,
                    height: '24px',
                    background: '#f0f0f0',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      height: '100%',
                      width: `${feature.percentage}%`,
                      background: `linear-gradient(90deg, ${
                        index % 4 === 0 ? '#4facfe, #00f2fe' :
                        index % 4 === 1 ? '#fa709a, #fee140' :
                        index % 4 === 2 ? '#667eea, #764ba2' :
                        '#4caf50, #45a049'
                      })`,
                      borderRadius: '12px',
                      transition: 'width 0.8s ease-in-out'
                    }}></div>
                  </div>
                  <div style={{ 
                    minWidth: '80px',
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end'
                  }}>
                    <span style={{ fontWeight: '600', color: '#333' }}>{feature.count}</span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>{feature.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div style={{ 
          background: 'linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%)',
          padding: '30px',
          borderRadius: '20px',
          border: '2px solid #4caf50',
          marginBottom: '40px'
        }}>
          <h4 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '20px', color: '#2e7d32' }}>
            📈 Engagement & Quality Metrics
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ color: '#4caf50', marginBottom: '10px' }}>🎯 Session Quality</h5>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2e7d32', marginBottom: '5px' }}>
                {stats.averageRating}/10
              </div>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                Average session quality rating
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ color: '#4caf50', marginBottom: '10px' }}>📝 Documentation Rate</h5>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2e7d32', marginBottom: '5px' }}>
                {engagementMetrics.notesPerSession} notes/session
              </div>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                {engagementMetrics.documentationHabit} documentation habit
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ color: '#4caf50', marginBottom: '10px' }}>🔄 Engagement Level</h5>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2e7d32', marginBottom: '5px' }}>
                {engagementMetrics.engagementLevel}
              </div>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                Based on session quality and frequency
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '20px', borderRadius: '12px' }}>
              <h5 style={{ color: '#4caf50', marginBottom: '10px' }}>📊 Usage Intensity</h5>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2e7d32', marginBottom: '5px' }}>
                {usagePatterns.averageSessionsPerWeek}/week
              </div>
              <p style={{ fontSize: '0.9rem', color: '#555' }}>
                Average sessions per week
              </p>
            </div>
          </div>
        </div>

        {/* Usage Insights */}
        <div>
          <h4 style={{ 
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px',
            color: '#333'
          }}>
            💡 Usage Pattern Insights
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '2px solid #2196f3',
              boxShadow: '0 4px 20px rgba(33, 150, 243, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <h5 style={{ color: '#2196f3', fontWeight: '700', fontSize: '1.2rem' }}>Practice Consistency Analysis</h5>
              </div>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                With {usagePatterns.consistency.toLowerCase()} consistency and {engagementMetrics.weeklyFrequency} sessions per week, 
                your practice shows {usagePatterns.consistency === 'High' ? 
                  'excellent dedication. You\'ve built strong mindfulness habits that will yield long-term benefits.' :
                  'good potential for improvement. Consider setting specific practice times to build stronger habits.'
                }
              </p>
            </div>
            
            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '2px solid #9c27b0',
              boxShadow: '0 4px 20px rgba(156, 39, 176, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.5rem' }}>🛠️</span>
                <h5 style={{ color: '#9c27b0', fontWeight: '700', fontSize: '1.2rem' }}>Feature Adoption Patterns</h5>
              </div>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                You actively use {featureUtilization.filter(f => f.count > 0).length} out of {featureUtilization.length} available features. 
                Your most utilized feature is {featureUtilization[0]?.feature} ({featureUtilization[0]?.percentage}% of usage), 
                showing {featureUtilization[0]?.percentage >= 30 ? 'strong engagement' : 'balanced exploration'} with the platform.
              </p>
            </div>

            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '2px solid #ff9800',
              boxShadow: '0 4px 20px rgba(255, 152, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.5rem' }}>⏰</span>
                <h5 style={{ color: '#ff9800', fontWeight: '700', fontSize: '1.2rem' }}>Temporal Usage Intelligence</h5>
              </div>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                Your peak practice time is {Object.entries(usagePatterns.timeOfDayStats || {}).reduce((a, b) => 
                  (usagePatterns.timeOfDayStats || {})[a[0]] > (usagePatterns.timeOfDayStats || {})[b[0]] ? a : b, ['', 0])[0]}, 
                and you practice most on {Object.entries(usagePatterns.dayOfWeekStats || {}).reduce((a, b) => 
                  (usagePatterns.dayOfWeekStats || {})[a[0]] > (usagePatterns.dayOfWeekStats || {})[b[0]] ? a : b, ['', 0])[0]}s. 
                This shows strong self-awareness of your optimal practice windows.
              </p>
            </div>

            <div style={{ 
              background: 'white',
              padding: '25px',
              borderRadius: '16px',
              border: '2px solid #4caf50',
              boxShadow: '0 4px 20px rgba(76, 175, 80, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '15px' }}>
                <span style={{ fontSize: '1.5rem' }}>📈</span>
                <h5 style={{ color: '#4caf50', fontWeight: '700', fontSize: '1.2rem' }}>Engagement Quality Score</h5>
              </div>
              <p style={{ color: '#555', lineHeight: '1.6' }}>
                Your {engagementMetrics.engagementLevel.toLowerCase()} engagement level, {engagementMetrics.documentationHabit.toLowerCase()} documentation habits, 
                and {stats.averageRating}/10 session quality indicate {engagementMetrics.engagementLevel === 'High' ? 
                  'exceptional commitment to mindful practice and self-reflection.' :
                  'solid foundation with room for deeper practice engagement.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render with loading state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading comprehensive analytics...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1400px', 
      margin: '0 auto',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '30px',
        borderRadius: '20px',
        marginBottom: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          Advanced Analytics Dashboard
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem', 
          marginBottom: '25px',
          lineHeight: '1.6'
        }}>
          Comprehensive meditation analytics with 9-category PAHM Matrix insights, Mind Recovery tracking, environmental factors, and progress analysis.
        </p>
        
        {/* Enhanced Status Indicators */}
        {(practiceData.length > 0 || emotionalNotes.length > 0 || contextAnalytics?.totalSessions > 0) && (
          <div style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              marginBottom: '15px'
            }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ✨ Advanced Analytics Active
              </span>
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '10px',
              fontSize: '14px'
            }}>
              <span style={{ color: '#4caf50', fontWeight: '600' }}>
                🟢 Total Sessions: {contextAnalytics?.totalSessions || practiceData.length}
              </span>
              <span style={{ color: '#667eea', fontWeight: '600' }}>
                🧘 Meditation: {stats.meditationSessions}
              </span>
              <span style={{ color: '#fa709a', fontWeight: '600' }}>
                🕐 Mind Recovery: {stats.mindRecoverySessions}
              </span>
              <span style={{ color: '#2196f3', fontWeight: '600' }}>
                💝 Emotional Notes: {stats.totalEmotionalNotes}
              </span>
              <span style={{ color: '#ff9800', fontWeight: '600' }}>
                🧠 9-Category PAHM Matrix: {pahmInsights ? 'Available' : 'Building'}
              </span>
              <span style={{ color: '#9c27b0', fontWeight: '600' }}>
                🌿 Environment Analysis: {environmentAnalysisLocal.posture.length > 0 ? 'Active' : 'Building'}
              </span>
            </div>
          </div>
        )}
        
        {/* Development Controls */}
        <div style={{
          background: 'rgba(248, 249, 250, 0.9)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #dee2e6',
          marginBottom: '25px'
        }}>
          <h4 style={{ marginBottom: '15px', color: '#333' }}>🔧 Analytics Controls</h4>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '15px' }}>
            <button 
              onClick={populateComprehensiveSampleData}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🎯 Populate Comprehensive Data
            </button>
            <button 
              onClick={clearAllData}
              style={{
                background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              🗑️ Clear All Data
            </button>
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: showAdvanced 
                  ? 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)'
                  : 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                color: 'white',
                padding: '12px 20px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                boxShadow: showAdvanced 
                  ? '0 4px 15px rgba(156, 39, 176, 0.3)'
                  : '0 4px 15px rgba(33, 150, 243, 0.3)',
                transition: 'all 0.3s'
              }}
            >
              {showAdvanced ? '📊 Hide Advanced' : '🔬 Show Advanced'}
            </button>
            {exportDataForAnalysis && (
              <button 
                onClick={() => {
                  const data = exportDataForAnalysis();
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `meditation-analytics-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  color: 'white',
                  padding: '12px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                📊 Export Data
              </button>
            )}
          </div>
          <div style={{ fontSize: '13px', color: '#666', display: 'grid', gap: '5px' }}>
            <p>📱 User: {currentUser?.displayName || 'Not logged in'} | 🆔 UID: {currentUser?.uid || 'N/A'}</p>
            <p>📊 Sessions: {stats.totalSessions} | 📝 Notes: {stats.totalEmotionalNotes} | ⚡ Quality: {stats.averageRating}/10</p>
          </div>
        </div>
        
        {/* Time Range Controls */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block',
            marginBottom: '10px', 
            fontWeight: '600',
            color: '#333'
          }}>
            Time Range:
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['week', 'month', 'quarter', 'year'].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  padding: '10px 20px',
                  border: timeRange === range ? 'none' : '2px solid #e0e0e0',
                  borderRadius: '25px',
                  background: timeRange === range 
                    ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                    : 'white',
                  color: timeRange === range ? 'white' : '#333',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  boxShadow: timeRange === range 
                    ? '0 4px 15px rgba(79, 172, 254, 0.3)'
                    : '0 2px 5px rgba(0,0,0,0.1)'
                }}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'practice', label: 'Practice', icon: '🧘' },
            { key: 'mind-recovery', label: 'Mind Recovery', icon: '🕐' },
            { key: 'emotional', label: 'Emotional', icon: '💝' },
            { key: 'pahm', label: '9-Category PAHM', icon: '🧠' },
            { key: 'environment', label: 'Environment', icon: '🌿' },
            { key: 'insights', label: 'Insights', icon: '💡' },
            { key: 'usage', label: 'Usage', icon: '📱' }
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 20px',
                border: activeTab === tab.key ? 'none' : '2px solid #e0e0e0',
                borderRadius: '25px',
                background: activeTab === tab.key 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'white',
                color: activeTab === tab.key ? 'white' : '#333',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                transition: 'all 0.3s',
                boxShadow: activeTab === tab.key 
                  ? '0 4px 15px rgba(102, 126, 234, 0.3)'
                  : '0 2px 5px rgba(0,0,0,0.1)'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </header>
      
      {/* Content Area */}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '30px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'practice' && renderOverviewTab()}
        {activeTab === 'mind-recovery' && renderMindRecoveryTab()}
        {activeTab === 'emotional' && renderEmotionalTab()}
        {activeTab === 'pahm' && renderPAHMTab()}
        {activeTab === 'environment' && renderEnvironmentTab()}
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'usage' && renderUsageTab()}
      </div>
    </div>
  );
};

export default AnalyticsBoard;