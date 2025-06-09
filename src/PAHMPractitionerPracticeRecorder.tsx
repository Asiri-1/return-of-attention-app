import React from 'react';

interface PAHMPractitionerPracticeRecorderProps {
  onRecordSession: (sessionData: any) => void;
}

/**
 * PAHMPractitionerPracticeRecorder - Handles recording of PAHM Practitioner practice sessions
 * 
 * This component is responsible for recording practice data for PAHM Practitioner stage (Stage 4),
 * separate from the progression logic.
 */
const PAHMPractitionerPracticeRecorder: React.FC<PAHMPractitionerPracticeRecorderProps> = ({ onRecordSession }) => {
  
  // Record a practice session
  const recordSession = (
    duration: number, 
    timeSpent: number, 
    isCompleted: boolean,
    pahmCounts: any
  ) => {
    const sessionData = {
      stage: 4,
      stageName: 'PAHM Practitioner',
      targetDuration: duration,
      timeSpent: timeSpent,
      isCompleted: isCompleted,
      pahmCounts: pahmCounts,
      timestamp: new Date().toISOString()
    };
    
    // Store session data in localStorage for history
    const previousSessions = JSON.parse(localStorage.getItem('stage4Sessions') || '[]');
    localStorage.setItem('stage4Sessions', JSON.stringify([...previousSessions, sessionData]));
    
    // Always record the session data regardless of completion
    sessionStorage.setItem('lastPAHMSession', JSON.stringify(sessionData));
    
    // If session was fully completed, mark Stage 4 as complete for progression
    if (isCompleted) {
      localStorage.setItem('stage4Complete', 'true');
      sessionStorage.setItem('stageProgress', '4');
    }
    
    // Pass session data to parent component
    onRecordSession(sessionData);
  };
  
  // This component doesn't render anything visible
  return null;
};

export default PAHMPractitionerPracticeRecorder;
