'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FolderPlus,
  Code,
  Package,
  Zap,
  Server,
  Box,
  Settings,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

interface ProjectTemplate {
  id: string
  name: string
  description: string
  icon: React.ComponentType<any>
  type: 'app' | 'package'
  language: string
  framework: string
  features: string[]
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'next-js',
    name: 'Next.js App',
    description: 'Full-stack React application with App Router',
    icon: Zap,
    type: 'app',
    language: 'TypeScript',
    framework: 'Next.js',
    features: ['App Router', 'TypeScript', 'Tailwind CSS', 'ESLint']
  },
  {
    id: 'react',
    name: 'React App',
    description: 'Single-page React application with Vite',
    icon: Code,
    type: 'app',
    language: 'TypeScript',
    framework: 'React',
    features: ['Vite', 'TypeScript', 'React 18', 'ESLint']
  },
  {
    id: 'express',
    name: 'Express API',
    description: 'RESTful API server with Express.js',
    icon: Server,
    type: 'app',
    language: 'TypeScript',
    framework: 'Express',
    features: ['Express.js', 'TypeScript', 'CORS', 'Middleware']
  },
  {
    id: 'node-js',
    name: 'Node.js App',
    description: 'General-purpose Node.js application',
    icon: Settings,
    type: 'app',
    language: 'TypeScript',
    framework: 'Node.js',
    features: ['TypeScript', 'ts-node', 'Jest', 'Build Scripts']
  },
  {
    id: 'library',
    name: 'Shared Library',
    description: 'Reusable package for the ecosystem',
    icon: Package,
    type: 'package',
    language: 'TypeScript',
    framework: 'Library',
    features: ['TypeScript', 'Jest', 'NPM Publishing', 'Type Definitions']
  },
  {
    id: 'custom',
    name: 'Custom Project',
    description: 'Start with a basic project structure',
    icon: Box,
    type: 'app',
    language: 'JavaScript',
    framework: 'Custom',
    features: ['Basic Structure', 'Package.json', 'Git Init']
  }
]

export default function CreateProjectPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'app' as 'app' | 'package'
  })
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [templatePreview, setTemplatePreview] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const validateProjectName = (name: string): boolean => {
    return /^[a-z0-9-]+$/.test(name) && name.length >= 2 && name.length <= 50
  }

  const handleCreateProject = async () => {
    if (!selectedTemplate) {
      setError('Please select a project template')
      return
    }

    if (!validateProjectName(formData.name)) {
      setError('Project name must contain only lowercase letters, numbers, and hyphens (2-50 characters)')
      return
    }

    if (!formData.description.trim()) {
      setError('Please provide a project description')
      return
    }

    setIsCreating(true)
    setError(null)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          template: selectedTemplate.id,
          description: formData.description,
          framework: selectedTemplate.framework,
          language: selectedTemplate.language,
          templateVariables
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create project')
      }

      setSuccess(true)

      // Redirect to project page after success
      setTimeout(() => {
        router.push(`/projects/${result.project.id}`)
      }, 2000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsCreating(false)
    }
  }

  const loadTemplatePreview = async (templateId: string) => {
    try {
      const params = new URLSearchParams({
        projectName: formData.name || 'my-project',
        description: formData.description || 'A new project'
      })

      const response = await fetch(`/api/templates/${templateId}/preview?${params}`)
      const data = await response.json()

      if (response.ok) {
        setTemplatePreview(data)
        // Initialize template variables with defaults
        const defaultVariables: Record<string, string> = {}
        data.templateVariables?.forEach((variable: string) => {
          defaultVariables[variable] = data.previewOptions[variable] || ''
        })
        setTemplateVariables(defaultVariables)
      }
    } catch (error) {
      console.error('Failed to load template preview:', error)
    }
  }

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({ ...prev, type: template.type }))
    loadTemplatePreview(template.id)
  }

  const updateTemplateVariable = (key: string, value: string) => {
    setTemplateVariables(prev => ({ ...prev, [key]: value }))
  }

  const renderIcon = (IconComponent: React.ComponentType<any>, className: string = "w-6 h-6") => {
    return <IconComponent className={className} />
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center max-w-md"
        >
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Project Created!</h2>
          <p className="text-gray-300 mb-4">
            {formData.name} has been created successfully. Redirecting to project page...
          </p>
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => router.back()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center space-x-3">
                <FolderPlus className="w-8 h-8 text-indigo-400" />
                <div>
                  <h1 className="text-2xl font-bold">Create New Project</h1>
                  <p className="text-sm text-gray-400">Choose a template to get started</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Template Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">Select Template</h2>
              <div className="grid gap-4">
                {PROJECT_TEMPLATES.map((template) => (
                  <motion.button
                    key={template.id}
                    onClick={() => {
                      handleTemplateSelect(template)
                      setFormData(prev => ({ ...prev, type: template.type }))
                    }}
                    className={`p-4 rounded-xl border transition-all text-left ${selectedTemplate?.id === template.id
                        ? 'border-indigo-400 bg-indigo-500/20'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${selectedTemplate?.id === template.id
                          ? 'bg-indigo-500/30'
                          : 'bg-white/10'
                        }`}>
                        {renderIcon(template.icon, 'w-6 h-6 text-indigo-400')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-white">{template.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${template.type === 'app'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-purple-500/20 text-purple-400'
                            }`}>
                            {template.type}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature) => (
                            <span
                              key={feature}
                              className="px-2 py-1 bg-white/10 rounded text-xs text-gray-300"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Project Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-white mb-6">Project Details</h2>

              <div className="space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-colors"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>

                {/* Project Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what this project does..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 focus:bg-white/15 transition-colors resize-none"
                  />
                </div>

                {/* Project Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleInputChange('type', 'app')}
                      className={`p-3 rounded-xl border transition-colors ${formData.type === 'app'
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      <div className="text-center">
                        <Code className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm font-medium">Application</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleInputChange('type', 'package')}
                      className={`p-3 rounded-xl border transition-colors ${formData.type === 'package'
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300'
                          : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                    >
                      <div className="text-center">
                        <Package className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm font-medium">Package</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Selected Template Info */}
                {selectedTemplate && (
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="font-medium text-white mb-2">Selected Template</h4>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-500/20 rounded-lg">
                        {renderIcon(selectedTemplate.icon, 'w-5 h-5 text-indigo-400')}
                      </div>
                      <div>
                        <p className="text-white font-medium">{selectedTemplate.name}</p>
                        <p className="text-sm text-gray-400">
                          {selectedTemplate.language} • {selectedTemplate.framework}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-center space-x-2"
                  >
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-sm">{error}</span>
                  </motion.div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreateProject}
                  disabled={isCreating || !selectedTemplate || !formData.name || !formData.description}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-all flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating Project...</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-5 h-5" />
                      <span>Create Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
