import { NextApiRequest, NextApiResponse } from 'next';

interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  environment: string;
  port: number;
  dependencies?: {
    name: string;
    status: string;
    responseTime?: number;
  }[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      status: 'error',
      service: 'admin-dashboard',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: 4007
    } as HealthResponse);
  }

  try {
    // Check dependencies
    const dependencies = [];

    // Check CBD Database connection
    try {
      const cbdStart = Date.now();
      const cbdResponse = await fetch('http://localhost:4180/health', {
        method: 'GET',
        timeout: 5000
      });
      const cbdTime = Date.now() - cbdStart;

      dependencies.push({
        name: 'cbd-database',
        status: cbdResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: cbdTime
      });
    } catch (error) {
      dependencies.push({
        name: 'cbd-database',
        status: 'unhealthy'
      });
    }

    // Check Gateway connection
    try {
      const gatewayStart = Date.now();
      const gatewayResponse = await fetch('http://localhost:4003/health', {
        method: 'GET',
        timeout: 5000
      });
      const gatewayTime = Date.now() - gatewayStart;

      dependencies.push({
        name: 'gateway-service',
        status: gatewayResponse.ok ? 'healthy' : 'unhealthy',
        responseTime: gatewayTime
      });
    } catch (error) {
      dependencies.push({
        name: 'gateway-service',
        status: 'unhealthy'
      });
    }

    const healthResponse: HealthResponse = {
      status: 'healthy',
      service: 'admin-dashboard',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: 4007,
      dependencies
    };

    res.status(200).json(healthResponse);
  } catch (error) {
    const errorResponse: HealthResponse = {
      status: 'unhealthy',
      service: 'admin-dashboard',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      port: 4007
    };

    res.status(500).json(errorResponse);
  }
}
