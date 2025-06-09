import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  // We're removing the auto-skip logic to ensure the introduction is always shown
  // Users can still manually skip using the skip button if needed
  
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
    onComplete();
  };
  
  // Handle refresh PAHM button click
  const handleRefreshPAHM = () => {
    markIntroCompleted();
    // Use React Router navigation instead of custom event
    navigate('/learning/pahm', {
      state: {
        returnToStage: 3,
        fromStage: true
      }
    });
  };
  
  const stageTitle = "PAHM Beginner: Dot Tracking Practice";
  
  const slides = [
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
  ];
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark this introduction as completed
      markIntroCompleted();
      
      // Complete the introduction and move to the next step
      onComplete();
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  };
  
  // For stage 3 and above, show both buttons on the last slide
  const showRefreshPAHMButton = currentSlide === slides.length - 1;
  
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
          
          {showRefreshPAHMButton ? (
            <>
              <button 
                className="nav-button refresh-pahm" 
                onClick={handleRefreshPAHM}
              >
                Refresh about PAHM
              </button>
              <button className="nav-button next" onClick={nextSlide}>
                Start Practice
              </button>
            </>
          ) : (
            <button className="nav-button next" onClick={nextSlide}>
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stage3Introduction;
