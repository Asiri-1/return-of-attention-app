// ✅ Fixed Stage1Wrapper.tsx - All TypeScript errors resolved
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useProgressiveOnboarding } from './hooks/useProgressiveOnboarding';
import { 
  QuestionnaireRequiredModal, 
  SelfAssessmentRequiredModal, 
  ProgressRequiredModal 
} from './components/OnboardingModals';

// ✅ Import your existing T-components (directly from src folder)
import T1Introduction from './T1Introduction';
import T1PracticeRecorder from './T1PracticeRecorder';
import T2Introduction from './T2Introduction';
import T2PracticeRecorder from './T2PracticeRecorder';
import T3Introduction from './T3Introduction';
import T3PracticeRecorder from './T3PracticeRecorder';
import T4Introduction from './T4Introduction';
import T4PracticeRecorder from './T4PracticeRecorder';
import T5Introduction from './T5Introduction';
import T5PracticeRecorder from './T5PracticeRecorder';

import './Stage1Wrapper.css';

interface TStageInfo {
  id: string;
  title: string;
  duration: string;
  status: 'locked' | 'available' | 'completed';
  completedSessions: number;
  requiredSessions: number;
}

const Stage1Wrapper: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams();
  
  const {
    checkTStageAccess,
    showQuestionnaireModal,
    showSelfAssessmentModal,
    showProgressModal,
    progressRequirement,
    setShowQuestionnaireModal,
    setShowSelfAssessmentModal,
    setShowProgressModal,
    recheckStatus
  } = useProgressiveOnboarding();

  const [tStages, setTStages] = useState<TStageInfo[]>([]);

  // ✅ Calculate T-stage completion status
  const calculateTStageStatus = React.useCallback((tStage: string): TStageInfo => {
    const sessions = JSON.parse(localStorage.getItem(`${tStage}Sessions`) || '[]');
    const completedSessions = sessions.filter((s: any) => s.isCompleted).length;
    const requiredSessions = 3;
    const isCompleted = localStorage.getItem(`${tStage}Complete`) === 'true';
    
    const access = checkTStageAccess(tStage);
    
    let status: 'locked' | 'available' | 'completed';
    if (isCompleted) {
      status = 'completed';
    } else if (access.allowed) {
      status = 'available';
    } else {
      status = 'locked';
    }

    const durations: { [key: string]: string } = {
      'T1': '10 min',
      'T2': '15 min', 
      'T3': '20 min',
      'T4': '25 min',
      'T5': '30 min'
    };

    return {
      id: tStage,
      title: `${tStage.toUpperCase()}: Physical Stillness`,
      duration: durations[tStage] || '10 min',
      status,
      completedSessions,
      requiredSessions
    };
  }, [checkTStageAccess]);

  // ✅ Update T-stage status when component mounts or localStorage changes
  useEffect(() => {
    const updateTStages = () => {
      const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
      setTStages(stages);
    };

    updateTStages();
    
    // Listen for localStorage changes
    const handleStorageChange = () => {
      updateTStages();
      recheckStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [calculateTStageStatus, recheckStatus]);

  // ✅ Handle T-stage selection with access checking
  const handleTStageSelect = (tStage: string) => {
    const access = checkTStageAccess(tStage);
    if (access.allowed) {
      navigate(`/stage1/${tStage}`);
    }
    // If not allowed, modals will be triggered by checkTStageAccess
  };

  // ✅ Handle session recording for any T-stage
  const handleSessionRecord = (sessionData: any) => {
    console.log('Session recorded:', sessionData);
    // Trigger status update
    const updateTStages = () => {
      const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
      setTStages(stages);
    };
    updateTStages();
  };

  // ✅ T-Stage Overview Component
  const TStageOverview: React.FC = () => (
    <div className="stage1-wrapper">
      <div className="stage-header">
        <button 
          className="back-button" 
          onClick={() => navigate('/home')}
        >
          ← Back to Home
        </button>
        <h1>Stage 1: Seeker - Physical Readiness</h1>
        <p className="stage-description">
          Develop the physical foundation for meditation through progressive 
          stillness training from 10 to 30 minutes.
        </p>
      </div>

      <div className="t-stages-grid">
        {tStages.map((tStage) => (
          <div 
            key={tStage.id}
            className={`t-stage-card ${tStage.status}`}
            onClick={() => handleTStageSelect(tStage.id)}
          >
            <div className="t-stage-header">
              <h3>{tStage.title}</h3>
              <span className={`status-badge ${tStage.status}`}>
                {tStage.status === 'completed' && '✅ Complete'}
                {tStage.status === 'available' && '🎯 Available'}
                {tStage.status === 'locked' && '🔒 Locked'}
              </span>
            </div>
            
            <div className="t-stage-info">
              <p className="duration">Duration: {tStage.duration}</p>
              <div className="progress-info">
                <span>Sessions: {tStage.completedSessions}/{tStage.requiredSessions}</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${(tStage.completedSessions / tStage.requiredSessions) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            
            {tStage.status === 'locked' && (
              <div className="requirement-hint">
                Complete previous stage to unlock
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ✅ T-Stage Component Wrapper
  const TStageComponent: React.FC<{ tStage: string }> = ({ tStage }) => {
    const [currentView, setCurrentView] = useState('introduction');
    
    const getIntroductionComponent = () => {
      const commonProps = {
        onComplete: () => setCurrentView('practice'),
        onBack: () => navigate('/stage1')
      };

      switch (tStage) {
        case 'T1': return <T1Introduction {...commonProps} />;
        case 'T2': return <T2Introduction {...commonProps} />;
        case 'T3': return <T3Introduction {...commonProps} />;
        case 'T4': return <T4Introduction {...commonProps} />;
        case 'T5': return <T5Introduction {...commonProps} />;
        default: return <div>T-Stage not found</div>;
      }
    };

    const getPracticeRecorderComponent = () => {
      const commonProps = {
        onRecordSession: handleSessionRecord
      };

      switch (tStage) {
        case 'T1': return <T1PracticeRecorder {...commonProps} />;
        case 'T2': return <T2PracticeRecorder {...commonProps} />;
        case 'T3': return <T3PracticeRecorder {...commonProps} />;
        case 'T4': return <T4PracticeRecorder {...commonProps} />;
        case 'T5': return <T5PracticeRecorder {...commonProps} />;
        default: return null;
      }
    };

    return (
      <div className="t-stage-container">
        {currentView === 'introduction' && getIntroductionComponent()}
        {currentView === 'practice' && (
          <div>
            {/* Your practice interface would go here */}
            <div className="practice-placeholder">
              <h2>{tStage} Practice Session</h2>
              <p>Practice interface for {tStage} would be rendered here.</p>
              <button onClick={() => setCurrentView('introduction')}>
                Back to Introduction
              </button>
            </div>
          </div>
        )}
        
        {/* ✅ Always include the practice recorder */}
        {getPracticeRecorderComponent()}
      </div>
    );
  };

  return (
    <div className="stage1-container">
      <Routes>
        <Route path="/" element={<TStageOverview />} />
        <Route path="/T1" element={<TStageComponent tStage="T1" />} />
        <Route path="/T2" element={<TStageComponent tStage="T2" />} />
        <Route path="/T3" element={<TStageComponent tStage="T3" />} />
        <Route path="/T4" element={<TStageComponent tStage="T4" />} />
        <Route path="/T5" element={<TStageComponent tStage="T5" />} />
        <Route path="*" element={<TStageOverview />} />
      </Routes>

      {/* ✅ Progressive Onboarding Modals */}
      <QuestionnaireRequiredModal 
        isOpen={showQuestionnaireModal}
        onClose={() => setShowQuestionnaireModal(false)}
      />
      
      <SelfAssessmentRequiredModal 
        isOpen={showSelfAssessmentModal}
        onClose={() => setShowSelfAssessmentModal(false)}
      />
      
      <ProgressRequiredModal 
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        requirement={progressRequirement}
      />
    </div>
  );
};

export default Stage1Wrapper;