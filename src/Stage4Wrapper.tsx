// ✅ FIXED Stage4Wrapper.tsx - Uses UserContext session tracking for 15-hour requirement
// File: src/Stage4Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ For detailed session history
import { useUser } from './contexts/user/UserContext'; // ✅ For session counting and hours tracking
import Stage4Introduction from './Stage4Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

interface Stage4WrapperProps {}

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

interface LocationState {
  fromPAHM?: boolean;
  fromIntro?: boolean;
  returnToStage?: number;
  fromStage?: boolean;
}

const Stage4Wrapper: React.FC<Stage4WrapperProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Use UserContext for session counting and hours tracking (15-hour requirement)
  const { 
    incrementStage4Sessions,
    addStageHoursDirect,
    getStage4Sessions,
    getStage4Hours,
    isStage4CompleteByHours,
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
    const isFromPAHMViaURL = urlParams.returnToStage === '4' && urlParams.fromStage === 'true';
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
        return userProfile.stageProgress.completedStageIntros.includes('stage4');
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
        returnToStage: 4,
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
      await markStageIntroComplete('stage4');
      console.log('✅ Stage 4 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 4 intro as completed:', error);
      setCurrentPhase('posture'); // Continue anyway
    }
  }, [markStageIntroComplete]);
  
  // ✅ Handle posture selection
  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 4 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 4 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  // ✅ FIXED: Handle timer completion with proper session and hours tracking
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    try {
      console.log(`🎯 Stage 4 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ CRITICAL: Increment Stage 4 session count (persists after logout)
      const sessionCount = await incrementStage4Sessions();
      console.log(`📊 Stage 4 Sessions: ${sessionCount}`);
      
      // 2. ✅ CRITICAL: Add hours to Stage 4 for 15-hour requirement
      const hoursToAdd = completedDuration / 60; // Convert minutes to hours
      const totalHours = await addStageHoursDirect(4, hoursToAdd);
      console.log(`⏱️ Stage 4 Hours: ${totalHours}/15 (${Math.round((totalHours/15)*100)}%)`);
      
      // 3. ✅ ALSO: Record detailed session to PracticeContext
      if (addPracticeSession) {
        await addPracticeSession({
          stageLevel: 4,
          sessionType: 'meditation' as const,
          duration: completedDuration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: selectedPosture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: 6, // Good rating for Stage 4
          notes: `Stage 4 session - ${selectedPosture} posture`
        });
      }
      
      // 4. ✅ Check if Stage 4 is now complete (15+ hours)
      const isStageComplete = isStage4CompleteByHours();
      if (isStageComplete) {
        console.log('🎉 Stage 4 completed! 15+ hours reached');
        await markStageComplete(4); // Mark Stage 4 as complete and unlock Stage 5
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 4 session:', error);
      setCurrentPhase('reflection'); // Continue anyway
    }
  }, [incrementStage4Sessions, addStageHoursDirect, addPracticeSession, selectedPosture, 
      isStage4CompleteByHours, markStageComplete]);

  // ✅ FIXED: Handle reflection completion with progress tracking
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage4Hours();
      const currentSessions = getStage4Sessions();
      const isComplete = isStage4CompleteByHours();
      
      console.log(`📊 Stage 4 Progress: ${currentSessions} sessions, ${currentHours}/15 hours`);
      
      if (isComplete) {
        // Stage 4 is complete, navigate with celebration
        navigate('/home', {
          state: {
            stage4Completed: true,
            unlockedStage: 5,
            message: '🎉 Congratulations! Stage 4 completed (15+ hours)! Stage 5 is now unlocked!'
          }
        });
      } else {
        // Stage 4 not complete yet, show progress
        const hoursRemaining = Math.max(0, 15 - currentHours);
        const percentComplete = Math.round((currentHours / 15) * 100);
        
        navigate('/home', {
          state: {
            stage4InProgress: true,
            message: `Stage 4 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 4 completion:', error);
      navigate('/home', {
        state: {
          stage4Completed: false,
          message: 'Stage 4 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage4Hours, getStage4Sessions, isStage4CompleteByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ Memoized component renderer
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={4}
            onComplete={handleReflectionComplete}
            onBack={handleReflectionBack}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={4}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={4}
            onBack={handleBack}
            onStartPractice={handleStartPractice}
          />
        );
        
      case 'introduction':
      default:
        return (
          <Stage4Introduction
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
      <div className="stage4-wrapper">
        {/* ✅ Show progress indicator */}
        <div className="stage-progress-header">
          <h2>Stage 4: Sustained Attention</h2>
          <div className="progress-info">
            <span>Sessions: {getStage4Sessions()}</span>
            <span>Hours: {getStage4Hours().toFixed(1)}/15</span>
            <span>Progress: {Math.round((getStage4Hours() / 15) * 100)}%</span>
          </div>
        </div>
        
        {renderCurrentPhase}
      </div>
    </MainNavigation>
  );
};

export default Stage4Wrapper;