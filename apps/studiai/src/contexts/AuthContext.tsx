'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, AuthCredentials, RegisterCredentials, AuthResponse, UserPreferences } from '@/types/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signIn: (credentials: AuthCredentials) => Promise<AuthResponse>;
    signUp: (credentials: RegisterCredentials) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<AuthResponse>;
    sendPasswordReset: (email: string) => Promise<AuthResponse>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    updatePreferences: (preferences: Partial<UserPreferences>) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { data: session, status } = useSession();
    const [user, setUser] = useState<User | null>(null);

    const isLoading = status === 'loading';
    const isAuthenticated = !!session && !!user;

    useEffect(() => {
        if (session?.user) {
            setUser({
                id: session.user.id || '',
                email: session.user.email || '',
                name: session.user.name || '',
                avatar: session.user.image || undefined,
                role: 'user', // Default role, should come from session
                preferences: {
                    language: 'en',
                    theme: 'light',
                    emailNotifications: true,
                    pushNotifications: true,
                    notifications: {
                        email: true,
                        push: true,
                        inApp: true,
                        marketing: false
                    }
                },
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: new Date()
            });
        } else {
            setUser(null);
        }
    }, [session]);

    const handleSignIn = async (credentials: AuthCredentials): Promise<AuthResponse> => {
        try {
            const result = await signIn('credentials', {
                email: credentials.email,
                password: credentials.password,
                redirect: false
            });

            if (result?.error) {
                return {
                    success: false,
                    error: result.error
                };
            }

            return {
                success: true,
                message: 'Signed in successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Sign in failed'
            };
        }
    };

    const handleSignUp = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
        try {
            // Call your registration API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Registration failed'
                };
            }

            return {
                success: true,
                message: 'Account created successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Registration failed'
            };
        }
    };

    const handleSignOut = async (): Promise<void> => {
        await signOut({ redirect: false });
        setUser(null);
    };

    const handleSignInWithGoogle = async (): Promise<AuthResponse> => {
        try {
            const result = await signIn('google', { redirect: false });

            if (result?.error) {
                return {
                    success: false,
                    error: result.error
                };
            }

            return {
                success: true,
                message: 'Signed in with Google successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Google sign in failed'
            };
        }
    };

    const handleSendPasswordReset = async (email: string): Promise<AuthResponse> => {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.message || 'Failed to send password reset email'
                };
            }

            return {
                success: true,
                message: 'Password reset email sent successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send password reset email'
            };
        }
    };

    const updateProfile = async (data: Partial<User>): Promise<void> => {
        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    };

    const updatePreferences = async (preferences: Partial<UserPreferences>): Promise<AuthResponse> => {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) {
                const data = await response.json();
                return {
                    success: false,
                    error: data.message || 'Failed to update preferences'
                };
            }

            const data = await response.json();
            if (user) {
                setUser({
                    ...user,
                    preferences: {
                        ...user.preferences,
                        ...preferences
                    } as UserPreferences
                });
            }

            return {
                success: true,
                message: 'Preferences updated successfully'
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update preferences'
            };
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        signInWithGoogle: handleSignInWithGoogle,
        sendPasswordReset: handleSendPasswordReset,
        updateProfile,
        updatePreferences
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
