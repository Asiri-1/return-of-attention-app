import React, { useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './contexts/user/UserContext'; // ✅ Firebase-only user context
import './StageLevelIntroduction.css';

interface Stage3IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage3Introduction: React.FC<Stage3IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 3; // Hardcoded to stage 3
  const navigate = useNavigate();
  
  // ✅ FIREBASE-ONLY: Use UserContext for completed stage introductions
  const { userProfile, updateProfile } = useUser();
  
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
  
  // ✅ FIREBASE-ONLY: Memoized function to mark intro completed
  const markIntroCompleted = useCallback(async () => {
    try {
      // ✅ Safe property access and update
      if (userProfile && 'completedStageIntros' in userProfile) {
        const completedIntros = Array.isArray(userProfile.completedStageIntros) 
          ? userProfile.completedStageIntros as number[]
          : [];
        
        if (!completedIntros.includes(stageNumber)) {
          // ✅ Add this stage to completed intros and save to Firebase
          const updatedIntros = [...completedIntros, stageNumber];
          await updateProfile({
            completedStageIntros: updatedIntros
          } as any); // Use type assertion to bypass TypeScript check
          
          console.log(`✅ Stage ${stageNumber} introduction marked as completed in Firebase`);
        }
      } else {
        // ✅ Initialize completedStageIntros if it doesn't exist
        await updateProfile({
          completedStageIntros: [stageNumber]
        } as any);
        
        console.log(`✅ Stage ${stageNumber} introduction completed - initialized completedStageIntros`);
      }
    } catch (error) {
      console.error('❌ Error marking stage intro as completed:', error);
      // Continue anyway - don't block the user flow
    }
  }, [stageNumber, userProfile, updateProfile]);
  
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
  
  // ✅ FIREBASE-ONLY: Memoized skip handler
  const handleSkip = useCallback(async () => {
    await markIntroCompleted();
    onComplete();
  }, [markIntroCompleted, onComplete]);
  
  // ✅ FIREBASE-ONLY: Optimized refresh PAHM handler
  const handleRefreshPAHM = useCallback(async () => {
    await markIntroCompleted();
    // Use React Router navigation instead of custom event
    navigate('/learning/pahm', {
      state: {
        returnToStage: 3,
        fromStage: true
      }
    });
  }, [markIntroCompleted, navigate]);
  
  // ✅ ENHANCED: Memoized stage title
  const stageTitle = useMemo(() => "PAHM Beginner: Dot Tracking Practice", []);
  
  // ✅ ENHANCED: Memoized slides data
  const slides = useMemo(() => [
    {
      title: "Welcome to Stage Three",
      content: "As a PAHM Beginner, you'll learn the dot tracking technique, a powerful method for developing sustained attention and recognizing when your mind has wandered."
    },
    {
      title: "Poison Thoughts",
      content: "Stage Three introduces the concept of 'poison thoughts' - recurring thought patterns that pull you away from presence and into suffering. You'll learn to identify your personal poison thoughts."
    },
    {
      title: "The Dot Tracking Method",
      content: "This technique involves visualizing a small dot and maintaining your attention on it. When your mind wanders, you'll practice gently returning to the dot."
    },
    {
      title: "Building Attention Muscle",
      content: "Just as Stage One built your physical stillness capacity, Stage Three builds your attention muscle, allowing you to remain present for longer periods."
    }
  ], []);
  
  // ✅ FIREBASE-ONLY: Memoized navigation functions
  const nextSlide = useCallback(async () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // ✅ Mark this introduction as completed in Firebase
      await markIntroCompleted();
      
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
          aria-label="Skip Stage 3 introduction"
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
                aria-label="Start Stage 3 practice"
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

export default Stage3Introduction;