'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    emailVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
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

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            // Mock authentication - replace with real implementation
            const mockUser: User = {
                id: '1',
                email,
                displayName: 'Test User',
                emailVerified: true,
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Authentication failed');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, displayName?: string) => {
        setLoading(true);
        setError(null);
        try {
            // Mock authentication - replace with real implementation
            const mockUser: User = {
                id: '1',
                email,
                displayName: displayName || 'New User',
                emailVerified: false,
            };
            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
            throw err;
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

    const resetPassword = async (email: string) => {
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
        signOut,
        resetPassword,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
