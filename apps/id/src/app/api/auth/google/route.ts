import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID

    if (!clientId) {
      return NextResponse.json({ error: 'Google OAuth not configured' }, { status: 500 })
    }

    const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
    const scope = 'openid email profile'
    const state = Math.random().toString(36).substring(2, 15)

    const authUrl = new URL('https://accounts.google.com/oauth2/auth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('access_type', 'offline')
    authUrl.searchParams.set('prompt', 'consent')

    return NextResponse.redirect(authUrl.toString())
  } catch (error) {
    console.error('Google OAuth initiation error:', error)
    return NextResponse.json({ error: 'Failed to initiate Google OAuth' }, { status: 500 })
  }
}
