import React from 'react';

interface MindRecoveryHubProps {
  onBack: () => void;
  onExerciseSelect: (exerciseId: string) => void;
  userData?: any;
}

const MindRecoveryHub: React.FC<MindRecoveryHubProps> = ({ 
  onBack, 
  onExerciseSelect,
  userData
}) => {
  
  // Original 4 exercises - keeping exact same structure
  const exercises = [
    {
      id: 'morning-recharge',
      title: 'Morning Recharge',
      description: 'Start your day with clarity and focus',
      duration: '5 minutes',
      icon: '🌅'
    },
    {
      id: 'emotional-reset',
      title: 'Emotional Reset',
      description: 'Settle your emotions and find balance',
      duration: '5 minutes',
      icon: '🧘'
    },
    {
      id: 'mid-day-reset',
      title: 'Mid-Day Reset',
      description: 'Quick refresh to maintain focus',
      duration: '3 minutes',
      icon: '☀️'
    },
    {
      id: 'work-home-transition',
      title: 'Work-Home Transition',
      description: 'Shift from work mode to personal time',
      duration: '5 minutes',
      icon: '🏠'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* Header */}
      <header style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        padding: 'clamp(16px, 4vw, 24px)',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          ← Back
        </button>
        
        <div style={{ 
          flex: 1, 
          textAlign: 'center',
          minWidth: '200px'
        }}>
          <h1 style={{ 
            fontSize: 'clamp(24px, 5vw, 36px)', 
            fontWeight: '700', 
            margin: '0',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Mind Recovery
          </h1>
        </div>
      </header>
      
      {/* Main Content */}
      <main style={{
        padding: 'clamp(20px, 4vw, 40px)',
        maxWidth: '1000px',
        margin: '0 auto'
      }}>
        {/* Description */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: 'clamp(24px, 4vw, 32px)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <p style={{ 
            fontSize: 'clamp(16px, 3vw, 20px)', 
            margin: '0',
            color: 'white',
            opacity: 0.95,
            lineHeight: '1.5'
          }}>
            Choose a PAHM practice to reset and recover your mind
          </p>
        </div>
        
        {/* Exercises Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          {exercises.map(exercise => (
            <div
              key={exercise.id}
              onClick={() => onExerciseSelect(exercise.id)}
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '20px',
                padding: '32px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)';
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: '48px',
                marginBottom: '20px',
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '20px',
                display: 'inline-block'
              }}>
                {exercise.icon}
              </div>
              
              {/* Title */}
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                margin: '0 0 12px 0',
                color: '#1f2937'
              }}>
                {exercise.title}
              </h3>
              
              {/* Description */}
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.5', 
                margin: '0 0 16px 0',
                color: '#6b7280'
              }}>
                {exercise.description}
              </p>
              
              {/* Duration */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                color: '#667eea',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '600',
                border: '1px solid rgba(102, 126, 234, 0.2)',
                display: 'inline-block',
                marginBottom: '24px'
              }}>
                {exercise.duration}
              </div>
              
              {/* Start Button */}
              <div style={{ marginTop: '24px' }}>
                <button style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '16px 24px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                }}>
                  Start Exercise →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CSS for Mobile */}
      <style>{`
        @media (max-width: 768px) {
          .exercises-grid {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MindRecoveryHub;