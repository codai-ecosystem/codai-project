/**
 * React Hook for Hub Memorai Integration with CBD Backend
 * Provides easy access to enhanced memorai functionality within React components
 */

import { useState, useEffect, useCallback } from 'react';
import { enhancedHubMemoraiService } from '../services/EnhancedMemoraiService';
import { CBDApiKey } from '../services/CBDIntegrationService';

// Hook for project management
export function useProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await enhancedHubMemoraiService.listProjects(filters);
      setProjects(result.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData: any) => {
    try {
      setError(null);
      const newProject = await enhancedHubMemoraiService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, updates: any) => {
    try {
      setError(null);
      const updatedProject = await enhancedHubMemoraiService.updateProject(projectId, updates);
      if (updatedProject) {
        setProjects(prev =>
          prev.map(p => p.id === projectId ? updatedProject : p)
        );
      }
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      setError(null);
      const success = await enhancedHubMemoraiService.deleteProject(projectId);
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const searchProjects = useCallback(async (query: string) => {
    try {
      setError(null);
      const searchResults = await enhancedHubMemoraiService.searchProjects(query);
      setProjects(searchResults);
      return searchResults;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search projects';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    searchProjects,
    refresh: loadProjects
  };
}

// Hook for individual project details
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProject = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const projectData = await enhancedHubMemoraiService.getProject(id);
      setProject(projectData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      loadProject(projectId);
    } else {
      setProject(null);
    }
  }, [projectId, loadProject]);

  return {
    project,
    loading,
    error,
    refresh: () => projectId && loadProject(projectId)
  };
}

// Hook for file uploads
export function useProjectFiles(projectId: string | null) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File, category: string = 'documents') => {
    if (!projectId) throw new Error('Project ID required for file upload');

    try {
      setUploading(true);
      setError(null);
      const fileUrl = await enhancedHubMemoraiService.uploadProjectFile(projectId, file, category);

      // Refresh file list
      const updatedFiles = await enhancedHubMemoraiService.getProjectFiles(projectId);
      setFiles(updatedFiles);

      return fileUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [projectId]);

  const loadFiles = useCallback(async () => {
    if (!projectId) return;

    try {
      setError(null);
      const projectFiles = await enhancedHubMemoraiService.getProjectFiles(projectId);
      setFiles(projectFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    }
  }, [projectId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return {
    files,
    uploading,
    error,
    uploadFile,
    refresh: loadFiles
  };
}

// Hook for API key management
export function useApiKeys(projectId?: string) {
  const [apiKeys, setApiKeys] = useState<CBDApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadApiKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await enhancedHubMemoraiService.listApiKeys(projectId);
      setApiKeys(keys);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createApiKey = useCallback(async (keyData: {
    name: string;
    scopes: string[];
    expiresIn?: string;
  }) => {
    if (!projectId) throw new Error('Project ID required for API key creation');

    try {
      setError(null);
      const newKey = await enhancedHubMemoraiService.createApiKey(projectId, keyData);
      setApiKeys(prev => [newKey, ...prev]);
      return newKey;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create API key';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [projectId]);

  const revokeApiKey = useCallback(async (apiKeyId: string) => {
    try {
      setError(null);
      const success = await enhancedHubMemoraiService.revokeApiKey(apiKeyId);
      if (success) {
        setApiKeys(prev => prev.filter(key => key.id !== apiKeyId));
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to revoke API key';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      loadApiKeys();
    }
  }, [loadApiKeys, projectId]);

  return {
    apiKeys,
    loading,
    error,
    createApiKey,
    revokeApiKey,
    refresh: loadApiKeys
  };
}

// Hook for initialization
export function useMemoraiInit() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMemoraiService = async () => {
      try {
        await enhancedHubMemoraiService.initialize();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Enhanced Memorai service');
      } finally {
        setInitializing(false);
      }
    };

    initMemoraiService();
  }, []);

  return {
    initialized,
    initializing,
    error
  };
}
