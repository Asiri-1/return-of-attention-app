import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MindRecoveryTimer from './MindRecoveryTimer';
import MindRecoveryReflection from './MindRecoveryReflection';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection'; // ← CHANGED: Use Universal Component

const MindRecoveryTimerWrapper: React.FC = () => {
  const { practiceType } = useParams<{ practiceType: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'timer' | 'reflection' | 'posture'>('posture');
  const [selectedPosture, setSelectedPosture] = useState<string>('');
  const [sessionPahmCounts, setSessionPahmCounts] = useState<any>(null); // State to store pahmCounts

  const practiceOptions = [
    { id: 'morning-recharge', duration: 5 },
    { id: 'emotional-reset', duration: 5 },
    { id: 'work-home-transition', duration: 5 },
    { id: 'evening-wind-down', duration: 5 },
    { id: 'mid-day-reset', duration: 3 },
  ];

  const practiceOption = practiceOptions.find(opt => opt.id === practiceType);

  useEffect(() => {
    console.log('MindRecoveryTimerWrapper mounted. practiceType:', practiceType);
    console.log('practiceOption found:', practiceOption);
    if (!practiceType || !practiceOption) {
      console.log('Redirecting to /mind-recovery due to missing practiceType or practiceOption');
      navigate('/mind-recovery');
    }
  }, [practiceType, practiceOption, navigate]);

  const handleTimerComplete = (pahmCounts: any) => {
    setSessionPahmCounts(pahmCounts); // Store pahmCounts from the timer
    setCurrentStep('reflection');
  };

  const handleReflectionComplete = () => {
    navigate('/home'); // Navigate to home page after reflection
  };

  const handleBack = () => {
    if (currentStep === 'reflection') {
      setCurrentStep('timer');
    } else if (currentStep === 'timer') {
      setCurrentStep('posture');
    } else if (currentStep === 'posture') {
      navigate('/mind-recovery');
    }
  };

  // ← CHANGED: Renamed to match UniversalPostureSelection interface
  const handleStartPractice = (posture: string) => {
    setSelectedPosture(posture);
    setCurrentStep('timer');
  };

  if (!practiceOption) {
    return null;
  }

  if (currentStep === 'posture') {
    return (
      <UniversalPostureSelection
        sessionType="mind_recovery"  // ← ENHANCED: Configure for mind recovery
        onStartPractice={handleStartPractice}  // ← CHANGED: Use onStartPractice instead of onSelectPosture
        onBack={handleBack}
      />
    );
  }

  if (currentStep === 'timer') {
    return (
      <MindRecoveryTimer
        practiceType={practiceOption.id}
        posture={selectedPosture}
        onComplete={handleTimerComplete}
        onBack={handleBack}
        duration={practiceOption.duration}
      />
    );
  }

  if (currentStep === 'reflection') {
    return (
      <MindRecoveryReflection
        practiceType={practiceOption.id}
        posture={selectedPosture}
        pahmCounts={sessionPahmCounts} // Pass pahmCounts to reflection
        onComplete={handleReflectionComplete}
        onBack={handleBack}
      />
    );
  }

  return null;
};

export default MindRecoveryTimerWrapper;