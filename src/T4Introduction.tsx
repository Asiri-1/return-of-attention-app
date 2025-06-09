import React from 'react';
import './StageLevelIntroduction.css';

interface T4IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T4Introduction: React.FC<T4IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const stageTitle = "Seeker: Physical Readiness";
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{stageTitle}</h1>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          <h2>T4: Extended Stillness</h2>
          <p>
            T4 practice extends your physical stillness to 25 minutes. 
            At this level, you're developing significant physical endurance 
            that will support deeper meditation practices in future stages.
          </p>
          
          <div className="prerequisite-message">
            <strong>Prerequisite:</strong> Only progress to T4 after completing 
            several T3 sessions where you can maintain physical stillness for 
            20 minutes without experiencing any physical stress or discomfort. 
            Your body should remain relaxed and at ease throughout the entire 
            T3 practice before attempting this longer duration.
          </div>
          
          <div className="slide-progress">
            <div className="progress-dot active" />
          </div>
        </div>
        
        <div className="navigation-buttons">
          <button className="nav-button back" onClick={onBack}>
            Back
          </button>
          
          <button className="nav-button next" onClick={onComplete}>
            Begin Practice
          </button>
        </div>
      </div>
    </div>
  );
};

export default T4Introduction;
