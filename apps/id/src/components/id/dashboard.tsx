'use client'

import React from 'react'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    User,
    Shield,
    Award,
    Star,
    Users,
    CheckCircle,
    TrendingUp,
    Eye,
    Lock,
    UserCheck,
    Activity,
    Trophy,
    ArrowRight,
    Settings,
    Globe,
    Zap
} from 'lucide-react'

interface IdentityStats {
    verifiedUsers: number
    totalReputation: number
    activeProfiles: number
    trustScore: number
    achievements: number
    securityLevel: string
}

interface ReputationScore {
    category: string
    score: number
    trend: string
    description: string
}

interface Achievement {
    title: string
    description: string
    earned: boolean
    rarity: 'common' | 'rare' | 'epic' | 'legendary'
    points: number
}

export function IdDashboard() {
    const [stats] = useState<IdentityStats>({
        verifiedUsers: 12847,
        totalReputation: 156923,
        activeProfiles: 8921,
        trustScore: 94,
        achievements: 234,
        securityLevel: 'High'
    })

    const reputationScores: ReputationScore[] = [
        { category: 'Developer Skills', score: 92, trend: '+5%', description: 'Code quality and contributions' },
        { category: 'Community Trust', score: 88, trend: '+3%', description: 'Peer reviews and endorsements' },
        { category: 'Project Leadership', score: 85, trend: '+8%', description: 'Team management and delivery' },
        { category: 'Knowledge Sharing', score: 91, trend: '+2%', description: 'Documentation and mentoring' }
    ]

    const achievements: Achievement[] = [
        { title: 'Code Master', description: 'Completed 100+ code reviews', earned: true, rarity: 'epic', points: 500 },
        { title: 'Team Player', description: 'Collaborated on 50+ projects', earned: true, rarity: 'rare', points: 300 },
        { title: 'Innovation Pioneer', description: 'First to implement new technology', earned: true, rarity: 'legendary', points: 1000 },
        { title: 'Mentor Guide', description: 'Mentored 25+ developers', earned: false, rarity: 'epic', points: 750 },
        { title: 'Security Expert', description: 'Identified 10+ vulnerabilities', earned: true, rarity: 'rare', points: 400 },
        { title: 'Documentation Hero', description: 'Wrote comprehensive guides', earned: false, rarity: 'common', points: 150 }
    ]

    const recentActivity = [
        { action: 'Profile verified', type: 'verification', time: '2 hours ago' },
        { action: 'Reputation increased by 50 points', type: 'reputation', time: '1 day ago' },
        { action: 'New achievement unlocked', type: 'achievement', time: '2 days ago' },
        { action: 'Security settings updated', type: 'security', time: '3 days ago' }
    ]

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
            case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'verification': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'reputation': return <TrendingUp className="h-4 w-4 text-blue-500" />
            case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />
            case 'security': return <Shield className="h-4 w-4 text-purple-500" />
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
                            <User className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">ID</h1>
                            <p className="text-slate-600">Codai Identity & Reputation Layer</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <Shield className="mr-1 h-3 w-3" />
                            {stats.securityLevel} Security
                        </Badge>
                        <Badge variant="outline">Trust Score: {stats.trustScore}%</Badge>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 animate-pulse">
                            <Eye className="mr-1 h-3 w-3" />
                            Live Development
                        </Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Verified Users</CardTitle>
                            <UserCheck className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.verifiedUsers.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">+15% from last month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Reputation</CardTitle>
                            <Award className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalReputation.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Collective points earned</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Profiles</CardTitle>
                            <Users className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.activeProfiles.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Online users</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Trust Score</CardTitle>
                            <Shield className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.trustScore}%</div>
                            <p className="text-xs text-slate-500">Platform reliability</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Achievements</CardTitle>
                            <Trophy className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.achievements}</div>
                            <p className="text-xs text-slate-500">Total unlocked</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Security Level</CardTitle>
                            <Lock className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.securityLevel}</div>
                            <p className="text-xs text-slate-500">Protection status</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Reputation Scores */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-600" />
                                Reputation Scores
                            </CardTitle>
                            <CardDescription>Your performance across different categories</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {reputationScores.map((score, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium text-slate-900">{score.category}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-bold text-slate-900">{score.score}</span>
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                {score.trend}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${score.score}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-slate-500">{score.description}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                Recent Activity
                            </CardTitle>
                            <CardDescription>Your latest platform interactions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                                            {getActivityIcon(activity.type)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{activity.action}</p>
                                            <p className="text-xs text-slate-500">{activity.time}</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-slate-400" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Achievements Grid */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            Achievements
                        </CardTitle>
                        <CardDescription>Your accomplishments and progress milestones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {achievements.map((achievement, index) => (
                                <div key={index} className={`p-4 rounded-lg border-2 ${achievement.earned ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className={getRarityColor(achievement.rarity)}>
                                            {achievement.rarity}
                                        </Badge>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm font-medium">{achievement.points}</span>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{achievement.title}</h3>
                                    <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                                    <div className="flex items-center justify-between">
                                        {achievement.earned ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                Earned
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                <Eye className="mr-1 h-3 w-3" />
                                                Locked
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg">
                        <User className="mr-2 h-4 w-4" />
                        Manage Profile
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Settings className="mr-2 h-4 w-4" />
                        Privacy Settings
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Globe className="mr-2 h-4 w-4" />
                        Public Profile
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Zap className="mr-2 h-4 w-4" />
                        Boost Reputation
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>ID - Codai Identity & Reputation Layer</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-blue-200 text-blue-700">
                                <Shield className="mr-1 h-3 w-3" />
                                Secure Identity
                            </Badge>
                            <p>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

