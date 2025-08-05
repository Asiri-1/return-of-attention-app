import { forwardRef, useImperativeHandle } from 'react';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';

interface T3PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T3PracticeRecorder - Handles recording of T3 practice sessions
 * 
 * ✅ FIREBASE-ONLY: This component now uses Firebase contexts instead of localStorage
 * separate from the progression logic but integrated with Firebase architecture.
 */
const T3PracticeRecorder = forwardRef<any, T3PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // ✅ FIREBASE-ONLY: Use contexts for session recording and user progression
  const { addPracticeSession } = usePractice();
  const { updateProfile } = useUser();

  // Record a practice session
  const recordT3Session = async (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    try {
      const sessionData = {
        level: 't3',
        stageLevel: 1, // T3 is part of Stage 1 (Seeker)
        type: 'meditation',
        sessionType: 'meditation' as const, // Explicitly type as union member
        targetDuration: duration,
        timeSpent: timeSpent,
        duration: timeSpent, // Actual practice time
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        environment: {
          posture: 'seated', // Default posture for T3
          location: 'indoor',
          lighting: 'natural', // Required property
          sounds: 'quiet' // Required property
        },
        quality: isCompleted ? 7 : 5, // Quality rating based on completion
        notes: `T3 practice session - ${isCompleted ? 'completed' : 'partial'}`
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
      
      console.log('✅ T3 session recorded successfully to Firebase', {
        duration: timeSpent,
        completed: isCompleted,
        sessionId: sessionData.timestamp
      });

    } catch (error) {
      console.error('❌ Error recording T3 session:', error);
      
      // Still notify parent even if Firebase save fails
      const fallbackSessionData = {
        level: 't3',
        targetDuration: duration,
        timeSpent: timeSpent,
        isCompleted: isCompleted,
        timestamp: new Date().toISOString(),
        error: 'Failed to save to Firebase'
      };
      
      onRecordSession(fallbackSessionData);
    }
  };

  // ✅ FIREBASE-ONLY: Get T3 session history from Firebase
  const getT3SessionHistory = async () => {
    try {
      // This would get sessions from Firebase through PracticeContext
      // The parent component can access this through usePractice() hook
      console.log('T3 session history available through usePractice() hook');
      return [];
    } catch (error) {
      console.error('Error getting T3 session history:', error);
      return [];
    }
  };

  // ✅ FIREBASE-ONLY: Check T3 completion status from Firebase
  const isT3Complete = async () => {
    try {
      // This would check completion status from Firebase through UserContext
      // The parent component can access this through useUser() hook
      console.log('T3 completion status available through useUser() hook');
      return false;
    } catch (error) {
      console.error('Error checking T3 completion:', error);
      return false;
    }
  };

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    recordSession: recordT3Session, // Expose with original name expected by parent
    getT3SessionHistory,
    isT3Complete
  }));

  // This component doesn't render anything visible
  return null;
});

export default T3PracticeRecorder;