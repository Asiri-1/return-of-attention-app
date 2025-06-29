import React from 'react';
import './StageLevelIntroduction.css';

interface T1IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T1Introduction: React.FC<T1IntroductionProps> = ({
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
          <h2>Your First Goal</h2>
          <p>
            Begin with T1: three 10-minute sessions of physical stillness. 
            Once you can maintain stillness comfortably for this duration, 
            you'll progress to longer periods.
          </p>
          
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
        </div>a
      </div>
    </div>
  );
};

export default T1Introduction;
