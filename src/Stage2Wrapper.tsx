// ✅ CORRECTED Stage2Wrapper.tsx - 10 Hours Requirement (Per Audit)
// File: src/Stage2Wrapper.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
import Stage2Introduction from './Stage2Introduction';
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import UniversalPAHMTimer from './components/shared/UniversalPAHMTimer';
import UniversalPAHMReflection from './components/shared/UniversalPAHMReflection';
import MainNavigation from './MainNavigation';

type PhaseType = 'introduction' | 'posture' | 'timer' | 'reflection';

const Stage2Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // ✅ CORRECTED: Complete UserContext integration with all required methods
  const { 
    // Session & Hours tracking
    incrementStage2Sessions,
    addStageHoursDirect,
    getStage2Sessions,
    getStage2Hours,
    isStage2CompleteByHours,
    
    // Stage progression methods
    getCurrentStageByHours,
    canAdvanceToStageByHours,
    getTotalPracticeHours,
    
    // Profile management
    userProfile,
    markStageIntroComplete,
    markStageComplete
  } = useUser();

  // ✅ PracticeContext for detailed session history
  const { addPracticeSession } = usePractice();
  
  // ✅ State management
  const [currentPhase, setCurrentPhase] = useState<PhaseType>('introduction');
  const [selectedPosture, setSelectedPosture] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false); // ✅ NEW: Loading state

  // ✅ Check access permissions
  const hasStage2Access = useMemo(() => {
    return canAdvanceToStageByHours(2); // Stage 2 unlocked at 5 hours total
  }, [canAdvanceToStageByHours]);

  // ✅ Handle back navigation
  const handleBack = useCallback(() => {
    if (currentPhase === 'introduction') {
      navigate('/home');
    } else if (currentPhase === 'posture') {
      setCurrentPhase('introduction');
    } else if (currentPhase === 'timer') {
      setCurrentPhase('posture');
    } else if (currentPhase === 'reflection') {
      setCurrentPhase('timer');
    }
  }, [currentPhase, navigate]);

  // ✅ Handle introduction completion
  const handleIntroductionComplete = useCallback(async () => {
    setIsLoading(true);
    try {
      await markStageIntroComplete('stage2');
      console.log('✅ Stage 2 introduction marked as completed');
      setCurrentPhase('posture');
    } catch (error) {
      console.error('❌ Error marking Stage 2 intro as completed:', error);
      setCurrentPhase('posture'); // Continue anyway
    } finally {
      setIsLoading(false);
    }
  }, [markStageIntroComplete]);

  // ✅ Handle posture selection
  const handlePostureSelected = useCallback((posture: string) => {
    setSelectedPosture(posture);
    setCurrentPhase('timer');
  }, []);

  // ✅ CORRECTED: 10-hour requirement (per audit) instead of 15 hours
  const handleTimerComplete = useCallback(async (completedDuration: number = 30) => {
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`🎯 Stage 2 session completed! Duration: ${completedDuration} minutes`);
      
      // 1. ✅ Increment Stage 2 session count
      const sessionCount = await incrementStage2Sessions();
      console.log(`📊 Stage 2 Sessions: ${sessionCount}`);
      
      // 2. ✅ CORRECTED: Add hours toward 10-hour requirement (not 15)
      const hoursToAdd = completedDuration / 60;
      const totalStage2Hours = await addStageHoursDirect(2, hoursToAdd);
      console.log(`⏱️ Stage 2 Hours: ${totalStage2Hours}/10 (${Math.round((totalStage2Hours/10)*100)}%)`);
      
      // 3. ✅ Record detailed session to PracticeContext
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: completedDuration,
        sessionType: 'meditation' as const,
        stageLevel: 2,
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
          sessionCount: sessionCount,
          hoursAdded: hoursToAdd,
          totalStage2Hours: totalStage2Hours,
          posture: selectedPosture
        }
      };

      await addPracticeSession(enhancedSessionData);
      
      // 4. ✅ CORRECTED: Check completion against 10 hours (not 15)
      const isStageComplete = totalStage2Hours >= 10;
      if (isStageComplete) {
        console.log('🎉 Stage 2 completed! 10+ hours reached');
        await markStageComplete(2);
      }
      
      setCurrentPhase('reflection');
      
    } catch (error) {
      console.error('❌ Error completing Stage 2 session:', error);
      alert('Failed to save session. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, incrementStage2Sessions, addStageHoursDirect, addPracticeSession, 
      selectedPosture, markStageComplete]);

  // ✅ CORRECTED: Handle reflection completion with 10-hour logic
  const handleReflectionComplete = useCallback(async () => {
    try {
      const currentHours = getStage2Hours();
      const currentSessions = getStage2Sessions();
      const isComplete = currentHours >= 10; // ✅ CORRECTED: 10 hours, not 15
      const totalHours = getTotalPracticeHours();
      const currentStage = getCurrentStageByHours();
      
      console.log(`📊 Stage 2 Progress: ${currentSessions} sessions, ${currentHours}/10 hours`);
      console.log(`📊 Total Practice Hours: ${totalHours}, Current Stage: ${currentStage}`);
      
      if (isComplete) {
        // ✅ Stage 2 complete - navigate with celebration
        navigate('/home', {
          state: {
            stage2Completed: true,
            unlockedStage: 3,
            message: `🎉 Congratulations! Stage 2 completed (${currentHours.toFixed(1)}/10 hours)! Stage 3 is now unlocked!`,
            totalHours: totalHours,
            currentStage: currentStage
          }
        });
      } else {
        // ✅ CORRECTED: Stage 2 in progress (10-hour target)
        const hoursRemaining = Math.max(0, 10 - currentHours);
        const percentComplete = Math.round((currentHours / 10) * 100);
        
        navigate('/home', {
          state: {
            stage2InProgress: true,
            message: `Stage 2 Progress: ${percentComplete}% complete (${hoursRemaining.toFixed(1)} hours remaining)`,
            totalHours: totalHours,
            currentStage: currentStage
          }
        });
      }
      
    } catch (error) {
      console.error('❌ Error processing Stage 2 completion:', error);
      navigate('/home', {
        state: {
          message: 'Stage 2 session recorded! (Sync pending)'
        }
      });
    }
  }, [getStage2Hours, getStage2Sessions, getTotalPracticeHours, getCurrentStageByHours, navigate]);

  // ✅ Access control check
  if (!hasStage2Access) {
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
            Complete Stage 1 (5 hours total) to unlock Stage 2
          </p>
          <div style={{ color: '#374151' }}>
            Total Practice Hours: {getTotalPracticeHours().toFixed(1)}/5.0
          </div>
          <button
            onClick={() => navigate('/home')}
            style={{
              marginTop: '20px',
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Return to Home
          </button>
        </div>
      </MainNavigation>
    );
  }

  // ✅ Memoized phase renderer
  const renderCurrentPhase = useMemo(() => {
    if (isLoading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div>Saving your session...</div>
        </div>
      );
    }

    switch (currentPhase) {
      case 'introduction':
        return (
          <Stage2Introduction
            onComplete={handleIntroductionComplete}
            onBack={handleBack}
          />
        );
        
      case 'posture':
        return (
          <UniversalPostureSelection
            stageNumber={2}
            onBack={handleBack}
            onStartPractice={handlePostureSelected}
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
        
      case 'reflection':
        return (
          <UniversalPAHMReflection
            stageLevel={2}
            onComplete={handleReflectionComplete}
            onBack={handleBack}
          />
        );
        
      default:
        return null;
    }
  }, [
    currentPhase,
    selectedPosture,
    isLoading,
    handleBack,
    handleIntroductionComplete,
    handlePostureSelected,
    handleTimerComplete,
    handleReflectionComplete
  ]);

  return (
    <MainNavigation>
      <div className="stage2-wrapper">
        {/* ✅ CORRECTED: Progress indicator with 10-hour requirement */}
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
            flexWrap: 'wrap'
          }}>
            <span style={{ color: '#6b7280' }}>
              Sessions: {getStage2Sessions()}
            </span>
            <span style={{ color: '#6b7280' }}>
              Hours: {getStage2Hours().toFixed(1)}/10
            </span>
            <span style={{ 
              color: getStage2Hours() >= 10 ? '#059669' : '#6b7280',
              fontWeight: '600'
            }}>
              Progress: {Math.round((getStage2Hours() / 10) * 100)}%
              {getStage2Hours() >= 10 && ' ✅'}
            </span>
          </div>
          
          {/* ✅ Progress bar */}
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden',
            marginTop: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              height: '100%',
              width: `${Math.min((getStage2Hours() / 10) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        
        {renderCurrentPhase}
        
        {/* ✅ Debug info in development */}
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
            <div>Stage 2 Sessions: {getStage2Sessions()}</div>
            <div>Stage 2 Hours: {getStage2Hours().toFixed(2)}/10</div>
            <div>Total Practice Hours: {getTotalPracticeHours().toFixed(2)}</div>
            <div>Current Stage: {getCurrentStageByHours()}</div>
            <div>Can Access Stage 2: {hasStage2Access ? 'Yes' : 'No'}</div>
            <div>Stage 2 Complete: {getStage2Hours() >= 10 ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </MainNavigation>
  );
};

export default Stage2Wrapper;