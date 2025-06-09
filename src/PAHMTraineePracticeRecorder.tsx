import React from 'react';

interface PAHMTraineePracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * PAHMTraineePracticeRecorder - Handles recording of PAHM Trainee practice sessions
 * 
 * This component is responsible for recording practice data for PAHM Trainee stage (Stage 2),
 * separate from the progression logic.
 */
const PAHMTraineePracticeRecorder: React.FC<PAHMTraineePracticeRecorderProps> = ({ onRecordSession }) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    const sessionData = {
      stage: 2,
      stageName: 'PAHM Trainee',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      pahmCounts: pahmCounts,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('stage2Sessions') || '[]');
    localStorage.setItem('stage2Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // Always record the session data regardless of completion
    sessionStorage.setItem('lastPAHMSession', JSON.stringify(sessionData));
    
    // If session was fully completed, mark Stage 2 as complete for progression
    if (isCompleted) {
      localStorage.setItem('stage2Complete', 'true');
      sessionStorage.setItem('stageProgress', '2');
    }
    
    // Pass session data to parent component
    onRecordSession(sessionData);
  };
  
  // This component doesn't render anything visible
  return null;
};

export default PAHMTraineePracticeRecorder;
