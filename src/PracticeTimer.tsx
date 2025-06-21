import React, { useState, useEffect, useRef } from 'react';
import './PracticeTimer.css';
import { PAHMCounts } from './types/PAHMTypes';
import T1PracticeRecorder from './T1PracticeRecorder';
import T2PracticeRecorder from './T2PracticeRecorder';
import T3PracticeRecorder from './T3PracticeRecorder';
import T4PracticeRecorder from './T4PracticeRecorder';
import T5PracticeRecorder from './T5PracticeRecorder';
import { useLocalData } from './contexts/LocalDataContext';

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
  
  // Enhanced analytics integration
  const { addPracticeSession, addEmotionalNote } = useLocalData();
  
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
    
    const tLevel = getTLevel();
    
    // 🔗 ENHANCED: Add to unified analytics system
    const enhancedSessionData = {
      timestamp: endTime,
      duration: timeSpentMinutes || initialMinutes,
      sessionType: 'meditation' as const,
      stageLevel: getTLevelNumber(tLevel), // Convert to number
      stageLabel: `${tLevel.toUpperCase()}: Physical Stillness Training`,
      rating: isFullyCompleted ? 8 : 6,
      notes: `${tLevel.toUpperCase()} physical stillness training (${initialMinutes} minutes) - Progressive capacity building for PAHM Matrix practice`,
      presentPercentage: isFullyCompleted ? 85 : 70,
      environment: {
        posture: 'sitting',
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
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
        tags: ['achievement', 'physical_training', tLevel]
      });
    }
    
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
        posture: 'sitting',
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      }
    };
    
    addPracticeSession(enhancedSessionData);
    
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