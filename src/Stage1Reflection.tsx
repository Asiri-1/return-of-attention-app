import React, { useState } from 'react';
import './Reflection.css';

interface Stage1ReflectionProps {
  duration: number;
  stageLevel: string;
  posture: string;
  onComplete: () => void;
  onBack: () => void;
}

const Stage1Reflection: React.FC<Stage1ReflectionProps> = ({
  duration,
  stageLevel,
  posture,
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
  
  // Handle form submission
  const handleSubmit = () => {
    // Save reflection data to localStorage or sessionStorage if needed
    const reflectionData = {
      duration,
      stageLevel,
      posture,
      rating,
      feedback,
      insights,
      challenges,
      timestamp: new Date().toISOString()
    };
    
    // Store in localStorage for history
    const previousReflections = JSON.parse(localStorage.getItem('reflectionHistory') || '[]');
    localStorage.setItem('reflectionHistory', JSON.stringify([...previousReflections, reflectionData]));
    
    // Check if this is a T5 completion and set the flag
    if (stageLevel.startsWith('T5:')) {
      console.log('T5 completed, setting completion flag');
      sessionStorage.setItem('t5Completed', 'true');
      localStorage.setItem('t5Completed', 'true');
      
      // Set stage progress to allow Stage 2 access
      sessionStorage.setItem('stageProgress', '2');
      localStorage.setItem('devCurrentStage', '2');
      
      // Force current T level to be beyond T5 to ensure unlock
      sessionStorage.setItem('currentTLevel', 't6');
    }
    
    // Complete the reflection
    onComplete();
  };

  return (
    <div className="reflection-screen">
      <div className="reflection-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Practice Reflection</h1>
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

export default Stage1Reflection;
