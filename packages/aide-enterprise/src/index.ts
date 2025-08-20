/**
 * @aide/enterprise - Enterprise features for AIDE
 * SSO, RBAC, Audit, AI Code Assistant, and Configuration Management
 */

// Core Services
export { default as EnterpriseSSO, requireAuth } from './sso/SSOService'
export type { SSOConfig, SSOSession, SSOProvider } from './sso/SSOService'

export { default as AdvancedRBAC } from './rbac/RBACService'
export type { Role, Permission, User as RBACUser, AccessContext, AccessDecision } from './rbac/RBACService'

export { default as AuditService } from './audit/AuditService'
export type { AuditEvent, AuditQuery } from './audit/AuditService'

export { default as AICodeAssistant } from './ai/AICodeAssistant'
export type { CodeContext, CodeSuggestion, CodeAnalysis } from './ai/AICodeAssistant'

export { EnterpriseConfigManager, enterpriseConfig } from './config/EnterpriseConfig'
export type { EnterpriseConfig } from './config/EnterpriseConfig'

// React Components (when using with Next.js/React)
export { default as EnterpriseDashboard } from './components/EnterpriseDashboard'

// Utilities and Types
export * from './types'
export * from './utils'

// Version
export const VERSION = '1.0.0'

// Default exports for convenience
export default {
  EnterpriseSSO,
  AdvancedRBAC,
  AuditService,
  AICodeAssistant,
  EnterpriseConfigManager,
  enterpriseConfig
}
