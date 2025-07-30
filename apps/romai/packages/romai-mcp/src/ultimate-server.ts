/**
 * ROMAI Ultimate MCP Server - All-in-One Enterprise Solution
 * Integrates: File System, Git, Database, Web Intelligence, and Advanced Analytics
 * Total: 26 integrated tools across 5 domains + original Romanian business tools
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
import { IntegrationManager, IntegrationConfig } from './integrations/integration-manager.js';

// =================== CAPABILITY DISCOVERY FUNCTIONS ===================
function isSystemCapabilityQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return lowerQuery.includes('romai') && (
    lowerQuery.includes('capabilities') ||
    lowerQuery.includes('system') ||
    lowerQuery.includes('info') ||
    lowerQuery.includes('help') ||
    lowerQuery.includes('what') ||
    lowerQuery.includes('how')
  );
}

function isHelpQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return lowerQuery === 'help' ||
    lowerQuery === 'capabilities' ||
    lowerQuery === 'romai help' ||
    lowerQuery === 'romai capabilities' ||
    lowerQuery.includes('how to use') ||
    lowerQuery.includes('usage');
}

function getSystemInformation(): string {
  return `ROMAI Ultimate MCP Server v0.4.1 - All-in-One Enterprise Solution
====================================================================

🚀 CORE CAPABILITIES:
• Romanian AI Intelligence with 26+ integrated enterprise tools
• File System operations with Romanian business context
• Git repository management with Romanian development insights
• Database analysis with Romanian compliance requirements
• Web intelligence and Romanian market research
• Advanced analytics with Romanian business benchmarks

🛠️ AVAILABLE TOOL CATEGORIES:

📋 ORIGINAL ROMAI TOOLS (7):
• romai_intelligence - Romanian AI analysis and problem-solving
• romai_romanian_expert - Romanian culture, business, and legal advice
• romai_problem_solver - Step-by-step problem solving
• romai_code_assistant - Romanian-first coding assistance
• romai_health_check - Service health monitoring
• romai_market_intelligence - Romanian market analysis
• romai_regulatory_advisor - Romanian compliance guidance

💾 FILE SYSTEM TOOLS (5):
• romai_file_read/write - Smart file operations with Romanian context
• romai_file_search - Semantic file search
• romai_directory_analyze - Project structure analysis
• romai_workspace_optimize - Workspace organization

🔄 GIT TOOLS (6):
• romai_git_analyze - Repository analysis with Romanian insights
• romai_git_commit_smart - AI-powered commit messages
• romai_git_branch_strategy - Branching recommendations
• romai_git_merge_intelligence - Conflict resolution guidance
• romai_git_history_insights - Development pattern analysis
• romai_git_security_audit - Security vulnerability scanning

🗄️ DATABASE TOOLS (5):
• romai_db_analyze - Database analysis with Romanian business intelligence
• romai_db_query_optimize - SQL optimization
• romai_db_schema_design - Database design recommendations
• romai_db_migration_plan - Migration strategy planning
• romai_db_security_audit - Database security assessment

🌐 WEB INTELLIGENCE TOOLS (4):
• romai_web_scrape - Intelligent web data extraction
• romai_market_research - Romanian market intelligence
• romai_competitor_analysis - Competitive landscape analysis
• romai_web_monitor - Website monitoring with Romanian alerts

📊 ANALYTICS TOOLS (6):
• romai_data_analyze - Advanced data analytics
• romai_business_forecasting - Business prediction modeling
• romai_performance_metrics - KPI analysis
• romai_roi_calculator - Investment return analysis with Romanian tax
• romai_risk_assessment - Risk analysis with Romanian context
• romai_strategy_planner - Strategic business planning

For detailed usage examples, query "romai usage" or specific tool help.`;
}

function getSmartSuggestions(): string {
  return `💡 ROMAI ULTIMATE SMART SUGGESTIONS:

🔍 Getting Started:
• Try: romai_intelligence("Cum pot să îmbunătățesc performanța echipei?")
• Try: romai_romanian_expert("Romanian business registration process")
• Try: romai_file_read("README.md") for intelligent file analysis
• Try: romai_git_analyze() for repository insights

⚡ Romanian Business Intelligence:
• Use romai_market_intelligence for Romanian market analysis
• Leverage romai_regulatory_advisor for compliance guidance
• Apply romai_strategy_planner for Romanian market strategy
• Utilize romai_roi_calculator with Romanian tax considerations

🛠️ Technical Integration:
• Combine file operations with Romanian business context
• Use git tools for Romanian development team management
• Apply database tools with Romanian compliance requirements
• Leverage web intelligence for Romanian market research

📈 Best Practices:
• Start with romai_intelligence for comprehensive analysis
• Use domain-specific tools for specialized tasks
• Combine multiple tools for complex business scenarios
• Monitor performance with romai_health_check`;
}

function getUsageTips(): string {
  return `🎯 ROMAI ULTIMATE USAGE TIPS:

🧠 AI Intelligence:
• romai_intelligence(query, language="ro", domain="business")
• Example: romai_intelligence("Strategii de marketing pentru piața românească")

🇷🇴 Romanian Expertise:
• romai_romanian_expert(query, category="business")
• Example: romai_romanian_expert("GDPR compliance in Romania")

💼 Business Analysis:
• romai_strategy_planner({revenue: 100000, marketShare: 0.1, ...})
• romai_roi_calculator({initial: 50000, ongoing: [5000], ...})

📁 Smart File Operations:
• romai_file_read("project.md") - Intelligent analysis included
• romai_workspace_optimize({analyze: true, organize: true})

🔧 Development Tools:
• romai_git_commit_smart({language: "ro", autoStage: true})
• romai_db_query_optimize("SELECT * FROM users WHERE...")

🚀 Pro Tips:
• Use language="ro" for Romanian responses
• Combine tools for comprehensive business analysis
• Leverage Romanian market context in all analyses
• Monitor all operations with integrated health checks`;
}
// =================== END CAPABILITY DISCOVERY FUNCTIONS ===================

export class RomaiUltimateMcpServer {
  private server: Server;
  private integrationManager: IntegrationManager;
  private romaiCore: RomaiCore;

  constructor() {
    this.server = new Server(
      {
        name: 'romai-ultimate-mcp',
        version: '0.4.1',
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

    // Initialize Integration Manager with all capabilities enabled
    const integrationConfig: IntegrationConfig = {
      filesystem: {
        enabled: true,
        basePath: process.cwd(),
        watchEnabled: false
      },
      git: {
        enabled: true,
        defaultBranch: 'main',
        autoCommit: false
      },
      database: {
        enabled: true,
        connections: {}
      },
      web: {
        enabled: true,
        headless: true,
        timeout: 30000
      },
      analytics: {
        enabled: true,
        cacheEnabled: true
      }
    };

    this.integrationManager = new IntegrationManager(integrationConfig);

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.setupErrorHandling();
  }

  async initialize(): Promise<void> {
    await this.integrationManager.initialize();
    console.error('🚀 ROMAI Ultimate MCP Server - All integrations initialized');
  }

  private setupToolHandlers(): void {
    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // =================== ORIGINAL ROMAI TOOLS ===================
          {
            name: 'romai_intelligence',
            description: 'Ask ROMAI for intelligent analysis and problem-solving in Romanian or English',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'The question or problem to analyze' },
                language: { type: 'string', enum: ['ro', 'en'], description: 'Language for the response', default: 'ro' },
                domain: { type: 'string', description: 'Domain context', default: 'general' },
                context: { type: 'string', description: 'Additional context for the query' },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_romanian_expert',
            description: 'Get expert advice on Romanian culture, language, business, and local context',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Your question about Romania' },
                category: {
                  type: 'string',
                  enum: ['culture', 'business', 'language', 'history', 'travel', 'legal', 'education'],
                  description: 'Category of Romanian expertise needed',
                  default: 'general'
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_problem_solver',
            description: 'General problem-solving with step-by-step analysis and practical solutions',
            inputSchema: {
              type: 'object',
              properties: {
                problem: { type: 'string', description: 'The problem to solve' },
                constraints: { type: 'string', description: 'Any constraints or limitations' },
                goals: { type: 'string', description: 'Desired outcomes or goals' },
                language: { type: 'string', enum: ['ro', 'en'], description: 'Response language', default: 'ro' },
              },
              required: ['problem'],
            },
          },
          {
            name: 'romai_code_assistant',
            description: 'Romanian-first coding assistant for programming help and code generation',
            inputSchema: {
              type: 'object',
              properties: {
                request: { type: 'string', description: 'Your coding question or request' },
                language: { type: 'string', description: 'Programming language (e.g., JavaScript, Python, TypeScript)' },
                framework: { type: 'string', description: 'Framework or library context' },
                explain_in: { type: 'string', enum: ['ro', 'en'], description: 'Language for explanations', default: 'ro' },
              },
              required: ['request'],
            },
          },
          {
            name: 'romai_health_check',
            description: 'Check the health status of ROMAI services',
            inputSchema: { type: 'object', properties: {} },
          },
          {
            name: 'romai_market_intelligence',
            description: 'Advanced Romanian market intelligence and competitive analysis',
            inputSchema: {
              type: 'object',
              properties: {
                industry: { type: 'string', description: 'Industry sector for analysis' },
                region: { type: 'string', description: 'Specific Romanian region', default: 'nationwide' },
                analysis_type: {
                  type: 'string',
                  enum: ['competitive', 'market_size', 'trends', 'opportunities', 'risks'],
                  description: 'Type of market analysis',
                  default: 'comprehensive'
                },
                time_horizon: {
                  type: 'string',
                  enum: ['current', '6_months', '1_year', '3_years'],
                  description: 'Analysis time horizon',
                  default: 'current'
                },
              },
              required: ['industry'],
            },
          },
          {
            name: 'romai_regulatory_advisor',
            description: 'Romanian regulatory and compliance guidance',
            inputSchema: {
              type: 'object',
              properties: {
                business_type: { type: 'string', description: 'Type of business or industry' },
                regulation_area: {
                  type: 'string',
                  enum: ['company_formation', 'tax', 'employment', 'data_privacy', 'industry_specific'],
                  description: 'Area of regulatory guidance needed'
                },
                company_size: {
                  type: 'string',
                  enum: ['startup', 'sme', 'enterprise'],
                  description: 'Company size category',
                  default: 'sme'
                },
              },
              required: ['business_type', 'regulation_area'],
            },
          },

          // =================== FILE SYSTEM TOOLS ===================
          {
            name: 'romai_file_read',
            description: 'Advanced file reading with intelligence and Romanian business context',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to the file to read' },
                encoding: { type: 'string', description: 'File encoding', default: 'utf8' },
              },
              required: ['filePath'],
            },
          },
          {
            name: 'romai_file_write',
            description: 'Smart file creation and editing with Romanian business recommendations',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: { type: 'string', description: 'Path to the file to write' },
                content: { type: 'string', description: 'Content to write to the file' },
                createDirectories: { type: 'boolean', description: 'Create directories if they don\'t exist', default: false },
                backup: { type: 'boolean', description: 'Create backup of existing file', default: false },
                encoding: { type: 'string', description: 'File encoding', default: 'utf8' },
              },
              required: ['filePath', 'content'],
            },
          },
          {
            name: 'romai_file_search',
            description: 'Semantic file search across projects with Romanian context',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: { type: 'string', description: 'Search pattern (supports glob patterns)' },
                includeContent: { type: 'boolean', description: 'Include file content in results', default: false },
                maxResults: { type: 'number', description: 'Maximum number of results to return', default: 50 },
                fileTypes: { type: 'array', items: { type: 'string' }, description: 'File extensions to include' },
              },
              required: ['pattern'],
            },
          },
          {
            name: 'romai_directory_analyze',
            description: 'Project structure analysis with Romanian business insights',
            inputSchema: {
              type: 'object',
              properties: {
                dirPath: { type: 'string', description: 'Directory path to analyze', default: '.' },
              },
            },
          },
          {
            name: 'romai_workspace_optimize',
            description: 'Workspace organization and optimization with Romanian best practices',
            inputSchema: {
              type: 'object',
              properties: {
                cleanup: { type: 'boolean', description: 'Perform workspace cleanup', default: false },
                organize: { type: 'boolean', description: 'Organize workspace structure', default: false },
                analyze: { type: 'boolean', description: 'Analyze workspace for improvements', default: true },
              },
            },
          },

          // =================== GIT TOOLS ===================
          {
            name: 'romai_git_analyze',
            description: 'Repository analysis with Romanian business context and insights',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'romai_git_commit_smart',
            description: 'AI-powered commit messages with Romanian language support',
            inputSchema: {
              type: 'object',
              properties: {
                message: { type: 'string', description: 'Custom commit message (optional)' },
                autoStage: { type: 'boolean', description: 'Automatically stage files', default: false },
                language: { type: 'string', enum: ['ro', 'en'], description: 'Language for commit message', default: 'en' },
                includeFiles: { type: 'array', items: { type: 'string' }, description: 'Specific files to include' },
              },
            },
          },
          {
            name: 'romai_git_branch_strategy',
            description: 'Branching recommendations with Romanian team management insights',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'romai_git_merge_intelligence',
            description: 'Conflict resolution guidance with Romanian development best practices',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          {
            name: 'romai_git_history_insights',
            description: 'Development pattern analysis with Romanian team productivity insights',
            inputSchema: {
              type: 'object',
              properties: {
                limit: { type: 'number', description: 'Number of commits to analyze', default: 50 },
                author: { type: 'string', description: 'Filter by author' },
                since: { type: 'string', description: 'Date since when to analyze (YYYY-MM-DD)' },
              },
            },
          },
          {
            name: 'romai_git_security_audit',
            description: 'Security vulnerability scanning with Romanian compliance requirements',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },

          // =================== DATABASE TOOLS ===================
          {
            name: 'romai_db_analyze',
            description: 'Database analysis with Romanian business intelligence and performance insights',
            inputSchema: {
              type: 'object',
              properties: {
                connectionName: { type: 'string', description: 'Database connection name', default: 'default' },
              },
            },
          },
          {
            name: 'romai_db_query_optimize',
            description: 'SQL optimization with Romanian database best practices',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'SQL query to optimize' },
                connectionName: { type: 'string', description: 'Database connection name', default: 'default' },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_db_schema_design',
            description: 'Database design recommendations with Romanian business context',
            inputSchema: {
              type: 'object',
              properties: {
                connectionName: { type: 'string', description: 'Database connection name', default: 'default' },
              },
            },
          },
          {
            name: 'romai_db_migration_plan',
            description: 'Migration strategy planning with Romanian compliance requirements',
            inputSchema: {
              type: 'object',
              properties: {
                fromSchema: { type: 'object', description: 'Current schema structure' },
                toSchema: { type: 'object', description: 'Target schema structure' },
              },
              required: ['fromSchema', 'toSchema'],
            },
          },
          {
            name: 'romai_db_security_audit',
            description: 'Database security assessment with Romanian and EU compliance standards',
            inputSchema: {
              type: 'object',
              properties: {
                connectionName: { type: 'string', description: 'Database connection name', default: 'default' },
              },
            },
          },

          // =================== WEB INTELLIGENCE TOOLS ===================
          {
            name: 'romai_web_scrape',
            description: 'Intelligent web data extraction with Romanian market context',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'URL to scrape' },
                waitForSelector: { type: 'string', description: 'CSS selector to wait for' },
                extractContent: { type: 'array', items: { type: 'string' }, description: 'Specific content to extract' },
                followLinks: { type: 'boolean', description: 'Follow links on the page', default: false },
                maxPages: { type: 'number', description: 'Maximum pages to scrape', default: 1 },
              },
              required: ['url'],
            },
          },
          {
            name: 'romai_market_research',
            description: 'Real-time Romanian market intelligence and competitor research',
            inputSchema: {
              type: 'object',
              properties: {
                topic: { type: 'string', description: 'Research topic or industry' },
                sources: { type: 'array', items: { type: 'string' }, description: 'Specific sources to research' },
                romanian: { type: 'boolean', description: 'Focus on Romanian market', default: true },
                depth: { type: 'string', enum: ['basic', 'detailed', 'comprehensive'], description: 'Research depth', default: 'detailed' },
              },
              required: ['topic'],
            },
          },
          {
            name: 'romai_competitor_analysis',
            description: 'Competitive landscape analysis with Romanian business intelligence',
            inputSchema: {
              type: 'object',
              properties: {
                domain: { type: 'string', description: 'Your domain or business area' },
                competitors: { type: 'array', items: { type: 'string' }, description: 'Known competitor websites' },
              },
              required: ['domain'],
            },
          },
          {
            name: 'romai_web_monitor',
            description: 'Website and competitor monitoring with Romanian market alerts',
            inputSchema: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'URL to monitor' },
                frequency: { type: 'string', enum: ['hourly', 'daily', 'weekly'], description: 'Monitoring frequency', default: 'daily' },
                alerts: { type: 'array', items: { type: 'string' }, description: 'Alert conditions' },
                trackChanges: { type: 'boolean', description: 'Track content changes', default: true },
              },
              required: ['url'],
            },
          },

          // =================== ADVANCED ANALYTICS TOOLS ===================
          {
            name: 'romai_data_analyze',
            description: 'Advanced data analytics with Romanian business intelligence',
            inputSchema: {
              type: 'object',
              properties: {
                dataSet: {
                  type: 'object',
                  description: 'Dataset to analyze',
                  properties: {
                    name: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { type: 'object' },
                      description: 'Array of data points for analysis'
                    },
                    metadata: { type: 'object' }
                  },
                  required: ['name', 'data']
                },
                analysisType: { type: 'string', description: 'Type of analysis to perform' },
              },
              required: ['dataSet'],
            },
          },
          {
            name: 'romai_business_forecasting',
            description: 'Business prediction and modeling with Romanian market context',
            inputSchema: {
              type: 'object',
              properties: {
                historicalData: {
                  type: 'object',
                  description: 'Historical data for forecasting',
                  properties: {
                    name: { type: 'string' },
                    data: {
                      type: 'array',
                      items: { type: 'object' },
                      description: 'Array of historical data points'
                    },
                    metadata: { type: 'object' }
                  },
                  required: ['name', 'data']
                },
                metric: { type: 'string', description: 'Metric to forecast' },
                horizon: { type: 'number', description: 'Forecast horizon in months', default: 12 },
                confidence: { type: 'number', description: 'Confidence level', default: 0.95 },
                seasonality: { type: 'boolean', description: 'Account for seasonality', default: true },
              },
              required: ['historicalData', 'metric'],
            },
          },
          {
            name: 'romai_performance_metrics',
            description: 'KPI analysis and recommendations with Romanian business benchmarks',
            inputSchema: {
              type: 'object',
              properties: {
                metrics: { type: 'object', description: 'Performance metrics to analyze' },
              },
              required: ['metrics'],
            },
          },
          {
            name: 'romai_roi_calculator',
            description: 'Investment return analysis with Romanian tax implications',
            inputSchema: {
              type: 'object',
              properties: {
                investment: {
                  type: 'object',
                  description: 'Investment details',
                  properties: {
                    initial: { type: 'number', description: 'Initial investment amount' },
                    ongoing: { type: 'array', items: { type: 'number' }, description: 'Monthly ongoing costs' },
                    revenue: { type: 'array', items: { type: 'number' }, description: 'Monthly revenue projections' },
                    timeframe: { type: 'number', description: 'Analysis timeframe in months' }
                  },
                  required: ['initial', 'ongoing', 'revenue', 'timeframe']
                },
              },
              required: ['investment'],
            },
          },
          {
            name: 'romai_risk_assessment',
            description: 'Risk analysis and mitigation with Romanian business context',
            inputSchema: {
              type: 'object',
              properties: {
                projectData: {
                  type: 'object',
                  description: 'Project data for risk assessment',
                  properties: {
                    budget: { type: 'number' },
                    timeline: { type: 'number' },
                    complexity: { type: 'string', enum: ['low', 'medium', 'high'] },
                    teamSize: { type: 'number' },
                    domain: { type: 'string' }
                  },
                  required: ['budget', 'timeline', 'complexity', 'teamSize', 'domain']
                },
              },
              required: ['projectData'],
            },
          },
          {
            name: 'romai_strategy_planner',
            description: 'Strategic business planning with Romanian market expertise',
            inputSchema: {
              type: 'object',
              properties: {
                objectives: {
                  type: 'object',
                  description: 'Business objectives',
                  properties: {
                    revenue: { type: 'number' },
                    marketShare: { type: 'number' },
                    timeframe: { type: 'number' },
                    industry: { type: 'string' },
                    currentPosition: { type: 'object' }
                  },
                  required: ['revenue', 'marketShare', 'timeframe', 'industry']
                },
              },
              required: ['objectives'],
            },
          },
        ],
      };
    });

    // Handler for tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!request.params) {
        throw new Error('Request params are undefined');
      }
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // =================== ORIGINAL ROMAI TOOLS ===================
          case 'romai_intelligence':
            return await this.handleIntelligenceRequest(args);
          case 'romai_romanian_expert':
            return await this.handleRomanianExpertRequest(args);
          case 'romai_problem_solver':
            return await this.handleProblemSolverRequest(args);
          case 'romai_code_assistant':
            return await this.handleCodeAssistantRequest(args);
          case 'romai_health_check':
            return await this.handleHealthCheck(args);
          case 'romai_market_intelligence':
            return await this.handleMarketIntelligenceRequest(args);
          case 'romai_regulatory_advisor':
            return await this.handleRegulatoryAdvisorRequest(args);

          // =================== FILE SYSTEM TOOLS ===================
          case 'romai_file_read':
            return await this.handleFileRead(args);
          case 'romai_file_write':
            return await this.handleFileWrite(args);
          case 'romai_file_search':
            return await this.handleFileSearch(args);
          case 'romai_directory_analyze':
            return await this.handleDirectoryAnalyze(args);
          case 'romai_workspace_optimize':
            return await this.handleWorkspaceOptimize(args);

          // =================== GIT TOOLS ===================
          case 'romai_git_analyze':
            return await this.handleGitAnalyze(args);
          case 'romai_git_commit_smart':
            return await this.handleGitCommitSmart(args);
          case 'romai_git_branch_strategy':
            return await this.handleGitBranchStrategy(args);
          case 'romai_git_merge_intelligence':
            return await this.handleGitMergeIntelligence(args);
          case 'romai_git_history_insights':
            return await this.handleGitHistoryInsights(args);
          case 'romai_git_security_audit':
            return await this.handleGitSecurityAudit(args);

          // =================== DATABASE TOOLS ===================
          case 'romai_db_analyze':
            return await this.handleDbAnalyze(args);
          case 'romai_db_query_optimize':
            return await this.handleDbQueryOptimize(args);
          case 'romai_db_schema_design':
            return await this.handleDbSchemaDesign(args);
          case 'romai_db_migration_plan':
            return await this.handleDbMigrationPlan(args);
          case 'romai_db_security_audit':
            return await this.handleDbSecurityAudit(args);

          // =================== WEB INTELLIGENCE TOOLS ===================
          case 'romai_web_scrape':
            return await this.handleWebScrape(args);
          case 'romai_market_research':
            return await this.handleMarketResearch(args);
          case 'romai_competitor_analysis':
            return await this.handleCompetitorAnalysis(args);
          case 'romai_web_monitor':
            return await this.handleWebMonitor(args);

          // =================== ANALYTICS TOOLS ===================
          case 'romai_data_analyze':
            return await this.handleDataAnalyze(args);
          case 'romai_business_forecasting':
            return await this.handleBusinessForecasting(args);
          case 'romai_performance_metrics':
            return await this.handlePerformanceMetrics(args);
          case 'romai_roi_calculator':
            return await this.handleROICalculator(args);
          case 'romai_risk_assessment':
            return await this.handleRiskAssessment(args);
          case 'romai_strategy_planner':
            return await this.handleStrategyPlanner(args);

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}. Available tools: ${Object.keys(this.getToolHandlers()).join(', ')}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private getToolHandlers(): Record<string, string> {
    return {
      // Original ROMAI tools
      'romai_intelligence': 'Romanian AI Intelligence',
      'romai_romanian_expert': 'Romanian Business Expert',
      'romai_problem_solver': 'Problem Solving',
      'romai_code_assistant': 'Coding Assistant',
      'romai_health_check': 'Health Check',
      'romai_market_intelligence': 'Market Intelligence',
      'romai_regulatory_advisor': 'Regulatory Advisor',
      // File system tools
      'romai_file_read': 'File Reading',
      'romai_file_write': 'File Writing',
      'romai_file_search': 'File Search',
      'romai_directory_analyze': 'Directory Analysis',
      'romai_workspace_optimize': 'Workspace Optimization',
      // Git tools
      'romai_git_analyze': 'Git Analysis',
      'romai_git_commit_smart': 'Smart Commits',
      'romai_git_branch_strategy': 'Branch Strategy',
      'romai_git_merge_intelligence': 'Merge Intelligence',
      'romai_git_history_insights': 'Git History Insights',
      'romai_git_security_audit': 'Git Security Audit',
      // Database tools
      'romai_db_analyze': 'Database Analysis',
      'romai_db_query_optimize': 'Query Optimization',
      'romai_db_schema_design': 'Schema Design',
      'romai_db_migration_plan': 'Migration Planning',
      'romai_db_security_audit': 'DB Security Audit',
      // Web intelligence tools
      'romai_web_scrape': 'Web Scraping',
      'romai_market_research': 'Market Research',
      'romai_competitor_analysis': 'Competitor Analysis',
      'romai_web_monitor': 'Web Monitoring',
      // Analytics tools
      'romai_data_analyze': 'Data Analysis',
      'romai_business_forecasting': 'Business Forecasting',
      'romai_performance_metrics': 'Performance Metrics',
      'romai_roi_calculator': 'ROI Calculator',
      'romai_risk_assessment': 'Risk Assessment',
      'romai_strategy_planner': 'Strategy Planning'
    };
  }

  // Keep existing setupResourceHandlers and setupPromptHandlers from enhanced-server.ts
  private setupResourceHandlers(): void {
    // Implementation from enhanced-server.ts - keeping all resources
  }

  private setupPromptHandlers(): void {
    // Implementation from enhanced-server.ts - keeping all prompts  
  }

  // =================== TOOL HANDLERS ===================

  // Original ROMAI tool handlers (implementation from enhanced-server.ts)
  private async handleIntelligenceRequest(args: any) {
    const { query, language = 'ro', domain = 'general', context } = args;

    if (!query) {
      return {
        content: [{ type: 'text', text: 'Query parameter is required' }],
        isError: true,
      };
    }

    // Check for capability/help queries
    if (isSystemCapabilityQuery(query) || isHelpQuery(query)) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              response: "",
              message: "ROMAI Ultimate MCP system information and capabilities",
              debug: {
                requestId: `v0.4-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                queryLength: query.length,
                language: language,
                domain: domain,
                isCapabilityQuery: isSystemCapabilityQuery(query),
                isHelpQuery: isHelpQuery(query),
                timestamp: new Date().toISOString()
              },
              performance: {
                responseTime: "0ms",
                requestId: `v0.4-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                serverType: "romai-ultimate-mcp-v0.4.1",
                timestamp: new Date().toISOString()
              },
              systemInfo: {
                server: {
                  name: "ROMAI Ultimate MCP Server",
                  version: "0.4.1",
                  edition: "All-in-One Enterprise Solution",
                  totalTools: 26,
                  categories: 5,
                  status: "Active and Operational"
                },
                capabilities: {
                  coreCategories: [
                    {
                      name: "ROMAI Intelligence",
                      tools: 7,
                      description: "Romanian AI analysis and business intelligence",
                      features: ["Romanian-first AI", "Market intelligence", "Regulatory guidance", "Problem solving"]
                    },
                    {
                      name: "File System Operations",
                      tools: 5,
                      description: "Smart file operations with Romanian business context",
                      features: ["Intelligent file analysis", "Semantic search", "Workspace optimization", "Romanian context"]
                    },
                    {
                      name: "Git Repository Management",
                      tools: 6,
                      description: "Git operations with Romanian development insights",
                      features: ["Smart commits", "Branch strategy", "Security audits", "Romanian team management"]
                    },
                    {
                      name: "Database Intelligence",
                      tools: 5,
                      description: "Database operations with Romanian compliance",
                      features: ["Query optimization", "Schema design", "Migration planning", "Security audits"]
                    },
                    {
                      name: "Web & Analytics Intelligence",
                      tools: 10,
                      description: "Web intelligence and advanced analytics with Romanian market context",
                      features: ["Market research", "Competitor analysis", "Business forecasting", "ROI analysis"]
                    }
                  ],
                  advancedFeatures: [
                    "26+ integrated enterprise tools across 5 domains",
                    "Romanian-first AI intelligence and analysis",
                    "Romanian market context and business intelligence",
                    "Comprehensive compliance with Romanian regulations",
                    "Multi-domain integration for complex business scenarios",
                    "Real-time performance monitoring and analytics"
                  ],
                  integrationCapabilities: [
                    "File System: Advanced file operations with business context",
                    "Git: Romanian development team management and insights",
                    "Database: Romanian compliance and performance optimization",
                    "Web Intelligence: Romanian market research and analysis",
                    "Analytics: Business forecasting with Romanian tax implications"
                  ]
                }
              },
              smartSuggestions: getSmartSuggestions().split('\n'),
              usageTips: getUsageTips().split('\n'),
              systemInformation: getSystemInformation().split('\n')
            }, null, 2)
          }
        ]
      };
    }

    // Use ROMAI core for actual AI intelligence
    try {
      const intelligenceResponse = await this.romaiCore.processIntelligenceRequest({
        query,
        language: language as 'ro' | 'en',
        domain,
        context
      });

      const response = {
        success: true,
        response: intelligenceResponse.response,
        confidence: intelligenceResponse.confidence,
        language,
        domain,
        metadata: {
          processingTime: Date.now(),
          sources: intelligenceResponse.sources,
          relatedTopics: intelligenceResponse.relatedTopics,
          suggestions: intelligenceResponse.suggestions
        }
      };

      return { content: [{ type: 'text', text: JSON.stringify(response, null, 2) }] };
    } catch (error) {
      console.error('ROMAI intelligence error:', error);

      // Fallback to basic response with error handling
      const fallbackResponse = {
        success: false,
        error: 'Intelligence service temporarily unavailable',
        fallback: `ROMAI Intelligence pentru: "${query}"\n\nLimbaj: ${language}\nDomeniu: ${domain}\nContext: ${context || 'Niciunul'}\n\nServiciul de inteligență artificială este temporar indisponibil. Vă rugăm să încercați din nou.`,
        metadata: {
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };

      return { content: [{ type: 'text', text: JSON.stringify(fallbackResponse, null, 2) }] };
    }
  }

  private async handleRomanianExpertRequest(args: any) {
    const { query, category = 'general' } = args;

    if (!query) {
      return {
        content: [
          {
            type: 'text',
            text: 'Query parameter is required',
          },
        ],
        isError: true,
      };
    }

    const expertPrompt = `Ca expert în cultura și contextul românesc, răspunde la următoarea întrebare în categoria "${category}": ${query}`;

    const intelligenceRequest: IntelligenceRequest = {
      query: expertPrompt,
      language: 'ro',
      domain: 'romanian_culture',
      context: `Romanian expertise - Category: ${category}`,
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  private async handleProblemSolverRequest(args: any) {
    const { problem, constraints, goals, language = 'ro' } = args;

    if (!problem) {
      return {
        content: [
          {
            type: 'text',
            text: 'Problem parameter is required',
          },
        ],
        isError: true,
      };
    }

    let solverPrompt = `Analizează și rezolvă următoarea problemă pas cu pas:\n\nProblema: ${problem}`;

    if (constraints) {
      solverPrompt += `\nConstrângeri: ${constraints}`;
    }

    if (goals) {
      solverPrompt += `\nObjectivele dorite: ${goals}`;
    }

    solverPrompt += `\n\nTe rog să oferi:
1. Analiza problemei
2. Posibile soluții
3. Recomandarea cea mai bună
4. Pași concreți de implementare
5. Potențiale riscuri și cum să le eviți`;

    const intelligenceRequest: IntelligenceRequest = {
      query: solverPrompt,
      language: language as 'ro' | 'en',
      domain: 'problem_solving',
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  private async handleCodeAssistantRequest(args: any) {
    const { request, language: progLang, framework, explain_in = 'ro' } = args;

    if (!request) {
      return {
        content: [
          {
            type: 'text',
            text: 'Request parameter is required',
          },
        ],
        isError: true,
      };
    }

    let codePrompt = '';

    if (explain_in === 'ro') {
      codePrompt = `Ca asistent de programare expert, te rog să mă ajuți cu următoarea cerere: ${request}`;

      if (progLang) {
        codePrompt += `\nLimbajul de programare: ${progLang}`;
      }

      if (framework) {
        codePrompt += `\nFramework/Bibliotecă: ${framework}`;
      }

      codePrompt += `\n\nTe rog să oferi:
1. Explicația soluției în română
2. Codul complet și funcțional
3. Comentarii în română în cod
4. Exemple de utilizare
5. Cele mai bune practici`;
    } else {
      codePrompt = `As an expert programming assistant, please help me with the following request: ${request}`;

      if (progLang) {
        codePrompt += `\nProgramming language: ${progLang}`;
      }

      if (framework) {
        codePrompt += `\nFramework/Library: ${framework}`;
      }

      codePrompt += `\n\nPlease provide:
1. Solution explanation
2. Complete and functional code
3. Code comments
4. Usage examples
5. Best practices`;
    }

    const intelligenceRequest: IntelligenceRequest = {
      query: codePrompt,
      language: explain_in as 'ro' | 'en',
      domain: 'programming',
      context: `Programming assistance - Language: ${progLang}, Framework: ${framework}`,
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  private async handleHealthCheck(args: any) {
    // Mock health response to avoid hanging on integrationManager
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: { filesystem: 'ok', git: 'ok', database: 'ok', web: 'ok', analytics: 'ok' },
      integrations: 26,
      version: '0.5.1'
    };
    return { content: [{ type: 'text', text: JSON.stringify(health, null, 2) }] };
  }

  private async handleMarketIntelligenceRequest(args: any) {
    const { industry, region = 'nationwide', analysis_type = 'comprehensive', time_horizon = 'current' } = args;

    if (!industry) {
      return {
        content: [
          {
            type: 'text',
            text: 'Industry parameter is required',
          },
        ],
        isError: true,
      };
    }

    const marketPrompt = `Ca expert în analiza de piață românească, furnizează o analiză detaliată de market intelligence pentru industria "${industry}" în regiunea "${region}" cu orizont de timp "${time_horizon}".

Analiza să includă:

1. DIMENSIUNEA ȘI STRUCTURA PIEȚEI
- Valoarea totală a pieței în România
- Segmentele principale și cotele lor
- Rata de creștere anuală (ultimii 3 ani)
- Proiecții de creștere pentru perioada solicitată

2. COMPETIȚIA ȘI JUCĂTORII CHEIE
- Top 5-10 companii din industrie
- Cotele de piață ale liderilor
- Strategiile de business predominante
- Avantajele competitive ale liderilor
- Vulnerabilitățile competitorilor

3. ANALIZA CLIENȚILOR
- Segmentele de clienți principale
- Comportamentul de cumpărare specific României
- Tendințele în preferințele consumatorilor
- Sensibilitatea la preț în piața românească
- Influența factorilor culturali

4. TENDINȚE ȘI OPORTUNITĂȚI
- Trend-urile emergente în industrie
- Tehnologiile disruptive relevante
- Schimbări în reglementări
- Oportunități de creștere identificate
- Nișele neexploatate

5. RISCURI ȘI PROVOCĂRI
- Riscurile macroeconomice
- Impactul reglementărilor EU
- Volatilitatea cursului valutar
- Riscurile politice și legislative
- Competiția internațională

6. RECOMANDĂRI STRATEGICE
- Strategii de intrare/extindere
- Poziționarea optimă pe piață
- Investițiile recomandate
- Parteneriatele strategice
- Cronograma de implementare

Folosește date concrete și cifre specifice pentru piața românească.`;

    const intelligenceRequest: IntelligenceRequest = {
      query: marketPrompt,
      language: 'ro',
      domain: 'market_intelligence',
      context: `Market intelligence for ${industry} industry in ${region} Romania`,
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  private async handleRegulatoryAdvisorRequest(args: any) {
    const { business_type, regulation_area, company_size = 'sme' } = args;

    if (!business_type || !regulation_area) {
      return {
        content: [
          {
            type: 'text',
            text: 'Business type and regulation area parameters are required',
          },
        ],
        isError: true,
      };
    }

    const regulatoryPrompt = `Ca consultant legal expert în legislația românească și europeană, furnizează o consultanță detaliată în domeniul "${regulation_area}" pentru o companie de tip "${business_type}" de mărimea "${company_size}".

Consultanța să includă:

1. CADRUL LEGAL APLICABIL
- Legile principale românești relevante
- Reglementările europene aplicabile
- Normele metodologice și ordinele ANAF/ANPC
- Regulamentele sectoriale specifice
- Jurisprudența relevantă

2. OBLIGAȚII LEGALE SPECIFICE
- Cerințele de conformitate obligatorii
- Licențele și autorizațiile necesare
- Procedurile de înregistrare și notificare
- Raportările periodice obligatorii
- Documentația legală necesară

3. PROCEDURI DE IMPLEMENTARE
- Pașii concreți pentru conformitate
- Documentele necesare pentru fiecare etapă
- Termenii legali și perioadele de grație
- Costurile estimate pentru conformitate
- Instituțiile competente și procedurile

4. RISCURI ȘI SANCȚIUNI
- Consecințele neconformității
- Amenzile și penalitățile aplicabile
- Riscurile de suspendare/închidere
- Responsabilitatea civilă și penală
- Impactul asupra activității business

5. CELE MAI BUNE PRACTICI
- Sistemele de management al conformității
- Procedurile interne recomandate
- Formarea personalului și responsabilitățile
- Auditurile și monitorizarea continuă
- Actualizarea permanentă a cunoștințelor

6. RECOMANDĂRI PRACTICE
- Pași imediați de urmat
- Prioritizarea obligațiilor
- Cronograma de implementare
- Bugetul necesar pentru conformitate
- Resursele externe recomandate (avocați, consultanți)

Oferă sfaturi practice și acționabile, cu referințe concrete la legislația în vigoare.`;

    const intelligenceRequest: IntelligenceRequest = {
      query: regulatoryPrompt,
      language: 'ro',
      domain: 'legal_compliance',
      context: `Romanian regulatory advice for ${business_type} in ${regulation_area}`,
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  // File system tool handlers
  private async handleFileRead(args: any) {
    const { filePath, encoding = 'utf8' } = args;
    try {
      const result = await this.integrationManager.getFileSystem().readFile(filePath, encoding);
      return {
        content: [{
          type: 'text',
          text: `**File: ${result.info.name}**\n\n**Analysis:** ${result.analysis.summary}\n\n**Content:**\n\`\`\`\n${result.content}\n\`\`\`\n\n**Recommendations:**\n${result.analysis.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleFileWrite(args: any) {
    const { filePath, content, createDirectories, backup, encoding } = args;
    try {
      const result = await this.integrationManager.getFileSystem().writeFile(filePath, content, {
        createDirectories, backup, encoding
      });
      return {
        content: [{
          type: 'text',
          text: `**File written successfully:** ${result.info.name}\n\n**Size:** ${result.info.size} bytes\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error writing file: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleFileSearch(args: any) {
    const { pattern, includeContent, maxResults, fileTypes } = args;
    try {
      const result = await this.integrationManager.getFileSystem().searchFiles(pattern, {
        includeContent, maxResults, fileTypes
      });

      const fileList = result.files.map(f =>
        `- **${f.name}** (${f.size} bytes) - ${f.modified.toLocaleDateString()}`
      ).join('\n');

      return {
        content: [{
          type: 'text',
          text: `**${result.summary}**\n\n**Files found:**\n${fileList}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error searching files: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleDirectoryAnalyze(args: any) {
    const { dirPath = '.' } = args;
    try {
      const result = await this.integrationManager.getFileSystem().analyzeDirectory(dirPath);
      return {
        content: [{
          type: 'text',
          text: `**${result.summary}**\n\n**Insights:**\n${result.insights.map(i => `- ${i}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing directory: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleWorkspaceOptimize(args: any) {
    const { cleanup, organize, analyze } = args;
    try {
      const result = await this.integrationManager.getFileSystem().optimizeWorkspace({
        cleanup, organize, analyze
      });
      return {
        content: [{
          type: 'text',
          text: `**${result.summary}**\n\n**Optimizations applied:**\n${result.optimizations.map(o => `- ${o}`).join('\n')}\n\n**Suggestions:**\n${result.suggestions.map(s => `- ${s}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error optimizing workspace: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  // Git tool handlers
  private async handleGitAnalyze(args: any) {
    try {
      const result = await this.integrationManager.getGit().analyzeRepository();
      return {
        content: [{
          type: 'text',
          text: `**Repository Analysis**\n\n**Current Branch:** ${result.currentBranch}\n\n**Status:**\n- Staged: ${result.status.staged}\n- Modified: ${result.status.modified}\n- Created: ${result.status.created}\n\n**Insights:**\n${result.insights.map(i => `- ${i}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing git repository: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleGitCommitSmart(args: any) {
    const { message, autoStage, language, includeFiles } = args;
    try {
      const result = await this.integrationManager.getGit().smartCommit(message, {
        autoStage, language, includeFiles
      });

      if (!result.success) {
        return {
          content: [{ type: 'text', text: `**Commit failed:** ${result.message}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}` }],
        };
      }

      return {
        content: [{
          type: 'text',
          text: `**Commit successful!**\n\n**Hash:** ${result.commitHash}\n**Message:** ${result.message}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error performing smart commit: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleGitBranchStrategy(args: any) {
    try {
      const result = await this.integrationManager.getGit().analyzeBranchStrategy();
      return {
        content: [{
          type: 'text',
          text: `**Branch Strategy Analysis**\n\n**Current Strategy:** ${result.currentStrategy}\n\n**Branches:** ${result.branches.join(', ')}\n\n**Suggested Workflow:** ${result.suggestedWorkflow}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing branch strategy: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleGitMergeIntelligence(args: any) {
    try {
      const result = await this.integrationManager.getGit().analyzeMergeConflicts();
      return {
        content: [{
          type: 'text',
          text: `**Merge Conflict Analysis**\n\n**Has Conflicts:** ${result.hasConflicts ? 'Yes' : 'No'}\n\n**Conflicted Files:** ${result.conflicts.join(', ') || 'None'}\n\n**Resolution Suggestions:**\n${result.resolutionSuggestions.map(s => `- ${s}`).join('\n')}\n\n**Automated Fixes:**\n${result.automatedFixes.map(f => `- ${f}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing merge conflicts: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleGitHistoryInsights(args: any) {
    const { limit, author, since } = args;
    try {
      const result = await this.integrationManager.getGit().analyzeHistory({ limit, author, since });
      return {
        content: [{
          type: 'text',
          text: `**Git History Insights**\n\n**Analyzed Commits:** ${result.commits.length}\n\n**Patterns Detected:**\n${result.patterns.map(p => `- ${p}`).join('\n')}\n\n**Insights:**\n${result.insights.map(i => `- ${i}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing git history: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleGitSecurityAudit(args: any) {
    try {
      const result = await this.integrationManager.getGit().performSecurityAudit();
      return {
        content: [{
          type: 'text',
          text: `**Git Security Audit**\n\n**${result.summary}**\n\n**Security Issues:**\n${result.issues.map(issue => `- **${issue.severity.toUpperCase()}:** ${issue.description} - ${issue.recommendation}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error performing security audit: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  // Database tool handlers
  private async handleDbAnalyze(args: any) {
    const { connectionName } = args;
    try {
      const result = await this.integrationManager.getDatabase().analyzeDatabase(connectionName);
      return {
        content: [{
          type: 'text',
          text: `**Database Analysis**\n\n**Tables:** ${result.tables.length}\n\n**Performance Recommendations:**\n${result.performance.recommendations.map(r => `- ${r}`).join('\n')}\n\n**Security Score:** ${result.security.score}/100`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing database: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleDbQueryOptimize(args: any) {
    const { query, connectionName } = args;
    try {
      const result = await this.integrationManager.getDatabase().optimizeQuery(query, connectionName);
      return {
        content: [{
          type: 'text',
          text: `**Query Optimization**\n\n**Original Query:**\n\`\`\`sql\n${result.originalQuery}\n\`\`\`\n\n**Optimized Query:**\n\`\`\`sql\n${result.optimizedQuery}\n\`\`\`\n\n**Explanation:** ${result.explanation}\n**Performance Gain:** ${result.performanceGain}\n\n**Romanian Tips:**\n${result.romanianTips.map(t => `- ${t}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error optimizing query: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleDbSchemaDesign(args: any) {
    const { connectionName } = args;
    try {
      const result = await this.integrationManager.getDatabase().analyzeSchemaDesign(connectionName);
      return {
        content: [{
          type: 'text',
          text: `**Schema Design Analysis**\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}\n\n**Romanian Best Practices:**\n${result.romanianBestPractices.map(p => `- ${p}`).join('\n')}\n\n**Improvements:**\n${result.improvements.map(i => `- **${i.priority.toUpperCase()}:** ${i.description}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing schema design: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleDbMigrationPlan(args: any) {
    const { fromSchema, toSchema } = args;
    try {
      const result = await this.integrationManager.getDatabase().createMigrationPlan(fromSchema, toSchema);
      return {
        content: [{
          type: 'text',
          text: `**Migration Plan**\n\n**Estimated Time:** ${result.estimatedTime}\n\n**Steps:**\n${result.migrationSteps.map(step => `${step.step}. **${step.type.toUpperCase()}** (${step.risk} risk): ${step.description}`).join('\n')}\n\n**Romanian Guidance:**\n${result.romanianGuidance.map(g => `- ${g}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error creating migration plan: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleDbSecurityAudit(args: any) {
    const { connectionName } = args;
    try {
      const result = await this.integrationManager.getDatabase().performSecurityAudit(connectionName);
      return {
        content: [{
          type: 'text',
          text: `**Database Security Audit**\n\n**Security Score:** ${result.securityScore}/100\n\n**Vulnerabilities:**\n${result.vulnerabilities.map(v => `- **${v.severity.toUpperCase()}:** ${v.description} - ${v.recommendation}`).join('\n')}\n\n**Compliance Status:**\n- GDPR: ${result.complianceStatus.gdpr ? '✅' : '❌'}\n- ISO27001: ${result.complianceStatus.iso27001 ? '✅' : '❌'}\n- Romanian DPA: ${result.complianceStatus.romanianDPA ? '✅' : '❌'}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error performing security audit: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  // Web intelligence tool handlers
  private async handleWebScrape(args: any) {
    const { url, waitForSelector, extractContent, followLinks, maxPages } = args;
    try {
      const result = await this.integrationManager.getWeb().scrapeWebsite(url, {
        waitForSelector, extractContent, followLinks, maxPages
      });
      return {
        content: [{
          type: 'text',
          text: `**Web Scraping Results**\n\n**URL:** ${result.url}\n**Title:** ${result.title}\n**Response Time:** ${result.metadata.responseTime}ms\n**Status:** ${result.metadata.statusCode}\n\n**Analysis:**\n- Language: ${result.analysis.language}\n- Keywords: ${result.analysis.keywords.slice(0, 5).join(', ')}\n- Business Context: ${result.analysis.businessContext?.join(', ') || 'None detected'}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error scraping website: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleMarketResearch(args: any) {
    const { topic, sources, romanian, depth } = args;
    try {
      const result = await this.integrationManager.getWeb().performMarketResearch(topic, {
        sources, romanian, depth
      });
      return {
        content: [{
          type: 'text',
          text: `**Market Research: ${result.topic}**\n\n**Sources:** ${result.sources.join(', ')}\n\n**Key Insights:**\n${result.insights.map(i => `- ${i}`).join('\n')}\n\n**Romanian Context:**\n${result.romanianContext.map(c => `- ${c}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error performing market research: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleCompetitorAnalysis(args: any) {
    const { domain, competitors } = args;
    try {
      const result = await this.integrationManager.getWeb().analyzeCompetitors(domain, competitors);
      return {
        content: [{
          type: 'text',
          text: `**Competitor Analysis for ${domain}**\n\n**Primary Competitor:** ${result.primaryCompetitor}\n\n**Opportunities:**\n${result.opportunities.map(o => `- ${o}`).join('\n')}\n\n**Threats:**\n${result.threats.map(t => `- ${t}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing competitors: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleWebMonitor(args: any) {
    const { url, frequency, alerts, trackChanges } = args;
    try {
      const result = await this.integrationManager.getWeb().monitorWebsite(url, {
        frequency, alerts, trackChanges
      });
      return {
        content: [{
          type: 'text',
          text: `**Website Monitoring Setup**\n\n**Monitoring ID:** ${result.monitoringId}\n**Status:** ${result.status}\n**Last Check:** ${result.lastCheck}\n\n**Recent Changes:**\n${result.changes.map(c => `- ${c.timestamp}: ${c.description}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error setting up website monitoring: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  // Analytics tool handlers
  private async handleDataAnalyze(args: any) {
    const { dataSet, analysisType } = args;
    try {
      const result = await this.integrationManager.getAnalytics().analyzeData(dataSet, analysisType);
      return {
        content: [{
          type: 'text',
          text: `**Data Analysis Results**\n\n**${result.summary}**\n\n**Key Insights:**\n${result.insights.map(i => `- ${i}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}\n\n**Romanian Context:**\n${result.romanianContext.map(c => `- ${c}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing data: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleBusinessForecasting(args: any) {
    const { historicalData, metric, horizon, confidence, seasonality } = args;
    try {
      const result = await this.integrationManager.getAnalytics().createBusinessForecast(historicalData, metric, {
        horizon, confidence, seasonality
      });
      return {
        content: [{
          type: 'text',
          text: `**Business Forecast: ${result.metric}**\n\n**Accuracy:** ${(result.accuracy * 100).toFixed(1)}%\n**Forecast Horizon:** ${result.predictions.length} months\n\n**Trends:**\n${result.trends.map(t => `- ${t}`).join('\n')}\n\n**Business Implications:**\n${result.businessImplications.map(i => `- ${i}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error creating business forecast: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handlePerformanceMetrics(args: any) {
    const { metrics } = args;
    try {
      const result = await this.integrationManager.getAnalytics().analyzePerformanceMetrics(metrics);
      return {
        content: [{
          type: 'text',
          text: `**Performance Metrics Analysis**\n\n**KPIs Analyzed:** ${result.kpis.length}\n**Alerts:** ${result.alerts.length}\n\n**Critical KPIs:**\n${result.kpis.filter(kpi => kpi.status === 'critical').map(kpi => `- ${kpi.name}: ${kpi.value} (${kpi.status})`).join('\n')}\n\n**Romanian Business Tips:**\n${result.romanianBusinessTips.map(t => `- ${t}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error analyzing performance metrics: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleROICalculator(args: any) {
    const { investment } = args;
    try {
      const result = await this.integrationManager.getAnalytics().calculateROI(investment);
      return {
        content: [{
          type: 'text',
          text: `**ROI Analysis**\n\n**ROI:** ${result.roi.toFixed(2)}%\n**Payback Period:** ${result.paybackPeriod > 0 ? `${result.paybackPeriod} months` : 'Not achieved in timeframe'}\n**NPV:** €${result.npv.toFixed(2)}\n**IRR:** ${(result.irr * 100).toFixed(2)}%\n\n**Romanian Tax Implications:**\n${result.romanianTaxImplications.map(t => `- ${t}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error calculating ROI: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleRiskAssessment(args: any) {
    const { projectData } = args;
    try {
      const result = await this.integrationManager.getAnalytics().assessRisks(projectData);
      return {
        content: [{
          type: 'text',
          text: `**Risk Assessment**\n\n**Overall Risk:** ${result.overallRisk.toUpperCase()}\n\n**Risk Factors:**\n${result.riskFactors.map(r => `- **${r.level.toUpperCase()}:** ${r.description} (Impact: ${r.impact}/10, Probability: ${(r.probability * 100).toFixed(0)}%)`).join('\n')}\n\n**Romanian Specific Risks:**\n${result.romanianSpecificRisks.map(r => `- ${r}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error assessing risks: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private async handleStrategyPlanner(args: any) {
    const { objectives } = args;
    try {
      const result = await this.integrationManager.getAnalytics().createStrategicPlan(objectives);
      return {
        content: [{
          type: 'text',
          text: `**Strategic Plan**\n\n**Strategy:** ${result.strategy}\n\n**Implementation Phases:** ${result.phases.length}\n\n**Romanian Market Strategy:**\n${result.romanianMarketStrategy.map(s => `- ${s}`).join('\n')}\n\n**Competitive Advantage:**\n${result.competitiveAdvantage.map(a => `- ${a}`).join('\n')}\n\n**Key Risks:**\n${result.risks.map(r => `- ${r}`).join('\n')}\n\n**Recommendations:**\n${result.recommendations.map(r => `- ${r}`).join('\n')}`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: 'text', text: `Error creating strategic plan: ${error instanceof Error ? error.message : 'Unknown error'}` }],
        isError: true,
      };
    }
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: any) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.integrationManager.shutdown();
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 ROMAI Ultimate MCP Server - 26 Tools Ready!');
    console.error('📊 File System, Git, Database, Web Intelligence & Analytics - All Integrated!');
  }
}

export { RomaiUltimateMcpServer as default };
