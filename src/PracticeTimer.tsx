import React, { useState, useEffect, useRef } from 'react';
import './PracticeTimer.css';
import { PAHMCounts } from './types/PAHMTypes';
import T1PracticeRecorder from './T1PracticeRecorder';
import T2PracticeRecorder from './T2PracticeRecorder';
import T3PracticeRecorder from './T3PracticeRecorder';
import T4PracticeRecorder from './T4PracticeRecorder';
import T5PracticeRecorder from './T5PracticeRecorder';

interface PracticeTimerProps {
  initialMinutes: number;
  stageLevel: string;
  onComplete: () => void;
  onBack: () => void;
}

const PracticeTimer: React.FC<PracticeTimerProps> = ({
  initialMinutes,
  stageLevel,
  onComplete,
  onBack
}) => {
  // Timer states
  const [timeRemaining, setTimeRemaining] = useState<number>(initialMinutes * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  
  // Refs for recorder components
  const t1RecorderRef = useRef<any>(null);
  const t2RecorderRef = useRef<any>(null);
  const t3RecorderRef = useRef<any>(null);
  const t4RecorderRef = useRef<any>(null);
  const t5RecorderRef = useRef<any>(null);
  
  // Ref for interval
  const timerInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Extract T-level from stageLevel (e.g., "T1: Physical Stillness for 10 minutes")
  const getTLevel = (): string => {
    const tLevelMatch = stageLevel.match(/^(T[1-5])/i);
    return tLevelMatch ? tLevelMatch[1].toLowerCase() : 't1';
  };
  
  // Start timer
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    
    // Store start time
    const now = new Date().toISOString();
    setSessionStartTime(now);
    sessionStorage.setItem('practiceStartTime', now);
    
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    timerInterval.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval.current as NodeJS.Timeout);
          // Session completed naturally - mark as fully completed
          recordSession(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  // Pause timer
  const pauseTimer = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    setIsPaused(true);
  };
  
  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false);
    startTimer();
  };
  
  // Handle back button
  const handleBack = () => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    onBack();
  };
  
  // Record session data using the appropriate recorder
  const recordSession = (isFullyCompleted: boolean) => {
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
    }
    
    // Calculate time spent
    const startTime = sessionStartTime || new Date().toISOString();
    const endTime = new Date().toISOString();
    sessionStorage.setItem('practiceEndTime', endTime);
    
    // Calculate time spent in minutes (or use initialMinutes if session wasn't started)
    const timeSpentMs = sessionStartTime 
      ? new Date(endTime).getTime() - new Date(startTime).getTime() 
      : 0;
    const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60));
    
    // Store basic session data
    const tLevel = getTLevel();
    const sessionData = {
      level: tLevel,
      targetDuration: initialMinutes,
      timeSpent: timeSpentMinutes || 0,
      isCompleted: isFullyCompleted,
      completedAt: endTime
    };
    
    // Store in sessionStorage for reflection component
    sessionStorage.setItem('lastPracticeData', JSON.stringify(sessionData));
    
    // Only mark as complete for progression if fully completed
    if (isFullyCompleted) {
      localStorage.setItem(`${tLevel}Complete`, 'true');
    }
    
    // Call onComplete to navigate to reflection
    onComplete();
  };
  
  // Handle skip (early completion)
  const handleSkip = () => {
    // Record session but mark as not fully completed
    recordSession(false);
  };
  
  // Fast forward for development purposes
  const handleFastForward = () => {
    // Record session and mark as fully completed for development
    const tLevel = getTLevel();
    
    // Store start and end time
    const now = new Date().toISOString();
    sessionStorage.setItem('practiceStartTime', now);
    sessionStorage.setItem('practiceEndTime', now);
    
    // Mark this T-level as complete in localStorage for progression
    localStorage.setItem(`${tLevel}Complete`, 'true');
    
    // Store practice data with fastForwarded flag
    const sessionData = {
      level: tLevel,
      targetDuration: initialMinutes,
      timeSpent: initialMinutes, // Assume full time for development
      isCompleted: true,
      completedAt: now,
      fastForwarded: true
    };
    
    // Store in sessionStorage for reflection component
    sessionStorage.setItem('lastPracticeData', JSON.stringify(sessionData));
    
    // Log for development purposes
    console.log(`DEV: Fast-forwarded ${tLevel} practice session`);
    
    // Call onComplete to navigate to reflection
    onComplete();
  };
  
  // Handle session recording via appropriate recorder component
  const handleRecordSession = (sessionData: any) => {
    // This function will be called by the recorder component
    console.log('Session recorded:', sessionData);
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);
  
  return (
    <div className="practice-timer">
      {/* Include all recorder components but hide them */}
      <div style={{ display: 'none' }}>
        <T1PracticeRecorder onRecordSession={handleRecordSession} ref={t1RecorderRef} />
        <T2PracticeRecorder onRecordSession={handleRecordSession} ref={t2RecorderRef} />
        <T3PracticeRecorder onRecordSession={handleRecordSession} ref={t3RecorderRef} />
        <T4PracticeRecorder onRecordSession={handleRecordSession} ref={t4RecorderRef} />
        <T5PracticeRecorder onRecordSession={handleRecordSession} ref={t5RecorderRef} />
      </div>
      
      <div className="timer-header">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h1>{stageLevel}</h1>
        <div style={{ width: '40px' }}></div> {/* Empty div for balanced spacing */}
      </div>
      
      <div className="timer-content">
        <div className="timer-display">
          <div className="time-remaining">{formatTime(timeRemaining)}</div>
          <div className="timer-instruction">
            {!isActive 
              ? "Press Start when you're ready to begin" 
              : isPaused 
                ? "Practice paused" 
                : "Maintain physical stillness"}
          </div>
        </div>
        
        <div className="timer-controls">
          {!isActive ? (
            <button className="start-button" onClick={startTimer}>
              Start Practice
            </button>
          ) : isPaused ? (
            <button className="resume-button" onClick={resumeTimer}>
              Resume
            </button>
          ) : (
            <button className="pause-button" onClick={pauseTimer}>
              Pause
            </button>
          )}
          
          {isActive && !isPaused && (
            <button className="complete-button" onClick={handleSkip} style={{
              backgroundColor: '#4A67E3', 
              color: 'white',
              padding: '10px 20px',
              borderRadius: '25px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Complete Practice
            </button>
          )}
        </div>
      </div>
      
      {/* Development-only fast-forward button */}
      {process.env.NODE_ENV !== 'production' && (
        <button 
          onClick={handleFastForward}
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: '#FF5252',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            border: 'none',
            fontSize: '12px',
            cursor: 'pointer',
            zIndex: 1000,
            opacity: 0.8
          }}
        >
          DEV: Fast-Forward
        </button>
      )}
    </div>
  );
};

export default PracticeTimer;
