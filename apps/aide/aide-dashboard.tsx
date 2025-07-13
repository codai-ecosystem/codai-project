'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import {
  Activity,
  Bot,
  Code,
  GitBranch,
  MessageSquare,
  Play,
  Settings,
  Terminal,
  Zap,
  Folder,
  File,
  ChevronDown,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react'
import io, { Socket } from 'socket.io-client'

interface Project {
  id: string
  name: string
  path: string
  type: 'web' | 'mobile' | 'api' | 'ml' | 'desktop'
  status: 'active' | 'building' | 'testing' | 'deploying' | 'done' | 'error'
  lastModified: string
  aiAgents: string[]
  gitBranch: string
  packageManager: 'npm' | 'pnpm' | 'yarn'
  framework: string
  buildCommand?: string
  testCommand?: string
  devCommand?: string
  port?: number
}

interface AIAgent {
  id: string
  name: string
  type: 'manager' | 'coder' | 'tester' | 'deployer' | 'analyzer' | 'debugger'
  status: 'idle' | 'working' | 'waiting' | 'error' | 'busy'
  currentTask?: string
  tasksCompleted: number
  projectId?: string
  lastUpdate: string
}

interface Task {
  id: string
  type: 'build' | 'test' | 'deploy' | 'analyze' | 'debug' | 'code'
  projectId: string
  agentId: string
  command: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  output?: string
  startTime?: string
  endTime?: string
}

interface FileSystemNode {
  name: string
  type: 'file' | 'directory'
  path: string
  size?: number
  lastModified: string
  children?: FileSystemNode[]
}

interface ConversationTab {
  id: string
  projectId: string
  title: string
  messages: ChatMessage[]
  isActive: boolean
}

interface ChatMessage {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  agentId?: string
}

export default function AIDEDashboard() {
  // State management
  const [projects, setProjects] = useState<Project[]>([])
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [fileTree, setFileTree] = useState<FileSystemNode[]>([])
  const [conversations, setConversations] = useState<ConversationTab[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  // WebSocket connection
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize connection and data
  useEffect(() => {
    initializeConnection()
    loadProjects()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const initializeConnection = () => {
    socketRef.current = io('http://localhost:4043')

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      console.log('🔌 Connected to AIDE Server')
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
      console.log('🔌 Disconnected from AIDE Server')
    })

    socketRef.current.on('projects', (data: Project[]) => {
      setProjects(data)
    })

    socketRef.current.on('agents', (data: AIAgent[]) => {
      setAgents(data)
    })

    socketRef.current.on('tasks', (data: Task[]) => {
      setTasks(data)
    })

    socketRef.current.on('task_update', (task: Task) => {
      setTasks(prev => prev.map(t => t.id === task.id ? task : t))
    })

    socketRef.current.on('agent_update', (agent: AIAgent) => {
      setAgents(prev => prev.map(a => a.id === agent.id ? agent : a))
    })

    socketRef.current.on('task_created', (task: Task) => {
      setTasks(prev => [...prev, task])
    })

    socketRef.current.on('error', (data: { message: string }) => {
      console.error('AIDE Server Error:', data.message)
    })
  }

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:4043/api/projects')
      const result = await response.json()

      if (result.success) {
        setProjects(result.data)
        if (result.data.length > 0 && !selectedProject) {
          selectProject(result.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectProject = async (project: Project) => {
    setSelectedProject(project)

    // Load file tree
    try {
      const response = await fetch(`http://localhost:4043/api/projects/${project.id}/files`)
      const result = await response.json()

      if (result.success) {
        setFileTree(result.data)
      }
    } catch (error) {
      console.error('Failed to load file tree:', error)
    }

    // Create or activate conversation tab
    const existingTab = conversations.find(tab => tab.projectId === project.id)
    if (existingTab) {
      setActiveConversation(existingTab.id)
    } else {
      const newTab: ConversationTab = {
        id: `conv-${project.id}-${Date.now()}`,
        projectId: project.id,
        title: project.name,
        messages: [
          {
            id: 'welcome',
            type: 'system',
            content: `🚀 Welcome to ${project.name}! I'm ready to help you with autonomous development. What would you like to work on?`,
            timestamp: new Date().toISOString()
          }
        ],
        isActive: true
      }

      setConversations(prev => [...prev, newTab])
      setActiveConversation(newTab.id)
    }
  }

  const executeCommand = (command: string, agentType: string = 'coder') => {
    if (!selectedProject || !socketRef.current) return

    socketRef.current.emit('execute_command', {
      command,
      projectId: selectedProject.id,
      agentType
    })

    // Add user message to conversation
    const currentTab = conversations.find(tab => tab.id === activeConversation)
    if (currentTab) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        type: 'user',
        content: command,
        timestamp: new Date().toISOString()
      }

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'assistant',
        content: `🤖 Executing command with ${agentType} agent: \`${command}\``,
        timestamp: new Date().toISOString()
      }

      setConversations(prev => prev.map(tab =>
        tab.id === activeConversation
          ? { ...tab, messages: [...tab.messages, userMessage, assistantMessage] }
          : tab
      ))
    }
  }

  const sendMessage = () => {
    if (!messageInput.trim() || !activeConversation) return

    executeCommand(messageInput)
    setMessageInput('')
  }

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'building': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'testing': return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case 'deploying': return <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />
      case 'working': return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'idle': return <Clock className="h-4 w-4 text-gray-400" />
      default: return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'manager': return '👔'
      case 'coder': return '💻'
      case 'tester': return '🧪'
      case 'deployer': return '🚀'
      case 'analyzer': return '📊'
      case 'debugger': return '🐛'
      default: return '🤖'
    }
  }

  const FileTreeNode = ({ node, level = 0 }: { node: FileSystemNode, level?: number }) => {
    const [expanded, setExpanded] = useState(level < 2)
    const isDirectory = node.type === 'directory'

    return (
      <div>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-gray-100 cursor-pointer`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => isDirectory && setExpanded(!expanded)}
        >
          {isDirectory ? (
            expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />
          ) : <div className="w-3" />}
          {isDirectory ? <Folder className="h-4 w-4 text-blue-500" /> : <File className="h-4 w-4 text-gray-500" />}
          <span className="text-sm">{node.name}</span>
        </div>
        {isDirectory && expanded && node.children && (
          <div>
            {node.children.map((child, index) => (
              <FileTreeNode key={index} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading AIDE Dashboard...</span>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-bold">AIDE</h1>
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mt-1">Autonomous Development Environment</p>
        </div>

        {/* Projects */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Projects ({projects.length})</h2>
            <ScrollArea className="h-60">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={`mb-2 cursor-pointer transition-colors ${selectedProject?.id === project.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  onClick={() => selectProject(project)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{project.name}</h3>
                        <p className="text-xs text-gray-500">{project.framework} • {project.type}</p>
                      </div>
                      {getStatusIcon(project.status)}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <GitBranch className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{project.gitBranch}</span>
                      {project.port && (
                        <Badge variant="outline" className="text-xs">:{project.port}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ScrollArea>
          </div>

          <Separator />

          {/* AI Agents */}
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">AI Agents ({agents.length})</h2>
            <ScrollArea className="h-48">
              {agents.map((agent) => (
                <div key={agent.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getAgentIcon(agent.type)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {agent.currentTask || `${agent.tasksCompleted} tasks completed`}
                    </p>
                  </div>
                  {getStatusIcon(agent.status)}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Conversation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <Tabs value={activeConversation || ''} onValueChange={setActiveConversation}>
            <TabsList className="h-auto p-0 bg-transparent">
              {conversations.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {tab.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Main View */}
        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation && (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {conversations
                    .find(tab => tab.id === activeConversation)
                    ?.messages.map((message) => (
                      <div key={message.id} className={`mb-4 ${message.type === 'user' ? 'ml-12' : 'mr-12'}`}>
                        <div className={`p-3 rounded-lg ${message.type === 'user'
                            ? 'bg-blue-600 text-white ml-auto'
                            : message.type === 'system'
                              ? 'bg-yellow-50 border border-yellow-200'
                              : 'bg-gray-100'
                          }`}>
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a command or ask for help..."
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={sendMessage} disabled={!messageInput.trim()}>
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeCommand('pnpm install', 'manager')}
                    >
                      Install Deps
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeCommand('pnpm dev', 'coder')}
                    >
                      Start Dev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeCommand('pnpm test', 'tester')}
                    >
                      Run Tests
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => executeCommand('pnpm build', 'deployer')}
                    >
                      Build
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-80 bg-white border-l border-gray-200">
            <Tabs defaultValue="files" className="h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="analysis">🧠 Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="files" className="h-full overflow-hidden">
                <ScrollArea className="h-full p-2">
                  {fileTree.map((node, index) => (
                    <FileTreeNode key={index} node={node} />
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="tasks" className="h-full overflow-hidden">
                <ScrollArea className="h-full p-2">
                  {tasks
                    .filter(task => !selectedProject || task.projectId === selectedProject.id)
                    .map((task) => (
                      <Card key={task.id} className="mb-2">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{task.type}</span>
                            {getStatusIcon(task.status)}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{task.command}</p>
                          {task.output && (
                            <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                              {task.output.slice(0, 200)}...
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="agents" className="h-full overflow-hidden">
                <ScrollArea className="h-full p-2">
                  {agents.map((agent) => (
                    <Card key={agent.id} className="mb-2">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{getAgentIcon(agent.type)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.type}</p>
                          </div>
                          {getStatusIcon(agent.status)}
                        </div>
                        {agent.currentTask && (
                          <p className="text-xs text-gray-600 mt-2">{agent.currentTask}</p>
                        )}
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>Tasks: {agent.tasksCompleted}</span>
                          <span>{new Date(agent.lastUpdate).toLocaleTimeString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="analysis" className="h-full overflow-hidden">
                <div className="h-full p-2">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">🧠 Intelligent Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Switch to full analysis view for comprehensive project insights
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quick Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm">Code Quality</span>
                            <span className="text-sm font-medium text-green-600">85%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Test Coverage</span>
                            <span className="text-sm font-medium text-yellow-600">72%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Dependencies</span>
                            <span className="text-sm font-medium text-green-600">Healthy</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      className="w-full"
                      onClick={() => {
                        // Open full analysis dashboard
                        window.open('/analysis', '_blank')
                      }}
                    >
                      🔍 Open Full Analysis Dashboard
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
