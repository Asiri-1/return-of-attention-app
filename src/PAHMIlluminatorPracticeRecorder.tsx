import React from 'react';

interface PAHMIlluminatorPracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * PAHMIlluminatorPracticeRecorder - Handles recording of PAHM Illuminator practice sessions
 * 
 * This component is responsible for recording practice data for PAHM Illuminator stage (Stage 6),
 * separate from the progression logic.
 */
const PAHMIlluminatorPracticeRecorder: React.FC<PAHMIlluminatorPracticeRecorderProps> = ({ onRecordSession }) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    const sessionData = {
      stage: 6,
      stageName: 'PAHM Illuminator',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      pahmCounts: pahmCounts,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('stage6Sessions') || '[]');
    localStorage.setItem('stage6Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // Always record the session data regardless of completion
    sessionStorage.setItem('lastPAHMSession', JSON.stringify(sessionData));
    
    // If session was fully completed, mark Stage 6 as complete for progression
    if (isCompleted) {
      localStorage.setItem('stage6Complete', 'true');
      sessionStorage.setItem('stageProgress', '6');
    }
    
    // Pass session data to parent component
    onRecordSession(sessionData);
  };
  
  // This component doesn't render anything visible
  return null;
};

export default PAHMIlluminatorPracticeRecorder;
