import React, { useState, useEffect } from 'react';
import './PAHMProgressTracker.css';

interface PAHMProgressTrackerProps {
  currentStage: number;
}

const PAHMProgressTracker: React.FC<PAHMProgressTrackerProps> = ({ currentStage }) => {
  // State to track hours completed for each stage
  const [stageHours, setStageHours] = useState<{[key: string]: number}>({
    stage2: 0,
    stage3: 0,
    stage4: 0,
    stage5: 0,
    stage6: 0
  });
  
  // State to track completion status
  const [stageComplete, setStageComplete] = useState<{[key: string]: boolean}>({
    stage2: false,
    stage3: false,
    stage4: false,
    stage5: false,
    stage6: false
  });
  
  // Load hours and completion status from localStorage on component mount
  useEffect(() => {
    const stage2Hours = parseFloat(localStorage.getItem('stage2Hours') || '0');
    const stage3Hours = parseFloat(localStorage.getItem('stage3Hours') || '0');
    const stage4Hours = parseFloat(localStorage.getItem('stage4Hours') || '0');
    const stage5Hours = parseFloat(localStorage.getItem('stage5Hours') || '0');
    const stage6Hours = parseFloat(localStorage.getItem('stage6Hours') || '0');
    
    setStageHours({
      stage2: stage2Hours,
      stage3: stage3Hours,
      stage4: stage4Hours,
      stage5: stage5Hours,
      stage6: stage6Hours
    });
    
    const stage2Complete = localStorage.getItem('stage2Complete') === 'true';
    const stage3Complete = localStorage.getItem('stage3Complete') === 'true';
    const stage4Complete = localStorage.getItem('stage4Complete') === 'true';
    const stage5Complete = localStorage.getItem('stage5Complete') === 'true';
    const stage6Complete = localStorage.getItem('stage6Complete') === 'true';
    
    setStageComplete({
      stage2: stage2Complete,
      stage3: stage3Complete,
      stage4: stage4Complete,
      stage5: stage5Complete,
      stage6: stage6Complete
    });
  }, []);
  
  // Format hours display
  const formatHours = (hours: number): string => {
    return hours.toFixed(1);
  };
  
  // Calculate progress percentage (capped at 100%)
  const calculateProgress = (hours: number): number => {
    return Math.min(100, (hours / 15) * 100);
  };
  
  // Get stage name
  const getStageName = (stageNumber: number): string => {
    switch(stageNumber) {
      case 2: return 'PAHM Trainee';
      case 3: return 'PAHM Beginner';
      case 4: return 'PAHM Practitioner';
      case 5: return 'PAHM Master';
      case 6: return 'PAHM Illuminator';
      default: return '';
    }
  };
  
  // Determine if a stage is unlocked
  const isStageUnlocked = (stageNumber: number): boolean => {
    if (stageNumber === 2) return true; // First PAHM stage is always unlocked
    return stageComplete[`stage${stageNumber - 1}`] || currentStage >= stageNumber;
  };
  
  return (
    <div className="pahm-progress-tracker">
      <h3>PAHM Practice Progress</h3>
      <p className="progress-description">Each PAHM stage requires 15 hours of practice to complete.</p>
      
      <div className="stage-progress-list">
        {[2, 3, 4, 5, 6].map(stageNumber => {
          const stageKey = `stage${stageNumber}` as keyof typeof stageHours;
          const hours = stageHours[stageKey];
          const isComplete = stageComplete[stageKey];
          const isUnlocked = isStageUnlocked(stageNumber);
          const isCurrent = currentStage === stageNumber;
          
          return (
            <div 
              key={stageNumber}
              className={`stage-progress-item ${isComplete ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}`}
            >
              <div className="stage-header">
                <div className="stage-number">{stageNumber}</div>
                <div className="stage-name">{getStageName(stageNumber)}</div>
                <div className="stage-hours">
                  {formatHours(hours)}/15 hours
                  {isComplete && <span className="completion-check">✓</span>}
                </div>
              </div>
              
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${calculateProgress(hours)}%` }}
                />
              </div>
              
              {!isUnlocked && (
                <div className="lock-overlay">
                  <span className="lock-icon">🔒</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PAHMProgressTracker;
