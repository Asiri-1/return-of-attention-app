// ✅ FINAL FIX: Stage2Wrapper.tsx - No Duplicate Headers & Correct Stage Progress
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
  const { 
    addPracticeSession, 
    getCurrentStage, 
    canAdvanceToStage, 
    sessions, 
    getStageProgress,
    getTotalPracticeHours,
    isStage1CompleteByTSessions
  } = usePractice(); // ✅ SINGLE-POINT
  
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRECTED: Stage 2 specific progress (only Stage 2 sessions)
  const stage2SpecificProgress = useMemo(() => {
    if (!sessions) return { sessions: 0, hours: 0, isComplete: false, source: 'loading' };
    
    try {
      // Count ONLY Stage 2 sessions for Stage 2 progress display
      const stage2Sessions = sessions.filter((session: any) => 
        session.stageLevel === 2 || 
        session.stage === 2 ||
        (session.metadata && session.metadata.stage === 2) ||
        session.stageLabel?.includes('Stage 2')
      );
      
      const totalMinutes = stage2Sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      const stage2Hours = totalMinutes / 60;
      const isComplete = stage2Hours >= 5; // Stage 2 requires 5 hours of Stage 2 sessions
      
      console.log('🎯 Stage 2 SPECIFIC Progress Calculation:', {
        stage2Sessions: stage2Sessions.length,
        stage2Hours: stage2Hours.toFixed(2),
        isComplete,
        note: 'This shows only Stage 2 session progress, not total practice time'
      });
      
      return {
        sessions: stage2Sessions.length,
        hours: stage2Hours, // ✅ CORRECTED: Only Stage 2 session hours
        isComplete,
        source: 'stage2-specific'
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 2 specific progress:', error);
      return { sessions: 0, hours: 0, isComplete: false, source: 'error' };
    }
  }, [sessions]);

  // ✅ Stage 1 completion check for access control
  const stage1Progress = useMemo(() => {
    if (!sessions) return { isComplete: false };
    
    try {
      const stage1Complete = isStage1CompleteByTSessions();
      return { isComplete: stage1Complete };
    } catch (error) {
      console.error('❌ Error checking Stage 1 completion:', error);
      return { isComplete: false };
    }
  }, [sessions, isStage1CompleteByTSessions]);

  // ✅ Access control using Stage 1 completion
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

  // ✅ Total practice hours for stage advancement logic
  const totalPracticeHours = useMemo(() => {
    try {
      return getTotalPracticeHours();
    } catch (error) {
      console.error('❌ Error getting total practice hours:', error);
      return 0;
    }
  }, [getTotalPracticeHours]);

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

  // ✅ EVENT HANDLERS
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

  // ✅ Session completion using PracticeContext
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
      
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 2,
        stage: 2,
        stageLabel: 'Stage 2: PAHM Trainee',
        rating: 4,
        notes: `Stage 2 PAHM trainee session - ${selectedPosture} posture`,
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
          architecture: 'single-point-v5-final'
        }
      };

      await addPracticeSession(enhancedSessionData);
      console.log('✅ Session added to PracticeContext successfully');
      
      // Check Stage 2 completion based on Stage 2 sessions only
      const newStage2Hours = stage2SpecificProgress.hours + (completedDuration / 60);
      const isStageComplete = newStage2Hours >= 5;
      
      console.log(`📊 Stage 2 Progress: ${newStage2Hours.toFixed(2)}/5 hours`);
      
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
      const currentStage2Hours = stage2SpecificProgress.hours;
      const isComplete = currentStage2Hours >= 5;
      
      console.log(`📊 Stage 2 Final Progress: ${currentStage2Hours.toFixed(2)}/5 hours`);
      
      if (isComplete) {
        navigate('/home', {
          state: {
            stage2Completed: true,
            unlockedStage: 3,
            message: `🎉 Congratulations! Stage 2 completed (${currentStage2Hours.toFixed(1)}/5 hours)! Stage 3 is now unlocked!`,
            totalHours: currentStage2Hours,
            currentStage: 2,
            sessionCompleted: true
          }
        });
      } else {
        const hoursRemaining = Math.max(0, 5 - currentStage2Hours);
        const percentComplete = Math.round((currentStage2Hours / 5) * 100);
        
        navigate('/home', {
          state: {
            stage2InProgress: true,
            message: `Stage 2 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`,
            totalHours: currentStage2Hours,
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
            Complete all Stage 1 T-levels (T1-T5) to unlock Stage 2
          </p>
          <div style={{ color: '#374151', marginBottom: '8px' }}>
            Current Stage: {currentStage}
          </div>
          <div style={{ color: '#374151', marginBottom: '20px' }}>
            Stage 1 Complete: {stage1Progress.isComplete ? 'Yes ✅' : 'No ❌'}
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
        {/* ✅ SINGLE HEADER: Only show when NOT in introduction phase */}
        {currentPhase !== 'introduction' && (
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
              Stage 2: PAHM Trainee
            </h2>
            
            <div className="progress-info" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '12px'
            }}>
              <span style={{ color: '#6b7280' }}>
                Sessions: {stage2SpecificProgress.sessions}
              </span>
              <span style={{ color: '#6b7280' }}>
                Hours: {stage2SpecificProgress.hours.toFixed(1)}/5
              </span>
              <span style={{ 
                color: stage2SpecificProgress.isComplete ? '#059669' : '#6b7280',
                fontWeight: '600'
              }}>
                Progress: {Math.round((stage2SpecificProgress.hours / 5) * 100)}%
                {stage2SpecificProgress.isComplete && ' ✅'}
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
                width: `${Math.min((stage2SpecificProgress.hours / 5) * 100, 100)}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              opacity: '0.8',
              color: '#6b7280'
            }}>
              ✅ Stage 2 specific progress: {stage2SpecificProgress.source}
            </div>
          </div>
        )}
        
        {renderCurrentPhase()}
        
        {/* ✅ DEBUG INFO */}
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
              ✅ FINAL CORRECTED Debug:
            </h4>
            <div style={{ color: '#065f46' }}>
              <div><strong>✅ Data Source: PracticeContext ONLY</strong></div>
              <div>Stage 2 Sessions: {stage2SpecificProgress.sessions}</div>
              <div>Stage 2 Hours: {stage2SpecificProgress.hours.toFixed(2)}/5 (Only Stage 2 sessions)</div>
              <div>Total Practice Hours: {totalPracticeHours.toFixed(2)} (All sessions including T-levels)</div>
              <div>Stage 1 Complete: {stage1Progress.isComplete ? 'Yes ✅' : 'No ❌'}</div>
              <div>Current Stage: {getCurrentStage()}</div>
              <div>Can Access Stage 2: {hasStage2Access ? 'Yes' : 'No'}</div>
              <div>Stage 2 Complete: {stage2SpecificProgress.isComplete ? 'Yes' : 'No'}</div>
              <div><strong>Note: Stage advancement uses total hours, Stage 2 progress uses Stage 2 hours</strong></div>
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