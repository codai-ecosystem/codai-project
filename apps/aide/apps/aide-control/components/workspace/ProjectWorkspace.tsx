'use client'

import React from 'react'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderIcon,
  FolderOpenIcon,
  DocumentIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  CodeBracketIcon,
  PlayIcon,
  StopIcon,
  CloudArrowUpIcon,
  CogIcon,
  BugAntIcon,
  CommandLineIcon,
  CodeBracketSquareIcon as GitBranchIcon,
  EyeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { Project, ProjectFile, ActivityEvent, Comment, SessionParticipant } from '../../lib/types/enhanced-types'

interface ProjectWorkspaceProps {
  project: Project
  onProjectUpdate?: (project: Project) => void
}

export function ProjectWorkspace({ project, onProjectUpdate }: ProjectWorkspaceProps) {
  const [activeFile, setActiveFile] = useState<string>('')
  const [openFiles, setOpenFiles] = useState<string[]>([])
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']))
  const [sidebarPanel, setSidebarPanel] = useState<'files' | 'search' | 'git' | 'debug' | 'extensions'>('files')
  const [bottomPanel, setBottomPanel] = useState<'terminal' | 'output' | 'debug' | 'problems' | null>('terminal')
  const [liveUsers, setLiveUsers] = useState<SessionParticipant[]>([])
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([])
  const [fileComments, setFileComments] = useState<Record<string, Comment[]>>({})

  const editorRef = useRef<HTMLDivElement>(null)

  // Mock project structure
  const mockProjectStructure: ProjectFile[] = [
    { path: '/', type: 'directory' },
    { path: '/src', type: 'directory' },
    { path: '/src/components', type: 'directory' },
    { path: '/src/components/Button.tsx', type: 'file', content: 'export function Button() { return <button>Click me</button> }' },
    { path: '/src/components/Modal.tsx', type: 'file', content: 'export function Modal() { return <div>Modal</div> }' },
    { path: '/src/pages', type: 'directory' },
    { path: '/src/pages/index.tsx', type: 'file', content: 'export default function Home() { return <h1>Home</h1> }' },
    { path: '/src/utils', type: 'directory' },
    { path: '/src/utils/api.ts', type: 'file', content: 'export const API_BASE = "https://api.example.com"' },
    { path: '/public', type: 'directory' },
    { path: '/public/favicon.ico', type: 'file' },
    { path: '/package.json', type: 'file', content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}' },
    { path: '/README.md', type: 'file', content: '# My Project\n\nThis is my amazing project.' },
    { path: '/.gitignore', type: 'file', content: 'node_modules\n.env.local\n.next' },
  ]

  // Mock live users
  useEffect(() => {
    setLiveUsers([
      {
        userId: '1',
        user: { id: '1', name: 'John Doe', email: 'john@example.com', status: 'online' },
        cursor: { file: '/src/components/Button.tsx', line: 1, column: 20 },
        isTyping: false,
        lastSeen: new Date()
      },
      {
        userId: '2',
        user: { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'online' },
        cursor: { file: '/src/pages/index.tsx', line: 1, column: 35 },
        isTyping: true,
        lastSeen: new Date()
      }
    ])
  }, [])

  const openFile = (filePath: string) => {
    if (!openFiles.includes(filePath)) {
      setOpenFiles(prev => [...prev, filePath])
    }
    setActiveFile(filePath)
  }

  const closeFile = (filePath: string) => {
    const newOpenFiles = openFiles.filter(f => f !== filePath)
    setOpenFiles(newOpenFiles)

    if (activeFile === filePath) {
      setActiveFile(newOpenFiles[newOpenFiles.length - 1] || '')
    }
  }

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const getFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'jsx':
      case 'ts':
      case 'js':
        return <CodeBracketIcon className="w-4 h-4 text-blue-500" />
      case 'json':
        return <DocumentIcon className="w-4 h-4 text-yellow-500" />
      case 'md':
        return <DocumentIcon className="w-4 h-4 text-gray-500" />
      case 'css':
        return <DocumentIcon className="w-4 h-4 text-purple-500" />
      default:
        return <DocumentIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const renderFileTree = (files: ProjectFile[], parentPath: string = '') => {
    const currentLevelFiles = files.filter(file => {
      const dir = file.path.substring(0, file.path.lastIndexOf('/')) || '/'
      return dir === parentPath
    })

    const directories = currentLevelFiles.filter(f => f.type === 'directory')
    const regularFiles = currentLevelFiles.filter(f => f.type === 'file')

    return (
      <>
        {directories.map(dir => (
          <div key={dir.path}>
            <div
              className="flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
              onClick={() => toggleFolder(dir.path)}
            >
              {expandedFolders.has(dir.path) ? (
                <ChevronDownIcon className="w-4 h-4 text-gray-400 mr-1" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 text-gray-400 mr-1" />
              )}
              {expandedFolders.has(dir.path) ? (
                <FolderOpenIcon className="w-4 h-4 text-blue-500 mr-2" />
              ) : (
                <FolderIcon className="w-4 h-4 text-blue-500 mr-2" />
              )}
              <span className="text-gray-700 dark:text-gray-300">{dir.path.split('/').pop()}</span>
            </div>
            {expandedFolders.has(dir.path) && (
              <div className="ml-4">
                {renderFileTree(files, dir.path)}
              </div>
            )}
          </div>
        ))}
        {regularFiles.map(file => (
          <div
            key={file.path}
            className={`flex items-center px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm ${activeFile === file.path ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : ''
              }`}
            onClick={() => openFile(file.path)}
          >
            <div className="w-5 mr-1" />
            {getFileIcon(file.path)}
            <span className="ml-2 text-gray-700 dark:text-gray-300">{file.path.split('/').pop()}</span>
            {openFiles.includes(file.path) && (
              <div className="w-2 h-2 bg-orange-400 rounded-full ml-auto" />
            )}
          </div>
        ))}
      </>
    )
  }

  const sidebarPanels = {
    files: (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Explorer</h3>
        </div>
        <div className="space-y-1">
          {renderFileTree(mockProjectStructure)}
        </div>
      </div>
    ),
    search: (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Search</h3>
        </div>
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            No results found
          </div>
        </div>
      </div>
    ),
    git: (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Source Control</h3>
        </div>
        <div className="space-y-3">
          <div className="text-sm">
            <div className="flex items-center space-x-2 mb-2">
              <GitBranchIcon className="w-4 h-4 text-green-500" />
              <span className="text-gray-700 dark:text-gray-300">main</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              3 changes, 1 untracked
            </div>
          </div>
        </div>
      </div>
    ),
    debug: (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Debug</h3>
        </div>
        <div className="space-y-3">
          <button className="w-full flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm">
            <PlayIcon className="w-4 h-4" />
            <span>Start Debugging</span>
          </button>
        </div>
      </div>
    ),
    extensions: (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">Extensions</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          No extensions installed
        </div>
      </div>
    )
  }

  const bottomPanels = {
    terminal: (
      <div className="bg-black text-green-400 font-mono text-sm p-4 h-full">
        <div className="mb-2">$ npm run dev</div>
        <div className="text-yellow-400">Local:    http://localhost:3000</div>
        <div className="text-yellow-400">Network:  http://192.168.1.100:3000</div>
        <div className="mt-2">ready - started server on 0.0.0.0:3000</div>
        <div className="text-cyan-400 mt-1">_</div>
      </div>
    ),
    output: (
      <div className="p-4 h-full overflow-y-auto">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Build output will appear here...
        </div>
      </div>
    ),
    debug: (
      <div className="p-4 h-full">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Debug console output...
        </div>
      </div>
    ),
    problems: (
      <div className="p-4 h-full">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          No problems detected
        </div>
      </div>
    )
  }

  const activeFileContent = mockProjectStructure.find(f => f.path === activeFile)?.content || ''

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Top toolbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{project.name}</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded">
              {project.status}
            </span>
          </div>

          {/* Live collaborators */}
          <div className="flex items-center space-x-2">
            {liveUsers.slice(0, 3).map(user => (
              <div
                key={user.userId}
                className="relative w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium"
                title={user.user.name}
              >
                {user.user.name[0]}
                {user.isTyping && (
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
            {liveUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-400 text-xs">
                +{liveUsers.length - 3}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded flex items-center space-x-1">
            <PlayIcon className="w-4 h-4" />
            <span>Run</span>
          </button>
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded flex items-center space-x-1">
            <CloudArrowUpIcon className="w-4 h-4" />
            <span>Deploy</span>
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <CogIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex">
          <div className="w-12 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-2 space-y-2">
            {[
              { id: 'files', icon: FolderIcon, tooltip: 'Explorer' },
              { id: 'search', icon: MagnifyingGlassIcon, tooltip: 'Search' },
              { id: 'git', icon: GitBranchIcon, tooltip: 'Source Control' },
              { id: 'debug', icon: BugAntIcon, tooltip: 'Debug' },
            ].map(({ id, icon: Icon, tooltip }) => (
              <button
                key={id}
                onClick={() => setSidebarPanel(id as any)}
                className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${sidebarPanel === id ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                  }`}
                title={tooltip}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {sidebarPanels[sidebarPanel]}
          </div>
        </div>

        {/* Main editor area */}
        <div className="flex-1 flex flex-col">
          {/* Tab bar */}
          {openFiles.length > 0 && (
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center overflow-x-auto">
              {openFiles.map(filePath => (
                <div
                  key={filePath}
                  className={`flex items-center px-3 py-2 border-r border-gray-200 dark:border-gray-700 cursor-pointer min-w-0 ${activeFile === filePath
                      ? 'bg-gray-50 dark:bg-gray-900 border-b-2 border-blue-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  onClick={() => setActiveFile(filePath)}
                >
                  {getFileIcon(filePath)}
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {filePath.split('/').pop()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      closeFile(filePath)
                    }}
                    className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 bg-white dark:bg-gray-900 overflow-hidden">
            {activeFile ? (
              <div className="h-full flex">
                <div className="flex-1 font-mono text-sm p-4">
                  <pre className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {activeFileContent}
                  </pre>
                </div>

                {/* Comments sidebar */}
                <div className="w-80 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    Comments & Chat
                  </h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    No comments on this file
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <DocumentIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a file to start editing</p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom panel */}
          {bottomPanel && (
            <div className="h-64 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
                {Object.keys(bottomPanels).map(panel => (
                  <button
                    key={panel}
                    onClick={() => setBottomPanel(panel as any)}
                    className={`px-4 py-2 text-sm border-r border-gray-200 dark:border-gray-700 ${bottomPanel === panel
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                  >
                    {panel.charAt(0).toUpperCase() + panel.slice(1)}
                  </button>
                ))}
                <button
                  onClick={() => setBottomPanel(null)}
                  className="ml-auto p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="h-full">
                {bottomPanels[bottomPanel]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

