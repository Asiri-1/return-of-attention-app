import React from 'react';
import './Onboarding.css';
import Logo from './Logo';

interface OnboardingScreenProps {
  step: number;
  onNext: () => void;
  onBack: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ step, onNext, onBack }) => {
  // Render content based on step
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="onboarding-content">
            <h2>Welcome to Return of the Attention</h2>
            <p>A practice to develop mindfulness through the Present Attention and Happiness Matrix.</p>
            <div className="center-dot-container">
              <div className="center-dot pulse"></div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="onboarding-content">
            <h2>Scattered vs. Centered Attention</h2>
            <p>Learn to recognize when your attention is scattered across past, future, attachment, and aversion.</p>
            <div className="attention-visualization">
              <div className="scattered-attention">
                <div className="attention-dot past"></div>
                <div className="attention-dot future"></div>
                <div className="attention-dot attachment"></div>
                <div className="attention-dot aversion"></div>
                <div className="attention-dot center"></div>
              </div>
              <div className="centered-attention">
                <div className="attention-dot center large"></div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="onboarding-content">
            <h2>How the Practice Works</h2>
            <p>During each practice session:</p>
            <ol className="practice-steps">
              <li>Set a timer for your practice duration</li>
              <li>Notice where your attention is in each moment</li>
              <li>Click the corresponding position on the matrix</li>
              <li>Observe patterns in your attention</li>
              <li>Gradually develop more presence</li>
            </ol>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="onboarding-screen">
      <div className="onboarding-header">
        <Logo />
        <h1>Return of the Attention</h1>
      </div>
      
      {renderStepContent()}
      
      <div className="onboarding-navigation">
        {step > 1 && (
          <button className="back-button" onClick={onBack}>
            Back
          </button>
        )}
        
        <div className="step-indicators">
          <div className={`step-indicator ${step === 1 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step === 2 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step === 3 ? 'active' : ''}`}></div>
        </div>
        
        <button className="next-button" onClick={onNext}>
          {step < 3 ? 'Next' : 'Start Practice'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
