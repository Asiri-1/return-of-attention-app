// src/components/AdminBypassTester.js
import React, { useState, useEffect } from 'react';

const AdminBypassTester = ({ contexts }) => {
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [adminOverlay, setAdminOverlay] = useState(true);

  // 🔄 PROGRESSION TESTING: Check actual stage unlock logic
  const [progressionTest, setProgressionTest] = useState({
    currentStage: 1,
    t1Complete: false,
    t2Complete: false,
    t3Complete: false,
    t4Complete: false,
    t5Complete: false,
    stage1Complete: false,
    stage2Unlocked: false,
    stage3Unlocked: false,
    stage4Unlocked: false,
    stage5Unlocked: false,
    stage6Unlocked: false
  });

  // 🔍 READ ACTUAL PROGRESSION STATE
  const checkRealProgressionState = () => {
    const realState = {
      currentStage: parseInt(localStorage.getItem('devCurrentStage') || '1'),
      t1Complete: localStorage.getItem('t1Complete') === 'true',
      t2Complete: localStorage.getItem('t2Complete') === 'true',
      t3Complete: localStorage.getItem('t3Complete') === 'true',
      t4Complete: localStorage.getItem('t4Complete') === 'true',
      t5Complete: localStorage.getItem('t5Complete') === 'true',
      stage1Complete: localStorage.getItem('stage1Complete') === 'true',
      stage2Unlocked: localStorage.getItem('stage2Complete') === 'true' || parseInt(localStorage.getItem('stageProgress') || '1') >= 2,
      stage3Unlocked: localStorage.getItem('stage3Complete') === 'true' || parseInt(localStorage.getItem('stageProgress') || '1') >= 3,
      stage4Unlocked: localStorage.getItem('stage4Complete') === 'true' || parseInt(localStorage.getItem('stageProgress') || '1') >= 4,
      stage5Unlocked: localStorage.getItem('stage5Complete') === 'true' || parseInt(localStorage.getItem('stageProgress') || '1') >= 5,
      stage6Unlocked: localStorage.getItem('stage6Complete') === 'true' || parseInt(localStorage.getItem('stageProgress') || '1') >= 6
    };
    setProgressionTest(realState);
    return realState;
  };

  // 🧹 RESET PROGRESSION (for testing clean slate)
  const resetAllProgression = () => {
    const keys = [
      't1Complete', 't2Complete', 't3Complete', 't4Complete', 't5Complete',
      'stage1Complete', 'stage2Complete', 'stage3Complete', 'stage4Complete', 'stage5Complete', 'stage6Complete',
      'stageProgress', 'devCurrentStage', 'currentTLevel', 'practiceReflections'
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Set back to fresh user state
    localStorage.setItem('devCurrentStage', '1');
    localStorage.setItem('stageProgress', '1');
    localStorage.setItem('currentTLevel', 't1');
    
    checkRealProgressionState();
    alert('✅ All progression reset! Now test as a fresh user.');
  };

  // 🎯 SIMULATE STAGE COMPLETION (for testing unlock logic)
  const simulateStageCompletion = (stage) => {
    switch (stage) {
      case 'T5':
        // Complete all T-levels to unlock Stage 2
        localStorage.setItem('t1Complete', 'true');
        localStorage.setItem('t2Complete', 'true');
        localStorage.setItem('t3Complete', 'true');
        localStorage.setItem('t4Complete', 'true');
        localStorage.setItem('t5Complete', 'true');
        localStorage.setItem('stage1Complete', 'true');
        localStorage.setItem('stageProgress', '2');
        localStorage.setItem('devCurrentStage', '2');
        localStorage.setItem('currentTLevel', 't6');
        alert('✅ T5 completed! Stage 2 should now be unlocked.');
        break;
      case 'Stage2':
        localStorage.setItem('stage2Complete', 'true');
        localStorage.setItem('stageProgress', '3');
        localStorage.setItem('devCurrentStage', '3');
        alert('✅ Stage 2 completed! Stage 3 should now be unlocked.');
        break;
      case 'Stage3':
        localStorage.setItem('stage3Complete', 'true');
        localStorage.setItem('stageProgress', '4');
        localStorage.setItem('devCurrentStage', '4');
        alert('✅ Stage 3 completed! Stage 4 should now be unlocked.');
        break;
      case 'Stage4':
        localStorage.setItem('stage4Complete', 'true');
        localStorage.setItem('stageProgress', '5');
        localStorage.setItem('devCurrentStage', '5');
        alert('✅ Stage 4 completed! Stage 5 should now be unlocked.');
        break;
      case 'Stage5':
        localStorage.setItem('stage5Complete', 'true');
        localStorage.setItem('stageProgress', '6');
        localStorage.setItem('devCurrentStage', '6');
        alert('✅ Stage 5 completed! Stage 6 should now be unlocked.');
        break;
    }
    checkRealProgressionState();
  };

  // Check progression state on component mount
  useEffect(() => {
    checkRealProgressionState();
  }, []);

  // 🔧 ADMIN BYPASS: Override all progression locks
  useEffect(() => {
    if (selectedComponent) {
      // Temporarily set admin bypass flags
      sessionStorage.setItem('adminBypass', 'true');
      sessionStorage.setItem('adminTesting', selectedComponent);
      
      // Override all stage locks for admin testing
      sessionStorage.setItem('t1Complete', 'true');
      sessionStorage.setItem('t2Complete', 'true'); 
      sessionStorage.setItem('t3Complete', 'true');
      sessionStorage.setItem('t4Complete', 'true');
      sessionStorage.setItem('t5Complete', 'true');
      sessionStorage.setItem('stage1Complete', 'true');
      sessionStorage.setItem('stage2Complete', 'true');
      sessionStorage.setItem('stage3Complete', 'true');
      sessionStorage.setItem('stage4Complete', 'true');
      sessionStorage.setItem('stage5Complete', 'true');
      sessionStorage.setItem('stageProgress', '6');
    }
    
    return () => {
      // Clean up admin flags when component unmounts
      sessionStorage.removeItem('adminBypass');
      sessionStorage.removeItem('adminTesting');
    };
  }, [selectedComponent]);

  // 🎯 REAL COMPONENT TESTING - Navigate to actual routes with admin bypass
  const testRealComponent = (route, componentName) => {
    console.log(`🔧 ADMIN: Testing real component - ${componentName}`);
    setSelectedComponent(componentName);
    
    // Set admin bypass mode before navigation
    sessionStorage.setItem('adminBypass', 'true');
    sessionStorage.setItem('adminOverlayEnabled', 'true');
    
    // Navigate to the REAL route using window.location
    window.location.href = route;
  };

  // 🚀 STAGE TESTING ROUTES - Your actual app routes
  const stageRoutes = [
    { 
      name: '🏠 Welcome Screen', 
      route: '/home', 
      description: 'Real homepage with user dashboard',
      component: 'HomeDashboard'
    },
    { 
      name: '📝 Questionnaire', 
      route: '/questionnaire', 
      description: 'Real questionnaire flow',
      component: 'Questionnaire'
    },
    { 
      name: '🔍 Self Assessment', 
      route: '/self-assessment', 
      description: 'Real self-assessment component',
      component: 'SelfAssessment'
    },
    { 
      name: '1️⃣ Stage 1 - T1 Practice', 
      route: '/stage1/T1', 
      description: 'Real Stage1Wrapper with T1 timer',
      component: 'Stage1Wrapper',
      highlight: true
    },
    { 
      name: '1️⃣ Stage 1 - T2 Practice', 
      route: '/stage1/T2', 
      description: 'Real Stage1Wrapper with T2 timer',
      component: 'Stage1Wrapper'
    },
    { 
      name: '1️⃣ Stage 1 - T3 Practice', 
      route: '/stage1/T3', 
      description: 'Real Stage1Wrapper with T3 timer',
      component: 'Stage1Wrapper',
      highlight: true
    },
    { 
      name: '1️⃣ Stage 1 - T4 Practice', 
      route: '/stage1/T4', 
      description: 'Real Stage1Wrapper with T4 timer',
      component: 'Stage1Wrapper'
    },
    { 
      name: '1️⃣ Stage 1 - T5 Practice', 
      route: '/stage1/T5', 
      description: 'Real Stage1Wrapper with T5 timer',
      component: 'Stage1Wrapper'
    },
    { 
      name: '2️⃣ Stage 2 - Attention', 
      route: '/stage2', 
      description: 'Real Stage2Wrapper with timers',
      component: 'Stage2Wrapper'
    },
    { 
      name: '3️⃣ Stage 3 - Core Practice', 
      route: '/stage3', 
      description: 'Real Stage3Wrapper with 10-min timer',
      component: 'Stage3Wrapper',
      highlight: true
    },
    { 
      name: '4️⃣ Stage 4 - Advanced', 
      route: '/stage4', 
      description: 'Real Stage4Wrapper with timers',
      component: 'Stage4Wrapper'
    },
    { 
      name: '5️⃣ Stage 5 - Mastery', 
      route: '/stage5', 
      description: 'Real Stage5Wrapper with timers',
      component: 'Stage5Wrapper'
    },
    { 
      name: '6️⃣ Stage 6 - Complete', 
      route: '/stage6', 
      description: 'Real Stage6Wrapper with timers',
      component: 'Stage6Wrapper'
    },
    { 
      name: '📊 Analytics', 
      route: '/analytics', 
      description: 'Real analytics dashboard',
      component: 'AnalyticsBoardWrapper'
    },
    { 
      name: '📝 Daily Notes', 
      route: '/notes', 
      description: 'Real daily notes component',
      component: 'DailyEmotionalNotesWrapper'
    },
    { 
      name: '🧘 Mind Recovery', 
      route: '/mind-recovery', 
      description: 'Real mind recovery selection',
      component: 'MindRecoverySelectionWrapper'
    },
    { 
      name: '👤 User Profile', 
      route: '/profile', 
      description: 'Real user profile page',
      component: 'UserProfile'
    }
  ];

  const stopTesting = () => {
    // Clear admin bypass flags
    sessionStorage.removeItem('adminBypass');
    sessionStorage.removeItem('adminTesting');
    sessionStorage.removeItem('adminOverlayEnabled');
    
    // Return to admin panel
    window.location.href = '/admin';
    setSelectedComponent(null);
  };

  return (
    <div className="admin-bypass-tester p-6">
      {/* 🔄 PROGRESSION TESTING PANEL */}
      <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-purple-800">
            🔄 PROGRESSION TESTING - Test Real Unlock Logic
          </h2>
          <button
            onClick={checkRealProgressionState}
            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
          >
            🔄 Refresh State
          </button>
        </div>
        
        {/* Current Progression Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-white rounded p-3 border">
            <div className="text-sm font-medium text-gray-600">Current Stage</div>
            <div className="text-2xl font-bold text-purple-600">{progressionTest.currentStage}</div>
          </div>
          <div className="bg-white rounded p-3 border">
            <div className="text-sm font-medium text-gray-600">T-Levels Complete</div>
            <div className="text-lg font-semibold">
              {[progressionTest.t1Complete, progressionTest.t2Complete, progressionTest.t3Complete, progressionTest.t4Complete, progressionTest.t5Complete].filter(Boolean).length}/5
            </div>
          </div>
          <div className="bg-white rounded p-3 border">
            <div className="text-sm font-medium text-gray-600">Stage 2 Unlocked</div>
            <div className={`text-lg font-bold ${progressionTest.stage2Unlocked ? 'text-green-600' : 'text-red-600'}`}>
              {progressionTest.stage2Unlocked ? '✅ YES' : '❌ NO'}
            </div>
          </div>
          <div className="bg-white rounded p-3 border">
            <div className="text-sm font-medium text-gray-600">Stage 3 Unlocked</div>
            <div className={`text-lg font-bold ${progressionTest.stage3Unlocked ? 'text-green-600' : 'text-red-600'}`}>
              {progressionTest.stage3Unlocked ? '✅ YES' : '❌ NO'}
            </div>
          </div>
        </div>

        {/* T-Level Completion Status */}
        <div className="mb-4">
          <div className="text-sm font-medium text-gray-700 mb-2">T-Level Completion Status:</div>
          <div className="flex space-x-2">
            {['t1Complete', 't2Complete', 't3Complete', 't4Complete', 't5Complete'].map((tLevel, index) => (
              <span
                key={tLevel}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  progressionTest[tLevel] 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}
              >
                T{index + 1}: {progressionTest[tLevel] ? '✅' : '❌'}
              </span>
            ))}
          </div>
        </div>

        {/* Testing Controls */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => simulateStageCompletion('T5')}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700"
          >
            🎯 Complete T5 → Unlock Stage 2
          </button>
          <button
            onClick={() => simulateStageCompletion('Stage2')}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            🎯 Complete Stage 2 → Unlock Stage 3
          </button>
          <button
            onClick={() => simulateStageCompletion('Stage3')}
            className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700"
          >
            🎯 Complete Stage 3 → Unlock Stage 4
          </button>
          <button
            onClick={resetAllProgression}
            className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
          >
            🧹 Reset All Progress
          </button>
          <button
            onClick={() => window.location.href = '/home'}
            className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700"
          >
            🏠 Check Home Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700"
          >
            🔄 Reload App
          </button>
        </div>
      </div>

      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-red-800">
            🔧 ADMIN BYPASS MODE - Test Real Components
          </h2>
          <div className="text-sm text-red-600 bg-red-100 px-3 py-1 rounded">
            All progression locks bypassed
          </div>
        </div>
        <p className="text-red-700 mb-3">
          <strong>What this does:</strong> Navigate to REAL app routes with admin superpowers. 
          You'll see actual timers, real forms, real user experience - but with admin bypass enabled.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
          <div className="bg-red-100 p-2 rounded">✅ Real timers & countdowns</div>
          <div className="bg-red-100 p-2 rounded">✅ Bypass all stage locks</div>
          <div className="bg-red-100 p-2 rounded">✅ Admin controls overlay</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stageRoutes.map((stage, index) => (
          <div
            key={index}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
              stage.highlight 
                ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => testRealComponent(stage.route, stage.component)}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800">{stage.name}</h3>
              {stage.highlight && (
                <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                  MAIN STAGE
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">{stage.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Route: {stage.route}</span>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-800">
                Test Now →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-800 mb-2">🎯 How Admin Bypass Testing Works:</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <div><strong>1. Click any component above</strong> → Navigate to real app route</div>
          <div><strong>2. See real user experience</strong> → Actual timers, forms, buttons</div>
          <div><strong>3. Admin powers active</strong> → Can access any stage regardless of progress</div>
          <div><strong>4. Test everything</strong> → Timers, forms, navigation, completion flows</div>
          <div><strong>5. Use browser back</strong> → Return to admin panel anytime</div>
        </div>
      </div>

      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-800 mb-2">✅ Complete Testing Workflow:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <div className="font-medium">1. Test Real Stage 3:</div>
            <div>Click "3️⃣ Stage 3" → See actual 10-minute countdown</div>
          </div>
          <div>
            <div className="font-medium">2. Test T-Level Progression:</div>
            <div>Complete T5 → Check if Stage 2 unlocks</div>
          </div>
          <div>
            <div className="font-medium">3. Test Stage Unlock Logic:</div>
            <div>Complete stages → Verify next stage unlocks</div>
          </div>
          <div>
            <div className="font-medium">4. Test Fresh User Experience:</div>
            <div>Reset all → Test as new user with locks</div>
          </div>
          <div>
            <div className="font-medium">5. Test Real User Flows:</div>
            <div>Questionnaire, self-assessment, all forms</div>
          </div>
          <div>
            <div className="font-medium">6. Test Dashboard Updates:</div>
            <div>Complete stages → Check home dashboard changes</div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-800 mb-2">🎯 Progression Testing Scenarios:</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div><strong>Scenario 1:</strong> New User → Reset all → Test T1-T5 progression → Verify Stage 2 unlocks</div>
          <div><strong>Scenario 2:</strong> Stage 2 User → Complete Stage 2 → Verify Stage 3 unlocks</div>
          <div><strong>Scenario 3:</strong> Advanced User → Test all stages accessible → Verify completion tracking</div>
          <div><strong>Scenario 4:</strong> Edge Cases → Incomplete T-levels → Verify Stage 2 stays locked</div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={stopTesting}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium"
        >
          🏠 Return to Admin Panel
        </button>
      </div>
    </div>
  );
};

export default AdminBypassTester;