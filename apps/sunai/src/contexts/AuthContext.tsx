'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
    signUp: (credentials: RegisterCredentials) => Promise<AuthResponse>;
    signInWithGoogle: () => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const signIn = async (credentials: AuthCredentials): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            // Mock authentication - replace with real implementation
            const mockUser: User = {
                id: '1',
                email: credentials.email,
                displayName: 'Test User',
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date(),
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { user: null, error: null }; // Mock success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
            setError(errorMessage);
            return { user: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            // Mock authentication - replace with real implementation
            const mockUser: User = {
                id: '1',
                email: credentials.email,
                displayName: credentials.displayName,
                emailVerified: false,
                createdAt: new Date(),
                lastLoginAt: new Date(),
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { user: null, error: null }; // Mock success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Registration failed';
            setError(errorMessage);
            return { user: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const signInWithGoogle = async (): Promise<AuthResponse> => {
        setLoading(true);
        setError(null);
        try {
            // Mock Google authentication - replace with real implementation
            const mockUser: User = {
                id: 'google-user-1',
                email: 'user@gmail.com',
                displayName: 'Google User',
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date(),
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return { user: null, error: null }; // Mock success
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Google authentication failed';
            setError(errorMessage);
            return { user: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setLoading(true);
        try {
            setUser(null);
            localStorage.removeItem('user');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sign out failed');
        } finally {
            setLoading(false);
        }
    };

    const sendPasswordReset = async (email: string) => {
        setLoading(true);
        setError(null);
        try {
            // Mock password reset - replace with real implementation
            console.log('Password reset sent to:', email);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Password reset failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse stored user:', err);
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        error,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        sendPasswordReset,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
