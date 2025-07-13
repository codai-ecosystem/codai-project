import { useEffect, useState, useCallback, useRef } from 'react';
import { aideRealtimeService, RealtimeMessage, CollaborationData } from '../services/realtime';

// Hook for general real-time connection
export function useRealtimeConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [latency, setLatency] = useState(0);

  useEffect(() => {
    // Connect to real-time service
    const connectToRealtime = async () => {
      try {
        setConnectionStatus('connecting');
        await aideRealtimeService.connect({
          url: process.env.NEXT_PUBLIC_REALTIME_URL || 'ws://localhost:3001',
          token: localStorage.getItem('authToken') || undefined,
          autoConnect: true,
        });
        setIsConnected(true);
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect to real-time service:', error);
        setIsConnected(false);
        setConnectionStatus('disconnected');
      }
    };

    connectToRealtime();

    // Set up connection event listeners
    aideRealtimeService.on('connection:lost', () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    });

    aideRealtimeService.on('connection:restored', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    });

    aideRealtimeService.on('connection:attempting', () => {
      setConnectionStatus('reconnecting');
    });

    // Measure latency periodically
    const latencyInterval = setInterval(async () => {
      if (isConnected) {
        const newLatency = await aideRealtimeService.getLatency();
        setLatency(newLatency);
      }
    }, 30000); // Every 30 seconds

    return () => {
      clearInterval(latencyInterval);
      aideRealtimeService.destroy();
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    latency,
  };
}

// Hook for real-time messages
export function useRealtimeMessages(messageType?: string) {
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);

  useEffect(() => {
    const handleMessage = (message: RealtimeMessage) => {
      setLastMessage(message);
      setMessages(prev => [...prev.slice(-99), message]); // Keep last 100 messages
    };

    const eventName = messageType ? `message:${messageType}` : 'message';
    aideRealtimeService.on(eventName, handleMessage);

    return () => {
      aideRealtimeService.off(eventName, handleMessage);
    };
  }, [messageType]);

  const sendMessage = useCallback((type: string, payload: any, target?: string, priority?: 'low' | 'normal' | 'high' | 'critical') => {
    aideRealtimeService.sendMessage(type, payload, target, priority);
  }, []);

  return {
    messages,
    lastMessage,
    sendMessage,
  };
}

// Hook for collaborative code editing
export function useCollaborativeEditing(fileId: string) {
  const [collaborators, setCollaborators] = useState<Map<string, any>>(new Map());
  const [cursors, setCursors] = useState<Map<string, any>>(new Map());
  const [selections, setSelections] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    // Join project room
    aideRealtimeService.joinProject(fileId);

    // Handle cursor movements
    const handleCursorMove = (data: any) => {
      if (data.data.file === fileId) {
        setCursors(prev => {
          const newCursors = new Map(prev);
          newCursors.set(data.userId, data.data.position);
          return newCursors;
        });
      }
    };

    // Handle selection changes
    const handleSelectionChange = (data: any) => {
      if (data.data.file === fileId) {
        setSelections(prev => {
          const newSelections = new Map(prev);
          newSelections.set(data.userId, data.data.selection);
          return newSelections;
        });
      }
    };

    // Handle collaborative edits
    const handleEdit = (data: any) => {
      if (data.data.file === fileId) {
        // This would integrate with your editor (Monaco, CodeMirror, etc.)
        console.log('Collaborative edit received:', data);
      }
    };

    aideRealtimeService.on('cursor:move', handleCursorMove);
    aideRealtimeService.on('selection:change', handleSelectionChange);
    aideRealtimeService.on('edit:apply', handleEdit);

    return () => {
      aideRealtimeService.leaveProject(fileId);
      aideRealtimeService.off('cursor:move', handleCursorMove);
      aideRealtimeService.off('selection:change', handleSelectionChange);
      aideRealtimeService.off('edit:apply', handleEdit);
    };
  }, [fileId]);

  const broadcastCursorPosition = useCallback((position: { line: number; column: number }) => {
    aideRealtimeService.broadcastCursorPosition(fileId, position);
  }, [fileId]);

  const broadcastSelection = useCallback((selection: { start: any; end: any }) => {
    aideRealtimeService.broadcastSelection(fileId, selection);
  }, [fileId]);

  const broadcastEdit = useCallback((changes: any) => {
    aideRealtimeService.broadcastCodeChange(fileId, changes);
  }, [fileId]);

  return {
    collaborators: Array.from(collaborators.entries()),
    cursors: Array.from(cursors.entries()),
    selections: Array.from(selections.entries()),
    broadcastCursorPosition,
    broadcastSelection,
    broadcastEdit,
  };
}

// Hook for real-time file system changes
export function useRealtimeFileSystem() {
  const [fileChanges, setFileChanges] = useState<any[]>([]);

  useEffect(() => {
    const handleFileUpdate = (data: any) => {
      setFileChanges(prev => [...prev.slice(-49), data]); // Keep last 50 file changes
    };

    aideRealtimeService.on('file:update', handleFileUpdate);

    return () => {
      aideRealtimeService.off('file:update', handleFileUpdate);
    };
  }, []);

  const broadcastFileChange = useCallback((path: string, content: string, operation: 'create' | 'update' | 'delete') => {
    aideRealtimeService.broadcastFileUpdate(path, content, operation);
  }, []);

  return {
    fileChanges,
    broadcastFileChange,
  };
}

// Hook for real-time terminal sharing
export function useRealtimeTerminal(sessionId: string) {
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const handleTerminalOutput = (data: any) => {
      if (data.sessionId === sessionId) {
        setTerminalOutput(prev => [...prev, data.output]);
      }
    };

    aideRealtimeService.on('terminal:output', handleTerminalOutput);

    return () => {
      aideRealtimeService.off('terminal:output', handleTerminalOutput);
    };
  }, [sessionId]);

  const shareOutput = useCallback((command: string, output: string) => {
    if (isSharing) {
      aideRealtimeService.shareTerminalOutput(command, output, sessionId);
    }
  }, [sessionId, isSharing]);

  const toggleSharing = useCallback(() => {
    setIsSharing(prev => !prev);
  }, []);

  return {
    terminalOutput,
    isSharing,
    shareOutput,
    toggleSharing,
  };
}

// Hook for project status
export function useProjectStatus() {
  const [status, setStatus] = useState<'building' | 'ready' | 'error'>('ready');
  const [statusDetails, setStatusDetails] = useState<string>('');
  const [buildResults, setBuildResults] = useState<any[]>([]);

  useEffect(() => {
    const handleProjectStatus = (data: any) => {
      setStatus(data.status);
      setStatusDetails(data.details || '');
    };

    const handleBuildResult = (data: any) => {
      setBuildResults(prev => [...prev.slice(-9), data]); // Keep last 10 build results
    };

    aideRealtimeService.on('project:status', handleProjectStatus);
    aideRealtimeService.on('build:result', handleBuildResult);

    return () => {
      aideRealtimeService.off('project:status', handleProjectStatus);
      aideRealtimeService.off('build:result', handleBuildResult);
    };
  }, []);

  const updateStatus = useCallback((newStatus: 'building' | 'ready' | 'error', details?: string) => {
    aideRealtimeService.updateProjectStatus(newStatus, details);
  }, []);

  const broadcastBuildResult = useCallback((success: boolean, output: string, errors?: string[], warnings?: string[]) => {
    aideRealtimeService.broadcastBuildResult(success, output, errors, warnings);
  }, []);

  return {
    status,
    statusDetails,
    buildResults,
    updateStatus,
    broadcastBuildResult,
  };
}

// Hook for real-time notifications
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<RealtimeMessage[]>([]);

  useEffect(() => {
    const handleHighPriorityMessage = (message: RealtimeMessage) => {
      if (message.priority === 'high' || message.priority === 'critical') {
        setNotifications(prev => [...prev.slice(-9), message]); // Keep last 10 notifications
      }
    };

    aideRealtimeService.on('message', handleHighPriorityMessage);

    return () => {
      aideRealtimeService.off('message', handleHighPriorityMessage);
    };
  }, []);

  const dismissNotification = useCallback((messageId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== messageId));
  }, []);

  return {
    notifications,
    dismissNotification,
  };
}

// Hook for real-time analytics
export function useRealtimeAnalytics() {
  const [metrics, setMetrics] = useState<any>({});
  const startTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const sessionDuration = Date.now() - startTime.current;
      setMetrics(prev => ({
        ...prev,
        sessionDuration,
        messagesReceived: prev.messagesReceived || 0,
        messagesSent: prev.messagesSent || 0,
      }));
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return metrics;
}
