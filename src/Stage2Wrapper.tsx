import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

const Stage2Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ PERFORMANCE: Type-safe state management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState<string>('');

  // ✅ PERFORMANCE: Stable event handlers with useCallback to prevent child re-renders
  const handleBack = useCallback(() => {
    if (currentPhase === 'introduction') {
      navigate(-1);
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    }
  }, [currentPhase, navigate]);

  const handleIntroductionComplete = useCallback(() => {
    setCurrentPhase('posture');
  }, []);

  const handlePostureSelected = useCallback((posture: string) => {
    setSelectedPosture(posture);
    setCurrentPhase('timer');
  }, []);

  const handleTimerComplete = useCallback(() => {
    // ✅ CODE QUALITY: Removed debug console.log for production
    setCurrentPhase('reflection');
  }, []);

  const handleReflectionComplete = useCallback(() => {
    // ✅ CODE QUALITY: Removed debug console.log for production
    navigate('/dashboard'); // or wherever you want to navigate after completion
  }, [navigate]);

  // ✅ PERFORMANCE: Memoized phase renderer to prevent recreation on every render
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'introduction':
        return (
          <Stage2Introduction
            onComplete={handleIntroductionComplete}
            onBack={handleBack}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={2}
            onBack={handleBack}
            onStartPractice={handlePostureSelected}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={2}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={2}
            onComplete={handleReflectionComplete}
            onBack={handleBack}
          />
        );
        
      default:
        return null;
    }
  }, [
    currentPhase,
    selectedPosture,
    handleBack,
    handleIntroductionComplete,
    handlePostureSelected,
    handleTimerComplete,
    handleReflectionComplete
  ]);

  return (
    <div className="stage2-wrapper">
      {renderCurrentPhase}
    </div>
  );
};

export default Stage2Wrapper;