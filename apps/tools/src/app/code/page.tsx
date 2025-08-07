'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, Terminal, FileCode, Braces, Hash, Zap, Download, Upload,
  Copy, Save, Trash2, Eye, EyeOff, Grid, LayoutList, Search,
  Star, Clock, Settings, RefreshCw, Plus, Edit3, Check, X,
  GitBranch, Bug, Shield, Lightbulb, Gauge, Layers, Target,
  Sparkles, Cpu, Database, Globe, Lock, ArrowRight, ChevronDown
} from 'lucide-react'

// TypeScript Interfaces
interface CodeTool {
  id: string
  name: string
  description: string
  category: string
  icon: any
  usage: number
  rating: number
  lastUsed: string
  processing: boolean
  featured: boolean
  languages: string[]
  outputFormats: string[]
}

interface CodeMetrics {
  totalTools: number
  activeUsers: string
  processedToday: string
  avgProcessingTime: string
  successRate: number
  popularLanguage: string
}

interface CodeProcessingJob {
  id: string
  tool: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: string
  language: string
  linesOfCode: number
  outputSize?: string
}

interface CodeCategory {
  id: string
  name: string
  count: number
  icon: any
  color: string
  description: string
}

interface CodeEditor {
  input: string
  output: string
  language: string
  theme: 'light' | 'dark'
  fontSize: number
  lineNumbers: boolean
  wordWrap: boolean
}

export default function CodeToolsPage() {
  // State Management
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeProcessor, setActiveProcessor] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [codeEditor, setCodeEditor] = useState<CodeEditor>({
    input: '// Enter your code here...\nfunction hello() {\n  console.log("Hello, World!");\n}',
    output: '',
    language: 'javascript',
    theme: 'dark',
    fontSize: 14,
    lineNumbers: true,
    wordWrap: true
  })

  // Mock Data
  const codeMetrics: CodeMetrics = {
    totalTools: 9,
    activeUsers: '3,247',
    processedToday: '12,567',
    avgProcessingTime: '1.2s',
    successRate: 98.4,
    popularLanguage: 'JavaScript'
  }

  const categories: CodeCategory[] = [
    {
      id: 'formatting',
      name: 'Code Formatting',
      count: 3,
      icon: Braces,
      color: 'text-blue-600',
      description: 'Format, beautify, and style code'
    },
    {
      id: 'conversion',
      name: 'Code Conversion',
      count: 2,
      icon: RefreshCw,
      color: 'text-green-600',
      description: 'Convert between languages and formats'
    },
    {
      id: 'analysis',
      name: 'Code Analysis',
      count: 2,
      icon: Bug,
      color: 'text-purple-600',
      description: 'Analyze code quality and performance'
    },
    {
      id: 'utilities',
      name: 'Code Utilities',
      count: 2,
      icon: Settings,
      color: 'text-orange-600',
      description: 'General code processing utilities'
    }
  ]

  const codeTools: CodeTool[] = [
    {
      id: 'code-formatter',
      name: 'Code Formatter',
      description: 'Format and beautify code with consistent indentation and style',
      category: 'formatting',
      icon: Braces,
      usage: 4567,
      rating: 4.9,
      lastUsed: '2 mins ago',
      processing: false,
      featured: true,
      languages: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'CSS', 'HTML'],
      outputFormats: ['Formatted Code']
    },
    {
      id: 'syntax-highlighter',
      name: 'Syntax Highlighter',
      description: 'Add syntax highlighting to code with multiple theme options',
      category: 'formatting',
      icon: Eye,
      usage: 3456,
      rating: 4.8,
      lastUsed: '5 mins ago',
      processing: false,
      featured: true,
      languages: ['All Languages'],
      outputFormats: ['HTML', 'SVG', 'PNG']
    },
    {
      id: 'minifier',
      name: 'Code Minifier',
      description: 'Minify JavaScript, CSS, and HTML for production deployment',
      category: 'utilities',
      icon: Target,
      usage: 2847,
      rating: 4.7,
      lastUsed: '8 mins ago',
      processing: false,
      featured: true,
      languages: ['JavaScript', 'CSS', 'HTML'],
      outputFormats: ['Minified Code']
    },
    {
      id: 'json-validator',
      name: 'JSON Validator',
      description: 'Validate, format, and analyze JSON structure with error detection',
      category: 'analysis',
      icon: Database,
      usage: 2134,
      rating: 4.6,
      lastUsed: '12 mins ago',
      processing: false,
      featured: false,
      languages: ['JSON'],
      outputFormats: ['Formatted JSON', 'Analysis Report']
    },
    {
      id: 'regex-builder',
      name: 'Regex Builder',
      description: 'Build and test regular expressions with visual pattern matching',
      category: 'utilities',
      icon: Hash,
      usage: 1876,
      rating: 4.5,
      lastUsed: '15 mins ago',
      processing: false,
      featured: false,
      languages: ['RegExp'],
      outputFormats: ['Regex Pattern', 'Test Results']
    },
    {
      id: 'code-converter',
      name: 'Language Converter',
      description: 'Convert code between different programming languages',
      category: 'conversion',
      icon: GitBranch,
      usage: 1543,
      rating: 4.4,
      lastUsed: '18 mins ago',
      processing: false,
      featured: false,
      languages: ['JavaScript', 'Python', 'Java', 'C#'],
      outputFormats: ['Converted Code']
    },
    {
      id: 'base64-converter',
      name: 'Base64 Converter',
      description: 'Encode and decode code or data to/from Base64 format',
      category: 'conversion',
      icon: Lock,
      usage: 1234,
      rating: 4.3,
      lastUsed: '22 mins ago',
      processing: false,
      featured: false,
      languages: ['Any Text'],
      outputFormats: ['Base64', 'Decoded Text']
    },
    {
      id: 'complexity-analyzer',
      name: 'Complexity Analyzer',
      description: 'Analyze code complexity, maintainability, and performance metrics',
      category: 'analysis',
      icon: Gauge,
      usage: 987,
      rating: 4.2,
      lastUsed: '25 mins ago',
      processing: false,
      featured: false,
      languages: ['JavaScript', 'Python', 'Java', 'C++'],
      outputFormats: ['Analysis Report', 'Metrics JSON']
    },
    {
      id: 'documentation-generator',
      name: 'Doc Generator',
      description: 'Generate documentation from code comments and function signatures',
      category: 'formatting',
      icon: FileCode,
      usage: 756,
      rating: 4.1,
      lastUsed: '28 mins ago',
      processing: false,
      featured: false,
      languages: ['JavaScript', 'TypeScript', 'Python', 'Java'],
      outputFormats: ['HTML Docs', 'Markdown', 'PDF']
    }
  ]

  const processingJobs: CodeProcessingJob[] = [
    {
      id: '1',
      tool: 'Code Formatter',
      status: 'processing',
      progress: 75,
      startTime: '1 min ago',
      language: 'TypeScript',
      linesOfCode: 247
    },
    {
      id: '2',
      tool: 'JSON Validator',
      status: 'completed',
      progress: 100,
      startTime: '4 mins ago',
      language: 'JSON',
      linesOfCode: 156,
      outputSize: 'Valid JSON'
    },
    {
      id: '3',
      tool: 'Code Minifier',
      status: 'completed',
      progress: 100,
      startTime: '7 mins ago',
      language: 'JavaScript',
      linesOfCode: 89,
      outputSize: '12.4 KB'
    }
  ]

  const programmingLanguages = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'PHP', 'Ruby', 'Swift', 'Kotlin', 'HTML', 'CSS', 'SQL', 'JSON', 'XML'
  ]

  // Filter tools based on search and category
  const filteredTools = codeTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Process code with selected tool
  const processCode = (toolId: string) => {
    setActiveProcessor(toolId)
    // Simulate processing
    setTimeout(() => {
      const tool = codeTools.find(t => t.id === toolId)
      setCodeEditor(prev => ({
        ...prev,
        output: `// Processed with ${tool?.name}\n${prev.input}`
      }))
      setActiveProcessor(null)
    }, 2000)
  }

  // Update code editor
  const updateCodeEditor = (field: keyof CodeEditor, value: any) => {
    setCodeEditor(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="relative">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-8">
            
            {/* Enhanced Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 p-8 text-white shadow-2xl"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <Code className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold mb-2">Code Tools</h1>
                      <p className="text-emerald-100 text-lg">Advanced Code Processing & Development Utilities</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{codeMetrics.totalTools}</div>
                        <div className="text-emerald-100 text-sm">Code Tools</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{codeMetrics.processedToday}</div>
                        <div className="text-emerald-100 text-sm">Processed Today</div>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{codeMetrics.successRate}%</div>
                        <div className="text-emerald-100 text-sm">Success Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Code Editor Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Code Processor</h3>
                <div className="flex items-center gap-4">
                  <select
                    value={codeEditor.language}
                    onChange={(e) => updateCodeEditor('language', e.target.value)}
                    className="px-3 py-2 bg-white/50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {programmingLanguages.map(lang => (
                      <option key={lang} value={lang.toLowerCase()}>{lang}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Avg: {codeMetrics.avgProcessingTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Input Code</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCodeEditor('theme', codeEditor.theme === 'light' ? 'dark' : 'light')}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {codeEditor.theme === 'light' ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Upload className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => updateCodeEditor('input', '')}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`relative ${codeEditor.theme === 'dark' ? 'bg-gray-900' : 'bg-white'} rounded-xl border border-gray-200`}>
                    <textarea
                      value={codeEditor.input}
                      onChange={(e) => updateCodeEditor('input', e.target.value)}
                      placeholder="Enter your code here..."
                      className={`w-full h-64 p-4 rounded-xl resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        codeEditor.theme === 'dark' 
                          ? 'bg-gray-900 text-green-400 placeholder-gray-500' 
                          : 'bg-white text-gray-900 placeholder-gray-400'
                      }`}
                      style={{ fontSize: `${codeEditor.fontSize}px` }}
                    />
                    {codeEditor.lineNumbers && (
                      <div className="absolute left-0 top-0 p-4 text-xs text-gray-400 font-mono pointer-events-none">
                        {codeEditor.input.split('\n').map((_, i) => (
                          <div key={i} className="leading-6">{i + 1}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {codeEditor.input.split('\n').length} lines, {codeEditor.input.length} characters
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={codeEditor.lineNumbers}
                          onChange={(e) => updateCodeEditor('lineNumbers', e.target.checked)}
                          className="rounded"
                        />
                        Line Numbers
                      </label>
                      <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={codeEditor.wordWrap}
                          onChange={(e) => updateCodeEditor('wordWrap', e.target.checked)}
                          className="rounded"
                        />
                        Word Wrap
                      </label>
                    </div>
                  </div>
                </div>
                
                {/* Output Editor */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Output Code</label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigator.clipboard.writeText(codeEditor.output)}
                        className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                        disabled={!codeEditor.output}
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors" disabled={!codeEditor.output}>
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className={`relative ${codeEditor.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} rounded-xl border border-gray-200`}>
                    <textarea
                      value={codeEditor.output}
                      readOnly
                      placeholder="Processed code will appear here..."
                      className={`w-full h-64 p-4 rounded-xl resize-none font-mono text-sm focus:outline-none ${
                        codeEditor.theme === 'dark' 
                          ? 'bg-gray-900 text-green-400 placeholder-gray-500' 
                          : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                      }`}
                      style={{ fontSize: `${codeEditor.fontSize}px` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {codeEditor.output.split('\n').length} lines, {codeEditor.output.length} characters
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-600">Font Size:</label>
                      <input
                        type="range"
                        min="10"
                        max="18"
                        value={codeEditor.fontSize}
                        onChange={(e) => updateCodeEditor('fontSize', parseInt(e.target.value))}
                        className="w-16"
                      />
                      <span className="text-xs text-gray-600">{codeEditor.fontSize}px</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Search and Filters */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search code tools..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex bg-white/50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'grid' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                        viewMode === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <LayoutList className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Categories Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {categories.map((category, index) => {
                const IconComponent = category.icon
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`group p-6 rounded-2xl cursor-pointer transition-all duration-200 border ${
                      selectedCategory === category.id 
                        ? 'bg-emerald-500 text-white border-emerald-600 shadow-lg' 
                        : 'bg-white/70 backdrop-blur-sm border-white/50 hover:border-emerald-300 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent className={`h-8 w-8 ${
                        selectedCategory === category.id ? 'text-white' : category.color
                      }`} />
                      <div className={`text-right ${
                        selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                      }`}>
                        <div className="text-2xl font-bold">{category.count}</div>
                        <div className={`text-sm ${
                          selectedCategory === category.id ? 'text-emerald-100' : 'text-gray-600'
                        }`}>Tools</div>
                      </div>
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      selectedCategory === category.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {category.name}
                    </h3>
                    <p className={`text-sm ${
                      selectedCategory === category.id ? 'text-emerald-100' : 'text-gray-600'
                    }`}>
                      {category.description}
                    </p>
                  </motion.div>
                )
              })}
            </motion.div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Code Tools Grid */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Code Processing Tools</h3>
                    <div className="text-sm text-gray-600">{filteredTools.length} tools</div>
                  </div>
                  
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredTools.map((tool, index) => {
                        const IconComponent = tool.icon
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="group p-6 bg-white/50 rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="p-3 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-xl group-hover:from-emerald-200 group-hover:to-blue-200 transition-all duration-200">
                                  <IconComponent className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                                    {tool.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span className="text-xs text-gray-600">{tool.rating}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-600">{tool.usage} uses</span>
                                  </div>
                                </div>
                              </div>
                              {tool.featured && (
                                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-xs font-medium">
                                  Featured
                                </div>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                            
                            <div className="flex flex-wrap gap-1 mb-4">
                              {tool.languages.slice(0, 3).map(lang => (
                                <span key={lang} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                  {lang}
                                </span>
                              ))}
                              {tool.languages.length > 3 && (
                                <span className="text-xs text-gray-500">+{tool.languages.length - 3}</span>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Last used: {tool.lastUsed}</span>
                              <button
                                onClick={() => processCode(tool.id)}
                                disabled={!codeEditor.input.trim() || activeProcessor === tool.id}
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                              >
                                {activeProcessor === tool.id ? (
                                  <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    Processing
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-4 w-4" />
                                    Process
                                  </>
                                )}
                              </button>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTools.map((tool, index) => {
                        const IconComponent = tool.icon
                        return (
                          <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                            className="flex items-center justify-between p-4 bg-white/50 rounded-xl border border-gray-200 hover:border-emerald-300 transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gradient-to-r from-emerald-100 to-blue-100 rounded-lg">
                                <IconComponent className="h-5 w-5 text-emerald-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                                <p className="text-sm text-gray-600">{tool.description}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                    <span className="text-xs text-gray-600">{tool.rating}</span>
                                  </div>
                                  <span className="text-xs text-gray-600">{tool.usage} uses</span>
                                  <div className="flex gap-1">
                                    {tool.languages.slice(0, 2).map(lang => (
                                      <span key={lang} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                                        {lang}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => processCode(tool.id)}
                              disabled={!codeEditor.input.trim() || activeProcessor === tool.id}
                              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {activeProcessor === tool.id ? (
                                <>
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  <Zap className="h-4 w-4" />
                                  Process
                                </>
                              )}
                            </button>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Processing Queue & Stats */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Processing Queue</h3>
                    <RefreshCw className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-4">
                    {processingJobs.map((job, index) => (
                      <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="p-4 bg-white/50 rounded-xl border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">{job.tool}</h4>
                            <p className="text-xs text-gray-600">{job.language} • {job.linesOfCode} lines</p>
                            <p className="text-xs text-gray-500">Started {job.startTime}</p>
                          </div>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status === 'completed' && <Check className="h-3 w-3 mr-1" />}
                            {job.status === 'processing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                            {job.status === 'failed' && <X className="h-3 w-3 mr-1" />}
                            {job.status}
                          </div>
                        </div>
                        
                        {job.status === 'processing' && (
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progress</span>
                              <span>{job.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${job.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Lines: {job.linesOfCode}</span>
                          {job.outputSize && (
                            <button className="text-emerald-600 hover:text-emerald-700">
                              Download
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Code Stats</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Users</span>
                      <span className="text-lg font-semibold text-gray-900">{codeMetrics.activeUsers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg Processing</span>
                      <span className="text-lg font-semibold text-gray-900">{codeMetrics.avgProcessingTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-lg font-semibold text-green-600">{codeMetrics.successRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Popular Language</span>
                      <span className="text-lg font-semibold text-emerald-600">{codeMetrics.popularLanguage}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Modern Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Cpu className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Smart Code Analysis</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  AI-powered code analysis with complexity metrics and optimization suggestions.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Analyze Code
                </button>
              </div>

              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <GitBranch className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Multi-Language Support</h3>
                <p className="text-blue-100 text-sm mb-4">
                  Process code in 17+ programming languages with intelligent syntax detection.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Try Languages
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <Shield className="h-8 w-8" />
                  <ArrowRight className="h-5 w-5 opacity-75" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure Processing</h3>
                <p className="text-purple-100 text-sm mb-4">
                  Enterprise-grade security with code encryption and privacy protection.
                </p>
                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-4 py-2 rounded-lg text-sm font-medium">
                  Learn Security
                </button>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  )
}
