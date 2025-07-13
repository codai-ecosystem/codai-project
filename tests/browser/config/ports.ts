// Browser test port configuration
export const APP_PORTS = {
  // Core Apps (Priority 1-3)
  codai: 3000,
  memorai: 3001,
  logai: 3002,
  bancai: 3003,
  wallet: 3004,
  fabricai: 3005,
  x: 3006,
  studiai: 3007,
  sociai: 3008,
  cumparai: 3009,
  publicai: 3010,

  // Extended Services  
  admin: 3011,
  AIDE: 3012,
  ajutai: 3013,
  analizai: 3014,
  dash: 3015,
  docs: 3016,
  explorer: 3017,
  hub: 3018,
  id: 3019,
  jucai: 3020,
  kodex: 3021,
  legalizai: 4022,
  marketai: 4023,
  metu: 4024,
  mod: 4025,
  stocai: 4026,
  templates: 4027,
  tools: 4028
} as const;

// Generate app URLs
export const APP_URLS = Object.entries(APP_PORTS).reduce((urls, [app, port]) => {
  urls[app as keyof typeof APP_PORTS] = `http://localhost:${port}`;
  return urls;
}, {} as Record<keyof typeof APP_PORTS, string>);

// Test configuration
export const TEST_CONFIG = {
  // Default timeouts
  pageLoadTimeout: 30000,
  elementTimeout: 10000,
  networkTimeout: 30000,

  // Performance thresholds
  performance: {
    maxLoadTime: 3000,
    maxFirstContentfulPaint: 1500,
    maxDomContentLoaded: 2000
  },

  // Accessibility settings
  accessibility: {
    failOnViolations: true,
    ignoreMinorViolations: false,
    skipAxeCheck: false
  },

  // Browser settings
  browser: {
    headless: false,
    slowMo: 100,
    timeout: 30000
  }
} as const;

// Service health check helper
export async function waitForService(port: number, maxWaitTime = 30000): Promise<boolean> {
  const startTime = Date.now();
  const url = `http://localhost:${port}`;

  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(url);
      if (response.ok || response.status === 404) {
        console.log(`✅ Service on port ${port} is ready`);
        return true;
      }
    } catch (error) {
      // Service not ready yet, continue waiting
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.warn(`⚠️  Service on port ${port} not ready after ${maxWaitTime}ms`);
  return false;
}

// Multi-service health check
export async function waitForServices(services: (keyof typeof APP_PORTS)[], maxWaitTime = 30000): Promise<boolean> {
  console.log(`Waiting for services: ${services.join(', ')}`);

  const healthChecks = services.map(service =>
    waitForService(APP_PORTS[service], maxWaitTime)
  );

  const results = await Promise.all(healthChecks);
  const allReady = results.every(ready => ready);

  if (allReady) {
    console.log('✅ All services are ready for testing');
  } else {
    console.warn('⚠️  Some services are not ready');
  }

  return allReady;
}
