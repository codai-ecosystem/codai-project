'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, Sparkles, Zap, Cpu, Globe, ArrowRight } from 'lucide-react'
import { useScrollAnimation, useParallaxBackground } from '@/hooks/useScrollAnimation'
import { getTotalProjectStats } from '@/data/projects'

const dynamicWords = [
    'Intelligence',
    'Innovation',
    'Automation',
    'Efficiency',
    'Creativity',
    'Solutions',
    'Excellence',
    'Future',
    'Revolution',
    'Transformation'
]

const FloatingElements = () => {
    const parallaxOffset = useParallaxBackground(0.3)

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large floating shapes */}
            <div
                className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-xl animate-float-slow"
                style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
            />
            <div
                className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-lg animate-float-reverse"
                style={{ transform: `translateY(${parallaxOffset * 0.3}px)` }}
            />
            <div
                className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-lg animate-bounce-slow"
                style={{ transform: `translateY(${parallaxOffset * 0.4}px)` }}
            />
            <div
                className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 rounded-full blur-xl animate-float-slow"
                style={{ transform: `translateY(${parallaxOffset * 0.2}px)` }}
            />

            {/* Small sparkles */}
            <div className="absolute top-1/4 left-1/4 animate-pulse">
                <Sparkles className="w-4 h-4 text-blue-400/60" />
            </div>
            <div className="absolute top-1/3 right-1/3 animate-pulse" style={{ animationDelay: '1s' }}>
                <Sparkles className="w-3 h-3 text-purple-400/60" />
            </div>
            <div className="absolute bottom-1/3 left-1/3 animate-pulse" style={{ animationDelay: '2s' }}>
                <Sparkles className="w-5 h-5 text-cyan-400/60" />
            </div>
            <div className="absolute bottom-1/4 right-1/4 animate-pulse" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-3 h-3 text-indigo-400/60" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>
    )
}

const AnimatedStats = ({ isVisible }: { isVisible: boolean }) => {
    const stats = getTotalProjectStats()
    const [counters, setCounters] = useState({
        total: 0,
        production: 0,
        categories: 0,
        tiers: 0
    })

    useEffect(() => {
        if (!isVisible) return

        const animateCounter = (
            target: number,
            key: keyof typeof counters,
            duration: number = 2000,
            delay: number = 0
        ) => {
            setTimeout(() => {
                let startTime: number | null = null

                const animate = (timestamp: number) => {
                    if (startTime === null) startTime = timestamp

                    const elapsed = timestamp - startTime
                    const progress = Math.min(elapsed / duration, 1)
                    const easeOut = 1 - Math.pow(1 - progress, 3)

                    setCounters(prev => ({
                        ...prev,
                        [key]: Math.floor(target * easeOut)
                    }))

                    if (progress < 1) {
                        requestAnimationFrame(animate)
                    } else {
                        setCounters(prev => ({ ...prev, [key]: target }))
                    }
                }

                requestAnimationFrame(animate)
            }, delay)
        }

        animateCounter(stats.total, 'total', 2000, 0)
        animateCounter(stats.production, 'production', 1800, 200)
        animateCounter(stats.categories, 'categories', 1600, 400)
        animateCounter(stats.tiers, 'tiers', 1400, 600)
    }, [isVisible, stats])

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {counters.total}+
                </div>
                <div className="text-sm text-white/70">Total Projects</div>
            </div>
            <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {counters.production}
                </div>
                <div className="text-sm text-white/70">In Production</div>
            </div>
            <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {counters.categories}
                </div>
                <div className="text-sm text-white/70">Categories</div>
            </div>
            <div className="text-center group">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2 transform group-hover:scale-110 transition-transform duration-300">
                    {counters.tiers}
                </div>
                <div className="text-sm text-white/70">Service Tiers</div>
            </div>
        </div>
    )
}

const DynamicWordRotation = () => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentWordIndex((prev) => (prev + 1) % dynamicWords.length)
                setIsAnimating(false)
            }, 300)
        }, 3500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="inline-block relative h-20 overflow-hidden">
            <span
                className={`absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent font-bold transition-all duration-300 ease-out transform ${isAnimating
                    ? '-translate-y-full opacity-0 scale-95'
                    : 'translate-y-0 opacity-100 scale-100'
                    }`}
            >
                {dynamicWords[currentWordIndex]}
            </span>
        </div>
    )
}

export default function HeroSection() {
    const { elementRef, isVisible } = useScrollAnimation<HTMLElement>({
        threshold: 0.1,
        animationType: 'header'
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div>
                </div>
            </section>
        )
    }

    const handleScrollToProjects = () => {
        const projectsSection = document.getElementById('projects')
        if (projectsSection) {
            projectsSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    const handleExploreEcosystem = () => {
        const ecosystemSection = document.getElementById('ecosystem')
        if (ecosystemSection) {
            ecosystemSection.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <section
            ref={elementRef}
            className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center"
        >
            {/* Background Effects */}
            <FloatingElements />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

            {/* Main Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                {/* Main Heading */}
                <div className={`transition-all duration-1000 ease-out transform ${isVisible
                    ? 'translate-y-0 opacity-100 scale-100'
                    : 'translate-y-8 opacity-0 scale-95'
                    }`}>
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
                        <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                            The Future of
                        </span>
                        <br />
                        <span className="block mt-2">
                            <DynamicWordRotation />
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
                            is CODAI
                        </span>
                    </h1>
                </div>

                {/* Subtitle */}
                <div className={`transition-all duration-1000 ease-out transform delay-300 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                    }`}>
                    <p className="text-xl sm:text-2xl md:text-3xl text-white/80 mb-8 max-w-4xl mx-auto leading-relaxed">
                        Discover the world&apos;s first <strong className="text-white font-semibold">AI-native ecosystem</strong> with{' '}
                        <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-semibold">
                            42+ intelligent applications
                        </span>{' '}
                        spanning every aspect of digital life
                    </p>
                </div>

                {/* Feature Icons */}
                <div className={`flex flex-wrap justify-center gap-8 mb-12 transition-all duration-1000 ease-out transform delay-500 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="flex items-center space-x-2 group">
                        <div className="p-3 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 group-hover:bg-blue-500/30 transition-colors">
                            <Cpu className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
                        </div>
                        <span className="text-white/70 font-medium group-hover:text-white/90 transition-colors">AI-Native</span>
                    </div>

                    <div className="flex items-center space-x-2 group">
                        <div className="p-3 bg-purple-500/20 rounded-xl backdrop-blur-sm border border-purple-400/30 group-hover:bg-purple-500/30 transition-colors">
                            <Zap className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                        </div>
                        <span className="text-white/70 font-medium group-hover:text-white/90 transition-colors">Lightning Fast</span>
                    </div>

                    <div className="flex items-center space-x-2 group">
                        <div className="p-3 bg-cyan-500/20 rounded-xl backdrop-blur-sm border border-cyan-400/30 group-hover:bg-cyan-500/30 transition-colors">
                            <Globe className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                        </div>
                        <span className="text-white/70 font-medium group-hover:text-white/90 transition-colors">Global Scale</span>
                    </div>
                </div>

                {/* CTA Buttons */}
                <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-1000 ease-out transform delay-700 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                    }`}>
                    <button
                        onClick={handleExploreEcosystem}
                        className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-2"
                    >
                        <span>Explore Ecosystem</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={handleScrollToProjects}
                        className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center space-x-2"
                    >
                        <span>View Projects</span>
                        <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    </button>
                </div>

                {/* Animated Stats */}
                <div className={`transition-all duration-1000 ease-out transform delay-1000 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                    }`}>
                    <AnimatedStats isVisible={isVisible} />
                </div>

                {/* Scroll Indicator */}
                <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ease-out delay-1200 ${isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'translate-y-8 opacity-0'
                    }`}>
                    <div className="animate-bounce">
                        <ChevronDown className="w-8 h-8 text-white/50 hover:text-white/70 transition-colors" />
                    </div>
                </div>
            </div>
        </section>
    )
}