import React, { useState } from 'react';
import './PracticeSetup.css';
import Logo from './Logo';

interface PracticeSetupProps {
  onBack: () => void;
  onStartPractice: (settings: PracticeSettings) => void;
}

export interface PracticeSettings {
  duration: number;
  posture: string;
  environment: string[];
}

const PracticeSetup: React.FC<PracticeSetupProps> = ({ onBack, onStartPractice }) => {
  const [duration, setDuration] = useState<number>(30);
  const [posture, setPosture] = useState<string>('sitting');
  const [environment, setEnvironment] = useState<string[]>([]);

  const handleDurationChange = (change: number) => {
    const newDuration = Math.max(5, Math.min(60, duration + change));
    setDuration(newDuration);
  };

  const handlePostureSelect = (selectedPosture: string) => {
    setPosture(selectedPosture);
  };

  const handleEnvironmentToggle = (env: string) => {
    if (environment.includes(env)) {
      setEnvironment(environment.filter(item => item !== env));
    } else {
      setEnvironment([...environment, env]);
    }
  };

  const handleBeginPractice = () => {
    onStartPractice({
      duration,
      posture,
      environment
    });
  };

  return (
    <div className="practice-setup">
      <div className="practice-setup-header">
        <Logo />
        <h1>The Return of the Attention</h1>
      </div>

      <div className="practice-setup-content">
        <h2>PRACTICE SETUP</h2>

        <div className="setup-section">
          <h3>Duration</h3>
          <div className="duration-control">
            <span className="duration-value">{duration} minutes</span>
            <div className="duration-buttons">
              <button 
                className="duration-button" 
                onClick={() => handleDurationChange(-5)}
                disabled={duration <= 5}
              >
                −
              </button>
              <button 
                className="duration-button" 
                onClick={() => handleDurationChange(5)}
                disabled={duration >= 60}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="setup-section">
          <h3>Posture</h3>
          <div className="posture-options">
            <div 
              className={`posture-option ${posture === 'sitting' ? 'selected' : ''}`}
              onClick={() => handlePostureSelect('sitting')}
            >
              <div className="posture-icon sitting-icon">
                {/* Icon would be an SVG or image in a real implementation */}
                🧘
              </div>
              <div className="posture-label">
                <span className="posture-name">Sitting</span>
                <span className="posture-description">cross-legged</span>
              </div>
              <div className="posture-radio">
                <div className={`radio-circle ${posture === 'sitting' ? 'selected' : ''}`}>
                  <div className="radio-dot"></div>
                </div>
              </div>
            </div>

            <div 
              className={`posture-option ${posture === 'chair' ? 'selected' : ''}`}
              onClick={() => handlePostureSelect('chair')}
            >
              <div className="posture-icon chair-icon">
                {/* Icon would be an SVG or image in a real implementation */}
                🪑
              </div>
              <div className="posture-label">
                <span className="posture-name">Sitting on</span>
                <span className="posture-description">a chair</span>
              </div>
              <div className="posture-radio">
                <div className={`radio-circle ${posture === 'chair' ? 'selected' : ''}`}>
                  <div className="radio-dot"></div>
                </div>
              </div>
            </div>

            <div 
              className={`posture-option ${posture === 'supported' ? 'selected' : ''}`}
              onClick={() => handlePostureSelect('supported')}
            >
              <div className="posture-icon supported-icon">
                {/* Icon would be an SVG or image in a real implementation */}
                🛋️
              </div>
              <div className="posture-label">
                <span className="posture-name">Sitting with</span>
                <span className="posture-description">back support</span>
              </div>
              <div className="posture-radio">
                <div className={`radio-circle ${posture === 'supported' ? 'selected' : ''}`}>
                  <div className="radio-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="setup-section">
          <h3>Environment</h3>
          <div className="environment-options">
            <div className="environment-option">
              <input 
                type="checkbox" 
                id="quiet-space" 
                checked={environment.includes('quiet')}
                onChange={() => handleEnvironmentToggle('quiet')}
              />
              <label htmlFor="quiet-space">Quiet space</label>
            </div>
            <div className="environment-option">
              <input 
                type="checkbox" 
                id="comfortable-temperature" 
                checked={environment.includes('comfortable-temp')}
                onChange={() => handleEnvironmentToggle('comfortable-temp')}
              />
              <label htmlFor="comfortable-temperature">Comfortable temperature</label>
            </div>
            <div className="environment-option">
              <input 
                type="checkbox" 
                id="low-light" 
                checked={environment.includes('low-light')}
                onChange={() => handleEnvironmentToggle('low-light')}
              />
              <label htmlFor="low-light">Low light</label>
            </div>
            <div className="environment-option">
              <input 
                type="checkbox" 
                id="minimal-distractions" 
                checked={environment.includes('minimal-distractions')}
                onChange={() => handleEnvironmentToggle('minimal-distractions')}
              />
              <label htmlFor="minimal-distractions">Minimal distractions</label>
            </div>
          </div>
        </div>

        <button className="begin-practice-button" onClick={handleBeginPractice}>
          Begin Practice
        </button>

        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default PracticeSetup;
