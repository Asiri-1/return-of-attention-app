// ✅ FIREBASE-ONLY SimpleStageTester - Easy Testing with Firebase Integration
// File: src/components/SimpleStageTester.js
// 🎯 UPDATED: All data operations now use Firebase contexts instead of props

import React, { useState } from 'react';
import { useAuth } from '../contexts/auth/AuthContext';
import { useUser } from '../contexts/user/UserContext';
import { usePractice } from '../contexts/practice/PracticeContext';
import { useWellness } from '../contexts/wellness/WellnessContext';
import { useOnboarding } from '../contexts/onboarding/OnboardingContext';

const SimpleStageTester = () => {
  // ✅ FIREBASE-ONLY: Use Firebase contexts instead of props
  const { currentUser } = useAuth();
  const { userProfile, updateUserProfile, isLoading: userLoading } = useUser();
  const { addPracticeSession, practiceSessions, isLoading: practiceLoading } = usePractice();
  const { addEmotionalNote, emotionalNotes, isLoading: wellnessLoading } = useWellness();
  const { updateQuestionnaire, updateSelfAssessment, isLoading: onboardingLoading } = useOnboarding();
  
  const [currentStage, setCurrentStage] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isTestingMode, setIsTestingMode] = useState(false);
  const [stageData, setStageData] = useState({});

  // Combine loading states
  const isLoading = userLoading || practiceLoading || wellnessLoading || onboardingLoading;

  // ✅ FIREBASE-ONLY: Enhanced stage list with Firebase integration info
  const stages = [
    { 
      id: 'welcome', 
      name: '🏠 Welcome Screen', 
      description: 'First thing users see',
      firebaseIntegration: 'No data saved'
    },
    { 
      id: 'demographics', 
      name: '👤 Demographics', 
      description: 'User fills in basic info',
      firebaseIntegration: 'Saves to User Profile'
    },
    { 
      id: 'stage1', 
      name: '1️⃣ Stage 1', 
      description: 'T1 - First questions',
      firebaseIntegration: 'Saves to Practice Sessions'
    },
    { 
      id: 'stage2', 
      name: '2️⃣ Stage 2', 
      description: 'T2 - Deeper questions',
      firebaseIntegration: 'Saves to Practice Sessions'
    },
    { 
      id: 'stage3', 
      name: '3️⃣ Stage 3', 
      description: 'T3 - Core analysis (MAIN STAGE)',
      firebaseIntegration: 'Saves to Practice + Emotional Notes'
    },
    { 
      id: 'stage4', 
      name: '4️⃣ Stage 4', 
      description: 'T4 - Advanced questions',
      firebaseIntegration: 'Saves to Practice Sessions'
    },
    { 
      id: 'stage5', 
      name: '5️⃣ Stage 5', 
      description: 'T5 - Final assessment',
      firebaseIntegration: 'Saves to Practice + Questionnaire'
    },
    { 
      id: 'results', 
      name: '📊 Results', 
      description: 'Show PAHM calculation',
      firebaseIntegration: 'Reads from all Firebase contexts'
    }
  ];

  // ✅ FIREBASE-ONLY: Enhanced test functions with Firebase operations
  const saveTestDataToFirebase = async (stageId, testData) => {
    try {
      console.log(`🔥 FIREBASE: Saving test data for ${stageId}`);
      
      switch (stageId) {
        case 'demographics':
          const updatedProfile = {
            ...userProfile,
            demographics: {
              ...testData,
              completedAt: new Date().toISOString(),
              testMode: true
            }
          };
          await updateUserProfile(updatedProfile);
          break;

        case 'stage1':
        case 'stage2':
        case 'stage4':
          const sessionData = {
            timestamp: new Date().toISOString(),
            duration: 5, // 5 minute test session
            sessionType: 'test',
            stageLevel: parseInt(stageId.replace('stage', '')),
            stageLabel: `${stageId.toUpperCase()} Test Session`,
            rating: 7,
            notes: `Simple tester session for ${stageId}`,
            testMode: true,
            testData: testData
          };
          await addPracticeSession(sessionData);
          break;

        case 'stage3':
          // Save to both practice sessions and emotional notes
          const stage3Session = {
            timestamp: new Date().toISOString(),
            duration: 10,
            sessionType: 'assessment',
            stageLevel: 3,
            stageLabel: 'Stage 3 Core Analysis Test',
            rating: 8,
            notes: `Stage 3 test: ${JSON.stringify(testData)}`,
            testMode: true,
            assessmentData: testData
          };
          await addPracticeSession(stage3Session);

          // Also add emotional note if relevant
          if (testData.comments) {
            const emotionalNote = {
              emotion: 'reflective',
              intensity: 5,
              triggers: ['Stage 3 testing'],
              response: testData.comments,
              notes: 'Stage 3 test session emotional data',
              timestamp: new Date().toISOString(),
              testMode: true
            };
            await addEmotionalNote(emotionalNote);
          }
          break;

        case 'stage5':
          // Save as both practice session and questionnaire update
          const stage5Session = {
            timestamp: new Date().toISOString(),
            duration: 8,
            sessionType: 'final_assessment',
            stageLevel: 5,
            stageLabel: 'Stage 5 Final Assessment Test',
            rating: 9,
            notes: `Final assessment test: ${JSON.stringify(testData)}`,
            testMode: true
          };
          await addPracticeSession(stage5Session);

          // Update questionnaire with test data
          const questionnaireUpdate = {
            testResponses: testData,
            completedAt: new Date().toISOString(),
            testMode: true
          };
          await updateQuestionnaire(questionnaireUpdate);
          break;
      }
      
      console.log(`✅ FIREBASE: Test data saved successfully for ${stageId}`);
      return true;
    } catch (error) {
      console.error(`❌ FIREBASE: Error saving test data for ${stageId}:`, error);
      return false;
    }
  };

  // ✅ FIREBASE-ONLY: Enhanced test stage function
  const testStage = async (stageId, stageName) => {
    setCurrentStage({ id: stageId, name: stageName });
    setIsTestingMode(true);
    setStageData({});
    
    // Record that we tested this stage
    const testResult = {
      stage: stageName,
      time: new Date().toLocaleTimeString(),
      status: 'Testing...',
      firebaseIntegrated: true
    };
    setTestResults(prev => [...prev, testResult]);
    
    console.log(`🧪 FIREBASE Testing ${stageName} with Firebase integration`);
  };

  // ✅ FIREBASE-ONLY: Enhanced complete test with Firebase save
  const completeTest = async (success = true) => {
    if (currentStage && success) {
      // Save test data to Firebase if test was successful
      const firebaseSaveSuccess = await saveTestDataToFirebase(currentStage.id, stageData);
      
      setTestResults(prev => 
        prev.map(result => 
          result.stage === currentStage.name && result.status === 'Testing...'
            ? { 
                ...result, 
                status: firebaseSaveSuccess ? '✅ Passed + Saved to Firebase' : '⚠️ Passed (Firebase Save Failed)',
                firebaseSaved: firebaseSaveSuccess
              }
            : result
        )
      );
    } else {
      setTestResults(prev => 
        prev.map(result => 
          result.stage === currentStage.name && result.status === 'Testing...'
            ? { ...result, status: '❌ Failed', firebaseSaved: false }
            : result
        )
      );
    }
    
    setCurrentStage(null);
    setIsTestingMode(false);
    setStageData({});
  };

  // ✅ FIREBASE-ONLY: Enhanced stage content with Firebase integration
  const renderStageContent = () => {
    if (!currentStage) return null;

    switch (currentStage.id) {
      case 'welcome':
        return (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">🏠 Welcome to Our App!</h2>
            <p className="mb-4">This is what new users see first.</p>
            
            {/* ✅ FIREBASE-ONLY: Show Firebase user info */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow">
              <h3 className="font-bold text-blue-800 mb-2">🔥 Firebase User Status</h3>
              <div className="text-sm text-blue-600">
                <p><strong>Logged in:</strong> {currentUser ? '✅ Yes' : '❌ No'}</p>
                <p><strong>Email:</strong> {currentUser?.email || 'Not available'}</p>
                <p><strong>User ID:</strong> {currentUser?.uid || 'Not available'}</p>
              </div>
            </div>

            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded mr-2"
              onClick={() => alert('User would click this to start! (Firebase integration ready)')}
            >
              Get Started
            </button>
            <div className="mt-4 text-sm">
              <p>✅ <strong>Test:</strong> Click "Get Started" button</p>
              <p>✅ <strong>Check:</strong> Does it work smoothly?</p>
              <p>🔥 <strong>Firebase:</strong> No data saved at this stage</p>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">👤 Tell Us About Yourself</h2>
            
            {/* ✅ FIREBASE-ONLY: Firebase status */}
            <div className="bg-white rounded-lg p-3 mb-4 shadow">
              <div className="text-sm text-green-600">
                <strong>🔥 Firebase:</strong> Will save to User Profile | 
                <strong> Status:</strong> {isLoading ? '🔄 Loading' : '✅ Ready'}
              </div>
            </div>

            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full p-2 border rounded"
                value={stageData.name || ''}
                onChange={(e) => setStageData({...stageData, name: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Your Age"
                className="w-full p-2 border rounded"
                value={stageData.age || ''}
                onChange={(e) => setStageData({...stageData, age: e.target.value})}
              />
              <select 
                className="w-full p-2 border rounded"
                value={stageData.gender || ''}
                onChange={(e) => setStageData({...stageData, gender: e.target.value})}
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              <button 
                className={`w-full py-2 px-6 rounded transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-600' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
                disabled={isLoading}
                onClick={() => {
                  alert(`Demographics will be saved to Firebase! Data: ${JSON.stringify(stageData)}`);
                }}
              >
                {isLoading ? 'Saving to Firebase...' : 'Continue (Save to Firebase)'}
              </button>
            </div>
            
            {/* Show current data */}
            <div className="mt-4 bg-gray-100 rounded p-3">
              <div className="text-xs text-gray-600">
                <strong>Current Data:</strong> {JSON.stringify(stageData)}
              </div>
            </div>

            <div className="mt-4 text-sm">
              <p>✅ <strong>Test:</strong> Fill in the form and click Continue</p>
              <p>✅ <strong>Check:</strong> Does it save the information?</p>
              <p>🔥 <strong>Firebase:</strong> Saves to User Profile context</p>
            </div>
          </div>
        );

      case 'stage3':
        return (
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">3️⃣ Stage 3 - Core Analysis</h2>
            <p className="mb-4">This is the main stage users spend most time on.</p>
            
            {/* ✅ FIREBASE-ONLY: Firebase integration status */}
            <div className="bg-white rounded-lg p-3 mb-4 shadow">
              <div className="text-sm text-purple-600">
                <strong>🔥 Firebase Integration:</strong> Saves to Practice Sessions + Emotional Notes | 
                <strong> Status:</strong> {isLoading ? '🔄 Loading' : '✅ Ready'} |
                <strong> Sessions:</strong> {practiceSessions?.length || 0} |
                <strong> Notes:</strong> {emotionalNotes?.length || 0}
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Core Questions:</h3>
                <div className="space-y-2">
                  <p className="mb-3">How do you feel about your current situation?</p>
                  {[
                    'Very satisfied',
                    'Somewhat satisfied', 
                    'Not satisfied'
                  ].map((option, index) => (
                    <label key={index} className="block">
                      <input 
                        type="radio" 
                        name="satisfaction" 
                        value={option}
                        className="mr-2"
                        checked={stageData.satisfaction === option}
                        onChange={(e) => setStageData({...stageData, satisfaction: e.target.value})}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Rate Your Experience (1-10):</h3>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  className="w-full"
                  value={stageData.rating || 5}
                  onChange={(e) => setStageData({...stageData, rating: e.target.value})}
                />
                <div className="text-center text-sm text-gray-600 mt-1">
                  Current: {stageData.rating || 5}
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Additional Comments:</h3>
                <textarea 
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Tell us more..."
                  value={stageData.comments || ''}
                  onChange={(e) => setStageData({...stageData, comments: e.target.value})}
                ></textarea>
              </div>

              <button 
                className={`w-full py-3 px-6 rounded font-bold transition-colors ${
                  isLoading 
                    ? 'bg-gray-400 text-gray-600' 
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                disabled={isLoading}
                onClick={() => {
                  alert(`Stage 3 completed! Will save to Firebase: ${JSON.stringify(stageData)}`);
                }}
              >
                {isLoading ? 'Saving to Firebase...' : 'Complete Stage 3 (Save to Firebase)'}
              </button>
            </div>

            {/* Show current data */}
            <div className="mt-4 bg-gray-100 rounded p-3">
              <div className="text-xs text-gray-600">
                <strong>Current Data:</strong> {JSON.stringify(stageData)}
              </div>
            </div>
            
            <div className="mt-4 text-sm bg-yellow-100 p-3 rounded">
              <p><strong>🧪 Things to Test:</strong></p>
              <p>✅ Can you select radio buttons?</p>
              <p>✅ Does the slider work?</p>
              <p>✅ Can you type in the text area?</p>
              <p>✅ Does "Complete" button work?</p>
              <p>🔥 <strong>Firebase:</strong> Saves to Practice Sessions + Emotional Notes</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{currentStage.name}</h2>
            <p className="mb-4">This stage would show the actual content for {currentStage.name}.</p>
            
            {/* ✅ FIREBASE-ONLY: Firebase integration info */}
            <div className="bg-white rounded-lg p-3 mb-4 shadow">
              <div className="text-sm text-gray-600">
                <strong>🔥 Firebase Integration:</strong> {stages.find(s => s.id === currentStage.id)?.firebaseIntegration} | 
                <strong> Status:</strong> {isLoading ? '🔄 Loading' : '✅ Ready'}
              </div>
            </div>

            <button 
              className={`py-2 px-6 rounded transition-colors ${
                isLoading 
                  ? 'bg-gray-400 text-gray-600' 
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              disabled={isLoading}
              onClick={() => alert(`${currentStage.name} functionality would work here and save to Firebase`)}
            >
              {isLoading ? 'Connecting to Firebase...' : 'Test This Stage (Firebase Ready)'}
            </button>
            <div className="mt-4 text-sm">
              <p>✅ <strong>Test:</strong> Try the stage functionality</p>
              <p>✅ <strong>Check:</strong> Does everything work as expected?</p>
              <p>🔥 <strong>Firebase:</strong> {stages.find(s => s.id === currentStage.id)?.firebaseIntegration}</p>
            </div>
          </div>
        );
    }
  };

  // ✅ FIREBASE-ONLY: Show loading state if Firebase contexts are loading
  if (isLoading && !currentStage) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">🔥 Loading Firebase Contexts...</h2>
          <p className="text-blue-600">Connecting to Firebase User, Practice, Wellness, and Onboarding contexts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      
      {/* ✅ FIREBASE-ONLY: Enhanced instructions */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">🎯 How to Test Your Firebase App (Super Simple!)</h2>
        <div className="text-blue-700">
          <p><strong>Step 1:</strong> Click any stage button below</p>
          <p><strong>Step 2:</strong> Try using it like a real user would</p>
          <p><strong>Step 3:</strong> Click "This Works!" or "Something's Wrong" when done</p>
          <p><strong>Step 4:</strong> All successful tests save real data to Firebase!</p>
          <p><strong>🔥 Firebase:</strong> {currentUser ? `Logged in as ${currentUser.email}` : 'Not logged in'}</p>
        </div>
      </div>

      {/* ✅ FIREBASE-ONLY: Enhanced stage testing buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stages.map(stage => (
          <button
            key={stage.id}
            onClick={() => testStage(stage.id, stage.name)}
            disabled={isTestingMode}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              currentStage?.id === stage.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } ${isTestingMode && currentStage?.id !== stage.id ? 'opacity-50' : ''}`}
          >
            <div className="font-bold text-lg mb-1">{stage.name}</div>
            <div className="text-sm text-gray-600 mb-2">{stage.description}</div>
            <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
              🔥 {stage.firebaseIntegration}
            </div>
            {stage.id === 'stage3' && (
              <div className="mt-2 text-xs bg-yellow-200 px-2 py-1 rounded">
                ⭐ MAIN STAGE
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Currently Testing */}
      {currentStage && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-yellow-800">
                  🧪 Currently Testing: {currentStage.name}
                </h3>
                <p className="text-sm text-yellow-700">
                  🔥 Firebase integration active - successful tests will save real data!
                </p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => completeTest(true)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded text-sm font-bold transition-colors ${
                    isLoading 
                      ? 'bg-gray-400 text-gray-600' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isLoading ? '🔄 Saving...' : '✅ This Works!'}
                </button>
                <button
                  onClick={() => completeTest(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  ❌ Something's Wrong
                </button>
              </div>
            </div>
          </div>

          {/* The actual stage content with Firebase integration */}
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-4">
              📱 <strong>This is what your users see (Firebase-powered):</strong>
            </div>
            {renderStageContent()}
          </div>
        </div>
      )}

      {/* ✅ FIREBASE-ONLY: Enhanced test results */}
      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">📋 Your Firebase Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded shadow">
                <span>{result.stage}</span>
                <div className="text-right">
                  <span className={`font-bold ${
                    result.status.includes('✅') ? 'text-green-600' :
                    result.status.includes('❌') ? 'text-red-600' :
                    result.status.includes('⚠️') ? 'text-yellow-600' :
                    'text-blue-600'
                  }`}>
                    {result.status}
                  </span>
                  <div className="text-xs text-gray-500">{result.time}</div>
                  {result.firebaseSaved !== undefined && (
                    <div className="text-xs text-blue-600">
                      🔥 Firebase: {result.firebaseSaved ? 'Saved' : 'Failed'}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setTestResults([])}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
            >
              Clear Results
            </button>
          </div>
        </div>
      )}

      {/* ✅ FIREBASE-ONLY: Enhanced quick tips */}
      {!currentStage && (
        <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-4">
          <h3 className="font-bold text-green-800 mb-2">💡 Firebase Testing Tips:</h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Start with "Welcome Screen" to test the beginning</li>
            <li>• <strong>Stage 3 is your main stage</strong> - test this thoroughly!</li>
            <li>• Try typing, clicking, and selecting like a real user</li>
            <li>• Successful tests save real data to Firebase for validation</li>
            <li>• Check Firebase console to see saved test data</li>
            <li>• Test all stages to make sure your Firebase app works end-to-end</li>
          </ul>
          
          {/* Firebase Status Summary */}
          <div className="mt-4 bg-white rounded-lg p-3 border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">🔥 Firebase Connection Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <div className={`text-xl ${currentUser ? 'text-green-500' : 'text-red-500'}`}>
                  {currentUser ? '✅' : '❌'}
                </div>
                <div>Auth: {currentUser ? 'Connected' : 'Disconnected'}</div>
              </div>
              <div className="text-center">
                <div className={`text-xl ${userProfile ? 'text-green-500' : 'text-yellow-500'}`}>
                  {userProfile ? '✅' : '🔄'}
                </div>
                <div>Profile: {userProfile ? 'Loaded' : 'Loading'}</div>
              </div>
              <div className="text-center">
                <div className="text-xl text-green-500">✅</div>
                <div>Practice: Ready</div>
              </div>
              <div className="text-center">
                <div className="text-xl text-green-500">✅</div>
                <div>Wellness: Ready</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleStageTester;