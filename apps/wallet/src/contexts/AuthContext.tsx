'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserPreferences {
    theme?: 'light' | 'dark' | 'system';
    language?: 'en' | 'ro';
    notifications?: {
        email: boolean;
        push: boolean;
        marketing: boolean;
    };
}

export interface User {
    id: string;
    email: string;
    displayName: string | null;
    photoURL?: string | undefined;
    emailVerified: boolean;
    createdAt: Date;
    lastLoginAt: Date;
    preferences?: UserPreferences;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    displayName: string;
    confirmPassword: string;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User | null;
    error: string | null;
}

export interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
    signUp: (credentials: RegisterCredentials) => Promise<AuthResponse>;
    signInWithGoogle: () => Promise<AuthResponse>;
    logout: () => void;
    register: (email: string, password: string, name: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    sendEmailVerification: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
    isLoading: boolean;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock authentication check
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                const savedUser = localStorage.getItem('wallet-auth-user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error('Auth check failed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Mock login
            const mockUser: User = {
                id: '1',
                email,
                displayName: email.split('@')[0],
                photoURL: '/default-avatar.png',
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
            setUser(mockUser);
            localStorage.setItem('wallet-auth-user', JSON.stringify(mockUser));
        } catch (error) {
            console.error('Login failed:', error);
            throw new Error('Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        setIsLoading(true);
        try {
            // Mock registration
            const mockUser: User = {
                id: '1',
                email,
                displayName: name,
                photoURL: '/default-avatar.png',
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
            setUser(mockUser);
            localStorage.setItem('wallet-auth-user', JSON.stringify(mockUser));
        } catch (error) {
            console.error('Registration failed:', error);
            throw new Error('Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const signIn = async (credentials: AuthCredentials): Promise<AuthResponse> => {
        try {
            await login(credentials.email, credentials.password);
            return { user, error: null };
        } catch (error) {
            return { user: null, error: error instanceof Error ? error.message : 'Login failed' };
        }
    };

    const signUp = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        try {
            await register(credentials.email, credentials.password, credentials.displayName);
            return { user, error: null };
        } catch (error) {
            return { user: null, error: error instanceof Error ? error.message : 'Registration failed' };
        }
    };

    const signInWithGoogle = async (): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            // Mock Google login
            const mockUser: User = {
                id: '1',
                email: 'user@google.com',
                displayName: 'Google User',
                photoURL: '/google-avatar.png',
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date()
            };
            setUser(mockUser);
            localStorage.setItem('wallet-auth-user', JSON.stringify(mockUser));
            return { user: mockUser, error: null };
        } catch (error) {
            console.error('Google login failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Google login failed';
            return { user: null, error: errorMessage };
        } finally {
            setIsLoading(false);
        }
    };

    const sendPasswordReset = async (email: string) => {
        console.log('Password reset requested for:', email);
        // Mock implementation
    };

    const sendEmailVerification = async () => {
        console.log('Email verification sent');
        // Mock implementation
    };

    const updateProfile = async (data: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...data };
            setUser(updatedUser);
            localStorage.setItem('wallet-auth-user', JSON.stringify(updatedUser));
        }
    };

    const updatePreferences = async (preferences: Partial<UserPreferences>) => {
        if (user) {
            const updatedUser = { ...user, preferences: { ...user.preferences, ...preferences } };
            setUser(updatedUser);
            localStorage.setItem('wallet-auth-user', JSON.stringify(updatedUser));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('wallet-auth-user');
    };

    const value: AuthContextType = {
        user,
        login,
        signIn,
        signUp,
        signInWithGoogle,
        logout,
        register,
        sendPasswordReset,
        sendEmailVerification,
        updateProfile,
        updatePreferences,
        isLoading,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
