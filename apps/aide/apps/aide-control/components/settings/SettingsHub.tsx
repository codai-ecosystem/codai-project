'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CogIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  PuzzlePieceIcon,
  CodeBracketIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { SettingsSection, SettingsLevel, SettingsRegistry } from '../../lib/types/enhanced-types'

// Settings sections configuration
const settingsSections: SettingsSection[] = [
  {
    id: 'general',
    name: 'General',
    icon: CogIcon,
    description: 'Basic platform settings and preferences',
    component: GeneralSettings,
    requiredPermissions: ['settings.read'],
    subSections: [
      {
        id: 'profile',
        name: 'Profile & Account',
        component: ProfileSettings,
        requiredPermissions: ['settings.profile.edit']
      },
      {
        id: 'preferences',
        name: 'User Preferences',
        component: PreferenceSettings,
        requiredPermissions: ['settings.read']
      }
    ]
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    icon: ShieldCheckIcon,
    description: 'Authentication, access control, and privacy settings',
    component: SecuritySettings,
    requiredPermissions: ['settings.security.read'],
    subSections: [
      {
        id: 'authentication',
        name: 'Authentication',
        component: AuthenticationSettings,
        requiredPermissions: ['settings.security.auth']
      },
      {
        id: 'permissions',
        name: 'Permissions & RBAC',
        component: PermissionsSettings,
        requiredPermissions: ['settings.security.permissions']
      },
      {
        id: 'audit',
        name: 'Audit Logs',
        component: AuditSettings,
        requiredPermissions: ['settings.security.audit']
      }
    ]
  },
  {
    id: 'api-keys',
    name: 'API Keys & Tokens',
    icon: KeyIcon,
    description: 'Manage API keys, tokens, and service credentials',
    component: APIKeysSettings,
    requiredPermissions: ['settings.api.read']
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: BellIcon,
    description: 'Configure notification preferences and channels',
    component: NotificationSettings,
    requiredPermissions: ['settings.notifications.read']
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: PuzzlePieceIcon,
    description: 'Third-party integrations and webhooks',
    component: IntegrationsSettings,
    requiredPermissions: ['settings.integrations.read']
  },
  {
    id: 'environments',
    name: 'Environments',
    icon: GlobeAltIcon,
    description: 'Development, staging, and production environments',
    component: EnvironmentSettings,
    requiredPermissions: ['settings.environments.read']
  },
  {
    id: 'analytics',
    name: 'Analytics & Monitoring',
    icon: ChartBarIcon,
    description: 'Analytics configuration and monitoring settings',
    component: AnalyticsSettings,
    requiredPermissions: ['settings.analytics.read']
  },
  {
    id: 'deployment',
    name: 'Deployment & CI/CD',
    icon: CloudArrowUpIcon,
    description: 'Continuous integration and deployment settings',
    component: DeploymentSettings,
    requiredPermissions: ['settings.deployment.read']
  }
]

interface SettingsHubProps {
  level: SettingsLevel
  onClose?: () => void
}

export function SettingsHub({ level, onClose }: SettingsHubProps) {
  const [activeSection, setActiveSection] = useState<string>('general')
  const [activeSubSection, setActiveSubSection] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [userPermissions, setUserPermissions] = useState<string[]>([
    'settings.read',
    'settings.profile.edit',
    'settings.security.read',
    'settings.api.read',
    'settings.notifications.read',
    'settings.integrations.read',
    'settings.environments.read',
    'settings.analytics.read',
    'settings.deployment.read'
  ])

  const registry = new SettingsRegistry()
  
  // Initialize settings sections
  useEffect(() => {
    settingsSections.forEach(section => {
      registry.registerSection(section)
    })
  }, [registry])

  const availableSections = settingsSections.filter(section =>
    section.requiredPermissions.every(perm => userPermissions.includes(perm))
  )

  const filteredSections = availableSections.filter(section =>
    searchQuery === '' || 
    section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const currentSection = availableSections.find(s => s.id === activeSection)
  const currentSubSection = currentSection?.subSections?.find(s => s.id === activeSubSection)

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden"
      >
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Level indicator */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <div className={`w-2 h-2 rounded-full ${
                level.level === 'global' ? 'bg-purple-500' :
                level.level === 'organization' ? 'bg-blue-500' :
                level.level === 'project' ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
              <span className="capitalize">{level.level} Settings</span>
              <span>•</span>
              <span>{level.name}</span>
            </div>

            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            {filteredSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => {
                    setActiveSection(section.id)
                    setActiveSubSection('')
                  }}
                  className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    activeSection === section.id 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-r-2 border-indigo-500' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <div className="flex-1">
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {section.description}
                    </div>
                  </div>
                  {section.subSections && section.subSections.length > 0 && (
                    <ChevronRightIcon className={`w-4 h-4 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  )}
                </button>

                {/* Sub-sections */}
                {activeSection === section.id && section.subSections && (
                  <div className="bg-gray-100 dark:bg-gray-700">
                    {section.subSections
                      .filter(subSection =>
                        subSection.requiredPermissions.every(perm => userPermissions.includes(perm))
                      )
                      .map((subSection) => (
                        <button
                          key={subSection.id}
                          onClick={() => setActiveSubSection(subSection.id)}
                          className={`w-full flex items-center space-x-3 px-12 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                            activeSubSection === subSection.id 
                              ? 'bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300' 
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          <div className="text-sm">{subSection.name}</div>
                        </button>
                      ))
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSection}-${activeSubSection}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-y-auto"
            >
              {currentSubSection ? (
                <currentSubSection.component level={level} />
              ) : currentSection ? (
                <currentSection.component level={level} />
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// Placeholder components for settings sections
function GeneralSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <div className="max-w-3xl">
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          General Settings
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Basic platform settings and preferences for {level.name}
        </p>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Platform Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Platform Name
                </label>
                <input
                  type="text"
                  defaultValue="AIDE Platform"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Language
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-900">
                  <option>English</option>
                  <option>Romanian</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProfileSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Profile & Account Settings
      </h3>
      {/* Profile settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Profile settings implementation goes here...
      </div>
    </div>
  )
}

function PreferenceSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        User Preferences
      </h3>
      {/* Preference settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        User preferences implementation goes here...
      </div>
    </div>
  )
}

function SecuritySettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Security & Privacy Settings
      </h3>
      {/* Security settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Security settings implementation goes here...
      </div>
    </div>
  )
}

function AuthenticationSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Authentication Settings
      </h3>
      {/* Authentication settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Authentication settings implementation goes here...
      </div>
    </div>
  )
}

function PermissionsSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Permissions & RBAC
      </h3>
      {/* Permissions settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Permissions settings implementation goes here...
      </div>
    </div>
  )
}

function AuditSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Audit Logs
      </h3>
      {/* Audit settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Audit logs implementation goes here...
      </div>
    </div>
  )
}

function APIKeysSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        API Keys & Tokens
      </h3>
      {/* API keys settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        API keys settings implementation goes here...
      </div>
    </div>
  )
}

function NotificationSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Notification Settings
      </h3>
      {/* Notification settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Notification settings implementation goes here...
      </div>
    </div>
  )
}

function IntegrationsSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Integrations Settings
      </h3>
      {/* Integrations settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Integrations settings implementation goes here...
      </div>
    </div>
  )
}

function EnvironmentSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Environment Settings
      </h3>
      {/* Environment settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Environment settings implementation goes here...
      </div>
    </div>
  )
}

function AnalyticsSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Analytics & Monitoring Settings
      </h3>
      {/* Analytics settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Analytics settings implementation goes here...
      </div>
    </div>
  )
}

function DeploymentSettings({ level }: { level: SettingsLevel }) {
  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
        Deployment & CI/CD Settings
      </h3>
      {/* Deployment settings content */}
      <div className="text-gray-600 dark:text-gray-400">
        Deployment settings implementation goes here...
      </div>
    </div>
  )
}
