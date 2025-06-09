import React, { useState } from 'react';
import './PAHMPracticeComplete.css';
import Logo from './Logo';
import { PAHMCounts } from './types/PAHMTypes';

// Define locally to avoid import issues
interface PAHMReflectionData {
  reflectionText: string;
  challenges: string[];
  insights: string;
}

interface PAHMPracticeCompleteProps {
  onBack: () => void;
  onSaveAndContinue: (rating: number, reflectionData?: PAHMReflectionData) => void;
  sessionData: {
    duration: number;
    stage: number;
    stageTitle: string;
    pahmCounts: PAHMCounts;
  }
}

const PAHMPracticeComplete: React.FC<PAHMPracticeCompleteProps> = ({ 
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
    const reflectionData: PAHMReflectionData = {
      reflectionText,
      challenges,
      insights
    };
    onSaveAndContinue(rating, reflectionData);
  };
  
  // Calculate PAHM distribution
  const calculatePAHMDistribution = () => {
    const { pahmCounts } = sessionData;
    const present = pahmCounts.present || 0;
    const past = pahmCounts.past || 0;
    const future = pahmCounts.future || 0;
    const nostalgia = pahmCounts.nostalgia || 0;
    const likes = pahmCounts.likes || 0;
    const anticipation = pahmCounts.anticipation || 0;
    const regret = pahmCounts.regret || 0;
    const dislikes = pahmCounts.dislikes || 0;
    const worry = pahmCounts.worry || 0;
    
    const total = present + past + future + nostalgia + likes + anticipation + regret + dislikes + worry;
    
    return {
      present: total > 0 ? Math.round((present / total) * 100) : 0,
      past: total > 0 ? Math.round((past / total) * 100) : 0,
      future: total > 0 ? Math.round((future / total) * 100) : 0,
      other: total > 0 ? Math.round(((nostalgia + likes + anticipation + regret + dislikes + worry) / total) * 100) : 0,
      total
    };
  };
  
  const pahmDistribution = calculatePAHMDistribution();
  
  return (
    <div className="pahm-practice-complete">
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
        
        {/* PAHM distribution is always shown for PAHM stages */}
        <div className="pahm-distribution">
          <h2>PAHM Position Distribution</h2>
          
          <div className="distribution-stats">
            <div className="distribution-stat">
              <div className="stat-label">Present</div>
              <div className="stat-value">{pahmDistribution.present}%</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill present-fill" 
                  style={{ width: `${pahmDistribution.present}%` }}
                ></div>
              </div>
            </div>
            
            <div className="distribution-stat">
              <div className="stat-label">Past</div>
              <div className="stat-value">{pahmDistribution.past}%</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill past-fill" 
                  style={{ width: `${pahmDistribution.past}%` }}
                ></div>
              </div>
            </div>
            
            <div className="distribution-stat">
              <div className="stat-label">Future</div>
              <div className="stat-value">{pahmDistribution.future}%</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill future-fill" 
                  style={{ width: `${pahmDistribution.future}%` }}
                ></div>
              </div>
            </div>
            
            <div className="distribution-stat">
              <div className="stat-label">Other</div>
              <div className="stat-value">{pahmDistribution.other}%</div>
              <div className="stat-bar">
                <div 
                  className="stat-bar-fill other-fill" 
                  style={{ width: `${pahmDistribution.other}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="total-positions">
            Total positions tracked: {pahmDistribution.total}
          </div>
        </div>
        
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

export default PAHMPracticeComplete;
