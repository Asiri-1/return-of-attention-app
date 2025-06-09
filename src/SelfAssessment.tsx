import React, { useState } from 'react';
import './SelfAssessment.css';
import { useAuth } from './AuthContext';

interface SelfAssessmentProps {
  onComplete: () => void;
  onBack: () => void;
}

const SelfAssessment: React.FC<SelfAssessmentProps> = ({ onComplete, onBack }) => {
  const { currentUser, updateUser } = useAuth();
  const [currentCategory, setCurrentCategory] = useState(0);
  const [entries, setEntries] = useState<Record<string, string[]>>({});
  const [currentEntry, setCurrentEntry] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  
  // Check for notification flag on component mount
  React.useEffect(() => {
    const shouldShowNotification = sessionStorage.getItem('showAssessmentNotification') === 'true';
    if (shouldShowNotification) {
      setShowNotification(true);
      // Clear the flag so notification doesn't show again on refresh
      sessionStorage.removeItem('showAssessmentNotification');
    }
  }, []);
  
  const categories = [
    {
      id: "food_preferences",
      title: "Food Preferences",
      description: "What are your favorite foods, flavors, or dishes? What tastes do you crave most often?"
    },
    {
      id: "pleasing_scents",
      title: "Pleasing Scents",
      description: "What scents or aromas do you find most pleasing or evocative? What smells trigger strong positive emotions?"
    },
    {
      id: "audio_enjoyment",
      title: "Audio Enjoyment",
      description: "What music, songs, or sounds do you most enjoy hearing? What audio experiences do you seek out?"
    },
    {
      id: "visual_pleasure",
      title: "Visual Pleasure",
      description: "What visual experiences do you find most beautiful or compelling? What do you most enjoy looking at?"
    },
    {
      id: "physical_sensations",
      title: "Physical Sensations",
      description: "What physical sensations do you find most pleasurable? What textures, temperatures, or physical experiences do you seek?"
    },
    {
      id: "mental_imagery",
      title: "Mental Imagery",
      description: "What do you most enjoy imagining, fantasizing about, or dreaming of? What mental scenarios bring you pleasure?"
    },
    {
      id: "current_goals",
      title: "Current Goals",
      description: "What goals or objectives are you currently pursuing or planning to pursue?"
    },
    {
      id: "current_worries",
      title: "Current Worries",
      description: "What things do you find yourself worrying about most often?"
    }
  ];
  
  const addEntry = () => {
    if (currentEntry.trim() === '') return;
    
    const categoryId = categories[currentCategory].id;
    const currentEntries = entries[categoryId] || [];
    
    setEntries({
      ...entries,
      [categoryId]: [...currentEntries, currentEntry.trim()]
    });
    
    setCurrentEntry('');
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addEntry();
    }
  };
  
  const nextCategory = () => {
    const categoryId = categories[currentCategory].id;
    const currentEntries = entries[categoryId] || [];
    
    // Ensure at least one entry for the current category
    if (currentEntries.length === 0 && currentEntry.trim() !== '') {
      addEntry();
    }
    
    if (currentCategory < categories.length - 1) {
      setCurrentCategory(currentCategory + 1);
    } else {
      // Complete the assessment
      if (currentUser && updateUser) {
        // Determine experience level based on completion
        // Default to beginner for this reflective assessment
        const experienceLevel = 'beginner';
        
        // Only update properties that exist in the User interface
        updateUser({
          experienceLevel,
          assessmentCompleted: true,
          currentStage: 1
          // assessmentResults removed as it's not in the User interface
        });
      }
      
      onComplete();
    }
  };
  
  const getCurrentEntries = () => {
    const categoryId = categories[currentCategory].id;
    return entries[categoryId] || [];
  };
  
  return (
    <div className="self-assessment-container">
      {showNotification && (
        <div className="notification-banner">
          <div className="notification-content">
            <h3>Self-Assessment Required</h3>
            <p>You need to complete this self-assessment before you can begin practice sessions. This helps establish your starting point and ensures you get the most from your practice.</p>
            <button onClick={() => setShowNotification(false)}>Got it</button>
          </div>
        </div>
      )}
      <div className="assessment-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>Self Assessment</h1>
        <div className="progress-indicator">
          Category {currentCategory + 1} of {categories.length}
        </div>
      </div>
      
      <div className="assessment-content">
        <div className="category-container">
          <h2>{categories[currentCategory].title}</h2>
          <p className="category-description">{categories[currentCategory].description}</p>
          
          <div className="entry-form">
            <p className="instruction">
              {(currentCategory <= 5) ? 
                "List 5-10 items that you feel strongly like or that bring you pleasure:" : 
                (currentCategory === 6) ?
                "List 3-5 goals or objectives you're currently pursuing or planning to pursue:" :
                "List 3-5 things you find yourself worrying about:"
              }
            </p>
            
            <div className="entry-input-container">
              <input
                type="text"
                className="entry-input"
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type an item and press Enter to add"
              />
              <button className="add-entry-button" onClick={addEntry}>Add</button>
            </div>
            
            <div className="entries-list">
              {getCurrentEntries().map((entry, index) => (
                <div key={index} className="entry-item">
                  {index + 1}. {entry}
                </div>
              ))}
            </div>
            
            <div className="entry-count">
              {getCurrentEntries().length} items added {
                currentCategory <= 5 ? 
                  (getCurrentEntries().length >= 5 ? '(minimum reached)' : '(minimum 5 recommended)') :
                  (getCurrentEntries().length >= 3 ? '(minimum reached)' : '(minimum 3 recommended)')
              }
            </div>
          </div>
          
          <div className="navigation-buttons">
            <button 
              className="next-button" 
              onClick={nextCategory}
              disabled={getCurrentEntries().length === 0 && currentEntry.trim() === ''}
            >
              {currentCategory === categories.length - 1 ? 'Complete Assessment' : 'Next Category'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessment;
