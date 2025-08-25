import { NextRequest, NextResponse } from 'next/server';

/**
 * User Profile API
 * Protected endpoint for retrieving user profile information
 */

interface UserProfile {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
    lastLogin: string;
    preferences: {
        language: string;
        theme: string;
        notifications: boolean;
    };
}

// Simple token validation (in production, use proper JWT validation)
function validateToken(token: string): { valid: boolean; userId?: string } {
    if (!token || !token.startsWith('romai_')) {
        return { valid: false };
    }

    // Extract user ID from token format: romai_{userId}_{timestamp}_{random}
    const parts = token.split('_');
    if (parts.length >= 2) {
        return { valid: true, userId: parts[1] };
    }

    return { valid: false };
}

// Get user profile by ID
function getUserProfile(userId: string): UserProfile | null {
    const profiles: Record<string, UserProfile> = {
        '1': {
            id: '1',
            username: 'admin',
            email: 'admin@romai.ro',
            name: 'Admin User',
            role: 'admin',
            permissions: ['romanian_analysis', 'consciousness_queries', 'cultural_analysis', 'admin_access'],
            lastLogin: new Date().toISOString(),
            preferences: {
                language: 'ro-RO',
                theme: 'dark',
                notifications: true
            }
        },
        '2': {
            id: '2',
            username: 'demo_user',
            email: 'demo@romai.ro',
            name: 'Demo User',
            role: 'user',
            permissions: ['romanian_analysis', 'consciousness_queries', 'cultural_analysis'],
            lastLogin: new Date().toISOString(),
            preferences: {
                language: 'ro-RO',
                theme: 'light',
                notifications: false
            }
        },
        '3': {
            id: '3',
            username: 'test_user',
            email: 'test@romai.ro',
            name: 'Test User',
            role: 'user',
            permissions: ['romanian_analysis', 'consciousness_queries', 'cultural_analysis'],
            lastLogin: new Date().toISOString(),
            preferences: {
                language: 'ro-RO',
                theme: 'auto',
                notifications: true
            }
        }
    };

    return profiles[userId] || null;
}

export async function GET(request: NextRequest) {
    try {
        // Extract token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Authorization header required'
                },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const tokenValidation = validateToken(token);

        if (!tokenValidation.valid || !tokenValidation.userId) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                },
                { status: 401 }
            );
        }

        // Get user profile
        const profile = getUserProfile(tokenValidation.userId);
        if (!profile) {
            return NextResponse.json(
                {
                    error: 'Not Found',
                    message: 'User profile not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json(profile);

    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'Failed to fetch user profile'
            },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        // Extract token from Authorization header
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Authorization header required'
                },
                { status: 401 }
            );
        }

        const token = authHeader.replace('Bearer ', '');
        const tokenValidation = validateToken(token);

        if (!tokenValidation.valid || !tokenValidation.userId) {
            return NextResponse.json(
                {
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                },
                { status: 401 }
            );
        }

        const body = await request.json();

        // In a real application, you would update the user profile in the database
        // For now, just return a success response
        return NextResponse.json({
            success: true,
            message: 'Profile updated successfully',
            updated_fields: Object.keys(body)
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: 'Failed to update user profile'
            },
            { status: 500 }
        );
    }
}
