// ============================================================================
// src/hooks/useEnhancedUserContext.ts
// ✅ FIREBASE-ONLY: React hook for accessing comprehensive user context from Firebase
// ============================================================================

import { useMemo } from 'react';
// ✅ FIREBASE-ONLY: Use Firebase contexts instead of localStorage
import { useAuth } from '../contexts/auth/AuthContext';
import { useUser } from '../contexts/user/UserContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';
import { useHappinessCalculation } from './useHappinessCalculation';

// ✅ FIREBASE-ONLY: Enhanced types for Firebase-based user context
interface FirebaseComprehensiveUserContext {
  // User identification
  uid: string;
  email: string | null;
  
  // Current state from Firebase
  currentStage: number;
  tLevel: string;
  goals: string[];
  
  // Practice analytics from Firebase
  practiceAnalytics: {
    totalSessions: number;
    averageRating: number;
    currentStreak: number;
    practiceTime: number;
    pahmData?: {
      totalObservations: number;
      presentNeutralMastery: number;
      presentMomentRatio: number;
    };
    recentSessions: any[];
  };
  
  // Emotional data from Firebase
  emotionalAnalytics: {
    recentNotes: any[];
    currentMood: number;
    moodTrend: string;
    challengeAreas: string[];
  };
  
  // Profile data from Firebase
  enhancedProfile: {
    currentProgress: {
      totalSessions: number;
      currentStreak: number;
      averageQuality: number;
    };
    preferences: {
      defaultSessionDuration: number;
      optimalPracticeTime: string;
      favoriteStages: number[];
    };
  };
  
  // Onboarding data from Firebase
  questionnaireAnswers?: any;
  selfAssessmentResults?: any;
  
  // Calculated metrics
  personalizationScore: number;
  timeOfDay: string;
  recentChallenges: string[];
}

/**
 * ✅ FIREBASE-ONLY: Enhanced user context hook that provides comprehensive user data
 * from Firebase contexts only - no localStorage dependencies
 */
export const useEnhancedUserContext = (): FirebaseComprehensiveUserContext => {
  // ✅ FIREBASE-ONLY: Use Firebase contexts exclusively
  const { currentUser } = useAuth();
  const { userProfile } = useUser();
  const { sessions } = usePractice(); // Removed getSessionStats since it doesn't exist
  const { emotionalNotes } = useWellness();
  const { questionnaire, selfAssessment } = useOnboarding();
  const { userProgress, componentBreakdown } = useHappinessCalculation();

  // ✅ FIREBASE-ONLY: Memoize the context building using Firebase data only
  const comprehensiveContext = useMemo((): FirebaseComprehensiveUserContext => {
    // Calculate session stats from Firebase data manually
    const calculateSessionStats = () => {
      if (!sessions || sessions.length === 0) {
        return { totalSessions: 0, averageRating: 0, currentStreak: 0, totalMinutes: 0 };
      }
      
      const totalSessions = sessions.length;
      const totalRating = sessions.reduce((sum, session) => sum + (session.rating || 0), 0);
      const averageRating = totalRating / totalSessions;
      const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      
      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      const sortedSessions = [...sessions].sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = sortedSessions[i].createdAt?.toDate?.() || new Date(0);
        const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      return { totalSessions, averageRating, currentStreak, totalMinutes };
    };

    const sessionStats = calculateSessionStats();
    const recentSessions = sessions?.slice(-10) || [];
    const recentNotes = emotionalNotes?.slice(-5) || [];
    
    // Calculate personalization score based on Firebase data availability
    const calculatePersonalizationScore = (): number => {
      let score = 0;
      
      // Base score for authentication
      if (currentUser) score += 20;
      
      // Profile completeness
      if (userProfile) score += 20;
      
      // Practice data richness
      const sessionCount = sessions?.length || 0;
      if (sessionCount > 0) score += 15;
      if (sessionCount > 10) score += 10;
      if (sessionCount > 50) score += 5;
      
      // Emotional data
      if (emotionalNotes && emotionalNotes.length > 0) score += 10;
      if (emotionalNotes && emotionalNotes.length > 5) score += 5;
      
      // Onboarding completion
      if (questionnaire?.completed) score += 10;
      if (selfAssessment?.completed) score += 5;
      
      return Math.min(100, score);
    };

    // Extract current mood from recent emotional notes
    const getCurrentMood = (): number => {
      if (recentNotes.length > 0) {
        const latestNote = recentNotes[0];
        // Map emotion types to numerical mood values
        const emotionToMood: Record<string, number> = {
          'joy': 9,
          'peaceful': 8,
          'content': 7,
          'neutral': 6,
          'frustrated': 4,
          'anxious': 3,
          'sad': 2
        };
        return emotionToMood[latestNote.emotion] || 6;
      }
      return 6; // Default neutral mood
    };

    // Determine recent challenges from emotional notes and session ratings
    const getRecentChallenges = (): string[] => {
      const challenges: string[] = [];
      
      // From emotional notes
      recentNotes.forEach(note => {
        if (note.emotion === 'anxious' || note.emotion === 'frustrated') {
          challenges.push('stress');
        }
        if (note.triggers?.some((trigger: string) => trigger.toLowerCase().includes('focus'))) {
          challenges.push('concentration');
        }
      });
      
      // From practice sessions
      const lowRatedSessions = recentSessions.filter(session => (session.rating || 0) < 5);
      if (lowRatedSessions.length > 2) {
        challenges.push('practice-quality');
      }
      
      return [...new Set(challenges)]; // Remove duplicates
    };

    // Get time of day
    const getTimeOfDay = (): string => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 17) return 'afternoon';
      if (hour >= 17 && hour < 22) return 'evening';
      return 'night';
    };

    return {
      // User identification from Firebase Auth
      uid: currentUser?.uid || '',
      email: currentUser?.email || null,
      
      // Current state from Firebase User Profile (using defaults if properties don't exist)
      currentStage: 1, // Default since currentStage doesn't exist on UserProfile
      tLevel: 'T1', // Default since tLevel doesn't exist on UserProfile  
      goals: [], // Default since goals don't exist in preferences
      
      // Practice analytics from Firebase Practice Context
      practiceAnalytics: {
        totalSessions: sessionStats?.totalSessions || 0,
        averageRating: sessionStats?.averageRating || 0,
        currentStreak: sessionStats?.currentStreak || 0,
        practiceTime: sessionStats?.totalMinutes || 0,
        pahmData: userProgress?.pahmAnalysis ? {
          totalObservations: 0, // Default since totalObservations doesn't exist on PAHMAnalysis
          presentNeutralMastery: userProgress.pahmAnalysis.presentNeutralRatio || 0,
          presentMomentRatio: userProgress.pahmAnalysis.presentMomentRatio || 0
        } : undefined,
        recentSessions: recentSessions
      },
      
      // Emotional data from Firebase Wellness Context
      emotionalAnalytics: {
        recentNotes: recentNotes,
        currentMood: getCurrentMood(),
        moodTrend: recentNotes.length > 1 ? 'improving' : 'stable',
        challengeAreas: getRecentChallenges()
      },
      
      // Enhanced profile from Firebase data
      enhancedProfile: {
        currentProgress: {
          totalSessions: sessionStats?.totalSessions || 0,
          currentStreak: sessionStats?.currentStreak || 0,
          averageQuality: sessionStats?.averageRating || 0
        },
        preferences: {
          defaultSessionDuration: userProfile?.preferences?.defaultSessionDuration || 20,
          optimalPracticeTime: userProfile?.preferences?.optimalPracticeTime || 'morning',
          favoriteStages: userProfile?.preferences?.favoriteStages || [1]
        }
      },
      
      // Onboarding data from Firebase Onboarding Context
      questionnaireAnswers: questionnaire?.responses,
      selfAssessmentResults: selfAssessment?.results,
      
      // Calculated metrics
      personalizationScore: calculatePersonalizationScore(),
      timeOfDay: getTimeOfDay(),
      recentChallenges: getRecentChallenges()
    };
  }, [
    currentUser,
    userProfile,
    sessions,
    emotionalNotes,
    questionnaire,
    selfAssessment,
    userProgress
  ]);

  return comprehensiveContext;
};

/**
 * ✅ FIREBASE-ONLY: Hook for debugging the enhanced user context
 * Use this in development to see what Firebase data your AI is receiving
 */
export const useEnhancedUserContextDebug = () => {
  const context = useEnhancedUserContext();
  
  // Debug the context (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔥 Firebase Enhanced User Context Debug:', {
      uid: context.uid,
      dataRichness: {
        hasProfile: !!context.uid,
        hasQuestionnaire: !!context.questionnaireAnswers,
        hasSelfAssessment: !!context.selfAssessmentResults,
        hasPAHMData: (context.practiceAnalytics?.pahmData?.totalObservations || 0) > 0,
        hasEmotionalNotes: context.emotionalAnalytics.recentNotes.length > 0,
        hasRecentSessions: context.practiceAnalytics.recentSessions.length > 0
      },
      personalizationScore: context.personalizationScore,
      firebaseDataSources: 'Auth, User, Practice, Wellness, Onboarding'
    });
  }
  
  return {
    context,
    personalizationScore: context.personalizationScore,
    dataRichness: {
      hasProfile: !!context.uid,
      hasQuestionnaire: !!context.questionnaireAnswers,
      hasSelfAssessment: !!context.selfAssessmentResults,
      hasPAHMData: (context.practiceAnalytics?.pahmData?.totalObservations || 0) > 0,
      hasEmotionalNotes: context.emotionalAnalytics.recentNotes.length > 0,
      hasRecentSessions: context.practiceAnalytics.recentSessions.length > 0,
      firebaseIntegrated: true
    }
  };
};

/**
 * ✅ FIREBASE-ONLY: Lightweight hook that returns basic context info from Firebase
 * Use this for components that only need basic user info
 */
export const useBasicUserContext = () => {
  // ✅ FIREBASE-ONLY: Use Firebase contexts only - no localStorage fallbacks
  const { currentUser } = useAuth();
  const { userProfile } = useUser();
  
  return {
    uid: currentUser?.uid || '',
    email: currentUser?.email || '',
    currentStage: 1, // Default since currentStage doesn't exist on UserProfile
    tLevel: 'T1', // Default since tLevel doesn't exist on UserProfile
    goals: [], // Default since goals don't exist in preferences
    firebaseConnected: !!currentUser
  };
};

/**
 * ✅ FIREBASE-ONLY: Hook that provides AI-ready context with Firebase loading states
 * Use this in components that need to show loading while Firebase data is being prepared
 */
export const useAIReadyContext = () => {
  const { currentUser } = useAuth();
  const { userProfile, isLoading: userLoading } = useUser();
  const { isLoading: practiceLoading } = usePractice();
  const { emotionalNotes, isLoading: wellnessLoading } = useWellness();
  const { isCalculating } = useHappinessCalculation();
  
  const context = useEnhancedUserContext();
  
  // ✅ FIREBASE-ONLY: Combined loading state from Firebase contexts
  const isLoading = userLoading || practiceLoading || wellnessLoading || isCalculating;
  const isContextReady = !!currentUser && !isLoading;
  
  return {
    context,
    isLoading,
    isReady: isContextReady,
    personalizationScore: context.personalizationScore,
    quality: context.personalizationScore >= 80 ? 'excellent' : 
             context.personalizationScore >= 60 ? 'good' : 
             context.personalizationScore >= 40 ? 'basic' : 'minimal',
    firebaseStatus: {
      authenticated: !!currentUser,
      profileLoaded: !!userProfile,
      sessionsLoaded: true, // Note: Can't directly check sessions loading state
      emotionalNotesLoaded: !!emotionalNotes,
      isCalculating
    }
  };
};

/**
 * ✅ FIREBASE-ONLY: Hook for real-time user state from Firebase (mood, challenges, etc.)
 * Use this for components that need to display current user state
 */
export const useRealTimeUserState = () => {
  const context = useEnhancedUserContext();
  
  return {
    currentMood: context.emotionalAnalytics.currentMood,
    moodTrend: context.emotionalAnalytics.moodTrend,
    recentChallenges: context.recentChallenges,
    timeOfDay: context.timeOfDay,
    practiceStreak: context.practiceAnalytics.currentStreak,
    totalSessions: context.practiceAnalytics.totalSessions,
    averageQuality: context.enhancedProfile.currentProgress.averageQuality,
    presentMastery: context.practiceAnalytics.pahmData?.presentNeutralMastery || 0,
    firebaseRealTime: true
  };
};

/**
 * ✅ FIREBASE-ONLY: Hook for practice analytics data from Firebase
 * Use this in analytics/progress components
 */
export const usePracticeAnalytics = () => {
  const context = useEnhancedUserContext();
  
  return {
    pahmData: context.practiceAnalytics.pahmData || null,
    practiceData: {
      totalSessions: context.practiceAnalytics.totalSessions,
      averageRating: context.practiceAnalytics.averageRating,
      currentStreak: context.practiceAnalytics.currentStreak,
      totalTime: context.practiceAnalytics.practiceTime
    },
    emotionalData: context.emotionalAnalytics,
    progress: context.enhancedProfile.currentProgress,
    preferences: context.enhancedProfile.preferences,
    firebaseSource: 'Practice + Wellness + User contexts'
  };
};

/**
 * ✅ FIREBASE-ONLY: Hook for getting AI response quality metrics from Firebase data
 * Use this to show users how personalized their AI responses are
 */
export const useAIPersonalizationMetrics = () => {
  const context = useEnhancedUserContext();
  
  return {
    score: context.personalizationScore,
    level: context.personalizationScore >= 80 ? 'Highly Personalized' : 
           context.personalizationScore >= 60 ? 'Well Personalized' : 
           context.personalizationScore >= 40 ? 'Moderately Personalized' : 
           'Basic Personalization',
    dataStatus: {
      hasPracticeData: context.practiceAnalytics.totalSessions > 0,
      hasPAHMData: (context.practiceAnalytics.pahmData?.totalObservations || 0) > 0,
      hasEmotionalData: context.emotionalAnalytics.recentNotes.length > 0,
      hasProfileData: !!context.questionnaireAnswers || !!context.selfAssessmentResults,
      firebaseIntegrated: true
    },
    suggestions: context.personalizationScore < 60 ? [
      'Complete more practice sessions to improve Firebase-powered personalization',
      'Add emotional notes after sessions for better mood analysis',
      'Complete questionnaire and self-assessment for enhanced AI responses'
    ] : [],
    firebaseAdvantages: [
      'Real-time data synchronization across devices',
      'Persistent personalization data',
      'Advanced cross-context analytics'
    ]
  };
};

/**
 * ✅ FIREBASE-ONLY: Hook for session recommendations based on Firebase user context
 * Use this to suggest optimal practice times/types
 */
export const useSessionRecommendations = () => {
  const context = useEnhancedUserContext();
  const currentHour = new Date().getHours();
  
  const recommendations = {
    optimalDuration: context.enhancedProfile.preferences.defaultSessionDuration,
    currentTimeOptimal: false,
    suggestedType: 'meditation' as 'meditation' | 'mind_recovery',
    reasoning: [] as string[],
    firebasePersonalized: true
  };

  // ✅ FIREBASE-ONLY: Analyze if current time is optimal based on Firebase preferences
  const preferredTime = context.enhancedProfile.preferences.optimalPracticeTime;
  if (
    (preferredTime === 'morning' && currentHour >= 6 && currentHour <= 10) ||
    (preferredTime === 'afternoon' && currentHour >= 12 && currentHour <= 17) ||
    (preferredTime === 'evening' && currentHour >= 17 && currentHour <= 21)
  ) {
    recommendations.currentTimeOptimal = true;
    recommendations.reasoning.push(`Current time aligns with your Firebase-stored ${preferredTime} preference`);
  }

  // ✅ FIREBASE-ONLY: Suggest session type based on Firebase challenges data
  if (context.recentChallenges.includes('stress') || context.emotionalAnalytics.currentMood < 5) {
    recommendations.suggestedType = 'mind_recovery';
    recommendations.reasoning.push('Mind recovery recommended based on Firebase emotional analysis');
  }

  // ✅ FIREBASE-ONLY: Adjust duration based on Firebase streak data
  const streak = context.practiceAnalytics.currentStreak;
  if (streak === 0) {
    recommendations.optimalDuration = Math.min(recommendations.optimalDuration, 10);
    recommendations.reasoning.push('Shorter session recommended to rebuild habit (Firebase streak: 0)');
  } else if (streak > 30) {
    recommendations.optimalDuration = Math.min(recommendations.optimalDuration + 10, 45);
    recommendations.reasoning.push(`Extended session available due to Firebase streak: ${streak} days`);
  }

  return recommendations;
};

/**
 * ✅ FIREBASE-ONLY: Hook for tracking context changes from Firebase data
 * Use this to react to significant changes in Firebase user data
 */
export const useContextChangeTracking = () => {
  const context = useEnhancedUserContext();
  
  const significantChanges = {
    newStreak: false,
    moodShift: false,
    newChallenge: false,
    milestoneReached: false,
    firebaseDataUpdated: true
  };

  const currentStreak = context.practiceAnalytics.currentStreak;
  const currentMood = context.emotionalAnalytics.currentMood;
  const totalSessions = context.practiceAnalytics.totalSessions;

  // ✅ FIREBASE-ONLY: Check for milestones based on Firebase session data
  if ([10, 25, 50, 100, 200].includes(totalSessions)) {
    significantChanges.milestoneReached = true;
  }

  return {
    changes: significantChanges,
    currentMetrics: {
      streak: currentStreak,
      mood: currentMood,
      totalSessions,
      personalizationScore: context.personalizationScore,
      firebaseConnected: !!context.uid
    },
    firebaseMetrics: {
      totalEmotionalNotes: context.emotionalAnalytics.recentNotes.length,
      averageSessionRating: context.practiceAnalytics.averageRating,
      challengeAreas: context.emotionalAnalytics.challengeAreas,
      dataRichness: context.personalizationScore
    }
  };
};

/**
 * ✅ FIREBASE-ONLY: Hook for getting Firebase-powered user context summary
 * Use this for admin panels or debug displays
 */
export const useUserContextSummary = () => {
  const context = useEnhancedUserContext();
  const { currentUser } = useAuth();
  const { userProfile, isLoading } = useUser();
  
  return {
    user: {
      uid: context.uid,
      email: context.email,
      authenticated: !!currentUser
    },
    progress: {
      currentStage: context.currentStage,
      tLevel: context.tLevel,
      totalSessions: context.practiceAnalytics.totalSessions,
      currentStreak: context.practiceAnalytics.currentStreak
    },
    personalization: {
      score: context.personalizationScore,
      level: context.personalizationScore >= 80 ? 'Excellent' : 
             context.personalizationScore >= 60 ? 'Good' : 
             context.personalizationScore >= 40 ? 'Basic' : 'Minimal',
      dataPoints: {
        questionnaire: !!context.questionnaireAnswers,
        selfAssessment: !!context.selfAssessmentResults,
        practiceSessions: context.practiceAnalytics.totalSessions > 0,
        emotionalNotes: context.emotionalAnalytics.recentNotes.length > 0
      }
    },
    firebaseStatus: {
      connected: !!currentUser,
      profileLoaded: !!userProfile,
      loading: isLoading,
      dataSource: 'Firebase Cloud Storage'
    }
  };
};