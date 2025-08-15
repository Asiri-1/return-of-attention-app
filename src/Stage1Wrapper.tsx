// ✅ COMPLETE FIXED Stage1Wrapper.tsx - Data Sanitization to Prevent DataCloneError
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';

interface TStageStatus {
  level: string;
  sessions: number;
  isComplete: boolean;
  isAccessible: boolean;
  stage1Hours: number;
  isStage1Complete: boolean;
  hoursProgress: number;
}

// ✅ CRITICAL: Data sanitization function to prevent DataCloneError
const sanitizeData = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  
  try {
    // Use JSON stringify/parse to remove non-serializable objects
    return JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.warn('Data sanitization failed, returning safe defaults:', error);
    return {
      tStage: 'T1',
      completed: false,
      duration: 10,
      posture: 'seated',
      timestamp: new Date().toISOString()
    };
  }
};

const Stage1Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addPracticeSession } = usePractice();
  
  const { 
    userProfile,
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, incrementT4Sessions, incrementT5Sessions,
    getStage1Hours,
    addStageHoursDirect,
    getCurrentStageByHours,
    getTotalPracticeHours,
    isStage1CompleteByHours
  } = useUser();

  const [tStages, setTStages] = useState<TStageStatus[]>([]);

  // ✅ FIXED: Session recording with complete data sanitization
  const handleSessionRecord = useCallback(async (sessionData: any) => {
    console.log('📊 Recording T-session with data sanitization:', sessionData);
    
    if (!currentUser?.uid) {
      console.error('❌ No authenticated user');
      return;
    }

    try {
      // ✅ CRITICAL: Sanitize sessionData FIRST to prevent DataCloneError
      const sanitizedSessionData = sanitizeData({
        tStage: sessionData?.tStage || 'T1',
        completed: sessionData?.completed || false,
        duration: sessionData?.duration || 10,
        actualDuration: sessionData?.actualDuration || sessionData?.duration || 10,
        posture: sessionData?.posture || 'seated',
        rating: sessionData?.rating || 7,
        notes: sessionData?.notes || '',
        timestamp: sessionData?.timestamp || new Date().toISOString()
      });
      
      const { 
        tStage, 
        completed, 
        duration, 
        actualDuration,
        posture 
      } = sanitizedSessionData;
      
      const practiceMinutes = actualDuration || duration;
      const practiceHours = practiceMinutes / 60;
      
      console.log(`🧘 Processing ${tStage} session: ${practiceMinutes} minutes (${practiceHours.toFixed(2)} hours)`);
      
      // 1. ✅ Increment session count
      let newSessionCount = 0;
      const tLevel = tStage.toLowerCase();
      
      if (tLevel === 't1') newSessionCount = await incrementT1Sessions();
      else if (tLevel === 't2') newSessionCount = await incrementT2Sessions();
      else if (tLevel === 't3') newSessionCount = await incrementT3Sessions();
      else if (tLevel === 't4') newSessionCount = await incrementT4Sessions();
      else if (tLevel === 't5') newSessionCount = await incrementT5Sessions();

      // 2. ✅ Add hours to Stage 1
      await addStageHoursDirect(1, practiceHours);
      
      console.log(`📊 Added ${practiceHours.toFixed(2)} hours to Stage 1`);
      console.log(`📊 ${tStage} Sessions: ${newSessionCount-1} → ${newSessionCount}`);

      // 3. ✅ Create completely clean session data for PracticeContext
      const cleanSessionData = sanitizeData({
        timestamp: new Date().toISOString(),
        duration: practiceMinutes,
        sessionType: 'meditation',
        stageLevel: 1,
        stageLabel: `Stage 1 - ${tStage}: Physical Stillness Training`,
        tLevel: tStage,
        level: tLevel,
        rating: completed ? 8 : 6,
        notes: `${tStage} physical stillness training (${practiceMinutes} minutes)`,
        presentPercentage: completed ? 85 : 70,
        environment: {
          posture: posture || 'seated',
          location: 'indoor',
          lighting: 'natural',
          sounds: 'quiet'
        },
        pahmCounts: {
          present_attachment: 0,
          present_neutral: 0,
          present_aversion: 0,
          past_attachment: 0,
          past_neutral: 0,
          past_aversion: 0,
          future_attachment: 0,
          future_neutral: 0,
          future_aversion: 0
        },
        metadata: {
          tLevel: tStage,
          isCompleted: completed,
          targetDuration: duration,
          actualDuration: practiceMinutes,
          sessionCount: newSessionCount,
          hoursAdded: practiceHours,
          stage1TotalHours: getStage1Hours() + practiceHours
        }
      });

      // 4. ✅ Save to PracticeContext with sanitized data
      await addPracticeSession(cleanSessionData);
      console.log(`✅ Session saved successfully - ${tStage}`);

    } catch (error) {
      console.error('❌ Error recording session:', error);
      
      // ✅ Try to save basic session data as fallback
      try {
        console.log('🔧 Attempting fallback session save...');
        
        const fallbackSessionData = sanitizeData({
          timestamp: new Date().toISOString(),
          duration: 10,
          sessionType: 'meditation',
          stageLevel: 1,
          stageLabel: 'Stage 1 - T1: Physical Stillness Training',
          tLevel: 'T1',
          level: 't1',
          rating: 7,
          notes: 'Session recorded with fallback data',
          presentPercentage: 75,
          environment: {
            posture: 'seated',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          pahmCounts: {
            present_attachment: 0,
            present_neutral: 0,
            present_aversion: 0,
            past_attachment: 0,
            past_neutral: 0,
            past_aversion: 0,
            future_attachment: 0,
            future_neutral: 0,
            future_aversion: 0
          }
        });
        
        await addPracticeSession(fallbackSessionData);
        console.log('✅ Fallback session saved');
        
      } catch (fallbackError) {
        console.error('❌ Fallback session save also failed:', fallbackError);
      }
      
      throw error;
    }
  }, [currentUser, incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, 
      incrementT4Sessions, incrementT5Sessions, addPracticeSession, addStageHoursDirect, getStage1Hours]);

  // ✅ Calculate T-stage status
  const calculateTStageStatus = useCallback((tLevel: string): TStageStatus => {
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

    const stage1Hours = getStage1Hours();
    const isStage1Complete = isStage1CompleteByHours();
    
    // Accessibility logic
    let isAccessible = false;
    if (tNumber === 1) isAccessible = true;
    else if (tNumber === 2) isAccessible = isT1Complete();
    else if (tNumber === 3) isAccessible = isT2Complete();
    else if (tNumber === 4) isAccessible = isT3Complete();
    else if (tNumber === 5) isAccessible = isT4Complete();
    
    return {
      level: tLevel,
      sessions,
      isComplete,
      isAccessible,
      stage1Hours,
      isStage1Complete,
      hoursProgress: stage1Hours / 5.0
    };
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
      getStage1Hours, isStage1CompleteByHours]);

  // ✅ Update stages when data changes
  const t1Sessions = getT1Sessions();
  const t2Sessions = getT2Sessions();
  const t3Sessions = getT3Sessions();
  const t4Sessions = getT4Sessions();
  const t5Sessions = getT5Sessions();
  const stage1Hours = getStage1Hours();

  useEffect(() => {
    const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
    setTStages(stages);
  }, [calculateTStageStatus, t1Sessions, t2Sessions, t3Sessions, t4Sessions, t5Sessions, stage1Hours]);

  // ✅ FIXED: Start practice handler with data sanitization
  const handleStartPractice = useCallback((tLevel: string, duration: number) => {
    console.log(`🧘 Starting ${tLevel} practice (${duration} minutes)`);
    
    // Check T1 introduction
    if (tLevel === 'T1') {
      const hasSeenT1Intro = userProfile?.stageProgress?.completedStageIntros?.includes('t1-intro') || false;
      
      if (!hasSeenT1Intro) {
        // ✅ Sanitize navigation state data
        const navigationState = sanitizeData({
          tLevel,
          duration,
          level: tLevel.toLowerCase(),
          stageLevel: 1,
          returnTo: '/stage1',
          onSessionComplete: null // Remove function reference
        });
        
        navigate('/t1-introduction', { state: navigationState });
        return;
      }
    }
    
    // ✅ Sanitize navigation state data for posture selection
    const navigationState = sanitizeData({
      tLevel,
      duration,
      level: tLevel.toLowerCase(),
      stageLevel: 1,
      returnTo: '/stage1',
      fromStage1: true,
      onSessionComplete: null // Remove function reference
    });
    
    navigate('/universal-posture-selection', { state: navigationState });
  }, [navigate, userProfile]);

  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // ✅ Authentication check
  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: '18px' }}>
          Please log in to access Stage 1
        </div>
      </div>
    );
  }

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
        {/* Header */}
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
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Develop physical foundation through progressive stillness training from 10 to 30 minutes.
        </p>

        {/* Stage 1 Progress */}
        <div style={{
          background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '12px'
          }}>
            Stage 1 Progress: {getStage1Hours().toFixed(1)}/5.0 Hours
          </h3>
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '20px',
            overflow: 'hidden',
            marginBottom: '12px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              height: '100%',
              width: `${Math.min((getStage1Hours() / 5.0) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          <div style={{
            fontSize: '14px',
            color: '#6b7280'
          }}>
            Complete 5 total hours across all T-levels to master Stage 1
          </div>
          {isStage1CompleteByHours() && (
            <div style={{
              fontSize: '16px',
              color: '#059669',
              fontWeight: '600',
              marginTop: '8px'
            }}>
              🎉 Stage 1 Complete! Ready for Stage 2
            </div>
          )}
        </div>

        {/* T-Stages Grid */}
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

        {/* Debug Info */}
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
            <div>T1: {getT1Sessions()}/3 ({isT1Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T2: {getT2Sessions()}/3 ({isT2Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T3: {getT3Sessions()}/3 ({isT3Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T4: {getT4Sessions()}/3 ({isT4Complete() ? 'Complete' : 'Incomplete'})</div>
            <div>T5: {getT5Sessions()}/3 ({isT5Complete() ? 'Complete' : 'Incomplete'})</div>
            <div><strong>Stage 1 Hours: {getStage1Hours().toFixed(2)}/5.0</strong></div>
            <div><strong>Stage 1 Complete: {isStage1CompleteByHours() ? 'Yes' : 'No'}</strong></div>
            <div><strong>Total Hours: {getTotalPracticeHours().toFixed(2)}</strong></div>
            <div><strong>Current Stage: {getCurrentStageByHours()}</strong></div>
            <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Stage1Wrapper;