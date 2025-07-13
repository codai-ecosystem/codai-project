/**
 * ExplorerDashboard - Comprehensive Blockchain Explorer Dashboard
 * Advanced dashboard with real-time blockchain data, network analytics, and DeFi insights
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Blocks,
    Users,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Zap,
    Clock,
    Database,
    Network,
    Shield,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Hash,
    Send,
    Coins,
    PieChart,
    BarChart3,
    LineChart,
    RefreshCw,
    ExternalLink,
    Copy,
    Eye,
    Star,
    AlertTriangle,
    CheckCircle,
    Info,
    Filter,
    Calendar,
    Search,
    ChevronRight,
    Cpu,
    HardDrive,
    Globe
} from 'lucide-react';
import {
    explorerService,
    Block,
    Transaction,
    NetworkStats,
    DeFiProtocol,
    AnalyticsData
} from '../lib/ExplorerService';

interface MetricCard {
    id: string;
    title: string;
    value: string | number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    icon: any;
    color: string;
    description?: string;
    unit?: string;
}

const ExplorerDashboard: React.FC = () => {
    // State Management
    const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
    const [latestBlocks, setLatestBlocks] = useState<Block[]>([]);
    const [latestTransactions, setLatestTransactions] = useState<Transaction[]>([]);
    const [defiProtocols, setDefiProtocols] = useState<DeFiProtocol[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [timeframe, setTimeframe] = useState('24h');
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Initialize Dashboard
    useEffect(() => {
        initializeDashboard();
        setupRealTimeUpdates();

        return () => {
            cleanup();
        };
    }, [timeframe]);

    const initializeDashboard = async () => {
        setIsLoading(true);
        try {
            const [stats, blocks, protocols, analyticsData] = await Promise.all([
                explorerService.getNetworkStats(),
                explorerService.getLatestBlocks(10),
                explorerService.getDeFiProtocols(),
                explorerService.getAnalytics(timeframe)
            ]);

            setNetworkStats(stats);
            setLatestBlocks(blocks);
            setDefiProtocols(protocols.slice(0, 6)); // Top 6 protocols
            setAnalytics(analyticsData);

            // Generate mock transactions
            const mockTxs = blocks.slice(0, 5).flatMap(block =>
                block.transactions.slice(0, 3).map(hash => ({
                    hash,
                    blockNumber: block.number,
                    blockHash: block.hash,
                    timestamp: block.timestamp,
                    from: generateAddress(),
                    to: generateAddress(),
                    value: (Math.random() * 10).toFixed(6),
                    gasPrice: (Math.random() * 100 + 20).toFixed(9),
                    gasLimit: '21000',
                    gasUsed: '21000',
                    nonce: Math.floor(Math.random() * 1000),
                    input: '0x',
                    status: Math.random() > 0.05 ? 'success' : 'failed',
                    type: 2,
                    logs: [],
                    isContractCreation: false,
                    internalTransactions: []
                } as Transaction))
            );
            setLatestTransactions(mockTxs.slice(0, 10));

            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setupRealTimeUpdates = () => {
        if (!autoRefresh) return;

        const interval = setInterval(async () => {
            try {
                const stats = await explorerService.getNetworkStats();
                setNetworkStats(stats);
                setLastUpdated(new Date());
            } catch (error) {
                console.error('Failed to fetch real-time data:', error);
            }
        }, 30000); // Update every 30 seconds

        return () => clearInterval(interval);
    };

    const cleanup = () => {
        // Clean up subscriptions
    };

    // Helper Functions
    const generateAddress = (): string => {
        return '0x' + Array.from({ length: 40 }, () =>
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    };

    const formatNumber = (num: number): string => {
        if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toLocaleString();
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact'
        }).format(amount);
    };

    const formatTimeAgo = (timestamp: number): string => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    const truncateHash = (hash: string, start: number = 6, end: number = 4): string => {
        return `${hash.slice(0, start)}...${hash.slice(-end)}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Show toast notification in a real app
    };

    // Generate Metrics
    const getMetrics = (): MetricCard[] => {
        if (!networkStats) return [];

        return [
            {
                id: 'block-height',
                title: 'Latest Block',
                value: networkStats.blockHeight.toLocaleString(),
                change: 0.1,
                trend: 'up',
                icon: Blocks,
                color: 'blue',
                description: 'Current block height'
            },
            {
                id: 'transactions',
                title: 'Total Transactions',
                value: formatNumber(networkStats.totalTransactions),
                change: 2.3,
                trend: 'up',
                icon: Send,
                color: 'emerald',
                description: 'All-time transaction count'
            },
            {
                id: 'addresses',
                title: 'Total Addresses',
                value: formatNumber(networkStats.totalAddresses),
                change: 1.8,
                trend: 'up',
                icon: Users,
                color: 'purple',
                description: 'Unique address count'
            },
            {
                id: 'market-cap',
                title: 'Market Cap',
                value: formatCurrency(networkStats.marketCap),
                change: networkStats.priceChange24h,
                trend: networkStats.priceChange24h >= 0 ? 'up' : 'down',
                icon: DollarSign,
                color: 'orange',
                description: 'Total market capitalization'
            },
            {
                id: 'gas-price',
                title: 'Gas Price',
                value: networkStats.gasPrice.standard,
                change: -5.2,
                trend: 'down',
                icon: Zap,
                color: 'yellow',
                description: 'Standard gas price',
                unit: 'gwei'
            },
            {
                id: 'pending-txs',
                title: 'Pending Txs',
                value: formatNumber(networkStats.pendingTransactions),
                change: 12.5,
                trend: 'up',
                icon: Clock,
                color: 'red',
                description: 'Transactions in mempool'
            }
        ];
    };

    // Event Handlers
    const handleMetricClick = (metricId: string) => {
        setSelectedMetric(selectedMetric === metricId ? null : metricId);
    };

    const handleRefresh = () => {
        initializeDashboard();
    };

    const toggleAutoRefresh = () => {
        setAutoRefresh(!autoRefresh);
    };

    if (isLoading) {
        return (
            <div className="min-h-[600px] flex items-center justify-center">
                <motion.div
                    className="text-center space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full mx-auto"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-gray-400">Loading blockchain data...</p>
                </motion.div>
            </div>
        );
    }

    const metrics = getMetrics();

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Blockchain Explorer
                    </h1>
                    <p className="text-gray-400 mt-1">
                        Real-time blockchain analytics and network insights
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                        {autoRefresh && (
                            <motion.div
                                className="w-2 h-2 bg-green-400 rounded-full"
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Auto Refresh Toggle */}
                    <motion.button
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'
                            }`}
                        onClick={toggleAutoRefresh}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                        <span className="text-sm">Auto</span>
                    </motion.button>

                    {/* Manual Refresh */}
                    <motion.button
                        className="p-2 bg-gray-800 hover:bg-blue-500/20 rounded-lg transition-colors"
                        onClick={handleRefresh}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <RefreshCw className="w-4 h-4 text-gray-400" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Network Status Bar */}
            {networkStats && (
                <motion.div
                    className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-white font-medium">Network Online</span>
                            </div>
                            <div className="text-blue-400 font-medium">
                                Block #{networkStats.blockHeight.toLocaleString()}
                            </div>
                            <div className="text-purple-400 font-medium">
                                {networkStats.pendingTransactions.toLocaleString()} pending
                            </div>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                            <div className="text-gray-300">
                                Price: <span className="text-blue-400 font-medium">
                                    {formatCurrency(networkStats.price)}
                                </span>
                                <span className={`ml-1 ${networkStats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    ({networkStats.priceChange24h >= 0 ? '+' : ''}{networkStats.priceChange24h.toFixed(2)}%)
                                </span>
                            </div>
                            <div className="text-gray-300">
                                Volume: <span className="text-purple-400 font-medium">
                                    {formatCurrency(networkStats.volume24h)}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Metrics Grid */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {metrics.map((metric, index) => {
                    const IconComponent = metric.icon;
                    const trendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingDown : Minus;
                    const trendColor = metric.trend === 'up' ? 'text-green-400' : metric.trend === 'down' ? 'text-red-400' : 'text-gray-400';
                    const changeColor = metric.change > 0 ? 'text-green-400' : metric.change < 0 ? 'text-red-400' : 'text-gray-400';

                    return (
                        <motion.div
                            key={metric.id}
                            className={`relative bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 cursor-pointer transition-all duration-300 overflow-hidden ${selectedMetric === metric.id ? 'ring-2 ring-blue-500/50 border-blue-500/50' : 'hover:border-blue-500/30'
                                }`}
                            onClick={() => handleMetricClick(metric.id)}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -4, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br from-${metric.color}-500/10 to-transparent opacity-50`} />

                            {/* Content */}
                            <div className="relative">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl bg-${metric.color}-500/20`}>
                                        <IconComponent className={`w-6 h-6 text-${metric.color}-400`} />
                                    </div>
                                    <motion.div
                                        className={`flex items-center space-x-1 ${trendColor}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {React.createElement(trendIcon, { className: 'w-4 h-4' })}
                                        <span className={`text-sm font-medium ${changeColor}`}>
                                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                                        </span>
                                    </motion.div>
                                </div>

                                {/* Value */}
                                <motion.div
                                    className="space-y-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="text-2xl font-bold text-white flex items-end space-x-1">
                                        <span>{metric.value}</span>
                                        {metric.unit && <span className="text-lg text-gray-400">{metric.unit}</span>}
                                    </h3>
                                    <p className="text-gray-300 font-medium">{metric.title}</p>
                                    {metric.description && (
                                        <p className="text-gray-400 text-sm">{metric.description}</p>
                                    )}
                                </motion.div>
                            </div>

                            {/* Selection Indicator */}
                            <AnimatePresence>
                                {selectedMetric === metric.id && (
                                    <motion.div
                                        className="absolute top-2 right-2 w-3 h-3 bg-blue-400 rounded-full"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    />
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest Blocks */}
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Blocks className="w-5 h-5 text-blue-400" />
                            <span>Latest Blocks</span>
                        </h3>
                        <motion.button
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {latestBlocks.slice(0, 5).map((block, index) => (
                            <motion.div
                                key={block.hash}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                        <Hash className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">#{block.number.toLocaleString()}</p>
                                        <p className="text-gray-400 text-sm">{formatTimeAgo(block.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-emerald-400 font-medium">{block.transactionCount} txs</p>
                                    <p className="text-gray-400 text-sm">{(parseFloat(block.size) / 1024).toFixed(1)} KB</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Latest Transactions */}
                <motion.div
                    className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                            <Send className="w-5 h-5 text-purple-400" />
                            <span>Latest Transactions</span>
                        </h3>
                        <motion.button
                            className="text-purple-400 hover:text-purple-300 transition-colors"
                            whileHover={{ scale: 1.05 }}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </motion.button>
                    </div>

                    <div className="space-y-3">
                        {latestTransactions.slice(0, 5).map((tx, index) => (
                            <motion.div
                                key={tx.hash}
                                className="flex items-center justify-between p-3 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                whileHover={{ x: 4 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.status === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                                        }`}>
                                        {tx.status === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-green-400" />
                                        ) : (
                                            <AlertTriangle className="w-5 h-5 text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium font-mono text-sm">
                                            {truncateHash(tx.hash)}
                                        </p>
                                        <p className="text-gray-400 text-sm">{formatTimeAgo(tx.timestamp)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-blue-400 font-medium">{parseFloat(tx.value).toFixed(4)} ETH</p>
                                    <p className="text-gray-400 text-sm">{parseFloat(tx.gasPrice).toFixed(0)} gwei</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* DeFi Protocols */}
            <motion.div
                className="bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <PieChart className="w-5 h-5 text-cyan-400" />
                        <span>Top DeFi Protocols</span>
                    </h3>
                    <motion.button
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                        whileHover={{ scale: 1.05 }}
                    >
                        <ExternalLink className="w-4 h-4" />
                    </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {defiProtocols.map((protocol, index) => (
                        <motion.div
                            key={protocol.id}
                            className="p-4 rounded-xl bg-gray-700/30 hover:bg-gray-700/50 transition-colors cursor-pointer"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            whileHover={{ y: -2 }}
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                        {protocol.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{protocol.name}</h4>
                                    <p className="text-gray-400 text-sm">{protocol.category}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">TVL</span>
                                    <span className="text-cyan-400 font-medium">
                                        {formatCurrency(protocol.tvl)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">24h Change</span>
                                    <span className={`font-medium ${protocol.tvlChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {protocol.tvlChange24h >= 0 ? '+' : ''}{protocol.tvlChange24h.toFixed(2)}%
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default ExplorerDashboard;
