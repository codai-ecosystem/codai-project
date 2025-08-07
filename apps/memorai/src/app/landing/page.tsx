'use client'

import React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface FeatureHighlight {
    icon: string;
    title: string;
    description: string;
    benefit: string;
}

interface Testimonial {
    name: string;
    role: string;
    company: string;
    quote: string;
    avatar: string;
}

interface PricingTier {
    name: string;
    price: string;
    period: string;
    description: string;
    features: string[];
    highlighted: boolean;
    ctaText: string;
}

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);

    useEffect(() => {
        setIsVisible(true);

        // Auto-rotate testimonials
        const interval = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const features: FeatureHighlight[] = [
        {
            icon: '🧠',
            title: 'AI-Powered Memory Management',
            description: 'Intelligent memory organization with vector embeddings and semantic search',
            benefit: 'Find information 5x faster than traditional methods'
        },
        {
            icon: '🔒',
            title: 'Enterprise-Grade Security',
            description: 'End-to-end encryption with SOC 2 compliance and data sovereignty',
            benefit: 'Trust with your most sensitive information'
        },
        {
            icon: '⚡',
            title: 'Real-Time Collaboration',
            description: 'Multi-agent coordination with live updates and conflict resolution',
            benefit: 'Teams work 40% more efficiently together'
        },
        {
            icon: '🌐',
            title: 'Multi-Cloud Architecture',
            description: 'Deploy across AWS, Azure, GCP with automatic failover',
            benefit: '99.99% uptime with global scalability'
        },
        {
            icon: '📊',
            title: 'Advanced Analytics',
            description: 'Deep insights into memory usage patterns and team productivity',
            benefit: 'Optimize workflows with data-driven decisions'
        },
        {
            icon: '🎯',
            title: 'Context-Aware Intelligence',
            description: 'AI learns from your patterns to proactively suggest relevant information',
            benefit: 'Stay focused with intelligent memory recommendations'
        }
    ];

    const testimonials: Testimonial[] = [
        {
            name: 'Sarah Chen',
            role: 'CTO',
            company: 'TechFlow Systems',
            quote: 'MemorAI transformed how our development teams share and access knowledge. Our onboarding time decreased by 60% and code quality improved significantly.',
            avatar: '/api/placeholder/64/64'
        },
        {
            name: 'Marcus Rodriguez',
            role: 'Research Director',
            company: 'AI Innovations Lab',
            quote: 'The semantic search capabilities are incredible. We can find research connections we never would have discovered manually. It\'s like having a research assistant that never forgets.',
            avatar: '/api/placeholder/64/64'
        },
        {
            name: 'Emma Thompson',
            role: 'VP of Engineering',
            company: 'DataStream Corp',
            quote: 'Security was our biggest concern, but MemorAI\'s enterprise features exceeded our expectations. SOC 2 compliance and on-premises deployment made the decision easy.',
            avatar: '/api/placeholder/64/64'
        }
    ];

    const pricingTiers: PricingTier[] = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            description: 'Perfect for personal use and small projects',
            features: [
                '1,000 memories per month',
                'Basic semantic search',
                'Community support',
                'Web interface access',
                'Basic analytics'
            ],
            highlighted: false,
            ctaText: 'Start Free'
        },
        {
            name: 'Pro',
            price: '$29',
            period: 'per user/month',
            description: 'Ideal for growing teams and businesses',
            features: [
                'Unlimited memories',
                'Advanced AI search',
                'Team collaboration',
                'API access',
                'Priority support',
                'Advanced analytics',
                'Custom integrations'
            ],
            highlighted: true,
            ctaText: 'Start Pro Trial'
        },
        {
            name: 'Enterprise',
            price: 'Custom',
            period: 'contact us',
            description: 'Full-scale deployment for large organizations',
            features: [
                'Everything in Pro',
                'On-premises deployment',
                'SOC 2 compliance',
                'Custom security policies',
                'Dedicated support',
                'SLA guarantees',
                'Custom development'
            ],
            highlighted: false,
            ctaText: 'Contact Sales'
        }
    ];

    const stats = [
        { value: '99.99%', label: 'Uptime SLA' },
        { value: '10x', label: 'Faster Search' },
        { value: '500+', label: 'Enterprise Customers' },
        { value: '2.5M+', label: 'Memories Processed Daily' }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            {/* Navigation */}
            <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                🧠 MemorAI
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                                Features
                            </a>
                            <a href="#testimonials" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                                Testimonials
                            </a>
                            <a href="#pricing" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">
                                Pricing
                            </a>
                            <Link
                                href="/dashboard"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Transform Your Team's
                            <span className="text-blue-600 dark:text-blue-400 block">
                                Collective Memory
                            </span>
                        </h1>

                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                            MemorAI is the intelligent memory management platform that helps teams capture, organize, and retrieve knowledge with AI-powered precision. Never lose important information again.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                            <Link
                                href="/dashboard"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
                            >
                                Start Free Trial
                            </Link>
                            <button className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-8 py-4 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
                                Watch Demo
                            </button>
                        </div>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                SOC 2 Compliant
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                GDPR Ready
                            </div>
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                99.99% Uptime
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Powerful Features for Modern Teams
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Everything you need to manage your team's knowledge effectively, from AI-powered search to enterprise-grade security.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700"
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                    {feature.description}
                                </p>
                                <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                                    {feature.benefit}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-white dark:bg-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Trusted by Industry Leaders
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300">
                            See what our customers are saying about MemorAI
                        </p>
                    </div>

                    <div className="relative">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 md:p-12">
                            <div className="text-center">
                                <div className="text-6xl text-blue-600 dark:text-blue-400 mb-6">"</div>
                                <blockquote className="text-xl md:text-2xl text-gray-900 dark:text-white font-medium mb-8 leading-relaxed">
                                    {testimonials[currentTestimonial].quote}
                                </blockquote>

                                <div className="flex items-center justify-center">
                                    <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mr-4"></div>
                                    <div className="text-left">
                                        <div className="font-bold text-gray-900 dark:text-white">
                                            {testimonials[currentTestimonial].name}
                                        </div>
                                        <div className="text-gray-600 dark:text-gray-400">
                                            {testimonials[currentTestimonial].role}, {testimonials[currentTestimonial].company}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial dots */}
                        <div className="flex justify-center mt-8 space-x-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${index === currentTestimonial
                                            ? 'bg-blue-600 dark:bg-blue-400'
                                            : 'bg-gray-300 dark:bg-gray-600'
                                        }`}
                                    aria-label={`View testimonial ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Simple, Transparent Pricing
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Choose the plan that fits your team size and needs. All plans include our core AI features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {pricingTiers.map((tier, index) => (
                            <div
                                key={index}
                                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-2 ${tier.highlighted
                                        ? 'border-blue-500 dark:border-blue-400 scale-105'
                                        : 'border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                {tier.highlighted && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-8">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {tier.name}
                                    </h3>
                                    <div className="mb-4">
                                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                            {tier.price}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                                            {tier.period}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {tier.description}
                                    </p>
                                </div>

                                <ul className="mb-8 space-y-3">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center">
                                            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${tier.highlighted
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {tier.ctaText}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 dark:bg-blue-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Team's Memory?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of teams already using MemorAI to capture, organize, and share knowledge more effectively.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/dashboard"
                            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            Start Your Free Trial
                        </Link>
                        <button className="border border-blue-300 text-white hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-white">
                            Schedule a Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 dark:bg-black text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold text-blue-400 mb-4">
                                🧠 MemorAI
                            </div>
                            <p className="text-gray-400 mb-4">
                                The intelligent memory management platform for modern teams.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 MemorAI. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

