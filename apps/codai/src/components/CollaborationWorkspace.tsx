'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    Share2,
    Eye,
    Edit3,
    Code,
    FileText,
    FolderTree,
    Play,
    Save,
    Download,
    GitBranch,
    MessageSquare,
    Video,
    Mic,
    MicOff,
    ScreenShare,
    Settings,
    Bell,
    BellOff,
    Crown,
    UserCheck,
    UserX,
    Clock
} from 'lucide-react';

interface CollaboratorUser {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: 'owner' | 'admin' | 'editor' | 'viewer';
    status: 'online' | 'away' | 'offline';
    lastSeen: Date;
    currentFile?: string;
    cursor?: {
        x: number;
        y: number;
        line: number;
        column: number;
    };
}

interface WorkspaceFile {
    id: string;
    name: string;
    type: 'file' | 'folder';
    path: string;
    language?: string;
    content?: string;
    lastModified: Date;
    modifiedBy: string;
    isOpen: boolean;
    hasUnsavedChanges: boolean;
    collaborators: string[];
}

interface RealtimeEdit {
    id: string;
    userId: string;
    fileId: string;
    type: 'insert' | 'delete' | 'replace';
    position: {
        line: number;
        column: number;
    };
    content: string;
    timestamp: Date;
}

export default function CollaborationWorkspace() {
    const [collaborators, setCollaborators] = useState<CollaboratorUser[]>([]);
    const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
    const [activeFile, setActiveFile] = useState<WorkspaceFile | null>(null);
    const [recentEdits, setRecentEdits] = useState<RealtimeEdit[]>([]);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [currentUser, setCurrentUser] = useState<CollaboratorUser | null>(null);
    const editorRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        // Initialize collaboration workspace
        initializeWorkspace();

        // Simulate real-time updates
        const interval = setInterval(simulateRealtimeUpdates, 3000);

        return () => clearInterval(interval);
    }, []);

    const initializeWorkspace = () => {
        // Mock current user
        const user: CollaboratorUser = {
            id: 'current-user',
            name: 'You',
            email: 'developer@codai.ro',
            avatar: '/api/placeholder/32/32',
            role: 'owner',
            status: 'online',
            lastSeen: new Date(),
            currentFile: 'src/components/Dashboard.tsx'
        };

        setCurrentUser(user);
        setIsConnected(true);

        // Mock collaborators
        const mockCollaborators: CollaboratorUser[] = [
            user,
            {
                id: 'user-2',
                name: 'Alex Chen',
                email: 'alex@codai.ro',
                avatar: '/api/placeholder/32/32',
                role: 'admin',
                status: 'online',
                lastSeen: new Date(),
                currentFile: 'src/lib/api.ts',
                cursor: { x: 120, y: 250, line: 15, column: 8 }
            },
            {
                id: 'user-3',
                name: 'Sarah Kim',
                email: 'sarah@codai.ro',
                avatar: '/api/placeholder/32/32',
                role: 'editor',
                status: 'away',
                lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
                currentFile: 'src/styles/globals.css'
            },
            {
                id: 'user-4',
                name: 'Mike Rodriguez',
                email: 'mike@codai.ro',
                avatar: '/api/placeholder/32/32',
                role: 'viewer',
                status: 'offline',
                lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
            }
        ];

        setCollaborators(mockCollaborators);

        // Mock workspace files
        const mockFiles: WorkspaceFile[] = [
            {
                id: 'file-1',
                name: 'Dashboard.tsx',
                type: 'file',
                path: 'src/components/Dashboard.tsx',
                language: 'typescript',
                content: `// Codai Dashboard Component
import React from 'react';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Codai Ecosystem Dashboard</h1>
      {/* Real-time updates here */}
    </div>
  );
}`,
                lastModified: new Date(),
                modifiedBy: 'current-user',
                isOpen: true,
                hasUnsavedChanges: false,
                collaborators: ['current-user', 'user-2']
            },
            {
                id: 'file-2',
                name: 'api.ts',
                type: 'file',
                path: 'src/lib/api.ts',
                language: 'typescript',
                content: '// API utilities\nexport const apiClient = {};',
                lastModified: new Date(Date.now() - 600000),
                modifiedBy: 'user-2',
                isOpen: true,
                hasUnsavedChanges: true,
                collaborators: ['user-2']
            },
            {
                id: 'file-3',
                name: 'components',
                type: 'folder',
                path: 'src/components',
                lastModified: new Date(),
                modifiedBy: 'current-user',
                isOpen: false,
                hasUnsavedChanges: false,
                collaborators: ['current-user', 'user-2', 'user-3']
            }
        ];

        setWorkspaceFiles(mockFiles);
        setActiveFile(mockFiles[0]);
    };

    const simulateRealtimeUpdates = () => {
        // Simulate collaborator activity
        setCollaborators(prev => prev.map(user => {
            if (user.id === 'current-user') return user;

            // Random status updates
            const statuses: CollaboratorUser['status'][] = ['online', 'away', 'offline'];
            const newStatus = Math.random() > 0.8 ? statuses[Math.floor(Math.random() * statuses.length)] : user.status;

            return {
                ...user,
                status: newStatus,
                lastSeen: newStatus === 'online' ? new Date() : user.lastSeen
            };
        }));

        // Simulate new edits
        if (Math.random() > 0.7) {
            const newEdit: RealtimeEdit = {
                id: `edit-${Date.now()}`,
                userId: 'user-2',
                fileId: 'file-1',
                type: 'insert',
                position: { line: Math.floor(Math.random() * 20), column: 0 },
                content: '// Live collaboration update',
                timestamp: new Date()
            };

            setRecentEdits(prev => [newEdit, ...prev.slice(0, 4)]);
        }
    };

    const getUserStatusColor = (status: CollaboratorUser['status']) => {
        switch (status) {
            case 'online': return 'bg-green-500';
            case 'away': return 'bg-yellow-500';
            case 'offline': return 'bg-gray-400';
            default: return 'bg-gray-400';
        }
    };

    const getRoleIcon = (role: CollaboratorUser['role']) => {
        switch (role) {
            case 'owner': return <Crown className="w-3 h-3 text-yellow-500" />;
            case 'admin': return <UserCheck className="w-3 h-3 text-blue-500" />;
            case 'editor': return <Edit3 className="w-3 h-3 text-green-500" />;
            case 'viewer': return <Eye className="w-3 h-3 text-gray-500" />;
            default: return null;
        }
    };

    const toggleScreenShare = () => {
        setIsScreenSharing(!isScreenSharing);
        // In real implementation, integrate with WebRTC screen sharing
    };

    const toggleVoice = () => {
        setIsVoiceEnabled(!isVoiceEnabled);
        // In real implementation, integrate with WebRTC audio
    };

    const saveFile = () => {
        if (activeFile) {
            setWorkspaceFiles(prev => prev.map(file =>
                file.id === activeFile.id
                    ? { ...file, hasUnsavedChanges: false, lastModified: new Date() }
                    : file
            ));
        }
    };

    const shareWorkspace = () => {
        // Generate shareable link
        const shareUrl = `${window.location.origin}/workspace/share/${Math.random().toString(36).substr(2, 9)}`;
        navigator.clipboard.writeText(shareUrl);
        // Show notification in real implementation
    };

    return (
        <div className="h-full flex bg-gray-50">
            {/* Sidebar - File Explorer & Collaborators */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                {/* Workspace Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Codai Workspace</h2>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={shareWorkspace}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Share workspace"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setNotifications(!notifications)}
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                {notifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className={`flex items-center space-x-2 text-sm ${isConnected ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>

                {/* Collaborators */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Collaborators ({collaborators.length})
                        </h3>
                    </div>

                    <div className="space-y-2">
                        {collaborators.map((user) => (
                            <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                                <div className="relative">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                            {user.name.split(' ').map(n => n[0]).join('')}
                                        </span>
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getUserStatusColor(user.status)}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                        {getRoleIcon(user.role)}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.status === 'online' ? (
                                            user.currentFile ? `Editing ${user.currentFile}` : 'Online'
                                        ) : user.status === 'away' ? (
                                            'Away'
                                        ) : (
                                            `Last seen ${user.lastSeen.toLocaleTimeString()}`
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* File Explorer */}
                <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-700 flex items-center">
                            <FolderTree className="w-4 h-4 mr-2" />
                            Files
                        </h3>
                    </div>

                    <div className="space-y-1">
                        {workspaceFiles.map((file) => (
                            <div
                                key={file.id}
                                onClick={() => file.type === 'file' && setActiveFile(file)}
                                className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${activeFile?.id === file.id
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                    }`}
                            >
                                {file.type === 'folder' ? (
                                    <FolderTree className="w-4 h-4" />
                                ) : (
                                    <FileText className="w-4 h-4" />
                                )}

                                <span className="text-sm font-medium flex-1 truncate">{file.name}</span>

                                {file.hasUnsavedChanges && (
                                    <div className="w-2 h-2 bg-orange-500 rounded-full" title="Unsaved changes" />
                                )}

                                {file.collaborators.length > 1 && (
                                    <div className="flex -space-x-1">
                                        {file.collaborators.slice(0, 3).map((collaboratorId, idx) => {
                                            const collaborator = collaborators.find(c => c.id === collaboratorId);
                                            return collaborator ? (
                                                <div
                                                    key={collaboratorId}
                                                    className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full border border-white flex items-center justify-center"
                                                    title={collaborator.name}
                                                >
                                                    <span className="text-white text-xs">
                                                        {collaborator.name[0]}
                                                    </span>
                                                </div>
                                            ) : null;
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col">
                {/* Editor Header */}
                <div className="bg-white border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {activeFile && (
                                <div className="flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-gray-500" />
                                    <span className="font-medium text-gray-900">{activeFile.name}</span>
                                    {activeFile.hasUnsavedChanges && (
                                        <span className="text-orange-500 text-sm">• Unsaved</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={toggleVoice}
                                className={`p-2 rounded-lg transition-colors ${isVoiceEnabled
                                        ? 'bg-green-50 text-green-600'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                title={isVoiceEnabled ? 'Disable voice chat' : 'Enable voice chat'}
                            >
                                {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                            </button>

                            <button
                                onClick={toggleScreenShare}
                                className={`p-2 rounded-lg transition-colors ${isScreenSharing
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                                title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
                            >
                                <ScreenShare className="w-4 h-4" />
                            </button>

                            <button
                                onClick={saveFile}
                                disabled={!activeFile?.hasUnsavedChanges}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Save file"
                            >
                                <Save className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 relative">
                    {activeFile ? (
                        <div className="h-full flex flex-col">
                            <textarea
                                ref={editorRef}
                                value={activeFile.content || ''}
                                onChange={(e) => {
                                    setWorkspaceFiles(prev => prev.map(file =>
                                        file.id === activeFile.id
                                            ? { ...file, content: e.target.value, hasUnsavedChanges: true }
                                            : file
                                    ));
                                    setActiveFile(prev => prev ? { ...prev, content: e.target.value, hasUnsavedChanges: true } : null);
                                }}
                                className="flex-1 w-full p-4 font-mono text-sm bg-gray-900 text-gray-100 border-none outline-none resize-none"
                                placeholder="Start coding..."
                                spellCheck={false}
                            />

                            {/* Collaboration Cursors Overlay */}
                            <div className="absolute inset-0 pointer-events-none">
                                {collaborators
                                    .filter(user => user.id !== currentUser?.id && user.cursor && user.currentFile === activeFile.path)
                                    .map(user => (
                                        <div
                                            key={user.id}
                                            className="absolute w-0.5 h-5 bg-blue-500 animate-pulse"
                                            style={{
                                                left: user.cursor!.x,
                                                top: user.cursor!.y
                                            }}
                                        >
                                            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                                {user.name}
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            <div className="text-center">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium mb-2">No file selected</p>
                                <p className="text-sm">Choose a file from the sidebar to start editing</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recent Activity */}
                {recentEdits.length > 0 && (
                    <div className="bg-white border-t border-gray-200 p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            Recent Activity
                        </h4>
                        <div className="space-y-2">
                            {recentEdits.slice(0, 3).map((edit) => {
                                const user = collaborators.find(u => u.id === edit.userId);
                                return (
                                    <div key={edit.id} className="flex items-center space-x-2 text-xs text-gray-600">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span>
                                            <strong>{user?.name}</strong> {edit.type}ed content in{' '}
                                            <strong>{workspaceFiles.find(f => f.id === edit.fileId)?.name}</strong>
                                        </span>
                                        <span className="text-gray-400">
                                            {edit.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
