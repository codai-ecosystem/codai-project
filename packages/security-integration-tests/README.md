# 🔐 Security Integration Testing Suite

Comprehensive security testing framework for Essential CodAI Services, providing automated vulnerability assessment, penetration testing, and security compliance validation across all production services.

## 🚀 Overview

The Security Integration Testing Suite is an enterprise-grade security testing framework designed to validate the security posture of all Essential CodAI Services. It provides comprehensive coverage of the OWASP Top 10 vulnerabilities, security best practices, and compliance requirements through automated testing and reporting.

### 📋 Essential CodAI Services Coverage

- **CodAI Authentication API** (Port 8100) - JWT authentication, MFA, OAuth2
- **CodAI API Gateway** (Port 8010) - Rate limiting, request validation, routing security
- **CodAI Hub API** (Port 8110) - Business logic security, data validation
- **CodAI MemorAI MCP Service** (Port 4950) - Memory management security, AI service protection
- **CodAI CBD Database Service** (Port 8180) - Database security, query validation
- **CodAI MemorAI Frontend** (Port 8006) - Client-side security, XSS protection

### 🎯 Security Testing Capabilities

#### Core Test Suites
- **Rate Limiting Tests** - Validates DoS protection and traffic throttling
- **Authentication Tests** - JWT validation, session management, token security
- **Authorization Tests** - RBAC validation, privilege escalation prevention
- **Input Validation Tests** - SQL injection, command injection, data sanitization
- **XSS Protection Tests** - Cross-site scripting prevention validation
- **Security Headers Tests** - HTTP security headers compliance (OWASP guidelines)
- **Vulnerability Scanning** - Automated vulnerability detection and assessment
- **Performance Impact Tests** - Security overhead and performance validation

#### Advanced Security Features
- **OWASP Top 10 Coverage** - Comprehensive validation of critical security risks
- **Common Attack Payloads** - XSS, SQL injection, command injection, path traversal, LDAP injection
- **Real-time Monitoring** - Live security dashboard with threat detection
- **Comprehensive Reporting** - HTML and JSON reports with detailed findings
- **Compliance Validation** - GDPR, security standards compliance checking

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ (Latest LTS recommended)
- PNPM (recommended) or NPM
- TypeScript 5.6+
- All Essential CodAI Services running and healthy

### Quick Setup

```powershell
# Run the automated setup script
.\scripts\setup-security-integration-tests.ps1 -InstallTools -RunTests -GenerateReport

# Or use the interactive setup
.\scripts\setup-security-integration-tests.ps1
```

### Manual Installation

```bash
# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Run health checks
pnpm run health

# Run all security tests
pnpm run test:security
```

## 🧪 Usage Examples

### Command Line Interface

```bash
# Run comprehensive security testing
pnpm run cli -- run-all-tests --verbose

# Test specific category
pnpm run cli -- test authentication --output ./reports

# Generate security report
pnpm run cli -- generate-report --format html --output ./reports

# Start security monitoring dashboard
pnpm run cli -- monitor --port 3001

# List available services and tests
pnpm run cli -- list --services --tests

# Check service health
pnpm run cli -- health --all

# Validate configuration
pnpm run cli -- config --validate
```

### Programmatic Usage

```typescript
import { SecurityTestRunner } from './src/test-runner';
import { SecurityReportGenerator } from './src/report-generator';

// Initialize test runner
const testRunner = new SecurityTestRunner({
  verbose: true,
  outputDir: './reports',
  timeout: 30000
});

// Run comprehensive security tests
async function runSecurityTests() {
  const results = await testRunner.runAllTests();
  
  // Generate reports
  const reportGenerator = new SecurityReportGenerator();
  await reportGenerator.generateReport(results, './reports');
  
  console.log(`Security tests completed: ${results.summary.passed}/${results.summary.total} passed`);
}

// Run specific test suite
async function testAuthentication() {
  const results = await testRunner.runTestSuite('authentication');
  console.log('Authentication security test results:', results);
}
```

### Docker Integration

```yaml
# docker-compose.override.yml
services:
  security-testing:
    build:
      context: ./packages/security-integration-tests
      dockerfile: Dockerfile
    environment:
      - TEST_ENVIRONMENT=docker
      - SERVICES_BASE_URL=http://host.docker.internal
    volumes:
      - ./reports:/app/reports
    depends_on:
      - codai-auth-api
      - codai-gateway-api
      - codai-hub-api
```

## 📊 Test Configuration

### Environment Configuration

```typescript
// Security test configuration
export const SECURITY_TEST_CONFIG = {
  // Test execution settings
  timeout: 30000,
  retries: 3,
  parallel: false,
  
  // Service endpoints
  services: {
    auth: { url: 'http://localhost:8100', timeout: 10000 },
    gateway: { url: 'http://localhost:8010', timeout: 10000 },
    hub: { url: 'http://localhost:8110', timeout: 10000 },
    // ... other services
  },
  
  // Security testing profiles
  profiles: {
    quick: { timeout: 15000, depth: 'basic' },
    standard: { timeout: 30000, depth: 'comprehensive' },
    comprehensive: { timeout: 60000, depth: 'extensive' },
    compliance: { timeout: 120000, depth: 'audit-level' }
  }
};
```

### Custom Test Scenarios

```typescript
// Define custom security test scenarios
const customScenarios: TestScenario[] = [
  {
    name: 'Custom Authentication Bypass',
    category: 'authentication',
    severity: 'high',
    steps: [
      {
        action: 'request',
        method: 'POST',
        endpoint: '/auth/login',
        payload: { /* custom payload */ },
        expectedStatus: 401
      }
    ]
  }
];

// Add to test runner
testRunner.addCustomScenarios(customScenarios);
```

## 📈 Security Metrics & KPIs

### Automated Metrics Collection

- **Vulnerability Detection Rate** - % of known vulnerabilities detected
- **False Positive Rate** - Accuracy of security findings
- **Test Coverage** - % of attack vectors covered
- **Performance Impact** - Security overhead measurement
- **Compliance Score** - OWASP Top 10 and standards compliance

### Performance Benchmarks

| Service | Response Time | Security Overhead | Throughput Impact |
|---------|---------------|-------------------|-------------------|
| Auth API | < 100ms | < 5% | < 2% |
| Gateway | < 50ms | < 3% | < 1% |
| Hub API | < 150ms | < 7% | < 3% |

### Security Scoring

```typescript
interface SecurityScore {
  overall: number;        // 0-100 overall security score
  categories: {
    authentication: number;
    authorization: number;
    dataValidation: number;
    encryption: number;
    headers: number;
    vulnerabilities: number;
  };
  compliance: {
    owasp: number;         // OWASP Top 10 compliance %
    gdpr: number;          // GDPR compliance %
    iso27001: number;      // ISO 27001 alignment %
  };
}
```

## 🔍 Security Test Categories

### 1. Rate Limiting & DoS Protection

```typescript
// Test rate limiting effectiveness
const rateLimitingTests = [
  'burst_requests_detection',
  'sustained_load_handling',
  'ip_based_throttling',
  'user_based_limits',
  'bypass_attempt_detection'
];
```

### 2. Authentication Security

```typescript
// JWT and session security validation
const authenticationTests = [
  'jwt_token_validation',
  'token_expiration_handling',
  'refresh_token_security',
  'brute_force_protection',
  'session_fixation_prevention',
  'mfa_bypass_attempts',
  'oauth2_flow_security'
];
```

### 3. Authorization & RBAC

```typescript
// Role-based access control validation
const authorizationTests = [
  'privilege_escalation_prevention',
  'horizontal_access_control',
  'vertical_access_control',
  'resource_ownership_validation',
  'role_hierarchy_enforcement',
  'permission_inheritance_security'
];
```

### 4. Input Validation & Sanitization

```typescript
// Injection attack prevention
const inputValidationTests = [
  'sql_injection_prevention',
  'nosql_injection_handling',
  'command_injection_blocking',
  'ldap_injection_protection',
  'xml_injection_validation',
  'path_traversal_prevention',
  'file_upload_security'
];
```

### 5. XSS Protection

```typescript
// Cross-site scripting prevention
const xssProtectionTests = [
  'reflected_xss_prevention',
  'stored_xss_blocking',
  'dom_xss_mitigation',
  'content_security_policy',
  'output_encoding_validation',
  'javascript_injection_blocking'
];
```

### 6. Security Headers Validation

```typescript
// HTTP security headers compliance
const securityHeadersTests = [
  'content_security_policy',
  'strict_transport_security',
  'x_frame_options',
  'x_content_type_options',
  'referrer_policy',
  'permissions_policy',
  'cross_origin_policies'
];
```

## 📊 Reporting & Analytics

### HTML Security Report

The security testing suite generates comprehensive HTML reports including:

- **Executive Summary** - High-level security posture overview
- **Vulnerability Analysis** - Detailed findings with severity ratings
- **Compliance Dashboard** - OWASP Top 10 and standards compliance
- **Service-specific Results** - Per-service security assessment
- **Remediation Recommendations** - Actionable security improvements
- **Trend Analysis** - Security posture over time

### JSON API Integration

```typescript
// Export results for integration with security tools
const jsonReport = await reportGenerator.generateJsonReport(results);

// Integration examples
await sendToSIEM(jsonReport);
await updateSecurityDashboard(jsonReport);
await triggerAlerts(jsonReport.criticalFindings);
```

### Real-time Security Dashboard

```bash
# Start security monitoring dashboard
pnpm run cli -- monitor --port 3001 --realtime

# Access dashboard at http://localhost:3001
```

Dashboard features:
- Live security test execution
- Real-time threat detection
- Service health monitoring
- Security metrics visualization
- Alert management interface

## 🚨 Security Alerts & Notifications

### Automated Alerting

```typescript
// Configure security alerts
const alertConfig = {
  channels: ['email', 'slack', 'webhook'],
  thresholds: {
    critical: 0,        // Alert immediately on critical findings
    high: 1,           // Alert on multiple high-severity findings
    medium: 5,         // Alert on trend of medium findings
    performance: 10    // Alert on >10% performance impact
  }
};
```

### Integration with Security Tools

- **SIEM Integration** - Export findings to security information systems
- **Vulnerability Management** - Integration with vulnerability scanners
- **Incident Response** - Automated ticket creation for critical findings
- **Compliance Reporting** - Automated compliance status updates

## 🔧 Advanced Configuration

### Custom Payload Configuration

```typescript
// Add custom attack payloads
const customPayloads = {
  xss: [
    '<script>alert("custom-xss-test")</script>',
    'javascript:alert("dom-xss-test")'
  ],
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' UNION SELECT password FROM users --"
  ]
};
```

### Security Profiles

```typescript
// Define security testing profiles
const securityProfiles = {
  development: {
    depth: 'basic',
    timeout: 15000,
    skipDestructive: true
  },
  staging: {
    depth: 'comprehensive',
    timeout: 30000,
    skipDestructive: false
  },
  production: {
    depth: 'validation-only',
    timeout: 10000,
    skipDestructive: true,
    readOnly: true
  }
};
```

## 📚 API Reference

### SecurityTestRunner

Main class for executing security tests across Essential CodAI Services.

```typescript
class SecurityTestRunner {
  constructor(config: SecurityTestConfig)
  
  // Execute comprehensive security testing
  async runAllTests(): Promise<TestExecutionResult>
  
  // Run specific test suite
  async runTestSuite(category: string): Promise<TestSuiteResult>
  
  // Run individual test scenario
  async runTestScenario(scenario: TestScenario): Promise<TestResult>
  
  // Add custom test scenarios
  addCustomScenarios(scenarios: TestScenario[]): void
  
  // Validate service health before testing
  async validateServicesHealth(): Promise<ServiceHealthStatus[]>
}
```

### SecurityReportGenerator

Comprehensive security reporting with multiple output formats.

```typescript
class SecurityReportGenerator {
  constructor(config?: ReportConfig)
  
  // Generate comprehensive security report
  async generateReport(results: TestExecutionResult, outputDir: string): Promise<void>
  
  // Generate HTML report
  async generateHtmlReport(results: TestExecutionResult): Promise<string>
  
  // Generate JSON report for API integration
  async generateJsonReport(results: TestExecutionResult): Promise<SecurityReport>
  
  // Generate executive summary
  async generateExecutiveSummary(results: TestExecutionResult): Promise<ExecutiveSummary>
}
```

### SecurityMonitor

Real-time security monitoring and dashboard capabilities.

```typescript
class SecurityMonitor {
  constructor(config: MonitorConfig)
  
  // Start security monitoring dashboard
  async startDashboard(port: number): Promise<void>
  
  // Setup monitoring endpoints
  setupRoutes(): void
  
  // Real-time threat detection
  async detectThreats(): Promise<ThreatAlert[]>
  
  // Security metrics collection
  async collectMetrics(): Promise<SecurityMetrics>
}
```

## 🔐 Security Best Practices

### Test Environment Security

- **Isolated Testing** - Run security tests in isolated environments
- **Data Protection** - Use synthetic data for security testing
- **Network Segmentation** - Isolate security testing network traffic
- **Access Control** - Restrict security testing tool access

### Continuous Security Testing

```yaml
# GitHub Actions CI/CD integration
name: Security Integration Tests
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: pnpm install
      - name: Run security tests
        run: pnpm run test:security
      - name: Generate security report
        run: pnpm run generate-report
      - name: Upload security artifacts
        uses: actions/upload-artifact@v4
        with:
          name: security-reports
          path: reports/
```

## 🤝 Contributing

### Adding New Security Tests

1. **Define Test Scenario** - Create test scenario in `src/types.ts`
2. **Implement Test Logic** - Add test implementation in `src/test-runner.ts`
3. **Update Configuration** - Add to test suite configuration
4. **Add Documentation** - Update README and API documentation
5. **Write Unit Tests** - Ensure test coverage for new functionality

### Security Test Guidelines

- **Non-destructive Testing** - Ensure tests don't impact production data
- **Clear Test Objectives** - Document what each test validates
- **Proper Error Handling** - Handle test failures gracefully
- **Performance Consideration** - Minimize testing performance impact
- **Compliance Focus** - Align tests with security standards

## 📞 Support & Troubleshooting

### Common Issues

1. **Service Connectivity** - Ensure all Essential CodAI Services are running
2. **Authentication Failures** - Verify service authentication configuration
3. **Timeout Issues** - Adjust timeout settings for slower environments
4. **Permission Errors** - Check file system permissions for report generation

### Debug Mode

```bash
# Run with debug output
DEBUG=security-tests:* pnpm run test:security

# Verbose logging
pnpm run cli -- run-all-tests --verbose --debug
```

### Getting Help

- **GitHub Issues** - Report bugs and feature requests
- **Documentation** - Comprehensive API and usage documentation
- **Security Community** - Contribute to security testing improvements

## 📄 License

This Security Integration Testing Suite is part of the Essential CodAI Services project and follows the same licensing terms. See LICENSE file for details.

---

**Essential CodAI Services Security Integration Testing Suite** - Comprehensive security testing for enterprise-grade AI services infrastructure.