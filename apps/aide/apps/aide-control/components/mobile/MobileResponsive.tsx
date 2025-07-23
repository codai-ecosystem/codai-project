'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  MoonIcon,
  SunIcon,
  SwatchIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MobilePreviewProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveDesignProps {
  currentBreakpoint?: 'mobile' | 'tablet' | 'desktop'
  onBreakpointChange?: (breakpoint: 'mobile' | 'tablet' | 'desktop') => void
}

interface AccessibilityIssue {
  id: string
  level: 'error' | 'warning' | 'info'
  message: string
  element?: string
  suggestion: string
}

export function MobilePreview({ children, className = '' }: MobilePreviewProps) {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [device, setDevice] = useState<'iphone' | 'android' | 'tablet'>('iphone')

  const deviceDimensions = {
    iphone: { width: 375, height: 812 },
    android: { width: 360, height: 800 },
    tablet: { width: 768, height: 1024 }
  }

  const currentDimensions = deviceDimensions[device]
  const width = orientation === 'portrait' ? currentDimensions.width : currentDimensions.height
  const height = orientation === 'portrait' ? currentDimensions.height : currentDimensions.width

  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setDevice('iphone')}
            className={`px-3 py-1 rounded text-sm ${device === 'iphone'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            iPhone
          </button>
          <button
            onClick={() => setDevice('android')}
            className={`px-3 py-1 rounded text-sm ${device === 'android'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            Android
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1 rounded text-sm ${device === 'tablet'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
          >
            Tablet
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {width} × {height}
          </span>
          <button
            onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
            className="p-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <AdjustmentsHorizontalIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Device Frame */}
      <div className="flex justify-center">
        <div
          className="bg-black rounded-xl p-2 shadow-2xl"
          style={{
            width: width + 20,
            height: height + 20
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg overflow-hidden relative"
            style={{ width, height }}
          >
            {/* Status bar */}
            <div className="bg-gray-900 text-white text-xs px-4 py-1 flex justify-between items-center">
              <span>9:41</span>
              <span>●●●●●</span>
              <span>100%</span>
            </div>

            {/* Content */}
            <div className="h-full overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ResponsiveDesignTools({ currentBreakpoint = 'desktop', onBreakpointChange }: ResponsiveDesignProps) {
  const [darkMode, setDarkMode] = useState(false)
  const [colorTheme, setColorTheme] = useState('blue')
  const [accessibilityIssues, setAccessibilityIssues] = useState<AccessibilityIssue[]>([])
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)

  const breakpoints = [
    { id: 'mobile', name: 'Mobile', icon: DevicePhoneMobileIcon, width: '375px' },
    { id: 'tablet', name: 'Tablet', icon: DeviceTabletIcon, width: '768px' },
    { id: 'desktop', name: 'Desktop', icon: ComputerDesktopIcon, width: '1200px' }
  ]

  const colorThemes = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'red', name: 'Red', color: 'bg-red-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' }
  ]

  useEffect(() => {
    // Mock accessibility check
    const mockIssues: AccessibilityIssue[] = [
      {
        id: '1',
        level: 'error',
        message: 'Missing alt text for images',
        element: 'img[src="..."]',
        suggestion: 'Add descriptive alt text to all images for screen readers'
      },
      {
        id: '2',
        level: 'warning',
        message: 'Low color contrast ratio',
        element: '.text-gray-400',
        suggestion: 'Increase contrast ratio to at least 4.5:1 for normal text'
      },
      {
        id: '3',
        level: 'info',
        message: 'Consider adding ARIA labels',
        element: 'button',
        suggestion: 'Add aria-label for buttons with only icons'
      }
    ]

    setAccessibilityIssues(mockIssues)
  }, [])

  const getIssueIcon = (level: AccessibilityIssue['level']) => {
    switch (level) {
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500" />
      case 'info':
        return <InformationCircleIcon className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <EyeIcon className="w-5 h-5" />
          <span>Responsive Design Tools</span>
        </h3>
      </div>

      <div className="p-4 space-y-6">
        {/* Breakpoint Controls */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Viewport Size
          </h4>
          <div className="flex space-x-2">
            {breakpoints.map(breakpoint => {
              const Icon = breakpoint.icon
              return (
                <button
                  key={breakpoint.id}
                  onClick={() => onBreakpointChange?.(breakpoint.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${currentBreakpoint === breakpoint.id
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-200 dark:border-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{breakpoint.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {breakpoint.width}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Theme Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Theme
            </h4>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${darkMode
                    ? 'bg-gray-800 text-white border border-gray-600'
                    : 'bg-gray-100 text-gray-900 border border-gray-300'
                  }`}
              >
                {darkMode ? (
                  <MoonIcon className="w-4 h-4" />
                ) : (
                  <SunIcon className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {darkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Color Theme
            </h4>
            <div className="flex space-x-2">
              {colorThemes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setColorTheme(theme.id)}
                  className={`w-8 h-8 rounded-full ${theme.color} ${colorTheme === theme.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                  title={theme.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Accessibility Panel */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Accessibility Check
            </h4>
            <button
              onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
              className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm"
            >
              <CheckCircleIcon className="w-4 h-4" />
              <span>{accessibilityIssues.filter(i => i.level === 'error').length} errors</span>
              <span>{accessibilityIssues.filter(i => i.level === 'warning').length} warnings</span>
            </button>
          </div>

          <AnimatePresence>
            {showAccessibilityPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {accessibilityIssues.map(issue => (
                  <div
                    key={issue.id}
                    className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    {getIssueIcon(issue.level)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {issue.message}
                      </p>
                      {issue.element && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Element: <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                            {issue.element}
                          </code>
                        </p>
                      )}
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        {issue.suggestion}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
            <SwatchIcon className="w-4 h-4" />
            <span>Export Theme</span>
          </button>

          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              Reset
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Responsive wrapper component
export function ResponsiveWrapper({ children, breakpoint }: { children: React.ReactNode; breakpoint: string }) {
  const getBreakpointStyles = (bp: string) => {
    switch (bp) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-3xl mx-auto'
      case 'desktop':
        return 'max-w-7xl mx-auto'
      default:
        return ''
    }
  }

  return (
    <div className={`transition-all duration-300 ${getBreakpointStyles(breakpoint)}`}>
      {children}
    </div>
  )
}
