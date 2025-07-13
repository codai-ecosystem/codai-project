'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  Code,
  Send,
  Bot,
  User,
  Terminal,
  FileText,
  Copy,
  ExternalLink
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Project {
  id: number
  name: string
  description: string
  status: string
  language: string
  framework: string
}

export default function EmbeddedAide() {
  const [activeTab, setActiveTab] = useState<'chat' | 'projects' | 'code'>('chat')
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // Check AIDE service connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:4002/health')
        setIsConnected(response.ok)

        if (response.ok) {
          // Load initial data
          loadProjects()
        }
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:4002/api/projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.data)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || loading) return

    const userMessage = message
    setMessage('')
    setLoading(true)

    // Add user message immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, newUserMessage])

    try {
      const response = await fetch('http://localhost:4002/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    const name = prompt('Project name:')
    const description = prompt('Project description:')

    if (name && description) {
      try {
        const response = await fetch('http://localhost:4002/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, description })
        })

        const data = await response.json()
        if (data.success) {
          await loadProjects()
          alert(`Project "${name}" created successfully!`)
        }
      } catch (error) {
        alert('Failed to create project')
      }
    }
  }

  const generateCode = async () => {
    const prompt = document.querySelector<HTMLTextAreaElement>('#code-prompt')?.value
    if (!prompt) return

    setLoading(true)
    try {
      const response = await fetch('http://localhost:4002/api/generate-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          language: 'javascript',
          framework: 'react'
        })
      })

      const data = await response.json()
      if (data.success) {
        const codeDisplay = document.querySelector('#generated-code')
        if (codeDisplay) {
          codeDisplay.textContent = data.data.code
        }
      }
    } catch (error) {
      console.error('Failed to generate code:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
          <Terminal className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">AIDE Unavailable</h3>
        <p className="text-slate-400 mb-4">
          The AI Development Environment service is not running.
        </p>
        <button
          onClick={() => window.open('http://localhost:4002', '_blank')}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
        >
          Launch AIDE Service
        </button>
      </div>
    )
  }

  return (
    <div className="glass-card p-6 h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AIDE Assistant</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Connected</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.open('http://localhost:4002', '_blank')}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-lg p-1 mb-6">
        {(['chat', 'projects', 'code'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${activeTab === tab
                ? 'bg-blue-500/30 text-blue-300'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 && (
                  <div className="text-center text-slate-400 py-8">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Start a conversation with the AI assistant</p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white/10 text-slate-200'
                        }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Describe your project or ask a question..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !message.trim()}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Your Projects</h4>
                <button
                  onClick={createProject}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-sm font-medium transition-colors"
                >
                  New Project
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{project.name}</h5>
                      <span className={`px-2 py-1 rounded text-xs ${project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                        }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">{project.description}</p>
                    <div className="flex space-x-2 text-xs text-slate-500">
                      <span>{project.language}</span>
                      {project.framework && <span>• {project.framework}</span>}
                    </div>
                  </div>
                ))}

                {projects.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No projects yet</p>
                    <p className="text-sm">Create your first project to get started</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full flex flex-col"
            >
              <h4 className="text-lg font-semibold mb-4">Code Generator</h4>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Describe what you want to build:</label>
                  <textarea
                    id="code-prompt"
                    placeholder="e.g., Create a React component for a todo list with add, delete, and complete functionality"
                    className="w-full h-20 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={generateCode}
                    disabled={loading}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 rounded-lg font-medium transition-colors"
                  >
                    {loading ? 'Generating...' : 'Generate Code'}
                  </button>
                  <button
                    onClick={() => {
                      const code = document.querySelector('#generated-code')?.textContent
                      if (code) {
                        navigator.clipboard.writeText(code)
                        alert('Code copied to clipboard!')
                      }
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 bg-black/30 rounded-lg p-4 overflow-y-auto">
                  <pre id="generated-code" className="text-sm text-green-400 whitespace-pre-wrap">
                    {/* Generated code will appear here */}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
