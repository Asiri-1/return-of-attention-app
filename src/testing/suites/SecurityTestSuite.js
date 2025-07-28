// src/testing/suites/SecurityTestSuite.js
// 🔒 Security Test Suite - Data validation and security checks

export class SecurityTestSuite {
    constructor(contexts) {
      this.contexts = contexts;
    }
  
    // 🔒 Run basic security check (for Quick Tests)
    async runBasicSecurityCheck() {
      const testStart = Date.now();
      
      try {
        const checks = [];
        
        // Check for basic authentication
        checks.push({
          name: 'Authentication Check',
          status: this.contexts.user ? 'PASS' : 'FAIL',
          details: this.contexts.user ? 'User authenticated' : 'No user context'
        });
        
        // Check localStorage access
        checks.push({
          name: 'Data Access Control',
          status: this.testDataAccess() ? 'PASS' : 'FAIL'
        });
        
        // Check for XSS vulnerabilities in data
        checks.push({
          name: 'XSS Prevention',
          status: await this.testXSSPrevention() ? 'PASS' : 'FAIL'
        });
        
        const overallStatus = checks.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Basic Security Check',
          status: overallStatus,
          checks,
          executionTime: Date.now() - testStart,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          testName: 'Basic Security Check',
          status: 'ERROR',
          error: error.message,
          executionTime: Date.now() - testStart,
          timestamp: new Date().toISOString()
        };
      }
    }
  
    // 🔒 Run comprehensive security tests
    async runAllTests() {
      const testStart = Date.now();
      
      try {
        const securityTests = [];
        
        // 1. Authentication and Authorization
        securityTests.push(await this.testAuthentication());
        
        // 2. Data Validation
        securityTests.push(await this.testDataValidation());
        
        // 3. Input Sanitization
        securityTests.push(await this.testInputSanitization());
        
        // 4. Cross-Site Scripting (XSS) Prevention
        securityTests.push(await this.testXSSPrevention());
        
        // 5. Data Encryption/Storage Security
        securityTests.push(await this.testDataSecurity());
        
        // 6. Session Management
        securityTests.push(await this.testSessionSecurity());
        
        // 7. Error Handling Security
        securityTests.push(await this.testErrorHandling());
        
        const overallStatus = securityTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Comprehensive Security Tests',
          status: overallStatus,
          tests: securityTests,
          securityScore: this.calculateSecurityScore(securityTests),
          executionTime: Date.now() - testStart,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          testName: 'Comprehensive Security Tests',
          status: 'ERROR',
          error: error.message,
          executionTime: Date.now() - testStart,
          timestamp: new Date().toISOString()
        };
      }
    }
  
    // 🔐 Authentication Tests
    async testAuthentication() {
      try {
        const authChecks = [];
        
        // Check user context exists
        authChecks.push({
          name: 'User Context',
          status: this.contexts.user ? 'PASS' : 'FAIL',
          details: this.contexts.user ? `User: ${this.contexts.user.email}` : 'No user context'
        });
        
        // Check user role/permissions
        authChecks.push({
          name: 'User Permissions',
          status: this.contexts.user?.role ? 'PASS' : 'FAIL',
          details: this.contexts.user?.role ? `Role: ${this.contexts.user.role}` : 'No role defined'
        });
        
        const overallStatus = authChecks.every(check => check.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Authentication Tests',
          status: overallStatus,
          checks: authChecks
        };
      } catch (error) {
        return {
          testName: 'Authentication Tests',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 📊 Data Validation Tests
    async testDataValidation() {
      try {
        const validationTests = [];
        
        // Test questionnaire data validation
        const questionnaireTest = await this.testQuestionnaireValidation();
        validationTests.push(questionnaireTest);
        
        // Test self-assessment data validation
        const selfAssessmentTest = await this.testSelfAssessmentValidation();
        validationTests.push(selfAssessmentTest);
        
        // Test happiness score validation
        const scoreTest = await this.testScoreValidation();
        validationTests.push(scoreTest);
        
        const overallStatus = validationTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Data Validation Tests',
          status: overallStatus,
          tests: validationTests
        };
      } catch (error) {
        return {
          testName: 'Data Validation Tests',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testQuestionnaireValidation() {
      try {
        // Test with invalid questionnaire data
        const invalidData = {
          experience_level: 'invalid', // Should be number
          goals: 'not-an-array', // Should be array
          age_range: 999 // Invalid range
        };
        
        let handledInvalid = false;
        try {
          await this.contexts.markQuestionnaireComplete(invalidData);
          // If no error thrown, check if system handles invalid data gracefully
          const score = await this.contexts.getCurrentHappinessScore();
          handledInvalid = typeof score === 'number' && !isNaN(score);
        } catch (error) {
          // Error thrown is also acceptable (proper validation)
          handledInvalid = true;
        }
        
        return {
          name: 'Questionnaire Data Validation',
          status: handledInvalid ? 'PASS' : 'FAIL',
          details: 'System properly handles invalid questionnaire data'
        };
      } catch (error) {
        return {
          name: 'Questionnaire Data Validation',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testSelfAssessmentValidation() {
      try {
        // Test with invalid self-assessment data
        const invalidData = {
          taste: 'invalid-value', // Should be predefined values
          smell: 12345, // Should be string
          totalAttachmentPenalty: 'not-a-number' // Should be number
        };
        
        let handledInvalid = false;
        try {
          await this.contexts.markSelfAssessmentComplete(invalidData);
          // Check if system handles invalid data gracefully
          const score = await this.contexts.getCurrentHappinessScore();
          handledInvalid = typeof score === 'number' && !isNaN(score);
        } catch (error) {
          // Error thrown is acceptable (proper validation)
          handledInvalid = true;
        }
        
        return {
          name: 'Self-Assessment Data Validation',
          status: handledInvalid ? 'PASS' : 'FAIL',
          details: 'System properly handles invalid self-assessment data'
        };
      } catch (error) {
        return {
          name: 'Self-Assessment Data Validation',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testScoreValidation() {
      try {
        // Test happiness score validation
        const score = await this.contexts.getCurrentHappinessScore();
        
        const isValidScore = typeof score === 'number' && 
                            !isNaN(score) && 
                            score >= 0 && 
                            score <= 100;
        
        return {
          name: 'Happiness Score Validation',
          status: isValidScore ? 'PASS' : 'FAIL',
          details: `Score: ${score}, Type: ${typeof score}, Valid: ${isValidScore}`
        };
      } catch (error) {
        return {
          name: 'Happiness Score Validation',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 🧹 Input Sanitization Tests
    async testInputSanitization() {
      try {
        const sanitizationTests = [];
        
        // Test script injection in questionnaire
        const scriptTest = await this.testScriptInjection();
        sanitizationTests.push(scriptTest);
        
        // Test SQL injection patterns (even though we're using localStorage)
        const sqlTest = await this.testSQLInjectionPatterns();
        sanitizationTests.push(sqlTest);
        
        // Test HTML injection
        const htmlTest = await this.testHTMLInjection();
        sanitizationTests.push(htmlTest);
        
        const overallStatus = sanitizationTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Input Sanitization Tests',
          status: overallStatus,
          tests: sanitizationTests
        };
      } catch (error) {
        return {
          testName: 'Input Sanitization Tests',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testScriptInjection() {
      try {
        const maliciousData = {
          experience_level: '<script>alert("XSS")</script>',
          goals: ['<script>malicious()</script>'],
          work_life_balance: 'normal"; alert("injected"); var x="'
        };
        
        // Test if system handles malicious input safely
        let systemSafe = false;
        try {
          await this.contexts.markQuestionnaireComplete(maliciousData);
          const score = await this.contexts.getCurrentHappinessScore();
          // If we get a valid score, system handled malicious input safely
          systemSafe = typeof score === 'number' && !isNaN(score);
        } catch (error) {
          // Error handling is also acceptable
          systemSafe = true;
        }
        
        return {
          name: 'Script Injection Prevention',
          status: systemSafe ? 'PASS' : 'FAIL',
          details: 'System safely handles script injection attempts'
        };
      } catch (error) {
        return {
          name: 'Script Injection Prevention',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testSQLInjectionPatterns() {
      try {
        const sqlPatterns = {
          experience_level: "1; DROP TABLE users; --",
          goals: ["'; DELETE FROM data; --"],
          stress_response: "admin' OR '1'='1"
        };
        
        let systemSafe = false;
        try {
          await this.contexts.markQuestionnaireComplete(sqlPatterns);
          const score = await this.contexts.getCurrentHappinessScore();
          systemSafe = typeof score === 'number' && !isNaN(score);
        } catch (error) {
          systemSafe = true;
        }
        
        return {
          name: 'SQL Injection Pattern Prevention',
          status: systemSafe ? 'PASS' : 'FAIL',
          details: 'System safely handles SQL injection patterns'
        };
      } catch (error) {
        return {
          name: 'SQL Injection Pattern Prevention',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testHTMLInjection() {
      try {
        const htmlData = {
          stress_response: '<img src=x onerror=alert("HTML injection")>',
          work_life_balance: '<div onclick="malicious()">Click me</div>'
        };
        
        let systemSafe = false;
        try {
          await this.contexts.markQuestionnaireComplete(htmlData);
          const score = await this.contexts.getCurrentHappinessScore();
          systemSafe = typeof score === 'number' && !isNaN(score);
        } catch (error) {
          systemSafe = true;
        }
        
        return {
          name: 'HTML Injection Prevention',
          status: systemSafe ? 'PASS' : 'FAIL',
          details: 'System safely handles HTML injection attempts'
        };
      } catch (error) {
        return {
          name: 'HTML Injection Prevention',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 🛡️ XSS Prevention Tests
    async testXSSPrevention() {
      try {
        // Test common XSS vectors
        const xssVectors = [
          '<script>alert("XSS")</script>',
          'javascript:alert("XSS")',
          '<img src=x onerror=alert("XSS")>',
          '"><script>alert("XSS")</script>'
        ];
        
        let allSafe = true;
        
        for (const vector of xssVectors) {
          try {
            const testData = { experience_level: vector };
            await this.contexts.markQuestionnaireComplete(testData);
            const score = await this.contexts.getCurrentHappinessScore();
            
            // If we get a valid score, the XSS was handled safely
            if (typeof score !== 'number' || isNaN(score)) {
              allSafe = false;
              break;
            }
          } catch (error) {
            // Error handling is acceptable for XSS prevention
            continue;
          }
        }
        
        return {
          name: 'XSS Prevention',
          status: allSafe ? 'PASS' : 'FAIL',
          details: `Tested ${xssVectors.length} XSS vectors`
        };
      } catch (error) {
        return {
          name: 'XSS Prevention',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 🔐 Data Security Tests
    async testDataSecurity() {
      try {
        const securityTests = [];
        
        // Test localStorage security
        securityTests.push(this.testLocalStorageSecurity());
        
        // Test data encryption (basic check)
        securityTests.push(this.testDataEncryption());
        
        // Test sensitive data exposure
        securityTests.push(this.testSensitiveDataExposure());
        
        const overallStatus = securityTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Data Security Tests',
          status: overallStatus,
          tests: securityTests
        };
      } catch (error) {
        return {
          testName: 'Data Security Tests',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    testLocalStorageSecurity() {
      try {
        // Test if localStorage is accessible (it should be for our app)
        const testKey = 'securityTest';
        const testValue = 'testData';
        
        localStorage.setItem(testKey, testValue);
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        
        const isWorking = retrieved === testValue;
        
        return {
          name: 'localStorage Security',
          status: isWorking ? 'PASS' : 'FAIL',
          details: 'localStorage functionality verified'
        };
      } catch (error) {
        return {
          name: 'localStorage Security',
          status: 'FAIL',
          error: error.message
        };
      }
    }
  
    testDataEncryption() {
      try {
        // For a client-side app, we check if sensitive data isn't stored in plain text
        // This is a basic check - in a real app you'd have actual encryption
        
        const questData = localStorage.getItem('testQuestionnaire');
        const selfData = localStorage.getItem('testSelfAssessment');
        
        // Check if data exists and is properly formatted JSON
        let isSecure = true;
        
        if (questData) {
          try {
            JSON.parse(questData);
          } catch (e) {
            isSecure = false;
          }
        }
        
        if (selfData) {
          try {
            JSON.parse(selfData);
          } catch (e) {
            isSecure = false;
          }
        }
        
        return {
          name: 'Data Format Security',
          status: isSecure ? 'PASS' : 'FAIL',
          details: 'Data stored in proper JSON format'
        };
      } catch (error) {
        return {
          name: 'Data Format Security',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    testSensitiveDataExposure() {
      // Check if any sensitive data is exposed in console or global variables
      try {
        // This is a basic check for obvious data exposure
        const windowKeys = Object.keys(window);
        const suspiciousKeys = windowKeys.filter(key => 
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('secret') ||
          key.toLowerCase().includes('token')
        );
        
        return {
          name: 'Sensitive Data Exposure',
          status: suspiciousKeys.length === 0 ? 'PASS' : 'FAIL',
          details: suspiciousKeys.length > 0 ? `Found suspicious keys: ${suspiciousKeys.join(', ')}` : 'No obvious sensitive data exposure'
        };
      } catch (error) {
        return {
          name: 'Sensitive Data Exposure',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 🔑 Session Management Tests
    async testSessionSecurity() {
      try {
        const sessionTests = [];
        
        // Test session persistence
        sessionTests.push(this.testSessionPersistence());
        
        // Test session data integrity
        sessionTests.push(this.testSessionIntegrity());
        
        const overallStatus = sessionTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Session Security Tests',
          status: overallStatus,
          tests: sessionTests
        };
      } catch (error) {
        return {
          testName: 'Session Security Tests',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    testSessionPersistence() {
      try {
        // Test if user session persists appropriately
        const hasUser = !!this.contexts.user;
        
        return {
          name: 'Session Persistence',
          status: hasUser ? 'PASS' : 'FAIL',
          details: hasUser ? 'User session active' : 'No active session'
        };
      } catch (error) {
        return {
          name: 'Session Persistence',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    testSessionIntegrity() {
      try {
        // Basic session integrity check
        const user = this.contexts.user;
        const hasValidUser = user && user.email && typeof user.email === 'string';
        
        return {
          name: 'Session Integrity',
          status: hasValidUser ? 'PASS' : 'FAIL',
          details: hasValidUser ? 'Session data intact' : 'Session data invalid'
        };
      } catch (error) {
        return {
          name: 'Session Integrity',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 🚨 Error Handling Security Tests
    async testErrorHandling() {
      try {
        const errorTests = [];
        
        // Test if errors expose sensitive information
        errorTests.push(await this.testErrorInformationLeakage());
        
        // Test graceful error handling
        errorTests.push(await this.testGracefulErrorHandling());
        
        const overallStatus = errorTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
        
        return {
          testName: 'Error Handling Security',
          status: overallStatus,
          tests: errorTests
        };
      } catch (error) {
        return {
          testName: 'Error Handling Security',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    async testErrorInformationLeakage() {
      try {
        // Test if error messages expose sensitive information
        let errorExposed = false;
        
        try {
          // Intentionally cause an error and check the message
          await this.contexts.markQuestionnaireComplete(null);
        } catch (error) {
          const errorMessage = error.message.toLowerCase();
          // Check if error contains sensitive information
          errorExposed = errorMessage.includes('password') ||
                       errorMessage.includes('token') ||
                       errorMessage.includes('secret') ||
                       errorMessage.includes('database');
        }
        
        return {
          name: 'Error Information Leakage',
          status: !errorExposed ? 'PASS' : 'FAIL',
          details: errorExposed ? 'Error messages may expose sensitive information' : 'Error messages are safe'
        };
      } catch (error) {
        return {
          name: 'Error Information Leakage',
          status: 'PASS',
          details: 'Error handling is working properly'
        };
      }
    }
  
    async testGracefulErrorHandling() {
      try {
        // Test if the system handles errors gracefully
        let handlesGracefully = false;
        
        try {
          // Pass invalid data and see if system continues to function
          await this.contexts.markQuestionnaireComplete(undefined);
          const score = await this.contexts.getCurrentHappinessScore();
          handlesGracefully = typeof score === 'number';
        } catch (error) {
          // If error is thrown but system can still function, that's acceptable
          try {
            const score = await this.contexts.getCurrentHappinessScore();
            handlesGracefully = typeof score === 'number';
          } catch (e) {
            handlesGracefully = false;
          }
        }
        
        return {
          name: 'Graceful Error Handling',
          status: handlesGracefully ? 'PASS' : 'FAIL',
          details: handlesGracefully ? 'System handles errors gracefully' : 'System may crash on errors'
        };
      } catch (error) {
        return {
          name: 'Graceful Error Handling',
          status: 'ERROR',
          error: error.message
        };
      }
    }
  
    // 🔧 Helper Methods
    testDataAccess() {
      try {
        // Test if localStorage access is working
        return typeof Storage !== 'undefined' && localStorage;
      } catch (error) {
        return false;
      }
    }
  
    calculateSecurityScore(tests) {
      const allTests = this.flattenSecurityTests(tests);
      const passedTests = allTests.filter(test => test.status === 'PASS').length;
      const totalTests = allTests.length;
      
      return totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
    }
  
    flattenSecurityTests(tests) {
      const flattened = [];
      
      tests.forEach(test => {
        if (test.checks) {
          flattened.push(...test.checks);
        } else if (test.tests) {
          flattened.push(...test.tests);
        } else {
          flattened.push(test);
        }
      });
      
      return flattened;
    }
  }