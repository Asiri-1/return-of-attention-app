import React from 'react';
import './MindRecoverySelection.css';
import { useNavigate } from 'react-router-dom';

interface MindRecoverySelectionProps {
  onBack: () => void;
}

const MindRecoverySelection: React.FC<MindRecoverySelectionProps> = ({ onBack }) => {
  const navigate = useNavigate();

  const practices = [
    {
      id: 'morning-recharge',
      title: 'Morning Recharge',
      description: 'Start your day with clarity and focus',
      duration: 5,
      icon: '🌅'
    },
    {
      id: 'emotional-reset',
      title: 'Emotional Reset',
      description: 'Settle your emotions and find balance',
      duration: 5,
      icon: '🧘‍♀️'
    },
    {
      id: 'mid-day-reset',
      title: 'Mid-Day Reset',
      description: 'Quick refresh to maintain focus',
      duration: 3,
      icon: '☀️'
    },
    {
      id: 'work-home-transition',
      title: 'Work-Home Transition',
      description: 'Shift from work mode to personal time',
      duration: 5,
      icon: '🏠'
    },
    {
      id: 'evening-wind-down',
      title: 'Evening Wind-Down',
      description: 'Prepare your mind for restful sleep',
      duration: 5,
      icon: '🌙'
    }
  ];

  const handlePracticeSelect = (practiceId: string) => {
    console.log(`MindRecoverySelection: Attempting to navigate to /mind-recovery/${practiceId}`);
    navigate(`/mind-recovery/${practiceId}`);
  };

  return (
    <div className="mind-recovery-selection">
      <header className="selection-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Mind Recovery</h1>
        <p className="selection-description">
          Choose a 5-minute PAHM practice to reset and recover your mind
        </p>
      </header>

      <div className="practice-options-grid">
        {practices.map((practice) => (
          <div
            key={practice.id}
            className="practice-option-card"
            onClick={() => handlePracticeSelect(practice.id)}
          >
            <div className="practice-icon">{practice.icon}</div>
            <h3>{practice.title}</h3>
            <p>{practice.description}</p>
            <div className="practice-duration">{practice.duration} minutes</div>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h3>About Mind Recovery</h3>
        <p>
          Mind Recovery practices are independent 5-minute PAHM sessions designed to help you 
          reset and recover throughout your day. Each practice includes posture selection, 
          guided PAHM phases, and reflection.
        </p>
      </div>
    </div>
  );
};

export default MindRecoverySelection;


