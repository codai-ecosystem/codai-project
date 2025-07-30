/**
 * React Hook for Hub Memorai Integration
 * Provides easy access to memorai functionality within React components
 */

import { useState, useEffect, useCallback } from 'react';
import { hubMemoraiService } from '../MemoraiIntegrationSimple';

// Hook for project management
export function useProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = useCallback(async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      const result = await hubMemoraiService.listProjects(filters);
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
      const newProject = await hubMemoraiService.createProject(projectData);
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
      const updatedProject = await hubMemoraiService.updateProject(projectId, updates);
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
      const success = await hubMemoraiService.deleteProject(projectId);
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
      const searchResults = await hubMemoraiService.searchProjects(query);
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
      const projectData = await hubMemoraiService.getProject(id);
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
      const fileUrl = await hubMemoraiService.uploadProjectFile(projectId, file, category);

      // Refresh file list
      const updatedFiles = await hubMemoraiService.getProjectFiles(projectId);
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
      const projectFiles = await hubMemoraiService.getProjectFiles(projectId);
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

// Hook for initialization
export function useMemoraiInit() {
  const [initialized, setInitialized] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMemoraiService = async () => {
      try {
        await hubMemoraiService.initialize();
        setInitialized(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize Memorai service');
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
