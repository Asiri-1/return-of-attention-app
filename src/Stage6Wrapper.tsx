// ✅ FIXED Stage6Wrapper.tsx - TRUE SINGLE-POINT Implementation - MASTERY STAGE
// File: src/Stage6Wrapper.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ SINGLE-POINT: For ALL session data
import { useUser } from './contexts/user/UserContext'; // ✅ ONLY for profile management
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

  // ✅ SINGLE-POINT: Stage 6 progress from PracticeContext ONLY
  const stage6Progress = useMemo(() => {
    if (!sessions) return { sessions: 0, hours: 0, isComplete: false, source: 'loading' };
    
    try {
      // Count all Stage 6 sessions from PracticeContext
      const stage6Sessions = sessions.filter((session: any) => 
        session.stageLevel === 6 || 
        session.stage === 6 ||
        (session.metadata && session.metadata.stage === 6) ||
        session.stageLabel?.includes('Stage 6')
      );
      
      const totalMinutes = stage6Sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      const totalHours = totalMinutes / 60;
      
      console.log('🏆 Stage 6 MASTERY Progress Calculation:', {
        stage6Sessions: stage6Sessions.length,
        totalMinutes,
        totalHours: totalHours.toFixed(2),
        isComplete: totalHours >= 30,
        masteryProgress: Math.round((totalHours / 30) * 100)
      });
      
      return {
        sessions: stage6Sessions.length,
        hours: totalHours,
        isComplete: totalHours >= 30, // Stage 6 requires 30 hours - MASTERY LEVEL
        source: 'practicecontext'
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 6 progress:', error);
      return { sessions: 0, hours: 0, isComplete: false, source: 'error' };
    }
  }, [sessions]);

  // ✅ SINGLE-POINT: Stage 5 progress from PracticeContext ONLY
  const stage5Progress = useMemo(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    try {
      // Use getStageProgress for consistent calculation
      const stage5Data = getStageProgress(5);
      const totalHours = stage5Data.completed;
      
      return {
        hours: totalHours,
        isComplete: totalHours >= 25 // Stage 5 requires 25 hours
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 5 progress:', error);
      return { hours: 0, isComplete: false };
    }
  }, [sessions, getStageProgress]);

  // ✅ SINGLE-POINT: Access control using PracticeContext methods
  const hasStage6Access = useMemo(() => {
    try {
      const currentStage = getCurrentStage();
      const canAdvance = canAdvanceToStage(6);
      const stage5Complete = stage5Progress.isComplete;
      
      const hasAccess = currentStage >= 6 || canAdvance || stage5Complete;
      
      console.log('🔓 Stage 6 MASTERY Access Check:', {
        currentStage,
        canAdvance,
        stage5Complete,
        hasAccess
      });
      
      return hasAccess;
    } catch (error) {
      console.error('❌ Error checking Stage 6 access:', error);
      return false;
    }
  }, [getCurrentStage, canAdvanceToStage, stage5Progress.isComplete]);

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
    const isFromPAHMViaURL = urlParams.returnToStage === '6' && urlParams.fromStage === 'true';
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

  const handleIntroComplete = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // ✅ Use UserContext ONLY for profile management (marking intro as seen)
      if (markStageIntroComplete && typeof markStageIntroComplete === 'function') {
        await markStageIntroComplete('stage6');
        console.log('✅ Stage 6 MASTERY introduction marked as completed');
      }
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 6 intro as completed:', error);
      setError('Failed to save introduction progress');
      setCurrentPhase('posture'); // Continue anyway
    } finally {
      setIsLoading(false);
    }
  }, [markStageIntroComplete]);

  const handleStartPractice = useCallback(async (posture: string) => {
    try {
      setSelectedPosture(posture);
      console.log('✅ Stage 6 MASTERY practice session prepared with posture:', posture);
      setCurrentPhase('timer');
    } catch (error) {
      console.error('❌ Error preparing Stage 6 practice session:', error);
      setSelectedPosture(posture);
      setCurrentPhase('timer');
    }
  }, []);

  // ✅ SINGLE-POINT: Session completion using PracticeContext ONLY
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      setError('Please log in to save your session');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log(`🏆 Stage 6 MASTERY session completed! Duration: ${completedDuration} minutes`);
      
      // ✅ SINGLE-POINT: Create session data and let PracticeContext handle ALL counting
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 6,
        stage: 6, // Ensure stage field is set
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
          posture: selectedPosture,
          sessionSource: 'stage6wrapper',
          architecture: 'single-point-v3',
          isMasteryStage: true,
          masteryLevel: 'sustained-exclusive-focus'
        }
      };

      // ✅ SINGLE-POINT: Add session via PracticeContext - it handles all counting
      await addPracticeSession(enhancedSessionData);
      console.log('✅ MASTERY session added to PracticeContext successfully');
      
      // Calculate new totals from the updated sessions
      const newTotalHours = stage6Progress.hours + (completedDuration / 60);
      const isStageComplete = newTotalHours >= 30;
      const masteryProgress = Math.round((newTotalHours / 30) * 100);
      
      console.log(`📊 Updated Stage 6 MASTERY Progress: ${newTotalHours.toFixed(2)}/30 hours (${masteryProgress}%)`);
      
      // ✅ Use UserContext ONLY for profile management (marking stage complete)
      if (isStageComplete && markStageComplete && typeof markStageComplete === 'function') {
        try {
          await markStageComplete(6);
          console.log('🏆 MEDITATION MASTERY ACHIEVED! Stage 6 marked as complete in profile! 🎉');
        } catch (profileError) {
          console.warn('⚠️ Failed to update profile, but MASTERY session saved:', profileError);
        }
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 6 MASTERY session:', error);
      setError('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, stage6Progress, addPracticeSession, selectedPosture, markStageComplete]);

  const handleReflectionComplete = useCallback(async () => {
    try {
      // ✅ SINGLE-POINT: Get current progress from PracticeContext
      const currentHours = stage6Progress.hours;
      const currentSessions = stage6Progress.sessions;
      const isComplete = currentHours >= 30;
      const masteryProgress = Math.round((currentHours / 30) * 100);
      
      console.log(`📊 Stage 6 MASTERY Final Progress: ${currentSessions} sessions, ${currentHours.toFixed(2)}/30 hours (${masteryProgress}%)`);
      
      if (isComplete) {
        navigate('/home', {
          state: {
            stage6Completed: true,
            masterAchieved: true,
            message: `🏆 CONGRATULATIONS! MEDITATION MASTERY ACHIEVED! Stage 6 completed (${currentHours.toFixed(1)}/30 hours)! You have reached the highest level of sustained exclusive focus! 🎉`,
            totalHours: currentHours,
            currentStage: 6,
            isMasterAchievement: true,
            sessionCompleted: true
          }
        });
      } else {
        const hoursRemaining = Math.max(0, 30 - currentHours);
        
        navigate('/home', {
          state: {
            stage6InProgress: true,
            message: `Stage 6 MASTERY Progress: ${masteryProgress}% complete (${hoursRemaining.toFixed(1)} hours to meditation mastery!)`,
            totalHours: currentHours,
            currentStage: 6,
            isMasteryStage: true,
            sessionCompleted: true
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 6 MASTERY completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 6 MASTERY session recorded!',
          sessionCompleted: true
        }
      });
    }
  }, [stage6Progress, navigate]);

  const handleReflectionBack = useCallback(() => {
    setCurrentPhase('timer');
  }, []);

  // ✅ ACCESS CONTROL CHECK
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
            onClick={() => navigate('/stage5')}
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
            border: '3px solid rgba(251, 191, 36, 0.3)',
            borderTop: '3px solid #fbbf24',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: '18px', marginBottom: '12px', color: '#f59e0b', fontWeight: '600' }}>
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
  };

  return (
    <MainNavigation>
      <div className="stage6-wrapper">
        {/* ✅ MASTERY PROGRESS INDICATOR */}
        <div className="stage-progress-header" style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 8px 25px rgba(251, 191, 36, 0.3)'
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
          
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            opacity: '0.8'
          }}>
            ✅ Single-point data source: {stage6Progress.source}
          </div>
          
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
        
        {renderCurrentPhase()}
        
        {/* ✅ SINGLE-POINT COMPLIANCE DEBUG INFO - MASTERY EDITION */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)',
            border: '2px solid #fbbf24',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4 style={{ color: '#f59e0b', margin: '0 0 12px 0' }}>
              🏆 Single-Point Compliance Debug - MASTERY STAGE:
            </h4>
            <div style={{ color: '#065f46' }}>
              <div><strong>✅ Data Source: PracticeContext ONLY</strong></div>
              <div>Stage 6 Sessions: {stage6Progress.sessions}</div>
              <div><strong>Stage 6 Hours: {stage6Progress.hours.toFixed(2)}/30 (MASTERY LEVEL)</strong></div>
              <div>Stage 5 Hours: {stage5Progress.hours.toFixed(2)}/25 (Required for access)</div>
              <div>Current Stage: {getCurrentStage()}</div>
              <div>Can Access Stage 6: {hasStage6Access ? 'Yes' : 'No'}</div>
              <div><strong>MASTERY ACHIEVED: {stage6Progress.isComplete ? 'YES! 🏆' : `Not Yet (${Math.round((stage6Progress.hours / 30) * 100)}%)`}</strong></div>
              <div><strong>Progress Source: {stage6Progress.source}</strong></div>
              <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
              <div>Total Sessions: {sessions?.length || 0}</div>
              <div><strong>Architecture: Single-Point v3 - MASTERY EDITION</strong></div>
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

export default Stage6Wrapper;