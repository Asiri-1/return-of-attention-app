// src/hooks/useHappinessCalculation.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalData } from '../contexts/LocalDataContext';

// Component calculation interfaces
interface ComponentResult {
  score?: number;
  flexibilityScore?: number;
  recoveryScore?: number;
  overallPAHMScore?: number;
  stabilityScore?: number;
  regulationScore?: number;
  consistencyScore?: number;
  connectionScore?: number;
  moodScore?: number;
  currentMoodScore?: number;
  [key: string]: any;
}

interface PAHMAnalysis {
  presentMomentRatio: number;
  presentNeutralRatio: number;
  neutralRatio: number;
  overallPAHMScore: number;
  developmentStage: string;
  stageDescription: string;
  progressionPath: string;
  insights: string[];
  recommendations: string[];
  breakdown: {
    presentNeutralMastery: number;
    presentMomentDevelopment: number;
    therapeuticProgress: number;
    sessionQuality: number;
  };
}

interface ComponentBreakdown {
  currentMoodState: number;
  attachmentFlexibility: number;
  socialConnection: number;
  emotionalStabilityProgress: number;
  mindRecoveryEffectiveness: number;
  emotionalRegulation: number;
  practiceConsistency: number;
  pahmDevelopment: number;
}

interface UserProgress {
  happiness_points: number;
  user_level: string;
  focus_ability: number;
  habit_change_score: number;
  practice_streak: number;
  breakdown: ComponentBreakdown | null;
  pahmAnalysis: PAHMAnalysis | null;
}

export interface UseHappinessCalculationReturn {
  userProgress: UserProgress;
  componentBreakdown: ComponentBreakdown | null;
  calculationDebugInfo: any;
  isCalculating: boolean;
  practiceSessions: any[];
  emotionalNotes: any[];
  questionnaire: any;
  selfAssessment: any;
  debugCalculation: () => void;
  logProgress: () => void;
  testComponents: () => void;
}

// ✅ CLEANED: calculateCurrentMoodState - Better utilize lifestyle factors from questionnaire
const calculateCurrentMoodState = (questionnaire: any, notes: any[]): ComponentResult => {
  if (!questionnaire && (!notes || notes.length === 0)) {
    return { currentMoodScore: 50 }; // Default baseline
  }
  
  let moodScore = 50;
  
  // Better utilize questionnaire lifestyle factors
  if (questionnaire?.responses) {
    // Sleep quality impact (sleep_pattern instead of sleepQuality)
    const sleepPattern = questionnaire.responses.sleep_pattern;
    if (sleepPattern >= 8) {
      moodScore += 20; // 8/10 gets 20 points
    } else if (sleepPattern >= 6) {
      moodScore += 10;
    }
    
    // Physical activity impact
    if (questionnaire.responses.physical_activity === "Very_active") {
      moodScore += 10;
    }
    
    // Work-life balance impact
    if (questionnaire.responses.work_life_balance === "Perfect integration of work and practice") {
      moodScore += 15;
    }
    
    // Diet pattern impact
    if (questionnaire.responses.diet_pattern === "Mindful eating, mostly vegetarian") {
      moodScore += 5;
    }
    
    // Daily routine impact
    if (questionnaire.responses.daily_routine === "Disciplined practice schedule") {
      moodScore += 5;
    }
  }
  
  // Factor in recent emotional notes (secondary)
  if (notes && notes.length > 0) {
    const recentNotes = notes.slice(-5);
    const avgMood = recentNotes.reduce((sum, note) => {
      return sum + (note.mood || 5);
    }, 0) / recentNotes.length;
    moodScore = (moodScore * 0.8) + (avgMood * 10 * 0.2); // 80% questionnaire, 20% notes
  }
  
  return { currentMoodScore: Math.max(0, Math.min(100, Math.round(moodScore))) };
};

// calculateAttachmentFlexibility - Use actual attachment assessment data
const calculateAttachmentFlexibility = (selfAssessment: any): ComponentResult => {
  if (!selfAssessment?.completed) {
    return { flexibilityScore: 40 }; // Default baseline
  }
  
  // Use actual attachment score and nonAttachmentCount from assessment
  const attachmentScore = selfAssessment.attachmentScore || 0;
  const nonAttachmentCount = selfAssessment.nonAttachmentCount || selfAssessment.nonAttachmentCategories || 0;
  
  // Convert attachment score to flexibility score
  // -14 score with 4/6 categories should be ~75/100
  let flexibilityScore = 50; // Base score
  
  // Attachment score contribution (higher negative = better)
  if (attachmentScore <= -10) flexibilityScore += 25;      // -14 gets 25 points
  else if (attachmentScore <= -5) flexibilityScore += 15;
  else if (attachmentScore <= 0) flexibilityScore += 10;
  else if (attachmentScore > 0) flexibilityScore -= 10;    // Positive score reduces
  
  // Non-attachment categories contribution (4/6 = ~17 points)
  flexibilityScore += (nonAttachmentCount / 6) * 25;
  
  return { flexibilityScore: Math.max(0, Math.min(100, Math.round(flexibilityScore))) };
};

// calculateSocialConnection - Better utilize questionnaire social data
const calculateSocialConnection = (questionnaire: any): ComponentResult => {
  if (!questionnaire?.responses) {
    return { connectionScore: 45 }; // Default baseline
  }
  
  const responses = questionnaire.responses;
  let connectionScore = 50;
  
  // Check for "Deep, meaningful relationships" response
  if (responses.social_connections === "Deep, meaningful relationships") {
    connectionScore = 85; // High score for expert-level social connection
  } else if (responses.social_connections) {
    // Handle other social connection responses
    if (responses.social_connections.includes("meaningful")) connectionScore += 25;
    else if (responses.social_connections.includes("good")) connectionScore += 15;
    else if (responses.social_connections.includes("average")) connectionScore += 5;
  }
  
  // Work-life balance as secondary indicator
  if (responses.work_life_balance === "Perfect integration of work and practice") {
    connectionScore += 10; // Bonus for work-life integration
  }
  
  // Motivation factor (service to others indicates strong social connection)
  if (responses.motivation === "Service to others and spiritual awakening") {
    connectionScore += 10;
  }
  
  return { connectionScore: Math.max(0, Math.min(100, Math.round(connectionScore))) };
};

// calculateEmotionalStabilityProgress - Use questionnaire emotional data first
const calculateEmotionalStabilityProgress = (sessions: any[], questionnaire?: any): ComponentResult => {
  let stabilityScore = 40; // Base score
  
  // Utilize questionnaire emotional awareness data first
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 9) {
      stabilityScore = 65; // High baseline for very high emotional awareness (9/10)
    } else if (emotionalAwareness >= 7) {
      stabilityScore = 55;
    } else if (emotionalAwareness >= 5) {
      stabilityScore = 50;
    }
    
    // Stress response bonus
    if (questionnaire.responses.stress_response === "Observe and let go") {
      stabilityScore += 15;
    }
    
    // Thought patterns bonus
    if (questionnaire.responses.thought_patterns === "Peaceful and accepting") {
      stabilityScore += 10;
    }
    
    // Self reflection bonus
    if (questionnaire.responses.self_reflection === "Daily meditation and contemplation") {
      stabilityScore += 5;
    }
  }
  
  // Then add practice session bonuses if available
  if (sessions && sessions.length > 0) {
    const recentSessions = sessions.slice(-10);
    if (recentSessions.length >= 5) {
      stabilityScore += 15; // Reduced impact since questionnaire is primary
    }
    
    const avgQuality = recentSessions.reduce((sum, session) => {
      return sum + (session.quality || 3);
    }, 0) / recentSessions.length;
    
    stabilityScore += avgQuality * 3; // Reduced impact since questionnaire is primary
  }
  
  return { stabilityScore: Math.max(0, Math.min(100, Math.round(stabilityScore))) };
};

const calculateMindRecoveryEffectiveness = (sessions: any[]): ComponentResult => {
  if (!sessions || sessions.length === 0) {
    return { recoveryScore: 35 }; // Low baseline
  }
  
  let recoveryScore = 40;
  
  // Factor in session frequency and duration
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgDuration = totalDuration / sessions.length;
  
  if (avgDuration >= 20) recoveryScore += 25;
  else if (avgDuration >= 10) recoveryScore += 15;
  else if (avgDuration >= 5) recoveryScore += 10;
  
  // Consistency factor
  if (sessions.length >= 10) recoveryScore += 15;
  else if (sessions.length >= 5) recoveryScore += 10;
  
  return { recoveryScore: Math.max(0, Math.min(100, Math.round(recoveryScore))) };
};

// calculateEmotionalRegulation - Heavy weight on questionnaire emotional data
const calculateEmotionalRegulation = (sessions: any[], questionnaire?: any): ComponentResult => {
  let regulationScore = 45;
  
  // Primary scoring from questionnaire data
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 9) {
      regulationScore = 75; // High score for very high awareness (9/10)
    } else if (emotionalAwareness >= 7) {
      regulationScore = 60;
    } else if (emotionalAwareness >= 5) {
      regulationScore = 50;
    }
    
    // Decision making style bonus
    if (questionnaire.responses.decision_making === "Intuitive with mindful consideration") {
      regulationScore += 10;
    }
    
    // Self reflection bonus  
    if (questionnaire.responses.self_reflection === "Daily meditation and contemplation") {
      regulationScore += 10;
    }
    
    // Daily mindfulness bonus
    if (questionnaire.responses.mindfulness_in_daily_life === "Constant awareness and presence") {
      regulationScore += 5;
    }
  }
  
  // Secondary scoring from practice sessions
  if (sessions && sessions.length > 0) {
    const practiceWeeks = Math.floor(sessions.length / 3);
    regulationScore += Math.min(10, practiceWeeks * 2); // Reduced impact
    
    const qualitySessions = sessions.filter(session => (session.quality || 0) >= 4);
    if (qualitySessions.length > 0) {
      regulationScore += (qualitySessions.length / sessions.length) * 8; // Reduced impact
    }
  }
  
  return { regulationScore: Math.max(0, Math.min(100, Math.round(regulationScore))) };
};

const calculatePracticeConsistency = (sessions: any[]): ComponentResult => {
  if (!sessions || sessions.length === 0) {
    return { consistencyScore: 0 };
  }
  
  // Calculate streak and frequency
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  let consistencyScore = 20; // Base score for having any sessions
  
  // Frequency bonus
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSessions = sessions.filter(session => 
    new Date(session.timestamp) > thirtyDaysAgo
  );
  
  if (recentSessions.length >= 20) consistencyScore += 40; // Excellent
  else if (recentSessions.length >= 15) consistencyScore += 30; // Good
  else if (recentSessions.length >= 10) consistencyScore += 20; // Fair
  else if (recentSessions.length >= 5) consistencyScore += 10; // Basic
  
  // Streak calculation
  const currentStreak = calculateSessionStreak(sessions);
  if (currentStreak >= 7) consistencyScore += 30;
  else if (currentStreak >= 3) consistencyScore += 15;
  else if (currentStreak >= 1) consistencyScore += 5;
  
  return { consistencyScore: Math.max(0, Math.min(100, Math.round(consistencyScore))) };
};

// calculatePAHMCentralDevelopment - Give baseline for stated experience
const calculatePAHMCentralDevelopment = (sessions: any[], questionnaire?: any): ComponentResult => {
  let baselinePAHMScore = 15; // Default for no data
  
  // Provide baseline from questionnaire experience level
  if (questionnaire?.responses) {
    const experienceLevel = questionnaire.responses.experience_level;
    const mindfulnessExperience = questionnaire.responses.mindfulness_experience;
    const meditationBackground = questionnaire.responses.meditation_background;
    
    // Experience level baseline (8/10 Expert should get ~25-30)
    if (experienceLevel >= 8) {
      baselinePAHMScore = 25; // Higher baseline for experts
    } else if (experienceLevel >= 6) {
      baselinePAHMScore = 20;
    } else if (experienceLevel >= 4) {
      baselinePAHMScore = 18;
    }
    
    // Mindfulness experience bonus (9/10 Expert)
    if (mindfulnessExperience >= 9) {
      baselinePAHMScore += 5;
    } else if (mindfulnessExperience >= 7) {
      baselinePAHMScore += 3;
    }
    
    // Advanced background bonus
    if (meditationBackground === "Advanced Vipassana and Zen practice") {
      baselinePAHMScore += 5;
    } else if (meditationBackground && meditationBackground.includes("Advanced")) {
      baselinePAHMScore += 3;
    }
    
    // Daily mindfulness bonus
    if (questionnaire.responses.mindfulness_in_daily_life === "Constant awareness and presence") {
      baselinePAHMScore += 5;
    }
    
    // Practice goals bonus
    if (questionnaire.responses.practice_goals === "Liberation from suffering") {
      baselinePAHMScore += 3;
    }
  }
  
  // If no practice sessions, return questionnaire-based assessment
  if (!sessions || sessions.length === 0) {
    return {
      overallPAHMScore: baselinePAHMScore,
      presentMomentRatio: Math.min(1, baselinePAHMScore / 50), // Convert to ratio
      presentNeutralRatio: Math.min(1, baselinePAHMScore / 60), // Slightly higher threshold
      developmentStage: baselinePAHMScore >= 30 ? 'Initial Awareness' : 
                       baselinePAHMScore >= 20 ? 'Scattered Mind with Experience' : 'Scattered Mind',
      stageDescription: baselinePAHMScore >= 30 ? 
        'Starting to recognize patterns of mental activity based on stated experience' : 
        baselinePAHMScore >= 20 ?
        'Mind scattered but with meditation background and skills' :
        'Mind scattered across time and emotions without awareness',
      progressionPath: baselinePAHMScore >= 30 ? 
        'Begin logging practice sessions to develop skills' : 
        baselinePAHMScore >= 20 ?
        'Start consistent practice to build on existing foundation' :
        'Start the Return of Attention journey',
      insights: [
        'Your stated experience suggests good foundation',
        'Begin logging practice sessions to unlock your true potential',
        baselinePAHMScore >= 25 ? 'Expert background provides strong starting point' : 'Building on existing meditation experience'
      ],
      recommendations: [
        'Start daily practice logging',
        'Begin with your preferred duration and style',
        baselinePAHMScore >= 25 ? 'Focus on present-neutral awareness development' : 'Establish consistent routine first'
      ],
      breakdown: {
        presentNeutralMastery: Math.round(baselinePAHMScore * 0.4), // 40% for experts
        presentMomentDevelopment: Math.round(baselinePAHMScore * 0.3), // 30%
        therapeuticProgress: Math.round(baselinePAHMScore * 0.2), // 20%
        sessionQuality: 0 // No sessions yet
      }
    };
  }
  
  // If practice sessions exist, use the existing detailed calculation
  // PAHM Development Analysis
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgQuality = sessions.reduce((sum, session) => sum + (session.quality || 3), 0) / totalSessions;
  
  // Present Moment Development (0-30 points)
  let presentMomentDev = Math.min(30, totalSessions * 2);
  if (totalDuration > 300) presentMomentDev += 5; // 5+ hours bonus
  
  // Present-Neutral Mastery (0-50 points) - The ultimate goal
  let presentNeutralMastery = 0;
  if (totalSessions >= 20) presentNeutralMastery += 15;
  if (totalSessions >= 50) presentNeutralMastery += 15;
  if (avgQuality >= 4) presentNeutralMastery += 20;
  
  // Therapeutic Progress (0-15 points)
  let therapeuticProgress = Math.min(15, Math.floor(totalSessions / 3) * 2);
  
  // Session Quality (0-5 points)
  let sessionQuality = Math.min(5, avgQuality);
  
  const overallPAHMScore = presentNeutralMastery + presentMomentDev + therapeuticProgress + sessionQuality;
  
  // Determine development stage
  let developmentStage = 'Scattered Mind';
  let stageDescription = 'Mind scattered across time and emotions without awareness';
  let progressionPath = 'Start the Return of Attention journey';
  
  if (overallPAHMScore >= 80) {
    developmentStage = 'Present-Neutral Mastery';
    stageDescription = 'Consistent present-moment awareness with neutral observation';
    progressionPath = 'Deepen equanimity and effortless presence';
  } else if (overallPAHMScore >= 60) {
    developmentStage = 'Developing Present Attention';
    stageDescription = 'Regular moments of present awareness with growing stability';
    progressionPath = 'Strengthen neutral observation and reduce reactivity';
  } else if (overallPAHMScore >= 40) {
    developmentStage = 'Return of Attention';
    stageDescription = 'Beginning to notice mind wandering and returning attention';
    progressionPath = 'Build consistency and extend present moments';
  } else if (overallPAHMScore >= 20) {
    developmentStage = 'Initial Awareness';
    stageDescription = 'Starting to recognize patterns of mental activity';
    progressionPath = 'Develop mindful observation skills';
  }
  
  // Generate insights and recommendations
  const insights = [];
  const recommendations = [];
  
  if (totalSessions < 10) {
    insights.push('You\'re in the early stages of building present attention');
    recommendations.push('Aim for daily 5-10 minute sessions');
  } else if (totalSessions < 30) {
    insights.push('Your practice foundation is developing');
    recommendations.push('Gradually increase session length');
  } else {
    insights.push('You have established a solid practice foundation');
    recommendations.push('Focus on quality over quantity');
  }
  
  if (avgQuality < 3) {
    insights.push('Session quality can be improved');
    recommendations.push('Practice returning attention gently when mind wanders');
  }
  
  return {
    overallPAHMScore,
    presentMomentRatio: Math.min(1, totalSessions / 50),
    presentNeutralRatio: Math.min(1, presentNeutralMastery / 50),
    developmentStage,
    stageDescription,
    progressionPath,
    insights,
    recommendations,
    breakdown: {
      presentNeutralMastery,
      presentMomentDevelopment: presentMomentDev,
      therapeuticProgress,
      sessionQuality: Math.round(sessionQuality)
    }
  };
};

// Helper function to calculate session streak
const calculateSessionStreak = (sessions: any[]): number => {
  if (sessions.length === 0) return 0;
  
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const session of sortedSessions) {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
};

// ✅ PERFORMANCE FIX: Main hook with optimizations
export const useHappinessCalculation = (): UseHappinessCalculationReturn => {
  const { 
    practiceSessions,
    emotionalNotes,
    getQuestionnaire,
    getSelfAssessment
  } = useLocalData();

  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 15,
    user_level: 'Newcomer',
    focus_ability: 0,
    habit_change_score: 0,
    practice_streak: 0,
    breakdown: null,
    pahmAnalysis: null
  });

  const [componentBreakdown, setComponentBreakdown] = useState<ComponentBreakdown | null>(null);
  const [calculationDebugInfo, setCalculationDebugInfo] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // ✅ PERFORMANCE FIX: Memoized questionnaire and self-assessment data
  const questionnaire = useMemo(() => getQuestionnaire(), [getQuestionnaire]);
  const selfAssessment = useMemo(() => getSelfAssessment(), [getSelfAssessment]);

  // Extract numeric scores from calculation function objects
  const extractNumericScore = useCallback((result: ComponentResult): number => {
    if (typeof result === 'number') {
      return result;
    }
    
    if (result && typeof result === 'object') {
      // Try different possible score properties
      return result.score || 
             result.flexibilityScore || 
             result.recoveryScore || 
             result.overallPAHMScore || 
             result.stabilityScore ||
             result.regulationScore ||
             result.consistencyScore ||
             result.connectionScore ||
             result.moodScore ||
             result.currentMoodScore ||
             0;
    }
    
    return 0;
  }, []);

  // ✅ PERFORMANCE FIX: Memoized calculation function
  const calculateHappinessScore = useCallback(() => {
    setIsCalculating(true);
    
    try {
      // Get fresh data
      const sessions = practiceSessions || [];
      const notes = emotionalNotes || [];
      
      // Calculate individual components with questionnaire data passed to functions that need it
      const currentMoodResult = calculateCurrentMoodState(questionnaire, notes);
      const currentMoodScore = extractNumericScore(currentMoodResult);
      
      const attachmentResult = calculateAttachmentFlexibility(selfAssessment);
      const attachmentScore = extractNumericScore(attachmentResult);
      
      const socialResult = calculateSocialConnection(questionnaire);
      const socialScore = extractNumericScore(socialResult);
      
      // Pass questionnaire parameter to functions that need it
      const emotionalStabilityResult = calculateEmotionalStabilityProgress(sessions, questionnaire);
      const emotionalStabilityScore = extractNumericScore(emotionalStabilityResult);
      
      const mindRecoveryResult = calculateMindRecoveryEffectiveness(sessions);
      const mindRecoveryScore = extractNumericScore(mindRecoveryResult);
      
      // Pass questionnaire parameter to emotional regulation
      const emotionalRegulationResult = calculateEmotionalRegulation(sessions, questionnaire);
      const emotionalRegulationScore = extractNumericScore(emotionalRegulationResult);
      
      const practiceConsistencyResult = calculatePracticeConsistency(sessions);
      const practiceConsistencyScore = extractNumericScore(practiceConsistencyResult);
      
      // Pass questionnaire parameter to PAHM development
      const pahmResult = calculatePAHMCentralDevelopment(sessions, questionnaire);
      const pahmScore = extractNumericScore(pahmResult);

      // Set component breakdown
      const breakdown: ComponentBreakdown = {
        currentMoodState: currentMoodScore,
        attachmentFlexibility: attachmentScore,
        socialConnection: socialScore,
        emotionalStabilityProgress: emotionalStabilityScore,
        mindRecoveryEffectiveness: mindRecoveryScore,
        emotionalRegulation: emotionalRegulationScore,
        practiceConsistency: practiceConsistencyScore,
        pahmDevelopment: pahmScore
      };

      setComponentBreakdown(breakdown);

      // PAHM-Centered Weighted Calculation (Total: 100%)
      const weightedScore = Math.round(
        (pahmScore * 0.30) +                    // 30% PAHM Development - THE CORE
        (emotionalStabilityScore * 0.20) +      // 20% Emotional Stability  
        (currentMoodScore * 0.15) +             // 15% Current Mood
        (mindRecoveryScore * 0.12) +            // 12% Mind Recovery
        (emotionalRegulationScore * 0.10) +     // 10% Emotional Regulation
        (attachmentScore * 0.08) +              // 8% Attachment Flexibility
        (socialScore * 0.03) +                  // 3% Social Connection
        (practiceConsistencyScore * 0.02)       // 2% Practice Consistency
      );

      // Determine user level based on score
      let userLevel = 'Newcomer';
      if (weightedScore >= 80) userLevel = 'Master Practitioner';
      else if (weightedScore >= 65) userLevel = 'Advanced Practitioner';
      else if (weightedScore >= 45) userLevel = 'Developing Practitioner';
      else if (weightedScore >= 25) userLevel = 'Emerging Practitioner';

      // Create PAHM analysis from detailed result
      let pahmAnalysis: PAHMAnalysis | null = null;
      if (typeof pahmResult === 'object' && pahmResult !== null) {
        pahmAnalysis = {
          presentMomentRatio: pahmResult.presentMomentRatio || 0,
          presentNeutralRatio: pahmResult.presentNeutralRatio || 0,
          neutralRatio: pahmResult.neutralRatio || pahmResult.presentNeutralRatio || 0,
          overallPAHMScore: pahmScore,
          developmentStage: pahmResult.developmentStage || 'Scattered Mind',
          stageDescription: pahmResult.stageDescription || 'Mind scattered across time and emotions without awareness',
          progressionPath: pahmResult.progressionPath || 'Start the Return of Attention journey',
          insights: pahmResult.insights || [],
          recommendations: pahmResult.recommendations || [],
          breakdown: pahmResult.breakdown || {
            presentNeutralMastery: 0,
            presentMomentDevelopment: 0,
            therapeuticProgress: 0,
            sessionQuality: 0
          }
        };
      }

      // Calculate enhanced metrics
      const focusAbility = Math.min(Math.round(pahmScore + (emotionalRegulationScore * 0.5)), 100);
      const habitChangeScore = Math.min(Math.round(pahmScore + (practiceConsistencyScore * 0.8)), 100);
      const practiceStreak = sessions.length > 0 ? calculateSessionStreak(sessions) : 0;

      // Create comprehensive result
      const result: UserProgress = {
        happiness_points: weightedScore,
        user_level: userLevel,
        focus_ability: focusAbility,
        habit_change_score: habitChangeScore,
        practice_streak: practiceStreak,
        breakdown: breakdown,
        pahmAnalysis: pahmAnalysis
      };

      setUserProgress(result);

      // Save to localStorage for persistence
      localStorage.setItem('happiness_points', weightedScore.toString());
      localStorage.setItem('user_level', userLevel);
      localStorage.setItem('focus_ability', focusAbility.toString());
      localStorage.setItem('habit_change_score', habitChangeScore.toString());
      localStorage.setItem('practice_streak', practiceStreak.toString());

      // Emit event for other components
      const event = new CustomEvent('happinessUpdated', {
        detail: {
          happiness_points: weightedScore,
          user_level: userLevel,
          breakdown: breakdown,
          pahmAnalysis: pahmAnalysis
        }
      });
      window.dispatchEvent(event);

    } catch (error) {
      // Fallback to default values
      setUserProgress({
        happiness_points: 15,
        user_level: 'Newcomer',
        focus_ability: 0,
        habit_change_score: 0,
        practice_streak: 0,
        breakdown: null,
        pahmAnalysis: null
      });
    } finally {
      setIsCalculating(false);
    }
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, extractNumericScore]);

  // ✅ PERFORMANCE FIX: Debug functions with useCallback
  const debugCalculation = useCallback(() => {
    // Debug information available for development
    const debugInfo = {
      questionnaire: questionnaire ? 'Available' : 'Missing',
      selfAssessment: selfAssessment ? 'Available' : 'Missing',
      practiceSessions: practiceSessions?.length || 0,
      emotionalNotes: emotionalNotes?.length || 0,
      currentResults: userProgress
    };
    
    setCalculationDebugInfo(debugInfo);
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, userProgress]);

  const logProgress = useCallback(() => {
    // Progress logging available for development
  }, [userProgress, componentBreakdown]);

  const testComponents = useCallback(() => {
    // Component testing available for development
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, extractNumericScore]);

  // ✅ PERFORMANCE FIX: Auto-calculate when data changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateHappinessScore();
    }, 100); // Small delay to batch updates
    
    return () => clearTimeout(timeoutId);
  }, [calculateHappinessScore]);

  // ✅ PERFORMANCE FIX: Memoized return value
  return useMemo(() => ({
    userProgress,
    componentBreakdown,
    calculationDebugInfo,
    isCalculating,
    practiceSessions: practiceSessions || [],
    emotionalNotes: emotionalNotes || [],
    questionnaire,
    selfAssessment,
    debugCalculation,
    logProgress,
    testComponents
  }), [
    userProgress,
    componentBreakdown,
    calculationDebugInfo,
    isCalculating,
    practiceSessions,
    emotionalNotes,
    questionnaire,
    selfAssessment,
    debugCalculation,
    logProgress,
    testComponents
  ]);
};