import React, { useState, useEffect, useRef } from 'react';
import './MindRecoveryTimer.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import PAHMMatrix from './PAHMMatrix';

interface MindRecoveryTimerProps {
  practiceType: string;
  posture: string;
  duration: number; // Duration in minutes, fixed at 5 for Mind Recovery
  onComplete: (pahmCounts: any) => void; // Modified to pass pahmCounts
  onBack: () => void;
}

const MindRecoveryTimer: React.FC<MindRecoveryTimerProps> = ({
  practiceType,
  posture,
  duration,
  onComplete,
  onBack
}) => {
  const totalSeconds = duration * 60; // Should be 5 minutes * 60 seconds
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(totalSeconds);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showTapIndicator, setShowTapIndicator] = useState<boolean>(false);

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

  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Timer effect to count down
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Timer complete
            clearInterval(timerRef.current as NodeJS.Timeout);
            completePractice();
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

    // Store updated counts in session storage (optional, for persistence across refreshes)
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

    // Save practice data to localStorage
    const practiceData = {
      type: 'mind-recovery',
      practiceType,
      posture,
      duration, // Use dynamic duration
      completedAt: new Date().toISOString(),
      userId: currentUser?.id || 'anonymous',
      pahmCounts: pahmCounts // Save PAHM counts with the practice data
    };

    // Get existing practice history or initialize empty array
    const practiceHistory = JSON.parse(localStorage.getItem('mindRecoveryHistory') || '[]');

    // Add new practice data
    practiceHistory.push(practiceData);

    // Save updated history
    localStorage.setItem('mindRecoveryHistory', JSON.stringify(practiceHistory));

    // Navigate to reflection using the onComplete callback, passing pahmCounts
    onComplete(pahmCounts);
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

  // Get practice title
  const getPracticeTitle = (): string => {
    switch (practiceType) {
      case 'morning-recharge':
        return 'Morning Recharge';
      case 'emotional-reset':
        return 'Emotional Reset';
      case 'work-home-transition':
        return 'Work-Home Transition';
      case 'evening-wind-down':
        return 'Evening Wind-Down';
      case 'mid-day-reset':
        return 'Mid-Day Reset';
      default:
        return 'Mind Recovery Practice';
    }
  };

  // Get posture display name
  const getPostureDisplayName = (): string => {
    switch (posture) {
      case 'seated':
        return 'Seated';
      case 'standing':
        return 'Standing';
      case 'lying':
        return 'Lying Down';
      default:
        return posture;
    }
  };

  return (
    <div className="pahm-timer">
      <div className="timer-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>{getPracticeTitle()}</h1>
      </div>

      <div className="timer-content">
        {!isRunning ? (
          <div className="timer-setup">
            <h2>Ready for your {duration}-minute practice?</h2>
            <div className="posture-display">
              <h3>Selected Posture</h3>
              <p>{getPostureDisplayName()}</p>
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

              <div className="time-display-container">
                <div className="time-display">
                  {formatTime(timeRemaining)}
                </div>
                {showTapIndicator && (
                  <div className="tap-indicator"></div>
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
    </div>
  );
};

export default MindRecoveryTimer;


