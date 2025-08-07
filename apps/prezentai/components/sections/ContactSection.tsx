'use client'

import React from 'react'

import { motion } from 'framer-motion'
import { useState } from 'react'
import {
    Mail, Phone, MapPin, Send, Github, Linkedin,
    Globe, MessageCircle, Calendar, Users,
    ArrowRight, CheckCircle
} from 'lucide-react'

const contactMethods = [
    {
        icon: Mail,
        title: 'Email',
        description: 'Get in touch via email',
        value: 'contact@prezentai.ro',
        href: 'mailto:contact@prezentai.ro',
        color: 'from-blue-500 to-blue-600'
    },
    {
        icon: Phone,
        title: 'Phone',
        description: 'Call us directly',
        value: '+40 123 456 789',
        href: 'tel:+40123456789',
        color: 'from-green-500 to-green-600'
    },
    {
        icon: MapPin,
        title: 'Location',
        description: 'Our headquarters',
        value: 'Bucharest, Romania',
        href: '#',
        color: 'from-purple-500 to-purple-600'
    },
    {
        icon: MessageCircle,
        title: 'Live Chat',
        description: 'Chat with our team',
        value: 'Available 24/7',
        href: '#',
        color: 'from-orange-500 to-orange-600'
    }
]

const socialLinks = [
    {
        name: 'GitHub',
        icon: Github,
        href: 'https://github.com',
        color: 'hover:text-gray-900 dark:hover:text-gray-100'
    },
    {
        name: 'LinkedIn',
        icon: Linkedin,
        href: 'https://linkedin.com',
        color: 'hover:text-blue-600'
    },
    {
        name: 'Website',
        icon: Globe,
        href: '#',
        color: 'hover:text-green-500'
    }
]

const services = [
    { name: 'Custom AI Development', icon: Users },
    { name: 'Ecosystem Integration', icon: Globe },
    { name: 'Consultation Services', icon: Calendar },
    { name: 'Technical Support', icon: MessageCircle }
]

export function ContactSection() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        service: '',
        message: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Submit form data to our API
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    company: formData.company,
                    subject: formData.service || 'General Inquiry',
                    message: formData.message,
                    interesse: formData.service ? [formData.service] : [],
                    timeline: 'ASAP'
                })
            })

            if (response.ok) {
                const result = await response.json()
                console.log('[PREZENTAI CONTACT] Submission successful:', result)
                setIsSubmitted(true)
                setFormData({ name: '', email: '', company: '', service: '', message: '' })

                // Reset success message after 5 seconds
                setTimeout(() => setIsSubmitted(false), 5000)
            } else {
                const error = await response.json()
                console.error('[PREZENTAI CONTACT] Submission failed:', error)
                alert('Failed to send message. Please try again.')
            }
        } catch (error) {
            console.error('[PREZENTAI CONTACT] Network error:', error)
            alert('Network error. Please check your connection and try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    return (
        <section id="contact" className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full mb-6 border border-gray-200/50 dark:border-gray-700/50">
                        <Mail className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                            Get In Touch
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                        Let's Build the{' '}
                        <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Future Together
                        </span>
                    </h2>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                        Ready to explore our AI ecosystem or discuss custom solutions?
                        We'd love to hear from you and explore how we can help transform your business.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Information */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        {/* Contact Methods */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {contactMethods.map((method, index) => (
                                <motion.a
                                    key={method.title}
                                    href={method.href}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    viewport={{ once: true }}
                                    className="group block p-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${method.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <method.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                        {method.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {method.description}
                                    </p>
                                    <p className="font-medium text-primary-600 dark:text-primary-400">
                                        {method.value}
                                    </p>
                                </motion.a>
                            ))}
                        </div>

                        {/* Services */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200/50 dark:border-gray-700/50"
                        >
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                Our Services
                            </h3>
                            <div className="space-y-4">
                                {services.map((service, index) => (
                                    <motion.div
                                        key={service.name}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.6, delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex items-center space-x-3"
                                    >
                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                            <service.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300">
                                            {service.name}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Social Links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                Follow Us
                            </h3>
                            <div className="flex justify-center space-x-4">
                                {socialLinks.map((link) => (
                                    <motion.a
                                        key={link.name}
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-3 bg-white dark:bg-slate-800 rounded-lg text-gray-600 dark:text-gray-400 transition-all duration-200 ${link.color} hover:shadow-lg`}
                                        aria-label={link.name}
                                    >
                                        <link.icon className="w-5 h-5" />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50"
                    >
                        {isSubmitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-12"
                            >
                                <div className="inline-flex p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-6">
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                    Message Sent!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Thank you for reaching out. We'll get back to you within 24 hours.
                                </p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                                    Send us a message
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                            placeholder="Your name"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                            placeholder="Your company"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="service" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Service Interest
                                        </label>
                                        <select
                                            id="service"
                                            name="service"
                                            value={formData.service}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                                        >
                                            <option value="">Select a service</option>
                                            <option value="custom-ai">Custom AI Development</option>
                                            <option value="integration">Ecosystem Integration</option>
                                            <option value="consultation">Consultation</option>
                                            <option value="support">Technical Support</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Message *
                                    </label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={6}
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 resize-none"
                                        placeholder="Tell us about your project or how we can help..."
                                    />
                                </div>

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full group inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            <span>Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            <span>Send Message</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

