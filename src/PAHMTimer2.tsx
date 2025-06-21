import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PAHMMatrix.css';
import './PAHMTimer.css';
import PAHMMatrix from './PAHMMatrix';
import { useLocalData } from './contexts/LocalDataContext';

interface PAHMTimer2Props {
  onComplete: () => void;
  onBack: () => void;
  posture: string;
}

const PAHMTimer2: React.FC<PAHMTimer2Props> = ({ onComplete, onBack, posture }) => {
  const [currentStage, setCurrentStage] = useState<'setup' | 'practice'>('setup');
  const [initialMinutes, setInitialMinutes] = useState<number>(30);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { addPracticeSession, addEmotionalNote } = useLocalData();

  // Convert 9-quadrant PAHM to 4-quadrant format for LocalDataContext
  const convertPAHMCounts = (counts: typeof pahmCounts) => {
    return {
      present_happy: counts.likes,
      present_unhappy: counts.dislikes,
      absent_happy: counts.anticipation,
      absent_unhappy: counts.regret
    };
  };

  const handleTimerComplete = useCallback(() => {
    const endTime = new Date().toISOString();
    const actualDuration = (initialMinutes * 60) - timeRemaining;
    const isFullyCompleted = timeRemaining === 0;

    // Enhanced session data for analytics
    const enhancedSessionData = {
      timestamp: endTime,
      duration: actualDuration,
      sessionType: 'meditation' as const,
      stageLevel: 2,
      posture,
      environment: {
        posture,
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      completed: isFullyCompleted,
      pahmData: convertPAHMCounts(pahmCounts),
      qualityMetrics: {
        attentionQuality: Math.min(9, Math.max(1, 
          8 - (Object.values(pahmCounts).reduce((a, b) => a + b, 0) / 10)
        )),
        presentMomentAwareness: pahmCounts.present > 0 ? 
          Math.min(10, (pahmCounts.present / Math.max(1, Object.values(pahmCounts).reduce((a, b) => a + b, 0))) * 10) : 5,
        mindfulnessDepth: Math.min(10, Math.max(1, 
          (actualDuration / 60) / initialMinutes * 10
        ))
      },
      pahmMatrix: {
        totalInteractions: Object.values(pahmCounts).reduce((a, b) => a + b, 0),
        attentionPattern: {
          past: pahmCounts.nostalgia + pahmCounts.past + pahmCounts.regret,
          present: pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes,
          future: pahmCounts.anticipation + pahmCounts.future + pahmCounts.worry
        },
        emotionalBalance: {
          positive: pahmCounts.likes + pahmCounts.anticipation,
          negative: pahmCounts.dislikes + pahmCounts.regret + pahmCounts.worry,
          neutral: pahmCounts.present + pahmCounts.past + pahmCounts.nostalgia
        }
      }
    };

    // Add to unified analytics
    addPracticeSession(enhancedSessionData);

    // Add achievement note for motivation
    if (isFullyCompleted) {
      addEmotionalNote({
        timestamp: endTime,
        content: `Completed ${initialMinutes}-minute PAHM training session! 🎯 Enhanced present-moment awareness through ${Object.values(pahmCounts).reduce((a, b) => a + b, 0)} attention observations.`,
        emotion: 'accomplished',
        tags: ['pahm-training', 'stage-2', 'completed', posture]
      });
    }

    onComplete();
  }, [initialMinutes, timeRemaining, posture, pahmCounts, addPracticeSession, addEmotionalNote, onComplete]);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, isPaused, timeRemaining, handleTimerComplete]);

  const handleStart = () => {
    if (initialMinutes < 30) {
      alert('PAHM practice requires a minimum of 30 minutes to be effective.');
      return;
    }
    
    setTimeRemaining(initialMinutes * 60);
    setCurrentStage('practice');
    setIsRunning(true);
    setPahmCounts({
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
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleQuadrantClick = (quadrant: keyof typeof pahmCounts) => {
    setPahmCounts(prev => {
      const newCounts = { ...prev };
      newCounts[quadrant] = newCounts[quadrant] + 1;
      return newCounts;
    });
  };

  const handleCompleteEarly = () => {
    if (window.confirm('Complete this session early? Note: PAHM practice is most effective with full duration.')) {
      handleTimerComplete();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Development fast-forward functions
  const fastForwardMinutes = (minutes: number) => {
    if (process.env.NODE_ENV !== 'production') {
      const secondsToReduce = minutes * 60;
      setTimeRemaining(prev => Math.max(0, prev - secondsToReduce));
      
      // Log enhanced session data for development
      const endTime = new Date().toISOString();
      const actualDuration = (initialMinutes * 60) - (timeRemaining - secondsToReduce);
      
      const enhancedSessionData = {
        timestamp: endTime,
        duration: actualDuration,
        sessionType: 'meditation' as const,
        stageLevel: 2,
        posture,
        environment: {
          posture,
          location: 'development',
          lighting: 'artificial',
          sounds: 'mixed'
        },
        completed: false,
        pahmData: convertPAHMCounts(pahmCounts),
        qualityMetrics: {
          attentionQuality: 7,
          presentMomentAwareness: 6,
          mindfulnessDepth: 5
        },
        pahmMatrix: {
          totalInteractions: Object.values(pahmCounts).reduce((a, b) => a + b, 0),
          attentionPattern: {
            past: pahmCounts.nostalgia + pahmCounts.past + pahmCounts.regret,
            present: pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes,
            future: pahmCounts.anticipation + pahmCounts.future + pahmCounts.worry
          },
          emotionalBalance: {
            positive: pahmCounts.likes + pahmCounts.anticipation,
            negative: pahmCounts.dislikes + pahmCounts.regret + pahmCounts.worry,
            neutral: pahmCounts.present + pahmCounts.past + pahmCounts.nostalgia
          }
        },
        fastForwarded: true
      };

      addPracticeSession(enhancedSessionData);
      console.log('DEV: Fast-forwarded PAHM practice session');
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '30px', textAlign: 'center' }}>
          PAHM Trainee Practice
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Duration (minimum 30 minutes)</h3>
          <input
            type="number"
            min="30"
            max="120"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || 30)}
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
          <p style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.8 }}>
            Posture: {posture}
          </p>
          <button
            onClick={handleStart}
            style={{
              fontSize: '18px',
              padding: '15px 40px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Start PAHM Practice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      padding: '10px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '15px'
      }}>
        <h1 style={{ 
          fontSize: '20px', 
          margin: '10px 0',
          fontWeight: '600'
        }}>
          PAHM Trainee Practice
        </h1>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Timer and Matrix Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '15px',
          width: '100%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {/* PAHM Heading */}
          <h2 style={{ 
            fontSize: '18px', 
            margin: '10px 0 8px 0',
            fontWeight: '500'
          }}>
            PAHM Matrix
          </h2>
          
          {/* Description */}
          <p style={{ 
            fontSize: '14px', 
            margin: '0 0 15px 0',
            lineHeight: '1.3',
            opacity: 0.9
          }}>
            Notice your attention. Tap quadrants when you recognize thoughts.
          </p>
          
          {/* Timer */}
          <div style={{ 
            fontSize: '28px', 
            fontWeight: 'bold',
            margin: '5px 0 15px 0',
            color: '#FFD700'
          }}>
            {formatTime(timeRemaining)}
          </div>
          
          {/* PAHM Matrix */}
          <div style={{
            border: 'none',
            outline: 'none',
            margin: '0 auto'
          }}>
            <PAHMMatrix />
          </div>
          
          {/* Control Buttons - Positioned closer to matrix */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            padding: '20px 0 10px 0'
          }}>
            <button
              onClick={handlePause}
              style={{
                fontSize: '16px',
                padding: '12px 24px',
                backgroundColor: isPaused ? '#FF9800' : '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleCompleteEarly}
              style={{
                fontSize: '16px',
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                minWidth: '100px'
              }}
            >
              Complete
            </button>
          </div>
        </div>
      </div>

      {/* Development-only fast-forward buttons */}
      {process.env.NODE_ENV !== 'production' && (
        <div style={{
          position: 'fixed',
          bottom: '10px',
          right: '10px',
          display: 'flex',
          gap: '5px',
          flexWrap: 'wrap',
          maxWidth: '200px'
        }}>
          <button
            onClick={() => fastForwardMinutes(5)}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              backgroundColor: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer'
            }}
          >
            -5m
          </button>
          <button
            onClick={() => fastForwardMinutes(10)}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              backgroundColor: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer'
            }}
          >
            -10m
          </button>
          <button
            onClick={() => fastForwardMinutes(15)}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              backgroundColor: '#FF5722',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer'
            }}
          >
            -15m
          </button>
          <button
            onClick={() => setTimeRemaining(5)}
            style={{
              fontSize: '12px',
              padding: '8px 12px',
              backgroundColor: '#FF1744',
              color: 'white',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer'
            }}
          >
            End
          </button>
        </div>
      )}
    </div>
  );
};

export default PAHMTimer2;