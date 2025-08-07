/**
 * Enhanced Project Dashboard with CBD Integration and API Key Management
 * Full-featured project management with external developer support
 */

'use client'

import React, { useState } from 'react'
import { useProjects, useMemoraiInit, useApiKeys } from '../lib/hooks/useMemoraiIntegration'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Filter,
  FolderOpen,
  Calendar,
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Activity,
  Key,
  Copy,
  Eye,
  EyeOff,
  Shield,
  Code,
  ExternalLink
} from 'lucide-react'

interface ProjectCardProps {
  project: any
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
  onSelectProject: (project: any) => void
}

function ProjectCard({ project, onUpdate, onDelete, onSelectProject }: ProjectCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'ACTIVE': return <Activity className="h-4 w-4 text-blue-500" />
      case 'ON_HOLD': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'CANCELLED': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <FolderOpen className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive'
      case 'HIGH': return 'destructive'
      case 'MEDIUM': return 'secondary'
      case 'LOW': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectProject(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(project.status)}
              {project.name}
            </CardTitle>
            <CardDescription>{project.description}</CardDescription>
          </div>
          <Badge variant={getPriorityColor(project.priority) as any}>
            {project.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.teamMembers?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              {project.tasks?.length || 0}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(project.dueDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdate(project.id, { status: 'ACTIVE' })}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(project.id)}
          >
            Delete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectProject(project)}
          >
            <Key className="h-3 w-3 mr-1" />
            API Keys
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ApiKeyManagement({ project }: { project: any }) {
  const { apiKeys, loading, error, createApiKey, revokeApiKey } = useApiKeys(project?.id)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [keyFormData, setKeyFormData] = useState({
    name: '',
    scopes: ['read', 'write']
  })
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createApiKey(keyFormData)
      setShowCreateForm(false)
      setKeyFormData({ name: '', scopes: ['read', 'write'] })
    } catch (err) {
      console.error('Failed to create API key:', err)
    }
  }

  const toggleKeyVisibility = (keyId: string) => {
    const newRevealed = new Set(revealedKeys)
    if (newRevealed.has(keyId)) {
      newRevealed.delete(keyId)
    } else {
      newRevealed.add(keyId)
    }
    setRevealedKeys(newRevealed)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  if (!project) {
    return (
      <div className="text-center py-8">
        <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Select a project to manage API keys</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API Keys for {project.name}</h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys for external integrations
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      {/* Create API Key Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              Generate a new API key for accessing {project.name} data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateApiKey} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="keyName" className="text-sm font-medium">Key Name</label>
                <Input
                  id="keyName"
                  value={keyFormData.name}
                  onChange={(e) => setKeyFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Production API Key"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scopes</label>
                <div className="space-y-2">
                  {['read', 'write', 'delete'].map(scope => (
                    <label key={scope} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={keyFormData.scopes.includes(scope)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setKeyFormData(prev => ({
                              ...prev,
                              scopes: [...prev.scopes, scope]
                            }))
                          } else {
                            setKeyFormData(prev => ({
                              ...prev,
                              scopes: prev.scopes.filter(s => s !== scope)
                            }))
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create API Key</Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* API Keys List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-semibold text-red-600">Error Loading API Keys</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : apiKeys.length > 0 ? (
        <div className="space-y-3">
          {apiKeys.map(apiKey => (
            <Card key={apiKey.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(apiKey.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={apiKey.isActive ? "default" : "secondary"}>
                        {apiKey.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => revokeApiKey(apiKey.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Key</span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {revealedKeys.has(apiKey.id) ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(apiKey.token)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <code className="block p-2 bg-muted rounded text-sm font-mono">
                      {revealedKeys.has(apiKey.id)
                        ? apiKey.token
                        : '•'.repeat(apiKey.token.length)
                      }
                    </code>
                  </div>

                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Scopes: {apiKey.scopes.join(', ')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Key className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first API key to enable external access
                </p>
              </div>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function CreateProjectForm({ onSubmit, onCancel }: {
  onSubmit: (project: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PLANNING',
    priority: 'MEDIUM',
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const project = {
      ...formData,
      progress: 0,
      startDate: new Date(formData.startDate),
      dueDate: new Date(formData.dueDate),
      teamMembers: [],
      tasks: [],
      milestones: [],
      tags: ['external-project'],
    }

    onSubmit(project)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Add a new project with CBD integration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Project Name</label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name..."
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the project..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">Due Date</label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">Create Project</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export function EnhancedProjectDashboard() {
  const { initialized, initializing, error: initError } = useMemoraiInit()
  const { projects, loading, error, createProject, updateProject, deleteProject, searchProjects, refresh } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('projects')

  // Handle initialization errors
  if (initError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-red-600">CBD Integration Error</h3>
              <p className="text-sm text-muted-foreground">{initError}</p>
            </div>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show loading state during initialization
  if (initializing || !initialized) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <Database className="h-12 w-12 text-blue-500 mx-auto animate-pulse" />
            <div>
              <h3 className="font-semibold">Initializing CBD Services</h3>
              <p className="text-sm text-muted-foreground">Connecting to CBD Universal Database...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleCreateProject = async (projectData: any) => {
    try {
      await createProject(projectData)
      setShowCreateForm(false)
    } catch (err) {
      console.error('Failed to create project:', err)
    }
  }

  const handleUpdateProject = async (projectId: string, updates: any) => {
    try {
      await updateProject(projectId, updates)
    } catch (err) {
      console.error('Failed to update project:', err)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(projectId)
        if (selectedProject?.id === projectId) {
          setSelectedProject(null)
        }
      } catch (err) {
        console.error('Failed to delete project:', err)
      }
    }
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await searchProjects(searchQuery)
      } catch (err) {
        console.error('Search failed:', err)
      }
    } else {
      refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Project Management</h2>
          <p className="text-muted-foreground">
            Manage projects with CBD integration and API key generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            <Database className="h-4 w-4 mr-2" />
            Sync with CBD
          </Button>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        {/* Tab Headers */}
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('projects')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'projects'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveTab('api-keys')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'api-keys'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
            >
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('integration')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'integration'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                }`}
            >
              Integration Guide
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="flex items-center p-6">
                  <FolderOpen className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <p className="text-2xl font-bold">{projects.length}</p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Activity className="h-8 w-8 text-green-500 mr-4" />
                  <div>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'ACTIVE').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Active</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <CheckCircle className="h-8 w-8 text-blue-500 mr-4" />
                  <div>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.status === 'COMPLETED').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex items-center p-6">
                  <Key className="h-8 w-8 text-purple-500 mr-4" />
                  <div>
                    <p className="text-2xl font-bold">
                      {projects.filter(p => p.tags?.includes('external-project')).length}
                    </p>
                    <p className="text-sm text-muted-foreground">External</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button variant="outline" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Error Display */}
            {error && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-600">Error</p>
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Project Form */}
            {showCreateForm && (
              <CreateProjectForm
                onSubmit={handleCreateProject}
                onCancel={() => setShowCreateForm(false)}
              />
            )}

            {/* Projects Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-3 bg-muted rounded w-full mb-4" />
                        <div className="h-2 bg-muted rounded w-full mb-2" />
                        <div className="h-8 bg-muted rounded w-1/2" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onUpdate={handleUpdateProject}
                    onDelete={handleDeleteProject}
                    onSelectProject={(proj) => {
                      setSelectedProject(proj)
                      setActiveTab('api-keys')
                    }}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center p-12">
                  <div className="text-center space-y-4">
                    <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <h3 className="font-semibold">No Projects Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Create your first project to get started with CBD integration
                      </p>
                    </div>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'api-keys' && <ApiKeyManagement project={selectedProject} />}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Integration Guide
                </CardTitle>
                <CardDescription>
                  Learn how to integrate with the CODAI ecosystem
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Install the SDK</h4>
                    <code className="block p-3 bg-muted rounded text-sm font-mono">
                      npm install @codai/cbd @codai/auth
                    </code>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">2. Initialize the Client</h4>
                    <code className="block p-3 bg-muted rounded text-sm font-mono whitespace-pre">
                      {`import { CBDClient } from '@codai/cbd';

const cbd = new CBDClient({
  baseUrl: 'https://cbd.memorai.ro',
  apiKey: 'your-api-key-here'
});`}
                    </code>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">3. Use the API</h4>
                    <code className="block p-3 bg-muted rounded text-sm font-mono whitespace-pre">
                      {`// Store data
await cbd.documents.create('users', {
  name: 'John Doe',
                  email: 'john@example.com'
                });

                // Search data
                const results = await cbd.search('john');`}
                    </code>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <a
                    href="/docs"
                    target="_blank"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Full Documentation
                  </a>
                  <a
                    href="https://github.com/codai-ecosystem"
                    target="_blank"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    GitHub Examples
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}