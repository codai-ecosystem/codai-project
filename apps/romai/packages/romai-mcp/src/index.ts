import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RomaiCore, loadConfigFromEnv } from '@codai/romai-core';
import type { IntelligenceRequest } from '@codai/romai-types';

export class RomaiMcpServer {
  private server: Server;
  private romaiCore: RomaiCore;

  constructor() {
    this.server = new Server(
      {
        name: 'romai-mcp',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize ROMAI Core with environment configuration
    const config = loadConfigFromEnv();
    this.romaiCore = new RomaiCore(config);

    this.setupToolHandlers();
    this.setupErrorHandling();
  }

  private setupToolHandlers(): void {
    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'romai_intelligence',
            description:
              'Ask ROMAI for intelligent analysis and problem-solving in Romanian or English',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The question or problem to analyze',
                },
                language: {
                  type: 'string',
                  enum: ['ro', 'en'],
                  description: 'Language for the response (Romanian or English)',
                  default: 'ro',
                },
                domain: {
                  type: 'string',
                  description: 'Domain context (e.g., technology, business, science)',
                  default: 'general',
                },
                context: {
                  type: 'string',
                  description: 'Additional context for the query',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_romanian_expert',
            description:
              'Get expert advice on Romanian culture, language, business, and local context',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Your question about Romania',
                },
                category: {
                  type: 'string',
                  enum: [
                    'culture',
                    'business',
                    'language',
                    'history',
                    'travel',
                    'legal',
                    'education',
                  ],
                  description: 'Category of Romanian expertise needed',
                  default: 'general',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_problem_solver',
            description:
              'General problem-solving with step-by-step analysis and practical solutions',
            inputSchema: {
              type: 'object',
              properties: {
                problem: {
                  type: 'string',
                  description: 'The problem to solve',
                },
                constraints: {
                  type: 'string',
                  description: 'Any constraints or limitations',
                },
                goals: {
                  type: 'string',
                  description: 'Desired outcomes or goals',
                },
                language: {
                  type: 'string',
                  enum: ['ro', 'en'],
                  description: 'Response language',
                  default: 'ro',
                },
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
                request: {
                  type: 'string',
                  description: 'Your coding question or request',
                },
                language: {
                  type: 'string',
                  description: 'Programming language (e.g., JavaScript, Python, TypeScript)',
                },
                framework: {
                  type: 'string',
                  description: 'Framework or library context',
                },
                explain_in: {
                  type: 'string',
                  enum: ['ro', 'en'],
                  description: 'Language for explanations',
                  default: 'ro',
                },
              },
              required: ['request'],
            },
          },
          {
            name: 'romai_health_check',
            description: 'Check the health status of ROMAI services',
            inputSchema: {
              type: 'object',
              properties: {},
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

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
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

  private async handleIntelligenceRequest(args: any) {
    const { query, language = 'ro', domain = 'general', context } = args;

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

    const intelligenceRequest: IntelligenceRequest = {
      query,
      language: language as 'ro' | 'en',
      domain,
      context,
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
    const health = await this.romaiCore.healthCheck();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(health, null, 2),
        },
      ],
    };
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: any) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ROMAI MCP Server running on stdio');
  }
}

export { RomaiMcpServer as default };
