import React, { useState } from 'react';

// 🎯 ONE UNIVERSAL INTERFACE - Handles all your current props
interface UniversalPostureSelectionProps {
  onBack: () => void;
  onStartPractice: (selectedPosture: string) => void;
  
  // Support both your current prop patterns
  stageNumber?: number;        // From PostureSelection.tsx
  currentTLevel?: string;      // From Stage1PostureSelection.tsx
  
  // Optional: for future extensibility
  sessionType?: 'meditation' | 'mind_recovery';
  showDuration?: boolean;
}

const UniversalPostureSelection: React.FC<UniversalPostureSelectionProps> = ({
  onBack,
  onStartPractice,
  stageNumber,
  currentTLevel,
  sessionType = 'meditation',
  showDuration = true
}) => {
  const [selectedPosture, setSelectedPosture] = useState<string>('');
  
  // 🧘 SAME 9 POSTURES - From your existing components
  const postures = [
    { id: 'chair', name: 'Chair Sitting', description: 'Sitting upright on a chair with feet flat on the floor', icon: '🪑' },
    { id: 'cushion', name: 'Cushion Sitting', description: 'Sitting cross-legged on a meditation cushion', icon: '🧘' },
    { id: 'seiza', name: 'Seiza Position', description: 'Kneeling with weight resting on cushion or bench', icon: '🙏' },
    { id: 'burmese', name: 'Burmese Position', description: 'Sitting with both legs bent and resting on the floor', icon: '🕉️' },
    { id: 'lotus', name: 'Half Lotus', description: 'One foot resting on the opposite thigh', icon: '🧘‍♂️' },
    { id: 'full-lotus', name: 'Full Lotus', description: 'Both feet resting on opposite thighs', icon: '🧘‍♀️' },
    { id: 'lying', name: 'Lying Down', description: 'Lying flat on back with arms at sides', icon: '🛏️' },
    { id: 'standing', name: 'Standing', description: 'Standing with feet shoulder-width apart', icon: '🧍' },
    { id: 'other', name: 'Other', description: 'Another posture not listed here', icon: '❓' }
  ];

  // 🎯 SMART LOGIC - Handles both your current patterns
  const getDisplayInfo = () => {
    // If currentTLevel is provided (Stage1PostureSelection.tsx pattern)
    if (currentTLevel) {
      return {
        title: `Seeker Practice Setup - ${currentTLevel}`,
        stageName: 'Seeker',
        duration: getDurationFromTLevel(currentTLevel),
        practiceType: 'Physical Stillness',
        instructions: 'Tracking your posture helps identify which positions work best for your physical stillness practice.'
      };
    }
    
    // If stageNumber is provided (PostureSelection.tsx pattern)  
    if (stageNumber) {
      return {
        title: `${getStageName(stageNumber)} Practice Setup`,
        stageName: getStageName(stageNumber),
        duration: null, // General version doesn't show duration
        practiceType: stageNumber === 1 ? 'Physical Stillness' : 'PAHM Practice',
        instructions: 'Tracking your posture helps identify which positions work best for your practice.'
      };
    }
    
    // Fallback
    return {
      title: 'Practice Setup',
      stageName: 'Practice',
      duration: null,
      practiceType: 'Practice',
      instructions: 'Choose your preferred posture for this session.'
    };
  };

  // 📝 FUNCTIONS FROM YOUR EXISTING CODE
  const getStageName = (stage: number): string => {
    switch (stage) {
      case 1: return "Seeker";
      case 2: return "PAHM Trainer";
      case 3: return "PAHM Beginner";
      case 4: return "PAHM Practitioner";
      case 5: return "PAHM Master";
      case 6: return "PAHM Illuminator";
      default: return "Practice";
    }
  };

  const getDurationFromTLevel = (tLevel: string): string => {
    switch(tLevel) {
      case 'T1': return '10 minutes';
      case 'T2': return '15 minutes';
      case 'T3': return '20 minutes';
      case 'T4': return '25 minutes';
      case 'T5': return '30 minutes';
      default: return '10 minutes';
    }
  };

  // 🎮 HANDLERS - Same as your existing code
  const handlePostureSelect = (postureId: string) => {
    setSelectedPosture(postureId);
  };
     
  const handleStartPractice = () => {
    if (selectedPosture) {
      onStartPractice(selectedPosture);
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      {/* 📱 HEADER - Adapts based on props */}
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
            {displayInfo.title}
          </h1>
        </div>
      </header>

      <main style={{
        padding: 'clamp(20px, 4vw, 40px)',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {/* 📊 T-LEVEL SECTION - Only shows when currentTLevel provided */}
        {currentTLevel && displayInfo.duration && showDuration && (
          <div style={{
            textAlign: 'center',
            marginBottom: '32px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: 'clamp(24px, 4vw, 32px)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{
              fontSize: 'clamp(24px, 5vw, 36px)',
              fontWeight: '700',
              margin: '0 0 12px 0',
              color: 'white'
            }}>
              {currentTLevel} Practice
            </h2>
            <p style={{ 
              fontSize: 'clamp(16px, 3vw, 20px)', 
              margin: '0',
              color: 'white',
              opacity: 0.95,
              fontWeight: '500'
            }}>
              {displayInfo.duration} of {displayInfo.practiceType}
            </p>
          </div>
        )}

        {/* 📝 INSTRUCTIONS */}
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
            {displayInfo.instructions}
          </p>
        </div>

        {/* 🧘 POSTURE GRID - Same as your existing code */}
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

        {/* ▶️ START BUTTON */}
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

      {/* 📱 RESPONSIVE CSS */}
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

export default UniversalPostureSelection;