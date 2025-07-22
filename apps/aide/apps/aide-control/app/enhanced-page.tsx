'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { AuthProvider } from '../lib/auth-context'
import { MainApplication } from '../components/MainApplication'
import { User } from '../lib/types/enhanced-types'

function DashboardPage() {
  const { user, loading } = useAuth()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [currentProjectId, setCurrentProjectId] = useState<string>('project-aide-enhancement')
  const [currentTeamId, setCurrentTeamId] = useState<string>('team-frontend-dev')

  useEffect(() => {
    if (user) {
      // Transform auth user to our User type
      const enhancedUser: User = {
        id: user.uid,
        name: user.displayName || user.email || 'User',
        email: user.email || '',
        avatar: user.photoURL || undefined,
        status: 'online'
      }
      setCurrentUser(enhancedUser)
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading AIDE Enhanced
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing your enterprise development environment...
          </p>
        </div>
      </div>
    )
  }

  if (!user || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to AIDE Enhanced
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your comprehensive AI-powered development platform
              </p>
            </div>
            
            <div className="space-y-4">
              <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0zM8.016 8.016v3.968L11.984 10 8.016 8.016z" clipRule="evenodd" />
                </svg>
                Continue with Demo
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
                </div>
              </div>
              
              <button className="w-full flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.89 2.742a.36.36 0 01.083.343c-.091.378-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.744-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
                Sign in with GitHub
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <MainApplication
      user={currentUser}
      currentProjectId={currentProjectId}
      currentTeamId={currentTeamId}
    />
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>
  )
}
