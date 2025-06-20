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
    present_happy: number;
    present_unhappy: number;
    absent_happy: number;
    absent_unhappy: number;
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
    getProgressTrends
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
  
  // 🔥 COMPREHENSIVE SAMPLE DATA GENERATOR
  const populateComprehensiveSampleData = () => {
    const comprehensiveSessions: PracticeSession[] = [
      {
        id: 'session_001',
        date: '2025-06-19T07:30:00.000Z',
        duration: 25,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_002',
        date: '2025-06-18T19:15:00.000Z',
        duration: 20,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'lying',
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
        id: 'session_003',
        date: '2025-06-17T06:45:00.000Z',
        duration: 30,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_004',
        date: '2025-06-16T12:30:00.000Z',
        duration: 15,
        stageLevel: 'Stage 1: Establishing a Practice',
        position: 'sitting',
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
        id: 'session_005',
        date: '2025-06-15T07:00:00.000Z',
        duration: 35,
        stageLevel: 'Stage 4: Continuous Attention',
        position: 'sitting',
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
        id: 'session_006',
        date: '2025-06-14T18:00:00.000Z',
        duration: 22,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'sitting',
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
        id: 'session_007',
        date: '2025-06-13T07:15:00.000Z',
        duration: 28,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_008',
        date: '2025-06-12T20:00:00.000Z',
        duration: 18,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'lying',
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
        id: 'session_009',
        date: '2025-06-11T06:30:00.000Z',
        duration: 32,
        stageLevel: 'Stage 4: Continuous Attention',
        position: 'sitting',
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
        id: 'session_010',
        date: '2025-06-10T16:45:00.000Z',
        duration: 25,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_011',
        date: '2025-06-09T07:00:00.000Z',
        duration: 20,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'sitting',
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
        id: 'session_012',
        date: '2025-06-08T19:30:00.000Z',
        duration: 26,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
        id: 'session_013',
        date: '2025-06-07T08:15:00.000Z',
        duration: 24,
        stageLevel: 'Stage 2: Sustained Attention',
        position: 'sitting',
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
        id: 'session_014',
        date: '2025-06-06T17:00:00.000Z',
        duration: 30,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'walking',
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
        id: 'session_015',
        date: '2025-06-05T06:45:00.000Z',
        duration: 27,
        stageLevel: 'Stage 3: Interrupted Attention',
        position: 'sitting',
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
      // Mind Recovery Sessions - Mapped to your existing MindRecoveryHub exercise IDs
      {
        id: 'session_016',
        date: '2025-06-19T06:30:00.000Z',
        duration: 3,
        stageLevel: 'Mind Recovery: Breathing Reset',
        position: 'lying',
        rating: 9,
        notes: 'Morning recharge with breathing reset. Perfect energy boost to start the day with clarity.',
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
        }
      },
      {
        id: 'session_017',
        date: '2025-06-18T14:15:00.000Z',
        duration: 5,
        stageLevel: 'Mind Recovery: Thought Labeling',
        position: 'sitting',
        rating: 8,
        notes: 'Thought labeling practice after a stressful meeting. Quickly restored emotional balance and perspective.',
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
        }
      },
      {
        id: 'session_018',
        date: '2025-06-17T12:00:00.000Z',
        duration: 4,
        stageLevel: 'Mind Recovery: Body Scan',
        position: 'sitting',
        rating: 8,
        notes: 'Midday body scan to refresh mental clarity. Great reset for afternoon productivity.',
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
        }
      },
      {
        id: 'session_019',
        date: '2025-06-16T18:30:00.000Z',
        duration: 4,
        stageLevel: 'Mind Recovery: Single Point Focus',
        position: 'sitting',
        rating: 9,
        notes: 'Single point focus for work-to-home transition. Perfect way to leave work stress behind.',
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
        }
      },
      {
        id: 'session_020',
        date: '2025-06-15T21:45:00.000Z',
        duration: 3,
        stageLevel: 'Mind Recovery: Loving Kindness',
        position: 'lying',
        rating: 8,
        notes: 'Evening loving kindness before sleep. Wonderful way to unwind and prepare for rest.',
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
        }
      },
      {
        id: 'session_021',
        date: '2025-06-14T10:30:00.000Z',
        duration: 2,
        stageLevel: 'Mind Recovery: Gratitude Moment',
        position: 'sitting',
        rating: 8,
        notes: 'Gratitude moment after feeling overwhelmed. Quick and effective emotional reset.',
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
        }
      }
    ];

    const comprehensiveNotes: EmotionalNote[] = [
      {
        id: 'note_001',
        content: 'Feeling grateful for consistent practice and the clarity it brings to daily life.',
        timestamp: '2025-06-19T22:00:00.000Z',
        emotion: 'joy',
        energyLevel: 8,
        tags: ['morning practice', 'supportive colleagues', 'good health'],
        gratitude: ['consistent practice', 'mental clarity', 'peaceful mind']
      },
      {
        id: 'note_002',
        content: 'Slow start this morning but committed to practice. Evening reflection shows growth.',
        timestamp: '2025-06-18T21:30:00.000Z',
        emotion: 'content',
        energyLevel: 6,
        tags: ['restful evening practice', 'comfortable home', 'peaceful sleep'],
        gratitude: ['commitment to growth', 'comfortable space', 'restful sleep']
      },
      {
        id: 'note_003',
        content: 'Outdoor practice was transformative. Nature connection enhances meditation depth.',
        timestamp: '2025-06-17T20:45:00.000Z',
        emotion: 'joyful',
        energyLevel: 9,
        tags: ['nature connection', 'bird songs', 'sunrise beauty', 'stable mind'],
        gratitude: ['natural beauty', 'outdoor access', 'bird songs', 'sunrise']
      },
      {
        id: 'note_004',
        content: 'Workplace stress dissolved through afternoon meditation. Powerful practice.',
        timestamp: '2025-06-16T18:00:00.000Z',
        emotion: 'relieved',
        energyLevel: 7,
        tags: ['stress relief', 'workplace balance', 'afternoon reset'],
        gratitude: ['meditation tools', 'stress relief', 'workplace flexibility']
      },
      {
        id: 'note_005',
        content: 'Rainy day meditation created perfect atmosphere. Weather as meditation support.',
        timestamp: '2025-06-15T19:15:00.000Z',
        emotion: 'peaceful',
        energyLevel: 8,
        tags: ['rain sounds', 'cozy atmosphere', 'natural ambiance'],
        gratitude: ['natural sounds', 'cozy indoor space', 'weather patterns']
      },
      {
        id: 'note_006',
        content: 'Building evening habit successfully. Consistency creates deeper states naturally.',
        timestamp: '2025-06-14T21:00:00.000Z',
        emotion: 'satisfied',
        energyLevel: 7,
        tags: ['habit formation', 'evening routine', 'consistency'],
        gratitude: ['developing habits', 'evening routine', 'self-discipline']
      },
      {
        id: 'note_007',
        content: 'Morning sessions continue to amaze. Fresh mind absorbs practice effortlessly.',
        timestamp: '2025-06-13T20:30:00.000Z',
        emotion: 'amazed',
        energyLevel: 8,
        tags: ['morning clarity', 'fresh mind', 'effortless practice'],
        gratitude: ['morning freshness', 'clear mind', 'effortless states']
      },
      {
        id: 'note_008',
        content: 'Late evening practice perfect for day completion. Candle created sacred space.',
        timestamp: '2025-06-12T22:15:00.000Z',
        emotion: 'serene',
        energyLevel: 6,
        tags: ['candlelight', 'sacred space', 'day completion'],
        gratitude: ['candles', 'sacred space', 'day closure']
      },
      {
        id: 'note_009',
        content: 'Breakthrough session today! Jhana-like states emerged spontaneously. Profound unity.',
        timestamp: '2025-06-11T21:45:00.000Z',
        emotion: 'ecstatic',
        energyLevel: 10,
        tags: ['breakthrough', 'jhana states', 'unity experience', 'profound peace'],
        gratitude: ['breakthrough experiences', 'unity consciousness', 'profound peace']
      },
      {
        id: 'note_010',
        content: 'Work stress transformed through practice. Meditation as emotional alchemy.',
        timestamp: '2025-06-10T19:00:00.000Z',
        emotion: 'transformed',
        energyLevel: 8,
        tags: ['stress transformation', 'emotional alchemy', 'work balance'],
        gratitude: ['transformative practice', 'emotional tools', 'work-life balance']
      },
      {
        id: 'note_011',
        content: 'Mind Recovery breathing reset is becoming a powerful daily ritual. Sets such a positive tone.',
        timestamp: '2025-06-19T08:00:00.000Z',
        emotion: 'energized',
        energyLevel: 9,
        tags: ['morning routine', 'breathing reset', 'daily ritual'],
        gratitude: ['morning clarity', 'quick techniques', 'consistent practice']
      },
      {
        id: 'note_012',
        content: 'The thought labeling practice saved my day. Amazing how quickly it shifted my emotional state.',
        timestamp: '2025-06-18T15:00:00.000Z',
        emotion: 'relieved',
        energyLevel: 7,
        tags: ['emotional balance', 'stress relief', 'quick recovery'],
        gratitude: ['emotional tools', 'quick relief', 'stress management']
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
      longestStreak: 15,
      currentStreak: 8,
      averageQuality: Math.round(averageQuality * 10) / 10,
      averagePresentPercentage: Math.round(averagePresentPercentage)
    });

    // Also populate basic data
    if (basicPopulate) {
      basicPopulate();
    }

    console.log('🎯 Comprehensive sample data with Mind Recovery populated!');
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
      
      // Convert context sessions to local format
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
      day: 'numeric'
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
      const dateKey = formatDate(session.date);
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

  // Get PAHM Matrix insights
  const getPAHMInsights = () => {
    const { practice } = getFilteredData();
    const sessionsWithPAHM = practice.filter(s => s.pahmCounts);
    
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
      trend: sessionsWithPAHM.slice(-10).map(session => ({
        date: formatDate(session.date),
        percentage: session.presentPercentage || 0
      })),
      totalObservations: totalCounts,
      sessionsAnalyzed: sessionsWithPAHM.length,
      // Split by session type
      meditationPAHM: {
        sessions: sessionsWithPAHM.filter(s => !s.stageLevel.includes('Mind Recovery')).length,
        avgPresent: Math.round(sessionsWithPAHM.filter(s => !s.stageLevel.includes('Mind Recovery')).reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / Math.max(1, sessionsWithPAHM.filter(s => !s.stageLevel.includes('Mind Recovery')).length))
      },
      mindRecoveryPAHM: {
        sessions: sessionsWithPAHM.filter(s => s.stageLevel.includes('Mind Recovery')).length,
        avgPresent: Math.round(sessionsWithPAHM.filter(s => s.stageLevel.includes('Mind Recovery')).reduce((sum, s) => sum + (s.presentPercentage || 0), 0) / Math.max(1, sessionsWithPAHM.filter(s => s.stageLevel.includes('Mind Recovery')).length))
      }
    };
  };

  // Environment analysis
  const getEnvironmentAnalysis = () => {
    const { practice } = getFilteredData();
    const withEnv = practice.filter(s => s.environment);
    
    if (withEnv.length === 0) return null;
    
    const postureStats: {[key: string]: {count: number, avgRating: number}} = {};
    const locationStats: {[key: string]: {count: number, avgRating: number}} = {};
    const lightingStats: {[key: string]: {count: number, avgRating: number}} = {};
    const soundStats: {[key: string]: {count: number, avgRating: number}} = {};
    
    withEnv.forEach(session => {
      const env = session.environment!;
      const rating = session.rating || 0;
      
      ['posture', 'location', 'lighting', 'sounds'].forEach(key => {
        const value = env[key as keyof typeof env];
        const stats = key === 'posture' ? postureStats : 
                     key === 'location' ? locationStats :
                     key === 'lighting' ? lightingStats : soundStats;
        
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

  // Mind Recovery Analytics - Using context data if available, fallback to local
  const getMindRecoveryInsights = () => {
    if (mindRecoveryAnalytics) {
      return mindRecoveryAnalytics;
    }

    // Fallback to local data analysis
    const mindRecoverySessions = practiceData.filter(s => s.stageLevel.includes('Mind Recovery'));
    
    if (mindRecoverySessions.length === 0) return null;
    
    const exerciseTypes: {[key: string]: {count: number, avgRating: number}} = {};
    
    mindRecoverySessions.forEach(session => {
      const exercise = session.stageLevel.replace('Mind Recovery: ', '');
      if (!exerciseTypes[exercise]) {
        exerciseTypes[exercise] = {count: 0, avgRating: 0};
      }
      exerciseTypes[exercise].count++;
      exerciseTypes[exercise].avgRating = 
        (exerciseTypes[exercise].avgRating * (exerciseTypes[exercise].count - 1) + (session.rating || 0)) / exerciseTypes[exercise].count;
    });
    
    return {
      totalMindRecoverySessions: mindRecoverySessions.length,
      avgMindRecoveryRating: Math.round(mindRecoverySessions.reduce((sum, s) => sum + (s.rating || 0), 0) / mindRecoverySessions.length * 10) / 10,
      avgMindRecoveryDuration: Math.round(mindRecoverySessions.reduce((sum, s) => sum + s.duration, 0) / mindRecoverySessions.length),
      exerciseStats: Object.entries(exerciseTypes).map(([type, stats]) => ({
        type,
        count: stats.count,
        avgRating: Math.round(stats.avgRating * 10) / 10
      })),
      recentSessions: mindRecoverySessions.slice(-5)
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
          background: 'linear-gradient(to bottom, #f8fafe 0%, #ffffff 100%)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ 
              position: 'absolute',
              bottom: `${i * 25}%`,
              left: 0,
              right: 0,
              height: '1px',
              background: i === 0 ? '#ddd' : '#f0f0f0'
            }} />
          ))}
          
          {/* Data points and lines */}
          <svg style={{ width: '100%', height: '100%', position: 'absolute' }}>
            {data.map((item, index) => {
              if (index === 0) return null;
              
              const prevItem = data[index - 1];
              const x1 = ((index - 1) / (data.length - 1)) * 100;
              const y1 = 100 - ((prevItem.duration - minValue) / (maxValue - minValue)) * 90;
              const x2 = (index / (data.length - 1)) * 100;
              const y2 = 100 - ((item.duration - minValue) / (maxValue - minValue)) * 90;
              
              return (
                <line
                  key={index}
                  x1={`${x1}%`}
                  y1={`${y1}%`}
                  x2={`${x2}%`}
                  y2={`${y2}%`}
                  stroke="url(#lineGradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
            </defs>
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((item.duration - minValue) / (maxValue - minValue)) * 90;
              
              return (
                <circle
                  key={index}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#4facfe"
                  stroke="white"
                  strokeWidth="2"
                >
                  <title>{`${item.date}: ${item.duration} minutes`}</title>
                </circle>
              );
            })}
          </svg>
          
          {/* Date labels */}
          <div style={{ 
            position: 'absolute', 
            bottom: '-25px', 
            left: 0, 
            right: 0, 
            display: 'flex', 
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#666'
          }}>
            {data.map((item, index) => (
              index % Math.ceil(data.length / 5) === 0 && (
                <span key={index}>{item.date}</span>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  // PAHM Matrix Chart
  const PAHMMatrixChart = ({ insights }: { insights: any }) => {
    if (!insights || !insights.pahmDistribution) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          Complete practice sessions to see PAHM Matrix analysis
        </div>
      );
    }
    
    const { pahmDistribution } = insights;
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ marginBottom: '20px', color: '#333' }}>🧠 PAHM Matrix Analysis</h4>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ 
            background: `linear-gradient(135deg, rgba(76, 175, 80, ${Math.max(0.3, pahmDistribution.present_happy / 100)}) 0%, rgba(139, 195, 74, ${Math.max(0.3, pahmDistribution.present_happy / 100)}) 100%)`,
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #4caf50',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px' }}>
              {pahmDistribution.present_happy}%
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#388e3c' }}>
              Present + Happy
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Ideal meditation state
            </div>
          </div>
          
          <div style={{ 
            background: `linear-gradient(135deg, rgba(255, 152, 0, ${Math.max(0.3, pahmDistribution.present_unhappy / 100)}) 0%, rgba(255, 193, 7, ${Math.max(0.3, pahmDistribution.present_unhappy / 100)}) 100%)`,
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #ff9800',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00', marginBottom: '8px' }}>
              {pahmDistribution.present_unhappy}%
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef6c00' }}>
              Present + Unhappy
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Aware but difficult
            </div>
          </div>
          
          <div style={{ 
            background: `linear-gradient(135deg, rgba(33, 150, 243, ${Math.max(0.3, pahmDistribution.absent_happy / 100)}) 0%, rgba(3, 169, 244, ${Math.max(0.3, pahmDistribution.absent_happy / 100)}) 100%)`,
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #2196f3',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2', marginBottom: '8px' }}>
              {pahmDistribution.absent_happy}%
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1565c0' }}>
              Absent + Happy
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Pleasant mind-wandering
            </div>
          </div>
          
          <div style={{ 
            background: `linear-gradient(135deg, rgba(244, 67, 54, ${Math.max(0.3, pahmDistribution.absent_unhappy / 100)}) 0%, rgba(233, 30, 99, ${Math.max(0.3, pahmDistribution.absent_unhappy / 100)}) 100%)`,
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #f44336',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f', marginBottom: '8px' }}>
              {pahmDistribution.absent_unhappy}%
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#c62828' }}>
              Absent + Unhappy
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Distracted & suffering
            </div>
          </div>
        </div>
        
        <div style={{ 
          background: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Overall Present Attention:</span>
            <span style={{ fontWeight: 'bold', color: '#4facfe', fontSize: '18px' }}>
              {insights.averagePresent}%
            </span>
          </div>
          {insights.meditationPAHM && insights.mindRecoveryPAHM && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: '500', color: '#555' }}>🧘 Meditation Present:</span>
                <span style={{ fontWeight: '600', color: '#667eea' }}>
                  {insights.meditationPAHM.avgPresent}% ({insights.meditationPAHM.sessions} sessions)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', color: '#555' }}>🕐 Mind Recovery Present:</span>
                <span style={{ fontWeight: '600', color: '#fa709a' }}>
                  {insights.mindRecoveryPAHM.avgPresent}% ({insights.mindRecoveryPAHM.sessions} sessions)
                </span>
              </div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontWeight: '600', color: '#333' }}>Total Observations:</span>
            <span style={{ fontWeight: 'bold', color: '#666' }}>
              {insights.totalObservations}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Mind Recovery Context Chart
  const MindRecoveryContextChart = ({ analytics }: { analytics: any }) => {
    if (!analytics) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          No Mind Recovery data available
        </div>
      );
    }
    
    const exerciseData = analytics.contextStats || analytics.exerciseStats || [];
    
    return (
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '12px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h4 style={{ marginBottom: '20px', color: '#333' }}>🕐 Mind Recovery Distribution</h4>
        <div style={{ display: 'grid', gap: '12px' }}>
          {exerciseData.map((item: any, index: number) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  {item.context || item.type}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {item.count} sessions{item.avgDuration && ` • ${item.avgDuration}min avg`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '700',
                  color: item.avgRating >= 8 ? '#4caf50' : item.avgRating >= 6 ? '#ff9800' : '#f44336'
                }}>
                  {item.avgRating}/10
                </div>
                {item.avgPresent && (
                  <div style={{ 
                    fontSize: '12px',
                    color: item.avgPresent >= 80 ? '#4caf50' : item.avgPresent >= 60 ? '#ff9800' : '#f44336'
                  }}>
                    {item.avgPresent}% present
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Environment Analysis Chart
  const EnvironmentChart = ({ envData, title }: { envData: any, title: string }) => {
    if (!envData || envData.length === 0) {
      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          color: '#666',
          background: '#f8f9fa',
          borderRadius: '8px'
        }}>
          No environment data available
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '20px' }}>
        <h5 style={{ marginBottom: '15px', color: '#333' }}>{title}</h5>
        <div style={{ display: 'grid', gap: '8px' }}>
          {envData.map((item: any, index: number) => (
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
    );
  };

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

  const currentPahmInsights = pahmInsights || getPAHMInsights();
  const currentEnvironmentAnalysis = environmentAnalysis || getEnvironmentAnalysis();
  const currentMindRecoveryAnalytics = mindRecoveryAnalytics || getMindRecoveryInsights();

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
          Advanced Analytics
        </h1>
        <p style={{ 
          color: '#666', 
          fontSize: '1.2rem', 
          marginBottom: '25px',
          lineHeight: '1.6'
        }}>
          Comprehensive meditation analytics with PAHM Matrix insights, Mind Recovery tracking, environmental factors, and progress analysis.
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
                🧘 Meditation: {contextAnalytics?.totalMeditationSessions || practiceData.filter(s => !s.stageLevel.includes('Mind Recovery')).length}
              </span>
              <span style={{ color: '#fa709a', fontWeight: '600' }}>
                🕐 Mind Recovery: {contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length}
              </span>
              <span style={{ color: '#2196f3', fontWeight: '600' }}>
                💝 Emotional Notes: {contextAnalytics?.emotionalNotesCount || emotionalNotes.length}
              </span>
              <span style={{ color: '#ff9800', fontWeight: '600' }}>
                🧠 PAHM Matrix: {currentPahmInsights ? 'Available' : 'Building'}
              </span>
              <span style={{ color: '#9c27b0', fontWeight: '600' }}>
                🌿 Environment Analysis: {currentEnvironmentAnalysis ? 'Active' : 'Building'}
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
          </div>
          <div style={{ fontSize: '13px', color: '#666', display: 'grid', gap: '5px' }}>
            <p>📱 User: {currentUser?.displayName || 'Not logged in'} | 🆔 UID: {currentUser?.uid || 'N/A'}</p>
            <p>📊 Sessions: {contextAnalytics?.totalSessions || practiceData.length} | 📝 Notes: {contextAnalytics?.emotionalNotesCount || emotionalNotes.length} | ⚡ Quality: {contextAnalytics?.averageQuality || appUsage.averageQuality || 0}/10</p>
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
            {['week', 'month', 'year'].map(range => (
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
            { key: 'pahm', label: 'PAHM Matrix', icon: '🧠' },
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
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
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
                  value: contextAnalytics?.totalSessions || appUsage.totalSessions,
                  label: 'Total Sessions',
                  icon: '🧘',
                  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  insight: `${contextAnalytics?.totalMeditationSessions || practiceData.filter(s => !s.stageLevel.includes('Mind Recovery')).length} meditation + ${contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length} recovery`
                },
                {
                  value: Math.round((contextAnalytics?.totalPracticeTime || appUsage.totalPracticeTime) / 60),
                  label: 'Practice Hours',
                  icon: '⏰',
                  color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  insight: `${contextAnalytics?.averageSessionLength || appUsage.averageSessionLength}min avg`
                },
                {
                  value: contextAnalytics?.currentStreak || appUsage.currentStreak,
                  label: 'Day Streak',
                  icon: '🔥',
                  color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  insight: `Best: ${contextAnalytics?.longestStreak || appUsage.longestStreak} days`
                },
                {
                  value: contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length,
                  label: 'Mind Recovery',
                  icon: '🕐',
                  color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                  insight: 'PAHM in context'
                },
                {
                  value: contextAnalytics?.emotionalNotesCount || emotionalNotes.length,
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
                    {currentPahmInsights.averagePresent}%
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
                    Quality: {contextAnalytics?.averageQuality || appUsage.averageQuality || 0}/10
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
              <div style={{ display: 'grid', gap: '20px' }}>
                {(contextAnalytics?.totalSessions || appUsage.totalSessions) === 0 ? (
                  <div style={{ 
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                    padding: '30px', 
                    borderRadius: '16px',
                    border: '2px solid #2196f3',
                    textAlign: 'center'
                  }}>
                    <h4 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>🌟 Welcome to Advanced Analytics!</h4>
                    <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '20px' }}>
                      Click "🎯 Populate Comprehensive Data" above to see your full analytics dashboard in action with rich insights, PAHM Matrix analysis, Mind Recovery tracking, and environmental analysis!
                    </p>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.7)',
                      padding: '15px',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      color: '#666'
                    }}>
                      ✨ You'll get 15+ meditation sessions, 6+ Mind Recovery contexts, emotional tracking, attention analysis, and environment insights
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {[
                      {
                        icon: '📈',
                        title: 'Integrated Practice',
                        content: `Outstanding! You've completed ${contextAnalytics?.totalSessions || appUsage.totalSessions} total sessions: ${contextAnalytics?.totalMeditationSessions || practiceData.filter(s => !s.stageLevel.includes('Mind Recovery')).length} meditation + ${contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length} Mind Recovery.`,
                        color: '#4caf50'
                      },
                      {
                        icon: '⏰',
                        title: 'Time Investment',
                        content: `You've invested ${Math.round((contextAnalytics?.totalPracticeTime || appUsage.totalPracticeTime) / 60)} hours across formal meditation and contextual PAHM practice.`,
                        color: '#2196f3'
                      },
                      {
                        icon: '🔥',
                        title: 'Consistency Power',
                        content: `Current ${contextAnalytics?.currentStreak || appUsage.currentStreak}-day streak! Your longest streak was ${contextAnalytics?.longestStreak || appUsage.longestStreak} days. Consistency creates transformation.`,
                        color: '#ff9800'
                      },
                      ...(currentPahmInsights ? [{
                        icon: '🧠',
                        title: 'Unified Attention Quality',
                        content: `Your present attention averages ${currentPahmInsights.averagePresent}% across both meditation and Mind Recovery practices, with ${currentPahmInsights.pahmDistribution?.present_happy}% in the ideal present+happy state.`,
                        color: '#9c27b0'
                      }] : []),
                      ...(currentMindRecoveryAnalytics ? [{
                        icon: '🕐',
                        title: 'Contextual PAHM Mastery',
                        content: `You've applied PAHM technique in ${currentMindRecoveryAnalytics.totalMindRecoverySessions} Mind Recovery sessions, demonstrating integrated mindfulness practice.`,
                        color: '#fa709a'
                      }] : []),
                      ...(currentEnvironmentAnalysis ? [{
                        icon: '🌿',
                        title: 'Environment Optimization',
                        content: `You've practiced in ${new Set(practiceData.filter(s => s.environment).map(s => s.environment?.location)).size} different locations, optimizing your practice environment.`,
                        color: '#4caf50'
                      }] : [])
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
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Practice Tab */}
        {activeTab === 'practice' && (
          <div>
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
                data={getPracticeDistribution()} 
                valueKey="count" 
                labelKey="stage"
                title="🧘 Practice by Type"
              />
            </div>
            
            <h3 style={{ 
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '20px',
              color: '#333'
            }}>
              📝 Recent Practice Sessions
            </h3>
            <div style={{ display: 'grid', gap: '20px' }}>
              {getFilteredData().practice.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: '#666',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6'
                }}>
                  No practice sessions in the selected time range. Click "🎯 Populate Comprehensive Data" to see example sessions.
                </div>
              ) : (
                getFilteredData().practice.slice(0, 10).map(session => (
                  <div key={session.id} style={{ 
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
                      <div>
                        <div style={{ 
                          fontSize: '1.2rem',
                          fontWeight: '700',
                          color: '#333',
                          marginBottom: '5px'
                        }}>
                          {formatDate(session.date)}
                        </div>
                        <div style={{ 
                          color: session.stageLevel.includes('Mind Recovery') ? '#fa709a' : '#667eea',
                          fontWeight: '600',
                          marginBottom: '8px'
                        }}>
                          {session.stageLevel}
                        </div>
                        <div style={{ 
                          display: 'flex',
                          gap: '15px',
                          fontSize: '0.9rem',
                          color: '#777'
                        }}>
                          <span>⏱️ {session.duration} min</span>
                          <span>🧘 {session.position}</span>
                          {session.rating && (
                            <span style={{ 
                              color: session.rating >= 8 ? '#4caf50' : session.rating >= 6 ? '#ff9800' : '#f44336',
                              fontWeight: '600'
                            }}>
                              ⭐ {session.rating}/10
                            </span>
                          )}
                          {session.presentPercentage && (
                            <span style={{ 
                              color: session.presentPercentage >= 80 ? '#4caf50' : session.presentPercentage >= 60 ? '#ff9800' : '#f44336',
                              fontWeight: '600'
                            }}>
                              🧠 {session.presentPercentage}% present
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {session.environment && showAdvanced && (
                        <div style={{ 
                          background: '#f8f9fa',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#666',
                          minWidth: '120px'
                        }}>
                          <div>📍 {session.environment.location}</div>
                          <div>💡 {session.environment.lighting}</div>
                          <div>🔊 {session.environment.sounds}</div>
                        </div>
                      )}
                    </div>
                    
                    {session.notes && (
                      <div style={{ 
                        marginTop: '15px', 
                        padding: '15px', 
                        background: 'linear-gradient(135deg, #f8fafe 0%, #ffffff 100%)', 
                        borderRadius: '8px',
                        border: '1px solid #e3f2fd',
                        fontSize: '0.95rem',
                        lineHeight: '1.6',
                        color: '#555'
                      }}>
                        <span style={{ fontWeight: '600', color: '#333' }}>💭 Insights: </span>
                        {session.notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Mind Recovery Tab - NEW ADDITION */}
        {activeTab === 'mind-recovery' && (
          <div>
            {currentMindRecoveryAnalytics ? (
              <>
                {/* Mind Recovery Overview */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '20px', 
                  marginBottom: '40px' 
                }}>
                  {[
                    {
                      value: currentMindRecoveryAnalytics.totalMindRecoverySessions,
                      label: 'Recovery Sessions',
                      icon: '🕐',
                      color: '#fa709a'
                    },
                    {
                      value: `${currentMindRecoveryAnalytics.avgMindRecoveryDuration}min`,
                      label: 'Avg Duration',
                      icon: '⏱️',
                      color: '#4facfe'
                    },
                    {
                      value: currentMindRecoveryAnalytics.avgMindRecoveryRating,
                      label: 'Avg Rating',
                      icon: '⭐',
                      color: '#ff9800'
                    },
                    {
                      value: `${currentMindRecoveryAnalytics.avgMindRecoveryPresent || 'N/A'}%`,
                      label: 'Avg Present',
                      icon: '🧠',
                      color: '#9c27b0'
                    }
                  ].map((metric, index) => (
                    <div key={index} style={{ 
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.08)'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{metric.icon}</div>
                      <div style={{ 
                        fontSize: '1.8rem', 
                        fontWeight: '700',
                        color: metric.color,
                        marginBottom: '5px'
                      }}>
                        {metric.value}
                      </div>
                      <div style={{ 
                        color: '#666', 
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Mind Recovery Analysis */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: '30px',
                  marginBottom: '40px'
                }}>
                  <MindRecoveryContextChart analytics={currentMindRecoveryAnalytics} />
                  
                  {currentMindRecoveryAnalytics.avgRecoveryMetrics && (
                    <div style={{ 
                      background: 'white', 
                      padding: '20px', 
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      <h4 style={{ marginBottom: '20px', color: '#333' }}>📈 Recovery Effectiveness</h4>
                      <div style={{ display: 'grid', gap: '15px' }}>
                        {[
                          { key: 'stressReduction', label: 'Stress Reduction', icon: '😌', color: '#4caf50' },
                          { key: 'energyLevel', label: 'Energy Level', icon: '⚡', color: '#ff9800' },
                          { key: 'clarityImprovement', label: 'Mental Clarity', icon: '🎯', color: '#2196f3' },
                          { key: 'moodImprovement', label: 'Mood Improvement', icon: '😊', color: '#9c27b0' }
                        ].map((metric, index) => (
                          <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '10px',
                            background: '#f8f9fa',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '1.2rem' }}>{metric.icon}</span>
                              <span style={{ fontWeight: '500', color: '#333' }}>{metric.label}</span>
                            </div>
                            <span style={{ 
                              fontSize: '1.2rem', 
                              fontWeight: '700',
                              color: metric.color
                            }}>
                              {currentMindRecoveryAnalytics.avgRecoveryMetrics[metric.key]}/10
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Best Contexts */}
                {(currentMindRecoveryAnalytics.mostUsedContext || currentMindRecoveryAnalytics.highestRatedContext) && (
                  <div style={{ 
                    background: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    marginBottom: '30px'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      marginBottom: '25px',
                      color: '#333'
                    }}>
                      🏆 Optimal Mind Recovery Contexts
                    </h3>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                      gap: '20px' 
                    }}>
                      {currentMindRecoveryAnalytics.mostUsedContext && (
                        <div style={{ 
                          background: 'linear-gradient(135deg, #e8f5e8 0%, #f0fff0 100%)',
                          padding: '20px',
                          borderRadius: '12px',
                          border: '2px solid #4caf50'
                        }}>
                          <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>Most Used Context</h4>
                          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#388e3c', marginBottom: '5px' }}>
                            {currentMindRecoveryAnalytics.mostUsedContext.name}
                          </div>
                          <div style={{ color: '#555' }}>
                            {currentMindRecoveryAnalytics.mostUsedContext.count} sessions • {currentMindRecoveryAnalytics.mostUsedContext.avgRating}/10 rating
                          </div>
                        </div>
                      )}
                      
                      {currentMindRecoveryAnalytics.highestRatedContext && (
                        <div style={{ 
                          background: 'linear-gradient(135deg, #fff3e0 0%, #fffbf0 100%)',
                          padding: '20px',
                          borderRadius: '12px',
                          border: '2px solid #ff9800'
                        }}>
                          <h4 style={{ color: '#f57c00', marginBottom: '10px' }}>Highest Rated Context</h4>
                          <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#ef6c00', marginBottom: '5px' }}>
                            {currentMindRecoveryAnalytics.highestRatedContext.name}
                          </div>
                          <div style={{ color: '#555' }}>
                            {currentMindRecoveryAnalytics.highestRatedContext.avgRating}/10 rating • {currentMindRecoveryAnalytics.highestRatedContext.count} sessions
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Recent Sessions */}
                <h3 style={{ 
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#333'
                }}>
                  🕐 Recent Mind Recovery Sessions
                </h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  {currentMindRecoveryAnalytics.recentSessions && currentMindRecoveryAnalytics.recentSessions.slice(0, 5).map((session: any, index: number) => (
                    <div key={index} style={{ 
                      background: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e0e0e0',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ 
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '5px'
                          }}>
                            {formatDate(session.timestamp || session.date)} - {session.mindRecoveryContext?.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || session.stageLevel?.replace('Mind Recovery: ', '')}
                          </div>
                          <div style={{ 
                            color: '#666',
                            fontSize: '0.9rem',
                            marginBottom: '10px'
                          }}>
                            ⏱️ {session.duration}min • 🎯 {session.mindRecoveryPurpose?.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') || 'Mind Recovery'}
                          </div>
                          {session.notes && (
                            <div style={{ 
                              fontSize: '0.9rem',
                              color: '#555',
                              fontStyle: 'italic',
                              lineHeight: '1.4'
                            }}>
                              💭 {session.notes}
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: '700',
                            color: session.rating >= 8 ? '#4caf50' : session.rating >= 6 ? '#ff9800' : '#f44336'
                          }}>
                            ⭐ {session.rating}/10
                          </div>
                          {session.presentPercentage && (
                            <div style={{ 
                              fontSize: '0.9rem',
                              color: session.presentPercentage >= 80 ? '#4caf50' : session.presentPercentage >= 60 ? '#ff9800' : '#f44336'
                            }}>
                              🧠 {session.presentPercentage}%
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🕐</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
                  No Mind Recovery Data Yet
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
                  Complete Mind Recovery sessions to see contextual PAHM practice analysis.
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
        )}
        
        {/* Emotional Tab */}
        {activeTab === 'emotional' && (
          <div>
            <div style={{ marginBottom: '40px' }}>
              <EnhancedBarChart 
                data={getEmotionDistribution()} 
                valueKey="count" 
                labelKey="emotion"
                colorKey="color"
                title="😊 Emotional Distribution"
              />
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
        )}
        
        {/* PAHM Matrix Tab */}
        {activeTab === 'pahm' && (
          <div>
            {currentPahmInsights ? (
              <>
                <div style={{ marginBottom: '40px' }}>
                  <PAHMMatrixChart insights={currentPahmInsights} />
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: showAdvanced ? 'repeat(auto-fit, minmax(300px, 1fr))' : '1fr 1fr',
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
                    <h4 style={{ 
                      fontSize: '1.3rem',
                      fontWeight: '700',
                      marginBottom: '20px',
                      color: '#333'
                    }}>
                      🎯 Overall PAHM Performance
                    </h4>
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: '#4facfe', marginBottom: '10px' }}>
                      {currentPahmInsights.averagePresent}%
                    </div>
                    <div style={{ color: '#666', marginBottom: '15px' }}>
                      Average present attention across {currentPahmInsights.sessionsAnalyzed} sessions
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#555' }}>
                      Total observations: {currentPahmInsights.totalObservations}
                    </div>
                  </div>
                  
                  {currentPahmInsights.meditationPAHM && currentPahmInsights.mindRecoveryPAHM && (
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
                        📊 PAHM by Practice Type
                      </h4>
                      <div style={{ display: 'grid', gap: '15px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '12px',
                          background: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontWeight: '600', color: '#333' }}>🧘 Meditation:</span>
                          <span style={{ fontWeight: '700', color: '#667eea' }}>
                            {currentPahmInsights.meditationPAHM.avgPresent}% ({currentPahmInsights.meditationPAHM.sessions} sessions)
                          </span>
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          padding: '12px',
                          background: '#f8f9fa',
                          borderRadius: '8px'
                        }}>
                          <span style={{ fontWeight: '600', color: '#333' }}>🕐 Mind Recovery:</span>
                          <span style={{ fontWeight: '700', color: '#fa709a' }}>
                            {currentPahmInsights.mindRecoveryPAHM.avgPresent}% ({currentPahmInsights.mindRecoveryPAHM.sessions} sessions)
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <h3 style={{ 
                  fontSize: '1.8rem',
                  fontWeight: '700',
                  marginBottom: '20px',
                  color: '#333'
                }}>
                  🧠 PAHM Insights
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                  {[
                    {
                      icon: '🎯',
                      title: 'Present Attention Quality',
                      content: `Your present attention averages ${currentPahmInsights.averagePresent}%. This measures your mindfulness across both meditation and Mind Recovery practices.`,
                      color: '#4caf50'
                    },
                    {
                      icon: '😊',
                      title: 'Ideal Meditation State',
                      content: `${currentPahmInsights.pahmDistribution?.present_happy}% of tracked thoughts were present and positive - the optimal state for both formal meditation and contextual PAHM practice.`,
                      color: '#2196f3'
                    },
                    {
                      icon: '🧘',
                      title: 'Unified PAHM Practice',
                      content: `Your PAHM analysis includes ${currentPahmInsights.sessionsAnalyzed} sessions combining formal meditation and contextual Mind Recovery applications.`,
                      color: '#9c27b0'
                    },
                    {
                      icon: '🕐',
                      title: 'Contextual Application',
                      content: `Mind Recovery sessions show PAHM technique works effectively across different daily contexts and purposes.`,
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
                  No PAHM Data Yet
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
                  Complete practice sessions with attention tracking to see your PAHM Matrix analysis.
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
                  🎯 Get Sample PAHM Data
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Environment Tab */}
        {activeTab === 'environment' && (
          <div>
            {currentEnvironmentAnalysis ? (
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
                    <EnvironmentChart envData={currentEnvironmentAnalysis.posture} title="🧘 Posture Performance" />
                  </div>
                  
                  <div style={{ 
                    background: 'white',
                    padding: '25px',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <EnvironmentChart envData={currentEnvironmentAnalysis.location} title="📍 Location Impact" />
                  </div>
                  
                  <div style={{ 
                    background: 'white',
                    padding: '25px',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <EnvironmentChart envData={currentEnvironmentAnalysis.lighting} title="💡 Lighting Effects" />
                  </div>
                  
                  <div style={{ 
                    background: 'white',
                    padding: '25px',
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                  }}>
                    <EnvironmentChart envData={currentEnvironmentAnalysis.sounds} title="🔊 Sound Environment" />
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
                      content: `${currentEnvironmentAnalysis.posture.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name.charAt(0).toUpperCase() + currentEnvironmentAnalysis.posture.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name.slice(1)} meditation works best for you (${currentEnvironmentAnalysis.posture.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.avgRating}/10 average rating).`,
                      color: '#4caf50'
                    },
                    {
                      icon: '📍',
                      title: 'Best Location',
                      content: `${currentEnvironmentAnalysis.location.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name.charAt(0).toUpperCase() + currentEnvironmentAnalysis.location.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name.slice(1)} practice generates the highest quality sessions (${currentEnvironmentAnalysis.location.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.avgRating}/10).`,
                      color: '#2196f3'
                    },
                    {
                      icon: '💡',
                      title: 'Lighting Sweet Spot',
                      content: `${currentEnvironmentAnalysis.lighting.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name} lighting creates your most effective meditation environment.`,
                      color: '#ff9800'
                    },
                    {
                      icon: '🔊',
                      title: 'Sound Preference',
                      content: `${currentEnvironmentAnalysis.sounds.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name.charAt(0).toUpperCase() + currentEnvironmentAnalysis.sounds.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name.slice(1)} sounds enhance your practice quality the most.`,
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
                background: 'linear-gradient(135deg, #f8fafe 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #e3f2fd'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🌿</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
                  No Environment Data Yet
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
                  Complete practice sessions with environment tracking to see detailed analysis.
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
        )}
        
        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div>
            <h3 style={{ 
              fontSize: '1.8rem',
              fontWeight: '700',
              marginBottom: '30px',
              color: '#333'
            }}>
              💡 Comprehensive Practice Insights
            </h3>
            
            {((contextAnalytics?.totalSessions || appUsage.totalSessions) > 0) ? (
              <div style={{ display: 'grid', gap: '30px' }}>
                {/* Progress Overview with Mind Recovery Integration */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '30px',
                  borderRadius: '20px',
                  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)'
                }}>
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🎯 Your Integrated Practice Journey</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(200px, 1fr))', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
                        {Math.round((contextAnalytics?.totalPracticeTime || appUsage.totalPracticeTime) / 60 * 10) / 10}
                      </div>
                      <div style={{ opacity: 0.9 }}>Total Practice Hours</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
                        {contextAnalytics?.totalMeditationSessions || practiceData.filter(s => !s.stageLevel.includes('Mind Recovery')).length}
                      </div>
                      <div style={{ opacity: 0.9 }}>Meditation Sessions</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
                        {contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length}
                      </div>
                      <div style={{ opacity: 0.9 }}>Mind Recovery Sessions</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '5px' }}>
                        {currentPahmInsights?.averagePresent || 0}%
                      </div>
                      <div style={{ opacity: 0.9 }}>Present Attention</div>
                    </div>
                  </div>
                </div>
                
                {/* Pattern Recognition */}
                <div style={{ 
                  background: 'white',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <h4 style={{ fontSize: '1.3rem', marginBottom: '25px', color: '#333' }}>📊 Pattern Recognition</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(250px, 1fr))', gap: '25px' }}>
                    
                    {/* Time Patterns */}
                    <div>
                      <h5 style={{ color: '#4caf50', marginBottom: '15px' }}>⏰ Optimal Practice Times</h5>
                      {(() => {
                        const timePatterns: {[key: string]: {count: number, avgRating: number}} = {};
                        practiceData.forEach(session => {
                          const hour = new Date(session.date).getHours();
                          const timeOfDay = hour < 6 ? 'Late Night' :
                                          hour < 12 ? 'Morning' :
                                          hour < 17 ? 'Afternoon' :
                                          hour < 21 ? 'Evening' : 'Night';
                          
                          if (!timePatterns[timeOfDay]) {
                            timePatterns[timeOfDay] = {count: 0, avgRating: 0};
                          }
                          timePatterns[timeOfDay].count++;
                          timePatterns[timeOfDay].avgRating = 
                            (timePatterns[timeOfDay].avgRating * (timePatterns[timeOfDay].count - 1) + (session.rating || 0)) / timePatterns[timeOfDay].count;
                        });
                        
                        return Object.entries(timePatterns)
                          .sort(([,a]: [string, any], [,b]: [string, any]) => b.avgRating - a.avgRating)
                          .slice(0, 3)
                          .map(([time, data], index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              borderBottom: index < 2 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <span>{time}</span>
                              <span style={{ fontWeight: '600', color: '#4caf50' }}>
                                {Math.round(data.avgRating * 10) / 10}/10
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                    
                    {/* Duration Patterns */}
                    <div>
                      <h5 style={{ color: '#2196f3', marginBottom: '15px' }}>⏱️ Duration Sweet Spots</h5>
                      {(() => {
                        const durationGroups: {[key: string]: {count: number, avgRating: number}} = {};
                        practiceData.forEach(session => {
                          const duration = session.duration;
                          const group = duration < 15 ? 'Short (< 15min)' :
                                       duration < 25 ? 'Medium (15-25min)' :
                                       duration < 35 ? 'Long (25-35min)' : 'Extended (35min+)';
                          
                          if (!durationGroups[group]) {
                            durationGroups[group] = {count: 0, avgRating: 0};
                          }
                          durationGroups[group].count++;
                          durationGroups[group].avgRating = 
                            (durationGroups[group].avgRating * (durationGroups[group].count - 1) + (session.rating || 0)) / durationGroups[group].count;
                        });
                        
                        return Object.entries(durationGroups)
                          .sort(([,a]: [string, any], [,b]: [string, any]) => b.avgRating - a.avgRating)
                          .map(([group, data], index) => (
                            <div key={index} style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              padding: '8px 0',
                              borderBottom: index < Object.keys(durationGroups).length - 1 ? '1px solid #f0f0f0' : 'none'
                            }}>
                              <span>{group}</span>
                              <span style={{ fontWeight: '600', color: '#2196f3' }}>
                                {Math.round(data.avgRating * 10) / 10}/10
                              </span>
                            </div>
                          ));
                      })()}
                    </div>
                    
                    {/* Emotional Trends */}
                    <div>
                      <h5 style={{ color: '#ff9800', marginBottom: '15px' }}>😊 Emotional Trends</h5>
                      <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6' }}>
                        {emotionalNotes.length > 0 ? (
                          <>
                            <div style={{ marginBottom: '8px' }}>
                              Most frequent emotion: <strong style={{ color: '#ff9800' }}>
                                {getEmotionDistribution()[0]?.emotion || 'Balanced'}
                              </strong>
                            </div>
                            <div style={{ marginBottom: '8px' }}>
                              Average energy: <strong style={{ color: '#ff9800' }}>
                                {Math.round(emotionalNotes.reduce((sum, note) => sum + (note.energyLevel || 7), 0) / emotionalNotes.length)}/10
                              </strong>
                            </div>
                            <div>
                              Gratitude entries: <strong style={{ color: '#ff9800' }}>
                                {emotionalNotes.filter(note => note.gratitude && note.gratitude.length > 0).length}
                              </strong>
                            </div>
                          </>
                        ) : (
                          <div style={{ color: '#999' }}>Start tracking emotions to see trends</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Recommendations */}
                <div style={{ 
                  background: 'white',
                  padding: '30px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <h4 style={{ fontSize: '1.3rem', marginBottom: '25px', color: '#333' }}>🎯 Personalized Recommendations</h4>
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {[
                      {
                        icon: '📈',
                        title: 'Practice Consistency',
                        recommendation: (contextAnalytics?.currentStreak || appUsage.currentStreak) >= 7 
                          ? `Excellent streak! Maintain your ${contextAnalytics?.currentStreak || appUsage.currentStreak}-day momentum by setting consistent daily reminders.`
                          : `Build consistency by starting with shorter 10-15 minute sessions daily. Current streak: ${contextAnalytics?.currentStreak || appUsage.currentStreak} days.`,
                        color: '#4caf50'
                      },
                      {
                        icon: '🧠',
                        title: 'Attention Training',
                        recommendation: (currentPahmInsights?.averagePresent || 0) >= 80
                          ? `Outstanding present attention (${currentPahmInsights?.averagePresent}%)! Consider advancing to Stage 4+ techniques.`
                          : `Present attention at ${currentPahmInsights?.averagePresent || 50}%. Focus on mindfulness of breathing and noting techniques.`,
                        color: '#2196f3'
                      },
                      {
                        icon: '⏰',
                        title: 'Session Duration',
                        recommendation: (contextAnalytics?.averageSessionLength || appUsage.averageSessionLength) >= 25
                          ? `Great session length (${contextAnalytics?.averageSessionLength || appUsage.averageSessionLength}min avg). You can explore deeper states and walking meditation.`
                          : `Gradually increase from ${contextAnalytics?.averageSessionLength || appUsage.averageSessionLength}min to 20-25min sessions for deeper benefits.`,
                        color: '#ff9800'
                      },
                      {
                        icon: '🕐',
                        title: 'Mind Recovery Integration',
                        recommendation: currentMindRecoveryAnalytics
                          ? `You've completed ${currentMindRecoveryAnalytics.totalMindRecoverySessions} Mind Recovery sessions. Continue applying PAHM technique in daily contexts.`
                          : 'Start using PAHM technique in daily situations for comprehensive mindfulness integration.',
                        color: '#fa709a'
                      },
                      {
                        icon: '🌿',
                        title: 'Environment Optimization',
                        recommendation: currentEnvironmentAnalysis
                          ? `Your best environment: ${currentEnvironmentAnalysis.location.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name} location with ${currentEnvironmentAnalysis.lighting.sort((a: EnvironmentAnalysisItem, b: EnvironmentAnalysisItem) => b.avgRating - a.avgRating)[0]?.name} lighting.`
                          : 'Track environmental factors to optimize your practice space and conditions.',
                        color: '#9c27b0'
                      },
                      {
                        icon: '💝',
                        title: 'Emotional Integration',
                        recommendation: emotionalNotes.length >= 5
                          ? `Great emotional awareness! Your notes show growth in ${getEmotionDistribution()[0]?.emotion?.toLowerCase()} states.`
                          : 'Add daily emotional reflections to track how meditation affects your mental states.',
                        color: '#e91e63'
                      }
                    ].map((rec, index) => (
                      <div key={index} style={{ 
                        display: 'flex',
                        gap: '20px',
                        padding: '20px',
                        background: `${rec.color}15`,
                        borderRadius: '12px',
                        border: `1px solid ${rec.color}30`
                      }}>
                        <div style={{ 
                          fontSize: '2rem',
                          minWidth: '50px',
                          textAlign: 'center'
                        }}>
                          {rec.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h5 style={{ 
                            color: rec.color,
                            fontWeight: '600',
                            marginBottom: '8px'
                          }}>
                            {rec.title}
                          </h5>
                          <p style={{ 
                            color: '#555',
                            lineHeight: '1.6',
                            margin: 0
                          }}>
                            {rec.recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Next Steps */}
                <div style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  padding: '30px',
                  borderRadius: '20px',
                  boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)'
                }}>
                  <h4 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>🚀 Next Steps in Your Journey</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(250px, 1fr))', gap: '20px' }}>
                    {[
                      {
                        step: 'This Week',
                        goal: (contextAnalytics?.currentStreak || appUsage.currentStreak) < 7 
                          ? 'Build a 7-day practice streak'
                          : 'Maintain consistency and deepen awareness',
                        action: (contextAnalytics?.currentStreak || appUsage.currentStreak) < 7
                          ? 'Practice for just 10 minutes each day'
                          : 'Explore subtle breath sensations'
                      },
                      {
                        step: 'This Month',
                        goal: (contextAnalytics?.averageSessionLength || appUsage.averageSessionLength) < 20
                          ? 'Increase average session to 20+ minutes'
                          : 'Integrate Mind Recovery practice',
                        action: (contextAnalytics?.averageSessionLength || appUsage.averageSessionLength) < 20
                          ? 'Add 2-3 minutes to each session'
                          : 'Use PAHM in daily contexts'
                      },
                      {
                        step: 'Long Term',
                        goal: 'Develop effortless attention and unified mindfulness',
                        action: 'Continue with patience, joy, and integrated practice'
                      }
                    ].map((item, index) => (
                      <div key={index} style={{ 
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '20px',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}>
                        <h5 style={{ marginBottom: '10px', fontSize: '1.1rem' }}>{item.step}</h5>
                        <div style={{ marginBottom: '10px', opacity: 0.9 }}>{item.goal}</div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.8, fontStyle: 'italic' }}>
                          {item.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px',
                background: 'linear-gradient(135deg, #f8fafe 0%, #ffffff 100%)',
                borderRadius: '16px',
                border: '2px solid #e3f2fd'
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '20px' }}>💡</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: '#333' }}>
                  No Practice Data for Insights
                </h3>
                <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '25px' }}>
                  Complete meditation and Mind Recovery sessions to unlock personalized insights.
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
                  💡 Get Sample Insights
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minMax(300px, 1fr))', 
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
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#333' }}>📊 Session Statistics</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Total Sessions:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#4facfe'
                    }}>
                      {contextAnalytics?.totalSessions || appUsage.totalSessions}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Meditation Sessions:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#667eea'
                    }}>
                      {contextAnalytics?.totalMeditationSessions || practiceData.filter(s => !s.stageLevel.includes('Mind Recovery')).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Mind Recovery Sessions:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#fa709a'
                    }}>
                      {contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Average Session Length:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#4facfe'
                    }}>
                      {contextAnalytics?.averageSessionLength || appUsage.averageSessionLength} min
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Total Practice Time:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#4facfe'
                    }}>
                      {Math.round((contextAnalytics?.totalPracticeTime || appUsage.totalPracticeTime) / 60 * 10) / 10} hours
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Average Quality:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: (contextAnalytics?.averageQuality || appUsage.averageQuality || 0) >= 8 ? '#4caf50' : 
                             (contextAnalytics?.averageQuality || appUsage.averageQuality || 0) >= 6 ? '#ff9800' : '#f44336'
                    }}>
                      {contextAnalytics?.averageQuality || appUsage.averageQuality || 0}/10
                    </span>
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'white',
                padding: '25px',
                borderRadius: '16px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#333' }}>🔥 Streak Information</h3>
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Current Streak:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#ff9800'
                    }}>
                      {contextAnalytics?.currentStreak || appUsage.currentStreak} days
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Longest Streak:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#ff9800'
                    }}>
                      {contextAnalytics?.longestStreak || appUsage.longestStreak} days
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Last Login:</span>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '1.2rem',
                      color: '#4facfe'
                    }}>
                      {formatDate(appUsage.lastLogin)}
                    </span>
                  </div>
                </div>
              </div>
              
              {currentPahmInsights && (
                <div style={{ 
                  background: 'white',
                  padding: '25px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#333' }}>🧠 PAHM Metrics</h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Overall Present Attention:</span>
                      <span style={{ 
                        fontWeight: '700', 
                        fontSize: '1.2rem',
                        color: currentPahmInsights.averagePresent >= 80 ? '#4caf50' : 
                               currentPahmInsights.averagePresent >= 60 ? '#ff9800' : '#f44336'
                      }}>
                        {currentPahmInsights.averagePresent}%
                      </span>
                    </div>
                    {currentPahmInsights.meditationPAHM && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#666' }}>Meditation Present:</span>
                        <span style={{ 
                          fontWeight: '700', 
                          fontSize: '1.2rem',
                          color: '#667eea'
                        }}>
                          {currentPahmInsights.meditationPAHM.avgPresent}%
                        </span>
                      </div>
                    )}
                    {currentPahmInsights.mindRecoveryPAHM && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#666' }}>Mind Recovery Present:</span>
                        <span style={{ 
                          fontWeight: '700', 
                          fontSize: '1.2rem',
                          color: '#fa709a'
                        }}>
                          {currentPahmInsights.mindRecoveryPAHM.avgPresent}%
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Ideal States (Present+Happy):</span>
                      <span style={{ 
                        fontWeight: '700', 
                        fontSize: '1.2rem',
                        color: '#4caf50'
                      }}>
                        {currentPahmInsights.pahmDistribution?.present_happy || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {currentMindRecoveryAnalytics && (
                <div style={{ 
                  background: 'white',
                  padding: '25px',
                  borderRadius: '16px',
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#333' }}>🕐 Mind Recovery Stats</h3>
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Most Used Context:</span>
                      <span style={{ 
                        fontWeight: '700', 
                        fontSize: '1rem',
                        color: '#fa709a'
                      }}>
                        {currentMindRecoveryAnalytics.mostUsedContext?.name || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Highest Rated Context:</span>
                      <span style={{ 
                        fontWeight: '700', 
                        fontSize: '1rem',
                        color: '#ff9800'
                      }}>
                        {currentMindRecoveryAnalytics.highestRatedContext?.name || 'N/A'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Avg Recovery Rating:</span>
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minMax(200px, 1fr))', gap: '20px' }}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea', marginBottom: '5px' }}>
                    {contextAnalytics?.totalMeditationSessions || practiceData.filter(s => !s.stageLevel.includes('Mind Recovery')).length}
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
                    {contextAnalytics?.totalMindRecoverySessions || practiceData.filter(s => s.stageLevel.includes('Mind Recovery')).length}
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
                    {contextAnalytics?.emotionalNotesCount || emotionalNotes.length}
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
              {currentMindRecoveryAnalytics && (currentMindRecoveryAnalytics.contextStats || currentMindRecoveryAnalytics.exerciseStats) && (
                <div style={{ marginTop: '30px' }}>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#333' }}>🕐 Mind Recovery Distribution</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minMax(150px, 1fr))', 
                    gap: '10px' 
                  }}>
                    {(currentMindRecoveryAnalytics.contextStats || currentMindRecoveryAnalytics.exerciseStats || []).map((item: any, index: number) => (
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
    </div>
  );
};

export default AnalyticsBoard;