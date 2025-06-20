// src/types/userDataTypes.ts
export interface PAHMMatrixCounts {
    present_happy: number;
    present_unhappy: number;
    absent_happy: number;
    absent_unhappy: number;
  }
  
  export interface DetailedSession {
    sessionId: string;
    timestamp: string; // ISO string for local storage
    duration: number;
    presentPercentage: number;
    stage: number;
    stageLabel: string;
    tLevel: string;
    pahmCounts: PAHMMatrixCounts;
    
    // Pre-session state
    preSession: {
      mood: number; // 1-10
      stress: number;
      energy: number;
      motivation: number;
      expectations: string;
    };
    
    // Post-session reflection
    postSession: {
      mood: number;
      stress: number;
      energy: number;
      satisfaction: number;
      difficulty: number;
      insights: string;
      challenges: string;
      breakthroughs: string;
    };
    
    // Environment data
    environment: {
      location: string;
      timeOfDay: string;
      distractions: number; // 1-10
      comfort: number;
      posture: string;
    };
    
    // Calculated metrics
    calculatedMetrics: {
      moodImprovement: number;
      stressReduction: number;
      focusQuality: number;
      consistencyScore: number;
    };
  }
  
  export interface DailyEmotionalNote {
    noteId: string;
    date: string; // YYYY-MM-DD format
    timestamp: string;
    
    // Morning check-in
    morningState: {
      overallMood: number; // 1-10
      energyLevel: number;
      stressLevel: number;
      sleepQuality: number;
      morningThoughts: string;
      wakeupFeeling: string;
    };
    
    // Evening reflection
    eveningReflection: {
      overallDayRating: number;
      gratitudeItems: string[];
      challengesFaced: string[];
      accomplishments: string[];
      emotionalHighlights: string[];
      stressTriggers: string[];
      mindfulMoments: string[];
    };
    
    // Emotional awareness
    emotionalAwareness: {
      emotionsIdentified: {
        emotion: string;
        intensity: number;
        trigger: string;
        response: string;
      }[];
      regulationAttempts: {
        technique: string;
        effectiveness: number;
        context: string;
      }[];
    };
    
    // Daily meditation integration
    meditationIntegration: {
      mindfulMomentsCount: number;
      breathAwarenessLevel: number; // 1-10
      presentMomentAwareness: number;
      nonReactiveResponses: number;
    };
  }
  
  export interface MindRecoverySession {
    recoveryId: string;
    timestamp: string;
    
    // Trigger information
    trigger: {
      type: string; // stress, anxiety, overwhelm, fatigue
      intensity: number; // 1-10
      context: string;
      specificEvent: string;
      symptoms: string[];
    };
    
    // Pre-recovery state
    preRecoveryState: {
      stressLevel: number;
      mentalClarity: number;
      emotionalStability: number;
      energyLevel: number;
      copingCapacity: number;
    };
    
    // Recovery session details
    sessionDetails: {
      duration: number;
      techniquesUsed: {
        technique: string;
        duration: number;
        effectiveness: number;
      }[];
      environment: {
        location: string;
        privacyLevel: number;
        distractions: string[];
      };
    };
    
    // Post-recovery state
    postRecoveryState: {
      stressLevel: number;
      mentalClarity: number;
      emotionalStability: number;
      energyLevel: number;
      copingCapacity: number;
      overallImprovement: number;
    };
    
    // Recovery insights
    insights: {
      whatHelpedMost: string[];
      whatWasChallenging: string[];
      newUnderstandings: string[];
      futurePreventionIdeas: string[];
    };
    
    // Follow-up tracking
    followUp: {
      oneHourLater: { mood: number; stress: number; notes: string };
      threeHoursLater: { mood: number; stress: number; notes: string };
      endOfDay: { mood: number; stress: number; notes: string };
      effectivenessRating: number;
    };
  }
  
  export interface PostPracticeReflection {
    reflectionId: string;
    practiceSessionId: string;
    timestamp: string;
    reflectionTiming: string; // immediately_after, 1_hour_later, evening
    
    // Immediate experience
    immediateExperience: {
      overallSatisfaction: number; // 1-10
      depthOfPractice: number;
      clarityOfMind: number;
      emotionalState: number;
      physicalComfort: number;
      progressSense: number;
    };
    
    // Detailed reflection
    detailedReflection: {
      whatWentWell: string[];
      whatWasChallenging: string[];
      insightsGained: string[];
      emotionsExperienced: string[];
      physicalSensationsNoticed: string[];
      breakthroughMoments: string[];
      resistanceMoments: string[];
    };
    
    // Learning insights
    learningInsights: {
      newUnderstandings: string[];
      skillsDeveloping: string[];
      patternsBecominClear: string[];
      oldBeliefsShifting: string[];
      spiritualInsights: string[];
    };
    
    // Integration planning
    integrationIntentions: {
      howToApplyInsights: string[];
      dailyLifeApplications: string[];
      challengingSituationPrep: string[];
      mindfulnessIntegrationPlans: string[];
    };
    
    // Future practice planning
    futurePracticePlanning: {
      whatToFocusOnNext: string[];
      adjustmentsToMake: string[];
      techniquesToExplore: string[];
      environmentModifications: string[];
    };
  }
  
  export interface ChatbotConversation {
    conversationId: string;
    timestamp: string;
    conversationType: string; // support, guidance, check_in, celebration
    triggerSource: string; // user_initiated, bot_proactive, post_session
    
    // User context at time of conversation
    userContext: {
      currentMood: number;
      stressLevel: number;
      timeSinceLastPractice: number; // hours
      recentChallenges: string[];
      currentGoals: string[];
    };
    
    // Message thread
    messages: {
      messageId: string;
      timestamp: string;
      sender: 'user' | 'bot';
      content: string;
      
      // User message analysis
      userAnalysis?: {
        sentiment: number; // -1 to 1
        emotions: string[];
        intent: string;
        urgency: number; // 1-10
        stressIndicators: string[];
      };
      
      // Bot response data
      botResponse?: {
        responseType: string;
        personalizedElements: string[];
        dataSourcesUsed: string[];
        confidence: number;
      };
    }[];
    
    // Conversation outcomes
    outcomes: {
      issueResolved: boolean;
      userSatisfaction: number;
      actionItemsCreated: string[];
      followUpNeeded: boolean;
      emotionalStateChange: number;
      learningOutcomes: string[];
    };
  }
  
  export interface UserProfile {
    userId: string;
    email: string;
    displayName: string;
    createdAt: string;
    lastLoginAt: string;
    
    // Demographics (from questionnaire)
    demographics: {
      age: string;
      gender: string;
      nationality: string;
      countryResidence: string;
      maritalStatus: string;
      children: string;
      occupation: string;
      livingArrangement: string;
    };
    
    // Health & wellness
    healthProfile: {
      workStressLevel: number;
      financialSituation: string;
      physicalHealth: number;
      sleepQuality: number;
      dailyChallenges: string[];
    };
    
    // Meditation goals & motivation
    meditationProfile: {
      primaryMotivations: string[];
      specificGoals: string[];
      experienceLevel: string;
      preferredTimes: string[];
      challengeAreas: string[];
    };
    
    // Current progress
    currentProgress: {
      currentStage: number;
      currentTLevel: string;
      completedStages: number[];
      completedTLevels: string[];
      totalSessions: number;
      totalMinutes: number;
      currentStreak: number;
      longestStreak: number;
      lastPracticeDate: string;
    };
    
    // Preferences
    preferences: {
      sessionDuration: number;
      reminderTimes: string[];
      guidanceStyle: string;
      feedbackPreference: string;
      privacySettings: {
        shareProgress: boolean;
        dataAnalytics: boolean;
      };
    };
  }
  
  export interface ComprehensiveUserData {
    profile: UserProfile;
    practiceSessions: DetailedSession[];
    dailyEmotionalNotes: DailyEmotionalNote[];
    mindRecoverySession: MindRecoverySession[];
    practiceReflections: PostPracticeReflection[];
    chatbotConversations: ChatbotConversation[];
    
    // Analytics cache (calculated locally)
    analyticsCache: {
      lastCalculated: string;
      trends: {
        presentPercentageTrend: number[];
        moodImprovementTrend: number[];
        stressReductionTrend: number[];
        consistencyScore: number;
      };
      insights: {
        optimalPracticeTime: string;
        mostEffectiveDuration: number;
        emotionalPatterns: string[];
        progressPredictions: string[];
      };
      personalityProfile: {
        meditationPersonalityType: string;
        learningStyle: string;
        motivationDrivers: string[];
        challengePatterns: string[];
      };
    };
  }