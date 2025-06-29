"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Users, Radio, Eye, FileText, Clock, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface PresenceUpdate {
  id: string;
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  currentFile?: string;
  cursorPosition?: {
    line: number;
    column: number;
  };
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface CollaborationParticipant {
  id: string;
  userId: string;
  permissions: 'read' | 'write' | 'admin';
  joinedAt: string;
  user: User;
}

interface CollaborationSession {
  id: string;
  workspaceId: string;
  type: 'shared_workspace' | 'collaborative_editing' | 'presence';
  isActive: boolean;
  createdAt: string;
  participants: CollaborationParticipant[];
  presenceUpdates: PresenceUpdate[];
}

export default function CollaborationPanel() {
  const { data: session, status } = useSession();
  const [collaborationSessions, setCollaborationSessions] = useState<CollaborationSession[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState('default-workspace');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'busy'>('online');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch collaboration sessions
  const fetchCollaborationSessions = async () => {
    if (!session?.user) return;

    try {
      const response = await fetch(`/api/workspace/collaboration?workspaceId=${currentWorkspace}`);
      if (response.ok) {
        const data = await response.json();
        setCollaborationSessions(data.collaborationSessions);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch collaboration sessions');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Update user presence
  const updatePresence = async (status: 'online' | 'offline' | 'away' | 'busy', currentFile?: string) => {
    if (!session?.user) return;

    try {
      await fetch('/api/workspace/collaboration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace,
          status,
          currentFile,
          cursorPosition: currentFile ? { line: 1, column: 1 } : undefined,
        }),
      });
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  };

  // Create new collaboration session
  const createCollaborationSession = async (type: 'shared_workspace' | 'collaborative_editing' | 'presence') => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/workspace/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace,
          type,
          participants: [], // Can be expanded to invite specific users
        }),
      });

      if (response.ok) {
        await fetchCollaborationSessions();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create collaboration session');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  // Set up real-time updates
  useEffect(() => {
    if (session?.user) {
      fetchCollaborationSessions();
      updatePresence('online');

      // Poll for updates every 5 seconds
      intervalRef.current = setInterval(() => {
        fetchCollaborationSessions();
      }, 5000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        updatePresence('offline');
      };
    }
  }, [session, currentWorkspace]);

  // Handle status change
  const handleStatusChange = (newStatus: 'online' | 'away' | 'busy') => {
    setUserStatus(newStatus);
    updatePresence(newStatus);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  if (status === 'loading') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Real-time Collaboration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Real-time Collaboration
          </CardTitle>
          <CardDescription>
            Please sign in to access collaboration features.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* User Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Your Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(userStatus)}`}></div>
              <span className="font-medium">{getStatusText(userStatus)}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={userStatus === 'online' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('online')}
              >
                Online
              </Button>
              <Button
                variant={userStatus === 'away' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('away')}
              >
                Away
              </Button>
              <Button
                variant={userStatus === 'busy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange('busy')}
              >
                Busy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Collaboration Session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Start Collaboration
          </CardTitle>
          <CardDescription>
            Create a new collaboration session for your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => createCollaborationSession('shared_workspace')}>
              <Eye className="h-4 w-4 mr-2" />
              Shared Workspace
            </Button>
            <Button onClick={() => createCollaborationSession('collaborative_editing')}>
              <FileText className="h-4 w-4 mr-2" />
              Collaborative Editing
            </Button>
            <Button onClick={() => createCollaborationSession('presence')}>
              <Radio className="h-4 w-4 mr-2" />
              Presence Awareness
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Collaboration Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Active Collaborations
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 ml-2"></div>}
          </CardTitle>
          <CardDescription>
            Current collaboration sessions in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collaborationSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active collaboration sessions</p>
              <p className="text-sm">Start a collaboration session to work together.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {collaborationSessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="default">
                        {session.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Started {new Date(session.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* Participants */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Participants</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.participants.map((participant) => {
                        const presence = session.presenceUpdates.find(p => p.userId === participant.userId);
                        return (
                          <div key={participant.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={participant.user.image || undefined} />
                              <AvatarFallback className="text-xs">
                                {participant.user.name?.charAt(0) || participant.user.email.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {participant.user.name || participant.user.email}
                            </span>
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(presence?.status || 'offline')}`}></div>
                            <Badge variant="default" className="text-xs">
                              {participant.permissions}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  {session.presenceUpdates.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-sm mb-2">Recent Activity</h4>
                      <div className="space-y-1">
                        {session.presenceUpdates.slice(0, 3).map((update) => (
                          <div key={update.id} className="text-xs text-gray-600 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(update.status)}`}></div>
                            <span>
                              {update.user.name || 'User'} is {update.status}
                              {update.currentFile && ` in ${update.currentFile}`}
                            </span>
                            <span className="text-gray-400">
                              {new Date(update.updatedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
