'use client';

import React, { useState } from 'react';
import {
    Bell,
    BellRing,
    BellOff,
    Mail,
    MessageSquare,
    Users,
    Code,
    GitBranch,
    AlertCircle,
    CheckCircle,
    Info,
    Clock,
    Calendar,
    Filter,
    Search,
    MoreVertical,
    X,
    Settings,
    Volume2,
    VolumeX,
    Monitor,
    Smartphone,
    Eye,
    EyeOff,
    Star,
    Archive,
    Trash2,
    RotateCcw,
    Download,
    Upload,
    Plus,
    Edit,
    Share,
    Bookmark,
    Tag,
    Target,
    Zap,
    Award,
    Heart,
    Coffee,
    Activity,
    TrendingUp,
    BarChart3,
    Database,
    Server,
    Cloud,
    Terminal,
    Package,
    Layers,
    Network,
    HardDrive,
    Cpu,
    FileText,
    Briefcase,
    Shield,
    Lock,
    Key,
    Globe,
    MapPin,
    Phone,
    Link,
    Camera,
    Palette,
    Sun,
    Moon,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Copy,
    Workflow
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'mention' | 'security' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    starred: boolean;
    archived: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    source: string;
    actionUrl?: string;
    metadata?: {
        projectName?: string;
        userName?: string;
        fileName?: string;
        commitHash?: string;
        pullRequestId?: string;
        issueId?: string;
    };
}

interface NotificationSettings {
    channels: {
        email: boolean;
        push: boolean;
        desktop: boolean;
        mobile: boolean;
        inApp: boolean;
    };
    categories: {
        projectUpdates: boolean;
        teamMentions: boolean;
        codeReviews: boolean;
        securityAlerts: boolean;
        systemNotifications: boolean;
        marketingEmails: boolean;
        weeklyDigest: boolean;
        instantMessages: boolean;
    };
    quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
        timezone: string;
    };
    frequency: {
        digest: 'instant' | 'hourly' | 'daily' | 'weekly';
        mentions: 'instant' | 'batched';
        updates: 'instant' | 'daily';
    };
}

export default function NotificationsPage() {
    const [selectedTab, setSelectedTab] = useState('inbox');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        channels: {
            email: true,
            push: true,
            desktop: true,
            mobile: true,
            inApp: true
        },
        categories: {
            projectUpdates: true,
            teamMentions: true,
            codeReviews: true,
            securityAlerts: true,
            systemNotifications: true,
            marketingEmails: false,
            weeklyDigest: true,
            instantMessages: true
        },
        quietHours: {
            enabled: true,
            startTime: '22:00',
            endTime: '08:00',
            timezone: 'PST'
        },
        frequency: {
            digest: 'daily',
            mentions: 'instant',
            updates: 'daily'
        }
    });

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'success',
            title: 'Deployment Successful',
            message: 'Your application "CODAI v2.1" has been successfully deployed to production.',
            timestamp: '5 minutes ago',
            read: false,
            starred: true,
            archived: false,
            priority: 'high',
            source: 'Deployment Pipeline',
            actionUrl: '/deployments/123',
            metadata: {
                projectName: 'CODAI v2.1'
            }
        },
        {
            id: '2',
            type: 'mention',
            title: 'You were mentioned in a comment',
            message: '@johndoe Can you review the authentication logic in the user service?',
            timestamp: '15 minutes ago',
            read: false,
            starred: false,
            archived: false,
            priority: 'medium',
            source: 'Code Review',
            actionUrl: '/reviews/456',
            metadata: {
                userName: 'Alice Smith',
                fileName: 'UserService.ts',
                pullRequestId: '456'
            }
        },
        {
            id: '3',
            type: 'security',
            title: 'Security Alert: New Login Detected',
            message: 'A new login was detected from Chrome on Windows in New York, NY.',
            timestamp: '1 hour ago',
            read: false,
            starred: false,
            archived: false,
            priority: 'urgent',
            source: 'Security System',
            actionUrl: '/security/sessions'
        },
        {
            id: '4',
            type: 'info',
            title: 'Code Review Request',
            message: 'Bob Johnson requested your review on pull request #789: Add user authentication',
            timestamp: '2 hours ago',
            read: true,
            starred: false,
            archived: false,
            priority: 'medium',
            source: 'GitHub',
            actionUrl: '/reviews/789',
            metadata: {
                userName: 'Bob Johnson',
                pullRequestId: '789'
            }
        },
        {
            id: '5',
            type: 'system',
            title: 'Weekly Backup Completed',
            message: 'Your weekly project backup has been completed successfully. 2.4 GB backed up.',
            timestamp: '3 hours ago',
            read: true,
            starred: false,
            archived: false,
            priority: 'low',
            source: 'Backup Service'
        },
        {
            id: '6',
            type: 'warning',
            title: 'Build Failed',
            message: 'The build for commit a1b2c3d failed. Check the logs for more details.',
            timestamp: '4 hours ago',
            read: true,
            starred: false,
            archived: false,
            priority: 'high',
            source: 'CI/CD Pipeline',
            actionUrl: '/builds/failed',
            metadata: {
                commitHash: 'a1b2c3d',
                projectName: 'API Service'
            }
        },
        {
            id: '7',
            type: 'message',
            title: 'Team Standup Reminder',
            message: 'Don\'t forget about today\'s team standup meeting at 10:00 AM PST.',
            timestamp: '1 day ago',
            read: true,
            starred: false,
            archived: false,
            priority: 'medium',
            source: 'Calendar'
        },
        {
            id: '8',
            type: 'info',
            title: 'New Feature Released',
            message: 'AI Code Assistant v2.0 is now available with enhanced completion capabilities.',
            timestamp: '2 days ago',
            read: true,
            starred: true,
            archived: false,
            priority: 'low',
            source: 'Product Updates'
        }
    ]);

    const notificationStats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        starred: notifications.filter(n => n.starred).length,
        archived: notifications.filter(n => n.archived).length
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
            case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
            case 'security': return <Shield className="w-5 h-5 text-red-600" />;
            case 'mention': return <MessageSquare className="w-5 h-5 text-blue-600" />;
            case 'message': return <Mail className="w-5 h-5 text-purple-600" />;
            case 'system': return <Settings className="w-5 h-5 text-gray-600" />;
            default: return <Info className="w-5 h-5 text-blue-600" />;
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'border-red-500 bg-red-50';
            case 'high': return 'border-orange-500 bg-orange-50';
            case 'medium': return 'border-blue-500 bg-blue-50';
            case 'low': return 'border-gray-300 bg-white';
            default: return 'border-gray-300 bg-white';
        }
    };

    const filteredNotifications = notifications.filter(notification => {
        const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.message.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedTab === 'starred') return notification.starred && matchesSearch;
        if (selectedTab === 'archived') return notification.archived && matchesSearch;
        if (selectedTab === 'unread') return !notification.read && !notification.archived && matchesSearch;

        if (selectedFilter === 'all') return !notification.archived && matchesSearch;
        return notification.type === selectedFilter && !notification.archived && matchesSearch;
    });

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ));
    };

    const markAsUnread = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: false } : n
        ));
    };

    const toggleStar = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, starred: !n.starred } : n
        ));
    };

    const archiveNotification = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, archived: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleBulkAction = (action: string) => {
        switch (action) {
            case 'read':
                setNotifications(prev => prev.map(n =>
                    selectedNotifications.includes(n.id) ? { ...n, read: true } : n
                ));
                break;
            case 'unread':
                setNotifications(prev => prev.map(n =>
                    selectedNotifications.includes(n.id) ? { ...n, read: false } : n
                ));
                break;
            case 'archive':
                setNotifications(prev => prev.map(n =>
                    selectedNotifications.includes(n.id) ? { ...n, archived: true } : n
                ));
                break;
            case 'star':
                setNotifications(prev => prev.map(n =>
                    selectedNotifications.includes(n.id) ? { ...n, starred: true } : n
                ));
                break;
        }
        setSelectedNotifications([]);
    };

    const toggleNotificationSelection = (notificationId: string) => {
        setSelectedNotifications(prev =>
            prev.includes(notificationId)
                ? prev.filter(id => id !== notificationId)
                : [...prev, notificationId]
        );
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (value: boolean) => void }) => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-600 mt-1">
                        Stay updated with your projects and team activities
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark All Read
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                    </button>
                    <button className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        New Rule
                    </button>
                </div>
            </div>

            {/* Notification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-900">{notificationStats.total}</div>
                            <div className="text-sm text-gray-500">Total</div>
                        </div>
                        <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-orange-600">{notificationStats.unread}</div>
                            <div className="text-sm text-orange-600">Unread</div>
                        </div>
                        <BellRing className="w-8 h-8 text-orange-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-yellow-600">{notificationStats.starred}</div>
                            <div className="text-sm text-yellow-600">Starred</div>
                        </div>
                        <Star className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-2xl font-bold text-gray-600">{notificationStats.archived}</div>
                            <div className="text-sm text-gray-600">Archived</div>
                        </div>
                        <Archive className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
            </div>

            <div className="flex gap-6">
                {/* Notifications Sidebar */}
                <div className="w-80 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Navigation */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Mailbox</h3>
                        </div>
                        <div className="p-2">
                            {[
                                { id: 'inbox', name: 'Inbox', icon: Bell, count: notificationStats.unread },
                                { id: 'starred', name: 'Starred', icon: Star, count: notificationStats.starred },
                                { id: 'archived', name: 'Archived', icon: Archive, count: notificationStats.archived },
                                { id: 'unread', name: 'Unread', icon: BellRing, count: notificationStats.unread }
                            ].map((tab) => {
                                const TabIcon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedTab(tab.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${selectedTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                                : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <TabIcon className="w-5 h-5 mr-3" />
                                            <span className="font-medium">{tab.name}</span>
                                        </div>
                                        {tab.count > 0 && (
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                        </div>
                        <div className="p-2">
                            {[
                                { id: 'all', name: 'All Types', icon: Bell },
                                { id: 'security', name: 'Security', icon: Shield },
                                { id: 'mention', name: 'Mentions', icon: MessageSquare },
                                { id: 'success', name: 'Success', icon: CheckCircle },
                                { id: 'warning', name: 'Warnings', icon: AlertCircle },
                                { id: 'info', name: 'Information', icon: Info },
                                { id: 'system', name: 'System', icon: Settings }
                            ].map((filter) => {
                                const FilterIcon = filter.icon;
                                const count = filter.id === 'all'
                                    ? notifications.filter(n => !n.archived).length
                                    : notifications.filter(n => n.type === filter.id && !n.archived).length;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => setSelectedFilter(filter.id)}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${selectedFilter === filter.id
                                                ? 'bg-gray-100 text-gray-900'
                                                : 'hover:bg-gray-50 text-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center">
                                            <FilterIcon className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{filter.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-500">{count}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Notifications Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        {/* Toolbar */}
                        {selectedNotifications.length > 0 && (
                            <div className="p-4 border-b border-gray-200 bg-blue-50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-blue-900">
                                        {selectedNotifications.length} notification(s) selected
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleBulkAction('read')}
                                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Mark Read
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('star')}
                                            className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                        >
                                            Star
                                        </button>
                                        <button
                                            onClick={() => handleBulkAction('archive')}
                                            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                                        >
                                            Archive
                                        </button>
                                        <button
                                            onClick={() => setSelectedNotifications([])}
                                            className="p-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications List */}
                        <div className="divide-y divide-gray-200">
                            {filteredNotifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                                    <p className="text-gray-600">
                                        {selectedTab === 'unread'
                                            ? "You're all caught up! No unread notifications."
                                            : selectedTab === 'starred'
                                                ? "No starred notifications yet."
                                                : selectedTab === 'archived'
                                                    ? "No archived notifications."
                                                    : "No notifications found matching your criteria."
                                        }
                                    </p>
                                </div>
                            ) : (
                                filteredNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-blue-50' : ''
                                            }`}
                                    >
                                        <div className="flex items-start space-x-4">
                                            {/* Selection Checkbox */}
                                            <input
                                                type="checkbox"
                                                checked={selectedNotifications.includes(notification.id)}
                                                onChange={() => toggleNotificationSelection(notification.id)}
                                                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />

                                            {/* Notification Icon */}
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Notification Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                                                {notification.title}
                                                            </h4>
                                                            {!notification.read && (
                                                                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                                                            )}
                                                            {notification.starred && (
                                                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                            )}
                                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${notification.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                                                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                                                                        notification.priority === 'medium' ? 'bg-blue-100 text-blue-600' :
                                                                            'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {notification.priority}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

                                                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                            <span>{notification.source}</span>
                                                            <span>{notification.timestamp}</span>
                                                            {notification.metadata?.projectName && (
                                                                <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                                                                    {notification.metadata.projectName}
                                                                </span>
                                                            )}
                                                            {notification.metadata?.userName && (
                                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">
                                                                    @{notification.metadata.userName}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center space-x-2 ml-4">
                                                        {notification.actionUrl && (
                                                            <button className="p-1 text-gray-400 hover:text-blue-600">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => toggleStar(notification.id)}
                                                            className={`p-1 ${notification.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                                        >
                                                            <Star className={`w-4 h-4 ${notification.starred ? 'fill-current' : ''}`} />
                                                        </button>
                                                        <button
                                                            onClick={() => notification.read ? markAsUnread(notification.id) : markAsRead(notification.id)}
                                                            className="p-1 text-gray-400 hover:text-blue-600"
                                                        >
                                                            {notification.read ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            onClick={() => archiveNotification(notification.id)}
                                                            className="p-1 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <Archive className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-gray-600">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Sidebar */}
                {showSettings && (
                    <div className="w-80 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900">Notification Settings</h3>
                                    <button
                                        onClick={() => setShowSettings(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 space-y-6">
                                {/* Notification Channels */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Channels</h4>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'email', label: 'Email', icon: Mail },
                                            { key: 'push', label: 'Push', icon: Bell },
                                            { key: 'desktop', label: 'Desktop', icon: Monitor },
                                            { key: 'mobile', label: 'Mobile', icon: Smartphone },
                                            { key: 'inApp', label: 'In-App', icon: BellRing }
                                        ].map((channel) => {
                                            const ChannelIcon = channel.icon;
                                            return (
                                                <div key={channel.key} className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <ChannelIcon className="w-4 h-4 text-gray-600 mr-2" />
                                                        <span className="text-sm font-medium text-gray-900">{channel.label}</span>
                                                    </div>
                                                    <ToggleSwitch
                                                        checked={notificationSettings.channels[channel.key as keyof typeof notificationSettings.channels]}
                                                        onChange={(value) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            channels: { ...prev.channels, [channel.key]: value }
                                                        }))}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'projectUpdates', label: 'Project Updates' },
                                            { key: 'teamMentions', label: 'Team Mentions' },
                                            { key: 'codeReviews', label: 'Code Reviews' },
                                            { key: 'securityAlerts', label: 'Security Alerts' },
                                            { key: 'systemNotifications', label: 'System' },
                                            { key: 'marketingEmails', label: 'Marketing' },
                                            { key: 'weeklyDigest', label: 'Weekly Digest' },
                                            { key: 'instantMessages', label: 'Messages' }
                                        ].map((category) => (
                                            <div key={category.key} className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-900">{category.label}</span>
                                                <ToggleSwitch
                                                    checked={notificationSettings.categories[category.key as keyof typeof notificationSettings.categories]}
                                                    onChange={(value) => setNotificationSettings(prev => ({
                                                        ...prev,
                                                        categories: { ...prev.categories, [category.key]: value }
                                                    }))}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Quiet Hours */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-900">Quiet Hours</h4>
                                        <ToggleSwitch
                                            checked={notificationSettings.quietHours.enabled}
                                            onChange={(value) => setNotificationSettings(prev => ({
                                                ...prev,
                                                quietHours: { ...prev.quietHours, enabled: value }
                                            }))}
                                        />
                                    </div>

                                    {notificationSettings.quietHours.enabled && (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                                                    <input
                                                        type="time"
                                                        value={notificationSettings.quietHours.startTime}
                                                        onChange={(e) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, startTime: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                                                    <input
                                                        type="time"
                                                        value={notificationSettings.quietHours.endTime}
                                                        onChange={(e) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            quietHours: { ...prev.quietHours, endTime: e.target.value }
                                                        }))}
                                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Frequency */}
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Frequency</h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Digest</label>
                                            <select
                                                value={notificationSettings.frequency.digest}
                                                onChange={(e) => setNotificationSettings(prev => ({
                                                    ...prev,
                                                    frequency: { ...prev.frequency, digest: e.target.value as any }
                                                }))}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="instant">Instant</option>
                                                <option value="hourly">Hourly</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Mentions</label>
                                            <select
                                                value={notificationSettings.frequency.mentions}
                                                onChange={(e) => setNotificationSettings(prev => ({
                                                    ...prev,
                                                    frequency: { ...prev.frequency, mentions: e.target.value as any }
                                                }))}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="instant">Instant</option>
                                                <option value="batched">Batched</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Updates</label>
                                            <select
                                                value={notificationSettings.frequency.updates}
                                                onChange={(e) => setNotificationSettings(prev => ({
                                                    ...prev,
                                                    frequency: { ...prev.frequency, updates: e.target.value as any }
                                                }))}
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="instant">Instant</option>
                                                <option value="daily">Daily</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
