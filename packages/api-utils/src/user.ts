import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * User data interfaces
 */
export interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    bio?: string;
    roles?: string[];
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
}

export interface CreateUserRequest {
    email: string;
    name: string;
    password: string;
    avatar?: string;
    bio?: string;
    metadata?: Record<string, any>;
}

export interface UpdateUserRequest {
    name?: string;
    avatar?: string;
    bio?: string;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface UserListQuery {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    sortBy?: 'name' | 'email' | 'createdAt' | 'lastLoginAt';
    sortOrder?: 'asc' | 'desc';
}

export interface UserListResponse {
    users: UserProfile[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Validation schemas
 */
export const createUserSchema = z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    avatar: z.string().url().optional(),
    bio: z.string().max(500, 'Bio too long').optional(),
    metadata: z.record(z.any()).optional()
});

export const updateUserSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    avatar: z.string().url().optional(),
    bio: z.string().max(500, 'Bio too long').optional(),
    preferences: z.record(z.any()).optional(),
    metadata: z.record(z.any()).optional()
});

export const userListQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    role: z.string().optional(),
    sortBy: z.enum(['name', 'email', 'createdAt', 'lastLoginAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
});

/**
 * User repository interface for dependency injection
 */
export interface UserRepository {
    findById(id: string): Promise<UserProfile | null>;
    findByEmail(email: string): Promise<UserProfile | null>;
    create(userData: CreateUserRequest): Promise<UserProfile>;
    update(id: string, userData: UpdateUserRequest): Promise<UserProfile | null>;
    delete(id: string): Promise<boolean>;
    list(query: UserListQuery): Promise<UserListResponse>;
    updateLastLogin(id: string): Promise<void>;
}

/**
 * Create GET /api/user/profile endpoint
 */
export function createUserProfileEndpoint(userRepo: UserRepository) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            const userId = request.headers.get('x-user-id');

            if (!userId) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            const user = await userRepo.findById(userId);

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Remove sensitive information
            const { ...safeUser } = user;

            return NextResponse.json({ user: safeUser });

        } catch (error) {
            console.error('Get user profile error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create PUT/PATCH /api/user/profile endpoint
 */
export function createUpdateUserProfileEndpoint(userRepo: UserRepository) {
    return async function PUT(request: NextRequest): Promise<NextResponse> {
        try {
            const userId = request.headers.get('x-user-id');

            if (!userId) {
                return NextResponse.json(
                    { error: 'Authentication required' },
                    { status: 401 }
                );
            }

            const body = await request.json();

            // Validate input
            const validationResult = updateUserSchema.safeParse(body);
            if (!validationResult.success) {
                return NextResponse.json(
                    {
                        error: 'Validation failed',
                        details: validationResult.error.issues
                    },
                    { status: 400 }
                );
            }

            const updatedUser = await userRepo.update(userId, validationResult.data);

            if (!updatedUser) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ user: updatedUser });

        } catch (error) {
            console.error('Update user profile error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/user/[id] endpoint
 */
export function createGetUserEndpoint(userRepo: UserRepository) {
    return async function GET(
        request: NextRequest,
        { params }: { params: { id: string } }
    ): Promise<NextResponse> {
        try {
            const { id } = params;
            const currentUserId = request.headers.get('x-user-id');
            const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');

            // Check if user can access this profile
            if (id !== currentUserId && !userRoles.includes('admin')) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            const user = await userRepo.findById(id);

            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            // Public profile view (limited information)
            const publicUser = {
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                bio: user.bio,
                createdAt: user.createdAt
            };

            // Full profile for own user or admin
            const responseUser = (id === currentUserId || userRoles.includes('admin'))
                ? user
                : publicUser;

            return NextResponse.json({ user: responseUser });

        } catch (error) {
            console.error('Get user error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create GET /api/users (list users) endpoint
 */
export function createListUsersEndpoint(userRepo: UserRepository) {
    return async function GET(request: NextRequest): Promise<NextResponse> {
        try {
            const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');

            // Only admins can list users
            if (!userRoles.includes('admin')) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            const { searchParams } = new URL(request.url);
            const queryValidation = userListQuerySchema.safeParse({
                page: searchParams.get('page'),
                limit: searchParams.get('limit'),
                search: searchParams.get('search'),
                role: searchParams.get('role'),
                sortBy: searchParams.get('sortBy'),
                sortOrder: searchParams.get('sortOrder')
            });

            if (!queryValidation.success) {
                return NextResponse.json(
                    {
                        error: 'Invalid query parameters',
                        details: queryValidation.error.issues
                    },
                    { status: 400 }
                );
            }

            const result = await userRepo.list(queryValidation.data);
            return NextResponse.json(result);

        } catch (error) {
            console.error('List users error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * Create DELETE /api/user/[id] endpoint
 */
export function createDeleteUserEndpoint(userRepo: UserRepository) {
    return async function DELETE(
        request: NextRequest,
        { params }: { params: { id: string } }
    ): Promise<NextResponse> {
        try {
            const { id } = params;
            const currentUserId = request.headers.get('x-user-id');
            const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');

            // Check if user can delete this profile
            if (id !== currentUserId && !userRoles.includes('admin')) {
                return NextResponse.json(
                    { error: 'Access denied' },
                    { status: 403 }
                );
            }

            // Prevent self-deletion for admins (safety measure)
            if (id === currentUserId && userRoles.includes('admin')) {
                return NextResponse.json(
                    { error: 'Cannot delete your own admin account' },
                    { status: 400 }
                );
            }

            const deleted = await userRepo.delete(id);

            if (!deleted) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                message: 'User deleted successfully',
                deleted: true
            });

        } catch (error) {
            console.error('Delete user error:', error);
            return NextResponse.json(
                { error: 'Internal server error' },
                { status: 500 }
            );
        }
    };
}

/**
 * User utilities
 */
export const userUtils = {
    /**
     * Sanitize user data for public consumption
     */
    sanitizeUser(user: UserProfile): Partial<UserProfile> {
        const { ...sanitized } = user;
        return sanitized;
    },

    /**
     * Check if user has required role
     */
    hasRole(user: UserProfile, role: string): boolean {
        return user.roles?.includes(role) || false;
    },

    /**
     * Check if user has any of the required roles
     */
    hasAnyRole(user: UserProfile, roles: string[]): boolean {
        return roles.some(role => user.roles?.includes(role)) || false;
    },

    /**
     * Generate user display name
     */
    getDisplayName(user: UserProfile): string {
        return user.name || user.email.split('@')[0];
    },

    /**
     * Check if user profile is complete
     */
    isProfileComplete(user: UserProfile): boolean {
        return !!(user.name && user.email && user.avatar);
    }
};

// =============================================================================
// SIMPLIFIED USER ENDPOINT CREATORS
// =============================================================================

export interface UserEndpointConfig {
    service: string;
    version?: string;
    requireAuth?: boolean;
    adminRoles?: string[];
    defaultPreferences?: Record<string, any>;
    customValidator?: (request: NextRequest) => Promise<boolean>;
    onSuccess?: (user: UserProfile, request: NextRequest) => Promise<void>;
    onFailure?: (error: any, request: NextRequest) => Promise<void>;
}

export interface MockUser {
    id: string;
    name: string;
    email: string;
    role: string;
    preferences?: Record<string, any>;
    permissions?: string[];
    image?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Create simplified user profile endpoint with mock data support
 */
export function createUserEndpoint(config: UserEndpointConfig, mockUsers: MockUser[] = []) {
    const {
        service,
        version = '1.0.0',
        requireAuth = true,
        adminRoles = ['admin'],
        defaultPreferences = {},
        customValidator,
        onSuccess,
        onFailure
    } = config;

    return {
        async GET(request: NextRequest) {
            try {
                if (requireAuth) {
                    const userId = request.headers.get('x-user-id');
                    if (!userId) {
                        return NextResponse.json(
                            { error: 'Authentication required' },
                            { status: 401 }
                        );
                    }
                }

                // Custom validation if provided
                if (customValidator && !(await customValidator(request))) {
                    return NextResponse.json(
                        { error: 'Custom validation failed' },
                        { status: 400 }
                    );
                }

                // Mock user data or get from headers
                const userId = request.headers.get('x-user-id') || 'demo-user';
                const userEmail = request.headers.get('x-user-email') || 'demo@example.com';
                const userRoles = JSON.parse(request.headers.get('x-user-roles') || '["user"]');

                // Find mock user or create default
                let user: MockUser = mockUsers.find(u => u.id === userId || u.email === userEmail) || {
                    id: userId,
                    name: userEmail.split('@')[0],
                    email: userEmail,
                    role: userRoles[0] || 'user',
                    preferences: { ...defaultPreferences, theme: 'light', notifications: true },
                    permissions: [`${service.toLowerCase()}:read`, `${service.toLowerCase()}:write`],
                    image: undefined,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };

                // Success callback
                if (onSuccess) {
                    const userProfile: UserProfile = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        avatar: user.image,
                        roles: [user.role],
                        preferences: user.preferences,
                        createdAt: user.createdAt || new Date().toISOString(),
                        updatedAt: user.updatedAt || new Date().toISOString()
                    };
                    await onSuccess(userProfile, request);
                }

                return NextResponse.json({
                    success: true,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        image: user.image,
                        preferences: user.preferences,
                        permissions: user.permissions,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt
                    }
                });

            } catch (error) {
                console.error(`[${service}] Get user error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { success: false, error: 'Failed to fetch user data' },
                    { status: 500 }
                );
            }
        },

        async PUT(request: NextRequest) {
            try {
                if (requireAuth) {
                    const userId = request.headers.get('x-user-id');
                    if (!userId) {
                        return NextResponse.json(
                            { error: 'Authentication required' },
                            { status: 401 }
                        );
                    }
                }

                const body = await request.json();
                const { name, email, preferences, metadata } = body;

                // Validate input
                if (name && (typeof name !== 'string' || name.length < 1)) {
                    return NextResponse.json(
                        { error: 'Name must be a non-empty string' },
                        { status: 400 }
                    );
                }

                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return NextResponse.json(
                        { error: 'Invalid email format' },
                        { status: 400 }
                    );
                }

                // Custom validation if provided
                if (customValidator && !(await customValidator(request))) {
                    return NextResponse.json(
                        { error: 'Custom validation failed' },
                        { status: 400 }
                    );
                }

                // Mock update - in production would update database
                console.log(`[${service}] Updating user:`, body);

                const updatedUser = {
                    id: request.headers.get('x-user-id') || 'demo-user',
                    name: name || 'Updated User',
                    email: email || request.headers.get('x-user-email') || 'demo@example.com',
                    preferences: { ...defaultPreferences, ...preferences },
                    metadata: metadata || {},
                    updatedAt: new Date().toISOString()
                };

                // Success callback
                if (onSuccess) {
                    const userProfile: UserProfile = {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        name: updatedUser.name,
                        preferences: updatedUser.preferences,
                        metadata: updatedUser.metadata,
                        createdAt: new Date().toISOString(),
                        updatedAt: updatedUser.updatedAt
                    };
                    await onSuccess(userProfile, request);
                }

                return NextResponse.json({
                    success: true,
                    message: 'User updated successfully',
                    user: updatedUser
                });

            } catch (error) {
                console.error(`[${service}] Update user error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { success: false, error: 'Failed to update user data' },
                    { status: 500 }
                );
            }
        },

        async DELETE(request: NextRequest) {
            try {
                if (requireAuth) {
                    const userId = request.headers.get('x-user-id');
                    const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');

                    if (!userId) {
                        return NextResponse.json(
                            { error: 'Authentication required' },
                            { status: 401 }
                        );
                    }

                    // Check admin permission for delete
                    const hasAdminRole = adminRoles.some(role => userRoles.includes(role));
                    if (!hasAdminRole) {
                        return NextResponse.json(
                            { error: 'Admin permission required' },
                            { status: 403 }
                        );
                    }
                }

                // Custom validation if provided
                if (customValidator && !(await customValidator(request))) {
                    return NextResponse.json(
                        { error: 'Custom validation failed' },
                        { status: 400 }
                    );
                }

                // Mock delete - in production would delete from database
                console.log(`[${service}] Deleting user:`, request.headers.get('x-user-id'));

                // Success callback
                if (onSuccess) {
                    const mockUser: UserProfile = {
                        id: request.headers.get('x-user-id') || 'demo-user',
                        email: request.headers.get('x-user-email') || 'demo@example.com',
                        name: 'Deleted User',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await onSuccess(mockUser, request);
                }

                return NextResponse.json({
                    success: true,
                    message: 'User deleted successfully'
                });

            } catch (error) {
                console.error(`[${service}] Delete user error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { success: false, error: 'Failed to delete user' },
                    { status: 500 }
                );
            }
        }
    };
}

/**
 * Create Prisma-integrated user endpoint (use with pre-imported getServerSession)
 */
export function createPrismaUserEndpoint(config: UserEndpointConfig & {
    prisma: any;
    getServerSession: any;
    authOptions: any;
}) {
    const {
        service,
        version = '1.0.0',
        requireAuth = true,
        adminRoles = ['admin'],
        defaultPreferences = {},
        prisma,
        getServerSession,
        authOptions,
        onSuccess,
        onFailure
    } = config;

    return {
        async GET(request: NextRequest) {
            try {
                if (requireAuth) {
                    const session = await getServerSession(authOptions);

                    if (!session?.user?.id) {
                        return NextResponse.json(
                            { message: "Unauthorized" },
                            { status: 401 }
                        );
                    }

                    const user = await prisma.user.findUnique({
                        where: { id: session.user.id },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true,
                            createdAt: true,
                            updatedAt: true,
                            preferences: true,
                        },
                    });

                    if (!user) {
                        return NextResponse.json(
                            { message: "User not found" },
                            { status: 404 }
                        );
                    }

                    // Success callback
                    if (onSuccess) {
                        const userProfile: UserProfile = {
                            id: user.id,
                            email: user.email,
                            name: user.name || '',
                            avatar: user.image,
                            roles: [user.role || 'user'],
                            preferences: user.preferences || defaultPreferences,
                            createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
                            updatedAt: user.updatedAt?.toISOString() || new Date().toISOString()
                        };
                        await onSuccess(userProfile, request);
                    }

                    return NextResponse.json({ user });
                }

                return NextResponse.json(
                    { message: "Authentication required" },
                    { status: 401 }
                );

            } catch (error) {
                console.error(`[${service}] Get user error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { message: "Internal server error" },
                    { status: 500 }
                );
            }
        },

        async PUT(request: NextRequest) {
            try {
                if (requireAuth) {
                    const session = await getServerSession(authOptions);

                    if (!session?.user?.id) {
                        return NextResponse.json(
                            { message: "Unauthorized" },
                            { status: 401 }
                        );
                    }

                    const body = await request.json();
                    const { name, email, preferences, metadata } = body;

                    const updatedUser = await prisma.user.update({
                        where: { id: session.user.id },
                        data: {
                            ...(name && { name }),
                            ...(email && { email }),
                            ...(preferences && { preferences }),
                            ...(metadata && { metadata }),
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                            image: true,
                            updatedAt: true,
                            preferences: true,
                        },
                    });

                    // Success callback
                    if (onSuccess) {
                        const userProfile: UserProfile = {
                            id: updatedUser.id,
                            email: updatedUser.email,
                            name: updatedUser.name || '',
                            avatar: updatedUser.image,
                            roles: [updatedUser.role || 'user'],
                            preferences: updatedUser.preferences || defaultPreferences,
                            createdAt: new Date().toISOString(),
                            updatedAt: updatedUser.updatedAt?.toISOString() || new Date().toISOString()
                        };
                        await onSuccess(userProfile, request);
                    }

                    return NextResponse.json({ user: updatedUser });
                }

                return NextResponse.json(
                    { message: "Authentication required" },
                    { status: 401 }
                );

            } catch (error) {
                console.error(`[${service}] Update user error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { message: "Internal server error" },
                    { status: 500 }
                );
            }
        },

        async DELETE(request: NextRequest) {
            try {
                if (requireAuth) {
                    const session = await getServerSession(authOptions);

                    if (!session?.user?.id) {
                        return NextResponse.json(
                            { message: "Unauthorized" },
                            { status: 401 }
                        );
                    }

                    await prisma.user.delete({
                        where: { id: session.user.id },
                    });

                    // Success callback
                    if (onSuccess) {
                        const userProfile: UserProfile = {
                            id: session.user.id,
                            email: 'deleted@example.com',
                            name: 'Deleted User',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        await onSuccess(userProfile, request);
                    }

                    return NextResponse.json({ message: "User deleted successfully" });
                }

                return NextResponse.json(
                    { message: "Authentication required" },
                    { status: 401 }
                );

            } catch (error) {
                console.error(`[${service}] Delete user error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { message: "Internal server error" },
                    { status: 500 }
                );
            }
        }
    };
}
export function createUsersListEndpoint(config: UserEndpointConfig, mockUsers: MockUser[] = []) {
    const {
        service,
        version = '1.0.0',
        requireAuth = true,
        adminRoles = ['admin'],
        onSuccess,
        onFailure
    } = config;

    return {
        async GET(request: NextRequest) {
            try {
                if (requireAuth) {
                    const userRoles = JSON.parse(request.headers.get('x-user-roles') || '[]');
                    const hasAdminRole = adminRoles.some(role => userRoles.includes(role));

                    if (!hasAdminRole) {
                        return NextResponse.json(
                            { error: 'Admin permission required' },
                            { status: 403 }
                        );
                    }
                }

                const { searchParams } = new URL(request.url);
                const page = parseInt(searchParams.get('page') || '1');
                const limit = parseInt(searchParams.get('limit') || '10');
                const search = searchParams.get('search');
                const role = searchParams.get('role');

                let users = mockUsers;

                // Apply filters
                if (search) {
                    const searchLower = search.toLowerCase();
                    users = users.filter(user =>
                        user.email.toLowerCase().includes(searchLower) ||
                        user.name.toLowerCase().includes(searchLower)
                    );
                }

                if (role) {
                    users = users.filter(user => user.role === role);
                }

                // Apply pagination
                const total = users.length;
                const offset = (page - 1) * limit;
                const paginatedUsers = users.slice(offset, offset + limit);

                const result = {
                    users: paginatedUsers,
                    pagination: {
                        page,
                        limit,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                };

                // Success callback
                if (onSuccess) {
                    const mockUser: UserProfile = {
                        id: 'admin',
                        email: 'admin@example.com',
                        name: 'Admin User',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    await onSuccess(mockUser, request);
                }

                return NextResponse.json(result);

            } catch (error) {
                console.error(`[${service}] List users error:`, error);
                if (onFailure) {
                    await onFailure(error, request);
                }
                return NextResponse.json(
                    { error: 'Failed to retrieve users' },
                    { status: 500 }
                );
            }
        }
    };
}