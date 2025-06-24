import { useState, useEffect, useCallback } from 'react';
import { AuthState, LoginCredentials, RegisterCredentials } from './types';
import { AuthUtils } from './utils';
import { User } from '@codai/core';

const initialState: AuthState = {
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

export function useAuth() {
    const [state, setState] = useState<AuthState>(initialState);

    const updateState = useCallback((updates: Partial<AuthState>) => {
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            updateState({ isLoading: true, error: null });

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const { user, session, token } = await response.json();

            AuthUtils.setToken(token);

            updateState({
                user,
                session,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            updateState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Login failed',
            });
        }
    }, [updateState]);

    const register = useCallback(async (credentials: RegisterCredentials) => {
        try {
            updateState({ isLoading: true, error: null });

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                throw new Error('Registration failed');
            }

            const { user, session, token } = await response.json();

            AuthUtils.setToken(token);

            updateState({
                user,
                session,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            updateState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Registration failed',
            });
        }
    }, [updateState]);

    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Silent fail for logout
        } finally {
            AuthUtils.removeToken();
            updateState({
                user: null,
                session: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        }
    }, [updateState]);

    const refreshToken = useCallback(async () => {
        try {
            const token = AuthUtils.getToken();
            if (!token) return;

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const { token: newToken, user } = await response.json();
                AuthUtils.setToken(newToken);
                updateState({ user });
            }
        } catch {
            // Silent fail for refresh
        }
    }, [updateState]);

    const updateUser = useCallback(async (updates: Partial<User>) => {
        try {
            const token = AuthUtils.getToken();
            const response = await fetch('/api/auth/user', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                updateState({ user: updatedUser });
            }
        } catch (error) {
            updateState({
                error: error instanceof Error ? error.message : 'Update failed',
            });
        }
    }, [updateState]);

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = AuthUtils.getToken();

            if (!token) {
                updateState({ isLoading: false });
                return;
            }

            try {
                const response = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const { user, session } = await response.json();
                    updateState({
                        user,
                        session,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } else {
                    AuthUtils.removeToken();
                    updateState({ isLoading: false });
                }
            } catch {
                AuthUtils.removeToken();
                updateState({ isLoading: false });
            }
        };

        initializeAuth();
    }, [updateState]);

    return {
        ...state,
        login,
        register,
        logout,
        refreshToken,
        updateUser,
    };
}

export function usePermissions() {
    const { user } = useAuth();

    const hasPermission = useCallback((permission: string) => {
        return user?.permissions?.includes(permission) ?? false;
    }, [user]);

    const hasRole = useCallback((role: string) => {
        return user?.role === role;
    }, [user]);

    const hasAnyPermission = useCallback((permissions: string[]) => {
        return permissions.some(permission => hasPermission(permission));
    }, [hasPermission]);

    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        permissions: user?.permissions ?? [],
        role: user?.role,
    };
}
