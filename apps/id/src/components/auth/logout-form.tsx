'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function LogoutForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        // Clear client-side storage
        localStorage.removeItem('codai_auth_token')
        sessionStorage.clear()

        // Redirect to login
        window.location.href = '/login?message=Logged out successfully'
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      // Even if the API fails, clear client-side tokens and redirect
      localStorage.removeItem('codai_auth_token')
      window.location.href = '/login?message=Logged out'
    }
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full">
      <div className="text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Sign Out
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Are you sure you want to sign out? This will log you out of all CODAI applications.
        </p>

        <div className="flex space-x-4">
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </div>
    </div>
  )
}
