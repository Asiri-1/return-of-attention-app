// ✅ FIXED HappinessTrackerPage.tsx - No Unused Variables
// File: src/components/HappinessTrackerPage.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useHappinessCalculation } from '../hooks/useHappinessCalculation';
import { useUser } from '../contexts/user/UserContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useAnalytics } from '../contexts/analytics/AnalyticsContext';

const HappinessTrackerPage = React.memo(() => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { 
    userProgress,
    componentBreakdown,
    isCalculating,
    emotionalNotes,
    questionnaire,
    selfAssessment,
    forceRecalculation
  } = useHappinessCalculation();

  const {
    sessions,
    getCurrentStage,
    getTotalPracticeHours,
    getStageProgress
  } = usePractice();

  const { refreshAnalytics } = useAnalytics();

  const [showDebug, setShowDebug] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Fixed: Added proper typing for tLevel parameter
  const getTLevelSessions = useCallback((tLevel: string): number => {
    if (!sessions || sessions.length === 0) return 0;
    return sessions.filter((s: any) => 
      (s.tLevel === tLevel || s.level === tLevel.toLowerCase()) && 
      s.completed !== false && 
      s.sessionType === 'meditation'
    ).length;
  }, [sessions]);

  const tLevelProgress = useMemo(() => {
    return {
      T1: getTLevelSessions('T1'),
      T2: getTLevelSessions('T2'),
      T3: getTLevelSessions('T3'),
      T4: getTLevelSessions('T4'),
      T5: getTLevelSessions('T5')
    };
  }, [getTLevelSessions]);

  const tLevelCompletion = useMemo(() => {
    return {
      isT1Complete: tLevelProgress.T1 >= 3,
      isT2Complete: tLevelProgress.T2 >= 3,
      isT3Complete: tLevelProgress.T3 >= 3,
      isT4Complete: tLevelProgress.T4 >= 3,
      isT5Complete: tLevelProgress.T5 >= 3
    };
  }, [tLevelProgress]);

  const getStageHours = useCallback((stageNum: number): number => {
    try {
      const stageData = getStageProgress(stageNum);
      return stageData.completed;
    } catch (error) {
      console.error(`Error getting stage ${stageNum} hours:`, error);
      return 0;
    }
  }, [getStageProgress]);

  const stageHoursProgress = useMemo(() => {
    return {
      stage1: getStageHours(1),
      stage2: getStageHours(2),
      stage3: getStageHours(3),
      stage4: getStageHours(4),
      stage5: getStageHours(5),
      stage6: getStageHours(6)
    };
  }, [getStageHours]);

  const stageCompletion = useMemo(() => {
    return {
      isStage1Complete: stageHoursProgress.stage1 >= 3,
      isStage2Complete: stageHoursProgress.stage2 >= 5,
      isStage3Complete: stageHoursProgress.stage3 >= 10,
      isStage4Complete: stageHoursProgress.stage4 >= 20,
      isStage5Complete: stageHoursProgress.stage5 >= 25,
      isStage6Complete: stageHoursProgress.stage6 >= 30
    };
  }, [stageHoursProgress]);

  const quickStats = useMemo(() => {
    const totalSessions = sessions?.length || 0;
    const totalHours = getTotalPracticeHours();
    const currentStage = getCurrentStage();
    const hasData = userProgress?.hasMinimumData || false;
    const hasAnyData = totalSessions > 0 || questionnaire?.completed || selfAssessment?.completed;

    return {
      totalSessions,
      totalHours: totalHours.toFixed(1),
      currentStage,
      hasData,
      hasAnyData,
      happinessPoints: userProgress?.happiness_points || 0,
      dataCompleteness: userProgress?.dataCompleteness || {
        questionnaire: questionnaire?.completed || false,
        selfAssessment: selfAssessment?.completed || false,
        practiceSessions: totalSessions > 0
      }
    };
  }, [sessions, getTotalPracticeHours, getCurrentStage, questionnaire?.completed, 
      selfAssessment?.completed, userProgress]);

  const stageProgressInfo = useMemo(() => {
    const currentStage = getCurrentStage();
    const stageRequirements = [3, 5, 10, 20, 25, 30];
    const currentRequirement = stageRequirements[currentStage - 1] || 3;
    
    let currentHours = 0;
    
    switch (currentStage) {
      case 1: currentHours = stageHoursProgress.stage1; break;
      case 2: currentHours = stageHoursProgress.stage2; break;
      case 3: currentHours = stageHoursProgress.stage3; break;
      case 4: currentHours = stageHoursProgress.stage4; break;
      case 5: currentHours = stageHoursProgress.stage5; break;
      case 6: currentHours = stageHoursProgress.stage6; break;
    }
    
    const progressPercent = Math.min((currentHours / currentRequirement) * 100, 100);
    
    return {
      currentStage,
      currentHours,
      currentRequirement,
      progressPercent,
      isComplete: progressPercent >= 100
    };
  }, [getCurrentStage, stageHoursProgress]);

  // Handlers
  const handleDebugToggle = useCallback(() => setShowDebug(prev => !prev), []);
  
  const handleDebugCalculation = useCallback(() => {
    console.log('🔍 Debug Calculation - Current Stats:', {
      totalSessions: quickStats.totalSessions,
      totalHours: quickStats.totalHours,
      currentStage: stageProgressInfo.currentStage,
      happinessPoints: quickStats.happinessPoints,
      tLevelProgress,
      stageHoursProgress,
      source: 'practicecontext-single-point'
    });
  }, [quickStats, stageProgressInfo, tLevelProgress, stageHoursProgress]);

  const handleLogProgress = useCallback(() => {
    console.log('📊 Current Progress (Single-Point):', {
      user: currentUser?.uid,
      sessions: quickStats.totalSessions,
      hours: quickStats.totalHours,
      stage: stageProgressInfo.currentStage,
      happiness: quickStats.happinessPoints,
      completeness: quickStats.dataCompleteness,
      tLevels: tLevelProgress,
      stageHours: stageHoursProgress,
      architecture: 'single-point-v3'
    });
  }, [currentUser, quickStats, stageProgressInfo, tLevelProgress, stageHoursProgress]);

  const handleTestComponents = useCallback(() => {
    console.log('🧪 Testing Components (Single-Point):', {
      stage: stageProgressInfo,
      tLevels: tLevelCompletion,
      stages: stageCompletion,
      dataSource: 'practicecontext'
    });
  }, [stageProgressInfo, tLevelCompletion, stageCompletion]);

  const handleStartQuestionnaire = useCallback(() => navigate('/questionnaire'), [navigate]);
  const handleStartSelfAssessment = useCallback(() => navigate('/self-assessment'), [navigate]);
  const handleStartPractice = useCallback(() => {
    const currentStage = getCurrentStage();
    if (currentStage === 1) {
      navigate('/stage1');
    } else {
      navigate(`/stage${currentStage}`);
    }
  }, [navigate, getCurrentStage]);
  const handleViewAnalytics = useCallback(() => navigate('/analytics'), [navigate]);
  const handleForceRecalculation = useCallback(() => {
    if (forceRecalculation) {
      forceRecalculation();
    }
    refreshAnalytics();
  }, [forceRecalculation, refreshAnalytics]);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui' }}>
      {/* Simple Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
          Happiness Tracker
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          Track your present attention practice progress
        </p>
      </div>

      {/* Loading */}
      {isCalculating && (
        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', marginBottom: '20px' }}>
          <div>Calculating your progress...</div>
          <button 
            onClick={handleForceRecalculation}
            style={{ marginTop: '10px', padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Force Refresh
          </button>
        </div>
      )}

      {/* No Data State */}
      {!isCalculating && !quickStats.hasData && (
        <div style={{ padding: '40px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
            Welcome! Complete these to start tracking:
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {quickStats.dataCompleteness.questionnaire ? '✅' : '📝'} Questionnaire
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                Share your current state and goals
              </p>
              {!quickStats.dataCompleteness.questionnaire && (
                <button 
                  onClick={handleStartQuestionnaire}
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Start Questionnaire
                </button>
              )}
            </div>

            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {quickStats.dataCompleteness.selfAssessment ? '✅' : '🎯'} Self-Assessment
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                Understand your attachment patterns
              </p>
              {!quickStats.dataCompleteness.selfAssessment && (
                <button 
                  onClick={handleStartSelfAssessment}
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Start Assessment
                </button>
              )}
            </div>

            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {quickStats.dataCompleteness.practiceSessions ? '✅' : '🧘'} Practice
              </h3>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                Begin Stage {stageProgressInfo.currentStage} practice
              </p>
              {!quickStats.dataCompleteness.practiceSessions && (
                <button 
                  onClick={handleStartPractice}
                  style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Start Practice
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: '20px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px' }}>
            <strong>Requirements:</strong> Complete questionnaire + assessment OR 3+ practice sessions
          </div>
        </div>
      )}

      {/* Main Dashboard */}
      {!isCalculating && quickStats.hasData && (
        <>
          {/* Simple Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#007bff', marginBottom: '5px' }}>
                {quickStats.happinessPoints}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Happiness Points</div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745', marginBottom: '5px' }}>
                {quickStats.totalSessions}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Sessions</div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fd7e14', marginBottom: '5px' }}>
                {quickStats.totalHours}h
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>Practice Hours</div>
            </div>

            <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#6f42c1', marginBottom: '5px' }}>
                Stage {stageProgressInfo.currentStage}
              </div>
              <div style={{ color: '#666', fontSize: '14px' }}>
                {Math.round(stageProgressInfo.progressPercent)}% Complete
              </div>
            </div>
          </div>

          {/* Stage Progress */}
          <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '30px' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
              Stage {stageProgressInfo.currentStage} Progress
            </h3>
            <div style={{ backgroundColor: '#e9ecef', height: '20px', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
              <div 
                style={{ 
                  backgroundColor: '#007bff', 
                  height: '100%', 
                  width: `${stageProgressInfo.progressPercent}%`,
                  transition: 'width 0.3s ease'
                }}
              ></div>
            </div>
            <div style={{ color: '#666', fontSize: '14px' }}>
              {stageProgressInfo.currentHours.toFixed(1)} / {stageProgressInfo.currentRequirement} hours completed
              {!stageProgressInfo.isComplete && 
                ` (${(stageProgressInfo.currentRequirement - stageProgressInfo.currentHours).toFixed(1)}h remaining)`
              }
            </div>
          </div>

          {/* Simple Tabs */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ borderBottom: '1px solid #ddd', display: 'flex', gap: '0' }}>
              {['overview', 'pahm', 'components', 'insights'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    backgroundColor: activeTab === tab ? '#007bff' : 'transparent',
                    color: activeTab === tab ? 'white' : '#666',
                    cursor: 'pointer',
                    borderRadius: '6px 6px 0 0',
                    marginBottom: '-1px'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div style={{ padding: '20px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '6px', marginBottom: '30px' }}>
            {activeTab === 'overview' && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Overview</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>T-Level Progress:</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      T1: {tLevelProgress.T1}/3 {tLevelProgress.T1 >= 3 && '✅'}<br/>
                      T2: {tLevelProgress.T2}/3 {tLevelProgress.T2 >= 3 && '✅'}<br/>
                      T3: {tLevelProgress.T3}/3 {tLevelProgress.T3 >= 3 && '✅'}<br/>
                      T4: {tLevelProgress.T4}/3 {tLevelProgress.T4 >= 3 && '✅'}<br/>
                      T5: {tLevelProgress.T5}/3 {tLevelProgress.T5 >= 3 && '✅'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>User Level:</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {userProgress?.user_level || 'Active Seeker'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>Practice Streak:</div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      {userProgress?.practice_streak || 0} days
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pahm' && userProgress?.pahmAnalysis && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>PAHM Analysis</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>Present-Neutral Mastery:</div>
                    <div style={{ fontSize: '24px', color: '#007bff', fontWeight: 'bold' }}>
                      {Math.round((userProgress.pahmAnalysis.presentNeutralRatio || 0) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>Present-Moment Focus:</div>
                    <div style={{ fontSize: '24px', color: '#28a745', fontWeight: 'bold' }}>
                      {Math.round((userProgress.pahmAnalysis.presentMomentRatio || 0) * 100)}%
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>PAHM Score:</div>
                    <div style={{ fontSize: '24px', color: '#6f42c1', fontWeight: 'bold' }}>
                      {userProgress.pahmAnalysis.overallPAHMScore || 0}/100
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'components' && componentBreakdown && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Happiness Components</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {[
                    { label: 'PAHM Development', value: componentBreakdown.pahmDevelopment, weight: '30%' },
                    { label: 'Emotional Stability', value: componentBreakdown.emotionalStabilityProgress, weight: '20%' },
                    { label: 'Current Mood', value: componentBreakdown.currentMoodState, weight: '15%' },
                    { label: 'Mind Recovery', value: componentBreakdown.mindRecoveryEffectiveness, weight: '12%' },
                    { label: 'Emotional Regulation', value: componentBreakdown.emotionalRegulation, weight: '10%' },
                    { label: 'Attachment Flexibility', value: componentBreakdown.attachmentFlexibility, weight: '8%' }
                  ].map((component, index) => (
                    <div key={index} style={{ padding: '15px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
                      <div style={{ fontWeight: 'bold', color: '#333', fontSize: '14px' }}>{component.label}</div>
                      <div style={{ fontSize: '20px', color: '#007bff', fontWeight: 'bold' }}>
                        {Math.round(component.value || 0)}/100
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{component.weight} weight</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'insights' && userProgress?.pahmAnalysis?.insights && (
              <div>
                <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>Insights & Recommendations</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Current Insights:</h4>
                    <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666' }}>
                      {userProgress.pahmAnalysis.insights.map((insight, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#666' }}>Recommendations:</h4>
                    <ul style={{ listStyle: 'disc', paddingLeft: '20px', color: '#666' }}>
                      {userProgress.pahmAnalysis.recommendations?.map((rec, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
            <button 
              onClick={handleStartPractice}
              style={{ padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
            >
              Continue Stage {stageProgressInfo.currentStage}
            </button>
            <button 
              onClick={handleViewAnalytics}
              style={{ padding: '12px 24px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}
            >
              View Analytics
            </button>
          </div>

          {/* Debug Toggle */}
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleDebugToggle}
              style={{ padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {showDebug ? 'Hide' : 'Show'} Debug
            </button>
          </div>

          {/* Simple Debug Panel */}
          {showDebug && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px' }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Debug Info</h3>
              <div style={{ fontSize: '14px', fontFamily: 'monospace', color: '#666' }}>
                <div>Sessions: {sessions?.length || 0}</div>
                <div>Current Stage: {stageProgressInfo.currentStage}</div>
                <div>Total Hours: {quickStats.totalHours}</div>
                <div>Emotional Notes: {emotionalNotes?.length || 0}</div>
                <div>Architecture: Single-Point ✅</div>
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <button 
                  onClick={handleDebugCalculation}
                  style={{ margin: '5px', padding: '6px 12px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Debug Console
                </button>
                <button 
                  onClick={handleLogProgress}
                  style={{ margin: '5px', padding: '6px 12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Log Progress
                </button>
                <button 
                  onClick={handleTestComponents}
                  style={{ margin: '5px', padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Test Components
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default HappinessTrackerPage;