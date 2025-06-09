import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MindRecoveryTimer from './MindRecoveryTimer';
import MindRecoveryReflection from './MindRecoveryReflection';
import MindRecoveryPostureSelection from './MindRecoveryPostureSelection';

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
    if (!practiceType || !practiceOption) {
      navigate('/mind-recovery');
    }
  }, [practiceType, practiceOption, navigate]);

  const handleTimerComplete = (pahmCounts: any) => {
    setSessionPahmCounts(pahmCounts); // Store pahmCounts from the timer
    setCurrentStep('reflection');
  };

  const handleReflectionComplete = () => {
    navigate('/mind-recovery');
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

  const handlePostureSelect = (posture: string) => {
    setSelectedPosture(posture);
    setCurrentStep('timer');
  };

  if (!practiceOption) {
    return null;
  }

  if (currentStep === 'posture') {
    return (
      <MindRecoveryPostureSelection
        onSelectPosture={handlePostureSelect}
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


