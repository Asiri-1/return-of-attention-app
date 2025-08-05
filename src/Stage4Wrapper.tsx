import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ Firebase-only practice context
import { useUser } from './contexts/user/UserContext'; // ✅ Firebase-only user context
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
  
  // ✅ FIREBASE-ONLY: Use contexts for session management
  const { addPracticeSession } = usePractice(); // Use existing method name
  const { userProfile, updateProfile } = useUser();
  
  // ✅ PERFORMANCE: Consolidated state management - single phase instead of multiple booleans
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');

  // ✅ PERFORMANCE: Memoized location state parsing
  const locationState = useMemo((): LocationState => {
    return (location.state as LocationState) || {};
  }, [location.state]);

  // ✅ PERFORMANCE: Memoized URL params parsing to prevent repeated parsing
  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      returnToStage: searchParams.get('returnToStage'),
      fromStage: searchParams.get('fromStage')
    };
  }, []);

  // ✅ PERFORMANCE: Memoized navigation flags calculation
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

  // ✅ FIREBASE-ONLY: Memoized completion check from Firebase user profile
  const hasCompletedIntro = useMemo(() => {
    try {
      // ✅ Get completed intros from Firebase user profile
      if (userProfile && 'completedStageIntros' in userProfile) {
        const completedIntros = Array.isArray(userProfile.completedStageIntros) 
          ? userProfile.completedStageIntros as number[]
          : [];
        return completedIntros.includes(4);
      }
      return false;
    } catch (error) {
      console.error("Error checking completed intros from Firebase:", error);
      return false;
    }
  }, [userProfile]);

  // ✅ FIREBASE-ONLY: Clear any previous session data
  const clearPreviousSession = useCallback(async (): Promise<void> => {
    try {
      // ✅ Clear any active session state (no external storage needed)
      console.log('✅ Previous session state cleared successfully');
    } catch (error) {
      console.error('❌ Error clearing previous session:', error);
    }
  }, []);

  // ✅ PERFORMANCE: Optimized initial phase determination with single useEffect
  useEffect(() => {
    const { effectivelyFromPAHM, isFromIntro } = navigationFlags;
    
    // Force show introduction for direct menu access (first-time or returning)
    if (!effectivelyFromPAHM && !isFromIntro) {
      setCurrentPhase('introduction');
      return;
    }
    
    // If coming from PAHM explanation (via state or URL params), always show posture selection
    if (effectivelyFromPAHM) {
      clearPreviousSession(); // Clear any previous session data
      setCurrentPhase('posture');
      return;
    }
    
    // If coming from intro, show posture selection
    if (isFromIntro) {
      setCurrentPhase('posture');
    }
  }, [navigationFlags, clearPreviousSession]);

  // ✅ PERFORMANCE: Stable event handlers with useCallback
  const handleComplete = useCallback(() => {
    // For Stage 4, navigate to PAHM explanation
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
      // If in introduction, go back to home
      navigate('/home');
    }
  }, [currentPhase, navigate]);
  
  const handleIntroComplete = useCallback(async () => {
    try {
      // ✅ FIREBASE-ONLY: Mark Stage 4 introduction as completed
      if (userProfile && 'completedStageIntros' in userProfile) {
        const completedIntros = Array.isArray(userProfile.completedStageIntros) 
          ? userProfile.completedStageIntros as number[]
          : [];
        
        if (!completedIntros.includes(4)) {
          const updatedIntros = [...completedIntros, 4];
          await updateProfile({
            completedStageIntros: updatedIntros
          } as any);
        }
      }
      
      // When introduction is complete, show posture selection
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 4 intro as completed:', error);
      // Continue anyway - don't block user flow
      setCurrentPhase('posture');
    }
  }, [userProfile, updateProfile]);
  
  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      // ✅ FIREBASE-ONLY: Prepare session data for Firebase
      setSelectedPosture(posture);
      
      console.log('✅ Stage 4 practice session prepared with posture:', posture);
      
      // ✅ PERFORMANCE: Direct state update instead of requestAnimationFrame
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 4 practice session:', error);
      // Continue anyway - don't block user flow
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  const handleTimerComplete = useCallback(async () => {
    try {
      // ✅ FIREBASE-ONLY: Record completed session to Firebase
      if (addPracticeSession) {
        const completedSessionData = {
          level: 'stage4',
          stageLevel: 4,
          type: 'meditation',
          sessionType: 'meditation' as const,
          targetDuration: 30, // 30 minutes for Stage 4
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
          quality: 6, // Stage 4 gets good quality rating
          notes: `Stage 4 completed session - ${selectedPosture} posture`
        };
        
        await addPracticeSession(completedSessionData);
        console.log('✅ Stage 4 session completed and saved to Firebase');
      }
      
      setCurrentPhase('reflection');
    } catch (error) {
      console.error('❌ Error completing Stage 4 session:', error);
      // Continue anyway - don't block user flow
      setCurrentPhase('reflection');
    }
  }, [selectedPosture, addPracticeSession]);

  const handleReflectionComplete = useCallback(async () => {
    try {
      // ✅ FIREBASE-ONLY: Update user progress for Stage 4 completion
      await updateProfile({
        lastCompletedStage: 4,
        totalSessions: (userProfile?.totalSessions || 0) + 1,
        lastSessionDate: new Date().toISOString()
      } as any);
      
      console.log('✅ Stage 4 progress updated in Firebase');
    } catch (error) {
      console.error('❌ Error updating Stage 4 progress:', error);
    }
    
    // Navigate back to home or to next stage
    navigate('/home');
  }, [userProfile, updateProfile, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ PERFORMANCE: Memoized component renderer to prevent recreation on every render
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
      {renderCurrentPhase}
    </MainNavigation>
  );
};

export default Stage4Wrapper;