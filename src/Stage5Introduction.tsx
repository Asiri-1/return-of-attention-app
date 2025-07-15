import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './StageLevelIntroduction.css';

interface Stage5IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage5Introduction: React.FC<Stage5IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 5; // Hardcoded to stage 5
  const navigate = useNavigate();
  
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
  
  // ✅ ENHANCED: Memoized function to mark intro completed
  const markIntroCompleted = useCallback(() => {
    const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
    if (!completedIntros.includes(stageNumber)) {
      completedIntros.push(stageNumber);
      localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
    }
  }, [stageNumber]);
  
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
  
  // ✅ ENHANCED: Memoized skip handler
  const handleSkip = useCallback(() => {
    markIntroCompleted();
    onComplete();
  }, [markIntroCompleted, onComplete]);
  
  // ✅ ENHANCED: Optimized refresh PAHM handler
  const handleRefreshPAHM = useCallback(() => {
    markIntroCompleted();
    // Use React Router navigation instead of custom event
    navigate('/learning/pahm', {
      state: {
        returnToStage: 5,
        fromStage: true
      }
    });
  }, [markIntroCompleted, navigate]);
  
  // ✅ ENHANCED: Memoized stage title
  const stageTitle = useMemo(() => "PAHM Master: Effortless Awareness", []);
  
  // ✅ ENHANCED: Memoized slides data
  const slides = useMemo(() => [
    {
      title: "Welcome to Stage Five",
      content: "As a PAHM Master, you'll develop effortless awareness - the ability to maintain presence without conscious effort. This stage represents a significant deepening of your practice."
    },
    {
      title: "Effortless Awareness",
      content: "In this stage, you'll experience moments where awareness maintains itself without effort. Your attention becomes more stable and continuous."
    },
    {
      title: "Recognizing Subtle Patterns",
      content: "You'll become increasingly sensitive to subtle thought patterns and emotional responses that previously went unnoticed."
    },
    {
      title: "Deepening Presence",
      content: "This stage builds on all previous stages, allowing you to experience longer periods of uninterrupted presence and deeper insights into your mental patterns."
    }
  ], []);
  
  // ✅ ENHANCED: Memoized navigation functions
  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark this introduction as completed
      markIntroCompleted();
      
      // Complete the introduction and move to the next step
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

  // ✅ ENHANCED: Direct slide navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);
  
  // ✅ ENHANCED: Memoized show refresh button logic
  const showRefreshPAHMButton = useMemo(() => currentSlide === slides.length - 1, [currentSlide, slides.length]);
  
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
                className="nav-button next" 
                onClick={nextSlide}
                onTouchStart={handleTouchStart}
                onKeyDown={(e) => handleKeyDown(e, nextSlide)}
                aria-label="Start Stage 5 practice"
              >
                Start Practice
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