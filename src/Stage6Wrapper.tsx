import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage6Introduction from './Stage6Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

interface Stage6WrapperProps {}

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

interface LocationState {
  fromPAHM?: boolean;
  fromIntro?: boolean;
  returnToStage?: number;
  fromStage?: boolean;
}

const Stage6Wrapper: React.FC<Stage6WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ PERFORMANCE: Consolidated state management - single phase instead of multiple booleans
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');

  // ✅ PERFORMANCE: Memoized location state parsing
  const locationState = useMemo((): LocationState => {
    return (location.state as LocationState) || {};
  }, [location.state]);

  // ✅ PERFORMANCE: Memoized URL params parsing to prevent repeated parsing
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      returnToStage: searchParams.get('returnToStage'),
      fromStage: searchParams.get('fromStage')
    };
  }, []);

  // ✅ PERFORMANCE: Memoized navigation flags calculation
  const navigationFlags = useMemo(() => {
    const isFromPAHM = locationState.fromPAHM || false;
    const isFromIntro = locationState.fromIntro || false;
    const isFromPAHMViaURL = urlParams.returnToStage === '6' && urlParams.fromStage === 'true';
    const effectivelyFromPAHM = isFromPAHM || isFromPAHMViaURL;
    
    return {
      isFromPAHM,
      isFromIntro,
      isFromPAHMViaURL,
      effectivelyFromPAHM
    };
  }, [locationState.fromPAHM, locationState.fromIntro, urlParams.returnToStage, urlParams.fromStage]);

  // ✅ PERFORMANCE: Stable sessionStorage operations with error handling

  const removeStoredPosture = useCallback((): void => {
    try {
      sessionStorage.removeItem('selectedPosture');
    } catch (error) {
      // ✅ CODE QUALITY: Silent error handling for production
      if (process.env.NODE_ENV === 'development') {
        console.warn("Error removing selectedPosture from sessionStorage:", error);
      }
    }
  }, []);

  // ✅ PERFORMANCE: Optimized initial phase determination with single useEffect
  useEffect(() => {
    const { effectivelyFromPAHM, isFromIntro } = navigationFlags;
    
    // Force show introduction for direct menu access (first-time or returning)
    if (!effectivelyFromPAHM && !isFromIntro) {
      setCurrentPhase('introduction');
      return;
    }
    
    // If coming from PAHM explanation (via state or URL params), always show posture selection
    if (effectivelyFromPAHM) {
      removeStoredPosture(); // Clear any saved posture to ensure user always goes through posture selection
      setCurrentPhase('posture');
      return;
    }
    
    // If coming from intro, show posture selection
    if (isFromIntro) {
      setCurrentPhase('posture');
    }
  }, [navigationFlags, removeStoredPosture]);

  // ✅ PERFORMANCE: Stable event handlers with useCallback

  const handleBack = useCallback(() => {
    if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else {
      // If in introduction, go back to home
      navigate('/home');
    }
  }, [currentPhase, navigate]);
  
  const handleIntroComplete = useCallback(() => {
    // When introduction is complete, show posture selection
    setCurrentPhase('posture');
  }, []);
  
  const handleStartPractice = useCallback((posture: string) => {
    // ✅ CODE QUALITY: Removed debug console.log for production
    
    // When posture is selected and practice starts, show timer
    setSelectedPosture(posture);
    
    // Save selected posture to session storage with error handling
    try {
      sessionStorage.setItem('selectedPosture', posture);
    } catch (error) {
      // ✅ CODE QUALITY: Silent error handling for production
      if (process.env.NODE_ENV === 'development') {
        console.warn("Error saving selectedPosture to sessionStorage:", error);
      }
    }
    
    // ✅ PERFORMANCE: Direct state update instead of requestAnimationFrame
    setCurrentPhase('timer');
  }, []);
  
  const handleTimerComplete = useCallback(() => {
    // When timer completes, store the selected posture for reflection
    try {
      sessionStorage.setItem('currentPosture', selectedPosture);
    } catch (error) {
      // ✅ CODE QUALITY: Silent error handling for production
      if (process.env.NODE_ENV === 'development') {
        console.warn("Error saving currentPosture to sessionStorage:", error);
      }
    }
    
    setCurrentPhase('reflection');
  }, [selectedPosture]);

  const handleReflectionComplete = useCallback(() => {
    // Navigate back to home or to next stage
    navigate('/home');
  }, [navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ PERFORMANCE: Memoized component renderer to prevent recreation on every render
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={6}
            onComplete={handleReflectionComplete}
            onBack={handleReflectionBack}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={6}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={6}
            onBack={handleBack}
            onStartPractice={handleStartPractice}
          />
        );
        
      case 'introduction':
      default:
        return (
          <Stage6Introduction
            onComplete={handleIntroComplete}
            onBack={handleBack}
          />
        );
    }
  }, [
    currentPhase,
    selectedPosture,
    handleReflectionComplete,
    handleReflectionBack,
    handleTimerComplete,
    handleBack,
    handleStartPractice,
    handleIntroComplete
  ]);

  return (
    <MainNavigation>
      {renderCurrentPhase}
    </MainNavigation>
  );
};

export default Stage6Wrapper;