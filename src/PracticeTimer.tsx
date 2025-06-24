import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PracticeTimer.css';
import { PAHMCounts } from './types/PAHMTypes';
import T1PracticeRecorder from './T1PracticeRecorder';
import T2PracticeRecorder from './T2PracticeRecorder';
import T3PracticeRecorder from './T3PracticeRecorder';
import T4PracticeRecorder from './T4PracticeRecorder';
import T5PracticeRecorder from './T5PracticeRecorder';
import { useLocalData } from './contexts/LocalDataContext';

interface PracticeTimerProps {
  onComplete: () => void;
  onBack: () => void;
  stageLevel?: string;
  initialMinutes?: number;
}

const PracticeTimer: React.FC<PracticeTimerProps> = ({ 
  onComplete, 
  onBack, 
  stageLevel = 'Stage 1: Stillness Practice',
  initialMinutes: propInitialMinutes
}) => {
  const [currentStage, setCurrentStage] = useState<'setup' | 'practice'>('setup');
  const [initialMinutes, setInitialMinutes] = useState<number>(propInitialMinutes || 10);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  
  // Enhanced analytics integration
  const { addPracticeSession, addEmotionalNote } = useLocalData();
  
  // Refs for recorder components
  const t1RecorderRef = useRef<any>(null);
  const t2RecorderRef = useRef<any>(null);
  const t3RecorderRef = useRef<any>(null);
  const t4RecorderRef = useRef<any>(null);
  const t5RecorderRef = useRef<any>(null);
  
  // Ref for interval - FIXED: Only one timer needed
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Extract T-level from stageLevel (e.g., "T1: Physical Stillness for 10 minutes")
  const getTLevel = (): string => {
    const tLevelMatch = stageLevel.match(/^(T[1-5])/i);
    return tLevelMatch ? tLevelMatch[1].toLowerCase() : 't1';
  };
  
  // Convert T-level to number for analytics
  const getTLevelNumber = (tLevel: string): number => {
    const levelMap: { [key: string]: number } = {
      't1': 1,
      't2': 2, 
      't3': 3,
      't4': 4,
      't5': 5
    };
    return levelMap[tLevel] || 1;
  };

  // Calculate session quality for basic stillness practice
  const calculateSessionQuality = (duration: number, completed: boolean) => {
    let quality = 7; // Base quality
    
    // Completion bonus
    if (completed) quality += 1.5;
    
    // Duration factor
    const durationFactor = Math.min(1, duration / (10 * 60)); // 10 min baseline for T1
    quality = quality * (0.8 + 0.2 * durationFactor);
    
    return Math.min(10, Math.max(1, Math.round(quality * 10) / 10));
  };

  // FIXED: Simplified start timer - no duplicate interval
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    setIsRunning(true);
    
    // Store start time
    const now = new Date().toISOString();
    setSessionStartTime(now);
    sessionStorage.setItem('practiceStartTime', now);
  };
  
  // Pause timer
  const pauseTimer = () => {
    setIsPaused(true);
  };
  
  // Resume timer
  const resumeTimer = () => {
    setIsPaused(false);
  };
  
  // Handle back button
  const handleBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    onBack();
  };

  // Record session data using the appropriate recorder
  const recordSession = (isFullyCompleted: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
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
    
    const tLevel = getTLevel();
    
    // 🔗 ENHANCED: Add to unified analytics system
    const enhancedSessionData = {
      timestamp: endTime,
      duration: timeSpentMinutes || initialMinutes,
      sessionType: 'meditation' as const,
      stageLevel: getTLevelNumber(tLevel), // Convert to number (this puts it in Stage 1)
      stageLabel: `${tLevel.toUpperCase()}: Physical Stillness Training`,
      rating: isFullyCompleted ? 8 : 6,
      notes: `${tLevel.toUpperCase()} physical stillness training (${initialMinutes} minutes) - Progressive capacity building for PAHM Matrix practice`,
      presentPercentage: isFullyCompleted ? 85 : 70,
      environment: {
        posture: sessionStorage.getItem('currentPosture') || 'seated',
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      // 🔥 IMPORTANT: Add empty PAHM structure for consistency
      pahmCounts: {
        present_attachment: 0,
        present_neutral: 0,
        present_aversion: 0,
        past_attachment: 0,
        past_neutral: 0,
        past_aversion: 0,
        future_attachment: 0,
        future_neutral: 0,
        future_aversion: 0
      }
    };
    
    // Add to unified analytics (enhances your existing dashboard!)
    addPracticeSession(enhancedSessionData);
    
    // Add achievement note for motivation
    if (isFullyCompleted) {
      addEmotionalNote({
        timestamp: endTime,
        content: `Successfully completed ${tLevel.toUpperCase()} physical stillness training! 🧘‍♂️ Built ${initialMinutes} minutes of capacity toward PAHM practice.`,
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['achievement', 'physical_training', tLevel, 't-level']
      });
    }
    
    console.log('✅ PracticeTimer - Session saved to LocalDataContext:', enhancedSessionData);
    
    // 🔒 PRESERVE: Keep all existing functionality exactly as is
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

  const handleTimerComplete = useCallback(() => {
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    const sessionQuality = calculateSessionQuality(actualDuration, isFullyCompleted);

    // Session data for basic stillness practice
    const sessionData = {
      timestamp: endTime,
      duration: Math.round(actualDuration / 60), // Convert to minutes
      sessionType: 'meditation' as const,
      stageLevel: 1,
      stageLabel: stageLevel || 'Stage 1: Stillness Practice',
      rating: sessionQuality,
      notes: `Stillness practice session completed successfully.`,
      presentPercentage: isFullyCompleted ? 85 : 70,
      environment: {
        posture: sessionStorage.getItem('currentPosture') || 'seated',
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      // 🔥 IMPORTANT: Add empty PAHM structure for consistency
      pahmCounts: {
        present_attachment: 0,
        present_neutral: 0,
        present_aversion: 0,
        past_attachment: 0,
        past_neutral: 0,
        past_aversion: 0,
        future_attachment: 0,
        future_neutral: 0,
        future_aversion: 0
      }
    };

    addPracticeSession(sessionData);

    // Completion note
    const completionMessage = isFullyCompleted 
      ? `Completed full ${initialMinutes}-minute stillness session! 🎯`
      : `Completed ${Math.round(actualDuration / 60)}-minute stillness session.`;
    
    const stillnessInsight = "Building foundation for deeper mindfulness practice.";

    addEmotionalNote({
      timestamp: endTime,
      content: `${completionMessage} ${stillnessInsight} Quality rating: ${sessionQuality}/10.`,
      emotion: isFullyCompleted ? 'accomplished' : 'content',
      energyLevel: sessionQuality >= 8 ? 8 : sessionQuality >= 6 ? 7 : 6,
      tags: ['stillness-practice', 'stage-1', 'basic-meditation'],
      gratitude: [
        'meditation practice',
        'inner stillness',
        isFullyCompleted ? 'session completion' : 'practice effort'
      ]
    });

    console.log('✅ PracticeTimer - Timer completion saved to LocalDataContext:', sessionData);

    onComplete();
  }, [initialMinutes, timeRemaining, stageLevel, addPracticeSession, addEmotionalNote, onComplete]);

  // Separate effect to handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // FIXED: Single timer effect - no duplicate
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    if (initialMinutes < 5) {
      alert('Practice requires a minimum of 5 minutes.');
      return;
    }
    
    setTimeRemaining(initialMinutes * 60);
    setCurrentStage('practice');
    setIsRunning(true);
    setSessionStartTime(new Date().toISOString());
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleCompleteEarly = () => {
    if (window.confirm('Complete this session early?')) {
      handleTimerComplete();
    }
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
    
    // 🔗 ENHANCED: Also add to analytics system for development
    const enhancedSessionData = {
      timestamp: now,
      duration: initialMinutes,
      sessionType: 'meditation' as const,
      stageLevel: getTLevelNumber(tLevel),
      stageLabel: `${tLevel.toUpperCase()}: Physical Stillness Training - DEV`,
      rating: 8,
      notes: `${tLevel.toUpperCase()} physical stillness training (${initialMinutes} minutes) - DEV FAST-FORWARD`,
      presentPercentage: 80,
      environment: {
        posture: sessionStorage.getItem('currentPosture') || 'seated',
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      // 🔥 IMPORTANT: Add empty PAHM structure for consistency
      pahmCounts: {
        present_attachment: 0,
        present_neutral: 0,
        present_aversion: 0,
        past_attachment: 0,
        past_neutral: 0,
        past_aversion: 0,
        future_attachment: 0,
        future_neutral: 0,
        future_aversion: 0
      }
    };
    
    addPracticeSession(enhancedSessionData);
    
    // Add dev completion note
    addEmotionalNote({
      timestamp: now,
      content: `DEV: Fast-forwarded ${tLevel.toUpperCase()} training session for testing.`,
      emotion: 'accomplished',
      energyLevel: 8,
      tags: ['dev', 'fast-forward', tLevel, 't-level']
    });
    
    console.log('✅ PracticeTimer - DEV fast-forward saved to LocalDataContext:', enhancedSessionData);
    
    // Log for development purposes
    console.log(`DEV: Fast-forwarded ${tLevel} practice session`);
    
    // Call onComplete to navigate to reflection
    onComplete();
  };

  // Development fast-forward
  const fastForwardMinutes = (minutes: number) => {
    if (process.env.NODE_ENV !== 'production') {
      const secondsToReduce = minutes * 60;
      const newTimeRemaining = Math.max(0, timeRemaining - secondsToReduce);
      setTimeRemaining(newTimeRemaining);
      
      console.log(`DEV: Fast-forwarded ${minutes} minutes`);
    }
  };
  
  // Handle session recording via appropriate recorder component
  const handleRecordSession = (sessionData: any) => {
    // This function will be called by the recorder component
    console.log('Session recorded:', sessionData);
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Skip setup if initialMinutes prop is provided
  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= 5) {
      setTimeRemaining(propInitialMinutes * 60);
      setCurrentStage('practice');
      setIsRunning(true);
      setIsActive(true);
      setSessionStartTime(new Date().toISOString());
    }
  }, [propInitialMinutes]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (currentStage === 'setup') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px', textAlign: 'center' }}>
          {stageLevel}
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>Duration (minimum 5 minutes)</h3>
          <input
            type="number"
            min="5"
            max="90"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || 5)}
            style={{
              fontSize: '24px',
              padding: '15px',
              width: '100px',
              textAlign: 'center',
              borderRadius: '10px',
              border: 'none',
              marginBottom: '20px'
            }}
          />
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={handleStart}
              style={{
                background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                color: 'white',
                padding: '15px 30px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 184, 148, 0.3)'
              }}
            >
              Start Practice
            </button>
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '15px 30px',
                border: '2px solid white',
                borderRadius: '25px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Back
            </button>
          </div>
        </div>
        
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '500px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <h4 style={{ marginBottom: '10px' }}>Stillness Practice Instructions:</h4>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li>Sit comfortably with your back straight</li>
            <li>Close your eyes or soften your gaze</li>
            <li>Focus on your breath or body sensations</li>
            <li>Maintain physical stillness throughout the session</li>
            <li>Gently return attention to your breath when distracted</li>
            <li>The goal is developing stillness and stability</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="practice-timer" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '10px',
      boxSizing: 'border-box'
    }}>
      {/* Include all recorder components but hide them */}
      <div style={{ display: 'none' }}>
        <T1PracticeRecorder onRecordSession={handleRecordSession} ref={t1RecorderRef} />
        <T2PracticeRecorder onRecordSession={handleRecordSession} ref={t2RecorderRef} />
        <T3PracticeRecorder onRecordSession={handleRecordSession} ref={t3RecorderRef} />
        <T4PracticeRecorder onRecordSession={handleRecordSession} ref={t4RecorderRef} />
        <T5PracticeRecorder onRecordSession={handleRecordSession} ref={t5RecorderRef} />
      </div>
      
      <div className="timer-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px',
        minHeight: '50px'
      }}>
        <button className="back-button" onClick={handleBack} style={{
          padding: '8px 16px',
          fontSize: '14px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer'
        }}>Back</button>
        <h1 style={{ 
          fontSize: '18px', 
          margin: '0',
          textAlign: 'center',
          flex: 1,
          padding: '0 10px'
        }}>{stageLevel}</h1>
        <div style={{ width: '65px' }}></div> {/* Balance for back button */}
      </div>
      
      <div className="timer-content" style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div className="timer-display" style={{ marginBottom: '30px' }}>
          <div className="time-remaining" style={{ 
            fontSize: '64px', 
            fontWeight: 'bold',
            margin: '20px 0',
            color: '#2c3e50'
          }}>{formatTime(timeRemaining)}</div>
          <div className="timer-instruction" style={{
            fontSize: '16px',
            color: '#666',
            margin: '10px 0',
            lineHeight: '1.4'
          }}>
            {!isActive 
              ? "Press Start when ready" 
              : isPaused 
                ? "Practice paused" 
                : "Maintain physical stillness"}
          </div>
        </div>
        
        <div className="timer-controls" style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px',
          width: '100%',
          maxWidth: '280px'
        }}>
          {!isActive ? (
            <button className="start-button" onClick={startTimer} style={{
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: '#27ae60',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Start Practice
            </button>
          ) : isPaused ? (
            <button className="resume-button" onClick={resumeTimer} style={{
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: '#27ae60',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Resume
            </button>
          ) : (
            <button className="pause-button" onClick={pauseTimer} style={{
              padding: '16px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '30px',
              border: 'none',
              backgroundColor: '#f39c12',
              color: 'white',
              cursor: 'pointer',
              width: '100%'
            }}>
              Pause
            </button>
          )}
          
          {isActive && !isPaused && (
            <button className="complete-button" onClick={handleSkip} style={{
              backgroundColor: '#4A67E3', 
              color: 'white',
              padding: '14px 20px',
              borderRadius: '30px',
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '16px',
              width: '100%'
            }}>
              Complete Practice
            </button>
          )}
        </div>

        {/* Development Controls */}
        {process.env.NODE_ENV !== 'production' && (
          <div style={{
            marginTop: '20px',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '280px'
          }}>
            <div style={{ fontSize: '12px', marginBottom: '10px', color: '#ccc' }}>
              Development Controls:
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              <button
                onClick={() => fastForwardMinutes(1)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '5px 10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                +1min
              </button>
              <button
                onClick={() => fastForwardMinutes(5)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '5px 10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                +5min
              </button>
              <button
                onClick={handleFastForward}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  padding: '5px 10px',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '10px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Complete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeTimer;