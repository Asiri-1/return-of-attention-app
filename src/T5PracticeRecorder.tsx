// ✅ ENHANCED T5PracticeRecorder.tsx - PHASE 3 FIREBASE INTEGRATION
// File: src/T5PracticeRecorder.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Error handling and fallback mechanisms
// ✅ ENHANCED: Real-time progress tracking
// ✅ ENHANCED: Session validation and sanitization
// ✅ ENHANCED: T1, T2, T3, and T4 prerequisite validation
// ✅ ENHANCED: Stage 1 completion recognition

import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T5PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T5PracticeRecorder - Handles recording of T5 practice sessions
 * 
 * ✅ FIREBASE-ONLY: Integrates with PracticeContext, UserContext, and AuthContext
 * ✅ ENHANCED: Phase 3 compliant with proper error handling and validation
 * ✅ ENHANCED: T1, T2, T3, and T4 prerequisite checking and T5 progression tracking
 * ✅ ENHANCED: Stage 1 (Physical Readiness) completion recognition
 */
const T5PracticeRecorder = forwardRef<any, T5PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // ✅ ENHANCED: Complete Firebase context integration
  const { currentUser } = useAuth();
  const { addPracticeSession, sessions } = usePractice();
  const userContext = useUser();

  // ✅ ENHANCED: Safe method wrapper for UserContext methods
  const safeUserContextCall = useCallback(async (method: string, fallbackValue: any, ...args: any[]) => {
    try {
      const userContextMethod = (userContext as any)[method];
      if (typeof userContextMethod === 'function') {
        return await userContextMethod(...args);
      } else {
        console.warn(`⚠️ UserContext method '${method}' not available, using fallback`);
        return fallbackValue;
      }
    } catch (error) {
      console.warn(`⚠️ Error calling UserContext.${method}:`, error);
      return fallbackValue;
    }
  }, [userContext]);

  // ✅ ENHANCED: Calculate T1, T2, T3, T4, and T5 progress using available data
  const getT5ProgressFromStats = useCallback(() => {
    try {
      const allSessions = sessions || [];
      
      // Count T1 sessions (first prerequisite)
      const t1Sessions = allSessions.filter(session => 
        session.tLevel === 'T1' || 
        session.level === 't1' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration <= 12)
      ).length;
      
      // Count T2 sessions (second prerequisite)
      const t2Sessions = allSessions.filter(session => 
        session.tLevel === 'T2' || 
        session.level === 't2' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 12 && session.duration <= 17)
      ).length;
      
      // Count T3 sessions (third prerequisite)
      const t3Sessions = allSessions.filter(session => 
        session.tLevel === 'T3' || 
        session.level === 't3' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 17 && session.duration <= 22)
      ).length;
      
      // Count T4 sessions (fourth prerequisite)
      const t4Sessions = allSessions.filter(session => 
        session.tLevel === 'T4' || 
        session.level === 't4' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 22 && session.duration <= 27)
      ).length;
      
      // Count T5 sessions (final level)
      const t5Sessions = allSessions.filter(session => 
        session.tLevel === 'T5' || 
        session.level === 't5' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 27 && session.duration <= 32)
      ).length;
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const isT3Complete = t3Sessions >= 3;
      const isT4Complete = t4Sessions >= 3;
      const isT5Complete = t5Sessions >= 3;
      const canPracticeT5 = isT1Complete && isT2Complete && isT3Complete && isT4Complete;
      const stageOneComplete = isT5Complete; // T5 completion = Stage 1 complete
      
      return {
        // T1 Data (first prerequisite)
        t1Sessions,
        t1Complete: isT1Complete,
        
        // T2 Data (second prerequisite)
        t2Sessions,
        t2Complete: isT2Complete,
        
        // T3 Data (third prerequisite)
        t3Sessions,
        t3Complete: isT3Complete,
        
        // T4 Data (fourth prerequisite)
        t4Sessions,
        t4Complete: isT4Complete,
        
        // T5 Data (final level)
        t5Sessions,
        t5Complete: isT5Complete,
        t5Progress: `${t5Sessions}/3`,
        t5Percentage: Math.min((t5Sessions / 3) * 100, 100),
        sessionsNeeded: Math.max(0, 3 - t5Sessions),
        
        // Access and completion
        canPracticeT5,
        prerequisitesMet: isT1Complete && isT2Complete && isT3Complete && isT4Complete,
        missingPrerequisites: [
          ...(isT1Complete ? [] : ['T1']),
          ...(isT2Complete ? [] : ['T2']),
          ...(isT3Complete ? [] : ['T3']),
          ...(isT4Complete ? [] : ['T4'])
        ],
        
        // Stage completion
        stageOneComplete,
        physicalReadinessComplete: isT5Complete,
        readyForStageTwo: isT5Complete
      };
    } catch (error) {
      console.error('Error calculating T5 progress from stats:', error);
      return {
        t1Sessions: 0, t1Complete: false,
        t2Sessions: 0, t2Complete: false,
        t3Sessions: 0, t3Complete: false,
        t4Sessions: 0, t4Complete: false,
        t5Sessions: 0, t5Complete: false, t5Progress: '0/3', t5Percentage: 0,
        sessionsNeeded: 3, canPracticeT5: false, prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2', 'T3', 'T4'],
        stageOneComplete: false, physicalReadinessComplete: false, readyForStageTwo: false
      };
    }
  }, [sessions]);

  // ✅ ENHANCED: Record session with comprehensive validation and stage completion recognition
  const recordT5Session = useCallback(async (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    try {
      // Validate inputs
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      if (duration <= 0 || timeSpent <= 0) {
        throw new Error('Invalid duration or time spent');
      }

      // Check T1, T2, T3, and T4 prerequisites
      const currentProgress = getT5ProgressFromStats();
      if (!currentProgress.prerequisitesMet) {
        const missing = currentProgress.missingPrerequisites.join(', ');
        throw new Error(
          `T5 prerequisites not met. Complete ${missing} first. ` +
          `Progress: T1 (${currentProgress.t1Sessions}/3), T2 (${currentProgress.t2Sessions}/3), T3 (${currentProgress.t3Sessions}/3), T4 (${currentProgress.t4Sessions}/3).`
        );
      }

      console.log('🎯 Recording T5 session:', {
        duration,
        timeSpent,
        isCompleted,
        user: currentUser.uid,
        t1Complete: currentProgress.t1Complete,
        t2Complete: currentProgress.t2Complete,
        t3Complete: currentProgress.t3Complete,
        t4Complete: currentProgress.t4Complete,
        currentT5Sessions: currentProgress.t5Sessions,
        willCompleteStageOne: currentProgress.t5Sessions + 1 >= 3
      });

      // ✅ Get current progress before recording
      console.log('📊 Current T5 progress:', currentProgress);

      // ✅ Try to increment UserContext session count (if method exists)
      let newT5SessionCount = currentProgress.t5Sessions + 1;
      try {
        const result = await safeUserContextCall('incrementT5Sessions', newT5SessionCount);
        if (typeof result === 'number') {
          newT5SessionCount = result;
          console.log(`📊 UserContext T5 Sessions: ${newT5SessionCount-1} → ${newT5SessionCount}`);
        }
      } catch (error) {
        console.warn('⚠️ UserContext T5 increment failed, continuing with PracticeContext only:', error);
      }

      // ✅ Check if this session completes Stage 1
      const willCompleteStageOne = newT5SessionCount >= 3;
      const wasStageOneComplete = currentProgress.stageOneComplete;

      // ✅ Create comprehensive session data with proper structure
      const sessionData = {
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        duration: timeSpent, // Actual practice time in minutes
        sessionType: 'meditation' as const,
        stageLevel: 1, // T5 is part of Stage 1
        stageLabel: 'T5: Complete Physical Readiness',
        tLevel: 'T5', // ✅ CRITICAL: T-level identifier
        level: 't5',  // ✅ CRITICAL: Lowercase T-level identifier
        rating: isCompleted ? 9 : 7, // T5 gets highest rating for mastery achievement
        notes: `T5 complete physical readiness training (${timeSpent} minutes)${willCompleteStageOne ? ' - STAGE 1 COMPLETE!' : ''}`,
        presentPercentage: isCompleted ? 65 : 50, // T5 may have lower initial presence due to 30-minute duration
        environment: {
          posture: 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 0, present_neutral: 0, present_aversion: 0,
          past_attachment: 0, past_neutral: 0, past_aversion: 0,
          future_attachment: 0, future_neutral: 0, future_aversion: 0
        },
        metadata: {
          tLevel: 'T5',
          isCompleted: isCompleted,
          targetDuration: duration,
          actualDuration: timeSpent,
          sessionCount: newT5SessionCount,
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          t2Complete: currentProgress.t2Complete,
          t2Sessions: currentProgress.t2Sessions,
          t3Complete: currentProgress.t3Complete,
          t3Sessions: currentProgress.t3Sessions,
          t4Complete: currentProgress.t4Complete,
          t4Sessions: currentProgress.t4Sessions,
          // ✅ Stage completion metadata
          stageOneComplete: willCompleteStageOne,
          physicalReadinessComplete: willCompleteStageOne,
          readyForStageTwo: willCompleteStageOne,
          isStageCompletionSession: willCompleteStageOne && !wasStageOneComplete,
          recordedAt: new Date().toISOString(),
          source: 'T5PracticeRecorder'
        }
      };

      // ✅ Save detailed session to PracticeContext for history
      await addPracticeSession(sessionData);
      console.log('✅ Session saved to PracticeContext');

      // ✅ Try to update UserContext profile for stage completion (if method exists)
      if (isCompleted) {
        try {
          await safeUserContextCall('updateT5Progress', null, {
            sessionsCompleted: newT5SessionCount,
            lastCompletedAt: new Date().toISOString(),
            isT5Complete: newT5SessionCount >= 3,
            stageOneComplete: willCompleteStageOne,
            physicalReadinessComplete: willCompleteStageOne
          });
          
          // ✅ Special handling for Stage 1 completion
          if (willCompleteStageOne && !wasStageOneComplete) {
            await safeUserContextCall('markStageComplete', null, 1, {
              completedAt: new Date().toISOString(),
              completionSession: sessionData.timestamp,
              totalFoundationTime: (currentProgress.t1Sessions * 10) + (currentProgress.t2Sessions * 15) + (currentProgress.t3Sessions * 20) + (currentProgress.t4Sessions * 25) + (newT5SessionCount * 30)
            });
            console.log('🎉 Stage 1 completion marked in UserContext!');
          }
        } catch (error) {
          console.warn('⚠️ UserContext profile update failed:', error);
        }
      }

      // ✅ Create response data with legacy compatibility
      const responseData = {
        ...sessionData,
        // ✅ Add legacy fields for backward compatibility
        level: 't5',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        currentProgress: {
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          t2Complete: currentProgress.t2Complete,
          t2Sessions: currentProgress.t2Sessions,
          t3Complete: currentProgress.t3Complete,
          t3Sessions: currentProgress.t3Sessions,
          t4Complete: currentProgress.t4Complete,
          t4Sessions: currentProgress.t4Sessions,
          t5Sessions: newT5SessionCount,
          t5Complete: newT5SessionCount >= 3,
          t5Progress: `${newT5SessionCount}/3`,
          t5Percentage: Math.min((newT5SessionCount / 3) * 100, 100),
          sessionsNeeded: Math.max(0, 3 - newT5SessionCount),
          prerequisitesMet: true, // Always true if we reach this point
          // ✅ Stage completion data
          stageOneComplete: willCompleteStageOne,
          physicalReadinessComplete: willCompleteStageOne,
          readyForStageTwo: willCompleteStageOne
        }
      };

      // ✅ Notify parent component
      onRecordSession(responseData);
      
      // ✅ Enhanced logging for stage completion
      if (willCompleteStageOne && !wasStageOneComplete) {
        console.log('🎉 STAGE 1 (PHYSICAL READINESS) COMPLETED! 🎉');
      }
      
      console.log('✅ T5 session recorded successfully', {
        duration: timeSpent,
        completed: isCompleted,
        sessionCount: newT5SessionCount,
        sessionId: sessionData.timestamp,
        isT5Complete: newT5SessionCount >= 3,
        stageOneComplete: willCompleteStageOne,
        nextLevel: willCompleteStageOne ? 'Stage 2' : 'Continue T5'
      });

      return responseData;

    } catch (error) {
      console.error('❌ Error recording T5 session:', error);
      
      // ✅ Enhanced fallback notification to parent
      const fallbackSessionData = {
        level: 't5',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: `Failed to save to Firebase: ${(error as Error).message}`,
        currentProgress: getT5ProgressFromStats() // Still provide current progress
      };
      
      onRecordSession(fallbackSessionData);
      throw error;
    }
  }, [currentUser, addPracticeSession, onRecordSession, safeUserContextCall, getT5ProgressFromStats]);

  // ✅ ENHANCED: Get T5 session history using available methods
  const getT5SessionHistory = useCallback(async () => {
    try {
      // Try UserContext first, fallback to PracticeContext calculation
      const progressFromStats = getT5ProgressFromStats();
      
      let userContextData = null;
      try {
        const sessionCount = await safeUserContextCall('getT5Sessions', 0);
        const complete = await safeUserContextCall('isT5Complete', false);
        userContextData = {
          totalSessions: sessionCount,
          isComplete: complete,
          progress: `${sessionCount}/3`
        };
      } catch (error) {
        console.warn('⚠️ UserContext T5 methods not available:', error);
      }

      // Use UserContext data if available, otherwise use calculated data
      const finalData = userContextData || {
        totalSessions: progressFromStats.t5Sessions,
        isComplete: progressFromStats.t5Complete,
        progress: progressFromStats.t5Progress
      };
      
      console.log(`📊 T5 session history: ${finalData.totalSessions} sessions completed`);
      
      return {
        ...finalData,
        t1Complete: progressFromStats.t1Complete,
        t1Sessions: progressFromStats.t1Sessions,
        t2Complete: progressFromStats.t2Complete,
        t2Sessions: progressFromStats.t2Sessions,
        t3Complete: progressFromStats.t3Complete,
        t3Sessions: progressFromStats.t3Sessions,
        t4Complete: progressFromStats.t4Complete,
        t4Sessions: progressFromStats.t4Sessions,
        canPractice: progressFromStats.canPracticeT5,
        prerequisitesMet: progressFromStats.prerequisitesMet,
        stageOneComplete: progressFromStats.stageOneComplete,
        physicalReadinessComplete: progressFromStats.physicalReadinessComplete,
        source: userContextData ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error getting T5 session history:', error);
      return {
        totalSessions: 0,
        isComplete: false,
        progress: '0/3 sessions',
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        t3Complete: false,
        t3Sessions: 0,
        t4Complete: false,
        t4Sessions: 0,
        canPractice: false,
        prerequisitesMet: false,
        stageOneComplete: false,
        physicalReadinessComplete: false,
        source: 'fallback'
      };
    }
  }, [getT5ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Check T5 completion status with comprehensive data
  const checkT5Complete = useCallback(async () => {
    try {
      const progressData = getT5ProgressFromStats();
      
      // Try to get UserContext data as well
      let userContextComplete = null;
      let userContextSessions = null;
      
      try {
        userContextComplete = await safeUserContextCall('isT5Complete', null);
        userContextSessions = await safeUserContextCall('getT5Sessions', null);
      } catch (error) {
        console.warn('⚠️ UserContext T5 completion check failed:', error);
      }

      const finalIsComplete = userContextComplete !== null ? userContextComplete : progressData.t5Complete;
      const finalSessions = userContextSessions !== null ? userContextSessions : progressData.t5Sessions;
      
      console.log(`📊 T5 completion status: ${finalIsComplete} (${finalSessions}/3 sessions)`);
      
      return {
        isComplete: finalIsComplete,
        sessions: finalSessions,
        sessionsNeeded: Math.max(0, 3 - finalSessions),
        progress: `${finalSessions}/3`,
        percentage: Math.min((finalSessions / 3) * 100, 100),
        
        // All prerequisite info
        t1Complete: progressData.t1Complete,
        t1Sessions: progressData.t1Sessions,
        t2Complete: progressData.t2Complete,
        t2Sessions: progressData.t2Sessions,
        t3Complete: progressData.t3Complete,
        t3Sessions: progressData.t3Sessions,
        t4Complete: progressData.t4Complete,
        t4Sessions: progressData.t4Sessions,
        canPractice: progressData.canPracticeT5,
        prerequisitesMet: progressData.prerequisitesMet,
        missingPrerequisites: progressData.missingPrerequisites,
        
        // Stage completion status
        stageOneComplete: finalIsComplete,
        physicalReadinessComplete: finalIsComplete,
        readyForStageTwo: finalIsComplete,
        
        dataSource: userContextComplete !== null ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error checking T5 completion:', error);
      return {
        isComplete: false,
        sessions: 0,
        sessionsNeeded: 3,
        progress: '0/3',
        percentage: 0,
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        t3Complete: false,
        t3Sessions: 0,
        t4Complete: false,
        t4Sessions: 0,
        canPractice: false,
        prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2', 'T3', 'T4'],
        stageOneComplete: false,
        physicalReadinessComplete: false,
        readyForStageTwo: false,
        dataSource: 'fallback'
      };
    }
  }, [getT5ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Get comprehensive current progress
  const getCurrentProgress = useCallback(async () => {
    try {
      const completionData = await checkT5Complete();
      const historyData = await getT5SessionHistory();
      
      return {
        ...completionData,
        history: historyData,
        nextSessionNumber: completionData.sessions + 1,
        canPractice: completionData.canPractice && (!completionData.isComplete || completionData.sessions < 10),
        practiceMessage: !completionData.prerequisitesMet
          ? `Complete ${completionData.missingPrerequisites.join(', ')} first.`
          : completionData.isComplete 
            ? `T5 Complete! Physical Readiness achieved. Ready for Stage 2.`
            : `${completionData.sessionsNeeded} more T5 sessions needed to complete Physical Readiness.`,
        nextLevel: completionData.isComplete ? 'Stage 2' : 'T5',
        prerequisitesMet: completionData.prerequisitesMet,
        // ✅ Ensure these properties are always available
        t1Complete: completionData.t1Complete,
        t1Sessions: completionData.t1Sessions,
        t2Complete: completionData.t2Complete,
        t2Sessions: completionData.t2Sessions,
        t3Complete: completionData.t3Complete,
        t3Sessions: completionData.t3Sessions,
        t4Complete: completionData.t4Complete,
        t4Sessions: completionData.t4Sessions,
        // ✅ Stage completion properties
        stageOneComplete: completionData.stageOneComplete,
        physicalReadinessComplete: completionData.physicalReadinessComplete,
        readyForStageTwo: completionData.readyForStageTwo
      };
    } catch (error) {
      console.error('Error getting current progress:', error);
      return {
        isComplete: false,
        sessions: 0,
        sessionsNeeded: 3,
        progress: '0/3',
        percentage: 0,
        canPractice: false,
        practiceMessage: 'Complete T1, T2, T3, and T4 first to unlock T5 practice.',
        nextLevel: 'T5',
        prerequisitesMet: false,
        // ✅ Ensure these properties are always available
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        t3Complete: false,
        t3Sessions: 0,
        t4Complete: false,
        t4Sessions: 0,
        stageOneComplete: false,
        physicalReadinessComplete: false,
        readyForStageTwo: false,
        dataSource: 'fallback'
      };
    }
  }, [checkT5Complete, getT5SessionHistory]);

  // ✅ ENHANCED: Validate T1, T2, T3, and T4 prerequisites
  const validatePrerequisites = useCallback(async () => {
    try {
      const progress = getT5ProgressFromStats();
      return {
        t1Complete: progress.t1Complete,
        t1Sessions: progress.t1Sessions,
        t2Complete: progress.t2Complete,
        t2Sessions: progress.t2Sessions,
        t3Complete: progress.t3Complete,
        t3Sessions: progress.t3Sessions,
        t4Complete: progress.t4Complete,
        t4Sessions: progress.t4Sessions,
        prerequisitesMet: progress.prerequisitesMet,
        missingPrerequisites: progress.missingPrerequisites,
        canPracticeT5: progress.canPracticeT5,
        message: progress.prerequisitesMet 
          ? `✅ Prerequisites Complete. T1 (${progress.t1Sessions}/3), T2 (${progress.t2Sessions}/3), T3 (${progress.t3Sessions}/3), T4 (${progress.t4Sessions}/3). Ready for T5.`
          : `❌ Prerequisites Incomplete. Missing: ${progress.missingPrerequisites.join(', ')}. T1 (${progress.t1Sessions}/3), T2 (${progress.t2Sessions}/3), T3 (${progress.t3Sessions}/3), T4 (${progress.t4Sessions}/3).`
      };
    } catch (error) {
      console.error('Error validating prerequisites:', error);
      return {
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        t3Complete: false,
        t3Sessions: 0,
        t4Complete: false,
        t4Sessions: 0,
        prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2', 'T3', 'T4'],
        canPracticeT5: false,
        message: '❌ Unable to validate prerequisites. Complete T1, T2, T3, and T4 first.'
      };
    }
  }, [getT5ProgressFromStats]);

  // ✅ ENHANCED: Expose comprehensive methods to parent component
  useImperativeHandle(ref, () => ({
    // Primary methods
    recordSession: recordT5Session,
    getT5SessionHistory,
    isT5Complete: checkT5Complete, // Updated name to avoid confusion
    getCurrentProgress,
    
    // ✅ T5-specific methods
    validatePrerequisites,
    getProgressFromStats: getT5ProgressFromStats,
    
    // ✅ Validation methods
    validateProgress: async () => {
      const statsData = getT5ProgressFromStats();
      const userContextData = await getT5SessionHistory();
      return {
        statsData,
        userContextData,
        isConsistent: statsData.t5Sessions === userContextData.totalSessions,
        prerequisiteCheck: await validatePrerequisites()
      };
    },
    
    // ✅ Utility methods
    canPracticeT5: async () => {
      const progress = await getCurrentProgress();
      return progress.canPractice;
    },
    
    getT5Summary: async () => {
      const progress = await getCurrentProgress();
      return {
        status: progress.isComplete ? 'Complete' : 'In Progress',
        sessions: `${progress.sessions}/3`,
        percentage: `${Math.round(progress.percentage)}%`,
        nextAction: progress.isComplete ? 'Advance to Stage 2' : 'Practice T5',
        prerequisitesMet: progress.prerequisitesMet,
        t1Status: progress.t1Complete ? 'Complete' : 'Incomplete',
        t2Status: progress.t2Complete ? 'Complete' : 'Incomplete',
        t3Status: progress.t3Complete ? 'Complete' : 'Incomplete',
        t4Status: progress.t4Complete ? 'Complete' : 'Incomplete',
        stageOneComplete: progress.stageOneComplete,
        physicalReadinessComplete: progress.physicalReadinessComplete
      };
    },

    // ✅ Complete foundation and stage status
    getOverallProgress: async () => {
      const t5Progress = await getCurrentProgress();
      return {
        t1: {
          sessions: t5Progress.t1Sessions,
          complete: t5Progress.t1Complete
        },
        t2: {
          sessions: t5Progress.t2Sessions,
          complete: t5Progress.t2Complete
        },
        t3: {
          sessions: t5Progress.t3Sessions,
          complete: t5Progress.t3Complete
        },
        t4: {
          sessions: t5Progress.t4Sessions,
          complete: t5Progress.t4Complete
        },
        t5: {
          sessions: t5Progress.sessions,
          complete: t5Progress.isComplete,
          canPractice: t5Progress.canPractice
        },
        prerequisitesMet: t5Progress.prerequisitesMet,
        stageOneComplete: t5Progress.stageOneComplete,
        physicalReadinessComplete: t5Progress.physicalReadinessComplete,
        readyForStageTwo: t5Progress.readyForStageTwo,
        foundationTime: (t5Progress.t1Sessions * 10) + (t5Progress.t2Sessions * 15) + (t5Progress.t3Sessions * 20) + (t5Progress.t4Sessions * 25) + (t5Progress.sessions * 30)
      };
    },

    // ✅ Complete foundation and stage analysis
    getFoundationSummary: async () => {
      const progress = await getCurrentProgress();
      return {
        t1Time: progress.t1Sessions * 10, // minutes
        t2Time: progress.t2Sessions * 15, // minutes
        t3Time: progress.t3Sessions * 20, // minutes
        t4Time: progress.t4Sessions * 25, // minutes
        t5Time: progress.sessions * 30,   // minutes
        totalTime: (progress.t1Sessions * 10) + (progress.t2Sessions * 15) + (progress.t3Sessions * 20) + (progress.t4Sessions * 25) + (progress.sessions * 30),
        totalSessions: progress.t1Sessions + progress.t2Sessions + progress.t3Sessions + progress.t4Sessions + progress.sessions,
        foundationComplete: progress.t1Complete && progress.t2Complete && progress.t3Complete && progress.t4Complete,
        stageOneComplete: progress.stageOneComplete,
        physicalReadinessComplete: progress.physicalReadinessComplete,
        currentLevel: progress.isComplete ? 'Stage 1 Complete - Physical Readiness Achieved' : progress.prerequisitesMet ? 'T5 In Progress' : 'Prerequisites Needed',
        readyForStageTwo: progress.readyForStageTwo,
        achievement: progress.isComplete ? 'Physical Readiness Master' : 'In Training'
      };
    },

    // ✅ Stage completion checker
    checkStageOneCompletion: async () => {
      const progress = await getCurrentProgress();
      return {
        isComplete: progress.stageOneComplete,
        physicalReadinessAchieved: progress.physicalReadinessComplete,
        readyForAdvancement: progress.readyForStageTwo,
        completionMessage: progress.stageOneComplete 
          ? '🎉 Congratulations! You have achieved complete Physical Readiness and are ready to advance to Stage 2!' 
          : `Continue T5 practice to achieve Physical Readiness. ${progress.sessionsNeeded} more sessions needed.`
      };
    }
  }), [
    recordT5Session, 
    getT5SessionHistory, 
    checkT5Complete, 
    getCurrentProgress, 
    validatePrerequisites,
    getT5ProgressFromStats
  ]);

  // This component doesn't render anything visible
  return null;
});

T5PracticeRecorder.displayName = 'T5PracticeRecorder';

export default T5PracticeRecorder;