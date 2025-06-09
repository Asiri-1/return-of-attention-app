import React, { useState } from 'react';
import './PostureSelection.css';

interface PostureSelectionProps {
  onBack: () => void;
  onStartPractice: (selectedPosture: string) => void;
  stageNumber: number;
}

const PostureSelection: React.FC<PostureSelectionProps> = ({
  onBack,
  onStartPractice,
  stageNumber
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
  
  const getStageName = () => {
    switch (stageNumber) {
      case 1: return "Seeker";
      case 2: return "PAHM Trainer";
      case 3: return "PAHM Beginner";
      case 4: return "PAHM Practitioner";
      case 5: return "PAHM Master";
      case 6: return "PAHM Illuminator";
      default: return "Practice";
    }
  };
  
  return (
    <div className="posture-selection">
      <div className="posture-selection-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{getStageName()} Practice Setup</h1>
      </div>
      
      <div className="posture-selection-content">
        <h2>Select Your Posture</h2>
        <p className="instruction-text">
          Choose the posture you'll be using for this practice session.
          Tracking your posture helps identify which positions work best for your practice.
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

export default PostureSelection;
