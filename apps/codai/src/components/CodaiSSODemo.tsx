/**
 * CODAI SSO Integration Demo Component
 * Demonstrates enterprise authentication and authorization features
 */

'use client';

import { useCodaiAuth, useRBAC, useDeviceSecurity } from '@codai/sso-sdk';
import { signIn, signOut } from 'next-auth/react';

export default function CodaiSSODemo() {
  const { user, isAuthenticated, isLoading, roles, permissions, hasRole, hasPermission } = useCodaiAuth();
  const { isAuthorized: canManageApps } = useRBAC(['admin', 'developer'], ['apps:read']);
  const { deviceId, riskLevel, isTrusted, isSecure } = useDeviceSecurity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">CODAI Enterprise</h1>
            <p className="text-gray-600 mb-6">AI-native development environment with enterprise SSO</p>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900">🔐 Enterprise Features</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Keycloak SSO Integration</li>
                  <li>• Role-Based Access Control</li>
                  <li>• Zero Trust Security</li>
                  <li>• Cross-Application Sessions</li>
                </ul>
              </div>

              <button
                onClick={() => signIn('keycloak')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Sign In with CODAI ID
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CODAI Enterprise</h1>
              <p className="text-gray-600">Welcome, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Device: {isTrusted ? '✅ Trusted' : '⚠️ Untrusted'} | Risk: {riskLevel}
              </div>
              <button
                onClick={() => signOut()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* User Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">👤 User Profile</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>ID:</strong> {user?.id}</div>
              <div><strong>Verified:</strong> {user?.emailVerified ? '✅' : '❌'}</div>
              <div><strong>MFA:</strong> {user?.mfaEnabled ? '✅' : '❌'}</div>
            </div>
          </div>

          {/* Roles & Permissions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🔑 Access Control</h2>
            <div className="space-y-3">
              <div>
                <strong className="text-sm">Roles:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roles.map(role => (
                    <span key={role} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong className="text-sm">Key Permissions:</strong>
                <div className="text-xs mt-1 space-y-1">
                  <div>Apps Management: {hasPermission('apps:write') ? '✅' : '❌'}</div>
                  <div>User Management: {hasPermission('users:write') ? '✅' : '❌'}</div>
                  <div>Code Access: {hasPermission('code:read') ? '✅' : '❌'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">🛡️ Security Status</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Device ID:</strong> {deviceId?.slice(-8)}...</div>
              <div><strong>Trust Level:</strong> {isTrusted ? '✅ Trusted' : '⚠️ Untrusted'}</div>
              <div><strong>Risk Level:</strong>
                <span className={`ml-1 ${riskLevel === 'low' ? 'text-green-600' :
                    riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {riskLevel.toUpperCase()}
                </span>
              </div>
              <div><strong>Security Status:</strong> {isSecure ? '🟢 Secure' : '🟡 Monitor'}</div>
            </div>
          </div>

          {/* Development Features */}
          {canManageApps && (
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-3">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">🚀 Developer Features</h2>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800">
                  ✅ You have developer access! This section demonstrates role-based content visibility.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    Code Repository
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    App Management
                  </button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors">
                    Deployment Tools
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Integration Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Phase 4 Integration Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl">✅</div>
              <div className="text-sm font-semibold">CODAI SSO</div>
              <div className="text-xs text-gray-600">Integrated & Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">🔄</div>
              <div className="text-sm font-semibold">MEMORAI</div>
              <div className="text-xs text-gray-600">Next Integration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl">⏳</div>
              <div className="text-sm font-semibold">BANCAI</div>
              <div className="text-xs text-gray-600">Planned Integration</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
