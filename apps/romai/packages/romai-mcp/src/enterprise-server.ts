/**
 * ROMAI MCP Server Enhanced with Enterprise Logging
 * 
 * World-class MCP server with complete protocol support, enterprise logging,
 * metrics collection, and request tracing for Fortune 500 environments.
 * 
 * Features:
 * - Complete MCP Protocol (Tools + Resources + Prompts)
 * - Enterprise-grade structured logging
 * - Real-time performance metrics
 * - Request tracing and correlation
 * - Compliance audit trails
 * - Business intelligence analytics
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RomaiCore, loadConfigFromEnv } from '@codai/romai-core';
import type { IntelligenceRequest } from '@codai/romai-types';

// Enterprise logging and monitoring
import { enterpriseLogger } from './logging/enterprise-logger';
import { metricsCollector } from './monitoring/metrics-collector';
import { requestTracer } from './monitoring/request-tracer';

export class RomaiMcpServerEnterpriseEdition {
  private server: Server;
  private romaiCore: RomaiCore;
  private startTime: number;

  constructor() {
    this.startTime = Date.now();

    this.server = new Server(
      {
        name: 'romai-mcp-enterprise',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    // Initialize ROMAI Core with environment configuration
    const config = loadConfigFromEnv();
    this.romaiCore = new RomaiCore(config);

    // Setup enterprise features
    this.setupEnterpriseLogging();
    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.setupErrorHandling();
    this.setupMetricsEndpoints();

    // Log server initialization
    enterpriseLogger.recordAuditEvent({
      eventId: 'server-init',
      eventType: 'config',
      severity: 'info',
      details: {
        serverVersion: '0.2.0',
        capabilities: ['tools', 'resources', 'prompts'],
        startTime: new Date().toISOString()
      },
      context: {
        requestId: 'init',
        method: 'server_initialization',
        timestamp: new Date().toISOString(),
        source: 'mcp-server',
        version: '0.2.0'
      }
    });
  }

  private setupEnterpriseLogging(): void {
    // Start cleanup interval for traces
    setInterval(() => {
      requestTracer.cleanup();
    }, 60 * 60 * 1000); // Every hour

    // Log server health every 5 minutes
    setInterval(() => {
      const health = metricsCollector.getPerformanceSummary();
      enterpriseLogger.recordMetric({
        name: 'server_health_check',
        value: health.systemHealth === 'excellent' ? 100 :
          health.systemHealth === 'good' ? 80 :
            health.systemHealth === 'warning' ? 60 : 20,
        unit: 'percent',
        labels: {
          status: health.systemHealth,
          memoryMB: health.memoryUsageMB.toString(),
          uptime: health.uptime.toString()
        },
        timestamp: new Date().toISOString()
      });
    }, 5 * 60 * 1000);
  }

  private setupToolHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
      const context = requestTracer.startTrace('tools/list', request);

      try {
        const result = {
          tools: [
            {
              name: 'romai_intelligence',
              description: 'Get AI-powered consultation and strategic analysis',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Your question or request' },
                  context: { type: 'string', description: 'Additional context (optional)' },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'], description: 'Request priority' }
                },
                required: ['query']
              }
            },
            {
              name: 'romai_romanian_expert',
              description: 'Romanian cultural and business expertise',
              inputSchema: {
                type: 'object',
                properties: {
                  topic: { type: 'string', description: 'Romanian business or cultural topic' },
                  industry: { type: 'string', description: 'Industry context (optional)' }
                },
                required: ['topic']
              }
            },
            {
              name: 'romai_problem_solver',
              description: 'Systematic problem-solving with step-by-step approach',
              inputSchema: {
                type: 'object',
                properties: {
                  problem: { type: 'string', description: 'Problem description' },
                  constraints: { type: 'string', description: 'Known constraints (optional)' }
                },
                required: ['problem']
              }
            },
            {
              name: 'romai_code_assistant',
              description: 'Programming and technical assistance',
              inputSchema: {
                type: 'object',
                properties: {
                  task: { type: 'string', description: 'Programming task or question' },
                  language: { type: 'string', description: 'Programming language (optional)' },
                  framework: { type: 'string', description: 'Framework context (optional)' }
                },
                required: ['task']
              }
            },
            {
              name: 'romai_health_check',
              description: 'Server health monitoring and diagnostics',
              inputSchema: {
                type: 'object',
                properties: {
                  detailed: { type: 'boolean', description: 'Include detailed metrics' }
                }
              }
            },
            {
              name: 'romai_market_intelligence',
              description: 'Romanian market analysis and business intelligence',
              inputSchema: {
                type: 'object',
                properties: {
                  industry: { type: 'string', description: 'Industry sector' },
                  analysis_type: { type: 'string', enum: ['market_size', 'competition', 'trends', 'opportunities'] },
                  region: { type: 'string', description: 'Romanian region (optional)' }
                },
                required: ['industry', 'analysis_type']
              }
            },
            {
              name: 'romai_regulatory_advisor',
              description: 'Romanian business regulations and compliance guidance',
              inputSchema: {
                type: 'object',
                properties: {
                  business_type: { type: 'string', description: 'Type of business entity' },
                  compliance_area: { type: 'string', description: 'Specific compliance requirement' },
                  urgency: { type: 'string', enum: ['routine', 'urgent', 'critical'] }
                },
                required: ['business_type', 'compliance_area']
              }
            }
          ]
        };

        requestTracer.completeTrace(context.requestId, result);
        return result;
      } catch (error) {
        requestTracer.failTrace(context.requestId, error as Error);
        throw error;
      }
    });

    // Handle tool calls with enterprise logging
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const context = requestTracer.startTrace(`tools/call/${name}`, { name, args });

      try {
        let result;

        switch (name) {
          case 'romai_intelligence':
            result = await this.handleIntelligence(args as { query: string; context?: string; priority?: string });
            break;
          case 'romai_romanian_expert':
            result = await this.handleRomanianExpert(args as { topic: string; industry?: string });
            break;
          case 'romai_problem_solver':
            result = await this.handleProblemSolver(args as { problem: string; constraints?: string });
            break;
          case 'romai_code_assistant':
            result = await this.handleCodeAssistant(args as { task: string; language?: string; framework?: string });
            break;
          case 'romai_health_check':
            result = await this.handleHealthCheck(args as { detailed?: boolean });
            break;
          case 'romai_market_intelligence':
            result = await this.handleMarketIntelligence(args as { industry: string; analysis_type: string; region?: string });
            break;
          case 'romai_regulatory_advisor':
            result = await this.handleRegulatoryAdvisor(args as { business_type: string; compliance_area: string; urgency?: string });
            break;
          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        requestTracer.completeTrace(context.requestId, result);
        return result;
      } catch (error) {
        requestTracer.failTrace(context.requestId, error as Error, { toolName: name, args });
        throw error;
      }
    });
  }
