import React from 'react';
import { useNavigate } from 'react-router-dom';
import MindRecoveryHub from './MindRecoveryHub';

const MindRecoverySelectionWrapper: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    console.log('🏠 MindRecoverySelectionWrapper: Navigating back to home');
    navigate('/home');
  };

  // ✅ ENHANCED: Comprehensive exercise selection with validation
  const handleExerciseSelect = (exerciseId: string) => {
    console.log('🎯 MindRecoverySelectionWrapper: Exercise selection initiated');
    console.log('   📥 Received exerciseId:', exerciseId);
    
    // ✅ VALIDATION: Complete list of valid exercises (must match all components)
    const validExercises = [
      'morning-recharge',
      'mid-day-reset',
      'emotional-reset',
      'work-home-transition',
      'bedtime-winddown' // ✅ FIXED: Correct ID
    ];
    
    console.log('   📋 Valid exercises:', validExercises);
    
    // ✅ VALIDATION: Check if exerciseId is valid
    if (!exerciseId) {
      console.error('❌ No exerciseId provided');
      return;
    }
    
    if (!validExercises.includes(exerciseId)) {
      console.error('❌ Invalid exercise ID received:', exerciseId);
      console.error('   📋 Expected one of:', validExercises);
      console.error('   🔄 Falling back to emotional-reset');
      
      // Fallback to a safe default
      const fallbackId = 'emotional-reset';
      setTimeout(() => {
        console.log('🔄 Attempting fallback navigation to:', `/mind-recovery/${fallbackId}`);
        navigate(`/mind-recovery/${fallbackId}`);
      }, 100);
      return;
    }
    
    // ✅ NAVIGATION: Navigate to the timer wrapper
    const targetUrl = `/mind-recovery/${exerciseId}`;
    console.log('🚀 Navigation details:');
    console.log('   🎯 Target URL:', targetUrl);
    console.log('   📋 Exercise details:', {
      id: exerciseId,
      isValid: true,
      timestamp: new Date().toISOString()
    });
    
    try {
      console.log('   ▶️ Executing navigation...');
      navigate(targetUrl);
      console.log('   ✅ Navigation command sent successfully');
    } catch (error) {
      console.error('❌ Navigation error occurred:', error);
      console.error('   🔍 Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        targetUrl: targetUrl
      });
      
      // ✅ FALLBACK: Retry navigation with error handling
      console.log('🔄 Attempting fallback navigation...');
      setTimeout(() => {
        try {
          navigate('/mind-recovery/emotional-reset'); // Safe fallback
          console.log('✅ Fallback navigation successful');
        } catch (fallbackError) {
          console.error('❌ Fallback navigation also failed:', fallbackError);
          // Ultimate fallback - go back to hub
          navigate('/mind-recovery');
        }
      }, 100);
    }
  };

  console.log('🧘‍♀️ MindRecoverySelectionWrapper: Component rendered');
  console.log('   📋 Available handlers:', {
    onBack: typeof handleBack,
    onExerciseSelect: typeof handleExerciseSelect
  });

  return (
    <MindRecoveryHub 
      onBack={handleBack}
      onExerciseSelect={handleExerciseSelect}
      userData={undefined} // Can be enhanced later for personalization
    />
  );
};

export default MindRecoverySelectionWrapper;