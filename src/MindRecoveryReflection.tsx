import React, { useState } from 'react';
import './MindRecoveryReflection.css';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';

interface MindRecoveryReflectionProps {
  practiceType: string;
  posture: string;
  pahmCounts: any; // Added pahmCounts prop
  onComplete: () => void;
  onBack: () => void;
}

const MindRecoveryReflection: React.FC<MindRecoveryReflectionProps> = ({
  practiceType,
  posture,
  pahmCounts, // Destructure pahmCounts
  onComplete,
  onBack
}) => {
  const [reflectionText, setReflectionText] = useState<string>('');
  const [mentalState, setMentalState] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const mentalStateOptions = [
    { value: 'much-better', label: 'Much Better', emoji: '😊' },
    { value: 'better', label: 'Better', emoji: '🙂' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'same', label: 'Same', emoji: '😕' },
    { value: 'worse', label: 'Worse', emoji: '😞' }
  ];

  const handleSubmit = async () => {
    if (!mentalState) {
      alert('Please select how you feel after the practice.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get existing Mind Recovery history
      const existingHistory = JSON.parse(localStorage.getItem('mindRecoveryHistory') || '[]');
      
      // Find the most recent session and add reflection data
      if (existingHistory.length > 0) {
        const lastSession = existingHistory[existingHistory.length - 1];
        lastSession.reflection = {
          text: reflectionText,
          mentalState,
          submittedAt: new Date().toISOString()
        };
        lastSession.pahmCounts = pahmCounts; // Save pahmCounts with the session
        
        // Save updated history
        localStorage.setItem('mindRecoveryHistory', JSON.stringify(existingHistory));
      }

      // Brief delay for user feedback
      setTimeout(() => {
        setIsSubmitting(false);
        onComplete();
      }, 1000);

    } catch (error) {
      console.error('Error saving reflection:', error);
      setIsSubmitting(false);
      alert('Error saving reflection. Please try again.');
    }
  };

  const getPracticeTitle = (): string => {
    switch (practiceType) {
      case 'morning-recharge':
        return 'Morning Recharge';
      case 'emotional-reset':
        return 'Emotional Reset';
      case 'work-home-transition':
        return 'Work-Home Transition';
      case 'evening-wind-down':
        return 'Evening Wind-Down';
      case 'mid-day-reset':
        return 'Mid-Day Reset';
      default:
        return 'Mind Recovery Practice';
    }
  };

  const getPostureDisplayName = (): string => {
    switch (posture) {
      case 'seated':
        return 'Seated';
      case 'standing':
        return 'Standing';
      case 'lying':
        return 'Lying Down';
      default:
        return posture;
    }
  };

  return (
    <div className="mind-recovery-reflection">
      <header className="reflection-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Practice Reflection</h1>
        <div className="practice-summary">
          <span>{getPracticeTitle()}</span> • <span>{getPostureDisplayName()}</span>
        </div>
      </header>

      <div className="reflection-content">
        <div className="mental-state-section">
          <h3>How do you feel after this practice?</h3>
          <div className="mental-state-options">
            {mentalStateOptions.map((option) => (
              <button
                key={option.value}
                className={`mental-state-option ${mentalState === option.value ? 'selected' : ''}`}
                onClick={() => setMentalState(option.value)}
              >
                <span className="emoji">{option.emoji}</span>
                <span className="label">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="reflection-text-section">
          <h3>Any thoughts or insights? (Optional)</h3>
          <textarea
            className="reflection-textarea"
            placeholder="Share any thoughts, insights, or observations from your practice..."
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            rows={4}
          />
        </div>

        <div className="reflection-actions">
          <button
            className="submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || !mentalState}
          >
            {isSubmitting ? 'Saving...' : 'Complete Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MindRecoveryReflection;


