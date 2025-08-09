// ✅ FIXED Stage2Wrapper.tsx - Uses UserContext session tracking for 15-hour requirement
// File: src/Stage2Wrapper.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ For detailed session history
import { useUser } from './contexts/user/UserContext'; // ✅ For session counting and hours tracking
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

const Stage2Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Use UserContext for session counting and hours tracking (15-hour requirement)
  const { 
    incrementStage2Sessions,
    addStageHoursDirect,
    getStage2Sessions,
    getStage2Hours,
    isStage2CompleteByHours,
    userProfile,
    markStageIntroComplete,
    markStageComplete
  } = useUser();

  // ✅ Keep PracticeContext for detailed session recording
  const { addPracticeSession } = usePractice();
  
  // ✅ State management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState<string>('');

  // ✅ Handle back navigation
  const handleBack = useCallback(() => {
    if (currentPhase === 'introduction') {
      navigate('/home');
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    }
  }, [currentPhase, navigate]);

  // ✅ Handle introduction completion
  const handleIntroductionComplete = useCallback(async () => {
    try {
      // ✅ FIXED: Mark Stage 2 introduction as completed using UserContext
      await markStageIntroComplete('stage2');
      console.log('✅ Stage 2 introduction marked as completed');
      
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 2 intro as completed:', error);
      setCurrentPhase('posture'); // Continue anyway
    }
  }, [markStageIntroComplete]);

  // ✅ Handle posture selection
  const handlePostureSelected = useCallback((posture: string) => {
    setSelectedPosture(posture);
    setCurrentPhase('timer');
  }, []);

  // ✅ FIXED: Handle timer completion with proper session and hours tracking
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    try {
      console.log(`🎯 Stage 2 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ CRITICAL: Increment Stage 2 session count (persists after logout)
      const sessionCount = await incrementStage2Sessions();
      console.log(`📊 Stage 2 Sessions: ${sessionCount}`);
      
      // 2. ✅ CRITICAL: Add hours to Stage 2 for 15-hour requirement
      const hoursToAdd = completedDuration / 60; // Convert minutes to hours
      const totalHours = await addStageHoursDirect(2, hoursToAdd);
      console.log(`⏱️ Stage 2 Hours: ${totalHours}/15 (${Math.round((totalHours/15)*100)}%)`);
      
      // 3. ✅ ALSO: Record detailed session to PracticeContext
      if (addPracticeSession) {
        await addPracticeSession({
          stageLevel: 2,
          sessionType: 'meditation' as const,
          duration: completedDuration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: selectedPosture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: 4, // Default rating for Stage 2
          notes: `Stage 2 session - ${selectedPosture} posture`
        });
      }
      
      // 4. ✅ Check if Stage 2 is now complete (15+ hours)
      const isStageComplete = isStage2CompleteByHours();
      if (isStageComplete) {
        console.log('🎉 Stage 2 completed! 15+ hours reached');
        await markStageComplete(2); // Mark Stage 2 as complete and unlock Stage 3
      }
      
      // Store completion and continue to reflection
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 2 session:', error);
      setCurrentPhase('reflection'); // Continue anyway
    }
  }, [incrementStage2Sessions, addStageHoursDirect, addPracticeSession, selectedPosture, 
      isStage2CompleteByHours, markStageComplete]);

  // ✅ Handle reflection completion
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage2Hours();
      const currentSessions = getStage2Sessions();
      const isComplete = isStage2CompleteByHours();
      
      console.log(`📊 Stage 2 Progress: ${currentSessions} sessions, ${currentHours}/15 hours`);
      
      if (isComplete) {
        // Stage 2 is complete, navigate with celebration
        navigate('/home', {
          state: {
            stage2Completed: true,
            unlockedStage: 3,
            message: '🎉 Congratulations! Stage 2 completed (15+ hours)! Stage 3 is now unlocked!'
          }
        });
      } else {
        // Stage 2 not complete yet, show progress
        const hoursRemaining = Math.max(0, 15 - currentHours);
        const percentComplete = Math.round((currentHours / 15) * 100);
        
        navigate('/home', {
          state: {
            stage2InProgress: true,
            message: `Stage 2 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 2 completion:', error);
      navigate('/home', {
        state: {
          stage2Completed: false,
          message: 'Stage 2 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage2Hours, getStage2Sessions, isStage2CompleteByHours, navigate]);

  // ✅ Memoized phase renderer
  const renderCurrentPhase = useMemo(() => {
    switch (currentPhase) {
      case 'introduction':
        return (
          <Stage2Introduction
            onComplete={handleIntroductionComplete}
            onBack={handleBack}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={2}
            onBack={handleBack}
            onStartPractice={handlePostureSelected}
          />
        );
        
      case 'timer':
        return (
          <UniversalPAHMTimer
            stageLevel={2}
            onComplete={handleTimerComplete}
            onBack={handleBack}
            posture={selectedPosture}
          />
        );
        
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={2}
            onComplete={handleReflectionComplete}
            onBack={handleBack}
          />
        );
        
      default:
        return null;
    }
  }, [
    currentPhase,
    selectedPosture,
    handleBack,
    handleIntroductionComplete,
    handlePostureSelected,
    handleTimerComplete,
    handleReflectionComplete
  ]);

  return (
    <MainNavigation>
      <div className="stage2-wrapper">
        {/* ✅ Show progress indicator */}
        <div className="stage-progress-header">
          <h2>Stage 2: Breath Awareness</h2>
          <div className="progress-info">
            <span>Sessions: {getStage2Sessions()}</span>
            <span>Hours: {getStage2Hours().toFixed(1)}/15</span>
            <span>Progress: {Math.round((getStage2Hours() / 15) * 100)}%</span>
          </div>
        </div>
        
        {renderCurrentPhase}
      </div>
    </MainNavigation>
  );
};

export default Stage2Wrapper;