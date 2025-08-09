// ✅ FIXED Stage1Wrapper.tsx - Uses UserContext session tracking methods
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ For general practice recording
import { useUser } from './contexts/user/UserContext'; // ✅ For session counting that persists
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

  // ✅ FIXED: Use UserContext for session counting that persists
  const { 
    getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
    incrementT1Sessions, incrementT2Sessions, incrementT3Sessions, incrementT4Sessions, incrementT5Sessions,
    isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete,
    userProfile, updateStageProgress // Use updateStageProgress instead of updateProfile
  } = useUser();

  // ✅ Keep PracticeContext for general session recording
  const { addPracticeSession } = usePractice();

  // ✅ FIXED: Calculate T-stage status using UserContext session counts
  const calculateTStageStatus = useCallback((tStage: string): TStageInfo => {
    try {
      let completedSessions = 0;
      let isCompleted = false;
      
      // Get session counts from UserContext (these persist after logout!)
      switch (tStage) {
        case 'T1':
          completedSessions = getT1Sessions();
          isCompleted = isT1Complete();
          break;
        case 'T2':
          completedSessions = getT2Sessions();
          isCompleted = isT2Complete();
          break;
        case 'T3':
          completedSessions = getT3Sessions();
          isCompleted = isT3Complete();
          break;
        case 'T4':
          completedSessions = getT4Sessions();
          isCompleted = isT4Complete();
          break;
        case 'T5':
          completedSessions = getT5Sessions();
          isCompleted = isT5Complete();
          break;
      }
      
      // Simple access logic
      let hasAccess = true;
      if (tStage !== 'T1') {
        const accessMap: { [key: string]: () => boolean } = {
          'T2': isT1Complete,
          'T3': isT2Complete, 
          'T4': isT3Complete,
          'T5': isT4Complete
        };
        const checkAccess = accessMap[tStage];
        hasAccess = checkAccess ? checkAccess() : false;
      }
      
      let status: 'locked' | 'available' | 'completed';
      if (isCompleted) {
        status = 'completed';
      } else if (hasAccess) {
        status = 'available';
      } else {
        status = 'locked';
      }

      const tStageLevel = parseInt(tStage[1]);
      const expectedDuration = 10 + (tStageLevel - 1) * 5; // T1=10, T2=15, etc.

      return {
        id: tStage,
        title: `${tStage.toUpperCase()}: Physical Stillness`,
        duration: `${expectedDuration} min`,
        status,
        completedSessions,
        requiredSessions: 3
      };
    } catch (error) {
      console.error('Error calculating T-stage status:', error);
      return {
        id: tStage,
        title: `${tStage.toUpperCase()}: Physical Stillness`,
        duration: '10 min',
        status: 'locked',
        completedSessions: 0,
        requiredSessions: 3
      };
    }
  }, [getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions,
      isT1Complete, isT2Complete, isT3Complete, isT4Complete, isT5Complete]);

  // ✅ FIXED: Load stages using UserContext data
  useEffect(() => {
    const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
    setTStages(stages);
  }, [calculateTStageStatus]);

  // ✅ FIXED: Handle session recording with BOTH systems
  const handleSessionRecord = async (sessionData: any) => {
    try {
      console.log('🎯 Recording T-session:', sessionData);
      
      // 1. ✅ CRITICAL: Increment session count in UserContext (persists after logout)
      const tStage = sessionData.tStage;
      let sessionCount = 0;
      
      switch (tStage) {
        case 'T1':
          sessionCount = await incrementT1Sessions();
          console.log(`📊 T1 Sessions: ${sessionCount}/3`);
          break;
        case 'T2':
          sessionCount = await incrementT2Sessions();
          console.log(`📊 T2 Sessions: ${sessionCount}/3`);
          break;
        case 'T3':
          sessionCount = await incrementT3Sessions();
          console.log(`📊 T3 Sessions: ${sessionCount}/3`);
          break;
        case 'T4':
          sessionCount = await incrementT4Sessions();
          console.log(`📊 T4 Sessions: ${sessionCount}/3`);
          break;
        case 'T5':
          sessionCount = await incrementT5Sessions();
          console.log(`📊 T5 Sessions: ${sessionCount}/3`);
          break;
      }
      
      // 2. ✅ ALSO: Record to PracticeContext for detailed session history
      if (addPracticeSession) {
        const tStageLevel = parseInt(sessionData.tStage?.[1]) || 1;
        const expectedDuration = sessionData.duration || 10;
        
        await addPracticeSession({
          stageLevel: tStageLevel,
          sessionType: 'meditation' as const,
          duration: expectedDuration,
          timestamp: new Date().toISOString(),
          environment: {
            posture: sessionData.posture || 'seated',
            location: 'indoor',
            lighting: 'natural',
            sounds: 'quiet'
          },
          rating: sessionData.completed ? 3 : 2,
          notes: `${sessionData.tStage || `T${tStageLevel}`} practice session`
        });
      }
      
      // 3. ✅ Update stages display
      setTimeout(() => {
        const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
        setTStages(stages);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error recording session:', error);
    }
  };

  // ✅ Handle T-stage selection
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

  // ✅ T-Stage Component with Firebase Flow
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

    // ✅ FIXED: Handle practice completion with proper session tracking
    const handlePracticeComplete = async () => {
      try {
        console.log('🚀 Practice completed!');
        
        // ✅ CRITICAL: Record session using UserContext (this makes it persist!)
        await handleSessionRecord({ 
          tStage, 
          completed: true,
          duration: getDuration(tStage),
          posture: practiceData?.posture || 'seated'
        });
        
        // ✅ Check for T5 completion and Stage 1 unlock
        const isT5Completion = tStage === 'T5' && isT5Complete();
        if (isT5Completion) {
          const currentCompletedStages = userProfile?.stageProgress?.completedStages || [];
          
          await updateStageProgress({
            completedStages: [...currentCompletedStages, 1],
            currentStage: 2, // Unlock Stage 2
            t5Completed: true
          });
          
          console.log('🎉 Stage 1 completed! Stage 2 unlocked!');
        }

        // Navigate to reflection
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
      } catch (error) {
        console.error('Error completing practice:', error);
        // Still navigate to reflection
        navigate('/practice-reflection', {
          state: {
            tLevel: tStage,
            duration: getDuration(tStage),
            posture: practiceData?.posture || 'seated',
            completed: true,
            fromStage1: true
          }
        });
      }
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