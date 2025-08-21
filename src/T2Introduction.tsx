// ✅ FIXED T2Introduction.tsx - CONSISTENT SESSION COUNTING
// File: src/T2Introduction.tsx
// ✅ FIXED: Uses identical T-level session counting logic as Stage1Wrapper
// ✅ FIXED: Single-point data consistency maintained

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import './StageLevelIntroduction.css';

interface T2IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T2Introduction: React.FC<T2IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ FIXED: Firebase context integration with sessions access
  const { currentUser } = useAuth();
  const { userProfile } = useUser();
  const { 
    getCurrentStage, 
    getTotalPracticeHours,
    getStageProgress,
    calculateStats,
    sessions // ✅ ADDED: Direct access to sessions for consistent counting
  } = usePractice();
  
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [accessDenied, setAccessDenied] = useState(false);
  
  // ✅ Get state passed from navigation
  const state = location.state as {
    tLevel?: string;
    duration?: number;
    level?: string;
    stageLevel?: number;
    returnTo?: string;
    fromStage1?: boolean;
  } | null;

  console.log('🔥 T2Introduction - Received state:', state);

  // ✅ FIXED: Use identical T-level session counting logic as Stage1Wrapper
  const progressInfo = useMemo(() => {
    try {
      // ✅ Use IDENTICAL filtering logic as Stage1Wrapper for ALL T-levels
      const getT1Sessions = (): number => {
        if (!sessions || sessions.length === 0) return 0;

        return sessions.filter((s: any) => {
          const tLevel = (s.tLevel || '').toUpperCase();
          const level = (s.level || '').toUpperCase();
          
          return (
            (tLevel === 'T1' || level === 'T1') &&
            s.completed !== false && 
            s.sessionType === 'meditation'
          );
        }).length;
      };

      const getT2Sessions = (): number => {
        if (!sessions || sessions.length === 0) return 0;

        return sessions.filter((s: any) => {
          const tLevel = (s.tLevel || '').toUpperCase();
          const level = (s.level || '').toUpperCase();
          
          return (
            (tLevel === 'T2' || level === 'T2') &&
            s.completed !== false && 
            s.sessionType === 'meditation'
          );
        }).length;
      };

      const t1Sessions = getT1Sessions();
      const t2Sessions = getT2Sessions();
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const canAccessT2 = isT1Complete && getCurrentStage() >= 1;
      
      console.log('🎯 T2Introduction Progress Calculation:', {
        t1Sessions,
        t2Sessions,
        isT1Complete,
        isT2Complete,
        canAccessT2,
        source: 'practicecontext-sessions'
      });
      
      return {
        // T1 Data
        t1Sessions,
        t1Required: 3,
        t1Complete: isT1Complete,
        t1Percentage: Math.min((t1Sessions / 3) * 100, 100),
        
        // T2 Data
        t2Sessions,
        t2Required: 3,
        t2Complete: isT2Complete,
        t2Percentage: Math.min((t2Sessions / 3) * 100, 100),
        
        // General Data
        currentStage: getCurrentStage(),
        totalHours: getTotalPracticeHours(),
        canAccessT2,
        totalSessions: sessions?.length || 0,
        estimatedT2Time: `${t2Sessions * 15} minutes completed`
      };
    } catch (error) {
      console.error('Error calculating T2 progress:', error);
      return {
        t1Sessions: 0, t1Required: 3, t1Complete: false, t1Percentage: 0,
        t2Sessions: 0, t2Required: 3, t2Complete: false, t2Percentage: 0,
        currentStage: 1, totalHours: 0, canAccessT2: false,
        totalSessions: 0, estimatedT2Time: '0 minutes completed'
      };
    }
  }, [sessions, getCurrentStage, getTotalPracticeHours]);

  // ✅ ENHANCED: Authentication and access validation
  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No authenticated user - redirecting to home');
      navigate('/home');
      return;
    }

    // Check T1 prerequisite
    if (!progressInfo.t1Complete) {
      console.log('❌ T1 not complete - cannot access T2');
      setErrorMessage(
        `T2 requires completion of T1 first. You have completed ${progressInfo.t1Sessions}/3 T1 sessions. Please complete T1 before starting T2.`
      );
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    // Check stage access
    if (!progressInfo.canAccessT2) {
      console.log('❌ Cannot access T2 practice - insufficient stage access');
      setErrorMessage('You need to complete T1 requirements to access T2 practice.');
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    console.log('✅ T2 Introduction access granted', {
      user: currentUser.uid,
      t1Complete: progressInfo.t1Complete,
      t2Progress: progressInfo.t2Sessions,
      state
    });
    
    setIsLoading(false);
  }, [currentUser, progressInfo, navigate, state]);

  // ✅ ENHANCED: Complete handler with enhanced navigation
  const handleComplete = useCallback(() => {
    try {
      console.log('🎯 T2 Introduction completed - navigating to posture selection');
      
      // ✅ Enhanced navigation with complete practice context
      navigate('/universal-posture-selection', {
        state: {
          tLevel: 'T2',
          duration: 15,
          level: 't2',
          stageLevel: 1,
          returnTo: state?.returnTo || '/stage1',
          fromIntroduction: true,
          fromT2Introduction: true,
          // ✅ Add current progress context
          currentProgress: {
            t1Complete: progressInfo.t1Complete,
            t2Sessions: progressInfo.t2Sessions,
            t2Required: progressInfo.t2Required,
            t2Complete: progressInfo.t2Complete
          },
          // ✅ Add navigation breadcrumb
          breadcrumb: [
            { label: 'Home', path: '/home' },
            { label: 'Stage 1', path: '/stage1' },
            { label: 'T2 Introduction', path: '/t2-introduction' },
            { label: 'Posture Selection', path: '/universal-posture-selection' }
          ]
        }
      });
      
      // Call parent completion handler
      onComplete();
    } catch (error) {
      console.error('Error navigating to posture selection:', error);
      setErrorMessage('Unable to start T2 practice. Please try again.');
    }
  }, [state, progressInfo, navigate, onComplete]);

  // ✅ ENHANCED: Smart back navigation
  const handleBack = useCallback(() => {
    try {
      console.log('🔙 T2 Introduction - navigating back');
      onBack();
    } catch (error) {
      console.error('Error navigating back:', error);
      navigate('/stage1');
    }
  }, [onBack, navigate]);

  // ✅ ENHANCED: Loading state
  if (isLoading) {
    return (
      <div className="stage-level-introduction">
        <div className="introduction-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <div style={{ fontSize: '16px', color: '#666' }}>
              Loading T2 practice information...
            </div>
            
            <style>{`
              @keyframes spin { 
                0% { transform: rotate(0deg); } 
                100% { transform: rotate(360deg); } 
              }
            `}</style>
          </div>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Access denied state
  if (accessDenied) {
    return (
      <div className="stage-level-introduction">
        <div className="introduction-container">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
            flexDirection: 'column',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#e74c3c', marginBottom: '16px' }}>
              T2 Access Denied
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', maxWidth: '500px' }}>
              {errorMessage}
            </p>
            
            {/* T1 Progress Display */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              maxWidth: '400px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                T1 Progress Required for T2:
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span>T1 Sessions:</span>
                <span style={{ 
                  color: progressInfo.t1Complete ? '#10b981' : '#f59e0b',
                  fontWeight: '600'
                }}>
                  {progressInfo.t1Sessions}/3 {progressInfo.t1Complete ? '✅' : '❌'}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div style={{
                width: '100%',
                height: '8px',
                background: '#e9ecef',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  background: progressInfo.t1Complete ? '#10b981' : '#f59e0b',
                  width: `${progressInfo.t1Percentage}%`,
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
              
              {/* ✅ Data source indicator */}
              <div style={{
                marginTop: '8px',
                fontSize: '12px',
                opacity: '0.8',
                color: '#6b7280'
              }}>
                ✅ Single-point data source: practicecontext-sessions
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('/t1-introduction')}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Practice T1
              </button>
              
              <button
                onClick={handleBack}
                style={{
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Stage 1
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stageTitle = "Seeker: Physical Readiness";
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h1>{stageTitle}</h1>
      </div>
      
      {/* ✅ FIXED: Real-time Progress Display with correct T-level counting */}
      <div className="progress-summary" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        margin: '0 20px 24px 20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>T1 Complete ✅</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {progressInfo.t1Sessions}/3 Sessions
            </div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>T2 Progress</div>
            <div style={{ fontSize: '18px', fontWeight: '600' }}>
              {progressInfo.t2Sessions}/3 Sessions
              {progressInfo.t2Complete && ' ✅ Complete'}
            </div>
          </div>
        </div>
        
        {/* T2 Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
          marginTop: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'rgba(255,255,255,0.9)',
            width: `${Math.min(progressInfo.t2Percentage, 100)}%`,
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {/* ✅ Data source indicator */}
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          opacity: '0.8',
          color: 'rgba(255,255,255,0.9)'
        }}>
          ✅ Single-point data source: practicecontext-sessions
        </div>
      </div>
             
      <div className="introduction-content">
        <div className="slide-container">
          <h2>T2: Building Endurance</h2>
          <p>
            T2 practice extends your physical stillness to 15 minutes. 
            This level builds on the foundation you established in T1 and 
            helps develop greater physical endurance for meditation.
          </p>
          
          {/* ✅ ENHANCED: Dynamic Prerequisite Message */}
          <div className="prerequisite-message" style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '12px',
            margin: '16px 0'
          }}>
            <strong>✅ Prerequisite Met:</strong> You have completed {progressInfo.t1Sessions}/3 T1 sessions.
            T1 is complete! You're ready to begin T2 practice with 15-minute sessions.
          </div>
          
          {/* ✅ ENHANCED: Practice Guidelines */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>T2 Practice Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
              <li>Duration: 15 minutes (5 minutes longer than T1)</li>
              <li>Focus: Maintain the same physical stillness as T1</li>
              <li>Goal: Complete 3 sessions to unlock T3</li>
              <li>Progression: Build endurance gradually</li>
            </ul>
          </div>

          {/* ✅ ENHANCED: Session History (if available) */}
          {progressInfo.t2Sessions > 0 && (
            <div style={{
              background: '#e7f3ff',
              borderRadius: '8px',
              padding: '16px',
              margin: '16px 0'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>Your T2 Progress:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Sessions</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#0066cc' }}>
                    {progressInfo.t2Sessions}/3
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Time Practiced</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0066cc' }}>
                    {progressInfo.estimatedT2Time}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Completion</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: progressInfo.t2Complete ? '#10b981' : '#0066cc' }}>
                    {Math.round(progressInfo.t2Percentage)}%
                  </div>
                </div>
              </div>
            </div>
          )}
                     
          <div className="slide-progress">
            <div className="progress-dot active" />
          </div>
        </div>
                 
        <div className="navigation-buttons">
          <button className="nav-button back" onClick={handleBack}>
            Back
          </button>
                     
          {/* ✅ ENHANCED: Smart Action Button */}
          <button 
            className="nav-button next" 
            onClick={handleComplete}
            style={{
              background: progressInfo.t2Complete 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {progressInfo.t2Complete 
              ? 'Practice T2 Again' 
              : progressInfo.t2Sessions > 0 
                ? `Continue T2 (${3 - progressInfo.t2Sessions} remaining)`
                : 'Begin T2 Practice'
            }
          </button>
        </div>

        {/* ✅ ENHANCED: Completion Message */}
        {progressInfo.t2Complete && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            padding: '12px',
            background: '#d4edda',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#155724',
            fontWeight: '500'
          }}>
            🎉 T2 Complete! You can continue practicing T2 or progress to T3.
          </div>
        )}

        {/* ✅ FIXED: Debug Info with consistent data source */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f0fdf4',
            border: '2px solid #10b981',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4 style={{ color: '#059669', margin: '0 0 12px 0' }}>
              ✅ Single-Point Compliance Debug:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Navigation State:</strong>
                <pre style={{ fontSize: '11px', margin: '4px 0' }}>
                  {JSON.stringify(state, null, 2)}
                </pre>
              </div>
              <div>
                <strong>T1/T2 Progress (Fixed):</strong>
                <div style={{ color: '#065f46' }}>
                  <div>T1 Sessions: {progressInfo.t1Sessions}/3 ({progressInfo.t1Complete ? 'Complete' : 'Incomplete'})</div>
                  <div>T2 Sessions: {progressInfo.t2Sessions}/3 ({progressInfo.t2Complete ? 'Complete' : 'Incomplete'})</div>
                  <div>Can Access T2: {progressInfo.canAccessT2 ? 'Yes' : 'No'}</div>
                  <div>Data Source: practicecontext-sessions</div>
                  <div>Total Sessions in DB: {progressInfo.totalSessions}</div>
                  <div>User ID: {currentUser?.uid?.substring(0, 8)}...</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default T2Introduction;