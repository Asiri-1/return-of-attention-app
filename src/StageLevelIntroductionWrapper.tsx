import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import StageLevelIntroduction from './StageLevelIntroduction';
import MainNavigation from './MainNavigation';

interface StageLevelIntroductionWrapperProps {}

const StageLevelIntroductionWrapper: React.FC<StageLevelIntroductionWrapperProps> = () => {
  const { stageNumber } = useParams<{ stageNumber: string }>();
  const navigate = useNavigate();
  const stageNum = parseInt(stageNumber || '1', 10);

  // Listen for refreshPAHM event
  useEffect(() => {
    const handleRefreshPAHM = (event: Event) => {
      const customEvent = event as CustomEvent;
      const stage = customEvent.detail?.stageNumber || stageNum;
      
      // Navigate to PAHM explanation with return stage info
      navigate('/learning/pahm', { 
        state: { 
          returnToStage: stage,
          isRefresh: true
        } 
      });
    };

    window.addEventListener('refreshPAHM', handleRefreshPAHM);
    
    return () => {
      window.removeEventListener('refreshPAHM', handleRefreshPAHM);
    };
  }, [navigate, stageNum]);

  const handleComplete = () => {
    // For all stages, always show the stage introduction first
    // The StageLevelIntroduction component will handle showing the appropriate buttons
    // based on the stage number, and those buttons will trigger the appropriate navigation
    
    // No automatic navigation to PAHM explanation or posture selection
    // The user must explicitly choose via the buttons in the introduction
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <MainNavigation>
      <StageLevelIntroduction
        stageNumber={stageNum}
        onComplete={handleComplete}
        onBack={handleBack}
      />
    </MainNavigation>
  );
};

export default StageLevelIntroductionWrapper;
