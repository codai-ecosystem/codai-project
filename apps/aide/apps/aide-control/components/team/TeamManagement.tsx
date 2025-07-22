'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  CogIcon,
  ShieldCheckIcon,
  KeyIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { User, TeamRole as Role, Permission, TeamMember, ActivityEvent as Activity } from '../../lib/types/enhanced-types'

interface TeamManagementProps {
  projectId: string
  currentUser: User
  onUserInvite?: (email: string, role: Role) => Promise<void>
  onUserRemove?: (userId: string) => Promise<void>
  onRoleUpdate?: (userId: string, newRole: Role) => Promise<void>
}

interface UserActivity {
  id: string
  type: 'user_invited' | 'user_removed' | 'role_updated'
  userId: string
  userName: string
  timestamp: Date
  details: Record<string, any>
}

interface UserRoleEditorProps {
  user: TeamMember
  availableRoles: Role[]
  onRoleChange: (userId: string, newRole: Role) => void
  onPermissionChange: (userId: string, permission: Permission, granted: boolean) => void
}

export function TeamManagement({ projectId, currentUser, onUserInvite, onUserRemove, onRoleUpdate }: TeamManagementProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('viewer')
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [activities, setActivities] = useState<UserActivity[]>([])

  const roles: Role[] = ['owner', 'admin', 'developer', 'designer', 'viewer']
  
  const rolePermissions: Record<Role, Permission[]> = {
    owner: ['all'],
    admin: ['project_manage', 'team_manage', 'code_write', 'code_review', 'deploy'],
    developer: ['code_write', 'code_review', 'deploy'],
    designer: ['code_write'],
    viewer: ['code_review']
  }

  const roleColors: Record<Role, string> = {
    owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    developer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    designer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }

  useEffect(() => {
    loadTeamMembers()
    loadActivities()
  }, [projectId])

  const loadTeamMembers = async () => {
    setLoading(true)
    
    // Mock team members data
    const mockMembers: TeamMember[] = [
      {
        id: '1',
        userId: '1',
        teamId: projectId,
        role: 'owner',
        permissions: rolePermissions.owner,
        joinedAt: new Date('2024-01-15'),
        lastActive: new Date(),
        user: {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          avatar: '',
          status: 'online'
        }
      },
      {
        id: '2',
        userId: '2',
        teamId: projectId,
        role: 'admin',
        permissions: rolePermissions.admin,
        joinedAt: new Date('2024-02-01'),
        lastActive: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        user: {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          avatar: '',
          status: 'online'
        }
      },
      {
        id: '3',
        userId: '3',
        teamId: projectId,
        role: 'developer',
        permissions: rolePermissions.developer,
        joinedAt: new Date('2024-02-10'),
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        user: {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike@example.com',
          avatar: '',
          status: 'away'
        }
      },
      {
        id: '4',
        userId: '4',
        teamId: projectId,
        role: 'designer',
        permissions: rolePermissions.designer,
        joinedAt: new Date('2024-03-01'),
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        user: {
          id: '4',
          name: 'Sarah Wilson',
          email: 'sarah@example.com',
          avatar: '',
          status: 'offline'
        }
      }
    ]
    
    setTeamMembers(mockMembers)
    setLoading(false)
  }

  const loadActivities = async () => {
    // Mock activities
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        type: 'user_invited',
        userId: '2',
        userName: 'Jane Smith',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        details: { role: 'admin', invitedBy: 'John Doe' }
      },
      {
        id: '2',
        type: 'role_updated',
        userId: '3',
        userName: 'Mike Johnson',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        details: { oldRole: 'viewer', newRole: 'developer', changedBy: 'John Doe' }
      },
      {
        id: '3',
        type: 'user_removed',
        userId: '5',
        userName: 'Tom Brown',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        details: { removedBy: 'Jane Smith', reason: 'Project completed' }
      }
    ]
    
    setActivities(mockActivities)
  }

  const handleInviteUser = async () => {
    if (!inviteEmail || !onUserInvite) return
    
    setLoading(true)
    try {
      await onUserInvite(inviteEmail, inviteRole)
      setInviteEmail('')
      setInviteRole('viewer')
      setShowInviteModal(false)
      await loadTeamMembers()
    } catch (error) {
      console.error('Failed to invite user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveUser = async (userId: string) => {
    if (!onUserRemove) return
    
    if (confirm('Are you sure you want to remove this user from the project?')) {
      setLoading(true)
      try {
        await onUserRemove(userId)
        await loadTeamMembers()
      } catch (error) {
        console.error('Failed to remove user:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: Role) => {
    if (!onRoleUpdate) return
    
    setLoading(true)
    try {
      await onRoleUpdate(userId, newRole)
      await loadTeamMembers()
    } catch (error) {
      console.error('Failed to update role:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
      case 'offline': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
      case 'away': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
      case 'busy': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    }
  }

  const formatLastActive = (date: Date | null) => {
    if (!date) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (minutes < 5) return 'Online now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserGroupIcon className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage team members, roles, and permissions
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <UserPlusIcon className="w-4 h-4" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Members List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Team Members ({teamMembers.length})
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {teamMembers.map(member => (
                <div key={member.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {member.user.name.charAt(0)}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {member.user.name}
                          </h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[member.role]}`}>
                            {member.role}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.user.status)}`}>
                            {member.user.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {member.user.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Last active: {formatLastActive(member.lastActive)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedUser(member)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedUser(member)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      {member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveUser(member.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Log */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <ClockIcon className="w-4 h-4" />
                <span>Recent Activity</span>
              </h3>
            </div>
            
            <div className="p-4 space-y-4">
              {activities.map(activity => (
                <div key={activity.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'user_invited' && (
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <UserPlusIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                    )}
                    {activity.type === 'user_removed' && (
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <UserMinusIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                    )}
                    {activity.type === 'role_updated' && (
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <ShieldCheckIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.userName}</span>
                      {activity.type === 'user_invited' && ' was invited to the project'}
                      {activity.type === 'user_removed' && ' was removed from the project'}
                      {activity.type === 'role_updated' && ' role was updated'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Invite Team Member
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {roles.filter(role => role !== 'owner').map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="mb-2">This role will have the following permissions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {rolePermissions[inviteRole].map(permission => (
                      <li key={permission}>{permission}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteUser}
                  disabled={!inviteEmail || loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg"
                >
                  {loading ? 'Inviting...' : 'Send Invite'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <UserRoleEditor
            user={selectedUser}
            availableRoles={roles}
            onRoleChange={handleRoleUpdate}
            onPermissionChange={(userId, permission, granted) => {
              // Handle permission changes
              console.log('Permission change:', { userId, permission, granted })
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function UserRoleEditor({ user, availableRoles, onRoleChange, onPermissionChange }: UserRoleEditorProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit User Permissions
          </h3>
          <button className="text-gray-400 hover:text-gray-600">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {user.user.name.charAt(0)}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {user.user.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.user.email}
              </p>
            </div>
          </div>
          
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableRoles.filter(role => role !== 'owner' || user.role === 'owner').map(role => (
                <button
                  key={role}
                  onClick={() => onRoleChange(user.id, role)}
                  className={`p-3 border-2 rounded-lg text-left ${
                    user.role === role
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {role === 'owner' && 'Full access to everything'}
                    {role === 'admin' && 'Manage team and settings'}
                    {role === 'developer' && 'Write code and deploy'}
                    {role === 'designer' && 'Design and assets'}
                    {role === 'viewer' && 'Read-only access'}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Permissions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['read', 'write', 'admin', 'delete', 'invite', 'billing', 'deploy', 'design'] as Permission[]).map(permission => (
                <div key={permission} className="flex items-center space-x-3 p-2">
                  <input
                    type="checkbox"
                    checked={user.permissions.includes(permission)}
                    onChange={(e) => onPermissionChange(user.id, permission, e.target.checked)}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {permission.charAt(0).toUpperCase() + permission.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
