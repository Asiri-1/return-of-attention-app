// ===============================================
// 🔧 COMPLETE FIXED HomeDashboard.tsx - SINGLE-CLICK STAGE 1 
// ===============================================
// FILE: src/HomeDashboard.tsx
// 🎯 FIXED: Stage 1 single-click navigation - NO MORE PROGRESSIVE ONBOARDING INTERFERENCE
// ✅ PRESERVED: ALL user interface and functionality intact

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ SINGLE-POINT: For ALL session tracking
import { useUser } from './contexts/user/UserContext'; // ✅ ONLY for profile management
import { useOnboarding } from './contexts/onboarding/OnboardingContext';

// ✅ PRESERVED: Safe wrapper hook to avoid conditional calls
const useSafeHappinessCalculation = () => {
  try {
    // Try to import the hook dynamically
    const happinessModule = require('./hooks/useHappinessCalculation');
    if (happinessModule && happinessModule.useHappinessCalculation) {
      return happinessModule.useHappinessCalculation();
    }
  } catch (error) {
    console.warn('⚠️ Happiness calculation hook not available:', error);
  }
  
  // Return safe defaults if hook is not available
  return {
    userProgress: { happiness_points: 0, user_level: 'Beginning Seeker' },
    isCalculating: false,
    forceRecalculation: () => {}
  };
};

// ✅ PRESERVED: Same interface (no changes)
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
  onShowHowToMeditate?: () => void;
  onStartMindRecovery?: () => void;
  onShowMindRecoveryGuide?: () => void;
  onShowHappinessTracker?: () => void;
  onShowAnalytics?: () => void;
  currentStage?: number;
  t5Completed?: boolean;
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
  onShowWhatIsPAHM,
  onShowHowToMeditate,
  onStartMindRecovery,
  onShowMindRecoveryGuide,
  onShowHappinessTracker,
  onShowAnalytics,
  currentStage: propCurrentStage,
  t5Completed: propT5Completed
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ SINGLE-POINT: Use ONLY PracticeContext for ALL stage progression data
  const { 
    sessions,
    isLoading: practiceLoading,
    getCurrentStage,
    getStageProgress,
    canAdvanceToStage,
    getTotalPracticeHours,
    calculateStats
  } = usePractice();

  // ✅ SINGLE-POINT: Use UserContext ONLY for profile management
  const { 
    userProfile,
    markStageComplete // Keep only profile-related methods
  } = useUser();
  
  // 🎯 FIXED: Only use onboarding for stages 2-6, not Stage 1 - completely comment out for now
  // useOnboarding();

  // ✅ PRESERVED: Always call the safe happiness hook
  const happinessHookData = useSafeHappinessCalculation();
  const userProgress = happinessHookData.userProgress || { happiness_points: 0, user_level: 'Beginning Seeker' };
  const isCalculating = happinessHookData.isCalculating || false;
  const forceRecalculation = happinessHookData.forceRecalculation || (() => {});

  // ✅ PRESERVED: Component state (no changes)
  const [currentDisplayStage, setCurrentDisplayStage] = useState<number>(propCurrentStage || 1);
  const [streak, setStreak] = useState<number>(0);
  const [showT1T5Dropdown, setShowT1T5Dropdown] = useState<boolean>(false);
  const [showAccessModal, setShowAccessModal] = useState<{ show: boolean; stage: number }>({
    show: false,
    stage: 0
  });
  const [forceRefreshKey, setForceRefreshKey] = useState<number>(0);

  // ✅ SINGLE-POINT: Get current stage from PracticeContext (hours-based)
  const actualCurrentStage = useMemo(() => {
    try {
      const stage = getCurrentStage();
      console.log(`🎯 Current stage from PracticeContext: ${stage}`);
      return stage;
    } catch (error) {
      console.error('Error getting current stage:', error);
      return 1;
    }
  }, [getCurrentStage]);

  // ✅ SINGLE-POINT: Get total practice hours from PracticeContext
  const actualTotalHours = useMemo(() => {
    try {
      const hours = getTotalPracticeHours();
      console.log(`⏱️ Total practice hours: ${hours.toFixed(1)}`);
      return hours;
    } catch (error) {
      console.error('Error getting total hours:', error);
      return 0;
    }
  }, [getTotalPracticeHours]);

  // ✅ SINGLE-POINT: Helper functions to get T-level session counts from PracticeContext
  const getT1Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't1' || s.level === 't1') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT2Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't2' || s.level === 't2') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT3Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't3' || s.level === 't3') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT4Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't4' || s.level === 't4') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT5Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't5' || s.level === 't5') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  // ✅ SINGLE-POINT: Helper functions to check T-level completion from PracticeContext
  const isT1Complete = useCallback((): boolean => getT1Sessions() >= 3, [getT1Sessions]);
  const isT2Complete = useCallback((): boolean => getT2Sessions() >= 3, [getT2Sessions]);
  const isT3Complete = useCallback((): boolean => getT3Sessions() >= 3, [getT3Sessions]);
  const isT4Complete = useCallback((): boolean => getT4Sessions() >= 3, [getT4Sessions]);
  const isT5Complete = useCallback((): boolean => getT5Sessions() >= 3, [getT5Sessions]);

  // ✅ SINGLE-POINT: Check stage unlock using PracticeContext methods
  const checkStageUnlocked = useCallback((targetStage: number): boolean => {
    try {
      console.log(`🔓 Checking if Stage ${targetStage} is unlocked...`);
      
      if (targetStage === 1) {
        console.log('✅ Stage 1 is always unlocked');
        return true;
      }
      
      // Use PracticeContext's canAdvanceToStage method
      const canAdvance = canAdvanceToStage(targetStage);
      console.log(`🎯 Can advance to Stage ${targetStage}: ${canAdvance}`);
      
      return canAdvance;
    } catch (error) {
      console.error(`Error checking stage ${targetStage} unlock:`, error);
      return targetStage === 1;
    }
  }, [canAdvanceToStage]);

  // ✅ SINGLE-POINT: Correct Stage 1 progress calculation showing all T-levels
  const getStageDisplayProgress = useCallback((stageNumber: number) => {
    try {
      if (stageNumber === 1) {
        // ✅ SINGLE-POINT: Count ALL T-level sessions from PracticeContext
        const t1Sessions = getT1Sessions();
        const t2Sessions = getT2Sessions(); 
        const t3Sessions = getT3Sessions();
        const t4Sessions = getT4Sessions();
        const t5Sessions = getT5Sessions();
        
        // Calculate total T-level sessions completed
        const totalTSessions = t1Sessions + t2Sessions + t3Sessions + t4Sessions + t5Sessions;
        
        // Check completion status
        const t1Complete = isT1Complete();
        const t2Complete = isT2Complete();
        const t3Complete = isT3Complete();
        const t4Complete = isT4Complete();
        const t5Complete = isT5Complete();
        
        // Stage 1 is complete when all T-levels are done
        const stage1Complete = t1Complete && t2Complete && t3Complete && t4Complete && t5Complete;
        
        console.log(`🎯 Stage 1 Progress:`, {
          t1: `${t1Sessions}/3 ${t1Complete ? '✅' : ''}`,
          t2: `${t2Sessions}/3 ${t2Complete ? '✅' : ''}`, 
          t3: `${t3Sessions}/3 ${t3Complete ? '✅' : ''}`,
          t4: `${t4Sessions}/3 ${t4Complete ? '✅' : ''}`,
          t5: `${t5Sessions}/3 ${t5Complete ? '✅' : ''}`,
          total: `${totalTSessions}/15 sessions`,
          complete: stage1Complete
        });
        
        return {
          current: totalTSessions,
          required: 15, // 3 sessions × 5 T-levels = 15 total sessions
          isComplete: stage1Complete,
          displayText: `T-Levels: ${totalTSessions}/15 sessions` // ✅ Shows real progress
        };
      }
      
      // Stages 2-6 use hours
      const progress = getStageProgress(stageNumber);
      const isComplete = progress.percentage >= 100;
      
      return {
        current: progress.completed,
        required: progress.total,
        isComplete: isComplete,
        displayText: `Hours: ${progress.completed}/${progress.total}`
      };
    } catch (error) {
      console.error(`Error getting stage ${stageNumber} progress:`, error);
      return {
        current: 0,
        required: stageNumber === 1 ? 15 : 1,
        isComplete: false,
        displayText: stageNumber === 1 ? 'T-Levels: 0/15 sessions' : 'Progress unavailable'
      };
    }
  }, [getStageProgress, getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions, 
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete]);

  // 🎯 FIXED: Stage 1 bypass in getStageDisplayInfo - NO MORE PROGRESSIVE ONBOARDING INTERFERENCE
  const getStageDisplayInfo = useCallback((stageNumber: number) => {
    // ✅ STAGE 1 BYPASS: Handle completely independently using ONLY PracticeContext
    if (stageNumber === 1) {
      const t1Sessions = getT1Sessions();
      const t2Sessions = getT2Sessions();
      const t3Sessions = getT3Sessions();
      const t4Sessions = getT4Sessions();
      const t5Sessions = getT5Sessions();
      const totalTSessions = t1Sessions + t2Sessions + t3Sessions + t4Sessions + t5Sessions;
      
      return {
        isUnlocked: true, // Stage 1 is always unlocked
        isCurrentOrCompleted: true, // Stage 1 is always accessible
        lockMessage: '',
        progress: {
          current: totalTSessions,
          required: 15,
          isComplete: totalTSessions >= 15,
          displayText: `T-Levels: ${totalTSessions}/15 sessions`
        },
        icon: totalTSessions >= 15 ? '✅' : '▶️'
      };
    }
    
    // ✅ STAGES 2-6: Use PracticeContext methods instead of progressive onboarding
    const isUnlocked = checkStageUnlocked(stageNumber);
    const isCurrentOrCompleted = actualCurrentStage >= stageNumber;
    const progress = getStageDisplayProgress(stageNumber);
    
    let lockMessage = '';
    if (!isUnlocked) {
      switch (stageNumber) {
        case 2:
          const stage1Progress = getStageDisplayProgress(1);
          lockMessage = `🔒 Complete Stage 1 (${stage1Progress.current}/${stage1Progress.required} sessions) to unlock`;
          break;
        case 3:
          const stage2Progress = getStageProgress(2);
          lockMessage = `🔒 Complete Stage 2 (${stage2Progress.completed}/${stage2Progress.total} hours) to unlock`;
          break;
        case 4:
          const stage3Progress = getStageProgress(3);
          lockMessage = `🔒 Complete Stage 3 (${stage3Progress.completed}/${stage3Progress.total} hours) to unlock`;
          break;
        case 5:
          const stage4Progress = getStageProgress(4);
          lockMessage = `🔒 Complete Stage 4 (${stage4Progress.completed}/${stage4Progress.total} hours) to unlock`;
          break;
        case 6:
          const stage5Progress = getStageProgress(5);
          lockMessage = `🔒 Complete Stage 5 (${stage5Progress.completed}/${stage5Progress.total} hours) to unlock`;
          break;
        default:
          lockMessage = '🔒 Locked';
      }
    }
    
    return {
      isUnlocked,
      isCurrentOrCompleted,
      lockMessage,
      progress,
      icon: isCurrentOrCompleted ? '✅' : isUnlocked ? '▶️' : '🔒'
    };
  }, [actualCurrentStage, getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
      checkStageUnlocked, getStageDisplayProgress, getStageProgress]); // ✅ Updated dependencies

  // ✅ PRESERVED: Calculate user statistics (same logic, now using PracticeContext sessions)
  const calculateUserStats = useCallback(() => {
    if (!currentUser || practiceLoading) {
      setStreak(0);
      return;
    }

    try {
      // Calculate streak from sessions
      let currentStreak = 0;
      if (sessions && sessions.length > 0) {
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
      }

      setStreak(currentStreak);
      console.log(`📊 Stats updated - Streak: ${currentStreak}`);

    } catch (error) {
      console.error('Error calculating user stats:', error);
      setStreak(0);
    }
  }, [currentUser, practiceLoading, sessions]);

  // ✅ SINGLE-POINT: Progress summary for debugging using PracticeContext only
  const getProgressSummary = useCallback(() => {
    try {
      const currentStage = actualCurrentStage;
      const totalHours = actualTotalHours;
      
      // T-Level progress from PracticeContext sessions
      const tProgress = {
        t1: { sessions: getT1Sessions(), complete: isT1Complete() },
        t2: { sessions: getT2Sessions(), complete: isT2Complete() },
        t3: { sessions: getT3Sessions(), complete: isT3Complete() },
        t4: { sessions: getT4Sessions(), complete: isT4Complete() },
        t5: { sessions: getT5Sessions(), complete: isT5Complete() }
      };
      
      // Stage progress from PracticeContext
      const stageProgress = {
        stage2: getStageProgress(2),
        stage3: getStageProgress(3),
        stage4: getStageProgress(4),
        stage5: getStageProgress(5),
        stage6: getStageProgress(6)
      };
      
      console.log('📊 Progress Summary:', {
        currentStage,
        totalHours: totalHours.toFixed(1),
        tProgress,
        stageProgress
      });
      
      return {
        currentStage,
        totalHours,
        tProgress,
        stageProgress,
        totalSessions: sessions?.length || 0
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      return {
        currentStage: 1,
        totalHours: 0,
        tProgress: {},
        stageProgress: {},
        totalSessions: 0
      };
    }
  }, [actualCurrentStage, actualTotalHours, getT1Sessions, getT2Sessions, getT3Sessions, 
      getT4Sessions, getT5Sessions, isT1Complete, isT2Complete, isT3Complete, 
      isT4Complete, isT5Complete, getStageProgress, sessions]);

  // ✅ PRESERVED: Force data refresh (same logic)
  const refreshDashboardData = useCallback(() => {
    console.log('🔄 Refreshing dashboard data...');
    
    // Update display stage
    const newStage = actualCurrentStage;
    if (newStage !== currentDisplayStage) {
      console.log(`📈 Stage updated: ${currentDisplayStage} → ${newStage}`);
      setCurrentDisplayStage(newStage);
    }
    
    // Recalculate stats
    calculateUserStats();
    
    // Force happiness calculation refresh
    if (forceRecalculation && typeof forceRecalculation === 'function') {
      try {
        forceRecalculation();
      } catch (error) {
        console.warn('⚠️ Error calling forceRecalculation:', error);
      }
    }
    
    // Log current progress
    getProgressSummary();
    
    // Force component re-render
    setForceRefreshKey(prev => prev + 1);
    
  }, [actualCurrentStage, currentDisplayStage, calculateUserStats, forceRecalculation, getProgressSummary]);

  // ✅ PRESERVED: Get happiness data safely (same logic)
  const happinessData = useMemo(() => ({
    happiness_points: userProgress.happiness_points || 0,
    current_level: userProgress.user_level || 'Beginning Seeker',
    isCalculating: isCalculating
  }), [userProgress.happiness_points, userProgress.user_level, isCalculating]);

  // ✅ PRESERVED: Performance optimized static data (same logic)
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

  const resourceData = useMemo(() => [
    {
      icon: '📖',
      title: `Stage ${currentDisplayStage} Guide`,
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
  ], [currentDisplayStage, onViewLearning, onShowPostureGuide, onShowPAHMExplanation]);

  // ✅ PRESERVED: All event handlers (same logic with profile-only UserContext usage)
  const handleHappinessPointsClick = useCallback(() => {
    if (onShowHappinessTracker) {
      onShowHappinessTracker();
    } else {
      navigate('/happiness-tracker');
    }
  }, [navigate, onShowHappinessTracker]);

  // 🎯 SIMPLIFIED: Stage navigation - Same behavior for all stages
  const handleStageClick = useCallback(async (stageNumber: number) => {
    console.log('🎯 handleStageClick CALLED with stage:', stageNumber);
    
    if (stageNumber === 1) {
      console.log('🎯 Stage 1 clicked - navigating to introduction');
      navigate('/stage1-introduction', { 
        state: { 
          hasSeenBefore: true,
          returnToHome: true
        } 
      });
      return;
    }

    // For other stages (2-6)
    const stageInfo = getStageDisplayInfo(stageNumber);
    
    if (!stageInfo.isUnlocked) {
      setShowAccessModal({ show: true, stage: stageNumber });
      return;
    }

    setCurrentDisplayStage(stageNumber);
    
    try {
      if (markStageComplete && typeof markStageComplete === 'function') {
        await markStageComplete(stageNumber);
        console.log('✅ Stage marked complete in Firebase:', stageNumber);
      }
    } catch (error) {
      console.error('❌ Firebase stage update failed:', error);
    }

    // Navigate to stage
    switch (stageNumber) {
      case 2:
        if (onStartStage2) onStartStage2();
        else navigate('/stage2');
        break;
      case 3:
        if (onStartStage3) onStartStage3();
        else navigate('/stage3');
        break;
      case 4:
        if (onStartStage4) onStartStage4();
        else navigate('/stage4');
        break;
      case 5:
        if (onStartStage5) onStartStage5();
        else navigate('/stage5');
        break;
      case 6:
        if (onStartStage6) onStartStage6();
        else navigate('/stage6');
        break;
      default:
        navigate(`/stage${stageNumber}`);
    }
  }, [navigate, getStageDisplayInfo, markStageComplete,
      onStartStage2, onStartStage3, onStartStage4, onStartStage5, onStartStage6]);

  const handleTLevelClick = useCallback(async (level: string, duration: number) => {
    let hasSeenTLevelIntro = false;

    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      hasSeenTLevelIntro = profile.hasSeenTLevelIntro || false;
    }
    
    navigate(`/stage1`, { 
      state: { 
        showT1Introduction: !hasSeenTLevelIntro,
        level: level,
        duration: duration,
        stageLevel: `${level}: Physical Stillness for ${duration} minutes`,
        returnToStage: 1,
        hasSeenBefore: hasSeenTLevelIntro
      } 
    });
  }, [navigate, userProfile]);

  // ✅ PRESERVED: All other handlers (same logic)
  const handleNavigateToNotes = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

  const handleNavigateToChat = useCallback(() => {
    navigate('/chatwithguru');
  }, [navigate]);

  const handleNavigateToMindRecovery = useCallback(() => {
    if (onStartMindRecovery) {
      onStartMindRecovery();
    } else {
      navigate('/mind-recovery');
    }
  }, [navigate, onStartMindRecovery]);

  const handleNavigateToAnalytics = useCallback(() => {
    if (onShowAnalytics) {
      onShowAnalytics();
    } else {
      navigate('/analytics');
    }
  }, [navigate, onShowAnalytics]);

  // ✅ PRESERVED: Hover handlers (same logic)
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

  // ✅ PRESERVED: All styles (same)
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

  // ✅ PRESERVED: Get happiness button style (same logic)
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

    const background = happiness_points === 0
      ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
      : happiness_points > 400 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
      : happiness_points > 200
      ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
      : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';

    return { ...baseStyle, background };
  }, []);

  // 🔧 FIXED: Stop infinite loops - simplified useEffect dependencies
  
  // ✅ SIMPLE: Only run once when component mounts
  useEffect(() => {
    calculateUserStats();
  }, []); // Empty dependency array = run once only

  // ✅ SIMPLE: Only when actual stage changes
  useEffect(() => {
    if (actualCurrentStage !== currentDisplayStage) {
      console.log(`🔄 Updating display stage: ${currentDisplayStage} → ${actualCurrentStage}`);
      setCurrentDisplayStage(actualCurrentStage);
    }
  }, [actualCurrentStage]); // Remove currentDisplayStage dependency to prevent loop

  // ✅ SIMPLE: Only when sessions actually change
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      calculateUserStats();
    }
  }, [sessions]); // Only sessions dependency - no calculateUserStats

  // ✅ SIMPLE: Only on location changes (no complex state checking)
  useEffect(() => {
    const locationState = location.state as any;
    if (locationState?.fromStage1 || locationState?.sessionCompleted) {
      setForceRefreshKey(prev => prev + 1);
    }
  }, [location.pathname]); // Only pathname dependency

  // ✅ PRESERVED: Display name calculation (same logic)
  const displayName = useMemo(() => {
    return currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : '';
  }, [currentUser?.displayName]);

  // ✅ PRESERVED: Loading state (same logic)
  if (isCalculating && !sessions) {
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
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255,255,255,0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <div>Loading your mindfulness journey...</div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ PRESERVED: Same UI JSX structure (Stage 1 now navigates immediately, no dropdown toggle)
  return (
    <div style={styles.container} key={forceRefreshKey}>
      <header style={styles.header}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          minWidth: 0,
          flex: '1 1 auto'
        }}>
          <h1 style={styles.welcomeTitle}>
            Welcome back{displayName}! Your happiness points: {happinessData.happiness_points}
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
            ⏱️ {actualTotalHours.toFixed(1)}h total
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
            🏆 Stage {actualCurrentStage}
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
            📊 {happinessData.current_level}
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* ✅ PRESERVED: Same Welcome Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Your Mindfulness Journey
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px', textAlign: 'center' }}>
            {happinessData.happiness_points === 0 && !happinessData.isCalculating ? (
              <>
                Welcome! You're on Stage {actualCurrentStage}. Complete your <strong>questionnaire, self-assessment, or practice sessions</strong> to enable happiness tracking.
              </>
            ) : (
              <>
                Welcome back! You're on <strong>Stage {actualCurrentStage}</strong> with <strong>{happinessData.happiness_points}</strong> happiness points.
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
            <button
              onClick={handleNavigateToAnalytics}
              style={styles.secondaryButton}
              {...buttonHoverProps}
            >
              📈 Analytics
            </button>
          </div>
        </section>

        {/* ✅ FIXED: Stages Section - Stage 1 now navigates immediately */}
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
            Choose your practice stage and begin your mindfulness journey. You're currently on Stage {actualCurrentStage}.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* 🎯 FIXED: Stage 1 - Uses SAME styling logic as Stages 2-6 */}
            {(() => {
              const stageInfo = getStageDisplayInfo(1);
              return (
                <button
                  onClick={() => handleStageClick(1)}
                  style={{
                    background: stageInfo.isCurrentOrCompleted
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                      : 'rgba(102, 126, 234, 0.1)',
                    color: stageInfo.isCurrentOrCompleted ? 'white' : '#667eea',
                    border: `2px solid ${stageInfo.isCurrentOrCompleted ? 'transparent' : 'rgba(102, 126, 234, 0.2)'}`,
                    borderRadius: '16px',
                    padding: '20px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    opacity: 1,
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
                      <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                        {stageInfo.progress.displayText} {stageInfo.progress.isComplete && '✅'}
                      </div>
                    </div>
                    <div style={{ fontSize: '18px' }}>
                      {stageInfo.icon}
                    </div>
                  </div>
                </button>
              );
            })()}

            {/* ✅ PRESERVED: Stages 2-6 with real-time progress from PracticeContext (same JSX) */}
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
                      {stageInfo.isUnlocked && (
                        <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                          {stageInfo.progress.displayText} {stageInfo.progress.isComplete && '✅'}
                        </div>
                      )}
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

          {/* ✅ PRESERVED: Same Quick Actions */}
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

        {/* ✅ PRESERVED: Same Resources Section */}
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

        {/* ✅ PRESERVED: Same Access Modal with PracticeContext data */}
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
                  ? `Complete Stage 1 T-Levels (${getT1Sessions() + getT2Sessions() + getT3Sessions() + getT4Sessions() + getT5Sessions()}/15 sessions) to unlock Stage 2`
                  : `Complete the previous stage to unlock Stage ${showAccessModal.stage}`
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

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default HomeDashboard;