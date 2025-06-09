import React, { forwardRef, useImperativeHandle } from 'react';

interface T5PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T5PracticeRecorder - Handles recording of T5 practice sessions
 * 
 * This component is responsible for recording practice data for T5 stage,
 * separate from the progression logic.
 */
const T5PracticeRecorder = forwardRef<any, T5PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    const sessionData = {
      level: 't5',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('t5Sessions') || '[]');
    localStorage.setItem('t5Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // If session was fully completed, mark T5 as complete for progression
    if (isCompleted) {
      localStorage.setItem('t5Complete', 'true');
    }
    
    // Pass session data to parent component
    onRecordSession(sessionData);
  };
  
  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    recordSession
  }));
  
  // This component doesn't render anything visible
  return null;
});

export default T5PracticeRecorder;
