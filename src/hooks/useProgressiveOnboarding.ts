// ============================================================================
// src/hooks/useProgressiveOnboarding.ts
// ✅ FIREBASE-ONLY: Progressive Onboarding Hook - FIXED SESSION FILTERING
// 🔥 FIXED: Session filtering logic to properly match T-level identifiers
// 🔥 FIXED: Data loading issues for Stage 1 display
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
// ✅ FIREBASE-ONLY: Use Firebase contexts directly instead of localStorage compatibility layer
import { useAuth } from '../contexts/auth/AuthContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useUser } from '../contexts/user/UserContext';
import { useContent } from '../contexts/content/ContentContext';

// ✅ FIREBASE-ONLY: Enhanced session interface with Firebase metadata
interface FirebasePracticeSession {
  sessionId?: string;
  stageLabel?: string;
  stageLevel?: number;
  level?: string;
  tLevel?: string;
  rating?: number;
  timestamp?: string;
  duration?: number;
  createdAt?: any; // Firebase Timestamp
  userId?: string;
  sessionType?: 'meditation' | 'mind_recovery';
  firebaseSource?: boolean;
  completed?: boolean;
  [key: string]: any;
}

// ✅ PRESERVED: All existing interfaces unchanged
interface CompletionStatus {
  questionnaire: boolean;
  selfAssessment: boolean;
  introduction: boolean;
  firebaseSource: boolean;
  lastSyncAt: string;
}

interface TStageAccess {
  allowed: boolean;
  requirement?: string;
  missingRequirement?: 'progression' | 'sessions';
  firebaseVerified: boolean;
}

interface TStageProgress {
  t1: { completed: boolean; sessions: FirebasePracticeSession[]; completedSessions: number };
  t2: { completed: boolean; sessions: FirebasePracticeSession[]; completedSessions: number };
  t3: { completed: boolean; sessions: FirebasePracticeSession[]; completedSessions: number };
  t4: { completed: boolean; sessions: FirebasePracticeSession[]; completedSessions: number };
  t5: { completed: boolean; sessions: FirebasePracticeSession[]; completedSessions: number };
}

interface PAHMStageProgress {
  stage2: { hours: number; completed: boolean; required: 15; name: 'PAHM Trainee'; firebaseHours: number };
  stage3: { hours: number; completed: boolean; required: 15; name: 'PAHM Beginner'; firebaseHours: number };
  stage4: { hours: number; completed: boolean; required: 15; name: 'PAHM Practitioner'; firebaseHours: number };
  stage5: { hours: number; completed: boolean; required: 15; name: 'PAHM Master'; firebaseHours: number };
  stage6: { hours: number; completed: boolean; required: 15; name: 'PAHM Illuminator'; firebaseHours: number };
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
  firebaseMetadata: {
    userId: string;
    lastUpdated: string;
    dataSource: 'Firebase Cloud Storage';
    crossDeviceSync: boolean;
  };
}

// ✅ FIREBASE-ONLY: Main Progressive Onboarding Hook
export const useProgressiveOnboarding = () => {
  // ✅ FIREBASE-ONLY: Get data from Firebase contexts exclusively
  const { currentUser } = useAuth();
  const { 
    questionnaire, 
    selfAssessment,
    isQuestionnaireCompleted,
    isSelfAssessmentCompleted,
    isLoading: onboardingLoading 
  } = useOnboarding();
  const { 
    sessions,
    getPracticeSessions,
    isLoading: practiceLoading 
  } = usePractice();
  const { userProfile, isLoading: userLoading } = useUser();
  const { achievements, isLoading: contentLoading } = useContent();

  // ✅ FIREBASE-ONLY: Enhanced completion status check
  const isFirebaseQuestionnaireCompleted = useCallback(() => {
    if (!currentUser?.uid) {
      console.warn('🚨 No authenticated user for questionnaire check');
      return false;
    }
    
    try {
      const completed = questionnaire?.completed || 
                       !!questionnaire?.responses ||
                       isQuestionnaireCompleted();
      
      console.log('🔥 Firebase Questionnaire Status:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        completed,
        hasQuestionnaire: !!questionnaire,
        hasResponses: !!questionnaire?.responses
      });
      
      return completed;
    } catch (error) {
      console.error('Error checking Firebase questionnaire completion:', error);
      return false;
    }
  }, [currentUser, questionnaire, isQuestionnaireCompleted]);

  const isFirebaseSelfAssessmentCompleted = useCallback(() => {
    if (!currentUser?.uid) {
      console.warn('🚨 No authenticated user for self-assessment check');
      return false;
    }
    
    try {
      const completed = selfAssessment?.completed || 
                       !!selfAssessment?.responses ||
                       !!selfAssessment?.categories ||
                       selfAssessment?.attachmentScore !== undefined ||
                       isSelfAssessmentCompleted();
      
      console.log('🔥 Firebase Self-Assessment Status:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        completed,
        hasSelfAssessment: !!selfAssessment,
        hasResponses: !!selfAssessment?.responses,
        hasCategories: !!selfAssessment?.categories
      });
      
      return completed;
    } catch (error) {
      console.error('Error checking Firebase self-assessment completion:', error);
      return false;
    }
  }, [currentUser, selfAssessment, isSelfAssessmentCompleted]);

  const getFirebasePracticeSessions = useCallback((): FirebasePracticeSession[] => {
    if (!currentUser?.uid) {
      console.warn('🚨 No authenticated user for practice sessions');
      return [];
    }
    
    try {
      const firebaseSessions = sessions || getPracticeSessions() || [];
      
      console.log('🔥 Firebase Practice Sessions:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        totalSessions: firebaseSessions.length,
        sessionTypes: firebaseSessions.map(s => s.sessionType).filter(Boolean),
        firstFewSessions: firebaseSessions.slice(0, 3).map(s => ({
          stageLabel: s.stageLabel,
          stageLevel: s.stageLevel,
          level: s.level,
          tLevel: s.tLevel,
          sessionType: s.sessionType,
          completed: s.completed,
          rating: s.rating,
          duration: s.duration
        }))
      });
      
      return firebaseSessions;
    } catch (error) {
      console.error('Error getting Firebase practice sessions:', error);
      return [];
    }
  }, [currentUser, sessions, getPracticeSessions]);

  // ✅ FIREBASE-ONLY: Modal state management (unchanged)
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
    introduction: false,
    firebaseSource: true,
    lastSyncAt: new Date().toISOString()
  });
  
  // ✅ FIREBASE-ONLY: Get completion status from Firebase only
  const getFirebaseCompletionStatus = useCallback((): CompletionStatus => {
    if (!currentUser?.uid) {
      return {
        questionnaire: false,
        selfAssessment: false,
        introduction: false,
        firebaseSource: true,
        lastSyncAt: new Date().toISOString()
      };
    }

    try {
      // Check Firebase achievements for introduction completion
      const hasIntroductionAchievement = achievements?.some(achievement => 
        achievement.title === 'introduction_completed' || 
        achievement.description?.includes('introduction')
      ) || false;

      // Or check user profile for introduction completion (using available properties)
      const introCompleted = hasIntroductionAchievement || false;

      const status = {
        questionnaire: isFirebaseQuestionnaireCompleted(),
        selfAssessment: isFirebaseSelfAssessmentCompleted(),
        introduction: introCompleted,
        firebaseSource: true,
        lastSyncAt: new Date().toISOString()
      };

      console.log('🔥 Firebase Completion Status:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        ...status
      });

      return status;
    } catch (error) {
      console.error('Error reading Firebase completion status:', error);
      return {
        questionnaire: false,
        selfAssessment: false,
        introduction: false,
        firebaseSource: true,
        lastSyncAt: new Date().toISOString()
      };
    }
  }, [currentUser, isFirebaseQuestionnaireCompleted, isFirebaseSelfAssessmentCompleted, achievements, userProfile]);
  
  // 🔥 FIXED: Get T-stage progress from Firebase sessions with SUPER AGGRESSIVE FILTERING
  const getFirebaseTStageProgress = useCallback((): TStageProgress => {
    const defaultProgress: TStageProgress = {
      t1: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
      t2: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
      t3: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
      t4: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
      t5: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 }
    };
    
    if (!currentUser?.uid) {
      console.warn('🚨 No authenticated user for T-stage progress');
      return defaultProgress;
    }
    
    try {
      const allSessions = getFirebasePracticeSessions();
      const stages = ['t1', 't2', 't3', 't4', 't5'] as const;
      
      console.log('🔥 Processing Firebase T-Stage Progress:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        totalSessions: allSessions.length,
        sessionSample: allSessions.slice(0, 5).map(s => ({
          stageLabel: s.stageLabel,
          stageLevel: s.stageLevel,
          level: s.level,
          tLevel: s.tLevel,
          sessionType: s.sessionType,
          completed: s.completed,
          rating: s.rating
        }))
      });
      
      stages.forEach(stage => {
        try {
          // 🔥 FIXED: SUPER AGGRESSIVE filtering logic that handles ALL possible variations
          const stageSessions = allSessions.filter((session: FirebasePracticeSession) => {
            // Get all possible identifiers (with safety checks)
            const stageLabel = (session.stageLabel || '').toLowerCase().trim();
            const stageLevel = session.stageLevel;
            const level = (session.level || '').toLowerCase().trim();
            const tLevel = (session.tLevel || '').toLowerCase().trim();
            const stageNumber = parseInt(stage.substring(1)); // t1 -> 1, t2 -> 2, etc.
            const sessionType = (session.sessionType || '').toLowerCase();
            
            // ✅ FIXED: Check ALL possible variations and combinations
            const possibleMatches = [
              // Direct exact matches
              stageLabel === stage,
              stageLabel === stage.toUpperCase(),
              level === stage,
              level === stage.toUpperCase(),
              tLevel === stage,
              tLevel === stage.toUpperCase(),
              
              // Number-based matches
              stageLevel === stageNumber,
              parseInt(stageLabel) === stageNumber,
              parseInt(level) === stageNumber,
              parseInt(tLevel) === stageNumber,
              
              // Prefixed matches
              stageLabel === `t${stageNumber}`,
              stageLabel === `T${stageNumber}`,
              level === `t${stageNumber}`,
              level === `T${stageNumber}`,
              tLevel === `t${stageNumber}`,
              tLevel === `T${stageNumber}`,
              
              // Stage-based matches
              stageLabel === `stage${stageNumber}`,
              stageLabel === `Stage${stageNumber}`,
              level === `stage${stageNumber}`,
              level === `Stage${stageNumber}`,
              
              // Contains matches (more permissive)
              stageLabel.includes(stage),
              stageLabel.includes(stage.toUpperCase()),
              level.includes(stage),
              level.includes(stage.toUpperCase()),
              tLevel.includes(stage),
              tLevel.includes(stage.toUpperCase()),
              
              // Pattern matches
              stageLabel.includes(`t${stageNumber}`),
              stageLabel.includes(`T${stageNumber}`),
              level.includes(`t${stageNumber}`),
              level.includes(`T${stageNumber}`),
              tLevel.includes(`t${stageNumber}`),
              tLevel.includes(`T${stageNumber}`)
            ];
            
            // Check if any match is true
            const isMatch = possibleMatches.some(match => match === true);
            
            // Additional filter: must be meditation type (if sessionType exists)
            const isMeditation = !sessionType || sessionType === 'meditation' || sessionType === 'practice';
            
            // Final match condition
            const finalMatch = isMatch && isMeditation;
            
            if (finalMatch) {
              console.log(`🎯 Found ${stage} session:`, {
                stageLabel: session.stageLabel,
                stageLevel: session.stageLevel,
                level: session.level,
                tLevel: session.tLevel,
                sessionType: session.sessionType,
                matchedBy: possibleMatches.map((match, index) => match ? index : null).filter(i => i !== null)
              });
            }
            
            return finalMatch;
          });
          
          // ✅ FIXED: More liberal completion checking
          const completedSessions = stageSessions.filter((session: FirebasePracticeSession) => {
            // Consider completed if:
            // 1. Has rating > 0
            // 2. completed !== false (handles undefined as completed)
            // 3. Has duration > 0
            return (session.rating && session.rating > 0) || 
                   session.completed !== false || 
                   (session.duration && session.duration > 0);
          });
          
          // Check completion: need at least 3 completed sessions for each T-level
          const isCompleted = completedSessions.length >= 3;
          
          defaultProgress[stage] = {
            completed: isCompleted,
            sessions: stageSessions,
            completedSessions: completedSessions.length
          };

          console.log(`🔥 Firebase ${stage.toUpperCase()} Progress:`, {
            userId: currentUser.uid.substring(0, 8) + '...',
            totalSessions: stageSessions.length,
            completedSessions: completedSessions.length,
            isCompleted,
            sessionDetails: stageSessions.map(s => ({
              stageLabel: s.stageLabel,
              tLevel: s.tLevel,
              level: s.level,
              rating: s.rating,
              completed: s.completed,
              duration: s.duration
            }))
          });
          
        } catch (stageError) {
          console.warn(`Error processing Firebase ${stage} progress:`, stageError);
        }
      });
      
      // 🔥 DEBUG: Log final progress summary
      console.log('🎯 FINAL T-Stage Progress Summary:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        t1: `${defaultProgress.t1.completedSessions}/3 sessions (${defaultProgress.t1.completed ? 'COMPLETE' : 'incomplete'})`,
        t2: `${defaultProgress.t2.completedSessions}/3 sessions (${defaultProgress.t2.completed ? 'COMPLETE' : 'incomplete'})`,
        t3: `${defaultProgress.t3.completedSessions}/3 sessions (${defaultProgress.t3.completed ? 'COMPLETE' : 'incomplete'})`,
        t4: `${defaultProgress.t4.completedSessions}/3 sessions (${defaultProgress.t4.completed ? 'COMPLETE' : 'incomplete'})`,
        t5: `${defaultProgress.t5.completedSessions}/3 sessions (${defaultProgress.t5.completed ? 'COMPLETE' : 'incomplete'})`,
        totalSessions: Object.values(defaultProgress).reduce((sum, stage) => sum + stage.sessions.length, 0),
        totalCompleted: Object.values(defaultProgress).reduce((sum, stage) => sum + stage.completedSessions, 0)
      });
      
      return defaultProgress;
    } catch (error) {
      console.error('Error reading Firebase T-stage progress:', error);
      return defaultProgress;
    }
  }, [currentUser, getFirebasePracticeSessions, userProfile]);

  // ✅ FIREBASE-ONLY: PAHM stage progress from Firebase data (unchanged)
  const getFirebasePAHMStageProgress = useCallback((): PAHMStageProgress => {
    const defaultProgress: PAHMStageProgress = {
      stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee', firebaseHours: 0 },
      stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner', firebaseHours: 0 },
      stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner', firebaseHours: 0 },
      stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master', firebaseHours: 0 },
      stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator', firebaseHours: 0 }
    };

    if (!currentUser?.uid) {
      return defaultProgress;
    }

    try {
      const allSessions = getFirebasePracticeSessions();
      const stages = ['stage2', 'stage3', 'stage4', 'stage5', 'stage6'] as const;
      const stageNames = ['PAHM Trainee', 'PAHM Beginner', 'PAHM Practitioner', 'PAHM Master', 'PAHM Illuminator'] as const;
      
      console.log('🔥 Processing Firebase PAHM Progress:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        totalSessions: allSessions.length
      });
      
      stages.forEach((stage, index) => {
        try {
          const stageNumber = index + 2; // stage2 = 2, stage3 = 3, etc.
          
          // Calculate hours from Firebase sessions for this PAHM stage
          const stageSessions = allSessions.filter((session: FirebasePracticeSession) =>
            session.stageLevel === stageNumber && 
            session.sessionType === 'meditation'
          );
          
          const totalMinutes = stageSessions.reduce((sum, session) => 
            sum + (session.duration || 0), 0
          );
          const firebaseHours = totalMinutes / 60;
          
          // Check Firebase user profile for completion (using available properties)
          const profileCompleted = userProfile?.preferences?.favoriteStages?.includes(stageNumber) || false;
          const hoursCompleted = firebaseHours >= 15;
          const completed = profileCompleted || hoursCompleted;
          
          (defaultProgress as any)[stage] = {
            hours: firebaseHours,
            completed,
            required: 15,
            name: stageNames[index],
            firebaseHours
          };

          console.log(`🔥 Firebase ${stage} Progress:`, {
            userId: currentUser.uid.substring(0, 8) + '...',
            sessions: stageSessions.length,
            hours: firebaseHours.toFixed(1),
            completed
          });
        } catch (stageError) {
          console.warn(`Error processing Firebase ${stage} progress:`, stageError);
        }
      });
      
      return defaultProgress;
    } catch (error) {
      console.error('Error reading Firebase PAHM stage progress:', error);
      return defaultProgress;
    }
  }, [currentUser, getFirebasePracticeSessions, userProfile]);
  
  // ✅ PRESERVED: Helper functions (unchanged logic)
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
    if (!currentUser?.uid) {
      return { 
        allowed: false, 
        requirement: 'User authentication required',
        firebaseVerified: false 
      };
    }

    if (tStage.toLowerCase() === 't1') {
      return { 
        allowed: true, 
        firebaseVerified: true 
      };
    }

    try {
      const tStageProgress = getFirebaseTStageProgress();
      const previousStage = getPreviousStage(tStage);
      
      if (previousStage) {
        const previousStageKey = previousStage.toLowerCase() as keyof TStageProgress;
        const previousProgress = tStageProgress[previousStageKey];
        const requiredSessions = 3;
        
        if (previousProgress.completedSessions < requiredSessions) {
          const requirement = `Complete at least ${requiredSessions} ${previousStage} sessions before accessing ${tStage.toUpperCase()}. Current: ${previousProgress.completedSessions}/${requiredSessions} (Firebase verified)`;
          setProgressRequirement(requirement);
          setShowProgressModal(true);
          return { 
            allowed: false, 
            requirement,
            missingRequirement: 'sessions',
            firebaseVerified: true
          };
        }
      }

      console.log('🔥 Firebase T-Stage Access Check:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        tStage: tStage.toUpperCase(),
        allowed: true
      });

      return { 
        allowed: true, 
        firebaseVerified: true 
      };
    } catch (error) {
      console.error('Error checking Firebase T-stage access:', error);
      return { 
        allowed: false, 
        requirement: 'Error verifying Firebase data',
        firebaseVerified: false 
      };
    }
  }, [currentUser, getFirebaseTStageProgress, getPreviousStage]);

  const checkPAHMStageAccess = useCallback((stage: number): TStageAccess => {
    if (!currentUser?.uid) {
      return { 
        allowed: false, 
        requirement: 'User authentication required',
        firebaseVerified: false 
      };
    }

    if (stage === 1) {
      return { 
        allowed: true, 
        firebaseVerified: true 
      };
    }

    try {
      const tStageProgress = getFirebaseTStageProgress();
      const pahmProgress = getFirebasePAHMStageProgress();
      
      if (stage >= 2 && !tStageProgress.t5.completed) {
        const requirement = 'Complete all T-stages (T1-T5) in Stage 1 before accessing PAHM stages (Firebase verified)';
        setProgressRequirement(requirement);
        setShowStageAccessModal(true);
        return { 
          allowed: false, 
          requirement,
          missingRequirement: 'progression',
          firebaseVerified: true
        };
      }

      if (stage >= 3) {
        const previousStageKey = `stage${stage - 1}` as keyof PAHMStageProgress;
        const previousStage = pahmProgress[previousStageKey];
        
        if (!previousStage.completed) {
          const requirement = `Complete Stage ${stage - 1} (${previousStage.name}) with 15 hours of practice before accessing Stage ${stage} (Firebase verified)`;
          setProgressRequirement(requirement);
          setShowStageAccessModal(true);
          return { 
            allowed: false, 
            requirement,
            missingRequirement: 'progression',
            firebaseVerified: true
          };
        }
      }

      console.log('🔥 Firebase PAHM Stage Access Check:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        stage,
        allowed: true
      });

      return { 
        allowed: true, 
        firebaseVerified: true 
      };
    } catch (error) {
      console.error('Error checking Firebase PAHM stage access:', error);
      return { 
        allowed: false, 
        requirement: 'Error verifying Firebase data',
        firebaseVerified: false 
      };
    }
  }, [currentUser, getFirebaseTStageProgress, getFirebasePAHMStageProgress]);
  
  // ✅ FIREBASE-ONLY: Enhanced stage management (unchanged)
  const getCurrentAccessibleStage = useCallback((): number => {
    if (!currentUser?.uid) {
      return 1;
    }

    try {
      const tStageProgress = getFirebaseTStageProgress();
      const pahmProgress = getFirebasePAHMStageProgress();
      
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
      console.error('Error getting current accessible stage from Firebase:', error);
      return 1;
    }
  }, [currentUser, getFirebaseTStageProgress, getFirebasePAHMStageProgress, checkPAHMStageAccess]);

  const getNextAccessibleStage = useCallback((): number | null => {
    try {
      const currentStage = getCurrentAccessibleStage();
      return currentStage < 6 ? currentStage + 1 : null;
    } catch (error) {
      console.error('Error getting next accessible stage:', error);
      return null;
    }
  }, [getCurrentAccessibleStage]);

  // ✅ FIREBASE-ONLY: Enhanced happiness tracking data validation (unchanged)
  const hasMinimumDataForHappiness = useCallback((): boolean => {
    if (!currentUser?.uid) {
      console.warn('🚨 No authenticated user for happiness data check');
      return false;
    }

    try {
      const completion = getFirebaseCompletionStatus();
      const tStageProgress = getFirebaseTStageProgress();
      
      const totalCompletedSessions = Object.values(tStageProgress).reduce(
        (sum, stage) => sum + (stage?.completedSessions || 0), 
        0
      );
      
      const hasQuestionnaireAndAssessment = completion.questionnaire && completion.selfAssessment;
      const hasEnoughSessions = totalCompletedSessions >= 3;
      const hasQuestionnaireAndOneSession = completion.questionnaire && totalCompletedSessions >= 1;
      
      const result = hasQuestionnaireAndAssessment || hasEnoughSessions || hasQuestionnaireAndOneSession;
      
      console.log('🔥 Firebase hasMinimumDataForHappiness check:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        completion,
        totalCompletedSessions,
        hasQuestionnaireAndAssessment,
        hasEnoughSessions,
        hasQuestionnaireAndOneSession,
        result,
        firebaseVerified: true
      });
      
      return result;
    } catch (error) {
      console.error('Error checking Firebase minimum data for happiness:', error);
      return false;
    }
  }, [currentUser, getFirebaseCompletionStatus, getFirebaseTStageProgress]);

  const getCompleteProgressSummary = useCallback((): ProgressSummary => {
    if (!currentUser?.uid) {
      return {
        stage1: {
          completedTStages: 0,
          totalTStages: 5,
          totalSessions: 0,
          totalCompletedSessions: 0,
          progress: {
            t1: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t2: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t3: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t4: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t5: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 }
          },
          percentComplete: 0,
          isComplete: false
        },
        pahmStages: {
          completedStages: 0,
          totalStages: 5,
          totalHours: 0,
          progress: {
            stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee', firebaseHours: 0 },
            stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner', firebaseHours: 0 },
            stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner', firebaseHours: 0 },
            stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master', firebaseHours: 0 },
            stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator', firebaseHours: 0 }
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
        },
        firebaseMetadata: {
          userId: '',
          lastUpdated: new Date().toISOString(),
          dataSource: 'Firebase Cloud Storage',
          crossDeviceSync: false
        }
      };
    }

    try {
      const completion = getFirebaseCompletionStatus();
      const tStageProgress = getFirebaseTStageProgress();
      const pahmProgress = getFirebasePAHMStageProgress();
      
      const stage1Completed = Object.values(tStageProgress).filter((t: any) => t?.completed).length;
      const stage1TotalSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + (t?.sessions?.length || 0), 0);
      const stage1CompletedSessions = Object.values(tStageProgress).reduce((sum: number, t: any) => sum + (t?.completedSessions || 0), 0);
      
      const pahmCompletedStages = Object.values(pahmProgress).filter((s: any) => s?.completed).length;
      const pahmTotalHours = Object.values(pahmProgress).reduce((sum: number, s: any) => sum + (s?.firebaseHours || s?.hours || 0), 0);
      
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
      
      const summary: ProgressSummary = {
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
        },
        firebaseMetadata: {
          userId: currentUser.uid,
          lastUpdated: new Date().toISOString(),
          dataSource: 'Firebase Cloud Storage',
          crossDeviceSync: true
        }
      };

      console.log('🔥 Firebase Complete Progress Summary:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        stage1Completed,
        pahmCompletedStages,
        currentLevel,
        totalPracticeHours: totalPracticeHours.toFixed(1),
        stage1Sessions: stage1TotalSessions,
        stage1CompletedSessions
      });

      return summary;
    } catch (error) {
      console.error('Error getting Firebase complete progress summary:', error);
      // Return safe defaults with Firebase metadata
      return {
        stage1: {
          completedTStages: 0,
          totalTStages: 5,
          totalSessions: 0,
          totalCompletedSessions: 0,
          progress: {
            t1: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t2: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t3: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t4: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t5: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 }
          },
          percentComplete: 0,
          isComplete: false
        },
        pahmStages: {
          completedStages: 0,
          totalStages: 5,
          totalHours: 0,
          progress: {
            stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee', firebaseHours: 0 },
            stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner', firebaseHours: 0 },
            stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner', firebaseHours: 0 },
            stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master', firebaseHours: 0 },
            stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator', firebaseHours: 0 }
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
        },
        firebaseMetadata: {
          userId: currentUser.uid,
          lastUpdated: new Date().toISOString(),
          dataSource: 'Firebase Cloud Storage',
          crossDeviceSync: true
        }
      };
    }
  }, [currentUser, getFirebaseCompletionStatus, getFirebaseTStageProgress, getFirebasePAHMStageProgress, getCurrentAccessibleStage]);

  // ✅ FIREBASE-ONLY: Enhanced utility methods (unchanged)
  const recheckFirebaseStatus = useCallback(async () => {
    if (!currentUser?.uid) {
      console.warn('🚨 Cannot recheck status - no authenticated user');
      return;
    }

    try {
      const newStatus = getFirebaseCompletionStatus();
      setCompletionStatus(newStatus);
      console.log('🔥 Rechecked Firebase status:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        ...newStatus
      });
    } catch (error) {
      console.error('Error rechecking Firebase status:', error);
    }
  }, [currentUser, getFirebaseCompletionStatus]);

  const handleSessionComplete = useCallback((sessionData: any) => {
    if (!currentUser?.uid) {
      console.warn('🚨 Cannot handle session complete - no authenticated user');
      return;
    }

    try {
      setLastSessionData({
        ...sessionData,
        userId: currentUser.uid,
        firebaseProcessed: true,
        processedAt: new Date().toISOString()
      });
      setShowSessionCompletionModal(true);
      
      console.log('🔥 Firebase Session Complete:', {
        userId: currentUser.uid.substring(0, 8) + '...',
        sessionType: sessionData.sessionType || 'unspecified',
        duration: sessionData.duration || 0,
        stageLabel: sessionData.stageLabel,
        tLevel: sessionData.tLevel
      });
      
      // Recheck status after Firebase data updates
      setTimeout(() => {
        recheckFirebaseStatus();
      }, 1000); // Allow time for Firebase to process
    } catch (error) {
      console.error('Error handling Firebase session complete:', error);
    }
  }, [currentUser, recheckFirebaseStatus]);

  const checkAndShowWelcome = useCallback(() => {
    if (!currentUser?.uid) {
      return;
    }

    try {
      // Check Firebase user profile for welcome status (using available properties)
      const hasSeenWelcome = false; // Default to false since hasSeenWelcome doesn't exist on preferences
      
      if (!hasSeenWelcome && !hasMinimumDataForHappiness()) {
        setShowWelcomeModal(true);
        console.log('🔥 Showing Firebase welcome modal for user:', currentUser.uid.substring(0, 8) + '...');
        
        // TODO: Update Firebase user profile to mark welcome as seen
        // This should be handled by the UserContext when welcome is dismissed
      }
    } catch (error) {
      console.error('Error checking Firebase welcome status:', error);
    }
  }, [currentUser, userProfile, hasMinimumDataForHappiness]);

  // ✅ FIREBASE-ONLY: Enhanced useEffect hooks for Firebase data (unchanged)
  useEffect(() => {
    if (currentUser?.uid && !onboardingLoading && !practiceLoading && !userLoading) {
      const timeoutId = setTimeout(() => {
        recheckFirebaseStatus();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, recheckFirebaseStatus, onboardingLoading, practiceLoading, userLoading]);

  useEffect(() => {
    if (currentUser?.uid && !contentLoading) {
      const timeoutId = setTimeout(() => {
        checkAndShowWelcome();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, checkAndShowWelcome, contentLoading]);

  // ✅ FIREBASE-ONLY: Listen for Firebase context events (unchanged)
  useEffect(() => {
    if (!currentUser?.uid) return;

    const handleFirebaseOnboardingEvent = (event: any) => {
      try {
        console.log(`🔥 Firebase onboarding event for ${currentUser.uid.substring(0, 8)}...:`, event.detail);
        if (event.detail.type === 'selfAssessment' || 
            event.detail.type === 'questionnaire' ||
            event.detail.userId === currentUser.uid) {
          console.log('🔄 Firebase onboarding event triggered status recheck');
          setTimeout(() => recheckFirebaseStatus(), 500);
        }
      } catch (error) {
        console.error('Error handling Firebase onboarding event:', error);
      }
    };

    const handleFirebasePracticeEvent = (event: any) => {
      try {
        console.log(`🔥 Firebase practice event for ${currentUser.uid.substring(0, 8)}...:`, event.detail);
        if (event.detail.userId === currentUser.uid) {
          setTimeout(() => recheckFirebaseStatus(), 500);
        }
      } catch (error) {
        console.error('Error handling Firebase practice event:', error);
      }
    };

    window.addEventListener('onboardingUpdated', handleFirebaseOnboardingEvent);
    window.addEventListener('selfAssessmentCompleted', handleFirebaseOnboardingEvent);
    window.addEventListener('questionnaireCompleted', handleFirebaseOnboardingEvent);
    window.addEventListener('practiceSessionAdded', handleFirebasePracticeEvent);
    window.addEventListener('stageProgressUpdated', handleFirebasePracticeEvent);
    
    return () => {
      window.removeEventListener('onboardingUpdated', handleFirebaseOnboardingEvent);
      window.removeEventListener('selfAssessmentCompleted', handleFirebaseOnboardingEvent);
      window.removeEventListener('questionnaireCompleted', handleFirebaseOnboardingEvent);
      window.removeEventListener('practiceSessionAdded', handleFirebasePracticeEvent);
      window.removeEventListener('stageProgressUpdated', handleFirebasePracticeEvent);
    };
  }, [currentUser, recheckFirebaseStatus]);

  // ✅ FIREBASE-ONLY: Return interface with Firebase enhancements (unchanged)
  return {
    // Modal state management (unchanged)
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
    
    // Progress data (unchanged)
    progressRequirement,
    lastSessionData,
    
    // Access checking (Firebase-enhanced)
    checkTStageAccess,
    checkPAHMStageAccess,
    
    // Progress methods (Firebase-only)
    getTStageProgress: getFirebaseTStageProgress,
    getPAHMStageProgress: getFirebasePAHMStageProgress,
    getCompleteProgressSummary,
    getCurrentAccessibleStage,
    getNextAccessibleStage,
    
    // Data validation (Firebase-only)
    hasMinimumDataForHappiness,
    
    // Event handling (Firebase-enhanced)
    handleSessionComplete,
    
    // Status management (Firebase-only)
    completionStatus,
    recheckStatus: recheckFirebaseStatus,
    checkAndShowWelcome,
    
    // Firebase-specific enhancements
    firebaseIntegrated: true,
    currentUser,
    isAuthenticated: !!currentUser,
    dataSource: 'Firebase Cloud Storage',
    crossDeviceSync: true
  };
};

// ✅ FIREBASE-ONLY: Enhanced helper hook (unchanged)
export const useCompleteProgress = () => {
  if (!useAuth().currentUser?.uid) {
    // Return safe defaults for unauthenticated users
    return {
      getCompleteProgressSummary: () => ({
        stage1: { 
          completedTStages: 0, 
          totalTStages: 5, 
          totalSessions: 0, 
          totalCompletedSessions: 0, 
          progress: {
            t1: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t2: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t3: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t4: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t5: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 }
          }, 
          percentComplete: 0, 
          isComplete: false 
        },
        pahmStages: { 
          completedStages: 0, 
          totalStages: 5, 
          totalHours: 0, 
          progress: {
            stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee', firebaseHours: 0 },
            stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner', firebaseHours: 0 },
            stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner', firebaseHours: 0 },
            stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master', firebaseHours: 0 },
            stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator', firebaseHours: 0 }
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
        },
        firebaseMetadata: {
          userId: '',
          lastUpdated: new Date().toISOString(),
          dataSource: 'Firebase Cloud Storage',
          crossDeviceSync: false
        }
      }),
      getCurrentAccessibleStage: () => 1,
      hasMinimumDataForHappiness: () => false,
      firebaseIntegrated: false
    };
  }

  try {
    const { getCompleteProgressSummary, getCurrentAccessibleStage, hasMinimumDataForHappiness } = useProgressiveOnboarding();
    
    return {
      getCompleteProgressSummary,
      getCurrentAccessibleStage,
      hasMinimumDataForHappiness,
      firebaseIntegrated: true
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
            t1: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t2: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t3: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t4: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 },
            t5: { completed: false, sessions: [] as FirebasePracticeSession[], completedSessions: 0 }
          }, 
          percentComplete: 0, 
          isComplete: false 
        },
        pahmStages: { 
          completedStages: 0, 
          totalStages: 5, 
          totalHours: 0, 
          progress: {
            stage2: { hours: 0, completed: false, required: 15, name: 'PAHM Trainee', firebaseHours: 0 },
            stage3: { hours: 0, completed: false, required: 15, name: 'PAHM Beginner', firebaseHours: 0 },
            stage4: { hours: 0, completed: false, required: 15, name: 'PAHM Practitioner', firebaseHours: 0 },
            stage5: { hours: 0, completed: false, required: 15, name: 'PAHM Master', firebaseHours: 0 },
            stage6: { hours: 0, completed: false, required: 15, name: 'PAHM Illuminator', firebaseHours: 0 }
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
        },
        firebaseMetadata: {
          userId: '',
          lastUpdated: new Date().toISOString(),
          dataSource: 'Firebase Cloud Storage',
          crossDeviceSync: false
        }
      }),
      getCurrentAccessibleStage: () => 1,
      hasMinimumDataForHappiness: () => false,
      firebaseIntegrated: false
    };
  }
};