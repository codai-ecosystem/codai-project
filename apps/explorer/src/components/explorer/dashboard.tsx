'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Search,
    Code,
    BarChart3,
    ArrowRight,
    Target,
    Activity,
    Globe,
    Hash,
    Wallet,
    Filter,
    Zap,
    Pause,
    Play,
    RefreshCw,
    Shield,
    TrendingUp,
    Network,
    Server,
    Database,
    Cpu,
    Link,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    Layers
} from 'lucide-react'

interface BlockchainStats {
    blockHeight: number
    totalTransactions: number
    activeAddresses: number
    totalSupply: string
    marketCap: string
    avgBlockTime: string
}

// Advanced blockchain data interfaces for Phase 5
interface ValidatorInfo {
    address: string
    name: string
    stake: string
    commission: string
    uptime: number
    status: 'active' | 'jailed' | 'unbonding'
}

interface CrossChainBridge {
    chain: string
    status: 'active' | 'paused' | 'maintenance'
    totalLocked: string
    transactions24h: number
}

interface AIMetric {
    computeJobs: number
    avgProcessingTime: string
    aiRevenue: string
    activeModels: number
}

interface DeveloperAPI {
    endpoint: string
    method: string
    description: string
    usage: number
}

export function ExplorerDashboard() {
    const [stats, setStats] = useState<BlockchainStats>({
        blockHeight: 2847392,
        totalTransactions: 15623847,
        activeAddresses: 342156,
        totalSupply: '1,000,000,000 KODEX',
        marketCap: '$874,230,000',
        avgBlockTime: '12.3s'
    })

    const [searchQuery, setSearchQuery] = useState('')
    const [searchType, setSearchType] = useState('all')
    const [isSearching, setIsSearching] = useState(false)

    // Real-time monitoring states
    const [isLiveMode, setIsLiveMode] = useState(true)
    const [lastUpdate, setLastUpdate] = useState(new Date())
    const [networkStatus, setNetworkStatus] = useState<'online' | 'degraded' | 'offline'>('online')
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    // Advanced Phase 5 states
    const [validators, setValidators] = useState<ValidatorInfo[]>([
        { address: '0x742d...Ef9A', name: 'CodaiNode Alpha', stake: '2,500,000 KODEX', commission: '5%', uptime: 99.8, status: 'active' },
        { address: '0x8B4c...12Fd', name: 'AI Validator Pro', stake: '1,800,000 KODEX', commission: '3%', uptime: 99.9, status: 'active' },
        { address: '0x3A7e...89Bc', name: 'Neural Network Node', stake: '1,200,000 KODEX', commission: '7%', uptime: 98.5, status: 'active' },
        { address: '0x9F2d...45Ed', name: 'Quantum Validator', stake: '900,000 KODEX', commission: '4%', uptime: 97.2, status: 'jailed' }
    ])

    const [crossChainBridges, setCrossChainBridges] = useState<CrossChainBridge[]>([
        { chain: 'Ethereum', status: 'active', totalLocked: '12.5M KODEX', transactions24h: 1247 },
        { chain: 'Bitcoin', status: 'active', totalLocked: '8.3M KODEX', transactions24h: 892 },
        { chain: 'Polygon', status: 'active', totalLocked: '6.1M KODEX', transactions24h: 2156 },
        { chain: 'Solana', status: 'maintenance', totalLocked: '4.7M KODEX', transactions24h: 0 }
    ])

    const [aiMetrics, setAiMetrics] = useState<AIMetric>({
        computeJobs: 15847,
        avgProcessingTime: '2.3s',
        aiRevenue: '247,892 KODEX',
        activeModels: 1432
    })

    const [developerAPIs, setDeveloperAPIs] = useState<DeveloperAPI[]>([
        { endpoint: '/api/v1/blocks', method: 'GET', description: 'Retrieve block information', usage: 12847 },
        { endpoint: '/api/v1/transactions', method: 'GET', description: 'Get transaction details', usage: 8932 },
        { endpoint: '/api/v1/addresses', method: 'GET', description: 'Address balance and history', usage: 6754 },
        { endpoint: '/api/v1/validators', method: 'GET', description: 'Validator network data', usage: 3421 }
    ])

    // Real-time data simulation for all Phase 5 features
    useEffect(() => {
        if (isLiveMode) {
            intervalRef.current = setInterval(() => {
                // Simulate real-time blockchain updates
                setStats(prevStats => ({
                    ...prevStats,
                    blockHeight: prevStats.blockHeight + Math.floor(Math.random() * 3),
                    totalTransactions: prevStats.totalTransactions + Math.floor(Math.random() * 50) + 10,
                    activeAddresses: prevStats.activeAddresses + Math.floor(Math.random() * 20) - 10
                }))

                // Update AI metrics in real-time
                setAiMetrics(prevMetrics => ({
                    computeJobs: prevMetrics.computeJobs + Math.floor(Math.random() * 10) + 1,
                    avgProcessingTime: (2.1 + Math.random() * 0.8).toFixed(1) + 's',
                    aiRevenue: (247892 + Math.floor(Math.random() * 100)).toLocaleString() + ' KODEX',
                    activeModels: prevMetrics.activeModels + Math.floor(Math.random() * 5) - 2
                }))

                // Update cross-chain bridge transactions
                setCrossChainBridges(prevBridges =>
                    prevBridges.map(bridge => ({
                        ...bridge,
                        transactions24h: bridge.status === 'active' ?
                            bridge.transactions24h + Math.floor(Math.random() * 10) : 0
                    }))
                )

                // Update validator uptimes
                setValidators(prevValidators =>
                    prevValidators.map(validator => ({
                        ...validator,
                        uptime: validator.status === 'active' ?
                            Math.min(99.9, validator.uptime + (Math.random() - 0.5) * 0.1) :
                            validator.uptime
                    }))
                )

                // Update API usage statistics
                setDeveloperAPIs(prevAPIs =>
                    prevAPIs.map(api => ({
                        ...api,
                        usage: api.usage + Math.floor(Math.random() * 5) + 1
                    }))
                )

                setLastUpdate(new Date())

                // Random network status simulation
                const statuses: ('online' | 'degraded' | 'offline')[] = ['online', 'online', 'online', 'degraded']
                setNetworkStatus(statuses[Math.floor(Math.random() * statuses.length)])
            }, 3000) // Update every 3 seconds
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isLiveMode])

    const toggleLiveMode = () => {
        setIsLiveMode(!isLiveMode)
    }

    const manualRefresh = () => {
        setStats(prevStats => ({
            ...prevStats,
            blockHeight: prevStats.blockHeight + 1,
            totalTransactions: prevStats.totalTransactions + Math.floor(Math.random() * 20) + 5
        }))
        setLastUpdate(new Date())
    }

    const recentBlocks = [
        { number: stats.blockHeight, timestamp: isLiveMode ? 'just now' : '12 seconds ago', transactions: 156 + Math.floor(Math.random() * 50), size: '892 KB', miner: '0x7a2...b5c' },
        { number: stats.blockHeight - 1, timestamp: isLiveMode ? '15 seconds ago' : '24 seconds ago', transactions: 203 + Math.floor(Math.random() * 30), size: '1.2 MB', miner: '0x9f1...d3e' },
        { number: stats.blockHeight - 2, timestamp: isLiveMode ? '28 seconds ago' : '36 seconds ago', transactions: 89 + Math.floor(Math.random() * 40), size: '567 KB', miner: '0x3c4...f7a' },
        { number: stats.blockHeight - 3, timestamp: isLiveMode ? '41 seconds ago' : '48 seconds ago', transactions: 312 + Math.floor(Math.random() * 25), size: '1.8 MB', miner: '0x1e6...8b2' }
    ]

    const recentTransactions = [
        { hash: '0xa1b2c3d4...', from: '0x1234...5678', to: '0x9876...5432', value: `${(125.50 + Math.random() * 10).toFixed(2)} KODEX`, status: Math.random() > 0.1 ? 'Success' : 'Pending' },
        { hash: '0xe5f6g7h8...', from: '0xabcd...efgh', to: '0x5678...1234', value: `${(45.20 + Math.random() * 5).toFixed(2)} KODEX`, status: 'Success' },
        { hash: '0x9i0j1k2l...', from: '0x9999...8888', to: '0x7777...6666', value: `${(892.75 + Math.random() * 50).toFixed(2)} KODEX`, status: Math.random() > 0.8 ? 'Pending' : 'Success' },
        { hash: '0x3m4n5o6p...', from: '0x2222...3333', to: '0x4444...5555', value: `${(12.80 + Math.random() * 3).toFixed(2)} KODEX`, status: 'Success' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-lg">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">CodaiChain Explorer</h1>
                            <p className="text-slate-600">Blockchain Explorer for the KODEX Network</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${networkStatus === 'online' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                            networkStatus === 'degraded' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                                'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}>
                            <Activity className="mr-1 h-3 w-3" />
                            Network {networkStatus === 'online' ? 'Online' : networkStatus === 'degraded' ? 'Degraded' : 'Offline'}
                        </Badge>
                        <Badge variant="outline">Block #{stats.blockHeight.toLocaleString()}</Badge>
                        <Badge variant="outline">KODEX $0.87</Badge>

                        {/* Real-time Controls */}
                        <div className="flex items-center gap-2 ml-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={toggleLiveMode}
                                className={`${isLiveMode ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50'}`}
                            >
                                {isLiveMode ? (
                                    <>
                                        <Zap className="mr-1 h-3 w-3" />
                                        Live
                                    </>
                                ) : (
                                    <>
                                        <Pause className="mr-1 h-3 w-3" />
                                        Paused
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={manualRefresh}
                                disabled={isLiveMode}
                            >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Refresh
                            </Button>
                            <span className="text-xs text-slate-500">
                                Last update: {lastUpdate.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Blockchain Search */}
                <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-blue-600" />
                                <h2 className="text-lg font-semibold text-slate-900">Blockchain Search</h2>
                            </div>

                            <div className="flex flex-col gap-3 md:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by block number, transaction hash, or address..."
                                            className="w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <select
                                        value={searchType}
                                        onChange={(e) => setSearchType(e.target.value)}
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    >
                                        <option value="all">All</option>
                                        <option value="blocks">Blocks</option>
                                        <option value="transactions">Transactions</option>
                                        <option value="addresses">Addresses</option>
                                    </select>

                                    <Button
                                        onClick={() => {
                                            setIsSearching(true)
                                            // Simulate search
                                            setTimeout(() => setIsSearching(false), 1000)
                                        }}
                                        disabled={!searchQuery.trim() || isSearching}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6"
                                    >
                                        {isSearching ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                Searching
                                            </>
                                        ) : (
                                            <>
                                                <Search className="mr-2 h-4 w-4" />
                                                Search
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Quick Search Options */}
                            <div className="flex flex-wrap gap-2">
                                <span className="text-xs text-slate-500">Quick search:</span>
                                <button
                                    onClick={() => setSearchQuery('2847392')}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                >
                                    Latest Block
                                </button>
                                <button
                                    onClick={() => setSearchQuery('0xa1b2c3d4')}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                >
                                    Recent TX
                                </button>
                                <button
                                    onClick={() => setSearchQuery('0x1234...5678')}
                                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                                >
                                    Sample Address
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Navigation Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-slate-200">
                    <Button variant="ghost" className="bg-blue-50 text-blue-700 border-b-2 border-blue-600">
                        <Globe className="mr-2 h-4 w-4" />
                        Dashboard
                    </Button>
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                        <Activity className="mr-2 h-4 w-4" />
                        Blocks
                    </Button>
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Transactions
                    </Button>
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                        <Wallet className="mr-2 h-4 w-4" />
                        Addresses
                    </Button>
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                        <Hash className="mr-2 h-4 w-4" />
                        KODEX Token
                    </Button>
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Block Height</CardTitle>
                            <div className="flex items-center gap-1">
                                <Activity className="h-4 w-4 text-blue-600" />
                                {isLiveMode && <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.blockHeight.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Latest block</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Transactions</CardTitle>
                            <div className="flex items-center gap-1">
                                <ArrowRight className="h-4 w-4 text-indigo-600" />
                                {isLiveMode && <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalTransactions.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">All time</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Addresses</CardTitle>
                            <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-green-600" />
                                {isLiveMode && <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.activeAddresses.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">24h active</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">KODEX Supply</CardTitle>
                            <Code className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalSupply}</div>
                            <p className="text-xs text-slate-500">Total supply</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Market Cap</CardTitle>
                            <BarChart3 className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.marketCap}</div>
                            <p className="text-xs text-slate-500">USD value</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Avg Block Time</CardTitle>
                            <Activity className="h-4 w-4 text-rose-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.avgBlockTime}</div>
                            <p className="text-xs text-slate-500">Block interval</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Blocks */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Latest Blocks
                            </CardTitle>
                            <CardDescription>Recently mined blocks on CodaiChain</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentBlocks.map((block, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 text-sm font-mono">
                                            #{block.number.toString().slice(-3)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">Block #{block.number.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">{block.transactions} txns • {block.size} • {block.timestamp}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Miner</p>
                                        <p className="text-sm font-mono text-slate-900">{block.miner}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowRight className="h-5 w-5 text-indigo-600" />
                                Latest Transactions
                            </CardTitle>
                            <CardDescription>Recent transactions on the network</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentTransactions.map((tx, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-mono text-sm text-slate-900">{tx.hash}</p>
                                            <p className="text-xs text-slate-500">{tx.from} → {tx.to}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-900">{tx.value}</p>
                                        <Badge variant={tx.status === 'Success' ? 'default' : 'secondary'}
                                            className={tx.status === 'Success' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                            {tx.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Advanced Action Buttons */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg h-auto p-4 flex-col gap-2">
                            <Search className="h-6 w-6" />
                            <div className="text-center">
                                <div className="font-semibold">Advanced Search</div>
                                <div className="text-xs opacity-90">Multi-parameter search</div>
                            </div>
                        </Button>
                        <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-auto p-4 flex-col gap-2">
                            <Activity className="h-6 w-6 text-blue-600" />
                            <div className="text-center">
                                <div className="font-semibold">Live Blocks</div>
                                <div className="text-xs text-slate-500">Real-time monitoring</div>
                                {isLiveMode && <div className="mt-1 h-1 w-8 bg-green-500 rounded-full animate-pulse mx-auto" />}
                            </div>
                        </Button>
                        <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-auto p-4 flex-col gap-2">
                            <ArrowRight className="h-6 w-6 text-indigo-600" />
                            <div className="text-center">
                                <div className="font-semibold">TX Monitor</div>
                                <div className="text-xs text-slate-500">Transaction tracking</div>
                                {isLiveMode && <div className="mt-1 h-1 w-8 bg-blue-500 rounded-full animate-pulse mx-auto" />}
                            </div>
                        </Button>
                        <Button variant="outline" className="border-slate-200 hover:bg-slate-50 h-auto p-4 flex-col gap-2">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                            <div className="text-center">
                                <div className="font-semibold">Network Stats</div>
                                <div className="text-xs text-slate-500">Performance metrics</div>
                            </div>
                        </Button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex flex-wrap gap-3">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                            <Wallet className="mr-2 h-3 w-3" />
                            Address Lookup
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                            <Hash className="mr-2 h-3 w-3" />
                            KODEX Analytics
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                            <Filter className="mr-2 h-3 w-3" />
                            Advanced Filters
                        </Button>
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                            <Target className="mr-2 h-3 w-3" />
                            Validator Info
                        </Button>
                    </div>
                </div>

                {/* Phase 5: Advanced Blockchain Features */}

                {/* AI Integration & Metrics */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="h-5 w-5 text-purple-600" />
                            AI-Powered Blockchain Metrics
                        </CardTitle>
                        <CardDescription>Real-time AI computation and intelligence metrics on CodaiChain</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                                    <Cpu className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">AI Compute Jobs</p>
                                    <p className="text-xl font-bold text-slate-900">{aiMetrics.computeJobs.toLocaleString()}</p>
                                    {isLiveMode && <div className="h-1 w-12 bg-purple-500 rounded-full animate-pulse" />}
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                                    <Clock className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Avg Processing</p>
                                    <p className="text-xl font-bold text-slate-900">{aiMetrics.avgProcessingTime}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">AI Revenue</p>
                                    <p className="text-xl font-bold text-slate-900">{aiMetrics.aiRevenue}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                                    <Layers className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Active Models</p>
                                    <p className="text-xl font-bold text-slate-900">{aiMetrics.activeModels.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cross-Chain Bridge Status & Validator Network */}
                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Cross-Chain Bridges */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Link className="h-5 w-5 text-indigo-600" />
                                Cross-Chain Bridges
                            </CardTitle>
                            <CardDescription>Inter-blockchain connectivity and liquidity</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {crossChainBridges.map((bridge, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                                            <Link className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{bridge.chain}</p>
                                            <p className="text-xs text-slate-500">{bridge.totalLocked} locked</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={bridge.status === 'active' ? 'default' : bridge.status === 'paused' ? 'secondary' : 'destructive'}
                                            className={
                                                bridge.status === 'active' ? 'bg-green-100 text-green-700' :
                                                    bridge.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                            }>
                                            {bridge.status === 'active' && <CheckCircle className="mr-1 h-3 w-3" />}
                                            {bridge.status === 'maintenance' && <AlertTriangle className="mr-1 h-3 w-3" />}
                                            {bridge.status}
                                        </Badge>
                                        <p className="text-sm text-slate-900 mt-1">{bridge.transactions24h.toLocaleString()} txns/24h</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Validator Network */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-green-600" />
                                Validator Network
                            </CardTitle>
                            <CardDescription>Proof-of-Intelligence consensus validators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {validators.map((validator, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                                            <Shield className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{validator.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{validator.address}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={validator.status === 'active' ? 'default' : 'destructive'}
                                                className={validator.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                {validator.status}
                                            </Badge>
                                            <span className="text-sm font-medium">{validator.uptime.toFixed(1)}%</span>
                                        </div>
                                        <p className="text-xs text-slate-500">{validator.stake} • {validator.commission} fee</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Developer Tools & API Documentation */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-slate-600" />
                            Developer API & Tools
                        </CardTitle>
                        <CardDescription>Production-ready APIs for blockchain integration</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                    <Server className="h-4 w-4" />
                                    API Endpoints
                                </h4>
                                {developerAPIs.map((api, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 rounded border border-slate-200">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs font-mono">{api.method}</Badge>
                                                <code className="text-xs text-blue-600">{api.endpoint}</code>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1">{api.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-900">{api.usage.toLocaleString()}</p>
                                            <p className="text-xs text-slate-500">requests/24h</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-slate-900 flex items-center gap-2">
                                    <Network className="h-4 w-4" />
                                    Integration Tools
                                </h4>
                                <div className="space-y-2">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Code className="mr-2 h-4 w-4" />
                                        SDK Documentation
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Users className="mr-2 h-4 w-4" />
                                        Developer Console
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Analytics Dashboard
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Database className="mr-2 h-4 w-4" />
                                        GraphQL Playground
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>CodaiChain Explorer - Blockchain Explorer for the KODEX Network</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                                <Activity className="mr-1 h-3 w-3" />
                                Network Online
                            </Badge>
                            <p>Block #{stats.blockHeight.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

