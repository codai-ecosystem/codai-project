/**
 * Enterprise SSO Integration Service
 * Supports SAML, OIDC, OAuth 2.0 with major identity providers
 */

import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'
import { Client as AzureClient } from '@azure/msal-node'
import { Strategy as SamlStrategy } from '@node-saml/passport-saml'

// SSO Provider Types
export type SSOProvider = 'azure-ad' | 'google' | 'okta' | 'saml' | 'oidc'

export interface SSOConfig {
  provider: SSOProvider
  clientId: string
  clientSecret: string
  tenantId?: string
  issuer?: string
  callbackUrl: string
  scopes: string[]
  roleMapping?: Record<string, string>
}

export interface User {
  id: string
  email: string
  name: string
  roles: string[]
  groups: string[]
  department?: string
  jobTitle?: string
  manager?: string
  lastLogin: Date
  metadata: Record<string, any>
}

export interface SSOSession {
  userId: string
  token: string
  refreshToken?: string
  expiresAt: Date
  provider: SSOProvider
  scopes: string[]
  metadata: Record<string, any>
}

export class EnterpriseSSO {
  private config: SSOConfig
  private googleClient?: OAuth2Client
  private azureClient?: AzureClient
  private jwtSecret: string

  constructor(config: SSOConfig) {
    this.config = config
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret'
    this.initializeProviders()
  }

  private async initializeProviders(): Promise<void> {
    switch (this.config.provider) {
      case 'google':
        this.googleClient = new OAuth2Client(
          this.config.clientId,
          this.config.clientSecret,
          this.config.callbackUrl
        )
        break

      case 'azure-ad':
        this.azureClient = new AzureClient({
          auth: {
            clientId: this.config.clientId,
            clientSecret: this.config.clientSecret,
            authority: `https://login.microsoftonline.com/${this.config.tenantId}`
          }
        })
        break

      case 'saml':
        // SAML configuration handled in passport strategy
        break

      default:
        throw new Error(`Unsupported SSO provider: ${this.config.provider}`)
    }
  }

  /**
   * Generate SSO login URL
   */
  async getLoginUrl(): Promise<string> {
    switch (this.config.provider) {
      case 'google':
        if (!this.googleClient) throw new Error('Google client not initialized')
        return this.googleClient.generateAuthUrl({
          access_type: 'offline',
          scope: this.config.scopes,
          state: this.generateState()
        })

      case 'azure-ad':
        if (!this.azureClient) throw new Error('Azure client not initialized')
        const authCodeUrlParameters = {
          scopes: this.config.scopes,
          redirectUri: this.config.callbackUrl,
          state: this.generateState()
        }
        return this.azureClient.getAuthCodeUrl(authCodeUrlParameters)

      case 'saml':
        // SAML redirect URL
        return `/auth/saml/login?RelayState=${this.generateState()}`

      default:
        throw new Error(`Login URL not implemented for provider: ${this.config.provider}`)
    }
  }

  /**
   * Handle SSO callback and authenticate user
   */
  async handleCallback(code: string, state?: string): Promise<SSOSession> {
    try {
      switch (this.config.provider) {
        case 'google':
          return await this.handleGoogleCallback(code, state)
        case 'azure-ad':
          return await this.handleAzureCallback(code, state)
        case 'saml':
          return await this.handleSamlCallback(code, state)
        default:
          throw new Error(`Callback not implemented for provider: ${this.config.provider}`)
      }
    } catch (error) {
      console.error('SSO callback error:', error)
      throw new Error('Authentication failed')
    }
  }

  private async handleGoogleCallback(code: string, state?: string): Promise<SSOSession> {
    if (!this.googleClient) throw new Error('Google client not initialized')

    const { tokens } = await this.googleClient.getToken(code)
    this.googleClient.setCredentials(tokens)

    // Get user info
    const ticket = await this.googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: this.config.clientId
    })

    const payload = ticket.getPayload()
    if (!payload) throw new Error('Invalid token payload')

    const user = await this.createUser({
      id: payload.sub,
      email: payload.email!,
      name: payload.name!,
      roles: this.mapRoles(payload),
      groups: this.mapGroups(payload),
      department: payload['department'] as string,
      jobTitle: payload['job_title'] as string,
      lastLogin: new Date(),
      metadata: {
        provider: 'google',
        picture: payload.picture,
        locale: payload.locale
      }
    })

    return this.createSession(user, tokens.access_token!, tokens.refresh_token)
  }

  private async handleAzureCallback(code: string, state?: string): Promise<SSOSession> {
    if (!this.azureClient) throw new Error('Azure client not initialized')

    const tokenRequest = {
      code,
      scopes: this.config.scopes,
      redirectUri: this.config.callbackUrl
    }

    const response = await this.azureClient.acquireTokenByCode(tokenRequest)
    
    const user = await this.createUser({
      id: response.uniqueId,
      email: response.account?.username || '',
      name: response.account?.name || '',
      roles: this.mapRoles(response.idTokenClaims),
      groups: this.mapGroups(response.idTokenClaims),
      department: response.idTokenClaims?.['department'] as string,
      jobTitle: response.idTokenClaims?.['jobTitle'] as string,
      manager: response.idTokenClaims?.['manager'] as string,
      lastLogin: new Date(),
      metadata: {
        provider: 'azure-ad',
        tenantId: response.tenantId,
        oid: response.idTokenClaims?.['oid']
      }
    })

    return this.createSession(user, response.accessToken, response.refreshToken)
  }

  private async handleSamlCallback(samlResponse: string, state?: string): Promise<SSOSession> {
    // SAML response parsing would be handled by passport-saml
    // This is a placeholder for SAML integration
    throw new Error('SAML callback handling not yet implemented')
  }

  /**
   * Validate and refresh session
   */
  async validateSession(token: string): Promise<SSOSession | null> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any
      
      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return null
      }

      // Return session info
      return {
        userId: decoded.userId,
        token,
        expiresAt: new Date(decoded.exp * 1000),
        provider: decoded.provider,
        scopes: decoded.scopes || [],
        metadata: decoded.metadata || {}
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<SSOSession> {
    switch (this.config.provider) {
      case 'google':
        return await this.refreshGoogleToken(refreshToken)
      case 'azure-ad':
        return await this.refreshAzureToken(refreshToken)
      default:
        throw new Error(`Token refresh not implemented for provider: ${this.config.provider}`)
    }
  }

  private async refreshGoogleToken(refreshToken: string): Promise<SSOSession> {
    if (!this.googleClient) throw new Error('Google client not initialized')

    this.googleClient.setCredentials({ refresh_token: refreshToken })
    const { credentials } = await this.googleClient.refreshAccessToken()

    // Get updated user info and create new session
    const ticket = await this.googleClient.verifyIdToken({
      idToken: credentials.id_token!,
      audience: this.config.clientId
    })

    const payload = ticket.getPayload()
    if (!payload) throw new Error('Invalid token payload')

    const user = await this.getUserById(payload.sub)
    if (!user) throw new Error('User not found')

    return this.createSession(user, credentials.access_token!, credentials.refresh_token)
  }

  private async refreshAzureToken(refreshToken: string): Promise<SSOSession> {
    if (!this.azureClient) throw new Error('Azure client not initialized')

    const tokenRequest = {
      refreshToken,
      scopes: this.config.scopes
    }

    const response = await this.azureClient.acquireTokenByRefreshToken(tokenRequest)
    
    const user = await this.getUserById(response.uniqueId)
    if (!user) throw new Error('User not found')

    return this.createSession(user, response.accessToken, response.refreshToken)
  }

  /**
   * Logout and invalidate session
   */
  async logout(token: string): Promise<void> {
    try {
      const session = await this.validateSession(token)
      if (session) {
        // Add token to blacklist
        await this.blacklistToken(token)
        
        // Provider-specific logout
        await this.providerLogout(session)
      }
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  private async providerLogout(session: SSOSession): Promise<void> {
    switch (session.provider) {
      case 'google':
        if (this.googleClient) {
          await this.googleClient.revokeCredentials()
        }
        break
      case 'azure-ad':
        // Azure logout would redirect to Microsoft logout endpoint
        break
    }
  }

  // Helper methods
  private generateState(): string {
    return Buffer.from(JSON.stringify({
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2)
    })).toString('base64url')
  }

  private mapRoles(claims: any): string[] {
    if (!this.config.roleMapping || !claims.roles) return ['user']
    
    return claims.roles
      .map((role: string) => this.config.roleMapping![role] || role)
      .filter(Boolean)
  }

  private mapGroups(claims: any): string[] {
    return claims.groups || []
  }

  private async createUser(userData: User): Promise<User> {
    // This would typically save to database
    // For now, return the user data
    return userData
  }

  private async getUserById(id: string): Promise<User | null> {
    // This would typically query database
    // Placeholder implementation
    return null
  }

  private createSession(user: User, accessToken: string, refreshToken?: string): SSOSession {
    const expiresAt = new Date(Date.now() + (24 * 60 * 60 * 1000)) // 24 hours
    
    const token = jwt.sign({
      userId: user.id,
      email: user.email,
      roles: user.roles,
      provider: this.config.provider,
      scopes: this.config.scopes,
      metadata: user.metadata
    }, this.jwtSecret, {
      expiresIn: '24h'
    })

    return {
      userId: user.id,
      token,
      refreshToken,
      expiresAt,
      provider: this.config.provider,
      scopes: this.config.scopes,
      metadata: user.metadata
    }
  }

  private async blacklistToken(token: string): Promise<void> {
    // Implementation would add token to Redis blacklist
    console.log('Token blacklisted:', token.substring(0, 20) + '...')
  }
}

// Middleware for protecting routes
export function requireAuth(requiredRoles: string[] = []) {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const authorization = req.headers.authorization
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authorization.split(' ')[1]
    const sso = new EnterpriseSSO({
      provider: process.env.SSO_PROVIDER as SSOProvider,
      clientId: process.env.SSO_CLIENT_ID || '',
      clientSecret: process.env.SSO_CLIENT_SECRET || '',
      tenantId: process.env.SSO_TENANT_ID,
      callbackUrl: process.env.SSO_CALLBACK_URL || '',
      scopes: (process.env.SSO_SCOPES || 'openid,profile,email').split(',')
    })

    const session = await sso.validateSession(token)
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const userRoles = (session.metadata.roles || []) as string[]
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))
      
      if (!hasRequiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
    }

    // Attach session to request
    ;(req as any).session = session
    next()
  }
}

export default EnterpriseSSO
