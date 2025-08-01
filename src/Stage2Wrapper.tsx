// ✅ COMPLETE FIXED Stage2Wrapper.js - Correct Navigation & Progression Logic
// File: src/Stage2Wrapper.js
// 🔄 REPLACE YOUR ENTIRE STAGE2WRAPPER.JS WITH THIS CODE

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

const Stage2Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ PERFORMANCE: Type-safe state management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState<string>('');

  // ✅ PERFORMANCE: Stable event handlers with useCallback to prevent child re-renders
  const handleBack = useCallback(() => {
    if (currentPhase === 'introduction') {
      navigate('/home'); // ✅ FIXED: Navigate to /home instead of navigate(-1)
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    }
  }, [currentPhase, navigate]);

  const handleIntroductionComplete = useCallback(() => {
    setCurrentPhase('posture');
  }, []);

  const handlePostureSelected = useCallback((posture: string) => {
    setSelectedPosture(posture);
    setCurrentPhase('timer');
  }, []);

  const handleTimerComplete = useCallback(() => {
    setCurrentPhase('reflection');
  }, []);

  const handleReflectionComplete = useCallback(() => {
    // ✅ FIXED: Set Stage 2 completion and unlock Stage 3
    try {
      console.log('🎯 Stage 2 completed, setting completion flags...');
      
      // Mark Stage 2 as completed
      localStorage.setItem('stage2Complete', 'true');
      sessionStorage.setItem('stage2Complete', 'true');
      
      // Update stage progress to 3 (unlocks Stage 3)
      localStorage.setItem('stageProgress', '3');
      sessionStorage.setItem('stageProgress', '3');
      localStorage.setItem('devCurrentStage', '3');
      sessionStorage.setItem('devCurrentStage', '3');
      
      // Update current stage for dashboard
      localStorage.setItem('currentStage', '3');
      
      // Set completion timestamp
      localStorage.setItem('stage2CompletedAt', new Date().toISOString());
      
      console.log('✅ Stage 2 completed, Stage 3 unlocked');
      
      // Navigate back to home dashboard
      navigate('/home', {
        state: {
          stage2Completed: true,
          unlockedStage: 3,
          message: 'Congratulations! Stage 3 is now unlocked!'
        }
      });
      
    } catch (error) {
      console.error('Error saving Stage 2 completion:', error);
      navigate('/home'); // Navigate anyway
    }
  }, [navigate]);

  // ✅ PERFORMANCE: Memoized phase renderer to prevent recreation on every render
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
        {renderCurrentPhase}
      </div>
    </MainNavigation>
  );
};

export default Stage2Wrapper;