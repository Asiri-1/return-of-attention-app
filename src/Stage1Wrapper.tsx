import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage1Introduction from './Stage1Introduction';
import T1Introduction from './T1Introduction';
import T2Introduction from './T2Introduction';
import T3Introduction from './T3Introduction';
import T4Introduction from './T4Introduction';
import T5Introduction from './T5Introduction';
import Stage1PostureSelection from './Stage1PostureSelection';
import Stage1Reflection from './Stage1Reflection';
import MainNavigation from './MainNavigation';

interface Stage1WrapperProps {}

const Stage1Wrapper: React.FC<Stage1WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPostureSelection, setShowPostureSelection] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentTIntroduction, setCurrentTIntroduction] = useState<string | null>(null);
  const [currentTLevel, setCurrentTLevel] = useState('T1');
  const [currentDuration, setCurrentDuration] = useState(10);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [reflectionData, setReflectionData] = useState({
    duration: 10,
    stageLevel: 'T1: Physical Stillness for 10 minutes',
    posture: 'chair'
  });

  // Check if we're coming from introduction
  const isFromIntro = location.state && location.state.fromIntro;
  
  // Check if we should show T-level introduction (from T-level click in HomeDashboard)
  const shouldShowTIntro = location.state && location.state.showT1Introduction;
  
  // Check if we should show reflection (from timer completion)
  const shouldShowReflection = location.state && location.state.showReflection;
  
  // Check if we have level and duration in location state (from direct T-level click)
  const locationState = location.state || {};
  const hasLevelFromState = locationState.level && locationState.duration;
  
  // Get the specific T-level from location state
  const tLevelFromState = locationState.level || 'T1';

  // Get the user's current T-level and check if they've seen the intro
  useEffect(() => {
    // Check if user has seen the introduction before
    const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
    if (completedIntros.includes(1)) {
      setHasSeenIntro(true);
    }

    // Determine the user's current T-level
    let level = 'T1';
    let duration = 10;

    // First check if we have level from location state (direct T-level click)
    if (hasLevelFromState) {
      level = locationState.level;
      duration = locationState.duration;
    } else {
      // Check session history to determine the highest completed T-level
      const sessionHistory = JSON.parse(localStorage.getItem('sessionHistory') || '[]');
      
      // Filter for Stage 1 sessions
      const stage1Sessions = sessionHistory.filter((session: any) => session.stage === 1);
      
      if (stage1Sessions.length > 0) {
        // Find the highest T-level completed
        const tLevels = ['T1', 'T2', 'T3', 'T4', 'T5'];
        const completedLevels = stage1Sessions.map((session: any) => session.level);
        
        // Find the highest completed level
        let highestCompletedIndex = -1;
        completedLevels.forEach((level: string) => {
          const index = tLevels.indexOf(level);
          if (index > highestCompletedIndex) {
            highestCompletedIndex = index;
          }
        });
        
        // If user has completed any level, suggest the next one
        if (highestCompletedIndex >= 0 && highestCompletedIndex < tLevels.length - 1) {
          level = tLevels[highestCompletedIndex + 1];
        } else if (highestCompletedIndex === tLevels.length - 1) {
          // If user has completed T5, keep them at T5
          level = 'T5';
        }
      }
      
      // Set duration based on level
      switch(level) {
        case 'T1': duration = 10; break;
        case 'T2': duration = 15; break;
        case 'T3': duration = 20; break;
        case 'T4': duration = 25; break;
        case 'T5': duration = 30; break;
        default: duration = 10;
      }
    }
    
    setCurrentTLevel(level);
    setCurrentDuration(duration);
    
    // If user has seen intro before and we're not coming from another screen,
    // show posture selection directly
    if (hasSeenIntro && !isFromIntro && !showPostureSelection && !shouldShowReflection) {
      setShowPostureSelection(true);
    }
  }, [location.state]);

  React.useEffect(() => {
    // If coming from introduction, show posture selection
    if (isFromIntro) {
      setShowPostureSelection(true);
      setShowReflection(false);
    }
    
    // If coming from T-level click in HomeDashboard, show appropriate T-level introduction
    if (shouldShowTIntro && hasLevelFromState) {
      setCurrentTIntroduction(tLevelFromState);
      setShowReflection(false);
    }
    
    // If coming from timer completion, show reflection screen
    if (shouldShowReflection) {
      setShowReflection(true);
      setShowPostureSelection(false);
      setCurrentTIntroduction(null);
      
      // Set reflection data from location state
      setReflectionData({
        duration: locationState.duration || 10,
        stageLevel: locationState.stageLevel || 'T1: Physical Stillness for 10 minutes',
        posture: locationState.posture || 'chair'
      });
    }
  }, [isFromIntro, shouldShowTIntro, hasLevelFromState, tLevelFromState, shouldShowReflection]);

  const handleStage1Complete = () => {
    // When Stage 1 introduction is complete, show T1 introduction
    setCurrentTIntroduction('T1');
    // Update location state to track navigation flow
    navigate(`/stage1`, {
      state: {
        fromIntro: true,
        fromStage1Intro: true // Add flag to track coming from Stage1 intro specifically
      },
      replace: true
    });
  };
  
  const handleTIntroComplete = () => {
    // When any T-level introduction is complete, show posture selection
    setCurrentTIntroduction(null);
    setShowPostureSelection(true);
  };

  const handleBack = () => {
    if (showReflection) {
      // If in reflection, go back to posture selection
      setShowReflection(false);
      setShowPostureSelection(true);
    } else if (showPostureSelection) {
      // If in posture selection, go back to T-level introduction
      setShowPostureSelection(false);
      setCurrentTIntroduction(currentTLevel);
    } else if (currentTIntroduction) {
      // If in any T-level introduction, go back to Stage 1 introduction
      setCurrentTIntroduction(null);
    } else {
      // If in Stage 1 introduction, go back to home
      navigate('/home');
    }
  };

  const handleStartPractice = (selectedPosture: string) => {
    // Navigate to seeker practice timer with selected posture and current T-level
    // Force navigation regardless of how we got here (full intro or skipped)
    const timerState = {
      posture: selectedPosture,
      level: currentTLevel.toLowerCase(),
      duration: currentDuration,
      stageLevel: `${currentTLevel}: Physical Stillness for ${currentDuration} minutes`
    };
    
    // Use replace: true to avoid navigation history issues
    navigate('/seeker-practice-timer', {
      state: timerState,
      replace: true
    });
  };
  
  const handleReflectionComplete = () => {
    // When reflection is complete, go back to home dashboard
    navigate('/home');
  };

  // Render the appropriate T-level introduction based on currentTIntroduction
  const renderTLevelIntroduction = () => {
    switch(currentTIntroduction) {
      case 'T1':
        return (
          <T1Introduction
            onComplete={handleTIntroComplete}
            onBack={handleBack}
          />
        );
      case 'T2':
        return (
          <T2Introduction
            onComplete={handleTIntroComplete}
            onBack={handleBack}
          />
        );
      case 'T3':
        return (
          <T3Introduction
            onComplete={handleTIntroComplete}
            onBack={handleBack}
          />
        );
      case 'T4':
        return (
          <T4Introduction
            onComplete={handleTIntroComplete}
            onBack={handleBack}
          />
        );
      case 'T5':
        return (
          <T5Introduction
            onComplete={handleTIntroComplete}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MainNavigation>
      {showReflection ? (
        <Stage1Reflection
          duration={reflectionData.duration}
          stageLevel={reflectionData.stageLevel}
          posture={reflectionData.posture}
          onComplete={handleReflectionComplete}
          onBack={handleBack}
        />
      ) : showPostureSelection ? (
        <Stage1PostureSelection
          onBack={handleBack}
          onStartPractice={handleStartPractice}
          currentTLevel={currentTLevel}
        />
      ) : currentTIntroduction ? (
        renderTLevelIntroduction()
      ) : (
        <Stage1Introduction
          onComplete={handleStage1Complete}
          onBack={handleBack}
          hasSeenBefore={hasSeenIntro}
        />
      )}
    </MainNavigation>
  );
};

export default Stage1Wrapper;
