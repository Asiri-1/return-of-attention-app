// ✅ ENHANCED T1PracticeRecorder.tsx - PHASE 3 FIREBASE INTEGRATION
// File: src/T1PracticeRecorder.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Error handling and fallback mechanisms
// ✅ ENHANCED: Real-time progress tracking
// ✅ ENHANCED: Session validation and sanitization

import { forwardRef, useImperativeHandle, useCallback } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T1PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T1PracticeRecorder - Handles recording of T1 practice sessions
 * 
 * ✅ FIREBASE-ONLY: Integrates with PracticeContext, UserContext, and AuthContext
 * ✅ ENHANCED: Phase 3 compliant with proper error handling
 */
const T1PracticeRecorder = forwardRef<any, T1PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
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

  // ✅ ENHANCED: Calculate T1 progress using available data
  const getT1ProgressFromStats = useCallback(() => {
    try {
      const stats = calculateStats();
      const allSessions = sessions || [];
      
      // Count T1 sessions from practice history
      const t1Sessions = allSessions.filter(session => 
        session.tLevel === 'T1' || 
        session.level === 't1' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation')
      ).length;
      
      const isComplete = t1Sessions >= 3;
      
      return {
        totalSessions: t1Sessions,
        isComplete,
        progress: `${t1Sessions}/3`,
        sessionsNeeded: Math.max(0, 3 - t1Sessions)
      };
    } catch (error) {
      console.error('Error calculating T1 progress from stats:', error);
      return {
        totalSessions: 0,
        isComplete: false,
        progress: '0/3',
        sessionsNeeded: 3
      };
    }
  }, [calculateStats, sessions]);

  // ✅ ENHANCED: Record session with comprehensive validation and dual context integration
  const recordT1Session = useCallback(async (
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

      console.log('🎯 Recording T1 session:', {
        duration,
        timeSpent,
        isCompleted,
        user: currentUser.uid
      });

      // ✅ Get current progress before recording
      const currentProgress = getT1ProgressFromStats();
      console.log('📊 Current T1 progress:', currentProgress);

      // ✅ Try to increment UserContext session count (if method exists)
      let newSessionCount = currentProgress.totalSessions + 1;
      try {
        const result = await safeUserContextCall('incrementT1Sessions', newSessionCount);
        if (typeof result === 'number') {
          newSessionCount = result;
          console.log(`📊 UserContext T1 Sessions: ${newSessionCount-1} → ${newSessionCount}`);
        }
      } catch (error) {
        console.warn('⚠️ UserContext T1 increment failed, continuing with PracticeContext only:', error);
      }

      // ✅ Create comprehensive session data with proper structure
      const sessionData = {
        timestamp: new Date().toISOString(),
        userId: currentUser.uid,
        duration: timeSpent, // Actual practice time in minutes
        sessionType: 'meditation' as const,
        stageLevel: 1, // T1 is part of Stage 1
        stageLabel: 'T1: Physical Stillness Training',
        tLevel: 'T1', // ✅ CRITICAL: T-level identifier
        level: 't1',  // ✅ CRITICAL: Lowercase T-level identifier
        rating: isCompleted ? 8 : 6,
        notes: `T1 physical stillness training (${timeSpent} minutes)`,
        presentPercentage: isCompleted ? 85 : 70,
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
          tLevel: 'T1',
          isCompleted: isCompleted,
          targetDuration: duration,
          actualDuration: timeSpent,
          sessionCount: newSessionCount,
          recordedAt: new Date().toISOString(),
          source: 'T1PracticeRecorder'
        }
      };

      // ✅ Save detailed session to PracticeContext for history
      await addPracticeSession(sessionData);
      console.log('✅ Session saved to PracticeContext');

      // ✅ Create response data with legacy compatibility
      const responseData = {
        ...sessionData,
        // ✅ Add legacy fields for backward compatibility
        level: 't1',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        currentProgress: {
          totalSessions: newSessionCount,
          isComplete: newSessionCount >= 3,
          progress: `${newSessionCount}/3`,
          sessionsNeeded: Math.max(0, 3 - newSessionCount)
        }
      };

      // ✅ Notify parent component
      onRecordSession(responseData);
      
      console.log('✅ T1 session recorded successfully', {
        duration: timeSpent,
        completed: isCompleted,
        sessionCount: newSessionCount,
        sessionId: sessionData.timestamp,
        isT1Complete: newSessionCount >= 3
      });

      return responseData;

    } catch (error) {
      console.error('❌ Error recording T1 session:', error);
      
      // ✅ Enhanced fallback notification to parent
      const fallbackSessionData = {
        level: 't1',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: `Failed to save to Firebase: ${(error as Error).message}`,
        currentProgress: getT1ProgressFromStats() // Still provide current progress
      };
      
      onRecordSession(fallbackSessionData);
      throw error;
    }
  }, [currentUser, addPracticeSession, onRecordSession, safeUserContextCall, getT1ProgressFromStats]);

  // ✅ ENHANCED: Get T1 session history using available methods
  const getT1SessionHistory = useCallback(async () => {
    try {
      // Try UserContext first, fallback to PracticeContext calculation
      const progressFromStats = getT1ProgressFromStats();
      
      let userContextData = null;
      try {
        const sessionCount = await safeUserContextCall('getT1Sessions', 0);
        const complete = await safeUserContextCall('isT1Complete', false);
        userContextData = {
          totalSessions: sessionCount,
          isComplete: complete,
          progress: `${sessionCount}/3`
        };
      } catch (error) {
        console.warn('⚠️ UserContext T1 methods not available:', error);
      }

      // Use UserContext data if available, otherwise use calculated data
      const finalData = userContextData || progressFromStats;
      
      console.log(`📊 T1 session history: ${finalData.totalSessions} sessions completed`);
      
      return {
        ...finalData,
        source: userContextData ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error getting T1 session history:', error);
      return {
        totalSessions: 0,
        isComplete: false,
        progress: '0/3 sessions',
        source: 'fallback'
      };
    }
  }, [getT1ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Check T1 completion status with comprehensive data
  const checkT1Complete = useCallback(async () => {
    try {
      const progressData = getT1ProgressFromStats();
      
      // Try to get UserContext data as well
      let userContextComplete = null;
      let userContextSessions = null;
      
      try {
        userContextComplete = await safeUserContextCall('isT1Complete', null);
        userContextSessions = await safeUserContextCall('getT1Sessions', null);
      } catch (error) {
        console.warn('⚠️ UserContext T1 completion check failed:', error);
      }

      const finalIsComplete = userContextComplete !== null ? userContextComplete : progressData.isComplete;
      const finalSessions = userContextSessions !== null ? userContextSessions : progressData.totalSessions;
      
      console.log(`📊 T1 completion status: ${finalIsComplete} (${finalSessions}/3 sessions)`);
      
      return {
        isComplete: finalIsComplete,
        sessions: finalSessions,
        sessionsNeeded: Math.max(0, 3 - finalSessions),
        progress: `${finalSessions}/3`,
        percentage: Math.min((finalSessions / 3) * 100, 100),
        dataSource: userContextComplete !== null ? 'UserContext' : 'PracticeContext'
      };
    } catch (error) {
      console.error('Error checking T1 completion:', error);
      return {
        isComplete: false,
        sessions: 0,
        sessionsNeeded: 3,
        progress: '0/3',
        percentage: 0,
        dataSource: 'fallback'
      };
    }
  }, [getT1ProgressFromStats, safeUserContextCall]);

  // ✅ ENHANCED: Get comprehensive current progress
  const getCurrentProgress = useCallback(async () => {
    try {
      const completionData = await checkT1Complete();
      const historyData = await getT1SessionHistory();
      
      return {
        ...completionData,
        history: historyData,
        nextSessionNumber: completionData.sessions + 1,
        canPractice: !completionData.isComplete || completionData.sessions < 10, // Allow practice even after completion
        practiceMessage: completionData.isComplete 
          ? `T1 Complete! ${completionData.sessions} sessions completed.`
          : `${completionData.sessionsNeeded} more sessions needed to complete T1.`
      };
    } catch (error) {
      console.error('Error getting current progress:', error);
      return {
        isComplete: false,
        sessions: 0,
        sessionsNeeded: 3,
        progress: '0/3',
        percentage: 0,
        canPractice: true,
        practiceMessage: 'Ready to begin T1 practice.',
        dataSource: 'fallback'
      };
    }
  }, [checkT1Complete, getT1SessionHistory]);

  // ✅ ENHANCED: Expose comprehensive methods to parent component
  useImperativeHandle(ref, () => ({
    // Primary methods
    recordSession: recordT1Session,
    getT1SessionHistory,
    isT1Complete: checkT1Complete, // Updated name to avoid confusion
    getCurrentProgress,
    
    // ✅ Additional helper methods
    getProgressFromStats: getT1ProgressFromStats,
    validateProgress: async () => {
      const statsData = getT1ProgressFromStats();
      const userContextData = await getT1SessionHistory();
      return {
        statsData,
        userContextData,
        isConsistent: statsData.totalSessions === userContextData.totalSessions
      };
    },
    
    // ✅ Utility methods
    canPracticeT1: async () => {
      const progress = await getCurrentProgress();
      return progress.canPractice;
    },
    
    getT1Summary: async () => {
      const progress = await getCurrentProgress();
      return {
        status: progress.isComplete ? 'Complete' : 'In Progress',
        sessions: `${progress.sessions}/3`,
        percentage: `${Math.round(progress.percentage)}%`,
        nextAction: progress.isComplete ? 'Continue to T2' : 'Practice T1'
      };
    }
  }), [
    recordT1Session, 
    getT1SessionHistory, 
    checkT1Complete, 
    getCurrentProgress, 
    getT1ProgressFromStats
  ]);

  // This component doesn't render anything visible
  return null;
});

T1PracticeRecorder.displayName = 'T1PracticeRecorder';

export default T1PracticeRecorder;