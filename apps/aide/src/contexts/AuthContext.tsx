'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // Mock auth - replace with real implementation
            const mockUser = { id: '1', email, name: 'Demo User' };
            setUser(mockUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setUser(null);
    };

    const sendPasswordReset = async (email: string) => {
        console.log('Password reset requested for:', email);
        // Mock password reset - replace with real implementation
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, sendPasswordReset, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
