'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence, useInView, useAnimation } from 'framer-motion'
import { useI18n } from '@/contexts/I18nContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Reveal, Stagger, Parallax, Floating, Magnetic } from '@/lib/animations'
import { AnimatedButton, AnimatedIcon, AnimatedCounter, TypewriterText } from '@/components/ui/AnimatedComponents'
import {
  CpuChipIcon,
  CloudIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CogIcon,
  LightBulbIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

// Ecosystem service categories with enhanced data
const serviceCategories = [
  {
    id: 'ai-platform',
    key: 'ai_platform',
    name: 'AI Platform',
    description: 'Advanced artificial intelligence and machine learning solutions',
    icon: CpuChipIcon,
    color: '#6366f1',
    gradient: 'from-indigo-500 to-purple-600',
    stats: { services: 12, users: 25000, uptime: 99.9 },
    services: ['RomAI', 'MemorAI', 'BancAI', 'AnalizAI', 'StudiAI', 'ConversAI'],
    connections: ['development-tools', 'enterprise-solutions', 'specialized-apps'],
    position: { x: 20, y: 20 },
    techStack: ['PyTorch', 'TensorFlow', 'Azure ML', 'FastAPI', 'Redis']
  },
  {
    id: 'development-tools',
    key: 'development_tools',
    name: 'Development Tools',
    description: 'Comprehensive development and deployment infrastructure',
    icon: CogIcon,
    color: '#059669',
    gradient: 'from-emerald-500 to-teal-600',
    stats: { services: 8, users: 15000, uptime: 99.8 },
    services: ['Gateway API', 'Identity Service', 'Secure API Gateway', 'MCP Servers'],
    connections: ['ai-platform', 'enterprise-solutions', 'infrastructure'],
    position: { x: 70, y: 20 },
    techStack: ['Node.js', 'TypeScript', 'Docker', 'Kubernetes', 'PostgreSQL']
  },
  {
    id: 'enterprise-solutions',
    key: 'enterprise_solutions',
    name: 'Enterprise Solutions',
    description: 'Scalable enterprise-grade applications and services',
    icon: ShieldCheckIcon,
    color: '#dc2626',
    gradient: 'from-red-500 to-rose-600',
    stats: { services: 15, users: 50000, uptime: 99.95 },
    services: ['Admin Dashboard', 'Security Suite', 'Compliance API', 'Audit Service'],
    connections: ['ai-platform', 'development-tools', 'infrastructure'],
    position: { x: 20, y: 70 },
    techStack: ['React', 'Next.js', 'Python', 'MongoDB', 'OAuth2.0']
  },
  {
    id: 'infrastructure',
    key: 'infrastructure',
    name: 'Infrastructure',
    description: 'Core infrastructure and platform services',
    icon: CloudIcon,
    color: '#7c3aed',
    gradient: 'from-violet-500 to-purple-600',
    stats: { services: 6, users: 75000, uptime: 99.99 },
    services: ['Load Balancer', 'Database Cluster', 'Redis Cache', 'Message Queue'],
    connections: ['development-tools', 'enterprise-solutions'],
    position: { x: 70, y: 70 },
    techStack: ['Docker', 'Nginx', 'PostgreSQL', 'Redis', 'RabbitMQ']
  },
  {
    id: 'specialized-apps',
    key: 'specialized_apps', 
    name: 'Specialized Apps',
    description: 'Domain-specific intelligent applications',
    icon: SparklesIcon,
    color: '#ea580c',
    gradient: 'from-orange-500 to-amber-600',
    stats: { services: 10, users: 30000, uptime: 99.7 },
    services: ['Explorer', 'Kodex', 'Wallet', 'Coming Soon'],
    connections: ['ai-platform'],
    position: { x: 45, y: 45 },
    techStack: ['React', 'Vue.js', 'Tailwind CSS', 'Web3', 'GraphQL']
  }
]

// Technology stack with enhanced information
const technologyStack = [
  { name: 'React', category: 'Frontend', color: '#61dafb', usage: 95 },
  { name: 'Next.js', category: 'Framework', color: '#000000', usage: 90 },
  { name: 'TypeScript', category: 'Language', color: '#3178c6', usage: 100 },
  { name: 'Node.js', category: 'Backend', color: '#339933', usage: 85 },
  { name: 'Python', category: 'AI/ML', color: '#3776ab', usage: 90 },
  { name: 'Docker', category: 'Infrastructure', color: '#2496ed', usage: 100 },
  { name: 'PostgreSQL', category: 'Database', color: '#336791', usage: 80 },
  { name: 'Redis', category: 'Cache', color: '#dc382d', usage: 75 },
  { name: 'Azure', category: 'Cloud', color: '#0078d4', usage: 70 },
  { name: 'Kubernetes', category: 'Orchestration', color: '#326ce5', usage: 65 }
]

// Development phases timeline
const developmentPhases = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    period: '2024 Q1-Q2',
    status: 'completed',
    progress: 100,
    milestones: ['Core Infrastructure', 'Identity System', 'Basic AI Services'],
    color: '#10b981'
  },
  {
    phase: 'Phase 2', 
    title: 'AI Enhancement',
    period: '2024 Q3-Q4',
    status: 'completed',
    progress: 95,
    milestones: ['Advanced ML Models', 'RomAI Platform', 'Memory Systems'],
    color: '#6366f1'
  },
  {
    phase: 'Phase 3',
    title: 'Enterprise Scale',
    period: '2025 Q1-Q2',
    status: 'in-progress',
    progress: 60,
    milestones: ['Enterprise Security', 'Compliance Suite', 'Advanced Analytics'],
    color: '#f59e0b'
  },
  {
    phase: 'Phase 4',
    title: 'Global Expansion',
    period: '2025 Q3-Q4',
    status: 'planned',
    progress: 0,
    milestones: ['Multi-Region Deploy', 'Advanced AI', 'Global Partnership'],
    color: '#8b5cf6'
  }
]

// Interactive service node component
interface ServiceNodeProps {
  service: typeof serviceCategories[0]
  isActive: boolean
  onHover: (serviceId: string | null) => void
  connections: string[]
  theme: string
}

const ServiceNode: React.FC<ServiceNodeProps> = ({ service, isActive, onHover, connections, theme }) => {
  const Icon = service.icon
  
  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${service.position.x}%`,
        top: `${service.position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onHoverStart={() => onHover(service.id)}
      onHoverEnd={() => onHover(null)}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: 1, 
        scale: isActive ? 1.2 : 1,
        boxShadow: isActive 
          ? `0 0 40px ${service.color}40`
          : '0 8px 32px rgba(0,0,0,0.12)'
      }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
    >
      {/* Connection lines */}
      {isActive && connections.map((connectionId) => {
        const targetService = serviceCategories.find(s => s.id === connectionId)
        if (!targetService) return null
        
        const startX = service.position.x
        const startY = service.position.y
        const endX = targetService.position.x
        const endY = targetService.position.y
        
        const length = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2))
        const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI
        
        return (
          <motion.div
            key={connectionId}
            className="absolute pointer-events-none"
            style={{
              width: `${length * 3}px`,
              height: '2px',
              background: `linear-gradient(90deg, ${service.color}, ${targetService.color})`,
              transformOrigin: '0 50%',
              transform: `rotate(${angle}deg)`,
              left: '50%',
              top: '50%',
              zIndex: -1
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />
        )
      })}
      
      {/* Service node */}
      <div className={`
        relative w-24 h-24 rounded-full 
        ${theme === 'dark' 
          ? 'bg-gray-800 border-2 border-gray-700' 
          : 'bg-white border-2 border-gray-200'
        }
        flex items-center justify-center transition-all duration-300
        ${isActive ? 'shadow-2xl' : 'shadow-lg'}
      `}>
        {/* Background gradient */}
        <div 
          className="absolute inset-0 rounded-full opacity-10"
          style={{ background: `linear-gradient(135deg, ${service.color}, ${service.color}80)` }}
        />
        
        {/* Icon */}
        <AnimatedIcon animation="scale" trigger="hover">
          <Icon 
            className="w-10 h-10 z-10 relative"
            style={{ color: service.color }}
          />
        </AnimatedIcon>
        
        {/* Pulse animation */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 opacity-30"
          style={{ borderColor: service.color }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>
      
      {/* Service label */}
      <motion.div
        className={`
          absolute top-full mt-3 left-1/2 transform -translate-x-1/2
          text-center min-w-max px-3 py-1 rounded-lg
          ${theme === 'dark' 
            ? 'bg-gray-800 text-white border border-gray-700' 
            : 'bg-white text-gray-900 border border-gray-200'
          }
        `}
        initial={{ opacity: 0, y: -10 }}
        animate={{ 
          opacity: isActive ? 1 : 0.8, 
          y: 0,
          scale: isActive ? 1.05 : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="font-semibold text-sm">{service.name}</div>
        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          {service.services.length} services
        </div>
      </motion.div>
    </motion.div>
  )
}

// Statistics display component
const StatsDisplay: React.FC<{ category: typeof serviceCategories[0], theme: string }> = ({ category, theme }) => {
  const { t } = useI18n()
  
  return (
    <motion.div
      className={`p-6 rounded-xl border ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      } shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${category.color}20` }}
        >
          <category.icon 
            className="w-6 h-6"
            style={{ color: category.color }}
          />
        </div>
        <div>
          <h3 className={`font-bold text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {category.name}
          </h3>
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {category.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <AnimatedCounter 
            from={0}
            to={category.stats.services} 
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          />
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Services
          </div>
        </div>
        <div className="text-center">
          <AnimatedCounter 
            from={0}
            to={category.stats.users} 
            suffix="+"
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          />
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Users
          </div>
        </div>
        <div className="text-center">
          <AnimatedCounter 
            from={0}
            to={category.stats.uptime} 
            suffix="%" 
            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
          />
          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Uptime
          </div>
        </div>
      </div>
      
      {/* Technology stack */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Tech Stack
        </div>
        <div className="flex flex-wrap gap-1">
          {category.techStack.map((tech) => (
            <span
              key={tech}
              className={`px-2 py-1 text-xs rounded ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
      
      {/* Services list */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Key Services
        </div>
        <div className="space-y-1">
          {category.services.slice(0, 4).map((service) => (
            <div
              key={service}
              className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {service}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// Technology stack showcase component
const TechnologyShowcase: React.FC<{ theme: string }> = ({ theme }) => {
  const { t } = useI18n()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const categories = useMemo(() => {
    const cats = [...new Set(technologyStack.map(tech => tech.category))]
    return cats.map(cat => ({
      name: cat,
      techs: technologyStack.filter(tech => tech.category === cat),
      color: technologyStack.find(tech => tech.category === cat)?.color || '#6366f1'
    }))
  }, [])
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Technology Showcase
        </h3>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Modern tech stack powering the CODAI ecosystem
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <motion.div
            key={category.name}
            className={`p-4 rounded-lg border cursor-pointer ${
              theme === 'dark' 
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
                : 'bg-white border-gray-200 hover:border-gray-300'
            }`}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setActiveCategory(category.name)}
            onHoverEnd={() => setActiveCategory(null)}
          >
            <div className={`font-semibold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {category.name}
            </div>
            <div className="space-y-2">
              {category.techs.map((tech) => (
                <motion.div
                  key={tech.name}
                  className="flex items-center gap-3"
                  animate={{
                    scale: activeCategory === category.name ? 1.05 : 1,
                    opacity: activeCategory === null || activeCategory === category.name ? 1 : 0.5
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tech.color }}
                  />
                  <div className="flex-1">
                    <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {tech.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-full h-1 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <motion.div
                          className="h-full rounded-full"
                          style={{ backgroundColor: tech.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${tech.usage}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {tech.usage}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Development timeline component
const DevelopmentTimeline: React.FC<{ theme: string }> = ({ theme }) => {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <div ref={ref} className="space-y-6">
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          Development Timeline
        </h3>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Our journey from foundation to global expansion
        </p>
      </div>
      
      <div className="relative">
        {/* Timeline line */}
        <div className={`absolute left-1/2 top-0 bottom-0 w-1 transform -translate-x-1/2 ${
          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
        }`} />
        
        <div className="space-y-12">
          {developmentPhases.map((phase, index) => (
            <motion.div
              key={phase.phase}
              className={`relative flex items-center ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              {/* Timeline node */}
              <div 
                className={`absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 ${
                  theme === 'dark' ? 'border-gray-800' : 'border-white'
                } z-10`}
                style={{ backgroundColor: phase.color }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: phase.color }}
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [1, 0.5, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>
              
              {/* Phase content */}
              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <motion.div
                  className={`p-6 rounded-xl border ${
                    theme === 'dark' 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  } shadow-lg`}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {phase.title}
                    </h4>
                    <span 
                      className="px-2 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: phase.color }}
                    >
                      {phase.phase}
                    </span>
                  </div>
                  
                  <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {phase.period}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {phase.milestones.map((milestone) => (
                      <div
                        key={milestone}
                        className={`text-sm flex items-center gap-2 ${
                          index % 2 === 0 ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: phase.color }}
                        />
                        <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                          {milestone}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        {phase.status.charAt(0).toUpperCase() + phase.status.slice(1).replace('-', ' ')}
                      </span>
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {phase.progress}%
                      </span>
                    </div>
                    <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: phase.color }}
                        initial={{ width: 0 }}
                        animate={isInView ? { width: `${phase.progress}%` } : {}}
                        transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main ecosystem overview component
export default function EcosystemOverviewAnimated() {
  const { t } = useI18n()
  const { theme } = useTheme()
  const [activeService, setActiveService] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'overview' | 'technology' | 'timeline'>('overview')
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true })
  
  const activeCategory = useMemo(() => 
    serviceCategories.find(cat => cat.id === activeService),
    [activeService]
  )

  return (
    <section 
      id="ecosystem"
      ref={sectionRef}
      className={`py-20 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-b from-gray-50 via-white to-gray-50'
      }`}
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <Reveal>
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ 
                backgroundColor: `#6366f120`,
                color: '#6366f1'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
            >
              <SparklesIcon className="w-4 h-4" />
              Ecosystem Overview
            </motion.div>
            
            <TypewriterText
              text="Interconnected AI Ecosystem"
              className={`text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent`}
            />
            
            <p className={`text-xl max-w-4xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Our comprehensive ecosystem of AI services, tools, and platforms work together to create seamless development experiences.
            </p>
          </div>
        </Reveal>

        {/* Navigation tabs */}
        <Reveal delay={0.2}>
          <div className="flex justify-center mb-12">
            <div className={`inline-flex rounded-lg p-1 ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              {[
                { key: 'overview', icon: GlobeAltIcon, label: 'Overview' },
                { key: 'technology', icon: CogIcon, label: 'Technology' },
                { key: 'timeline', icon: ChartBarIcon, label: 'Timeline' }
              ].map((tab) => (
                <AnimatedButton
                  key={tab.key}
                  variant={currentView === tab.key ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentView(tab.key as any)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </AnimatedButton>
              ))}
            </div>
          </div>
        </Reveal>

        <AnimatePresence mode="wait">
          {/* Ecosystem Overview */}
          {currentView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Ecosystem Diagram */}
                <div className="lg:col-span-2">
                  <Parallax>
                    <div className={`relative h-[500px] rounded-2xl border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    } shadow-2xl overflow-hidden`}>
                      {/* Background grid */}
                      <div className={`absolute inset-0 opacity-10 ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                      }`} 
                      style={{
                        backgroundImage: `
                          linear-gradient(90deg, currentColor 1px, transparent 1px),
                          linear-gradient(currentColor 1px, transparent 1px)
                        `,
                        backgroundSize: '20px 20px'
                      }} />
                      
                      {/* Service nodes */}
                      <Stagger>
                        {serviceCategories.map((service, index) => (
                          <ServiceNode
                            key={service.id}
                            service={service}
                            isActive={activeService === service.id}
                            onHover={setActiveService}
                            connections={activeService === service.id ? service.connections : []}
                            theme={theme}
                          />
                        ))}
                      </Stagger>
                      
                      {/* Center logo/title */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                        animate={{
                          scale: activeService ? 0.8 : 1,
                          opacity: activeService ? 0.3 : 1
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className={`text-2xl font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          CODAI
                        </div>
                        <div className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Ecosystem Core
                        </div>
                      </motion.div>
                    </div>
                  </Parallax>
                </div>

                {/* Service Details Panel */}
                <div className="space-y-6">
                  <AnimatePresence mode="wait">
                    {activeCategory ? (
                      <motion.div
                        key={activeCategory.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <StatsDisplay category={activeCategory} theme={theme} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="default"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`p-8 rounded-xl border ${
                          theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        } shadow-lg text-center`}
                      >
                        <LightBulbIcon 
                          className={`w-16 h-16 mx-auto mb-4 ${
                            theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                          }`} 
                        />
                        <h3 className={`text-xl font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          Explore Services
                        </h3>
                        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Hover over service nodes to discover their capabilities and connections
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Overall statistics */}
                  <Floating>
                    <div className={`p-6 rounded-xl border ${
                      theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                    } shadow-lg`}>
                      <h3 className={`font-bold text-lg mb-4 ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        Overall Statistics
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <AnimatedCounter 
                            from={0}
                            to={serviceCategories.reduce((sum, cat) => sum + cat.stats.services, 0)}
                            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                          />
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Services
                          </div>
                        </div>
                        <div className="text-center">
                          <AnimatedCounter 
                            from={0}
                            to={serviceCategories.reduce((sum, cat) => sum + cat.stats.users, 0)}
                            suffix="+"
                            className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                          />
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            Total Users
                          </div>
                        </div>
                      </div>
                    </div>
                  </Floating>
                </div>
              </div>
            </motion.div>
          )}

          {/* Technology Showcase */}
          {currentView === 'technology' && (
            <motion.div
              key="technology"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <TechnologyShowcase theme={theme} />
            </motion.div>
          )}

          {/* Development Timeline */}
          {currentView === 'timeline' && (
            <motion.div
              key="timeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <DevelopmentTimeline theme={theme} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}