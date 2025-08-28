/**
 * Integration Test with Live RomAI Backend
 * Tests the complete API integration with actual backend services
 */

import React, { useState, useEffect } from 'react';
import { romaiApiClient } from '../lib/api/index';
import { romaiService } from '../lib/api/romai';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

export default function LiveApiTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { test: 'RomAI Health Check', status: 'pending' },
    { test: 'HTTP Client Basic Request', status: 'pending' },
    { test: 'Math Problem Solving', status: 'pending' },
    { test: 'API Client Error Handling', status: 'pending' },
  ]);

  const updateTestResult = (index: number, update: Partial<TestResult>) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, ...update } : result
    ));
  };

  useEffect(() => {
    runLiveTests();
  }, []);

  const runLiveTests = async () => {
    // Test 1: RomAI Health Check
    try {
      const startTime = Date.now();
      const health = await romaiService.getHealth();
      updateTestResult(0, {
        status: 'success',
        result: health.data,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      updateTestResult(0, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Health check failed',
      });
    }

    // Test 2: HTTP Client Basic Request
    try {
      const startTime = Date.now();
      const response = await romaiApiClient.get('/health', { requiresAuth: false });
      updateTestResult(1, {
        status: 'success',
        result: { status: response.status, hasData: !!response.data },
        duration: Date.now() - startTime,
      });
    } catch (error) {
      updateTestResult(1, {
        status: 'error',
        error: error instanceof Error ? error.message : 'HTTP request failed',
      });
    }

    // Test 3: Math Problem Solving (may fail if endpoint doesn't exist)
    try {
      const startTime = Date.now();
      const mathResponse = await romaiService.solveMathProblem({
        problem: '2 + 2',
        steps_needed: false,
      });
      updateTestResult(2, {
        status: 'success',
        result: mathResponse.data,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      updateTestResult(2, {
        status: 'error',
        error: error instanceof Error ? error.message : 'Math problem solving failed',
      });
    }

    // Test 4: API Client Error Handling (test with non-existent endpoint)
    try {
      const startTime = Date.now();
      await romaiApiClient.get('/nonexistent-endpoint', { requiresAuth: false });
      updateTestResult(3, {
        status: 'error',
        error: 'Expected error but got success',
      });
    } catch (error) {
      // This should fail, which is expected
      updateTestResult(3, {
        status: 'success',
        result: { errorHandled: true, errorType: error.constructor.name },
        duration: Date.now() - Date.now(),
      });
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const pendingCount = testResults.filter(r => r.status === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg mb-6">
        <h1 className="text-3xl font-bold mb-2">🧪 Live API Integration Test</h1>
        <p className="text-lg opacity-90">
          Testing real connectivity with RomAI AGI backend services
        </p>
      </div>

      {/* Test Results Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded text-center">
          <div className="text-2xl font-bold text-green-600">{successCount}</div>
          <div className="text-green-800">Passed</div>
        </div>
        <div className="bg-red-50 border border-red-200 p-4 rounded text-center">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-red-800">Failed</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-yellow-800">Pending</div>
        </div>
      </div>

      {/* Detailed Test Results */}
      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`border p-4 rounded-lg ${getStatusColor(result.status)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-xl">{getStatusIcon(result.status)}</span>
                {result.test}
              </h3>
              {result.duration && (
                <span className="text-sm opacity-75">
                  {result.duration}ms
                </span>
              )}
            </div>
            
            {result.status === 'success' && result.result && (
              <div className="mt-2 p-3 bg-white bg-opacity-50 rounded text-sm">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}
            
            {result.status === 'error' && result.error && (
              <div className="mt-2">
                <p className="font-medium">Error:</p>
                <p className="text-sm">{result.error}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Test Information:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• <strong>RomAI Health Check:</strong> Verifies backend server is healthy and responding</li>
          <li>• <strong>HTTP Client Basic Request:</strong> Tests the HTTP client with actual network request</li>
          <li>• <strong>Math Problem Solving:</strong> Tests RomAI math endpoint (may fail if not implemented)</li>
          <li>• <strong>API Client Error Handling:</strong> Verifies proper error handling for non-existent endpoints</li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setTestResults(prev => prev.map(r => ({ ...r, status: 'pending' as const, result: undefined, error: undefined, duration: undefined })));
            setTimeout(runLiveTests, 100);
          }}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
        >
          🔄 Re-run Tests
        </button>
      </div>
    </div>
  );
}