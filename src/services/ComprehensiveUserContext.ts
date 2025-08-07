// ============================================================================
// src/services/ComprehensiveUserContext.ts
// ✅ FIREBASE-ONLY: Fixed ComprehensiveUserContext with required Firebase properties
// ============================================================================

import { ComprehensiveUserContext } from './AdaptiveWisdomEngine';

// Fix for the TypeScript error - ensure all required properties are included
export const buildComprehensiveUserContext = (currentUser: any, additionalData: any = {}): ComprehensiveUserContext => {
  // ===== BUILD COMPREHENSIVE CONTEXT =====
  const context: ComprehensiveUserContext = {
    uid: currentUser?.uid || '',
    currentStage: Number(currentUser?.currentStage) || 1,
    goals: currentUser?.goals || [],
    
    // ✅ FIREBASE-ONLY: Required Firebase properties
    firebaseSource: true,
    lastSyncAt: new Date().toISOString(),
    
    // Additional context data
    currentMood: additionalData.currentMood || 6,
    timeOfDay: additionalData.timeOfDay || getCurrentTimeOfDay(),
    recentChallenges: additionalData.recentChallenges || [],
    
    // Optional data with proper typing
    questionnaireAnswers: additionalData.questionnaireAnswers,
    selfAssessmentResults: additionalData.selfAssessmentResults,
    
    enhancedProfile: {
      currentProgress: {
        totalSessions: additionalData.totalSessions || 0,
        currentStreak: additionalData.currentStreak || 0,
        averageQuality: additionalData.averageQuality || 0,
        averagePresentPercentage: additionalData.averagePresentPercentage || 0
      },
      preferences: {
        optimalPracticeTime: additionalData.optimalPracticeTime || 'morning',
        defaultSessionDuration: additionalData.defaultSessionDuration || 20,
        favoriteStages: additionalData.favoriteStages || [1],
        notificationSettings: additionalData.notificationSettings || true
      },
      firebaseUpdatedAt: new Date().toISOString()
    },
    
    practiceAnalytics: additionalData.practiceAnalytics || {
      pahmData: {
        totalObservations: 0,
        presentPercentage: 0,
        pastPercentage: 0,
        futurePercentage: 0,
        attachmentPercentage: 0,
        neutralPercentage: 0,
        aversionPercentage: 0,
        presentNeutralMastery: 0
      },
      environmentData: {
        avgRating: 0,
        posture: 'seated',
        location: 'home',
        lighting: 'natural',
        sounds: 'quiet'
      },
      mindRecoveryAnalytics: {
        totalSessions: 0,
        avgRating: 0,
        contextStats: {},
        integrationLevel: 'beginner'
      },
      emotionalNotes: [],
      firebaseCalculatedAt: new Date().toISOString()
    },
    
    recentSessions: additionalData.recentSessions || []
  };

  return context;
};

// Helper function to get current time of day
const getCurrentTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
};

// Export the type for use in other files
export type { ComprehensiveUserContext } from './AdaptiveWisdomEngine';