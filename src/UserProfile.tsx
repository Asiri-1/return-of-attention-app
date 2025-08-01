// ✅ FIXED HomeDashboard.tsx - Now Uses useHappinessCalculation Hook Consistently
// File: src/components/ModernUserProfile.tsx
// 🔧 FIXED: Removed local state, now uses centralized useHappinessCalculation hook

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useWellness } from './contexts/wellness/WellnessContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';
// 🎯 CRITICAL FIX: Import and use the happiness calculation hook
import { useHappinessCalculation } from './hooks/useHappinessCalculation';

interface UserProfileProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToSelfAssessment?: () => void;
}

interface CategoryData {
  level: 'none' | 'some' | 'strong';
  details?: string;
  category: string;
}

const ModernUserProfile: React.FC<UserProfileProps> = ({ 
  onBack, 
  onLogout, 
  onNavigateToQuestionnaire, 
  onNavigateToSelfAssessment 
}) => {
  const { currentUser } = useAuth();
  
  // ✅ FIXED: Use Universal Architecture focused contexts
  const { userProfile, isLoading: userLoading } = useUser();
  const { sessions } = usePractice();
  const { emotionalNotes } = useWellness();
  const { 
    questionnaire, 
    selfAssessment, 
    getCompletionStatus 
  } = useOnboarding();
  
  // 🎯 CRITICAL FIX: Use the centralized happiness calculation hook instead of local state
  const {
    userProgress,
    componentBreakdown,
    isCalculating,
    practiceSessions,
    // Remove the old local state management completely
  } = useHappinessCalculation();
  
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // 🎯 FIXED: Get happiness data from the hook instead of local state
  const happinessData = useMemo(() => ({
    happiness_points: userProgress.happiness_points || 0,
    user_level: userProgress.user_level || 'Beginning Seeker'
  }), [userProgress.happiness_points, userProgress.user_level]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ✅ REMOVED: All the old event listener code and local state management
  // The hook handles all the state management and updates automatically

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleLogout = async () => {
    try {
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleQuestionnaireNavigation = () => {
    console.log('🔄 Navigating to questionnaire...');
    if (onNavigateToQuestionnaire) {
      onNavigateToQuestionnaire();
    } else {
      window.dispatchEvent(new CustomEvent('navigateToQuestionnaire'));
      console.log('📢 Dispatched navigation event for questionnaire');
    }
  };

  const handleSelfAssessmentNavigation = () => {
    console.log('🔄 Navigating to self-assessment...');
    if (onNavigateToSelfAssessment) {
      onNavigateToSelfAssessment();
    } else {
      window.dispatchEvent(new CustomEvent('navigateToSelfAssessment'));
      console.log('📢 Dispatched navigation event for self-assessment');
    }
  };

  // ✅ FIXED: Using data from Universal Architecture focused contexts
  const completionStatus = getCompletionStatus();
  
  const userStats = {
    totalSessions: userProfile?.totalSessions || sessions?.length || 0,
    totalHours: Math.round(((userProfile?.totalMinutes || 0) / 60) * 10) / 10,
    currentStreak: userProfile?.currentStreak || 0,
    longestStreak: userProfile?.longestStreak || 0,
    lastSessionDate: sessions && sessions.length > 0 ? sessions[sessions.length - 1].timestamp : null
  };

  // Enhanced questionnaire section with all 27 fields displayed
  const renderQuestionnaireSection = () => {
    if (!completionStatus.questionnaire || !questionnaire?.responses) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-3">📝</div>
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">Questionnaire Incomplete</h4>
            <p className="text-yellow-700 mb-4">Complete your questionnaire to unlock detailed insights about your mindfulness journey.</p>
            <button 
              onClick={handleQuestionnaireNavigation}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            >
              Complete Questionnaire
            </button>
          </div>
        </div>
      );
    }

    const { responses, completedAt } = questionnaire;

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-semibold">✅ Questionnaire Completed</span>
            <span className="text-green-600 text-sm">
              {completedAt ? new Date(completedAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>
          <div className="text-sm text-green-700 mt-2">
            All 27 questions answered • Complete profile established
          </div>
        </div>

        {/* Demographics & Background (Questions 1-7) */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('demographics')}
            className="w-full flex justify-between items-center p-4 text-left bg-blue-100 hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              👤 Demographics & Background (Questions 1-7)
            </h4>
            <span className="text-blue-600 text-xl">
              {expandedSections.has('demographics') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('demographics') && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <strong className="text-blue-700">Q1 - Experience Level:</strong>
                  <div className="text-lg font-semibold text-blue-600">
                    {responses.experience_level || 0}/10
                  </div>
                  <div className="text-sm text-gray-600">
                    {(responses.experience_level || 0) >= 8 ? 'Expert' : 
                     (responses.experience_level || 0) >= 6 ? 'Advanced' :
                     (responses.experience_level || 0) >= 4 ? 'Intermediate' : 'Beginner'}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-blue-700">Q2 - Goals:</strong>
                  <div className="text-gray-800">
                    {Array.isArray(responses.goals) && responses.goals.length > 0 
                      ? responses.goals.join(', ') 
                      : responses.goals || 'Not specified'}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-blue-700">Q3 - Age Range:</strong>
                  <div className="text-gray-800">{responses.age_range || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-blue-700">Q4 - Location:</strong>
                  <div className="text-gray-800">{responses.location || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-blue-700">Q5 - Occupation:</strong>
                  <div className="text-gray-800">{responses.occupation || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-blue-700">Q6 - Education:</strong>
                  <div className="text-gray-800">{responses.education_level || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3 md:col-span-2">
                  <strong className="text-blue-700">Q7 - Meditation Background:</strong>
                  <div className="text-gray-800">{responses.meditation_background || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle Patterns (Questions 8-15) */}
        <div className="bg-green-50 border border-green-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('lifestyle')}
            className="w-full flex justify-between items-center p-4 text-left bg-green-100 hover:bg-green-200 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              🌱 Lifestyle Patterns (Questions 8-15)
            </h4>
            <span className="text-green-600 text-xl">
              {expandedSections.has('lifestyle') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('lifestyle') && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q8 - Sleep Quality:</strong>
                  <div className="text-lg font-semibold text-green-600">
                    {responses.sleep_pattern || 0}/10
                  </div>
                  <div className="text-sm text-gray-600">
                    {(responses.sleep_pattern || 0) >= 8 ? 'Excellent' : 
                     (responses.sleep_pattern || 0) >= 6 ? 'Good' :
                     (responses.sleep_pattern || 0) >= 4 ? 'Fair' : 'Poor'}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q9 - Physical Activity:</strong>
                  <div className="text-gray-800 capitalize">{responses.physical_activity || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q10 - Stress Triggers:</strong>
                  <div className="text-gray-800">
                    {Array.isArray(responses.stress_triggers) && responses.stress_triggers.length > 0 
                      ? responses.stress_triggers.join(', ')
                      : responses.stress_triggers || 'Not specified'}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q11 - Daily Routine:</strong>
                  <div className="text-gray-800">{responses.daily_routine || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q12 - Diet Pattern:</strong>
                  <div className="text-gray-800">{responses.diet_pattern || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q13 - Screen Time:</strong>
                  <div className="text-gray-800">{responses.screen_time || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q14 - Social Connections:</strong>
                  <div className="text-gray-800">{responses.social_connections || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-green-700">Q15 - Work-Life Balance:</strong>
                  <div className="text-gray-800">{responses.work_life_balance || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thinking Patterns (Questions 16-21) */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('thinking')}
            className="w-full flex justify-between items-center p-4 text-left bg-purple-100 hover:bg-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
              🧠 Thinking Patterns (Questions 16-21)
            </h4>
            <span className="text-purple-600 text-xl">
              {expandedSections.has('thinking') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('thinking') && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <strong className="text-purple-700">Q16 - Emotional Awareness:</strong>
                  <div className="text-lg font-semibold text-purple-600">
                    {responses.emotional_awareness || 0}/10
                  </div>
                  <div className="text-sm text-gray-600">
                    {(responses.emotional_awareness || 0) >= 8 ? 'Very High' : 
                     (responses.emotional_awareness || 0) >= 6 ? 'Good' :
                     (responses.emotional_awareness || 0) >= 4 ? 'Moderate' : 'Low'}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-purple-700">Q17 - Stress Response:</strong>
                  <div className="text-gray-800">{responses.stress_response || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-purple-700">Q18 - Decision Making:</strong>
                  <div className="text-gray-800">{responses.decision_making || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-purple-700">Q19 - Self Reflection:</strong>
                  <div className="text-gray-800">{responses.self_reflection || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-purple-700">Q20 - Thought Patterns:</strong>
                  <div className="text-gray-800">{responses.thought_patterns || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-purple-700">Q21 - Daily Mindfulness:</strong>
                  <div className="text-gray-800">{responses.mindfulness_in_daily_life || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mindfulness Experience (Questions 22-27) */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('mindfulness')}
            className="w-full flex justify-between items-center p-4 text-left bg-indigo-100 hover:bg-indigo-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
              🧘 Mindfulness Experience (Questions 22-27)
            </h4>
            <span className="text-indigo-600 text-xl">
              {expandedSections.has('mindfulness') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('mindfulness') && (
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <strong className="text-indigo-700">Q22 - Mindfulness Experience:</strong>
                  <div className="text-lg font-semibold text-indigo-600">
                    {responses.mindfulness_experience || 0}/10
                  </div>
                  <div className="text-sm text-gray-600">
                    {(responses.mindfulness_experience || 0) >= 8 ? 'Expert' : 
                     (responses.mindfulness_experience || 0) >= 6 ? 'Advanced' :
                     (responses.mindfulness_experience || 0) >= 4 ? 'Intermediate' : 'Beginner'}
                  </div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-indigo-700">Q23 - Meditation Background Detail:</strong>
                  <div className="text-gray-800">{responses.meditation_background_detail || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-indigo-700">Q24 - Practice Goals:</strong>
                  <div className="text-gray-800">{responses.practice_goals || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-indigo-700">Q25 - Preferred Duration:</strong>
                  <div className="text-gray-800">{responses.preferred_duration || 'Not specified'} minutes</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-indigo-700">Q26 - Biggest Challenges:</strong>
                  <div className="text-gray-800">{responses.biggest_challenges || 'Not specified'}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <strong className="text-indigo-700">Q27 - Motivation:</strong>
                  <div className="text-gray-800">{responses.motivation || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">📊 Questionnaire Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{responses.totalQuestions || 27}</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{responses.answeredQuestions || Object.keys(responses).length}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(((responses.answeredQuestions || Object.keys(responses).length) / (responses.totalQuestions || 27)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">4</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced self-assessment section with better data handling
  const renderSelfAssessmentSection = () => {
    if (!completionStatus.assessment || !selfAssessment) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="text-lg font-semibold text-orange-800 mb-2">Self-Assessment Incomplete</h4>
            <p className="text-orange-700 mb-4">Complete your self-assessment to see your attachment analysis and mindfulness insights.</p>
            <button 
              onClick={handleSelfAssessmentNavigation}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
            >
              Complete Self-Assessment
            </button>
          </div>
        </div>
      );
    }

    const { categories, metrics, completedAt } = selfAssessment;

    return (
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-green-800 font-semibold">✅ Self-Assessment Completed</span>
            <span className="text-green-600 text-sm">
              {completedAt ? new Date(completedAt).toLocaleDateString() : 'Recently'}
            </span>
          </div>
          <div className="text-sm text-green-700 mt-2">
            6 sensory categories analyzed • Attachment levels determined
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
          <h4 className="font-semibold mb-4 text-xl">Attachment Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{metrics.nonAttachmentCount}/6</div>
              <div className="text-sm opacity-90">Non-Attachment Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{metrics.attachmentScore}</div>
              <div className="text-sm opacity-90">Attachment Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{metrics.attachmentLevel}</div>
              <div className="text-sm opacity-90">Level</div>
            </div>
          </div>
          
          <div className="mt-4 bg-white bg-opacity-20 rounded-full h-3">
            <div 
              className="bg-white h-3 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((metrics.nonAttachmentCount / 6) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm mt-2 opacity-90">
            Progress toward complete non-attachment
          </div>
        </div>

        <div className="grid gap-3">
          {Object.entries(categories || {}).map(([category, data]) => {
            const categoryInfo: { [key: string]: { icon: string; title: string } } = {
              taste: { icon: '🍽️', title: 'Food & Taste' },
              smell: { icon: '👃', title: 'Scents & Aromas' },
              sound: { icon: '🎵', title: 'Sounds & Music' },
              sight: { icon: '👁️', title: 'Visual & Beauty' },
              touch: { icon: '✋', title: 'Touch & Textures' },
              mind: { icon: '🧠', title: 'Thoughts & Mental Images' },
            };
            
            const info = categoryInfo[category] || { icon: '❓', title: category };
            
            const levelColors: { [key in 'none' | 'some' | 'strong']: string } = {
              none: 'bg-green-100 text-green-800 border-green-200',
              some: 'bg-yellow-100 text-yellow-800 border-yellow-200',
              strong: 'bg-red-100 text-red-800 border-red-200',
            };
            
            const levelTexts: { [key in 'none' | 'some' | 'strong']: string } = {
              none: '✨ No particular preferences',
              some: '⚖️ Some preferences, flexible',
              strong: '🔥 Strong preferences',
            };
            
            const categoryData = data as CategoryData;
            const level = categoryData?.level || 'none';
            
            return (
              <div key={category} className={`border rounded-lg ${levelColors[level]}`}>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">
                      {info.icon} {info.title}
                    </span>
                    <span className="text-sm font-semibold">
                      {levelTexts[level]}
                    </span>
                  </div>
                  {categoryData?.details && (
                    <div className="mt-3 text-sm opacity-80">
                      <strong>Details:</strong> {categoryData.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Analysis */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">🔍 Detailed Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Attachment Distribution:</h5>
              <div className="space-y-2">
                {Object.entries(categories || {}).map(([category, data]) => {
                  const level = (data as CategoryData)?.level || 'none';
                  const pointValue = level === 'none' ? 12 : level === 'some' ? -7 : -15;
                  return (
                    <div key={category} className="flex justify-between text-sm">
                      <span className="capitalize">{category}:</span>
                      <span className={`font-medium ${pointValue === 12 ? 'text-green-600' : 'text-red-600'}`}>
                        {pointValue} points
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Progress Indicators:</h5>
              <div className="space-y-2 text-sm">
                <div>Non-attachment ratio: {metrics.nonAttachmentCount}/6 ({Math.round((metrics.nonAttachmentCount/6)*100)}%)</div>
                <div>Flexibility level: {metrics.attachmentLevel}</div>
                <div>Total score: {metrics.attachmentScore} points</div>
                <div>Assessment date: {completedAt ? new Date(completedAt).toLocaleDateString() : 'Recent'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🎯 FIXED: Show loading state when happiness is being calculated OR component is loading
  if (loading || userLoading || isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">
            {isCalculating ? 'Calculating your happiness...' : 'Loading your profile...'}
          </h3>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg text-center">
          <h3 className="text-lg font-semibold text-gray-700">Please sign in to view your profile</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              👤
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {currentUser.displayName || currentUser.email?.split('@')[0] || 'Mindful Practitioner'}
            </h1>
            <p className="text-xl opacity-90 mb-1">{happinessData.user_level}</p>
            <p className="text-sm opacity-80">
              Member since {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1 bg-gray-100">
            <div className="bg-white p-6 text-center">
              <div className="text-2xl font-bold text-indigo-600">{happinessData.happiness_points}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Happiness Points</div>
            </div>
            <div className="bg-white p-6 text-center">
              <div className="text-2xl font-bold text-green-600">{userStats.totalSessions}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="bg-white p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600">{userStats.currentStreak}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Day Streak</div>
            </div>
            <div className="bg-white p-6 text-center">
              <div className="text-2xl font-bold text-red-600">{userStats.totalHours}h</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Total Practice</div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">👤</span>
                Account Information
              </h2>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="text-gray-600">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">User ID:</span>
                  <span className="text-gray-600 font-mono text-sm">{currentUser.uid.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="font-semibold text-gray-700">Account Type:</span>
                  <span className="text-gray-600">
                    {currentUser.email === 'asiriamarasinghe35@gmail.com' ? 'Administrator' : 'Standard User'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-gray-700">Current Level:</span>
                  <span className="text-gray-600">{happinessData.user_level}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">📝</span>
                Questionnaire Responses
              </h2>
              {renderQuestionnaireSection()}
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">🧠</span>
                Self-Assessment Results
              </h2>
              {renderSelfAssessmentSection()}
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">📊</span>
                Practice Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats.totalSessions}</div>
                  <div className="text-sm text-green-700">Total Sessions</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.totalHours}h</div>
                  <div className="text-sm text-blue-700">Total Practice Time</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{userStats.currentStreak}</div>
                  <div className="text-sm text-yellow-700">Current Streak</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{emotionalNotes?.length || 0}</div>
                  <div className="text-sm text-purple-700">Emotional Notes</div>
                </div>
              </div>
              
              {userStats.lastSessionDate && (
                <div className="text-center text-sm text-gray-600 mt-4">
                  Last practice session: {new Date(userStats.lastSessionDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Current Happiness Points</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">{happinessData.happiness_points}</div>
              <div className="text-gray-600 mb-4">Level: {happinessData.user_level}</div>
              <div className="text-sm text-gray-600">
                Earn points by completing practices, reducing attachments, and maintaining consistency
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
              >
                ← Back to Dashboard
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-600 transition-all duration-200 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUserProfile;