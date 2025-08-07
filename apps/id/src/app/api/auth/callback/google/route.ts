import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { userStorage } from '../../../../lib/user-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(new URL('/auth/signin?error=oauth_error', request.url))
    }

    if (!code) {
      return NextResponse.redirect(new URL('/auth/signin?error=no_code', request.url))
    }

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      }),
    })

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text())
      return NextResponse.redirect(new URL('/auth/signin?error=token_exchange_failed', request.url))
    }

    const tokenData = await tokenResponse.json()
    const { access_token } = tokenData

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('User info fetch failed:', await userResponse.text())
      return NextResponse.redirect(new URL('/auth/signin?error=user_info_failed', request.url))
    }

    const googleUser = await userResponse.json()
    const { email, name, picture, id: googleId } = googleUser

    // Check if user exists or is authorized
    let user = userStorage.getUser(email)

    // Only allow the master admin email for now
    if (email !== 'vladulescu.catalin@gmail.com') {
      console.log(`Unauthorized OAuth attempt from: ${email}`)
      return NextResponse.redirect(new URL('/auth/signin?error=unauthorized', request.url))
    }

    if (!user) {
      // Create user if it's the master admin
      user = {
        id: 'master-admin-001',
        email: email,
        name: name,
        password: '', // No password needed for OAuth users
        role: 'master_admin',
        groups: ['master_admin', 'ai_admins', 'admins'],
        provider: 'google',
        googleId: googleId,
        avatar: picture,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
      userStorage.addUser(user)
    } else {
      // Update last login
      user.lastLogin = new Date().toISOString()
      if (picture) user.avatar = picture
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        groups: user.groups,
        provider: user.provider,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      },
      process.env.JWT_SECRET || 'secure-jwt-secret-change-in-production',
      { algorithm: 'HS256' }
    )

    // Set token as httpOnly cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/auth/signin?error=internal_error', request.url))
  }
}
