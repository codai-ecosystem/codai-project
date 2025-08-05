/**
 * NextAuth.js API Route Handler for MemorAI
 * Real authentication using CODAI ecosystem integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { CodaiProvider } from '@/lib/auth';

// Type definitions for OAuth flow
interface TokenRequest {
    grant_type: string;
    code: string;
    redirect_uri: string;
    client_id: string;
    client_secret?: string;
}

interface TokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
    roles?: string[];
    organizations?: any[];
    permissions?: string[];
}

// Real OAuth 2.0 implementation
async function exchangeCodeForToken(code: string, redirectUri: string): Promise<TokenResponse> {
    const tokenUrl = CodaiProvider.token;
    const tokenRequest: TokenRequest = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: CodaiProvider.clientId,
        client_secret: CodaiProvider.clientSecret
    };

    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams(tokenRequest as any)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function fetchUserProfile(accessToken: string): Promise<UserProfile> {
    const userInfoUrl = CodaiProvider.userinfo;

    const response = await fetch(userInfoUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('User profile fetch failed:', response.status, errorText);
        throw new Error(`User profile fetch failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// NextAuth-style API Route Handler
async function handler(req: NextRequest) {
    const { method } = req;
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const action = pathSegments[pathSegments.length - 1];

    console.log(`[NextAuth Real] ${method} ${url.pathname} - Action: ${action}`);

    try {
        switch (action) {
            case 'signin':
                if (method === 'GET') {
                    // Redirect to CODAI OAuth authorization
                    const authUrl = new URL(CodaiProvider.authorization.url);
                    authUrl.searchParams.set('client_id', CodaiProvider.clientId);
                    authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth/callback/codai`);
                    authUrl.searchParams.set('response_type', 'code');
                    authUrl.searchParams.set('scope', CodaiProvider.authorization.params.scope);
                    authUrl.searchParams.set('state', crypto.randomUUID());

                    return NextResponse.redirect(authUrl.toString());
                }
                break;

            case 'signout':
                // Clear session and redirect to home
                const signoutResponse = NextResponse.redirect(new URL('/', url.origin));

                // Clear auth cookies (in real implementation)
                signoutResponse.cookies.delete('next-auth.session-token');
                signoutResponse.cookies.delete('__Secure-next-auth.session-token');

                return signoutResponse;

            case 'session':
                // Return current session (would be retrieved from session store in real implementation)
                return NextResponse.json({
                    user: null,
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                });

            case 'csrf':
                // Return CSRF token
                return NextResponse.json({
                    csrfToken: crypto.randomUUID()
                });

            case 'providers':
                // Return available providers
                return NextResponse.json({
                    codai: {
                        id: 'codai',
                        name: 'CODAI',
                        type: 'oauth',
                        signinUrl: `${url.origin}/api/auth/signin/codai`,
                        callbackUrl: `${url.origin}/api/auth/callback/codai`
                    }
                });

            case 'callback':
                // Handle OAuth callback
                const code = url.searchParams.get('code');
                const state = url.searchParams.get('state');
                const error = url.searchParams.get('error');

                if (error) {
                    console.error('OAuth error:', error);
                    return NextResponse.redirect(new URL(`/auth/error?error=${error}`, url.origin));
                }

                if (!code) {
                    console.error('Authorization code not provided');
                    return NextResponse.redirect(new URL('/auth/error?error=NoCode', url.origin));
                }

                try {
                    // Exchange code for access token
                    console.log('Exchanging code for token...');
                    const tokenData = await exchangeCodeForToken(code, `${url.origin}/api/auth/callback/codai`);

                    // Fetch user profile
                    console.log('Fetching user profile...');
                    const userProfile = await fetchUserProfile(tokenData.access_token);

                    // Map profile using provider function
                    const user = CodaiProvider.profile(userProfile);

                    console.log('Authentication successful for user:', user.email);

                    // Create successful redirect with session data
                    const successResponse = NextResponse.redirect(new URL('/dashboard', url.origin));

                    // In a real implementation, you would:
                    // 1. Store the session in your session store (database, Redis, etc.)
                    // 2. Set secure HTTP-only cookies with session token
                    // 3. Handle token refresh logic

                    // For now, set a simple cookie to indicate successful auth
                    successResponse.cookies.set('memorai-auth', 'authenticated', {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'lax',
                        maxAge: 24 * 60 * 60 // 24 hours
                    });

                    return successResponse;

                } catch (authError) {
                    console.error('Authentication error:', authError);
                    return NextResponse.redirect(new URL('/auth/error?error=AuthenticationFailed', url.origin));
                }

            default:
                return NextResponse.json({
                    message: `NextAuth.js Real Handler - ${action}`,
                    provider: 'codai',
                    status: 'operational'
                });
        }
    } catch (error) {
        console.error('NextAuth API Error:', error);
        return NextResponse.json({
            error: 'Authentication error',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }

    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export { handler as GET, handler as POST };
