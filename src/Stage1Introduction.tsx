import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './StageLevelIntroduction.css';

interface Stage1IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
  hasSeenBefore?: boolean;
}

const Stage1Introduction: React.FC<Stage1IntroductionProps> = ({
  onComplete,
  onBack,
  hasSeenBefore = false
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const stageNumber = 1;
  const navigate = useNavigate();
  
  const { updateUserProfileInContext } = useAuth();
  
  const slides = [
    {
      title: "Welcome to Stage One",
      content: "As a Seeker, you're beginning the journey of developing physical readiness for meditation practice. This stage focuses on building the capacity to remain physically still for extended periods.",
      icon: "🌱"
    },
    {
      title: "The Physical Foundation",
      content: "Physical stillness creates the container for all mental work that follows. By training your body to remain still, you develop the first essential skill for deeper practice.",
      icon: "🏗️"
    },
    {
      title: "T1-T5 Progression",
      content: "Stage One is divided into 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ minutes of stillness. Each level builds upon the previous one.",
      icon: "📈"
    }
  ];
  
  // ✅ OPTIMIZED: Memoized completion handler
  const markIntroCompleted = useCallback(() => {
    console.log('🔍 Stage 1 introduction completed');
    
    try {
      // Update localStorage for intro tracking
      const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
      if (!completedIntros.includes(stageNumber)) {
        completedIntros.push(stageNumber);
        localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
      }
      
      // Update current stage
      updateUserProfileInContext({ 
        currentStage: '1'
      });
      console.log('✅ Current stage updated to 1');
    } catch (error) {
      console.warn('Could not update stage completion:', error);
      // Continue anyway since this is not critical
    }
  }, [stageNumber, updateUserProfileInContext]);
  
  // ✅ OPTIMIZED: Memoized skip handler
  const handleSkip = useCallback(() => {
    markIntroCompleted();
    
    setTimeout(() => {
      console.log('🔍 Navigating to /home after skip');
      navigate('/home');
    }, 100);
  }, [markIntroCompleted, navigate]);
  
  // ✅ OPTIMIZED: Memoized navigation
  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      markIntroCompleted();
      
      setTimeout(() => {
        console.log('🔍 Navigating to /home after completion');
        navigate('/home');
      }, 100);
    }
  }, [currentSlide, slides.length, markIntroCompleted, navigate]);
  
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
  
  // ✅ IMPROVED: React-based welcome message
  useEffect(() => {
    if (hasSeenBefore) {
      setShowWelcomeBack(true);
      const timer = setTimeout(() => {
        setShowWelcomeBack(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenBefore]);
  
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

  // ✅ NEW: Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [nextSlide, prevSlide, handleSkip]);
  
  const getButtonText = () => {
    if (currentSlide < slides.length - 1) {
      return "Next";
    }
    return "Begin Practice";
  };

  return (
    <div 
      className="stage-level-introduction"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ✅ IMPROVED: React-based welcome message */}
      {showWelcomeBack && (
        <div className="welcome-back-message">
          <div className="welcome-back-content">
            <h3>Welcome Back! 👋</h3>
            <p>Continue your Stage 1 journey or skip to practice.</p>
          </div>
        </div>
      )}
      
      <div className="stage-instructions-header">
        <button 
          className="back-button" 
          onClick={onBack}
          aria-label="Go back"
        >
          Back
        </button>
        <h1>Seeker: Physical Readiness</h1>
        <button 
          className="skip-button" 
          onClick={handleSkip}
          aria-label={hasSeenBefore ? "Skip to practice" : "Skip introduction"}
        >
          {hasSeenBefore ? "Skip to Practice" : "Skip"}
        </button>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          {/* ✅ ADDED: Visual icon for better engagement */}
          <div className="slide-icon">{slides[currentSlide].icon}</div>
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          <div className="slide-progress">
            {slides.map((_, index) => (
              <div 
                key={index} 
                className={`progress-dot ${index === currentSlide ? 'active' : ''}`}
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
            className="nav-button next" 
            onClick={nextSlide}
            aria-label={currentSlide === slides.length - 1 ? 'Begin practice' : 'Go to next slide'}
          >
            {getButtonText()}
          </button>
        </div>
        
        {/* ✅ NEW: Progress indicator */}
        <div className="slide-progress-bar" aria-hidden="true">
          <div 
            className="progress-fill"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Stage1Introduction;