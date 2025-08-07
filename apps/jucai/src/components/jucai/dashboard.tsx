'use client'

import React from 'react'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Gamepad2,
    Star,
    Users,
    Trophy,
    Coins,
    Download,
    Play,
    ShoppingCart,
    TrendingUp,
    Activity,
    Crown,
    Gift,
    ArrowRight,
    Zap,
    Target,
    Globe
} from 'lucide-react'

interface GameStats {
    totalGames: number
    activeUsers: number
    totalRevenue: number
    avgRating: number
    downloads: number
    tournaments: number
}

interface GameItem {
    title: string
    genre: string
    rating: number
    players: number
    price: string
    isNew?: boolean
    isTrending?: boolean
}

interface Achievement {
    title: string
    description: string
    progress: number
    total: number
    unlocked: boolean
}

export function JucaiDashboard() {
    const [stats] = useState<GameStats>({
        totalGames: 2847,
        activeUsers: 156234,
        totalRevenue: 2.4,
        avgRating: 4.6,
        downloads: 892341,
        tournaments: 67
    })

    const featuredGames: GameItem[] = [
        { title: 'AI Warriors', genre: 'Strategy', rating: 4.8, players: 12435, price: 'Free', isNew: true },
        { title: 'Quantum Quest', genre: 'RPG', rating: 4.7, players: 8932, price: '$19.99', isTrending: true },
        { title: 'Neural Network', genre: 'Puzzle', rating: 4.9, players: 15678, price: '$9.99' },
        { title: 'Code Breaker', genre: 'Action', rating: 4.5, players: 6789, price: 'Free', isNew: true }
    ]

    const achievements: Achievement[] = [
        { title: 'Game Master', description: 'Complete 10 games', progress: 7, total: 10, unlocked: false },
        { title: 'Social Player', description: 'Play with 50 friends', progress: 50, total: 50, unlocked: true },
        { title: 'Tournament Pro', description: 'Win 5 tournaments', progress: 3, total: 5, unlocked: false },
        { title: 'Collector', description: 'Own 25 games', progress: 18, total: 25, unlocked: false }
    ]

    const leaderboard = [
        { rank: 1, name: 'ProGamer2024', score: 156789, trend: '+12%' },
        { rank: 2, name: 'AIChampion', score: 134567, trend: '+8%' },
        { rank: 3, name: 'CodeMaster', score: 128934, trend: '+5%' },
        { rank: 4, name: 'QuantumPlayer', score: 125432, trend: '+3%' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-6">
            <div className="mx-auto max-w-7xl space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg">
                            <Gamepad2 className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">JUCAI</h1>
                            <p className="text-slate-600">AI-Native Game Platform & Marketplace</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200">
                            <Activity className="mr-1 h-3 w-3" />
                            Gaming Active
                        </Badge>
                        <Badge variant="outline">Platform v3.2.1</Badge>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Total Games</CardTitle>
                            <Gamepad2 className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.totalGames.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Available in marketplace</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Active Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.activeUsers.toLocaleString()}</div>
                            <p className="text-xs text-slate-500">Playing right now</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Revenue</CardTitle>
                            <Coins className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">${stats.totalRevenue}M</div>
                            <p className="text-xs text-slate-500">This month</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Average Rating</CardTitle>
                            <Star className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.avgRating}</div>
                            <p className="text-xs text-slate-500">Out of 5 stars</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Downloads</CardTitle>
                            <Download className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{(stats.downloads / 1000).toFixed(0)}K</div>
                            <p className="text-xs text-slate-500">Total downloads</p>
                        </CardContent>
                    </Card>

                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">Tournaments</CardTitle>
                            <Trophy className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stats.tournaments}</div>
                            <p className="text-xs text-slate-500">Active competitions</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Featured Games */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-purple-600" />
                                Featured Games
                            </CardTitle>
                            <CardDescription>Popular and trending games on the platform</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {featuredGames.map((game, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                            <Gamepad2 className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-slate-900">{game.title}</p>
                                                {game.isNew && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                        New
                                                    </Badge>
                                                )}
                                                {game.isTrending && (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-700">
                                                        <TrendingUp className="mr-1 h-3 w-3" />
                                                        Trending
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span>{game.genre}</span>
                                                <span className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-500" />
                                                    {game.rating}
                                                </span>
                                                <span>{game.players.toLocaleString()} players</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-slate-900">{game.price}</span>
                                        <Button size="sm" variant="outline">
                                            <Play className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Leaderboard */}
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-600" />
                                Global Leaderboard
                            </CardTitle>
                            <CardDescription>Top players this week</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {leaderboard.map((player, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${player.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                                                player.rank === 2 ? 'bg-gray-100 text-gray-700' :
                                                    player.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                        'bg-slate-100 text-slate-700'
                                            }`}>
                                            {player.rank}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{player.name}</p>
                                            <p className="text-xs text-slate-500">{player.score.toLocaleString()} points</p>
                                        </div>
                                    </div>
                                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                                        {player.trend}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Achievements Grid */}
                <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-orange-600" />
                            Achievements
                        </CardTitle>
                        <CardDescription>Your gaming progress and milestones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {achievements.map((achievement, index) => (
                                <div key={index} className={`p-4 rounded-lg border-2 ${achievement.unlocked ? 'border-green-200 bg-green-50/50' : 'border-slate-200 bg-slate-50/50'}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-semibold text-slate-900">{achievement.title}</h3>
                                        {achievement.unlocked ? (
                                            <Badge variant="secondary" className="bg-green-100 text-green-700">
                                                <Trophy className="mr-1 h-3 w-3" />
                                                Unlocked
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline">
                                                {achievement.progress}/{achievement.total}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 mb-3">{achievement.description}</p>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-300 ${achievement.unlocked ? 'bg-green-600' : 'bg-blue-600'
                                                }`}
                                            style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Browse Games
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Trophy className="mr-2 h-4 w-4" />
                        Join Tournament
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Globe className="mr-2 h-4 w-4" />
                        Community
                    </Button>
                    <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Gift className="mr-2 h-4 w-4" />
                        Rewards
                    </Button>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between text-sm text-slate-500">
                        <p>JUCAI - AI-Native Game Platform & Marketplace</p>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="border-purple-200 text-purple-700">
                                <Zap className="mr-1 h-3 w-3" />
                                Gaming Ready
                            </Badge>
                            <p>Last updated: {new Date().toLocaleTimeString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

