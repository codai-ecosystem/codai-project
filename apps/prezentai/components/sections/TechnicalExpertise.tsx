'use client'

import React from 'react'

import { motion } from 'framer-motion'
import {
    Code2, Database, Cloud, Shield, Cpu, Zap,
    Globe, Layers, GitBranch, Settings, Smartphone, Monitor
} from 'lucide-react'

const techStack = [
    {
        category: 'Frontend',
        icon: Monitor,
        technologies: ['React 19', 'Next.js 15', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
        color: 'from-blue-500 to-cyan-500',
        description: 'Modern, responsive user interfaces with cutting-edge technologies'
    },
    {
        category: 'Backend',
        icon: Database,
        technologies: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'GraphQL'],
        color: 'from-green-500 to-emerald-500',
        description: 'Scalable server architecture with high-performance databases'
    },
    {
        category: 'AI/ML',
        icon: Cpu,
        technologies: ['TensorFlow', 'PyTorch', 'OpenAI API', 'Hugging Face', 'LangChain'],
        color: 'from-purple-500 to-pink-500',
        description: 'Advanced artificial intelligence and machine learning capabilities'
    },
    {
        category: 'Cloud & DevOps',
        icon: Cloud,
        technologies: ['Docker', 'Kubernetes', 'AWS', 'Vercel', 'GitHub Actions'],
        color: 'from-orange-500 to-red-500',
        description: 'Robust cloud infrastructure with automated deployment pipelines'
    },
    {
        category: 'Security',
        icon: Shield,
        technologies: ['OAuth 2.0', 'JWT', 'HTTPS', 'Rate Limiting', 'Data Encryption'],
        color: 'from-red-500 to-pink-500',
        description: 'Enterprise-grade security protocols and data protection'
    },
    {
        category: 'Performance',
        icon: Zap,
        technologies: ['Edge Computing', 'CDN', 'Caching', 'Load Balancing', 'Optimization'],
        color: 'from-yellow-500 to-orange-500',
        description: 'Lightning-fast performance with global distribution'
    }
]

const architecturePrinciples = [
    {
        title: 'Microservices Architecture',
        description: 'Distributed system design enabling independent scaling and deployment',
        icon: Layers,
        stats: '30+ Services'
    },
    {
        title: 'API-First Development',
        description: 'RESTful and GraphQL APIs ensuring seamless integration',
        icon: Globe,
        stats: '100+ Endpoints'
    },
    {
        title: 'CI/CD Pipeline',
        description: 'Automated testing, building, and deployment processes',
        icon: GitBranch,
        stats: '99.9% Uptime'
    },
    {
        title: 'Real-time Processing',
        description: 'WebSocket connections and event-driven architecture',
        icon: Settings,
        stats: '<100ms Latency'
    }
]

const performanceMetrics = [
    { label: 'Page Load Speed', value: '< 2s', description: 'Average first contentful paint' },
    { label: 'API Response', value: '< 100ms', description: 'Average endpoint response time' },
    { label: 'Uptime', value: '99.9%', description: 'Service availability guarantee' },
    { label: 'Scalability', value: '10K+', description: 'Concurrent users supported' }
]

export function TechnicalExpertise() {
    return (
        <section id="expertise" className="py-20 bg-white dark:bg-slate-900">
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
                        <Code2 className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            Technical Excellence
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Cutting-Edge{' '}
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Technology Stack
                        </span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Our ecosystem is built on a foundation of modern technologies, best practices,
                        and architectural patterns that ensure scalability, security, and performance.
                    </p>
                </motion.div>

                {/* Technology Stack Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                    {techStack.map((tech, index) => (
                        <motion.div
                            key={tech.category}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <div className="relative p-8 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-lg hover:shadow-primary-500/10 h-full">
                                {/* Icon */}
                                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${tech.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <tech.icon className="w-6 h-6 text-white" />
                                </div>

                                {/* Category */}
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                                    {tech.category}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                    {tech.description}
                                </p>

                                {/* Technologies */}
                                <div className="flex flex-wrap gap-2">
                                    {tech.technologies.map((technology) => (
                                        <span
                                            key={technology}
                                            className="px-3 py-1 text-xs font-medium bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 group-hover:border-primary-300 dark:group-hover:border-primary-600 transition-colors duration-300"
                                        >
                                            {technology}
                                        </span>
                                    ))}
                                </div>

                                {/* Hover Effect */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${tech.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Architecture Principles */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mb-20"
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 text-center mb-12">
                        Architecture Principles
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {architecturePrinciples.map((principle, index) => (
                            <motion.div
                                key={principle.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center p-6 bg-gray-50 dark:bg-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors duration-300"
                            >
                                <div className="inline-flex p-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg mb-4">
                                    <principle.icon className="w-6 h-6 text-white" />
                                </div>
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    {principle.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {principle.description}
                                </p>
                                <div className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                    {principle.stats}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Performance Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-3xl p-8 md:p-12 text-white"
                >
                    <div className="text-center mb-10">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">
                            Performance Benchmarks
                        </h3>
                        <p className="text-primary-100 max-w-2xl mx-auto">
                            Our applications consistently deliver exceptional performance across
                            all key metrics, ensuring optimal user experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {performanceMetrics.map((metric, index) => (
                            <motion.div
                                key={metric.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center"
                            >
                                <div className="text-3xl md:text-4xl font-bold mb-2 text-white">
                                    {metric.value}
                                </div>
                                <div className="font-medium text-primary-100 mb-1">
                                    {metric.label}
                                </div>
                                <div className="text-sm text-primary-200">
                                    {metric.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Development Philosophy */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center"
                >
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Development Philosophy
                    </h3>
                    <div className="max-w-4xl mx-auto">
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                            We believe in building software that not only meets today's requirements but
                            anticipates tomorrow's challenges. Our development process emphasizes clean code,
                            comprehensive testing, continuous integration, and iterative improvement.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Quality First
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Rigorous testing and code review processes ensure reliability
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    User-Centric
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Every feature is designed with user experience at the forefront
                                </p>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Innovation Driven
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Constantly exploring new technologies and methodologies
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

