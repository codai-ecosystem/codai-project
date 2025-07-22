import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

// OAuth2 Token Request Schema
const tokenSchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token', 'client_credentials']),
  client_id: z.string().min(1),
  client_secret: z.string().optional(),
  code: z.string().optional(),
  redirect_uri: z.string().url().optional(),
  code_verifier: z.string().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key'
const JWT_ISSUER = process.env.OAUTH2_ISSUER || 'https://id.codai.ro'

// Token lifetimes
const ACCESS_TOKEN_EXPIRES_IN = 900 // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = 604800 // 7 days
const ID_TOKEN_EXPIRES_IN = 3600 // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request parameters
    const validatedData = tokenSchema.parse(body)
    const { 
      grant_type, 
      client_id, 
      client_secret, 
      code, 
      redirect_uri, 
      code_verifier,
      refresh_token,
      scope 
    } = validatedData

    // Find and validate OAuth client
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: client_id },
      select: {
        id: true,
        clientId: true,
        clientSecret: true,
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
        { status: 401 }
      )
    }

    // Validate client authentication
    if (client.clientType === 'CONFIDENTIAL') {
      if (!client_secret || !client.clientSecret) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: 'Client secret required' },
          { status: 401 }
        )
      }

      // Secure comparison of client secret
      const isValidSecret = await compare(client_secret, client.clientSecret)
      if (!isValidSecret) {
        return NextResponse.json(
          { error: 'invalid_client', error_description: 'Invalid client secret' },
          { status: 401 }
        )
      }
    }

    // Validate grant type support
    const supportedGrantTypes = Array.isArray(client.grantTypes) ? client.grantTypes : [client.grantTypes]
    if (!supportedGrantTypes.includes(grant_type)) {
      return NextResponse.json(
        { error: 'unauthorized_client', error_description: `Grant type '${grant_type}' not supported` },
        { status: 400 }
      )
    }

    // Handle different grant types
    switch (grant_type) {
      case 'authorization_code':
        return handleAuthorizationCodeGrant(client, { code, redirect_uri, code_verifier })
      
      case 'refresh_token':
        return handleRefreshTokenGrant(client, { refresh_token, scope })
      
      case 'client_credentials':
        return handleClientCredentialsGrant(client, { scope })
      
      default:
        return NextResponse.json(
          { error: 'unsupported_grant_type', error_description: 'Grant type not supported' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('OAuth2 token error:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'invalid_request', error_description: error.errors[0]?.message || 'Invalid request' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'server_error', error_description: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle Authorization Code Grant
async function handleAuthorizationCodeGrant(
  client: any, 
  params: { code?: string; redirect_uri?: string; code_verifier?: string }
) {
  const { code, redirect_uri, code_verifier } = params

  if (!code) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Authorization code is required' },
      { status: 400 }
    )
  }

  // Find and validate authorization code
  const authCode = await prisma.authorizationCode.findUnique({
    where: { code },
    include: { user: true },
  })

  if (!authCode) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid or expired authorization code' },
      { status: 400 }
    )
  }

  // Check code expiration
  if (authCode.expiresAt < new Date()) {
    // Clean up expired code
    await prisma.authorizationCode.delete({ where: { id: authCode.id } })
    
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Authorization code expired' },
      { status: 400 }
    )
  }

  // Validate client ID
  if (authCode.clientId !== client.clientId) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Authorization code was not issued to this client' },
      { status: 400 }
    )
  }

  // Validate redirect URI
  if (redirect_uri && authCode.redirectUri !== redirect_uri) {
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Redirect URI mismatch' },
      { status: 400 }
    )
  }

  // Validate PKCE if used
  if (authCode.codeChallenge) {
    if (!code_verifier) {
      return NextResponse.json(
        { error: 'invalid_request', error_description: 'Code verifier is required' },
        { status: 400 }
      )
    }

    const computedChallenge = crypto
      .createHash('sha256')
      .update(code_verifier)
      .digest('base64url')

    if (computedChallenge !== authCode.codeChallenge) {
      return NextResponse.json(
        { error: 'invalid_grant', error_description: 'Invalid code verifier' },
        { status: 400 }
      )
    }
  }

  // Generate tokens
  const now = Math.floor(Date.now() / 1000)
  const scopes = Array.isArray(authCode.scopes) ? authCode.scopes : [authCode.scopes]
  
  const accessToken = jwt.sign(
    {
      iss: JWT_ISSUER,
      aud: client.clientId,
      sub: authCode.userId,
      scope: scopes.join(' '),
      client_id: client.clientId,
      iat: now,
      exp: now + ACCESS_TOKEN_EXPIRES_IN,
      jti: crypto.randomUUID(),
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  )

  const refreshToken = jwt.sign(
    {
      iss: JWT_ISSUER,
      aud: client.clientId,
      sub: authCode.userId,
      scope: scopes.join(' '),
      client_id: client.clientId,
      iat: now,
      exp: now + REFRESH_TOKEN_EXPIRES_IN,
      jti: crypto.randomUUID(),
      token_type: 'refresh',
    },
    JWT_REFRESH_SECRET,
    { algorithm: 'HS256' }
  )

  // Generate ID token if OpenID Connect scope requested
  let idToken: string | undefined
  if (scopes.includes('openid')) {
    idToken = jwt.sign(
      {
        iss: JWT_ISSUER,
        aud: client.clientId,
        sub: authCode.userId,
        name: authCode.user.name,
        email: authCode.user.email,
        email_verified: !!authCode.user.emailVerified,
        iat: now,
        exp: now + ID_TOKEN_EXPIRES_IN,
        auth_time: now,
        nonce: crypto.randomUUID(), // Should be from original request
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    )
  }

  // Store access token in database for future validation
  await prisma.accessToken.create({
    data: {
      token: crypto.createHash('sha256').update(accessToken).digest('hex'),
      clientId: client.clientId,
      userId: authCode.userId,
      scopes: scopes,
      expiresAt: new Date((now + ACCESS_TOKEN_EXPIRES_IN) * 1000),
    },
  })

  // Clean up authorization code (one-time use)
  await prisma.authorizationCode.delete({ where: { id: authCode.id } })

  // Prepare response
  const tokenResponse: any = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_EXPIRES_IN,
    refresh_token: refreshToken,
    scope: scopes.join(' '),
  }

  if (idToken) {
    tokenResponse.id_token = idToken
  }

  console.log(`OAuth2 tokens issued: client=${client.clientId}, user=${authCode.userId}, scopes=${scopes.join(' ')}`)

  return NextResponse.json(tokenResponse)
}

// Handle Refresh Token Grant
async function handleRefreshTokenGrant(
  client: any,
  params: { refresh_token?: string; scope?: string }
) {
  const { refresh_token, scope } = params

  if (!refresh_token) {
    return NextResponse.json(
      { error: 'invalid_request', error_description: 'Refresh token is required' },
      { status: 400 }
    )
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refresh_token, JWT_REFRESH_SECRET) as any

    // Validate token properties
    if (decoded.token_type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    if (decoded.client_id !== client.clientId) {
      throw new Error('Token not issued to this client')
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, emailVerified: true },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Handle scope parameter
    let tokenScopes = decoded.scope ? decoded.scope.split(' ') : []
    if (scope) {
      const requestedScopes = scope.split(' ')
      // Requested scopes must be subset of original scopes
      const invalidScopes = requestedScopes.filter(s => !tokenScopes.includes(s))
      if (invalidScopes.length > 0) {
        return NextResponse.json(
          { error: 'invalid_scope', error_description: 'Requested scope exceeds granted scope' },
          { status: 400 }
        )
      }
      tokenScopes = requestedScopes
    }

    // Generate new tokens
    const now = Math.floor(Date.now() / 1000)
    
    const accessToken = jwt.sign(
      {
        iss: JWT_ISSUER,
        aud: client.clientId,
        sub: decoded.sub,
        scope: tokenScopes.join(' '),
        client_id: client.clientId,
        iat: now,
        exp: now + ACCESS_TOKEN_EXPIRES_IN,
        jti: crypto.randomUUID(),
      },
      JWT_SECRET,
      { algorithm: 'HS256' }
    )

    const newRefreshToken = jwt.sign(
      {
        iss: JWT_ISSUER,
        aud: client.clientId,
        sub: decoded.sub,
        scope: tokenScopes.join(' '),
        client_id: client.clientId,
        iat: now,
        exp: now + REFRESH_TOKEN_EXPIRES_IN,
        jti: crypto.randomUUID(),
        token_type: 'refresh',
      },
      JWT_REFRESH_SECRET,
      { algorithm: 'HS256' }
    )

    // Store new access token
    await prisma.accessToken.create({
      data: {
        token: crypto.createHash('sha256').update(accessToken).digest('hex'),
        clientId: client.clientId,
        userId: decoded.sub,
        scopes: tokenScopes,
        expiresAt: new Date((now + ACCESS_TOKEN_EXPIRES_IN) * 1000),
      },
    })

    const tokenResponse = {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: ACCESS_TOKEN_EXPIRES_IN,
      refresh_token: newRefreshToken,
      scope: tokenScopes.join(' '),
    }

    console.log(`OAuth2 tokens refreshed: client=${client.clientId}, user=${decoded.sub}`)

    return NextResponse.json(tokenResponse)

  } catch (error) {
    console.error('Refresh token validation error:', error)
    
    return NextResponse.json(
      { error: 'invalid_grant', error_description: 'Invalid or expired refresh token' },
      { status: 400 }
    )
  }
}

// Handle Client Credentials Grant
async function handleClientCredentialsGrant(
  client: any,
  params: { scope?: string }
) {
  const { scope } = params

  // Validate client is authorized for client credentials
  if (client.clientType !== 'CONFIDENTIAL') {
    return NextResponse.json(
      { error: 'unauthorized_client', error_description: 'Client credentials grant requires confidential client' },
      { status: 400 }
    )
  }

  // Validate requested scopes
  const allowedScopes = Array.isArray(client.scopes) ? client.scopes : [client.scopes]
  let tokenScopes = scope ? scope.split(' ') : allowedScopes

  const invalidScopes = tokenScopes.filter((s: string) => !allowedScopes.includes(s))
  if (invalidScopes.length > 0) {
    return NextResponse.json(
      { error: 'invalid_scope', error_description: `Invalid scopes: ${invalidScopes.join(', ')}` },
      { status: 400 }
    )
  }

  // Generate access token (no user context for client credentials)
  const now = Math.floor(Date.now() / 1000)
  
  const accessToken = jwt.sign(
    {
      iss: JWT_ISSUER,
      aud: 'api://codai',
      sub: client.clientId, // Client is the subject for client credentials
      scope: tokenScopes.join(' '),
      client_id: client.clientId,
      iat: now,
      exp: now + ACCESS_TOKEN_EXPIRES_IN,
      jti: crypto.randomUUID(),
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  )

  // Store access token
  await prisma.accessToken.create({
    data: {
      token: crypto.createHash('sha256').update(accessToken).digest('hex'),
      clientId: client.clientId,
      userId: client.clientId, // Using client ID as user ID for M2M
      scopes: tokenScopes,
      expiresAt: new Date((now + ACCESS_TOKEN_EXPIRES_IN) * 1000),
    },
  })

  const tokenResponse = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: ACCESS_TOKEN_EXPIRES_IN,
    scope: tokenScopes.join(' '),
  }

  console.log(`OAuth2 client credentials tokens issued: client=${client.clientId}, scopes=${tokenScopes.join(' ')}`)

  return NextResponse.json(tokenResponse)
}
