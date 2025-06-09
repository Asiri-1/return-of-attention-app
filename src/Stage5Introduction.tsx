import React, { useEffect } from 'react';
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
        returnToStage: 5,
        fromStage: true
      }
    });
  };
  
  const stageTitle = "PAHM Master: Effortless Awareness";
  
  const slides = [
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
  
  // For stage 5 and above, show both buttons on the last slide
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

export default Stage5Introduction;
