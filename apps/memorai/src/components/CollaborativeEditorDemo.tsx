/**
 * Collaborative Editor Demo Component
 * Demonstrates the collaborative editing features with sample memories
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import CollaborativeMemoryEditor from './CollaborativeMemoryEditor';
import {
  Users,
  Edit3,
  PlayCircle,
  StopCircle,
  RefreshCw,
  FileText,
  Clock,
  UserCheck,
  Lightbulb
} from 'lucide-react';

interface CollaborativeSession {
  id: string;
  content: string;
  title: string;
  agentId: string;
  activeUsers: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    color: string;
    isActive: boolean;
    lastSeen: string;
  }>;
  version: number;
  lastModified: string;
  lockStatus: 'unlocked' | 'soft-lock' | 'hard-lock';
  lockedBy?: string;
}

const CollaborativeEditorDemo: React.FC = () => {
  const [sessions, setSessions] = useState<CollaborativeSession[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch collaborative sessions
  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/collaboration/editing?action=get-active-sessions');
      const result = await response.json();

      if (result.success) {
        setSessions(result.sessions || []);
      } else {
        setError(result.error || 'Failed to fetch sessions');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate sample data if no sessions exist
  const generateSampleData = async () => {
    try {
      const response = await fetch('/api/collaboration/editing?action=generate-sample-data');
      const result = await response.json();

      if (result.success) {
        setSessions(result.sessions || []);
      }
    } catch (err) {
      console.error('Failed to generate sample data:', err);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchSessions().then(() => {
      // If no sessions exist, generate sample data
      setTimeout(() => {
        if (sessions.length === 0) {
          generateSampleData();
        }
      }, 1000);
    });
  }, []);

  // Auto-refresh sessions every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!selectedMemory) {
        fetchSessions();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedMemory]);

  // Handle memory save
  const handleMemorySave = async (content: string, title: string) => {
    console.log('Saving memory:', { content, title });
    // In a real implementation, this would save to the backend
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate save delay
  };

  // Handle editor close
  const handleEditorClose = () => {
    setSelectedMemory(null);
    fetchSessions(); // Refresh the session list
  };

  if (isLoading && sessions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading collaborative sessions...</p>
        </div>
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <Edit3 className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Collaborative Editing Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button onClick={fetchSessions} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Retry
              </Button>
              <Button onClick={generateSampleData} size="sm">
                <Lightbulb className="h-4 w-4 mr-1" />
                Generate Demo Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If a memory is selected for editing, show the collaborative editor
  if (selectedMemory) {
    const session = sessions.find(s => s.id === selectedMemory);
    if (session) {
      return (
        <CollaborativeMemoryEditor
          memoryId={session.id}
          initialContent={session.content}
          initialTitle={session.title}
          userId="github-copilot"
          userName="GitHub Copilot"
          userEmail="copilot@github.com"
          onSave={handleMemorySave}
          onClose={handleEditorClose}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Edit3 className="h-5 w-5 mr-2" />
            Collaborative Editing Sessions
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Real-time collaborative editing with operational transforms and conflict resolution
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchSessions} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={generateSampleData} size="sm">
            <Lightbulb className="h-4 w-4 mr-1" />
            Generate Demo
          </Button>
        </div>
      </div>

      {/* Sessions overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{sessions.length}</p>
                <p className="text-sm text-gray-600">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {sessions.reduce((total, session) => total + session.activeUsers.length, 0)}
                </p>
                <p className="text-sm text-gray-600">Active Collaborators</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Edit3 className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">
                  {sessions.filter(s => s.lockStatus !== 'unlocked').length}
                </p>
                <p className="text-sm text-gray-600">Locked Memories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Collaborative Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <Edit3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Sessions</h3>
              <p className="text-gray-600 mb-4">
                Start collaborative editing by creating a session or generating demo data
              </p>
              <Button onClick={generateSampleData}>
                <Lightbulb className="h-4 w-4 mr-1" />
                Generate Demo Sessions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium text-gray-900">{session.title}</h4>
                          <Badge
                            variant={session.lockStatus === 'unlocked' ? 'outline' : 'secondary'}
                            className="ml-2"
                          >
                            {session.lockStatus === 'unlocked' ? 'Unlocked' : `Locked by ${session.lockedBy}`}
                          </Badge>
                          <Badge variant="outline" className="ml-1">
                            v{session.version}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {session.content}
                        </p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            <span>{session.activeUsers.length} collaborator{session.activeUsers.length !== 1 ? 's' : ''}</span>
                          </div>

                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{new Date(session.lastModified).toLocaleTimeString()}</span>
                          </div>
                        </div>

                        {/* Active users */}
                        <div className="flex items-center mt-3">
                          <span className="text-xs text-gray-500 mr-2">Active editors:</span>
                          <div className="flex space-x-1">
                            {session.activeUsers.slice(0, 3).map(user => (
                              <div
                                key={user.id}
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                                style={{ backgroundColor: user.color }}
                                title={`${user.name} - ${user.isActive ? 'Active' : 'Inactive'}`}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {session.activeUsers.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                +{session.activeUsers.length - 3}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          onClick={() => setSelectedMemory(session.id)}
                          size="sm"
                        >
                          <PlayCircle className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features explanation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
            Collaborative Editing Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <UserCheck className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Real-time Collaboration</p>
                <p className="text-gray-600">Multiple users can edit the same memory simultaneously</p>
              </div>
            </div>
            <div className="flex items-start">
              <Edit3 className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Operational Transforms</p>
                <p className="text-gray-600">Conflict-free collaborative editing with automatic conflict resolution</p>
              </div>
            </div>
            <div className="flex items-start">
              <Users className="h-4 w-4 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Live Presence</p>
                <p className="text-gray-600">See other users' cursors and selections in real-time</p>
              </div>
            </div>
            <div className="flex items-start">
              <Clock className="h-4 w-4 text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Version History</p>
                <p className="text-gray-600">Track all changes with full rollback capabilities</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollaborativeEditorDemo;
