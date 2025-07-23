// ✅ Fixed useHappinessCalculation.ts - Progressive Onboarding Integration
// File: src/hooks/useHappinessCalculation.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalDataCompat as useLocalData } from './useLocalDataCompat';
import { useProgressiveOnboarding } from './useProgressiveOnboarding';

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
  hasMinimumData: boolean; // ✅ NEW: Flag for sufficient data
  dataCompleteness: {
    questionnaire: boolean;
    selfAssessment: boolean;
    practiceSessions: boolean;
    sufficientForCalculation: boolean;
  };
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

// ✅ FIXED: Check if user has sufficient data for happiness calculation
const hasMinimumDataForCalculation = (
  questionnaire: any,
  selfAssessment: any,
  sessions: any[]
): boolean => {
  // Require at least one of these conditions:
  // 1. Completed questionnaire AND self-assessment
  // 2. At least 3 practice sessions
  // 3. Questionnaire AND at least 1 practice session
  
  const hasQuestionnaire = questionnaire?.completed || questionnaire?.responses;
  const hasSelfAssessment = selfAssessment?.completed;
  const hasMinimumSessions = sessions && sessions.length >= 3;
  const hasAnySessions = sessions && sessions.length >= 1;
  
  return (
    (hasQuestionnaire && hasSelfAssessment) ||
    hasMinimumSessions ||
    (hasQuestionnaire && hasAnySessions)
  );
};

// ✅ FIXED: Progressive calculation based on available data
const calculateCurrentMoodState = (questionnaire: any, notes: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData) {
    return { currentMoodScore: 0 }; // No score without data
  }
  
  if (!questionnaire && (!notes || notes.length === 0)) {
    return { currentMoodScore: 25 }; // Very low baseline only if we have other data
  }
  
  let moodScore = 50;
  
  // Better utilize questionnaire lifestyle factors
  if (questionnaire?.responses) {
    // Sleep quality impact
    const sleepPattern = questionnaire.responses.sleep_pattern;
    if (sleepPattern >= 8) {
      moodScore += 20;
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
  
  // Factor in recent emotional notes
  if (notes && notes.length > 0) {
    const recentNotes = notes.slice(-5);
    const avgMood = recentNotes.reduce((sum, note) => {
      return sum + (note.mood || 5);
    }, 0) / recentNotes.length;
    moodScore = (moodScore * 0.8) + (avgMood * 10 * 0.2);
  }
  
  return { currentMoodScore: Math.max(0, Math.min(100, Math.round(moodScore))) };
};

// ✅ FIXED: Require self-assessment for attachment flexibility
const calculateAttachmentFlexibility = (selfAssessment: any, hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !selfAssessment?.completed) {
    return { flexibilityScore: 0 }; // No score without self-assessment
  }
  
  const attachmentScore = selfAssessment.attachmentScore || 0;
  const nonAttachmentCount = selfAssessment.nonAttachmentCount || selfAssessment.nonAttachmentCategories || 0;
  
  let flexibilityScore = 50;
  
  // Attachment score contribution
  if (attachmentScore <= -10) flexibilityScore += 25;
  else if (attachmentScore <= -5) flexibilityScore += 15;
  else if (attachmentScore <= 0) flexibilityScore += 10;
  else if (attachmentScore > 0) flexibilityScore -= 10;
  
  // Non-attachment categories contribution
  flexibilityScore += (nonAttachmentCount / 6) * 25;
  
  return { flexibilityScore: Math.max(0, Math.min(100, Math.round(flexibilityScore))) };
};

// ✅ FIXED: Require questionnaire for social connection
const calculateSocialConnection = (questionnaire: any, hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !questionnaire?.responses) {
    return { connectionScore: 0 }; // No score without questionnaire
  }
  
  const responses = questionnaire.responses;
  let connectionScore = 50;
  
  // Check for social connections response
  if (responses.social_connections === "Deep, meaningful relationships") {
    connectionScore = 85;
  } else if (responses.social_connections) {
    if (responses.social_connections.includes("meaningful")) connectionScore += 25;
    else if (responses.social_connections.includes("good")) connectionScore += 15;
    else if (responses.social_connections.includes("average")) connectionScore += 5;
  }
  
  // Work-life balance bonus
  if (responses.work_life_balance === "Perfect integration of work and practice") {
    connectionScore += 10;
  }
  
  // Motivation factor
  if (responses.motivation === "Service to others and spiritual awakening") {
    connectionScore += 10;
  }
  
  return { connectionScore: Math.max(0, Math.min(100, Math.round(connectionScore))) };
};

// ✅ FIXED: Require data for emotional stability
const calculateEmotionalStabilityProgress = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { stabilityScore: 0 }; // No score without data
  }
  
  let stabilityScore = 40;
  
  // Utilize questionnaire emotional data
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 9) {
      stabilityScore = 65;
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
  
  // Add practice session bonuses
  if (sessions && sessions.length > 0) {
    const recentSessions = sessions.slice(-10);
    if (recentSessions.length >= 5) {
      stabilityScore += 15;
    }
    
    const avgQuality = recentSessions.reduce((sum, session) => {
      return sum + (session.quality || 3);
    }, 0) / recentSessions.length;
    
    stabilityScore += avgQuality * 3;
  }
  
  return { stabilityScore: Math.max(0, Math.min(100, Math.round(stabilityScore))) };
};

// ✅ FIXED: Require practice sessions for mind recovery
const calculateMindRecoveryEffectiveness = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !sessions || sessions.length === 0) {
    return { recoveryScore: 0 }; // No score without practice sessions
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

// ✅ FIXED: Require data for emotional regulation
const calculateEmotionalRegulation = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { regulationScore: 0 }; // No score without data
  }
  
  let regulationScore = 45;
  
  // Primary scoring from questionnaire
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 9) {
      regulationScore = 75;
    } else if (emotionalAwareness >= 7) {
      regulationScore = 60;
    } else if (emotionalAwareness >= 5) {
      regulationScore = 50;
    }
    
    // Decision making bonus
    if (questionnaire.responses.decision_making === "Intuitive with mindful consideration") {
      regulationScore += 10;
    }
    
    // Self reflection bonus
    if (questionnaire.responses.self_reflection === "Daily meditation and contemplation") {
      regulationScore += 10;
    }
    
    // Mindfulness bonus
    if (questionnaire.responses.mindfulness_in_daily_life === "Constant awareness and presence") {
      regulationScore += 5;
    }
  }
  
  // Secondary scoring from practice sessions
  if (sessions && sessions.length > 0) {
    const practiceWeeks = Math.floor(sessions.length / 3);
    regulationScore += Math.min(10, practiceWeeks * 2);
    
    const qualitySessions = sessions.filter(session => (session.quality || 0) >= 4);
    if (qualitySessions.length > 0) {
      regulationScore += (qualitySessions.length / sessions.length) * 8;
    }
  }
  
  return { regulationScore: Math.max(0, Math.min(100, Math.round(regulationScore))) };
};

// ✅ FIXED: Require practice sessions for consistency
const calculatePracticeConsistency = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !sessions || sessions.length === 0) {
    return { consistencyScore: 0 }; // No score without practice sessions
  }
  
  let consistencyScore = 20;
  
  // Frequency calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSessions = sessions.filter(session => 
    new Date(session.timestamp) > thirtyDaysAgo
  );
  
  if (recentSessions.length >= 20) consistencyScore += 40;
  else if (recentSessions.length >= 15) consistencyScore += 30;
  else if (recentSessions.length >= 10) consistencyScore += 20;
  else if (recentSessions.length >= 5) consistencyScore += 10;
  
  // Streak calculation
  const currentStreak = calculateSessionStreak(sessions);
  if (currentStreak >= 7) consistencyScore += 30;
  else if (currentStreak >= 3) consistencyScore += 15;
  else if (currentStreak >= 1) consistencyScore += 5;
  
  return { consistencyScore: Math.max(0, Math.min(100, Math.round(consistencyScore))) };
};

// ✅ FIXED: PAHM calculation with proper baseline
const calculatePAHMCentralDevelopment = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return {
      overallPAHMScore: 0,
      presentMomentRatio: 0,
      presentNeutralRatio: 0,
      developmentStage: 'Data Collection Needed',
      stageDescription: 'Complete questionnaire and practice sessions to begin PAHM assessment',
      progressionPath: 'Start with questionnaire or begin practice sessions',
      insights: ['No data available for PAHM analysis'],
      recommendations: ['Complete the questionnaire', 'Begin practice sessions', 'Complete self-assessment'],
      breakdown: {
        presentNeutralMastery: 0,
        presentMomentDevelopment: 0,
        therapeuticProgress: 0,
        sessionQuality: 0
      }
    };
  }
  
  let baselinePAHMScore = 15;
  
  // Provide baseline from questionnaire experience
  if (questionnaire?.responses) {
    const experienceLevel = questionnaire.responses.experience_level;
    const mindfulnessExperience = questionnaire.responses.mindfulness_experience;
    
    if (experienceLevel >= 8) {
      baselinePAHMScore = 25;
    } else if (experienceLevel >= 6) {
      baselinePAHMScore = 20;
    } else if (experienceLevel >= 4) {
      baselinePAHMScore = 18;
    }
    
    if (mindfulnessExperience >= 9) {
      baselinePAHMScore += 5;
    } else if (mindfulnessExperience >= 7) {
      baselinePAHMScore += 3;
    }
  }
  
  // If no practice sessions, return questionnaire-based assessment
  if (!sessions || sessions.length === 0) {
    return {
      overallPAHMScore: baselinePAHMScore,
      presentMomentRatio: Math.min(1, baselinePAHMScore / 50),
      presentNeutralRatio: Math.min(1, baselinePAHMScore / 60),
      developmentStage: baselinePAHMScore >= 30 ? 'Initial Awareness' : 
                       baselinePAHMScore >= 20 ? 'Scattered Mind with Experience' : 'Scattered Mind',
      stageDescription: 'Assessment based on stated experience level',
      progressionPath: 'Begin practice sessions to develop actual skills',
      insights: ['Assessment based on questionnaire responses', 'Practice sessions needed for accurate measurement'],
      recommendations: ['Start daily practice sessions', 'Complete self-assessment', 'Begin with your preferred duration'],
      breakdown: {
        presentNeutralMastery: Math.round(baselinePAHMScore * 0.4),
        presentMomentDevelopment: Math.round(baselinePAHMScore * 0.3),
        therapeuticProgress: Math.round(baselinePAHMScore * 0.2),
        sessionQuality: 0
      }
    };
  }
  
  // Calculate with practice sessions (existing logic)
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgQuality = sessions.reduce((sum, session) => sum + (session.quality || 3), 0) / totalSessions;
  
  // Present Moment Development (0-30 points)
  let presentMomentDev = Math.min(30, totalSessions * 2);
  if (totalDuration > 300) presentMomentDev += 5;
  
  // Present-Neutral Mastery (0-50 points)
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
  let progressionPath = 'Build consistent practice routine';
  
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
    insights.push('Building foundation of present attention practice');
    recommendations.push('Aim for daily 5-10 minute sessions');
  } else if (totalSessions < 30) {
    insights.push('Developing consistent practice routine');
    recommendations.push('Gradually increase session length');
  } else {
    insights.push('Established solid practice foundation');
    recommendations.push('Focus on quality over quantity');
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

// ✅ FIXED: Main hook with progressive onboarding integration
export const useHappinessCalculation = (): UseHappinessCalculationReturn => {
  const { 
    practiceSessions,
    emotionalNotes,
    getQuestionnaire,
    getSelfAssessment
  } = useLocalData();

  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 0, // ✅ FIXED: Start with 0 instead of 15
    user_level: 'New User',
    focus_ability: 0,
    habit_change_score: 0,
    practice_streak: 0,
    breakdown: null,
    pahmAnalysis: null,
    hasMinimumData: false,
    dataCompleteness: {
      questionnaire: false,
      selfAssessment: false,
      practiceSessions: false,
      sufficientForCalculation: false
    }
  });

  const [componentBreakdown, setComponentBreakdown] = useState<ComponentBreakdown | null>(null);
  const [calculationDebugInfo, setCalculationDebugInfo] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Get questionnaire and self-assessment data
  const questionnaire = useMemo(() => getQuestionnaire(), [getQuestionnaire]);
  const selfAssessment = useMemo(() => getSelfAssessment(), [getSelfAssessment]);

  // Extract numeric scores from calculation results
  const extractNumericScore = useCallback((result: ComponentResult): number => {
    if (typeof result === 'number') {
      return result;
    }
    
    if (result && typeof result === 'object') {
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

  // ✅ FIXED: Main calculation with data validation
  const calculateHappinessScore = useCallback(() => {
    setIsCalculating(true);
    
    try {
      const sessions = practiceSessions || [];
      const notes = emotionalNotes || [];
      
      // ✅ Check if we have minimum data for calculation
      const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, sessions);
      
      // ✅ Calculate data completeness
      const dataCompleteness = {
        questionnaire: !!(questionnaire?.completed || questionnaire?.responses),
        selfAssessment: !!(selfAssessment?.completed),
        practiceSessions: sessions.length > 0,
        sufficientForCalculation: hasMinimumData
      };
      
      // ✅ If insufficient data, return early with guidance
      if (!hasMinimumData) {
        const result: UserProgress = {
          happiness_points: 0,
          user_level: 'New User',
          focus_ability: 0,
          habit_change_score: 0,
          practice_streak: 0,
          breakdown: null,
          pahmAnalysis: null,
          hasMinimumData: false,
          dataCompleteness
        };
        
        setUserProgress(result);
        setComponentBreakdown(null);
        setIsCalculating(false);
        return;
      }
      
      // ✅ Calculate components with data validation
      const currentMoodResult = calculateCurrentMoodState(questionnaire, notes, hasMinimumData);
      const currentMoodScore = extractNumericScore(currentMoodResult);
      
      const attachmentResult = calculateAttachmentFlexibility(selfAssessment, hasMinimumData);
      const attachmentScore = extractNumericScore(attachmentResult);
      
      const socialResult = calculateSocialConnection(questionnaire, hasMinimumData);
      const socialScore = extractNumericScore(socialResult);
      
      const emotionalStabilityResult = calculateEmotionalStabilityProgress(sessions, questionnaire, hasMinimumData);
      const emotionalStabilityScore = extractNumericScore(emotionalStabilityResult);
      
      const mindRecoveryResult = calculateMindRecoveryEffectiveness(sessions, hasMinimumData);
      const mindRecoveryScore = extractNumericScore(mindRecoveryResult);
      
      const emotionalRegulationResult = calculateEmotionalRegulation(sessions, questionnaire, hasMinimumData);
      const emotionalRegulationScore = extractNumericScore(emotionalRegulationResult);
      
      const practiceConsistencyResult = calculatePracticeConsistency(sessions, hasMinimumData);
      const practiceConsistencyScore = extractNumericScore(practiceConsistencyResult);
      
      const pahmResult = calculatePAHMCentralDevelopment(sessions, questionnaire, hasMinimumData);
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

      // ✅ PAHM-Centered Weighted Calculation
      const weightedScore = Math.round(
        (pahmScore * 0.30) +
        (emotionalStabilityScore * 0.20) +
        (currentMoodScore * 0.15) +
        (mindRecoveryScore * 0.12) +
        (emotionalRegulationScore * 0.10) +
        (attachmentScore * 0.08) +
        (socialScore * 0.03) +
        (practiceConsistencyScore * 0.02)
      );

      // Determine user level
      let userLevel = 'New User';
      if (weightedScore >= 80) userLevel = 'Master Practitioner';
      else if (weightedScore >= 65) userLevel = 'Advanced Practitioner';
      else if (weightedScore >= 45) userLevel = 'Developing Practitioner';
      else if (weightedScore >= 25) userLevel = 'Emerging Practitioner';
      else if (weightedScore >= 10) userLevel = 'Beginner';

      // Create PAHM analysis
      let pahmAnalysis: PAHMAnalysis | null = null;
      if (typeof pahmResult === 'object' && pahmResult !== null) {
        pahmAnalysis = {
          presentMomentRatio: pahmResult.presentMomentRatio || 0,
          presentNeutralRatio: pahmResult.presentNeutralRatio || 0,
          neutralRatio: pahmResult.neutralRatio || pahmResult.presentNeutralRatio || 0,
          overallPAHMScore: pahmScore,
          developmentStage: pahmResult.developmentStage || 'Data Collection Needed',
          stageDescription: pahmResult.stageDescription || 'Complete more data collection',
          progressionPath: pahmResult.progressionPath || 'Begin your journey',
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

      // Create result
      const result: UserProgress = {
        happiness_points: weightedScore,
        user_level: userLevel,
        focus_ability: focusAbility,
        habit_change_score: habitChangeScore,
        practice_streak: practiceStreak,
        breakdown: breakdown,
        pahmAnalysis: pahmAnalysis,
        hasMinimumData: true,
        dataCompleteness
      };

      setUserProgress(result);

      // Save to localStorage
      localStorage.setItem('happiness_points', weightedScore.toString());
      localStorage.setItem('user_level', userLevel);
      localStorage.setItem('focus_ability', focusAbility.toString());
      localStorage.setItem('habit_change_score', habitChangeScore.toString());
      localStorage.setItem('practice_streak', practiceStreak.toString());

      // Emit event
      const event = new CustomEvent('happinessUpdated', {
        detail: {
          happiness_points: weightedScore,
          user_level: userLevel,
          breakdown: breakdown,
          pahmAnalysis: pahmAnalysis,
          hasMinimumData: true
        }
      });
      window.dispatchEvent(event);

    } catch (error) {
      console.error('Error calculating happiness score:', error);
      setUserProgress({
        happiness_points: 0,
        user_level: 'New User',
        focus_ability: 0,
        habit_change_score: 0,
        practice_streak: 0,
        breakdown: null,
        pahmAnalysis: null,
        hasMinimumData: false,
        dataCompleteness: {
          questionnaire: false,
          selfAssessment: false,
          practiceSessions: false,
          sufficientForCalculation: false
        }
      });
    } finally {
      setIsCalculating(false);
    }
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, extractNumericScore]);

  // Debug functions
  const debugCalculation = useCallback(() => {
    const debugInfo = {
      questionnaire: questionnaire ? 'Available' : 'Missing',
      selfAssessment: selfAssessment ? 'Available' : 'Missing',
      practiceSessions: practiceSessions?.length || 0,
      emotionalNotes: emotionalNotes?.length || 0,
      hasMinimumData: hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []),
      currentResults: userProgress
    };
    
    setCalculationDebugInfo(debugInfo);
    console.log('🔍 Happiness Calculation Debug:', debugInfo);
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, userProgress]);

  const logProgress = useCallback(() => {
    console.log('📊 Current Progress:', userProgress);
    console.log('📊 Component Breakdown:', componentBreakdown);
  }, [userProgress, componentBreakdown]);

  const testComponents = useCallback(() => {
    console.log('🧪 Testing Components...');
    const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []);
    console.log('Has minimum data:', hasMinimumData);
  }, [questionnaire, selfAssessment, practiceSessions]);

  // Auto-calculate when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateHappinessScore();
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [calculateHappinessScore]);

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