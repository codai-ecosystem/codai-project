'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Plus,
  Settings,
  FolderTree,
  Terminal,
  Search,
  Bell,
  User,
  Menu,
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  GitBranch,
  Database,
  Globe,
  Shield,
  Zap,
  Code,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  ChevronRight,
  ChevronDown,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Maximize2,
  Minimize2,
  Copy,
  ExternalLink,
  Bot,
  Brain,
  Sparkles,
  Eye,
  TestTube,
  Gauge,
  BookOpen,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Users,
  Folder,
  File,
  MemoryStick,
  HardDrive,
  Wifi,
  Lock,
  Unlock,
  Cpu,
  Lightbulb
} from 'lucide-react'

import FileExplorer from './FileExplorer'
import CodeEditor from './CodeEditor'
import TerminalComponent from './TerminalComponent'

// Enhanced interfaces for AIDE transformation
interface Project {
  id: string
  name: string
  status: 'idle' | 'building' | 'testing' | 'deploying' | 'error' | 'success'
  path: string
  lastActivity: Date
  conversations: number
  notifications: number
  isExpanded?: boolean
  files?: FileNode[]
}

interface FileNode {
  id: string
  name: string
  type: 'file' | 'folder'
  path: string
  children?: FileNode[]
  isExpanded?: boolean
  language?: string
}

interface Conversation {
  id: string
  title: string
  projectId?: string
  messages: Message[]
  isActive: boolean
  lastActivity: Date
  isTyping?: boolean
}

interface Message {
  id: string
  type: 'user' | 'ai' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    taskId?: string
    status?: 'pending' | 'executing' | 'completed' | 'error'
    progress?: number
    files?: string[]
  }
}

interface StatusItem {
  id: string
  type: 'build' | 'test' | 'deploy' | 'task'
  status: 'running' | 'completed' | 'error' | 'pending'
  label: string
  progress?: number
  details?: string
}

interface EditorTab {
  id: string
  filename: string
  path: string
  content: string
  isModified: boolean
  language: string
  cursorPosition: { line: number; column: number }
}

interface Diagnostic {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

// Project Sidebar Component
const ProjectSidebar = ({
  projects,
  activeProject,
  onProjectSelect,
  onProjectCreate,
  isCollapsed,
  onToggleCollapse
}: {
  projects: Project[]
  activeProject: string | null
  onProjectSelect: (id: string) => void
  onProjectCreate: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects)
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId)
    } else {
      newExpanded.add(projectId)
    }
    setExpandedProjects(newExpanded)
  }

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'building': return 'bg-blue-500'
      case 'testing': return 'bg-yellow-500'
      case 'deploying': return 'bg-purple-500'
      case 'error': return 'bg-red-500'
      case 'success': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'building': return <Loader2 className="w-3 h-3 animate-spin" />
      case 'testing': return <Play className="w-3 h-3" />
      case 'deploying': return <Upload className="w-3 h-3" />
      case 'error': return <XCircle className="w-3 h-3" />
      case 'success': return <CheckCircle className="w-3 h-3" />
      default: return <Activity className="w-3 h-3" />
    }
  }

  if (isCollapsed) {
    return (
      <motion.div
        initial={{ width: 280 }}
        animate={{ width: 60 }}
        className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col"
      >
        <div className="p-4 border-b border-white/10">
          <button
            onClick={onToggleCollapse}
            className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Menu className="w-5 h-5 text-white mx-auto" />
          </button>
        </div>

        <div className="flex-1 p-2 space-y-2">
          {projects.map((project) => (
            <motion.button
              key={project.id}
              onClick={() => onProjectSelect(project.id)}
              className={`w-full p-3 rounded-lg transition-all duration-200 ${activeProject === project.id
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                }`}
              title={project.name}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />
                <span className="text-xs text-white truncate w-full">
                  {project.name.slice(0, 2).toUpperCase()}
                </span>
              </div>
            </motion.button>
          ))}

          <button
            onClick={onProjectCreate}
            className="w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-white mx-auto" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ width: 60 }}
      animate={{ width: 280 }}
      className="bg-black/20 backdrop-blur-xl border-r border-white/10 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold">Projects</h2>
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <button
          onClick={onProjectCreate}
          className="w-full p-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New Project</span>
        </button>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`rounded-lg transition-all duration-200 ${activeProject === project.id
                ? 'bg-blue-500/20 border border-blue-500/30'
                : 'bg-white/5 hover:bg-white/10 border border-transparent'
              }`}
          >
            {/* Project Header */}
            <button
              onClick={() => onProjectSelect(project.id)}
              className="w-full p-3 text-left"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleProject(project.id)
                    }}
                    className="p-1 rounded hover:bg-white/10 transition-colors"
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <FolderTree className="w-4 h-4 text-blue-400" />

                  <div>
                    <h3 className="font-medium text-white text-sm">{project.name}</h3>
                    <p className="text-xs text-gray-400">
                      {project.conversations} conversations
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {project.notifications > 0 && (
                    <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                      {project.notifications}
                    </span>
                  )}

                  <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`} />

                  <div className="text-gray-400">
                    {getStatusIcon(project.status)}
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Project Files */}
            <AnimatePresence>
              {expandedProjects.has(project.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-3"
                >
                  <div className="pl-8 space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-400 py-1">
                      <FileText className="w-3 h-3" />
                      <span>src/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 py-1 pl-4">
                      <Code className="w-3 h-3" />
                      <span>components/</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 py-1 pl-4">
                      <FileText className="w-3 h-3" />
                      <span>index.tsx</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-400">
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>

        <button className="w-full p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center space-x-2 text-gray-400">
          <Terminal className="w-4 h-4" />
          <span className="text-sm">Terminal</span>
        </button>
      </div>
    </motion.div>
  )
}

// Chat Interface Component
const ChatInterface = ({
  conversations,
  activeConversation,
  onSendMessage,
  onCreateConversation,
  onCloseConversation,
  onConversationSelect
}: {
  conversations: Conversation[]
  activeConversation: string | null
  onSendMessage: (message: string) => void
  onCreateConversation: () => void
  onCloseConversation: (id: string) => void
  onConversationSelect: (id: string) => void
}) => {
  const [message, setMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const activeConv = conversations.find(c => c.id === activeConversation)

  const handleSend = () => {
    if (!message.trim()) return
    onSendMessage(message)
    setMessage('')
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 2000) // Simulate AI typing
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-black/10 backdrop-blur-xl">
      {/* Chat Tabs */}
      <div className="border-b border-white/10 bg-black/20">
        <div className="flex items-center overflow-x-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${activeConversation === conv.id
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-transparent hover:bg-white/5'
                }`}
            >
              <button
                onClick={() => onConversationSelect(conv.id)}
                className="flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <span className="text-white text-sm font-medium whitespace-nowrap">
                  {conv.title}
                </span>
                {conv.isTyping && (
                  <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
                )}
              </button>

              <button
                onClick={() => onCloseConversation(conv.id)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          ))}

          <button
            onClick={onCreateConversation}
            className="flex items-center space-x-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeConv ? (
          <div className="space-y-4 max-w-4xl mx-auto">
            {activeConv.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${msg.type === 'user'
                      ? 'bg-blue-500/20 border border-blue-500/30'
                      : msg.type === 'ai'
                        ? 'bg-white/5 border border-white/10'
                        : 'bg-yellow-500/10 border border-yellow-500/20'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    {msg.type === 'user' ? (
                      <User className="w-5 h-5 text-blue-400 mt-0.5" />
                    ) : msg.type === 'ai' ? (
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full mt-0.5" />
                    ) : (
                      <Activity className="w-5 h-5 text-yellow-400 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{msg.content}</p>

                      {msg.metadata && (
                        <div className="mt-3 p-3 bg-black/20 rounded-lg border border-white/10">
                          {msg.metadata.status && (
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs text-gray-400">Status:</span>
                              <span className={`text-xs px-2 py-1 rounded ${msg.metadata.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                  msg.metadata.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                    msg.metadata.status === 'executing' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-yellow-500/20 text-yellow-400'
                                }`}>
                                {msg.metadata.status}
                              </span>
                            </div>
                          )}

                          {msg.metadata.progress !== undefined && (
                            <div className="mb-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-400">Progress</span>
                                <span className="text-white">{msg.metadata.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-700 rounded-full h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${msg.metadata.progress}%` }}
                                  className="bg-blue-400 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          )}

                          {msg.metadata.files && (
                            <div className="space-y-1">
                              <span className="text-xs text-gray-400">Files:</span>
                              {msg.metadata.files.map((file, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-xs">
                                  <FileText className="w-3 h-3 text-blue-400" />
                                  <span className="text-white">{file}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>

                        <div className="flex items-center space-x-1">
                          <button className="p-1 rounded hover:bg-white/10 transition-colors">
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                          <button className="p-1 rounded hover:bg-white/10 transition-colors">
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 max-w-[80%]">
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Welcome to AIDE</h3>
              <p className="text-gray-400 mb-6">Start a conversation to begin building with AI</p>
              <button
                onClick={onCreateConversation}
                className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-blue-400 transition-colors"
              >
                Start New Conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      {activeConv && (
        <div className="border-t border-white/10 p-4 bg-black/20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50"
                  rows={message.split('\n').length || 1}
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                />

                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-white/10 transition-colors">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1 rounded hover:bg-white/10 transition-colors">
                    <Smile className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-3 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-500/10 border border-blue-500/30 disabled:border-gray-500/20 rounded-lg text-blue-400 disabled:text-gray-500 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Status Bar Component
const StatusBar = ({ status }: { status: StatusItem[] }) => {
  return (
    <div className="h-8 bg-black/30 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 text-xs">
      <div className="flex items-center space-x-6">
        {status.map((item) => (
          <div key={item.id} className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${item.status === 'running' ? 'bg-blue-500 animate-pulse' :
                item.status === 'completed' ? 'bg-green-500' :
                  item.status === 'error' ? 'bg-red-500' :
                    'bg-gray-500'
              }`} />
            <span className="text-gray-300">{item.label}</span>
            {item.progress !== undefined && (
              <span className="text-gray-400">({item.progress}%)</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4 text-gray-400">
        <span>AIDE v2.0.0</span>
        <span>Connected</span>
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )
}

// Main AIDE Dashboard with Chat Interface
export default function AideDashboard() {
  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'E-commerce Platform',
      status: 'building',
      path: '/projects/ecommerce',
      lastActivity: new Date(),
      conversations: 3,
      notifications: 2
    },
    {
      id: '2',
      name: 'AI Chat Bot',
      status: 'success',
      path: '/projects/chatbot',
      lastActivity: new Date(Date.now() - 3600000),
      conversations: 5,
      notifications: 0
    },
    {
      id: '3',
      name: 'Dashboard Analytics',
      status: 'testing',
      path: '/projects/analytics',
      lastActivity: new Date(Date.now() - 7200000),
      conversations: 2,
      notifications: 1
    }
  ])

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'Build React Components',
      projectId: '1',
      isActive: true,
      lastActivity: new Date(),
      messages: [
        {
          id: '1',
          type: 'user',
          content: 'Create a user authentication component with login and signup forms',
          timestamp: new Date(Date.now() - 300000)
        },
        {
          id: '2',
          type: 'ai',
          content: "I'll create a comprehensive authentication component for you. This will include login and signup forms with proper validation, state management, and styling.",
          timestamp: new Date(Date.now() - 240000),
          metadata: {
            status: 'executing',
            progress: 75,
            files: ['src/components/Auth/LoginForm.tsx', 'src/components/Auth/SignupForm.tsx', 'src/hooks/useAuth.ts']
          }
        },
        {
          id: '3',
          type: 'system',
          content: 'Authentication components created successfully. Tests added and passing.',
          timestamp: new Date(Date.now() - 60000),
          metadata: {
            status: 'completed',
            files: ['src/components/Auth/LoginForm.tsx', 'src/components/Auth/SignupForm.tsx', 'src/hooks/useAuth.ts', 'src/__tests__/Auth.test.tsx']
          }
        }
      ]
    }
  ])

  const [activeProject, setActiveProject] = useState<string>('1')
  const [activeConversation, setActiveConversation] = useState<string>('1')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showChat, setShowChat] = useState(true)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)

  // Editor state
  const [editorTabs, setEditorTabs] = useState<EditorTab[]>([
    {
      id: '1',
      filename: 'AideDashboard.tsx',
      path: '/src/components/AideDashboard.tsx',
      content: `'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AideDashboard() {
  return (
    <div className="h-screen flex flex-col">
      <h1>Welcome to AIDE</h1>
      <p>AI-Driven Development Environment</p>
    </div>
  )
}`,
      isModified: false,
      language: 'tsx',
      cursorPosition: { line: 1, column: 1 }
    }
  ])

  const [activeTabId, setActiveTabId] = useState<string>('1')
  const [diagnostics] = useState<Diagnostic[]>([
    {
      line: 5,
      column: 10,
      message: 'Unused variable: useState',
      severity: 'warning'
    },
    {
      line: 12,
      column: 5,
      message: 'Missing return type annotation',
      severity: 'error'
    }
  ])

  const [statusItems] = useState<StatusItem[]>([
    {
      id: '1',
      type: 'build',
      status: 'running',
      label: 'Building',
      progress: 75
    },
    {
      id: '2',
      type: 'test',
      status: 'completed',
      label: 'Tests: 42/45 Passed'
    },
    {
      id: '3',
      type: 'deploy',
      status: 'pending',
      label: 'Deploy Ready'
    }
  ])

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }

    // Add user message immediately
    setConversations(prev => prev.map(conv =>
      conv.id === activeConversation
        ? { ...conv, messages: [...conv.messages, newMessage] }
        : conv
    ))

    try {
      // Get current conversation context
      const currentConv = conversations.find(c => c.id === activeConversation)
      const messages = currentConv ? [...currentConv.messages, newMessage] : [newMessage]

      // Prepare context
      const context = {
        projectPath: projects.find(p => p.id === activeProject)?.path || '/',
        openFiles: editorTabs.map(tab => tab.path),
        currentFile: editorTabs.find(tab => tab.id === activeTabId)?.path
      }

      // Call AI API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.map(msg => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          context
        })
      })

      if (response.ok) {
        const { message: aiMessage } = await response.json()

        const aiResponse: Message = {
          id: Date.now().toString(),
          type: 'ai',
          content: aiMessage.content,
          timestamp: new Date(),
          metadata: {
            status: 'completed',
            progress: 100
          }
        }

        setConversations(prev => prev.map(conv =>
          conv.id === activeConversation
            ? { ...conv, messages: [...conv.messages, aiResponse] }
            : conv
        ))
      } else {
        throw new Error('Failed to get AI response')
      }
    } catch (error) {
      console.error('AI chat error:', error)

      // Fallback error message
      const errorResponse: Message = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
        metadata: {
          status: 'error',
          progress: 0
        }
      }

      setConversations(prev => prev.map(conv =>
        conv.id === activeConversation
          ? { ...conv, messages: [...conv.messages, errorResponse] }
          : conv
      ))
    }
  }

  const handleCreateConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: `New Chat ${conversations.length + 1}`,
      projectId: activeProject,
      isActive: false,
      lastActivity: new Date(),
      messages: []
    }

    setConversations(prev => [...prev, newConv])
    setActiveConversation(newConv.id)
  }

  const handleCloseConversation = (id: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== id))
    if (activeConversation === id) {
      const remaining = conversations.filter(conv => conv.id !== id)
      setActiveConversation(remaining.length > 0 ? remaining[0].id : '')
    }
  }

  // Terminal handlers
  const handleToggleTerminal = () => {
    setIsTerminalOpen(!isTerminalOpen)
  }

  // File explorer handlers
  const handleFileSelect = (file: FileNode) => {
    // Check if tab already exists
    const existingTab = editorTabs.find(tab => tab.path === file.path)
    if (existingTab) {
      setActiveTabId(existingTab.id)
      return
    }

    // Create new tab
    const newTab: EditorTab = {
      id: Date.now().toString(),
      filename: file.name,
      path: file.path,
      content: `// ${file.name}\n// Auto-generated content for demonstration\n\nexport default function Component() {\n  return (\n    <div>\n      <h1>Hello from ${file.name}</h1>\n    </div>\n  )\n}`,
      isModified: false,
      language: file.name.endsWith('.tsx') ? 'tsx' :
        file.name.endsWith('.ts') ? 'typescript' :
          file.name.endsWith('.js') ? 'javascript' :
            file.name.endsWith('.jsx') ? 'jsx' :
              file.name.endsWith('.json') ? 'json' :
                file.name.endsWith('.css') ? 'css' :
                  file.name.endsWith('.md') ? 'markdown' : 'text',
      cursorPosition: { line: 1, column: 1 }
    }

    setEditorTabs(prev => [...prev, newTab])
    setActiveTabId(newTab.id)
  }

  const handleFileCreate = (path: string, type: 'file' | 'folder') => {
    console.log('Create', type, 'at', path)
  }

  const handleFileDelete = (path: string) => {
    console.log('Delete file at', path)
  }

  const handleFileRename = (oldPath: string, newPath: string) => {
    console.log('Rename file from', oldPath, 'to', newPath)
  }

  // Editor handlers
  const handleTabClose = (tabId: string) => {
    setEditorTabs(prev => prev.filter(tab => tab.id !== tabId))
    if (activeTabId === tabId) {
      const remaining = editorTabs.filter(tab => tab.id !== tabId)
      setActiveTabId(remaining.length > 0 ? remaining[0].id : '')
    }
  }

  const handleContentChange = (tabId: string, content: string) => {
    setEditorTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, content, isModified: true }
        : tab
    ))
  }

  const handleSave = (tabId: string) => {
    setEditorTabs(prev => prev.map(tab =>
      tab.id === tabId
        ? { ...tab, isModified: false }
        : tab
    ))
    console.log('Save file', tabId)
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project Sidebar */}
        <ProjectSidebar
          projects={projects}
          activeProject={activeProject}
          onProjectSelect={setActiveProject}
          onProjectCreate={() => console.log('Create project')}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <CodeEditor
            tabs={editorTabs}
            activeTabId={activeTabId}
            onTabSelect={setActiveTabId}
            onTabClose={handleTabClose}
            onContentChange={handleContentChange}
            onSave={handleSave}
            diagnostics={diagnostics}
          />

          {/* Chat Interface - Toggleable */}
          {showChat && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              exit={{ width: 0 }}
              className="border-l border-white/10"
            >
              <ChatInterface
                conversations={conversations}
                activeConversation={activeConversation}
                onSendMessage={handleSendMessage}
                onCreateConversation={handleCreateConversation}
                onCloseConversation={handleCloseConversation}
                onConversationSelect={setActiveConversation}
              />
            </motion.div>
          )}
        </div>

        {/* File Explorer */}
        <FileExplorer
          projectPath={projects.find(p => p.id === activeProject)?.path || '/'}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFileDelete={handleFileDelete}
          onFileRename={handleFileRename}
        />
      </div>

      {/* Terminal */}
      <TerminalComponent
        isVisible={isTerminalOpen}
        onToggle={handleToggleTerminal}
        projectPath={projects.find(p => p.id === activeProject)?.path || '/'}
      />

      {/* Enhanced Status Bar with Chat Toggle */}
      <div className="h-8 bg-black/30 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-6">
          {statusItems.map((item) => (
            <div key={item.id} className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${item.status === 'running' ? 'bg-blue-500 animate-pulse' :
                  item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'error' ? 'bg-red-500' :
                      'bg-gray-500'
                }`} />
              <span className="text-gray-300">{item.label}</span>
              {item.progress !== undefined && (
                <span className="text-gray-400">({item.progress}%)</span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center space-x-4 text-gray-400">
          <button
            onClick={() => setShowChat(!showChat)}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${showChat ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/10'
              }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chat</span>
          </button>

          <button
            onClick={handleToggleTerminal}
            className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${isTerminalOpen ? 'bg-green-500/20 text-green-400' : 'hover:bg-white/10'
              }`}
          >
            <Terminal className="w-3 h-3" />
            <span>Terminal</span>
          </button>

          <span>AIDE v2.0.0</span>
          <span>Connected</span>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
