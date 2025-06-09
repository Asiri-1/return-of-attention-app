import React, { useState, useEffect } from 'react';
import './Onboarding.css';
import PAHMMatrix from './PAHMMatrix';
import PracticeTimer from './PracticeTimer';
import { PAHMCounts } from './types/PAHMTypes';

interface InteractiveDemoProps {
  onComplete: () => void;
  onBack?: () => void;
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<number>(1);
  const [demoComplete, setDemoComplete] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [currentPosition, setCurrentPosition] = useState<string>('present');
  
  // Initialize PAHM counts
  const [pahmCounts, setPahmCounts] = useState<PAHMCounts>({
    nostalgia: 0,
    likes: 0,
    anticipation: 0,
    past: 0,
    present: 0,
    future: 0,
    regret: 0,
    dislikes: 0,
    worry: 0
  });
  
  // Position descriptions for tooltips
  const positionDescriptions: {[key: string]: string} = {
    present: "The center position represents being fully present in the here and now.",
    past: "Past without likes or dislikes is neutral awareness of past events.",
    future: "Future without likes or dislikes is neutral awareness of what may come.",
    nostalgia: "Nostalgia is pleasant memories or thoughts about the past.",
    likes: "Likes represent desire, craving, or clinging to pleasant experiences.",
    anticipation: "Anticipation is positive expectations about future possibilities or events.",
    regret: "Regret is negative feelings about past experiences or decisions.",
    dislikes: "Dislikes represent resistance, avoidance, or rejection of unpleasant experiences.",
    worry: "Worry is anxiety about future possibilities or events."
  };
  
  // Handle position update
  const handlePositionUpdate = (position: string, count: number) => {
    setCurrentPosition(position);
    
    // Update counts
    setPahmCounts(prev => ({
      ...prev,
      [position]: count
    }));
    
    // If in step 2 (practice), continue
    if (step === 2) {
      // Hide tooltip after first selection
      setShowTooltip(false);
    }
  };
  
  // Handle demo timer completion
  const handleDemoComplete = () => {
    setDemoComplete(true);
    setStep(3);
  };
  
  // Handle step navigation
  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
      
      // Reset tooltip for step 2
      if (step === 1) {
        setShowTooltip(true);
        setCurrentPosition('present');
      }
    } else {
      onComplete();
    }
  };
  
  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onBack) {
      onBack();
    }
  };
  
  // Cycle through positions for step 1
  useEffect(() => {
    if (step === 1 && showTooltip) {
      const positions = ['present', 'past', 'future', 'nostalgia', 'likes', 'anticipation', 'regret', 'dislikes', 'worry'];
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % positions.length;
        setCurrentPosition(positions[currentIndex]);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [step, showTooltip]);
  
  return (
    <div className="interactive-demo">
      <div className="demo-header">
        <h2>
          {step === 1 && 'Explore the PAHM Matrix'}
          {step === 2 && 'Practice Session (2 minutes)'}
          {step === 3 && 'Practice Complete'}
        </h2>
      </div>
      
      <div className="demo-content">
        {step === 1 && (
          <div className="matrix-exploration">
            <p className="exploration-instruction">
              The PAHM (Present Attention and Happiness Matrix) helps you track where your attention is in each moment.
            </p>
            
            <div className="matrix-container">
              <PAHMMatrix 
                isInteractive={false}
                onCountUpdate={handlePositionUpdate}
                initialCounts={pahmCounts}
              />
              
              {showTooltip && (
                <div className={`position-tooltip tooltip-${currentPosition}`}>
                  <div className="tooltip-content">
                    <h3>{currentPosition.charAt(0).toUpperCase() + currentPosition.slice(1)}</h3>
                    <p>{positionDescriptions[currentPosition]}</p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="exploration-description">
              Each position represents a different state of attention. The center represents being fully present.
            </p>
          </div>
        )}
        
        {step === 2 && (
          <div className="practice-session">
            <p className="practice-instruction">
              Try a brief practice session. Notice where your attention is and tap the corresponding position.
            </p>
            
            <div className="practice-container">
              <PAHMMatrix 
                isInteractive={true}
                onCountUpdate={handlePositionUpdate}
                initialCounts={pahmCounts}
              />
              
              <div className="practice-sidebar">
                <div className="position-info">
                  <h3>Current Position</h3>
                  <div className="selected-position">
                    {currentPosition.charAt(0).toUpperCase() + currentPosition.slice(1)}
                  </div>
                </div>
                
                <PracticeTimer 
                  initialMinutes={2} // 2 minutes (converted from 120 seconds)
                  stageLevel="Demo Practice"
                  onComplete={handleDemoComplete}
                  onBack={() => setStep(1)}
                />
                
                {showTooltip && (
                  <div className="practice-tooltip">
                    <p>Tap on the matrix to track your attention</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="practice-complete">
            <div className="completion-message">
              <h3>Great job!</h3>
              <p>You've completed your first practice session with the PAHM Matrix.</p>
              <p>In the full practice, you'll be able to:</p>
              <ul>
                <li>Set custom practice durations (minimum 30 minutes for PAHM stages)</li>
                <li>Track your progress over time</li>
                <li>Gain insights into your attention patterns</li>
                <li>Develop greater presence and awareness</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className="demo-navigation">
        {(step > 1 || onBack) && (
          <button className="back-button" onClick={handleBackStep}>
            {step > 1 ? 'Back' : 'Return to Welcome'}
          </button>
        )}
        
        <div className="step-indicators">
          <div className={`step-indicator ${step === 1 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step === 2 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step === 3 ? 'active' : ''}`}></div>
        </div>
        
        <button 
          className="next-button" 
          onClick={handleNextStep}
          disabled={step === 2 && !demoComplete}
        >
          {step === 1 && 'Start Practice'}
          {step === 2 && (demoComplete ? 'Continue' : 'Practicing...')}
          {step === 3 && 'Begin Your Journey'}
        </button>
      </div>
    </div>
  );
};

export default InteractiveDemo;
