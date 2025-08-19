// ✅ FIXED Stage1Wrapper.tsx - TRUE SINGLE-POINT Implementation
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ SINGLE-POINT: For ALL session data
import { useUser } from './contexts/user/UserContext'; // ✅ ONLY for profile management
import { useAuth } from './contexts/auth/AuthContext';
import MainNavigation from './MainNavigation';

interface TStageStatus {
  level: string;
  sessions: number;
  isComplete: boolean;
  isAccessible: boolean;
  stage1Hours: number;
  isStage1Complete: boolean;
  hoursProgress: number;
  source: string;
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
  // ✅ ALL HOOKS AT TOP LEVEL - NO CONDITIONAL CALLS
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { userProfile } = useUser(); // ✅ ONLY for profile management
  const { sessions, isLoading, getCurrentStage, getTotalPracticeHours } = usePractice(); // ✅ SINGLE-POINT
  
  const [error, setError] = useState<string | null>(null);

  // ✅ SINGLE-POINT: T-level session counts from PracticeContext ONLY
  const getT1Sessions = useCallback((): number => {
  if (!sessions || sessions.length === 0) return 0;
  return sessions.filter((s: any) => {
    const tLevel = (s.tLevel || '').toLowerCase();
    const level = (s.level || '').toLowerCase();
    
    return (
      (tLevel === 't1' || level === 't1') &&
      s.completed !== false && 
      s.sessionType === 'meditation'
    );
  }).length;
}, [sessions]);   

  const getT2Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't2' || s.level === 't2') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT3Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't3' || s.level === 't3') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT4Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't4' || s.level === 't4') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const getT5Sessions = useCallback((): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === 't5' || s.level === 't5') && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  // ✅ SINGLE-POINT: Stage 1 progress from PracticeContext ONLY
  const stage1Progress = useMemo(() => {
    if (!sessions) return { sessions: 0, hours: 0, isComplete: false, source: 'loading' };
    
    try {
      // Count ALL T-level sessions for Stage 1
      const t1Count = getT1Sessions();
      const t2Count = getT2Sessions();
      const t3Count = getT3Sessions();
      const t4Count = getT4Sessions();
      const t5Count = getT5Sessions();
      
      const totalTSessions = t1Count + t2Count + t3Count + t4Count + t5Count;
      
      // Calculate hours from T-level sessions
      const stage1Sessions = sessions.filter((session: any) => 
        session.tLevel || 
        session.level?.startsWith('t') ||
        session.stageLevel === 1 || 
        session.stage === 1 ||
        (session.metadata && session.metadata.stage === 1)
      );
      
      const totalMinutes = stage1Sessions.reduce((total: number, session: any) => {
        return total + (session.duration || 0);
      }, 0);
      
      const totalHours = totalMinutes / 60;
      
      console.log('🎯 Stage 1 Progress Calculation:', {
        t1Sessions: t1Count,
        t2Sessions: t2Count,
        t3Sessions: t3Count,
        t4Sessions: t4Count,
        t5Sessions: t5Count,
        totalTSessions,
        totalMinutes,
        totalHours: totalHours.toFixed(2)
      });
      
      return {
        sessions: totalTSessions,
        hours: totalHours,
        isComplete: totalHours >= 3, // Stage 1 requires 3 hours
        source: 'practicecontext'
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 1 progress:', error);
      return { sessions: 0, hours: 0, isComplete: false, source: 'error' };
    }
  }, [sessions, getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions]);

  // ✅ SINGLE-POINT: T-level progress from PracticeContext ONLY
  const tLevelProgress = useMemo(() => {
    try {
      const progress = {
        T1: getT1Sessions(),
        T2: getT2Sessions(),
        T3: getT3Sessions(),
        T4: getT4Sessions(),
        T5: getT5Sessions(),
        source: 'practicecontext'
      };
      
      console.log('🎯 T-Level Progress:', progress);
      return progress;
    } catch (error) {
      console.error('❌ Error calculating T-level progress:', error);
      return { T1: 0, T2: 0, T3: 0, T4: 0, T5: 0, source: 'error' };
    }
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions]);

  // ✅ T-LEVEL STATUS CALCULATION - GENERATES THE PRACTICE BUTTONS
  const tStages = useMemo(() => {
    const stages = [];
    const levels = ['T1', 'T2', 'T3', 'T4', 'T5'];
    
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const sessions = tLevelProgress[level as keyof typeof tLevelProgress] || 0;
      const isComplete = sessions >= 3;
      
      // T1 is always accessible, others require previous level completion
      let isAccessible = i === 0; // T1 is always accessible
      if (i > 0) {
        const prevLevel = levels[i - 1];
        const prevSessions = tLevelProgress[prevLevel as keyof typeof tLevelProgress] || 0;
        isAccessible = prevSessions >= 3; // Previous level must be complete
      }
      
      stages.push({
        level,
        sessions,
        isComplete,
        isAccessible,
        stage1Hours: stage1Progress.hours,
        isStage1Complete: stage1Progress.isComplete,
        hoursProgress: (stage1Progress.hours / 3) * 100,
        source: tLevelProgress.source
      });
    }
    
    console.log('🎯 Generated T-stages:', stages);
    return stages;
  }, [tLevelProgress, stage1Progress]);

  // ✅ FIXED: Start practice handler with data sanitization
  const handleStartPractice = useCallback((tLevel: string, duration: number) => {
    console.log(`🧘 Starting ${tLevel} practice (${duration} minutes)`);
    
    // Check T1 introduction using UserContext (profile management)
    if (tLevel === 'T1') {
      const hasSeenT1Intro = (userProfile as any)?.stageProgress?.completedStageIntros?.includes('t1-intro') || false;
      
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

  // ✅ Loading state
  if (isLoading) {
    return (
      <MainNavigation>
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(102, 126, 234, 0.3)',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <div style={{ color: '#374151', fontSize: '16px' }}>
              Loading Stage 1 progress...
            </div>
          </div>
        </div>
      </MainNavigation>
    );
  }

  // ✅ Authentication check
  if (!currentUser) {
    return (
      <MainNavigation>
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ color: '#374151', fontSize: '18px' }}>
            Please log in to access Stage 1
          </div>
        </div>
      </MainNavigation>
    );
  }

  return (
    <MainNavigation>
      <div className="stage1-wrapper">
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
            Stage 1: Physical Stillness
          </h2>
          
          <div className="progress-info" style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap',
            marginBottom: '12px'
          }}>
            <span style={{ color: '#6b7280' }}>
              Sessions: {stage1Progress.sessions}
            </span>
            <span style={{ color: '#6b7280' }}>
              Hours: {stage1Progress.hours.toFixed(1)}/3
            </span>
            <span style={{ 
              color: stage1Progress.isComplete ? '#059669' : '#6b7280',
              fontWeight: '600'
            }}>
              Progress: {Math.round((stage1Progress.hours / 3) * 100)}%
              {stage1Progress.isComplete && ' ✅'}
            </span>
          </div>
          
          <div style={{
            background: '#e5e7eb',
            borderRadius: '10px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '100%',
              width: `${Math.min((stage1Progress.hours / 3) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
          
          <div style={{
            marginTop: '8px',
            fontSize: '12px',
            opacity: '0.8',
            color: '#6b7280'
          }}>
            ✅ Single-point data source: {stage1Progress.source}
          </div>
          
          {stage1Progress.isComplete && (
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

        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '20px'
        }}>
          <p style={{
            fontSize: '18px',
            color: '#666',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Develop physical foundation through progressive stillness training from 10 to 30 minutes.
          </p>

          {/* ✅ Loading and Error States */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <div style={{ color: '#dc2626', fontSize: '16px', marginBottom: '8px' }}>
                ⚠️ {error}
              </div>
              <button
                onClick={() => setError(null)}
                style={{
                  padding: '8px 16px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ✅ T-STAGES GRID - THE PRACTICE BUTTONS */}
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

          {/* ✅ SINGLE-POINT COMPLIANCE DEBUG INFO */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginTop: '40px',
              padding: '20px',
              background: '#f0fdf4',
              border: '2px solid #10b981',
              borderRadius: '12px',
              fontSize: '14px'
            }}>
              <h4 style={{ color: '#059669', margin: '0 0 12px 0' }}>
                ✅ Single-Point Compliance Debug:
              </h4>
              <div style={{ color: '#065f46' }}>
                <div><strong>✅ Data Source: PracticeContext ONLY</strong></div>
                <div>T1: {tLevelProgress.T1}/3 ({tLevelProgress.T1 >= 3 ? 'Complete' : 'Incomplete'})</div>
                <div>T2: {tLevelProgress.T2}/3 ({tLevelProgress.T2 >= 3 ? 'Complete' : 'Incomplete'})</div>
                <div>T3: {tLevelProgress.T3}/3 ({tLevelProgress.T3 >= 3 ? 'Complete' : 'Incomplete'})</div>
                <div>T4: {tLevelProgress.T4}/3 ({tLevelProgress.T4 >= 3 ? 'Complete' : 'Incomplete'})</div>
                <div>T5: {tLevelProgress.T5}/3 ({tLevelProgress.T5 >= 3 ? 'Complete' : 'Incomplete'})</div>
                <div><strong>Stage 1 Hours: {stage1Progress.hours.toFixed(2)}/3.0</strong></div>
                <div><strong>Stage 1 Complete: {stage1Progress.isComplete ? 'Yes' : 'No'}</strong></div>
                <div><strong>Current Stage: {getCurrentStage()}</strong></div>
                <div><strong>Progress Source: {stage1Progress.source}</strong></div>
                <div><strong>T-Level Source: {tLevelProgress.source}</strong></div>
                <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
                <div>Total Sessions: {sessions?.length || 0}</div>
                <div>Total T-stages: {tStages.length}</div>
              </div>
            </div>
          )}
        </div>

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

export default Stage1Wrapper;