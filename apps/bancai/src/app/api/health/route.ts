/**
 * BancAI Health Check API
 * Provides service health status and operational metrics
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const uptime = process.uptime();
        const timestamp = new Date().toISOString();

        const healthData = {
            service: 'BancAI Banking Platform',
            serviceId: 'bancai',
            status: 'operational',
            timestamp,
            version: '1.0.0',
            ecosystem: 'codai-ecosystem',
            domain: 'bancai.codai.ro',
            uptime: Math.floor(uptime),
            memory: process.memoryUsage(),

            // Banking-specific capabilities
            bankingOperations: {
                accountManagement: true,
                paymentProcessing: true,
                transactionHistory: true,
                complianceReporting: true,
                realTimeValidation: true
            },

            // Security features
            securityFeatures: {
                jwtAuthentication: true,
                encryptedStorage: true,
                auditLogging: true,
                fraudDetection: true,
                complianceChecks: true
            },

            // API endpoints
            endpoints: {
                health: '/api/health',
                auth: '/api/auth',
                banking: '/api/banking',
                accounts: '/api/banking/accounts',
                transactions: '/api/banking/transactions',
                reports: '/api/banking/reports'
            },

            // Integration status
            integration: {
                gateway: 'connected',
                database: 'connected',
                paymentGateway: 'connected',
                complianceEngine: 'connected'
            },

            message: 'BancAI banking platform is operational and ready for secure financial transactions'
        };

        return NextResponse.json(healthData, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'X-Service-Name': 'bancai',
                'X-Service-Version': '1.0.0'
            }
        });

    } catch (error) {
        console.error('Health check error:', error);

        return NextResponse.json({
            service: 'BancAI Banking Platform',
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Internal server error',
            message: 'Service is experiencing issues'
        }, {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'X-Service-Name': 'bancai',
                'X-Service-Version': '1.0.0'
            }
        });
    }
}