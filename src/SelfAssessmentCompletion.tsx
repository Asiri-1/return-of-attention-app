import React from 'react';
import './SelfAssessmentCompletion.css';

interface SelfAssessmentCompletionProps {
  onGetStarted: () => void;
  onBack: () => void;
}

const SelfAssessmentCompletion: React.FC<SelfAssessmentCompletionProps> = ({ 
  onGetStarted,
  onBack
}) => {
  return (
    <div className="self-assessment-completion">
      <div className="completion-header">
        <h1>The Return of Attention</h1>
      </div>
      
      <div className="completion-content">
        <div className="completion-message">
          <h2>Great Job!</h2>
          <p>You've completed the self-assessment and taken the first step on your journey to greater presence and attention.</p>
        </div>
        
        <div className="journey-overview">
          <h3>Your Journey Ahead</h3>
          <p>The Return of Attention practice consists of six progressive stages:</p>
          
          <div className="stages-list">
            <div className="stage-item">
              <div className="stage-number">1</div>
              <div className="stage-details">
                <h4>Seeker</h4>
                <p>Physical Readiness - Building the foundation through physical stillness</p>
              </div>
            </div>
            
            <div className="stage-item">
              <div className="stage-number">2</div>
              <div className="stage-details">
                <h4>Observer</h4>
                <p>Understanding Thought Patterns - Learning to observe without attachment</p>
              </div>
            </div>
            
            <div className="stage-item">
              <div className="stage-number">3</div>
              <div className="stage-details">
                <h4>Tracker</h4>
                <p>Dot Tracking Practice - Developing sustained attention</p>
              </div>
            </div>
            
            <div className="stage-item">
              <div className="stage-number">4</div>
              <div className="stage-details">
                <h4>Practitioner</h4>
                <p>Tool-Free Practice - Practicing without external supports</p>
              </div>
            </div>
            
            <div className="stage-item">
              <div className="stage-number">5</div>
              <div className="stage-details">
                <h4>Master</h4>
                <p>Sustained Presence - Maintaining presence throughout daily activities</p>
              </div>
            </div>
            
            <div className="stage-item">
              <div className="stage-number">6</div>
              <div className="stage-details">
                <h4>Illuminator</h4>
                <p>Integration & Teaching - Fully integrating the practice into your life</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="next-steps">
          <p>You'll begin with Stage One: Physical Readiness, where you'll learn the proper posture and physical foundation for your practice.</p>
          <p>Each stage builds upon the previous one, creating a comprehensive path to mastery.</p>
        </div>
        
        <div className="action-buttons">
          <button className="get-started-button" onClick={onGetStarted}>
            Get Started
          </button>
          <button className="back-button" onClick={onBack}>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessmentCompletion;