import React, { useState, useEffect, useCallback } from 'react';
import PAHMMatrix from './PAHMMatrix';
import { PAHMCounts } from './types/PAHMTypes';
import { useLocalData } from './contexts/LocalDataContext';

interface PAHMTimerProps {
  initialMinutes: number;
  stageLevel: string;
  onComplete: (pahmCounts: PAHMCounts) => void;
  onBack: () => void;
}

// 🔋 WAKE LOCK INTERFACES
interface WakeLockSentinel {
  release(): Promise<void>;
  addEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock?: {
    request(type: 'screen'): Promise<WakeLockSentinel>;
  };
}

// 🔊 AUDIO FEEDBACK SYSTEM
class AudioManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = false;
  private hasPermission: boolean = false;

  constructor() {
    this.initAudio();
  }

  private async initAudio() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isEnabled = true;
      console.log('🔊 Audio system initialized');
    } catch (error) {
      console.log('🔇 Audio not available:', error);
      this.isEnabled = false;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isEnabled || !this.audioContext) return false;
    
    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      await this.playTapSound(0.01);
      this.hasPermission = true;
      console.log('🔊 Audio permission granted');
      return true;
    } catch (error) {
      console.log('🔇 Audio permission denied:', error);
      this.hasPermission = false;
      return false;
    }
  }

  async playTapSound(volume: number = 0.1) {
    if (!this.isEnabled || !this.audioContext || !this.hasPermission) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.1);
    } catch (error) {
      console.log('🔇 Audio playback failed:', error);
    }
  }

  async playCompletionSound() {
    if (!this.isEnabled || !this.audioContext || !this.hasPermission) return;
    
    try {
      const frequencies = [523, 659, 784]; // C, E, G chord
      
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          if (!this.audioContext) return;
          
          const oscillator = this.audioContext.createOscillator();
          const gainNode = this.audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(this.audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5);
          
          oscillator.start(this.audioContext.currentTime);
          oscillator.stop(this.audioContext.currentTime + 0.5);
        }, index * 200);
      });
    } catch (error) {
      console.log('🔇 Completion sound failed:', error);
    }
  }

  isAvailable(): boolean {
    return this.isEnabled && this.hasPermission;
  }
}

// 🔋 WAKE LOCK MANAGER
class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private _isSupported: boolean = false;

  constructor() {
    this._isSupported = 'wakeLock' in navigator;
    console.log('🔋 Wake Lock supported:', this._isSupported);
  }

  async requestWakeLock(): Promise<boolean> {
    if (!this._isSupported) {
      console.log('⚠️ Wake Lock not supported - timer may pause when screen locks');
      return false;
    }

    try {
      const nav = navigator as NavigatorWithWakeLock;
      this.wakeLock = await nav.wakeLock!.request('screen');
      
      console.log('✅ Wake Lock acquired - screen will stay on');
      
      if (this.wakeLock.addEventListener) {
        this.wakeLock.addEventListener('release', () => {
          console.log('🔓 Wake Lock released by system');
          this.wakeLock = null;
        });
      }
      
      return true;
    } catch (error) {
      console.error('❌ Wake Lock request failed:', error);
      return false;
    }
  }

  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('🔓 Wake Lock released manually');
      } catch (error) {
        console.error('❌ Wake Lock release failed:', error);
      }
    }
  }

  isActive(): boolean {
    return this.wakeLock !== null;
  }

  isSupported(): boolean {
    return this._isSupported;
  }
}

// ⏰ ROBUST TIMER MANAGER
class RobustTimer {
  private startTime: number = 0;
  private totalDuration: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  private isPaused: boolean = false;
  private isActive: boolean = false;
  private callback: (remainingMinutes: number, remainingSeconds: number) => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(durationMinutes: number, callback: (remainingMinutes: number, remainingSeconds: number) => void) {
    this.totalDuration = durationMinutes * 60 * 1000; // Convert to milliseconds
    this.callback = callback;
  }

  start() {
    this.startTime = Date.now();
    this.isPaused = false;
    this.isActive = true;
    this.pausedTime = 0;
    this.totalPausedDuration = 0;
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
    console.log('⏰ Robust timer started for', this.totalDuration / 60000, 'minutes');
  }

  pause() {
    if (!this.isActive || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = Date.now();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏸️ Timer paused');
  }

  resume() {
    if (!this.isActive || !this.isPaused || this.pausedTime === 0) return;
    
    const pauseDuration = Date.now() - this.pausedTime;
    this.totalPausedDuration += pauseDuration;
    
    this.isPaused = false;
    this.pausedTime = 0;
    
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
    console.log('▶️ Timer resumed');
  }

  private tick() {
    if (!this.isActive || this.isPaused) return;
    
    const elapsed = Date.now() - this.startTime - this.totalPausedDuration;
    const remaining = Math.max(0, this.totalDuration - elapsed);
    
    const remainingMinutes = Math.floor(remaining / 60000);
    const remainingSeconds = Math.floor((remaining % 60000) / 1000);
    
    this.callback(remainingMinutes, remainingSeconds);
    
    if (remaining <= 0) {
      this.stop();
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('⏹️ Timer stopped');
  }

  getElapsedSeconds(): number {
    if (!this.isActive) return 0;
    
    let elapsed;
    if (this.isPaused && this.pausedTime > 0) {
      elapsed = this.pausedTime - this.startTime - this.totalPausedDuration;
    } else {
      elapsed = Date.now() - this.startTime - this.totalPausedDuration;
    }
    
    return Math.floor(elapsed / 1000);
  }

  isRunning(): boolean {
    return this.isActive && !this.isPaused;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }
}

// 📱 SESSION RECOVERY DATA INTERFACE
interface SessionRecoveryData {
  minutes: number;
  seconds: number;
  pahmCounts: PAHMCounts;
  elapsedSeconds: number;
  timestamp: number;
  stageLevel: string;
  initialMinutes: number;
}

const PAHMTimer: React.FC<PAHMTimerProps> = ({
  initialMinutes,
  stageLevel,
  onComplete,
  onBack
}) => {
  const { addPracticeSession, addEmotionalNote } = useLocalData();

  // Timer states
  const [minutes, setMinutes] = useState<number>(initialMinutes);
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSetup, setIsSetup] = useState<boolean>(true);
  const [customMinutes, setCustomMinutes] = useState<number>(initialMinutes);
  const [customInput, setCustomInput] = useState<string>("");
  
  // PAHM tracking states
  const [pahmCounts, setPahmCounts] = useState<PAHMCounts>({
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

  // 🔋 NEW: Screen lock and audio management
  const [wakeLockManager] = useState(() => new WakeLockManager());
  const [audioManager] = useState(() => new AudioManager());
  const [robustTimer, setRobustTimer] = useState<RobustTimer | null>(null);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  
  // 📱 Background/foreground detection
  const [isInBackground, setIsInBackground] = useState(false);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [recoveryData, setRecoveryData] = useState<SessionRecoveryData | null>(null);

  // 📱 MOBILE RESPONSIVE STYLES
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: 'clamp(5px, 1.5vw, 10px)',
      position: 'relative' as const
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      padding: 'clamp(8px, 2vw, 12px)',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '10px',
      marginBottom: 'clamp(10px, 2.5vw, 15px)',
      backdropFilter: 'blur(10px)'
    },
    title: {
      flex: 1,
      margin: 0,
      fontSize: 'clamp(18px, 4.5vw, 24px)',
      textAlign: 'center' as const,
      fontWeight: 'bold' as const
    },
    backButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      border: '2px solid white',
      color: 'white',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      cursor: 'pointer',
      padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 20px)',
      borderRadius: '20px',
      fontWeight: 'bold' as const
    },
    content: {
      flex: 1,
      padding: 'clamp(5px, 1.5vw, 10px)',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'space-between',
      maxWidth: '100%',
      margin: '0 auto',
      width: '100%'
    },
    timerDisplay: {
      fontSize: 'clamp(32px, 8vw, 48px)',
      fontWeight: 'bold' as const,
      marginBottom: 'clamp(16px, 4vw, 20px)',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: 'clamp(16px, 4vw, 20px) clamp(24px, 6vw, 40px)',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      textAlign: 'center' as const
    },
    instruction: {
      fontSize: 'clamp(14px, 3.5vw, 18px)',
      marginBottom: 'clamp(16px, 4vw, 20px)',
      textAlign: 'center' as const,
      background: 'rgba(255, 255, 255, 0.1)',
      padding: 'clamp(12px, 3vw, 16px)',
      borderRadius: '10px',
      maxWidth: '400px'
    },
    durationSelector: {
      marginBottom: 'clamp(20px, 5vw, 30px)',
      textAlign: 'center' as const,
      width: '100%',
      maxWidth: '400px'
    },
    durationButtons: {
      display: 'flex',
      gap: 'clamp(8px, 2vw, 12px)',
      marginBottom: 'clamp(16px, 4vw, 20px)',
      flexWrap: 'wrap' as const,
      justifyContent: 'center'
    },
    durationButton: {
      padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
      border: '2px solid white',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      borderRadius: '20px',
      fontSize: 'clamp(12px, 3vw, 14px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minWidth: 'clamp(60px, 15vw, 80px)'
    },
    activeDurationButton: {
      background: 'rgba(255, 255, 255, 0.3)',
      transform: 'scale(1.05)'
    },
    customInput: {
      padding: 'clamp(10px, 2.5vw, 12px)',
      borderRadius: '10px',
      border: '2px solid white',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      width: '100%',
      maxWidth: '200px',
      textAlign: 'center' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      color: '#2C3E50'
    },
    startButton: {
      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
      color: 'white',
      padding: 'clamp(12px, 3vw, 16px) clamp(24px, 6vw, 32px)',
      border: 'none',
      borderRadius: '25px',
      fontSize: 'clamp(16px, 4vw, 20px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
      marginTop: 'clamp(16px, 4vw, 20px)',
      minWidth: '200px'
    },
    controlButtons: {
      display: 'flex',
      gap: 'clamp(10px, 2.5vw, 15px)',
      marginTop: 'clamp(16px, 4vw, 20px)',
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
      width: '100%',
      maxWidth: '400px'
    },
    controlButton: {
      padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
      border: 'none',
      borderRadius: '25px',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
      color: 'white',
      minWidth: 'clamp(120px, 30vw, 150px)',
      flex: '1 1 auto'
    },
    statusBar: {
      position: 'fixed' as const,
      top: '10px',
      right: '10px',
      display: 'flex',
      gap: '8px',
      fontSize: 'clamp(10px, 2.5vw, 12px)',
      zIndex: 1000,
      flexWrap: 'wrap' as const,
      maxWidth: '200px'
    },
    statusBadge: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: 'clamp(10px, 2.5vw, 12px)',
      fontWeight: 'bold' as const,
      color: 'white',
      whiteSpace: 'nowrap' as const
    }
  };

  // 🎯 SETUP BACKGROUND/FOREGROUND DETECTION
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setIsInBackground(isHidden);
      
      if (isHidden && isRunning && robustTimer) {
        console.log('📱 App went to background');
        const sessionRecoveryData: SessionRecoveryData = {
          minutes,
          seconds,
          pahmCounts: { ...pahmCounts },
          elapsedSeconds: robustTimer.getElapsedSeconds(),
          timestamp: Date.now(),
          stageLevel,
          initialMinutes
        };
        setRecoveryData(sessionRecoveryData);
        localStorage.setItem('pahmSessionRecovery', JSON.stringify(sessionRecoveryData));
      } else if (!isHidden) {
        console.log('📱 App returned to foreground');
        setTimeout(() => handleSessionRecovery(), 500);
      }
    };

    const handleBeforeUnload = () => {
      if (isRunning && robustTimer) {
        const sessionRecoveryData: SessionRecoveryData = {
          minutes,
          seconds,
          pahmCounts: { ...pahmCounts },
          elapsedSeconds: robustTimer.getElapsedSeconds(),
          timestamp: Date.now(),
          stageLevel,
          initialMinutes
        };
        localStorage.setItem('pahmSessionRecovery', JSON.stringify(sessionRecoveryData));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, minutes, seconds, pahmCounts, robustTimer, stageLevel, initialMinutes]);

  // 🔄 SESSION RECOVERY
  const handleSessionRecovery = useCallback(() => {
    try {
      const savedData = localStorage.getItem('pahmSessionRecovery');
      if (savedData && isRunning && robustTimer) {
        const recoveryData: SessionRecoveryData = JSON.parse(savedData);
        const timeSinceBackground = Date.now() - recoveryData.timestamp;
        
        if (timeSinceBackground > 30000) {
          setRecoveryData(recoveryData);
          setShowRecoveryPrompt(true);
        }
      }
    } catch (error) {
      console.error('❌ Session recovery failed:', error);
    }
  }, [isRunning, robustTimer]);

  // 🔄 RECOVERY PROMPT HANDLERS
  const acceptRecovery = () => {
    if (recoveryData) {
      console.log('🔄 Recovering session from background');
      setPahmCounts(recoveryData.pahmCounts);
    }
    setShowRecoveryPrompt(false);
    setRecoveryData(null);
    localStorage.removeItem('pahmSessionRecovery');
  };

  const declineRecovery = () => {
    setShowRecoveryPrompt(false);
    setRecoveryData(null);
    localStorage.removeItem('pahmSessionRecovery');
  };

  // Background helper functions
  const saveToAnalytics = useCallback((completed: boolean = true) => {
    try {
      const endTime = new Date().toISOString();
      const actualDuration = completed ? initialMinutes : (initialMinutes - minutes - (seconds / 60));
      const totalInteractions = Object.values(pahmCounts).reduce((sum, count) => sum + count, 0);
      
      const convertedPAHMCounts = {
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

      const presentMomentCounts = pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes;
      const presentPercentage = totalInteractions > 0 ? Math.round((presentMomentCounts / totalInteractions) * 100) : 85;
      
      let sessionQuality = 7;
      if (presentPercentage >= 80) sessionQuality += 1.5;
      else if (presentPercentage >= 60) sessionQuality += 1;
      else if (presentPercentage < 40) sessionQuality -= 1;
      if (completed) sessionQuality += 0.5;
      sessionQuality = Math.min(10, Math.max(1, Math.round(sessionQuality * 10) / 10));

      let stageNumber = 2;
      if (stageLevel.includes('Stage 1') || stageLevel.includes('T1')) stageNumber = 1;
      else if (stageLevel.includes('Stage 3') || stageLevel.includes('T3')) stageNumber = 3;
      else if (stageLevel.includes('Stage 4') || stageLevel.includes('T4')) stageNumber = 4;
      else if (stageLevel.includes('Stage 5') || stageLevel.includes('T5')) stageNumber = 5;
      else if (stageLevel.includes('Stage 6') || stageLevel.includes('T6')) stageNumber = 6;

      addPracticeSession({
        timestamp: endTime,
        duration: Math.round(actualDuration),
        sessionType: 'meditation' as const,
        stageLevel: stageNumber,
        stageLabel: stageLevel,
        rating: sessionQuality,
        notes: `PAHM practice session with ${totalInteractions} attention observations. ${presentPercentage}% present-moment awareness.`,
        presentPercentage,
        environment: {
          posture: sessionStorage.getItem('currentPosture') || 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: convertedPAHMCounts
      });

      addEmotionalNote({
        timestamp: endTime,
        content: `${completed ? 'Completed' : 'Practiced'} ${Math.round(actualDuration)}-minute ${stageLevel} session with ${totalInteractions} mindful observations and ${presentPercentage}% present-moment awareness.`,
        emotion: completed ? 'accomplished' : 'content',
        energyLevel: sessionQuality >= 8 ? 9 : sessionQuality >= 6 ? 7 : 6,
        tags: ['pahm-practice', `stage-${stageNumber}`, 'meditation']
      });

    } catch (error) {
      console.error('Error saving to analytics:', error);
    }
  }, [initialMinutes, minutes, seconds, pahmCounts, stageLevel, addPracticeSession, addEmotionalNote]);
  
  // Enhanced PAHM position updates with audio feedback
  const handlePAHMCountUpdate = useCallback((position: string, count: number) => {
    setPahmCounts(prevCounts => {
      const newCounts = { ...prevCounts };
      
      if (position in newCounts) {
        newCounts[position as keyof PAHMCounts] = count;
      }
      
      return newCounts;
    });

    // 🔊 Audio feedback
    if (hasAudioPermission) {
      audioManager.playTapSound(); // Remove await since it's not async in callback
    }
  }, [hasAudioPermission, audioManager]);
  
  // Handle custom duration input
  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomInput(value);
    
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      setCustomMinutes(Math.max(numValue, 30));
    }
  };
  
  // Enhanced timer logic with robust timer
  useEffect(() => {
    // Clean up any existing timer logic since we're using RobustTimer
    return () => {
      if (robustTimer) {
        robustTimer.stop();
      }
    };
  }, [robustTimer]);

  // 🎯 ENHANCED START HANDLER
  const handleStartPractice = async () => {
    const finalMinutes = Math.max(customMinutes, 30);

    // 🔋 Request wake lock
    const wakeLockSuccess = await wakeLockManager.requestWakeLock();
    setIsWakeLockActive(wakeLockSuccess);

    // 🔊 Request audio permission
    const audioSuccess = await audioManager.requestPermission();
    setHasAudioPermission(audioSuccess);

    // ⏰ Create robust timer
    const timer = new RobustTimer(
      finalMinutes,
      (remainingMinutes, remainingSeconds) => {
        setMinutes(remainingMinutes);
        setSeconds(remainingSeconds);
        
        if (remainingMinutes === 0 && remainingSeconds === 0) {
          handleTimerComplete();
        }
      }
    );

    setRobustTimer(timer);
    timer.start();
    
    setMinutes(finalMinutes);
    setSeconds(0);
    setIsRunning(true);
    setIsPaused(false);
    setIsSetup(false);

    console.log('✅ Practice started with wake lock:', wakeLockSuccess, 'audio:', audioSuccess);
  };
  
  // Enhanced pause/resume handler
  const handlePauseResume = () => {
    if (robustTimer) {
      if (isPaused) {
        robustTimer.resume();
      } else {
        robustTimer.pause();
      }
    }
    setIsPaused(!isPaused);
  };
  
  // Enhanced timer completion
  const handleTimerComplete = async () => {
    // 🔊 Play completion sound
    if (hasAudioPermission) {
      await audioManager.playCompletionSound();
    }

    // 🔋 Release wake lock
    await wakeLockManager.releaseWakeLock();
    setIsWakeLockActive(false);

    // ⏰ Stop robust timer
    if (robustTimer) {
      robustTimer.stop();
    }

    // Clear recovery data
    localStorage.removeItem('pahmSessionRecovery');
    
    setIsRunning(false);
    saveToAnalytics(true);
    onComplete(pahmCounts);
  };
  
  // Enhanced skip to reflection
  const handleSkipToReflection = async () => {
    // 🔊 Play completion sound
    if (hasAudioPermission) {
      await audioManager.playCompletionSound();
    }

    // 🔋 Release wake lock
    await wakeLockManager.releaseWakeLock();
    setIsWakeLockActive(false);

    // ⏰ Stop robust timer
    if (robustTimer) {
      robustTimer.stop();
    }

    // Clear recovery data
    localStorage.removeItem('pahmSessionRecovery');
    
    saveToAnalytics(false);
    onComplete(pahmCounts);
  };

  // 🎯 CLEANUP ON UNMOUNT
  useEffect(() => {
    return () => {
      wakeLockManager.releaseWakeLock();
      if (robustTimer) {
        robustTimer.stop();
      }
    };
  }, [wakeLockManager, robustTimer]);
  
  // Format time as MM:SS
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 🔄 RECOVERY PROMPT MODAL
  const RecoveryPrompt = () => {
    if (!showRecoveryPrompt || !recoveryData) return null;

    const timeSinceBackground = Math.round((Date.now() - recoveryData.timestamp) / 1000);

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          color: '#2C3E50',
          padding: '30px',
          borderRadius: '15px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '15px' }}>🔄 Session Recovery</h3>
          <p style={{ marginBottom: '20px', lineHeight: '1.5' }}>
            Your practice session was interrupted {timeSinceBackground} seconds ago. 
            Would you like to resume where you left off?
          </p>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '20px' }}>
            PAHM Count: {Object.values(recoveryData.pahmCounts).reduce((a, b) => a + b, 0)} observations
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={acceptRecovery}
              style={{
                background: '#4caf50',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Resume Session
            </button>
            <button
              onClick={declineRecovery}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '25px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Render setup screen
  if (isSetup) {
    return (
      <div style={styles.container}>
        <RecoveryPrompt />
        
        {/* Status Bar */}
        <div style={styles.statusBar}>
          {wakeLockManager.isSupported() && (
            <div style={{
              ...styles.statusBadge,
              background: 'rgba(76, 175, 80, 0.8)'
            }}>
              🔋 Wake Lock Ready
            </div>
          )}
        </div>

        <div style={styles.header}>
          <button style={styles.backButton} onClick={onBack}>
            Back
          </button>
          <h1 style={styles.title}>{stageLevel}</h1>
          <div style={{ width: '80px' }}></div>
        </div>
        
        <div style={styles.content}>
          <div style={styles.timerDisplay}>
            {formatTime(customMinutes, 0)}
          </div>
          
          <p style={styles.instruction}>Press Start when you're ready to begin</p>
          
          <div style={styles.durationSelector}>
            <p style={{ marginBottom: '15px', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>
              Select Duration (minimum 30 minutes):
            </p>
            <div style={styles.durationButtons}>
              {[30, 45, 60, 90].map(duration => (
                <button 
                  key={duration}
                  style={{
                    ...styles.durationButton,
                    ...(customMinutes === duration && customInput === "" ? styles.activeDurationButton : {})
                  }}
                  onClick={() => {
                    setCustomMinutes(duration);
                    setCustomInput("");
                  }}
                >
                  {duration} min
                </button>
              ))}
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: 'clamp(12px, 3vw, 14px)' }}>
                Custom duration (minutes):
              </label>
              <input
                type="number"
                min="30"
                value={customInput}
                onChange={handleCustomInputChange}
                placeholder="Enter minutes (min 30)"
                style={styles.customInput}
              />
            </div>
          </div>

          {/* Wake Lock Info */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '10px',
            fontSize: 'clamp(12px, 3vw, 14px)',
            textAlign: 'center',
            maxWidth: '400px',
            marginBottom: '20px'
          }}>
            <h4 style={{ marginBottom: '10px', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>📱 Session Features</h4>
            <p style={{ marginBottom: '8px', lineHeight: '1.4' }}>
              {wakeLockManager.isSupported() ? 
                '✅ Screen stays on during practice' : 
                '⚠️ Screen may lock (timer continues)'}
            </p>
            <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', opacity: 0.8, lineHeight: '1.3' }}>
              • Audio feedback for interactions<br/>
              • Auto-recovery if interrupted<br/>
              • Continues in background
            </p>
          </div>
          
          <button style={styles.startButton} onClick={handleStartPractice}>
            Start Practice
          </button>
        </div>
      </div>
    );
  }
  
  // Render active timer
  return (
    <div style={styles.container}>
      <RecoveryPrompt />
      
      {/* Status Bar */}
      <div style={styles.statusBar}>
        {isWakeLockActive && (
          <div style={{
            ...styles.statusBadge,
            background: 'rgba(76, 175, 80, 0.8)'
          }}>
            🔋 Screen Lock Off
          </div>
        )}
        
        {hasAudioPermission && (
          <div style={{
            ...styles.statusBadge,
            background: 'rgba(33, 150, 243, 0.8)'
          }}>
            🔊 Audio On
          </div>
        )}
        
        {isInBackground && (
          <div style={{
            ...styles.statusBadge,
            background: 'rgba(255, 152, 0, 0.8)'
          }}>
            📱 Background
          </div>
        )}

        {robustTimer && robustTimer.isRunning() && (
          <div style={{
            ...styles.statusBadge,
            background: 'rgba(76, 175, 80, 0.8)'
          }}>
            ⏰ Active
          </div>
        )}
      </div>

      <div style={styles.header}>
        <button style={styles.backButton} onClick={onBack}>
          Back
        </button>
        <h1 style={styles.title}>{stageLevel}</h1>
        <div style={{ width: '80px' }}></div>
      </div>
      
      <div style={styles.content}>
        <div style={styles.timerDisplay}>
          {formatTime(minutes, seconds)}
        </div>
        
        <p style={styles.instruction}>
          {isPaused ? '⏸️ Timer paused' : '🧘‍♀️ Maintain Physical Stillness'}
        </p>
        
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '500px'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(16px, 4vw, 20px)', 
            marginBottom: '10px',
            textAlign: 'center'
          }}>
            Track Your Attention
          </h2>
          <p style={{ 
            fontSize: 'clamp(12px, 3vw, 14px)', 
            marginBottom: '20px',
            textAlign: 'center',
            opacity: 0.9
          }}>
            Tap the position that matches your current state of attention
          </p>
          
          <PAHMMatrix 
            initialCounts={pahmCounts}
            onCountUpdate={handlePAHMCountUpdate}
          />

          {/* Session Stats */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: 'clamp(12px, 3vw, 15px)',
            borderRadius: '10px',
            fontSize: 'clamp(12px, 3vw, 14px)',
            textAlign: 'center',
            marginTop: '15px',
            maxWidth: '300px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              Total Observations: {Object.values(pahmCounts).reduce((a, b) => a + b, 0)}
            </div>
            {robustTimer && (
              <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', opacity: 0.8 }}>
                Elapsed: {Math.floor(robustTimer.getElapsedSeconds() / 60)}:{(robustTimer.getElapsedSeconds() % 60).toString().padStart(2, '0')}
              </div>
            )}
          </div>
        </div>
        
        <div style={styles.controlButtons}>
          <button 
            style={{
              ...styles.controlButton,
              background: isPaused 
                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
            }}
            onClick={handlePauseResume}
          >
            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          
          <button 
            style={{
              ...styles.controlButton,
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
            }}
            onClick={handleSkipToReflection}
          >
            Complete Early
          </button>
        </div>
      </div>
    </div>
  );
};

export default PAHMTimer;