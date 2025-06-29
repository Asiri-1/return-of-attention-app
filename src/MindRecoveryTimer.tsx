import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocalData } from './contexts/LocalDataContext'; // Added this import

interface MindRecoveryTimerProps {
  practiceType: string;
  posture: string;
  duration: number; // Duration in minutes, fixed at 5 for Mind Recovery
  onComplete: (pahmCounts: any) => void;
  onBack: () => void;
}

const MindRecoveryTimer: React.FC<MindRecoveryTimerProps> = ({
  practiceType,
  posture,
  duration,
  onComplete,
  onBack
}) => {
  const [currentStage, setCurrentStage] = useState<'setup' | 'practice'>('setup');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [flashingButton, setFlashingButton] = useState<string | null>(null);
  
  // PAHM matrix state - same as PAHMTimer2
  const [pahmCounts, setPahmCounts] = useState({
    nostalgia: 0,      // Row 1, Col 1: Attachment + Past
    likes: 0,          // Row 1, Col 2: Attachment + Present  
    anticipation: 0,   // Row 1, Col 3: Attachment + Future
    past: 0,           // Row 2, Col 1: Neutral + Past
    present: 0,        // Row 2, Col 2: Neutral + Present
    future: 0,         // Row 2, Col 3: Neutral + Future
    regret: 0,         // Row 3, Col 1: Aversion + Past
    dislikes: 0,       // Row 3, Col 2: Aversion + Present
    worry: 0           // Row 3, Col 3: Aversion + Future
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { currentUser } = useAuth();
  const { addMindRecoverySession } = useLocalData(); // Added this hook

  // Timer completion handler - UPDATED with LocalDataContext storage
  const handleTimerComplete = useCallback(() => {
    const endTime = new Date().toISOString();
    const actualDuration = duration; // Always 5 minutes for mind recovery
    
    // Calculate present percentage
    const calculatePresentPercentage = (counts: typeof pahmCounts) => {
      const totalCounts = Object.values(counts).reduce((sum, count) => sum + count, 0);
      if (totalCounts === 0) return 95; // Default for short practices
      
      const presentMomentCounts = counts.present + counts.likes + counts.dislikes;
      return Math.round((presentMomentCounts / totalCounts) * 100);
    };

    const presentPercentage = calculatePresentPercentage(pahmCounts);
    const totalInteractions = Object.values(pahmCounts).reduce((a, b) => a + b, 0);

    // Convert PAHM counts to LocalDataContext format
    const formattedPahmCounts = {
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

    // Determine rating based on engagement
    const rating = totalInteractions > 15 ? 9 : 
                   totalInteractions > 10 ? 8 : 
                   totalInteractions > 5 ? 7 : 6;

    // Get practice title for notes
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

    // Use LocalDataContext instead of localStorage
    addMindRecoverySession({
      timestamp: endTime,
      duration: actualDuration,
      sessionType: 'mind_recovery',
      mindRecoveryContext: practiceType as any,
      mindRecoveryPurpose: 'stress-relief', // Default purpose
      rating: rating,
      notes: `${getPracticeTitle()} - ${totalInteractions} mindful moments`,
      presentPercentage: presentPercentage,
      environment: {
        posture: posture,
        location: 'unknown',
        lighting: 'unknown',
        sounds: 'unknown'
      },
      pahmCounts: formattedPahmCounts
    });

    // Complete with PAHM counts (keep existing functionality)
    onComplete(pahmCounts);
  }, [duration, practiceType, posture, pahmCounts, currentUser, onComplete, addMindRecoverySession]);

  // Timer countdown effect - same as PAHMTimer2
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

  // Timer completion effect - same as PAHMTimer2
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  const handleStart = () => {
    setTimeRemaining(duration * 60);
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

    setFlashingButton(quadrant);
    setTimeout(() => setFlashingButton(null), 300);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleCompleteEarly = () => {
    if (window.confirm('Complete this mind recovery practice early?')) {
      handleTimerComplete();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '25px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>

        <h1 style={{ fontSize: '28px', marginBottom: '20px', textAlign: 'center' }}>
          {getPracticeTitle()}
        </h1>
        
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '400px',
          width: '100%',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>5-Minute Mind Recovery</h3>
          <div style={{ marginBottom: '20px', fontSize: '18px', opacity: 0.9 }}>
            Posture: {getPostureDisplayName()}
          </div>
          
          <button
            onClick={handleStart}
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              padding: '15px 30px',
              border: 'none',
              borderRadius: '25px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
              width: '100%'
            }}
          >
            Begin Practice
          </button>
        </div>
        
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '500px',
          fontSize: '14px',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          <p>A quick 5-minute practice to reset your mind and return to presence. Use the PAHM matrix to track where your attention goes during the practice.</p>
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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

      {/* Instruction */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        padding: '12px 20px',
        borderRadius: '8px',
        marginBottom: '20px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          opacity: 0.95,
          lineHeight: '1.4'
        }}>
          📝 <strong>Mind Recovery:</strong> Notice where your attention goes, tap when you recognize thoughts
        </div>
      </div>

      {/* 3×3 PAHM Matrix - same styling as PAHMTimer2 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '30px',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Row 1: ATTACHMENT */}
        <button
          onClick={() => handleQuadrantClick('nostalgia')}
          style={{
            background: 'linear-gradient(135deg, #E8B4A0 0%, #D7A86E 100%)',
            color: '#2C3E50',
            border: 'none',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'nostalgia' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'nostalgia' ? '0 0 20px rgba(232, 180, 160, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>NOSTALGIA</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('likes')}
          style={{
            background: 'linear-gradient(135deg, #A8E6CF 0%, #7FCDCD 100%)',
            color: '#2C3E50',
            border: '2px solid #4A90A4',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'likes' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'likes' ? '0 0 20px rgba(168, 230, 207, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>LIKES</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('anticipation')}
          style={{
            background: 'linear-gradient(135deg, #B4A7D6 0%, #9A8AC1 100%)',
            color: '#2C3E50',
            border: 'none',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'anticipation' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'anticipation' ? '0 0 20px rgba(180, 167, 214, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>ANTICIPATION</div>
        </button>

        {/* Row 2: NEUTRAL */}
        <button
          onClick={() => handleQuadrantClick('past')}
          style={{
            background: 'linear-gradient(135deg, #F4D03F 0%, #F1C40F 100%)',
            color: '#2C3E50',
            border: 'none',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'past' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'past' ? '0 0 20px rgba(244, 208, 63, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>PAST</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('present')}
          style={{
            background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
            color: '#2C3E50',
            border: '3px solid #4A90A4',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'present' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'present' ? '0 0 25px rgba(74, 144, 164, 0.9)' : '0 6px 12px rgba(74, 144, 164, 0.3)'
          }}
        >
          <div>PRESENT</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('future')}
          style={{
            background: 'linear-gradient(135deg, #85C1E9 0%, #5DADE2 100%)',
            color: '#2C3E50',
            border: 'none',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'future' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'future' ? '0 0 20px rgba(133, 193, 233, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>FUTURE</div>
        </button>

        {/* Row 3: AVERSION */}
        <button
          onClick={() => handleQuadrantClick('regret')}
          style={{
            background: 'linear-gradient(135deg, #E6B8A2 0%, #D7A86E 100%)',
            color: '#2C3E50',
            border: 'none',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'regret' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'regret' ? '0 0 20px rgba(230, 184, 162, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>REGRET</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('dislikes')}
          style={{
            background: 'linear-gradient(135deg, #F5B7B1 0%, #E8B4A0 100%)',
            color: '#2C3E50',
            border: '2px solid #4A90A4',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'dislikes' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'dislikes' ? '0 0 20px rgba(245, 183, 177, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>DISLIKES</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('worry')}
          style={{
            background: 'linear-gradient(135deg, #D5BDDD 0%, #C8A8D8 100%)',
            color: '#2C3E50',
            border: 'none',
            borderRadius: '10px',
            padding: '15px 10px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textAlign: 'center',
            height: '80px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 0.3s ease',
            filter: flashingButton === 'worry' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'worry' ? '0 0 20px rgba(213, 189, 221, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>WORRY</div>
        </button>
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <button
          onClick={handlePause}
          style={{
            background: isPaused 
              ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
              : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
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
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '25px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
          }}
        >
          Complete Practice
        </button>
      </div>
    </div>
  );
};

export default MindRecoveryTimer;