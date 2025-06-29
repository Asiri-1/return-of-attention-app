import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './SelfAssessment.css';

interface SelfAssessmentProps {
  onComplete: (data: any) => void; // 🔧 FIXED: Now expects to pass data
  onBack: () => void;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'list';
  instruction?: string;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onComplete, onBack }) => {
  const { currentUser, updateUserProfileInContext } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [currentEntry, setCurrentEntry] = useState('');

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

  // 🔧 VALIDATION: Check if current question has at least 1 entry
  const hasMinimumEntries = () => {
    const currentResponses = responses[currentQuestion.id] || [];
    return currentResponses.length > 0;
  };

  const handleNext = () => {
    // 🔧 VALIDATION: Require at least 1 entry before proceeding
    if (!hasMinimumEntries()) {
      alert('Please add at least one entry before continuing.');
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentEntry('');
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

  // 🔧 FIXED: Create proper assessment data and pass it to parent
  const processAssessment = () => {
    console.log('✅ Self-Assessment Completed:', responses);

    // 🔧 VALIDATION: Check all questions have at least 1 entry
    const incompleteQuestions = questions.filter(q => {
      const questionResponses = responses[q.id] || [];
      return questionResponses.length === 0;
    });

    if (incompleteQuestions.length > 0) {
      alert(`Please complete all questions. Missing: ${incompleteQuestions.map(q => q.text.split(':')[0]).join(', ')}`);
      return;
    }

    // Create comprehensive assessment data
    const assessmentData = {
      responses,
      completedAt: new Date().toISOString(),
      experienceLevel: 'beginner', // This might be determined by responses later
      totalQuestions: questions.length,
      totalResponses: Object.values(responses).flat().length,
      
      // Create summary for easier access
      summary: {
        foodPreferences: responses['food-preferences'] || [],
        pleasingScents: responses['pleasing-scents'] || [],
        audioEnjoyment: responses['audio-enjoyment'] || [],
        visualPleasure: responses['visual-pleasure'] || [],
        physicalSensations: responses['physical-sensations'] || [],
        mentalImagery: responses['mental-imagery'] || [],
        goals: responses['goals'] || [],
        worries: responses['worries'] || [],
        alivePresent: responses['alive-present'] || []
      }
    };

    // 🔧 FIXED: Pass data to parent instead of updating context here
    onComplete(assessmentData);
  };

  // Get current question responses for display
  const currentResponses = responses[currentQuestion.id] || [];

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

          {/* 🔧 REQUIREMENT NOTICE */}
          <div className="requirement-notice">
            <strong>Required:</strong> Add at least 1 entry to continue
            {currentResponses.length > 0 && (
              <span className="entries-count"> ({currentResponses.length} added)</span>
            )}
          </div>
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
            <button 
              onClick={handleAddEntry} 
              className="add-entry-button"
              disabled={!currentEntry.trim()}
            >
              Add
            </button>
          </div>
        )}

        {currentQuestion.type === 'list' && currentResponses.length > 0 && (
          <ul className="entries-list">
            {currentResponses.map((entry: string, index: number) => (
              <li key={index} className="entry-item">
                {entry}
                <button onClick={() => handleRemoveEntry(entry)}>Remove</button>
              </li>
            ))}
          </ul>
        )}

        <div className="navigation-buttons">
          {currentQuestionIndex < questions.length - 1 ? (
            <button 
              onClick={handleNext}
              className={`next-button ${!hasMinimumEntries() ? 'disabled' : ''}`}
              disabled={!hasMinimumEntries()}
            >
              Next ({currentQuestionIndex + 2}/{questions.length})
            </button>
          ) : (
            <button 
              onClick={processAssessment}
              className={`complete-button ${!hasMinimumEntries() ? 'disabled' : ''}`}
              disabled={!hasMinimumEntries()}
            >
              Complete Assessment
            </button>
          )}
        </div>

        {/* 🔧 PROGRESS SUMMARY */}
        <div className="progress-summary">
          <h4>Overall Progress:</h4>
          <div className="progress-grid">
            {questions.map((question, index) => {
              const questionResponses = responses[question.id] || [];
              const isCompleted = questionResponses.length > 0;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <div 
                  key={question.id} 
                  className={`progress-item ${isCompleted ? 'completed' : 'pending'} ${isCurrent ? 'current' : ''}`}
                >
                  <span className="question-num">{index + 1}</span>
                  <span className="status">{isCompleted ? '✓' : '○'}</span>
                  <span className="count">({questionResponses.length})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🔧 STYLING */}
      <style>{`
        .requirement-notice {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 12px;
          margin: 16px 0;
          font-size: 14px;
          color: #92400e;
        }

        .entries-count {
          color: #059669;
          font-weight: 600;
        }

        .next-button, .complete-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .next-button.disabled, .complete-button.disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .complete-button:not(.disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        .progress-summary {
          margin-top: 24px;
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
        }

        .progress-grid {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
          gap: 8px;
          margin-top: 12px;
        }

        .progress-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 4px;
          border-radius: 6px;
          font-size: 12px;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
        }

        .progress-item.completed {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
        }

        .progress-item.current {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #2563eb;
          font-weight: 600;
        }

        .question-num {
          font-weight: 600;
        }

        .status {
          font-size: 14px;
        }

        .count {
          font-size: 10px;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};

export default SelfAssessment;