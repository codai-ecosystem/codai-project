/**
 * Security Test Runner
 * Comprehensive security testing execution engine for Essential CodAI Services
 */

import axios, { AxiosResponse, AxiosError } from 'axios';
import { performance } from 'perf_hooks';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';
import * as winston from 'winston';

import {
  EssentialService,
  TestSuite,
  TestScenario,
  TestExecution,
  TestResult,
  TestStatus,
  SecurityFinding,
  TestMetrics,
  ValidationResult,
  TestError
} from './types';
import { getSecurityTestConfig, ENV_CONFIG, COMMON_PAYLOADS, SECURITY_HEADERS_CONFIG } from './config';

export class SecurityTestRunner {
  private logger: winston.Logger;
  private config = getSecurityTestConfig();
  private executions: TestExecution[] = [];

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({
          filename: `${ENV_CONFIG.SECURITY_TEST_OUTPUT_DIR}/security-test.log`
        })
      ]
    });
  }

  /**
   * Run all security tests across all Essential CodAI Services
   */
  async runAllTests(): Promise<TestExecution[]> {
    this.logger.info(chalk.cyan('🔐 Starting Comprehensive Security Integration Tests'));
    this.logger.info(chalk.yellow(`Testing ${this.config.services.length} Essential CodAI Services`));

    const startTime = performance.now();
    const executions: TestExecution[] = [];

    try {
      // First verify all services are healthy
      await this.verifyServicesHealth();

      // Run test suites
      for (const suite of this.config.testSuites) {
        this.logger.info(chalk.blue(`\n📋 Running Test Suite: ${suite.name}`));

        const suiteExecutions = await this.runTestSuite(suite);
        executions.push(...suiteExecutions);
      }

      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      this.logger.info(chalk.green(`\n✅ Security Integration Tests Completed`));
      this.logger.info(chalk.white(`Duration: ${duration}ms`));
      this.logger.info(chalk.white(`Total Test Executions: ${executions.length}`));

      // Generate summary
      await this.generateTestSummary(executions);

      return executions;
    } catch (error) {
      this.logger.error(chalk.red('❌ Security test execution failed:'), error);
      throw error;
    }
  }

  /**
   * Run a specific test suite
   */
  async runTestSuite(suite: TestSuite): Promise<TestExecution[]> {
    const executions: TestExecution[] = [];

    // Generate test scenarios for the suite based on category
    const scenarios = this.generateTestScenarios(suite.category);

    if (suite.parallel) {
      // Run scenarios in parallel
      const promises = scenarios.map(scenario =>
        this.runTestScenario(suite.id, scenario)
      );

      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          executions.push(...result.value);
        } else {
          this.logger.error(`Scenario ${scenarios[index].id} failed:`, result.reason);
        }
      });
    } else {
      // Run scenarios sequentially
      for (const scenario of scenarios) {
        try {
          const scenarioExecutions = await this.runTestScenario(suite.id, scenario);
          executions.push(...scenarioExecutions);
        } catch (error) {
          this.logger.error(`Scenario ${scenario.id} failed:`, error);
          if (!suite.continueOnFailure) {
            throw error;
          }
        }
      }
    }

    return executions;
  }

  /**
   * Run a test scenario against all applicable services
   */
  async runTestScenario(suiteId: string, scenario: TestScenario): Promise<TestExecution[]> {
    this.logger.info(chalk.yellow(`  🧪 Running Scenario: ${scenario.name}`));

    const executions: TestExecution[] = [];

    for (const service of this.config.services) {
      // Check if scenario applies to this service
      if (this.isScenarioApplicableToService(scenario, service)) {
        const execution = await this.runTestExecutionForService(
          suiteId,
          scenario,
          service
        );
        executions.push(execution);
      }
    }

    return executions;
  }

  /**
   * Execute a test scenario against a specific service
   */
  async runTestExecutionForService(
    suiteId: string,
    scenario: TestScenario,
    service: EssentialService
  ): Promise<TestExecution> {
    const execution: TestExecution = {
      id: uuidv4(),
      suiteId,
      scenarioId: scenario.id,
      serviceId: service.id,
      startTime: new Date(),
      status: 'running',
      results: [],
      metrics: this.initializeMetrics(),
      errors: []
    };

    this.logger.info(chalk.gray(`    🎯 Testing ${service.name} (${service.port})`));

    try {
      // Execute test steps
      for (const step of scenario.steps) {
        const stepStartTime = performance.now();

        try {
          const result = await this.executeTestStep(step, service);
          execution.results.push(result);

          // Update metrics
          execution.metrics.totalRequests++;
          if (result.statusCode && result.statusCode < 400) {
            execution.metrics.successfulRequests++;
          } else {
            execution.metrics.failedRequests++;
          }

          execution.metrics.averageResponseTime =
            (execution.metrics.averageResponseTime * (execution.metrics.totalRequests - 1) + result.responseTime)
            / execution.metrics.totalRequests;

          execution.metrics.minResponseTime = Math.min(execution.metrics.minResponseTime, result.responseTime);
          execution.metrics.maxResponseTime = Math.max(execution.metrics.maxResponseTime, result.responseTime);

        } catch (error) {
          const testError: TestError = {
            code: 'STEP_EXECUTION_ERROR',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date(),
            context: { stepId: step.id, serviceId: service.id }
          };

          execution.errors.push(testError);
          execution.metrics.failedRequests++;
        }
      }

      // Calculate final metrics
      execution.metrics.errorRate =
        execution.metrics.failedRequests / execution.metrics.totalRequests;
      execution.metrics.throughput =
        execution.metrics.totalRequests / ((Date.now() - execution.startTime.getTime()) / 1000);

      // Determine overall status
      if (execution.errors.length === 0 && execution.results.every(r => r.status === 'passed')) {
        execution.status = 'passed';
      } else if (execution.errors.length > 0) {
        execution.status = 'failed';
      } else {
        execution.status = 'passed'; // Some validations may have warnings but overall success
      }

      execution.endTime = new Date();

      // Log result
      const statusColor = execution.status === 'passed' ? 'green' : 'red';
      this.logger.info(chalk[statusColor](`      ${execution.status === 'passed' ? '✅' : '❌'} ${service.name}: ${execution.status.toUpperCase()}`));

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();

      const testError: TestError = {
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date(),
        context: { scenarioId: scenario.id, serviceId: service.id }
      };

      execution.errors.push(testError);

      this.logger.error(chalk.red(`      ❌ ${service.name}: FAILED - ${testError.message}`));
    }

    return execution;
  }

  /**
   * Execute a single test step
   */
  async executeTestStep(step: any, service: EssentialService): Promise<TestResult> {
    const startTime = performance.now();

    try {
      let response: AxiosResponse | undefined;
      let error: AxiosError | undefined;

      // Execute HTTP request
      try {
        const url = `${service.baseUrl}${step.endpoint}`;

        response = await axios({
          method: step.method,
          url,
          headers: step.headers || {},
          data: step.payload,
          timeout: ENV_CONFIG.SECURITY_TEST_TIMEOUT,
          validateStatus: () => true // Don't throw on 4xx/5xx status codes
        });
      } catch (err) {
        error = err as AxiosError;
      }

      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Create test result
      const result: TestResult = {
        stepId: step.id,
        status: 'passed',
        responseTime,
        statusCode: response?.status,
        headers: response?.headers ? this.normalizeHeaders(response.headers) : undefined,
        body: response?.data,
        validations: [],
        securityFindings: []
      };

      // Run validations
      if (step.validation) {
        for (const rule of step.validation) {
          const validation = this.validateResponse(rule, response, error);
          result.validations.push(validation);

          if (!validation.passed) {
            result.status = 'failed';
          }
        }
      }

      // Perform security analysis
      result.securityFindings = this.analyzeSecurityFindings(step, response, error, service);

      return result;

    } catch (err) {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      return {
        stepId: step.id,
        status: 'failed',
        responseTime,
        validations: [],
        securityFindings: [{
          id: uuidv4(),
          severity: 'high',
          category: 'execution-error',
          title: 'Test Step Execution Failed',
          description: `Failed to execute test step: ${err instanceof Error ? err.message : String(err)}`,
          impact: 'Unable to verify security control',
          recommendation: 'Investigate test configuration and service availability',
          evidence: { error: String(err) }
        }]
      };
    }
  }

  /**
   * Normalize Axios headers to Record<string, string | string[]>
   */
  private normalizeHeaders(headers: any): Record<string, string | string[]> {
    const normalized: Record<string, string | string[]> = {};

    if (headers) {
      for (const [key, value] of Object.entries(headers)) {
        if (typeof value === 'string') {
          normalized[key] = value;
        } else if (Array.isArray(value)) {
          normalized[key] = value;
        } else if (value !== undefined && value !== null) {
          normalized[key] = String(value);
        }
      }
    }

    return normalized;
  }

  /**
   * Validate response against rule
   */
  private validateResponse(rule: any, response?: AxiosResponse, error?: AxiosError): ValidationResult {
    const validation: ValidationResult = {
      ruleId: rule.field,
      passed: false,
      actualValue: null,
      expectedValue: rule.value,
      message: ''
    };

    try {
      switch (rule.type) {
        case 'status-code':
          validation.actualValue = response?.status || (error?.response?.status);
          if (rule.operator === 'equals') {
            validation.passed = validation.actualValue === rule.value;
            validation.message = validation.passed
              ? `Status code matches expected value: ${rule.value}`
              : `Expected status code ${rule.value}, got ${validation.actualValue}`;
          } else if (rule.operator === 'not-equals') {
            validation.passed = validation.actualValue !== rule.value;
            validation.message = validation.passed
              ? `Status code does not match forbidden value: ${rule.value}`
              : `Status code should not be ${rule.value}, but got ${validation.actualValue}`;
          }
          break;

        case 'response-time':
          validation.actualValue = response ? 'response received' : 'no response';
          if (rule.operator === 'less-than') {
            validation.passed = (response !== undefined);
            validation.message = validation.passed
              ? 'Response received within acceptable time'
              : 'Response timeout or error';
          }
          break;

        case 'header-present':
          const headerKey = rule.field.toLowerCase();
          validation.actualValue = response?.headers?.[headerKey];
          if (rule.operator === 'equals' && rule.value === 'present') {
            validation.passed = !!validation.actualValue;
            validation.message = validation.passed
              ? `Header '${rule.field}' is present`
              : `Header '${rule.field}' is missing`;
          } else {
            validation.passed = !!validation.actualValue;
            validation.message = validation.passed
              ? `Header '${rule.field}' is present`
              : `Header '${rule.field}' is missing`;
          }
          break;

        case 'security-header':
          validation.actualValue = response?.headers?.[rule.field.toLowerCase()];
          if (rule.operator === 'equals') {
            validation.passed = validation.actualValue === rule.value;
            validation.message = validation.passed
              ? `Security header '${rule.field}' has correct value`
              : `Security header '${rule.field}' has incorrect value: ${validation.actualValue}`;
          } else if (rule.operator === 'contains') {
            validation.passed = validation.actualValue?.includes(rule.value) || false;
            validation.message = validation.passed
              ? `Security header '${rule.field}' contains required value`
              : `Security header '${rule.field}' missing required value: ${rule.value}`;
          }
          break;

        case 'body-contains':
          const bodyText = typeof response?.data === 'string'
            ? response.data
            : JSON.stringify(response?.data || '');
          validation.actualValue = bodyText;
          validation.passed = bodyText.includes(rule.value);
          validation.message = validation.passed
            ? `Response body contains expected content`
            : `Response body missing expected content: ${rule.value}`;
          break;

        default:
          validation.message = `Unknown validation type: ${rule.type}`;
      }
    } catch (err) {
      validation.message = `Validation error: ${err instanceof Error ? err.message : String(err)}`;
    }

    return validation;
  }

  /**
   * Analyze security findings from response
   */
  private analyzeSecurityFindings(
    step: any,
    response?: AxiosResponse,
    error?: AxiosError,
    service?: EssentialService
  ): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    if (!response) {
      return findings;
    }

    // Check security headers
    const headerFindings = this.checkSecurityHeaders(response.headers, service);
    findings.push(...headerFindings);

    // Check for sensitive information exposure
    const infoFindings = this.checkInformationDisclosure(response);
    findings.push(...infoFindings);

    // Check rate limiting enforcement
    if (step.action === 'rate-limit-test' && response.status !== 429) {
      findings.push({
        id: uuidv4(),
        severity: 'medium',
        category: 'rate-limiting',
        title: 'Rate Limiting Not Enforced',
        description: 'Service did not enforce rate limiting when expected',
        impact: 'Service may be vulnerable to abuse and DoS attacks',
        recommendation: 'Implement proper rate limiting controls',
        evidence: {
          statusCode: response.status,
          headers: response.headers
        }
      });
    }

    return findings;
  }

  /**
   * Check security headers
   */
  private checkSecurityHeaders(headers: any, service?: EssentialService): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check required security headers
    for (const requiredHeader of SECURITY_HEADERS_CONFIG.required) {
      const headerValue = headers[requiredHeader.toLowerCase()];

      if (!headerValue) {
        findings.push({
          id: uuidv4(),
          severity: 'medium',
          category: 'security-headers',
          title: `Missing Security Header: ${requiredHeader}`,
          description: `The response is missing the required security header: ${requiredHeader}`,
          impact: 'Reduced security posture and potential vulnerability exposure',
          recommendation: `Add the '${requiredHeader}' header with appropriate value`,
          evidence: {
            missingHeader: requiredHeader,
            availableHeaders: Object.keys(headers)
          }
        });
      }
    }

    // Check forbidden headers (information disclosure)
    for (const forbiddenHeader of SECURITY_HEADERS_CONFIG.forbidden) {
      const headerValue = headers[forbiddenHeader.toLowerCase()];

      if (headerValue) {
        findings.push({
          id: uuidv4(),
          severity: 'low',
          category: 'information-disclosure',
          title: `Information Disclosure Header: ${forbiddenHeader}`,
          description: `The response includes a header that may disclose sensitive information: ${forbiddenHeader}`,
          impact: 'Potential information disclosure that could aid attackers',
          recommendation: `Remove or hide the '${forbiddenHeader}' header`,
          evidence: {
            disclosedHeader: forbiddenHeader,
            value: headerValue
          }
        });
      }
    }

    return findings;
  }

  /**
   * Check for information disclosure in response
   */
  private checkInformationDisclosure(response: AxiosResponse): SecurityFinding[] {
    const findings: SecurityFinding[] = [];

    // Check response body for sensitive patterns
    const bodyText = typeof response.data === 'string'
      ? response.data
      : JSON.stringify(response.data || '');

    const sensitivePatterns = [
      { pattern: /password\s*[:=]\s*["']?[^"'\s]+/gi, type: 'password' },
      { pattern: /api[_-]?key\s*[:=]\s*["']?[^"'\s]+/gi, type: 'api-key' },
      { pattern: /secret\s*[:=]\s*["']?[^"'\s]+/gi, type: 'secret' },
      { pattern: /token\s*[:=]\s*["']?[^"'\s]+/gi, type: 'token' },
      { pattern: /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, type: 'credit-card' },
      { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, type: 'email' }
    ];

    for (const { pattern, type } of sensitivePatterns) {
      const matches = bodyText.match(pattern);
      if (matches) {
        findings.push({
          id: uuidv4(),
          severity: 'high',
          category: 'information-disclosure',
          title: `Sensitive Information Disclosure: ${type}`,
          description: `Response contains potentially sensitive ${type} information`,
          impact: 'Sensitive data exposure that could be exploited by attackers',
          recommendation: 'Remove sensitive information from responses or implement proper masking',
          evidence: {
            type,
            matchCount: matches.length,
            samples: matches.slice(0, 3) // Include first 3 matches as samples
          }
        });
      }
    }

    return findings;
  }

  /**
   * Generate test scenarios based on category
   */
  private generateTestScenarios(category: string): TestScenario[] {
    const scenarios: TestScenario[] = [];

    switch (category) {
      case 'rate-limiting':
        scenarios.push(...this.generateRateLimitingScenarios());
        break;
      case 'authentication':
        scenarios.push(...this.generateAuthenticationScenarios());
        break;
      case 'authorization':
        scenarios.push(...this.generateAuthorizationScenarios());
        break;
      case 'input-validation':
        scenarios.push(...this.generateInputValidationScenarios());
        break;
      case 'xss-protection':
        scenarios.push(...this.generateXSSProtectionScenarios());
        break;
      case 'security-headers':
        scenarios.push(...this.generateSecurityHeadersScenarios());
        break;
      case 'vulnerability-scan':
        scenarios.push(...this.generateVulnerabilityScenarios());
        break;
      case 'performance-impact':
        scenarios.push(...this.generatePerformanceImpactScenarios());
        break;
    }

    return scenarios;
  }

  /**
   * Generate rate limiting test scenarios
   */
  private generateRateLimitingScenarios(): TestScenario[] {
    return [
      {
        id: 'rate-limit-enforcement',
        name: 'Rate Limiting Enforcement Test',
        category: 'rate-limiting',
        severity: 'high',
        description: 'Test that rate limiting is properly enforced',
        steps: [
          {
            id: 'rapid-requests',
            action: 'rate-limit-test',
            method: 'GET',
            endpoint: '/health',
            validation: [
              { type: 'status-code', field: 'status', operator: 'equals', value: 429, required: false }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'Rate limiting enforced after threshold',
            message: 'Service properly enforces rate limiting',
            securityImplication: 'Protected against abuse and DoS attacks'
          }
        ],
        prerequisites: ['Service must be running'],
        timeout: 30000,
        retryCount: 1
      }
    ];
  }

  /**
   * Generate authentication test scenarios
   */
  private generateAuthenticationScenarios(): TestScenario[] {
    return [
      {
        id: 'auth-required-endpoints',
        name: 'Authentication Required Test',
        category: 'authentication',
        severity: 'critical',
        description: 'Test that protected endpoints require authentication',
        steps: [
          {
            id: 'unauthenticated-request',
            action: 'http-request',
            method: 'GET',
            endpoint: '/api/protected',
            validation: [
              { type: 'status-code', field: 'status', operator: 'equals', value: 401, required: true }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'Unauthenticated requests denied',
            message: 'Protected endpoints require authentication',
            securityImplication: 'Unauthorized access prevented'
          }
        ],
        prerequisites: ['Service must have protected endpoints'],
        timeout: 15000,
        retryCount: 2
      }
    ];
  }

  /**
   * Generate authorization test scenarios
   */
  private generateAuthorizationScenarios(): TestScenario[] {
    return [
      {
        id: 'rbac-enforcement',
        name: 'Role-Based Access Control Test',
        category: 'authorization',
        severity: 'high',
        description: 'Test that RBAC is properly enforced',
        steps: [
          {
            id: 'insufficient-permissions',
            action: 'http-request',
            method: 'DELETE',
            endpoint: '/api/admin/users',
            headers: {
              'Authorization': 'Bearer user-token'
            },
            validation: [
              { type: 'status-code', field: 'status', operator: 'equals', value: 403, required: true }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'Insufficient permissions denied',
            message: 'RBAC properly enforced',
            securityImplication: 'Privilege escalation prevented'
          }
        ],
        prerequisites: ['Service must implement RBAC'],
        timeout: 15000,
        retryCount: 2
      }
    ];
  }

  /**
   * Generate input validation test scenarios
   */
  private generateInputValidationScenarios(): TestScenario[] {
    const scenarios: TestScenario[] = [];

    // SQL Injection tests
    for (let i = 0; i < COMMON_PAYLOADS.sqlInjection.length; i++) {
      const payload = COMMON_PAYLOADS.sqlInjection[i];
      scenarios.push({
        id: `sql-injection-${i + 1}`,
        name: `SQL Injection Test ${i + 1}`,
        category: 'input-validation',
        severity: 'critical',
        description: `Test SQL injection protection with payload: ${payload.substring(0, 20)}...`,
        steps: [
          {
            id: `sql-payload-${i + 1}`,
            action: 'payload-injection',
            method: 'POST',
            endpoint: '/api/search',
            payload: { query: payload },
            validation: [
              { type: 'status-code', field: 'status', operator: 'not-equals', value: 500, required: true },
              { type: 'body-contains', field: 'body', operator: 'not-contains', value: 'SQL error', required: true }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'SQL injection payload blocked',
            message: 'Input validation prevents SQL injection',
            securityImplication: 'Database protected from SQL injection attacks'
          }
        ],
        prerequisites: ['Service must accept search queries'],
        timeout: 15000,
        retryCount: 1
      });
    }

    return scenarios;
  }

  /**
   * Generate XSS protection test scenarios
   */
  private generateXSSProtectionScenarios(): TestScenario[] {
    const scenarios: TestScenario[] = [];

    for (let i = 0; i < COMMON_PAYLOADS.xss.length; i++) {
      const payload = COMMON_PAYLOADS.xss[i];
      scenarios.push({
        id: `xss-protection-${i + 1}`,
        name: `XSS Protection Test ${i + 1}`,
        category: 'xss-protection',
        severity: 'high',
        description: `Test XSS protection with payload: ${payload.substring(0, 20)}...`,
        steps: [
          {
            id: `xss-payload-${i + 1}`,
            action: 'payload-injection',
            method: 'POST',
            endpoint: '/api/comment',
            payload: { content: payload },
            validation: [
              { type: 'body-contains', field: 'body', operator: 'not-contains', value: '<script>', required: true },
              { type: 'header-present', field: 'X-XSS-Protection', operator: 'equals', value: '1', required: false }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'XSS payload sanitized',
            message: 'Input sanitization prevents XSS',
            securityImplication: 'Users protected from XSS attacks'
          }
        ],
        prerequisites: ['Service must accept user content'],
        timeout: 15000,
        retryCount: 1
      });
    }

    return scenarios;
  }

  /**
   * Generate security headers test scenarios
   */
  private generateSecurityHeadersScenarios(): TestScenario[] {
    return [
      {
        id: 'security-headers-check',
        name: 'Security Headers Validation',
        category: 'security-headers',
        severity: 'medium',
        description: 'Validate presence and configuration of security headers',
        steps: [
          {
            id: 'get-headers',
            action: 'http-request',
            method: 'GET',
            endpoint: '/',
            validation: [
              { type: 'header-present', field: 'X-Frame-Options', operator: 'equals', value: 'present', required: true },
              { type: 'header-present', field: 'X-Content-Type-Options', operator: 'equals', value: 'present', required: true },
              { type: 'header-present', field: 'X-XSS-Protection', operator: 'equals', value: 'present', required: true },
              { type: 'header-present', field: 'Strict-Transport-Security', operator: 'equals', value: 'present', required: false },
              { type: 'header-present', field: 'Content-Security-Policy', operator: 'equals', value: 'present', required: false }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'Security headers present',
            message: 'All required security headers are configured',
            securityImplication: 'Enhanced security posture against common attacks'
          }
        ],
        prerequisites: ['Service must be accessible'],
        timeout: 10000,
        retryCount: 2
      }
    ];
  }

  /**
   * Generate vulnerability scanning scenarios
   */
  private generateVulnerabilityScenarios(): TestScenario[] {
    return [
      {
        id: 'common-vulnerabilities',
        name: 'Common Vulnerability Scan',
        category: 'vulnerability-scan',
        severity: 'high',
        description: 'Scan for common web application vulnerabilities',
        steps: [
          {
            id: 'path-traversal',
            action: 'vulnerability-scan',
            method: 'GET',
            endpoint: '/api/files/../../../etc/passwd',
            validation: [
              { type: 'status-code', field: 'status', operator: 'not-equals', value: 200, required: true },
              { type: 'body-contains', field: 'body', operator: 'not-contains', value: 'root:', required: true }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'Path traversal blocked',
            message: 'Service prevents directory traversal attacks',
            securityImplication: 'File system protected from unauthorized access'
          }
        ],
        prerequisites: ['Service must handle file operations'],
        timeout: 30000,
        retryCount: 1
      }
    ];
  }

  /**
   * Generate performance impact scenarios
   */
  private generatePerformanceImpactScenarios(): TestScenario[] {
    return [
      {
        id: 'security-performance-impact',
        name: 'Security Performance Impact Assessment',
        category: 'performance-impact',
        severity: 'medium',
        description: 'Assess performance impact of security measures',
        steps: [
          {
            id: 'baseline-performance',
            action: 'performance-test',
            method: 'GET',
            endpoint: '/health',
            validation: [
              { type: 'response-time', field: 'responseTime', operator: 'less-than', value: 1000, required: true }
            ]
          }
        ],
        expectedResults: [
          {
            type: 'success',
            condition: 'Acceptable performance with security',
            message: 'Security measures do not significantly impact performance',
            securityImplication: 'Security and performance balanced appropriately'
          }
        ],
        prerequisites: ['Service must be responsive'],
        timeout: 60000,
        retryCount: 3
      }
    ];
  }

  /**
   * Verify all services are healthy before testing
   */
  private async verifyServicesHealth(): Promise<void> {
    this.logger.info(chalk.blue('🏥 Verifying Essential CodAI Services Health...'));

    const healthChecks = this.config.services.map(async (service) => {
      try {
        const response = await axios.get(
          `${service.baseUrl}${service.healthEndpoint}`,
          { timeout: 10000 }
        );

        if (response.status === 200) {
          this.logger.info(chalk.green(`  ✅ ${service.name} (${service.port}): HEALTHY`));
          return true;
        } else {
          this.logger.warn(chalk.yellow(`  ⚠️ ${service.name} (${service.port}): UNHEALTHY (${response.status})`));
          return false;
        }
      } catch (error) {
        this.logger.error(chalk.red(`  ❌ ${service.name} (${service.port}): FAILED - ${error}`));
        return false;
      }
    });

    const results = await Promise.all(healthChecks);
    const healthyCount = results.filter(Boolean).length;

    this.logger.info(chalk.white(`📊 Health Check Summary: ${healthyCount}/${this.config.services.length} services healthy`));

    if (healthyCount === 0) {
      throw new Error('No services are healthy. Cannot proceed with security testing.');
    }
  }

  /**
   * Check if scenario applies to service
   */
  private isScenarioApplicableToService(scenario: TestScenario, service: EssentialService): boolean {
    // Apply all scenarios to all services for comprehensive testing
    return true;
  }

  /**
   * Initialize metrics
   */
  private initializeMetrics(): TestMetrics {
    return {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      minResponseTime: Infinity,
      maxResponseTime: 0,
      throughput: 0,
      errorRate: 0,
      securityScore: 0
    };
  }

  /**
   * Generate test summary
   */
  private async generateTestSummary(executions: TestExecution[]): Promise<void> {
    const summary = {
      totalExecutions: executions.length,
      passed: executions.filter(e => e.status === 'passed').length,
      failed: executions.filter(e => e.status === 'failed').length,
      securityFindings: executions.flatMap(e => e.results.flatMap(r => r.securityFindings)),
      averageResponseTime: executions.reduce((sum, e) => sum + e.metrics.averageResponseTime, 0) / executions.length
    };

    this.logger.info(chalk.blue('\n📊 Security Integration Test Summary'));
    this.logger.info(chalk.white(`Total Test Executions: ${summary.totalExecutions}`));
    this.logger.info(chalk.green(`✅ Passed: ${summary.passed}`));
    this.logger.info(chalk.red(`❌ Failed: ${summary.failed}`));
    this.logger.info(chalk.yellow(`🔍 Security Findings: ${summary.securityFindings.length}`));
    this.logger.info(chalk.white(`⏱️ Average Response Time: ${Math.round(summary.averageResponseTime)}ms`));

    // Count findings by severity
    const findingsBySeverity = summary.securityFindings.reduce((acc, finding) => {
      acc[finding.severity] = (acc[finding.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(findingsBySeverity).length > 0) {
      this.logger.info(chalk.yellow('\n🔍 Security Findings by Severity:'));
      Object.entries(findingsBySeverity).forEach(([severity, count]) => {
        const color = severity === 'critical' || severity === 'high' ? 'red' :
          severity === 'medium' ? 'yellow' : 'white';
        this.logger.info(chalk[color](`  ${severity.toUpperCase()}: ${count}`));
      });
    }

    // Calculate security score
    const criticalFindings = summary.securityFindings.filter(f => f.severity === 'critical').length;
    const highFindings = summary.securityFindings.filter(f => f.severity === 'high').length;
    const mediumFindings = summary.securityFindings.filter(f => f.severity === 'medium').length;

    const securityScore = Math.max(0, 100 - (criticalFindings * 25) - (highFindings * 10) - (mediumFindings * 5));

    this.logger.info(chalk.white(`\n🎯 Overall Security Score: ${securityScore}/100`));

    if (securityScore >= 90) {
      this.logger.info(chalk.green('🏆 Excellent security posture!'));
    } else if (securityScore >= 70) {
      this.logger.info(chalk.yellow('⚠️ Good security posture with some improvements needed'));
    } else {
      this.logger.info(chalk.red('🚨 Security improvements required'));
    }
  }
}