import React from 'react';
import './StageLevelIntroduction.css';

interface T5IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T5Introduction: React.FC<T5IntroductionProps> = ({
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
          <h2>T5: Complete Physical Readiness</h2>
          <p>
            T5 practice extends your physical stillness to 30 minutes. 
            This is the final level of Stage One, representing complete physical 
            readiness for advancing to more advanced meditation practices.
          </p>
          
          <div className="prerequisite-message">
            <strong>Prerequisite:</strong> Only progress to T5 after completing 
            several T4 sessions where you can maintain physical stillness for 
            25 minutes without any physical strain or discomfort. Your body should 
            feel completely at ease throughout the entire T4 practice, with no 
            need for adjustments or relief from physical sensations.
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

export default T5Introduction;
