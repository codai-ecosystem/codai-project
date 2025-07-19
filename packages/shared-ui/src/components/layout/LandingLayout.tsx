'use client'

import * as React from "react"
import { cn } from "../../lib/utils"
import { Header, HeaderProps } from "./Header"
import { Footer, FooterProps } from "./Footer"
import { ErrorBoundary } from "../ui/ErrorBoundary"
import { LoadingSpinner } from "../ui/LoadingSpinner"
import { useAuth } from "../../hooks/useAuth"
import { useI18n } from "../../i18n"

export interface LandingLayoutProps {
    children: React.ReactNode
    className?: string
    header?: Partial<HeaderProps> | false
    footer?: Partial<FooterProps> | false
    loading?: boolean
    error?: Error | null
    redirectIfAuthenticated?: boolean
    redirectPath?: string
    variant?: 'default' | 'minimal' | 'hero' | 'center'
}

const LandingLayout = React.forwardRef<HTMLDivElement, LandingLayoutProps>(
    ({
        children,
        className,
        header,
        footer,
        loading = false,
        error = null,
        redirectIfAuthenticated = true,
        redirectPath = "/dashboard",
        variant = 'default',
        ...props
    }, ref) => {
        const { isAuthenticated, isLoading: authLoading } = useAuth()
        const { t, locale, setLocale } = useI18n()
        const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

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
            if (redirectIfAuthenticated && !authLoading && isAuthenticated) {
                window.location.href = redirectPath
            }
        }, [redirectIfAuthenticated, authLoading, isAuthenticated, redirectPath])

        // Show loading during auth check
        if (authLoading) {
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
            theme,
            language: locale,
            onThemeToggle: toggleTheme,
            onLanguageToggle: toggleLanguage,
            variant: variant === 'minimal' ? 'minimal' : 'default',
            navigation: [
                { label: t('nav.features'), href: '#features' },
                { label: t('nav.pricing'), href: '#pricing' },
                { label: t('nav.about'), href: '#about' },
                { label: t('nav.contact'), href: '#contact' },
            ],
            actions: (
                <div className="flex items-center gap-2">
                    <a
                        href="/auth/login"
                        className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {t('auth.sign_in')}
                    </a>
                    <a
                        href="/auth/signup"
                        className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                        {t('auth.get_started')}
                    </a>
                </div>
            )
        }

        const variantClasses = {
            default: "min-h-screen bg-background",
            minimal: "min-h-screen bg-background",
            hero: "min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900",
            center: "min-h-screen bg-background flex items-center justify-center"
        }

        const contentClasses = {
            default: "flex flex-col min-h-screen",
            minimal: "flex flex-col min-h-screen",
            hero: "flex flex-col min-h-screen text-white",
            center: "w-full max-w-md mx-auto"
        }

        const mainClasses = {
            default: "flex-1 container mx-auto px-4 py-8",
            minimal: "flex-1 container mx-auto px-4 py-4",
            hero: "flex-1 container mx-auto px-4 py-8",
            center: "p-0"
        }

        return (
            <ErrorBoundary>
                <div
                    ref={ref}
                    className={cn(variantClasses[variant], className)}
                    {...props}
                >
                    <div className={contentClasses[variant]}>
                        {/* Header */}
                        {header !== false && variant !== 'center' && (
                            <Header {...defaultHeaderProps} {...header} />
                        )}

                        {/* Main content */}
                        <main className={mainClasses[variant]}>
                            {loading ? (
                                <LoadingSpinner
                                    size="lg"
                                    text={t('common.loading')}
                                    centered
                                    variant={variant === 'hero' ? 'white' : 'default'}
                                />
                            ) : (
                                children
                            )}
                        </main>

                        {/* Footer */}
                        {footer !== false && variant !== 'center' && (
                            <Footer {...footer} />
                        )}
                    </div>
                </div>
            </ErrorBoundary>
        )
    }
)

LandingLayout.displayName = "LandingLayout"

export { LandingLayout }
