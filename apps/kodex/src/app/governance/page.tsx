'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Vote,
    Users,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    TrendingUp,
    Plus,
    Eye,
    MessageSquare,
    Award,
    Settings,
    BarChart3,
    Activity,
    Calendar,
    Search,
    Filter,
    Zap,
    Shield,
    DollarSign,
    AlertCircle
} from 'lucide-react'

interface Proposal {
    id: number
    title: string
    description: string
    type: 'text' | 'parameter_change' | 'software_upgrade' | 'community_spend'
    status: 'voting' | 'passed' | 'rejected' | 'deposit' | 'failed'
    proposer: string
    submitTime: string
    votingEndTime: string
    deposit: string
    totalVotes: number
    yesVotes: string
    noVotes: string
    abstainVotes: string
    vetoVotes: string
    participation: string
    quorum: string
}

interface GovernanceStats {
    totalProposals: number
    activeProposals: number
    passedProposals: number
    totalVoters: number
    averageParticipation: string
    totalStakeVoting: string
}

interface VotingPower {
    userStake: string
    delegatedStake: string
    totalVotingPower: string
    participationRewards: string
}

export default function GovernancePage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProposal, setSelectedProposal] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState<'proposals' | 'voting' | 'create'>('proposals')
    const [filter, setFilter] = useState({
        status: 'all',
        type: 'all'
    })

    const governanceStats: GovernanceStats = {
        totalProposals: 847,
        activeProposals: 12,
        passedProposals: 623,
        totalVoters: 18456,
        averageParticipation: '67.3%',
        totalStakeVoting: '523.7M KODEX'
    }

    const votingPower: VotingPower = {
        userStake: '50,000 KODEX',
        delegatedStake: '125,000 KODEX',
        totalVotingPower: '175,000 KODEX',
        participationRewards: '1,247 KODEX'
    }

    const proposals: Proposal[] = [
        {
            id: 142,
            title: 'KodexChain 2.0 Network Upgrade',
            description: 'Proposal to upgrade the network to version 2.0 with enhanced AI computation capabilities, improved consensus mechanism, and reduced transaction fees.',
            type: 'software_upgrade',
            status: 'voting',
            proposer: 'kodex1qw2eh...7x9k',
            submitTime: '2025-01-20',
            votingEndTime: '2025-01-27',
            deposit: '50,000 KODEX',
            totalVotes: 12847,
            yesVotes: '78.5%',
            noVotes: '15.2%',
            abstainVotes: '4.1%',
            vetoVotes: '2.2%',
            participation: '45.6%',
            quorum: '33.4%'
        },
        {
            id: 141,
            title: 'Community Treasury Allocation',
            description: 'Allocate 2M KODEX from community treasury for ecosystem development grants, marketing initiatives, and strategic partnerships.',
            type: 'community_spend',
            status: 'voting',
            proposer: 'kodex1abc123...def4',
            submitTime: '2025-01-18',
            votingEndTime: '2025-01-25',
            deposit: '25,000 KODEX',
            totalVotes: 8934,
            yesVotes: '82.1%',
            noVotes: '12.3%',
            abstainVotes: '3.8%',
            vetoVotes: '1.8%',
            participation: '31.7%',
            quorum: '33.4%'
        },
        {
            id: 140,
            title: 'Validator Commission Cap Adjustment',
            description: 'Adjust the maximum validator commission rate from 10% to 8% to ensure competitive staking rewards for delegators.',
            type: 'parameter_change',
            status: 'passed',
            proposer: 'kodex1xyz789...abc1',
            submitTime: '2025-01-15',
            votingEndTime: '2025-01-22',
            deposit: '15,000 KODEX',
            totalVotes: 15623,
            yesVotes: '89.2%',
            noVotes: '7.4%',
            abstainVotes: '2.1%',
            vetoVotes: '1.3%',
            participation: '55.4%',
            quorum: '33.4%'
        },
        {
            id: 139,
            title: 'AI Computation Pricing Model',
            description: 'Implement dynamic pricing for AI computation resources based on network demand and resource availability.',
            type: 'parameter_change',
            status: 'rejected',
            proposer: 'kodex1def456...ghi7',
            submitTime: '2025-01-12',
            votingEndTime: '2025-01-19',
            deposit: '20,000 KODEX',
            totalVotes: 9876,
            yesVotes: '32.1%',
            noVotes: '58.7%',
            abstainVotes: '6.2%',
            vetoVotes: '3.0%',
            participation: '35.1%',
            quorum: '33.4%'
        },
        {
            id: 138,
            title: 'Cross-Chain Bridge Security Upgrade',
            description: 'Enhance security protocols for cross-chain bridges with multi-signature requirements and time-locked withdrawals.',
            type: 'text',
            status: 'deposit',
            proposer: 'kodex1ghi789...jkl0',
            submitTime: '2025-01-25',
            votingEndTime: '2025-02-01',
            deposit: '8,500 KODEX',
            totalVotes: 0,
            yesVotes: '0%',
            noVotes: '0%',
            abstainVotes: '0%',
            vetoVotes: '0%',
            participation: '0%',
            quorum: '33.4%'
        }
    ]

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'voting': return <Vote className="w-4 h-4 text-blue-500" />
            case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
            case 'rejected': return <XCircle className="w-4 h-4 text-red-500" />
            case 'deposit': return <Clock className="w-4 h-4 text-yellow-500" />
            case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'voting': return 'bg-blue-100 text-blue-700'
            case 'passed': return 'bg-green-100 text-green-700'
            case 'rejected': return 'bg-red-100 text-red-700'
            case 'deposit': return 'bg-yellow-100 text-yellow-700'
            case 'failed': return 'bg-red-100 text-red-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'text': return <FileText className="w-4 h-4 text-gray-500" />
            case 'parameter_change': return <Settings className="w-4 h-4 text-orange-500" />
            case 'software_upgrade': return <Zap className="w-4 h-4 text-purple-500" />
            case 'community_spend': return <DollarSign className="w-4 h-4 text-green-500" />
            default: return <FileText className="w-4 h-4 text-gray-500" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'text': return 'bg-gray-100 text-gray-700'
            case 'parameter_change': return 'bg-orange-100 text-orange-700'
            case 'software_upgrade': return 'bg-purple-100 text-purple-700'
            case 'community_spend': return 'bg-green-100 text-green-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 8)}...${address.slice(-4)}`
    }

    const getVoteBarColor = (voteType: string) => {
        switch (voteType) {
            case 'yes': return 'bg-green-500'
            case 'no': return 'bg-red-500'
            case 'abstain': return 'bg-gray-400'
            case 'veto': return 'bg-orange-500'
            default: return 'bg-gray-300'
        }
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
                                    <Vote className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold">Governance</h1>
                                    <p className="text-indigo-100">Participate in network governance</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="text-right">
                                <div className="text-sm text-indigo-200">Your Voting Power</div>
                                <div className="font-bold">{votingPower.totalVotingPower}</div>
                            </div>
                            <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg backdrop-blur-sm flex items-center space-x-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                <span>Create Proposal</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Governance Statistics */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8"
                >
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{governanceStats.totalProposals}</p>
                        <p className="text-sm text-gray-600">Total Proposals</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Vote className="w-5 h-5 text-green-600" />
                            </div>
                            <Activity className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{governanceStats.activeProposals}</p>
                        <p className="text-sm text-gray-600">Active Proposals</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-purple-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{governanceStats.passedProposals}</p>
                        <p className="text-sm text-gray-600">Passed Proposals</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Users className="w-5 h-5 text-yellow-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{governanceStats.totalVoters.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Voters</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg">
                                <BarChart3 className="w-5 h-5 text-indigo-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{governanceStats.averageParticipation}</p>
                        <p className="text-sm text-gray-600">Avg Participation</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Shield className="w-5 h-5 text-green-600" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{governanceStats.totalStakeVoting}</p>
                        <p className="text-sm text-gray-600">Stake Voting</p>
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
                            { id: 'proposals', label: 'Proposals', icon: FileText },
                            { id: 'voting', label: 'My Voting Power', icon: Vote },
                            { id: 'create', label: 'Create Proposal', icon: Plus }
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
                {activeTab === 'proposals' && (
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
                                            placeholder="Search proposals by title, ID, or proposer..."
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <select
                                        value={filter.status}
                                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="voting">Voting</option>
                                        <option value="passed">Passed</option>
                                        <option value="rejected">Rejected</option>
                                        <option value="deposit">Deposit Period</option>
                                        <option value="failed">Failed</option>
                                    </select>
                                    <select
                                        value={filter.type}
                                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="text">Text</option>
                                        <option value="parameter_change">Parameter Change</option>
                                        <option value="software_upgrade">Software Upgrade</option>
                                        <option value="community_spend">Community Spend</option>
                                    </select>
                                </div>
                            </div>
                        </motion.div>

                        {/* Proposals List */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-4"
                        >
                            {proposals.map((proposal, index) => (
                                <motion.div
                                    key={proposal.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                    onClick={() => setSelectedProposal(proposal.id)}
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                                        <div className="flex items-start space-x-4">
                                            <div className="text-2xl font-bold text-indigo-600">#{proposal.id}</div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{proposal.title}</h3>
                                                <p className="text-gray-600 mb-3">{proposal.description}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proposal.status)}`}>
                                                        {getStatusIcon(proposal.status)}
                                                        <span className="capitalize">{proposal.status.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(proposal.type)}`}>
                                                        {getTypeIcon(proposal.type)}
                                                        <span className="capitalize">{proposal.type.replace('_', ' ')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 lg:mt-0 lg:text-right">
                                            <div className="text-sm text-gray-600">
                                                <div>Proposer: {truncateAddress(proposal.proposer)}</div>
                                                <div>Submitted: {proposal.submitTime}</div>
                                                {proposal.status === 'voting' && (
                                                    <div className="text-orange-600 font-medium">
                                                        Voting ends: {proposal.votingEndTime}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {proposal.status === 'voting' && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                <div className="text-center">
                                                    <div className="font-bold text-green-600">{proposal.yesVotes}</div>
                                                    <div className="text-gray-600">Yes</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-red-600">{proposal.noVotes}</div>
                                                    <div className="text-gray-600">No</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-gray-600">{proposal.abstainVotes}</div>
                                                    <div className="text-gray-600">Abstain</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="font-bold text-orange-600">{proposal.vetoVotes}</div>
                                                    <div className="text-gray-600">Veto</div>
                                                </div>
                                            </div>

                                            <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-green-500"
                                                    style={{ width: proposal.yesVotes }}
                                                ></div>
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-red-500"
                                                    style={{
                                                        left: proposal.yesVotes,
                                                        width: proposal.noVotes
                                                    }}
                                                ></div>
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-gray-400"
                                                    style={{
                                                        left: `calc(${proposal.yesVotes} + ${proposal.noVotes})`,
                                                        width: proposal.abstainVotes
                                                    }}
                                                ></div>
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-orange-500"
                                                    style={{
                                                        left: `calc(${proposal.yesVotes} + ${proposal.noVotes} + ${proposal.abstainVotes})`,
                                                        width: proposal.vetoVotes
                                                    }}
                                                ></div>
                                            </div>

                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Participation: {proposal.participation}</span>
                                                <span>Quorum: {proposal.quorum}</span>
                                                <span>Total Votes: {proposal.totalVotes.toLocaleString()}</span>
                                            </div>

                                            <div className="flex space-x-2 mt-4">
                                                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-1">
                                                    <CheckCircle className="w-4 h-4" />
                                                    <span>Vote Yes</span>
                                                </button>
                                                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors flex items-center space-x-1">
                                                    <XCircle className="w-4 h-4" />
                                                    <span>Vote No</span>
                                                </button>
                                                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors">
                                                    Abstain
                                                </button>
                                                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors">
                                                    Veto
                                                </button>
                                                <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm transition-colors flex items-center space-x-1">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>Discuss</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {proposal.status === 'deposit' && (
                                        <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Clock className="w-4 h-4 text-yellow-600" />
                                                <span className="font-medium text-yellow-800">Deposit Period</span>
                                            </div>
                                            <div className="text-sm text-yellow-700 mb-3">
                                                This proposal needs {proposal.deposit} deposit to enter voting period.
                                            </div>
                                            <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm transition-colors">
                                                Contribute Deposit
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </>
                )}

                {activeTab === 'voting' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="space-y-8"
                    >
                        {/* Voting Power Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{votingPower.userStake}</p>
                                <p className="text-sm text-gray-600">Your Stake</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Users className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{votingPower.delegatedStake}</p>
                                <p className="text-sm text-gray-600">Delegated to You</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Vote className="w-5 h-5 text-green-600" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{votingPower.totalVotingPower}</p>
                                <p className="text-sm text-gray-600">Total Voting Power</p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Award className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{votingPower.participationRewards}</p>
                                <p className="text-sm text-gray-600">Participation Rewards</p>
                            </div>
                        </div>

                        {/* Voting History */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Voting History</h2>
                            <div className="text-center py-12">
                                <Vote className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600 mb-4">
                                    Your voting history will appear here after you participate in governance proposals.
                                </p>
                                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                                    View Active Proposals
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'create' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg"
                    >
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Create New Proposal</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Proposal Type</label>
                                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option>Text Proposal</option>
                                    <option>Parameter Change</option>
                                    <option>Software Upgrade</option>
                                    <option>Community Spend</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter proposal title..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    rows={6}
                                    placeholder="Detailed description of your proposal..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit</label>
                                <input
                                    type="text"
                                    placeholder="50,000 KODEX (minimum)"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-medium text-blue-900 mb-2">Proposal Guidelines</h4>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Minimum deposit of 50,000 KODEX required</li>
                                    <li>• Voting period lasts 7 days</li>
                                    <li>• Quorum requirement of 33.4% participation</li>
                                    <li>• Simple majority (50%+) needed to pass</li>
                                </ul>
                            </div>

                            <div className="flex space-x-4">
                                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-2">
                                    <Plus className="w-4 h-4" />
                                    <span>Submit Proposal</span>
                                </button>
                                <button className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors">
                                    Save Draft
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
