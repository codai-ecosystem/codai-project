'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface AuthLayoutProps {
    children: React.ReactNode
    title?: string
    subtitle?: string
    showLogo?: boolean
    className?: string
    variant?: 'centered' | 'split'
    backgroundImage?: string
}

export function AuthLayout({
    children,
    title,
    subtitle,
    showLogo = true,
    className,
    variant = 'centered',
    backgroundImage
}: AuthLayoutProps) {
    return (
        <div className={cn(
            "min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
            className
        )}>
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, 100, -50, 0],
                        y: [0, -100, 50, 0],
                        scale: [1, 1.2, 0.8, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                />
                <motion.div
                    className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
                    animate={{
                        x: [0, -50, 100, 0],
                        y: [0, 50, -100, 0],
                        scale: [1, 0.8, 1.2, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, delay: 5 }}
                />
            </div>

            {/* Background Image Overlay */}
            {backgroundImage && (
                <div
                    className="fixed inset-0 bg-cover bg-center opacity-10"
                    style={{ backgroundImage: `url(${backgroundImage})` }}
                />
            )}

            <div className={cn(
                "relative z-10 flex min-h-screen",
                variant === 'centered' ? 'items-center justify-center' : 'items-stretch'
            )}>
                {variant === 'split' && (
                    <div className="flex-1 hidden lg:flex lg:items-center lg:justify-center">
                        <div className="max-w-md text-center text-white">
                            {showLogo && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6 }}
                                    className="mb-8"
                                >
                                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        CODAI
                                    </h1>
                                    <p className="text-slate-300 mt-2">AI-Powered Ecosystem</p>
                                </motion.div>
                            )}
                            {title && (
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.2 }}
                                    className="text-2xl font-semibold mb-4"
                                >
                                    {title}
                                </motion.h2>
                            )}
                            {subtitle && (
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="text-slate-400"
                                >
                                    {subtitle}
                                </motion.p>
                            )}
                        </div>
                    </div>
                )}

                <div className={cn(
                    "flex items-center justify-center",
                    variant === 'centered' ? 'w-full max-w-md mx-auto px-4' : 'flex-1 lg:flex-none lg:w-1/2'
                )}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="w-full max-w-md"
                    >
                        <div className="glassmorphism bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
                            {variant === 'centered' && (
                                <div className="text-center mb-8">
                                    {showLogo && (
                                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                                            CODAI
                                        </h1>
                                    )}
                                    {title && (
                                        <h2 className="text-xl font-semibold text-white mb-2">
                                            {title}
                                        </h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-slate-400 text-sm">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            )}
                            {children}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default AuthLayout
