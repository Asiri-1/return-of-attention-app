// ✅ COMPLETE FIREBASE-ONLY Stage2Wrapper.tsx - No localStorage/sessionStorage conflicts
// File: src/Stage2Wrapper.tsx
// 🔄 FIREBASE-ONLY: All data flows through Firebase contexts

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ Firebase-only practice context
import { useUser } from './contexts/user/UserContext'; // ✅ Firebase-only user context
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

const Stage2Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIREBASE-ONLY: Use contexts for session management
  const { addPracticeSession } = usePractice(); // Use existing method name
  const { userProfile, updateProfile } = useUser();
  
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

  const handleIntroductionComplete = useCallback(async () => {
    try {
      // ✅ FIREBASE-ONLY: Mark Stage 2 introduction as completed
      if (userProfile && 'completedStageIntros' in userProfile) {
        const completedIntros = Array.isArray(userProfile.completedStageIntros) 
          ? userProfile.completedStageIntros as number[]
          : [];
        
        if (!completedIntros.includes(2)) {
          const updatedIntros = [...completedIntros, 2];
          await updateProfile({
            completedStageIntros: updatedIntros
          } as any);
        }
      }
      
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 2 intro as completed:', error);
      // Continue anyway - don't block user flow
      setCurrentPhase('posture');
    }
  }, [userProfile, updateProfile]);

  const handlePostureSelected = useCallback((posture: string) => {
    setSelectedPosture(posture);
    setCurrentPhase('timer');
  }, []);

  const handleTimerComplete = useCallback(async () => {
    try {
      // ✅ FIREBASE-ONLY: Record completed session to Firebase
      if (addPracticeSession) {
        const completedSessionData = {
          level: 'stage2',
          stageLevel: 2,
          type: 'meditation',
          sessionType: 'meditation' as const,
          targetDuration: 30, // 30 minutes for Stage 2
          timeSpent: 30, // Completed duration
          duration: 30,
          isCompleted: true,
          timestamp: new Date().toISOString(),
          environment: {
            posture: selectedPosture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          quality: 4, // Stage 2 gets basic quality rating
          notes: `Stage 2 completed session - ${selectedPosture} posture`
        };
        
        await addPracticeSession(completedSessionData);
        console.log('✅ Stage 2 session completed and saved to Firebase');
      }
      
      setCurrentPhase('reflection');
    } catch (error) {
      console.error('❌ Error completing Stage 2 session:', error);
      // Continue anyway - don't block user flow
      setCurrentPhase('reflection');
    }
  }, [selectedPosture, addPracticeSession]);

  const handleReflectionComplete = useCallback(async () => {
    try {
      console.log('🎯 Stage 2 completed, updating Firebase...');
      
      // ✅ FIREBASE-ONLY: Set Stage 2 completion and unlock Stage 3
      await updateProfile({
        currentStage: 3, // Unlock Stage 3
        lastCompletedStage: 2,
        totalSessions: (userProfile?.totalSessions || 0) + 1,
        lastSessionDate: new Date().toISOString(),
        stage2Completed: true,
        stage2CompletedAt: new Date().toISOString()
      } as any);
      
      console.log('✅ Stage 2 completed, Stage 3 unlocked in Firebase');
      
      // Navigate back to home dashboard
      navigate('/home', {
        state: {
          stage2Completed: true,
          unlockedStage: 3,
          message: 'Congratulations! Stage 3 is now unlocked!'
        }
      });
      
    } catch (error) {
      console.error('❌ Error saving Stage 2 completion to Firebase:', error);
      // Still navigate to show completion
      navigate('/home', {
        state: {
          stage2Completed: true,
          message: 'Stage 2 completed! (Sync pending)'
        }
      });
    }
  }, [userProfile, updateProfile, navigate]);

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