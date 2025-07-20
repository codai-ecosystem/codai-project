'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Search,
    ExternalLink,
    Play,
    Pause,
    Settings,
    Filter,
    Grid,
    List,
    Star,
    TrendingUp,
    Clock,
    CheckCircle,
    AlertCircle,
    Zap,
    Users,
    BarChart3,
    Target
} from 'lucide-react'
import { CODAI_APPS, APP_CATEGORIES, APP_STATUS_COLORS, TIER_INFO, getImplementationStats, getAppsByCategory, getAppsByStatus, getAppsByTier, type AppInfo } from '@/data/apps'

export function AppDiscovery() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [selectedTier, setSelectedTier] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState<'name' | 'status' | 'tier' | 'priority'>('tier')

    const stats = getImplementationStats()

    const filteredAndSortedApps = useMemo(() => {
        let filtered = CODAI_APPS.filter(app => {
            const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                app.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))

            const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory
            const matchesTier = selectedTier === null || app.tier === selectedTier

            return matchesSearch && matchesCategory && matchesTier
        })

        // Sort apps
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name)
                case 'status':
                    const statusOrder = { 'production': 0, 'beta': 1, 'development': 2, 'planned': 3 }
                    return statusOrder[a.status] - statusOrder[b.status]
                case 'tier':
                    return a.tier - b.tier
                case 'priority':
                    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
                    return priorityOrder[a.businessPriority] - priorityOrder[b.businessPriority]
                default:
                    return 0
            }
        })

        return filtered
    }, [searchTerm, selectedCategory, selectedTier, sortBy])

    const getStatusIcon = (status: AppInfo['status']) => {
        switch (status) {
            case 'production': return <CheckCircle className="h-4 w-4" />
            case 'beta': return <Play className="h-4 w-4" />
            case 'development': return <Settings className="h-4 w-4 animate-spin" />
            case 'planned': return <Clock className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const getPriorityIcon = (priority: AppInfo['businessPriority']) => {
        switch (priority) {
            case 'critical': return <Target className="h-4 w-4 text-red-500" />
            case 'high': return <TrendingUp className="h-4 w-4 text-orange-500" />
            case 'medium': return <BarChart3 className="h-4 w-4 text-yellow-500" />
            case 'low': return <Users className="h-4 w-4 text-green-500" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    const AppCard = ({ app }: { app: AppInfo }) => (
        <Card className="group relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${app.color}`} />
            <CardHeader className="relative">
                <div className="flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${app.color} text-white shadow-lg`}>
                        <div className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={APP_STATUS_COLORS[app.status]}>
                            {getStatusIcon(app.status)}
                            <span className="ml-1 capitalize">{app.status}</span>
                        </Badge>
                        {getPriorityIcon(app.businessPriority)}
                    </div>
                </div>
                <div>
                    <CardTitle className="text-xl font-bold text-slate-900">{app.name}</CardTitle>
                    <CardDescription className="text-slate-600 mt-1">{app.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent className="relative space-y-4">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                        Tier {app.tier} - {TIER_INFO[app.tier].name}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {app.category}
                    </Badge>
                </div>

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-700">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                        {app.features.slice(0, 3).map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-slate-50">
                                {feature}
                            </Badge>
                        ))}
                        {app.features.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-slate-50">
                                +{app.features.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Port: {app.port}</span>
                    <span>{app.implementationDays} days</span>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        size="sm"
                        className={`flex-1 bg-gradient-to-r ${app.color} hover:opacity-90 text-white shadow-lg`}
                        onClick={() => window.open(app.url, '_blank')}
                        disabled={app.status === 'planned'}
                    >
                        {app.status === 'planned' ? (
                            <>
                                <Clock className="mr-2 h-4 w-4" />
                                Coming Soon
                            </>
                        ) : (
                            <>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open App
                            </>
                        )}
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50">
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

    const AppListItem = ({ app }: { app: AppInfo }) => (
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${app.color} text-white shadow-lg`}>
                            <div className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-slate-900">{app.name}</h3>
                                <Badge variant="outline" className={APP_STATUS_COLORS[app.status]}>
                                    {getStatusIcon(app.status)}
                                    <span className="ml-1 capitalize">{app.status}</span>
                                </Badge>
                                {getPriorityIcon(app.businessPriority)}
                            </div>
                            <p className="text-sm text-slate-600">{app.description}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Badge variant="outline" className="text-xs">
                                    Tier {app.tier}
                                </Badge>
                                <span>•</span>
                                <span>{app.category}</span>
                                <span>•</span>
                                <span>Port: {app.port}</span>
                                <span>•</span>
                                <span>{app.implementationDays} days</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            className={`bg-gradient-to-r ${app.color} hover:opacity-90 text-white shadow-lg`}
                            onClick={() => window.open(app.url, '_blank')}
                            disabled={app.status === 'planned'}
                        >
                            {app.status === 'planned' ? (
                                <>
                                    <Clock className="mr-2 h-4 w-4" />
                                    Coming Soon
                                </>
                            ) : (
                                <>
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Open App
                                </>
                            )}
                        </Button>
                        <Button size="sm" variant="outline" className="border-slate-200 hover:bg-slate-50">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )

    return (
        <div className="space-y-6">
            {/* Header & Stats */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">App Discovery</h2>
                    <p className="text-slate-600">Explore and access all {stats.total} applications in the CODAI ecosystem</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{stats.production}</div>
                            <div className="text-xs text-slate-500">Production Ready</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{stats.beta}</div>
                            <div className="text-xs text-slate-500">Beta Testing</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-yellow-600">{stats.development}</div>
                            <div className="text-xs text-slate-500">In Development</div>
                        </CardContent>
                    </Card>
                    <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
                        <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{stats.completionPercentage}%</div>
                            <div className="text-xs text-slate-500">Complete</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search apps, features, or descriptions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 border-slate-200 bg-white/60 backdrop-blur-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <div className="flex justify-between items-center">
                        <TabsList className="bg-white/60 backdrop-blur-sm border border-slate-200">
                            <TabsTrigger value="all">All Apps</TabsTrigger>
                            <TabsTrigger value="tier1">Tier 1</TabsTrigger>
                            <TabsTrigger value="tier2">Tier 2</TabsTrigger>
                            <TabsTrigger value="tier3">Tier 3</TabsTrigger>
                            <TabsTrigger value="tier4">Tier 4</TabsTrigger>
                            <TabsTrigger value="tier5">Tier 5</TabsTrigger>
                        </TabsList>

                        <div className="flex gap-2">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white/60 backdrop-blur-sm"
                            >
                                {APP_CATEGORIES.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                                className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white/60 backdrop-blur-sm"
                            >
                                <option value="tier">Sort by Tier</option>
                                <option value="name">Sort by Name</option>
                                <option value="status">Sort by Status</option>
                                <option value="priority">Sort by Priority</option>
                            </select>
                        </div>
                    </div>

                    <TabsContent value="all" className="mt-6">
                        {viewMode === 'grid' ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredAndSortedApps.map(app => (
                                    <AppCard key={app.id} app={app} />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredAndSortedApps.map(app => (
                                    <AppListItem key={app.id} app={app} />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {[1, 2, 3, 4, 5].map(tier => (
                        <TabsContent key={tier} value={`tier${tier}`} className="mt-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-slate-900">{TIER_INFO[tier].name} Applications</h3>
                                <p className="text-slate-600">Priority: {TIER_INFO[tier].priority}</p>
                            </div>
                            {viewMode === 'grid' ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {getAppsByTier(tier).map(app => (
                                        <AppCard key={app.id} app={app} />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {getAppsByTier(tier).map(app => (
                                        <AppListItem key={app.id} app={app} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </div>

            {filteredAndSortedApps.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-slate-400 text-lg">No apps found matching your criteria</div>
                    <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => {
                            setSearchTerm('')
                            setSelectedCategory('All')
                            setSelectedTier(null)
                        }}
                    >
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
