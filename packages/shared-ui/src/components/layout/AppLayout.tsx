'use client'

import React, { useEffect, ReactNode, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth, AuthConfig } from '../../hooks/useAuth'
import { RouteGuard, createDefaultRouteConfig, AppRouteConfig } from '../../utils/routing'
import { Header, HeaderProps } from './Header'
import { Footer, FooterProps } from './Footer'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { AppFooter } from './AppFooter'
import LandingPage from '../pages/LandingPage'
import { cn } from '../../lib/utils'
import type { AppName } from '../../config/design-tokens'

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
    // New design system props
    useNewDesign?: boolean
    showSidebar?: boolean
    sidebarCollapsedByDefault?: boolean
    user?: {
        name: string
        email: string
        avatar?: string
    }
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
    errorComponent,
    // New design system props
    useNewDesign = true,
    showSidebar = true,
    sidebarCollapsedByDefault = false,
    user,
}: AppLayoutProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(sidebarCollapsedByDefault)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Setup authentication and routing
    const auth = useAuth(authConfig)
    const config = routeConfig ? { ...createDefaultRouteConfig(appName), ...routeConfig } : createDefaultRouteConfig(appName)
    const routeGuard = new RouteGuard(config)

    // Handle responsive sidebar behavior for new design
    useEffect(() => {
        if (useNewDesign) {
            const handleResize = () => {
                if (window.innerWidth < 768) {
                    setSidebarCollapsed(true)
                    setMobileMenuOpen(false)
                }
            }

            handleResize()
            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [useNewDesign])

    // Close mobile menu when route changes
    useEffect(() => {
        if (useNewDesign) {
            setMobileMenuOpen(false)
        }
    }, [pathname, useNewDesign])

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
            <div className={cn(
                'min-h-screen flex items-center justify-center',
                useNewDesign ? 'bg-background' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            )}>
                {loadingComponent || (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        <div className={cn(
                            'w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto',
                            useNewDesign ? 'bg-primary text-primary-foreground' : 'bg-gradient-to-r from-blue-600 to-purple-600'
                        )}>
                            <span className="font-bold text-xl">{appName.charAt(0)}</span>
                        </div>
                        <div className={cn(
                            'animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4',
                            useNewDesign ? 'border-primary' : 'border-blue-500'
                        )}></div>
                        <p className={useNewDesign ? 'text-muted-foreground' : 'text-slate-400'}>
                            Loading {appName}...
                        </p>
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
            <div className={cn(
                'min-h-screen flex items-center justify-center',
                useNewDesign ? 'bg-background' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            )}>
                {errorComponent || (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-md mx-auto p-8"
                    >
                        <div className={cn(
                            'w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto',
                            useNewDesign ? 'bg-destructive/20' : 'bg-red-500/20'
                        )}>
                            <span className={cn('text-2xl', useNewDesign ? 'text-destructive' : 'text-red-400')}>⚠️</span>
                        </div>
                        <h1 className={cn('text-2xl font-bold mb-2', useNewDesign ? 'text-foreground' : 'text-white')}>
                            Access Denied
                        </h1>
                        <p className={cn('mb-6', useNewDesign ? 'text-muted-foreground' : 'text-slate-400')}>
                            You don't have permission to access this page.
                        </p>
                        <button
                            onClick={() => router.push(config.auth.dashboardPage)}
                            className={cn(
                                'px-6 py-3 rounded-lg transition-colors',
                                useNewDesign
                                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            )}
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                )}
            </div>
        )
    }

    // NEW DESIGN SYSTEM LAYOUT
    if (useNewDesign) {
        return (
            <div className={cn('min-h-screen bg-background', className)}>
                {/* Header */}
                {showHeader && (
                    <AppHeader
                        appName={appName as AppName}
                        user={user}
                        onMenuToggle={showSidebar ? () => setMobileMenuOpen(!mobileMenuOpen) : undefined}
                    />
                )}

                <div className="flex h-[calc(100vh-4rem)]">
                    {/* Sidebar */}
                    {showSidebar && (
                        <>
                            {/* Desktop sidebar */}
                            <div className="hidden md:block">
                                <AppSidebar
                                    appName={appName as AppName}
                                    isCollapsed={sidebarCollapsed}
                                    onToggleCollapse={setSidebarCollapsed}
                                    currentPath={pathname}
                                />
                            </div>

                            {/* Mobile sidebar overlay */}
                            <AnimatePresence>
                                {mobileMenuOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="fixed inset-0 z-40 bg-black/50 md:hidden"
                                            onClick={() => setMobileMenuOpen(false)}
                                        />

                                        {/* Mobile sidebar */}
                                        <motion.div
                                            initial={{ x: '-100%' }}
                                            animate={{ x: 0 }}
                                            exit={{ x: '-100%' }}
                                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                            className="fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 md:hidden"
                                        >
                                            <AppSidebar
                                                appName={appName as AppName}
                                                isCollapsed={false}
                                                currentPath={pathname}
                                                className="h-full"
                                            />
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </>
                    )}

                    {/* Main content area */}
                    <main className="flex-1 flex flex-col overflow-hidden">
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 md:p-6"
                            >
                                {children}
                            </motion.div>
                        </div>

                        {/* Footer */}
                        {showFooter && <AppFooter appName={appName as AppName} />}
                    </main>
                </div>
            </div>
        )
    }

    // LEGACY LAYOUT (existing design)
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
