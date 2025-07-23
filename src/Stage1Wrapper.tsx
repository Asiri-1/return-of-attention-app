// ✅ Complete Stage1Wrapper.tsx - Universal Architecture Compatible
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
// 🚀 UPDATED: Use Universal Architecture compatible progressive onboarding
import { useProgressiveOnboarding } from './hooks/useProgressiveOnboarding';
import { 
  QuestionnaireRequiredModal, 
  SelfAssessmentRequiredModal, 
  ProgressRequiredModal 
} from './components/OnboardingModals';

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
  
  // ✅ WORKS: Progressive onboarding with Universal Architecture compatibility
  const {
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

  // ✅ Calculate T-stage completion status with real-time updates
  const calculateTStageStatus = React.useCallback((tStage: string): TStageInfo => {
    try {
      const sessions = JSON.parse(localStorage.getItem(`${tStage}Sessions`) || '[]');
      const completedSessions = sessions.filter((s: any) => s.isCompleted).length;
      const requiredSessions = 3;
      const isCompleted = localStorage.getItem(`${tStage}Complete`) === 'true';
      
      // ✅ WORKS: Inline access checking to avoid dependency issues
      const checkAccess = (stage: string): boolean => {
        try {
          // T1 is always accessible
          if (stage === 'T1') return true;
          
          // Check if previous stage has enough sessions
          const previousStageMap: { [key: string]: string } = {
            'T2': 'T1',
            'T3': 'T2', 
            'T4': 'T3',
            'T5': 'T4'
          };
          
          const previousStage = previousStageMap[stage];
          if (!previousStage) return true;
          
          const previousSessions = JSON.parse(localStorage.getItem(`${previousStage}Sessions`) || '[]');
          const completedSessions = previousSessions.filter((s: any) => s.isCompleted).length;
          
          return completedSessions >= 3;
        } catch (error) {
          console.warn(`Error checking ${stage} access:`, error);
          return true; // Default to accessible if error
        }
      };
      
      const hasAccess = checkAccess(tStage);
      
      let status: 'locked' | 'available' | 'completed';
      if (isCompleted) {
        status = 'completed';
      } else if (hasAccess) {
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
    } catch (error) {
      console.warn(`Error calculating status for ${tStage}:`, error);
      return {
        id: tStage,
        title: `${tStage.toUpperCase()}: Physical Stillness`,
        duration: '10 min',
        status: 'locked',
        completedSessions: 0,
        requiredSessions: 3
      };
    }
  }, []);

  // ✅ Update T-stage status when component mounts or localStorage changes
  useEffect(() => {
    const updateTStages = () => {
      const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
      setTStages(stages);
    };

    updateTStages();
    
    // Listen for localStorage changes and custom storage events
    const handleStorageChange = (event?: StorageEvent) => {
      updateTStages();
      recheckStatus();
    };

    // Listen for both storage events and custom events
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for immediate updates
    const handleCustomUpdate = () => {
      setTimeout(updateTStages, 50); // Small delay to ensure storage is written
    };
    
    window.addEventListener('sessionUpdate', handleCustomUpdate);
    window.addEventListener('stageProgressUpdate', handleCustomUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionUpdate', handleCustomUpdate);
      window.removeEventListener('stageProgressUpdate', handleCustomUpdate);
    };
  }, [calculateTStageStatus, recheckStatus]);

  // ✅ WORKS: Handle T-stage selection with simple checking
  const handleTStageSelect = (tStage: string) => {
    // ✅ Inline access checking to avoid dependency issues
    const checkAccess = (stage: string): boolean => {
      try {
        // T1 is always accessible
        if (stage === 'T1') return true;
        
        // Check if previous stage has enough sessions
        const previousStageMap: { [key: string]: string } = {
          'T2': 'T1',
          'T3': 'T2', 
          'T4': 'T3',
          'T5': 'T4'
        };
        
        const previousStage = previousStageMap[stage];
        if (!previousStage) return true;
        
        const previousSessions = JSON.parse(localStorage.getItem(`${previousStage}Sessions`) || '[]');
        const completedSessions = previousSessions.filter((s: any) => s.isCompleted).length;
        
        return completedSessions >= 3;
      } catch (error) {
        console.warn(`Error checking ${stage} access:`, error);
        return true; // Default to accessible if error
      }
    };

    const hasAccess = checkAccess(tStage);
    
    if (hasAccess) {
      console.log(`✅ Navigating to ${tStage}`);
      navigate(`/stage1/${tStage}`);
    } else {
      console.log(`❌ Access denied to ${tStage}`);
      // Show simple requirement message instead of complex modal
      const previousStageMap: { [key: string]: string } = {
        'T2': 'T1', 'T3': 'T2', 'T4': 'T3', 'T5': 'T4'
      };
      const previousStage = previousStageMap[tStage];
      setShowProgressModal(true);
      // Set a simple requirement message
      window.alert(`Complete 3 ${previousStage} sessions before accessing ${tStage}`);
    }
  };

  // ✅ Handle session recording for any T-stage
  const handleSessionRecord = (sessionData: any) => {
    console.log('Session recorded:', sessionData);
    
    // Force immediate update of T-stage status
    setTimeout(() => {
      const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
      setTStages(stages);
    }, 100);
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

  // ✅ T-Stage Component Wrapper - Perfect Navigation to Practice Reflection
  const TStageComponent: React.FC<{ tStage: string }> = ({ tStage }) => {
    const [currentView, setCurrentView] = useState('introduction');
    const [practiceData, setPracticeData] = useState<any>(null);
    
    // ✅ WORKS: Check access on component mount but don't redirect
    useEffect(() => {
      // Move the access check logic inside useEffect to avoid dependency issues
      const checkAccess = (stage: string): boolean => {
        try {
          // T1 is always accessible
          if (stage === 'T1') return true;
          
          // Check if previous stage has enough sessions
          const previousStageMap: { [key: string]: string } = {
            'T2': 'T1',
            'T3': 'T2', 
            'T4': 'T3',
            'T5': 'T4'
          };
          
          const previousStage = previousStageMap[stage];
          if (!previousStage) return true;
          
          const previousSessions = JSON.parse(localStorage.getItem(`${previousStage}Sessions`) || '[]');
          const completedSessions = previousSessions.filter((s: any) => s.isCompleted).length;
          
          return completedSessions >= 3;
        } catch (error) {
          console.warn(`Error checking ${stage} access:`, error);
          return true; // Default to accessible if error
        }
      };

      const hasAccess = checkAccess(tStage);
      if (!hasAccess) {
        console.warn(`No access to ${tStage}, but allowing anyway for admin testing`);
        // Don't redirect - allow access for testing
      }
    }, [tStage]);
    
    // Get T-level duration
    const getDuration = (stage: string) => {
      const durations: { [key: string]: number } = {
        'T1': 10, 'T2': 15, 'T3': 20, 'T4': 25, 'T5': 30
      };
      return durations[stage] || 10;
    };

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

    // ✅ Handle practice completion with proper navigation to practice reflection
    const handlePracticeComplete = React.useCallback(() => {
      console.log('🚀 Practice completed! Navigating to practice reflection...');
      
      // Record session completion
      handleSessionRecord({ 
        tStage, 
        completed: true,
        duration: getDuration(tStage),
        posture: practiceData?.posture || 'seated'
      });
      
      // Store practice data for reflection
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
      
      // ✅ WORKS: Check if this is T5 completion for special handling
      const isT5Completion = tStage === 'T5';
      if (isT5Completion) {
        console.log('🎉 T5 completion detected - setting all stage completion flags...');
        
        // ✅ Set individual T5 completion flags
        sessionStorage.setItem('t5Completed', 'true');
        localStorage.setItem('t5Completed', 'true');
        localStorage.setItem('t5Complete', 'true');  // Lowercase version
        localStorage.setItem('T5Complete', 'true');  // Uppercase version (for admin panel)
        
        // ✅ SET STAGE-LEVEL COMPLETION FLAGS (This was missing!)
        localStorage.setItem('Stage1Complete', 'true');
        localStorage.setItem('Stage2Unlocked', 'true');
        localStorage.setItem('currentStage', '2');
        
        // ✅ Set stage progress to allow Stage 2 access
        sessionStorage.setItem('stageProgress', '2');
        localStorage.setItem('devCurrentStage', '2');
        
        // Force current T level to be beyond T5 to ensure unlock
        sessionStorage.setItem('currentTLevel', 't6');
        
        console.log('✅ All stage completion flags set:');
        console.log('  - t5Complete: true');
        console.log('  - T5Complete: true');
        console.log('  - Stage1Complete: true');
        console.log('  - Stage2Unlocked: true');
        console.log('  - currentStage: 2');
        
        // ✅ Dispatch custom events to update UI immediately
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('stageProgressUpdate'));
        
        console.log('🎉 T5 completed, Stage 1 complete, Stage 2 unlocked!');
      }

      // ✅ Navigate to practice-reflection with proper timing
      setTimeout(() => {
        try {
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
          console.log('✅ Navigation to practice reflection completed successfully!');
        } catch (error) {
          console.error('❌ Navigation failed:', error);
          // Fallback navigation
          navigate('/immediate-reflection', {
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
        }
      }, 100);
      // navigate is stable from useNavigate hook, safe to exclude from deps
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tStage, practiceData]);

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
        
        {/* Practice View - Using PracticeTimer with unified storage */}
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

      {/* ✅ Progressive Onboarding Modals - Universal Architecture Compatible */}
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