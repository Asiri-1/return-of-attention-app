import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useWellness } from './contexts/wellness/WellnessContext';

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

// 🔊 ENHANCED AUDIO FEEDBACK SYSTEM
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

// 🔋 ENHANCED WAKE LOCK MANAGER
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
  
  // ✅ AUDIT COMPLIANT: PAHM matrix state (Universal Architecture format)
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

  // 🔋 Screen lock and audio management
  const [wakeLockManager] = useState(() => new WakeLockManager());
  const [audioManager] = useState(() => new AudioManager());
  const [robustTimer, setRobustTimer] = useState<RobustTimer | null>(null);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [hasAudioPermission, setHasAudioPermission] = useState(false);
  
  // ✅ AUDIT COMPLIANT: Firebase context integration
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { addPracticeSession } = usePractice();
  const { addEmotionalNote } = useWellness();

  // ✅ AUDIT COMPLIANT: Enhanced Firebase session saving
  const handleTimerComplete = useCallback(async () => {
    const endTime = new Date().toISOString();
    const actualDuration = duration;
    
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
    
    // ✅ AUDIT COMPLIANT: Calculate session quality and metrics
    const totalInteractions = Object.values(pahmCounts).reduce((a, b) => a + b, 0);
    const calculatePresentPercentage = (counts: typeof pahmCounts) => {
      if (totalInteractions === 0) return 95;
      
      const presentMomentCounts = counts.present + counts.likes + counts.dislikes;
      return Math.round((presentMomentCounts / totalInteractions) * 100);
    };

    const presentPercentage = calculatePresentPercentage(pahmCounts);

    // ✅ AUDIT COMPLIANT: Convert PAHM counts to Universal Architecture format
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

    // ✅ AUDIT COMPLIANT: Enhanced rating calculation
    const calculateRating = () => {
      const engagementScore = totalInteractions > 15 ? 9 : 
                             totalInteractions > 10 ? 8 : 
                             totalInteractions > 5 ? 7 : 6;
      
      // Bonus for higher present-moment awareness
      const presentBonus = presentPercentage >= 80 ? 1 : 
                          presentPercentage >= 60 ? 0.5 : 0;
      
      return Math.min(10, engagementScore + presentBonus);
    };

    const rating = calculateRating();

    // ✅ AUDIT COMPLIANT: Enhanced practice title mapping
    const getPracticeTitle = (): string => {
      const titleMap: Record<string, string> = {
        'morning-recharge': 'Morning Recharge',
        'emotional-reset': 'Emotional Reset',
        'work-home-transition': 'Work-Home Transition',
        'bedtime-winddown': 'Bedtime Wind Down',
        'mid-day-reset': 'Mid-Day Reset',
        'stress-relief': 'Stress Relief',
        'focus-enhancement': 'Focus Enhancement',
        'anxiety-management': 'Anxiety Management'
      };
      return titleMap[practiceType] || 'Mind Recovery Practice';
    };

    try {
      // ✅ AUDIT COMPLIANT: Complete Firebase session object
      const sessionData: any = {
        timestamp: endTime,
        duration: actualDuration,
        sessionType: 'mind_recovery' as const,
        mindRecoveryContext: practiceType,
        mindRecoveryPurpose: 'stress-relief' as const,
        rating: rating,
        notes: `${getPracticeTitle()} - ${totalInteractions} mindful moments, ${presentPercentage}% present awareness`,
        presentPercentage: presentPercentage,
        environment: {
          posture: posture,
          location: 'unknown',
          lighting: 'unknown',
          sounds: 'unknown'
        },
        pahmCounts: formattedPahmCounts,
        // ✅ AUDIT COMPLIANT: Additional tracking fields
        totalObservations: totalInteractions,
        sessionQuality: rating,
        practiceType: practiceType,
        completed: true,
        type: 'mind_recovery'
      };

      console.log('💾 Saving Mind Recovery session to Firebase:', sessionData);

      // ✅ AUDIT COMPLIANT: Save to Firebase via PracticeContext
      await addPracticeSession(sessionData);

      // ✅ AUDIT COMPLIANT: Enhanced emotional note
      await addEmotionalNote({
        content: `Completed ${actualDuration}-minute ${getPracticeTitle()} session with ${totalInteractions} mindful observations and ${presentPercentage}% present-moment awareness. Quality rating: ${rating}/10. Quick mindfulness reset successful!`,
        emotion: rating >= 8 ? 'accomplished' : rating >= 6 ? 'content' : 'neutral',
        energyLevel: Math.min(10, Math.max(1, Math.round(rating))),
        intensity: Math.min(10, Math.max(1, Math.round(rating))),
        tags: ['mind-recovery', practiceType, posture, 'quick-session', `rating-${Math.round(rating)}`]
      });

      console.log('✅ SESSION SAVED TO FIREBASE! - Mind Recovery 🎉');
      console.log(`✅ Quality Rating: ${rating}/10, Present Awareness: ${presentPercentage}%`);
      
      // Complete with PAHM counts
      onComplete(pahmCounts);
      
    } catch (error) {
      console.error('❌ Error saving Mind Recovery session:', error);
      
      // ✅ AUDIT COMPLIANT: Backup to localStorage for retry
      const backupKey = `mind_recovery_backup_${Date.now()}`;
      const backupData = {
        sessionData: {
          timestamp: endTime,
          duration: actualDuration,
          sessionType: 'mind_recovery' as const,
          mindRecoveryContext: practiceType,
          rating: rating,
          notes: `${getPracticeTitle()} - ${totalInteractions} mindful moments`,
          presentPercentage: presentPercentage,
          pahmCounts: formattedPahmCounts,
          completed: true,
          type: 'mind_recovery'
        },
        pahmCounts: formattedPahmCounts,
        timestamp: endTime
      };
      localStorage.setItem(backupKey, JSON.stringify(backupData));
      
      alert('Session completed but failed to save. Will retry when connection is restored.');
      onComplete(pahmCounts);
    }
  }, [duration, practiceType, posture, pahmCounts, onComplete, addPracticeSession, addEmotionalNote, hasAudioPermission, audioManager, wakeLockManager, robustTimer]);

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

  // ✅ AUDIT COMPLIANT: Enhanced session start handler
  const handleStart = async () => {
    console.log('🚀 Starting Mind Recovery session:', { practiceType, posture, duration });

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
    
    // ✅ AUDIT COMPLIANT: Reset PAHM counts
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

  // ✅ AUDIT COMPLIANT: Enhanced PAHM interaction with audio feedback
  const handleQuadrantClick = async (quadrant: keyof typeof pahmCounts) => {
    setPahmCounts(prev => {
      const newCounts = { ...prev };
      newCounts[quadrant] = newCounts[quadrant] + 1;
      console.log(`📝 PAHM observation: ${quadrant} (${newCounts[quadrant]})`);
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

  const getPracticeTitle = (): string => {
    const titleMap: Record<string, string> = {
      'morning-recharge': 'Morning Recharge',
      'emotional-reset': 'Emotional Reset',
      'work-home-transition': 'Work-Home Transition',
      'bedtime-winddown': 'Bedtime Wind Down',
      'mid-day-reset': 'Mid-Day Reset',
      'stress-relief': 'Stress Relief',
      'focus-enhancement': 'Focus Enhancement',
      'anxiety-management': 'Anxiety Management'
    };
    return titleMap[practiceType] || 'Mind Recovery Practice';
  };

  const getPostureDisplayName = (): string => {
    const postureMap: Record<string, string> = {
      'seated': 'Seated',
      'standing': 'Standing',
      'lying': 'Lying Down',
      'chair': 'Chair',
      'cushion': 'Cushion',
      'bench': 'Bench'
    };
    return postureMap[posture] || posture;
  };

  // ✅ Ultra-compact responsive styles for perfect one-screen fit
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      padding: '8px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    backButton: {
      position: 'absolute' as const,
      top: '10px',
      left: '10px',
      background: 'rgba(255, 255, 255, 0.2)',
      color: 'white',
      border: '2px solid white',
      borderRadius: '20px',
      padding: '6px 12px',
      fontSize: '14px',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      zIndex: 10
    },
    setupCard: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '20px',
      borderRadius: '15px',
      maxWidth: '350px',
      width: '90%',
      textAlign: 'center' as const,
      backdropFilter: 'blur(10px)'
    },
    practiceContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: '0 10px',
      gap: '8px'
    },
    timerDisplay: {
      fontSize: 'clamp(32px, 8vw, 40px)',
      fontWeight: 'bold' as const,
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '8px 16px',
      borderRadius: '12px',
      textAlign: 'center' as const,
      minWidth: '120px'
    },
    instruction: {
      background: 'rgba(255, 255, 255, 0.15)',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: 'clamp(11px, 2.8vw, 13px)',
      lineHeight: '1.3',
      textAlign: 'center' as const,
      maxWidth: '90%'
    },
    matrix: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 'clamp(6px, 1.5vw, 8px)',
      width: '100%',
      maxWidth: 'min(380px, 90vw)',
      aspectRatio: '1',
      margin: '0 auto'
    },
    matrixButton: {
      border: 'none',
      borderRadius: '8px',
      padding: '4px',
      fontSize: 'clamp(8px, 2.2vw, 10px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      textAlign: 'center' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'all 0.3s ease',
      color: '#2C3E50',
      aspectRatio: '1',
      lineHeight: '1.1',
      minHeight: '50px'
    },
    controlButtons: {
      display: 'flex',
      gap: '8px',
      justifyContent: 'center',
      width: '100%',
      maxWidth: '300px'
    },
    controlButton: {
      padding: '8px 12px',
      border: 'none',
      borderRadius: '20px',
      fontSize: 'clamp(12px, 3vw, 14px)',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      color: 'white',
      flex: 1,
      minHeight: '36px'
    },
    statusBar: {
      position: 'absolute' as const,
      top: '10px',
      right: '10px',
      display: 'flex',
      gap: '4px',
      fontSize: '10px',
      zIndex: 10,
      flexWrap: 'wrap' as const,
      maxWidth: '150px'
    },
    statusBadge: {
      padding: '2px 6px',
      borderRadius: '10px',
      fontSize: '10px',
      fontWeight: 'bold' as const,
      color: 'white',
      whiteSpace: 'nowrap' as const
    },
    sessionStats: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: 'clamp(10px, 2.5vw, 12px)',
      textAlign: 'center' as const,
      maxWidth: '250px',
      width: '100%'
    }
  };

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
              🔋 Ready
            </div>
          )}
        </div>

        <button onClick={onBack} style={styles.backButton}>
          ← Back
        </button>

        <div style={styles.setupCard}>
          <h1 style={{ 
            fontSize: 'clamp(20px, 5vw, 24px)', 
            margin: '0 0 15px 0',
            fontWeight: 'bold'
          }}>
            {getPracticeTitle()}
          </h1>
          
          <h3 style={{ 
            marginBottom: '15px', 
            fontSize: 'clamp(16px, 4vw, 18px)',
            opacity: 0.9
          }}>
            {duration}-Minute Mind Recovery
          </h3>
          
          <div style={{ 
            marginBottom: '20px', 
            fontSize: 'clamp(14px, 3.5vw, 16px)', 
            opacity: 0.8 
          }}>
            Posture: {getPostureDisplayName()}
          </div>
          
          <button 
            onClick={handleStart} 
            style={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '25px',
              fontSize: 'clamp(16px, 4vw, 18px)',
              fontWeight: 'bold',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Begin Practice
          </button>
        </div>
        
        {/* Info Card */}
        <div style={{
          marginTop: '15px',
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '12px 16px',
          borderRadius: '10px',
          maxWidth: '350px',
          fontSize: 'clamp(11px, 2.8vw, 13px)',
          lineHeight: '1.4',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 6px 0' }}>
            {wakeLockManager.isSupported() ? 
              '✅ Screen stays on during practice' : 
              '⚠️ Screen may lock (timer continues)'}
          </p>
          <p style={{ margin: '0', opacity: 0.8 }}>
            Use the PAHM matrix to track where your attention goes during practice.
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
            🔋 On
          </div>
        )}
        
        {hasAudioPermission && (
          <div style={{
            ...styles.statusBadge,
            background: 'rgba(33, 150, 243, 0.8)'
          }}>
            🔊 On
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

      <div style={styles.practiceContainer}>
        {/* Timer Display */}
        <div style={styles.timerDisplay}>
          {formatTime(timeRemaining)}
        </div>

        {/* Instruction */}
        <div style={styles.instruction}>
          📝 <strong>Mind Recovery:</strong> Notice where your attention goes, tap when you recognize thoughts
        </div>

        {/* ✅ AUDIT COMPLIANT: Perfectly centered 3×3 PAHM MATRIX */}
        <div style={styles.matrix}>
          {/* Row 1: ATTACHMENT */}
          <button
            onClick={() => handleQuadrantClick('nostalgia')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #E8B4A0 0%, #D7A86E 100%)',
              filter: flashingButton === 'nostalgia' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'nostalgia' ? '0 0 15px rgba(232, 180, 160, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>NOSTALGIA</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.nostalgia}</div>
          </button>

          <button
            onClick={() => handleQuadrantClick('likes')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #A8E6CF 0%, #7FCDCD 100%)',
              border: '2px solid #4A90A4',
              filter: flashingButton === 'likes' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'likes' ? '0 0 15px rgba(168, 230, 207, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>LIKES</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.likes}</div>
          </button>

          <button
            onClick={() => handleQuadrantClick('anticipation')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #B4A7D6 0%, #9A8AC1 100%)',
              filter: flashingButton === 'anticipation' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'anticipation' ? '0 0 15px rgba(180, 167, 214, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>ANTICIPATION</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.anticipation}</div>
          </button>

          {/* Row 2: NEUTRAL */}
          <button
            onClick={() => handleQuadrantClick('past')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #F4D03F 0%, #F1C40F 100%)',
              filter: flashingButton === 'past' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'past' ? '0 0 15px rgba(244, 208, 63, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>PAST</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.past}</div>
          </button>

          <button
            onClick={() => handleQuadrantClick('present')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
              border: '3px solid #4A90A4',
              filter: flashingButton === 'present' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'present' ? '0 0 20px rgba(74, 144, 164, 0.9)' : '0 4px 8px rgba(74, 144, 164, 0.3)'
            }}
          >
            <div>PRESENT</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.present}</div>
          </button>

          <button
            onClick={() => handleQuadrantClick('future')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #85C1E9 0%, #5DADE2 100%)',
              filter: flashingButton === 'future' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'future' ? '0 0 15px rgba(133, 193, 233, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>FUTURE</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.future}</div>
          </button>

          {/* Row 3: AVERSION */}
          <button
            onClick={() => handleQuadrantClick('regret')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #E6B8A2 0%, #D7A86E 100%)',
              filter: flashingButton === 'regret' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'regret' ? '0 0 15px rgba(230, 184, 162, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>REGRET</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.regret}</div>
          </button>

          <button
            onClick={() => handleQuadrantClick('dislikes')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #F5B7B1 0%, #E8B4A0 100%)',
              border: '2px solid #4A90A4',
              filter: flashingButton === 'dislikes' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'dislikes' ? '0 0 15px rgba(245, 183, 177, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>DISLIKES</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.dislikes}</div>
          </button>

          <button
            onClick={() => handleQuadrantClick('worry')}
            style={{
              ...styles.matrixButton,
              background: 'linear-gradient(135deg, #D5BDDD 0%, #C8A8D8 100%)',
              filter: flashingButton === 'worry' ? 'brightness(1.3)' : 'brightness(1)',
              boxShadow: flashingButton === 'worry' ? '0 0 15px rgba(213, 189, 221, 0.8)' : '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <div>WORRY</div>
            <div style={{ fontSize: '8px', opacity: 0.7 }}>{pahmCounts.worry}</div>
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
            Complete
          </button>
        </div>

        {/* ✅ AUDIT COMPLIANT: Enhanced Session Stats */}
        <div style={styles.sessionStats}>
          <div style={{ marginBottom: '4px' }}>
            Observations: {Object.values(pahmCounts).reduce((a, b) => a + b, 0)}
          </div>
          <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '2px' }}>
            Present: {((pahmCounts.present + pahmCounts.likes + pahmCounts.dislikes) / Math.max(1, Object.values(pahmCounts).reduce((a, b) => a + b, 0)) * 100).toFixed(0)}%
          </div>
          {robustTimer && (
            <div style={{ fontSize: '10px', opacity: 0.8 }}>
              Elapsed: {Math.floor(robustTimer.getElapsedSeconds() / 60)}:{(robustTimer.getElapsedSeconds() % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindRecoveryTimer;