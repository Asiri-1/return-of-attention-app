import React, { useState } from 'react';
import './DevPanel.css';

interface DevPanelProps {
  onClose: () => void;
}

const DevPanel: React.FC<DevPanelProps> = ({ onClose }) => {
  const [resetStatus, setResetStatus] = useState<string>('');
  
  // Reset all application data
  const resetAllData = () => {
    // Store a backup of the current user authentication if needed
    const currentUser = localStorage.getItem('currentUser');
    
    // Clear all localStorage items
    localStorage.clear();
    
    // Clear all sessionStorage items
    sessionStorage.clear();
    
    // Set default stage to 1
    localStorage.setItem('devCurrentStage', '1');
    
    // Restore current user if needed
    if (currentUser) {
      localStorage.setItem('currentUser', currentUser);
    }
    
    setResetStatus('All application data has been reset.');
    
    // Reload the page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  
  // Reset onboarding data
  const resetOnboarding = () => {
    // Clear onboarding-related items
    localStorage.removeItem('onboardingComplete');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('initialAssessment');
    
    setResetStatus('Onboarding data has been reset.');
  };
  
  // Reset specific stage data
  const resetStage = (stageNumber: number) => {
    // Reset stage-specific data
    if (stageNumber === 1) {
      // Reset T1-T5 progress
      sessionStorage.removeItem('currentTLevel');
      localStorage.removeItem('t1Complete');
      localStorage.removeItem('t2Complete');
      localStorage.removeItem('t3Complete');
      localStorage.removeItem('t4Complete');
      localStorage.removeItem('t5Complete');
      
      setResetStatus('Stage 1 (Seeker) data has been reset.');
    } else {
      // Reset PAHM stage data
      sessionStorage.removeItem(`stage${stageNumber}Complete`);
      sessionStorage.removeItem(`pahm${stageNumber}Tracking`);
      
      // If resetting current or higher stage, update progress
      const currentStage = parseInt(localStorage.getItem('devCurrentStage') || '1', 10);
      if (stageNumber <= currentStage) {
        localStorage.setItem('devCurrentStage', (stageNumber - 1).toString());
        sessionStorage.setItem('stageProgress', (stageNumber - 1).toString());
      }
      
      setResetStatus(`Stage ${stageNumber} data has been reset.`);
    }
  };
  
  // Reset timer data
  const resetTimerData = () => {
    // Clear timer-related data
    sessionStorage.removeItem('practiceStartTime');
    sessionStorage.removeItem('practiceEndTime');
    sessionStorage.removeItem('pahmTracking');
    sessionStorage.removeItem('timerDuration');
    
    setResetStatus('Timer data has been reset.');
  };
  
  // Reset self-assessment data
  const resetAssessmentData = () => {
    // Clear assessment-related data
    localStorage.removeItem('assessmentResults');
    localStorage.removeItem('lastAssessment');
    sessionStorage.removeItem('currentAssessment');
    
    setResetStatus('Assessment data has been reset.');
  };
  
  return (
    <div className="dev-panel">
      <div className="dev-panel-header">
        <h2>Developer Tools</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      <div className="dev-panel-content">
        <div className="dev-panel-section">
          <h3>Global Reset</h3>
          <button 
            className="dev-button danger"
            onClick={resetAllData}
          >
            Reset All Application Data
          </button>
        </div>
        
        <div className="dev-panel-section">
          <h3>Onboarding</h3>
          <button 
            className="dev-button"
            onClick={resetOnboarding}
          >
            Reset Onboarding Data
          </button>
        </div>
        
        <div className="dev-panel-section">
          <h3>Stage Reset</h3>
          <div className="button-grid">
            <button className="dev-button" onClick={() => resetStage(1)}>Reset Stage 1 (Seeker)</button>
            <button className="dev-button" onClick={() => resetStage(2)}>Reset Stage 2 (Trainee)</button>
            <button className="dev-button" onClick={() => resetStage(3)}>Reset Stage 3 (Beginner)</button>
            <button className="dev-button" onClick={() => resetStage(4)}>Reset Stage 4 (Practitioner)</button>
            <button className="dev-button" onClick={() => resetStage(5)}>Reset Stage 5 (Master)</button>
            <button className="dev-button" onClick={() => resetStage(6)}>Reset Stage 6 (Illuminator)</button>
          </div>
        </div>
        
        <div className="dev-panel-section">
          <h3>T-Level Reset</h3>
          <div className="button-grid">
            <button className="dev-button" onClick={() => {
              // Clear T5 completion flags
              localStorage.removeItem('t5Completed');
              sessionStorage.removeItem('t5Completed');
              
              // Reset T level to T1
              localStorage.setItem('currentTLevel', 't1');
              sessionStorage.setItem('currentTLevel', 't1');
              
              // Reset stage progress if needed
              const currentStage = parseInt(localStorage.getItem('devCurrentStage') || '1', 10);
              if (currentStage > 1) {
                localStorage.setItem('devCurrentStage', '1');
                sessionStorage.setItem('stageProgress', '1');
              }
              
              setResetStatus('T5 completion status has been reset.');
              
              // Force page reload to ensure UI updates
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }}>Reset T5 Completion</button>
          </div>
        </div>
        
        <div className="dev-panel-section">
          <h3>Other Data</h3>
          <div className="button-grid">
            <button className="dev-button" onClick={resetTimerData}>Reset Timer Data</button>
            <button className="dev-button" onClick={resetAssessmentData}>Reset Assessment Data</button>
          </div>
        </div>
        
        {resetStatus && (
          <div className="status-message">
            {resetStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default DevPanel;
