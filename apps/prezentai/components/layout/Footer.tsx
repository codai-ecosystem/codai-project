'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Globe, Heart } from 'lucide-react'

const socialLinks = [
    { name: 'GitHub', icon: Github, href: '#', color: 'hover:text-gray-900 dark:hover:text-gray-100' },
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@prezentai.ro', color: 'hover:text-red-500' },
    { name: 'Website', icon: Globe, href: '#', color: 'hover:text-green-500' },
]

const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Ecosystem', href: '#ecosystem' },
    { name: 'Expertise', href: '#expertise' },
    { name: 'Contact', href: '#contact' },
]

const ecosystemApps = [
    'CODAI', 'MEMORAI', 'BANCAI', 'STOCAI', 'STUDIAI',
    'JUCAI', 'CURTAI', 'ADMIN', 'EXPLORER', 'HUB'
]

export function Footer() {
    return (
        <footer className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="lg:col-span-2"
                    >
                        <div className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                <Globe className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                                PREZENTAI.RO
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                            Showcasing our revolutionary AI ecosystem with 30+ cutting-edge applications.
                            Building the future of artificial intelligence, one innovation at a time.
                        </p>
                        <div className="flex space-x-4">
                            {socialLinks.map((link) => (
                                <motion.a
                                    key={link.name}
                                    href={link.href}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 transition-all duration-200 ${link.color}`}
                                    aria-label={link.name}
                                >
                                    <link.icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Ecosystem Apps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                            AI Ecosystem
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {ecosystemApps.map((app) => (
                                <span
                                    key={app}
                                    className="px-2 py-1 text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full"
                                >
                                    {app}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center"
                >
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 md:mb-0">
                        © {new Date().getFullYear()} PREZENTAI.RO. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>Made with</span>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        >
                            <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
                        </motion.div>
                        <span>by CODAI Ecosystem</span>
                    </div>
                </motion.div>
            </div>
        </footer>
    )
}
