// ✅ ENHANCED T5Introduction.tsx - FIREBASE INTEGRATION
// File: src/T5Introduction.tsx
// ✅ ENHANCED: Complete Firebase context integration
// ✅ ENHANCED: Real-time progress tracking and validation
// ✅ ENHANCED: Hours-based progression awareness
// ✅ ENHANCED: T1, T2, T3, and T4 prerequisite validation

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import './StageLevelIntroduction.css';

interface T5IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T5Introduction: React.FC<T5IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ ENHANCED: Firebase context integration
  const { currentUser } = useAuth();
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

  console.log('🔥 T5Introduction - Received state:', state);

  // ✅ ENHANCED: Real-time T1, T2, T3, T4, and T5 progress calculation
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
      
      // Calculate T5 progress
      const t5Sessions = allSessions.filter(session => 
        session.tLevel === 'T5' || 
        session.level === 't5' ||
        (session.stageLevel === 1 && session.sessionType === 'meditation' && session.duration > 27 && session.duration <= 32)
      ).length;
      
      const isT1Complete = t1Sessions >= 3;
      const isT2Complete = t2Sessions >= 3;
      const isT3Complete = t3Sessions >= 3;
      const isT4Complete = t4Sessions >= 3;
      const isT5Complete = t5Sessions >= 3;
      const canAccessT5 = isT1Complete && isT2Complete && isT3Complete && isT4Complete && currentStage >= 1;
      
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
        
        // T5 Data
        t5Sessions,
        t5Required: 3,
        t5Complete: isT5Complete,
        t5Percentage: Math.min((t5Sessions / 3) * 100, 100),
        
        // General Data
        currentStage,
        totalHours,
        canAccessT5,
        totalSessions: stats.totalSessions,
        estimatedT5Time: `${t5Sessions * 30} minutes completed`,
        
        // Prerequisites summary
        prerequisitesMet: isT1Complete && isT2Complete && isT3Complete && isT4Complete,
        missingPrerequisites: [
          ...(isT1Complete ? [] : ['T1']),
          ...(isT2Complete ? [] : ['T2']),
          ...(isT3Complete ? [] : ['T3']),
          ...(isT4Complete ? [] : ['T4'])
        ],
        
        // Complete foundation summary
        foundationTime: (t1Sessions * 10) + (t2Sessions * 15) + (t3Sessions * 20) + (t4Sessions * 25) + (t5Sessions * 30),
        foundationSessions: t1Sessions + t2Sessions + t3Sessions + t4Sessions + t5Sessions,
        physicalReadinessComplete: isT5Complete,
        stageOneComplete: isT5Complete // T5 completion = Stage 1 (Physical Readiness) complete
      };
    } catch (error) {
      console.error('Error calculating T5 progress:', error);
      return {
        t1Sessions: 0, t1Required: 3, t1Complete: false, t1Percentage: 0,
        t2Sessions: 0, t2Required: 3, t2Complete: false, t2Percentage: 0,
        t3Sessions: 0, t3Required: 3, t3Complete: false, t3Percentage: 0,
        t4Sessions: 0, t4Required: 3, t4Complete: false, t4Percentage: 0,
        t5Sessions: 0, t5Required: 3, t5Complete: false, t5Percentage: 0,
        currentStage: 1, totalHours: 0, canAccessT5: false,
        totalSessions: 0, estimatedT5Time: '0 minutes completed',
        prerequisitesMet: false, missingPrerequisites: ['T1', 'T2', 'T3', 'T4'],
        foundationTime: 0, foundationSessions: 0, physicalReadinessComplete: false,
        stageOneComplete: false
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

    // Check T1, T2, T3, and T4 prerequisites
    if (!progressInfo.prerequisitesMet) {
      const missing = progressInfo.missingPrerequisites.join(', ');
      console.log(`❌ Prerequisites not met - missing: ${missing}`);
      setErrorMessage(
        `T5 requires completion of T1, T2, T3, and T4 first. Missing: ${missing}. ` +
        `Progress: T1 (${progressInfo.t1Sessions}/3), T2 (${progressInfo.t2Sessions}/3), T3 (${progressInfo.t3Sessions}/3), T4 (${progressInfo.t4Sessions}/3).`
      );
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    // Check stage access
    if (!progressInfo.canAccessT5) {
      console.log('❌ Cannot access T5 practice - insufficient stage access');
      setErrorMessage('You need to complete T1, T2, T3, and T4 requirements to access T5 practice.');
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    console.log('✅ T5 Introduction access granted', {
      user: currentUser.uid,
      t1Complete: progressInfo.t1Complete,
      t2Complete: progressInfo.t2Complete,
      t3Complete: progressInfo.t3Complete,
      t4Complete: progressInfo.t4Complete,
      t5Progress: progressInfo.t5Sessions,
      state
    });
    
    setIsLoading(false);
  }, [currentUser, progressInfo, navigate, state]);

  // ✅ ENHANCED: Complete handler with enhanced navigation
  const handleComplete = useCallback(() => {
    try {
      console.log('🎯 T5 Introduction completed - navigating to posture selection');
      
      // ✅ Enhanced navigation with complete practice context
      navigate('/universal-posture-selection', {
        state: {
          tLevel: 'T5',
          duration: 30,
          level: 't5',
          stageLevel: 1,
          returnTo: state?.returnTo || '/stage1',
          fromIntroduction: true,
          fromT5Introduction: true,
          // ✅ Add current progress context
          currentProgress: {
            t1Complete: progressInfo.t1Complete,
            t2Complete: progressInfo.t2Complete,
            t3Complete: progressInfo.t3Complete,
            t4Complete: progressInfo.t4Complete,
            t5Sessions: progressInfo.t5Sessions,
            t5Required: progressInfo.t5Required,
            t5Complete: progressInfo.t5Complete,
            stageOneComplete: progressInfo.stageOneComplete
          },
          // ✅ Add navigation breadcrumb
          breadcrumb: [
            { label: 'Home', path: '/home' },
            { label: 'Stage 1', path: '/stage1' },
            { label: 'T5 Introduction', path: '/t5-introduction' },
            { label: 'Posture Selection', path: '/universal-posture-selection' }
          ]
        }
      });
      
      // Call parent completion handler
      onComplete();
    } catch (error) {
      console.error('Error navigating to posture selection:', error);
      setErrorMessage('Unable to start T5 practice. Please try again.');
    }
  }, [state, progressInfo, navigate, onComplete]);

  // ✅ ENHANCED: Smart back navigation
  const handleBack = useCallback(() => {
    try {
      console.log('🔙 T5 Introduction - navigating back');
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
              Loading T5 practice information...
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
              T5 Access Denied
            </h2>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '20px', maxWidth: '700px' }}>
              {errorMessage}
            </p>
            
            {/* Prerequisites Progress Display */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              maxWidth: '700px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Prerequisites Required for T5 (Complete Physical Readiness):
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {/* T1 Progress */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: progressInfo.t1Complete ? '#d4edda' : '#fff3cd',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>T1 (10 min):</span>
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
                  padding: '8px',
                  background: progressInfo.t2Complete ? '#d4edda' : '#fff3cd',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>T2 (15 min):</span>
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
                  padding: '8px',
                  background: progressInfo.t3Complete ? '#d4edda' : '#fff3cd',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>T3 (20 min):</span>
                  <span style={{ 
                    color: progressInfo.t3Complete ? '#155724' : '#856404',
                    fontWeight: '600'
                  }}>
                    {progressInfo.t3Sessions}/3 {progressInfo.t3Complete ? '✅' : '❌'}
                  </span>
                </div>
                
                {/* T4 Progress */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px',
                  background: progressInfo.t4Complete ? '#d4edda' : '#fff3cd',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '500', fontSize: '14px' }}>T4 (25 min):</span>
                  <span style={{ 
                    color: progressInfo.t4Complete ? '#155724' : '#856404',
                    fontWeight: '600'
                  }}>
                    {progressInfo.t4Sessions}/3 {progressInfo.t4Complete ? '✅' : '❌'}
                  </span>
                </div>
              </div>
              
              {/* Overall Progress Bar */}
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '14px', marginBottom: '6px', color: '#666' }}>
                  Overall Progress to T5:
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
                    width: `${((progressInfo.t1Complete ? 1 : 0) + (progressInfo.t2Complete ? 1 : 0) + (progressInfo.t3Complete ? 1 : 0) + (progressInfo.t4Complete ? 1 : 0)) / 4 * 100}%`,
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
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
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
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
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
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Practice T3
                </button>
              )}
              
              {!progressInfo.t4Complete && progressInfo.t1Complete && progressInfo.t2Complete && progressInfo.t3Complete && (
                <button
                  onClick={() => navigate('/t4-introduction')}
                  style={{
                    padding: '10px 20px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Practice T4
                </button>
              )}
              
              <button
                onClick={handleBack}
                style={{
                  padding: '10px 20px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  fontSize: '13px',
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
        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', // Green gradient for final level
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        margin: '0 20px 24px 20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>T1 Complete ✅</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>
              {progressInfo.t1Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>T2 Complete ✅</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>
              {progressInfo.t2Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>T3 Complete ✅</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>
              {progressInfo.t3Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>T4 Complete ✅</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>
              {progressInfo.t4Sessions}/3
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', opacity: 0.9 }}>T5 Progress</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>
              {progressInfo.t5Sessions}/3
              {progressInfo.t5Complete && ' ✅'}
            </div>
          </div>
        </div>
        
        {/* T5 Progress Bar */}
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
            width: `${Math.min(progressInfo.t5Percentage, 100)}%`,
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {/* Stage Completion Status */}
        {progressInfo.t5Complete && (
          <div style={{
            textAlign: 'center',
            marginTop: '8px',
            fontSize: '12px',
            fontWeight: '600',
            opacity: 0.95
          }}>
            🎉 Stage 1: Physical Readiness COMPLETE! Ready for Stage 2!
          </div>
        )}
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          <h2>T5: Complete Physical Readiness</h2>
          <p>
            T5 practice extends your physical stillness to 30 minutes. 
            This is the final level of Stage One, representing complete physical 
            readiness for advancing to more advanced meditation practices.
          </p>
          
          {/* ✅ ENHANCED: Dynamic Prerequisite Message */}
          <div className="prerequisite-message" style={{
            background: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '8px',
            padding: '12px',
            margin: '16px 0'
          }}>
            <strong>✅ Prerequisites Met:</strong> You have completed the entire foundation: 
            T1 ({progressInfo.t1Sessions}/3), T2 ({progressInfo.t2Sessions}/3), 
            T3 ({progressInfo.t3Sessions}/3), and T4 ({progressInfo.t4Sessions}/3) sessions. 
            You're ready to complete your physical readiness with 30-minute T5 sessions.
          </div>
          
          {/* ✅ ENHANCED: Practice Guidelines */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>T5 Practice Guidelines:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#6c757d' }}>
              <li>Duration: 30 minutes (5 minutes longer than T4)</li>
              <li>Focus: Maintain complete physical stillness and comfort</li>
              <li>Goal: Complete 3 sessions to achieve Physical Readiness</li>
              <li>Milestone: Final step in Stage 1 progression</li>
              <li>Achievement: Unlock Stage 2 meditation practices</li>
              <li>Mastery: Demonstrate sustained 30-minute stillness</li>
            </ul>
          </div>

          {/* ✅ ENHANCED: Session History (if available) */}
          {progressInfo.t5Sessions > 0 && (
            <div style={{
              background: '#e7f3ff',
              borderRadius: '8px',
              padding: '16px',
              margin: '16px 0'
            }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0066cc' }}>Your T5 Progress:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Sessions</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#0066cc' }}>
                    {progressInfo.t5Sessions}/3
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Time Practiced</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#0066cc' }}>
                    {progressInfo.estimatedT5Time}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Completion</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: progressInfo.t5Complete ? '#10b981' : '#0066cc' }}>
                    {Math.round(progressInfo.t5Percentage)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ENHANCED: Complete Foundation Journey Summary */}
          <div style={{
            background: '#e8f5e8',
            borderRadius: '8px',
            padding: '16px',
            margin: '16px 0'
          }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#155724' }}>Complete Foundation Journey:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#28a745', fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '12px' }}>T1: {progressInfo.t1Sessions}×10min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#28a745', fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '12px' }}>T2: {progressInfo.t2Sessions}×15min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#28a745', fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '12px' }}>T3: {progressInfo.t3Sessions}×20min</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#28a745', fontSize: '14px' }}>✅</span>
                <span style={{ fontSize: '12px' }}>T4: {progressInfo.t4Sessions}×25min</span>
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
              <span>Foundation sessions: {progressInfo.foundationSessions}</span>
              <span>Foundation time: {progressInfo.foundationTime} minutes</span>
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '8px',
              fontSize: '13px',
              color: '#155724',
              fontWeight: '600'
            }}>
              🏆 Complete Physical Readiness Foundation Achieved
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
              background: progressInfo.t5Complete 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' // Green for final level
            }}
          >
            {progressInfo.t5Complete 
              ? 'Practice T5 Again' 
              : progressInfo.t5Sessions > 0 
                ? `Complete T5 (${3 - progressInfo.t5Sessions} remaining)`
                : 'Begin Final Practice'
            }
          </button>
        </div>

        {/* ✅ ENHANCED: Stage Completion Message */}
        {progressInfo.t5Complete && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
            color: 'white',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            🎉 STAGE 1 COMPLETE! 🎉<br />
            <span style={{ fontSize: '14px', fontWeight: '400', marginTop: '4px', display: 'block' }}>
              You have achieved complete Physical Readiness! You can continue practicing T5 or advance to Stage 2.
            </span>
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
                <strong>T5 Progress:</strong>
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

export default T5Introduction;