// ✅ ENHANCED T3PracticeRecorder.tsx - PHASE 3 FIREBASE INTEGRATION
// File: src/T3PracticeRecorder.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Error handling and fallback mechanisms
// ✅ ENHANCED: Real-time progress tracking
// ✅ ENHANCED: Session validation and sanitization
// ✅ ENHANCED: T1 and T2 prerequisite validation

import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T3PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T3PracticeRecorder - Handles recording of T3 practice sessions
 * 
 * ✅ FIREBASE-ONLY: Integrates with PracticeContext, UserContext, and AuthContext
 * ✅ ENHANCED: Phase 3 compliant with proper error handling and validation
 * ✅ ENHANCED: T1 and T2 prerequisite checking and T3 progression tracking
 */
const T3PracticeRecorder = forwardRef<any, T3PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
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

  // ✅ ENHANCED: Calculate T1, T2, and T3 progress using available data
  const getT3ProgressFromStats = useCallback(() => {
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
      
      // Count T3 sessions
      const t3Sessions = allSessions.filter(session => 
        session.tLevel === 'T3' || 
        session.level === 't3' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 17 && session.duration <= 22)
      ).length;
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const isT3Complete = t3Sessions >= 3;
      const canPracticeT3 = isT1Complete && isT2Complete;
      
      return {
        // T1 Data (first prerequisite)
        t1Sessions,
        t1Complete: isT1Complete,
        
        // T2 Data (second prerequisite)
        t2Sessions,
        t2Complete: isT2Complete,
        
        // T3 Data
        t3Sessions,
        t3Complete: isT3Complete,
        t3Progress: `${t3Sessions}/3`,
        t3Percentage: Math.min((t3Sessions / 3) * 100, 100),
        sessionsNeeded: Math.max(0, 3 - t3Sessions),
        
        // Access
        canPracticeT3,
        prerequisitesMet: isT1Complete && isT2Complete,
        missingPrerequisites: [
          ...(isT1Complete ? [] : ['T1']),
          ...(isT2Complete ? [] : ['T2'])
        ]
      };
    } catch (error) {
      console.error('Error calculating T3 progress from stats:', error);
      return {
        t1Sessions: 0, t1Complete: false,
        t2Sessions: 0, t2Complete: false,
        t3Sessions: 0, t3Complete: false, t3Progress: '0/3', t3Percentage: 0,
        sessionsNeeded: 3, canPracticeT3: false, prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2']
      };
    }
  }, [sessions]);

  // ✅ ENHANCED: Record session with comprehensive validation and dual context integration
  const recordT3Session = useCallback(async (
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

      // Check T1 and T2 prerequisites
      const currentProgress = getT3ProgressFromStats();
      if (!currentProgress.prerequisitesMet) {
        const missing = currentProgress.missingPrerequisites.join(' and ');
        throw new Error(
          `T3 prerequisites not met. Complete ${missing} first. ` +
          `Progress: T1 (${currentProgress.t1Sessions}/3), T2 (${currentProgress.t2Sessions}/3).`
        );
      }

      console.log('🎯 Recording T3 session:', {
        duration,
        timeSpent,
        isCompleted,
        user: currentUser.uid,
        t1Complete: currentProgress.t1Complete,
        t2Complete: currentProgress.t2Complete,
        currentT3Sessions: currentProgress.t3Sessions
      });

      // ✅ Get current progress before recording
      console.log('📊 Current T3 progress:', currentProgress);

      // ✅ Try to increment UserContext session count (if method exists)
      let newT3SessionCount = currentProgress.t3Sessions + 1;
      try {
        const result = await safeUserContextCall('incrementT3Sessions', newT3SessionCount);
        if (typeof result === 'number') {
          newT3SessionCount = result;
          console.log(`📊 UserContext T3 Sessions: ${newT3SessionCount-1} → ${newT3SessionCount}`);
        }
      } catch (error) {
        console.warn('⚠️ UserContext T3 increment failed, continuing with PracticeContext only:', error);
      }

      // ✅ Create comprehensive session data with proper structure
      const sessionData = {
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        duration: timeSpent, // Actual practice time in minutes
        sessionType: 'meditation' as const,
        stageLevel: 1, // T3 is part of Stage 1
        stageLabel: 'T3: Deepening Stillness',
        tLevel: 'T3', // ✅ CRITICAL: T-level identifier
        level: 't3',  // ✅ CRITICAL: Lowercase T-level identifier
        rating: isCompleted ? 7 : 5, // T3 maintains good rating for deeper practice
        notes: `T3 deepening stillness training (${timeSpent} minutes)`,
        presentPercentage: isCompleted ? 75 : 60, // T3 may have slightly lower initial presence as duration increases
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
          tLevel: 'T3',
          isCompleted: isCompleted,
          targetDuration: duration,
          actualDuration: timeSpent,
          sessionCount: newT3SessionCount,
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          t2Complete: currentProgress.t2Complete,
          t2Sessions: currentProgress.t2Sessions,
          recordedAt: new Date().toISOString(),
          source: 'T3PracticeRecorder'
        }
      };

      // ✅ Save detailed session to PracticeContext for history
      await addPracticeSession(sessionData);
      console.log('✅ Session saved to PracticeContext');

      // ✅ Try to update UserContext profile (if method exists)
      if (isCompleted) {
        try {
          await safeUserContextCall('updateT3Progress', null, {
            sessionsCompleted: newT3SessionCount,
            lastCompletedAt: new Date().toISOString(),
            isT3Complete: newT3SessionCount >= 3
          });
        } catch (error) {
          console.warn('⚠️ UserContext profile update failed:', error);
        }
      }

      // ✅ Create response data with legacy compatibility
      const responseData = {
        ...sessionData,
        // ✅ Add legacy fields for backward compatibility
        level: 't3',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        currentProgress: {
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          t2Complete: currentProgress.t2Complete,
          t2Sessions: currentProgress.t2Sessions,
          t3Sessions: newT3SessionCount,
          t3Complete: newT3SessionCount >= 3,
          t3Progress: `${newT3SessionCount}/3`,
          t3Percentage: Math.min((newT3SessionCount / 3) * 100, 100),
          sessionsNeeded: Math.max(0, 3 - newT3SessionCount),
          prerequisitesMet: true // Always true if we reach this point
        }
      };

      // ✅ Notify parent component
      onRecordSession(responseData);
      
      console.log('✅ T3 session recorded successfully', {
        duration: timeSpent,
        completed: isCompleted,
        sessionCount: newT3SessionCount,
        sessionId: sessionData.timestamp,
        isT3Complete: newT3SessionCount >= 3,
        nextLevel: newT3SessionCount >= 3 ? 'T4' : 'Continue T3'
      });

      return responseData;

    } catch (error) {
      console.error('❌ Error recording T3 session:', error);
      
      // ✅ Enhanced fallback notification to parent
      const fallbackSessionData = {
        level: 't3',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: `Failed to save to Firebase: ${(error as Error).message}`,
        currentProgress: getT3ProgressFromStats() // Still provide current progress
      };
      
      onRecordSession(fallbackSessionData);
      throw error;
    }
  }, [currentUser, addPracticeSession, onRecordSession, safeUserContextCall, getT3ProgressFromStats]);

  // ✅ ENHANCED: Get T3 session history using available methods
  const getT3SessionHistory = useCallback(async () => {
    try {
      // Try UserContext first, fallback to PracticeContext calculation
      const progressFromStats = getT3ProgressFromStats();
      
      let userContextData = null;
      try {
        const sessionCount = await safeUserContextCall('getT3Sessions', 0);
        const complete = await safeUserContextCall('isT3Complete', false);
        userContextData = {
          totalSessions: sessionCount,
          isComplete: complete,
          progress: `${sessionCount}/3`
        };
      } catch (error) {
        console.warn('⚠️ UserContext T3 methods not available:', error);
      }

      // Use UserContext data if available, otherwise use calculated data
      const finalData = userContextData || {
        totalSessions: progressFromStats.t3Sessions,
        isComplete: progressFromStats.t3Complete,
        progress: progressFromStats.t3Progress
      };
      
      console.log(`📊 T3 session history: ${finalData.totalSessions} sessions completed`);
      
      return {
        ...finalData,
        t1Complete: progressFromStats.t1Complete,
        t1Sessions: progressFromStats.t1Sessions,
        t2Complete: progressFromStats.t2Complete,
        t2Sessions: progressFromStats.t2Sessions,
        canPractice: progressFromStats.canPracticeT3,
        prerequisitesMet: progressFromStats.prerequisitesMet,
        source: userContextData ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error getting T3 session history:', error);
      return {
        totalSessions: 0,
        isComplete: false,
        progress: '0/3 sessions',
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        canPractice: false,
        prerequisitesMet: false,
        source: 'fallback'
      };
    }
  }, [getT3ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Check T3 completion status with comprehensive data
  const checkT3Complete = useCallback(async () => {
    try {
      const progressData = getT3ProgressFromStats();
      
      // Try to get UserContext data as well
      let userContextComplete = null;
      let userContextSessions = null;
      
      try {
        userContextComplete = await safeUserContextCall('isT3Complete', null);
        userContextSessions = await safeUserContextCall('getT3Sessions', null);
      } catch (error) {
        console.warn('⚠️ UserContext T3 completion check failed:', error);
      }

      const finalIsComplete = userContextComplete !== null ? userContextComplete : progressData.t3Complete;
      const finalSessions = userContextSessions !== null ? userContextSessions : progressData.t3Sessions;
      
      console.log(`📊 T3 completion status: ${finalIsComplete} (${finalSessions}/3 sessions)`);
      
      return {
        isComplete: finalIsComplete,
        sessions: finalSessions,
        sessionsNeeded: Math.max(0, 3 - finalSessions),
        progress: `${finalSessions}/3`,
        percentage: Math.min((finalSessions / 3) * 100, 100),
        
        // T1 and T2 prerequisite info
        t1Complete: progressData.t1Complete,
        t1Sessions: progressData.t1Sessions,
        t2Complete: progressData.t2Complete,
        t2Sessions: progressData.t2Sessions,
        canPractice: progressData.canPracticeT3,
        prerequisitesMet: progressData.prerequisitesMet,
        missingPrerequisites: progressData.missingPrerequisites,
        
        dataSource: userContextComplete !== null ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error checking T3 completion:', error);
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
        canPractice: false,
        prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2'],
        dataSource: 'fallback'
      };
    }
  }, [getT3ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Get comprehensive current progress
  const getCurrentProgress = useCallback(async () => {
    try {
      const completionData = await checkT3Complete();
      const historyData = await getT3SessionHistory();
      
      return {
        ...completionData,
        history: historyData,
        nextSessionNumber: completionData.sessions + 1,
        canPractice: completionData.canPractice && (!completionData.isComplete || completionData.sessions < 10),
        practiceMessage: !completionData.prerequisitesMet
          ? `Complete ${completionData.missingPrerequisites.join(' and ')} first.`
          : completionData.isComplete 
            ? `T3 Complete! ${completionData.sessions} sessions completed. Ready for T4.`
            : `${completionData.sessionsNeeded} more T3 sessions needed to complete T3.`,
        nextLevel: completionData.isComplete ? 'T4' : 'T3',
        prerequisitesMet: completionData.prerequisitesMet,
        // ✅ Ensure these properties are always available
        t1Complete: completionData.t1Complete,
        t1Sessions: completionData.t1Sessions,
        t2Complete: completionData.t2Complete,
        t2Sessions: completionData.t2Sessions
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
        practiceMessage: 'Complete T1 and T2 first to unlock T3 practice.',
        nextLevel: 'T3',
        prerequisitesMet: false,
        // ✅ Ensure these properties are always available
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        dataSource: 'fallback'
      };
    }
  }, [checkT3Complete, getT3SessionHistory]);

  // ✅ ENHANCED: Validate T1 and T2 prerequisites
  const validatePrerequisites = useCallback(async () => {
    try {
      const progress = getT3ProgressFromStats();
      return {
        t1Complete: progress.t1Complete,
        t1Sessions: progress.t1Sessions,
        t2Complete: progress.t2Complete,
        t2Sessions: progress.t2Sessions,
        prerequisitesMet: progress.prerequisitesMet,
        missingPrerequisites: progress.missingPrerequisites,
        canPracticeT3: progress.canPracticeT3,
        message: progress.prerequisitesMet 
          ? `✅ Prerequisites Complete. T1 (${progress.t1Sessions}/3), T2 (${progress.t2Sessions}/3). Ready for T3.`
          : `❌ Prerequisites Incomplete. Missing: ${progress.missingPrerequisites.join(' and ')}. T1 (${progress.t1Sessions}/3), T2 (${progress.t2Sessions}/3).`
      };
    } catch (error) {
      console.error('Error validating prerequisites:', error);
      return {
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2'],
        canPracticeT3: false,
        message: '❌ Unable to validate prerequisites. Complete T1 and T2 first.'
      };
    }
  }, [getT3ProgressFromStats]);

  // ✅ ENHANCED: Expose comprehensive methods to parent component
  useImperativeHandle(ref, () => ({
    // Primary methods
    recordSession: recordT3Session,
    getT3SessionHistory,
    isT3Complete: checkT3Complete, // Updated name to avoid confusion
    getCurrentProgress,
    
    // ✅ T3-specific methods
    validatePrerequisites,
    getProgressFromStats: getT3ProgressFromStats,
    
    // ✅ Validation methods
    validateProgress: async () => {
      const statsData = getT3ProgressFromStats();
      const userContextData = await getT3SessionHistory();
      return {
        statsData,
        userContextData,
        isConsistent: statsData.t3Sessions === userContextData.totalSessions,
        prerequisiteCheck: await validatePrerequisites()
      };
    },
    
    // ✅ Utility methods
    canPracticeT3: async () => {
      const progress = await getCurrentProgress();
      return progress.canPractice;
    },
    
    getT3Summary: async () => {
      const progress = await getCurrentProgress();
      return {
        status: progress.isComplete ? 'Complete' : 'In Progress',
        sessions: `${progress.sessions}/3`,
        percentage: `${Math.round(progress.percentage)}%`,
        nextAction: progress.isComplete ? 'Continue to T4' : 'Practice T3',
        prerequisitesMet: progress.prerequisitesMet,
        t1Status: progress.t1Complete ? 'Complete' : 'Incomplete',
        t2Status: progress.t2Complete ? 'Complete' : 'Incomplete'
      };
    },

    // ✅ T1/T2/T3 combined status
    getOverallProgress: async () => {
      const t3Progress = await getCurrentProgress();
      return {
        t1: {
          sessions: t3Progress.t1Sessions,
          complete: t3Progress.t1Complete
        },
        t2: {
          sessions: t3Progress.t2Sessions,
          complete: t3Progress.t2Complete
        },
        t3: {
          sessions: t3Progress.sessions,
          complete: t3Progress.isComplete,
          canPractice: t3Progress.canPractice
        },
        prerequisitesMet: t3Progress.prerequisitesMet,
        readyForT4: t3Progress.isComplete,
        foundationTime: (t3Progress.t1Sessions * 10) + (t3Progress.t2Sessions * 15) + (t3Progress.sessions * 20)
      };
    },

    // ✅ Foundation summary
    getFoundationSummary: async () => {
      const progress = await getCurrentProgress();
      return {
        t1Time: progress.t1Sessions * 10, // minutes
        t2Time: progress.t2Sessions * 15, // minutes
        t3Time: progress.sessions * 20,   // minutes
        totalTime: (progress.t1Sessions * 10) + (progress.t2Sessions * 15) + (progress.sessions * 20),
        totalSessions: progress.t1Sessions + progress.t2Sessions + progress.sessions,
        foundationComplete: progress.t1Complete && progress.t2Complete,
        currentLevel: progress.isComplete ? 'T3 Complete' : progress.prerequisitesMet ? 'T3 In Progress' : 'Prerequisites Needed'
      };
    }
  }), [
    recordT3Session, 
    getT3SessionHistory, 
    checkT3Complete, 
    getCurrentProgress, 
    validatePrerequisites,
    getT3ProgressFromStats
  ]);

  // This component doesn't render anything visible
  return null;
});

T3PracticeRecorder.displayName = 'T3PracticeRecorder';

export default T3PracticeRecorder;