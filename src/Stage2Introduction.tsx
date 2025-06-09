import React, { useEffect } from 'react';
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
  
  // Check if this stage's introduction has been completed before
  // Stage 2 introduction will always be shown, never auto-skipped
  
  // Mark this stage's introduction as completed
  const markIntroCompleted = () => {
    const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
    if (!completedIntros.includes(stageNumber)) {
      completedIntros.push(stageNumber);
      localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
    }
  };
  
  // Handle skip button click
  const handleSkip = () => {
    markIntroCompleted();
    // Skip directly to posture selection, not to PAHM explanation
    onComplete();
  };
  
  const stageTitle = "PAHM Trainee: Understanding Thought Patterns";
  
  const slides = [
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
  ];
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark this introduction as completed
      markIntroCompleted();
      
      // Complete the introduction and move to the next step
      // Pass state to indicate coming from intro
      onComplete();
      
      // Use navigate with state instead of direct location change
      window.history.pushState({ fromIntro: true }, '', window.location.pathname);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  };
  
  // Determine button text based on current slide
  const getButtonText = () => {
    if (currentSlide < slides.length - 1) {
      return "Next";
    }
    return "Learn about PAHM";
  };
  
  // Handle learn about PAHM button click
  const handleLearnAboutPAHM = () => {
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
  };
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{stageTitle}</h1>
        <button className="skip-button" onClick={handleSkip}>Skip</button>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          <h2>{slides[currentSlide].title}</h2>
          <p>{slides[currentSlide].content}</p>
          
          <div className="slide-progress">
            {slides.map((_, index) => (
              <div 
                key={index} 
                className={`progress-dot ${index === currentSlide ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
        
        <div className="navigation-buttons">
          {currentSlide > 0 && (
            <button className="nav-button back" onClick={prevSlide}>
              Back
            </button>
          )}
          
          <button className="nav-button next" onClick={handleLearnAboutPAHM}>
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage2Introduction;
