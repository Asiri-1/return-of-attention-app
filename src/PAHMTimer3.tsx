import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PAHMMatrix.css';
import './PAHMTimer.css';
import { useLocalData } from './contexts/LocalDataContext';

interface PAHMTimer3Props {
  onComplete: () => void;
  onBack: () => void;
  posture?: string;
  stageLevel?: string;
  initialMinutes?: number;
}

const PAHMTimer3: React.FC<PAHMTimer3Props> = ({ 
  onComplete, 
  onBack, 
  posture = 'seated',
  stageLevel = 'Stage 3: Interrupted Attention',
  initialMinutes: propInitialMinutes 
}) => {
  const [currentStage, setCurrentStage] = useState<'setup' | 'practice'>('setup');
  const [initialMinutes, setInitialMinutes] = useState<number>(propInitialMinutes || 30);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [flashingButton, setFlashingButton] = useState<string | null>(null);
  
  // 🔥 CORRECTED: Match your exact original matrix layout
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
  const { addPracticeSession, addEmotionalNote } = useLocalData();

  // 🔥 ENHANCED: Skip setup if initialMinutes prop is provided
  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= 15) {
      setTimeRemaining(propInitialMinutes * 60);
      setCurrentStage('practice');
      setIsRunning(true);
    }
  }, [propInitialMinutes]);

  // 🔥 CORRECTED: Convert to proper 3×3 matrix format for data storage
  const convertPAHMCounts = (counts: typeof pahmCounts) => {
    return {
      present_attachment: counts.likes,
      present_neutral: counts.present,
      present_aversion: counts.dislikes,
      past_attachment: counts.nostalgia,
      past_neutral: counts.past,
      past_aversion: counts.regret,
      future_attachment: counts.anticipation,
      future_neutral: counts.future,
      future_aversion: counts.worry
    };
  };

  // Calculate present percentage
  const calculatePresentPercentage = (counts: typeof pahmCounts) => {
    const totalCounts = Object.values(counts).reduce((sum, count) => sum + count, 0);
    if (totalCounts === 0) return 85;
    
    const presentMomentCounts = counts.present + counts.likes + counts.dislikes;
    return Math.round((presentMomentCounts / totalCounts) * 100);
  };

  // Calculate session quality
  const calculateSessionQuality = (counts: typeof pahmCounts, duration: number, completed: boolean) => {
    const totalInteractions = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const presentMomentAwareness = calculatePresentPercentage(counts);
    
    let quality = 7;
    
    if (presentMomentAwareness >= 80) quality += 1.5;
    else if (presentMomentAwareness >= 60) quality += 1;
    else if (presentMomentAwareness < 40) quality -= 1;
    
    if (completed) quality += 0.5;
    
    const durationFactor = Math.min(1, duration / (30 * 60));
    quality = quality * (0.7 + 0.3 * durationFactor);
    
    const interactionRate = totalInteractions / (duration / 60);
    if (interactionRate > 15) quality -= 0.5;
    else if (interactionRate < 3) quality += 0.5;
    
    return Math.min(10, Math.max(1, Math.round(quality * 10) / 10));
  };

  // Get PAHM statistics
  const getPAHMStats = () => {
    const totalInteractions = Object.values(pahmCounts).reduce((sum: number, count: number) => sum + count, 0);
    const presentPercentage = calculatePresentPercentage(pahmCounts);
    
    return {
      total: totalInteractions,
      present: presentPercentage,
      timeStats: {
        present: pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes,
        past: pahmCounts.past + pahmCounts.nostalgia + pahmCounts.regret,
        future: pahmCounts.future + pahmCounts.anticipation + pahmCounts.worry
      },
      emotionalStats: {
        attachment: pahmCounts.likes + pahmCounts.nostalgia + pahmCounts.anticipation,
        neutral: pahmCounts.present + pahmCounts.past + pahmCounts.future,
        aversion: pahmCounts.dislikes + pahmCounts.regret + pahmCounts.worry
      }
    };
  };

  const pahmStats = getPAHMStats();

  const handleTimerComplete = useCallback(() => {
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    const presentPercentage = calculatePresentPercentage(pahmCounts);
    const sessionQuality = calculateSessionQuality(pahmCounts, actualDuration, isFullyCompleted);

    const sessionData = {
      timestamp: endTime,
      duration: Math.round(actualDuration / 60),
      sessionType: 'meditation' as const,
      stageLevel: 3,
      stageLabel: stageLevel,
      rating: sessionQuality,
      notes: `Stage 3 PAHM practice with ${Object.values(pahmCounts).reduce((a, b) => a + b, 0)} attention observations. ${presentPercentage}% present-moment awareness. Focus: Interrupted Attention training.`,
      presentPercentage,
      environment: {
        posture: posture.toLowerCase(),
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      pahmCounts: convertPAHMCounts(pahmCounts)
    };

    addPracticeSession(sessionData);

    // 🔥 ENHANCED: Stage 3 specific post-practice reflection
    const totalInteractions = Object.values(pahmCounts).reduce((a, b) => a + b, 0);
    const completionMessage = isFullyCompleted 
      ? `✅ Completed full ${initialMinutes}-minute Stage 3 session!`
      : `⏱️ Completed ${Math.round(actualDuration / 60)}-minute Stage 3 session.`;
    
    const insightMessage = presentPercentage >= 80 
      ? "🎯 Excellent attention stability! Stage 3 mastery developing." 
      : presentPercentage >= 60 
      ? "✨ Good progress with interrupted attention recovery." 
      : "🌱 Building interrupted attention awareness skills.";

    // Detailed analytics for post-practice reflection
    const timeBreakdown = `⏰ Attention Distribution: Present: ${pahmStats.timeStats.present} | Past: ${pahmStats.timeStats.past} | Future: ${pahmStats.timeStats.future}`;
    const emotionalBreakdown = `😊 Emotional Patterns: Attachment: ${pahmStats.emotionalStats.attachment} | Neutral: ${pahmStats.emotionalStats.neutral} | Aversion: ${pahmStats.emotionalStats.aversion}`;
    const detailedCounts = `📊 Detailed Matrix: Nostalgia(${pahmCounts.nostalgia}) Past(${pahmCounts.past}) Regret(${pahmCounts.regret}) | Likes(${pahmCounts.likes}) Present(${pahmCounts.present}) Dislikes(${pahmCounts.dislikes}) | Anticipation(${pahmCounts.anticipation}) Future(${pahmCounts.future}) Worry(${pahmCounts.worry})`;

    addEmotionalNote({
      timestamp: endTime,
      content: `${completionMessage} 
      
${insightMessage} 

📈 Stage 3 Session Analytics:
• Total Observations: ${totalInteractions}
• Present Awareness: ${presentPercentage}%
• Quality Rating: ${sessionQuality}/10
• Focus: Interrupted Attention Training

${timeBreakdown}
${emotionalBreakdown}
${detailedCounts}

🎯 Stage 3 develops the ability to quickly recognize mind-wandering and return attention to the meditation object. This builds sustained attention skills.`,
      emotion: isFullyCompleted ? 'accomplished' : 'content',
      energyLevel: sessionQuality >= 8 ? 9 : sessionQuality >= 6 ? 7 : 6,
      tags: ['pahm-practice', 'stage-3', 'interrupted-attention', posture.toLowerCase(), '3x3-matrix'],
      gratitude: [
        'mindfulness practice',
        'attention training', 
        'interrupted attention skills',
        isFullyCompleted ? 'session completion' : 'practice effort'
      ]
    });

    onComplete();
  }, [initialMinutes, timeRemaining, posture, pahmCounts, stageLevel, addPracticeSession, addEmotionalNote, onComplete, pahmStats]);

  // 🔥 FIXED: Use setInterval instead of setTimeout for countdown
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

  // Separate effect for timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  const handleStart = () => {
    if (initialMinutes < 15) {
      alert('Stage 3 PAHM practice requires a minimum of 15 minutes to be effective.');
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

    // 🔥 ADDED: Gentle flash + border glow feedback combination
    // Visual feedback: brief brightness flash + soft border glow
    setFlashingButton(quadrant);
    setTimeout(() => setFlashingButton(null), 300); // 300ms for combined effect

    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Very brief, gentle vibration
    }
  };

  const handleCompleteEarly = () => {
    if (window.confirm('Complete this session early? Note: Stage 3 practice is most effective with full duration.')) {
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
      
      const additionalInteractions = Math.floor(Math.random() * (minutes * 2)) + minutes;
      setPahmCounts(prev => ({
        ...prev,
        present: prev.present + Math.floor(additionalInteractions * 0.4),
        likes: prev.likes + Math.floor(additionalInteractions * 0.2),
        dislikes: prev.dislikes + Math.floor(additionalInteractions * 0.15),
        future: prev.future + Math.floor(additionalInteractions * 0.1),
        worry: prev.worry + Math.floor(additionalInteractions * 0.08),
        anticipation: prev.anticipation + Math.floor(additionalInteractions * 0.07)
      }));
      
      console.log(`DEV: Fast-forwarded ${minutes} minutes, added ${additionalInteractions} PAHM interactions`);
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
          <h3 style={{ marginBottom: '15px' }}>Duration (minimum 15 minutes)</h3>
          <input
            type="number"
            min="15"
            max="120"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || 15)}
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
          <div style={{ marginBottom: '20px', fontSize: '14px', opacity: 0.8 }}>
            Posture: {posture}
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
              marginRight: '10px',
              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
            }}
          >
            Start Stage 3 Practice
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
        
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '500px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <h4 style={{ marginBottom: '10px' }}>Stage 3: Interrupted Attention Training</h4>
          <p>In Stage 3, you'll develop the ability to quickly notice when your mind wanders and gently return attention to your meditation object.</p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li><strong>Goal:</strong> Overcome mind-wandering with faster recognition</li>
            <li><strong>Focus:</strong> Quickly notice when attention drifts away</li>
            <li><strong>Technique:</strong> Gentle redirection without self-judgment</li>
            <li><strong>PAHM Matrix:</strong> Track attention patterns across time × emotion</li>
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

      {/* 🔥 ADDED: Short instruction for PAHM matrix usage */}
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
          📝 <strong>Stage 3 Focus:</strong> Notice attention drifting & gently return
        </div>
      </div>

      {/* 🔥 UPDATED: 3×3 PAHM Matrix with Logo-Inspired Colors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '10px',
        marginBottom: '30px',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Row 1: ATTACHMENT (Emotional Tone) */}
        {/* Past + Attachment */}
        <button
          onClick={() => handleQuadrantClick('nostalgia')}
          style={{
            background: 'linear-gradient(135deg, #E8B4A0 0%, #D7A86E 100%)', // Warm terracotta
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.nostalgia}</div>
        </button>

        {/* Present + Attachment */}
        <button
          onClick={() => handleQuadrantClick('likes')}
          style={{
            background: 'linear-gradient(135deg, #A8E6CF 0%, #7FCDCD 100%)', // Soft mint
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.likes}</div>
        </button>

        {/* Future + Attachment */}
        <button
          onClick={() => handleQuadrantClick('anticipation')}
          style={{
            background: 'linear-gradient(135deg, #B4A7D6 0%, #9A8AC1 100%)', // Soft lavender
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.anticipation}</div>
        </button>

        {/* Row 2: NEUTRAL (Emotional Tone) */}
        {/* Past + Neutral */}
        <button
          onClick={() => handleQuadrantClick('past')}
          style={{
            background: 'linear-gradient(135deg, #F4D03F 0%, #F1C40F 100%)', // Warm golden
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.past}</div>
        </button>

        {/* Present + Neutral - CENTER CELL */}
        <button
          onClick={() => handleQuadrantClick('present')}
          style={{
            background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)', // Pure center
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.present}</div>
        </button>

        {/* Future + Neutral */}
        <button
          onClick={() => handleQuadrantClick('future')}
          style={{
            background: 'linear-gradient(135deg, #85C1E9 0%, #5DADE2 100%)', // Calm blue
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.future}</div>
        </button>

        {/* Row 3: AVERSION (Emotional Tone) */}
        {/* Past + Aversion */}
        <button
          onClick={() => handleQuadrantClick('regret')}
          style={{
            background: 'linear-gradient(135deg, #E6B8A2 0%, #D7A86E 100%)', // Muted earth
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.regret}</div>
        </button>

        {/* Present + Aversion */}
        <button
          onClick={() => handleQuadrantClick('dislikes')}
          style={{
            background: 'linear-gradient(135deg, #F5B7B1 0%, #E8B4A0 100%)', // Soft coral
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.dislikes}</div>
        </button>

        {/* Future + Aversion */}
        <button
          onClick={() => handleQuadrantClick('worry')}
          style={{
            background: 'linear-gradient(135deg, #D5BDDD 0%, #C8A8D8 100%)', // Muted purple
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
          <div style={{ fontSize: '16px', marginTop: '4px' }}>{pahmCounts.worry}</div>
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
              onClick={() => fastForwardMinutes(10)}
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
              +10min
            </button>
            <button
              onClick={() => fastForwardMinutes(25)}
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
              +25min
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PAHMTimer3;