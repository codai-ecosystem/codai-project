/**
 * MEMORAI SSO Integration Demo Component
 * Demonstrates enterprise authentication integrated with AI memory management
 */

'use client';

import { useCodaiAuth, useRBAC, useDeviceSecurity } from '@codai/sso-sdk';
import { signIn, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

// Mock memory data for demonstration
const mockMemories = [
    {
        id: '1',
        title: 'Enterprise Authentication System',
        content: 'Implementation details for CODAI ID enterprise SSO with Keycloak integration...',
        type: 'technical',
        tags: ['sso', 'keycloak', 'authentication'],
        createdAt: '2025-07-22T10:30:00Z',
        importance: 0.9
    },
    {
        id: '2',
        title: 'Zero Trust Security Architecture',
        content: 'Device fingerprinting and risk assessment strategies for enterprise applications...',
        type: 'security',
        tags: ['zero-trust', 'security', 'device-management'],
        createdAt: '2025-07-22T11:15:00Z',
        importance: 0.85
    },
    {
        id: '3',
        title: 'RBAC Permission Matrix',
        content: 'Role-based access control mapping for 40+ CODAI ecosystem applications...',
        type: 'documentation',
        tags: ['rbac', 'permissions', 'roles'],
        createdAt: '2025-07-22T12:00:00Z',
        importance: 0.8
    }
];

export default function MemoraiSSODemo() {
    const { user, isAuthenticated, isLoading, roles, permissions, hasRole, hasPermission } = useCodaiAuth();
    const { isAuthorized: canAccessMemories } = useRBAC(['admin', 'developer', 'user'], ['memory:read']);
    const { isAuthorized: canManageMemories } = useRBAC(['admin', 'developer'], ['memory:write']);
    const { deviceId, riskLevel, isTrusted, isSecure } = useDeviceSecurity();

    const [selectedMemory, setSelectedMemory] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredMemories = mockMemories.filter(memory =>
        memory.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        memory.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
                    <p className="mt-4 text-gray-300">Loading MEMORAI Enterprise...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900">
                <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-2xl p-8">
                    <div className="text-center">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-white mb-2">MEMORAI</h1>
                            <p className="text-blue-300 text-sm">Enterprise AI Memory & Knowledge Core</p>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700">
                                <h3 className="font-semibold text-blue-100 mb-2">🧠 Enterprise Memory Features</h3>
                                <ul className="text-sm text-blue-200 space-y-1">
                                    <li>• Secure Knowledge Management</li>
                                    <li>• Role-Based Memory Access</li>
                                    <li>• Enterprise Search & Discovery</li>
                                    <li>• Cross-App Memory Sharing</li>
                                </ul>
                            </div>

                            <button
                                onClick={() => signIn('keycloak')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
                            >
                                Access MEMORAI with CODAI ID
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">MEMORAI Enterprise</h1>
                                <p className="text-gray-300">Welcome back, {user?.name}</p>
                            </div>
                            <div className="text-sm text-gray-400">
                                🧠 AI Memory Core | Risk: {riskLevel} | {isTrusted ? '✅ Trusted' : '⚠️ Untrusted'}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Panel - Memory Search & List */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Search Bar */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    placeholder="Search memories, knowledge, and insights..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                                />
                                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                                    🔍 Search
                                </button>
                            </div>
                        </div>

                        {/* Memory List */}
                        {canAccessMemories ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xl font-semibold">Memory Vault</h2>
                                    {canManageMemories && (
                                        <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-sm transition-colors">
                                            + New Memory
                                        </button>
                                    )}
                                </div>

                                {filteredMemories.map(memory => (
                                    <div
                                        key={memory.id}
                                        onClick={() => setSelectedMemory(memory)}
                                        className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 transition-colors border border-gray-700 hover:border-blue-500"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-semibold text-white">{memory.title}</h3>
                                            <span className="text-xs px-2 py-1 bg-blue-600 rounded text-white">
                                                {(memory.importance * 100).toFixed(0)}% important
                                            </span>
                                        </div>
                                        <p className="text-gray-300 text-sm line-clamp-2 mb-2">{memory.content}</p>
                                        <div className="flex justify-between items-center">
                                            <div className="flex space-x-1">
                                                {memory.tags.map(tag => (
                                                    <span key={tag} className="text-xs px-2 py-1 bg-gray-600 rounded text-gray-200">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(memory.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-red-900/50 p-4 rounded-lg border border-red-700">
                                <p className="text-red-200">❌ You don't have permission to access memories.</p>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - User Info & Memory Details */}
                    <div className="space-y-6">

                        {/* User Profile */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">👤 User Profile</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>Name:</strong> {user?.name}</div>
                                <div><strong>Email:</strong> {user?.email}</div>
                                <div><strong>Verified:</strong> {user?.emailVerified ? '✅' : '❌'}</div>
                                <div><strong>MFA:</strong> {user?.mfaEnabled ? '✅' : '❌'}</div>
                            </div>
                        </div>

                        {/* Access Control */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">🔑 Memory Access</h3>
                            <div className="space-y-2 text-sm">
                                <div>Read Memories: {hasPermission('memory:read') ? '✅' : '❌'}</div>
                                <div>Write Memories: {hasPermission('memory:write') ? '✅' : '❌'}</div>
                                <div>Admin Access: {hasRole('admin') ? '✅' : '❌'}</div>
                                <div>Developer Mode: {hasRole('developer') ? '✅' : '❌'}</div>
                            </div>
                        </div>

                        {/* Device Security */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">🛡️ Security Status</h3>
                            <div className="space-y-2 text-sm">
                                <div><strong>Device:</strong> {deviceId?.slice(-8)}...</div>
                                <div><strong>Trust:</strong> {isTrusted ? '🟢 Trusted' : '🟡 Untrusted'}</div>
                                <div><strong>Risk:</strong>
                                    <span className={`ml-1 ${riskLevel === 'low' ? 'text-green-400' :
                                            riskLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                        }`}>
                                        {riskLevel.toUpperCase()}
                                    </span>
                                </div>
                                <div><strong>Secure:</strong> {isSecure ? '🟢 Yes' : '🟡 Monitor'}</div>
                            </div>
                        </div>

                        {/* Selected Memory Detail */}
                        {selectedMemory && (
                            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600">
                                <h3 className="font-semibold mb-2 text-blue-200">📝 Memory Detail</h3>
                                <div className="text-sm space-y-2">
                                    <div><strong>Title:</strong> {selectedMemory.title}</div>
                                    <div><strong>Type:</strong> {selectedMemory.type}</div>
                                    <div><strong>Content:</strong></div>
                                    <p className="text-gray-300 bg-gray-800 p-2 rounded text-xs">
                                        {selectedMemory.content}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Phase 4 Integration Status */}
                        <div className="bg-gray-800 rounded-lg p-4">
                            <h3 className="font-semibold mb-3">📊 Integration Status</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>CODAI SSO:</span>
                                    <span className="text-green-400">✅ Complete</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>MEMORAI SSO:</span>
                                    <span className="text-green-400">✅ Active</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>BANCAI SSO:</span>
                                    <span className="text-yellow-400">🔄 Planned</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-gray-600">
                                    <div className="text-xs text-gray-400">Phase 4 Progress: 66%</div>
                                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
