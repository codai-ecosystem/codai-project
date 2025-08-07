'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Cpu, Zap, Globe } from 'lucide-react'
import { useEffect, useState } from 'react'

const statsData = [
    { label: 'AI Applications', value: '30+', icon: Cpu },
    { label: 'Lines of Code', value: '1M+', icon: Zap },
    { label: 'Active Users', value: '10K+', icon: Globe },
    { label: 'Success Rate', value: '99%', icon: Sparkles },
]

const floatingElements = [
    { id: 1, x: '10%', y: '20%', delay: 0 },
    { id: 2, x: '80%', y: '30%', delay: 1 },
    { id: 3, x: '20%', y: '70%', delay: 2 },
    { id: 4, x: '70%', y: '80%', delay: 3 },
    { id: 5, x: '90%', y: '60%', delay: 4 },
]

export function HeroSection() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                {floatingElements.map((element) => (
                    <motion.div
                        key={element.id}
                        className="absolute w-2 h-2 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full opacity-60"
                        style={{ left: element.x, top: element.y }}
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.6, 1, 0.6],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 3,
                            delay: element.delay,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary-400/30 to-secondary-400/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-secondary-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Main Content */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full border border-gray-200/50 dark:border-gray-700/50"
                    >
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Revolutionary AI Ecosystem
                        </span>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                    >
                        <span className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 bg-clip-text text-transparent">
                            PREZENTAI.RO
                        </span>
                        <br />
                        <span className="text-gray-900 dark:text-gray-100">
                            AI Portfolio
                        </span>
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed"
                    >
                        Discover our cutting-edge AI ecosystem featuring 30+ innovative applications.
                        From intelligent banking solutions to advanced memory systems, we're building
                        the future of artificial intelligence.
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                        <motion.a
                            href="#ecosystem"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                        >
                            <span>Explore Ecosystem</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </motion.a>

                        <motion.a
                            href="#contact"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-flex items-center space-x-2 px-8 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 font-semibold rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300"
                        >
                            <span>Get in Touch</span>
                        </motion.a>
                    </motion.div>
                </motion.div>

                {/* Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
                >
                    {statsData.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                            className="group"
                        >
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 hover:shadow-lg">
                                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center"
                    >
                        <motion.div
                            animate={{ y: [0, 12, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1 h-3 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-full mt-2"
                        />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

