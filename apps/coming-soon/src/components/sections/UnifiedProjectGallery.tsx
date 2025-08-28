'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  codaiProjects, 
  projectCategories, 
  getProjectsByTier,
  getTotalProjectStats,
  Project 
} from '@/data/projects'
import { useTheme } from '@/contexts/ThemeContext'
import { colors, gradients } from '@/design-system/colors'
import { typographyStyles, responsiveTypography } from '@/design-system/typography'
import { durations, easings, springs, motionVariants } from '@/design-system/animations'

interface UnifiedProjectGalleryProps {
  className?: string
}

export function UnifiedProjectGallery({ className = '' }: UnifiedProjectGalleryProps) {
  const { theme } = useTheme()
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const stats = getTotalProjectStats()
  
  const tiers = [
    { tier: 1, title: 'Foundation Services', count: 8, color: 'from-blue-500 to-indigo-600' },
    { tier: 2, title: 'New Generation', count: 3, color: 'from-purple-500 to-pink-600' },
    { tier: 3, title: 'Infrastructure', count: 10, color: 'from-emerald-500 to-teal-600' },
    { tier: 4, title: 'Specialized Services', count: 6, color: 'from-orange-500 to-red-600' },
    { tier: 5, title: 'Emerging Platforms', count: 15, color: 'from-cyan-500 to-blue-600' }
  ]

  const getProjectsToShow = () => {
    if (selectedTier) {
      return getProjectsByTier(selectedTier)
    }
    return codaiProjects
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'bg-green-500'
      case 'development': return 'bg-blue-500'
      case 'beta': return 'bg-yellow-500'
      case 'coming-soon': return 'bg-orange-500'
      case 'planned': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const ProjectCard = ({ project }: { project: Project }) => {
    const IconComponent = project.icon as React.ComponentType<{ className?: string }>
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={springs.gentle}
        data-testid={`project-card-${project.id}`}
        className={`
          relative group cursor-pointer overflow-hidden rounded-xl
          bg-gradient-to-br from-gray-900/80 to-black/90 
          backdrop-blur-md border border-gray-800/50
          hover:border-gray-600/50 transition-all duration-300
          ${hoveredProject === project.id ? 'scale-[1.02] shadow-2xl' : ''}
        `}
        onMouseEnter={() => setHoveredProject(project.id)}
        onMouseLeave={() => setHoveredProject(null)}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className={`
            px-2 py-1 text-xs font-medium text-white rounded-full
            ${getStatusColor(project.status)}
          `}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </div>
        </div>

        {/* Tier Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="px-2 py-1 text-xs font-medium text-white bg-white/10 backdrop-blur-sm rounded-full">
            Tier {project.tier}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full flex flex-col">
          {/* Icon and Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`
              p-3 rounded-xl bg-gradient-to-br ${project.gradient}
              flex items-center justify-center min-w-[48px] h-12
            `}>
              <IconComponent className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300">
                {project.name}
              </h3>
              <p className="text-sm text-gray-400 truncate">
                {project.domain}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-1">
            {project.description}
          </p>

          {/* Category */}
          <div className="mb-4">
            <span className="inline-block px-2 py-1 text-xs bg-gray-800 text-gray-300 rounded-full">
              {project.category}
            </span>
          </div>

          {/* Tagline */}
          {project.tagline && (
            <p className="text-xs text-blue-400 italic mb-4">
              "{project.tagline}"
            </p>
          )}

          {/* Features Preview */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {project.features.slice(0, 2).map((feature, index) => (
                <span 
                  key={index}
                  className="text-xs text-gray-400 bg-gray-800/50 px-2 py-1 rounded-full"
                >
                  {feature.split(':')[0]}
                </span>
              ))}
              {project.features.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{project.features.length - 2} more
                </span>
              )}
            </div>
          </div>

          {/* Launch Date */}
          <div className="text-xs text-gray-500 mt-auto">
            Launch: {project.launchDate}
          </div>
        </div>

        {/* Hover Overlay */}
        <AnimatePresence>
          {hoveredProject === project.id && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-sm"
            />
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className={`py-20 bg-gradient-to-b from-black via-gray-900 to-black ${className}`}>
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.slow, ease: easings.smooth }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            The Complete CODAI Ecosystem
          </h2>
          
          <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
            Explore all 42 revolutionary AI applications across 5 tiers of innovation. 
            From foundation services to emerging platforms, discover the future of AI-powered solutions.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-gray-400">Total Projects</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.production}</div>
              <div className="text-sm text-gray-400">In Production</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.development}</div>
              <div className="text-sm text-gray-400">In Development</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{stats.tiers}</div>
              <div className="text-sm text-gray-400">Innovation Tiers</div>
            </div>
          </div>
        </motion.div>

        {/* Tier Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.slow, ease: easings.smooth, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTier(null)}
              data-testid="filter-all-projects"
              className={`
                px-6 py-3 rounded-xl font-medium transition-all duration-300
                ${selectedTier === null
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                }
              `}
            >
              All Projects ({stats.total})
            </motion.button>
            
            {tiers.map(({ tier, title, count, color }) => (
              <motion.button
                key={tier}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTier(tier)}
                data-testid={`filter-tier-${tier}`}
                className={`
                  px-6 py-3 rounded-xl font-medium transition-all duration-300
                  ${selectedTier === tier
                    ? `bg-gradient-to-r ${color} text-white shadow-lg`
                    : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }
                `}
              >
                {title} ({count})
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Project Grid */}
        <motion.div
          layout
          role="region"
          aria-label="Projects gallery"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {getProjectsToShow().map((project, index) => (
              <div 
                key={project.id} 
                role="article"
                tabIndex={0}
                aria-label={`${project.name} project`}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: durations.slow, ease: easings.smooth, delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-gray-400 mb-6">
            Ready to experience the future of AI? Join the CODAI ecosystem today.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              px-8 py-4 rounded-xl font-semibold
              bg-gradient-to-r from-blue-500 to-purple-600
              text-white shadow-lg transition-all duration-300
              hover:shadow-xl hover:shadow-blue-500/25
            `}
          >
            Get Early Access
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

export default UnifiedProjectGallery