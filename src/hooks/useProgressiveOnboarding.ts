// ✅ FIXED Progressive Onboarding Hook - Universal Architecture Compatible
// File: src/hooks/useProgressiveOnboarding.ts

import { useState, useEffect, useCallback } from 'react';
// 🚀 UPDATED: Import from Universal Architecture compatibility hook
import { useLocalDataCompat as useLocalData } from './useLocalDataCompat';

// ✅ Add session type interface
interface PracticeSession {
  stageLabel?: string;
  stageLevel?: number;
  level?: string;
  tLevel?: string;
  rating?: number;
  timestamp?: string;
  duration?: number;
  [key: string]: any;
}

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
  t1: { completed: boolean; sessions: PracticeSession[]; completedSessions: number };
  t2: { completed: boolean; sessions: PracticeSession[]; completedSessions: number };
  t3: { completed: boolean; sessions: PracticeSession[]; completedSessions: number };
  t4: { completed: boolean; sessions: PracticeSession[]; completedSessions: number };
  t5: { completed: boolean; sessions: PracticeSession[]; completedSessions: number };
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

// ✅ FIXED: Main Progressive Onboarding Hook with Universal Architecture + Error Handling
export const useProgressiveOnboarding = () => {
  // 🚀 UPDATED: Get data from Universal Architecture with error handling
  const localData = useLocalData();
  
  // ✅ FIXED: Add null checks for Universal Architecture methods
  const isQuestionnaireCompleted = useCallback(() => {
    try {
      return localData?.isQuestionnaireCompleted?.() || false;
    } catch (error) {
      console.warn('Error checking questionnaire completion:', error);
      // Fallback to localStorage
      return localStorage.getItem('questionnaire_completed') === 'true';
    }
  }, [localData]);

  const isSelfAssessmentCompleted = useCallback(() => {
    try {
      return localData?.isSelfAssessmentCompleted?.() || false;
    } catch (error) {
      console.warn('Error checking self-assessment completion:', error);
      // Fallback to localStorage
      return localStorage.getItem('self_assessment_completed') === 'true';
    }
  }, [localData]);

  const getPracticeSessions = useCallback((): PracticeSession[] => {
    try {
      return localData?.getPracticeSessions?.() || [];
    } catch (error) {
      console.warn('Error getting practice sessions:', error);
      // Fallback to localStorage
      try {
        const sessions = localStorage.getItem('practice_sessions');
        return sessions ? JSON.parse(sessions) : [];
      } catch (parseError) {
        console.warn('Error parsing practice sessions from localStorage:', parseError);
        return [];
      }
    }
  }, [localData]);

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
  
  // ✅ FIXED: Get completion status with proper error handling and fallbacks
  const getCompletionStatus = useCallback((): CompletionStatus => {
    try {
      return {
        // 🚀 UPDATED: Use wrapped Universal Architecture methods with fallbacks
        questionnaire: isQuestionnaireCompleted(),
        selfAssessment: isSelfAssessmentCompleted(),
        // Keep localStorage for introduction (not in Universal Architecture)
        introduction: localStorage.getItem('introductionCompleted') === 'true'
      };
    } catch (error) {
      console.error('Error reading completion status:', error);
      // Fallback to localStorage
      return {
        questionnaire: localStorage.getItem('questionnaire_completed') === 'true',
        selfAssessment: localStorage.getItem('self_assessment_completed') === 'true',
        introduction: localStorage.getItem('introductionCompleted') === 'true'
      };
    }
  }, [isQuestionnaireCompleted, isSelfAssessmentCompleted]);
  
  // ✅ FIXED: Get T-stage progress with enhanced error handling
  const getTStageProgress = useCallback((): TStageProgress => {
    const defaultProgress: TStageProgress = {
      t1: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
      t2: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
      t3: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
      t4: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
      t5: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 }
    };
    
    try {
      // 🚀 UPDATED: Get sessions from Universal Architecture with fallbacks
      const allSessions = getPracticeSessions();
      const stages = ['t1', 't2', 't3', 't4', 't5'] as const;
      
      stages.forEach(stage => {
        try {
          // Get sessions for this T-stage from Universal Architecture
          const stageSessions = allSessions.filter((session: PracticeSession) => {
            // ✅ IMPROVED: Better session filtering with multiple criteria
            const stageLabel = session.stageLabel?.toLowerCase();
            const stageLevel = session.stageLevel;
            const level = session.level?.toLowerCase();
            const tLevel = session.tLevel?.toLowerCase();
            
            return stageLabel === stage || 
                   stageLevel === parseInt(stage.substring(1)) ||
                   level === stage ||
                   tLevel === stage;
          });
          
          // Keep localStorage for completion status (or derive from sessions)
          const completed = localStorage.getItem(`${stage}Complete`) === 'true' || 
            localStorage.getItem(`${stage.toUpperCase()}_completed`) === 'true' ||
            stageSessions.filter((s: PracticeSession) => s.rating && s.rating > 0).length >= 3;
          
          const completedSessions = stageSessions.filter((session: PracticeSession) => 
            session.rating && session.rating > 0
          ).length;
          
          defaultProgress[stage] = {
            completed,
            sessions: stageSessions,
            completedSessions
          };
        } catch (stageError) {
          console.warn(`Error processing ${stage} progress:`, stageError);
          // Keep default values for this stage
        }
      });
      
      return defaultProgress;
    } catch (error) {
      console.error('Error reading T-stage progress:', error);
      return defaultProgress;
    }
  }, [getPracticeSessions]);

  // ✅ IMPROVED: PAHM stage progress with better error handling
  const getPAHMStageProgress = useCallback((): PAHMStageProgress => {
    const defaultProgress: PAHMStageProgress = {
      stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee' },
      stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner' },
      stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner' },
      stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master' },
      stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator' }
    };

    try {
      const stages = ['stage2', 'stage3', 'stage4', 'stage5', 'stage6'] as const;
      const stageNames = ['PAHM Trainee', 'PAHM Beginner', 'PAHM Practitioner', 'PAHM Master', 'PAHM Illuminator'] as const;
      
      stages.forEach((stage, index) => {
        try {
          const hours = parseFloat(localStorage.getItem(`${stage}Hours`) || '0');
          const completed = localStorage.getItem(`${stage}Complete`) === 'true';
          
          (defaultProgress as any)[stage] = {
            hours,
            completed,
            required: 15,
            name: stageNames[index]
          };
        } catch (stageError) {
          console.warn(`Error processing ${stage} progress:`, stageError);
          // Keep default values for this stage
        }
      });
      
      return defaultProgress;
    } catch (error) {
      console.error('Error reading PAHM stage progress:', error);
      return defaultProgress;
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

    try {
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
    } catch (error) {
      console.error('Error checking T-stage access:', error);
      // Default to allowing access if there's an error
      return { allowed: true };
    }

    return { allowed: true };
  }, [getTStageProgress, getPreviousStage]);

  const checkPAHMStageAccess = useCallback((stage: number): TStageAccess => {
    if (stage === 1) {
      return { allowed: true };
    }

    try {
      const tStageProgress = getTStageProgress();
      const pahmProgress = getPAHMStageProgress();
      
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
    } catch (error) {
      console.error('Error checking PAHM stage access:', error);
      // Default to allowing access if there's an error
      return { allowed: true };
    }

    return { allowed: true };
  }, [getTStageProgress, getPAHMStageProgress]);
  
  // ✅ Keep all your remaining methods with enhanced error handling
  const getCurrentAccessibleStage = useCallback((): number => {
    try {
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
    } catch (error) {
      console.error('Error getting current accessible stage:', error);
      return 1; // Default to stage 1 if there's an error
    }
  }, [getTStageProgress, getPAHMStageProgress, checkPAHMStageAccess]);

  const getNextAccessibleStage = useCallback((): number | null => {
    try {
      const currentStage = getCurrentAccessibleStage();
      return currentStage < 6 ? currentStage + 1 : null;
    } catch (error) {
      console.error('Error getting next accessible stage:', error);
      return null;
    }
  }, [getCurrentAccessibleStage]);

  // ✅ FIXED: Use enhanced data validation for happiness tracking
  const hasMinimumDataForHappiness = useCallback((): boolean => {
    try {
      const completion = getCompletionStatus();
      const tStageProgress = getTStageProgress();
      
      const totalCompletedSessions = Object.values(tStageProgress).reduce(
        (sum, stage) => sum + (stage?.completedSessions || 0), 
        0
      );
      
      const hasQuestionnaireAndAssessment = completion.questionnaire && completion.selfAssessment;
      const hasEnoughSessions = totalCompletedSessions >= 3;
      const hasQuestionnaireAndOneSession = completion.questionnaire && totalCompletedSessions >= 1;
      
      const result = hasQuestionnaireAndAssessment || hasEnoughSessions || hasQuestionnaireAndOneSession;
      
      console.log('🔍 hasMinimumDataForHappiness check:', {
        completion,
        totalCompletedSessions,
        hasQuestionnaireAndAssessment,
        hasEnoughSessions,
        hasQuestionnaireAndOneSession,
        result
      });
      
      return result;
    } catch (error) {
      console.error('Error checking minimum data for happiness:', error);
      return false;
    }
  }, [getCompletionStatus, getTStageProgress]);

  const getCompleteProgressSummary = useCallback((): ProgressSummary => {
    try {
      const completion = getCompletionStatus();
      const tStageProgress = getTStageProgress();
      const pahmProgress = getPAHMStageProgress();
      
      const stage1Completed = Object.values(tStageProgress).filter((t: any) => t?.completed).length;
      const stage1TotalSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + (t?.sessions?.length || 0), 0);
      const stage1CompletedSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + (t?.completedSessions || 0), 0);
      
      const pahmCompletedStages = Object.values(pahmProgress).filter((s: any) => s?.completed).length;
      const pahmTotalHours = Object.values(pahmProgress).reduce((sum: number, s: any) => sum + (s?.hours || 0), 0);
      
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
    } catch (error) {
      console.error('Error getting complete progress summary:', error);
      // Return safe defaults
      return {
        stage1: {
          completedTStages: 0,
          totalTStages: 5,
          totalSessions: 0,
          totalCompletedSessions: 0,
          progress: {
            t1: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t2: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t3: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t4: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t5: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 }
          },
          percentComplete: 0,
          isComplete: false
        },
        pahmStages: {
          completedStages: 0,
          totalStages: 5,
          totalHours: 0,
          progress: {
            stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee' },
            stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner' },
            stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner' },
            stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master' },
            stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator' }
          },
          currentStage: 1,
          percentComplete: 0
        },
        overall: {
          currentLevel: 'Beginner',
          totalPracticeHours: 0,
          consistencyScore: 0,
          readyForNextStage: true,
          nextMilestone: 'Begin Practice'
        }
      };
    }
  }, [getCompletionStatus, getTStageProgress, getPAHMStageProgress, getCurrentAccessibleStage]);

  // ✅ FIXED: Enhanced utility methods with error handling
  const recheckStatus = useCallback(async () => {
    try {
      const newStatus = getCompletionStatus();
      setCompletionStatus(newStatus);
      console.log('🔄 Rechecked status:', newStatus);
    } catch (error) {
      console.error('Error rechecking status:', error);
    }
  }, [getCompletionStatus]);

  const handleSessionComplete = useCallback((sessionData: any) => {
    try {
      setLastSessionData(sessionData);
      setShowSessionCompletionModal(true);
      
      // ✅ FIXED: Add slight delay to ensure data is saved before rechecking
      setTimeout(() => {
        recheckStatus();
      }, 500);
    } catch (error) {
      console.error('Error handling session complete:', error);
    }
  }, [recheckStatus]);

  const checkAndShowWelcome = useCallback(() => {
    try {
      const hasSeenWelcome = localStorage.getItem('hasSeenWelcome') === 'true';
      
      if (!hasSeenWelcome && !hasMinimumDataForHappiness()) {
        setShowWelcomeModal(true);
        localStorage.setItem('hasSeenWelcome', 'true');
      }
    } catch (error) {
      console.error('Error checking welcome status:', error);
    }
  }, [hasMinimumDataForHappiness]);

  // ✅ FIXED: Enhanced useEffect hooks with better error handling
  useEffect(() => {
    try {
      recheckStatus();
      
      const handleStorageChange = (e: StorageEvent) => {
        try {
          // ✅ IMPROVED: Only recheck for relevant storage changes
          const relevantKeys = [
            'questionnaire_completed',
            'self_assessment_completed',
            'questionnaire',
            'selfAssessment',
            'practice_sessions',
            't1Complete', 't2Complete', 't3Complete', 't4Complete', 't5Complete',
            'stage2Complete', 'stage3Complete', 'stage4Complete', 'stage5Complete', 'stage6Complete'
          ];
          
          if (e.key && relevantKeys.some(key => e.key!.includes(key))) {
            console.log('🔄 Relevant storage change detected:', e.key);
            setTimeout(() => recheckStatus(), 100);
          }
        } catch (storageError) {
          console.error('Error handling storage change:', storageError);
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    } catch (error) {
      console.error('Error setting up progressive onboarding effects:', error);
    }
  }, [recheckStatus]);

  useEffect(() => {
    try {
      checkAndShowWelcome();
    } catch (error) {
      console.error('Error checking welcome:', error);
    }
  }, [checkAndShowWelcome]);

  // ✅ NEW: Listen for onboarding completion events from other components
  useEffect(() => {
    const handleOnboardingEvent = (event: any) => {
      try {
        console.log('🎯 Progressive onboarding received event:', event.detail);
        setTimeout(() => recheckStatus(), 200);
      } catch (error) {
        console.error('Error handling onboarding event:', error);
      }
    };

    window.addEventListener('onboardingUpdated', handleOnboardingEvent);
    window.addEventListener('selfAssessmentCompleted', handleOnboardingEvent);
    window.addEventListener('questionnaireCompleted', handleOnboardingEvent);
    
    return () => {
      window.removeEventListener('onboardingUpdated', handleOnboardingEvent);
      window.removeEventListener('selfAssessmentCompleted', handleOnboardingEvent);
      window.removeEventListener('questionnaireCompleted', handleOnboardingEvent);
    };
  }, [recheckStatus]);

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

// ✅ Keep your existing helper hook with error handling
export const useCompleteProgress = () => {
  try {
    const { getCompleteProgressSummary, getCurrentAccessibleStage, hasMinimumDataForHappiness } = useProgressiveOnboarding();
    
    return {
      getCompleteProgressSummary,
      getCurrentAccessibleStage,
      hasMinimumDataForHappiness
    };
  } catch (error) {
    console.error('Error in useCompleteProgress:', error);
    // Return safe defaults
    return {
      getCompleteProgressSummary: () => ({
        stage1: { 
          completedTStages: 0, 
          totalTStages: 5, 
          totalSessions: 0, 
          totalCompletedSessions: 0, 
          progress: {
            t1: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t2: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t3: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t4: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 },
            t5: { completed: false, sessions: [] as PracticeSession[], completedSessions: 0 }
          }, 
          percentComplete: 0, 
          isComplete: false 
        },
        pahmStages: { 
          completedStages: 0, 
          totalStages: 5, 
          totalHours: 0, 
          progress: {
            stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee' },
            stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner' },
            stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner' },
            stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master' },
            stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator' }
          }, 
          currentStage: 1, 
          percentComplete: 0 
        },
        overall: { 
          currentLevel: 'Beginner', 
          totalPracticeHours: 0, 
          consistencyScore: 0, 
          readyForNextStage: true, 
          nextMilestone: 'Begin Practice' 
        }
      }),
      getCurrentAccessibleStage: () => 1,
      hasMinimumDataForHappiness: () => false
    };
  }
};