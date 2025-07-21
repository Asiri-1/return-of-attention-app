import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MindRecoveryTimer from './MindRecoveryTimer';
import MindRecoveryReflection from './MindRecoveryReflection';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';

const MindRecoveryTimerWrapper: React.FC = () => {
  const { practiceType } = useParams<{ practiceType: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<'timer' | 'reflection' | 'posture'>('posture');
  const [selectedPosture, setSelectedPosture] = useState<string>('');
  const [sessionPahmCounts, setSessionPahmCounts] = useState<any>(null);

  // ✅ FIXED: Updated practice options to match MindRecoveryHub IDs exactly
  const practiceOptions = [
    { id: 'morning-recharge', duration: 5, title: 'Morning Recharge' },
    { id: 'mid-day-reset', duration: 3, title: 'Mid-Day Reset' },
    { id: 'emotional-reset', duration: 5, title: 'Emotional Reset' },
    { id: 'work-home-transition', duration: 5, title: 'Work-Home Transition' },
    { id: 'bedtime-winddown', duration: 8, title: 'Bedtime Wind Down' }, // ✅ FIXED: Changed from 'evening-wind-down' to 'bedtime-winddown' to match MindRecoveryHub
  ];

  const practiceOption = practiceOptions.find(opt => opt.id === practiceType);

  useEffect(() => {
    console.log('🧘‍♀️ MindRecoveryTimerWrapper mounted. practiceType:', practiceType);
    console.log('📋 practiceOption found:', practiceOption);
    console.log('📋 Available practice IDs:', practiceOptions.map(opt => opt.id));
    
    // ✅ ENHANCED: Better error handling and recovery
    if (!practiceType || !practiceOption) {
      console.log('❌ Redirecting to /mind-recovery due to missing practiceType or practiceOption');
      console.log('❌ Received practiceType:', practiceType);
      console.log('❌ Available options:', practiceOptions.map(opt => opt.id).join(', '));
      
      // 🎯 Clear any stale session data
      localStorage.removeItem('mindRecoverySessionRecovery');
      navigate('/mind-recovery');
    }
  }, [practiceType, practiceOption, navigate]);

  // ✅ ENHANCED: Better session completion handling
  const handleTimerComplete = (pahmCounts: any) => {
    console.log('✅ Mind recovery timer completed with PAHM counts:', pahmCounts);
    setSessionPahmCounts(pahmCounts);
    setCurrentStep('reflection');
    
    // 🧹 Clean up any recovery data since session completed successfully
    localStorage.removeItem('mindRecoverySessionRecovery');
  };

  // ✅ ENHANCED: Better navigation handling
  const handleReflectionComplete = () => {
    console.log('✅ Mind recovery reflection completed, navigating to home');
    // 🧹 Final cleanup
    localStorage.removeItem('mindRecoverySessionRecovery');
    navigate('/home');
  };

  // ✅ ENHANCED: Better back navigation with cleanup
  const handleBack = () => {
    if (currentStep === 'reflection') {
      setCurrentStep('timer');
    } else if (currentStep === 'timer') {
      // 🧹 Clean up session data when going back from timer
      localStorage.removeItem('mindRecoverySessionRecovery');
      setCurrentStep('posture');
    } else if (currentStep === 'posture') {
      navigate('/mind-recovery');
    }
  };

  // ✅ ENHANCED: Better posture selection handling
  const handleStartPractice = (posture: string) => {
    console.log('🧘‍♀️ Starting mind recovery practice with posture:', posture);
    console.log('🧘‍♀️ Practice type:', practiceType);
    console.log('🧘‍♀️ Practice details:', practiceOption);
    setSelectedPosture(posture);
    setCurrentStep('timer');
    
    // 🧹 Clear any previous session recovery data
    localStorage.removeItem('mindRecoverySessionRecovery');
  };

  // 🛡️ ENHANCED: Better error boundary
  if (!practiceOption) {
    console.log('❌ No practice option found, returning null');
    return null;
  }

  // 🎯 POSTURE SELECTION STEP
  if (currentStep === 'posture') {
    return (
      <UniversalPostureSelection
        sessionType="mind_recovery"
        onStartPractice={handleStartPractice}
        onBack={handleBack}
      />
    );
  }

  // 🎯 TIMER STEP - Enhanced with all new features
  if (currentStep === 'timer') {
    return (
      <MindRecoveryTimer
        practiceType={practiceOption.id}
        posture={selectedPosture}
        duration={practiceOption.duration}
        onComplete={handleTimerComplete}
        onBack={handleBack}
      />
    );
  }

  // 🎯 REFLECTION STEP
  if (currentStep === 'reflection') {
    return (
      <MindRecoveryReflection
        practiceType={practiceOption.id}
        posture={selectedPosture}
        pahmCounts={sessionPahmCounts}
        onComplete={handleReflectionComplete}
        onBack={handleBack}
      />
    );
  }

  return null;
};

export default MindRecoveryTimerWrapper;