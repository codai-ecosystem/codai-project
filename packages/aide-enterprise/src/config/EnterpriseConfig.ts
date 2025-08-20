/**
 * Enterprise Configuration Management
 * Centralized configuration for all enterprise features
 */

export interface EnterpriseConfig {
  sso: {
    enabled: boolean
    provider: 'azure-ad' | 'google' | 'okta' | 'saml'
    clientId: string
    clientSecret: string
    tenantId?: string
    callbackUrl: string
    scopes: string[]
    autoProvision: boolean
    roleMapping: Record<string, string>
  }
  rbac: {
    enabled: boolean
    defaultRole: string
    allowRoleInheritance: boolean
    policyEngine: boolean
    auditChanges: boolean
    policies: string[] // Policy file paths
  }
  audit: {
    enabled: boolean
    retention: {
      days: number
      maxEvents: number
    }
    compliance: {
      gdpr: boolean
      hipaa: boolean
      sox: boolean
      pci_dss: boolean
      iso27001: boolean
    }
    exportFormats: ('json' | 'csv' | 'pdf')[]
    realTimeAlerts: boolean
    webhooks: {
      url: string
      events: string[]
      secret: string
    }[]
  }
  ai: {
    enabled: boolean
    provider: 'openai' | 'azure-openai' | 'anthropic'
    apiKey: string
    model: string
    features: {
      codeGeneration: boolean
      codeAnalysis: boolean
      documentation: boolean
      testing: boolean
      optimization: boolean
    }
    limits: {
      requestsPerMinute: number
      tokensPerRequest: number
      dailyUsage: number
    }
  }
  security: {
    encryption: {
      algorithm: string
      keySize: number
      keyRotation: boolean
      keyRotationDays: number
    }
    session: {
      timeout: number
      maxSessions: number
      secureCookies: boolean
    }
    rateLimit: {
      enabled: boolean
      requests: number
      window: number
    }
    cors: {
      enabled: boolean
      origins: string[]
      methods: string[]
    }
  }
  monitoring: {
    enabled: boolean
    metrics: {
      performance: boolean
      usage: boolean
      errors: boolean
      business: boolean
    }
    alerting: {
      email: string[]
      slack?: string
      teams?: string
    }
    retention: {
      metrics: number
      logs: number
    }
  }
  deployment: {
    multiCloud: {
      enabled: boolean
      providers: ('aws' | 'azure' | 'gcp')[]
      strategy: 'primary-backup' | 'load-balanced' | 'geo-distributed'
    }
    cicd: {
      provider: 'github' | 'gitlab' | 'jenkins' | 'azure-devops'
      approvalWorkflow: boolean
      testGates: boolean
      rollbackStrategy: 'immediate' | 'gradual' | 'blue-green'
    }
    scaling: {
      autoScale: boolean
      minInstances: number
      maxInstances: number
      targetCPU: number
    }
  }
}

export class EnterpriseConfigManager {
  private config: EnterpriseConfig
  private configPath: string
  private watchers: Map<string, Function[]> = new Map()

  constructor(configPath: string = './enterprise.config.json') {
    this.configPath = configPath
    this.config = this.loadConfig()
    this.validateConfig()
  }

  /**
   * Load configuration from file or environment
   */
  private loadConfig(): EnterpriseConfig {
    try {
      // Try loading from file first
      if (typeof window === 'undefined') {
        const fs = require('fs')
        if (fs.existsSync(this.configPath)) {
          const fileContent = fs.readFileSync(this.configPath, 'utf8')
          const fileConfig = JSON.parse(fileContent)
          return this.mergeWithEnvVars(fileConfig)
        }
      }
    } catch (error) {
      console.warn('Failed to load config file, using defaults:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Fallback to environment variables and defaults
    return this.getDefaultConfig()
  }

  /**
   * Merge file config with environment variables
   */
  private mergeWithEnvVars(fileConfig: Partial<EnterpriseConfig>): EnterpriseConfig {
    const envConfig = {
      sso: {
        enabled: process.env.SSO_ENABLED === 'true',
        provider: (process.env.SSO_PROVIDER || 'azure-ad') as 'azure-ad' | 'google' | 'okta' | 'saml',
        clientId: process.env.SSO_CLIENT_ID || '',
        clientSecret: process.env.SSO_CLIENT_SECRET || '',
        tenantId: process.env.SSO_TENANT_ID,
        callbackUrl: process.env.SSO_CALLBACK_URL || '',
        scopes: (process.env.SSO_SCOPES || 'openid,profile,email').split(','),
        autoProvision: process.env.SSO_AUTO_PROVISION === 'true',
        roleMapping: JSON.parse(process.env.SSO_ROLE_MAPPING || '{}')
      },
      ai: {
        enabled: process.env.AI_ENABLED !== 'false',
        provider: (process.env.AI_PROVIDER || 'openai') as 'openai' | 'azure-openai' | 'anthropic',
        apiKey: process.env.AI_API_KEY || '',
        model: process.env.AI_MODEL || 'gpt-4-turbo',
        features: {
          codeGeneration: process.env.AI_CODE_GENERATION !== 'false',
          codeAnalysis: process.env.AI_CODE_ANALYSIS !== 'false',
          documentation: process.env.AI_DOCUMENTATION !== 'false',
          testing: process.env.AI_TESTING !== 'false',
          optimization: process.env.AI_OPTIMIZATION !== 'false'
        },
        limits: {
          requestsPerMinute: parseInt(process.env.AI_RATE_LIMIT_RPM || '60'),
          tokensPerRequest: parseInt(process.env.AI_TOKEN_LIMIT || '4000'),
          dailyUsage: parseInt(process.env.AI_DAILY_LIMIT || '100000')
        }
      }
    }

    return this.deepMerge(this.getDefaultConfig(), fileConfig, envConfig)
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): EnterpriseConfig {
    return {
      sso: {
        enabled: false,
        provider: 'azure-ad',
        clientId: '',
        clientSecret: '',
        callbackUrl: '/auth/callback',
        scopes: ['openid', 'profile', 'email'],
        autoProvision: true,
        roleMapping: {
          'Global Administrator': 'system-admin',
          'Application Administrator': 'org-admin',
          'User Administrator': 'org-admin',
          'Developer': 'developer'
        }
      },
      rbac: {
        enabled: true,
        defaultRole: 'viewer',
        allowRoleInheritance: true,
        policyEngine: true,
        auditChanges: true,
        policies: []
      },
      audit: {
        enabled: true,
        retention: {
          days: 365,
          maxEvents: 1000000
        },
        compliance: {
          gdpr: false,
          hipaa: false,
          sox: false,
          pci_dss: false,
          iso27001: true
        },
        exportFormats: ['json', 'csv'],
        realTimeAlerts: true,
        webhooks: []
      },
      ai: {
        enabled: true,
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4-turbo',
        features: {
          codeGeneration: true,
          codeAnalysis: true,
          documentation: true,
          testing: true,
          optimization: true
        },
        limits: {
          requestsPerMinute: 60,
          tokensPerRequest: 4000,
          dailyUsage: 100000
        }
      },
      security: {
        encryption: {
          algorithm: 'aes-256-gcm',
          keySize: 256,
          keyRotation: true,
          keyRotationDays: 90
        },
        session: {
          timeout: 24 * 60 * 60 * 1000, // 24 hours
          maxSessions: 5,
          secureCookies: true
        },
        rateLimit: {
          enabled: true,
          requests: 1000,
          window: 15 * 60 * 1000 // 15 minutes
        },
        cors: {
          enabled: true,
          origins: ['http://localhost:3000', 'https://*.aide.dev'],
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
        }
      },
      monitoring: {
        enabled: true,
        metrics: {
          performance: true,
          usage: true,
          errors: true,
          business: true
        },
        alerting: {
          email: []
        },
        retention: {
          metrics: 90, // days
          logs: 30 // days
        }
      },
      deployment: {
        multiCloud: {
          enabled: false,
          providers: ['aws'],
          strategy: 'primary-backup'
        },
        cicd: {
          provider: 'github',
          approvalWorkflow: true,
          testGates: true,
          rollbackStrategy: 'gradual'
        },
        scaling: {
          autoScale: true,
          minInstances: 1,
          maxInstances: 10,
          targetCPU: 70
        }
      }
    }
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    const errors: string[] = []

    // SSO validation
    if (this.config.sso.enabled) {
      if (!this.config.sso.clientId) {
        errors.push('SSO client ID is required when SSO is enabled')
      }
      if (!this.config.sso.clientSecret) {
        errors.push('SSO client secret is required when SSO is enabled')
      }
    }

    // AI validation
    if (this.config.ai.enabled) {
      if (!this.config.ai.apiKey) {
        errors.push('AI API key is required when AI features are enabled')
      }
    }

    // Security validation
    if (this.config.security.session.timeout < 60000) {
      errors.push('Session timeout must be at least 1 minute')
    }

    if (errors.length > 0) {
      throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
    }
  }

  /**
   * Get configuration value
   */
  get<T = any>(path: string): T {
    return this.getNestedValue(this.config, path)
  }

  /**
   * Set configuration value
   */
  set(path: string, value: any): void {
    this.setNestedValue(this.config, path, value)
    this.notifyWatchers(path, value)
  }

  /**
   * Watch for configuration changes
   */
  watch(path: string, callback: Function): () => void {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, [])
    }
    this.watchers.get(path)!.push(callback)

    // Return unwatch function
    return () => {
      const callbacks = this.watchers.get(path) || []
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * Save configuration to file
   */
  save(): void {
    try {
      if (typeof window === 'undefined') {
        const fs = require('fs')
        const configJson = JSON.stringify(this.config, null, 2)
        fs.writeFileSync(this.configPath, configJson, 'utf8')
        console.log('Configuration saved successfully')
      }
    } catch (error) {
      console.error('Failed to save configuration:', error)
      throw new Error('Configuration save failed')
    }
  }

  /**
   * Reload configuration from file
   */
  reload(): void {
    try {
      this.config = this.loadConfig()
      this.validateConfig()
      this.notifyWatchers('*', this.config)
      console.log('Configuration reloaded successfully')
    } catch (error) {
      console.error('Failed to reload configuration:', error)
      throw new Error('Configuration reload failed')
    }
  }

  // Private helper methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  private notifyWatchers(path: string, value: any): void {
    // Notify specific path watchers
    this.watchers.get(path)?.forEach(callback => callback(value, path))

    // Notify wildcard watchers
    this.watchers.get('*')?.forEach(callback => callback(value, path))
  }

  private deepMerge(...objects: any[]): any {
    return objects.reduce((prev, obj) => {
      Object.keys(obj || {}).forEach(key => {
        const pVal = prev[key]
        const oVal = obj[key]

        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = pVal.concat(...oVal)
        } else if (pVal && oVal && typeof pVal === 'object' && typeof oVal === 'object') {
          prev[key] = this.deepMerge(pVal, oVal)
        } else {
          prev[key] = oVal
        }
      })
      return prev
    }, {})
  }
}

// Global configuration instance
export const enterpriseConfig = new EnterpriseConfigManager()

export default enterpriseConfig
