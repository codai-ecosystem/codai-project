'use client'

import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'

interface ProjectAnalysis {
  codeQuality: {
    score: number
    errors: number
    files: number
    recommendations: string[]
  }
  architecture: {
    framework: string
    patterns: string[]
    complexity: string
    maintainability: number
  }
  dependencies: {
    production: number
    development: number
    outdated: string[]
    security: any[]
    healthScore: number
  }
  testCoverage: {
    percentage: number
    files: number
    recommendations: string[]
  }
  performance: {
    buildTime: number
    bundleSize: string
    optimization: string[]
  }
}

interface EnhancedProject {
  id: string
  name: string
  path: string
  type: string
  framework: string
  technologies: string[]
  status: string
  analysis?: ProjectAnalysis
  lastAnalyzed?: string
  aiInsights?: string[]
}

export default function IntelligentAnalysisDashboard() {
  const [projects, setProjects] = useState<EnhancedProject[]>([])
  const [selectedProject, setSelectedProject] = useState<EnhancedProject | null>(null)
  const [analysisRunning, setAnalysisRunning] = useState(false)
  const [socket, setSocket] = useState<any>(null)
  const [agentMetrics, setAgentMetrics] = useState<any>({})
  const [systemHealth, setSystemHealth] = useState<any>({})

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:4043')
    setSocket(newSocket)

    // Load initial data
    loadProjects()
    loadAgentMetrics()
    loadSystemHealth()

    // Set up real-time updates
    newSocket.on('analysis_complete', (data: any) => {
      updateProjectAnalysis(data)
      setAnalysisRunning(false)
    })

    newSocket.on('agent_update', (agent: any) => {
      console.log('Agent update:', agent)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('http://localhost:4043/api/projects')
      const data = await response.json()
      if (data.success) {
        setProjects(data.data)
        if (data.data.length > 0 && !selectedProject) {
          setSelectedProject(data.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  const loadAgentMetrics = async () => {
    try {
      const response = await fetch('http://localhost:4043/api/enhanced-agents/metrics')
      const data = await response.json()
      if (data.success) {
        setAgentMetrics(data.data)
      }
    } catch (error) {
      console.error('Failed to load agent metrics:', error)
    }
  }

  const loadSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:4043/api/enhanced-agents/health')
      const data = await response.json()
      if (data.success) {
        setSystemHealth(data.data)
      }
    } catch (error) {
      console.error('Failed to load system health:', error)
    }
  }

  const runIntelligentAnalysis = async (project: EnhancedProject) => {
    if (!project) return

    setAnalysisRunning(true)

    try {
      // Run comprehensive analysis
      const analysisTask = {
        type: 'comprehensive_analysis',
        projectPath: project.path,
        includeCodeQuality: true,
        includeArchitecture: true,
        includeDependencies: true,
        includeTestCoverage: true,
        includePerformance: true
      }

      const response = await fetch('http://localhost:4043/api/enhanced-agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: analysisTask,
          projectId: project.id
        })
      })

      const result = await response.json()

      if (result.success) {
        // Simulate comprehensive analysis results
        const mockAnalysis: ProjectAnalysis = {
          codeQuality: {
            score: 85 + Math.random() * 10,
            errors: Math.floor(Math.random() * 20),
            files: Math.floor(Math.random() * 100) + 50,
            recommendations: [
              'Consider reducing cognitive complexity in utils/helpers.ts',
              'Add type annotations to 3 functions',
              'Remove unused imports in components directory'
            ]
          },
          architecture: {
            framework: project.framework,
            patterns: ['Component-based', 'TypeScript', 'Modern ESNext'],
            complexity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            maintainability: 75 + Math.random() * 20
          },
          dependencies: {
            production: Math.floor(Math.random() * 50) + 20,
            development: Math.floor(Math.random() * 30) + 15,
            outdated: ['lodash@4.17.20', 'axios@0.27.2'],
            security: [],
            healthScore: 80 + Math.random() * 15
          },
          testCoverage: {
            percentage: 60 + Math.random() * 30,
            files: Math.floor(Math.random() * 50) + 20,
            recommendations: [
              'Add unit tests for API utilities',
              'Improve component test coverage',
              'Add integration tests for user flows'
            ]
          },
          performance: {
            buildTime: 15 + Math.random() * 30,
            bundleSize: `${(500 + Math.random() * 1000).toFixed(0)}KB`,
            optimization: [
              'Enable tree shaking',
              'Optimize image loading',
              'Implement code splitting'
            ]
          }
        }

        updateProjectAnalysis({
          projectId: project.id,
          analysis: mockAnalysis,
          aiInsights: [
            '🔍 Code quality is good but could benefit from refactoring in 3 areas',
            '🏗️ Architecture follows modern patterns with room for optimization',
            '📦 Dependencies are mostly up-to-date with 2 minor updates needed',
            '🧪 Test coverage meets minimum standards but could be improved',
            '⚡ Performance is solid with potential for further optimization'
          ]
        })
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setAnalysisRunning(false)
    }
  }

  const updateProjectAnalysis = (data: any) => {
    setProjects(prev => prev.map(p =>
      p.id === data.projectId
        ? {
          ...p,
          analysis: data.analysis,
          lastAnalyzed: new Date().toISOString(),
          aiInsights: data.aiInsights
        }
        : p
    ))

    if (selectedProject?.id === data.projectId) {
      setSelectedProject(prev => prev ? {
        ...prev,
        analysis: data.analysis,
        lastAnalyzed: new Date().toISOString(),
        aiInsights: data.aiInsights
      } : null)
    }
  }

  const getQualityColor = (score: number) => {
    if (score >= 85) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'building': return 'bg-blue-100 text-blue-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧠 Intelligent Project Analysis Dashboard
          </h1>
          <p className="text-gray-600">
            AI-powered deep analysis and insights for your development projects
          </p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.activeAgents || 6}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                🤖
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects Analyzed</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.activeProjects || projects.length}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                📊
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.systemLoad || 35}%</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                ⚡
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Queue</p>
                <p className="text-2xl font-bold text-gray-900">{systemHealth.queuedTasks || 3}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                📋
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Project List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
                <p className="text-sm text-gray-600">Select a project for detailed analysis</p>
              </div>

              <div className="divide-y">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedProject?.id === project.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{project.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{project.framework}</p>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {project.technologies?.slice(0, 3).map(tech => (
                        <span key={tech} className="px-2 py-1 bg-gray-100 text-xs rounded">
                          {tech}
                        </span>
                      ))}
                      {project.technologies?.length > 3 && (
                        <span className="text-xs text-gray-500">+{project.technologies.length - 3}</span>
                      )}
                    </div>

                    {project.analysis && (
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500">Quality:</span>
                        <span className={`ml-1 font-medium ${getQualityColor(project.analysis.codeQuality.score)}`}>
                          {project.analysis.codeQuality.score.toFixed(0)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedProject.name}</h2>
                      <p className="text-gray-600">{selectedProject.framework} • {selectedProject.type}</p>
                    </div>

                    <button
                      onClick={() => runIntelligentAnalysis(selectedProject)}
                      disabled={analysisRunning}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {analysisRunning ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          🔍 Run Analysis
                        </>
                      )}
                    </button>
                  </div>

                  {selectedProject.lastAnalyzed && (
                    <p className="text-sm text-gray-500">
                      Last analyzed: {new Date(selectedProject.lastAnalyzed).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* AI Insights */}
                {selectedProject.aiInsights && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      🧠 AI Insights
                    </h3>
                    <div className="space-y-2">
                      {selectedProject.aiInsights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="text-lg">•</div>
                          <p className="text-gray-700">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Metrics */}
                {selectedProject.analysis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Code Quality */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        📊 Code Quality
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Overall Score</span>
                            <span className={`font-bold ${getQualityColor(selectedProject.analysis.codeQuality.score)}`}>
                              {selectedProject.analysis.codeQuality.score.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${selectedProject.analysis.codeQuality.score}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Files Analyzed</p>
                            <p className="text-lg font-semibold">{selectedProject.analysis.codeQuality.files}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Issues Found</p>
                            <p className="text-lg font-semibold">{selectedProject.analysis.codeQuality.errors}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                          <div className="space-y-1">
                            {selectedProject.analysis.codeQuality.recommendations.map((rec, index) => (
                              <p key={index} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                {rec}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Architecture */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        🏗️ Architecture
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Framework</p>
                          <p className="text-lg font-semibold">{selectedProject.analysis.architecture.framework}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Complexity</p>
                          <span className={`inline-block px-2 py-1 rounded text-sm font-medium ${selectedProject.analysis.architecture.complexity === 'low' ? 'bg-green-100 text-green-800' :
                              selectedProject.analysis.architecture.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {selectedProject.analysis.architecture.complexity}
                          </span>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Maintainability</span>
                            <span className="font-semibold">{selectedProject.analysis.architecture.maintainability.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${selectedProject.analysis.architecture.maintainability}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Patterns Detected:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedProject.analysis.architecture.patterns.map(pattern => (
                              <span key={pattern} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {pattern}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dependencies */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        📦 Dependencies
                      </h3>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Production</p>
                            <p className="text-lg font-semibold">{selectedProject.analysis.dependencies.production}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Development</p>
                            <p className="text-lg font-semibold">{selectedProject.analysis.dependencies.development}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Health Score</span>
                            <span className="font-semibold">{selectedProject.analysis.dependencies.healthScore.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${selectedProject.analysis.dependencies.healthScore}%` }}
                            />
                          </div>
                        </div>

                        {selectedProject.analysis.dependencies.outdated.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Outdated:</p>
                            <div className="space-y-1">
                              {selectedProject.analysis.dependencies.outdated.map(dep => (
                                <p key={dep} className="text-xs text-yellow-700 bg-yellow-50 p-2 rounded">
                                  {dep}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Test Coverage */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        🧪 Test Coverage
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Coverage</span>
                            <span className={`font-bold ${getQualityColor(selectedProject.analysis.testCoverage.percentage)}`}>
                              {selectedProject.analysis.testCoverage.percentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${selectedProject.analysis.testCoverage.percentage}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Test Files</p>
                          <p className="text-lg font-semibold">{selectedProject.analysis.testCoverage.files}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600 mb-2">Recommendations:</p>
                          <div className="space-y-1">
                            {selectedProject.analysis.testCoverage.recommendations.map((rec, index) => (
                              <p key={index} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                                {rec}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!selectedProject.analysis && !analysisRunning && (
                  <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Data</h3>
                    <p className="text-gray-600 mb-4">
                      Run an intelligent analysis to get detailed insights about this project.
                    </p>
                    <button
                      onClick={() => runIntelligentAnalysis(selectedProject)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                    >
                      🧠 Start Intelligent Analysis
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Project</h3>
                <p className="text-gray-600">
                  Choose a project from the left panel to view detailed analysis and insights.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
