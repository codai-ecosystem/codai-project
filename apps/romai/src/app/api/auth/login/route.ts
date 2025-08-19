import { NextRequest, NextResponse } from 'next/server';

/**
 * Frontend Authentication API
 * Handles user authentication for the RomAI frontend application
 */

interface LoginRequest {
    email?: string;
    username?: string;
    password: string;
    permissions?: string[];
}

interface AuthResponse {
    success: boolean;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        role: string;
        username?: string;
    };
    permissions?: string[];
    message?: string;
}

// Simulated user database for demo purposes
const DEMO_USERS = [
    {
        id: '1',
        email: 'admin@romai.ro',
        username: 'admin',
        password: 'admin123', // In production, this would be hashed
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: '2',
        email: 'demo@romai.ro',
        username: 'demo_user',
        password: 'demo123',
        name: 'Demo User',
        role: 'user'
    },
    {
        id: '3',
        email: 'test@romai.ro',
        username: 'test_user',
        password: 'test_password',
        name: 'Test User',
        role: 'user'
    }
];

// Simple token generation (in production, use proper JWT)
function generateToken(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `romai_${userId}_${timestamp}_${random}`;
}

// Validate credentials
function authenticateUser(emailOrUsername: string, password: string, permissions?: string[]): AuthResponse {
    const user = DEMO_USERS.find(u =>
        (u.email === emailOrUsername || u.username === emailOrUsername) && u.password === password
    );

    if (!user) {
        return {
            success: false,
            message: 'Invalid credentials'
        };
    }

    const token = generateToken(user.id);
    const userPermissions = permissions || ["romanian_analysis", "consciousness_queries", "cultural_analysis"];

    return {
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            username: user.username
        },
        permissions: userPermissions,
        message: 'Login successful'
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: LoginRequest = await request.json();

        // Get credential (email or username)
        const credential = body.email || body.username;

        // Validate input
        if (!credential || !body.password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email/username and password are required'
                },
                { status: 400 }
            );
        }

        // Authenticate user
        const authResult = authenticateUser(credential, body.password, body.permissions);

        if (!authResult.success) {
            return NextResponse.json(authResult, { status: 401 });
        }

        // Set authentication cookie
        const response = NextResponse.json(authResult);
        response.cookies.set('romai_auth_token', authResult.token || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Authentication service error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        service: 'RomAI Authentication',
        version: '1.0.0',
        methods: ['POST'],
        description: 'Frontend authentication endpoint for RomAI platform',
        demo_users: [
            { email: 'admin@romai.ro', password: 'admin123', role: 'admin' },
            { email: 'demo@romai.ro', password: 'demo123', role: 'user' },
            { email: 'test@romai.ro', password: 'test123', role: 'user' }
        ]
    });
}
