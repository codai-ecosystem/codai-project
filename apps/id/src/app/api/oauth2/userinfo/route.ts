import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_ISSUER = process.env.OAUTH2_ISSUER || 'https://id.codai.ro'

// OpenID Connect UserInfo endpoint
export async function GET(request: NextRequest) {
    try {
        // Extract access token from Authorization header
        const authHeader = request.headers.get('Authorization')

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'invalid_request', error_description: 'Missing or invalid Authorization header' },
                {
                    status: 401,
                    headers: { 'WWW-Authenticate': 'Bearer realm="CODAI", error="invalid_token"' }
                }
            )
        }

        const accessToken = authHeader.slice(7) // Remove 'Bearer ' prefix

        // Verify and decode the access token
        let decoded: any
        try {
            decoded = jwt.verify(accessToken, JWT_SECRET, {
                issuer: JWT_ISSUER,
                algorithms: ['HS256']
            })
        } catch (jwtError: any) {
            let errorDescription = 'Invalid access token'

            if (jwtError.name === 'TokenExpiredError') {
                errorDescription = 'Access token expired'
            } else if (jwtError.name === 'JsonWebTokenError') {
                errorDescription = 'Invalid access token format'
            }

            return NextResponse.json(
                { error: 'invalid_token', error_description: errorDescription },
                {
                    status: 401,
                    headers: { 'WWW-Authenticate': `Bearer realm="CODAI", error="invalid_token", error_description="${errorDescription}"` }
                }
            )
        }

        // Check if token has required scopes for UserInfo
        const tokenScopes = decoded.scope ? decoded.scope.split(' ') : []
        if (!tokenScopes.includes('openid')) {
            return NextResponse.json(
                { error: 'insufficient_scope', error_description: 'OpenID scope required for UserInfo endpoint' },
                {
                    status: 403,
                    headers: { 'WWW-Authenticate': 'Bearer realm="CODAI", error="insufficient_scope"' }
                }
            )
        }

        // Verify token is still valid in database
        const hashedToken = require('crypto').createHash('sha256').update(accessToken).digest('hex')
        const storedToken = await prisma.accessToken.findFirst({
            where: {
                token: hashedToken,
                expiresAt: { gt: new Date() }
            }
        })

        if (!storedToken) {
            return NextResponse.json(
                { error: 'invalid_token', error_description: 'Access token revoked or expired' },
                {
                    status: 401,
                    headers: { 'WWW-Authenticate': 'Bearer realm="CODAI", error="invalid_token"' }
                }
            )
        }

        // Get user information
        const user = await prisma.user.findUnique({
            where: { id: decoded.sub },
            select: {
                id: true,
                email: true,
                emailVerified: true,
                firstName: true,
                lastName: true,
                displayName: true,
                username: true,
                avatar: true,
                phoneNumber: true,
                phoneVerified: true,
                locale: true,
                timezone: true,
                createdAt: true,
                updatedAt: true,
            }
        })

        if (!user) {
            return NextResponse.json(
                { error: 'invalid_token', error_description: 'User not found' },
                {
                    status: 401,
                    headers: { 'WWW-Authenticate': 'Bearer realm="CODAI", error="invalid_token"' }
                }
            )
        }

        // Build UserInfo response based on requested scopes
        const userInfo: any = {
            sub: user.id, // Subject - required for OpenID Connect
        }

        // Profile scope claims
        if (tokenScopes.includes('profile')) {
            userInfo.name = user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || null
            userInfo.given_name = user.firstName
            userInfo.family_name = user.lastName
            userInfo.preferred_username = user.username
            userInfo.picture = user.avatar
            userInfo.locale = user.locale
            userInfo.zoneinfo = user.timezone
            userInfo.updated_at = Math.floor(user.updatedAt.getTime() / 1000)
        }

        // Email scope claims
        if (tokenScopes.includes('email')) {
            userInfo.email = user.email
            userInfo.email_verified = !!user.emailVerified
        }

        // Phone scope claims
        if (tokenScopes.includes('phone')) {
            userInfo.phone_number = user.phoneNumber
            userInfo.phone_number_verified = !!user.phoneVerified
        }

        // Address scope (not implemented yet)
        if (tokenScopes.includes('address')) {
            // Would include address information if available
            // userInfo.address = { ... }
        }

        // Custom CODAI scopes
        if (tokenScopes.includes('codai:profile')) {
            userInfo.codai_user_id = user.id
            userInfo.codai_username = user.username
            userInfo.codai_created_at = user.createdAt.toISOString()
        }

        // Log successful UserInfo access
        console.log(`UserInfo accessed: user=${user.id}, client=${decoded.client_id}, scopes=${tokenScopes.join(' ')}`)

        // Return UserInfo response
        const response = NextResponse.json(userInfo)
        response.headers.set('Content-Type', 'application/json')
        response.headers.set('Cache-Control', 'no-store')
        response.headers.set('Pragma', 'no-cache')

        return response

    } catch (error: any) {
        console.error('UserInfo endpoint error:', error)

        return NextResponse.json(
            { error: 'server_error', error_description: 'Internal server error' },
            {
                status: 500,
                headers: { 'WWW-Authenticate': 'Bearer realm="CODAI", error="server_error"' }
            }
        )
    }
}

// POST method not supported for UserInfo endpoint
export async function POST(request: NextRequest) {
    return NextResponse.json(
        { error: 'method_not_allowed', error_description: 'POST method not supported' },
        {
            status: 405,
            headers: { 'Allow': 'GET' }
        }
    )
}
