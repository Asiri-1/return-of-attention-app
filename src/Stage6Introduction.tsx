// ✅ ENHANCED Stage6Introduction.tsx - Phase 3 Firebase Integration
// File: src/Stage6Introduction.tsx

import React, { useEffect, useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useAuth } from './contexts/auth/AuthContext';
import './StageLevelIntroduction.css';

interface Stage6IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage6Introduction: React.FC<Stage6IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const stageNumber = 6;
  const navigate = useNavigate();
  
  // ✅ ENHANCED: Complete Firebase context integration
  const { userProfile, updateProfile } = useUser();
  const { getCurrentStage, getStageProgress, canAdvanceToStage, isLoading } = usePractice();
  const { currentUser } = useAuth();
  
  // ✅ ENHANCED: Stage access validation
  useEffect(() => {
    if (!isLoading && currentUser) {
      const currentStage = getCurrentStage();
      const canAccess = canAdvanceToStage(6) || currentStage >= 6;
      
      if (!canAccess) {
        const progress = getStageProgress(5);
        setErrorMessage(
          `Stage 6 requires completion of Stage 5 first. ` +
          `Stage 5 progress: ${Math.round(progress.percentage)}% complete.`
        );
        setAccessDenied(true);
      }
      setLoading(false);
    }
  }, [isLoading, currentUser, getCurrentStage, canAdvanceToStage, getStageProgress]);
  
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
      // ✅ Safe property access with type assertion
      const currentIntros = (userProfile as any)?.completedStageIntros;
      const completedIntros = Array.isArray(currentIntros) ? currentIntros : [];
      
      if (!completedIntros.includes(stageNumber)) {
        // ✅ Add this stage to completed intros and save to Firebase
        const updatedIntros = [...completedIntros, stageNumber];
        await updateProfile({
          ...userProfile,
          completedStageIntros: updatedIntros,
          lastUpdated: new Date().toISOString()
        } as any); // Type assertion to bypass TypeScript check
        
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
      console.warn('⚠️ Cannot skip - access denied to Stage 6');
      return;
    }
    
    await markIntroCompleted();
    onComplete();
  }, [markIntroCompleted, onComplete, accessDenied]);
  
  // ✅ ENHANCED: Refresh PAHM handler with validation
  const handleRefreshPAHM = useCallback(async () => {
    if (accessDenied) {
      console.warn('⚠️ Cannot access PAHM - access denied to Stage 6');
      return;
    }
    
    await markIntroCompleted();
    // Use React Router navigation with enhanced state
    navigate('/learning/pahm', {
      state: {
        returnToStage: 6,
        fromStage: true,
        context: 'stage6-introduction',
        timestamp: new Date().toISOString()
      }
    });
  }, [markIntroCompleted, navigate, accessDenied]);
  
  // ✅ ENHANCED: Go back to previous stage if access denied
  const handleAccessDeniedBack = useCallback(() => {
    const currentStage = getCurrentStage();
    if (currentStage === 5) {
      navigate('/stage/5');
    } else {
      onBack();
    }
  }, [getCurrentStage, navigate, onBack]);
  
  // ✅ ENHANCED: Memoized stage title
  const stageTitle = useMemo(() => "PAHM Illuminator: Continuous Awareness", []);
  
  // ✅ ENHANCED: Memoized slides data with progress context
  const slides = useMemo(() => {
    const currentStage = getCurrentStage();
    const stageProgress = getStageProgress(currentStage);
    
    return [
      {
        title: "Welcome to Stage Six",
        content: `As a PAHM Illuminator, you'll develop continuous awareness - the ability to maintain presence throughout your daily activities. This is the most advanced stage of practice. You've progressed through ${currentStage - 1} stages to reach this pinnacle.`
      },
      {
        title: "Continuous Awareness",
        content: "In this stage, the boundaries between formal practice and daily life begin to dissolve. You'll learn to maintain awareness during all activities - working, eating, walking, and even sleeping."
      },
      {
        title: "Recognizing Subtle Patterns",
        content: "You'll develop heightened sensitivity to the most subtle thought patterns and emotional responses, recognizing them as they first arise. This level of awareness allows for immediate course correction."
      },
      {
        title: "Living Presence",
        content: "This stage represents the integration of all previous stages, allowing presence to become your natural state rather than something you practice. You become a living example of sustained awareness."
      },
      {
        title: "Master Level Achievement",
        content: "Completing Stage 6 represents mastery of the fundamental practice. You'll have developed the capacity for sustained presence that few achieve. This is both a completion and a new beginning."
      }
    ];
  }, [getCurrentStage, getStageProgress]);
  
  // ✅ ENHANCED: Navigation functions with validation
  const nextSlide = useCallback(async () => {
    if (accessDenied) {
      console.warn('⚠️ Cannot proceed - access denied to Stage 6');
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
      console.warn('⚠️ Cannot navigate slides - access denied to Stage 6');
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
    
    return {
      currentStage,
      progress: Math.round(progress.percentage),
      canAccess: canAdvanceToStage(6) || currentStage >= 6
    };
  }, [currentUser, getCurrentStage, getStageProgress, canAdvanceToStage]);
  
  // ✅ ENHANCED: Loading state
  if (loading || isLoading) {
    return (
      <div className="stage-level-introduction">
        <div className="stage-instructions-header">
          <button className="back-button" onClick={onBack}>Back</button>
          <h1>{stageTitle}</h1>
        </div>
        <div className="loading-container">
          <p>Loading Stage 6 requirements...</p>
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
            <h2>🔒 Stage 6 Locked</h2>
            <p>{errorMessage}</p>
            
            {progressInfo && (
              <div className="progress-requirements">
                <h3>Requirements for Stage 6:</h3>
                <ul>
                  <li>Complete Stage 5 (Master: Sustained Presence)</li>
                  <li>Demonstrate sustained presence in daily activities</li>
                  <li>Achieve mastery of tool-free practice</li>
                </ul>
                
                <div className="current-progress">
                  <h4>Your Current Progress:</h4>
                  <p>Current Stage: {progressInfo.currentStage}</p>
                  <p>Stage {progressInfo.currentStage} Progress: {progressInfo.progress}%</p>
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
              {progressInfo?.currentStage === 5 ? 'Continue Stage 5' : 'Back'}
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
          aria-label="Skip Stage 6 introduction"
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
                <h3>🎯 Stage 6: Master Level</h3>
                <p>You're about to begin the highest level of practice - continuous awareness throughout all daily activities.</p>
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
                aria-label="Start Stage 6 practice - the highest level of continuous awareness"
              >
                Start Master Practice
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

export default Stage6Introduction;