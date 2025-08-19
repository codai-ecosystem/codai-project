'use client'

import React, { useState } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from '@codai/shared-ui'
import {
    Target,
    TrendingUp,
    Users,
    DollarSign,
    Rocket,
    Heart,
    Trophy,
    Calendar,
    BarChart3,
    MessageCircle,
    Eye,
    Star,
    ArrowUp
} from 'lucide-react'

// Temporary local components until @codai/shared-ui is available
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>
)

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
)

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
)

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-sm text-slate-600 ${className}`}>{children}</p>
)

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`p-6 pt-0 ${className}`}>{children}</div>
)

const Badge = ({ children, variant = 'default', className = '' }: {
    children: React.ReactNode;
    variant?: 'default' | 'outline';
    className?: string
}) => (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variant === 'outline'
            ? 'border-slate-200 bg-transparent'
            : 'border-transparent bg-slate-900 text-slate-50'
        } ${className}`}>
        {children}
    </div>
)

const Button = ({ children, variant = 'default', className = '' }: {
    children: React.ReactNode;
    variant?: 'default' | 'outline';
    className?: string
}) => (
    <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 h-10 px-4 py-2 ${variant === 'outline'
            ? 'border border-slate-200 bg-white hover:bg-slate-100'
            : 'bg-slate-900 text-slate-50 hover:bg-slate-800'
        } ${className}`}>
        {children}
    </button>
)

// TypeScript interfaces for crowdfunding data structures
interface CrowdfundingStats {
    totalCampaigns: number
    totalFunding: number
    activeBackers: number
    successRate: number
}

interface Campaign {
    id: string
    title: string
    category: string
    goal: number
    raised: number
    backers: number
    daysLeft: number
    image?: string
    status: 'active' | 'funded' | 'ended'
    description: string
}

interface BackerActivity {
    id: string
    backerName: string
    campaignTitle: string
    amount: number
    timestamp: string
    type: 'pledge' | 'comment' | 'share'
}

export function PromovaiDashboard() {
    const [stats] = useState<CrowdfundingStats>({
        totalCampaigns: 1247,
        totalFunding: 8450000,
        activeBackers: 23456,
        successRate: 87.2
    })

    const [featuredCampaigns] = useState<Campaign[]>([
        {
            id: '1',
            title: 'Eco-Friendly Tech Startup',
            category: 'Technology',
            goal: 50000,
            raised: 32500,
            backers: 284,
            daysLeft: 18,
            status: 'active',
            description: 'Revolutionary sustainable technology for a greener future'
        },
        {
            id: '2',
            title: 'Community Art Project',
            category: 'Arts',
            goal: 20000,
            raised: 17000,
            backers: 156,
            daysLeft: 7,
            status: 'active',
            description: 'Bringing vibrant art to community spaces'
        },
        {
            id: '3',
            title: 'Educational Initiative',
            category: 'Education',
            goal: 20000,
            raised: 8400,
            backers: 92,
            daysLeft: 25,
            status: 'active',
            description: 'Providing quality education access to underserved communities'
        }
    ])

    const [recentActivity] = useState<BackerActivity[]>([
        {
            id: '1',
            backerName: 'Sarah Johnson',
            campaignTitle: 'Eco-Friendly Tech Startup',
            amount: 250,
            timestamp: '2 minutes ago',
            type: 'pledge'
        },
        {
            id: '2',
            backerName: 'Michael Chen',
            campaignTitle: 'Community Art Project',
            amount: 100,
            timestamp: '15 minutes ago',
            type: 'pledge'
        },
        {
            id: '3',
            backerName: 'Emma Davis',
            campaignTitle: 'Educational Initiative',
            amount: 50,
            timestamp: '1 hour ago',
            type: 'pledge'
        }
    ])

    const calculateProgress = (raised: number, goal: number) => {
        return Math.min((raised / goal) * 100, 100)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg">
                            <Target className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-green-700 to-teal-800 bg-clip-text text-transparent">
                                PROMOVAI
                            </h1>
                            <p className="text-lg text-slate-600">AI-Powered Crowdfunding Platform</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                            <Rocket className="mr-1 h-3 w-3" />
                            Platform Active
                        </Badge>
                        <Badge variant="outline">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            AI Optimization Enabled
                        </Badge>
                    </div>
                </div>

                {/* Core Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Campaigns</CardTitle>
                            <Target className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                                {stats.totalCampaigns.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center">
                                <ArrowUp className="mr-1 h-3 w-3" />
                                +156 this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Funding</CardTitle>
                            <DollarSign className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                ${(stats.totalFunding / 1000000).toFixed(1)}M
                            </div>
                            <p className="text-xs text-slate-500">Total raised</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Backers</CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-violet-700 bg-clip-text text-transparent">
                                {stats.activeBackers.toLocaleString()}
                            </div>
                            <p className="text-xs text-slate-500">Community members</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/60 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Success Rate</CardTitle>
                            <Trophy className="h-4 w-4 text-teal-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-emerald-700 bg-clip-text text-transparent">
                                {stats.successRate}%
                            </div>
                            <p className="text-xs text-slate-500">Campaign success</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Featured Campaigns Section */}
                <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold flex items-center gap-2">
                            <Star className="h-6 w-6 text-green-600" />
                            Featured Campaigns
                        </CardTitle>
                        <CardDescription>
                            Trending and high-performing crowdfunding campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {featuredCampaigns.map((campaign) => (
                                <Card key={campaign.id} className="bg-slate-50/50">
                                    <CardContent className="p-4">
                                        <div className="space-y-3">
                                            <div className="h-32 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg"></div>
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="font-semibold text-slate-900">{campaign.title}</h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {campaign.category}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600">{campaign.description}</p>

                                                {/* Progress Bar */}
                                                <div className="space-y-1">
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        <div
                                                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${calculateProgress(campaign.raised, campaign.goal)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">${campaign.raised.toLocaleString()}</span>
                                                        <span className="text-slate-500">of ${campaign.goal.toLocaleString()}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-sm text-slate-600">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {campaign.backers} backers
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {campaign.daysLeft} days left
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white/60 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>
                            Latest backer activity and campaign updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                                            <Heart className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">
                                                <span className="text-green-600">{activity.backerName}</span> pledged ${activity.amount}
                                            </p>
                                            <p className="text-xs text-slate-500">{activity.campaignTitle}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">{activity.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg">
                        <Rocket className="mr-2 h-4 w-4" />
                        Start Campaign
                    </Button>
                    <Button variant="outline" className="hover:bg-slate-50">
                        <Eye className="mr-2 h-4 w-4" />
                        Browse Projects
                    </Button>
                    <Button variant="outline" className="hover:bg-slate-50">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                    </Button>
                    <Button variant="outline" className="hover:bg-slate-50">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Community
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            PROMOVAI - AI-Powered Crowdfunding Platform
                        </p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-green-200 text-green-700">
                                <TrendingUp className="mr-1 h-3 w-3" />
                                AI Optimized
                            </Badge>
                            <p className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
