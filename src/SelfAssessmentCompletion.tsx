// ✅ Firebase-Only SelfAssessmentCompletion.tsx - No localStorage conflicts
// File: src/SelfAssessmentCompletion.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/auth/AuthContext';

interface SelfAssessmentCompletionProps {
  onGetStarted: (data?: any) => void;
  onBack: () => void;
}

const SelfAssessmentCompletion: React.FC<SelfAssessmentCompletionProps> = ({
  onGetStarted,
  onBack
}) => {
  // ✅ Firebase-only contexts - using AuthContext only
  const { currentUser, userProfile, updateUserProfile, isLoading: authLoading } = useAuth();
  
  const [showContent, setShowContent] = useState(false);
  const [showStages, setShowStages] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Animate content entrance
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowStages(true), 800);

    // ✅ Firebase-only: Check existing data using AuthContext
    const checkAssessmentData = async () => {
      if (!currentUser || !userProfile) {
        console.log('🔍 No user or profile data available yet');
        return;
      }

      console.log('🔍 Checking existing self-assessment data in Firebase...');
      
      try {
        // ✅ Check AuthContext userProfile customFields for assessment data
        const customFields = userProfile.customFields || {};
        const hasAssessmentData = customFields.selfAssessment || customFields.assessmentCompleted;
        
        if (hasAssessmentData) {
          console.log('✅ Found existing self-assessment data in Firebase:', customFields.selfAssessment);
          
          // Check if it has real assessment responses
          const assessmentData = customFields.selfAssessment;
          const hasRealData = assessmentData && (
            assessmentData.categories || 
            assessmentData.responses || 
            assessmentData.attachmentScore !== undefined ||
            assessmentData.format === 'standard' ||
            assessmentData.completed === true
          );
          
          if (hasRealData) {
            console.log('✅ Assessment data contains real responses - preserving it!');
          } else {
            console.log('⚠️ Assessment marked complete but missing detailed data');
          }
        } else {
          console.log('❌ No self-assessment data found in Firebase user profile');
        }
        
      } catch (error) {
        console.error('❌ Error checking Firebase assessment data:', error);
      }
    };

    checkAssessmentData();
  }, [currentUser, userProfile]);

  const handleGetStarted = async () => {
    if (!currentUser) {
      console.error('❌ No authenticated user for completion');
      return;
    }

    setLoading(true);
    
    try {
      // ✅ Firebase-only: Get assessment data from AuthContext userProfile
      const customFields = userProfile?.customFields || {};
      const assessmentData = customFields.selfAssessment;
      
      if (assessmentData) {
        console.log('✅ Using existing self-assessment data from Firebase');
        
        // ✅ Update user profile to mark onboarding complete using AuthContext
        await updateUserProfile({
          customFields: {
            ...customFields,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
            currentStage: 1, // Start at Stage 1
            readyForStageOne: true
          }
        });
        
        const completionData = {
          completedAt: assessmentData.completedAt || new Date().toISOString(),
          readyForStageOne: true,
          navigateTo: 'homepage',
          selfAssessmentCompleted: true,
          preservedAssessmentData: assessmentData,
          userId: currentUser.uid
        };
        
        console.log('🚀 Navigating with Firebase assessment data:', completionData);
        onGetStarted(completionData);
        
      } else {
        console.log('⚠️ No assessment data found in Firebase profile');
        
        // ✅ Still mark onboarding complete but note missing assessment
        await updateUserProfile({
          customFields: {
            ...customFields,
            onboardingCompleted: true,
            onboardingCompletedAt: new Date().toISOString(),
            currentStage: 1,
            readyForStageOne: true,
            assessmentSkipped: true
          }
        });
        
        const completionData = {
          completedAt: new Date().toISOString(),
          readyForStageOne: true,
          navigateTo: 'homepage',
          selfAssessmentCompleted: false,
          noAssessmentData: true,
          userId: currentUser.uid
        };
        
        console.log('🚀 Continuing without assessment data:', completionData);
        onGetStarted(completionData);
      }
      
    } catch (error) {
      console.error('❌ Error in Firebase completion process:', error);
      
      // Fallback navigation without Firebase update
      onGetStarted({
        completedAt: new Date().toISOString(),
        readyForStageOne: true,
        navigateTo: 'homepage',
        error: 'Failed to save completion to Firebase',
        userId: currentUser?.uid
      });
    } finally {
      setLoading(false);
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
          
          {/* ✅ Celebration Section */}
          <div className={`text-center mb-12 transition-all duration-1000 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="text-6xl mb-6 animate-bounce">🎉</div>
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              Great Job!
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              You've completed the self-assessment and taken the first step on your journey to greater presence and attention.
            </p>
            
            {/* ✅ Firebase loading indicator */}
            {authLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin"></div>
                <span>Syncing your progress...</span>
              </div>
            )}
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

          {/* ✅ Call to Action with Firebase integration */}
          <div className={`text-center transition-all duration-1000 delay-700 ${showContent ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'}`}>
            <div className="bg-white rounded-2xl p-8 shadow-xl max-w-2xl mx-auto border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Ready to Begin?</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Click "Start Your Journey" to access your personalized dashboard and begin Stage One. 
                Each stage builds upon the previous one, creating a comprehensive path to mastery.
              </p>
              
              {/* ✅ Show user-specific message if assessment data exists */}
              {userProfile?.customFields?.selfAssessment && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Your assessment is saved and ready!</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleGetStarted}
                  disabled={loading || authLoading}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Progress...</span>
                    </div>
                  ) : (
                    <>🚀 Start Your Journey</>
                  )}
                </button>
                
                <button 
                  onClick={onBack}
                  disabled={loading}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              <span>Your progress is automatically saved to Firebase and secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelfAssessmentCompletion;