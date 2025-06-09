import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PAHMTimer from './PAHMTimer';
import { PAHMCounts } from './types/PAHMTypes';

// Define the interface for the component props
interface PAHMTimerWrapperProps {}

const PAHMTimerWrapper: React.FC<PAHMTimerWrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from location state
  const state = location.state as { 
    stageLevel?: string; 
    duration?: number;
    stage?: number;
    posture?: string;
  } || {};
  
  // Default values if state is not provided
  const stageLevel = state.stageLevel || 'PAHM Practice';
  const initialMinutes = state.duration || 30;
  const stage = state.stage || 2;
  const posture = state.posture || sessionStorage.getItem('currentPosture') || 'unknown';
  
  // Handle completion with PAHM counts
  const handleComplete = (pahmCounts: PAHMCounts) => {
    navigate('/pahm-practice-complete', { 
      state: { 
        duration: initialMinutes,
        stage: stage,
        stageTitle: stageLevel.replace('PAHM Stage ', '').replace(' Practice', ''),
        pahmCounts,
        posture // Include posture data in the session
      } 
    });
  };
  
  return (
    <PAHMTimer 
      initialMinutes={initialMinutes}
      stageLevel={stageLevel}
      onComplete={handleComplete}
      onBack={() => navigate('/home')}
    />
  );
};

export default PAHMTimerWrapper;
