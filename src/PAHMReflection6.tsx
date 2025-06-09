import React from 'react';
import PAHMReflectionShared from './PAHMReflectionShared';

interface PAHMReflection6Props {
  onComplete: () => void;
  onBack: () => void;
}

const PAHMReflection6: React.FC<PAHMReflection6Props> = ({
  onComplete,
  onBack
}) => {
  // Get PAHM tracking data from session storage
  const rawPahmData = JSON.parse(sessionStorage.getItem('pahmTracking') || '{}');
  
  // Map the PAHM matrix data to the format expected by PAHMReflectionShared
  const pahmTrackingData = {
    // Present
    presentAttachment: rawPahmData.likes || 0,
    presentNeutral: rawPahmData.present || 0,
    presentAversion: rawPahmData.dislikes || 0,
    
    // Past
    pastAttachment: rawPahmData.nostalgia || 0,
    pastNeutral: rawPahmData.past || 0,
    pastAversion: rawPahmData.regret || 0,
    
    // Future
    futureAttachment: rawPahmData.anticipation || 0,
    futureNeutral: rawPahmData.future || 0,
    futureAversion: rawPahmData.worry || 0
  };
  
  // Get practice duration
  const startTime = new Date(sessionStorage.getItem('practiceStartTime') || new Date().toISOString());
  const endTime = new Date(sessionStorage.getItem('practiceEndTime') || new Date().toISOString());
  const practiceDuration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
  
  // Get posture
  const posture = sessionStorage.getItem('currentPosture') || 'Not recorded';
  
  // Set stage progress in sessionStorage for journey bar
  const handleComplete = () => {
    // Update to stage 6 completion
    sessionStorage.setItem('stageProgress', '6');
    onComplete();
  };
  
  return (
    <PAHMReflectionShared
      stageLevel="Stage 6"
      stageName="PAHM Illuminator"
      duration={practiceDuration}
      posture={posture}
      pahmData={pahmTrackingData}
      onComplete={handleComplete}
      onBack={onBack}
    />
  );
};

export default PAHMReflection6;
