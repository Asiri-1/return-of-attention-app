// ✅ FIXED useHappinessCalculation.ts - Non-Attachment Bonus Fixed
// File: src/hooks/useHappinessCalculation.ts
// 🔧 FIXED: Non-attachment bonus now properly calculated and applied

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalDataCompat as useLocalData } from './useLocalDataCompat';

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
  // ✅ NEW: Assessment-based scores
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

// ================================
// 🎯 UNIVERSAL PRINCIPLE: NO ARBITRARY BASELINES
// ================================
// 1. Assessment data sets real baseline (start from 0)
// 2. Direct response-to-points conversion
// 3. Reward non-attachment with bonus points
// 4. Penalize attachment with direct negative points
// 5. Practice enhances but doesn't create artificial scores

// ✅ PRESERVED: Flexible data detection logic
const hasMinimumDataForCalculation = (
  questionnaire: any,
  selfAssessment: any,
  sessions: any[]
): boolean => {
  console.log('🔍 Universal Assessment-Based Data Check:');
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
  
  console.log('🧘 Sessions:', { count: sessions?.length || 0 });
  
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
  
  const hasMinimumSessions = Array.isArray(sessions) && sessions.length >= 3;
  const hasAnySessions = Array.isArray(sessions) && sessions.length >= 1;
  
  const sufficient = (
    hasSelfAssessment || 
    hasQuestionnaire || 
    hasMinimumSessions || 
    (hasQuestionnaire && hasAnySessions)
  );
  
  console.log('✅ Universal Requirements Check:', {
    hasQuestionnaire,
    hasSelfAssessment,
    sufficient
  });
  
  return sufficient;
};

// ================================
// 🎯 UNIVERSAL SCORING: DIRECT ASSESSMENT-TO-POINTS CONVERSION
// ================================

// ✅ NEW: Pure Assessment-Based Current State (NO arbitrary baseline)
const calculateCurrentStateFromAssessment = (questionnaire: any, notes: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !questionnaire?.responses) {
    return { currentMoodScore: 0 }; // Start from 0 - no data = no points
  }
  
  const responses = questionnaire.responses;
  let currentStateScore = 0; // ✅ NO BASELINE - start from actual 0
  
  // ✅ DIRECT CONVERSION: Questionnaire scales → Happiness points
  
  // Emotional Awareness (1-10 scale) → Direct happiness contribution
  const emotionalAwareness = responses.emotional_awareness || 1;
  currentStateScore += emotionalAwareness * 8; // 10 awareness = 80 points
  
  // Sleep Pattern (1-10 scale) → Energy and wellbeing
  const sleepPattern = responses.sleep_pattern || 1;
  currentStateScore += sleepPattern * 6; // 10 sleep = 60 points
  
  // Physical Activity → Current vitality
  const activityMultiplier = {
    'very_active': 25,
    'Very_active': 25,
    'moderate': 15,
    'light': 8,
    'sedentary': 0
  };
  const activityScore = activityMultiplier[responses.physical_activity as keyof typeof activityMultiplier] || 0;
  currentStateScore += activityScore;
  
  // Work-Life Balance → Current stress level
  if (responses.work_life_balance) {
    if (responses.work_life_balance.includes('Perfect') || responses.work_life_balance.includes('excellent')) {
      currentStateScore += 20;
    } else if (responses.work_life_balance.includes('good') || responses.work_life_balance.includes('generally')) {
      currentStateScore += 12;
    } else if (responses.work_life_balance.includes('struggle') || responses.work_life_balance.includes('difficult')) {
      currentStateScore -= 10; // ✅ NEGATIVE: Real assessment of struggling
    }
  }
  
  // Stress Response → Current coping ability
  if (responses.stress_response) {
    if (responses.stress_response.includes('manage well') || responses.stress_response.includes('Observe')) {
      currentStateScore += 15;
    } else if (responses.stress_response.includes('Usually manage')) {
      currentStateScore += 8;
    } else if (responses.stress_response.includes('overwhelmed') || responses.stress_response.includes('Get overwhelmed')) {
      currentStateScore -= 15; // ✅ NEGATIVE: Real assessment of overwhelm
    }
  }
  
  // Recent emotional notes (current mood tracking)
  if (notes && notes.length > 0) {
    const recentNotes = notes.slice(-5);
    const avgMood = recentNotes.reduce((sum, note) => sum + (note.mood || 5), 0) / recentNotes.length;
    const moodContribution = (avgMood - 5) * 8; // 5 is neutral, above/below affects score
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

// ✅ FIXED: Pure Attachment-Based Scoring (REWARD non-attachment, PENALIZE attachment)
const calculateAttachmentBasedHappiness = (selfAssessment: any, hasMinimumData: boolean): ComponentResult => {
  console.log('🎯 Universal Attachment Calculation:', {
    selfAssessment: !!selfAssessment,
    hasMinimumData,
    attachmentScore: selfAssessment?.attachmentScore,
    nonAttachmentCount: selfAssessment?.nonAttachmentCount
  });
  
  if (!hasMinimumData) {
    return { flexibilityScore: 0 }; // No data = no score
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
    return { flexibilityScore: 0 }; // No assessment = no score
  }
  
  // ✅ EXTRACT REAL ATTACHMENT DATA
  let attachmentScore = selfAssessment.attachmentScore || 0;
  let nonAttachmentCount = selfAssessment.nonAttachmentCount || 0;
  
  // Calculate from individual responses if not pre-calculated
  if (attachmentScore === 0 && nonAttachmentCount === 0 && (selfAssessment.categories || selfAssessment.responses)) {
    const categories = selfAssessment.categories || selfAssessment.responses || selfAssessment;
    const senseCategories = ['taste', 'smell', 'sound', 'sight', 'touch', 'mind'];
    
    let calculatedAttachment = 0;
    let calculatedNonAttachment = 0;
    
    console.log('📊 Calculating from individual responses:', categories);
    
    senseCategories.forEach(category => {
      const value = categories[category];
      const level = typeof value === 'object' ? value.level : value;
      
      console.log(`🔍 ${category}: ${level}`); // Debug each category
      
      if (level === 'none') {
        calculatedNonAttachment++;
        console.log(`✅ Non-attachment found in ${category} - will get +12 bonus`);
        // ✅ NO PENALTY for non-attachment (this is wisdom!)
      } else if (level === 'some') {
        calculatedAttachment -= 7; // Some attachment = -7 points
        console.log(`⚠️ Some attachment in ${category} - gets -7 penalty`);
      } else if (level === 'strong') {
        calculatedAttachment -= 7; // Strong attachment = -7 points
        console.log(`❌ Strong attachment in ${category} - gets -14 penalty`);
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
  
  // ✅ UNIVERSAL ATTACHMENT SCORING:
  // 1. Attachment creates suffering (negative points)
  // 2. Non-attachment creates happiness (bonus points)
  
  let finalScore = 0; // Start from 0 - no baseline
  
  // Attachment Penalty: Direct suffering from attachment  
  finalScore += attachmentScore; // This adds the negative values directly (already calculated as negative)
  
  // ✅ NON-ATTACHMENT BONUS: Reward wisdom
  const nonAttachmentBonus = nonAttachmentCount * 12; // Each "none" = +12 happiness points
  finalScore += nonAttachmentBonus; // ✅ ADD wisdom bonus
  
  console.log('✅ Universal Attachment Scoring Breakdown:', {
    attachmentScore: `${attachmentScore} points (${Math.abs(attachmentScore)} penalty)`,
    nonAttachmentCount: `${nonAttachmentCount} categories`,
    nonAttachmentBonus: `+${nonAttachmentBonus} happiness points`,
    finalScore: `${Math.round(finalScore)} total points`,
    calculation: `${attachmentScore} (suffering) + ${nonAttachmentBonus} (wisdom bonus) = ${Math.round(finalScore)}`
  });
  
  return { flexibilityScore: Math.round(finalScore) };
};

// ✅ PRESERVED: Direct questionnaire-based social connection
const calculateSocialConnection = (questionnaire: any, hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !questionnaire?.responses) {
    return { connectionScore: 0 };
  }
  
  const responses = questionnaire.responses;
  let connectionScore = 0; // Start from 0 - no baseline
  
  // ✅ DIRECT CONVERSION: Social connections response → Points
  if (responses.social_connections) {
    if (responses.social_connections.includes("Deep") || 
        responses.social_connections.includes("meaningful")) {
      connectionScore = 85; // Deep connections = high happiness
    } else if (responses.social_connections.includes("Few but close")) {
      connectionScore = 70;
    } else if (responses.social_connections.includes("good") || 
               responses.social_connections.includes("Good")) {
      connectionScore = 55;
    } else if (responses.social_connections.includes("average")) {
      connectionScore = 35;
    } else if (responses.social_connections.includes("Mostly isolated")) {
      connectionScore = 10; // Isolation = low happiness
    }
  }
  
  // Work-life balance influences social wellbeing
  if (responses.work_life_balance && responses.work_life_balance.includes("good")) {
    connectionScore += 10;
  }
  
  // Service orientation enhances connection
  if (responses.motivation && 
      (responses.motivation.includes("others") || 
       responses.motivation.includes("Service") ||
       responses.motivation.includes("spiritual"))) {
    connectionScore += 12;
  }
  
  return { connectionScore: Math.max(0, Math.round(connectionScore)) };
};

// ✅ PRESERVED: Enhanced emotional stability from questionnaire + practice
const calculateEmotionalStabilityProgress = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { stabilityScore: 0 };
  }
  
  let stabilityScore = 0; // Start from 0 - no baseline
  
  // Primary assessment from questionnaire
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness || 1;
    stabilityScore += emotionalAwareness * 7; // Direct conversion: 10 awareness = 70 points
    
    // Stress response capability
    if (questionnaire.responses.stress_response) {
      if (questionnaire.responses.stress_response.includes("Observe and let go")) {
        stabilityScore += 25;
      } else if (questionnaire.responses.stress_response.includes("manage well")) {
        stabilityScore += 15;
      } else if (questionnaire.responses.stress_response.includes("Usually manage")) {
        stabilityScore += 8;
      } else if (questionnaire.responses.stress_response.includes("overwhelmed")) {
        stabilityScore -= 20; // ✅ NEGATIVE: Real assessment of instability
      }
    }
    
    // Thought patterns assessment
    if (questionnaire.responses.thought_patterns) {
      if (questionnaire.responses.thought_patterns.includes("Peaceful") ||
          questionnaire.responses.thought_patterns.includes("accepting")) {
        stabilityScore += 15;
      } else if (questionnaire.responses.thought_patterns.includes("Anxious") ||
                 questionnaire.responses.thought_patterns.includes("scattered")) {
        stabilityScore -= 15; // ✅ NEGATIVE: Real assessment
      }
    }
  }
  
  // Practice enhancement (builds on assessment baseline)
  if (sessions && sessions.length > 0) {
    const practiceBonus = Math.min(20, sessions.length * 1.5); // Practice enhances stability
    stabilityScore += practiceBonus;
    
    const avgQuality = sessions.reduce((sum, session) => 
      sum + (session.quality || session.rating || 3), 0) / sessions.length;
    stabilityScore += (avgQuality - 3) * 5; // Above-average quality adds bonus
  }
  
  return { stabilityScore: Math.max(0, Math.round(stabilityScore)) };
};

// ✅ UNIVERSAL: Practice-based mind recovery (Builds Skills Over Time)
const calculateMindRecoveryEffectiveness = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !sessions || sessions.length === 0) {
    return { recoveryScore: 0 }; // No practice = no recovery ability yet
  }
  
  let recoveryScore = 0; // Start from 0 - skills develop through practice
  
  // 🎯 UNIVERSAL PRACTICE PRINCIPLE: Skill Development Through Repetition
  const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const avgDuration = totalDuration / sessions.length;
  const totalHours = totalDuration / 60;
  
  // Duration Mastery: Longer sessions = deeper recovery skills
  if (avgDuration >= 30) recoveryScore += 50; // Deep practice mastery
  else if (avgDuration >= 20) recoveryScore += 40; // Strong practice
  else if (avgDuration >= 15) recoveryScore += 30; // Good practice
  else if (avgDuration >= 10) recoveryScore += 20; // Basic practice
  else if (avgDuration >= 5) recoveryScore += 12;  // Beginner practice
  
  // Volume Mastery: More practice = stronger recovery ability
  if (totalHours >= 50) recoveryScore += 45;      // Master level (50+ hours)
  else if (totalHours >= 25) recoveryScore += 35; // Advanced (25+ hours)
  else if (totalHours >= 15) recoveryScore += 25; // Intermediate (15+ hours)
  else if (totalHours >= 5) recoveryScore += 18;  // Developing (5+ hours)
  else if (totalHours >= 1) recoveryScore += 10;  // Beginning (1+ hours)
  
  // Consistency Mastery: Regular practice = reliable recovery
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter(s => new Date(s.timestamp) > thirtyDaysAgo);
  
  if (recentSessions.length >= 20) recoveryScore += 25; // Daily practice mastery
  else if (recentSessions.length >= 15) recoveryScore += 20; // Strong consistency
  else if (recentSessions.length >= 10) recoveryScore += 15; // Good consistency
  else if (recentSessions.length >= 5) recoveryScore += 10;  // Some consistency
  
  // Quality Mastery: High-quality sessions = advanced recovery skills
  const avgQuality = sessions.reduce((sum, session) => 
    sum + (session.quality || session.rating || 3), 0) / sessions.length;
  
  if (avgQuality >= 4.5) recoveryScore += 20; // Mastery-level sessions
  else if (avgQuality >= 4.0) recoveryScore += 15; // High-quality sessions
  else if (avgQuality >= 3.5) recoveryScore += 10; // Good-quality sessions
  else if (avgQuality >= 3.0) recoveryScore += 5;  // Average sessions
  // Below 3.0 gets no bonus - still developing
  
  console.log('🧘 Practice Recovery Calculation:', {
    totalHours: totalHours.toFixed(1),
    avgDuration,
    avgQuality: avgQuality.toFixed(1),
    recentSessions: recentSessions.length,
    recoveryScore
  });
  
  return { recoveryScore: Math.max(0, Math.round(recoveryScore)) };
};

// ✅ PRESERVED: Questionnaire-based emotional regulation + practice enhancement
const calculateEmotionalRegulation = (
  sessions: any[], 
  questionnaire: any, 
  hasMinimumData: boolean
): ComponentResult => {
  if (!hasMinimumData) {
    return { regulationScore: 0 };
  }
  
  let regulationScore = 0; // Start from 0 - no baseline
  
  // Primary assessment from questionnaire
  if (questionnaire?.responses) {
    const emotionalAwareness = questionnaire.responses.emotional_awareness || 1;
    regulationScore += emotionalAwareness * 6.5; // Direct conversion
    
    // Decision making under emotion
    if (questionnaire.responses.decision_making) {
      if (questionnaire.responses.decision_making.includes("Intuitive with mindful consideration")) {
        regulationScore += 20;
      } else if (questionnaire.responses.decision_making.includes("mindful")) {
        regulationScore += 12;
      } else if (questionnaire.responses.decision_making.includes("Balanced approach")) {
        regulationScore += 8;
      } else if (questionnaire.responses.decision_making.includes("Overthink")) {
        regulationScore -= 12; // ✅ NEGATIVE: Poor regulation
      }
    }
    
    // Daily mindfulness application
    if (questionnaire.responses.mindfulness_in_daily_life) {
      if (questionnaire.responses.mindfulness_in_daily_life.includes("Constant awareness")) {
        regulationScore += 18;
      } else if (questionnaire.responses.mindfulness_in_daily_life.includes("Try to be mindful")) {
        regulationScore += 8;
      } else if (questionnaire.responses.mindfulness_in_daily_life.includes("Live on autopilot")) {
        regulationScore -= 15; // ✅ NEGATIVE: No regulation
      }
    }
  }
  
  // Practice enhancement
  if (sessions && sessions.length > 0) {
    const practiceWeeks = Math.floor(sessions.length / 3);
    const practiceBonus = Math.min(15, practiceWeeks * 2);
    regulationScore += practiceBonus;
    
    const qualitySessions = sessions.filter(session => (session.quality || session.rating || 0) >= 4);
    if (qualitySessions.length > 0) {
      regulationScore += (qualitySessions.length / sessions.length) * 12;
    }
  }
  
  return { regulationScore: Math.max(0, Math.round(regulationScore)) };
};

// ✅ UNIVERSAL: Practice Consistency (Habit Formation & Discipline)
const calculatePracticeConsistency = (sessions: any[], hasMinimumData: boolean): ComponentResult => {
  if (!hasMinimumData || !sessions || sessions.length === 0) {
    return { consistencyScore: 0 }; // No practice = no discipline yet
  }
  
  let consistencyScore = 0; // Start from 0 - discipline develops through consistency
  
  // 🎯 UNIVERSAL: Consistency is the foundation of all transformation
  
  // Recent Consistency (30-day habit formation)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentSessions = sessions.filter(session => 
    new Date(session.timestamp) > thirtyDaysAgo
  );
  
  // Daily practice discipline (the gold standard)
  if (recentSessions.length >= 28) consistencyScore += 80;      // Nearly daily (master level)
  else if (recentSessions.length >= 25) consistencyScore += 70; // Excellent consistency
  else if (recentSessions.length >= 20) consistencyScore += 60; // Very good consistency
  else if (recentSessions.length >= 15) consistencyScore += 45; // Good consistency
  else if (recentSessions.length >= 10) consistencyScore += 30; // Developing consistency
  else if (recentSessions.length >= 5) consistencyScore += 18;  // Basic consistency
  else if (recentSessions.length >= 1) consistencyScore += 8;   // Starting consistency
  
  // Current Streak (momentum and discipline)
  const currentStreak = calculateSessionStreak(sessions);
  if (currentStreak >= 30) consistencyScore += 35;      // Monthly streak mastery
  else if (currentStreak >= 21) consistencyScore += 30; // 21-day habit formation
  else if (currentStreak >= 14) consistencyScore += 25; // Two-week momentum
  else if (currentStreak >= 7) consistencyScore += 20;  // Weekly momentum
  else if (currentStreak >= 3) consistencyScore += 12;  // Building momentum
  else if (currentStreak >= 1) consistencyScore += 6;   // Starting momentum
  
  // Long-term Commitment (lifetime practice development)
  const totalSessions = sessions.length;
  if (totalSessions >= 100) consistencyScore += 25;     // Serious practitioner
  else if (totalSessions >= 50) consistencyScore += 20; // Committed practitioner
  else if (totalSessions >= 25) consistencyScore += 15; // Developing practitioner
  else if (totalSessions >= 10) consistencyScore += 10; // Beginning practitioner
  else if (totalSessions >= 5) consistencyScore += 5;   // New practitioner
  
  console.log('📈 Practice Consistency Calculation:', {
    recentSessions: recentSessions.length,
    currentStreak,
    totalSessions,
    consistencyScore
  });
  
  return { consistencyScore: Math.max(0, Math.round(consistencyScore)) };
};

// ✅ UNIVERSAL: PAHM Development (Assessment Foundation + Practice Mastery)
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
  
  // 🎯 UNIVERSAL PAHM PRINCIPLE: Assessment sets foundation, Practice develops mastery
  
  let assessmentFoundation = 0; // What you think you know
  let practiceRealization = 0;  // What you actually develop
  
  // 1. ASSESSMENT FOUNDATION (Stated Experience)
  if (questionnaire?.responses) {
    const experienceLevel = questionnaire.responses.experience_level || 1;
    const mindfulnessExperience = questionnaire.responses.mindfulness_experience || 1;
    
    // Convert stated experience to foundation points (conservative)
    assessmentFoundation += experienceLevel * 2.5;        // Max 25 points from stated experience
    assessmentFoundation += mindfulnessExperience * 2;    // Max 20 points from stated mindfulness
    
    // Experience level insights
    if (experienceLevel >= 8) {
      assessmentFoundation += 5; // Bonus for claimed advanced experience
    }
  }
  
  // 2. PRACTICE REALIZATION (Actual Development Through Training)
  if (sessions && sessions.length > 0) {
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    const avgQuality = sessions.reduce((sum, session) => sum + (session.quality || session.rating || 3), 0) / totalSessions;
    const avgDuration = totalMinutes / totalSessions;
    
    // 🧘 SESSION VOLUME MASTERY (Quantity creates quality)
    if (totalSessions >= 100) practiceRealization += 35;      // Serious practitioner
    else if (totalSessions >= 50) practiceRealization += 30;  // Committed practitioner
    else if (totalSessions >= 25) practiceRealization += 25;  // Developing practitioner
    else if (totalSessions >= 15) practiceRealization += 20;  // Growing practitioner
    else if (totalSessions >= 10) practiceRealization += 15;  // Beginning practitioner
    else if (totalSessions >= 5) practiceRealization += 10;   // New practitioner
    else if (totalSessions >= 1) practiceRealization += 5;    // Starting practitioner
    
    // ⏰ TIME MASTERY (Hours of actual practice)
    if (totalHours >= 100) practiceRealization += 40;        // Master level (100+ hours)
    else if (totalHours >= 50) practiceRealization += 35;    // Advanced level (50+ hours)
    else if (totalHours >= 25) practiceRealization += 30;    // Intermediate level (25+ hours)
    else if (totalHours >= 10) practiceRealization += 25;    // Developing level (10+ hours)
    else if (totalHours >= 5) practiceRealization += 20;     // Beginning level (5+ hours)
    else if (totalHours >= 2) practiceRealization += 15;     // Starting level (2+ hours)
    else if (totalHours >= 0.5) practiceRealization += 10;   // First attempts (30+ min)
    
    // 🎯 QUALITY MASTERY (Depth of sessions)
    if (avgQuality >= 4.5) practiceRealization += 25;        // Mastery-level sessions
    else if (avgQuality >= 4.0) practiceRealization += 20;   // High-quality sessions
    else if (avgQuality >= 3.5) practiceRealization += 15;   // Good-quality sessions
    else if (avgQuality >= 3.0) practiceRealization += 10;   // Average sessions
    else if (avgQuality >= 2.5) practiceRealization += 5;    // Developing sessions
    // Below 2.5 gets no bonus - still learning
    
    // ⏳ DURATION MASTERY (Sustained attention ability)
    if (avgDuration >= 45) practiceRealization += 20;        // Advanced sustained attention
    else if (avgDuration >= 30) practiceRealization += 15;   // Strong sustained attention
    else if (avgDuration >= 20) practiceRealization += 12;   // Good sustained attention
    else if (avgDuration >= 15) practiceRealization += 10;   // Developing sustained attention
    else if (avgDuration >= 10) practiceRealization += 8;    // Basic sustained attention
    else if (avgDuration >= 5) practiceRealization += 5;     // Beginning sustained attention
    
    // 📈 RECENT MOMENTUM (Current development trajectory)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(s => new Date(s.timestamp) > thirtyDaysAgo);
    
    if (recentSessions.length >= 20) practiceRealization += 15; // Daily practice momentum
    else if (recentSessions.length >= 15) practiceRealization += 12; // Strong momentum
    else if (recentSessions.length >= 10) practiceRealization += 10; // Good momentum
    else if (recentSessions.length >= 5) practiceRealization += 8;   // Building momentum
    else if (recentSessions.length >= 1) practiceRealization += 5;   // Some momentum

  }
  
  // 3. COMBINED PAHM SCORE (Foundation + Realization)
  const overallPAHMScore = Math.round(assessmentFoundation + practiceRealization);
  
  // 🎯 DEVELOPMENT STAGE BASED ON TOTAL SCORE
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
  
  // Generate insights and recommendations
  const insights = [];
  const recommendations = [];
  
  // Assessment vs Practice insights
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
  
  // Practice-specific recommendations
  if (!sessions || sessions.length === 0) {
    recommendations.push('Begin daily 5-10 minute practice sessions');
    recommendations.push('Focus on building the habit before extending duration');
  } else if (sessions.length < 10) {
    recommendations.push('Continue building practice consistency');
    recommendations.push('Aim for daily sessions to establish the habit');
  } else if (sessions.length < 50) {
    recommendations.push('Excellent foundation - now focus on session quality');
    recommendations.push('Gradually increase average session duration');
  } else {
    recommendations.push('Strong practice foundation - explore advanced techniques');
    recommendations.push('Consider longer sessions and retreat experiences');
  }
  
  // ✅ FIXED: Calculate avgQuality and sessionQuality properly
  const avgQuality = sessions && sessions.length > 0 
    ? sessions.reduce((sum, session) => sum + (session.quality || session.rating || 3), 0) / sessions.length 
    : 0;
  const sessionQuality = sessions ? Math.round(avgQuality * 20) : 0;
  
  const breakdown = {
    presentNeutralMastery: Math.round(practiceRealization * 0.4), // Practice develops neutrality
    presentMomentDevelopment: Math.round(practiceRealization * 0.6), // Practice develops presence
    therapeuticProgress: Math.round(assessmentFoundation * 0.8), // Assessment indicates therapeutic need
    sessionQuality: sessionQuality // ✅ FIXED: Now uses correct variable name
  };
  
  console.log('🎯 PAHM Development Calculation:', {
    assessmentFoundation,
    practiceRealization,
    overallPAHMScore,
    totalSessions: sessions?.length || 0,
    totalHours: sessions ? (sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0) / 60).toFixed(1) : '0',
    avgQuality: sessions ? (sessions.reduce((sum: number, s: any) => sum + (s.quality || s.rating || 3), 0) / sessions.length).toFixed(1) : '0',
    developmentStage
  });
  
  return {
    overallPAHMScore,
    presentMomentRatio: Math.min(1, practiceRealization / 80), // Based on actual practice
    presentNeutralRatio: Math.min(1, practiceRealization / 100), // Higher threshold for neutrality
    developmentStage,
    stageDescription,
    progressionPath,
    insights,
    recommendations,
    breakdown
  };
};

// ✅ PRESERVED: Helper function for calculating session streak
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

// ================================
// ✅ PRESERVED: Main hook with universal assessment-based calculation
// ================================
export const useHappinessCalculation = (): UseHappinessCalculationReturn => {
  const { 
    practiceSessions,
    emotionalNotes,
    getQuestionnaire,
    getSelfAssessment
  } = useLocalData();

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

  // ✅ PRESERVED: Get questionnaire and self-assessment data
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

  // ✅ UNIVERSAL: Assessment-based happiness calculation (NO BASELINES)
  const calculateHappinessScore = useCallback(() => {
    setIsCalculating(true);
    
    try {
      const sessions = practiceSessions || [];
      const notes = emotionalNotes || [];
      
      console.log('🔄 Universal Assessment-Based Calculation Starting...');
      console.log('📊 Input data:', {
        questionnaire: !!questionnaire,
        selfAssessment: !!selfAssessment,
        sessionCount: sessions.length,
        notesCount: notes.length
      });
      
      // Check minimum data for calculation
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
      
      console.log('✅ Universal data completeness:', dataCompleteness);
      
      // ✅ UNIVERSAL CALCULATION: Pure assessment-driven scoring
      console.log('🧮 Calculating universal components...');
      
      // 1. Current State from Assessment (replaces arbitrary mood baseline)
      const currentStateResult = calculateCurrentStateFromAssessment(questionnaire, notes, hasMinimumData);
      const currentStateScore = extractNumericScore(currentStateResult);
      
      // 2. Attachment-Based Happiness (rewards non-attachment, penalizes attachment)
      const attachmentResult = calculateAttachmentBasedHappiness(selfAssessment, hasMinimumData);
      const attachmentScore = extractNumericScore(attachmentResult);
      
      // 3. Social Connection from Assessment
      const socialResult = calculateSocialConnection(questionnaire, hasMinimumData);
      const socialScore = extractNumericScore(socialResult);
      
      // 4. Emotional Stability (assessment + practice)
      const emotionalStabilityResult = calculateEmotionalStabilityProgress(sessions, questionnaire, hasMinimumData);
      const emotionalStabilityScore = extractNumericScore(emotionalStabilityResult);
      
      // 5. Mind Recovery from Practice
      const mindRecoveryResult = calculateMindRecoveryEffectiveness(sessions, hasMinimumData);
      const mindRecoveryScore = extractNumericScore(mindRecoveryResult);
      
      // 6. Emotional Regulation (assessment + practice)
      const emotionalRegulationResult = calculateEmotionalRegulation(sessions, questionnaire, hasMinimumData);
      const emotionalRegulationScore = extractNumericScore(emotionalRegulationResult);
      
      // 7. Practice Consistency
      const practiceConsistencyResult = calculatePracticeConsistency(sessions, hasMinimumData);
      const practiceConsistencyScore = extractNumericScore(practiceConsistencyResult);
      
      // 8. PAHM Development (assessment + practice)
      const pahmResult = calculatePAHMCentralDevelopment(sessions, questionnaire, hasMinimumData);
      const pahmScore = extractNumericScore(pahmResult);

      console.log('🎯 Universal component scores:', {
        currentStateScore,
        attachmentScore,
        socialScore,
        emotionalStabilityScore,
        mindRecoveryScore,
        emotionalRegulationScore,
        practiceConsistencyScore,
        pahmScore
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

      // ✅ UNIVERSAL WEIGHTED CALCULATION (can include negative scores)
      const weightedScore = Math.round(
        (pahmScore * 0.25) +
        (attachmentScore * 0.20) +  // ✅ CAN BE NEGATIVE for high attachment
        (emotionalStabilityScore * 0.18) +
        (currentStateScore * 0.12) +
        (emotionalRegulationScore * 0.10) +
        (mindRecoveryScore * 0.08) +
        (socialScore * 0.04) +
        (practiceConsistencyScore * 0.03)
      );

      // ✅ ALLOW NEGATIVE SCORES to reflect real assessment
      const finalHappinessScore = Math.round(weightedScore); // Actually allows negatives as you intended

      console.log('🎯 Universal final calculation:', {
        weightedScore,
        finalHappinessScore,
        breakdown: {
          pahmContribution: pahmScore * 0.25,
          attachmentContribution: attachmentScore * 0.20,
          stabilityContribution: emotionalStabilityScore * 0.18,
          currentStateContribution: currentStateScore * 0.12
        }
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

      // ✅ PRESERVED: Enhanced metrics calculation
      const focusAbility = Math.min(Math.round(pahmScore + (emotionalRegulationScore * 0.5)), 100);
      const habitChangeScore = Math.min(Math.round(pahmScore + (practiceConsistencyScore * 0.8)), 100);
      const practiceStreak = sessions.length > 0 ? calculateSessionStreak(sessions) : 0;

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

      // ✅ PRESERVED: Save to localStorage for other components
      localStorage.setItem('happiness_points', finalHappinessScore.toString());
      localStorage.setItem('user_level', userLevel);
      localStorage.setItem('focus_ability', focusAbility.toString());
      localStorage.setItem('habit_change_score', habitChangeScore.toString());
      localStorage.setItem('practice_streak', practiceStreak.toString());
      localStorage.setItem('lastHappinessUpdate', new Date().toISOString());

      // ✅ PRESERVED: Emit detailed event
      const event = new CustomEvent('happinessUpdated', {
        detail: {
          happiness_points: finalHappinessScore,
          user_level: userLevel,
          breakdown: breakdown,
          pahmAnalysis: pahmAnalysis,
          hasMinimumData: hasMinimumData,
          dataCompleteness: dataCompleteness,
          calculatedAt: new Date().toISOString(),
          trigger: 'universal_assessment_calculation'
        }
      });
      window.dispatchEvent(event);

      console.log('✅ Universal calculation completed:', {
        happiness_points: finalHappinessScore,
        user_level: userLevel,
        hasMinimumData: hasMinimumData,
        attachmentContribution: attachmentScore * 0.20
      });

    } catch (error) {
      console.error('❌ Error in universal calculation:', error);
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
    questionnaire,
    selfAssessment,
    practiceSessions,
    emotionalNotes,
    extractNumericScore,
    recalculationTrigger
  ]);

  // ✅ PRESERVED: Force recalculation function
  const forceRecalculation = useCallback(() => {
    console.log('🔄 Universal force recalculation triggered');
    setRecalculationTrigger(prev => prev + 1);
    setTimeout(() => {
      calculateHappinessScore();
    }, 100);
  }, [calculateHappinessScore]);

  // ✅ PRESERVED: Debug functions
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
      selfAssessment_data: selfAssessment,
      calculationType: 'Universal Assessment-Based (No Baselines)'
    };
    
    setCalculationDebugInfo(debugInfo);
    console.log('🔍 Universal Calculation Debug:', debugInfo);
  }, [questionnaire, selfAssessment, practiceSessions, emotionalNotes, userProgress, recalculationTrigger]);

  const logProgress = useCallback(() => {
    console.log('📊 Universal Progress:', userProgress);
    console.log('📊 Component Breakdown:', componentBreakdown);
  }, [userProgress, componentBreakdown]);

  const testComponents = useCallback(() => {
    console.log('🧪 Testing Universal Components...');
    const hasMinimumData = hasMinimumDataForCalculation(questionnaire, selfAssessment, practiceSessions || []);
    console.log('Has minimum data:', hasMinimumData);
    debugCalculation();
  }, [questionnaire, selfAssessment, practiceSessions, debugCalculation]);

  // ✅ PRESERVED: Auto-calculate when data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculateHappinessScore();
    }, 250);
    
    return () => clearTimeout(timeoutId);
  }, [calculateHappinessScore]);

  // ✅ PRESERVED: Listen for events to trigger recalculation
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'selfAssessment' || 
          e.key === 'questionnaire' || 
          e.key === 'onboardingData' ||
          e.key === 'lastAssessmentUpdate' ||
          e.key?.includes('assessment') ||
          e.key?.includes('questionnaire')) {
        console.log('🔄 Storage change detected, forcing universal recalculation:', e.key);
        forceRecalculation();
      }
    };

    const handleOnboardingEvent = (event: any) => {
      console.log('🎯 Received onboarding event, triggering universal calculation:', event.detail);
      if (event.detail.type === 'selfAssessment' || event.detail.type === 'questionnaire') {
        console.log('🔄 Onboarding event triggered universal recalculation');
        forceRecalculation();
      }
    };

    const handleHappinessRecalculation = (event: any) => {
      console.log('🚀 Direct universal happiness recalculation trigger:', event.detail);
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

  // ✅ PRESERVED: Return structure unchanged
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