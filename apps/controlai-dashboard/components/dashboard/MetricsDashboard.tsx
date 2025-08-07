'use client'

import React from 'react'

export function MetricsDashboard({
  data,
  loading = false,
  className = ''
}: {
  data?: any
  loading?: boolean
  className?: string
}) {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Metrics Dashboard</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          Metrics dashboard component - {data ? 'Data loaded' : 'coming soon'}
        </p>
      </div>
    </div>
  )
}

export function NotificationCenter({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">Notification center component - coming soon</p>
      </div>
    </div>
  )
}

export function CommandPalette({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Command Palette</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">Command palette component - coming soon</p>
      </div>
    </div>
  )
}
