import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

interface JWTPayload {
    userId: string;
    email: string;
    iat: number;
    exp: number;
}

export async function GET(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            )
        }

        // Extract token
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        if (!token) {
            return NextResponse.json(
                { error: 'Invalid authorization format' },
                { status: 401 }
            )
        }

        try {
            // Verify JWT token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'secure-jwt-secret-change-in-production'
            ) as JWTPayload;

            // Check token expiration
            const currentTime = Math.floor(Date.now() / 1000);
            if (decoded.exp < currentTime) {
                return NextResponse.json(
                    { error: 'Token expired' },
                    { status: 401 }
                )
            }

            // Return protected data
            return NextResponse.json({
                success: true,
                message: 'Access granted to protected resource',
                user: {
                    userId: decoded.userId,
                    email: decoded.email
                },
                timestamp: new Date().toISOString(),
                tokenInfo: {
                    issuedAt: new Date(decoded.iat * 1000).toISOString(),
                    expiresAt: new Date(decoded.exp * 1000).toISOString()
                }
            })

        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error('Protected route error:', error)
        return NextResponse.json(
            { error: 'Protected resource access error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        // Get authorization header
        const authHeader = request.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Authorization token required' },
                { status: 401 }
            )
        }

        // Extract token
        const token = authHeader.substring(7);

        try {
            // Verify JWT token
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'secure-jwt-secret-change-in-production'
            ) as JWTPayload;

            // Get request body
            const body = await request.json();

            // Return success with user data
            return NextResponse.json({
                success: true,
                message: 'Protected POST operation successful',
                user: {
                    userId: decoded.userId,
                    email: decoded.email
                },
                receivedData: body,
                timestamp: new Date().toISOString()
            })

        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            )
        }

    } catch (error) {
        console.error('Protected POST error:', error)
        return NextResponse.json(
            { error: 'Protected resource error' },
            { status: 500 }
        )
    }
}
