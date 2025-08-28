'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/contexts/ThemeContext'
import { useI18n } from '@/contexts/I18nContext'
import { cn } from '@/lib/utils'
import { designSystem } from '@/lib/design-system'
import {
  Typography,
  Display,
  Heading,
  Body,
  Caption,
  Overline,
  GradientText,
  H1,
  H2,
  H3,
  H4,
  P
} from '@/components/ui/Typography'
import { CODAIColorPalette, GradientGenerator } from '@/components/ui/ColorPalette'
import FontManager from '@/components/ui/FontManager'
import {
  SwatchIcon,
  CpuChipIcon,
  AdjustmentsHorizontalIcon,
  DocumentTextIcon,
  PaintBrushIcon,
  CodeBracketIcon,
  SparklesIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

// Design System Section Types
type DesignSystemSection =
  | 'overview'
  | 'colors'
  | 'typography'
  | 'components'
  | 'spacing'
  | 'elevation'
  | 'animation'
  | 'usage'

interface DesignSystemShowcaseProps {
  className?: string
  defaultSection?: DesignSystemSection
}

// Component Examples for Showcase
const ComponentExamples: React.FC = () => {
  const { theme } = useTheme()

  return (
    <div className="space-y-8">
      {/* Buttons */}
      <div className="space-y-4">
        <h3 className={cn(
          'text-xl font-semibold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Button Variants
        </h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            Primary Button
          </button>
          <button className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 transition-all duration-300 shadow-md hover:shadow-lg">
            Secondary Button
          </button>
          <button className="px-6 py-3 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-600 transition-all duration-300">
            Ghost Button
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <h3 className={cn(
          'text-xl font-semibold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Card Variants
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Base Card</h4>
            <p className="text-gray-600 dark:text-gray-400">Standard card with basic styling and hover effects.</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Elevated Card</h4>
            <p className="text-gray-600 dark:text-gray-400">Enhanced card with elevation and transform animations.</p>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
            <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Gradient Card</h4>
            <p className="text-gray-600 dark:text-gray-400">Premium card with gradient background styling.</p>
          </div>
        </div>
      </div>

      {/* Form Elements */}
      <div className="space-y-4">
        <h3 className={cn(
          'text-xl font-semibold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Form Elements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all duration-300"
            />
            <textarea
              placeholder="Your message"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all duration-300 resize-none"
            />
          </div>
          <div className="space-y-4">
            <select className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:border-blue-500 transition-all duration-300">
              <option>Choose an option</option>
              <option>Option 1</option>
              <option>Option 2</option>
              <option>Option 3</option>
            </select>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="example-checkbox"
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="example-checkbox" className={cn(
                'text-sm font-medium',
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              )}>
                I agree to the terms and conditions
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="space-y-4">
        <h3 className={cn(
          'text-xl font-semibold',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Badge Variants
        </h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            Primary
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
            Success
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
            Warning
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
            Error
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            Info
          </span>
        </div>
      </div>
    </div>
  )
}

// Spacing System Showcase
const SpacingShowcase: React.FC = () => {
  const { theme } = useTheme()

  const spacingExamples = [
    { key: '1', value: '0.25rem', label: '4px' },
    { key: '2', value: '0.5rem', label: '8px' },
    { key: '4', value: '1rem', label: '16px' },
    { key: '6', value: '1.5rem', label: '24px' },
    { key: '8', value: '2rem', label: '32px' },
    { key: '12', value: '3rem', label: '48px' },
    { key: '16', value: '4rem', label: '64px' },
    { key: '20', value: '5rem', label: '80px' },
    { key: '24', value: '6rem', label: '96px' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className={cn(
          'text-xl font-semibold mb-6',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Spacing Scale
        </h3>
        <div className="space-y-4">
          {spacingExamples.map((spacing) => (
            <div key={spacing.key} className="flex items-center gap-6">
              <div className="w-16 text-sm font-mono text-gray-500">
                {spacing.key}
              </div>
              <div className="w-20 text-sm font-mono text-gray-500">
                {spacing.value}
              </div>
              <div className="w-16 text-sm text-gray-500">
                {spacing.label}
              </div>
              <div
                className="bg-blue-500 h-6 rounded"
                style={{ width: spacing.value }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Elevation System Showcase
const ElevationShowcase: React.FC = () => {
  const { theme } = useTheme()

  const elevationLevels = [
    { level: '0', shadow: 'shadow-none', name: 'None' },
    { level: '1', shadow: 'shadow-sm', name: 'Small' },
    { level: '2', shadow: 'shadow', name: 'Base' },
    { level: '3', shadow: 'shadow-md', name: 'Medium' },
    { level: '4', shadow: 'shadow-lg', name: 'Large' },
    { level: '5', shadow: 'shadow-xl', name: 'Extra Large' },
    { level: '6', shadow: 'shadow-2xl', name: '2X Large' }
  ]

  return (
    <div className="space-y-8">
      <div>
        <h3 className={cn(
          'text-xl font-semibold mb-6',
          theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
        )}>
          Elevation System
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {elevationLevels.map((elevation) => (
            <div
              key={elevation.level}
              className={cn(
                'p-6 rounded-xl text-center',
                elevation.shadow,
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              )}
            >
              <div className={cn(
                'text-lg font-semibold mb-2',
                theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
              )}>
                Level {elevation.level}
              </div>
              <div className={cn(
                'text-sm',
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              )}>
                {elevation.name}
              </div>
              <div className="text-xs font-mono text-blue-500 mt-2">
                {elevation.shadow}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Design System Showcase Component
export const DesignSystemShowcase: React.FC<DesignSystemShowcaseProps> = ({
  className = '',
  defaultSection = 'overview'
}) => {
  const { theme } = useTheme()
  const { t } = useI18n()
  const [activeSection, setActiveSection] = useState<DesignSystemSection>(defaultSection)

  const sections = [
    { key: 'overview', label: 'Overview', icon: EyeIcon },
    { key: 'colors', label: 'Colors', icon: SwatchIcon },
    { key: 'typography', label: 'Typography', icon: DocumentTextIcon },
    { key: 'components', label: 'Components', icon: CpuChipIcon },
    { key: 'spacing', label: 'Spacing', icon: AdjustmentsHorizontalIcon },
    { key: 'elevation', label: 'Elevation', icon: SparklesIcon },
    { key: 'usage', label: 'Usage Guide', icon: CodeBracketIcon }
  ] as const

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-12">
            <div className="text-center space-y-6">
              <Display size="4xl" gradient className="mb-4">
                CODAI Design System
              </Display>
              <Body size="xl" color="secondary" className="max-w-4xl mx-auto">
                A comprehensive design system built for the future of AI development.
                Every component, color, and interaction is carefully crafted to ensure
                consistency, accessibility, and exceptional user experience.
              </Body>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.slice(1, -1).map((section) => (
                <motion.button
                  key={section.key}
                  onClick={() => setActiveSection(section.key as DesignSystemSection)}
                  className={cn(
                    'p-6 rounded-2xl border text-left transition-all duration-300',
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  )}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <section.icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className={cn(
                    'text-lg font-semibold mb-2',
                    theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                  )}>
                    {section.label}
                  </h3>
                  <p className={cn(
                    'text-sm',
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  )}>
                    Explore our {section.label.toLowerCase()} system
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 'colors':
        return (
          <div className="space-y-8">
            <CODAIColorPalette />
            <GradientGenerator />
          </div>
        )

      case 'typography':
        return <FontManager />

      case 'components':
        return <ComponentExamples />

      case 'spacing':
        return <SpacingShowcase />

      case 'elevation':
        return <ElevationShowcase />

      case 'usage':
        return (
          <div className="space-y-8">
            <div>
              <H2 className="mb-6">Usage Guidelines</H2>
              <div className="space-y-6">
                <div className={cn(
                  'p-6 rounded-xl border',
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                )}>
                  <H3 className="mb-4">Getting Started</H3>
                  <div className="space-y-4">
                    <P>Install the required dependencies:</P>
                    <pre className={cn(
                      'p-4 rounded-lg text-sm font-mono',
                      theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                    )}>
                      {`npm install framer-motion @heroicons/react clsx tailwind-merge`}
                    </pre>
                  </div>
                </div>

                <div className={cn(
                  'p-6 rounded-xl border',
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                )}>
                  <H3 className="mb-4">Component Usage</H3>
                  <div className="space-y-4">
                    <P>Import and use components:</P>
                    <pre className={cn(
                      'p-4 rounded-lg text-sm font-mono overflow-x-auto',
                      theme === 'dark' ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'
                    )}>
                      {`import { Display, Heading, Body } from '@/components/ui/Typography'
import { useTheme } from '@/contexts/ThemeContext'

export default function MyComponent() {
  const { theme } = useTheme()
  
  return (
    <div>
      <Display size="4xl" gradient>
        Welcome to CODAI
      </Display>
      <Heading size="2xl" color="secondary">
        The Future of AI Development
      </Heading>
      <Body size="lg" color="tertiary">
        Experience next-generation artificial intelligence.
      </Body>
    </div>
  )
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return <div>Section not found</div>
    }
  }

  return (
    <section className={cn('py-20', className)}>
      <div className="container mx-auto px-6">
        {/* Navigation */}
        <div className="flex justify-center mb-12">
          <div className={cn(
            'inline-flex p-1 rounded-2xl border',
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
          )}>
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key as DesignSystemSection)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300',
                  activeSection === section.key
                    ? 'bg-blue-600 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-gray-100 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                )}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderSectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default DesignSystemShowcase