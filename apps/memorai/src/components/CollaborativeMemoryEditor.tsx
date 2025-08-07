/**
 * Collaborative Memory Editor Component
 * Rich text editor with real-time collaboration features
 * Supports operational transforms, live cursors, and user presence
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import {
  Save,
  Users,
  Lock,
  Unlock,
  History,
  Edit3,
  UserCheck,
  AlertTriangle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

// Types for collaborative editing
interface CollaborativeUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: CursorPosition;
  selection?: TextSelection;
  isActive: boolean;
  lastSeen: string;
  color: string;
}

interface CursorPosition {
  line: number;
  column: number;
  position: number;
}

interface TextSelection {
  start: CursorPosition;
  end: CursorPosition;
  text: string;
}

interface EditOperation {
  id: string;
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  length: number;
  userId: string;
  timestamp: string;
  memoryId: string;
}

interface CollaborativeMemory {
  id: string;
  content: string;
  title: string;
  agentId: string;
  activeUsers: CollaborativeUser[];
  operations: EditOperation[];
  version: number;
  lastModified: string;
  lockStatus: 'unlocked' | 'soft-lock' | 'hard-lock';
  lockedBy?: string;
}

interface CollaborativeMemoryEditorProps {
  memoryId: string;
  initialContent?: string;
  initialTitle?: string;
  userId: string;
  userName: string;
  userEmail: string;
  onSave?: (content: string, title: string) => void;
  onClose?: () => void;
  className?: string;
}

/**
 * Hook for managing collaborative editing state
 */
const useCollaborativeEditor = (memoryId: string, userId: string, userData: { name: string; email: string }) => {
  const [session, setSession] = useState<CollaborativeMemory | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresence, setShowPresence] = useState(true);

  // Start collaborative session
  const startSession = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/collaboration/editing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-session',
          memoryId,
          userId,
          userData
        })
      });

      const result = await response.json();

      if (result.success) {
        setSession(result.session);
        setIsConnected(true);
      } else {
        setError(result.error || 'Failed to start collaborative session');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, [memoryId, userId, userData]);

  // End collaborative session
  const endSession = useCallback(async () => {
    if (!session) return;

    try {
      await fetch('/api/collaboration/editing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end-session',
          memoryId,
          userId
        })
      });

      setSession(null);
      setIsConnected(false);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  }, [memoryId, userId, session]);

  // Apply edit operation
  const applyOperation = useCallback(async (operation: EditOperation) => {
    if (!session) return;

    try {
      const response = await fetch('/api/collaboration/editing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-operation',
          memoryId,
          operation
        })
      });

      const result = await response.json();

      if (result.success) {
        setSession(result.session);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply operation');
    }
  }, [memoryId, session]);

  // Update user presence
  const updatePresence = useCallback(async (cursor?: CursorPosition, selection?: TextSelection) => {
    if (!session) return;

    try {
      await fetch('/api/collaboration/editing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-presence',
          memoryId,
          userId,
          cursor,
          selection
        })
      });
    } catch (err) {
      console.error('Failed to update presence:', err);
    }
  }, [memoryId, userId, session]);

  // Lock/unlock memory
  const toggleLock = useCallback(async () => {
    if (!session) return;

    const isLocked = session.lockStatus !== 'unlocked';
    const action = isLocked ? 'unlock-memory' : 'lock-memory';

    try {
      const response = await fetch('/api/collaboration/editing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          memoryId,
          userId,
          lockType: 'soft-lock'
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh session to get updated lock status
        await refreshSession();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle lock');
    }
  }, [memoryId, userId, session]);

  // Refresh session data
  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch(`/api/collaboration/editing?action=get-session&memoryId=${memoryId}`);
      const result = await response.json();

      if (result.success && result.session) {
        setSession(result.session);
      }
    } catch (err) {
      console.error('Failed to refresh session:', err);
    }
  }, [memoryId]);

  // Auto-refresh session periodically
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(refreshSession, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [isConnected, refreshSession]);

  return {
    session,
    isConnected,
    isLoading,
    error,
    showPresence,
    setShowPresence,
    startSession,
    endSession,
    applyOperation,
    updatePresence,
    toggleLock,
    refreshSession
  };
};

/**
 * Collaborative Memory Editor Component
 */
const CollaborativeMemoryEditor: React.FC<CollaborativeMemoryEditorProps> = ({
  memoryId,
  initialContent = '',
  initialTitle = '',
  userId,
  userName,
  userEmail,
  onSave,
  onClose,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const {
    session,
    isConnected,
    isLoading,
    error,
    showPresence,
    setShowPresence,
    startSession,
    endSession,
    applyOperation,
    updatePresence,
    toggleLock,
    refreshSession
  } = useCollaborativeEditor(memoryId, userId, { name: userName, email: userEmail });

  // Initialize session on mount
  useEffect(() => {
    startSession();
    return () => {
      endSession();
    };
  }, [startSession, endSession]);

  // Update content from session
  useEffect(() => {
    if (session && session.content !== content) {
      setContent(session.content);
      setTitle(session.title);
    }
  }, [session?.content, session?.title]);

  // Handle content change
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const oldContent = content;

    setContent(newContent);

    // Calculate operation
    if (newContent.length > oldContent.length) {
      // Insert operation
      const insertPos = oldContent.length;
      const insertedText = newContent.slice(insertPos);

      const operation: EditOperation = {
        id: `op-${Date.now()}-${Math.random()}`,
        type: 'insert',
        position: insertPos,
        content: insertedText,
        length: insertedText.length,
        userId,
        timestamp: new Date().toISOString(),
        memoryId
      };

      applyOperation(operation);
    } else if (newContent.length < oldContent.length) {
      // Delete operation
      const deletePos = newContent.length;
      const deletedLength = oldContent.length - newContent.length;

      const operation: EditOperation = {
        id: `op-${Date.now()}-${Math.random()}`,
        type: 'delete',
        position: deletePos,
        content: '',
        length: deletedLength,
        userId,
        timestamp: new Date().toISOString(),
        memoryId
      };

      applyOperation(operation);
    }

    // Update cursor position
    if (textareaRef.current) {
      const cursorPos = textareaRef.current.selectionStart;
      updatePresence({
        line: 0, // Simple implementation - could be enhanced
        column: cursorPos,
        position: cursorPos
      });
    }
  }, [content, userId, memoryId, applyOperation, updatePresence]);

  // Handle title change
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  // Save content
  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      if (onSave) {
        await onSave(content, title);
      }

      setLastSaved(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [content, title, onSave]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (content !== initialContent || title !== initialTitle) {
        handleSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(autoSave);
  }, [content, title, handleSave, initialContent, initialTitle]);

  // Get current user from session
  const currentUser = session?.activeUsers.find(user => user.id === userId);
  const otherUsers = session?.activeUsers.filter(user => user.id !== userId) || [];

  // Check if memory is locked by someone else
  const isLockedByOther = session?.lockStatus !== 'unlocked' && session?.lockedBy !== userId;
  const isLockedByMe = session?.lockStatus !== 'unlocked' && session?.lockedBy === userId;

  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Connecting to collaborative session...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full ${className} border-red-200`}>
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Collaboration Error: {error}</span>
          </div>
          <Button
            onClick={startSession}
            className="mt-4"
            variant="outline"
          >
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Edit3 className="h-5 w-5 mr-2" />
            Collaborative Editor
            {isConnected && (
              <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Live
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center space-x-2">
            {/* Presence toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPresence(!showPresence)}
            >
              {showPresence ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>

            {/* Lock/unlock button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLock}
              disabled={isLockedByOther}
            >
              {isLockedByMe ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Button>

            {/* Save button */}
            <Button
              onClick={handleSave}
              disabled={isSaving || isLockedByOther}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>

            {/* Close button */}
            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Collaboration status bar */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            {/* Active users */}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{session?.activeUsers.length || 0} collaborator{session?.activeUsers.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Version info */}
            <div className="flex items-center">
              <History className="h-4 w-4 mr-1" />
              <span>v{session?.version || 1}</span>
            </div>

            {/* Lock status */}
            {session?.lockStatus !== 'unlocked' && (
              <div className="flex items-center text-orange-600">
                <Lock className="h-4 w-4 mr-1" />
                <span>
                  {isLockedByMe ? 'Locked by you' : `Locked by ${session?.lockedBy}`}
                </span>
              </div>
            )}

            {/* Last saved */}
            {lastSaved && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>Saved at {lastSaved}</span>
              </div>
            )}
          </div>
        </div>

        {/* User presence indicators */}
        {showPresence && otherUsers.length > 0 && (
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-sm text-gray-600">Active editors:</span>
            {otherUsers.map(user => (
              <div key={user.id} className="flex items-center">
                <Avatar className="h-6 w-6 mr-1" style={{ borderColor: user.color }}>
                  <AvatarFallback
                    className="text-xs"
                    style={{ backgroundColor: user.color + '20', color: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Badge
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: user.color }}
                >
                  {user.name}
                  {user.isActive && (
                    <div
                      className="w-1.5 h-1.5 rounded-full ml-1 animate-pulse"
                      style={{ backgroundColor: user.color }}
                    ></div>
                  )}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Title input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              disabled={isLockedByOther}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Enter memory title..."
            />
          </div>

          <Separator />

          {/* Content textarea */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Content</label>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              disabled={isLockedByOther}
              className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed font-mono text-sm"
              placeholder="Start typing your memory content..."
            />

            {/* Live cursors overlay (simplified implementation) */}
            {showPresence && otherUsers.map(user => (
              user.cursor && (
                <div
                  key={`cursor-${user.id}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: `${user.cursor.column * 0.5}em`, // Approximate character width
                    top: `${user.cursor.line * 1.5}em`, // Approximate line height
                    transform: 'translateY(-100%)'
                  }}
                >
                  <div
                    className="w-0.5 h-4 animate-pulse"
                    style={{ backgroundColor: user.color }}
                  ></div>
                  <div
                    className="text-xs px-1 py-0.5 rounded text-white whitespace-nowrap"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CollaborativeMemoryEditor;
