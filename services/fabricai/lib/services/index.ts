/**
 * Codai Ecosystem Services
 * Centralized export for all service integrations
 */

export * from './logai';
export * from './memorai';
export * from './codai';

// Service health monitoring utilities
export interface ServiceStatus {
  logai: boolean;
  memorai: boolean;
  codai: boolean;
}

export async function checkServiceHealth(): Promise<ServiceStatus> {
  const [logaiHealth, memoraiHealth, codaiHealth] = await Promise.allSettled([
    checkLogAIHealth(),
    checkMemorAIHealth(),
    checkCodaiHealth(),
  ]);

  return {
    logai: logaiHealth.status === 'fulfilled' && logaiHealth.value,
    memorai: memoraiHealth.status === 'fulfilled' && memoraiHealth.value,
    codai: codaiHealth.status === 'fulfilled' && codaiHealth.value,
  };
}

async function checkLogAIHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.LOGAI_API_URL || 'http://localhost:3002'}/health`,
      { 
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function checkMemorAIHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.MEMORAI_API_URL || 'http://localhost:3001'}/health`,
      { 
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function checkCodaiHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.CODAI_API_URL || 'http://localhost:3000'}/health`,
      { 
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
