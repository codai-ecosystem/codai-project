import React, { useState, useEffect } from 'react'
import { Monitor, Users, FolderKanban, Activity, Moon, Sun } from 'lucide-react'
import ProjectOverview from './components/ProjectOverview'
import TaskBoard from './components/TaskBoard'
import AgentMonitor from './components/AgentMonitor'
import MetricsDashboard from './components/MetricsDashboard'
import { useControlAIApi } from './hooks/useControlAIApi'

type ActiveView = 'overview' | 'tasks' | 'agents' | 'metrics'

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('overview')
  const [darkMode, setDarkMode] = useState(false)
  const { dashboardData, loading, error, refetch } = useControlAIApi()

  useEffect(() => {
    // Check for dark mode preference
    const isDark = localStorage.getItem('darkMode') === 'true'
    setDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const renderActiveView = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-medium">Error loading dashboard data</h3>
          <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
          <button 
            onClick={refetch}
            className="mt-2 btn btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      )
    }

    switch (activeView) {
      case 'overview':
        return <ProjectOverview data={dashboardData} />
      case 'tasks':
        return <TaskBoard data={dashboardData} />
      case 'agents':
        return <AgentMonitor data={dashboardData} />
      case 'metrics':
        return <MetricsDashboard data={dashboardData} />
      default:
        return <ProjectOverview data={dashboardData} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                ControlAI Dashboard
              </h1>
              {dashboardData && (
                <div className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                  {dashboardData.metrics.totalProjects} projects • {dashboardData.metrics.totalAgents} agents
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={refetch}
                className="btn btn-secondary"
                disabled={loading}
              >
                <Activity className="w-4 h-4 mr-2" />
                Refresh
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="btn btn-secondary"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Projects', icon: FolderKanban },
              { id: 'tasks', label: 'Tasks', icon: Monitor },
              { id: 'agents', label: 'Agents', icon: Users },
              { id: 'metrics', label: 'Metrics', icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as ActiveView)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeView === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveView()}
      </main>
    </div>
  )
}

export default App
