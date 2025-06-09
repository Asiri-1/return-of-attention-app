import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PAHMPracticeReflection from './PAHMPracticeReflection';
import { PAHMCounts } from './types/PAHMTypes';

// Define locally to avoid import issues
interface PAHMReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

const PAHMPracticeReflectionWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get PAHM counts from location state
  const state = location.state as { 
    pahmCounts?: PAHMCounts;
    reflectionData?: PAHMReflectionData;
  } || {};
  
  // Default values if state is not provided
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
  
  const handleSaveReflection = (reflectionData: PAHMReflectionData) => {
    navigate('/home');
  };
  
  return (
    <PAHMPracticeReflection 
      onBack={() => navigate('/pahm-practice-complete')} 
      onSaveReflection={handleSaveReflection} 
      pahmCounts={pahmCounts}
    />
  );
};

export default PAHMPracticeReflectionWrapper;
