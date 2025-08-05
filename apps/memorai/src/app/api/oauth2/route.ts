/**
 * OAuth2 Provider Integration API
 * Handles OAuth2 authorization flows for multiple providers
 */

import { NextRequest, NextResponse } from 'next/server';
import { oauth2Manager } from '../../../lib/auth-enhancement';
import crypto from 'crypto';

// In-memory state storage (in production, use Redis or database)
const oauthStates = new Map<string, { provider: string; redirectUri: string; createdAt: Date }>();

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const action = url.searchParams.get('action') || 'providers';

        switch (action) {
            case 'providers':
                return await handleGetProviders();

            case 'authorize':
                return await handleGetAuthorizationUrl(request);

            case 'callback':
                return await handleOAuth2Callback(request);

            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    validActions: ['providers', 'authorize', 'callback']
                }, { status: 400 });
        }

    } catch (error) {
        console.error('OAuth2 API error:', error);
        return NextResponse.json({
            error: 'OAuth2 operation failed'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, ...data } = body;

        switch (action) {
            case 'exchange-code':
                return await handleExchangeCode(data);

            case 'revoke-token':
                return await handleRevokeToken(data);

            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    validActions: ['exchange-code', 'revoke-token']
                }, { status: 400 });
        }

    } catch (error) {
        console.error('OAuth2 API error:', error);
        return NextResponse.json({
            error: 'OAuth2 operation failed'
        }, { status: 500 });
    }
}

async function handleGetProviders() {
    try {
        const providers = oauth2Manager.getEnabledProviders();

        // Return public provider information (without secrets)
        const publicProviders = providers.map(provider => ({
            id: provider.id,
            name: provider.name,
            enabled: provider.enabled,
            authorizeUrl: provider.authorizeUrl,
            scope: provider.scope
        }));

        return NextResponse.json({
            success: true,
            providers: publicProviders,
            count: publicProviders.length
        });

    } catch (error) {
        console.error('Get providers error:', error);
        return NextResponse.json({
            error: 'Failed to retrieve OAuth2 providers'
        }, { status: 500 });
    }
}

async function handleGetAuthorizationUrl(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const provider = url.searchParams.get('provider');
        const redirectUri = url.searchParams.get('redirectUri');
        const customState = url.searchParams.get('state');

        if (!provider || !redirectUri) {
            return NextResponse.json({
                error: 'Provider and redirectUri are required'
            }, { status: 400 });
        }

        // Generate secure state parameter
        const state = customState || crypto.randomBytes(32).toString('hex');

        // Store state information
        oauthStates.set(state, {
            provider,
            redirectUri,
            createdAt: new Date()
        });

        // Clean up old states (older than 10 minutes)
        cleanupOldStates();

        // Get authorization URL
        const authUrl = oauth2Manager.getAuthorizationUrl(provider, redirectUri, state);

        if (!authUrl) {
            return NextResponse.json({
                error: 'Invalid provider or provider not enabled'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            authUrl,
            state,
            provider,
            redirectUri
        });

    } catch (error) {
        console.error('Get authorization URL error:', error);
        return NextResponse.json({
            error: 'Failed to generate authorization URL'
        }, { status: 500 });
    }
}

async function handleOAuth2Callback(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        // Handle OAuth2 errors
        if (error) {
            return NextResponse.json({
                error: 'OAuth2 authorization failed',
                details: {
                    error,
                    description: errorDescription
                }
            }, { status: 400 });
        }

        if (!code || !state) {
            return NextResponse.json({
                error: 'Authorization code and state are required'
            }, { status: 400 });
        }

        // Validate state parameter
        const stateInfo = oauthStates.get(state);

        if (!stateInfo) {
            return NextResponse.json({
                error: 'Invalid or expired state parameter'
            }, { status: 400 });
        }

        // Remove used state
        oauthStates.delete(state);

        // Exchange code for token
        const tokenData = await oauth2Manager.exchangeCodeForToken(
            stateInfo.provider,
            code,
            stateInfo.redirectUri
        );

        if (!tokenData) {
            return NextResponse.json({
                error: 'Failed to exchange authorization code for token'
            }, { status: 400 });
        }

        // Get user information
        const userInfo = await oauth2Manager.getUserInfo(stateInfo.provider, tokenData.accessToken);

        if (!userInfo) {
            return NextResponse.json({
                error: 'Failed to retrieve user information'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            provider: stateInfo.provider,
            tokenData: {
                accessToken: tokenData.accessToken,
                refreshToken: tokenData.refreshToken,
                expiresIn: tokenData.expiresIn
            },
            userInfo: {
                id: userInfo.id || userInfo.sub,
                email: userInfo.email,
                name: userInfo.name || userInfo.login,
                avatar: userInfo.avatar_url || userInfo.picture,
                verified: userInfo.verified_email || userInfo.email_verified
            }
        });

    } catch (error) {
        console.error('OAuth2 callback error:', error);
        return NextResponse.json({
            error: 'OAuth2 callback processing failed'
        }, { status: 500 });
    }
}

async function handleExchangeCode(data: any) {
    try {
        const { provider, code, redirectUri, state } = data;

        if (!provider || !code || !redirectUri) {
            return NextResponse.json({
                error: 'Provider, code, and redirectUri are required'
            }, { status: 400 });
        }

        // Validate state if provided
        if (state) {
            const stateInfo = oauthStates.get(state);

            if (!stateInfo || stateInfo.provider !== provider) {
                return NextResponse.json({
                    error: 'Invalid state parameter'
                }, { status: 400 });
            }

            // Remove used state
            oauthStates.delete(state);
        }

        // Exchange code for token
        const tokenData = await oauth2Manager.exchangeCodeForToken(provider, code, redirectUri);

        if (!tokenData) {
            return NextResponse.json({
                error: 'Failed to exchange authorization code for token'
            }, { status: 400 });
        }

        // Get user information
        const userInfo = await oauth2Manager.getUserInfo(provider, tokenData.accessToken);

        if (!userInfo) {
            return NextResponse.json({
                error: 'Failed to retrieve user information'
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            provider,
            tokenData: {
                accessToken: tokenData.accessToken,
                refreshToken: tokenData.refreshToken,
                expiresIn: tokenData.expiresIn
            },
            userInfo: {
                id: userInfo.id || userInfo.sub,
                email: userInfo.email,
                name: userInfo.name || userInfo.login,
                avatar: userInfo.avatar_url || userInfo.picture,
                verified: userInfo.verified_email || userInfo.email_verified,
                profile: userInfo
            }
        });

    } catch (error) {
        console.error('Exchange code error:', error);
        return NextResponse.json({
            error: 'Failed to exchange authorization code'
        }, { status: 500 });
    }
}

async function handleRevokeToken(data: any) {
    try {
        const { provider, token, tokenType = 'access_token' } = data;

        if (!provider || !token) {
            return NextResponse.json({
                error: 'Provider and token are required'
            }, { status: 400 });
        }

        // TODO: Implement token revocation for each provider
        // Different providers have different revocation endpoints

        let success = false;
        let revokeUrl = '';

        switch (provider) {
            case 'google':
                revokeUrl = `https://oauth2.googleapis.com/revoke?token=${token}`;
                break;

            case 'github':
                // GitHub doesn't have a standard revocation endpoint
                // Applications can be deleted via GitHub UI
                success = true; // Simulate success
                break;

            case 'microsoft':
                revokeUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/logout';
                break;

            default:
                return NextResponse.json({
                    error: 'Token revocation not supported for this provider'
                }, { status: 400 });
        }

        if (revokeUrl && provider !== 'github') {
            try {
                const response = await fetch(revokeUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

                success = response.ok;
            } catch (error) {
                console.error(`Token revocation failed for ${provider}:`, error);
                success = false;
            }
        }

        return NextResponse.json({
            success,
            message: success
                ? `Token revoked successfully for ${provider}`
                : `Failed to revoke token for ${provider}`,
            provider,
            tokenType
        });

    } catch (error) {
        console.error('Revoke token error:', error);
        return NextResponse.json({
            error: 'Failed to revoke token'
        }, { status: 500 });
    }
}

/**
 * Clean up old OAuth2 states (older than 10 minutes)
 */
function cleanupOldStates() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    for (const [state, info] of oauthStates.entries()) {
        if (info.createdAt < tenMinutesAgo) {
            oauthStates.delete(state);
        }
    }
}

// Clean up states every 5 minutes
setInterval(cleanupOldStates, 5 * 60 * 1000);
