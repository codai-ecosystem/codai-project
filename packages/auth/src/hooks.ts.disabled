/**
 * CODAI Authentication React Hooks
 * 
 * Comprehensive React hooks for authentication state management,
 * session handling, and user interactions.
 */

import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type {
    User,
    Session,
    AuthState,
    LoginCredentials,
    RegisterCredentials,
    ChangePasswordCredentials,
    AuthContextType,
    TokenPair,
    AuthError,
    DeviceInfo,
    LoginResponse,
    RegisterResponse,
    Permission,
} from './types';

import {
    createTokenPair,
    verifyToken,
    getStoredAccessToken,
    getStoredRefreshToken,
    storeTokens,
    clearStoredTokens,
    getTokenPayload,
    isTokenExpired,
    createAuthError,
    getDeviceInfo,
    generateDeviceFingerprint,
    DEFAULT_AUTH_CONFIG,
    createAuthUrls,
    isRateLimited,
    clearRateLimit,
    validatePassword,
    loginCredentialsSchema,
    registerCredentialsSchema,
} from './utils';

// === ZUSTAND STORE ===

interface AuthStore {
    // State
    user: User | null;
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: AuthError | null;

    // Actions
    setUser: (user: User | null) => void;
    setSession: (session: Session | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: AuthError | null) => void;
    clearAuth: () => void;

    // Auth Methods
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    register: (credentials: RegisterCredentials) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;

    // Profile Methods
    updateProfile: (updates: Partial<User>) => Promise<User>;
    changePassword: (credentials: ChangePasswordCredentials) => Promise<void>;

    // Session Methods
    getSessions: () => Promise<Session[]>;
    terminateSession: (sessionId: string) => Promise<void>;
    terminateAllSessions: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            // Initial State
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,

            // State Setters
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            setSession: (session) => set({ session }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            clearAuth: () => set({
                user: null,
                session: null,
                isAuthenticated: false,
                error: null,
            }),

            // === AUTHENTICATION METHODS ===

            login: async (credentials) => {
                set({ isLoading: true, error: null });

                try {
                    // Validate credentials
                    const validationResult = loginCredentialsSchema.safeParse(credentials);
                    if (!validationResult.success) {
                        const error = createAuthError('VALIDATION_ERROR', 'Invalid login credentials', {
                            validation: validationResult.error.errors,
                        });
                        set({ error, isLoading: false });
                        throw error;
                    }

                    // Check rate limiting
                    const rateLimitKey = `login:${credentials.email}`;
                    if (isRateLimited(rateLimitKey, DEFAULT_AUTH_CONFIG.rateLimiting.loginAttempts, DEFAULT_AUTH_CONFIG.rateLimiting.loginWindow * 60 * 1000)) {
                        const error = createAuthError('RATE_LIMITED', 'Too many login attempts, please try again later');
                        set({ error, isLoading: false });
                        throw error;
                    }

                    // Get device info
                    const deviceInfo = getDeviceInfo();
                    const deviceId = credentials.deviceId || generateDeviceFingerprint();

                    // Make API call
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.login, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...credentials,
                            deviceId,
                            deviceInfo,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        const error = createAuthError(
                            data.code || 'INVALID_CREDENTIALS',
                            data.message || 'Login failed'
                        );
                        set({ error, isLoading: false });
                        throw error;
                    }

                    // Store tokens
                    const tokens: TokenPair = data.tokens;
                    storeTokens(tokens, credentials.rememberMe);

                    // Set user and session
                    const user: User = data.user;
                    const session: Session = data.session;

                    set({
                        user,
                        session,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    // Clear rate limiting on success
                    clearRateLimit(rateLimitKey);

                    return {
                        user,
                        tokens,
                        session,
                        requiresTwoFactor: data.requiresTwoFactor,
                        trustDevice: data.trustDevice,
                    } as LoginResponse;

                } catch (error) {
                    let authError: AuthError;
                    if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'timestamp' in error) {
                        authError = error as AuthError;
                    } else {
                        authError = createAuthError('NETWORK_ERROR', 'Network error during login');
                    }
                    set({ error: authError, isLoading: false });
                    throw authError;
                }
            },

            register: async (credentials) => {
                set({ isLoading: true, error: null });

                try {
                    // Validate credentials
                    const validationResult = registerCredentialsSchema.safeParse(credentials);
                    if (!validationResult.success) {
                        const error = createAuthError('VALIDATION_ERROR', 'Invalid registration data', {
                            validation: validationResult.error.errors,
                        });
                        set({ error, isLoading: false });
                        throw error;
                    }

                    // Validate password strength
                    const passwordValidation = validatePassword(credentials.password);
                    if (!passwordValidation.isValid) {
                        const error = createAuthError('VALIDATION_ERROR', 'Password does not meet requirements', {
                            passwordErrors: passwordValidation.errors,
                        });
                        set({ error, isLoading: false });
                        throw error;
                    }

                    // Get device info
                    const deviceInfo = getDeviceInfo();
                    const deviceId = generateDeviceFingerprint();

                    // Make API call
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.register, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...credentials,
                            deviceId,
                            deviceInfo,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        const error = createAuthError(
                            data.code || 'VALIDATION_ERROR',
                            data.message || 'Registration failed'
                        );
                        set({ error, isLoading: false });
                        throw error;
                    }

                    // Store tokens and set user state
                    const tokens: TokenPair = data.tokens;
                    const user: User = data.user;
                    const session: Session = data.session;

                    storeTokens(tokens, false);
                    set({
                        user,
                        session,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    return {
                        user,
                        tokens,
                        session,
                        emailVerificationRequired: data.emailVerificationRequired || false,
                    } as RegisterResponse;

                } catch (error) {
                    let authError: AuthError;
                    if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'timestamp' in error) {
                        authError = error as AuthError;
                    } else {
                        authError = createAuthError('NETWORK_ERROR', 'Network error during registration');
                    }
                    set({ error: authError, isLoading: false });
                    throw authError;
                }
            },

            logout: async () => {
                set({ isLoading: true });

                try {
                    const token = getStoredAccessToken();
                    if (token) {
                        // Notify server about logout
                        const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                        await fetch(authUrls.logout, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                        }).catch(() => {
                            // Ignore network errors on logout
                        });
                    }
                } catch (error) {
                    // Ignore errors during logout API call
                } finally {
                    // Always clear local state
                    clearStoredTokens();
                    set({
                        user: null,
                        session: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                }
            },

            refreshToken: async () => {
                const refreshToken = getStoredRefreshToken();
                if (!refreshToken) {
                    get().logout();
                    return false;
                }

                try {
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.refresh, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (!response.ok) {
                        get().logout();
                        return false;
                    }

                    const data = await response.json();
                    const tokens: TokenPair = data.tokens;

                    // Store new tokens
                    storeTokens(tokens, true);

                    // Update user if provided
                    if (data.user) {
                        set({ user: data.user });
                    }

                    return true;

                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            // === PROFILE METHODS ===

            updateProfile: async (updates) => {
                const token = getStoredAccessToken();
                if (!token) {
                    const error = createAuthError('SESSION_EXPIRED', 'Please log in again');
                    set({ error });
                    throw error;
                }

                try {
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.profile, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updates),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        const error = createAuthError(
                            data.code || 'SERVER_ERROR',
                            data.message || 'Failed to update profile'
                        );
                        set({ error });
                        throw error;
                    }

                    // Update user in state
                    const updatedUser = data.user;
                    set({ user: updatedUser });

                    return updatedUser;

                } catch (error) {
                    let authError: AuthError;
                    if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'timestamp' in error) {
                        authError = error as AuthError;
                    } else {
                        authError = createAuthError('NETWORK_ERROR', 'Network error updating profile');
                    }
                    set({ error: authError });
                    throw authError;
                }
            },

            changePassword: async (credentials) => {
                const token = getStoredAccessToken();
                if (!token) {
                    const error = createAuthError('SESSION_EXPIRED', 'Please log in again');
                    set({ error });
                    throw error;
                }

                // Validate new password
                const passwordValidation = validatePassword(credentials.newPassword);
                if (!passwordValidation.isValid) {
                    const error = createAuthError('VALIDATION_ERROR', 'New password does not meet requirements', {
                        passwordErrors: passwordValidation.errors,
                    });
                    set({ error });
                    throw error;
                }

                try {
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.changePassword, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            currentPassword: credentials.currentPassword,
                            newPassword: credentials.newPassword,
                        }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        const error = createAuthError(
                            data.code || 'INVALID_CREDENTIALS',
                            data.message || 'Failed to change password'
                        );
                        set({ error });
                        throw error;
                    }

                    // Password changed successfully - no return value needed for void function

                } catch (error) {
                    let authError: AuthError;
                    if (error && typeof error === 'object' && 'code' in error && 'message' in error && 'timestamp' in error) {
                        authError = error as AuthError;
                    } else {
                        authError = createAuthError('NETWORK_ERROR', 'Network error changing password');
                    }
                    set({ error: authError });
                    throw authError;
                }
            },

            // === SESSION METHODS ===

            getSessions: async () => {
                const token = getStoredAccessToken();
                if (!token) return [];

                try {
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.sessions, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        return data.sessions || [];
                    }
                } catch (error) {
                    // Ignore errors
                }

                return [];
            },

            terminateSession: async (sessionId) => {
                const token = getStoredAccessToken();
                if (!token) return;

                try {
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(`${authUrls.sessions}/${sessionId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error('Failed to terminate session');
                    }
                } catch (error) {
                    // Ignore errors for this method as per interface
                }
            },

            terminateAllSessions: async () => {
                const token = getStoredAccessToken();
                if (!token) return;

                try {
                    const authUrls = createAuthUrls(DEFAULT_AUTH_CONFIG.apiUrl);
                    const response = await fetch(authUrls.sessions, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (response.ok) {
                        // Current session will also be terminated, so logout
                        get().logout();
                    }
                } catch (error) {
                    // Ignore errors for this method as per interface
                }
            },
        }),
        {
            name: 'codai-auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// === REACT HOOKS ===

/**
 * Main authentication hook
 */
export function useAuth(): AuthContextType {
    const store = useAuthStore();

    // Check token validity on mount and periodically
    useEffect(() => {
        const checkAuth = async () => {
            const token = getStoredAccessToken();

            if (!token) {
                store.clearAuth();
                store.setLoading(false);
                return;
            }

            if (isTokenExpired(token)) {
                // Try to refresh token
                const refreshed = await store.refreshToken();
                if (!refreshed) {
                    store.clearAuth();
                }
            } else {
                // Token is valid, verify user state
                const payload = getTokenPayload(token);
                if (payload && !store.user) {
                    // TODO: Fetch user details from API if needed
                }
            }

            store.setLoading(false);
        };

        checkAuth();

        // Set up token refresh interval
        const interval = setInterval(() => {
            const token = getStoredAccessToken();
            if (token && isTokenExpired(token)) {
                store.refreshToken();
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, []);

    return {
        user: store.user,
        session: store.session,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        isInitialized: !store.isLoading,
        error: store.error,
        permissions: new Set(store.user?.permissions.map(p => p.id) || []),
        apps: [], // TODO: Implement connected apps
        login: store.login,
        register: store.register,
        loginWithSocial: async () => { throw new Error('Not implemented'); },
        logout: store.logout,
        refreshAccessToken: async () => {
            const success = await store.refreshToken();
            if (!success) throw new Error('Failed to refresh token');
            const token = getStoredAccessToken();
            const refreshToken = getStoredRefreshToken();
            if (!token || !refreshToken) throw new Error('No tokens available');
            return { accessToken: token, refreshToken, expiresIn: DEFAULT_AUTH_CONFIG.accessTokenExpiry, tokenType: 'Bearer' as const };
        },
        revokeSession: store.terminateSession,
        revokeMeAllSessions: store.terminateAllSessions,
        updateUser: store.updateProfile,
        updatePreferences: async () => { throw new Error('Not implemented'); },
        changePassword: store.changePassword,
        deleteAccount: async () => { throw new Error('Not implemented'); },
        sendEmailVerification: async () => { throw new Error('Not implemented'); },
        verifyEmail: async () => { throw new Error('Not implemented'); },
        resetPassword: async () => { throw new Error('Not implemented'); },
        confirmPasswordReset: async () => { throw new Error('Not implemented'); },
        enableTwoFactor: async () => { throw new Error('Not implemented'); },
        disableTwoFactor: async () => { throw new Error('Not implemented'); },
        verifyTwoFactor: async () => { throw new Error('Not implemented'); },
        connectSocialAccount: async () => { throw new Error('Not implemented'); },
        disconnectSocialAccount: async () => { throw new Error('Not implemented'); },
        hasPermission: (permission: string) => {
            if (!store.isAuthenticated || !store.user) return false;
            return store.user.permissions.some(p => p.id === permission) || store.user.role === 'admin';
        },
        hasRole: (role) => {
            if (!store.isAuthenticated || !store.user) return false;
            return store.user.role === role;
        },
        canAccess: () => { throw new Error('Not implemented'); },
        getSessions: store.getSessions,
        getActiveSession: () => store.session,
        isTokenExpired,
        getTokenPayload,
        clearAuth: store.clearAuth,
    };
}

/**
 * Hook for user session information
 */
export function useSession() {
    const { session, isAuthenticated } = useAuth();

    return {
        session,
        isActive: isAuthenticated && !!session,
        deviceInfo: session?.deviceInfo,
        lastActivity: session?.lastActiveAt,
        expiresAt: session?.expiresAt,
    };
}

/**
 * Hook for user permissions
 */
export function usePermissions() {
    const { user, isAuthenticated } = useAuth();

    const hasPermission = useCallback((permission: string): boolean => {
        if (!isAuthenticated || !user) return false;
        return user.permissions.some(p => p.id === permission) || user.role === 'admin';
    }, [user, isAuthenticated]);

    const hasRole = useCallback((role: string): boolean => {
        if (!isAuthenticated || !user) return false;
        return user.role === role;
    }, [user, isAuthenticated]);

    const hasAnyRole = useCallback((roles: string[]): boolean => {
        if (!isAuthenticated || !user) return false;
        return roles.includes(user.role);
    }, [user, isAuthenticated]);

    return {
        permissions: user?.permissions || [],
        role: user?.role,
        hasPermission,
        hasRole,
        hasAnyRole,
        isAdmin: user?.role === 'admin',
        isModerator: user?.role === 'moderator',
        isUser: user?.role === 'user',
    };
}

/**
 * Hook for authentication form state
 */
export function useAuthForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const validateField = useCallback((field: string, value: any, schema: any) => {
        try {
            schema.parse({ [field]: value });
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
            return true;
        } catch (error: any) {
            const fieldError = error.errors?.find((e: any) => e.path.includes(field));
            if (fieldError) {
                setValidationErrors(prev => ({ ...prev, [field]: fieldError.message }));
            }
            return false;
        }
    }, []);

    const clearValidationErrors = useCallback(() => {
        setValidationErrors({});
    }, []);

    return {
        isSubmitting,
        setIsSubmitting,
        validationErrors,
        setValidationErrors,
        validateField,
        clearValidationErrors,
    };
}

/**
 * Hook for authentication utilities
 */
export function useAuthUtils() {
    return {
        generateDeviceFingerprint,
        getDeviceInfo,
        isValidEmail: (email: string) => {
            try {
                loginCredentialsSchema.shape.email.parse(email);
                return true;
            } catch {
                return false;
            }
        },
        validatePassword,
        createAuthUrls: (baseUrl?: string) => createAuthUrls(baseUrl || DEFAULT_AUTH_CONFIG.apiUrl),
    };
}
