// 🎯 COMPLETE PracticeTimer.tsx - All Features + Wake Lock Fixes
// File: src/PracticeTimer.tsx
// ✅ FIXED: Wake lock functionality with proper status handling

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
  // ✅ PRESERVE: All original state
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
  
  const [lastPracticeData, setLastPracticeData] = useState<any>(null);
  
  // ✅ PRESERVE: Bell tracking states
  const [lastBellMinute, setLastBellMinute] = useState<number>(-1);
  const [bellsPlayed, setBellsPlayed] = useState<Set<number>>(new Set());
  
  // ✅ PRESERVE: Voice settings
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [lastVoiceAnnouncement, setLastVoiceAnnouncement] = useState<number>(-1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // ✅ PRESERVE: Audio context management
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [bellEnabled, setBellEnabled] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  // ✅ FIXED: Enhanced wake lock state management
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [wakeLockEnabled, setWakeLockEnabled] = useState<boolean>(true);
  const [wakeLockStatus, setWakeLockStatus] = useState<string>('inactive');
  
  // ✅ PRESERVE: Context usage
  const { addPracticeSession } = usePractice();
  const { addEmotionalNote } = useWellness();
  
  // ✅ PRESERVE: All refs
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

  // ✅ PRESERVE: Mobile detection
  useEffect(() => {
    const detectMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i;
      return mobileRegex.test(userAgent);
    };
    setIsMobile(detectMobile());
  }, []);

  // ✅ IMPROVED: Enhanced audio context functionality with better initialization
  const initializeAudioContext = useCallback(async () => {
    if (audioContext && audioContext.state !== 'closed') {
      console.log('🔊 Audio context already initialized');
      return audioContext;
    }
    
    if (!bellEnabled) {
      console.log('🔇 Bell disabled, skipping audio context initialization');
      return null;
    }
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('⚠️ Web Audio API not supported in this browser');
        return null;
      }
      
      console.log('🔧 Initializing new audio context...');
      const ctx = new AudioContextClass();
      
      if (ctx.state === 'suspended') {
        console.log('🔊 Audio context created in suspended state (normal on mobile)');
      } else {
        console.log('🔊 Audio context created in running state');
      }
      
      setAudioContext(ctx);
      console.log('✅ Audio context initialized successfully');
      
      return ctx;
    } catch (error) {
      console.error('❌ Failed to initialize audio context:', error);
      return null;
    }
  }, [audioContext, bellEnabled]);

  const resumeAudioContext = useCallback(async () => {
    if (!audioContext) {
      console.log('🔊 No audio context to resume');
      return;
    }
    
    if (audioContext.state === 'suspended') {
      try {
        console.log('🔄 Resuming suspended audio context...');
        await audioContext.resume();
        console.log('✅ Audio context resumed successfully');
      } catch (error) {
        console.error('❌ Failed to resume audio context:', error);
      }
    } else {
      console.log(`🔊 Audio context already in ${audioContext.state} state`);
    }
  }, [audioContext]);

  // ✅ FIXED: Improved wake lock request with better error handling
  const requestWakeLock = useCallback(async () => {
    if (!wakeLockEnabled) {
      console.log('⚠️ Wake lock disabled by user');
      setWakeLockStatus('disabled');
      return;
    }
    
    try {
      if ('wakeLock' in navigator) {
        console.log('🔒 Requesting wake lock...');
        const lock = await (navigator as any).wakeLock.request('screen');
        setWakeLock(lock);
        setWakeLockStatus('active');
        console.log('✅ Screen wake lock activated successfully');
        
        lock.addEventListener('release', () => {
          setWakeLockStatus('released');
          setWakeLock(null);
          console.log('⚠️ Screen wake lock was released');
        });
      } else {
        console.warn('⚠️ Wake Lock API not supported in this browser');
        setWakeLockStatus('unsupported');
      }
    } catch (error: any) {
      console.error('❌ Wake lock request failed:', error);
      setWakeLockStatus('failed');
      
      if (error.name === 'NotAllowedError') {
        console.error('Wake lock denied - user might have denied permission');
      } else if (error.name === 'AbortError') {
        console.error('Wake lock request was aborted');
      }
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

  // ✅ FIXED: Add wake lock toggle for user control
  const toggleWakeLock = useCallback(async () => {
    if (wakeLock && wakeLockStatus === 'active') {
      await releaseWakeLock();
    } else if (wakeLockEnabled) {
      await requestWakeLock();
    }
  }, [wakeLock, wakeLockStatus, wakeLockEnabled, releaseWakeLock, requestWakeLock]);

  // ✅ PRESERVE: Voice functions
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

  // ✅ IMPROVED: Enhanced bell audio functions with better reliability
  const createBellSound = useCallback(async (frequency: number, duration: number) => {
    if (!bellEnabled) {
      console.log('🔇 Bells disabled by user');
      return;
    }
    
    // Enhanced fallback with better audio data
    const playFallbackBell = async (freq: number) => {
      try {
        const type = freq === 523 ? 'start' : freq === 440 ? 'end' : 'minute';
        let audioElement: HTMLAudioElement | null = null;
        
        switch (type) {
          case 'start': 
            audioElement = startBellRef.current; 
            break;
          case 'end': 
            audioElement = endBellRef.current; 
            break;
          case 'minute': 
          default:
            audioElement = minuteBellRef.current; 
            break;
        }
        
        if (audioElement) {
          console.log(`🔔 Playing fallback ${type} bell`);
          audioElement.currentTime = 0;
          audioElement.volume = 0.8;
          
          // Force audio context resume for mobile
          if (audioContext && audioContext.state === 'suspended') {
            try {
              await audioContext.resume();
            } catch (e) {
              console.warn('Could not resume audio context:', e);
            }
          }
          
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch((e: Error) => {
              console.warn(`Fallback ${type} bell play failed:`, e);
              // Try alternative approach for mobile
              if (isMobile && audioElement) {
                setTimeout(() => {
                  try {
                    audioElement!.play();
                  } catch (retryError) {
                    console.warn('Retry fallback failed:', retryError);
                  }
                }, 100);
              }
            });
          }
        } else {
          console.warn(`No audio reference found for ${type} bell`);
        }
      } catch (error) {
        console.warn('Fallback bell audio error:', error);
      }
    };

    // Try Web Audio API first, fallback to HTML audio
    try {
      if (!audioContext) {
        console.log('🔔 No audio context, using fallback bell');
        await playFallbackBell(frequency);
        return;
      }

      if (audioContext.state === 'closed') {
        console.warn('🔔 AudioContext closed, using fallback bell');
        await playFallbackBell(frequency);
        return;
      }
      
      if (audioContext.state === 'suspended') {
        console.log('🔔 Resuming suspended audio context...');
        await audioContext.resume();
      }

      console.log(`🔔 Generating ${frequency}Hz bell for ${duration}s`);
      
      if (isMobile) {
        // Simplified mobile bell with better envelope
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const now = audioContext.currentTime;
        const attackTime = 0.02;
        const releaseTime = duration - 0.02;
        
        // Better envelope for mobile
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.6, now + attackTime);
        gainNode.gain.setValueAtTime(0.6, now + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + releaseTime);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
        
        console.log('✅ Mobile bell generated successfully');
      } else {
        // Enhanced desktop harmonic bell with better resonance
        const fundamental = audioContext.createOscillator();
        const harmonic2 = audioContext.createOscillator();
        const harmonic3 = audioContext.createOscillator();
        const harmonic4 = audioContext.createOscillator();
        
        const fundamentalGain = audioContext.createGain();
        const harmonic2Gain = audioContext.createGain();
        const harmonic3Gain = audioContext.createGain();
        const harmonic4Gain = audioContext.createGain();
        const masterGain = audioContext.createGain();
        
        // More authentic bell harmonics
        fundamental.frequency.setValueAtTime(frequency, audioContext.currentTime);
        harmonic2.frequency.setValueAtTime(frequency * 2.76, audioContext.currentTime);
        harmonic3.frequency.setValueAtTime(frequency * 5.04, audioContext.currentTime);
        harmonic4.frequency.setValueAtTime(frequency * 8.2, audioContext.currentTime);
        
        fundamental.type = 'sine';
        harmonic2.type = 'sine';
        harmonic3.type = 'sine';
        harmonic4.type = 'sine';
        
        fundamental.connect(fundamentalGain);
        harmonic2.connect(harmonic2Gain);
        harmonic3.connect(harmonic3Gain);
        harmonic4.connect(harmonic4Gain);
        
        fundamentalGain.connect(masterGain);
        harmonic2Gain.connect(masterGain);
        harmonic3Gain.connect(masterGain);
        harmonic4Gain.connect(masterGain);
        masterGain.connect(audioContext.destination);
        
        // Balanced harmonic mix
        fundamentalGain.gain.setValueAtTime(0.7, audioContext.currentTime);
        harmonic2Gain.gain.setValueAtTime(0.4, audioContext.currentTime);
        harmonic3Gain.gain.setValueAtTime(0.2, audioContext.currentTime);
        harmonic4Gain.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        const now = audioContext.currentTime;
        const attackTime = 0.01;
        const sustainTime = duration * 0.3;
        const releaseTime = duration - sustainTime - attackTime;
        
        // Realistic bell envelope
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.8, now + attackTime);
        masterGain.gain.exponentialRampToValueAtTime(0.6, now + sustainTime);
        masterGain.gain.exponentialRampToValueAtTime(0.01, now + sustainTime + releaseTime);
        masterGain.gain.linearRampToValueAtTime(0, now + duration);
        
        fundamental.start(now);
        harmonic2.start(now);
        harmonic3.start(now);
        harmonic4.start(now);
        
        fundamental.stop(now + duration);
        harmonic2.stop(now + duration);
        harmonic3.stop(now + duration);
        harmonic4.stop(now + duration);
        
        console.log('✅ Desktop harmonic bell generated successfully');
      }
      
    } catch (error) {
      console.warn('🔔 Web Audio bell generation failed, using fallback:', error);
      await playFallbackBell(frequency);
    }
  }, [bellEnabled, audioContext, isMobile]);

  const playBell = useCallback(async (type: 'start' | 'end' | 'minute') => {
    if (!bellEnabled) {
      console.log('🔇 Bell playback disabled');
      return;
    }
    
    console.log(`🔔 Playing ${type} bell...`);
    
    // Initialize audio context if needed
    if (!audioContext) {
      console.log('🔧 Initializing audio context for bell...');
      await initializeAudioContext();
    }
    
    // Resume audio context if suspended
    await resumeAudioContext();
    
    // Play appropriate bell tone
    try {
      switch (type) {
        case 'start': 
          console.log('🟢 Start bell: 523Hz for 3 seconds');
          await createBellSound(523, 3.0); 
          break;
        case 'minute': 
          console.log('🟡 Minute bell: 659Hz for 1.5 seconds');
          await createBellSound(659, 1.5); 
          break;
        case 'end': 
          console.log('🔴 End bell: 440Hz for 4 seconds');
          await createBellSound(440, 4.0); 
          break;
      }
    } catch (error) {
      console.error(`❌ Failed to play ${type} bell:`, error);
    }
  }, [bellEnabled, audioContext, initializeAudioContext, resumeAudioContext, createBellSound]);

  // ✅ PRESERVE: Voice announcements
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

  // ✅ PRESERVE: Bell and voice timing
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

  // ✅ PRESERVE: Helper functions
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

  // ✅ PRESERVE: Session saving
  const saveSessionToFirebase = useCallback(async (sessionData: any, isCompleted: boolean) => {
    const tLevel = getTLevel();
    const timestamp = new Date().toISOString();
    
    console.log('🎯 SINGLE-POINT SESSION SAVING:', { tLevel, isCompleted, sessionData });
    
    try {
      const enhancedSessionData = {
        timestamp: timestamp,
        duration: sessionData.duration || initialMinutes,
        sessionType: 'meditation' as const,
        stageLevel: getTLevelNumber(tLevel),
        stageLabel: `${tLevel.toUpperCase()}: Physical Stillness Training`,
        tLevel: tLevel.toUpperCase(),
        level: tLevel,
        rating: sessionData.rating || (isCompleted ? 8 : 6),
        notes: sessionData.notes || `${tLevel.toUpperCase()} physical stillness training (${initialMinutes} minutes)`,
        presentPercentage: isCompleted ? 85 : 70,
        isCompleted: isCompleted,
        completed: isCompleted,
        environment: {
          posture: 'selected',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 0, present_neutral: 0, present_aversion: 0,
          past_attachment: 0, past_neutral: 0, past_aversion: 0,
          future_attachment: 0, future_neutral: 0, future_aversion: 0
        },
        metadata: {
          ...sessionData.metadata,
          tLevel: tLevel,
          isCompleted: isCompleted,
          targetDuration: initialMinutes,
          actualDuration: sessionData.duration || initialMinutes,
          wakeLockUsed: wakeLockStatus === 'active'
        }
      };
      
      await addPracticeSession(enhancedSessionData);
      
      console.log(`✅ SINGLE-POINT SESSION SAVED! T-level: ${tLevel.toUpperCase()}`);
      
      return enhancedSessionData;
      
    } catch (error) {
      console.error('❌ Error saving session to Firebase:', error);
      throw error;
    }
  }, [initialMinutes, addPracticeSession, getTLevel, getTLevelNumber, wakeLockStatus]);

  // ✅ FIXED: Don't release wake lock on timer completion
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

    // ✅ FIXED: Don't release wake lock automatically - let user control it
    // await releaseWakeLock(); // REMOVED

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

    try {
      await saveSessionToFirebase(sessionData, isFullyCompleted);

      const completionMessage = isFullyCompleted 
        ? `Completed full ${initialMinutes}-minute ${getTLevel().toUpperCase()} stillness session! 🎯`
        : `Completed ${Math.round(actualDuration / 60)}-minute ${getTLevel().toUpperCase()} stillness session.`;

      await addEmotionalNote({
        content: `${completionMessage} Building foundation for deeper mindfulness practice. Quality rating: ${sessionQuality}/10.`,
        emotion: isFullyCompleted ? 'accomplished' : 'content',
        energyLevel: sessionQuality >= 8 ? 8 : sessionQuality >= 6 ? 7 : 6,
        intensity: sessionQuality >= 8 ? 8 : sessionQuality >= 6 ? 7 : 6,
        tags: ['stillness-practice', 'stage-1', 'basic-meditation', getTLevel()],
        gratitude: ['meditation practice', 'inner stillness', isFullyCompleted ? 'session completion' : 'practice effort']
      });

      const reflectionData = {
        level: getTLevel(),
        targetDuration: initialMinutes,
        timeSpent: Math.round(actualDuration / 60),
        isCompleted: isFullyCompleted,
        completedAt: endTime,
        sessionQuality: sessionQuality
      };
      setLastPracticeData(reflectionData);

      onComplete();

    } catch (error) {
      console.error('❌ Error completing session:', error);
      alert('Failed to save session. Please try again.');
    }
  }, [initialMinutes, timeRemaining, addEmotionalNote, onComplete, saveSessionToFirebase, calculateSessionQuality, getTLevel, playBell, announceTime, wakeLockStatus]);

  // ✅ PRESERVE: Timer effects
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

  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // ✅ PRESERVE: Control handlers
  const handleStart = async () => {
    if (initialMinutes < 5) {
      alert('Practice requires a minimum of 5 minutes.');
      return;
    }
    
    setCurrentStage('practice');
    
    const totalSeconds = initialMinutes * 60;
    setTimeRemaining(totalSeconds);
    
    // ✅ IMPROVED: Better audio initialization for practice start
    if (bellEnabled) {
      console.log('🔧 Initializing audio for practice session...');
      await initializeAudioContext();
      await resumeAudioContext();
      
      // Test if audio context is working
      if (audioContext && audioContext.state !== 'running') {
        console.warn('⚠️ Audio context not in running state, may need user interaction');
      }
    }
    
    const now = Date.now();
    setSessionStartTimestamp(now);
    setTotalPausedTime(0);
    setIsActive(true);
    setIsPaused(false);
    setIsRunning(true);
    
    setBellsPlayed(new Set());
    setLastVoiceAnnouncement(-1);
    
    // ✅ IMPROVED: Better wake lock handling
    if (wakeLockEnabled) {
      await requestWakeLock();
    }
    
    // ✅ IMPROVED: Play start bell with better error handling
    if (bellEnabled) {
      console.log('🔔 Playing session start bell...');
      await playBell('start');
    }
    
    // ✅ IMPROVED: Voice announcement with better timing
    if (voiceEnabled && selectedVoice) {
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance("Begin stillness training");
          utterance.voice = selectedVoice;
          utterance.volume = 0.9;
          utterance.rate = 0.8;
          utterance.pitch = 0.6;
          speechSynthesis.speak(utterance);
          console.log('🎙️ Session start announcement played');
        } catch (error) {
          console.warn('Voice announcement failed:', error);
        }
      }, 2000);
    }
    
    const nowISO = new Date(now).toISOString();
    setSessionStartTime(nowISO);
    
    console.log('✅ Practice session started successfully');
  };

  // ✅ FIXED: Enhanced handleBack to properly clean up wake lock
  const handleBack = async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Always release wake lock when leaving practice
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

  const handleSkip = async () => {
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
    
    try {
      await saveSessionToFirebase(sessionData, false);
      
      const reflectionData = {
        level: getTLevel(),
        targetDuration: initialMinutes,
        timeSpent: timeSpentMinutes || 0,
        isCompleted: false,
        completedAt: now
      };
      setLastPracticeData(reflectionData);
      
      onComplete();
    } catch (error) {
      console.error('❌ Error saving skipped session:', error);
      alert('Failed to save session. Please try again.');
    }
  };

  // Development fast-forward
  const fastForwardMinutes = (minutes: number) => {
    if (process.env.NODE_ENV !== 'production') {
      const secondsToReduce = minutes * 60;
      const newTimeRemaining = Math.max(0, timeRemaining - secondsToReduce);
      setTimeRemaining(newTimeRemaining);
    }
  };

  // ✅ PRESERVE: Cleanup effects
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

  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= 5) {
      setInitialMinutes(propInitialMinutes);
      setCurrentStage('setup');
    }
  }, [propInitialMinutes]);

  // ✅ FIXED: Enhanced visibility change handler with wake lock recovery
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('🔄 Tab went to background, timer continues...');
        if (wakeLock) {
          setWakeLockStatus('background');
        }
      } else if (!document.hidden && isActive) {
        console.log('🔄 Tab back to foreground, resyncing...');
        
        // Re-request wake lock if it was released
        if (wakeLockEnabled && (!wakeLock || wakeLockStatus !== 'active')) {
          console.log('🔒 Re-requesting wake lock after returning to foreground...');
          requestWakeLock();
        }
        
        if (audioContext && audioContext.state === 'suspended') {
          audioContext.resume().catch(error => {
            console.warn('Failed to resume AudioContext:', error);
          });
        }
        if (sessionStartTimestamp && isRunning && !isPaused) {
          const now = Date.now();
          const elapsed = Math.floor((now - sessionStartTimestamp - totalPausedTime) / 1000);
          const newTimeRemaining = Math.max(0, (initialMinutes * 60) - elapsed);
          setTimeRemaining(newTimeRemaining);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [wakeLock, isActive, wakeLockEnabled, requestWakeLock, audioContext, 
      sessionStartTimestamp, isRunning, isPaused, totalPausedTime, initialMinutes, wakeLockStatus]);

  // ✅ DEBUGGING: Wake lock status debugging
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔍 Wake Lock Status Changed:', {
        wakeLockStatus,
        wakeLockEnabled,
        hasWakeLock: !!wakeLock,
        isActive,
        documentHidden: document.hidden
      });
    }
  }, [wakeLockStatus, wakeLockEnabled, wakeLock, isActive]);

  // ✅ PRESERVE: Utility functions
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ FIXED: Clear and accurate wake lock status messages
  const getWakeLockIndicator = () => {
    switch (wakeLockStatus) {
      case 'active': 
        return '🔒 Screen staying awake';
      case 'released': 
        return '⚠️ Screen may turn off (wake lock released)';
      case 'background': 
        return '📱 App in background (wake lock may be inactive)';
      case 'unsupported': 
        return '❌ Wake lock not supported on this device';
      case 'failed': 
        return '❌ Failed to keep screen awake';
      case 'disabled':
        return '🔓 Screen may turn off (wake lock disabled)';
      default: 
        return '🔓 Screen may turn off';
    }
  };

  // ✅ PRESERVE: Setup stage UI
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
            
            {/* ✅ NEW: Bell test button */}
            {bellEnabled && (
              <div style={{ marginLeft: '20px', marginBottom: '10px' }}>
                <button
                  onClick={() => playBell('start')}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '10px',
                    marginRight: '5px'
                  }}
                >
                  🔔 Test Bell
                </button>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>
                  Click to test if bells are working
                </span>
              </div>
            )}
            
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

            {/* ✅ FIXED: Show wake lock support status in setup */}
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '5px' }}>
              {('wakeLock' in navigator) 
                ? '✅ Wake lock supported on this device' 
                : '❌ Wake lock not supported on this device'
              }
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
      </div>
    );
  }

  // ✅ PRESERVE: Practice stage UI with wake lock toggle button
  return (
    <div className="practice-timer" style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '10px',
      boxSizing: 'border-box'
    }}>
      {/* ✅ IMPROVED: Better fallback audio elements with enhanced audio data */}
      <audio ref={startBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D1unAcBzuL0fLVgysFJHLB7+OZSA8PU6zn77BeGgg+ltryxnkpBSh+zPLaizsIGGS57OWdTgwKUarm7bJeGgU7k9n1unIpBSdzxu7dmkoPCVir7OyrUBYIRp7g9MZyKgUme8rx3I4+CRZqtu3mnEoODFOr5O+vWRoHPJPY88p3JwUqcsbu2ZhJEAlZrObxpVIaByGH0fHNeSsFJXfH8OGUQAoUXrPq66hVFAlFnt/0wXIqBSV+zPHbizwIF2W56+OYTgwNU6zk7adbHQU+ltjxxnkpBSV3xu7dmkoPCVir6+yrUBUIRp7d9MZ0KgUmfcvx24o9CBdit+znnUoPCVKs5e2zXBkGPZLY88F3KgUpcsfx24w8CRdrtu7mnUwQB1Sw5e2tVxwFPZLZ9Md3KwUoctG6mFgMDVOrvw4zLGjH9pzQBbLWazDz32N6t0i0Hx2wOtj5rg8DLo3X9NiSPwkUa7Tu5Z1TEARSZ+Xj+5aRUBUGR5zc8Md3KQUqccjv2JdEDwpNhXxnIRVdkFCm4e+xYBsEPZJY88p4KgUoc8Ku2JdOCg1Uqub1o1MXBEF3xvLXbC8HH2y44+SZTQwPUKvh7a1aGgU9lNvwwnErBiR2w/HYjD8KCVir6e2rWRoHPZXa8sJ2KgYkcsPt0ZlMEQBSq+XvpFMYBUCE3PHYeTIGIGXB6N+iUhoHOJfY8cJ3KgUocsPt0ZlNEQhNq+ftrFgaBT6S2/DDdCoGJHbF7d+VPwkNVq3l8q5fGgM5jNr0x3EnByJzwfDZjD8HCVqm5u2xXRwDOqPm8aVYGAVAhtPywHQpByJxv+7cmkwSB1Cn5eyvWxsEPZDX8sBzKgUocsTt0JdEDwhOqufspFcWCD+J1/LBdSoFJnPD792YTwkPVC3l8qtcGgY7kdPxxxkoBSZxwuvamE0QCVCq5e6xXRsEP5Ha88N2KwUqccHz2Y9BBwlZp+nw1YgZCQAl2fHcdysFKXHH7t2aTxEHT6vk7bJeGgQ7k9r0wnorBSh0xO3ZmEoODFSq5vKqYRwHOJTV8sF0KgYhcsPy2Y9BBwdYp+jtrlwZBT+T2fHBdSoFKHPF7tuYTBANU6vm7a5dGwQ9lNHxwXUrBSlzxe3YmEsP21Sq5vGkXBcFQIfU8cB0KgYiccTt2JlMEAhOquZy75q5XBsEPZTa8cJ1KwUoc8Tt05dIDghNqOLwq2IbBDmS2fHBdioGKXPH7tyaShEJTarnuNb8YBwEOZPa8sJvKgckasTv3ZdPDwdVq+Pxq2EaBzuR2vPDdSoFJXLE7N2ZQAwOUqjp8a5bGAc8lNrywHQpBSZ2w+3WmEoRB1Ch5e2pXxgJL5PZ8LhxKwUocMbu3JhKEAhOqejxrVwZBj2U2fTCdSsFKXHH7d2YTxAJUKjl8K9dGAY+ktfxwXYqBilzxu3amEgRCFKo5PKqYBsEPZDa8cN0KAcjcsPu3ZpNEAhOqOTyp2IcBDmS2vPJFkQ1E8UBxQJTUlCZVBUFANBhRJhUFQUA0GFEmFQVBQDQYUSYVBUFANBhRJhUFQUA0GFEmFQVBQDQY=" type="audio/wav" />
        <source src="data:audio/ogg;base64,T2dnUwACAAAAAAAAAAABAAAAAAAAAADqLAAHAAQCawAAAAABAgEDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CB" type="audio/ogg" />
      </audio>
      <audio ref={minuteBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D1unAcBzuL0fLVgysFJHLB7+OZSA8PU6zn77BeGgg+ltryxnkpBSh+zPLaizsIGGS57OWdTgwKUarm7bJeGgU7k9n1unIpBSdzxu7dmkoPCVir7OyrUBYIRp7g9MZyKgUme8rx3I4+CRZqtu3mnEoODFOr5O+vWRoHPJPY88p3JwUqcsbu2ZhJEAlZrObxpVIaByGH0fHNeSsFJXfH8OGUQAoUXrPq66hVFAlFnt/0wXIqBSV+zPHbizwIF2W56+OYTgwNU6zk7adbHQU+ltjxxnkpBSV3xu7dmkoPCVir6+yrUBUIRp7d9MZ0KgUmfcvx24o9CBdit+znnUoPCVKs5e2zXBkGPZLY88F3KgUpcsfx24w8CRdrtu7mnUwQB1Sw5e2tVxwFPZLZ9Md3KwUoctG6mFgMDVOrvw4zLGjH9pzQBbLWazDz32N6t0i0Hx2wOtj5rg8DLo3X9NiSPwkUa7Tu5Z1TEARSZ+Xj+5aRUBUGR5zc8Md3KQUqccjv2JdEDwpNhXxnIRVdkFCm4e+xYBsEPZJY88p4KgUoc8Ku2JdOCg1Uqub1o1MXBEF3xvLXbC8HH2y44+SZTQwPUKvh7a1aGgU9lNvwwnErBiR2w/HYjD8KCVir6e2rWRoHPZXa8sJ2KgYkcsPt0ZlMEQBSq+XvpFMYBUCE3PHYeTIGIGXB6N+iUhoHOJfY8cJ3KgUocsPt0ZlNEQhNq+ftrFgaBT6S2/DDdCoGJHbF7d+VPwkNVq3l8q5fGgM5jNr0x3EnByJzwfDZjD8HCVqm5u2xXRwDOqPm8aVYGAVAhtPywHQpByJxv+7cmkwSB1Cn5eyvWxsEPZDX8sBzKgUocsTt0JdEDwhOqufspFcWCD+J1/LBdSoFJnPD792YTwkPVC3l8qtcGgY7kdPxxxkoBSZxwuvamE0QCVCq5e6xXRsEP5Ha88N2KwUqccHz2Y9BBwlZp+nw1YgZCQAl2fHcdysFKXHH7t2aTxEHT6vk7bJeGgQ7k9r0wnorBSh0xO3ZmEoODFSq5vKqYRwHOJTV8sF0KgYhcsPy2Y9BBwdYp+jtrlwZBT+T2fHBdSoFKHPF7tuYTBANU6vm7a5dGwQ9lNHxwXUrBSlzxe3YmEsP21Sq5vGkXBcFQIfU8cB0KgYiccTt2JlMEAhOquZy75q5XBsEPZTa8cJ1KwUoc8Tt05dIDghNqOLwq2IbBDmS2fHBdioGKXPH7tyaShEJTarnuNb8YBwEOZPa8sJvKgckasTv3ZdPDwdVq+Pxq2EaBzuR2vPDdSoFJXLE7N2ZQAwOUqjp8a5bGAc8lNrywHQpBSZ2w+3WmEoRB1Ch5e2pXxgJL5PZ8LhxKwUocMbu3JhKEAhOqejxrVwZBj2U2fTCdSsFKXHH7d2YTxAJUKjl8K9dGAY+ktfxwXYqBilzxu3amEgRCFKo5PKqYBsEPZDa8cN0KAcjcsPu3ZpNEAhOqOTyp2IcBDmS2vPJFkQ1E8UBxQJTUlCZVBUFANBhRJhUFQUA0GFEmFQVBQDQYUSYVBUFANBhRJhUFQUA0GFEmFQVBQDQY=" type="audio/wav" />
        <source src="data:audio/ogg;base64,T2dnUwACAAAAAAAAAAABAAAAAAAAAADqLAAHAAQCawAAAAABAgEDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CB" type="audio/ogg" />
      </audio>
      <audio ref={endBellRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+D1unAcBzuL0fLVgysFJHLB7+OZSA8PU6zn77BeGgg+ltryxnkpBSh+zPLaizsIGGS57OWdTgwKUarm7bJeGgU7k9n1unIpBSdzxu7dmkoPCVir7OyrUBYIRp7g9MZyKgUme8rx3I4+CRZqtu3mnEoODFOr5O+vWRoHPJPY88p3JwUqcsbu2ZhJEAlZrObxpVIaByGH0fHNeSsFJXfH8OGUQAoUXrPq66hVFAlFnt/0wXIqBSV+zPHbizwIF2W56+OYTgwNU6zk7adbHQU+ltjxxnkpBSV3xu7dmkoPCVir6+yrUBUIRp7d9MZ0KgUmfcvx24o9CBdit+znnUoPCVKs5e2zXBkGPZLY88F3KgUpcsfx24w8CRdrtu7mnUwQB1Sw5e2tVxwFPZLZ9Md3KwUoctG6mFgMDVOrvw4zLGjH9pzQBbLWazDz32N6t0i0Hx2wOtj5rg8DLo3X9NiSPwkUa7Tu5Z1TEARSZ+Xj+5aRUBUGR5zc8Md3KQUqccjv2JdEDwpNhXxnIRVdkFCm4e+xYBsEPZJY88p4KgUoc8Ku2JdOCg1Uqub1o1MXBEF3xvLXbC8HH2y44+SZTQwPUKvh7a1aGgU9lNvwwnErBiR2w/HYjD8KCVir6e2rWRoHPZXa8sJ2KgYkcsPt0ZlMEQBSq+XvpFMYBUCE3PHYeTIGIGXB6N+iUhoHOJfY8cJ3KgUocsPt0ZlNEQhNq+ftrFgaBT6S2/DDdCoGJHbF7d+VPwkNVq3l8q5fGgM5jNr0x3EnByJzwfDZjD8HCVqm5u2xXRwDOqPm8aVYGAVAhtPywHQpByJxv+7cmkwSB1Cn5eyvWxsEPZDX8sBzKgUocsTt0JdEDwhOqufspFcWCD+J1/LBdSoFJnPD792YTwkPVC3l8qtcGgY7kdPxxxkoBSZxwuvamE0QCVCq5e6xXRsEP5Ha88N2KwUqccHz2Y9BBwlZp+nw1YgZCQAl2fHcdysFKXHH7t2aTxEHT6vk7bJeGgQ7k9r0wnorBSh0xO3ZmEoODFSq5vKqYRwHOJTV8sF0KgYhcsPy2Y9BBwdYp+jtrlwZBT+T2fHBdSoFKHPF7tuYTBANU6vm7a5dGwQ9lNHxwXUrBSlzxe3YmEsP21Sq5vGkXBcFQIfU8cB0KgYiccTt2JlMEAhOquZy75q5XBsEPZTa8cJ1KwUoc8Tt05dIDghNqOLwq2IbBDmS2fHBdioGKXPH7tyaShEJTarnuNb8YBwEOZPa8sJvKgckasTv3ZdPDwdVq+Pxq2EaBzuR2vPDdSoFJXLE7N2ZQAwOUqjp8a5bGAc8lNrywHQpBSZ2w+3WmEoRB1Ch5e2pXxgJL5PZ8LhxKwUocMbu3JhKEAhOqejxrVwZBj2U2fTCdSsFKXHH7d2YTxAJUKjl8K9dGAY+ktfxwXYqBilzxu3amEgRCFKo5PKqYBsEPZDa8cN0KAcjcsPu3ZpNEAhOqOTyp2IcBDmS2vPJFkQ1E8UBxQJTUlCZVBUFANBhRJhUFQUA0GFEmFQVBQDQYUSYVBUFANBhRJhUFQUA0GFEmFQVBQDQY=" type="audio/wav" />
        <source src="data:audio/ogg;base64,T2dnUwACAAAAAAAAAAABAAAAAAAAAADqLAAHAAQCawAAAAABAgEDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyAhIiMkJSYnKCkqKywtLi8wMTIzNDU2Nzg5Ojs8PT4/QEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaW1xdXl9gYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXp7fH1+f4CB" type="audio/ogg" />
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
      
      {/* ✅ FIXED: Enhanced wake lock status display */}
      <div style={{
        background: wakeLockStatus === 'active' ? 'rgba(0, 255, 0, 0.1)' : 
                  wakeLockStatus === 'failed' || wakeLockStatus === 'unsupported' ? 'rgba(255, 0, 0, 0.1)' :
                  'rgba(255, 165, 0, 0.1)',
        padding: '8px',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '12px',
        marginBottom: '10px',
        border: `1px solid ${wakeLockStatus === 'active' ? '#00ff00' : 
                            wakeLockStatus === 'failed' || wakeLockStatus === 'unsupported' ? '#ff0000' : 
                            '#ffa500'}`
      }}>
        {getWakeLockIndicator()}
      </div>
      
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

          {/* ✅ FIXED: Wake lock toggle button */}
          {isActive && (
            <button 
              onClick={toggleWakeLock}
              style={{
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 'bold',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: wakeLockStatus === 'active' ? '#27ae60' : '#95a5a6',
                color: 'white',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {wakeLockStatus === 'active' ? '🔒 Screen Locked' : '🔓 Lock Screen'}
            </button>
          )}
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
            
            {/* ✅ DEBUGGING: Development bell and wake lock info */}
            <div style={{ 
              fontSize: '10px', 
              color: '#ccc', 
              marginTop: '10px',
              textAlign: 'left' 
            }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>Bell Debug:</strong><br/>
                Enabled: {bellEnabled ? 'Yes' : 'No'}<br/>
                Audio Context: {audioContext ? audioContext.state : 'None'}<br/>
                Is Mobile: {isMobile ? 'Yes' : 'No'}<br/>
                Web Audio Supported: {('AudioContext' in window || 'webkitAudioContext' in window) ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Wake Lock Debug:</strong><br/>
                Status: {wakeLockStatus}<br/>
                Enabled: {wakeLockEnabled ? 'Yes' : 'No'}<br/>
                Has Lock: {wakeLock ? 'Yes' : 'No'}<br/>
                Supported: {('wakeLock' in navigator) ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeTimer;