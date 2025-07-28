// src/testing/suites/PerformanceTestSuite.js
// ⚡ Performance Test Suite - Speed and Load Testing

export class PerformanceTestSuite {
  constructor(contexts) {
    this.contexts = contexts;
  }

  // ⚡ Run basic performance tests
  async runBasicTests() {
    const testStart = Date.now();
    
    try {
      const performanceTests = [];
      
      // 1. Happiness Calculation Speed
      performanceTests.push(await this.testCalculationSpeed());
      
      // 2. Data Access Performance  
      performanceTests.push(await this.testDataAccessSpeed());
      
      const overallStatus = performanceTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Basic Performance Tests',
        status: overallStatus,
        tests: performanceTests,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testName: 'Basic Performance Tests',
        status: 'ERROR',
        error: error.message,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🧮 Happiness Calculation Speed Test
  async testCalculationSpeed() {
    const testStart = Date.now();
    
    try {
      const iterations = 5;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await this.contexts.getCurrentHappinessScore();
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      const status = averageTime < 500 ? 'PASS' : 'FAIL'; // PDF 500ms threshold
      
      return {
        testName: 'Happiness Calculation Speed',
        status: status,
        metrics: {
          averageTime: Math.round(averageTime),
          iterations: iterations
        },
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testName: 'Happiness Calculation Speed',
        status: 'ERROR',
        error: error.message,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 💾 Data Access Speed Test
  async testDataAccessSpeed() {
    const testStart = Date.now();
    
    try {
      const iterations = 10;
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const testData = { test: 'data', timestamp: Date.now() };
        const startTime = performance.now();
        
        localStorage.setItem(`perfTest_${i}`, JSON.stringify(testData));
        const retrieved = localStorage.getItem(`perfTest_${i}`);
        JSON.parse(retrieved);
        localStorage.removeItem(`perfTest_${i}`);
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }
      
      const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
      const status = averageTime < 20 ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Data Access Speed',
        status: status,
        metrics: {
          averageTime: Math.round(averageTime * 100) / 100,
          iterations: iterations
        },
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        testName: 'Data Access Speed',
        status: 'ERROR',
        error: error.message,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    }
  }
}
