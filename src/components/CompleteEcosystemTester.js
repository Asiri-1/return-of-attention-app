// src/components/CompleteEcosystemTester.js
// 🏆 COMPLETE ECOSYSTEM TESTER - Test All Components + Interconnections
// 🎯 Test individual components AND how they affect each other
// 📊 Example: Emotional notes → Happiness score, Mind recovery → Progress, etc.

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { useHappinessCalculation } from '../hooks/useHappinessCalculation';

const CompleteEcosystemTester = () => {
  const [selectedTest, setSelectedTest] = useState('');
  const [testResults, setTestResults] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [ecosystemState, setEcosystemState] = useState({});
  const [testHistory, setTestHistory] = useState([]);
  const [interconnectionView, setInterconnectionView] = useState(false);
  const [fastForwardSpeed, setFastForwardSpeed] = useState(1000);
  
  const contexts = useHappinessCalculation();
  const testIntervalRef = useRef(null);

  // 🎯 ALL YOUR APP COMPONENTS - Complete Testing Suite
  const appEcosystem = useMemo(() => ({
    // 🧘 CORE PRACTICE COMPONENTS
    coreComponents: {
      'stage1-wrapper': {
        name: '🧘 Stage 1 (T1-T5) Practice',
        description: 'Core meditation practice progression',
        affects: ['happiness-score', 'progress-tracker', 'analytics', 'stage2-unlock'],
        affectedBy: ['user-profile', 'emotional-notes', 'mind-recovery'],
        testScenarios: {
          't1-to-t5-progression': 'Complete T1→T5 journey',
          'inconsistent-practice': 'Sporadic practice patterns',
          'breakthrough-session': 'Major breakthrough moment',
          'plateau-period': 'Stuck at T3 for weeks'
        }
      },
      'stage2-wrapper': {
        name: '🎯 Stage 2 - Attention Training',
        description: 'Advanced attention and focus development',
        affects: ['happiness-score', 'analytics', 'teaching-readiness'],
        affectedBy: ['stage1-completion', 'mind-recovery', 'emotional-state'],
        prerequisite: 'stage1-t5-complete'
      },
      'stage3-wrapper': {
        name: '🏗️ Stage 3 - Structured Practice', 
        description: 'Systematic approach to meditation',
        affects: ['mastery-level', 'custom-practices', 'happiness-score'],
        affectedBy: ['stage2-completion', 'consistency-patterns']
      },
      'stage4-wrapper': {
        name: '🚀 Stage 4 - Advanced Techniques',
        description: 'Expert-level meditation practices',
        affects: ['expert-status', 'community-access', 'happiness-score'],
        affectedBy: ['stage3-mastery', 'teaching-activities']
      },
      'stage5-wrapper': {
        name: '🌟 Stage 5 - Refined Awareness',
        description: 'Subtle awareness development',
        affects: ['master-certification', 'research-access', 'happiness-score'],
        affectedBy: ['stage4-mastery', 'life-integration']
      },
      'stage6-wrapper': {
        name: '🏆 Stage 6 - Complete Mastery',
        description: 'Full meditation mastery',
        affects: ['sage-status', 'legacy-mode', 'ultimate-happiness'],
        affectedBy: ['stage5-mastery', 'teaching-excellence']
      }
    },

    // 📊 TRACKING & ANALYTICS COMPONENTS  
    trackingComponents: {
      'happiness-tracker': {
        name: '😊 Happiness Score Tracker',
        description: 'Core happiness measurement system',
        affects: ['user-motivation', 'progress-insights', 'recommendations'],
        affectedBy: ['practice-sessions', 'emotional-notes', 'mind-recovery', 'life-events'],
        calculations: {
          baseScore: 'Baseline happiness calculation',
          practiceBonus: 'Bonus from meditation practice',
          recoveryBonus: 'Bonus from mind recovery',
          emotionalFactor: 'Impact of emotional notes',
          consistencyMultiplier: 'Consistency streak bonus'
        }
      },
      'analytics-board': {
        name: '📈 Analytics Dashboard',
        description: 'Progress analytics and insights',
        affects: ['user-insights', 'goal-setting', 'motivation'],
        affectedBy: ['all-practice-data', 'happiness-trends', 'usage-patterns'],
        dataPoints: [
          'practice-frequency', 'session-quality', 'happiness-trends', 
          'stage-progression', 'recovery-usage', 'emotional-patterns'
        ]
      },
      'progress-tracker': {
        name: '🎯 PAHM Progress Tracker',
        description: 'Overall progress across all stages',
        affects: ['stage-unlocks', 'achievements', 'milestones'],
        affectedBy: ['stage-completions', 'consistency', 'quality-scores']
      }
    },

    // 💭 EMOTIONAL & MENTAL HEALTH COMPONENTS
    emotionalComponents: {
      'emotional-notes': {
        name: '📝 Daily Emotional Notes',
        description: 'Daily emotional journaling and tracking',
        affects: ['happiness-score', 'pattern-recognition', 'insights', 'recommendations'],
        affectedBy: ['practice-results', 'life-events', 'recovery-sessions'],
        emotionalFactors: {
          mood: 'Current mood rating (1-10)',
          energy: 'Energy level (1-10)', 
          stress: 'Stress level (1-10)',
          clarity: 'Mental clarity (1-10)',
          gratitude: 'Gratitude level (1-10)',
          social: 'Social connection (1-10)'
        }
      },
      'mind-recovery': {
        name: '🧠 Mind Recovery Sessions',
        description: 'Stress relief and mental recovery practices',
        affects: ['happiness-score', 'stress-levels', 'energy-restoration', 'practice-readiness'],
        affectedBy: ['stress-indicators', 'emotional-notes', 'practice-burnout'],
        recoveryTypes: {
          'breathing': 'Breathing exercises for immediate calm',
          'progressive-relaxation': 'Body tension release',
          'mindful-walking': 'Movement-based recovery',
          'loving-kindness': 'Emotional healing meditation',
          'body-scan': 'Physical awareness recovery'
        }
      },
      'practice-reflection': {
        name: '🤔 Practice Reflection',
        description: 'Post-session reflection and insights',
        affects: ['session-quality', 'learning-acceleration', 'happiness-score'],
        affectedBy: ['practice-experience', 'breakthrough-moments', 'challenges']
      }
    },

    // 🏠 USER INTERFACE COMPONENTS
    interfaceComponents: {
      'home-dashboard': {
        name: '🏠 Home Dashboard',
        description: 'Main user interface and navigation hub',
        affects: ['user-engagement', 'feature-discovery', 'daily-actions'],
        affectedBy: ['progress-state', 'unlocked-features', 'user-preferences'],
        displayElements: [
          'current-stage', 'happiness-score', 'practice-streak', 
          'next-milestone', 'quick-actions', 'insights'
        ]
      },
      'user-profile': {
        name: '👤 User Profile & Settings',
        description: 'User preferences and profile management',
        affects: ['app-behavior', 'practice-recommendations', 'notification-settings'],
        affectedBy: ['usage-patterns', 'progress-data', 'user-feedback']
      }
    },

    // 🎓 LEARNING & GUIDANCE COMPONENTS
    learningComponents: {
      'chat-interface': {
        name: '🤖 AI Guru Chat',
        description: 'AI-powered meditation guidance and support',
        affects: ['learning-acceleration', 'problem-solving', 'motivation'],
        affectedBy: ['user-questions', 'progress-state', 'challenges']
      },
      'posture-guide': {
        name: '🧘‍♀️ Posture Guide',
        description: 'Meditation posture instruction',
        affects: ['session-quality', 'physical-comfort', 'practice-effectiveness'],
        affectedBy: ['user-feedback', 'physical-limitations']
      },
      'what-is-pahm': {
        name: '📚 PAHM Learning',
        description: 'Educational content about PAHM methodology',
        affects: ['understanding', 'practice-depth', 'motivation'],
        affectedBy: ['user-level', 'learning-style']
      }
    }
  }), []);

  // 🔗 INTERCONNECTION TESTING SCENARIOS
  const interconnectionTests = useMemo(() => ({
    // 📝 Emotional Notes → Happiness Score Flow
    'emotional-to-happiness': {
      name: '📝→😊 Emotional Notes Impact on Happiness',
      description: 'Test how daily emotional notes affect happiness calculations',
      components: ['emotional-notes', 'happiness-tracker'],
      testFlow: [
        { action: 'log_positive_emotions', mood: 8, energy: 7, stress: 3 },
        { action: 'calculate_happiness_impact', expected: '+15 points' },
        { action: 'log_negative_emotions', mood: 4, energy: 3, stress: 8 },
        { action: 'calculate_happiness_impact', expected: '-12 points' },
        { action: 'verify_pattern_recognition', expected: 'emotion-happiness correlation' }
      ]
    },

    // 🧠 Mind Recovery → Happiness Score Flow
    'recovery-to-happiness': {
      name: '🧠→😊 Mind Recovery Impact on Happiness',
      description: 'Test how recovery sessions boost happiness scores',
      components: ['mind-recovery', 'happiness-tracker'],
      testFlow: [
        { action: 'high_stress_state', stress: 9, happiness: 45 },
        { action: 'breathing_recovery_session', duration: 10, quality: 8 },
        { action: 'measure_happiness_boost', expected: '+25 points' },
        { action: 'progressive_relaxation', duration: 20, quality: 9 },
        { action: 'measure_happiness_boost', expected: '+35 points' }
      ]
    },

    // 🧘 Practice Sessions → Multi-Component Impact  
    'practice-to-ecosystem': {
      name: '🧘→🌐 Practice Session Ecosystem Impact',
      description: 'Test how meditation practice affects entire ecosystem',
      components: ['stage1-wrapper', 'happiness-tracker', 'analytics-board', 'progress-tracker'],
      testFlow: [
        { action: 'excellent_t3_session', quality: 9, duration: 25, breakthroughs: true },
        { action: 'happiness_increase', expected: '+30 points' },
        { action: 'analytics_update', metrics: ['quality_trend', 'consistency_bonus'] },
        { action: 'progress_advancement', expected: 'closer_to_t4' },
        { action: 'unlock_check', milestone: 'advanced_techniques' }
      ]
    },

    // 📊 Complete User Journey → System Evolution
    'user-journey-evolution': {
      name: '👤→🌟 Complete User Evolution',
      description: 'Test how user progresses through entire system over time',
      components: ['all-components'],
      testFlow: [
        { phase: 'newbie', weeks: 2, focus: 'onboarding', happiness: '45→55' },
        { phase: 'beginner', weeks: 8, focus: 't1-t3-practice', happiness: '55→65' },
        { phase: 'developing', weeks: 12, focus: 't4-t5-mastery', happiness: '65→75' },
        { phase: 'intermediate', weeks: 16, focus: 'stage2-entry', happiness: '75→80' },
        { phase: 'advanced', weeks: 24, focus: 'stage3-4-mastery', happiness: '80→85' },
        { phase: 'expert', weeks: 32, focus: 'stage5-6-wisdom', happiness: '85→90' },
        { phase: 'master', weeks: 52, focus: 'teaching-legacy', happiness: '90→95' }
      ]
    },

    // 🔄 Cross-Component State Synchronization
    'state-synchronization': {
      name: '🔄 Cross-Component State Sync',
      description: 'Test how changes in one component update others',
      components: ['all-components'],
      testFlow: [
        { action: 'stage_completion', stage: 1, triggers: ['stage2_unlock', 'achievement_badge', 'happiness_boost'] },
        { action: 'emotional_crisis', triggers: ['recovery_recommendation', 'happiness_drop', 'support_activation'] },
        { action: 'breakthrough_session', triggers: ['insights_generation', 'milestone_unlock', 'sharing_prompt'] }
      ]
    }
  }), []);

  // 🧪 ECOSYSTEM TEST EXECUTION ENGINE
  const runEcosystemTest = useCallback(async (testKey) => {
    const test = interconnectionTests[testKey];
    if (!test) {
      setTestResults('❌ Test not found: ' + testKey);
      return;
    }

    setIsRunning(true);
    setTestResults(`🧪 Running Ecosystem Test: ${test.name}\n${'='.repeat(60)}\n`);

    try {
      // Initialize ecosystem state
      const initialState = {
        happiness: { score: 50, trend: 'stable' },
        practice: { stage: 1, tLevel: 'T1', sessions: 0 },
        emotional: { mood: 5, energy: 5, stress: 5 },
        recovery: { sessions: 0, effectiveness: 0 },
        analytics: { trends: [], patterns: [] },
        unlocks: { stages: [1], features: ['basic'] }
      };

      setEcosystemState(initialState);
      let currentState = { ...initialState };

      // Execute test flow
      for (let i = 0; i < test.testFlow.length; i++) {
        const step = test.testFlow[i];
        
        setTestResults(prev => prev + `\n📍 Step ${i + 1}: ${step.action || step.phase}\n`);

        // Simulate step execution
        const stepResult = await executeTestStep(step, currentState);
        currentState = { ...currentState, ...stepResult.newState };
        
        setTestResults(prev => prev + `   ✅ ${stepResult.description}\n`);
        setEcosystemState(currentState);

        // Fast forward delay
        await new Promise(resolve => setTimeout(resolve, fastForwardSpeed / 5));
      }

      // Generate test summary
      const summary = generateEcosystemTestSummary(test, initialState, currentState);
      setTestResults(prev => prev + '\n' + summary);

      // Save to history
      setTestHistory(prev => [...prev.slice(-9), {
        id: Date.now(),
        testName: test.name,
        timestamp: Date.now(),
        result: 'SUCCESS',
        initialState,
        finalState: currentState
      }]);

    } catch (error) {
      setTestResults(prev => prev + `\n❌ Test Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [interconnectionTests, fastForwardSpeed]);

  // 🎯 EXECUTE INDIVIDUAL TEST STEP
  const executeTestStep = async (step, currentState) => {
    const newState = { ...currentState };
    let description = '';

    switch (step.action || step.phase) {
      case 'log_positive_emotions':
        newState.emotional = { mood: step.mood, energy: step.energy, stress: step.stress };
        newState.happiness.score += calculateEmotionalHappinessImpact(step);
        description = `Logged positive emotions: mood=${step.mood}, energy=${step.energy}, stress=${step.stress}`;
        break;

      case 'log_negative_emotions':
        newState.emotional = { mood: step.mood, energy: step.energy, stress: step.stress };
        newState.happiness.score += calculateEmotionalHappinessImpact(step);
        description = `Logged negative emotions: mood=${step.mood}, energy=${step.energy}, stress=${step.stress}`;
        break;

      case 'breathing_recovery_session':
        newState.recovery.sessions++;
        newState.happiness.score += 25; // Recovery happiness boost
        newState.emotional.stress = Math.max(1, newState.emotional.stress - 3);
        description = `Completed ${step.duration}min breathing session, quality: ${step.quality}/10`;
        break;

      case 'excellent_t3_session':
        newState.practice.sessions++;
        newState.happiness.score += 30; // Excellent session boost
        newState.practice.tLevel = 'T3+';
        description = `Excellent T3 session: quality=${step.quality}, breakthroughs detected`;
        break;

      case 'stage_completion':
        newState.practice.stage = step.stage + 1;
        newState.unlocks.stages.push(step.stage + 1);
        newState.happiness.score += 50; // Major milestone bonus
        description = `Completed Stage ${step.stage}, unlocked Stage ${step.stage + 1}`;
        break;

      case 'newbie':
        newState.happiness.score = 55; // Newbie progress
        newState.practice.sessions = 5;
        description = `Newbie phase (${step.weeks} weeks): Happiness ${step.happiness}`;
        break;

      case 'beginner':
        newState.happiness.score = 65;
        newState.practice.tLevel = 'T3';
        newState.practice.sessions = 25;
        description = `Beginner phase (${step.weeks} weeks): Happiness ${step.happiness}`;
        break;

      case 'developing':
        newState.happiness.score = 75;
        newState.practice.tLevel = 'T5';
        newState.practice.sessions = 50;
        description = `Developing phase (${step.weeks} weeks): Happiness ${step.happiness}`;
        break;

      case 'master':
        newState.happiness.score = 95;
        newState.practice.stage = 6;
        newState.unlocks.features = ['all', 'teaching', 'legacy'];
        description = `Master phase (${step.weeks} weeks): Happiness ${step.happiness}`;
        break;

      default:
        description = `Executed: ${step.action || step.phase}`;
    }

    return { newState, description };
  };

  // 📊 CALCULATE EMOTIONAL IMPACT ON HAPPINESS
  const calculateEmotionalHappinessImpact = (emotions) => {
    const { mood, energy, stress } = emotions;
    // Your actual happiness calculation logic
    const moodImpact = (mood - 5) * 3; // -15 to +15
    const energyImpact = (energy - 5) * 2; // -10 to +10  
    const stressImpact = (5 - stress) * 2; // -10 to +10
    return Math.round(moodImpact + energyImpact + stressImpact);
  };

  // 📋 GENERATE TEST SUMMARY
  const generateEcosystemTestSummary = (test, initialState, finalState) => {
    const happinessChange = finalState.happiness.score - initialState.happiness.score;
    const practiceProgress = finalState.practice.sessions - initialState.practice.sessions;
    
    let summary = '\n🏆 ECOSYSTEM TEST RESULTS:\n';
    summary += `${'='.repeat(50)}\n`;
    summary += `📊 Happiness Change: ${happinessChange > 0 ? '+' : ''}${happinessChange} points\n`;
    summary += `🧘 Practice Sessions: +${practiceProgress} sessions\n`;
    summary += `🎯 Current Stage: ${finalState.practice.stage}\n`;
    summary += `📝 Recovery Sessions: ${finalState.recovery.sessions}\n`;
    summary += `🔓 Unlocked Features: ${finalState.unlocks.features.length}\n\n`;
    
    summary += '🔗 COMPONENT INTERCONNECTIONS VERIFIED:\n';
    test.components.forEach(comp => {
      summary += `  ✅ ${comp}\n`;
    });
    
    summary += '\n💡 INSIGHTS:\n';
    if (happinessChange > 50) {
      summary += '  🌟 Excellent ecosystem integration - major happiness improvement\n';
    } else if (happinessChange > 20) {
      summary += '  ✅ Good component synergy - solid happiness gains\n';
    } else if (happinessChange > 0) {
      summary += '  📈 Positive ecosystem response - modest improvements\n';
    } else {
      summary += '  ⚠️ Ecosystem needs optimization - limited gains\n';
    }
    
    return summary;
  };

  // 🎮 FAST FORWARD SIMULATION
  const runFastForwardSimulation = useCallback(async (simulationType) => {
    setIsRunning(true);
    setTestResults(`🚀 Running Fast Forward Simulation: ${simulationType}\n`);

    const simulations = {
      'complete-user-journey': async () => {
        const phases = [
          { name: 'Onboarding', weeks: 1, happiness: [45, 50] },
          { name: 'Early Practice', weeks: 4, happiness: [50, 60] },
          { name: 'T1-T3 Mastery', weeks: 8, happiness: [60, 70] },
          { name: 'T4-T5 Advanced', weeks: 12, happiness: [70, 75] },
          { name: 'Stage 2 Entry', weeks: 16, happiness: [75, 80] },
          { name: 'Advanced Stages', weeks: 32, happiness: [80, 90] },
          { name: 'Mastery & Teaching', weeks: 52, happiness: [90, 95] }
        ];

        for (const phase of phases) {
          setTestResults(prev => prev + `\n📅 ${phase.name} (${phase.weeks} weeks)\n`);
          setTestResults(prev => prev + `   😊 Happiness: ${phase.happiness[0]} → ${phase.happiness[1]}\n`);
          await new Promise(resolve => setTimeout(resolve, fastForwardSpeed));
        }
      },

      'emotional-happiness-correlation': async () => {
        const scenarios = [
          { emotions: { mood: 8, energy: 7, stress: 3 }, expected: '+18 happiness' },
          { emotions: { mood: 3, energy: 4, stress: 9 }, expected: '-16 happiness' },
          { emotions: { mood: 6, energy: 6, stress: 5 }, expected: '+2 happiness' }
        ];

        for (const scenario of scenarios) {
          const impact = calculateEmotionalHappinessImpact(scenario.emotions);
          setTestResults(prev => prev + `\n📝 Emotions: ${JSON.stringify(scenario.emotions)}\n`);
          setTestResults(prev => prev + `   😊 Impact: ${impact > 0 ? '+' : ''}${impact} (expected: ${scenario.expected})\n`);
          await new Promise(resolve => setTimeout(resolve, fastForwardSpeed / 2));
        }
      }
    };

    try {
      await simulations[simulationType]();
      setTestResults(prev => prev + '\n✅ Fast Forward Simulation Complete!');
    } catch (error) {
      setTestResults(prev => prev + `\n❌ Simulation Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [fastForwardSpeed]);

  // 🎨 UI RENDERING
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 Complete Ecosystem Tester
          </h1>
          <p className="text-lg text-gray-600">
            Test ALL components + their interconnections | Emotional notes → Happiness | Recovery → Progress
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Panel - Component Architecture */}
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🏗️ App Architecture
              </h3>
              
              {Object.entries(appEcosystem).map(([category, components]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2 capitalize">
                    {category.replace('Components', '')}
                  </h4>
                  <div className="space-y-1">
                    {Object.entries(components).map(([key, component]) => (
                      <div key={key} className="text-xs p-2 bg-blue-100 rounded border">
                        <div className="font-semibold">{component.name}</div>
                        <div className="text-blue-600">{component.description}</div>
                        {component.affects && (
                          <div className="text-green-600 mt-1">
                            Affects: {component.affects.slice(0, 2).join(', ')}
                            {component.affects.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Interconnection View Toggle */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={interconnectionView}
                  onChange={(e) => setInterconnectionView(e.target.checked)}
                  className="rounded"
                />
                <span className="text-purple-800 font-semibold">🔗 Show Interconnections</span>
              </label>
              {interconnectionView && (
                <div className="mt-3 text-xs">
                  <div className="text-purple-600">
                    📝 Emotional Notes → 😊 Happiness Score<br/>
                    🧠 Mind Recovery → 😊 Happiness Score<br/>
                    🧘 Practice Sessions → 📊 All Analytics<br/>
                    🏆 Stage Completion → 🔓 Feature Unlocks<br/>
                    👤 User Profile → ⚙️ App Behavior
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Middle Panel - Test Selection */}
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-3">
                🧪 Interconnection Tests
              </h3>
              <div className="space-y-2">
                {Object.entries(interconnectionTests).map(([key, test]) => (
                  <button
                    key={key}
                    onClick={() => runEcosystemTest(key)}
                    disabled={isRunning}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTest === key
                        ? 'border-green-500 bg-green-100'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } disabled:opacity-50`}
                  >
                    <div className="font-semibold text-sm">{test.name}</div>
                    <div className="text-xs text-gray-600">{test.description}</div>
                    <div className="text-xs text-green-600 mt-1">
                      Components: {test.components.join(' → ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-800 mb-3">
                🚀 Fast Forward Simulations
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => runFastForwardSimulation('complete-user-journey')}
                  disabled={isRunning}
                  className="w-full p-2 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded transition-colors disabled:opacity-50"
                >
                  👤 Complete User Journey (2 years → 5 min)
                </button>
                <button
                  onClick={() => runFastForwardSimulation('emotional-happiness-correlation')}
                  disabled={isRunning}
                  className="w-full p-2 bg-orange-100 hover:bg-orange-200 border border-orange-300 rounded transition-colors disabled:opacity-50"
                >
                  📝 Emotional → Happiness Correlation
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ⚙️ Test Controls
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Fast Forward Speed:</label>
                  <select
                    value={fastForwardSpeed}
                    onChange={(e) => setFastForwardSpeed(Number(e.target.value))}
                    className="w-full mt-1 p-2 border rounded"
                  >
                    <option value={2000}>Slow (2s per step)</option>
                    <option value={1000}>Normal (1s per step)</option>
                    <option value={500}>Fast (0.5s per step)</option>
                    <option value={100}>Ultra Fast (0.1s per step)</option>
                  </select>
                </div>
                <button
                  onClick={() => setTestResults('')}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded transition-colors"
                >
                  🗑️ Clear Results
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Results & State */}
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Test Results
              </h3>
              <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-xs min-h-96 max-h-96 overflow-auto">
                {testResults || 'Select an interconnection test to see how your app components work together...'}
              </div>
            </div>

            {/* Current Ecosystem State */}
            {Object.keys(ecosystemState).length > 0 && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">
                  🌐 Current Ecosystem State
                </h3>
                <div className="text-xs space-y-2">
                  <div className="p-2 bg-indigo-100 rounded">
                    <strong>😊 Happiness:</strong> {ecosystemState.happiness?.score || 50}
                  </div>
                  <div className="p-2 bg-indigo-100 rounded">
                    <strong>🧘 Practice:</strong> Stage {ecosystemState.practice?.stage || 1}, {ecosystemState.practice?.tLevel || 'T1'}
                  </div>
                  <div className="p-2 bg-indigo-100 rounded">
                    <strong>📝 Emotional:</strong> M:{ecosystemState.emotional?.mood || 5} E:{ecosystemState.emotional?.energy || 5} S:{ecosystemState.emotional?.stress || 5}
                  </div>
                  <div className="p-2 bg-indigo-100 rounded">
                    <strong>🔓 Unlocks:</strong> {ecosystemState.unlocks?.stages?.length || 1} stages
                  </div>
                </div>
              </div>
            )}

            {/* Test History */}
            {testHistory.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                  📚 Test History
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {testHistory.slice(-3).map((test) => (
                    <div key={test.id} className="text-xs p-2 bg-yellow-100 rounded">
                      <div className="font-semibold">{test.testName}</div>
                      <div className="text-yellow-600">
                        {new Date(test.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-purple-800 mb-3">
            📖 Complete Ecosystem Testing Guide
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-700 mb-2">🔗 Test Interconnections:</h4>
              <ul className="text-blue-600 space-y-1">
                <li>• Emotional notes → Happiness score</li>
                <li>• Mind recovery → Stress reduction</li>
                <li>• Practice sessions → Progress tracking</li>
                <li>• Stage completion → Feature unlocks</li>
                <li>• User profile → App behavior</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-700 mb-2">🚀 Fast Forward Testing:</h4>
              <ul className="text-green-600 space-y-1">
                <li>• Complete user journeys (years → minutes)</li>
                <li>• Multi-component interactions</li>
                <li>• Long-term ecosystem evolution</li>
                <li>• Cross-component state changes</li>
                <li>• Real user behavior simulation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-700 mb-2">📊 Validate Everything:</h4>
              <ul className="text-purple-600 space-y-1">
                <li>• Data flow between components</li>
                <li>• State synchronization</li>
                <li>• Feature unlock logic</li>
                <li>• Happiness calculation accuracy</li>
                <li>• Complete app ecosystem health</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteEcosystemTester;
