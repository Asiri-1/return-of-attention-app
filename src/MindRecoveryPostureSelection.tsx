import React, { useState } from 'react';
import './MindRecoveryPostureSelection.css';

interface MindRecoveryPostureSelectionProps {
  onSelectPosture: (posture: string) => void;
  onBack: () => void;
}

const MindRecoveryPostureSelection: React.FC<MindRecoveryPostureSelectionProps> = ({
  onSelectPosture,
  onBack
}) => {
  const [selectedPosture, setSelectedPosture] = useState<string | null>(null);

  const postures = [
    { id: 'seated', name: 'Seated', description: 'Sitting upright with a straight spine.' },
    { id: 'standing', name: 'Standing', description: 'Standing tall with feet hip-width apart.' },
    { id: 'lying', name: 'Lying Down', description: 'Lying on your back, relaxed.' },
  ];

  const handleSelect = (postureId: string) => {
    setSelectedPosture(postureId);
  };

  const handleConfirm = () => {
    if (selectedPosture) {
      onSelectPosture(selectedPosture);
    }
  };

  return (
    <div className="posture-selection">
      <header className="posture-selection-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Select Your Posture</h1>
      </header>
      <div className="posture-selection-content">
        <p className="instruction-text">
          Choose the posture you will maintain during your practice.
        </p>
        <div className="posture-grid">
          {postures.map((posture) => (
            <div
              key={posture.id}
              className={`posture-card ${selectedPosture === posture.id ? 'selected' : ''}`}
              onClick={() => handleSelect(posture.id)}
            >
              <div className="posture-card-content">
                <div className="posture-name">{posture.name}</div>
                <div className="posture-description">{posture.description}</div>
              </div>
              {selectedPosture === posture.id && (
                <div className="posture-selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>
        <button 
          className="start-practice-button"
          onClick={handleConfirm}
          disabled={!selectedPosture}
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default MindRecoveryPostureSelection;


