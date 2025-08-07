'use client';

import React, { useState } from 'react';
import {
    Users,
    Plus,
    Search,
    Filter,
    Settings,
    MessageSquare,
    Video,
    Calendar,
    FileText,
    Clock,
    Activity,
    Star,
    Award,
    TrendingUp,
    TrendingDown,
    BarChart3,
    User,
    Mail,
    Phone,
    MapPin,
    Github,
    Linkedin,
    Globe,
    Edit,
    MoreVertical,
    ChevronDown,
    Zap,
    Target,
    Heart,
    Coffee,
    Code,
    GitBranch,
    CheckCircle,
    AlertCircle,
    RefreshCw,
    Download,
    Share,
    Bell
} from 'lucide-react';

export default function TeamHubPage() {
    const [selectedTeam, setSelectedTeam] = useState('all');
    const [selectedView, setSelectedView] = useState('overview');
    const [searchTerm, setSearchTerm] = useState('');
    const [showInviteModal, setShowInviteModal] = useState(false);

    const teams = [
        {
            id: 1,
            name: 'Frontend Development',
            description: 'React, TypeScript, and UI/UX development',
            members: 8,
            activeProjects: 4,
            performance: 94,
            lead: 'Alice Smith',
            avatar: '/teams/frontend.jpg',
            color: 'bg-blue-100 text-blue-600',
            status: 'active',
            recentActivity: '2 hours ago'
        },
        {
            id: 2,
            name: 'Backend Engineering',
            description: 'API development, databases, and server infrastructure',
            members: 6,
            activeProjects: 3,
            performance: 97,
            lead: 'Bob Johnson',
            avatar: '/teams/backend.jpg',
            color: 'bg-green-100 text-green-600',
            status: 'active',
            recentActivity: '30 minutes ago'
        },
        {
            id: 3,
            name: 'DevOps & Infrastructure',
            description: 'CI/CD, cloud deployment, and system operations',
            members: 4,
            activeProjects: 5,
            performance: 91,
            lead: 'Carol Wilson',
            avatar: '/teams/devops.jpg',
            color: 'bg-purple-100 text-purple-600',
            status: 'active',
            recentActivity: '1 hour ago'
        },
        {
            id: 4,
            name: 'AI/ML Research',
            description: 'Machine learning models and AI algorithm development',
            members: 5,
            activeProjects: 2,
            performance: 89,
            lead: 'David Brown',
            avatar: '/teams/ai.jpg',
            color: 'bg-orange-100 text-orange-600',
            status: 'active',
            recentActivity: '4 hours ago'
        },
        {
            id: 5,
            name: 'Quality Assurance',
            description: 'Testing, quality gates, and security validation',
            members: 3,
            activeProjects: 6,
            performance: 96,
            lead: 'Emma Davis',
            avatar: '/teams/qa.jpg',
            color: 'bg-red-100 text-red-600',
            status: 'active',
            recentActivity: '15 minutes ago'
        }
    ];

    const teamMembers = [
        {
            id: 1,
            name: 'Alice Smith',
            role: 'Frontend Team Lead',
            team: 'Frontend Development',
            avatar: '/avatars/alice.jpg',
            email: 'alice.smith@codai.com',
            status: 'online',
            location: 'San Francisco, CA',
            timezone: 'PST',
            skills: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
            performance: 98,
            contributions: 142,
            lastActive: 'Active now',
            joinDate: '2023-06-15',
            projects: ['CODAI Platform', 'Mobile App', 'Dashboard v2'],
            achievements: ['Top Performer Q4', 'Code Quality Champion'],
            social: {
                github: 'alice-smith',
                linkedin: 'alice-smith-dev',
                website: 'https://alicesmith.dev'
            }
        },
        {
            id: 2,
            name: 'Bob Johnson',
            role: 'Backend Team Lead',
            team: 'Backend Engineering',
            avatar: '/avatars/bob.jpg',
            email: 'bob.johnson@codai.com',
            status: 'online',
            location: 'Austin, TX',
            timezone: 'CST',
            skills: ['Node.js', 'PostgreSQL', 'Docker', 'AWS'],
            performance: 95,
            contributions: 198,
            lastActive: '5 minutes ago',
            joinDate: '2023-03-20',
            projects: ['API Gateway', 'Database Migration', 'Microservices'],
            achievements: ['Architecture Excellence', 'Mentor of the Year'],
            social: {
                github: 'bob-johnson-backend',
                linkedin: 'bob-johnson-eng'
            }
        },
        {
            id: 3,
            name: 'Carol Wilson',
            role: 'DevOps Lead',
            team: 'DevOps & Infrastructure',
            avatar: '/avatars/carol.jpg',
            email: 'carol.wilson@codai.com',
            status: 'away',
            location: 'Seattle, WA',
            timezone: 'PST',
            skills: ['Kubernetes', 'Terraform', 'Jenkins', 'Monitoring'],
            performance: 93,
            contributions: 156,
            lastActive: '1 hour ago',
            joinDate: '2023-01-10',
            projects: ['Cloud Migration', 'CI/CD Pipeline', 'Monitoring Setup'],
            achievements: ['Deployment Excellence', 'Innovation Award'],
            social: {
                github: 'carol-devops',
                linkedin: 'carol-wilson-devops'
            }
        },
        {
            id: 4,
            name: 'David Brown',
            role: 'AI Research Lead',
            team: 'AI/ML Research',
            avatar: '/avatars/david.jpg',
            email: 'david.brown@codai.com',
            status: 'busy',
            location: 'Boston, MA',
            timezone: 'EST',
            skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'],
            performance: 91,
            contributions: 89,
            lastActive: '2 hours ago',
            joinDate: '2023-08-05',
            projects: ['Neural Networks', 'Model Training', 'AI Assistant'],
            achievements: ['Research Excellence', 'Patent Holder'],
            social: {
                github: 'david-ai-research',
                linkedin: 'david-brown-ai'
            }
        },
        {
            id: 5,
            name: 'Emma Davis',
            role: 'QA Lead',
            team: 'Quality Assurance',
            avatar: '/avatars/emma.jpg',
            email: 'emma.davis@codai.com',
            status: 'online',
            location: 'Denver, CO',
            timezone: 'MST',
            skills: ['Automation Testing', 'Security Testing', 'Performance Testing'],
            performance: 97,
            contributions: 234,
            lastActive: 'Active now',
            joinDate: '2023-04-12',
            projects: ['Test Automation', 'Security Scanning', 'Quality Gates'],
            achievements: ['Quality Champion', 'Testing Innovation'],
            social: {
                github: 'emma-qa-lead',
                linkedin: 'emma-davis-qa'
            }
        }
    ];

    const recentActivities = [
        {
            id: 1,
            type: 'code_review',
            user: 'Alice Smith',
            action: 'approved pull request',
            target: 'Feature: New Dashboard Component',
            timestamp: '2 minutes ago',
            team: 'Frontend Development'
        },
        {
            id: 2,
            type: 'deployment',
            user: 'Carol Wilson',
            action: 'deployed to production',
            target: 'API Gateway v2.1.0',
            timestamp: '15 minutes ago',
            team: 'DevOps & Infrastructure'
        },
        {
            id: 3,
            type: 'meeting',
            user: 'Bob Johnson',
            action: 'started team standup',
            target: 'Backend Engineering Daily',
            timestamp: '30 minutes ago',
            team: 'Backend Engineering'
        },
        {
            id: 4,
            type: 'achievement',
            user: 'Emma Davis',
            action: 'completed milestone',
            target: 'Security Test Suite v1.0',
            timestamp: '1 hour ago',
            team: 'Quality Assurance'
        },
        {
            id: 5,
            type: 'research',
            user: 'David Brown',
            action: 'published research',
            target: 'Neural Network Optimization Paper',
            timestamp: '2 hours ago',
            team: 'AI/ML Research'
        }
    ];

    const projectCollaborations = [
        {
            id: 1,
            name: 'CODAI Platform v3.0',
            teams: ['Frontend Development', 'Backend Engineering', 'DevOps & Infrastructure'],
            progress: 78,
            deadline: '2024-02-15',
            status: 'on_track',
            collaborators: 12,
            lastUpdate: '1 hour ago'
        },
        {
            id: 2,
            name: 'AI Assistant Enhancement',
            teams: ['AI/ML Research', 'Frontend Development'],
            progress: 45,
            deadline: '2024-01-30',
            status: 'at_risk',
            collaborators: 7,
            lastUpdate: '3 hours ago'
        },
        {
            id: 3,
            name: 'Security Framework Upgrade',
            teams: ['Quality Assurance', 'Backend Engineering', 'DevOps & Infrastructure'],
            progress: 92,
            deadline: '2024-01-20',
            status: 'ahead',
            collaborators: 9,
            lastUpdate: '30 minutes ago'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'busy': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'on_track': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'at_risk': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'ahead': return <TrendingUp className="w-4 h-4 text-blue-600" />;
            default: return <Clock className="w-4 h-4 text-gray-400" />;
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'code_review': return <GitBranch className="w-4 h-4 text-blue-600" />;
            case 'deployment': return <Zap className="w-4 h-4 text-green-600" />;
            case 'meeting': return <Video className="w-4 h-4 text-purple-600" />;
            case 'achievement': return <Award className="w-4 h-4 text-yellow-600" />;
            case 'research': return <FileText className="w-4 h-4 text-orange-600" />;
            default: return <Activity className="w-4 h-4 text-gray-400" />;
        }
    };

    const filteredMembers = teamMembers.filter(member => {
        const matchesTeam = selectedTeam === 'all' || member.team === selectedTeam;
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.team.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTeam && matchesSearch;
    });

    const teamStats = {
        totalMembers: teamMembers.length,
        onlineMembers: teamMembers.filter(m => m.status === 'online').length,
        avgPerformance: (teamMembers.reduce((sum, m) => sum + m.performance, 0) / teamMembers.length).toFixed(1),
        totalContributions: teamMembers.reduce((sum, m) => sum + m.contributions, 0)
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Team Hub</h1>
                    <p className="text-gray-600 mt-1">
                        Collaborate, coordinate, and connect with your development teams
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </button>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Invite Member
                    </button>
                </div>
            </div>

            {/* Team Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</div>
                            <div className="text-sm text-gray-500">Total Members</div>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-green-600">{teamStats.onlineMembers}</div>
                            <div className="text-sm text-gray-500">Online Now</div>
                        </div>
                        <Activity className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-purple-600">{teamStats.avgPerformance}%</div>
                            <div className="text-sm text-gray-500">Avg Performance</div>
                        </div>
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{teamStats.totalContributions}</div>
                            <div className="text-sm text-gray-500">Total Contributions</div>
                        </div>
                        <Star className="w-8 h-8 text-orange-600" />
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: 'Overview', icon: Users },
                            { id: 'members', name: 'Members', icon: User },
                            { id: 'teams', name: 'Teams', icon: Users },
                            { id: 'projects', name: 'Projects', icon: Target },
                            { id: 'activity', name: 'Activity', icon: Activity }
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedView(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${selectedView === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <TabIcon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {selectedView === 'overview' && (
                        <div className="space-y-6">
                            {/* Teams Overview */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Teams Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {teams.map((team) => (
                                        <div key={team.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${team.color}`}>
                                                    <Users className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs text-gray-500">{team.recentActivity}</span>
                                            </div>

                                            <h4 className="font-semibold text-gray-900 mb-2">{team.name}</h4>
                                            <p className="text-sm text-gray-600 mb-4">{team.description}</p>

                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900">{team.members}</div>
                                                    <div className="text-xs text-gray-500">Members</div>
                                                </div>
                                                <div>
                                                    <div className="text-lg font-bold text-gray-900">{team.activeProjects}</div>
                                                    <div className="text-xs text-gray-500">Projects</div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="text-sm text-gray-600">
                                                    Performance: <span className="font-medium text-gray-900">{team.performance}%</span>
                                                </div>
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    View Team
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {recentActivities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm">
                                                    <span className="font-medium text-gray-900">{activity.user}</span>
                                                    <span className="text-gray-600"> {activity.action} </span>
                                                    <span className="font-medium text-gray-900">{activity.target}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{activity.team} • {activity.timestamp}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Active Collaborations */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Collaborations</h3>
                                <div className="space-y-4">
                                    {projectCollaborations.map((project) => (
                                        <div key={project.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                                                <div className="flex items-center space-x-2">
                                                    {getStatusIcon(project.status)}
                                                    <span className="text-sm text-gray-500">{project.lastUpdate}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between mb-3">
                                                <div className="text-sm text-gray-600">
                                                    {project.collaborators} collaborators from {project.teams.length} teams
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                                            </div>

                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                                <div
                                                    className={`h-2 rounded-full ${project.status === 'ahead' ? 'bg-blue-500' :
                                                            project.status === 'on_track' ? 'bg-green-500' : 'bg-yellow-500'
                                                        }`}
                                                    style={{ width: `${project.progress}%` }}
                                                />
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {project.teams.map((team, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full"
                                                    >
                                                        {team}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedView === 'members' && (
                        <div className="space-y-6">
                            {/* Search and Filters */}
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search members..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>

                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Teams</option>
                                        {teams.map(team => (
                                            <option key={team.id} value={team.name}>{team.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Filter className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        Showing {filteredMembers.length} of {teamMembers.length} members
                                    </span>
                                </div>
                            </div>

                            {/* Members Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredMembers.map((member) => (
                                    <div key={member.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative">
                                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-medium text-blue-600">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${getStatusColor(member.status)}`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{member.name}</h4>
                                                    <p className="text-sm text-gray-600">{member.role}</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 mb-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {member.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2" />
                                                {member.location}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {member.lastActive}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{member.performance}%</div>
                                                <div className="text-xs text-gray-500">Performance</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{member.contributions}</div>
                                                <div className="text-xs text-gray-500">Contributions</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{member.projects.length}</div>
                                                <div className="text-xs text-gray-500">Projects</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {member.skills.slice(0, 3).map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {member.skills.length > 3 && (
                                                <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                                                    +{member.skills.length - 3}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                {member.social.github && (
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <Github className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {member.social.linkedin && (
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <Linkedin className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {member.social.website && (
                                                    <button className="text-gray-400 hover:text-gray-600">
                                                        <Globe className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                                                    <MessageSquare className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg">
                                                    <Video className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add other views (teams, projects, activity) content here */}
                </div>
            </div>

            {/* Invite Member Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Invite Team Member</h3>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <MoreVertical className="w-6 h-6" />
                            </button>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    placeholder="member@company.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Team
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    {teams.map(team => (
                                        <option key={team.id} value={team.name}>{team.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Senior Developer"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="Welcome to the team! We're excited to have you join us..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowInviteModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Send Invitation
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
