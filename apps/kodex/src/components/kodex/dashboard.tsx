'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Blocks,
    Cpu,
    Zap,
    Activity,
    Shield,
    Coins,
    TrendingUp,
    Network,
    Database,
    Lock,
    Globe,
    ArrowRight,
    BarChart3,
    DollarSign,
    Users,
    Clock,
    CheckCircle
} from 'lucide-react'

interface BlockchainStats {
    totalBlocks: number
    networkHashrate: string
    activeNodes: number
    blockTime: number
    totalSupply: number
    marketCap: number
    stakingRewards: number
    tvl: number
}

interface NetworkMetric {
    name: string
    value: string
    change: string
    trend: 'up' | 'down' | 'stable'
    icon: any
}

interface Transaction {
    hash: string
    type: 'transfer' | 'stake' | 'contract' | 'ai_compute'
    amount: string
    timestamp: string
    status: 'confirmed' | 'pending' | 'failed'
}

export function KodexDashboard() {
    const [stats] = useState<BlockchainStats>({
        totalBlocks: 2847392,
        networkHashrate: '2.4 EH/s',
        activeNodes: 15672,
        blockTime: 6.2,
        totalSupply: 21000000,
        marketCap: 156.7,
        stakingRewards: 8.5,
        tvl: 89.2
    })

    const networkMetrics: NetworkMetric[] = [
        { name: 'Network Security', value: '99.98%', change: '+0.02%', trend: 'up', icon: Shield },
        { name: 'Transaction Speed', value: '~3,500 TPS', change: '+12%', trend: 'up', icon: Zap },
        { name: 'AI Compute Used', value: '67%', change: '+5%', trend: 'up', icon: Cpu },
        { name: 'Protocol Revenue', value: '$2.4M', change: '+18%', trend: 'up', icon: DollarSign }
    ]

    const recentTransactions: Transaction[] = [
        { hash: '0xa1b2c3...', type: 'ai_compute', amount: '150 KODEX', timestamp: '12s ago', status: 'confirmed' },
        { hash: '0xd4e5f6...', type: 'stake', amount: '5,000 KODEX', timestamp: '34s ago', status: 'confirmed' },
        { hash: '0x789abc...', type: 'transfer', amount: '250 KODEX', timestamp: '1m ago', status: 'pending' },
        { hash: '0xdef123...', type: 'contract', amount: '1,200 KODEX', timestamp: '2m ago', status: 'confirmed' }
    ]

    const aiProtocols = [
        { name: 'Neural Consensus', status: 'active', participants: 1247, reward: '12.5 KODEX/epoch' },
        { name: 'Compute Validation', status: 'active', participants: 892, reward: '8.3 KODEX/epoch' },
        { name: 'Data Oracle', status: 'upgrading', participants: 567, reward: '15.2 KODEX/epoch' },
        { name: 'Model Training', status: 'active', participants: 1834, reward: '22.1 KODEX/epoch' }
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-700'
            case 'pending': return 'bg-yellow-100 text-yellow-700'
            case 'failed': return 'bg-red-100 text-red-700'
            case 'active': return 'bg-green-100 text-green-700'
            case 'upgrading': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'ai_compute': return <Cpu className="h-4 w-4 text-purple-500" />
            case 'stake': return <Coins className="h-4 w-4 text-blue-500" />
            case 'transfer': return <ArrowRight className="h-4 w-4 text-green-500" />
            case 'contract': return <Network className="h-4 w-4 text-orange-500" />
            default: return <Activity className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
                            <Blocks className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">KODEX</h1>
                            <p className="text-slate-600">CodaiChain Core Protocol & AI Economic Layer</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <Activity className="mr-1 h-3 w-3" />
                            Network Online
                        </Badge>
                        <Badge variant="outline">Block #{stats.totalBlocks.toLocaleString()}</Badge>
                    </div>
                </div>

                {/* Core Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Blocks</CardTitle>
                            <Blocks className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalBlocks.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">~{stats.blockTime}s avg block time</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Network Hashrate</CardTitle>
                            <Zap className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.networkHashrate}</div>
                            <p className="text-xs text-slate-500">Network computing power</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Nodes</CardTitle>
                            <Network className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.activeNodes.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Validators & miners</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Market Cap</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">${stats.marketCap}M</div>
                            <p className="text-xs text-slate-500">Total market value</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Network Metrics */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {networkMetrics.map((metric, index) => (
                        <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-600">{metric.name}</CardTitle>
                                <metric.icon className="h-4 w-4 text-indigo-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-slate-900">{metric.value}</div>
                                <div className="flex items-center gap-1 text-xs">
                                    <TrendingUp className={`h-3 w-3 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                                    <span className={metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}>{metric.change}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Transactions */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Recent Transactions
                            </CardTitle>
                            <CardDescription>Latest network activity and transactions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentTransactions.map((tx, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                            {getTypeIcon(tx.type)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-mono text-sm text-slate-900">{tx.hash}</p>
                                                <Badge variant="outline" className={getStatusColor(tx.status)}>
                                                    {tx.status}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-slate-500">{tx.type.replace('_', ' ')} • {tx.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900">{tx.amount}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* AI Protocols */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="h-5 w-5 text-purple-600" />
                                AI Protocols
                            </CardTitle>
                            <CardDescription>Active AI consensus and compute protocols</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {aiProtocols.map((protocol, index) => (
                                <div key={index} className="p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-slate-900">{protocol.name}</p>
                                            <Badge variant="outline" className={getStatusColor(protocol.status)}>
                                                {protocol.status === 'active' ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                                                {protocol.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-slate-600">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {protocol.participants.toLocaleString()} participants
                                        </span>
                                        <span className="font-mono">{protocol.reward}</span>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Economic Metrics */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-yellow-600" />
                                Token Economics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Total Supply</span>
                                <span className="font-semibold">{stats.totalSupply.toLocaleString()} KODEX</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Staking Rewards</span>
                                <span className="font-semibold text-green-600">{stats.stakingRewards}% APY</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">TVL</span>
                                <span className="font-semibold">${stats.tvl}M</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-indigo-600" />
                                Network Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Uptime</span>
                                <span className="font-semibold text-green-600">99.98%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Consensus Health</span>
                                <span className="font-semibold text-green-600">Excellent</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Network Latency</span>
                                <span className="font-semibold">45ms avg</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-red-600" />
                                Security Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Threat Level</span>
                                <span className="font-semibold text-green-600">None</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Validators</span>
                                <span className="font-semibold">{(stats.activeNodes * 0.6).toFixed(0)} active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-slate-600">Slashing Events</span>
                                <span className="font-semibold">0 (24h)</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                        <Network className="mr-2 h-4 w-4" />
                        Node Dashboard
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Coins className="mr-2 h-4 w-4" />
                        Staking Portal
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Cpu className="mr-2 h-4 w-4" />
                        AI Compute
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Globe className="mr-2 h-4 w-4" />
                        Explorer
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>KODEX - CodaiChain Core Protocol & AI Economic Layer</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                <Blocks className="mr-1 h-3 w-3" />
                                Blockchain Active
                            </Badge>
                            <p>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
