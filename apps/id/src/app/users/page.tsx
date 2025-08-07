'use client';

import React, { useState } from 'react';
import {
    Users,
    User,
    UserPlus,
    UserMinus,
    Search,
    Filter,
    MoreVertical,
    Edit3,
    Trash2,
    Shield,
    Crown,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Download,
    Upload,
    RefreshCw,
    Settings,
    Bell,
    Globe,
    Smartphone,
    Monitor,
    Tablet,
    Chrome,
    ExternalLink,
    Copy,
    BarChart3,
    TrendingUp,
    TrendingDown,
    Plus,
    Minus,
    Info,
    Star,
    Flag,
    Archive,
    RotateCcw
} from 'lucide-react';

interface UserAccount {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: 'master_admin' | 'ai_admin' | 'admin' | 'customer';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    avatar?: string;
    groups: string[];
    department?: string;
    title?: string;
    phone?: string;
    location?: string;
    timezone?: string;
    language?: string;
    lastLogin?: string;
    createdAt: string;
    loginCount: number;
    isVerified: boolean;
    mfaEnabled: boolean;
    devices: number;
    permissions: string[];
}

interface UserActivity {
    id: string;
    userId: string;
    action: string;
    resource: string;
    timestamp: string;
    ipAddress: string;
    userAgent: string;
    status: 'success' | 'failed' | 'warning';
}

export default function UsersPage() {
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const users: UserAccount[] = [
        {
            id: '1',
            email: 'admin@codai.com',
            name: 'System Administrator',
            firstName: 'System',
            lastName: 'Administrator',
            role: 'master_admin',
            status: 'active',
            groups: ['admins', 'system'],
            department: 'IT',
            title: 'System Administrator',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            timezone: 'PST',
            language: 'English',
            lastLogin: '5 minutes ago',
            createdAt: '2024-01-15',
            loginCount: 1247,
            isVerified: true,
            mfaEnabled: true,
            devices: 3,
            permissions: ['*']
        },
        {
            id: '2',
            email: 'john.doe@company.com',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            role: 'admin',
            status: 'active',
            groups: ['admins', 'developers'],
            department: 'Engineering',
            title: 'Senior Developer',
            phone: '+1 (555) 234-5678',
            location: 'New York, NY',
            timezone: 'EST',
            language: 'English',
            lastLogin: '2 hours ago',
            createdAt: '2024-02-20',
            loginCount: 892,
            isVerified: true,
            mfaEnabled: true,
            devices: 2,
            permissions: ['read', 'write', 'admin']
        },
        {
            id: '3',
            email: 'alice.smith@company.com',
            name: 'Alice Smith',
            firstName: 'Alice',
            lastName: 'Smith',
            role: 'customer',
            status: 'active',
            groups: ['users', 'testers'],
            department: 'QA',
            title: 'QA Engineer',
            phone: '+1 (555) 345-6789',
            location: 'Austin, TX',
            timezone: 'CST',
            language: 'English',
            lastLogin: '1 day ago',
            createdAt: '2024-03-10',
            loginCount: 456,
            isVerified: true,
            mfaEnabled: false,
            devices: 1,
            permissions: ['read', 'write']
        },
        {
            id: '4',
            email: 'bob.wilson@company.com',
            name: 'Bob Wilson',
            firstName: 'Bob',
            lastName: 'Wilson',
            role: 'customer',
            status: 'suspended',
            groups: ['users'],
            department: 'Sales',
            title: 'Sales Manager',
            phone: '+1 (555) 456-7890',
            location: 'Chicago, IL',
            timezone: 'CST',
            language: 'English',
            lastLogin: '1 week ago',
            createdAt: '2024-01-30',
            loginCount: 234,
            isVerified: false,
            mfaEnabled: false,
            devices: 0,
            permissions: ['read']
        },
        {
            id: '5',
            email: 'sarah.jones@company.com',
            name: 'Sarah Jones',
            firstName: 'Sarah',
            lastName: 'Jones',
            role: 'ai_admin',
            status: 'active',
            groups: ['admins', 'ai_team'],
            department: 'AI Research',
            title: 'AI Research Lead',
            phone: '+1 (555) 567-8901',
            location: 'Seattle, WA',
            timezone: 'PST',
            language: 'English',
            lastLogin: '30 minutes ago',
            createdAt: '2024-01-05',
            loginCount: 1034,
            isVerified: true,
            mfaEnabled: true,
            devices: 4,
            permissions: ['read', 'write', 'admin', 'ai_admin']
        }
    ];

    const userActivities: UserActivity[] = [
        {
            id: '1',
            userId: '2',
            action: 'login',
            resource: 'Authentication Service',
            timestamp: '2 hours ago',
            ipAddress: '192.168.1.100',
            userAgent: 'Chrome/91.0 (Windows)',
            status: 'success'
        },
        {
            id: '2',
            userId: '3',
            action: 'password_change',
            resource: 'User Profile',
            timestamp: '1 day ago',
            ipAddress: '10.0.0.50',
            userAgent: 'Safari/14.0 (macOS)',
            status: 'success'
        },
        {
            id: '3',
            userId: '4',
            action: 'login_attempt',
            resource: 'Authentication Service',
            timestamp: '1 week ago',
            ipAddress: '172.16.0.25',
            userAgent: 'Firefox/89.0 (Linux)',
            status: 'failed'
        }
    ];

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'master_admin': return <Crown className="w-4 h-4 text-yellow-600" />;
            case 'ai_admin': return <Shield className="w-4 h-4 text-blue-600" />;
            case 'admin': return <Users className="w-4 h-4 text-green-600" />;
            default: return <User className="w-4 h-4 text-gray-600" />;
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'master_admin': return 'bg-yellow-100 text-yellow-800';
            case 'ai_admin': return 'bg-blue-100 text-blue-800';
            case 'admin': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'inactive': return <XCircle className="w-4 h-4 text-gray-600" />;
            case 'suspended': return <Lock className="w-4 h-4 text-red-600" />;
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            default: return <XCircle className="w-4 h-4 text-gray-600" />;
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || user.role === selectedRole;
        const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
    });

    const userStats = {
        total: users.length,
        active: users.filter(u => u.status === 'active').length,
        suspended: users.filter(u => u.status === 'suspended').length,
        pending: users.filter(u => u.status === 'pending').length,
        mfaEnabled: users.filter(u => u.mfaEnabled).length,
        verified: users.filter(u => u.isVerified).length
    };

    const handleBulkAction = (action: string) => {
        console.log(`Performing ${action} on users:`, selectedUsers);
        setSelectedUsers([]);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">
                        Manage user accounts, roles, and permissions across your organization
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                    </button>
                    <button
                        onClick={() => setShowUserModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </button>
                </div>
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.total}</div>
                            <div className="text-sm text-gray-500">Total Users</div>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.active}</div>
                            <div className="text-sm text-gray-500">Active</div>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.suspended}</div>
                            <div className="text-sm text-gray-500">Suspended</div>
                        </div>
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.pending}</div>
                            <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.mfaEnabled}</div>
                            <div className="text-sm text-gray-500">MFA Enabled</div>
                        </div>
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{userStats.verified}</div>
                            <div className="text-sm text-gray-500">Verified</div>
                        </div>
                        <Star className="w-8 h-8 text-indigo-600" />
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                                />
                            </div>

                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="master_admin">Master Admin</option>
                                <option value="ai_admin">AI Admin</option>
                                <option value="admin">Admin</option>
                                <option value="customer">Customer</option>
                            </select>

                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="pending">Pending</option>
                            </select>
                        </div>

                        <div className="flex items-center space-x-3">
                            {selectedUsers.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">{selectedUsers.length} selected</span>
                                    <button
                                        onClick={() => handleBulkAction('activate')}
                                        className="px-3 py-1 text-green-600 border border-green-600 rounded hover:bg-green-50"
                                    >
                                        Activate
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('suspend')}
                                        className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                                    >
                                        Suspend
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}

                            <button className="flex items-center px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users List */}
                <div className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedUsers([...selectedUsers, user.id]);
                                        } else {
                                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                        }
                                    }}
                                    className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />

                                <div className="flex items-center space-x-4 flex-1">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                                            <div className="flex items-center space-x-2">
                                                {getRoleIcon(user.role)}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                {getStatusIcon(user.status)}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-6 mt-1 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Mail className="w-3 h-3 mr-1" />
                                                {user.email}
                                            </div>
                                            {user.department && (
                                                <div className="flex items-center">
                                                    <Users className="w-3 h-3 mr-1" />
                                                    {user.department}
                                                </div>
                                            )}
                                            {user.location && (
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 mr-1" />
                                                    {user.location}
                                                </div>
                                            )}
                                            {user.lastLogin && (
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Last login: {user.lastLogin}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 mt-2">
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Activity className="w-3 h-3" />
                                                <span>{user.loginCount} logins</span>
                                            </div>
                                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                <Monitor className="w-3 h-3" />
                                                <span>{user.devices} devices</span>
                                            </div>
                                            {user.mfaEnabled && (
                                                <div className="flex items-center space-x-1 text-xs text-green-600">
                                                    <Shield className="w-3 h-3" />
                                                    <span>MFA</span>
                                                </div>
                                            )}
                                            {user.isVerified && (
                                                <div className="flex items-center space-x-1 text-xs text-blue-600">
                                                    <CheckCircle className="w-3 h-3" />
                                                    <span>Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setSelectedUser(user)}
                                        className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                                    >
                                        View
                                    </button>
                                    <button className="px-3 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1 text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No users found matching your criteria</p>
                    </div>
                )}
            </div>

            {/* Recent User Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Recent User Activity</h2>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            View All Activity
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {userActivities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                    <Activity className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">
                                            {users.find(u => u.id === activity.userId)?.name || 'Unknown User'}
                                        </span>
                                        {' '}performed{' '}
                                        <span className="font-medium">{activity.action.replace('_', ' ')}</span>
                                        {' '}on{' '}
                                        <span className="font-medium">{activity.resource}</span>
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                                        <span>{activity.timestamp}</span>
                                        <span>{activity.ipAddress}</span>
                                        <span>{activity.userAgent}</span>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'success' ? 'bg-green-100 text-green-800' :
                                                activity.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {activity.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
