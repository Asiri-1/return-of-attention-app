import React from 'react';
import './SelfAssessmentCompletion.css';

interface SelfAssessmentCompletionProps {
  onGetStarted: (data?: any) => void; // Changed to accept optional data parameter
  onBack: () => void;
}

const SelfAssessmentCompletion: React.FC<SelfAssessmentCompletionProps> = ({
  onGetStarted,
  onBack
}) => {

  const handleGetStarted = () => {
    // Pass completion data with navigation instruction
    const completionData = {
      completedAt: new Date().toISOString(),
      readyForStageOne: true,
      navigateTo: 'homepage' // Add navigation instruction
    };
    onGetStarted(completionData);
  };

  return (
    <div className="completion-container">
      <div className="completion-content">
        <div className="logo-section">
          The Return of Attention
        </div>
        
        <div className="congratulations-section">
          <div className="celebration-icon">
            🎉
          </div>
          <h1 className="congratulations-title">
            Great Job!
          </h1>
          <p className="congratulations-text">
            You've completed the self-assessment and taken the first step on your journey to greater presence and attention.
          </p>
        </div>

        <div className="journey-section">
          <h2 className="journey-title">
            Your Journey Ahead
          </h2>
          <p className="journey-description">
            The Return of Attention practice consists of six progressive stages:
          </p>
          
          <div className="stages-list">
            <div className="stage-item">
              <div className="stage-number">
                1
              </div>
              <div className="stage-content">
                <h3 className="stage-name">
                  Seeker
                </h3>
                <p className="stage-description">
                  Physical Readiness - Building the foundation through physical stillness
                </p>
              </div>
            </div>

            <div className="stage-item">
              <div className="stage-number">
                2
              </div>
              <div className="stage-content">
                <h3 className="stage-name">
                  Observer
                </h3>
                <p className="stage-description">
                  Understanding Thought Patterns - Learning to observe without attachment
                </p>
              </div>
            </div>

            <div className="stage-item">
              <div className="stage-number">
                3
              </div>
              <div className="stage-content">
                <h3 className="stage-name">
                  Tracker
                </h3>
                <p className="stage-description">
                  Dot Tracking Practice - Developing sustained attention
                </p>
              </div>
            </div>

            <div className="stage-item">
              <div className="stage-number">
                4
              </div>
              <div className="stage-content">
                <h3 className="stage-name">
                  Practitioner
                </h3>
                <p className="stage-description">
                  Tool-Free Practice - Practicing without external supports
                </p>
              </div>
            </div>

            <div className="stage-item">
              <div className="stage-number">
                5
              </div>
              <div className="stage-content">
                <h3 className="stage-name">
                  Master
                </h3>
                <p className="stage-description">
                  Sustained Presence - Maintaining presence throughout daily activities
                </p>
              </div>
            </div>

            <div className="stage-item">
              <div className="stage-number">
                6
              </div>
              <div className="stage-content">
                <h3 className="stage-name">
                  Illuminator
                </h3>
                <p className="stage-description">
                  Integration & Teaching - Fully integrating the practice into your life
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="next-steps-section">
          <p className="next-steps-text">
            Ready to begin your journey? Click "Return to Homepage" to access your personalized dashboard and start Stage One.
          </p>
          <p className="stage-info">
            Each stage builds upon the previous one, creating a comprehensive path to mastery.
          </p>
        </div>

        <div className="action-buttons">
          <button 
            className="get-started-button"
            onClick={handleGetStarted}
          >
            Return to Homepage
          </button>
          <button 
            className="back-button"
            onClick={onBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessmentCompletion;