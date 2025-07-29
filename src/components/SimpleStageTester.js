import React, { useState } from 'react';

const SimpleStageTester = ({ contexts }) => {
  const [currentStage, setCurrentStage] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [isTestingMode, setIsTestingMode] = useState(false);

  // Simple stage list - just click to test!
  const stages = [
    { id: 'welcome', name: '🏠 Welcome Screen', description: 'First thing users see' },
    { id: 'demographics', name: '👤 Demographics', description: 'User fills in basic info' },
    { id: 'stage1', name: '1️⃣ Stage 1', description: 'T1 - First questions' },
    { id: 'stage2', name: '2️⃣ Stage 2', description: 'T2 - Deeper questions' },
    { id: 'stage3', name: '3️⃣ Stage 3', description: 'T3 - Core analysis (MAIN STAGE)' },
    { id: 'stage4', name: '4️⃣ Stage 4', description: 'T4 - Advanced questions' },
    { id: 'stage5', name: '5️⃣ Stage 5', description: 'T5 - Final assessment' },
    { id: 'results', name: '📊 Results', description: 'Show PAHM calculation' }
  ];

  // Simple test for each stage
  const testStage = (stageId, stageName) => {
    setCurrentStage({ id: stageId, name: stageName });
    setIsTestingMode(true);
    
    // Record that we tested this stage
    const testResult = {
      stage: stageName,
      time: new Date().toLocaleTimeString(),
      status: 'Testing...'
    };
    setTestResults(prev => [...prev, testResult]);
    
    console.log(`🧪 Testing ${stageName}`);
  };

  // Mark test as complete
  const completeTest = (success = true) => {
    if (currentStage) {
      setTestResults(prev => 
        prev.map(result => 
          result.stage === currentStage.name && result.status === 'Testing...'
            ? { ...result, status: success ? '✅ Passed' : '❌ Failed' }
            : result
        )
      );
    }
    setCurrentStage(null);
    setIsTestingMode(false);
  };

  // Render actual stage content (simplified versions)
  const renderStageContent = () => {
    if (!currentStage) return null;

    switch (currentStage.id) {
      case 'welcome':
        return (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">🏠 Welcome to Our App!</h2>
            <p className="mb-4">This is what new users see first.</p>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded mr-2"
              onClick={() => alert('User would click this to start!')}
            >
              Get Started
            </button>
            <div className="mt-4 text-sm">
              <p>✅ <strong>Test:</strong> Click "Get Started" button</p>
              <p>✅ <strong>Check:</strong> Does it work smoothly?</p>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">👤 Tell Us About Yourself</h2>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full p-2 border rounded"
              />
              <input 
                type="number" 
                placeholder="Your Age"
                className="w-full p-2 border rounded"
              />
              <select className="w-full p-2 border rounded">
                <option>Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <button 
                className="bg-green-600 text-white px-6 py-2 rounded"
                onClick={() => alert('Demographics saved!')}
              >
                Continue
              </button>
            </div>
            <div className="mt-4 text-sm">
              <p>✅ <strong>Test:</strong> Fill in the form and click Continue</p>
              <p>✅ <strong>Check:</strong> Does it save the information?</p>
            </div>
          </div>
        );

      case 'stage3':
        return (
          <div className="bg-purple-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">3️⃣ Stage 3 - Core Analysis</h2>
            <p className="mb-4">This is the main stage users spend most time on.</p>
            
            <div className="space-y-6">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Core Questions:</h3>
                <div className="space-y-2">
                  <label className="block">
                    <input type="radio" name="q1" className="mr-2" />
                    How do you feel about your current situation?
                  </label>
                  <label className="block">
                    <input type="radio" name="q1" className="mr-2" />
                    Very satisfied
                  </label>
                  <label className="block">
                    <input type="radio" name="q1" className="mr-2" />
                    Somewhat satisfied
                  </label>
                  <label className="block">
                    <input type="radio" name="q1" className="mr-2" />
                    Not satisfied
                  </label>
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Rate Your Experience (1-10):</h3>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  className="w-full"
                  onChange={(e) => console.log('Rating:', e.target.value)}
                />
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-bold mb-3">Additional Comments:</h3>
                <textarea 
                  className="w-full p-2 border rounded"
                  rows="3"
                  placeholder="Tell us more..."
                ></textarea>
              </div>

              <button 
                className="bg-purple-600 text-white px-6 py-2 rounded"
                onClick={() => alert('Stage 3 completed! Moving to Stage 4...')}
              >
                Complete Stage 3
              </button>
            </div>
            
            <div className="mt-4 text-sm bg-yellow-100 p-3 rounded">
              <p><strong>🧪 Things to Test:</strong></p>
              <p>✅ Can you select radio buttons?</p>
              <p>✅ Does the slider work?</p>
              <p>✅ Can you type in the text area?</p>
              <p>✅ Does "Complete" button work?</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">{currentStage.name}</h2>
            <p className="mb-4">This stage would show the actual content for {currentStage.name}.</p>
            <button 
              className="bg-gray-600 text-white px-6 py-2 rounded"
              onClick={() => alert(`${currentStage.name} functionality would work here`)}
            >
              Test This Stage
            </button>
            <div className="mt-4 text-sm">
              <p>✅ <strong>Test:</strong> Try the stage functionality</p>
              <p>✅ <strong>Check:</strong> Does everything work as expected?</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      
      {/* Simple Instructions */}
      <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-bold text-blue-800 mb-2">🎯 How to Test Your App (Super Simple!)</h2>
        <div className="text-blue-700">
          <p><strong>Step 1:</strong> Click any stage button below</p>
          <p><strong>Step 2:</strong> Try using it like a real user would</p>
          <p><strong>Step 3:</strong> Click "This Works!" or "Something's Wrong" when done</p>
          <p><strong>Step 4:</strong> Repeat for all stages</p>
        </div>
      </div>

      {/* Stage Testing Buttons */}
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
            <div className="text-sm text-gray-600">{stage.description}</div>
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
              <h3 className="text-lg font-bold text-yellow-800">
                🧪 Currently Testing: {currentStage.name}
              </h3>
              <div className="space-x-2">
                <button
                  onClick={() => completeTest(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm"
                >
                  ✅ This Works!
                </button>
                <button
                  onClick={() => completeTest(false)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  ❌ Something's Wrong
                </button>
              </div>
            </div>
          </div>

          {/* The actual stage content */}
          <div className="border-2 border-dashed border-gray-400 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-4">
              📱 <strong>This is what your users see:</strong>
            </div>
            {renderStageContent()}
          </div>
        </div>
      )}

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-bold mb-3">📋 Your Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                <span>{result.stage}</span>
                <div className="text-right">
                  <span className={`font-bold ${
                    result.status === '✅ Passed' ? 'text-green-600' :
                    result.status === '❌ Failed' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    {result.status}
                  </span>
                  <div className="text-xs text-gray-500">{result.time}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setTestResults([])}
              className="bg-gray-600 text-white px-4 py-2 rounded text-sm"
            >
              Clear Results
            </button>
          </div>
        </div>
      )}

      {/* Quick Tips */}
      {!currentStage && (
        <div className="mt-6 bg-green-50 border border-green-300 rounded-lg p-4">
          <h3 className="font-bold text-green-800 mb-2">💡 Quick Tips:</h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• Start with "Welcome Screen" to test the beginning</li>
            <li>• <strong>Stage 3 is your main stage</strong> - test this thoroughly!</li>
            <li>• Try typing, clicking, and selecting like a real user</li>
            <li>• If something doesn't work, click "Something's Wrong"</li>
            <li>• Test all stages to make sure your app works end-to-end</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SimpleStageTester;