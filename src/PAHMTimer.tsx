import React, { useState, useEffect, useCallback } from 'react';
import './PAHMTimer.css';
import PAHMMatrix from './PAHMMatrix';
import { PAHMCounts } from './types/PAHMTypes';

interface PAHMTimerProps {
  initialMinutes: number;
  stageLevel: string;
  onComplete: (pahmCounts: PAHMCounts) => void;
  onBack: () => void;
}

const PAHMTimer: React.FC<PAHMTimerProps> = ({
  initialMinutes,
  stageLevel,
  onComplete,
  onBack
}) => {
  // Timer states
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSetup, setIsSetup] = useState<boolean>(true);
  const [customMinutes, setCustomMinutes] = useState<number>(initialMinutes);
  const [customInput, setCustomInput] = useState<string>("");
  
  // PAHM tracking states
  const [pahmCounts, setPahmCounts] = useState<PAHMCounts>({
    nostalgia: 0,
    likes: 0,
    anticipation: 0,
    past: 0,
    present: 0,
    future: 0,
    regret: 0,
    dislikes: 0,
    worry: 0
  });
  
  // Handle PAHM position updates
  const handlePAHMCountUpdate = useCallback((position: string, count: number) => {
    setPahmCounts(prevCounts => {
      // Create a copy of the previous counts
      const newCounts = { ...prevCounts };
      
      // Update the specific position count
      if (position in newCounts) {
        newCounts[position as keyof PAHMCounts] = count;
      }
      
      return newCounts;
    });
  }, []);
  
  // Handle custom duration input
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    
    // Update customMinutes if valid number
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomMinutes(Math.max(numValue, 30)); // Ensure minimum 30 minutes
    }
  };
  
  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer complete
          if (interval) clearInterval(interval);
          setIsRunning(false);
          onComplete(pahmCounts);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, minutes, seconds, onComplete, pahmCounts]);
  
  // Start practice with custom duration
  const handleStartPractice = () => {
    // Ensure minimum 30 minutes for PAHM stages
    const finalMinutes = Math.max(customMinutes, 30);
    setMinutes(finalMinutes);
    setSeconds(0);
    setIsRunning(true);
    setIsSetup(false);
  };
  
  // Toggle pause/resume
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };
  
  // Skip to reflection
  const handleSkipToReflection = () => {
    onComplete(pahmCounts);
  };
  
  // Format time as MM:SS
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render setup screen
  if (isSetup) {
    return (
      <div className="pahm-timer setup-mode">
        <div className="timer-header">
          <button className="back-button" onClick={onBack}>
            Back
          </button>
          <h1>{stageLevel}</h1>
          <div className="placeholder"></div>
        </div>
        
        <div className="timer-content">
          <div className="timer-display">
            {formatTime(customMinutes, 0)}
          </div>
          
          <p className="timer-instruction">Press Start when you're ready to begin</p>
          
          <div className="duration-selector">
            <p>Select Duration (minimum 30 minutes):</p>
            <div className="duration-buttons">
              <button 
                className={customMinutes === 30 && customInput === "" ? 'active' : ''}
                onClick={() => {
                  setCustomMinutes(30);
                  setCustomInput("");
                }}
              >
                30 min
              </button>
              <button 
                className={customMinutes === 45 && customInput === "" ? 'active' : ''}
                onClick={() => {
                  setCustomMinutes(45);
                  setCustomInput("");
                }}
              >
                45 min
              </button>
              <button 
                className={customMinutes === 60 && customInput === "" ? 'active' : ''}
                onClick={() => {
                  setCustomMinutes(60);
                  setCustomInput("");
                }}
              >
                60 min
              </button>
              <button 
                className={customMinutes === 90 && customInput === "" ? 'active' : ''}
                onClick={() => {
                  setCustomMinutes(90);
                  setCustomInput("");
                }}
              >
                90 min
              </button>
            </div>
            
            <div className="custom-duration">
              <label htmlFor="custom-minutes">Custom duration (minutes):</label>
              <input
                id="custom-minutes"
                type="number"
                min="30"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder="Enter minutes (min 30)"
              />
            </div>
          </div>
          
          <button className="start-button" onClick={handleStartPractice}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }
  
  // Render active timer
  return (
    <div className="pahm-timer">
      <div className="timer-header">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <h1>{stageLevel}</h1>
        <div className="placeholder"></div>
      </div>
      
      <div className="timer-content">
        <div className="timer-display">
          {formatTime(minutes, seconds)}
        </div>
        
        <p className="timer-instruction">
          {isPaused ? 'Timer paused' : 'Maintain Physical Stillness'}
        </p>
        
        <div className="pahm-tracking">
          <h2>Track Your Attention</h2>
          <p>Tap the position that matches your current state of attention</p>
          
          <PAHMMatrix 
            initialCounts={pahmCounts}
            onCountUpdate={handlePAHMCountUpdate}
          />
        </div>
        
        <button className="pause-resume-button" onClick={handlePauseResume}>
          {isPaused ? 'Resume' : 'Pause'}
        </button>
        
        <button className="skip-button" onClick={handleSkipToReflection}>
          Skip to Reflection
        </button>
      </div>
    </div>
  );
};

export default PAHMTimer;
