'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

interface IntegrationTest {
  status: string;
  [key: string]: any;
}

interface TestResults {
  codai_integration_test: {
    version: string;
    phase: string;
    status: string;
  };
  tests: {
    [key: string]: IntegrationTest;
  };
  summary: {
    total_tests: number;
    passed: number;
    failed: number;
    skipped: number;
    success_rate: string;
    overall_status: string;
  };
  next_steps: string[];
  documentation: {
    [key: string]: any;
  };
}

export default function ProjectStatusPage() {
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTestResults = async () => {
    try {
      const response = await fetch('/api/integration-test');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Failed to fetch test results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestResults();
  }, []);

  const achievements = [
    {
      title: 'Workspace Architecture',
      items: [
        'Turborepo monorepo configured with proper workspace linking',
        '@codai/core package successfully integrated across apps',
        'TypeScript declarations and exports working correctly',
        'All dependency conflicts resolved'
      ]
    },
    {
      title: 'Real AI Integration',
      items: [
        'OpenAI GPT-4/3.5 integration with chat completions API',
        'Anthropic Claude integration with messaging API',
        'Graceful handling of missing API keys',
        'Provider switching and model selection'
      ]
    },
    {
      title: 'Advanced UI Components',
      items: [
        'Interactive AI chat interface with real-time responses',
        'Analytics dashboard with live metrics simulation',
        'WebSocket test interface for real-time communication',
        'Modern React components with Tailwind CSS'
      ]
    },
    {
      title: 'API Infrastructure',
      items: [
        'RESTful AI chat endpoint with error handling',
        'WebSocket status and messaging API',
        'Comprehensive integration testing endpoint',
        'Proper HTTP status codes and responses'
      ]
    },
    {
      title: 'Developer Experience',
      items: [
        'Hot reloading development server',
        'Comprehensive error messages and debugging',
        'Type-safe APIs with TypeScript',
        'Modular architecture for easy scaling'
      ]
    }
  ];

  const features = [
    {
      name: 'AI Chat Interface',
      path: '/test-ai',
      description: 'Test OpenAI and Anthropic integrations with real-time chat',
      status: 'active'
    },
    {
      name: 'Analytics Dashboard',
      path: '/analytics',
      description: 'Real-time metrics and performance monitoring',
      status: 'active'
    },
    {
      name: 'Real-time Features',
      path: '/realtime',
      description: 'WebSocket testing and real-time communication',
      status: 'active'
    },
    {
      name: 'Classic Dashboard',
      path: '/',
      description: 'Traditional system overview and service status',
      status: 'active'
    },
    {
      name: 'Enhanced Dashboard',
      path: '/enhanced',
      description: 'AI-powered insights and advanced analytics',
      status: 'active'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">✅ Pass</Badge>;
      case 'fail':
        return <Badge variant="destructive">❌ Fail</Badge>;
      case 'skipped':
        return <Badge variant="secondary">⏸️ Skipped</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Codai Project Status
            </h1>
            <p className="text-xl text-gray-600">Phase 2: Real AI Integration - Complete! 🎉</p>
          </div>
          <div className="text-right">
            <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
              🚀 Phase 2 Complete
            </Badge>
            <p className="text-sm text-gray-500 mt-1">Ready for Phase 3</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🏗️</span>
              Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">Monorepo</div>
            <p className="text-gray-600">Turborepo with proper workspace linking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-2">2 Providers</div>
            <p className="text-gray-600">OpenAI & Anthropic fully integrated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Real-time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">WebSocket</div>
            <p className="text-gray-600">Real-time communication ready</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Test Results */}
      {testResults && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              System Integration Tests
              <Button onClick={fetchTestResults} variant="outline" size="sm">
                Refresh Tests
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{testResults.summary.skipped}</div>
                <div className="text-sm text-gray-600">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.summary.success_rate}</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(testResults.tests).map(([testName, test]) => (
                <div key={testName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium capitalize">{testName.replace(/_/g, ' ')}</span>
                    {test.error && (
                      <p className="text-sm text-red-600 mt-1">{test.error}</p>
                    )}
                    {test.reason && (
                      <p className="text-sm text-gray-600 mt-1">{test.reason}</p>
                    )}
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-semibold">{feature.name}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                  <Button asChild variant="outline" size="sm">
                    <a href={feature.path}>View</a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Phase 2 Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {achievements.map((category, index) => (
              <div key={index}>
                <h3 className="font-semibold text-lg mb-3 text-blue-600">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="text-green-500 text-sm">✅</span>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {testResults && (
        <Card>
          <CardHeader>
            <CardTitle>Next Steps - Phase 3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testResults.next_steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
                  <span className="text-blue-500 font-bold text-sm">{index + 1}.</span>
                  <span className="text-sm">{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
