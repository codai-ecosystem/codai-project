/**
 * A/B Testing Framework for Memorai V3.0
 * Comprehensive experimentation system with feature flags and analytics
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  Zap,
  TestTube,
  BarChart3,
  Settings,
  Users,
  Target,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Flag,
  Globe,
  Percent,
} from 'lucide-react';

interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'archived';
  variants: ABVariant[];
  targeting: TargetingRules;
  metrics: TestMetric[];
  startDate?: Date;
  endDate?: Date;
  confidence: number;
  significance: number;
  participantCount: number;
  conversionRate: Record<string, number>;
  winner?: string;
}

interface ABVariant {
  id: string;
  name: string;
  description: string;
  trafficSplit: number;
  config: Record<string, any>;
  participants: number;
  conversions: number;
  conversionRate: number;
  isControl: boolean;
}

interface TargetingRules {
  userSegments: string[];
  geoLocations: string[];
  deviceTypes: string[];
  newUsersOnly: boolean;
  minimumUsage: number;
  customAttributes: Record<string, any>;
}

interface TestMetric {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'retention' | 'revenue';
  goal: 'increase' | 'decrease';
  currentValue: number;
  targetValue?: number;
  isPrimary: boolean;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targeting: TargetingRules;
  variants: Record<string, any>;
  createdAt: Date;
  lastModified: Date;
}

export const ABTestingFramework: React.FC = () => {
  const [activeTests, setActiveTests] = useState<ABTest[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  // Initialize with sample data
  useEffect(() => {
    const sampleTests: ABTest[] = [
      {
        id: 'test-1',
        name: 'Voice Search UI Enhancement',
        description: 'Testing new voice search interface design',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'Current Design',
            description: 'Existing voice search interface',
            trafficSplit: 50,
            config: { useNewDesign: false },
            participants: 1247,
            conversions: 187,
            conversionRate: 15.0,
            isControl: true,
          },
          {
            id: 'variant-a',
            name: 'Enhanced Design',
            description: 'New voice search with improved UX',
            trafficSplit: 50,
            config: { useNewDesign: true },
            participants: 1203,
            conversions: 241,
            conversionRate: 20.0,
            isControl: false,
          },
        ],
        targeting: {
          userSegments: ['active_users'],
          geoLocations: ['US', 'CA', 'UK'],
          deviceTypes: ['desktop', 'mobile'],
          newUsersOnly: false,
          minimumUsage: 5,
          customAttributes: {},
        },
        metrics: [
          {
            id: 'voice_usage',
            name: 'Voice Search Usage',
            type: 'engagement',
            goal: 'increase',
            currentValue: 17.5,
            targetValue: 25.0,
            isPrimary: true,
          },
          {
            id: 'search_completion',
            name: 'Search Completion Rate',
            type: 'conversion',
            goal: 'increase',
            currentValue: 15.0,
            isPrimary: false,
          },
        ],
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        confidence: 95,
        significance: 0.023,
        participantCount: 2450,
        conversionRate: { control: 15.0, 'variant-a': 20.0 },
        winner: 'variant-a',
      },
      {
        id: 'test-2',
        name: 'Memory Recommendation Algorithm',
        description: 'Testing improved recommendation engine',
        status: 'running',
        variants: [
          {
            id: 'control',
            name: 'Current Algorithm',
            description: 'Existing collaborative filtering',
            trafficSplit: 33,
            config: { algorithm: 'collaborative' },
            participants: 856,
            conversions: 94,
            conversionRate: 11.0,
            isControl: true,
          },
          {
            id: 'variant-a',
            name: 'Content-Based',
            description: 'Content-based filtering algorithm',
            trafficSplit: 33,
            config: { algorithm: 'content_based' },
            participants: 832,
            conversions: 108,
            conversionRate: 13.0,
            isControl: false,
          },
          {
            id: 'variant-b',
            name: 'Hybrid Algorithm',
            description: 'Combined collaborative + content-based',
            trafficSplit: 34,
            config: { algorithm: 'hybrid' },
            participants: 879,
            conversions: 140,
            conversionRate: 15.9,
            isControl: false,
          },
        ],
        targeting: {
          userSegments: ['power_users'],
          geoLocations: [],
          deviceTypes: [],
          newUsersOnly: false,
          minimumUsage: 10,
          customAttributes: {},
        },
        metrics: [
          {
            id: 'click_through',
            name: 'Recommendation Click-Through',
            type: 'engagement',
            goal: 'increase',
            currentValue: 13.3,
            targetValue: 18.0,
            isPrimary: true,
          },
        ],
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        confidence: 90,
        significance: 0.087,
        participantCount: 2567,
        conversionRate: { control: 11.0, 'variant-a': 13.0, 'variant-b': 15.9 },
        winner: 'variant-b',
      },
    ];

    const sampleFlags: FeatureFlag[] = [
      {
        id: 'flag-1',
        name: 'advanced_analytics',
        description: 'Enable advanced analytics dashboard',
        enabled: true,
        rolloutPercentage: 75,
        targeting: {
          userSegments: ['beta_users', 'premium_users'],
          geoLocations: [],
          deviceTypes: [],
          newUsersOnly: false,
          minimumUsage: 0,
          customAttributes: {},
        },
        variants: { enabled: true },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'flag-2',
        name: 'voice_search_v3',
        description: 'New voice search interface',
        enabled: true,
        rolloutPercentage: 50,
        targeting: {
          userSegments: ['active_users'],
          geoLocations: ['US', 'CA'],
          deviceTypes: [],
          newUsersOnly: false,
          minimumUsage: 5,
          customAttributes: {},
        },
        variants: { version: '3.0' },
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    setActiveTests(sampleTests);
    setFeatureFlags(sampleFlags);
  }, []);

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    const totalTests = activeTests.length;
    const runningTests = activeTests.filter(t => t.status === 'running').length;
    const completedTests = activeTests.filter(t => t.status === 'completed').length;
    const totalParticipants = activeTests.reduce((sum, test) => sum + test.participantCount, 0);
    const avgConfidence = activeTests.length > 0
      ? activeTests.reduce((sum, test) => sum + test.confidence, 0) / activeTests.length
      : 0;

    const winningTests = activeTests.filter(t => t.winner && t.status === 'completed').length;
    const successRate = completedTests > 0 ? (winningTests / completedTests) * 100 : 0;

    return {
      totalTests,
      runningTests,
      completedTests,
      totalParticipants,
      avgConfidence,
      successRate,
    };
  }, [activeTests]);

  const getStatusIcon = (status: ABTest['status']) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-green-600" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'archived':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: ABTest['status']) => {
    const variants = {
      running: 'default',
      paused: 'secondary',
      completed: 'outline',
      archived: 'destructive',
      draft: 'secondary',
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const getSignificanceLevel = (significance: number) => {
    if (significance < 0.05) return { level: 'High', color: 'text-green-600' };
    if (significance < 0.1) return { level: 'Medium', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const calculateLift = (control: number, variant: number) => {
    if (control === 0) return 0;
    return ((variant - control) / control) * 100;
  };

  const handleTestAction = (testId: string, action: 'start' | 'pause' | 'stop' | 'archive') => {
    setActiveTests(prev => prev.map(test => {
      if (test.id !== testId) return test;

      switch (action) {
        case 'start':
          return { ...test, status: 'running' as const, startDate: new Date() };
        case 'pause':
          return { ...test, status: 'paused' as const };
        case 'stop':
          return { ...test, status: 'completed' as const, endDate: new Date() };
        case 'archive':
          return { ...test, status: 'archived' as const };
        default:
          return test;
      }
    }));
  };

  const toggleFeatureFlag = (flagId: string) => {
    setFeatureFlags(prev => prev.map(flag => {
      if (flag.id !== flagId) return flag;
      return { ...flag, enabled: !flag.enabled, lastModified: new Date() };
    }));
  };

  const exportTestResults = (test: ABTest) => {
    const exportData = {
      test: {
        name: test.name,
        description: test.description,
        startDate: test.startDate,
        endDate: test.endDate,
        confidence: test.confidence,
        significance: test.significance,
        winner: test.winner,
      },
      variants: test.variants.map(variant => ({
        name: variant.name,
        participants: variant.participants,
        conversions: variant.conversions,
        conversionRate: variant.conversionRate,
        lift: variant.isControl ? 0 : calculateLift(
          test.variants.find(v => v.isControl)?.conversionRate || 0,
          variant.conversionRate
        ),
      })),
      metrics: test.metrics,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ab-test-${test.id}-results.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
            <TestTube className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              A/B Testing Framework
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Feature flags and experimentation with advanced analytics
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateTest(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>

          <Button variant="outline" size="sm">
            <Flag className="h-4 w-4 mr-2" />
            Feature Flags
          </Button>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallStats.totalTests}
                </p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Running</p>
                <p className="text-2xl font-bold text-green-600">
                  {overallStats.runningTests}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overallStats.completedTests}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Participants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallStats.totalParticipants.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Confidence</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallStats.avgConfidence.toFixed(0)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {overallStats.successRate.toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tests */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Active Tests
                </div>
                <Badge variant="secondary">{activeTests.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeTests.map((test) => (
                  <div
                    key={test.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(test.status)}
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {test.name}
                          </h3>
                          {getStatusBadge(test.status)}
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {test.description}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Participants:</span>
                            <p className="font-medium">{test.participantCount.toLocaleString()}</p>
                          </div>

                          <div>
                            <span className="text-gray-500">Confidence:</span>
                            <p className="font-medium">{test.confidence}%</p>
                          </div>

                          <div>
                            <span className="text-gray-500">Significance:</span>
                            <p className={`font-medium ${getSignificanceLevel(test.significance).color}`}>
                              {getSignificanceLevel(test.significance).level}
                            </p>
                          </div>

                          <div>
                            <span className="text-gray-500">Winner:</span>
                            <p className="font-medium">
                              {test.winner ? test.variants.find(v => v.id === test.winner)?.name || 'TBD' : 'TBD'}
                            </p>
                          </div>
                        </div>

                        {/* Variant Performance */}
                        <div className="mt-4">
                          <div className="flex space-x-4">
                            {test.variants.map((variant) => {
                              const controlRate = test.variants.find(v => v.isControl)?.conversionRate || 0;
                              const lift = variant.isControl ? 0 : calculateLift(controlRate, variant.conversionRate);

                              return (
                                <div key={variant.id} className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                      {variant.name}
                                      {variant.isControl && <Badge variant="outline" className="ml-1 text-xs">Control</Badge>}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {variant.conversionRate.toFixed(1)}%
                                    </span>
                                  </div>

                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${variant.isControl ? 'bg-gray-500' :
                                          lift > 0 ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                      style={{ width: `${(variant.conversionRate / 25) * 100}%` }}
                                    />
                                  </div>

                                  {!variant.isControl && (
                                    <div className="flex items-center space-x-1">
                                      {lift > 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-600" />
                                      ) : (
                                        <TrendingDown className="h-3 w-3 text-red-600" />
                                      )}
                                      <span className={`text-xs font-medium ${lift > 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {lift > 0 ? '+' : ''}{lift.toFixed(1)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {test.status === 'running' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestAction(test.id, 'pause');
                            }}
                          >
                            <Pause className="h-3 w-3" />
                          </Button>
                        )}

                        {test.status === 'paused' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestAction(test.id, 'start');
                            }}
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            exportTestResults(test);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Flags */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Flag className="h-5 w-5 mr-2" />
                  Feature Flags
                </div>
                <Badge variant="secondary">{featureFlags.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {flag.name}
                        </span>
                        <Badge variant={flag.enabled ? 'default' : 'secondary'}>
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFeatureFlag(flag.id)}
                      >
                        {flag.enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      </Button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {flag.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Percent className="h-3 w-3" />
                        <span>{flag.rolloutPercentage}% rollout</span>
                      </div>

                      <span>
                        Modified {flag.lastModified.toLocaleDateString()}
                      </span>
                    </div>

                    {flag.enabled && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${flag.rolloutPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Creation Panel */}
          {showCreateTest && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Test
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateTest(false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Test Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter test name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your test hypothesis"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Traffic Split
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        placeholder="Control %"
                        min="0"
                        max="100"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        placeholder="Variant %"
                        min="0"
                        max="100"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Create Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowCreateTest(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Test Details Modal */}
      {selectedTest && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                {selectedTest.name} - Detailed Results
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTest(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Variant Performance
                </h3>

                <div className="space-y-4">
                  {selectedTest.variants.map((variant) => {
                    const controlRate = selectedTest.variants.find(v => v.isControl)?.conversionRate || 0;
                    const lift = variant.isControl ? 0 : calculateLift(controlRate, variant.conversionRate);

                    return (
                      <div key={variant.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{variant.name}</span>
                            {variant.isControl && (
                              <Badge variant="outline" className="text-xs">Control</Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {variant.trafficSplit}% traffic
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Participants:</span>
                            <p className="font-medium">{variant.participants.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Conversions:</span>
                            <p className="font-medium">{variant.conversions.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Conversion Rate:</span>
                            <p className="font-medium">{variant.conversionRate.toFixed(2)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Lift:</span>
                            <p className={`font-medium ${lift > 0 ? 'text-green-600' : lift < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                              {lift > 0 ? '+' : ''}{lift.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Test Configuration
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500">Start Date:</span>
                      <p className="font-medium">
                        {selectedTest.startDate?.toLocaleDateString() || 'Not started'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">End Date:</span>
                      <p className="font-medium">
                        {selectedTest.endDate?.toLocaleDateString() || 'Ongoing'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Confidence Level:</span>
                      <p className="font-medium">{selectedTest.confidence}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Statistical Significance:</span>
                      <p className={`font-medium ${getSignificanceLevel(selectedTest.significance).color}`}>
                        p = {selectedTest.significance.toFixed(3)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">Target Segments:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTest.targeting.userSegments.map((segment, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {segment}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500">Primary Metrics:</span>
                    <div className="mt-1 space-y-1">
                      {selectedTest.metrics.filter(m => m.isPrimary).map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-900 dark:text-white">{metric.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {metric.currentValue.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ABTestingFramework;
