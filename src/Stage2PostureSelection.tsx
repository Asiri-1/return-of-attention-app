import React, { useState } from 'react';

interface Stage2PostureSelectionProps {
  onBack: () => void;
  onStartPractice: (selectedPosture: string) => void;
}

const Stage2PostureSelection: React.FC<Stage2PostureSelectionProps> = ({
  onBack,
  onStartPractice
}) => {
  const [selectedPosture, setSelectedPosture] = useState<string>('');
     
  const postures = [
    { 
      id: 'chair', 
      name: 'Chair Sitting', 
      description: 'Sitting upright on a chair with feet flat on the floor',
      icon: '🪑'
    },
    { 
      id: 'cushion', 
      name: 'Cushion Sitting', 
      description: 'Sitting cross-legged on a meditation cushion',
      icon: '🧘'
    },
    { 
      id: 'seiza', 
      name: 'Seiza Position', 
      description: 'Kneeling with weight resting on cushion or bench',
      icon: '🙏'
    },
    { 
      id: 'burmese', 
      name: 'Burmese Position', 
      description: 'Sitting with both legs bent and resting on the floor',
      icon: '🕉️'
    },
    { 
      id: 'lotus', 
      name: 'Half Lotus', 
      description: 'One foot resting on the opposite thigh',
      icon: '🧘‍♂️'
    },
    { 
      id: 'full-lotus', 
      name: 'Full Lotus', 
      description: 'Both feet resting on opposite thighs',
      icon: '🧘‍♀️'
    },
    { 
      id: 'lying', 
      name: 'Lying Down', 
      description: 'Lying flat on back with arms at sides',
      icon: '🛏️'
    },
    { 
      id: 'standing', 
      name: 'Standing', 
      description: 'Standing with feet shoulder-width apart',
      icon: '🧍'
    },
    { 
      id: 'other', 
      name: 'Other', 
      description: 'Another posture not listed here',
      icon: '❓'
    }
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
            fontSize: 'clamp(18px, 4vw, 28px)', 
            fontWeight: '700', 
            margin: '0',
            color: 'white',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            PAHM Trainee Practice Setup
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        padding: 'clamp(20px, 4vw, 40px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* Instructions */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: 'clamp(24px, 4vw, 32px)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <h2 style={{
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: '700',
            margin: '0 0 16px 0',
            color: 'white'
          }}>
            Select Your Posture
          </h2>
          <p style={{ 
            fontSize: 'clamp(14px, 3vw, 18px)', 
            color: 'white',
            opacity: 0.95,
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Choose the posture you'll be using for this PAHM Trainee practice session. 
            A comfortable, stable posture will help you maintain awareness of thought patterns.
          </p>
        </div>

        {/* Posture Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          {postures.map((posture) => (
            <div
              key={posture.id}
              onClick={() => handlePostureSelect(posture.id)}
              style={{
                background: selectedPosture === posture.id 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(20px)',
                border: selectedPosture === posture.id 
                  ? '2px solid rgba(255, 255, 255, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.2)',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: selectedPosture === posture.id 
                  ? '0 15px 35px rgba(255, 255, 255, 0.1)' 
                  : '0 8px 20px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                if (selectedPosture !== posture.id) {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPosture !== posture.id) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.1)';
                }
              }}
            >
              {/* Selection Indicator */}
              {selectedPosture === posture.id && (
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
                }}>
                  ✓
                </div>
              )}

              {/* Icon */}
              <div style={{
                fontSize: '40px',
                marginBottom: '16px',
                padding: '12px',
                background: selectedPosture === posture.id 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                display: 'inline-block'
              }}>
                {posture.icon}
              </div>

              {/* Name */}
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '700', 
                margin: '0 0 8px 0',
                color: 'white'
              }}>
                {posture.name}
              </h3>

              {/* Description */}
              <p style={{ 
                fontSize: '14px', 
                lineHeight: '1.5', 
                margin: '0',
                color: 'white',
                opacity: 0.9
              }}>
                {posture.description}
              </p>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <button
            onClick={handleStartPractice}
            disabled={!selectedPosture}
            style={{
              width: '100%',
              background: !selectedPosture 
                ? 'rgba(255, 255, 255, 0.3)' 
                : 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '18px 32px',
              fontSize: '18px',
              fontWeight: '700',
              cursor: !selectedPosture ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: !selectedPosture 
                ? 'none' 
                : '0 8px 25px rgba(34, 197, 94, 0.3)',
              opacity: !selectedPosture ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (selectedPosture) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 30px rgba(34, 197, 94, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedPosture) {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(34, 197, 94, 0.3)';
              }
            }}
          >
            Start Practice
          </button>
        </div>
      </main>

      {/* CSS for Mobile Responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .posture-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          header {
            flex-direction: column !important;
            text-align: center !important;
          }
        }

        @media (max-width: 480px) {
          main {
            padding: 16px !important;
          }
          
          .posture-grid {
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Stage2PostureSelection;