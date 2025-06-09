import React, { useState, useEffect } from 'react';
import './MindRecoveryHub.css';

interface MindRecoveryHubProps {
  onBack: () => void;
  onExerciseSelect: (exerciseId: string) => void;
  userData?: any;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  benefits: string[];
  recommended: boolean;
}

const MindRecoveryHub: React.FC<MindRecoveryHubProps> = ({ 
  onBack, 
  onExerciseSelect,
  userData
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock user data if not provided
  const user = userData || {
    name: 'User',
    experienceLevel: 'beginner',
    goals: ['stress-reduction', 'focus']
  };
  
  // Mock exercises data
  const mockExercises: Exercise[] = [
    {
      id: 'breathing-reset',
      title: 'Breathing Reset',
      description: 'A quick breathing exercise to reset your nervous system and return to presence.',
      duration: '3 min',
      category: 'stress-reduction',
      benefits: ['Reduces anxiety', 'Increases oxygen flow', 'Calms the mind'],
      recommended: false
    },
    {
      id: 'thought-labeling',
      title: 'Thought Labeling',
      description: 'Learn to observe and label thoughts without attachment.',
      duration: '5 min',
      category: 'awareness',
      benefits: ['Reduces rumination', 'Increases metacognition', 'Develops non-attachment'],
      recommended: false
    },
    {
      id: 'body-scan',
      title: 'Mini Body Scan',
      description: 'A brief body scan to reconnect with physical sensations.',
      duration: '4 min',
      category: 'embodiment',
      benefits: ['Increases body awareness', 'Reduces physical tension', 'Grounds attention'],
      recommended: false
    },
    {
      id: 'gratitude-moment',
      title: 'Gratitude Moment',
      description: 'A quick practice to cultivate gratitude and positive emotions.',
      duration: '2 min',
      category: 'positivity',
      benefits: ['Improves mood', 'Counters negativity bias', 'Builds resilience'],
      recommended: false
    },
    {
      id: 'single-point-focus',
      title: 'Single Point Focus',
      description: 'Develop concentration by focusing on a single point.',
      duration: '5 min',
      category: 'focus',
      benefits: ['Strengthens attention', 'Reduces distractibility', 'Builds concentration'],
      recommended: false
    },
    {
      id: 'loving-kindness',
      title: 'Mini Loving-Kindness',
      description: 'A brief loving-kindness practice to cultivate compassion.',
      duration: '3 min',
      category: 'compassion',
      benefits: ['Increases empathy', 'Reduces self-criticism', 'Improves relationships'],
      recommended: false
    }
  ];
  
  // Load exercises
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      try {
        // Mark exercises as recommended based on user goals
        if (user?.goals) {
          mockExercises.forEach(exercise => {
            if (user?.goals?.includes(exercise.category) && !exercise.recommended) {
              exercise.recommended = true;
            }
          });
        }
        
        setExercises(mockExercises);
        setLoading(false);
      } catch (err) {
        setError('Failed to load exercises');
        setLoading(false);
      }
    }, 1000);
  }, [user]);
  
  // Filter exercises
  const filteredExercises = exercises.filter(exercise => {
    // Filter by category
    if (filter !== 'all' && filter !== 'recommended' && exercise.category !== filter) {
      return false;
    }
    
    // Filter recommended
    if (filter === 'recommended' && !exercise.recommended) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !exercise.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Handle exercise selection
  const handleExerciseSelect = (exerciseId: string) => {
    onExerciseSelect(exerciseId);
  };
  
  return (
    <div className="mind-recovery-hub">
      <header className="hub-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1>Mind Recovery Hub</h1>
      </header>
      
      <div className="hub-description">
        <p>Quick practices to recover your attention and return to presence.</p>
      </div>
      
      <div className="hub-filters">
        <div className="search-container">
          <input 
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${filter === 'recommended' ? 'active' : ''}`}
            onClick={() => setFilter('recommended')}
          >
            Recommended
          </button>
          <button 
            className={`filter-tab ${filter === 'stress-reduction' ? 'active' : ''}`}
            onClick={() => setFilter('stress-reduction')}
          >
            Stress
          </button>
          <button 
            className={`filter-tab ${filter === 'focus' ? 'active' : ''}`}
            onClick={() => setFilter('focus')}
          >
            Focus
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <p>Loading exercises...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
        </div>
      ) : (
        <div className="exercises-grid">
          {filteredExercises.length === 0 ? (
            <div className="no-results">
              <p>No exercises found matching your criteria.</p>
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <div 
                key={exercise.id}
                className={`exercise-card ${exercise.recommended ? 'recommended' : ''}`}
                onClick={() => handleExerciseSelect(exercise.id)}
              >
                {exercise.recommended && (
                  <div className="recommended-badge">Recommended</div>
                )}
                
                <h3 className="exercise-title">{exercise.title}</h3>
                <p className="exercise-description">{exercise.description}</p>
                
                <div className="exercise-meta">
                  <span className="exercise-duration">{exercise.duration}</span>
                  <span className="exercise-category">{exercise.category}</span>
                </div>
                
                <div className="exercise-benefits">
                  <h4>Benefits:</h4>
                  <ul>
                    {exercise.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                </div>
                
                <button className="start-button">
                  Start Exercise
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MindRecoveryHub;
