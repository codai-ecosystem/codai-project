import { createEnhancedLoginEndpoint, type DemoUser } from '@codai/api-utils/auth';

/**
 * RomAI Frontend Authentication API
 * Migrated to use @codai/api-utils standardized auth utilities
 */

// Demo users configuration
const DEMO_USERS: DemoUser[] = [
    {
        id: '1',
        email: 'admin@romai.ro',
        username: 'admin',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        permissions: ['romanian_analysis', 'consciousness_queries', 'cultural_analysis', 'admin_dashboard']
    },
    {
        id: '2',
        email: 'demo@romai.ro',
        username: 'demo_user',
        password: 'demo123',
        name: 'Demo User',
        role: 'user',
        permissions: ['romanian_analysis', 'consciousness_queries', 'cultural_analysis']
    },
    {
        id: '3',
        email: 'test@romai.ro',
        username: 'test_user',
        password: 'test_password',
        name: 'Test User',
        role: 'user',
        permissions: ['romanian_analysis', 'consciousness_queries']
    }
];

// Create standardized login endpoint
const loginEndpoint = createEnhancedLoginEndpoint({
    service: 'RomAI',
    version: '1.0.0',
    demoUsers: DEMO_USERS,
    cookieName: 'romai_auth_token',
    tokenExpiry: 24 * 60 * 60, // 24 hours
    onSuccess: async (user, request) => {
        console.log(`[RomAI] User logged in: ${user.email} (${user.name})`);
    },
    onFailure: async (error, request) => {
        console.error(`[RomAI] Login failed:`, error.message);
    }
});

export const { POST, GET } = loginEndpoint;
