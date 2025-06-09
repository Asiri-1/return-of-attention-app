import React, { useState } from 'react';
import './PostureSelection.css';

interface Stage6PostureSelectionProps {
  onBack: () => void;
  onStartPractice: (selectedPosture: string) => void;
}

const Stage6PostureSelection: React.FC<Stage6PostureSelectionProps> = ({
  onBack,
  onStartPractice
}) => {
  const [selectedPosture, setSelectedPosture] = useState<string>('');
  
  const postures = [
    { id: 'chair', name: 'Chair Sitting', description: 'Sitting upright on a chair with feet flat on the floor' },
    { id: 'cushion', name: 'Cushion Sitting', description: 'Sitting cross-legged on a meditation cushion' },
    { id: 'seiza', name: 'Seiza Position', description: 'Kneeling with weight resting on cushion or bench' },
    { id: 'burmese', name: 'Burmese Position', description: 'Sitting with both legs bent and resting on the floor' },
    { id: 'lotus', name: 'Half Lotus', description: 'One foot resting on the opposite thigh' },
    { id: 'full-lotus', name: 'Full Lotus', description: 'Both feet resting on opposite thighs' },
    { id: 'lying', name: 'Lying Down', description: 'Lying flat on back with arms at sides' },
    { id: 'standing', name: 'Standing', description: 'Standing with feet shoulder-width apart' },
    { id: 'other', name: 'Other', description: 'Another posture not listed here' }
  ];
  
  const handlePostureSelect = (postureId: string) => {
    setSelectedPosture(postureId);
  };
  
  const handleStartPractice = () => {
    if (selectedPosture) {
      onStartPractice(selectedPosture);
    }
  };
  
  return (
    <div className="posture-selection">
      <div className="posture-selection-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>PAHM Illuminator Practice Setup</h1>
      </div>
      
      <div className="posture-selection-content">
        <h2>Select Your Posture</h2>
        <p className="instruction-text">
          Choose the posture you'll be using for this PAHM Illuminator practice session.
          A comfortable, stable posture will help you maintain awareness of thought patterns.
        </p>
        
        <div className="posture-grid">
          {postures.map((posture) => (
            <div 
              key={posture.id}
              className={`posture-card ${selectedPosture === posture.id ? 'selected' : ''}`}
              onClick={() => handlePostureSelect(posture.id)}
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
          disabled={!selectedPosture}
          onClick={handleStartPractice}
        >
          Start Practice
        </button>
      </div>
    </div>
  );
};

export default Stage6PostureSelection;
