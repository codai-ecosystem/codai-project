/**
 * BancAI Real Payment Processing API - SECURE VERSION
 * Implements real payment processing with Romanian compliance
 * PCI DSS compliant payment operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession, BankingAuthorization, BANKING_SECURITY_HEADERS, BankingPermission } from '../../../../lib/security/auth';
import { auditLogger, fraudDetection } from '../../../../lib/security/audit';
import { RealPaymentProcessor } from '../../../../services/RealPaymentProcessor';
import { RomanianBankingComplianceService } from '../../../../services/RomanianBankingComplianceService';

const paymentProcessor = new RealPaymentProcessor();
const complianceService = new RomanianBankingComplianceService();

/**
 * POST /api/banking/payments - Process real payment (SECURE)
 * Requires authentication, authorization, and implements fraud detection
 */
export async function POST(request: NextRequest) {
    let auditContext = {
        userId: 'unknown',
        sessionId: 'unknown',
        action: 'PROCESS_PAYMENT',
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
                'process_payment_unauthorized',
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
        if (!auth.hasPermission(BankingPermission.PROCESS_PAYMENTS)) {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'process_payment_unauthorized',
                { role: session.role },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Insufficient permissions to process payments',
                code: 'INSUFFICIENT_PERMISSIONS'
            }, {
                status: 403,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        const body = await request.json();
        const {
            amount,
            currency,
            paymentMethodId,
            description,
            recipientAccountId,
            romanianTaxData,
            metadata
        } = body;

        // 3. Input validation
        if (!amount || !currency || !paymentMethodId) {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'process_payment_validation_error',
                { missingFields: ['amount', 'currency', 'paymentMethodId'].filter(field => !body[field]) },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Missing required fields: amount, currency, paymentMethodId',
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

        // 4. Romanian compliance checks
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

        // Check compliance requirements for large payments
        const compliance = await complianceService.checkComplianceRequirements(
            session.userId,
            amount,
            currency,
            'payment',
            romanianTaxData?.cui
        );

        if (!compliance.compliant && compliance.riskLevel === 'critical') {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'payment_compliance_block',
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
                error: 'Payment blocked due to compliance requirements',
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

        // 5. Create payment request
        const paymentRequest = {
            id: `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`,
            userId: session.userId,
            sessionId: session.id,
            amount,
            currency,
            description: description || 'BancAI Payment',
            paymentMethodId,
            recipientAccountId,
            romanianTaxData,
            metadata: {
                source: 'banking_api',
                ipAddress: auditContext.ipAddress,
                userAgent: auditContext.userAgent,
                timestamp: new Date().toISOString(),
                ...metadata
            }
        };

        // 6. Validate payment request
        const validation = paymentProcessor.validatePaymentRequest(paymentRequest);
        if (!validation.valid) {
            await auditLogger.logTransaction(
                session.userId,
                session.id,
                'payment_validation_failed',
                { errors: validation.errors },
                'failure'
            );

            return NextResponse.json({
                success: false,
                error: 'Payment validation failed',
                details: validation.errors,
                code: 'VALIDATION_ERROR'
            }, {
                status: 400,
                headers: BANKING_SECURITY_HEADERS
            });
        }

        // 7. Process payment
        const paymentResult = await paymentProcessor.processRealPayment(paymentRequest);

        // 8. Calculate Romanian taxes if applicable
        let taxCalculation = null;
        if (romanianTaxData?.cui && paymentResult.success) {
            taxCalculation = await complianceService.calculateRomanianTaxes(
                amount,
                'payment',
                romanianTaxData.cui.length > 10 ? 'company' : 'individual',
                romanianTaxData.cui
            );
        }

        // 9. Audit logging
        auditContext.result = paymentResult.success ? 'success' : 'failure';
        await auditLogger.logTransaction(
            session.userId,
            session.id,
            'process_payment',
            {
                paymentId: paymentResult.paymentId,
                amount,
                currency,
                status: paymentResult.status,
                fraudScore: paymentResult.fraudScore,
                complianceFlags: paymentResult.complianceFlags,
                fees: paymentResult.fees
            },
            auditContext.result
        );

        // 10. Prepare response
        const response = {
            success: paymentResult.success,
            data: {
                paymentId: paymentResult.paymentId,
                transactionId: paymentResult.transactionId,
                status: paymentResult.status,
                amount: paymentResult.amount,
                currency: paymentResult.currency,
                fees: paymentResult.fees,
                fraudScore: paymentResult.fraudScore,
                estimatedCompletionTime: paymentResult.estimatedCompletionTime
            },
            compliance: {
                complianceFlags: paymentResult.complianceFlags,
                taxCalculation,
                reportingRequired: compliance.reportingRequired,
                riskLevel: compliance.riskLevel
            },
            timestamp: new Date().toISOString()
        };

        // Add error details if payment failed
        if (!paymentResult.success && paymentResult.error) {
            response.error = paymentResult.error.message;
            response.errorCode = paymentResult.error.code;
        }

        const statusCode = paymentResult.success ? 200 : 400;

        return NextResponse.json(response, {
            status: statusCode,
            headers: BANKING_SECURITY_HEADERS
        });

    } catch (error) {
        console.error('Error processing payment:', error);

        await auditLogger.logSecurityEvent(
            auditContext.userId,
            auditContext.sessionId,
            'payment_processing_error',
            { error: error.message },
            'high',
            auditContext.ipAddress,
            auditContext.userAgent
        );

        return NextResponse.json({
            success: false,
            error: 'Payment processing failed',
            code: 'INTERNAL_ERROR',
            timestamp: new Date().toISOString()
        }, {
            status: 500,
            headers: BANKING_SECURITY_HEADERS
        });
    }
}

/**
 * GET /api/banking/payments/providers - Get available payment providers
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

        // Get available providers
        const providers = paymentProcessor.getAvailableProviders();

        // Audit successful retrieval
        await auditLogger.logTransaction(
            session.userId,
            session.id,
            'get_payment_providers',
            { providersCount: providers.length },
            'success'
        );

        return NextResponse.json({
            success: true,
            data: providers.map(provider => ({
                id: provider.id,
                name: provider.name,
                type: provider.type,
                enabled: provider.enabled
                // Exclude sensitive configuration
            })),
            timestamp: new Date().toISOString()
        }, {
            headers: BANKING_SECURITY_HEADERS
        });

    } catch (error) {
        console.error('Error retrieving payment providers:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve payment providers',
            code: 'INTERNAL_ERROR'
        }, {
            status: 500,
            headers: BANKING_SECURITY_HEADERS
        });
    }
}
