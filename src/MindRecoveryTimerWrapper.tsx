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

  // ✅ FIXED: Updated practice options to match all components exactly
  const practiceOptions = [
    { id: 'morning-recharge', duration: 5, title: 'Morning Recharge' },
    { id: 'mid-day-reset', duration: 3, title: 'Mid-Day Reset' },
    { id: 'emotional-reset', duration: 5, title: 'Emotional Reset' },
    { id: 'work-home-transition', duration: 5, title: 'Work-Home Transition' },
    { id: 'bedtime-winddown', duration: 8, title: 'Bedtime Wind Down' } // ✅ FIXED: Correct ID and duration
  ];

  const practiceOption = practiceOptions.find(opt => opt.id === practiceType);

  useEffect(() => {
    console.log('🧘‍♀️ MindRecoveryTimerWrapper mounted');
    console.log('   🔍 practiceType received:', practiceType);
    console.log('   📋 practiceOption found:', practiceOption);
    console.log('   📋 Available practice IDs:', practiceOptions.map(opt => opt.id));
    
    // ✅ Enhanced error handling and logging
    if (!practiceType) {
      console.error('❌ No practiceType provided in URL params');
      console.log('🔄 Redirecting to /mind-recovery due to missing practiceType');
      navigate('/mind-recovery');
      return;
    }
    
    if (!practiceOption) {
      console.error('❌ practiceType not found in available options');
      console.error('   📥 Received:', practiceType);
      console.error('   📋 Available:', practiceOptions.map(opt => opt.id).join(', '));
      console.log('🔄 Redirecting to /mind-recovery due to invalid practiceType');
      navigate('/mind-recovery');
      return;
    }
    
    console.log('✅ Valid practice option found:', {
      id: practiceOption.id,
      title: practiceOption.title,
      duration: practiceOption.duration
    });
  }, [practiceType, practiceOption, navigate, practiceOptions]);

  // ✅ Session completion handling
  const handleTimerComplete = (pahmCounts: any) => {
    console.log('✅ Mind recovery timer completed');
    console.log('   📊 PAHM counts received:', pahmCounts);
    console.log('   🔄 Moving to reflection step');
    
    setSessionPahmCounts(pahmCounts);
    setCurrentStep('reflection');
  };

  // ✅ Reflection completion handling
  const handleReflectionComplete = () => {
    console.log('✅ Mind recovery reflection completed');
    console.log('   🏠 Navigating back to home');
    navigate('/home');
  };

  // ✅ Enhanced back navigation with step tracking
  const handleBack = () => {
    console.log(`🔙 Back button pressed from step: ${currentStep}`);
    
    if (currentStep === 'reflection') {
      console.log('   🔄 Moving back to timer step');
      setCurrentStep('timer');
    } else if (currentStep === 'timer') {
      console.log('   🔄 Moving back to posture step');
      setCurrentStep('posture');
    } else if (currentStep === 'posture') {
      console.log('   🏠 Navigating back to mind recovery hub');
      navigate('/mind-recovery');
    }
  };

  // ✅ Enhanced posture selection handling
  const handleStartPractice = (posture: string) => {
    console.log('🧘‍♀️ Starting mind recovery practice');
    console.log('   🪑 Selected posture:', posture);
    console.log('   🎯 Practice type:', practiceType);
    console.log('   📋 Practice details:', practiceOption);
    console.log('   🔄 Moving to timer step');
    
    setSelectedPosture(posture);
    setCurrentStep('timer');
  };

  // 🛡️ Error boundary and validation
  if (!practiceOption) {
    console.log('❌ No practice option available, rendering null');
    return null;
  }

  // 🎯 POSTURE SELECTION STEP
  if (currentStep === 'posture') {
    console.log('🪑 Rendering posture selection step');
    return (
      <UniversalPostureSelection
        sessionType="mind_recovery"
        onStartPractice={handleStartPractice}
        onBack={handleBack}
        currentTLevel="MR" // Mind Recovery identifier
        stageNumber={0} // Independent practice
      />
    );
  }

  // 🎯 TIMER STEP
  if (currentStep === 'timer') {
    console.log('⏱️ Rendering timer step');
    console.log('   📋 Timer props:', {
      practiceType: practiceOption.id,
      posture: selectedPosture,
      duration: practiceOption.duration
    });
    
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
    console.log('📝 Rendering reflection step');
    console.log('   📊 Reflection props:', {
      practiceType: practiceOption.id,
      posture: selectedPosture,
      pahmCounts: sessionPahmCounts
    });
    
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

  // 🛡️ Fallback case
  console.warn('⚠️ Unknown step:', currentStep);
  return null;
};

export default MindRecoveryTimerWrapper;