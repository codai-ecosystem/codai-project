/**
 * App Footer Component for CODAI Ecosystem
 * Features: App branding, ecosystem links, legal information
 */

'use client'

import React from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { ExternalLink, Heart } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { AppName } from '../../config/design-tokens'
import { appConfigs } from '../../config/appConfigs'

interface AppFooterProps {
    appName: AppName
    className?: string
    showEcosystemLinks?: boolean
    showLegalLinks?: boolean
    variant?: 'default' | 'minimal' | 'extended'
}

export function AppFooter({
    appName,
    className,
    showEcosystemLinks = true,
    showLegalLinks = true,
    variant = 'default',
}: AppFooterProps) {
    const { t } = useTranslation()
    const currentApp = appConfigs[appName]

    const ecosystemApps = [
        { name: 'MemorAI', href: 'https://memorai.ro', description: 'Memory Management' },
        { name: 'BancAI', href: 'https://bancai.ro', description: 'Banking Solutions' },
        { name: 'SociAI', href: 'https://sociai.ro', description: 'Social Platform' },
        { name: 'CumpărAI', href: 'https://cumparai.ro', description: 'Shopping Assistant' },
        { name: 'StudiAI', href: 'https://studiai.ro', description: 'Learning Platform' },
    ].filter(app => app.name.toLowerCase() !== appName.toLowerCase())

    const legalLinks = [
        { label: t('form.privacy'), href: '/privacy' },
        { label: t('form.termsOfService'), href: '/terms' },
        { label: t('ecosystem.support'), href: '/support' },
        { label: t('ecosystem.documentation'), href: '/docs' },
    ]

    if (variant === 'minimal') {
        return (
            <footer className={cn('border-t bg-background px-4 py-3', className)}>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <p>© 2025 {currentApp.name}. {t('layout.footer.allRightsReserved')}.</p>
                    <p className="flex items-center gap-1">
                        Made with <Heart className="h-3 w-3 text-red-500" /> by CODAI Ecosystem
                    </p>
                </div>
            </footer>
        )
    }

    return (
        <footer className={cn('border-t bg-background', className)}>
            <div className="px-4 py-6 md:px-6">
                {variant === 'extended' && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-6">
                        {/* App info */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex h-6 w-6 items-center justify-center rounded-md text-white text-xs font-semibold"
                                    style={{ backgroundColor: currentApp.theme.primary }}
                                >
                                    {currentApp.name.slice(0, 2).toUpperCase()}
                                </div>
                                <h3 className="font-semibold">{currentApp.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {currentApp.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {currentApp.tagline}
                            </p>
                        </div>

                        {/* Ecosystem apps */}
                        {showEcosystemLinks && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">{t('ecosystem.allApps')}</h4>
                                <div className="space-y-2">
                                    {ecosystemApps.slice(0, 4).map((app) => (
                                        <a
                                            key={app.name}
                                            href={app.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <span>{app.name}</span>
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Support */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">{t('ecosystem.support')}</h4>
                            <div className="space-y-2">
                                <a
                                    href="/help"
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('nav.help')}
                                </a>
                                <a
                                    href="/docs"
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('ecosystem.documentation')}
                                </a>
                                <a
                                    href="/contact"
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('nav.contact')}
                                </a>
                                <a
                                    href="/feedback"
                                    className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('ecosystem.feedback')}
                                </a>
                            </div>
                        </div>

                        {/* Legal */}
                        {showLegalLinks && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium">Legal</h4>
                                <div className="space-y-2">
                                    {legalLinks.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom section */}
                <div className={cn(
                    'flex flex-col gap-4 md:flex-row md:items-center md:justify-between',
                    variant === 'extended' ? 'border-t pt-6' : ''
                )}>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                        <p className="text-sm text-muted-foreground">
                            © 2025 {currentApp.name}. {t('layout.footer.allRightsReserved')}.
                        </p>

                        {variant === 'default' && showLegalLinks && (
                            <div className="flex gap-4">
                                {legalLinks.slice(0, 2).map((link) => (
                                    <a
                                        key={link.href}
                                        href={link.href}
                                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {variant === 'default' && showEcosystemLinks && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Ecosystem:</span>
                                {ecosystemApps.slice(0, 3).map((app) => (
                                    <a
                                        key={app.name}
                                        href={app.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                                        title={app.description}
                                    >
                                        {app.name}
                                    </a>
                                ))}
                            </div>
                        )}

                        <motion.p
                            className="flex items-center gap-1 text-sm text-muted-foreground"
                            whileHover={{ scale: 1.05 }}
                        >
                            Made with{' '}
                            <motion.span
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Heart className="h-3 w-3 text-red-500" />
                            </motion.span>{' '}
                            by CODAI Ecosystem
                        </motion.p>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default AppFooter
