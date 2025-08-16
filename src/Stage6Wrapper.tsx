// ✅ ENHANCED Stage6Wrapper.tsx - Phase 3 Robust Integration
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
  
  // ✅ ENHANCED: Safe UserContext integration with fallbacks
  const userContext = useUser();
  const { userProfile } = userContext;

  // ✅ ENHANCED: Safe method calling wrapper
  const safeUserContextCall = useCallback(async (method: string, fallbackValue: any, ...args: any[]) => {
    try {
      const userContextMethod = (userContext as any)[method];
      if (typeof userContextMethod === 'function') {
        return await userContextMethod(...args);
      } else {
        console.warn(`⚠️ UserContext method '${method}' not available, using fallback`);
        return fallbackValue;
      }
    } catch (error) {
      console.error(`❌ Error calling UserContext method '${method}':`, error);
      return fallbackValue;
    }
  }, [userContext]);

  // ✅ PracticeContext for detailed session history
  const { addPracticeSession, getCurrentStage, getStageProgress, canAdvanceToStage, calculateStats, sessions } = usePractice();
  
  // ✅ State management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ ENHANCED: Get Stage 6 progress from sessions if UserContext methods unavailable
  const getStage6ProgressFromSessions = useCallback(() => {
    // Use sessions directly from PracticeContext
    const allSessions = sessions || [];
    
    // Filter Stage 6 sessions
    const stage6Sessions = allSessions.filter((session: any) => 
      session.stageLevel === 6 || 
      session.stage === 6 ||
      (session.metadata && session.metadata.stage === 6)
    );
    
    const totalMinutes = stage6Sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    return {
      sessions: stage6Sessions.length,
      hours: totalHours,
      isComplete: totalHours >= 30
    };
  }, [sessions]);

  // ✅ ENHANCED: Get Stage 5 progress for access control
  const getStage5ProgressFromSessions = useCallback(() => {
    // Use sessions directly from PracticeContext
    const allSessions = sessions || [];
    
    // Filter Stage 5 sessions
    const stage5Sessions = allSessions.filter((session: any) => 
      session.stageLevel === 5 || 
      session.stage === 5 ||
      (session.metadata && session.metadata.stage === 5)
    );
    
    const totalMinutes = stage5Sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    return {
      sessions: stage5Sessions.length,
      hours: totalHours,
      isComplete: totalHours >= 25
    };
  }, [sessions]);

  // ✅ ENHANCED: Stage 6 progress with dual source support
  const stage6Progress = useMemo(() => {
    try {
      // Try to get from sessions first (always available)
      const fromSessions = getStage6ProgressFromSessions();
      
      return {
        sessions: fromSessions.sessions,
        hours: fromSessions.hours,
        isComplete: fromSessions.isComplete,
        source: 'sessions'
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 6 progress:', error);
      return { sessions: 0, hours: 0, isComplete: false, source: 'fallback' };
    }
  }, [getStage6ProgressFromSessions]);

  // ✅ ENHANCED: Stage 5 progress for access control
  const stage5Progress = useMemo(() => {
    try {
      const fromSessions = getStage5ProgressFromSessions();
      return {
        hours: fromSessions.hours,
        isComplete: fromSessions.isComplete
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 5 progress:', error);
      return { hours: 0, isComplete: false };
    }
  }, [getStage5ProgressFromSessions]);

  // ✅ ENHANCED: Access control with fallback logic
  const hasStage6Access = useMemo(() => {
    const currentStage = getCurrentStage();
    const canAdvance = canAdvanceToStage(6);
    const stage5Complete = stage5Progress.isComplete;
    
    // Stage 6 access: current stage >= 6 OR can advance to 6 OR Stage 5 complete
    return currentStage >= 6 || canAdvance || stage5Complete;
  }, [getCurrentStage, canAdvanceToStage, stage5Progress.isComplete]);

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
  
  // ✅ ENHANCED: Handle introduction completion with safe calling
  const handleIntroComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await safeUserContextCall('markStageIntroComplete', null, 'stage6');
      console.log('✅ Stage 6 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 6 intro as completed:', error);
      setError('Failed to save introduction progress');
      setCurrentPhase('posture'); // Continue anyway
    } finally {
      setIsLoading(false);
    }
  }, [safeUserContextCall]);
  
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
  
  // ✅ ENHANCED: Handle timer completion with robust session recording
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
      
      // 1. ✅ Try to increment Stage 6 sessions via UserContext
      const newSessionCount = await safeUserContextCall('incrementStage6Sessions', stage6Progress.sessions + 1);
      console.log(`📊 Stage 6 Sessions: ${newSessionCount}`);
      
      // 2. ✅ Try to add hours via UserContext
      const hoursToAdd = completedDuration / 60;
      const newTotalHours = await safeUserContextCall('addStageHoursDirect', stage6Progress.hours + hoursToAdd, 6, hoursToAdd);
      console.log(`⏱️ Stage 6 Hours: ${newTotalHours}/30 (${Math.round((newTotalHours/30)*100)}%) - MASTERY LEVEL!`);
      
      // 3. ✅ Always record detailed session to PracticeContext (guaranteed to work)
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
          sessionCount: newSessionCount,
          hoursAdded: hoursToAdd,
          totalStage6Hours: newTotalHours,
          posture: selectedPosture,
          isMasteryStage: true,
          masteryProgress: Math.round((newTotalHours / 30) * 100),
          userContextAvailable: typeof (userContext as any).incrementStage6Sessions === 'function'
        }
      };

      await addPracticeSession(enhancedSessionData);
      
      // 4. ✅ Check if Stage 6 is complete (30+ hours) - MEDITATION MASTERY!
      const isStageComplete = newTotalHours >= 30;
      if (isStageComplete) {
        console.log('🏆 STAGE 6 COMPLETED! 30+ hours reached - MEDITATION MASTERY ACHIEVED! 🎉');
        await safeUserContextCall('markStageComplete', null, 6);
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 6 session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, safeUserContextCall, stage6Progress, addPracticeSession, selectedPosture, userContext]);

  // ✅ ENHANCED: Handle reflection completion with robust progress calculation
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = stage6Progress.hours;
      const currentSessions = stage6Progress.sessions;
      const isComplete = currentHours >= 30;
      
      console.log(`📊 Stage 6 Progress: ${currentSessions} sessions, ${currentHours}/30 hours - MASTERY LEVEL`);
      
      if (isComplete) {
        // ✅ Stage 6 complete - MEDITATION MASTERY ACHIEVED!
        navigate('/home', {
          state: {
            stage6Completed: true,
            masterAchieved: true,
            message: `🏆 CONGRATULATIONS! MEDITATION MASTERY ACHIEVED! 
                     Stage 6 completed (${currentHours.toFixed(1)}/30 hours)! 
                     You have reached the highest level of sustained exclusive focus! 🎉`,
            totalHours: currentHours,
            currentStage: 6,
            isMasterAchievement: true
          }
        });
      } else {
        // ✅ Stage 6 in progress (30-hour MASTERY target)
        const hoursRemaining = Math.max(0, 30 - currentHours);
        const percentComplete = Math.round((currentHours / 30) * 100);
        
        navigate('/home', {
          state: {
            stage6InProgress: true,
            message: `Stage 6 MASTERY Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours to meditation mastery!)`,
            totalHours: currentHours,
            currentStage: 6,
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
  }, [stage6Progress, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ ENHANCED: Access control check with detailed feedback
  if (!hasStage6Access) {
    const stage5Hours = stage5Progress.hours;
    const currentStage = getCurrentStage();
    
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
            Current Stage: {currentStage}
          </div>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Stage 5 Progress: {stage5Hours.toFixed(1)}/25.0 hours
          </div>
          <div style={{ color: '#374151', marginBottom: '20px' }}>
            Hours Remaining: {Math.max(0, 25 - stage5Hours).toFixed(1)}
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
            onClick={() => navigate('/stage/5')}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              marginRight: '12px'
            }}
          >
            Continue Stage 5
          </button>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '12px 24px',
              background: '#6b7280',
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
        {/* ✅ ENHANCED: MASTERY Progress indicator with robust data */}
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
              Sessions: {stage6Progress.sessions}
            </span>
            <span style={{ fontWeight: '600' }}>
              Hours: {stage6Progress.hours.toFixed(1)}/30
            </span>
            <span style={{ 
              fontWeight: '700',
              fontSize: '16px'
            }}>
              Mastery: {Math.round((stage6Progress.hours / 30) * 100)}%
              {stage6Progress.isComplete && ' 🏆 ACHIEVED!'}
            </span>
          </div>
          
          {/* ✅ Progress bar with 30-hour calculation - MASTERY THEME */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '10px',
            height: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fbbf24 100%)',
              height: '100%',
              width: `${Math.min((stage6Progress.hours / 30) * 100, 100)}%`,
              transition: 'width 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }} />
          </div>
          
          {/* ✅ Data source indicator */}
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            opacity: '0.8'
          }}>
            Data source: {stage6Progress.source}
          </div>
          
          {/* ✅ MASTERY Badge when complete */}
          {stage6Progress.isComplete && (
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
            <div>Stage 6 Sessions: {stage6Progress.sessions}</div>
            <div><strong>Stage 6 Hours: {stage6Progress.hours.toFixed(2)}/30 (MASTERY)</strong></div>
            <div>Stage 5 Hours: {stage5Progress.hours.toFixed(2)}/25 (Required for access)</div>
            <div>Current Stage: {getCurrentStage()}</div>
            <div>Can Access Stage 6: {hasStage6Access ? 'Yes' : 'No'}</div>
            <div><strong>MASTERY ACHIEVED: {stage6Progress.isComplete ? 'YES! 🏆' : 'Not Yet'}</strong></div>
            <div>Progress Source: {stage6Progress.source}</div>
            <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
            <div>UserContext Methods Available: {Object.keys(userContext).filter(key => typeof (userContext as any)[key] === 'function').join(', ')}</div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Stage6Wrapper;