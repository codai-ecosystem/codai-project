'use client';

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Filter,
    Download,
    Upload,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    Key,
    Clock,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Activity,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Eye,
    EyeOff,
    Lock,
    Unlock,
    Ban,
    RefreshCw,
    Settings,
    Plus,
    Minus,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Copy,
    Star,
    Flag,
    Crown,
    Zap
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'master_admin' | 'admin' | 'moderator' | 'user' | 'customer';
    status: 'active' | 'inactive' | 'suspended' | 'pending';
    lastLogin: string;
    createdAt: string;
    loginCount: number;
    isOnline: boolean;
    twoFactorEnabled: boolean;
    emailVerified: boolean;
    phoneVerified: boolean;
    location: string;
    department: string;
    permissions: string[];
    subscription: 'free' | 'pro' | 'enterprise';
}

interface UserStats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    newThisMonth: number;
    onlineNow: number;
}

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Mock user stats
    const [userStats, setUserStats] = useState<UserStats>({
        total: 15847,
        active: 14256,
        inactive: 1234,
        suspended: 357,
        newThisMonth: 487,
        onlineNow: 2341
    });

    // Mock users data
    useEffect(() => {
        const mockUsers: User[] = [
            {
                id: '1',
                name: 'John Doe',
                email: 'john.doe@company.com',
                avatar: '/avatars/john-doe.jpg',
                role: 'admin',
                status: 'active',
                lastLogin: '2024-08-06T10:30:00Z',
                createdAt: '2024-01-15T08:00:00Z',
                loginCount: 247,
                isOnline: true,
                twoFactorEnabled: true,
                emailVerified: true,
                phoneVerified: true,
                location: 'New York, USA',
                department: 'Engineering',
                permissions: ['users.read', 'users.write', 'system.read'],
                subscription: 'enterprise'
            },
            {
                id: '2',
                name: 'Sarah Wilson',
                email: 'sarah.wilson@company.com',
                avatar: '/avatars/sarah-wilson.jpg',
                role: 'moderator',
                status: 'active',
                lastLogin: '2024-08-06T09:15:00Z',
                createdAt: '2024-02-10T14:30:00Z',
                loginCount: 156,
                isOnline: false,
                twoFactorEnabled: false,
                emailVerified: true,
                phoneVerified: false,
                location: 'London, UK',
                department: 'Support',
                permissions: ['users.read', 'content.moderate'],
                subscription: 'pro'
            },
            {
                id: '3',
                name: 'Mike Johnson',
                email: 'mike.johnson@company.com',
                avatar: '/avatars/mike-johnson.jpg',
                role: 'user',
                status: 'suspended',
                lastLogin: '2024-08-05T16:45:00Z',
                createdAt: '2024-03-20T11:15:00Z',
                loginCount: 89,
                isOnline: false,
                twoFactorEnabled: false,
                emailVerified: true,
                phoneVerified: true,
                location: 'Toronto, Canada',
                department: 'Marketing',
                permissions: ['content.read'],
                subscription: 'free'
            },
            {
                id: '4',
                name: 'Emily Chen',
                email: 'emily.chen@company.com',
                avatar: '/avatars/emily-chen.jpg',
                role: 'customer',
                status: 'active',
                lastLogin: '2024-08-06T08:20:00Z',
                createdAt: '2024-04-05T09:30:00Z',
                loginCount: 324,
                isOnline: true,
                twoFactorEnabled: true,
                emailVerified: true,
                phoneVerified: true,
                location: 'Singapore',
                department: 'Sales',
                permissions: ['dashboard.read', 'profile.write'],
                subscription: 'pro'
            },
            {
                id: '5',
                name: 'David Brown',
                email: 'david.brown@company.com',
                avatar: '/avatars/david-brown.jpg',
                role: 'user',
                status: 'inactive',
                lastLogin: '2024-07-28T13:10:00Z',
                createdAt: '2024-05-12T16:45:00Z',
                loginCount: 12,
                isOnline: false,
                twoFactorEnabled: false,
                emailVerified: false,
                phoneVerified: false,
                location: 'Sydney, Australia',
                department: 'Design',
                permissions: ['content.read'],
                subscription: 'free'
            }
        ];

        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setIsLoading(false);
    }, []);

    // Filter and search users
    useEffect(() => {
        let filtered = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = selectedRole === 'all' || user.role === selectedRole;
            const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;

            return matchesSearch && matchesRole && matchesStatus;
        });

        // Sort users
        filtered.sort((a, b) => {
            let aValue = a[sortBy as keyof User];
            let bValue = b[sortBy as keyof User];

            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });

        setFilteredUsers(filtered);
        setCurrentPage(1);
    }, [users, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder]);

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'master_admin':
                return <Crown className="w-4 h-4 text-purple-600" />;
            case 'admin':
                return <Shield className="w-4 h-4 text-blue-600" />;
            case 'moderator':
                return <Flag className="w-4 h-4 text-green-600" />;
            case 'user':
                return <Users className="w-4 h-4 text-gray-600" />;
            case 'customer':
                return <Star className="w-4 h-4 text-yellow-600" />;
            default:
                return <Users className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'text-green-600 bg-green-100';
            case 'inactive':
                return 'text-gray-600 bg-gray-100';
            case 'suspended':
                return 'text-red-600 bg-red-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getSubscriptionColor = (subscription: string) => {
        switch (subscription) {
            case 'enterprise':
                return 'text-purple-600 bg-purple-100';
            case 'pro':
                return 'text-blue-600 bg-blue-100';
            case 'free':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        const currentPageUsers = paginatedUsers.map(user => user.id);
        if (selectedUsers.length === currentPageUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(currentPageUsers);
        }
    };

    const handleBulkAction = async (action: string) => {
        setIsLoading(true);
        try {
            // Simulate API call for bulk action
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (action === 'delete') {
                setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
            } else if (action === 'activate') {
                setUsers(prev => prev.map(user =>
                    selectedUsers.includes(user.id) ? { ...user, status: 'active' as const } : user
                ));
            } else if (action === 'suspend') {
                setUsers(prev => prev.map(user =>
                    selectedUsers.includes(user.id) ? { ...user, status: 'suspended' as const } : user
                ));
            }

            setSelectedUsers([]);
        } catch (error) {
            console.error('Bulk action failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="lg:pl-64">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-600 mt-1">
                            Manage user accounts, roles, and permissions
                        </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                        <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                        </button>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{userStats.total.toLocaleString()}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-green-600">{userStats.active.toLocaleString()}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold text-gray-600">{userStats.inactive.toLocaleString()}</p>
                            </div>
                            <XCircle className="w-8 h-8 text-gray-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Suspended</p>
                                <p className="text-2xl font-bold text-red-600">{userStats.suspended.toLocaleString()}</p>
                            </div>
                            <Ban className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">New This Month</p>
                                <p className="text-2xl font-bold text-blue-600">{userStats.newThisMonth.toLocaleString()}</p>
                            </div>
                            <UserPlus className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Online Now</p>
                                <p className="text-2xl font-bold text-green-600">{userStats.onlineNow.toLocaleString()}</p>
                            </div>
                            <Activity className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search users by name, email, or department..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Roles</option>
                                <option value="master_admin">Master Admin</option>
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="user">User</option>
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

                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                            </select>
                        </div>
                    </div>

                    {/* Bulk Actions */}
                    {selectedUsers.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                            <span className="text-sm text-blue-700">
                                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                            </span>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleBulkAction('activate')}
                                    className="px-3 py-1 text-sm text-green-700 bg-green-100 rounded hover:bg-green-200"
                                >
                                    Activate
                                </button>
                                <button
                                    onClick={() => handleBulkAction('suspend')}
                                    className="px-3 py-1 text-sm text-yellow-700 bg-yellow-100 rounded hover:bg-yellow-200"
                                >
                                    Suspend
                                </button>
                                <button
                                    onClick={() => handleBulkAction('delete')}
                                    className="px-3 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role & Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Department
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Login
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Security
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => handleSelectUser(user.id)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                                        <Users className="w-5 h-5 text-gray-600" />
                                                    </div>
                                                    {user.isOnline && (
                                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                        {user.emailVerified && <CheckCircle className="w-3 h-3 text-green-500" />}
                                                    </div>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                    <p className="text-xs text-gray-400">{user.location}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center space-x-2">
                                                    {getRoleIcon(user.role)}
                                                    <span className="text-sm font-medium text-gray-900 capitalize">{user.role.replace('_', ' ')}</span>
                                                </div>
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                                                    {user.status}
                                                </span>
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSubscriptionColor(user.subscription)}`}>
                                                    {user.subscription}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900">{user.department}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{formatDate(user.lastLogin)}</div>
                                            <div className="text-xs text-gray-500">{user.loginCount} total logins</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {user.twoFactorEnabled ? (
                                                    <Lock className="w-4 h-4 text-green-600" title="2FA Enabled" />
                                                ) : (
                                                    <Unlock className="w-4 h-4 text-gray-400" title="2FA Disabled" />
                                                )}
                                                {user.emailVerified ? (
                                                    <Mail className="w-4 h-4 text-green-600" title="Email Verified" />
                                                ) : (
                                                    <Mail className="w-4 h-4 text-gray-400" title="Email Not Verified" />
                                                )}
                                                {user.phoneVerified ? (
                                                    <Phone className="w-4 h-4 text-green-600" title="Phone Verified" />
                                                ) : (
                                                    <Phone className="w-4 h-4 text-gray-400" title="Phone Not Verified" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button className="p-1 text-gray-400 hover:text-blue-600">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-green-600">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-700">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
