import React, { forwardRef, useImperativeHandle } from 'react';

interface T4PracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * T4PracticeRecorder - Handles recording of T4 practice sessions
 * 
 * This component is responsible for recording practice data for T4 stage,
 * separate from the progression logic.
 */
const T4PracticeRecorder = forwardRef<any, T4PracticeRecorderProps>(({ onRecordSession }, ref) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean
  ) => {
    const sessionData = {
      level: 't4',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('t4Sessions') || '[]');
    localStorage.setItem('t4Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // If session was fully completed, mark T4 as complete for progression
    if (isCompleted) {
      localStorage.setItem('t4Complete', 'true');
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

export default T4PracticeRecorder;
