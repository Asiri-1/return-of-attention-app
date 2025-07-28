// src/testing/suites/PAHMTestSuite.js
// 🧪 Enhanced PAHM Test Suite - Complete testing from 18-page checklist

import { PAHM_TEST_CASES } from '../testData';

export class PAHMTestSuite {
  constructor(contexts) {
    this.contexts = contexts;
  }

  // 🧪 Run single PAHM test case
  async runSingleTest(testKey) {
    const testCase = PAHM_TEST_CASES[testKey];
    if (!testCase) {
      throw new Error(`Test case '${testKey}' not found`);
    }

    return await this.runSinglePAHMTest(testKey, testCase);
  }

  // 🧪 Run all PAHM test cases
  async runAllTests() {
    console.log('🧪 Running All PAHM Tests...');
    const results = {
      testSuite: 'PAHM',
      startTime: new Date().toISOString(),
      tests: {},
      summary: {}
    };

    try {
      // Run all 3 critical test cases
      for (const [testKey, testCase] of Object.entries(PAHM_TEST_CASES)) {
        console.log(`🔬 Running ${testCase.name}...`);
        results.tests[testKey] = await this.runSinglePAHMTest(testKey, testCase);
        
        // Add delay between tests to prevent system overload
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate summary
      const testArray = Object.values(results.tests);
      const totalTests = testArray.length;
      const passedTests = testArray.filter(test => test.status === 'PASS').length;
      const failedTests = testArray.filter(test => test.status === 'FAIL').length;
      const errorTests = testArray.filter(test => test.status === 'ERROR').length;
      
      results.summary = {
        totalTests,
        passedTests,
        failedTests,
        errorTests,
        passRate: Math.round((passedTests / totalTests) * 100),
        overallStatus: passedTests === totalTests ? 'PASS' : 'FAIL'
      };
      
      results.endTime = new Date().toISOString();
      console.log('✅ All PAHM Tests completed!');
      return results;

    } catch (error) {
      console.error('❌ PAHM Tests failed:', error);
      results.error = error.message;
      results.endTime = new Date().toISOString();
      return results;
    }
  }

  // 🔬 Execute individual PAHM test case
  async runSinglePAHMTest(testKey, testCase) {
    const testStart = Date.now();
    
    try {
      console.log(`🎯 Testing: ${testCase.name} (Target: ${testCase.target} ± ${testCase.tolerance})`);

      // Step 1: Backup current data
      const backup = await this.backupCurrentData();

      // Step 2: Reset system to clean state
      await this.resetToCleanState();

      // Step 3: Set up test questionnaire data
      await this.setupQuestionnaireData(testCase.questionnaire);

      // Step 4: Set up test self-assessment data  
      await this.setupSelfAssessmentData(testCase.selfAssessment);

      // Step 5: Trigger happiness calculation
      const actualScore = await this.calculateHappinessScore();

      // Step 6: Validate results
      const validation = this.validateResults(testCase, actualScore);

      // Step 7: Restore original data
      await this.restoreBackupData(backup);

      // Step 8: Generate detailed result
      const result = {
        testName: testCase.name,
        testKey,
        expected: testCase.target,
        tolerance: testCase.tolerance,
        actual: actualScore,
        difference: validation.difference,
        status: validation.status,
        details: validation.details,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString(),
        testData: {
          questionnaire: testCase.questionnaire,
          selfAssessment: testCase.selfAssessment
        }
      };

      // Log result
      if (validation.status === 'PASS') {
        console.log(`✅ ${testCase.name}: PASS (${actualScore} points, difference: ${validation.difference})`);
      } else {
        console.log(`❌ ${testCase.name}: FAIL (${actualScore} points, difference: ${validation.difference}, tolerance: ±${testCase.tolerance})`);
      }

      return result;

    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error);
      
      // Try to restore backup even on error
      try {
        await this.restoreBackupData(await this.getCurrentData());
      } catch (restoreError) {
        console.error('Failed to restore backup after test error:', restoreError);
      }

      return {
        testName: testCase.name,
        testKey,
        expected: testCase.target,
        tolerance: testCase.tolerance,
        actual: null,
        status: 'ERROR',
        error: error.message,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📁 Data Management Methods
  async backupCurrentData() {
    try {
      return {
        questionnaire: localStorage.getItem('questionnaire_completed'),
        selfAssessment: localStorage.getItem('self_assessment_completed'),
        testQuestionnaire: localStorage.getItem('testQuestionnaire'),
        testSelfAssessment: localStorage.getItem('testSelfAssessment'),
        currentScore: await this.contexts.getCurrentHappinessScore()
      };
    } catch (error) {
      console.warn('Failed to backup current data:', error);
      return {};
    }
  }

  async getCurrentData() {
    return await this.backupCurrentData();
  }

  async restoreBackupData(backup) {
    try {
      if (!backup) return;

      // Restore localStorage items
      if (backup.questionnaire) {
        localStorage.setItem('questionnaire_completed', backup.questionnaire);
      } else {
        localStorage.removeItem('questionnaire_completed');
      }

      if (backup.selfAssessment) {
        localStorage.setItem('self_assessment_completed', backup.selfAssessment);
      } else {
        localStorage.removeItem('self_assessment_completed');
      }

      if (backup.testQuestionnaire) {
        localStorage.setItem('testQuestionnaire', backup.testQuestionnaire);
      } else {
        localStorage.removeItem('testQuestionnaire');
      }

      if (backup.testSelfAssessment) {
        localStorage.setItem('testSelfAssessment', backup.testSelfAssessment);
      } else {
        localStorage.removeItem('testSelfAssessment');
      }

      // Trigger recalculation to restore state
      if (this.contexts.forceRecalculation) {
        this.contexts.forceRecalculation();
      }

      console.log('✅ Backup data restored successfully');
    } catch (error) {
      console.error('❌ Failed to restore backup data:', error);
    }
  }

  async resetToCleanState() {
    try {
      console.log('🔄 Resetting to clean state...');
      
      if (this.contexts.resetAllData) {
        await this.contexts.resetAllData();
      } else {
        // Manual reset if function not available
        localStorage.removeItem('testQuestionnaire');
        localStorage.removeItem('testSelfAssessment');
        localStorage.removeItem('questionnaire_completed');
        localStorage.removeItem('self_assessment_completed');
      }
      
      // Wait for reset to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Clean state achieved');
    } catch (error) {
      console.error('❌ Failed to reset to clean state:', error);
      throw error;
    }
  }

  async setupQuestionnaireData(questionnaireData) {
    try {
      console.log('📝 Setting up questionnaire data...');
      
      if (this.contexts.markQuestionnaireComplete) {
        await this.contexts.markQuestionnaireComplete(questionnaireData);
      } else {
        // Manual setup if function not available
        localStorage.setItem('testQuestionnaire', JSON.stringify(questionnaireData));
        localStorage.setItem('questionnaire_completed', 'true');
      }
      
      // Wait for data to be processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Questionnaire data set up successfully');
    } catch (error) {
      console.error('❌ Failed to set up questionnaire data:', error);
      throw error;
    }
  }

  async setupSelfAssessmentData(selfAssessmentData) {
    try {
      console.log('🎯 Setting up self-assessment data...');
      
      if (this.contexts.markSelfAssessmentComplete) {
        await this.contexts.markSelfAssessmentComplete(selfAssessmentData);
      } else {
        // Manual setup if function not available
        localStorage.setItem('testSelfAssessment', JSON.stringify(selfAssessmentData));
        localStorage.setItem('self_assessment_completed', 'true');
      }
      
      // Wait for data to be processed
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Self-assessment data set up successfully');
    } catch (error) {
      console.error('❌ Failed to set up self-assessment data:', error);
      throw error;
    }
  }

  async calculateHappinessScore() {
    try {
      console.log('🧮 Triggering happiness calculation...');
      
      let actualScore;
      
      if (this.contexts.calculateHappiness) {
        const calculationResult = await this.contexts.calculateHappiness();
        actualScore = calculationResult.score || calculationResult;
      } else if (this.contexts.getCurrentHappinessScore) {
        actualScore = await this.contexts.getCurrentHappinessScore();
      } else {
        throw new Error('No happiness calculation function available');
      }
      
      // Ensure we have a valid number
      if (typeof actualScore !== 'number' || isNaN(actualScore)) {
        throw new Error(`Invalid happiness score: ${actualScore}`);
      }
      
      console.log(`✅ Happiness calculation completed: ${actualScore}`);
      return actualScore;
      
    } catch (error) {
      console.error('❌ Failed to calculate happiness score:', error);
      throw error;
    }
  }

  validateResults(testCase, actualScore) {
    try {
      const difference = Math.abs(actualScore - testCase.target);
      const isWithinTolerance = difference <= testCase.tolerance;
      
      const details = {
        target: testCase.target,
        tolerance: testCase.tolerance,
        actual: actualScore,
        difference: difference,
        withinTolerance: isWithinTolerance,
        percentageDifference: Math.round((difference / testCase.target) * 100)
      };
      
      // Determine status
      let status;
      if (isWithinTolerance) {
        status = 'PASS';
      } else if (difference <= testCase.tolerance * 2) {
        status = 'FAIL'; // Close but not within tolerance
      } else {
        status = 'FAIL'; // Significant deviation
      }
      
      return {
        status,
        difference,
        details
      };
      
    } catch (error) {
      return {
        status: 'ERROR',
        difference: null,
        details: { error: error.message }
      };
    }
  }

  // 📊 Additional Analysis Methods
  async analyzeTestResults(results) {
    const analysis = {
      overallAccuracy: this.calculateOverallAccuracy(results.tests),
      algorithmCalibration: this.analyzeAlgorithmCalibration(results.tests),
      recommendations: this.generateRecommendations(results.tests),
      riskAssessment: this.assessRisks(results.tests)
    };

    return analysis;
  }

  calculateOverallAccuracy(tests) {
    const testArray = Object.values(tests);
    const accurateTests = testArray.filter(test => test.status === 'PASS');
    
    return {
      accuracy: Math.round((accurateTests.length / testArray.length) * 100),
      totalTests: testArray.length,
      accurateTests: accurateTests.length,
      inaccurateTests: testArray.length - accurateTests.length
    };
  }

  analyzeAlgorithmCalibration(tests) {
    const calibrationIssues = [];
    
    Object.values(tests).forEach(test => {
      if (test.status === 'FAIL' && test.difference > test.tolerance) {
        const severity = test.difference > (test.tolerance * 3) ? 'HIGH' : 'MEDIUM';
        calibrationIssues.push({
          testCase: test.testName,
          severity,
          expectedRange: `${test.expected - test.tolerance} - ${test.expected + test.tolerance}`,
          actualValue: test.actual,
          deviation: test.difference,
          recommendedAdjustment: this.calculateRecommendedAdjustment(test)
        });
      }
    });

    return {
      needsCalibration: calibrationIssues.length > 0,
      issues: calibrationIssues,
      overallCalibrationScore: this.calculateCalibrationScore(tests)
    };
  }

  calculateRecommendedAdjustment(test) {
    const deviation = test.actual - test.expected;
    const adjustmentPercent = Math.round((deviation / test.expected) * 100);
    
    if (deviation > 0) {
      return `Reduce calculation by approximately ${Math.abs(adjustmentPercent)}%`;
    } else {
      return `Increase calculation by approximately ${Math.abs(adjustmentPercent)}%`;
    }
  }

  calculateCalibrationScore(tests) {
    const testArray = Object.values(tests);
    const totalDeviation = testArray.reduce((sum, test) => {
      return sum + (test.difference || 0);
    }, 0);
    
    const averageDeviation = totalDeviation / testArray.length;
    const maxAcceptableDeviation = 5; // points
    
    const score = Math.max(0, Math.round(100 - (averageDeviation / maxAcceptableDeviation) * 100));
    return score;
  }

  generateRecommendations(tests) {
    const recommendations = [];
    
    Object.values(tests).forEach(test => {
      if (test.status === 'FAIL') {
        if (test.testName.includes('Experienced') && test.actual < test.expected) {
          recommendations.push({
            priority: 'HIGH',
            category: 'Algorithm Enhancement',
            issue: 'Experienced practitioners scoring too low',
            action: 'Increase base happiness multiplier for high experience levels',
            impact: 'Improve accuracy for advanced users'
          });
        }
        
        if (test.testName.includes('Beginner') && test.actual > test.expected) {
          recommendations.push({
            priority: 'MEDIUM',
            category: 'Penalty Adjustment',
            issue: 'Beginners scoring too high',
            action: 'Review attachment penalty calculations',
            impact: 'Better reflect realistic beginner scores'
          });
        }
      }
    });

    // Add general recommendations
    if (recommendations.length > 0) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Testing',
        action: 'Implement continuous testing with real user data',
        impact: 'Ongoing algorithm validation and improvement'
      });
    }

    return recommendations;
  }

  assessRisks(tests) {
    const risks = [];
    
    const failedTests = Object.values(tests).filter(test => test.status === 'FAIL');
    
    if (failedTests.length > 0) {
      risks.push({
        type: 'Algorithm Accuracy',
        severity: failedTests.length > 1 ? 'HIGH' : 'MEDIUM',
        description: `${failedTests.length} out of ${Object.keys(tests).length} test cases failing`,
        mitigation: 'Implement algorithm calibration based on test results'
      });
    }

    const highDeviations = Object.values(tests).filter(test => 
      test.difference && test.difference > (test.tolerance * 2)
    );
    
    if (highDeviations.length > 0) {
      risks.push({
        type: 'User Experience',
        severity: 'MEDIUM',
        description: 'Significant deviations may lead to user confusion about happiness scores',
        mitigation: 'Review and adjust happiness calculation parameters'
      });
    }

    return risks;
  }
}