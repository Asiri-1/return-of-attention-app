import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer'; // ✅ NEW: Universal Timer
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection'; // ✅ NEW: Universal Reflection

const Stage2Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 🎯 Core state management
  const [currentPhase, setCurrentPhase] = useState<'introduction' | 'posture' | 'timer' | 'reflection'>('introduction');
  const [selectedPosture, setSelectedPosture] = useState<string>('');

  // 🎯 Navigation handlers
  const handleBack = () => {
    if (currentPhase === 'introduction') {
      navigate(-1);
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    }
  };

  const handleIntroductionComplete = () => {
    setCurrentPhase('posture');
  };

  const handlePostureSelected = (posture: string) => {
    setSelectedPosture(posture);
    setCurrentPhase('timer');
  };

  const handleTimerComplete = () => {
    console.log('✅ Timer completed, moving to reflection');
    setCurrentPhase('reflection');
  };

  const handleReflectionComplete = () => {
    console.log('✅ Stage 2 practice completed');
    navigate('/dashboard'); // or wherever you want to navigate after completion
  };

  // 🎯 Render current phase
  const renderCurrentPhase = () => {
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
            stageLevel={2}                    // ✅ Stage-specific config
            onComplete={handleTimerComplete}  // ✅ Proper callback flow
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={2}                      // ✅ Stage-specific reflection
            onComplete={handleReflectionComplete}
            onBack={handleBack}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="stage2-wrapper">
      {renderCurrentPhase()}
    </div>
  );
};

export default Stage2Wrapper;