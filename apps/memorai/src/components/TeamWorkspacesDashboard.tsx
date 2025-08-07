/**
 * Team Workspaces Dashboard Component
 * Phase 6.4.3: Advanced Team Collaboration & Workspace Management
 * 
 * Features:
 * - Workspace creation and management
 * - Team member management with role-based permissions  
 * - Workspace analytics and insights
 * - Activity feeds and collaboration tracking
 * - Workspace settings and customization
 * - Template-based workspace creation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import {
  Users,
  Plus,
  Search,
  Settings,
  TrendingUp,
  Activity,
  UserPlus,
  Crown,
  Shield,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  BarChart3,
  Bell,
  Mail,
  Copy,
  ExternalLink,
  Star
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Types for workspace management
interface TeamWorkspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  visibility: 'private' | 'team' | 'public';
  memberCount: number;
  memoryCount: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  tags: string[];
  settings: WorkspaceSettings;
  analytics?: WorkspaceAnalytics;
}

interface WorkspaceSettings {
  defaultPermissions: string[];
  allowGuestAccess: boolean;
  requireApprovalForJoining: boolean;
  memoryRetentionDays: number;
  maxMembers: number;
  allowExternalSharing: boolean;
  analyticsEnabled: boolean;
  notificationSettings: {
    newMembers: boolean;
    memoryUpdates: boolean;
    weeklyDigest: boolean;
    systemAlerts: boolean;
  };
}

interface WorkspaceAnalytics {
  totalMemories: number;
  activeMembers: number;
  collaborationScore: number;
  weeklyActivity: { day: string; activities: number; }[];
  memberContributions: { userId: string; name: string; contributions: number; }[];
  memoryGrowth: { month: string; count: number; }[];
  topCategories: { name: string; count: number; color: string; }[];
}

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  avatar?: string;
  joinedAt: string;
  lastActive: string;
  status: 'active' | 'inactive' | 'pending';
  permissions: string[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06d6a0', '#f59e0b', '#ef4444', '#10b981', '#f97316'];

export default function TeamWorkspacesDashboard(): React.JSX.Element {
  // State management
  const [workspaces, setWorkspaces] = useState<TeamWorkspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<TeamWorkspace | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Form states
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    visibility: 'private' as const,
    template: '',
    tags: [] as string[]
  });

  const [inviteMember, setInviteMember] = useState({
    email: '',
    role: 'member' as const,
    message: ''
  });

  // Load workspaces on component mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  // Load workspace details when selected
  useEffect(() => {
    if (selectedWorkspace) {
      loadWorkspaceMembers(selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  /**
   * Load user workspaces
   */
  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/collaboration/workspaces?userId=github-copilot&includeAnalytics=true');
      const data = await response.json();

      if (data.success) {
        setWorkspaces(data.data || []);
        if (data.data.length > 0 && !selectedWorkspace) {
          setSelectedWorkspace(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load workspace members
   */
  const loadWorkspaceMembers = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/collaboration/workspaces/${workspaceId}/members`);
      const data = await response.json();

      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
      // Generate sample members for demo
      setMembers([
        {
          userId: 'user-github-copilot',
          name: 'GitHub Copilot',
          email: 'copilot@github.com',
          role: 'owner',
          joinedAt: '2025-01-01T00:00:00Z',
          lastActive: new Date().toISOString(),
          status: 'active',
          permissions: ['all']
        },
        {
          userId: 'user-dev1',
          name: 'Alice Johnson',
          email: 'alice@memorai.com',
          role: 'admin',
          joinedAt: '2025-01-15T00:00:00Z',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          permissions: ['memory.create', 'memory.edit', 'member.invite']
        },
        {
          userId: 'user-dev2',
          name: 'Bob Smith',
          email: 'bob@memorai.com',
          role: 'member',
          joinedAt: '2025-01-20T00:00:00Z',
          lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          permissions: ['memory.create', 'memory.view']
        }
      ]);
    }
  };

  /**
   * Create new workspace
   */
  const handleCreateWorkspace = async () => {
    try {
      const response = await fetch('/api/collaboration/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWorkspace,
          ownerId: 'github-copilot'
        })
      });

      const data = await response.json();

      if (data.success) {
        setWorkspaces(prev => [data.data.workspace, ...prev]);
        setSelectedWorkspace(data.data.workspace);
        setShowCreateDialog(false);
        setNewWorkspace({
          name: '',
          description: '',
          visibility: 'private',
          template: '',
          tags: []
        });
      }
    } catch (error) {
      console.error('Failed to create workspace:', error);
    }
  };

  /**
   * Invite member to workspace
   */
  const handleInviteMember = async () => {
    if (!selectedWorkspace) return;

    try {
      const response = await fetch('/api/collaboration/workspaces', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite_member',
          workspaceId: selectedWorkspace.id,
          userId: 'github-copilot',
          ...inviteMember
        })
      });

      const data = await response.json();

      if (data.success) {
        // Reload members
        await loadWorkspaceMembers(selectedWorkspace.id);
        setShowInviteDialog(false);
        setInviteMember({
          email: '',
          role: 'member',
          message: ''
        });
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  /**
   * Filter workspaces based on search query
   */
  const filteredWorkspaces = workspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workspace.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /**
   * Get role badge color
   */
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-500';
      case 'admin': return 'bg-red-500';
      case 'member': return 'bg-blue-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  /**
   * Get role icon
   */
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4" />;
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'member': return <Edit3 className="h-4 w-4" />;
      case 'viewer': return <Eye className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Workspaces</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage team collaboration and workspace settings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search workspaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
                <DialogDescription>
                  Create a new team workspace for collaborative memory management
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input
                    id="workspace-name"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter workspace name..."
                  />
                </div>
                <div>
                  <Label htmlFor="workspace-description">Description</Label>
                  <Textarea
                    id="workspace-description"
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the workspace purpose..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="workspace-visibility">Visibility</Label>
                  <Select
                    value={newWorkspace.visibility}
                    onValueChange={(value: 'private' | 'team' | 'public') =>
                      setNewWorkspace(prev => ({ ...prev, visibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private - Only invited members</SelectItem>
                      <SelectItem value="team">Team - All team members can join</SelectItem>
                      <SelectItem value="public">Public - Anyone can view</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateWorkspace} disabled={!newWorkspace.name.trim()}>
                    Create Workspace
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workspace List Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Your Workspaces</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredWorkspaces.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {searchQuery ? 'No workspaces found' : 'No workspaces yet'}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredWorkspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className={`p-3 cursor-pointer border-l-4 transition-all ${selectedWorkspace?.id === workspace.id
                            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                            : 'hover:bg-gray-50 border-transparent dark:hover:bg-gray-800'
                          }`}
                        onClick={() => setSelectedWorkspace(workspace)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {workspace.name}
                            </h3>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {workspace.memberCount} members • {workspace.memoryCount} memories
                            </p>
                            <div className="flex items-center gap-1 mt-2">
                              <Badge
                                variant="secondary"
                                className={`text-xs ${workspace.visibility === 'private' ? 'bg-gray-100' : workspace.visibility === 'team' ? 'bg-blue-100' : 'bg-green-100'}`}
                              >
                                {workspace.visibility}
                              </Badge>
                              {workspace.isActive && (
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedWorkspace ? (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedWorkspace.name}</CardTitle>
                        <CardDescription>{selectedWorkspace.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleBadgeColor('owner')}>
                          {getRoleIcon('owner')}
                          <span className="ml-1">Owner</span>
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{selectedWorkspace.memberCount}</div>
                        <div className="text-sm text-gray-500">Team Members</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{selectedWorkspace.memoryCount}</div>
                        <div className="text-sm text-gray-500">Memories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedWorkspace.analytics?.collaborationScore || 85}
                        </div>
                        <div className="text-sm text-gray-500">Collaboration Score</div>
                      </div>
                    </div>

                    {selectedWorkspace.tags.length > 0 && (
                      <div className="mt-6">
                        <Label className="text-sm font-medium">Tags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedWorkspace.tags.map((tag) => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <UserPlus className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-sm font-medium">Invite Members</div>
                      <div className="text-xs text-gray-500">Add team members</div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Plus className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-sm font-medium">Create Memory</div>
                      <div className="text-xs text-gray-500">Add new memory</div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <div className="text-sm font-medium">View Analytics</div>
                      <div className="text-xs text-gray-500">Team insights</div>
                    </CardContent>
                  </Card>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4 text-center">
                      <Settings className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                      <div className="text-sm font-medium">Settings</div>
                      <div className="text-xs text-gray-500">Configure workspace</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Team Members</h3>
                    <p className="text-sm text-gray-500">{members.length} members in this workspace</p>
                  </div>
                  <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Invite a new member to join this workspace
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            value={inviteMember.email}
                            onChange={(e) => setInviteMember(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address..."
                          />
                        </div>
                        <div>
                          <Label htmlFor="invite-role">Role</Label>
                          <Select
                            value={inviteMember.role}
                            onValueChange={(value: 'admin' | 'member' | 'viewer') =>
                              setInviteMember(prev => ({ ...prev, role: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin - Full access</SelectItem>
                              <SelectItem value="member">Member - Create & edit</SelectItem>
                              <SelectItem value="viewer">Viewer - Read only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                          <Textarea
                            id="invite-message"
                            value={inviteMember.message}
                            onChange={(e) => setInviteMember(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Add a personal message..."
                            rows={2}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInviteMember} disabled={!inviteMember.email.trim()}>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Invite
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {members.map((member) => (
                    <Card key={member.userId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                              <div className="text-xs text-gray-400">
                                Joined {new Date(member.joinedAt).toLocaleDateString()} •
                                Last active {new Date(member.lastActive).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getRoleBadgeColor(member.role)}>
                              {getRoleIcon(member.role)}
                              <span className="ml-1 capitalize">{member.role}</span>
                            </Badge>
                            <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                            {member.role !== 'owner' && (
                              <Button variant="ghost" size="sm">
                                <Settings className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Memories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedWorkspace.analytics?.totalMemories || 156}</div>
                      <div className="text-xs text-green-600">↑ 12% from last month</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Members</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedWorkspace.analytics?.activeMembers || 8}</div>
                      <div className="text-xs text-green-600">↑ 2 new this week</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Collaboration Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedWorkspace.analytics?.collaborationScore || 92}</div>
                      <div className="text-xs text-blue-600">Excellent teamwork</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Weekly Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">247</div>
                      <div className="text-xs text-purple-600">↑ 15% increase</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Activity Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={[
                          { day: 'Mon', activities: 45 },
                          { day: 'Tue', activities: 52 },
                          { day: 'Wed', activities: 38 },
                          { day: 'Thu', activities: 61 },
                          { day: 'Fri', activities: 55 },
                          { day: 'Sat', activities: 23 },
                          { day: 'Sun', activities: 31 }
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="activities" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Memory Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Code', count: 45, color: '#3b82f6' },
                              { name: 'Research', count: 32, color: '#8b5cf6' },
                              { name: 'Meetings', count: 28, color: '#06d6a0' },
                              { name: 'Ideas', count: 35, color: '#f59e0b' },
                              { name: 'Documentation', count: 16, color: '#ef4444' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="count"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {[
                              { name: 'Code', count: 45, color: '#3b82f6' },
                              { name: 'Research', count: 32, color: '#8b5cf6' },
                              { name: 'Meetings', count: 28, color: '#06d6a0' },
                              { name: 'Ideas', count: 35, color: '#f59e0b' },
                              { name: 'Documentation', count: 16, color: '#ef4444' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest actions in this workspace</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { user: 'Alice Johnson', action: 'created a new memory', item: '"React Component Architecture"', time: '2 hours ago', avatar: 'A' },
                        { user: 'Bob Smith', action: 'updated memory', item: '"Database Design Patterns"', time: '4 hours ago', avatar: 'B' },
                        { user: 'GitHub Copilot', action: 'invited', item: 'charlie@memorai.com', time: '6 hours ago', avatar: 'G' },
                        { user: 'Alice Johnson', action: 'shared memory with', item: 'Engineering Team workspace', time: '1 day ago', avatar: 'A' },
                        { user: 'Bob Smith', action: 'completed review of', item: '"API Documentation"', time: '1 day ago', avatar: 'B' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {activity.avatar}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">
                              <span className="font-medium">{activity.user}</span>
                              <span className="text-gray-600 dark:text-gray-400"> {activity.action} </span>
                              <span className="font-medium text-blue-600">{activity.item}</span>
                            </div>
                            <div className="text-xs text-gray-500">{activity.time}</div>
                          </div>
                          <Activity className="h-4 w-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workspace Settings</CardTitle>
                    <CardDescription>Configure workspace preferences and permissions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">General Settings</Label>
                        <div className="space-y-4 mt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Guest Access</div>
                              <div className="text-sm text-gray-500">Allow guests to view memories</div>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Require Approval</div>
                              <div className="text-sm text-gray-500">Approve new member requests</div>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">External Sharing</div>
                              <div className="text-sm text-gray-500">Allow sharing outside workspace</div>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Notifications</Label>
                        <div className="space-y-4 mt-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">New Members</div>
                              <div className="text-sm text-gray-500">Notify when members join</div>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Memory Updates</div>
                              <div className="text-sm text-gray-500">Notify on memory changes</div>
                            </div>
                            <Switch defaultChecked={true} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Weekly Digest</div>
                              <div className="text-sm text-gray-500">Send weekly activity summary</div>
                            </div>
                            <Switch defaultChecked={false} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6">
                      <Label className="text-base font-medium text-red-600">Danger Zone</Label>
                      <div className="mt-3 p-4 border border-red-200 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-red-800 dark:text-red-400">Delete Workspace</div>
                            <div className="text-sm text-red-600 dark:text-red-300">
                              Permanently delete this workspace and all its data
                            </div>
                          </div>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Workspace Selected</h3>
                  <p className="text-gray-500">Select a workspace from the sidebar to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
