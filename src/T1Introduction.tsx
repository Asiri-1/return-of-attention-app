import React from 'react';
import './StageLevelIntroduction.css';

interface T1IntroductionProps {
  onComplete: () => void;
  onBack: () => void;
}

const T1Introduction: React.FC<T1IntroductionProps> = ({
  onComplete,
  onBack
}) => {
  const stageTitle = "Seeker: Physical Readiness";
  
  return (
    <div className="stage-level-introduction">
      <div className="stage-instructions-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <h1>{stageTitle}</h1>
      </div>
      
      <div className="introduction-content">
        <div className="slide-container">
          <h2>Your First Goal</h2>
          <p>
            Begin with T1: three 10-minute sessions of physical stillness. 
            Once you can maintain stillness comfortably for this duration, 
            you'll progress to longer periods.
          </p>
          
          <div className="slide-progress">
            <div className="progress-dot active" />
          </div>

          {/* ✅ MOVED: Navigation buttons now below progress dots with blue styling */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            gap: '16px'
          }}>
            <button 
              onClick={onBack}
              aria-label="Go back"
              style={{
                background: 'rgba(102, 126, 234, 0.1)',
                color: '#667eea',
                border: '2px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                minWidth: '100px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              ← Back
            </button>
            
            <button 
              onClick={onComplete}
              aria-label="Begin practice"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                minWidth: '180px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
              }}
            >
              Begin Practice →
            </button>
          </div>
        </div>
        
        {/* ✅ IMPROVED: Progress indicator now integrated above navigation */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '2px',
          marginTop: '24px',
          overflow: 'hidden'
        }}>
          <div 
            style={{ 
              width: '100%', // Single slide, so 100% complete
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default T1Introduction;