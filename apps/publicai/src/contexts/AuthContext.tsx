'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode, type JSX } from 'react';

interface User {
    id: string;
    email: string;
    displayName?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName?: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize auth state
        const initializeAuth = async () => {
            try {
                // Check for existing session
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error('Failed to initialize auth:', error);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setLoading(true);
        try {
            // Mock login logic
            const mockUser: User = {
                id: '1',
                email,
                displayName: email.split('@')[0],
            };

            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, displayName?: string): Promise<void> => {
        setLoading(true);
        try {
            // Mock register logic
            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                email,
                displayName: displayName || email.split('@')[0],
            };

            localStorage.setItem('user', JSON.stringify(mockUser));
            setUser(mockUser);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = async (): Promise<void> => {
        try {
            localStorage.removeItem('user');
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    };

    const updateProfile = async (data: Partial<User>): Promise<void> => {
        if (!user) return;

        try {
            const updatedUser = { ...user, ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
