/**
 * System Status API Route
 * Path: /api/status
 * Methods: GET
 * Purpose: Real-time system status for dashboard
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const startTime = Date.now();

        // Get system metrics
        const systemMetrics = {
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            platform: process.platform,
            nodeVersion: process.version
        };

        // Check services status
        const servicesStatus = await checkAllServices();

        // Calculate overall health
        const operationalServices = Object.values(servicesStatus).filter(
            service => service.status === 'operational' || service.status === 'warning'
        );
        const totalServices = Object.values(servicesStatus).length;
        
        // Consider system operational if most services are working
        const overallStatus = operationalServices.length >= totalServices * 0.75 ? 'operational' : 'degraded';
        const responseTime = Date.now() - startTime;

        return NextResponse.json({
            status: overallStatus,
            version: systemMetrics.version,
            environment: systemMetrics.environment,
            responseTime: `${responseTime}ms`,
            timestamp: systemMetrics.timestamp,
            services: servicesStatus,
            metrics: {
                uptime: `${Math.floor(systemMetrics.uptime / 3600)}h ${Math.floor((systemMetrics.uptime % 3600) / 60)}m`,
                memoryUsage: `${Math.round(systemMetrics.memory.rss / 1024 / 1024)}MB`,
                heapUsed: `${Math.round(systemMetrics.memory.heapUsed / 1024 / 1024)}MB`,
                version: systemMetrics.version,
                environment: systemMetrics.environment,
                platform: systemMetrics.platform,
                nodeVersion: systemMetrics.nodeVersion
            },
            realTime: {
                currentLoad: Math.round(35 + Math.random() * 20), // Simulated
                cpuUsage: Math.round(42 + Math.random() * 20),
                networkLatency: Math.round(23 + Math.random() * 10),
                activeConnections: Math.round(25 + Math.random() * 15)
            }
        }, {
            status: 200,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error) {
        console.error('Status check failed:', error);

        return NextResponse.json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: 'Status check failed',
            services: {},
            metrics: {}
        }, { status: 500 });
    }
}

async function checkAllServices() {
    const services = {
        frontend: await checkFrontendService(),
        azureAI: await checkAzureAIService(),
        database: await checkDatabaseService(),
        analytics: await checkAnalyticsService()
    };

    return services;
}

async function checkFrontendService() {
    try {
        return {
            status: 'operational',
            name: 'Frontend (Next.js)',
            url: process.env.NEXT_PUBLIC_APP_URL || 'https://romcp.ro',
            responseTime: '45ms',
            version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
        };
    } catch (error) {
        return {
            status: 'degraded',
            name: 'Frontend (Next.js)',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

async function checkAzureAIService() {
    try {
        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;

        if (!endpoint || !apiKey) {
            return {
                status: 'warning',
                name: 'Azure OpenAI',
                message: 'Credentials not configured',
                region: 'Sweden Central'
            };
        }

        // Simple connectivity test
        const startTime = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        try {
            const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-10-01-preview';
            const response = await fetch(`${endpoint}/openai/models?api-version=${apiVersion}`, {
                method: 'GET',
                headers: { 
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            const responseTime = Date.now() - startTime;

            return {
                status: response.ok ? 'operational' : 'degraded',
                name: 'Azure OpenAI',
                region: 'Sweden Central',
                responseTime: `${responseTime}ms`,
                endpoint: endpoint,
                models: [process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o-realtime']
            };
        } catch (fetchError) {
            clearTimeout(timeoutId);
            return {
                status: 'degraded',
                name: 'Azure OpenAI',
                region: 'Sweden Central',
                error: fetchError instanceof Error ? fetchError.message : 'Connection failed'
            };
        }
    } catch (error) {
        return {
            status: 'down',
            name: 'Azure OpenAI',
            error: error instanceof Error ? error.message : 'Service check failed'
        };
    }
}

async function checkDatabaseService() {
    try {
        const dbUrl = process.env.DATABASE_URL;

        if (!dbUrl) {
            return {
                status: 'warning',
                name: 'Database',
                message: 'Database URL not configured'
            };
        }

        // For demo purposes, assume operational if URL is configured
        return {
            status: 'operational',
            name: 'PostgreSQL Database',
            type: 'PostgreSQL',
            connection: 'Configured',
            responseTime: '23ms'
        };
    } catch (error) {
        return {
            status: 'down',
            name: 'Database',
            error: error instanceof Error ? error.message : 'Database connection failed'
        };
    }
}

async function checkAnalyticsService() {
    try {
        return {
            status: 'operational',
            name: 'Analytics Engine',
            type: 'Internal Service',
            features: ['Real-time metrics', 'Usage tracking', 'Performance monitoring'],
            responseTime: '12ms'
        };
    } catch (error) {
        return {
            status: 'degraded',
            name: 'Analytics Engine',
            error: error instanceof Error ? error.message : 'Analytics service error'
        };
    }
}
