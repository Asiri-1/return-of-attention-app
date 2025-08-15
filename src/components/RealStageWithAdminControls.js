// ✅ FIREBASE-ONLY RealStageWithAdminControls - Complete Admin Testing with Firebase Integration + Stage 6
// File: src/components/RealStageWithAdminControls.js
// 🎯 UPDATED: All data operations now use Firebase contexts + Added Stage 6 (30 hours)

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { useUser } from '../contexts/user/UserContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';

const RealStageWithAdminControls = () => {
  // ✅ FIREBASE-ONLY: Use Firebase contexts instead of props
  const { currentUser } = useAuth();
  const { userProfile, updateUserProfile, isLoading: userLoading } = useUser();
  const { addPracticeSession, isLoading: practiceLoading } = usePractice();
  const { addEmotionalNote, isLoading: wellnessLoading } = useWellness();
  const { updateQuestionnaire, updateSelfAssessment, isLoading: onboardingLoading } = useOnboarding();
  
  const [currentStage, setCurrentStage] = useState(null);
  const [adminControlsVisible, setAdminControlsVisible] = useState(true);
  const [stageTimer, setStageTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stageData, setStageData] = useState({});

  // Combine loading states
  const isLoading = userLoading || practiceLoading || wellnessLoading || onboardingLoading;

  // ✅ UPDATED: Your app stages with Stage 6 added (30 hours requirement)
  const stages = [
    { id: 'welcome', name: '🏠 Welcome Screen', hasTimer: false },
    { id: 'demographics', name: '👤 Demographics', hasTimer: false },
    { id: 'stage1', name: '1️⃣ Stage 1 - T1', hasTimer: true, duration: 300, hoursRequired: 5 }, // 5 minutes, 5 hours
    { id: 'stage2', name: '2️⃣ Stage 2 - T2', hasTimer: true, duration: 480, hoursRequired: 10 }, // 8 minutes, 10 hours
    { id: 'stage3', name: '3️⃣ Stage 3 - T3', hasTimer: true, duration: 600, hoursRequired: 15 }, // 10 minutes, 15 hours
    { id: 'stage4', name: '4️⃣ Stage 4 - T4', hasTimer: true, duration: 540, hoursRequired: 20 }, // 9 minutes, 20 hours
    { id: 'stage5', name: '5️⃣ Stage 5 - T5', hasTimer: true, duration: 420, hoursRequired: 25 }, // 7 minutes, 25 hours
    { id: 'stage6', name: '6️⃣ Stage 6 - T6', hasTimer: true, duration: 900, hoursRequired: 30 }, // 15 minutes, 30 hours
    { id: 'results', name: '📊 Results & PAHM', hasTimer: false }
  ];

  // Timer effect - this runs your real stage timers
  useEffect(() => {
    let interval;
    if (isTimerRunning && stageTimer > 0) {
      interval = setInterval(() => {
        setStageTimer(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            alert('⏰ Time completed! Stage can now advance.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, stageTimer]);

  // ✅ FIREBASE-ONLY: Enhanced start stage test with Firebase integration
  const startStageTest = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    setCurrentStage(stage);
    setStageData({});
    
    if (stage.hasTimer) {
      setStageTimer(stage.duration);
      setIsTimerRunning(true);
    }
    
    console.log(`🧪 FIREBASE Admin: Starting real test of ${stage.name} with Firebase integration`);
  };

  // ✅ FIREBASE-ONLY: Enhanced data saving functions
  const saveDemographicsToFirebase = async (data) => {
    try {
      console.log('🔥 FIREBASE: Saving demographics to Firebase');
      const updatedProfile = {
        ...userProfile,
        demographics: {
          name: data.name,
          age: parseInt(data.age),
          gender: data.gender,
          completedAt: new Date().toISOString()
        }
      };
      await updateUserProfile(updatedProfile);
      console.log('✅ FIREBASE: Demographics saved successfully');
      return true;
    } catch (error) {
      console.error('❌ FIREBASE: Error saving demographics:', error);
      return false;
    }
  };

  const saveStage3ToFirebase = async (data) => {
    try {
      console.log('🔥 FIREBASE: Saving Stage 3 assessment to Firebase');
      
      // Save as practice session
      const sessionData = {
        timestamp: new Date().toISOString(),
        duration: 10, // 10 minute assessment
        sessionType: 'assessment',
        stageLevel: 3,
        stageLabel: 'Stage 3: Core Happiness Analysis',
        rating: 8,
        notes: `Core happiness assessment completed. Satisfaction: ${data.satisfaction || 'N/A'}`,
        assessmentData: data
      };

      await addPracticeSession(sessionData);

      // Also save as emotional note if relevant
      if (data.challenges || data.joy_sources) {
        const emotionalNoteData = {
          emotion: 'reflective',
          intensity: 5,
          triggers: [data.challenges || 'Assessment reflection'],
          response: data.joy_sources || 'Reflecting on life satisfaction',
          notes: `Stage 3 assessment: Joy sources and current challenges identified`,
          timestamp: new Date().toISOString()
        };
        await addEmotionalNote(emotionalNoteData);
      }

      console.log('✅ FIREBASE: Stage 3 data saved successfully');
      return true;
    } catch (error) {
      console.error('❌ FIREBASE: Error saving Stage 3 data:', error);
      return false;
    }
  };

  // ✅ NEW: Save Stage 6 to Firebase with advanced session data
  const saveStage6ToFirebase = async (data) => {
    try {
      console.log('🔥 FIREBASE: Saving Stage 6 advanced session to Firebase');
      
      // Save as practice session with enhanced metadata
      const sessionData = {
        timestamp: new Date().toISOString(),
        duration: 15, // 15 minute advanced session
        sessionType: 'advanced_meditation',
        stageLevel: 6,
        stageLabel: 'Stage 6: Advanced Present Attention Practice',
        rating: data.session_rating || 9,
        notes: `Advanced Stage 6 session completed. Focus quality: ${data.focus_quality || 'Excellent'}, Insights: ${data.insights || 'Deep awareness achieved'}`,
        advancedData: {
          focusQuality: data.focus_quality,
          distractionLevel: data.distraction_level,
          awarenessDepth: data.awareness_depth,
          insights: data.insights,
          techniques: data.techniques_used || [],
          environment: data.environment,
          emotionalState: data.emotional_state
        },
        environment: {
          posture: data.posture || 'seated',
          location: data.location || 'quiet_space',
          lighting: data.lighting || 'natural',
          sounds: data.sounds || 'silence'
        }
      };

      await addPracticeSession(sessionData);

      // Save advanced insights as emotional note
      if (data.insights || data.emotional_state) {
        const emotionalNoteData = {
          emotion: data.emotional_state || 'peaceful',
          intensity: parseInt(data.awareness_depth) || 8,
          triggers: ['Advanced meditation practice'],
          response: data.insights || 'Deep present moment awareness achieved',
          notes: `Stage 6 advanced practice: ${data.focus_quality} focus quality, insights gained about present attention`,
          timestamp: new Date().toISOString()
        };
        await addEmotionalNote(emotionalNoteData);
      }

      console.log('✅ FIREBASE: Stage 6 advanced data saved successfully');
      return true;
    } catch (error) {
      console.error('❌ FIREBASE: Error saving Stage 6 data:', error);
      return false;
    }
  };

  const saveStageSessionToFirebase = async (stageId, duration) => {
    try {
      console.log(`🔥 FIREBASE: Saving ${stageId} session to Firebase`);
      
      const stageInfo = stages.find(s => s.id === stageId);
      const sessionData = {
        timestamp: new Date().toISOString(),
        duration: Math.round(duration / 60), // Convert seconds to minutes
        sessionType: stageId.includes('stage') ? 'meditation' : 'assessment',
        stageLevel: parseInt(stageId.replace('stage', '') || '0'),
        stageLabel: stageInfo?.name || stageId,
        rating: stageId === 'stage6' ? 9 : 7, // Higher rating for advanced Stage 6
        notes: `Admin test session for ${stageId}${stageId === 'stage6' ? ' - Advanced practice level' : ''}`,
        hoursRequirement: stageInfo?.hoursRequired || 0,
        environment: {
          posture: 'seated',
          location: 'testing',
          lighting: 'artificial',
          sounds: 'quiet'
        }
      };

      await addPracticeSession(sessionData);
      console.log('✅ FIREBASE: Stage session saved successfully');
      return true;
    } catch (error) {
      console.error('❌ FIREBASE: Error saving stage session:', error);
      return false;
    }
  };

  // Admin fast forward controls
  const fastForwardTimer = () => {
    if (stageTimer > 60) {
      setStageTimer(60); // Skip to last minute
    } else {
      setStageTimer(0); // Complete immediately
      setIsTimerRunning(false);
    }
  };

  const completeStageNow = async () => {
    setStageTimer(0);
    setIsTimerRunning(false);
    
    // ✅ FIREBASE-ONLY: Save session to Firebase when completed
    if (currentStage.hasTimer) {
      const originalDuration = currentStage.duration;
      await saveStageSessionToFirebase(currentStage.id, originalDuration);
    }
    
    alert(`✅ FIREBASE Admin: ${currentStage.name} completed instantly and saved to Firebase!`);
  };

  const pauseResumeTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ✅ NEW: Stage 6 content with advanced meditation features
  const renderStage6Content = () => {
    return (
      <div className="real-stage-content bg-gradient-to-b from-indigo-100 to-purple-50 p-8 rounded-lg">
        {/* Stage 6 Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-800 mb-2">Stage 6: Advanced Present Attention Practice</h2>
          <p className="text-indigo-700">Mastery level meditation - requires 30 hours of practice experience</p>
          
          {/* ✅ FIREBASE-ONLY: Firebase status */}
          <div className="bg-white rounded-lg p-4 mt-4 shadow-lg inline-block">
            <h3 className="text-sm font-bold text-indigo-800 mb-2">🔥 Firebase Integration</h3>
            <div className="text-xs text-indigo-600">
              <p>Saves to: Advanced Practice Sessions & Deep Insights</p>
              <p>Required: 30 hours total practice time</p>
              <p>Status: {isLoading ? '🔄 Ready to save' : '✅ Connected'}</p>
            </div>
          </div>
          
          {/* REAL TIMER DISPLAY for Stage 6 */}
          {currentStage.hasTimer && (
            <div className="mt-4 bg-white rounded-lg p-4 shadow-lg inline-block">
              <div className="text-2xl font-bold text-indigo-600">
                ⏰ {formatTime(stageTimer)}
              </div>
              <div className="text-sm text-indigo-500">
                {isTimerRunning ? 'Advanced practice time remaining' : 'Timer paused'}
              </div>
              <div className="w-64 bg-indigo-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${((currentStage.duration - stageTimer) / currentStage.duration) * 100}%` 
                  }}
                ></div>
              </div>
              <div className="text-xs text-indigo-600 mt-1">
                15-minute advanced session
              </div>
            </div>
          )}
        </div>

        {/* REAL STAGE 6 CONTENT with advanced features */}
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Advanced Practice Setup */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-indigo-500">
            <h3 className="text-xl font-bold text-indigo-800 mb-4">
              🧘‍♂️ Advanced Practice Setup
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-indigo-700 font-semibold mb-2">Meditation Posture</label>
                <select 
                  className="w-full p-3 border-2 border-indigo-300 rounded-lg focus:border-indigo-500"
                  value={stageData.posture || ''}
                  onChange={(e) => setStageData({...stageData, posture: e.target.value})}
                >
                  <option value="">Select posture</option>
                  <option value="seated_floor">Seated on floor (lotus/cross-legged)</option>
                  <option value="seated_chair">Seated on chair</option>
                  <option value="standing">Standing meditation</option>
                  <option value="walking">Walking meditation</option>
                </select>
              </div>
              <div>
                <label className="block text-indigo-700 font-semibold mb-2">Environment</label>
                <select 
                  className="w-full p-3 border-2 border-indigo-300 rounded-lg focus:border-indigo-500"
                  value={stageData.environment || ''}
                  onChange={(e) => setStageData({...stageData, environment: e.target.value})}
                >
                  <option value="">Select environment</option>
                  <option value="indoor_quiet">Indoor - Quiet space</option>
                  <option value="indoor_background">Indoor - Background sounds</option>
                  <option value="outdoor_nature">Outdoor - Nature sounds</option>
                  <option value="outdoor_urban">Outdoor - Urban setting</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Techniques Selection */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-purple-800 mb-4">
              🎯 Advanced Attention Techniques
            </h3>
            <div className="space-y-3">
              <p className="text-purple-700 mb-4">Select the techniques you'll focus on in this advanced session:</p>
              {[
                'Sustained single-pointed attention',
                'Open awareness monitoring',
                'Meta-cognitive awareness',
                'Present moment anchoring',
                'Effortless attention',
                'Non-dual awareness'
              ].map((technique, index) => (
                <label key={index} className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="mr-3 text-purple-600"
                    checked={stageData.techniques_used?.includes(technique) || false}
                    onChange={(e) => {
                      const currentTechniques = stageData.techniques_used || [];
                      const updatedTechniques = e.target.checked
                        ? [...currentTechniques, technique]
                        : currentTechniques.filter(t => t !== technique);
                      setStageData({...stageData, techniques_used: updatedTechniques});
                    }}
                  />
                  <span className="text-purple-700">{technique}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Session Quality Assessment */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-green-500">
            <h3 className="text-xl font-bold text-green-800 mb-4">
              📊 Advanced Session Assessment
            </h3>
            <div className="space-y-6">
              
              {/* Focus Quality */}
              <div>
                <label className="block text-green-700 font-semibold mb-2">Focus Quality</label>
                <div className="space-y-2">
                  {[
                    'Exceptional - Effortless sustained attention',
                    'Excellent - Strong focus with minimal drift',
                    'Good - Consistent attention with some wandering',
                    'Moderate - Regular attention with frequent returns',
                    'Developing - Learning to sustain attention'
                  ].map((option, index) => (
                    <label key={index} className="flex items-center">
                      <input 
                        type="radio" 
                        name="focus_quality" 
                        value={option}
                        className="mr-3 text-green-600"
                        checked={stageData.focus_quality === option}
                        onChange={(e) => setStageData({...stageData, focus_quality: e.target.value})}
                      />
                      <span className="text-green-700">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Distraction Level */}
              <div>
                <p className="text-green-700 font-semibold mb-3">Distraction Level (1-10)</p>
                <div className="px-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={stageData.distraction_level || 3}
                    className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer"
                    onChange={(e) => setStageData({...stageData, distraction_level: e.target.value})}
                  />
                  <div className="flex justify-between text-sm text-green-600 mt-1">
                    <span>1 (No distractions)</span>
                    <span>Current: {stageData.distraction_level || 3}</span>
                    <span>10 (Very distracted)</span>
                  </div>
                </div>
              </div>

              {/* Awareness Depth */}
              <div>
                <p className="text-green-700 font-semibold mb-3">Awareness Depth (1-10)</p>
                <div className="px-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={stageData.awareness_depth || 7}
                    className="w-full h-3 bg-green-200 rounded-lg appearance-none cursor-pointer"
                    onChange={(e) => setStageData({...stageData, awareness_depth: e.target.value})}
                  />
                  <div className="flex justify-between text-sm text-green-600 mt-1">
                    <span>1 (Surface level)</span>
                    <span>Current: {stageData.awareness_depth || 7}</span>
                    <span>10 (Profound depth)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Insights */}
          <div className="bg-white rounded-lg p-6 shadow-lg border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-yellow-800 mb-4">
              💡 Advanced Practice Insights
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-yellow-700 font-semibold mb-2">
                  Key insights or realizations from this session
                </label>
                <textarea 
                  rows="3"
                  className="w-full p-3 border-2 border-yellow-300 rounded-lg focus:border-yellow-500"
                  placeholder="Describe any insights about present attention, awareness, or meditation practice..."
                  value={stageData.insights || ''}
                  onChange={(e) => setStageData({...stageData, insights: e.target.value})}
                ></textarea>
              </div>
              <div>
                <label className="block text-yellow-700 font-semibold mb-2">
                  Emotional state during practice
                </label>
                <select 
                  className="w-full p-3 border-2 border-yellow-300 rounded-lg focus:border-yellow-500"
                  value={stageData.emotional_state || ''}
                  onChange={(e) => setStageData({...stageData, emotional_state: e.target.value})}
                >
                  <option value="">Select emotional state</option>
                  <option value="peaceful">Peaceful and calm</option>
                  <option value="joyful">Joyful and uplifted</option>
                  <option value="focused">Focused and alert</option>
                  <option value="relaxed">Relaxed and at ease</option>
                  <option value="neutral">Neutral/balanced</option>
                  <option value="restless">Restless or agitated</option>
                  <option value="sleepy">Drowsy or sleepy</option>
                </select>
              </div>
              <div>
                <label className="block text-yellow-700 font-semibold mb-2">
                  Session Rating (1-10)
                </label>
                <div className="px-2">
                  <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1"
                    value={stageData.session_rating || 8}
                    className="w-full h-3 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
                    onChange={(e) => setStageData({...stageData, session_rating: e.target.value})}
                  />
                  <div className="flex justify-between text-sm text-yellow-600 mt-1">
                    <span>1 (Poor session)</span>
                    <span>Rating: {stageData.session_rating || 8}</span>
                    <span>10 (Exceptional session)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Data Preview for Testing */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-bold text-gray-800 mb-2">📊 Current Firebase Data (Stage 6):</h4>
            <pre className="text-xs text-gray-600 overflow-auto">
              {JSON.stringify(stageData, null, 2)}
            </pre>
          </div>

          {/* Stage 6 Completion with Firebase Save */}
          <div className="text-center">
            <button 
              className={`
                px-8 py-4 rounded-lg font-bold text-lg transition-all
                ${stageTimer > 0 || isLoading
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                }
              `}
              disabled={stageTimer > 0 || isLoading}
              onClick={async () => {
                const success = await saveStage6ToFirebase(stageData);
                if (success) {
                  alert('✅ FIREBASE: Stage 6 Advanced Practice completed and saved to Firebase! Master level achieved!');
                } else {
                  alert('❌ FIREBASE: Error saving Stage 6. Please try again.');
                }
              }}
            >
              {stageTimer > 0 
                ? `Complete in ${formatTime(stageTimer)}` 
                : isLoading 
                  ? 'Saving Advanced Session to Firebase...'
                  : 'Complete Stage 6 Advanced Practice → Save to Firebase'
              }
            </button>
            {stageTimer > 0 && (
              <p className="text-sm text-indigo-600 mt-2">
                Take your time with this advanced 15-minute practice session
              </p>
            )}
            {isLoading && (
              <p className="text-sm text-indigo-600 mt-2">
                🔥 Saving your advanced practice data to Firebase cloud...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ✅ FIREBASE-ONLY: Enhanced stage content with Firebase integration
  const renderRealStageContent = () => {
    if (!currentStage) return null;

    switch (currentStage.id) {
      case 'welcome':
        return (
          <div className="real-stage-content bg-gradient-to-b from-blue-100 to-blue-50 p-8 rounded-lg">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-800 mb-6">
                Welcome to Your Happiness Assessment
              </h1>
              <p className="text-lg text-blue-700 mb-4">
                This comprehensive assessment will help us understand your current state and guide you towards greater happiness.
              </p>
              
              {/* ✅ FIREBASE-ONLY: Show current user info */}
              <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
                <h3 className="text-lg font-bold text-blue-800 mb-2">🔥 Firebase User Info</h3>
                <div className="text-sm text-blue-600">
                  <p><strong>Email:</strong> {currentUser?.email || 'Not logged in'}</p>
                  <p><strong>User ID:</strong> {currentUser?.uid || 'N/A'}</p>
                  <p><strong>Profile Loaded:</strong> {userProfile ? '✅ Yes' : '❌ No'}</p>
                  <p><strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ Complete'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
                  onClick={() => {
                    console.log('🚀 FIREBASE: User proceeding to demographics with Firebase');
                    alert('User would proceed to demographics (Firebase-powered)');
                  }}
                >
                  Begin Assessment
                </button>
                <p className="text-sm text-blue-600">
                  This assessment takes approximately 30-40 minutes and saves to Firebase
                </p>
              </div>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="real-stage-content bg-gradient-to-b from-green-100 to-green-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-6">Tell Us About Yourself</h2>
            
            {/* ✅ FIREBASE-ONLY: Firebase status indicator */}
            <div className="bg-white rounded-lg p-4 mb-6 shadow-lg">
              <h3 className="text-lg font-bold text-green-800 mb-2">🔥 Firebase Status</h3>
              <div className="text-sm text-green-600">
                <p><strong>Saving to:</strong> Firebase User Profile</p>
                <p><strong>Status:</strong> {isLoading ? '🔄 Saving...' : '✅ Ready'}</p>
              </div>
            </div>

            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-green-700 font-semibold mb-2">Full Name *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500"
                  placeholder="Enter your full name"
                  value={stageData.name || ''}
                  onChange={(e) => setStageData({...stageData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-green-700 font-semibold mb-2">Age *</label>
                <input 
                  type="number" 
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500"
                  placeholder="Your age"
                  min="18" max="100"
                  value={stageData.age || ''}
                  onChange={(e) => setStageData({...stageData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-green-700 font-semibold mb-2">Gender *</label>
                <select 
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500"
                  value={stageData.gender || ''}
                  onChange={(e) => setStageData({...stageData, gender: e.target.value})}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <button 
                className={`w-full font-bold py-3 px-6 rounded-lg transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={isLoading || !stageData.name || !stageData.age || !stageData.gender}
                onClick={async () => {
                  const success = await saveDemographicsToFirebase(stageData);
                  if (success) {
                    alert('✅ FIREBASE: Demographics saved! Proceeding to Stage 1...');
                  } else {
                    alert('❌ FIREBASE: Error saving demographics. Please try again.');
                  }
                }}
              >
                {isLoading ? 'Saving to Firebase...' : 'Continue to Assessment'}
              </button>
              
              {/* Show current data for testing */}
              <div className="bg-gray-100 rounded-lg p-3 text-sm">
                <strong>Current Data:</strong><br/>
                {JSON.stringify(stageData, null, 2)}
              </div>
            </div>
          </div>
        );

      case 'stage3':
        return (
          <div className="real-stage-content bg-gradient-to-b from-purple-100 to-purple-50 p-8 rounded-lg">
            {/* Real Stage 3 Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-purple-800 mb-2">Stage 3: Core Happiness Analysis</h2>
              <p className="text-purple-700">Deep dive into your happiness patterns and core experiences</p>
              
              {/* ✅ FIREBASE-ONLY: Firebase status */}
              <div className="bg-white rounded-lg p-4 mt-4 shadow-lg inline-block">
                <h3 className="text-sm font-bold text-purple-800 mb-2">🔥 Firebase Integration</h3>
                <div className="text-xs text-purple-600">
                  <p>Saves to: Practice Sessions & Emotional Notes</p>
                  <p>Status: {isLoading ? '🔄 Ready to save' : '✅ Connected'}</p>
                </div>
              </div>
              
              {/* REAL TIMER DISPLAY */}
              {currentStage.hasTimer && (
                <div className="mt-4 bg-white rounded-lg p-4 shadow-lg inline-block">
                  <div className="text-2xl font-bold text-purple-600">
                    ⏰ {formatTime(stageTimer)}
                  </div>
                  <div className="text-sm text-purple-500">
                    {isTimerRunning ? 'Time remaining' : 'Timer paused'}
                  </div>
                  <div className="w-64 bg-purple-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${((currentStage.duration - stageTimer) / currentStage.duration) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* REAL STAGE 3 CONTENT with Firebase integration */}
            <div className="max-w-2xl mx-auto space-y-8">
              
              {/* Question Block 1 */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-800 mb-4">
                  Core Happiness Assessment
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-purple-700 mb-3">
                      How would you rate your overall life satisfaction right now?
                    </p>
                    <div className="space-y-2">
                      {[
                        'Extremely satisfied',
                        'Very satisfied', 
                        'Moderately satisfied',
                        'Slightly satisfied',
                        'Not satisfied at all'
                      ].map((option, index) => (
                        <label key={index} className="flex items-center">
                          <input 
                            type="radio" 
                            name="satisfaction" 
                            value={option}
                            className="mr-3 text-purple-600"
                            checked={stageData.satisfaction === option}
                            onChange={(e) => setStageData({
                              ...stageData, 
                              satisfaction: e.target.value
                            })}
                          />
                          <span className="text-purple-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Block 2 */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-800 mb-4">
                  Emotional Well-being Scale
                </h3>
                <div className="space-y-4">
                  <p className="text-purple-700">
                    On a scale of 1-10, how emotionally balanced do you feel?
                  </p>
                  <div className="px-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1"
                      value={stageData.emotional_balance || 5}
                      className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      onChange={(e) => setStageData({
                        ...stageData, 
                        emotional_balance: e.target.value
                      })}
                    />
                    <div className="flex justify-between text-sm text-purple-600 mt-1">
                      <span>1 (Very unbalanced)</span>
                      <span>Current: {stageData.emotional_balance || 5}</span>
                      <span>10 (Perfectly balanced)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Block 3 */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-800 mb-4">
                  Life Areas Assessment
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Career/Work',
                    'Relationships',
                    'Health & Fitness',
                    'Personal Growth',
                    'Finance',
                    'Recreation/Hobbies'
                  ].map((area, index) => {
                    const fieldKey = area.toLowerCase().replace(/[^a-z]/g, '_');
                    return (
                      <div key={index} className="space-y-2">
                        <label className="text-purple-700 font-semibold">{area}</label>
                        <select 
                          className="w-full p-2 border-2 border-purple-300 rounded focus:border-purple-500"
                          value={stageData[fieldKey] || ''}
                          onChange={(e) => setStageData({
                            ...stageData,
                            [fieldKey]: e.target.value
                          })}
                        >
                          <option value="">Rate this area</option>
                          <option value="excellent">Excellent</option>
                          <option value="good">Good</option>
                          <option value="average">Average</option>
                          <option value="poor">Poor</option>
                          <option value="very_poor">Very Poor</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Open-ended Questions */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h3 className="text-xl font-bold text-purple-800 mb-4">
                  Personal Insights
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-purple-700 font-semibold mb-2">
                      What brings you the most joy in life?
                    </label>
                    <textarea 
                      rows="3"
                      className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500"
                      placeholder="Share what makes you happiest..."
                      value={stageData.joy_sources || ''}
                      onChange={(e) => setStageData({...stageData, joy_sources: e.target.value})}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-purple-700 font-semibold mb-2">
                      What challenges are you currently facing?
                    </label>
                    <textarea 
                      rows="3"
                      className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500"
                      placeholder="Describe any current challenges..."
                      value={stageData.challenges || ''}
                      onChange={(e) => setStageData({...stageData, challenges: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Current Data Preview for Testing */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-bold text-gray-800 mb-2">📊 Current Firebase Data:</h4>
                <pre className="text-xs text-gray-600 overflow-auto">
                  {JSON.stringify(stageData, null, 2)}
                </pre>
              </div>

              {/* Stage Completion with Firebase Save */}
              <div className="text-center">
                <button 
                  className={`
                    px-8 py-4 rounded-lg font-bold text-lg transition-all
                    ${stageTimer > 0 || isLoading
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }
                  `}
                  disabled={stageTimer > 0 || isLoading}
                  onClick={async () => {
                    const success = await saveStage3ToFirebase(stageData);
                    if (success) {
                      alert('✅ FIREBASE: Stage 3 completed and saved to Firebase! Moving to Stage 4...');
                    } else {
                      alert('❌ FIREBASE: Error saving Stage 3. Please try again.');
                    }
                  }}
                >
                  {stageTimer > 0 
                    ? `Complete in ${formatTime(stageTimer)}` 
                    : isLoading 
                      ? 'Saving to Firebase...'
                      : 'Complete Stage 3 → Save to Firebase'
                  }
                </button>
                {stageTimer > 0 && (
                  <p className="text-sm text-purple-600 mt-2">
                    Please take your time to complete this important stage
                  </p>
                )}
                {isLoading && (
                  <p className="text-sm text-purple-600 mt-2">
                    🔥 Saving your responses to Firebase cloud...
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 'stage6':
        return renderStage6Content();

      default:
        const stageInfo = stages.find(s => s.id === currentStage.id);
        return (
          <div className="real-stage-content bg-gradient-to-b from-gray-100 to-gray-50 p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{stageInfo.name}</h2>
              
              {/* ✅ FIREBASE-ONLY: Firebase integration status */}
              <div className="bg-white rounded-lg p-4 mt-4 shadow-lg inline-block">
                <h3 className="text-sm font-bold text-gray-800 mb-2">🔥 Firebase Ready</h3>
                <div className="text-xs text-gray-600">
                  <p>Will save to: Practice Sessions</p>
                  <p>Hours Required: {stageInfo.hoursRequired || 'N/A'}</p>
                  <p>User: {currentUser?.email || 'Not logged in'}</p>
                </div>
              </div>
              
              {/* Timer for stages that have it */}
              {stageInfo.hasTimer && (
                <div className="mt-4 bg-white rounded-lg p-4 shadow-lg inline-block">
                  <div className="text-2xl font-bold text-blue-600">
                    ⏰ {formatTime(stageTimer)}
                  </div>
                  <div className="text-sm text-blue-500">
                    {isTimerRunning ? 'Time remaining' : 'Timer paused'}
                  </div>
                  <div className="w-64 bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${((stageInfo.duration - stageTimer) / stageInfo.duration) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="max-w-2xl mx-auto bg-white rounded-lg p-6 shadow-lg">
              <p className="text-gray-700 mb-4">
                This is where your real {stageInfo.name} content would appear.
                Users would see all the actual questions, inputs, and interactions for this stage.
                <br/><br/>
                <strong>🔥 Firebase Integration:</strong> All data will be saved to Firebase contexts upon completion.
                <br/>
                <strong>📊 Hours Required:</strong> {stageInfo.hoursRequired} hours total practice time
              </p>
              <button 
                className={`
                  px-6 py-3 rounded-lg font-bold transition-all
                  ${stageTimer > 0 || isLoading
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                `}
                disabled={stageTimer > 0 || isLoading}
                onClick={async () => {
                  const success = await saveStageSessionToFirebase(stageInfo.id, stageInfo.duration || 0);
                  if (success) {
                    alert(`✅ FIREBASE: ${stageInfo.name} completed and saved to Firebase!`);
                  } else {
                    alert(`❌ FIREBASE: Error saving ${stageInfo.name}. Please try again.`);
                  }
                }}
              >
                {stageTimer > 0 
                  ? `Complete in ${formatTime(stageTimer)}` 
                  : isLoading
                    ? 'Saving to Firebase...'
                    : `Complete ${stageInfo.name} → Save to Firebase`
                }
              </button>
            </div>
          </div>
        );
    }
  };

  // ✅ FIREBASE-ONLY: Show loading state
  if (isLoading && !currentStage) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">🔥 Loading Firebase Contexts...</h2>
          <p className="text-blue-600">Connecting to Firebase User, Practice, Wellness, and Onboarding contexts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* ✅ FIREBASE-ONLY: Enhanced admin controls bar */}
      {adminControlsVisible && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">🔧 FIREBASE ADMIN TESTING MODE</h3>
              <p className="text-red-100 text-sm">
                Real user experience with Firebase integration + admin fast-forward controls
              </p>
              <div className="text-red-100 text-xs mt-1">
                👤 User: {currentUser?.email || 'Not logged in'} | 
                🔥 Firebase: {isLoading ? '🔄 Loading' : '✅ Connected'} |
                📊 Profile: {userProfile ? '✅ Loaded' : '❌ Missing'} |
                🎯 Stages: 1-6 (5, 10, 15, 20, 25, 30 hours)
              </div>
            </div>
            <button
              onClick={() => setAdminControlsVisible(false)}
              className="bg-red-800 px-3 py-1 rounded text-sm"
            >
              Hide Admin Controls
            </button>
          </div>
        </div>
      )}

      {/* ✅ UPDATED: Stage Selection with Stage 6 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stages.map(stage => (
          <button
            key={stage.id}
            onClick={() => startStageTest(stage.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              currentStage?.id === stage.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="font-bold">{stage.name}</div>
            <div className="text-sm text-gray-600">
              {stage.hasTimer ? `⏰ ${Math.floor(stage.duration/60)}min` : 'No timer'}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              🔥 Firebase integrated
              {stage.hoursRequired && (
                <span className="block">📊 {stage.hoursRequired}h required</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Active Stage Testing */}
      {currentStage && (
        <div>
          {/* ✅ FIREBASE-ONLY: Enhanced admin fast forward controls */}
          {adminControlsVisible && currentStage.hasTimer && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-yellow-800">⚡ Firebase Admin Fast Forward Controls</h4>
                  <p className="text-yellow-700 text-sm">Skip timers, complete stages instantly, and save to Firebase for testing</p>
                  <p className="text-yellow-600 text-xs">
                    🔥 All completions will save real data to Firebase contexts
                    {currentStage.hoursRequired && (
                      <span className="block">📊 Testing {currentStage.name} - {currentStage.hoursRequired} hours requirement</span>
                    )}
                  </p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={pauseResumeTimer}
                    className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                  >
                    {isTimerRunning ? '⏸️ Pause' : '▶️ Resume'}
                  </button>
                  <button
                    onClick={fastForwardTimer}
                    className="bg-orange-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ⏩ Fast Forward
                  </button>
                  <button
                    onClick={completeStageNow}
                    disabled={isLoading}
                    className={`px-3 py-1 rounded text-sm text-white ${
                      isLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {isLoading ? '🔄 Saving...' : '✅ Complete + Save to Firebase'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* The REAL Stage Content with Firebase Integration */}
          <div className="border-4 border-dashed border-blue-300 rounded-lg p-4">
            <div className="text-center text-blue-600 font-bold mb-4">
              👇 REAL USER EXPERIENCE - Firebase Integrated - Exactly what users see 👇
            </div>
            {renderRealStageContent()}
          </div>
        </div>
      )}

      {/* ✅ FIREBASE-ONLY: Enhanced instructions with Stage 6 info */}
      {!currentStage && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">🎯 Firebase-Integrated Real User Experience Testing - Stages 1-6:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">1. Select Any Stage (1-6)</h4>
              <p className="text-sm mb-4">Click any stage button to see the REAL user experience with Firebase integration</p>
              
              <h4 className="font-semibold mb-2">2. Firebase Data Operations</h4>
              <p className="text-sm">All data saves to real Firebase contexts: User, Practice, Wellness, Onboarding</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Stage 6 - NEW Advanced Practice</h4>
              <p className="text-sm mb-4">15-minute advanced meditation requiring 30 hours total practice time</p>
              
              <h4 className="font-semibold mb-2">4. Hours-Based Progression</h4>
              <p className="text-sm">Stage 1: 5h → Stage 2: 10h → Stage 3: 15h → Stage 4: 20h → Stage 5: 25h → Stage 6: 30h</p>
            </div>
          </div>
          
          {/* ✅ UPDATED: Firebase Status Summary with Stage 6 info */}
          <div className="mt-6 bg-white rounded-lg p-4 border-2 border-blue-200">
            <h4 className="font-bold text-blue-800 mb-3">🔥 Firebase Integration Status - Complete Stage System (1-6)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className={`text-2xl mb-1 ${currentUser ? 'text-green-500' : 'text-red-500'}`}>
                  {currentUser ? '✅' : '❌'}
                </div>
                <div className="font-semibold">Auth</div>
                <div className="text-xs text-gray-600">
                  {currentUser ? 'Logged In' : 'Not Logged In'}
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl mb-1 ${userProfile ? 'text-green-500' : 'text-yellow-500'}`}>
                  {userProfile ? '✅' : '🔄'}
                </div>
                <div className="font-semibold">User Profile</div>
                <div className="text-xs text-gray-600">
                  {userProfile ? 'Loaded' : 'Loading...'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 text-green-500">✅</div>
                <div className="font-semibold">Practice Context</div>
                <div className="text-xs text-gray-600">Ready (Stages 1-6)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1 text-green-500">✅</div>
                <div className="font-semibold">Wellness Context</div>
                <div className="text-xs text-gray-600">Ready</div>
              </div>
            </div>
            
            {/* ✅ NEW: Stage 6 Feature Highlight */}
            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <h5 className="font-bold text-indigo-800 mb-2">🎯 NEW: Stage 6 Advanced Features</h5>
              <div className="text-xs text-indigo-700 grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>✅ 15-minute advanced sessions</div>
                <div>✅ 30-hour progression requirement</div>
                <div>✅ Enhanced Firebase data recording</div>
                <div>✅ Advanced meditation techniques</div>
                <div>✅ Deep insight tracking</div>
                <div>✅ Master-level practice analytics</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show Admin Controls Button */}
      {!adminControlsVisible && (
        <button
          onClick={() => setAdminControlsVisible(true)}
          className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          🔧 Show Firebase Admin Controls
        </button>
      )}
    </div>
  );
};

export default RealStageWithAdminControls;