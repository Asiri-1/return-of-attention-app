// src/testing/suites/PAHMTestSuite.js
// 🧪 PAHM Test Cases - All Testing Logic from 18-Page Checklist

export class PAHMTestSuite {
  constructor(contexts) {
    // Get all the functions we need from AdminPanel contexts
    this.contexts = contexts;
    this.markQuestionnaireComplete = contexts.markQuestionnaireComplete;
    this.markSelfAssessmentComplete = contexts.markSelfAssessmentComplete;
    this.calculateHappiness = contexts.calculateHappiness;
    this.resetAllData = contexts.resetAllData;
    this.getCurrentHappinessScore = contexts.getCurrentHappinessScore;
  }

  // 🎯 TEST CASE DEFINITIONS (Exact from your 18-page checklist)
  static testCases = {
    experiencedPractitioner: {
      name: "Experienced Practitioner",
      target: 65,
      tolerance: 3,
      questionnaire: {
        experience_level: 8,
        goals: ["liberation", "inner-peace", "spiritual-growth"],
        age_range: "35-44",
        emotional_awareness: 9,
        mindfulness_experience: 9,
        sleep_pattern: 8,
        physical_activity: "very_active",
        stress_response: "Observe and let go",
        work_life_balance: "Perfect integration of work and practice"
      },
      selfAssessment: {
        taste: "none",        // 0 points
        smell: "none",        // 0 points  
        sound: "some",        // -7 points
        sight: "none",        // 0 points
        touch: "none",        // 0 points
        totalAttachmentPenalty: -7
      },
      expectedComponents: {
        pahmDevelopment: 15.0,
        emotionalStability: 18.0,
        currentMood: 12.8,
        attachmentFlexibility: 6.8,
        otherComponents: 12.2
      }
    },
    
    motivatedBeginner: {
      name: "Motivated Beginner",
      target: 34,
      tolerance: 3,
      questionnaire: {
        experience_level: 3,
        goals: ["stress-reduction", "emotional-balance"],
        age_range: "25-34",
        emotional_awareness: 6,
        mindfulness_experience: 4,
        sleep_pattern: 6,
        physical_activity: "moderate",
        stress_response: "Usually manage well",
        work_life_balance: "Sometimes struggle but generally good"
      },
      selfAssessment: {
        taste: "strong",      // -15 points
        smell: "moderate",    // -10 points
        sound: "strong",      // -15 points
        sight: "moderate",    // -10 points
        touch: "some",        // -8 points
        totalAttachmentPenalty: -58
      },
      expectedComponents: {
        pahmDevelopment: 6.3,
        emotionalStability: 9.6,
        currentMood: 8.3,
        attachmentFlexibility: 2.8,
        otherComponents: 7.0
      }
    },

    highlyStressedBeginner: {
      name: "Highly Stressed Beginner",
      target: 10,
      tolerance: 2,
      questionnaire: {
        experience_level: 1,
        goals: ["stress-reduction"],
        age_range: "18-24",
        emotional_awareness: 3,
        mindfulness_experience: 1,
        sleep_pattern: 3,
        physical_activity: "sedentary",
        stress_response: "Get overwhelmed easily",
        work_life_balance: "Work dominates everything"
      },
      selfAssessment: {
        taste: "strong",      // -15 points
        smell: "strong",      // -15 points
        sound: "strong",      // -15 points
        sight: "strong",      // -15 points
        touch: "strong",      // -15 points
        totalAttachmentPenalty: -75
      },
      expectedComponents: {
        pahmDevelopment: 1.5,
        emotionalStability: 3.0,
        currentMood: 3.0,
        attachmentFlexibility: 0.8,
        otherComponents: 1.7
      }
    }
  };

  // 🚀 MAIN TEST RUNNERS

  async runAllTests() {
    console.log('🧪 Running All PAHM Tests...');
    const startTime = Date.now();
    const results = {
      testSuite: 'PAHM',
      startTime: new Date().toISOString(),
      tests: {},
      summary: {}
    };

    try {
      // Run all 3 test cases
      for (const [testKey, testCase] of Object.entries(PAHMTestSuite.testCases)) {
        console.log(`🔬 Running ${testCase.name}...`);
        results.tests[testKey] = await this.runSingleTest(testKey, testCase);
        
        // Add delay between tests to prevent conflicts
        await this.delay(1000);
      }

      // Generate summary
      results.summary = this.generateTestSummary(results.tests);
      results.endTime = new Date().toISOString();
      results.duration = Date.now() - startTime;

      console.log('✅ All PAHM Tests completed!');
      return results;

    } catch (error) {
      console.error('❌ PAHM Tests failed:', error);
      results.error = error.message;
      results.endTime = new Date().toISOString();
      return results;
    }
  }

  async runSingleTest(testKey, testCase) {
    const testStart = Date.now();
    
    try {
      console.log(`🎯 Testing: ${testCase.name} (Target: ${testCase.target} ± ${testCase.tolerance})`);

      // Step 1: Reset all data to clean state
      console.log('🔄 Resetting data...');
      if (this.resetAllData) {
        await this.resetAllData();
        await this.delay(500); // Wait for reset to complete
      }

      // Step 2: Set questionnaire data
      console.log('📝 Setting questionnaire data...');
      if (this.markQuestionnaireComplete) {
        await this.markQuestionnaireComplete(testCase.questionnaire);
        await this.delay(500);
      }

      // Step 3: Set self-assessment data
      console.log('🔍 Setting self-assessment data...');
      if (this.markSelfAssessmentComplete) {
        await this.markSelfAssessmentComplete(testCase.selfAssessment);
        await this.delay(500);
      }

      // Step 4: Calculate happiness score
      console.log('🧮 Calculating happiness score...');
      let actualScore;
      let components = {};
      
      if (this.calculateHappiness) {
        const calculationResult = await this.calculateHappiness();
        actualScore = calculationResult.score || calculationResult;
        components = calculationResult.breakdown || calculationResult.components || {};
      } else if (this.getCurrentHappinessScore) {
        actualScore = await this.getCurrentHappinessScore();
      } else {
        throw new Error('No happiness calculation method available');
      }

      // Step 5: Validate result
      const isWithinTolerance = this.isWithinTolerance(actualScore, testCase.target, testCase.tolerance);
      const difference = Math.abs(actualScore - testCase.target);

      const result = {
        testName: testCase.name,
        testKey,
        expected: testCase.target,
        tolerance: testCase.tolerance,
        actual: actualScore,
        difference,
        status: isWithinTolerance ? 'PASS' : 'FAIL',
        components,
        expectedComponents: testCase.expectedComponents,
        questionnaire: testCase.questionnaire,
        selfAssessment: testCase.selfAssessment,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };

      // Log result
      if (isWithinTolerance) {
        console.log(`✅ ${testCase.name}: PASS (${actualScore} points, difference: ${difference})`);
      } else {
        console.log(`❌ ${testCase.name}: FAIL (${actualScore} points, difference: ${difference}, tolerance: ±${testCase.tolerance})`);
      }

      return result;

    } catch (error) {
      console.error(`❌ ${testCase.name} failed:`, error);
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

  // 🎯 INDIVIDUAL TEST RUNNERS

  async runExperiencedPractitionerTest() {
    const testCase = PAHMTestSuite.testCases.experiencedPractitioner;
    return await this.runSingleTest('experiencedPractitioner', testCase);
  }

  async runMotivatedBeginnerTest() {
    const testCase = PAHMTestSuite.testCases.motivatedBeginner;
    return await this.runSingleTest('motivatedBeginner', testCase);
  }

  async runHighlyStressedBeginnerTest() {
    const testCase = PAHMTestSuite.testCases.highlyStressedBeginner;
    return await this.runSingleTest('highlyStressedBeginner', testCase);
  }

  // ⚡ QUICK VALIDATION (for browser quick check)
  async runQuickValidation() {
    try {
      console.log('⚡ Running quick PAHM validation...');
      
      if (this.calculateHappiness) {
        const result = await this.calculateHappiness();
        return { 
          success: true, 
          score: result.score || result,
          message: 'PAHM calculation working'
        };
      }

      return { success: false, message: 'No calculation method available' };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // 📊 COMPLETE VALIDATION (for comprehensive testing)
  async runCompleteValidation() {
    console.log('📊 Running complete PAHM validation...');
    
    const completeResults = await this.runAllTests();
    
    // Add additional validations
    completeResults.additionalValidations = {
      componentBreakdown: await this.validateComponentBreakdown(),
      performanceCheck: await this.validatePerformance(),
      consistencyCheck: await this.validateConsistency()
    };

    return completeResults;
  }

  // 🔧 VALIDATION HELPERS

  isWithinTolerance(actual, expected, tolerance) {
    const difference = Math.abs(actual - expected);
    return difference <= tolerance;
  }

  async validateComponentBreakdown() {
    // TODO: Validate that component breakdown matches expected ranges
    return { status: 'pending', message: 'Component breakdown validation not yet implemented' };
  }

  async validatePerformance() {
    // Test calculation speed (should be under 500ms per checklist)
    const startTime = Date.now();
    
    try {
      if (this.calculateHappiness) {
        await this.calculateHappiness();
        const executionTime = Date.now() - startTime;
        const passed = executionTime < 500;
        
        return {
          status: passed ? 'PASS' : 'FAIL',
          executionTime,
          threshold: 500,
          message: passed ? 
            `Calculation completed in ${executionTime}ms (under 500ms threshold)` :
            `Calculation took ${executionTime}ms (exceeds 500ms threshold)`
        };
      }
      
      return { status: 'SKIP', message: 'No calculation method available' };
      
    } catch (error) {
      return { status: 'ERROR', error: error.message };
    }
  }

  async validateConsistency() {
    // Test that same inputs always produce same outputs
    try {
      const testCase = PAHMTestSuite.testCases.experiencedPractitioner;
      
      // Run same test twice
      const result1 = await this.runSingleTest('consistency1', testCase);
      await this.delay(100);
      const result2 = await this.runSingleTest('consistency2', testCase);
      
      const isConsistent = result1.actual === result2.actual;
      
      return {
        status: isConsistent ? 'PASS' : 'FAIL',
        result1: result1.actual,
        result2: result2.actual,
        message: isConsistent ? 
          'Calculation results are consistent' :
          `Inconsistent results: ${result1.actual} vs ${result2.actual}`
      };
      
    } catch (error) {
      return { status: 'ERROR', error: error.message };
    }
  }

  // 📊 SUMMARY GENERATION

  generateTestSummary(tests) {
    const testArray = Object.values(tests);
    const totalTests = testArray.length;
    const passedTests = testArray.filter(test => test.status === 'PASS').length;
    const failedTests = testArray.filter(test => test.status === 'FAIL').length;
    const errorTests = testArray.filter(test => test.status === 'ERROR').length;
    
    const averageExecutionTime = testArray.reduce((sum, test) => sum + (test.executionTime || 0), 0) / totalTests;
    
    return {
      totalTests,
      passedTests,
      failedTests,
      errorTests,
      passRate: Math.round((passedTests / totalTests) * 100),
      overallStatus: passedTests === totalTests ? 'PASS' : 'FAIL',
      averageExecutionTime: Math.round(averageExecutionTime),
      details: {
        experiencedPractitioner: tests.experiencedPractitioner?.status || 'PENDING',
        motivatedBeginner: tests.motivatedBeginner?.status || 'PENDING',
        highlyStressedBeginner: tests.highlyStressedBeginner?.status || 'PENDING'
      }
    };
  }

  // 🛠️ UTILITY METHODS

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 📋 TEST CASE ACCESS METHODS

  static getTestCase(testKey) {
    return PAHMTestSuite.testCases[testKey];
  }

  static getAllTestCases() {
    return PAHMTestSuite.testCases;
  }

  static getTestCaseNames() {
    return Object.keys(PAHMTestSuite.testCases);
  }

  // 🔍 DEBUGGING HELPERS

  logTestCaseData(testKey) {
    const testCase = PAHMTestSuite.testCases[testKey];
    if (testCase) {
      console.log(`📋 ${testCase.name} Test Case Data:`, {
        target: `${testCase.target} ± ${testCase.tolerance} points`,
        questionnaire: testCase.questionnaire,
        selfAssessment: testCase.selfAssessment,
        expectedComponents: testCase.expectedComponents
      });
    }
  }

  logAllTestCases() {
    console.log('📋 All PAHM Test Cases:');
    Object.keys(PAHMTestSuite.testCases).forEach(key => {
      this.logTestCaseData(key);
    });
  }
}