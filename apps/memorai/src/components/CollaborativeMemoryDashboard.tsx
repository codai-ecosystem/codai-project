/**
 * Collaborative Memory Management Component
 * React component for multi-user memory sharing, collaboration, and team management
 * 
 * Features:
 * - View and manage collaborative memories
 * - Share memories with users and teams
 * - Manage collaboration requests
 * - Team workspace management
 * - Real-time collaboration status
 * - Permission management interface
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Users, Share2, UserPlus, Clock, Eye, Edit, Shield, Activity, GitBranch, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

// Types matching the backend service
interface CollaborativeMemory {
  id: string;
  agentId: string;
  content: string;
  metadata: any;
  collaborationInfo: {
    ownerId: string;
    teamId?: string;
    isShared: boolean;
    permissions: {
      read: string[];
      write: string[];
      admin: string[];
      public: boolean;
      teamAccess: string;
    };
    collaborators: Array<{
      userId: string;
      role: string;
      joinedAt: string;
      lastActiveAt: string;
      status: string;
    }>;
    lastModifiedBy: string;
    lastModifiedAt: string;
    version: number;
  };
  activityLog: Array<{
    id: string;
    userId: string;
    action: string;
    details: any;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  members: Array<{
    userId: string;
    role: string;
    joinedAt: string;
    status: string;
  }>;
  createdAt: string;
}

interface CollaborationAnalytics {
  totalMemories: number;
  sharedMemories: number;
  totalCollaborators: number;
  activeCollaborations: number;
  recentActivity: number;
  conflictsActive: number;
  teams: number;
  averageCollaboratorsPerMemory: number;
}

export default function CollaborativeMemoryDashboard() {
  // State management
  const [memories, setMemories] = useState<CollaborativeMemory[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [analytics, setAnalytics] = useState<CollaborationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<CollaborativeMemory | null>(null);
  const [activeTab, setActiveTab] = useState('memories');

  // Dialog states
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [createTeamDialogOpen, setCreateTeamDialogOpen] = useState(false);
  const [memoryToShare, setMemoryToShare] = useState<CollaborativeMemory | null>(null);

  // Form states
  const [shareForm, setShareForm] = useState({
    userIds: '',
    role: 'viewer' as const,
    permissions: { read: true, write: false, admin: false }
  });
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: ''
  });

  // User ID (in production, this would come from authentication)
  const currentUserId = 'user-001'; // Mock user ID

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch collaborative memories
      const memoriesResponse = await fetch('/api/collaboration/memories', {
        headers: { 'x-user-id': currentUserId }
      });
      const memoriesData = await memoriesResponse.json();

      if (memoriesData.success) {
        setMemories(memoriesData.data || []);
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/collaboration/memories?action=analytics', {
        headers: { 'x-user-id': currentUserId }
      });
      const analyticsData = await analyticsResponse.json();

      if (analyticsData.success) {
        setAnalytics(analyticsData.data);
      }

    } catch (error) {
      console.error('Failed to fetch collaboration data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load collaboration data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Share memory with users
  const handleShareMemory = async () => {
    if (!memoryToShare) return;

    try {
      const userIds = shareForm.userIds.split(',').map(id => id.trim()).filter(Boolean);

      const response = await fetch(`/api/collaboration/memories?action=share&memoryId=${memoryToShare.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          userIds,
          permissions: shareForm.permissions,
          role: shareForm.role
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Memory shared successfully',
        });
        setShareDialogOpen(false);
        setMemoryToShare(null);
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to share memory',
        variant: 'destructive',
      });
    }
  };

  // Create new team
  const handleCreateTeam = async () => {
    try {
      const response = await fetch('/api/collaboration/memories?action=create-team', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        },
        body: JSON.stringify({
          name: teamForm.name,
          description: teamForm.description,
          ownerId: currentUserId
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Team created successfully',
        });
        setCreateTeamDialogOpen(false);
        setTeamForm({ name: '', description: '' });
        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create team',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getMemoryStatusBadge = (memory: CollaborativeMemory) => {
    if (!memory.collaborationInfo.isShared) {
      return <Badge variant="secondary"><Shield className="h-3 w-3 mr-1" />Private</Badge>;
    }

    const collaboratorCount = memory.collaborationInfo.collaborators.length;
    if (collaboratorCount > 5) {
      return <Badge variant="default"><Users className="h-3 w-3 mr-1" />Team ({collaboratorCount})</Badge>;
    } else if (collaboratorCount > 1) {
      return <Badge variant="outline"><Share2 className="h-3 w-3 mr-1" />Shared ({collaboratorCount})</Badge>;
    }

    return <Badge variant="secondary"><Eye className="h-3 w-3 mr-1" />Solo</Badge>;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default';
      case 'admin': return 'destructive';
      case 'editor': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading collaboration data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Collaborative Memory</h2>
        <p className="text-muted-foreground">
          Manage shared memories, team collaboration, and multi-user access
        </p>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Total Memories</p>
                  <p className="text-2xl font-bold">{analytics.totalMemories}</p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Shared</p>
                  <p className="text-2xl font-bold">{analytics.sharedMemories}</p>
                </div>
                <Share2 className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Collaborators</p>
                  <p className="text-2xl font-bold">{analytics.totalCollaborators}</p>
                </div>
                <UserPlus className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Recent Activity</p>
                  <p className="text-2xl font-bold">{analytics.recentActivity}</p>
                </div>
                <Activity className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="memories">Memories</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="memories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Collaborative Memories</h3>
            <Button
              onClick={() => fetchData()}
              variant="outline"
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {memories.map((memory) => (
              <Card key={memory.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-base">
                        {memory.content.substring(0, 100)}
                        {memory.content.length > 100 && '...'}
                      </CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>Updated {formatTimeAgo(memory.collaborationInfo.lastModifiedAt)}</span>
                        <span>by {memory.collaborationInfo.lastModifiedBy}</span>
                        <span>• v{memory.collaborationInfo.version}</span>
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMemoryStatusBadge(memory)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Collaborators */}
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs font-medium">Collaborators:</Label>
                      <div className="flex flex-wrap gap-1">
                        {memory.collaborationInfo.collaborators.slice(0, 3).map((collaborator) => (
                          <Badge
                            key={collaborator.userId}
                            variant={getRoleBadgeVariant(collaborator.role)}
                            className="text-xs"
                          >
                            {collaborator.userId} ({collaborator.role})
                          </Badge>
                        ))}
                        {memory.collaborationInfo.collaborators.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{memory.collaborationInfo.collaborators.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {memory.metadata.tags && memory.metadata.tags.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs font-medium">Tags:</Label>
                        <div className="flex flex-wrap gap-1">
                          {memory.metadata.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMemory(memory)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {memory.collaborationInfo.permissions.write.includes(currentUserId) && (
                          <Button size="sm" variant="ghost">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        {memory.collaborationInfo.permissions.admin.includes(currentUserId) && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setMemoryToShare(memory);
                              setShareDialogOpen(true);
                            }}
                          >
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        {memory.activityLog.length > 0 && (
                          <div className="flex items-center">
                            <Activity className="h-3 w-3 mr-1" />
                            {memory.activityLog.length} activities
                          </div>
                        )}
                        {memory.collaborationInfo.teamId && (
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            Team
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Teams</h3>
            <Dialog open={createTeamDialogOpen} onOpenChange={setCreateTeamDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Create a team to collaborate on memories with multiple users
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="team-description">Description</Label>
                    <Textarea
                      id="team-description"
                      placeholder="Enter team description (optional)"
                      value={teamForm.description}
                      onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setCreateTeamDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={!teamForm.name}>
                    Create Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Team management features will be displayed here</p>
            <p className="text-sm">Create your first team to start collaborating</p>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h3 className="text-lg font-medium">Recent Activity</h3>

          <div className="space-y-3">
            {memories.flatMap(memory =>
              memory.activityLog.map(activity => ({
                ...activity,
                memoryContent: memory.content.substring(0, 50) + '...'
              }))
            )
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 20)
              .map((activity) => (
                <Card key={activity.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {activity.action === 'created' && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {activity.action === 'updated' && <Edit className="h-4 w-4 text-blue-500" />}
                        {activity.action === 'shared' && <Share2 className="h-4 w-4 text-purple-500" />}
                        {activity.action === 'collaborated' && <Users className="h-4 w-4 text-orange-500" />}
                        {activity.action === 'conflict_detected' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.userId} {activity.action} memory
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.memoryContent}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Share Memory Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Memory</DialogTitle>
            <DialogDescription>
              Share this memory with other users or teams
            </DialogDescription>
          </DialogHeader>
          {memoryToShare && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Memory to share:</p>
                <p className="text-sm text-muted-foreground">
                  {memoryToShare.content.substring(0, 100)}...
                </p>
              </div>

              <div>
                <Label htmlFor="share-users">User IDs (comma-separated)</Label>
                <Input
                  id="share-users"
                  placeholder="user-002, user-003"
                  value={shareForm.userIds}
                  onChange={(e) => setShareForm(prev => ({ ...prev, userIds: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="share-role">Role</Label>
                <Select
                  value={shareForm.role}
                  onValueChange={(value: any) => setShareForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shareForm.permissions.read}
                      onChange={(e) => setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, read: e.target.checked }
                      }))}
                    />
                    <span className="text-sm">Read</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shareForm.permissions.write}
                      onChange={(e) => setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, write: e.target.checked }
                      }))}
                    />
                    <span className="text-sm">Write</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shareForm.permissions.admin}
                      onChange={(e) => setShareForm(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, admin: e.target.checked }
                      }))}
                    />
                    <span className="text-sm">Admin</span>
                  </label>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShareMemory} disabled={!shareForm.userIds}>
              Share Memory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Memory Detail Dialog */}
      <Dialog open={!!selectedMemory} onOpenChange={(open) => !open && setSelectedMemory(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Memory Details</DialogTitle>
            <DialogDescription>
              View memory content, collaboration info, and activity log
            </DialogDescription>
          </DialogHeader>
          {selectedMemory && (
            <div className="space-y-6 max-h-96 overflow-y-auto">
              <div>
                <Label className="font-medium">Content</Label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedMemory.content}</p>
                </div>
              </div>

              <div>
                <Label className="font-medium">Collaboration Info</Label>
                <div className="mt-2 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Owner: {selectedMemory.collaborationInfo.ownerId}</div>
                    <div>Version: {selectedMemory.collaborationInfo.version}</div>
                    <div>Last Modified: {formatTimeAgo(selectedMemory.collaborationInfo.lastModifiedAt)}</div>
                    <div>Collaborators: {selectedMemory.collaborationInfo.collaborators.length}</div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="font-medium">Activity Log</Label>
                <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                  {selectedMemory.activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-2 text-sm p-2 bg-muted rounded">
                      <Badge variant="outline" className="text-xs">
                        {activity.action}
                      </Badge>
                      <span>{activity.userId}</span>
                      <span className="text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
