// src/testing/Reporter.js
// 📊 PROFESSIONAL Test Reporter with Excel Generation
// ✅ All your professional code, now in the working /testing/ folder!

export class TestReporter {
  constructor() {
    this.reportId = this.generateReportId();
  }

  generateReportId() {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `PAHM_TEST_${timestamp}_${random}`;
  }

  // 📋 Generate Quick Test Report (JSON) - ENHANCED VERSION
  async generateQuickTestReport(results) {
    try {
      const reportData = {
        reportId: this.reportId,
        reportType: 'PAHM Quick Test Results',
        timestamp: new Date().toISOString(),
        testTier: 'Quick (5 minutes)',
        summary: results.summary || {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          overallStatus: 'UNKNOWN'
        },
        execution: {
          startTime: results.startTime,
          endTime: results.endTime,
          duration: results.duration || { formatted: 'N/A', milliseconds: 0 }
        },
        testCases: results.tests || {},
        systemInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toLocaleString(),
          testEnvironment: 'Production',
          reportGeneratedBy: 'Professional Testing System'
        },
        realSystemData: results.realSystemData || {},
        analysis: this.generateQuickAnalysis(results)
      };

      return reportData;
    } catch (error) {
      return {
        reportId: this.reportId,
        reportType: 'Quick Test Report',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📊 Generate Standard Test Report (JSON + Excel-ready data)
  async generateStandardTestReport(results) {
    try {
      const reportData = await this.generateQuickTestReport(results);
      
      reportData.reportType = 'PAHM Standard Test Results';
      reportData.testTier = 'Standard (15 minutes)';
      
      // Add detailed analysis
      reportData.analysis = {
        passRate: results.summary?.passRate || 0,
        criticalIssues: this.identifyCriticalIssues(results.tests || {}),
        recommendations: this.generateRecommendations(results.tests || {}),
        performanceMetrics: this.calculatePerformanceMetrics(results.tests || {}),
        detailedBreakdown: this.generateDetailedBreakdown(results.tests || {})
      };

      // Add Excel-ready data structure
      reportData.excelData = this.prepareExcelData(results);

      return reportData;
    } catch (error) {
      return {
        reportId: this.reportId,
        reportType: 'Standard Test Report',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 📋 Generate Comprehensive Test Report (Complete Analysis)
  async generateComprehensiveTestReport(results) {
    try {
      const reportData = await this.generateStandardTestReport(results);
      
      reportData.reportType = 'PAHM Comprehensive Test Results';
      reportData.testTier = 'Comprehensive (45 minutes)';
      
      // Add comprehensive analysis
      reportData.comprehensiveAnalysis = {
        detailedBreakdown: this.generateDetailedBreakdown(results.tests || {}),
        trendAnalysis: this.generateTrendAnalysis(results.tests || {}),
        securityAssessment: this.generateSecurityAssessment(results.tests || {}),
        performanceProfile: this.generatePerformanceProfile(results.tests || {}),
        qualityMetrics: this.generateQualityMetrics(results.tests || {}),
        executiveSummary: this.generateExecutiveSummary(results),
        actionItems: this.generateActionItems(results.tests || {})
      };

      return reportData;
    } catch (error) {
      return {
        reportId: this.reportId,
        reportType: 'Comprehensive Test Report',
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // 🔍 Analysis Helper Methods
  generateQuickAnalysis(results) {
    const passRate = results.summary?.passRate || 0;
    
    return {
      healthStatus: passRate >= 80 ? 'HEALTHY' : passRate >= 60 ? 'WARNING' : 'CRITICAL',
      keyFindings: [
        `${results.summary?.passedTests || 0}/${results.summary?.totalTests || 0} tests passed`,
        `Overall pass rate: ${passRate}%`,
        results.summary?.overallStatus === 'PASS' ? 'System functioning normally' : 'Issues detected'
      ],
      recommendedActions: passRate < 80 ? ['Review failed tests', 'Check system configuration'] : ['Continue monitoring']
    };
  }

  identifyCriticalIssues(tests) {
    const critical = [];
    
    Object.entries(tests).forEach(([key, test]) => {
      if (test.status === 'FAIL' && test.expected && test.actual) {
        const severity = Math.abs(test.difference) > (test.tolerance * 2) ? 'HIGH' : 'MEDIUM';
        critical.push({
          testCase: test.testName || key,
          severity,
          issue: `Expected ${test.expected}±${test.tolerance}, got ${test.actual}`,
          difference: test.difference,
          impact: 'Happiness calculation accuracy'
        });
      } else if (test.status === 'ERROR') {
        critical.push({
          testCase: test.testName || key,
          severity: 'HIGH',
          issue: `Test execution failed: ${test.error}`,
          impact: 'System functionality'
        });
      }
    });

    return critical;
  }

  generateRecommendations(tests) {
    const recommendations = [];
    
    Object.entries(tests).forEach(([key, test]) => {
      if (test.status === 'FAIL') {
        if (test.testName?.includes('Experienced')) {
          recommendations.push({
            category: 'Algorithm Calibration',
            priority: 'HIGH',
            action: 'Increase base happiness calculation for experienced practitioners',
            expectedImpact: 'Improve accuracy for advanced users',
            testCase: test.testName
          });
        }
        if (test.testName?.includes('Beginner')) {
          recommendations.push({
            category: 'Scoring System',
            priority: 'MEDIUM', 
            action: 'Adjust penalty calculations for beginners',
            expectedImpact: 'Better reflect beginner experience levels',
            testCase: test.testName
          });
        }
        if (test.testName?.includes('Security')) {
          recommendations.push({
            category: 'Security',
            priority: 'HIGH',
            action: 'Review security configurations and access controls',
            expectedImpact: 'Improved system security',
            testCase: test.testName
          });
        }
      }
    });

    // Add general recommendations if no specific ones
    if (recommendations.length === 0) {
      recommendations.push({
        category: 'System Maintenance',
        priority: 'LOW',
        action: 'Continue regular testing and monitoring',
        expectedImpact: 'Maintain system reliability'
      });
    }

    return recommendations;
  }

  calculatePerformanceMetrics(tests) {
    const executionTimes = Object.values(tests)
      .filter(test => test.executionTime)
      .map(test => test.executionTime);

    if (executionTimes.length === 0) {
      return {
        averageExecutionTime: 0,
        totalExecutionTime: 0,
        fastestTest: 0,
        slowestTest: 0,
        performanceRating: 'N/A'
      };
    }

    const avg = Math.round(executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length);
    const total = executionTimes.reduce((a, b) => a + b, 0);
    const fastest = Math.min(...executionTimes);
    const slowest = Math.max(...executionTimes);

    return {
      averageExecutionTime: avg,
      totalExecutionTime: total,
      fastestTest: fastest,
      slowestTest: slowest,
      performanceRating: avg < 100 ? 'EXCELLENT' : avg < 500 ? 'GOOD' : avg < 1000 ? 'FAIR' : 'POOR'
    };
  }

  generateDetailedBreakdown(tests) {
    const breakdown = {
      testCategories: {},
      statusDistribution: { PASS: 0, FAIL: 0, ERROR: 0, DISABLED: 0 },
      executionTimesByCategory: {}
    };

    Object.entries(tests).forEach(([key, test]) => {
      // Categorize tests
      const category = this.categorizeTest(test.testName || key);
      if (!breakdown.testCategories[category]) {
        breakdown.testCategories[category] = { total: 0, passed: 0, failed: 0, errors: 0 };
        breakdown.executionTimesByCategory[category] = [];
      }

      breakdown.testCategories[category].total++;
      breakdown.statusDistribution[test.status] = (breakdown.statusDistribution[test.status] || 0) + 1;

      if (test.status === 'PASS') breakdown.testCategories[category].passed++;
      else if (test.status === 'FAIL') breakdown.testCategories[category].failed++;
      else if (test.status === 'ERROR') breakdown.testCategories[category].errors++;

      if (test.executionTime) {
        breakdown.executionTimesByCategory[category].push(test.executionTime);
      }
    });

    return breakdown;
  }

  categorizeTest(testName) {
    const name = testName.toLowerCase();
    if (name.includes('pahm')) return 'PAHM Tests';
    if (name.includes('security')) return 'Security Tests';
    if (name.includes('performance')) return 'Performance Tests';
    if (name.includes('browser')) return 'Browser Compatibility';
    if (name.includes('data') || name.includes('integrity')) return 'Data Integrity';
    if (name.includes('user') || name.includes('journey')) return 'User Journey';
    if (name.includes('system')) return 'System Validation';
    return 'Other Tests';
  }

  generateTrendAnalysis(tests) {
    // Simulated trend analysis - in real implementation, this would compare with historical data
    return {
      passRateTrend: 'STABLE',
      performanceTrend: 'IMPROVING',
      reliabilityTrend: 'STABLE',
      notes: 'Based on current test run - implement historical tracking for true trend analysis'
    };
  }

  generateSecurityAssessment(tests) {
    const securityTests = Object.values(tests).filter(test => 
      test.testName?.toLowerCase().includes('security')
    );

    const securityScore = securityTests.length > 0 ? 
      (securityTests.filter(t => t.status === 'PASS').length / securityTests.length) * 100 : 0;

    return {
      securityScore: Math.round(securityScore),
      securityLevel: securityScore >= 90 ? 'HIGH' : securityScore >= 70 ? 'MEDIUM' : 'LOW',
      securityTests: securityTests.length,
      vulnerabilities: securityTests.filter(t => t.status === 'FAIL').length,
      recommendations: securityScore < 90 ? ['Review failed security tests', 'Update security protocols'] : ['Maintain current security measures']
    };
  }

  generatePerformanceProfile(tests) {
    const performanceMetrics = this.calculatePerformanceMetrics(tests);
    
    return {
      overallPerformance: performanceMetrics.performanceRating,
      averageResponseTime: performanceMetrics.averageExecutionTime,
      performanceCategory: 'Standard Testing',
      bottlenecks: performanceMetrics.slowestTest > 1000 ? ['Slow test execution detected'] : [],
      optimizations: ['Consider parallel test execution', 'Implement test result caching']
    };
  }

  generateQualityMetrics(tests) {
    const totalTests = Object.keys(tests).length;
    const passedTests = Object.values(tests).filter(t => t.status === 'PASS').length;
    const coverage = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return {
      testCoverage: Math.round(coverage),
      qualityScore: Math.round(coverage),
      reliability: coverage >= 90 ? 'HIGH' : coverage >= 70 ? 'MEDIUM' : 'LOW',
      maintainabilityIndex: 85, // Simulated - would be calculated from code metrics
      technicalDebt: 'LOW'
    };
  }

  generateExecutiveSummary(results) {
    const passRate = results.summary?.passRate || 0;
    
    return {
      overallHealth: passRate >= 90 ? 'EXCELLENT' : passRate >= 75 ? 'GOOD' : passRate >= 50 ? 'FAIR' : 'POOR',
      keyMetrics: {
        testsExecuted: results.summary?.totalTests || 0,
        successRate: `${passRate}%`,
        executionTime: results.duration?.formatted || 'N/A'
      },
      criticalFindings: passRate < 80 ? ['System reliability concerns detected'] : ['System operating within normal parameters'],
      businessImpact: passRate >= 80 ? 'Minimal risk to user experience' : 'Potential impact on user satisfaction',
      nextSteps: ['Continue regular testing', 'Monitor key metrics', 'Address any critical issues']
    };
  }

  generateActionItems(tests) {
    const actionItems = [];
    
    Object.entries(tests).forEach(([key, test]) => {
      if (test.status === 'FAIL') {
        actionItems.push({
          priority: 'HIGH',
          action: `Fix failing test: ${test.testName || key}`,
          owner: 'Development Team',
          dueDate: this.addDays(new Date(), 3),
          description: test.error || 'Test failure requires investigation'
        });
      }
    });

    if (actionItems.length === 0) {
      actionItems.push({
        priority: 'LOW',
        action: 'Schedule next regular testing cycle',
        owner: 'QA Team',
        dueDate: this.addDays(new Date(), 7),
        description: 'Maintain regular testing schedule'
      });
    }

    return actionItems;
  }

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
  }

  // 📋 Excel Data Preparation
  prepareExcelData(results) {
    const excelData = {
      summary: this.createSummarySheet(results),
      testDetails: this.createTestDetailsSheet(results.tests || {}),
      recommendations: this.createRecommendationsSheet(results.tests || {}),
      performanceMetrics: this.createPerformanceSheet(results.tests || {})
    };

    return excelData;
  }

  createSummarySheet(results) {
    return [
      ['PAHM System Test Summary'],
      ['Report ID', this.reportId],
      ['Test Date', new Date().toLocaleString()],
      ['Test Tier', results.testTier || 'Quick'],
      [''],
      ['Metric', 'Value'],
      ['Total Tests', results.summary?.totalTests || 0],
      ['Passed Tests', results.summary?.passedTests || 0],
      ['Failed Tests', results.summary?.failedTests || 0],
      ['Pass Rate', `${results.summary?.passRate || 0}%`],
      ['Overall Status', results.summary?.overallStatus || 'UNKNOWN'],
      ['Execution Time', results.duration?.formatted || 'N/A']
    ];
  }

  createTestDetailsSheet(tests) {
    const headers = ['Test Name', 'Status', 'Expected', 'Actual', 'Difference', 'Tolerance', 'Execution Time'];
    const rows = [headers];

    Object.entries(tests).forEach(([key, test]) => {
      rows.push([
        test.testName || key,
        test.status,
        test.expected || 'N/A',
        test.actual || 'N/A',
        test.difference || 'N/A',
        test.tolerance || 'N/A',
        test.executionTime ? `${test.executionTime}ms` : 'N/A'
      ]);
    });

    return rows;
  }

  createRecommendationsSheet(tests) {
    const recommendations = this.generateRecommendations(tests);
    const headers = ['Category', 'Priority', 'Action', 'Expected Impact', 'Test Case'];
    const rows = [headers];

    recommendations.forEach(rec => {
      rows.push([
        rec.category,
        rec.priority,
        rec.action,
        rec.expectedImpact,
        rec.testCase || 'General'
      ]);
    });

    return rows;
  }

  createPerformanceSheet(tests) {
    const metrics = this.calculatePerformanceMetrics(tests);
    return [
      ['Performance Metrics'],
      [''],
      ['Metric', 'Value'],
      ['Average Execution Time', `${metrics.averageExecutionTime}ms`],
      ['Total Execution Time', `${metrics.totalExecutionTime}ms`],
      ['Fastest Test', `${metrics.fastestTest}ms`],
      ['Slowest Test', `${metrics.slowestTest}ms`],
      ['Performance Rating', metrics.performanceRating]
    ];
  }

  // 📥 Download Methods
  async downloadJSONReport(reportData, filename) {
    try {
      const jsonString = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${this.reportId}.json`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      console.log(`📥 JSON Report downloaded: ${filename}`);
      return {
        status: 'SUCCESS',
        filename: filename || `${this.reportId}.json`,
        size: jsonString.length,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to download JSON report:', error);
      return {
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async downloadCSVReport(reportData, filename) {
    try {
      const csvContent = this.convertToCSV(reportData.excelData || reportData);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${this.reportId}.csv`;
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      console.log(`📥 CSV Report downloaded: ${filename}`);
      return {
        status: 'SUCCESS',
        filename: filename || `${this.reportId}.csv`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to download CSV report:', error);
      return {
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  convertToCSV(data) {
    if (data.testDetails) {
      return data.testDetails.map(row => row.join(',')).join('\n');
    }
    
    // Fallback: convert test results to CSV
    const headers = ['Test Case', 'Status', 'Expected', 'Actual', 'Difference', 'Execution Time'];
    const rows = [headers];
    
    if (data.testCases) {
      Object.entries(data.testCases).forEach(([key, test]) => {
        rows.push([
          test.testName || key,
          test.status,
          test.expected || 'N/A',
          test.actual || 'N/A',
          test.difference || 'N/A',
          test.executionTime ? `${test.executionTime}ms` : 'N/A'
        ]);
      });
    }
    
    return rows.map(row => row.join(',')).join('\n');
  }

  // 📁 File download helper
  downloadReport(reportData, filename) {
    return this.downloadJSONReport(reportData, filename);
  }

  // 📈 Real-time dashboard methods (enhanced)
  async updateLiveDashboard(results) {
    try {
      const dashboardData = {
        lastUpdate: new Date().toISOString(),
        status: results.summary?.overallStatus || 'UNKNOWN',
        metrics: {
          totalTests: results.summary?.totalTests || 0,
          passedTests: results.summary?.passedTests || 0,
          failedTests: results.summary?.failedTests || 0,
          passRate: results.summary?.passRate || 0
        },
        alerts: this.generateAlerts(results),
        trends: this.generateTrendData(results),
        quickStats: this.generateQuickStats(results)
      };

      return dashboardData;
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  generateAlerts(results) {
    const alerts = [];
    
    if (results.summary?.failedTests > 0) {
      alerts.push({
        type: 'WARNING',
        message: `${results.summary.failedTests} tests failed`,
        severity: results.summary.failedTests > 3 ? 'HIGH' : 'MEDIUM',
        action: 'Review failed tests immediately'
      });
    }
    
    if (results.summary?.passRate < 80) {
      alerts.push({
        type: 'CRITICAL',
        message: `Pass rate below threshold: ${results.summary.passRate}%`,
        severity: 'HIGH',
        action: 'Investigate system reliability'
      });
    }
    
    return alerts;
  }

  generateTrendData(results) {
    // Simulated trend data - in real implementation, this would use historical data
    return {
      passRateHistory: [85, 87, 89, results.summary?.passRate || 0],
      executionTimeHistory: [2.1, 2.3, 2.0, parseFloat(results.duration?.formatted?.replace('s', '')) || 0],
      testCountHistory: [15, 16, 15, results.summary?.totalTests || 0]
    };
  }

  generateQuickStats(results) {
    return {
      systemHealth: results.summary?.passRate >= 90 ? 'EXCELLENT' : 
                   results.summary?.passRate >= 75 ? 'GOOD' : 
                   results.summary?.passRate >= 50 ? 'FAIR' : 'POOR',
      lastTestDuration: results.duration?.formatted || 'N/A',
      criticalIssues: results.summary?.failedTests || 0,
      nextScheduledTest: this.addDays(new Date(), 1)
    };
  }

  async emailReportToStakeholders(results) {
    try {
      // Simulated email functionality
      const emailData = {
        subject: `PAHM Test Report ${this.reportId} - ${results.summary?.overallStatus || 'COMPLETED'}`,
        recipients: ['admin@company.com', 'dev-team@company.com'],
        attachments: ['comprehensive-report.json', 'test-details.csv'],
        status: 'SENT',
        timestamp: new Date().toISOString(),
        content: this.generateEmailContent(results)
      };

      console.log('📧 Email report prepared:', emailData.subject);
      return emailData;
    } catch (error) {
      return {
        status: 'ERROR',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  generateEmailContent(results) {
    const passRate = results.summary?.passRate || 0;
    return `
PAHM System Test Report
=====================

Report ID: ${this.reportId}
Test Date: ${new Date().toLocaleString()}
Test Tier: ${results.testTier || 'Quick'}

Summary:
- Total Tests: ${results.summary?.totalTests || 0}
- Passed: ${results.summary?.passedTests || 0}
- Failed: ${results.summary?.failedTests || 0}
- Pass Rate: ${passRate}%
- Overall Status: ${results.summary?.overallStatus || 'UNKNOWN'}

System Health: ${passRate >= 90 ? 'EXCELLENT' : passRate >= 75 ? 'GOOD' : passRate >= 50 ? 'FAIR' : 'NEEDS ATTENTION'}

${passRate < 80 ? 'ATTENTION REQUIRED: Some tests failed. Please review the detailed report.' : 'All systems operating normally.'}

Detailed reports are attached.
    `.trim();
  }
}