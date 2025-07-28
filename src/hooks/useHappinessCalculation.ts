// ✅ FIXED useHappinessCalculation.ts - All newcomers are seekers
// File: src/hooks/useHappinessCalculation.ts

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalDataCompat as useLocalData } from './useLocalDataCompat';

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
  hasMinimumData: boolean;
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
  forceRecalculation: () => void;
  debugCalculation: () => void;
  logProgress: () => void;
  testComponents: () => void;
}

// ✅ FIXED: Much more flexible data detection logic
const hasMinimumDataForCalculation = (
  questionnaire: any,
  selfAssessment: any,
  sessions: any[]
): boolean => {
  console.log('🔍 Detailed Data Check:');
  console.log('📋 Questionnaire:', {
    exists: !!questionnaire,
    completed: questionnaire?.completed,
    hasResponses: !!questionnaire?.responses,
    responseCount: questionnaire?.responses ? Object.keys(questionnaire.responses).length : 0
  });
  
  console.log('🎯 Self-Assessment:', {
    exists: !!selfAssessment,
    completed: selfAssessment?.completed,
    hasResponses: !!selfAssessment?.responses,
    hasCategories: !!selfAssessment?.categories,
    hasAttachmentScore: selfAssessment?.attachmentScore !== undefined,
    hasNonAttachmentCount: selfAssessment?.nonAttachmentCount !== undefined,
    attachmentScore: selfAssessment?.attachmentScore,
    nonAttachmentCount: selfAssessment?.nonAttachmentCount,
    dataKeys: selfAssessment ? Object.keys(selfAssessment) : []
  });
  
  console.log('🧘 Sessions:', {
    count: sessions?.length || 0,
    hasSessions: Array.isArray(sessions) && sessions.length > 0
  });
  
  // ✅ FIXED: Much more flexible detection
  const hasQuestionnaire = !!(
    questionnaire?.completed || 
    questionnaire?.responses ||
    (questionnaire && Object.keys(questionnaire).length > 3)
  );
  
  // ✅ FIXED: Comprehensive self-assessment detection
  const hasSelfAssessment = !!(
    selfAssessment?.completed || 
    selfAssessment?.responses || 
    selfAssessment?.categories ||
    selfAssessment?.attachmentScore !== undefined ||
    selfAssessment?.nonAttachmentCount !== undefined ||
    selfAssessment?.taste ||
    selfAssessment?.smell ||
    selfAssessment?.sound ||
    selfAssessment?.sight ||
    selfAssessment?.touch ||
    selfAssessment?.mind ||
    (selfAssessment && typeof selfAssessment === 'object' && Object.keys(selfAssessment).length > 3)
  );
  
  const hasMinimumSessions = Array.isArray(sessions) && sessions.length >= 3;
  const hasAnySessions = Array.isArray(sessions) && sessions.length >= 1;
  
  // ✅ FIXED: More generous requirements - any meaningful data allows calculation
  const sufficient = (
    hasSelfAssessment || // Self-assessment alone is enough!
    hasQuestionnaire || // Questionnaire alone is enough!
    hasMinimumSessions || // 3+ sessions alone is enough!
    (hasQuestionnaire && hasAnySessions) // Questionnaire + any session
  );
  
  console.log('✅ Requirements Check:', {
    hasQuestionnaire,
    hasSelfAssessment,
    hasMinimumSessions,
    hasAnySessions,
    sufficient
  });
  
  // ✅ FIXED: If we have self-assessment, always allow calculation!
  if (hasSelfAssessment) {
    console.log('🎯 Self-assessment detected - calculation enabled!');
    return true;
  }
  
  return sufficient;
};

// ✅ CURRENT STATE EVALUATION through questionnaire and self-assessment
const calculateCurrentMoodState = (questionnaire: any, notes: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData) {
    return { currentMoodScore: 0 }; // No baseline without data
  }
  
  let moodScore = 0; // Start from zero - calculate actual current state
  
  // Questionnaire-based current state evaluation
  if (questionnaire?.responses) {
    // Sleep quality impact (current wellbeing)
    const sleepPattern = questionnaire.responses.sleep_pattern;
    if (sleepPattern >= 8) {
      moodScore += 25;
    } else if (sleepPattern >= 6) {
      moodScore += 15;
    } else if (sleepPattern >= 5) {
      moodScore += 5;
    }
    
    // Physical activity impact (current energy)
    if (questionnaire.responses.physical_activity === "Very_active") {
      moodScore += 15;
    } else if (questionnaire.responses.physical_activity === "moderate") {
      moodScore += 8;
    }
    
    // Work-life balance (current stress level)
    if (questionnaire.responses.work_life_balance && 
        questionnaire.responses.work_life_balance.includes("good")) {
      moodScore += 10;
    }
    
    // Current emotional awareness level
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 7) {
      moodScore += 15;
    } else if (emotionalAwareness >= 5) {
      moodScore += 8;
    } else if (emotionalAwareness >= 3) {
      moodScore += 3;
    }
  }
  
  // Factor in recent emotional notes (current mood tracking)
  if (notes && notes.length > 0) {
    const recentNotes = notes.slice(-5);
    const avgMood = recentNotes.reduce((sum, note) => {
      return sum + (note.mood || 5);
    }, 0) / recentNotes.length;
    moodScore = (moodScore * 0.7) + (avgMood * 10 * 0.3);
  }
  
  return { currentMoodScore: Math.max(0, Math.min(100, Math.round(moodScore))) };
};

// ✅ REAL ASSESSMENT: Calculate attachment score from responses
const calculateAttachmentFlexibility = (selfAssessment: any, hasMinimumData: boolean): ComponentResult => {
  console.log('🎯 Calculating attachment flexibility with:', {
    selfAssessment: !!selfAssessment,
    hasMinimumData,
    completed: selfAssessment?.completed,
    attachmentScore: selfAssessment?.attachmentScore,
    nonAttachmentCount: selfAssessment?.nonAttachmentCount
  });
  
  if (!hasMinimumData) {
    return { flexibilityScore: 0 };
  }
  
  // ✅ Real assessment: Check if self-assessment data exists
  const hasSelfAssessmentData = !!(
    selfAssessment?.completed || 
    selfAssessment?.responses || 
    selfAssessment?.categories ||
    selfAssessment?.attachmentScore !== undefined ||
    selfAssessment?.nonAttachmentCount !== undefined ||
    selfAssessment?.taste ||
    (selfAssessment && typeof selfAssessment === 'object')
  );
  
  if (!hasSelfAssessmentData) {
    return { flexibilityScore: 0 };
  }
  
  // ✅ Extract or calculate attachment metrics from responses
  let attachmentScore = selfAssessment.attachmentScore || 0;
  let nonAttachmentCount = selfAssessment.nonAttachmentCount || 
                          selfAssessment.nonAttachmentCategories || 0;
  
  // ✅ Calculate from individual sense responses if not pre-calculated
  if (attachmentScore === 0 && (selfAssessment.categories || selfAssessment.responses)) {
    const categories = selfAssessment.categories || selfAssessment.responses || selfAssessment;
    const senseCategories = ['taste', 'smell', 'sound', 'sight', 'touch', 'mind'];
    
    let calculatedScore = 0;
    let calculatedNonAttachment = 0;
    
    senseCategories.forEach(category => {
      const value = categories[category];
      const level = typeof value === 'object' ? value.level : value;
      
      if (level === 'none') {
        calculatedNonAttachment++;
        calculatedScore -= 5; // None = low attachment (good)
      } else if (level === 'some') {
        calculatedScore += 0; // Some = neutral  
      } else if (level === 'strong') {
        calculatedScore += 5; // Strong = high attachment (needs work)
      }
    });
    
    if (attachmentScore === 0) attachmentScore = calculatedScore;
    if (nonAttachmentCount === 0) nonAttachmentCount = calculatedNonAttachment;
    
    console.log('🧮 Calculated attachment scores:', { attachmentScore, nonAttachmentCount });
  }
  
  // ✅ REAL CALCULATION: Convert attachment patterns to flexibility score
  let flexibilityScore = 50; // Start neutral
  
  // Lower attachment score = higher flexibility
  if (attachmentScore <= -15) flexibilityScore = 85; // Very low attachment
  else if (attachmentScore <= -10) flexibilityScore = 75;
  else if (attachmentScore <= -5) flexibilityScore = 65;
  else if (attachmentScore <= 0) flexibilityScore = 55;
  else if (attachmentScore <= 5) flexibilityScore = 45;
  else if (attachmentScore <= 10) flexibilityScore = 35;
  else flexibilityScore = 25; // High attachment
  
  // Bonus for non-attachment categories (0-6 range)
  flexibilityScore += (nonAttachmentCount / 6) * 15;
  
  const finalScore = Math.max(0, Math.min(100, Math.round(flexibilityScore)));
  
  console.log('✅ Attachment flexibility calculated:', {
    attachmentScore,
    nonAttachmentCount,
    flexibilityScore: finalScore
  });
  
  return { flexibilityScore: finalScore };
};

// ✅ QUESTIONNAIRE-BASED: Social connection evaluation
const calculateSocialConnection = (questionnaire: any, hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !questionnaire?.responses) {
    return { connectionScore: 0 };
  }
  
  const responses = questionnaire.responses;
  let connectionScore = 0;
  
  // Evaluate actual social connections response
  if (responses.social_connections) {
    if (responses.social_connections.includes("Deep") || 
        responses.social_connections.includes("meaningful")) {
      connectionScore = 80;
    } else if (responses.social_connections.includes("good") || 
               responses.social_connections.includes("Good")) {
      connectionScore = 60;
    } else if (responses.social_connections.includes("average")) {
      connectionScore = 40;
    } else if (responses.social_connections.includes("limited")) {
      connectionScore = 20;
    }
  }
  
  // Work-life balance influence
  if (responses.work_life_balance && 
      responses.work_life_balance.includes("good")) {
    connectionScore += 8;
  }
  
  // Motivation factor (service to others)
  if (responses.motivation && 
      (responses.motivation.includes("others") || 
       responses.motivation.includes("spiritual"))) {
    connectionScore += 10;
  }
  
  return { connectionScore: Math.max(0, Math.min(100, Math.round(connectionScore))) };
};

// ✅ QUESTIONNAIRE + SESSIONS: Emotional stability assessment
const calculateEmotionalStabilityProgress = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { stabilityScore: 0 };
  }
  
  let stabilityScore = 0;
  
  // Primary assessment from questionnaire emotional awareness
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 9) {
      stabilityScore = 70;
    } else if (emotionalAwareness >= 7) {
      stabilityScore = 55;
    } else if (emotionalAwareness >= 5) {
      stabilityScore = 40;
    } else if (emotionalAwareness >= 3) {
      stabilityScore = 25;
    }
    
    // Stress response assessment
    if (questionnaire.responses.stress_response && 
        (questionnaire.responses.stress_response.includes("manage") ||
         questionnaire.responses.stress_response.includes("well"))) {
      stabilityScore += 10;
    }
    
    // Thought patterns assessment
    if (questionnaire.responses.thought_patterns && 
        (questionnaire.responses.thought_patterns.includes("Peaceful") ||
         questionnaire.responses.thought_patterns.includes("accepting"))) {
      stabilityScore += 8;
    }
  }
  
  // Practice enhancement (secondary)
  if (sessions && sessions.length > 0) {
    const recentSessions = sessions.slice(-10);
    if (recentSessions.length >= 5) {
      stabilityScore += 12;
    } else if (recentSessions.length >= 2) {
      stabilityScore += 6;
    }
    
    const avgQuality = recentSessions.reduce((sum, session) => {
      return sum + (session.quality || session.rating || 3);
    }, 0) / recentSessions.length;
    
    stabilityScore += avgQuality * 2.5;
  }
  
  return { stabilityScore: Math.max(0, Math.min(100, Math.round(stabilityScore))) };
};

// ✅ PRACTICE-BASED: Mind recovery from sessions
const calculateMindRecoveryEffectiveness = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData) {
    return { recoveryScore: 0 };
  }
  
  if (!sessions || sessions.length === 0) {
    return { recoveryScore: 0 }; // No practice = no recovery score
  }
  
  let recoveryScore = 0;
  
  // Factor in session frequency and duration
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgDuration = totalDuration / sessions.length;
  
  if (avgDuration >= 20) recoveryScore += 35;
  else if (avgDuration >= 15) recoveryScore += 25;
  else if (avgDuration >= 10) recoveryScore += 20;
  else if (avgDuration >= 5) recoveryScore += 15;
  
  // Consistency factor
  if (sessions.length >= 15) recoveryScore += 25;
  else if (sessions.length >= 10) recoveryScore += 20;
  else if (sessions.length >= 5) recoveryScore += 15;
  else if (sessions.length >= 1) recoveryScore += 10;
  
  // Quality factor
  const avgQuality = sessions.reduce((sum, session) => 
    sum + (session.quality || session.rating || 3), 0) / sessions.length;
  recoveryScore += avgQuality * 4;
  
  return { recoveryScore: Math.max(0, Math.min(100, Math.round(recoveryScore))) };
};

// ✅ QUESTIONNAIRE-BASED: Emotional regulation from awareness
const calculateEmotionalRegulation = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { regulationScore: 0 };
  }
  
  let regulationScore = 0;
  
  // Primary scoring from questionnaire emotional awareness
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness;
    if (emotionalAwareness >= 9) {
      regulationScore = 75;
    } else if (emotionalAwareness >= 7) {
      regulationScore = 60;
    } else if (emotionalAwareness >= 5) {
      regulationScore = 45;
    } else if (emotionalAwareness >= 3) {
      regulationScore = 30;
    }
    
    // Decision making assessment
    if (questionnaire.responses.decision_making && 
        questionnaire.responses.decision_making.includes("mindful")) {
      regulationScore += 8;
    }
    
    // Mindfulness in daily life
    if (questionnaire.responses.mindfulness_in_daily_life && 
        questionnaire.responses.mindfulness_in_daily_life.includes("aware")) {
      regulationScore += 5;
    }
  }
  
  // Practice enhancement (secondary)
  if (sessions && sessions.length > 0) {
    const practiceWeeks = Math.floor(sessions.length / 3);
    regulationScore += Math.min(12, practiceWeeks * 2);
    
    const qualitySessions = sessions.filter(session => (session.quality || session.rating || 0) >= 4);
    if (qualitySessions.length > 0) {
      regulationScore += (qualitySessions.length / sessions.length) * 10;
    }
  }
  
  return { regulationScore: Math.max(0, Math.min(100, Math.round(regulationScore))) };
};

// ✅ PRACTICE-BASED: Consistency from sessions
const calculatePracticeConsistency = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData) {
    return { consistencyScore: 0 };
  }
  
  if (!sessions || sessions.length === 0) {
    return { consistencyScore: 0 }; // No practice = no consistency
  }
  
  let consistencyScore = 0;
  
  // Frequency calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentSessions = sessions.filter(session => 
    new Date(session.timestamp) > thirtyDaysAgo
  );
  
  if (recentSessions.length >= 20) consistencyScore += 60;
  else if (recentSessions.length >= 15) consistencyScore += 50;
  else if (recentSessions.length >= 10) consistencyScore += 40;
  else if (recentSessions.length >= 5) consistencyScore += 30;
  else if (recentSessions.length >= 1) consistencyScore += 20;
  
  // Streak calculation
  const currentStreak = calculateSessionStreak(sessions);
  if (currentStreak >= 7) consistencyScore += 25;
  else if (currentStreak >= 3) consistencyScore += 15;
  else if (currentStreak >= 1) consistencyScore += 10;
  
  return { consistencyScore: Math.max(0, Math.min(100, Math.round(consistencyScore))) };
};

// ✅ PAHM DEVELOPMENT: Based on questionnaire experience + practice
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
      developmentStage: 'Seeker',
      stageDescription: 'Beginning awareness journey',
      progressionPath: 'Complete questionnaire and self-assessment',
      insights: ['Starting your seeker journey'],
      recommendations: ['Complete the questionnaire', 'Begin practice sessions'],
      breakdown: {
        presentNeutralMastery: 0,
        presentMomentDevelopment: 0,
        therapeuticProgress: 0,
        sessionQuality: 0
      }
    };
  }
  
  let baselinePAHMScore = 0; // Start from actual assessment
  
  // Baseline from questionnaire experience and mindfulness
  if (questionnaire?.responses) {
    const experienceLevel = questionnaire.responses.experience_level;
    const mindfulnessExperience = questionnaire.responses.mindfulness_experience;
    
    if (experienceLevel >= 8) {
      baselinePAHMScore = 35;
    } else if (experienceLevel >= 6) {
      baselinePAHMScore = 25;
    } else if (experienceLevel >= 4) {
      baselinePAHMScore = 15;
    }
    
    if (mindfulnessExperience >= 9) {
      baselinePAHMScore += 10;
    } else if (mindfulnessExperience >= 7) {
      baselinePAHMScore += 6;
    } else if (mindfulnessExperience >= 5) {
      baselinePAHMScore += 3;
    }
  }
  
  // If no practice sessions, return questionnaire-based assessment
  if (!sessions || sessions.length === 0) {
    return {
      overallPAHMScore: baselinePAHMScore,
      presentMomentRatio: Math.min(1, baselinePAHMScore / 50),
      presentNeutralRatio: Math.min(1, baselinePAHMScore / 60),
      developmentStage: baselinePAHMScore >= 30 ? 'Experienced Seeker' : 
                       baselinePAHMScore >= 15 ? 'Awakening Seeker' : 'Seeker',
      stageDescription: 'Assessment based on stated experience level',
      progressionPath: 'Begin practice sessions to develop actual skills',
      insights: ['Assessment based on questionnaire responses', 'Practice sessions will improve accuracy'],
      recommendations: ['Start daily practice sessions', 'Begin with shorter durations', 'Focus on consistency'],
      breakdown: {
        presentNeutralMastery: Math.round(baselinePAHMScore * 0.4),
        presentMomentDevelopment: Math.round(baselinePAHMScore * 0.4),
        therapeuticProgress: Math.round(baselinePAHMScore * 0.2),
        sessionQuality: 0
      }
    };
  }
  
  // Calculate with practice sessions
  const totalSessions = sessions.length;
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgQuality = sessions.reduce((sum, session) => sum + (session.quality || session.rating || 3), 0) / totalSessions;
  
  // Present Moment Development (0-40 points)
  let presentMomentDev = Math.min(40, totalSessions * 2.5);
  if (totalDuration > 300) presentMomentDev += 8;
  if (totalDuration > 500) presentMomentDev += 5;
  
  // Present-Neutral Mastery (0-45 points)
  let presentNeutralMastery = baselinePAHMScore * 0.3; // Start with baseline
  if (totalSessions >= 10) presentNeutralMastery += 10;
  if (totalSessions >= 20) presentNeutralMastery += 10;
  if (totalSessions >= 50) presentNeutralMastery += 10;
  if (avgQuality >= 4) presentNeutralMastery += 15;
  
  // Therapeutic Progress (0-15 points)
  let therapeuticProgress = Math.min(15, Math.floor(totalSessions / 2) * 1.5);
  
  // Session Quality (0-10 points)
  let sessionQuality = Math.min(10, avgQuality * 2);
  
  const overallPAHMScore = Math.round(presentNeutralMastery + presentMomentDev + therapeuticProgress + sessionQuality);
  
  // ✅ SEEKER-BASED STAGES
  let developmentStage = 'Seeker';
  let stageDescription = 'Beginning awareness journey';
  let progressionPath = 'Build consistent practice routine';
  
  if (overallPAHMScore >= 80) {
    developmentStage = 'Enlightened Seeker';
    stageDescription = 'Consistent present-moment awareness with neutral observation';
    progressionPath = 'Deepen equanimity and effortless presence';
  } else if (overallPAHMScore >= 65) {
    developmentStage = 'Advanced Seeker';
    stageDescription = 'Regular moments of present awareness with growing stability';
    progressionPath = 'Strengthen neutral observation and reduce reactivity';
  } else if (overallPAHMScore >= 45) {
    developmentStage = 'Progressing Seeker';
    stageDescription = 'Beginning to notice mind wandering and returning attention';
    progressionPath = 'Build consistency and extend present moments';
  } else if (overallPAHMScore >= 25) {
    developmentStage = 'Awakening Seeker';
    stageDescription = 'Starting to recognize patterns of mental activity';
    progressionPath = 'Develop mindful observation skills';
  }
  
  // Generate insights and recommendations
  const insights = [];
  const recommendations = [];
  
  if (totalSessions < 5) {
    insights.push('Building foundation of present attention practice');
    recommendations.push('Aim for daily 5-10 minute sessions');
  } else if (totalSessions < 15) {
    insights.push('Developing consistent practice routine');
    recommendations.push('Gradually increase session length');
  } else if (totalSessions < 30) {
    insights.push('Establishing solid practice foundation');
    recommendations.push('Focus on quality over quantity');
  } else {
    insights.push('Well-established practice foundation');
    recommendations.push('Explore advanced techniques');
  }
  
  if (avgQuality < 3.5) {
    recommendations.push('Try shorter sessions for better quality');
  } else if (avgQuality >= 4.5) {
    insights.push('Excellent session quality maintained');
  }
  
  return {
    overallPAHMScore,
    presentMomentRatio: Math.min(1, totalSessions / 50),
    presentNeutralRatio: Math.min(1, presentNeutralMastery / 45),
    developmentStage,
    stageDescription,
    progressionPath,
    insights,
    recommendations,
    breakdown: {
      presentNeutralMastery: Math.round(presentNeutralMastery),
      presentMomentDevelopment: Math.round(presentMomentDev),
      therapeuticProgress: Math.round(therapeuticProgress),
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

// ✅ FIXED: Main hook with improved data detection and immediate calculation
export const useHappinessCalculation = (): UseHappinessCalculationReturn => {
  const { 
    practiceSessions,
    emotionalNotes,
    getQuestionnaire,
    getSelfAssessment
  } = useLocalData();

  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 0,
    user_level: 'Seeker', // ✅ All newcomers are seekers
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
  const [recalculationTrigger, setRecalculationTrigger] = useState(0);

  // Get questionnaire and self-assessment data with refresh trigger
  const questionnaire = useMemo(() => {
    const data = getQuestionnaire();
    console.log('📋 Questionnaire data:', data);
    return data;
  }, [getQuestionnaire, recalculationTrigger]);
  
  const selfAssessment = useMemo(() => {
    const data = getSelfAssessment();
    console.log('🎯 Self-assessment data:', data);
    return data;
  }, [getSelfAssessment, recalculationTrigger]);

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

  // ✅ CURRENT STATE EVALUATION: Calculate happiness based on questionnaire + self-assessment
  const calculateHappinessScore = useCallback(() => {
    setIsCalculating(true);
    
    try {
      const sessions = practiceSessions || [];
      const notes = emotionalNotes || [];
      
      console.log('🔄 Starting happiness calculation...');
      console.log('📊 Input data summary:', {
        questionnaire: !!questionnaire,
        selfAssessment: !!selfAssessment,
        sessionCount: sessions.length,
        notesCount: notes.length,
        trigger: recalculationTrigger
      });
      
      // Check if we have minimum data for calculation
      const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, sessions);
      
      // Calculate data completeness
      const dataCompleteness = {
        questionnaire: !!(questionnaire?.completed || questionnaire?.responses),
        selfAssessment: !!(selfAssessment?.completed || 
                          selfAssessment?.responses || 
                          selfAssessment?.categories ||
                          selfAssessment?.attachmentScore !== undefined ||
                          selfAssessment?.nonAttachmentCount !== undefined ||
                          selfAssessment?.taste),
        practiceSessions: sessions.length > 0,
        sufficientForCalculation: hasMinimumData
      };
      
      console.log('✅ Data completeness check:', dataCompleteness);
      
      // ✅ REAL EVALUATION: Calculate components based on actual data
      console.log('🧮 Calculating components...');
      
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

      console.log('🎯 Component scores calculated:', {
        currentMoodScore,
        attachmentScore,
        socialScore,
        emotionalStabilityScore,
        mindRecoveryScore,
        emotionalRegulationScore,
        practiceConsistencyScore,
        pahmScore
      });

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

      // ✅ COMPREHENSIVE WEIGHTED CALCULATION
      const weightedScore = Math.round(
        (pahmScore * 0.25) +
        (attachmentScore * 0.20) +  // Self-assessment gets high weight
        (emotionalStabilityScore * 0.18) +
        (currentMoodScore * 0.12) +
        (emotionalRegulationScore * 0.10) +
        (mindRecoveryScore * 0.08) +
        (socialScore * 0.04) +
        (practiceConsistencyScore * 0.03)
      );

      console.log('🎯 Final weighted score:', weightedScore);

      // ✅ SEEKER-BASED USER LEVELS
      let userLevel = 'Seeker'; // All newcomers are seekers
      if (weightedScore >= 80) userLevel = 'Enlightened Seeker';
      else if (weightedScore >= 65) userLevel = 'Advanced Seeker';
      else if (weightedScore >= 50) userLevel = 'Progressing Seeker';
      else if (weightedScore >= 35) userLevel = 'Awakening Seeker';
      else if (weightedScore >= 20) userLevel = 'Active Seeker';

      // Create PAHM analysis
      let pahmAnalysis: PAHMAnalysis | null = null;
      if (typeof pahmResult === 'object' && pahmResult !== null) {
        pahmAnalysis = {
          presentMomentRatio: pahmResult.presentMomentRatio || 0,
          presentNeutralRatio: pahmResult.presentNeutralRatio || 0,
          neutralRatio: pahmResult.neutralRatio || pahmResult.presentNeutralRatio || 0,
          overallPAHMScore: pahmScore,
          developmentStage: pahmResult.developmentStage || 'Seeker',
          stageDescription: pahmResult.stageDescription || 'Beginning your seeker journey',
          progressionPath: pahmResult.progressionPath || 'Continue practicing',
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
        hasMinimumData: hasMinimumData,
        dataCompleteness
      };

      setUserProgress(result);

      // Save to localStorage for other components
      localStorage.setItem('happiness_points', weightedScore.toString());
      localStorage.setItem('user_level', userLevel);
      localStorage.setItem('focus_ability', focusAbility.toString());
      localStorage.setItem('habit_change_score', habitChangeScore.toString());
      localStorage.setItem('practice_streak', practiceStreak.toString());
      localStorage.setItem('lastHappinessUpdate', new Date().toISOString());

      // Emit detailed event
      const event = new CustomEvent('happinessUpdated', {
        detail: {
          happiness_points: weightedScore,
          user_level: userLevel,
          breakdown: breakdown,
          pahmAnalysis: pahmAnalysis,
          hasMinimumData: hasMinimumData,
          dataCompleteness: dataCompleteness,
          calculatedAt: new Date().toISOString(),
          trigger: 'calculation'
        }
      });
      window.dispatchEvent(event);

      console.log('✅ Happiness calculation completed successfully:', {
        happiness_points: weightedScore,
        user_level: userLevel,
        hasMinimumData: hasMinimumData
      });

    } catch (error) {
      console.error('❌ Error calculating happiness score:', error);
      // Set fallback state
      setUserProgress({
        happiness_points: 0,
        user_level: 'Seeker', // Even errors default to seeker
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
  }, [
    questionnaire,
    selfAssessment,
    practiceSessions,
    emotionalNotes,
    extractNumericScore,
    recalculationTrigger
  ]);

  // Force recalculation function
  const forceRecalculation = useCallback(() => {
    console.log('🔄 Force recalculation triggered');
    setRecalculationTrigger(prev => prev + 1);
    setTimeout(() => {
      calculateHappinessScore();
    }, 100);
  }, [calculateHappinessScore]);

  // Debug functions
  const debugCalculation = useCallback(() => {
    const debugInfo = {
      questionnaire: questionnaire ? 'Available' : 'Missing',
      selfAssessment: selfAssessment ? 'Available' : 'Missing',
      practiceSessions: practiceSessions?.length || 0,
      emotionalNotes: emotionalNotes?.length || 0,
      hasMinimumData: hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []),
      currentResults: userProgress,
      recalculationTrigger,
      questionnaire_data: questionnaire,
      selfAssessment_data: selfAssessment
    };
    
    setCalculationDebugInfo(debugInfo);
    console.log('🔍 Happiness Calculation Debug:', debugInfo);
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, userProgress, recalculationTrigger]);

  const logProgress = useCallback(() => {
    console.log('📊 Current Progress:', userProgress);
    console.log('📊 Component Breakdown:', componentBreakdown);
  }, [userProgress, componentBreakdown]);

  const testComponents = useCallback(() => {
    console.log('🧪 Testing Components...');
    const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []);
    console.log('Has minimum data:', hasMinimumData);
    debugCalculation();
  }, [questionnaire, selfAssessment, practiceSessions, debugCalculation]);

  // Auto-calculate when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateHappinessScore();
    }, 250); // Slightly longer delay for stability
    
    return () => clearTimeout(timeoutId);
  }, [calculateHappinessScore]);

  // Listen for events to trigger recalculation
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selfAssessment' || 
          e.key === 'questionnaire' || 
          e.key === 'onboardingData' ||
          e.key === 'lastAssessmentUpdate' ||
          e.key?.includes('assessment') ||
          e.key?.includes('questionnaire')) {
        console.log('🔄 Storage change detected, forcing recalculation:', e.key);
        forceRecalculation();
      }
    };

    const handleOnboardingEvent = (event: any) => {
      console.log('🎯 Received onboarding completion event:', event.detail);
      if (event.detail.type === 'selfAssessment' || event.detail.type === 'questionnaire') {
        console.log('🔄 Onboarding event triggered recalculation');
        forceRecalculation();
      }
    };

    const handleHappinessRecalculation = (event: any) => {
      console.log('🚀 Direct happiness recalculation trigger:', event.detail);
      forceRecalculation();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('onboardingUpdated', handleOnboardingEvent);
    window.addEventListener('selfAssessmentCompleted', handleOnboardingEvent);
    window.addEventListener('questionnaireCompleted', handleOnboardingEvent);
    window.addEventListener('triggerHappinessRecalculation', handleHappinessRecalculation);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('onboardingUpdated', handleOnboardingEvent);
      window.removeEventListener('selfAssessmentCompleted', handleOnboardingEvent);
      window.removeEventListener('questionnaireCompleted', handleOnboardingEvent);
      window.removeEventListener('triggerHappinessRecalculation', handleHappinessRecalculation);
    };
  }, [forceRecalculation]);

  return useMemo(() => ({
    userProgress,
    componentBreakdown,
    calculationDebugInfo,
    isCalculating,
    practiceSessions: practiceSessions || [],
    emotionalNotes: emotionalNotes || [],
    questionnaire,
    selfAssessment,
    forceRecalculation,
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
    forceRecalculation,
    debugCalculation,
    logProgress,
    testComponents
  ]);
};