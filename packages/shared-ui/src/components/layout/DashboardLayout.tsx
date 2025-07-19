'use client'

import * as React from "react"
import { cn } from "../../lib/utils"
import { Header, HeaderProps } from "./Header"
import { Footer, FooterProps } from "./Footer"
import { ErrorBoundary } from "../ui/ErrorBoundary"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { useAuth } from "../../hooks/useAuth"
import { useI18n } from "../../i18n"

export interface DashboardLayoutProps {
    children: React.ReactNode
    className?: string
    header?: Partial<HeaderProps> | false
    footer?: Partial<FooterProps> | false
    sidebar?: React.ReactNode | false
    loading?: boolean
    error?: Error | null
    requireAuth?: boolean
    fallbackPath?: string
    showBreadcrumbs?: boolean
    breadcrumbs?: Array<{
        label: string
        href?: string
    }>
    pageTitle?: string
    pageDescription?: string
    actions?: React.ReactNode
}

const DashboardLayout = React.forwardRef<HTMLDivElement, DashboardLayoutProps>(
    ({
        children,
        className,
        header,
        footer,
        sidebar,
        loading = false,
        error = null,
        requireAuth = true,
        fallbackPath = "/landing",
        showBreadcrumbs = false,
        breadcrumbs = [],
        pageTitle,
        pageDescription,
        actions,
        ...props
    }, ref) => {
        const { isAuthenticated, isLoading: authLoading, user } = useAuth()
        const { t, locale, setLocale } = useI18n()
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')
        const [sidebarOpen, setSidebarOpen] = React.useState(false)

        // Theme management
        React.useEffect(() => {
            const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
            if (savedTheme) {
                setTheme(savedTheme)
                document.documentElement.classList.toggle('dark', savedTheme === 'dark')
            }
        }, [])

        const toggleTheme = React.useCallback(() => {
            const newTheme = theme === 'light' ? 'dark' : 'light'
            setTheme(newTheme)
            localStorage.setItem('theme', newTheme)
            document.documentElement.classList.toggle('dark', newTheme === 'dark')
        }, [theme])

        const toggleLanguage = React.useCallback(() => {
            const newLocale = locale === 'en' ? 'ro' : 'en'
            setLocale(newLocale)
        }, [locale, setLocale])

        // Auth redirect
        React.useEffect(() => {
            if (requireAuth && !authLoading && !isAuthenticated) {
                window.location.href = fallbackPath
            }
        }, [requireAuth, authLoading, isAuthenticated, fallbackPath])

        // Show loading during auth check
        if (authLoading || (requireAuth && !isAuthenticated)) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <LoadingSpinner size="lg" text={t('common.loading')} centered />
                </div>
            )
        }

        // Show error state
        if (error) {
            return (
                <div className="min-h-screen bg-background">
                    <ErrorBoundary>
                        <div className="container mx-auto px-4 py-8">
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-destructive mb-4">
                                    {t('errors.something_went_wrong')}
                                </h1>
                                <p className="text-muted-foreground">
                                    {error.message || t('errors.generic_message')}
                                </p>
                            </div>
                        </div>
                    </ErrorBoundary>
                </div>
            )
        }

        const defaultHeaderProps: Partial<HeaderProps> = {
            title: "CODAI",
            subtitle: user?.name ? `Welcome, ${user.name}` : undefined,
            theme,
            language: locale,
            onThemeToggle: toggleTheme,
            onLanguageToggle: toggleLanguage,
            onMenuToggle: () => setSidebarOpen(!sidebarOpen),
            actions: actions,
            navigation: [
                { label: t('nav.dashboard'), href: '/dashboard', active: true },
                { label: t('nav.projects'), href: '/projects' },
                { label: t('nav.settings'), href: '/settings' },
            ]
        }

        return (
            <ErrorBoundary>
                <div
                    ref={ref}
                    className={cn("min-h-screen bg-background flex flex-col", className)}
                    {...props}
                >
                    {/* Header */}
                    {header !== false && (
                        <Header {...defaultHeaderProps} {...header} />
                    )}

                    <div className="flex flex-1">
                        {/* Sidebar */}
                        {sidebar !== false && (
                            <aside className={cn(
                                "fixed inset-y-0 left-0 z-40 w-64 transform bg-card border-r transition-transform duration-200 ease-in-out",
                                "lg:relative lg:translate-x-0",
                                sidebarOpen ? "translate-x-0" : "-translate-x-full"
                            )}>
                                {sidebar || (
                                    <div className="p-4">
                                        <nav className="space-y-2">
                                            <a
                                                href="/dashboard"
                                                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground"
                                            >
                                                {t('nav.dashboard')}
                                            </a>
                                            <a
                                                href="/projects"
                                                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                                            >
                                                {t('nav.projects')}
                                            </a>
                                            <a
                                                href="/settings"
                                                className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
                                            >
                                                {t('nav.settings')}
                                            </a>
                                        </nav>
                                    </div>
                                )}
                            </aside>
                        )}

                        {/* Overlay for mobile sidebar */}
                        {sidebarOpen && sidebar !== false && (
                            <div
                                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}

                        {/* Main content */}
                        <main className={cn(
                            "flex-1 flex flex-col",
                            sidebar !== false ? "lg:ml-0" : ""
                        )}>
                            {/* Page header with breadcrumbs */}
                            {(showBreadcrumbs || pageTitle) && (
                                <div className="border-b bg-card">
                                    <div className="container px-4 py-4">
                                        {showBreadcrumbs && breadcrumbs.length > 0 && (
                                            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                {breadcrumbs.map((crumb, index) => (
                                                    <React.Fragment key={index}>
                                                        {index > 0 && <span>/</span>}
                                                        {crumb.href ? (
                                                            <a
                                                                href={crumb.href}
                                                                className="hover:text-foreground transition-colors"
                                                            >
                                                                {crumb.label}
                                                            </a>
                                                        ) : (
                                                            <span className="text-foreground">{crumb.label}</span>
                                                        )}
                                                    </React.Fragment>
                                                ))}
                                            </nav>
                                        )}

                                        {pageTitle && (
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
                                                    {pageDescription && (
                                                        <p className="text-muted-foreground mt-1">{pageDescription}</p>
                                                    )}
                                                </div>
                                                {actions && (
                                                    <div className="flex items-center gap-2">
                                                        {actions}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Content area */}
                            <div className="flex-1 container px-4 py-6">
                                {loading ? (
                                    <LoadingSpinner size="lg" text={t('common.loading')} centered />
                                ) : (
                                    children
                                )}
                            </div>
                        </main>
                    </div>

                    {/* Footer */}
                    {footer !== false && (
                        <Footer {...footer} />
                    )}
                </div>
            </ErrorBoundary>
        )
    }
)

DashboardLayout.displayName = "DashboardLayout"

export { DashboardLayout }
