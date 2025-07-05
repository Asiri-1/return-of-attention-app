import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLocalData } from './contexts/LocalDataContext';

interface MindRecoveryTimerProps {
  practiceType: string;
  posture: string;
  duration: number; // Duration in minutes, fixed at 5 for Mind Recovery
  onComplete: (pahmCounts: any) => void;
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
  private callback: (remainingSeconds: number) => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(durationMinutes: number, callback: (remainingSeconds: number) => void) {
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
    
    const remainingSeconds = Math.floor(remaining / 1000);
    
    this.callback(remainingSeconds);
    
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
  timeRemaining: number;
  pahmCounts: any;
  elapsedSeconds: number;
  timestamp: number;
  practiceType: string;
  duration: number;
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
  
  // PAHM matrix state
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

  // 🔋 NEW: Screen lock and audio management
  const [wakeLockManager] = useState(() => new WakeLockManager());
  const [audioManager] = useState(() => new AudioManager());
  const [robustTimer, setRobustTimer] = useState<RobustTimer | null>(null);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  
  // 📱 Background/foreground detection - SIMPLIFIED (no recovery prompt)
  const [isInBackground, setIsInBackground] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { currentUser } = useAuth();
  const { addMindRecoverySession } = useLocalData();

  // 📱 MOBILE RESPONSIVE STYLES
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 'clamp(16px, 4vw, 20px)',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative' as const
    },
    backButton: {
      position: 'absolute' as const,
      top: 'clamp(15px, 4vw, 20px)',
      left: 'clamp(15px, 4vw, 20px)',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: '2px solid white',
      borderRadius: '25px',
      padding: 'clamp(8px, 2vw, 12px) clamp(16px, 4vw, 20px)',
      fontSize: 'clamp(14px, 3.5vw, 16px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer'
    },
    title: {
      fontSize: 'clamp(24px, 6vw, 32px)',
      marginBottom: 'clamp(16px, 4vw, 20px)',
      textAlign: 'center' as const,
      fontWeight: 'bold' as const
    },
    setupCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: 'clamp(20px, 5vw, 30px)',
      borderRadius: '15px',
      maxWidth: '400px',
      width: '100%',
      textAlign: 'center' as const,
      backdropFilter: 'blur(10px)'
    },
    timerDisplay: {
      fontSize: 'clamp(36px, 9vw, 48px)',
      fontWeight: 'bold' as const,
      marginBottom: 'clamp(16px, 4vw, 20px)',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: 'clamp(16px, 4vw, 20px) clamp(24px, 6vw, 40px)',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
      textAlign: 'center' as const
    },
    instruction: {
      background: 'rgba(255, 255, 255, 0.15)',
      padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
      borderRadius: '8px',
      marginBottom: 'clamp(16px, 4vw, 20px)',
      maxWidth: '500px',
      width: '100%',
      textAlign: 'center' as const,
      fontSize: 'clamp(12px, 3vw, 14px)',
      lineHeight: '1.4'
    },
    matrix: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'clamp(8px, 2vw, 12px)',
      marginBottom: 'clamp(20px, 5vw, 30px)',
      maxWidth: 'min(500px, 95vw)',
      width: '100%',
      aspectRatio: '1'
    },
    matrixButton: {
      border: 'none',
      borderRadius: 'clamp(8px, 2vw, 12px)',
      padding: 'clamp(8px, 2vw, 12px)',
      fontSize: 'clamp(9px, 2.5vw, 12px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      textAlign: 'center' as const,
      minHeight: 'clamp(60px, 15vw, 80px)',
      maxHeight: 'clamp(80px, 20vw, 100px)',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      color: '#2C3E50',
      aspectRatio: '1',
      lineHeight: '1.2'
    },
    controlButtons: {
      display: 'flex',
      gap: 'clamp(10px, 2.5vw, 15px)',
      marginBottom: 'clamp(16px, 4vw, 20px)',
      flexWrap: 'wrap' as const,
      justifyContent: 'center'
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
      minWidth: 'clamp(100px, 25vw, 120px)'
    },
    startButton: {
      background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
      color: 'white',
      padding: 'clamp(12px, 3vw, 15px) clamp(24px, 6vw, 30px)',
      border: 'none',
      borderRadius: '25px',
      fontSize: 'clamp(16px, 4vw, 18px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
      width: '100%',
      marginTop: 'clamp(16px, 4vw, 20px)'
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

  // 🎯 SIMPLIFIED BACKGROUND/FOREGROUND DETECTION
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setIsInBackground(isHidden);
      
      if (isHidden && isRunning && robustTimer) {
        console.log('📱 App went to background - session continues');
        // Just save basic session state (no recovery prompt)
        const sessionRecoveryData: SessionRecoveryData = {
          timeRemaining: robustTimer.getElapsedSeconds(),
          pahmCounts: { ...pahmCounts },
          elapsedSeconds: robustTimer.getElapsedSeconds(),
          timestamp: Date.now(),
          practiceType,
          duration
        };
        localStorage.setItem('mindRecoverySessionRecovery', JSON.stringify(sessionRecoveryData));
      } else if (!isHidden) {
        console.log('📱 App returned to foreground');
        handleSessionRecovery();
      }
    };

    const handleBeforeUnload = () => {
      if (isRunning && robustTimer) {
        const sessionRecoveryData: SessionRecoveryData = {
          timeRemaining: robustTimer.getElapsedSeconds(),
          pahmCounts: { ...pahmCounts },
          elapsedSeconds: robustTimer.getElapsedSeconds(),
          timestamp: Date.now(),
          practiceType,
          duration
        };
        localStorage.setItem('mindRecoverySessionRecovery', JSON.stringify(sessionRecoveryData));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isRunning, pahmCounts, robustTimer, practiceType, duration]);

  // 🔄 SESSION RECOVERY - SIMPLIFIED (just cleanup, no prompts)
  const handleSessionRecovery = useCallback(() => {
    // Just cleanup any old recovery data
    localStorage.removeItem('mindRecoverySessionRecovery');
  }, []);

  // Enhanced timer completion handler
  const handleTimerComplete = useCallback(async () => {
    const endTime = new Date().toISOString();
    const actualDuration = duration; // Always 5 minutes for mind recovery
    
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
    localStorage.removeItem('mindRecoverySessionRecovery');
    
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

    // Use LocalDataContext
    addMindRecoverySession({
      timestamp: endTime,
      duration: actualDuration,
      sessionType: 'mind_recovery',
      mindRecoveryContext: practiceType as any,
      mindRecoveryPurpose: 'stress-relief',
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

    // Complete with PAHM counts
    onComplete(pahmCounts);
  }, [duration, practiceType, posture, pahmCounts, currentUser, onComplete, addMindRecoverySession, hasAudioPermission, audioManager, wakeLockManager, robustTimer]);

  // Remove old timer logic
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Timer completion detection for robust timer
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // 🎯 ENHANCED START HANDLER
  const handleStart = async () => {
    // 🔋 Request wake lock
    const wakeLockSuccess = await wakeLockManager.requestWakeLock();
    setIsWakeLockActive(wakeLockSuccess);

    // 🔊 Request audio permission
    const audioSuccess = await audioManager.requestPermission();
    setHasAudioPermission(audioSuccess);

    // ⏰ Create robust timer
    const timer = new RobustTimer(
      duration,
      (remainingSeconds) => {
        setTimeRemaining(remainingSeconds);
        
        if (remainingSeconds <= 0) {
          handleTimerComplete();
        }
      }
    );

    setRobustTimer(timer);
    timer.start();
    
    setTimeRemaining(duration * 60);
    setCurrentStage('practice');
    setIsRunning(true);
    setIsPaused(false);
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

    console.log('✅ Mind Recovery practice started with wake lock:', wakeLockSuccess, 'audio:', audioSuccess);
  };

  // Enhanced pause handler
  const handlePause = () => {
    if (robustTimer) {
      if (isPaused) {
        robustTimer.resume();
      } else {
        robustTimer.pause();
      }
    }
    setIsPaused(!isPaused);
  };

  // Enhanced quadrant click with audio
  const handleQuadrantClick = async (quadrant: keyof typeof pahmCounts) => {
    setPahmCounts(prev => {
      const newCounts = { ...prev };
      newCounts[quadrant] = newCounts[quadrant] + 1;
      return newCounts;
    });

    // 🔊 Audio feedback
    if (hasAudioPermission) {
      await audioManager.playTapSound();
    }

    setFlashingButton(quadrant);
    setTimeout(() => setFlashingButton(null), 300);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  // Enhanced complete early
  const handleCompleteEarly = () => {
    if (window.confirm('Complete this mind recovery practice early?')) {
      handleTimerComplete();
    }
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

  // 🔄 RECOVERY PROMPT MODAL - REMOVED FOR NOW
  const RecoveryPrompt = () => null;

  if (currentStage === 'setup') {
    return (
      <div style={styles.container}>
        
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

        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>

        <h1 style={styles.title}>
          {getPracticeTitle()}
        </h1>
        
        <div style={styles.setupCard}>
          <h3 style={{ marginBottom: '15px', fontSize: 'clamp(16px, 4vw, 18px)' }}>
            5-Minute Mind Recovery
          </h3>
          <div style={{ 
            marginBottom: '20px', 
            fontSize: 'clamp(16px, 4vw, 18px)', 
            opacity: 0.9 
          }}>
            Posture: {getPostureDisplayName()}
          </div>
          
          <button onClick={handleStart} style={styles.startButton}>
            Begin Practice
          </button>
        </div>
        
        {/* Info Card */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: 'clamp(16px, 4vw, 20px)',
          borderRadius: '10px',
          maxWidth: '500px',
          fontSize: 'clamp(12px, 3vw, 14px)',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>📱 Session Features</h4>
          <p style={{ marginBottom: '8px' }}>
            {wakeLockManager.isSupported() ? 
              '✅ Screen stays on during practice' : 
              '⚠️ Screen may lock (timer continues)'}
          </p>
          <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', opacity: 0.8 }}>
            A quick 5-minute practice to reset your mind and return to presence. Use the PAHM matrix to track where your attention goes during the practice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      
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

      {/* Timer Display */}
      <div style={styles.timerDisplay}>
        {formatTime(timeRemaining)}
      </div>

      {/* Instruction */}
      <div style={styles.instruction}>
        <div>
          📝 <strong>Mind Recovery:</strong> Notice where your attention goes, tap when you recognize thoughts
        </div>
      </div>

      {/* 📱 MOBILE RESPONSIVE 3×3 PAHM MATRIX */}
      <div style={styles.matrix}>
        {/* Row 1: ATTACHMENT */}
        <button
          onClick={() => handleQuadrantClick('nostalgia')}
          style={{
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
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
            ...styles.matrixButton,
            background: 'linear-gradient(135deg, #D5BDDD 0%, #C8A8D8 100%)',
            filter: flashingButton === 'worry' ? 'brightness(1.3)' : 'brightness(1)',
            boxShadow: flashingButton === 'worry' ? '0 0 20px rgba(213, 189, 221, 0.8)' : '0 4px 8px rgba(0,0,0,0.1)'
          }}
        >
          <div>WORRY</div>
        </button>
      </div>

      {/* Control Buttons */}
      <div style={styles.controlButtons}>
        <button
          onClick={handlePause}
          style={{
            ...styles.controlButton,
            background: isPaused 
              ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
              : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
          }}
        >
          {isPaused ? '▶️ Resume' : '⏸️ Pause'}
        </button>

        <button
          onClick={handleCompleteEarly}
          style={{
            ...styles.controlButton,
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'
          }}
        >
          Complete Practice
        </button>
      </div>

      {/* Session Stats */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: 'clamp(12px, 3vw, 15px)',
        borderRadius: '10px',
        fontSize: 'clamp(12px, 3vw, 14px)',
        textAlign: 'center',
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
  );
};

export default MindRecoveryTimer;