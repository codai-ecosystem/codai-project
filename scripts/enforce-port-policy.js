#!/usr/bin/env node

/**
 * Port Policy Enforcement Script
 * 
 * This script ensures that all development services start on ports 4000 or higher.
 * It checks package.json files, Docker configurations, and other service configurations.
 * 
 * Usage: node scripts/enforce-port-policy.js [--fix]
 * --fix: Automatically fix violations (use with caution)
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Port configuration
const MIN_PORT = 4000;
const MAX_PORT = 4999;

// Exception ports that are allowed to be below 4000
const EXCEPTION_PORTS = [
  80,    // HTTP
  443,   // HTTPS
  22,    // SSH
  5432,  // PostgreSQL
  5433,  // PostgreSQL (alternative)
  6379,  // Redis
  6380,  // Redis (alternative)
  27017, // MongoDB
  9090,  // Prometheus
  9091,  // Prometheus (alternative)
  9092,  // Kafka
  1025,  // SMTP
  2181,  // Zookeeper
  8200,  // Vault
  9229,  // Node.js inspector
  3100,  // Grafana
  8080,  // Generic web services
  8081,  // Generic web services
  8025,  // Mailhog Web UI
  9000,  // MinIO API
  9001,  // MinIO Console
  9093,  // Alertmanager
  9100,  // Node Exporter
  9121,  // Redis Exporter
  9200,  // Elasticsearch
  9300,  // Elasticsearch transport
  5601,  // Kibana
  5044,  // Logstash
  5000,  // Generic service
  9600,  // Logstash API
  6333,  // Qdrant
  6334,  // Qdrant (alternative)
  16686, // Jaeger UI
  14268, // Jaeger collector
  9187,  // PostgreSQL Exporter
  6686,  // Jaeger (computed from 16686)
  24224, // Fluentd
  8000   // Django default / Generic service
];

// Ignore these patterns in Docker files (they're not actual port mappings)
const IGNORE_PATTERNS = [
  /Generated:/,
  /NODE_OPTIONS/,
  /command:/,
  /VAULT_DEV_LISTEN_ADDRESS/,
  /apm-server\.host/
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

class PortPolicyEnforcer {
  constructor() {
    this.violations = [];
    this.fixMode = process.argv.includes('--fix');
    this.projectRoot = path.resolve(__dirname, '..');
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.log(`❌ ${message}`, 'red');
  }

  warning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }

  success(message) {
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  /**
   * Check if a port number is valid according to our policy
   */
  isValidPort(port) {
    const portNum = parseInt(port);
    // Allow exception ports or ports in the valid range
    return EXCEPTION_PORTS.includes(portNum) || (portNum >= MIN_PORT && portNum <= MAX_PORT);
  }

  /**
   * Extract port from package.json dev/start scripts
   */
  extractPortFromScript(script) {
    if (!script) return null;

    // Look for --port flag
    const portMatch = script.match(/--port\s+(\d+)/);
    if (portMatch) {
      return parseInt(portMatch[1]);
    }

    // Look for PORT environment variable
    const envPortMatch = script.match(/PORT=(\d+)/);
    if (envPortMatch) {
      return parseInt(envPortMatch[1]);
    }

    return null;
  }

  /**
   * Check package.json files for port violations
   */
  async checkPackageJsonFiles() {
    this.info('Checking package.json files...');

    const packageFiles = await glob('**/package.json', {
      cwd: this.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    for (const file of packageFiles) {
      const fullPath = path.join(this.projectRoot, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const packageJson = JSON.parse(content);

        if (packageJson.scripts) {
          // Check dev script
          const devPort = this.extractPortFromScript(packageJson.scripts.dev);
          if (devPort && !this.isValidPort(devPort)) {
            this.violations.push({
              file: file,
              type: 'package.json',
              field: 'scripts.dev',
              port: devPort,
              line: 'dev script'
            });
          }

          // Check start script
          const startPort = this.extractPortFromScript(packageJson.scripts.start);
          if (startPort && !this.isValidPort(startPort)) {
            this.violations.push({
              file: file,
              type: 'package.json',
              field: 'scripts.start',
              port: startPort,
              line: 'start script'
            });
          }
        }
      } catch (error) {
        this.warning(`Failed to parse ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Check Docker Compose files for port violations
   */
  async checkDockerFiles() {
    this.info('Checking Docker configuration files...');

    const dockerFiles = await glob('**/docker-compose*.{yml,yaml}', {
      cwd: this.projectRoot,
      ignore: ['**/node_modules/**']
    });

    for (const file of dockerFiles) {
      const fullPath = path.join(this.projectRoot, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Skip lines that match ignore patterns
          if (IGNORE_PATTERNS.some(pattern => pattern.test(line))) {
            return;
          }

          // Look for port mappings like "3000:3000" or "- 3000:3000"
          const portMatch = line.match(/["']?(\d{1,5}):(\d{1,5})["']?/);
          if (portMatch) {
            const hostPort = parseInt(portMatch[1]);
            if (!this.isValidPort(hostPort)) {
              this.violations.push({
                file: file,
                type: 'docker',
                field: 'ports',
                port: hostPort,
                line: index + 1,
                content: line.trim()
              });
            }
          }
        });
      } catch (error) {
        this.warning(`Failed to read ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Check projects.index.json for port assignments
   */
  async checkProjectsIndex() {
    this.info('Checking projects.index.json...');

    const projectsFile = path.join(this.projectRoot, 'projects.index.json');
    if (!fs.existsSync(projectsFile)) {
      return;
    }

    try {
      const content = fs.readFileSync(projectsFile, 'utf8');
      const projects = JSON.parse(content);

      // Check apps
      if (projects.apps) {
        projects.apps.forEach((app, index) => {
          if (app.port && !this.isValidPort(app.port)) {
            this.violations.push({
              file: 'projects.index.json',
              type: 'projects-index',
              field: `apps[${index}].port`,
              port: app.port,
              line: `app: ${app.name}`
            });
          }
        });
      }

      // Check services
      if (projects.services) {
        projects.services.forEach((service, index) => {
          if (service.port && !this.isValidPort(service.port)) {
            this.violations.push({
              file: 'projects.index.json',
              type: 'projects-index',
              field: `services[${index}].port`,
              port: service.port,
              line: `service: ${service.name}`
            });
          }
        });
      }
    } catch (error) {
      this.warning(`Failed to parse projects.index.json: ${error.message}`);
    }
  }

  /**
   * Generate a report of all violations
   */
  generateReport() {
    if (this.violations.length === 0) {
      this.success('🎉 No port policy violations found!');
      return;
    }

    this.error(`Found ${this.violations.length} port policy violations:`);
    console.log();

    this.violations.forEach((violation, index) => {
      this.log(`${index + 1}. ${violation.file}`, 'magenta');
      this.log(`   Type: ${violation.type}`, 'blue');
      this.log(`   Field: ${violation.field}`, 'blue');
      this.log(`   Port: ${violation.port} (should be >= ${MIN_PORT})`, 'red');
      this.log(`   Location: ${violation.line}`, 'blue');
      if (violation.content) {
        this.log(`   Content: ${violation.content}`, 'yellow');
      }
      console.log();
    });

    this.log(`Policy: All development ports must be >= ${MIN_PORT}`, 'yellow');
    this.log('Run with --fix to automatically correct package.json violations', 'blue');
  }

  /**
   * Automatically fix some violations (package.json only for safety)
   */
  async fixViolations() {
    if (!this.fixMode) {
      return;
    }

    this.info('Attempting to fix violations...');

    const packageViolations = this.violations.filter(v => v.type === 'package.json');

    if (packageViolations.length === 0) {
      this.warning('No package.json violations to fix automatically');
      return;
    }

    // Group by file
    const violationsByFile = {};
    packageViolations.forEach(v => {
      if (!violationsByFile[v.file]) {
        violationsByFile[v.file] = [];
      }
      violationsByFile[v.file].push(v);
    });

    // Fix each file
    for (const [file, violations] of Object.entries(violationsByFile)) {
      const fullPath = path.join(this.projectRoot, file);
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const packageJson = JSON.parse(content);

        violations.forEach(violation => {
          const suggestedPort = MIN_PORT + Math.floor(Math.random() * 100);
          this.info(`Fixing ${file}: changing port ${violation.port} to ${suggestedPort}`);

          if (violation.field === 'scripts.dev') {
            packageJson.scripts.dev = packageJson.scripts.dev.replace(
              /--port\s+\d+/,
              `--port ${suggestedPort}`
            );
          }

          if (violation.field === 'scripts.start') {
            packageJson.scripts.start = packageJson.scripts.start.replace(
              /--port\s+\d+/,
              `--port ${suggestedPort}`
            );
          }
        });

        fs.writeFileSync(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
        this.success(`Fixed ${file}`);
      } catch (error) {
        this.error(`Failed to fix ${file}: ${error.message}`);
      }
    }
  }

  /**
   * Main execution function
   */
  async run() {
    this.log('🔍 Codai Port Policy Enforcement', 'magenta');
    this.log(`Policy: All development ports must be >= ${MIN_PORT}`, 'blue');
    console.log();

    await this.checkPackageJsonFiles();
    await this.checkDockerFiles();
    await this.checkProjectsIndex();

    await this.fixViolations();
    this.generateReport();

    if (this.violations.length > 0) {
      process.exit(1);
    }
  }
}

// Run the enforcer
const enforcer = new PortPolicyEnforcer();
enforcer.run().catch(error => {
  console.error('Failed to run port policy enforcement:', error);
  process.exit(1);
});
