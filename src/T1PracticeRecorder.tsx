// ✅ FIXED T1PracticeRecorder.tsx - Proper Integration with Current System
// File: src/T1PracticeRecorder.tsx

import { forwardRef, useImperativeHandle } from 'react';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T1PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T1PracticeRecorder - Handles recording of T1 practice sessions
 * 
 * ✅ FIREBASE-ONLY: Integrates with both PracticeContext and UserContext
 */
const T1PracticeRecorder = forwardRef<any, T1PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // ✅ FIXED: Use both contexts for complete integration
  const { addPracticeSession } = usePractice();
  const { incrementT1Sessions, getT1Sessions, isT1Complete } = useUser();

  // ✅ FIXED: Record session with proper data structure and dual context integration
  const recordT1Session = async (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    try {
      // 1. ✅ Increment UserContext session count first (drives UI)
      const newSessionCount = await incrementT1Sessions();
      console.log(`📊 T1 Sessions: ${newSessionCount-1} → ${newSessionCount}`);

      // 2. ✅ Create session data with proper structure (matches your current format)
      const sessionData = {
        timestamp: new Date().toISOString(),
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
          sessionCount: newSessionCount
        }
      };

      // 3. ✅ Save detailed session to PracticeContext for history
      await addPracticeSession(sessionData);

      // 4. ✅ Notify parent component
      onRecordSession({
        ...sessionData,
        // ✅ Add legacy fields for backward compatibility
        level: 't1',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted
      });
      
      console.log('✅ T1 session recorded successfully to both contexts', {
        duration: timeSpent,
        completed: isCompleted,
        sessionCount: newSessionCount,
        sessionId: sessionData.timestamp
      });

      return sessionData;

    } catch (error) {
      console.error('❌ Error recording T1 session:', error);
      
      // ✅ Fallback notification to parent
      const fallbackSessionData = {
        level: 't1',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: 'Failed to save to Firebase'
      };
      
      onRecordSession(fallbackSessionData);
      throw error;
    }
  };

  // ✅ FIXED: Get T1 session history from UserContext
  const getT1SessionHistory = () => {
    try {
      const sessionCount = getT1Sessions();
      console.log(`T1 session history: ${sessionCount} sessions completed`);
      return {
        totalSessions: sessionCount,
        isComplete: isT1Complete(),
        progress: `${sessionCount}/3 sessions`
      };
    } catch (error) {
      console.error('Error getting T1 session history:', error);
      return {
        totalSessions: 0,
        isComplete: false,
        progress: '0/3 sessions'
      };
    }
  };

  // ✅ FIXED: Check T1 completion status from UserContext
  const checkT1Complete = () => {
    try {
      const complete = isT1Complete();
      const sessions = getT1Sessions();
      console.log(`T1 completion status: ${complete} (${sessions}/3 sessions)`);
      return {
        isComplete: complete,
        sessions: sessions,
        sessionsNeeded: Math.max(0, 3 - sessions)
      };
    } catch (error) {
      console.error('Error checking T1 completion:', error);
      return {
        isComplete: false,
        sessions: 0,
        sessionsNeeded: 3
      };
    }
  };

  // ✅ Expose methods to parent component with updated signatures
  useImperativeHandle(ref, () => ({
    recordSession: recordT1Session,
    getT1SessionHistory,
    isT1Complete: checkT1Complete, // Updated name to avoid confusion
    // ✅ Additional helper methods
    getCurrentProgress: () => ({
      sessions: getT1Sessions(),
      isComplete: isT1Complete(),
      progress: `${getT1Sessions()}/3`
    })
  }));

  // This component doesn't render anything visible
  return null;
});

T1PracticeRecorder.displayName = 'T1PracticeRecorder';

export default T1PracticeRecorder;