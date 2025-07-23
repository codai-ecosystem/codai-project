'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  PhoneIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BellIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  TagIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import {
  Team,
  TeamMember,
  TeamRole,
  Permission,
  LiveSession,
  SessionParticipant,
  TeamInvitation,
  ActivityEvent,
  TeamSettings,
  NotificationSettings,
  Comment,
  Review
} from '../../lib/types/enhanced-types'

interface TeamCollaborationProps {
  teamId: string
  currentUserId: string
}

export function TeamCollaboration({ teamId, currentUserId }: TeamCollaborationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'permissions' | 'activity' | 'settings'>('overview')
  const [team, setTeam] = useState<Team | null>(null)
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null)
  const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Mock team data
  useEffect(() => {
    const mockTeam: Team = {
      id: teamId,
      name: 'Frontend Development Team',
      description: 'Responsible for all frontend development and user experience',
      avatar: '',
      members: [
        {
          id: '1',
          userId: '1',
          teamId: teamId,
          role: 'owner',
          permissions: ['all'],
          joinedAt: new Date('2024-01-01'),
          lastActive: new Date(),
          user: { id: '1', name: 'John Doe', email: 'john@example.com', status: 'online' }
        },
        {
          id: '2',
          userId: '2',
          teamId: teamId,
          role: 'admin',
          permissions: ['project_manage', 'team_manage', 'deploy'],
          joinedAt: new Date('2024-01-15'),
          lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
          user: { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'away' }
        },
        {
          id: '3',
          userId: '3',
          teamId: teamId,
          role: 'developer',
          permissions: ['code_write', 'code_review'],
          joinedAt: new Date('2024-02-01'),
          lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
          user: { id: '3', name: 'Mike Johnson', email: 'mike@example.com', status: 'offline' }
        }
      ],
      settings: {
        isPublic: false,
        allowGuestAccess: false,
        defaultRole: 'viewer',
        requireApproval: true,
        notifications: {
          mentions: true,
          comments: true,
          reviews: true,
          deployments: true,
          invitations: true
        }
      },
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date()
    }

    setTeam(mockTeam)

    // Mock live session
    setLiveSession({
      id: 'session-1',
      teamId: teamId,
      projectId: 'project-1',
      participants: mockTeam.members.filter(m => m.user.status === 'online').map(member => ({
        userId: member.userId,
        user: member.user,
        cursor: { file: '/src/components/App.tsx', line: 45, column: 20 },
        isTyping: Math.random() > 0.5,
        lastSeen: new Date()
      })),
      startedAt: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      isRecording: false
    })

    // Mock recent activity
    setRecentActivity([
      {
        id: '1',
        type: 'commit',
        userId: '2',
        projectId: 'project-1',
        title: 'Fix navigation bug in header component',
        description: 'Resolved issue where mobile menu wouldn\'t close properly',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        metadata: { commitId: 'abc123', branch: 'main' }
      },
      {
        id: '2',
        type: 'comment',
        userId: '1',
        projectId: 'project-1',
        title: 'Added comment on Button.tsx',
        description: 'Suggested improvements to the button styling',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        metadata: { file: '/src/components/Button.tsx', line: 25 }
      },
      {
        id: '3',
        type: 'deployment',
        userId: '3',
        projectId: 'project-1',
        title: 'Deployed to staging',
        description: 'Version 1.2.3 deployed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        metadata: { environment: 'staging', version: '1.2.3' }
      }
    ])

    // Mock pending invitations
    setPendingInvitations([
      {
        id: '1',
        teamId: teamId,
        email: 'new.developer@example.com',
        role: 'developer',
        invitedBy: '1',
        invitedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 6), // 6 days from now
        status: 'pending'
      }
    ])
  }, [teamId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-400'
      case 'away':
        return 'bg-yellow-400'
      case 'busy':
        return 'bg-red-400'
      default:
        return 'bg-gray-400'
    }
  }

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
      case 'developer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'designer':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300'
      case 'viewer':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const canManageTeam = (member: TeamMember) => {
    return member.role === 'owner' || member.permissions.includes('team_manage')
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (!team) {
    return <div className="p-8 text-center">Loading team...</div>
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: EyeIcon },
    { id: 'members', name: 'Members', icon: UserGroupIcon },
    { id: 'permissions', name: 'Permissions', icon: ShieldCheckIcon },
    { id: 'activity', name: 'Activity', icon: ClockIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon }
  ]

  return (
    <div className="h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{team.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {liveSession && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Live: {liveSession.participants.length} active</span>
              </div>
            )}

            <button
              onClick={() => setShowInviteModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>Invite Member</span>
            </button>
          </div>
        </div>

        {/* Live participants */}
        {liveSession && liveSession.participants.length > 0 && (
          <div className="mt-4 flex items-center space-x-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Currently active:</span>
            <div className="flex items-center -space-x-2">
              {liveSession.participants.map(participant => (
                <div
                  key={participant.userId}
                  className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800"
                  title={participant.user.name}
                >
                  {participant.user.name[0]}
                  {participant.isTyping && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse ring-2 ring-white dark:ring-gray-800" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Team Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{team.members.length}</p>
                    </div>
                    <UserGroupIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Active Now</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {team.members.filter(m => m.user.status === 'online').length}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pending Invites</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{pendingInvitations.length}</p>
                    </div>
                    <ClockIcon className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Projects</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">3</p>
                    </div>
                    <FolderIcon className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map(activity => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        {activity.type === 'commit' && <DocumentDuplicateIcon className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'comment' && <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600" />}
                        {activity.type === 'deployment' && <CheckCircleIcon className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white">{activity.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Members List */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-4">
                  {team.members.map(member => (
                    <div key={member.id} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                            {member.user.name[0]}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.user.status)} rounded-full ring-2 ring-white dark:ring-gray-800`} />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(member.role)}`}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Last active {formatTimeAgo(member.lastActive)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {canManageTeam(team.members.find(m => m.userId === currentUserId)!) && member.userId !== currentUserId && (
                          <>
                            <button
                              onClick={() => setSelectedMember(member)}
                              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600">
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <EllipsisVerticalIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pending Invitations */}
              {pendingInvitations.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pending Invitations</h3>
                  <div className="space-y-3">
                    {pendingInvitations.map(invitation => (
                      <div key={invitation.id} className="flex items-center justify-between py-2">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{invitation.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Invited {formatTimeAgo(invitation.invitedAt)} • Role: {invitation.role}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                            Resend
                          </button>
                          <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Team Activity</h3>
                <div className="space-y-6">
                  {recentActivity.map(activity => (
                    <div key={activity.id} className="relative">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {activity.type === 'commit' && <DocumentDuplicateIcon className="w-5 h-5 text-blue-600" />}
                          {activity.type === 'comment' && <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />}
                          {activity.type === 'deployment' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{activity.description}</p>
                          {activity.metadata && (
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {Object.entries(activity.metadata).map(([key, value]) => (
                                <span key={key} className="mr-4">
                                  {key}: {String(value)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
