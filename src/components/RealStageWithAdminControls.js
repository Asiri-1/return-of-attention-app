import React, { useState, useEffect } from 'react';

const RealStageWithAdminControls = ({ contexts }) => {
  const [currentStage, setCurrentStage] = useState(null);
  const [adminControlsVisible, setAdminControlsVisible] = useState(true);
  const [stageTimer, setStageTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stageData, setStageData] = useState({});

  // Your actual app stages
  const stages = [
    { id: 'welcome', name: '🏠 Welcome Screen', hasTimer: false },
    { id: 'demographics', name: '👤 Demographics', hasTimer: false },
    { id: 'stage1', name: '1️⃣ Stage 1 - T1', hasTimer: true, duration: 300 }, // 5 minutes
    { id: 'stage2', name: '2️⃣ Stage 2 - T2', hasTimer: true, duration: 480 }, // 8 minutes
    { id: 'stage3', name: '3️⃣ Stage 3 - T3', hasTimer: true, duration: 600 }, // 10 minutes
    { id: 'stage4', name: '4️⃣ Stage 4 - T4', hasTimer: true, duration: 540 }, // 9 minutes
    { id: 'stage5', name: '5️⃣ Stage 5 - T5', hasTimer: true, duration: 420 }, // 7 minutes
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

  // Start testing a stage
  const startStageTest = (stageId) => {
    const stage = stages.find(s => s.id === stageId);
    setCurrentStage(stage);
    setStageData({});
    
    if (stage.hasTimer) {
      setStageTimer(stage.duration);
      setIsTimerRunning(true);
    }
    
    console.log(`🧪 Admin: Starting real test of ${stage.name}`);
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

  const completeStageNow = () => {
    setStageTimer(0);
    setIsTimerRunning(false);
    alert(`✅ Admin: ${currentStage.name} completed instantly!`);
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

  // Render the REAL stage content (this is what users actually see)
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
              <p className="text-lg text-blue-700 mb-8">
                This comprehensive assessment will help us understand your current state and guide you towards greater happiness.
              </p>
              <div className="space-y-4">
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
                  onClick={() => alert('User would proceed to demographics')}
                >
                  Begin Assessment
                </button>
                <p className="text-sm text-blue-600">
                  This assessment takes approximately 30-40 minutes
                </p>
              </div>
            </div>
          </div>
        );

      case 'demographics':
        return (
          <div className="real-stage-content bg-gradient-to-b from-green-100 to-green-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold text-green-800 mb-6">Tell Us About Yourself</h2>
            <div className="max-w-md mx-auto space-y-6">
              <div>
                <label className="block text-green-700 font-semibold mb-2">Full Name *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500"
                  placeholder="Enter your full name"
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
                  onChange={(e) => setStageData({...stageData, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-green-700 font-semibold mb-2">Gender *</label>
                <select 
                  className="w-full p-3 border-2 border-green-300 rounded-lg focus:border-green-500"
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
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                onClick={() => alert('Demographics saved! Proceeding to Stage 1...')}
              >
                Continue to Assessment
              </button>
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

            {/* REAL STAGE 3 CONTENT */}
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
                      className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                      onChange={(e) => setStageData({
                        ...stageData, 
                        emotional_balance: e.target.value
                      })}
                    />
                    <div className="flex justify-between text-sm text-purple-600 mt-1">
                      <span>1 (Very unbalanced)</span>
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
                  ].map((area, index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-purple-700 font-semibold">{area}</label>
                      <select 
                        className="w-full p-2 border-2 border-purple-300 rounded focus:border-purple-500"
                        onChange={(e) => setStageData({
                          ...stageData,
                          [area.toLowerCase().replace(/[^a-z]/g, '_')]: e.target.value
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
                  ))}
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
                      onChange={(e) => setStageData({...stageData, challenges: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Stage Completion */}
              <div className="text-center">
                <button 
                  className={`
                    px-8 py-4 rounded-lg font-bold text-lg transition-all
                    ${stageTimer > 0 
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }
                  `}
                  disabled={stageTimer > 0}
                  onClick={() => alert('Stage 3 completed! Moving to Stage 4...')}
                >
                  {stageTimer > 0 
                    ? `Complete in ${formatTime(stageTimer)}` 
                    : 'Complete Stage 3'
                  }
                </button>
                {stageTimer > 0 && (
                  <p className="text-sm text-purple-600 mt-2">
                    Please take your time to complete this important stage
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        const stageInfo = stages.find(s => s.id === currentStage.id);
        return (
          <div className="real-stage-content bg-gradient-to-b from-gray-100 to-gray-50 p-8 rounded-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">{stageInfo.name}</h2>
              
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
              </p>
              <button 
                className={`
                  px-6 py-3 rounded-lg font-bold transition-all
                  ${stageTimer > 0 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                `}
                disabled={stageTimer > 0}
                onClick={() => alert(`${stageInfo.name} completed!`)}
              >
                {stageTimer > 0 
                  ? `Complete in ${formatTime(stageTimer)}` 
                  : `Complete ${stageInfo.name}`
                }
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Admin Controls Bar */}
      {adminControlsVisible && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-6 shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">🔧 ADMIN TESTING MODE</h3>
              <p className="text-red-100 text-sm">
                You're seeing the REAL user experience with admin fast-forward controls
              </p>
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

      {/* Stage Selection */}
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
          </button>
        ))}
      </div>

      {/* Active Stage Testing */}
      {currentStage && (
        <div>
          {/* Admin Fast Forward Controls */}
          {adminControlsVisible && currentStage.hasTimer && (
            <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-yellow-800">⚡ Admin Fast Forward Controls</h4>
                  <p className="text-yellow-700 text-sm">Skip timers and complete stages instantly for testing</p>
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
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    ✅ Complete Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* The REAL Stage Content */}
          <div className="border-4 border-dashed border-blue-300 rounded-lg p-4">
            <div className="text-center text-blue-600 font-bold mb-4">
              👇 REAL USER EXPERIENCE - This is exactly what users see 👇
            </div>
            {renderRealStageContent()}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!currentStage && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-800 mb-4">🎯 How to Test Real User Experience:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">1. Select Any Stage</h4>
              <p className="text-sm">Click any stage button above to see the REAL user experience</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">2. See Real Timers & Clocks</h4>
              <p className="text-sm">Stages with timers show actual countdown clocks like users see</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">3. Use Fast Forward</h4>
              <p className="text-sm">Admin controls let you skip timers and complete stages instantly</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">4. Test Like a User</h4>
              <p className="text-sm">Fill forms, click buttons, interact exactly as users would</p>
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
          🔧 Show Admin Controls
        </button>
      )}
    </div>
  );
};

export default RealStageWithAdminControls;