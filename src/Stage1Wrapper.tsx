// ✅ Stage1Wrapper.tsx - With Real T1 Components Restored
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import './Stage1Wrapper.css';

// ✅ Import your existing T-components
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

// ✅ Import your existing universal components
import UniversalPostureSelection from './components/shared/UI/UniversalPostureSelection';
import PracticeTimer from './PracticeTimer';

// Simple interfaces
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
  const [tStages, setTStages] = useState<TStageInfo[]>([]);

  // ✅ SIMPLE: Calculate T-stage status without complex dependencies
  const calculateTStageStatus = (tStage: string): TStageInfo => {
    try {
      const sessions = JSON.parse(localStorage.getItem(`${tStage}Sessions`) || '[]');
      const completedSessions = sessions.filter((s: any) => s.isCompleted).length;
      const isCompleted = localStorage.getItem(`${tStage}Complete`) === 'true';
      
      // Simple access logic
      let hasAccess = true;
      if (tStage !== 'T1') {
        const previousStageMap: { [key: string]: string } = {
          'T2': 'T1', 'T3': 'T2', 'T4': 'T3', 'T5': 'T4'
        };
        const previousStage = previousStageMap[tStage];
        if (previousStage) {
          const previousSessions = JSON.parse(localStorage.getItem(`${previousStage}Sessions`) || '[]');
          const prevCompleted = previousSessions.filter((s: any) => s.isCompleted).length;
          hasAccess = prevCompleted >= 3;
        }
      }
      
      let status: 'locked' | 'available' | 'completed';
      if (isCompleted) {
        status = 'completed';
      } else if (hasAccess) {
        status = 'available';
      } else {
        status = 'locked';
      }

      return {
        id: tStage,
        title: `${tStage.toUpperCase()}: Physical Stillness`,
        duration: `${10 + (parseInt(tStage[1]) - 1) * 5} min`,
        status,
        completedSessions,
        requiredSessions: 3
      };
    } catch (error) {
      return {
        id: tStage,
        title: `${tStage.toUpperCase()}: Physical Stillness`,
        duration: '10 min',
        status: 'locked',
        completedSessions: 0,
        requiredSessions: 3
      };
    }
  };

  // ✅ SIMPLE: Load stages on mount only
  useEffect(() => {
    const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
    setTStages(stages);
  }, []); // Empty dependency array - only run once

  // ✅ SIMPLE: Handle session recording 
  const handleSessionRecord = (sessionData: any) => {
    console.log('Session recorded:', sessionData);
    
    // Update stages after recording
    setTimeout(() => {
      const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
      setTStages(stages);
    }, 100);
  };

  // ✅ SIMPLE: Handle T-stage selection
  const handleTStageSelect = (tStage: string) => {
    const stageInfo = tStages.find(stage => stage.id === tStage);
    
    if (stageInfo?.status === 'available' || stageInfo?.status === 'completed') {
      navigate(`/stage1/${tStage}`);
    } else {
      alert(`Complete 3 previous stage sessions before accessing ${tStage}`);
    }
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

  // ✅ RESTORED: T-Stage Component with Real Flow
  const TStageComponent: React.FC<{ tStage: string }> = ({ tStage }) => {
    const [currentView, setCurrentView] = useState('introduction');
    const [practiceData, setPracticeData] = useState<any>(null);
    
    // Get T-level duration
    const getDuration = (stage: string) => {
      const durations: { [key: string]: number } = {
        'T1': 10, 'T2': 15, 'T3': 20, 'T4': 25, 'T5': 30
      };
      return durations[stage] || 10;
    };

    // ✅ Get introduction component
    const getIntroductionComponent = () => {
      const commonProps = {
        onComplete: () => setCurrentView('posture'),
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

    // ✅ Get practice recorder component
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

    // ✅ Handle posture selection
    const handlePostureSelected = (selectedPosture: string) => {
      sessionStorage.setItem('currentPosture', selectedPosture);
      sessionStorage.setItem('currentTLevel', tStage.toLowerCase());
      
      const duration = getDuration(tStage);
      const stageLevel = `${tStage}: Physical Stillness for ${duration} minutes`;
      
      setPracticeData({
        posture: selectedPosture,
        level: tStage.toLowerCase(),
        duration: duration,
        stageLevel: stageLevel
      });
      
      setCurrentView('practice');
    };

    // ✅ Handle practice completion
    const handlePracticeComplete = () => {
      console.log('🚀 Practice completed!');
      
      // Record session completion
      handleSessionRecord({ 
        tStage, 
        completed: true,
        duration: getDuration(tStage),
        posture: practiceData?.posture || 'seated'
      });
      
      // Navigate to practice reflection
      const reflectionData = {
        level: tStage.toLowerCase(),
        targetDuration: getDuration(tStage),
        timeSpent: getDuration(tStage),
        isCompleted: true,
        completedAt: new Date().toISOString(),
        posture: practiceData?.posture || 'seated',
        stageLevel: practiceData?.stageLevel || `${tStage}: Physical Stillness`,
        fromStage1: true
      };
      
      sessionStorage.setItem('lastPracticeData', JSON.stringify(reflectionData));
      
      // Check for T5 completion
      const isT5Completion = tStage === 'T5';
      if (isT5Completion) {
        localStorage.setItem('T5Complete', 'true');
        localStorage.setItem('Stage1Complete', 'true');
        localStorage.setItem('Stage2Unlocked', 'true');
        console.log('🎉 T5 completed, Stage 1 complete!');
      }

      // Navigate to practice reflection
      navigate('/practice-reflection', {
        state: {
          tLevel: tStage,
          duration: getDuration(tStage),
          posture: practiceData?.posture || 'seated',
          stageLevel: practiceData?.stageLevel || `${tStage}: Physical Stillness`,
          completed: true,
          fromStage1: true,
          isT5Completion: isT5Completion
        }
      });
    };

    return (
      <div className="t-stage-container">
        {/* Introduction View */}
        {currentView === 'introduction' && getIntroductionComponent()}
        
        {/* Posture Selection View */}
        {currentView === 'posture' && (
          <UniversalPostureSelection
            onBack={() => setCurrentView('introduction')}
            onStartPractice={handlePostureSelected}
            currentTLevel={tStage}
            sessionType="meditation"
            showDuration={true}
          />
        )}
        
        {/* Practice View - Using PracticeTimer */}
        {currentView === 'practice' && practiceData && (
          <PracticeTimer
            onComplete={handlePracticeComplete}
            onBack={() => setCurrentView('posture')}
            stageLevel={practiceData.stageLevel}
            initialMinutes={practiceData.duration}
          />
        )}
        
        {/* Practice recorder - always included */}
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
    </div>
  );
};

export default Stage1Wrapper;