'use client'

import { useState, useEffect } from 'react'

// Types for authentication management
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'developer' | 'guest'
  status: 'active' | 'inactive' | 'pending' | 'suspended'
  lastLogin: string
  createdAt: string
  services: string[]
  mfaEnabled: boolean
}

interface AuthSession {
  id: string
  userId: string
  device: string
  location: string
  ip: string
  userAgent: string
  createdAt: string
  lastActivity: string
  status: 'active' | 'expired'
}

interface AuthStats {
  totalUsers: number
  activeUsers: number
  totalSessions: number
  activeSessions: number
  loginAttempts24h: number
  successRate: number
  mfaAdoption: number
}

export default function AuthDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [sessions, setSessions] = useState<AuthSession[]>([])
  const [stats, setStats] = useState<AuthStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalSessions: 0,
    activeSessions: 0,
    loginAttempts24h: 0,
    successRate: 0,
    mfaAdoption: 0
  })
  const [selectedTab, setSelectedTab] = useState<'users' | 'sessions' | 'security'>('users')

  // Mock data for development
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'admin@codai.ro',
        name: 'Codai Administrator',
        role: 'admin',
        status: 'active',
        lastLogin: '2025-06-23T16:30:00Z',
        createdAt: '2025-06-01T08:00:00Z',
        services: ['codai', 'memorai', 'logai', 'bancai', 'fabricai'],
        mfaEnabled: true
      },
      {
        id: '2',
        email: 'developer@codai.ro',
        name: 'Lead Developer',
        role: 'developer',
        status: 'active',
        lastLogin: '2025-06-23T15:45:00Z',
        createdAt: '2025-06-10T10:30:00Z',
        services: ['codai', 'memorai', 'logai', 'fabricai'],
        mfaEnabled: true
      },
      {
        id: '3',
        email: 'user@example.com',
        name: 'John Smith',
        role: 'user',
        status: 'active',
        lastLogin: '2025-06-23T14:20:00Z',
        createdAt: '2025-06-15T16:00:00Z',
        services: ['studiai', 'sociai'],
        mfaEnabled: false
      },
      {
        id: '4',
        email: 'pending@example.com',
        name: 'Jane Doe',
        role: 'user',
        status: 'pending',
        lastLogin: '2025-06-22T12:00:00Z',
        createdAt: '2025-06-23T09:00:00Z',
        services: ['studiai'],
        mfaEnabled: false
      }
    ]

    const mockSessions: AuthSession[] = [
      {
        id: 'sess_1',
        userId: '1',
        device: 'Chrome on Windows',
        location: 'Bucharest, RO',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: '2025-06-23T16:30:00Z',
        lastActivity: '2025-06-23T16:30:00Z',
        status: 'active'
      },
      {
        id: 'sess_2',
        userId: '2',
        device: 'VS Code Extension',
        location: 'Cluj-Napoca, RO',
        ip: '192.168.1.101',
        userAgent: 'VS Code/1.85.0',
        createdAt: '2025-06-23T15:45:00Z',
        lastActivity: '2025-06-23T16:25:00Z',
        status: 'active'
      },
      {
        id: 'sess_3',
        userId: '3',
        device: 'Mobile Safari',
        location: 'Timisoara, RO',
        ip: '192.168.1.102',
        userAgent: 'Mobile Safari iOS 17.2',
        createdAt: '2025-06-23T14:20:00Z',
        lastActivity: '2025-06-23T15:00:00Z',
        status: 'active'
      }
    ]

    setUsers(mockUsers)
    setSessions(mockSessions)
    setStats({
      totalUsers: mockUsers.length,
      activeUsers: mockUsers.filter(u => u.status === 'active').length,
      totalSessions: mockSessions.length,
      activeSessions: mockSessions.filter(s => s.status === 'active').length,
      loginAttempts24h: 127,
      successRate: 94.5,
      mfaAdoption: (mockUsers.filter(u => u.mfaEnabled).length / mockUsers.length) * 100
    })
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'developer': return 'bg-purple-100 text-purple-800'
      case 'user': return 'bg-blue-100 text-blue-800'
      case 'guest': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Authentication Dashboard</h1>
        <p className="text-blue-100">Identity & Authentication Hub - Logai Service</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeSessions}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">{stats.successRate}%</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">MFA Adoption</p>
              <p className="text-3xl font-bold text-gray-900">{stats.mfaAdoption.toFixed(0)}%</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {(['users', 'sessions', 'security'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'users' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">User Management</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Add User
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Services</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.services.length} services</div>
                          <div className="text-xs text-gray-500">{user.services.join(', ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(user.lastLogin)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.mfaEnabled ? (
                            <span className="text-green-600">✓ Enabled</span>
                          ) : (
                            <span className="text-red-600">✗ Disabled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {selectedTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Active Sessions</h3>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                  Revoke All
                </button>
              </div>
              <div className="grid gap-4">
                {sessions.map((session) => {
                  const user = users.find(u => u.id === session.userId)
                  return (
                    <div key={session.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-gray-900">{user?.name || 'Unknown User'}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <p><strong>Device:</strong> {session.device}</p>
                              <p><strong>Location:</strong> {session.location}</p>
                              <p><strong>IP:</strong> {session.ip}</p>
                            </div>
                            <div>
                              <p><strong>Created:</strong> {formatDate(session.createdAt)}</p>
                              <p><strong>Last Activity:</strong> {formatDate(session.lastActivity)}</p>
                              <p><strong>Session ID:</strong> {session.id}</p>
                            </div>
                          </div>
                        </div>
                        <button className="text-red-600 hover:text-red-800 text-sm">
                          Revoke
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {selectedTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Security Overview</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Login Attempts (24h)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Successful</span>
                      <span className="text-green-600">{Math.round(stats.loginAttempts24h * stats.successRate / 100)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed</span>
                      <span className="text-red-600">{stats.loginAttempts24h - Math.round(stats.loginAttempts24h * stats.successRate / 100)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Total</span>
                      <span>{stats.loginAttempts24h}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Security Settings</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Password Policy</span>
                      <span className="text-green-600">Strong</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Session Timeout</span>
                      <span>24 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rate Limiting</span>
                      <span className="text-green-600">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IP Whitelist</span>
                      <span className="text-yellow-600">Partial</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-3">Recent Security Events</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">2025-06-23 16:30:00</span>
                    <span>Successful login from 192.168.1.100</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">2025-06-23 15:45:00</span>
                    <span>MFA setup completed for developer@codai.ro</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">2025-06-23 14:20:00</span>
                    <span>Failed login attempt from 203.45.67.89</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
