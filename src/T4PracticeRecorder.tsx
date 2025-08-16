// ✅ ENHANCED T4PracticeRecorder.tsx - PHASE 3 FIREBASE INTEGRATION
// File: src/T4PracticeRecorder.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Error handling and fallback mechanisms
// ✅ ENHANCED: Real-time progress tracking
// ✅ ENHANCED: Session validation and sanitization
// ✅ ENHANCED: T1, T2, and T3 prerequisite validation

import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T4PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T4PracticeRecorder - Handles recording of T4 practice sessions
 * 
 * ✅ FIREBASE-ONLY: Integrates with PracticeContext, UserContext, and AuthContext
 * ✅ ENHANCED: Phase 3 compliant with proper error handling and validation
 * ✅ ENHANCED: T1, T2, and T3 prerequisite checking and T4 progression tracking
 */
const T4PracticeRecorder = forwardRef<any, T4PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
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

  // ✅ ENHANCED: Calculate T1, T2, T3, and T4 progress using available data
  const getT4ProgressFromStats = useCallback(() => {
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
      
      // Count T4 sessions
      const t4Sessions = allSessions.filter(session => 
        session.tLevel === 'T4' || 
        session.level === 't4' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 22 && session.duration <= 27)
      ).length;
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const isT3Complete = t3Sessions >= 3;
      const isT4Complete = t4Sessions >= 3;
      const canPracticeT4 = isT1Complete && isT2Complete && isT3Complete;
      
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
        
        // T4 Data
        t4Sessions,
        t4Complete: isT4Complete,
        t4Progress: `${t4Sessions}/3`,
        t4Percentage: Math.min((t4Sessions / 3) * 100, 100),
        sessionsNeeded: Math.max(0, 3 - t4Sessions),
        
        // Access
        canPracticeT4,
        prerequisitesMet: isT1Complete && isT2Complete && isT3Complete,
        missingPrerequisites: [
          ...(isT1Complete ? [] : ['T1']),
          ...(isT2Complete ? [] : ['T2']),
          ...(isT3Complete ? [] : ['T3'])
        ]
      };
    } catch (error) {
      console.error('Error calculating T4 progress from stats:', error);
      return {
        t1Sessions: 0, t1Complete: false,
        t2Sessions: 0, t2Complete: false,
        t3Sessions: 0, t3Complete: false,
        t4Sessions: 0, t4Complete: false, t4Progress: '0/3', t4Percentage: 0,
        sessionsNeeded: 3, canPracticeT4: false, prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2', 'T3']
      };
    }
  }, [sessions]);

  // ✅ ENHANCED: Record session with comprehensive validation and dual context integration
  const recordT4Session = useCallback(async (
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

      // Check T1, T2, and T3 prerequisites
      const currentProgress = getT4ProgressFromStats();
      if (!currentProgress.prerequisitesMet) {
        const missing = currentProgress.missingPrerequisites.join(', ');
        throw new Error(
          `T4 prerequisites not met. Complete ${missing} first. ` +
          `Progress: T1 (${currentProgress.t1Sessions}/3), T2 (${currentProgress.t2Sessions}/3), T3 (${currentProgress.t3Sessions}/3).`
        );
      }

      console.log('🎯 Recording T4 session:', {
        duration,
        timeSpent,
        isCompleted,
        user: currentUser.uid,
        t1Complete: currentProgress.t1Complete,
        t2Complete: currentProgress.t2Complete,
        t3Complete: currentProgress.t3Complete,
        currentT4Sessions: currentProgress.t4Sessions
      });

      // ✅ Get current progress before recording
      console.log('📊 Current T4 progress:', currentProgress);

      // ✅ Try to increment UserContext session count (if method exists)
      let newT4SessionCount = currentProgress.t4Sessions + 1;
      try {
        const result = await safeUserContextCall('incrementT4Sessions', newT4SessionCount);
        if (typeof result === 'number') {
          newT4SessionCount = result;
          console.log(`📊 UserContext T4 Sessions: ${newT4SessionCount-1} → ${newT4SessionCount}`);
        }
      } catch (error) {
        console.warn('⚠️ UserContext T4 increment failed, continuing with PracticeContext only:', error);
      }

      // ✅ Create comprehensive session data with proper structure
      const sessionData = {
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        duration: timeSpent, // Actual practice time in minutes
        sessionType: 'meditation' as const,
        stageLevel: 1, // T4 is part of Stage 1
        stageLabel: 'T4: Extended Stillness',
        tLevel: 'T4', // ✅ CRITICAL: T-level identifier
        level: 't4',  // ✅ CRITICAL: Lowercase T-level identifier
        rating: isCompleted ? 8 : 6, // T4 maintains high rating for advanced practice
        notes: `T4 extended stillness training (${timeSpent} minutes)`,
        presentPercentage: isCompleted ? 70 : 55, // T4 may have lower initial presence as duration increases significantly
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
          tLevel: 'T4',
          isCompleted: isCompleted,
          targetDuration: duration,
          actualDuration: timeSpent,
          sessionCount: newT4SessionCount,
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          t2Complete: currentProgress.t2Complete,
          t2Sessions: currentProgress.t2Sessions,
          t3Complete: currentProgress.t3Complete,
          t3Sessions: currentProgress.t3Sessions,
          recordedAt: new Date().toISOString(),
          source: 'T4PracticeRecorder'
        }
      };

      // ✅ Save detailed session to PracticeContext for history
      await addPracticeSession(sessionData);
      console.log('✅ Session saved to PracticeContext');

      // ✅ Try to update UserContext profile (if method exists)
      if (isCompleted) {
        try {
          await safeUserContextCall('updateT4Progress', null, {
            sessionsCompleted: newT4SessionCount,
            lastCompletedAt: new Date().toISOString(),
            isT4Complete: newT4SessionCount >= 3
          });
        } catch (error) {
          console.warn('⚠️ UserContext profile update failed:', error);
        }
      }

      // ✅ Create response data with legacy compatibility
      const responseData = {
        ...sessionData,
        // ✅ Add legacy fields for backward compatibility
        level: 't4',
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
          t4Sessions: newT4SessionCount,
          t4Complete: newT4SessionCount >= 3,
          t4Progress: `${newT4SessionCount}/3`,
          t4Percentage: Math.min((newT4SessionCount / 3) * 100, 100),
          sessionsNeeded: Math.max(0, 3 - newT4SessionCount),
          prerequisitesMet: true // Always true if we reach this point
        }
      };

      // ✅ Notify parent component
      onRecordSession(responseData);
      
      console.log('✅ T4 session recorded successfully', {
        duration: timeSpent,
        completed: isCompleted,
        sessionCount: newT4SessionCount,
        sessionId: sessionData.timestamp,
        isT4Complete: newT4SessionCount >= 3,
        nextLevel: newT4SessionCount >= 3 ? 'T5' : 'Continue T4'
      });

      return responseData;

    } catch (error) {
      console.error('❌ Error recording T4 session:', error);
      
      // ✅ Enhanced fallback notification to parent
      const fallbackSessionData = {
        level: 't4',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: `Failed to save to Firebase: ${(error as Error).message}`,
        currentProgress: getT4ProgressFromStats() // Still provide current progress
      };
      
      onRecordSession(fallbackSessionData);
      throw error;
    }
  }, [currentUser, addPracticeSession, onRecordSession, safeUserContextCall, getT4ProgressFromStats]);

  // ✅ ENHANCED: Get T4 session history using available methods
  const getT4SessionHistory = useCallback(async () => {
    try {
      // Try UserContext first, fallback to PracticeContext calculation
      const progressFromStats = getT4ProgressFromStats();
      
      let userContextData = null;
      try {
        const sessionCount = await safeUserContextCall('getT4Sessions', 0);
        const complete = await safeUserContextCall('isT4Complete', false);
        userContextData = {
          totalSessions: sessionCount,
          isComplete: complete,
          progress: `${sessionCount}/3`
        };
      } catch (error) {
        console.warn('⚠️ UserContext T4 methods not available:', error);
      }

      // Use UserContext data if available, otherwise use calculated data
      const finalData = userContextData || {
        totalSessions: progressFromStats.t4Sessions,
        isComplete: progressFromStats.t4Complete,
        progress: progressFromStats.t4Progress
      };
      
      console.log(`📊 T4 session history: ${finalData.totalSessions} sessions completed`);
      
      return {
        ...finalData,
        t1Complete: progressFromStats.t1Complete,
        t1Sessions: progressFromStats.t1Sessions,
        t2Complete: progressFromStats.t2Complete,
        t2Sessions: progressFromStats.t2Sessions,
        t3Complete: progressFromStats.t3Complete,
        t3Sessions: progressFromStats.t3Sessions,
        canPractice: progressFromStats.canPracticeT4,
        prerequisitesMet: progressFromStats.prerequisitesMet,
        source: userContextData ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error getting T4 session history:', error);
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
        canPractice: false,
        prerequisitesMet: false,
        source: 'fallback'
      };
    }
  }, [getT4ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Check T4 completion status with comprehensive data
  const checkT4Complete = useCallback(async () => {
    try {
      const progressData = getT4ProgressFromStats();
      
      // Try to get UserContext data as well
      let userContextComplete = null;
      let userContextSessions = null;
      
      try {
        userContextComplete = await safeUserContextCall('isT4Complete', null);
        userContextSessions = await safeUserContextCall('getT4Sessions', null);
      } catch (error) {
        console.warn('⚠️ UserContext T4 completion check failed:', error);
      }

      const finalIsComplete = userContextComplete !== null ? userContextComplete : progressData.t4Complete;
      const finalSessions = userContextSessions !== null ? userContextSessions : progressData.t4Sessions;
      
      console.log(`📊 T4 completion status: ${finalIsComplete} (${finalSessions}/3 sessions)`);
      
      return {
        isComplete: finalIsComplete,
        sessions: finalSessions,
        sessionsNeeded: Math.max(0, 3 - finalSessions),
        progress: `${finalSessions}/3`,
        percentage: Math.min((finalSessions / 3) * 100, 100),
        
        // T1, T2, and T3 prerequisite info
        t1Complete: progressData.t1Complete,
        t1Sessions: progressData.t1Sessions,
        t2Complete: progressData.t2Complete,
        t2Sessions: progressData.t2Sessions,
        t3Complete: progressData.t3Complete,
        t3Sessions: progressData.t3Sessions,
        canPractice: progressData.canPracticeT4,
        prerequisitesMet: progressData.prerequisitesMet,
        missingPrerequisites: progressData.missingPrerequisites,
        
        dataSource: userContextComplete !== null ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error checking T4 completion:', error);
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
        canPractice: false,
        prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2', 'T3'],
        dataSource: 'fallback'
      };
    }
  }, [getT4ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Get comprehensive current progress
  const getCurrentProgress = useCallback(async () => {
    try {
      const completionData = await checkT4Complete();
      const historyData = await getT4SessionHistory();
      
      return {
        ...completionData,
        history: historyData,
        nextSessionNumber: completionData.sessions + 1,
        canPractice: completionData.canPractice && (!completionData.isComplete || completionData.sessions < 10),
        practiceMessage: !completionData.prerequisitesMet
          ? `Complete ${completionData.missingPrerequisites.join(', ')} first.`
          : completionData.isComplete 
            ? `T4 Complete! ${completionData.sessions} sessions completed. Ready for T5.`
            : `${completionData.sessionsNeeded} more T4 sessions needed to complete T4.`,
        nextLevel: completionData.isComplete ? 'T5' : 'T4',
        prerequisitesMet: completionData.prerequisitesMet,
        // ✅ Ensure these properties are always available
        t1Complete: completionData.t1Complete,
        t1Sessions: completionData.t1Sessions,
        t2Complete: completionData.t2Complete,
        t2Sessions: completionData.t2Sessions,
        t3Complete: completionData.t3Complete,
        t3Sessions: completionData.t3Sessions
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
        practiceMessage: 'Complete T1, T2, and T3 first to unlock T4 practice.',
        nextLevel: 'T4',
        prerequisitesMet: false,
        // ✅ Ensure these properties are always available
        t1Complete: false,
        t1Sessions: 0,
        t2Complete: false,
        t2Sessions: 0,
        t3Complete: false,
        t3Sessions: 0,
        dataSource: 'fallback'
      };
    }
  }, [checkT4Complete, getT4SessionHistory]);

  // ✅ ENHANCED: Validate T1, T2, and T3 prerequisites
  const validatePrerequisites = useCallback(async () => {
    try {
      const progress = getT4ProgressFromStats();
      return {
        t1Complete: progress.t1Complete,
        t1Sessions: progress.t1Sessions,
        t2Complete: progress.t2Complete,
        t2Sessions: progress.t2Sessions,
        t3Complete: progress.t3Complete,
        t3Sessions: progress.t3Sessions,
        prerequisitesMet: progress.prerequisitesMet,
        missingPrerequisites: progress.missingPrerequisites,
        canPracticeT4: progress.canPracticeT4,
        message: progress.prerequisitesMet 
          ? `✅ Prerequisites Complete. T1 (${progress.t1Sessions}/3), T2 (${progress.t2Sessions}/3), T3 (${progress.t3Sessions}/3). Ready for T4.`
          : `❌ Prerequisites Incomplete. Missing: ${progress.missingPrerequisites.join(', ')}. T1 (${progress.t1Sessions}/3), T2 (${progress.t2Sessions}/3), T3 (${progress.t3Sessions}/3).`
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
        prerequisitesMet: false,
        missingPrerequisites: ['T1', 'T2', 'T3'],
        canPracticeT4: false,
        message: '❌ Unable to validate prerequisites. Complete T1, T2, and T3 first.'
      };
    }
  }, [getT4ProgressFromStats]);

  // ✅ ENHANCED: Expose comprehensive methods to parent component
  useImperativeHandle(ref, () => ({
    // Primary methods
    recordSession: recordT4Session,
    getT4SessionHistory,
    isT4Complete: checkT4Complete, // Updated name to avoid confusion
    getCurrentProgress,
    
    // ✅ T4-specific methods
    validatePrerequisites,
    getProgressFromStats: getT4ProgressFromStats,
    
    // ✅ Validation methods
    validateProgress: async () => {
      const statsData = getT4ProgressFromStats();
      const userContextData = await getT4SessionHistory();
      return {
        statsData,
        userContextData,
        isConsistent: statsData.t4Sessions === userContextData.totalSessions,
        prerequisiteCheck: await validatePrerequisites()
      };
    },
    
    // ✅ Utility methods
    canPracticeT4: async () => {
      const progress = await getCurrentProgress();
      return progress.canPractice;
    },
    
    getT4Summary: async () => {
      const progress = await getCurrentProgress();
      return {
        status: progress.isComplete ? 'Complete' : 'In Progress',
        sessions: `${progress.sessions}/3`,
        percentage: `${Math.round(progress.percentage)}%`,
        nextAction: progress.isComplete ? 'Continue to T5' : 'Practice T4',
        prerequisitesMet: progress.prerequisitesMet,
        t1Status: progress.t1Complete ? 'Complete' : 'Incomplete',
        t2Status: progress.t2Complete ? 'Complete' : 'Incomplete',
        t3Status: progress.t3Complete ? 'Complete' : 'Incomplete'
      };
    },

    // ✅ T1/T2/T3/T4 combined status
    getOverallProgress: async () => {
      const t4Progress = await getCurrentProgress();
      return {
        t1: {
          sessions: t4Progress.t1Sessions,
          complete: t4Progress.t1Complete
        },
        t2: {
          sessions: t4Progress.t2Sessions,
          complete: t4Progress.t2Complete
        },
        t3: {
          sessions: t4Progress.t3Sessions,
          complete: t4Progress.t3Complete
        },
        t4: {
          sessions: t4Progress.sessions,
          complete: t4Progress.isComplete,
          canPractice: t4Progress.canPractice
        },
        prerequisitesMet: t4Progress.prerequisitesMet,
        readyForT5: t4Progress.isComplete,
        foundationTime: (t4Progress.t1Sessions * 10) + (t4Progress.t2Sessions * 15) + (t4Progress.t3Sessions * 20) + (t4Progress.sessions * 25)
      };
    },

    // ✅ Complete foundation summary
    getFoundationSummary: async () => {
      const progress = await getCurrentProgress();
      return {
        t1Time: progress.t1Sessions * 10, // minutes
        t2Time: progress.t2Sessions * 15, // minutes
        t3Time: progress.t3Sessions * 20, // minutes
        t4Time: progress.sessions * 25,   // minutes
        totalTime: (progress.t1Sessions * 10) + (progress.t2Sessions * 15) + (progress.t3Sessions * 20) + (progress.sessions * 25),
        totalSessions: progress.t1Sessions + progress.t2Sessions + progress.t3Sessions + progress.sessions,
        foundationComplete: progress.t1Complete && progress.t2Complete && progress.t3Complete,
        currentLevel: progress.isComplete ? 'T4 Complete' : progress.prerequisitesMet ? 'T4 In Progress' : 'Prerequisites Needed',
        physicalEnduranceAchieved: progress.isComplete,
        readyForAdvancedPractice: progress.isComplete
      };
    }
  }), [
    recordT4Session, 
    getT4SessionHistory, 
    checkT4Complete, 
    getCurrentProgress, 
    validatePrerequisites,
    getT4ProgressFromStats
  ]);

  // This component doesn't render anything visible
  return null;
});

T4PracticeRecorder.displayName = 'T4PracticeRecorder';

export default T4PracticeRecorder;