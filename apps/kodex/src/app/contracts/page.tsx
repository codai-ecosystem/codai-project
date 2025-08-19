'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Code,
    Play,
    Pause,
    Edit,
    Eye,
    Download,
    Upload,
    Search,
    Filter,
    CheckCircle,
    AlertCircle,
    Clock,
    Shield,
    Zap,
    Users,
    FileText,
    GitBranch,
    Settings,
    Activity,
    Cpu,
    Database,
    Network,
    TrendingUp,
    DollarSign
} from 'lucide-react'

interface SmartContract {
    address: string
    name: string
    type: 'defi' | 'nft' | 'dao' | 'ai_compute' | 'bridge' | 'utility'
    status: 'active' | 'paused' | 'deprecated' | 'draft'
    version: string
    deployedBy: string
    deployedAt: string
    transactions: number
    balance: string
    gasUsed: string
    verified: boolean
}

interface ContractStats {
    totalContracts: number
    activeContracts: number
    totalTransactions: number
    totalValue: string
    averageGas: string
    verificationRate: string
}

interface DeploymentTemplate {
    id: string
    name: string
    description: string
    category: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    estimatedGas: string
    features: string[]
}

export default function SmartContractsPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedContract, setSelectedContract] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'deployed' | 'templates' | 'deploy'>('deployed')
    const [filter, setFilter] = useState({
        type: 'all',
        status: 'all',
        verified: 'all'
    })

    const contractStats: ContractStats = {
        totalContracts: 14782,
        activeContracts: 12456,
        totalTransactions: 892456,
        totalValue: '127.3M KODEX',
        averageGas: '45,000',
        verificationRate: '87.5%'
    }

    const smartContracts: SmartContract[] = [
        {
            address: '0x1234567890abcdef1234567890abcdef12345678',
            name: 'KodexDEX AMM',
            type: 'defi',
            status: 'active',
            version: '2.1.0',
            deployedBy: '0x742d35Cc6...891011',
            deployedAt: '2024-01-15',
            transactions: 45672,
            balance: '2.5M KODEX',
            gasUsed: '1.2M',
            verified: true
        },
        {
            address: '0x2345678901bcdef1234567890abcdef123456789',
            name: 'AI Compute Pool',
            type: 'ai_compute',
            status: 'active',
            version: '1.8.3',
            deployedBy: '0x567890abcd...ef1234',
            deployedAt: '2024-01-20',
            transactions: 12389,
            balance: '875K KODEX',
            gasUsed: '456K',
            verified: true
        },
        {
            address: '0x3456789012cdef1234567890abcdef1234567890',
            name: 'Governance DAO',
            type: 'dao',
            status: 'active',
            version: '3.0.1',
            deployedBy: '0xabcdef1234...567890',
            deployedAt: '2024-01-10',
            transactions: 8945,
            balance: '1.8M KODEX',
            gasUsed: '234K',
            verified: true
        },
        {
            address: '0x4567890123def1234567890abcdef12345678901',
            name: 'Cross-Chain Bridge',
            type: 'bridge',
            status: 'active',
            version: '1.5.2',
            deployedBy: '0x234567890a...bcdef1',
            deployedAt: '2024-01-25',
            transactions: 6734,
            balance: '3.2M KODEX',
            gasUsed: '789K',
            verified: true
        },
        {
            address: '0x5678901234ef1234567890abcdef123456789012',
            name: 'NFT Marketplace',
            type: 'nft',
            status: 'paused',
            version: '2.2.1',
            deployedBy: '0x890abcdef1...234567',
            deployedAt: '2024-01-05',
            transactions: 23456,
            balance: '567K KODEX',
            gasUsed: '345K',
            verified: false
        }
    ]

    const deploymentTemplates: DeploymentTemplate[] = [
        {
            id: 'erc20-token',
            name: 'ERC-20 Token',
            description: 'Standard fungible token contract with basic functionality',
            category: 'tokens',
            difficulty: 'beginner',
            estimatedGas: '1.2M',
            features: ['Minting', 'Burning', 'Transfers', 'Allowances']
        },
        {
            id: 'nft-collection',
            name: 'NFT Collection',
            description: 'ERC-721 compatible NFT contract with metadata support',
            category: 'nft',
            difficulty: 'intermediate',
            estimatedGas: '2.1M',
            features: ['Minting', 'Metadata', 'Royalties', 'Batch Operations']
        },
        {
            id: 'dao-governance',
            name: 'DAO Governance',
            description: 'Decentralized governance contract with voting mechanisms',
            category: 'governance',
            difficulty: 'advanced',
            estimatedGas: '3.5M',
            features: ['Proposals', 'Voting', 'Execution', 'Treasury Management']
        },
        {
            id: 'ai-compute-pool',
            name: 'AI Compute Pool',
            description: 'Distributed AI computation marketplace contract',
            category: 'ai',
            difficulty: 'advanced',
            estimatedGas: '4.2M',
            features: ['Resource Allocation', 'Payment Distribution', 'Quality Assurance', 'Reputation System']
        }
    ]

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'defi': return <DollarSign className="w-4 h-4 text-green-500" />
            case 'nft': return <FileText className="w-4 h-4 text-purple-500" />
            case 'dao': return <Users className="w-4 h-4 text-blue-500" />
            case 'ai_compute': return <Cpu className="w-4 h-4 text-orange-500" />
            case 'bridge': return <GitBranch className="w-4 h-4 text-indigo-500" />
            case 'utility': return <Settings className="w-4 h-4 text-gray-500" />
            default: return <Code className="w-4 h-4 text-gray-500" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'defi': return 'bg-green-100 text-green-700'
            case 'nft': return 'bg-purple-100 text-purple-700'
            case 'dao': return 'bg-blue-100 text-blue-700'
            case 'ai_compute': return 'bg-orange-100 text-orange-700'
            case 'bridge': return 'bg-indigo-100 text-indigo-700'
            case 'utility': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />
            case 'deprecated': return <AlertCircle className="w-4 h-4 text-red-500" />
            case 'draft': return <Clock className="w-4 h-4 text-gray-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700'
            case 'paused': return 'bg-yellow-100 text-yellow-700'
            case 'deprecated': return 'bg-red-100 text-red-700'
            case 'draft': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'beginner': return 'bg-green-100 text-green-700'
            case 'intermediate': return 'bg-yellow-100 text-yellow-700'
            case 'advanced': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white py-4 px-6 shadow-xl"
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 bg-white/20 rounded-lg backdrop-blur-sm hover:bg-white/30 transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Code className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Smart Contracts</h1>
                                    <p className="text-indigo-100">Deploy and manage blockchain contracts</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Upload className="w-4 h-4" />
                                <span>Deploy Contract</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Contract Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Code className="w-5 h-5 text-blue-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{contractStats.totalContracts.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Contracts</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{contractStats.activeContracts.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Active Contracts</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Activity className="w-5 h-5 text-purple-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{contractStats.totalTransactions.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Transactions</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <DollarSign className="w-5 h-5 text-yellow-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{contractStats.totalValue}</p>
                        <p className="text-sm text-gray-600">Total Value</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Zap className="w-5 h-5 text-orange-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{contractStats.averageGas}</p>
                        <p className="text-sm text-gray-600">Average Gas</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <Shield className="w-5 h-5 text-indigo-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{contractStats.verificationRate}</p>
                        <p className="text-sm text-gray-600">Verified</p>
                    </div>
                </motion.div>

                {/* Navigation Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl p-2 shadow-lg mb-8"
                >
                    <div className="flex space-x-1">
                        {[
                            { id: 'deployed', label: 'Deployed Contracts', icon: Database },
                            { id: 'templates', label: 'Contract Templates', icon: FileText },
                            { id: 'deploy', label: 'Deploy New', icon: Upload }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Content based on active tab */}
                {activeTab === 'deployed' && (
                    <>
                        {/* Search and Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8"
                        >
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search by contract name, address, or type..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <select
                                        value={filter.type}
                                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="defi">DeFi</option>
                                        <option value="nft">NFT</option>
                                        <option value="dao">DAO</option>
                                        <option value="ai_compute">AI Compute</option>
                                        <option value="bridge">Bridge</option>
                                        <option value="utility">Utility</option>
                                    </select>
                                    <select
                                        value={filter.status}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="paused">Paused</option>
                                        <option value="deprecated">Deprecated</option>
                                        <option value="draft">Draft</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* Smart Contracts List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-xl font-bold text-gray-900">Deployed Smart Contracts</h2>
                                <p className="text-gray-600">Manage and monitor your deployed contracts</p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Contract</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Type</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Status</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Transactions</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Balance</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Gas Used</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Verified</th>
                                            <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {smartContracts.map((contract, index) => (
                                            <motion.tr
                                                key={contract.address}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-medium text-gray-900">{contract.name}</div>
                                                        <div className="text-sm text-gray-600 font-mono">{truncateAddress(contract.address)}</div>
                                                        <div className="text-xs text-gray-500">v{contract.version}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contract.type)}`}>
                                                        {getTypeIcon(contract.type)}
                                                        <span className="capitalize">{contract.type.replace('_', ' ')}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                                                        {getStatusIcon(contract.status)}
                                                        <span className="capitalize">{contract.status}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-900">{contract.transactions.toLocaleString()}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-medium text-gray-900">{contract.balance}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm text-gray-600">{contract.gasUsed}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {contract.verified ? (
                                                        <div className="flex items-center space-x-1 text-green-600">
                                                            <Shield className="w-4 h-4" />
                                                            <span className="text-sm">Verified</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1 text-gray-400">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <span className="text-sm">Unverified</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-2">
                                                        <button className="text-indigo-600 hover:text-indigo-700 p-1">
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-600 hover:text-gray-700 p-1">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="text-gray-600 hover:text-gray-700 p-1">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </>
                )}

                {activeTab === 'templates' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {deploymentTemplates.map((template, index) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.1 }}
                                className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <Code className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{template.name}</h3>
                                            <p className="text-sm text-gray-600 capitalize">{template.category}</p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(template.difficulty)}`}>
                                        {template.difficulty}
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4">{template.description}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Est. Gas:</span>
                                        <span className="font-medium text-gray-900">{template.estimatedGas}</span>
                                    </div>

                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                                        <div className="flex flex-wrap gap-1">
                                            {template.features.map((feature, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                                >
                                                    {feature}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                                        <Play className="w-4 h-4" />
                                        <span>Deploy Template</span>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {activeTab === 'deploy' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="p-4 bg-indigo-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                                <Upload className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deploy New Contract</h2>
                            <p className="text-gray-600 mb-8">
                                Deploy a new smart contract to the KodexChain network. Choose from templates or upload your own contract code.
                            </p>
                            <div className="space-y-4">
                                <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center justify-center space-x-2">
                                    <FileText className="w-5 h-5" />
                                    <span>Choose Template</span>
                                </button>
                                <button className="w-full px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors flex items-center justify-center space-x-2">
                                    <Upload className="w-5 h-5" />
                                    <span>Upload Contract Code</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
