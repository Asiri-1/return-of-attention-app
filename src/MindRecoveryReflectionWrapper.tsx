import React from 'react';
import { useNavigate } from 'react-router-dom';
import MindRecoveryHub from './MindRecoveryHub';

const MindRecoverySelectionWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    console.log('🏠 MindRecoverySelectionWrapper: Navigating back to home');
    navigate('/home');
  };

  // ✅ ENHANCED: Better exercise selection with validation
  const handleExerciseSelect = (exerciseId: string) => {
    console.log('🎯 MindRecoverySelectionWrapper: Exercise selected:', exerciseId);
    
    // ✅ VALIDATION: Check if exerciseId is valid
    const validExercises = [
      'morning-recharge',
      'mid-day-reset', 
      'emotional-reset',
      'work-home-transition',
      'bedtime-winddown' // ✅ FIXED: Make sure this matches MindRecoveryHub
    ];
    
    if (!validExercises.includes(exerciseId)) {
      console.error('❌ Invalid exercise ID:', exerciseId);
      console.log('✅ Valid exercises:', validExercises);
      return;
    }
    
    // ✅ NAVIGATION: Navigate to the timer wrapper
    const targetUrl = `/mind-recovery/${exerciseId}`;
    console.log('🚀 Navigating to:', targetUrl);
    
    try {
      navigate(targetUrl);
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback navigation
      console.log('🔄 Attempting fallback navigation...');
      setTimeout(() => {
        navigate('/mind-recovery/emotional-reset'); // Safe fallback
      }, 100);
    }
  };

  return (
    <MindRecoveryHub 
      onBack={handleBack}
      onExerciseSelect={handleExerciseSelect}
      userData={undefined}
    />
  );
};

export default MindRecoverySelectionWrapper;