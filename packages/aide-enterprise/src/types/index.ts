// Enterprise type definitions

export interface User {
  id: string
  email: string
  name: string
  roles: string[]
  groups: string[]
  metadata: Record<string, any>
}

export interface Role {
  id: string
  name: string
  permissions: string[]
  isSystemRole: boolean
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface AuditEvent {
  id: string
  type: string
  userId: string
  timestamp: Date
  details: Record<string, any>
}

export interface SSOSession {
  userId: string
  token: string
  provider: string
  expiresAt: Date
}

export type SSOProvider = 'azure-ad' | 'google' | 'okta' | 'saml'

export type ThreatLevel = 'low' | 'medium' | 'high'
