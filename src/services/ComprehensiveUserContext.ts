// ============================================================================
// src/services/ComprehensiveUserContext.ts
// Enhanced context builder that transforms your rich data into AI-ready format
// ============================================================================

// Import the interface from your existing AI engine
import { ComprehensiveUserContext } from './AdaptiveWisdomEngine';

export class UserContextBuilder {
  /**
   * Build comprehensive user context for AI responses
   * This replaces your hardcoded context with real user data
   */
  static buildComprehensiveContext(
    currentUser: any,
    getAnalyticsData: () => any,
    getPAHMData: () => any,
    getEnvironmentData: () => any,
    getDailyEmotionalNotes: () => any[],
    getMindRecoveryAnalytics: () => any,
    getSelfAssessmentData?: () => any, // Optional until you add to LocalDataContext
    getQuestionnaireData?: () => any   // Optional until you add to LocalDataContext
  ): ComprehensiveUserContext {
    
    // Get all available data
    const analyticsData = getAnalyticsData?.() || {};
    const pahmData = getPAHMData?.() || {};
    const environmentData = getEnvironmentData?.() || {};
    const emotionalNotes = getDailyEmotionalNotes?.() || [];
    const mindRecoveryData = getMindRecoveryAnalytics?.() || {};
    const selfAssessment = getSelfAssessmentData?.() || null;
    const questionnaireData = getQuestionnaireData?.() || null;

    // ===== REAL-TIME EMOTIONAL STATE ANALYSIS =====
    const currentMood = this.calculateCurrentMood(emotionalNotes);
    const currentEnergy = this.calculateCurrentEnergy(emotionalNotes);
    
    // ===== INTELLIGENT CHALLENGE DETECTION =====
    const recentChallenges = this.detectRecentChallenges(
      emotionalNotes, 
      analyticsData, 
      pahmData
    );

    // ===== TIME-AWARE CONTEXT =====
    const timeOfDay = this.getTimeContext();

    // ===== PAHM MASTERY ANALYSIS =====
    const pahmAnalysis = this.analyzePAHMData(pahmData);

    // ===== PRACTICE PROGRESSION ANALYSIS =====
    const progressAnalysis = this.analyzeProgress(analyticsData);

    // ===== ENVIRONMENTAL OPTIMIZATION =====
    const environmentAnalysis = this.analyzeEnvironment(environmentData);

    // ===== BUILD COMPREHENSIVE CONTEXT =====
    const context: ComprehensiveUserContext = {
      uid: currentUser?.uid || '',
      currentStage: Number(currentUser?.currentStage) || 1,
      goals: currentUser?.goals || [],
      currentMood,
      timeOfDay,
      recentChallenges,
      
      questionnaireAnswers: questionnaireData,
      selfAssessmentResults: selfAssessment,

      enhancedProfile: {
        currentProgress: progressAnalysis,
        preferences: this.extractPreferences(environmentData, analyticsData)
      },

      practiceAnalytics: {
        pahmData: pahmAnalysis,
        environmentData: environmentAnalysis,
        mindRecoveryAnalytics: {
          totalSessions: mindRecoveryData.totalMindRecoverySessions || 0,
          avgRating: mindRecoveryData.avgMindRecoveryRating || 0,
          contextStats: mindRecoveryData.contextStats || [],
          integrationLevel: this.calculateIntegrationLevel(mindRecoveryData)
        },
        emotionalNotes: emotionalNotes.slice(-10).map(note => ({
          date: note.timestamp,
          emotion: note.emotion,
          energyLevel: note.energyLevel || currentEnergy,
          neutralityPercentage: this.calculateNeutralityFromEmotion(note.emotion)
        }))
      },

      recentSessions: this.getRecentSessionsSummary(analyticsData)
    };

    console.log('🎯 Enhanced user context built:', {
      uid: context.uid,
      mood: context.currentMood,
      challenges: context.recentChallenges,
      pahmObservations: pahmAnalysis?.totalObservations || 0,
      practiceStreak: progressAnalysis?.currentStreak || 0
    });

    return context;
  }

  /**
   * Calculate current mood from recent emotional notes
   */
  private static calculateCurrentMood(emotionalNotes: any[]): number {
    if (!emotionalNotes || emotionalNotes.length === 0) return 6; // Default neutral

    // Get notes from last 3 days
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    
    const recentNotes = emotionalNotes.filter(note => 
      new Date(note.timestamp) >= threeDaysAgo
    );

    if (recentNotes.length === 0) return 6;

    // Map emotions to numeric values
    const emotionValues: { [key: string]: number } = {
      // Positive emotions
      'joy': 9, 'joyful': 9, 'ecstatic': 10, 'blissful': 10,
      'content': 8, 'peaceful': 8, 'serene': 8, 'satisfied': 7,
      'relieved': 7, 'grateful': 8, 'loving': 8, 'amazed': 8,
      'energized': 8, 'focused': 7, 'accomplished': 8, 'balanced': 8,
      'refreshed': 7, 'centered': 7, 'clear': 7, 'connected': 8,
      
      // Neutral emotions
      'neutral': 6, 'reflective': 6, 'calm': 6,
      
      // Challenging emotions
      'sadness': 4, 'anger': 3, 'fear': 3, 'stressed': 3,
      'anxious': 3, 'frustrated': 4, 'overwhelmed': 3,
      'tired': 4, 'restless': 4, 'confused': 4
    };

    const moodSum = recentNotes.reduce((sum, note) => {
      const value = emotionValues[note.emotion?.toLowerCase()] || 6;
      return sum + value;
    }, 0);

    return Math.round(moodSum / recentNotes.length);
  }

  /**
   * Calculate current energy from recent emotional notes
   */
  private static calculateCurrentEnergy(emotionalNotes: any[]): number {
    if (!emotionalNotes || emotionalNotes.length === 0) return 6;

    const recentNotes = emotionalNotes.slice(-5); // Last 5 notes
    
    // Use energyLevel if available, otherwise map from emotions
    const energySum = recentNotes.reduce((sum, note) => {
      if (note.energyLevel) return sum + note.energyLevel;
      
      // Map emotions to energy levels
      const emotion = note.emotion?.toLowerCase() || 'neutral';
      if (['energized', 'ecstatic', 'joy', 'amazed'].includes(emotion)) return sum + 9;
      if (['content', 'peaceful', 'focused', 'accomplished'].includes(emotion)) return sum + 7;
      if (['tired', 'exhausted', 'drained'].includes(emotion)) return sum + 3;
      if (['overwhelmed', 'stressed'].includes(emotion)) return sum + 4;
      
      return sum + 6; // Default neutral energy
    }, 0);

    return Math.round(energySum / recentNotes.length);
  }

  /**
   * Detect recent challenges from patterns in data
   */
  private static detectRecentChallenges(
    emotionalNotes: any[], 
    analyticsData: any, 
    pahmData: any
  ): string[] {
    const challenges: string[] = [];

    // Analyze emotional patterns
    const recentEmotions = emotionalNotes.slice(-10).map(note => note.emotion?.toLowerCase());
    
    if (recentEmotions.filter(e => ['restless', 'anxious', 'overwhelmed'].includes(e || '')).length >= 2) {
      challenges.push('restlessness');
    }
    
    if (recentEmotions.filter(e => ['tired', 'exhausted', 'drained'].includes(e || '')).length >= 2) {
      challenges.push('low-energy');
    }

    if (recentEmotions.filter(e => ['frustrated', 'anger', 'stressed'].includes(e || '')).length >= 2) {
      challenges.push('emotional-regulation');
    }

    // Analyze PAHM patterns
    if (pahmData && pahmData.presentPercentage < 60) {
      challenges.push('mind-wandering');
    }

    if (pahmData && pahmData.emotionalDistribution) {
      const attachmentPercentage = (pahmData.emotionalDistribution.attachment / pahmData.totalCounts) * 100;
      if (attachmentPercentage > 40) {
        challenges.push('attachment-patterns');
      }
    }

    // Analyze practice consistency
    if (analyticsData.currentStreak === 0) {
      challenges.push('consistency');
    }

    if (analyticsData.averageQuality < 6) {
      challenges.push('practice-quality');
    }

    return challenges.length > 0 ? challenges : ['general-development'];
  }

  /**
   * Get time-aware context
   */
  private static getTimeContext(): string {
    const hour = new Date().getHours();
    
    if (hour >= 5 && hour < 9) return 'early-morning';
    if (hour >= 9 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  /**
   * Analyze PAHM data for mastery insights
   */
  private static analyzePAHMData(pahmData: any) {
    if (!pahmData || !pahmData.totalCounts) return {
      totalObservations: 0,
      presentPercentage: 0,
      pastPercentage: 0,
      futurePercentage: 0,
      attachmentPercentage: 0,
      neutralPercentage: 0,
      aversionPercentage: 0,
      presentNeutralMastery: 0
    };

    const presentNeutralCount = (pahmData.totalPAHM?.present_neutral || 0);
    const presentTotal = (pahmData.timeDistribution?.present || 0);
    
    const presentNeutralMastery = presentTotal > 0 
      ? Math.round((presentNeutralCount / presentTotal) * 100) 
      : 0;

    return {
      totalObservations: pahmData.totalCounts,
      presentPercentage: pahmData.presentPercentage || 0,
      pastPercentage: Math.round(((pahmData.timeDistribution?.past || 0) / pahmData.totalCounts) * 100),
      futurePercentage: Math.round(((pahmData.timeDistribution?.future || 0) / pahmData.totalCounts) * 100),
      attachmentPercentage: Math.round(((pahmData.emotionalDistribution?.attachment || 0) / pahmData.totalCounts) * 100),
      neutralPercentage: pahmData.neutralPercentage || 0,
      aversionPercentage: Math.round(((pahmData.emotionalDistribution?.aversion || 0) / pahmData.totalCounts) * 100),
      presentNeutralMastery
    };
  }

  /**
   * Analyze progress metrics
   */
  private static analyzeProgress(analyticsData: any) {
    return {
      totalSessions: analyticsData.totalSessions || 0,
      currentStreak: analyticsData.currentStreak || 0,
      averageQuality: analyticsData.averageQuality || 0,
      averagePresentPercentage: analyticsData.averagePresentPercentage || 0
    };
  }

  /**
   * Analyze environment preferences
   */
  private static analyzeEnvironment(environmentData: any) {
    if (!environmentData) return {
      avgRating: 0,
      posture: 'chair',
      location: 'quiet-room',
      lighting: 'natural',
      sounds: 'silence'
    };

    // Find best performing environment factors
    const bestPosture = environmentData.posture?.[0]?.name || 'chair';
    const bestLocation = environmentData.location?.[0]?.name || 'quiet-room';
    const bestLighting = environmentData.lighting?.[0]?.name || 'natural';
    const bestSounds = environmentData.sounds?.[0]?.name || 'silence';

    const avgRating = environmentData.posture?.[0]?.avgRating || 0;

    return {
      avgRating,
      posture: bestPosture,
      location: bestLocation,
      lighting: bestLighting,
      sounds: bestSounds
    };
  }

  /**
   * Extract user preferences from data patterns
   */
  private static extractPreferences(environmentData: any, analyticsData: any) {
    return {
      optimalPracticeTime: this.getTimeContext(),
      defaultSessionDuration: Math.round(analyticsData.averageSessionLength || 20),
      favoriteStages: [analyticsData.currentStage || 1],
      notificationSettings: true
    };
  }

  /**
   * Calculate integration level for mind recovery
   */
  private static calculateIntegrationLevel(mindRecoveryData: any): string {
    const sessions = mindRecoveryData.totalMindRecoverySessions || 0;
    const rating = mindRecoveryData.avgMindRecoveryRating || 0;
    
    if (sessions > 50 && rating > 8) return 'advanced';
    if (sessions > 20 && rating > 6) return 'intermediate';
    if (sessions > 5) return 'developing';
    return 'beginner';
  }

  /**
   * Calculate neutrality percentage from emotion
   */
  private static calculateNeutralityFromEmotion(emotion: string): number {
    const neutralEmotions = ['neutral', 'calm', 'peaceful', 'balanced', 'centered'];
    return neutralEmotions.includes(emotion?.toLowerCase()) ? 80 : 40;
  }

  /**
   * Get recent sessions summary
   */
  private static getRecentSessionsSummary(analyticsData: any): any[] {
    return [
      {
        type: 'practice',
        count: analyticsData.totalSessions || 0,
        trend: analyticsData.progressTrend || 'stable'
      }
    ];
  }

  /**
   * Get personalization score (0-100)
   */
  static getPersonalizationScore(context: ComprehensiveUserContext): number {
    let score = 0;
    
    // Basic info (20 points)
    if (context.uid) score += 10;
    if (context.currentStage > 0) score += 10;

    // Real data vs hardcoded (40 points)
    if (context.currentMood && context.currentMood !== 6) score += 10; // Not default
    if (context.recentChallenges && context.recentChallenges.length > 0 && !context.recentChallenges.includes('general-development')) score += 10;
    if (context.practiceAnalytics?.pahmData?.totalObservations || 0 > 0) score += 10;
    if (context.practiceAnalytics?.emotionalNotes?.length || 0 > 0) score += 10;

    // Advanced analytics (40 points)
    if (context.enhancedProfile?.currentProgress?.totalSessions || 0 > 5) score += 10;
    if (context.practiceAnalytics?.environmentData?.avgRating || 0 > 0) score += 10;
    if (context.practiceAnalytics?.mindRecoveryAnalytics?.totalSessions || 0 > 0) score += 10;
    if (context.questionnaireAnswers || context.selfAssessmentResults) score += 10;

    return Math.min(100, score);
  }

  /**
   * Debug context (development only)
   */
  static debugContext(context: ComprehensiveUserContext): void {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('🎯 Enhanced User Context Debug');
    console.log('Basic Info:', {
      uid: context.uid,
      stage: context.currentStage,
      goals: context.goals
    });
    console.log('Real-time State:', {
      mood: context.currentMood,
      challenges: context.recentChallenges,
      timeOfDay: context.timeOfDay
    });
    console.log('Practice Analytics:', {
      pahmObservations: context.practiceAnalytics?.pahmData?.totalObservations || 0,
      presentMastery: context.practiceAnalytics?.pahmData?.presentNeutralMastery || 0,
      environmentRating: context.practiceAnalytics?.environmentData?.avgRating || 0
    });
    console.log('Personalization Score:', this.getPersonalizationScore(context));
    console.groupEnd();
  }
}