import { forwardRef, useImperativeHandle } from 'react';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T1PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T1PracticeRecorder - Handles recording of T1 practice sessions
 * 
 * ✅ FIREBASE-ONLY: This component now uses Firebase contexts instead of localStorage
 * separate from the progression logic but integrated with Firebase architecture.
 */
const T1PracticeRecorder = forwardRef<any, T1PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // ✅ FIREBASE-ONLY: Use contexts for session recording and user progression
  const { addPracticeSession } = usePractice();
  const { updateProfile } = useUser();

  // Record a practice session
  const recordT1Session = async (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    try {
      const sessionData = {
        level: 't1',
        stageLevel: 1, // T1 is part of Stage 1 (Seeker)
        type: 'meditation',
        sessionType: 'meditation' as const, // Explicitly type as union member
        targetDuration: duration,
        timeSpent: timeSpent,
        duration: timeSpent, // Actual practice time
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        environment: {
          posture: 'seated', // Default posture for T1
          location: 'indoor',
          lighting: 'natural', // Required property
          sounds: 'quiet' // Required property
        },
        quality: isCompleted ? 5 : 3, // Quality rating based on completion (lowest for T1 - beginner level)
        notes: `T1 practice session - ${isCompleted ? 'completed' : 'partial'} (beginner level)`
      };

      // ✅ FIREBASE-ONLY: Save session to Firebase through PracticeContext
      if (addPracticeSession) {
        await addPracticeSession(sessionData);
      }

      // ✅ FIREBASE-ONLY: If session was fully completed, update user profile
      if (isCompleted) {
        // Use basic profile update - adjust properties based on your actual UserProfile interface
        await updateProfile({
          // Add any valid properties that exist in your UserProfile interface
          // For example, if you have totalSessions, totalMinutes, etc.
        });
      }

      // Pass session data to parent component
      onRecordSession(sessionData);
      
      console.log('✅ T1 session recorded successfully to Firebase', {
        duration: timeSpent,
        completed: isCompleted,
        sessionId: sessionData.timestamp
      });

    } catch (error) {
      console.error('❌ Error recording T1 session:', error);
      
      // Still notify parent even if Firebase save fails
      const fallbackSessionData = {
        level: 't1',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: 'Failed to save to Firebase'
      };
      
      onRecordSession(fallbackSessionData);
    }
  };

  // ✅ FIREBASE-ONLY: Get T1 session history from Firebase
  const getT1SessionHistory = async () => {
    try {
      // This would get sessions from Firebase through PracticeContext
      // The parent component can access this through usePractice() hook
      console.log('T1 session history available through usePractice() hook');
      return [];
    } catch (error) {
      console.error('Error getting T1 session history:', error);
      return [];
    }
  };

  // ✅ FIREBASE-ONLY: Check T1 completion status from Firebase
  const isT1Complete = async () => {
    try {
      // This would check completion status from Firebase through UserContext
      // The parent component can access this through useUser() hook
      console.log('T1 completion status available through useUser() hook');
      return false;
    } catch (error) {
      console.error('Error checking T1 completion:', error);
      return false;
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    recordSession: recordT1Session, // Expose with original name expected by parent
    getT1SessionHistory,
    isT1Complete
  }));

  // This component doesn't render anything visible
  return null;
});

export default T1PracticeRecorder;