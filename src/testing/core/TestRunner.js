// src/testing/core/TestReporter.js
// 📊 Professional Test Report Generation - Excel/CSV/JSON

export class TestReporter {
  constructor() {
    this.reportTemplates = {
      quick: 'Quick Test Report',
      standard: 'Standard Test Report', 
      comprehensive: 'Comprehensive Test Report'
    };
  }

  // 📊 MAIN REPORT GENERATORS

  async generateQuickTestReport(results) {
    console.log('📊 Generating Quick Test Report...');
    
    const reportData = {
      reportType: 'Quick Test Report (5 minutes)',
      timestamp: new Date().toISOString(),
      summary: results.summary,
      testResults: results.tests,
      duration: results.duration,
      overallStatus: results.summary?.overallStatus || 'UNKNOWN'
    };

    // Generate Excel-like structure
    const excelData = this.formatForExcel(reportData, 'quick');
    
    // For now, return formatted data (later we'll add actual Excel generation)
    return {
      type: 'quick',
      data: excelData,
      downloadName: `quick-test-report-${this.getFormattedDate()}.json`,
      summary: this.generateReportSummary(reportData)
    };
  }

  async generateStandardTestReport(results) {
    console.log('📊 Generating Standard Test Report...');
    
    const reportData = {
      reportType: 'Standard Test Report (15 minutes)',
      timestamp: new Date().toISOString(),
      summary: results.summary,
      testResults: results.tests,
      duration: results.duration,
      overallStatus: results.summary?.overallStatus || 'UNKNOWN'
    };

    const excelData = this.formatForExcel(reportData, 'standard');
    
    return {
      type: 'standard',
      data: excelData,
      downloadName: `standard-test-report-${this.getFormattedDate()}.json`,
      summary: this.generateReportSummary(reportData)
    };
  }

  async generateComprehensiveTestReport(results) {
    console.log('📊 Generating Comprehensive Test Report...');
    
    const reportData = {
      reportType: 'Comprehensive Test Report (45 minutes)',
      timestamp: new Date().toISOString(),
      summary: results.summary,
      testResults: results.tests,
      duration: results.duration,
      overallStatus: results.summary?.overallStatus || 'UNKNOWN',
      additionalValidations: results.additionalValidations || {}
    };

    const excelData = this.formatForExcel(reportData, 'comprehensive');
    
    return {
      type: 'comprehensive',
      data: excelData,
      downloadName: `comprehensive-test-report-${this.getFormattedDate()}.json`,
      summary: this.generateReportSummary(reportData)
    };
  }

  // 🧪 PAHM-SPECIFIC REPORT GENERATION

  async generatePAHMReport(pahmResults) {
    console.log('🧪 Generating PAHM Test Report...');
    
    const reportData = {
      reportType: 'PAHM Test Results',
      timestamp: new Date().toISOString(),
      summary: pahmResults.summary,
      testCases: pahmResults.tests,
      duration: pahmResults.duration
    };

    // Create detailed PAHM report structure
    const pahmReport = {
      executiveSummary: this.generatePAHMExecutiveSummary(pahmResults),
      testCaseResults: this.formatPAHMTestCases(pahmResults.tests),
      componentBreakdown: this.generateComponentBreakdown(pahmResults.tests),
      performanceMetrics: this.generatePerformanceMetrics(pahmResults.tests),
      recommendations: this.generatePAHMRecommendations(pahmResults)
    };

    return {
      type: 'pahm',
      data: pahmReport,
      downloadName: `pahm-test-report-${this.getFormattedDate()}.json`,
      summary: pahmReport.executiveSummary
    };
  }

  // 📋 EXCEL FORMAT CONVERSION

  formatForExcel(reportData, reportType) {
    const excelStructure = {
      sheets: {}
    };

    // Executive Summary Sheet
    excelStructure.sheets['Executive Summary'] = {
      headers: ['Metric', 'Value', 'Status'],
      rows: [
        ['Report Type', reportData.reportType, ''],
        ['Timestamp', reportData.timestamp, ''],
        ['Duration', reportData.duration?.formatted || 'N/A', ''],
        ['Overall Status', reportData.overallStatus, reportData.overallStatus === 'PASS' ? '✅' : '❌'],
        ['Total Tests', reportData.summary?.totalTests || 'N/A', ''],
        ['Passed Tests', reportData.summary?.passedTests || 'N/A', '✅'],
        ['Failed Tests', reportData.summary?.failedTests || 'N/A', '❌'],
        ['Pass Rate', `${reportData.summary?.passRate || 0}%`, '']
      ]
    };

    // Test Results Sheet
    if (reportData.testResults) {
      excelStructure.sheets['Test Results'] = this.formatTestResultsForExcel(reportData.testResults);
    }

    // PAHM Specific Sheets
    if (reportData.testResults?.pahm) {
      excelStructure.sheets['PAHM Test Cases'] = this.formatPAHMForExcel(reportData.testResults.pahm);
    }

    return excelStructure;
  }

  formatTestResultsForExcel(testResults) {
    const headers = ['Test Category', 'Test Name', 'Status', 'Expected', 'Actual', 'Difference', 'Details'];
    const rows = [];

    Object.entries(testResults).forEach(([category, result]) => {
      if (result.tests) {
        // Multiple tests in category
        result.tests.forEach(test => {
          rows.push([
            category,
            test.name || test.testName || 'Unknown',
            test.status || 'UNKNOWN',
            test.expected || 'N/A',
            test.actual || 'N/A',
            test.difference || 'N/A',
            test.details || test.message || ''
          ]);
        });
      } else if (result.testName) {
        // Single test result
        rows.push([
          category,
          result.testName,
          result.status,
          result.expected || 'N/A',
          result.actual || 'N/A',
          result.difference || 'N/A',
          result.error || result.message || ''
        ]);
      }
    });

    return { headers, rows };
  }

  formatPAHMForExcel(pahmResults) {
    const headers = [
      'Test Case', 'Status', 'Target Score', 'Actual Score', 
      'Difference', 'Tolerance', 'Execution Time', 'Timestamp'
    ];
    const rows = [];

    if (pahmResults.tests) {
      Object.values(pahmResults.tests).forEach(test => {
        rows.push([
          test.testName || test.testKey,
          test.status,
          test.expected,
          test.actual,
          test.difference,
          `±${test.tolerance}`,
          `${test.executionTime}ms`,
          test.timestamp
        ]);
      });
    }

    return { headers, rows };
  }

  // 📊 PAHM-SPECIFIC REPORTING

  generatePAHMExecutiveSummary(pahmResults) {
    const summary = pahmResults.summary || {};
    
    return {
      overallStatus: summary.overallStatus || 'UNKNOWN',
      totalTests: summary.totalTests || 0,
      passedTests: summary.passedTests || 0,
      failedTests: summary.failedTests || 0,
      passRate: summary.passRate || 0,
      averageExecutionTime: summary.averageExecutionTime || 0,
      criticalIssues: this.identifyCriticalIssues(pahmResults),
      recommendations: this.generateExecutiveRecommendations(pahmResults)
    };
  }

  formatPAHMTestCases(testCases) {
    if (!testCases) return [];

    return Object.entries(testCases).map(([key, test]) => ({
      testKey: key,
      testName: test.testName,
      status: test.status,
      expected: test.expected,
      actual: test.actual,
      difference: test.difference,
      tolerance: test.tolerance,
      withinTolerance: test.status === 'PASS',
      executionTime: test.executionTime,
      components: test.components || {},
      questionnaire: test.questionnaire || {},
      selfAssessment: test.selfAssessment || {}
    }));
  }

  generateComponentBreakdown(testCases) {
    if (!testCases) return {};

    const breakdown = {};
    
    Object.entries(testCases).forEach(([key, test]) => {
      if (test.components) {
        breakdown[test.testName] = {
          expected: test.expectedComponents || {},
          actual: test.components,
          status: test.status
        };
      }
    });

    return breakdown;
  }

  generatePerformanceMetrics(testCases) {
    if (!testCases) return {};

    const executionTimes = Object.values(testCases)
      .map(test => test.executionTime)
      .filter(time => typeof time === 'number');

    if (executionTimes.length === 0) {
      return { status: 'NO_DATA' };
    }

    const avgTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
    const maxTime = Math.max(...executionTimes);
    const minTime = Math.min(...executionTimes);

    return {
      averageExecutionTime: Math.round(avgTime),
      maxExecutionTime: maxTime,
      minExecutionTime: minTime,
      performanceStatus: avgTime < 500 ? 'PASS' : 'FAIL', // 500ms threshold from checklist
      totalTests: executionTimes.length
    };
  }

  // 💡 RECOMMENDATIONS & INSIGHTS

  generatePAHMRecommendations(pahmResults) {
    const recommendations = [];
    const tests = pahmResults.tests || {};

    // Check for failing tests
    Object.values(tests).forEach(test => {
      if (test.status === 'FAIL') {
        const difference = Math.abs(test.actual - test.expected);
        if (difference > test.tolerance * 2) {
          recommendations.push({
            severity: 'HIGH',
            category: 'CALCULATION_ERROR',
            message: `${test.testName} is significantly outside tolerance (${difference} points difference)`,
            suggestedAction: 'Review happiness calculation algorithm'
          });
        } else {
          recommendations.push({
            severity: 'MEDIUM',
            category: 'TOLERANCE_ISSUE',
            message: `${test.testName} is slightly outside tolerance`,
            suggestedAction: 'Fine-tune calculation parameters'
          });
        }
      }
    });

    // Check performance
    const avgTime = pahmResults.summary?.averageExecutionTime;
    if (avgTime && avgTime > 500) {
      recommendations.push({
        severity: 'MEDIUM',
        category: 'PERFORMANCE',
        message: `Average execution time (${avgTime}ms) exceeds 500ms threshold`,
        suggestedAction: 'Optimize calculation performance'
      });
    }

    return recommendations;
  }

  generateExecutiveRecommendations(pahmResults) {
    const recommendations = this.generatePAHMRecommendations(pahmResults);
    
    // Summary for executives
    if (recommendations.length === 0) {
      return ['All PAHM tests are passing within acceptable parameters'];
    }

    const highSeverity = recommendations.filter(r => r.severity === 'HIGH').length;
    const mediumSeverity = recommendations.filter(r => r.severity === 'MEDIUM').length;

    const summary = [];
    if (highSeverity > 0) {
      summary.push(`${highSeverity} critical issues require immediate attention`);
    }
    if (mediumSeverity > 0) {
      summary.push(`${mediumSeverity} medium-priority improvements recommended`);
    }

    return summary;
  }

  identifyCriticalIssues(pahmResults) {
    const issues = [];
    const tests = pahmResults.tests || {};

    // Look for failed tests
    Object.values(tests).forEach(test => {
      if (test.status === 'FAIL') {
        issues.push({
          type: 'TEST_FAILURE',
          test: test.testName,
          severity: 'HIGH',
          description: `Test failed: expected ${test.expected}, got ${test.actual}`
        });
      } else if (test.status === 'ERROR') {
        issues.push({
          type: 'TEST_ERROR',
          test: test.testName,
          severity: 'CRITICAL',
          description: test.error || 'Test encountered an error'
        });
      }
    });

    return issues;
  }

  // 📥 DOWNLOAD & EXPORT

  async downloadReport(reportData, filename) {
    try {
      const jsonString = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      
      console.log(`📥 Report downloaded: ${filename}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to download report:', error);
      return false;
    }
  }

  async exportToCSV(reportData, filename) {
    try {
      const csvData = this.convertToCSV(reportData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.replace('.json', '.csv');
      link.click();
      
      window.URL.revokeObjectURL(url);
      
      console.log(`📥 CSV exported: ${filename}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to export CSV:', error);
      return false;
    }
  }

  // 🛠️ UTILITY METHODS

  generateReportSummary(reportData) {
    return {
      reportType: reportData.reportType,
      timestamp: reportData.timestamp,
      overallStatus: reportData.overallStatus,
      duration: reportData.duration,
      keyMetrics: {
        totalTests: reportData.summary?.totalTests || 0,
        passRate: reportData.summary?.passRate || 0,
        criticalIssues: this.countCriticalIssues(reportData)
      }
    };
  }

  countCriticalIssues(reportData) {
    let criticalCount = 0;
    
    if (reportData.testResults) {
      Object.values(reportData.testResults).forEach(result => {
        if (result.tests) {
          criticalCount += result.tests.filter(test => 
            test.status === 'FAIL' || test.status === 'ERROR'
          ).length;
        } else if (result.status === 'FAIL' || result.status === 'ERROR') {
          criticalCount++;
        }
      });
    }
    
    return criticalCount;
  }

  getFormattedDate() {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  convertToCSV(reportData) {
    // Simple CSV conversion for basic data
    if (reportData.data && reportData.data.sheets) {
      const sheet = reportData.data.sheets['Test Results'] || reportData.data.sheets['Executive Summary'];
      if (sheet) {
        const headers = sheet.headers.join(',');
        const rows = sheet.rows.map(row => row.join(',')).join('\n');
        return `${headers}\n${rows}`;
      }
    }
    
    return 'No data available for CSV export';
  }

  // 📊 REAL-TIME REPORTING (for live dashboard)

  generateLiveReport(testProgress) {
    return {
      currentTest: testProgress.currentTest,
      isRunning: testProgress.isRunning,
      elapsedTime: testProgress.elapsedTime,
      completedTests: testProgress.completedTests || 0,
      totalTests: testProgress.totalTests || 0,
      progress: testProgress.totalTests ? 
        Math.round((testProgress.completedTests / testProgress.totalTests) * 100) : 0
    };
  }

  // 📧 REPORT SHARING (placeholder for future implementation)

  async emailReport(reportData, recipients) {
    // TODO: Implement email functionality
    console.log('📧 Email functionality not yet implemented');
    console.log('Recipients:', recipients);
    console.log('Report type:', reportData.type);
    return { status: 'pending', message: 'Email functionality not yet implemented' };
  }
}