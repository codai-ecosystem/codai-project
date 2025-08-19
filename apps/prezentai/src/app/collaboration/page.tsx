'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Share2,
  MessageSquare,
  Bell,
  Settings,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  Clock,
  Calendar,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Unlock,
  Copy,
  Download,
  Link2,
  UserPlus,
  Crown,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  Heart,
  ThumbsUp,
  MessageCircle,
  Send,
  Paperclip,
  Smile,
  Video,
  Mic,
  ScreenShare,
  UserCheck,
  Activity
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'online' | 'offline' | 'away';
  lastActive: string;
  permissions: string[];
  joinedAt: string;
  presentationsAccess: number;
}

interface SharedPresentation {
  id: string;
  title: string;
  thumbnail: string;
  sharedWith: number;
  sharedBy: string;
  sharedAt: string;
  permissions: 'view' | 'edit' | 'admin';
  status: 'active' | 'pending' | 'revoked';
  views: number;
  comments: number;
  lastActivity: string;
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  replies: number;
  likes: number;
  isResolved: boolean;
  presentationId: string;
  slideNumber?: number;
}

interface CollaborationStats {
  totalTeamMembers: number;
  activeCollaborators: number;
  sharedPresentations: number;
  totalComments: number;
  resolvedComments: number;
  pendingInvites: number;
}

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newComment, setNewComment] = useState('');

  const collaborationStats: CollaborationStats = {
    totalTeamMembers: 24,
    activeCollaborators: 18,
    sharedPresentations: 156,
    totalComments: 847,
    resolvedComments: 692,
    pendingInvites: 5
  };

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      avatar: 'gradient-to-br from-pink-500 to-purple-600',
      role: 'owner',
      status: 'online',
      lastActive: 'Now',
      permissions: ['create', 'edit', 'delete', 'share', 'admin'],
      joinedAt: '6 months ago',
      presentationsAccess: 156
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.c@company.com',
      avatar: 'gradient-to-br from-blue-500 to-indigo-600',
      role: 'admin',
      status: 'online',
      lastActive: '5 minutes ago',
      permissions: ['create', 'edit', 'share', 'manage'],
      joinedAt: '4 months ago',
      presentationsAccess: 142
    },
    {
      id: '3',
      name: 'Emma Wilson',
      email: 'emma.w@company.com',
      avatar: 'gradient-to-br from-green-500 to-teal-600',
      role: 'editor',
      status: 'away',
      lastActive: '2 hours ago',
      permissions: ['create', 'edit', 'comment'],
      joinedAt: '3 months ago',
      presentationsAccess: 89
    },
    {
      id: '4',
      name: 'David Rodriguez',
      email: 'david.r@company.com',
      avatar: 'gradient-to-br from-orange-500 to-red-600',
      role: 'editor',
      status: 'online',
      lastActive: '15 minutes ago',
      permissions: ['create', 'edit', 'comment'],
      joinedAt: '2 months ago',
      presentationsAccess: 67
    },
    {
      id: '5',
      name: 'Lisa Thompson',
      email: 'lisa.t@company.com',
      avatar: 'gradient-to-br from-purple-500 to-pink-600',
      role: 'viewer',
      status: 'offline',
      lastActive: '1 day ago',
      permissions: ['view', 'comment'],
      joinedAt: '1 month ago',
      presentationsAccess: 34
    },
    {
      id: '6',
      name: 'Alex Kim',
      email: 'alex.k@company.com',
      avatar: 'gradient-to-br from-indigo-500 to-blue-600',
      role: 'viewer',
      status: 'away',
      lastActive: '3 hours ago',
      permissions: ['view', 'comment'],
      joinedAt: '3 weeks ago',
      presentationsAccess: 28
    }
  ];

  const sharedPresentations: SharedPresentation[] = [
    {
      id: '1',
      title: 'Q3 Business Strategy',
      thumbnail: 'gradient-to-br from-blue-500 to-purple-600',
      sharedWith: 12,
      sharedBy: 'Sarah Johnson',
      sharedAt: '2 days ago',
      permissions: 'edit',
      status: 'active',
      views: 89,
      comments: 23,
      lastActivity: '30 minutes ago'
    },
    {
      id: '2',
      title: 'Product Roadmap 2025',
      thumbnail: 'gradient-to-br from-green-500 to-blue-500',
      sharedWith: 8,
      sharedBy: 'Michael Chen',
      sharedAt: '5 days ago',
      permissions: 'view',
      status: 'active',
      views: 156,
      comments: 45,
      lastActivity: '2 hours ago'
    },
    {
      id: '3',
      title: 'Marketing Campaign Results',
      thumbnail: 'gradient-to-br from-orange-500 to-red-500',
      sharedWith: 15,
      sharedBy: 'Emma Wilson',
      sharedAt: '1 week ago',
      permissions: 'edit',
      status: 'active',
      views: 234,
      comments: 67,
      lastActivity: '1 hour ago'
    },
    {
      id: '4',
      title: 'Team Training Materials',
      thumbnail: 'gradient-to-br from-purple-500 to-pink-500',
      sharedWith: 6,
      sharedBy: 'David Rodriguez',
      sharedAt: '2 weeks ago',
      permissions: 'admin',
      status: 'pending',
      views: 45,
      comments: 12,
      lastActivity: '3 days ago'
    }
  ];

  const recentComments: Comment[] = [
    {
      id: '1',
      author: 'Michael Chen',
      avatar: 'gradient-to-br from-blue-500 to-indigo-600',
      message: 'Great work on the financial projections! Could we add more detail on Q4 targets?',
      timestamp: '5 minutes ago',
      replies: 2,
      likes: 4,
      isResolved: false,
      presentationId: '1',
      slideNumber: 12
    },
    {
      id: '2',
      author: 'Emma Wilson',
      avatar: 'gradient-to-br from-green-500 to-teal-600',
      message: 'The color scheme looks perfect. This aligns well with our brand guidelines.',
      timestamp: '15 minutes ago',
      replies: 0,
      likes: 7,
      isResolved: true,
      presentationId: '2',
      slideNumber: 5
    },
    {
      id: '3',
      author: 'David Rodriguez',
      avatar: 'gradient-to-br from-orange-500 to-red-600',
      message: 'Can we schedule a review meeting for this presentation? I have some suggestions.',
      timestamp: '1 hour ago',
      replies: 1,
      likes: 2,
      isResolved: false,
      presentationId: '3',
      slideNumber: 8
    },
    {
      id: '4',
      author: 'Lisa Thompson',
      avatar: 'gradient-to-br from-purple-500 to-pink-600',
      message: 'The animations in this section are really engaging! Well done team.',
      timestamp: '2 hours ago',
      replies: 3,
      likes: 9,
      isResolved: true,
      presentationId: '1',
      slideNumber: 15
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor': return <Edit3 className="w-4 h-4 text-green-500" />;
      case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || member.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || member.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Team Collaboration
              </h1>
              <p className="text-gray-600 mt-1">
                Collaborate with your team on presentations and projects
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Team</span>
              </button>
              <button className="bg-white/70 backdrop-blur-sm border border-purple-200 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition-all duration-200 flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Permissions</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Navigation Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/60 backdrop-blur-sm border-b border-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { name: 'Overview', href: '/prezentai', current: false },
              { name: 'Presentations', href: '/prezentai/presentations', current: false },
              { name: 'Templates', href: '/prezentai/templates', current: false },
              { name: 'Media Library', href: '/prezentai/media', current: false },
              { name: 'Analytics', href: '/prezentai/analytics', current: false },
              { name: 'Collaboration', href: '/prezentai/collaboration', current: true },
            ].map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${tab.current
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Collaboration Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{collaborationStats.totalTeamMembers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-2xl font-bold text-gray-900">{collaborationStats.activeCollaborators}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shared Items</p>
                <p className="text-2xl font-bold text-gray-900">{collaborationStats.sharedPresentations}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Share2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Comments</p>
                <p className="text-2xl font-bold text-gray-900">{collaborationStats.totalComments}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <MessageSquare className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{collaborationStats.resolvedComments}</p>
              </div>
              <div className="p-3 bg-pink-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{collaborationStats.pendingInvites}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Collaboration Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 mb-6"
        >
          <div className="border-b border-purple-100">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'team', name: 'Team Members', icon: <Users className="w-4 h-4" /> },
                { id: 'shared', name: 'Shared Presentations', icon: <Share2 className="w-4 h-4" /> },
                { id: 'comments', name: 'Recent Comments', icon: <MessageSquare className="w-4 h-4" /> },
                { id: 'activity', name: 'Activity Feed', icon: <Activity className="w-4 h-4" /> }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        {activeTab === 'team' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Team Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search team members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                  >
                    <option value="all">All Roles</option>
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50"
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="away">Away</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member) => (
                <div key={member.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className={`w-12 h-12 bg-${member.avatar} rounded-full flex items-center justify-center text-white font-bold`}>
                          {member.name.charAt(0)}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(member.role)}
                      <span className="text-xs font-medium text-gray-600 capitalize">{member.role}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Last Active</span>
                      <span className="font-medium text-gray-900">{member.lastActive}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Presentations</span>
                      <span className="font-medium text-gray-900">{member.presentationsAccess}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Joined</span>
                      <span className="font-medium text-gray-900">{member.joinedAt}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-purple-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-purple-500 transition-colors duration-200">
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'shared' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Shared Presentations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {sharedPresentations.map((presentation) => (
                <div key={presentation.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Presentation Thumbnail */}
                  <div className={`h-32 bg-${presentation.thumbnail} relative`}>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${presentation.status === 'active' ? 'bg-green-100 text-green-700' :
                          presentation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                        }`}>
                        {presentation.status}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${presentation.permissions === 'admin' ? 'bg-purple-100 text-purple-700' :
                          presentation.permissions === 'edit' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {presentation.permissions}
                      </span>
                    </div>
                  </div>

                  {/* Presentation Details */}
                  <div className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{presentation.title}</h3>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500">Shared with</p>
                        <p className="font-medium text-gray-900">{presentation.sharedWith} members</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Views</p>
                        <p className="font-medium text-gray-900">{presentation.views}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Comments</p>
                        <p className="font-medium text-gray-900">{presentation.comments}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last activity</p>
                        <p className="font-medium text-gray-900">{presentation.lastActivity}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Shared by {presentation.sharedBy}</span>
                      <span>{presentation.sharedAt}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-blue-500 transition-colors duration-200">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-green-500 transition-colors duration-200">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-purple-500 transition-colors duration-200">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'comments' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Comments List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6">
              <div className="space-y-6">
                {recentComments.map((comment) => (
                  <div key={comment.id} className="flex space-x-4 p-4 bg-white/50 rounded-lg border border-purple-50">
                    <div className={`w-10 h-10 bg-${comment.avatar} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {comment.author.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{comment.author}</h4>
                          {comment.slideNumber && (
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                              Slide {comment.slideNumber}
                            </span>
                          )}
                          {comment.isResolved && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <span className="text-sm text-gray-500">{comment.timestamp}</span>
                      </div>

                      <p className="text-gray-700 mb-3">{comment.message}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors duration-200">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{comment.likes}</span>
                          </button>
                          {comment.replies > 0 && (
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors duration-200">
                              <MessageCircle className="w-4 h-4" />
                              <span className="text-sm">{comment.replies} replies</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          {!comment.isResolved && (
                            <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                              Resolve
                            </button>
                          )}
                          <button className="text-sm text-gray-500 hover:text-gray-700">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-6 pt-6 border-t border-purple-100">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    U
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
                          <Smile className="w-4 h-4" />
                        </button>
                      </div>
                      <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2">
                        <Send className="w-4 h-4" />
                        <span>Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-purple-100 p-6"
          >
            <div className="space-y-4">
              {[
                { type: 'share', user: 'Sarah Johnson', action: 'shared Q3 Business Strategy with 5 team members', time: '10 minutes ago', icon: <Share2 className="w-4 h-4 text-blue-500" /> },
                { type: 'comment', user: 'Michael Chen', action: 'commented on Product Roadmap 2025', time: '25 minutes ago', icon: <MessageSquare className="w-4 h-4 text-green-500" /> },
                { type: 'edit', user: 'Emma Wilson', action: 'edited Marketing Campaign Results', time: '1 hour ago', icon: <Edit3 className="w-4 h-4 text-purple-500" /> },
                { type: 'join', user: 'Alex Kim', action: 'joined the team', time: '2 hours ago', icon: <UserPlus className="w-4 h-4 text-orange-500" /> },
                { type: 'view', user: 'David Rodriguez', action: 'viewed Team Training Materials', time: '3 hours ago', icon: <Eye className="w-4 h-4 text-gray-500" /> },
                { type: 'resolve', user: 'Lisa Thompson', action: 'resolved 3 comments on Q3 Business Strategy', time: '4 hours ago', icon: <CheckCircle2 className="w-4 h-4 text-green-500" /> }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-white/50 rounded-lg border border-purple-50">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Modern Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white mt-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">PrezentAI Collaboration</h3>
              <p className="text-purple-200 mb-6 max-w-md">
                Work together seamlessly with your team on presentations.
                Share, comment, and collaborate in real-time to create amazing presentations together.
              </p>
              <div className="flex space-x-4">
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Users className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <button className="bg-white/10 hover:bg-white/20 p-3 rounded-lg transition-all duration-200">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Collaboration Tools</h4>
              <ul className="space-y-2 text-purple-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Real-time Editing</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Comment System</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Permission Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Activity Tracking</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Team Features</h4>
              <ul className="space-y-2 text-purple-200">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Team Workspaces</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Role Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Sharing Controls</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Video Meetings</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-purple-200 text-sm">
              © 2025 PrezentAI Collaboration. Bringing teams together through presentations.
            </p>
            <div className="mt-4 md:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                👥 24 Active Team Members
              </span>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
