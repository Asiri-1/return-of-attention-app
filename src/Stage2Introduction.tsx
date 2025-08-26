import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface Stage2IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage2Introduction: React.FC<Stage2IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const stageNumber = 2;
  const navigate = useNavigate();
  
  // ✅ CORRECTED Context Integration
  const { 
    getCurrentStage, 
    getStageProgress, 
    canAdvanceToStage, 
    sessions, 
    isLoading: practiceLoading,
    getTotalPracticeHours,
    isStage1CompleteByTSessions
  } = usePractice();
  const { userProfile, updateProfile } = useUser();
  const { currentUser } = useAuth();

  // ✅ FIXED: Use PracticeContext methods directly
  const stage1Progress = useCallback(() => {
    if (!sessions) return { isComplete: false };
    
    try {
      const isComplete = isStage1CompleteByTSessions();
      
      console.log('🎯 Stage2Introduction - Stage 1 Check:', {
        isCompleteByTSessions: isComplete
      });
      
      return { isComplete };
    } catch (error) {
      console.error('❌ Error checking Stage 1 completion:', error);
      return { isComplete: false };
    }
  }, [sessions, isStage1CompleteByTSessions]);

  // ✅ CORRECTED: Access Control using hybrid logic
  const canAccess = useMemo(() => {
    const currentStage = getCurrentStage();
    const canAdvance = canAdvanceToStage(2);
    const stage1Complete = stage1Progress().isComplete;
    
    const hasAccess = currentStage >= 2 || canAdvance || stage1Complete;
    
    console.log('🔓 Stage2Introduction - Access Check:', {
      currentStage,
      canAdvance,
      stage1Complete,
      hasAccess
    });
    
    return hasAccess;
  }, [getCurrentStage, canAdvanceToStage, stage1Progress]);

  // ✅ CORRECTED: Stage 2 Specific Progress (FIXED: Should show 0% before starting Stage 2 sessions)
  const stage2SpecificProgress = useMemo(() => {
    if (!sessions) return { hours: 0, sessions: 0, percentage: 0 };
    
    try {
      // Count ONLY Stage 2 sessions (not T-level sessions from Stage 1)
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
      const percentage = Math.round((stage2Hours / 5) * 100); // Stage 2 requires 5 hours of Stage 2 sessions
      
      console.log('📊 Stage2Introduction - CORRECTED Progress:', {
        stage2Sessions: stage2Sessions.length,
        stage2Hours: stage2Hours.toFixed(2),
        percentage: percentage,
        note: 'Shows only Stage 2 session progress (should be 0% before starting)'
      });
      
      return {
        hours: stage2Hours,
        sessions: stage2Sessions.length,
        percentage: percentage
      };
    } catch (error) {
      console.error('❌ Error calculating Stage 2 specific progress:', error);
      return { hours: 0, sessions: 0, percentage: 0 };
    }
  }, [sessions]);

  // ✅ CORRECTED: Progress Info using Stage 2 specific progress (not total practice hours)
  const progressInfo = useMemo(() => {
    if (!canAccess) return null;
    
    try {
      const currentStage = getCurrentStage();
      const { hours, percentage } = stage2SpecificProgress;
      const isComplete = hours >= 5;
      
      console.log('📊 Stage2Introduction - Progress Info (CORRECTED):', {
        currentStage,
        stage2Hours: hours.toFixed(2),
        percentage,
        isComplete,
        note: 'Using Stage 2 specific hours, not total practice hours'
      });
      
      return {
        currentStage,
        percentage: Math.min(percentage, 100),
        isComplete
      };
    } catch (error) {
      console.error('❌ Error calculating progress info:', error);
      return null;
    }
  }, [canAccess, getCurrentStage, stage2SpecificProgress]);

  // ✅ CORRECTED: Access Control Check
  useEffect(() => {
    if (!practiceLoading && !canAccess) {
      const stage1Complete = stage1Progress().isComplete;
      if (!stage1Complete) {
        setError(
          `Stage 2 requires completion of all Stage 1 T-levels (T1-T5) first. ` +
          `Please complete all T-level sessions before proceeding to Stage 2.`
        );
        setAccessDenied(true);
      }
    }
  }, [practiceLoading, canAccess, stage1Progress]);

  // ✅ iOS Safari viewport fix
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);
  
  // ✅ Safe User Profile Update
  const markIntroCompleted = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      
      const currentIntros = (userProfile as any)?.completedStageIntros || [];
      
      if (!currentIntros.includes(stageNumber)) {
        const updatedIntros = [...currentIntros, stageNumber];
        await updateProfile({
          ...userProfile,
          completedStageIntros: updatedIntros,
          lastUpdated: new Date().toISOString()
        } as any);
        
        console.log(`✅ Stage ${stageNumber} introduction marked as completed`);
      }
    } catch (error) {
      console.error('❌ Error marking stage intro as completed:', error);
      // Continue anyway - don't block the user flow
    } finally {
      setIsLoading(false);
    }
  }, [stageNumber, userProfile, updateProfile, currentUser]);
  
  // ✅ Enhanced Touch Feedback
  const handleTouchStart = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // ✅ Keyboard Navigation Support
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);
  
  // ✅ Skip Handler
  const handleSkip = useCallback(async () => {
    await markIntroCompleted();
    onComplete();
  }, [markIntroCompleted, onComplete]);
  
  // ✅ CORRECTED: Stage Title
  const stageTitle = useMemo(() => "Stage 2: PAHM Trainee", []);
  
  // ✅ Dynamic Slides with User Context
  const slides = useMemo(() => [
    {
      title: "Welcome to Stage Two",
      content: "You've successfully completed Stage 1 to reach the PAHM Trainee level! As a PAHM Trainee, you'll learn to witness your thought patterns without becoming entangled in them. This stage builds on the physical foundation you established in Stage One."
    },
    {
      title: "The PAHM Matrix",
      content: "Stage Two introduces the Present Attention and Happiness Matrix (PAHM), a powerful tool for understanding the relationship between your attention and emotional state. This is the cornerstone technique of our practice."
    },
    {
      title: "Nine Positions of Experience",
      content: "The PAHM Matrix divides experience into nine positions including Present, Past, Future, Attachment, Aversion, and more. You'll learn to recognize which position you're in at any moment, developing sophisticated mindfulness."
    },
    {
      title: "Your PAHM Trainee Practice",
      content: "In this stage, you'll practice noticing your thoughts without judgment, identifying patterns, and using the PAHM Matrix to understand your mental habits. You're developing the foundation for all advanced practice."
    }
  ], []);
  
  // ✅ Button Text Logic
  const getButtonText = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      return "Next";
    }
    return "Learn about PAHM";
  }, [currentSlide, slides.length]);
  
  // ✅ Navigation Functions
  const nextSlide = useCallback(async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await markIntroCompleted();
      onComplete();
      window.history.pushState({ fromIntro: true }, '', window.location.pathname);
    }
  }, [currentSlide, slides.length, markIntroCompleted, onComplete]);
  
  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  }, [currentSlide, onBack]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);
  
  // ✅ PAHM Navigation Handler
  const handleLearnAboutPAHM = useCallback(async () => {
    if (currentSlide === slides.length - 1) {
      await markIntroCompleted();
      navigate('/learning/pahm', {
        state: {
          returnToStage: 2,
          fromStage: true
        }
      });
      return;
    }
    
    await nextSlide();
  }, [currentSlide, slides.length, markIntroCompleted, navigate, nextSlide]);

  // ✅ CORRECTED: Access Denied UI
  if (accessDenied) {
    const stage1Complete = stage1Progress().isComplete;
    
    return (
      <div className="stage-level-introduction">
        <div className="stage-instructions-header">
          <button 
            className="back-button" 
            onClick={onBack}
            aria-label="Go back to previous page"
          >
            Back
          </button>
          <h1>🔒 Stage 2 Locked</h1>
        </div>
        
        <div className="access-denied-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div className="lock-icon" style={{ fontSize: '48px', marginBottom: '20px' }}>🔒</div>
          
          <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>
            Complete Stage 1 First
          </h2>
          
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {error}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Stage 1 Requirements: Complete all T-levels (T1-T5)
            </div>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Current Status: {stage1Complete ? 'Complete ✅' : 'Incomplete ❌'}
            </div>
            <div style={{ color: '#374151', marginBottom: '20px' }}>
              {!stage1Complete && 'Complete all T-level sessions (3 each) to unlock Stage 2'}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/stage1')}
              style={{
                padding: '12px 24px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
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
        </div>
      </div>
    );
  }

  // ✅ Loading State
  if (practiceLoading || isLoading) {
    return (
      <div className="stage-level-introduction">
        <div className="loading-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '12px' }}>
            Loading Stage 2 Introduction...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Preparing your PAHM training
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="stage-level-introduction">
      {/* ✅ REMOVED: Header section - Stage2Wrapper handles the header now */}
      
      <div className="introduction-content">
        {/* ✅ CORRECTED: Achievement Badge with Stage 2 specific progress */}
        <div className="achievement-badge" style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎯 Stage 2: PAHM Matrix Training</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '14px', opacity: 0.9 }}>
            You're ready to learn the cornerstone technique of mindfulness!
          </p>
          
          {/* ✅ CORRECTED: Show Stage 2 specific progress (should be 0% before starting) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            fontSize: '12px',
            opacity: 0.9
          }}>
            <span>Sessions: {stage2SpecificProgress.sessions}</span>
            <span>Hours: {stage2SpecificProgress.hours.toFixed(1)}/5</span>
            <span>Progress: {stage2SpecificProgress.percentage}%</span>
          </div>
        </div>
        
        <div className="slide-container" role="region" aria-live="polite">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          <div className="slide-progress" role="tablist" aria-label="Slide navigation">
            {slides.map((_, index) => (
              <button
                key={index} 
                className={`progress-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, () => goToSlide(index))}
                role="tab"
                aria-selected={index === currentSlide}
                aria-label={`Go to slide ${index + 1} of ${slides.length}: ${slides[index].title}`}
              />
            ))}
          </div>
        </div>
        
        <div className="navigation-buttons">
          {currentSlide > 0 && (
            <button 
              className="nav-button back" 
              onClick={prevSlide}
              onTouchStart={handleTouchStart}
              onKeyDown={(e) => handleKeyDown(e, prevSlide)}
              aria-label="Go to previous slide"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          
          <button 
            className="nav-button next" 
            onClick={handleLearnAboutPAHM}
            onTouchStart={handleTouchStart}
            onKeyDown={(e) => handleKeyDown(e, handleLearnAboutPAHM)}
            aria-label={getButtonText() === "Learn about PAHM" ? 
              "Proceed to learn about PAHM Matrix" : 
              "Go to next slide"
            }
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : getButtonText()}
          </button>
        </div>
      </div>

      {/* ✅ Debug Info for Development */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '32px',
          padding: '16px',
          background: '#f0fdf4',
          border: '2px solid #10b981',
          borderRadius: '8px',
          fontSize: '12px'
        }}>
          <h4 style={{ color: '#059669', margin: '0 0 12px 0' }}>
            ✅ Stage 2 Introduction Debug (FIXED - All Features Preserved):
          </h4>
          <div style={{ color: '#065f46' }}>
            <div>Stage 2 Sessions: {stage2SpecificProgress.sessions} (Should be 0)</div>
            <div>Stage 2 Hours: {stage2SpecificProgress.hours.toFixed(2)}/5 (Should be 0.00)</div>
            <div>Stage 2 Progress: {stage2SpecificProgress.percentage}% (Should be 0%)</div>
            <div>Total Practice Hours: {getTotalPracticeHours().toFixed(2)} (All sessions including T-levels)</div>
            <div>Current Slide: {currentSlide + 1}/{slides.length}</div>
            <div>Stage 1 Complete: {stage1Progress().isComplete ? 'Yes' : 'No'}</div>
            <div>Can Access Stage 2: {canAccess ? 'Yes' : 'No'}</div>
            <div><strong>✅ FIXED: Removed header (handled by wrapper), showing correct 0% Stage 2 progress</strong></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stage2Introduction;