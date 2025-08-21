// ✅ FIXED T1Introduction.tsx - CONSISTENT SESSION COUNTING
// File: src/T1Introduction.tsx
// ✅ FIXED: Uses identical T1 session counting logic as Stage1Wrapper
// ✅ FIXED: Single-point data consistency maintained

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import './StageLevelIntroduction.css';

const T1Introduction: React.FC = () => {
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
  
  // ✅ Get state passed from Stage1Wrapper
  const state = location.state as {
    tLevel?: string;
    duration?: number;
    level?: string;
    stageLevel?: number;
    returnTo?: string;
    fromStage1?: boolean;
  } | null;

  console.log('🔥 T1Introduction - Received state:', state);

  // ✅ FIXED: Use identical T1 session counting logic as Stage1Wrapper
  const t1ProgressInfo = useMemo(() => {
    try {
      // ✅ Use IDENTICAL filtering logic as Stage1Wrapper
      const getT1Sessions = (): number => {
        if (!sessions || sessions.length === 0) return 0;

        console.log('🔍 T1Introduction DEBUG - All sessions:', sessions.map(s => ({
          tLevel: s.tLevel,
          level: s.level,
          completed: s.completed,
          sessionType: s.sessionType,
          matchesT1: (s.tLevel || '').toLowerCase() === 't1' || (s.level || '').toLowerCase() === 't1',
          completedCheck: s.completed !== false,
          typeCheck: s.sessionType === 'meditation'
        })));

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

      const t1Sessions = getT1Sessions();
      const t1Required = 3;
      const isT1Complete = t1Sessions >= 3;
      const t1Percentage = Math.min((t1Sessions / t1Required) * 100, 100);
      
      console.log('🎯 T1Introduction Progress Calculation:', {
        t1Sessions,
        t1Required,
        isT1Complete,
        t1Percentage,
        source: 'practicecontext-sessions'
      });
      
      return {
        sessionsCompleted: t1Sessions, // ✅ Now correctly counts only T1 sessions
        totalRequired: t1Required,
        percentage: Math.round(t1Percentage),
        isComplete: isT1Complete,
        currentStage: getCurrentStage(),
        totalHours: getTotalPracticeHours(),
        canPractice: true,
        t1Sessions: t1Sessions,
        estimatedTime: `${t1Sessions * (state?.duration || 10)} minutes completed`
      };
    } catch (error) {
      console.error('Error calculating T1 progress:', error);
      return {
        sessionsCompleted: 0,
        totalRequired: 3,
        percentage: 0,
        isComplete: false,
        currentStage: 1,
        totalHours: 0,
        canPractice: true,
        t1Sessions: 0,
        estimatedTime: '0 minutes completed'
      };
    }
  }, [getCurrentStage, getTotalPracticeHours, sessions, state?.duration]);

  // ✅ ENHANCED: Authentication and access validation
  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No authenticated user - redirecting to home');
      navigate('/home');
      return;
    }

    if (!t1ProgressInfo.canPractice) {
      console.log('❌ Cannot access T1 practice - insufficient stage access');
      setErrorMessage('You need to complete previous requirements to access T1 practice.');
      return;
    }

    console.log('✅ T1 Introduction access granted', {
      user: currentUser.uid,
      progress: t1ProgressInfo,
      state
    });
    
    setIsLoading(false);
  }, [currentUser, t1ProgressInfo, navigate, state]);

  // ✅ ENHANCED: Navigate to Universal Posture Selection with enhanced state
  const handleComplete = useCallback(() => {
    try {
      console.log('🎯 T1 Introduction completed - navigating to posture selection');
      
      // ✅ Enhanced navigation with complete practice context
      navigate('/universal-posture-selection', {
        state: {
          tLevel: state?.tLevel || 'T1',
          duration: state?.duration || 10,
          level: state?.level || 't1',
          stageLevel: state?.stageLevel || 1,
          returnTo: state?.returnTo || '/stage1',
          fromIntroduction: true,
          fromStage1: state?.fromStage1 || false,
          // ✅ Add current progress context
          currentProgress: {
            sessionsCompleted: t1ProgressInfo.sessionsCompleted,
            totalRequired: t1ProgressInfo.totalRequired,
            isComplete: t1ProgressInfo.isComplete
          },
          // ✅ Add navigation breadcrumb
          breadcrumb: [
            { label: 'Home', path: '/home' },
            { label: 'Stage 1', path: '/stage1' },
            { label: 'T1 Introduction', path: '/t1-introduction' },
            { label: 'Posture Selection', path: '/universal-posture-selection' }
          ]
        }
      });
    } catch (error) {
      console.error('Error navigating to posture selection:', error);
      setErrorMessage('Unable to start practice. Please try again.');
    }
  }, [state, t1ProgressInfo, navigate]);

  // ✅ ENHANCED: Smart back navigation
  const handleBack = useCallback(() => {
    try {
      console.log('🔙 T1 Introduction - navigating back to stage');
      const returnPath = state?.returnTo || '/stage1';
      
      navigate(returnPath, {
        state: {
          fromT1Introduction: true,
          preserveState: true
        }
      });
    } catch (error) {
      console.error('Error navigating back:', error);
      navigate('/stage1');
    }
  }, [state, navigate]);

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
              Loading T1 practice information...
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

  // ✅ ENHANCED: Error state
  if (errorMessage) {
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
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#e74c3c', marginBottom: '16px' }}>
              Access Error
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', maxWidth: '400px' }}>
              {errorMessage}
            </p>
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
    );
  }

  const stageTitle = "Seeker: Physical Readiness";
  const stageDescription = "Develop physical foundation through progressive stillness training from 10 to 30 minutes.";

  return (
    <div className="stage-level-introduction">
      <div className="introduction-container">
        {/* Header */}
        <div className="introduction-header">
          <button 
            className="back-button"
            onClick={handleBack}
            aria-label="Go back to stage selection"
          >
            ← Back
          </button>
          <h1 className="stage-title">{stageTitle}</h1>
        </div>

        {/* ✅ FIXED: Real-time Progress Display with correct T1 counting */}
        <div className="progress-summary" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>T1 Progress</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {t1ProgressInfo.sessionsCompleted}/{t1ProgressInfo.totalRequired} Sessions
                {t1ProgressInfo.isComplete && ' ✅ Complete'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Stage 1 Progress</div>
              <div style={{ fontSize: '16px', fontWeight: '600' }}>
                {t1ProgressInfo.totalHours.toFixed(1)} hours
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
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
              width: `${Math.min(t1ProgressInfo.percentage, 100)}%`,
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

        {/* Content */}
        <div className="introduction-content">
          <div className="stage-overview">
            <h2>Stage 1: Physical Stillness</h2>
            <p className="stage-description">{stageDescription}</p>
          </div>

          <div className="level-details">
            <h3>T1: Physical Stillness Training</h3>
            <div className="level-info">
              <div className="duration-info">
                <span className="label">Duration:</span>
                <span className="value">{state?.duration || 10} minutes</span>
              </div>
              <div className="objective-info">
                <span className="label">Objective:</span>
                <span className="value">Develop basic physical stillness and posture awareness</span>
              </div>
              <div className="status-info">
                <span className="label">Status:</span>
                <span className="value" style={{
                  color: t1ProgressInfo.isComplete ? '#10b981' : '#f59e0b'
                }}>
                  {t1ProgressInfo.isComplete ? 'Complete ✅' : 'In Progress'}
                </span>
              </div>
            </div>

            <div className="practice-guidelines">
              <h4>Practice Guidelines:</h4>
              <ul>
                <li>Find a comfortable seated position with your spine naturally upright</li>
                <li>Allow your breathing to be natural and relaxed</li>
                <li>Focus on maintaining physical stillness throughout the session</li>
                <li>Gently return attention to posture when the mind wanders</li>
                <li>Complete 3 sessions to unlock the next level</li>
              </ul>
            </div>

            <div className="benefits">
              <h4>Benefits:</h4>
              <ul>
                <li>Improved postural awareness and control</li>
                <li>Enhanced ability to maintain physical stillness</li>
                <li>Foundation for deeper meditation practices</li>
                <li>Increased mind-body connection</li>
              </ul>
            </div>

            {/* ✅ ENHANCED: Session History (if available) */}
            {t1ProgressInfo.t1Sessions > 0 && (
              <div className="session-history" style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '8px',
                marginTop: '16px'
              }}>
                <h4>Your T1 Practice History:</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Total Sessions</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#667eea' }}>
                      {t1ProgressInfo.t1Sessions}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Time Practiced</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#667eea' }}>
                      {t1ProgressInfo.estimatedTime}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Completion</div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: t1ProgressInfo.isComplete ? '#10b981' : '#f59e0b' }}>
                      {t1ProgressInfo.percentage}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ENHANCED: Action Button with Smart Messaging */}
        <div className="introduction-actions">
          <button 
            className="begin-practice-button"
            onClick={handleComplete}
            style={{
              background: t1ProgressInfo.isComplete 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {t1ProgressInfo.isComplete 
              ? 'Practice T1 Again' 
              : t1ProgressInfo.sessionsCompleted > 0 
                ? `Continue T1 Practice (${3 - t1ProgressInfo.sessionsCompleted} remaining)`
                : 'Begin T1 Practice'
            }
          </button>
          
          {t1ProgressInfo.isComplete && (
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '14px',
              color: '#10b981',
              fontWeight: '500'
            }}>
              🎉 T1 Complete! You can continue practicing or move to the next level.
            </div>
          )}
        </div>

        {/* ✅ FIXED: Debug Info with consistent data source */}
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-info" style={{
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
                <strong>T1 Progress (Fixed):</strong>
                <div style={{ color: '#065f46' }}>
                  <div>T1 Sessions: {t1ProgressInfo.sessionsCompleted}/3</div>
                  <div>Complete: {t1ProgressInfo.isComplete ? 'Yes' : 'No'}</div>
                  <div>Percentage: {t1ProgressInfo.percentage}%</div>
                  <div>Data Source: practicecontext-sessions</div>
                  <div>Total Sessions in DB: {sessions?.length || 0}</div>
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

export default T1Introduction;