// ✅ FIXED useHappinessCalculation.ts - TRUE SINGLE-POINT Architecture
// File: src/hooks/useHappinessCalculation.ts
// 🎯 SINGLE-POINT: Uses same session counting logic as all other components

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';
import { usePractice } from '../contexts/practice/PracticeContext'; // ✅ SINGLE-POINT: For ALL session data
import { useWellness } from '../contexts/wellness/WellnessContext';

// ✅ PRESERVED: All existing interfaces unchanged
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
  attachmentImpact?: number;
  currentStateScore?: number;
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

// ✅ SINGLE-POINT: Enhanced data detection with session analysis
const hasMinimumDataForCalculation = (
  questionnaire: any,
  selfAssessment: any,
  sessions: any[]
): boolean => {
  console.log('🔍 Single-Point Data Check (Happiness Hook):');
  console.log('📋 Questionnaire:', {
    exists: !!questionnaire,
    completed: questionnaire?.completed,
    hasResponses: !!questionnaire?.responses,
    responseCount: questionnaire?.responses ? Object.keys(questionnaire.responses).length : 0
  });
  
  console.log('🎯 Self-Assessment:', {
    exists: !!selfAssessment,
    completed: selfAssessment?.completed,
    attachmentScore: selfAssessment?.attachmentScore,
    nonAttachmentCount: selfAssessment?.nonAttachmentCount,
    hasCategories: !!selfAssessment?.categories
  });
  
  // ✅ SINGLE-POINT: Use consistent session analysis
  const meditationSessions = sessions ? sessions.filter((s: any) => 
    s.sessionType === 'meditation' && s.completed !== false
  ) : [];
  
  console.log('🧘 Sessions (Single-Point Analysis):', { 
    totalSessions: sessions?.length || 0,
    meditationSessions: meditationSessions.length,
    architecture: 'single-point-v3'
  });
  
  const hasQuestionnaire = !!(
    questionnaire?.completed || 
    questionnaire?.responses ||
    (questionnaire && Object.keys(questionnaire).length > 3)
  );
  
  const hasSelfAssessment = !!(
    selfAssessment?.completed || 
    selfAssessment?.responses || 
    selfAssessment?.categories ||
    selfAssessment?.attachmentScore !== undefined ||
    selfAssessment?.nonAttachmentCount !== undefined ||
    selfAssessment?.taste ||
    (selfAssessment && typeof selfAssessment === 'object' && Object.keys(selfAssessment).length > 3)
  );
  
  const hasMinimumSessions = meditationSessions.length >= 3;
  const hasAnySessions = meditationSessions.length >= 1;
  
  const sufficient = (
    hasSelfAssessment || 
    hasQuestionnaire || 
    hasMinimumSessions || 
    (hasQuestionnaire && hasAnySessions)
  );
  
  console.log('✅ Single-Point Requirements Check:', {
    hasQuestionnaire,
    hasSelfAssessment,
    hasMinimumSessions,
    hasAnySessions,
    sufficient,
    architecture: 'single-point-v3'
  });
  
  return sufficient;
};

// ✅ PRESERVED: Current state calculation (unchanged logic)
const calculateCurrentStateFromAssessment = (questionnaire: any, notes: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !questionnaire?.responses) {
    return { currentMoodScore: 0 };
  }
  
  const responses = questionnaire.responses;
  let currentStateScore = 0;
  
  const emotionalAwareness = responses.emotional_awareness || 1;
  currentStateScore += emotionalAwareness * 8;
  
  const sleepPattern = responses.sleep_pattern || 1;
  currentStateScore += sleepPattern * 6;
  
  const activityMultiplier = {
    'very_active': 25,
    'Very_active': 25,
    'moderate': 15,
    'light': 8,
    'sedentary': 0
  };
  const activityScore = activityMultiplier[responses.physical_activity as keyof typeof activityMultiplier] || 0;
  currentStateScore += activityScore;
  
  if (responses.work_life_balance) {
    if (responses.work_life_balance.includes('Perfect') || responses.work_life_balance.includes('excellent')) {
      currentStateScore += 20;
    } else if (responses.work_life_balance.includes('good') || responses.work_life_balance.includes('generally')) {
      currentStateScore += 12;
    } else if (responses.work_life_balance.includes('struggle') || responses.work_life_balance.includes('difficult')) {
      currentStateScore -= 10;
    }
  }
  
  if (responses.stress_response) {
    if (responses.stress_response.includes('manage well') || responses.stress_response.includes('Observe')) {
      currentStateScore += 15;
    } else if (responses.stress_response.includes('Usually manage')) {
      currentStateScore += 8;
    } else if (responses.stress_response.includes('overwhelmed') || responses.stress_response.includes('Get overwhelmed')) {
      currentStateScore -= 15;
    }
  }
  
  if (notes && notes.length > 0) {
    const recentNotes = notes.slice(-5);
    const avgMood = recentNotes.reduce((sum, note) => sum + (note.mood || 5), 0) / recentNotes.length;
    const moodContribution = (avgMood - 5) * 8;
    currentStateScore += moodContribution;
  }
  
  console.log('📊 Current State Calculation:', {
    emotionalAwareness: emotionalAwareness * 8,
    sleepPattern: sleepPattern * 6,
    activityScore,
    totalCurrentState: Math.max(0, currentStateScore)
  });
  
  return { currentMoodScore: Math.max(0, Math.round(currentStateScore)) };
};

// ✅ PRESERVED: Attachment-based happiness calculation (unchanged logic but cleaner logging)
const calculateAttachmentBasedHappiness = (selfAssessment: any, hasMinimumData: boolean): ComponentResult => {
  console.log('🎯 Single-Point Attachment Calculation:', {
    selfAssessment: !!selfAssessment,
    hasMinimumData,
    attachmentScore: selfAssessment?.attachmentScore,
    nonAttachmentCount: selfAssessment?.nonAttachmentCount,
    architecture: 'single-point-v3'
  });
  
  if (!hasMinimumData) {
    return { flexibilityScore: 0 };
  }
  
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
  
  let attachmentScore = selfAssessment.attachmentScore || 0;
  let nonAttachmentCount = selfAssessment.nonAttachmentCount || 0;
  
  if (attachmentScore === 0 && nonAttachmentCount === 0 && (selfAssessment.categories || selfAssessment.responses)) {
    const categories = selfAssessment.categories || selfAssessment.responses || selfAssessment;
    const senseCategories = ['taste', 'smell', 'sound', 'sight', 'touch', 'mind'];
    
    let calculatedAttachment = 0;
    let calculatedNonAttachment = 0;
    
    console.log('📊 Calculating from individual responses:', categories);
    
    senseCategories.forEach(category => {
      const value = categories[category];
      const level = typeof value === 'object' ? value.level : value;
      
      console.log(`🔍 ${category}: ${level}`);
      
      if (level === 'none') {
        calculatedNonAttachment++;
        console.log(`✅ Non-attachment found in ${category} - will get +12 bonus`);
      } else if (level === 'some') {
        calculatedAttachment -= 7;
        console.log(`⚠️ Some attachment in ${category} - gets -7 penalty`);
      } else if (level === 'strong') {
        calculatedAttachment -= 15;
        console.log(`❌ Strong attachment in ${category} - gets -15 penalty`);
      }
    });
    
    attachmentScore = calculatedAttachment;
    nonAttachmentCount = calculatedNonAttachment;
    
    console.log('📈 Calculated totals:', {
      attachmentScore,
      nonAttachmentCount,
      fromIndividualResponses: true
    });
  }
  
  let finalScore = 0;
  
  finalScore += attachmentScore;
  
  const nonAttachmentBonus = nonAttachmentCount * 12;
  finalScore += nonAttachmentBonus;
  
  console.log('✅ Single-Point Attachment Scoring Breakdown:', {
    attachmentScore: `${attachmentScore} points (${Math.abs(attachmentScore)} penalty)`,
    nonAttachmentCount: `${nonAttachmentCount} categories`,
    nonAttachmentBonus: `+${nonAttachmentBonus} happiness points`,
    finalScore: `${Math.round(finalScore)} total points`,
    calculation: `${attachmentScore} (suffering) + ${nonAttachmentBonus} (wisdom bonus) = ${Math.round(finalScore)}`,
    architecture: 'single-point-v3'
  });
  
  return { flexibilityScore: Math.round(finalScore) };
};

// ✅ PRESERVED: Social connection calculation (unchanged logic)
const calculateSocialConnection = (questionnaire: any, hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !questionnaire?.responses) {
    return { connectionScore: 0 };
  }
  
  const responses = questionnaire.responses;
  let connectionScore = 0;
  
  if (responses.social_connections) {
    if (responses.social_connections.includes("Deep") || 
        responses.social_connections.includes("meaningful")) {
      connectionScore = 85;
    } else if (responses.social_connections.includes("Few but close")) {
      connectionScore = 70;
    } else if (responses.social_connections.includes("good") || 
               responses.social_connections.includes("Good")) {
      connectionScore = 55;
    } else if (responses.social_connections.includes("average")) {
      connectionScore = 35;
    } else if (responses.social_connections.includes("Mostly isolated")) {
      connectionScore = 10;
    }
  }
  
  if (responses.work_life_balance && responses.work_life_balance.includes("good")) {
    connectionScore += 10;
  }
  
  if (responses.motivation && 
      (responses.motivation.includes("others") || 
       responses.motivation.includes("Service") ||
       responses.motivation.includes("spiritual"))) {
    connectionScore += 12;
  }
  
  return { connectionScore: Math.max(0, Math.round(connectionScore)) };
};

// ✅ SINGLE-POINT: Enhanced emotional stability with consistent session filtering
const calculateEmotionalStabilityProgress = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { stabilityScore: 0 };
  }
  
  let stabilityScore = 0;
  
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness || 1;
    stabilityScore += emotionalAwareness * 7;
    
    if (questionnaire.responses.stress_response) {
      if (questionnaire.responses.stress_response.includes("Observe and let go")) {
        stabilityScore += 25;
      } else if (questionnaire.responses.stress_response.includes("manage well")) {
        stabilityScore += 15;
      } else if (questionnaire.responses.stress_response.includes("Usually manage")) {
        stabilityScore += 8;
      } else if (questionnaire.responses.stress_response.includes("overwhelmed")) {
        stabilityScore -= 20;
      }
    }
    
    if (questionnaire.responses.thought_patterns) {
      if (questionnaire.responses.thought_patterns.includes("Peaceful") ||
          questionnaire.responses.thought_patterns.includes("accepting")) {
        stabilityScore += 15;
      } else if (questionnaire.responses.thought_patterns.includes("Anxious") ||
                 questionnaire.responses.thought_patterns.includes("scattered")) {
        stabilityScore -= 15;
      }
    }
  }
  
  // ✅ SINGLE-POINT: Use consistent session filtering
  if (sessions && sessions.length > 0) {
    const meditationSessions = sessions.filter((s: any) => 
      s.sessionType === 'meditation' && s.completed !== false
    );
    
    const practiceBonus = Math.min(20, meditationSessions.length * 1.5);
    stabilityScore += practiceBonus;
    
    if (meditationSessions.length > 0) {
      const avgQuality = meditationSessions.reduce((sum, session) => 
        sum + (session.quality || session.rating || 3), 0) / meditationSessions.length;
      stabilityScore += (avgQuality - 3) * 5;
    }
    
    console.log('🧘 Emotional Stability (Single-Point):', {
      totalSessions: sessions.length,
      meditationSessions: meditationSessions.length,
      practiceBonus,
      architecture: 'single-point-v3'
    });
  }
  
  return { stabilityScore: Math.max(0, Math.round(stabilityScore)) };
};

// ✅ SINGLE-POINT: Enhanced mind recovery with consistent session filtering
const calculateMindRecoveryEffectiveness = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !sessions || sessions.length === 0) {
    return { recoveryScore: 0 };
  }
  
  // ✅ SINGLE-POINT: Use consistent session filtering
  const meditationSessions = sessions.filter((s: any) => 
    s.sessionType === 'meditation' && s.completed !== false
  );
  
  if (meditationSessions.length === 0) {
    return { recoveryScore: 0 };
  }
  
  let recoveryScore = 0;
  
  const totalDuration = meditationSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgDuration = totalDuration / meditationSessions.length;
  const totalHours = totalDuration / 60;
  
  if (avgDuration >= 30) recoveryScore += 50;
  else if (avgDuration >= 20) recoveryScore += 40;
  else if (avgDuration >= 15) recoveryScore += 30;
  else if (avgDuration >= 10) recoveryScore += 20;
  else if (avgDuration >= 5) recoveryScore += 12;
  
  if (totalHours >= 50) recoveryScore += 45;
  else if (totalHours >= 25) recoveryScore += 35;
  else if (totalHours >= 15) recoveryScore += 25;
  else if (totalHours >= 5) recoveryScore += 18;
  else if (totalHours >= 1) recoveryScore += 10;
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSessions = meditationSessions.filter(s => new Date(s.timestamp) > thirtyDaysAgo);
  
  if (recentSessions.length >= 20) recoveryScore += 25;
  else if (recentSessions.length >= 15) recoveryScore += 20;
  else if (recentSessions.length >= 10) recoveryScore += 15;
  else if (recentSessions.length >= 5) recoveryScore += 10;
  
  const avgQuality = meditationSessions.reduce((sum, session) => 
    sum + (session.quality || session.rating || 3), 0) / meditationSessions.length;
  
  if (avgQuality >= 4.5) recoveryScore += 20;
  else if (avgQuality >= 4.0) recoveryScore += 15;
  else if (avgQuality >= 3.5) recoveryScore += 10;
  else if (avgQuality >= 3.0) recoveryScore += 5;
  
  console.log('🧘 Mind Recovery (Single-Point):', {
    totalSessions: sessions.length,
    meditationSessions: meditationSessions.length,
    totalHours: totalHours.toFixed(1),
    avgDuration,
    avgQuality: avgQuality.toFixed(1),
    recentSessions: recentSessions.length,
    recoveryScore,
    architecture: 'single-point-v3'
  });
  
  return { recoveryScore: Math.max(0, Math.round(recoveryScore)) };
};

// ✅ SINGLE-POINT: Enhanced emotional regulation with consistent session filtering
const calculateEmotionalRegulation = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { regulationScore: 0 };
  }
  
  let regulationScore = 0;
  
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness || 1;
    regulationScore += emotionalAwareness * 6.5;
    
    if (questionnaire.responses.decision_making) {
      if (questionnaire.responses.decision_making.includes("Intuitive with mindful consideration")) {
        regulationScore += 20;
      } else if (questionnaire.responses.decision_making.includes("mindful")) {
        regulationScore += 12;
      } else if (questionnaire.responses.decision_making.includes("Balanced approach")) {
        regulationScore += 8;
      } else if (questionnaire.responses.decision_making.includes("Overthink")) {
        regulationScore -= 12;
      }
    }
    
    if (questionnaire.responses.mindfulness_in_daily_life) {
      if (questionnaire.responses.mindfulness_in_daily_life.includes("Constant awareness")) {
        regulationScore += 18;
      } else if (questionnaire.responses.mindfulness_in_daily_life.includes("Try to be mindful")) {
        regulationScore += 8;
      } else if (questionnaire.responses.mindfulness_in_daily_life.includes("Live on autopilot")) {
        regulationScore -= 15;
      }
    }
  }
  
  // ✅ SINGLE-POINT: Use consistent session filtering
  if (sessions && sessions.length > 0) {
    const meditationSessions = sessions.filter((s: any) => 
      s.sessionType === 'meditation' && s.completed !== false
    );
    
    const practiceWeeks = Math.floor(meditationSessions.length / 3);
    const practiceBonus = Math.min(15, practiceWeeks * 2);
    regulationScore += practiceBonus;
    
    const qualitySessions = meditationSessions.filter(session => (session.quality || session.rating || 0) >= 4);
    if (qualitySessions.length > 0) {
      regulationScore += (qualitySessions.length / meditationSessions.length) * 12;
    }
    
    console.log('🧘 Emotional Regulation (Single-Point):', {
      totalSessions: sessions.length,
      meditationSessions: meditationSessions.length,
      practiceWeeks,
      practiceBonus,
      qualitySessions: qualitySessions.length,
      architecture: 'single-point-v3'
    });
  }
  
  return { regulationScore: Math.max(0, Math.round(regulationScore)) };
};

// ✅ SINGLE-POINT: Enhanced practice consistency with consistent session filtering and streak calculation
const calculatePracticeConsistency = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !sessions || sessions.length === 0) {
    return { consistencyScore: 0 };
  }
  
  // ✅ SINGLE-POINT: Use consistent session filtering
  const meditationSessions = sessions.filter((s: any) => 
    s.sessionType === 'meditation' && s.completed !== false
  );
  
  if (meditationSessions.length === 0) {
    return { consistencyScore: 0 };
  }
  
  let consistencyScore = 0;
  
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSessions = meditationSessions.filter(session => 
    new Date(session.timestamp) > thirtyDaysAgo
  );
  
  if (recentSessions.length >= 28) consistencyScore += 80;
  else if (recentSessions.length >= 25) consistencyScore += 70;
  else if (recentSessions.length >= 20) consistencyScore += 60;
  else if (recentSessions.length >= 15) consistencyScore += 45;
  else if (recentSessions.length >= 10) consistencyScore += 30;
  else if (recentSessions.length >= 5) consistencyScore += 18;
  else if (recentSessions.length >= 1) consistencyScore += 8;
  
  // ✅ SINGLE-POINT: Use consistent streak calculation
  const currentStreak = calculateSessionStreak(meditationSessions);
  if (currentStreak >= 30) consistencyScore += 35;
  else if (currentStreak >= 21) consistencyScore += 30;
  else if (currentStreak >= 14) consistencyScore += 25;
  else if (currentStreak >= 7) consistencyScore += 20;
  else if (currentStreak >= 3) consistencyScore += 12;
  else if (currentStreak >= 1) consistencyScore += 6;
  
  const totalSessions = meditationSessions.length;
  if (totalSessions >= 100) consistencyScore += 25;
  else if (totalSessions >= 50) consistencyScore += 20;
  else if (totalSessions >= 25) consistencyScore += 15;
  else if (totalSessions >= 10) consistencyScore += 10;
  else if (totalSessions >= 5) consistencyScore += 5;
  
  console.log('📈 Practice Consistency (Single-Point):', {
    totalSessions: sessions.length,
    meditationSessions: totalSessions,
    recentSessions: recentSessions.length,
    currentStreak,
    consistencyScore,
    architecture: 'single-point-v3'
  });
  
  return { consistencyScore: Math.max(0, Math.round(consistencyScore)) };
};

// ✅ SINGLE-POINT: Enhanced PAHM development with consistent session filtering
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
      stageDescription: 'Begin your awareness journey with assessment',
      progressionPath: 'Complete questionnaire and self-assessment',
      insights: ['Start with honest self-assessment'],
      recommendations: ['Complete the questionnaire', 'Begin practice sessions'],
      breakdown: { presentNeutralMastery: 0, presentMomentDevelopment: 0, therapeuticProgress: 0, sessionQuality: 0 }
    };
  }
  
  let assessmentFoundation = 0;
  let practiceRealization = 0;
  
  if (questionnaire?.responses) {
    const experienceLevel = questionnaire.responses.experience_level || 1;
    const mindfulnessExperience = questionnaire.responses.mindfulness_experience || 1;
    
    assessmentFoundation += experienceLevel * 2.5;
    assessmentFoundation += mindfulnessExperience * 2;
    
    if (experienceLevel >= 8) {
      assessmentFoundation += 5;
    }
  }
  
  // ✅ SINGLE-POINT: Use consistent session filtering for PAHM calculation
  if (sessions && sessions.length > 0) {
    const meditationSessions = sessions.filter((s: any) => 
      s.sessionType === 'meditation' && s.completed !== false
    );
    
    const totalSessions = meditationSessions.length;
    const totalMinutes = meditationSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const avgQuality = totalSessions > 0 
      ? meditationSessions.reduce((sum, session) => sum + (session.quality || session.rating || 3), 0) / totalSessions 
      : 0;
    const avgDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    
    if (totalSessions >= 100) practiceRealization += 35;
    else if (totalSessions >= 50) practiceRealization += 30;
    else if (totalSessions >= 25) practiceRealization += 25;
    else if (totalSessions >= 15) practiceRealization += 20;
    else if (totalSessions >= 10) practiceRealization += 15;
    else if (totalSessions >= 5) practiceRealization += 10;
    else if (totalSessions >= 1) practiceRealization += 5;
    
    if (totalHours >= 100) practiceRealization += 40;
    else if (totalHours >= 50) practiceRealization += 35;
    else if (totalHours >= 25) practiceRealization += 30;
    else if (totalHours >= 10) practiceRealization += 25;
    else if (totalHours >= 5) practiceRealization += 20;
    else if (totalHours >= 2) practiceRealization += 15;
    else if (totalHours >= 0.5) practiceRealization += 10;
    
    if (avgQuality >= 4.5) practiceRealization += 25;
    else if (avgQuality >= 4.0) practiceRealization += 20;
    else if (avgQuality >= 3.5) practiceRealization += 15;
    else if (avgQuality >= 3.0) practiceRealization += 10;
    else if (avgQuality >= 2.5) practiceRealization += 5;
    
    if (avgDuration >= 45) practiceRealization += 20;
    else if (avgDuration >= 30) practiceRealization += 15;
    else if (avgDuration >= 20) practiceRealization += 12;
    else if (avgDuration >= 15) practiceRealization += 10;
    else if (avgDuration >= 10) practiceRealization += 8;
    else if (avgDuration >= 5) practiceRealization += 5;
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = meditationSessions.filter(s => new Date(s.timestamp) > thirtyDaysAgo);
    
    if (recentSessions.length >= 20) practiceRealization += 15;
    else if (recentSessions.length >= 15) practiceRealization += 12;
    else if (recentSessions.length >= 10) practiceRealization += 10;
    else if (recentSessions.length >= 5) practiceRealization += 8;
    else if (recentSessions.length >= 1) practiceRealization += 5;
    
    console.log('🎯 PAHM Development (Single-Point):', {
      totalAllSessions: sessions.length,
      meditationSessions: totalSessions,
      totalHours: totalHours.toFixed(1),
      avgQuality: avgQuality.toFixed(1),
      avgDuration: avgDuration.toFixed(1),
      recentSessions: recentSessions.length,
      assessmentFoundation,
      practiceRealization,
      architecture: 'single-point-v3'
    });
  }
  
  const overallPAHMScore = Math.round(assessmentFoundation + practiceRealization);
  
  let developmentStage = 'Seeker';
  let stageDescription = 'Beginning awareness journey';
  let progressionPath = 'Build consistent practice routine';
  
  if (overallPAHMScore >= 120) {
    developmentStage = 'Enlightened Seeker';
    stageDescription = 'Consistent present-moment awareness with effortless neutral observation';
    progressionPath = 'Share wisdom and deepen service to others';
  } else if (overallPAHMScore >= 100) {
    developmentStage = 'Master Seeker';
    stageDescription = 'Stable present-moment awareness with reliable neutral observation';
    progressionPath = 'Refine effortless presence and reduce subtle reactivity';
  } else if (overallPAHMScore >= 80) {
    developmentStage = 'Advanced Seeker';
    stageDescription = 'Regular moments of present awareness with growing equanimity';
    progressionPath = 'Strengthen neutral observation and extend awareness periods';
  } else if (overallPAHMScore >= 60) {
    developmentStage = 'Progressing Seeker';
    stageDescription = 'Beginning to notice mind wandering and successfully returning attention';
    progressionPath = 'Build consistency and deepen quality of sessions';
  } else if (overallPAHMScore >= 40) {
    developmentStage = 'Awakening Seeker';
    stageDescription = 'Starting to recognize patterns of mental activity and attachment';
    progressionPath = 'Develop sustained attention and mindful observation skills';
  } else if (overallPAHMScore >= 20) {
    developmentStage = 'Active Seeker';
    stageDescription = 'Building foundation through consistent practice attempts';
    progressionPath = 'Focus on daily practice habit and basic mindfulness';
  }
  
  const insights = [];
  const recommendations = [];
  
  const assessmentVsPractice = practiceRealization / Math.max(assessmentFoundation, 1);
  
  if (assessmentVsPractice >= 2) {
    insights.push('Your actual practice exceeds your stated experience - you\'re developing real skills');
  } else if (assessmentVsPractice >= 1) {
    insights.push('Your practice is building on your stated experience effectively');
  } else if (assessmentFoundation > 20 && practiceRealization < 10) {
    insights.push('Consider more practice to match your stated experience level');
  } else if (practiceRealization === 0) {
    insights.push('Assessment-based foundation established - ready for practice development');
  }
  
  // ✅ SINGLE-POINT: Use consistent session filtering for recommendations
  const meditationSessions = sessions ? sessions.filter((s: any) => 
    s.sessionType === 'meditation' && s.completed !== false
  ) : [];
  
  if (meditationSessions.length === 0) {
    recommendations.push('Begin daily 5-10 minute practice sessions');
    recommendations.push('Focus on building the habit before extending duration');
  } else if (meditationSessions.length < 10) {
    recommendations.push('Continue building practice consistency');
    recommendations.push('Aim for daily sessions to establish the habit');
  } else if (meditationSessions.length < 50) {
    recommendations.push('Excellent foundation - now focus on session quality');
    recommendations.push('Gradually increase average session duration');
  } else {
    recommendations.push('Strong practice foundation - explore advanced techniques');
    recommendations.push('Consider longer sessions and retreat experiences');
  }
  
  const avgQuality = meditationSessions.length > 0 
    ? meditationSessions.reduce((sum, session) => sum + (session.quality || session.rating || 3), 0) / meditationSessions.length 
    : 0;
  const sessionQuality = Math.round(avgQuality * 20);
  
  const breakdown = {
    presentNeutralMastery: Math.round(practiceRealization * 0.4),
    presentMomentDevelopment: Math.round(practiceRealization * 0.6),
    therapeuticProgress: Math.round(assessmentFoundation * 0.8),
    sessionQuality: sessionQuality
  };
  
  console.log('🎯 PAHM Development Final (Single-Point):', {
    assessmentFoundation,
    practiceRealization,
    overallPAHMScore,
    totalMeditationSessions: meditationSessions.length,
    totalHours: meditationSessions.length > 0 
      ? (meditationSessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60).toFixed(1) 
      : '0',
    avgQuality: avgQuality.toFixed(1),
    developmentStage,
    architecture: 'single-point-v3'
  });
  
  return {
    overallPAHMScore,
    presentMomentRatio: Math.min(1, practiceRealization / 80),
    presentNeutralRatio: Math.min(1, practiceRealization / 100),
    developmentStage,
    stageDescription,
    progressionPath,
    insights,
    recommendations,
    breakdown
  };
};

// ✅ SINGLE-POINT: Enhanced session streak calculation using consistent filtering
const calculateSessionStreak = (sessions: any[]): number => {
  if (!sessions || sessions.length === 0) return 0;
  
  // ✅ SINGLE-POINT: Use consistent session filtering
  const meditationSessions = sessions.filter((s: any) => 
    s.sessionType === 'meditation' && s.completed !== false
  );
  
  if (meditationSessions.length === 0) return 0;
  
  const sortedSessions = [...meditationSessions].sort((a, b) => 
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
  
  console.log('🔥 Session Streak (Single-Point):', {
    totalSessions: sessions.length,
    meditationSessions: meditationSessions.length,
    streak,
    architecture: 'single-point-v3'
  });
  
  return streak;
};

// ✅ MAIN HOOK - Enhanced with single-point architecture compliance
export const useHappinessCalculation = (): UseHappinessCalculationReturn => {
  // ✅ SINGLE-POINT: Get data from contexts with consistent architecture
  const { currentUser } = useAuth();
  const { 
    questionnaire, 
    selfAssessment,
    isLoading: onboardingLoading 
  } = useOnboarding();
  const { sessions } = usePractice(); // ✅ SINGLE-POINT: Only source for session data
  const { emotionalNotes } = useWellness();

  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 0,
    user_level: 'Seeker',
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

  // ✅ SINGLE-POINT: Practice sessions with consistent filtering
  const practiceSessions = useMemo(() => {
    if (!currentUser?.uid) {
      console.warn('🚨 No current user - returning empty practice sessions');
      return [];
    }
    
    console.log(`✅ Retrieved ${sessions?.length || 0} practice sessions from PracticeContext (Single-Point) for user ${currentUser.uid.substring(0, 8)}...`);
    
    // ✅ Apply consistent filtering that matches other components
    const allSessions = sessions || [];
    const meditationSessions = allSessions.filter((s: any) => 
      s.sessionType === 'meditation' && s.completed !== false
    );
    
    console.log(`✅ Filtered to ${meditationSessions.length} meditation sessions (Single-Point Architecture)`);
    
    return allSessions; // Return all for analysis, but components use filtered versions
  }, [currentUser?.uid, sessions]);

  const userEmotionalNotes = useMemo(() => {
    if (!currentUser?.uid) {
      console.warn('🚨 No current user - returning empty emotional notes');
      return [];
    }
    console.log(`✅ Retrieved ${emotionalNotes?.length || 0} emotional notes from WellnessContext for user ${currentUser.uid.substring(0, 8)}...`);
    return emotionalNotes || [];
  }, [currentUser?.uid, emotionalNotes]);

  // ✅ SINGLE-POINT: Debug current user context with architecture info
  useEffect(() => {
    if (currentUser) {
      console.log(`👤 Single-Point happiness calculation for user: ${currentUser.uid.substring(0, 8)}... (${currentUser.email})`);
      console.log('📊 Single-Point data summary:', {
        practiceSessions: practiceSessions.length,
        meditationSessions: practiceSessions.filter((s: any) => 
          s.sessionType === 'meditation' && s.completed !== false
        ).length,
        emotionalNotes: userEmotionalNotes.length,
        hasQuestionnaire: !!questionnaire,
        hasSelfAssessment: !!selfAssessment,
        onboardingLoading,
        architecture: 'single-point-v3'
      });
    } else {
      console.warn('👤 No current user - happiness calculation disabled');
    }
  }, [currentUser, practiceSessions.length, userEmotionalNotes.length, questionnaire, selfAssessment, onboardingLoading]);

  // ✅ PRESERVED: Extract numeric scores utility
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
             result.attachmentImpact ||
             result.currentStateScore ||
             0;
    }
    
    return 0;
  }, []);

  // ✅ SINGLE-POINT: Complete calculation with enhanced architecture compliance
  const calculateHappinessScore = useCallback(() => {
    // ✅ SECURITY: Must have current user
    if (!currentUser?.uid) {
      console.warn('🚨 No current user - cannot calculate happiness score');
      setUserProgress({
        happiness_points: 0,
        user_level: 'Guest',
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
      return;
    }

    setIsCalculating(true);
    
    try {
      console.log(`🔄 Single-Point Calculation Starting for ${currentUser.uid.substring(0, 8)}...`);
      console.log('📊 Single-Point input data:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        email: currentUser.email,
        questionnaire: !!questionnaire,
        selfAssessment: !!selfAssessment,
        sessionCount: practiceSessions.length,
        meditationSessionCount: practiceSessions.filter((s: any) => 
          s.sessionType === 'meditation' && s.completed !== false
        ).length,
        notesCount: userEmotionalNotes.length,
        architecture: 'single-point-v3'
      });
      
      // ✅ SINGLE-POINT: Check minimum data with enhanced session analysis
      const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions);
      
      // Calculate data completeness
      const dataCompleteness = {
        questionnaire: !!(questionnaire?.completed || questionnaire?.responses),
        selfAssessment: !!(selfAssessment?.completed || 
                          selfAssessment?.responses || 
                          selfAssessment?.categories ||
                          selfAssessment?.attachmentScore !== undefined ||
                          selfAssessment?.nonAttachmentCount !== undefined ||
                          selfAssessment?.taste),
        practiceSessions: practiceSessions.filter((s: any) => 
          s.sessionType === 'meditation' && s.completed !== false
        ).length > 0,
        sufficientForCalculation: hasMinimumData
      };
      
      console.log(`✅ Single-Point data completeness for ${currentUser.uid.substring(0, 8)}...:`, {
        ...dataCompleteness,
        architecture: 'single-point-v3'
      });
      
      // ✅ SINGLE-POINT: Calculate ALL components with enhanced session filtering
      console.log('🧮 Calculating Single-Point components...');
      
      const currentStateResult = calculateCurrentStateFromAssessment(questionnaire, userEmotionalNotes, hasMinimumData);
      const currentStateScore = extractNumericScore(currentStateResult);
      
      const attachmentResult = calculateAttachmentBasedHappiness(selfAssessment, hasMinimumData);
      const attachmentScore = extractNumericScore(attachmentResult);
      
      const socialResult = calculateSocialConnection(questionnaire, hasMinimumData);
      const socialScore = extractNumericScore(socialResult);
      
      const emotionalStabilityResult = calculateEmotionalStabilityProgress(practiceSessions, questionnaire, hasMinimumData);
      const emotionalStabilityScore = extractNumericScore(emotionalStabilityResult);
      
      const mindRecoveryResult = calculateMindRecoveryEffectiveness(practiceSessions, hasMinimumData);
      const mindRecoveryScore = extractNumericScore(mindRecoveryResult);
      
      const emotionalRegulationResult = calculateEmotionalRegulation(practiceSessions, questionnaire, hasMinimumData);
      const emotionalRegulationScore = extractNumericScore(emotionalRegulationResult);
      
      const practiceConsistencyResult = calculatePracticeConsistency(practiceSessions, hasMinimumData);
      const practiceConsistencyScore = extractNumericScore(practiceConsistencyResult);
      
      const pahmResult = calculatePAHMCentralDevelopment(practiceSessions, questionnaire, hasMinimumData);
      const pahmScore = extractNumericScore(pahmResult);

      console.log(`🎯 Single-Point component scores for ${currentUser.uid.substring(0, 8)}...:`, {
        currentStateScore,
        attachmentScore,
        socialScore,
        emotionalStabilityScore,
        mindRecoveryScore,
        emotionalRegulationScore,
        practiceConsistencyScore,
        pahmScore,
        architecture: 'single-point-v3'
      });

      // ✅ PRESERVED: Component breakdown structure
      const breakdown: ComponentBreakdown = {
        currentMoodState: currentStateScore,
        attachmentFlexibility: attachmentScore,
        socialConnection: socialScore,
        emotionalStabilityProgress: emotionalStabilityScore,
        mindRecoveryEffectiveness: mindRecoveryScore,
        emotionalRegulation: emotionalRegulationScore,
        practiceConsistency: practiceConsistencyScore,
        pahmDevelopment: pahmScore
      };

      setComponentBreakdown(breakdown);

      // ✅ PRESERVED: Weighted calculation (unchanged)
      const weightedScore = Math.round(
        (pahmScore * 0.25) +
        (attachmentScore * 0.20) +
        (emotionalStabilityScore * 0.18) +
        (currentStateScore * 0.12) +
        (emotionalRegulationScore * 0.10) +
        (mindRecoveryScore * 0.08) +
        (socialScore * 0.04) +
        (practiceConsistencyScore * 0.03)
      );

      const finalHappinessScore = Math.round(weightedScore);

      console.log(`🎯 Single-Point final calculation for ${currentUser.uid.substring(0, 8)}...:`, {
        weightedScore,
        finalHappinessScore,
        breakdown: {
          pahmContribution: pahmScore * 0.25,
          attachmentContribution: attachmentScore * 0.20,
          stabilityContribution: emotionalStabilityScore * 0.18,
          currentStateContribution: currentStateScore * 0.12
        },
        architecture: 'single-point-v3'
      });

      // ✅ PRESERVED: User level determination
      let userLevel = 'Seeker';
      if (finalHappinessScore >= 80) userLevel = 'Enlightened Seeker';
      else if (finalHappinessScore >= 65) userLevel = 'Advanced Seeker';
      else if (finalHappinessScore >= 50) userLevel = 'Progressing Seeker';
      else if (finalHappinessScore >= 35) userLevel = 'Awakening Seeker';
      else if (finalHappinessScore >= 20) userLevel = 'Active Seeker';

      // ✅ PRESERVED: PAHM analysis creation
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

      // ✅ SINGLE-POINT: Enhanced metrics calculation with consistent session filtering
      const focusAbility = Math.min(Math.round(pahmScore + (emotionalRegulationScore * 0.5)), 100);
      const habitChangeScore = Math.min(Math.round(pahmScore + (practiceConsistencyScore * 0.8)), 100);
      const practiceStreak = practiceSessions.length > 0 ? calculateSessionStreak(practiceSessions) : 0;

      // ✅ PRESERVED: Create result structure
      const result: UserProgress = {
        happiness_points: finalHappinessScore,
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

      // ✅ SINGLE-POINT: Enhanced event with architecture info
      const event = new CustomEvent('happinessUpdated', {
        detail: {
          userId: currentUser.uid,
          happiness_points: finalHappinessScore,
          user_level: userLevel,
          breakdown: breakdown,
          pahmAnalysis: pahmAnalysis,
          hasMinimumData: hasMinimumData,
          dataCompleteness: dataCompleteness,
          calculatedAt: new Date().toISOString(),
          trigger: 'single_point_calculation',
          architecture: 'single-point-v3'
        }
      });
      window.dispatchEvent(event);

      console.log(`✅ Single-Point calculation completed for ${currentUser.uid.substring(0, 8)}...:`, {
        happiness_points: finalHappinessScore,
        user_level: userLevel,
        hasMinimumData: hasMinimumData,
        attachmentContribution: attachmentScore * 0.20,
        architecture: 'single-point-v3'
      });

    } catch (error) {
      console.error(`❌ Error in Single-Point calculation for ${currentUser.uid.substring(0, 8)}...:`, error);
      // ✅ PRESERVED: Fallback state
      setUserProgress({
        happiness_points: 0,
        user_level: 'Seeker',
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
    currentUser,
    questionnaire,
    selfAssessment,
    practiceSessions,
    userEmotionalNotes,
    extractNumericScore,
    recalculationTrigger
  ]);

  // ✅ SINGLE-POINT: Enhanced force recalculation function
  const forceRecalculation = useCallback(() => {
    if (currentUser?.uid) {
      console.log(`🔄 Single-Point force recalculation triggered for ${currentUser.uid.substring(0, 8)}...`);
      setRecalculationTrigger(prev => prev + 1);
      setTimeout(() => {
        calculateHappinessScore();
      }, 100);
    }
  }, [calculateHappinessScore, currentUser?.uid]);

  // ✅ SINGLE-POINT: Enhanced debug functions with architecture info
  const debugCalculation = useCallback(() => {
    const debugInfo = {
      currentUser: currentUser?.uid ? {
        id: currentUser.uid.substring(0, 8) + '...',
        email: currentUser.email
      } : null,
      questionnaire: questionnaire ? 'Available from Firebase' : 'Missing',
      selfAssessment: selfAssessment ? 'Available from Firebase' : 'Missing',
      practiceSessions: practiceSessions?.length || 0,
      meditationSessions: practiceSessions ? practiceSessions.filter((s: any) => 
        s.sessionType === 'meditation' && s.completed !== false
      ).length : 0,
      emotionalNotes: userEmotionalNotes?.length || 0,
      hasMinimumData: hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []),
      currentResults: userProgress,
      recalculationTrigger,
      onboardingLoading,
      questionnaire_data: questionnaire,
      selfAssessment_data: selfAssessment,
      calculationType: 'Single-Point Architecture v3 (PracticeContext + OnboardingContext + WellnessContext)',
      architecture: 'single-point-v3'
    };
    
    setCalculationDebugInfo(debugInfo);
    console.log('🔍 Single-Point Calculation Debug:', debugInfo);
  }, [currentUser, questionnaire, selfAssessment, practiceSessions, userEmotionalNotes, userProgress, recalculationTrigger, onboardingLoading]);

  const logProgress = useCallback(() => {
    if (currentUser?.uid) {
      console.log(`📊 Single-Point Progress for ${currentUser.uid.substring(0, 8)}...:`, {
        ...userProgress,
        architecture: 'single-point-v3'
      });
      console.log('📊 Component Breakdown:', componentBreakdown);
    }
  }, [currentUser, userProgress, componentBreakdown]);

  const testComponents = useCallback(() => {
    if (currentUser?.uid) {
      console.log(`🧪 Testing Single-Point Components for ${currentUser.uid.substring(0, 8)}...`);
      const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []);
      console.log('Has minimum data:', hasMinimumData);
      console.log('Architecture:', 'single-point-v3');
      debugCalculation();
    }
  }, [currentUser, questionnaire, selfAssessment, practiceSessions, debugCalculation]);

  // ✅ SINGLE-POINT: Auto-calculate when data changes (enhanced logging)
  useEffect(() => {
    if (currentUser?.uid && !onboardingLoading) {
      const timeoutId = setTimeout(() => {
        console.log(`🚀 Single-Point auto-calculation triggered for ${currentUser.uid.substring(0, 8)}...`);
        calculateHappinessScore();
      }, 250);
      
      return () => clearTimeout(timeoutId);
    }
  }, [calculateHappinessScore, currentUser?.uid, onboardingLoading]);

  // ✅ SINGLE-POINT: Enhanced event listeners with architecture compliance
  useEffect(() => {
    if (!currentUser?.uid) return;

    const handleOnboardingEvent = (event: any) => {
      console.log(`🎯 Received Single-Point onboarding event for ${currentUser.uid.substring(0, 8)}...:`, event.detail);
      if (event.detail.type === 'selfAssessment' || event.detail.type === 'questionnaire') {
        console.log('🔄 Onboarding event triggered Single-Point recalculation');
        forceRecalculation();
      }
    };

    const handleHappinessRecalculation = (event: any) => {
      console.log(`🚀 Direct Single-Point happiness recalculation trigger for ${currentUser.uid.substring(0, 8)}...:`, event.detail);
      forceRecalculation();
    };

    window.addEventListener('onboardingUpdated', handleOnboardingEvent);
    window.addEventListener('selfAssessmentCompleted', handleOnboardingEvent);
    window.addEventListener('questionnaireCompleted', handleOnboardingEvent);
    window.addEventListener('triggerHappinessRecalculation', handleHappinessRecalculation);
    
    return () => {
      window.removeEventListener('onboardingUpdated', handleOnboardingEvent);
      window.removeEventListener('selfAssessmentCompleted', handleOnboardingEvent);
      window.removeEventListener('questionnaireCompleted', handleOnboardingEvent);
      window.removeEventListener('triggerHappinessRecalculation', handleHappinessRecalculation);
    };
  }, [forceRecalculation, currentUser?.uid]);

  // ✅ PRESERVED: Return structure unchanged
  return useMemo(() => ({
    userProgress,
    componentBreakdown,
    calculationDebugInfo,
    isCalculating,
    practiceSessions: practiceSessions || [],
    emotionalNotes: userEmotionalNotes || [],
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
    userEmotionalNotes,
    questionnaire,
    selfAssessment,
    forceRecalculation,
    debugCalculation,
    logProgress,
    testComponents
  ]);
};