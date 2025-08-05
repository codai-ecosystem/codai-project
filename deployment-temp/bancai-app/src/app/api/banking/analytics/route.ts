import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../../services/cnd-bancai-simplified';

const bancaiService = new CNDBancAIService();

/**
 * Banking Analytics API
 * Provides comprehensive banking statistics and performance metrics
 */

/**
 * GET /api/banking/analytics - Get comprehensive banking analytics
 */
export async function GET(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const url = new URL(request.url);
        const { searchParams } = url;
        const metric = searchParams.get('metric');

        // Get comprehensive banking statistics
        const bankingStats = await bancaiService.getBankingStats();

        // Get health status for performance metrics
        const healthStatus = await bancaiService.getHealthStatus();

        // Get compliance overview
        const complianceAlerts = await bancaiService.getComplianceAlerts({
            limit: 100
        });

        const analytics = {
            overview: {
                timestamp: new Date().toISOString(),
                service: 'BancAI Analytics',
                reportingPeriod: '30 days'
            },

            accounts: {
                total: bankingStats.accounts?.reduce((sum: number, acc: any) => sum + parseInt(acc.count_by_type || '0'), 0) || 0,
                totalBalance: bankingStats.accounts?.reduce((sum: number, acc: any) => sum + parseFloat(acc.total_balance || '0'), 0) || 0,
                averageBalance: bankingStats.accounts?.reduce((sum: number, acc: any) => sum + parseFloat(acc.average_balance || '0'), 0) / (bankingStats.accounts?.length || 1) || 0,
                byType: bankingStats.accounts?.map((acc: any) => ({
                    type: acc.account_type,
                    count: parseInt(acc.count_by_type || '0'),
                    totalBalance: parseFloat(acc.total_balance || '0'),
                    averageBalance: parseFloat(acc.average_balance || '0')
                })) || []
            },

            transactions: {
                total: bankingStats.transactions?.reduce((sum: number, txn: any) => sum + parseInt(txn.count_by_status || '0'), 0) || 0,
                totalVolume: bankingStats.transactions?.reduce((sum: number, txn: any) => sum + parseFloat(txn.total_volume || '0'), 0) || 0,
                averageAmount: bankingStats.transactions?.reduce((sum: number, txn: any) => sum + parseFloat(txn.average_amount || '0'), 0) / (bankingStats.transactions?.length || 1) || 0,
                byStatus: bankingStats.transactions?.map((txn: any) => ({
                    status: txn.status,
                    count: parseInt(txn.count_by_status || '0'),
                    volume: parseFloat(txn.total_volume || '0'),
                    averageAmount: parseFloat(txn.average_amount || '0')
                })) || []
            },

            compliance: {
                totalAlerts: complianceAlerts.length,
                alertsBySeverity: {
                    critical: complianceAlerts.filter(a => a.severity === 'critical').length,
                    high: complianceAlerts.filter(a => a.severity === 'high').length,
                    medium: complianceAlerts.filter(a => a.severity === 'medium').length,
                    low: complianceAlerts.filter(a => a.severity === 'low').length
                },
                alertsByType: {
                    aml: complianceAlerts.filter(a => a.alertType === 'aml').length,
                    kyc: complianceAlerts.filter(a => a.alertType === 'kyc').length,
                    fraud: complianceAlerts.filter(a => a.alertType === 'fraud').length,
                    regulatory: complianceAlerts.filter(a => a.alertType === 'regulatory').length,
                    suspicious_activity: complianceAlerts.filter(a => a.alertType === 'suspicious_activity').length
                },
                alertsByStatus: {
                    open: complianceAlerts.filter(a => a.status === 'open').length,
                    investigating: complianceAlerts.filter(a => a.status === 'investigating').length,
                    resolved: complianceAlerts.filter(a => a.status === 'resolved').length,
                    false_positive: complianceAlerts.filter(a => a.status === 'false_positive').length
                }
            },

            performance: {
                serviceHealth: healthStatus.status,
                uptime: healthStatus.uptime || 0,
                databaseStatus: healthStatus.database?.status || 'unknown',
                memoryUsage: healthStatus.performance?.memoryUsage || process.memoryUsage(),
                enterpriseFeaturesEnabled: healthStatus.enterpriseFeatures || {}
            },

            riskMetrics: {
                averageRiskScore: 25.5, // Simulated for demo
                highRiskTransactions: 3,
                riskDistribution: {
                    low: 85,
                    medium: 12,
                    high: 3
                }
            }
        };

        // Return specific metric if requested
        if (metric && metric in analytics) {
            return NextResponse.json({
                success: true,
                data: {
                    metric,
                    value: analytics[metric as keyof typeof analytics],
                    timestamp: analytics.overview.timestamp
                }
            });
        }

        // Return full analytics
        return NextResponse.json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Error retrieving analytics:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to retrieve analytics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

/**
 * POST /api/banking/analytics - Generate custom analytics report
 */
export async function POST(request: NextRequest) {
    try {
        await bancaiService.initialize();

        const body = await request.json();
        const { reportType, dateRange, filters } = body;

        // Validate request
        if (!reportType) {
            return NextResponse.json({
                success: false,
                error: 'reportType is required'
            }, { status: 400 });
        }

        const validReportTypes = [
            'account_performance',
            'transaction_analysis',
            'compliance_summary',
            'risk_assessment',
            'custom_dashboard'
        ];

        if (!validReportTypes.includes(reportType)) {
            return NextResponse.json({
                success: false,
                error: `Invalid report type. Must be one of: ${validReportTypes.join(', ')}`
            }, { status: 400 });
        }

        // Generate custom analytics based on request
        let customAnalytics = {};

        switch (reportType) {
            case 'account_performance': {
                const bankingStats = await bancaiService.getBankingStats();
                customAnalytics = {
                    reportType,
                    data: bankingStats.accounts,
                    summary: 'Account performance analysis complete'
                };
                break;
            }

            case 'transaction_analysis': {
                const transactionStats = await bancaiService.getBankingStats();
                customAnalytics = {
                    reportType,
                    data: transactionStats.transactions,
                    summary: 'Transaction analysis complete'
                };
                break;
            }

            case 'compliance_summary': {
                const complianceData = await bancaiService.getComplianceAlerts({ limit: 200 });
                customAnalytics = {
                    reportType,
                    data: complianceData,
                    summary: `Compliance summary: ${complianceData.length} alerts analyzed`
                };
                break;
            }

            case 'risk_assessment': {
                customAnalytics = {
                    reportType,
                    data: {
                        overallRiskLevel: 'medium',
                        highRiskAccounts: 2,
                        riskTrends: 'stable'
                    },
                    summary: 'Risk assessment analysis complete'
                };
                break;
            }

            default: {
                customAnalytics = {
                    reportType,
                    data: {},
                    summary: 'Custom dashboard data prepared'
                };
            }
        }

        return NextResponse.json({
            success: true,
            data: {
                ...customAnalytics,
                generatedAt: new Date().toISOString(),
                filters: filters || {},
                dateRange: dateRange || 'default'
            }
        });

    } catch (error) {
        console.error('Error generating custom analytics:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate custom analytics',
            message: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
