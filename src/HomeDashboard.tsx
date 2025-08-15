// 🔧 COMPLETE FIXED HomeDashboard.tsx - CORRECTED Stage Requirements Per Audit
// File: src/HomeDashboard.tsx
// ✅ FIXED: Uses correct stage hour requirements: 5, 10, 15, 20, 25, 30

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';

// ✅ Make happiness calculation optional to prevent chunk loading errors
let useHappinessCalculation: any = null;
try {
  const happinessModule = require('./hooks/useHappinessCalculation');
  useHappinessCalculation = happinessModule.useHappinessCalculation;
} catch (error) {
  console.warn('⚠️ Happiness calculation hook not available:', error);
}

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
  currentStage: propCurrentStage,
  t5Completed: propT5Completed
}) => {
  const { currentUser } = useAuth();
  const { sessions } = usePractice();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔧 FIXED: Use the SAME UserContext methods that Stage1Wrapper uses
  const { 
    userProfile,
    // ✅ T-Level completion methods (same as Stage1Wrapper)
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    // ✅ T-Level session count methods
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    // ✅ Stage completion methods
    isStage2CompleteByHours, isStage3CompleteByHours, isStage4CompleteByHours, 
    isStage5CompleteByHours, isStage6CompleteByHours,
    // ✅ Stage hours methods
    getStage2Hours, getStage3Hours, getStage4Hours, getStage5Hours, getStage6Hours,
    // ✅ Other methods
    markStageComplete
  } = useUser();
  
  const { 
    isQuestionnaireCompleted, 
    isSelfAssessmentCompleted
  } = useOnboarding();

  // ✅ Safe happiness calculation hook usage
  let userProgress: any = { happiness_points: 0, user_level: 'Beginning Seeker' };
  let isCalculating = false;
  let forceRecalculation: (() => void) | null = null;

  if (useHappinessCalculation) {
    try {
      const happinessData = useHappinessCalculation();
      userProgress = happinessData.userProgress || userProgress;
      isCalculating = happinessData.isCalculating || false;
      forceRecalculation = happinessData.forceRecalculation || null;
    } catch (error) {
      console.warn('⚠️ Error using happiness calculation:', error);
    }
  }

  // ✅ Component state
  const [currentStage, setCurrentStage] = useState<number>(propCurrentStage || 1);
  const [streak, setStreak] = useState<number>(0);
  const [totalHours, setTotalHours] = useState<number>(0);
  const [showT1T5Dropdown, setShowT1T5Dropdown] = useState<boolean>(false);
  const [showAccessModal, setShowAccessModal] = useState<{ show: boolean; stage: number }>({
    show: false,
    stage: 0
  });
  const [forceDataRefresh, setForceDataRefresh] = useState<number>(0);

  // ✅ Get happiness data safely
  const happinessData = useMemo(() => ({
    happiness_points: userProgress.happiness_points || 0,
    current_level: userProgress.user_level || 'Beginning Seeker',
    isCalculating: isCalculating
  }), [userProgress.happiness_points, userProgress.user_level, isCalculating]);

  // ✅ Force data refresh
  const forceDataRefreshHandler = useCallback(() => {
    console.log('🔄 Forcing data refresh in HomeDashboard...');
    if (forceRecalculation && typeof forceRecalculation === 'function') {
      try {
        forceRecalculation();
      } catch (error) {
        console.warn('⚠️ Error calling forceRecalculation:', error);
      }
    }
    setForceDataRefresh(prev => prev + 1);
  }, [forceRecalculation]);

  // 🔧 FIXED: Stage unlock checker using CORRECTED hour requirements
  const checkStageUnlocked = useCallback((targetStage: number): boolean => {
    try {
      console.log('🔧 FIXED: Using UserContext methods for stage unlock check');
      
      // ✅ Use the EXACT same logic as Stage1Wrapper
      switch (targetStage) {
        case 1:
          return true; // Stage 1 is always unlocked
          
        case 2:
          // ✅ CRITICAL: Use same method as Stage1Wrapper
          const t5Complete = isT5Complete(); // Same method!
          const t5Sessions = getT5Sessions(); // Same method!
          console.log(`🔧 T5 Complete check: ${t5Complete} (Sessions: ${t5Sessions}/3)`);
          return t5Complete;
          
        case 3:
          // ✅ CORRECTED: Stage 2 = 10 hours (not 15)
          const stage2Complete = isStage2CompleteByHours();
          const stage2Hours = getStage2Hours();
          console.log(`🔧 Stage 2 Complete check: ${stage2Complete} (Hours: ${stage2Hours}/10)`);
          return stage2Complete;
          
        case 4:
          // ✅ CORRECT: Stage 3 = 15 hours
          const stage3Complete = isStage3CompleteByHours();
          const stage3Hours = getStage3Hours();
          console.log(`🔧 Stage 3 Complete check: ${stage3Complete} (Hours: ${stage3Hours}/15)`);
          return stage3Complete;
          
        case 5:
          // ✅ CORRECTED: Stage 4 = 20 hours (not 15)
          const stage4Complete = isStage4CompleteByHours();
          const stage4Hours = getStage4Hours();
          console.log(`🔧 Stage 4 Complete check: ${stage4Complete} (Hours: ${stage4Hours}/20)`);
          return stage4Complete;
          
        case 6:
          // ✅ CORRECTED: Stage 5 = 25 hours (not 15)
          const stage5Complete = isStage5CompleteByHours();
          const stage5Hours = getStage5Hours();
          console.log(`🔧 Stage 5 Complete check: ${stage5Complete} (Hours: ${stage5Hours}/25)`);
          return stage5Complete;
          
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking stage unlock:', error);
      return targetStage === 1; // Default to only Stage 1 unlocked
    }
  }, [isT5Complete, getT5Sessions, isStage2CompleteByHours, isStage3CompleteByHours, 
      isStage4CompleteByHours, isStage5CompleteByHours,
      getStage2Hours, getStage3Hours, getStage4Hours, getStage5Hours]);

  // 🔧 FIXED: Current stage calculation using UserContext methods
  const calculateCurrentStage = useCallback((): number => {
    try {
      // ✅ Progressive stage calculation using UserContext methods
      if (!isT5Complete()) {
        console.log('🔧 Current stage: 1 (T5 not complete)');
        return 1;
      }
      
      if (!isStage2CompleteByHours()) {
        console.log('🔧 Current stage: 2 (T5 complete, Stage 2 not complete)');
        return 2;
      }
      
      if (!isStage3CompleteByHours()) {
        console.log('🔧 Current stage: 3 (Stage 2 complete, Stage 3 not complete)');
        return 3;
      }
      
      if (!isStage4CompleteByHours()) {
        console.log('🔧 Current stage: 4 (Stage 3 complete, Stage 4 not complete)');
        return 4;
      }
      
      if (!isStage5CompleteByHours()) {
        console.log('🔧 Current stage: 5 (Stage 4 complete, Stage 5 not complete)');
        return 5;
      }
      
      if (!isStage6CompleteByHours()) {
        console.log('🔧 Current stage: 6 (Stage 5 complete, Stage 6 not complete)');
        return 6;
      }
      
      console.log('🔧 Current stage: 6 (All stages complete)');
      return 6;
      
    } catch (error) {
      console.error('Error calculating current stage:', error);
      return 1;
    }
  }, [isT5Complete, isStage2CompleteByHours, isStage3CompleteByHours, 
      isStage4CompleteByHours, isStage5CompleteByHours]);

  // ✅ Update current stage when UserContext data changes
  useEffect(() => {
    const newStage = calculateCurrentStage();
    if (newStage !== currentStage) {
      console.log(`🔧 Stage updated: ${currentStage} → ${newStage}`);
      setCurrentStage(newStage);
    }
  }, [calculateCurrentStage, currentStage]);

  // ✅ Also update from props if provided
  useEffect(() => {
    if (propCurrentStage && propCurrentStage !== currentStage) {
      console.log(`🔧 Stage updated from props: ${currentStage} → ${propCurrentStage}`);
      setCurrentStage(propCurrentStage);
    }
  }, [propCurrentStage, currentStage]);

  // 🔧 FIXED: Stage display info using CORRECTED hour requirements
  const getStageDisplayInfo = useCallback((stageNumber: number) => {
    const isUnlocked = checkStageUnlocked(stageNumber);
    const calculatedCurrentStage = calculateCurrentStage();
    const isCurrentOrCompleted = isUnlocked && calculatedCurrentStage >= stageNumber;
    
    let lockMessage = '';
    if (!isUnlocked) {
      switch (stageNumber) {
        case 2:
          const t5Sessions = getT5Sessions();
          lockMessage = `🔒 Complete Stage 1 T5 (${t5Sessions}/3 sessions) to unlock`;
          break;
        case 3:
          const stage2Hours = getStage2Hours();
          // ✅ CORRECTED: Stage 2 = 10 hours (not 15)
          lockMessage = `🔒 Complete Stage 2 (${stage2Hours.toFixed(1)}/10 hours) to unlock`;
          break;
        case 4:
          const stage3Hours = getStage3Hours();
          // ✅ CORRECT: Stage 3 = 15 hours
          lockMessage = `🔒 Complete Stage 3 (${stage3Hours.toFixed(1)}/15 hours) to unlock`;
          break;
        case 5:
          const stage4Hours = getStage4Hours();
          // ✅ CORRECTED: Stage 4 = 20 hours (not 15)
          lockMessage = `🔒 Complete Stage 4 (${stage4Hours.toFixed(1)}/20 hours) to unlock`;
          break;
        case 6:
          const stage5Hours = getStage5Hours();
          // ✅ CORRECTED: Stage 5 = 25 hours (not 15)
          lockMessage = `🔒 Complete Stage 5 (${stage5Hours.toFixed(1)}/25 hours) to unlock`;
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
  }, [checkStageUnlocked, calculateCurrentStage, getT5Sessions, getStage2Hours, 
      getStage3Hours, getStage4Hours, getStage5Hours]);

  // 🔧 FIXED: Progress display using UserContext methods
  const getProgressSummary = useCallback(() => {
    try {
      // ✅ T-Level progress using UserContext methods
      const tProgress = {
        t1: { sessions: getT1Sessions(), complete: isT1Complete() },
        t2: { sessions: getT2Sessions(), complete: isT2Complete() },
        t3: { sessions: getT3Sessions(), complete: isT3Complete() },
        t4: { sessions: getT4Sessions(), complete: isT4Complete() },
        t5: { sessions: getT5Sessions(), complete: isT5Complete() }
      };
      
      const totalTSessions = Object.values(tProgress).reduce((sum, t) => sum + t.sessions, 0);
      const completedTStages = Object.values(tProgress).filter(t => t.complete).length;
      
      // ✅ Stage hours using UserContext methods
      const stageHours = {
        stage2: getStage2Hours(),
        stage3: getStage3Hours(),
        stage4: getStage4Hours(),
        stage5: getStage5Hours(),
        stage6: getStage6Hours()
      };
      
      const totalStageHours = Object.values(stageHours).reduce((sum, hours) => sum + hours, 0);
      
      console.log('🔧 T-Level Progress Summary:', tProgress);
      console.log(`🔧 Total T-Sessions: ${totalTSessions}, Completed T-Stages: ${completedTStages}/5`);
      console.log('🔧 Stage Hours Summary:', stageHours);
      console.log(`🔧 Total Stage Hours: ${totalStageHours.toFixed(1)}`);
      
      return {
        tProgress,
        totalTSessions,
        completedTStages,
        stageHours,
        totalStageHours,
        stage1Complete: isT5Complete(),
        currentStage: calculateCurrentStage()
      };
    } catch (error) {
      console.error('Error getting progress summary:', error);
      return {
        tProgress: {},
        totalTSessions: 0,
        completedTStages: 0,
        stageHours: {},
        totalStageHours: 0,
        stage1Complete: false,
        currentStage: 1
      };
    }
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
      getStage2Hours, getStage3Hours, getStage4Hours, getStage5Hours, getStage6Hours,
      calculateCurrentStage]);

  // ✅ User stats calculation
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
      if (process.env.NODE_ENV === 'development') {
        console.error('Error calculating user stats:', error);
      }
      setStreak(0);
      setTotalHours(0);
    }
  }, [currentUser, sessions]);

  // ✅ Data refresh using UserContext
  const refreshDashboardData = useCallback(() => {
    console.log('🔄 Refreshing dashboard data using UserContext methods...');
    
    const newStage = calculateCurrentStage();
    if (newStage !== currentStage) {
      console.log(`📈 Stage updated: ${currentStage} → ${newStage}`);
      setCurrentStage(newStage);
    }
    
    // Recalculate user stats
    calculateUserStats();
    
    // Force happiness calculation refresh if available
    if (forceRecalculation && typeof forceRecalculation === 'function') {
      try {
        forceRecalculation();
      } catch (error) {
        console.warn('⚠️ Error calling forceRecalculation:', error);
      }
    }
    
    // Log current progress for debugging
    const progressSummary = getProgressSummary();
    console.log('🔧 Current Progress Summary:', progressSummary);
    
    // Force component re-render
    setForceDataRefresh(prev => prev + 1);
    
  }, [currentStage, calculateCurrentStage, calculateUserStats, forceRecalculation, getProgressSummary]);

  // ✅ Performance optimized static data
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

  // ✅ Styles
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

  // ✅ Happiness button style
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

  // ✅ Event handlers
  const handleHappinessPointsClick = useCallback(() => {
    navigate('/happiness-tracker');
  }, [navigate]);

  // 🔧 FIXED: Stage click handler using UserContext
  const handleStageClick = useCallback(async (stageNumber: number) => {
    if (stageNumber === 1) {
      // Check if user has seen Stage 1 introduction
      const completedIntros = userProfile?.stageProgress?.completedStageIntros || [];
      const hasSeenIntroduction = completedIntros.includes('1') || completedIntros.includes('stage1-intro');
      
      if (!hasSeenIntroduction) {
        navigate('/stage1-introduction', { 
          state: { 
            hasSeenBefore: false,
            returnToHome: true
          } 
        });
        return;
      } else {
        setShowT1T5Dropdown(prev => !prev);
        return;
      }
    }

    const stageInfo = getStageDisplayInfo(stageNumber);
    
    if (!stageInfo.isUnlocked) {
      setShowAccessModal({ show: true, stage: stageNumber });
      return;
    }

    // Update current stage
    setCurrentStage(stageNumber);
    
    try {
      // Update via UserContext methods
      if (markStageComplete && typeof markStageComplete === 'function') {
        await markStageComplete(stageNumber);
        console.log('🔧 Stage marked complete in Firebase:', stageNumber);
      }
    } catch (error) {
      console.error('Firebase stage update failed:', error);
    }

    navigate(`/stage${stageNumber}`);
  }, [navigate, getStageDisplayInfo, userProfile, markStageComplete]);

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

  const handleNavigateToNotes = useCallback(() => {
    navigate('/notes');
  }, [navigate]);

  const handleNavigateToChat = useCallback(() => {
    navigate('/chatwithguru');
  }, [navigate]);

  const handleNavigateToMindRecovery = useCallback(() => {
    navigate('/mind-recovery');
  }, [navigate]);

  // ✅ Hover handlers
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

  // ✅ Effects
  useEffect(() => {
    calculateUserStats();
  }, [calculateUserStats]);

  useEffect(() => {
    const handleFocus = () => {
      console.log('🔄 Window focused - checking for data refresh...');
      setTimeout(() => {
        forceDataRefreshHandler();
      }, 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page visible - checking for data refresh...');
        setTimeout(() => {
          forceDataRefreshHandler();
        }, 100);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceDataRefreshHandler]);

  // ✅ Listen for UserContext data changes
  useEffect(() => {
    // Update current stage when UserContext data changes
    const newStage = calculateCurrentStage();
    if (newStage !== currentStage) {
      console.log(`🔧 Stage updated from UserContext: ${currentStage} → ${newStage}`);
      setCurrentStage(newStage);
    }
  }, [calculateCurrentStage, currentStage]);

  // ✅ CRITICAL: Detect fromStage1 navigation state to refresh
  useEffect(() => {
    console.log('🔄 Location changed, checking for stage updates...', location.pathname, location.state);
    
    const locationState = location.state as any;
    if (locationState) {
      if (locationState.stage2Completed || 
          locationState.stage3Completed || 
          locationState.unlockedStage || 
          locationState.fromStage1) { // ✅ CRITICAL: Detect fromStage1 flag
        console.log('🎯 Stage completion detected via navigation state');
        refreshDashboardData();
      }
    }
    
    // ✅ ALWAYS refresh when returning to home
    if (location.pathname === '/home') {
      setTimeout(() => {
        refreshDashboardData();
      }, 100);
    }
  }, [location.pathname, location.state, refreshDashboardData]);

  // ✅ AGGRESSIVE: Force refresh when session counts change
  useEffect(() => {
    console.log('🔄 Session counts changed, forcing refresh...');
    console.log(`T1: ${getT1Sessions()}, T2: ${getT2Sessions()}, T3: ${getT3Sessions()}, T4: ${getT4Sessions()}, T5: ${getT5Sessions()}`);
    
    // Force component re-render
    setForceDataRefresh(prev => prev + 1);
    
    // Recalculate current stage
    const newStage = calculateCurrentStage();
    if (newStage !== currentStage) {
      console.log(`📈 Stage updated: ${currentStage} → ${newStage}`);
      setCurrentStage(newStage);
    }
  }, [getT1Sessions(), getT2Sessions(), getT3Sessions(), getT4Sessions(), getT5Sessions(), calculateCurrentStage, currentStage]);

  // ✅ Listen for user profile changes
  useEffect(() => {
    if (userProfile?.sessionCounts) {
      console.log('👤 User profile updated, refreshing dashboard...');
      refreshDashboardData();
    }
  }, [userProfile?.sessionCounts, refreshDashboardData]);

  const displayName = useMemo(() => {
    return currentUser?.displayName ? `, ${currentUser.displayName.split(' ')[0]}` : '';
  }, [currentUser?.displayName]);

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
                    {/* 🔧 ADD: Progress indicator */}
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                      T5: {getT5Sessions()}/3 sessions {isT5Complete() && '✅'}
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
                  {tLevels.map((tLevel, index) => {
                    const tLevelNum = parseInt(tLevel.level.charAt(1));
                    const tSessions = tLevelNum === 1 ? getT1Sessions() :
                                     tLevelNum === 2 ? getT2Sessions() :
                                     tLevelNum === 3 ? getT3Sessions() :
                                     tLevelNum === 4 ? getT4Sessions() :
                                     getT5Sessions();
                    const tComplete = tLevelNum === 1 ? isT1Complete() :
                                     tLevelNum === 2 ? isT2Complete() :
                                     tLevelNum === 3 ? isT3Complete() :
                                     tLevelNum === 4 ? isT4Complete() :
                                     isT5Complete();
                    
                    return (
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
                        <div style={{ fontWeight: '600', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {tLevel.level}: {tLevel.duration} minutes
                          <span style={{ fontSize: '11px', color: tComplete ? '#10b981' : '#666' }}>
                            ({tSessions}/3 {tComplete && '✅'})
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Physical Stillness Practice
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Stages 2-6 with CORRECTED UserContext-backed progression logic */}
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
                      {/* 🔧 CORRECTED: Progress indicator for stages 2-6 with CORRECT requirements */}
                      {stageInfo.isUnlocked && (
                        <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px' }}>
                          {stage.num === 2 && `Hours: ${getStage2Hours().toFixed(1)}/10 ${isStage2CompleteByHours() && '✅'}`}
                          {stage.num === 3 && `Hours: ${getStage3Hours().toFixed(1)}/15 ${isStage3CompleteByHours() && '✅'}`}
                          {stage.num === 4 && `Hours: ${getStage4Hours().toFixed(1)}/20 ${isStage4CompleteByHours() && '✅'}`}
                          {stage.num === 5 && `Hours: ${getStage5Hours().toFixed(1)}/25 ${isStage5CompleteByHours() && '✅'}`}
                          {stage.num === 6 && `Hours: ${getStage6Hours().toFixed(1)}/30 ${isStage6CompleteByHours() && '✅'}`}
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
                  ? `Complete Stage 1 T5 (${getT5Sessions()}/3 sessions) to unlock Stage 2`
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