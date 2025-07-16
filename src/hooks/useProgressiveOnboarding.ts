// ✅ Corrected Progressive Onboarding Hook - Sequential Logic Only
// File: src/hooks/useProgressiveOnboarding.ts

import { useState, useEffect, useCallback } from 'react';

// ✅ Complete interface definitions
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

// ✅ PAHM Stage Progress (integrating with your existing system)
interface PAHMStageProgress {
  stage2: { hours: number; completed: boolean; required: 15; name: 'PAHM Trainee' };
  stage3: { hours: number; completed: boolean; required: 15; name: 'PAHM Beginner' };
  stage4: { hours: number; completed: boolean; required: 15; name: 'PAHM Practitioner' };
  stage5: { hours: number; completed: boolean; required: 15; name: 'PAHM Master' };
  stage6: { hours: number; completed: boolean; required: 15; name: 'PAHM Illuminator' };
}

interface ProgressSummary {
  // Stage 1 Progress (T-stages)
  stage1: {
    completedTStages: number;
    totalTStages: number;
    totalSessions: number;
    totalCompletedSessions: number;
    progress: TStageProgress;
    percentComplete: number;
    isComplete: boolean;
  };
  // PAHM Stages Progress (2-6)
  pahmStages: {
    completedStages: number;
    totalStages: number;
    totalHours: number;
    progress: PAHMStageProgress;
    currentStage: number;
    percentComplete: number;
  };
  // Overall Progress
  overall: {
    currentLevel: string;
    totalPracticeHours: number;
    consistencyScore: number;
    readyForNextStage: boolean;
    nextMilestone: string;
  };
}

// ✅ Main Progressive Onboarding Hook with CORRECTED Sequential Logic
export const useProgressiveOnboarding = () => {
  // ✅ Modal state management
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [showSelfAssessmentModal, setShowSelfAssessmentModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showStageAccessModal, setShowStageAccessModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showSessionCompletionModal, setShowSessionCompletionModal] = useState(false);
  
  // ✅ Current requirement tracking
  const [progressRequirement, setProgressRequirement] = useState<string>('');
  const [lastSessionData, setLastSessionData] = useState<any>(null);
  
  // ✅ Completion status tracking
  const [completionStatus, setCompletionStatus] = useState<CompletionStatus>({
    questionnaire: false,
    selfAssessment: false,
    introduction: false
  });
  
  // ✅ Get completion status from localStorage
  const getCompletionStatus = useCallback((): CompletionStatus => {
    try {
      return {
        questionnaire: localStorage.getItem('questionnaireCompleted') === 'true',
        selfAssessment: localStorage.getItem('selfAssessmentCompleted') === 'true',
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
  }, []);
  
  // ✅ Get T-stage progress from localStorage (Stage 1)
  const getTStageProgress = useCallback((): TStageProgress => {
    const defaultProgress: TStageProgress = {
      t1: { completed: false, sessions: [], completedSessions: 0 },
      t2: { completed: false, sessions: [], completedSessions: 0 },
      t3: { completed: false, sessions: [], completedSessions: 0 },
      t4: { completed: false, sessions: [], completedSessions: 0 },
      t5: { completed: false, sessions: [], completedSessions: 0 }
    };
    
    try {
      const stages = ['t1', 't2', 't3', 't4', 't5'] as const;
      
      stages.forEach(stage => {
        const completed = localStorage.getItem(`${stage}Complete`) === 'true';
        const sessions = JSON.parse(localStorage.getItem(`${stage}Sessions`) || '[]');
        const completedSessions = sessions.filter((session: any) => session.isCompleted).length;
        
        defaultProgress[stage] = {
          completed,
          sessions,
          completedSessions
        };
      });
      
      return defaultProgress;
    } catch (error) {
      console.error('Error reading T-stage progress:', error);
      return defaultProgress;
    }
  }, []);

  // ✅ Get PAHM stage progress from localStorage (Stages 2-6) - YOUR EXISTING SYSTEM
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
  
  // ✅ Helper function to get previous stage
  const getPreviousStage = useCallback((stage: string): string | null => {
    switch (stage.toLowerCase()) {
      case 't2': return 'T1';
      case 't3': return 'T2';
      case 't4': return 'T3';
      case 't5': return 'T4';
      default: return null;
    }
  }, []);
  
  // ✅ FIXED: Check T-stage access - PURE SEQUENTIAL LOGIC ONLY
  const checkTStageAccess = useCallback((tStage: string): TStageAccess => {
    // T1 is always accessible
    if (tStage.toLowerCase() === 't1') {
      return { allowed: true };
    }

    // ✅ SEQUENTIAL ONLY: Check if previous T-stage is completed
    const tStageProgress = getTStageProgress();
    const previousStage = getPreviousStage(tStage);
    
    if (previousStage) {
      const previousStageKey = previousStage.toLowerCase() as keyof TStageProgress;
      const previousProgress = tStageProgress[previousStageKey];
      const requiredSessions = 3; // Require 3 completed sessions
      
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

  // ✅ FIXED: Check PAHM Stage access - PURE SEQUENTIAL LOGIC ONLY
  const checkPAHMStageAccess = useCallback((stage: number): TStageAccess => {
    const tStageProgress = getTStageProgress();
    const pahmProgress = getPAHMStageProgress();
    
    // Stage 1 is always accessible
    if (stage === 1) {
      return { allowed: true };
    }

    // ✅ SEQUENTIAL ONLY: Stage 2+ requires Stage 1 completion (all T-stages)
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

    // ✅ SEQUENTIAL ONLY: Stage 3+ requires previous PAHM stage completion
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
  
  // ✅ Get user's current accessible stage with proper TypeScript syntax
  const getCurrentAccessibleStage = useCallback((): number => {
    const tStageProgress = getTStageProgress();
    const pahmProgress = getPAHMStageProgress();
    
    // If Stage 1 not complete, return 1
    if (!tStageProgress.t5.completed) {
      return 1;
    }
    
    // Check PAHM stages in order
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
    
    return 6; // All stages completed
  }, [getTStageProgress, getPAHMStageProgress, checkPAHMStageAccess]);

  // ✅ Get next accessible stage
  const getNextAccessibleStage = useCallback((): number | null => {
    const currentStage = getCurrentAccessibleStage();
    return currentStage < 6 ? currentStage + 1 : null;
  }, [getCurrentAccessibleStage]);

  // ✅ FIXED: Check if user has minimum data for happiness tracking (SEPARATE FROM STAGE ACCESS)
  const hasMinimumDataForHappiness = useCallback((): boolean => {
    const completion = getCompletionStatus();
    const tStageProgress = getTStageProgress();
    
    // Get total completed sessions across all T-stages
    const totalCompletedSessions = Object.values(tStageProgress).reduce(
      (sum, stage) => sum + stage.completedSessions, 
      0
    );
    
    // Minimum data requirements for happiness tracking (NOT stage access)
    const hasQuestionnaireAndAssessment = completion.questionnaire && completion.selfAssessment;
    const hasEnoughSessions = totalCompletedSessions >= 3;
    const hasQuestionnaireAndOneSession = completion.questionnaire && totalCompletedSessions >= 1;
    
    return hasQuestionnaireAndAssessment || hasEnoughSessions || hasQuestionnaireAndOneSession;
  }, [getCompletionStatus, getTStageProgress]);

  // ✅ Get comprehensive progress summary - UPDATED
  const getCompleteProgressSummary = useCallback((): ProgressSummary => {
    const completion = getCompletionStatus();
    const tStageProgress = getTStageProgress();
    const pahmProgress = getPAHMStageProgress();
    
    // Stage 1 Summary
    const stage1Completed = Object.values(tStageProgress).filter((t: any) => t.completed).length;
    const stage1TotalSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + t.sessions.length, 0);
    const stage1CompletedSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + t.completedSessions, 0);
    
    // PAHM Stages Summary
    const pahmCompletedStages = Object.values(pahmProgress).filter((s: any) => s.completed).length;
    const pahmTotalHours = Object.values(pahmProgress).reduce((sum: number, s: any) => sum + s.hours, 0);
    
    // Overall calculations
    const currentStage = getCurrentAccessibleStage();
    const totalPracticeHours = (stage1CompletedSessions * 0.25) + pahmTotalHours; // Assume 15min average for T-sessions
    
    // Determine current level
    let currentLevel = 'Beginner';
    if (currentStage === 1) currentLevel = 'Seeker';
    else if (currentStage === 2) currentLevel = 'PAHM Trainee';
    else if (currentStage === 3) currentLevel = 'PAHM Beginner';
    else if (currentStage === 4) currentLevel = 'PAHM Practitioner';
    else if (currentStage === 5) currentLevel = 'PAHM Master';
    else if (currentStage === 6) currentLevel = 'PAHM Illuminator';
    
    // ✅ FIXED: Next milestone based on sequential progression
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

  // ✅ Recheck completion status
  const recheckStatus = useCallback(async () => {
    setCompletionStatus(getCompletionStatus());
  }, [getCompletionStatus]);

  // ✅ Session completion handler
  const handleSessionComplete = useCallback((sessionData: any) => {
    setLastSessionData(sessionData);
    setShowSessionCompletionModal(true);
    
    // Trigger status update
    setTimeout(() => {
      recheckStatus();
    }, 500);
  }, [recheckStatus]);

  // ✅ Welcome new users (for happiness tracking guidance, not stage access)
  const checkAndShowWelcome = useCallback(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
    
    if (!hasSeenWelcome && !hasMinimumDataForHappiness()) {
      setShowWelcomeModal(true);
      localStorage.setItem('hasSeenWelcome', 'true');
    }
  }, [hasMinimumDataForHappiness]);

  // ✅ Update completion status on mount and when localStorage changes
  useEffect(() => {
    recheckStatus();
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      recheckStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [recheckStatus]);

  // ✅ Check for welcome modal on mount
  useEffect(() => {
    checkAndShowWelcome();
  }, [checkAndShowWelcome]);

  // ✅ Return all required properties
  return {
    // ✅ Modal states
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
    
    // ✅ Current requirement tracking
    progressRequirement,
    lastSessionData,
    
    // ✅ Main checking functions - SEQUENTIAL LOGIC ONLY
    checkTStageAccess,
    checkPAHMStageAccess,
    
    // ✅ Progress functions
    getTStageProgress,
    getPAHMStageProgress,
    getCompleteProgressSummary,
    getCurrentAccessibleStage,
    getNextAccessibleStage,
    
    // ✅ NEW: Happiness tracking validation (separate from stage access)
    hasMinimumDataForHappiness,
    
    // ✅ Session handling
    handleSessionComplete,
    
    // ✅ Status management
    completionStatus,
    recheckStatus,
    checkAndShowWelcome
  };
};

// ✅ Helper hook for complete progress access
export const useCompleteProgress = () => {
  const { getCompleteProgressSummary, getCurrentAccessibleStage, hasMinimumDataForHappiness } = useProgressiveOnboarding();
  
  return {
    getCompleteProgressSummary,
    getCurrentAccessibleStage,
    hasMinimumDataForHappiness
  };
};