/**
 * DeFi Integration Component
 * Advanced DeFi protocols, yield farming, and liquidity management
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import {
    TrendingUp,
    Zap,
    Layers,
    Target,
    PieChart,
    BarChart3,
    Droplets,
    Shield,
    AlertTriangle,
    Clock,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

interface DeFiProtocol {
    id: string;
    name: string;
    category: 'lending' | 'dex' | 'yield' | 'staking' | 'derivatives';
    apy: number;
    tvl: number;
    risk: 'low' | 'medium' | 'high';
    chain: string;
    token: string;
    userPosition?: {
        amount: number;
        value: number;
        earnings: number;
    };
}

interface YieldPosition {
    id: string;
    protocol: string;
    strategy: string;
    amount: number;
    token: string;
    apy: number;
    dailyEarnings: number;
    totalEarnings: number;
    startDate: Date;
    status: 'active' | 'pending' | 'ended';
    autoCompound: boolean;
}

interface LiquidityPool {
    id: string;
    name: string;
    tokens: string[];
    apy: number;
    fee: number;
    volume24h: number;
    userLiquidity?: {
        amount: number;
        share: number;
        earnings: number;
    };
}

export default function DeFiIntegration() {
    const [protocols, setProtocols] = useState<DeFiProtocol[]>([]);
    const [positions, setPositions] = useState<YieldPosition[]>([]);
    const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
    const [activeTab, setActiveTab] = useState<'protocols' | 'positions' | 'liquidity'>('protocols');

    useEffect(() => {
        // Initialize with mock data
        setProtocols([
            {
                id: '1',
                name: 'Aave',
                category: 'lending',
                apy: 4.2,
                tvl: 12500000000,
                risk: 'low',
                chain: 'Ethereum',
                token: 'USDC',
                userPosition: {
                    amount: 5000,
                    value: 5000,
                    earnings: 210
                }
            },
            {
                id: '2',
                name: 'Uniswap V3',
                category: 'dex',
                apy: 12.8,
                tvl: 8200000000,
                risk: 'medium',
                chain: 'Ethereum',
                token: 'ETH/USDC'
            },
            {
                id: '3',
                name: 'Compound',
                category: 'lending',
                apy: 3.8,
                tvl: 3400000000,
                risk: 'low',
                chain: 'Ethereum',
                token: 'DAI'
            },
            {
                id: '4',
                name: 'Yearn Finance',
                category: 'yield',
                apy: 8.5,
                tvl: 1200000000,
                risk: 'medium',
                chain: 'Ethereum',
                token: 'yvUSDC',
                userPosition: {
                    amount: 2500,
                    value: 2687,
                    earnings: 187
                }
            },
            {
                id: '5',
                name: 'Lido',
                category: 'staking',
                apy: 5.2,
                tvl: 25000000000,
                risk: 'low',
                chain: 'Ethereum',
                token: 'stETH'
            }
        ]);

        setPositions([
            {
                id: '1',
                protocol: 'Aave',
                strategy: 'USDC Lending',
                amount: 5000,
                token: 'USDC',
                apy: 4.2,
                dailyEarnings: 0.58,
                totalEarnings: 210,
                startDate: new Date('2024-01-01'),
                status: 'active',
                autoCompound: true
            },
            {
                id: '2',
                protocol: 'Yearn Finance',
                strategy: 'yvUSDC Vault',
                amount: 2500,
                token: 'USDC',
                apy: 8.5,
                dailyEarnings: 0.58,
                totalEarnings: 187,
                startDate: new Date('2024-01-15'),
                status: 'active',
                autoCompound: true
            },
            {
                id: '3',
                protocol: 'Uniswap V3',
                strategy: 'ETH/USDC LP',
                amount: 1000,
                token: 'ETH',
                apy: 12.8,
                dailyEarnings: 0.35,
                totalEarnings: 45,
                startDate: new Date('2024-02-01'),
                status: 'active',
                autoCompound: false
            }
        ]);

        setLiquidityPools([
            {
                id: '1',
                name: 'ETH/USDC',
                tokens: ['ETH', 'USDC'],
                apy: 12.8,
                fee: 0.3,
                volume24h: 45000000,
                userLiquidity: {
                    amount: 1000,
                    share: 0.002,
                    earnings: 45
                }
            },
            {
                id: '2',
                name: 'DAI/USDC',
                tokens: ['DAI', 'USDC'],
                apy: 2.1,
                fee: 0.05,
                volume24h: 12000000
            },
            {
                id: '3',
                name: 'WBTC/ETH',
                tokens: ['WBTC', 'ETH'],
                apy: 15.2,
                fee: 0.3,
                volume24h: 28000000
            }
        ]);
    }, []);

    const totalPositionValue = positions.reduce((sum, pos) => sum + pos.amount, 0);
    const totalEarnings = positions.reduce((sum, pos) => sum + pos.totalEarnings, 0);
    const dailyEarnings = positions.reduce((sum, pos) => sum + pos.dailyEarnings, 0);

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'medium': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'lending': return <DollarSign className="w-4 h-4" />;
            case 'dex': return <Zap className="w-4 h-4" />;
            case 'yield': return <TrendingUp className="w-4 h-4" />;
            case 'staking': return <Shield className="w-4 h-4" />;
            case 'derivatives': return <BarChart3 className="w-4 h-4" />;
            default: return <Layers className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* DeFi Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <PieChart className="w-5 h-5 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Position</p>
                                <p className="text-2xl font-bold">${totalPositionValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Earnings</p>
                                <p className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">Daily Earnings</p>
                                <p className="text-2xl font-bold">${dailyEarnings.toFixed(2)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Target className="w-5 h-5 text-orange-600" />
                            <div>
                                <p className="text-sm text-gray-600">Active Positions</p>
                                <p className="text-2xl font-bold">{positions.filter(p => p.status === 'active').length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    onClick={() => setActiveTab('protocols')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'protocols'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    DeFi Protocols
                </button>
                <button
                    onClick={() => setActiveTab('positions')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'positions'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Active Positions
                </button>
                <button
                    onClick={() => setActiveTab('liquidity')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'liquidity'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Liquidity Pools
                </button>
            </div>

            {/* DeFi Protocols Tab */}
            {activeTab === 'protocols' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {protocols.map((protocol) => (
                        <Card key={protocol.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            {getCategoryIcon(protocol.category)}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{protocol.name}</CardTitle>
                                            <CardDescription className="capitalize">{protocol.category}</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className={getRiskColor(protocol.risk)}>
                                        {protocol.risk} risk
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">APY</p>
                                        <p className="font-bold text-lg text-green-600">{protocol.apy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">TVL</p>
                                        <p className="font-bold">${(protocol.tvl / 1e9).toFixed(1)}B</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Chain</p>
                                        <p className="font-medium">{protocol.chain}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Token</p>
                                        <p className="font-medium">{protocol.token}</p>
                                    </div>
                                </div>

                                {protocol.userPosition && (
                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                        <h4 className="font-medium text-blue-900 mb-2">Your Position</h4>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <p className="text-blue-600">Amount</p>
                                                <p className="font-bold">${protocol.userPosition.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600">Value</p>
                                                <p className="font-bold">${protocol.userPosition.value.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-blue-600">Earnings</p>
                                                <p className="font-bold text-green-600">+${protocol.userPosition.earnings}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    <Button className="flex-1">
                                        {protocol.userPosition ? 'Manage' : 'Deposit'}
                                    </Button>
                                    <Button variant="outline">Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Active Positions Tab */}
            {activeTab === 'positions' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Active Yield Positions</CardTitle>
                        <CardDescription>Your current DeFi investments and earnings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {positions.map((position) => (
                            <div key={position.id} className="p-4 border rounded-lg space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <TrendingUp className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">{position.protocol}</h4>
                                            <p className="text-sm text-gray-600">{position.strategy}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                                            {position.status}
                                        </Badge>
                                        {position.autoCompound && (
                                            <Badge className="bg-purple-100 text-purple-800">
                                                Auto-compound
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Amount</p>
                                        <p className="font-bold">{position.amount.toLocaleString()} {position.token}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">APY</p>
                                        <p className="font-bold text-green-600">{position.apy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Daily Earnings</p>
                                        <p className="font-bold">${position.dailyEarnings.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Total Earnings</p>
                                        <p className="font-bold text-green-600">${position.totalEarnings.toFixed(2)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Duration</p>
                                        <p className="font-bold">
                                            {Math.floor((Date.now() - position.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                                        </p>
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <Button variant="outline" size="sm">Manage</Button>
                                    <Button variant="outline" size="sm">Withdraw</Button>
                                    <Button variant="outline" size="sm">Compound</Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Liquidity Pools Tab */}
            {activeTab === 'liquidity' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {liquidityPools.map((pool) => (
                        <Card key={pool.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Droplets className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle>{pool.name}</CardTitle>
                                            <CardDescription>
                                                {pool.tokens.join('/')} • {pool.fee}% fee
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">APY</p>
                                        <p className="font-bold text-lg text-green-600">{pool.apy}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">24h Volume</p>
                                        <p className="font-bold">${(pool.volume24h / 1e6).toFixed(1)}M</p>
                                    </div>
                                </div>

                                {pool.userLiquidity && (
                                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                                        <h4 className="font-medium text-green-900 mb-2">Your Liquidity</h4>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <p className="text-green-600">Amount</p>
                                                <p className="font-bold">${pool.userLiquidity.amount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-green-600">Pool Share</p>
                                                <p className="font-bold">{(pool.userLiquidity.share * 100).toFixed(3)}%</p>
                                            </div>
                                            <div>
                                                <p className="text-green-600">Earnings</p>
                                                <p className="font-bold text-green-600">${pool.userLiquidity.earnings}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    <Button className="flex-1">
                                        {pool.userLiquidity ? 'Manage' : 'Add Liquidity'}
                                    </Button>
                                    <Button variant="outline">Details</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Risk Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Risk Management</span>
                    </CardTitle>
                    <CardDescription>Monitor and manage your DeFi exposure</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Portfolio Diversification</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Lending</span>
                                    <span>62%</span>
                                </div>
                                <Progress value={62} className="h-2" />
                                <div className="flex justify-between text-sm">
                                    <span>DEX</span>
                                    <span>25%</span>
                                </div>
                                <Progress value={25} className="h-2" />
                                <div className="flex justify-between text-sm">
                                    <span>Yield</span>
                                    <span>13%</span>
                                </div>
                                <Progress value={13} className="h-2" />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Risk Exposure</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Low Risk</span>
                                    <span>70%</span>
                                </div>
                                <Progress value={70} className="h-2" />
                                <div className="flex justify-between text-sm">
                                    <span>Medium Risk</span>
                                    <span>25%</span>
                                </div>
                                <Progress value={25} className="h-2" />
                                <div className="flex justify-between text-sm">
                                    <span>High Risk</span>
                                    <span>5%</span>
                                </div>
                                <Progress value={5} className="h-2" />
                            </div>
                        </div>

                        <div className="p-4 border rounded-lg">
                            <h4 className="font-medium mb-2">Chain Distribution</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Ethereum</span>
                                    <span>85%</span>
                                </div>
                                <Progress value={85} className="h-2" />
                                <div className="flex justify-between text-sm">
                                    <span>Polygon</span>
                                    <span>10%</span>
                                </div>
                                <Progress value={10} className="h-2" />
                                <div className="flex justify-between text-sm">
                                    <span>Other</span>
                                    <span>5%</span>
                                </div>
                                <Progress value={5} className="h-2" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h4 className="font-medium text-yellow-900">Risk Alert</h4>
                                <p className="text-sm text-yellow-800 mt-1">
                                    Your portfolio has high concentration in Ethereum-based protocols.
                                    Consider diversifying across different chains for better risk management.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
