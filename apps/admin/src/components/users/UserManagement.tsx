'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Key,
  Ban,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Mail,
  Calendar,
  Activity,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'moderator' | 'developer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin: Date;
  createdAt: Date;
  permissions: string[];
  avatar?: string;
  services: string[];
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  suspendedUsers: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || null);
      } else {
        // Fallback to mock data
        setUsers(generateMockUsers());
        setStats(generateMockStats());
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers(generateMockUsers());
      setStats(generateMockStats());
    } finally {
      setLoading(false);
    }
  };

  const generateMockUsers = (): User[] => [
    {
      id: '1',
      email: 'admin@codai.ro',
      name: 'System Administrator',
      role: 'admin',
      status: 'active',
      lastLogin: new Date(Date.now() - 1800000), // 30 minutes ago
      createdAt: new Date('2024-01-01'),
      permissions: ['all'],
      services: ['*'],
    },
    {
      id: '2',
      email: 'dev@codai.ro',
      name: 'Lead Developer',
      role: 'developer',
      status: 'active',
      lastLogin: new Date(Date.now() - 3600000), // 1 hour ago
      createdAt: new Date('2024-01-15'),
      permissions: ['read', 'write', 'deploy'],
      services: ['codai', 'memorai', 'logai'],
    },
    {
      id: '3',
      email: 'alice.johnson@example.com',
      name: 'Alice Johnson',
      role: 'user',
      status: 'active',
      lastLogin: new Date(Date.now() - 7200000), // 2 hours ago
      createdAt: new Date('2024-02-01'),
      permissions: ['read'],
      services: ['bancai', 'wallet'],
    },
    {
      id: '4',
      email: 'bob.smith@example.com',
      name: 'Bob Smith',
      role: 'moderator',
      status: 'active',
      lastLogin: new Date(Date.now() - 86400000), // 1 day ago
      createdAt: new Date('2024-01-20'),
      permissions: ['read', 'moderate'],
      services: ['sociai', 'publicai'],
    },
    {
      id: '5',
      email: 'charlie.brown@example.com',
      name: 'Charlie Brown',
      role: 'user',
      status: 'suspended',
      lastLogin: new Date(Date.now() - 604800000), // 1 week ago
      createdAt: new Date('2024-03-01'),
      permissions: ['read'],
      services: ['studiai'],
    },
    {
      id: '6',
      email: 'diana.prince@example.com',
      name: 'Diana Prince',
      role: 'user',
      status: 'pending',
      lastLogin: new Date(Date.now() - 172800000), // 2 days ago
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      permissions: ['read'],
      services: [],
    },
  ];

  const generateMockStats = (): UserStats => ({
    totalUsers: 1247,
    activeUsers: 1098,
    newUsers: 23,
    suspendedUsers: 12,
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'developer':
        return 'bg-purple-100 text-purple-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'inactive':
        return 'text-gray-600';
      case 'suspended':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Shield className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await loadUsers();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const deleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          await loadUsers();
        }
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-600" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage users, roles, and permissions across the Codai ecosystem
            </p>
          </div>
          <button
            onClick={() => setShowUserModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>

        {/* User Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Users
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeUsers.toLocaleString()}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    New Users (30d)
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.newUsers}
                  </p>
                </div>
                <UserPlus className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.suspendedUsers}
                  </p>
                </div>
                <Ban className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="developer">Developer</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Services
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(user.status)}
                        <span
                          className={`ml-2 text-sm font-medium ${getStatusColor(user.status)}`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.services.length > 0
                        ? user.services.includes('*')
                          ? 'All'
                          : user.services.join(', ')
                        : 'None'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.status === 'active' ? (
                          <button
                            onClick={() =>
                              updateUserStatus(user.id, 'suspended')
                            }
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        ) : user.status === 'suspended' ? (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : null}
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Modal */}
        {(showUserModal || selectedUser) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {selectedUser ? 'Edit User' : 'Add New User'}
                </h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="text-gray-600">User form would go here...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
