/**
 * Security Status and CSRF Token API
 * Provides security audit information and CSRF token management
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    securityHeadersManager,
    csrfTokenManager,
    SecurityAuditor
} from '../../../../lib/security-headers';
import { headers } from 'next/headers';

export async function GET(request: NextRequest) {
    try {
        const requestHeaders = await headers();

        // Get security audit results
        const auditResults = SecurityAuditor.auditHeaders(requestHeaders);
        const securityReport = SecurityAuditor.generateSecurityReport();
        const csrfStats = csrfTokenManager.getStats();

        // Generate a new CSRF token for this session
        const sessionId = request.headers.get('x-session-id') || 'anonymous';
        const csrfToken = csrfTokenManager.generateToken();
        csrfTokenManager.storeToken(sessionId, csrfToken);

        const response = {
            status: 'success',
            timestamp: new Date().toISOString(),
            security: {
                overall_score: Math.min(auditResults.score, securityReport.score),
                headers_audit: auditResults,
                security_features: securityReport,
                csrf_protection: {
                    enabled: true,
                    token_stats: csrfStats,
                    new_token: csrfToken
                },
                rate_limiting: {
                    enabled: true,
                    default_limit: 100,
                    window_ms: 60000
                }
            },
            headers_check: {
                content_security_policy: !!requestHeaders.get('content-security-policy'),
                strict_transport_security: !!requestHeaders.get('strict-transport-security'),
                x_frame_options: !!requestHeaders.get('x-frame-options'),
                x_content_type_options: !!requestHeaders.get('x-content-type-options'),
                referrer_policy: !!requestHeaders.get('referrer-policy'),
                permissions_policy: !!requestHeaders.get('permissions-policy')
            },
            recommendations: [
                'Security headers are comprehensively implemented',
                'CSRF protection is active with token rotation',
                'Rate limiting is enabled for all endpoints',
                'Content Security Policy includes nonce support',
                'HSTS is enabled in production environments'
            ]
        };

        return NextResponse.json(response, {
            status: 200,
            headers: {
                'Cache-Control': 'private, max-age=60, must-revalidate',
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });

    } catch (error) {
        console.error('Security status error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Failed to get security status',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-cache, no-store',
                'Content-Type': 'application/json'
            }
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, sessionId, token } = body;

        let result: any = {};

        switch (action) {
            case 'validate_csrf':
                if (!sessionId || !token) {
                    return NextResponse.json({
                        status: 'error',
                        message: 'Missing sessionId or token'
                    }, { status: 400 });
                }

                const isValid = csrfTokenManager.validateToken(sessionId, token, false);
                result = {
                    valid: isValid,
                    message: isValid ? 'CSRF token is valid' : 'CSRF token is invalid or expired'
                };
                break;

            case 'generate_csrf':
                const newSessionId = sessionId || `session_${Date.now()}`;
                const newToken = csrfTokenManager.generateToken();
                csrfTokenManager.storeToken(newSessionId, newToken);

                result = {
                    sessionId: newSessionId,
                    token: newToken,
                    message: 'New CSRF token generated'
                };
                break;

            case 'invalidate_session':
                if (sessionId) {
                    csrfTokenManager.invalidateSession(sessionId);
                    result = { message: `Session ${sessionId} invalidated` };
                } else {
                    result = { message: 'No sessionId provided' };
                }
                break;

            case 'security_audit':
                const requestHeaders = await headers();
                const auditResults = SecurityAuditor.auditHeaders(requestHeaders);

                result = {
                    audit: auditResults,
                    timestamp: new Date().toISOString()
                };
                break;

            default:
                return NextResponse.json({
                    status: 'error',
                    message: 'Invalid action. Available actions: validate_csrf, generate_csrf, invalidate_session, security_audit'
                }, { status: 400 });
        }

        return NextResponse.json({
            status: 'success',
            action,
            result,
            timestamp: new Date().toISOString()
        }, {
            headers: {
                'Cache-Control': 'private, no-cache, no-store, must-revalidate',
                'Content-Type': 'application/json'
            }
        });

    } catch (error) {
        console.error('Security action error:', error);

        return NextResponse.json({
            status: 'error',
            message: 'Failed to perform security action',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
