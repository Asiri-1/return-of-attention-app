import React, { useState } from 'react';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ Firebase-only practice context
import { useUser } from './contexts/user/UserContext'; // ✅ Firebase-only user context
import './Reflection.css';

interface Stage1ReflectionProps {
  duration: number;
  stageLevel: string;
  posture: string;
  tLevel?: string; // Added for T5 completion detection
  onComplete: () => void;
  onBack: () => void;
}

const Stage1Reflection: React.FC<Stage1ReflectionProps> = ({
  duration,
  stageLevel,
  posture,
  tLevel,
  onComplete,
  onBack
}) => {
  // ✅ FIREBASE-ONLY: Use contexts for data management
  const { addPracticeSession } = usePractice();
  const { userProfile, updateProfile } = useUser();
  
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
  
  // State for submission
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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
  
  // ✅ FIREBASE-ONLY: Handle form submission
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('💾 Saving reflection to Firebase...');
      
      // ✅ FIREBASE-ONLY: Save reflection as practice session
      if (addPracticeSession) {
        const tStageLevel = tLevel ? parseInt(tLevel[1]) : 1;
        
        await addPracticeSession({
          stageLevel: tStageLevel,
          sessionType: 'meditation' as const,
          duration: duration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: posture,
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: rating,
          notes: `${stageLevel} - Feedback: ${feedback}${insights ? ` | Insights: ${insights}` : ''}`,
          // Store challenges in metadata
          metadata: {
            challenges: challenges,
            feedback: feedback,
            insights: insights,
            reflectionType: 'stage1'
          }
        });
      }
      
      // ✅ FIREFOX-ONLY: Check for T5 completion and update Firebase
      const isT5Completion = tLevel === 'T5' || stageLevel.includes('T5');
      if (isT5Completion) {
        console.log('🎉 T5 completed, updating Firebase profile...');
        
        // Use safe property access and updating
        const currentCompletedStages = (userProfile && 'completedStages' in userProfile && 
          Array.isArray(userProfile.completedStages)) ? userProfile.completedStages : [];
        
        // Only add if not already completed
        if (!currentCompletedStages.includes(5)) {
          await updateProfile({
            completedStages: [...currentCompletedStages, 5],
            currentStage: 2, // Unlock Stage 2
            lastCompletedStage: 1,
            t5CompletedAt: new Date().toISOString(),
            totalSessions: (userProfile?.totalSessions || 0) + 1
          } as any);
          
          console.log('✅ Stage 1 completed in Firebase, Stage 2 unlocked!');
        }
      } else {
        // Update session count for non-T5 completions
        await updateProfile({
          totalSessions: (userProfile?.totalSessions || 0) + 1,
          lastSessionDate: new Date().toISOString()
        } as any);
      }
      
      console.log('✅ Reflection saved to Firebase successfully!');
      
      // Complete the reflection
      onComplete();
      
    } catch (error) {
      console.error('❌ Error saving reflection to Firebase:', error);
      
      // Still complete the reflection even if save fails
      alert('Reflection saved locally. Please check your internet connection.');
      onComplete();
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reflection-screen">
      <div className="reflection-header">
        <button className="back-button" onClick={onBack} disabled={isSubmitting}>
          Back
        </button>
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
                disabled={isSubmitting}
              />
              Physical Discomfort
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.sleepiness}
                onChange={() => handleChallengeChange('sleepiness')}
                disabled={isSubmitting}
              />
              Sleepiness
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.restlessness}
                onChange={() => handleChallengeChange('restlessness')}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              Boredom
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.anxiety}
                onChange={() => handleChallengeChange('anxiety')}
                disabled={isSubmitting}
              />
              Anxiety
            </label>
            <label className="challenge-item">
              <input
                type="checkbox"
                checked={challenges.other}
                onChange={() => handleChallengeChange('other')}
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''} ${isSubmitting ? 'disabled' : ''}`}
                onClick={() => !isSubmitting && handleRatingClick(star)}
                onMouseEnter={() => !isSubmitting && setHoverRating(star)}
                onMouseLeave={() => !isSubmitting && setHoverRating(0)}
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
          
          <button 
            className={`complete-button ${isSubmitting ? 'submitting' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving to Firebase...' : 'Complete Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage1Reflection;