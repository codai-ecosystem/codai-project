'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '../ui';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  AlertTriangle,
  DollarSign,
  Activity,
} from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  bid: number;
  ask: number;
  spread: number;
  dayHigh: number;
  dayLow: number;
  lastUpdate: string;
}

interface TradingPosition {
  id: string;
  symbol: string;
  type: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  timestamp: string;
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
}

interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

interface AISignal {
  id: string;
  symbol: string;
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  stopLoss: number;
  timeframe: string;
  riskReward: number;
}

export const TradingInterface: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [aiSignals, setAiSignals] = useState<AISignal[]>([]);
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>(
    'market'
  );
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Mock real-time market data
    const mockMarketData: MarketData[] = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 185.42,
        change: 2.34,
        changePercent: 1.28,
        volume: 45678923,
        marketCap: 2854000000000,
        bid: 185.4,
        ask: 185.44,
        spread: 0.04,
        dayHigh: 186.12,
        dayLow: 183.45,
        lastUpdate: new Date().toISOString(),
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 485.2,
        change: 12.45,
        changePercent: 2.63,
        volume: 78234567,
        marketCap: 1200000000000,
        bid: 485.15,
        ask: 485.25,
        spread: 0.1,
        dayHigh: 487.8,
        dayLow: 480.2,
        lastUpdate: new Date().toISOString(),
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 242.68,
        change: -3.21,
        changePercent: -1.31,
        volume: 34567890,
        marketCap: 775000000000,
        bid: 242.65,
        ask: 242.7,
        spread: 0.05,
        dayHigh: 246.5,
        dayLow: 241.8,
        lastUpdate: new Date().toISOString(),
      },
    ];

    const mockPositions: TradingPosition[] = [
      {
        id: 'pos-1',
        symbol: 'AAPL',
        type: 'long',
        quantity: 100,
        entryPrice: 182.5,
        currentPrice: 185.42,
        unrealizedPL: 292.0,
        unrealizedPLPercent: 1.6,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'pos-2',
        symbol: 'NVDA',
        type: 'long',
        quantity: 50,
        entryPrice: 475.3,
        currentPrice: 485.2,
        unrealizedPL: 495.0,
        unrealizedPLPercent: 2.08,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    const mockOrderBook: OrderBook = {
      bids: [
        { price: 185.4, quantity: 250, total: 46350 },
        { price: 185.39, quantity: 180, total: 33370.2 },
        { price: 185.38, quantity: 320, total: 59321.6 },
        { price: 185.37, quantity: 150, total: 27805.5 },
        { price: 185.36, quantity: 400, total: 74144 },
      ],
      asks: [
        { price: 185.44, quantity: 200, total: 37088 },
        { price: 185.45, quantity: 175, total: 32453.75 },
        { price: 185.46, quantity: 300, total: 55638 },
        { price: 185.47, quantity: 125, total: 23183.75 },
        { price: 185.48, quantity: 350, total: 64918 },
      ],
    };

    const mockAISignals: AISignal[] = [
      {
        id: 'signal-1',
        symbol: 'AAPL',
        signal: 'buy',
        confidence: 0.78,
        reasoning:
          'Strong momentum with volume confirmation. Technical indicators suggest continuation of uptrend.',
        targetPrice: 195.0,
        stopLoss: 180.0,
        timeframe: '1-2 weeks',
        riskReward: 3.2,
      },
      {
        id: 'signal-2',
        symbol: 'NVDA',
        signal: 'strong_buy',
        confidence: 0.85,
        reasoning:
          'AI sector momentum accelerating. Earnings revision cycle turning positive.',
        targetPrice: 520.0,
        stopLoss: 470.0,
        timeframe: '2-4 weeks',
        riskReward: 2.3,
      },
      {
        id: 'signal-3',
        symbol: 'TSLA',
        signal: 'hold',
        confidence: 0.65,
        reasoning:
          'Mixed signals. Waiting for clearer direction before recommending action.',
        targetPrice: 250.0,
        stopLoss: 235.0,
        timeframe: '1-3 weeks',
        riskReward: 1.8,
      },
    ];

    setMarketData(mockMarketData);
    setPositions(mockPositions);
    setOrderBook(mockOrderBook);
    setAiSignals(mockAISignals);
    setLoading(false);

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setMarketData(prev =>
        prev.map(item => ({
          ...item,
          price: item.price + (Math.random() - 0.5) * 2,
          change: item.change + (Math.random() - 0.5) * 0.5,
          lastUpdate: new Date().toISOString(),
        }))
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'strong_buy':
        return 'success';
      case 'buy':
        return 'default';
      case 'hold':
        return 'secondary';
      case 'sell':
        return 'warning';
      case 'strong_sell':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'strong_buy':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'buy':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'hold':
        return <Activity className="h-4 w-4 text-gray-600" />;
      case 'sell':
        return <TrendingDown className="h-4 w-4 text-orange-600" />;
      case 'strong_sell':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const currentMarketData = marketData.find(
    item => item.symbol === selectedSymbol
  );

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Market Data & Watchlist */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Market Data</span>
              <Badge variant="outline" className="ml-auto">
                Live
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketData.map(item => (
                <div
                  key={item.symbol}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedSymbol === item.symbol
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSymbol(item.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{item.symbol}</p>
                      <p className="text-sm text-gray-500">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.price)}
                      </p>
                      <p className={`text-sm ${getChangeColor(item.change)}`}>
                        {formatCurrency(item.change)} (
                        {formatPercent(item.changePercent)})
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-4 text-xs text-gray-500">
                    <div>
                      <p>Vol: {formatNumber(item.volume)}</p>
                    </div>
                    <div>
                      <p>Spread: {formatCurrency(item.spread)}</p>
                    </div>
                    <div>
                      <p>High: {formatCurrency(item.dayHigh)}</p>
                    </div>
                    <div>
                      <p>Low: {formatCurrency(item.dayLow)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Book */}
        <Card>
          <CardHeader>
            <CardTitle>Order Book - {selectedSymbol}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Bids</h4>
                <div className="space-y-1">
                  {orderBook.bids.map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-green-600">
                        {formatCurrency(bid.price)}
                      </span>
                      <span>{bid.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Asks</h4>
                <div className="space-y-1">
                  {orderBook.asks.map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-red-600">
                        {formatCurrency(ask.price)}
                      </span>
                      <span>{ask.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Positions */}
        <Card>
          <CardHeader>
            <CardTitle>Open Positions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {positions.map(position => (
                <div
                  key={position.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{position.symbol}</p>
                    <p className="text-sm text-gray-500">
                      {position.type.toUpperCase()} • {position.quantity} shares
                    </p>
                    <p className="text-xs text-gray-400">
                      Entry: {formatCurrency(position.entryPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${getChangeColor(position.unrealizedPL)}`}
                    >
                      {formatCurrency(position.unrealizedPL)}
                    </p>
                    <p
                      className={`text-sm ${getChangeColor(position.unrealizedPL)}`}
                    >
                      {formatPercent(position.unrealizedPLPercent)}
                    </p>
                    <p className="text-xs text-gray-400">
                      Current: {formatCurrency(position.currentPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Panel & AI Signals */}
      <div className="space-y-6">
        {/* Quick Order Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Symbol</label>
              <select
                value={selectedSymbol}
                onChange={e => setSelectedSymbol(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                {marketData.map(item => (
                  <option key={item.symbol} value={item.symbol}>
                    {item.symbol} - {formatCurrency(item.price)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={orderSide === 'buy' ? 'default' : 'outline'}
                onClick={() => setOrderSide('buy')}
                className="w-full"
              >
                Buy
              </Button>
              <Button
                variant={orderSide === 'sell' ? 'default' : 'outline'}
                onClick={() => setOrderSide('sell')}
                className="w-full"
              >
                Sell
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium">Order Type</label>
              <select
                value={orderType}
                onChange={e => setOrderType(e.target.value as any)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="market">Market</option>
                <option value="limit">Limit</option>
                <option value="stop">Stop</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full mt-1 p-2 border rounded-md"
                placeholder="0"
              />
            </div>

            {orderType !== 'market' && (
              <div>
                <label className="text-sm font-medium">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(Number(e.target.value))}
                  className="w-full mt-1 p-2 border rounded-md"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            )}

            <Button
              className="w-full"
              variant={orderSide === 'buy' ? 'default' : 'destructive'}
            >
              <Zap className="h-4 w-4 mr-2" />
              Place {orderSide.toUpperCase()} Order
            </Button>

            {currentMarketData && (
              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Estimated Total:</span>
                  <span className="font-medium">
                    {formatCurrency(
                      (orderType === 'market'
                        ? currentMarketData.price
                        : price) * quantity
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Buying Power:</span>
                  <span className="text-green-600">
                    {formatCurrency(50000)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Trading Signals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5" />
              <span>AI Trading Signals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiSignals.map(signal => (
                <div
                  key={signal.id}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getSignalIcon(signal.signal)}
                      <span className="font-semibold">{signal.symbol}</span>
                      <Badge variant={getSignalColor(signal.signal)}>
                        {signal.signal.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {(signal.confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">{signal.reasoning}</p>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-gray-500">Target</p>
                      <p className="font-medium">
                        {formatCurrency(signal.targetPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stop Loss</p>
                      <p className="font-medium">
                        {formatCurrency(signal.stopLoss)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Risk/Reward</p>
                      <p className="font-medium">
                        {signal.riskReward.toFixed(1)}:1
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Timeframe</p>
                      <p className="font-medium">{signal.timeframe}</p>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full">
                    Apply Signal
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
