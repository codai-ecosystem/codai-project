'use client'

import { useState, useMemo } from 'react'
import { ExternalLink, Star, ArrowRight, Filter, Brain } from 'lucide-react'
import { useScrollAnimation, useStaggeredScrollAnimation } from '@/hooks/useScrollAnimation'
import { codaiProjects, getProjectsByTier, projectCategories, type Project } from '@/data/projects'

interface ProjectCardProps {
    project: Project
    size: 'small' | 'medium' | 'large' | 'featured'
    className?: string
    index: number
}

const ProjectCard = ({ project, size, className = '', index }: ProjectCardProps) => {
    const { elementRef, isVisible } = useScrollAnimation<HTMLDivElement>({
        threshold: 0.2,
        stagger: index * 100,
        animationType: 'cascade'
    })

    const sizeClasses = {
        small: 'col-span-1 row-span-1 h-48',
        medium: 'col-span-1 md:col-span-2 row-span-1 h-48 md:h-52',
        large: 'col-span-1 md:col-span-2 lg:col-span-3 row-span-2 h-96 md:h-80',
        featured: 'col-span-1 md:col-span-2 lg:col-span-4 row-span-2 h-96 md:h-96'
    }

    const textSizes = {
        small: { title: 'text-lg', desc: 'text-sm', features: 'text-xs' },
        medium: { title: 'text-xl', desc: 'text-sm', features: 'text-xs' },
        large: { title: 'text-2xl', desc: 'text-base', features: 'text-sm' },
        featured: { title: 'text-3xl md:text-4xl', desc: 'text-lg', features: 'text-base' }
    }

    const statusColors = {
        production: 'bg-green-500/20 text-green-300 border-green-400/30',
        development: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
        beta: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
        planned: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
        'coming-soon': 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30'
    }

    return (
        <div
            ref={elementRef}
            className={`
        ${sizeClasses[size]} 
        ${className}
        group relative overflow-hidden rounded-3xl border border-white/10 
        bg-gradient-to-br ${project.gradient} 
        hover:border-white/20 hover:shadow-2xl hover:shadow-blue-500/10
        transition-all duration-500 ease-out transform hover:scale-[1.02] hover:-translate-y-2
        cursor-pointer
        ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}
      `}
            style={{
                transitionDelay: `${index * 100}ms`
            }}
            onClick={() => {
                // Navigate to project domain
                if (project.domain.startsWith('http')) {
                    window.open(project.domain, '_blank')
                } else {
                    window.open(`https://${project.domain}`, '_blank')
                }
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] opacity-60" />

            {/* Content */}
            <div className="relative p-6 h-full flex flex-col justify-between">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${statusColors[project.status]}`}>
                                {project.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Tier Badge */}
                    <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white/70 font-medium">Tier {project.tier}</span>
                    </div>
                </div>

                {/* Title & Domain */}
                <div className="mb-4">
                    <h3 className={`${textSizes[size].title} font-bold text-white mb-2 group-hover:text-white transition-colors`}>
                        {project.name}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                        <span className="text-sm text-white/60 font-mono bg-black/20 px-2 py-1 rounded backdrop-blur-sm">
                            {project.domain}
                        </span>
                        <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60 transition-colors" />
                    </div>
                </div>

                {/* Description */}
                <div className="mb-4 flex-grow">
                    <p className={`${textSizes[size].desc} text-white/80 leading-relaxed`}>
                        {size === 'featured' ? project.fullDescription : project.description}
                    </p>
                </div>

                {/* Features (for larger cards) */}
                {(size === 'large' || size === 'featured') && (
                    <div className="mb-4">
                        <ul className="space-y-1">
                            {project.features.slice(0, size === 'featured' ? 4 : 2).map((feature, idx) => (
                                <li key={idx} className={`${textSizes[size].features} text-white/70 flex items-start space-x-2`}>
                                    <span className="w-1 h-1 bg-white/50 rounded-full mt-2 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">
                        {project.category}
                    </div>

                    <div className="flex items-center space-x-2 text-white/70 group-hover:text-white transition-colors">
                        <span className="text-sm font-medium">Explore</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
        </div>
    )
}

const FilterTabs = ({ activeFilter, onFilterChange }: {
    activeFilter: 'all' | number,
    onFilterChange: (filter: 'all' | number) => void
}) => {
    const tierCounts = {
        1: getProjectsByTier(1).length,
        2: getProjectsByTier(2).length,
        3: getProjectsByTier(3).length,
        4: getProjectsByTier(4).length,
        5: getProjectsByTier(5).length,
    }

    return (
        <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
                onClick={() => onFilterChange('all')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${activeFilter === 'all'
                    ? 'bg-white/20 text-white border border-white/30 shadow-lg'
                    : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15 hover:text-white'
                    }`}
            >
                All Projects ({codaiProjects.length})
            </button>

            {[1, 2, 3, 4, 5].map(tier => (
                <button
                    key={tier}
                    onClick={() => onFilterChange(tier)}
                    className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${activeFilter === tier
                        ? 'bg-white/20 text-white border border-white/30 shadow-lg'
                        : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/15 hover:text-white'
                        }`}
                >
                    Tier {tier} ({tierCounts[tier as keyof typeof tierCounts]})
                </button>
            ))}
        </div>
    )
}

export default function ProjectShowcase() {
    const { elementRef, isVisible } = useScrollAnimation<HTMLElement>({
        threshold: 0.1,
        animationType: 'fade-up'
    })
    const [activeFilter, setActiveFilter] = useState<'all' | number>('all')

    const filteredProjects = useMemo(() => {
        if (activeFilter === 'all') {
            return codaiProjects
        }
        return getProjectsByTier(activeFilter as number)
    }, [activeFilter])

    // Define card sizes for Bento grid layout
    const getCardSize = (index: number, project: Project): 'small' | 'medium' | 'large' | 'featured' => {
        // Featured projects (first few important ones)
        if (index === 0 && (project.priority === 'critical' || project.name === 'CODAI Platform')) {
            return 'featured'
        }

        // Large cards for critical projects
        if ((index === 1 || index === 7 || index === 15) && project.priority === 'critical') {
            return 'large'
        }

        // Medium cards for high priority or special projects
        if (project.priority === 'high' || index % 6 === 2 || index % 8 === 5) {
            return 'medium'
        }

        // Default small cards
        return 'small'
    }

    return (
        <section
            id="projects"
            ref={elementRef}
            className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-indigo-900 via-slate-900 to-black relative overflow-hidden"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
            <div className="absolute top-40 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <div className={`text-center mb-16 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
                        <Filter className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-white/80 font-medium">Project Showcase</span>
                    </div>

                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                            Explore the
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                            CODAI Ecosystem
                        </span>
                    </h2>

                    <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                        Discover 42+ AI-native applications spanning every aspect of digital life,
                        from development tools to financial services, social platforms to smart automation.
                    </p>
                </div>

                {/* Filter Tabs */}
                <div className={`transition-all duration-1000 ease-out transform delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
                </div>

                {/* Project Grid - Bento Layout */}
                <div className={`transition-all duration-1000 ease-out transform delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-max">
                        {filteredProjects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                size={getCardSize(index, project)}
                                index={index}
                            />
                        ))}
                    </div>
                </div>

                {/* Call to Action */}
                <div className={`text-center mt-16 transition-all duration-1000 ease-out transform delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10 rounded-3xl p-8 max-w-4xl mx-auto">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                            Ready to Build the Future?
                        </h3>
                        <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
                            Join the CODAI ecosystem and be part of the AI-native revolution.
                            Every project is designed to work seamlessly together.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center justify-center space-x-2">
                                <span>Get Early Access</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => {
                                    const ecosystemSection = document.getElementById('ecosystem')
                                    if (ecosystemSection) {
                                        ecosystemSection.scrollIntoView({ behavior: 'smooth' })
                                    }
                                }}
                                className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
                            >
                                <span>Learn More</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}