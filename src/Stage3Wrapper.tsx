import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage3Introduction from './Stage3Introduction';
import Stage3PostureSelection from './Stage3PostureSelection';
import PAHMTimer3 from './PAHMTimer3';
import PAHMReflection3 from './PAHMReflection3';
import MainNavigation from './MainNavigation';

interface Stage3WrapperProps {}

const Stage3Wrapper: React.FC<Stage3WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Component state
  const [showPostureSelection, setShowPostureSelection] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedPosture, setSelectedPosture] = useState('');

  // Check if coming from PAHM explanation
  const isFromPAHM = location.state && location.state.fromPAHM;
  const isFromIntro = location.state && location.state.fromIntro;
  
  // Parse URL search params for PAHM explanation return
  const searchParams = new URLSearchParams(window.location.search);
  const returnToStageParam = searchParams.get('returnToStage');
  const fromStageParam = searchParams.get('fromStage');
  
  // Check if coming from PAHM explanation via URL params (for direct window.location.href navigation)
  const isFromPAHMViaURL = returnToStageParam === '3' && fromStageParam === 'true';
  
  // Combine state-based and URL-based checks
  const effectivelyFromPAHM = isFromPAHM || isFromPAHMViaURL;
  
  const savedPosture = sessionStorage.getItem('selectedPosture');
  
  // Check if user has previously completed the introduction
  const hasCompletedIntro = () => {
    try {
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      return Array.isArray(completedIntros) && completedIntros.includes(3);
    } catch (e) {
      console.error("Error checking completed intros:", e);
      return false;
    }
  };

  React.useEffect(() => {
    // Force show introduction for direct menu access (first-time or returning)
    // This ensures the introduction is always shown when accessing Stage 3 from menu
    if (!effectivelyFromPAHM && !isFromIntro) {
      setShowPostureSelection(false);
      return;
    }
    
    // If coming from PAHM explanation (via state or URL params), always show posture selection
    // This enforces the flow: intro -> PAHM -> posture -> timer -> reflection
    if (effectivelyFromPAHM) {
      // Clear any saved posture to ensure user always goes through posture selection
      sessionStorage.removeItem('selectedPosture');
      setShowPostureSelection(true);
      return;
    }
    
    // If coming from intro, show posture selection
    if (isFromIntro) {
      setShowPostureSelection(true);
    }
    // Default case - show introduction
  }, [effectivelyFromPAHM, isFromIntro]);

  const handleComplete = () => {
    // For Stage 3, navigate to PAHM explanation
    navigate('/learning/pahm', { 
      state: { 
        returnToStage: 3,
        fromStage: true
      } 
    });
  };

  const handleBack = () => {
    if (showTimer) {
      // If in timer, go back to posture selection
      setShowTimer(false);
      setShowPostureSelection(true);
    } else if (showPostureSelection) {
      // If in posture selection, go back to introduction
      setShowPostureSelection(false);
    } else {
      // If in introduction, go back to home
      navigate('/home');
    }
  };
  
  const handleIntroComplete = () => {
    // When introduction is complete, show posture selection
    // This allows the skip intro path to go directly to posture selection
    setShowPostureSelection(true);
  };
  
  const handleStartPractice = (posture: string) => {
    console.log("Starting practice with posture:", posture);
    
    // When posture is selected and practice starts, show timer
    setSelectedPosture(posture);
    // Save selected posture to session storage for returning from PAHM explanation
    sessionStorage.setItem('selectedPosture', posture);
    
    // Force state update to ensure timer is shown
    setShowPostureSelection(false);
    
    // Use a more reliable approach with requestAnimationFrame instead of setTimeout
    requestAnimationFrame(() => {
      console.log("Setting showTimer to true");
      setShowTimer(true);
    });
  };
  
  const handleTimerComplete = () => {
    // When timer completes, store the selected posture for reflection
    sessionStorage.setItem('currentPosture', selectedPosture);
    
    // Instead of navigating to a potentially non-existent route,
    // render the PAHMReflection3 component directly in this wrapper
    setShowTimer(false);
    setShowReflection(true);
  };

  // Handle reflection completion
  const handleReflectionComplete = () => {
    // Navigate back to home or to next stage
    navigate('/home');
  };

  return (
    <MainNavigation>
      {showReflection ? (
        <PAHMReflection3
          onComplete={handleReflectionComplete}
          onBack={() => {
            setShowReflection(false);
            setShowTimer(true);
          }}
        />
      ) : showTimer ? (
        <PAHMTimer3
          onComplete={handleTimerComplete}
          onBack={handleBack}
          posture={selectedPosture}
        />
      ) : showPostureSelection ? (
        <Stage3PostureSelection
          onBack={handleBack}
          onStartPractice={handleStartPractice}
        />
      ) : (
        <Stage3Introduction
          onComplete={handleIntroComplete}
          onBack={handleBack}
        />
      )}
    </MainNavigation>
  );
};

export default Stage3Wrapper;
