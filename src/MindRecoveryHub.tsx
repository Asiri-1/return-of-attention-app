import React, { useState, useEffect } from 'react';

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
  icon: string;
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
  
  // Enhanced exercises data with icons
  const mockExercises: Exercise[] = [
    {
      id: 'breathing-reset',
      title: 'Breathing Reset',
      description: 'A quick breathing exercise to reset your nervous system and return to presence.',
      duration: '3 min',
      category: 'stress-reduction',
      benefits: ['Reduces anxiety', 'Increases oxygen flow', 'Calms the mind'],
      recommended: false,
      icon: '🌬️'
    },
    {
      id: 'thought-labeling',
      title: 'Thought Labeling',
      description: 'Learn to observe and label thoughts without attachment.',
      duration: '5 min',
      category: 'awareness',
      benefits: ['Reduces rumination', 'Increases metacognition', 'Develops non-attachment'],
      recommended: false,
      icon: '🏷️'
    },
    {
      id: 'body-scan',
      title: 'Mini Body Scan',
      description: 'A brief body scan to reconnect with physical sensations.',
      duration: '4 min',
      category: 'embodiment',
      benefits: ['Increases body awareness', 'Reduces physical tension', 'Grounds attention'],
      recommended: false,
      icon: '🧘'
    },
    {
      id: 'gratitude-moment',
      title: 'Gratitude Moment',
      description: 'A quick practice to cultivate gratitude and positive emotions.',
      duration: '2 min',
      category: 'positivity',
      benefits: ['Improves mood', 'Counters negativity bias', 'Builds resilience'],
      recommended: false,
      icon: '🙏'
    },
    {
      id: 'single-point-focus',
      title: 'Single Point Focus',
      description: 'Develop concentration by focusing on a single point.',
      duration: '5 min',
      category: 'focus',
      benefits: ['Strengthens attention', 'Reduces distractibility', 'Builds concentration'],
      recommended: false,
      icon: '🎯'
    },
    {
      id: 'loving-kindness',
      title: 'Mini Loving-Kindness',
      description: 'A brief loving-kindness practice to cultivate compassion.',
      duration: '3 min',
      category: 'compassion',
      benefits: ['Increases empathy', 'Reduces self-criticism', 'Improves relationships'],
      recommended: false,
      icon: '💝'
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

  // Filter tab data
  const filterTabs = [
    { id: 'all', label: 'All', icon: '📋' },
    { id: 'recommended', label: 'Recommended', icon: '⭐' },
    { id: 'stress-reduction', label: 'Stress', icon: '😌' },
    { id: 'focus', label: 'Focus', icon: '🎯' },
    { id: 'awareness', label: 'Awareness', icon: '👁️' },
    { id: 'embodiment', label: 'Body', icon: '🧘' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      color: 'white',
      padding: '20px'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '30px',
        position: 'relative'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '25px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '20px'
          }}
        >
          ← Back
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            margin: '0',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Mind Recovery Hub 🧠
          </h1>
        </div>
      </header>
      
      {/* Description */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '15px',
        padding: '20px',
        backdropFilter: 'blur(10px)'
      }}>
        <p style={{ 
          fontSize: '18px', 
          margin: '0',
          opacity: 0.9
        }}>
          Quick practices to recover your attention and return to presence
        </p>
      </div>
      
      {/* Search and Filters */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '20px',
        marginBottom: '30px',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="🔍 Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '25px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>
        
        {/* Filter Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '10px'
        }}>
          {filterTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                background: filter === tab.id
                  ? 'linear-gradient(135deg, #fff 0%, #f0f0f0 100%)'
                  : 'rgba(255, 255, 255, 0.2)',
                color: filter === tab.id ? '#333' : 'white',
                border: 'none',
                borderRadius: '15px',
                padding: '12px 8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: filter === tab.id ? 'scale(1.05)' : 'scale(1)',
                boxShadow: filter === tab.id ? '0 4px 15px rgba(255,255,255,0.3)' : 'none'
              }}
            >
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{tab.icon}</div>
              <div>{tab.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '15px',
          padding: '40px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>⏳</div>
          <p style={{ fontSize: '18px', margin: '0' }}>Loading exercises...</p>
        </div>
      ) : error ? (
        <div style={{
          textAlign: 'center',
          background: 'rgba(244, 67, 54, 0.2)',
          borderRadius: '15px',
          padding: '40px',
          border: '2px solid rgba(244, 67, 54, 0.5)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '10px' }}>❌</div>
          <p style={{ fontSize: '18px', margin: '0' }}>{error}</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {filteredExercises.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '15px',
              padding: '40px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
              <p style={{ fontSize: '18px', margin: '0' }}>No exercises found matching your criteria.</p>
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                onClick={() => handleExerciseSelect(exercise.id)}
                style={{
                  background: exercise.recommended 
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.1) 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '25px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  border: exercise.recommended ? '2px solid rgba(255,215,0,0.5)' : '2px solid transparent',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {exercise.recommended && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
                    color: '#333',
                    padding: '5px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    ⭐ Recommended
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div style={{ fontSize: '32px', marginRight: '15px' }}>{exercise.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: 'bold', 
                      margin: '0 0 5px 0' 
                    }}>
                      {exercise.title}
                    </h3>
                    <div style={{
                      display: 'flex',
                      gap: '15px',
                      fontSize: '14px',
                      opacity: 0.8
                    }}>
                      <span>⏱️ {exercise.duration}</span>
                      <span>📝 {exercise.category}</span>
                    </div>
                  </div>
                </div>
                
                <p style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.5', 
                  margin: '0 0 20px 0',
                  opacity: 0.9
                }}>
                  {exercise.description}
                </p>
                
                <div style={{ marginBottom: '20px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold', 
                    margin: '0 0 10px 0',
                    opacity: 0.8
                  }}>
                    Benefits:
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {exercise.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        style={{
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '4px 8px',
                          borderRadius: '10px',
                          fontSize: '12px'
                        }}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
                
                <button style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '15px',
                  padding: '12px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}>
                  Start Exercise →
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