import React, { useEffect } from 'react';
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
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const stageNumber = 1;
  const navigate = useNavigate();
  
  // ✅ SIMPLIFIED: Only get what we actually need
  const { updateUserProfileInContext } = useAuth();
  
  // ✅ FIXED: Simplified intro completion - no more self-assessment manipulation
  const markIntroCompleted = () => {
    console.log('🔍 Stage 1 introduction completed');
    
    // Update localStorage for intro tracking (existing logic)
    const completedIntros = JSON.parse(localStorage.getItem('completedStageIntros') || '[]');
    if (!completedIntros.includes(stageNumber)) {
      completedIntros.push(stageNumber);
      localStorage.setItem('completedStageIntros', JSON.stringify(completedIntros));
    }
    
    // ✅ SIMPLIFIED: Only update current stage since self-assessment is already completed
    try {
      updateUserProfileInContext({ 
        currentStage: '1'
      });
      console.log('✅ Current stage updated to 1');
    } catch (error) {
      console.warn('Could not update current stage:', error);
      // Continue anyway since this is not critical
    }
  };
  
  // ✅ SIMPLIFIED: Handle skip
  const handleSkip = () => {
    markIntroCompleted();
    
    // Small delay to ensure state propagation
    setTimeout(() => {
      console.log('🔍 Navigating to /home after skip');
      navigate('/home');
    }, 100);
  };
  
  // ✅ SIMPLIFIED: Handle completion
  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      markIntroCompleted();
      
      // Small delay to ensure state propagation
      setTimeout(() => {
        console.log('🔍 Navigating to /home after completion');
        navigate('/home');
      }, 100);
    }
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
  
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    } else {
      onBack();
    }
  };
  
  const getButtonText = () => {
    if (currentSlide < slides.length - 1) {
      return "Next";
    }
    return "Begin Practice";
  };
  
  // Show a welcome back message for returning users
  useEffect(() => {
    if (hasSeenBefore) {
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