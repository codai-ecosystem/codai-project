'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { Brain, Target, Rocket, Shield, Users, Lightbulb } from 'lucide-react'

const features = [
    {
        icon: Brain,
        title: 'Artificial Intelligence',
        description: 'Cutting-edge AI technologies powering intelligent solutions across multiple domains.',
        color: 'from-blue-500 to-cyan-500'
    },
    {
        icon: Target,
        title: 'Precision Engineering',
        description: 'Meticulously crafted applications with attention to performance, security, and user experience.',
        color: 'from-green-500 to-emerald-500'
    },
    {
        icon: Rocket,
        title: 'Innovation Focus',
        description: 'Pushing boundaries with next-generation technologies and forward-thinking solutions.',
        color: 'from-purple-500 to-pink-500'
    },
    {
        icon: Shield,
        title: 'Enterprise Security',
        description: 'Bank-grade security protocols ensuring data protection and compliance across all applications.',
        color: 'from-red-500 to-orange-500'
    },
    {
        icon: Users,
        title: 'User-Centric Design',
        description: 'Intuitive interfaces designed for optimal user experience and accessibility.',
        color: 'from-indigo-500 to-blue-500'
    },
    {
        icon: Lightbulb,
        title: 'Creative Solutions',
        description: 'Innovative approaches to complex problems with elegant and scalable architectures.',
        color: 'from-yellow-500 to-amber-500'
    }
]

const achievements = [
    { metric: '99.9%', label: 'Uptime Guarantee' },
    { metric: '< 100ms', label: 'Response Time' },
    { metric: '256-bit', label: 'Encryption Standard' },
    { metric: '24/7', label: 'Support Coverage' }
]

export function AboutSection() {
    return (
        <section id="about" className="py-20 bg-white dark:bg-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6">
                        <Brain className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            About Our Ecosystem
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Building the Future of{' '}
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Artificial Intelligence
                        </span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Our comprehensive AI ecosystem represents years of innovation, research, and development.
                        From intelligent banking solutions to advanced memory systems, we're creating the tools
                        that will define the next generation of artificial intelligence applications.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <div className="relative p-8 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10">
                                {/* Icon */}
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Achievements Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-white"
                >
                    <div className="text-center mb-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Performance Metrics
                        </h3>
                        <p className="text-primary-100 max-w-2xl mx-auto">
                            Our commitment to excellence is reflected in our industry-leading performance standards
                            and operational metrics across all applications.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={achievement.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-bold mb-2 text-white">
                                    {achievement.metric}
                                </div>
                                <div className="text-primary-100 text-sm md:text-base">
                                    {achievement.label}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Vision Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <div className="max-w-4xl mx-auto">
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                            Our Vision
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                            We envision a future where artificial intelligence seamlessly integrates into every aspect
                            of human life, enhancing productivity, creativity, and well-being. Our ecosystem of 30+
                            applications represents the building blocks of this AI-powered future, each meticulously
                            designed to solve real-world problems with unprecedented intelligence and efficiency.
                        </p>
                        <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl">
                            <Lightbulb className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span className="font-medium text-primary-700 dark:text-primary-300">
                                Innovation through Intelligence
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

