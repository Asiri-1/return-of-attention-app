import React, { useState } from 'react';
import OnboardingScreen from './OnboardingScreen';
import InteractiveDemo from './InteractiveDemo';
import './Onboarding.css';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'demo' | 'complete'>('welcome');
  const [welcomeStep, setWelcomeStep] = useState<number>(1);
  
  // Handle welcome screen navigation
  const handleWelcomeNext = () => {
    if (welcomeStep < 3) {
      setWelcomeStep(welcomeStep + 1);
    } else {
      setCurrentStep('demo');
    }
  };
  
  const handleWelcomeBack = () => {
    if (welcomeStep > 1) {
      setWelcomeStep(welcomeStep - 1);
    }
  };
  
  // Handle demo completion
  const handleDemoComplete = () => {
    setCurrentStep('complete');
    if (onComplete) {
      onComplete();
    }
  };
  
  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <OnboardingScreen 
            step={welcomeStep} 
            onNext={handleWelcomeNext} 
            onBack={handleWelcomeBack}
          />
        );
      case 'demo':
        return (
          <InteractiveDemo 
            onComplete={handleDemoComplete}
          />
        );
      case 'complete':
        return null;
      default:
        return null;
    }
  };
  
  return (
    <div className="onboarding-flow">
      {renderStep()}
    </div>
  );
};

export default OnboardingFlow;
