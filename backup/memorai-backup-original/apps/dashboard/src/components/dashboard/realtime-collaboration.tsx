/**
 * Real-time Collaboration for Memorai V3.0
 * Multi-user editing with comment systems and activity streams
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useMemoryStore } from '../../stores/memory-store';
import {
  Users,
  MessageCircle,
  Activity,
  User,
  Edit3,
  Clock,
  Eye,
  Share2,
  Bell,
  Video,
  Mic,
  Monitor,
  Settings,
  UserPlus,
  Zap,
  FileText,
  GitBranch,
  CheckCircle,
  AlertCircle,
  XCircle,
  Sparkles,
  Globe,
  Lock,
  Heart,
  ThumbsUp,
  Flag,
  MoreHorizontal,
  Send,
  Paperclip,
  Smile,
  AtSign,
  Hash,
  Calendar,
  MapPin,
  UserCheck,
  MessageSquare,
  Bookmark,
  Star,
} from 'lucide-react';

interface CollaboratorUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  isActive: boolean;
  lastSeen: Date;
  permissions: ('view' | 'edit' | 'comment' | 'admin')[];
  location?: {
    memoryId: string;
    section: string;
    cursor: number;
  };
}

interface Comment {
  id: string;
  content: string;
  authorId: string;
  memoryId: string;
  position?: {
    start: number;
    end: number;
    text: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
  reactions: { emoji: string; users: string[] }[];
  replies: Comment[];
  mentions: string[];
  attachments?: { name: string; url: string; type: string }[];
}

interface ActivityEvent {
  id: string;
  type: 'edit' | 'comment' | 'join' | 'leave' | 'share' | 'reaction' | 'mention' | 'resolve';
  userId: string;
  memoryId?: string;
  commentId?: string;
  details: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface EditOperation {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  length?: number;
  userId: string;
  timestamp: Date;
  applied: boolean;
}

interface CollaborationSession {
  id: string;
  memoryId: string;
  participants: CollaboratorUser[];
  isLive: boolean;
  startedAt: Date;
  lastActivity: Date;
  pendingOperations: EditOperation[];
  cursorPositions: Record<string, { position: number; selection?: [number, number] }>;
}

export const RealtimeCollaboration: React.FC = () => {
  const { memories, fetchMemories } = useMemoryStore();
  const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [currentUser] = useState<CollaboratorUser>({
    id: 'current-user',
    name: 'You',
    email: 'user@example.com',
    avatar: '', // Empty avatar - will show initials instead of placeholder
    status: 'online',
    isActive: true,
    lastSeen: new Date(),
    permissions: ['view', 'edit', 'comment', 'admin'],
  });

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const commentRef = useRef<HTMLInputElement>(null);

  // Initialize with sample data
  useEffect(() => {
    const sampleCollaborators: CollaboratorUser[] = [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        avatar: '/api/placeholder/32/32',
        status: 'online',
        isActive: true,
        lastSeen: new Date(),
        permissions: ['view', 'edit', 'comment'],
        location: {
          memoryId: 'mem-1',
          section: 'content',
          cursor: 150,
        },
      },
      {
        id: 'user-2',
        name: 'Bob Chen',
        email: 'bob@example.com',
        avatar: '/api/placeholder/32/32',
        status: 'away',
        isActive: false,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000),
        permissions: ['view', 'comment'],
      },
      {
        id: 'user-3',
        name: 'Carol Davis',
        email: 'carol@example.com',
        avatar: '/api/placeholder/32/32',
        status: 'online',
        isActive: true,
        lastSeen: new Date(),
        permissions: ['view', 'edit', 'comment', 'admin'],
        location: {
          memoryId: 'mem-2',
          section: 'metadata',
          cursor: 45,
        },
      },
      {
        id: 'user-4',
        name: 'David Wilson',
        email: 'david@example.com',
        avatar: '/api/placeholder/32/32',
        status: 'busy',
        isActive: false,
        lastSeen: new Date(Date.now() - 15 * 60 * 1000),
        permissions: ['view'],
      },
    ];

    const sampleComments: Comment[] = [
      {
        id: 'comment-1',
        content: 'This section needs more detail about the implementation approach.',
        authorId: 'user-1',
        memoryId: 'mem-1',
        position: { start: 120, end: 180, text: 'implementation approach' },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isResolved: false,
        reactions: [
          { emoji: '👍', users: ['user-2', 'user-3'] },
          { emoji: '💡', users: ['user-3'] },
        ],
        replies: [
          {
            id: 'reply-1',
            content: 'Agreed! I can add more technical details here.',
            authorId: 'user-3',
            memoryId: 'mem-1',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            isResolved: false,
            reactions: [{ emoji: '👍', users: ['user-1'] }],
            replies: [],
            mentions: ['user-1'],
          },
        ],
        mentions: [],
      },
      {
        id: 'comment-2',
        content: 'Should we include performance benchmarks in this memory?',
        authorId: 'user-2',
        memoryId: 'mem-1',
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000),
        isResolved: false,
        reactions: [],
        replies: [],
        mentions: ['user-3'],
      },
      {
        id: 'comment-3',
        content: 'Great work on the API documentation! ✨',
        authorId: 'user-3',
        memoryId: 'mem-2',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000),
        isResolved: true,
        reactions: [
          { emoji: '🎉', users: ['user-1', 'user-2'] },
          { emoji: '❤️', users: ['user-4'] },
        ],
        replies: [],
        mentions: [],
      },
    ];

    const sampleActivities: ActivityEvent[] = [
      {
        id: 'activity-1',
        type: 'edit',
        userId: 'user-1',
        memoryId: 'mem-1',
        details: 'Updated the introduction section',
        timestamp: new Date(Date.now() - 10 * 60 * 1000),
        metadata: { section: 'introduction', changes: 45 },
      },
      {
        id: 'activity-2',
        type: 'comment',
        userId: 'user-2',
        memoryId: 'mem-1',
        commentId: 'comment-2',
        details: 'Added a comment about performance benchmarks',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        id: 'activity-3',
        type: 'join',
        userId: 'user-3',
        details: 'Joined the collaboration session',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
      },
      {
        id: 'activity-4',
        type: 'resolve',
        userId: 'user-3',
        commentId: 'comment-3',
        details: 'Resolved comment about API documentation',
        timestamp: new Date(Date.now() - 50 * 60 * 1000),
      },
      {
        id: 'activity-5',
        type: 'share',
        userId: 'user-1',
        memoryId: 'mem-2',
        details: 'Shared memory with external team',
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        metadata: { shareType: 'external', permissions: 'view' },
      },
    ];

    const sampleSessions: CollaborationSession[] = [
      {
        id: 'session-1',
        memoryId: 'mem-1',
        participants: [sampleCollaborators[0], sampleCollaborators[2], currentUser],
        isLive: true,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000),
        pendingOperations: [],
        cursorPositions: {
          'user-1': { position: 150, selection: [140, 180] },
          'user-3': { position: 45 },
        },
      },
      {
        id: 'session-2',
        memoryId: 'mem-2',
        participants: [sampleCollaborators[1], currentUser],
        isLive: false,
        startedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
        pendingOperations: [],
        cursorPositions: {},
      },
    ];

    setCollaborators(sampleCollaborators);
    setComments(sampleComments);
    setActivities(sampleActivities);
    setSessions(sampleSessions);
    fetchMemories();
  }, [fetchMemories]);

  // Real-time simulation
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time updates
      // Remove simulation - use real collaboration updates only
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const simulateRealtimeUpdates = () => {
    // Simulate user activity
    const randomUser = collaborators[Math.floor(Math.random() * collaborators.length)];
    if (randomUser && Math.random() > 0.7) {
      const newActivity: ActivityEvent = {
        id: `activity-${Date.now()}`,
        type: Math.random() > 0.5 ? 'edit' : 'comment',
        userId: randomUser.id,
        memoryId: selectedMemory || 'mem-1',
        details: `${randomUser.name} made an update`,
        timestamp: new Date(),
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 19)]);
    }

    // Simulate cursor movements
    if (selectedMemory) {
      setSessions(prev => prev.map(session => {
        if (session.memoryId === selectedMemory && session.isLive) {
          const updatedPositions = { ...session.cursorPositions };
          session.participants.forEach(participant => {
            if (participant.id !== currentUser.id && Math.random() > 0.6) {
              updatedPositions[participant.id] = {
                position: Math.floor(Math.random() * 500),
              };
            }
          });
          return { ...session, cursorPositions: updatedPositions };
        }
        return session;
      }));
    }
  };

  // Comment management
  const addComment = (memoryId: string, content: string, position?: { start: number; end: number; text: string }) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      content,
      authorId: currentUser.id,
      memoryId,
      position,
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false,
      reactions: [],
      replies: [],
      mentions: extractMentions(content),
    };

    setComments(prev => [newComment, ...prev]);

    // Add activity
    const activity: ActivityEvent = {
      id: `activity-${Date.now()}`,
      type: 'comment',
      userId: currentUser.id,
      memoryId,
      commentId: newComment.id,
      details: 'Added a new comment',
      timestamp: new Date(),
    };

    setActivities(prev => [activity, ...prev]);
  };

  const replyToComment = (commentId: string, content: string) => {
    const reply: Comment = {
      id: `reply-${Date.now()}`,
      content,
      authorId: currentUser.id,
      memoryId: selectedMemory || '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isResolved: false,
      reactions: [],
      replies: [],
      mentions: extractMentions(content),
    };

    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, replies: [...comment.replies, reply] };
      }
      return comment;
    }));
  };

  const addReaction = (commentId: string, emoji: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          if (existingReaction.users.includes(currentUser.id)) {
            existingReaction.users = existingReaction.users.filter(u => u !== currentUser.id);
          } else {
            existingReaction.users.push(currentUser.id);
          }
        } else {
          comment.reactions.push({ emoji, users: [currentUser.id] });
        }
      }
      return comment;
    }));
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId ? { ...comment, isResolved: !comment.isResolved } : comment
    ));

    const activity: ActivityEvent = {
      id: `activity-${Date.now()}`,
      type: 'resolve',
      userId: currentUser.id,
      commentId,
      details: 'Resolved a comment',
      timestamp: new Date(),
    };

    setActivities(prev => [activity, ...prev]);
  };

  const extractMentions = (text: string): string[] => {
    const mentions = text.match(/@(\w+)/g) || [];
    return mentions.map(mention => mention.substring(1));
  };

  // User management
  const inviteUser = (email: string) => {
    // Simulate user invitation
    console.log('Inviting user:', email);
  };

  const updateUserPermissions = (userId: string, permissions: string[]) => {
    setCollaborators(prev => prev.map(user =>
      user.id === userId ? { ...user, permissions: permissions as any[] } : user
    ));
  };

  // Get active session for memory
  const getActiveSession = (memoryId: string) => {
    return sessions.find(session => session.memoryId === memoryId && session.isLive);
  };

  // Get comments for memory
  const getCommentsForMemory = (memoryId: string) => {
    return comments.filter(comment => comment.memoryId === memoryId);
  };

  // Status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'edit': return <Edit3 className="h-4 w-4" />;
      case 'comment': return <MessageCircle className="h-4 w-4" />;
      case 'join': return <UserPlus className="h-4 w-4" />;
      case 'leave': return <User className="h-4 w-4" />;
      case 'share': return <Share2 className="h-4 w-4" />;
      case 'reaction': return <Heart className="h-4 w-4" />;
      case 'mention': return <AtSign className="h-4 w-4" />;
      case 'resolve': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Real-time Collaboration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Multi-user editing with comments and activity streams
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Comments ({comments.length})
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowActivity(!showActivity)}
          >
            <Activity className="h-4 w-4 mr-2" />
            Activity
          </Button>

          <Button
            size="sm"
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite
          </Button>
        </div>
      </div>

      {/* Collaboration Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {collaborators.filter(u => u.status === 'online').length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Comments</p>
                <p className="text-2xl font-bold text-blue-600">
                  {comments.length}
                </p>
              </div>
              <MessageCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Sessions</p>
                <p className="text-2xl font-bold text-purple-600">
                  {sessions.filter(s => s.isLive).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recent Activity</p>
                <p className="text-2xl font-bold text-orange-600">
                  {activities.filter(a => Date.now() - a.timestamp.getTime() < 60 * 60 * 1000).length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Collaboration Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  Collaborative Editor
                </div>
                <div className="flex items-center space-x-2">
                  {getActiveSession(selectedMemory || 'mem-1')?.participants.map(participant => (
                    <div key={participant.id} className="relative">
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-6 h-6 rounded-full border-2 border-white"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(participant.status)}`} />
                    </div>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Memory Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Memory
                </label>
                <select
                  value={selectedMemory || ''}
                  onChange={(e) => setSelectedMemory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                >
                  <option value="">Choose a memory to collaborate on</option>
                  {memories?.slice(0, 5).map((memory) => (
                    <option key={memory.id} value={memory.id}>
                      {memory.content?.substring(0, 50)}...
                    </option>
                  ))}
                </select>
              </div>

              {/* Editor Area */}
              {selectedMemory && (
                <div className="relative">
                  <textarea
                    ref={editorRef}
                    className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Start collaborating on this memory..."
                    defaultValue={memories?.find(m => m.id === selectedMemory)?.content || ''}
                  />

                  {/* Cursor indicators */}
                  {getActiveSession(selectedMemory)?.cursorPositions &&
                    Object.entries(getActiveSession(selectedMemory)!.cursorPositions).map(([userId, position]) => {
                      const user = collaborators.find(u => u.id === userId);
                      if (!user || userId === currentUser.id) return null;

                      return (
                        <div
                          key={userId}
                          className="absolute pointer-events-none"
                          style={{
                            top: `${Math.floor(position.position / 50) * 20 + 10}px`,
                            left: `${(position.position % 50) * 8 + 15}px`
                          }}
                        >
                          <div className="flex items-center space-x-1">
                            <div className="w-0.5 h-4 bg-blue-500 animate-pulse" />
                            <div className="px-2 py-1 bg-blue-500 text-white text-xs rounded whitespace-nowrap">
                              {user.name}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  }
                </div>
              )}

              {/* Comment Input */}
              <div className="flex items-center space-x-2">
                <input
                  ref={commentRef}
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newComment.trim() && selectedMemory) {
                      addComment(selectedMemory, newComment);
                      setNewComment('');
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (newComment.trim() && selectedMemory) {
                      addComment(selectedMemory, newComment);
                      setNewComment('');
                    }
                  }}
                  disabled={!newComment.trim() || !selectedMemory}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          {showComments && selectedMemory && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({getCommentsForMemory(selectedMemory).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {getCommentsForMemory(selectedMemory).map((comment) => {
                    const author = collaborators.find(u => u.id === comment.authorId) || currentUser;
                    return (
                      <div
                        key={comment.id}
                        className={`p-3 border rounded-lg ${comment.isResolved ? 'border-green-200 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <img
                              src={author.avatar}
                              alt={author.name}
                              className="w-6 h-6 rounded-full"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {author.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {comment.createdAt.toLocaleTimeString()}
                            </span>
                            {comment.isResolved && (
                              <Badge variant="secondary" className="text-xs">
                                Resolved
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => resolveComment(comment.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-gray-900 dark:text-white mb-2">
                          {comment.content}
                        </p>

                        {comment.position && (
                          <div className="text-xs text-gray-500 mb-2">
                            On: "{comment.position.text}"
                          </div>
                        )}

                        {/* Reactions */}
                        <div className="flex items-center space-x-2 mb-2">
                          {comment.reactions.map((reaction) => (
                            <button
                              key={reaction.emoji}
                              onClick={() => addReaction(comment.id, reaction.emoji)}
                              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs ${reaction.users.includes(currentUser.id)
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                                }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span>{reaction.users.length}</span>
                            </button>
                          ))}

                          <button
                            onClick={() => addReaction(comment.id, '👍')}
                            className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Replies */}
                        {comment.replies.length > 0 && (
                          <div className="ml-6 space-y-2 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                            {comment.replies.map((reply) => {
                              const replyAuthor = collaborators.find(u => u.id === reply.authorId) || currentUser;
                              return (
                                <div key={reply.id} className="flex items-start space-x-2">
                                  <img
                                    src={replyAuthor.avatar}
                                    alt={replyAuthor.name}
                                    className="w-4 h-4 rounded-full"
                                  />
                                  <div className="flex-1">
                                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                                      {replyAuthor.name}
                                    </span>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                      {reply.content}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {getCommentsForMemory(selectedMemory).length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">
                        No comments yet.
                      </p>
                      <p className="text-sm text-gray-500">
                        Start a conversation with your team.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Collaborators */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Collaborators
                </div>
                <Badge variant="secondary">{collaborators.length + 1}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Current User */}
                <div className="flex items-center justify-between p-2 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(currentUser.status)}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.name} (You)
                      </p>
                      <p className="text-xs text-gray-500">Admin</p>
                    </div>
                  </div>
                </div>

                {/* Other Collaborators */}
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(collaborator.status)}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {collaborator.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {collaborator.status}
                          {collaborator.location && selectedMemory === collaborator.location.memoryId && (
                            <span className="ml-1 text-blue-600">• Editing</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {collaborator.permissions.includes('admin') && (
                        <Star className="h-3 w-3 text-yellow-500" />
                      )}
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Stream */}
          {showActivity && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {activities.slice(0, 10).map((activity) => {
                    const user = collaborators.find(u => u.id === activity.userId) || currentUser;
                    return (
                      <div key={activity.id} className="flex items-start space-x-2">
                        <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">{user.name}</span> {activity.details}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Live Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.filter(s => s.isLive).map((session) => (
                  <div key={session.id} className="p-3 border border-green-200 bg-green-50 dark:bg-green-900/10 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Memory Session
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {session.participants.length} users
                      </Badge>
                    </div>

                    <div className="flex -space-x-1">
                      {session.participants.slice(0, 3).map((participant) => (
                        <img
                          key={participant.id}
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-6 h-6 rounded-full border-2 border-white"
                        />
                      ))}
                      {session.participants.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs">
                          +{session.participants.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {sessions.filter(s => s.isLive).length === 0 && (
                  <div className="text-center py-4">
                    <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      No active sessions
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealtimeCollaboration;
