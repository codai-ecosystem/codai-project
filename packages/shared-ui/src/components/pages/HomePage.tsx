'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthProvider'
import { useI18n } from '../../i18n'
import { AppShell } from '../layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'
import {
    BarChart3,
    Users,
    Settings,
    Bell,
    Search,
    Plus,
    Activity,
    TrendingUp,
    Zap,
    Code,
    Shield,
    ArrowRight
} from 'lucide-react'

export interface HomePageProps {
    appName: string
    appDescription?: string
    quickActions?: Array<{
        title: string
        description: string
        action: () => void
        icon?: React.ReactNode
        variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link' | 'success' | 'warning' | 'info' | 'gradient' | 'glass'
    }>
    recentActivity?: Array<{
        title: string
        description: string
        time: string
        type?: 'info' | 'success' | 'warning' | 'error'
    }>
    navigation?: Array<{
        label: string
        href: string
        active?: boolean
        icon?: React.ReactNode
    }>
    className?: string
    onViewDashboard?: () => void
    onLogout?: () => void
    brandColor?: string
}

export const HomePage: React.FC<HomePageProps> = ({
    appName,
    appDescription,
    quickActions = [],
    recentActivity = [],
    navigation = [],
    className,
    onViewDashboard,
    onLogout,
    brandColor = 'blue'
}) => {
    const { user } = useAuth()
    const { t } = useI18n()

    const defaultQuickActions = [
        {
            title: t('home.quickActions.newProject'),
            description: t('home.quickActions.newProjectDesc'),
            action: () => console.log('Create project'),
            icon: <Plus className="h-5 w-5" />,
            variant: 'default' as const
        },
        {
            title: t('home.quickActions.viewDashboard'),
            description: t('home.quickActions.viewDashboardDesc'),
            action: onViewDashboard || (() => window.location.href = '/dashboard'),
            icon: <BarChart3 className="h-5 w-5" />,
            variant: 'secondary' as const
        },
        {
            title: t('home.quickActions.settings'),
            description: t('home.quickActions.settingsDesc'),
            action: () => window.location.href = '/settings',
            icon: <Settings className="h-5 w-5" />,
            variant: 'outline' as const
        }
    ]

    const defaultActivity = [
        {
            title: t('home.activity.welcome'),
            description: t('home.activity.welcomeDesc', { appName }),
            time: t('common.time.now'),
            type: 'success' as const
        },
        {
            title: t('home.activity.profileComplete'),
            description: t('home.activity.profileCompleteDesc'),
            time: t('common.time.fewMinutesAgo'),
            type: 'info' as const
        }
    ]

    const displayQuickActions = quickActions.length > 0 ? quickActions : defaultQuickActions
    const displayActivity = recentActivity.length > 0 ? recentActivity : defaultActivity

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

    const getActivityTypeColor = (type: 'info' | 'success' | 'warning' | 'error') => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            case 'info':
            default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        }
    }

    return (
        <AppShell
            appName={appName}
            variant="home"
            isAuthenticated={true}
            user={user}
            navigation={navigation}
            onLogout={onLogout}
            className={cn("bg-gray-50 dark:bg-gray-900", className)}
        >
            <div className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-12"
                >
                    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${getBrandColorClasses(brandColor)} p-8 md:p-12 text-white`}>
                        <div className="relative z-10">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 }}
                                className="text-4xl md:text-5xl font-bold mb-4"
                            >
                                {t('home.welcome')} {user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-xl md:text-2xl mb-6 opacity-90"
                            >
                                {appDescription || t('home.welcomeDesc', { appName })}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Button
                                    size="lg"
                                    onClick={onViewDashboard || (() => window.location.href = '/dashboard')}
                                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold"
                                >
                                    <BarChart3 className="mr-2 h-5 w-5" />
                                    {t('home.viewDashboard')}
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white/30 text-white hover:bg-white/10"
                                >
                                    <Activity className="mr-2 h-5 w-5" />
                                    {t('home.viewActivity')}
                                </Button>
                            </motion.div>
                        </div>

                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4">
                            <div className="w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 -mb-4 -ml-4">
                            <div className="w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions Grid */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {t('home.quickActions.title')}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayQuickActions.map((action, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                            >
                                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group">
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4">
                                            {action.icon && (
                                                <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${getBrandColorClasses(brandColor)} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                                                    {action.icon}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                    {action.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                                    {action.description}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    onClick={action.action}
                                                    variant={action.variant || 'default'}
                                                    className="group-hover:scale-105 transition-transform duration-300"
                                                >
                                                    {t('common.getStarted')}
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Features Overview */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="mb-12"
                >
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Features */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                                    {t('home.features.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Code className="h-5 w-5 text-blue-500 mt-1" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {t('home.features.modern')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('home.features.modernDesc')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Shield className="h-5 w-5 text-green-500 mt-1" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {t('home.features.secure')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('home.features.secureDesc')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <TrendingUp className="h-5 w-5 text-purple-500 mt-1" />
                                        <div>
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                {t('home.features.scalable')}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {t('home.features.scalableDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Activity className="mr-2 h-5 w-5 text-blue-500" />
                                    {t('home.activity.title')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {displayActivity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full mt-2",
                                                activity.type === 'success' ? 'bg-green-500' :
                                                    activity.type === 'warning' ? 'bg-yellow-500' :
                                                        activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                                            )} />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.title}
                                                </p>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.section>
            </div>
        </AppShell>
    )
}
