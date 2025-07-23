#!/usr/bin/env node
/**
 * CODAI Ecosystem Automated Service Discovery
 * Discovers all pages, API endpoints, and service capabilities
 * Generates comprehensive testing data for Playwright test suites
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

const PROJECT_ROOT = process.cwd();
const APPS_DIR = path.join(PROJECT_ROOT, 'apps');

// Service configuration based on current infrastructure
const SERVICES = {
  gateway: { port: 4000, path: 'gateway', status: 'proxy' },
  codai: { port: 4001, path: 'codai', status: 'degraded' },
  admin: { port: 4002, path: 'admin', status: 'operational' },
  hub: { port: 4003, path: 'hub', status: 'operational' },
  id: { port: 4004, path: 'id', status: 'operational' },
  bancai: { port: 4005, path: 'bancai', status: 'degraded' }
};

class ServiceDiscovery {
  constructor() {
    this.discoveryResults = {
      timestamp: new Date().toISOString(),
      services: {},
      summary: {
        totalServices: 0,
        operationalServices: 0,
        degradedServices: 0,
        totalPages: 0,
        totalApis: 0,
        totalRoutes: 0
      }
    };
  }

  async run() {
    console.log('🔍 CODAI Ecosystem Service Discovery Started\n');

    for (const [serviceName, config] of Object.entries(SERVICES)) {
      console.log(`📡 Discovering ${serviceName.toUpperCase()} service...`);
      await this.discoverService(serviceName, config);
    }

    await this.generateTestingData();
    await this.saveResults();
    this.printSummary();
  }

  async discoverService(serviceName, config) {
    const serviceData = {
      name: serviceName,
      port: config.port,
      status: config.status,
      appPath: path.join(APPS_DIR, config.path),
      pages: [],
      apis: [],
      routes: [],
      capabilities: [],
      healthCheck: null
    };

    try {
      // Check if service directory exists
      const appExists = await this.checkAppExists(serviceData.appPath);
      if (!appExists) {
        serviceData.error = 'App directory not found';
        this.discoveryResults.services[serviceName] = serviceData;
        return;
      }

      // Discover pages
      await this.discoverPages(serviceData);

      // Discover API endpoints
      await this.discoverApis(serviceData);

      // Discover routes and components
      await this.discoverRoutes(serviceData);

      // Detect service capabilities
      await this.detectCapabilities(serviceData);

      // Perform health check if operational
      if (config.status === 'operational') {
        await this.performHealthCheck(serviceData);
      }

      console.log(`   ✅ Found ${serviceData.pages.length} pages, ${serviceData.apis.length} APIs, ${serviceData.routes.length} routes`);

    } catch (error) {
      console.log(`   ❌ Error discovering ${serviceName}: ${error.message}`);
      serviceData.error = error.message;
    }

    this.discoveryResults.services[serviceName] = serviceData;
  }

  async checkAppExists(appPath) {
    try {
      await fs.access(appPath);
      return true;
    } catch {
      return false;
    }
  }

  async discoverPages(serviceData) {
    const pageDirs = [
      path.join(serviceData.appPath, 'src', 'app'),
      path.join(serviceData.appPath, 'app'),
      path.join(serviceData.appPath, 'src', 'pages'),
      path.join(serviceData.appPath, 'pages')
    ];

    for (const pageDir of pageDirs) {
      try {
        await fs.access(pageDir);
        const pages = await this.findPagesRecursive(pageDir, pageDir);
        serviceData.pages.push(...pages);
      } catch {
        // Directory doesn't exist, skip
      }
    }

    // Remove duplicates and sort
    serviceData.pages = [...new Set(serviceData.pages)].sort();
  }

  async findPagesRecursive(dir, baseDir) {
    const pages = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subPages = await this.findPagesRecursive(fullPath, baseDir);
          pages.push(...subPages);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.jsx' || entry.name === 'page.ts' || entry.name === 'page.js') {
          // Found a page file
          const relativePath = path.relative(baseDir, dir);
          const routePath = relativePath.replace(/\\/g, '/');
          pages.push(routePath === '' ? '/' : `/${routePath}`);
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }

    return pages;
  }

  async discoverApis(serviceData) {
    const apiDirs = [
      path.join(serviceData.appPath, 'src', 'app', 'api'),
      path.join(serviceData.appPath, 'app', 'api'),
      path.join(serviceData.appPath, 'src', 'pages', 'api'),
      path.join(serviceData.appPath, 'pages', 'api'),
      path.join(serviceData.appPath, 'api')
    ];

    for (const apiDir of apiDirs) {
      try {
        await fs.access(apiDir);
        const apis = await this.findApisRecursive(apiDir, apiDir);
        serviceData.apis.push(...apis);
      } catch {
        // Directory doesn't exist, skip
      }
    }

    // Remove duplicates and sort
    serviceData.apis = [...new Set(serviceData.apis)].sort();
  }

  async findApisRecursive(dir, baseDir) {
    const apis = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subApis = await this.findApisRecursive(fullPath, baseDir);
          apis.push(...subApis);
        } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
          // Found an API route file
          const relativePath = path.relative(baseDir, dir);
          const routePath = relativePath.replace(/\\/g, '/');

          // Try to detect HTTP methods from the file
          const methods = await this.detectHttpMethods(fullPath);
          apis.push({
            path: routePath === '' ? '/' : `/${routePath}`,
            file: fullPath,
            methods: methods
          });
        }
      }
    } catch (error) {
      // Skip directories that can't be read
    }

    return apis;
  }

  async detectHttpMethods(filePath) {
    const methods = [];
    try {
      const content = await fs.readFile(filePath, 'utf8');

      // Look for exported HTTP method functions
      if (/export\s+async\s+function\s+GET/m.test(content)) methods.push('GET');
      if (/export\s+async\s+function\s+POST/m.test(content)) methods.push('POST');
      if (/export\s+async\s+function\s+PUT/m.test(content)) methods.push('PUT');
      if (/export\s+async\s+function\s+DELETE/m.test(content)) methods.push('DELETE');
      if (/export\s+async\s+function\s+PATCH/m.test(content)) methods.push('PATCH');
      if (/export\s+async\s+function\s+HEAD/m.test(content)) methods.push('HEAD');
      if (/export\s+async\s+function\s+OPTIONS/m.test(content)) methods.push('OPTIONS');
    } catch {
      // If we can't read the file, assume basic methods
      methods.push('GET', 'POST');
    }

    return methods.length > 0 ? methods : ['GET', 'POST'];
  }

  async discoverRoutes(serviceData) {
    // Look for additional routing patterns
    const routeFiles = [
      path.join(serviceData.appPath, 'src', 'lib', 'routes.ts'),
      path.join(serviceData.appPath, 'src', 'lib', 'routes.js'),
      path.join(serviceData.appPath, 'lib', 'routes.ts'),
      path.join(serviceData.appPath, 'lib', 'routes.js'),
      path.join(serviceData.appPath, 'routes.ts'),
      path.join(serviceData.appPath, 'routes.js')
    ];

    for (const routeFile of routeFiles) {
      try {
        await fs.access(routeFile);
        const routes = await this.parseRouteFile(routeFile);
        serviceData.routes.push(...routes);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  async parseRouteFile(filePath) {
    const routes = [];
    try {
      const content = await fs.readFile(filePath, 'utf8');

      // Look for route patterns (simplified parsing)
      const routeMatches = content.match(/['"`]\/[^'"`\s]*['"`]/g);
      if (routeMatches) {
        routes.push(...routeMatches.map(route => route.slice(1, -1)));
      }
    } catch {
      // Skip files that can't be parsed
    }

    return routes;
  }

  async detectCapabilities(serviceData) {
    const capabilities = [];

    // Check package.json for dependencies
    try {
      const packageJsonPath = path.join(serviceData.appPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Detect framework capabilities
      if (deps['next']) capabilities.push('Next.js');
      if (deps['react']) capabilities.push('React');
      if (deps['@auth/nextjs'] || deps['next-auth']) capabilities.push('Authentication');
      if (deps['prisma'] || deps['@prisma/client']) capabilities.push('Database');
      if (deps['stripe']) capabilities.push('Payments');
      if (deps['@codai/sso-sdk']) capabilities.push('SSO');
      if (deps['@codai/shared-ui']) capabilities.push('Shared UI');

      // Check for specific service types
      if (serviceData.name === 'id' && serviceData.apis.some(api => api.path.includes('oauth'))) {
        capabilities.push('OAuth2', 'Identity Provider');
      }
      if (serviceData.name === 'admin') {
        capabilities.push('Administration', 'Monitoring');
      }
      if (serviceData.name === 'hub') {
        capabilities.push('Central Hub', 'Service Discovery');
      }

    } catch {
      // Skip if package.json not found
    }

    serviceData.capabilities = capabilities;
  }

  async performHealthCheck(serviceData) {
    try {
      // Try to fetch health endpoint
      const healthUrl = `http://localhost:${serviceData.port}/api/health`;
      const response = await fetch(healthUrl);

      serviceData.healthCheck = {
        url: healthUrl,
        status: response.status,
        ok: response.ok,
        timestamp: new Date().toISOString()
      };

      if (response.ok) {
        try {
          const healthData = await response.json();
          serviceData.healthCheck.data = healthData;
        } catch {
          // Health endpoint doesn't return JSON
        }
      }
    } catch (error) {
      serviceData.healthCheck = {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async generateTestingData() {
    console.log('\n📊 Generating test data structures...');

    // Generate page test data
    const pageTests = [];
    const apiTests = [];
    const integrationTests = [];

    for (const [serviceName, serviceData] of Object.entries(this.discoveryResults.services)) {
      if (serviceData.error) continue;

      // Generate page tests
      for (const page of serviceData.pages) {
        pageTests.push({
          service: serviceName,
          port: serviceData.port,
          path: page,
          url: `http://localhost:${serviceData.port}${page}`,
          type: 'page',
          testId: `${serviceName}-page-${page.replace(/\//g, '_') || 'root'}`
        });
      }

      // Generate API tests
      for (const api of serviceData.apis) {
        for (const method of api.methods) {
          apiTests.push({
            service: serviceName,
            port: serviceData.port,
            path: api.path,
            url: `http://localhost:${serviceData.port}/api${api.path}`,
            method: method,
            type: 'api',
            testId: `${serviceName}-api-${method.toLowerCase()}-${api.path.replace(/\//g, '_') || 'root'}`
          });
        }
      }

      // Generate integration test scenarios
      if (serviceData.status === 'operational') {
        integrationTests.push({
          service: serviceName,
          port: serviceData.port,
          type: 'health_check',
          testId: `${serviceName}-health-check`
        });

        if (serviceData.capabilities.includes('Authentication')) {
          integrationTests.push({
            service: serviceName,
            port: serviceData.port,
            type: 'authentication_flow',
            testId: `${serviceName}-auth-flow`
          });
        }
      }
    }

    this.discoveryResults.testData = {
      pageTests,
      apiTests,
      integrationTests
    };
  }

  calculateSummary() {
    let totalServices = 0;
    let operationalServices = 0;
    let degradedServices = 0;
    let totalPages = 0;
    let totalApis = 0;
    let totalRoutes = 0;

    for (const serviceData of Object.values(this.discoveryResults.services)) {
      if (serviceData.error) continue;

      totalServices++;
      if (serviceData.status === 'operational') operationalServices++;
      if (serviceData.status === 'degraded') degradedServices++;

      totalPages += serviceData.pages.length;
      totalApis += serviceData.apis.length;
      totalRoutes += serviceData.routes.length;
    }

    this.discoveryResults.summary = {
      totalServices,
      operationalServices,
      degradedServices,
      totalPages,
      totalApis,
      totalRoutes
    };
  }

  async saveResults() {
    this.calculateSummary();

    const outputPath = path.join(PROJECT_ROOT, 'discovery-results.json');
    await fs.writeFile(outputPath, JSON.stringify(this.discoveryResults, null, 2));

    console.log(`\n💾 Discovery results saved to: ${outputPath}`);
  }

  printSummary() {
    console.log('\n📋 DISCOVERY SUMMARY');
    console.log('===================');

    const { summary } = this.discoveryResults;
    console.log(`Total Services: ${summary.totalServices}`);
    console.log(`Operational Services: ${summary.operationalServices}`);
    console.log(`Degraded Services: ${summary.degradedServices}`);
    console.log(`Total Pages: ${summary.totalPages}`);
    console.log(`Total APIs: ${summary.totalApis}`);
    console.log(`Total Routes: ${summary.totalRoutes}`);

    console.log('\n📝 SERVICE DETAILS');
    console.log('==================');

    for (const [serviceName, serviceData] of Object.entries(this.discoveryResults.services)) {
      const status = serviceData.error ? '❌ ERROR' :
        serviceData.status === 'operational' ? '✅ OPERATIONAL' :
          serviceData.status === 'degraded' ? '⚠️ DEGRADED' : '❓ UNKNOWN';

      console.log(`${serviceName.toUpperCase()} (${serviceData.port}): ${status}`);

      if (serviceData.error) {
        console.log(`   Error: ${serviceData.error}`);
      } else {
        console.log(`   Pages: ${serviceData.pages.length}`);
        console.log(`   APIs: ${serviceData.apis.length}`);
        console.log(`   Capabilities: ${serviceData.capabilities.join(', ')}`);

        if (serviceData.healthCheck) {
          const healthStatus = serviceData.healthCheck.ok ? '✅ HEALTHY' : '❌ UNHEALTHY';
          console.log(`   Health: ${healthStatus}`);
        }
      }
      console.log('');
    }

    if (this.discoveryResults.testData) {
      console.log('🧪 TEST DATA GENERATED');
      console.log('======================');
      console.log(`Page Tests: ${this.discoveryResults.testData.pageTests.length}`);
      console.log(`API Tests: ${this.discoveryResults.testData.apiTests.length}`);
      console.log(`Integration Tests: ${this.discoveryResults.testData.integrationTests.length}`);
    }

    console.log('\n✅ Service discovery completed successfully!');
    console.log('🚀 Ready to proceed with comprehensive test implementation.');
  }
}

// Run the discovery
const discovery = new ServiceDiscovery();
discovery.run().catch(console.error);

export { ServiceDiscovery };
