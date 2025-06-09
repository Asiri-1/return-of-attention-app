import React from 'react';

interface PAHMMasterPracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * PAHMMasterPracticeRecorder - Handles recording of PAHM Master practice sessions
 * 
 * This component is responsible for recording practice data for PAHM Master stage (Stage 5),
 * separate from the progression logic.
 */
const PAHMMasterPracticeRecorder: React.FC<PAHMMasterPracticeRecorderProps> = ({ onRecordSession }) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    const sessionData = {
      stage: 5,
      stageName: 'PAHM Master',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      pahmCounts: pahmCounts,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('stage5Sessions') || '[]');
    localStorage.setItem('stage5Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // Always record the session data regardless of completion
    sessionStorage.setItem('lastPAHMSession', JSON.stringify(sessionData));
    
    // If session was fully completed, mark Stage 5 as complete for progression
    if (isCompleted) {
      localStorage.setItem('stage5Complete', 'true');
      sessionStorage.setItem('stageProgress', '5');
    }
    
    // Pass session data to parent component
    onRecordSession(sessionData);
  };
  
  // This component doesn't render anything visible
  return null;
};

export default PAHMMasterPracticeRecorder;
