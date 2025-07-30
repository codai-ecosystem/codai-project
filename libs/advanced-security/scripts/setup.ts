/**
 * CODAI Advanced Security Library Setup Script
 * Automated setup and configuration for the security system
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface SecurityConfig {
  jwtSecret: string;
  jwtRefreshSecret: string;
  masterEncryptionKey: string;
  environment: 'development' | 'staging' | 'production';
  monitoring: {
    enabled: boolean;
    alertThresholds: {
      criticalEvents: number;
      highEvents: number;
      bruteForceAttempts: number;
    };
  };
  compliance: {
    enabledFrameworks: string[];
    assessmentFrequency: 'monthly' | 'quarterly' | 'annually';
  };
  encryption: {
    keyRotationInterval: number; // days
    backupEncryption: boolean;
  };
}

class SecuritySetup {
  private configPath: string;
  private keysPath: string;

  constructor() {
    this.configPath = path.join(__dirname, '../config');
    this.keysPath = path.join(__dirname, '../keys');
  }

  /**
   * Initialize the security system
   */
  async initialize(): Promise<void> {
    console.log('🔐 Initializing CODAI Advanced Security System...');

    try {
      // Create necessary directories
      await this.createDirectories();

      // Generate security configuration
      const config = await this.generateSecurityConfig();

      // Save configuration
      await this.saveConfiguration(config);

      // Generate encryption keys
      await this.generateEncryptionKeys(config);

      // Create database schemas (if needed)
      await this.setupDatabase();

      // Initialize compliance frameworks
      await this.initializeCompliance();

      // Setup monitoring
      await this.setupMonitoring();

      console.log('✅ Security system initialization completed successfully!');
      console.log('\n📋 Next Steps:');
      console.log('1. Review the generated configuration in config/security.json');
      console.log('2. Secure the encryption keys in the keys/ directory');
      console.log('3. Configure your database connection');
      console.log('4. Set up notification channels for security alerts');
      console.log('5. Run compliance assessments for your required frameworks');

    } catch (error) {
      console.error('❌ Security system initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create necessary directories
   */
  private async createDirectories(): Promise<void> {
    const dirs = [
      this.configPath,
      this.keysPath,
      path.join(__dirname, '../logs'),
      path.join(__dirname, '../backups'),
      path.join(__dirname, '../certificates'),
      path.join(__dirname, '../reports')
    ];

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  /**
   * Generate security configuration
   */
  private async generateSecurityConfig(): Promise<SecurityConfig> {
    const environment = (process.env.NODE_ENV as any) || 'development';

    const config: SecurityConfig = {
      jwtSecret: this.generateSecureSecret(64),
      jwtRefreshSecret: this.generateSecureSecret(64),
      masterEncryptionKey: this.generateSecureSecret(32),
      environment,
      monitoring: {
        enabled: true,
        alertThresholds: {
          criticalEvents: 1,
          highEvents: 5,
          bruteForceAttempts: 10
        }
      },
      compliance: {
        enabledFrameworks: ['gdpr', 'iso_27001'],
        assessmentFrequency: 'quarterly'
      },
      encryption: {
        keyRotationInterval: 90,
        backupEncryption: true
      }
    };

    // Adjust for production
    if (environment === 'production') {
      config.monitoring.alertThresholds.criticalEvents = 1;
      config.monitoring.alertThresholds.highEvents = 3;
      config.monitoring.alertThresholds.bruteForceAttempts = 5;
      config.encryption.keyRotationInterval = 30;
    }

    return config;
  }

  /**
   * Save configuration to file
   */
  private async saveConfiguration(config: SecurityConfig): Promise<void> {
    const configFile = path.join(this.configPath, 'security.json');

    // Create a public version without secrets
    const publicConfig = {
      ...config,
      jwtSecret: '[REDACTED]',
      jwtRefreshSecret: '[REDACTED]',
      masterEncryptionKey: '[REDACTED]'
    };

    fs.writeFileSync(configFile, JSON.stringify(publicConfig, null, 2));
    console.log(`⚙️ Configuration saved to: ${configFile}`);

    // Save environment variables template
    const envTemplate = `# CODAI Advanced Security Environment Variables
NODE_ENV=${config.environment}
JWT_SECRET=${config.jwtSecret}
JWT_REFRESH_SECRET=${config.jwtRefreshSecret}
MASTER_ENCRYPTION_KEY=${config.masterEncryptionKey}

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/codai_security
REDIS_URL=redis://localhost:6379

# Monitoring Configuration
SECURITY_MONITORING_ENABLED=${config.monitoring.enabled}
ALERT_EMAIL=security@codai.com
ALERT_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Compliance Configuration
ENABLED_FRAMEWORKS=${config.compliance.enabledFrameworks.join(',')}
ASSESSMENT_FREQUENCY=${config.compliance.assessmentFrequency}

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
`;

    const envFile = path.join(this.configPath, '.env.security.template');
    fs.writeFileSync(envFile, envTemplate);
    console.log(`📄 Environment template saved to: ${envFile}`);
  }

  /**
   * Generate encryption keys
   */
  private async generateEncryptionKeys(config: SecurityConfig): Promise<void> {
    // Generate RSA key pair for asymmetric encryption
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Save RSA keys
    fs.writeFileSync(path.join(this.keysPath, 'rsa_public.pem'), publicKey);
    fs.writeFileSync(path.join(this.keysPath, 'rsa_private.pem'), privateKey);

    // Generate additional symmetric keys
    const keys = {
      dataEncryption: this.generateSecureSecret(32),
      tokenSigning: this.generateSecureSecret(64),
      sessionEncryption: this.generateSecureSecret(32),
      backupEncryption: config.encryption.backupEncryption ? this.generateSecureSecret(32) : null
    };

    fs.writeFileSync(
      path.join(this.keysPath, 'symmetric_keys.json'),
      JSON.stringify(keys, null, 2)
    );

    // Set restrictive permissions on key files
    this.setSecurePermissions(this.keysPath);

    console.log('🔑 Encryption keys generated and secured');
  }

  /**
   * Setup database schemas
   */
  private async setupDatabase(): Promise<void> {
    const sqlScript = `
-- CODAI Advanced Security Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS security_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL,
    mfa_secret VARCHAR(255),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS security_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    hierarchy INTEGER NOT NULL,
    permissions JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Security events table
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    source VARCHAR(100) NOT NULL,
    user_id UUID,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolved_by UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance frameworks table
CREATE TABLE IF NOT EXISTS compliance_frameworks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    enabled BOOLEAN DEFAULT TRUE,
    last_assessment TIMESTAMP,
    compliance_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance assessments table
CREATE TABLE IF NOT EXISTS compliance_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    framework_id VARCHAR(50) NOT NULL,
    assessment_type VARCHAR(20) NOT NULL,
    assessor VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    overall_score INTEGER,
    executive_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Encryption keys table
CREATE TABLE IF NOT EXISTS encryption_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_id VARCHAR(100) UNIQUE NOT NULL,
    algorithm VARCHAR(50) NOT NULL,
    purposes TEXT[],
    key_data BYTEA NOT NULL,
    expires_at TIMESTAMP,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON security_users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON security_users(username);

-- Insert default roles
INSERT INTO security_roles (id, name, description, hierarchy, permissions) VALUES
    (gen_random_uuid(), 'Administrator', 'System administrator with full access', 0, '{"*": ["*"]}'),
    (gen_random_uuid(), 'Developer', 'Developer with code access', 2, '{"code": ["read", "create", "update"], "deployment": ["execute"]}'),
    (gen_random_uuid(), 'User', 'Standard user with basic permissions', 3, '{"profile": ["read", "update"]}')
ON CONFLICT (name) DO NOTHING;
`;

    const schemaFile = path.join(this.configPath, 'database_schema.sql');
    fs.writeFileSync(schemaFile, sqlScript);
    console.log(`🗄️ Database schema saved to: ${schemaFile}`);
  }

  /**
   * Initialize compliance frameworks
   */
  private async initializeCompliance(): Promise<void> {
    const complianceConfig = {
      frameworks: {
        gdpr: {
          enabled: true,
          assessmentSchedule: 'quarterly',
          requirementCategories: [
            'Lawful Basis',
            'Individual Rights',
            'Data Protection by Design',
            'Security of Processing'
          ]
        },
        hipaa: {
          enabled: false,
          assessmentSchedule: 'annually',
          requirementCategories: [
            'Administrative Safeguards',
            'Physical Safeguards',
            'Technical Safeguards'
          ]
        },
        sox: {
          enabled: false,
          assessmentSchedule: 'quarterly',
          requirementCategories: [
            'Financial Reporting',
            'Internal Controls',
            'Audit Requirements'
          ]
        },
        pci_dss: {
          enabled: false,
          assessmentSchedule: 'annually',
          requirementCategories: [
            'Network Security',
            'Data Protection',
            'Access Control',
            'Monitoring'
          ]
        },
        iso_27001: {
          enabled: true,
          assessmentSchedule: 'annually',
          requirementCategories: [
            'Information Security Policies',
            'Organization of Information Security',
            'Human Resource Security',
            'Asset Management',
            'Access Control',
            'Cryptography',
            'Physical and Environmental Security',
            'Operations Security',
            'Communications Security',
            'System Acquisition',
            'Supplier Relationships',
            'Information Security Incident Management',
            'Business Continuity',
            'Compliance'
          ]
        }
      }
    };

    const complianceFile = path.join(this.configPath, 'compliance.json');
    fs.writeFileSync(complianceFile, JSON.stringify(complianceConfig, null, 2));
    console.log(`📋 Compliance configuration saved to: ${complianceFile}`);
  }

  /**
   * Setup monitoring configuration
   */
  private async setupMonitoring(): Promise<void> {
    const monitoringConfig = {
      alertRules: [
        {
          name: 'Critical Security Events',
          eventTypes: ['DATA_BREACH_ATTEMPT', 'MALWARE_DETECTED', 'PRIVILEGE_ESCALATION'],
          severity: 'CRITICAL',
          notificationChannels: ['email', 'webhook'],
          cooldownPeriod: 5
        },
        {
          name: 'Brute Force Attacks',
          eventTypes: ['BRUTE_FORCE_ATTEMPT'],
          severity: 'HIGH',
          notificationChannels: ['email'],
          cooldownPeriod: 30
        },
        {
          name: 'Suspicious Activity',
          eventTypes: ['SUSPICIOUS_ACTIVITY', 'ANOMALY_DETECTED'],
          severity: 'MEDIUM',
          notificationChannels: ['email'],
          cooldownPeriod: 60
        }
      ],
      threatPatterns: [
        {
          name: 'SQL Injection Patterns',
          patterns: ['union.*select', 'drop.*table', '1=1', 'or.*1.*=.*1'],
          severity: 'HIGH'
        },
        {
          name: 'XSS Patterns',
          patterns: ['<script', 'javascript:', 'onerror=', 'onload='],
          severity: 'HIGH'
        },
        {
          name: 'Path Traversal Patterns',
          patterns: ['\\.\\./\\.\\.', '/etc/passwd', '/windows/system32'],
          severity: 'MEDIUM'
        }
      ],
      metrics: {
        retentionPeriod: 365, // days
        aggregationIntervals: ['hour', 'day', 'week', 'month'],
        dashboardRefreshInterval: 60 // seconds
      }
    };

    const monitoringFile = path.join(this.configPath, 'monitoring.json');
    fs.writeFileSync(monitoringFile, JSON.stringify(monitoringConfig, null, 2));
    console.log(`📊 Monitoring configuration saved to: ${monitoringFile}`);
  }

  /**
   * Generate secure random secret
   */
  private generateSecureSecret(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Set secure file permissions
   */
  private setSecurePermissions(dirPath: string): void {
    try {
      // On Unix-like systems, set restrictive permissions
      if (process.platform !== 'win32') {
        const files = fs.readdirSync(dirPath);
        files.forEach(file => {
          const filePath = path.join(dirPath, file);
          fs.chmodSync(filePath, 0o600); // Read/write for owner only
        });
        fs.chmodSync(dirPath, 0o700); // Read/write/execute for owner only
      }
    } catch (error) {
      console.warn('Warning: Could not set secure file permissions:', error);
    }
  }

  /**
   * Validate setup
   */
  async validateSetup(): Promise<boolean> {
    console.log('🔍 Validating security setup...');

    const checks = [
      { name: 'Configuration files', check: () => fs.existsSync(path.join(this.configPath, 'security.json')) },
      { name: 'Encryption keys', check: () => fs.existsSync(path.join(this.keysPath, 'rsa_private.pem')) },
      { name: 'Database schema', check: () => fs.existsSync(path.join(this.configPath, 'database_schema.sql')) },
      { name: 'Compliance config', check: () => fs.existsSync(path.join(this.configPath, 'compliance.json')) },
      { name: 'Monitoring config', check: () => fs.existsSync(path.join(this.configPath, 'monitoring.json')) }
    ];

    let allPassed = true;
    for (const check of checks) {
      const passed = check.check();
      console.log(`${passed ? '✅' : '❌'} ${check.name}`);
      if (!passed) allPassed = false;
    }

    return allPassed;
  }
}

// Export setup function
export async function setupSecurity(): Promise<void> {
  const setup = new SecuritySetup();
  await setup.initialize();

  const isValid = await setup.validateSetup();
  if (!isValid) {
    throw new Error('Security setup validation failed');
  }
}

// Run setup if called directly
if (require.main === module) {
  setupSecurity()
    .then(() => {
      console.log('🎉 Security setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Security setup failed:', error);
      process.exit(1);
    });
}

export default SecuritySetup;
