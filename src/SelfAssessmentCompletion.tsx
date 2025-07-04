import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface SelfAssessmentCompletionProps {
  onGetStarted: (data?: any) => void;
  onBack: () => void;
}

const SelfAssessmentCompletion: React.FC<SelfAssessmentCompletionProps> = ({
  onGetStarted,
  onBack
}) => {
  const { markSelfAssessmentComplete, isSelfAssessmentCompleted, currentUser } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [showStages, setShowStages] = useState(false);

  useEffect(() => {
    // Animate content entrance
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowStages(true), 800);

    // 🎯 FIXED: Check existing data before any operations
    const checkAndPreserveData = async () => {
      console.log('🔍 FIXED: Checking existing self-assessment data...');
      
      try {
        // Get user profile from localStorage directly
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        const existingData = userProfile?.selfAssessmentData;
        
        if (existingData) {
          console.log('✅ FIXED: Found existing self-assessment data:', existingData);
          
          // Check if it has assessment responses (not just completion flag)
          const hasRealData = existingData.taste || existingData.responses || existingData.attachmentScore !== undefined;
          
          if (hasRealData) {
            console.log('✅ FIXED: Existing data contains real assessment responses - preserving it!');
            // Don't touch the data - it's already complete and valid
            return;
          } else {
            console.log('⚠️ FIXED: Existing data is just completion flag - might need real assessment');
          }
        } else {
          console.log('❌ FIXED: No existing self-assessment data found');
        }

        // Only mark as complete if there's no existing data AND user somehow reached this screen
        if (!isSelfAssessmentCompleted() && !existingData) {
          console.log('🔧 FIXED: User reached completion screen without data - this might be an error in flow');
          // Don't automatically mark as complete - let user retake assessment
        }
        
      } catch (error) {
        console.error('❌ FIXED: Error checking existing data:', error);
      }
    };

    checkAndPreserveData();
  }, [markSelfAssessmentComplete, isSelfAssessmentCompleted]);

  const handleGetStarted = async () => {
    // 🎯 FIXED: Never overwrite existing assessment data
    try {
      // Get user profile from localStorage directly
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const existingData = userProfile?.selfAssessmentData;
      
      if (existingData) {
        console.log('✅ FIXED: Using existing self-assessment data for navigation');
        
        const completionData = {
          completedAt: existingData.completedAt || new Date().toISOString(),
          readyForStageOne: true,
          navigateTo: 'homepage',
          selfAssessmentCompleted: true,
          preservedAssessmentData: existingData // Preserve original data
        };
        
        console.log('🚀 FIXED: Navigating with preserved data:', completionData);
        onGetStarted(completionData);
        
      } else {
        console.log('⚠️ FIXED: No assessment data found - user might need to retake assessment');
        
        // Show option to retake assessment instead of using confirm dialog
        console.log('💡 FIXED: User can click "Back" button to retake assessment for better personalization');
        
        // Continue without assessment data for now
        const completionData = {
          completedAt: new Date().toISOString(),
          readyForStageOne: true,
          navigateTo: 'homepage',
          selfAssessmentCompleted: false, // Mark as incomplete since no real data
          noAssessmentData: true
        };
        
        onGetStarted(completionData);
      }
      
    } catch (error) {
      console.error('❌ FIXED: Error in handleGetStarted:', error);
      
      // Fallback navigation
      onGetStarted({
        completedAt: new Date().toISOString(),
        readyForStageOne: true,
        navigateTo: 'homepage',
        error: 'Failed to preserve assessment data'
      });
    }
  };

  // 🎯 FIXED: Get real assessment data for display
  const getAssessmentStatus = () => {
    try {
      // Get user profile from localStorage directly
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      const assessmentData = userProfile?.selfAssessmentData;
      
      if (assessmentData) {
        const hasRealData = assessmentData.taste || assessmentData.responses || assessmentData.attachmentScore !== undefined;
        
        if (hasRealData) {
          return {
            completed: true,
            verified: true,
            message: "Complete & Verified",
            data: assessmentData
          };
        } else {
          return {
            completed: true,
            verified: false,
            message: "Complete (Basic)",
            data: assessmentData
          };
        }
      } else {
        return {
          completed: false,
          verified: false,
          message: "Not Found",
          data: null
        };
      }
    } catch (error) {
      console.error('Error getting assessment status:', error);
      return {
        completed: false,
        verified: false,
        message: "Error",
        data: null
      };
    }
  };

  const assessmentStatus = getAssessmentStatus();

  const stages = [
    {
      number: 1,
      name: "Seeker",
      title: "Physical Readiness",
      description: "Building the foundation through physical stillness",
      icon: "🧘‍♂️",
      color: "from-blue-500 to-purple-600"
    },
    {
      number: 2,
      name: "Observer", 
      title: "Understanding Thought Patterns",
      description: "Learning to observe without attachment",
      icon: "👁️",
      color: "from-purple-500 to-pink-600"
    },
    {
      number: 3,
      name: "Tracker",
      title: "Dot Tracking Practice", 
      description: "Developing sustained attention",
      icon: "🎯",
      color: "from-pink-500 to-red-600"
    },
    {
      number: 4,
      name: "Practitioner",
      title: "Tool-Free Practice",
      description: "Practicing without external supports", 
      icon: "⚡",
      color: "from-red-500 to-orange-600"
    },
    {
      number: 5,
      name: "Master",
      title: "Sustained Presence",
      description: "Maintaining presence throughout daily activities",
      icon: "✨",
      color: "from-orange-500 to-yellow-600"
    },
    {
      number: 6,
      name: "Illuminator", 
      title: "Integration & Teaching",
      description: "Fully integrating the practice into your life",
      icon: "🌟",
      color: "from-yellow-500 to-green-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* Header */}
      <div className="text-center pt-8 pb-4">
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          The Return of Attention
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          
          {/* Celebration Section */}
          <div className={`text-center mb-12 transition-all duration-1000 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Great Job!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              You've completed the self-assessment and taken the first step on your journey to greater presence and attention.
            </p>
            
            {/* 🎯 FIXED: Enhanced completion status indicator */}
            <div className="mt-4 space-y-2">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                assessmentStatus.verified 
                  ? 'bg-green-100 text-green-800' 
                  : assessmentStatus.completed 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}>
                {assessmentStatus.verified ? '✅' : assessmentStatus.completed ? '⚠️' : '❌'} 
                Self-Assessment {assessmentStatus.message}
              </div>
              
              {/* Show assessment data summary if available */}
              {assessmentStatus.data && assessmentStatus.verified && (
                <div className="text-sm text-gray-600 mt-2">
                  {assessmentStatus.data.attachmentScore !== undefined && (
                    <span>Attachment Score: {assessmentStatus.data.attachmentScore} points</span>
                  )}
                  {assessmentStatus.data.nonAttachmentCount !== undefined && (
                    <span className="ml-3">Non-attachment: {assessmentStatus.data.nonAttachmentCount}/6 categories</span>
                  )}
                </div>
              )}
              
              {/* Warning if no real data */}
              {!assessmentStatus.verified && assessmentStatus.completed && (
                <div className="text-xs text-yellow-600 mt-1">
                  ⚠️ Assessment data may be incomplete - consider retaking for better personalization
                </div>
              )}
            </div>
          </div>

          {/* Journey Overview */}
          <div className={`mb-12 transition-all duration-1000 delay-300 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Your Journey Ahead</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                The Return of Attention practice consists of six progressive stages:
              </p>
            </div>

            {/* Progress Path Visualization */}
            <div className="relative mb-8">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 to-green-300 transform -translate-y-1/2 rounded-full"></div>
              <div className="flex justify-between items-center relative z-10">
                {[1,2,3,4,5,6].map((num) => (
                  <div key={num} className="w-8 h-8 bg-white border-4 border-indigo-500 rounded-full flex items-center justify-center font-bold text-indigo-600 shadow-lg">
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stages Grid */}
          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 transition-all duration-1000 delay-500 ${showStages ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            {stages.map((stage, index) => (
              <div 
                key={stage.number}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:scale-105 cursor-pointer"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="flex items-start space-x-4">
                  {/* Stage Number with Gradient */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stage.color} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {stage.number}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{stage.icon}</span>
                      <h3 className="font-bold text-lg text-gray-800 group-hover:text-indigo-600 transition-colors">
                        {stage.name}
                      </h3>
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-2">{stage.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{stage.description}</p>
                  </div>
                </div>

                {/* Hover Effect Line */}
                <div className="mt-4 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className={`text-center transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Begin?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Click "Start Your Journey" to access your personalized dashboard and begin Stage One. 
                Each stage builds upon the previous one, creating a comprehensive path to mastery.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🚀 Start Your Journey
                </button>
                
                <button 
                  onClick={onBack}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300"
                >
                  ← Back
                </button>
              </div>

              {/* Option to retake assessment if data is incomplete */}
              {assessmentStatus.completed && !assessmentStatus.verified && (
                <div className="mt-4">
                  <button 
                    onClick={onBack}
                    className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                  >
                    🔄 Retake Assessment for Better Personalization
                  </button>
                </div>
              )}
            </div>

            {/* Trust Badge */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span>Your progress is automatically saved and secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessmentCompletion;