#!/usr/bin/env node

/**
 * Comprehensive CND BancAI Service Demo
 * Tests all banking functionality including account management, 
 * transaction processing, compliance monitoring, and reporting
 */

const API_BASE = 'http://localhost:4005/api';

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Helper function for colored console output
function colorLog(color, message) {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// API helper function
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${data.error || data.message}`);
        }

        return data;
    } catch (error) {
        throw new Error(`Network Error: ${error.message}`);
    }
}

// Test functions
async function testHealthCheck() {
    colorLog('cyan', '\n🏥 Testing BancAI Service Health...');

    try {
        const health = await apiCall('/health');

        if (health.status === 'healthy') {
            colorLog('green', '✅ BancAI Service is healthy');
            colorLog('blue', `   Database: ${health.database?.status || 'unknown'}`);
            colorLog('blue', `   Enterprise Features: ${health.enterpriseFeatures?.authentication ? 'enabled' : 'disabled'}`);
            colorLog('blue', `   Compliance Mode: ${health.enterpriseFeatures?.complianceMode || 'unknown'}`);
            colorLog('blue', `   Uptime: ${Math.round(health.performance?.uptime || 0)}s`);
            return true;
        } else {
            colorLog('red', '❌ BancAI Service is unhealthy');
            colorLog('red', `   Error: ${health.error?.message || 'Unknown error'}`);
            return false;
        }
    } catch (error) {
        colorLog('red', `❌ Health check failed: ${error.message}`);
        return false;
    }
}

async function testAccountManagement() {
    colorLog('cyan', '\n🏦 Testing Account Management...');

    try {
        // Create test account
        const newAccount = await apiCall('/banking/accounts', {
            method: 'POST',
            body: JSON.stringify({
                userId: 'test-user-001',
                accountType: 'checking',
                currency: 'USD',
                initialBalance: 5000.00
            })
        });

        if (newAccount.success) {
            colorLog('green', '✅ Account created successfully');
            colorLog('blue', `   Account ID: ${newAccount.data.id}`);
            colorLog('blue', `   Account Number: ${newAccount.data.accountNumber}`);
            colorLog('blue', `   Balance: $${newAccount.data.balance}`);

            // Test account retrieval
            const accountDetails = await apiCall(`/banking/accounts/${newAccount.data.id}`);
            if (accountDetails.success) {
                colorLog('green', '✅ Account retrieval successful');
                colorLog('blue', `   Account Type: ${accountDetails.data.account.accountType}`);
                colorLog('blue', `   Status: ${accountDetails.data.account.status}`);
            }

            return newAccount.data;
        } else {
            colorLog('red', '❌ Account creation failed');
            return null;
        }
    } catch (error) {
        colorLog('red', `❌ Account management test failed: ${error.message}`);
        return null;
    }
}

async function testTransactionProcessing(fromAccount) {
    colorLog('cyan', '\n💸 Testing Transaction Processing...');

    if (!fromAccount) {
        colorLog('yellow', '⚠️ No account available for transaction testing');
        return false;
    }

    try {
        // Create a second account for transfer testing
        const toAccount = await apiCall('/banking/accounts', {
            method: 'POST',
            body: JSON.stringify({
                userId: 'test-user-002',
                accountType: 'savings',
                currency: 'USD',
                initialBalance: 1000.00
            })
        });

        if (!toAccount.success) {
            colorLog('red', '❌ Could not create destination account');
            return false;
        }

        // Test deposit transaction
        const deposit = await apiCall('/banking/transactions', {
            method: 'POST',
            body: JSON.stringify({
                fromAccountId: fromAccount.id,
                type: 'deposit',
                amount: 500.00,
                currency: 'USD',
                description: 'Test deposit transaction'
            })
        });

        if (deposit.success) {
            colorLog('green', '✅ Deposit transaction processed');
            colorLog('blue', `   Transaction ID: ${deposit.data.id}`);
            colorLog('blue', `   Amount: $${deposit.data.amount}`);
            colorLog('blue', `   Status: ${deposit.data.status}`);
            colorLog('blue', `   Risk Score: ${deposit.data.riskScore}`);
        }

        // Test transfer transaction
        const transfer = await apiCall('/banking/transactions', {
            method: 'POST',
            body: JSON.stringify({
                fromAccountId: fromAccount.id,
                toAccountId: toAccount.data.id,
                type: 'transfer',
                amount: 750.00,
                currency: 'USD',
                description: 'Test transfer transaction'
            })
        });

        if (transfer.success) {
            colorLog('green', '✅ Transfer transaction processed');
            colorLog('blue', `   Transaction ID: ${transfer.data.id}`);
            colorLog('blue', `   Amount: $${transfer.data.amount}`);
            colorLog('blue', `   Status: ${transfer.data.status}`);
            colorLog('blue', `   Risk Score: ${transfer.data.riskScore}`);
            colorLog('blue', `   Compliance Flags: ${transfer.data.complianceFlags.length}`);
        }

        // Test large withdrawal (should trigger compliance flags)
        const withdrawal = await apiCall('/banking/transactions', {
            method: 'POST',
            body: JSON.stringify({
                fromAccountId: fromAccount.id,
                type: 'withdrawal',
                amount: 8500.00,
                currency: 'USD',
                description: 'Large cash withdrawal test'
            })
        });

        if (withdrawal.success) {
            colorLog('green', '✅ Large withdrawal processed (compliance testing)');
            colorLog('blue', `   Transaction ID: ${withdrawal.data.id}`);
            colorLog('blue', `   Amount: $${withdrawal.data.amount}`);
            colorLog('blue', `   Status: ${withdrawal.data.status}`);
            colorLog('blue', `   Risk Score: ${withdrawal.data.riskScore}`);
            colorLog('blue', `   Compliance Flags: ${withdrawal.data.complianceFlags.join(', ')}`);
        }

        return true;
    } catch (error) {
        colorLog('red', `❌ Transaction processing test failed: ${error.message}`);
        return false;
    }
}

async function testComplianceMonitoring() {
    colorLog('cyan', '\n🛡️ Testing Compliance Monitoring...');

    try {
        // Create a test compliance alert
        const alert = await apiCall('/banking/compliance', {
            method: 'POST',
            body: JSON.stringify({
                alertType: 'suspicious_activity',
                severity: 'high',
                description: 'Test suspicious activity alert for demo purposes',
                userId: 'test-user-001'
            })
        });

        if (alert.success) {
            colorLog('green', '✅ Compliance alert created');
            colorLog('blue', `   Alert ID: ${alert.data.id}`);
            colorLog('blue', `   Type: ${alert.data.alertType}`);
            colorLog('blue', `   Severity: ${alert.data.severity}`);
            colorLog('blue', `   Status: ${alert.data.status}`);
        }

        // Retrieve compliance data
        const compliance = await apiCall('/banking/compliance');

        if (compliance.success) {
            colorLog('green', '✅ Compliance data retrieved');
            colorLog('blue', `   Total Alerts: ${compliance.data.statistics.totalAlerts}`);
            colorLog('blue', `   Critical Alerts: ${compliance.data.statistics.criticalAlerts}`);
            colorLog('blue', `   Open Alerts: ${compliance.data.statistics.openAlerts}`);
            colorLog('blue', `   Resolved Alerts: ${compliance.data.statistics.resolvedAlerts}`);
        }

        return true;
    } catch (error) {
        colorLog('red', `❌ Compliance monitoring test failed: ${error.message}`);
        return false;
    }
}

async function testRegulatoryReporting() {
    colorLog('cyan', '\n📊 Testing Regulatory Reporting...');

    try {
        // Generate a test regulatory report
        const report = await apiCall('/banking/reports', {
            method: 'POST',
            body: JSON.stringify({
                reportType: 'quarterly_compliance',
                periodStart: '2024-01-01',
                periodEnd: '2024-03-31'
            })
        });

        if (report.success) {
            colorLog('green', '✅ Regulatory report generated');
            colorLog('blue', `   Report ID: ${report.data.id}`);
            colorLog('blue', `   Type: ${report.data.reportType}`);
            colorLog('blue', `   Status: ${report.data.status}`);
            colorLog('blue', `   Period: ${report.data.period.start} to ${report.data.period.end}`);
        }

        // Test report types listing
        const reportTypes = await apiCall('/banking/reports');

        if (reportTypes.success) {
            colorLog('green', '✅ Report types retrieved');
            colorLog('blue', `   Available Types: ${reportTypes.data.availableReportTypes.join(', ')}`);
        }

        return true;
    } catch (error) {
        colorLog('red', `❌ Regulatory reporting test failed: ${error.message}`);
        return false;
    }
}

async function testBankingAnalytics() {
    colorLog('cyan', '\n📈 Testing Banking Analytics...');

    try {
        // Get comprehensive analytics
        const analytics = await apiCall('/banking/analytics');

        if (analytics.success) {
            colorLog('green', '✅ Banking analytics retrieved');
            colorLog('blue', `   Total Accounts: ${analytics.data.accounts.total}`);
            colorLog('blue', `   Total Balance: $${analytics.data.accounts.totalBalance.toFixed(2)}`);
            colorLog('blue', `   Total Transactions: ${analytics.data.transactions.total}`);
            colorLog('blue', `   Transaction Volume: $${analytics.data.transactions.totalVolume.toFixed(2)}`);
            colorLog('blue', `   Compliance Alerts: ${analytics.data.compliance.totalAlerts}`);
            colorLog('blue', `   Service Health: ${analytics.data.performance.serviceHealth}`);
        }

        // Test custom analytics
        const customAnalytics = await apiCall('/banking/analytics', {
            method: 'POST',
            body: JSON.stringify({
                reportType: 'account_performance',
                dateRange: '30d',
                filters: { accountType: 'checking' }
            })
        });

        if (customAnalytics.success) {
            colorLog('green', '✅ Custom analytics generated');
            colorLog('blue', `   Report Type: ${customAnalytics.data.reportType}`);
            colorLog('blue', `   Summary: ${customAnalytics.data.summary}`);
        }

        return true;
    } catch (error) {
        colorLog('red', `❌ Banking analytics test failed: ${error.message}`);
        return false;
    }
}

async function testAdvancedHealthCheck() {
    colorLog('cyan', '\n🔍 Testing Advanced Health Diagnostics...');

    try {
        // Test compliance check
        const complianceCheck = await apiCall('/health', {
            method: 'POST',
            body: JSON.stringify({ action: 'compliance_check' })
        });

        if (complianceCheck.action === 'compliance_check') {
            colorLog('green', '✅ Compliance health check completed');
            colorLog('blue', `   Total Alerts: ${complianceCheck.result.totalAlerts}`);
            colorLog('blue', `   Critical Alerts: ${complianceCheck.result.criticalAlerts}`);
            colorLog('blue', `   Open Alerts: ${complianceCheck.result.openAlerts}`);
        }

        // Test full diagnostic
        const diagnostic = await apiCall('/health', {
            method: 'POST',
            body: JSON.stringify({ action: 'full_diagnostic' })
        });

        if (diagnostic.action === 'full_diagnostic') {
            colorLog('green', '✅ Full diagnostic completed');
            colorLog('blue', `   Health Status: ${diagnostic.result.health.status}`);
            colorLog('blue', `   Database Status: ${diagnostic.result.health.database?.status}`);
        }

        return true;
    } catch (error) {
        colorLog('red', `❌ Advanced health check failed: ${error.message}`);
        return false;
    }
}

// Main demo execution
async function main() {
    colorLog('bright', '🏦 CND BancAI Service Comprehensive Demo');
    colorLog('bright', '==========================================\n');

    const results = {
        healthCheck: false,
        accountManagement: false,
        transactionProcessing: false,
        complianceMonitoring: false,
        regulatoryReporting: false,
        bankingAnalytics: false,
        advancedDiagnostics: false
    };

    let createdAccount = null;

    // Execute all tests
    results.healthCheck = await testHealthCheck();

    if (results.healthCheck) {
        createdAccount = await testAccountManagement();
        results.accountManagement = !!createdAccount;

        results.transactionProcessing = await testTransactionProcessing(createdAccount);
        results.complianceMonitoring = await testComplianceMonitoring();
        results.regulatoryReporting = await testRegulatoryReporting();
        results.bankingAnalytics = await testBankingAnalytics();
        results.advancedDiagnostics = await testAdvancedHealthCheck();
    }

    // Display final results
    colorLog('bright', '\n📋 Demo Results Summary');
    colorLog('bright', '========================');

    const testCategories = [
        { name: 'Health Check', key: 'healthCheck', icon: '🏥' },
        { name: 'Account Management', key: 'accountManagement', icon: '🏦' },
        { name: 'Transaction Processing', key: 'transactionProcessing', icon: '💸' },
        { name: 'Compliance Monitoring', key: 'complianceMonitoring', icon: '🛡️' },
        { name: 'Regulatory Reporting', key: 'regulatoryReporting', icon: '📊' },
        { name: 'Banking Analytics', key: 'bankingAnalytics', icon: '📈' },
        { name: 'Advanced Diagnostics', key: 'advancedDiagnostics', icon: '🔍' }
    ];

    let passedTests = 0;
    testCategories.forEach(test => {
        const status = results[test.key];
        const statusText = status ? 'PASS' : 'FAIL';
        const color = status ? 'green' : 'red';

        colorLog(color, `${test.icon} ${test.name}: ${statusText}`);
        if (status) passedTests++;
    });

    const successRate = Math.round((passedTests / testCategories.length) * 100);
    colorLog('bright', `\n🎯 Overall Success Rate: ${passedTests}/${testCategories.length} (${successRate}%)`);

    if (successRate >= 85) {
        colorLog('green', '🎉 CND BancAI Service integration successful!');
        colorLog('green', '✅ Enterprise banking capabilities fully operational');
    } else if (successRate >= 70) {
        colorLog('yellow', '⚠️ CND BancAI Service partially operational');
        colorLog('yellow', '🔧 Some features may need configuration');
    } else {
        colorLog('red', '❌ CND BancAI Service integration issues detected');
        colorLog('red', '🚨 Review service configuration and dependencies');
    }

    colorLog('bright', '\n🏦 BancAI Demo completed successfully!');
}

// Export for module usage
export { main };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        colorLog('red', `\n❌ Demo failed: ${error.message}`);
        process.exit(1);
    });
}
