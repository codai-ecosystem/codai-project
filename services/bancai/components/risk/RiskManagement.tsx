'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../ui';
import {
  Shield,
  AlertTriangle,
  TrendingDown,
  BarChart3,
  Target,
  Activity,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface RiskMetrics {
  portfolioValue: number;
  totalRisk: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  valueAtRisk: {
    oneDay: number;
    oneWeek: number;
    oneMonth: number;
  };
  beta: number;
  sharpeRatio: number;
  maxDrawdown: number;
  volatility: number;
  diversificationScore: number;
}

interface RiskAlert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendation: string;
  timestamp: string;
  acknowledged: boolean;
}

interface StressTestScenario {
  id: string;
  name: string;
  description: string;
  marketDropPercent: number;
  portfolioImpact: number;
  impactPercent: number;
  probability: number;
  timeframe: string;
}

interface HedgingStrategy {
  id: string;
  name: string;
  type: 'options' | 'futures' | 'etf' | 'bonds';
  description: string;
  cost: number;
  effectiveness: number;
  protectionLevel: number;
  recommendation: 'strong' | 'moderate' | 'weak';
}

export const RiskManagement: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [stressTests, setStressTests] = useState<StressTestScenario[]>([]);
  const [hedgingStrategies, setHedgingStrategies] = useState<HedgingStrategy[]>(
    []
  );
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'alerts' | 'stress-test' | 'hedging'
  >('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock risk management data
    const mockRiskMetrics: RiskMetrics = {
      portfolioValue: 125840.5,
      totalRisk: 18750.25,
      riskScore: 7.2,
      riskLevel: 'medium',
      valueAtRisk: {
        oneDay: 2516.81,
        oneWeek: 6289.23,
        oneMonth: 12584.05,
      },
      beta: 1.12,
      sharpeRatio: 1.42,
      maxDrawdown: -8.3,
      volatility: 14.8,
      diversificationScore: 8.5,
    };

    const mockAlerts: RiskAlert[] = [
      {
        id: 'alert-1',
        type: 'warning',
        severity: 'medium',
        title: 'Concentration Risk Detected',
        description:
          'Your portfolio has 35% allocation in technology sector, exceeding recommended maximum of 30%.',
        recommendation:
          'Consider rebalancing to reduce sector concentration by selling some tech positions.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'alert-2',
        type: 'danger',
        severity: 'high',
        title: 'VaR Threshold Exceeded',
        description:
          'Daily Value at Risk has exceeded your set threshold of $2,000.',
        recommendation:
          'Review position sizes and consider hedging strategies to reduce risk exposure.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        acknowledged: false,
      },
      {
        id: 'alert-3',
        type: 'info',
        severity: 'low',
        title: 'Rebalancing Opportunity',
        description:
          'Your portfolio has drifted from target allocation. Consider rebalancing.',
        recommendation:
          'Schedule automatic rebalancing or manually adjust positions to target weights.',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        acknowledged: true,
      },
    ];

    const mockStressTests: StressTestScenario[] = [
      {
        id: 'stress-1',
        name: '2008 Financial Crisis',
        description: 'Severe market downturn similar to 2008 financial crisis',
        marketDropPercent: -37,
        portfolioImpact: -41500.0,
        impactPercent: -33.0,
        probability: 0.15,
        timeframe: '6-12 months',
      },
      {
        id: 'stress-2',
        name: 'COVID-19 March 2020',
        description: 'Rapid market crash due to pandemic-related uncertainty',
        marketDropPercent: -34,
        portfolioImpact: -35200.0,
        impactPercent: -28.0,
        probability: 0.2,
        timeframe: '1-3 months',
      },
      {
        id: 'stress-3',
        name: 'Tech Bubble Burst',
        description: 'Technology sector crash affecting growth stocks',
        marketDropPercent: -45,
        portfolioImpact: -48900.0,
        impactPercent: -38.9,
        probability: 0.12,
        timeframe: '12-18 months',
      },
      {
        id: 'stress-4',
        name: 'Interest Rate Shock',
        description:
          'Rapid interest rate increases affecting all asset classes',
        marketDropPercent: -25,
        portfolioImpact: -28750.0,
        impactPercent: -22.8,
        probability: 0.25,
        timeframe: '3-6 months',
      },
    ];

    const mockHedgingStrategies: HedgingStrategy[] = [
      {
        id: 'hedge-1',
        name: 'Protective Put Options',
        type: 'options',
        description: 'Buy put options on major holdings to limit downside risk',
        cost: 1250.0,
        effectiveness: 0.85,
        protectionLevel: 90,
        recommendation: 'strong',
      },
      {
        id: 'hedge-2',
        name: 'VIX ETF Hedge',
        type: 'etf',
        description: 'Allocate 5% to volatility ETF as portfolio insurance',
        cost: 6292.0,
        effectiveness: 0.72,
        protectionLevel: 75,
        recommendation: 'moderate',
      },
      {
        id: 'hedge-3',
        name: 'Treasury Bond Ladder',
        type: 'bonds',
        description: 'Increase allocation to government bonds for stability',
        cost: 12584.0,
        effectiveness: 0.65,
        protectionLevel: 65,
        recommendation: 'moderate',
      },
      {
        id: 'hedge-4',
        name: 'Index Futures Short',
        type: 'futures',
        description: 'Short S&P 500 futures to hedge equity exposure',
        cost: 2516.0,
        effectiveness: 0.9,
        protectionLevel: 95,
        recommendation: 'strong',
      },
    ];

    setRiskMetrics(mockRiskMetrics);
    setAlerts(mockAlerts);
    setStressTests(mockStressTests);
    setHedgingStrategies(mockHedgingStrategies);
    setLoading(false);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getAlertTypeColor = (type: string, severity: string) => {
    if (severity === 'critical') return 'error';
    switch (type) {
      case 'warning':
        return 'warning';
      case 'danger':
        return 'error';
      case 'info':
        return 'default';
      default:
        return 'default';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong':
        return 'success';
      case 'moderate':
        return 'warning';
      case 'weak':
        return 'default';
      default:
        return 'default';
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!riskMetrics) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Unable to load risk management data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Risk Management Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Portfolio Value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(riskMetrics.portfolioValue)}
              </p>
              <Badge variant={getRiskLevelColor(riskMetrics.riskLevel)}>
                {riskMetrics.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Risk Score</p>
              <p className="text-xl font-semibold">
                {riskMetrics.riskScore}/10
              </p>
              <p className="text-sm text-gray-500">
                Total Risk: {formatCurrency(riskMetrics.totalRisk)}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Daily VaR (95%)</p>
              <p className="text-xl font-semibold text-red-600">
                {formatCurrency(riskMetrics.valueAtRisk.oneDay)}
              </p>
              <p className="text-sm text-gray-500">
                {(
                  (riskMetrics.valueAtRisk.oneDay /
                    riskMetrics.portfolioValue) *
                  100
                ).toFixed(2)}
                % of portfolio
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Diversification</p>
              <p className="text-xl font-semibold">
                {riskMetrics.diversificationScore}/10
              </p>
              <Badge
                variant={
                  riskMetrics.diversificationScore >= 8
                    ? 'success'
                    : riskMetrics.diversificationScore >= 6
                      ? 'warning'
                      : 'error'
                }
              >
                {riskMetrics.diversificationScore >= 8
                  ? 'Excellent'
                  : riskMetrics.diversificationScore >= 6
                    ? 'Good'
                    : 'Poor'}
              </Badge>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-500">Beta</p>
              <p className="font-semibold">{riskMetrics.beta}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Sharpe Ratio</p>
              <p className="font-semibold">{riskMetrics.sharpeRatio}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Max Drawdown</p>
              <p className="font-semibold text-red-600">
                {formatPercent(riskMetrics.maxDrawdown)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">Volatility</p>
              <p className="font-semibold">{riskMetrics.volatility}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'alerts', label: 'Risk Alerts', icon: AlertTriangle },
            { id: 'stress-test', label: 'Stress Testing', icon: TrendingDown },
            { id: 'hedging', label: 'Hedging Strategies', icon: Shield },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setSelectedTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${selectedTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Value at Risk Overview */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Value at Risk (VaR)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">1 Day VaR (95%)</span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(riskMetrics.valueAtRisk.oneDay)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    1 Week VaR (95%)
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(riskMetrics.valueAtRisk.oneWeek)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    1 Month VaR (95%)
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(riskMetrics.valueAtRisk.oneMonth)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Metrics Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Portfolio Beta</span>
                  <span className="font-semibold">{riskMetrics.beta}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Sharpe Ratio</span>
                  <span className="font-semibold">
                    {riskMetrics.sharpeRatio}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Annual Volatility
                  </span>
                  <span className="font-semibold">
                    {riskMetrics.volatility}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Maximum Drawdown
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatPercent(riskMetrics.maxDrawdown)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Risk Alerts */}
      {selectedTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Alerts & Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map(alert => (
                <div
                  key={alert.id}
                  className={`p-4 border rounded-lg ${alert.acknowledged ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle
                        className={`h-5 w-5 mt-0.5 ${alert.type === 'danger'
                            ? 'text-red-500'
                            : alert.type === 'warning'
                              ? 'text-yellow-500'
                              : 'text-blue-500'
                          }`}
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold">{alert.title}</h4>
                          <Badge
                            variant={getAlertTypeColor(
                              alert.type,
                              alert.severity
                            )}
                          >
                            {alert.severity.toUpperCase()}
                          </Badge>
                          {alert.acknowledged && (
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Acknowledged
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {alert.description}
                        </p>
                        <p className="text-sm font-medium text-blue-600">
                          {alert.recommendation}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stress Testing */}
      {selectedTab === 'stress-test' && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Stress Testing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stressTests.map(scenario => (
                <div
                  key={scenario.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{scenario.name}</h4>
                    <Badge variant="default">
                      {(scenario.probability * 100).toFixed(0)}% probability
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    {scenario.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Market Drop</p>
                      <p className="font-semibold text-red-600">
                        {formatPercent(scenario.marketDropPercent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Portfolio Impact</p>
                      <p className="font-semibold text-red-600">
                        {formatCurrency(scenario.portfolioImpact)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Impact %</p>
                      <p className="font-semibold text-red-600">
                        {formatPercent(scenario.impactPercent)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Timeframe</p>
                      <p className="font-semibold">{scenario.timeframe}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hedging Strategies */}
      {selectedTab === 'hedging' && (
        <Card>
          <CardHeader>
            <CardTitle>Recommended Hedging Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {hedgingStrategies.map(strategy => (
                <div
                  key={strategy.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <h4 className="font-semibold">{strategy.name}</h4>
                      <Badge
                        variant={getRecommendationColor(
                          strategy.recommendation
                        )}
                      >
                        {strategy.recommendation.toUpperCase()}
                      </Badge>
                    </div>
                    <Badge variant="default">
                      {strategy.type.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-600">
                    {strategy.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Cost</p>
                      <p className="font-semibold">
                        {formatCurrency(strategy.cost)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Effectiveness</p>
                      <p className="font-semibold">
                        {(strategy.effectiveness * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Protection Level</p>
                      <p className="font-semibold">
                        {strategy.protectionLevel}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Cost/Benefit</p>
                      <p className="font-semibold">
                        {(
                          (strategy.effectiveness * strategy.protectionLevel) /
                          (strategy.cost / 1000)
                        ).toFixed(1)}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button size="sm" variant="outline">
                      Implement Strategy
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RiskManagement;
