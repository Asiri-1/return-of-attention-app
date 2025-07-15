import React, { useState, useCallback, useEffect } from 'react';
import './Introduction.css';

interface IntroductionProps {
  onComplete: () => void;
  onSkip: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to The Return of Attention",
      content: "A simplified practical journey to happiness that stays.",
      image: "🧠"
    },
    {
      title: "Why This Practice Matters",
      content: "You decided to try The Return of Attention because something doesn't feel right or no matter whatever you do, something is missing. Perhaps there's a quiet unease that follows you through your days. This practice offers a path to lasting peace.",
      image: "🌱"
    },
    {
      title: "The Fundamental Blindness",
      content: "Investing in your mind yields far greater returns than focusing solely on the body. While we have limited control over our physical functions, the mind is trainable. We can't control which thoughts arise, but we can control our relationship to those thoughts. Why dedicate so much energy to controlling the physical—something inherently uncontrollable—and so little toward mastering the mental, which is within reach?",
      image: "👁️"
    },
    {
      title: "A Simple Practice",
      content: "This is not about adding more to your life. It's about discovering what's already there. The practice is simple, but its effects are profound.",
      image: "🧘"
    },
    {
      title: "Your Journey Begins",
      content: "We'll start with a self-assessment to record your starting point.",
      image: "🛤️"
    }
  ];

  // ✅ OPTIMIZED: Memoized navigation functions
  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  }, [currentSlide, slides.length, onComplete]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // ✅ NEW: iPhone touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // ✅ NEW: Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'Escape') {
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide, onSkip]);

  return (
    <div 
      className="introduction-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="introduction-content">
        <div className="slide">
          <div className="slide-image">{slides[currentSlide].image}</div>
          <h1>{slides[currentSlide].title}</h1>
          <p>{slides[currentSlide].content}</p>
        </div>

        <div className="slide-indicators">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              role="button"
              tabIndex={0}
              aria-label={`Go to slide ${index + 1}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToSlide(index);
                }
              }}
            />
          ))}
        </div>

        <div className="navigation-buttons">
          {currentSlide > 0 && (
            <button 
              className="nav-button back" 
              onClick={prevSlide}
              aria-label="Go to previous slide"
            >
              Back
            </button>
          )}

          <button 
            className="nav-button skip" 
            onClick={onSkip}
            aria-label="Skip introduction"
          >
            Skip
          </button>

          <button 
            className="nav-button next" 
            onClick={nextSlide}
            aria-label={currentSlide === slides.length - 1 ? 'Complete introduction' : 'Go to next slide'}
          >
            {currentSlide === slides.length - 1 ? 'Continue' : 'Next'}
          </button>
        </div>

        {/* ✅ NEW: Progress indicator for iPhone users */}
        <div className="slide-progress" aria-hidden="true">
          <div 
            className="progress-bar"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Introduction;