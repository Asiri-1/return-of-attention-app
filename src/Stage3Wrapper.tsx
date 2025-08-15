// ✅ ENHANCED Stage3Wrapper.tsx - Complete with Access Control & Loading States
// File: src/Stage3Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
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
  const { currentUser } = useAuth();
  
  // ✅ ENHANCED: Complete UserContext integration with all required methods
  const { 
    // Session & Hours tracking
    incrementStage3Sessions,
    addStageHoursDirect,
    getStage3Sessions,
    getStage3Hours,
    isStage3CompleteByHours,
    
    // ✅ NEW: Stage progression methods
    getCurrentStageByHours,
    canAdvanceToStageByHours,
    getTotalPracticeHours,
    getStage2Hours, // ✅ NEW: Check Stage 2 completion
    
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

  // ✅ NEW: Check access permissions
  const hasStage3Access = useMemo(() => {
    const totalHours = getTotalPracticeHours();
    const stage2Hours = getStage2Hours();
    
    // Stage 3 unlocked when Stage 2 is complete (10 hours)
    return canAdvanceToStageByHours(3) && stage2Hours >= 10;
  }, [canAdvanceToStageByHours, getTotalPracticeHours, getStage2Hours]);

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
      setError(null); // Clear any previous errors
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
  
  // ✅ ENHANCED: Handle introduction completion with loading
  const handleIntroComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await markStageIntroComplete('stage3');
      console.log('✅ Stage 3 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 3 intro as completed:', error);
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
      console.log('✅ Stage 3 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 3 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  // ✅ ENHANCED: Handle timer completion with loading and error handling
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      setError('Please log in to save your session');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🎯 Stage 3 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ Increment Stage 3 session count
      const sessionCount = await incrementStage3Sessions();
      console.log(`📊 Stage 3 Sessions: ${sessionCount}`);
      
      // 2. ✅ Add hours to Stage 3 for 15-hour requirement
      const hoursToAdd = completedDuration / 60;
      const totalStage3Hours = await addStageHoursDirect(3, hoursToAdd);
      console.log(`⏱️ Stage 3 Hours: ${totalStage3Hours}/15 (${Math.round((totalStage3Hours/15)*100)}%)`);
      
      // 3. ✅ Record detailed session to PracticeContext
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 3,
        stageLabel: 'Stage 3: Sustained Attention',
        rating: 5,
        notes: `Stage 3 sustained attention session - ${selectedPosture} posture`,
        presentPercentage: 85,
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
          stage: 3,
          sessionCount: sessionCount,
          hoursAdded: hoursToAdd,
          totalStage3Hours: totalStage3Hours,
          posture: selectedPosture,
          totalPracticeHours: getTotalPracticeHours() + hoursToAdd
        }
      };

      await addPracticeSession(enhancedSessionData);
      
      // 4. ✅ Check if Stage 3 is complete (15+ hours)
      const isStageComplete = totalStage3Hours >= 15;
      if (isStageComplete) {
        console.log('🎉 Stage 3 completed! 15+ hours reached');
        await markStageComplete(3);
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 3 session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, incrementStage3Sessions, addStageHoursDirect, addPracticeSession, 
      selectedPosture, markStageComplete, getTotalPracticeHours]);

  // ✅ ENHANCED: Handle reflection completion with comprehensive progress tracking
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage3Hours();
      const currentSessions = getStage3Sessions();
      const isComplete = currentHours >= 15;
      const totalHours = getTotalPracticeHours();
      const currentStage = getCurrentStageByHours();
      
      console.log(`📊 Stage 3 Progress: ${currentSessions} sessions, ${currentHours}/15 hours`);
      console.log(`📊 Total Practice Hours: ${totalHours}, Current Stage: ${currentStage}`);
      
      if (isComplete) {
        // ✅ Stage 3 complete - navigate with celebration
        navigate('/home', {
          state: {
            stage3Completed: true,
            unlockedStage: 4,
            message: `🎉 Congratulations! Stage 3 completed (${currentHours.toFixed(1)}/15 hours)! Stage 4 is now unlocked!`,
            totalHours: totalHours,
            currentStage: currentStage
          }
        });
      } else {
        // ✅ Stage 3 in progress
        const hoursRemaining = Math.max(0, 15 - currentHours);
        const percentComplete = Math.round((currentHours / 15) * 100);
        
        navigate('/home', {
          state: {
            stage3InProgress: true,
            message: `Stage 3 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`,
            totalHours: totalHours,
            currentStage: currentStage
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 3 completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 3 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage3Hours, getStage3Sessions, getTotalPracticeHours, getCurrentStageByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ NEW: Access control check
  if (!hasStage3Access) {
    const stage2Hours = getStage2Hours();
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
            🔒 Stage 3 Locked
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Complete Stage 2 (10 hours) to unlock Stage 3
          </p>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Stage 2 Progress: {stage2Hours.toFixed(1)}/10.0 hours
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

  // ✅ ENHANCED: Memoized component renderer with loading states
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
      <div className="stage3-wrapper">
        {/* ✅ ENHANCED: Progress indicator with better styling */}
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
            Stage 3: Sustained Attention
          </h2>
          
          <div className="progress-info" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#6b7280' }}>
              Sessions: {getStage3Sessions()}
            </span>
            <span style={{ color: '#6b7280' }}>
              Hours: {getStage3Hours().toFixed(1)}/15
            </span>
            <span style={{ 
              color: getStage3Hours() >= 15 ? '#059669' : '#6b7280',
              fontWeight: '600'
            }}>
              Progress: {Math.round((getStage3Hours() / 15) * 100)}%
              {getStage3Hours() >= 15 && ' ✅'}
            </span>
          </div>
          
          {/* ✅ Progress bar */}
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              height: '100%',
              width: `${Math.min((getStage3Hours() / 15) * 100, 100)}%`,
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
            <div>Stage 3 Sessions: {getStage3Sessions()}</div>
            <div>Stage 3 Hours: {getStage3Hours().toFixed(2)}/15</div>
            <div>Stage 2 Hours: {getStage2Hours().toFixed(2)}/10 (Required for access)</div>
            <div>Total Practice Hours: {getTotalPracticeHours().toFixed(2)}</div>
            <div>Current Stage: {getCurrentStageByHours()}</div>
            <div>Can Access Stage 3: {hasStage3Access ? 'Yes' : 'No'}</div>
            <div>Stage 3 Complete: {getStage3Hours() >= 15 ? 'Yes' : 'No'}</div>
            <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Stage3Wrapper;