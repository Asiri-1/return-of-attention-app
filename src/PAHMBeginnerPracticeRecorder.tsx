import React from 'react';

interface PAHMBeginnerPracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * PAHMBeginnerPracticeRecorder - Handles recording of PAHM Beginner practice sessions
 * 
 * This component is responsible for recording practice data for PAHM Beginner stage (Stage 3),
 * separate from the progression logic.
 */
const PAHMBeginnerPracticeRecorder: React.FC<PAHMBeginnerPracticeRecorderProps> = ({ onRecordSession }) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    const sessionData = {
      stage: 3,
      stageName: 'PAHM Beginner',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      pahmCounts: pahmCounts,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('stage3Sessions') || '[]');
    localStorage.setItem('stage3Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // Always record the session data regardless of completion
    sessionStorage.setItem('lastPAHMSession', JSON.stringify(sessionData));
    
    // If session was fully completed, mark Stage 3 as complete for progression
    if (isCompleted) {
      localStorage.setItem('stage3Complete', 'true');
      sessionStorage.setItem('stageProgress', '3');
    }
    
    // Pass session data to parent component
    onRecordSession(sessionData);
  };
  
  // This component doesn't render anything visible
  return null;
};

export default PAHMBeginnerPracticeRecorder;
