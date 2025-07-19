#!/usr/bin/env node

/**
 * Romai MCP HTTP Server
 * Provides HTTP/WebSocket transport for Romai MCP functionality
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class RomaiHttpMcpServer {
    private server: Server;
    private app: express.Application;
    private httpServer: any;
    private wsServer: WebSocketServer;
    private port: number;

    constructor(port: number = 8003) {
        this.port = port;
        this.server = new Server(
            { name: 'romai-mcp-http', version: '0.6.0' },
            { capabilities: { tools: {} } }
        );

        this.app = express();
        this.httpServer = createServer(this.app);
        this.wsServer = new WebSocketServer({ server: this.httpServer });

        this.setupRoutes();
        this.setupTools();
        this.setupWebSocket();
    }

    private setupRoutes(): void {
        this.app.use(express.json());

        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'romai-mcp',
                version: '0.6.0',
                timestamp: new Date().toISOString(),
                country: 'Romania 🇷🇴'
            });
        });

        this.app.get('/capabilities', (req, res) => {
            res.json({
                transport: 'http+websocket',
                tools: ['romai_intelligence', 'romai_code_assistant', 'romai_romanian_expert', 'romai_problem_solver', 'romai_market_intelligence', 'romai_regulatory_advisor'],
                features: ['romanian_language', 'business_intelligence', 'market_analysis', 'regulatory_compliance', 'ai_assistance'],
                specialization: 'Romanian Business & Culture AI Assistant'
            });
        });

        this.app.get('/services', (req, res) => {
            res.json({
                intelligence: 'General AI intelligence with Romanian context',
                codeAssistant: 'Romanian-first coding assistance',
                romanianExpert: 'Deep Romanian cultural and business expertise',
                problemSolver: 'Step-by-step problem solving',
                marketIntelligence: 'Romanian market analysis',
                regulatoryAdvisor: 'Romanian legal and compliance guidance'
            });
        });

        console.log('Romai MCP HTTP routes configured');
    }

    private setupTools(): void {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'romai_intelligence',
                    description: 'Ask ROMAI for intelligent analysis and problem-solving in Romanian or English',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'The question or problem to analyze'
                            },
                            language: {
                                type: 'string',
                                enum: ['ro', 'en'],
                                default: 'ro',
                                description: 'Language for the response (Romanian or English)'
                            },
                            domain: {
                                type: 'string',
                                default: 'general',
                                description: 'Domain context (e.g., technology, business, science)'
                            },
                            context: {
                                type: 'string',
                                description: 'Additional context for the query'
                            }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'romai_code_assistant',
                    description: 'Romanian-first coding assistant for programming help and code generation',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            request: {
                                type: 'string',
                                description: 'Your coding question or request'
                            },
                            language: {
                                type: 'string',
                                description: 'Programming language (e.g., JavaScript, Python, TypeScript)'
                            },
                            framework: {
                                type: 'string',
                                description: 'Framework or library context'
                            },
                            explain_in: {
                                type: 'string',
                                enum: ['ro', 'en'],
                                default: 'ro',
                                description: 'Language for explanations'
                            }
                        },
                        required: ['request']
                    }
                },
                {
                    name: 'romai_romanian_expert',
                    description: 'Get expert advice on Romanian culture, language, business, and local context',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Your question about Romania'
                            },
                            category: {
                                type: 'string',
                                enum: ['culture', 'business', 'language', 'history', 'travel', 'legal', 'education'],
                                default: 'general',
                                description: 'Category of Romanian expertise needed'
                            }
                        },
                        required: ['query']
                    }
                },
                {
                    name: 'romai_problem_solver',
                    description: 'General problem-solving with step-by-step analysis and practical solutions',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            problem: {
                                type: 'string',
                                description: 'The problem to solve'
                            },
                            goals: {
                                type: 'string',
                                description: 'Desired outcomes or goals'
                            },
                            constraints: {
                                type: 'string',
                                description: 'Any constraints or limitations'
                            },
                            language: {
                                type: 'string',
                                enum: ['ro', 'en'],
                                default: 'ro',
                                description: 'Response language'
                            }
                        },
                        required: ['problem']
                    }
                },
                {
                    name: 'romai_market_intelligence',
                    description: 'Advanced Romanian market intelligence and competitive analysis',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            industry: {
                                type: 'string',
                                description: 'Industry sector for analysis'
                            },
                            analysis_type: {
                                type: 'string',
                                enum: ['competitive', 'market_size', 'trends', 'opportunities', 'risks'],
                                default: 'comprehensive',
                                description: 'Type of market analysis'
                            },
                            region: {
                                type: 'string',
                                default: 'nationwide',
                                description: 'Specific Romanian region or nationwide'
                            },
                            time_horizon: {
                                type: 'string',
                                enum: ['current', '6_months', '1_year', '3_years'],
                                default: 'current',
                                description: 'Analysis time horizon'
                            }
                        },
                        required: ['industry']
                    }
                },
                {
                    name: 'romai_regulatory_advisor',
                    description: 'Romanian regulatory and compliance guidance',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            business_type: {
                                type: 'string',
                                description: 'Type of business or industry'
                            },
                            regulation_area: {
                                type: 'string',
                                enum: ['company_formation', 'tax', 'employment', 'data_privacy', 'industry_specific'],
                                description: 'Area of regulatory guidance needed'
                            },
                            company_size: {
                                type: 'string',
                                enum: ['startup', 'sme', 'enterprise'],
                                default: 'sme',
                                description: 'Company size category'
                            }
                        },
                        required: ['business_type', 'regulation_area']
                    }
                }
            ] as Tool[]
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'romai_intelligence':
                        return await this.handleIntelligence(
                            args?.query as string,
                            args?.language as string,
                            args?.domain as string,
                            args?.context as string
                        );
                    case 'romai_code_assistant':
                        return await this.handleCodeAssistant(
                            args?.request as string,
                            args?.language as string,
                            args?.framework as string,
                            args?.explain_in as string
                        );
                    case 'romai_romanian_expert':
                        return await this.handleRomanianExpert(
                            args?.query as string,
                            args?.category as string
                        );
                    case 'romai_problem_solver':
                        return await this.handleProblemSolver(
                            args?.problem as string,
                            args?.goals as string,
                            args?.constraints as string,
                            args?.language as string
                        );
                    case 'romai_market_intelligence':
                        return await this.handleMarketIntelligence(
                            args?.industry as string,
                            args?.analysis_type as string,
                            args?.region as string,
                            args?.time_horizon as string
                        );
                    case 'romai_regulatory_advisor':
                        return await this.handleRegulatoryAdvisor(
                            args?.business_type as string,
                            args?.regulation_area as string,
                            args?.company_size as string
                        );
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [{
                        type: 'text',
                        text: `Error executing ${name}: ${error instanceof Error ? error.message : String(error)}`
                    }]
                };
            }
        });
    }

    private async handleIntelligence(query: string, language = 'ro', domain = 'general', context?: string): Promise<any> {
        if (!query) {
            throw new Error('Query is required');
        }

        // This is a mock implementation - in production would integrate with Azure OpenAI
        const response = language === 'ro'
            ? `🇷🇴 ROMAI Analiză Inteligentă pentru: "${query}"\n\n` +
            `Domeniul: ${domain}\n` +
            `Context: ${context || 'General'}\n\n` +
            `Aceasta este o implementare de test. În producție, ar folosi Azure OpenAI pentru analiza avansată.`
            : `🇷🇴 ROMAI Intelligence Analysis for: "${query}"\n\n` +
            `Domain: ${domain}\n` +
            `Context: ${context || 'General'}\n\n` +
            `This is a test implementation. In production, would use Azure OpenAI for advanced analysis.`;

        return {
            content: [{
                type: 'text',
                text: response
            }]
        };
    }

    private async handleCodeAssistant(request: string, language?: string, framework?: string, explain_in = 'ro'): Promise<any> {
        if (!request) {
            throw new Error('Request is required');
        }

        const response = explain_in === 'ro'
            ? `💻 ROMAI Asistent Programare\n\n` +
            `Cerere: ${request}\n` +
            `Limbaj de programare: ${language || 'Nu specificat'}\n` +
            `Framework: ${framework || 'Nu specificat'}\n\n` +
            `Aceasta este o implementare de test pentru asistentul de programare ROMAI.`
            : `💻 ROMAI Code Assistant\n\n` +
            `Request: ${request}\n` +
            `Programming Language: ${language || 'Not specified'}\n` +
            `Framework: ${framework || 'Not specified'}\n\n` +
            `This is a test implementation for ROMAI code assistant.`;

        return {
            content: [{
                type: 'text',
                text: response
            }]
        };
    }

    private async handleRomanianExpert(query: string, category = 'general'): Promise<any> {
        if (!query) {
            throw new Error('Query is required');
        }

        const response = `🇷🇴 ROMAI Expert Român\n\n` +
            `Întrebare: ${query}\n` +
            `Categoria: ${category}\n\n` +
            `Ca expert în cultura și afacerile românești, aceasta este o implementare de test.\n` +
            `În producție, ar oferi sfaturi detaliate despre România, cultura, istoria, și contextul local.`;

        return {
            content: [{
                type: 'text',
                text: response
            }]
        };
    }

    private async handleProblemSolver(problem: string, goals?: string, constraints?: string, language = 'ro'): Promise<any> {
        if (!problem) {
            throw new Error('Problem is required');
        }

        const response = language === 'ro'
            ? `🎯 ROMAI Rezolvitor de Probleme\n\n` +
            `Problemă: ${problem}\n` +
            `Obiective: ${goals || 'Nu specificate'}\n` +
            `Constrângeri: ${constraints || 'Nu specificate'}\n\n` +
            `Aceasta este o implementare de test pentru soluționarea de probleme.`
            : `🎯 ROMAI Problem Solver\n\n` +
            `Problem: ${problem}\n` +
            `Goals: ${goals || 'Not specified'}\n` +
            `Constraints: ${constraints || 'Not specified'}\n\n` +
            `This is a test implementation for problem solving.`;

        return {
            content: [{
                type: 'text',
                text: response
            }]
        };
    }

    private async handleMarketIntelligence(industry: string, analysis_type = 'comprehensive', region = 'nationwide', time_horizon = 'current'): Promise<any> {
        if (!industry) {
            throw new Error('Industry is required');
        }

        const response = `📊 ROMAI Inteligența Pieței Românești\n\n` +
            `Industria: ${industry}\n` +
            `Tip analiză: ${analysis_type}\n` +
            `Regiune: ${region}\n` +
            `Orizont de timp: ${time_horizon}\n\n` +
            `Aceasta este o implementare de test pentru analiza pieței românești.\n` +
            `În producție, ar furniza analize detaliate de piață și competitive.`;

        return {
            content: [{
                type: 'text',
                text: response
            }]
        };
    }

    private async handleRegulatoryAdvisor(business_type: string, regulation_area: string, company_size = 'sme'): Promise<any> {
        if (!business_type || !regulation_area) {
            throw new Error('Business type and regulation area are required');
        }

        const response = `⚖️ ROMAI Consilier Reglementări Românești\n\n` +
            `Tip afacere: ${business_type}\n` +
            `Domeniu reglementări: ${regulation_area}\n` +
            `Mărimea companiei: ${company_size}\n\n` +
            `Aceasta este o implementare de test pentru consiliere juridică și de reglementări în România.`;

        return {
            content: [{
                type: 'text',
                text: response
            }]
        };
    }

    private setupWebSocket(): void {
        this.wsServer.on('connection', (ws) => {
            console.log('Romai MCP WebSocket client connected');

            // For now, use a simple message handler - will implement proper MCP transport later
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    // Handle MCP protocol messages here
                    ws.send(JSON.stringify({
                        id: message.id,
                        result: { status: 'received', service: 'romai-mcp' }
                    }));
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            });

            ws.on('close', () => {
                console.log('Romai MCP WebSocket client disconnected');
            });
        });
    }

    async start(): Promise<void> {
        return new Promise((resolve) => {
            this.httpServer.listen(this.port, () => {
                console.log(`🇷🇴 Romai MCP HTTP Server running on port ${this.port}`);
                console.log(`   Health check: http://localhost:${this.port}/health`);
                console.log(`   WebSocket: ws://localhost:${this.port}`);
                resolve();
            });
        });
    }

    async stop(): Promise<void> {
        this.wsServer.close();
        this.httpServer.close();
        console.log('Romai MCP HTTP Server stopped');
    }
}

// CLI entry point
if (require.main === module) {
    const port = parseInt(process.env.ROMAI_MCP_PORT || '8003');
    const server = new RomaiHttpMcpServer(port);

    server.start().catch((error) => {
        console.error('Failed to start Romai MCP HTTP Server:', error);
        process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        console.log('Shutting down Romai MCP HTTP Server...');
        await server.stop();
        process.exit(0);
    });
}

export { RomaiHttpMcpServer };
