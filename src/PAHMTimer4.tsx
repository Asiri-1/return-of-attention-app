import React, { useState, useEffect, useRef } from 'react';
import './PAHMMatrix.css';
import './PAHMTimer.css';
import PAHMMatrix from './PAHMMatrix';

interface PAHMTimer4Props {
  onComplete: () => void;
  onBack: () => void;
  posture: string;
}

const PAHMTimer4: React.FC<PAHMTimer4Props> = ({
  onComplete,
  onBack,
  posture
}) => {
  const [duration, setDuration] = useState<number>(30); // Default 30 minutes for PAHM stages
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30 * 60); // In seconds
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showTapIndicator, setShowTapIndicator] = useState<boolean>(false);
  
  // Reference to interval timer
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const tapIndicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // PAHM Matrix tracking state
  const [pahmCounts, setPahmCounts] = useState({
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
  
  // Timer effect to count down
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(timerRef.current as NodeJS.Timeout);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (isPaused && timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, isPaused]);
  
  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDuration = parseInt(e.target.value);
    if (newDuration >= 30) { // Minimum 30 minutes for PAHM stages
      setDuration(newDuration);
      setTimeRemaining(newDuration * 60);
    }
  };
  
  // Start timer
  const startTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    // Store start time in session storage
    sessionStorage.setItem('practiceStartTime', new Date().toISOString());
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  // Handle matrix position click
  const handleMatrixPositionClick = (position: string, count: number) => {
    // Update the counts state
    setPahmCounts(prev => ({
      ...prev,
      [position]: count
    }));
    
    // Store updated counts in session storage
    sessionStorage.setItem('pahmTracking', JSON.stringify({
      ...pahmCounts,
      [position]: count
    }));
    
    // Show tap indicator
    setShowTapIndicator(true);
    
    // Clear previous timeout if exists
    if (tapIndicatorTimeoutRef.current) {
      clearTimeout(tapIndicatorTimeoutRef.current);
    }
    
    // Hide indicator after 1 second
    tapIndicatorTimeoutRef.current = setTimeout(() => {
      setShowTapIndicator(false);
    }, 1000);
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Complete practice
  const completePractice = () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear tap indicator timeout if exists
    if (tapIndicatorTimeoutRef.current) {
      clearTimeout(tapIndicatorTimeoutRef.current);
      tapIndicatorTimeoutRef.current = null;
    }
    
    // Store end time and PAHM tracking data
    const endTime = new Date().toISOString();
    sessionStorage.setItem('practiceEndTime', endTime);
    sessionStorage.setItem('pahmTracking', JSON.stringify(pahmCounts));
    
    // Record session data for hour tracking
    recordSessionCompletion(duration);
    
    // Navigate to reflection using the onComplete callback
    // This ensures we use the proper navigation defined in Stage4Wrapper
    onComplete();
  };
  
  // Record session completion for hour tracking
  const recordSessionCompletion = (sessionDuration: number) => {
    // Get existing sessions for stage 4
    const existingSessions = JSON.parse(localStorage.getItem('stage4Sessions') || '[]');
    
    // Create new session data
    const newSession = {
      duration: sessionDuration,
      completedAt: new Date().toISOString(),
      pahmCounts: { ...pahmCounts }
    };
    
    // Add new session to the list
    existingSessions.push(newSession);
    
    // Save updated sessions list
    localStorage.setItem('stage4Sessions', JSON.stringify(existingSessions));
    
    // Calculate total hours completed
    const totalMinutes = existingSessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    // Store total hours for stage 4
    localStorage.setItem('stage4Hours', totalHours.toString());
    
    // Check if stage is complete (15+ hours)
    if (totalHours >= 15) {
      localStorage.setItem('stage4Complete', 'true');
      sessionStorage.setItem('stageProgress', '4');
    }
  };
  
  // Fast-forward a single session (development only)
  const handleFastForwardSession = () => {
    // Record a session with the current duration
    recordSessionCompletion(duration);
    
    // Log for development
    console.log(`DEV: Fast-forwarded a ${duration}-minute session for Stage 4`);
    
    // Navigate to reflection
    onComplete();
  };
  
  // Fast-forward entire stage completion (development only)
  const handleFastForwardStage = () => {
    // Calculate how many 30-minute sessions needed to reach 15 hours
    const sessionsNeeded = Math.ceil((15 * 60) / 30);
    
    // Create array of session data
    const sessions = Array(sessionsNeeded).fill(null).map(() => ({
      duration: 30,
      completedAt: new Date().toISOString(),
      pahmCounts: { ...pahmCounts },
      fastForwarded: true
    }));
    
    // Save all sessions
    localStorage.setItem('stage4Sessions', JSON.stringify(sessions));
    
    // Set total hours to 15
    localStorage.setItem('stage4Hours', '15');
    
    // Mark stage as complete
    localStorage.setItem('stage4Complete', 'true');
    sessionStorage.setItem('stageProgress', '4');
    
    // Log for development
    console.log('DEV: Fast-forwarded entire Stage 4 (15 hours)');
    
    // Navigate to reflection
    onComplete();
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (tapIndicatorTimeoutRef.current) {
        clearTimeout(tapIndicatorTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <div className="pahm-timer">
      <div className="timer-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>PAHM Practitioner Practice</h1>
      </div>
      
      <div className="timer-content">
        {!isRunning ? (
          <div className="timer-setup">
            <h2>Set Practice Duration</h2>
            <p>Minimum duration for PAHM practice is 30 minutes.</p>
            
            <div className="duration-input">
              <input 
                type="number" 
                min="30"
                value={duration}
                onChange={handleDurationChange}
              />
              <span>minutes</span>
            </div>
            
            <div className="posture-display">
              <h3>Selected Posture</h3>
              <p>{posture}</p>
            </div>
            
            <button 
              className="start-button"
              onClick={startTimer}
            >
              Begin Practice
            </button>
          </div>
        ) : (
          <div className="timer-running">
            <div className="pahm-matrix-container">
              <h3>PAHM Matrix</h3>
              
              <p className="matrix-instruction">
                Notice where your attention goes during practice.
                Tap the appropriate quadrant when you recognize a thought.
              </p>
              
              <div className="time-display-container" style={{margin: '15px 0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div className="time-display" style={{fontSize: '36px', fontWeight: 'bold'}}>
                  {formatTime(timeRemaining)}
                </div>
                {showTapIndicator && (
                  <div className="tap-indicator" style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#FF5252',
                    marginLeft: '10px'
                  }}></div>
                )}
              </div>
              
              <PAHMMatrix 
                isInteractive={true} 
                onCountUpdate={handleMatrixPositionClick}
                initialCounts={pahmCounts}
              />
            </div>
            
            <div className="timer-controls">
              {isPaused ? (
                <button className="resume-button" onClick={resumeTimer}>Resume</button>
              ) : (
                <button className="pause-button" onClick={pauseTimer}>Pause</button>
              )}
              
              <button className="complete-button" onClick={completePractice}>
                Complete Practice
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Development-only fast-forward buttons */}
      {process.env.NODE_ENV !== 'production' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          zIndex: 1000
        }}>
          <button 
            onClick={handleFastForwardSession}
            style={{
              backgroundColor: '#FF5252',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            DEV: Fast-Forward Session
          </button>
          <button 
            onClick={handleFastForwardStage}
            style={{
              backgroundColor: '#9C27B0',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer',
              opacity: 0.8
            }}
          >
            DEV: Complete Stage (15h)
          </button>
        </div>
      )}
    </div>
  );
};

export default PAHMTimer4;
