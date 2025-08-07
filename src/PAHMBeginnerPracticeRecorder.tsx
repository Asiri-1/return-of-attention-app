import React, { useCallback, useEffect } from 'react';
import { usePractice } from './contexts/practice/PracticeContext';
import { useAuth } from './contexts/auth/AuthContext';

interface PAHMBeginnerPracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * ✅ FIREBASE-ONLY: PAHMBeginnerPracticeRecorder 
 * 
 * This component handles recording of PAHM Beginner practice sessions with pure Firebase integration.
 * No localStorage or sessionStorage usage - only Firebase persistence.
 */
const PAHMBeginnerPracticeRecorder: React.FC<PAHMBeginnerPracticeRecorderProps> = ({ onRecordSession }) => {
  
  // ✅ FIREBASE-ONLY: Use Firebase contexts
  const { addPracticeSession } = usePractice();
  const { currentUser } = useAuth();
  
  // ✅ FIREBASE-ONLY: Enhanced session recording with pure Firebase
  const recordSession = useCallback(async (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    if (!currentUser) {
      console.warn('No authenticated user for session recording');
      return;
    }
    
    try {
      // ✅ FIREBASE-ONLY: Create enhanced session data for PracticeContext
      const sessionData = {
        timestamp: new Date().toISOString(),
        duration: Math.round(timeSpent / 60), // Convert to minutes
        sessionType: 'meditation' as const,
        stageLevel: 3,
        stageLabel: 'Stage 3: PAHM Beginner Practice',
        rating: isCompleted ? 8 : 6,
        notes: `PAHM Beginner session: ${isCompleted ? 'Completed' : 'Partial'} (${Math.round(timeSpent / 60)} minutes)`,
        presentPercentage: isCompleted ? 75 : 60,
        environment: {
          posture: 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: pahmCounts?.likes || 0,
          present_neutral: pahmCounts?.present || 0,
          present_aversion: pahmCounts?.dislikes || 0,
          past_attachment: pahmCounts?.nostalgia || 0,
          past_neutral: pahmCounts?.past || 0,
          past_aversion: pahmCounts?.regret || 0,
          future_attachment: pahmCounts?.anticipation || 0,
          future_neutral: pahmCounts?.future || 0,
          future_aversion: pahmCounts?.worry || 0
        },
        metadata: {
          stage: 3,
          stageName: 'PAHM Beginner',
          targetDuration: duration,
          timeSpent: timeSpent,
          actualDuration: timeSpent,
          isCompleted: isCompleted,
          pahmCounts: pahmCounts,
          sessionType: 'pahm_beginner',
          quality: isCompleted ? 8 : 6,
          userId: currentUser.uid,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: new Date().toISOString()
          },
          version: '3.0_firebase_only'
        }
      };
      
      // ✅ FIREBASE-ONLY: Save to Firebase via PracticeContext
      await addPracticeSession(sessionData);
      console.log('✅ PAHM Beginner session saved to Firebase');
      
      // ✅ Pass session data to parent component
      onRecordSession(sessionData);
      
    } catch (error) {
      console.error('❌ Error saving PAHM session to Firebase:', error);
      alert('Failed to save practice session. Please check your connection and try again.');
      throw error;
    }
  }, [addPracticeSession, currentUser, onRecordSession]);
  
  // ✅ FIREBASE-ONLY: Attach recordSession to window for legacy component compatibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).recordPAHMSession = recordSession;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).recordPAHMSession;
      }
    };
  }, [recordSession]);
  
  // This component doesn't render anything visible
  return null;
};

export default PAHMBeginnerPracticeRecorder;
export { PAHMBeginnerPracticeRecorder };