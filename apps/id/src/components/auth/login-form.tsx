'use client'

import React from 'react'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams?.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      // Set authentication cookies
      document.cookie = `codai_auth_token=${data.token}; Max-Age=900; Secure; SameSite=Lax; Domain=.codai.ro`
      document.cookie = `codai_refresh_token=${data.refreshToken}; Max-Age=604800; Secure; SameSite=Lax; Domain=.codai.ro`

      // Redirect to the requested URL or dashboard
      const redirectTo = decodeURIComponent(redirectUrl)
      window.location.href = redirectTo
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
        Sign In
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email || !password}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="text-center space-y-2">
          <a
            href="/forgot"
            className="block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Forgot your password?
          </a>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              Sign up
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

