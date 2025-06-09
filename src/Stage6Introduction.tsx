import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StageLevelIntroduction.css';

interface Stage6IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const Stage6Introduction: React.FC<Stage6IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 6; // Hardcoded to stage 6
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
        returnToStage: 6,
        fromStage: true
      }
    });
  };
  
  const stageTitle = "PAHM Illuminator: Continuous Awareness";
  
  const slides = [
    {
      title: "Welcome to Stage Six",
      content: "As a PAHM Illuminator, you'll develop continuous awareness - the ability to maintain presence throughout your daily activities. This is the most advanced stage of practice."
    },
    {
      title: "Continuous Awareness",
      content: "In this stage, the boundaries between formal practice and daily life begin to dissolve. You'll learn to maintain awareness during all activities."
    },
    {
      title: "Recognizing Subtle Patterns",
      content: "You'll develop heightened sensitivity to the most subtle thought patterns and emotional responses, recognizing them as they first arise."
    },
    {
      title: "Living Presence",
      content: "This stage represents the integration of all previous stages, allowing presence to become your natural state rather than something you practice."
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
  
  // For stage 6 and above, show both buttons on the last slide
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

export default Stage6Introduction;
