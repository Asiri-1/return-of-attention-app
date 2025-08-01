// ✅ COMPLETE FIXED HomeDashboard.tsx - Using useHappinessCalculation Hook (Full Version)
// File: src/HomeDashboard.tsx
// 🔧 FIXED: Removed local happiness state, now uses centralized useHappinessCalculation hook

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
// 🎯 CRITICAL FIX: Import and use the happiness calculation hook
import { useHappinessCalculation } from './hooks/useHappinessCalculation';

interface HomeDashboardProps {
  onStartPractice: () => void;
  onViewProgress: () => void;
  onViewLearning: () => void;
  onLogout: () => void;
  onStartStage2: () => void;
  onStartStage3: () => void;
  onStartStage4: () => void;
  onStartStage5: () => void;
  onStartStage6: () => void;
  onShowPostureGuide: () => void;
  onShowPAHMExplanation: () => void;
  onShowWhatIsPAHM: () => void;
}

const HomeDashboard: React.FC<HomeDashboardProps> = ({
  onStartPractice,
  onViewProgress,
  onViewLearning,
  onLogout,
  onStartStage2,
  onStartStage3,
  onStartStage4,
  onStartStage5,
  onStartStage6,
  onShowPostureGuide,
  onShowPAHMExplanation,
  onShowWhatIsPAHM
}) => {
  const { currentUser } = useAuth();
  const { sessions } = usePractice();
  const navigate = useNavigate();
  const location = useLocation();

  // 🎯 CRITICAL FIX: Use the centralized happiness calculation hook instead of local state
  const { 
    userProgress, 
    isCalculating, 
    forceRecalculation,
    componentBreakdown,
    practiceSessions,
    emotionalNotes
  } = useHappinessCalculation();

  // ✅ PERFORMANCE: Stable refs for cleanup
  const t5ListenerRef = useRef<(() => void) | null>(null);

  const [currentStage, setCurrentStage] = useState<number>(1);
  const [streak, setStreak] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [showT1T5Dropdown, setShowT1T5Dropdown] = useState<boolean>(false);
  const [showAccessModal, setShowAccessModal] = useState<{ show: boolean; stage: number }>({
    show: false,
    stage: 0
  });

  // 🎯 FIXED: Get happiness data from the hook instead of local state
  const happinessData = useMemo(() => ({
    happiness_points: userProgress.happiness_points || 0,
    current_level: userProgress.user_level || 'Beginning Seeker',
    isCalculating: isCalculating
  }), [userProgress.happiness_points, userProgress.user_level, isCalculating]);

  // ✅ NEW: Force data refresh function using the hook
  const forceDataRefresh = useCallback(() => {
    console.log('🔄 Forcing data refresh in HomeDashboard...');
    if (forceRecalculation) {
      forceRecalculation();
    }
  }, [forceRecalculation]);

  // ✅ CRITICAL FIX: Universal stage unlock checker
  const checkStageUnlocked = useCallback((targetStage: number): boolean => {
    try {
      // Get current stage progress from multiple sources
      const stageProgress = parseInt(localStorage.getItem('stageProgress') || '1');
      const devCurrentStage = parseInt(localStorage.getItem('devCurrentStage') || '1');
      const currentStageValue = parseInt(localStorage.getItem('currentStage') || '1');
      
      // Use the highest stage value from all sources
      const maxStageReached = Math.max(stageProgress, devCurrentStage, currentStageValue);
      
      // Check specific stage completion flags
      const t5Complete = localStorage.getItem('t5Complete') === 'true';
      const stage2Complete = localStorage.getItem('stage2Complete') === 'true';
      const stage3Complete = localStorage.getItem('stage3Complete') === 'true';
      const stage4Complete = localStorage.getItem('stage4Complete') === 'true';
      const stage5Complete = localStorage.getItem('stage5Complete') === 'true';
      
      console.log('🔍 Stage unlock check:', {
        targetStage,
        maxStageReached,
        t5Complete,
        stage2Complete,
        stage3Complete,
        stage4Complete,
        stage5Complete
      });
      
      // Progressive unlock logic
      switch (targetStage) {
        case 1:
          return true; // Stage 1 is always unlocked
          
        case 2:
          // Stage 2 unlocks when T5 is complete OR stageProgress >= 2
          return t5Complete || maxStageReached >= 2;
          
        case 3:
          // Stage 3 unlocks when Stage 2 is complete OR stageProgress >= 3
          return stage2Complete || maxStageReached >= 3;
          
        case 4:
          // Stage 4 unlocks when Stage 3 is complete OR stageProgress >= 4
          return stage3Complete || maxStageReached >= 4;
          
        case 5:
          // Stage 5 unlocks when Stage 4 is complete OR stageProgress >= 5
          return stage4Complete || maxStageReached >= 5;
          
        case 6:
          // Stage 6 unlocks when Stage 5 is complete OR stageProgress >= 6
          return stage5Complete || maxStageReached >= 6;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking stage unlock:', error);
      return targetStage === 1; // Default to only Stage 1 unlocked
    }
  }, []);

  // ✅ ENHANCED STAGE DISPLAY LOGIC
  const getStageDisplayInfo = useCallback((stageNumber: number) => {
    const isUnlocked = checkStageUnlocked(stageNumber);
    const stageProgress = parseInt(localStorage.getItem('stageProgress') || '1');
    const devCurrentStage = parseInt(localStorage.getItem('devCurrentStage') || '1');
    const maxStageReached = Math.max(stageProgress, devCurrentStage);
    
    const isCurrentOrCompleted = isUnlocked && maxStageReached >= stageNumber;
    
    let lockMessage = '';
    if (!isUnlocked) {
      switch (stageNumber) {
        case 2:
          lockMessage = '🔒 Complete Stage 1 (T5) to unlock';
          break;
        case 3:
          lockMessage = '🔒 Complete Stage 2 to unlock';
          break;
        case 4:
          lockMessage = '🔒 Complete Stage 3 to unlock';
          break;
        case 5:
          lockMessage = '🔒 Complete Stage 4 to unlock';
          break;
        case 6:
          lockMessage = '🔒 Complete Stage 5 to unlock';
          break;
        default:
          lockMessage = '🔒 Locked';
      }
    }
    
    return {
      isUnlocked,
      isCurrentOrCompleted,
      lockMessage,
      icon: isCurrentOrCompleted ? '✅' : isUnlocked ? '▶️' : '🔒'
    };
  }, [checkStageUnlocked]);

  // ✅ DATA REFRESH FUNCTION
  const refreshDashboardData = useCallback(() => {
    console.log('🔄 Refreshing dashboard data...');
    
    // Force re-read all progression data
    const stageProgress = parseInt(localStorage.getItem('stageProgress') || '1');
    const devCurrentStage = parseInt(localStorage.getItem('devCurrentStage') || '1');
    const maxStage = Math.max(stageProgress, devCurrentStage);
    
    if (maxStage !== currentStage) {
      console.log(`📈 Stage updated: ${currentStage} → ${maxStage}`);
      setCurrentStage(maxStage);
    }
    
    // Recalculate user stats
    calculateUserStats();
    
    // Force happiness calculation refresh if available
    if (forceRecalculation) {
      forceRecalculation();
    }
  }, [currentStage, forceRecalculation]);

  // ✅ PERFORMANCE: Memoized static data to prevent recreation
  const tLevels = useMemo(() => [
    { level: 'T1', duration: 10, title: 'T1: Physical Stillness for 10 minutes' },
    { level: 'T2', duration: 15, title: 'T2: Physical Stillness for 15 minutes' },
    { level: 'T3', duration: 20, title: 'T3: Physical Stillness for 20 minutes' },
    { level: 'T4', duration: 25, title: 'T4: Physical Stillness for 25 minutes' },
    { level: 'T5', duration: 30, title: 'T5: Physical Stillness for 30 minutes' }
  ], []);

  const stageData = useMemo(() => [
    { num: 2, title: 'PAHM Trainee', desc: 'Basic attention training' },
    { num: 3, title: 'PAHM Beginner', desc: 'Structured practice' },
    { num: 4, title: 'PAHM Practitioner', desc: 'Advanced techniques' },
    { num: 5, title: 'PAHM Master', desc: 'Refined awareness' },
    { num: 6, title: 'PAHM Illuminator', desc: 'Complete mastery' }
  ], []);

  // ✅ PERFORMANCE: Memoized resource data with stable onClick references
  const resourceData = useMemo(() => [
    {
      icon: '📖',
      title: `Stage ${currentStage} Guide`,
      desc: 'Learn about your current stage and practice techniques',
      onClick: onViewLearning
    },
    {
      icon: '🧘',
      title: 'Posture Guide',
      desc: 'Find the optimal meditation posture for your practice',
      onClick: onShowPostureGuide
    },
    {
      icon: '🔍',
      title: 'PAHM Matrix Explained',
      desc: 'Understand the Present Attention and Happiness Matrix',
      onClick: onShowPAHMExplanation
    }
  ], [currentStage, onViewLearning, onShowPostureGuide, onShowPAHMExplanation]);

  // ✅ PERFORMANCE: Memoized styles to prevent recreation on every render
  const styles = useMemo(() => ({
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    } as React.CSSProperties,
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      padding: 'clamp(12px, 3vw, 20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: '12px',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'relative' as const,
      zIndex: 10
    } as React.CSSProperties,
    welcomeTitle: {
      margin: 0,
      fontSize: 'clamp(16px, 5vw, 28px)',
      fontWeight: '700',
      color: 'white',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    } as React.CSSProperties,
    main: {
      padding: 'clamp(16px, 4vw, 20px)',
      maxWidth: '1200px',
      margin: '0 auto'
    } as React.CSSProperties,
    section: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: 'clamp(16px, 4vw, 20px)',
      padding: 'clamp(20px, 5vw, 32px)',
      marginBottom: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: '24px',
      marginBottom: '20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      textAlign: 'center' as const
    } as React.CSSProperties,
    gridLayout: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px'
    } as React.CSSProperties,
    primaryButton: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    } as React.CSSProperties,
    secondaryButton: {
      background: 'rgba(102, 126, 234, 0.1)',
      color: '#667eea',
      border: '2px solid rgba(102, 126, 234, 0.2)',
      borderRadius: '12px',
      padding: '16px 20px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.3s ease'
    } as React.CSSProperties
  }), []);

  // ✅ PERFORMANCE: Optimized happiness points button style with stable dependencies
  const getHappinessButtonStyle = useCallback((happiness_points: number) => {
    const baseStyle: React.CSSProperties = {
      padding: 'clamp(8px, 2vw, 12px) clamp(12px, 3vw, 24px)',
      borderRadius: '50px',
      color: 'white',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
      textAlign: 'center' as const,
      minWidth: 'clamp(100px, 25vw, 120px)',
      border: '2px solid rgba(255, 255, 255, 0.2)',
      position: 'relative' as const,
      flexShrink: 0
    };

    // ✅ FIXED: More accurate color coding for happiness points
    const background = happiness_points === 0
      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' // Gray for 0 points
      : happiness_points > 400 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' // Green for high scores
      : happiness_points > 200
      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' // Yellow for medium scores
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'; // Red for low scores

    return { ...baseStyle, background };
  }, []);

  // ✅ PERFORMANCE: Stable user stats calculation with proper dependencies
  const calculateUserStats = useCallback(() => {
    if (!currentUser || !sessions || sessions.length === 0) {
      setStreak(0);
      setTotalHours(0);
      return;
    }

    try {
      const totalPracticeHours = sessions.reduce((total: number, session: any) => {
        const duration = session.duration || 0;
        return total + (duration / 60);
      }, 0);

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const uniqueDateSessions = [...sessions]
        .map(session => {
          const date = new Date(session.timestamp);
          date.setHours(0, 0, 0, 0);
          return date;
        })
        .sort((a, b) => b.getTime() - a.getTime())
        .filter((date, index, arr) => index === 0 || date.getTime() !== arr[index - 1].getTime());

      let streakCount = 0;
      let checkDate = new Date(today);

      for (const sessionDate of uniqueDateSessions) {
        const diffDays = Math.floor((checkDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streakCount) {
          streakCount++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      currentStreak = streakCount;

      setStreak(currentStreak);
      setTotalHours(Math.round(totalPracticeHours * 10) / 10);

    } catch (error) {
      // ✅ CODE QUALITY: Only log errors in development, silent in production
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calculating user stats:', error);
      }
      setStreak(0);
      setTotalHours(0);
    }
  }, [currentUser, sessions]);

  // ✅ PERFORMANCE: Stable event handlers with useCallback
  const handleHappinessPointsClick = useCallback(() => {
    navigate('/happiness-tracker');
  }, [navigate]);

  // ✅ ENHANCED: Updated Stage Click Logic with proper progression checking
  const handleStageClick = useCallback((stageNumber: number) => {
    if (stageNumber === 1) {
      // ✅ NEW: Check if user has seen Stage 1 introduction before
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      const hasSeenIntroduction = completedIntros.includes(1);
      
      if (!hasSeenIntroduction) {
        // First time - go to introduction
        navigate('/stage1-introduction', { 
          state: { 
            hasSeenBefore: false,
            returnToHome: true
          } 
        });
        return;
      } else {
        // Second time and onwards - show T-level dropdown
        setShowT1T5Dropdown(prev => !prev);
        return;
      }
    }

    // ✅ FIXED: Use new progression checking logic
    const stageInfo = getStageDisplayInfo(stageNumber);
    
    if (!stageInfo.isUnlocked) {
      setShowAccessModal({ show: true, stage: stageNumber });
      return;
    }

    // ✅ FIXED: Update current stage and navigate
    setCurrentStage(stageNumber);
    
    // Update localStorage with the accessed stage
    const currentMax = Math.max(
      parseInt(localStorage.getItem('devCurrentStage') || '1'),
      stageNumber
    );
    localStorage.setItem('devCurrentStage', currentMax.toString());

    navigate(`/stage${stageNumber}`);
  }, [navigate, getStageDisplayInfo]);

  // ✅ UPDATED: T-Level click handler - now checks for introduction completion
  const handleTLevelClick = useCallback((level: string, duration: number) => {
    sessionStorage.setItem('currentTLevel', level.toLowerCase());

    // ✅ NEW: Check if user has seen T-level introduction
    const hasSeenTLevelIntro = localStorage.getItem('hasSeenTLevelIntro') === 'true';
    
    navigate(`/stage1`, { 
      state: { 
        showT1Introduction: !hasSeenTLevelIntro, // Show intro only if not seen before
        level: level,
        duration: duration,
        stageLevel: `${level}: Physical Stillness for ${duration} minutes`,
        returnToStage: 1,
        hasSeenBefore: hasSeenTLevelIntro
      } 
    });
  }, [navigate]);

  // ✅ PERFORMANCE: Stable navigation handlers
  const handleNavigateToNotes = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

  const handleNavigateToChat = useCallback(() => {
    navigate('/chatwithguru');
  }, [navigate]);

  const handleNavigateToMindRecovery = useCallback(() => {
    navigate('/mind-recovery');
  }, [navigate]);

  // ✅ PERFORMANCE: Optimized hover handlers with useCallback
  const createHoverHandler = useCallback((transform: string, boxShadow?: string) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = transform;
      if (boxShadow) {
        e.currentTarget.style.boxShadow = boxShadow;
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      e.currentTarget.style.transform = 'translateY(0px)';
      if (boxShadow) {
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.2)';
      }
    }
  }), []);

  const buttonHoverProps = useMemo(() => createHoverHandler('translateY(-2px)'), [createHoverHandler]);
  const happinessHoverProps = useMemo(() => createHoverHandler('translateY(-2px) scale(1.05)', '0 12px 30px rgba(0, 0, 0, 0.3)'), [createHoverHandler]);

  // ✅ PERFORMANCE: Load initial data on mount with optimized dependencies
  useEffect(() => {
    calculateUserStats();
  }, [calculateUserStats]);

  // ✅ NEW: Critical Fix - Listen for navigation returns and force refresh
  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - checking for data refresh...');
      // Small delay to allow localStorage updates to settle
      setTimeout(() => {
        forceDataRefresh();
      }, 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible - checking for data refresh...');
        setTimeout(() => {
          forceDataRefresh();
        }, 100);
      }
    };

    // Listen for window focus (user returns from another tab/window)
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceDataRefresh]);

  // ✅ ENHANCED: Listen for stage completions and happiness data changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('🔄 Storage changed:', e.key, e.newValue);
      
      // Check for stage completions
      if (e.key?.includes('stage') && e.key?.includes('Complete') && e.newValue === 'true') {
        console.log(`🎯 Stage completion detected: ${e.key}`);
        
        // Extract stage number from key (e.g., 'stage2Complete' → 2)
        const stageMatch = e.key.match(/stage(\d+)Complete/);
        if (stageMatch) {
          const completedStage = parseInt(stageMatch[1]);
          const nextStage = completedStage + 1;
          
          // Update progression to next stage
          localStorage.setItem('stageProgress', nextStage.toString());
          localStorage.setItem('devCurrentStage', nextStage.toString());
          
          console.log(`✅ Stage ${completedStage} completed, unlocked Stage ${nextStage}`);
          
          // Refresh dashboard data
          setTimeout(() => {
            refreshDashboardData();
          }, 100);
        }
      }
      
      if (e.key === 't5Complete' && e.newValue === 'true') {
        console.log('🎯 T5 completion detected, unlocking Stage 2');
        localStorage.setItem('stageProgress', '2');
        localStorage.setItem('devCurrentStage', '2');
        
        setTimeout(() => {
          refreshDashboardData();
        }, 100);
      }
      
      // Check for self-assessment or questionnaire completion
      if (e.key === 'selfAssessment' || 
          e.key === 'questionnaire' || 
          e.key === 'onboardingData' ||
          e.key?.includes('assessment') ||
          e.key?.includes('happiness')) {
        console.log('🎯 Assessment data changed - forcing refresh...');
        setTimeout(() => {
          forceDataRefresh();
        }, 200);
      }
    };

    // ✅ CRITICAL: Listen for happiness data clearing
    const handleHappinessClear = () => {
      console.log('🎯 Happiness data cleared - forcing immediate refresh...');
      forceDataRefresh();
    };

    // Listen for custom events from admin panel
    window.addEventListener('happinessDataCleared', handleHappinessClear);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('happinessDataCleared', handleHappinessClear);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [refreshDashboardData, forceDataRefresh]);

  // ✅ ENHANCED LOCATION STATE LISTENER
  useEffect(() => {
    console.log('🔄 Location changed, checking for stage updates...', location.pathname, location.state);
    
    // Check for stage completion in location state
    const locationState = location.state as any;
    if (locationState) {
      if (locationState.stage2Completed) {
        console.log('🎯 Stage 2 completion confirmed via navigation state');
        refreshDashboardData();
      }
      if (locationState.stage3Completed) {
        console.log('🎯 Stage 3 completion confirmed via navigation state');
        refreshDashboardData();
      }
      if (locationState.unlockedStage) {
        console.log(`🎯 Stage ${locationState.unlockedStage} unlocked via navigation state`);
        refreshDashboardData();
      }
    }
    
    // Check if returning from assessment routes
    const isReturningFromAssessment = locationState && (
      locationState.fromSelfAssessment || 
      locationState.fromQuestionnaire ||
      locationState.completedAssessment
    );

    if (isReturningFromAssessment) {
      console.log('🎯 Returning from assessment - forcing data refresh...');
      setTimeout(() => {
        forceDataRefresh();
      }, 500); // Longer delay for assessment completion
    }

    // Always refresh on location change with shorter delay
    if (location.pathname === '/home') {
      setTimeout(() => {
        refreshDashboardData();
      }, 100);
    }
  }, [location.pathname, location.state, refreshDashboardData, forceDataRefresh]);

  // ✅ PERFORMANCE: Optimized T5 completion listener with proper cleanup
  useEffect(() => {
    const t5Completed = sessionStorage.getItem('t5Completed') === 'true' ||
                        localStorage.getItem('t5Completed') === 'true';

    if (t5Completed && currentStage < 2) {
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');
    }

    const handleT5StorageChange = (e: StorageEvent) => {
      if (e.key === 't5Completed' && e.newValue === 'true') {
        setCurrentStage(2);
        localStorage.setItem('devCurrentStage', '2');
        sessionStorage.setItem('stageProgress', '2');
      }
    };

    window.addEventListener('storage', handleT5StorageChange);
    t5ListenerRef.current = () => window.removeEventListener('storage', handleT5StorageChange);
    
    return () => {
      if (t5ListenerRef.current) {
        t5ListenerRef.current();
      }
    };
  }, [currentStage]);

  // ✅ PERFORMANCE: Optimized location-based effects with stable dependencies
  useEffect(() => {
    const stageProgress = sessionStorage.getItem('stageProgress');
    if (stageProgress) {
      const progressStage = parseInt(stageProgress, 10);
      if (!isNaN(progressStage) && progressStage > 0 && progressStage <= 6) {
        setCurrentStage(progressStage);
        localStorage.setItem('devCurrentStage', progressStage.toString());
      }
    }

    const returnFromStage1 = sessionStorage.getItem('returnFromStage1');
    if (returnFromStage1 === 'true') {
      setCurrentStage(1);
      setShowT1T5Dropdown(true);
      sessionStorage.removeItem('returnFromStage1');
    }

    if (location.state && (location.state as any).fromT5Completion) {
      setCurrentStage(2);
      localStorage.setItem('devCurrentStage', '2');
      sessionStorage.setItem('stageProgress', '2');
      window.location.reload();
    }
  }, [location]);

  // ✅ PERFORMANCE: Memoized display name to prevent string operations on every render
  const displayName = useMemo(() => {
    return currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : '';
  }, [currentUser?.displayName]);

  // ✅ FIXED: Show loading state when happiness is being calculated
  if (isCalculating) {
    return (
      <div style={styles.container}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          color: 'white',
          fontSize: '18px'
        }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div>Calculating your present attention progress...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          <h1 style={styles.welcomeTitle}>
            Welcome{displayName}
          </h1>
        </div>
        
        <div 
          onClick={handleHappinessPointsClick}
          style={getHappinessButtonStyle(happinessData.happiness_points)}
          {...happinessHoverProps}
        >
          <div style={{
            fontSize: 'clamp(18px, 5vw, 24px)',
            fontWeight: 'bold',
            marginBottom: '2px'
          }}>
            😊 {happinessData.happiness_points}
          </div>
          <div style={{
            fontSize: 'clamp(9px, 2.5vw, 11px)',
            opacity: 0.9,
            fontWeight: '500'
          }}>
            Happiness Points
          </div>
          {/* ✅ FIXED: Only show sparkle for actual high scores */}
          {happinessData.happiness_points > 400 && (
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#10b981',
              border: '2px solid white',
              fontSize: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ✨
            </div>
          )}
        </div>
        
        <div style={{
          display: 'flex',
          gap: 'clamp(8px, 2vw, 16px)',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          width: '100%',
          marginTop: '8px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            🔥 {streak} day{streak !== 1 ? 's' : ''} streak
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            ⏱️ {totalHours}h total
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            padding: 'clamp(6px, 1.5vw, 8px) clamp(8px, 2vw, 12px)',
            borderRadius: '12px',
            color: 'white',
            fontSize: 'clamp(10px, 2.5vw, 12px)',
            fontWeight: '600',
            whiteSpace: 'nowrap'
          }}>
            🏆 {happinessData.current_level}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* Welcome Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Your Mindfulness Journey
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', textAlign: 'center' }}>
            {/* ✅ FIXED: Better logic to check completion status including calculation state */}
            {happinessData.happiness_points === 0 && !happinessData.isCalculating ? (
              <>
                Welcome! You can practice Stage 1 anytime. Complete your <strong>questionnaire, self-assessment, or practice sessions</strong> to enable happiness tracking.
              </>
            ) : (
              <>
                Welcome back! Your happiness points: <strong>{happinessData.happiness_points}</strong>
              </>
            )}
          </p>
          
          <div style={styles.gridLayout}>
            <button
              onClick={onViewProgress}
              style={styles.primaryButton}
              {...buttonHoverProps}
            >
              📊 View Progress
            </button>
            <button
              onClick={handleNavigateToNotes}
              style={styles.secondaryButton}
              {...buttonHoverProps}
            >
              📝 Daily Notes
            </button>
            <button
              onClick={handleNavigateToChat}
              style={styles.secondaryButton}
              {...buttonHoverProps}
            >
              🧘 Chat with Guru
            </button>
          </div>
        </section>

        {/* ✅ NEW: Success message when happiness tracking is enabled */}
        {happinessData.happiness_points > 0 && (
          <section style={{
            ...styles.section,
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '2px solid #10b981',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ 
                fontSize: '20px', 
                color: '#065f46', 
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                ✅ Happiness Tracking Enabled!
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#065f46', 
                margin: 0 
              }}>
                Your current happiness score: <strong>{happinessData.happiness_points} points</strong> 
                ({happinessData.current_level})
              </p>
            </div>
          </section>
        )}

        {/* ✅ NEW: Enhanced tracking suggestion for users with basic tracking */}
        {happinessData.happiness_points > 0 && !userProgress.dataCompleteness?.selfAssessment && (
          <section style={{
            ...styles.section,
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            border: '2px solid #f59e0b',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <h3 style={{ 
                fontSize: '18px', 
                color: '#92400e', 
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                🎯 Enhance Your Happiness Tracking
              </h3>
              <p style={{ 
                fontSize: '14px', 
                color: '#92400e', 
                margin: '0 0 16px 0' 
              }}>
                Complete your self-assessment for more detailed insights and personalized recommendations!
              </p>
              
              <button
                onClick={() => {
                  console.log('🎯 Navigating to self-assessment for enhanced tracking...');
                  navigate('/self-assessment', { 
                    state: { 
                      returnTo: '/home', 
                      enhancedMode: true,
                      fromHomeDashboard: true 
                    } 
                  });
                }}
                style={{
                  background: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#d97706';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f59e0b';
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                🎯 Complete Self-Assessment
              </button>
              
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '12px',
                fontSize: '12px',
                color: '#92400e'
              }}>
                <strong>Benefits:</strong> Attachment flexibility scoring, deeper insights, and personalized meditation recommendations
              </div>
            </div>
          </section>
        )}

        {/* ✅ FIXED: Improved onboarding section logic - only show when truly no happiness data */}
        {happinessData.happiness_points === 0 && !happinessData.isCalculating && (
          <section style={styles.section}>
            <h2 style={{ ...styles.sectionTitle, color: '#f59e0b' }}>
              🌟 Complete Your Onboarding to Enable Happiness Tracking
            </h2>
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '20px',
              border: '2px solid #f59e0b'
            }}>
              <p style={{ fontSize: '16px', color: '#92400e', marginBottom: '16px', textAlign: 'center' }}>
                Your <strong>happiness tracking</strong> will begin once you complete any of these:
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                
                {/* ✅ NEW: Interactive Questionnaire + Self-Assessment Button */}
                <button
                  onClick={() => {
                    console.log('🚀 Navigating to questionnaire from onboarding...');
                    navigate('/questionnaire', { 
                      state: { 
                        returnTo: '/home',
                        fromHomeDashboard: true 
                      } 
                    });
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f59e0b';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                  <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '4px', fontSize: '16px' }}>
                    Complete Questionnaire
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>
                    + Self-Assessment
                  </div>
                  <div style={{
                    background: '#f59e0b',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 auto',
                    maxWidth: '120px'
                  }}>
                    Start Now →
                  </div>
                </button>

                {/* ✅ IMPROVED: Sessions Info Card (not clickable, informational) */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'center',
                  border: '2px solid #e5e7eb',
                  position: 'relative'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🧘</div>
                  <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '4px', fontSize: '16px' }}>
                    Complete 3+ Sessions
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>
                    Any T-level practice
                  </div>
                  <div style={{
                    background: '#e5e7eb',
                    color: '#6b7280',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 auto',
                    maxWidth: '140px'
                  }}>
                    Practice Below ↓
                  </div>
                </div>

                {/* ✅ NEW: Quick Path Interactive Button */}
                <button
                  onClick={() => {
                    console.log('🚀 Navigating to questionnaire (Quick Path)...');
                    navigate('/questionnaire', { 
                      state: { 
                        returnTo: '/home',
                        quickPath: true,
                        fromHomeDashboard: true,
                        message: 'Quick Path: Complete questionnaire, then do 1 practice session!' 
                      } 
                    });
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    border: '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#10b981';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
                  <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '4px', fontSize: '16px' }}>
                    Quick Path
                  </div>
                  <div style={{ fontSize: '12px', color: '#92400e', marginBottom: '8px' }}>
                    Questionnaire + 1 Session
                  </div>
                  <div style={{
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    margin: '0 auto',
                    maxWidth: '100px'
                  }}>
                    Fastest →
                  </div>
                </button>
              </div>
              
              {/* ✅ NEW: Alternative Direct Access Section */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '20px',
                textAlign: 'center',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <div style={{ 
                  fontSize: '16px', 
                  color: '#92400e', 
                  fontWeight: '600', 
                  marginBottom: '12px' 
                }}>
                  📊 Or Take Just the Self-Assessment
                </div>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#92400e', 
                  marginBottom: '16px',
                  margin: '0 0 16px 0' 
                }}>
                  Quicker option: Skip questionnaire and go directly to the attachment assessment
                </p>
                <button
                  onClick={() => {
                    console.log('🚀 Navigating to self-assessment directly...');
                    navigate('/self-assessment', { 
                      state: { 
                        returnTo: '/home',
                        fromHomeDashboard: true 
                      } 
                    });
                  }}
                  style={{
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d97706';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f59e0b';
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                  }}
                >
                  🎯 Take Self-Assessment Only
                </button>
              </div>
              
              {/* ✅ IMPROVED: Info Note */}
              <div style={{
                background: 'rgba(245, 158, 11, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '14px', color: '#92400e', fontWeight: '600' }}>
                  📊 <strong>Important:</strong> Stage progression is sequential (complete Stage 1 → unlock Stage 2), 
                  but happiness tracking requires onboarding completion.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Stages Section */}
        <section style={styles.section}>
          <h2 style={{ ...styles.sectionTitle, marginBottom: '8px' }}>
            Practice Stages
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#666', 
            textAlign: 'center',
            marginBottom: '24px' 
          }}>
            Choose your practice stage and begin your mindfulness journey
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Stage 1 - Special handling with T-levels dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => handleStageClick(1)}
                style={{
                  width: '100%',
                  background: currentStage === 1 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'rgba(102, 126, 234, 0.1)',
                  color: currentStage === 1 ? 'white' : '#667eea',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '16px',
                  padding: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textAlign: 'left',
                  position: 'relative'
                }}
                {...createHoverHandler('translateY(-2px)', '0 8px 25px rgba(102, 126, 234, 0.3)')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                      🧘‍♂️ Stage 1: Seeker
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.8 }}>
                      Physical Stillness (T1-T5)
                    </div>
                  </div>
                  <div style={{ fontSize: '18px' }}>
                    {showT1T5Dropdown ? '🔽' : '▶️'}
                  </div>
                </div>
              </button>

              {/* T-Levels Dropdown */}
              {showT1T5Dropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                  zIndex: 10,
                  marginTop: '8px',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  animation: 'slideDown 0.3s ease'
                }}>
                  {tLevels.map((tLevel, index) => (
                    <button
                      key={tLevel.level}
                      onClick={() => handleTLevelClick(tLevel.level, tLevel.duration)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        padding: '12px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#333',
                        borderBottom: index < tLevels.length - 1 ? '1px solid #f0f0f0' : 'none',
                        borderRadius: index === 0 ? '12px 12px 0 0' : index === tLevels.length - 1 ? '0 0 12px 12px' : '0',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {tLevel.level}: {tLevel.duration} minutes
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Physical Stillness Practice
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ✅ ENHANCED: Stages 2-6 with new progression logic */}
            {stageData.map((stage) => {
              const stageInfo = getStageDisplayInfo(stage.num);
              
              return (
                <button
                  key={stage.num}
                  onClick={() => handleStageClick(stage.num)}
                  disabled={!stageInfo.isUnlocked}
                  style={{
                    background: stageInfo.isCurrentOrCompleted
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : stageInfo.isUnlocked
                      ? 'rgba(102, 126, 234, 0.1)'
                      : 'rgba(200, 200, 200, 0.1)',
                    color: stageInfo.isCurrentOrCompleted ? 'white' : stageInfo.isUnlocked ? '#667eea' : '#999',
                    border: `2px solid ${stageInfo.isCurrentOrCompleted ? 'transparent' : stageInfo.isUnlocked ? 'rgba(102, 126, 234, 0.2)' : 'rgba(200, 200, 200, 0.2)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: stageInfo.isUnlocked ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    opacity: stageInfo.isUnlocked ? 1 : 0.6,
                    position: 'relative'
                  }}
                  {...(stageInfo.isUnlocked ? createHoverHandler('translateY(-2px)', '0 8px 25px rgba(102, 126, 234, 0.3)') : {})}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '20px', marginBottom: '4px' }}>
                        {stage.num === 2 ? '👁️' : stage.num === 3 ? '🎯' : stage.num === 4 ? '⚡' : stage.num === 5 ? '✨' : '🌟'} Stage {stage.num}: {stage.title}
                      </div>
                      <div style={{ fontSize: '14px', opacity: 0.8 }}>
                        {stage.desc}
                      </div>
                      {/* ✅ FIXED: Show completion requirement for locked stages */}
                      {!stageInfo.isUnlocked && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#f59e0b', 
                          marginTop: '4px',
                          fontWeight: '600'
                        }}>
                          {stageInfo.lockMessage}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '18px' }}>
                      {stageInfo.icon}
                    </div>
                  </div>
                  
                  {/* ✅ FIXED: Show lock overlay for inaccessible stages */}
                  {!stageInfo.isUnlocked && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.1)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(2px)'
                    }}>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        🔒 Locked
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '20px'
          }}>
            <button
              onClick={handleNavigateToMindRecovery}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '2px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
              }}
            >
              🌱 Mind Recovery
            </button>
            <button
              onClick={onShowWhatIsPAHM}
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                border: '2px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
              }}
            >
              🔍 What is PAHM?
            </button>
          </div>
        </section>

        {/* Resources Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Learning Resources
          </h2>
          <div style={styles.gridLayout}>
            {resourceData.map((resource, index) => (
              <button
                key={index}
                onClick={resource.onClick}
                style={{
                  background: 'rgba(102, 126, 234, 0.05)',
                  border: '1px solid rgba(102, 126, 234, 0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}
                {...createHoverHandler('translateY(-4px)', '0 8px 25px rgba(102, 126, 234, 0.15)')}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '12px'
                }}>
                  {resource.icon}
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  {resource.title}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  lineHeight: '1.4'
                }}>
                  {resource.desc}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Access Modal for locked stages */}
        {showAccessModal.show && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '400px',
              margin: '20px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#333',
                marginBottom: '12px'
              }}>
                Stage {showAccessModal.stage} Locked
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#666',
                marginBottom: '24px',
                lineHeight: '1.5'
              }}>
                {showAccessModal.stage === 2 
                  ? 'Complete Stage 1 (T5: 30-minute practice) to unlock Stage 2'
                  : `Complete Stage ${showAccessModal.stage - 1} to unlock Stage ${showAccessModal.stage}`
                }
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => setShowAccessModal({ show: false, stage: 0 })}
                  style={{
                    background: 'rgba(102, 126, 234, 0.1)',
                    color: '#667eea',
                    border: '2px solid rgba(102, 126, 234, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
                  }}
                >
                  Understood
                </button>
                
                {showAccessModal.stage === 2 && (
                  <button
                    onClick={() => {
                      setShowAccessModal({ show: false, stage: 0 });
                      handleStageClick(1);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0px)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    Practice Stage 1
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomeDashboard;