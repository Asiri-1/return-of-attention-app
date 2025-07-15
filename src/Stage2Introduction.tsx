import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './StageLevelIntroduction.css';

interface Stage2IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage2Introduction: React.FC<Stage2IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 2; // Hardcoded to stage 2
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
    // Skip directly to posture selection, not to PAHM explanation
    onComplete();
  }, [markIntroCompleted, onComplete]);
  
  // ✅ ENHANCED: Memoized stage title
  const stageTitle = useMemo(() => "PAHM Trainee: Understanding Thought Patterns", []);
  
  // ✅ ENHANCED: Memoized slides data
  const slides = useMemo(() => [
    {
      title: "Welcome to Stage Two",
      content: "As a PAHM Trainee, you'll learn to witness your thought patterns without becoming entangled in them. This stage builds on the physical foundation you established in Stage One."
    },
    {
      title: "The PAHM Matrix",
      content: "Stage Two introduces the Present Attention and Happiness Matrix (PAHM), a powerful tool for understanding the relationship between your attention and emotional state."
    },
    {
      title: "Nine Positions of Experience",
      content: "The PAHM Matrix divides experience into nine positions including Present, Past, Future, Attachment, Aversion, and more. You'll learn to recognize which position you're in at any moment."
    },
    {
      title: "Your PAHM Trainee Practice",
      content: "In this stage, you'll practice noticing your thoughts without judgment, identifying patterns, and using the PAHM Matrix to understand your mental habits."
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
      
      // Use navigate with state instead of direct location change
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
  
  // ✅ ENHANCED: Memoized button text
  const getButtonText = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      return "Next";
    }
    return "Learn about PAHM";
  }, [currentSlide, slides.length]);
  
  // ✅ ENHANCED: Optimized PAHM navigation handler
  const handleLearnAboutPAHM = useCallback(() => {
    if (currentSlide === slides.length - 1) {
      // If on the last slide and the button says "Learn about PAHM"
      // Mark as completed but go directly to PAHM learning page
      markIntroCompleted();
      
      // FIXED: Use React Router navigation instead of direct window.location.href
      // This ensures proper routing and state management
      navigate('/learning/pahm', {
        state: {
          returnToStage: 2,
          fromStage: true
        }
      });
      return;
    }
    
    // Otherwise, proceed to next slide
    nextSlide();
  }, [currentSlide, slides.length, markIntroCompleted, navigate, nextSlide]);

  // ✅ ENHANCED: Direct slide navigation
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);
  
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
          aria-label="Skip Stage 2 introduction"
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
          
          <button 
            className="nav-button next" 
            onClick={handleLearnAboutPAHM}
            onTouchStart={handleTouchStart}
            onKeyDown={(e) => handleKeyDown(e, handleLearnAboutPAHM)}
            aria-label={getButtonText() === "Learn about PAHM" ? 
              "Proceed to learn about PAHM Matrix" : 
              "Go to next slide"
            }
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage2Introduction;