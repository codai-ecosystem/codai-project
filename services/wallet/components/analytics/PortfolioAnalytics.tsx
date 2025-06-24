/**
 * Portfolio Analytics Component
 * Advanced portfolio tracking, performance analysis, and insights
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart,
    Calendar,
    Target,
    Award,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Percent,
    Clock,
    Activity
} from 'lucide-react';

interface PortfolioMetrics {
    totalValue: number;
    totalReturn: number;
    totalReturnPercent: number;
    dayChange: number;
    dayChangePercent: number;
    weekChange: number;
    weekChangePercent: number;
    monthChange: number;
    monthChangePercent: number;
    yearChange: number;
    yearChangePercent: number;
}

interface AssetAllocation {
    asset: string;
    symbol: string;
    value: number;
    percentage: number;
    change24h: number;
    change7d: number;
    chain: string;
    type: 'token' | 'defi' | 'nft' | 'staking';
}

interface PerformanceData {
    date: string;
    value: number;
    change: number;
}

interface Alert {
    id: string;
    type: 'gain' | 'loss' | 'opportunity' | 'risk';
    title: string;
    message: string;
    timestamp: Date;
    isRead: boolean;
}

export default function PortfolioAnalytics() {
    const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
    const [allocations, setAllocations] = useState<AssetAllocation[]>([]);
    const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');

    useEffect(() => {
        // Initialize with mock data
        setMetrics({
            totalValue: 47234.52,
            totalReturn: 8543.21,
            totalReturnPercent: 22.1,
            dayChange: 342.15,
            dayChangePercent: 0.73,
            weekChange: -123.45,
            weekChangePercent: -0.26,
            monthChange: 1234.67,
            monthChangePercent: 2.68,
            yearChange: 6789.12,
            yearChangePercent: 16.77
        });

        setAllocations([
            {
                asset: 'Ethereum',
                symbol: 'ETH',
                value: 18924.32,
                percentage: 40.1,
                change24h: 2.3,
                change7d: -1.2,
                chain: 'Ethereum',
                type: 'token'
            },
            {
                asset: 'USDC Lending',
                symbol: 'USDC',
                value: 12847.65,
                percentage: 27.2,
                change24h: 0.02,
                change7d: 0.18,
                chain: 'Ethereum',
                type: 'defi'
            },
            {
                asset: 'Bitcoin',
                symbol: 'BTC',
                value: 8392.14,
                percentage: 17.8,
                change24h: 1.8,
                change7d: 0.5,
                chain: 'Bitcoin',
                type: 'token'
            },
            {
                asset: 'Uniswap LP',
                symbol: 'UNI-LP',
                value: 4123.87,
                percentage: 8.7,
                change24h: 3.2,
                change7d: 2.1,
                chain: 'Ethereum',
                type: 'defi'
            },
            {
                asset: 'Staked ETH',
                symbol: 'stETH',
                value: 2946.54,
                percentage: 6.2,
                change24h: 2.1,
                change7d: -0.8,
                chain: 'Ethereum',
                type: 'staking'
            }
        ]);

        // Generate mock performance data
        const generatePerformanceData = () => {
            const data: PerformanceData[] = [];
            const baseValue = 38000;
            for (let i = 30; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const randomChange = (Math.random() - 0.5) * 1000;
                const value = baseValue + randomChange + (30 - i) * 300;
                data.push({
                    date: date.toISOString().split('T')[0],
                    value: value,
                    change: i === 30 ? 0 : value - data[data.length - 1]?.value || 0
                });
            }
            return data;
        };

        setPerformanceData(generatePerformanceData());

        setAlerts([
            {
                id: '1',
                type: 'gain',
                title: 'Portfolio Milestone',
                message: 'Your portfolio has reached $47,000 for the first time!',
                timestamp: new Date('2024-01-15T10:30:00'),
                isRead: false
            },
            {
                id: '2',
                type: 'opportunity',
                title: 'Yield Opportunity',
                message: 'New high-yield opportunity available: Compound USDC at 4.5% APY',
                timestamp: new Date('2024-01-15T09:15:00'),
                isRead: false
            },
            {
                id: '3',
                type: 'risk',
                title: 'Concentration Risk',
                message: 'Over 40% of portfolio in ETH. Consider diversification.',
                timestamp: new Date('2024-01-14T16:45:00'),
                isRead: true
            }
        ]);
    }, []);

    const getChangeColor = (change: number) => {
        return change >= 0 ? 'text-green-600' : 'text-red-600';
    };

    const getChangeIcon = (change: number) => {
        return change >= 0 ? (
            <ArrowUpRight className="w-4 h-4 text-green-600" />
        ) : (
            <ArrowDownRight className="w-4 h-4 text-red-600" />
        );
    };

    const getAssetTypeColor = (type: string) => {
        switch (type) {
            case 'token': return 'bg-blue-100 text-blue-800';
            case 'defi': return 'bg-green-100 text-green-800';
            case 'staking': return 'bg-purple-100 text-purple-800';
            case 'nft': return 'bg-pink-100 text-pink-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'gain': return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'loss': return <TrendingDown className="w-4 h-4 text-red-600" />;
            case 'opportunity': return <Target className="w-4 h-4 text-blue-600" />;
            case 'risk': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            default: return <Activity className="w-4 h-4 text-gray-600" />;
        }
    };

    if (!metrics) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Value</p>
                                <p className="text-2xl font-bold">${metrics.totalValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {getChangeIcon(metrics.totalReturn)}
                            <div>
                                <p className="text-sm text-gray-600">Total Return</p>
                                <p className={`text-2xl font-bold ${getChangeColor(metrics.totalReturn)}`}>
                                    ${metrics.totalReturn.toLocaleString()}
                                </p>
                                <p className={`text-sm ${getChangeColor(metrics.totalReturnPercent)}`}>
                                    {metrics.totalReturnPercent > 0 ? '+' : ''}{metrics.totalReturnPercent}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            {getChangeIcon(metrics.dayChange)}
                            <div>
                                <p className="text-sm text-gray-600">24h Change</p>
                                <p className={`text-2xl font-bold ${getChangeColor(metrics.dayChange)}`}>
                                    ${metrics.dayChange.toLocaleString()}
                                </p>
                                <p className={`text-sm ${getChangeColor(metrics.dayChangePercent)}`}>
                                    {metrics.dayChangePercent > 0 ? '+' : ''}{metrics.dayChangePercent}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Best Asset</p>
                                <p className="text-2xl font-bold">UNI-LP</p>
                                <p className="text-sm text-green-600">+3.2% today</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Chart & Timeframe Selector */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Portfolio Performance</CardTitle>
                            <CardDescription>Track your portfolio value over time</CardDescription>
                        </div>
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setTimeframe(period as any)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${timeframe === period
                                            ? 'bg-white text-gray-900 shadow'
                                            : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {period}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Simplified chart representation */}
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 flex items-end justify-between">
                        {performanceData.slice(-10).map((data, index) => (
                            <div
                                key={index}
                                className="bg-blue-500 rounded-t"
                                style={{
                                    height: `${(data.value / Math.max(...performanceData.map(d => d.value))) * 200}px`,
                                    width: '20px'
                                }}
                                title={`${data.date}: $${data.value.toLocaleString()}`}
                            />
                        ))}
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Period Return</p>
                            <p className={`font-bold ${getChangeColor(metrics.monthChange)}`}>
                                {metrics.monthChange > 0 ? '+' : ''}${metrics.monthChange.toLocaleString()} ({metrics.monthChangePercent}%)
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">Best Day</p>
                            <p className="font-bold text-green-600">+$1,234.56</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Worst Day</p>
                            <p className="font-bold text-red-600">-$567.89</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Volatility</p>
                            <p className="font-bold">12.3%</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Asset Allocation */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <PieChart className="w-5 h-5" />
                            <span>Asset Allocation</span>
                        </CardTitle>
                        <CardDescription>Breakdown of your portfolio by asset</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {allocations.map((allocation, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }} />
                                        <div>
                                            <p className="font-medium">{allocation.asset}</p>
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getAssetTypeColor(allocation.type)}>
                                                    {allocation.type}
                                                </Badge>
                                                <span className="text-xs text-gray-500">{allocation.chain}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">${allocation.value.toLocaleString()}</p>
                                        <p className="text-sm text-gray-600">{allocation.percentage}%</p>
                                    </div>
                                </div>
                                <Progress value={allocation.percentage} className="h-2" />
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>24h: <span className={getChangeColor(allocation.change24h)}>
                                        {allocation.change24h > 0 ? '+' : ''}{allocation.change24h}%
                                    </span></span>
                                    <span>7d: <span className={getChangeColor(allocation.change7d)}>
                                        {allocation.change7d > 0 ? '+' : ''}{allocation.change7d}%
                                    </span></span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Portfolio Insights & Alerts */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5" />
                            <span>Portfolio Insights</span>
                        </CardTitle>
                        <CardDescription>AI-powered analysis and recommendations</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {alerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`p-3 rounded-lg border ${alert.isRead ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    {getAlertIcon(alert.type)}
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{alert.title}</h4>
                                            <span className="text-xs text-gray-500">
                                                {alert.timestamp.toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Portfolio Health Score */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-blue-900">Portfolio Health Score</h4>
                                <span className="text-2xl font-bold text-blue-900">8.2/10</span>
                            </div>
                            <Progress value={82} className="mb-2" />
                            <p className="text-sm text-blue-800">
                                Good diversification and risk management. Consider reducing ETH concentration.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Risk Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Sharpe Ratio</span>
                            <span className="font-medium">1.24</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Beta</span>
                            <span className="font-medium">0.87</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Max Drawdown</span>
                            <span className="font-medium text-red-600">-15.3%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">VaR (95%)</span>
                            <span className="font-medium">$2,341</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Annualized Return</span>
                            <span className="font-medium text-green-600">18.2%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Win Rate</span>
                            <span className="font-medium">67%</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Best Month</span>
                            <span className="font-medium text-green-600">+$3,456</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Worst Month</span>
                            <span className="font-medium text-red-600">-$1,234</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Correlation Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">vs. S&P 500</span>
                            <span className="font-medium">0.72</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">vs. BTC</span>
                            <span className="font-medium">0.85</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">vs. ETH</span>
                            <span className="font-medium">0.91</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Diversification</span>
                            <span className="font-medium text-yellow-600">Medium</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
