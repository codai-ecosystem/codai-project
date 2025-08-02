// Simple debug script to test the health endpoint logic

class CBDClient {
    constructor() {
        this.baseUrl = 'http://localhost:4180';
    }

    async connect() {
        console.log('🔗 CBDClient: Connecting to:', this.baseUrl);
        return true;
    }

    sql() {
        return {
            query: async (query, params = []) => {
                console.log('🔍 CBDClient: Executing SQL query:', { query, params });

                // Extract table name from query
                const tableMatch = query.match(/from\s+(\w+)/i);
                const tableName = tableMatch ? tableMatch[1] : 'unknown_table';

                // Handle service health queries
                if (tableName === 'service_health') {
                    const mockHealthData = [
                        {
                            service_id: 'cbd-universal',
                            status: 'healthy',
                            last_check: new Date().toISOString(),
                            response_time: 15,
                            details: JSON.stringify({ version: '1.0.0', uptime: '24h' })
                        },
                        {
                            service_id: 'api-gateway',
                            status: 'healthy',
                            last_check: new Date().toISOString(),
                            response_time: 25,
                            details: JSON.stringify({ version: '1.0.0', uptime: '24h' })
                        },
                        {
                            service_id: 'hub-service',
                            status: 'healthy',
                            last_check: new Date().toISOString(),
                            response_time: 30,
                            details: JSON.stringify({ version: '1.0.0', uptime: '24h' })
                        },
                        {
                            service_id: 'codai-service',
                            status: 'degraded',
                            last_check: new Date().toISOString(),
                            response_time: 150,
                            details: JSON.stringify({ version: '1.0.0', issue: 'CND migration in progress' })
                        }
                    ];

                    return {
                        rows: mockHealthData,
                        affectedRows: mockHealthData.length,
                        data: mockHealthData
                    };
                }

                // Default empty result
                return { rows: [], affectedRows: 0, data: [] };
            }
        };
    }

    async close() {
        console.log('🔒 CBDClient: Closing connection');
        return true;
    }
}

class CNDHubService {
    constructor() {
        this.cnd = new CBDClient();
    }

    async initialize() {
        await this.cnd.connect();
        console.log('✅ CND Hub Service initialized');
    }

    async getServiceHealth() {
        try {
            const result = await this.cnd.sql().query(`
                SELECT service_id, status, last_check, response_time, details
                FROM service_health ORDER BY last_check DESC
            `);

            return result.data.map(row => ({
                serviceId: row.service_id,
                status: row.status,
                lastCheck: new Date(row.last_check),
                responseTime: row.response_time,
                details: JSON.parse(row.details),
            }));
        } catch (error) {
            console.error('❌ Failed to get service health:', error);
            throw error;
        }
    }
}

async function testHealthEndpoint() {
    try {
        console.log('🧪 Testing health endpoint logic...');

        const hub = new CNDHubService();
        await hub.initialize();

        console.log('🔍 Getting service health...');
        const healthStatus = await hub.getServiceHealth();
        console.log('✅ Service health obtained:', healthStatus);

        // Group health by status
        const healthSummary = Array.isArray(healthStatus) ? healthStatus.reduce((acc, service) => {
            if (!acc[service.status]) {
                acc[service.status] = [];
            }
            acc[service.status].push(service);
            return acc;
        }, {}) : {};

        const totalServices = Array.isArray(healthStatus) ? healthStatus.length : 0;
        const healthyCount = healthSummary.healthy?.length || 0;
        const unhealthyCount = healthSummary.unhealthy?.length || 0;
        const degradedCount = healthSummary.degraded?.length || 0;
        const unknownCount = healthSummary.unknown?.length || 0;

        const overallStatus = unhealthyCount > 0 ? 'unhealthy' :
            degradedCount > 0 ? 'degraded' :
                unknownCount > 0 ? 'partial' : 'healthy';

        const result = {
            success: true,
            ecosystem: {
                overallStatus,
                totalServices,
                summary: {
                    healthy: healthyCount,
                    unhealthy: unhealthyCount,
                    degraded: degradedCount,
                    unknown: unknownCount,
                },
                healthPercentage: totalServices > 0 ? Math.round((healthyCount / totalServices) * 100) : 0,
            },
            services: healthStatus,
            timestamp: new Date().toISOString(),
        };

        console.log('✅ Health endpoint result:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('❌ Error stack:', error.stack);
    }
}

testHealthEndpoint();
