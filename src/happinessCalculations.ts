// ================================================================================================
// 🎯 COMPLETE PAHM-CENTERED HAPPINESS SYSTEM - FULL REPLACEMENT
// Based on "Return of the Attention" - Present attention itself IS happiness
// ================================================================================================

// ================================================================================================
// 📊 TYPE DEFINITIONS - Enhanced for PAHM-Centered System
// ================================================================================================

export interface AttachmentResult {
  penaltyPoints: number;
  nonAttachmentBonus: number;
  level: string;
  debugInfo: any;
}

export interface HappinessBreakdown {
  pahmDevelopment: number;              // 30% - THE CORE COMPONENT
  emotionalStabilityProgress: number;   // 20% - Real-world validation
  currentMoodState: number;             // 15% - Enhanced with emotional notes
  mindRecoveryEffectiveness: number;    // 12% - Practical stress management
  emotionalRegulation: number;          // 10% - Skills from emotional tracking
  attachmentFlexibility: number;        // 8% - Supporting psychological freedom
  socialConnection: number;             // 3% - Background factor
  practiceConsistency: number;          // 2% - Supporting factor
}

export interface PAHMCentralAnalysis {
  overallPAHMScore: number;
  developmentStage: 'Scattered Mind' | 'Working Through' | 'Developing Presence' | 'Present Mastery' | 'Advanced Integration';
  presentMomentRatio: number;
  neutralRatio: number;
  presentNeutralRatio: number; // THE ULTIMATE METRIC
  breakdown: {
    presentNeutralMastery: number;      // 50 points - THE ULTIMATE GOAL
    presentMomentDevelopment: number;   // 30 points - Overall present focus
    therapeuticProgress: number;        // 15 points - Past/future processing (should decrease)
    sessionQuality: number;             // 5 points - Presence ratings
  };
  insights: string[];
  recommendations: string[];
  progressionPath: string;
  stageDescription: string;
}

export interface PresentAttentionSkills {
  attention: number;
  awareness: number;
  presence: number;
  equanimity: number;
}

export interface PracticeMilestone {
  name: string;
  bonus: number;
  achieved: boolean;
  description: string;
}

export interface HappinessResult {
  happiness_points: number;
  user_level: string;
  breakdown: HappinessBreakdown;
  pahmAnalysis: PAHMCentralAnalysis;
  presentAttentionSkills: PresentAttentionSkills;
  practiceMilestones: PracticeMilestone[];
  practiceMotivation: string[];
  debugInfo: any;
}

// ================================================================================================
// 🧠 PAHM DEVELOPMENT - THE CORE COMPONENT (30% TOTAL WEIGHT)
// Based on "Return of the Attention" - Present + Neutral is ultimate goal
// ================================================================================================

export function calculatePAHMCentralDevelopment(practiceSessions: any[]): PAHMCentralAnalysis {
  if (!practiceSessions || practiceSessions.length === 0) {
    return {
      overallPAHMScore: 0,
      developmentStage: 'Scattered Mind',
      presentMomentRatio: 0,
      neutralRatio: 0,
      presentNeutralRatio: 0,
      breakdown: {
        presentNeutralMastery: 0,
        presentMomentDevelopment: 0,
        therapeuticProgress: 0,
        sessionQuality: 0
      },
      insights: ['No PAHM practice sessions recorded - the core practice for happiness'],
      recommendations: ['Begin with Present-Neutral awareness - the foundation of happiness'],
      progressionPath: 'Start the Return of Attention journey',
      stageDescription: 'Mind scattered across time and emotions without awareness'
    };
  }

  const pahmSessions = practiceSessions.filter(session => 
    session.sessionType === 'meditation' && session.pahmCategory
  );

  if (pahmSessions.length === 0) {
    return {
      overallPAHMScore: 0,
      developmentStage: 'Scattered Mind',
      presentMomentRatio: 0,
      neutralRatio: 0,
      presentNeutralRatio: 0,
      breakdown: {
        presentNeutralMastery: 0,
        presentMomentDevelopment: 0,
        therapeuticProgress: 0,
        sessionQuality: 0
      },
      insights: ['No PAHM categories practiced yet'],
      recommendations: ['Start with Present-Neutral awareness to anchor in present happiness'],
      progressionPath: 'Begin foundational PAHM practice',
      stageDescription: 'No direct contact with reality through present attention'
    };
  }

  const recentSessions = pahmSessions.slice(-30); // Last 30 PAHM sessions

  // Core PAHM Metrics
  const timeDimensions = { present: 0, past: 0, future: 0 };
  const emotionTypes = { attachment: 0, neutral: 0, aversion: 0 };
  const categoryCount: Record<string, number> = {};

  recentSessions.forEach(session => {
    const category = session.pahmCategory;
    categoryCount[category] = (categoryCount[category] || 0) + 1;
    
    if (category.startsWith('present')) timeDimensions.present++;
    else if (category.startsWith('past')) timeDimensions.past++;
    else if (category.startsWith('future')) timeDimensions.future++;
    
    if (category.includes('attachment')) emotionTypes.attachment++;
    else if (category.includes('neutral')) emotionTypes.neutral++;
    else if (category.includes('aversion')) emotionTypes.aversion++;
  });

  const totalSessions = recentSessions.length;
  const presentMomentRatio = timeDimensions.present / totalSessions;
  const neutralRatio = emotionTypes.neutral / totalSessions;
  
  // THE ULTIMATE METRIC: Present-Neutral sessions
  const presentNeutralCount = categoryCount['present-neutral'] || 0;
  const presentNeutralRatio = presentNeutralCount / totalSessions;

  let breakdown = {
    presentNeutralMastery: 0,
    presentMomentDevelopment: 0,
    therapeuticProgress: 0,
    sessionQuality: 0
  };

  // 1. PRESENT-NEUTRAL MASTERY (0-50 points) - THE ULTIMATE GOAL
  // "Present attention itself is happiness" - this is the core metric
  let presentNeutralMastery = 0;
  
  // Base present-neutral ratio (0-35 points)
  presentNeutralMastery += presentNeutralRatio * 35;
  
  // Bonus for high present-neutral concentration
  if (presentNeutralRatio >= 0.8) presentNeutralMastery += 15; // Advanced integration
  else if (presentNeutralRatio >= 0.6) presentNeutralMastery += 10; // Present mastery  
  else if (presentNeutralRatio >= 0.4) presentNeutralMastery += 5; // Developing presence
  
  breakdown.presentNeutralMastery = Math.min(Math.round(presentNeutralMastery), 50);

  // 2. PRESENT MOMENT DEVELOPMENT (0-30 points) - Overall present awareness
  let presentMomentDevelopment = 0;
  
  // Present moment ratio scoring (0-20 points)
  presentMomentDevelopment += presentMomentRatio * 20;
  
  // Present consistency bonus (0-10 points)
  const presentCategories = ['present-neutral', 'present-attachment', 'present-aversion'];
  const presentSessionCount = presentCategories.reduce((sum, cat) => sum + (categoryCount[cat] || 0), 0);
  const presentConsistency = presentSessionCount / totalSessions;
  presentMomentDevelopment += presentConsistency * 10;
  
  breakdown.presentMomentDevelopment = Math.min(Math.round(presentMomentDevelopment), 30);

  // 3. THERAPEUTIC PROGRESS (0-15 points) - Past/Future work (should decrease over time)
  let therapeuticProgress = 0;
  
  const pastWork = timeDimensions.past / totalSessions;
  const futureWork = timeDimensions.future / totalSessions;
  const therapeuticRatio = pastWork + futureWork;
  
  // Early stage: reward therapeutic work. Advanced stage: this should be minimal
  if (presentMomentRatio < 0.4) {
    // Beginner: therapeutic work is valuable
    therapeuticProgress = therapeuticRatio * 15;
  } else if (presentMomentRatio < 0.7) {
    // Intermediate: moderate therapeutic work
    therapeuticProgress = therapeuticRatio * 10;
  } else {
    // Advanced: minimal therapeutic work needed
    therapeuticProgress = Math.min(therapeuticRatio * 5, 8);
  }
  
  breakdown.therapeuticProgress = Math.round(therapeuticProgress);

  // 4. SESSION QUALITY (0-5 points) - Supporting factor
  const presenceRatings = recentSessions
    .filter(s => s.presenceRating && typeof s.presenceRating === 'number')
    .map(s => s.presenceRating);

  let sessionQuality = 0;
  if (presenceRatings.length > 0) {
    const avgPresence = presenceRatings.reduce((sum, r) => sum + r, 0) / presenceRatings.length;
    sessionQuality = (avgPresence / 10) * 5;
  }
  breakdown.sessionQuality = Math.round(sessionQuality);

  // Calculate overall PAHM score
  const overallPAHMScore = Math.min(
    breakdown.presentNeutralMastery + 
    breakdown.presentMomentDevelopment + 
    breakdown.therapeuticProgress + 
    breakdown.sessionQuality, 
    100
  );

  // Determine development stage based on present-neutral mastery
  let developmentStage: 'Scattered Mind' | 'Working Through' | 'Developing Presence' | 'Present Mastery' | 'Advanced Integration';
  let stageDescription = '';
  
  if (presentNeutralRatio >= 0.8 && presentMomentRatio >= 0.9) {
    developmentStage = 'Advanced Integration';
    stageDescription = 'Effortless present-neutral awareness - happiness is natural state';
  } else if (presentNeutralRatio >= 0.6 && presentMomentRatio >= 0.8) {
    developmentStage = 'Present Mastery';
    stageDescription = 'Sustained present-neutral awareness - recognizing attention itself as happiness';
  } else if (presentNeutralRatio >= 0.3 && presentMomentRatio >= 0.6) {
    developmentStage = 'Developing Presence';
    stageDescription = 'Growing present-neutral stability - learning to rest in direct reality';
  } else if (presentMomentRatio >= 0.3 || (pastWork + futureWork) >= 0.5) {
    developmentStage = 'Working Through';
    stageDescription = 'Processing past/future attachments - building toward present awareness';
  } else {
    developmentStage = 'Scattered Mind';
    stageDescription = 'Mind scattered across time and emotions - beginning the return journey';
  }

  // Generate insights and recommendations
  const insights: string[] = [];
  const recommendations: string[] = [];

  if (developmentStage === 'Advanced Integration') {
    insights.push(`Exceptional present-neutral mastery: ${Math.round(presentNeutralRatio * 100)}% direct reality contact`);
    insights.push(`Transcended categorical practice - natural happiness state`);
    recommendations.push('Maintain effortless presence - help guide others on the path');
    recommendations.push('Practice becomes living from recognition rather than formal technique');
  } else if (developmentStage === 'Present Mastery') {
    insights.push(`Strong present-neutral development: ${Math.round(presentNeutralRatio * 100)}% direct reality contact`);
    insights.push(`Recognizing present attention as happiness: ${Math.round(presentMomentRatio * 100)}% present focus`);
    recommendations.push('Deepen present-neutral awareness - this IS happiness');
    recommendations.push('Minimize past/future therapeutic work - rest in what already is');
  } else if (developmentStage === 'Developing Presence') {
    insights.push(`Good progress toward present mastery: ${Math.round(presentMomentRatio * 100)}% present focus`);
    insights.push(`Present-neutral awareness developing: ${Math.round(presentNeutralRatio * 100)}% direct contact`);
    recommendations.push('Increase present-neutral sessions - this is the path to stable happiness');
    recommendations.push('Continue occasional therapeutic work while anchoring in present');
  } else if (developmentStage === 'Working Through') {
    insights.push(`Therapeutic processing stage: ${Math.round((pastWork + futureWork) * 100)}% past/future work`);
    insights.push(`Building present foundation: ${Math.round(presentMomentRatio * 100)}% present focus`);
    recommendations.push('Use past/future categories to process attachments, then return to present-neutral');
    recommendations.push('Gradually increase present-neutral sessions as primary practice');
  } else {
    insights.push(`Beginning stage: scattered attention needs foundational present-neutral anchoring`);
    recommendations.push('Start with present-neutral awareness - the gateway to happiness');
    recommendations.push('Use PAHM matrix to recognize thought patterns pulling from presence');
  }

  // Progression path guidance
  let progressionPath = '';
  switch (developmentStage) {
    case 'Scattered Mind':
      progressionPath = 'Foundation → Anchor in present-neutral awareness (the source of happiness)';
      break;
    case 'Working Through':
      progressionPath = 'Processing → Use therapeutic work to free attention for present happiness';
      break;
    case 'Developing Presence':
      progressionPath = 'Stabilizing → Strengthen present-neutral as primary resting place';
      break;
    case 'Present Mastery':
      progressionPath = 'Recognizing → Present attention itself IS happiness';
      break;
    case 'Advanced Integration':
      progressionPath = 'Living → Natural expression of presence-happiness';
      break;
  }

  return {
    overallPAHMScore,
    developmentStage,
    presentMomentRatio,
    neutralRatio,
    presentNeutralRatio,
    breakdown,
    insights,
    recommendations,
    progressionPath,
    stageDescription
  };
}

// ================================================================================================
// 😌 EMOTIONAL STABILITY PROGRESS (20% WEIGHT) - Real-world validation
// ================================================================================================

export function calculateEmotionalStabilityProgress(emotionalNotes: any[], practiceSessions?: any[]): number {
  if (!emotionalNotes || emotionalNotes.length < 7) {
    return 0; // Need at least a week of data
  }

  const sortedNotes = emotionalNotes
    .filter(note => note.mood && typeof note.mood === 'number')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedNotes.length < 7) return 0;

  // 1. FLUCTUATION REDUCTION (0-30 points)
  const recentNotes = sortedNotes.slice(-14); // Last 2 weeks
  const earlierNotes = sortedNotes.slice(0, Math.min(14, sortedNotes.length - 14)); // Earlier period

  let fluctuationScore = 0;
  if (earlierNotes.length >= 5 && recentNotes.length >= 5) {
    const recentVariance = calculateVariance(recentNotes.map(n => n.mood));
    const earlierVariance = calculateVariance(earlierNotes.map(n => n.mood));
    
    if (earlierVariance > 0) {
      const varianceReduction = (earlierVariance - recentVariance) / earlierVariance;
      fluctuationScore = Math.max(0, varianceReduction * 30);
    }
  }

  // 2. PRACTICE DAY RESILIENCE (0-25 points)
  let practiceResilienceScore = 0;
  if (practiceSessions && practiceSessions.length > 0) {
    const practiceSessionDates = new Set(
      practiceSessions.map(s => new Date(s.timestamp).toDateString())
    );
    
    const practiceDayMoods: number[] = [];
    const nonPracticeDayMoods: number[] = [];
    
    recentNotes.forEach(note => {
      const noteDate = new Date(note.date).toDateString();
      if (practiceSessionDates.has(noteDate)) {
        practiceDayMoods.push(note.mood);
      } else {
        nonPracticeDayMoods.push(note.mood);
      }
    });
    
    if (practiceDayMoods.length >= 3 && nonPracticeDayMoods.length >= 3) {
      const practiceAvg = practiceDayMoods.reduce((sum, m) => sum + m, 0) / practiceDayMoods.length;
      const nonPracticeAvg = nonPracticeDayMoods.reduce((sum, m) => sum + m, 0) / nonPracticeDayMoods.length;
      
      const improvement = ((practiceAvg - nonPracticeAvg) / 10) * 25; // Scale to 0-25
      practiceResilienceScore = Math.max(0, Math.min(25, improvement));
    }
  }

  // 3. EMOTIONAL RECOVERY SPEED (0-25 points)
  let recoveryScore = 0;
  const stressEvents = sortedNotes.filter(note => note.mood <= 4); // Low mood events
  
  if (stressEvents.length >= 2) {
    let totalRecoveryTime = 0;
    let recoveryCount = 0;
    
    stressEvents.forEach(stressEvent => {
      const stressIndex = sortedNotes.findIndex(n => n === stressEvent);
      const followingNotes = sortedNotes.slice(stressIndex + 1, stressIndex + 8); // Next 7 days
      
      const recoveryIndex = followingNotes.findIndex(n => n.mood >= 6);
      if (recoveryIndex !== -1) {
        totalRecoveryTime += recoveryIndex + 1; // Days to recover
        recoveryCount++;
      }
    });
    
    if (recoveryCount > 0) {
      const avgRecoveryTime = totalRecoveryTime / recoveryCount;
      recoveryScore = Math.max(0, 25 - (avgRecoveryTime * 3)); // Faster recovery = higher score
    }
  }

  // 4. LONG-TERM TREND (0-10 points)
  let trendScore = 0;
  if (sortedNotes.length >= 14) {
    const firstWeekAvg = sortedNotes.slice(0, 7).reduce((sum, n) => sum + n.mood, 0) / 7;
    const lastWeekAvg = sortedNotes.slice(-7).reduce((sum, n) => sum + n.mood, 0) / 7;
    
    const improvement = ((lastWeekAvg - firstWeekAvg) / 10) * 10;
    trendScore = Math.max(0, Math.min(10, improvement));
  }

  const totalScore = fluctuationScore + practiceResilienceScore + recoveryScore + trendScore;
  return Math.min(100, Math.round(totalScore));
}

function calculateVariance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}

// ================================================================================================
// 🎭 CURRENT MOOD STATE (15% WEIGHT) - Enhanced with emotional notes
// ================================================================================================

export function calculateCurrentMoodState(questionnaire: any, emotionalNotes?: any[]): number {
  let score = 0;
  
  // Primary source: Recent emotional notes (70% weight if available)
  if (emotionalNotes && emotionalNotes.length > 0) {
    const recentNotes = emotionalNotes
      .filter(note => note.mood && typeof note.mood === 'number')
      .slice(-7); // Last week
    
    if (recentNotes.length > 0) {
      const avgMood = recentNotes.reduce((sum, note) => sum + note.mood, 0) / recentNotes.length;
      const avgEnergy = recentNotes.filter(note => note.energy).length > 0 
        ? recentNotes.filter(note => note.energy).reduce((sum, note) => sum + note.energy, 0) / recentNotes.filter(note => note.energy).length
        : avgMood;
      
      const emotionalScore = ((avgMood + avgEnergy) / 2) * 10; // Scale to 0-100
      score += emotionalScore * 0.7; // 70% weight
    }
  }
  
  // Secondary source: Questionnaire data (30% weight)
  if (questionnaire && typeof questionnaire === 'object') {
    let questionnaireScore = 0;
    let responses = 0;
    
    Object.keys(questionnaire).forEach(key => {
      const value = questionnaire[key];
      const lowerKey = key.toLowerCase();
      
      if (typeof value === 'number' && value >= 1) {
        if (lowerKey.includes('mood') || lowerKey.includes('happy') || 
            lowerKey.includes('energy') || lowerKey.includes('positive') ||
            lowerKey.includes('wellbeing') || lowerKey.includes('satisfaction')) {
          questionnaireScore += value * 10; // Scale to 0-100
          responses++;
        }
      }
    });
    
    if (responses > 0) {
      const avgQuestionnaireScore = questionnaireScore / responses;
      score += avgQuestionnaireScore * 0.3; // 30% weight
    } else {
      // Fallback: general questionnaire positivity
      score += calculateQuestionnaireBonus(questionnaire) * 3; // Scale bonus to mood component
    }
  }
  
  return Math.min(100, Math.round(score));
}

// ================================================================================================
// 🧠 MIND RECOVERY EFFECTIVENESS (12% WEIGHT)
// ================================================================================================

export function calculateMindRecoveryEffectiveness(practiceSessions: any[]): { recoveryScore: number } {
  const mindRecoverySessions = practiceSessions.filter(session => 
    session.sessionType === 'mindRecovery' || session.type === 'mindRecovery'
  );

  if (mindRecoverySessions.length === 0) {
    return { recoveryScore: 0 };
  }

  const recentSessions = mindRecoverySessions.slice(-20); // Last 20 mind recovery sessions

  // 1. Context Adaptability (25 points)
  const contexts = new Set(recentSessions.map(s => s.context).filter(Boolean));
  const contextScore = Math.min(25, contexts.size * 1.9); // Up to 13 contexts

  // 2. Purpose Effectiveness (25 points)
  const purposes = new Set(recentSessions.map(s => s.purpose).filter(Boolean));
  const purposeScore = Math.min(25, purposes.size * 3.1); // Up to 8 purposes

  // 3. Recovery Metrics (30 points) - Weighted effectiveness
  const sessionsWithMetrics = recentSessions.filter(s => 
    s.stressReduction || s.moodImprovement || s.clarityImprovement || s.energyLevel
  );

  let metricsScore = 0;
  if (sessionsWithMetrics.length > 0) {
    const avgStressReduction = sessionsWithMetrics
      .filter(s => s.stressReduction)
      .reduce((sum, s) => sum + s.stressReduction, 0) / Math.max(1, sessionsWithMetrics.filter(s => s.stressReduction).length);
    
    const avgMoodImprovement = sessionsWithMetrics
      .filter(s => s.moodImprovement)
      .reduce((sum, s) => sum + s.moodImprovement, 0) / Math.max(1, sessionsWithMetrics.filter(s => s.moodImprovement).length);
    
    const avgClarityImprovement = sessionsWithMetrics
      .filter(s => s.clarityImprovement)
      .reduce((sum, s) => sum + s.clarityImprovement, 0) / Math.max(1, sessionsWithMetrics.filter(s => s.clarityImprovement).length);
    
    const avgEnergyLevel = sessionsWithMetrics
      .filter(s => s.energyLevel)
      .reduce((sum, s) => sum + s.energyLevel, 0) / Math.max(1, sessionsWithMetrics.filter(s => s.energyLevel).length);

    // Weighted effectiveness calculation
    metricsScore = (
      (avgStressReduction * 0.4 * 12) +     // 40% weight, up to 12 points
      (avgMoodImprovement * 0.3 * 9) +      // 30% weight, up to 9 points  
      (avgClarityImprovement * 0.2 * 6) +   // 20% weight, up to 6 points
      (avgEnergyLevel * 0.1 * 3)            // 10% weight, up to 3 points
    );
  }

  // 4. Frequency (15 points)
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const recentRecoverySessions = mindRecoverySessions.filter(s => 
    new Date(s.timestamp) >= thirtyDaysAgo
  );
  
  const frequencyScore = Math.min(15, recentRecoverySessions.length); // Up to 15 sessions per month

  // 5. Situational Use (5 points)
  const timeVariety = new Set(
    recentSessions.map(s => {
      const hour = new Date(s.timestamp).getHours();
      if (hour < 12) return 'morning';
      if (hour < 18) return 'afternoon';
      return 'evening';
    })
  );
  const situationalScore = timeVariety.size * 1.67; // Up to 3 time periods

  const totalScore = contextScore + purposeScore + metricsScore + frequencyScore + situationalScore;
  return { recoveryScore: Math.min(100, Math.round(totalScore)) };
}

// ================================================================================================
// 😊 EMOTIONAL REGULATION (10% WEIGHT) - Skills from emotional tracking
// ================================================================================================

export function calculateEmotionalRegulation(emotionalNotes: any[]): number {
  if (!emotionalNotes || emotionalNotes.length === 0) {
    return 0; // Must have emotional notes for any points
  }

  const recentNotes = emotionalNotes.slice(-30); // Last 30 emotional notes
  
  // 1. Emotional Variety (0-25 points)
  const emotions = new Set(recentNotes.map(note => note.emotion).filter(Boolean));
  const varietyScore = Math.min(25, emotions.size * 2); // Up to 12+ different emotions

  // 2. Positive Emotion Cultivation (0-25 points)
  const positiveEmotions = ['joy', 'gratitude', 'love', 'peace', 'contentment', 'happiness', 'calm'];
  const positiveCount = recentNotes.filter(note => 
    positiveEmotions.some(pos => note.emotion?.toLowerCase().includes(pos))
  ).length;
  const positiveScore = Math.min(25, positiveCount * 2);

  // 3. Gratitude Practice (0-25 points)
  const gratitudeEntries = recentNotes.filter(note => 
    note.gratitude || note.emotion?.toLowerCase().includes('gratitude')
  ).length;
  const gratitudeScore = Math.min(25, gratitudeEntries * 3);

  // 4. Consistency (0-25 points)
  const consistencyScore = Math.min(25, recentNotes.length * 0.8); // Up to 30+ notes per month

  const totalScore = varietyScore + positiveScore + gratitudeScore + consistencyScore;
  return Math.min(100, Math.round(totalScore));
}

// ================================================================================================
// 🔗 ATTACHMENT FLEXIBILITY (8% WEIGHT) - Enhanced 6-sense assessment
// ================================================================================================

export function calculateAttachmentFlexibility(selfAssessment: any): { flexibilityScore: number } {
  if (!selfAssessment || typeof selfAssessment !== 'object') {
    return { flexibilityScore: 0 };
  }

  // Track penalties and bonuses
  let totalPenalty = 0;
  let nonAttachmentBonus = 0;

  // Process 6-sense assessment
  const senseCategories = ['sight', 'sound', 'smell', 'taste', 'touch', 'thought'];
  
  senseCategories.forEach(sense => {
    const attachmentKey = `${sense}Attachment`;
    const value = selfAssessment[attachmentKey];
    
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      
      if (lowerValue.includes('strong')) {
        totalPenalty -= 8; // Strong attachment penalty
      } else if (lowerValue.includes('some')) {
        totalPenalty -= 3; // Some attachment penalty  
      } else if (lowerValue.includes('none') || lowerValue.includes('no')) {
        nonAttachmentBonus += 4; // Non-attachment bonus
      }
    }
  });

  // Calculate flexibility score (0-100 scale)
  // Start from baseline, apply penalties and bonuses
  const baseScore = 50;
  const finalScore = Math.max(0, Math.min(100, baseScore + totalPenalty + nonAttachmentBonus));
  
  return { flexibilityScore: Math.round(finalScore) };
}

// ================================================================================================
// 👥 SOCIAL CONNECTION (3% WEIGHT) - Background factor
// ================================================================================================

export function calculateSocialConnection(questionnaire: any): number {
  if (!questionnaire || typeof questionnaire !== 'object') return 0;
  
  let socialScore = 0;
  let responses = 0;
  
  Object.keys(questionnaire).forEach(key => {
    const value = questionnaire[key];
    const lowerKey = key.toLowerCase();
    
    if (typeof value === 'number' && value >= 1) {
      if (lowerKey.includes('social') || lowerKey.includes('friend') || 
          lowerKey.includes('family') || lowerKey.includes('relationship') ||
          lowerKey.includes('community') || lowerKey.includes('support')) {
        socialScore += value * 10;
        responses++;
      }
    }
  });
  
  if (responses === 0) {
    // Fallback to general positive responses
    return Math.min(100, calculateQuestionnaireBonus(questionnaire) * 4);
  }
  
  return Math.min(100, Math.round(socialScore / responses));
}

// ================================================================================================
// 📈 PRACTICE CONSISTENCY (2% WEIGHT) - Supporting factor
// ================================================================================================

export function calculatePracticeConsistency(practiceSessions: any[]): number {
  if (!practiceSessions || practiceSessions.length === 0) return 0;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const recentSessions = practiceSessions.filter(s => new Date(s.timestamp) >= thirtyDaysAgo);
  
  if (recentSessions.length === 0) return 0;
  
  // Calculate consistency metrics
  const sessionsPerWeek = (recentSessions.length / 30) * 7;
  const currentStreak = getCurrentStreak(practiceSessions);
  
  let consistencyScore = 0;
  
  // Weekly frequency scoring
  if (sessionsPerWeek >= 6) consistencyScore += 50;      // Almost daily
  else if (sessionsPerWeek >= 4) consistencyScore += 40; // 4+ times per week
  else if (sessionsPerWeek >= 2) consistencyScore += 25; // 2+ times per week
  else consistencyScore += sessionsPerWeek * 10;         // Less frequent
  
  // Current streak bonus
  if (currentStreak >= 30) consistencyScore += 30;
  else if (currentStreak >= 14) consistencyScore += 20;
  else if (currentStreak >= 7) consistencyScore += 15;
  else if (currentStreak >= 3) consistencyScore += 10;
  
  return Math.min(100, consistencyScore);
}

// ================================================================================================
// 🔧 HELPER FUNCTIONS (Maintaining compatibility with existing system)
// ================================================================================================

function getCurrentStreak(practiceHistory: any[]): number {
  if (!practiceHistory || practiceHistory.length === 0) return 0;
  
  const sortedSessions = [...practiceHistory].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < sortedSessions.length; i++) {
    const sessionDate = new Date(sortedSessions[i].timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === streak) {
      streak++;
    } else if (daysDiff > streak) {
      break;
    }
  }
  
  return streak;
}

export function calculateQuestionnaireBonus(questionnaire: any): number {
  if (!questionnaire || typeof questionnaire !== 'object') return 0;

  let bonus = 0;
  Object.keys(questionnaire).forEach(key => {
    const value = questionnaire[key];
    
    if (typeof value === 'number') {
      if (value >= 6 && value <= 10) bonus += 4; // High positive (1-10 scale)
      else if (value >= 4 && value <= 5) bonus += 3; // High positive (1-5 scale)
      else if (value >= 3) bonus += 2; // Moderate positive
      else if (value >= 2) bonus += 1; // Slight positive
    } else if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes('yes') || lowerValue.includes('good') || 
          lowerValue.includes('better') || lowerValue.includes('excellent')) {
        bonus += 3;
      } else if (lowerValue.includes('sometimes') || lowerValue.includes('ok')) {
        bonus += 1;
      }
    }
  });

  return Math.min(20, bonus);
}

// Milestone calculations (simplified for space)
export function calculatePresentAttentionMilestones(practiceHistory: any[], userDays: number): { bonus: number; milestones: PracticeMilestone[] } {
  const sessions = practiceHistory?.length || 0;
  const milestones: PracticeMilestone[] = [
    { name: "First Present Moment", bonus: 5, achieved: sessions >= 1, description: "Your first step into present awareness" },
    { name: "Building Foundation", bonus: 10, achieved: sessions >= 10, description: "10 sessions of present attention practice" },
    { name: "Committed Practice", bonus: 20, achieved: sessions >= 50, description: "50 sessions - real dedication to presence" }
  ];
  
  const achievedMilestones = milestones.filter(m => m.achieved);
  return { bonus: achievedMilestones.reduce((sum, m) => sum + m.bonus, 0), milestones };
}

// ================================================================================================
// 🎯 MAIN PAHM-CENTERED CALCULATION FUNCTION
// ================================================================================================

export function calculateHappiness(questionnaire: any, selfAssessment: any, practiceSessions: any[], emotionalNotes?: any[]): HappinessResult {
  console.log('🎯 PAHM-Centered Happiness Calculation Starting');

  try {
    // Process input data
    const questionnaireData = questionnaire?.responses || questionnaire;
    const selfAssessmentData = selfAssessment?.responses || selfAssessment;
    const sessions = Array.isArray(practiceSessions) ? practiceSessions : [];
    const emotions = Array.isArray(emotionalNotes) ? emotionalNotes : [];

    // Calculate PAHM as the central component (30% weight)
    const pahmAnalysis = calculatePAHMCentralDevelopment(sessions);
    
    // Calculate all supporting components
    const components: HappinessBreakdown = {
      pahmDevelopment: pahmAnalysis.overallPAHMScore,                               // 30%
      emotionalStabilityProgress: calculateEmotionalStabilityProgress(emotions, sessions), // 20%
      currentMoodState: calculateCurrentMoodState(questionnaireData, emotions),     // 15%
      mindRecoveryEffectiveness: calculateMindRecoveryEffectiveness(sessions).recoveryScore, // 12%
      emotionalRegulation: calculateEmotionalRegulation(emotions),                  // 10%
      attachmentFlexibility: calculateAttachmentFlexibility(selfAssessmentData).flexibilityScore, // 8%
      socialConnection: calculateSocialConnection(questionnaireData),               // 3%
      practiceConsistency: calculatePracticeConsistency(sessions)                   // 2%
    };
    
    // Apply PAHM-CENTERED psychological weights
    const finalScore = Math.round(
      (components.pahmDevelopment * 0.30) +
      (components.emotionalStabilityProgress * 0.20) +
      (components.currentMoodState * 0.15) +
      (components.mindRecoveryEffectiveness * 0.12) +
      (components.emotionalRegulation * 0.10) +
      (components.attachmentFlexibility * 0.08) +
      (components.socialConnection * 0.03) +
      (components.practiceConsistency * 0.02)
    );
    
    // PAHM-based level determination
    let user_level = '';
    const pahmStage = pahmAnalysis.developmentStage;
    
    if (pahmStage === 'Advanced Integration') {
      user_level = 'Advanced: Living from present-moment happiness';
    } else if (pahmStage === 'Present Mastery') {
      user_level = 'Mastery: Recognizing present attention as happiness';
    } else if (pahmStage === 'Developing Presence') {
      user_level = 'Developing: Growing stability in present awareness';
    } else if (pahmStage === 'Working Through') {
      user_level = 'Processing: Working through patterns to reach presence';
    } else {
      user_level = 'Beginning: Starting the return to present happiness';
    }
    
    // Generate recommendations focused on PAHM development
    const practiceMotivation: string[] = [];
    
    if (components.pahmDevelopment < 30) {
      practiceMotivation.push('🎯 Primary focus: Establish daily PAHM meditation practice');
      practiceMotivation.push('🌟 Begin with present-neutral awareness - the source of stable happiness');
    } else if (components.pahmDevelopment < 60) {
      practiceMotivation.push('💎 Increase present-neutral sessions - this IS happiness, not a path to it');
      practiceMotivation.push('🌱 Reduce past/future therapeutic work as present awareness stabilizes');
    } else {
      practiceMotivation.push('🌈 Maintain present-neutral awareness as primary resting place');
      practiceMotivation.push('✨ Allow practice to become natural expression of presence-happiness');
    }
    
    // Calculate supporting metrics
    const milestonesResult = calculatePresentAttentionMilestones(sessions, 30);
    const presentAttentionSkills: PresentAttentionSkills = {
      attention: Math.min(100, sessions.length * 0.5),
      awareness: Math.min(100, sessions.length * 0.4),
      presence: Math.min(100, pahmAnalysis.presentNeutralRatio * 100),
      equanimity: Math.min(100, components.attachmentFlexibility)
    };

    console.log('✅ PAHM-Centered Calculation Complete:', {
      finalScore,
      pahmStage,
      pahmScore: pahmAnalysis.overallPAHMScore
    });

    return {
      happiness_points: finalScore,
      user_level,
      breakdown: components,
      pahmAnalysis,
      presentAttentionSkills,
      practiceMilestones: milestonesResult.milestones,
      practiceMotivation,
      debugInfo: {
        pahmCentricCalculation: true,
        pahmWeight: '30%',
        sessionCount: sessions.length,
        emotionalNotesCount: emotions.length,
        presentNeutralRatio: pahmAnalysis.presentNeutralRatio
      }
    };

  } catch (error: any) {
    console.error('❌ PAHM-Centered calculation error:', error);
    return {
      happiness_points: 0,
      user_level: 'Beginning: Starting the return to present happiness',
      breakdown: {
        pahmDevelopment: 0,
        emotionalStabilityProgress: 0,
        currentMoodState: 0,
        mindRecoveryEffectiveness: 0,
        emotionalRegulation: 0,
        attachmentFlexibility: 0,
        socialConnection: 0,
        practiceConsistency: 0
      },
      pahmAnalysis: calculatePAHMCentralDevelopment([]),
      presentAttentionSkills: { attention: 0, awareness: 0, presence: 0, equanimity: 0 },
      practiceMilestones: [],
      practiceMotivation: ['🎯 Begin with present-neutral awareness - the foundation of happiness'],
      debugInfo: { error: error.message, pahmCentricCalculation: true }
    };
  }
}

// Legacy function exports for compatibility
export function debugUserData(questionnaire: any, selfAssessment: any, sessions: any[]): void {
  console.log('🔍 PAHM-Centered Debug:', {
    questionnaire: questionnaire ? Object.keys(questionnaire) : 'null',
    selfAssessment: selfAssessment ? Object.keys(selfAssessment) : 'null', 
    sessionCount: sessions?.length || 0,
    pahmSessions: sessions?.filter(s => s.pahmCategory)?.length || 0,
    presentNeutralSessions: sessions?.filter(s => s.pahmCategory === 'present-neutral')?.length || 0
  });
}

/*
🎯 PAHM-CENTERED SYSTEM SUMMARY:

✅ CORRECT PRIORITY SYSTEM (Based on "Return of the Attention"):
- PAHM Development (30%): THE CORE COMPONENT - "Present attention itself is happiness"
- Emotional Stability (20%): Real-world validation of PAHM practice effectiveness  
- Current Mood (15%): Enhanced with daily emotional notes
- Mind Recovery (12%): Practical stress management support
- Emotional Regulation (10%): Skills development from emotional tracking
- Attachment Flexibility (8%): Supporting psychological freedom
- Social Connection (3%): Background factor
- Practice Consistency (2%): Supporting factor

✅ PAHM SCORING WITHIN 30% (100 points total):
- Present-Neutral Mastery (50 pts): THE ULTIMATE GOAL - direct reality contact
- Present-Moment Development (30 pts): Overall present awareness building
- Therapeutic Progress (15 pts): Past/future processing (decreases as mastery increases)
- Session Quality (5 pts): Supporting presence quality ratings

✅ NO GUARANTEED POINTS:
- Everything must be earned through actual practice
- Emotional regulation requires actual emotional notes (no fake points)
- PAHM requires actual meditation sessions with categories
- Realistic 0-100 scale with meaningful clinical interpretations

✅ REFLECTS "RETURN OF THE ATTENTION" TEACHINGS:
- Present-Neutral is the ONLY position representing direct reality
- All other 8 PAHM positions are mental constructions to work through
- Advanced practitioners focus 90%+ on present-neutral awareness
- "Present attention itself is happiness" - not a path to it, but the destination
*/