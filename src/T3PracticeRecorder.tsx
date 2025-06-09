import React, { forwardRef, useImperativeHandle } from 'react';

interface T3PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T3PracticeRecorder - Handles recording of T3 practice sessions
 * 
 * This component is responsible for recording practice data for T3 stage,
 * separate from the progression logic.
 */
const T3PracticeRecorder = forwardRef<any, T3PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    const sessionData = {
      level: 't3',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('t3Sessions') || '[]');
    localStorage.setItem('t3Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // If session was fully completed, mark T3 as complete for progression
    if (isCompleted) {
      localStorage.setItem('t3Complete', 'true');
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

export default T3PracticeRecorder;
