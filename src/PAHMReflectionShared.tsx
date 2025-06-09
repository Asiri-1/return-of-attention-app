import React, { useState } from 'react';
import './Reflection.css';
import './PAHMReflection.css';

interface PAHMReflectionProps {
  stageLevel: string;
  stageName: string;
  duration: number;
  posture: string;
  pahmData?: {
    presentAttachment?: number;
    presentNeutral?: number;
    presentAversion?: number;
    pastAttachment?: number;
    pastNeutral?: number;
    pastAversion?: number;
    futureAttachment?: number;
    futureNeutral?: number;
    futureAversion?: number;
  };
  onComplete: () => void;
  onBack: () => void;
}

const PAHMReflectionShared: React.FC<PAHMReflectionProps> = ({
  stageLevel,
  stageName,
  duration,
  posture,
  pahmData = {},
  onComplete,
  onBack
}) => {
  // State for star rating
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // State for text feedback
  const [feedback, setFeedback] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  
  // State for challenges
  const [challenges, setChallenges] = useState<{[key: string]: boolean}>({
    discomfort: false,
    sleepiness: false,
    restlessness: false,
    distraction: false,
    boredom: false,
    anxiety: false,
    other: false
  });
  
  // Format posture name for display
  const formatPostureName = (postureId: string): string => {
    switch(postureId) {
      case 'chair': return 'Chair Sitting';
      case 'cushion': return 'Cushion Sitting';
      case 'seiza': return 'Seiza Position';
      case 'burmese': return 'Burmese Position';
      case 'lotus': return 'Half Lotus';
      case 'full-lotus': return 'Full Lotus';
      case 'lying': return 'Lying Down';
      case 'standing': return 'Standing';
      case 'other': return 'Other';
      default: return postureId;
    }
  };
  
  // Handle star rating
  const handleRatingClick = (value: number) => {
    setRating(value);
  };
  
  // Handle challenge checkbox change
  const handleChallengeChange = (challenge: string) => {
    setChallenges(prev => ({
      ...prev,
      [challenge]: !prev[challenge]
    }));
  };
  
  // Calculate PAHM totals
  const calculatePAHMTotals = () => {
    // Default empty values to 0
    const data = {
      presentAttachment: pahmData.presentAttachment || 0,
      presentNeutral: pahmData.presentNeutral || 0,
      presentAversion: pahmData.presentAversion || 0,
      pastAttachment: pahmData.pastAttachment || 0,
      pastNeutral: pahmData.pastNeutral || 0,
      pastAversion: pahmData.pastAversion || 0,
      futureAttachment: pahmData.futureAttachment || 0,
      futureNeutral: pahmData.futureNeutral || 0,
      futureAversion: pahmData.futureAversion || 0
    };
    
    // Calculate time dimension totals
    const presentTotal = data.presentAttachment + data.presentNeutral + data.presentAversion;
    const pastTotal = data.pastAttachment + data.pastNeutral + data.pastAversion;
    const futureTotal = data.futureAttachment + data.futureNeutral + data.futureAversion;
    
    // Calculate emotional tone totals
    const attachmentTotal = data.presentAttachment + data.pastAttachment + data.futureAttachment;
    const neutralTotal = data.presentNeutral + data.pastNeutral + data.futureNeutral;
    const aversionTotal = data.presentAversion + data.pastAversion + data.futureAversion;
    
    // Calculate grand total
    const grandTotal = presentTotal + pastTotal + futureTotal;
    
    return {
      presentTotal,
      pastTotal,
      futureTotal,
      attachmentTotal,
      neutralTotal,
      aversionTotal,
      grandTotal,
      data
    };
  };
  
  // Get PAHM totals
  const pahmTotals = calculatePAHMTotals();
  
  // Calculate percentage
  const getPercentage = (count: number) => {
    if (pahmTotals.grandTotal === 0) return 0;
    return Math.round((count / pahmTotals.grandTotal) * 100);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Save reflection data to localStorage or sessionStorage if needed
    const reflectionData = {
      stageLevel,
      stageName,
      duration,
      posture,
      rating,
      feedback,
      insights,
      challenges,
      pahmData,
      pahmTotals,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for history
    const previousReflections = JSON.parse(localStorage.getItem('reflectionHistory') || '[]');
    localStorage.setItem('reflectionHistory', JSON.stringify([...previousReflections, reflectionData]));
    
    // Complete the reflection
    onComplete();
  };

  return (
    <div className="reflection-screen">
      <div className="reflection-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{stageName} Practice Reflection</h1>
      </div>
      
      <div className="reflection-content">
        <div className="session-summary">
          <h2>Session Summary</h2>
          <div className="summary-item">
            <div className="summary-label">Practice Level:</div>
            <div className="summary-value">{stageLevel}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Duration:</div>
            <div className="summary-value">{duration} minutes</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">Posture:</div>
            <div className="summary-value">{formatPostureName(posture)}</div>
          </div>
        </div>
        
        <div className="pahm-tracking-results">
          <h2>PAHM Tracking Results</h2>
          <p className="tracking-explanation">
            Below are the total counts of where your attention went during practice.
          </p>
          
          <div className="pahm-matrix-results">
            <div className="pahm-results-grid">
              <div className="pahm-grid-header time-dimension">Time Dimension</div>
              <div className="pahm-grid-header emotional-tone">Emotional Tone</div>
              <div className="pahm-grid-header attachment">Attachment</div>
              <div className="pahm-grid-header neutral">Neutral</div>
              <div className="pahm-grid-header aversion">Aversion</div>
              <div className="pahm-grid-header row-total">Total</div>
              
              <div className="pahm-grid-label present">Present</div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.presentAttachment}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.presentAttachment)}%</div>
              </div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.presentNeutral}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.presentNeutral)}%</div>
              </div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.presentAversion}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.presentAversion)}%</div>
              </div>
              <div className="pahm-grid-cell total-cell">
                <div className="count">{pahmTotals.presentTotal}</div>
                <div className="percentage">{getPercentage(pahmTotals.presentTotal)}%</div>
              </div>
              
              <div className="pahm-grid-label past">Past</div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.pastAttachment}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.pastAttachment)}%</div>
              </div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.pastNeutral}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.pastNeutral)}%</div>
              </div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.pastAversion}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.pastAversion)}%</div>
              </div>
              <div className="pahm-grid-cell total-cell">
                <div className="count">{pahmTotals.pastTotal}</div>
                <div className="percentage">{getPercentage(pahmTotals.pastTotal)}%</div>
              </div>
              
              <div className="pahm-grid-label future">Future</div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.futureAttachment}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.futureAttachment)}%</div>
              </div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.futureNeutral}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.futureNeutral)}%</div>
              </div>
              <div className="pahm-grid-cell">
                <div className="count">{pahmTotals.data.futureAversion}</div>
                <div className="percentage">{getPercentage(pahmTotals.data.futureAversion)}%</div>
              </div>
              <div className="pahm-grid-cell total-cell">
                <div className="count">{pahmTotals.futureTotal}</div>
                <div className="percentage">{getPercentage(pahmTotals.futureTotal)}%</div>
              </div>
              
              <div className="pahm-grid-label column-total">Total</div>
              <div className="pahm-grid-cell total-cell">
                <div className="count">{pahmTotals.attachmentTotal}</div>
                <div className="percentage">{getPercentage(pahmTotals.attachmentTotal)}%</div>
              </div>
              <div className="pahm-grid-cell total-cell">
                <div className="count">{pahmTotals.neutralTotal}</div>
                <div className="percentage">{getPercentage(pahmTotals.neutralTotal)}%</div>
              </div>
              <div className="pahm-grid-cell total-cell">
                <div className="count">{pahmTotals.aversionTotal}</div>
                <div className="percentage">{getPercentage(pahmTotals.aversionTotal)}%</div>
              </div>
              <div className="pahm-grid-cell grand-total-cell">
                <div className="count">{pahmTotals.grandTotal}</div>
                <div className="percentage">100%</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="challenges-section">
          <h2>Challenges Encountered</h2>
          <p>Select any challenges you experienced during this practice:</p>
          <div className="challenge-checkboxes">
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.discomfort}
                onChange={() => handleChallengeChange('discomfort')}
              />
              Physical Discomfort
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.sleepiness}
                onChange={() => handleChallengeChange('sleepiness')}
              />
              Sleepiness
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.restlessness}
                onChange={() => handleChallengeChange('restlessness')}
              />
              Restlessness
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.distraction}
                onChange={() => handleChallengeChange('distraction')}
              />
              Distraction
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.boredom}
                onChange={() => handleChallengeChange('boredom')}
              />
              Boredom
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.anxiety}
                onChange={() => handleChallengeChange('anxiety')}
              />
              Anxiety
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.other}
                onChange={() => handleChallengeChange('other')}
              />
              Other
            </label>
          </div>
        </div>
        
        <div className="feedback-section">
          <h2>Your Feedback</h2>
          <div className="feedback-field">
            <label htmlFor="practice-feedback">What did you notice during your practice?</label>
            <textarea
              id="practice-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe your experience..."
              rows={4}
            />
          </div>
          
          <div className="feedback-field">
            <label htmlFor="practice-insights">Any insights or learnings from this session?</label>
            <textarea
              id="practice-insights"
              value={insights}
              onChange={(e) => setInsights(e.target.value)}
              placeholder="Share your insights..."
              rows={4}
            />
          </div>
        </div>
        
        <div className="rating-section">
          <h2>Rate Your Practice</h2>
          <p>How would you rate your overall practice experience?</p>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          <div className="rating-label">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </div>
        </div>
        
        <div className="next-steps">
          <h2>Next Steps</h2>
          <p>
            Regular practice helps build the foundation for deeper awareness.
            Consider practicing at this level again, or move to the next level when you feel ready.
          </p>
          
          <button className="complete-button" onClick={handleSubmit}>
            Complete Reflection
          </button>
        </div>
      </div>
    </div>
  );
};

export default PAHMReflectionShared;
