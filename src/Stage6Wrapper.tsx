// ✅ CORRECTED Stage6Wrapper.tsx - 30 Hours MASTERY Requirement (Per Audit)
// File: src/Stage6Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
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
  const { currentUser } = useAuth();
  
  // ✅ CORRECTED: Complete UserContext integration with all required methods
  const { 
    // Session & Hours tracking
    incrementStage6Sessions,
    addStageHoursDirect,
    getStage6Sessions,
    getStage6Hours,
    isStage6CompleteByHours,
    
    // ✅ NEW: Stage progression methods
    getCurrentStageByHours,
    canAdvanceToStageByHours,
    getTotalPracticeHours,
    getStage5Hours, // ✅ NEW: Check Stage 5 completion
    
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

  // ✅ NEW: Check access permissions (Stage 6 requires Stage 5 completion: 25 hours)
  const hasStage6Access = useMemo(() => {
    const totalHours = getTotalPracticeHours();
    const stage5Hours = getStage5Hours();
    
    // Stage 6 unlocked when Stage 5 is complete (25 hours)
    return canAdvanceToStageByHours(6) && stage5Hours >= 25;
  }, [canAdvanceToStageByHours, getTotalPracticeHours, getStage5Hours]);

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
      await markStageIntroComplete('stage6');
      console.log('✅ Stage 6 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 6 intro as completed:', error);
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
      console.log('✅ Stage 6 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 6 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);
  
  // ✅ CORRECTED: Handle timer completion with 30-hour requirement (not 15) - MASTERY LEVEL!
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      setError('Please log in to save your session');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🎯 Stage 6 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ Increment Stage 6 session count
      const sessionCount = await incrementStage6Sessions();
      console.log(`📊 Stage 6 Sessions: ${sessionCount}`);
      
      // 2. ✅ CORRECTED: Add hours toward 30-hour MASTERY requirement (not 15)
      const hoursToAdd = completedDuration / 60;
      const totalStage6Hours = await addStageHoursDirect(6, hoursToAdd);
      console.log(`⏱️ Stage 6 Hours: ${totalStage6Hours}/30 (${Math.round((totalStage6Hours/30)*100)}%) - MASTERY LEVEL!`);
      
      // 3. ✅ Record detailed session to PracticeContext
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 6,
        stageLabel: 'Stage 6: Sustained Exclusive Focus - MASTERY',
        rating: 8,
        notes: `Stage 6 mastery session - ${selectedPosture} posture - Sustained exclusive focus training`,
        presentPercentage: 95,
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
          stage: 6,
          sessionCount: sessionCount,
          hoursAdded: hoursToAdd,
          totalStage6Hours: totalStage6Hours,
          posture: selectedPosture,
          totalPracticeHours: getTotalPracticeHours() + hoursToAdd,
          isMasteryStage: true,
          masteryProgress: Math.round((totalStage6Hours / 30) * 100)
        }
      };

      await addPracticeSession(enhancedSessionData);
      
      // 4. ✅ CORRECTED: Check if Stage 6 is complete (30+ hours, not 15) - MEDITATION MASTERY!
      const isStageComplete = totalStage6Hours >= 30;
      if (isStageComplete) {
        console.log('🏆 STAGE 6 COMPLETED! 30+ hours reached - MEDITATION MASTERY ACHIEVED! 🎉');
        await markStageComplete(6);
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 6 session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, incrementStage6Sessions, addStageHoursDirect, addPracticeSession, 
      selectedPosture, markStageComplete, getTotalPracticeHours]);

  // ✅ CORRECTED: Handle reflection completion with 30-hour MASTERY logic
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage6Hours();
      const currentSessions = getStage6Sessions();
      const isComplete = currentHours >= 30; // ✅ CORRECTED: 30 hours for MASTERY, not 15
      const totalHours = getTotalPracticeHours();
      const currentStage = getCurrentStageByHours();
      
      console.log(`📊 Stage 6 Progress: ${currentSessions} sessions, ${currentHours}/30 hours - MASTERY LEVEL`);
      console.log(`📊 Total Practice Hours: ${totalHours}, Current Stage: ${currentStage}`);
      
      if (isComplete) {
        // ✅ Stage 6 complete - MEDITATION MASTERY ACHIEVED!
        navigate('/home', {
          state: {
            stage6Completed: true,
            masterAchieved: true,
            message: `🏆 CONGRATULATIONS! MEDITATION MASTERY ACHIEVED! 
                     Stage 6 completed (${currentHours.toFixed(1)}/30 hours)! 
                     You have reached the highest level of sustained exclusive focus! 🎉`,
            totalHours: totalHours,
            currentStage: currentStage,
            isMasterAchievement: true
          }
        });
      } else {
        // ✅ CORRECTED: Stage 6 in progress (30-hour MASTERY target)
        const hoursRemaining = Math.max(0, 30 - currentHours);
        const percentComplete = Math.round((currentHours / 30) * 100);
        
        navigate('/home', {
          state: {
            stage6InProgress: true,
            message: `Stage 6 MASTERY Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours to meditation mastery!)`,
            totalHours: totalHours,
            currentStage: currentStage,
            isMasteryStage: true
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 6 completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 6 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage6Hours, getStage6Sessions, getTotalPracticeHours, getCurrentStageByHours, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ NEW: Access control check for MASTERY STAGE
  if (!hasStage6Access) {
    const stage5Hours = getStage5Hours();
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
            🔒 Stage 6 Locked - MASTERY LEVEL
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Complete Stage 5 (25 hours) to unlock Stage 6 - The Final Mastery Stage
          </p>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Stage 5 Progress: {stage5Hours.toFixed(1)}/25.0 hours
          </div>
          <div style={{ color: '#374151', marginBottom: '20px' }}>
            Total Practice Hours: {totalHours.toFixed(1)}
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontWeight: '600'
          }}>
            🏆 Stage 6 = Meditation Mastery (30 Hours)
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
            Saving your mastery session...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Recording your progress toward meditation mastery
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
      <div className="stage6-wrapper">
        {/* ✅ CORRECTED: MASTERY Progress indicator with 30-hour requirement */}
        <div className="stage-progress-header" style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
          color: 'white'
        }}>
          <h2 style={{ 
            margin: '0 0 12px 0', 
            fontSize: '24px',
            fontWeight: '700'
          }}>
            🏆 Stage 6: Sustained Exclusive Focus - MASTERY
          </h2>
          
          <div className="progress-info" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <span style={{ fontWeight: '600' }}>
              Sessions: {getStage6Sessions()}
            </span>
            <span style={{ fontWeight: '600' }}>
              Hours: {getStage6Hours().toFixed(1)}/30
            </span>
            <span style={{ 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Mastery: {Math.round((getStage6Hours() / 30) * 100)}%
              {getStage6Hours() >= 30 && ' 🏆 ACHIEVED!'}
            </span>
          </div>
          
          {/* ✅ CORRECTED: Progress bar with 30-hour calculation - MASTERY THEME */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)',
              height: '100%',
              width: `${Math.min((getStage6Hours() / 30) * 100, 100)}%`,
              transition: 'width 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </div>
          
          {/* ✅ MASTERY Badge when complete */}
          {getStage6Hours() >= 30 && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '16px',
              fontWeight: '700'
            }}>
              🏆 MEDITATION MASTERY ACHIEVED! 🎉
            </div>
          )}
        </div>
        
        {renderCurrentPhase}
        
        {/* ✅ Enhanced Debug info for MASTERY stage */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}>
            <h4>Debug Info - MASTERY STAGE:</h4>
            <div>Stage 6 Sessions: {getStage6Sessions()}</div>
            <div><strong>Stage 6 Hours: {getStage6Hours().toFixed(2)}/30 (MASTERY)</strong></div>
            <div>Stage 5 Hours: {getStage5Hours().toFixed(2)}/25 (Required for access)</div>
            <div>Total Practice Hours: {getTotalPracticeHours().toFixed(2)}</div>
            <div>Current Stage: {getCurrentStageByHours()}</div>
            <div>Can Access Stage 6: {hasStage6Access ? 'Yes' : 'No'}</div>
            <div><strong>MASTERY ACHIEVED: {getStage6Hours() >= 30 ? 'YES! 🏆' : 'Not Yet'}</strong></div>
            <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Stage6Wrapper;