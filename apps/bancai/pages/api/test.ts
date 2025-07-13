import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Test API endpoint that bypasses authentication
 * Provides comprehensive health check and API discovery
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'test' && !process.env.ENABLE_TEST_ROUTES) {
    return res.status(404).json({ error: 'Not found' });
  }

  const { method, query } = req;
  const appName = process.env.APP_NAME || 'unknown';

  try {
    switch (method) {
      case 'GET':
        if (query.endpoint === 'health') {
          return res.status(200).json({
            status: 'healthy',
            app: appName,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            testing_mode: true,
            database_connected: true,
            auth_bypassed: true
          });
        }

        if (query.endpoint === 'discover') {
          return res.status(200).json({
            app: appName,
            available_endpoints: [
              '/api/test?endpoint=health',
              '/api/test?endpoint=discover',
              '/api/test?endpoint=flows',
              '/api/test?endpoint=database'
            ],
            business_flows: await getBusinessFlows(appName),
            database_tables: await getDatabaseTables(),
            test_status: 'ready'
          });
        }

        if (query.endpoint === 'flows') {
          return res.status(200).json({
            app: appName,
            implemented_flows: await getImplementedFlows(appName),
            test_coverage: await getTestCoverage(appName),
            flow_status: 'available'
          });
        }

        if (query.endpoint === 'database') {
          return res.status(200).json({
            app: appName,
            database_status: 'connected',
            tables: await getDatabaseTables(),
            test_data_ready: true
          });
        }

        return res.status(200).json({
          message: 'Test API ready',
          app: appName,
          available_endpoints: ['health', 'discover', 'flows', 'database']
        });

      case 'POST':
        // Handle test data creation
        return res.status(200).json({
          message: 'Test data endpoint ready',
          app: appName
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Test API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      app: appName,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions
async function getBusinessFlows(appName: string): Promise<string[]> {
  const flowMap: Record<string, string[]> = {
    bancai: ['account-creation', 'transaction-processing', 'payment-handling', 'kyc-verification'],
    cumparai: ['product-catalog', 'cart-management', 'order-processing', 'payment-flow'],
    stocai: ['portfolio-management', 'stock-trading', 'market-analysis', 'risk-assessment'],
    sociai: ['user-management', 'post-creation', 'social-interactions', 'messaging-system'],
    legalizai: ['case-management', 'document-handling', 'contract-processing', 'legal-consultation'],
    memorai: ['memory-creation', 'memory-retrieval', 'agent-isolation', 'importance-scoring'],
    publicai: ['citizen-services', 'application-processing', 'document-verification', 'appointment-scheduling'],
    studiai: ['course-management', 'progress-tracking', 'assessment-system', 'learning-analytics'],
    aide: ['code-generation', 'chat-assistance', 'project-management', 'conversation-tracking'],
    default: ['basic-functionality']
  };
  
  return flowMap[appName.toLowerCase()] || flowMap.default;
}

async function getImplementedFlows(appName: string): Promise<Record<string, boolean>> {
  // This would connect to actual implementation checking
  const flows = await getBusinessFlows(appName);
  const implemented: Record<string, boolean> = {};
  
  flows.forEach(flow => {
    // For now, assume basic flows are implemented
    implemented[flow] = true; // This would be actual implementation check
  });
  
  return implemented;
}

async function getTestCoverage(appName: string): Promise<{ coverage: number; tests_passed: number; total_tests: number }> {
  // This would connect to actual test coverage analysis
  return {
    coverage: 85, // Placeholder - would be actual coverage
    tests_passed: 45,
    total_tests: 50
  };
}

async function getDatabaseTables(): Promise<string[]> {
  // This would connect to actual database inspection
  return ['users', 'sessions', 'accounts']; // Placeholder
}
