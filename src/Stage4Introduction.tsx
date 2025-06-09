import React, { useEffect } from 'react';
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
        returnToStage: 4,
        fromStage: true
      }
    });
  };
  
  const stageTitle = "PAHM Practitioner: Tool-Free Practice";
  
  const slides = [
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
  
  // For stage 4 and above, show both buttons on the last slide
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

export default Stage4Introduction;
