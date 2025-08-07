import React from 'react'
/**
 * CODAI Platform - Main Application with Integrated Authentication
 * Cross-app authentication system with working navigation
 */

'use client';

import { useAuth, AppConfig, NavigationManager } from '../lib/auth';
import { useState } from 'react';
import { Shield, User, Settings, LogOut, Crown, Users, Code, Database, Cpu, Globe } from 'lucide-react';

export default function CodaiSSODemo() {
  const { authState, logout, hasRole, hasAnyRole, isAdmin, canAccess } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing CODAI Platform...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Code className="h-12 w-12 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">CODAI Platform</h1>
            </div>
            <p className="text-gray-600 mb-8">AI-powered development environment for the CODAI ecosystem</p>

            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-semibold text-blue-900 mb-3">🚀 Platform Features</h3>
              <ul className="text-sm text-blue-700 space-y-2 text-left">
                <li>• AI-assisted code development</li>
                <li>• Integrated authentication system</li>
                <li>• Real-time collaboration tools</li>
                <li>• Cross-application workspace</li>
                <li>• Role-based project access</li>
              </ul>
            </div>

            <button
              onClick={() => NavigationManager.redirectToAuth(window.location.href)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In to CODAI Platform
            </button>

            <div className="mt-4 text-sm text-gray-500">
              Secure authentication via CODAI Identity
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'master_admin':
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 'ai_admin':
        return <Cpu className="h-5 w-5 text-blue-500" />
      case 'admin':
        return <Shield className="h-5 w-5 text-green-500" />
      default:
        return <User className="h-5 w-5 text-gray-500" />
    }
  };

  const navigation = AppConfig.getNavigation('codai');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Code className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">CODAI Platform</h1>
                <p className="text-xs text-gray-600">Development Environment</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navigation.slice(0, 6).map((app) => (
                <a
                  key={app.key}
                  href={app.url}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${app.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {app.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                {getRoleIcon(user?.role || 'customer')}
                <span className="font-medium">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h2>
              <div className="flex items-center space-x-2">
                {getRoleIcon(user?.role || 'customer')}
                <span className="text-sm font-medium text-gray-600">{user?.role?.replace('_', ' ').toUpperCase()}</span>
              </div>
            </div>
            <p className="text-gray-600">Your AI-powered development environment is ready. Start building amazing applications with the CODAI ecosystem.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Code className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Database className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Databases</h3>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
                  <p className="text-2xl font-bold text-purple-600">24</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-center">
                <Code className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-blue-900">New Project</span>
              </button>
              <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-center">
                <Database className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-green-900">Connect DB</span>
              </button>
              <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-center">
                <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-purple-900">Invite Team</span>
              </button>
              <button className="p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-center">
                <Settings className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                <span className="text-sm font-medium text-gray-900">Settings</span>
              </button>
            </div>
          </div>

          {/* Admin Features */}
          {isAdmin() && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-6">
              <div className="flex items-center mb-4">
                <Crown className="h-6 w-6 text-yellow-600 mr-2" />
                <h3 className="text-lg font-semibold text-yellow-900">Admin Controls</h3>
              </div>
              <p className="text-yellow-800 mb-4">You have administrative access to advanced platform features.</p>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors">
                  User Management
                </button>
                <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors">
                  System Settings
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                  Security Audit
                </button>
              </div>
            </div>
          )}

          {/* Cross-App Navigation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🌐 CODAI Ecosystem</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {navigation.map((app) => (
                <a
                  key={app.key}
                  href={app.url}
                  className={`p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${app.active
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{app.icon}</div>
                    <div className="text-xs font-medium">{app.name}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Authentication Status */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Authentication Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Authenticated
                  </span>
                </div>
                <div className="mt-2 text-sm text-green-700">
                  <p>User: {user?.email}</p>
                  <p>Role: {user?.role}</p>
                  <p>Provider: {user?.provider}</p>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-900">Integration</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Active
                  </span>
                </div>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Cross-app authentication: ✅</p>
                  <p>Role-based access: ✅</p>
                  <p>Session management: ✅</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/60 backdrop-blur-sm border-t border-white/20 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2025 CODAI Ecosystem. All rights reserved.
            </div>
            <div className="text-sm text-gray-600">
              Authenticated as {user?.email}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

