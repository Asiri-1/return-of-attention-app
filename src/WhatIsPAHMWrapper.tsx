import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from './contexts/user/UserContext'; // ✅ Fixed path - contexts is inside src/
import WhatIsPAHM from './WhatIsPAHM';

const WhatIsPAHMWrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIREBASE-ONLY: Get user data from UserContext
  const { userProfile } = useUser();

  // ✅ Get user stage from Firebase data (not localStorage)
  const getUserStage = () => {
    // Check if userProfile exists and has stage-related properties
    if (userProfile && typeof userProfile === 'object') {
      // Try common property names for current stage
      if ('currentStage' in userProfile) return userProfile.currentStage as number || 2;
      if ('stage' in userProfile) return userProfile.stage as number || 2;
      if ('level' in userProfile) return userProfile.level as number || 2;
      if ('progress' in userProfile && 
          userProfile.progress && 
          typeof userProfile.progress === 'object' && 
          'currentStage' in userProfile.progress) {
        return userProfile.progress.currentStage as number || 2;
      }
    }
    return 2; // Default to stage 2
  };

  // Handle start practice button click
  const handleStartPractice = () => {
    const userStage = getUserStage(); // ✅ Get the stage value
    
    // Always navigate to /stage2 for consistency with the skip flow
    // This ensures both full flow and skip flow use the same URL pattern
    
    // IMPORTANT: Never navigate to /pahm-practice as it's not properly configured
    navigate('/stage2', {
      state: {
        fromPAHM: true,
        stageLevel: 'PAHM Trainee Practice',
        duration: 30, // Default to 30 minutes for PAHM stages
        stage: userStage, // ✅ Now userStage is defined in this scope
        userStage: userStage // ✅ Additional context for the target component
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