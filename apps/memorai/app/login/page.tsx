'use client'

import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login attempt:', { email, password })
    // Simulate login success
    localStorage.setItem('auth_token', 'demo-token')
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-violet-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-800 rounded-2xl mb-4">
            🧠
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Welcome to MEMORAI
          </h2>
          <p className="text-slate-400 mt-2">AI-Powered Memory Enhancement Platform</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md placeholder-slate-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md placeholder-slate-400 text-white focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Sign in
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => window.location.href = '/signup'}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              Don't have an account? Sign up
            </button>
          </div>
        </div>
        <div className="text-center">
          <p className="text-slate-400 text-sm">
            © 2025 MEMORAI. Part of the CODAI ecosystem.
          </p>
        </div>
      </div>
    </div>
  )
}
