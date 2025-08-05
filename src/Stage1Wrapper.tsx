// ✅ Firebase-Only Stage1Wrapper.tsx - No localStorage/sessionStorage conflicts
// File: src/Stage1Wrapper.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { usePractice } from './contexts/practice/PracticeContext'; // ✅ Firebase-only practice context
import { useUser } from './contexts/user/UserContext'; // ✅ Firebase-only user context
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

  // ✅ FIREBASE-ONLY: Use contexts for session management
  const { sessions, addPracticeSession } = usePractice();
  const { userProfile, updateProfile } = useUser();

  // ✅ FIREBASE-ONLY: Calculate T-stage status from Firebase data
  const calculateTStageStatus = useCallback((tStage: string): TStageInfo => {
    try {
      // Get sessions from Firebase - use only existing properties
      const tStageLevel = parseInt(tStage[1]);
      const tStageSessions = sessions?.filter(s => 
        s.stageLevel === tStageLevel && s.sessionType === 'meditation'
      ) || [];
      
      // Consider sessions with duration >= 80% of expected duration as completed
      const expectedDuration = 10 + (tStageLevel - 1) * 5; // T1=10, T2=15, etc.
      const completedSessions = tStageSessions.filter(s => 
        s.duration >= (expectedDuration * 0.8) // 80% completion threshold
      ).length;
      
      // Check completion from Firebase user profile - use safe property access
      const isCompleted = userProfile && 'completedStages' in userProfile && 
        Array.isArray(userProfile.completedStages) && 
        userProfile.completedStages.includes(tStageLevel);
      
      // Simple access logic
      let hasAccess = true;
      if (tStage !== 'T1') {
        const previousStageMap: { [key: string]: string } = {
          'T2': 'T1', 'T3': 'T2', 'T4': 'T3', 'T5': 'T4'
        };
        const previousStage = previousStageMap[tStage];
        if (previousStage) {
          const prevStageLevel = parseInt(previousStage[1]);
          const previousSessions = sessions?.filter(s => 
            s.stageLevel === prevStageLevel && s.sessionType === 'meditation'
          ) || [];
          const prevExpectedDuration = 10 + (prevStageLevel - 1) * 5;
          const prevCompleted = previousSessions.filter(s => 
            s.duration >= (prevExpectedDuration * 0.8)
          ).length;
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
        duration: `${expectedDuration} min`,
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
  }, [sessions, userProfile]);

  // ✅ FIREBASE-ONLY: Load stages from Firebase data
  useEffect(() => {
    if (sessions !== undefined && userProfile !== undefined) {
      const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
      setTStages(stages);
    }
  }, [sessions, userProfile, calculateTStageStatus]);

  // ✅ FIREBASE-ONLY: Handle session recording 
  const handleSessionRecord = async (sessionData: any) => {
    try {
      console.log('Recording session to Firebase:', sessionData);
      
      // Record session to Firebase using only existing properties
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
          rating: sessionData.completed ? 3 : 2, // T-levels get basic rating
          notes: `${sessionData.tStage || `T${tStageLevel}`} practice session`
        });
      }
      
      // Update stages after recording
      setTimeout(() => {
        if (sessions !== undefined && userProfile !== undefined) {
          const stages = ['T1', 'T2', 'T3', 'T4', 'T5'].map(calculateTStageStatus);
          setTStages(stages);
        }
      }, 100);
    } catch (error) {
      console.error('Error recording session to Firebase:', error);
    }
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

  // ✅ FIREBASE-ONLY: T-Stage Component with Firebase Flow
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

    // ✅ FIREBASE-ONLY: Handle posture selection
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

    // ✅ FIREBASE-ONLY: Handle practice completion
    const handlePracticeComplete = async () => {
      try {
        console.log('🚀 Practice completed!');
        
        // Record session completion to Firebase
        await handleSessionRecord({ 
          tStage, 
          completed: true,
          duration: getDuration(tStage),
          posture: practiceData?.posture || 'seated'
        });
        
        // Check for T5 completion and update Firebase
        const isT5Completion = tStage === 'T5';
        if (isT5Completion) {
          // Use safe property access and updating
          const currentCompletedStages = (userProfile && 'completedStages' in userProfile && 
            Array.isArray(userProfile.completedStages)) ? userProfile.completedStages : [];
          
          await updateProfile({
            completedStages: [...currentCompletedStages, 5],
            currentStage: 2, // Unlock Stage 2
            lastCompletedStage: 1
          } as any);
          
          console.log('🎉 T5 completed, Stage 1 complete in Firebase!');
        }

        // Navigate to practice reflection with Firebase data
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