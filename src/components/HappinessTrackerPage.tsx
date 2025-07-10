import React from 'react';
import { useAuth } from '../AuthContext';
// ✅ FIXED: Import the corrected HappinessProgressTracker
import HappinessProgressTracker from '../HappinessProgressTracker';
import { useLocalData } from '../contexts/LocalDataContext';

// 🚀 SIMPLIFIED HAPPINESS TRACKER PAGE - Uses LocalDataContext
const HappinessTrackerPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { practiceSessions, getQuestionnaire, getSelfAssessment } = useLocalData();

  // 📊 Quick stats for page header
  const totalSessions = practiceSessions?.length || 0;
  const totalHours = practiceSessions?.reduce((sum, session) => sum + (session.duration || 0), 0) / 60 || 0;
  const hasData = totalSessions > 0 || getQuestionnaire() || getSelfAssessment();

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
            
            {/* 📊 Quick Stats Badge */}
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl px-6 py-4">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-700">{totalSessions}</div>
                  <div className="text-xs text-indigo-600 font-medium">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{totalHours.toFixed(1)}h</div>
                  <div className="text-xs text-purple-600 font-medium">Practice Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎭 WELCOME MESSAGE FOR NEW USERS */}
      {!hasData && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-3xl p-8 text-center border-2 border-blue-200">
            <div className="text-6xl mb-4">🧘</div>
            <h2 className="text-2xl font-bold text-blue-800 mb-4">Welcome to Your Present Attention Journey!</h2>
            <p className="text-blue-700 mb-6 max-w-2xl mx-auto">
              Your happiness tracking will appear here as you complete practice sessions, questionnaires, and self-assessments. 
              Present attention is a skill that develops through consistent practice - every moment of awareness counts!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-xl p-6">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="font-bold text-gray-800 mb-2">Complete Questionnaire</h3>
                <p className="text-sm text-gray-600">Share your current state and goals to establish your baseline</p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="text-3xl mb-3">🧘</div>
                <h3 className="font-bold text-gray-800 mb-2">Start Practicing</h3>
                <p className="text-sm text-gray-600">Begin with just 5 minutes of present attention practice</p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-bold text-gray-800 mb-2">Track Progress</h3>
                <p className="text-sm text-gray-600">Watch your happiness and skills grow over time</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🎯 MAIN HAPPINESS TRACKER COMPONENT */}
      {/* ✅ FIXED: Simplified - no props needed, uses LocalDataContext directly */}
      {hasData && <HappinessProgressTracker />}

      {/* 🌟 PRESENT ATTENTION GUIDANCE SECTION */}
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

          {/* 🎯 PRACTICE BENEFITS */}
          <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl">
            <h3 className="text-lg font-bold text-center text-indigo-800 mb-4">🌈 Benefits of Regular Present Attention Practice</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Reduced stress and anxiety</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Improved focus and concentration</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Better emotional regulation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Enhanced self-awareness</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Greater life satisfaction</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Improved relationships</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Increased resilience</span>
                </div>
                <div className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  <span className="text-gray-700">Natural sense of well-being</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🎯 PRACTICE TIPS */}
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
      {hasData && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">🌟 Continue Your Present Attention Journey</h2>
            <p className="mb-6 opacity-90">
              Your practice is building skills that last a lifetime. Each moment of awareness contributes to greater happiness and peace.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors">
                🧘 Start Practice Session
              </button>
              <button className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors border-2 border-white border-opacity-50">
                📊 View Detailed Stats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HappinessTrackerPage;