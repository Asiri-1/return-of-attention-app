import React from 'react';
import './StageLevelIntroduction.css';

interface T3IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T3Introduction: React.FC<T3IntroductionProps> = ({
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
          <h2>T3: Deepening Stillness</h2>
          <p>
            T3 practice extends your physical stillness to 20 minutes. 
            This level builds upon the foundation established in T2 and 
            prepares you for longer meditation sessions.
          </p>
          
          <div className="prerequisite-message">
            <strong>Prerequisite:</strong> Only progress to T3 after completing 
            several T2 sessions where you can maintain physical stillness for 
            15 minutes without any strain or physical stress. Your body should 
            feel completely at ease during T2 practice before attempting T3.
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

export default T3Introduction;
