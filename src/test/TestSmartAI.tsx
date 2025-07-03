// ============================================================================
// src/test/TestSmartAI.tsx
// Test component to verify your smart AI integration works
// ============================================================================

import React, { useState } from 'react';
import { useSmartAI } from '../services/SmartAIOrchestrator';

interface TestResult {
  query: string;
  response: string;
  type: string;
  confidence: number;
  processingMethod: string;
  responseTime: number;
  timestamp: string;
  success: boolean;
}

const TestSmartAI: React.FC = () => {
  const [testInput, setTestInput] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const { sendMessage, isLoading } = useSmartAI('test-session');

  const testQueries = [
    { 
      query: 'Hi there!', 
      expectedMethod: 'intent_only',
      description: 'Simple greeting should use fast intent detection'
    },
    { 
      query: 'Thanks for your help', 
      expectedMethod: 'intent_only',
      description: 'Gratitude should use fast intent detection'
    },
    { 
      query: 'What is PAHM?', 
      expectedMethod: 'intent_only',
      description: 'Basic info should use fast intent detection'
    },
    { 
      query: 'I feel really anxious and overwhelmed lately', 
      expectedMethod: 'full_ai',
      description: 'Emotional distress should use full AI analysis'
    },
    { 
      query: 'How do I meditate properly when my mind keeps wandering?', 
      expectedMethod: 'full_ai',
      description: 'Meditation guidance should use full AI analysis'
    },
    { 
      query: 'What is the meaning of consciousness and enlightenment?', 
      expectedMethod: 'full_ai',
      description: 'Spiritual inquiry should use full AI analysis'
    }
  ];

  const testSingleQuery = async (query: string): Promise<TestResult> => {
    console.log(`🧪 Testing: "${query}"`);
    const startTime = Date.now();
    
    try {
      const response = await sendMessage(query);
      const endTime = Date.now();
      
      const result: TestResult = {
        query,
        response: response.response,
        type: response.type,
        confidence: response.confidence,
        processingMethod: response.metadata.processingMethod,
        responseTime: endTime - startTime,
        timestamp: new Date().toLocaleTimeString(),
        success: true
      };
      
      console.log(`✅ Response (${result.responseTime}ms):`, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Error testing "${query}":`, error);
      
      return {
        query,
        response: `Error: ${error}`,
        type: 'error',
        confidence: 0,
        processingMethod: 'error',
        responseTime: Date.now() - startTime,
        timestamp: new Date().toLocaleTimeString(),
        success: false
      };
    }
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    setResults([]);
    
    console.log('🚀 Running Smart AI Integration Tests...');
    
    for (const test of testQueries) {
      const result = await testSingleQuery(test.query);
      setResults(prev => [...prev, result]);
      
      // Wait a bit between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunningTests(false);
    console.log('✅ All tests completed!');
  };

  const testCustomQuery = async () => {
    if (!testInput.trim()) return;
    
    const result = await testSingleQuery(testInput);
    setResults(prev => [...prev, result]);
    setTestInput('');
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'intent_only': return 'bg-green-100 text-green-800';
      case 'full_ai': return 'bg-blue-100 text-blue-800';
      case 'hybrid': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 100) return 'text-green-600';
    if (time < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const successfulTests = results.filter(r => r.success).length;
  const fastResponses = results.filter(r => r.responseTime < 200).length;
  const intentOnlyResponses = results.filter(r => r.processingMethod === 'intent_only').length;
  const fullAIResponses = results.filter(r => r.processingMethod === 'full_ai').length;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🧪 Smart AI Integration Test</h1>
        <p className="text-gray-600 mb-6">
          Verify that your Smart AI system correctly routes simple messages to fast intent detection 
          and complex questions to your full AdaptiveWisdomEngine.
        </p>
        
        {/* Test Controls */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunningTests || isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isRunningTests ? 'Running Tests...' : 'Run All Tests'}
          </button>
          
          <button
            onClick={() => setResults([])}
            disabled={isRunningTests || isLoading}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Clear Results
          </button>
        </div>

        {/* Custom Test */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Custom Test</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Enter your test query..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && testCustomQuery()}
              disabled={isRunningTests || isLoading}
            />
            <button
              onClick={testCustomQuery}
              disabled={isRunningTests || isLoading || !testInput.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Test
            </button>
          </div>
        </div>
      </div>

      {/* Test Results Summary */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Test Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{successfulTests}/{results.length}</div>
              <div className="text-sm text-gray-600">Tests Passed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{intentOnlyResponses}</div>
              <div className="text-sm text-green-600">Fast Responses</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{fullAIResponses}</div>
              <div className="text-sm text-blue-600">Deep AI Responses</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length) : 0}ms
              </div>
              <div className="text-sm text-yellow-600">Avg Response Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Expected Test Behavior */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Expected Test Behavior</h3>
        <div className="grid gap-3">
          {testQueries.map((test, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">"{test.query}"</div>
                <div className="text-sm text-gray-600">{test.description}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                test.expectedMethod === 'intent_only' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {test.expectedMethod === 'intent_only' ? '⚡ Fast' : '🧠 Deep'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">📋 Detailed Results</h3>
          {results.map((result, index) => (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900 mb-1">
                    Query: "{result.query}"
                  </div>
                  <div className="text-sm text-gray-500">{result.timestamp}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(result.processingMethod)}`}>
                    {result.processingMethod === 'intent_only' ? '⚡ Intent Only' : 
                     result.processingMethod === 'full_ai' ? '🧠 Full AI' : 
                     result.processingMethod === 'hybrid' ? '🔄 Hybrid' : '❌ Error'}
                  </span>
                  <span className={`text-sm font-medium ${getResponseTimeColor(result.responseTime)}`}>
                    {result.responseTime}ms
                  </span>
                  <span className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                    {result.success ? '✅' : '❌'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-3">
                <div className="text-gray-800">{result.response}</div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <span>Type: <span className="font-medium">{result.type}</span></span>
                <span>Confidence: <span className="font-medium">{Math.round(result.confidence * 100)}%</span></span>
                <span className={`font-medium ${getResponseTimeColor(result.responseTime)}`}>
                  {result.responseTime < 100 ? '🚀 Super Fast' : 
                   result.responseTime < 500 ? '⚡ Fast' : '🐌 Slow'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success Criteria */}
      {results.length >= 3 && (
        <div className={`mt-6 rounded-lg border p-4 ${
          successfulTests >= results.length * 0.8 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <h3 className={`font-medium mb-2 ${
            successfulTests >= results.length * 0.8 ? 'text-green-800' : 'text-yellow-800'
          }`}>
            {successfulTests >= results.length * 0.8 ? '✅ Integration Test Results' : '⚠️ Integration Issues Detected'}
          </h3>
          <div className={`space-y-1 text-sm ${
            successfulTests >= results.length * 0.8 ? 'text-green-700' : 'text-yellow-700'
          }`}>
            <div>• Success Rate: {Math.round((successfulTests / results.length) * 100)}% ({successfulTests}/{results.length})</div>
            <div>• Average Response Time: {Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / results.length)}ms</div>
            <div>• Fast Intent Responses: {intentOnlyResponses}</div>
            <div>• Deep AI Responses: {fullAIResponses}</div>
            {successfulTests >= results.length * 0.8 ? (
              <div className="mt-2 font-medium">🎉 Smart AI integration is working correctly!</div>
            ) : (
              <div className="mt-2 font-medium">⚠️ Check console for errors or verify service files are properly imported.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSmartAI;