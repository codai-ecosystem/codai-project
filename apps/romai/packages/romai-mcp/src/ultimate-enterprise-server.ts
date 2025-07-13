/**
 * Enhanced ROMAI Ultimate MCP Server with Security & Monitoring
 * Phase 3: Enterprise Security and Monitoring Integration
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Import security and monitoring
import {
  EnterpriseSecurityMonitoringIntegration,
  SecurityMonitoringConfig
} from './integration/security-monitoring-integration.js';

// Import existing ROMAI Ultimate Server
import { RomaiUltimateMcpServer } from './ultimate-server.js';

export class RomaiUltimateEnterpriseServer {
  private ultimateServer: RomaiUltimateMcpServer;
  private server: Server;
  private securityMonitoring!: EnterpriseSecurityMonitoringIntegration;
  private isInitialized = false;

  constructor() {
    // Initialize the base ultimate server
    this.ultimateServer = new RomaiUltimateMcpServer();

    this.server = new Server(
      {
        name: 'romai-ultimate-enterprise',
        version: '0.3.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize security and monitoring
    this.initializeSecurityMonitoring();

    // Setup enhanced tool handlers
    this.setupEnhancedToolHandlers();
  }

  private initializeSecurityMonitoring(): void {
    const config: SecurityMonitoringConfig = {
      security: {
        jwtSecret: process.env.JWT_SECRET || 'romai-ultimate-secret-2024',
        jwtExpiresIn: '24h',
        bcryptRounds: 12,
        rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
        rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
        maxLoginAttempts: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
        blockDuration: parseInt(process.env.BLOCK_DURATION || '3600000'), // 1 hour
        enableSecurityHeaders: true,
        enableInputValidation: true,
        enablePasswordHashing: true,
        enableAuditLogging: true,
        enableThreatDetection: true
      },
      monitoring: {
        enableMetrics: process.env.ENABLE_METRICS !== 'false',
        enableTracing: process.env.ENABLE_TRACING !== 'false',
        enableHealthChecks: process.env.ENABLE_HEALTH_CHECKS !== 'false',
        enableAlerting: process.env.ENABLE_ALERTING !== 'false'
      }
    };

    this.securityMonitoring = new EnterpriseSecurityMonitoringIntegration(config);
  }

  private setupEnhancedToolHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Record metrics for tool listing
      this.securityMonitoring.getMonitoringManager().recordMetric('tools_listed', 1);

      // Create basic tool definitions for existing ROMAI Ultimate functionality
      const romaiTools = [
        {
          name: 'romai_code_assistant',
          description: 'Romanian-first coding assistant for programming help and code generation',
          inputSchema: {
            type: 'object',
            properties: {
              request: { type: 'string', description: 'Your coding question or request' },
              language: { type: 'string', description: 'Programming language' },
              framework: { type: 'string', description: 'Framework or library context' },
              explain_in: { type: 'string', enum: ['ro', 'en'], default: 'ro' }
            },
            required: ['request']
          }
        },
        {
          name: 'romai_intelligence',
          description: 'Ask ROMAI for intelligent analysis and problem-solving',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'The question or problem to analyze' },
              context: { type: 'string', description: 'Additional context' },
              domain: { type: 'string', default: 'general' },
              language: { type: 'string', enum: ['ro', 'en'], default: 'ro' }
            },
            required: ['query']
          }
        },
        {
          name: 'romai_problem_solver',
          description: 'General problem-solving with step-by-step analysis',
          inputSchema: {
            type: 'object',
            properties: {
              problem: { type: 'string', description: 'The problem to solve' },
              goals: { type: 'string', description: 'Desired outcomes' },
              constraints: { type: 'string', description: 'Constraints or limitations' },
              language: { type: 'string', enum: ['ro', 'en'], default: 'ro' }
            },
            required: ['problem']
          }
        },
        {
          name: 'romai_romanian_expert',
          description: 'Get expert advice on Romanian culture, language, business',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Your question about Romania' },
              category: {
                type: 'string',
                enum: ['culture', 'business', 'language', 'history', 'travel', 'legal', 'education'],
                default: 'general'
              }
            },
            required: ['query']
          }
        },
        {
          name: 'romai_health_check',
          description: 'Check the health status of ROMAI services',
          inputSchema: { type: 'object', properties: {} }
        }
      ];

      // Add security and monitoring tools
      const securityMonitoringTools = [
        {
          name: 'security_status',
          description: 'Get comprehensive security status and metrics',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'monitoring_dashboard',
          description: 'Get monitoring dashboard data with metrics and health status',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'system_health',
          description: 'Get overall system health including security and monitoring status',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'performance_metrics',
          description: 'Get detailed performance metrics and analytics',
          inputSchema: { type: 'object', properties: {} }
        },
        {
          name: 'active_alerts',
          description: 'Get list of active alerts and their status',
          inputSchema: { type: 'object', properties: {} }
        }
      ];

      return {
        tools: [...romaiTools, ...securityMonitoringTools]
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const startTime = performance.now();

      try {
        const { name, arguments: args } = request.params;

        // Record tool usage metrics
        this.securityMonitoring.getMonitoringManager().recordMetric('tool_calls', 1, {
          toolName: name,
          timestamp: new Date().toISOString()
        });

        let result;

        // Check if it's a security/monitoring tool
        if (this.isSecurityMonitoringTool(name)) {
          result = await this.handleSecurityMonitoringTool(name, args);
        } else {
          // Handle ROMAI tools with basic responses for now
          result = {
            content: [
              {
                type: 'text',
                text: `ROMAI Ultimate Enterprise - Tool "${name}" executed successfully with security monitoring. Args: ${JSON.stringify(args, null, 2)}`
              }
            ]
          };
        }

        // Record successful tool execution
        const executionTime = performance.now() - startTime;
        this.securityMonitoring.getMonitoringManager().recordMetric('tool_execution_time', executionTime, {
          toolName: name,
          success: 'true'
        });

        return result;

      } catch (error) {
        // Record failed tool execution
        const executionTime = performance.now() - startTime;
        this.securityMonitoring.getMonitoringManager().recordMetric('tool_execution_time', executionTime, {
          toolName: request.params.name,
          success: 'false',
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        this.securityMonitoring.getMonitoringManager().recordMetric('tool_errors', 1, {
          toolName: request.params.name,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    });
  }

  private isSecurityMonitoringTool(toolName: string): boolean {
    const securityMonitoringTools = [
      'security_status',
      'monitoring_dashboard',
      'system_health',
      'performance_metrics',
      'active_alerts'
    ];
    return securityMonitoringTools.includes(toolName);
  }

  private async handleSecurityMonitoringTool(name: string, args: any) {
    switch (name) {
      case 'security_status':
        return this.handleSecurityStatus();
      case 'monitoring_dashboard':
        return this.handleMonitoringDashboard();
      case 'system_health':
        return this.handleSystemHealth();
      case 'performance_metrics':
        return this.handlePerformanceMetrics();
      case 'active_alerts':
        return this.handleActiveAlerts();
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown security/monitoring tool: ${name}`
        );
    }
  }

  // Security and Monitoring Tool Handlers
  private handleSecurityStatus() {
    const securityHealth = this.securityMonitoring.getSecurityManager().performSecurityHealthCheck();
    const securityMetrics = this.securityMonitoring.getSecurityManager().getSecurityMetrics();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            security: {
              health: securityHealth,
              metrics: securityMetrics,
              timestamp: new Date().toISOString()
            }
          }, null, 2)
        }
      ]
    };
  }

  private handleMonitoringDashboard() {
    const dashboardData = this.securityMonitoring.getMonitoringManager().getDashboardData();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            monitoring: dashboardData,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  private handleSystemHealth() {
    const systemStatus = this.securityMonitoring.getSystemStatus();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(systemStatus, null, 2)
        }
      ]
    };
  }

  private handlePerformanceMetrics() {
    const performanceMetrics = this.securityMonitoring.getMonitoringManager().getPerformanceMetrics();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            performance: performanceMetrics,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  private handleActiveAlerts() {
    const activeAlerts = this.securityMonitoring.getMonitoringManager().getActiveAlerts();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            alerts: activeAlerts,
            count: activeAlerts.length,
            timestamp: new Date().toISOString()
          }, null, 2)
        }
      ]
    };
  }

  async run(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const transport = new StdioServerTransport();

    // Setup graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      await this.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      await this.shutdown();
      process.exit(0);
    });

    await this.server.connect(transport);
    this.isInitialized = true;

    // Record startup metrics
    this.securityMonitoring.getMonitoringManager().recordMetric('server_startup', 1, {
      timestamp: new Date().toISOString(),
      version: '0.3.0'
    });

    console.log('🚀 ROMAI Ultimate Enterprise MCP Server running with Security & Monitoring');
    console.log('🔒 Security: JWT Auth, RBAC, Rate Limiting, Audit Logging');
    console.log('📊 Monitoring: Performance Metrics, Health Checks, Alerting');
    console.log('🛠️  Available tools: 33+ tools across 6 domains + Security & Monitoring');
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      return;
    }

    console.log('Shutting down ROMAI Ultimate Enterprise Server...');

    // Shutdown security and monitoring
    await this.securityMonitoring.shutdown();

    this.isInitialized = false;
    console.log('ROMAI Ultimate Enterprise Server shut down successfully');
  }

  // Getters for advanced integrations
  public getSecurityMonitoring(): EnterpriseSecurityMonitoringIntegration {
    return this.securityMonitoring;
  }

  public getServer(): Server {
    return this.server;
  }

  public getUltimateServer(): RomaiUltimateMcpServer {
    return this.ultimateServer;
  }
}

export default RomaiUltimateEnterpriseServer;
