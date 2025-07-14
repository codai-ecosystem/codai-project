import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import {
  Users,
  Share2,
  UserPlus,
  Eye,
  Edit,
  MessageCircle,
  Clock,
  CheckCircle2,
  X,
  Send,
  Lock,
  Unlock,
  Globe,
  UserCheck,
  AlertCircle,
  Copy,
  Link,
  Settings,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Bell,
  Zap,
  Activity,
  Crown,
  Shield,
  UserX
} from 'lucide-react'

interface CollaboratorPresence {
  id: string
  name: string
  avatar?: string
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
  status: 'active' | 'idle' | 'away'
  joinedAt: string
  lastActivity: string
  role: 'owner' | 'editor' | 'viewer' | 'commenter'
  color: string
}

interface SharedMemory {
  id: string
  title: string
  isShared: boolean
  shareLink?: string
  permissions: {
    canEdit: boolean
    canComment: boolean
    canShare: boolean
    isPublic: boolean
  }
  collaborators: CollaboratorPresence[]
  shareSettings: {
    expiresAt?: string
    requiresAuth: boolean
    allowGuests: boolean
    maxCollaborators: number
  }
  activity: ActivityItem[]
}

interface ActivityItem {
  id: string
  type: 'edit' | 'comment' | 'share' | 'join' | 'leave' | 'reaction'
  user: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  description: string
  metadata?: any
}

interface Comment {
  id: string
  memoryId: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: string
  position?: { x: number; y: number }
  isResolved: boolean
  replies: Comment[]
  reactions: Array<{
    type: 'like' | 'love' | 'wow' | 'celebrate'
    userId: string
    timestamp: string
  }>
}

interface CollaborationProps {
  memoryId: string
  isOwner: boolean
  onMemoryUpdate?: (memory: SharedMemory) => void
}

const Collaboration: React.FC<CollaborationProps> = ({
  memoryId,
  isOwner,
  onMemoryUpdate
}) => {
  const [memory, setMemory] = useState<SharedMemory | null>(null)
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showCollaborators, setShowCollaborators] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [socketConnected, setSocketConnected] = useState(false)
  const [currentUser] = useState({
    id: 'user-1',
    name: 'Current User',
    color: '#8b5cf6'
  })

  const socketRef = useRef<Socket | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    initializeCollaboration()
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [memoryId])

  const initializeCollaboration = async () => {
    try {
      // Initialize WebSocket connection
      socketRef.current = io('/collaboration', {
        query: { memoryId, userId: currentUser.id }
      })

      const socket = socketRef.current

      socket.on('connect', () => {
        setSocketConnected(true)
        socket.emit('join-memory', { memoryId, user: currentUser })
      })

      socket.on('disconnect', () => {
        setSocketConnected(false)
      })

      socket.on('collaborator-joined', (collaborator: CollaboratorPresence) => {
        setCollaborators(prev => [...prev.filter(c => c.id !== collaborator.id), collaborator])
      })

      socket.on('collaborator-left', (collaboratorId: string) => {
        setCollaborators(prev => prev.filter(c => c.id !== collaboratorId))
      })

      socket.on('presence-update', (presence: { userId: string; cursor?: any; selection?: any }) => {
        setCollaborators(prev => prev.map(c =>
          c.id === presence.userId
            ? { ...c, cursor: presence.cursor, selection: presence.selection, lastActivity: new Date().toISOString() }
            : c
        ))
      })

      socket.on('memory-updated', (updatedMemory: SharedMemory) => {
        setMemory(updatedMemory)
        onMemoryUpdate?.(updatedMemory)
      })

      socket.on('comment-added', (comment: Comment) => {
        setComments(prev => [...prev, comment])
      })

      socket.on('activity-update', (activity: ActivityItem) => {
        if (memory) {
          setMemory(prev => prev ? {
            ...prev,
            activity: [activity, ...prev.activity].slice(0, 50)
          } : prev)
        }
      })

      // Load memory data
      await loadMemoryData()
      await loadComments()

    } catch (error) {
      console.error('Failed to initialize collaboration:', error)
    }
  }

  const loadMemoryData = async () => {
    try {
      const response = await fetch(`/api/memory/${memoryId}/collaboration`)
      if (response.ok) {
        const memoryData = await response.json()
        setMemory(memoryData)
      }
    } catch (error) {
      console.error('Failed to load memory data:', error)
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`/api/memory/${memoryId}/comments`)
      if (response.ok) {
        const commentsData = await response.json()
        setComments(commentsData)
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    }
  }

  const shareMemory = async (settings: SharedMemory['shareSettings']) => {
    try {
      const response = await fetch(`/api/memory/${memoryId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const updatedMemory = await response.json()
        setMemory(updatedMemory)

        // Emit to socket for real-time updates
        socketRef.current?.emit('memory-shared', {
          memoryId,
          shareSettings: settings,
          user: currentUser
        })
      }
    } catch (error) {
      console.error('Failed to share memory:', error)
    }
  }

  const inviteCollaborator = async (email: string, role: CollaboratorPresence['role']) => {
    try {
      const response = await fetch(`/api/memory/${memoryId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      })

      if (response.ok) {
        const invitation = await response.json()

        // Emit to socket
        socketRef.current?.emit('collaborator-invited', {
          memoryId,
          invitation,
          user: currentUser
        })
      }
    } catch (error) {
      console.error('Failed to invite collaborator:', error)
    }
  }

  const addComment = async (content: string, position?: { x: number; y: number }) => {
    if (!content.trim()) return

    try {
      const response = await fetch(`/api/memory/${memoryId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          position,
          author: currentUser
        })
      })

      if (response.ok) {
        const comment = await response.json()
        setComments(prev => [...prev, comment])
        setNewComment('')

        // Emit to socket
        socketRef.current?.emit('comment-added', {
          memoryId,
          comment,
          user: currentUser
        })
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const updatePresence = (cursor?: any, selection?: any) => {
    socketRef.current?.emit('presence-update', {
      memoryId,
      userId: currentUser.id,
      cursor,
      selection
    })
  }

  const copyShareLink = async () => {
    if (memory?.shareLink) {
      await navigator.clipboard.writeText(memory.shareLink)
      // Show toast notification
    }
  }

  const getStatusColor = (status: CollaboratorPresence['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-400'
      case 'idle': return 'bg-yellow-400'
      case 'away': return 'bg-slate-400'
      default: return 'bg-slate-400'
    }
  }

  const getRoleIcon = (role: CollaboratorPresence['role']) => {
    switch (role) {
      case 'owner': return Crown
      case 'editor': return Edit
      case 'viewer': return Eye
      case 'commenter': return MessageCircle
      default: return Users
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return time.toLocaleDateString()
  }

  if (!memory) {
    return (
      <div className="flex items-center justify-center p-8">
        <motion.div
          className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <span className="ml-3 text-slate-300">Loading collaboration...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Collaboration Toolbar */}
      <div className="flex items-center justify-between bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
        <div className="flex items-center space-x-4">
          {/* Collaborators Avatars */}
          <div className="flex items-center space-x-2">
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="relative w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white/20 flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(collaborator.status)}`} />
                </div>
              ))}
              {collaborators.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-slate-600 border-2 border-white/20 flex items-center justify-center text-white text-xs font-medium">
                  +{collaborators.length - 3}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCollaborators(true)}
              className="text-slate-300 hover:text-white transition-colors"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-400' : 'bg-red-400'}`} />
            <span className="text-slate-300 text-sm">
              {socketConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Activity Button */}
          <button
            onClick={() => setShowActivity(true)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Activity className="w-5 h-5 text-slate-300" />
          </button>

          {/* Share Button */}
          {isOwner && (
            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Comments ({comments.length})
          </h3>
        </div>

        {/* Comment Input */}
        <div className="mb-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <span>Supports @mentions and markdown</span>
                </div>
                <button
                  onClick={() => addComment(newComment)}
                  disabled={!newComment.trim()}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{comment.author.name}</span>
                    <span className="text-slate-400 text-sm">{formatTimeAgo(comment.timestamp)}</span>
                  </div>
                  <p className="text-slate-300 text-sm">{comment.content}</p>

                  {/* Comment Actions */}
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm">Like</span>
                    </button>
                    <button className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm">Reply</span>
                    </button>
                    {comment.isResolved && (
                      <span className="flex items-center space-x-1 text-emerald-400 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolved</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Dialog */}
      <AnimatePresence>
        {showShareDialog && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowShareDialog(false)}
          >
            <motion.div
              className="bg-slate-900 rounded-xl p-6 w-full max-w-md border border-white/20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Share Memory</h3>
                <button
                  onClick={() => setShowShareDialog(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Share Link */}
                {memory.isShared && (
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300">Share Link</span>
                      <button
                        onClick={copyShareLink}
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        value={memory.shareLink || ''}
                        readOnly
                        className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
                      />
                      <button
                        onClick={copyShareLink}
                        className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded text-white text-sm transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}

                {/* Permissions */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Permissions</h4>

                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Public access</span>
                    <input
                      type="checkbox"
                      checked={memory.permissions.isPublic}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Allow editing</span>
                    <input
                      type="checkbox"
                      checked={memory.permissions.canEdit}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                    />
                  </label>

                  <label className="flex items-center justify-between">
                    <span className="text-slate-300">Allow comments</span>
                    <input
                      type="checkbox"
                      checked={memory.permissions.canComment}
                      className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
                    />
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => shareMemory(memory.shareSettings)}
                    className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                  >
                    {memory.isShared ? 'Update Settings' : 'Enable Sharing'}
                  </button>

                  {memory.isShared && (
                    <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                      Disable
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaborators Panel */}
      <AnimatePresence>
        {showCollaborators && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCollaborators(false)}
          >
            <motion.div
              className="bg-slate-900 rounded-xl p-6 w-full max-w-lg border border-white/20 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Collaborators ({collaborators.length})
                </h3>
                <button
                  onClick={() => setShowCollaborators(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {collaborators.map((collaborator) => {
                  const RoleIcon = getRoleIcon(collaborator.role)
                  return (
                    <div key={collaborator.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className="relative w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                          style={{ backgroundColor: collaborator.color }}
                        >
                          {collaborator.name.charAt(0).toUpperCase()}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${getStatusColor(collaborator.status)}`} />
                        </div>
                        <div>
                          <div className="text-white font-medium">{collaborator.name}</div>
                          <div className="text-slate-400 text-sm flex items-center space-x-2">
                            <RoleIcon className="w-4 h-4" />
                            <span>{collaborator.role}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(collaborator.lastActivity)}</span>
                          </div>
                        </div>
                      </div>

                      {isOwner && collaborator.role !== 'owner' && (
                        <button className="text-slate-400 hover:text-red-400 transition-colors">
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Invite Section */}
              {isOwner && (
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center space-x-3">
                    <input
                      placeholder="Email address"
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                      <option value="viewer">Viewer</option>
                      <option value="commenter">Commenter</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Panel */}
      <AnimatePresence>
        {showActivity && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowActivity(false)}
          >
            <motion.div
              className="bg-slate-900 rounded-xl p-6 w-full max-w-lg border border-white/20 max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <button
                  onClick={() => setShowActivity(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {memory.activity.map((item) => (
                  <div key={item.id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {item.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-300 text-sm">{item.description}</p>
                      <span className="text-slate-400 text-xs">{formatTimeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Collaboration
