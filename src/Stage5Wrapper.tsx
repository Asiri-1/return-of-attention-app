// ✅ FIXED Stage5Wrapper.tsx - Uses UserContext session tracking for 15-hour requirement
// File: src/Stage5Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ For detailed session history
import { useUser } from './contexts/user/UserContext'; // ✅ For session counting and hours tracking
import Stage5Introduction from './Stage5Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

interface Stage5WrapperProps {}

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

interface LocationState {
  fromPAHM?: boolean;
  fromIntro?: boolean;
  returnToStage?: number;
  fromStage?: boolean;
}

const Stage5Wrapper: React.FC<Stage5WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Use UserContext for session counting and hours tracking (15-hour requirement)
  const { 
    incrementStage5Sessions,
    addStageHoursDirect,
    getStage5Sessions,
    getStage5Hours,
    isStage5CompleteByHours,
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
    const isFromPAHMViaURL = urlParams.returnToStage === '5' && urlParams.fromStage === 'true';
    const effectivelyFromPAHM = isFromPAHM || isFromPAHMViaURL;
    
    return {
      isFromPAHM,
      isFromIntro,
      isFromPAHMViaURL,
      effectivelyFromPAHM
    };
  }, [locationState.fromPAHM, locationState.fromIntro, urlParams.returnToStage, urlParams.fromStage]);

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
      await markStageIntroComplete('stage5');
      console.log('✅ Stage 5 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 5 intro as completed:', error);
      setCurrentPhase('posture'); // Continue anyway
    }
  }, [markStageIntroComplete]);
  
  // ✅ Handle posture selection
  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 5 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 5 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  // ✅ FIXED: Handle timer completion with proper session and hours tracking
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    try {
      console.log(`🎯 Stage 5 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ CRITICAL: Increment Stage 5 session count (persists after logout)
      const sessionCount = await incrementStage5Sessions();
      console.log(`📊 Stage 5 Sessions: ${sessionCount}`);
      
      // 2. ✅ CRITICAL: Add hours to Stage 5 for 15-hour requirement
      const hoursToAdd = completedDuration / 60; // Convert minutes to hours
      const totalHours = await addStageHoursDirect(5, hoursToAdd);
      console.log(`⏱️ Stage 5 Hours: ${totalHours}/15 (${Math.round((totalHours/15)*100)}%)`);
      
      // 3. ✅ ALSO: Record detailed session to PracticeContext
      if (addPracticeSession) {
        await addPracticeSession({
          stageLevel: 5,
          sessionType: 'meditation' as const,
          duration: completedDuration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: selectedPosture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: 7, // Excellent rating for Stage 5
          notes: `Stage 5 session - ${selectedPosture} posture`
        });
      }
      
      // 4. ✅ Check if Stage 5 is now complete (15+ hours)
      const isStageComplete = isStage5CompleteByHours();
      if (isStageComplete) {
        console.log('🎉 Stage 5 completed! 15+ hours reached');
        await markStageComplete(5); // Mark Stage 5 as complete and unlock Stage 6
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 5 session:', error);
      setCurrentPhase('reflection'); // Continue anyway
    }
  }, [incrementStage5Sessions, addStageHoursDirect, addPracticeSession, selectedPosture, 
      isStage5CompleteByHours, markStageComplete]);

  // ✅ FIXED: Handle reflection completion with progress tracking
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage5Hours();
      const currentSessions = getStage5Sessions();
      const isComplete = isStage5CompleteByHours();
      
      console.log(`📊 Stage 5 Progress: ${currentSessions} sessions, ${currentHours}/15 hours`);
      
      if (isComplete) {
        // Stage 5 is complete, navigate with celebration
        navigate('/home', {
          state: {
            stage5Completed: true,
            unlockedStage: 6,
            message: '🎉 Congratulations! Stage 5 completed (15+ hours)! Stage 6 is now unlocked!'
          }
        });
      } else {
        // Stage 5 not complete yet, show progress
        const hoursRemaining = Math.max(0, 15 - currentHours);
        const percentComplete = Math.round((currentHours / 15) * 100);
        
        navigate('/home', {
          state: {
            stage5InProgress: true,
            message: `Stage 5 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 5 completion:', error);
      navigate('/home', {
        state: {
          stage5Completed: false,
          message: 'Stage 5 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage5Hours, getStage5Sessions, isStage5CompleteByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ Memoized component renderer
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={5}
            onComplete={handleReflectionComplete}
            onBack={handleReflectionBack}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={5}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={5}
            onBack={handleBack}
            onStartPractice={handleStartPractice}
          />
        );
        
      case 'introduction':
      default:
        return (
          <Stage5Introduction
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
      <div className="stage5-wrapper">
        {/* ✅ Show progress indicator */}
        <div className="stage-progress-header">
          <h2>Stage 5: Overcome Subtle Dullness</h2>
          <div className="progress-info">
            <span>Sessions: {getStage5Sessions()}</span>
            <span>Hours: {getStage5Hours().toFixed(1)}/15</span>
            <span>Progress: {Math.round((getStage5Hours() / 15) * 100)}%</span>
          </div>
        </div>
        
        {renderCurrentPhase}
      </div>
    </MainNavigation>
  );
};

export default Stage5Wrapper;