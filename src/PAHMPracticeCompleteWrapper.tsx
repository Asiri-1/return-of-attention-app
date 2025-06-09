import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PAHMPracticeComplete from './PAHMPracticeComplete';
import { PAHMCounts } from './types/PAHMTypes';

// Define locally to avoid import issues
interface PAHMReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

const PAHMPracticeCompleteWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from location state
  const state = location.state as { 
    duration?: number;
    stage?: number;
    stageTitle?: string;
    pahmCounts?: PAHMCounts;
  } || {};
  
  // Default values if state is not provided
  const duration = state.duration || 30;
  const stage = state.stage || 2;
  const stageTitle = state.stageTitle || 'Thought Observation';
  const pahmCounts = state.pahmCounts || {
    nostalgia: 0,
    likes: 0,
    anticipation: 0,
    past: 0,
    present: 0,
    future: 0,
    regret: 0,
    dislikes: 0,
    worry: 0
  };
  
  // Handle save and continue
  const handleSaveAndContinue = (rating: number, reflectionData?: PAHMReflectionData) => {
    navigate('/pahm-practice-reflection', { 
      state: { 
        duration,
        stage,
        stageTitle,
        pahmCounts,
        rating,
        reflectionData
      } 
    });
  };
  
  return (
    <PAHMPracticeComplete 
      onBack={() => navigate('/home')} 
      onSaveAndContinue={handleSaveAndContinue} 
      sessionData={{
        duration,
        stage,
        stageTitle,
        pahmCounts
      }}
    />
  );
};

export default PAHMPracticeCompleteWrapper;
