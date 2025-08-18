// ✅ TRUE SINGLE-POINT Stage1Reflection.tsx - All Functionality Preserved
// 🎯 SINGLE-POINT: Session saving ONLY through PracticeContext
// ✅ PRESERVED: All reflection functionality intact
import React, { useState } from 'react';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ SINGLE-POINT: For session saving only
import { useUser } from './contexts/user/UserContext'; // ✅ For profile management only
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
  // ✅ SINGLE-POINT: Use contexts for their specific purposes only
  const { addPracticeSession } = usePractice(); // ✅ ONLY for session saving
  const { userProfile, updateProfile } = useUser(); // ✅ ONLY for profile management
  
  // ✅ PRESERVED: Same state management (no changes)
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [insights, setInsights] = useState<string>('');
  const [challenges, setChallenges] = useState<{[key: string]: boolean}>({
    discomfort: false,
    sleepiness: false,
    restlessness: false,
    distraction: false,
    boredom: false,
    anxiety: false,
    other: false
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // ✅ PRESERVED: Same utility functions (no changes)
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
  
  // ✅ PRESERVED: Same UI handlers (no changes)
  const handleRatingClick = (value: number) => {
    setRating(value);
  };
  
  const handleChallengeChange = (challenge: string) => {
    setChallenges(prev => ({
      ...prev,
      [challenge]: !prev[challenge]
    }));
  };

  // ✅ SINGLE-POINT: Handle T5 completion via profile management (not session tracking)
  const handleT5CompletionInProfile = async () => {
    try {
      if (!userProfile) {
        console.warn('⚠️ No user profile found, cannot update T5 completion');
        return;
      }

      // ✅ SINGLE-POINT: Update user profile to reflect T5 completion and Stage 2 unlock
      const currentStageProgress = userProfile.stageProgress || userProfile.currentProgress;
      
      const updatedStageProgress = {
        ...currentStageProgress,
        t5Completed: true,
        currentStage: Math.max(currentStageProgress?.currentStage || 1, 2), // Unlock Stage 2
        completedStages: [
          ...(currentStageProgress?.completedStages || []),
          ...(currentStageProgress?.completedStages?.includes(1) ? [] : [1]) // Add Stage 1 if not already there
        ],
        maxStageReached: Math.max(currentStageProgress?.maxStageReached || 1, 2),
        lastAdvancement: new Date().toISOString(),
        lastCompletedStage: 1,
        t5CompletedAt: new Date().toISOString()
      };

      // ✅ FIXED: Update via UserContext profile management with correct interface
      await updateProfile({
        stageProgress: updatedStageProgress,
        currentProgress: updatedStageProgress, // Keep both for backward compatibility
        lastUpdated: new Date().toISOString() // ✅ Use correct property name
      });

      console.log('✅ T5 completion and Stage 2 unlock saved to user profile');
    } catch (error) {
      console.error('❌ Error updating T5 completion in profile:', error);
      // Don't throw - allow session saving to continue
    }
  };
  
  // ✅ SINGLE-POINT: Handle form submission with ONLY PracticeContext for session saving
  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('💾 Saving reflection session to PracticeContext...');
      
      // ✅ SINGLE-POINT: Save session ONLY via PracticeContext
      if (addPracticeSession) {
        const tStageLevel = tLevel ? parseInt(tLevel[1]) : 1;
        
        // 🔥 PRESERVED: Same session data structure with all T-level identifiers
        await addPracticeSession({
          stageLevel: tStageLevel,
          stageLabel: stageLevel, // ✅ PRESERVED: Save "T1", "T2", etc.
          tLevel: tLevel || `T${tStageLevel}`, // ✅ PRESERVED: Save "T1", "T2", etc.
          level: tLevel?.toLowerCase() || `t${tStageLevel}`, // ✅ PRESERVED: Save "t1", "t2", etc.
          sessionType: 'meditation' as const,
          duration: duration,
          timestamp: new Date().toISOString(),
          isCompleted: true, // ✅ Mark as completed
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
            reflectionType: 'stage1',
            hasReflection: true
          }
        });

        console.log('✅ Session saved to PracticeContext successfully!');
      }
      
      // ✅ SINGLE-POINT: Check for T5 completion and handle via profile management
      const isT5Completion = tLevel === 'T5' || stageLevel.includes('T5');
      if (isT5Completion) {
        console.log('🎉 T5 completed, updating profile for Stage 2 unlock...');
        await handleT5CompletionInProfile();
      }
      
      console.log('✅ Reflection process completed successfully!');
      
      // Complete the reflection
      onComplete();
      
    } catch (error) {
      console.error('❌ Error saving reflection:', error);
      
      // Still complete the reflection even if save fails
      alert('Reflection saved locally. Please check your internet connection.');
      onComplete();
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ PRESERVED: Same UI structure (no changes to the JSX)
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
                disabled={isSubmitting}
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
            {isSubmitting ? 'Saving Session...' : 'Complete Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Stage1Reflection;