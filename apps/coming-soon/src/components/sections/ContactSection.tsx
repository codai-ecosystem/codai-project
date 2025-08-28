'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, gradients } from '../../design-system/colors';
import { durations, easings } from '../../design-system/animations';

interface ContactSectionProps {
    className?: string;
}

const ContactSection: React.FC<ContactSectionProps> = ({ className }) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: durations.normal,
                staggerChildren: 0.3,
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (email && email.includes('@')) {
            // TODO: Integrate with actual email service
            setIsSubmitted(true);
            setTimeout(() => {
                setEmail('');
                setIsSubmitted(false);
            }, 3000);
        }
    };

    const contactMethods = [
        {
            icon: '📧',
            title: 'Email',
            value: 'contact@codai.dev',
            description: 'General inquiries and support',
            href: 'mailto:contact@codai.dev',
        },
        {
            icon: '💼',
            title: 'Enterprise',
            value: 'enterprise@codai.dev',
            description: 'Partnership and enterprise sales',
            href: 'mailto:enterprise@codai.dev',
        },
        {
            icon: '🔒',
            title: 'Security',
            value: 'security@codai.dev',
            description: 'Security issues and vulnerability reports',
            href: 'mailto:security@codai.dev',
        },
    ];

    return (
        <section
            id="contact"
            className={`relative py-24 lg:py-32 ${className}`}
            style={{
                background: theme === 'dark'
                    ? `linear-gradient(135deg, ${colors.background.primary} 0%, ${colors.background.secondary} 100%)`
                    : `linear-gradient(135deg, ${colors.gray[50]} 0%, ${colors.gray[100]} 100%)`,
            }}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 20% 20%, ${colors.primary[500]}20 0%, transparent 40%), radial-gradient(circle at 80% 80%, ${colors.accent[500]}20 0%, transparent 40%)`,
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="space-y-16"
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
                            Get Early Access
                        </h2>
                        <p
                            className="text-lg leading-relaxed"
                            style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                        >
                            Join the waitlist to be among the first to experience the future of AI-powered development.
                            Get exclusive early access, beta features, and special pricing when we launch.
                        </p>
                    </motion.div>

                    {/* Early Access Signup */}
                    <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
                        <div
                            className="rounded-3xl p-8 lg:p-12 border backdrop-blur-sm"
                            style={{
                                background: theme === 'dark'
                                    ? 'rgba(15, 23, 42, 0.9)'
                                    : 'rgba(255, 255, 255, 0.9)',
                                borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                            }}
                        >
                            {!isSubmitted ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div
                                            className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6"
                                            style={{
                                                background: gradients.primary.main,
                                            }}
                                        >
                                            🚀
                                        </div>
                                        <h3
                                            className="text-2xl font-bold mb-4"
                                            style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                        >
                                            Reserve Your Spot
                                        </h3>
                                        <p
                                            className="text-base"
                                            style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                                        >
                                            Be the first to know when CODAI launches. No spam, just updates.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="relative">
                                            <label htmlFor="email" className="sr-only">
                                                Email address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Enter your email address"
                                                required
                                                className="w-full px-6 py-4 rounded-2xl border focus:outline-none focus:ring-2 text-lg"
                                                style={{
                                                    background: theme === 'dark'
                                                        ? colors.background.card
                                                        : colors.gray[50],
                                                    borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                                    color: theme === 'dark' ? colors.text.primary : colors.gray[900],
                                                }}
                                            />
                                        </div>
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-4 px-8 rounded-2xl font-semibold text-lg text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                                            style={{
                                                background: gradients.primary.main,
                                            }}
                                        >
                                            Join the Waitlist
                                        </motion.button>
                                    </form>

                                    <div className="mt-8 text-center">
                                        <p
                                            className="text-sm"
                                            style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[500] }}
                                        >
                                            🔒 Your email is secure and will never be shared. Unsubscribe at any time.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: durations.normal }}
                                    className="text-center py-8"
                                >
                                    <div
                                        className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-6"
                                        style={{
                                            background: gradients.ai.main,
                                        }}
                                    >
                                        ✅
                                    </div>
                                    <h3
                                        className="text-2xl font-bold mb-4"
                                        style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                    >
                                        You're on the list!
                                    </h3>
                                    <p
                                        className="text-base"
                                        style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                                    >
                                        Thank you for joining our waitlist. We'll be in touch soon with exclusive updates.
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Contact Methods */}
                    <motion.div variants={itemVariants}>
                        <div className="text-center mb-12">
                            <h3
                                className="text-xl font-semibold mb-4"
                                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                            >
                                Get in Touch
                            </h3>
                            <p
                                className="text-base"
                                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                            >
                                Have questions or need enterprise support? We're here to help.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {contactMethods.map((method, index) => (
                                <motion.a
                                    key={method.title}
                                    href={method.href}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                duration: durations.slow,
                                                delay: index * 0.1,
                                                ease: easings.smooth,
                                            },
                                        },
                                    }}
                                    whileHover={{
                                        y: -8,
                                        transition: { duration: durations.fast }
                                    }}
                                    className="block p-8 rounded-2xl border backdrop-blur-sm group hover:shadow-xl transition-all duration-300"
                                    style={{
                                        background: theme === 'dark'
                                            ? 'rgba(15, 23, 42, 0.6)'
                                            : 'rgba(255, 255, 255, 0.6)',
                                        borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                    }}
                                >
                                    <div className="text-center">
                                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            {method.icon}
                                        </div>
                                        <h4
                                            className="text-lg font-semibold mb-2"
                                            style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                                        >
                                            {method.title}
                                        </h4>
                                        <div
                                            className="text-base font-medium mb-3"
                                            style={{
                                                background: gradients.primary.main,
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                backgroundClip: 'text',
                                            }}
                                        >
                                            {method.value}
                                        </div>
                                        <p
                                            className="text-sm"
                                            style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                                        >
                                            {method.description}
                                        </p>
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>

                    {/* Social Links */}
                    <motion.div variants={itemVariants} className="pt-8">
                        <div className="text-center">
                            <h4
                                className="text-lg font-semibold mb-6"
                                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                            >
                                Follow Our Journey
                            </h4>
                            <div className="flex justify-center space-x-6">
                                {[
                                    { platform: 'GitHub', icon: '🐱', href: 'https://github.com/codai-ecosystem' },
                                    { platform: 'LinkedIn', icon: '💼', href: '#' },
                                    { platform: 'Twitter', icon: '🐦', href: '#' },
                                    { platform: 'Discord', icon: '💬', href: '#' },
                                ].map((social, index) => (
                                    <motion.a
                                        key={social.platform}
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
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl border backdrop-blur-sm transition-all duration-300"
                                        style={{
                                            background: theme === 'dark'
                                                ? 'rgba(15, 23, 42, 0.8)'
                                                : 'rgba(255, 255, 255, 0.8)',
                                            borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                                        }}
                                        aria-label={`Follow us on ${social.platform}`}
                                    >
                                        {social.icon}
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default ContactSection;