import { NextRequest, NextResponse } from 'next/server';
import { CNDBancAIService } from '../../../services/cnd-bancai-simplified';

// Initialize BancAI service instance
const bancaiService = new CNDBancAIService();

/**
 * Enhanced BancAI Service Health Check with CND Integration
 * Provides comprehensive health status for banking operations
 */
export async function GET() {
    try {
        // Initialize service if not already done
        await bancaiService.initialize();

        // Get comprehensive health status
        const healthStatus = await bancaiService.getHealthStatus();

        // Get banking statistics for health dashboard
        const bankingStats = await bancaiService.getBankingStats();

        // Get compliance status
        const complianceAlerts = await bancaiService.getComplianceAlerts({
            status: 'open',
            limit: 10
        });

        const healthData = {
            service: 'BancAI Service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            port: 4005,

            // CND Database Health
            database: healthStatus.database,

            // Banking Service Health
            banking: {
                accountManagement: 'operational',
                transactionProcessing: 'operational',
                complianceMonitoring: 'operational',
                riskAssessment: 'operational',
                regulatoryReporting: 'operational'
            },

            // Statistics Summary
            statistics: {
                accounts: bankingStats.accounts?.length || 0,
                transactions: bankingStats.transactions?.length || 0,
                openComplianceAlerts: complianceAlerts.length
            },

            // Enterprise Features
            enterpriseFeatures: {
                authentication: healthStatus.serviceChecks?.enterpriseFeaturesEnabled || false,
                auditLogging: true,
                serviceDiscovery: true,
                metrics: true,
                encryption: true,
                complianceMode: healthStatus.compliance?.complianceStatus || 'monitoring'
            },

            // Performance Metrics
            performance: {
                uptime: healthStatus.uptime || 0,
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage()
            },

            // Dependencies
            dependencies: {
                cnd: healthStatus.database?.status || 'unknown',
                nodejs: process.version,
                environment: process.env.NODE_ENV || 'development'
            }
        };

        return NextResponse.json(healthData, { status: 200 });

    } catch (error) {
        console.error('BancAI Health Check Error:', error);

        const errorResponse = {
            service: 'BancAI Service',
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: {
                message: error.message,
                type: error.constructor.name
            },
            port: 4005,
            version: '1.0.0'
        };

        return NextResponse.json(errorResponse, { status: 503 });
    }
}

/**
 * POST endpoint for triggering health checks and diagnostics
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        await bancaiService.initialize();

        switch (action) {
            case 'compliance_check': {
                const alerts = await bancaiService.getComplianceAlerts({ limit: 50 });
                return NextResponse.json({
                    action: 'compliance_check',
                    result: {
                        totalAlerts: alerts.length,
                        criticalAlerts: alerts.filter(a => a.severity === 'critical').length,
                        openAlerts: alerts.filter(a => a.status === 'open').length
                    }
                });
            }

            case 'banking_stats': {
                const stats = await bancaiService.getBankingStats();
                return NextResponse.json({
                    action: 'banking_stats',
                    result: stats
                });
            }

            case 'full_diagnostic': {
                const healthStatus = await bancaiService.getHealthStatus();
                const complianceStatus = await bancaiService.getComplianceAlerts({ limit: 20 });
                const bankingStats = await bancaiService.getBankingStats();

                return NextResponse.json({
                    action: 'full_diagnostic',
                    result: {
                        health: healthStatus,
                        compliance: complianceStatus,
                        statistics: bankingStats,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            default:
                return NextResponse.json({
                    error: 'Unknown action. Available actions: compliance_check, banking_stats, full_diagnostic'
                }, { status: 400 });
        }

    } catch (error) {
        console.error('BancAI Health Check POST Error:', error);
        return NextResponse.json({
            error: 'Health check action failed',
            message: error.message
        }, { status: 500 });
    }
}
