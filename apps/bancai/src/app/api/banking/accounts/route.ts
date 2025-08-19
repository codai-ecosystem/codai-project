/**
 * BancAI Banking Accounts API - SECURE VERSION
 * Implements authentication, authorization, encryption, and audit logging
 * PCI DSS compliant banking operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, BankingAuthorization, BANKING_SECURITY_HEADERS } from '../../../../lib/security/auth';
import { encryptAccountData, decryptAccountData, generateSecureAccountNumber } from '../../../../lib/security/encryption';
import { auditLogger, fraudDetection } from '../../../../lib/security/audit';
import { CNDBancAIService } from '../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * GET /api/banking/accounts - Get accounts (SECURE)
 * Requires authentication and proper authorization
 */
export async function GET(request: NextRequest) {
    let auditContext = {
        userId: 'unknown',
        sessionId: 'unknown',
        action: 'GET_ACCOUNTS',
        result: 'failure' as const,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
    };

    try {
        // 1. Authentication check
        const session = await verifySession();
        if (!session) {
            await auditLogger.logAccountAccess(
                auditContext.userId,
                auditContext.sessionId,
                'all',
                'unauthorized_access',
                'failure',
                auditContext.ipAddress,
                auditContext.userAgent
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

        // Update audit context with session info
        auditContext.userId = session.userId;
        auditContext.sessionId = session.sessionId;

        await bancaiService.initialize();

        const url = new URL(request.url);
        const { searchParams } = url;
        const requestedUserId = searchParams.get('userId');

        // 2. Authorization check
        if (requestedUserId) {
            // Check if user can access the requested account
            if (!BankingAuthorization.canAccessAccount(session, requestedUserId)) {
                await auditLogger.logAccountAccess(
                    session.userId,
                    session.sessionId,
                    requestedUserId,
                    'unauthorized_access',
                    'failure',
                    auditContext.ipAddress,
                    auditContext.userAgent
                );

                return NextResponse.json({
                    success: false,
                    error: 'Insufficient permissions to access requested accounts',
                    code: 'INSUFFICIENT_PERMISSIONS'
                }, {
                    status: 403,
                    headers: BANKING_SECURITY_HEADERS
                });
            }

            // Get accounts for specific user
            const encryptedAccounts = await bancaiService.getAccountsByUser(requestedUserId);

            // Decrypt account data for authorized access
            const accounts = encryptedAccounts.map(account => {
                const decryptedAccount = decryptAccountData(account);
                // Mask sensitive data based on user role
                if (session.role !== 'admin' && session.role !== 'banker') {
                    decryptedAccount.accountNumber = decryptedAccount.accountNumber ?
                        '*'.repeat(decryptedAccount.accountNumber.length - 4) + decryptedAccount.accountNumber.slice(-4) : '';
                }
                return decryptedAccount;
            });

            auditContext.result = 'success';
            await auditLogger.logAccountAccess(
                session.userId,
                session.sessionId,
                requestedUserId,
                'view_accounts',
                'success',
                auditContext.ipAddress,
                auditContext.userAgent
            );

            return NextResponse.json({
                success: true,
                data: accounts,
                count: accounts.length
            }, {
                headers: BANKING_SECURITY_HEADERS
            });
        } else {
            // User trying to access all accounts - admin/banker only
            if (!BankingAuthorization.canViewAllAccounts(session)) {
                await auditLogger.logAccountAccess(
                    session.userId,
                    session.sessionId,
                    'all',
                    'unauthorized_access',
                    'failure',
                    auditContext.ipAddress,
                    auditContext.userAgent
                );

                return NextResponse.json({
                    success: false,
                    error: 'Admin or banker role required to view all accounts',
                    code: 'INSUFFICIENT_PERMISSIONS'
                }, {
                    status: 403,
                    headers: BANKING_SECURITY_HEADERS
                });
            }

            auditContext.result = 'success';
            await auditLogger.logAccountAccess(
                session.userId,
                session.sessionId,
                'all',
                'view_all_accounts',
                'success',
                auditContext.ipAddress,
                auditContext.userAgent
            );

            return NextResponse.json({
                success: true,
                data: [],
                message: 'Specify userId parameter to get user accounts'
            }, {
                headers: BANKING_SECURITY_HEADERS
            });
        }

    } catch (error) {
        console.error('Error retrieving accounts:', error);

        await auditLogger.logSecurityEvent(
            auditContext.userId,
            auditContext.sessionId,
            'account_access_error',
            { error: error.message },
            'medium',
            auditContext.ipAddress,
            auditContext.userAgent
        );

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve accounts',
            code: 'INTERNAL_ERROR'
        }, {
            status: 500,
            headers: BANKING_SECURITY_HEADERS
        });
    }
}

/**
 * POST /api/banking/accounts - Create new bank account (SECURE)
 * Requires authentication, authorization, and implements fraud detection
 */
export async function POST(request: NextRequest) {
    let auditContext = {
        userId: 'unknown',
        sessionId: 'unknown',
        action: 'CREATE_ACCOUNT',
        result: 'failure' as const,
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
    };

    try {
        // 1. Authentication check
        const session = await verifySession();
        if (!session) {
            await auditLogger.logAccountAccess(
                auditContext.userId,
                auditContext.sessionId,
                'new',
                'unauthorized_creation',
                'failure',
                auditContext.ipAddress,
                auditContext.userAgent
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
        auditContext.sessionId = session.sessionId;

        // 2. Authorization check
        if (!BankingAuthorization.canCreateAccounts(session)) {
            await auditLogger.logAccountAccess(
                session.userId,
                session.sessionId,
                'new',
                'unauthorized_creation',
                'failure',
                auditContext.ipAddress,
                auditContext.userAgent
            );

            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions to create accounts',
                code: 'INSUFFICIENT_PERMISSIONS'
            }, {
                status: 403,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        await bancaiService.initialize();

        const body = await request.json();
        const { userId, accountType, currency = 'USD', initialBalance = 0 } = body;

        // 3. Input validation
        if (!userId || !accountType) {
            await auditLogger.logAccountAccess(
                session.userId,
                session.sessionId,
                'new',
                'invalid_input',
                'failure',
                auditContext.ipAddress,
                auditContext.userAgent
            );

            return NextResponse.json({
                success: false,
                error: 'Missing required fields: userId, accountType',
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Validate account type
        const validAccountTypes = ['checking', 'savings', 'investment', 'business'];
        if (!validAccountTypes.includes(accountType)) {
            return NextResponse.json({
                success: false,
                error: `Invalid account type. Must be one of: ${validAccountTypes.join(', ')}`,
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // Validate initial balance
        if (initialBalance < 0 || initialBalance > 1000000) {
            return NextResponse.json({
                success: false,
                error: 'Initial balance must be between 0 and 1,000,000',
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // 4. Check if user can create account for requested userId
        if (session.userId !== userId && !BankingAuthorization.canViewAllAccounts(session)) {
            await auditLogger.logAccountAccess(
                session.userId,
                session.sessionId,
                userId,
                'unauthorized_creation',
                'failure',
                auditContext.ipAddress,
                auditContext.userAgent
            );

            return NextResponse.json({
                success: false,
                error: 'Cannot create account for another user',
                code: 'INSUFFICIENT_PERMISSIONS'
            }, {
                status: 403,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // 5. Generate secure account number
        const accountNumber = generateSecureAccountNumber();

        // 6. Create account data with encryption
        const accountData = {
            userId,
            accountType,
            accountNumber,
            balance: initialBalance,
            currency,
            status: 'active',
            createdAt: new Date(),
            createdBy: session.userId
        };

        // Encrypt sensitive account data
        const encryptedAccountData = encryptAccountData(accountData);

        // 7. Create new account
        const newAccount = await bancaiService.createAccount(encryptedAccountData);

        // 8. Fraud detection (for unusual account creation patterns)
        const fraudAlerts = await fraudDetection.analyzeTransaction(
            session.userId,
            { type: 'account_creation', amount: initialBalance, userId },
            [] // Would normally pass user history
        );

        // 9. Audit logging
        auditContext.result = 'success';
        await auditLogger.logAccountAccess(
            session.userId,
            session.sessionId,
            newAccount.id,
            'create_account',
            'success',
            auditContext.ipAddress,
            auditContext.userAgent
        );

        // Return account data (decrypt for response but mask sensitive fields)
        const responseAccount = decryptAccountData(newAccount);
        responseAccount.accountNumber = responseAccount.accountNumber ?
            '*'.repeat(responseAccount.accountNumber.length - 4) + responseAccount.accountNumber.slice(-4) : '';

        const response = {
            success: true,
            data: responseAccount,
            message: 'Bank account created successfully'
        };

        // Add fraud alerts if any
        if (fraudAlerts.length > 0) {
            response.fraudAlerts = fraudAlerts.map(alert => ({
                type: alert.alertType,
                severity: alert.severity,
                message: 'Account creation flagged for review'
            }));
        }

        return NextResponse.json(response, {
            status: 201,
            headers: BANKING_SECURITY_HEADERS
        });

    } catch (error) {
        console.error('Error creating account:', error);

        await auditLogger.logSecurityEvent(
            auditContext.userId,
            auditContext.sessionId,
            'account_creation_error',
            { error: error.message },
            'high',
            auditContext.ipAddress,
            auditContext.userAgent
        );

        return NextResponse.json({
            success: false,
            error: 'Failed to create account',
            code: 'INTERNAL_ERROR'
        }, {
            status: 500,
            headers: BANKING_SECURITY_HEADERS
        });
    }
}
