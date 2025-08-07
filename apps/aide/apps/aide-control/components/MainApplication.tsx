'use client'

import React from 'react'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cog6ToothIcon,
  FolderIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellIcon,
  HomeIcon,
  CommandLineIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

import { EnhancedDashboard } from './enhanced/EnhancedDashboard'
import { SettingsHub } from './settings/SettingsHub'
import { ProjectWorkspace } from './workspace/ProjectWorkspace'
import { TeamCollaboration } from './collaboration/TeamCollaboration'
import { AnalyticsDashboard } from './analytics/AnalyticsDashboard'
import { CommunicationHub } from './communication/CommunicationHub'
import { Project, User, SettingsLevel } from '../lib/types/enhanced-types'

interface MainApplicationProps {
  user: User
  currentProjectId?: string
  currentTeamId?: string
}

type ViewMode = 'dashboard' | 'settings' | 'workspace' | 'team' | 'analytics' | 'communication'

export function MainApplication({ user, currentProjectId, currentTeamId }: MainApplicationProps) {
  const [activeView, setActiveView] = useState<ViewMode>('dashboard')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [notifications, setNotifications] = useState(0)

  // Mock current project
  useEffect(() => {
    if (currentProjectId) {
      const mockProject: Project = {
        id: currentProjectId,
        name: 'AIDE Enhanced Interface',
        description: 'Comprehensive enterprise interface enhancement project',
        template: {
          id: 'enterprise-web',
          name: 'Enterprise Web Application',
          description: 'Full-stack enterprise web application',
          category: 'web',
          technologies: [
            { id: 'react', name: 'React', version: '18.3.1', category: 'framework' },
            { id: 'nextjs', name: 'Next.js', version: '15.3.3', category: 'framework' },
            { id: 'typescript', name: 'TypeScript', version: '5.0.0', category: 'language' },
            { id: 'tailwind', name: 'Tailwind CSS', version: '3.0.0', category: 'framework' }
          ],
          structure: {
            directories: ['/src', '/components', '/pages', '/lib'],
            files: [
              { path: '/src/app.tsx', type: 'file' },
              { path: '/components/ui.tsx', type: 'file' }
            ],
            dependencies: {
              'react': '^18.3.1',
              'next': '^15.3.3',
              'typescript': '^5.0.0'
            }
          },
          workflows: [],
          integrations: [],
          settings: {}
        },
        status: 'active',
        visibility: 'internal',
        ownerId: user.id,
        collaborators: [
          {
            userId: user.id,
            user: user,
            role: 'owner',
            permissions: ['all'],
            addedAt: new Date(),
            lastActiveAt: new Date()
          }
        ],
        teams: currentTeamId ? [currentTeamId] : [],
        settings: {
          theme: 'dark',
          notifications: true,
          autoSave: true
        },
        environment: [
          {
            id: 'dev',
            name: 'Development',
            type: 'development',
            url: 'http://localhost:3000',
            variables: { NODE_ENV: 'development' },
            deployments: [],
            status: 'healthy'
          },
          {
            id: 'prod',
            name: 'Production',
            type: 'production',
            url: 'https://aide.codai.dev',
            variables: { NODE_ENV: 'production' },
            deployments: [],
            status: 'healthy'
          }
        ],
        integrations: [
          {
            id: 'github',
            name: 'GitHub',
            type: 'git',
            provider: 'github',
            configuration: { repo: 'codai-project/aide' },
            status: 'connected',
            lastSync: new Date()
          }
        ],
        repository: {
          provider: 'github',
          url: 'https://github.com/codai-project/aide',
          branch: 'main'
        },
        metrics: {
          commits: 247,
          pullRequests: 32,
          linesOfCode: 15420,
          codeQuality: { score: 87, issues: 12, coverage: 84 },
          buildTime: 120,
          deploymentTime: 45,
          deploymentFrequency: 18,
          activeUsers: 24,
          apiCalls: 1250000,
          errorRate: 0.02,
          uptime: 99.7,
          customMetrics: {}
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date(),
        lastActiveAt: new Date()
      }
      setCurrentProject(mockProject)
    }

    // Mock notifications count
    setNotifications(7)
  }, [currentProjectId, user])

  // Command palette shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (event.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      view: 'dashboard' as ViewMode,
      shortcut: '⌘D'
    },
    {
      id: 'workspace',
      name: 'Workspace',
      icon: FolderIcon,
      view: 'workspace' as ViewMode,
      shortcut: '⌘W',
      disabled: !currentProject
    },
    {
      id: 'team',
      name: 'Team',
      icon: UserGroupIcon,
      view: 'team' as ViewMode,
      shortcut: '⌘T',
      disabled: !currentTeamId
    },
    {
      id: 'analytics',
      name: 'Analytics',
      icon: ChartBarIcon,
      view: 'analytics' as ViewMode,
      shortcut: '⌘A'
    },
    {
      id: 'communication',
      name: 'Communications',
      icon: BellIcon,
      view: 'communication' as ViewMode,
      count: notifications,
      shortcut: '⌘N'
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: Cog6ToothIcon,
      view: 'settings' as ViewMode,
      shortcut: '⌘,'
    }
  ]

  const mockSettingsLevel: SettingsLevel = {
    id: 'user-settings',
    name: 'User Settings',
    level: 'user',
    permissions: ['settings_read', 'settings_write']
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <EnhancedDashboard userId={user.id} />
      case 'settings':
        return <SettingsHub level={mockSettingsLevel} />
      case 'workspace':
        return currentProject ? (
          <ProjectWorkspace project={currentProject} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No project selected</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Create New Project
              </button>
            </div>
          </div>
        )
      case 'team':
        return currentTeamId ? (
          <TeamCollaboration teamId={currentTeamId} currentUserId={user.id} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No team selected</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Join or Create Team
              </button>
            </div>
          </div>
        )
      case 'analytics':
        return (
          <AnalyticsDashboard
            projectId={currentProjectId}
            teamId={currentTeamId}
            timeframe="7d"
          />
        )
      case 'communication':
        return (
          <CommunicationHub
            userId={user.id}
            teamId={currentTeamId}
            projectId={currentProjectId}
          />
        )
      default:
        return <EnhancedDashboard userId={user.id} />
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">AIDE</h1>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <Squares2X2Icon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map(item => {
            const Icon = item.icon
            const isActive = activeView === item.view
            const isDisabled = item.disabled

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveView(item.view)}
                disabled={isDisabled}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                title={sidebarCollapsed ? `${item.name} (${item.shortcut})` : ''}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span>{item.name}</span>}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex items-center space-x-2">
                    {item.count && item.count > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-xs rounded-full">
                        {item.count}
                      </span>
                    )}
                    <kbd className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded border">
                      {item.shortcut}
                    </kbd>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        {!sidebarCollapsed && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user.email}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full ${user.status === 'online' ? 'bg-green-400' :
                  user.status === 'away' ? 'bg-yellow-400' :
                    user.status === 'busy' ? 'bg-red-400' : 'bg-gray-400'
                }`} />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentProject && (
                <div className="flex items-center space-x-2">
                  <FolderIcon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentProject.name}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${currentProject.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                      currentProject.status === 'deploying' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                    }`}>
                    {currentProject.status}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCommandPaletteOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>Search...</span>
                <kbd className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded">
                  ⌘K
                </kbd>
              </button>

              <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative">
                <BellIcon className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-96 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Type a command or search..."
                    className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-lg placeholder-gray-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <div className="p-2">
                  {navigationItems.map(item => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (!item.disabled) {
                            setActiveView(item.view)
                            setCommandPaletteOpen(false)
                          }
                        }}
                        disabled={item.disabled}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${item.disabled
                            ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <span>{item.name}</span>
                        </div>
                        <kbd className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                          {item.shortcut}
                        </kbd>
                      </button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

