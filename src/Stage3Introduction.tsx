import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface Stage3IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage3Introduction: React.FC<Stage3IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const stageNumber = 3;
  const navigate = useNavigate();
  
  // ✅ Phase 3 Context Integration
  const { getCurrentStage, getStageProgress, canAdvanceToStage, sessions, isLoading: practiceLoading } = usePractice();
  const { userProfile, updateProfile } = useUser();
  const { currentUser } = useAuth();

  // ✅ Stage 2 Progress Calculation
  const getStage2Progress = useCallback(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    const stage2Sessions = sessions.filter((session: any) => 
      session.stageLevel === 2 || session.stage === 2
    );
    
    const totalMinutes = stage2Sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    return {
      hours: totalHours,
      isComplete: totalHours >= 5 // Stage 2 requires 5 hours
    };
  }, [sessions]);

  // ✅ Access Control
  const canAccess = useMemo(() => {
    const currentStage = getCurrentStage();
    const canAdvance = canAdvanceToStage(3);
    const stage2Progress = getStage2Progress();
    
    return currentStage >= 3 || canAdvance || stage2Progress.isComplete;
  }, [getCurrentStage, canAdvanceToStage, getStage2Progress]);

  // ✅ Progress Info for Header
  const progressInfo = useMemo(() => {
    if (!canAccess) return null;
    
    const currentStage = getCurrentStage();
    const progress = getStageProgress(3);
    
    return {
      currentStage,
      percentage: Math.round(progress.percentage || 0),
      isComplete: (progress as any).isComplete || false
    };
  }, [canAccess, getCurrentStage, getStageProgress]);

  // ✅ Access Control Check
  useEffect(() => {
    if (!practiceLoading && !canAccess) {
      const stage2Progress = getStage2Progress();
      if (!stage2Progress.isComplete) {
        setError(
          `Stage 3 requires completion of Stage 2 first. ` +
          `Stage 2 progress: ${stage2Progress.hours.toFixed(1)}/5 hours (${Math.round((stage2Progress.hours / 5) * 100)}% complete).`
        );
        setAccessDenied(true);
      }
    }
  }, [practiceLoading, canAccess, getStage2Progress]);

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
  
  // ✅ Refresh PAHM Handler
  const handleRefreshPAHM = useCallback(async () => {
    await markIntroCompleted();
    navigate('/learning/pahm', {
      state: {
        returnToStage: 3,
        fromStage: true
      }
    });
  }, [markIntroCompleted, navigate]);
  
  // ✅ Enhanced Stage Title with Progress
  const stageTitle = useMemo(() => "Stage 3: PAHM Beginner", []);
  
  // ✅ Dynamic Slides with User Context
  const slides = useMemo(() => {
    const currentStage = getCurrentStage();
    
    return [
      {
        title: "Welcome to Stage Three",
        content: `You've successfully completed ${currentStage - 1} stages to reach the PAHM Beginner level. You'll learn the dot tracking technique, a powerful method for developing sustained attention and recognizing when your mind has wandered.`
      },
      {
        title: "Poison Thoughts",
        content: "Stage Three introduces the concept of 'poison thoughts' - recurring thought patterns that pull you away from presence and into suffering. You'll learn to identify your personal poison thoughts and develop skills to work with them."
      },
      {
        title: "The Dot Tracking Method",
        content: "This technique involves visualizing a small dot and maintaining your attention on it. When your mind wanders, you'll practice gently returning to the dot. This builds your attention muscle systematically."
      },
      {
        title: "Building Attention Muscle",
        content: "Just as Stage One built your physical stillness capacity, Stage Three builds your attention muscle, allowing you to remain present for longer periods. You're developing true beginner-level mindfulness skills."
      }
    ];
  }, [getCurrentStage]);
  
  // ✅ Navigation Functions
  const nextSlide = useCallback(async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      await markIntroCompleted();
      onComplete();
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
  
  // ✅ Show Refresh Button Logic
  const showRefreshPAHMButton = useMemo(() => currentSlide === slides.length - 1, [currentSlide, slides.length]);

  // ✅ Access Denied UI
  if (accessDenied) {
    const stage2Progress = getStage2Progress();
    
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
          <h1>🔒 Stage 3 Locked</h1>
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
            Complete Stage 2 First
          </h2>
          
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {error}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Stage 2 Requirements: 5 hours of practice
            </div>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Current Progress: {stage2Progress.hours.toFixed(1)}/5.0 hours
            </div>
            <div style={{ color: '#374151', marginBottom: '20px' }}>
              Hours Remaining: {Math.max(0, 5 - stage2Progress.hours).toFixed(1)}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/stage/2')}
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
              Continue Stage 2
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
            Loading Stage 3 Introduction...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Preparing your dot tracking practice
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button 
          className="back-button" 
          onClick={onBack}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, onBack)}
          aria-label="Go back to previous page"
        >
          Back
        </button>
        
        <div style={{ textAlign: 'center', flex: 1 }}>
          <h1>{stageTitle}</h1>
          {progressInfo && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              Current Stage: {progressInfo.currentStage} • Progress: {progressInfo.percentage}%
              {progressInfo.isComplete && ' ✅'}
            </div>
          )}
        </div>
        
        <button 
          className="skip-button" 
          onClick={handleSkip}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, handleSkip)}
          aria-label="Skip Stage 3 introduction"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Skip'}
        </button>
      </div>
      
      <div className="introduction-content">
        {/* ✅ Achievement Badge */}
        <div className="achievement-badge" style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎯 Stage 3: Dot Tracking Practice</h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            You're ready to develop sustained attention with the dot technique!
          </p>
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
          
          {showRefreshPAHMButton ? (
            <>
              <button 
                className="nav-button refresh-pahm" 
                onClick={handleRefreshPAHM}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, handleRefreshPAHM)}
                aria-label="Refresh knowledge about PAHM Matrix"
                disabled={isLoading}
              >
                Refresh about PAHM
              </button>
              <button 
                className="nav-button next" 
                onClick={nextSlide}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, nextSlide)}
                aria-label="Start Stage 3 practice"
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Practice'}
              </button>
            </>
          ) : (
            <button 
              className="nav-button next" 
              onClick={nextSlide}
              onTouchStart={handleTouchStart}
              onKeyDown={(e) => handleKeyDown(e, nextSlide)}
              aria-label="Go to next slide"
              disabled={isLoading}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stage3Introduction;