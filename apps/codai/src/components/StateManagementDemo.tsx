import React from 'react'
import { useCodaiStore, useAuth, useProjects, useUI, useNotifications } from '../store'

/**
 * State Management Demo Component
 * Demonstrates Zustand state management integration with React 18.3.1
 */
export function StateManagementDemo() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { projects, selectedProjectId, addProject, selectProject } = useProjects()
  const { theme, sidebarOpen, toggleSidebar, setTheme } = useUI()
  const { notifications, addNotification, removeNotification } = useNotifications()

  const handleLogin = () => {
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@codai.dev',
      role: 'developer' as const,
      preferences: {
        theme: 'dark' as const,
        language: 'en',
        notifications: true
      }
    }
    login(mockUser)
    addNotification({
      type: 'success',
      title: 'Login Successful',
      message: 'Welcome back to CODAI!'
    })
  }

  const handleLogout = () => {
    logout()
    addNotification({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been successfully logged out'
    })
  }

  const handleAddProject = () => {
    const newProject = {
      id: `project-${Date.now()}`,
      name: `Project ${projects.length + 1}`,
      description: 'A new project created from state management demo',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      technologies: ['React', 'TypeScript', 'Zustand'],
      team: [user?.id || 'anonymous'],
      progress: Math.floor(Math.random() * 100)
    }
    addProject(newProject)
    addNotification({
      type: 'success',
      title: 'Project Created',
      message: `${newProject.name} has been created successfully`
    })
  }

  const handleThemeToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          State Management Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This demo showcases Zustand state management with React 18.3.1 compatibility,
          including persistence, concurrent rendering support, and TypeScript integration.
        </p>

        {/* Authentication Section */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Authentication State
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Status: {isAuthenticated ? '✅ Authenticated' : '❌ Not Authenticated'}
            </span>
            {user && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                User: {user.name} ({user.email})
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleLogin}
              disabled={isAuthenticated}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Login
            </button>
            <button
              onClick={handleLogout}
              disabled={!isAuthenticated}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Projects ({projects.length})
          </h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAddProject}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Add Project
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => selectProject(project.id)}
                className={`p-3 border rounded cursor-pointer transition-colors ${
                  selectedProjectId === project.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white">
                  {project.name}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Progress: {project.progress}% • {project.status}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {project.technologies.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UI State Section */}
        <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            UI State
          </h3>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Theme: {theme}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Sidebar: {sidebarOpen ? 'Open' : 'Closed'}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleThemeToggle}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Toggle Theme
            </button>
            <button
              onClick={toggleSidebar}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Toggle Sidebar
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Notifications ({notifications.length})
          </h3>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No notifications
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded flex justify-between items-start ${
                    notification.type === 'success'
                      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                      : notification.type === 'error'
                      ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                      : notification.type === 'warning'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                      : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                  }`}
                >
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(notification.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Store Debug Info */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
            Store Debug Information
          </summary>
          <pre className="text-xs text-gray-600 dark:text-gray-400 mt-2 overflow-auto">
            {JSON.stringify({
              user: user ? { ...user, preferences: user.preferences } : null,
              projectsCount: projects.length,
              selectedProjectId,
              theme,
              sidebarOpen,
              notificationsCount: notifications.length
            }, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}

export default StateManagementDemo