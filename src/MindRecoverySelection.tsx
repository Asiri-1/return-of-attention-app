import React from 'react';
import './MindRecoverySelection.css';
import { useNavigate } from 'react-router-dom';

interface MindRecoverySelectionProps {
  onBack: () => void;
}

const MindRecoverySelection: React.FC<MindRecoverySelectionProps> = ({ onBack }) => {
  const navigate = useNavigate();

  // ✅ FIXED: Updated practice IDs to match MindRecoveryHub exactly
  const practices = [
    {
      id: 'morning-recharge',
      title: 'Morning Recharge',
      description: 'Start your day with clarity and focus',
      duration: 5,
      icon: '🌅'
    },
    {
      id: 'mid-day-reset',
      title: 'Mid-Day Reset',
      description: 'Quick refresh to maintain focus',
      duration: 3,
      icon: '☀️'
    },
    {
      id: 'emotional-reset',
      title: 'Emotional Reset',
      description: 'Settle your emotions and find balance',
      duration: 5,
      icon: '🧘‍♀️'
    },
    {
      id: 'work-home-transition',
      title: 'Work-Home Transition',
      description: 'Shift from work mode to personal time',
      duration: 5,
      icon: '🏠'
    },
    {
      id: 'bedtime-winddown', // ✅ FIXED: Changed from 'evening-wind-down' to 'bedtime-winddown'
      title: 'Bedtime Wind Down', // ✅ FIXED: Updated title to match
      description: 'Gentle preparation for restful sleep', // ✅ FIXED: Updated description
      duration: 8, // ✅ FIXED: Updated duration to match MindRecoveryHub
      icon: '🌙'
    }
  ];

  const handlePracticeSelect = (practiceId: string) => {
    console.log(`✅ MindRecoverySelection: Navigating to /mind-recovery/${practiceId}`);
    
    // ✅ VALIDATION: Ensure practiceId is valid
    const validIds = practices.map(p => p.id);
    if (!validIds.includes(practiceId)) {
      console.error('❌ Invalid practice ID:', practiceId);
      console.log('✅ Valid IDs:', validIds);
      return;
    }
    
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
          Choose a PAHM practice to reset and recover your mind
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
          Mind Recovery practices are independent PAHM sessions designed to help you 
          reset and recover throughout your day. Each practice includes posture selection, 
          guided PAHM awareness, and optional reflection.
        </p>
      </div>
    </div>
  );
};

export default MindRecoverySelection;