// ✅ ENHANCED T4Introduction.tsx - FIREBASE INTEGRATION
// File: src/T4Introduction.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Real-time progress tracking and validation
// ✅ ENHANCED: Hours-based progression awareness
// ✅ ENHANCED: T1, T2, and T3 prerequisite validation

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import './StageLevelIntroduction.css';

interface T4IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T4Introduction: React.FC<T4IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ ENHANCED: Firebase context integration
  const { currentUser } = useAuth();
  const { userProfile } = useUser();
  const { 
    getCurrentStage, 
    getTotalPracticeHours,
    getStageProgress,
    calculateStats,
    sessions
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

  console.log('🔥 T4Introduction - Received state:', state);

  // ✅ ENHANCED: Real-time T1, T2, T3, and T4 progress calculation
  const progressInfo = useMemo(() => {
    try {
      const allSessions = sessions || [];
      const stats = calculateStats();
      const currentStage = getCurrentStage();
      const totalHours = getTotalPracticeHours();
      
      // Calculate T1 progress
      const t1Sessions = allSessions.filter(session => 
        session.tLevel === 'T1' || 
        session.level === 't1' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration <= 12)
      ).length;
      
      // Calculate T2 progress
      const t2Sessions = allSessions.filter(session => 
        session.tLevel === 'T2' || 
        session.level === 't2' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 12 && session.duration <= 17)
      ).length;
      
      // Calculate T3 progress
      const t3Sessions = allSessions.filter(session => 
        session.tLevel === 'T3' || 
        session.level === 't3' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 17 && session.duration <= 22)
      ).length;
      
      // Calculate T4 progress
      const t4Sessions = allSessions.filter(session => 
        session.tLevel === 'T4' || 
        session.level === 't4' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 22 && session.duration <= 27)
      ).length;
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const isT3Complete = t3Sessions >= 3;
      const isT4Complete = t4Sessions >= 3;
      const canAccessT4 = isT1Complete && isT2Complete && isT3Complete && currentStage >= 1;
      
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
        
        // T3 Data
        t3Sessions,
        t3Required: 3,
        t3Complete: isT3Complete,
        t3Percentage: Math.min((t3Sessions / 3) * 100, 100),
        
        // T4 Data
        t4Sessions,
        t4Required: 3,
        t4Complete: isT4Complete,
        t4Percentage: Math.min((t4Sessions / 3) * 100, 100),
        
        // General Data
        currentStage,
        totalHours,
        canAccessT4,
        totalSessions: stats.totalSessions,
        estimatedT4Time: `${t4Sessions * 25} minutes completed`,
        
        // Prerequisites summary
        prerequisitesMet: isT1Complete && isT2Complete && isT3Complete,
        missingPrerequisites: [
          ...(isT1Complete ? [] : ['T1']),
          ...(isT2Complete ? [] : ['T2']),
          ...(isT3Complete ? [] : ['T3'])
        ],
        
        // Foundation summary
        foundationTime: (t1Sessions * 10) + (t2Sessions * 15) + (t3Sessions * 20) + (t4Sessions * 25),
        foundationSessions: t1Sessions + t2Sessions + t3Sessions + t4Sessions
      };
    } catch (error) {
      console.error('Error calculating T4 progress:', error);
      return {
        t1Sessions: 0, t1Required: 3, t1Complete: false, t1Percentage: 0,
        t2Sessions: 0, t2Required: 3, t2Complete: false, t2Percentage: 0,
        t3Sessions: 0, t3Required: 3, t3Complete: false, t3Percentage: 0,
        t4Sessions: 0, t4Required: 3, t4Complete: false, t4Percentage: 0,
        currentStage: 1, totalHours: 0, canAccessT4: false,
        totalSessions: 0, estimatedT4Time: '0 minutes completed',
        prerequisitesMet: false, missingPrerequisites: ['T1', 'T2', 'T3'],
        foundationTime: 0, foundationSessions: 0
      };
    }
  }, [sessions, calculateStats, getCurrentStage, getTotalPracticeHours]);

  // ✅ ENHANCED: Authentication and access validation
  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No authenticated user - redirecting to home');
      navigate('/home');
      return;
    }

    // Check T1, T2, and T3 prerequisites
    if (!progressInfo.prerequisitesMet) {
      const missing = progressInfo.missingPrerequisites.join(', ');
      console.log(`❌ Prerequisites not met - missing: ${missing}`);
      setErrorMessage(
        `T4 requires completion of T1, T2, and T3 first. Missing: ${missing}. ` +
        `Progress: T1 (${progressInfo.t1Sessions}/3), T2 (${progressInfo.t2Sessions}/3), T3 (${progressInfo.t3Sessions}/3).`
      );
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    // Check stage access
    if (!progressInfo.canAccessT4) {
      console.log('❌ Cannot access T4 practice - insufficient stage access');
      setErrorMessage('You need to complete T1, T2, and T3 requirements to access T4 practice.');
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    console.log('✅ T4 Introduction access granted', {
      user: currentUser.uid,
      t1Complete: progressInfo.t1Complete,
      t2Complete: progressInfo.t2Complete,
      t3Complete: progressInfo.t3Complete,
      t4Progress: progressInfo.t4Sessions,
      state
    });
    
    setIsLoading(false);
  }, [currentUser, progressInfo, navigate, state]);

  // ✅ ENHANCED: Complete handler with enhanced navigation
  const handleComplete = useCallback(() => {
    try {
      console.log('🎯 T4 Introduction completed - navigating to posture selection');
      
      // ✅ Enhanced navigation with complete practice context
      navigate('/universal-posture-selection', {
        state: {
          tLevel: 'T4',
          duration: 25,
          level: 't4',
          stageLevel: 1,
          returnTo: state?.returnTo || '/stage1',
          fromIntroduction: true,
          fromT4Introduction: true,
          // ✅ Add current progress context
          currentProgress: {
            t1Complete: progressInfo.t1Complete,
            t2Complete: progressInfo.t2Complete,
            t3Complete: progressInfo.t3Complete,
            t4Sessions: progressInfo.t4Sessions,
            t4Required: progressInfo.t4Required,
            t4Complete: progressInfo.t4Complete
          },
          // ✅ Add navigation breadcrumb
          breadcrumb: [
            { label: 'Home', path: '/home' },
            { label: 'Stage 1', path: '/stage1' },
            { label: 'T4 Introduction', path: '/t4-introduction' },
            { label: 'Posture Selection', path: '/universal-posture-selection' }
          ]
        }
      });
      
      // Call parent completion handler
      onComplete();
    } catch (error) {
      console.error('Error navigating to posture selection:', error);
      setErrorMessage('Unable to start T4 practice. Please try again.');
    }
  }, [state, progressInfo, navigate, onComplete]);

  // ✅ ENHANCED: Smart back navigation
  const handleBack = useCallback(() => {
    try {
      console.log('🔙 T4 Introduction - navigating back');
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
              Loading T4 practice information...
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
              T4 Access Denied
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', maxWidth: '600px' }}>
              {errorMessage}
            </p>
            
            {/* Prerequisites Progress Display */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              maxWidth: '600px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Prerequisites Required for T4:
              </div>
              
              {/* T1 Progress */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                padding: '8px',
                background: progressInfo.t1Complete ? '#d4edda' : '#fff3cd',
                borderRadius: '6px'
              }}>
                <span style={{ fontWeight: '500' }}>T1 Sessions (10 min):</span>
                <span style={{ 
                  color: progressInfo.t1Complete ? '#155724' : '#856404',
                  fontWeight: '600'
                }}>
                  {progressInfo.t1Sessions}/3 {progressInfo.t1Complete ? '✅' : '❌'}
                </span>
              </div>
              
              {/* T2 Progress */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                padding: '8px',
                background: progressInfo.t2Complete ? '#d4edda' : '#fff3cd',
                borderRadius: '6px'
              }}>
                <span style={{ fontWeight: '500' }}>T2 Sessions (15 min):</span>
                <span style={{ 
                  color: progressInfo.t2Complete ? '#155724' : '#856404',
                  fontWeight: '600'
                }}>
                  {progressInfo.t2Sessions}/3 {progressInfo.t2Complete ? '✅' : '❌'}
                </span>
              </div>
              
              {/* T3 Progress */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
                padding: '8px',
                background: progressInfo.t3Complete ? '#d4edda' : '#fff3cd',
                borderRadius: '6px'
              }}>
                <span style={{ fontWeight: '500' }}>T3 Sessions (20 min):</span>
                <span style={{ 
                  color: progressInfo.t3Complete ? '#155724' : '#856404',
                  fontWeight: '600'
                }}>
                  {progressInfo.t3Sessions}/3 {progressInfo.t3Complete ? '✅' : '❌'}
                </span>
              </div>
              
              {/* Overall Progress Bar */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '14px', marginBottom: '6px', color: '#666' }}>
                  Overall Progress to T4:
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  background: '#e9ecef',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    background: progressInfo.prerequisitesMet ? '#28a745' : '#ffc107',
                    width: `${((progressInfo.t1Complete ? 1 : 0) + (progressInfo.t2Complete ? 1 : 0) + (progressInfo.t3Complete ? 1 : 0)) / 3 * 100}%`,
                    borderRadius: '5px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {!progressInfo.t1Complete && (
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
              )}
              
              {!progressInfo.t2Complete && progressInfo.t1Complete && (
                <button
                  onClick={() => navigate('/t2-introduction')}
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
                  Practice T2
                </button>
              )}
              
              {!progressInfo.t3Complete && progressInfo.t1Complete && progressInfo.t2Complete && (
                <button
                  onClick={() => navigate('/t3-introduction')}
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
                  Practice T3
                </button>
              )}
              
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
      
      {/* ✅ ENHANCED: Real-time Progress Display */}
      <div className="progress-summary" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        margin: '0 20px 24px 20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>T1 Complete ✅</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {progressInfo.t1Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>T2 Complete ✅</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {progressInfo.t2Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>T3 Complete ✅</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {progressInfo.t3Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>T4 Progress</div>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>
              {progressInfo.t4Sessions}/3
              {progressInfo.t4Complete && ' ✅'}
            </div>
          </div>
        </div>
        
        {/* T4 Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'rgba(255,255,255,0.9)',
            width: `${Math.min(progressInfo.t4Percentage, 100)}%`,
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          <h2>T4: Extended Stillness</h2>
          <p>
            T4 practice extends your physical stillness to 25 minutes. 
            At this level, you're developing significant physical endurance 
            that will support deeper meditation practices in future stages.
          </p>
          
          {/* ✅ ENHANCED: Dynamic Prerequisite Message */}
          <div className="prerequisite-message" style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '12px',
            margin: '16px 0'
          }}>
            <strong>✅ Prerequisites Met:</strong> You have completed T1 ({progressInfo.t1Sessions}/3), 
            T2 ({progressInfo.t2Sessions}/3), and T3 ({progressInfo.t3Sessions}/3) sessions. 
            You're ready to begin T4 practice with 25-minute sessions.
          </div>
          
          {/* ✅ ENHANCED: Practice Guidelines */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>T4 Practice Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
              <li>Duration: 25 minutes (5 minutes longer than T3)</li>
              <li>Focus: Maintain the same physical stillness from previous T-levels</li>
              <li>Goal: Complete 3 sessions to unlock T5</li>
              <li>Progression: Build significant physical endurance</li>
              <li>Challenge: Extended duration requires deeper relaxation skills</li>
              <li>Preparation: Ensure you can complete T3 without any physical stress</li>
            </ul>
          </div>

          {/* ✅ ENHANCED: Session History (if available) */}
          {progressInfo.t4Sessions > 0 && (
            <div style={{
              background: '#e7f3ff',
              borderRadius: '8px',
              padding: '16px',
              margin: '16px 0'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>Your T4 Progress:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Sessions</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#0066cc' }}>
                    {progressInfo.t4Sessions}/3
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Time Practiced</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0066cc' }}>
                    {progressInfo.estimatedT4Time}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Completion</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: progressInfo.t4Complete ? '#10b981' : '#0066cc' }}>
                    {Math.round(progressInfo.t4Percentage)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ENHANCED: Complete Foundation Summary */}
          <div style={{
            background: '#e8f5e8',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#155724' }}>Foundation Completed:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#28a745', fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '14px' }}>T1: {progressInfo.t1Sessions}×10min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#28a745', fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '14px' }}>T2: {progressInfo.t2Sessions}×15min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#28a745', fontSize: '16px' }}>✅</span>
                <span style={{ fontSize: '14px' }}>T3: {progressInfo.t3Sessions}×20min</span>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontSize: '14px', 
              color: '#155724',
              borderTop: '1px solid #c3e6cb',
              paddingTop: '8px'
            }}>
              <span>Total foundation sessions: {progressInfo.foundationSessions}</span>
              <span>Total foundation time: {progressInfo.foundationTime} minutes</span>
            </div>
          </div>
          
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
              background: progressInfo.t4Complete 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {progressInfo.t4Complete 
              ? 'Practice T4 Again' 
              : progressInfo.t4Sessions > 0 
                ? `Continue T4 (${3 - progressInfo.t4Sessions} remaining)`
                : 'Begin T4 Practice'
            }
          </button>
        </div>

        {/* ✅ ENHANCED: Completion Message */}
        {progressInfo.t4Complete && (
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
            🎉 T4 Complete! You can continue practicing T4 or progress to T5. 
            You've built significant physical endurance!
          </div>
        )}

        {/* ✅ ENHANCED: Debug Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '12px'
          }}>
            <h4>Debug Info:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <strong>Navigation State:</strong>
                <pre style={{ fontSize: '11px', margin: '4px 0' }}>
                  {JSON.stringify(state, null, 2)}
                </pre>
              </div>
              <div>
                <strong>T4 Progress:</strong>
                <pre style={{ fontSize: '11px', margin: '4px 0' }}>
                  {JSON.stringify(progressInfo, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default T4Introduction;