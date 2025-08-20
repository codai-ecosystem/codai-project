/**
 * App Sidebar Component for CODAI Ecosystem
 * Features: Collapsible navigation, app-specific menu items, ecosystem integration
 */

'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronLeft,
    ChevronRight,
    Home,
    Settings,
    HelpCircle,
    ExternalLink,
    Circle,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import type { AppName } from '../../config/design-tokens'
import { appConfigs } from '../../config/appConfigs'

interface AppSidebarProps {
    appName: AppName
    className?: string
    isCollapsed?: boolean
    onToggleCollapse?: (collapsed: boolean) => void
    currentPath?: string
}

interface NavigationItem {
    label: string
    labelKey: string
    href: string
    icon?: React.ComponentType<{ className?: string }>
    requiresAuth?: boolean
    badge?: string | number
    children?: NavigationItem[]
}

export function AppSidebar({
    appName,
    className,
    isCollapsed = false,
    onToggleCollapse,
    currentPath = '/',
}: AppSidebarProps) {
    const { t } = useTranslation()
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['main']))

    const currentApp = appConfigs[appName]
    const navigation = currentApp?.navigation || []

    const toggleGroup = (groupId: string) => {
        const newExpanded = new Set(expandedGroups)
        if (newExpanded.has(groupId)) {
            newExpanded.delete(groupId)
        } else {
            newExpanded.add(groupId)
        }
        setExpandedGroups(newExpanded)
    }

    const navigationGroups = [
        {
            id: 'main',
            label: t('nav.dashboard'),
            items: [
                {
                    label: t('nav.dashboard'),
                    labelKey: 'nav.dashboard',
                    href: '/dashboard',
                    icon: Home,
                },
                ...navigation,
            ],
        },
        {
            id: 'ecosystem',
            label: t('ecosystem.allApps'),
            items: [
                {
                    label: 'MemorAI',
                    labelKey: 'apps.memorai',
                    href: 'https://memorai.ro',
                    icon: Circle,
                    external: true,
                },
                {
                    label: 'BancAI',
                    labelKey: 'apps.bancai',
                    href: 'https://bancai.ro',
                    icon: Circle,
                    external: true,
                },
                {
                    label: 'SociAI',
                    labelKey: 'apps.sociai',
                    href: 'https://sociai.ro',
                    icon: Circle,
                    external: true,
                },
                {
                    label: 'CumpărAI',
                    labelKey: 'apps.cumparai',
                    href: 'https://cumparai.ro',
                    icon: Circle,
                    external: true,
                },
            ],
        },
        {
            id: 'support',
            label: t('nav.help'),
            items: [
                {
                    label: t('nav.settings'),
                    labelKey: 'nav.settings',
                    href: '/settings',
                    icon: Settings,
                },
                {
                    label: t('nav.help'),
                    labelKey: 'nav.help',
                    href: '/help',
                    icon: HelpCircle,
                },
            ],
        },
    ]

    const isActive = (href: string) => {
        if (href.startsWith('http')) return false
        return currentPath === href || currentPath.startsWith(href + '/')
    }

    return (
        <motion.aside
            initial={false}
            animate={{
                width: isCollapsed ? '4rem' : '16rem',
            }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={cn(
                'relative flex h-full flex-col border-r bg-background',
                className
            )}
        >
            {/* Sidebar header */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                <AnimatePresence mode="wait">
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3"
                        >
                            <div
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-semibold"
                                style={{ backgroundColor: currentApp.theme.primary }}
                            >
                                {currentApp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-sm font-semibold">{currentApp.name}</h2>
                                <p className="text-xs text-muted-foreground">
                                    {currentApp.tagline}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Collapse toggle */}
                {onToggleCollapse && (
                    <button
                        onClick={() => onToggleCollapse(!isCollapsed)}
                        className="rounded-md p-1 hover:bg-accent hover:text-accent-foreground"
                        aria-label={isCollapsed ? t('layout.sidebar.expand') : t('layout.sidebar.collapse')}
                    >
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                    {navigationGroups.map((group) => (
                        <div key={group.id}>
                            {/* Group header */}
                            <AnimatePresence>
                                {!isCollapsed && (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        onClick={() => toggleGroup(group.id)}
                                        className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    >
                                        <span>{group.label}</span>
                                        <motion.div
                                            animate={{
                                                rotate: expandedGroups.has(group.id) ? 90 : 0,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronRight className="h-3 w-3" />
                                        </motion.div>
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* Group items */}
                            <AnimatePresence>
                                {(isCollapsed || expandedGroups.has(group.id)) && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        {group.items.map((item) => {
                                            const Icon = item.icon || Circle
                                            const isItemActive = isActive(item.href)
                                            const isExternal = item.href.startsWith('http')

                                            return (
                                                <a
                                                    key={item.href}
                                                    href={item.href}
                                                    target={isExternal ? '_blank' : undefined}
                                                    rel={isExternal ? 'noopener noreferrer' : undefined}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                                                        isItemActive
                                                            ? 'bg-accent text-accent-foreground'
                                                            : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                                                        isCollapsed && 'justify-center px-2'
                                                    )}
                                                    title={isCollapsed ? item.label : undefined}
                                                >
                                                    <Icon className="h-4 w-4 flex-shrink-0" />

                                                    <AnimatePresence>
                                                        {!isCollapsed && (
                                                            <motion.span
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                exit={{ opacity: 0, x: -10 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="flex-1 truncate"
                                                            >
                                                                {item.label}
                                                            </motion.span>
                                                        )}
                                                    </AnimatePresence>

                                                    {/* External link indicator */}
                                                    {isExternal && !isCollapsed && (
                                                        <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                                                    )}

                                                    {/* Badge */}
                                                    {item.badge && !isCollapsed && (
                                                        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </a>
                                            )
                                        })}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </nav>

            {/* Footer */}
            <div className="border-t p-2">
                <AnimatePresence>
                    {!isCollapsed && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-md bg-muted p-3 text-center"
                        >
                            <p className="text-xs text-muted-foreground">
                                © 2025 CODAI Ecosystem
                            </p>
                            <p className="text-xs text-muted-foreground">
                                v1.0.0
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.aside>
    )
}

export default AppSidebar
