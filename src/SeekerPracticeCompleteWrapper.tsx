import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage1Reflection from './Stage1Reflection';

const SeekerPracticeCompleteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from location state
  const state = location.state as { 
    duration?: number; 
    level?: string;
    posture?: string;
  } || {};
  
  // Use defaults if state values are missing
  const duration = state.duration || 10;
  const level = state.level || 'T1';
  const posture = state.posture || 'chair';
  
  // Format the stage level for display
  const stageLevel = `${level}: Physical Stillness for ${duration} minutes`;
  
  // Handle completion of reflection
  const handleComplete = () => {
    // Check if this is T5 completion
    if (level === 'T5') {
      // Set T5 completion flags
      sessionStorage.setItem('t5Completed', 'true');
      localStorage.setItem('t5Completed', 'true');
      
      // Set stage progress to allow Stage 2 access
      sessionStorage.setItem('stageProgress', '2');
      localStorage.setItem('devCurrentStage', '2');
      
      // Force current T level to be beyond T5 to ensure unlock
      sessionStorage.setItem('currentTLevel', 't6');
      
      console.log('T5 completed, unlocking Stage 2');
      
      // Force a page reload to ensure all components update
      window.location.href = '/home';
      return; // Exit early to prevent the navigate call
    }
    
    // Navigate back to home dashboard with a special flag to force refresh
    navigate('/home', { state: { forceRefresh: true, fromT5Completion: level === 'T5' } });
  };
  
  // Handle back button
  const handleBack = () => {
    // Navigate back to the timer with the same state
    navigate('/seeker-practice-timer', { 
      state: { 
        duration,
        level,
        posture,
        stageLevel
      } 
    });
  };
  
  return (
    <Stage1Reflection
      duration={duration}
      stageLevel={stageLevel}
      posture={posture}
      onComplete={handleComplete}
      onBack={handleBack}
    />
  );
};

export default SeekerPracticeCompleteWrapper;
