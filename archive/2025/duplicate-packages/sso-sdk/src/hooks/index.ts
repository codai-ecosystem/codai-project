import { useState, useEffect } from 'react';
import type { CodaiUser, CodaiSession, RBACPermission, DeviceSecurityInfo } from '../types/index.js';

export function useCodaiAuth() {
    const [user, setUser] = useState<CodaiUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Mock authentication state for development
        setIsLoading(false);
        setIsAuthenticated(false);
        setUser(null);
    }, []);

    const signIn = async (credentials: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            // Mock sign in
            const mockUser: CodaiUser = {
                id: '1',
                email: credentials.email,
                name: 'Test User',
                roles: ['user'],
                permissions: ['read', 'write']
            };
            setUser(mockUser);
            setIsAuthenticated(true);
            return { success: true, user: mockUser };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Sign in failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setUser(null);
        setIsAuthenticated(false);
        return { success: true };
    };

    return {
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signOut
    };
}

export function useRBAC() {
    const [permissions, setPermissions] = useState<RBACPermission[]>([]);

    const checkPermission = (resource: string, action: string): boolean => {
        // Mock RBAC check
        return permissions.some(p =>
            p.resource === resource &&
            p.action === action &&
            p.granted
        );
    };

    const hasRole = (role: string): boolean => {
        // Mock role check
        return ['user', 'admin'].includes(role);
    };

    return {
        permissions,
        checkPermission,
        hasRole
    };
}

export function useDeviceSecurity() {
    const [deviceInfo, setDeviceInfo] = useState<DeviceSecurityInfo | null>(null);

    useEffect(() => {
        // Mock device security info
        setDeviceInfo({
            deviceId: 'mock-device-id',
            isTrusted: true,
            lastVerified: new Date(),
            riskScore: 0.1
        });
    }, []);

    const verifyDevice = async (): Promise<boolean> => {
        // Mock device verification
        return true;
    };

    const markDeviceAsTrusted = async (): Promise<void> => {
        if (deviceInfo) {
            setDeviceInfo({
                ...deviceInfo,
                isTrusted: true,
                lastVerified: new Date()
            });
        }
    };

    return {
        deviceInfo,
        verifyDevice,
        markDeviceAsTrusted
    };
}
