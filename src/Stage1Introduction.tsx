import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 1; // Hardcoded to stage 1
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
    // Navigate directly to home page using React Router instead of window.location
    navigate('/home');
  };
  
  const stageTitle = "Seeker: Physical Readiness";
  
  const slides = [
    {
      title: "Welcome to Stage One",
      content: "As a Seeker, you're beginning the journey of developing physical readiness for meditation practice. This stage focuses on building the capacity to remain physically still for extended periods."
    },
    {
      title: "The Physical Foundation",
      content: "Physical stillness creates the container for all mental work that follows. By training your body to remain still, you develop the first essential skill for deeper practice."
    },
    {
      title: "T1-T5 Progression",
      content: "Stage One is divided into 5 progressive levels (T1-T5), gradually building from 10 minutes to 30+ minutes of stillness. Each level builds upon the previous one."
    }
  ];
  
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Mark this introduction as completed
      markIntroCompleted();
      
      // Navigate to home page using React Router instead of window.location
      navigate('/home');
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
    return "Begin Practice";
  };
  
  // Show a welcome back message for returning users
  useEffect(() => {
    if (hasSeenBefore) {
      // Add a small delay to ensure the UI is rendered before showing the message
      const timer = setTimeout(() => {
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-back-message';
        welcomeMessage.innerHTML = `
          <div class="welcome-back-content">
            <h3>Welcome Back!</h3>
            <p>Continue your Stage 1 journey or skip to practice.</p>
          </div>
        `;
        document.querySelector('.stage-level-introduction')?.appendChild(welcomeMessage);
        
        // Remove the message after 3 seconds
        setTimeout(() => {
          document.querySelector('.welcome-back-message')?.remove();
        }, 3000);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [hasSeenBefore]);

  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{stageTitle}</h1>
        <button className="skip-button" onClick={handleSkip}>
          {hasSeenBefore ? "Skip to Practice" : "Skip"}
        </button>
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
          
          <button className="nav-button next" onClick={nextSlide}>
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage1Introduction;
