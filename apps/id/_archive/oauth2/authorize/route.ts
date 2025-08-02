import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'
import { SimpleAuthService } from '@/services/simple-auth'

// OAuth2 Authorization Request Schema
const authorizeSchema = z.object({
    response_type: z.enum(['code']).default('code'),
    client_id: z.string().min(1, 'Client ID is required'),
    redirect_uri: z.string().url('Valid redirect URI is required'),
    scope: z.string().optional().default('openid profile email'),
    state: z.string().optional(),
    code_challenge: z.string().optional(),
    code_challenge_method: z.enum(['plain', 'S256']).optional(),
    prompt: z.enum(['none', 'login', 'consent', 'select_account']).optional(),
    max_age: z.string().optional(),
    ui_locales: z.string().optional(),
    id_token_hint: z.string().optional(),
    login_hint: z.string().optional(),
})

const AUTHORIZATION_CODE_EXPIRES_IN = 600 // 10 minutes
const MAX_REDIRECT_URI_LENGTH = 2048

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const params = Object.fromEntries(searchParams.entries())

        // Validate OAuth2 parameters
        const validatedParams = authorizeSchema.parse(params)

        const {
            response_type,
            client_id,
            redirect_uri,
            scope,
            state,
            code_challenge,
            code_challenge_method,
            prompt,
            max_age,
            ui_locales,
            id_token_hint,
            login_hint,
        } = validatedParams

        // Validate redirect URI length
        if (redirect_uri.length > MAX_REDIRECT_URI_LENGTH) {
            return NextResponse.json(
                { error: 'invalid_request', error_description: 'Redirect URI too long' },
                { status: 400 }
            )
        }

        // Find and validate OAuth client
        const client = await prisma.oAuthClient.findUnique({
            where: { clientId: client_id },
            select: {
                id: true,
                clientId: true,
                name: true,
                redirectUris: true,
                grantTypes: true,
                scopes: true,
                clientType: true,
                isFirstParty: true,
            },
        })

        if (!client) {
            return NextResponse.json(
                { error: 'invalid_client', error_description: 'Invalid client ID' },
                { status: 400 }
            )
        }

        // Validate redirect URI against registered URIs
        const allowedRedirectUris = Array.isArray(client.redirectUris) ? client.redirectUris : [client.redirectUris]
        if (!allowedRedirectUris.includes(redirect_uri)) {
            return NextResponse.json(
                { error: 'invalid_request', error_description: 'Invalid redirect URI' },
                { status: 400 }
            )
        }

        // Validate grant type support
        const supportedGrantTypes = Array.isArray(client.grantTypes) ? client.grantTypes : [client.grantTypes]
        if (!supportedGrantTypes.includes('authorization_code')) {
            return NextResponse.json(
                { error: 'unauthorized_client', error_description: 'Client not authorized for authorization code grant' },
                { status: 400 }
            )
        }

        // Validate scopes
        const requestedScopes = scope.split(' ')
        const allowedScopes = Array.isArray(client.scopes) ? client.scopes : [client.scopes]
        const invalidScopes = requestedScopes.filter(s => !allowedScopes.includes(s))

        if (invalidScopes.length > 0) {
            return NextResponse.json(
                { error: 'invalid_scope', error_description: `Invalid scopes: ${invalidScopes.join(', ')}` },
                { status: 400 }
            )
        }

        // Validate PKCE for public clients
        if (client.clientType === 'PUBLIC') {
            if (!code_challenge) {
                return NextResponse.json(
                    { error: 'invalid_request', error_description: 'PKCE code_challenge is required for public clients' },
                    { status: 400 }
                )
            }
            if (code_challenge_method && code_challenge_method !== 'S256') {
                return NextResponse.json(
                    { error: 'invalid_request', error_description: 'Only S256 code_challenge_method is supported' },
                    { status: 400 }
                )
            }
        }

        // Check if user is authenticated
        const authCookie = request.cookies.get('codai_auth_token')
        let userId: string | null = null
        let requiresLogin = true

        if (authCookie) {
            try {
                // Validate existing session (simplified - in production use proper JWT validation)
                const user = await validateAuthToken(authCookie.value)
                if (user) {
                    userId = user.id
                    requiresLogin = false

                    // Handle max_age parameter
                    if (max_age) {
                        const maxAgeSeconds = parseInt(max_age)
                        const lastLogin = user.updatedAt || user.createdAt
                        const sessionAge = Math.floor((Date.now() - lastLogin.getTime()) / 1000)
                        if (sessionAge > maxAgeSeconds) {
                            requiresLogin = true
                        }
                    }
                }
            } catch (error) {
                // Invalid token, require login
                requiresLogin = true
            }
        }

        // Handle prompt parameter
        if (prompt === 'none') {
            if (requiresLogin) {
                const errorUrl = new URL(redirect_uri)
                errorUrl.searchParams.set('error', 'login_required')
                errorUrl.searchParams.set('error_description', 'User authentication required')
                if (state) errorUrl.searchParams.set('state', state)

                return NextResponse.redirect(errorUrl.toString())
            }
        } else if (prompt === 'login') {
            requiresLogin = true
        }

        // If user needs to authenticate, redirect to login
        if (requiresLogin) {
            const loginUrl = new URL('/login', request.url)

            // Preserve OAuth2 parameters for after login
            const authParams = new URLSearchParams({
                response_type,
                client_id,
                redirect_uri,
                scope,
                ...(state && { state }),
                ...(code_challenge && { code_challenge }),
                ...(code_challenge_method && { code_challenge_method }),
                ...(prompt && { prompt }),
                ...(max_age && { max_age }),
                ...(ui_locales && { ui_locales }),
                ...(id_token_hint && { id_token_hint }),
                ...(login_hint && { login_hint }),
            })

            loginUrl.searchParams.set('continue', `/api/oauth2/authorize?${authParams.toString()}`)
            if (login_hint) {
                loginUrl.searchParams.set('login_hint', login_hint)
            }

            return NextResponse.redirect(loginUrl.toString())
        }

        // Generate authorization code
        const authorizationCode = crypto.randomBytes(32).toString('base64url')
        const expiresAt = new Date(Date.now() + AUTHORIZATION_CODE_EXPIRES_IN * 1000)

        // Store authorization code in database
        await prisma.authorizationCode.create({
            data: {
                code: authorizationCode,
                clientId: client_id,
                userId: userId!,
                redirectUri: redirect_uri,
                scopes: requestedScopes,
                codeChallenge: code_challenge || null,
                codeChallengeMethod: code_challenge_method || null,
                expiresAt,
            },
        })

        // Redirect back to client with authorization code
        const callbackUrl = new URL(redirect_uri)
        callbackUrl.searchParams.set('code', authorizationCode)
        if (state) {
            callbackUrl.searchParams.set('state', state)
        }

        // Log successful authorization
        console.log(`OAuth2 authorization granted: client=${client_id}, user=${userId}, scopes=${scope}`)

        return NextResponse.redirect(callbackUrl.toString())

    } catch (error: any) {
        console.error('OAuth2 authorize error:', error)

        // Handle validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    error: 'invalid_request',
                    error_description: error.errors[0]?.message || 'Invalid request parameters'
                },
                { status: 400 }
            )
        }

        // Generic error response
        return NextResponse.json(
            { error: 'server_error', error_description: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Helper function to validate auth token (simplified)
async function validateAuthToken(token: string) {
    try {
        // In production, use proper JWT validation with jsonwebtoken
        const user = await prisma.user.findFirst({
            where: {
                // This is simplified - in production decode and validate JWT
                id: { not: undefined }
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return user
    } catch {
        return null
    }
}

export async function POST(request: NextRequest) {
    // Handle consent/approval form submission
    return NextResponse.json(
        { error: 'method_not_allowed', error_description: 'POST not implemented yet' },
        { status: 405 }
    )
}
