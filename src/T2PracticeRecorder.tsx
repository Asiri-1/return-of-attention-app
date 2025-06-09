import React, { forwardRef, useImperativeHandle } from 'react';

interface T2PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T2PracticeRecorder - Handles recording of T2 practice sessions
 * 
 * This component is responsible for recording practice data for T2 stage,
 * separate from the progression logic.
 */
const T2PracticeRecorder = forwardRef<any, T2PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    const sessionData = {
      level: 't2',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('t2Sessions') || '[]');
    localStorage.setItem('t2Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // If session was fully completed, mark T2 as complete for progression
    if (isCompleted) {
      localStorage.setItem('t2Complete', 'true');
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

export default T2PracticeRecorder;
