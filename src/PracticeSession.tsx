import React, { useState, useEffect } from 'react';
import './PracticeSession.css';

interface PracticeSessionProps {
  onComplete?: () => void;
  onPause?: () => void;
  onBack?: () => void;
}

const PracticeSession: React.FC<PracticeSessionProps> = ({ 
  onComplete = () => {}, 
  onPause = () => {},
  onBack = () => {}
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(15 * 60); // 15 minutes in seconds
  const [isPaused, setIsPaused] = useState<boolean>(false);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (!isPaused && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPaused, timeRemaining]);
  
  // Handle pause/resume
  const handlePauseResume = () => {
    setIsPaused(prev => !prev);
    if (onPause) onPause();
  };
  
  // Handle complete
  const handleComplete = () => {
    if (onComplete) onComplete();
  };
  
  return (
    <div className="practice-session">
      <div className="practice-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Practice Session</h1>
      </div>
      
      <div className="practice-content">
        <div className="timer">{formatTime(timeRemaining)}</div>
        <div className="practice-stage">Stage 1: Present Attention</div>
        <p className="practice-instruction">
          Focus on your breath. Notice the sensation of breathing in and out.
          When your mind wanders, gently bring it back to your breath.
        </p>
        
        <div className="practice-controls">
          <button className="control-button pause" onClick={handlePauseResume}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          <button className="control-button complete" onClick={handleComplete}>
            Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default PracticeSession;
