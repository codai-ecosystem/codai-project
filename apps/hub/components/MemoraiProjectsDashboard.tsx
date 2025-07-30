/**
 * Memorai-Powered Projects Dashboard Component
 * Demonstrates the integration of @codai/memorai with the Hub app
 */

'use client'

import React, { useState } from 'react'
import { useProjects, useMemoraiInit } from '../lib/hooks/useMemoraiIntegration'
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
  Activity
} from 'lucide-react'

interface ProjectCardProps {
  project: any
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
}

function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
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

        {project.aiInsights && (
          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Risk: {project.aiInsights.riskScore}%
            </span>
            <span>AI Tasks: {project.aiInsights.automatedTasks}</span>
          </div>
        )}

        <div className="flex gap-2">
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
        </div>
      </CardContent>
    </Card>
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
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
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
      budget: {
        allocated: 0,
        spent: 0,
        remaining: 0
      },
      tags: [],
      aiInsights: {
        riskScore: 25,
        recommendations: ['Project just created - start by adding team members and tasks'],
        automatedTasks: 0,
        predictedCompletion: new Date(formData.dueDate)
      }
    }

    onSubmit(project)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Project</CardTitle>
        <CardDescription>Add a new project to your workspace</CardDescription>
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

export function MemoraiProjectsDashboard() {
  const { initialized, initializing, error: initError } = useMemoraiInit()
  const { projects, loading, error, createProject, updateProject, deleteProject, searchProjects, refresh } = useProjects()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Handle initialization errors
  if (initError) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h3 className="font-semibold text-red-600">Memorai Initialization Error</h3>
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
              <h3 className="font-semibold">Initializing Memorai Services</h3>
              <p className="text-sm text-muted-foreground">Setting up database and storage connections...</p>
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
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">
            Manage your projects with AI-powered insights using Memorai
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

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
            <TrendingUp className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-2xl font-bold">
                {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(projects.length, 1))}%
              </p>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="Search projects with AI..."
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
                  Create your first project to get started with AI-powered project management
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
  )
}
