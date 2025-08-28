/**
 * Team Workspace Dashboard Component
 * Phase 6.4.3: Advanced Team Collaboration with Workspace Isolation
 * 
 * Features:
 * - Workspace creation and management
 * - Team member management with role-based permissions
 * - Workspace templates and quick setup
 * - Activity feeds and team analytics
 * - Real-time collaboration insights
 * - Permission management interface
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import {
    Users,
    Plus,
    Settings,
    Activity,
    BarChart3,
    Shield,
    Clock,
    TrendingUp,
    UserPlus,
    Edit,
    Trash2,
    Eye,
    Crown,
    Key,
    Globe,
    Lock,
    AlertTriangle,
    CheckCircle,
    Calendar,
    MessageSquare,
    FileText,
    Search,
    Filter,
    Download,
    Zap,
    Target,
    Award
} from 'lucide-react';

// Types matching the backend service
interface TeamWorkspace {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    members: TeamMember[];
    settings: WorkspaceSettings;
    stats: WorkspaceStats;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    tags: string[];
    template?: string;
    visibility: 'private' | 'team' | 'public';
}

interface TeamMember {
    userId: string;
    role: TeamRole;
    permissions: Permission[];
    joinedAt: string;
    lastActive: string;
    status: 'active' | 'inactive' | 'pending';
    profile: MemberProfile;
}

interface MemberProfile {
    name: string;
    email: string;
    avatar?: string;
    title?: string;
    timezone?: string;
    preferences: UserPreferences;
}

interface UserPreferences {
    notifications: boolean;
    emailDigest: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
}

type TeamRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'contributor' | 'guest';
type Permission = 'read_memories' | 'write_memories' | 'delete_memories' | 'manage_members' | 'manage_settings' | 'export_data' | 'invite_users' | 'analytics_access' | 'admin_access';

interface WorkspaceSettings {
    defaultPermissions: Permission[];
    allowGuestAccess: boolean;
    requireApprovalForJoining: boolean;
    memoryRetentionDays: number;
    maxMembers: number;
    allowExternalSharing: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    analyticsEnabled: boolean;
    notificationSettings: NotificationSettings;
}

interface NotificationSettings {
    newMembers: boolean;
    memoryUpdates: boolean;
    weeklyDigest: boolean;
    systemAlerts: boolean;
    collaborationUpdates: boolean;
}

interface WorkspaceStats {
    totalMembers: number;
    totalMemories: number;
    activeMemories: number;
    sharedMemories: number;
    collaborativeSessions: number;
    lastActivity: string;
    storageUsed: number;
    activityScore: number;
}

interface WorkspaceActivity {
    id: string;
    workspaceId: string;
    userId: string;
    type: string;
    action: string;
    targetId?: string;
    targetType?: string;
    metadata: Record<string, any>;
    timestamp: string;
}

interface WorkspaceTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    settings: Partial<WorkspaceSettings>;
    defaultRoles: Partial<Record<TeamRole, Permission[]>>;
    suggestedMembers?: number;
    features: string[];
    isPublic: boolean;
}

interface WorkspaceAnalytics {
    workspaceId: string;
    timeRange: string;
    metrics: {
        memberActivity: any[];
        memoryMetrics: any;
        collaborationMetrics: any;
        engagementMetrics: any;
        performanceMetrics: any;
    };
    insights: any[];
    trends: any[];
    recommendations: any[];
}

const TeamWorkspaceDashboard: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<TeamWorkspace[]>([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState<TeamWorkspace | null>(null);
    const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
    const [activities, setActivities] = useState<WorkspaceActivity[]>([]);
    const [analytics, setAnalytics] = useState<WorkspaceAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Form states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showMemberDialog, setShowMemberDialog] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
        template: '',
        initialMembers: ''
    });
    const [memberForm, setMemberForm] = useState({
        userId: '',
        role: 'contributor' as TeamRole,
        permissions: [] as Permission[]
    });

    const currentUserId = 'github-copilot'; // This would come from auth context

    // Load user workspaces
    const loadWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/collaboration/workspaces?action=list&userId=${currentUserId}`);
            const data = await response.json();

            if (data.success) {
                setWorkspaces(data.data);
                if (data.data.length > 0 && !selectedWorkspace) {
                    setSelectedWorkspace(data.data[0]);
                }
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to load workspaces');
            console.error('Error loading workspaces:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUserId, selectedWorkspace]);

    // Load workspace templates
    const loadTemplates = useCallback(async () => {
        try {
            const response = await fetch('/api/collaboration/workspaces?action=templates');
            const data = await response.json();

            if (data.success) {
                setTemplates(data.data);
            }
        } catch (err) {
            console.error('Error loading templates:', err);
        }
    }, []);

    // Load workspace activity
    const loadActivity = useCallback(async (workspaceId: string) => {
        try {
            const response = await fetch(`/api/collaboration/workspaces?action=activity&workspaceId=${workspaceId}&limit=20`);
            const data = await response.json();

            if (data.success) {
                setActivities(data.data);
            }
        } catch (err) {
            console.error('Error loading activity:', err);
        }
    }, []);

    // Load workspace analytics
    const loadAnalytics = useCallback(async (workspaceId: string) => {
        try {
            const response = await fetch(`/api/collaboration/workspaces?action=analytics&workspaceId=${workspaceId}&timeRange=month`);
            const data = await response.json();

            if (data.success) {
                setAnalytics(data.data);
            }
        } catch (err) {
            console.error('Error loading analytics:', err);
        }
    }, []);

    // Create workspace
    const createWorkspace = async () => {
        try {
            setLoading(true);

            const response = await fetch('/api/collaboration/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: createForm.name,
                    description: createForm.description,
                    ownerId: currentUserId,
                    template: createForm.template || undefined,
                    initialMembers: createForm.initialMembers
                        ? createForm.initialMembers.split(',').map(id => id.trim()).filter(Boolean)
                        : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({ title: 'Success', description: 'Workspace created successfully' });
                setShowCreateDialog(false);
                setCreateForm({ name: '', description: '', template: '', initialMembers: '' });
                await loadWorkspaces();
            } else {
                setError(data.error);
                toast({ title: 'Error', description: data.error, variant: 'destructive' });
            }
        } catch (err) {
            setError('Failed to create workspace');
            toast({ title: 'Error', description: 'Failed to create workspace', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Add member to workspace
    const addMember = async () => {
        if (!selectedWorkspace) return;

        try {
            setLoading(true);

            const response = await fetch(`/api/collaboration/workspaces?action=add-member&workspaceId=${selectedWorkspace.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: memberForm.userId,
                    role: memberForm.role,
                    permissions: memberForm.permissions.length > 0 ? memberForm.permissions : undefined,
                    invitedBy: currentUserId
                })
            });

            const data = await response.json();

            if (data.success) {
                toast({ title: 'Success', description: 'Member added successfully' });
                setShowMemberDialog(false);
                setMemberForm({ userId: '', role: 'contributor', permissions: [] });
                await loadWorkspaces();
            } else {
                setError(data.error);
                toast({ title: 'Error', description: data.error, variant: 'destructive' });
            }
        } catch (err) {
            setError('Failed to add member');
            toast({ title: 'Error', description: 'Failed to add member', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Remove member from workspace
    const removeMember = async (targetUserId: string) => {
        if (!selectedWorkspace) return;

        try {
            const response = await fetch(`/api/collaboration/workspaces?action=remove-member&workspaceId=${selectedWorkspace.id}&targetUserId=${targetUserId}&removedBy=${currentUserId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                toast({ title: 'Success', description: 'Member removed successfully' });
                await loadWorkspaces();
            } else {
                toast({ title: 'Error', description: data.error, variant: 'destructive' });
            }
        } catch (err) {
            toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
        }
    };

    // Load data on component mount
    useEffect(() => {
        loadWorkspaces();
        loadTemplates();
    }, [loadWorkspaces, loadTemplates]);

    // Load workspace-specific data when workspace changes
    useEffect(() => {
        if (selectedWorkspace) {
            loadActivity(selectedWorkspace.id);
            loadAnalytics(selectedWorkspace.id);
        }
    }, [selectedWorkspace, loadActivity, loadAnalytics]);

    // Utility functions
    const getRoleIcon = (role: TeamRole) => {
        switch (role) {
            case 'owner': return <Crown className="w-4 h-4 text-yellow-500" />;
            case 'admin': return <Shield className="w-4 h-4 text-blue-500" />;
            case 'editor': return <Edit className="w-4 h-4 text-green-500" />;
            case 'viewer': return <Eye className="w-4 h-4 text-gray-500" />;
            case 'contributor': return <Users className="w-4 h-4 text-purple-500" />;
            case 'guest': return <Key className="w-4 h-4 text-orange-500" />;
            default: return <Users className="w-4 h-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    if (loading && workspaces.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Team Workspaces</h2>
                    <p className="text-muted-foreground">
                        Manage your team collaboration spaces and members
                    </p>
                </div>
                <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                    <Select value={selectedWorkspace?.id || ''} onValueChange={(value) => {
                        const workspace = workspaces.find(w => w.id === value);
                        setSelectedWorkspace(workspace || null);
                    }}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select workspace" />
                        </SelectTrigger>
                        <SelectContent>
                            {workspaces.map((workspace) => (
                                <SelectItem key={workspace.id} value={workspace.id}>
                                    {workspace.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Workspace
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Workspace</DialogTitle>
                                <DialogDescription>
                                    Set up a new team collaboration workspace
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Workspace Name</label>
                                    <Input
                                        placeholder="Enter workspace name"
                                        value={createForm.name}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Description (Optional)</label>
                                    <Input
                                        placeholder="Describe your workspace"
                                        value={createForm.description}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Template</label>
                                    <Select value={createForm.template} onValueChange={(value) => setCreateForm(prev => ({ ...prev, template: value }))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose a template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="">Custom Setup</SelectItem>
                                            {templates.map((template) => (
                                                <SelectItem key={template.id} value={template.id}>
                                                    {template.name} - {template.description}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Initial Members (Optional)</label>
                                    <Input
                                        placeholder="user1, user2, user3"
                                        value={createForm.initialMembers}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, initialMembers: e.target.value }))}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Comma-separated list of user IDs to invite
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={createWorkspace} disabled={!createForm.name.trim()}>
                                    Create Workspace
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    <div className="flex">
                        <AlertTriangle className="h-4 w-4 mt-0.5 mr-2" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Workspace Content */}
            {selectedWorkspace ? (
                <div className="space-y-6">
                    {/* Workspace Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="flex items-center space-x-2">
                                        <span>{selectedWorkspace.name}</span>
                                        <Badge variant="outline" className="ml-2">
                                            {selectedWorkspace.visibility === 'private' ? <Lock className="w-3 h-3 mr-1" /> : <Globe className="w-3 h-3 mr-1" />}
                                            {selectedWorkspace.visibility}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription>{selectedWorkspace.description}</CardDescription>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">
                                        {selectedWorkspace.members.length} member{selectedWorkspace.members.length !== 1 ? 's' : ''}
                                    </Badge>
                                    <Badge variant="outline">
                                        {selectedWorkspace.stats.totalMemories} memories
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{selectedWorkspace.stats.totalMembers}</div>
                                    <div className="text-sm text-muted-foreground">Team Members</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">{selectedWorkspace.stats.activeMemories}</div>
                                    <div className="text-sm text-muted-foreground">Active Memories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-600">{selectedWorkspace.stats.collaborativeSessions}</div>
                                    <div className="text-sm text-muted-foreground">Collaborations</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-600">{selectedWorkspace.stats.activityScore}</div>
                                    <div className="text-sm text-muted-foreground">Activity Score</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Workspace Tabs */}
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="analytics">Analytics</TabsTrigger>
                            <TabsTrigger value="settings">Settings</TabsTrigger>
                        </TabsList>

                        {/* Overview Tab */}
                        <TabsContent value="overview" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Recent Activity */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <Activity className="w-5 h-5" />
                                            <span>Recent Activity</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {activities.slice(0, 5).map((activity) => (
                                                <div key={activity.id} className="flex items-start space-x-3">
                                                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-900">{activity.action}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            by {activity.userId} • {formatTimeAgo(activity.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                            {activities.length === 0 && (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    No recent activity
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center space-x-2">
                                            <BarChart3 className="w-5 h-5" />
                                            <span>Quick Stats</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Storage Used</span>
                                                <span className="text-sm font-medium">{selectedWorkspace.stats.storageUsed} MB</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Last Activity</span>
                                                <span className="text-sm font-medium">{formatTimeAgo(selectedWorkspace.stats.lastActivity)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Shared Memories</span>
                                                <span className="text-sm font-medium">{selectedWorkspace.stats.sharedMemories}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm">Created</span>
                                                <span className="text-sm font-medium">{new Date(selectedWorkspace.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        {/* Members Tab */}
                        <TabsContent value="members" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Team Members ({selectedWorkspace.members.length})</h3>
                                <Dialog open={showMemberDialog} onOpenChange={setShowMemberDialog}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="w-4 h-4 mr-2" />
                                            Add Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Team Member</DialogTitle>
                                            <DialogDescription>
                                                Invite a new member to this workspace
                                            </DialogDescription>
                                        </DialogHeader>

                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">User ID</label>
                                                <Input
                                                    placeholder="Enter user ID"
                                                    value={memberForm.userId}
                                                    onChange={(e) => setMemberForm(prev => ({ ...prev, userId: e.target.value }))}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Role</label>
                                                <Select value={memberForm.role} onValueChange={(value) => setMemberForm(prev => ({ ...prev, role: value as TeamRole }))}>
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="contributor">Contributor</SelectItem>
                                                        <SelectItem value="editor">Editor</SelectItem>
                                                        <SelectItem value="viewer">Viewer</SelectItem>
                                                        <SelectItem value="admin">Admin</SelectItem>
                                                        <SelectItem value="guest">Guest</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowMemberDialog(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={addMember} disabled={!memberForm.userId.trim()}>
                                                Add Member
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-4">
                                {selectedWorkspace.members.map((member) => (
                                    <Card key={member.userId}>
                                        <CardContent className="pt-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar>
                                                        <AvatarFallback>
                                                            {member.profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-sm font-medium">{member.profile.name}</p>
                                                        <p className="text-xs text-muted-foreground">{member.profile.email}</p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <div className="flex items-center space-x-1">
                                                                {getRoleIcon(member.role)}
                                                                <span className="text-xs font-medium capitalize">{member.role}</span>
                                                            </div>
                                                            <Badge className={getStatusColor(member.status)}>
                                                                {member.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Joined</p>
                                                        <p className="text-xs">{new Date(member.joinedAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Last Active</p>
                                                        <p className="text-xs">{formatTimeAgo(member.lastActive)}</p>
                                                    </div>
                                                    {member.userId !== selectedWorkspace.ownerId && member.userId !== currentUserId && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => removeMember(member.userId)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>

                        {/* Activity Tab */}
                        <TabsContent value="activity" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Activity Feed</CardTitle>
                                    <CardDescription>Recent workspace activity and events</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {activities.map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                    <Activity className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-xs text-muted-foreground">by {activity.userId}</span>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.timestamp)}</span>
                                                        <Badge variant="outline" className="text-xs">
                                                            {activity.type.replace('_', ' ')}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {activities.length === 0 && (
                                            <p className="text-sm text-muted-foreground text-center py-8">
                                                No activity found for this workspace
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Analytics Tab */}
                        <TabsContent value="analytics" className="space-y-4">
                            {analytics ? (
                                <div className="grid gap-6">
                                    {/* Insights */}
                                    {analytics.insights.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <Zap className="w-5 h-5" />
                                                    <span>Insights</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {analytics.insights.map((insight, index) => (
                                                        <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                                                            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                                            <div>
                                                                <p className="text-sm font-medium">{insight.title}</p>
                                                                <p className="text-xs text-muted-foreground">{insight.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Recommendations */}
                                    {analytics.recommendations.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center space-x-2">
                                                    <Target className="w-5 h-5" />
                                                    <span>Recommendations</span>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-3">
                                                    {analytics.recommendations.map((rec) => (
                                                        <div key={rec.id} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                                            <Award className="w-5 h-5 text-green-600 mt-0.5" />
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{rec.title}</p>
                                                                <p className="text-xs text-muted-foreground">{rec.description}</p>
                                                                <div className="flex items-center space-x-2 mt-2">
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {rec.priority} priority
                                                                    </Badge>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {rec.category}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {/* Metrics Summary */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Performance Metrics</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-blue-600">
                                                        {analytics.metrics.engagementMetrics.dailyActiveUsers}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Daily Active Users</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {analytics.metrics.collaborationMetrics.totalSessions}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Total Sessions</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-purple-600">
                                                        {Math.round(analytics.metrics.collaborationMetrics.participationRate * 100)}%
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Participation Rate</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-orange-600">
                                                        {analytics.metrics.memoryMetrics.created}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Memories Created</div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="text-center py-8">
                                            <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                            <p className="text-muted-foreground">Loading analytics data...</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Settings Tab */}
                        <TabsContent value="settings" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workspace Settings</CardTitle>
                                    <CardDescription>Configure your workspace preferences</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium">Max Members</label>
                                                <p className="text-sm text-muted-foreground">{selectedWorkspace.settings.maxMembers}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Memory Retention</label>
                                                <p className="text-sm text-muted-foreground">{selectedWorkspace.settings.memoryRetentionDays} days</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Backup Frequency</label>
                                                <p className="text-sm text-muted-foreground capitalize">{selectedWorkspace.settings.backupFrequency}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">External Sharing</label>
                                                <p className="text-sm text-muted-foreground">
                                                    {selectedWorkspace.settings.allowExternalSharing ? 'Enabled' : 'Disabled'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t">
                                            <h4 className="text-sm font-medium mb-3">Notification Settings</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">New Members</span>
                                                    <Badge variant={selectedWorkspace.settings.notificationSettings.newMembers ? 'default' : 'secondary'}>
                                                        {selectedWorkspace.settings.notificationSettings.newMembers ? 'On' : 'Off'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Memory Updates</span>
                                                    <Badge variant={selectedWorkspace.settings.notificationSettings.memoryUpdates ? 'default' : 'secondary'}>
                                                        {selectedWorkspace.settings.notificationSettings.memoryUpdates ? 'On' : 'Off'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">Weekly Digest</span>
                                                    <Badge variant={selectedWorkspace.settings.notificationSettings.weeklyDigest ? 'default' : 'secondary'}>
                                                        {selectedWorkspace.settings.notificationSettings.weeklyDigest ? 'On' : 'Off'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm">System Alerts</span>
                                                    <Badge variant={selectedWorkspace.settings.notificationSettings.systemAlerts ? 'default' : 'secondary'}>
                                                        {selectedWorkspace.settings.notificationSettings.systemAlerts ? 'On' : 'Off'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Workspaces Found</h3>
                            <p className="text-muted-foreground mb-4">
                                Create your first team workspace to start collaborating
                            </p>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Workspace
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default TeamWorkspaceDashboard;
