import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import './SelfAssessment.css';

interface SelfAssessmentProps {
  onComplete: (data: any) => void;
  onBack: () => void;
}

interface Category {
  id: string;
  title: string;
  question: string;
  description: string;
  icon: string;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onComplete, onBack }) => {
  const { currentUser, markSelfAssessmentComplete } = useAuth();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const categories: Category[] = [
    {
      id: 'taste',
      title: 'Food & Taste',
      question: 'How would you describe your relationship with food and flavors?',
      description: 'Think about your eating habits, favorite foods, and how much you think about taste',
      icon: '🍽️'
    },
    {
      id: 'smell',
      title: 'Scents & Aromas',
      question: 'How do you feel about different scents and fragrances?',
      description: 'Consider perfumes, cooking smells, nature scents, and how they affect you',
      icon: '👃'
    },
    {
      id: 'sound',
      title: 'Sounds & Music',
      question: 'What\'s your relationship with sounds, music, and audio?',
      description: 'Think about music preferences, environmental sounds, and audio experiences',
      icon: '🎵'
    },
    {
      id: 'sight',
      title: 'Visual & Beauty',
      question: 'How do you respond to visual beauty, colors, and sights?',
      description: 'Consider art, nature, design, colors, and visual experiences that move you',
      icon: '👁️'
    },
    {
      id: 'touch',
      title: 'Touch & Textures',
      question: 'How do you feel about different textures and physical sensations?',
      description: 'Think about fabrics, temperatures, physical comfort, and tactile experiences',
      icon: '✋'
    },
    {
      id: 'mind',
      title: 'Thoughts & Mental Images',
      question: 'What\'s your relationship with thoughts, ideas, and mental imagery?',
      description: 'Consider daydreaming, planning, fantasizing, and mental scenarios',
      icon: '🧠'
    }
  ];

  const currentCategory = categories[currentCategoryIndex];

  const handleResponse = (level: string, details?: string) => {
    setResponses(prev => ({
      ...prev,
      [currentCategory.id]: {
        level,
        details: details || '',
        timestamp: new Date().toISOString(),
        category: currentCategory.title
      }
    }));
  };

  const handleNext = () => {
    const currentResponse = responses[currentCategory.id];
    if (!currentResponse || !currentResponse.level) {
      alert('Please select an option before continuing.');
      return;
    }

    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      processAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const processAssessment = async () => {
    console.log('🎯 SIMPLE FIX: Processing self-assessment with simple format:', responses);

    // Check if all categories are completed
    const incompleteCategories = categories.filter(cat => {
      const response = responses[cat.id];
      return !response || !response.level;
    });

    if (incompleteCategories.length > 0) {
      alert(`Please complete all categories. Missing: ${incompleteCategories.map(cat => cat.title).join(', ')}`);
      return;
    }

    // 🎯 SIMPLE FIX: Save in EXACT same format as questionnaire - FLAT STRUCTURE
    const simpleAssessmentData = {
      // Direct answers - same format as questionnaire
      taste: responses.taste?.level || 'none',
      smell: responses.smell?.level || 'none', 
      sound: responses.sound?.level || 'none',
      sight: responses.sight?.level || 'none',
      touch: responses.touch?.level || 'none',
      mind: responses.mind?.level || 'none',
      
      // Simple scoring for happiness calculation
      attachmentScore: calculateAttachmentScore(responses),
      nonAttachmentCount: Object.values(responses).filter((r: any) => r.level === 'none').length,
      
      // Metadata - same as questionnaire
      completedAt: new Date().toISOString(),
      version: '1.0',
      type: 'selfAssessment'
    };

    console.log('✅ SIMPLE FIX: Simple assessment data (questionnaire format):', simpleAssessmentData);
    console.log('✅ SIMPLE FIX: Attachment score (negative points):', simpleAssessmentData.attachmentScore);
    console.log('✅ SIMPLE FIX: Non-attachment count (zero points):', simpleAssessmentData.nonAttachmentCount);

    try {
      // 🎯 SIMPLE FIX: Use AuthContext method with SIMPLE data structure
      console.log('🔄 SIMPLE FIX: Calling markSelfAssessmentComplete with simple format...');
      
      await markSelfAssessmentComplete(simpleAssessmentData);
      
      console.log('✅ SIMPLE FIX: Self-assessment saved successfully in simple format!');
      
      // Call onComplete to proceed to next step
      onComplete(simpleAssessmentData);
      
    } catch (error) {
      console.error('❌ SIMPLE FIX: Error saving through AuthContext:', error);
      
      // Fallback: Save directly to storage in simple format
      console.log('🔄 SIMPLE FIX: Attempting fallback save in simple format...');
      
      try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const updatedProfile = {
          ...userProfile,
          selfAssessmentData: simpleAssessmentData, // Simple format
          assessmentCompleted: true,
          lastUpdated: new Date().toISOString()
        };

        // Save to both storage locations
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        
        if (currentUser?.uid) {
          localStorage.setItem(`userProfile_${currentUser.uid}`, JSON.stringify(updatedProfile));
        }

        console.log('✅ SIMPLE FIX: Fallback save successful in simple format!');
        onComplete(simpleAssessmentData);
        
      } catch (fallbackError) {
        console.error('❌ SIMPLE FIX: Fallback save failed:', fallbackError);
        // Still call onComplete to not block user progress
        onComplete(simpleAssessmentData);
      }
    }
  };

  // 🎯 SIMPLE SCORING: Attachment = minus points, Non-attachment = zero points
  const calculateAttachmentScore = (responses: Record<string, any>): number => {
    let attachmentPenalty = 0;
    
    Object.values(responses).forEach((response: any) => {
      if (response.level === 'strong') {
        attachmentPenalty -= 15; // Strong attachment = -15 points
      } else if (response.level === 'some') {
        attachmentPenalty -= 7;  // Some attachment = -7 points  
      }
      // 'none' = 0 points (no penalty for non-attachment)
    });
    
    console.log('🎯 SIMPLE SCORING: Attachment penalty calculated:', attachmentPenalty);
    return attachmentPenalty;
  };

  const currentResponse = responses[currentCategory.id];
  const completedCategories = Object.keys(responses).filter(key => responses[key]?.level).length;
  const progressPercentage = (completedCategories / categories.length) * 100;

  return (
    <div className="self-assessment-container">
      {/* Header */}
      <div className="assessment-header">
        {currentCategoryIndex > 0 && (
          <button className="back-button" onClick={handlePrevious}>← Back</button>
        )}
        <div className="progress-indicator">
          {currentCategory.icon} {currentCategoryIndex + 1} of {categories.length}
        </div>
        <div className="category-progress">
          {Math.round(progressPercentage)}% Complete
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="assessment-content">
        <div className="category-header">
          <div className="category-icon">{currentCategory.icon}</div>
          <h2>{currentCategory.title}</h2>
          <p className="category-question">{currentCategory.question}</p>
          <p className="category-description">{currentCategory.description}</p>
        </div>

        {/* Response Options */}
        <div className="response-options">
          
          {/* Option 1: No particular preferences = ZERO POINTS */}
          <label className={`response-option ${currentResponse?.level === 'none' ? 'selected' : ''}`}>
            <input
              type="radio"
              name={currentCategory.id}
              checked={currentResponse?.level === 'none'}
              onChange={() => handleResponse('none')}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">✨</span>
                <strong>I don't have particular preferences for this (0 points)</strong>
              </div>
              <div className="option-description">
                I'm generally content with whatever comes my way in this area (Non-attachment)
              </div>
            </div>
          </label>

          {/* Option 2: Some preferences = MINUS 7 POINTS */}
          <label className={`response-option ${currentResponse?.level === 'some' ? 'selected' : ''}`}>
            <input
              type="radio"
              name={currentCategory.id}
              checked={currentResponse?.level === 'some'}
              onChange={() => handleResponse('some')}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">⚖️</span>
                <strong>I have some preferences, but I'm flexible (-7 points)</strong>
              </div>
              <div className="option-description">
                I enjoy certain things more than others, but I adapt easily (Some attachment)
              </div>
            </div>
          </label>

          {/* Option 3: Strong preferences = MINUS 15 POINTS */}
          <label className={`response-option ${currentResponse?.level === 'strong' ? 'selected' : ''}`}>
            <input
              type="radio"
              name={currentCategory.id}
              checked={currentResponse?.level === 'strong'}
              onChange={() => handleResponse('strong')}
            />
            <div className="option-content">
              <div className="option-header">
                <span className="option-icon">🔥</span>
                <strong>I have strong preferences and specific likes/dislikes (-15 points)</strong>
              </div>
              <div className="option-description">
                There are clear things I love or avoid in this area (Strong attachment)
              </div>
            </div>
          </label>

          {/* Optional details field */}
          {currentResponse?.level && currentResponse.level !== 'none' && (
            <div className="details-section">
              <label className="details-label">
                Optional: Feel free to share examples (completely optional)
              </label>
              <textarea
                value={currentResponse.details || ''}
                onChange={(e) => handleResponse(currentResponse.level, e.target.value)}
                placeholder={`e.g., ${currentCategory.id === 'taste' ? "'I really enjoy spicy foods and chocolate'" : 
                            currentCategory.id === 'sound' ? "'I love classical music and nature sounds'" : 
                            currentCategory.id === 'sight' ? "'I'm drawn to sunsets and modern art'" :
                            currentCategory.id === 'smell' ? "'I love the smell of coffee and lavender'" :
                            currentCategory.id === 'touch' ? "'I enjoy soft fabrics and warm temperatures'" :
                            "'I often daydream about traveling and future plans'"}`}
                className="details-textarea"
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Scoring Preview */}
        <div className="scoring-preview">
          <h4>🎯 Current Score Preview:</h4>
          <div className="score-breakdown">
            {Object.entries(responses).map(([categoryId, response]: [string, any]) => {
              if (!response?.level) return null;
              
              const points = response.level === 'none' ? 0 : 
                           response.level === 'some' ? -7 : -15;
              const color = points === 0 ? '#10b981' : points === -7 ? '#f59e0b' : '#ef4444';
              
              return (
                <div key={categoryId} className="score-item">
                  <span>{categories.find(c => c.id === categoryId)?.icon}</span>
                  <span>{categories.find(c => c.id === categoryId)?.title}</span>
                  <span style={{ color, fontWeight: 'bold' }}>
                    {points >= 0 ? `+${points}` : `${points}`} points
                  </span>
                </div>
              );
            })}
            
            {Object.keys(responses).length > 0 && (
              <div className="total-score">
                <strong>
                  Total Attachment Penalty: {calculateAttachmentScore(responses)} points
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          {currentCategoryIndex < categories.length - 1 ? (
            <button 
              onClick={handleNext}
              className={`next-button ${!currentResponse?.level ? 'disabled' : ''}`}
              disabled={!currentResponse?.level}
            >
              Next Category →
            </button>
          ) : (
            <button 
              onClick={processAssessment}
              className={`complete-button ${!currentResponse?.level ? 'disabled' : ''}`}
              disabled={!currentResponse?.level}
            >
              Complete Assessment ✓
            </button>
          )}
        </div>

        {/* Overall Progress */}
        <div className="overall-progress">
          <h4>Progress Overview:</h4>
          <div className="categories-grid">
            {categories.map((category, index) => {
              const response = responses[category.id];
              const isCompleted = response?.level;
              const isCurrent = index === currentCategoryIndex;
              
              return (
                <div 
                  key={category.id} 
                  className={`category-item ${isCompleted ? 'completed' : 'pending'} ${isCurrent ? 'current' : ''}`}
                >
                  <span className="category-icon-small">{category.icon}</span>
                  <span className="category-name">{category.title}</span>
                  <span className="category-status">
                    {isCompleted ? '✓' : '○'}
                  </span>
                  {isCompleted && (
                    <span className="response-level">
                      {response.level === 'none' ? '✨ (0)' : 
                       response.level === 'some' ? '⚖️ (-7)' : '🔥 (-15)'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Styles with Scoring */}
      <style>{`
        .self-assessment-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        .assessment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 20px 30px;
          border-radius: 15px;
          margin-bottom: 20px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .back-button {
          background: #e2e8f0;
          color: #4a5568;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background: #cbd5e0;
          transform: translateY(-1px);
        }

        .progress-indicator {
          font-size: 18px;
          font-weight: 700;
          color: #2d3748;
        }

        .category-progress {
          font-size: 14px;
          color: #667eea;
          font-weight: 600;
        }

        .progress-bar-container {
          background: white;
          padding: 15px 30px;
          border-radius: 15px;
          margin-bottom: 25px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .assessment-content {
          background: white;
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .category-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .category-icon {
          font-size: 4rem;
          margin-bottom: 15px;
        }

        .category-header h2 {
          font-size: 2.2rem;
          color: #2d3748;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .category-question {
          font-size: 1.3rem;
          color: #4a5568;
          margin-bottom: 10px;
          font-weight: 600;
        }

        .category-description {
          font-size: 1rem;
          color: #718096;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .response-options {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 40px;
        }

        .response-option {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          padding: 25px;
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          cursor: pointer;
          background: #fafafa;
          transition: all 0.3s ease;
          position: relative;
        }

        .response-option:hover {
          border-color: #667eea;
          background: #f8fbff;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .response-option.selected {
          border-color: #667eea;
          background: linear-gradient(135deg, #f0f4ff 0%, #e6f0ff 100%);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
        }

        .response-option input[type="radio"] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          accent-color: #667eea;
        }

        .option-content {
          flex: 1;
        }

        .option-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .option-icon {
          font-size: 1.5rem;
        }

        .option-header strong {
          font-size: 1.1rem;
          color: #2d3748;
          font-weight: 600;
        }

        .option-description {
          color: #4a5568;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-left: 3rem;
        }

        .details-section {
          margin-top: 25px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .details-label {
          display: block;
          margin-bottom: 10px;
          font-size: 0.9rem;
          color: #2d3748;
          font-weight: 500;
        }

        .details-textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.9rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s;
          color: #2d3748;
          background: white;
        }

        .details-textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .details-textarea::placeholder {
          color: #a0aec0;
          font-style: italic;
        }

        /* NEW: Scoring Preview Styles */
        .scoring-preview {
          margin: 30px 0;
          padding: 25px;
          background: #f0f9ff;
          border-radius: 15px;
          border: 2px solid #0ea5e9;
        }

        .scoring-preview h4 {
          margin-bottom: 15px;
          color: #0c4a6e;
          text-align: center;
          font-size: 1.1rem;
        }

        .score-breakdown {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .score-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          background: white;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .total-score {
          margin-top: 15px;
          padding: 15px;
          background: #1e40af;
          color: white;
          border-radius: 8px;
          text-align: center;
          font-size: 1rem;
        }

        .navigation-buttons {
          display: flex;
          justify-content: center;
          margin: 40px 0;
        }

        .next-button, .complete-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 15px 30px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 180px;
        }

        .next-button.disabled, .complete-button.disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .complete-button:not(.disabled) {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
        }

        .next-button:not(.disabled):hover, .complete-button:not(.disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .overall-progress {
          margin-top: 30px;
          padding: 25px;
          background: #f8fafc;
          border-radius: 15px;
          border: 1px solid #e2e8f0;
        }

        .overall-progress h4 {
          margin-bottom: 20px;
          color: #2d3748;
          text-align: center;
          font-size: 1.1rem;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 15px;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          background: white;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .category-item.completed {
          border-color: #10b981;
          background: #ecfdf5;
        }

        .category-item.current {
          border-color: #667eea;
          background: #eff6ff;
          font-weight: 600;
          transform: scale(1.02);
        }

        .category-icon-small {
          font-size: 1.5rem;
        }

        .category-name {
          flex: 1;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .category-status {
          font-size: 1.2rem;
          color: #10b981;
        }

        .response-level {
          font-size: 0.8rem;
          margin-left: 5px;
          font-weight: 600;
        }

        /* Mobile Responsiveness */
        @media (max-width: 768px) {
          .self-assessment-container {
            padding: 15px;
          }

          .assessment-content {
            padding: 25px 20px;
          }

          .category-header h2 {
            font-size: 1.8rem;
          }

          .category-question {
            font-size: 1.1rem;
          }

          .response-option {
            padding: 20px 15px;
          }

          .option-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .option-description {
            margin-left: 0;
            margin-top: 5px;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .assessment-header {
            padding: 15px 20px;
            flex-direction: column;
            gap: 10px;
          }

          .back-button {
            width: 100%;
          }

          .score-breakdown {
            gap: 8px;
          }

          .score-item {
            font-size: 0.8rem;
            padding: 8px 12px;
          }
        }

        @media (max-width: 480px) {
          .self-assessment-container {
            padding: 10px;
          }

          .assessment-content {
            padding: 20px 15px;
          }

          .category-icon {
            font-size: 3rem;
          }

          .category-header h2 {
            font-size: 1.6rem;
          }

          .response-option {
            padding: 15px;
          }

          .option-header strong {
            font-size: 1rem;
          }

          .next-button, .complete-button {
            width: 100%;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default SelfAssessment;