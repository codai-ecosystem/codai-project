'use client'

import React, { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Calendar, Users, Zap, Code, Shield, Globe } from 'lucide-react'
import { Project } from '@/data/projects'
import { useTheme } from '@/contexts/ThemeContext'
import { durations, easings, springs, motionVariants } from '@/design-system/animations'

interface ProjectModalProps {
    project: Project | null
    isOpen: boolean
    onClose: () => void
}

export function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const { theme } = useTheme()
    const modalRef = useRef<HTMLDivElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    // Focus management for accessibility
    useEffect(() => {
        if (isOpen && closeButtonRef.current) {
            closeButtonRef.current.focus()
        }
    }, [isOpen])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Click outside to close
    const handleBackdropClick = (event: React.MouseEvent) => {
        if (event.target === event.currentTarget) {
            onClose()
        }
    }

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'production':
                return { color: 'text-green-400', bg: 'bg-green-500/20', icon: Globe }
            case 'development':
                return { color: 'text-blue-400', bg: 'bg-blue-500/20', icon: Code }
            case 'beta':
                return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: Zap }
            case 'coming-soon':
                return { color: 'text-orange-400', bg: 'bg-orange-500/20', icon: Calendar }
            default:
                return { color: 'text-gray-400', bg: 'bg-gray-500/20', icon: Calendar }
        }
    }

    const getTierInfo = (tier: number) => {
        const tierConfig = {
            1: { name: 'Foundation Services', description: 'Core infrastructure and essential services' },
            2: { name: 'New Generation', description: 'Next-generation AI applications' },
            3: { name: 'Infrastructure', description: 'Platform and infrastructure services' },
            4: { name: 'Specialized Services', description: 'Domain-specific solutions' },
            5: { name: 'Emerging Platforms', description: 'Cutting-edge experimental platforms' }
        }
        return tierConfig[tier as keyof typeof tierConfig] || { name: 'Unknown Tier', description: 'Tier description not available' }
    }

    if (!project) return null

    const IconComponent = project.icon as React.ComponentType<{ className?: string }>
    const statusConfig = getStatusConfig(project.status)
    const StatusIcon = statusConfig.icon
    const tierInfo = getTierInfo(project.tier)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: durations.fast, ease: easings.smooth }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-description"
                >
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={springs.gentle}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-auto bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            className="absolute top-6 right-6 z-10 p-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-colors duration-200 group"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" />
                        </button>

                        {/* Header */}
                        <div className="relative p-8 pb-6">
                            <div className="flex items-start gap-6 mb-6">
                                <div className={`
                  p-4 rounded-2xl bg-gradient-to-br ${project.gradient}
                  flex items-center justify-center min-w-[64px] h-16
                `}>
                                    <IconComponent className="w-8 h-8 text-white" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h1 id="modal-title" className="text-3xl font-bold text-white mb-2">
                                        {project.name}
                                    </h1>
                                    <p className="text-lg text-gray-300 mb-3">
                                        {project.domain}
                                    </p>

                                    {/* Status and Tier Badges */}
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <div className={`
                      flex items-center gap-2 px-3 py-1.5 rounded-full
                      ${statusConfig.bg} ${statusConfig.color}
                    `}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-full">
                                            <Shield className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                Tier {project.tier} - {tierInfo.name}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-full">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                                Launch: {project.launchDate}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tagline */}
                                    {project.tagline && (
                                        <p className="text-blue-400 italic text-lg mb-4">
                                            "{project.tagline}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="px-8 pb-8">
                            {/* Description */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
                                <p id="modal-description" className="text-gray-300 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>

                            {/* Features Grid */}
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-white mb-4">Key Features</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {project.features.map((feature, index) => {
                                        const [title, description] = feature.includes(':')
                                            ? feature.split(':').map(s => s.trim())
                                            : [feature, '']

                                        return (
                                            <div
                                                key={index}
                                                className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-colors duration-200"
                                            >
                                                <h3 className="font-medium text-white mb-1">{title}</h3>
                                                {description && (
                                                    <p className="text-sm text-gray-400">{description}</p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Project Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Category */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Category</h3>
                                    <div className="p-4 bg-gray-800/30 rounded-xl">
                                        <span className="text-gray-300">{project.category}</span>
                                    </div>
                                </div>

                                {/* Tier Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-3">Innovation Tier</h3>
                                    <div className="p-4 bg-gray-800/30 rounded-xl">
                                        <div className="text-white font-medium mb-1">
                                            Tier {project.tier} - {tierInfo.name}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {tierInfo.description}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Call to Action */}
                            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-800">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Learn More
                                </motion.button>

                                {project.status === 'production' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors duration-200"
                                    >
                                        <Globe className="w-4 h-4" />
                                        Try Now
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default ProjectModal