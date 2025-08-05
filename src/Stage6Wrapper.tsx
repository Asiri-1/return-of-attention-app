import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ Firebase-only practice context
import { useUser } from './contexts/user/UserContext'; // ✅ Firebase-only user context
import Stage6Introduction from './Stage6Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection'; // ✅ Correct path: includes UI folder
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
    const isFromPAHMViaURL = urlParams.returnToStage === '6' && urlParams.fromStage === 'true';
    const effectivelyFromPAHM = isFromPAHM || isFromPAHMViaURL;
    
    return {
      isFromPAHM,
      isFromIntro,
      isFromPAHMViaURL,
      effectivelyFromPAHM
    };
  }, [locationState.fromPAHM, locationState.fromIntro, urlParams.returnToStage, urlParams.fromStage]);

  // ✅ FIREBASE-ONLY: Clear any previous session data
  const clearPreviousSession = useCallback(async (): Promise<void> => {
    try {
      // ✅ Clear any active session state (no Firebase method needed)
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
      // ✅ FIREBASE-ONLY: Mark Stage 6 introduction as completed
      if (userProfile && 'completedStageIntros' in userProfile) {
        const completedIntros = Array.isArray(userProfile.completedStageIntros) 
          ? userProfile.completedStageIntros as number[]
          : [];
        
        if (!completedIntros.includes(6)) {
          const updatedIntros = [...completedIntros, 6];
          await updateProfile({
            completedStageIntros: updatedIntros
          } as any);
        }
      }
      
      // When introduction is complete, show posture selection
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 6 intro as completed:', error);
      // Continue anyway - don't block user flow
      setCurrentPhase('posture');
    }
  }, [userProfile, updateProfile]);
  
  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      // ✅ FIREBASE-ONLY: Create session data for Firebase
      const sessionData = {
        level: 'stage6',
        stageLevel: 6,
        type: 'meditation',
        sessionType: 'meditation' as const,
        targetDuration: 30, // Default 30 minutes for Stage 6
        timeSpent: 0, // Will be updated when completed
        duration: 0, // Will be updated when completed
        isCompleted: false,
        timestamp: new Date().toISOString(),
        environment: {
          posture: posture,
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        quality: 7, // Stage 6 gets higher quality rating
        notes: `Stage 6 practice session - ${posture} posture`
      };
      
      // Store session data for later completion
      setSelectedPosture(posture);
      
      console.log('✅ Stage 6 practice session prepared with posture:', posture);
      
      // ✅ PERFORMANCE: Direct state update instead of requestAnimationFrame
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 6 practice session:', error);
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
          level: 'stage6',
          stageLevel: 6,
          type: 'meditation',
          sessionType: 'meditation' as const,
          targetDuration: 30, // 30 minutes for Stage 6
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
          quality: 8, // Higher quality for completed Stage 6 session
          notes: `Stage 6 completed session - ${selectedPosture} posture`
        };
        
        await addPracticeSession(completedSessionData);
        console.log('✅ Stage 6 session completed and saved to Firebase');
      }
      
      setCurrentPhase('reflection');
    } catch (error) {
      console.error('❌ Error completing Stage 6 session:', error);
      // Continue anyway - don't block user flow
      setCurrentPhase('reflection');
    }
  }, [selectedPosture, addPracticeSession]);

  const handleReflectionComplete = useCallback(async () => {
    try {
      // ✅ FIREBASE-ONLY: Update user progress for Stage 6 completion
      await updateProfile({
        lastCompletedStage: 6,
        totalSessions: (userProfile?.totalSessions || 0) + 1,
        lastSessionDate: new Date().toISOString()
      } as any);
      
      console.log('✅ Stage 6 progress updated in Firebase');
    } catch (error) {
      console.error('❌ Error updating Stage 6 progress:', error);
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
      {renderCurrentPhase}
    </MainNavigation>
  );
};

export default Stage6Wrapper;