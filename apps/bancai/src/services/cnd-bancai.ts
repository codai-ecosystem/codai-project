import { CND } from '../../../packages/cnd/dist/index.js';
import type {
    EnterpriseConfiguration,
    AuthenticationResult,
    ServiceDiscoveryEntry,
    AuditLogEntry,
    SystemMetrics
} from '../../../packages/cnd/dist/types.js';

// Banking-specific types
export interface BankAccount {
    id: string;
    userId: string;
    accountNumber: string;
    accountType: 'checking' | 'savings' | 'investment' | 'business';
    balance: number;
    currency: string;
    status: 'active' | 'suspended' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

export interface Transaction {
    id: string;
    fromAccountId: string;
    toAccountId?: string;
    type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'fee';
    amount: number;
    currency: string;
    description: string;
    reference: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    riskScore: number;
    complianceFlags: string[];
    createdAt: Date;
    processedAt?: Date;
}

export interface ComplianceAlert {
    id: string;
    transactionId?: string;
    accountId?: string;
    userId?: string;
    alertType: 'aml' | 'kyc' | 'fraud' | 'regulatory' | 'suspicious_activity';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    status: 'open' | 'investigating' | 'resolved' | 'false_positive';
    assignedTo?: string;
    createdAt: Date;
    resolvedAt?: Date;
}

export interface RiskAssessment {
    id: string;
    entityId: string;
    entityType: 'user' | 'transaction' | 'account';
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    factors: Array<{
        factor: string;
        weight: number;
        score: number;
        description: string;
    }>;
    recommendations: string[];
    validUntil: Date;
    createdAt: Date;
}

export interface LoanApplication {
    id: string;
    userId: string;
    loanType: 'personal' | 'mortgage' | 'business' | 'auto';
    requestedAmount: number;
    currency: string;
    purpose: string;
    status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
    creditScore?: number;
    riskAssessment?: RiskAssessment;
    documents: Array<{
        type: string;
        fileName: string;
        uploadedAt: Date;
        verified: boolean;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentMethod {
    id: string;
    userId: string;
    type: 'card' | 'bank_account' | 'digital_wallet' | 'crypto';
    provider: string;
    identifier: string; // masked card number, account number, etc.
    isDefault: boolean;
    isVerified: boolean;
    metadata: Record<string, any>;
    createdAt: Date;
    lastUsed?: Date;
}

export interface RegulatoryReport {
    id: string;
    reportType: 'ctr' | 'sar' | 'bsa' | 'kyc_summary' | 'quarterly_compliance';
    period: {
        start: Date;
        end: Date;
    };
    data: Record<string, any>;
    status: 'generating' | 'ready' | 'submitted' | 'acknowledged';
    filePath?: string;
    submittedAt?: Date;
    createdAt: Date;
}

/**
 * Comprehensive CND BancAI Service
 * Provides enterprise-grade banking services with CND database integration
 * Features: Account management, transaction processing, compliance monitoring,
 * risk assessment, loan processing, payment systems, regulatory reporting
 */
export class CNDBancAIService {
    private cnd: CND;
    private isInitialized = false;
    private config: EnterpriseConfiguration;

    constructor(config?: Partial<EnterpriseConfiguration>) {
        this.config = {
            host: process.env.CND_HOST || 'localhost',
            port: parseInt(process.env.CND_PORT || '5432'),
            database: process.env.CND_DATABASE || 'bancai_db',
            username: process.env.CND_USERNAME || 'bancai_user',
            password: process.env.CND_PASSWORD || 'bancai_password',
            ssl: process.env.NODE_ENV === 'production',
            poolSize: 20,
            enableAuditLogging: true,
            enableMetrics: true,
            enableAuthentication: true,
            enableServiceDiscovery: true,
            enableEncryption: true,
            complianceMode: 'strict',
            auditLevel: 'detailed',
            encryptionAlgorithm: 'AES-256-GCM',
            ...config
        };

        this.cnd = new CND(this.config);
    }

    /**
     * Initialize the BancAI service and create database schemas
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            // Connect to CND with enterprise features
            await this.cnd.connect();
            console.log('✅ CND BancAI Service connected');

            // Create banking schemas
            await this.createBankingSchemas();
            console.log('✅ Banking database schemas created');

            // Initialize enterprise features
            await this.initializeEnterpriseFeatures();
            console.log('✅ Enterprise features initialized');

            this.isInitialized = true;
            console.log('🏦 CND BancAI Service fully initialized');
        } catch (error) {
            console.error('❌ Failed to initialize CND BancAI Service:', error);
            throw error;
        }
    }

    /**
     * Create comprehensive banking database schemas
     */
    private async createBankingSchemas(): Promise<void> {
        const schemas = [
            // Bank Accounts table
            `
      CREATE TABLE IF NOT EXISTS bank_accounts (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(36) NOT NULL,
        account_number VARCHAR(20) UNIQUE NOT NULL,
        account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'investment', 'business')),
        balance DECIMAL(15,2) DEFAULT 0.00,
        currency VARCHAR(3) DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_accounts_user_id (user_id),
        INDEX idx_accounts_number (account_number),
        INDEX idx_accounts_status (status)
      )
      `,

            // Transactions table
            `
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        from_account_id VARCHAR(36) NOT NULL,
        to_account_id VARCHAR(36),
        transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer', 'payment', 'fee')),
        amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        description TEXT,
        reference VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        risk_score DECIMAL(5,2) DEFAULT 0.00,
        compliance_flags JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        processed_at TIMESTAMP,
        INDEX idx_transactions_from_account (from_account_id),
        INDEX idx_transactions_to_account (to_account_id),
        INDEX idx_transactions_status (status),
        INDEX idx_transactions_date (created_at),
        INDEX idx_transactions_risk (risk_score)
      )
      `,

            // Compliance Alerts table
            `
      CREATE TABLE IF NOT EXISTS compliance_alerts (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        transaction_id VARCHAR(36),
        account_id VARCHAR(36),
        user_id VARCHAR(36),
        alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('aml', 'kyc', 'fraud', 'regulatory', 'suspicious_activity')),
        severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'false_positive')),
        assigned_to VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolved_at TIMESTAMP,
        INDEX idx_alerts_type (alert_type),
        INDEX idx_alerts_severity (severity),
        INDEX idx_alerts_status (status),
        INDEX idx_alerts_user (user_id)
      )
      `,

            // Risk Assessments table
            `
      CREATE TABLE IF NOT EXISTS risk_assessments (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        entity_id VARCHAR(36) NOT NULL,
        entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('user', 'transaction', 'account')),
        risk_score DECIMAL(5,2) NOT NULL,
        risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'extreme')),
        risk_factors JSON,
        recommendations JSON,
        valid_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_risk_entity (entity_id, entity_type),
        INDEX idx_risk_score (risk_score),
        INDEX idx_risk_level (risk_level)
      )
      `,

            // Loan Applications table
            `
      CREATE TABLE IF NOT EXISTS loan_applications (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(36) NOT NULL,
        loan_type VARCHAR(20) NOT NULL CHECK (loan_type IN ('personal', 'mortgage', 'business', 'auto')),
        requested_amount DECIMAL(15,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        purpose TEXT,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected')),
        credit_score INTEGER,
        risk_assessment_id VARCHAR(36),
        documents JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_loans_user (user_id),
        INDEX idx_loans_type (loan_type),
        INDEX idx_loans_status (status)
      )
      `,

            // Payment Methods table
            `
      CREATE TABLE IF NOT EXISTS payment_methods (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id VARCHAR(36) NOT NULL,
        method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('card', 'bank_account', 'digital_wallet', 'crypto')),
        provider VARCHAR(50) NOT NULL,
        identifier VARCHAR(100) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        is_verified BOOLEAN DEFAULT FALSE,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_used TIMESTAMP,
        INDEX idx_payment_methods_user (user_id),
        INDEX idx_payment_methods_type (method_type)
      )
      `,

            // Regulatory Reports table
            `
      CREATE TABLE IF NOT EXISTS regulatory_reports (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        report_type VARCHAR(30) NOT NULL CHECK (report_type IN ('ctr', 'sar', 'bsa', 'kyc_summary', 'quarterly_compliance')),
        period_start TIMESTAMP NOT NULL,
        period_end TIMESTAMP NOT NULL,
        report_data JSON,
        status VARCHAR(20) DEFAULT 'generating' CHECK (status IN ('generating', 'ready', 'submitted', 'acknowledged')),
        file_path VARCHAR(255),
        submitted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_reports_type (report_type),
        INDEX idx_reports_period (period_start, period_end),
        INDEX idx_reports_status (status)
      )
      `
        ];

        for (const schema of schemas) {
            await this.cnd.sql().query(schema);
        }
    }

    /**
     * Initialize enterprise features for banking compliance
     */
    private async initializeEnterpriseFeatures(): Promise<void> {
        // Register BancAI service with service discovery
        if (this.cnd.serviceDiscovery) {
            await this.cnd.serviceDiscovery.registerService({
                id: 'bancai-service',
                name: 'BancAI Service',
                version: '1.0.0',
                host: 'localhost',
                port: 4005,
                protocol: 'http',
                tags: ['banking', 'ai', 'fintech', 'compliance'],
                metadata: {
                    capabilities: ['account_management', 'transaction_processing', 'compliance_monitoring', 'risk_assessment'],
                    compliance: ['PCI_DSS', 'SOX', 'AML', 'KYC'],
                    region: 'US',
                    environment: process.env.NODE_ENV || 'development'
                }
            });
        }

        // Initialize audit logging for banking operations
        if (this.cnd.auditLogger) {
            await this.cnd.auditLogger.initialize();
        }

        // Start metrics collection for banking performance
        if (this.cnd.metricsManager) {
            await this.cnd.metricsManager.initialize();
        }
    }

    // ===================
    // Account Management
    // ===================

    /**
     * Create a new bank account
     */
    async createAccount(account: Omit<BankAccount, 'id' | 'accountNumber' | 'createdAt' | 'updatedAt'>): Promise<BankAccount> {
        try {
            const accountNumber = this.generateAccountNumber();
            const now = new Date();

            const result = await this.cnd.sql().query(`
        INSERT INTO bank_accounts (user_id, account_number, account_type, balance, currency, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [account.userId, accountNumber, account.accountType, account.balance, account.currency, account.status, now, now]);

            const createdAccount = result.rows[0];

            // Log audit event
            await this.logAuditEvent('account_created', {
                accountId: createdAccount.id,
                userId: account.userId,
                accountType: account.accountType
            });

            return this.mapDbAccountToAccount(createdAccount);
        } catch (error) {
            console.error('Error creating account:', error);
            throw error;
        }
    }

    /**
     * Get account by ID
     */
    async getAccount(accountId: string): Promise<BankAccount | null> {
        try {
            const result = await this.cnd.sql().query(
                'SELECT * FROM bank_accounts WHERE id = $1',
                [accountId]
            );

            return result.rows.length > 0 ? this.mapDbAccountToAccount(result.rows[0]) : null;
        } catch (error) {
            console.error('Error getting account:', error);
            throw error;
        }
    }

    /**
     * Get accounts by user ID
     */
    async getAccountsByUser(userId: string): Promise<BankAccount[]> {
        try {
            const result = await this.cnd.sql().query(
                'SELECT * FROM bank_accounts WHERE user_id = $1 ORDER BY created_at DESC',
                [userId]
            );

            return result.rows.map(row => this.mapDbAccountToAccount(row));
        } catch (error) {
            console.error('Error getting user accounts:', error);
            throw error;
        }
    }

    /**
     * Update account balance
     */
    async updateAccountBalance(accountId: string, newBalance: number): Promise<BankAccount> {
        try {
            const result = await this.cnd.sql().query(`
        UPDATE bank_accounts 
        SET balance = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 
        RETURNING *
      `, [newBalance, accountId]);

            if (result.rows.length === 0) {
                throw new Error('Account not found');
            }

            // Log audit event
            await this.logAuditEvent('balance_updated', {
                accountId,
                newBalance
            });

            return this.mapDbAccountToAccount(result.rows[0]);
        } catch (error) {
            console.error('Error updating account balance:', error);
            throw error;
        }
    }

    // =======================
    // Transaction Processing
    // =======================

    /**
     * Process a transaction with compliance checks
     */
    async processTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'processedAt'>): Promise<Transaction> {
        try {
            // Perform risk assessment
            const riskScore = await this.assessTransactionRisk(transaction);

            // Check compliance
            const complianceFlags = await this.checkTransactionCompliance(transaction);

            // Create transaction record
            const now = new Date();
            const result = await this.cnd.sql().query(`
        INSERT INTO transactions (
          from_account_id, to_account_id, transaction_type, amount, currency,
          description, reference, status, risk_score, compliance_flags, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [
                transaction.fromAccountId,
                transaction.toAccountId,
                transaction.type,
                transaction.amount,
                transaction.currency,
                transaction.description,
                transaction.reference,
                transaction.status,
                riskScore,
                JSON.stringify(complianceFlags),
                now
            ]);

            const createdTransaction = this.mapDbTransactionToTransaction(result.rows[0]);

            // Process transaction based on risk and compliance
            if (riskScore < 50 && complianceFlags.length === 0) {
                await this.executeTransaction(createdTransaction.id);
            } else {
                await this.flagTransactionForReview(createdTransaction.id, riskScore, complianceFlags);
            }

            // Log audit event
            await this.logAuditEvent('transaction_processed', {
                transactionId: createdTransaction.id,
                amount: transaction.amount,
                riskScore,
                complianceFlags
            });

            return createdTransaction;
        } catch (error) {
            console.error('Error processing transaction:', error);
            throw error;
        }
    }

    /**
     * Execute a transaction (update balances)
     */
    async executeTransaction(transactionId: string): Promise<void> {
        try {
            const transaction = await this.getTransaction(transactionId);
            if (!transaction) {
                throw new Error('Transaction not found');
            }

            // Update account balances based on transaction type
            if (transaction.type === 'transfer' && transaction.toAccountId) {
                // Debit from source account
                const fromAccount = await this.getAccount(transaction.fromAccountId);
                if (!fromAccount) throw new Error('Source account not found');

                const newFromBalance = fromAccount.balance - transaction.amount;
                await this.updateAccountBalance(transaction.fromAccountId, newFromBalance);

                // Credit to destination account
                const toAccount = await this.getAccount(transaction.toAccountId);
                if (!toAccount) throw new Error('Destination account not found');

                const newToBalance = toAccount.balance + transaction.amount;
                await this.updateAccountBalance(transaction.toAccountId, newToBalance);
            }

            // Update transaction status
            await this.cnd.sql().query(`
        UPDATE transactions 
        SET status = 'completed', processed_at = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [transactionId]);

            // Log audit event
            await this.logAuditEvent('transaction_executed', {
                transactionId,
                amount: transaction.amount
            });
        } catch (error) {
            console.error('Error executing transaction:', error);
            throw error;
        }
    }

    /**
     * Get transaction by ID
     */
    async getTransaction(transactionId: string): Promise<Transaction | null> {
        try {
            const result = await this.cnd.sql().query(
                'SELECT * FROM transactions WHERE id = $1',
                [transactionId]
            );

            return result.rows.length > 0 ? this.mapDbTransactionToTransaction(result.rows[0]) : null;
        } catch (error) {
            console.error('Error getting transaction:', error);
            throw error;
        }
    }

    /**
     * Get transactions for an account
     */
    async getAccountTransactions(accountId: string, limit = 50): Promise<Transaction[]> {
        try {
            const result = await this.cnd.sql().query(`
        SELECT * FROM transactions 
        WHERE from_account_id = $1 OR to_account_id = $1 
        ORDER BY created_at DESC 
        LIMIT $2
      `, [accountId, limit]);

            return result.rows.map(row => this.mapDbTransactionToTransaction(row));
        } catch (error) {
            console.error('Error getting account transactions:', error);
            throw error;
        }
    }

    // ====================
    // Compliance & Risk
    // ====================

    /**
     * Assess transaction risk
     */
    async assessTransactionRisk(transaction: Partial<Transaction>): Promise<number> {
        let riskScore = 0;

        // Amount-based risk
        if (transaction.amount && transaction.amount > 10000) {
            riskScore += 20;
        }
        if (transaction.amount && transaction.amount > 50000) {
            riskScore += 30;
        }

        // Pattern-based risk (simplified)
        if (transaction.type === 'withdrawal' && transaction.amount && transaction.amount > 5000) {
            riskScore += 15;
        }

        return Math.min(riskScore, 100);
    }

    /**
     * Check transaction compliance
     */
    async checkTransactionCompliance(transaction: Partial<Transaction>): Promise<string[]> {
        const flags: string[] = [];

        // Large amount reporting
        if (transaction.amount && transaction.amount >= 10000) {
            flags.push('CTR_REQUIRED');
        }

        // Suspicious activity patterns
        if (transaction.amount && transaction.amount >= 5000 && transaction.type === 'withdrawal') {
            flags.push('LARGE_CASH_WITHDRAWAL');
        }

        return flags;
    }

    /**
     * Create compliance alert
     */
    async createComplianceAlert(alert: Omit<ComplianceAlert, 'id' | 'createdAt'>): Promise<ComplianceAlert> {
        try {
            const now = new Date();
            const result = await this.cnd.sql().query(`
        INSERT INTO compliance_alerts (
          transaction_id, account_id, user_id, alert_type, severity,
          description, status, assigned_to, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
                alert.transactionId,
                alert.accountId,
                alert.userId,
                alert.alertType,
                alert.severity,
                alert.description,
                alert.status,
                alert.assignedTo,
                now
            ]);

            return this.mapDbAlertToAlert(result.rows[0]);
        } catch (error) {
            console.error('Error creating compliance alert:', error);
            throw error;
        }
    }

    /**
     * Get compliance alerts
     */
    async getComplianceAlerts(filters: {
        status?: string;
        severity?: string;
        alertType?: string;
        limit?: number;
    } = {}): Promise<ComplianceAlert[]> {
        try {
            let query = 'SELECT * FROM compliance_alerts WHERE 1=1';
            const params: any[] = [];
            let paramCount = 0;

            if (filters.status) {
                query += ` AND status = $${++paramCount}`;
                params.push(filters.status);
            }
            if (filters.severity) {
                query += ` AND severity = $${++paramCount}`;
                params.push(filters.severity);
            }
            if (filters.alertType) {
                query += ` AND alert_type = $${++paramCount}`;
                params.push(filters.alertType);
            }

            query += ' ORDER BY created_at DESC';

            if (filters.limit) {
                query += ` LIMIT $${++paramCount}`;
                params.push(filters.limit);
            }

            const result = await this.cnd.sql().query(query, params);
            return result.rows.map(row => this.mapDbAlertToAlert(row));
        } catch (error) {
            console.error('Error getting compliance alerts:', error);
            throw error;
        }
    }

    // =====================
    // Reporting & Analytics
    // =====================

    /**
     * Generate regulatory report
     */
    async generateRegulatoryReport(
        reportType: RegulatoryReport['reportType'],
        period: { start: Date; end: Date }
    ): Promise<RegulatoryReport> {
        try {
            const reportData = await this.gatherReportData(reportType, period);

            const result = await this.cnd.sql().query(`
        INSERT INTO regulatory_reports (
          report_type, period_start, period_end, report_data, status, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [
                reportType,
                period.start,
                period.end,
                JSON.stringify(reportData),
                'ready',
                new Date()
            ]);

            return this.mapDbReportToReport(result.rows[0]);
        } catch (error) {
            console.error('Error generating regulatory report:', error);
            throw error;
        }
    }

    /**
     * Get banking statistics
     */
    async getBankingStats(): Promise<Record<string, any>> {
        try {
            const [accountStats, transactionStats, complianceStats] = await Promise.all([
                this.cnd.sql().query(`
          SELECT 
            COUNT(*) as total_accounts,
            SUM(balance) as total_balance,
            AVG(balance) as average_balance,
            account_type,
            COUNT(*) as count_by_type
          FROM bank_accounts 
          WHERE status = 'active'
          GROUP BY account_type
        `),
                this.cnd.sql().query(`
          SELECT 
            COUNT(*) as total_transactions,
            SUM(amount) as total_volume,
            AVG(amount) as average_amount,
            status,
            COUNT(*) as count_by_status
          FROM transactions 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY status
        `),
                this.cnd.sql().query(`
          SELECT 
            COUNT(*) as total_alerts,
            severity,
            alert_type,
            status,
            COUNT(*) as count
          FROM compliance_alerts 
          WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
          GROUP BY severity, alert_type, status
        `)
            ]);

            return {
                accounts: accountStats.rows,
                transactions: transactionStats.rows,
                compliance: complianceStats.rows,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting banking statistics:', error);
            throw error;
        }
    }

    /**
     * Get BancAI service health status
     */
    async getHealthStatus(): Promise<Record<string, any>> {
        try {
            const [dbHealth, serviceHealth, complianceHealth] = await Promise.all([
                this.cnd.getHealthStatus(),
                this.checkServiceHealth(),
                this.checkComplianceHealth()
            ]);

            return {
                service: 'BancAI',
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: dbHealth,
                serviceChecks: serviceHealth,
                compliance: complianceHealth,
                version: '1.0.0',
                uptime: process.uptime()
            };
        } catch (error) {
            console.error('Error getting health status:', error);
            return {
                service: 'BancAI',
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    // =================
    // Helper Methods
    // =================

    private generateAccountNumber(): string {
        return Math.random().toString().substr(2, 10);
    }

    private async flagTransactionForReview(transactionId: string, riskScore: number, complianceFlags: string[]): Promise<void> {
        await this.createComplianceAlert({
            transactionId,
            alertType: 'suspicious_activity',
            severity: riskScore > 70 ? 'high' : 'medium',
            description: `Transaction flagged for review. Risk score: ${riskScore}, Flags: ${complianceFlags.join(', ')}`,
            status: 'open'
        });
    }

    private async gatherReportData(reportType: string, period: { start: Date; end: Date }): Promise<Record<string, any>> {
        // Simplified report data gathering
        const transactionData = await this.cnd.sql().query(`
      SELECT * FROM transactions 
      WHERE created_at BETWEEN $1 AND $2
    `, [period.start, period.end]);

        return {
            reportType,
            period,
            transactionCount: transactionData.rows.length,
            totalVolume: transactionData.rows.reduce((sum, t) => sum + parseFloat(t.amount), 0),
            generatedAt: new Date().toISOString()
        };
    }

    private async checkServiceHealth(): Promise<Record<string, any>> {
        return {
            databaseConnected: this.isInitialized,
            enterpriseFeaturesEnabled: true,
            complianceMode: this.config.complianceMode
        };
    }

    private async checkComplianceHealth(): Promise<Record<string, any>> {
        const openAlerts = await this.cnd.sql().query(
            "SELECT COUNT(*) as count FROM compliance_alerts WHERE status = 'open'"
        );

        return {
            openAlerts: parseInt(openAlerts.rows[0].count),
            lastComplianceCheck: new Date().toISOString(),
            complianceStatus: 'monitoring'
        };
    }

    private async logAuditEvent(action: string, details: Record<string, any>): Promise<void> {
        try {
            if (this.cnd.auditLogger) {
                await this.cnd.auditLogger.logAction({
                    action,
                    details,
                    timestamp: new Date(),
                    service: 'bancai'
                });
            }
        } catch (error) {
            console.error('Error logging audit event:', error);
        }
    }

    // Database mapping methods
    private mapDbAccountToAccount(dbRow: any): BankAccount {
        return {
            id: dbRow.id,
            userId: dbRow.user_id,
            accountNumber: dbRow.account_number,
            accountType: dbRow.account_type,
            balance: parseFloat(dbRow.balance),
            currency: dbRow.currency,
            status: dbRow.status,
            createdAt: new Date(dbRow.created_at),
            updatedAt: new Date(dbRow.updated_at)
        };
    }

    private mapDbTransactionToTransaction(dbRow: any): Transaction {
        return {
            id: dbRow.id,
            fromAccountId: dbRow.from_account_id,
            toAccountId: dbRow.to_account_id,
            type: dbRow.transaction_type,
            amount: parseFloat(dbRow.amount),
            currency: dbRow.currency,
            description: dbRow.description,
            reference: dbRow.reference,
            status: dbRow.status,
            riskScore: parseFloat(dbRow.risk_score),
            complianceFlags: JSON.parse(dbRow.compliance_flags || '[]'),
            createdAt: new Date(dbRow.created_at),
            processedAt: dbRow.processed_at ? new Date(dbRow.processed_at) : undefined
        };
    }

    private mapDbAlertToAlert(dbRow: any): ComplianceAlert {
        return {
            id: dbRow.id,
            transactionId: dbRow.transaction_id,
            accountId: dbRow.account_id,
            userId: dbRow.user_id,
            alertType: dbRow.alert_type,
            severity: dbRow.severity,
            description: dbRow.description,
            status: dbRow.status,
            assignedTo: dbRow.assigned_to,
            createdAt: new Date(dbRow.created_at),
            resolvedAt: dbRow.resolved_at ? new Date(dbRow.resolved_at) : undefined
        };
    }

    private mapDbReportToReport(dbRow: any): RegulatoryReport {
        return {
            id: dbRow.id,
            reportType: dbRow.report_type,
            period: {
                start: new Date(dbRow.period_start),
                end: new Date(dbRow.period_end)
            },
            data: JSON.parse(dbRow.report_data || '{}'),
            status: dbRow.status,
            filePath: dbRow.file_path,
            submittedAt: dbRow.submitted_at ? new Date(dbRow.submitted_at) : undefined,
            createdAt: new Date(dbRow.created_at)
        };
    }
}

export default CNDBancAIService;
