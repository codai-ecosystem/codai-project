'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calculator,
  Target,
  Shield,
  Zap,
  AlertTriangle,
  Filter,
  Layers,
} from 'lucide-react';

interface OptionContract {
  strike: number;
  bid: number;
  ask: number;
  last: number;
  volume: number;
  openInterest: number;
  impliedVolatility: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  inTheMoney: boolean;
}

interface OptionsChain {
  symbol: string;
  expirationDate: string;
  calls: OptionContract[];
  puts: OptionContract[];
}

interface OptionStrategy {
  id: string;
  name: string;
  symbol: string;
  description: string;
  strategy: 'income' | 'growth' | 'neutral' | 'hedge';
  riskLevel: 'low' | 'medium' | 'high';
  maxProfit: number;
  maxLoss: number;
  breakeven: number | number[];
  probability: number;
  timeDecay: 'positive' | 'negative' | 'neutral';
  legs: any[];
  netDebit?: number;
  netCredit?: number;
  aiRating: number;
  recommendation: string;
}

interface VolatilityData {
  symbol: string;
  impliedVolatility: {
    current: number;
    rank: number;
    change: number;
    history: { date: string; iv: number }[];
  };
  historicalVolatility: {
    '30day': number;
    '60day': number;
    '90day': number;
    annualized: number;
  };
  volatilitySkew: { strike: number; iv: number }[];
}

export default function OptionsTrading() {
  const [activeTab, setActiveTab] = useState('chain');
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [selectedExpiration, setSelectedExpiration] = useState('2024-03-15');
  const [optionsChain, setOptionsChain] = useState<OptionsChain | null>(null);
  const [strategies, setStrategies] = useState<OptionStrategy[]>([]);
  const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(
    null
  );
  const [expirations, setExpirations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Strategy builder state
  const [strategyLegs, setStrategyLegs] = useState<any[]>([]);
  const [strategyAnalysis, setStrategyAnalysis] = useState<any>(null);

  useEffect(() => {
    loadExpirations();
    loadOptionsChain();
    loadStrategies();
    loadVolatilityData();
  }, [selectedSymbol, selectedExpiration]);

  const loadExpirations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/options?type=expirations&symbol=${selectedSymbol}&userId=demo-user`
      );
      const result = await response.json();

      if (result.success) {
        setExpirations(result.data);
      }
    } catch (err) {
      setError('Failed to load expiration dates');
    } finally {
      setLoading(false);
    }
  };

  const loadOptionsChain = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/options?type=chain&symbol=${selectedSymbol}&expiration=${selectedExpiration}&userId=demo-user`
      );
      const result = await response.json();

      if (result.success && result.data.length > 0) {
        setOptionsChain(result.data[0]);
      }
    } catch (err) {
      setError('Failed to load options chain');
    } finally {
      setLoading(false);
    }
  };

  const loadStrategies = async () => {
    try {
      const response = await fetch(
        `/api/options?type=strategies&symbol=${selectedSymbol}&userId=demo-user`
      );
      const result = await response.json();

      if (result.success) {
        setStrategies(result.data);
      }
    } catch (err) {
      setError('Failed to load strategies');
    }
  };

  const loadVolatilityData = async () => {
    try {
      const response = await fetch(
        `/api/options?type=volatility&symbol=${selectedSymbol}&userId=demo-user`
      );
      const result = await response.json();

      if (result.success) {
        setVolatilityData(result.data);
      }
    } catch (err) {
      setError('Failed to load volatility data');
    }
  };

  const analyzeStrategy = async (legs: any[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'analyze-strategy',
          data: { legs, marketPrice: 190 },
        }),
      });

      const result = await response.json();
      if (result.success) {
        setStrategyAnalysis(result.data);
      }
    } catch (err) {
      setError('Failed to analyze strategy');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  const getStrategyBadgeColor = (strategy: string) => {
    switch (strategy) {
      case 'income':
        return 'bg-green-100 text-green-800';
      case 'growth':
        return 'bg-blue-100 text-blue-800';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800';
      case 'hedge':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const OptionsChainTable = ({
    contracts,
    type,
  }: {
    contracts: OptionContract[];
    type: 'calls' | 'puts';
  }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Strike</th>
            <th className="text-left p-2">Bid</th>
            <th className="text-left p-2">Ask</th>
            <th className="text-left p-2">Last</th>
            <th className="text-left p-2">Volume</th>
            <th className="text-left p-2">OI</th>
            <th className="text-left p-2">IV</th>
            <th className="text-left p-2">Delta</th>
            <th className="text-left p-2">Gamma</th>
            <th className="text-left p-2">Theta</th>
          </tr>
        </thead>
        <tbody>
          {contracts.map((contract, index) => (
            <tr
              key={index}
              className={`border-b hover:bg-gray-50 ${contract.inTheMoney ? 'bg-blue-50' : ''}`}
            >
              <td className="p-2 font-medium">${contract.strike}</td>
              <td className="p-2">${contract.bid.toFixed(2)}</td>
              <td className="p-2">${contract.ask.toFixed(2)}</td>
              <td className="p-2">${contract.last.toFixed(2)}</td>
              <td className="p-2">{contract.volume.toLocaleString()}</td>
              <td className="p-2">{contract.openInterest.toLocaleString()}</td>
              <td className="p-2">
                {formatPercent(contract.impliedVolatility)}
              </td>
              <td className="p-2">{contract.delta.toFixed(3)}</td>
              <td className="p-2">{contract.gamma.toFixed(3)}</td>
              <td className="p-2">{contract.theta.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Options Trading
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced options analysis and strategy tools
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AAPL">AAPL</SelectItem>
              <SelectItem value="NVDA">NVDA</SelectItem>
              <SelectItem value="TSLA">TSLA</SelectItem>
              <SelectItem value="SPY">SPY</SelectItem>
              <SelectItem value="QQQ">QQQ</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedExpiration}
            onValueChange={setSelectedExpiration}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {expirations.map(exp => (
                <SelectItem key={exp} value={exp}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chain">Options Chain</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="volatility">Volatility</TabsTrigger>
          <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="chain" className="space-y-4">
          {optionsChain && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span>Calls - {optionsChain.symbol}</span>
                  </CardTitle>
                  <CardDescription>
                    Expiration: {optionsChain.expirationDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OptionsChainTable
                    contracts={optionsChain.calls}
                    type="calls"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingDown className="w-5 h-5 text-red-600" />
                    <span>Puts - {optionsChain.symbol}</span>
                  </CardTitle>
                  <CardDescription>
                    Expiration: {optionsChain.expirationDate}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <OptionsChainTable
                    contracts={optionsChain.puts}
                    type="puts"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {strategies.map(strategy => (
              <Card
                key={strategy.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{strategy.name}</CardTitle>
                    <div className="flex items-center space-x-1">
                      <Badge
                        className={getStrategyBadgeColor(strategy.strategy)}
                      >
                        {strategy.strategy}
                      </Badge>
                      <Badge className={getRiskBadgeColor(strategy.riskLevel)}>
                        {strategy.riskLevel}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-3 h-3 text-green-600" />
                        <span className="font-medium">Max Profit:</span>
                      </div>
                      <span className="text-green-600">
                        {formatCurrency(strategy.maxProfit)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <Shield className="w-3 h-3 text-red-600" />
                        <span className="font-medium">Max Loss:</span>
                      </div>
                      <span className="text-red-600">
                        {formatCurrency(strategy.maxLoss)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>AI Rating:</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(strategy.aiRating / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-medium">
                          {strategy.aiRating.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Probability:</span>
                      <span className="font-medium">
                        {formatPercent(strategy.probability)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-600">
                      {strategy.recommendation}
                    </p>
                  </div>

                  <Button className="w-full" size="sm">
                    <Calculator className="w-4 h-4 mr-2" />
                    Analyze Strategy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="volatility" className="space-y-4">
          {volatilityData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Implied Volatility</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Current IV</Label>
                      <div className="text-2xl font-bold">
                        {formatPercent(
                          volatilityData.impliedVolatility.current
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>IV Rank</Label>
                      <div className="text-2xl font-bold">
                        {volatilityData.impliedVolatility.rank}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Historical Volatility</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>30-day:</span>
                        <span>
                          {formatPercent(
                            volatilityData.historicalVolatility['30day']
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>60-day:</span>
                        <span>
                          {formatPercent(
                            volatilityData.historicalVolatility['60day']
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>90-day:</span>
                        <span>
                          {formatPercent(
                            volatilityData.historicalVolatility['90day']
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annualized:</span>
                        <span>
                          {formatPercent(
                            volatilityData.historicalVolatility.annualized
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Volatility Skew</CardTitle>
                  <CardDescription>IV across strike prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {volatilityData.volatilitySkew.map((point, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="font-medium">${point.strike}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${point.iv * 100}%` }}
                            />
                          </div>
                          <span className="text-sm">
                            {formatPercent(point.iv)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="builder" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Layers className="w-5 h-5" />
                  <span>Strategy Builder</span>
                </CardTitle>
                <CardDescription>
                  Create custom options strategies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contract Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="put">Put</SelectItem>
                        <SelectItem value="stock">Stock</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Action</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">Buy</SelectItem>
                        <SelectItem value="sell">Sell</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Strike Price</Label>
                    <Input type="number" placeholder="Strike" />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input type="number" placeholder="1" />
                  </div>
                </div>

                <Button className="w-full">
                  <Zap className="w-4 h-4 mr-2" />
                  Add Leg
                </Button>

                {strategyLegs.length > 0 && (
                  <div className="space-y-2">
                    <Label>Strategy Legs</Label>
                    <div className="border rounded-lg p-3 space-y-2">
                      {strategyLegs.map((leg, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between text-sm"
                        >
                          <span>
                            {leg.action} {leg.quantity} {leg.type} @ $
                            {leg.strike}
                          </span>
                          <Button variant="outline" size="sm">
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => analyzeStrategy(strategyLegs)}
                  disabled={strategyLegs.length === 0}
                >
                  <Calculator className="w-4 h-4 mr-2" />
                  Analyze Strategy
                </Button>
              </CardContent>
            </Card>

            {strategyAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle>Strategy Analysis</CardTitle>
                  <CardDescription>
                    Risk/reward analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Max Profit</Label>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(strategyAnalysis.maxProfit)}
                      </div>
                    </div>
                    <div>
                      <Label>Max Loss</Label>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(strategyAnalysis.maxLoss)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>AI Rating</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(strategyAnalysis.aiRating / 10) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-medium">
                        {strategyAnalysis.aiRating.toFixed(1)}/10
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Success Probability</Label>
                    <div className="text-lg font-bold">
                      {formatPercent(strategyAnalysis.probability)}
                    </div>
                  </div>

                  <div>
                    <Label>Greeks Summary</Label>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span>Delta:</span>
                        <span>{strategyAnalysis.greeks.delta.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gamma:</span>
                        <span>{strategyAnalysis.greeks.gamma.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Theta:</span>
                        <span>{strategyAnalysis.greeks.theta.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vega:</span>
                        <span>{strategyAnalysis.greeks.vega.toFixed(3)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Label>Recommendation</Label>
                    <p className="text-sm text-gray-600">
                      {strategyAnalysis.recommendation}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
