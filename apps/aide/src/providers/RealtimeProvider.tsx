'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { aideRealtimeService } from '../services/realtime';
import { useRealtimeConnection } from '../hooks/useRealtime';

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  latency: number;
  collaboratorCount: number;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export function useRealtimeContext() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider');
  }
  return context;
}

interface RealtimeProviderProps {
  children: ReactNode;
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { isConnected, connectionStatus, latency } = useRealtimeConnection();
  const [collaboratorCount, setCollaboratorCount] = useState(0);
  const [currentProject, setCurrentProject] = useState<string | null>(null);

  // Track collaborators
  useEffect(() => {
    const handleCollaboratorJoin = () => {
      setCollaboratorCount(prev => prev + 1);
    };

    const handleCollaboratorLeave = () => {
      setCollaboratorCount(prev => Math.max(0, prev - 1));
    };

    aideRealtimeService.on('collaboration:join', handleCollaboratorJoin);
    aideRealtimeService.on('collaboration:leave', handleCollaboratorLeave);

    return () => {
      aideRealtimeService.off('collaboration:join', handleCollaboratorJoin);
      aideRealtimeService.off('collaboration:leave', handleCollaboratorLeave);
    };
  }, []);

  const joinProject = (projectId: string) => {
    if (currentProject && currentProject !== projectId) {
      aideRealtimeService.leaveProject(currentProject);
    }
    aideRealtimeService.joinProject(projectId);
    setCurrentProject(projectId);
  };

  const leaveProject = (projectId: string) => {
    aideRealtimeService.leaveProject(projectId);
    if (currentProject === projectId) {
      setCurrentProject(null);
    }
  };

  const contextValue: RealtimeContextType = {
    isConnected,
    connectionStatus,
    latency,
    collaboratorCount,
    joinProject,
    leaveProject,
  };

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
      <RealtimeStatusIndicator />
    </RealtimeContext.Provider>
  );
}

// Real-time status indicator component
function RealtimeStatusIndicator() {
  const { isConnected, connectionStatus, latency, collaboratorCount } = useRealtimeContext();

  if (!isConnected && connectionStatus === 'disconnected') {
    return null; // Don't show anything when not attempting to connect
  }

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return `Connected • ${latency}ms • ${collaboratorCount} collaborators`;
      case 'connecting':
        return 'Connecting...';
      case 'reconnecting':
        return 'Reconnecting...';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
        <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
