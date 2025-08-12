// ✅ COMPLETE FIXED Stage1Wrapper.tsx - Proper Practice Flow
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';

const Stage1Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { addPracticeSession } = usePractice();
  
  // ✅ FIXED: Use UserContext methods for consistent session tracking
  const { 
    userProfile,
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, incrementT4Sessions, incrementT5Sessions
  } = useUser();

  const [tStages, setTStages] = useState<any[]>([]);

  // ✅ FIXED: Session recording that works with BOTH contexts
  const handleSessionRecord = useCallback(async (sessionData: any) => {
    console.log('📊 Recording T-session:', sessionData);
    
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      return;
    }

    try {
      const { tStage, completed, duration = 10, posture = 'seated' } = sessionData;
      const tLevelNumber = parseInt(tStage.replace('T', ''));
      
      // 1. ✅ CRITICAL: Increment UserContext session count FIRST (drives UI)
      let newSessionCount = 0;
      switch (tStage.toLowerCase()) {
        case 't1':
          newSessionCount = await incrementT1Sessions();
          console.log(`📊 T1 Sessions: ${newSessionCount-1} → ${newSessionCount}`);
          break;
        case 't2':
          newSessionCount = await incrementT2Sessions();
          console.log(`📊 T2 Sessions: ${newSessionCount-1} → ${newSessionCount}`);
          break;
        case 't3':
          newSessionCount = await incrementT3Sessions();
          console.log(`📊 T3 Sessions: ${newSessionCount-1} → ${newSessionCount}`);
          break;
        case 't4':
          newSessionCount = await incrementT4Sessions();
          console.log(`📊 T4 Sessions: ${newSessionCount-1} → ${newSessionCount}`);
          break;
        case 't5':
          newSessionCount = await incrementT5Sessions();
          console.log(`📊 T5 Sessions: ${newSessionCount-1} → ${newSessionCount}`);
          break;
      }

      // 2. ✅ ALSO: Save detailed session to PracticeContext for history
      const enhancedSessionData = {
        timestamp: new Date().toISOString(),
        duration: duration,
        sessionType: 'meditation' as const,
        stageLevel: tLevelNumber,
        stageLabel: `${tStage}: Physical Stillness Training`,
        tLevel: tStage, // "T1", "T2", etc.
        level: tStage.toLowerCase(), // "t1", "t2", etc.
        rating: completed ? 8 : 6,
        notes: `${tStage} physical stillness training (${duration} minutes)`,
        presentPercentage: completed ? 85 : 70,
        environment: {
          posture: posture,
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
          tLevel: tStage,
          isCompleted: completed,
          targetDuration: duration,
          actualDuration: duration,
          sessionCount: newSessionCount
        }
      };

      // Save to PracticeContext
      await addPracticeSession(enhancedSessionData);
      console.log(`✅ Session saved to both contexts - ${tStage}`);
      console.log(`📊 New session count: ${newSessionCount}`);

    } catch (error) {
      console.error('❌ Error recording session:', error);
      throw error;
    }
  }, [currentUser, incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, 
      incrementT4Sessions, incrementT5Sessions, addPracticeSession]);

  // ✅ FIXED: Session status calculation using UserContext with CORRECT accessibility
  const calculateTStageStatus = useCallback((tLevel: string) => {
    const tNumber = parseInt(tLevel.replace('T', ''));
    
    let sessions = 0;
    let isComplete = false;
    
    switch (tNumber) {
      case 1:
        sessions = getT1Sessions();
        isComplete = isT1Complete();
        break;
      case 2:
        sessions = getT2Sessions();
        isComplete = isT2Complete();
        break;
      case 3:
        sessions = getT3Sessions();
        isComplete = isT3Complete();
        break;
      case 4:
        sessions = getT4Sessions();
        isComplete = isT4Complete();
        break;
      case 5:
        sessions = getT5Sessions();
        isComplete = isT5Complete();
        break;
      default:
        sessions = 0;
        isComplete = false;
    }

    console.log(`🔍 ${tLevel} Status: ${sessions}/3 sessions, Complete: ${isComplete}`);
    
    // ✅ FIXED: Correct accessibility logic - T1 is ALWAYS accessible
    let isAccessible = false;
    
    if (tNumber === 1) {
      isAccessible = true; // T1 is always accessible
    } else if (tNumber === 2) {
      isAccessible = isT1Complete(); // T2 needs T1 complete
    } else if (tNumber === 3) {
      isAccessible = isT2Complete(); // T3 needs T2 complete
    } else if (tNumber === 4) {
      isAccessible = isT3Complete(); // T4 needs T3 complete
    } else if (tNumber === 5) {
      isAccessible = isT4Complete(); // T5 needs T4 complete
    }
    
    return {
      level: tLevel,
      sessions: sessions,
      isComplete: isComplete,
      isAccessible: isAccessible
    };
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete]);

  // ✅ FIXED: Update T-stages when session counts change  
  const t1Sessions = getT1Sessions();
  const t2Sessions = getT2Sessions();
  const t3Sessions = getT3Sessions();
  const t4Sessions = getT4Sessions();
  const t5Sessions = getT5Sessions();

  useEffect(() => {
    console.log('🔄 Recalculating T-stage statuses...');
    const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
    setTStages(stages);
    console.log('📊 Updated T-stage statuses:', stages);
  }, [calculateTStageStatus, t1Sessions, t2Sessions, t3Sessions, t4Sessions, t5Sessions]);

  // ✅ FIXED: Start practice handler with proper flow (Introduction → Posture → Timer)
  const handleStartPractice = useCallback((tLevel: string, duration: number) => {
    console.log(`🧘 Starting ${tLevel} practice (${duration} minutes)`);
    
    // ✅ Check if user has seen T1 introduction (for T1 only)
    if (tLevel === 'T1') {
      const hasSeenT1Intro = userProfile?.stageProgress?.completedStageIntros?.includes('t1-intro') || false;
      
      if (!hasSeenT1Intro) {
        // First time T1 user → Go to T1 Introduction
        console.log('🔄 First time T1 user, navigating to T1 introduction');
        navigate('/t1-introduction', {
          state: {
            tLevel: tLevel,
            duration: duration,
            level: tLevel.toLowerCase(),
            stageLevel: 1,
            returnTo: '/stage1'
          }
        });
        return;
      }
    }
    
    // ✅ For returning users or non-T1 levels → Go directly to Posture Selection
    console.log('🔄 Navigating to posture selection');
    navigate('/universal-posture-selection', {
      state: {
        tLevel: tLevel,
        duration: duration,
        level: tLevel.toLowerCase(),
        stageLevel: 1,
        returnTo: '/stage1',
        fromStage1: true
      }
    });
  }, [navigate, userProfile]);

  // ✅ Simple back handler
  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              marginRight: '20px'
            }}
          >
            ← Back
          </button>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            Stage 1: Physical Stillness
          </h1>
        </div>

        <p style={{
          fontSize: '18px',
          color: '#666',
          marginBottom: '40px',
          textAlign: 'center'
        }}>
          Develop physical foundation through progressive stillness training from 10 to 30 minutes.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {tStages.map((stage, index) => {
            const durations = [10, 15, 20, 25, 30];
            const duration = durations[index] || 10;
            
            return (
              <div
                key={stage.level}
                style={{
                  background: stage.isComplete
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : stage.isAccessible
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                  color: stage.isAccessible ? 'white' : '#9ca3af',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: stage.isAccessible ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  opacity: stage.isAccessible ? 1 : 0.6,
                  position: 'relative'
                }}
                onClick={() => {
                  if (stage.isAccessible) {
                    handleStartPractice(stage.level, duration);
                  }
                }}
                onMouseEnter={(e) => {
                  if (stage.isAccessible) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (stage.isAccessible) {
                    e.currentTarget.style.transform = 'translateY(0px)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}>
                  <h3 style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    margin: 0
                  }}>
                    {stage.level}: Physical Stillness
                  </h3>
                  <div style={{
                    fontSize: '20px'
                  }}>
                    {stage.isComplete ? '✅' : stage.isAccessible ? '▶️' : '🔒'}
                  </div>
                </div>

                <div style={{
                  fontSize: '18px',
                  marginBottom: '12px',
                  fontWeight: '600'
                }}>
                  Duration: {duration} minutes
                </div>

                <div style={{
                  fontSize: '16px',
                  marginBottom: '16px',
                  opacity: 0.9
                }}>
                  Sessions: {stage.sessions}/3 {stage.isComplete && '✅'}
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '14px'
                }}>
                  {stage.isComplete 
                    ? 'Completed! Well done.' 
                    : stage.isAccessible 
                    ? 'Click to start practice'
                    : 'Complete previous level to unlock'
                  }
                </div>

                {!stage.isAccessible && index > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.1)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(2px)'
                  }}>
                    <div style={{
                      background: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      🔒 Complete T{index} First
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '40px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#666'
          }}>
            <h4>Debug Info:</h4>
            <div>T1 Sessions: {getT1Sessions()}/3 ({isT1Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T2 Sessions: {getT2Sessions()}/3 ({isT2Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T3 Sessions: {getT3Sessions()}/3 ({isT3Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T4 Sessions: {getT4Sessions()}/3 ({isT4Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T5 Sessions: {getT5Sessions()}/3 ({isT5Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>User Profile ID: {userProfile?.userId?.substring(0, 8)}...</div>
            <div>T1 Intro Seen: {userProfile?.stageProgress?.completedStageIntros?.includes('t1-intro') ? 'Yes' : 'No'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage1Wrapper;