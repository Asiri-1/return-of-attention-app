import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import WhatIsPAHM from './WhatIsPAHM';

const WhatIsPAHMWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get user data to determine stage level
  const getUserStage = () => {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      const currentUser = JSON.parse(currentUserData);
      return currentUser.currentStage || 2;
    }
    return 2; // Default to stage 2 if no user data
  };
  
  // Handle start practice button click
  const handleStartPractice = () => {
    // Always navigate to /stage2 for consistency with the skip flow
    // This ensures both full flow and skip flow use the same URL pattern
    
    // IMPORTANT: Never navigate to /pahm-practice as it's not properly configured
    navigate('/stage2', {
      state: {
        fromPAHM: true,
        stageLevel: 'PAHM Trainee Practice',
        duration: 30, // Default to 30 minutes for PAHM stages
        stage: 2
      },
      replace: true // Use replace to avoid history stack issues
    });
  };
  
  return (
    <WhatIsPAHM 
      onBack={() => navigate('/home')} 
      onStartPractice={handleStartPractice}
    />
  );
};

export default WhatIsPAHMWrapper;
