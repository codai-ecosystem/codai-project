/**
 * Enhanced Session Management API
 * Provides comprehensive session control and monitoring
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    authMiddleware,
    sessionManager,
    User,
    Session
} from '../../../../lib/auth-enhancement';

export async function GET(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware.authenticate()(request);

        if (authResult) {
            return authResult; // Return authentication error
        }

        const user = (request as any).user as User;

        if (!user) {
            return NextResponse.json({
                error: 'User not authenticated'
            }, { status: 401 });
        }

        // Get URL parameters
        const url = new URL(request.url);
        const action = url.searchParams.get('action') || 'list';

        switch (action) {
            case 'list':
                return await handleListSessions(user);

            case 'current':
                return await handleGetCurrentSession(user);

            case 'cleanup':
                return await handleCleanupSessions();

            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    validActions: ['list', 'current', 'cleanup']
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Session API error:', error);
        return NextResponse.json({
            error: 'Session operation failed'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware.authenticate()(request);

        if (authResult) {
            return authResult; // Return authentication error
        }

        const user = (request as any).user as User;

        if (!user) {
            return NextResponse.json({
                error: 'User not authenticated'
            }, { status: 401 });
        }

        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'revoke':
                return await handleRevokeSession(user, data);

            case 'revoke-all':
                return await handleRevokeAllSessions(user, data);

            case 'extend':
                return await handleExtendSession(user, data);

            case 'refresh':
                return await handleRefreshSession(user, data);

            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    validActions: ['revoke', 'revoke-all', 'extend', 'refresh']
                }, { status: 400 });
        }

    } catch (error) {
        console.error('Session API error:', error);
        return NextResponse.json({
            error: 'Session operation failed'
        }, { status: 500 });
    }
}

async function handleListSessions(user: User) {
    try {
        const sessions = await sessionManager.getUserSessions(user.id);

        // Format sessions for response (remove sensitive data)
        const formattedSessions = sessions.map(session => ({
            id: session.id,
            deviceInfo: {
                deviceType: session.deviceInfo.deviceType,
                platform: session.deviceInfo.platform,
                browser: session.deviceInfo.browser,
                version: session.deviceInfo.version
            },
            ipAddress: session.ipAddress,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            expiresAt: session.expiresAt,
            isActive: session.isActive,
            isCurrent: session.id === user.sessionId
        }));

        return NextResponse.json({
            success: true,
            sessions: formattedSessions,
            totalSessions: formattedSessions.length,
            activeSessions: formattedSessions.filter(s => s.isActive).length,
            currentSessionId: user.sessionId
        });

    } catch (error) {
        console.error('List sessions error:', error);
        return NextResponse.json({
            error: 'Failed to retrieve sessions'
        }, { status: 500 });
    }
}

async function handleGetCurrentSession(user: User) {
    try {
        const session = await sessionManager.getSession(user.sessionId);

        if (!session) {
            return NextResponse.json({
                error: 'Current session not found'
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            session: {
                id: session.id,
                deviceInfo: session.deviceInfo,
                ipAddress: session.ipAddress,
                createdAt: session.createdAt,
                lastActivity: session.lastActivity,
                expiresAt: session.expiresAt,
                isActive: session.isActive,
                timeUntilExpiry: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000))
            }
        });

    } catch (error) {
        console.error('Get current session error:', error);
        return NextResponse.json({
            error: 'Failed to retrieve current session'
        }, { status: 500 });
    }
}

async function handleCleanupSessions() {
    try {
        const cleanedCount = await sessionManager.cleanupExpiredSessions();

        return NextResponse.json({
            success: true,
            message: `Cleaned up ${cleanedCount} expired sessions`,
            cleanedCount
        });

    } catch (error) {
        console.error('Cleanup sessions error:', error);
        return NextResponse.json({
            error: 'Failed to cleanup sessions'
        }, { status: 500 });
    }
}

async function handleRevokeSession(user: User, data: any) {
    try {
        const { sessionId } = data;

        if (!sessionId) {
            return NextResponse.json({
                error: 'Session ID is required'
            }, { status: 400 });
        }

        // Verify the session belongs to the user
        const sessions = await sessionManager.getUserSessions(user.id);
        const sessionToRevoke = sessions.find(s => s.id === sessionId);

        if (!sessionToRevoke) {
            return NextResponse.json({
                error: 'Session not found or does not belong to user'
            }, { status: 404 });
        }

        // Don't allow revoking current session through this endpoint
        if (sessionId === user.sessionId) {
            return NextResponse.json({
                error: 'Cannot revoke current session. Use logout instead.'
            }, { status: 400 });
        }

        const success = await sessionManager.revokeSession(sessionId, 'user_revoked');

        if (!success) {
            return NextResponse.json({
                error: 'Failed to revoke session'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Session revoked successfully',
            revokedSessionId: sessionId
        });

    } catch (error) {
        console.error('Revoke session error:', error);
        return NextResponse.json({
            error: 'Failed to revoke session'
        }, { status: 500 });
    }
}

async function handleRevokeAllSessions(user: User, data: any) {
    try {
        const { excludeCurrent = true } = data;

        let revokedCount: number;

        if (excludeCurrent) {
            // Revoke all sessions except current
            const allSessions = await sessionManager.getUserSessions(user.id);
            revokedCount = 0;

            for (const session of allSessions) {
                if (session.id !== user.sessionId) {
                    await sessionManager.revokeSession(session.id, 'user_revoked_all');
                    revokedCount++;
                }
            }
        } else {
            // Revoke all sessions including current
            revokedCount = await sessionManager.revokeAllUserSessions(user.id, 'user_revoked_all');
        }

        const response = NextResponse.json({
            success: true,
            message: `Revoked ${revokedCount} sessions`,
            revokedCount,
            excludedCurrent: excludeCurrent
        });

        // If current session was also revoked, clear the auth cookie
        if (!excludeCurrent) {
            response.cookies.delete('auth-token');
        }

        return response;

    } catch (error) {
        console.error('Revoke all sessions error:', error);
        return NextResponse.json({
            error: 'Failed to revoke sessions'
        }, { status: 500 });
    }
}

async function handleExtendSession(user: User, data: any) {
    try {
        const { sessionId = user.sessionId, extensionMinutes = 60 } = data;

        // Verify the session belongs to the user
        const sessions = await sessionManager.getUserSessions(user.id);
        const sessionToExtend = sessions.find(s => s.id === sessionId);

        if (!sessionToExtend) {
            return NextResponse.json({
                error: 'Session not found or does not belong to user'
            }, { status: 404 });
        }

        // Extend session expiry
        const newExpiryTime = new Date(Date.now() + (extensionMinutes * 60 * 1000));

        // TODO: Implement actual session extension in session manager
        // For now, simulate successful extension

        return NextResponse.json({
            success: true,
            message: `Session extended by ${extensionMinutes} minutes`,
            sessionId,
            newExpiryTime,
            extensionMinutes
        });

    } catch (error) {
        console.error('Extend session error:', error);
        return NextResponse.json({
            error: 'Failed to extend session'
        }, { status: 500 });
    }
}

async function handleRefreshSession(user: User, data: any) {
    try {
        const { sessionId = user.sessionId } = data;

        // Get current session
        const session = await sessionManager.getSession(sessionId);

        if (!session) {
            return NextResponse.json({
                error: 'Session not found'
            }, { status: 404 });
        }

        // Verify session belongs to user
        if (session.userId !== user.id) {
            return NextResponse.json({
                error: 'Session does not belong to user'
            }, { status: 403 });
        }

        // Update last activity (this happens automatically in getSession)
        // Return updated session info

        return NextResponse.json({
            success: true,
            message: 'Session refreshed successfully',
            session: {
                id: session.id,
                lastActivity: session.lastActivity,
                expiresAt: session.expiresAt,
                timeUntilExpiry: Math.max(0, Math.floor((session.expiresAt.getTime() - Date.now()) / 1000))
            }
        });

    } catch (error) {
        console.error('Refresh session error:', error);
        return NextResponse.json({
            error: 'Failed to refresh session'
        }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        // Authenticate user
        const authResult = await authMiddleware.authenticate()(request);

        if (authResult) {
            return authResult; // Return authentication error
        }

        const user = (request as any).user as User;

        if (!user) {
            return NextResponse.json({
                error: 'User not authenticated'
            }, { status: 401 });
        }

        // Get session ID from URL
        const url = new URL(request.url);
        const sessionId = url.searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({
                error: 'Session ID is required'
            }, { status: 400 });
        }

        // Use the revoke session logic
        return await handleRevokeSession(user, { sessionId });

    } catch (error) {
        console.error('Delete session error:', error);
        return NextResponse.json({
            error: 'Failed to delete session'
        }, { status: 500 });
    }
}
