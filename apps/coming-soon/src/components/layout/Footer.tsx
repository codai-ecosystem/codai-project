'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Mail, Send, ExternalLink, Heart, Zap, Shield, FileText } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { colors, gradients } from '../../design-system/colors'
import { durations, easings } from '../../design-system/animations'
import { codaiProjects, getProjectsByTier } from '@/data/projects'

'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Github, Twitter, Linkedin, Mail, Send, ExternalLink, Heart, Zap, Shield, FileText } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { colors, gradients } from '../../design-system/colors'
import { durations, easings } from '../../design-system/animations'
import { codaiProjects, getProjectsByTier } from '@/data/projects'

interface FooterLinkProps {
    href: string
    children: React.ReactNode
    external?: boolean
}

const FooterLink = ({ href, children, external = false }: FooterLinkProps) => {
    const { theme } = useTheme()

    return (
        <motion.a
            href={href}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            whileHover={{ x: 4 }}
            className="flex items-center space-x-2 group transition-colors duration-300"
            style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
        >
            <span className="group-hover:text-white transition-colors duration-300">{children}</span>
            {external && (
                <ExternalLink
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                />
            )}
        </motion.a>
    )
}

export default function Footer() {
    const { theme } = useTheme()
    const [email, setEmail] = useState('')
    const [isSubscribed, setIsSubscribed] = useState(false)

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: durations.normal,
                staggerChildren: 0.1,
                ease: easings.smooth,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: durations.slow,
                ease: easings.smooth,
            },
        },
    }

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (email) {
            // TODO: Integrate with newsletter service
            setIsSubscribed(true)
            setEmail('')
            setTimeout(() => setIsSubscribed(false), 3000)
        }
    }

    const currentYear = new Date().getFullYear()

    const socialLinks = [
        { icon: Github, href: 'https://github.com/codai-ecosystem', label: 'GitHub' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:contact@codai.dev', label: 'Email' },
    ]

    const ecosystemLinks = [
        { name: 'CODAI Platform', href: '#', tier: 1, description: 'Main AI development platform' },
        { name: 'MemorAI', href: '#', tier: 1, description: 'Intelligent memory management' },
        { name: 'BancAI', href: '#', tier: 1, description: 'Financial AI solutions' },
        { name: 'RomAI', href: '#', tier: 1, description: 'Romanian AI assistant' },
        { name: 'StudiAI', href: '#', tier: 2, description: 'Educational AI platform' },
        { name: 'SociAI', href: '#', tier: 2, description: 'Social media AI tools' },
    ]

    const resourceLinks = [
        { name: 'Documentation', href: '/docs', icon: FileText },
        { name: 'API Reference', href: '/api', icon: FileText },
        { name: 'Support Center', href: '/support', icon: Heart },
        { name: 'Status Page', href: '/status', icon: Zap },
        { name: 'Security', href: '/security', icon: Shield },
        { name: 'Changelog', href: '/changelog', icon: ExternalLink },
    ]

    const legalLinks = [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'GDPR Compliance', href: '/gdpr' },
    ]

    return (
        <footer
            className="relative border-t"
            style={{
                background: theme === 'dark'
                    ? `linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%)`
                    : `linear-gradient(135deg, ${colors.gray[50]} 0%, ${colors.gray[100]} 100%)`,
                borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 20%, ${colors.primary[500]}20 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${colors.accent[500]}20 0%, transparent 50%)`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="py-16"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Brand Section */}
                        <motion.div variants={itemVariants} className="lg:col-span-4">
                            <div className="flex items-center space-x-3 mb-6">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                                    style={{ background: gradients.primary.main }}
                                >
                                    C
                                </div>
                                <h3
                                    className="text-3xl font-bold"
                                    style={{
                                        background: gradients.text.primary,
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                    }}
                                >
                                    CODAI
                                </h3>
                            </div>

                            <p
                                className="text-base leading-relaxed mb-8 max-w-md"
                                style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                            >
                                Building the future of AI-native applications. A comprehensive ecosystem of 42+ platforms
                                designed to revolutionize every aspect of digital interaction and development.
                            </p>

                            {/* Newsletter Signup */}
                            <div className="mb-8">
                                <h4
                                    className="text-lg font-semibold mb-4"
                                    style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                >
                                    Stay Updated
                                </h4>

                                {!isSubscribed ? (
                                    <form onSubmit={handleNewsletterSubmit} className="flex space-x-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email"
                                                className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                                                style={{
                                                    background: theme === 'dark'
                                                        ? 'rgba(15, 23, 42, 0.7)'
                                                        : 'rgba(255, 255, 255, 0.9)',
                                                    borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                                    color: theme === 'dark' ? colors.text.primary : colors.gray[900],
                                                }}
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            disabled={!email}
                                            className="px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 disabled:opacity-50 flex items-center space-x-2"
                                            style={{ background: gradients.primary.main }}
                                        >
                                            <Send className="w-4 h-4" />
                                            <span>Subscribe</span>
                                        </motion.button>
                                    </form>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center space-x-3 p-4 rounded-xl border"
                                        style={{
                                            background: theme === 'dark'
                                                ? 'rgba(34, 197, 94, 0.1)'
                                                : 'rgba(34, 197, 94, 0.1)',
                                            borderColor: colors.emerald[500],
                                        }}
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-sm"
                                            style={{ background: colors.emerald[500] }}
                                        >
                                            ✓
                                        </div>
                                        <span
                                            className="font-medium"
                                            style={{ color: colors.emerald[600] }}
                                        >
                                            Thank you for subscribing!
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Social Links */}
                            <div className="flex space-x-4">
                                {socialLinks.map((social, index) => (
                                    <motion.a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variants={{
                                            hidden: { opacity: 0, scale: 0.8 },
                                            visible: {
                                                opacity: 1,
                                                scale: 1,
                                                transition: {
                                                    duration: durations.normal,
                                                    delay: index * 0.1,
                                                    ease: easings.smooth,
                                                },
                                            },
                                        }}
                                        whileHover={{
                                            scale: 1.1,
                                            transition: { duration: durations.fast }
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-12 h-12 rounded-xl border backdrop-blur-sm flex items-center justify-center transition-all duration-300"
                                        style={{
                                            background: theme === 'dark'
                                                ? 'rgba(15, 23, 42, 0.8)'
                                                : 'rgba(255, 255, 255, 0.8)',
                                            borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                        }}
                                        aria-label={social.label}
                                    >
                                        <social.icon
                                            className="w-5 h-5 transition-colors duration-300"
                                            style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                                        />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Ecosystem Links */}
                        <motion.div variants={itemVariants} className="lg:col-span-3">
                            <h4
                                className="text-lg font-semibold mb-6 flex items-center space-x-2"
                                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                            >
                                <Zap
                                    className="w-5 h-5"
                                    style={{ color: colors.primary[500] }}
                                />
                                <span>Ecosystem</span>
                            </h4>
                            <ul className="space-y-4">
                                {ecosystemLinks.map((link) => (
                                    <li key={link.name}>
                                        <div className="group cursor-pointer">
                                            <div className="flex items-center justify-between mb-1">
                                                <FooterLink href={link.href} external>
                                                    {link.name}
                                                </FooterLink>
                                                <span
                                                    className="text-xs px-2 py-1 rounded-full"
                                                    style={{
                                                        background: `${colors.primary[500]}20`,
                                                        color: colors.primary[400],
                                                    }}
                                                >
                                                    T{link.tier}
                                                </span>
                                            </div>
                                            <p
                                                className="text-xs ml-0 group-hover:ml-2 transition-all duration-300"
                                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[500] }}
                                            >
                                                {link.description}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Resources */}
                        <motion.div variants={itemVariants} className="lg:col-span-2">
                            <h4
                                className="text-lg font-semibold mb-6"
                                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                            >
                                Resources
                            </h4>
                            <ul className="space-y-3">
                                {resourceLinks.map((link) => (
                                    <li key={link.name}>
                                        <FooterLink href={link.href} external>
                                            <link.icon className="w-4 h-4" />
                                            <span>{link.name}</span>
                                        </FooterLink>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Legal & Compliance */}
                        <motion.div variants={itemVariants} className="lg:col-span-3">
                            <h4
                                className="text-lg font-semibold mb-6 flex items-center space-x-2"
                                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                            >
                                <Shield
                                    className="w-5 h-5"
                                    style={{ color: colors.accent[500] }}
                                />
                                <span>Legal & Privacy</span>
                            </h4>
                            <ul className="space-y-3 mb-6">
                                {legalLinks.map((link) => (
                                    <li key={link.name}>
                                        <FooterLink href={link.href}>
                                            {link.name}
                                        </FooterLink>
                                    </li>
                                ))}
                            </ul>

                            <div
                                className="p-4 rounded-xl border"
                                style={{
                                    background: theme === 'dark'
                                        ? 'rgba(15, 23, 42, 0.6)'
                                        : 'rgba(255, 255, 255, 0.6)',
                                    borderColor: theme === 'dark' ? colors.border.secondary : colors.gray[200],
                                }}
                            >
                                <p
                                    className="text-xs leading-relaxed"
                                    style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                                >
                                    🇪🇺 GDPR Compliant • 🔒 SOC 2 Certified • 🛡️ ISO 27001 •
                                    Data processed in EU with the highest privacy standards.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Stats Bar */}
                <motion.div
                    variants={itemVariants}
                    className="py-8 border-t"
                    style={{ borderColor: theme === 'dark' ? colors.border.secondary : colors.gray[200] }}
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div
                                className="text-2xl font-bold mb-1"
                                style={{
                                    background: gradients.primary.main,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {codaiProjects.length}+
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                Active Projects
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-2xl font-bold mb-1"
                                style={{
                                    background: gradients.ai.main,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                {getProjectsByTier(1).length + getProjectsByTier(2).length}
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                Core Platforms
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-2xl font-bold mb-1"
                                style={{
                                    background: gradients.text.primary,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                99.9%
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                Uptime SLA
                            </div>
                        </div>
                        <div>
                            <div
                                className="text-2xl font-bold mb-1"
                                style={{
                                    background: gradients.primary.main,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                2025
                            </div>
                            <div
                                className="text-sm"
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                Launch Year
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    className="py-8 border-t"
                    style={{ borderColor: theme === 'dark' ? colors.border.secondary : colors.gray[200] }}
                >
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div
                            className="flex items-center space-x-2 text-sm"
                            style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                        >
                            <span>© {currentYear} CODAI. All rights reserved.</span>
                        </div>

                        <div className="flex items-center space-x-2 text-sm">
                            <span
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                Made with
                            </span>
                            <Heart
                                className="w-4 h-4 fill-current"
                                style={{ color: colors.rose[500] }}
                            />
                            <span
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                in Romania 🇷🇴
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
    )
}