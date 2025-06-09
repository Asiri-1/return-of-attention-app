import React from 'react';
import './StageLevelIntroduction.css';

interface T2IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T2Introduction: React.FC<T2IntroductionProps> = ({
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
          <h2>T2: Building Endurance</h2>
          <p>
            T2 practice extends your physical stillness to 15 minutes. 
            This level builds on the foundation you established in T1 and 
            helps develop greater physical endurance for meditation.
          </p>
          
          <div className="prerequisite-message">
            <strong>Prerequisite:</strong> Complete at least three T1 sessions 
            where you can maintain physical stillness without any strain or discomfort.
            Only progress to T2 when T1 feels effortless and natural.
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

export default T2Introduction;
