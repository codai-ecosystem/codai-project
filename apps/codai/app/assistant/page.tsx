'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Brain,
  Code2,
  FileText,
  Zap,
  Copy,
  Download,
  RefreshCw,
  Sparkles,
  Terminal,
  Database,
  Bug
} from 'lucide-react'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  codeBlocks?: CodeBlock[]
}

interface CodeBlock {
  language: string
  code: string
  filename?: string
}

interface Suggestion {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  category: string
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI coding assistant. I can help you with code generation, debugging, optimization, and architectural decisions. What would you like to work on today?",
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const suggestions: Suggestion[] = [
    {
      id: '1',
      title: 'Generate React Component',
      description: 'Create a modern React component with TypeScript',
      icon: <Code2 className="w-5 h-5" />,
      category: 'Code Generation'
    },
    {
      id: '2',
      title: 'Debug Error',
      description: 'Help me fix a bug in my code',
      icon: <Bug className="w-5 h-5" />,
      category: 'Debugging'
    },
    {
      id: '3',
      title: 'API Integration',
      description: 'Build REST API endpoints with error handling',
      icon: <Database className="w-5 h-5" />,
      category: 'Backend'
    },
    {
      id: '4',
      title: 'Performance Optimization',
      description: 'Optimize my code for better performance',
      icon: <Zap className="w-5 h-5" />,
      category: 'Optimization'
    },
    {
      id: '5',
      title: 'Write Tests',
      description: 'Generate comprehensive test cases',
      icon: <FileText className="w-5 h-5" />,
      category: 'Testing'
    },
    {
      id: '6',
      title: 'Database Schema',
      description: 'Design database schema and migrations',
      icon: <Terminal className="w-5 h-5" />,
      category: 'Database'
    }
  ]

  const sampleCode = `// React Component with TypeScript
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface UserProfileProps {
  userId: string
  onUpdate?: (user: User) => void
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  userId, 
  onUpdate 
}) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser(userId)
      .then(setUser)
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="user-profile"
    >
      <Avatar src={user?.avatar} />
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
    </motion.div>
  )
}`

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateResponse(input),
        timestamp: new Date(),
        codeBlocks: input.toLowerCase().includes('code') ? [{
          language: 'typescript',
          code: sampleCode,
          filename: 'UserProfile.tsx'
        }] : undefined
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateResponse = (userInput: string) => {
    const lower = userInput.toLowerCase()

    if (lower.includes('react') || lower.includes('component')) {
      return "I'll help you create a React component. Here's a modern TypeScript component with animations and proper typing:"
    }
    if (lower.includes('bug') || lower.includes('error')) {
      return "I can help you debug that issue. Please share your error message or problematic code, and I'll analyze it for you."
    }
    if (lower.includes('api') || lower.includes('backend')) {
      return "Let me help you build a robust API. I'll create endpoints with proper error handling, validation, and documentation."
    }
    if (lower.includes('performance') || lower.includes('optimize')) {
      return "Great! Performance optimization is crucial. I'll analyze your code and suggest improvements for speed and efficiency."
    }

    return "I understand what you're looking for. Let me provide you with a comprehensive solution that follows best practices."
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setInput(suggestion.description)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-20">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-white/10 backdrop-blur-md border-r border-white/20 p-6 relative z-10"
      >
        <div className="flex items-center space-x-3 mb-8">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">AI Assistant</h2>
            <p className="text-sm text-slate-400">Your coding companion</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-slate-300 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {['chat', 'templates', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${activeTab === tab
                    ? 'bg-blue-600/30 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-4">Suggestions</h3>
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <motion.button
                key={suggestion.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left p-3 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-blue-400 mt-0.5">
                    {suggestion.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white">{suggestion.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{suggestion.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* Header */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Assistant</h1>
              <p className="text-slate-400">Get help with coding, debugging, and architecture</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-emerald-600/20 border border-emerald-500/30 rounded-lg">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-emerald-400 text-sm">AI Online</span>
              </div>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`p-4 rounded-2xl ${message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
                  }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>

                  {/* Code Blocks */}
                  {message.codeBlocks?.map((block, index) => (
                    <div key={index} className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{block.filename || block.language}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => copyCode(block.code)}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <pre className="bg-black/20 rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-slate-200">{block.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-500 mt-2 px-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                  ? 'bg-blue-600 order-1 ml-3'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 order-2 mr-3'
                }`}>
                {message.type === 'user' ? (
                  <span className="text-white text-sm font-medium">U</span>
                ) : (
                  <Sparkles className="w-4 h-4 text-white" />
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <motion.div
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          className="bg-white/10 backdrop-blur-md border-t border-white/20 p-6"
        >
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about coding..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-2xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
