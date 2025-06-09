import React, { useState } from 'react';
import './PracticeComplete.css';
import Logo from './Logo';

interface PracticeCompleteProps {
  onBack: () => void;
  onSaveAndContinue: (rating: number, reflectionData?: ReflectionData) => void;
  sessionData: {
    duration: number;
    stage: number;
    stageTitle: string;
    pahmDistribution?: {
      present: number;
      past: number;
      future: number;
      other: number;
    }
  }
}

export interface ReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

const PracticeComplete: React.FC<PracticeCompleteProps> = ({ 
  onBack, 
  onSaveAndContinue, 
  sessionData 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [insights, setInsights] = useState<string>('');
  
  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating);
  };
  
  const handleChallengeToggle = (challenge: string) => {
    if (challenges.includes(challenge)) {
      setChallenges(challenges.filter(c => c !== challenge));
    } else {
      setChallenges([...challenges, challenge]);
    }
  };
  
  const handleSaveAndContinue = () => {
    const reflectionData = {
      reflectionText,
      challenges,
      insights
    };
    onSaveAndContinue(rating, reflectionData);
  };
  
  // For Stage 1 (Physical Stillness), we don't show PAHM distribution
  const showPAHM = sessionData.stage !== 1 && sessionData.pahmDistribution;
  
  return (
    <div className="practice-complete">
      <div className="practice-complete-header">
        <button className="back-button" onClick={onBack}>
          Back
        </button>
        <h1>Practice Complete</h1>
      </div>
      
      <div className="practice-complete-content">
        <div className="app-logo">
          <Logo />
        </div>
        
        <div className="app-title">The Return of Attention</div>
        
        <div className="session-info">
          <div className="session-detail">Session Duration: {sessionData.duration} minutes</div>
          <div className="session-detail">Stage: {sessionData.stage} • {sessionData.stageTitle}</div>
        </div>
        
        {/* PAHM distribution is only shown for stages other than Stage 1 */}
        {showPAHM && sessionData.pahmDistribution && (
          <div className="pahm-distribution">
            <h2>PAHM Position Distribution</h2>
            
            <div className="chart-container">
              {/* PAHM chart implementation */}
              {/* This section is hidden for Stage 1 */}
            </div>
          </div>
        )}
        
        {/* Integrated reflection section */}
        <div className="reflection-section">
          <h3>What did you notice during your practice?</h3>
          <textarea 
            className="reflection-textarea"
            placeholder="Enter your reflections here..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
          />
        </div>
        
        <div className="reflection-section">
          <h3>Challenges</h3>
          <div className="challenges-options">
            <div className="challenge-option">
              <input 
                type="checkbox" 
                id="mind-wandering" 
                checked={challenges.includes('mind-wandering')}
                onChange={() => handleChallengeToggle('mind-wandering')}
              />
              <label htmlFor="mind-wandering">Mind wandering</label>
            </div>
            <div className="challenge-option">
              <input 
                type="checkbox" 
                id="physical-discomfort" 
                checked={challenges.includes('physical-discomfort')}
                onChange={() => handleChallengeToggle('physical-discomfort')}
              />
              <label htmlFor="physical-discomfort">Physical discomfort</label>
            </div>
            <div className="challenge-option">
              <input 
                type="checkbox" 
                id="sleepiness" 
                checked={challenges.includes('sleepiness')}
                onChange={() => handleChallengeToggle('sleepiness')}
              />
              <label htmlFor="sleepiness">Sleepiness</label>
            </div>
            <div className="challenge-option">
              <input 
                type="checkbox" 
                id="restlessness" 
                checked={challenges.includes('restlessness')}
                onChange={() => handleChallengeToggle('restlessness')}
              />
              <label htmlFor="restlessness">Restlessness</label>
            </div>
            <div className="challenge-option">
              <input 
                type="checkbox" 
                id="strong-emotions" 
                checked={challenges.includes('strong-emotions')}
                onChange={() => handleChallengeToggle('strong-emotions')}
              />
              <label htmlFor="strong-emotions">Strong emotions</label>
            </div>
            <div className="challenge-option">
              <input 
                type="checkbox" 
                id="external-distractions" 
                checked={challenges.includes('external-distractions')}
                onChange={() => handleChallengeToggle('external-distractions')}
              />
              <label htmlFor="external-distractions">External distractions</label>
            </div>
          </div>
        </div>
        
        <div className="reflection-section">
          <h3>Insights</h3>
          <textarea 
            className="reflection-textarea"
            placeholder="Enter any insights here..."
            value={insights}
            onChange={(e) => setInsights(e.target.value)}
          />
        </div>
        
        {/* Practice rating moved to just before the Save button */}
        <div className="practice-rating">
          <h2>How was your practice?</h2>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                className={`star-button ${rating >= star ? 'active' : ''}`}
                onClick={() => handleRatingSelect(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        
        <button className="save-continue-button" onClick={handleSaveAndContinue}>
          Save & Continue
        </button>
        
        <div className="home-indicator"></div>
      </div>
    </div>
  );
};

export default PracticeComplete;
