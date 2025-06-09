import React, { useState } from 'react';
import './PostureSelection.css';

interface Stage1PostureSelectionProps {
  onBack: () => void;
  onStartPractice: (selectedPosture: string) => void;
  currentTLevel?: string;
}

const Stage1PostureSelection: React.FC<Stage1PostureSelectionProps> = ({
  onBack,
  onStartPractice,
  currentTLevel = 'T1'
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
        <h1>Seeker Practice Setup - {currentTLevel}</h1>
      </div>
      
      <div className="posture-selection-content">
        <div className="level-info">
          <h2>{currentTLevel} Practice</h2>
          <p className="level-duration">
            {currentTLevel === 'T1' ? '10 minutes' : 
             currentTLevel === 'T2' ? '15 minutes' : 
             currentTLevel === 'T3' ? '20 minutes' : 
             currentTLevel === 'T4' ? '25 minutes' : 
             '30 minutes'} of Physical Stillness
          </p>
        </div>
        <h2>Select Your Posture</h2>
        <p className="instruction-text">
          Choose the posture you'll be using for this practice session.
          Tracking your posture helps identify which positions work best for your physical stillness practice.
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

export default Stage1PostureSelection;
