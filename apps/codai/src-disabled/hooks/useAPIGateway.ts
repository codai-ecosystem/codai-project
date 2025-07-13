/**
 * React Hooks for API Gateway Integration
 * Provides easy-to-use hooks for CODAI components
 */

import { useState, useEffect, useCallback } from 'react';
import { apiGateway, APIResponse, ServiceRegistry, ServiceHealth } from '@/lib/api-gateway';

interface UseAPIGatewayReturn {
    isLoading: boolean;
    error: string | null;
    data: any;
    refetch: () => Promise<void>;
}

/**
 * Hook for API Gateway health monitoring
 */
export function useAPIGatewayHealth() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);

    const fetchHealth = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.health();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to fetch gateway health');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHealth();
    }, [fetchHealth]);

    return {
        isLoading,
        error,
        data,
        refetch: fetchHealth,
    };
}

/**
 * Hook for service registry and monitoring
 */
export function useServiceRegistry() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<ServiceRegistry | null>(null);

    const fetchServices = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.getServices();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to fetch services');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();

        // Poll for service status updates every 30 seconds
        const interval = setInterval(fetchServices, 30000);

        return () => clearInterval(interval);
    }, [fetchServices]);

    return {
        isLoading,
        error,
        data,
        refetch: fetchServices,
    };
}

/**
 * Hook for authentication through API Gateway
 */
export function useAPIGatewayAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const login = useCallback(async (username: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.login(username, password);

            if (result.success && result.data) {
                setUser(result.data.user);
                setIsAuthenticated(true);
                return { success: true, user: result.data.user };
            } else {
                setError(result.error || 'Login failed');
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            setError(error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const register = useCallback(async (username: string, email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.register(username, email, password);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error || 'Registration failed');
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            setError(error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setIsLoading(true);

        try {
            await apiGateway.logout();
            setUser(null);
            setIsAuthenticated(false);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Logout failed');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.getProfile();

            if (result.success) {
                setUser(result.data);
                setIsAuthenticated(true);
            } else {
                setError(result.error || 'Failed to fetch profile');
                setIsAuthenticated(false);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        user,
        isAuthenticated,
        login,
        register,
        logout,
        getProfile,
    };
}

/**
 * Hook for memory operations through API Gateway
 */
export function useAPIGatewayMemory() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const storeMemory = useCallback(async (content: string, metadata?: any) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.storeMemory(content, metadata);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error || 'Failed to store memory');
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            setError(error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getMemories = useCallback(async (query?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await apiGateway.getMemories(query);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                setError(result.error || 'Failed to fetch memories');
                return { success: false, error: result.error };
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : 'Unknown error';
            setError(error);
            return { success: false, error };
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        storeMemory,
        getMemories,
    };
}

/**
 * Generic hook for any API Gateway operation
 */
export function useAPIGateway<T>(
    operation: () => Promise<APIResponse<T>>,
    dependencies: any[] = []
): UseAPIGatewayReturn {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<T | null>(null);

    const execute = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await operation();

            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Operation failed');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    }, dependencies);

    useEffect(() => {
        execute();
    }, [execute]);

    return {
        isLoading,
        error,
        data,
        refetch: execute,
    };
}
