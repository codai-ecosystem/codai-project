/**
 * CODAI CLI Service Configuration
 * Defines all services in the CODAI ecosystem
 */

export interface Service {
  name: string;
  displayName: string;
  port: number;
  url: string;
  healthPath: string;
  description: string;
  category: 'core' | 'frontend' | 'backend' | 'tools';
  required: boolean;
  dependencies?: string[];
}

export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'unknown';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
  error?: string;
  details?: any;
}

export interface ServiceStatus extends ServiceHealth {
  url: string;
  port: number;
  category: string;
}

/**
 * Complete CODAI Ecosystem Services Configuration
 */
export const SERVICES: Service[] = [
  // Core Backend Services
  {
    name: 'gateway',
    displayName: 'Gateway Service',
    port: 4003,
    url: 'http://localhost:4003',
    healthPath: '/health',
    description: 'API Gateway and service router',
    category: 'core',
    required: true
  },
  {
    name: 'cbd',
    displayName: 'CBD Universal Database',
    port: 4180,
    url: 'http://localhost:4180',
    healthPath: '/health',
    description: 'Universal database with 6 paradigms',
    category: 'backend',
    required: true
  },

  // Frontend Applications
  {
    name: 'codai',
    displayName: 'CODAI Main App',
    port: 4001,
    url: 'http://localhost:4001',
    healthPath: '/api/health',
    description: 'Main CODAI application',
    category: 'frontend',
    required: true,
    dependencies: ['gateway', 'cbd']
  },
  {
    name: 'id',
    displayName: 'ID Service',
    port: 4004,
    url: 'http://localhost:4004',
    healthPath: '/api/health',
    description: 'Identity and authentication service',
    category: 'frontend',
    required: true,
    dependencies: ['cbd']
  },
  {
    name: 'bancai',
    displayName: 'BancAI Service',
    port: 4005,
    url: 'http://localhost:4005',
    healthPath: '/api/health',
    description: 'Banking AI platform',
    category: 'frontend',
    required: false,
    dependencies: ['cbd', 'id']
  },
  {
    name: 'memorai',
    displayName: 'MemorAI Service',
    port: 4006,
    url: 'http://localhost:4006',
    healthPath: '/api/health',
    description: 'Memory management platform',
    category: 'frontend',
    required: false,
    dependencies: ['cbd']
  },
  {
    name: 'admin',
    displayName: 'Admin Dashboard',
    port: 4007,
    url: 'http://localhost:4007',
    healthPath: '/api/health',
    description: 'Administrative dashboard',
    category: 'frontend',
    required: true,
    dependencies: ['gateway', 'cbd']
  },
  {
    name: 'hub',
    displayName: 'Hub Service',
    port: 4008,
    url: 'http://localhost:4008',
    healthPath: '/api/health',
    description: 'Service orchestration hub',
    category: 'frontend',
    required: true,
    dependencies: ['gateway']
  },
  {
    name: 'controlai',
    displayName: 'ControlAI Dashboard',
    port: 4200,
    url: 'http://localhost:4200',
    healthPath: '/api/health',
    description: 'Project management and coordination',
    category: 'tools',
    required: false,
    dependencies: ['cbd']
  },
  {
    name: 'romai',
    displayName: 'RomAI Platform',
    port: 6100,
    url: 'http://localhost:6100',
    healthPath: '/api/health',
    description: 'Romanian AI platform',
    category: 'frontend',
    required: false
  }
];

/**
 * Service categories for organization
 */
export const SERVICE_CATEGORIES = {
  core: {
    name: 'Core Services',
    description: 'Essential system services',
    color: 'red'
  },
  backend: {
    name: 'Backend Services',
    description: 'Data and API services',
    color: 'blue'
  },
  frontend: {
    name: 'Frontend Applications',
    description: 'User interface applications',
    color: 'green'
  },
  tools: {
    name: 'Tools & Utilities',
    description: 'Development and management tools',
    color: 'yellow'
  }
};

/**
 * Get service by name
 */
export function getService(name: string): Service | undefined {
  return SERVICES.find(service => service.name === name);
}

/**
 * Get services by category
 */
export function getServicesByCategory(category: string): Service[] {
  return SERVICES.filter(service => service.category === category);
}

/**
 * Get required services
 */
export function getRequiredServices(): Service[] {
  return SERVICES.filter(service => service.required);
}

/**
 * Get optional services
 */
export function getOptionalServices(): Service[] {
  return SERVICES.filter(service => !service.required);
}

/**
 * Get service dependencies
 */
export function getServiceDependencies(serviceName: string): Service[] {
  const service = getService(serviceName);
  if (!service || !service.dependencies) {
    return [];
  }
  
  return service.dependencies
    .map(depName => getService(depName))
    .filter(dep => dep !== undefined) as Service[];
}

/**
 * Check if service has dependencies
 */
export function hasDependencies(serviceName: string): boolean {
  const service = getService(serviceName);
  return service?.dependencies ? service.dependencies.length > 0 : false;
}

/**
 * Get startup order based on dependencies
 */
export function getStartupOrder(): Service[] {
  const ordered: Service[] = [];
  const remaining = [...SERVICES];
  
  while (remaining.length > 0) {
    const canStart = remaining.filter(service => {
      if (!service.dependencies) return true;
      return service.dependencies.every(dep => 
        ordered.some(started => started.name === dep)
      );
    });
    
    if (canStart.length === 0) {
      // Circular dependency or missing dependency
      ordered.push(...remaining);
      break;
    }
    
    canStart.forEach(service => {
      ordered.push(service);
      const index = remaining.indexOf(service);
      remaining.splice(index, 1);
    });
  }
  
  return ordered;
}

/**
 * Default CLI configuration
 */
export const CLI_CONFIG = {
  gatewayUrl: 'http://localhost:4003',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
  healthCheckInterval: 5000,
  logLevel: 'info' as 'debug' | 'info' | 'warn' | 'error'
};

export default SERVICES;
