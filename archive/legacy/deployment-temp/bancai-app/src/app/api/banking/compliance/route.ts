import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * Banking Compliance API
 * Handles compliance monitoring, alerts, and regulatory reporting
 */

/**
 * GET /api/banking/compliance - Get compliance alerts and status
 */
export async function GET(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const url = new URL(request.url);
        const { searchParams } = url;
        const status = searchParams.get('status');
        const severity = searchParams.get('severity');
        const alertType = searchParams.get('alertType');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Get compliance alerts with filters
        const alerts = await bancaiService.getComplianceAlerts({
            status: status || undefined,
            severity: severity || undefined,
            alertType: alertType || undefined,
            limit
        });

        // Get banking statistics for compliance overview
        const bankingStats = await bancaiService.getBankingStats();

        return NextResponse.json({
            success: true,
            data: {
                alerts,
                statistics: {
                    totalAlerts: alerts.length,
                    criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
                    openAlerts: alerts.filter(a => a.status === 'open').length,
                    resolvedAlerts: alerts.filter(a => a.status === 'resolved').length
                },
                bankingOverview: bankingStats.compliance
            }
        });

    } catch (error) {
        console.error('Error retrieving compliance data:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve compliance data',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * POST /api/banking/compliance - Create compliance alert
 */
export async function POST(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const body = await request.json();
        const {
            transactionId,
            accountId,
            userId,
            alertType,
            severity,
            description,
            assignedTo
        } = body;

        // Validate required fields
        if (!alertType || !severity || !description) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields: alertType, severity, description'
            }, { status: 400 });
        }

        // Validate alert type
        const validAlertTypes = ['aml', 'kyc', 'fraud', 'regulatory', 'suspicious_activity'];
        if (!validAlertTypes.includes(alertType)) {
            return NextResponse.json({
                success: false,
                error: `Invalid alert type. Must be one of: ${validAlertTypes.join(', ')}`
            }, { status: 400 });
        }

        // Validate severity
        const validSeverities = ['low', 'medium', 'high', 'critical'];
        if (!validSeverities.includes(severity)) {
            return NextResponse.json({
                success: false,
                error: `Invalid severity. Must be one of: ${validSeverities.join(', ')}`
            }, { status: 400 });
        }

        // Create compliance alert
        const alert = await bancaiService.createComplianceAlert({
            transactionId,
            accountId,
            userId,
            alertType,
            severity,
            description,
            status: 'open',
            assignedTo
        });

        return NextResponse.json({
            success: true,
            data: alert,
            message: 'Compliance alert created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating compliance alert:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create compliance alert',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
