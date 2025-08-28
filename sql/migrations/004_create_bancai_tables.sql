-- CODAI BancAI Service Schema - Migration 004
-- Create financial services and wallet management tables  
-- Date: 2025-08-27
-- Version: 1.0.0

-- Wallets for financial management
CREATE TABLE codai_bancai.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL, -- References codai_auth.users(id)
    name VARCHAR(100) NOT NULL,
    wallet_type VARCHAR(50) DEFAULT 'standard' CHECK (wallet_type IN ('standard', 'savings', 'business', 'escrow')),
    currency VARCHAR(3) DEFAULT 'USD' CHECK (LENGTH(currency) = 3),
    balance DECIMAL(20,8) DEFAULT 0.00000000 CHECK (balance >= 0),
    available_balance DECIMAL(20,8) DEFAULT 0.00000000 CHECK (available_balance >= 0),
    reserved_balance DECIMAL(20,8) DEFAULT 0.00000000 CHECK (reserved_balance >= 0),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'closed', 'suspended')),
    minimum_balance DECIMAL(20,8) DEFAULT 0.00000000,
    maximum_balance DECIMAL(20,8),
    daily_limit DECIMAL(20,8),
    monthly_limit DECIMAL(20,8),
    multi_sig_required BOOLEAN DEFAULT FALSE,
    required_signatures INTEGER DEFAULT 1,
    authorized_signers JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Transactions for all wallet operations
CREATE TABLE codai_bancai.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('transfer', 'deposit', 'withdrawal', 'fee', 'reward', 'refund', 'adjustment')),
    from_wallet_id UUID REFERENCES codai_bancai.wallets(id),
    to_wallet_id UUID REFERENCES codai_bancai.wallets(id),
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    fee_amount DECIMAL(20,8) DEFAULT 0.00000000,
    currency VARCHAR(3) NOT NULL CHECK (LENGTH(currency) = 3),
    exchange_rate DECIMAL(20,8) DEFAULT 1.00000000,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'expired')),
    reference_id VARCHAR(255), -- External reference
    description TEXT,
    category VARCHAR(100),
    signature_count INTEGER DEFAULT 0,
    required_signatures INTEGER DEFAULT 1,
    signatures JSONB DEFAULT '[]',
    authorization_data JSONB DEFAULT '{}',
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    compliance_status VARCHAR(50) DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'approved', 'flagged', 'blocked')),
    compliance_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- Transaction signatures for multi-sig support
CREATE TABLE codai_bancai.transaction_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES codai_bancai.transactions(id) ON DELETE CASCADE,
    signer_user_id UUID NOT NULL, -- References codai_auth.users(id)
    signature_hash VARCHAR(255) NOT NULL,
    signature_algorithm VARCHAR(50) DEFAULT 'RS256',
    signed_at TIMESTAMP DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    UNIQUE(transaction_id, signer_user_id)
);

-- Account balances history for auditing
CREATE TABLE codai_bancai.balance_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES codai_bancai.wallets(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES codai_bancai.transactions(id),
    balance_before DECIMAL(20,8) NOT NULL,
    balance_after DECIMAL(20,8) NOT NULL,
    balance_change DECIMAL(20,8) NOT NULL,
    operation_type VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- Recurring payments and subscriptions
CREATE TABLE codai_bancai.recurring_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_wallet_id UUID NOT NULL REFERENCES codai_bancai.wallets(id) ON DELETE CASCADE,
    to_wallet_id UUID NOT NULL REFERENCES codai_bancai.wallets(id) ON DELETE CASCADE,
    amount DECIMAL(20,8) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL CHECK (LENGTH(currency) = 3),
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    next_payment_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    description TEXT,
    payment_count INTEGER DEFAULT 0,
    max_payments INTEGER,
    last_payment_id UUID REFERENCES codai_bancai.transactions(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Wallet permissions for shared wallets
CREATE TABLE codai_bancai.wallet_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES codai_bancai.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- References codai_auth.users(id)
    permission_level VARCHAR(20) DEFAULT 'view' CHECK (permission_level IN ('view', 'transact', 'manage', 'admin')),
    can_view_balance BOOLEAN DEFAULT TRUE,
    can_view_transactions BOOLEAN DEFAULT TRUE,
    can_create_transactions BOOLEAN DEFAULT FALSE,
    can_approve_transactions BOOLEAN DEFAULT FALSE,
    can_manage_permissions BOOLEAN DEFAULT FALSE,
    daily_transaction_limit DECIMAL(20,8),
    granted_by UUID, -- References codai_auth.users(id)
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    UNIQUE(wallet_id, user_id)
);

-- Compliance and audit trails
CREATE TABLE codai_bancai.compliance_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('wallet', 'transaction', 'user')),
    entity_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'approved', 'flagged', 'blocked')),
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    flags JSONB DEFAULT '[]',
    reviewer_notes TEXT,
    reviewed_by VARCHAR(100),
    reviewed_at TIMESTAMP,
    auto_generated BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Payment methods integration
CREATE TABLE codai_bancai.payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES codai_bancai.wallets(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL CHECK (method_type IN ('bank_account', 'credit_card', 'debit_card', 'paypal', 'stripe', 'crypto')),
    provider VARCHAR(100) NOT NULL,
    external_id VARCHAR(255) NOT NULL,
    display_name VARCHAR(200),
    last_four VARCHAR(4),
    expires_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'blocked')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wallets_user_id ON codai_bancai.wallets(user_id);
CREATE INDEX idx_wallets_status ON codai_bancai.wallets(status);
CREATE INDEX idx_wallets_currency ON codai_bancai.wallets(currency);

CREATE INDEX idx_transactions_from_wallet ON codai_bancai.transactions(from_wallet_id);
CREATE INDEX idx_transactions_to_wallet ON codai_bancai.transactions(to_wallet_id);
CREATE INDEX idx_transactions_status ON codai_bancai.transactions(status);
CREATE INDEX idx_transactions_type ON codai_bancai.transactions(transaction_type);
CREATE INDEX idx_transactions_created_at ON codai_bancai.transactions(created_at);
CREATE INDEX idx_transactions_reference_id ON codai_bancai.transactions(reference_id);

CREATE INDEX idx_transaction_signatures_transaction_id ON codai_bancai.transaction_signatures(transaction_id);
CREATE INDEX idx_transaction_signatures_signer ON codai_bancai.transaction_signatures(signer_user_id);

CREATE INDEX idx_balance_history_wallet_id ON codai_bancai.balance_history(wallet_id);
CREATE INDEX idx_balance_history_transaction_id ON codai_bancai.balance_history(transaction_id);
CREATE INDEX idx_balance_history_recorded_at ON codai_bancai.balance_history(recorded_at);

CREATE INDEX idx_recurring_payments_from_wallet ON codai_bancai.recurring_payments(from_wallet_id);
CREATE INDEX idx_recurring_payments_next_payment ON codai_bancai.recurring_payments(next_payment_date);
CREATE INDEX idx_recurring_payments_status ON codai_bancai.recurring_payments(status);

CREATE INDEX idx_wallet_permissions_wallet_id ON codai_bancai.wallet_permissions(wallet_id);
CREATE INDEX idx_wallet_permissions_user_id ON codai_bancai.wallet_permissions(user_id);

CREATE INDEX idx_compliance_reports_entity ON codai_bancai.compliance_reports(entity_type, entity_id);
CREATE INDEX idx_compliance_reports_status ON codai_bancai.compliance_reports(status);
CREATE INDEX idx_compliance_reports_risk_score ON codai_bancai.compliance_reports(risk_score);

CREATE INDEX idx_payment_methods_wallet_id ON codai_bancai.payment_methods(wallet_id);
CREATE INDEX idx_payment_methods_type ON codai_bancai.payment_methods(method_type);
CREATE INDEX idx_payment_methods_provider ON codai_bancai.payment_methods(provider);

-- Create partitioned tables for high-volume data - Skip if TimescaleDB not available
-- SELECT create_hypertable('codai_bancai.transactions', 'created_at', chunk_time_interval => INTERVAL '1 month');
-- SELECT create_hypertable('codai_bancai.balance_history', 'recorded_at', chunk_time_interval => INTERVAL '1 month');

-- Update triggers
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON codai_bancai.wallets
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_recurring_payments_updated_at BEFORE UPDATE ON codai_bancai.recurring_payments
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at BEFORE UPDATE ON codai_bancai.payment_methods
    FOR EACH ROW EXECUTE FUNCTION codai_auth.update_updated_at_column();

-- Constraints to ensure data integrity
ALTER TABLE codai_bancai.wallets ADD CONSTRAINT chk_wallet_balance_consistency 
    CHECK (balance = available_balance + reserved_balance);

-- Function to update wallet balances
CREATE OR REPLACE FUNCTION codai_bancai.update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert balance history record
    INSERT INTO codai_bancai.balance_history (
        wallet_id, 
        transaction_id, 
        balance_before, 
        balance_after, 
        balance_change, 
        operation_type
    ) 
    SELECT 
        COALESCE(NEW.from_wallet_id, NEW.to_wallet_id),
        NEW.id,
        COALESCE(w.balance, 0),
        CASE 
            WHEN NEW.from_wallet_id IS NOT NULL AND NEW.to_wallet_id IS NOT NULL THEN
                -- Transfer: subtract from source, add to destination
                CASE WHEN w.id = NEW.from_wallet_id THEN w.balance - NEW.amount
                     WHEN w.id = NEW.to_wallet_id THEN w.balance + NEW.amount
                     ELSE w.balance END
            WHEN NEW.from_wallet_id IS NULL THEN w.balance + NEW.amount -- Deposit
            WHEN NEW.to_wallet_id IS NULL THEN w.balance - NEW.amount   -- Withdrawal
            ELSE w.balance
        END,
        CASE 
            WHEN NEW.from_wallet_id IS NOT NULL AND NEW.to_wallet_id IS NOT NULL THEN
                CASE WHEN w.id = NEW.from_wallet_id THEN -NEW.amount
                     WHEN w.id = NEW.to_wallet_id THEN NEW.amount
                     ELSE 0 END
            WHEN NEW.from_wallet_id IS NULL THEN NEW.amount  -- Deposit
            WHEN NEW.to_wallet_id IS NULL THEN -NEW.amount   -- Withdrawal
            ELSE 0
        END,
        'transaction'
    FROM codai_bancai.wallets w 
    WHERE w.id IN (NEW.from_wallet_id, NEW.to_wallet_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for balance updates on completed transactions
CREATE TRIGGER trigger_update_wallet_balance 
    AFTER UPDATE ON codai_bancai.transactions
    FOR EACH ROW 
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION codai_bancai.update_wallet_balance();

-- Insert migration record
INSERT INTO public.schema_migrations (version, name, applied_at)
VALUES ('004', 'create_bancai_tables', NOW())
ON CONFLICT (version) DO NOTHING;

-- Success message
SELECT 'BancAI service schema created successfully' as status;