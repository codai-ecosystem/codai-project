'use client'

import React, { useEffect, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, AuthConfig } from '../../hooks/useAuth'
import { RouteGuard, createDefaultRouteConfig, AppRouteConfig } from '../../utils/routing'
import { Header, HeaderProps } from './Header'
import { Footer, FooterProps } from './Footer'
import LandingPage from '../pages/LandingPage'

interface AppLayoutProps {
    children: ReactNode
    appName: string
    appDescription?: string
    appTagline?: string
    authConfig?: Partial<AuthConfig>
    routeConfig?: Partial<AppRouteConfig>
    headerProps?: Partial<HeaderProps>
    footerProps?: Partial<FooterProps>
    showHeader?: boolean
    showFooter?: boolean
    landingPageProps?: any
    className?: string
    loadingComponent?: ReactNode
    errorComponent?: ReactNode
}

export function AppLayout({
    children,
    appName,
    appDescription,
    appTagline,
    authConfig = {},
    routeConfig,
    headerProps = {},
    footerProps = {},
    showHeader = true,
    showFooter = true,
    landingPageProps = {},
    className = '',
    loadingComponent,
    errorComponent
}: AppLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()

    // Setup authentication and routing
    const auth = useAuth(authConfig)
    const config = routeConfig ? { ...createDefaultRouteConfig(appName), ...routeConfig } : createDefaultRouteConfig(appName)
    const routeGuard = new RouteGuard(config)

    // Handle route protection and redirects
    useEffect(() => {
        if (!auth.isLoading) {
            const redirectPath = routeGuard.getRequiredRedirect(pathname, auth.isAuthenticated, auth.user?.role)

            if (redirectPath && redirectPath !== pathname) {
                router.push(redirectPath)
            }
        }
    }, [pathname, auth.isLoading, auth.isAuthenticated, auth.user?.role, router])

    // Show loading state
    if (auth.isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                {loadingComponent || (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <span className="text-white font-bold text-xl">{appName.charAt(0)}</span>
                        </div>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-slate-400">Loading {appName}...</p>
                    </motion.div>
                )}
            </div>
        )
    }

    // Show landing page for non-authenticated users on root path
    if (!auth.isAuthenticated && pathname === config.auth.landingPage) {
        return (
            <LandingPage
                appName={appName}
                appDescription={appDescription}
                appTagline={appTagline}
                onGetStarted={() => router.push('/signup')}
                onSignIn={() => router.push('/login')}
                onSignUp={() => router.push('/signup')}
                {...landingPageProps}
            />
        )
    }

    // Check if user can access current route
    if (!routeGuard.canAccess(pathname, auth.isAuthenticated, auth.user?.role)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                {errorComponent || (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md mx-auto p-8"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                            <span className="text-red-400 text-2xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                        <p className="text-slate-400 mb-6">
                            You don't have permission to access this page.
                        </p>
                        <button
                            onClick={() => router.push(config.auth.dashboardPage)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                )}
            </div>
        )
    }

    // Default authenticated layout
    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white ${className}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="min-h-screen flex flex-col"
                >
                    {/* Header */}
                    {showHeader && (
                        <Header
                            title={appName}
                            subtitle={appDescription}
                            showThemeToggle={true}
                            showLanguageToggle={true}
                            variant="glass"
                            theme="dark"
                            {...headerProps}
                        />
                    )}

                    {/* Main Content */}
                    <main className="flex-1">
                        {children}
                    </main>

                    {/* Footer */}
                    {showFooter && (
                        <Footer
                            brandText={appName}
                            showSocial={true}
                            variant="glass"
                            {...footerProps}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default AppLayout
