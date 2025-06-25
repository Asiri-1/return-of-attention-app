import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocalData } from '../../contexts/LocalDataContext';

interface UniversalPAHMTimerProps {
  stageLevel: number; // 2, 3, 4, 5, or 6
  onComplete: () => void;
  onBack: () => void;
  posture?: string;
  initialMinutes?: number;
}

interface PAHMCounts {
  nostalgia: number;      // Past + Attachment
  likes: number;          // Present + Attachment  
  anticipation: number;   // Future + Attachment
  past: number;           // Past + Neutral
  present: number;        // Present + Neutral
  future: number;         // Future + Neutral
  regret: number;         // Past + Aversion
  dislikes: number;       // Present + Aversion
  worry: number;          // Future + Aversion
}

// 🎯 STAGE CONFIGURATIONS
const getStageConfig = (stage: number) => {
  const configs = {
    2: {
      title: "PAHM Trainee: Understanding Thought Patterns",
      subtitle: "Notice your thoughts and tap the matching state",
      minDuration: 15,
      defaultDuration: 30,
      instruction: "📝 Notice your thoughts and tap the matching state",
      description: "Stage 2 focuses on recognizing thought patterns without judgment",
      emoji: "🧘‍♀️"
    },
    3: {
      title: "PAHM Apprentice: Deepening Awareness", 
      subtitle: "Observe the arising and passing of mental states",
      minDuration: 20,
      defaultDuration: 35,
      instruction: "🎯 Observe the arising and passing of mental states",
      description: "Stage 3 develops sustained attention with deeper pattern recognition",
      emoji: "🌟"
    },
    4: {
      title: "PAHM Practitioner: Sustained Attention",
      subtitle: "Maintain continuous awareness across all nine positions",
      minDuration: 25,
      defaultDuration: 40,
      instruction: "⚡ Maintain continuous awareness across all positions",
      description: "Stage 4 cultivates unbroken mindfulness and effortless observation",
      emoji: "💎"
    },
    5: {
      title: "PAHM Adept: Effortless Observation",
      subtitle: "Experience the space between thoughts and reactions",
      minDuration: 30,
      defaultDuration: 45,
      instruction: "🌌 Experience the space between thoughts and reactions",
      description: "Stage 5 develops subtle awareness and emotional equanimity",
      emoji: "🔮"
    },
    6: {
      title: "PAHM Master: Integration & Wisdom",
      subtitle: "Embody present-moment awareness in all activities",
      minDuration: 35,
      defaultDuration: 50,
      instruction: "✨ Embody present-moment awareness naturally",
      description: "Stage 6 integrates wisdom and compassion with effortless presence",
      emoji: "🏔️"
    }
  };
  return configs[stage as keyof typeof configs] || configs[2];
};

// 🎨 SHARED STYLES
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  setupCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '30px',
    borderRadius: '15px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const
  },
  timerDisplay: {
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '20px 40px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  instruction: {
    background: 'rgba(255, 255, 255, 0.15)',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center' as const
  },
  matrix: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '30px',
    maxWidth: '500px',
    width: '100%'
  },
  baseButton: {
    border: 'none',
    borderRadius: '10px',
    padding: '15px 10px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'center' as const,
    height: '80px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    color: '#2C3E50'
  },
  controlButton: {
    color: 'white',
    padding: '12px 24px',
    border: 'none',
    borderRadius: '25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
  }
};

// 📊 ANALYTICS CALCULATION HELPERS
const calculatePresentPercentage = (pahmCounts: PAHMCounts) => {
  const totalCounts = (Object.values(pahmCounts) as number[]).reduce((sum, count) => sum + count, 0);
  if (totalCounts === 0) return 85;
  
  const presentMomentCounts = pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes;
  return Math.round((presentMomentCounts / totalCounts) * 100);
};

const calculateSessionQuality = (pahmCounts: PAHMCounts, actualDuration: number, isFullyCompleted: boolean, stageLevel: number) => {
  const totalInteractions = (Object.values(pahmCounts) as number[]).reduce((sum, count) => sum + count, 0);
  const presentMomentAwareness = calculatePresentPercentage(pahmCounts);
  
  // Base quality increases with stage level
  let quality = 6 + stageLevel;
  
  // Present-moment awareness bonuses
  if (presentMomentAwareness >= 80) quality += 1.5;
  else if (presentMomentAwareness >= 60) quality += 1;
  else if (presentMomentAwareness < 40) quality -= 1;
  
  // Completion bonus
  if (isFullyCompleted) quality += 0.5;
  
  // Duration factor
  const expectedDuration = 30 * 60; // 30 minutes in seconds
  const durationFactor = Math.min(1, actualDuration / expectedDuration);
  quality = quality * (0.7 + 0.3 * durationFactor);
  
  // Interaction rate adjustment
  const interactionRate = totalInteractions / (actualDuration / 60);
  if (interactionRate > 15) quality -= 0.5;
  else if (interactionRate < 3) quality += 0.5;
  
  return Math.min(10, Math.max(1, Math.round(quality * 10) / 10));
};

const convertToStandardFormat = (pahmCounts: PAHMCounts) => {
  return {
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
};

const getPAHMStats = (pahmCounts: PAHMCounts) => {
  const totalInteractions = (Object.values(pahmCounts) as number[]).reduce((sum, count) => sum + count, 0);
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

const UniversalPAHMTimer: React.FC<UniversalPAHMTimerProps> = ({ 
  stageLevel, 
  onComplete, 
  onBack, 
  posture = 'seated',
  initialMinutes: propInitialMinutes 
}) => {
  const config = getStageConfig(stageLevel);
  
  // 🔧 COMPONENT STATE
  const [currentStage, setCurrentStage] = useState<'setup' | 'practice'>('setup');
  const [initialMinutes, setInitialMinutes] = useState<number>(
    propInitialMinutes || config.defaultDuration
  );
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [flashingButton, setFlashingButton] = useState<string | null>(null);
  
  // 🧠 STANDARDIZED PAHM MATRIX STATE
  const [pahmCounts, setPahmCounts] = useState<PAHMCounts>({
    nostalgia: 0,      // Past + Attachment
    likes: 0,          // Present + Attachment  
    anticipation: 0,   // Future + Attachment
    past: 0,           // Past + Neutral
    present: 0,        // Present + Neutral
    future: 0,         // Future + Neutral
    regret: 0,         // Past + Aversion
    dislikes: 0,       // Present + Aversion
    worry: 0           // Future + Aversion
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🎯 Real analytics functions from LocalDataContext
  const { addPracticeSession, addEmotionalNote } = useLocalData();

  // Auto-start if initialMinutes provided
  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= config.minDuration) {
      setTimeRemaining(propInitialMinutes * 60);
      setCurrentStage('practice');
      setIsRunning(true);
    }
  }, [propInitialMinutes, config.minDuration]);

  // 🎯 TIMER COMPLETION HANDLER - FIXED WITH PROPER CALLBACK FLOW
  const handleTimerComplete = useCallback(() => {
    console.log('🎯 UniversalPAHMTimer - Timer completion started for Stage', stageLevel);
    
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    
    // 📊 ANALYTICS CALCULATIONS
    const totalInteractions = (Object.values(pahmCounts) as number[]).reduce((sum, count) => sum + count, 0);
    const presentPercentage = calculatePresentPercentage(pahmCounts);
    const sessionQuality = calculateSessionQuality(pahmCounts, actualDuration, isFullyCompleted, stageLevel);
    const pahmStats = getPAHMStats(pahmCounts);
    
    // 🎯 SINGLE STANDARD FORMAT - LocalDataContext underscore format
    const convertedPAHMCounts = convertToStandardFormat(pahmCounts);

    // 💾 SESSION DATA OBJECT
    const sessionData = {
      timestamp: endTime,
      duration: Math.round(actualDuration / 60),
      sessionType: 'meditation' as const,
      stageLevel: stageLevel,
      stageLabel: config.title,
      rating: sessionQuality,
      notes: `${config.title} session with ${totalInteractions} attention observations. ${presentPercentage}% present-moment awareness.`,
      presentPercentage,
      environment: {
        posture: posture.toLowerCase(),
        location: 'indoor',
        lighting: 'natural',
        sounds: 'quiet'
      },
      pahmCounts: convertedPAHMCounts
    };

    // 💾 SAVE TO ANALYTICS
    addPracticeSession(sessionData);
    console.log('🎯 UniversalPAHMTimer - Session data saved to analytics:', sessionData);

    // 📝 COMPREHENSIVE EMOTIONAL NOTE
    const stageEmojis = ['', '', '🌱', '🌟', '💎', '🔮', '🏔️'];
    const completionMessage = isFullyCompleted 
      ? `✅ ${stageEmojis[stageLevel]} Completed full ${initialMinutes}-minute Stage ${stageLevel} PAHM session!`
      : `⏱️ ${stageEmojis[stageLevel]} Completed ${Math.round(actualDuration / 60)}-minute Stage ${stageLevel} PAHM session.`;
    
    const insightMessage = presentPercentage >= 80 
      ? "🎯 Excellent present-moment awareness!" 
      : presentPercentage >= 60 
      ? "✨ Good mindfulness development." 
      : "🌱 Building present-moment attention.";

    const timeBreakdown = `⏰ Attention Distribution: Present: ${pahmStats.timeStats.present} | Past: ${pahmStats.timeStats.past} | Future: ${pahmStats.timeStats.future}`;
    const emotionalBreakdown = `😊 Emotional Patterns: Attachment: ${pahmStats.emotionalStats.attachment} | Neutral: ${pahmStats.emotionalStats.neutral} | Aversion: ${pahmStats.emotionalStats.aversion}`;
    const detailedCounts = `📊 Detailed Matrix: Nostalgia(${pahmCounts.nostalgia}) Past(${pahmCounts.past}) Regret(${pahmCounts.regret}) | Likes(${pahmCounts.likes}) Present(${pahmCounts.present}) Dislikes(${pahmCounts.dislikes}) | Anticipation(${pahmCounts.anticipation}) Future(${pahmCounts.future}) Worry(${pahmCounts.worry})`;

    addEmotionalNote({
      timestamp: endTime,
      content: `${completionMessage} 
      
${insightMessage} 

📈 Session Analytics:
• Stage Level: ${stageLevel} (${config.title})
• Total Observations: ${totalInteractions}
• Present Awareness: ${presentPercentage}%
• Quality Rating: ${sessionQuality}/10

${timeBreakdown}
${emotionalBreakdown}
${detailedCounts}

🎯 ${config.description}

This data helps track your meditation progress and attention patterns over time.`,
      emotion: isFullyCompleted ? 'accomplished' : 'content',
      energyLevel: sessionQuality >= 8 ? 9 : sessionQuality >= 6 ? 7 : 6,
      tags: ['pahm-practice', `stage-${stageLevel}`, posture.toLowerCase(), '9-category-matrix'],
      gratitude: [
        'mindfulness practice',
        'present-moment awareness', 
        `stage ${stageLevel} development`,
        isFullyCompleted ? 'session completion' : 'practice effort'
      ]
    });

    console.log(`🎯 UniversalPAHMTimer - Stage ${stageLevel} completion saved to analytics`);

    // ✅ PROPER REACT CALLBACK FLOW - Let parent handle navigation
    onComplete();
    
  }, [stageLevel, initialMinutes, timeRemaining, pahmCounts, config, posture, addPracticeSession, addEmotionalNote, onComplete]);

  // Timer countdown effect
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => prev <= 1 ? 0 : prev - 1);
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

  // Timer completion detection
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // 🎮 INTERACTION HANDLERS
  const handleStart = () => {
    if (initialMinutes < config.minDuration) {
      alert(`Stage ${stageLevel} PAHM practice requires a minimum of ${config.minDuration} minutes to be effective.`);
      return;
    }
    
    setTimeRemaining(initialMinutes * 60);
    setCurrentStage('practice');
    setIsRunning(true);
    
    // Reset PAHM counts
    setPahmCounts({
      nostalgia: 0, likes: 0, anticipation: 0,
      past: 0, present: 0, future: 0,
      regret: 0, dislikes: 0, worry: 0
    } as PAHMCounts);
    
    console.log(`🎯 UniversalPAHMTimer - Started Stage ${stageLevel} practice for ${initialMinutes} minutes`);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    console.log('🎯 UniversalPAHMTimer - Timer', isPaused ? 'resumed' : 'paused');
  };

  const handleQuadrantClick = (quadrant: keyof PAHMCounts) => {
    setPahmCounts(prev => {
      const newCounts = { ...prev };
      newCounts[quadrant] = newCounts[quadrant] + 1;
      
      console.log(`🎯 PAHM Button clicked: ${quadrant}, new count: ${newCounts[quadrant]}`);
      
      return newCounts;
    });

    // Visual feedback
    setFlashingButton(quadrant);
    setTimeout(() => setFlashingButton(null), 300);

    // Haptic feedback for mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleCompleteEarly = () => {
    if (window.confirm(`Complete Stage ${stageLevel} session early? Note: PAHM practice is most effective with full duration.`)) {
      handleTimerComplete();
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🎯 SETUP SCREEN
  if (currentStage === 'setup') {
    return (
      <div style={styles.container}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>{config.emoji}</div>
        <h1 style={{ fontSize: '24px', marginBottom: '10px', textAlign: 'center' }}>
          {config.title}
        </h1>
        <p style={{ fontSize: '16px', marginBottom: '20px', textAlign: 'center', opacity: 0.9 }}>
          {config.description}
        </p>
        
        <div style={styles.setupCard}>
          <h3 style={{ marginBottom: '15px' }}>Duration (minimum {config.minDuration} minutes)</h3>
          <input
            type="number"
            min={config.minDuration}
            max="120"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || config.minDuration)}
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
            Posture: {posture} | Stage: {stageLevel}
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
            Start Stage {stageLevel} Practice
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
        
        {/* PAHM Instructions */}
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '10px',
          maxWidth: '500px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <h4 style={{ marginBottom: '10px' }}>3×3 PAHM Matrix Instructions:</h4>
          <p>During meditation, tap the appropriate button when you notice your attention:</p>
          <ul style={{ textAlign: 'left', marginTop: '10px' }}>
            <li><strong>Present:</strong> Aware of current moment (breath, body, sounds)</li>
            <li><strong>Past:</strong> Thinking about memories, past events</li>
            <li><strong>Future:</strong> Planning, anticipating, worrying about future</li>
            <li><strong>Attachment:</strong> Wanting, liking, craving</li>
            <li><strong>Neutral:</strong> Balanced, equanimous observation</li>
            <li><strong>Aversion:</strong> Disliking, resisting, avoiding</li>
          </ul>
        </div>
      </div>
    );
  }

  // 🎯 PRACTICE SCREEN - Complete PAHM Matrix
  return (
    <div style={styles.container}>
      {/* Timer Display */}
      <div style={styles.timerDisplay}>
        {formatTime(timeRemaining)}
      </div>

      {/* Stage Badge */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.2)',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        {config.emoji} Stage {stageLevel}
      </div>

      {/* Instruction */}
      <div style={styles.instruction}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          opacity: 0.95,
          lineHeight: '1.4'
        }}>
          {config.instruction}
        </div>
      </div>

      {/* 3×3 PAHM Matrix */}
      <div style={styles.matrix}>
        {/* Row 1: ATTACHMENT */}
        <button
          onClick={() => handleQuadrantClick('nostalgia')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #E8B4A0 0%, #D7A86E 100%)',
            filter: flashingButton === 'nostalgia' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'nostalgia' ? '0 0 20px rgba(232, 180, 160, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>NOSTALGIA</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('likes')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #A8E6CF 0%, #7FCDCD 100%)',
            border: '2px solid #4A90A4',
            filter: flashingButton === 'likes' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'likes' ? '0 0 20px rgba(168, 230, 207, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>LIKES</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('anticipation')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #B4A7D6 0%, #9A8AC1 100%)',
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
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #F4D03F 0%, #F1C40F 100%)',
            filter: flashingButton === 'past' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'past' ? '0 0 20px rgba(244, 208, 63, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>PAST</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('present')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
            border: '3px solid #4A90A4',
            filter: flashingButton === 'present' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'present' ? '0 0 25px rgba(74, 144, 164, 0.9)' : '0 6px 12px rgba(74, 144, 164, 0.3)'
          }}
        >
          <div>PRESENT</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('future')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #85C1E9 0%, #5DADE2 100%)',
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
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #E6B8A2 0%, #D7A86E 100%)',
            filter: flashingButton === 'regret' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'regret' ? '0 0 20px rgba(230, 184, 162, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>REGRET</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('dislikes')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #F5B7B1 0%, #E8B4A0 100%)',
            border: '2px solid #4A90A4',
            filter: flashingButton === 'dislikes' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'dislikes' ? '0 0 20px rgba(245, 183, 177, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>DISLIKES</div>
        </button>

        <button
          onClick={() => handleQuadrantClick('worry')}
          style={{
            ...styles.baseButton,
            background: 'linear-gradient(135deg, #D5BDDD 0%, #C8A8D8 100%)',
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
            ...styles.controlButton,
            background: isPaused 
              ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
              : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
          }}
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={handleCompleteEarly}
          style={{
            ...styles.controlButton,
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
          }}
        >
          Complete Early
        </button>
      </div>

      {/* Total Count Display */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '14px'
      }}>
        Total Observations: {(Object.values(pahmCounts) as number[]).reduce((a, b) => a + b, 0)}
      </div>
    </div>
  );
};

export default UniversalPAHMTimer;