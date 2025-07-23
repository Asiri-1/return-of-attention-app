// ✅ Updated Progressive Onboarding Hook - Compatible with Universal Architecture
// File: src/hooks/useProgressiveOnboarding.ts

import { useState, useEffect, useCallback } from 'react';
// 🚀 NEW: Import from Universal Architecture compatibility hook
import { useLocalDataCompat as useLocalData } from './useLocalDataCompat';

// ✅ Keep all your existing interfaces unchanged
interface CompletionStatus {
  questionnaire: boolean;
  selfAssessment: boolean;
  introduction: boolean;
}

interface TStageAccess {
  allowed: boolean;
  requirement?: string;
  missingRequirement?: 'progression' | 'sessions';
}

interface TStageProgress {
  t1: { completed: boolean; sessions: any[]; completedSessions: number };
  t2: { completed: boolean; sessions: any[]; completedSessions: number };
  t3: { completed: boolean; sessions: any[]; completedSessions: number };
  t4: { completed: boolean; sessions: any[]; completedSessions: number };
  t5: { completed: boolean; sessions: any[]; completedSessions: number };
}

interface PAHMStageProgress {
  stage2: { hours: number; completed: boolean; required: 15; name: 'PAHM Trainee' };
  stage3: { hours: number; completed: boolean; required: 15; name: 'PAHM Beginner' };
  stage4: { hours: number; completed: boolean; required: 15; name: 'PAHM Practitioner' };
  stage5: { hours: number; completed: boolean; required: 15; name: 'PAHM Master' };
  stage6: { hours: number; completed: boolean; required: 15; name: 'PAHM Illuminator' };
}

interface ProgressSummary {
  stage1: {
    completedTStages: number;
    totalTStages: number;
    totalSessions: number;
    totalCompletedSessions: number;
    progress: TStageProgress;
    percentComplete: number;
    isComplete: boolean;
  };
  pahmStages: {
    completedStages: number;
    totalStages: number;
    totalHours: number;
    progress: PAHMStageProgress;
    currentStage: number;
    percentComplete: number;
  };
  overall: {
    currentLevel: string;
    totalPracticeHours: number;
    consistencyScore: number;
    readyForNextStage: boolean;
    nextMilestone: string;
  };
}

// ✅ UPDATED: Main Progressive Onboarding Hook with Universal Architecture
export const useProgressiveOnboarding = () => {
  // 🚀 NEW: Get data from Universal Architecture
  const { 
    isQuestionnaireCompleted, 
    isSelfAssessmentCompleted, 
    getPracticeSessions 
  } = useLocalData();

  // ✅ Keep all your existing modal state management
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showSelfAssessmentModal, setShowSelfAssessmentModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showStageAccessModal, setShowStageAccessModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSessionCompletionModal, setShowSessionCompletionModal] = useState(false);
  
  const [progressRequirement, setProgressRequirement] = useState<string>('');
  const [lastSessionData, setLastSessionData] = useState<any>(null);
  
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    questionnaire: false,
    selfAssessment: false,
    introduction: false
  });
  
  // ✅ UPDATED: Get completion status from Universal Architecture + localStorage
  const getCompletionStatus = useCallback((): CompletionStatus => {
    try {
      return {
        // 🚀 NEW: Use Universal Architecture methods
        questionnaire: isQuestionnaireCompleted(),
        selfAssessment: isSelfAssessmentCompleted(),
        // Keep localStorage for introduction (not in Universal Architecture)
        introduction: localStorage.getItem('introductionCompleted') === 'true'
      };
    } catch (error) {
      console.error('Error reading completion status:', error);
      return {
        questionnaire: false,
        selfAssessment: false,
        introduction: false
      };
    }
  }, [isQuestionnaireCompleted, isSelfAssessmentCompleted]);
  
  // ✅ UPDATED: Get T-stage progress from Universal Architecture + localStorage hybrid
  const getTStageProgress = useCallback((): TStageProgress => {
    const defaultProgress: TStageProgress = {
      t1: { completed: false, sessions: [], completedSessions: 0 },
      t2: { completed: false, sessions: [], completedSessions: 0 },
      t3: { completed: false, sessions: [], completedSessions: 0 },
      t4: { completed: false, sessions: [], completedSessions: 0 },
      t5: { completed: false, sessions: [], completedSessions: 0 }
    };
    
    try {
      // 🚀 NEW: Get sessions from Universal Architecture
      const allSessions = getPracticeSessions();
      const stages = ['t1', 't2', 't3', 't4', 't5'] as const;
      
      stages.forEach(stage => {
        // Get sessions for this T-stage from Universal Architecture
        const stageSessions = allSessions.filter(session => 
          session.stageLabel?.toLowerCase() === stage || 
          session.stageLevel === parseInt(stage.substring(1))
        );
        
        // Keep localStorage for completion status (or derive from sessions)
        const completed = localStorage.getItem(`${stage}Complete`) === 'true' || 
          stageSessions.filter(s => s.rating && s.rating > 0).length >= 3;
        
        const completedSessions = stageSessions.filter(session => 
          session.rating && session.rating > 0
        ).length;
        
        defaultProgress[stage] = {
          completed,
          sessions: stageSessions,
          completedSessions
        };
      });
      
      return defaultProgress;
    } catch (error) {
      console.error('Error reading T-stage progress:', error);
      return defaultProgress;
    }
  }, [getPracticeSessions]);

  // ✅ Keep your existing PAHM stage progress (localStorage-based for now)
  const getPAHMStageProgress = useCallback((): PAHMStageProgress => {
    try {
      return {
        stage2: {
          hours: parseFloat(localStorage.getItem('stage2Hours') || '0'),
          completed: localStorage.getItem('stage2Complete') === 'true',
          required: 15,
          name: 'PAHM Trainee'
        },
        stage3: {
          hours: parseFloat(localStorage.getItem('stage3Hours') || '0'),
          completed: localStorage.getItem('stage3Complete') === 'true',
          required: 15,
          name: 'PAHM Beginner'
        },
        stage4: {
          hours: parseFloat(localStorage.getItem('stage4Hours') || '0'),
          completed: localStorage.getItem('stage4Complete') === 'true',
          required: 15,
          name: 'PAHM Practitioner'
        },
        stage5: {
          hours: parseFloat(localStorage.getItem('stage5Hours') || '0'),
          completed: localStorage.getItem('stage5Complete') === 'true',
          required: 15,
          name: 'PAHM Master'
        },
        stage6: {
          hours: parseFloat(localStorage.getItem('stage6Hours') || '0'),
          completed: localStorage.getItem('stage6Complete') === 'true',
          required: 15,
          name: 'PAHM Illuminator'
        }
      };
    } catch (error) {
      console.error('Error reading PAHM stage progress:', error);
      return {
        stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee' },
        stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner' },
        stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner' },
        stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master' },
        stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator' }
      };
    }
  }, []);
  
  // ✅ Keep all your existing helper and logic functions unchanged
  const getPreviousStage = useCallback((stage: string): string | null => {
    switch (stage.toLowerCase()) {
      case 't2': return 'T1';
      case 't3': return 'T2';
      case 't4': return 'T3';
      case 't5': return 'T4';
      default: return null;
    }
  }, []);
  
  const checkTStageAccess = useCallback((tStage: string): TStageAccess => {
    if (tStage.toLowerCase() === 't1') {
      return { allowed: true };
    }

    const tStageProgress = getTStageProgress();
    const previousStage = getPreviousStage(tStage);
    
    if (previousStage) {
      const previousStageKey = previousStage.toLowerCase() as keyof TStageProgress;
      const previousProgress = tStageProgress[previousStageKey];
      const requiredSessions = 3;
      
      if (previousProgress.completedSessions < requiredSessions) {
        const requirement = `Complete at least ${requiredSessions} ${previousStage} sessions before accessing ${tStage.toUpperCase()}. Current: ${previousProgress.completedSessions}/${requiredSessions}`;
        setProgressRequirement(requirement);
        setShowProgressModal(true);
        return { 
          allowed: false, 
          requirement,
          missingRequirement: 'sessions'
        };
      }
    }

    return { allowed: true };
  }, [getTStageProgress, getPreviousStage]);

  const checkPAHMStageAccess = useCallback((stage: number): TStageAccess => {
    const tStageProgress = getTStageProgress();
    const pahmProgress = getPAHMStageProgress();
    
    if (stage === 1) {
      return { allowed: true };
    }

    if (stage >= 2 && !tStageProgress.t5.completed) {
      const requirement = 'Complete all T-stages (T1-T5) in Stage 1 before accessing PAHM stages';
      setProgressRequirement(requirement);
      setShowStageAccessModal(true);
      return { 
        allowed: false, 
        requirement,
        missingRequirement: 'progression'
      };
    }

    if (stage >= 3) {
      const previousStageKey = `stage${stage - 1}` as keyof PAHMStageProgress;
      const previousStage = pahmProgress[previousStageKey];
      
      if (!previousStage.completed) {
        const requirement = `Complete Stage ${stage - 1} (${previousStage.name}) with 15 hours of practice before accessing Stage ${stage}`;
        setProgressRequirement(requirement);
        setShowStageAccessModal(true);
        return { 
          allowed: false, 
          requirement,
          missingRequirement: 'progression'
        };
      }
    }

    return { allowed: true };
  }, [getTStageProgress, getPAHMStageProgress]);
  
  // ✅ Keep all your remaining methods unchanged
  const getCurrentAccessibleStage = useCallback((): number => {
    const tStageProgress = getTStageProgress();
    const pahmProgress = getPAHMStageProgress();
    
    if (!tStageProgress.t5.completed) {
      return 1;
    }
    
    for (let stage = 2; stage <= 6; stage++) {
      const access = checkPAHMStageAccess(stage);
      if (access.allowed) {
        const stageKey = `stage${stage}` as keyof PAHMStageProgress;
        if (!pahmProgress[stageKey].completed) {
          return stage;
        }
      } else {
        return stage - 1;
      }
    }
    
    return 6;
  }, [getTStageProgress, getPAHMStageProgress, checkPAHMStageAccess]);

  const getNextAccessibleStage = useCallback((): number | null => {
    const currentStage = getCurrentAccessibleStage();
    return currentStage < 6 ? currentStage + 1 : null;
  }, [getCurrentAccessibleStage]);

  // ✅ UPDATED: Use Universal Architecture data for happiness tracking validation
  const hasMinimumDataForHappiness = useCallback((): boolean => {
    const completion = getCompletionStatus();
    const tStageProgress = getTStageProgress();
    
    const totalCompletedSessions = Object.values(tStageProgress).reduce(
      (sum, stage) => sum + stage.completedSessions, 
      0
    );
    
    const hasQuestionnaireAndAssessment = completion.questionnaire && completion.selfAssessment;
    const hasEnoughSessions = totalCompletedSessions >= 3;
    const hasQuestionnaireAndOneSession = completion.questionnaire && totalCompletedSessions >= 1;
    
    return hasQuestionnaireAndAssessment || hasEnoughSessions || hasQuestionnaireAndOneSession;
  }, [getCompletionStatus, getTStageProgress]);

  const getCompleteProgressSummary = useCallback((): ProgressSummary => {
    const completion = getCompletionStatus();
    const tStageProgress = getTStageProgress();
    const pahmProgress = getPAHMStageProgress();
    
    const stage1Completed = Object.values(tStageProgress).filter((t: any) => t.completed).length;
    const stage1TotalSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + t.sessions.length, 0);
    const stage1CompletedSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + t.completedSessions, 0);
    
    const pahmCompletedStages = Object.values(pahmProgress).filter((s: any) => s.completed).length;
    const pahmTotalHours = Object.values(pahmProgress).reduce((sum: number, s: any) => sum + s.hours, 0);
    
    const currentStage = getCurrentAccessibleStage();
    const totalPracticeHours = (stage1CompletedSessions * 0.25) + pahmTotalHours;
    
    let currentLevel = 'Beginner';
    if (currentStage === 1) currentLevel = 'Seeker';
    else if (currentStage === 2) currentLevel = 'PAHM Trainee';
    else if (currentStage === 3) currentLevel = 'PAHM Beginner';
    else if (currentStage === 4) currentLevel = 'PAHM Practitioner';
    else if (currentStage === 5) currentLevel = 'PAHM Master';
    else if (currentStage === 6) currentLevel = 'PAHM Illuminator';
    
    let nextMilestone = 'Continue Practice';
    if (!tStageProgress.t5.completed) {
      nextMilestone = 'Complete Stage 1 (All T-stages)';
    } else if (currentStage < 6) {
      const nextStageKey = `stage${currentStage + 1}` as keyof PAHMStageProgress;
      nextMilestone = `Unlock ${pahmProgress[nextStageKey].name}`;
    } else {
      nextMilestone = 'Mastery Achieved';
    }
    
    return {
      stage1: {
        completedTStages: stage1Completed,
        totalTStages: 5,
        totalSessions: stage1TotalSessions,
        totalCompletedSessions: stage1CompletedSessions,
        progress: tStageProgress,
        percentComplete: Math.round((stage1Completed / 5) * 100),
        isComplete: tStageProgress.t5.completed
      },
      pahmStages: {
        completedStages: pahmCompletedStages,
        totalStages: 5,
        totalHours: pahmTotalHours,
        progress: pahmProgress,
        currentStage,
        percentComplete: Math.round((pahmCompletedStages / 5) * 100)
      },
      overall: {
        currentLevel,
        totalPracticeHours,
        consistencyScore: stage1TotalSessions > 0 ? Math.round((stage1CompletedSessions / stage1TotalSessions) * 100) : 0,
        readyForNextStage: currentStage < 6,
        nextMilestone
      }
    };
  }, [getCompletionStatus, getTStageProgress, getPAHMStageProgress, getCurrentAccessibleStage]);

  // ✅ Keep all your existing utility methods
  const recheckStatus = useCallback(async () => {
    setCompletionStatus(getCompletionStatus());
  }, [getCompletionStatus]);

  const handleSessionComplete = useCallback((sessionData: any) => {
    setLastSessionData(sessionData);
    setShowSessionCompletionModal(true);
    
    setTimeout(() => {
      recheckStatus();
    }, 500);
  }, [recheckStatus]);

  const checkAndShowWelcome = useCallback(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
    
    if (!hasSeenWelcome && !hasMinimumDataForHappiness()) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [hasMinimumDataForHappiness]);

  // ✅ Keep all your existing useEffect hooks
  useEffect(() => {
    recheckStatus();
    
    const handleStorageChange = () => {
      recheckStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [recheckStatus]);

  useEffect(() => {
    checkAndShowWelcome();
  }, [checkAndShowWelcome]);

  // ✅ Return exactly the same interface
  return {
    showQuestionnaireModal,
    showSelfAssessmentModal,
    showProgressModal,
    showStageAccessModal,
    showWelcomeModal,
    showSessionCompletionModal,
    setShowQuestionnaireModal,
    setShowSelfAssessmentModal,
    setShowProgressModal,
    setShowStageAccessModal,
    setShowWelcomeModal,
    setShowSessionCompletionModal,
    
    progressRequirement,
    lastSessionData,
    
    checkTStageAccess,
    checkPAHMStageAccess,
    
    getTStageProgress,
    getPAHMStageProgress,
    getCompleteProgressSummary,
    getCurrentAccessibleStage,
    getNextAccessibleStage,
    
    hasMinimumDataForHappiness,
    
    handleSessionComplete,
    
    completionStatus,
    recheckStatus,
    checkAndShowWelcome
  };
};

// ✅ Keep your existing helper hook
export const useCompleteProgress = () => {
  const { getCompleteProgressSummary, getCurrentAccessibleStage, hasMinimumDataForHappiness } = useProgressiveOnboarding();
  
  return {
    getCompleteProgressSummary,
    getCurrentAccessibleStage,
    hasMinimumDataForHappiness
  };
};