import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PracticeTimer.css';
import T1PracticeRecorder from './T1PracticeRecorder';
import T2PracticeRecorder from './T2PracticeRecorder';
import T3PracticeRecorder from './T3PracticeRecorder';
import T4PracticeRecorder from './T4PracticeRecorder';
import T5PracticeRecorder from './T5PracticeRecorder';
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
  const [sessionStartTimestamp, setSessionStartTimestamp] = useState<number | null>(null);
  const [totalPausedTime, setTotalPausedTime] = useState<number>(0);
  const [pauseStartTime, setPauseStartTime] = useState<number | null>(null);
  
  // Bell tracking states
  const [lastBellMinute, setLastBellMinute] = useState<number>(-1);
  const [bellsPlayed, setBellsPlayed] = useState<Set<number>>(new Set());
  
  // Voice settings
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [lastVoiceAnnouncement, setLastVoiceAnnouncement] = useState<number>(-1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Audio context management
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [bellEnabled, setBellEnabled] = useState<boolean>(true);
  const [isAudioInitialized, setIsAudioInitialized] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // Wake Lock
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [wakeLockEnabled, setWakeLockEnabled] = useState<boolean>(true);
  const [wakeLockStatus, setWakeLockStatus] = useState<string>('inactive');
  
  const { addPracticeSession } = usePractice();
  const { addEmotionalNote } = useWellness();
  
  // Refs
  const t1RecorderRef = useRef<any>(null);
  const t2RecorderRef = useRef<any>(null);
  const t3RecorderRef = useRef<any>(null);
  const t4RecorderRef = useRef<any>(null);
  const t5RecorderRef = useRef<any>(null);
  const startBellRef = useRef<HTMLAudioElement>(null);
  const endBellRef = useRef<HTMLAudioElement>(null);
  const minuteBellRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile devices
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
      return mobileRegex.test(userAgent);
    };
    setIsMobile(detectMobile());
  }, []);

  // Initialize AudioContext
  const initializeAudioContext = useCallback(async () => {
    if (audioContext || !bellEnabled) return audioContext;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return null;
      }
      
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        console.log('Audio context suspended, will resume on user interaction');
      }
      
      setAudioContext(ctx);
      setIsAudioInitialized(true);
      console.log('✅ Audio context initialized successfully');
      return ctx;
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      return null;
    }
  }, [audioContext, bellEnabled]);

  // Resume audio context
  const resumeAudioContext = useCallback(async () => {
    if (audioContext && audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
        console.log('✅ Audio context resumed');
      } catch (error) {
        console.error('Failed to resume audio context:', error);
      }
    }
  }, [audioContext]);

  // Wake Lock functions
  const requestWakeLock = useCallback(async () => {
    if (!wakeLockEnabled) return;
    
    try {
      if ('wakeLock' in navigator) {
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        setWakeLockStatus('active');
        console.log('✅ Screen wake lock activated');
        
        lock.addEventListener('release', () => {
          setWakeLockStatus('released');
          console.log('⚠️ Screen wake lock released');
        });
      } else {
        console.warn('⚠️ Wake Lock API not supported');
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

  // Voice functions
  const loadVoices = useCallback(() => {
    const voices = speechSynthesis.getVoices();
    setAvailableVoices(voices);
    
    const voicePreferences = [
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('deep') && voice.name.toLowerCase().includes('male'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('alex'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('daniel'),
      (voice: SpeechSynthesisVoice) => voice.name.toLowerCase().includes('male'),
    ];
    
    for (const preference of voicePreferences) {
      const preferredVoice = voices.find(preference);
      if (preferredVoice) {
        setSelectedVoice(preferredVoice);
        console.log(`🎙️ Selected voice: ${preferredVoice.name}`);
        return;
      }
    }
    
    if (voices.length > 0) {
      setSelectedVoice(voices[0]);
    }
  }, []);

  useEffect(() => {
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [loadVoices]);

  // Bell audio functions
  const createBellSound = useCallback(async (frequency: number, duration: number) => {
    if (!bellEnabled || !audioContext) return;
    
    const playFallbackBell = (freq: number) => {
      try {
        let audioRef;
        const type = freq === 523 ? 'start' : freq === 440 ? 'end' : 'minute';
        
        switch (type) {
          case 'start': audioRef = startBellRef; break;
          case 'end': audioRef = endBellRef; break;
          case 'minute': audioRef = minuteBellRef; break;
        }
        
        if (audioRef?.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.volume = 0.7;
          audioRef.current.play().catch(e => console.warn('Fallback audio play failed:', e));
        }
      } catch (error) {
        console.warn('Fallback bell audio error:', error);
      }
    };
    
    try {
      if (audioContext.state === 'closed') {
        console.warn('AudioContext is closed, reinitializing...');
        await initializeAudioContext();
        return;
      }
      
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      if (isMobile) {
        // Simple mobile bell
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
      } else {
        // Desktop harmonic bell
        const fundamental = audioContext.createOscillator();
        const harmonic2 = audioContext.createOscillator();
        const harmonic3 = audioContext.createOscillator();
        
        const fundamentalGain = audioContext.createGain();
        const harmonic2Gain = audioContext.createGain();
        const harmonic3Gain = audioContext.createGain();
        const masterGain = audioContext.createGain();
        
        fundamental.frequency.setValueAtTime(frequency, audioContext.currentTime);
        harmonic2.frequency.setValueAtTime(frequency * 2.76, audioContext.currentTime);
        harmonic3.frequency.setValueAtTime(frequency * 5.42, audioContext.currentTime);
        
        fundamental.type = 'sine';
        harmonic2.type = 'sine';
        harmonic3.type = 'sine';
        
        fundamental.connect(fundamentalGain);
        harmonic2.connect(harmonic2Gain);
        harmonic3.connect(harmonic3Gain);
        
        fundamentalGain.connect(masterGain);
        harmonic2Gain.connect(masterGain);
        harmonic3Gain.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        fundamentalGain.gain.setValueAtTime(0.6, audioContext.currentTime);
        harmonic2Gain.gain.setValueAtTime(0.3, audioContext.currentTime);
        harmonic3Gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        masterGain.gain.setValueAtTime(0.7, audioContext.currentTime);
        
        const now = audioContext.currentTime;
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.7, now + 0.01);
        masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        fundamental.start(now);
        harmonic2.start(now);
        harmonic3.start(now);
        
        fundamental.stop(now + duration);
        harmonic2.stop(now + duration);
        harmonic3.stop(now + duration);
      }
      
    } catch (error) {
      console.warn('Web Audio bell generation failed, using fallback:', error);
      playFallbackBell(frequency);
    }
  }, [bellEnabled, audioContext, isMobile, initializeAudioContext]);

  const playBell = useCallback(async (type: 'start' | 'end' | 'minute') => {
    if (!bellEnabled) return;
    
    if (!audioContext) {
      await initializeAudioContext();
    }
    
    await resumeAudioContext();
    
    switch (type) {
      case 'start': await createBellSound(523, 3.0); break;
      case 'minute': await createBellSound(659, 1.5); break;
      case 'end': await createBellSound(440, 4.0); break;
    }
  }, [bellEnabled, audioContext, initializeAudioContext, resumeAudioContext, createBellSound]);

  // Voice announcements
  const announceTime = useCallback((remainingMinutes: number) => {
    if (!voiceEnabled || !selectedVoice) return;
    
    try {
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance();
        
        if (remainingMinutes === 0) {
          utterance.text = "Practice session complete";
        } else if (remainingMinutes === 1) {
          utterance.text = "One minute remaining";
        } else {
          utterance.text = `${remainingMinutes} minutes remaining`;
        }
        
        utterance.voice = selectedVoice;
        utterance.volume = 0.9;
        utterance.rate = 0.8;
        utterance.pitch = 0.6;
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.warn('Voice synthesis error:', error);
    }
  }, [voiceEnabled, selectedVoice]);

  // Bell and voice timing
  const checkMinuteBell = useCallback((remainingSeconds: number) => {
    if (!isRunning || isPaused) return;
    
    const totalSeconds = initialMinutes * 60;
    const elapsedSeconds = totalSeconds - remainingSeconds;
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);
    const remainingMinutes = Math.ceil(remainingSeconds / 60);
    
    if (elapsedMinutes > 0 && !bellsPlayed.has(elapsedMinutes)) {
      playBell('minute');
      setBellsPlayed(prev => new Set([...prev, elapsedMinutes]));
    }
    
    if (voiceEnabled && remainingMinutes > 0) {
      if (remainingMinutes % 5 === 0 && remainingMinutes !== lastVoiceAnnouncement) {
        announceTime(remainingMinutes);
        setLastVoiceAnnouncement(remainingMinutes);
      } else if (remainingMinutes === 1 && lastVoiceAnnouncement !== 1) {
        announceTime(1);
        setLastVoiceAnnouncement(1);
      }
    }
  }, [initialMinutes, bellsPlayed, voiceEnabled, lastVoiceAnnouncement, playBell, announceTime, isRunning, isPaused]);

  // Helper functions
  const getTLevel = useCallback((): string => {
    const patterns = [
      /^(T[1-5])/i,
      /T([1-5])/i,
      /(Stage\s*1.*T[1-5])/i,
      /Physical\s*Stillness.*([1-5])/i
    ];
    
    for (const pattern of patterns) {
      const match = stageLevel.match(pattern);
      if (match) {
        if (match[1]?.toLowerCase().startsWith('t')) {
          return match[1].toLowerCase();
        } else if (match[1]) {
          return `t${match[1]}`;
        }
      }
    }
    
    return 't1';
  }, [stageLevel]);
  
  const getTLevelNumber = useCallback((tLevel: string): number => {
    const levelMap: { [key: string]: number } = { 't1': 1, 't2': 2, 't3': 3, 't4': 4, 't5': 5 };
    return levelMap[tLevel] || 1;
  }, []);

  const calculateSessionQuality = useCallback((duration: number, completed: boolean) => {
    let quality = 7;
    if (completed) quality += 1.5;
    const durationFactor = Math.min(1, duration / (10 * 60));
    quality = quality * (0.8 + 0.2 * durationFactor);
    return Math.min(10, Math.max(1, Math.round(quality * 10) / 10));
  }, []);

  // Session saving
  const saveSessionToAllStorageLocations = useCallback((sessionData: any, isCompleted: boolean) => {
    const tLevel = getTLevel();
    const tLevelUpper = tLevel.toUpperCase();
    const timestamp = new Date().toISOString();
    
    try {
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

      const existingSessions = JSON.parse(localStorage.getItem(`${tLevelUpper}Sessions`) || '[]');
      existingSessions.push(sessionObject);
      localStorage.setItem(`${tLevelUpper}Sessions`, JSON.stringify(existingSessions));
      
      if (isCompleted) {
        localStorage.setItem(`${tLevelUpper}Complete`, 'true');
        localStorage.setItem(`${tLevelUpper}LastCompleted`, timestamp);
      }
      
      const existingProgress = JSON.parse(localStorage.getItem('stage1Progress') || '{"T1": 0, "T2": 0, "T3": 0, "T4": 0, "T5": 0}');
      existingProgress[tLevelUpper] = existingSessions.filter((s: any) => s.isCompleted).length;
      localStorage.setItem('stage1Progress', JSON.stringify(existingProgress));
      
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
          present_attachment: 0, present_neutral: 0, present_aversion: 0,
          past_attachment: 0, past_neutral: 0, past_aversion: 0,
          future_attachment: 0, future_neutral: 0, future_aversion: 0
        }
      };
      
      addPracticeSession(enhancedSessionData);
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: `${tLevelUpper}Sessions`,
        newValue: JSON.stringify(existingSessions),
        storageArea: localStorage
      }));
      
      console.log(`✅ SESSION SAVED SUCCESSFULLY! - ${tLevelUpper}`);
      return sessionObject;
      
    } catch (error) {
      console.error('❌ Error saving session to storage:', error);
    }
  }, [initialMinutes, addPracticeSession, getTLevel, getTLevelNumber]);

  // Timer completion handler
  const handleTimerComplete = useCallback(async () => {
    console.log('⏰ TIMER COMPLETED');
    
    setIsRunning(false);
    setIsActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const endTime = new Date().toISOString();
    const actualDuration = Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    const sessionQuality = calculateSessionQuality(actualDuration, isFullyCompleted);

    await releaseWakeLock();
    await playBell('end');
    announceTime(0);

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

    saveSessionToAllStorageLocations(sessionData, isFullyCompleted);

    const completionMessage = isFullyCompleted 
      ? `Completed full ${initialMinutes}-minute ${getTLevel().toUpperCase()} stillness session! 🎯`
      : `Completed ${Math.round(actualDuration / 60)}-minute ${getTLevel().toUpperCase()} stillness session.`;

    addEmotionalNote({
      content: `${completionMessage} Building foundation for deeper mindfulness practice. Quality rating: ${sessionQuality}/10.`,
      emotion: isFullyCompleted ? 'accomplished' : 'content',
      energyLevel: sessionQuality >= 8 ? 8 : sessionQuality >= 6 ? 7 : 6,
      intensity: sessionQuality >= 8 ? 8 : sessionQuality >= 6 ? 7 : 6,
      tags: ['stillness-practice', 'stage-1', 'basic-meditation', getTLevel()],
      gratitude: ['meditation practice', 'inner stillness', isFullyCompleted ? 'session completion' : 'practice effort']
    });

    onComplete();
  }, [initialMinutes, timeRemaining, addEmotionalNote, onComplete, saveSessionToAllStorageLocations, calculateSessionQuality, getTLevel, playBell, announceTime, releaseWakeLock, wakeLockStatus]);

  // Timer effect
  useEffect(() => {
    if (isRunning && !isPaused && sessionStartTimestamp) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = Math.floor((now - sessionStartTimestamp - totalPausedTime) / 1000);
        const newTimeRemaining = Math.max(0, (initialMinutes * 60) - elapsed);
        
        setTimeRemaining(newTimeRemaining);
        
        if (newTimeRemaining > 0) {
          checkMinuteBell(newTimeRemaining);
        }
      };
      
      updateTimer();
      intervalRef.current = setInterval(updateTimer, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, isPaused, sessionStartTimestamp, totalPausedTime, initialMinutes, checkMinuteBell]);

  // Timer completion effect
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // Start practice directly from setup
  const handleStart = async () => {
    if (initialMinutes < 5) {
      alert('Practice requires a minimum of 5 minutes.');
      return;
    }
    
    setCurrentStage('practice');
    
    const totalSeconds = initialMinutes * 60;
    setTimeRemaining(totalSeconds);
    
    await initializeAudioContext();
    await resumeAudioContext();
    
    const now = Date.now();
    setSessionStartTimestamp(now);
    setTotalPausedTime(0);
    setIsActive(true);
    setIsPaused(false);
    setIsRunning(true);
    
    setLastBellMinute(-1);
    setBellsPlayed(new Set());
    setLastVoiceAnnouncement(-1);
    
    await requestWakeLock();
    await playBell('start');
    
    if (voiceEnabled && selectedVoice) {
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance("Begin stillness training");
        utterance.voice = selectedVoice;
        utterance.volume = 0.9;
        utterance.rate = 0.8;
        utterance.pitch = 0.6;
        speechSynthesis.speak(utterance);
      }, 2000);
    }
    
    const nowISO = new Date(now).toISOString();
    setSessionStartTime(nowISO);
    sessionStorage.setItem('practiceStartTime', nowISO);
  };

  // Control handlers
  const handleBack = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    await releaseWakeLock();
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    if (audioContext && audioContext.state !== 'closed') {
      try {
        audioContext.close();
        setAudioContext(null);
      } catch (error) {
        console.warn('AudioContext cleanup error:', error);
      }
    }
    
    onBack();
  };

  const handlePause = () => {
    if (!isPaused && isRunning) {
      setPauseStartTime(Date.now());
      setIsPaused(true);
      setIsRunning(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleResume = () => {
    if (isPaused && pauseStartTime) {
      const pauseDuration = Date.now() - pauseStartTime;
      setTotalPausedTime(prev => prev + pauseDuration);
      setPauseStartTime(null);
      setIsPaused(false);
      setIsRunning(true);
    }
  };

  const handleSkip = () => {
    const now = new Date().toISOString();
    const timeSpentMs = sessionStartTime 
      ? new Date(now).getTime() - new Date(sessionStartTime).getTime() 
      : 0;
    const timeSpentMinutes = Math.round(timeSpentMs / (1000 * 60));
    
    const sessionData = {
      duration: timeSpentMinutes || initialMinutes,
      rating: 6,
      notes: `${getTLevel().toUpperCase()} physical stillness training`,
      metadata: {
        startTime: sessionStartTime,
        endTime: now,
        wasFullyCompleted: false,
        initialMinutes: initialMinutes,
        actualMinutes: timeSpentMinutes
      }
    };
    
    saveSessionToAllStorageLocations(sessionData, false);
    
    const reflectionData = {
      level: getTLevel(),
      targetDuration: initialMinutes,
      timeSpent: timeSpentMinutes || 0,
      isCompleted: false,
      completedAt: now
    };
    
    sessionStorage.setItem('lastPracticeData', JSON.stringify(reflectionData));
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if ('speechSynthesis' in window) speechSynthesis.cancel();
      releaseWakeLock();
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(() => {});
      }
    };
  }, [releaseWakeLock, audioContext]);

  // Setup with props
  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= 5) {
      setInitialMinutes(propInitialMinutes);
      setCurrentStage('setup');
    }
  }, [propInitialMinutes]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (wakeLock) {
          setWakeLockStatus('background');
        }
      } else if (!document.hidden && isActive && wakeLockEnabled) {
        requestWakeLock();
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(error => {
            console.warn('Failed to resume AudioContext:', error);
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, isActive, wakeLockEnabled, requestWakeLock, audioContext]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Wake lock indicator
  const getWakeLockIndicator = () => {
    if (isActive) return '🔒 Screen lock disabled';
    
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
          <h3 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: '600' }}>
            Duration (minimum 5 minutes)
          </h3>
          <input
            type="number"
            min="5"
            max="90"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || 5)}
            style={{
              fontSize: '28px',
              fontWeight: '700',
              padding: '12px 16px',
              width: '120px',
              textAlign: 'center',
              borderRadius: '12px',
              border: '2px solid #5865F2',
              marginBottom: '20px',
              backgroundColor: '#FFFFFF',
              color: '#212529',
              minHeight: '60px',
              outline: 'none'
            }}
          />
          
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
              🔔 {isMobile ? 'Meditation bells (mobile optimized)' : 'Authentic meditation bells (generated tones)'}
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
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

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
      <audio ref={startBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAESsAADEWAQAEABAAZGF0YTAEAAAAAP//AAABAP7/AAACAP3/AQADAP3/AQACAP7/AAABAP//AAABAP//AAABAPz/AgAEAPz/AwADAP3/AgACAP7/AQABAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA" type="audio/wav" />
      </audio>
      <audio ref={minuteBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAESsAADEWAQAEABAAZGF0YTAEAAAAAP//AAABAP7/AAACAP3/AQADAP3/AQACAP7/AAABAP//AAABAP//AAABAPz/AgAEAPz/AwADAP3/AgACAP7/AQABAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA" type="audio/wav" />
      </audio>
      <audio ref={endBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRlQEAABXQVZFZm10IBAAAAABAAEAESsAADEWAQAEABAAZGF0YTAEAAAAAP//AAABAP7/AAACAP3/AQADAP3/AQACAP7/AAABAP//AAABAP//AAABAPz/AgAEAPz/AwADAP3/AgACAP7/AQABAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA//8AAP//AAABAP//AAD//wAAAQD//wAA//8AAAEA" type="audio/wav" />
      </audio>
      
      <div style={{ display: 'none' }}>
        <T1PracticeRecorder onRecordSession={() => {}} ref={t1RecorderRef} />
        <T2PracticeRecorder onRecordSession={() => {}} ref={t2RecorderRef} />
        <T3PracticeRecorder onRecordSession={() => {}} ref={t3RecorderRef} />
        <T4PracticeRecorder onRecordSession={() => {}} ref={t4RecorderRef} />
        <T5PracticeRecorder onRecordSession={() => {}} ref={t5RecorderRef} />
      </div>
      
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '15px',
        minHeight: '50px'
      }}>
        <button onClick={handleBack} style={{
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
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            fontSize: '64px', 
            fontWeight: 'bold',
            margin: '20px 0',
            color: '#2c3e50'
          }}>{formatTime(timeRemaining)}</div>
          <div style={{
            fontSize: '16px',
            color: '#666',
            margin: '10px 0',
            lineHeight: '1.4'
          }}>
            {isPaused ? "Practice paused" : "Maintain physical stillness"}
          </div>
          {(bellEnabled || voiceEnabled) && isActive && (
            <div style={{
              fontSize: '12px',
              color: '#888',
              marginTop: '5px'
            }}>
              {bellEnabled && <span>🔔 {isMobile ? 'Mobile-optimized' : 'Harmonic'} meditation bells</span>}
              {bellEnabled && voiceEnabled && <br/>}
              {voiceEnabled && selectedVoice && (
                <span>🎙️ Voice commands: {selectedVoice.name.split(' ')[0]}</span>
              )}
            </div>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '15px',
          width: '100%',
          maxWidth: '280px'
        }}>
          {isPaused ? (
            <button onClick={handleResume} style={{
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
            <button onClick={handlePause} style={{
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
          
          <button onClick={handleSkip} style={{
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
        </div>

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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeTimer;