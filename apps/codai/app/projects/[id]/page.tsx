'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useParams } from 'next/navigation'
import CollaborativeFileEditor from '../../../components/CollaborativeFileEditor'
import BuildPipeline from '../../../components/BuildPipeline'
import CodeAnalysisPanel from '../../../components/CodeAnalysisPanel'
import GitVersionControl from '../../../components/GitVersionControl'
import {
  ArrowLeft,
  Code,
  Package,
  Settings,
  GitBranch,
  Calendar,
  User,
  FileText,
  Terminal,
  Play,
  Download,
  Edit3,
  Trash2,
  ExternalLink,
  Folder,
  File,
  Package2,
  Activity,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Zap
} from 'lucide-react'

interface ProjectDetail {
  id: string
  name: string
  path: string
  type: string
  language: string
  framework: string
  status: 'active' | 'maintenance' | 'archived'
  description: string
  lastModified: Date
  size: string
  dependencies: string[]
  devDependencies: string[]
  scripts: Record<string, string>
  gitBranch?: string
  gitCommits?: number
  packageJson?: any
  files?: {
    name: string
    type: 'file' | 'directory'
    size: number
    lastModified: Date
  }[]
}

export default function ProjectDetailPage() {
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string

  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'dependencies' | 'scripts' | 'pipeline' | 'analysis' | 'git' | 'settings'>('overview')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails()
    }
  }, [projectId])

  const fetchProjectDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/projects/${projectId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch project details')
      }

      setProject(data.project)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch project details')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'maintenance': return 'text-yellow-400 bg-yellow-400/20'
      case 'archived': return 'text-gray-400 bg-gray-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getTypeIcon = (type: string) => {
    if (type.includes('Application') || type.includes('app')) return Code
    if (type.includes('Package') || type.includes('Library')) return Package
    return Settings
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderIcon = (IconComponent: React.ComponentType<any>, className: string = "w-5 h-5") => {
    return <IconComponent className={className} />
  }

  const isTextFile = (fileName: string) => {
    const textExtensions = ['.txt', '.md', '.json', '.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.xml', '.yml', '.yaml', '.env', '.gitignore', '.config']
    const ext = '.' + fileName.split('.').pop()?.toLowerCase()
    return textExtensions.includes(ext) || !fileName.includes('.')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading project details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Project</h2>
          <p className="text-gray-300 mb-6">{error || 'Project not found'}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={fetchProjectDetails}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const TypeIcon = getTypeIcon(project.type)

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
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <TypeIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{project.type} • {project.framework}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={fetchProjectDetails}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <Edit3 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Code className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Language</p>
                <p className="text-white font-medium">{project.language}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-xl">
                <GitBranch className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Git Branch</p>
                <p className="text-white font-medium">{project.gitBranch || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Commits</p>
                <p className="text-white font-medium">{project.gitCommits || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-500/20 rounded-xl">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Last Modified</p>
                <p className="text-white font-medium text-xs">{formatDate(project.lastModified)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-1 mb-8"
        >
          <div className="flex space-x-1">
            {(['overview', 'files', 'dependencies', 'scripts', 'pipeline', 'analysis', 'git', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab
                  ? 'bg-indigo-500/30 text-indigo-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab === 'overview' && <Activity className="w-4 h-4" />}
                {tab === 'files' && <File className="w-4 h-4" />}
                {tab === 'dependencies' && <Package2 className="w-4 h-4" />}
                {tab === 'scripts' && <Terminal className="w-4 h-4" />}
                {tab === 'pipeline' && <Zap className="w-4 h-4" />}
                {tab === 'analysis' && <AlertCircle className="w-4 h-4" />}
                {tab === 'git' && <GitBranch className="w-4 h-4" />}
                {tab === 'settings' && <Settings className="w-4 h-4" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                <p className="text-gray-300">{project.description}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Project Path</label>
                    <p className="text-white font-mono text-sm mt-1 bg-white/5 p-2 rounded">{project.path}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Project Size</label>
                    <p className="text-white mt-1">{project.size}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Framework</label>
                    <p className="text-white mt-1">{project.framework}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Language</label>
                    <p className="text-white mt-1">{project.language}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Files</h3>
              {project.files && project.files.length > 0 ? (
                <div className="space-y-2">
                  {project.files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        {file.type === 'directory' ? (
                          <Folder className="w-5 h-5 text-blue-400" />
                        ) : (
                          <File className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="text-white">{file.name}</span>
                        {file.type === 'directory' && (
                          <span className="text-xs text-gray-400">(folder)</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          {file.type === 'file' && (
                            <span>{formatFileSize(file.size)}</span>
                          )}
                          <span>{formatDate(file.lastModified)}</span>
                        </div>
                        {file.type === 'file' && isTextFile(file.name) && (
                          <button
                            onClick={() => setSelectedFile(file.name)}
                            className="p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors"
                            title="Edit file"
                          >
                            <Edit3 className="w-4 h-4 text-indigo-400" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No file information available</p>
              )}
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Dependencies</h3>
                {project.dependencies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.dependencies.map((dep, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg"
                      >
                        <Package2 className="w-4 h-4 text-green-400" />
                        <span className="text-white text-sm">{dep}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No dependencies found</p>
                )}
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Dev Dependencies</h3>
                {project.devDependencies.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {project.devDependencies.map((dep, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                      >
                        <Package2 className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">{dep}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No dev dependencies found</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'scripts' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Package Scripts</h3>
              {Object.keys(project.scripts).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(project.scripts).map(([scriptName, scriptCommand], index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Terminal className="w-4 h-4 text-indigo-400" />
                          <span className="text-white font-medium">{scriptName}</span>
                        </div>
                        <code className="text-sm text-gray-300 font-mono bg-black/20 px-2 py-1 rounded">
                          {scriptCommand}
                        </code>
                      </div>
                      <button className="ml-4 p-2 bg-indigo-500/20 hover:bg-indigo-500/30 rounded-lg transition-colors">
                        <Play className="w-4 h-4 text-indigo-400" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No scripts found</p>
              )}
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <BuildPipeline projectId={projectId} />
            </div>
          )}

          {activeTab === 'analysis' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <CodeAnalysisPanel
                projectId={projectId}
                onFileSelect={(filePath, line) => {
                  setSelectedFile(filePath)
                  // TODO: Implement line highlighting in FileEditor
                }}
              />
            </div>
          )}

          {activeTab === 'git' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <GitVersionControl projectId={projectId} />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={project.name}
                    readOnly
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={project.description}
                    readOnly
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={project.status}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div className="flex space-x-3">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors">
                    Save Changes
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* File Editor Modal */}
      {selectedFile && projectId && (
        <CollaborativeFileEditor
          projectId={projectId}
          fileName={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  )
}
