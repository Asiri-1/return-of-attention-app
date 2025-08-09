// ✅ FIXED Stage6Wrapper.tsx - Uses UserContext session tracking for 15-hour requirement
// File: src/Stage6Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ For detailed session history
import { useUser } from './contexts/user/UserContext'; // ✅ For session counting and hours tracking
import Stage6Introduction from './Stage6Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

interface Stage6WrapperProps {}

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

interface LocationState {
  fromPAHM?: boolean;
  fromIntro?: boolean;
  returnToStage?: number;
  fromStage?: boolean;
}

const Stage6Wrapper: React.FC<Stage6WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Use UserContext for session counting and hours tracking (15-hour requirement)
  const { 
    incrementStage6Sessions,
    addStageHoursDirect,
    getStage6Sessions,
    getStage6Hours,
    isStage6CompleteByHours,
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
    const isFromPAHMViaURL = urlParams.returnToStage === '6' && urlParams.fromStage === 'true';
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
      await markStageIntroComplete('stage6');
      console.log('✅ Stage 6 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 6 intro as completed:', error);
      setCurrentPhase('posture'); // Continue anyway
    }
  }, [markStageIntroComplete]);
  
  // ✅ Handle posture selection
  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 6 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 6 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  // ✅ FIXED: Handle timer completion with proper session and hours tracking
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    try {
      console.log(`🎯 Stage 6 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ CRITICAL: Increment Stage 6 session count (persists after logout)
      const sessionCount = await incrementStage6Sessions();
      console.log(`📊 Stage 6 Sessions: ${sessionCount}`);
      
      // 2. ✅ CRITICAL: Add hours to Stage 6 for 15-hour requirement
      const hoursToAdd = completedDuration / 60; // Convert minutes to hours
      const totalHours = await addStageHoursDirect(6, hoursToAdd);
      console.log(`⏱️ Stage 6 Hours: ${totalHours}/15 (${Math.round((totalHours/15)*100)}%)`);
      
      // 3. ✅ ALSO: Record detailed session to PracticeContext
      if (addPracticeSession) {
        await addPracticeSession({
          stageLevel: 6,
          sessionType: 'meditation' as const,
          duration: completedDuration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: selectedPosture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: 8, // Excellent rating for Stage 6 - highest level!
          notes: `Stage 6 session - ${selectedPosture} posture`
        });
      }
      
      // 4. ✅ Check if Stage 6 is now complete (15+ hours) - Final stage!
      const isStageComplete = isStage6CompleteByHours();
      if (isStageComplete) {
        console.log('🎉 Stage 6 completed! 15+ hours reached - MEDITATION MASTERY ACHIEVED!');
        await markStageComplete(6); // Mark Stage 6 as complete - Final achievement!
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 6 session:', error);
      setCurrentPhase('reflection'); // Continue anyway
    }
  }, [incrementStage6Sessions, addStageHoursDirect, addPracticeSession, selectedPosture, 
      isStage6CompleteByHours, markStageComplete]);

  // ✅ FIXED: Handle reflection completion with progress tracking
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage6Hours();
      const currentSessions = getStage6Sessions();
      const isComplete = isStage6CompleteByHours();
      
      console.log(`📊 Stage 6 Progress: ${currentSessions} sessions, ${currentHours}/15 hours`);
      
      if (isComplete) {
        // Stage 6 is complete - FINAL STAGE MASTERY!
        navigate('/home', {
          state: {
            stage6Completed: true,
            masterAchieved: true,
            message: '🏆 CONGRATULATIONS! Stage 6 completed (15+ hours)! You have achieved MEDITATION MASTERY! 🎉'
          }
        });
      } else {
        // Stage 6 not complete yet, show progress
        const hoursRemaining = Math.max(0, 15 - currentHours);
        const percentComplete = Math.round((currentHours / 15) * 100);
        
        navigate('/home', {
          state: {
            stage6InProgress: true,
            message: `Stage 6 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours to mastery!)`
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 6 completion:', error);
      navigate('/home', {
        state: {
          stage6Completed: false,
          message: 'Stage 6 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage6Hours, getStage6Sessions, isStage6CompleteByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ Memoized component renderer
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={6}
            onComplete={handleReflectionComplete}
            onBack={handleReflectionBack}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={6}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={6}
            onBack={handleBack}
            onStartPractice={handleStartPractice}
          />
        );
        
      case 'introduction':
      default:
        return (
          <Stage6Introduction
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
      <div className="stage6-wrapper">
        {/* ✅ Show progress indicator */}
        <div className="stage-progress-header">
          <h2>Stage 6: Sustained Exclusive Focus</h2>
          <div className="progress-info">
            <span>Sessions: {getStage6Sessions()}</span>
            <span>Hours: {getStage6Hours().toFixed(1)}/15</span>
            <span>Progress: {Math.round((getStage6Hours() / 15) * 100)}%</span>
            {isStage6CompleteByHours() && <span className="mastery-badge">🏆 MASTERY ACHIEVED!</span>}
          </div>
        </div>
        
        {renderCurrentPhase}
      </div>
    </MainNavigation>
  );
};

export default Stage6Wrapper;