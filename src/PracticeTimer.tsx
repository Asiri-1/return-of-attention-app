import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PracticeTimer.css';
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
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  
  // Bell settings
  const [bellEnabled, setBellEnabled] = useState<boolean>(true);
  const [lastBellMinute, setLastBellMinute] = useState<number>(0);
  
  // Voice settings
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [lastVoiceAnnouncement, setLastVoiceAnnouncement] = useState<number>(0);
  
  // Enhanced analytics integration
  const { addPracticeSession, addEmotionalNote } = useLocalData();
  
  // Refs for recorder components
  const t1RecorderRef = useRef<any>(null);
  const t2RecorderRef = useRef<any>(null);
  const t3RecorderRef = useRef<any>(null);
  const t4RecorderRef = useRef<any>(null);
  const t5RecorderRef = useRef<any>(null);
  
  // Audio refs for bells
  const startBellRef = useRef<HTMLAudioElement>(null);
  const endBellRef = useRef<HTMLAudioElement>(null);
  const minuteBellRef = useRef<HTMLAudioElement>(null);
  
  // Ref for interval
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Bell Audio Functions - memoized to prevent useCallback deps changing
  const playBell = useCallback((type: 'start' | 'end' | 'minute') => {
    if (!bellEnabled) return;
    
    try {
      let audioRef;
      switch (type) {
        case 'start':
          audioRef = startBellRef;
          break;
        case 'end':
          audioRef = endBellRef;
          break;
        case 'minute':
          audioRef = minuteBellRef;
          break;
      }
      
      if (audioRef?.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
      }
    } catch (error) {
      console.warn('Bell audio error:', error);
    }
  }, [bellEnabled]);

  // Voice Synthesis Function - memoized to prevent useCallback deps changing
  const announceTime = useCallback((remainingMinutes: number) => {
    if (!voiceEnabled) return;
    
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance();
        
        if (remainingMinutes === 0) {
          utterance.text = "Practice session complete";
        } else if (remainingMinutes === 1) {
          utterance.text = "One minute remaining";
        } else {
          utterance.text = `${remainingMinutes} minutes remaining`;
        }
        
        utterance.volume = 0.7;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        
        // Use a calm voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Female') ||
          voice.name.includes('Samantha')
        );
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn('Voice synthesis error:', error);
    }
  }, [voiceEnabled]);

  // Check for minute bells and voice announcements
  const checkMinuteBell = useCallback((remainingSeconds: number) => {
    const totalSeconds = initialMinutes * 60;
    const elapsedSeconds = totalSeconds - remainingSeconds;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    
    // Play bell every complete minute (but not at start)
    if (elapsedMinutes > 0 && elapsedMinutes !== lastBellMinute) {
      playBell('minute');
      setLastBellMinute(elapsedMinutes);
    }
    
    // Voice announcements every 5 minutes for remaining time
    if (voiceEnabled && remainingMinutes > 0) {
      // Announce at 5-minute intervals (when remaining time is 25, 20, 15, 10, 5 minutes)
      if (remainingMinutes % 5 === 0 && remainingMinutes !== lastVoiceAnnouncement) {
        announceTime(remainingMinutes);
        setLastVoiceAnnouncement(remainingMinutes);
      }
      // Also announce at 1 minute remaining
      else if (remainingMinutes === 1 && lastVoiceAnnouncement !== 1) {
        announceTime(1);
        setLastVoiceAnnouncement(1);
      }
    }
  }, [initialMinutes, lastBellMinute, bellEnabled, voiceEnabled, lastVoiceAnnouncement, playBell, announceTime]);

  // Extract T-level from stageLevel - memoized to prevent useCallback deps changing
  const getTLevel = useCallback((): string => {
    // Check multiple possible patterns for T-level detection
    const patterns = [
      /^(T[1-5])/i,  // T1, T2, etc.
      /T([1-5])/i,   // Any T1, T2 in the string
      /(Stage\s*1.*T[1-5])/i,  // Stage 1: T1, etc.
      /Physical\s*Stillness.*([1-5])/i  // Physical Stillness with number
    ];
    
    for (const pattern of patterns) {
      const match = stageLevel.match(pattern);
      if (match) {
        // Extract T-level or convert number to T-level
        if (match[1]?.toLowerCase().startsWith('t')) {
          return match[1].toLowerCase();
        } else if (match[1]) {
          return `t${match[1]}`;
        }
      }
    }
    
    // Fallback: check if it's a Stage 1 practice (default to T1)
    if (stageLevel.toLowerCase().includes('stage 1') || stageLevel.toLowerCase().includes('stillness')) {
      return 't1';
    }
    
    return 't1';
  }, [stageLevel]);
  
  // Convert T-level to number for analytics - memoized to prevent useCallback deps changing
  const getTLevelNumber = useCallback((tLevel: string): number => {
    const levelMap: { [key: string]: number } = {
      't1': 1,
      't2': 2, 
      't3': 3,
      't4': 4,
      't5': 5
    };
    return levelMap[tLevel] || 1;
  }, []);

  // Calculate session quality for basic stillness practice - memoized to prevent useCallback deps changing
  const calculateSessionQuality = useCallback((duration: number, completed: boolean) => {
    let quality = 7; // Base quality
    
    // Completion bonus
    if (completed) quality += 1.5;
    
    // Duration factor
    const durationFactor = Math.min(1, duration / (10 * 60)); // 10 min baseline for T1
    quality = quality * (0.8 + 0.2 * durationFactor);
    
    return Math.min(10, Math.max(1, Math.round(quality * 10) / 10));
  }, []);

  // 🔥 CRITICAL: Unified session tracking that ensures immediate synchronization
  const saveSessionToAllStorageLocations = useCallback((sessionData: any, isCompleted: boolean) => {
    const tLevel = getTLevel();
    const tLevelUpper = tLevel.toUpperCase();
    const timestamp = new Date().toISOString();
    
    try {
      // 1. Create the session object in Stage1Wrapper compatible format
      const sessionObject = {
        id: `session_${Date.now()}`,
        timestamp: timestamp,
        duration: sessionData.duration || initialMinutes,
        targetDuration: initialMinutes,
        isCompleted: isCompleted,
        completedAt: timestamp,
        tLevel: tLevel,
        rating: sessionData.rating || (isCompleted ? 8 : 6),
        posture: sessionStorage.getItem('currentPosture') || 'seated',
        notes: sessionData.notes || '',
        metadata: sessionData.metadata || {}
      };

      // 2. IMMEDIATE localStorage write (no debounce) for Stage1Wrapper compatibility
      const existingSessions = JSON.parse(localStorage.getItem(`${tLevelUpper}Sessions`) || '[]');
      existingSessions.push(sessionObject);
      localStorage.setItem(`${tLevelUpper}Sessions`, JSON.stringify(existingSessions));
      
      // 3. Update completion status immediately
      if (isCompleted) {
        localStorage.setItem(`${tLevelUpper}Complete`, 'true');
        localStorage.setItem(`${tLevelUpper}LastCompleted`, timestamp);
      }
      
      // 4. Update stage1Progress immediately
      const existingProgress = JSON.parse(localStorage.getItem('stage1Progress') || '{"T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0}');
      existingProgress[tLevelUpper] = existingSessions.filter((s: any) => s.isCompleted).length;
      localStorage.setItem('stage1Progress', JSON.stringify(existingProgress));
      
      // 5. Enhanced session data for LocalDataContext
      const enhancedSessionData = {
        timestamp: timestamp,
        duration: sessionData.duration || initialMinutes,
        sessionType: 'meditation' as const,
        stageLevel: getTLevelNumber(tLevel),
        stageLabel: `${tLevel.toUpperCase()}: Physical Stillness Training`,
        rating: sessionData.rating || (isCompleted ? 8 : 6),
        notes: `${tLevel.toUpperCase()} physical stillness training (${initialMinutes} minutes) - Progressive capacity building for PAHM Matrix practice`,
        presentPercentage: isCompleted ? 85 : 70,
        environment: {
          posture: sessionStorage.getItem('currentPosture') || 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
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
      
      // 6. Add to LocalDataContext (this will handle debounced storage to comprehensiveUserData)
      addPracticeSession(enhancedSessionData);
      
      // 7. Force a storage event to notify other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${tLevelUpper}Sessions`,
        newValue: JSON.stringify(existingSessions),
        storageArea: localStorage
      }));
      
      // 8. Dispatch custom event for immediate UI updates
      window.dispatchEvent(new CustomEvent('sessionUpdate', {
        detail: { tLevel: tLevelUpper, completed: isCompleted }
      }));
      
      console.log(`✅ Session saved to all storage locations - ${tLevelUpper}: ${existingSessions.filter((s: any) => s.isCompleted).length}/3 completed`);
      
      return sessionObject;
      
    } catch (error) {
      console.error('❌ Error saving session to storage:', error);
      // Still try to save to LocalDataContext as fallback
      const enhancedSessionData = {
        timestamp: timestamp,
        duration: sessionData.duration || initialMinutes,
        sessionType: 'meditation' as const,
        stageLevel: getTLevelNumber(tLevel),
        stageLabel: `${tLevel.toUpperCase()}: Physical Stillness Training`,
        rating: sessionData.rating || (isCompleted ? 8 : 6),
        notes: `${tLevel.toUpperCase()} physical stillness training (${initialMinutes} minutes)`,
        presentPercentage: isCompleted ? 85 : 70,
        environment: {
          posture: sessionStorage.getItem('currentPosture') || 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
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
    }
  }, [initialMinutes, addPracticeSession, getTLevel, getTLevelNumber]);

  // Start timer
  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
    setIsRunning(true);
    
    // Play start bell
    playBell('start');
    
    // Store start time
    const now = new Date().toISOString();
    setSessionStartTime(now);
    sessionStorage.setItem('practiceStartTime', now);
    
    // Reset bell and voice tracking
    setLastBellMinute(0);
    setLastVoiceAnnouncement(0);
  };
  
  // Handle back button
  const handleBack = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    onBack();
  };

  // Record session data with unified storage
  const recordSession = (isFullyCompleted: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Play completion bell and announce if completed
    if (isFullyCompleted) {
      playBell('end');
      announceTime(0); // Announce "Practice session complete"
    }
    
    // Calculate time spent
    const startTime = sessionStartTime || new Date().toISOString();
    const endTime = new Date().toISOString();
    sessionStorage.setItem('practiceEndTime', endTime);
    
    // Calculate time spent in minutes
    const timeSpentMs = sessionStartTime 
      ? new Date(endTime).getTime() - new Date(startTime).getTime() 
      : 0;
    const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60));
    
    const sessionData = {
      duration: timeSpentMinutes || initialMinutes,
      rating: isFullyCompleted ? 8 : 6,
      notes: `${getTLevel().toUpperCase()} physical stillness training`,
      metadata: {
        startTime: startTime,
        endTime: endTime,
        wasFullyCompleted: isFullyCompleted,
        initialMinutes: initialMinutes,
        actualMinutes: timeSpentMinutes
      }
    };
    
    // 🔥 Save to all storage locations with immediate synchronization
    saveSessionToAllStorageLocations(sessionData, isFullyCompleted);
    
    // Add achievement note for motivation
    if (isFullyCompleted) {
      addEmotionalNote({
        timestamp: endTime,
        content: `Successfully completed ${getTLevel().toUpperCase()} physical stillness training! 🧘‍♂️ Built ${initialMinutes} minutes of capacity toward PAHM practice.`,
        emotion: 'accomplished',
        energyLevel: 8,
        tags: ['achievement', 'physical_training', getTLevel(), 't-level']
      });
    }
    
    // Store session data for reflection component
    const reflectionData = {
      level: getTLevel(),
      targetDuration: initialMinutes,
      timeSpent: timeSpentMinutes || 0,
      isCompleted: isFullyCompleted,
      completedAt: endTime
    };
    
    sessionStorage.setItem('lastPracticeData', JSON.stringify(reflectionData));
    
    console.log('✅ Session recording completed, calling onComplete...');
    onComplete();
  };

  const handleTimerComplete = useCallback(() => {
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    const sessionQuality = calculateSessionQuality(actualDuration, isFullyCompleted);

    // Play completion bell and announce completion
    playBell('end');
    announceTime(0); // Announce "Practice session complete"

    const sessionData = {
      duration: Math.round(actualDuration / 60),
      rating: sessionQuality,
      notes: `${getTLevel().toUpperCase()} stillness practice session completed successfully.`,
      metadata: {
        endTime: endTime,
        actualDuration: actualDuration,
        wasFullyCompleted: isFullyCompleted,
        sessionQuality: sessionQuality
      }
    };

    // 🔥 Save to all storage locations with immediate synchronization
    saveSessionToAllStorageLocations(sessionData, isFullyCompleted);

    // Completion note
    const completionMessage = isFullyCompleted 
      ? `Completed full ${initialMinutes}-minute ${getTLevel().toUpperCase()} stillness session! 🎯`
      : `Completed ${Math.round(actualDuration / 60)}-minute ${getTLevel().toUpperCase()} stillness session.`;
    
    const stillnessInsight = "Building foundation for deeper mindfulness practice.";

    addEmotionalNote({
      timestamp: endTime,
      content: `${completionMessage} ${stillnessInsight} Quality rating: ${sessionQuality}/10.`,
      emotion: isFullyCompleted ? 'accomplished' : 'content',
      energyLevel: sessionQuality >= 8 ? 8 : sessionQuality >= 6 ? 7 : 6,
      tags: ['stillness-practice', 'stage-1', 'basic-meditation', getTLevel()],
      gratitude: [
        'meditation practice',
        'inner stillness',
        isFullyCompleted ? 'session completion' : 'practice effort'
      ]
    });

    console.log('✅ Timer completion processed, calling onComplete...');
    onComplete();
  }, [initialMinutes, timeRemaining, addEmotionalNote, onComplete, saveSessionToAllStorageLocations, calculateSessionQuality, getTLevel, playBell, announceTime]);

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // Main timer effect
  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            return 0;
          }
          
          // Check for minute bells
          checkMinuteBell(prev - 1);
          
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
  }, [isRunning, isPaused, checkMinuteBell]);

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

  // Handle skip (early completion)
  const handleSkip = () => {
    recordSession(false);
  };
  
  // Fast forward for development with unified storage
  const handleFastForward = () => {
    const now = new Date().toISOString();
    
    sessionStorage.setItem('practiceStartTime', now);
    sessionStorage.setItem('practiceEndTime', now);
    
    const sessionData = {
      duration: initialMinutes,
      rating: 8,
      notes: `${getTLevel().toUpperCase()} physical stillness training - DEV FAST-FORWARD`,
      metadata: {
        fastForwarded: true,
        endTime: now
      }
    };
    
    // 🔥 Save to all storage locations with immediate synchronization
    saveSessionToAllStorageLocations(sessionData, true);
    
    const reflectionData = {
      level: getTLevel(),
      targetDuration: initialMinutes,
      timeSpent: initialMinutes,
      isCompleted: true,
      completedAt: now,
      fastForwarded: true
    };
    
    sessionStorage.setItem('lastPracticeData', JSON.stringify(reflectionData));
    
    addEmotionalNote({
      timestamp: now,
      content: `DEV: Fast-forwarded ${getTLevel().toUpperCase()} training session for testing.`,
      emotion: 'accomplished',
      energyLevel: 8,
      tags: ['dev', 'fast-forward', getTLevel(), 't-level']
    });
    
    console.log(`✅ DEV fast-forward completed, calling onComplete...`);
    onComplete();
  };

  // Development fast-forward
  const fastForwardMinutes = (minutes: number) => {
    if (process.env.NODE_ENV !== 'production') {
      const secondsToReduce = minutes * 60;
      const newTimeRemaining = Math.max(0, timeRemaining - secondsToReduce);
      setTimeRemaining(newTimeRemaining);
    }
  };
  
  // Handle session recording via appropriate recorder component
  const handleRecordSession = (sessionData: any) => {
    console.log('Session recorded:', sessionData);
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
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
          
          {/* Bell and Voice Settings */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Audio Settings</h4>
            
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={bellEnabled}
                onChange={(e) => setBellEnabled(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              🔔 Bell sounds (start/minute/end)
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              🔊 Voice announcements (remaining time)
            </label>
            
            <div style={{ 
              fontSize: '12px', 
              marginTop: '10px', 
              opacity: 0.8,
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px',
              borderRadius: '5px'
            }}>
              📢 Bell rings every minute<br/>
              🔊 Voice announces remaining time every 5 minutes
            </div>
          </div>
          
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
      {/* Hidden audio elements for bells */}
      <audio ref={startBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmJADT+Pz+7XfSsELYnU8NVMA0w5jdLCq2MgAjiQ0vLGdyMKJ4fO7tR+NA4xe8vr2YNACkg+gtfpwWUhHTFsyO7Zhy4GQIzS7tN9HgY+j9Tv2ICyYgE2E7jVIIHMQoJQtjOAAi7YOoJSzDaSCQ7VW2CZkjU+Q4HOw2MjByq8b8rX0E6E3YLXPHI=" type="audio/wav" />
      </audio>
      <audio ref={minuteBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmJADT+Pz+7XfSsELYnU8NVMA0w5jdLCq2MgAjiQ0vLGdyMKJ4fO7tR+NA4xe8vr2YNACkg+gtfpwWUhHTFsyO7Zhy4GQIzS7tN9HgY+j9Tv2ICyYgE2E7jVIIHMQoJQtjOAAi7YOoJSzDaSCQ7VW2CZkjU+Q4HOw2MjByq8b8rX0E6E3YLXPHI=" type="audio/wav" />
      </audio>
      <audio ref={endBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmJADT+Pz+7XfSsELYnU8NVMA0w5jdLCq2MgAjiQ0vLGdyMKJ4fO7tR+NA4xe8vr2YNACkg+gtfpwWUhHTFsyO7Zhy4GQIzS7tN9HgY+j9Tv2ICyYgE2E7jVIIHMQoJQtjOAAi7YOoJSzDaSCQ7VW2CZkjU+Q4NOw2MjByq8b8rX0E6E3YLXPHI=" type="audio/wav" />
      </audio>
      
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
        <div style={{ width: '65px' }}></div>
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
          {(bellEnabled || voiceEnabled) && isActive && (
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginTop: '5px'
            }}>
              {bellEnabled && <span>🔔 Bell rings every minute</span>}
              {bellEnabled && voiceEnabled && <br/>}
              {voiceEnabled && <span>🔊 Voice every 5 minutes</span>}
            </div>
          )}
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
            <button className="resume-button" onClick={() => setIsPaused(false)} style={{
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
            <button className="pause-button" onClick={() => setIsPaused(!isPaused)} style={{
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

        {/* Development Controls - Clean Version */}
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