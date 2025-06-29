'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface AIMetrics {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  activeProviders: string[];
  topModels: Array<{ name: string; usage: number }>;
}

interface RealtimeMetrics {
  connectedUsers: number;
  activeStreams: number;
  messagesSent: number;
  dataTransferred: string;
}

interface AnalyticsData {
  userEngagement: number;
  featureUsage: Array<{ feature: string; usage: number }>;
  performanceScore: number;
  errorRate: number;
}

export default function AnalyticsDashboard() {
  const [aiMetrics, setAiMetrics] = useState<AIMetrics>({
    totalRequests: 0,
    successRate: 0,
    averageResponseTime: 0,
    activeProviders: [],
    topModels: []
  });

  const [realtimeMetrics, setRealtimeMetrics] = useState<RealtimeMetrics>({
    connectedUsers: 0,
    activeStreams: 0,
    messagesSent: 0,
    dataTransferred: '0 MB'
  });

  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userEngagement: 0,
    featureUsage: [],
    performanceScore: 0,
    errorRate: 0
  });

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // AI Metrics
      setAiMetrics(prev => ({
        totalRequests: prev.totalRequests + Math.floor(Math.random() * 5),
        successRate: 95 + Math.random() * 5,
        averageResponseTime: 800 + Math.random() * 400,
        activeProviders: ['OpenAI', 'Anthropic', 'Azure OpenAI'],
        topModels: [
          { name: 'GPT-4', usage: 65 + Math.random() * 10 },
          { name: 'Claude-3', usage: 25 + Math.random() * 10 },
          { name: 'GPT-3.5', usage: 10 + Math.random() * 5 }
        ]
      }));

      // Real-time Metrics
      setRealtimeMetrics(prev => ({
        connectedUsers: Math.floor(50 + Math.random() * 200),
        activeStreams: Math.floor(10 + Math.random() * 50),
        messagesSent: prev.messagesSent + Math.floor(Math.random() * 20),
        dataTransferred: `${(Math.random() * 100).toFixed(1)} MB`
      }));

      // Analytics
      setAnalytics(prev => ({
        userEngagement: 75 + Math.random() * 20,
        featureUsage: [
          { feature: 'AI Chat', usage: 85 + Math.random() * 10 },
          { feature: 'Code Analysis', usage: 70 + Math.random() * 15 },
          { feature: 'Real-time Collaboration', usage: 60 + Math.random() * 20 },
          { feature: 'Data Visualization', usage: 45 + Math.random() * 25 }
        ],
        performanceScore: 85 + Math.random() * 15,
        errorRate: Math.random() * 2
      }));

      setIsConnected(Math.random() > 0.1); // 90% uptime simulation
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testAIProvider = async (provider: string) => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Hello, this is a test message.',
          provider: provider.toLowerCase()
        })
      });

      const data = await response.json();
      if (response.ok) {
        alert(`✅ ${provider} test successful!\nResponse: ${data.message.substring(0, 100)}...`);
      } else {
        throw new Error(data.error || 'Test failed');
      }
    } catch (error) {
      alert(`❌ ${provider} test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Codai Analytics Dashboard</h1>
            <p className="text-gray-600">Real-time AI performance and system analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? 'default' : 'destructive'}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Badge>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai-metrics">AI Metrics</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Requests</CardTitle>
                <span className="text-2xl">🤖</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiMetrics.totalRequests}</div>
                <p className="text-xs text-muted-foreground">
                  {aiMetrics.successRate.toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Users</CardTitle>
                <span className="text-2xl">👥</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{realtimeMetrics.connectedUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {realtimeMetrics.activeStreams} active streams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                <span className="text-2xl">⚡</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.performanceScore.toFixed(0)}%</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.errorRate.toFixed(2)}% error rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <span className="text-2xl">⏱️</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aiMetrics.averageResponseTime.toFixed(0)}ms</div>
                <p className="text-xs text-muted-foreground">
                  Average AI response time
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Provider Tests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => testAIProvider('openai')}
                    className="flex-1"
                    variant="outline"
                  >
                    Test OpenAI
                  </Button>
                  <Button
                    onClick={() => testAIProvider('anthropic')}
                    className="flex-1"
                    variant="outline"
                  >
                    Test Anthropic
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  Click to test AI provider connectivity and response
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">🧪</span>
                  <a href="/test-ai">AI Chat Interface</a>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">📊</span>
                  View Detailed Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <span className="mr-2">⚙️</span>
                  System Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-metrics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiMetrics.topModels.map((model, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{model.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${model.usage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{model.usage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {aiMetrics.activeProviders.map((provider, index) => (
                    <Badge key={index} variant="default">
                      {provider}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  All AI providers are currently operational
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>WebSocket Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Connection Status</span>
                  <Badge variant={isConnected ? 'default' : 'destructive'}>
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Messages Sent</span>
                  <span className="font-bold">{realtimeMetrics.messagesSent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Data Transferred</span>
                  <span className="font-bold">{realtimeMetrics.dataTransferred}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Connected Users</span>
                  <span className="font-bold text-green-600">{realtimeMetrics.connectedUsers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Streams</span>
                  <span className="font-bold text-blue-600">{realtimeMetrics.activeStreams}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Real-time collaboration features are active
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.featureUsage.map((feature, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{feature.feature}</span>
                    <span className="text-sm text-gray-600">{feature.usage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${feature.usage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
