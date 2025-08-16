import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext';
import { useUser } from './contexts/user/UserContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface Stage4IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage4Introduction: React.FC<Stage4IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  
  const stageNumber = 4;
  const navigate = useNavigate();
  
  // ✅ Phase 3 Context Integration
  const { getCurrentStage, getStageProgress, canAdvanceToStage, sessions, isLoading: practiceLoading } = usePractice();
  const { userProfile, updateProfile } = useUser();
  const { currentUser } = useAuth();

  // ✅ Stage 3 Progress Calculation
  const getStage3Progress = useCallback(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    const stage3Sessions = sessions.filter((session: any) => 
      session.stageLevel === 3 || session.stage === 3
    );
    
    const totalMinutes = stage3Sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    return {
      hours: totalHours,
      isComplete: totalHours >= 10 // Stage 3 requires 10 hours
    };
  }, [sessions]);

  // ✅ Access Control
  const canAccess = useMemo(() => {
    const currentStage = getCurrentStage();
    const canAdvance = canAdvanceToStage(4);
    const stage3Progress = getStage3Progress();
    
    return currentStage >= 4 || canAdvance || stage3Progress.isComplete;
  }, [getCurrentStage, canAdvanceToStage, getStage3Progress]);

  // ✅ Progress Info for Header
  const progressInfo = useMemo(() => {
    if (!canAccess) return null;
    
    const currentStage = getCurrentStage();
    const progress = getStageProgress(4);
    
    return {
      currentStage,
      percentage: Math.round(progress.percentage || 0),
      isComplete: (progress as any).isComplete || false
    };
  }, [canAccess, getCurrentStage, getStageProgress]);

  // ✅ Access Control Check
  useEffect(() => {
    if (!practiceLoading && !canAccess) {
      const stage3Progress = getStage3Progress();
      if (!stage3Progress.isComplete) {
        setError(
          `Stage 4 requires completion of Stage 3 first. ` +
          `Stage 3 progress: ${stage3Progress.hours.toFixed(1)}/10 hours (${Math.round((stage3Progress.hours / 10) * 100)}% complete).`
        );
        setAccessDenied(true);
      }
    }
  }, [practiceLoading, canAccess, getStage3Progress]);

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
        returnToStage: 4,
        fromStage: true
      }
    });
  }, [markIntroCompleted, navigate]);
  
  // ✅ Enhanced Stage Title with Progress
  const stageTitle = useMemo(() => "Stage 4: PAHM Practitioner", []);
  
  // ✅ Dynamic Slides with User Context
  const slides = useMemo(() => {
    const currentStage = getCurrentStage();
    
    return [
      {
        title: "Welcome to Stage Four",
        content: `You've successfully completed ${currentStage - 1} stages to reach this tool-free practice level. As a PAHM Practitioner, you'll practice without using tools like the dot, developing open awareness and recognizing thought patterns without aids.`
      },
      {
        title: "Tool-Free Awareness",
        content: "In this stage, you'll learn to rest in open awareness without focusing on a specific object. This develops your ability to notice thoughts arising naturally without external support."
      },
      {
        title: "Recognizing Patterns",
        content: "You'll become more skilled at recognizing patterns in your thinking, including recurring thoughts and emotional responses that arise during practice. This builds sophisticated mindfulness skills."
      },
      {
        title: "Building Stability",
        content: "This stage builds on previous stages by developing stability in your awareness, allowing you to remain present even as thoughts and emotions come and go. You're developing true practitioner-level skills."
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
    const stage3Progress = getStage3Progress();
    
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
          <h1>🔒 Stage 4 Locked</h1>
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
            Complete Stage 3 First
          </h2>
          
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {error}
          </p>
          
          <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Stage 3 Requirements: 10 hours of practice
            </div>
            <div style={{ color: '#374151', marginBottom: '8px' }}>
              Current Progress: {stage3Progress.hours.toFixed(1)}/10.0 hours
            </div>
            <div style={{ color: '#374151', marginBottom: '20px' }}>
              Hours Remaining: {Math.max(0, 10 - stage3Progress.hours).toFixed(1)}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/stage/3')}
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
              Continue Stage 3
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
            Loading Stage 4 Introduction...
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Preparing your practice environment
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
          aria-label="Skip Stage 4 introduction"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Skip'}
        </button>
      </div>
      
      <div className="introduction-content">
        {/* ✅ Achievement Badge */}
        <div className="achievement-badge" style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: 'white',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>🎯 Stage 4: Tool-Free Practice</h3>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            You're ready to practice without training wheels - true practitioner level!
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
                aria-label="Start Stage 4 practice"
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

export default Stage4Introduction;