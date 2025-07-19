'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Code, Zap, Shield, Users, Star } from 'lucide-react'
// import { useTranslation } from '@codai/translations'
import { useI18n } from '../../i18n'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

interface LandingPageProps {
    appName: string
    appDescription?: string
    appTagline?: string
    onGetStarted?: () => void
    onSignIn?: () => void
    onSignUp?: () => void
    features?: LandingFeature[]
    className?: string
    showHero?: boolean
    showFeatures?: boolean
    showCTA?: boolean
    heroImage?: string
    brandColor?: string
}

interface LandingFeature {
    title: string
    description: string
    icon: React.ReactNode
    status?: 'active' | 'beta' | 'coming-soon'
}

const defaultFeatures: LandingFeature[] = [
    {
        title: 'AI-Powered Intelligence',
        description: 'Advanced AI capabilities to enhance your workflow and productivity',
        icon: <Brain className="h-6 w-6" />,
        status: 'active'
    },
    {
        title: 'Modern Development',
        description: 'Built with cutting-edge technologies for optimal performance',
        icon: <Code className="h-6 w-6" />,
        status: 'active'
    },
    {
        title: 'Lightning Fast',
        description: 'Optimized for speed and efficiency across all operations',
        icon: <Zap className="h-6 w-6" />,
        status: 'active'
    },
    {
        title: 'Enterprise Security',
        description: 'Bank-grade security with end-to-end encryption',
        icon: <Shield className="h-6 w-6" />,
        status: 'active'
    }
]

export function LandingPage({
    appName,
    appDescription,
    appTagline,
    onGetStarted,
    onSignIn,
    onSignUp,
    features = defaultFeatures,
    className,
    showHero = true,
    showFeatures = true,
    showCTA = true,
    heroImage,
    brandColor = 'blue'
}: LandingPageProps) {
    const { t } = useI18n()

    const [isLoading, setIsLoading] = useState(false)

    const handleGetStarted = async () => {
        if (onGetStarted) {
            setIsLoading(true)
            try {
                await onGetStarted()
            } finally {
                setIsLoading(false)
            }
        }
    }

    const getBrandColorClasses = (color: string) => {
        const colorMap: Record<string, string> = {
            blue: 'from-blue-600 to-blue-800',
            purple: 'from-purple-600 to-purple-800',
            green: 'from-green-600 to-green-800',
            red: 'from-red-600 to-red-800',
            indigo: 'from-indigo-600 to-indigo-800',
            teal: 'from-teal-600 to-teal-800'
        }
        return colorMap[color] || colorMap.blue
    }

    const getFeatureStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-400 bg-green-400/20'
            case 'beta': return 'text-yellow-400 bg-yellow-400/20'
            case 'coming-soon': return 'text-gray-400 bg-gray-400/20'
            default: return 'text-gray-400 bg-gray-400/20'
        }
    }

    return (
        <div className={cn(
            "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden",
            className
        )}>
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className={`absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${getBrandColorClasses(brandColor)} rounded-full mix-blend-multiply filter blur-xl opacity-20`}
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -100, 50, 0],
                        scale: [1, 1.2, 0.8, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, -50, 100, 0],
                        y: [0, 50, -100, 0],
                        scale: [1, 0.8, 1.2, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, delay: 5 }}
                />
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex justify-between items-center p-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center space-x-2"
                >
                    <div className={`w-8 h-8 bg-gradient-to-r ${getBrandColorClasses(brandColor)} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{appName.charAt(0)}</span>
                    </div>
                    <span className="text-xl font-bold">{appName}</span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex items-center space-x-4"
                >
                    {onSignIn && (
                        <Button
                            variant="ghost"
                            onClick={onSignIn}
                            className="text-slate-300 hover:text-white"
                        >
                            {t('auth.signIn')}
                        </Button>
                    )}
                    {onSignUp && (
                        <Button
                            onClick={onSignUp}
                            className={`bg-gradient-to-r ${getBrandColorClasses(brandColor)} hover:opacity-90`}
                        >
                            {t('auth.signUp')}
                        </Button>
                    )}
                </motion.div>
            </nav>

            {/* Hero Section */}
            {showHero && (
                <section className="relative z-10 px-6 md:px-12 py-20 md:py-32">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <div className="flex items-center space-x-2 mb-6">
                                    <div className="flex items-center space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-slate-400 text-sm">Trusted by developers worldwide</span>
                                </div>

                                <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                    <span className={`bg-gradient-to-r ${getBrandColorClasses(brandColor)} bg-clip-text text-transparent`}>
                                        {appName}
                                    </span>
                                    <br />
                                    <span className="text-white">Platform</span>
                                </h1>

                                {appTagline && (
                                    <p className="text-xl md:text-2xl text-slate-300 mb-6 font-light">
                                        {appTagline}
                                    </p>
                                )}

                                {appDescription && (
                                    <p className="text-lg text-slate-400 mb-8 max-w-lg">
                                        {appDescription}
                                    </p>
                                )}

                                <div className="flex flex-col sm:flex-row gap-4">
                                    {onGetStarted && (
                                        <Button
                                            size="lg"
                                            onClick={handleGetStarted}
                                            disabled={isLoading}
                                            className={`bg-gradient-to-r ${getBrandColorClasses(brandColor)} hover:opacity-90 text-lg px-8 py-4`}
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    {t('common.loading')}
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    {t('common.getStarted')}
                                                    <ArrowRight className="ml-2 h-5 w-5" />
                                                </div>
                                            )}
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10"
                                    >
                                        Learn More
                                    </Button>
                                </div>

                                <div className="flex items-center space-x-6 mt-8 text-sm text-slate-400">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <span>Live & Active</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4" />
                                        <span>10k+ Users</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Shield className="h-4 w-4" />
                                        <span>Enterprise Ready</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="lg:order-first"
                            >
                                <div className="glassmorphism bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
                                    {heroImage ? (
                                        <img
                                            src={heroImage}
                                            alt={`${appName} Platform`}
                                            className="w-full h-64 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-64 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                                            <div className={`w-16 h-16 bg-gradient-to-r ${getBrandColorClasses(brandColor)} rounded-xl flex items-center justify-center`}>
                                                <span className="text-white font-bold text-2xl">{appName.charAt(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-white font-semibold">{appName} Dashboard</span>
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                                <span className="text-green-400 text-sm">Live</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div>
                                                <div className="text-2xl font-bold text-white">99.9%</div>
                                                <div className="text-xs text-slate-400">Uptime</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">&lt;100ms</div>
                                                <div className="text-xs text-slate-400">Response</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-white">24/7</div>
                                                <div className="text-xs text-slate-400">Support</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            {showFeatures && features.length > 0 && (
                <section className="relative z-10 px-6 md:px-12 py-20">
                    <div className="max-w-6xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                <span className="text-white">Powerful </span>
                                <span className={`bg-gradient-to-r ${getBrandColorClasses(brandColor)} bg-clip-text text-transparent`}>
                                    Features
                                </span>
                            </h2>
                            <p className="text-xl text-slate-400 max-w-3xl mx-auto">
                                Everything you need to build, deploy, and scale your applications with confidence
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.8 + index * 0.1 }}
                                    className="glassmorphism bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-12 h-12 bg-gradient-to-r ${getBrandColorClasses(brandColor)} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                                            {feature.icon}
                                        </div>
                                        {feature.status && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFeatureStatusColor(feature.status)}`}>
                                                {feature.status.replace('-', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-slate-400 text-sm">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            {showCTA && (
                <section className="relative z-10 px-6 md:px-12 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 1 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="glassmorphism bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                                Ready to get started?
                            </h2>
                            <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
                                Join thousands of developers and businesses already using {appName} to build the future
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {onGetStarted && (
                                    <Button
                                        size="lg"
                                        onClick={handleGetStarted}
                                        disabled={isLoading}
                                        className={`bg-gradient-to-r ${getBrandColorClasses(brandColor)} hover:opacity-90 text-lg px-8 py-4`}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                {t('common.loading')}
                                            </div>
                                        ) : (
                                            <div className="flex items-center">
                                                {t('common.getStarted')}
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </div>
                                        )}
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="text-lg px-8 py-4 border-white/20 text-white hover:bg-white/10"
                                >
                                    Schedule Demo
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </section>
            )}

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 px-6 md:px-12 py-8">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <div className={`w-6 h-6 bg-gradient-to-r ${getBrandColorClasses(brandColor)} rounded`}>
                            <span className="text-white font-bold text-xs flex items-center justify-center h-full">
                                {appName.charAt(0)}
                            </span>
                        </div>
                        <span className="text-slate-400">© 2025 {appName}. All rights reserved.</span>
                    </div>
                    <div className="flex items-center space-x-6 text-slate-400 text-sm">
                        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
                        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
                        <a href="/support" className="hover:text-white transition-colors">Support</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default LandingPage
