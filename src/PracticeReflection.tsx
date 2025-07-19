import React, { useState } from 'react';
import './PracticeReflection.css';

interface PracticeReflectionProps {
  onBack: () => void;
  onSaveReflection: (reflectionData: ReflectionData) => void;
}

export interface ReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

const PracticeReflection: React.FC<PracticeReflectionProps> = ({
  onBack,
  onSaveReflection
}) => {
  const [reflectionText, setReflectionText] = useState<string>('');
  const [challenges, setChallenges] = useState<string[]>([]);
  const [insights, setInsights] = useState<string>('');
  
  const handleChallengeToggle = (challenge: string) => {
    if (challenges.includes(challenge)) {
      setChallenges(challenges.filter(c => c !== challenge));
    } else {
      setChallenges([...challenges, challenge]);
    }
  };
  
  const handleSaveReflection = () => {
    onSaveReflection({
      reflectionText,
      challenges,
      insights
    });
  };
  
  return (
    <div className="practice-reflection">
      <div className="practice-reflection-header">
        <h1>The Return of Attention</h1>
      </div>
      
      <div className="practice-reflection-content">
        <h2>Practice Reflection</h2>
        
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
        
        <button className="save-reflection-button" onClick={handleSaveReflection}>
          Save Reflection
        </button>
        
        <button className="back-button" onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};

export default PracticeReflection;

// This empty export ensures the file is treated as a module
export {};