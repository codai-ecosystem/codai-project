import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, jwtVerify } from 'jose';

/**
 * User authentication interfaces
 */
export interface User {
    id: string;
    email: string;
    name: string;
    roles?: string[];
    metadata?: Record<string, any>;
}

export interface AuthToken {
    user: User;
    iat: number;
    exp: number;
    scope?: string[];
}

export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface LoginResponse {
    success: boolean;
    user?: User;
    token?: string;
    refreshToken?: string;
    expiresIn?: number;
    message?: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    confirmPassword?: string;
    metadata?: Record<string, any>;
}

export interface RegisterResponse {
    success: boolean;
    user?: User;
    token?: string;
    message?: string;
}

export interface AuthConfig {
    jwtSecret: string;
    tokenExpiration?: string; // default: '1h'
    refreshTokenExpiration?: string; // default: '7d'
    passwordMinLength?: number; // default: 8
    requireEmailVerification?: boolean; // default: false
}

/**
 * JWT Token utilities
 */
export class TokenManager {
    private secret: Uint8Array;
    private config: Required<AuthConfig>;

    constructor(config: AuthConfig) {
        this.secret = new TextEncoder().encode(config.jwtSecret);
        this.config = {
            ...config,
            tokenExpiration: config.tokenExpiration || '1h',
            refreshTokenExpiration: config.refreshTokenExpiration || '7d',
            passwordMinLength: config.passwordMinLength || 8,
            requireEmailVerification: config.requireEmailVerification || false
        };
    }

    async generateToken(user: User, scope?: string[]): Promise<string> {
        const payload: Omit<AuthToken, 'iat' | 'exp'> = {
            user,
            scope
        };

        return new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(this.config.tokenExpiration)
            .sign(this.secret);
    }

    async verifyToken(token: string): Promise<AuthToken> {
        try {
            const { payload } = await jwtVerify(token, this.secret);

            // Ensure the payload has required AuthToken properties
            if (payload && typeof payload === 'object' && 'user' in payload) {
                return payload as unknown as AuthToken;
            }

            throw new Error('Invalid token payload');
        } catch (error) {
            throw new Error('Token verification failed');
        }
    }

    async generateRefreshToken(userId: string): Promise<string> {
        return new SignJWT({ userId, type: 'refresh' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(this.config.refreshTokenExpiration)
            .sign(this.secret);
    }
}

/**
 * Authentication middleware
 */
export function createAuthMiddleware(tokenManager: TokenManager, options?: {
    requiredScopes?: string[];
    requiredRoles?: string[];
}) {
    return async function middleware(request: NextRequest): Promise<NextResponse | null> {
        try {
            const authHeader = request.headers.get('authorization');
            const token = authHeader?.startsWith('Bearer ')
                ? authHeader.substring(7)
                : request.cookies.get('auth-token')?.value;

            if (!token) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            const authToken = await tokenManager.verifyToken(token);

            // Check required scopes
            if (options?.requiredScopes) {
                const hasScope = options.requiredScopes.some(scope =>
                    authToken.scope?.includes(scope)
                );
                if (!hasScope) {
                    return NextResponse.json(
                        { error: 'Insufficient permissions' },
                        { status: 403 }
                    );
                }
            }

            // Check required roles
            if (options?.requiredRoles) {
                const hasRole = options.requiredRoles.some(role =>
                    authToken.user.roles?.includes(role)
                );
                if (!hasRole) {
                    return NextResponse.json(
                        { error: 'Insufficient permissions' },
                        { status: 403 }
                    );
                }
            }

            // Add user to request headers for use in the API route
            const requestHeaders = new Headers(request.headers);
            requestHeaders.set('x-user-id', authToken.user.id);
            requestHeaders.set('x-user-email', authToken.user.email);
            requestHeaders.set('x-user-roles', JSON.stringify(authToken.user.roles || []));

            return NextResponse.next({
                request: {
                    headers: requestHeaders
                }
            });

        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }
    };
}

/**
 * Create standardized login endpoint
 */
export function createLoginEndpoint(
    authenticateUser: (email: string, password: string) => Promise<User | null>,
    tokenManager: TokenManager
) {
    return async function POST(request: NextRequest): Promise<NextResponse> {
        try {
            const body: LoginRequest = await request.json();
            const { email, password, rememberMe = false } = body;

            // Validate input
            if (!email || !password) {
                return NextResponse.json(
                    { success: false, message: 'Email and password are required' },
                    { status: 400 }
                );
            }

            // Authenticate user
            const user = await authenticateUser(email.toLowerCase().trim(), password);

            if (!user) {
                return NextResponse.json(
                    { success: false, message: 'Invalid credentials' },
                    { status: 401 }
                );
            }

            // Generate tokens
            const token = await tokenManager.generateToken(user);
            const refreshToken = rememberMe
                ? await tokenManager.generateRefreshToken(user.id)
                : undefined;

            const response: LoginResponse = {
                success: true,
                user,
                token,
                refreshToken,
                expiresIn: 3600 // 1 hour in seconds
            };

            const nextResponse = NextResponse.json(response);

            // Set HTTP-only cookies for enhanced security
            nextResponse.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600 // 1 hour
            });

            if (refreshToken) {
                nextResponse.cookies.set('refresh-token', refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 604800 // 7 days
                });
            }

            return nextResponse;

        } catch (error) {
            console.error('Login error:', error);
            return NextResponse.json(
                { success: false, message: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create standardized register endpoint
 */
export function createRegisterEndpoint(
    createUser: (userData: Omit<RegisterRequest, 'confirmPassword'>) => Promise<User>,
    tokenManager: TokenManager,
    config: AuthConfig
) {
    return async function POST(request: NextRequest): Promise<NextResponse> {
        try {
            const body: RegisterRequest = await request.json();
            const { email, password, name, confirmPassword, metadata } = body;

            // Validate input
            if (!email || !password || !name) {
                return NextResponse.json(
                    { success: false, message: 'Email, password, and name are required' },
                    { status: 400 }
                );
            }

            if (confirmPassword && password !== confirmPassword) {
                return NextResponse.json(
                    { success: false, message: 'Passwords do not match' },
                    { status: 400 }
                );
            }

            if (password.length < (config.passwordMinLength || 8)) {
                return NextResponse.json(
                    { success: false, message: `Password must be at least ${config.passwordMinLength || 8} characters` },
                    { status: 400 }
                );
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { success: false, message: 'Invalid email format' },
                    { status: 400 }
                );
            }

            // Create user
            const user = await createUser({
                email: email.toLowerCase().trim(),
                password,
                name: name.trim(),
                metadata
            });

            // Generate token
            const token = await tokenManager.generateToken(user);

            const response: RegisterResponse = {
                success: true,
                user,
                token
            };

            const nextResponse = NextResponse.json(response, { status: 201 });

            // Set HTTP-only cookie
            nextResponse.cookies.set('auth-token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 3600 // 1 hour
            });

            return nextResponse;

        } catch (error) {
            console.error('Register error:', error);

            // Handle known errors
            if (error instanceof Error) {
                if (error.message.includes('duplicate') || error.message.includes('unique')) {
                    return NextResponse.json(
                        { success: false, message: 'Email already registered' },
                        { status: 409 }
                    );
                }
            }

            return NextResponse.json(
                { success: false, message: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create logout endpoint
 */
export function createLogoutEndpoint() {
    return async function POST(request: NextRequest): Promise<NextResponse> {
        const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

        // Clear auth cookies
        response.cookies.set('auth-token', '', { maxAge: 0 });
        response.cookies.set('refresh-token', '', { maxAge: 0 });

        return response;
    };
}

/**
 * Get user from request headers (set by auth middleware)
 */
export function getUserFromRequest(request: NextRequest): User | null {
    try {
        const userId = request.headers.get('x-user-id');
        const userEmail = request.headers.get('x-user-email');
        const userRoles = request.headers.get('x-user-roles');

        if (!userId || !userEmail) {
            return null;
        }

        return {
            id: userId,
            email: userEmail,
            name: '', // Would need to be set by middleware or fetched separately
            roles: userRoles ? JSON.parse(userRoles) : []
        };
    } catch {
        return null;
    }
}

// =============================================================================
// ENHANCED AUTHENTICATION UTILITIES
// =============================================================================

export interface DemoUser {
    id: string;
    email: string;
    username?: string;
    password: string;
    name: string;
    role: string;
    permissions?: string[];
}

export interface AuthEndpointConfig {
    service: string;
    version?: string;
    demoUsers?: DemoUser[];
    cookieName?: string;
    cookieDomain?: string;
    tokenExpiry?: number; // seconds
    requireMFA?: boolean;
    enableOAuth2?: boolean;
    oauth2Providers?: string[];
    customValidator?: (request: NextRequest) => Promise<boolean>;
    onSuccess?: (user: User, request: NextRequest) => Promise<void>;
    onFailure?: (error: any, request: NextRequest) => Promise<void>;
}

export interface EnhancedLoginRequest extends LoginRequest {
    username?: string;
    permissions?: string[];
}

export interface EnhancedLoginResponse extends LoginResponse {
    permissions?: string[];
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const authUtils = {
    validateEmail: (email: string): boolean => {
        return EMAIL_REGEX.test(email.trim().toLowerCase());
    },

    validatePassword: (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return { isValid: errors.length === 0, errors };
    },

    sanitizeInput: (input: string): string => {
        return input.replace(/[<>&"'/\\]/g, '');
    },

    detectMaliciousPatterns: (input: string): boolean => {
        const maliciousPatterns = [
            /['";]/,  // SQL injection attempts
            /<script/i,  // XSS attempts
            /drop\s+table/i,  // SQL injection
            /union\s+select/i,  // SQL injection
            /or\s+1\s*=\s*1/i  // SQL injection
        ];

        return maliciousPatterns.some(pattern => pattern.test(input));
    },

    generateToken: (userId: string, service: string = 'codai'): string => {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `${service}_${userId}_${timestamp}_${random}`;
    }
};

/**
 * Enhanced authentication function for demo users
 */
function authenticateUser(
    credential: string,
    password: string,
    demoUsers: DemoUser[] = [],
    permissions?: string[]
): EnhancedLoginResponse {
    const user = demoUsers.find(u =>
        (u.email === credential || u.username === credential) && u.password === password
    );

    if (!user) {
        return {
            success: false,
            message: 'Invalid credentials'
        };
    }

    const token = authUtils.generateToken(user.id);
    const userPermissions = permissions || user.permissions || [];

    return {
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: [user.role],
            metadata: { permissions: userPermissions }
        },
        permissions: userPermissions,
        message: 'Login successful'
    };
}

/**
 * Create enhanced login endpoint with demo user support
 */
export function createEnhancedLoginEndpoint(config: AuthEndpointConfig) {
    const {
        service,
        version = '1.0.0',
        demoUsers = [],
        cookieName = 'auth_token',
        cookieDomain,
        tokenExpiry = 24 * 60 * 60, // 24 hours
        customValidator,
        onSuccess,
        onFailure
    } = config;

    return {
        async POST(request: NextRequest) {
            try {
                const body: EnhancedLoginRequest = await request.json();

                // Custom validation if provided
                if (customValidator && !(await customValidator(request))) {
                    return NextResponse.json(
                        { success: false, message: 'Custom validation failed' },
                        { status: 400 }
                    );
                }

                // Get credential (email or username)
                const credential = body.email || body.username;

                // Validate input
                if (!credential || !body.password) {
                    return NextResponse.json(
                        { success: false, message: 'Email/username and password are required' },
                        { status: 400 }
                    );
                }

                // Authenticate user with demo users
                const authResult = authenticateUser(credential, body.password, demoUsers, body.permissions);

                if (!authResult.success) {
                    if (onFailure) {
                        await onFailure(new Error(authResult.message || 'Authentication failed'), request);
                    }
                    return NextResponse.json(authResult, { status: 401 });
                }

                // Success callback
                if (onSuccess && authResult.user) {
                    await onSuccess(authResult.user, request);
                }

                // Set authentication cookie
                const response = NextResponse.json(authResult);
                const cookieOptions: any = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: body.rememberMe ? tokenExpiry * 30 : tokenExpiry,
                    path: '/'
                };

                if (cookieDomain) {
                    cookieOptions.domain = cookieDomain;
                }

                response.cookies.set(cookieName, authResult.token || '', cookieOptions);

                return response;

            } catch (error) {
                console.error(`[${service}] Login error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { success: false, message: 'Authentication service error' },
                    { status: 500 }
                );
            }
        },

        async GET() {
            return NextResponse.json({
                service: `${service} Authentication`,
                version,
                methods: ['POST'],
                description: `Enhanced authentication endpoint for ${service}`,
                ...(demoUsers.length > 0 && {
                    demo_users: demoUsers.map(({ password, ...user }) => ({
                        ...user,
                        password: '***'
                    }))
                })
            });
        }
    };
}

/**
 * Create enhanced register endpoint with security validation
 */
export function createEnhancedRegisterEndpoint(config: AuthEndpointConfig) {
    const {
        service,
        version = '1.0.0',
        cookieName = 'auth_token',
        customValidator,
        onSuccess,
        onFailure
    } = config;

    return {
        async POST(request: NextRequest) {
            try {
                const body = await request.json();
                const { email, password, name, username, metadata } = body;

                // Custom validation if provided
                if (customValidator && !(await customValidator(request))) {
                    return NextResponse.json(
                        { error: 'Custom validation failed' },
                        { status: 400 }
                    );
                }

                // Validate input presence
                if (!email || !password || !name) {
                    return NextResponse.json(
                        { error: 'Missing required fields: email, password, and name are required' },
                        { status: 400 }
                    );
                }

                // Sanitize inputs
                const sanitizedEmail = authUtils.sanitizeInput(email.toLowerCase().trim());
                const sanitizedName = authUtils.sanitizeInput(name.trim());
                const sanitizedPassword = authUtils.sanitizeInput(password);
                const sanitizedUsername = username ? authUtils.sanitizeInput(username.trim()) : undefined;

                // Validate email format
                if (!authUtils.validateEmail(sanitizedEmail)) {
                    return NextResponse.json(
                        { error: 'Invalid email format' },
                        { status: 400 }
                    );
                }

                // Validate password strength
                const passwordValidation = authUtils.validatePassword(sanitizedPassword);
                if (!passwordValidation.isValid) {
                    return NextResponse.json(
                        {
                            error: 'Password does not meet security requirements',
                            details: passwordValidation.errors
                        },
                        { status: 400 }
                    );
                }

                // Validate name
                if (sanitizedName.length < 2 || sanitizedName.length > 50) {
                    return NextResponse.json(
                        { error: 'Name must be between 2 and 50 characters' },
                        { status: 400 }
                    );
                }

                // Check for malicious patterns
                const inputs = [sanitizedEmail, sanitizedName, sanitizedPassword];
                if (sanitizedUsername) inputs.push(sanitizedUsername);

                if (inputs.some(input => authUtils.detectMaliciousPatterns(input))) {
                    return NextResponse.json(
                        { error: 'Invalid input detected' },
                        { status: 400 }
                    );
                }

                // TODO: Check if user already exists (integrate with CBD)
                // TODO: Hash password with bcrypt
                // TODO: Create user in database

                // Create user object (simulated for now)
                const user: User = {
                    id: Math.random().toString(36).substring(2, 15),
                    email: sanitizedEmail,
                    name: sanitizedName,
                    roles: ['user'], // Default role
                    metadata: {
                        ...metadata,
                        username: sanitizedUsername,
                        createdAt: new Date().toISOString()
                    }
                };

                // Success callback
                if (onSuccess) {
                    await onSuccess(user, request);
                }

                // Return success without password
                return NextResponse.json({
                    success: true,
                    message: 'User created successfully',
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        roles: user.roles
                    }
                }, { status: 201 });

            } catch (error) {
                console.error(`[${service}] Registration error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { error: 'Registration service error' },
                    { status: 500 }
                );
            }
        }
    };
}

/**
 * Create enhanced logout endpoint with multiple cookie clearing
 */
export function createEnhancedLogoutEndpoint(config: AuthEndpointConfig) {
    const {
        service,
        cookieName = 'auth_token',
        cookieDomain,
        onSuccess
    } = config;

    return {
        async POST(request: NextRequest) {
            try {
                // Create response
                const response = NextResponse.json({
                    success: true,
                    message: 'Logged out successfully'
                });

                // Clear authentication cookies
                const cookieOptions: any = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 0, // Expire immediately
                    path: '/'
                };

                if (cookieDomain) {
                    cookieOptions.domain = cookieDomain;
                }

                // Clear multiple cookie variations
                response.cookies.set(cookieName, '', cookieOptions);
                response.cookies.set(`${cookieName}_refresh`, '', cookieOptions);
                response.cookies.set('auth-token', '', cookieOptions);
                response.cookies.set('refresh-token', '', cookieOptions);

                // Success callback
                if (onSuccess) {
                    const mockUser: User = {
                        id: 'logged_out_user',
                        email: 'unknown@example.com',
                        name: 'Logged Out User',
                        roles: []
                    };
                    await onSuccess(mockUser, request);
                }

                return response;

            } catch (error) {
                console.error(`[${service}] Logout error:`, error);
                return NextResponse.json(
                    { error: 'Logout service error' },
                    { status: 500 }
                );
            }
        }
    };
}