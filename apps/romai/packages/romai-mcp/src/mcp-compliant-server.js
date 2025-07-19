const http = require('http');
const { URL } = require('url');

// Mock Azure OpenAI configuration
const AZURE_CONFIG = {
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://your-endpoint.openai.azure.com/',
    apiKey: process.env.AZURE_OPENAI_API_KEY || 'your-api-key',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4'
};

// Romai MCP server implementation
class RomaiMCPServer {
    constructor() {
        this.protocolVersion = '2024-11-05';
        this.serverInfo = {
            name: 'romai-mcp',
            version: '1.0.0'
        };
        this.capabilities = {
            tools: {
                list: true,
                call: true
            },
            resources: {
                list: false,
                read: false
            }
        };
    }

    async handleJSONRPC(request) {
        const { method, params, id } = request;

        try {
            switch (method) {
                case 'initialize':
                    return this.handleInitialize(id, params);
                case 'tools/list':
                    return this.handleToolsList(id);
                case 'tools/call':
                    return this.handleToolCall(id, params);
                default:
                    return {
                        jsonrpc: '2.0',
                        id,
                        error: {
                            code: -32601,
                            message: 'Method not found',
                            data: { method }
                        }
                    };
            }
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: 'Internal error',
                    data: error.message
                }
            };
        }
    }

    handleInitialize(id, params) {
        return {
            jsonrpc: '2.0',
            id,
            result: {
                protocolVersion: this.protocolVersion,
                capabilities: this.capabilities,
                serverInfo: this.serverInfo
            }
        };
    }

    handleToolsList(id) {
        const tools = [
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
                            description: 'Language for the response (Romanian or English)',
                            enum: ['ro', 'en'],
                            default: 'ro'
                        },
                        domain: {
                            type: 'string',
                            description: 'Domain context (e.g., technology, business, science)',
                            default: 'general'
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
                            description: 'Language for explanations',
                            enum: ['ro', 'en'],
                            default: 'ro'
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
                            description: 'Category of Romanian expertise needed',
                            enum: ['culture', 'business', 'language', 'history', 'travel', 'legal', 'education'],
                            default: 'general'
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
                            description: 'Response language',
                            enum: ['ro', 'en'],
                            default: 'ro'
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
                            description: 'Type of market analysis',
                            enum: ['competitive', 'market_size', 'trends', 'opportunities', 'risks'],
                            default: 'comprehensive'
                        },
                        region: {
                            type: 'string',
                            description: 'Specific Romanian region or nationwide',
                            default: 'nationwide'
                        },
                        time_horizon: {
                            type: 'string',
                            description: 'Analysis time horizon',
                            enum: ['current', '6_months', '1_year', '3_years'],
                            default: 'current'
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
                            description: 'Area of regulatory guidance needed',
                            enum: ['company_formation', 'tax', 'employment', 'data_privacy', 'industry_specific']
                        },
                        company_size: {
                            type: 'string',
                            description: 'Company size category',
                            enum: ['startup', 'sme', 'enterprise'],
                            default: 'sme'
                        }
                    },
                    required: ['business_type', 'regulation_area']
                }
            },
            {
                name: 'romai_health_check',
                description: 'Check the health status of ROMAI services',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ];

        return {
            jsonrpc: '2.0',
            id,
            result: {
                tools
            }
        };
    }

    async handleToolCall(id, params) {
        const { name, arguments: args } = params;

        try {
            let result;
            switch (name) {
                case 'romai_intelligence':
                    result = await this.romaiIntelligence(args);
                    break;
                case 'romai_code_assistant':
                    result = await this.romaiCodeAssistant(args);
                    break;
                case 'romai_romanian_expert':
                    result = await this.romaiRomanianExpert(args);
                    break;
                case 'romai_problem_solver':
                    result = await this.romaiProblemSolver(args);
                    break;
                case 'romai_market_intelligence':
                    result = await this.romaiMarketIntelligence(args);
                    break;
                case 'romai_regulatory_advisor':
                    result = await this.romaiRegulatoryAdvisor(args);
                    break;
                case 'romai_health_check':
                    result = await this.romaiHealthCheck();
                    break;
                default:
                    return {
                        jsonrpc: '2.0',
                        id,
                        error: {
                            code: -32601,
                            message: 'Unknown tool',
                            data: { toolName: name }
                        }
                    };
            }

            return {
                jsonrpc: '2.0',
                id,
                result: {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(result, null, 2)
                    }]
                }
            };
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: 'Tool execution failed',
                    data: error.message
                }
            };
        }
    }

    // Mock AI call function (replace with actual Azure OpenAI integration)
    async callAzureOpenAI(prompt, context = {}) {
        // This is a mock implementation
        // In production, you would integrate with Azure OpenAI API
        return {
            success: true,
            response: `ROMAI Mock Response: Processed query "${prompt}" with context: ${JSON.stringify(context)}`,
            model: AZURE_CONFIG.deploymentName,
            usage: {
                prompt_tokens: prompt.length,
                completion_tokens: 100,
                total_tokens: prompt.length + 100
            }
        };
    }

    async romaiIntelligence(args) {
        const { query, language = 'ro', domain = 'general', context } = args;

        try {
            const prompt = `
                Query: ${query}
                Language: ${language}
                Domain: ${domain}
                Context: ${context || 'N/A'}
                
                Please provide intelligent analysis and problem-solving response.
            `;

            const aiResponse = await this.callAzureOpenAI(prompt, { language, domain });

            return {
                success: true,
                query: query,
                language: language,
                domain: domain,
                response: aiResponse.response,
                metadata: {
                    model: aiResponse.model,
                    usage: aiResponse.usage,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                query: query,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async romaiCodeAssistant(args) {
        const { request, language, framework, explain_in = 'ro' } = args;

        try {
            const prompt = `
                Code Request: ${request}
                Programming Language: ${language || 'Not specified'}
                Framework: ${framework || 'Not specified'}
                Explain in: ${explain_in}
                
                Please provide coding assistance with explanations.
            `;

            const aiResponse = await this.callAzureOpenAI(prompt, { language, framework, explain_in });

            return {
                success: true,
                request: request,
                programming_language: language,
                framework: framework,
                explanation_language: explain_in,
                response: aiResponse.response,
                metadata: {
                    model: aiResponse.model,
                    usage: aiResponse.usage,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                request: request,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async romaiRomanianExpert(args) {
        const { query, category = 'general' } = args;

        try {
            const prompt = `
                Romanian Expert Query: ${query}
                Category: ${category}
                
                Please provide expert advice on Romanian context.
            `;

            const aiResponse = await this.callAzureOpenAI(prompt, { category });

            return {
                success: true,
                query: query,
                category: category,
                response: aiResponse.response,
                metadata: {
                    model: aiResponse.model,
                    usage: aiResponse.usage,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                query: query,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async romaiProblemSolver(args) {
        const { problem, goals, constraints, language = 'ro' } = args;

        try {
            const prompt = `
                Problem: ${problem}
                Goals: ${goals || 'Not specified'}
                Constraints: ${constraints || 'Not specified'}
                Language: ${language}
                
                Please provide step-by-step problem-solving analysis.
            `;

            const aiResponse = await this.callAzureOpenAI(prompt, { language, goals, constraints });

            return {
                success: true,
                problem: problem,
                goals: goals,
                constraints: constraints,
                language: language,
                response: aiResponse.response,
                metadata: {
                    model: aiResponse.model,
                    usage: aiResponse.usage,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                problem: problem,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async romaiMarketIntelligence(args) {
        const { industry, analysis_type = 'comprehensive', region = 'nationwide', time_horizon = 'current' } = args;

        try {
            const prompt = `
                Market Intelligence Analysis
                Industry: ${industry}
                Analysis Type: ${analysis_type}
                Region: ${region}
                Time Horizon: ${time_horizon}
                
                Please provide Romanian market intelligence analysis.
            `;

            const aiResponse = await this.callAzureOpenAI(prompt, { industry, analysis_type, region, time_horizon });

            return {
                success: true,
                industry: industry,
                analysis_type: analysis_type,
                region: region,
                time_horizon: time_horizon,
                response: aiResponse.response,
                metadata: {
                    model: aiResponse.model,
                    usage: aiResponse.usage,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                industry: industry,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async romaiRegulatoryAdvisor(args) {
        const { business_type, regulation_area, company_size = 'sme' } = args;

        try {
            const prompt = `
                Romanian Regulatory Advisory
                Business Type: ${business_type}
                Regulation Area: ${regulation_area}
                Company Size: ${company_size}
                
                Please provide Romanian regulatory and compliance guidance.
            `;

            const aiResponse = await this.callAzureOpenAI(prompt, { business_type, regulation_area, company_size });

            return {
                success: true,
                business_type: business_type,
                regulation_area: regulation_area,
                company_size: company_size,
                response: aiResponse.response,
                metadata: {
                    model: aiResponse.model,
                    usage: aiResponse.usage,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            return {
                success: false,
                business_type: business_type,
                regulation_area: regulation_area,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    async romaiHealthCheck() {
        return {
            success: true,
            status: 'healthy',
            server: 'romai-mcp',
            version: '1.0.0',
            azure_config: {
                endpoint_configured: !!AZURE_CONFIG.endpoint && AZURE_CONFIG.endpoint !== 'https://your-endpoint.openai.azure.com/',
                api_key_configured: !!AZURE_CONFIG.apiKey && AZURE_CONFIG.apiKey !== 'your-api-key',
                deployment_configured: !!AZURE_CONFIG.deploymentName && AZURE_CONFIG.deploymentName !== 'gpt-4'
            },
            timestamp: new Date().toISOString()
        };
    }
}

// Create server instance
const server = new RomaiMCPServer();

// Create HTTP server
const httpServer = http.createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/') {
        // Handle JSON-RPC requests
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const request = JSON.parse(body);
                const response = await server.handleJSONRPC(request);

                res.setHeader('Content-Type', 'application/json');
                res.writeHead(200);
                res.end(JSON.stringify(response));
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    error: {
                        code: -32700,
                        message: 'Parse error'
                    }
                }));
            }
        });
    } else if (req.method === 'GET' && url.pathname === '/sse') {
        // SSE endpoint for MCP
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        // Handle SSE JSON-RPC messages
        let buffer = '';
        req.on('data', async (chunk) => {
            buffer += chunk.toString();

            // Look for complete JSON messages
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);

                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = line.slice(6); // Remove 'data: '
                        const request = JSON.parse(jsonData);
                        const response = await server.handleJSONRPC(request);

                        res.write(`data: ${JSON.stringify(response)}\n\n`);
                    } catch (error) {
                        res.write(`data: ${JSON.stringify({
                            jsonrpc: '2.0',
                            error: { code: -32700, message: 'Parse error' }
                        })}\n\n`);
                    }
                }
            }
        });

        req.on('end', () => {
            res.end();
        });

        req.on('close', () => {
            res.end();
        });

    } else if (req.method === 'GET' && url.pathname === '/health') {
        // Health check endpoint
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'healthy',
            server: 'romai-mcp',
            version: '1.0.0',
            timestamp: new Date().toISOString()
        }));
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

// Start server
const PORT = process.env.PORT || 8003;
httpServer.listen(PORT, () => {
    console.log(`Romai MCP server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`JSON-RPC endpoint: http://localhost:${PORT}/`);
    console.log(`SSE endpoint: http://localhost:${PORT}/sse`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down Romai MCP server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('Shutting down Romai MCP server...');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
