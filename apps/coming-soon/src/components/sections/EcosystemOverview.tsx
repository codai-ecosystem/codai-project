'use client'

import { useMemo } from 'react'
import { TrendingUp, Users, Zap, Globe, ArrowRight, BarChart3, PieChart, Activity } from 'lucide-react'
import { useScrollAnimation, useCounterAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation'
import { codaiProjects, getTotalProjectStats, getProjectsByTier } from '@/data/projects'

interface StatCardProps {
    icon: React.ComponentType<any>
    value: number
    label: string
    suffix?: string
    color: string
    delay?: number
    description?: string
}

const StatCard = ({ icon: Icon, value, label, suffix = '', color, delay = 0, description }: StatCardProps) => {
    const { elementRef, isVisible } = useScrollAnimation<HTMLDivElement>({
        threshold: 0.3,
        stagger: delay,
        animationType: 'stats'
    })
    const count = useCounterAnimation(value, 2000, isVisible)

    return (
        <div
            ref={elementRef}
            className={`
        group relative overflow-hidden rounded-3xl border border-white/10 
        bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm
        hover:border-white/20 hover:shadow-2xl hover:shadow-${color}-500/10
        transition-all duration-500 ease-out transform hover:scale-105 hover:-translate-y-2
        p-8
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
      `}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_70%)]" />

            {/* Icon */}
            <div className={`inline-flex p-4 rounded-2xl bg-${color}-500/20 border border-${color}-400/30 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-8 h-8 text-${color}-400`} />
            </div>

            {/* Value */}
            <div className="mb-2">
                <span className={`text-4xl md:text-5xl font-bold bg-gradient-to-r from-${color}-400 to-${color}-300 bg-clip-text text-transparent`}>
                    {Math.floor(count)}
                </span>
                <span className={`text-2xl font-semibold text-${color}-400/80 ml-1`}>
                    {suffix}
                </span>
            </div>

            {/* Label */}
            <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white transition-colors">
                {label}
            </h3>

            {/* Description */}
            {description && (
                <p className="text-sm text-white/60 leading-relaxed">
                    {description}
                </p>
            )}

            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        </div>
    )
}

interface TierCardProps {
    tier: number
    projects: any[]
    delay: number
}

const TierCard = ({ tier, projects, delay }: TierCardProps) => {
    const { elementRef, isVisible } = useScrollAnimation<HTMLDivElement>({
        threshold: 0.3,
        stagger: delay,
        animationType: 'fade-up'
    })

    const tierColors = {
        1: { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-400/30', text: 'text-red-400' },
        2: { bg: 'from-orange-500/20 to-yellow-500/20', border: 'border-orange-400/30', text: 'text-orange-400' },
        3: { bg: 'from-green-500/20 to-emerald-500/20', border: 'border-green-400/30', text: 'text-green-400' },
        4: { bg: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-400/30', text: 'text-blue-400' },
        5: { bg: 'from-purple-500/20 to-indigo-500/20', border: 'border-purple-400/30', text: 'text-purple-400' }
    }

    const colors = tierColors[tier as keyof typeof tierColors]
    const count = useCounterAnimation(projects.length, 1500, isVisible)

    return (
        <div
            ref={elementRef}
            className={`
        group relative overflow-hidden rounded-2xl border ${colors.border}
        bg-gradient-to-br ${colors.bg} backdrop-blur-sm
        hover:shadow-xl transition-all duration-300 transform hover:scale-105
        p-6
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
      `}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">
                    Tier {tier}
                </h4>
                <div className={`px-3 py-1 rounded-full bg-white/10 border ${colors.border}`}>
                    <span className={`text-2xl font-bold ${colors.text}`}>
                        {Math.floor(count)}
                    </span>
                </div>
            </div>

            <div className="space-y-1">
                {projects.slice(0, 3).map((project, idx) => (
                    <div key={idx} className="text-sm text-white/70 truncate">
                        • {project.name}
                    </div>
                ))}
                {projects.length > 3 && (
                    <div className="text-xs text-white/50">
                        +{projects.length - 3} more...
                    </div>
                )}
            </div>
        </div>
    )
}

export default function EcosystemOverview() {
    const { elementRef, isVisible } = useScrollAnimation<HTMLElement>({
        threshold: 0.1,
        animationType: 'fade-up'
    })

    const ecosystemStats = useMemo(() => {
        const stats = getTotalProjectStats()
        const tierBreakdown = {
            1: getProjectsByTier(1),
            2: getProjectsByTier(2),
            3: getProjectsByTier(3),
            4: getProjectsByTier(4),
            5: getProjectsByTier(5)
        }

        return {
            totalProjects: stats.total,
            productionReady: stats.production,
            categories: stats.categories,
            tierBreakdown
        }
    }, [])

    const mainStats = [
        {
            icon: Globe,
            value: ecosystemStats.totalProjects,
            label: 'Total Projects',
            suffix: '+',
            color: 'blue',
            description: 'AI-native applications spanning every digital domain'
        },
        {
            icon: TrendingUp,
            value: ecosystemStats.productionReady,
            label: 'Production Ready',
            color: 'green',
            description: 'Live applications serving users worldwide'
        },
        {
            icon: Users,
            value: 500000,
            label: 'Expected Users',
            suffix: '+',
            color: 'purple',
            description: 'Projected user base across all ecosystem platforms'
        },
        {
            icon: Zap,
            value: ecosystemStats.categories,
            label: 'Categories',
            suffix: '+',
            color: 'yellow',
            description: 'Diverse domains from development to finance'
        }
    ]

    return (
        <section
            id="ecosystem"
            ref={elementRef}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-slate-900 to-indigo-900 relative overflow-hidden"
        >
            {/* Background Effects */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute top-60 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Floating Data Visualization */}
            <div className="absolute top-40 right-20 opacity-10">
                <BarChart3 className="w-32 h-32 text-white animate-float-slow" />
            </div>
            <div className="absolute bottom-40 left-20 opacity-10">
                <PieChart className="w-28 h-28 text-white animate-bounce-slow" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5">
                <Activity className="w-40 h-40 text-white animate-pulse" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        <span className="text-sm text-white/80 font-medium">Ecosystem Analytics</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                            By the
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                            Numbers
                        </span>
                    </h2>

                    <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                        Comprehensive ecosystem statistics showcasing the scale and diversity
                        of AI-native applications in the CODAI universe.
                    </p>
                </div>

                {/* Main Statistics Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 transition-all duration-1000 ease-out transform delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    {mainStats.map((stat, index) => (
                        <StatCard
                            key={index}
                            {...stat}
                            delay={index * 150}
                        />
                    ))}
                </div>

                {/* Tier Breakdown */}
                <div className={`mb-16 transition-all duration-1000 ease-out transform delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="text-center mb-12">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Project Tiers
                            </span>
                        </h3>
                        <p className="text-lg text-white/60 max-w-2xl mx-auto">
                            Projects organized by complexity, scope, and strategic importance
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {Object.entries(ecosystemStats.tierBreakdown).map(([tier, projects], index) => (
                            <TierCard
                                key={tier}
                                tier={parseInt(tier)}
                                projects={projects}
                                delay={index * 100}
                            />
                        ))}
                    </div>
                </div>

                {/* Interactive Metrics */}
                <div className={`transition-all duration-1000 ease-out transform delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-12">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left Content */}
                            <div>
                                <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                                    Building the Future of
                                    <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent block">
                                        Digital Interaction
                                    </span>
                                </h3>

                                <p className="text-lg text-white/70 mb-8 leading-relaxed">
                                    Each project in the CODAI ecosystem is designed with AI-first principles,
                                    seamless integration capabilities, and user-centric design. Together,
                                    they form a comprehensive digital infrastructure for the next generation.
                                </p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                        <span className="text-white/80">Cross-platform compatibility</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full" />
                                        <span className="text-white/80">AI-native architecture</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                                        <span className="text-white/80">Seamless ecosystem integration</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        const projectsSection = document.getElementById('projects')
                                        if (projectsSection) {
                                            projectsSection.scrollIntoView({ behavior: 'smooth' })
                                        }
                                    }}
                                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-2"
                                >
                                    <span>Explore Projects</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Right Visual */}
                            <div className="relative">
                                <div className="grid grid-cols-3 gap-4">
                                    {[...Array(9)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="aspect-square bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/10 flex items-center justify-center group hover:scale-110 transition-transform duration-300"
                                            style={{
                                                animationDelay: `${i * 0.1}s`
                                            }}
                                        >
                                            <div className="w-8 h-8 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors" />
                                        </div>
                                    ))}
                                </div>

                                {/* Connecting lines */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                                    {/* Horizontal lines */}
                                    <line x1="16.67%" y1="16.67%" x2="83.33%" y2="16.67%" stroke="white" strokeWidth="1" />
                                    <line x1="16.67%" y1="50%" x2="83.33%" y2="50%" stroke="white" strokeWidth="1" />
                                    <line x1="16.67%" y1="83.33%" x2="83.33%" y2="83.33%" stroke="white" strokeWidth="1" />
                                    {/* Vertical lines */}
                                    <line x1="16.67%" y1="16.67%" x2="16.67%" y2="83.33%" stroke="white" strokeWidth="1" />
                                    <line x1="50%" y1="16.67%" x2="50%" y2="83.33%" stroke="white" strokeWidth="1" />
                                    <line x1="83.33%" y1="16.67%" x2="83.33%" y2="83.33%" stroke="white" strokeWidth="1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}