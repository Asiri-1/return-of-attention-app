// ✅ FIXED Stage2Wrapper.tsx - TRUE SINGLE-POINT Implementation
// File: src/Stage2Wrapper.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ SINGLE-POINT: For ALL session data
import { useUser } from './contexts/user/UserContext'; // ✅ ONLY for profile management
import { useAuth } from './contexts/auth/AuthContext';
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

interface Stage2WrapperProps {}

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

interface LocationState {
  fromPAHM?: boolean;
  fromIntro?: boolean;
  returnToStage?: number;
  fromStage?: boolean;
}

const Stage2Wrapper: React.FC<Stage2WrapperProps> = () => {
  // ✅ ALL HOOKS AT TOP LEVEL - NO CONDITIONAL CALLS
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { userProfile, markStageIntroComplete, markStageComplete } = useUser(); // ✅ ONLY profile management
  const { addPracticeSession, getCurrentStage, canAdvanceToStage, sessions, getStageProgress } = usePractice(); // ✅ SINGLE-POINT
  
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ SINGLE-POINT: Stage 2 progress from PracticeContext ONLY
  const stage2Progress = useMemo(() => {
    if (!sessions) return { sessions: 0, hours: 0, isComplete: false, source: 'loading' };
    
    try {
      // Count all Stage 2 sessions from PracticeContext
      const stage2Sessions = sessions.filter((session: any) => 
        session.stageLevel === 2 || 
        session.stage === 2 ||
        (session.metadata && session.metadata.stage === 2) ||
        session.stageLabel?.includes('Stage 2')
      );
      
      const totalMinutes = stage2Sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      const totalHours = totalMinutes / 60;
      
      console.log('🎯 Stage 2 Progress Calculation:', {
        stage2Sessions: stage2Sessions.length,
        totalMinutes,
        totalHours: totalHours.toFixed(2),
        isComplete: totalHours >= 5
      });
      
      return {
        sessions: stage2Sessions.length,
        hours: totalHours,
        isComplete: totalHours >= 5, // Stage 2 requires 5 hours
        source: 'practicecontext'
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 2 progress:', error);
      return { sessions: 0, hours: 0, isComplete: false, source: 'error' };
    }
  }, [sessions]);

  // ✅ SINGLE-POINT: Stage 1 progress from PracticeContext ONLY
  const stage1Progress = useMemo(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    try {
      // Use getStageProgress for consistent calculation
      const stage1Data = getStageProgress(1);
      const totalHours = stage1Data.completed;
      
      return {
        hours: totalHours,
        isComplete: totalHours >= 3 // Stage 1 requires 3 hours
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 1 progress:', error);
      return { hours: 0, isComplete: false };
    }
  }, [sessions, getStageProgress]);

  // ✅ SINGLE-POINT: Access control using PracticeContext methods
  const hasStage2Access = useMemo(() => {
    try {
      const currentStage = getCurrentStage();
      const canAdvance = canAdvanceToStage(2);
      const stage1Complete = stage1Progress.isComplete;
      
      const hasAccess = currentStage >= 2 || canAdvance || stage1Complete;
      
      console.log('🔓 Stage 2 Access Check:', {
        currentStage,
        canAdvance,
        stage1Complete,
        hasAccess
      });
      
      return hasAccess;
    } catch (error) {
      console.error('❌ Error checking Stage 2 access:', error);
      return false;
    }
  }, [getCurrentStage, canAdvanceToStage, stage1Progress.isComplete]);

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
    const isFromPAHMViaURL = urlParams.returnToStage === '2' && urlParams.fromStage === 'true';
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
      // ✅ Use UserContext ONLY for profile management (marking intro as seen)
      if (markStageIntroComplete && typeof markStageIntroComplete === 'function') {
        await markStageIntroComplete('stage2');
        console.log('✅ Stage 2 introduction marked as completed');
      }
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 2 intro as completed:', error);
      setError('Failed to save introduction progress');
      setCurrentPhase('posture'); // Continue anyway
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartPractice = async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 2 practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 2 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  };

  // ✅ SINGLE-POINT: Session completion using PracticeContext ONLY
  const handleTimerComplete = async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      setError('Please log in to save your session');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🎯 Stage 2 session completed! Duration: ${completedDuration} minutes`);
      
      // ✅ SINGLE-POINT: Create session data and let PracticeContext handle ALL counting
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 2,
        stage: 2, // Ensure stage field is set
        stageLabel: 'Stage 2: Breath Awareness',
        rating: 4,
        notes: `Stage 2 breath awareness session - ${selectedPosture} posture`,
        presentPercentage: 80,
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
          stage: 2,
          posture: selectedPosture,
          sessionSource: 'stage2wrapper',
          architecture: 'single-point-v3'
        }
      };

      // ✅ SINGLE-POINT: Add session via PracticeContext - it handles all counting
      await addPracticeSession(enhancedSessionData);
      console.log('✅ Session added to PracticeContext successfully');
      
      // Calculate new totals from the updated sessions
      const newTotalHours = stage2Progress.hours + (completedDuration / 60);
      const isStageComplete = newTotalHours >= 5;
      
      console.log(`📊 Updated Stage 2 Progress: ${newTotalHours.toFixed(2)}/5 hours`);
      
      // ✅ Use UserContext ONLY for profile management (marking stage complete)
      if (isStageComplete && markStageComplete && typeof markStageComplete === 'function') {
        try {
          await markStageComplete(2);
          console.log('🎉 Stage 2 marked as complete in profile!');
        } catch (profileError) {
          console.warn('⚠️ Failed to update profile, but session saved:', profileError);
        }
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 2 session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReflectionComplete = async () => {
    try {
      // ✅ SINGLE-POINT: Get current progress from PracticeContext
      const currentHours = stage2Progress.hours;
      const currentSessions = stage2Progress.sessions;
      const isComplete = currentHours >= 5;
      
      console.log(`📊 Stage 2 Final Progress: ${currentSessions} sessions, ${currentHours.toFixed(2)}/5 hours`);
      
      if (isComplete) {
        navigate('/home', {
          state: {
            stage2Completed: true,
            unlockedStage: 3,
            message: `🎉 Congratulations! Stage 2 completed (${currentHours.toFixed(1)}/5 hours)! Stage 3 is now unlocked!`,
            totalHours: currentHours,
            currentStage: 2,
            sessionCompleted: true
          }
        });
      } else {
        const hoursRemaining = Math.max(0, 5 - currentHours);
        const percentComplete = Math.round((currentHours / 5) * 100);
        
        navigate('/home', {
          state: {
            stage2InProgress: true,
            message: `Stage 2 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`,
            totalHours: currentHours,
            currentStage: 2,
            sessionCompleted: true
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 2 completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 2 session recorded!',
          sessionCompleted: true
        }
      });
    }
  };

  const handleReflectionBack = () => {
    setCurrentPhase('timer');
  };

  // ✅ ACCESS CONTROL CHECK
  if (!hasStage2Access) {
    const stage1Hours = stage1Progress.hours;
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
            🔒 Stage 2 Locked
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Complete Stage 1 (3 hours) to unlock Stage 2
          </p>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Current Stage: {currentStage}
          </div>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Stage 1 Progress: {stage1Hours.toFixed(1)}/3.0 hours
          </div>
          <div style={{ color: '#374151', marginBottom: '20px' }}>
            Hours Remaining: {Math.max(0, 3 - stage1Hours).toFixed(1)}
          </div>
          <button
            onClick={() => navigate('/stage1')}
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
            Continue Stage 1
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
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(102, 126, 234, 0.3)',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
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
            stageLevel={2}
            onComplete={handleReflectionComplete}
            onBack={handleReflectionBack}
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
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={2}
            onBack={handleBack}
            onStartPractice={handleStartPractice}
          />
        );
        
      case 'introduction':
      default:
        return (
          <Stage2Introduction
            onComplete={handleIntroComplete}
            onBack={handleBack}
          />
        );
    }
  };

  return (
    <MainNavigation>
      <div className="stage2-wrapper">
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
            Stage 2: Breath Awareness
          </h2>
          
          <div className="progress-info" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#6b7280' }}>
              Sessions: {stage2Progress.sessions}
            </span>
            <span style={{ color: '#6b7280' }}>
              Hours: {stage2Progress.hours.toFixed(1)}/5
            </span>
            <span style={{ 
              color: stage2Progress.isComplete ? '#059669' : '#6b7280',
              fontWeight: '600'
            }}>
              Progress: {Math.round((stage2Progress.hours / 5) * 100)}%
              {stage2Progress.isComplete && ' ✅'}
            </span>
          </div>
          
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
              height: '100%',
              width: `${Math.min((stage2Progress.hours / 5) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            opacity: '0.8',
            color: '#6b7280'
          }}>
            ✅ Single-point data source: {stage2Progress.source}
          </div>
        </div>
        
        {renderCurrentPhase()}
        
        {/* ✅ SINGLE-POINT COMPLIANCE DEBUG INFO */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4 style={{ color: '#059669', margin: '0 0 12px 0' }}>
              ✅ Single-Point Compliance Debug:
            </h4>
            <div style={{ color: '#065f46' }}>
              <div><strong>✅ Data Source: PracticeContext ONLY</strong></div>
              <div>Stage 2 Sessions: {stage2Progress.sessions}</div>
              <div>Stage 2 Hours: {stage2Progress.hours.toFixed(2)}/5</div>
              <div>Stage 1 Hours: {stage1Progress.hours.toFixed(2)}/3 (Required for access)</div>
              <div>Current Stage: {getCurrentStage()}</div>
              <div>Can Access Stage 2: {hasStage2Access ? 'Yes' : 'No'}</div>
              <div>Stage 2 Complete: {stage2Progress.isComplete ? 'Yes' : 'No'}</div>
              <div><strong>Progress Source: {stage2Progress.source}</strong></div>
              <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
              <div>Total Sessions: {sessions?.length || 0}</div>
              <div><strong>Architecture: Single-Point v3</strong></div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
          }
        `}</style>
      </div>
    </MainNavigation>
  );
};

export default Stage2Wrapper;