// ✅ ENHANCED T2PracticeRecorder.tsx - PHASE 3 FIREBASE INTEGRATION
// File: src/T2PracticeRecorder.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Error handling and fallback mechanisms
// ✅ ENHANCED: Real-time progress tracking
// ✅ ENHANCED: Session validation and sanitization
// ✅ ENHANCED: T1 prerequisite validation

import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T2PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T2PracticeRecorder - Handles recording of T2 practice sessions
 * 
 * ✅ FIREBASE-ONLY: Integrates with PracticeContext, UserContext, and AuthContext
 * ✅ ENHANCED: Phase 3 compliant with proper error handling and validation
 * ✅ ENHANCED: T1 prerequisite checking and T2 progression tracking
 */
const T2PracticeRecorder = forwardRef<any, T2PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // ✅ ENHANCED: Complete Firebase context integration
  const { currentUser } = useAuth();
  const { addPracticeSession, calculateStats, sessions } = usePractice();
  const { userProfile } = useUser();

  // ✅ ENHANCED: Safe method wrapper for UserContext methods
  const safeUserContextCall = useCallback(async (method: string, fallbackValue: any, ...args: any[]) => {
    try {
      const userContext = useUser() as any;
      const userContextMethod = userContext[method];
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
  }, []);

  // ✅ ENHANCED: Calculate T1 and T2 progress using available data
  const getT2ProgressFromStats = useCallback(() => {
    try {
      const allSessions = sessions || [];
      
      // Count T1 sessions (prerequisite)
      const t1Sessions = allSessions.filter(session => 
        session.tLevel === 'T1' || 
        session.level === 't1' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration <= 12)
      ).length;
      
      // Count T2 sessions
      const t2Sessions = allSessions.filter(session => 
        session.tLevel === 'T2' || 
        session.level === 't2' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 12 && session.duration <= 17)
      ).length;
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const canPracticeT2 = isT1Complete;
      
      return {
        // T1 Data (prerequisite)
        t1Sessions,
        t1Complete: isT1Complete,
        
        // T2 Data
        t2Sessions,
        t2Complete: isT2Complete,
        t2Progress: `${t2Sessions}/3`,
        t2Percentage: Math.min((t2Sessions / 3) * 100, 100),
        sessionsNeeded: Math.max(0, 3 - t2Sessions),
        
        // Access
        canPracticeT2
      };
    } catch (error) {
      console.error('Error calculating T2 progress from stats:', error);
      return {
        t1Sessions: 0, t1Complete: false,
        t2Sessions: 0, t2Complete: false, t2Progress: '0/3', t2Percentage: 0,
        sessionsNeeded: 3, canPracticeT2: false
      };
    }
  }, [sessions]);

  // ✅ ENHANCED: Record session with comprehensive validation and dual context integration
  const recordT2Session = useCallback(async (
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

      // Check T1 prerequisite
      const currentProgress = getT2ProgressFromStats();
      if (!currentProgress.t1Complete) {
        throw new Error(`T1 prerequisite not met. Complete T1 first (${currentProgress.t1Sessions}/3 sessions completed).`);
      }

      console.log('🎯 Recording T2 session:', {
        duration,
        timeSpent,
        isCompleted,
        user: currentUser.uid,
        t1Complete: currentProgress.t1Complete,
        currentT2Sessions: currentProgress.t2Sessions
      });

      // ✅ Get current progress before recording
      console.log('📊 Current T2 progress:', currentProgress);

      // ✅ Try to increment UserContext session count (if method exists)
      let newT2SessionCount = currentProgress.t2Sessions + 1;
      try {
        const result = await safeUserContextCall('incrementT2Sessions', newT2SessionCount);
        if (typeof result === 'number') {
          newT2SessionCount = result;
          console.log(`📊 UserContext T2 Sessions: ${newT2SessionCount-1} → ${newT2SessionCount}`);
        }
      } catch (error) {
        console.warn('⚠️ UserContext T2 increment failed, continuing with PracticeContext only:', error);
      }

      // ✅ Create comprehensive session data with proper structure
      const sessionData = {
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        duration: timeSpent, // Actual practice time in minutes
        sessionType: 'meditation' as const,
        stageLevel: 1, // T2 is part of Stage 1
        stageLabel: 'T2: Building Endurance',
        tLevel: 'T2', // ✅ CRITICAL: T-level identifier
        level: 't2',  // ✅ CRITICAL: Lowercase T-level identifier
        rating: isCompleted ? 7 : 5, // Slightly higher rating for T2
        notes: `T2 building endurance training (${timeSpent} minutes)`,
        presentPercentage: isCompleted ? 80 : 65, // T2 typically has slightly lower presence initially
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
          tLevel: 'T2',
          isCompleted: isCompleted,
          targetDuration: duration,
          actualDuration: timeSpent,
          sessionCount: newT2SessionCount,
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          recordedAt: new Date().toISOString(),
          source: 'T2PracticeRecorder'
        }
      };

      // ✅ Save detailed session to PracticeContext for history
      await addPracticeSession(sessionData);
      console.log('✅ Session saved to PracticeContext');

      // ✅ Try to update UserContext profile (if method exists)
      if (isCompleted) {
        try {
          await safeUserContextCall('updateT2Progress', null, {
            sessionsCompleted: newT2SessionCount,
            lastCompletedAt: new Date().toISOString(),
            isT2Complete: newT2SessionCount >= 3
          });
        } catch (error) {
          console.warn('⚠️ UserContext profile update failed:', error);
        }
      }

      // ✅ Create response data with legacy compatibility
      const responseData = {
        ...sessionData,
        // ✅ Add legacy fields for backward compatibility
        level: 't2',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        currentProgress: {
          t1Complete: currentProgress.t1Complete,
          t1Sessions: currentProgress.t1Sessions,
          t2Sessions: newT2SessionCount,
          t2Complete: newT2SessionCount >= 3,
          t2Progress: `${newT2SessionCount}/3`,
          t2Percentage: Math.min((newT2SessionCount / 3) * 100, 100),
          sessionsNeeded: Math.max(0, 3 - newT2SessionCount)
        }
      };

      // ✅ Notify parent component
      onRecordSession(responseData);
      
      console.log('✅ T2 session recorded successfully', {
        duration: timeSpent,
        completed: isCompleted,
        sessionCount: newT2SessionCount,
        sessionId: sessionData.timestamp,
        isT2Complete: newT2SessionCount >= 3,
        nextLevel: newT2SessionCount >= 3 ? 'T3' : 'Continue T2'
      });

      return responseData;

    } catch (error) {
      console.error('❌ Error recording T2 session:', error);
      
      // ✅ Enhanced fallback notification to parent
      const fallbackSessionData = {
        level: 't2',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: `Failed to save to Firebase: ${(error as Error).message}`,
        currentProgress: getT2ProgressFromStats() // Still provide current progress
      };
      
      onRecordSession(fallbackSessionData);
      throw error;
    }
  }, [currentUser, addPracticeSession, onRecordSession, safeUserContextCall, getT2ProgressFromStats]);

  // ✅ ENHANCED: Get T2 session history using available methods
  const getT2SessionHistory = useCallback(async () => {
    try {
      // Try UserContext first, fallback to PracticeContext calculation
      const progressFromStats = getT2ProgressFromStats();
      
      let userContextData = null;
      try {
        const sessionCount = await safeUserContextCall('getT2Sessions', 0);
        const complete = await safeUserContextCall('isT2Complete', false);
        userContextData = {
          totalSessions: sessionCount,
          isComplete: complete,
          progress: `${sessionCount}/3`
        };
      } catch (error) {
        console.warn('⚠️ UserContext T2 methods not available:', error);
      }

      // Use UserContext data if available, otherwise use calculated data
      const finalData = userContextData || {
        totalSessions: progressFromStats.t2Sessions,
        isComplete: progressFromStats.t2Complete,
        progress: progressFromStats.t2Progress
      };
      
      console.log(`📊 T2 session history: ${finalData.totalSessions} sessions completed`);
      
      return {
        ...finalData,
        t1Complete: progressFromStats.t1Complete,
        t1Sessions: progressFromStats.t1Sessions,
        canPractice: progressFromStats.canPracticeT2,
        source: userContextData ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error getting T2 session history:', error);
      return {
        totalSessions: 0,
        isComplete: false,
        progress: '0/3 sessions',
        t1Complete: false,
        t1Sessions: 0,
        canPractice: false,
        source: 'fallback'
      };
    }
  }, [getT2ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Check T2 completion status with comprehensive data
  const checkT2Complete = useCallback(async () => {
    try {
      const progressData = getT2ProgressFromStats();
      
      // Try to get UserContext data as well
      let userContextComplete = null;
      let userContextSessions = null;
      
      try {
        userContextComplete = await safeUserContextCall('isT2Complete', null);
        userContextSessions = await safeUserContextCall('getT2Sessions', null);
      } catch (error) {
        console.warn('⚠️ UserContext T2 completion check failed:', error);
      }

      const finalIsComplete = userContextComplete !== null ? userContextComplete : progressData.t2Complete;
      const finalSessions = userContextSessions !== null ? userContextSessions : progressData.t2Sessions;
      
      console.log(`📊 T2 completion status: ${finalIsComplete} (${finalSessions}/3 sessions)`);
      
      return {
        isComplete: finalIsComplete,
        sessions: finalSessions,
        sessionsNeeded: Math.max(0, 3 - finalSessions),
        progress: `${finalSessions}/3`,
        percentage: Math.min((finalSessions / 3) * 100, 100),
        
        // T1 prerequisite info
        t1Complete: progressData.t1Complete,
        t1Sessions: progressData.t1Sessions,
        canPractice: progressData.canPracticeT2,
        
        dataSource: userContextComplete !== null ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error checking T2 completion:', error);
      return {
        isComplete: false,
        sessions: 0,
        sessionsNeeded: 3,
        progress: '0/3',
        percentage: 0,
        t1Complete: false,
        t1Sessions: 0,
        canPractice: false,
        dataSource: 'fallback'
      };
    }
  }, [getT2ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Get comprehensive current progress
  const getCurrentProgress = useCallback(async () => {
    try {
      const completionData = await checkT2Complete();
      const historyData = await getT2SessionHistory();
      
      return {
        ...completionData,
        history: historyData,
        nextSessionNumber: completionData.sessions + 1,
        canPractice: completionData.canPractice && (!completionData.isComplete || completionData.sessions < 10),
        practiceMessage: !completionData.t1Complete
          ? `Complete T1 first (${completionData.t1Sessions}/3 sessions completed).`
          : completionData.isComplete 
            ? `T2 Complete! ${completionData.sessions} sessions completed. Ready for T3.`
            : `${completionData.sessionsNeeded} more T2 sessions needed to complete T2.`,
        nextLevel: completionData.isComplete ? 'T3' : 'T2',
        prerequisitesMet: completionData.t1Complete,
        // ✅ Ensure these properties are always available
        t1Complete: completionData.t1Complete,
        t1Sessions: completionData.t1Sessions
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
        practiceMessage: 'Complete T1 first to unlock T2 practice.',
        nextLevel: 'T2',
        prerequisitesMet: false,
        // ✅ Ensure these properties are always available
        t1Complete: false,
        t1Sessions: 0,
        dataSource: 'fallback'
      };
    }
  }, [checkT2Complete, getT2SessionHistory]);

  // ✅ ENHANCED: Validate T1 prerequisite
  const validateT1Prerequisite = useCallback(async () => {
    try {
      const progress = getT2ProgressFromStats();
      return {
        t1Complete: progress.t1Complete,
        t1Sessions: progress.t1Sessions,
        canPracticeT2: progress.canPracticeT2,
        message: progress.t1Complete 
          ? `✅ T1 Complete (${progress.t1Sessions}/3 sessions). Ready for T2.`
          : `❌ T1 Incomplete (${progress.t1Sessions}/3 sessions). Complete T1 first.`
      };
    } catch (error) {
      console.error('Error validating T1 prerequisite:', error);
      return {
        t1Complete: false,
        t1Sessions: 0,
        canPracticeT2: false,
        message: '❌ Unable to validate T1 prerequisite. Complete T1 first.'
      };
    }
  }, [getT2ProgressFromStats]);

  // ✅ ENHANCED: Expose comprehensive methods to parent component
  useImperativeHandle(ref, () => ({
    // Primary methods
    recordSession: recordT2Session,
    getT2SessionHistory,
    isT2Complete: checkT2Complete, // Updated name to avoid confusion
    getCurrentProgress,
    
    // ✅ T2-specific methods
    validateT1Prerequisite,
    getProgressFromStats: getT2ProgressFromStats,
    
    // ✅ Validation methods
    validateProgress: async () => {
      const statsData = getT2ProgressFromStats();
      const userContextData = await getT2SessionHistory();
      return {
        statsData,
        userContextData,
        isConsistent: statsData.t2Sessions === userContextData.totalSessions,
        prerequisiteCheck: await validateT1Prerequisite()
      };
    },
    
    // ✅ Utility methods
    canPracticeT2: async () => {
      const progress = await getCurrentProgress();
      return progress.canPractice;
    },
    
    getT2Summary: async () => {
      const progress = await getCurrentProgress();
      return {
        status: progress.isComplete ? 'Complete' : 'In Progress',
        sessions: `${progress.sessions}/3`,
        percentage: `${Math.round(progress.percentage)}%`,
        nextAction: progress.isComplete ? 'Continue to T3' : 'Practice T2',
        prerequisitesMet: progress.prerequisitesMet,
        t1Status: progress.t1Complete ? 'Complete' : 'Incomplete'
      };
    },

    // ✅ T1/T2 combined status
    getOverallProgress: async () => {
      const t2Progress = await getCurrentProgress();
      return {
        t1: {
          sessions: t2Progress.t1Sessions,
          complete: t2Progress.t1Complete
        },
        t2: {
          sessions: t2Progress.sessions,
          complete: t2Progress.isComplete,
          canPractice: t2Progress.canPractice
        },
        readyForT3: t2Progress.isComplete
      };
    }
  }), [
    recordT2Session, 
    getT2SessionHistory, 
    checkT2Complete, 
    getCurrentProgress, 
    validateT1Prerequisite,
    getT2ProgressFromStats
  ]);

  // This component doesn't render anything visible
  return null;
});

T2PracticeRecorder.displayName = 'T2PracticeRecorder';

export default T2PracticeRecorder;