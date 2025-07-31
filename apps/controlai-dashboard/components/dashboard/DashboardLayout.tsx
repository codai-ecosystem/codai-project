'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ErrorBoundary } from 'react-error-boundary'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { StatsCards } from './StatsCards'
import { ProjectOverview } from './ProjectOverview'
import { TaskBoard } from './TaskBoard'
import { AgentMonitor } from './AgentMonitor'
import { MetricsDashboard } from './MetricsDashboard'
import { NotificationCenter } from './NotificationCenter'
import { CommandPalette } from './CommandPalette'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ErrorDisplay } from '../ui/ErrorDisplay'
import { useDashboard } from '@/lib/hooks/useControlAI'
import { useRealTimeUpdates } from '@/lib/hooks/useControlAI'
import { useDashboardStore, useActiveView, useUIState } from '@/lib/stores/dashboard-store'

// Page transition variants
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const pageTransitionConfig = {
  duration: 0.3,
  ease: 'easeInOut'
}

// Main dashboard layout component
export function DashboardLayout() {
  const activeView = useActiveView()
  const { sidebarCollapsed } = useUIState()
  const { data, loading, error, refresh } = useDashboard()
  const { startRealTimeUpdates } = useRealTimeUpdates()
  
  // Initialize real-time updates
  useEffect(() => {
    const cleanup = startRealTimeUpdates()
    return cleanup
  }, [startRealTimeUpdates])

  // Error boundary fallback
  const ErrorFallback = ({ error, resetErrorBoundary }: any) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <ErrorDisplay 
        error={error} 
        onRetry={resetErrorBoundary}
        title="Dashboard Error"
        description="Something went wrong while loading the dashboard"
      />
    </div>
  )

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading Dashboard..." />
      </div>
    )
  }

  // Error state (when no data is available)
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <ErrorDisplay 
          error={error} 
          onRetry={refresh}
          title="Failed to Load Dashboard"
          description="There was an error loading the dashboard data"
        />
      </div>
    )
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {/* Header */}
          <Header />
          
          {/* Main content */}
          <main className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageTransition}
                transition={pageTransitionConfig}
                className="space-y-6"
              >
                {activeView === 'overview' && (
                  <OverviewView data={data} loading={loading} error={error} />
                )}
                {activeView === 'projects' && (
                  <ProjectsView data={data} loading={loading} error={error} />
                )}
                {activeView === 'tasks' && (
                  <TasksView data={data} loading={loading} error={error} />
                )}
                {activeView === 'agents' && (
                  <AgentsView data={data} loading={loading} error={error} />
                )}
                {activeView === 'metrics' && (
                  <MetricsView data={data} loading={loading} error={error} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        
        {/* Global UI components */}
        <NotificationCenter />
        <CommandPalette />
      </div>
    </ErrorBoundary>
  )
}

// Individual view components
function OverviewView({ data, loading, error }: any) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome to your ControlAI command center
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Refresh Data
          </motion.button>
        </div>
      </div>

      {/* Stats cards */}
      <StatsCards data={data?.metrics} loading={loading} />
      
      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ProjectOverview 
            data={data} 
            loading={loading} 
            maxItems={6}
            showCreateButton={true}
          />
        </motion.div>
        
        {/* Active agents */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AgentMonitor 
            data={data} 
            loading={loading}
            maxItems={6}
            showStatusOnly={true}
          />
        </motion.div>
      </div>
      
      {/* Task summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <TaskBoard 
          data={data} 
          loading={loading}
          compact={true}
          maxItemsPerColumn={3}
        />
      </motion.div>
    </div>
  )
}

function ProjectsView({ data, loading, error }: any) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track your project portfolio
          </p>
        </div>
      </div>

      <ProjectOverview data={data} loading={loading} />
    </div>
  )
}

function TasksView({ data, loading, error }: any) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Organize and track task progress across projects
          </p>
        </div>
      </div>

      <TaskBoard data={data} loading={loading} />
    </div>
  )
}

function AgentsView({ data, loading, error }: any) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Agents
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage your AI agent workforce
          </p>
        </div>
      </div>

      <AgentMonitor data={data} loading={loading} />
    </div>
  )
}

function MetricsView({ data, loading, error }: any) {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Metrics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Insights and performance analytics for your projects
          </p>
        </div>
      </div>

      <MetricsDashboard data={data?.metrics} loading={loading} />
    </div>
  )
}

export default DashboardLayout
