// ============================================================================
// 🎯 UNIVERSAL UserProfile - Real Firebase Context Integration
// ============================================================================
// File: src/components/ModernUserProfile.tsx
// ✅ UNIVERSAL: Uses real contexts instead of mocks
// ✅ SINGLE-POINT: All session data from PracticeContext
// ✅ FIREBASE-ONLY: Real-time data from Firebase

import React, { useState, useEffect, useMemo } from 'react';

// ✅ REAL CONTEXTS - Corrected import paths
import { useAuth } from './contexts/auth/AuthContext';
import { useUser } from './contexts/user/UserContext';
import { usePractice } from './contexts/practice/PracticeContext';
import { useWellness } from './contexts/wellness/WellnessContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';
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

const UniversalUserProfile: React.FC<UserProfileProps> = ({ 
  onBack, 
  onLogout, 
  onNavigateToQuestionnaire, 
  onNavigateToSelfAssessment 
}) => {
  // ================================
  // 🎯 UNIVERSAL CONTEXTS - REAL DATA
  // ================================
  const { currentUser } = useAuth();
  const { 
    isLoading: userLoading,
    getT1Sessions,
    getT2Sessions,
    getT3Sessions,
    getT4Sessions,
    getT5Sessions,
    getTotalPracticeHours,
    getCurrentStage
  } = useUser();
  const { 
    sessions, 
    stats, 
    isLoading: practiceLoading
  } = usePractice();
  const { emotionalNotes } = useWellness();
  const { 
    questionnaire, 
    selfAssessment, 
    getCompletionStatus 
  } = useOnboarding();
  const {
    userProgress,
    isCalculating,
  } = useHappinessCalculation();
  
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  
  // ================================
  // 🎯 UNIVERSAL DATA PROCESSING
  // ================================
  
  // Get happiness data with proper fallbacks
  const happinessData = useMemo(() => ({
    happiness_points: userProgress?.happiness_points || 0,
    user_level: userProgress?.user_level || 'Beginning Seeker'
  }), [userProgress?.happiness_points, userProgress?.user_level]);

  // Universal session statistics (SINGLE-POINT from PracticeContext)
  const universalStats = useMemo(() => {
    console.log('🎯 UNIVERSAL STATS CALCULATION:', {
      sessionsCount: sessions?.length || 0,
      statsFromContext: stats,
      totalHours: getTotalPracticeHours(),
      currentStage: getCurrentStage()
    });

    return {
      totalSessions: sessions?.length || 0,
      totalHours: getTotalPracticeHours(),
      totalMinutes: (getTotalPracticeHours() * 60) || 0,
      currentStreak: stats?.currentStreak || 0,
      longestStreak: stats?.longestStreak || 0,
      currentStage: getCurrentStage(),
      lastSessionDate: sessions && sessions.length > 0 ? 
        sessions[sessions.length - 1]?.timestamp : null,
      // T-Level session counts (UNIVERSAL SINGLE-POINT)
      t1Sessions: getT1Sessions(),
      t2Sessions: getT2Sessions(),
      t3Sessions: getT3Sessions(),
      t4Sessions: getT4Sessions(),
      t5Sessions: getT5Sessions(),
      totalTLevelSessions: getT1Sessions() + getT2Sessions() + getT3Sessions() + getT4Sessions() + getT5Sessions()
    };
  }, [sessions, stats, getTotalPracticeHours, getCurrentStage, getT1Sessions, getT2Sessions, getT3Sessions, getT4Sessions, getT5Sessions]);

  // ================================
  // 🎯 LOADING STATES
  // ================================
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // ================================
  // 🎯 EVENT HANDLERS
  // ================================
  
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
      console.log('📢 Would navigate to questionnaire');
    }
  };

  const handleSelfAssessmentNavigation = () => {
    console.log('🔄 Navigating to self-assessment...');
    if (onNavigateToSelfAssessment) {
      onNavigateToSelfAssessment();
    } else {
      console.log('📢 Would navigate to self-assessment');
    }
  };

  // Safe completion status with fallbacks
  const completionStatus = useMemo(() => {
    try {
      return getCompletionStatus();
    } catch (error) {
      console.error('Error getting completion status:', error);
      return { questionnaire: false, assessment: false };
    }
  }, [getCompletionStatus]);

  // ================================
  // 🎯 RENDER SECTIONS
  // ================================
  
  // Enhanced questionnaire section with all 27 fields displayed
  const renderQuestionnaireSection = () => {
    if (!completionStatus.questionnaire || !questionnaire?.responses) {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-md">
          <div className="text-center">
            <div className="text-4xl mb-3">📝</div>
            <h4 className="text-lg font-semibold text-yellow-800 mb-2">Questionnaire Incomplete</h4>
            <p className="text-yellow-700 mb-4">Complete your questionnaire to unlock detailed insights about your mindfulness journey.</p>
            <button 
              onClick={handleQuestionnaireNavigation}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-50"
            >
              Complete Questionnaire
            </button>
          </div>
        </div>
      );
    }

    const { responses, completedAt } = questionnaire;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 shadow-md">
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
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('demographics')}
            className="w-full flex justify-between items-center p-4 text-left bg-blue-100 hover:bg-blue-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-blue-800 flex items-center gap-2">
              👤 Demographics & Background (Questions 1-7)
            </h4>
            <span className="text-blue-600 text-xl transform transition-transform duration-200">
              {expandedSections.has('demographics') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('demographics') && (
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
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
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-blue-700">Q2 - Goals:</strong>
                  <div className="text-gray-800">
                    {Array.isArray(responses.goals) && responses.goals.length > 0 
                      ? responses.goals.join(', ') 
                      : responses.goals || 'Not specified'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-blue-700">Q3 - Age Range:</strong>
                  <div className="text-gray-800">{responses.age_range || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-blue-700">Q4 - Location:</strong>
                  <div className="text-gray-800">{responses.location || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-blue-700">Q5 - Occupation:</strong>
                  <div className="text-gray-800">{responses.occupation || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-blue-700">Q6 - Education:</strong>
                  <div className="text-gray-800">{responses.education_level || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 shadow-sm md:col-span-2">
                  <strong className="text-blue-700">Q7 - Meditation Background:</strong>
                  <div className="text-gray-800">{responses.meditation_background || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lifestyle Patterns (Questions 8-15) */}
        <div className="bg-green-50 border-2 border-green-200 rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('lifestyle')}
            className="w-full flex justify-between items-center p-4 text-left bg-green-100 hover:bg-green-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-green-800 flex items-center gap-2">
              🌱 Lifestyle Patterns (Questions 8-15)
            </h4>
            <span className="text-green-600 text-xl transform transition-transform duration-200">
              {expandedSections.has('lifestyle') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('lifestyle') && (
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
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
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q9 - Physical Activity:</strong>
                  <div className="text-gray-800 capitalize">{responses.physical_activity || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q10 - Stress Triggers:</strong>
                  <div className="text-gray-800">
                    {Array.isArray(responses.stress_triggers) && responses.stress_triggers.length > 0 
                      ? responses.stress_triggers.join(', ')
                      : responses.stress_triggers || 'Not specified'}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q11 - Daily Routine:</strong>
                  <div className="text-gray-800">{responses.daily_routine || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q12 - Diet Pattern:</strong>
                  <div className="text-gray-800">{responses.diet_pattern || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q13 - Screen Time:</strong>
                  <div className="text-gray-800">{responses.screen_time || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q14 - Social Connections:</strong>
                  <div className="text-gray-800">{responses.social_connections || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-green-700">Q15 - Work-Life Balance:</strong>
                  <div className="text-gray-800">{responses.work_life_balance || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thinking Patterns (Questions 16-21) */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('thinking')}
            className="w-full flex justify-between items-center p-4 text-left bg-purple-100 hover:bg-purple-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-purple-800 flex items-center gap-2">
              🧠 Thinking Patterns (Questions 16-21)
            </h4>
            <span className="text-purple-600 text-xl transform transition-transform duration-200">
              {expandedSections.has('thinking') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('thinking') && (
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
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
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-purple-700">Q17 - Stress Response:</strong>
                  <div className="text-gray-800">{responses.stress_response || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-purple-700">Q18 - Decision Making:</strong>
                  <div className="text-gray-800">{responses.decision_making || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-purple-700">Q19 - Self Reflection:</strong>
                  <div className="text-gray-800">{responses.self_reflection || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-purple-700">Q20 - Thought Patterns:</strong>
                  <div className="text-gray-800">{responses.thought_patterns || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-purple-700">Q21 - Daily Mindfulness:</strong>
                  <div className="text-gray-800">{responses.mindfulness_in_daily_life || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mindfulness Experience (Questions 22-27) */}
        <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl overflow-hidden shadow-lg">
          <button
            onClick={() => toggleSection('mindfulness')}
            className="w-full flex justify-between items-center p-4 text-left bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
          >
            <h4 className="font-semibold text-indigo-800 flex items-center gap-2">
              🧘 Mindfulness Experience (Questions 22-27)
            </h4>
            <span className="text-indigo-600 text-xl transform transition-transform duration-200">
              {expandedSections.has('mindfulness') ? '▼' : '▶'}
            </span>
          </button>
          
          {expandedSections.has('mindfulness') && (
            <div className="p-6 space-y-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
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
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-indigo-700">Q23 - Meditation Background Detail:</strong>
                  <div className="text-gray-800">{responses.meditation_background_detail || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-indigo-700">Q24 - Practice Goals:</strong>
                  <div className="text-gray-800">{responses.practice_goals || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-indigo-700">Q25 - Preferred Duration:</strong>
                  <div className="text-gray-800">{responses.preferred_duration || 'Not specified'} minutes</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-indigo-700">Q26 - Biggest Challenges:</strong>
                  <div className="text-gray-800">{responses.biggest_challenges || 'Not specified'}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 shadow-sm">
                  <strong className="text-indigo-700">Q27 - Motivation:</strong>
                  <div className="text-gray-800">{responses.motivation || 'Not specified'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
          <h4 className="font-semibold text-gray-800 mb-4 text-center">📊 Questionnaire Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">27</div>
              <div className="text-sm text-gray-600">Total Questions</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{Object.keys(responses || {}).length}</div>
              <div className="text-sm text-gray-600">Answered</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round((Object.keys(responses || {}).length / 27) * 100)}%
              </div>
              <div className="text-sm text-gray-600">Completion</div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm">
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
        <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 shadow-md">
          <div className="text-center">
            <div className="text-4xl mb-3">🧠</div>
            <h4 className="text-lg font-semibold text-orange-800 mb-2">Self-Assessment Incomplete</h4>
            <p className="text-orange-700 mb-4">Complete your self-assessment to see your attachment analysis and mindfulness insights.</p>
            <button 
              onClick={handleSelfAssessmentNavigation}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
            >
              Complete Self-Assessment
            </button>
          </div>
        </div>
      );
    }

    const { categories, metrics, completedAt } = selfAssessment;

    return (
      <div className="space-y-6">
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 mb-4 shadow-md">
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

        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl p-6 shadow-xl">
          <h4 className="font-semibold mb-4 text-xl">Attachment Assessment Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{metrics?.nonAttachmentCount || 0}/6</div>
              <div className="text-sm opacity-90">Non-Attachment Categories</div>
            </div>
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{metrics?.attachmentScore || 0}</div>
              <div className="text-sm opacity-90">Attachment Score</div>
            </div>
            <div className="text-center bg-white bg-opacity-20 rounded-lg p-4">
              <div className="text-3xl font-bold">{metrics?.attachmentLevel || 'N/A'}</div>
              <div className="text-sm opacity-90">Level</div>
            </div>
          </div>
          
          <div className="mt-6 bg-white bg-opacity-20 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-white h-4 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(((metrics?.nonAttachmentCount || 0) / 6) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="text-sm mt-2 opacity-90 text-center">
            Progress toward complete non-attachment
          </div>
        </div>

        <div className="grid gap-4">
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
              none: 'bg-green-50 text-green-800 border-green-200',
              some: 'bg-yellow-50 text-yellow-800 border-yellow-200',
              strong: 'bg-red-50 text-red-800 border-red-200',
            };
            
            const levelTexts: { [key in 'none' | 'some' | 'strong']: string } = {
              none: '✨ No particular preferences',
              some: '⚖️ Some preferences, flexible',
              strong: '🔥 Strong preferences',
            };
            
            const categoryData = data as CategoryData;
            const level = categoryData?.level || 'none';
            
            return (
              <div key={category} className={`border-2 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg ${levelColors[level]}`}>
                <div className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-lg">
                      {info.icon} {info.title}
                    </span>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-white bg-opacity-50">
                      {levelTexts[level]}
                    </span>
                  </div>
                  {categoryData?.details && (
                    <div className="mt-3 text-sm opacity-80 bg-white bg-opacity-30 rounded-lg p-3">
                      <strong>Details:</strong> {categoryData.details}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ================================
  // 🎯 LOADING STATES
  // ================================
  
  // Show loading state when any context is loading
  if (loading || userLoading || practiceLoading || isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700">
            {isCalculating ? 'Calculating your happiness...' : 
             practiceLoading ? 'Loading your practice data...' :
             userLoading ? 'Loading your profile...' : 
             'Loading your profile...'}
          </h3>
          <div className="text-sm text-gray-500 mt-2">
            🎯 Universal Architecture Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <h3 className="text-lg font-semibold text-gray-700">Please sign in to view your profile</h3>
        </div>
      </div>
    );
  }

  // ================================
  // 🎯 MAIN RENDER
  // ================================
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-8 text-center">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
              👤
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {currentUser.displayName || currentUser.email?.split('@')[0] || 'Mindful Practitioner'}
            </h1>
            <p className="text-xl opacity-90 mb-1">{happinessData.user_level}</p>
            <p className="text-sm opacity-80">
              Member since {new Date().toLocaleDateString()}
            </p>
            <div className="text-xs opacity-70 mt-2 bg-white bg-opacity-10 rounded-lg p-2">
              🎯 Universal Architecture • Real-time Firebase Data
            </div>
          </div>

          {/* Universal Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-indigo-600">{happinessData.happiness_points}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Happiness Points</div>
            </div>
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600">{universalStats.totalSessions}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-yellow-600">{universalStats.currentStreak}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Day Streak</div>
            </div>
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-red-600">{universalStats.totalHours}h</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Total Practice</div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            
            {/* Account Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">👤</span>
                Account Information
              </h2>
              
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-4 shadow-md">
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border-b border-gray-200 shadow-sm">
                  <span className="font-semibold text-gray-700">Email:</span>
                  <span className="text-gray-600">{currentUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border-b border-gray-200 shadow-sm">
                  <span className="font-semibold text-gray-700">User ID:</span>
                  <span className="text-gray-600 font-mono text-sm">{currentUser.uid.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg border-b border-gray-200 shadow-sm">
                  <span className="font-semibold text-gray-700">Account Type:</span>
                  <span className="text-gray-600">
                    {currentUser.email === 'asiriamarasinghe35@gmail.com' ? 'Administrator' : 'Standard User'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 px-4 bg-white rounded-lg shadow-sm">
                  <span className="font-semibold text-gray-700">Current Level:</span>
                  <span className="text-gray-600">{happinessData.user_level}</span>
                </div>
              </div>
            </div>

            {/* Universal T-Level Progress (SINGLE-POINT from PracticeContext) */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">🎯</span>
                Universal T-Level Progress
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{universalStats.t1Sessions}</div>
                  <div className="text-sm text-blue-700">T1 Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">Physical Stillness</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-green-600 mb-1">{universalStats.t2Sessions}</div>
                  <div className="text-sm text-green-700">T2 Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">Thought Awareness</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{universalStats.t3Sessions}</div>
                  <div className="text-sm text-yellow-700">T3 Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">Present Moment</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{universalStats.t4Sessions}</div>
                  <div className="text-sm text-purple-700">T4 Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">Sustained Attention</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 text-center shadow-md">
                  <div className="text-2xl font-bold text-red-600 mb-1">{universalStats.t5Sessions}</div>
                  <div className="text-sm text-red-700">T5 Sessions</div>
                  <div className="text-xs text-gray-500 mt-1">Deep Practice</div>
                </div>
              </div>

              <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 text-center border-2 border-purple-200">
                <div className="text-lg font-semibold text-purple-700">
                  Total T-Level Sessions: {universalStats.totalTLevelSessions}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  🎯 Data from Universal PracticeContext • Real-time Firebase
                </div>
              </div>
            </div>

            {/* Questionnaire Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">📝</span>
                Questionnaire Responses
              </h2>
              {renderQuestionnaireSection()}
            </div>
            
            {/* Self-Assessment Section */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">🧠</span>
                Self-Assessment Results
              </h2>
              {renderSelfAssessmentSection()}
            </div>

            {/* Practice Statistics */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">📊</span>
                Practice Statistics
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">{universalStats.totalSessions}</div>
                  <div className="text-sm text-green-700">Total Sessions</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{universalStats.totalHours}h</div>
                  <div className="text-sm text-blue-700">Total Practice Time</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{universalStats.currentStreak}</div>
                  <div className="text-sm text-yellow-700">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{emotionalNotes?.length || 0}</div>
                  <div className="text-sm text-purple-700">Emotional Notes</div>
                </div>
              </div>
              
              {universalStats.lastSessionDate && (
                <div className="text-center text-sm text-gray-600 mt-4 bg-gray-50 rounded-lg p-3">
                  Last practice session: {new Date(universalStats.lastSessionDate).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Happiness Summary */}
            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 text-center shadow-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Current Happiness Points</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">{happinessData.happiness_points}</div>
              <div className="text-gray-600 mb-4">Level: {happinessData.user_level}</div>
              <div className="text-sm text-gray-600">
                Earn points by completing practices, reducing attachments, and maintaining consistency
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t-2 border-gray-200">
              <button
                onClick={onBack}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50"
              >
                ← Back to Dashboard
              </button>
              
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 transition-all duration-200 transform hover:-translate-y-1 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
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

export default UniversalUserProfile;