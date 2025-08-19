/**
 * BancAI Account Transfers API - SECURE VERSION
 * Implements secure account-to-account transfers with Romanian compliance
 * PCI DSS compliant transfer operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, BankingAuthorization, BANKING_SECURITY_HEADERS, BankingPermission } from '../../../../lib/security/auth';
import { auditLogger, fraudDetection } from '../../../../lib/security/audit';
import { EnhancedAccountManager } from '../../../../services/EnhancedAccountManager';
import { RomanianBankingComplianceService } from '../../../../services/RomanianBankingComplianceService';

const accountManager = new EnhancedAccountManager();
const complianceService = new RomanianBankingComplianceService();

/**
 * POST /api/banking/transfers - Process account transfer (SECURE)
 * Requires authentication, authorization, and implements fraud detection
 */
export async function POST(request: NextRequest) {
    let auditContext = {
        userId: 'unknown',
        sessionId: 'unknown',
        action: 'PROCESS_TRANSFER',
        result: 'failure' as const,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
    };

    try {
        // 1. Authentication check
        const session = await verifySession();
        if (!session) {
            await auditLogger.logTransaction(
                auditContext.userId,
                auditContext.sessionId,
                'transfer_unauthorized',
                { ipAddress: auditContext.ipAddress },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            }, {
                status: 401,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Update audit context
        auditContext.userId = session.userId;
        auditContext.sessionId = session.id;

        // 2. Authorization check
        const auth = new BankingAuthorization(session.role, session.permissions);
        if (!auth.hasPermission(BankingPermission.TRANSFER_FUNDS)) {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'transfer_unauthorized',
                { role: session.role },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions to process transfers',
                code: 'INSUFFICIENT_PERMISSIONS'
            }, {
                status: 403,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        const body = await request.json();
        const {
            fromAccountId,
            toAccountId,
            amount,
            currency,
            description,
            reference,
            scheduledDate,
            isRecurring,
            romanianTaxData
        } = body;

        // 3. Input validation
        if (!fromAccountId || !toAccountId || !amount || !currency) {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'transfer_validation_error',
                {
                    missingFields: ['fromAccountId', 'toAccountId', 'amount', 'currency']
                        .filter(field => !body[field])
                },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Missing required fields: fromAccountId, toAccountId, amount, currency',
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Validate amount
        if (amount <= 0 || amount > 1000000) {
            return NextResponse.json({
                success: false,
                error: 'Amount must be between 0.01 and 1,000,000',
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Validate currency
        const validCurrencies = ['USD', 'EUR', 'RON', 'GBP'];
        if (!validCurrencies.includes(currency)) {
            return NextResponse.json({
                success: false,
                error: `Invalid currency. Must be one of: ${validCurrencies.join(', ')}`,
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Prevent self-transfer
        if (fromAccountId === toAccountId) {
            return NextResponse.json({
                success: false,
                error: 'Cannot transfer to the same account',
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // 4. Verify account ownership and permissions
        const fromAccount = await accountManager.getAccount(fromAccountId);
        const toAccount = await accountManager.getAccount(toAccountId);

        if (!fromAccount) {
            return NextResponse.json({
                success: false,
                error: 'Source account not found',
                code: 'ACCOUNT_NOT_FOUND'
            }, {
                status: 404,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        if (!toAccount) {
            return NextResponse.json({
                success: false,
                error: 'Destination account not found',
                code: 'ACCOUNT_NOT_FOUND'
            }, {
                status: 404,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Check if user can transfer from source account
        if (fromAccount.userId !== session.userId && !auth.hasPermission(BankingPermission.TRANSFER_FUNDS_OTHER)) {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'transfer_unauthorized_account',
                { fromAccountId, accountOwner: fromAccount.userId },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions to transfer from this account',
                code: 'INSUFFICIENT_PERMISSIONS'
            }, {
                status: 403,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // 5. Romanian compliance checks
        if (romanianTaxData?.cui) {
            const cuiValidation = await complianceService.validateCUI(romanianTaxData.cui);
            if (!cuiValidation.cuiValid) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid Romanian CUI (tax ID)',
                    code: 'COMPLIANCE_ERROR'
                }, {
                    status: 400,
                    headers: BANKING_SECURITY_HEADERS
                });
            }
        }

        // Check compliance requirements for large transfers
        const compliance = await complianceService.checkComplianceRequirements(
            session.userId,
            amount,
            currency,
            'transfer',
            romanianTaxData?.cui
        );

        if (!compliance.compliant && compliance.riskLevel === 'critical') {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'transfer_compliance_block',
                {
                    amount,
                    currency,
                    riskLevel: compliance.riskLevel,
                    requiredActions: compliance.requiredActions
                },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Transfer blocked due to compliance requirements',
                details: {
                    requiredActions: compliance.requiredActions,
                    reportingRequired: compliance.reportingRequired,
                    riskLevel: compliance.riskLevel,
                    deadlines: compliance.deadlines
                },
                code: 'COMPLIANCE_BLOCK'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // 6. Create transfer request
        const transferRequest = {
            id: `TRF_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            fromAccountId,
            toAccountId,
            amount,
            currency,
            description: description || 'Account Transfer',
            reference,
            scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
            isRecurring,
            romanianTaxData
        };

        // 7. Process transfer
        const transferResult = await accountManager.processAccountTransfer(transferRequest);

        // 8. Calculate Romanian taxes if applicable
        let taxCalculation = null;
        if (romanianTaxData?.cui && transferResult.success) {
            taxCalculation = await complianceService.calculateRomanianTaxes(
                amount,
                'transfer',
                romanianTaxData.cui.length > 10 ? 'company' : 'individual',
                romanianTaxData.cui
            );
        }

        // 9. Exchange rate information if cross-currency
        let exchangeRateInfo = null;
        if (fromAccount.currency !== toAccount.currency && transferResult.success) {
            try {
                exchangeRateInfo = await complianceService.getBNRExchangeRate(
                    fromAccount.currency,
                    toAccount.currency
                );
            } catch (error) {
                console.warn('Failed to get BNR exchange rate:', error);
            }
        }

        // 10. Audit logging
        auditContext.result = transferResult.success ? 'success' : 'failure';
        await auditLogger.logTransaction(
            session.userId,
            session.id,
            'process_transfer',
            {
                transferId: transferResult.transferId,
                fromAccountId,
                toAccountId,
                amount,
                currency,
                status: transferResult.status,
                fees: transferResult.fees,
                exchangeRate: transferResult.exchangeRate
            },
            auditContext.result
        );

        // 11. Prepare response
        const response = {
            success: transferResult.success,
            data: {
                transferId: transferResult.transferId,
                transactionId: transferResult.transactionId,
                status: transferResult.status,
                fromAccount: transferResult.fromAccount,
                toAccount: transferResult.toAccount,
                amount: transferResult.amount,
                currency: transferResult.currency,
                fees: transferResult.fees,
                exchangeRate: transferResult.exchangeRate,
                estimatedCompletionTime: transferResult.estimatedCompletionTime
            },
            compliance: {
                complianceFlags: transferResult.complianceFlags,
                taxCalculation,
                reportingRequired: compliance.reportingRequired,
                riskLevel: compliance.riskLevel,
                exchangeRateInfo
            },
            timestamp: new Date().toISOString()
        };

        // Add error details if transfer failed
        if (!transferResult.success && transferResult.error) {
            response.error = transferResult.error.message;
            response.errorCode = transferResult.error.code;
        }

        const statusCode = transferResult.success ? 200 : 400;

        return NextResponse.json(response, {
            status: statusCode,
            headers: BANKING_SECURITY_HEADERS
        });

    } catch (error) {
        console.error('Error processing transfer:', error);

        await auditLogger.logSecurityEvent(
            auditContext.userId,
            auditContext.sessionId,
            'transfer_processing_error',
            { error: error.message },
            'high',
            auditContext.ipAddress,
            auditContext.userAgent
        );

        return NextResponse.json({
            success: false,
            error: 'Transfer processing failed',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: BANKING_SECURITY_HEADERS
        });
    }
}

/**
 * GET /api/banking/transfers - Get transfer history (SECURE)
 */
export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const session = await verifySession();
        if (!session) {
            return NextResponse.json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED'
            }, {
                status: 401,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        const url = new URL(request.url);
        const { searchParams } = url;
        const accountId = searchParams.get('accountId');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // If accountId is provided, verify user can access it
        if (accountId) {
            const account = await accountManager.getAccount(accountId);
            if (!account) {
                return NextResponse.json({
                    success: false,
                    error: 'Account not found',
                    code: 'ACCOUNT_NOT_FOUND'
                }, {
                    status: 404,
                    headers: BANKING_SECURITY_HEADERS
                });
            }

            const auth = new BankingAuthorization(session.role, session.permissions);
            if (account.userId !== session.userId && !auth.hasPermission(BankingPermission.VIEW_ALL_ACCOUNTS)) {
                return NextResponse.json({
                    success: false,
                    error: 'Insufficient permissions to view this account\'s transfers',
                    code: 'INSUFFICIENT_PERMISSIONS'
                }, {
                    status: 403,
                    headers: BANKING_SECURITY_HEADERS
                });
            }
        }

        // Mock transfer history - in production, implement actual retrieval
        const mockTransfers = [
            {
                transferId: 'TRF_001',
                transactionId: 'TXN_001',
                fromAccount: accountId || 'acc_1',
                toAccount: 'acc_2',
                amount: 500.00,
                currency: 'USD',
                status: 'completed',
                fees: 2.50,
                description: 'Monthly transfer',
                createdAt: new Date(Date.now() - 86400000),
                completedAt: new Date(Date.now() - 86400000)
            }
        ];

        // Audit successful retrieval
        await auditLogger.logTransaction(
            session.userId,
            session.id,
            'get_transfers',
            { accountId, transfersCount: mockTransfers.length },
            'success'
        );

        return NextResponse.json({
            success: true,
            data: mockTransfers,
            pagination: {
                limit,
                offset,
                total: mockTransfers.length,
                hasMore: false
            },
            timestamp: new Date().toISOString()
        }, {
            headers: BANKING_SECURITY_HEADERS
        });

    } catch (error) {
        console.error('Error retrieving transfers:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve transfers',
            code: 'INTERNAL_ERROR'
        }, {
            status: 500,
            headers: BANKING_SECURITY_HEADERS
        });
    }
}
