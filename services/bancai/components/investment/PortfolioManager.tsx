'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../ui';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  PieChart,
} from 'lucide-react';

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalReturn: number;
  totalReturnPercent: number;
  riskScore: number;
  diversificationScore: number;
  holdings: Holding[];
}

interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  allocationPercent: number;
  sector: string;
  assetType: 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity';
}

interface AIRecommendation {
  id: string;
  type: 'buy' | 'sell' | 'hold' | 'rebalance';
  symbol: string;
  confidence: number;
  reasoning: string;
  expectedReturn: number;
  riskLevel: 'low' | 'medium' | 'high';
  timeframe: string;
}

export const PortfolioManager: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<
    'overview' | 'holdings' | 'ai-insights' | 'analytics'
  >('overview');

  useEffect(() => {
    // Mock data - in production, this would fetch from your investment API
    const mockPortfolio: Portfolio = {
      id: 'portfolio-1',
      name: 'AI-Optimized Growth Portfolio',
      totalValue: 125840.5,
      dayChange: 2341.25,
      dayChangePercent: 1.89,
      totalReturn: 25840.5,
      totalReturnPercent: 25.84,
      riskScore: 7.2,
      diversificationScore: 8.5,
      holdings: [
        {
          id: 'hold-1',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          shares: 50,
          currentPrice: 185.42,
          totalValue: 9271.0,
          dayChange: 123.5,
          dayChangePercent: 1.35,
          allocationPercent: 7.36,
          sector: 'Technology',
          assetType: 'stock',
        },
        {
          id: 'hold-2',
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          shares: 25,
          currentPrice: 485.2,
          totalValue: 12130.0,
          dayChange: 582.75,
          dayChangePercent: 5.05,
          allocationPercent: 9.64,
          sector: 'Technology',
          assetType: 'stock',
        },
        {
          id: 'hold-3',
          symbol: 'VTI',
          name: 'Vanguard Total Stock Market ETF',
          shares: 200,
          currentPrice: 245.8,
          totalValue: 49160.0,
          dayChange: 492.0,
          dayChangePercent: 1.01,
          allocationPercent: 39.06,
          sector: 'Diversified',
          assetType: 'etf',
        },
        {
          id: 'hold-4',
          symbol: 'BTC',
          name: 'Bitcoin',
          shares: 0.5,
          currentPrice: 67890.0,
          totalValue: 33945.0,
          dayChange: 1698.25,
          dayChangePercent: 5.26,
          allocationPercent: 26.98,
          sector: 'Cryptocurrency',
          assetType: 'crypto',
        },
      ],
    };

    const mockRecommendations: AIRecommendation[] = [
      {
        id: 'rec-1',
        type: 'buy',
        symbol: 'MSFT',
        confidence: 0.85,
        reasoning:
          'Strong AI fundamentals and cloud growth potential. Undervalued relative to earnings growth.',
        expectedReturn: 12.5,
        riskLevel: 'medium',
        timeframe: '6-12 months',
      },
      {
        id: 'rec-2',
        type: 'rebalance',
        symbol: 'BTC',
        confidence: 0.72,
        reasoning:
          'Crypto allocation exceeds target range. Consider taking profits and rebalancing into bonds.',
        expectedReturn: 8.2,
        riskLevel: 'high',
        timeframe: '1-3 months',
      },
      {
        id: 'rec-3',
        type: 'hold',
        symbol: 'VTI',
        confidence: 0.91,
        reasoning:
          'Strong long-term diversification anchor. Maintain position for continued market exposure.',
        expectedReturn: 7.8,
        riskLevel: 'low',
        timeframe: '12+ months',
      },
    ];

    // Simulate API call
    setTimeout(() => {
      setPortfolio(mockPortfolio);
      setRecommendations(mockRecommendations);
      setLoading(false);
    }, 1000);
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

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'success';
      case 'sell':
        return 'error';
      case 'hold':
        return 'default';
      case 'rebalance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
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

  if (!portfolio) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Unable to load portfolio data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>{portfolio.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold">
                {formatCurrency(portfolio.totalValue)}
              </p>
              <p className={`text-sm ${getChangeColor(portfolio.dayChange)}`}>
                {formatCurrency(portfolio.dayChange)} (
                {formatPercent(portfolio.dayChangePercent)}) today
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Total Return</p>
              <p className="text-xl font-semibold">
                {formatCurrency(portfolio.totalReturn)}
              </p>
              <p className={`text-sm ${getChangeColor(portfolio.totalReturn)}`}>
                {formatPercent(portfolio.totalReturnPercent)} all time
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Risk Score</p>
              <p className="text-xl font-semibold">{portfolio.riskScore}/10</p>
              <Badge
                variant={
                  portfolio.riskScore <= 3
                    ? 'success'
                    : portfolio.riskScore <= 7
                      ? 'warning'
                      : 'error'
                }
              >
                {portfolio.riskScore <= 3
                  ? 'Conservative'
                  : portfolio.riskScore <= 7
                    ? 'Moderate'
                    : 'Aggressive'}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-500">Diversification</p>
              <p className="text-xl font-semibold">
                {portfolio.diversificationScore}/10
              </p>
              <Badge
                variant={
                  portfolio.diversificationScore >= 8
                    ? 'success'
                    : portfolio.diversificationScore >= 6
                      ? 'warning'
                      : 'error'
                }
              >
                {portfolio.diversificationScore >= 8
                  ? 'Excellent'
                  : portfolio.diversificationScore >= 6
                    ? 'Good'
                    : 'Needs Work'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'holdings', label: 'Holdings', icon: BarChart3 },
            { id: 'ai-insights', label: 'AI Insights', icon: TrendingUp },
            { id: 'analytics', label: 'Analytics', icon: DollarSign },
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

      {/* Tab Content */}
      {selectedTab === 'holdings' && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Holdings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolio.holdings.map(holding => (
                <div
                  key={holding.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold">{holding.symbol}</p>
                      <p className="text-sm text-gray-500">{holding.name}</p>
                      <Badge variant="default" className="mt-1 text-xs">
                        {holding.sector}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <p className="font-semibold">
                      {formatCurrency(holding.totalValue)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {holding.shares} shares @{' '}
                      {formatCurrency(holding.currentPrice)}
                    </p>
                    <p
                      className={`text-sm ${getChangeColor(holding.dayChange)}`}
                    >
                      {formatCurrency(holding.dayChange)} (
                      {formatPercent(holding.dayChangePercent)})
                    </p>
                    <p className="text-xs text-gray-400">
                      {holding.allocationPercent.toFixed(2)}% allocation
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'ai-insights' && (
        <Card>
          <CardHeader>
            <CardTitle>AI-Powered Investment Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map(rec => (
                <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant={getRecommendationColor(rec.type)}>
                        {rec.type.toUpperCase()}
                      </Badge>
                      <span className="font-semibold">{rec.symbol}</span>
                      <Badge
                        variant={getRiskColor(rec.riskLevel)}
                        className="text-xs"
                      >
                        {rec.riskLevel} risk
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Confidence: {(rec.confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-sm text-green-600">
                        Expected: +{rec.expectedReturn}%
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">{rec.reasoning}</p>

                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Timeframe: {rec.timeframe}
                    </p>
                    <Button size="sm" variant="outline">
                      Apply Recommendation
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.holdings.map(holding => (
                  <div
                    key={holding.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{holding.symbol}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {holding.allocationPercent.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Sharpe Ratio</span>
                  <span className="text-sm font-medium">1.42</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Max Drawdown</span>
                  <span className="text-sm font-medium text-red-600">
                    -8.3%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Beta</span>
                  <span className="text-sm font-medium">1.12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Volatility</span>
                  <span className="text-sm font-medium">14.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Information Ratio
                  </span>
                  <span className="text-sm font-medium">0.85</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;
