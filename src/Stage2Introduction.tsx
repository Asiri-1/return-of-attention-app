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
  
  // ✅ Phase 3 Context Integration
  const { getCurrentStage, getStageProgress, canAdvanceToStage, sessions, isLoading: practiceLoading } = usePractice();
  const { userProfile, updateProfile } = useUser();
  const { currentUser } = useAuth();

  // ✅ Stage 1 Progress Calculation
  const getStage1Progress = useCallback(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    const stage1Sessions = sessions.filter((session: any) => 
      session.stageLevel === 1 || session.stage === 1
    );
    
    const totalMinutes = stage1Sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    return {
      hours: totalHours,
      isComplete: totalHours >= 3 // Stage 1 requires 3 hours
    };
  }, [sessions]);

  // ✅ Access Control
  const canAccess = useMemo(() => {
    const currentStage = getCurrentStage();
    const canAdvance = canAdvanceToStage(2);
    const stage1Progress = getStage1Progress();
    
    return currentStage >= 2 || canAdvance || stage1Progress.isComplete;
  }, [getCurrentStage, canAdvanceToStage, getStage1Progress]);

  // ✅ Progress Info for Header
  const progressInfo = useMemo(() => {
    if (!canAccess) return null;
    
    const currentStage = getCurrentStage();
    const progress = getStageProgress(2);
    
    return {
      currentStage,
      percentage: Math.round(progress.percentage || 0),
      isComplete: (progress as any).isComplete || false
    };
  }, [canAccess, getCurrentStage, getStageProgress]);

  // ✅ Access Control Check
  useEffect(() => {
    if (!practiceLoading && !canAccess) {
      const stage1Progress = getStage1Progress();
      if (!stage1Progress.isComplete) {
        setError(
          `Stage 2 requires completion of Stage 1 first. ` +
          `Stage 1 progress: ${stage1Progress.hours.toFixed(1)}/3 hours (${Math.round((stage1Progress.hours / 3) * 100)}% complete).`
        );
        setAccessDenied(true);
      }
    }
  }, [practiceLoading, canAccess, getStage1Progress]);

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
  
  // ✅ Enhanced Stage Title with Progress
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

  // ✅ Access Denied UI
  if (accessDenied) {
    const stage1Progress = getStage1Progress();
    
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
              Stage 1 Requirements: 3 hours of practice
            </div>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Current Progress: {stage1Progress.hours.toFixed(1)}/3.0 hours
            </div>
            <div style={{ color: '#374151', marginBottom: '20px' }}>
              Hours Remaining: {Math.max(0, 3 - stage1Progress.hours).toFixed(1)}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/stage/1')}
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
          aria-label="Skip Stage 2 introduction"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Skip'}
        </button>
      </div>
      
      <div className="introduction-content">
        {/* ✅ Achievement Badge */}
        <div className="achievement-badge" style={{
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎯 Stage 2: PAHM Matrix Training</h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            You're ready to learn the cornerstone technique of mindfulness!
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
    </div>
  );
};

export default Stage2Introduction;