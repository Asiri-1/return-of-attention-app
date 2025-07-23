import React, { useState, useEffect } from 'react';
// ✅ FIXED: Import both contexts for proper separation
import { useAuth } from './contexts/auth/AuthContext';
import { useOnboarding } from './contexts/onboarding/OnboardingContext';

interface SelfAssessmentCompletionProps {
  onGetStarted: (data?: any) => void;
  onBack: () => void;
}

const SelfAssessmentCompletion: React.FC<SelfAssessmentCompletionProps> = ({
  onGetStarted,
  onBack
}) => {
  // ✅ FIXED: Split the hooks - Auth for user info, OnboardingContext for data operations
  const { currentUser, userProfile } = useAuth();
  const { getSelfAssessment } = useOnboarding();
  
  const [showContent, setShowContent] = useState(false);
  const [showStages, setShowStages] = useState(false);

  useEffect(() => {
    // Animate content entrance
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowStages(true), 800);

    // ✅ FIXED: Check existing data using OnboardingContext (backend logging only)
    const checkAndPreserveData = async () => {
      console.log('🔍 FIXED: Checking existing self-assessment data via OnboardingContext...');
      
      try {
        // ✅ FIXED: Use OnboardingContext to get self-assessment data
        const existingData = getSelfAssessment();
        console.log('🔍 OnboardingContext self-assessment data:', existingData);
        
        if (existingData) {
          console.log('✅ FIXED: Found existing self-assessment data:', existingData);
          
          // Check if it has real assessment responses
          const hasRealData = existingData.categories || 
                             existingData.responses || 
                             existingData.attachmentScore !== undefined ||
                             existingData.format === 'standard' ||
                             existingData.completed === true;
          
          if (hasRealData) {
            console.log('✅ FIXED: Existing data contains real assessment responses - preserving it!');
            return;
          } else {
            console.log('⚠️ FIXED: Existing data is just completion flag - might need real assessment');
          }
        } else {
          console.log('❌ FIXED: No existing self-assessment data found in OnboardingContext');
        }

        // ✅ FIXED: Handle completion status check using OnboardingContext
        // Note: We can check if assessment exists instead of a separate completion method
        const isAssessmentCompleted = !!existingData;

        if (!isAssessmentCompleted && !existingData) {
          console.log('🔧 FIXED: User reached completion screen without data - this might be an error in flow');
        }
        
      } catch (error) {
        console.error('❌ FIXED: Error checking existing data:', error);
      }
    };

    checkAndPreserveData();
  }, [getSelfAssessment]); // ✅ FIXED: Updated dependencies

  const handleGetStarted = async () => {
    try {
      // ✅ FIXED: Get assessment data from OnboardingContext
      const existingData = getSelfAssessment();
      
      if (existingData) {
        console.log('✅ FIXED: Using existing self-assessment data for navigation');
        
        const completionData = {
          completedAt: existingData.completedAt || new Date().toISOString(),
          readyForStageOne: true,
          navigateTo: 'homepage',
          selfAssessmentCompleted: true,
          preservedAssessmentData: existingData
        };
        
        console.log('🚀 FIXED: Navigating with preserved data:', completionData);
        onGetStarted(completionData);
        
      } else {
        console.log('⚠️ FIXED: No assessment data found in OnboardingContext');
        
        // Continue without assessment data but mark as incomplete
        const completionData = {
          completedAt: new Date().toISOString(),
          readyForStageOne: true,
          navigateTo: 'homepage',
          selfAssessmentCompleted: false,
          noAssessmentData: true
        };
        
        console.log('🚀 Continuing without assessment data:', completionData);
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
          
          {/* ✅ CLEANED: Celebration Section - Removed verification and points display */}
          <div className={`text-center mb-12 transition-all duration-1000 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Great Job!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              You've completed the self-assessment and taken the first step on your journey to greater presence and attention.
            </p>
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

          {/* ✅ CLEANED: Call to Action - Removed retake assessment option */}
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
                  ← Back to Self-Assessment
                </button>
              </div>
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