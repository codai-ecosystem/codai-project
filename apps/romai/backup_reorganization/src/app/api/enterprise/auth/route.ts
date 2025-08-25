import { NextRequest, NextResponse } from 'next/server';

/**
 * Enterprise Authentication API
 * Authentication and authorization endpoints for enterprise operations
 */

interface LoginRequest {
    email: string;
    password: string;
    mfaToken?: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    role?: string;
}

interface AuthResponse {
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        permissions: string[];
    };
    expiresIn?: number;
    message?: string;
}

interface SessionRequest {
    token: string;
}

interface SessionResponse {
    valid: boolean;
    user?: {
        id: string;
        email: string;
        role: string;
        permissions: string[];
    };
    expiresAt?: string;
    message?: string;
}

// Simulated user database
const USERS_DB = new Map([
    ['admin@romai.ro', {
        id: '1',
        email: 'admin@romai.ro',
        password: 'hashed_admin_password_here', // In real app, this would be bcrypt hashed
        firstName: 'Admin',
        lastName: 'RomAI',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'admin'],
        company: 'RomAI Enterprise',
        createdAt: new Date('2025-01-01'),
        lastLogin: new Date()
    }],
    ['demo@romai.ro', {
        id: '2',
        email: 'demo@romai.ro',
        password: 'hashed_demo_password_here',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        permissions: ['read', 'write'],
        company: 'RomAI Demo',
        createdAt: new Date('2025-01-15'),
        lastLogin: new Date()
    }]
]);

// Simulated active sessions
const ACTIVE_SESSIONS = new Map<string, {
    userId: string;
    email: string;
    role: string;
    permissions: string[];
    expiresAt: Date;
    createdAt: Date;
}>();

function generateToken(): string {
    // In a real application, use proper JWT generation
    return `romai_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function generateRefreshToken(): string {
    return `romai_refresh_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function validatePassword(provided: string, stored: string): boolean {
    // In a real application, use proper bcrypt comparison
    // For demo purposes, we'll use simple comparison with known test passwords
    const testPasswords = {
        'hashed_admin_password_here': 'admin123',
        'hashed_demo_password_here': 'demo123'
    };

    return testPasswords[stored as keyof typeof testPasswords] === provided;
}

async function loginUser(email: string, password: string): Promise<AuthResponse> {
    const user = USERS_DB.get(email);

    if (!user) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    if (!validatePassword(password, user.password)) {
        return {
            success: false,
            message: 'Invalid email or password'
        };
    }

    // Generate tokens
    const token = generateToken();
    const refreshToken = generateRefreshToken();
    const expiresIn = 3600; // 1 hour
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Store session
    ACTIVE_SESSIONS.set(token, {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        expiresAt,
        createdAt: new Date()
    });

    // Update last login
    user.lastLogin = new Date();

    return {
        success: true,
        token,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            permissions: user.permissions
        },
        expiresIn,
        message: 'Login successful'
    };
}

async function registerUser(userData: RegisterRequest): Promise<AuthResponse> {
    // Check if user already exists
    if (USERS_DB.has(userData.email)) {
        return {
            success: false,
            message: 'User already exists'
        };
    }

    // Create new user
    const newUser = {
        id: (USERS_DB.size + 1).toString(),
        email: userData.email,
        password: `hashed_${userData.password}_here`, // In real app, hash the password
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'user',
        permissions: userData.role === 'admin' ? ['read', 'write', 'delete', 'admin'] : ['read', 'write'],
        company: userData.company || '',
        createdAt: new Date(),
        lastLogin: new Date()
    };

    USERS_DB.set(userData.email, newUser);

    // Auto-login after registration
    const token = generateToken();
    const refreshToken = generateRefreshToken();
    const expiresIn = 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    ACTIVE_SESSIONS.set(token, {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        permissions: newUser.permissions,
        expiresAt,
        createdAt: new Date()
    });

    return {
        success: true,
        token,
        refreshToken,
        user: {
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            permissions: newUser.permissions
        },
        expiresIn,
        message: 'Registration successful'
    };
}

function validateSession(token: string): SessionResponse {
    const session = ACTIVE_SESSIONS.get(token);

    if (!session) {
        return {
            valid: false,
            message: 'Invalid or expired session'
        };
    }

    if (new Date() > session.expiresAt) {
        ACTIVE_SESSIONS.delete(token);
        return {
            valid: false,
            message: 'Session expired'
        };
    }

    return {
        valid: true,
        user: {
            id: session.userId,
            email: session.email,
            role: session.role,
            permissions: session.permissions
        },
        expiresAt: session.expiresAt.toISOString(),
        message: 'Session valid'
    };
}

function logoutUser(token: string): boolean {
    return ACTIVE_SESSIONS.delete(token);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'login':
                const loginRequest = data as LoginRequest;
                if (!loginRequest.email || !loginRequest.password) {
                    return NextResponse.json(
                        { error: 'Email and password are required' },
                        { status: 400 }
                    );
                }
                const loginResult = await loginUser(loginRequest.email, loginRequest.password);
                return NextResponse.json(loginResult, {
                    status: loginResult.success ? 200 : 401
                });

            case 'register':
                const registerRequest = data as RegisterRequest;
                if (!registerRequest.email || !registerRequest.password || !registerRequest.firstName || !registerRequest.lastName) {
                    return NextResponse.json(
                        { error: 'Email, password, firstName, and lastName are required' },
                        { status: 400 }
                    );
                }
                const registerResult = await registerUser(registerRequest);
                return NextResponse.json(registerResult, {
                    status: registerResult.success ? 201 : 400
                });

            case 'validate_session':
                const sessionRequest = data as SessionRequest;
                if (!sessionRequest.token) {
                    return NextResponse.json(
                        { error: 'Token is required' },
                        { status: 400 }
                    );
                }
                const sessionResult = validateSession(sessionRequest.token);
                return NextResponse.json(sessionResult, {
                    status: sessionResult.valid ? 200 : 401
                });

            case 'logout':
                const logoutRequest = data as SessionRequest;
                if (!logoutRequest.token) {
                    return NextResponse.json(
                        { error: 'Token is required' },
                        { status: 400 }
                    );
                }
                const logoutSuccess = logoutUser(logoutRequest.token);
                return NextResponse.json({
                    success: logoutSuccess,
                    message: logoutSuccess ? 'Logout successful' : 'Invalid token'
                });

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Supported actions: login, register, validate_session, logout' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Authentication error:', error);
        return NextResponse.json(
            { error: 'Authentication service error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'stats') {
            return NextResponse.json({
                totalUsers: USERS_DB.size,
                activeSessions: ACTIVE_SESSIONS.size,
                registeredUsers: Array.from(USERS_DB.values()).map(user => ({
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    company: user.company,
                    lastLogin: user.lastLogin
                }))
            });
        }

        return NextResponse.json({
            status: 'healthy',
            service: 'RomAI Enterprise Authentication API',
            version: '1.0.0',
            capabilities: {
                userLogin: true,
                userRegistration: true,
                sessionValidation: true,
                sessionManagement: true,
                roleBasedAccess: true,
                permissionSystem: true
            },
            supportedActions: [
                'login',
                'register',
                'validate_session',
                'logout'
            ],
            endpoints: {
                'POST /api/enterprise/auth': 'Authentication operations',
                'GET /api/enterprise/auth': 'Health check and stats',
                'GET /api/enterprise/auth?action=stats': 'User and session statistics'
            },
            security: {
                tokenExpiry: '1 hour',
                sessionManagement: 'active',
                passwordHashing: 'bcrypt (simulated)',
                mfaSupport: 'planned'
            }
        });

    } catch (error) {
        console.error('Authentication API health check error:', error);
        return NextResponse.json(
            { error: 'Health check failed' },
            { status: 500 }
        );
    }
}
