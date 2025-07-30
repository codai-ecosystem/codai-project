'use client';

import type { JSX, ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

import type {
    AuthCredentials,
    AuthResponse,
    RegisterCredentials,
    User,
} from '@/types/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
    signUp: (credentials: RegisterCredentials) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<AuthResponse>;
    sendPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for saved user in localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.warn('Failed to parse saved user data:', error);
                localStorage.removeItem('user');
            }
        }
        setIsLoading(false);
    }, []);

    const signIn = async (credentials: AuthCredentials): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            // Mock authentication - in real app, this would call your API
            const mockUser: User = {
                id: 'mock-user-id',
                email: credentials.email,
                displayName: credentials.email.split('@')[0],
                photoURL: null,
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date(),
                preferences: {
                    theme: 'system',
                    language: 'en',
                    notifications: { email: true, push: true, marketing: false, },
                },
            };

            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));

            return {
                user: mockUser,
                success: true,
            };
        } catch (error) {
            return {
                user: null,
                success: false,
                error: error instanceof Error ? error.message : 'Sign in failed',
            };
        } finally {
            setIsLoading(false);
        }
    };

    const signUp = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            // Mock registration - in real app, this would call your API
            const mockUser: User = {
                id: 'mock-user-id',
                email: credentials.email,
                displayName: credentials.displayName || credentials.email.split('@')[0],
                photoURL: null,
                emailVerified: false,
                createdAt: new Date(),
                lastLoginAt: new Date(),
                preferences: {
                    theme: 'system',
                    language: 'en',
                    notifications: { email: true, push: true, marketing: false, },
                },
            };

            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));

            return {
                user: mockUser,
                success: true,
            };
        } catch (error) {
            return {
                user: null,
                success: false,
                error: error instanceof Error ? error.message : 'Sign up failed',
            };
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async (): Promise<void> => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const signInWithGoogle = async (): Promise<AuthResponse> => {
        setIsLoading(true);
        try {
            // Mock Google sign in - in real app, this would use Firebase or Google OAuth
            const mockUser: User = {
                id: 'mock-google-user-id',
                email: 'user@gmail.com',
                displayName: 'Mock User',
                photoURL: 'https://via.placeholder.com/150',
                emailVerified: true,
                createdAt: new Date(),
                lastLoginAt: new Date(),
                preferences: {
                    theme: 'system',
                    language: 'en',
                    notifications: { email: true, push: true, marketing: false, },
                },
            };

            setUser(mockUser);
            localStorage.setItem('user', JSON.stringify(mockUser));

            return {
                user: mockUser,
                success: true,
            };
        } catch (error) {
            return {
                user: null,
                success: false,
                error: error instanceof Error ? error.message : 'Google sign in failed',
            };
        } finally {
            setIsLoading(false);
        }
    };

    const sendPasswordReset = async (email: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Mock password reset - in real app, this would call your API
            console.log('Password reset requested for:', email);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Password reset failed'
            };
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        sendPasswordReset,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
