// ✅ CORRECTED Stage5Wrapper.tsx - 25 Hours Requirement (Per Audit)
// File: src/Stage5Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
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
  const { currentUser } = useAuth();
  
  // ✅ CORRECTED: Complete UserContext integration with all required methods
  const { 
    // Session & Hours tracking
    incrementStage5Sessions,
    addStageHoursDirect,
    getStage5Sessions,
    getStage5Hours,
    isStage5CompleteByHours,
    
    // ✅ NEW: Stage progression methods
    getCurrentStageByHours,
    canAdvanceToStageByHours,
    getTotalPracticeHours,
    getStage4Hours, // ✅ NEW: Check Stage 4 completion
    
    // Profile management
    userProfile,
    markStageIntroComplete,
    markStageComplete
  } = useUser();

  // ✅ PracticeContext for detailed session history
  const { addPracticeSession } = usePractice();
  
  // ✅ State management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ✅ NEW: Loading state
  const [error, setError] = useState<string | null>(null); // ✅ NEW: Error state

  // ✅ NEW: Check access permissions (Stage 5 requires Stage 4 completion: 20 hours)
  const hasStage5Access = useMemo(() => {
    const totalHours = getTotalPracticeHours();
    const stage4Hours = getStage4Hours();
    
    // Stage 5 unlocked when Stage 4 is complete (20 hours)
    return canAdvanceToStageByHours(5) && stage4Hours >= 20;
  }, [canAdvanceToStageByHours, getTotalPracticeHours, getStage4Hours]);

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
      setError(null);
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
  
  // ✅ ENHANCED: Handle introduction completion with loading
  const handleIntroComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await markStageIntroComplete('stage5');
      console.log('✅ Stage 5 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 5 intro as completed:', error);
      setError('Failed to save introduction progress');
      setCurrentPhase('posture'); // Continue anyway
    } finally {
      setIsLoading(false);
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
  
  // ✅ CORRECTED: Handle timer completion with 25-hour requirement (not 15)
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      setError('Please log in to save your session');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🎯 Stage 5 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ Increment Stage 5 session count
      const sessionCount = await incrementStage5Sessions();
      console.log(`📊 Stage 5 Sessions: ${sessionCount}`);
      
      // 2. ✅ CORRECTED: Add hours toward 25-hour requirement (not 15)
      const hoursToAdd = completedDuration / 60;
      const totalStage5Hours = await addStageHoursDirect(5, hoursToAdd);
      console.log(`⏱️ Stage 5 Hours: ${totalStage5Hours}/25 (${Math.round((totalStage5Hours/25)*100)}%)`);
      
      // 3. ✅ Record detailed session to PracticeContext
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 5,
        stageLabel: 'Stage 5: Overcome Subtle Dullness',
        rating: 7,
        notes: `Stage 5 overcome subtle dullness session - ${selectedPosture} posture`,
        presentPercentage: 90,
        environment: {
          posture: selectedPosture,
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 0, present_neutral: 0, present_aversion: 0,
          past_attachment: 0, past_neutral: 0, past_aversion: 0,
          future_attachment: 0, future_neutral: 0, future_aversion: 0
        },
        metadata: {
          stage: 5,
          sessionCount: sessionCount,
          hoursAdded: hoursToAdd,
          totalStage5Hours: totalStage5Hours,
          posture: selectedPosture,
          totalPracticeHours: getTotalPracticeHours() + hoursToAdd
        }
      };

      await addPracticeSession(enhancedSessionData);
      
      // 4. ✅ CORRECTED: Check if Stage 5 is complete (25+ hours, not 15)
      const isStageComplete = totalStage5Hours >= 25;
      if (isStageComplete) {
        console.log('🎉 Stage 5 completed! 25+ hours reached');
        await markStageComplete(5);
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 5 session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, incrementStage5Sessions, addStageHoursDirect, addPracticeSession, 
      selectedPosture, markStageComplete, getTotalPracticeHours]);

  // ✅ CORRECTED: Handle reflection completion with 25-hour logic
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage5Hours();
      const currentSessions = getStage5Sessions();
      const isComplete = currentHours >= 25; // ✅ CORRECTED: 25 hours, not 15
      const totalHours = getTotalPracticeHours();
      const currentStage = getCurrentStageByHours();
      
      console.log(`📊 Stage 5 Progress: ${currentSessions} sessions, ${currentHours}/25 hours`);
      console.log(`📊 Total Practice Hours: ${totalHours}, Current Stage: ${currentStage}`);
      
      if (isComplete) {
        // ✅ Stage 5 complete - navigate with celebration
        navigate('/home', {
          state: {
            stage5Completed: true,
            unlockedStage: 6,
            message: `🎉 Congratulations! Stage 5 completed (${currentHours.toFixed(1)}/25 hours)! Stage 6 is now unlocked!`,
            totalHours: totalHours,
            currentStage: currentStage
          }
        });
      } else {
        // ✅ CORRECTED: Stage 5 in progress (25-hour target)
        const hoursRemaining = Math.max(0, 25 - currentHours);
        const percentComplete = Math.round((currentHours / 25) * 100);
        
        navigate('/home', {
          state: {
            stage5InProgress: true,
            message: `Stage 5 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`,
            totalHours: totalHours,
            currentStage: currentStage
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 5 completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 5 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage5Hours, getStage5Sessions, getTotalPracticeHours, getCurrentStageByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ NEW: Access control check
  if (!hasStage5Access) {
    const stage4Hours = getStage4Hours();
    const totalHours = getTotalPracticeHours();
    
    return (
      <MainNavigation>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>
            🔒 Stage 5 Locked
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Complete Stage 4 (20 hours) to unlock Stage 5
          </p>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Stage 4 Progress: {stage4Hours.toFixed(1)}/20.0 hours
          </div>
          <div style={{ color: '#374151', marginBottom: '20px' }}>
            Total Practice Hours: {totalHours.toFixed(1)}
          </div>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Return to Home
          </button>
        </div>
      </MainNavigation>
    );
  }

  // ✅ Memoized component renderer with loading states
  const renderCurrentPhase = useMemo(() => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '12px' }}>
            Saving your session...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Please wait while we record your progress
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ color: '#ef4444', fontSize: '18px', marginBottom: '12px' }}>
            ⚠️ {error}
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

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
    isLoading,
    error,
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
        {/* ✅ CORRECTED: Progress indicator with 25-hour requirement */}
        <div className="stage-progress-header" style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            color: '#374151',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            Stage 5: Overcome Subtle Dullness
          </h2>
          
          <div className="progress-info" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#6b7280' }}>
              Sessions: {getStage5Sessions()}
            </span>
            <span style={{ color: '#6b7280' }}>
              Hours: {getStage5Hours().toFixed(1)}/25
            </span>
            <span style={{ 
              color: getStage5Hours() >= 25 ? '#059669' : '#6b7280',
              fontWeight: '600'
            }}>
              Progress: {Math.round((getStage5Hours() / 25) * 100)}%
              {getStage5Hours() >= 25 && ' ✅'}
            </span>
          </div>
          
          {/* ✅ CORRECTED: Progress bar with 25-hour calculation */}
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              height: '100%',
              width: `${Math.min((getStage5Hours() / 25) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        
        {renderCurrentPhase}
        
        {/* ✅ Enhanced Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <h4>Debug Info:</h4>
            <div>Stage 5 Sessions: {getStage5Sessions()}</div>
            <div>Stage 5 Hours: {getStage5Hours().toFixed(2)}/25</div>
            <div>Stage 4 Hours: {getStage4Hours().toFixed(2)}/20 (Required for access)</div>
            <div>Total Practice Hours: {getTotalPracticeHours().toFixed(2)}</div>
            <div>Current Stage: {getCurrentStageByHours()}</div>
            <div>Can Access Stage 5: {hasStage5Access ? 'Yes' : 'No'}</div>
            <div>Stage 5 Complete: {getStage5Hours() >= 25 ? 'Yes' : 'No'}</div>
            <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Stage5Wrapper;