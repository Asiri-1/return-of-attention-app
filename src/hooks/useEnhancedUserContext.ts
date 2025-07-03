// ============================================================================
// src/hooks/useEnhancedUserContext.ts
// React hook for accessing comprehensive user context
// ============================================================================

import { useMemo } from 'react';
import { useAuth } from '../AuthContext';
import { useLocalData } from '../contexts/LocalDataContext';
import { UserContextBuilder } from '../services/ComprehensiveUserContext';
import { ComprehensiveUserContext } from '../services/AdaptiveWisdomEngine';

/**
 * Enhanced user context hook that provides comprehensive user data
 * for the AdaptiveWisdomEngine instead of basic hardcoded values
 */
export const useEnhancedUserContext = (): ComprehensiveUserContext => {
  const { currentUser } = useAuth();
  const {
    getAnalyticsData,
    getPAHMData,
    getEnvironmentData,
    getDailyEmotionalNotes,
    getMindRecoveryAnalytics
    // Note: Add getSelfAssessmentData and getQuestionnaireData to your LocalDataContext
    // when you have those data sources ready
  } = useLocalData();

  // Memoize the context building to avoid unnecessary recalculations
  const comprehensiveContext = useMemo(() => {
    return UserContextBuilder.buildComprehensiveContext(
      currentUser,
      getAnalyticsData,
      getPAHMData,
      getEnvironmentData,
      getDailyEmotionalNotes,
      getMindRecoveryAnalytics,
      undefined, // getSelfAssessmentData - add when available
      undefined  // getQuestionnaireData - add when available
    );
  }, [
    currentUser,
    getAnalyticsData,
    getPAHMData,
    getEnvironmentData,
    getDailyEmotionalNotes,
    getMindRecoveryAnalytics
  ]);

  return comprehensiveContext;
};

/**
 * Hook for debugging the enhanced user context
 * Use this in development to see what data your AI is receiving
 */
export const useEnhancedUserContextDebug = () => {
  const context = useEnhancedUserContext();
  
  // Debug the context (only in development)
  if (process.env.NODE_ENV === 'development') {
    UserContextBuilder.debugContext(context);
  }
  
  return {
    context,
    personalizationScore: UserContextBuilder.getPersonalizationScore(context),
    dataRichness: {
      hasQuestionnaire: !!context.questionnaireAnswers,
      hasSelfAssessment: !!context.selfAssessmentResults,
      hasPAHMData: (context.practiceAnalytics?.pahmData?.totalObservations || 0) > 0,
      hasEmotionalNotes: (context.practiceAnalytics?.emotionalNotes?.length || 0) > 0,
      hasMindRecovery: (context.practiceAnalytics?.mindRecoveryAnalytics?.totalSessions || 0) > 0,
      hasEnvironmentData: (context.practiceAnalytics?.environmentData?.avgRating || 0) > 0
    }
  };
};

/**
 * Lightweight hook that returns just the basic context info
 * Use this for components that only need basic user info
 */
export const useBasicUserContext = () => {
  const { currentUser } = useAuth();
  
  return {
    uid: currentUser?.uid || '',
    currentStage: Number(currentUser?.currentStage) || 1,
    goals: currentUser?.goals || []
  };
};

/**
 * Hook that provides AI-ready context with loading states
 * Use this in components that need to show loading while data is being prepared
 */
export const useAIReadyContext = () => {
  const { currentUser } = useAuth();
  const { isLoading } = useLocalData();
  const context = useEnhancedUserContext();
  
  const isContextReady = !!currentUser && !isLoading;
  const personalizationScore = UserContextBuilder.getPersonalizationScore(context);
  
  return {
    context,
    isLoading: !isContextReady,
    isReady: isContextReady,
    personalizationScore,
    quality: personalizationScore >= 80 ? 'excellent' : 
             personalizationScore >= 60 ? 'good' : 
             personalizationScore >= 40 ? 'basic' : 'minimal'
  };
};

/**
 * Hook for real-time user state (mood, challenges, etc.)
 * Use this for components that need to display current user state
 */
export const useRealTimeUserState = () => {
  const context = useEnhancedUserContext();
  
  return {
    currentMood: context.currentMood || 6,
    currentEnergy: context.currentMood || 6, // Using mood as energy if not separate
    recentChallenges: context.recentChallenges || [],
    timeOfDay: context.timeOfDay || 'unknown',
    practiceStreak: context.enhancedProfile?.currentProgress?.currentStreak || 0,
    totalSessions: context.enhancedProfile?.currentProgress?.totalSessions || 0,
    averageQuality: context.enhancedProfile?.currentProgress?.averageQuality || 0,
    presentMastery: context.practiceAnalytics?.pahmData?.presentNeutralMastery || 0,
    environmentRating: context.practiceAnalytics?.environmentData?.avgRating || 0
  };
};

/**
 * Hook for practice analytics data
 * Use this in analytics/progress components
 */
export const usePracticeAnalytics = () => {
  const context = useEnhancedUserContext();
  
  return {
    pahmData: context.practiceAnalytics?.pahmData || null,
    environmentData: context.practiceAnalytics?.environmentData || null,
    mindRecoveryData: context.practiceAnalytics?.mindRecoveryAnalytics || null,
    emotionalNotes: context.practiceAnalytics?.emotionalNotes || [],
    progress: context.enhancedProfile?.currentProgress || null,
    preferences: context.enhancedProfile?.preferences || null
  };
};

/**
 * Hook for getting AI response quality metrics
 * Use this to show users how personalized their AI responses are
 */
export const useAIPersonalizationMetrics = () => {
  const context = useEnhancedUserContext();
  const score = UserContextBuilder.getPersonalizationScore(context);
  
  return {
    score,
    level: score >= 80 ? 'Highly Personalized' : 
           score >= 60 ? 'Well Personalized' : 
           score >= 40 ? 'Moderately Personalized' : 
           'Basic Personalization',
    dataStatus: {
      hasPracticeData: (context.enhancedProfile?.currentProgress?.totalSessions || 0) > 0,
      hasPAHMData: (context.practiceAnalytics?.pahmData?.totalObservations || 0) > 0,
      hasEmotionalData: (context.practiceAnalytics?.emotionalNotes?.length || 0) > 0,
      hasEnvironmentData: (context.practiceAnalytics?.environmentData?.avgRating || 0) > 0,
      hasProfileData: !!context.questionnaireAnswers || !!context.selfAssessmentResults
    },
    suggestions: score < 60 ? [
      'Complete more practice sessions to improve personalization',
      'Add emotional notes after sessions for better mood analysis',
      'Use PAHM tracking during meditation for deeper insights'
    ] : []
  };
};

/**
 * Hook for session recommendations based on user context
 * Use this to suggest optimal practice times/types
 */
export const useSessionRecommendations = () => {
  const context = useEnhancedUserContext();
  const currentHour = new Date().getHours();
  
  const recommendations = {
    optimalDuration: context.enhancedProfile?.preferences?.defaultSessionDuration || 20,
    currentTimeOptimal: false,
    suggestedType: 'meditation' as 'meditation' | 'mind_recovery',
    reasoning: [] as string[]
  };

  // Analyze if current time is optimal
  const preferredTime = context.enhancedProfile?.preferences?.optimalPracticeTime || 'morning';
  if (
    (preferredTime === 'morning' && currentHour >= 6 && currentHour <= 10) ||
    (preferredTime === 'afternoon' && currentHour >= 12 && currentHour <= 17) ||
    (preferredTime === 'evening' && currentHour >= 17 && currentHour <= 21)
  ) {
    recommendations.currentTimeOptimal = true;
    recommendations.reasoning.push(`Current time aligns with your optimal ${preferredTime} practice`);
  }

  // Suggest session type based on challenges
  if (context.recentChallenges?.includes('stress') || context.recentChallenges?.includes('emotional-regulation')) {
    recommendations.suggestedType = 'mind_recovery';
    recommendations.reasoning.push('Mind recovery recommended for current stress patterns');
  }

  // Adjust duration based on current streak
  const streak = context.enhancedProfile?.currentProgress?.currentStreak || 0;
  if (streak === 0) {
    recommendations.optimalDuration = Math.min(recommendations.optimalDuration, 10);
    recommendations.reasoning.push('Shorter session recommended to rebuild practice habit');
} else if (streak > 30) {
  recommendations.optimalDuration = Math.min(recommendations.optimalDuration + 10, 45);
  recommendations.reasoning.push('Extended session available due to strong practice consistency');
}
  return recommendations;
};

/**
 * Hook for tracking context changes and triggering updates
 * Use this to react to significant changes in user data
 */
export const useContextChangeTracking = () => {
  const context = useEnhancedUserContext();
  
  const significantChanges = {
    newStreak: false,
    moodShift: false,
    newChallenge: false,
    milestoneReached: false
  };

  // This would typically track changes over time
  // For now, it provides the current state
  const currentStreak = context.enhancedProfile?.currentProgress?.currentStreak || 0;
  const currentMood = context.currentMood || 6;
  const totalSessions = context.enhancedProfile?.currentProgress?.totalSessions || 0;

  // Check for milestones
  if ([10, 25, 50, 100, 200].includes(totalSessions)) {
    significantChanges.milestoneReached = true;
  }

  return {
    changes: significantChanges,
    currentMetrics: {
      streak: currentStreak,
      mood: currentMood,
      totalSessions,
      personalizationScore: UserContextBuilder.getPersonalizationScore(context)
    }
  };
};