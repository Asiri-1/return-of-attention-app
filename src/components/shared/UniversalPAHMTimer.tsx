import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
      // Resume audio context if needed
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Test audio by playing a very quiet sound
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

  // 🔔 Gentle chime for PAHM button taps
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

  // 🔔 Beautiful completion bell
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
      
      // Handle wake lock release (user manually locks screen)
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

// ⏰ ROBUST TIMER MANAGER - Continues accurately even if screen locks
class RobustTimer {
  private startTime: number = 0;
  private totalDuration: number = 0;
  private pausedTime: number = 0;
  private totalPausedDuration: number = 0;
  private isPaused: boolean = false;
  private isActive: boolean = false;
  private callback: (remainingSeconds: number) => void;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(durationSeconds: number, callback: (remainingSeconds: number) => void) {
    this.totalDuration = durationSeconds;
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
    console.log('⏰ Robust timer started for', this.totalDuration, 'seconds');
  }

  pause() {
    if (!this.isActive || this.isPaused) return;
    
    this.isPaused = true;
    this.pausedTime = Date.now();
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    console.log('⏸️ Timer paused at', this.getElapsedSeconds(), 'seconds');
  }

  resume() {
    if (!this.isActive || !this.isPaused || this.pausedTime === 0) return;
    
    // Calculate pause duration and add to total
    const pauseDuration = Date.now() - this.pausedTime;
    this.totalPausedDuration += pauseDuration;
    
    this.isPaused = false;
    this.pausedTime = 0;
    
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
    console.log('▶️ Timer resumed, total pause time:', Math.round(this.totalPausedDuration / 1000), 'seconds');
  }

  private tick() {
    if (!this.isActive || this.isPaused) return;
    
    const elapsed = Math.floor((Date.now() - this.startTime - this.totalPausedDuration) / 1000);
    const remaining = Math.max(0, this.totalDuration - elapsed);
    
    this.callback(remaining);
    
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
    console.log('⏹️ Timer stopped at', this.getElapsedSeconds(), 'seconds');
  }

  getElapsedSeconds(): number {
    if (!this.isActive) return 0;
    
    if (this.isPaused && this.pausedTime > 0) {
      return Math.floor((this.pausedTime - this.startTime - this.totalPausedDuration) / 1000);
    }
    return Math.floor((Date.now() - this.startTime - this.totalPausedDuration) / 1000);
  }

  getRemainingSeconds(): number {
    const elapsed = this.getElapsedSeconds();
    return Math.max(0, this.totalDuration - elapsed);
  }

  isRunning(): boolean {
    return this.isActive && !this.isPaused;
  }

  isPausedState(): boolean {
    return this.isPaused;
  }
}

// 🎯 STAGE CONFIGURATIONS
const getStageConfig = (stage: number) => {
  const configs = {
    2: {
      title: "PAHM Trainee: Understanding Thought Patterns",
      subtitle: "Notice your thoughts and tap the matching state",
      minDuration: 30,
      defaultDuration: 30,
      instruction: "📝 Notice your thoughts and tap the matching state",
      description: "Stage 2 focuses on recognizing thought patterns without judgment",
      emoji: "🧘‍♀️"
    },
    3: {
      title: "PAHM Apprentice: Deepening Awareness", 
      subtitle: "Notice your thoughts and tap the matching state",
      minDuration: 30,
      defaultDuration: 35,
      instruction: "🎯 Observe the arising and passing of mental states",
      description: "Stage 3 develops sustained attention with deeper pattern recognition",
      emoji: "🌟"
    },
    4: {
      title: "PAHM Practitioner: Sustained Attention",
      subtitle: "Notice your thoughts and tap the matching state",
      minDuration: 30,
      defaultDuration: 40,
      instruction: "⚡ Maintain continuous awareness across all positions",
      description: "Stage 4 cultivates unbroken mindfulness and effortless observation",
      emoji: "💎"
    },
    5: {
      title: "PAHM Adept: Effortless Observation",
      subtitle: "Notice your thoughts and tap the matching state",
      minDuration: 30,
      defaultDuration: 45,
      instruction: "🌌 Experience the space between thoughts and reactions",
      description: "Stage 5 develops subtle awareness and emotional equanimity",
      emoji: "🔮"
    },
    6: {
      title: "PAHM Master: Integration & Wisdom",
      subtitle: "Notice your thoughts and tap the matching state",
      minDuration: 35,
      defaultDuration: 50,
      instruction: "✨ Embody present-moment awareness naturally",
      description: "Stage 6 integrates wisdom and compassion with effortless presence",
      emoji: "🏔️"
    }
  };
  return configs[stage as keyof typeof configs] || configs[2];
};

// 🎨 MOBILE RESPONSIVE STYLES
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
  setupCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    padding: 'clamp(20px, 5vw, 30px)',
    borderRadius: '15px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center' as const
  },
  timerDisplay: {
    fontSize: 'clamp(32px, 8vw, 48px)',
    fontWeight: 'bold',
    marginBottom: 'clamp(16px, 4vw, 20px)',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: 'clamp(16px, 4vw, 20px) clamp(24px, 6vw, 40px)',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  instruction: {
    background: 'rgba(255, 255, 255, 0.15)',
    padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 20px)',
    borderRadius: '8px',
    marginBottom: 'clamp(16px, 4vw, 20px)',
    maxWidth: '500px',
    width: '100%',
    textAlign: 'center' as const
  },
  // 📱 MOBILE RESPONSIVE MATRIX
  matrix: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 'clamp(8px, 2vw, 12px)',
    marginBottom: 'clamp(20px, 5vw, 30px)',
    maxWidth: 'min(500px, 95vw)',
    width: '100%',
    aspectRatio: '1', // Keep matrix square
  },
  // 📱 MOBILE RESPONSIVE BUTTONS
  baseButton: {
    border: 'none',
    borderRadius: 'clamp(8px, 2vw, 12px)',
    padding: 'clamp(8px, 2vw, 12px)',
    fontSize: 'clamp(9px, 2.5vw, 12px)',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    textAlign: 'center' as const,
    // 📱 FIXED: Responsive height that maintains aspect ratio
    minHeight: 'clamp(60px, 15vw, 80px)',
    maxHeight: 'clamp(80px, 20vw, 100px)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    color: '#2C3E50',
    // 📱 Ensure consistent sizing
    aspectRatio: '1',
    lineHeight: '1.2'
  },
  controlButton: {
    color: 'white',
    padding: 'clamp(10px, 2.5vw, 12px) clamp(16px, 4vw, 24px)',
    border: 'none',
    borderRadius: '25px',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    whiteSpace: 'nowrap' as const
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

// 📱 SESSION RECOVERY DATA INTERFACE
interface SessionRecoveryData {
  timeRemaining: number;
  pahmCounts: PAHMCounts;
  elapsedSeconds: number;
  timestamp: number;
  stageLevel: number;
  initialMinutes: number;
}

const UniversalPAHMTimer: React.FC<UniversalPAHMTimerProps> = ({ 
  stageLevel, 
  onComplete, 
  onBack, 
  posture = 'seated',
  initialMinutes: propInitialMinutes 
}) => {
  const config = getStageConfig(stageLevel);
  const navigate = useNavigate();
  
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

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 🎯 Real analytics functions from LocalDataContext
  const { addPracticeSession, addEmotionalNote, userData, isLoading } = useLocalData();

  // 🎯 SETUP BACKGROUND/FOREGROUND DETECTION
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      setIsInBackground(isHidden);
      
      if (isHidden && isRunning && robustTimer) {
        console.log('📱 App went to background');
        // Save current session state
        const sessionRecoveryData: SessionRecoveryData = {
          timeRemaining: robustTimer.getRemainingSeconds(),
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
        // Check if we need to recover session
        setTimeout(() => handleSessionRecovery(), 500);
      }
    };

    const handleBeforeUnload = () => {
      if (isRunning && robustTimer) {
        const sessionRecoveryData: SessionRecoveryData = {
          timeRemaining: robustTimer.getRemainingSeconds(),
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
  }, [isRunning, pahmCounts, robustTimer, stageLevel, initialMinutes]);

  // 🔄 SESSION RECOVERY
  const handleSessionRecovery = useCallback(() => {
    try {
      const savedData = localStorage.getItem('pahmSessionRecovery');
      if (savedData && isRunning && robustTimer) {
        const recoveryData: SessionRecoveryData = JSON.parse(savedData);
        const timeSinceBackground = Date.now() - recoveryData.timestamp;
        
        // If app was in background for more than 30 seconds, offer recovery
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
      // The robust timer automatically handles time synchronization
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

  // Auto-start if initialMinutes provided
  useEffect(() => {
    if (propInitialMinutes && propInitialMinutes >= config.minDuration) {
      setTimeRemaining(propInitialMinutes * 60);
      setCurrentStage('practice');
      setIsRunning(true);
    }
  }, [propInitialMinutes, config.minDuration]);

  // 🎯 ENHANCED TIMER COMPLETION HANDLER
  const handleTimerComplete = useCallback(async () => {
    const endTime = new Date().toISOString();
    const actualDuration = robustTimer ? robustTimer.getElapsedSeconds() : Math.round((initialMinutes * 60) - timeRemaining);
    const isFullyCompleted = timeRemaining === 0;
    
    console.log('🎯 TIMER COMPLETION STARTED');
    
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
    
    // 📊 ANALYTICS CALCULATIONS
    const totalInteractions = (Object.values(pahmCounts) as number[]).reduce((sum, count) => sum + count, 0);
    const presentPercentage = calculatePresentPercentage(pahmCounts);
    const sessionQuality = calculateSessionQuality(pahmCounts, actualDuration, isFullyCompleted, stageLevel);
    const pahmStats = getPAHMStats(pahmCounts);
    
    // 🎯 SINGLE STANDARD FORMAT - LocalDataContext underscore format
    const convertedPAHMCounts = convertToStandardFormat(pahmCounts);

    // 💾 SESSION DATA OBJECT - VERIFIED FORMAT
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

    // 🔥 ENHANCED PRACTICE SESSION SAVING WITH RETRY LOGIC
    const savePracticeSession = () => {
      console.log('🚨 ATTEMPTING TO SAVE PRACTICE SESSION');
      
      if (!userData) {
        console.error('❌ CRITICAL: userData is null - retrying in 1 second...');
        
        setTimeout(() => {
          if (userData) {
            console.log('✅ UserData now available - proceeding with save');
            try {
              addPracticeSession(sessionData);
              console.log('✅✅ PRACTICE SESSION SAVED SUCCESSFULLY ON RETRY');
            } catch (error) {
              console.error('❌❌ PRACTICE SESSION SAVE FAILED ON RETRY:', error);
            }
          } else {
            console.error('❌❌ UserData still null after retry - practice session not saved');
          }
        }, 1000);
        return;
      }

      try {
        addPracticeSession(sessionData);
        console.log('✅✅ PRACTICE SESSION SAVED SUCCESSFULLY');
      } catch (error) {
        console.error('❌❌ ERROR SAVING PRACTICE SESSION:', error);
      }
    };

    // Save practice session
    savePracticeSession();

    // 🎯 FIXED: Convert to camelCase for navigation
    const pahmDataForReflection = {
      presentAttachment: convertedPAHMCounts.present_attachment,
      presentNeutral: convertedPAHMCounts.present_neutral,
      presentAversion: convertedPAHMCounts.present_aversion,
      pastAttachment: convertedPAHMCounts.past_attachment,
      pastNeutral: convertedPAHMCounts.past_neutral,
      pastAversion: convertedPAHMCounts.past_aversion,
      futureAttachment: convertedPAHMCounts.future_attachment,
      futureNeutral: convertedPAHMCounts.future_neutral,
      futureAversion: convertedPAHMCounts.future_aversion
    };

    // 🎯 DIRECT NAVIGATION
    console.log('🧭 NAVIGATING TO REFLECTION');
    navigate('/immediate-reflection', {
      state: {
        stageLevel: `Stage ${stageLevel}`,
        stageName: config.title,
        duration: Math.round(actualDuration / 60),
        posture: posture,
        pahmData: pahmDataForReflection
      },
      replace: true
    });

    console.log('🎯 TIMER COMPLETION FINISHED');
    
  }, [stageLevel, initialMinutes, timeRemaining, pahmCounts, config, posture, addPracticeSession, navigate, userData, robustTimer, hasAudioPermission, audioManager, wakeLockManager]);

  // Timer countdown effect - REMOVED (using robust timer instead)
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Timer completion detection
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      setIsRunning(false);
      handleTimerComplete();
    }
  }, [timeRemaining, isRunning, handleTimerComplete]);

  // 🎯 ENHANCED START HANDLER WITH WAKE LOCK
  const handleStart = async () => {
    if (initialMinutes < config.minDuration) {
      alert(`Stage ${stageLevel} PAHM practice requires a minimum of ${config.minDuration} minutes to be effective.`);
      return;
    }

    // 🔋 Request wake lock to prevent screen sleep
    const wakeLockSuccess = await wakeLockManager.requestWakeLock();
    setIsWakeLockActive(wakeLockSuccess);

    // 🔊 Request audio permission
    const audioSuccess = await audioManager.requestPermission();
    setHasAudioPermission(audioSuccess);

    // ⏰ Create robust timer
    const timer = new RobustTimer(
      initialMinutes * 60,
      (remainingSeconds) => {
        setTimeRemaining(remainingSeconds);
        if (remainingSeconds <= 0) {
          handleTimerComplete();
        }
      }
    );

    setRobustTimer(timer);
    timer.start();
    
    setTimeRemaining(initialMinutes * 60);
    setCurrentStage('practice');
    setIsRunning(true);
    setIsPaused(false);
    
    // Reset PAHM counts
    setPahmCounts({
      nostalgia: 0, likes: 0, anticipation: 0,
      past: 0, present: 0, future: 0,
      regret: 0, dislikes: 0, worry: 0
    } as PAHMCounts);

    console.log('✅ Practice started with wake lock:', wakeLockSuccess, 'audio:', audioSuccess);
  };

  // 🎯 ENHANCED PAUSE HANDLER
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

  // 🎯 ENHANCED QUADRANT CLICK WITH AUDIO
  const handleQuadrantClick = async (quadrant: keyof PAHMCounts) => {
    setPahmCounts(prev => {
      const newCounts = { ...prev };
      newCounts[quadrant] = newCounts[quadrant] + 1;
      return newCounts;
    });

    // 🔊 Audio feedback
    if (hasAudioPermission) {
      await audioManager.playTapSound();
    }

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

  // 🎯 SETUP SCREEN
  if (currentStage === 'setup') {
    return (
      <div style={styles.container}>
        <RecoveryPrompt />
        
        <div style={{ fontSize: 'clamp(32px, 8vw, 48px)', marginBottom: '10px' }}>{config.emoji}</div>
        <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', marginBottom: '10px', textAlign: 'center' }}>
          {config.title}
        </h1>
        <p style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', marginBottom: '20px', textAlign: 'center', opacity: 0.9, lineHeight: '1.4' }}>
          {config.description}
        </p>
        
        <div style={styles.setupCard}>
          <h3 style={{ marginBottom: '15px', fontSize: 'clamp(16px, 4vw, 18px)' }}>
            Duration (minimum {config.minDuration} minutes)
          </h3>
          {/* 🔧 FIXED: Visible input field */}
          <input
            type="number"
            min={config.minDuration}
            max="120"
            value={initialMinutes}
            onChange={(e) => setInitialMinutes(parseInt(e.target.value) || config.minDuration)}
            style={{
              fontSize: 'clamp(20px, 5vw, 24px)',
              padding: 'clamp(12px, 3vw, 15px)',
              width: 'clamp(80px, 20vw, 100px)',
              textAlign: 'center',
              borderRadius: '10px',
              border: '2px solid #667eea',
              marginBottom: '20px',
              // 🔧 FIXED: Visible text color and background
              backgroundColor: 'white',
              color: '#2C3E50',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <div style={{ marginBottom: '20px', fontSize: 'clamp(12px, 3vw, 14px)', opacity: 0.8 }}>
            Posture: {posture} | Stage: {stageLevel}
          </div>
          
          {/* 📱 MOBILE RESPONSIVE BUTTONS */}
          <div style={{ 
            display: 'flex', 
            flexDirection: window.innerWidth < 480 ? 'column' : 'row', 
            gap: '10px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <button
              onClick={handleStart}
              style={{
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                color: 'white',
                padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)',
                border: 'none',
                borderRadius: '25px',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)',
                minWidth: 'clamp(180px, 45vw, 220px)',
                whiteSpace: 'nowrap' as const
              }}
            >
              Start Stage {stageLevel} Practice
            </button>
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)',
                border: '2px solid white',
                borderRadius: '25px',
                fontSize: 'clamp(14px, 3.5vw, 18px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                minWidth: 'clamp(100px, 25vw, 120px)',
                whiteSpace: 'nowrap' as const
              }}
            >
              Back
            </button>
          </div>
        </div>
        
        {/* 🔋 WAKE LOCK STATUS */}
        <div style={{
          marginTop: '20px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '15px',
          borderRadius: '10px',
          fontSize: 'clamp(12px, 3vw, 14px)',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>📱 Screen Lock Prevention</h4>
          <p style={{ marginBottom: '10px', lineHeight: '1.4' }}>
            {wakeLockManager.isSupported() ? 
              '✅ Screen will stay on during practice (like YouTube)' : 
              '⚠️ Screen may lock during practice (timer will continue)'}
          </p>
          <p style={{ fontSize: 'clamp(11px, 2.5vw, 12px)', opacity: 0.8, lineHeight: '1.3' }}>
            • Audio feedback for button taps<br/>
            • Auto-recovery if interrupted<br/>
            • Continues accurately in background
          </p>
        </div>
        
        {/* PAHM Instructions */}
        <div style={{
          marginTop: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: 'clamp(16px, 4vw, 20px)',
          borderRadius: '10px',
          maxWidth: '500px',
          fontSize: 'clamp(12px, 3vw, 14px)',
          lineHeight: '1.6'
        }}>
          <h4 style={{ marginBottom: '10px', fontSize: 'clamp(14px, 3.5vw, 16px)' }}>3×3 PAHM Matrix Instructions:</h4>
          <p>During meditation, tap the appropriate button when you notice your attention:</p>
          <ul style={{ textAlign: 'left', marginTop: '10px', paddingLeft: '20px' }}>
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

  // 🎯 PRACTICE SCREEN - Complete PAHM Matrix with Mobile Responsiveness & Screen Lock Features
  return (
    <div style={styles.container}>
      <RecoveryPrompt />
      
      {/* 🔋 STATUS BAR */}
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

      {/* Stage Badge */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.2)',
        padding: 'clamp(6px, 1.5vw, 8px) clamp(12px, 3vw, 16px)',
        borderRadius: '20px',
        fontSize: 'clamp(12px, 3vw, 14px)',
        fontWeight: 'bold',
        marginBottom: '10px'
      }}>
        {config.emoji} Stage {stageLevel}
      </div>

      {/* Instruction */}
      <div style={styles.instruction}>
        <div style={{
          fontSize: 'clamp(12px, 3vw, 14px)',
          fontWeight: '500',
          opacity: 0.95,
          lineHeight: '1.4'
        }}>
          {config.instruction}
        </div>
      </div>

      {/* 📱 MOBILE RESPONSIVE 3×3 PAHM MATRIX */}
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

      {/* 📱 MOBILE RESPONSIVE CONTROL BUTTONS */}
      <div style={{ 
        display: 'flex', 
        gap: 'clamp(10px, 2.5vw, 15px)', 
        marginBottom: 'clamp(16px, 4vw, 20px)',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
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

      {/* Total Count Display with Additional Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: 'clamp(12px, 3vw, 15px)',
        borderRadius: '10px',
        fontSize: 'clamp(12px, 3vw, 14px)',
        textAlign: 'center' as const,
        maxWidth: '300px'
      }}>
        <div style={{ marginBottom: '8px' }}>
          Total Observations: {(Object.values(pahmCounts) as number[]).reduce((a, b) => a + b, 0)}
        </div>
        <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', opacity: 0.8 }}>
          Present: {pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes} | 
          Past: {pahmCounts.past + pahmCounts.nostalgia + pahmCounts.regret} | 
          Future: {pahmCounts.future + pahmCounts.anticipation + pahmCounts.worry}
        </div>
        {robustTimer && (
          <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', opacity: 0.8, marginTop: '5px' }}>
            Elapsed: {Math.floor(robustTimer.getElapsedSeconds() / 60)}:{(robustTimer.getElapsedSeconds() % 60).toString().padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalPAHMTimer;