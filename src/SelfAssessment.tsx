import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './SelfAssessment.css';

interface SelfAssessmentProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'list'; // 'text' for single answer, 'list' for multiple entries
  instruction?: string; // Optional instruction specific to the question
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onComplete, onBack }) => {
  const { currentUser, updateUserProfileInContext } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({}); // Store responses
  const [currentEntry, setCurrentEntry] = useState(''); // For list type questions

  const questions: Question[] = [
    {
      id: 'food-preferences',
      text: 'Food Preferences: What are your favorite foods, flavors, or dishes? What tastes do you crave most often?',
      type: 'list',
      instruction: 'Add 5-10 items that you feel strongly like or that bring you pleasure.',
    },
    {
      id: 'pleasing-scents',
      text: 'Pleasing Scents: What scents or aromas do you find most pleasing or evocative? What smells trigger strong positive emotions?',
      type: 'list',
      instruction: 'Add 5-10 items that you feel strongly like or that bring you pleasure.',
    },
    {
      id: 'audio-enjoyment',
      text: 'Audio Enjoyment: What music, songs, or sounds do you most enjoy hearing? What audio experiences do you seek out?',
      type: 'list',
      instruction: 'Add 5-10 items that you feel strongly like or that bring you pleasure.',
    },
    {
      id: 'visual-pleasure',
      text: 'Visual Pleasure: What visual experiences do you find most beautiful or compelling? What do you most enjoy looking at?',
      type: 'list',
      instruction: 'Add 5-10 items that you feel strongly like or that bring you pleasure.',
    },
    {
      id: 'physical-sensations',
      text: 'Physical Sensations: What physical sensations do you find most pleasurable? What textures, temperatures, or physical experiences do you seek?',
      type: 'list',
      instruction: 'Add 5-10 items that you feel strongly like or that bring you pleasure.',
    },
    {
      id: 'mental-imagery',
      text: 'Mental Imagery: What do you most enjoy imagining, fantasizing about, or dreaming of? What mental scenarios bring you pleasure?',
      type: 'list',
      instruction: 'Add 5-10 items that you feel strongly like or that bring you pleasure.',
    },
    {
      id: 'goals',
      text: 'List 3-5 goals or objectives you\'re currently pursuing or planning to pursue.',
      type: 'list',
    },
    {
      id: 'worries',
      text: 'List 3-5 things you find yourself worrying about.',
      type: 'list',
    },
    {
      id: 'alive-present',
      text: 'List 3-5 activities or experiences that make you feel most alive or present.',
      type: 'list',
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentEntry(''); // Clear input for next question
    } else {
      processAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleAddEntry = () => {
    if (currentEntry.trim() !== '') {
      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: [...(prev[currentQuestion.id] || []), currentEntry.trim()]
      }));
      setCurrentEntry('');
    }
  };

  const handleRemoveEntry = (entryToRemove: string) => {
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: prev[currentQuestion.id].filter((entry: string) => entry !== entryToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddEntry();
    }
  };

  const processAssessment = () => {
    console.log('Self-Assessment Completed:', responses);

    if (currentUser && updateUserProfileInContext) {
      const experienceLevel = 'beginner'; // This might be determined by assessment responses later
      
      updateUserProfileInContext({
        experienceLevel,
        assessmentCompleted: true,
        currentStage: 'Seeker'
      });
    }

    onComplete();
  };

  return (
    <div className="self-assessment-container">
      <div className="assessment-header">
        {currentQuestionIndex > 0 && (
          <button className="back-button" onClick={handlePrevious}>Back</button>
        )}
        <div className="progress-indicator">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>

      <div className="assessment-content">
        <div className="category-container">
          <h2>{currentQuestion.text}</h2>
          {currentQuestion.instruction && (
            <p className="instruction">{currentQuestion.instruction}</p>
          )}
        </div>

        {currentQuestion.type === 'list' && (
          <div className="entry-input-container">
            <input
              type="text"
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add an entry..."
              className="entry-input"
            />
            <button onClick={handleAddEntry} className="add-entry-button">Add</button>
          </div>
        )}

        {currentQuestion.type === 'list' && responses[currentQuestion.id] && responses[currentQuestion.id].length > 0 && (
          <ul className="entries-list">
            {responses[currentQuestion.id].map((entry: string, index: number) => (
              <li key={index} className="entry-item">
                {entry}
                <button onClick={() => handleRemoveEntry(entry)}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        <div className="navigation-buttons">
          {currentQuestionIndex < questions.length - 1 ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={processAssessment}>Complete Assessment</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfAssessment;