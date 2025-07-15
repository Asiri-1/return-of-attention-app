import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './StageLevelIntroduction.css';

interface Stage4IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage4Introduction: React.FC<Stage4IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 4; // Hardcoded to stage 4
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
        returnToStage: 4,
        fromStage: true
      }
    });
  }, [markIntroCompleted, navigate]);
  
  // ✅ ENHANCED: Memoized stage title
  const stageTitle = useMemo(() => "PAHM Practitioner: Tool-Free Practice", []);
  
  // ✅ ENHANCED: Memoized slides data
  const slides = useMemo(() => [
    {
      title: "Welcome to Stage Four",
      content: "As a PAHM Practitioner, you'll practice without using tools like the dot. This stage focuses on developing open awareness and recognizing thought patterns without aids."
    },
    {
      title: "Tool-Free Awareness",
      content: "In this stage, you'll learn to rest in open awareness without focusing on a specific object. This develops your ability to notice thoughts arising naturally."
    },
    {
      title: "Recognizing Patterns",
      content: "You'll become more skilled at recognizing patterns in your thinking, including recurring thoughts and emotional responses that arise during practice."
    },
    {
      title: "Building Stability",
      content: "This stage builds on previous stages by developing stability in your awareness, allowing you to remain present even as thoughts and emotions come and go."
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
          aria-label="Skip Stage 4 introduction"
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
                aria-label="Start Stage 4 practice"
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

export default Stage4Introduction;