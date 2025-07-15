import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage1Introduction from './Stage1Introduction';
import T1Introduction from './T1Introduction';
import T2Introduction from './T2Introduction';
import T3Introduction from './T3Introduction';
import T4Introduction from './T4Introduction';
import T5Introduction from './T5Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import Stage1Reflection from './Stage1Reflection';
import MainNavigation from './MainNavigation';

interface Stage1WrapperProps {}

interface LocationState {
  fromIntro?: boolean;
  showT1Introduction?: boolean;
  showReflection?: boolean;
  level?: string;
  duration?: number;
  stageLevel?: string;
  posture?: string;
  fromStage1Intro?: boolean;
}

interface ReflectionData {
  duration: number;
  stageLevel: string;
  posture: string;
}

interface SessionData {
  stage: number;
  level: string;
  [key: string]: any;
}

const Stage1Wrapper: React.FC<Stage1WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showPostureSelection, setShowPostureSelection] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentTIntroduction, setCurrentTIntroduction] = useState<string | null>(null);
  const [currentTLevel, setCurrentTLevel] = useState('T1');
  const [currentDuration, setCurrentDuration] = useState(10);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [reflectionData, setReflectionData] = useState<ReflectionData>({
    duration: 10,
    stageLevel: 'T1: Physical Stillness for 10 minutes',
    posture: 'chair'
  });

  // ✅ PERFORMANCE: Memoized location state parsing to prevent repeated destructuring
  const locationState = useMemo((): LocationState => {
    return location.state as LocationState || {};
  }, [location.state]);

  // ✅ PERFORMANCE: Memoized location state flags
  const locationFlags = useMemo(() => ({
    isFromIntro: locationState.fromIntro || false,
    shouldShowTIntro: locationState.showT1Introduction || false,
    shouldShowReflection: locationState.showReflection || false,
    hasLevelFromState: !!(locationState.level && locationState.duration),
    tLevelFromState: locationState.level || 'T1'
  }), [locationState]);

  // ✅ PERFORMANCE: Memoized T-level duration mapping
  const tLevelDurations = useMemo(() => ({
    'T1': 10,
    'T2': 15,
    'T3': 20,
    'T4': 25,
    'T5': 30
  }), []);

  // ✅ PERFORMANCE: Memoized T-levels array
  const tLevels = useMemo(() => ['T1', 'T2', 'T3', 'T4', 'T5'], []);

  // ✅ PERFORMANCE: Stable localStorage operations with error handling
  const getCompletedIntros = useCallback((): number[] => {
    try {
      return JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
    } catch (error) {
      // ✅ CODE QUALITY: Silent error handling for production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to parse completedStageIntros:', error);
      }
      return [];
    }
  }, []);

  const getSessionHistory = useCallback((): SessionData[] => {
    try {
      return JSON.parse(localStorage.getItem('sessionHistory') || '[]');
    } catch (error) {
      // ✅ CODE QUALITY: Silent error handling for production
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to parse sessionHistory:', error);
      }
      return [];
    }
  }, []);

  // ✅ PERFORMANCE: Memoized highest completed T-level calculation
  const calculateNextTLevel = useCallback((): { level: string; duration: number } => {
    // First check if we have level from location state (direct T-level click)
    if (locationFlags.hasLevelFromState) {
      return {
        level: locationState.level!,
        duration: locationState.duration!
      };
    }

    // Check session history to determine the highest completed T-level
    const sessionHistory = getSessionHistory();
    const stage1Sessions = sessionHistory.filter((session: SessionData) => session.stage === 1);
    
    if (stage1Sessions.length === 0) {
      return { level: 'T1', duration: 10 };
    }

    // Find the highest completed level
    const completedLevels = stage1Sessions.map((session: SessionData) => session.level);
    let highestCompletedIndex = -1;
    
    completedLevels.forEach((level: string) => {
      const index = tLevels.indexOf(level);
      if (index > highestCompletedIndex) {
        highestCompletedIndex = index;
      }
    });
    
    // If user has completed any level, suggest the next one
    let suggestedLevel = 'T1';
    if (highestCompletedIndex >= 0 && highestCompletedIndex < tLevels.length - 1) {
      suggestedLevel = tLevels[highestCompletedIndex + 1];
    } else if (highestCompletedIndex === tLevels.length - 1) {
      // If user has completed T5, keep them at T5
      suggestedLevel = 'T5';
    }
    
    return {
      level: suggestedLevel,
      duration: tLevelDurations[suggestedLevel as keyof typeof tLevelDurations] || 10
    };
  }, [locationFlags.hasLevelFromState, locationState.level, locationState.duration, getSessionHistory, tLevels, tLevelDurations]);

  // ✅ PERFORMANCE: Optimized initial state setup with single useEffect
  useEffect(() => {
    // Check if user has seen the introduction before
    const completedIntros = getCompletedIntros();
    const hasSeenIntroduction = completedIntros.includes(1);
    setHasSeenIntro(hasSeenIntroduction);

    // Calculate current T-level and duration
    const { level, duration } = calculateNextTLevel();
    setCurrentTLevel(level);
    setCurrentDuration(duration);
    
    // Handle initial state based on location flags
    const { isFromIntro, shouldShowTIntro, shouldShowReflection, hasLevelFromState, tLevelFromState } = locationFlags;
    
    if (shouldShowReflection) {
      setShowReflection(true);
      setShowPostureSelection(false);
      setCurrentTIntroduction(null);
      
      setReflectionData({
        duration: locationState.duration || 10,
        stageLevel: locationState.stageLevel || 'T1: Physical Stillness for 10 minutes',
        posture: locationState.posture || 'chair'
      });
    } else if (isFromIntro) {
      setShowPostureSelection(true);
      setShowReflection(false);
    } else if (shouldShowTIntro && hasLevelFromState) {
      setCurrentTIntroduction(tLevelFromState);
      setShowReflection(false);
    } else if (hasSeenIntroduction && !isFromIntro && !showPostureSelection && !shouldShowReflection) {
      // If user has seen intro before and we're not coming from another screen, show posture selection directly
      setShowPostureSelection(true);
    }
  }, [locationFlags, locationState, getCompletedIntros, calculateNextTLevel]);

  // ✅ PERFORMANCE: Stable event handlers with useCallback
  const handleStage1Complete = useCallback(() => {
    // When Stage 1 introduction is complete, show T1 introduction
    setCurrentTIntroduction('T1');
    // Update location state to track navigation flow
    navigate(`/stage1`, {
      state: {
        fromIntro: true,
        fromStage1Intro: true
      },
      replace: true
    });
  }, [navigate]);
  
  const handleTIntroComplete = useCallback(() => {
    // When any T-level introduction is complete, show posture selection
    setCurrentTIntroduction(null);
    setShowPostureSelection(true);
  }, []);

  const handleBack = useCallback(() => {
    if (showReflection) {
      // If in reflection, go back to posture selection
      setShowReflection(false);
      setShowPostureSelection(true);
    } else if (showPostureSelection) {
      // If in posture selection, go back to T-level introduction
      setShowPostureSelection(false);
      setCurrentTIntroduction(currentTLevel);
    } else if (currentTIntroduction) {
      // If in any T-level introduction, go back to Stage 1 introduction
      setCurrentTIntroduction(null);
    } else {
      // If in Stage 1 introduction, go back to home
      navigate('/home');
    }
  }, [showReflection, showPostureSelection, currentTIntroduction, currentTLevel, navigate]);

  const handleStartPractice = useCallback((selectedPosture: string) => {
    // Navigate to seeker practice timer with selected posture and current T-level
    const timerState = {
      posture: selectedPosture,
      level: currentTLevel.toLowerCase(),
      duration: currentDuration,
      stageLevel: `${currentTLevel}: Physical Stillness for ${currentDuration} minutes`
    };
    
    // Use replace: true to avoid navigation history issues
    navigate('/seeker-practice-timer', {
      state: timerState,
      replace: true
    });
  }, [navigate, currentTLevel, currentDuration]);
  
  const handleReflectionComplete = useCallback(() => {
    // When reflection is complete, go back to home dashboard
    navigate('/home');
  }, [navigate]);

  // ✅ PERFORMANCE: Memoized T-level introduction renderer to prevent recreation
  const renderTLevelIntroduction = useCallback(() => {
    if (!currentTIntroduction) return null;

    const commonProps = {
      onComplete: handleTIntroComplete,
      onBack: handleBack
    };

    switch(currentTIntroduction) {
      case 'T1':
        return <T1Introduction {...commonProps} />;
      case 'T2':
        return <T2Introduction {...commonProps} />;
      case 'T3':
        return <T3Introduction {...commonProps} />;
      case 'T4':
        return <T4Introduction {...commonProps} />;
      case 'T5':
        return <T5Introduction {...commonProps} />;
      default:
        return null;
    }
  }, [currentTIntroduction, handleTIntroComplete, handleBack]);

  // ✅ PERFORMANCE: Memoized main content renderer
  const renderMainContent = useMemo(() => {
    if (showReflection) {
      return (
        <Stage1Reflection
          duration={reflectionData.duration}
          stageLevel={reflectionData.stageLevel}
          posture={reflectionData.posture}
          onComplete={handleReflectionComplete}
          onBack={handleBack}
        />
      );
    }
    
    if (showPostureSelection) {
      return (
        <UniversalPostureSelection
          onBack={handleBack}
          onStartPractice={handleStartPractice}
          currentTLevel={currentTLevel}
        />
      );
    }
    
    if (currentTIntroduction) {
      return renderTLevelIntroduction();
    }
    
    return (
      <Stage1Introduction
        onComplete={handleStage1Complete}
        onBack={handleBack}
        hasSeenBefore={hasSeenIntro}
      />
    );
  }, [
    showReflection,
    showPostureSelection,
    currentTIntroduction,
    reflectionData,
    currentTLevel,
    hasSeenIntro,
    handleReflectionComplete,
    handleBack,
    handleStartPractice,
    handleStage1Complete,
    renderTLevelIntroduction
  ]);

  return (
    <MainNavigation>
      {renderMainContent}
    </MainNavigation>
  );
};

export default Stage1Wrapper;