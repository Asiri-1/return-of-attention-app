// happinessCalculations.ts - FIXED to match your LocalDataContext structure

export interface AttachmentResult {
    penaltyPoints: number;
    nonAttachmentBonus: number;
    level: string;
    debugInfo: any;
  }
  
  export interface HappinessBreakdown {
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
  
  export interface HappinessResult {
    happiness_points: number;
    current_level: string;
    breakdown: HappinessBreakdown;
  }
  
  // 🔧 FIXED: Match your PracticeSessionData interface
  interface PracticeSessionData {
    sessionId: string;
    timestamp: string;
    duration: number;
    sessionType: 'meditation' | 'mind_recovery';
    stageLevel?: number;
    stageLabel?: string;
    mindRecoveryContext?: string;
    mindRecoveryPurpose?: string;
    rating?: number;
    notes?: string;
    presentPercentage?: number;
    environment?: {
      posture: string;
      location: string;
      lighting: string;
      sounds: string;
    };
    pahmCounts?: {
      present_attachment: number;
      present_neutral: number;
      present_aversion: number;
      past_attachment: number;
      past_neutral: number;
      past_aversion: number;
      future_attachment: number;
      future_neutral: number;
      future_aversion: number;
    };
    recoveryMetrics?: {
      stressReduction: number;
      energyLevel: number;
      clarityImprovement: number;
      moodImprovement: number;
    };
    metadata?: any;
  }
  
  // ============================================================================
  // QUESTIONNAIRE CALCULATIONS
  // ============================================================================
  
  export const calculateBaseHappiness = (questionnaire: any): number => {
    if (!questionnaire) {
      console.log('📋 No questionnaire data - using minimum baseline');
      return 150;
    }
  
    console.log('📋 Processing questionnaire:', questionnaire);
    
    let baseline = 200;
    
    // Extract experience level (try multiple field names)
    const experience = questionnaire.experience_level || 
                      questionnaire.experienceLevel || 
                      questionnaire.mindfulnessExperience || 0;
    
    // Extract goals (try multiple field names)
    const goals = questionnaire.goals || [];
    
    // Extract sleep quality (try multiple field names)
    const sleepQuality = questionnaire.sleep_pattern || 
                        questionnaire.sleepQuality || 
                        questionnaire.sleep || 5;
    
    // Extract meditation frequency
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
  
  export const calculateQuestionnaireBonus = (questionnaire: any): number => {
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
  // ATTACHMENT PENALTY CALCULATIONS - FIXED VERSION
  // ============================================================================
  
  export const calculateAttachmentPenalty = (selfAssessment: any): AttachmentResult => {
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
    
    // 🔧 FIXED: Intent-based format (exact match required)
    if (selfAssessment.intentBased === true && selfAssessment.format === 'levels' && selfAssessment.responses) {
      return calculateIntentBasedPenalty(selfAssessment, debugInfo);
    }
    
    // 🔧 FIXED: Handle responses object (your current format) - THIS WAS MISSING!
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
  
  // 🔧 FIXED: This function was missing - handles your current data format!
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
  
  // 🔧 FIXED: This function was missing too!
  const calculateOldFormatPenalty = (selfAssessment: any, debugInfo: any): AttachmentResult => {
    console.log('⚠️ Processing old format self-assessment...');
    debugInfo.detectionPath = 'old-format';
    
    // Try to extract from old format
    let penaltyPoints = 0;
    let nonAttachmentBonus = 0;
    
    if (selfAssessment.summary) {
      // Basic penalty based on summary
      penaltyPoints = 100; // Default penalty for old format
    }
    
    return {
      penaltyPoints,
      nonAttachmentBonus,
      level: 'old-format',
      debugInfo
    };
  };
  
  const calculateIntentBasedPenalty = (selfAssessment: any, debugInfo: any): AttachmentResult => {
    console.log('✅ Processing intent-based self-assessment...');
    debugInfo.detectionPath = 'intent-based';
    
    const responses = selfAssessment.responses;
    let noneCount = 0;
    let someCount = 0;
    let strongCount = 0;
    let totalCategories = 0;
    
    console.log('🔍 Processing responses:', responses);
    console.log('🔍 Response keys:', Object.keys(responses));
    
    // Count attachment levels
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
    
    console.log('✅ Intent-based calculation result:', result);
    
    return result;
  };
  
  // ============================================================================
  // ADVANCED HAPPINESS CALCULATIONS - FIXED TO MATCH YOUR DATA
  // ============================================================================
  
  export const calculatePahmMasteryBonus = (questionnaire: any, practiceHistory: PracticeSessionData[]): number => {
    if (!questionnaire && (!practiceHistory || practiceHistory.length === 0)) return 0;
    
    let bonus = 0;
    
    // PAHM understanding bonus
    const experience = questionnaire?.experience_level || questionnaire?.experienceLevel || 0;
    if (experience >= 8) bonus += 50;
    else if (experience >= 6) bonus += 30;
    else if (experience >= 4) bonus += 15;
    
    // 🔧 FIXED: Practice consistency bonus using your data structure
    if (practiceHistory && practiceHistory.length > 0) {
      const totalSessions = practiceHistory.length;
      if (totalSessions >= 100) bonus += 40;
      else if (totalSessions >= 50) bonus += 25;
      else if (totalSessions >= 20) bonus += 15;
      else if (totalSessions >= 5) bonus += 8;
      
      // 🔧 NEW: PAHM awareness bonus from your pahmCounts
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
  
  // 🔧 FIXED: Session quality calculation using your actual data fields
  export const calculateSessionQualityBonus = (practiceHistory: PracticeSessionData[]): number => {
    if (!practiceHistory || practiceHistory.length === 0) return 0;
    
    const recentSessions = practiceHistory.slice(-10);
    const avgRating = recentSessions.reduce((sum, session) => sum + (session.rating || 7), 0) / recentSessions.length;
    
    // 🔧 FIXED: Use presentPercentage instead of focus_rating (which doesn't exist in your data)
    const avgPresent = recentSessions.reduce((sum, session) => sum + (session.presentPercentage || 70), 0) / recentSessions.length;
    
    let bonus = 0;
    
    // Rating bonus
    if (avgRating >= 9) bonus += 30;
    else if (avgRating >= 8) bonus += 20;
    else if (avgRating >= 7) bonus += 10;
    
    // 🔧 FIXED: Present percentage bonus (was focus bonus)
    if (avgPresent >= 90) bonus += 25;
    else if (avgPresent >= 80) bonus += 15;
    else if (avgPresent >= 70) bonus += 8;
    
    console.log('⭐ Session Quality Bonus:', bonus, { avgRating: avgRating.toFixed(1), avgPresent: avgPresent.toFixed(1) });
    return bonus;
  };
  
  export const calculateEmotionalStabilityBonus = (questionnaire: any, practiceHistory: PracticeSessionData[]): number => {
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
  
  // 🔧 ENHANCED: Mind recovery bonus using your recoveryMetrics
  export const calculateMindRecoveryBonus = (questionnaire: any, practiceHistory: PracticeSessionData[]): number => {
    if (!questionnaire) return 0;
    
    let bonus = 0;
    
    const sleepQuality = questionnaire.sleep_pattern || questionnaire.sleepQuality || questionnaire.sleep || 5;
    const restfulness = questionnaire.restfulness || questionnaire.energyLevel || 5;
    
    // Sleep quality bonus
    if (sleepQuality >= 9) bonus += 40;
    else if (sleepQuality >= 7) bonus += 25;
    else if (sleepQuality >= 5) bonus += 12;
    
    // Restfulness bonus
    if (restfulness >= 8) bonus += 30;
    else if (restfulness >= 6) bonus += 18;
    else if (restfulness >= 4) bonus += 8;
    
    // 🔧 NEW: Mind recovery sessions bonus using your data structure
    if (practiceHistory && practiceHistory.length > 0) {
      const mindRecoverySessions = practiceHistory.filter(session => session.sessionType === 'mind_recovery');
      const mindRecoveryUsage = practiceHistory.length > 0 ? (mindRecoverySessions.length / practiceHistory.length) * 100 : 0;
      
      if (mindRecoveryUsage >= 30) bonus += 25;
      else if (mindRecoveryUsage >= 20) bonus += 15;
      else if (mindRecoveryUsage >= 10) bonus += 8;
      
      // 🔧 NEW: Recovery metrics bonus from your recoveryMetrics field
      const sessionsWithMetrics = mindRecoverySessions.filter(session => session.recoveryMetrics);
      if (sessionsWithMetrics.length > 0) {
        const avgStressReduction = sessionsWithMetrics.reduce((sum, session) => 
          sum + (session.recoveryMetrics?.stressReduction || 0), 0) / sessionsWithMetrics.length;
        
        if (avgStressReduction >= 8) bonus += 20;
        else if (avgStressReduction >= 6) bonus += 12;
        else if (avgStressReduction >= 4) bonus += 6;
        
        console.log('🌙 Mind Recovery includes metrics bonus:', { avgStressReduction: avgStressReduction.toFixed(1) });
      }
      
      console.log('🌙 Mind Recovery usage:', { mindRecoveryUsage: mindRecoveryUsage.toFixed(1) });
    }
    
    console.log('🌙 Mind Recovery Bonus:', bonus, { sleepQuality, restfulness });
    return bonus;
  };
  
  // 🔧 ENHANCED: Environment bonus using your environment object
  export const calculateEnvironmentBonus = (questionnaire: any, practiceHistory?: PracticeSessionData[]): number => {
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
    
    // 🔧 NEW: Session-based environment bonus using your environment data
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
  
  export const calculateConsistencyBonus = (practiceHistory: PracticeSessionData[]): number => {
    if (!practiceHistory || practiceHistory.length === 0) return 0;
    
    let bonus = 0;
    
    // Calculate practice streak using your data structure
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
  
  const calculateWeeklyConsistency = (practiceHistory: PracticeSessionData[]): number => {
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
  // MAIN HAPPINESS CALCULATION - COMPREHENSIVE VERSION
  // ============================================================================
  
  export const calculateHappiness = (
    questionnaire: any,
    selfAssessment: any,
    practiceHistory: PracticeSessionData[] = []
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
    
    // 🔧 FIXED: NEW USERS GET MINIMAL POINTS
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
    
    // Advanced bonuses - ALL 10 COMPONENTS using your data structure
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
  // UTILITY FUNCTIONS
  // ============================================================================
  
  export const debugUserData = (currentUser: any) => {
    console.log('🔍 DEBUG: Full user data inspection...');
    
    if (!currentUser) {
      console.log('❌ No currentUser data');
      return;
    }
    
    console.log('👤 User keys:', Object.keys(currentUser));
    
    // Check questionnaire data
    if (currentUser.questionnaireAnswers) {
      console.log('📋 Questionnaire found:', currentUser.questionnaireAnswers);
    } else {
      console.log('❌ No questionnaireAnswers');
    }
    
    // Check self-assessment data
    if (currentUser.selfAssessmentData) {
      console.log('🎯 Self-assessment found:', currentUser.selfAssessmentData);
      console.log('🎯 Self-assessment structure:', {
        intentBased: currentUser.selfAssessmentData.intentBased,
        format: currentUser.selfAssessmentData.format,
        hasResponses: !!currentUser.selfAssessmentData.responses,
        responseKeys: currentUser.selfAssessmentData.responses ? Object.keys(currentUser.selfAssessmentData.responses) : []
      });
    } else {
      console.log('❌ No selfAssessmentData');
    }
    
    // Check practice history
    console.log('🏃 Practice history available via useLocalData hook');
  };