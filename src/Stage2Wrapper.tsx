import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage2Introduction from './Stage2Introduction';
import Stage2PostureSelection from './Stage2PostureSelection';
import PAHMTimer2 from './PAHMTimer2';
import PAHMReflection2 from './PAHMReflection2';
import MainNavigation from './MainNavigation';
// ❌ REMOVED: import PAHMTraineePracticeRecorder from './PAHMTraineePracticeRecorder';

interface Stage2WrapperProps {}

const Stage2Wrapper: React.FC<Stage2WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Component state
  const [showPostureSelection, setShowPostureSelection] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [selectedPosture, setSelectedPosture] = useState('');
  // ❌ REMOVED: const [sessionData, setSessionData] = useState<any>(null);

  // Check if coming from PAHM explanation
  const isFromPAHM = location.state && location.state.fromPAHM;
  const isFromIntro = location.state && location.state.fromIntro;
  
  // Parse URL search params for PAHM explanation return
  const searchParams = new URLSearchParams(window.location.search);
  const returnToStageParam = searchParams.get('returnToStage');
  const fromStageParam = searchParams.get('fromStage');
  
  // Check if coming from PAHM explanation via URL params (for direct window.location.href navigation)
  const isFromPAHMViaURL = returnToStageParam === '2' && fromStageParam === 'true';
  
  // Combine state-based and URL-based checks
  const effectivelyFromPAHM = isFromPAHM || isFromPAHMViaURL;
  
  const savedPosture = sessionStorage.getItem('selectedPosture');
  
  // Check if user has previously completed the introduction
  const hasCompletedIntro = () => {
    try {
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      return Array.isArray(completedIntros) && completedIntros.includes(2);
    } catch (e) {
      console.error("Error checking completed intros:", e);
      return false;
    }
  };

  React.useEffect(() => {
    // Check if T5 is completed before allowing access to Stage 2
    const t5Completed = sessionStorage.getItem('t5Completed') === 'true' || localStorage.getItem('t5Completed') === 'true';
    
    // If T5 is not completed and user is not already in Stage 2 or higher, redirect to home
    const currentStage = parseInt(localStorage.getItem('devCurrentStage') || '1', 10);
    if (!t5Completed && currentStage < 2) {
      alert('You need to complete T5 practice before accessing Stage 2.');
      navigate('/home');
      return;
    }
    
    // Force show introduction for direct menu access (first-time or returning)
    // This ensures the introduction is always shown when accessing Stage 2 from menu
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
  }, [effectivelyFromPAHM, isFromIntro, navigate]);

  // ❌ REMOVED: Complex session recording effect - PAHMTimer2 handles everything

  const handleComplete = () => {
    // For Stage 2, navigate to PAHM explanation
    navigate('/learning/pahm', { 
      state: { 
        returnToStage: 2,
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
  
  // ✅ SIMPLIFIED: Let PAHMTimer2 handle all data saving and navigation
  const handleTimerComplete = () => {
    console.log('🎯 Stage2Wrapper - Timer completed, showing reflection');
    
    // Simple state transition - PAHMTimer2 handles all data saving
    setShowTimer(false);
    setShowReflection(true);
  };

  // Handle reflection completion
  const handleReflectionComplete = () => {
    // Navigate back to home or to next stage
    navigate('/home');
  };

  // ❌ REMOVED: handleRecordSession function - no longer needed

  return (
    <MainNavigation>
      {showReflection ? (
        <PAHMReflection2
          onComplete={handleReflectionComplete}
          onBack={() => {
            setShowReflection(false);
            setShowTimer(true);
          }}
        />
      ) : showTimer ? (
        <PAHMTimer2
          onComplete={handleTimerComplete}
          onBack={handleBack}
          posture={selectedPosture}
        />
      ) : showPostureSelection ? (
        <Stage2PostureSelection
          onBack={handleBack}
          onStartPractice={handleStartPractice}
        />
      ) : (
        <Stage2Introduction
          onComplete={handleIntroComplete}
          onBack={handleBack}
        />
      )}
      {/* ❌ REMOVED: <PAHMTraineePracticeRecorder onRecordSession={handleRecordSession} /> */}
    </MainNavigation>
  );
};

export default Stage2Wrapper;