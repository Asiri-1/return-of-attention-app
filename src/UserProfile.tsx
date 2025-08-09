import React, { useState, useEffect, useMemo } from 'react';

// Mock hooks for demonstration - replace with your actual implementations
const useAuth = () => ({ 
  currentUser: { 
    uid: 'demo-user-123',
    email: 'demo@example.com',
    displayName: 'Demo User'
  } 
});

const useUser = () => ({
  userProfile: {
    totalSessions: 25,
    totalMinutes: 450,
    currentStreak: 5,
    longestStreak: 12
  },
  isLoading: false
});

const usePractice = () => ({
  sessions: [
    { duration: 15, rating: 4, timestamp: '2025-01-01T10:00:00Z' },
    { duration: 20, rating: 5, timestamp: '2025-01-02T10:00:00Z' },
    { duration: 10, rating: 3, timestamp: '2025-01-03T10:00:00Z' }
  ]
});

const useWellness = () => ({
  emotionalNotes: [
    { note: 'Feeling peaceful after practice' },
    { note: 'More aware of thoughts today' }
  ]
});

const useOnboarding = () => ({
  questionnaire: {
    responses: {
      experience_level: 7,
      goals: ['Reduce stress', 'Improve focus'],
      age_range: '25-34',
      location: 'San Francisco',
      occupation: 'Software Developer',
      education_level: 'Bachelor\'s Degree',
      meditation_background: 'Some experience with apps',
      sleep_pattern: 6,
      physical_activity: 'moderate',
      stress_triggers: ['Work deadlines', 'Traffic'],
      daily_routine: 'Morning meditation, evening reflection',
      diet_pattern: 'Balanced',
      screen_time: '6-8 hours',
      social_connections: 'Good',
      work_life_balance: 'Improving',
      emotional_awareness: 8,
      stress_response: 'Usually calm',
      decision_making: 'Thoughtful',
      self_reflection: 'Daily',
      thought_patterns: 'Generally positive',
      mindfulness_in_daily_life: 'Practicing awareness',
      mindfulness_experience: 6,
      meditation_background_detail: 'Started 2 years ago',
      practice_goals: 'Consistency and depth',
      preferred_duration: '15-20',
      biggest_challenges: 'Finding time',
      motivation: 'Personal growth'
    },
    completedAt: '2025-01-01T10:00:00Z'
  },
  selfAssessment: {
    categories: {
      taste: { level: 'some', details: 'Enjoy variety but not picky', category: 'taste' },
      smell: { level: 'none', details: 'No strong preferences', category: 'smell' },
      sound: { level: 'strong', details: 'Love certain music genres', category: 'sound' },
      sight: { level: 'some', details: 'Appreciate beauty moderately', category: 'sight' },
      touch: { level: 'none', details: 'Comfortable with most textures', category: 'touch' },
      mind: { level: 'some', details: 'Working on reducing mental attachments', category: 'mind' }
    },
    metrics: {
      nonAttachmentCount: 2,
      attachmentScore: 65,
      attachmentLevel: 'Moderate'
    },
    completedAt: '2025-01-01T10:00:00Z'
  },
  getCompletionStatus: () => ({ questionnaire: true, assessment: true })
});

const useHappinessCalculation = () => ({
  userProgress: {
    happiness_points: 85,
    user_level: 'Developing Practitioner'
  },
  isCalculating: false
});

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
  const { userProfile, isLoading: userLoading } = useUser();
  const { sessions } = usePractice();
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
  
  // Get happiness data from the hook with proper fallbacks
  const happinessData = useMemo(() => ({
    happiness_points: userProgress?.happiness_points || 0,
    user_level: userProgress?.user_level || 'Beginning Seeker'
  }), [userProgress?.happiness_points, userProgress?.user_level]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
  
  // Firebase-only user statistics with proper fallbacks
  const userStats = useMemo(() => ({
    totalSessions: userProfile?.totalSessions || sessions?.length || 0,
    totalHours: Math.round(((userProfile?.totalMinutes || 0) / 60) * 10) / 10,
    currentStreak: userProfile?.currentStreak || 0,
    longestStreak: userProfile?.longestStreak || 0,
    lastSessionDate: sessions && sessions.length > 0 ? sessions[sessions.length - 1]?.timestamp : null
  }), [userProfile, sessions]);

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

  // Show loading state when happiness is being calculated OR component is loading
  if (loading || userLoading || isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
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
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <h3 className="text-lg font-semibold text-gray-700">Please sign in to view your profile</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
          
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
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-indigo-600">{happinessData.happiness_points}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Happiness Points</div>
            </div>
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-green-600">{userStats.totalSessions}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Sessions</div>
            </div>
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
              <div className="text-2xl font-bold text-yellow-600">{userStats.currentStreak}</div>
              <div className="text-xs text-gray-600 uppercase tracking-wide">Day Streak</div>
            </div>
            <div className="bg-white p-6 text-center hover:bg-gray-50 transition-colors duration-200">
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
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-green-600 mb-1">{userStats.totalSessions}</div>
                  <div className="text-sm text-green-700">Total Sessions</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{userStats.totalHours}h</div>
                  <div className="text-sm text-blue-700">Total Practice Time</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-yellow-600 mb-1">{userStats.currentStreak}</div>
                  <div className="text-sm text-yellow-700">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <div className="text-2xl font-bold text-purple-600 mb-1">{emotionalNotes?.length || 0}</div>
                  <div className="text-sm text-purple-700">Emotional Notes</div>
                </div>
              </div>
              
              {userStats.lastSessionDate && (
                <div className="text-center text-sm text-gray-600 mt-4 bg-gray-50 rounded-lg p-3">
                  Last practice session: {new Date(userStats.lastSessionDate).toLocaleDateString()}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-6 text-center shadow-lg border-2 border-purple-200">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Current Happiness Points</h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">{happinessData.happiness_points}</div>
              <div className="text-gray-600 mb-4">Level: {happinessData.user_level}</div>
              <div className="text-sm text-gray-600">
                Earn points by completing practices, reducing attachments, and maintaining consistency
              </div>
            </div>

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

export default ModernUserProfile;