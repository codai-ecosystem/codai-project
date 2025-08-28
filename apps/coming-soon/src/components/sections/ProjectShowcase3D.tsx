'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n } from '@/contexts/I18nContext'
import { AnimatedCard, AnimatedButton, AnimatedIcon } from '@/components/ui/AnimatedComponents'
import { Reveal, Stagger, Parallax } from '@/lib/animations'
import {
  CpuChipIcon as CpuIcon,
  CpuChipIcon as BrainIcon,
  CreditCardIcon,
  WalletIcon,
  QrCodeIcon as CodeIcon,
  MagnifyingGlassIcon as SearchIcon,
  ShieldCheckIcon as ShieldIcon,
  ServerIcon,
  CogIcon as SettingsIcon,
  ChartBarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  GlobeAltIcon,
  CogIcon,
  CircleStackIcon as DatabaseIcon,
  CloudIcon,
  LockClosedIcon,
  BanknotesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CommandLineIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

// Project categories with their specific configurations
const projectCategories = {
  ai: {
    id: 'ai',
    color: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-900/20 to-pink-900/20',
    icon: BrainIcon,
    pattern: '🧠',
    projects: ['memorai', 'romai', 'conversai']
  },
  financial: {
    id: 'financial',
    color: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-900/20 to-emerald-900/20',
    icon: CreditCardIcon,
    pattern: '💰',
    projects: ['bancai', 'wallet']
  },
  development: {
    id: 'development',
    color: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-900/20 to-cyan-900/20',
    icon: CodeIcon,
    pattern: '⚡',
    projects: ['kodex', 'explorer']
  },
  infrastructure: {
    id: 'infrastructure',
    color: 'from-orange-500 to-red-500',
    bgGradient: 'from-orange-900/20 to-red-900/20',
    icon: ServerIcon,
    pattern: '🏗️',
    projects: ['identity', 'gateway', 'hub']
  },
  admin: {
    id: 'admin',
    color: 'from-indigo-500 to-purple-500',
    bgGradient: 'from-indigo-900/20 to-purple-900/20',
    icon: SettingsIcon,
    pattern: '⚙️',
    projects: ['admin', 'control']
  }
}

// Individual project configurations
const projectConfigs = {
  memorai: {
    id: 'memorai',
    icon: DatabaseIcon,
    gradient: 'from-purple-600 to-violet-600',
    specialEffect: 'neural-network',
    features: ['Memory Management', 'AI Recall', 'Context Preservation']
  },
  romai: {
    id: 'romai',
    icon: SparklesIcon,
    gradient: 'from-pink-600 to-rose-600',
    specialEffect: 'quantum-glow',
    features: ['Romanian AI', 'Cultural Context', 'Advanced Reasoning']
  },
  conversai: {
    id: 'conversai',
    icon: UserGroupIcon,
    gradient: 'from-purple-600 to-indigo-600',
    specialEffect: 'conversation-bubbles',
    features: ['Natural Dialog', 'Multi-Language', 'Context Aware']
  },
  bancai: {
    id: 'bancai',
    icon: BanknotesIcon,
    gradient: 'from-green-600 to-emerald-600',
    specialEffect: 'money-flow',
    features: ['Banking AI', 'Financial Analysis', 'Risk Assessment']
  },
  wallet: {
    id: 'wallet',
    icon: WalletIcon,
    gradient: 'from-emerald-600 to-teal-600',
    specialEffect: 'digital-coins',
    features: ['Digital Wallet', 'Crypto Support', 'Secure Transactions']
  },
  kodex: {
    id: 'kodex',
    icon: CommandLineIcon,
    gradient: 'from-blue-600 to-cyan-600',
    specialEffect: 'code-matrix',
    features: ['Code Analysis', 'Smart Suggestions', 'Auto-completion']
  },
  explorer: {
    id: 'explorer',
    icon: GlobeAltIcon,
    gradient: 'from-cyan-600 to-blue-600',
    specialEffect: 'data-exploration',
    features: ['Data Exploration', 'Visual Analytics', 'Smart Insights']
  },
  identity: {
    id: 'identity',
    icon: LockClosedIcon,
    gradient: 'from-orange-600 to-red-600',
    specialEffect: 'security-shield',
    features: ['Identity Management', 'OAuth 2.0', 'Multi-Factor Auth']
  },
  gateway: {
    id: 'gateway',
    icon: CloudIcon,
    gradient: 'from-red-600 to-pink-600',
    specialEffect: 'network-flow',
    features: ['API Gateway', 'Load Balancing', 'Rate Limiting']
  },
  hub: {
    id: 'hub',
    icon: CogIcon,
    gradient: 'from-orange-600 to-yellow-600',
    specialEffect: 'hub-connections',
    features: ['Service Hub', 'Orchestration', 'Monitoring']
  },
  admin: {
    id: 'admin',
    icon: ChartBarIcon,
    gradient: 'from-indigo-600 to-purple-600',
    specialEffect: 'dashboard-glow',
    features: ['Admin Dashboard', 'Analytics', 'User Management']
  },
  control: {
    id: 'control',
    icon: BeakerIcon,
    gradient: 'from-purple-600 to-pink-600',
    specialEffect: 'control-panel',
    features: ['System Control', 'Configuration', 'Automation']
  }
}

// Special effect components
const SpecialEffects = {
  'neural-network': () => (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-400 rounded-full"
          style={{
            left: `${20 + i * 10}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  ),
  'quantum-glow': () => (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-xl"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  ),
  'money-flow': () => (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-400 rounded-full"
          style={{
            left: `${10 + i * 20}%`,
            top: '50%',
          }}
          animate={{
            y: [-20, 20, -20],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  ),
  // Add more special effects as needed...
}

// Filter component
interface ProjectFilterProps {
  categories: typeof projectCategories
  activeCategory: string | null
  onCategoryChange: (category: string | null) => void
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  const { t } = useI18n()

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-12">
      <AnimatedButton
        variant={activeCategory === null ? 'primary' : 'outline'}
        onClick={() => onCategoryChange(null)}
        className="capitalize"
      >
        {t('projects.filter.all')}
      </AnimatedButton>

      {Object.entries(categories).map(([key, category]) => {
        const Icon = category.icon
        return (
          <AnimatedButton
            key={key}
            variant={activeCategory === key ? 'primary' : 'outline'}
            onClick={() => onCategoryChange(key)}
            className="capitalize flex items-center gap-2"
          >
            <AnimatedIcon animation="scale" trigger="hover">
              <Icon className="w-4 h-4" />
            </AnimatedIcon>
            {t(`projects.categories.${key}`)}
          </AnimatedButton>
        )
      })}
    </div>
  )
}

// Project card component
interface ProjectCardProps {
  project: keyof typeof projectConfigs
  category: string
  index: number
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, category, index }) => {
  const { t } = useI18n()
  const config = projectConfigs[project]
  const categoryConfig = projectCategories[category as keyof typeof projectCategories]
  const Icon = config.icon
  const SpecialEffect = SpecialEffects[config.specialEffect as keyof typeof SpecialEffects]

  return (
    <Reveal delay={index * 0.1}>
      <AnimatedCard
        hoverEffect={true}
        glowOnHover={true}
        className={`relative p-6 bg-gradient-to-br ${categoryConfig.bgGradient} border border-white/10 backdrop-blur-sm`}
      >
        {/* Special effect background */}
        {SpecialEffect && <SpecialEffect />}

        {/* Header */}
        <div className="relative z-10 mb-4">
          <div className="flex items-center justify-between mb-3">
            <motion.div
              className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-6 h-6 text-white" />
            </motion.div>

            <motion.div
              className="text-2xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {categoryConfig.pattern}
            </motion.div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2 capitalize">
            {t(`projects.items.${project}.name`)}
          </h3>

          <p className="text-gray-300 text-sm">
            {t(`projects.items.${project}.description`)}
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 mb-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            {t('projects.features')}
          </h4>
          <ul className="space-y-1">
            {config.features.map((feature, i) => (
              <motion.li
                key={i}
                className="text-sm text-gray-300 flex items-center gap-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Status badge */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            {t('projects.status.active')}
          </span>

          <AnimatedButton
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            {t('projects.learn_more')}
          </AnimatedButton>
        </div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatedCard>
    </Reveal>
  )
}

// Main project showcase component
export default function ProjectShowcase3D() {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Filter projects based on active category
  const filteredProjects = React.useMemo(() => {
    if (!activeCategory) {
      return Object.entries(projectCategories).flatMap(([categoryKey, category]) =>
        category.projects.map(project => ({ project, category: categoryKey }))
      )
    }

    const category = projectCategories[activeCategory as keyof typeof projectCategories]
    return category.projects.map(project => ({ project, category: activeCategory }))
  }, [activeCategory])

  return (
    <section className="relative py-20 bg-slate-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <Stagger>
          <Reveal>
            <div className="text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <RocketLaunchIcon className="w-4 h-4" />
                {t('projects.badge')}
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                {t('projects.title')}
              </h2>

              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                {t('projects.subtitle')}
              </p>
            </div>
          </Reveal>

          {/* Filter */}
          <Reveal delay={0.2}>
            <ProjectFilter
              categories={projectCategories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </Reveal>

          {/* Project Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="wait">
              {filteredProjects.map(({ project, category }, index) => (
                <motion.div
                  key={`${project}-${category}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProjectCard
                    project={project as keyof typeof projectConfigs}
                    category={category}
                    index={index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Load More Button */}
          <Reveal delay={0.8}>
            <div className="text-center mt-12">
              <AnimatedButton
                variant="outline"
                size="lg"
                className="border-white/20 text-white hover:bg-white/10"
              >
                {t('projects.load_more')}
              </AnimatedButton>
            </div>
          </Reveal>
        </Stagger>
      </div>

      {/* Floating Elements */}
      <Parallax>
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </Parallax>

      <Parallax>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
      </Parallax>
    </section>
  )
}