import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface SelfAssessmentProps {
  onComplete: () => void;
  onBack: () => void;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onComplete, onBack }) => {
  const navigate = useNavigate();
  const { currentUser, updateUserProfileInContext } = useAuth(); // Corrected: updateUser to updateUserProfileInContext
  const [currentCategory, setCurrentCategory] = useState(0);
  const [entries, setEntries] = useState<Record<string, string[]>>({});
  const [currentEntry, setCurrentEntry] = useState('');

  const categories = [
    'Physical Sensations',
    'Emotional States',
    'Mental Clarity',
    'Energy Levels',
    'Social Connection',
    'Purpose and Meaning',
    'Overall Well-being',
  ];

  const handleNextCategory = () => {
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(prev => prev + 1);
      setCurrentEntry(''); // Clear input for next category
    } else {
      // All categories completed, process assessment
      processAssessment();
    }
  };

  const handlePreviousCategory = () => {
    if (currentCategory > 0) {
      setCurrentCategory(prev => prev - 1);
    }
  };

  const handleAddEntry = () => {
    if (currentEntry.trim() !== '') {
      setEntries(prev => ({
        ...prev,
        [categories[currentCategory]]: [...(prev[categories[currentCategory]] || []), currentEntry.trim()]
      }));
      setCurrentEntry('');
    }
  };

  const handleRemoveEntry = (entryToRemove: string) => {
    setEntries(prev => ({
      ...prev,
      [categories[currentCategory]]: prev[categories[currentCategory]].filter(entry => entry !== entryToRemove)
    }));
  };

  const processAssessment = () => {
    // Here you would typically send the entries to your backend
    console.log('Self-Assessment Completed:', entries);

    // Update user profile with assessment completion status
    if (currentUser && updateUserProfileInContext) { // Corrected: updateUser to updateUserProfileInContext
      // Determine experience level based on completion
      // Default to beginner for this reflective assessment
      const experienceLevel = 'beginner';
      
      // Only update properties that exist in the AppUser interface
      updateUserProfileInContext({ // Corrected: updateUser to updateUserProfileInContext
        experienceLevel,
        assessmentCompleted: true,
        currentStage: 'Seeker' // Assuming 'Seeker' is the initial stage after assessment
      });
    }

    onComplete(); // Navigate to completion page
  };

  return (
    <div className="self-assessment-container">
      <h2>Self-Assessment: {categories[currentCategory]}</h2>
      <div className="entry-input">
        <input
          type="text"
          value={currentEntry}
          onChange={(e) => setCurrentEntry(e.target.value)}
          placeholder="Add an entry..."
        />
        <button onClick={handleAddEntry}>Add</button>
      </div>
      <ul className="entry-list">
        {entries[categories[currentCategory]]?.map((entry, index) => (
          <li key={index}>
            {entry}
            <button onClick={() => handleRemoveEntry(entry)}>Remove</button>
          </li>
        ))}
      </ul>
      <div className="navigation-buttons">
        {currentCategory > 0 && (
          <button onClick={handlePreviousCategory}>Previous</button>
        )}
        {currentCategory < categories.length - 1 ? (
          <button onClick={handleNextCategory}>Next</button>
        ) : (
          <button onClick={processAssessment}>Complete Assessment</button>
        )}
      </div>
      <button onClick={onBack}>Back</button>
    </div>
  );
};

export default SelfAssessment;
