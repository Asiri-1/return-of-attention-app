import React, { useState, useEffect } from 'react';

// ============================================================================
// COMPLETE CALCULATION SYSTEM - NO DEMO DATA, REAL LOGIC ONLY
// ============================================================================

interface AttachmentResult {
  penaltyPoints: number;
  nonAttachmentBonus: number;
  level: string;
  debugInfo: any;
}

interface HappinessBreakdown {
  baseHappiness: number;
  questionnaireBonus: number;
  attachmentPenalty: number;
  nonAttachmentBonus: number;
  pahmMasteryBonus: number;
  sessionQualityBonus: number;
  emotionalStabilityBonus: number;
  mindRecoveryBonus: number;
  environmentBonus: number;
  consistencyBonus: number;
}

interface HappinessResult {
  happiness_points: number;
  current_level: string;
  breakdown: HappinessBreakdown;
}

interface UserProgress {
  happiness_points: number;
  focus_ability: number;
  habit_change_score: number;
  practice_streak: number;
  current_level: string;
  breakdown?: HappinessBreakdown;
}

export interface HappinessProgressTrackerProps {
  onClose?: () => void;
  // Real data props - pass your actual data here
  currentUser?: any;
  practiceHistory?: any[];
  emotionalNotes?: any[];
  mindRecoveryHistory?: any[];
  pahmData?: any;
  environmentData?: any;
  analytics?: any;
}

// ============================================================================
// QUESTIONNAIRE CALCULATIONS
// ============================================================================

const calculateBaseHappiness = (questionnaire: any): number => {
  if (!questionnaire) {
    console.log('📋 No questionnaire data - using minimum baseline');
    return 150;
  }

  console.log('📋 Processing questionnaire:', questionnaire);
  
  let baseline = 200;
  
  const experience = questionnaire.experience_level || 
                    questionnaire.experienceLevel || 
                    questionnaire.mindfulnessExperience || 0;
  
  const goals = questionnaire.goals || [];
  
  const sleepQuality = questionnaire.sleep_pattern || 
                      questionnaire.sleepQuality || 
                      questionnaire.sleep || 5;
  
  const frequency = questionnaire.practice_frequency || 
                   questionnaire.frequency || 
                   questionnaire.meditationFrequency || 3;
  
  // Apply bonuses
  if (experience >= 8) baseline += 100;
  else if (experience >= 6) baseline += 60;
  else if (experience >= 4) baseline += 30;
  else if (experience >= 2) baseline += 15;
  
  baseline += Math.round((sleepQuality - 5) * 8);
  baseline += (Array.isArray(goals) ? goals.length : 0) * 10;
  baseline += frequency * 5;
  
  const finalBaseline = Math.max(150, baseline);
  
  console.log('📋 Base happiness result:', {
    experience,
    sleepQuality,
    frequency,
    goalCount: Array.isArray(goals) ? goals.length : 0,
    baseline,
    finalBaseline
  });
  
  return finalBaseline;
};

const calculateQuestionnaireBonus = (questionnaire: any): number => {
  if (!questionnaire) return 0;
  
  let bonus = 0;
  
  const experience = questionnaire.experience_level || 
                    questionnaire.experienceLevel || 
                    questionnaire.mindfulnessExperience || 0;
  
  const sleepQuality = questionnaire.sleep_pattern || 
                      questionnaire.sleepQuality || 
                      questionnaire.sleep || 0;
  
  const frequency = questionnaire.practice_frequency || 
                   questionnaire.frequency || 
                   questionnaire.meditationFrequency || 0;
  
  const stressLevel = questionnaire.stress_level || 
                     questionnaire.stressLevel || 5;
  
  // Experience bonus
  if (experience >= 8) bonus += 40;
  else if (experience >= 6) bonus += 25;
  else if (experience >= 4) bonus += 15;
  
  // Sleep bonus
  if (sleepQuality >= 9) bonus += 30;
  else if (sleepQuality >= 7) bonus += 20;
  else if (sleepQuality >= 5) bonus += 10;
  
  // Frequency bonus
  if (frequency >= 6) bonus += 25;
  else if (frequency >= 4) bonus += 15;
  else if (frequency >= 2) bonus += 8;
  
  // Stress management bonus (lower stress = higher bonus)
  if (stressLevel <= 2) bonus += 20;
  else if (stressLevel <= 4) bonus += 10;
  
  console.log('📋 Questionnaire bonus result:', {
    experience,
    sleepQuality,
    frequency,
    stressLevel,
    bonus
  });
  
  return bonus;
};

// ============================================================================
// ATTACHMENT PENALTY CALCULATIONS - COMPLETE LOGIC
// ============================================================================

const calculateAttachmentPenalty = (selfAssessment: any): AttachmentResult => {
  console.log('🔍 FIXED: Starting attachment penalty calculation...');
  console.log('🔍 FIXED: Self-assessment input:', selfAssessment);
  
  const debugInfo = {
    inputExists: !!selfAssessment,
    inputType: typeof selfAssessment,
    inputKeys: selfAssessment ? Object.keys(selfAssessment) : [],
    detectionPath: 'none'
  };
  
  // No data case
  if (!selfAssessment) {
    console.log('❌ No self-assessment data provided');
    debugInfo.detectionPath = 'no-data';
    return {
      penaltyPoints: 0,
      nonAttachmentBonus: 0,
      level: 'no-data',
      debugInfo
    };
  }
  
  // Intent-based format (exact match required)
  if (selfAssessment.intentBased === true && selfAssessment.format === 'levels' && selfAssessment.responses) {
    return calculateIntentBasedPenalty(selfAssessment, debugInfo);
  }
  
  // Handle responses object (your current format) - THIS IS THE KEY FIX!
  if (selfAssessment.responses && typeof selfAssessment.responses === 'object') {
    console.log('🔧 FIXED: Processing responses object (current format)');
    debugInfo.detectionPath = 'responses-object';
    return calculateResponsesBasedPenalty(selfAssessment, debugInfo);
  }
  
  // Old format detection
  if (selfAssessment.sixSenses || selfAssessment.summary) {
    console.log('⚠️ Old self-assessment format detected');
    debugInfo.detectionPath = 'old-format-detected';
    return calculateOldFormatPenalty(selfAssessment, debugInfo);
  }
  
  // Unknown format
  console.log('❌ Unknown self-assessment format');
  debugInfo.detectionPath = 'unknown-format';
  return {
    penaltyPoints: 0,
    nonAttachmentBonus: 0,
    level: 'unknown-format',
    debugInfo
  };
};

const calculateResponsesBasedPenalty = (selfAssessment: any, debugInfo: any): AttachmentResult => {
  console.log('🔧 FIXED: Processing responses object (current format)...');
  debugInfo.detectionPath = 'responses-object';
  
  const responses = selfAssessment.responses;
  let noneCount = 0;
  let someCount = 0;
  let strongCount = 0;
  let totalCategories = 0;
  
  console.log('🔍 Processing responses:', responses);
  console.log('🔍 Response keys:', Object.keys(responses));
  
  // Count attachment levels from responses
  Object.entries(responses).forEach(([category, response]: [string, any]) => {
    console.log(`📝 Processing ${category}:`, response);
    
    if (response && response.level) {
      totalCategories++;
      
      switch (response.level) {
        case 'none':
          noneCount++;
          console.log(`✨ ${category}: Non-attachment detected`);
          break;
        case 'some':
          someCount++;
          console.log(`⚖️ ${category}: Some attachment detected`);
          break;
        case 'strong':
          strongCount++;
          console.log(`🔥 ${category}: Strong attachment detected`);
          break;
        default:
          console.log(`⚠️ ${category}: Unknown level "${response.level}"`);
      }
    } else {
      console.log(`⚠️ ${category}: Invalid response format`, response);
    }
  });
  
  // Calculate penalty: some = 25 points, strong = 75 points
  const penaltyPoints = (someCount * 25) + (strongCount * 75);
  
  // Calculate non-attachment bonus
  const nonAttachmentPercentage = totalCategories > 0 ? (noneCount / totalCategories) * 100 : 0;
  let nonAttachmentBonus = 0;
  
  if (nonAttachmentPercentage >= 80) nonAttachmentBonus = 120;
  else if (nonAttachmentPercentage >= 60) nonAttachmentBonus = 80;
  else if (nonAttachmentPercentage >= 40) nonAttachmentBonus = 40;
  else if (nonAttachmentPercentage >= 20) nonAttachmentBonus = 20;
  
  // Determine attachment level
  let level = 'unknown';
  if (strongCount >= 4) level = 'very-high';
  else if (strongCount >= 2 || someCount >= 4) level = 'high';
  else if (strongCount >= 1 || someCount >= 2) level = 'medium';
  else if (someCount >= 1) level = 'low';
  else if (noneCount === totalCategories) level = 'non-attached';
  else level = 'very-low';
  
  const result = {
    penaltyPoints,
    nonAttachmentBonus,
    level,
    debugInfo: {
      ...debugInfo,
      totalCategories,
      noneCount,
      someCount,
      strongCount,
      nonAttachmentPercentage: nonAttachmentPercentage.toFixed(1),
      calculation: `${someCount} × 25 + ${strongCount} × 75 = ${penaltyPoints}`
    }
  };
  
  console.log('✅ Responses-based calculation result:', result);
  
  return result;
};

const calculateIntentBasedPenalty = (selfAssessment: any, debugInfo: any): AttachmentResult => {
  console.log('✅ Processing intent-based self-assessment...');
  debugInfo.detectionPath = 'intent-based';
  
  const responses = selfAssessment.responses;
  let noneCount = 0;
  let someCount = 0;
  let strongCount = 0;
  let totalCategories = 0;
  
  Object.entries(responses).forEach(([category, response]: [string, any]) => {
    if (response && response.level) {
      totalCategories++;
      
      switch (response.level) {
        case 'none':
          noneCount++;
          break;
        case 'some':
          someCount++;
          break;
        case 'strong':
          strongCount++;
          break;
      }
    }
  });
  
  const penaltyPoints = (someCount * 25) + (strongCount * 75);
  const nonAttachmentPercentage = totalCategories > 0 ? (noneCount / totalCategories) * 100 : 0;
  let nonAttachmentBonus = 0;
  
  if (nonAttachmentPercentage >= 80) nonAttachmentBonus = 120;
  else if (nonAttachmentPercentage >= 60) nonAttachmentBonus = 80;
  else if (nonAttachmentPercentage >= 40) nonAttachmentBonus = 40;
  else if (nonAttachmentPercentage >= 20) nonAttachmentBonus = 20;
  
  let level = 'unknown';
  if (strongCount >= 4) level = 'very-high';
  else if (strongCount >= 2 || someCount >= 4) level = 'high';
  else if (strongCount >= 1 || someCount >= 2) level = 'medium';
  else if (someCount >= 1) level = 'low';
  else if (noneCount === totalCategories) level = 'non-attached';
  else level = 'very-low';
  
  return {
    penaltyPoints,
    nonAttachmentBonus,
    level,
    debugInfo: {
      ...debugInfo,
      totalCategories,
      noneCount,
      someCount,
      strongCount,
      nonAttachmentPercentage: nonAttachmentPercentage.toFixed(1),
      calculation: `${someCount} × 25 + ${strongCount} × 75 = ${penaltyPoints}`
    }
  };
};

const calculateOldFormatPenalty = (selfAssessment: any, debugInfo: any): AttachmentResult => {
  console.log('⚠️ Processing old format self-assessment...');
  debugInfo.detectionPath = 'old-format';
  
  let penaltyPoints = 0;
  let nonAttachmentBonus = 0;
  
  if (selfAssessment.summary) {
    penaltyPoints = 100; // Default penalty for old format
  }
  
  return {
    penaltyPoints,
    nonAttachmentBonus,
    level: 'old-format',
    debugInfo
  };
};

// ============================================================================
// ADVANCED HAPPINESS CALCULATIONS
// ============================================================================

const calculatePahmMasteryBonus = (questionnaire: any, practiceHistory: any[]): number => {
  if (!questionnaire && (!practiceHistory || practiceHistory.length === 0)) return 0;
  
  let bonus = 0;
  
  // PAHM understanding bonus
  const experience = questionnaire?.experience_level || questionnaire?.experienceLevel || 0;
  if (experience >= 8) bonus += 50;
  else if (experience >= 6) bonus += 30;
  else if (experience >= 4) bonus += 15;
  
  // Practice consistency bonus
  if (practiceHistory && practiceHistory.length > 0) {
    const totalSessions = practiceHistory.length;
    if (totalSessions >= 100) bonus += 40;
    else if (totalSessions >= 50) bonus += 25;
    else if (totalSessions >= 20) bonus += 15;
    else if (totalSessions >= 5) bonus += 8;
    
    // PAHM awareness bonus
    const sessionsWithPAHM = practiceHistory.filter(session => session.pahmCounts).length;
    const pahmAwarenessPercentage = totalSessions > 0 ? (sessionsWithPAHM / totalSessions) * 100 : 0;
    
    if (pahmAwarenessPercentage >= 80) bonus += 30;
    else if (pahmAwarenessPercentage >= 60) bonus += 20;
    else if (pahmAwarenessPercentage >= 40) bonus += 10;
    
    console.log('🧘 PAHM Mastery includes awareness bonus:', { sessionsWithPAHM, pahmAwarenessPercentage: pahmAwarenessPercentage.toFixed(1) });
  }
  
  console.log('🧘 PAHM Mastery Bonus:', bonus);
  return bonus;
};

const calculateSessionQualityBonus = (practiceHistory: any[]): number => {
  if (!practiceHistory || practiceHistory.length === 0) return 0;
  
  const recentSessions = practiceHistory.slice(-10);
  const avgRating = recentSessions.reduce((sum, session) => sum + (session.rating || 7), 0) / recentSessions.length;
  const avgPresent = recentSessions.reduce((sum, session) => sum + (session.presentPercentage || 70), 0) / recentSessions.length;
  
  let bonus = 0;
  
  // Rating bonus
  if (avgRating >= 9) bonus += 30;
  else if (avgRating >= 8) bonus += 20;
  else if (avgRating >= 7) bonus += 10;
  
  // Present percentage bonus
  if (avgPresent >= 90) bonus += 25;
  else if (avgPresent >= 80) bonus += 15;
  else if (avgPresent >= 70) bonus += 8;
  
  console.log('⭐ Session Quality Bonus:', bonus, { avgRating: avgRating.toFixed(1), avgPresent: avgPresent.toFixed(1) });
  return bonus;
};

const calculateEmotionalStabilityBonus = (questionnaire: any, practiceHistory: any[]): number => {
  if (!questionnaire) return 0;
  
  let bonus = 0;
  
  const stressLevel = questionnaire.stress_level || questionnaire.stressLevel || 5;
  const moodStability = questionnaire.mood_stability || questionnaire.moodStability || 5;
  const emotionalAwareness = questionnaire.emotional_awareness || questionnaire.emotionalAwareness || 5;
  
  // Stress management bonus (lower stress = higher bonus)
  if (stressLevel <= 2) bonus += 35;
  else if (stressLevel <= 3) bonus += 25;
  else if (stressLevel <= 4) bonus += 15;
  
  // Mood stability bonus
  if (moodStability >= 8) bonus += 30;
  else if (moodStability >= 6) bonus += 20;
  else if (moodStability >= 4) bonus += 10;
  
  // Emotional awareness bonus
  if (emotionalAwareness >= 8) bonus += 25;
  else if (emotionalAwareness >= 6) bonus += 15;
  else if (emotionalAwareness >= 4) bonus += 8;
  
  console.log('😌 Emotional Stability Bonus:', bonus, { stressLevel, moodStability, emotionalAwareness });
  return bonus;
};

// ✅ FIXED: Mind Recovery Bonus - Only for users who have actually done mind recovery sessions
const calculateMindRecoveryBonus = (questionnaire: any, practiceHistory: any[]): number => {
  // ✅ FIXED: Only give mind recovery bonus if user has actually done mind recovery sessions
  if (!practiceHistory || practiceHistory.length === 0) {
    console.log('🌙 No practice history - no mind recovery bonus');
    return 0;
  }
  
  // Check if user has actually done mind recovery sessions
  const mindRecoverySessions = practiceHistory.filter(session => 
    session.sessionType === 'mind_recovery' || 
    session.type === 'mind_recovery' ||
    session.recoveryMetrics
  );
  
  if (mindRecoverySessions.length === 0) {
    console.log('🌙 No mind recovery sessions found - no bonus');
    return 0;
  }
  
  console.log(`🌙 Found ${mindRecoverySessions.length} mind recovery sessions - calculating bonus`);
  
  let bonus = 0;
  
  // ✅ FIXED: Only give questionnaire-based bonus if user has done mind recovery practice
  if (questionnaire && mindRecoverySessions.length > 0) {
    const sleepQuality = questionnaire.sleep_pattern || questionnaire.sleepQuality || questionnaire.sleep || 5;
    const restfulness = questionnaire.restfulness || questionnaire.energyLevel || 5;
    
    // Sleep quality bonus (only if they've practiced mind recovery)
    if (sleepQuality >= 9) bonus += 40;
    else if (sleepQuality >= 7) bonus += 25;
    else if (sleepQuality >= 5) bonus += 12;
    
    // Restfulness bonus (only if they've practiced mind recovery)
    if (restfulness >= 8) bonus += 30;
    else if (restfulness >= 6) bonus += 18;
    else if (restfulness >= 4) bonus += 8;
  }
  
  // Mind recovery sessions bonus (based on actual practice)
  const mindRecoveryUsage = practiceHistory.length > 0 ? (mindRecoverySessions.length / practiceHistory.length) * 100 : 0;
  
  if (mindRecoveryUsage >= 30) bonus += 25;
  else if (mindRecoveryUsage >= 20) bonus += 15;
  else if (mindRecoveryUsage >= 10) bonus += 8;
  
  // Recovery effectiveness bonus (based on actual results)
  const sessionsWithMetrics = mindRecoverySessions.filter(session => session.recoveryMetrics);
  if (sessionsWithMetrics.length > 0) {
    const avgStressReduction = sessionsWithMetrics.reduce((sum, session) => 
      sum + (session.recoveryMetrics?.stressReduction || 0), 0) / sessionsWithMetrics.length;
    
    if (avgStressReduction >= 8) bonus += 20;
    else if (avgStressReduction >= 6) bonus += 12;
    else if (avgStressReduction >= 4) bonus += 6;
    
    console.log('🌙 Mind Recovery includes metrics bonus:', { avgStressReduction: avgStressReduction.toFixed(1) });
  }
  
  console.log('🌙 Mind Recovery Bonus (FIXED):', bonus, { 
    mindRecoverySessionCount: mindRecoverySessions.length,
    usagePercentage: mindRecoveryUsage.toFixed(1)
  });
  
  return bonus;
};

const calculateEnvironmentBonus = (questionnaire: any, practiceHistory?: any[]): number => {
  let bonus = 0;
  
  // Questionnaire-based environment bonus
  if (questionnaire) {
    const practiceEnvironment = questionnaire.practice_environment || questionnaire.environment || 'mixed';
    const distractionLevel = questionnaire.distraction_level || questionnaire.distractions || 5;
    const supportSystem = questionnaire.support_system || questionnaire.socialSupport || 5;
    
    // Environment bonus
    if (practiceEnvironment === 'dedicated_space') bonus += 25;
    else if (practiceEnvironment === 'quiet_room') bonus += 18;
    else if (practiceEnvironment === 'nature') bonus += 20;
    else if (practiceEnvironment === 'outdoor') bonus += 15;
    
    // Low distraction bonus
    if (distractionLevel <= 2) bonus += 20;
    else if (distractionLevel <= 3) bonus += 12;
    else if (distractionLevel <= 4) bonus += 6;
    
    // Support system bonus
    if (supportSystem >= 8) bonus += 25;
    else if (supportSystem >= 6) bonus += 15;
    else if (supportSystem >= 4) bonus += 8;
  }
  
  // Session-based environment bonus
  if (practiceHistory && practiceHistory.length > 0) {
    const sessionsWithEnv = practiceHistory.filter(session => session.environment);
    const envUsagePercentage = practiceHistory.length > 0 ? (sessionsWithEnv.length / practiceHistory.length) * 100 : 0;
    
    if (envUsagePercentage >= 80) bonus += 15;
    else if (envUsagePercentage >= 60) bonus += 10;
    else if (envUsagePercentage >= 40) bonus += 5;
    
    // Optimal environment bonus
    const outdoorSessions = sessionsWithEnv.filter(session => 
      session.environment?.location?.toLowerCase().includes('outdoor') ||
      session.environment?.location?.toLowerCase().includes('nature')
    ).length;
    
    if (outdoorSessions >= 5) bonus += 10;
    
    console.log('🏡 Environment tracking bonus:', { envUsagePercentage: envUsagePercentage.toFixed(1), outdoorSessions });
  }
  
  console.log('🏡 Environment Bonus:', bonus);
  return bonus;
};

const calculateConsistencyBonus = (practiceHistory: any[]): number => {
  if (!practiceHistory || practiceHistory.length === 0) return 0;
  
  let bonus = 0;
  
  // Calculate practice streak
  const sortedSessions = [...practiceHistory].sort((a, b) => 
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
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  // Streak bonus
  if (streak >= 30) bonus += 60;
  else if (streak >= 14) bonus += 40;
  else if (streak >= 7) bonus += 25;
  else if (streak >= 3) bonus += 12;
  
  // Weekly consistency bonus
  const weeklyConsistency = calculateWeeklyConsistency(practiceHistory);
  if (weeklyConsistency >= 0.8) bonus += 30;
  else if (weeklyConsistency >= 0.6) bonus += 20;
  else if (weeklyConsistency >= 0.4) bonus += 10;
  
  console.log('📅 Consistency Bonus:', bonus, { streak, weeklyConsistency: (weeklyConsistency * 100).toFixed(1) + '%' });
  return bonus;
};

const calculateWeeklyConsistency = (practiceHistory: any[]): number => {
  if (!practiceHistory || practiceHistory.length === 0) return 0;
  
  const weeks = Math.ceil(practiceHistory.length / 7);
  if (weeks === 0) return 0;
  
  const practicesByWeek: { [key: string]: number } = {};
  
  practiceHistory.forEach(session => {
    const date = new Date(session.timestamp);
    const weekKey = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
    practicesByWeek[weekKey] = (practicesByWeek[weekKey] || 0) + 1;
  });
  
  const weeksWithPractice = Object.keys(practicesByWeek).length;
  return weeksWithPractice / weeks;
};

// ============================================================================
// MAIN HAPPINESS CALCULATION - NO DEMO DATA
// ============================================================================

const calculateHappiness = (
  questionnaire: any,
  selfAssessment: any,
  practiceHistory: any[] = []
): HappinessResult => {
  
  console.log('🧠 Starting comprehensive happiness calculation...');
  console.log('📊 Input data summary:', {
    hasQuestionnaire: !!questionnaire,
    hasSelfAssessment: !!selfAssessment,
    practiceSessionCount: practiceHistory.length,
    selfAssessmentKeys: selfAssessment ? Object.keys(selfAssessment) : [],
    practiceSessionsWithPAHM: practiceHistory.filter(s => s.pahmCounts).length,
    mindRecoverySessions: practiceHistory.filter(s => s.sessionType === 'mind_recovery').length
  });
  
  // NEW USERS GET MINIMAL POINTS
  if (!questionnaire && !selfAssessment && practiceHistory.length === 0) {
    console.log('🆕 NEW USER: No data available, returning minimal baseline');
    return {
      happiness_points: 50,
      current_level: 'Newcomer',
      breakdown: {
        baseHappiness: 50,
        questionnaireBonus: 0,
        attachmentPenalty: 0,
        nonAttachmentBonus: 0,
        pahmMasteryBonus: 0,
        sessionQualityBonus: 0,
        emotionalStabilityBonus: 0,
        mindRecoveryBonus: 0,
        environmentBonus: 0,
        consistencyBonus: 0
      }
    };
  }
  
  // Calculate all components ONLY if data exists
  const baseHappiness = calculateBaseHappiness(questionnaire);
  const questionnaireBonus = calculateQuestionnaireBonus(questionnaire);
  const attachmentResult = calculateAttachmentPenalty(selfAssessment);
  
  // Advanced bonuses - ALL 10 COMPONENTS
  const pahmMasteryBonus = calculatePahmMasteryBonus(questionnaire, practiceHistory);
  const sessionQualityBonus = calculateSessionQualityBonus(practiceHistory);
  const emotionalStabilityBonus = calculateEmotionalStabilityBonus(questionnaire, practiceHistory);
  const mindRecoveryBonus = calculateMindRecoveryBonus(questionnaire, practiceHistory);
  const environmentBonus = calculateEnvironmentBonus(questionnaire, practiceHistory);
  const consistencyBonus = calculateConsistencyBonus(practiceHistory);
  
  // Final calculation with ALL components
  const finalHappiness = Math.max(50,
    baseHappiness +
    questionnaireBonus +
    pahmMasteryBonus +
    sessionQualityBonus +
    emotionalStabilityBonus +
    mindRecoveryBonus +
    environmentBonus +
    consistencyBonus +
    attachmentResult.nonAttachmentBonus -
    attachmentResult.penaltyPoints
  );
  
  // Determine level
  let currentLevel = 'Newcomer';
  if (finalHappiness >= 1200) currentLevel = 'Master';
  else if (finalHappiness >= 1000) currentLevel = 'Expert';
  else if (finalHappiness >= 800) currentLevel = 'Advanced';
  else if (finalHappiness >= 600) currentLevel = 'Intermediate';
  else if (finalHappiness >= 400) currentLevel = 'Beginner';
  
  const breakdown: HappinessBreakdown = {
    baseHappiness,
    questionnaireBonus,
    attachmentPenalty: attachmentResult.penaltyPoints,
    nonAttachmentBonus: attachmentResult.nonAttachmentBonus,
    pahmMasteryBonus,
    sessionQualityBonus,
    emotionalStabilityBonus,
    mindRecoveryBonus,
    environmentBonus,
    consistencyBonus
  };
  
  const result: HappinessResult = {
    happiness_points: finalHappiness,
    current_level: currentLevel,
    breakdown
  };
  
  console.log('🧠 Final comprehensive happiness calculation result:', {
    ...breakdown,
    finalHappiness,
    currentLevel,
    formula: `${baseHappiness} + ${questionnaireBonus} + ${pahmMasteryBonus} + ${sessionQualityBonus} + ${emotionalStabilityBonus} + ${mindRecoveryBonus} + ${environmentBonus} + ${consistencyBonus} + ${attachmentResult.nonAttachmentBonus} - ${attachmentResult.penaltyPoints} = ${finalHappiness}`,
    attachmentDebugInfo: attachmentResult.debugInfo
  });
  
  return result;
};

// ============================================================================
// COMPONENT
// ============================================================================

const HappinessProgressTracker: React.FC<HappinessProgressTrackerProps> = ({ 
  onClose,
  currentUser,
  practiceHistory = [],
  emotionalNotes = [],
  mindRecoveryHistory = [],
  pahmData,
  environmentData,
  analytics
}) => {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    happiness_points: 50,
    focus_ability: 0,
    habit_change_score: 0,
    practice_streak: 0,
    current_level: 'Newcomer'
  });

  const [showDebug, setShowDebug] = useState(false);

  // Calculate happiness using real data
  useEffect(() => {
    console.log('🔄 Calculating happiness with real data...');
    
    // Extract real data
    const questionnaire = currentUser?.questionnaireAnswers;
    const selfAssessment = currentUser?.selfAssessmentData;
    
    console.log('📊 Real Data Summary:', {
      hasQuestionnaire: !!questionnaire,
      hasSelfAssessment: !!selfAssessment,
      questionnaire,
      selfAssessment,
      practiceSessionCount: practiceHistory.length,
      emotionalNotesCount: emotionalNotes.length,
      mindRecoveryCount: mindRecoveryHistory.length
    });
    
    // Calculate happiness with real data
    const happinessResult = calculateHappiness(questionnaire, selfAssessment, practiceHistory);
    
    // ✅ FIXED: Save happiness results to localStorage for other components
    localStorage.setItem('happiness_points', happinessResult.happiness_points.toString());
    localStorage.setItem('user_level', happinessResult.current_level);
    
    // ✅ FIXED: Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('happinessUpdated', {
      detail: {
        happiness_points: happinessResult.happiness_points,
        user_level: happinessResult.current_level,
        breakdown: happinessResult.breakdown
      }
    }));
    
    console.log('✅ Happiness results saved to localStorage:', {
      happiness_points: happinessResult.happiness_points,
      user_level: happinessResult.current_level
    });
    
    // Calculate other metrics
    let calculatedProgress: UserProgress = {
      happiness_points: happinessResult.happiness_points,
      current_level: happinessResult.current_level,
      focus_ability: 0,
      habit_change_score: 0,
      practice_streak: 0,
      breakdown: happinessResult.breakdown
    };

    // Calculate focus ability from practice sessions
    if (practiceHistory.length > 0) {
      const recentSessions = practiceHistory.slice(-7);
      const avgPresentMoment = recentSessions.reduce((sum, session) => {
        const presentPercentage = session.presentPercentage || (session.rating ? session.rating * 10 : 70);
        return sum + presentPercentage;
      }, 0) / recentSessions.length;
      
      const avgQuality = recentSessions.reduce((sum, session) => {
        return sum + (session.rating || 7);
      }, 0) / recentSessions.length;
      
      calculatedProgress.focus_ability = Math.round(
        Math.min(100, (avgPresentMoment * 0.6) + (avgQuality * 10 * 0.4))
      );
    }

    // Calculate habit change from mind recovery effectiveness
    if (mindRecoveryHistory.length > 0) {
      const recentRecoveries = mindRecoveryHistory.slice(-10);
      const avgEffectiveness = recentRecoveries.reduce((sum, session) => {
        const rating = session.rating || 6;
        const stressReduction = session.recoveryMetrics?.stressReduction || 0;
        const effectiveness = stressReduction > 0 ? 
                             (stressReduction * 10 + rating * 5) / 2 : 
                             rating * 10;
        return sum + effectiveness;
      }, 0) / recentRecoveries.length;
      
      calculatedProgress.habit_change_score = Math.round(Math.min(100, avgEffectiveness));
    }

    // Get practice streak from analytics
    if (analytics) {
      calculatedProgress.practice_streak = analytics.currentStreak || 0;
    }

    setUserProgress(calculatedProgress);
    console.log('✅ Real happiness calculation completed:', calculatedProgress);

  }, [currentUser, practiceHistory, emotionalNotes, mindRecoveryHistory, analytics]);

  return (
    <div style={{ 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, color: 'white', fontSize: '24px' }}>
          😊 Your Mindfulness Journey
        </h1>
        <div>
          <button 
            onClick={() => setShowDebug(!showDebug)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 15px',
              color: 'white',
              marginRight: '10px',
              cursor: 'pointer'
            }}
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '30px'
      }}>
        {/* Main Happiness Score */}
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'linear-gradient(135deg, #ff6b6b 0%, #ffa500 50%, #32cd32 100%)',
          color: 'white',
          borderRadius: '20px',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '10px' }}>
            {userProgress.happiness_points}
          </div>
          <div style={{ fontSize: '1.5rem', marginBottom: '15px' }}>
            Happiness Points
          </div>
          <div style={{ 
            fontSize: '1.3rem', 
            marginBottom: '10px',
            padding: '10px 20px', 
            background: 'rgba(255,255,255,0.2)', 
            borderRadius: '10px',
            fontWeight: 'bold',
            display: 'inline-block'
          }}>
            {userProgress.current_level}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.9 }}>
            Based on {practiceHistory.length} sessions, {emotionalNotes.length} notes, {mindRecoveryHistory.length} recovery sessions
          </div>
        </div>

        {/* Detailed Breakdown */}
        {userProgress.breakdown && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
              Happiness Components Breakdown
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.baseHappiness}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Base Practice</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.pahmMasteryBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>PAHM Mastery</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.sessionQualityBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Session Quality</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.emotionalStabilityBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Emotional Stability</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.mindRecoveryBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Mind Recovery</div>
              </div>
              
              <div style={{
                background: 'linear-gradient(135deg, #16a085 0%, #1abc9c 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  -{userProgress.breakdown.attachmentPenalty}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Attachment Penalty</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.nonAttachmentBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Non-Attachment Bonus</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.questionnaireBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Questionnaire Bonus</div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #d35400 0%, #e67e22 100%)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>
                  +{userProgress.breakdown.consistencyBonus}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Consistency Bonus</div>
              </div>
            </div>
          </div>
        )}

        {/* Other Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProgress.focus_ability}%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Focus Ability</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProgress.habit_change_score}%
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Habit Change</div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
            color: 'white',
            padding: '24px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
              {userProgress.practice_streak}
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9 }}>Day Streak</div>
          </div>
        </div>

        {/* Debug Panel */}
        {showDebug && userProgress.breakdown && (
          <div style={{
            background: '#f8f9fa',
            padding: '20px',
            borderRadius: '15px',
            border: '2px solid #e9ecef',
            marginTop: '20px'
          }}>
            <h4 style={{ color: '#333', marginBottom: '15px' }}>🔍 Debug Information</h4>
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>Data Sources:</strong>
                <br />• Questionnaire: {currentUser?.questionnaireAnswers ? '✅ Available' : '❌ Missing'}
                <br />• Self-Assessment: {currentUser?.selfAssessmentData ? '✅ Available' : '❌ Missing'}
                <br />• Practice Sessions: {practiceHistory.length} sessions
                <br />• Emotional Notes: {emotionalNotes.length} notes
                <br />• Mind Recovery: {mindRecoveryHistory.length} sessions
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Calculation Formula:</strong>
                <br />Base ({userProgress.breakdown.baseHappiness}) + Questionnaire ({userProgress.breakdown.questionnaireBonus}) + PAHM ({userProgress.breakdown.pahmMasteryBonus}) + Quality ({userProgress.breakdown.sessionQualityBonus}) + Emotional ({userProgress.breakdown.emotionalStabilityBonus}) + Recovery ({userProgress.breakdown.mindRecoveryBonus}) + Environment ({userProgress.breakdown.environmentBonus}) + Consistency ({userProgress.breakdown.consistencyBonus}) + Non-Attachment ({userProgress.breakdown.nonAttachmentBonus}) - Attachment Penalty ({userProgress.breakdown.attachmentPenalty}) = <strong>{userProgress.happiness_points}</strong>
              </div>
              {currentUser?.selfAssessmentData && (
                <div>
                  <strong>Self-Assessment Debug:</strong>
                  <br />• Format: {currentUser.selfAssessmentData.format || 'unknown'}
                  <br />• Intent-Based: {currentUser.selfAssessmentData.intentBased ? 'true' : 'false'}
                  <br />• Has Responses: {currentUser.selfAssessmentData.responses ? 'true' : 'false'}
                  {currentUser.selfAssessmentData.responses && (
                    <div>
                      <br />• Response Keys: {Object.keys(currentUser.selfAssessmentData.responses).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HappinessProgressTracker;