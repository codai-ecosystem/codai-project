'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    HelpCircle,
    Users,
    MessageSquare,
    HeadphonesIcon,
    FileText,
    Lightbulb,
    Activity,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    Star,
    Search,
    BookOpen
} from 'lucide-react'

export function AjutaiDashboard() {
    const [helpRequests, setHelpRequests] = useState(89)
    const [satisfactionScore, setSatisfactionScore] = useState(94)
    const [responseTime, setResponseTime] = useState(2.3)

    useEffect(() => {
        // Simulate real-time updates
        const interval = setInterval(() => {
            setHelpRequests(prev => prev + Math.floor(Math.random() * 3))
            setSatisfactionScore(prev => Math.min(99, prev + (Math.random() - 0.5) * 2))
            setResponseTime(prev => Math.max(1, prev + (Math.random() - 0.5) * 0.5))
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    const supportFeatures = [
        {
            title: "Live Chat Support",
            description: "Real-time assistance with instant responses",
            icon: MessageSquare,
            status: "active",
            users: 24
        },
        {
            title: "Knowledge Base",
            description: "Comprehensive help articles and guides",
            icon: BookOpen,
            status: "active",
            articles: 156
        },
        {
            title: "Ticket System",
            description: "Track and manage support requests",
            icon: FileText,
            status: "active",
            tickets: 12
        },
        {
            title: "Community Forum",
            description: "User-to-user help and discussions",
            icon: Users,
            status: "active",
            posts: 78
        },
        {
            title: "Video Tutorials",
            description: "Step-by-step visual guides",
            icon: Lightbulb,
            status: "active",
            videos: 43
        },
        {
            title: "AI Helper",
            description: "Intelligent assistance and suggestions",
            icon: HelpCircle,
            status: "active",
            queries: 234
        }
    ]

    const recentActivity = [
        { id: 1, type: "resolved", message: "Ticket #1234 resolved", time: "2 min ago" },
        { id: 2, type: "new", message: "New chat session started", time: "5 min ago" },
        { id: 3, type: "feedback", message: "5-star rating received", time: "8 min ago" },
        { id: 4, type: "update", message: "Knowledge base updated", time: "15 min ago" }
    ]

    return (
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">AJUTAI Dashboard</h1>
                        <p className="text-blue-100 text-lg">Intelligent Help & Support System</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <HeadphonesIcon className="h-16 w-16 text-blue-200" />
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-700">Help Requests</CardTitle>
                        <HelpCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-800">{helpRequests}</div>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12% from last hour
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-blue-700">Satisfaction Score</CardTitle>
                        <Star className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-800">{satisfactionScore.toFixed(1)}%</div>
                        <Progress value={satisfactionScore} className="mt-2" />
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-purple-700">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-800">{responseTime.toFixed(1)}m</div>
                        <p className="text-xs text-purple-600">Under 3min target</p>
                    </CardContent>
                </Card>
            </div>

            {/* Support Features Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Support Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {supportFeatures.map((feature, index) => {
                        const IconComponent = feature.icon
                        return (
                            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] bg-white">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <IconComponent className="h-8 w-8 text-blue-600" />
                                        <Badge variant={feature.status === 'active' ? 'default' : 'secondary'}>
                                            {feature.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                    <CardDescription>{feature.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            {feature.users && `${feature.users} active users`}
                                            {feature.articles && `${feature.articles} articles`}
                                            {feature.tickets && `${feature.tickets} open tickets`}
                                            {feature.posts && `${feature.posts} recent posts`}
                                            {feature.videos && `${feature.videos} tutorials`}
                                            {feature.queries && `${feature.queries} AI queries`}
                                        </span>
                                        <Button size="sm" variant="outline">
                                            Manage
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Activity className="h-5 w-5 mr-2 text-blue-600" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        {activity.type === 'resolved' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        {activity.type === 'new' && <AlertCircle className="h-4 w-4 text-blue-500" />}
                                        {activity.type === 'feedback' && <Star className="h-4 w-4 text-yellow-500" />}
                                        {activity.type === 'update' && <FileText className="h-4 w-4 text-purple-500" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Search className="h-5 w-5 mr-2 text-blue-600" />
                            Quick Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button className="h-16 flex-col bg-blue-600 hover:bg-blue-700">
                                <MessageSquare className="h-6 w-6 mb-1" />
                                Start Chat
                            </Button>
                            <Button variant="outline" className="h-16 flex-col">
                                <FileText className="h-6 w-6 mb-1" />
                                New Ticket
                            </Button>
                            <Button variant="outline" className="h-16 flex-col">
                                <BookOpen className="h-6 w-6 mb-1" />
                                Knowledge Base
                            </Button>
                            <Button variant="outline" className="h-16 flex-col">
                                <Users className="h-6 w-6 mb-1" />
                                Community
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
