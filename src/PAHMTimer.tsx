import React, { useState, useEffect, useCallback } from 'react';
import './PAHMTimer.css';
import PAHMMatrix from './PAHMMatrix';
import { PAHMCounts } from './types/PAHMTypes';
import { useLocalData } from './contexts/LocalDataContext'; // ✨ ONLY NEW IMPORT

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
  // ✨ ONLY NEW LINE: LocalDataContext hooks (background functionality)
  const { addPracticeSession, addEmotionalNote } = useLocalData();

  // Timer states (UNCHANGED)
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSetup, setIsSetup] = useState<boolean>(true);
  const [customMinutes, setCustomMinutes] = useState<number>(initialMinutes);
  const [customInput, setCustomInput] = useState<string>("");
  
  // PAHM tracking states (UNCHANGED)
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

  // ✨ NEW: Background helper functions (no UI impact)
  const saveToAnalytics = useCallback((completed: boolean = true) => {
    try {
      const endTime = new Date().toISOString();
      const actualDuration = completed ? initialMinutes : (initialMinutes - minutes - (seconds / 60));
      const totalInteractions = Object.values(pahmCounts).reduce((sum, count) => sum + count, 0);
      
      // Convert PAHM counts to storage format
      const convertedPAHMCounts = {
        present_attachment: pahmCounts.likes,
        present_neutral: pahmCounts.present,
        present_aversion: pahmCounts.dislikes,
        past_attachment: pahmCounts.nostalgia,
        past_neutral: pahmCounts.past,
        past_aversion: pahmCounts.regret,
        future_attachment: pahmCounts.anticipation,
        future_neutral: pahmCounts.future,
        future_aversion: pahmCounts.worry
      };

      // Calculate present percentage
      const presentMomentCounts = pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes;
      const presentPercentage = totalInteractions > 0 ? Math.round((presentMomentCounts / totalInteractions) * 100) : 85;
      
      // Calculate session quality
      let sessionQuality = 7;
      if (presentPercentage >= 80) sessionQuality += 1.5;
      else if (presentPercentage >= 60) sessionQuality += 1;
      else if (presentPercentage < 40) sessionQuality -= 1;
      if (completed) sessionQuality += 0.5;
      sessionQuality = Math.min(10, Math.max(1, Math.round(sessionQuality * 10) / 10));

      // Determine stage level
      let stageNumber = 2;
      if (stageLevel.includes('Stage 1') || stageLevel.includes('T1')) stageNumber = 1;
      else if (stageLevel.includes('Stage 3') || stageLevel.includes('T3')) stageNumber = 3;
      else if (stageLevel.includes('Stage 4') || stageLevel.includes('T4')) stageNumber = 4;
      else if (stageLevel.includes('Stage 5') || stageLevel.includes('T5')) stageNumber = 5;
      else if (stageLevel.includes('Stage 6') || stageLevel.includes('T6')) stageNumber = 6;

      // Save session to LocalDataContext
      addPracticeSession({
        timestamp: endTime,
        duration: Math.round(actualDuration),
        sessionType: 'meditation' as const,
        stageLevel: stageNumber,
        stageLabel: stageLevel,
        rating: sessionQuality,
        notes: `PAHM practice session with ${totalInteractions} attention observations. ${presentPercentage}% present-moment awareness.`,
        presentPercentage,
        environment: {
          posture: sessionStorage.getItem('currentPosture') || 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: convertedPAHMCounts
      });

      // Add emotional note
      addEmotionalNote({
        timestamp: endTime,
        content: `${completed ? 'Completed' : 'Practiced'} ${Math.round(actualDuration)}-minute ${stageLevel} session with ${totalInteractions} mindful observations and ${presentPercentage}% present-moment awareness.`,
        emotion: completed ? 'accomplished' : 'content',
        energyLevel: sessionQuality >= 8 ? 9 : sessionQuality >= 6 ? 7 : 6,
        tags: ['pahm-practice', `stage-${stageNumber}`, 'meditation']
      });

    } catch (error) {
      console.error('Error saving to analytics:', error);
    }
  }, [initialMinutes, minutes, seconds, pahmCounts, stageLevel, addPracticeSession, addEmotionalNote]);
  
  // Handle PAHM position updates (UNCHANGED)
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
  
  // Handle custom duration input (UNCHANGED)
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    
    // Update customMinutes if valid number
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomMinutes(Math.max(numValue, 30)); // Keep original minimum 30 minutes
    }
  };
  
  // Timer logic (ENHANCED: only added background save)
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
          saveToAnalytics(true); // ✨ ONLY NEW LINE: Save to analytics in background
          onComplete(pahmCounts); // Original functionality preserved
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, minutes, seconds, onComplete, pahmCounts, saveToAnalytics]);
  
  // Start practice with custom duration (UNCHANGED)
  const handleStartPractice = () => {
    // Ensure minimum 30 minutes for PAHM stages (UNCHANGED)
    const finalMinutes = Math.max(customMinutes, 30);
    setMinutes(finalMinutes);
    setSeconds(0);
    setIsRunning(true);
    setIsSetup(false);
  };
  
  // Toggle pause/resume (UNCHANGED)
  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };
  
  // Skip to reflection (ENHANCED: only added background save)
  const handleSkipToReflection = () => {
    saveToAnalytics(false); // ✨ ONLY NEW LINE: Save to analytics in background
    onComplete(pahmCounts); // Original functionality preserved
  };
  
  // Format time as MM:SS (UNCHANGED)
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render setup screen (COMPLETELY UNCHANGED)
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
  
  // Render active timer (COMPLETELY UNCHANGED)
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