#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// List of all apps that need authentication flow
const apps = [
    'acasai', 'admin', 'aide', 'ajutai', 'analizai', 'bancai', 'conversai',
    'cumparai', 'curtai', 'dash', 'dexai', 'docs', 'donai', 'explorer',
    'fabricai', 'glass', 'hub', 'id', 'jucai', 'kodex', 'legalizai',
    'logai', 'marketai', 'memorai', 'metu', 'mobile', 'mod', 'muzicai',
    'prezentai', 'publicai', 'romai', 'sociai', 'stocai', 'studiai',
    'sunai', 'talentai', 'tools', 'wallet', 'x'
];

// Brand colors for each app
const brandColors = {
    acasai: { primary: '#10b981', secondary: '#059669', accent: '#34d399' }, // emerald
    admin: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' }, // violet
    aide: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' }, // cyan
    ajutai: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' }, // amber
    analizai: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }, // red
    bancai: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' }, // blue
    conversai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' }, // green
    cumparai: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' }, // pink
    curtai: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' }, // violet
    dash: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' }, // indigo
    dexai: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' }, // cyan
    docs: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' }, // slate
    donai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' }, // green
    explorer: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' }, // amber
    fabricai: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' }, // pink
    glass: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' }, // cyan
    hub: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' }, // violet
    id: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }, // red
    jucai: { primary: '#10b981', secondary: '#059669', accent: '#34d399' }, // emerald
    kodex: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' }, // slate
    legalizai: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' }, // blue
    logai: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' }, // indigo
    marketai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' }, // green
    memorai: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' }, // violet
    metu: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }, // red
    mobile: { primary: '#06b6d4', secondary: '#0891b2', accent: '#67e8f9' }, // cyan
    mod: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' }, // slate
    muzicai: { primary: '#ec4899', secondary: '#db2777', accent: '#f472b6' }, // pink
    prezentai: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' }, // amber
    publicai: { primary: '#10b981', secondary: '#059669', accent: '#34d399' }, // emerald
    romai: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' }, // red
    sociai: { primary: '#3b82f6', secondary: '#2563eb', accent: '#60a5fa' }, // blue
    stocai: { primary: '#22c55e', secondary: '#16a34a', accent: '#4ade80' }, // green
    studiai: { primary: '#8b5cf6', secondary: '#7c3aed', accent: '#a78bfa' }, // violet
    sunai: { primary: '#f59e0b', secondary: '#d97706', accent: '#fbbf24' }, // amber
    talentai: { primary: '#6366f1', secondary: '#4f46e5', accent: '#818cf8' }, // indigo
    tools: { primary: '#64748b', secondary: '#475569', accent: '#94a3b8' }, // slate
    wallet: { primary: '#10b981', secondary: '#059669', accent: '#34d399' }, // emerald
    x: { primary: '#ef4444', secondary: '#dc2626', accent: '#f87171' } // red
};

// Template files content
const templates = {
    authWrapper: `'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface AuthWrapperProps {
  children: React.ReactNode
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Authentication check
  useEffect(() => {
    const checkAuth = () => {
      // Check for auth token in localStorage
      const token = localStorage.getItem('auth_token')
      const isLoggedIn = !!token
      
      setIsAuthenticated(isLoggedIn)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  // Route protection logic
  useEffect(() => {
    if (isLoading || !pathname) return

    const publicRoutes = ['/landing', '/auth/login', '/auth/register', '/auth/forgot-password']
    const isPublicRoute = publicRoutes.includes(pathname)

    // If on root path, redirect based on auth status
    if (pathname === '/') {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/landing')
      }
      return
    }

    // If authenticated and on public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.push('/dashboard')
      return
    }

    // If not authenticated and on protected route, redirect to landing
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/landing')
      return
    }
  }, [isAuthenticated, pathname, router, isLoading])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading {{APP_NAME}}...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}`,

    rootPage: `'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // This page should not be reached due to AuthWrapper redirects
    // But provide fallback logic just in case
    const token = localStorage.getItem('auth_token')
    
    if (token) {
      router.push('/dashboard')
    } else {
      router.push('/landing')
    }
  }, [router])

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-lg">Redirecting...</p>
      </div>
    </div>
  )
}`,

    landingPage: `'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Code, Users, Zap } from 'lucide-react'

export default function LandingPage() {
  const handleGetStarted = () => {
    window.location.href = '/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-{{PRIMARY_COLOR}}-900 to-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-{{PRIMARY_COLOR}}-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1]
            }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/3 right-1/4 w-96 h-96 bg-{{SECONDARY_COLOR}}-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
            animate={{
              x: [0, -50, 100, 0],
              y: [0, 50, -100, 0],
              scale: [1, 0.8, 1.2, 1]
            }}
            transition={{ duration: 25, repeat: Infinity, delay: 5 }}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center space-x-3"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-{{PRIMARY_COLOR}}-400 to-{{SECONDARY_COLOR}}-400 bg-clip-text text-transparent">
                {{APP_NAME_UPPER}}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex items-center space-x-4"
            >
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="px-4 py-2 text-{{PRIMARY_COLOR}}-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="px-6 py-2 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-lg hover:from-{{PRIMARY_COLOR}}-600 hover:to-{{SECONDARY_COLOR}}-700 transition-all duration-300 transform hover:scale-105"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-{{PRIMARY_COLOR}}-400 via-{{SECONDARY_COLOR}}-400 to-{{ACCENT_COLOR}}-400 bg-clip-text text-transparent">
                {{APP_TITLE}}
              </span>
              <br />
              <span className="text-white">Platform</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
            >
              {{APP_DESCRIPTION}}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
            >
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-xl hover:from-{{PRIMARY_COLOR}}-600 hover:to-{{SECONDARY_COLOR}}-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
              >
                <span className="text-lg font-semibold">Get Started Free</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => window.location.href = '#features'}
                className="px-8 py-4 border border-gray-600 rounded-xl hover:border-{{PRIMARY_COLOR}}-400 hover:bg-{{PRIMARY_COLOR}}-400/10 transition-all duration-300"
              >
                <span className="text-lg">Learn More</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Why Choose {{APP_NAME_UPPER}}?
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Experience the future of {{APP_CATEGORY}} with our comprehensive platform
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Code className="w-8 h-8" />,
              title: '{{FEATURE_1_TITLE}}',
              description: '{{FEATURE_1_DESC}}'
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: '{{FEATURE_2_TITLE}}',
              description: '{{FEATURE_2_DESC}}'
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: '{{FEATURE_3_TITLE}}',
              description: '{{FEATURE_3_DESC}}'
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 text-center hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-{{PRIMARY_COLOR}}-600/20 to-{{SECONDARY_COLOR}}-600/20 backdrop-blur-xl rounded-3xl border border-white/10 p-12 text-center"
        >
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your {{APP_CATEGORY}} Workflow?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using {{APP_NAME_UPPER}} to achieve better results faster.
          </p>
          <button
            onClick={handleGetStarted}
            className="group px-8 py-4 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-xl hover:from-{{PRIMARY_COLOR}}-600 hover:to-{{SECONDARY_COLOR}}-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <span className="text-lg font-semibold">Start Building Today</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-800">
        <div className="text-center text-gray-400">
          <p>&copy; 2025 {{APP_NAME_UPPER}}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}`,

    loginPage: `'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Code, ArrowLeft, Github, Mail } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login - replace with actual auth logic
    setTimeout(() => {
      localStorage.setItem('auth_token', 'mock_jwt_token_' + Date.now())
      window.location.href = '/dashboard'
    }, 2000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-{{PRIMARY_COLOR}}-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-{{PRIMARY_COLOR}}-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, 50, -25, 0],
            y: [0, -50, 25, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-{{SECONDARY_COLOR}}-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            x: [0, -25, 50, 0],
            y: [0, 25, -50, 0],
            scale: [1, 0.9, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, delay: 3 }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/landing"
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-2xl flex items-center justify-center">
                <Code className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-300">Sign in to your {{APP_NAME_UPPER}} account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-{{PRIMARY_COLOR}}-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-{{PRIMARY_COLOR}}-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-{{PRIMARY_COLOR}}-600 bg-white/5 border-white/20 rounded focus:ring-{{PRIMARY_COLOR}}-500 focus:ring-2"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-{{PRIMARY_COLOR}}-400 hover:text-{{PRIMARY_COLOR}}-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-{{PRIMARY_COLOR}}-500 to-{{SECONDARY_COLOR}}-600 rounded-xl text-white font-semibold hover:from-{{PRIMARY_COLOR}}-600 hover:to-{{SECONDARY_COLOR}}-700 focus:outline-none focus:ring-2 focus:ring-{{PRIMARY_COLOR}}-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-600"></div>
            <span className="px-4 text-gray-400 text-sm">or continue with</span>
            <div className="flex-1 border-t border-gray-600"></div>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-all">
              <Github className="w-5 h-5 text-white" />
              <span className="text-white font-medium">GitHub</span>
            </button>
            <button className="flex items-center justify-center space-x-2 py-3 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-all">
              <Mail className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Google</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-300">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-{{PRIMARY_COLOR}}-400 hover:text-{{PRIMARY_COLOR}}-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}`
};

// App metadata
const appMetadata = {
    acasai: {
        title: 'Real Estate Intelligence',
        description: 'AI-powered real estate analysis and property management platform with market insights and automated valuation.',
        category: 'Real Estate',
        features: {
            feature1: { title: 'Market Analysis', desc: 'Advanced property market analysis with AI-driven price predictions' },
            feature2: { title: 'Property Management', desc: 'Comprehensive property portfolio management and maintenance tracking' },
            feature3: { title: 'Investment Insights', desc: 'Smart investment recommendations based on market trends and data' }
        }
    },
    admin: {
        title: 'Administrative Control',
        description: 'Comprehensive administrative dashboard for system management, user control, and platform oversight.',
        category: 'Administration',
        features: {
            feature1: { title: 'User Management', desc: 'Complete user lifecycle management with role-based access control' },
            feature2: { title: 'System Monitoring', desc: 'Real-time system health monitoring and performance analytics' },
            feature3: { title: 'Configuration Control', desc: 'Centralized platform configuration and settings management' }
        }
    },
    aide: {
        title: 'AI Development Assistant',
        description: 'Intelligent development assistant providing code suggestions, debugging help, and project guidance.',
        category: 'Development',
        features: {
            feature1: { title: 'Code Intelligence', desc: 'AI-powered code analysis and intelligent suggestions for better development' },
            feature2: { title: 'Debug Assistant', desc: 'Advanced debugging support with automated error detection and solutions' },
            feature3: { title: 'Project Guidance', desc: 'Strategic project guidance and architecture recommendations' }
        }
    },
    ajutai: {
        title: 'Help & Support',
        description: 'Comprehensive help and support system with AI-powered assistance and community-driven solutions.',
        category: 'Support',
        features: {
            feature1: { title: 'Smart Help', desc: 'AI-driven help system that understands context and provides relevant solutions' },
            feature2: { title: 'Community Support', desc: 'Community-driven knowledge base with peer-to-peer assistance' },
            feature3: { title: 'Live Assistance', desc: 'Real-time support with expert technicians and automated guidance' }
        }
    },
    analizai: {
        title: 'Analytics Intelligence',
        description: 'Advanced analytics platform with machine learning insights, data visualization, and predictive modeling.',
        category: 'Analytics',
        features: {
            feature1: { title: 'Predictive Analytics', desc: 'Advanced machine learning models for accurate future predictions' },
            feature2: { title: 'Data Visualization', desc: 'Interactive dashboards and charts for comprehensive data exploration' },
            feature3: { title: 'Real-time Insights', desc: 'Live data processing with instant insights and automated alerts' }
        }
    },
    bancai: {
        title: 'Banking Intelligence',
        description: 'AI-powered banking and financial services platform with fraud detection and automated analysis.',
        category: 'Finance',
        features: {
            feature1: { title: 'Fraud Detection', desc: 'Advanced AI algorithms for real-time fraud detection and prevention' },
            feature2: { title: 'Risk Assessment', desc: 'Comprehensive risk analysis and credit scoring with machine learning' },
            feature3: { title: 'Automated Banking', desc: 'Intelligent automation for banking operations and customer service' }
        }
    },
    conversai: {
        title: 'Conversation Intelligence',
        description: 'Advanced conversation AI platform with natural language processing and intelligent chat capabilities.',
        category: 'Communication',
        features: {
            feature1: { title: 'Natural Language', desc: 'Advanced NLP for human-like conversation understanding and responses' },
            feature2: { title: 'Multi-language Support', desc: 'Global communication with real-time translation and localization' },
            feature3: { title: 'Context Awareness', desc: 'Intelligent context retention for meaningful long-form conversations' }
        }
    },
    cumparai: {
        title: 'Shopping Intelligence',
        description: 'Smart shopping assistant with price comparison, deal finding, and purchase optimization.',
        category: 'E-commerce',
        features: {
            feature1: { title: 'Price Comparison', desc: 'Real-time price monitoring across multiple retailers and platforms' },
            feature2: { title: 'Deal Discovery', desc: 'AI-powered deal hunting with personalized discount recommendations' },
            feature3: { title: 'Purchase Optimization', desc: 'Smart buying strategies and timing recommendations for maximum savings' }
        }
    },
    curtai: {
        title: 'Legal Intelligence',
        description: 'Legal technology platform with document analysis, case management, and compliance automation.',
        category: 'Legal',
        features: {
            feature1: { title: 'Document Analysis', desc: 'AI-powered legal document review and analysis with clause detection' },
            feature2: { title: 'Case Management', desc: 'Comprehensive case tracking and legal workflow automation' },
            feature3: { title: 'Compliance Monitor', desc: 'Automated compliance monitoring and regulatory requirement tracking' }
        }
    },
    dash: {
        title: 'Dashboard Central',
        description: 'Unified dashboard platform for data visualization, monitoring, and business intelligence.',
        category: 'Business Intelligence',
        features: {
            feature1: { title: 'Unified Views', desc: 'Centralized dashboards combining data from multiple sources and systems' },
            feature2: { title: 'Real-time Monitoring', desc: 'Live data feeds with instant alerts and threshold monitoring' },
            feature3: { title: 'Custom Widgets', desc: 'Flexible dashboard customization with drag-and-drop widget creation' }
        }
    },
    dexai: {
        title: 'Exchange Intelligence',
        description: 'Cryptocurrency and trading platform with AI-powered market analysis and automated trading.',
        category: 'Trading',
        features: {
            feature1: { title: 'Market Analysis', desc: 'Advanced crypto market analysis with AI-driven trading signals' },
            feature2: { title: 'Automated Trading', desc: 'Intelligent trading bots with risk management and strategy optimization' },
            feature3: { title: 'Portfolio Management', desc: 'Smart portfolio diversification and performance tracking' }
        }
    },
    docs: {
        title: 'Documentation Hub',
        description: 'Comprehensive documentation platform with collaborative editing and knowledge management.',
        category: 'Documentation',
        features: {
            feature1: { title: 'Collaborative Editing', desc: 'Real-time collaborative document creation and editing capabilities' },
            feature2: { title: 'Knowledge Base', desc: 'Structured knowledge management with search and categorization' },
            feature3: { title: 'Version Control', desc: 'Advanced document versioning with change tracking and approval workflows' }
        }
    },
    donai: {
        title: 'Donation Platform',
        description: 'AI-powered donation and fundraising platform with impact tracking and donor management.',
        category: 'Non-profit',
        features: {
            feature1: { title: 'Impact Tracking', desc: 'Comprehensive donation impact measurement and transparency reporting' },
            feature2: { title: 'Donor Management', desc: 'Advanced donor relationship management with personalized engagement' },
            feature3: { title: 'Campaign Optimization', desc: 'AI-driven fundraising campaign optimization and audience targeting' }
        }
    },
    explorer: {
        title: 'Data Explorer',
        description: 'Advanced data exploration and discovery platform with interactive visualization and mining tools.',
        category: 'Data Science',
        features: {
            feature1: { title: 'Data Discovery', desc: 'Intelligent data exploration with automated pattern recognition' },
            feature2: { title: 'Interactive Viz', desc: 'Dynamic data visualization with real-time interaction capabilities' },
            feature3: { title: 'Mining Tools', desc: 'Advanced data mining algorithms for insight extraction and analysis' }
        }
    },
    fabricai: {
        title: 'Content Creation',
        description: 'AI-powered content creation platform for text, images, and multimedia generation.',
        category: 'Content Creation',
        features: {
            feature1: { title: 'Text Generation', desc: 'Advanced AI text creation for articles, blogs, and marketing content' },
            feature2: { title: 'Image Creation', desc: 'AI-powered image generation and editing with style customization' },
            feature3: { title: 'Multimedia Studio', desc: 'Complete multimedia creation suite with video and audio generation' }
        }
    },
    glass: {
        title: 'Interface Design',
        description: 'Modern glassmorphism UI framework with advanced design components and animations.',
        category: 'Design',
        features: {
            feature1: { title: 'Glassmorphism UI', desc: 'Beautiful glass-effect interface components with modern aesthetics' },
            feature2: { title: 'Animation Library', desc: 'Rich animation framework for smooth and engaging user interactions' },
            feature3: { title: 'Design System', desc: 'Comprehensive design system with consistent patterns and guidelines' }
        }
    },
    hub: {
        title: 'Integration Hub',
        description: 'Central integration platform connecting multiple services and managing data flow.',
        category: 'Integration',
        features: {
            feature1: { title: 'Service Integration', desc: 'Seamless connection between multiple services and external APIs' },
            feature2: { title: 'Data Orchestration', desc: 'Intelligent data flow management and transformation pipelines' },
            feature3: { title: 'Workflow Automation', desc: 'Advanced workflow automation with conditional logic and triggers' }
        }
    },
    id: {
        title: 'Identity Management',
        description: 'Secure identity and access management platform with multi-factor authentication.',
        category: 'Security',
        features: {
            feature1: { title: 'Identity Verification', desc: 'Advanced identity verification with biometric and document validation' },
            feature2: { title: 'Access Control', desc: 'Granular access control with role-based permissions and policies' },
            feature3: { title: 'Multi-factor Auth', desc: 'Comprehensive multi-factor authentication with various security methods' }
        }
    },
    jucai: {
        title: 'Gaming Intelligence',
        description: 'AI-powered gaming platform with intelligent gameplay assistance and community features.',
        category: 'Gaming',
        features: {
            feature1: { title: 'Game Intelligence', desc: 'AI-powered gameplay assistance and strategy recommendations' },
            feature2: { title: 'Community Hub', desc: 'Social gaming features with tournaments and community challenges' },
            feature3: { title: 'Performance Analytics', desc: 'Detailed gaming performance analysis and improvement suggestions' }
        }
    },
    kodex: {
        title: 'Code Management',
        description: 'Advanced code repository and development workflow management with AI-powered insights.',
        category: 'Development',
        features: {
            feature1: { title: 'Code Intelligence', desc: 'AI-powered code analysis and quality assessment tools' },
            feature2: { title: 'Workflow Management', desc: 'Streamlined development workflows with automated testing and deployment' },
            feature3: { title: 'Collaboration Tools', desc: 'Advanced team collaboration features for distributed development' }
        }
    },
    legalizai: {
        title: 'Legal Automation',
        description: 'Automated legal document processing and compliance management with AI-powered analysis.',
        category: 'Legal Tech',
        features: {
            feature1: { title: 'Document Automation', desc: 'Automated legal document generation and template management' },
            feature2: { title: 'Compliance Tracking', desc: 'Real-time compliance monitoring and regulatory requirement tracking' },
            feature3: { title: 'Legal Research', desc: 'AI-powered legal research with case law analysis and precedent finding' }
        }
    },
    logai: {
        title: 'Log Intelligence',
        description: 'Advanced log analysis and monitoring platform with AI-powered anomaly detection.',
        category: 'DevOps',
        features: {
            feature1: { title: 'Log Analysis', desc: 'Intelligent log parsing and analysis with automated pattern recognition' },
            feature2: { title: 'Anomaly Detection', desc: 'AI-powered anomaly detection for proactive issue identification' },
            feature3: { title: 'Alert Management', desc: 'Smart alerting system with context-aware notifications and escalation' }
        }
    },
    marketai: {
        title: 'Marketing Intelligence',
        description: 'AI-driven marketing automation platform with campaign optimization and audience targeting.',
        category: 'Marketing',
        features: {
            feature1: { title: 'Campaign Optimization', desc: 'AI-driven campaign optimization with performance prediction and tuning' },
            feature2: { title: 'Audience Targeting', desc: 'Advanced audience segmentation and personalized targeting strategies' },
            feature3: { title: 'Content Strategy', desc: 'Intelligent content planning and optimization for maximum engagement' }
        }
    },
    memorai: {
        title: 'Memory Management',
        description: 'Advanced memory and context management system with intelligent data organization.',
        category: 'Data Management',
        features: {
            feature1: { title: 'Context Awareness', desc: 'Intelligent context understanding and relationship mapping' },
            feature2: { title: 'Memory Organization', desc: 'Advanced memory structuring with semantic search and retrieval' },
            feature3: { title: 'Data Intelligence', desc: 'Smart data insights with automated pattern recognition and analysis' }
        }
    },
    metu: {
        title: 'Desktop Application',
        description: 'Native desktop application with cross-platform compatibility and advanced system integration.',
        category: 'Desktop Software',
        features: {
            feature1: { title: 'Native Performance', desc: 'Optimized native performance with full system resource utilization' },
            feature2: { title: 'Cross-platform', desc: 'Seamless operation across Windows, macOS, and Linux platforms' },
            feature3: { title: 'System Integration', desc: 'Deep system integration with OS-level features and notifications' }
        }
    },
    mobile: {
        title: 'Mobile Platform',
        description: 'Comprehensive mobile application suite with cross-platform compatibility and native features.',
        category: 'Mobile',
        features: {
            feature1: { title: 'Cross-platform', desc: 'Universal mobile app supporting both iOS and Android platforms' },
            feature2: { title: 'Native Features', desc: 'Full access to device capabilities and native mobile functionality' },
            feature3: { title: 'Offline Support', desc: 'Robust offline functionality with intelligent data synchronization' }
        }
    },
    mod: {
        title: 'Module System',
        description: 'Modular architecture platform with component management and extensible frameworks.',
        category: 'Architecture',
        features: {
            feature1: { title: 'Modular Design', desc: 'Flexible modular architecture with hot-swappable components' },
            feature2: { title: 'Extension Framework', desc: 'Powerful extension system for custom functionality development' },
            feature3: { title: 'Dependency Management', desc: 'Intelligent dependency resolution and version management' }
        }
    },
    muzicai: {
        title: 'Music Intelligence',
        description: 'AI-powered music creation and analysis platform with composition assistance and audio processing.',
        category: 'Music',
        features: {
            feature1: { title: 'Music Creation', desc: 'AI-assisted music composition with genre and style adaptation' },
            feature2: { title: 'Audio Analysis', desc: 'Advanced audio processing and music analysis capabilities' },
            feature3: { title: 'Sound Design', desc: 'Professional sound design tools with AI-powered audio enhancement' }
        }
    },
    prezentai: {
        title: 'Presentation Intelligence',
        description: 'AI-powered presentation creation platform with automated design and content optimization.',
        category: 'Presentations',
        features: {
            feature1: { title: 'Auto Design', desc: 'Automated presentation design with professional templates and layouts' },
            feature2: { title: 'Content AI', desc: 'Intelligent content generation and optimization for maximum impact' },
            feature3: { title: 'Interactive Features', desc: 'Dynamic interactive elements and real-time collaboration tools' }
        }
    },
    publicai: {
        title: 'Public Services',
        description: 'Public sector AI platform for government services automation and citizen engagement.',
        category: 'Government',
        features: {
            feature1: { title: 'Service Automation', desc: 'Automated public service delivery with efficient workflow management' },
            feature2: { title: 'Citizen Engagement', desc: 'Enhanced citizen interaction through digital platforms and AI assistance' },
            feature3: { title: 'Data Transparency', desc: 'Open data initiatives with transparent reporting and public accountability' }
        }
    },
    romai: {
        title: 'Romanian Intelligence',
        description: 'Romanian-specific AI platform with localized services and cultural understanding.',
        category: 'Localization',
        features: {
            feature1: { title: 'Cultural AI', desc: 'AI trained specifically for Romanian culture and language nuances' },
            feature2: { title: 'Local Services', desc: 'Specialized services tailored for Romanian market and regulations' },
            feature3: { title: 'Language Processing', desc: 'Advanced Romanian language processing with dialect recognition' }
        }
    },
    sociai: {
        title: 'Social Intelligence',
        description: 'Social media management platform with AI-powered content creation and engagement analysis.',
        category: 'Social Media',
        features: {
            feature1: { title: 'Content Strategy', desc: 'AI-driven social media content planning and optimization' },
            feature2: { title: 'Engagement Analytics', desc: 'Comprehensive social media analytics and audience insights' },
            feature3: { title: 'Community Management', desc: 'Automated community management with intelligent response systems' }
        }
    },
    stocai: {
        title: 'Stock Intelligence',
        description: 'AI-powered stock market analysis and trading platform with predictive modeling.',
        category: 'Finance',
        features: {
            feature1: { title: 'Market Prediction', desc: 'Advanced market prediction using machine learning and data analysis' },
            feature2: { title: 'Trading Algorithms', desc: 'Sophisticated trading algorithms with risk management and optimization' },
            feature3: { title: 'Portfolio Analytics', desc: 'Comprehensive portfolio analysis with performance tracking and insights' }
        }
    },
    studiai: {
        title: 'Educational Intelligence',
        description: 'AI-powered learning platform with personalized education and progress tracking.',
        category: 'Education',
        features: {
            feature1: { title: 'Personalized Learning', desc: 'AI-adapted learning paths tailored to individual student needs' },
            feature2: { title: 'Progress Tracking', desc: 'Comprehensive progress monitoring with detailed analytics and insights' },
            feature3: { title: 'Interactive Content', desc: 'Engaging interactive learning materials with multimedia integration' }
        }
    },
    sunai: {
        title: 'Solar Intelligence',
        description: 'Solar energy management platform with AI-powered optimization and performance monitoring.',
        category: 'Energy',
        features: {
            feature1: { title: 'Energy Optimization', desc: 'AI-powered solar energy optimization with weather prediction integration' },
            feature2: { title: 'Performance Monitor', desc: 'Real-time solar panel performance monitoring and maintenance alerts' },
            feature3: { title: 'Grid Integration', desc: 'Smart grid integration with automated energy distribution and storage' }
        }
    },
    talentai: {
        title: 'Talent Intelligence',
        description: 'AI-powered talent management and recruitment platform with skill assessment and matching.',
        category: 'Human Resources',
        features: {
            feature1: { title: 'Talent Matching', desc: 'AI-powered candidate matching with skill assessment and compatibility analysis' },
            feature2: { title: 'Performance Analytics', desc: 'Comprehensive employee performance tracking and development recommendations' },
            feature3: { title: 'Recruitment Automation', desc: 'Automated recruitment workflows with intelligent candidate screening' }
        }
    },
    tools: {
        title: 'Development Tools',
        description: 'Comprehensive development toolkit with code generators, utilities, and automation tools.',
        category: 'Development',
        features: {
            feature1: { title: 'Code Generation', desc: 'Automated code generation with template systems and scaffolding tools' },
            feature2: { title: 'Utility Suite', desc: 'Comprehensive development utilities for debugging and optimization' },
            feature3: { title: 'Automation Tools', desc: 'Workflow automation tools for streamlined development processes' }
        }
    },
    wallet: {
        title: 'Digital Wallet',
        description: 'Secure digital wallet platform with cryptocurrency support and transaction management.',
        category: 'Finance',
        features: {
            feature1: { title: 'Multi-currency', desc: 'Support for multiple cryptocurrencies and traditional payment methods' },
            feature2: { title: 'Security Features', desc: 'Advanced security with multi-factor authentication and encryption' },
            feature3: { title: 'Transaction History', desc: 'Comprehensive transaction tracking with detailed analytics and reporting' }
        }
    },
    x: {
        title: 'Experimental Platform',
        description: 'Cutting-edge experimental platform for testing new technologies and innovative features.',
        category: 'Research',
        features: {
            feature1: { title: 'Innovation Lab', desc: 'Experimental environment for testing cutting-edge technologies' },
            feature2: { title: 'Prototype Testing', desc: 'Rapid prototyping and testing platform for new feature development' },
            feature3: { title: 'Future Tech', desc: 'Early access to emerging technologies and experimental capabilities' }
        }
    }
};

// Helper functions
function getColorName(hex) {
    const colorMap = {
        '#10b981': 'emerald',
        '#8b5cf6': 'violet',
        '#06b6d4': 'cyan',
        '#f59e0b': 'amber',
        '#ef4444': 'red',
        '#3b82f6': 'blue',
        '#22c55e': 'green',
        '#ec4899': 'pink',
        '#6366f1': 'indigo',
        '#64748b': 'slate'
    };
    return colorMap[hex] || 'indigo';
}

function replaceTemplateVars(template, appName) {
    const colors = brandColors[appName];
    const metadata = appMetadata[appName];

    return template
        .replace(/\{\{APP_NAME\}\}/g, appName)
        .replace(/\{\{APP_NAME_UPPER\}\}/g, appName.toUpperCase())
        .replace(/\{\{APP_TITLE\}\}/g, metadata.title)
        .replace(/\{\{APP_DESCRIPTION\}\}/g, metadata.description)
        .replace(/\{\{APP_CATEGORY\}\}/g, metadata.category)
        .replace(/\{\{PRIMARY_COLOR\}\}/g, getColorName(colors.primary))
        .replace(/\{\{SECONDARY_COLOR\}\}/g, getColorName(colors.secondary))
        .replace(/\{\{ACCENT_COLOR\}\}/g, getColorName(colors.accent))
        .replace(/\{\{FEATURE_1_TITLE\}\}/g, metadata.features.feature1.title)
        .replace(/\{\{FEATURE_1_DESC\}\}/g, metadata.features.feature1.desc)
        .replace(/\{\{FEATURE_2_TITLE\}\}/g, metadata.features.feature2.title)
        .replace(/\{\{FEATURE_2_DESC\}\}/g, metadata.features.feature2.desc)
        .replace(/\{\{FEATURE_3_TITLE\}\}/g, metadata.features.feature3.title)
        .replace(/\{\{FEATURE_3_DESC\}\}/g, metadata.features.feature3.desc);
}

function createAuthFlow(appName) {
    const appDir = path.join(__dirname, '..', 'apps', appName);

    if (!fs.existsSync(appDir)) {
        console.log(`⚠️  App directory ${appName} does not exist, skipping...`);
        return;
    }

    console.log(`🔧 Processing ${appName}...`);

    // Create directories
    const authDir = path.join(appDir, 'app', 'auth');
    const componentsDir = path.join(appDir, 'app', 'components');
    const landingDir = path.join(appDir, 'app', 'landing');

    fs.mkdirSync(path.join(authDir, 'login'), { recursive: true });
    fs.mkdirSync(path.join(authDir, 'register'), { recursive: true });
    fs.mkdirSync(path.join(authDir, 'forgot-password'), { recursive: true });
    fs.mkdirSync(componentsDir, { recursive: true });
    fs.mkdirSync(landingDir, { recursive: true });

    // Create AuthWrapper component
    fs.writeFileSync(
        path.join(componentsDir, 'AuthWrapper.tsx'),
        replaceTemplateVars(templates.authWrapper, appName)
    );

    // Create root page
    fs.writeFileSync(
        path.join(appDir, 'app', 'page.tsx'),
        replaceTemplateVars(templates.rootPage, appName)
    );

    // Create landing page
    fs.writeFileSync(
        path.join(landingDir, 'page.tsx'),
        replaceTemplateVars(templates.landingPage, appName)
    );

    // Create auth pages
    fs.writeFileSync(
        path.join(authDir, 'login', 'page.tsx'),
        replaceTemplateVars(templates.loginPage, appName)
    );

    // Create similar register and forgot-password pages (simplified for now)
    const registerContent = templates.loginPage
        .replace(/LoginPage/g, 'RegisterPage')
        .replace(/Sign in/g, 'Sign up')
        .replace(/Welcome Back/g, 'Create Account')
        .replace(/Signing in/g, 'Creating account');

    fs.writeFileSync(
        path.join(authDir, 'register', 'page.tsx'),
        replaceTemplateVars(registerContent, appName)
    );

    const forgotContent = templates.loginPage
        .replace(/LoginPage/g, 'ForgotPasswordPage')
        .replace(/Sign in/g, 'Reset Password')
        .replace(/Welcome Back/g, 'Reset Password')
        .replace(/Signing in/g, 'Sending reset email');

    fs.writeFileSync(
        path.join(authDir, 'forgot-password', 'page.tsx'),
        replaceTemplateVars(forgotContent, appName)
    );

    console.log(`✅ Completed ${appName}`);
}

// Main execution
console.log('🚀 Starting authentication flow generation for all apps...\n');

apps.forEach(appName => {
    createAuthFlow(appName);
});

console.log(`\n✨ Authentication flow generation completed for ${apps.length} apps!`);
console.log('\nNext steps:');
console.log('1. Update each app\'s layout.tsx to use AuthWrapper');
console.log('2. Add Tailwind config with brand colors');
console.log('3. Install required dependencies (framer-motion, lucide-react)');
console.log('4. Test the authentication flow in each app');
