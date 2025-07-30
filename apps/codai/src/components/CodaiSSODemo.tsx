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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 p-6 sm:p-8 md:p-10">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">CODAI Enterprise</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 sm:mb-6">AI-native development environment with enterprise SSO</p>

            <div className="space-y-3 sm:space-y-4">
              <div className="backdrop-blur-md bg-blue-50/70 dark:bg-blue-900/30 p-3 sm:p-4 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-sm sm:text-base">🔐 Enterprise Features</h3>
                <ul className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 mt-2 space-y-1">
                  <li>• Keycloak SSO Integration</li>
                  <li>• Role-Based Access Control</li>
                  <li>• Zero Trust Security</li>
                  <li>• Cross-Application Sessions</li>
                </ul>
              </div>

              <button
                onClick={() => signIn('keycloak')}
                className="w-full backdrop-blur-sm bg-blue-600/90 hover:bg-blue-700/90 text-white font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 border border-blue-500/30 shadow-lg hover:shadow-xl text-sm sm:text-base"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 shadow-sm border-b border-white/20 dark:border-gray-700/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CODAI Enterprise</h1>
              <p className="text-gray-600 dark:text-gray-300">Welcome, {user?.name}</p>
            </div>
            <nav className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 backdrop-blur-md bg-gray-100/70 dark:bg-gray-700/70 px-3 py-1 rounded-full border border-gray-200/30 dark:border-gray-600/30">
                Device: {isTrusted ? '✅ Trusted' : '⚠️ Untrusted'} | Risk: {riskLevel}
              </div>
              <button
                onClick={() => signOut()}
                className="backdrop-blur-sm bg-red-600/90 hover:bg-red-700/90 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 border border-red-500/30 shadow-lg hover:shadow-xl"
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* User Information */}
          <article className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-200 sm:p-4 md:p-6">
            <header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:text-base md:text-lg">👤 User Profile</h2>
            </header>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 sm:text-xs md:text-sm">
              <div><strong>Name:</strong> {user?.name}</div>
              <div><strong>Email:</strong> {user?.email}</div>
              <div><strong>ID:</strong> {user?.id}</div>
              <div><strong>Verified:</strong> {user?.emailVerified ? '✅' : '❌'}</div>
              <div><strong>MFA:</strong> {user?.mfaEnabled ? '✅' : '❌'}</div>
            </div>
          </article>

          {/* Roles & Permissions */}
          <article className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-200 sm:p-4 md:p-6">
            <header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:text-base md:text-lg">🔑 Access Control</h2>
            </header>
            <div className="space-y-3">
              <div>
                <strong className="text-sm text-gray-700 dark:text-gray-300 sm:text-xs md:text-sm">Roles:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roles.map(role => (
                    <span key={role} className="px-2 py-1 backdrop-blur-sm bg-blue-100/70 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-xs rounded border border-blue-200/30 dark:border-blue-700/30 sm:px-1 sm:text-xs md:px-2">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong className="text-sm text-gray-700 dark:text-gray-300 sm:text-xs md:text-sm">Key Permissions:</strong>
                <div className="text-xs mt-1 space-y-1 text-gray-600 dark:text-gray-400 sm:text-xs">
                  <div>Apps Management: {hasPermission('apps:write') ? '✅' : '❌'}</div>
                  <div>User Management: {hasPermission('users:write') ? '✅' : '❌'}</div>
                  <div>Code Access: {hasPermission('code:read') ? '✅' : '❌'}</div>
                </div>
              </div>
            </div>
          </article>

          {/* Security Status */}
          <article className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-200 sm:p-4 md:p-6">
            <header>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:text-base md:text-lg">🛡️ Security Status</h2>
            </header>
            <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 sm:text-xs md:text-sm">
              <div><strong>Device ID:</strong> {deviceId?.slice(-8)}...</div>
              <div><strong>Trust Level:</strong> {isTrusted ? '✅ Trusted' : '⚠️ Untrusted'}</div>
              <div><strong>Risk Level:</strong>
                <span className={`ml-1 ${riskLevel === 'low' ? 'text-green-600 dark:text-green-400' :
                  riskLevel === 'medium' ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {riskLevel.toUpperCase()}
                </span>
              </div>
              <div><strong>Security Status:</strong> {isSecure ? '🟢 Secure' : '🟡 Monitor'}</div>
            </div>
          </article>

          {/* Development Features */}
          {canManageApps && (
            <section className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 p-6 md:col-span-2 lg:col-span-3 hover:shadow-xl transition-all duration-200 sm:p-4 md:p-6">
              <header>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:text-base md:text-lg">🚀 Developer Features</h2>
              </header>
              <div className="backdrop-blur-md bg-green-50/70 dark:bg-green-900/30 p-4 rounded-lg border border-green-200/30 dark:border-green-700/30 sm:p-3 md:p-4">
                <p className="text-green-800 dark:text-green-200 sm:text-sm">
                  ✅ You have developer access! This section demonstrates role-based content visibility.
                </p>
                <nav className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-2 md:gap-4">
                  <button className="backdrop-blur-sm bg-green-600/90 hover:bg-green-700/90 text-white px-4 py-2 rounded text-sm transition-all duration-200 border border-green-500/30 shadow-lg hover:shadow-xl sm:px-2 sm:py-1 sm:text-xs md:px-4 md:py-2 md:text-sm">
                    Code Repository
                  </button>
                  <button className="backdrop-blur-sm bg-blue-600/90 hover:bg-blue-700/90 text-white px-4 py-2 rounded text-sm transition-all duration-200 border border-blue-500/30 shadow-lg hover:shadow-xl sm:px-2 sm:py-1 sm:text-xs md:px-4 md:py-2 md:text-sm">
                    App Management
                  </button>
                  <button className="backdrop-blur-sm bg-purple-600/90 hover:bg-purple-700/90 text-white px-4 py-2 rounded text-sm transition-all duration-200 border border-purple-500/30 shadow-lg hover:shadow-xl sm:px-2 sm:py-1 sm:text-xs md:px-4 md:py-2 md:text-sm">
                    Deployment Tools
                  </button>
                </nav>
              </div>
            </section>
          )}

        </section>

        {/* Integration Status */}
        <section className="mt-8 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20 p-6 hover:shadow-xl transition-all duration-200 sm:mt-6 sm:p-4 md:mt-8 md:p-6">
          <header>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:text-base md:text-lg">📊 Phase 4 Integration Status</h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-2 md:gap-4">
            <article className="text-center backdrop-blur-md bg-green-50/50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200/30 dark:border-green-700/30 sm:p-2 md:p-4">
              <div className="text-2xl sm:text-xl md:text-2xl">✅</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-xs md:text-sm">CODAI SSO</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">Integrated & Active</div>
            </article>
            <article className="text-center backdrop-blur-md bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200/30 dark:border-blue-700/30 sm:p-2 md:p-4">
              <div className="text-2xl sm:text-xl md:text-2xl">🔄</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-xs md:text-sm">MEMORAI</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">Next Integration</div>
            </article>
            <article className="text-center backdrop-blur-md bg-orange-50/50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200/30 dark:border-orange-700/30 sm:p-2 md:p-4">
              <div className="text-2xl sm:text-xl md:text-2xl">⏳</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white sm:text-xs md:text-sm">BANCAI</h3>
              <div className="text-xs text-gray-600 dark:text-gray-400">Planned Integration</div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
