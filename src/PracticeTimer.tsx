import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PAHMTimer.css';
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
  const [mindWanderingCount, setMindWanderingCount] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { addPracticeSession, addEmotionalNote } = useLocalData();

  // Skip setup if initialMinutes prop is provided
  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= 5) {
      setTimeRemaining(propInitialMinutes * 60);
      setCurrentStage('practice');
      setIsRunning(true);
    }
  }, [propInitialMinutes]);

  // Calculate session quality for basic stillness practice
  const calculateSessionQuality = (duration: number, wanderingCount: number, completed: boolean) => {
    let quality = 7; // Base quality
    
    // Completion bonus
    if (completed) quality += 1;
    
    // Mind wandering factor (fewer is better for stillness)
    const wanderingRate = wanderingCount / (duration / 60); // per minute
    if (wanderingRate <= 2) quality += 1; // Very still
    else if (wanderingRate <= 5) quality += 0.5; // Good stillness
    else if (wanderingRate > 10) quality -= 1; // Restless
    
    // Duration factor
    const durationFactor = Math.min(1, duration / (10 * 60)); // 10 min baseline for T1
    quality = quality * (0.8 + 0.2 * durationFactor);
    
    return Math.min(10, Math.max(1, Math.round(quality * 10) / 10));
  };

  const handleTimerComplete = useCallback(() => {
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    const sessionQuality = calculateSessionQuality(actualDuration, mindWanderingCount, isFullyCompleted);

    // Session data for basic stillness practice
    const sessionData = {
      timestamp: endTime,
      duration: Math.round(actualDuration / 60), // Convert to minutes
      sessionType: 'meditation' as const,
      stageLevel: 1,
      stageLabel: stageLevel || 'Stage 1: Stillness Practice',
      rating: sessionQuality,
      notes: `Stillness practice session. Noticed mind wandering ${mindWanderingCount} times.`,
      presentPercentage: Math.max(60, 100 - (mindWanderingCount * 5)), // Estimate based on wandering
      environment: {
        posture: 'seated',
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      }
    };

    addPracticeSession(sessionData);

    // Completion note
    const completionMessage = isFullyCompleted 
      ? `Completed full ${initialMinutes}-minute stillness session! 🎯`
      : `Completed ${Math.round(actualDuration / 60)}-minute stillness session.`;
    
    const stillnessInsight = mindWanderingCount <= 3 
      ? "Excellent stillness and focus!" 
      : mindWanderingCount <= 8 
      ? "Good progress in developing stillness." 
      : "Building foundation for deeper stillness.";

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

    onComplete();
  }, [initialMinutes, timeRemaining, mindWanderingCount, stageLevel, addPracticeSession, addEmotionalNote, onComplete]);

  // Separate effect to handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

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
    setMindWanderingCount(0);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleMindWandering = () => {
    setMindWanderingCount(prev => prev + 1);
  };

  const handleCompleteEarly = () => {
    if (window.confirm('Complete this session early?')) {
      handleTimerComplete();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Development fast-forward
  const fastForwardMinutes = (minutes: number) => {
    if (process.env.NODE_ENV !== 'production') {
      const secondsToReduce = minutes * 60;
      const newTimeRemaining = Math.max(0, timeRemaining - secondsToReduce);
      setTimeRemaining(newTimeRemaining);
      
      // Add some mind wandering for realism
      const additionalWandering = Math.floor(Math.random() * (minutes / 2));
      setMindWanderingCount(prev => prev + additionalWandering);
      
      console.log(`DEV: Fast-forwarded ${minutes} minutes`);
    }
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
            <li>When you notice your mind wandering, tap "Mind Wandering"</li>
            <li>Gently return attention to your breath</li>
            <li>The goal is developing stillness and stability</li>
          </ul>
        </div>
      </div>
    );
  }

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
      {/* Timer Display */}
      <div style={{
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '20px',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '20px 40px',
        borderRadius: '15px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {formatTime(timeRemaining)}
      </div>

      {/* Session Stats */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
          Mind Wandering: {mindWanderingCount} times
        </div>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          Developing stillness and stability
        </div>
      </div>

      {/* Mind Wandering Button */}
      <button
        onClick={handleMindWandering}
        style={{
          background: 'linear-gradient(135deg, #fd79a8 0%, #e84393 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          padding: '20px 40px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '30px',
          boxShadow: '0 4px 15px rgba(253, 121, 168, 0.3)',
          transition: 'transform 0.2s'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        Mind Wandering
      </button>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button
          onClick={handlePause}
          style={{
            background: isPaused 
              ? 'linear-gradient(135deg, #00b894 0%, #00a085 100%)'
              : 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={handleCompleteEarly}
          style={{
            background: 'linear-gradient(135deg, #e17055 0%, #d63031 100%)',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(225, 112, 85, 0.3)'
          }}
        >
          Complete Early
        </button>
      </div>

      {/* Development Controls */}
      {process.env.NODE_ENV !== 'production' && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '10px', opacity: 0.8 }}>
            Development Controls:
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => fastForwardMinutes(2)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 16px',
                border: '1px solid white',
                borderRadius: '15px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              +2min
            </button>
            <button
              onClick={() => fastForwardMinutes(5)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 16px',
                border: '1px solid white',
                borderRadius: '15px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              +5min
            </button>
            <button
              onClick={() => fastForwardMinutes(8)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: '8px 16px',
                border: '1px solid white',
                borderRadius: '15px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              +8min
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeTimer;