// ✅ ENHANCED Stage4Wrapper.tsx - Phase 3 Robust Integration
// File: src/Stage4Wrapper.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
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
  // ✅ ALL HOOKS AT TOP LEVEL - NO CONDITIONAL CALLS
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const userContext = useUser();
  const { addPracticeSession, getCurrentStage, canAdvanceToStage, sessions } = usePractice();
  
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ SAFE USER CONTEXT FUNCTION (NOT A HOOK)
  const callUserContextMethod = async (method: string, fallbackValue: any, ...args: any[]) => {
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
  };

  // ✅ STAGE PROGRESS CALCULATIONS (MEMOIZED VALUES)
  const stage4Progress = useMemo(() => {
    if (!sessions) return { sessions: 0, hours: 0, isComplete: false, source: 'fallback' };
    
    try {
      const stage4Sessions = sessions.filter((session: any) => 
        session.stageLevel === 4 || 
        session.stage === 4 ||
        (session.metadata && session.metadata.stage === 4)
      );
      
      const totalMinutes = stage4Sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      const totalHours = totalMinutes / 60;
      
      return {
        sessions: stage4Sessions.length,
        hours: totalHours,
        isComplete: totalHours >= 20, // Stage 4 requires 20 hours
        source: 'sessions'
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 4 progress:', error);
      return { sessions: 0, hours: 0, isComplete: false, source: 'fallback' };
    }
  }, [sessions]);

  const stage3Progress = useMemo(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    try {
      const stage3Sessions = sessions.filter((session: any) => 
        session.stageLevel === 3 || 
        session.stage === 3 ||
        (session.metadata && session.metadata.stage === 3)
      );
      
      const totalMinutes = stage3Sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      const totalHours = totalMinutes / 60;
      
      return {
        hours: totalHours,
        isComplete: totalHours >= 10 // Stage 3 requires 10 hours
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 3 progress:', error);
      return { hours: 0, isComplete: false };
    }
  }, [sessions]);

  const hasStage4Access = useMemo(() => {
    const currentStage = getCurrentStage();
    const canAdvance = canAdvanceToStage(4);
    const stage3Complete = stage3Progress.isComplete;
    
    return currentStage >= 4 || canAdvance || stage3Complete;
  }, [getCurrentStage, canAdvanceToStage, stage3Progress.isComplete]);

  const locationState = useMemo((): LocationState => {
    return (location.state as LocationState) || {};
  }, [location.state]);

  const urlParams = useMemo(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return {
      returnToStage: searchParams.get('returnToStage'),
      fromStage: searchParams.get('fromStage')
    };
  }, []);

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

  // ✅ EFFECTS
  useEffect(() => {
    const { effectivelyFromPAHM, isFromIntro } = navigationFlags;
    
    if (!effectivelyFromPAHM && !isFromIntro) {
      setCurrentPhase('introduction');
      return;
    }
    
    if (effectivelyFromPAHM) {
      console.log('✅ Previous session state cleared successfully');
      setError(null);
      setCurrentPhase('posture');
      return;
    }
    
    if (isFromIntro) {
      setCurrentPhase('posture');
    }
  }, [navigationFlags]);

  // ✅ EVENT HANDLERS (REGULAR FUNCTIONS, NOT HOOKS)
  const handleBack = () => {
    if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else {
      navigate('/home');
    }
  };

  const handleIntroComplete = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await callUserContextMethod('markStageIntroComplete', null, 'stage4');
      console.log('✅ Stage 4 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 4 intro as completed:', error);
      setError('Failed to save introduction progress');
      setCurrentPhase('posture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 4 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 4 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  };

  const handleTimerComplete = async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      setError('Please log in to save your session');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🎯 Stage 4 session completed! Duration: ${completedDuration} minutes`);
      
      // Try UserContext methods with fallbacks
      const newSessionCount = await callUserContextMethod('incrementStage4Sessions', stage4Progress.sessions + 1);
      console.log(`📊 Stage 4 Sessions: ${newSessionCount}`);
      
      const hoursToAdd = completedDuration / 60;
      const newTotalHours = await callUserContextMethod('addStageHoursDirect', stage4Progress.hours + hoursToAdd, 4, hoursToAdd);
      console.log(`⏱️ Stage 4 Hours: ${newTotalHours}/20 (${Math.round((newTotalHours/20)*100)}%)`);
      
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 4,
        stageLabel: 'Stage 4: Continuous Introspective Awareness',
        rating: 6,
        notes: `Stage 4 continuous awareness session - ${selectedPosture} posture`,
        presentPercentage: 88,
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
          stage: 4,
          sessionCount: newSessionCount,
          hoursAdded: hoursToAdd,
          totalStage4Hours: newTotalHours,
          posture: selectedPosture,
          userContextAvailable: typeof (userContext as any).incrementStage4Sessions === 'function'
        }
      };

      await addPracticeSession(enhancedSessionData);
      
      const isStageComplete = newTotalHours >= 20;
      if (isStageComplete) {
        console.log('🎉 Stage 4 completed! 20+ hours reached');
        await callUserContextMethod('markStageComplete', null, 4);
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 4 session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReflectionComplete = async () => {
    try {
      const currentHours = stage4Progress.hours;
      const currentSessions = stage4Progress.sessions;
      const isComplete = currentHours >= 20;
      
      console.log(`📊 Stage 4 Progress: ${currentSessions} sessions, ${currentHours}/20 hours`);
      
      if (isComplete) {
        navigate('/home', {
          state: {
            stage4Completed: true,
            unlockedStage: 5,
            message: `🎉 Congratulations! Stage 4 completed (${currentHours.toFixed(1)}/20 hours)! Stage 5 is now unlocked!`,
            totalHours: currentHours,
            currentStage: 4
          }
        });
      } else {
        const hoursRemaining = Math.max(0, 20 - currentHours);
        const percentComplete = Math.round((currentHours / 20) * 100);
        
        navigate('/home', {
          state: {
            stage4InProgress: true,
            message: `Stage 4 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`,
            totalHours: currentHours,
            currentStage: 4
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 4 completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 4 session recorded! (Sync pending)'
        }
      });
    }
  };

  const handleReflectionBack = () => {
    setCurrentPhase('timer');
  };

  // ✅ ACCESS CONTROL CHECK
  if (!hasStage4Access) {
    const stage3Hours = stage3Progress.hours;
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
            🔒 Stage 4 Locked
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Complete Stage 3 (10 hours) to unlock Stage 4
          </p>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Current Stage: {currentStage}
          </div>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Stage 3 Progress: {stage3Hours.toFixed(1)}/10.0 hours
          </div>
          <div style={{ color: '#374151', marginBottom: '20px' }}>
            Hours Remaining: {Math.max(0, 10 - stage3Hours).toFixed(1)}
          </div>
          <button
            onClick={() => navigate('/stage/3')}
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
            Continue Stage 3
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

  // ✅ RENDER PHASE CONTENT
  const renderCurrentPhase = () => {
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
  };

  return (
    <MainNavigation>
      <div className="stage4-wrapper">
        {/* ✅ PROGRESS INDICATOR */}
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
            Stage 4: Continuous Introspective Awareness
          </h2>
          
          <div className="progress-info" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#6b7280' }}>
              Sessions: {stage4Progress.sessions}
            </span>
            <span style={{ color: '#6b7280' }}>
              Hours: {stage4Progress.hours.toFixed(1)}/20
            </span>
            <span style={{ 
              color: stage4Progress.isComplete ? '#059669' : '#6b7280',
              fontWeight: '600'
            }}>
              Progress: {Math.round((stage4Progress.hours / 20) * 100)}%
              {stage4Progress.isComplete && ' ✅'}
            </span>
          </div>
          
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              height: '100%',
              width: `${Math.min((stage4Progress.hours / 20) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            opacity: '0.8',
            color: '#6b7280'
          }}>
            Data source: {stage4Progress.source}
          </div>
        </div>
        
        {renderCurrentPhase()}
        
        {/* ✅ DEBUG INFO */}
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
            <div>Stage 4 Sessions: {stage4Progress.sessions}</div>
            <div>Stage 4 Hours: {stage4Progress.hours.toFixed(2)}/20</div>
            <div>Stage 3 Hours: {stage3Progress.hours.toFixed(2)}/10 (Required for access)</div>
            <div>Current Stage: {getCurrentStage()}</div>
            <div>Can Access Stage 4: {hasStage4Access ? 'Yes' : 'No'}</div>
            <div>Stage 4 Complete: {stage4Progress.isComplete ? 'Yes' : 'No'}</div>
            <div>Progress Source: {stage4Progress.source}</div>
            <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
            <div>Available UserContext Methods:</div>
            <div style={{ fontSize: '10px', marginLeft: '8px' }}>
              - incrementStage4Sessions: {typeof (userContext as any).incrementStage4Sessions === 'function' ? '✅' : '❌'}
            </div>
            <div style={{ fontSize: '10px', marginLeft: '8px' }}>
              - addStageHoursDirect: {typeof (userContext as any).addStageHoursDirect === 'function' ? '✅' : '❌'}
            </div>
            <div style={{ fontSize: '10px', marginLeft: '8px' }}>
              - markStageComplete: {typeof (userContext as any).markStageComplete === 'function' ? '✅' : '❌'}
            </div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Stage4Wrapper;