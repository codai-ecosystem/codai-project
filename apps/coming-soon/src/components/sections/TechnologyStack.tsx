'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, gradients } from '../../design-system/colors';
import { durations, easings } from '../../design-system/animations';

interface TechnologyStackProps {
    className?: string;
}

const TechnologyStack: React.FC<TechnologyStackProps> = ({ className }) => {
    const { theme } = useTheme();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: durations.normal,
                staggerChildren: 0.2,
                ease: easings.smooth,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: durations.slow,
                ease: easings.smooth,
            },
        },
    };

    const techCategories = [
        {
            title: 'AI & Machine Learning',
            icon: '🤖',
            gradient: gradients.ai.main,
            technologies: [
                { name: 'PyTorch', description: 'Advanced neural network training' },
                { name: 'TensorFlow', description: 'Production ML pipelines' },
                { name: 'Transformers', description: 'State-of-the-art NLP models' },
                { name: 'OpenAI GPT', description: 'Language understanding' },
                { name: 'Azure OpenAI', description: 'Enterprise AI services' },
                { name: 'Custom AGI', description: 'Proprietary intelligence systems' },
            ],
        },
        {
            title: 'Cloud Infrastructure',
            icon: '☁️',
            gradient: gradients.primary.main,
            technologies: [
                { name: 'Microsoft Azure', description: 'Scalable cloud platform' },
                { name: 'AWS', description: 'Global infrastructure' },
                { name: 'Docker', description: 'Containerized deployments' },
                { name: 'Kubernetes', description: 'Orchestration at scale' },
                { name: 'Terraform', description: 'Infrastructure as code' },
                { name: 'Redis', description: 'High-performance caching' },
            ],
        },
        {
            title: 'Frontend Excellence',
            icon: '🎨',
            gradient: gradients.text.primary,
            technologies: [
                { name: 'Next.js 15', description: 'React production framework' },
                { name: 'TypeScript', description: 'Type-safe development' },
                { name: 'Tailwind CSS', description: 'Utility-first styling' },
                { name: 'Framer Motion', description: 'Smooth animations' },
                { name: 'React 18', description: 'Modern UI library' },
                { name: 'PWA', description: 'Progressive web apps' },
            ],
        },
        {
            title: 'Backend Systems',
            icon: '⚙️',
            gradient: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.accent[500]} 100%)`,
            technologies: [
                { name: 'Node.js', description: 'JavaScript runtime' },
                { name: 'Python FastAPI', description: 'High-performance APIs' },
                { name: 'PostgreSQL', description: 'Enterprise database' },
                { name: 'GraphQL', description: 'Efficient data queries' },
                { name: 'REST APIs', description: 'Standard web services' },
                { name: 'WebSockets', description: 'Real-time communication' },
            ],
        },
        {
            title: 'Security & Compliance',
            icon: '🔒',
            gradient: `linear-gradient(135deg, ${colors.accent[600]} 0%, ${colors.primary[600]} 100%)`,
            technologies: [
                { name: 'OAuth 2.0', description: 'Secure authentication' },
                { name: 'JWT Tokens', description: 'Stateless authorization' },
                { name: 'HTTPS/TLS', description: 'Encrypted communication' },
                { name: 'GDPR', description: 'Privacy compliance' },
                { name: 'SOC 2', description: 'Security standards' },
                { name: 'ISO 27001', description: 'Information security' },
            ],
        },
        {
            title: 'DevOps & Monitoring',
            icon: '📊',
            gradient: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.accent[500]} 100%)`,
            technologies: [
                { name: 'GitHub Actions', description: 'CI/CD automation' },
                { name: 'Azure DevOps', description: 'Enterprise pipelines' },
                { name: 'Prometheus', description: 'Metrics collection' },
                { name: 'Grafana', description: 'Data visualization' },
                { name: 'ELK Stack', description: 'Log management' },
                { name: 'Sentry', description: 'Error monitoring' },
            ],
        },
    ];

    const performanceMetrics = [
        {
            value: '< 50ms',
            label: 'API Response Time',
            description: 'Global average response time',
            icon: '⚡'
        },
        {
            value: '99.9%',
            label: 'Uptime SLA',
            description: 'Enterprise-grade reliability',
            icon: '🛡️'
        },
        {
            value: '< 2s',
            label: 'Page Load Time',
            description: 'Optimized user experience',
            icon: '🚀'
        },
        {
            value: '24/7',
            label: 'Support Coverage',
            description: 'Global support availability',
            icon: '🌍'
        },
    ];

    return (
        <section
            id="technology"
            className={`relative py-24 lg:py-32 ${className}`}
            style={{
                background: theme === 'dark'
                    ? `linear-gradient(135deg, ${colors.background.secondary} 0%, ${colors.background.primary} 100%)`
                    : `linear-gradient(135deg, ${colors.gray[100]} 0%, ${colors.gray[50]} 100%)`,
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.accent[500]}30 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${colors.secondary[500]}20 0%, transparent 50%)`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-20"
                >
                    {/* Section Header */}
                    <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
                        <h2
                            className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6"
                            style={{
                                background: gradients.text.primary,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            Powered by Cutting-Edge Technology
                        </h2>
                        <p
                            className="text-lg leading-relaxed"
                            style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                        >
                            Our technology stack combines the latest innovations in AI, cloud computing, and software engineering
                            to deliver unprecedented performance, security, and scalability.
                        </p>
                    </motion.div>

                    {/* Performance Metrics */}
                    <motion.div variants={itemVariants}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                            {performanceMetrics.map((metric, index) => (
                                <motion.div
                                    key={metric.label}
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.8 },
                                        visible: {
                                            opacity: 1,
                                            scale: 1,
                                            transition: {
                                                duration: durations.slow,
                                                delay: index * 0.1,
                                                ease: easings.smooth,
                                            },
                                        },
                                    }}
                                    whileHover={{
                                        scale: 1.05,
                                        transition: { duration: durations.fast }
                                    }}
                                    className="text-center p-6 rounded-2xl border backdrop-blur-sm"
                                    style={{
                                        background: theme === 'dark'
                                            ? 'rgba(15, 23, 42, 0.7)'
                                            : 'rgba(255, 255, 255, 0.7)',
                                        borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                    }}
                                >
                                    <div className="text-3xl mb-3">{metric.icon}</div>
                                    <div
                                        className="text-2xl font-bold mb-2"
                                        style={{
                                            background: gradients.primary.main,
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            backgroundClip: 'text',
                                        }}
                                    >
                                        {metric.value}
                                    </div>
                                    <div
                                        className="text-sm font-medium mb-1"
                                        style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                    >
                                        {metric.label}
                                    </div>
                                    <p
                                        className="text-xs"
                                        style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                                    >
                                        {metric.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Technology Categories */}
                    <motion.div variants={itemVariants} className="space-y-8">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {techCategories.map((category, categoryIndex) => (
                                <motion.div
                                    key={category.title}
                                    variants={{
                                        hidden: { opacity: 0, x: categoryIndex % 2 === 0 ? -50 : 50 },
                                        visible: {
                                            opacity: 1,
                                            x: 0,
                                            transition: {
                                                duration: durations.slow,
                                                delay: categoryIndex * 0.2,
                                                ease: easings.smooth,
                                            },
                                        },
                                    }}
                                    className="group"
                                >
                                    <div
                                        className="rounded-3xl p-8 border backdrop-blur-sm hover:shadow-2xl transition-all duration-500"
                                        style={{
                                            background: theme === 'dark'
                                                ? 'rgba(15, 23, 42, 0.8)'
                                                : 'rgba(255, 255, 255, 0.8)',
                                            borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                        }}
                                    >
                                        {/* Category Header */}
                                        <div className="flex items-center mb-8">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform duration-300"
                                                style={{ background: category.gradient }}
                                            >
                                                {category.icon}
                                            </div>
                                            <h3
                                                className="text-xl font-bold"
                                                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                            >
                                                {category.title}
                                            </h3>
                                        </div>

                                        {/* Technologies Grid */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            {category.technologies.map((tech, techIndex) => (
                                                <motion.div
                                                    key={tech.name}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    whileInView={{
                                                        opacity: 1,
                                                        y: 0,
                                                        transition: {
                                                            duration: durations.normal,
                                                            delay: techIndex * 0.1,
                                                            ease: easings.smooth,
                                                        }
                                                    }}
                                                    viewport={{ once: true }}
                                                    whileHover={{
                                                        x: 4,
                                                        transition: { duration: durations.fast }
                                                    }}
                                                    className="p-4 rounded-xl border transition-all duration-300 cursor-default"
                                                    style={{
                                                        background: theme === 'dark'
                                                            ? 'rgba(30, 41, 59, 0.5)'
                                                            : 'rgba(248, 250, 252, 0.8)',
                                                        borderColor: theme === 'dark' ? colors.border.secondary : colors.gray[200],
                                                    }}
                                                >
                                                    <h4
                                                        className="font-semibold text-sm mb-1"
                                                        style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                                    >
                                                        {tech.name}
                                                    </h4>
                                                    <p
                                                        className="text-xs"
                                                        style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                                                    >
                                                        {tech.description}
                                                    </p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Architecture Highlights */}
                    <motion.div variants={itemVariants}>
                        <div className="text-center mb-12">
                            <h3
                                className="text-2xl font-bold mb-4"
                                style={{
                                    background: gradients.ai.main,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                Enterprise Architecture
                            </h3>
                            <p
                                className="text-base max-w-2xl mx-auto"
                                style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                            >
                                Built for scale, security, and performance with modern microservices architecture
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: 'Microservices',
                                    icon: '🏗️',
                                    description: 'Scalable, independent service architecture with Docker containers and Kubernetes orchestration',
                                    features: ['Auto-scaling', 'Load balancing', 'Service mesh', 'Circuit breakers'],
                                },
                                {
                                    title: 'Real-time Data',
                                    icon: '⚡',
                                    description: 'WebSocket connections, Redis caching, and event-driven architecture for instant updates',
                                    features: ['Live updates', 'Event streaming', 'Message queues', 'Data synchronization'],
                                },
                                {
                                    title: 'Global CDN',
                                    icon: '🌍',
                                    description: 'Multi-region deployment with edge computing for optimal performance worldwide',
                                    features: ['Edge locations', 'Auto-failover', 'Geographic routing', 'Content optimization'],
                                },
                            ].map((highlight, index) => (
                                <motion.div
                                    key={highlight.title}
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                duration: durations.slow,
                                                delay: index * 0.2,
                                                ease: easings.smooth,
                                            },
                                        },
                                    }}
                                    whileHover={{
                                        y: -8,
                                        transition: { duration: durations.fast }
                                    }}
                                    className="p-8 rounded-2xl border backdrop-blur-sm group hover:shadow-xl transition-all duration-500"
                                    style={{
                                        background: theme === 'dark'
                                            ? 'rgba(15, 23, 42, 0.7)'
                                            : 'rgba(255, 255, 255, 0.7)',
                                        borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                    }}
                                >
                                    <div className="text-center mb-6">
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            {highlight.icon}
                                        </div>
                                        <h4
                                            className="text-xl font-bold mb-4"
                                            style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                        >
                                            {highlight.title}
                                        </h4>
                                        <p
                                            className="text-sm mb-6"
                                            style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                                        >
                                            {highlight.description}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        {highlight.features.map((feature, featureIndex) => (
                                            <motion.div
                                                key={feature}
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{
                                                    opacity: 1,
                                                    x: 0,
                                                    transition: {
                                                        duration: durations.normal,
                                                        delay: featureIndex * 0.1,
                                                        ease: easings.smooth,
                                                    }
                                                }}
                                                viewport={{ once: true }}
                                                className="flex items-center text-sm"
                                            >
                                                <div
                                                    className="w-2 h-2 rounded-full mr-3"
                                                    style={{ background: gradients.primary.main }}
                                                />
                                                <span
                                                    style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[700] }}
                                                >
                                                    {feature}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default TechnologyStack;