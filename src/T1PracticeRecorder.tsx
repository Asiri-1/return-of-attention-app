import React, { forwardRef, useImperativeHandle } from 'react';

interface T1PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T1PracticeRecorder - Handles recording of T1 practice sessions
 * 
 * This component is responsible for recording practice data for T1 stage,
 * separate from the progression logic.
 */
const T1PracticeRecorder = forwardRef<any, T1PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    const sessionData = {
      level: 't1',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('t1Sessions') || '[]');
    localStorage.setItem('t1Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // If session was fully completed, mark T1 as complete for progression
    if (isCompleted) {
      localStorage.setItem('t1Complete', 'true');
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

export default T1PracticeRecorder;
