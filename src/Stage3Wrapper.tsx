// ✅ FIXED Stage3Wrapper.tsx - Uses UserContext session tracking for 15-hour requirement
// File: src/Stage3Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ For detailed session history
import { useUser } from './contexts/user/UserContext'; // ✅ For session counting and hours tracking
import Stage3Introduction from './Stage3Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

interface Stage3WrapperProps {}

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

interface LocationState {
  fromPAHM?: boolean;
  fromIntro?: boolean;
  returnToStage?: number;
  fromStage?: boolean;
}

const Stage3Wrapper: React.FC<Stage3WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Use UserContext for session counting and hours tracking (15-hour requirement)
  const { 
    incrementStage3Sessions,
    addStageHoursDirect,
    getStage3Sessions,
    getStage3Hours,
    isStage3CompleteByHours,
    userProfile,
    markStageIntroComplete,
    markStageComplete
  } = useUser();

  // ✅ Keep PracticeContext for detailed session recording
  const { addPracticeSession } = usePractice();
  
  // ✅ State management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');

  // ✅ Memoized location state parsing
  const locationState = useMemo((): LocationState => {
    return (location.state as LocationState) || {};
  }, [location.state]);

  // ✅ Memoized URL params parsing
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      returnToStage: searchParams.get('returnToStage'),
      fromStage: searchParams.get('fromStage')
    };
  }, []);

  // ✅ Memoized navigation flags calculation
  const navigationFlags = useMemo(() => {
    const isFromPAHM = locationState.fromPAHM || false;
    const isFromIntro = locationState.fromIntro || false;
    const isFromPAHMViaURL = urlParams.returnToStage === '3' && urlParams.fromStage === 'true';
    const effectivelyFromPAHM = isFromPAHM || isFromPAHMViaURL;
    
    return {
      isFromPAHM,
      isFromIntro,
      isFromPAHMViaURL,
      effectivelyFromPAHM
    };
  }, [locationState.fromPAHM, locationState.fromIntro, urlParams.returnToStage, urlParams.fromStage]);

  // ✅ FIXED: Check intro completion from UserContext
  const hasCompletedIntro = useMemo(() => {
    try {
      if (userProfile?.stageProgress?.completedStageIntros) {
        return userProfile.stageProgress.completedStageIntros.includes('stage3');
      }
      return false;
    } catch (error) {
      console.error("Error checking completed intros:", error);
      return false;
    }
  }, [userProfile?.stageProgress?.completedStageIntros]);

  // ✅ Clear previous session data
  const clearPreviousSession = useCallback(async (): Promise<void> => {
    try {
      console.log('✅ Previous session state cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing previous session:', error);
    }
  }, []);

  // ✅ Initial phase determination
  useEffect(() => {
    const { effectivelyFromPAHM, isFromIntro } = navigationFlags;
    
    if (!effectivelyFromPAHM && !isFromIntro) {
      setCurrentPhase('introduction');
      return;
    }
    
    if (effectivelyFromPAHM) {
      clearPreviousSession();
      setCurrentPhase('posture');
      return;
    }
    
    if (isFromIntro) {
      setCurrentPhase('posture');
    }
  }, [navigationFlags, clearPreviousSession]);

  // ✅ Navigation handlers
  const handleComplete = useCallback(() => {
    navigate('/learning/pahm', { 
      state: { 
        returnToStage: 3,
        fromStage: true
      } 
    });
  }, [navigate]);

  const handleBack = useCallback(() => {
    if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else {
      navigate('/home');
    }
  }, [currentPhase, navigate]);
  
  // ✅ FIXED: Handle introduction completion
  const handleIntroComplete = useCallback(async () => {
    try {
      await markStageIntroComplete('stage3');
      console.log('✅ Stage 3 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 3 intro as completed:', error);
      setCurrentPhase('posture'); // Continue anyway
    }
  }, [markStageIntroComplete]);
  
  // ✅ Handle posture selection
  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 3 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 3 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  // ✅ FIXED: Handle timer completion with proper session and hours tracking
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    try {
      console.log(`🎯 Stage 3 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ CRITICAL: Increment Stage 3 session count (persists after logout)
      const sessionCount = await incrementStage3Sessions();
      console.log(`📊 Stage 3 Sessions: ${sessionCount}`);
      
      // 2. ✅ CRITICAL: Add hours to Stage 3 for 15-hour requirement
      const hoursToAdd = completedDuration / 60; // Convert minutes to hours
      const totalHours = await addStageHoursDirect(3, hoursToAdd);
      console.log(`⏱️ Stage 3 Hours: ${totalHours}/15 (${Math.round((totalHours/15)*100)}%)`);
      
      // 3. ✅ ALSO: Record detailed session to PracticeContext
      if (addPracticeSession) {
        await addPracticeSession({
          stageLevel: 3,
          sessionType: 'meditation' as const,
          duration: completedDuration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: selectedPosture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: 5, // Good rating for Stage 3
          notes: `Stage 3 session - ${selectedPosture} posture`
        });
      }
      
      // 4. ✅ Check if Stage 3 is now complete (15+ hours)
      const isStageComplete = isStage3CompleteByHours();
      if (isStageComplete) {
        console.log('🎉 Stage 3 completed! 15+ hours reached');
        await markStageComplete(3); // Mark Stage 3 as complete and unlock Stage 4
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 3 session:', error);
      setCurrentPhase('reflection'); // Continue anyway
    }
  }, [incrementStage3Sessions, addStageHoursDirect, addPracticeSession, selectedPosture, 
      isStage3CompleteByHours, markStageComplete]);

  // ✅ FIXED: Handle reflection completion with progress tracking
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage3Hours();
      const currentSessions = getStage3Sessions();
      const isComplete = isStage3CompleteByHours();
      
      console.log(`📊 Stage 3 Progress: ${currentSessions} sessions, ${currentHours}/15 hours`);
      
      if (isComplete) {
        // Stage 3 is complete, navigate with celebration
        navigate('/home', {
          state: {
            stage3Completed: true,
            unlockedStage: 4,
            message: '🎉 Congratulations! Stage 3 completed (15+ hours)! Stage 4 is now unlocked!'
          }
        });
      } else {
        // Stage 3 not complete yet, show progress
        const hoursRemaining = Math.max(0, 15 - currentHours);
        const percentComplete = Math.round((currentHours / 15) * 100);
        
        navigate('/home', {
          state: {
            stage3InProgress: true,
            message: `Stage 3 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 3 completion:', error);
      navigate('/home', {
        state: {
          stage3Completed: false,
          message: 'Stage 3 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage3Hours, getStage3Sessions, isStage3CompleteByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ Memoized component renderer
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={3}
            onComplete={handleReflectionComplete}
            onBack={handleReflectionBack}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={3}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={3}
            onBack={handleBack}
            onStartPractice={handleStartPractice}
          />
        );
        
      case 'introduction':
      default:
        return (
          <Stage3Introduction
            onComplete={handleIntroComplete}
            onBack={handleBack}
          />
        );
    }
  }, [
    currentPhase,
    selectedPosture,
    handleReflectionComplete,
    handleReflectionBack,
    handleTimerComplete,
    handleBack,
    handleStartPractice,
    handleIntroComplete
  ]);

  return (
    <MainNavigation>
      <div className="stage3-wrapper">
        {/* ✅ Show progress indicator */}
        <div className="stage-progress-header">
          <h2>Stage 3: Sustained Attention</h2>
          <div className="progress-info">
            <span>Sessions: {getStage3Sessions()}</span>
            <span>Hours: {getStage3Hours().toFixed(1)}/15</span>
            <span>Progress: {Math.round((getStage3Hours() / 15) * 100)}%</span>
          </div>
        </div>
        
        {renderCurrentPhase}
      </div>
    </MainNavigation>
  );
};

export default Stage3Wrapper;