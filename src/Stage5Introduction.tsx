// ✅ ENHANCED Stage5Introduction.tsx - Phase 3 Firebase Integration
// File: src/Stage5Introduction.tsx

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface Stage5IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage5Introduction: React.FC<Stage5IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const stageNumber = 5;
  const navigate = useNavigate();
  
  // ✅ ENHANCED: Complete Firebase context integration
  const { userProfile, updateProfile } = useUser();
  const { getCurrentStage, getStageProgress, canAdvanceToStage, sessions, isLoading } = usePractice();
  const { currentUser } = useAuth();
  
  // ✅ ENHANCED: Stage 4 progress calculation for access control
  const getStage4Progress = useCallback(() => {
    if (!sessions) return { hours: 0, isComplete: false };
    
    const stage4Sessions = sessions.filter((session: any) => 
      session.stageLevel === 4 || 
      session.stage === 4 ||
      (session.metadata && session.metadata.stage === 4)
    );
    
    const totalMinutes = stage4Sessions.reduce((total: number, session: any) => {
      return total + (session.duration || 0);
    }, 0);
    
    const totalHours = totalMinutes / 60;
    
    return {
      hours: totalHours,
      isComplete: totalHours >= 20 // Stage 4 requires 20 hours
    };
  }, [sessions]);

  // ✅ ENHANCED: Stage access validation
  useEffect(() => {
    if (!isLoading && currentUser) {
      const currentStage = getCurrentStage();
      const canAccess = canAdvanceToStage(5) || currentStage >= 5;
      const stage4Progress = getStage4Progress();
      
      if (!canAccess && !stage4Progress.isComplete) {
        setErrorMessage(
          `Stage 5 requires completion of Stage 4 first. ` +
          `Stage 4 progress: ${stage4Progress.hours.toFixed(1)}/20 hours (${Math.round((stage4Progress.hours / 20) * 100)}% complete).`
        );
        setAccessDenied(true);
      }
      setLoading(false);
    }
  }, [isLoading, currentUser, getCurrentStage, canAdvanceToStage, getStage4Progress]);
  
  // ✅ ENHANCED: iOS Safari viewport fix
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
  
  // ✅ ENHANCED: Memoized function to mark intro completed with error handling
  const markIntroCompleted = useCallback(async () => {
    if (!currentUser) {
      console.warn('⚠️ No authenticated user - cannot mark intro completed');
      return;
    }
    
    try {
      // ✅ Enhanced property access and update
      const currentIntros = (userProfile as any)?.completedStageIntros;
      const completedIntros = Array.isArray(currentIntros) ? currentIntros : [];
      
      if (!completedIntros.includes(stageNumber)) {
        // ✅ Add this stage to completed intros and save to Firebase
        const updatedIntros = [...completedIntros, stageNumber];
        await updateProfile({
          ...userProfile,
          completedStageIntros: updatedIntros,
          lastUpdated: new Date().toISOString()
        } as any);
        
        console.log(`✅ Stage ${stageNumber} introduction marked as completed in Firebase`);
      } else {
        console.log(`ℹ️ Stage ${stageNumber} introduction already marked as completed`);
      }
    } catch (error) {
      console.error('❌ Error marking stage intro as completed:', error);
      // Continue anyway - don't block the user flow
    }
  }, [stageNumber, userProfile, updateProfile, currentUser]);
  
  // ✅ ENHANCED: Touch feedback for iPhone users
  const handleTouchStart = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, []);

  // ✅ ENHANCED: Keyboard navigation support
  const handleKeyDown = useCallback((event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }, []);
  
  // ✅ ENHANCED: Skip handler with validation
  const handleSkip = useCallback(async () => {
    if (accessDenied) {
      console.warn('⚠️ Cannot skip - access denied to Stage 5');
      return;
    }
    
    await markIntroCompleted();
    onComplete();
  }, [markIntroCompleted, onComplete, accessDenied]);
  
  // ✅ ENHANCED: Refresh PAHM handler with validation
  const handleRefreshPAHM = useCallback(async () => {
    if (accessDenied) {
      console.warn('⚠️ Cannot access PAHM - access denied to Stage 5');
      return;
    }
    
    await markIntroCompleted();
    // Use React Router navigation with enhanced state
    navigate('/learning/pahm', {
      state: {
        returnToStage: 5,
        fromStage: true,
        context: 'stage5-introduction',
        timestamp: new Date().toISOString()
      }
    });
  }, [markIntroCompleted, navigate, accessDenied]);
  
  // ✅ ENHANCED: Go back to previous stage if access denied
  const handleAccessDeniedBack = useCallback(() => {
    const currentStage = getCurrentStage();
    if (currentStage === 4) {
      navigate('/stage/4');
    } else {
      onBack();
    }
  }, [getCurrentStage, navigate, onBack]);
  
  // ✅ ENHANCED: Memoized stage title
  const stageTitle = useMemo(() => "PAHM Master: Effortless Awareness", []);
  
  // ✅ ENHANCED: Memoized slides data with progress context
  const slides = useMemo(() => {
    const currentStage = getCurrentStage();
    
    return [
      {
        title: "Welcome to Stage Five",
        content: `As a PAHM Master, you'll develop effortless awareness - the ability to maintain presence without conscious effort. This stage represents a significant deepening of your practice. You've successfully completed ${currentStage - 1} stages to reach this advanced level.`
      },
      {
        title: "Effortless Awareness",
        content: "In this stage, you'll experience moments where awareness maintains itself without effort. Your attention becomes more stable and continuous, building on the foundation you've established."
      },
      {
        title: "Recognizing Subtle Patterns",
        content: "You'll become increasingly sensitive to subtle thought patterns and emotional responses that previously went unnoticed. This heightened awareness allows for deeper self-understanding."
      },
      {
        title: "Deepening Presence",
        content: "This stage builds on all previous stages, allowing you to experience longer periods of uninterrupted presence and deeper insights into your mental patterns. Your practice becomes more refined and stable."
      },
      {
        title: "Approaching Mastery",
        content: "Stage 5 represents the approach to mastery. You'll develop the capacity for sustained, effortless awareness that prepares you for the final stage of complete meditation mastery."
      }
    ];
  }, [getCurrentStage]);
  
  // ✅ ENHANCED: Navigation functions with validation
  const nextSlide = useCallback(async () => {
    if (accessDenied) {
      console.warn('⚠️ Cannot proceed - access denied to Stage 5');
      return;
    }
    
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // ✅ Mark this introduction as completed in Firebase
      await markIntroCompleted();
      
      // Complete the introduction and move to the next step
      onComplete();
    }
  }, [currentSlide, slides.length, markIntroCompleted, onComplete, accessDenied]);
  
  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  }, [currentSlide, onBack]);

  // ✅ ENHANCED: Direct slide navigation
  const goToSlide = useCallback((index: number) => {
    if (accessDenied) {
      console.warn('⚠️ Cannot navigate slides - access denied to Stage 5');
      return;
    }
    setCurrentSlide(index);
  }, [accessDenied]);
  
  // ✅ ENHANCED: Memoized show refresh button logic
  const showRefreshPAHMButton = useMemo(() => 
    currentSlide === slides.length - 1 && !accessDenied, 
    [currentSlide, slides.length, accessDenied]
  );

  // ✅ ENHANCED: Progress info for display
  const progressInfo = useMemo(() => {
    if (!currentUser) return null;
    
    const currentStage = getCurrentStage();
    const progress = getStageProgress(currentStage);
    const stage4Progress = getStage4Progress();
    
    return {
      currentStage,
      progress: Math.round(progress.percentage),
      canAccess: canAdvanceToStage(5) || currentStage >= 5 || stage4Progress.isComplete,
      stage4Hours: stage4Progress.hours,
      stage4Complete: stage4Progress.isComplete
    };
  }, [currentUser, getCurrentStage, getStageProgress, canAdvanceToStage, getStage4Progress]);
  
  // ✅ ENHANCED: Loading state
  if (loading || isLoading) {
    return (
      <div className="stage-level-introduction">
        <div className="stage-instructions-header">
          <button className="back-button" onClick={onBack}>Back</button>
          <h1>{stageTitle}</h1>
        </div>
        <div className="loading-container">
          <p>Loading Stage 5 requirements...</p>
        </div>
      </div>
    );
  }

  // ✅ ENHANCED: Access denied state
  if (accessDenied) {
    return (
      <div className="stage-level-introduction">
        <div className="stage-instructions-header">
          <button className="back-button" onClick={handleAccessDeniedBack}>Back</button>
          <h1>{stageTitle}</h1>
        </div>
        <div className="access-denied-content">
          <div className="access-denied-message">
            <h2>🔒 Stage 5 Locked</h2>
            <p>{errorMessage}</p>
            
            {progressInfo && (
              <div className="progress-requirements">
                <h3>Requirements for Stage 5:</h3>
                <ul>
                  <li>Complete Stage 4 (Practitioner: Tool-Free Practice) - 20 hours</li>
                  <li>Demonstrate sustained tool-free practice</li>
                  <li>Achieve stability in open awareness</li>
                </ul>
                
                <div className="current-progress">
                  <h4>Your Current Progress:</h4>
                  <p>Current Stage: {progressInfo.currentStage}</p>
                  <p>Stage 4 Progress: {progressInfo.stage4Hours.toFixed(1)}/20 hours ({Math.round((progressInfo.stage4Hours / 20) * 100)}%)</p>
                  {progressInfo.stage4Complete && <p style={{color: '#10b981'}}>✅ Stage 4 Complete - Ready for Stage 5!</p>}
                </div>
              </div>
            )}
          </div>
          
          <div className="navigation-buttons">
            <button 
              className="nav-button back" 
              onClick={handleAccessDeniedBack}
              onTouchStart={handleTouchStart}
              onKeyDown={(e) => handleKeyDown(e, handleAccessDeniedBack)}
            >
              {progressInfo?.currentStage === 4 ? 'Continue Stage 4' : 'Back'}
            </button>
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
        <h1>{stageTitle}</h1>
        {progressInfo && (
          <div className="stage-progress-info">
            <span>Stage {progressInfo.currentStage} • {progressInfo.progress}% Complete</span>
          </div>
        )}
        <button 
          className="skip-button" 
          onClick={handleSkip}
          onTouchStart={handleTouchStart}
          onKeyDown={(e) => handleKeyDown(e, handleSkip)}
          aria-label="Skip Stage 5 introduction"
        >
          Skip
        </button>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container" role="region" aria-live="polite">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          {currentSlide === slides.length - 1 && (
            <div className="final-slide-info">
              <div className="achievement-badge">
                <h3>🎯 Stage 5: Advanced Practice</h3>
                <p>You're about to begin effortless awareness practice - a significant step toward meditation mastery.</p>
              </div>
            </div>
          )}
          
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
              >
                Refresh about PAHM
              </button>
              <button 
                className="nav-button next primary" 
                onClick={nextSlide}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, nextSlide)}
                aria-label="Start Stage 5 practice - effortless awareness"
              >
                Start Advanced Practice
              </button>
            </>
          ) : (
            <button 
              className="nav-button next" 
              onClick={nextSlide}
              onTouchStart={handleTouchStart}
              onKeyDown={(e) => handleKeyDown(e, nextSlide)}
              aria-label="Go to next slide"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stage5Introduction;