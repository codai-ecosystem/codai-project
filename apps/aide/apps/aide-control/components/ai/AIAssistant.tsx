'use client'

import React from 'react'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  SparklesIcon,
  CodeBracketIcon,
  DocumentTextIcon,
  BeakerIcon,
  RocketLaunchIcon,
  CommandLineIcon,
  CpuChipIcon,
  LightBulbIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface AIAssistantProps {
  projectId?: string
  currentFile?: string
  selectedCode?: string
  onSuggestionApply?: (suggestion: AISuggestion) => void
}

interface AISuggestion {
  id: string
  type: 'code_completion' | 'refactor' | 'bug_fix' | 'optimization' | 'test_generation' | 'documentation'
  title: string
  description: string
  code?: string
  confidence: number
  impact: 'low' | 'medium' | 'high'
  estimatedTime: number // in minutes
  tags: string[]
  beforeCode?: string
  afterCode?: string
}

interface AIContext {
  fileName?: string
  language?: string
  framework?: string
  dependencies?: string[]
  recentChanges?: string[]
  teamPreferences?: Record<string, any>
}

export function AIAssistant({ projectId, currentFile, selectedCode, onSuggestionApply }: AIAssistantProps) {
  const [isActive, setIsActive] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [context, setContext] = useState<AIContext>({})
  const [activeTab, setActiveTab] = useState<'suggestions' | 'chat' | 'analysis'>('suggestions')
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string; timestamp: Date }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Mock AI suggestions based on context
  useEffect(() => {
    if (currentFile || selectedCode) {
      generateAISuggestions()
    }
  }, [currentFile, selectedCode])

  const generateAISuggestions = async () => {
    setLoading(true)

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockSuggestions: AISuggestion[] = [
      {
        id: '1',
        type: 'code_completion',
        title: 'Complete React Hook Implementation',
        description: 'Add proper cleanup and error handling to useEffect hook',
        confidence: 0.92,
        impact: 'medium',
        estimatedTime: 3,
        tags: ['React', 'Hooks', 'Best Practices'],
        beforeCode: `useEffect(() => {
  fetchData()
}, [])`,
        afterCode: `useEffect(() => {
  let mounted = true
  const controller = new AbortController()
  
  const fetchData = async () => {
    try {
      const response = await api.getData({ signal: controller.signal })
      if (mounted) {
        setData(response.data)
      }
    } catch (error) {
      if (error.name !== 'AbortError' && mounted) {
        setError(error.message)
      }
    }
  }
  
  fetchData()
  
  return () => {
    mounted = false
    controller.abort()
  }
}, [])`
      },
      {
        id: '2',
        type: 'optimization',
        title: 'Optimize Component Re-renders',
        description: 'Use React.memo and useCallback to prevent unnecessary re-renders',
        confidence: 0.88,
        impact: 'high',
        estimatedTime: 5,
        tags: ['Performance', 'React', 'Optimization'],
        code: `const MemoizedComponent = React.memo(({ data, onUpdate }) => {
  const handleUpdate = useCallback((id, changes) => {
    onUpdate(id, changes)
  }, [onUpdate])
  
  return (
    <div>
      {data.map(item => (
        <ItemComponent 
          key={item.id} 
          item={item} 
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  )
})`
      },
      {
        id: '3',
        type: 'bug_fix',
        title: 'Fix Potential Memory Leak',
        description: 'Add cleanup for event listeners to prevent memory leaks',
        confidence: 0.95,
        impact: 'high',
        estimatedTime: 2,
        tags: ['Bug Fix', 'Memory Management', 'Event Listeners'],
        beforeCode: `document.addEventListener('click', handleClick)`,
        afterCode: `useEffect(() => {
  const handleClick = (event) => {
    // Handle click
  }
  
  document.addEventListener('click', handleClick)
  
  return () => {
    document.removeEventListener('click', handleClick)
  }
}, [])`
      },
      {
        id: '4',
        type: 'test_generation',
        title: 'Generate Unit Tests',
        description: 'Create comprehensive unit tests for component functionality',
        confidence: 0.85,
        impact: 'medium',
        estimatedTime: 8,
        tags: ['Testing', 'Jest', 'React Testing Library'],
        code: `import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
  
  it('handles user interactions correctly', () => {
    const mockHandler = jest.fn()
    render(<ComponentName onClick={mockHandler} />)
    
    fireEvent.click(screen.getByRole('button'))
    expect(mockHandler).toHaveBeenCalledTimes(1)
  })
})`
      },
      {
        id: '5',
        type: 'refactor',
        title: 'Extract Custom Hook',
        description: 'Extract reusable logic into a custom hook for better maintainability',
        confidence: 0.90,
        impact: 'medium',
        estimatedTime: 6,
        tags: ['Refactoring', 'Custom Hooks', 'Code Organization'],
        code: `// Custom hook
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })
  
  const setValue = (value) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }
  
  return [storedValue, setValue]
}`
      }
    ]

    setSuggestions(mockSuggestions)
    setLoading(false)
  }

  const handleSuggestionApply = (suggestion: AISuggestion) => {
    onSuggestionApply?.(suggestion)

    // Add success message to chat
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Applied suggestion: "${suggestion.title}". The code has been updated with the recommended changes.`,
      timestamp: new Date()
    }])
  }

  const handleChatSubmit = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }])

    setQuery('')
    setLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I can help you with that! Based on your code, I suggest implementing error boundaries for better error handling.",
        "Great question! For performance optimization, consider using React.memo for components that don't need frequent re-renders.",
        "To improve code maintainability, I recommend extracting that logic into a custom hook. Would you like me to show you how?",
        "I notice you're working with async operations. Let me suggest some best practices for handling loading states and errors.",
        "For better TypeScript support, consider adding more specific type definitions. This will help catch errors at compile time."
      ]

      setChatMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      }])

      setLoading(false)
    }, 1000)
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'code_completion': return <CodeBracketIcon className="w-5 h-5 text-blue-500" />
      case 'refactor': return <AdjustmentsHorizontalIcon className="w-5 h-5 text-purple-500" />
      case 'bug_fix': return <BoltIcon className="w-5 h-5 text-red-500" />
      case 'optimization': return <RocketLaunchIcon className="w-5 h-5 text-green-500" />
      case 'test_generation': return <BeakerIcon className="w-5 h-5 text-orange-500" />
      case 'documentation': return <DocumentTextIcon className="w-5 h-5 text-indigo-500" />
      default: return <SparklesIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const tabs = [
    { id: 'suggestions', name: 'Suggestions', icon: LightBulbIcon, count: suggestions.length },
    { id: 'chat', name: 'AI Chat', icon: SparklesIcon },
    { id: 'analysis', name: 'Code Analysis', icon: CpuChipIcon }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Assistant
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}>
              {isActive ? 'Active' : 'Standby'}
            </div>

            <button
              onClick={() => setIsActive(!isActive)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <CpuChipIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing code...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestions.map(suggestion => (
                    <div
                      key={suggestion.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getSuggestionIcon(suggestion.type)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(suggestion.impact)}`}>
                                {suggestion.impact}
                              </span>
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <ClockIcon className="w-3 h-3" />
                                <span>{suggestion.estimatedTime}m</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {suggestion.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Confidence:</span>
                                <span className="font-medium">{Math.round(suggestion.confidence * 100)}%</span>
                              </div>

                              <div className="flex space-x-1">
                                {suggestion.tags.slice(0, 3).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-2">
                              <button className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                                Preview
                              </button>
                              <button
                                onClick={() => handleSuggestionApply(suggestion)}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center space-x-1"
                              >
                                <CheckCircleIcon className="w-3 h-3" />
                                <span>Apply</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {suggestions.length === 0 && !loading && (
                    <div className="text-center py-8">
                      <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        Select some code or open a file to get AI suggestions
                      </p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col h-full"
            >
              {/* Chat messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <div className="text-center py-8">
                    <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">
                      Ask me anything about your code!
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      I can help with refactoring, optimization, bug fixes, and more.
                    </p>
                  </div>
                )}

                {chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleChatSubmit(query)
                      }
                    }}
                    placeholder="Ask about your code..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => handleChatSubmit(query)}
                    disabled={!query.trim() || loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4"
            >
              <div className="text-center py-8">
                <CpuChipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Code Analysis
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Deep code analysis features coming soon
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

