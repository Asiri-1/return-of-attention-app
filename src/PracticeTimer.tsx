import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PracticeTimer.css';
import T1PracticeRecorder from './T1PracticeRecorder';
import T2PracticeRecorder from './T2PracticeRecorder';
import T3PracticeRecorder from './T3PracticeRecorder';
import T4PracticeRecorder from './T4PracticeRecorder';
import T5PracticeRecorder from './T5PracticeRecorder';
// 🚀 UPDATED: Use focused contexts instead of LocalDataContext
import { usePractice } from './contexts/practice/PracticeContext';
import { useWellness } from './contexts/wellness/WellnessContext';

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
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // 🔒 Wake Lock for preventing screen lock during meditation
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [wakeLockEnabled, setWakeLockEnabled] = useState<boolean>(true);
  const [wakeLockStatus, setWakeLockStatus] = useState<string>('inactive');
  
  // 🚀 UPDATED: Use focused contexts for analytics integration
  const { addPracticeSession } = usePractice();
  const { addEmotionalNote } = useWellness();
  
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

  // 🔒 Wake Lock Functions to prevent screen from sleeping
  const requestWakeLock = useCallback(async () => {
    if (!wakeLockEnabled) return;
    
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        setWakeLockStatus('active');
        console.log('✅ Screen wake lock activated - screen will stay on during meditation');
        
        // Handle wake lock release
        lock.addEventListener('release', () => {
          setWakeLockStatus('released');
          console.log('⚠️ Screen wake lock released');
        });
      } else {
        console.warn('⚠️ Wake Lock API not supported - screen may turn off during practice');
        setWakeLockStatus('unsupported');
      }
    } catch (error) {
      console.error('❌ Wake lock request failed:', error);
      setWakeLockStatus('failed');
    }
  }, [wakeLockEnabled]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        setWakeLockStatus('inactive');
        console.log('✅ Screen wake lock released');
      } catch (error) {
        console.error('❌ Wake lock release failed:', error);
      }
    }
  }, [wakeLock]);

  // 🎙️ Voice Selection Functions - Find Rough Male Voices for Physical Training
  const loadVoices = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    setAvailableVoices(voices);
    
    // Priority order for rough, deep male voices suitable for physical training
    const voicePreferences = [
      // Look for deep/rough male voices
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('deep') && voice.name.toLowerCase().includes('male'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('bass') && voice.name.toLowerCase().includes('male'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('alex'), // macOS Alex is deep male
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('daniel'), // Often a good rough male voice
      
      // Look for Indian male voices (secondary priority)
      (voice: SpeechSynthesisVoice) => voice.lang.includes('hi') && voice.name.toLowerCase().includes('male'),
      (voice: SpeechSynthesisVoice) => voice.lang.includes('en-IN') && voice.name.toLowerCase().includes('male'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('ravi'), // Common Indian name
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('raj'), // Common Indian name
      
      // Any male voice
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('male'),
      (voice: SpeechSynthesisVoice) => !voice.name.toLowerCase().includes('female') && !voice.name.toLowerCase().includes('woman'),
      
      // Voices that typically sound rougher
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('tom'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('bruce'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('fred'),
    ];
    
    // Try each preference in order
    for (const preference of voicePreferences) {
      const preferredVoice = voices.find(preference);
      if (preferredVoice) {
        setSelectedVoice(preferredVoice);
        console.log(`🎙️ Selected rough male voice: ${preferredVoice.name} (${preferredVoice.lang})`);
        return;
      }
    }
    
    // If no preferred voice found, use default
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
      console.log(`🎙️ Using default voice: ${voices[0].name}`);
    }
  }, []);

  // Load voices when component mounts and when voices change
  useEffect(() => {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [loadVoices]);

  // Enhanced Bell Audio Functions with Web Audio API for authentic bell sounds
  const createBellSound = useCallback((frequency: number, duration: number) => {
    if (!bellEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillators for bell harmonics
      const fundamental = audioContext.createOscillator();
      const harmonic2 = audioContext.createOscillator();
      const harmonic3 = audioContext.createOscillator();
      
      // Create gain nodes for volume control
      const fundamentalGain = audioContext.createGain();
      const harmonic2Gain = audioContext.createGain();
      const harmonic3Gain = audioContext.createGain();
      const masterGain = audioContext.createGain();
      
      // Set frequencies for bell-like harmonics
      fundamental.frequency.setValueAtTime(frequency, audioContext.currentTime);
      harmonic2.frequency.setValueAtTime(frequency * 2.76, audioContext.currentTime); // Bell harmonic
      harmonic3.frequency.setValueAtTime(frequency * 5.42, audioContext.currentTime); // Bell harmonic
      
      // Use sine waves for clean bell tones
      fundamental.type = 'sine';
      harmonic2.type = 'sine';
      harmonic3.type = 'sine';
      
      // Connect oscillators to gain nodes
      fundamental.connect(fundamentalGain);
      harmonic2.connect(harmonic2Gain);
      harmonic3.connect(harmonic3Gain);
      
      // Connect gain nodes to master gain
      fundamentalGain.connect(masterGain);
      harmonic2Gain.connect(masterGain);
      harmonic3Gain.connect(masterGain);
      
      // Connect to output
      masterGain.connect(audioContext.destination);
      
      // Set initial volumes
      fundamentalGain.gain.setValueAtTime(0.6, audioContext.currentTime);
      harmonic2Gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      harmonic3Gain.gain.setValueAtTime(0.1, audioContext.currentTime);
      masterGain.gain.setValueAtTime(0.7, audioContext.currentTime);
      
      // Create bell envelope (quick attack, slow decay)
      const now = audioContext.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.7, now + 0.01); // Quick attack
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Slow decay
      
      // Start oscillators
      fundamental.start(now);
      harmonic2.start(now);
      harmonic3.start(now);
      
      // Stop oscillators
      fundamental.stop(now + duration);
      harmonic2.stop(now + duration);
      harmonic3.stop(now + duration);
      
      console.log(`🔔 Generated bell sound: ${frequency}Hz for ${duration}s`);
      
    } catch (error) {
      console.warn('Web Audio bell generation failed, using fallback:', error);
      // Fallback to original audio elements - call the playBell function directly with fallback logic
      try {
        let audioRef;
        switch (frequency) {
          case 523: // Start bell
            audioRef = startBellRef;
            break;
          case 659: // Minute bell  
            audioRef = minuteBellRef;
            break;
          case 440: // End bell
            audioRef = endBellRef;
            break;
          default:
            audioRef = minuteBellRef;
        }
        
        if (audioRef?.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch(e => console.warn('Fallback audio play failed:', e));
        }
      } catch (fallbackError) {
        console.warn('Fallback bell audio error:', fallbackError);
      }
    }
  }, [bellEnabled]);

  // Fallback bell function for when Web Audio fails
  const playBellFallback = useCallback((type: 'start' | 'end' | 'minute') => {
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
        audioRef.current.play().catch(e => console.warn('Fallback audio play failed:', e));
      }
    } catch (error) {
      console.warn('Fallback bell audio error:', error);
    }
  }, []);

  const playBell = useCallback((type: 'start' | 'end' | 'minute') => {
    if (!bellEnabled) return;
    
    // Use Web Audio API for authentic bell sounds
    switch (type) {
      case 'start':
        createBellSound(523, 3.0); // C5 note, 3 second decay
        break;
      case 'minute':
        createBellSound(659, 1.5); // E5 note, 1.5 second decay
        break;
      case 'end':
        createBellSound(440, 4.0); // A4 note, 4 second decay
        break;
    }
  }, [bellEnabled, createBellSound]);

  // 🎙️ Voice Synthesis with Rough Male Voice for Physical Stillness Training
  const announceTime = useCallback((remainingMinutes: number) => {
    if (!voiceEnabled || !selectedVoice) return;
    
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance();
        
        // Simple, direct messages focused on physical stillness training
        if (remainingMinutes === 0) {
          utterance.text = "Practice session complete";
        } else if (remainingMinutes === 1) {
          utterance.text = "One minute remaining";
        } else {
          utterance.text = `${remainingMinutes} minutes remaining`;
        }
        
        // Rougher, more masculine voice settings
        utterance.voice = selectedVoice;
        utterance.volume = 0.9;
        utterance.rate = 0.8; // Slightly faster, more direct
        utterance.pitch = 0.6; // Much lower pitch for rougher, deeper voice
        
        speechSynthesis.speak(utterance);
        console.log(`🎙️ Announced: "${utterance.text}" using ${selectedVoice.name}`);
      }
    } catch (error) {
      console.warn('Voice synthesis error:', error);
    }
  }, [voiceEnabled, selectedVoice]);

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
      
      // 5. Enhanced session data for focused contexts
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
      
      // 6. Add to focused contexts (this will handle debounced storage to comprehensiveUserData)
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
      // Still try to save to focused contexts as fallback
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

  // Start timer with wake lock
  const startTimer = async () => {
    setIsActive(true);
    setIsPaused(false);
    setIsRunning(true);
    
    // 🔒 Request wake lock to prevent screen from sleeping
    await requestWakeLock();
    
    // Play start bell
    playBell('start');
    
    // Simple start announcement focused on physical stillness
    if (voiceEnabled && selectedVoice) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance("Begin stillness training");
        utterance.voice = selectedVoice;
        utterance.volume = 0.9;
        utterance.rate = 0.8;
        utterance.pitch = 0.6; // Rough, deep voice
        speechSynthesis.speak(utterance);
      }, 2000); // Delay to avoid overlap with bell
    }
    
    // Store start time
    const now = new Date().toISOString();
    setSessionStartTime(now);
    sessionStorage.setItem('practiceStartTime', now);
    
    // Reset bell and voice tracking
    setLastBellMinute(0);
    setLastVoiceAnnouncement(0);
  };
  
  // Handle back button with wake lock cleanup
  const handleBack = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // 🔒 Release wake lock
    await releaseWakeLock();
    
    // Cancel any ongoing speech
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    onBack();
  };

  // Record session data with unified storage and wake lock cleanup
  const recordSession = async (isFullyCompleted: boolean) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // 🔒 Release wake lock
    await releaseWakeLock();
    
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
        actualMinutes: timeSpentMinutes,
        wakeLockUsed: wakeLockStatus === 'active'
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

  const handleTimerComplete = useCallback(async () => {
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    const sessionQuality = calculateSessionQuality(actualDuration, isFullyCompleted);

    // 🔒 Release wake lock
    await releaseWakeLock();

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
        sessionQuality: sessionQuality,
        wakeLockUsed: wakeLockStatus === 'active'
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
  }, [initialMinutes, timeRemaining, addEmotionalNote, onComplete, saveSessionToAllStorageLocations, calculateSessionQuality, getTLevel, playBell, announceTime, releaseWakeLock, wakeLockStatus]);

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
  }, [isRunning, isPaused, timeRemaining, checkMinuteBell]);

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
  const handleFastForward = async () => {
    const now = new Date().toISOString();
    
    // 🔒 Release wake lock
    await releaseWakeLock();
    
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
  
  // Clean up interval and wake lock on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      // Release wake lock
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

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

  // 🔒 Handle visibility change to maintain wake lock
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && wakeLock) {
        // Document became hidden, wake lock might be released
        setWakeLockStatus('background');
      } else if (!document.hidden && isActive && wakeLockEnabled) {
        // Document became visible again, re-request wake lock if needed
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, isActive, wakeLockEnabled, requestWakeLock]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get wake lock status indicator
  const getWakeLockIndicator = () => {
    switch (wakeLockStatus) {
      case 'active': return '🔒 Screen lock disabled';
      case 'released': return '⚠️ Screen lock re-enabled';
      case 'background': return '📱 App in background';
      case 'unsupported': return '❌ Wake lock not supported';
      case 'failed': return '❌ Wake lock failed';
      default: return '🔓 Screen may turn off';
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
          maxWidth: '450px',
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
          
          {/* Enhanced Audio Settings */}
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
              🔔 Authentic meditation bells (generated tones)
            </label>
            
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              🎙️ Voice commands (rough male voice)
            </label>
            
            {/* Voice Selection */}
            {voiceEnabled && availableVoices.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>
                  Voice Selection:
                </label>
                <select
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const voice = availableVoices.find(v => v.name === e.target.value);
                    if (voice) setSelectedVoice(voice);
                  }}
                  style={{
                    width: '100%',
                    padding: '5px',
                    borderRadius: '5px',
                    border: 'none',
                    fontSize: '11px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: '#333'
                  }}
                >
                  {availableVoices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang}) {voice.name.toLowerCase().includes('male') ? '👨' : voice.name.toLowerCase().includes('female') ? '👩' : ''}
                    </option>
                  ))}
                </select>
                {selectedVoice && (
                  <div style={{ fontSize: '10px', marginTop: '5px', opacity: 0.8 }}>
                    Selected: {selectedVoice.name} ({selectedVoice.lang})
                  </div>
                )}
              </div>
            )}
            
            <div style={{ 
              fontSize: '12px', 
              marginTop: '10px', 
              opacity: 0.8,
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px',
              borderRadius: '5px'
            }}>
              🔔 Authentic meditation bells with harmonic tones<br/>
              🎙️ Direct voice commands for physical stillness training
            </div>
          </div>

          {/* 🔒 Wake Lock Settings */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Screen Settings</h4>
            
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={wakeLockEnabled}
                onChange={(e) => setWakeLockEnabled(e.target.checked)}
                style={{ marginRight: '10px' }}
              />
              🔒 Keep screen awake during practice
            </label>
            
            <div style={{ 
              fontSize: '12px', 
              marginTop: '10px', 
              opacity: 0.8,
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '8px',
              borderRadius: '5px'
            }}>
              🔒 Prevents screen from sleeping during stillness training<br/>
              📱 Automatically releases when practice completes
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
      {/* Fallback audio elements with improved bell sounds */}
      <audio ref={startBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAESsAADEWAQAEABAAZGF0YTAEAAAAAP//AAABAP7/AAACAP3/AQADAP3/AQACAP7/AAABAP//AAABAP//AAABAPz/AgAEAPz/AwADAP3/AgACAP7/AQABAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA" type="audio/wav" />
      </audio>
      <audio ref={minuteBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAESsAADEWAQAEABAAZGF0YTAEAAAAAP//AAABAP7/AAACAP3/AQADAP3/AQACAP7/AAABAP//AAABAP//AAABAPz/AgAEAPz/AwADAP3/AgACAP7/AQABAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA" type="audio/wav" />
      </audio>
      <audio ref={endBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAESsAADEWAQAEABAAZGF0YTAEAAAAAP//AAABAP7/AAACAP3/AQADAP3/AQACAP7/AAABAP//AAABAP//AAABAPz/AgAEAPz/AwADAP3/AgACAP7/AQABAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA" type="audio/wav" />
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
      
      {/* 🔒 Wake Lock Status Indicator */}
      {isActive && (
        <div style={{
          background: wakeLockStatus === 'active' ? 'rgba(0, 255, 0, 0.1)' : 'rgba(255, 165, 0, 0.1)',
          padding: '8px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '12px',
          marginBottom: '10px',
          border: `1px solid ${wakeLockStatus === 'active' ? '#00ff00' : '#ffa500'}`
        }}>
          {getWakeLockIndicator()}
        </div>
      )}
      
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
              {bellEnabled && <span>🔔 Harmonic meditation bells</span>}
              {bellEnabled && voiceEnabled && <br/>}
              {voiceEnabled && selectedVoice && (
                <span>🎙️ Voice commands: {selectedVoice.name.split(' ')[0]}</span>
              )}
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