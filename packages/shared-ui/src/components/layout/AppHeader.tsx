/**
 * App Header Component for CODAI Ecosystem
 * Features: App switcher, universal search, notifications, theme toggle, language switcher, user menu
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../contexts/ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Bell,
    Menu,
    Grid3x3,
    Settings,
    User,
    LogOut,
    Moon,
    Sun,
    Monitor,
    Globe,
    ChevronDown,
    X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { AppName } from '../../config/design-tokens'
import { appConfigs } from '../../config/appConfigs'

interface AppHeaderProps {
    appName: AppName
    className?: string
    showAppSwitcher?: boolean
    showSearch?: boolean
    showNotifications?: boolean
    onMenuToggle?: () => void
    user?: {
        name: string
        email: string
        avatar?: string
    }
}

export function AppHeader({
    appName,
    className,
    showAppSwitcher = true,
    showSearch = true,
    showNotifications = true,
    onMenuToggle,
    user,
}: AppHeaderProps) {
    const { t } = useTranslation()
    const { theme, setTheme, toggleTheme } = useTheme()
    const [showAppSwitcherPanel, setShowAppSwitcherPanel] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotificationsPanel, setShowNotificationsPanel] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const currentApp = appConfigs[appName]

    return (
        <header className={cn(
            'sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm',
            className
        )}>
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left side: Menu toggle, App info, App switcher */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu toggle */}
                    {onMenuToggle && (
                        <button
                            onClick={onMenuToggle}
                            className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground md:hidden"
                            aria-label={t('a11y.toggleMenu')}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    )}

                    {/* Current app info */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
                            {currentApp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-semibold text-foreground">
                                {currentApp.name}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {t(currentApp.description)}
                            </p>
                        </div>
                    </div>

                    {/* App switcher */}
                    {showAppSwitcher && (
                        <div className="relative">
                            <button
                                onClick={() => setShowAppSwitcherPanel(!showAppSwitcherPanel)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
                                aria-label={t('ecosystem.appSwitcher')}
                            >
                                <Grid3x3 className="h-5 w-5" />
                            </button>

                            <AnimatePresence>
                                {showAppSwitcherPanel && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowAppSwitcherPanel(false)}
                                        />

                                        {/* App switcher panel */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border bg-popover p-4 shadow-lg"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="text-sm font-medium">{t('ecosystem.allApps')}</h3>
                                                <button
                                                    onClick={() => setShowAppSwitcherPanel(false)}
                                                    className="rounded-sm p-1 hover:bg-accent"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2">
                                                {Object.entries(appConfigs).map(([key, config]) => (
                                                    <a
                                                        key={key}
                                                        href={`https://${key}.ro`}
                                                        className={cn(
                                                            'flex flex-col items-center gap-2 rounded-lg p-3 hover:bg-accent',
                                                            key === appName && 'bg-accent'
                                                        )}
                                                    >
                                                        <div
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-xs font-semibold"
                                                            style={{ backgroundColor: config.theme.primary }}
                                                        >
                                                            {config.name.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span className="text-xs text-center">{config.name}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Center: Universal search */}
                {showSearch && (
                    <div className="flex-1 max-w-md mx-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('form.searchPlaceholder')}
                                className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            />
                        </div>
                    </div>
                )}

                {/* Right side: Notifications, Theme toggle, Language switcher, User menu */}
                <div className="flex items-center gap-2">
                    {/* Notifications */}
                    {showNotifications && (
                        <div className="relative">
                            <button
                                onClick={() => setShowNotificationsPanel(!showNotificationsPanel)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground relative"
                                aria-label={t('nav.notifications')}
                            >
                                <Bell className="h-5 w-5" />
                                {/* Notification badge */}
                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
                            </button>

                            <AnimatePresence>
                                {showNotificationsPanel && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowNotificationsPanel(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-popover p-4 shadow-lg"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <h3 className="text-sm font-medium">{t('nav.notifications')}</h3>
                                                <button
                                                    onClick={() => setShowNotificationsPanel(false)}
                                                    className="rounded-sm p-1 hover:bg-accent"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="rounded-lg bg-accent p-3">
                                                    <p className="text-sm">Welcome to {currentApp.name}!</p>
                                                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                                                </div>
                                                <div className="text-center text-sm text-muted-foreground py-4">
                                                    {t('messages.noData')}
                                                </div>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground"
                        aria-label={`Current theme: ${theme}. Click to toggle.`}
                    >
                        {theme === 'light' && <Sun className="h-5 w-5" />}
                        {theme === 'dark' && <Moon className="h-5 w-5" />}
                        {theme === 'system' && <Monitor className="h-5 w-5" />}
                    </button>

                    {/* Language switcher */}
                    <button className="inline-flex items-center justify-center rounded-md p-2 text-foreground hover:bg-accent hover:text-accent-foreground">
                        <Globe className="h-5 w-5" />
                    </button>

                    {/* User menu */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 rounded-md p-2 hover:bg-accent hover:text-accent-foreground"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="h-6 w-6 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            <AnimatePresence>
                                {showUserMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                            className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border bg-popover p-2 shadow-lg"
                                        >
                                            <div className="px-3 py-2 border-b">
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>

                                            <div className="py-1">
                                                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent">
                                                    <User className="h-4 w-4" />
                                                    {t('nav.profile')}
                                                </button>
                                                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent">
                                                    <Settings className="h-4 w-4" />
                                                    {t('nav.settings')}
                                                </button>
                                                <hr className="my-1" />
                                                <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-accent">
                                                    <LogOut className="h-4 w-4" />
                                                    {t('nav.logout')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    </>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AppHeader
