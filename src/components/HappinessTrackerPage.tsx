// ✅ Fixed HappinessTrackerPage.tsx - Progressive Onboarding Integration
// File: src/components/HappinessTrackerPage.tsx

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';
import { useHappinessCalculation } from '../hooks/useHappinessCalculation';

const HappinessTrackerPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    userProgress,
    componentBreakdown,
    isCalculating,
    practiceSessions,
    emotionalNotes,
    questionnaire,
    selfAssessment,
    debugCalculation,
    logProgress,
    testComponents
  } = useHappinessCalculation();

  const [showDebug, setShowDebug] = useState(false);

  // ✅ FIXED: Quick stats with proper data validation
  const quickStats = useMemo(() => {
    const totalSessions = practiceSessions?.length || 0;
    const totalHours = practiceSessions?.reduce((sum: number, session: any) => sum + (session.duration || 0), 0) / 60 || 0;
    const hasData = userProgress.hasMinimumData;
    const hasAnyData = totalSessions > 0 || questionnaire?.completed || selfAssessment?.completed;

    return {
      totalSessions,
      totalHours: totalHours.toFixed(1),
      hasData,
      hasAnyData,
      happinessPoints: userProgress.happiness_points,
      dataCompleteness: userProgress.dataCompleteness
    };
  }, [practiceSessions, questionnaire?.completed, selfAssessment?.completed, userProgress]);

  // Memoized button handlers
  const handleDebugToggle = useCallback(() => {
    setShowDebug(prev => !prev);
  }, []);

  const handleDebugCalculation = useCallback(() => {
    debugCalculation();
  }, [debugCalculation]);

  const handleLogProgress = useCallback(() => {
    logProgress();
  }, [logProgress]);

  const handleTestComponents = useCallback(() => {
    testComponents();
  }, [testComponents]);

  // ✅ NEW: Navigation handlers for onboarding
  const handleStartQuestionnaire = useCallback(() => {
    navigate('/questionnaire');
  }, [navigate]);

  const handleStartSelfAssessment = useCallback(() => {
    navigate('/self-assessment');
  }, [navigate]);

  const handleStartPractice = useCallback(() => {
    navigate('/stage1');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* 🎯 PAGE HEADER */}
      <div className="bg-white shadow-sm border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🌟 Present Attention Progress</h1>
              <p className="text-gray-600 mt-1">Track your journey toward greater presence and awareness</p>
            </div>
            
            {/* 📊 Enhanced Stats Badge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl px-6 py-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-700">{quickStats.totalSessions}</div>
                  <div className="text-xs text-indigo-600 font-medium">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{quickStats.totalHours}h</div>
                  <div className="text-xs text-purple-600 font-medium">Practice Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-700">{quickStats.happinessPoints}</div>
                  <div className="text-xs text-pink-600 font-medium">Happiness Points</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ LOADING STATE */}
      {isCalculating && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-3xl p-8 text-center mb-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-indigo-700 mb-2">Calculating Your Present Attention Progress...</h2>
            <p className="text-gray-600">Using PAHM-centered analysis</p>
          </div>
        </div>
      )}

      {/* ✅ INSUFFICIENT DATA - Show onboarding guidance */}
      {!isCalculating && !quickStats.hasData && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-8 text-center border-2 border-blue-200">
            <div className="text-6xl mb-4">🧘</div>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">
              Welcome to Your Present Attention Journey!
            </h2>
            <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
              Your happiness tracking will appear here as you complete practice sessions, questionnaires, and self-assessments. 
              Present attention is a skill that develops through consistent practice - every moment of awareness counts!
            </p>
            
            {/* ✅ DATA COMPLETENESS INDICATOR */}
            <div className="bg-white rounded-2xl p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Complete Your Setup</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border-2 ${
                  quickStats.dataCompleteness.questionnaire 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-2">
                    {quickStats.dataCompleteness.questionnaire ? '✅' : '📝'}
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Questionnaire</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Share your current state and goals to establish your baseline
                  </p>
                  {!quickStats.dataCompleteness.questionnaire && (
                    <button
                      onClick={handleStartQuestionnaire}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Start Questionnaire
                    </button>
                  )}
                </div>
                
                <div className={`p-4 rounded-xl border-2 ${
                  quickStats.dataCompleteness.selfAssessment 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-2">
                    {quickStats.dataCompleteness.selfAssessment ? '✅' : '🎯'}
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Self-Assessment</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Understand your current attachment patterns and goals
                  </p>
                  {!quickStats.dataCompleteness.selfAssessment && (
                    <button
                      onClick={handleStartSelfAssessment}
                      className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      Take Assessment
                    </button>
                  )}
                </div>
                
                <div className={`p-4 rounded-xl border-2 ${
                  quickStats.dataCompleteness.practiceSessions 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="text-2xl mb-2">
                    {quickStats.dataCompleteness.practiceSessions ? '✅' : '🧘'}
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Practice Sessions</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Begin with just 5 minutes of present attention practice
                  </p>
                  {!quickStats.dataCompleteness.practiceSessions && (
                    <button
                      onClick={handleStartPractice}
                      className="w-full bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      Start Practice
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ MINIMUM DATA REQUIREMENTS */}
            <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">
                🎯 Minimum Requirements for Happiness Tracking
              </h3>
              <p className="text-yellow-700 mb-4">
                To begin tracking your happiness, you need <strong>one</strong> of the following:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">Option 1</div>
                  <p className="text-gray-600">Complete <strong>Questionnaire + Self-Assessment</strong></p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">Option 2</div>
                  <p className="text-gray-600">Complete <strong>3+ Practice Sessions</strong></p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <div className="font-bold text-gray-800 mb-2">Option 3</div>
                  <p className="text-gray-600">Complete <strong>Questionnaire + 1 Session</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ SUFFICIENT DATA - Show full happiness tracking */}
      {!isCalculating && quickStats.hasData && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* ✅ MAIN HAPPINESS SCORE CARD */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white text-center mb-8 shadow-2xl">
            <div className="text-6xl font-bold mb-4">{userProgress.happiness_points}</div>
            <div className="text-2xl mb-4">PAHM-Centered Happiness Points</div>
            <div className="bg-white bg-opacity-20 rounded-2xl p-4 mb-4 inline-block">
              <div className="text-lg font-semibold">{userProgress.user_level}</div>
            </div>
            <div className="text-lg opacity-90">
              Based on {quickStats.totalSessions} practice sessions & {emotionalNotes?.length || 0} emotional notes
            </div>
            
            {/* Debug Toggle */}
            <div className="mt-6">
              <button 
                onClick={handleDebugToggle}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-6 py-2 rounded-xl transition-all duration-300"
              >
                {showDebug ? 'Hide Debug' : 'Show Debug'} 🔍
              </button>
            </div>
          </div>

          {/* ✅ PAHM ANALYSIS SECTION */}
          {userProgress.pahmAnalysis && (
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl border-2 border-indigo-100">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                🎯 PAHM Development Analysis - The Core Component (30% Weight)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {Math.round((userProgress.pahmAnalysis.presentNeutralRatio || 0) * 100)}%
                  </div>
                  <div className="text-lg font-semibold text-gray-700">Present-Neutral Mastery</div>
                  <div className="text-sm text-gray-500">THE ULTIMATE GOAL</div>
                </div>
                
                <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round((userProgress.pahmAnalysis.presentMomentRatio || 0) * 100)}%
                  </div>
                  <div className="text-lg font-semibold text-gray-700">Present-Moment Focus</div>
                  <div className="text-sm text-gray-500">Overall Present Awareness</div>
                </div>
                
                <div className="text-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {userProgress.pahmAnalysis.overallPAHMScore || 0}
                  </div>
                  <div className="text-lg font-semibold text-gray-700">PAHM Score</div>
                  <div className="text-sm text-gray-500">0-100 Scale</div>
                </div>
              </div>

              {/* PAHM Stage & Description */}
              <div className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6">
                <div className="text-xl font-bold text-orange-700 mb-2">
                  Stage: {userProgress.pahmAnalysis.developmentStage || 'Assessment Needed'}
                </div>
                <div className="text-gray-700 mb-4">
                  {userProgress.pahmAnalysis.stageDescription || 'Complete more practice sessions for detailed analysis'}
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Path:</strong> {userProgress.pahmAnalysis.progressionPath || 'Begin your present attention journey'}
                </div>
              </div>

              {/* PAHM Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-600">
                    {userProgress.pahmAnalysis.breakdown?.presentNeutralMastery || 0}/50
                  </div>
                  <div className="text-sm text-gray-600">Present-Neutral</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userProgress.pahmAnalysis.breakdown?.presentMomentDevelopment || 0}/30
                  </div>
                  <div className="text-sm text-gray-600">Present Development</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {userProgress.pahmAnalysis.breakdown?.therapeuticProgress || 0}/15
                  </div>
                  <div className="text-sm text-gray-600">Therapeutic Work</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {userProgress.pahmAnalysis.breakdown?.sessionQuality || 0}/5
                  </div>
                  <div className="text-sm text-gray-600">Session Quality</div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ COMPONENT BREAKDOWN */}
          {componentBreakdown && (
            <div className="bg-white rounded-3xl p-8 mb-8 shadow-xl border-2 border-indigo-100">
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                📊 Happiness Components (PAHM-Centered Weighting)
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* PAHM Development - Primary */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 text-center md:col-span-2 border-4 border-yellow-400">
                  <div className="text-3xl font-bold mb-2">{Math.round(componentBreakdown.pahmDevelopment || 0)}/100</div>
                  <div className="text-lg font-semibold">PAHM Development</div>
                  <div className="text-sm opacity-90">30% Weight - THE CORE</div>
                  <div className="text-xs opacity-75 mt-1">Present attention IS happiness</div>
                </div>

                {/* Supporting Components */}
                <div className="bg-gradient-to-r from-red-400 to-red-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.emotionalStabilityProgress || 0)}/100</div>
                  <div className="text-sm font-semibold">Emotional Stability</div>
                  <div className="text-xs opacity-75">20% Weight</div>
                </div>

                <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.currentMoodState || 0)}/100</div>
                  <div className="text-sm font-semibold">Current Mood</div>
                  <div className="text-xs opacity-75">15% Weight</div>
                </div>

                <div className="bg-gradient-to-r from-teal-400 to-teal-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.mindRecoveryEffectiveness || 0)}/100</div>
                  <div className="text-sm font-semibold">Mind Recovery</div>
                  <div className="text-xs opacity-75">12% Weight</div>
                </div>

                <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.emotionalRegulation || 0)}/100</div>
                  <div className="text-sm font-semibold">Emotional Regulation</div>
                  <div className="text-xs opacity-75">10% Weight</div>
                </div>

                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.attachmentFlexibility || 0)}/100</div>
                  <div className="text-sm font-semibold">Attachment Flexibility</div>
                  <div className="text-xs opacity-75">8% Weight</div>
                </div>

                <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.socialConnection || 0)}/100</div>
                  <div className="text-sm font-semibold">Social Connection</div>
                  <div className="text-xs opacity-75">3% Weight</div>
                </div>

                <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold">{Math.round(componentBreakdown.practiceConsistency || 0)}/100</div>
                  <div className="text-sm font-semibold">Practice Consistency</div>
                  <div className="text-xs opacity-75">2% Weight</div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ ENHANCED METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-indigo-400 to-purple-600 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{Math.round(userProgress.focus_ability || 0)}%</div>
              <div className="text-lg font-semibold">Focus Ability</div>
              <div className="text-sm opacity-90">PAHM Present-Neutral + Skills</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{Math.round(userProgress.habit_change_score || 0)}%</div>
              <div className="text-lg font-semibold">Habit Change</div>
              <div className="text-sm opacity-90">PAHM + Consistency</div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-400 to-rose-600 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold mb-2">{userProgress.practice_streak || 0}</div>
              <div className="text-lg font-semibold">Day Streak</div>
              <div className="text-sm opacity-90">Present Attention Practice</div>
            </div>
          </div>

          {/* ✅ INSIGHTS & RECOMMENDATIONS */}
          {userProgress.pahmAnalysis && userProgress.pahmAnalysis.insights && userProgress.pahmAnalysis.insights.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl p-8 mb-8 border-2 border-yellow-200">
              <h2 className="text-2xl font-bold text-center text-orange-800 mb-6">💡 PAHM Development Insights</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-4">📊 Current Insights:</h3>
                  <ul className="space-y-2">
                    {userProgress.pahmAnalysis.insights.map((insight: string, index: number) => (
                      <li key={index} className="text-gray-700 flex items-start">
                        <span className="text-orange-500 mr-2 mt-1">•</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 mb-4">🎯 Recommendations:</h3>
                  <ul className="space-y-2">
                    {userProgress.pahmAnalysis.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="text-gray-700 flex items-start">
                        <span className="text-green-500 mr-2 mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ✅ DEBUG PANEL */}
          {showDebug && (
            <div className="bg-gray-50 rounded-3xl p-8 mb-8 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🔍 PAHM-Centered Debug Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-700 mb-3">📊 Data Sources:</h3>
                  <div className="space-y-2 text-sm font-mono">
                    <div>• Practice Sessions: {practiceSessions?.length || 0}</div>
                    <div>• Emotional Notes: {emotionalNotes?.length || 0}</div>
                    <div>• Questionnaire: {questionnaire?.completed ? '✅' : '❌'}</div>
                    <div>• Self-Assessment: {selfAssessment?.completed ? '✅' : '❌'}</div>
                    <div>• Has Minimum Data: {quickStats.hasData ? '✅' : '❌'}</div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-700 mb-3">🧮 Component Scores:</h3>
                  {componentBreakdown && (
                    <div className="space-y-2 text-sm font-mono">
                      <div>• PAHM Development: {Math.round(componentBreakdown.pahmDevelopment || 0)}/100</div>
                      <div>• Emotional Stability: {Math.round(componentBreakdown.emotionalStabilityProgress || 0)}/100</div>
                      <div>• Current Mood: {Math.round(componentBreakdown.currentMoodState || 0)}/100</div>
                      <div>• Mind Recovery: {Math.round(componentBreakdown.mindRecoveryEffectiveness || 0)}/100</div>
                      <div>• Emotional Regulation: {Math.round(componentBreakdown.emotionalRegulation || 0)}/100</div>
                      <div>• Attachment Flexibility: {Math.round(componentBreakdown.attachmentFlexibility || 0)}/100</div>
                      <div>• Social Connection: {Math.round(componentBreakdown.socialConnection || 0)}/100</div>
                      <div>• Practice Consistency: {Math.round(componentBreakdown.practiceConsistency || 0)}/100</div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={handleDebugCalculation}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🔍 Debug Console
                </button>
                <button 
                  onClick={handleLogProgress}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📊 Log Progress
                </button>
                <button 
                  onClick={handleTestComponents}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  🧪 Test Components
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 🌟 UNDERSTANDING PRESENT ATTENTION SECTION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-indigo-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Understanding Present Attention</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Attention</h3>
              <p className="text-sm text-gray-600">
                The ability to focus your mind on the present moment without getting lost in thoughts, distractions, or mental chatter.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👁️</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Awareness</h3>
              <p className="text-sm text-gray-600">
                Clear recognition of what's happening in your mind, body, and environment right now, without judgment or reaction.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🌟</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Presence</h3>
              <p className="text-sm text-gray-600">
                Being fully here and now, engaged with immediate experience rather than lost in past memories or future concerns.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🧘</span>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Equanimity</h3>
              <p className="text-sm text-gray-600">
                Balanced peace that remains steady regardless of whether experiences are pleasant, unpleasant, or neutral.
              </p>
            </div>
          </div>

          {/* Practice Benefits and Tips */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
            <h3 className="text-lg font-bold text-center text-indigo-800 mb-4">🌈 Benefits of Regular Present Attention Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                {['Reduced stress and anxiety', 'Improved focus and concentration', 'Better emotional regulation', 'Enhanced self-awareness'].map(benefit => (
                  <div key={benefit} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {['Greater life satisfaction', 'Improved relationships', 'Increased resilience', 'Natural sense of well-being'].map(benefit => (
                  <div key={benefit} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
            <h3 className="text-lg font-bold text-center text-orange-800 mb-4">💡 Tips for Developing Present Attention</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">🌱 For Beginners:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Start with just 5 minutes daily</li>
                  <li>• Focus on your breathing</li>
                  <li>• Be gentle with yourself</li>
                  <li>• Consistency matters more than duration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">🚀 For Development:</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Gradually increase session length</li>
                  <li>• Practice throughout daily activities</li>
                  <li>• Notice when mind wanders and return</li>
                  <li>• Celebrate small improvements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 CALL TO ACTION */}
      {quickStats.hasData && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">🌟 Continue Your Present Attention Journey</h2>
            <p className="mb-6 opacity-90">
              Your practice is building skills that last a lifetime. Each moment of awareness contributes to greater happiness and peace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleStartPractice}
                className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors"
              >
                🧘 Start Practice Session
              </button>
              <button 
                onClick={() => navigate('/analytics')}
                className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors border-2 border-white border-opacity-50"
              >
                📊 View Detailed Stats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default HappinessTrackerPage;