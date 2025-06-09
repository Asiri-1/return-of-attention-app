import React from 'react';
import './ShortPractice.css';

export interface ShortPracticeProps {
  onBack: () => void;
  onComplete: () => void;
}

const ShortPractice: React.FC<ShortPracticeProps> = ({ 
  onBack = () => {},
  onComplete = () => {}
}) => {
  return (
    <div className="short-practice">
      <div className="short-practice-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Short Practice</h1>
      </div>
      
      <div className="short-practice-content">
        <div className="timer">5:00</div>
        <div className="practice-stage">Quick Mindfulness</div>
        <p className="practice-instruction">
          Take a few moments to center yourself and focus on your breath.
        </p>
        
        <div className="practice-controls">
          <button className="control-button complete" onClick={onComplete}>Complete</button>
        </div>
      </div>
    </div>
  );
};

export default ShortPractice;
