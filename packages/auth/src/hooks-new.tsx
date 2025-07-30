/**
 * CODAI Authentication React Hooks
 * 
 * Simplified React hooks for authentication state management that align
 * with the existing AuthContextType interface.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

import type {
    User,
    Session,
    AuthState,
    LoginCredentials,
    RegisterCredentials,
    LoginResponse,
    RegisterResponse,
    AuthError,
    UserRole,
    TokenPair,
    AuthContextType,
} from './types';

import {
    getStoredAccessToken,
    getStoredRefreshToken,
    verifyToken,
    storeTokens,
    clearStoredTokens,
    createAuthError,
    getTokenPayload,
    isTokenExpired,
    DEFAULT_AUTH_CONFIG,
    generateDeviceFingerprint,
    getDeviceInfo,
} from './utils';

// === SIMPLIFIED ZUSTAND STORE ===

interface AuthStore extends AuthState {
    // State setters
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: AuthError | null) => void;
    setInitialized: (initialized: boolean) => void;

    // Auth methods that match AuthContextType
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
    refreshAccessToken: () => Promise<TokenPair>;
    updateUser: (updates: Partial<User>) => Promise<User>;

    // Permission methods
    hasPermission: (permission: string) => boolean;
    hasRole: (role: UserRole) => boolean;

    // Utility methods
    clearAuth: () => void;
    validateSession: () => Promise<boolean>;
}

const useAuthStore = create<AuthStore>()(
    subscribeWithSelector((set, get) => ({
        // Initial state matching AuthState
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: true,
        isInitialized: false,
        error: null,
        permissions: new Set<string>(),
        apps: [],

        // State setters
        setUser: (user) => set({ user, isAuthenticated: !!user }),
        setSession: (session) => set({ session }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        setInitialized: (isInitialized) => set({ isInitialized }),

        // Authentication methods
        login: async (credentials): Promise<LoginResponse> => {
            set({ isLoading: true, error: null });

            try {
                const deviceId = generateDeviceFingerprint();
                const deviceInfo = getDeviceInfo();

                const response = await fetch(`${DEFAULT_AUTH_CONFIG.apiUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...credentials,
                        deviceId,
                        deviceInfo,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw createAuthError(
                        errorData.code || 'INVALID_CREDENTIALS',
                        errorData.message || 'Login failed'
                    );
                }

                const data: LoginResponse = await response.json();
                const { user, tokens, session } = data;

                // Store tokens securely
                storeTokens(tokens, credentials.rememberMe);

                // Update store
                set({
                    user,
                    session,
                    isAuthenticated: true,
                    permissions: new Set(user.permissions?.map(p => typeof p === 'string' ? p : p.id) || []),
                    isLoading: false,
                    error: null,
                    isInitialized: true,
                });

                return data;

            } catch (error) {
                const authError = error instanceof Error
                    ? createAuthError('NETWORK_ERROR', error.message)
                    : error as AuthError;

                set({
                    isLoading: false,
                    error: authError,
                    isAuthenticated: false,
                    user: null,
                    session: null,
                });

                throw authError;
            }
        },

        register: async (credentials): Promise<RegisterResponse> => {
            set({ isLoading: true, error: null });

            try {
                const deviceId = generateDeviceFingerprint();
                const deviceInfo = getDeviceInfo();

                const response = await fetch(`${DEFAULT_AUTH_CONFIG.apiUrl}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...credentials,
                        deviceId,
                        deviceInfo,
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw createAuthError(
                        errorData.code || 'VALIDATION_ERROR',
                        errorData.message || 'Registration failed'
                    );
                }

                const data: RegisterResponse = await response.json();

                if (DEFAULT_AUTH_CONFIG.requireEmailVerification) {
                    set({
                        isLoading: false,
                        error: null,
                        isInitialized: true,
                    });
                } else {
                    const { user, tokens, session } = data;
                    storeTokens(tokens);

                    set({
                        user,
                        session,
                        isAuthenticated: true,
                        permissions: new Set(user.permissions?.map(p => typeof p === 'string' ? p : p.id) || []),
                        isLoading: false,
                        error: null,
                        isInitialized: true,
                    });
                }

                return data;

            } catch (error) {
                const authError = error instanceof Error
                    ? createAuthError('NETWORK_ERROR', error.message)
                    : error as AuthError;

                set({
                    isLoading: false,
                    error: authError,
                });

                throw authError;
            }
        },

        logout: async () => {
            set({ isLoading: true });

            try {
                const refreshToken = getStoredRefreshToken();

                if (refreshToken) {
                    await fetch(`${DEFAULT_AUTH_CONFIG.apiUrl}/auth/logout`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });
                }

                // Clear tokens and session
                clearStoredTokens();

                set({
                    user: null,
                    session: null,
                    isAuthenticated: false,
                    permissions: new Set<string>(),
                    apps: [],
                    isLoading: false,
                    error: null,
                });

            } catch {
                // Even if logout fails on server, clear local state
                get().clearAuth();
            }
        },

        refreshAccessToken: async (): Promise<TokenPair> => {
            const refreshToken = getStoredRefreshToken();

            if (!refreshToken) {
                throw createAuthError('REFRESH_TOKEN_INVALID', 'No refresh token available');
            }

            try {
                const response = await fetch(`${DEFAULT_AUTH_CONFIG.apiUrl}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (!response.ok) {
                    throw createAuthError('REFRESH_TOKEN_INVALID', 'Token refresh failed');
                }

                const data = await response.json();
                const { tokens, user, session } = data;

                storeTokens(tokens);

                set({
                    user,
                    session,
                    isAuthenticated: true,
                    permissions: new Set(user.permissions?.map((p: any) => typeof p === 'string' ? p : p.id) || []),
                    error: null,
                });

                return tokens;

            } catch (error) {
                get().clearAuth();
                throw error;
            }
        },

        updateUser: async (updates): Promise<User> => {
            const token = getStoredAccessToken();
            if (!token) throw createAuthError('SESSION_EXPIRED', 'Not authenticated');

            set({ isLoading: true, error: null });

            try {
                const response = await fetch(`${DEFAULT_AUTH_CONFIG.apiUrl}/auth/profile`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(updates),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw createAuthError(
                        errorData.code || 'SERVER_ERROR',
                        errorData.message || 'Profile update failed'
                    );
                }

                const updatedUser: User = await response.json();

                set({
                    user: updatedUser,
                    isLoading: false,
                    error: null,
                });

                return updatedUser;

            } catch (error) {
                const authError = error instanceof Error
                    ? createAuthError('NETWORK_ERROR', error.message)
                    : error as AuthError;

                set({
                    isLoading: false,
                    error: authError,
                });

                throw authError;
            }
        },

        // Permission methods
        hasPermission: (permission) => {
            const { permissions } = get();
            return permissions.has(permission);
        },

        hasRole: (role) => {
            const { user } = get();
            return user?.role === role;
        },

        // Utility methods
        clearAuth: () => {
            clearStoredTokens();
            set({
                user: null,
                session: null,
                isAuthenticated: false,
                permissions: new Set<string>(),
                apps: [],
                error: null,
            });
        },

        validateSession: async () => {
            const token = getStoredAccessToken();

            if (!token) {
                get().clearAuth();
                return false;
            }

            if (isTokenExpired(token)) {
                try {
                    await get().refreshAccessToken();
                    return get().isAuthenticated;
                } catch {
                    get().clearAuth();
                    return false;
                }
            }

            try {
                await verifyToken(token);
                return true;
            } catch {
                get().clearAuth();
                return false;
            }
        },
    }))
);

// === MAIN AUTHENTICATION HOOK ===

/**
 * Main authentication hook that provides all auth functionality
 */
export function useAuth(): AuthContextType {
    const store = useAuthStore();

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = getStoredAccessToken();

            if (!token) {
                store.setLoading(false);
                store.setInitialized(true);
                return;
            }

            if (isTokenExpired(token)) {
                try {
                    await store.refreshAccessToken();
                } catch {
                    store.clearAuth();
                }
            } else {
                try {
                    const _payload = await verifyToken(token);
                    // We need user data from the backend here
                    // For now, just validate the token
                    store.setLoading(false);
                    store.setInitialized(true);
                } catch {
                    store.clearAuth();
                }
            }

            store.setLoading(false);
            store.setInitialized(true);
        };

        initAuth();
    }, []);

    // Auto refresh token
    useEffect(() => {
        const interval = setInterval(async () => {
            const token = getStoredAccessToken();
            if (token && isTokenExpired(token)) {
                try {
                    await store.refreshAccessToken();
                } catch {
                    // Token refresh failed, will be handled by the store
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    return useMemo(() => ({
        // State
        user: store.user,
        session: store.session,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        isInitialized: store.isInitialized,
        error: store.error,
        permissions: store.permissions,
        apps: store.apps,

        // Authentication methods - implementing all AuthContextType methods
        login: store.login,
        register: store.register,
        loginWithSocial: async () => { throw new Error('Not implemented'); },
        logout: store.logout,

        // Token management
        refreshAccessToken: store.refreshAccessToken,
        revokeSession: async () => { throw new Error('Not implemented'); },
        revokeMeAllSessions: async () => { throw new Error('Not implemented'); },

        // User management
        updateUser: store.updateUser,
        updatePreferences: async () => { throw new Error('Not implemented'); },
        changePassword: async () => { throw new Error('Not implemented'); },
        deleteAccount: async () => { throw new Error('Not implemented'); },

        // Account verification
        sendEmailVerification: async () => { throw new Error('Not implemented'); },
        verifyEmail: async () => { throw new Error('Not implemented'); },
        resetPassword: async () => { throw new Error('Not implemented'); },
        confirmPasswordReset: async () => { throw new Error('Not implemented'); },

        // Two-factor authentication
        enableTwoFactor: async () => { throw new Error('Not implemented'); },
        disableTwoFactor: async () => { throw new Error('Not implemented'); },
        verifyTwoFactor: async () => { throw new Error('Not implemented'); },

        // Social accounts
        connectSocialAccount: async () => { throw new Error('Not implemented'); },
        disconnectSocialAccount: async () => { throw new Error('Not implemented'); },

        // Permission checking
        hasPermission: store.hasPermission,
        hasRole: store.hasRole,
        canAccess: () => { return false; }, // Not implemented

        // Session management
        getSessions: async () => { throw new Error('Not implemented'); },
        getActiveSession: () => store.session,

        // Utility methods
        isTokenExpired,
        getTokenPayload,
        clearAuth: store.clearAuth,
    }), [store]);
}

// === SIMPLIFIED HELPER HOOKS ===

/**
 * Hook for current user data
 */
export function useUser() {
    const user = useAuthStore(state => state.user);
    const updateUser = useAuthStore(state => state.updateUser);
    const isLoading = useAuthStore(state => state.isLoading);
    const error = useAuthStore(state => state.error);

    return {
        user,
        updateUser,
        isLoading,
        error,
    };
}

/**
 * Hook for session management
 */
export function useSession() {
    const session = useAuthStore(state => state.session);
    const validateSession = useAuthStore(state => state.validateSession);
    const logout = useAuthStore(state => state.logout);

    const isValid = useMemo(() => {
        if (!session) return false;
        return session.expiresAt > new Date() && session.isActive;
    }, [session]);

    return {
        session,
        isValid,
        validateSession,
        logout,
    };
}

/**
 * Hook for permission checking
 */
export function usePermissions() {
    const permissions = useAuthStore(state => state.permissions);
    const hasPermission = useAuthStore(state => state.hasPermission);
    const hasRole = useAuthStore(state => state.hasRole);

    const hasAnyPermission = useCallback((permissionList: string[]) => {
        return permissionList.some(p => permissions.has(p));
    }, [permissions]);

    const hasAllPermissions = useCallback((permissionList: string[]) => {
        return permissionList.every(p => permissions.has(p));
    }, [permissions]);

    return {
        permissions,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
    };
}

/**
 * Hook for authentication forms
 */
export function useAuthForm() {
    const login = useAuthStore(state => state.login);
    const register = useAuthStore(state => state.register);
    const isLoading = useAuthStore(state => state.isLoading);
    const error = useAuthStore(state => state.error);
    const setError = useAuthStore(state => state.setError);

    const clearError = useCallback(() => {
        setError(null);
    }, [setError]);

    return {
        login,
        register,
        isLoading,
        error,
        clearError,
    };
}

/**
 * Hook for route protection
 */
export function useAuthGuard() {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    const isLoading = useAuthStore(state => state.isLoading);
    const validateSession = useAuthStore(state => state.validateSession);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            validateSession();
        }
    }, [isLoading, isAuthenticated, validateSession]);

    return {
        isAuthenticated,
        isLoading,
        canAccess: isAuthenticated && !isLoading,
    };
}

/**
 * Subscribe to auth state changes
 */
export function useAuthSubscription(callback: (state: AuthState) => void) {
    useEffect(() => {
        const unsubscribe = useAuthStore.subscribe(
            (state) => ({
                user: state.user,
                session: state.session,
                isAuthenticated: state.isAuthenticated,
                isLoading: state.isLoading,
                isInitialized: state.isInitialized,
                error: state.error,
                permissions: state.permissions,
                apps: state.apps,
            }),
            callback
        );

        return unsubscribe;
    }, [callback]);
}
