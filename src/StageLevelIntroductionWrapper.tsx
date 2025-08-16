// ===============================================
// 🔧 ENHANCED StageLevelIntroductionWrapper.tsx - FIREBASE INTEGRATION
// ===============================================

// FILE: src/StageLevelIntroductionWrapper.tsx
// ✅ ENHANCED: Complete Firebase integration with contexts
// ✅ ENHANCED: Hours-based stage progression validation
// ✅ ENHANCED: Real-time data synchronization
// ✅ ENHANCED: Better error handling and navigation

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import StageLevelIntroduction from './StageLevelIntroduction';
import MainNavigation from './MainNavigation';

interface StageLevelIntroductionWrapperProps {}

const StageLevelIntroductionWrapper: React.FC<StageLevelIntroductionWrapperProps> = () => {
  const { stageNumber } = useParams<{ stageNumber: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ ENHANCED: Firebase context integration
  const { currentUser } = useAuth();
  const { userProfile } = useUser();
  const { 
    getCurrentStage, 
    canAdvanceToStage, 
    getTotalPracticeHours,
    getStageProgress 
  } = usePractice();
  
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const stageNum = parseInt(stageNumber || '1', 10);

  // ✅ ENHANCED: Stage access validation with Firebase data
  const stageAccessInfo = useMemo(() => {
    try {
      const currentStage = getCurrentStage();
      const totalHours = getTotalPracticeHours();
      const canAccess = canAdvanceToStage(stageNum);
      const progress = getStageProgress(stageNum);
      
      // Check if user has seen this intro before
      const completedIntros = userProfile?.stageProgress?.completedStageIntros || [];
      const introKey = `stage${stageNum}-intro`;
      const hasSeenBefore = completedIntros.includes(introKey);
      
      return {
        currentStage,
        totalHours,
        canAccess,
        progress,
        hasSeenBefore,
        isValidStage: stageNum >= 1 && stageNum <= 6
      };
    } catch (error) {
      console.error('Error calculating stage access:', error);
      return {
        currentStage: 1,
        totalHours: 0,
        canAccess: stageNum === 1,
        progress: { completed: 0, total: 5, percentage: 0 },
        hasSeenBefore: false,
        isValidStage: stageNum >= 1 && stageNum <= 6
      };
    }
  }, [getCurrentStage, getTotalPracticeHours, canAdvanceToStage, getStageProgress, stageNum, userProfile]);

  // ✅ ENHANCED: Stage access validation
  useEffect(() => {
    if (!currentUser) {
      console.log('❌ No authenticated user - redirecting to home');
      navigate('/home');
      return;
    }

    // Validate stage number
    if (!stageAccessInfo.isValidStage) {
      console.log(`❌ Invalid stage number: ${stageNum}`);
      setErrorMessage(`Invalid stage number: ${stageNum}. Valid stages are 1-6.`);
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    // Check stage access permissions
    if (!stageAccessInfo.canAccess) {
      const hourRequirements = [0, 5, 10, 15, 20, 25, 30]; // Stage 1 = 0, Stage 2 = 5, etc.
      const requiredHours = hourRequirements[stageNum - 1] || 5;
      
      console.log(`❌ Stage ${stageNum} access denied - need ${requiredHours} hours, have ${stageAccessInfo.totalHours.toFixed(1)}`);
      setErrorMessage(
        `Stage ${stageNum} requires ${requiredHours} practice hours. You currently have ${stageAccessInfo.totalHours.toFixed(1)} hours. Complete more practice to unlock this stage.`
      );
      setAccessDenied(true);
      setIsLoading(false);
      return;
    }

    console.log(`✅ Stage ${stageNum} access granted`, {
      currentStage: stageAccessInfo.currentStage,
      totalHours: stageAccessInfo.totalHours.toFixed(1),
      hasSeenBefore: stageAccessInfo.hasSeenBefore
    });
    
    setAccessDenied(false);
    setErrorMessage('');
    setIsLoading(false);
  }, [currentUser, stageNum, stageAccessInfo, navigate]);

  // ✅ ENHANCED: Listen for refreshPAHM event with error handling
  useEffect(() => {
    const handleRefreshPAHM = (event: Event) => {
      try {
        const customEvent = event as CustomEvent;
        const stage = customEvent.detail?.stageNumber || stageNum;
        
        console.log(`🔄 Refresh PAHM event for stage ${stage}`);
        
        // Navigate to PAHM explanation with return stage info
        navigate('/learning/pahm', { 
          state: { 
            returnToStage: stage,
            isRefresh: true,
            fromIntroduction: true
          } 
        });
      } catch (error) {
        console.error('Error handling refreshPAHM event:', error);
      }
    };

    window.addEventListener('refreshPAHM', handleRefreshPAHM);
    
    return () => {
      window.removeEventListener('refreshPAHM', handleRefreshPAHM);
    };
  }, [navigate, stageNum]);

  // ✅ ENHANCED: Complete handler with proper navigation
  const handleComplete = useCallback(() => {
    try {
      console.log(`🎯 Stage ${stageNum} introduction completed`);
      
      // Determine where to navigate based on stage and completion state
      const state = location.state as any;
      const returnTo = state?.returnTo;
      
      if (returnTo) {
        console.log(`🔄 Returning to: ${returnTo}`);
        navigate(returnTo, {
          state: {
            fromIntroduction: true,
            stageNumber: stageNum
          }
        });
      } else {
        // Default navigation logic
        if (stageNum === 2) {
          // For Stage 2, might want to show PAHM explanation first
          console.log('🔄 Stage 2 complete - navigating to stage practice');
          navigate(`/stage${stageNum}`, {
            state: {
              fromIntroduction: true,
              skipIntro: true
            }
          });
        } else {
          // For other stages, navigate to stage practice
          console.log(`🔄 Stage ${stageNum} complete - navigating to stage practice`);
          navigate(`/stage${stageNum}`, {
            state: {
              fromIntroduction: true,
              skipIntro: true
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling completion:', error);
      // Fallback navigation
      navigate('/home');
    }
  }, [stageNum, location.state, navigate]);

  // ✅ ENHANCED: Back handler with context awareness
  const handleBack = useCallback(() => {
    try {
      const state = location.state as any;
      const returnTo = state?.returnTo;
      
      if (returnTo) {
        console.log(`🔙 Going back to: ${returnTo}`);
        navigate(returnTo);
      } else {
        console.log('🔙 Going back to home');
        navigate('/home');
      }
    } catch (error) {
      console.error('Error handling back navigation:', error);
      navigate('/home');
    }
  }, [location.state, navigate]);

  // ✅ ENHANCED: Loading state
  if (isLoading) {
    return (
      <MainNavigation>
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
            Loading Stage {stageNum} introduction...
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
  }

  // ✅ ENHANCED: Access denied state with helpful guidance
  if (accessDenied) {
    const currentStage = stageAccessInfo.currentStage;
    const totalHours = stageAccessInfo.totalHours;
    
    return (
      <MainNavigation>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          flexDirection: 'column',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px'
          }}>
            🔒
          </div>
          
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '16px'
          }}>
            Stage {stageNum} Locked
          </h2>
          
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            maxWidth: '500px'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#666',
              margin: '0 0 16px 0',
              lineHeight: '1.5'
            }}>
              {errorMessage}
            </p>
            
            <div style={{
              fontSize: '14px',
              color: '#888',
              borderTop: '1px solid #eee',
              paddingTop: '16px'
            }}>
              <div><strong>Your Progress:</strong></div>
              <div>Current Stage: {currentStage}</div>
              <div>Practice Hours: {totalHours.toFixed(1)}</div>
              <div>Progress: {stageAccessInfo.progress.percentage}%</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate(`/stage${currentStage}`)}
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
              Practice Stage {currentStage}
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
              Back to Home
            </button>
          </div>
        </div>
      </MainNavigation>
    );
  }

  // ✅ ENHANCED: Main content with proper props
  return (
    <MainNavigation>
      <StageLevelIntroduction
        stageNumber={stageNum}
        onComplete={handleComplete}
        onBack={handleBack}
        hasSeenBefore={stageAccessInfo.hasSeenBefore}
      />
    </MainNavigation>
  );
};

export default StageLevelIntroductionWrapper;