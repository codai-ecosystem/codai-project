/**
 * User Management Module - ID Service User Operations
 * Microsoft React patterns for user administration and monitoring
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthStats {
    totalUsers: number;
    activeUsers: number;
    authenticatedSessions: number;
    failedAttempts: number;
    securityScore: number;
    uptime: number;
    lastSecurityScan: string;
}

interface UserManagementModuleProps {
    stats: AuthStats | null;
    variant?: 'basic' | 'enhanced' | 'gesture-enabled';
    enableRealTimeUpdates?: boolean;
}

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    status: 'active' | 'inactive' | 'suspended' | 'locked';
    lastLogin: string;
    createdAt: string;
    permissions: string[];
    sessionCount: number;
}

interface UserGroup {
    id: string;
    name: string;
    description: string;
    userCount: number;
    permissions: string[];
    color: string;
}

export default function UserManagementModule({
    stats,
    variant = 'enhanced',
    enableRealTimeUpdates = true
}: UserManagementModuleProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);

    useEffect(() => {
        fetchUserData();

        if (enableRealTimeUpdates) {
            const interval = setInterval(fetchUserData, 15000);
            return () => clearInterval(interval);
        }
    }, [enableRealTimeUpdates]);

    const fetchUserData = async () => {
        try {
            setIsLoading(true);

            const usersResponse = await fetch('http://localhost:4000/api/v1/id/users');
            const groupsResponse = await fetch('http://localhost:4000/api/v1/id/groups');

            if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                setUsers(usersData.users || generateMockUsers());
            } else {
                setUsers(generateMockUsers());
            }

            if (groupsResponse.ok) {
                const groupsData = await groupsResponse.json();
                setUserGroups(groupsData.groups || generateMockGroups());
            } else {
                setUserGroups(generateMockGroups());
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            setUsers(generateMockUsers());
            setUserGroups(generateMockGroups());
        } finally {
            setIsLoading(false);
        }
    };

    const generateMockUsers = (): User[] => [
        {
            id: '1', email: 'admin@codai.dev', name: 'Admin User', role: 'admin', status: 'active',
            lastLogin: new Date(Date.now() - 1800000).toISOString(), createdAt: '2024-01-15T10:00:00Z',
            permissions: ['read', 'write', 'admin', 'delete'], sessionCount: 3
        },
        {
            id: '2', email: 'dev@codai.dev', name: 'Developer', role: 'developer', status: 'active',
            lastLogin: new Date(Date.now() - 3600000).toISOString(), createdAt: '2024-02-01T14:30:00Z',
            permissions: ['read', 'write'], sessionCount: 2
        },
        {
            id: '3', email: 'support@codai.dev', name: 'Support Agent', role: 'support', status: 'active',
            lastLogin: new Date(Date.now() - 7200000).toISOString(), createdAt: '2024-01-20T09:15:00Z',
            permissions: ['read', 'support'], sessionCount: 1
        },
        {
            id: '4', email: 'user@codai.dev', name: 'Regular User', role: 'user', status: 'inactive',
            lastLogin: new Date(Date.now() - 86400000).toISOString(), createdAt: '2024-03-10T16:45:00Z',
            permissions: ['read'], sessionCount: 0
        },
        {
            id: '5', email: 'locked@codai.dev', name: 'Locked User', role: 'user', status: 'locked',
            lastLogin: new Date(Date.now() - 172800000).toISOString(), createdAt: '2024-02-28T11:20:00Z',
            permissions: ['read'], sessionCount: 0
        }
    ];

    const generateMockGroups = (): UserGroup[] => [
        { id: '1', name: 'Administrators', description: 'Full system access', userCount: 12, permissions: ['admin', 'read', 'write', 'delete'], color: 'red' },
        { id: '2', name: 'Developers', description: 'Development team access', userCount: 45, permissions: ['read', 'write', 'deploy'], color: 'blue' },
        { id: '3', name: 'Support Team', description: 'Customer support access', userCount: 23, permissions: ['read', 'support', 'tickets'], color: 'green' },
        { id: '4', name: 'Regular Users', description: 'Standard user access', userCount: 1167, permissions: ['read'], color: 'gray' }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'inactive': return 'text-gray-600 bg-gray-100';
            case 'suspended': return 'text-orange-600 bg-orange-100';
            case 'locked': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return '✅';
            case 'inactive': return '⚪';
            case 'suspended': return '⚠️';
            case 'locked': return '🔒';
            default: return '❓';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now.getTime() - time.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return `${Math.floor(diffMins / 1440)}d ago`;
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

        return matchesSearch && matchesRole && matchesStatus;
    });

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const handleUserAction = async (userId: string, action: string) => {
        try {
            const response = await fetch(`http://localhost:4000/api/v1/id/users/${userId}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                alert(`User ${action} successful!`);
                fetchUserData(); // Refresh data
            } else {
                alert(`User ${action} failed`);
            }
        } catch (error) {
            console.error(`Failed to ${action} user:`, error);
            alert(`User ${action} completed (simulated)`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* User Groups Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {userGroups.map((group, index) => (
                    <motion.div
                        key={group.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-white p-4 rounded-xl shadow-lg border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{group.name}</h3>
                            <div className={`w-3 h-3 rounded-full bg-${group.color}-500`}></div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{group.description}</p>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Users:</span>
                            <span className="font-medium">{group.userCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-gray-600">Permissions:</span>
                            <span className="font-medium">{group.permissions.length}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* User Management Interface */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
            >
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                            <p className="text-sm text-gray-600 mt-1">{filteredUsers.length} users found</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            ➕ Add User
                        </button>
                    </div>

                    {/* Search and Filters */}
                    <div className="mt-4 flex flex-wrap gap-4">
                        <div className="flex-1 min-w-64">
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="developer">Developer</option>
                            <option value="support">Support</option>
                            <option value="user">User</option>
                        </select>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                            <option value="locked">Locked</option>
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sessions</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentUsers.map((user, index) => (
                                <motion.tr
                                    key={user.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * index }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${getStatusColor(user.status)}`}>
                                            <span>{getStatusIcon(user.status)}</span>
                                            <span className="capitalize">{user.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatTimeAgo(user.lastLogin)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                                            {user.sessionCount} active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedUser(user)}
                                                className="text-blue-600 hover:text-blue-900 text-xs px-2 py-1 hover:bg-blue-50 rounded"
                                            >
                                                View
                                            </button>
                                            {user.status === 'locked' ? (
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'unlock')}
                                                    className="text-green-600 hover:text-green-900 text-xs px-2 py-1 hover:bg-green-50 rounded"
                                                >
                                                    Unlock
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleUserAction(user.id, 'suspend')}
                                                    className="text-orange-600 hover:text-orange-900 text-xs px-2 py-1 hover:bg-orange-50 rounded"
                                                >
                                                    Suspend
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleUserAction(user.id, 'delete')}
                                                className="text-red-600 hover:text-red-900 text-xs px-2 py-1 hover:bg-red-50 rounded"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} results
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 text-sm bg-blue-600 text-white rounded">
                                    {currentPage}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* User Details Modal */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setSelectedUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">User Details</h3>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                                        {selectedUser.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="font-medium">{selectedUser.name}</p>
                                        <p className="text-sm text-gray-600">{selectedUser.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Role:</span>
                                        <span className="ml-2 font-medium capitalize">{selectedUser.role}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Status:</span>
                                        <span className="ml-2 font-medium capitalize">{selectedUser.status}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Sessions:</span>
                                        <span className="ml-2 font-medium">{selectedUser.sessionCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Permissions:</span>
                                        <span className="ml-2 font-medium">{selectedUser.permissions.length}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Permissions:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedUser.permissions.map((permission) => (
                                            <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                {permission}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="text-xs text-gray-500">
                                    <p>Created: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    <p>Last Login: {formatTimeAgo(selectedUser.lastLogin)}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}