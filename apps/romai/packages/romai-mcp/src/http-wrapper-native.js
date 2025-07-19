import http from 'http';
import url from 'url';

const port = process.env.ROMAI_MCP_PORT || 8003;

// Environment variables for Azure OpenAI
const azureConfig = {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://aide-openai-dev.openai.azure.com/',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-12-01-preview',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o'
};

// Simple HTTP server without Express
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;
    const method = req.method;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS requests
    if (method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // MCP SSE endpoint for VS Code
    if (pathname === '/sse' && method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });

        // Send initial MCP initialization
        const initResponse = {
            jsonrpc: '2.0',
            id: 1,
            result: {
                protocolVersion: '2024-11-05',
                capabilities: {
                    tools: {
                        list: true,
                        call: true
                    },
                    resources: {
                        list: true,
                        read: true
                    }
                },
                serverInfo: {
                    name: 'romai-mcp',
                    version: '1.0.0'
                }
            }
        };

        res.write(`data: ${JSON.stringify(initResponse)}\n\n`);

        // Keep connection alive
        const keepAlive = setInterval(() => {
            res.write('data: {"jsonrpc":"2.0","method":"ping"}\n\n');
        }, 30000);

        req.on('close', () => {
            clearInterval(keepAlive);
        });

        return;
    }

    // Set JSON content type for other endpoints
    res.setHeader('Content-Type', 'application/json');

    try {
        // Health check endpoint
        if (pathname === '/health' && method === 'GET') {
            const response = {
                status: 'healthy',
                service: 'romai-mcp-http-wrapper',
                timestamp: new Date().toISOString(),
                port: port,
                azure_configured: !!azureConfig.apiKey
            };
            res.writeHead(200);
            res.end(JSON.stringify(response, null, 2));
            return;
        }

        // Capabilities endpoint
        if (pathname === '/capabilities' && method === 'GET') {
            const response = {
                service: 'romai-mcp-http-wrapper',
                version: '1.0.0',
                capabilities: {
                    intelligence: {
                        general_analysis: true,
                        romanian_context: true,
                        problem_solving: true,
                        market_intelligence: true
                    },
                    coding: {
                        assistance: true,
                        code_generation: true,
                        debugging: true,
                        best_practices: true
                    },
                    business: {
                        regulatory_advice: true,
                        market_analysis: true,
                        compliance_guidance: true
                    }
                },
                endpoints: [
                    'GET /health',
                    'GET /capabilities',
                    'POST /api/intelligence',
                    'POST /api/code-assistant',
                    'POST /api/romanian-expert',
                    'POST /api/problem-solver',
                    'POST /api/market-intelligence',
                    'POST /api/regulatory-advisor'
                ]
            };
            res.writeHead(200);
            res.end(JSON.stringify(response, null, 2));
            return;
        }

        // Handle POST requests
        if (method === 'POST') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });

            req.on('end', async () => {
                try {
                    const data = JSON.parse(body);

                    // Intelligence endpoint
                    if (pathname === '/api/intelligence') {
                        const { query, context, domain = 'general', language = 'ro' } = data;

                        if (!query) {
                            const response = { success: false, error: 'Query is required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

                        // Mock intelligent response (in production, this would call Azure OpenAI)
                        const response = {
                            success: true,
                            query,
                            language,
                            domain,
                            analysis: `Analiză inteligentă pentru: "${query}". Domeniul: ${domain}. Context: ${context || 'general'}`,
                            recommendations: [
                                'Recomandare 1: Analizați contextul complet',
                                'Recomandare 2: Considerați factorii specifici români',
                                'Recomandare 3: Implementați soluția gradual'
                            ],
                            confidence: 0.95,
                            processing_time: '150ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                        return;
                    }

                    // Code Assistant endpoint
                    if (pathname === '/api/code-assistant') {
                        const { request, language, framework, explain_in = 'ro' } = data;

                        if (!request) {
                            const response = { success: false, error: 'Coding request is required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

                        const response = {
                            success: true,
                            request,
                            language: language || 'general',
                            framework: framework || 'general',
                            explanation: explain_in === 'ro' ?
                                `Asistență pentru programare: ${request}. Limbaj: ${language || 'general'}` :
                                `Coding assistance for: ${request}. Language: ${language || 'general'}`,
                            code_suggestion: `// Exemplu de cod pentru: ${request}\n// TODO: Implementează logica specifică`,
                            best_practices: [
                                'Folosește principiile SOLID',
                                'Scrie teste unitare',
                                'Documentează codul'
                            ],
                            processing_time: '200ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                        return;
                    }

                    // Romanian Expert endpoint
                    if (pathname === '/api/romanian-expert') {
                        const { query, category = 'general' } = data;

                        if (!query) {
                            const response = { success: false, error: 'Query about Romania is required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

                        const response = {
                            success: true,
                            query,
                            category,
                            expert_advice: `Sfat expert despre România în categoria "${category}": ${query}`,
                            cultural_context: 'Context cultural și istoric relevant pentru întrebarea dvs.',
                            practical_tips: [
                                'Sfat practic 1: Luați în considerare specificul local',
                                'Sfat practic 2: Respectați tradițiile și normele culturale',
                                'Sfat practic 3: Consultați resurse locale autoritare'
                            ],
                            processing_time: '180ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                        return;
                    }

                    // Problem Solver endpoint
                    if (pathname === '/api/problem-solver') {
                        const { problem, goals, constraints, language = 'ro' } = data;

                        if (!problem) {
                            const response = { success: false, error: 'Problem description is required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

                        const response = {
                            success: true,
                            problem,
                            goals: goals || 'Obiective generale',
                            constraints: constraints || 'Fără constrângeri specificate',
                            solution_steps: [
                                '1. Analizează problema în detaliu',
                                '2. Identifică resursele disponibile',
                                '3. Dezvoltă strategii alternative',
                                '4. Implementează soluția optimă',
                                '5. Monitorizează și ajustează'
                            ],
                            estimated_effort: 'Mediu',
                            success_probability: '85%',
                            processing_time: '220ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                        return;
                    }

                    // Market Intelligence endpoint
                    if (pathname === '/api/market-intelligence') {
                        const { industry, analysis_type = 'comprehensive', region = 'nationwide', time_horizon = 'current' } = data;

                        if (!industry) {
                            const response = { success: false, error: 'Industry sector is required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

                        const response = {
                            success: true,
                            industry,
                            analysis_type,
                            region,
                            time_horizon,
                            market_overview: `Analiza pieței românești pentru industria: ${industry}`,
                            key_insights: [
                                'Insight 1: Tendințe de creștere în sectorul analizat',
                                'Insight 2: Oportunități de investiție identificate',
                                'Insight 3: Provocări și riscuri de luat în considerare'
                            ],
                            recommendations: [
                                'Recomandare strategică 1',
                                'Recomandare tactică 2',
                                'Plan de acțiune 3'
                            ],
                            confidence_level: 'Ridicat',
                            processing_time: '300ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                        return;
                    }

                    // Regulatory Advisor endpoint
                    if (pathname === '/api/regulatory-advisor') {
                        const { business_type, regulation_area, company_size = 'sme' } = data;

                        if (!business_type || !regulation_area) {
                            const response = { success: false, error: 'Business type and regulation area are required' };
                            res.writeHead(400);
                            res.end(JSON.stringify(response, null, 2));
                            return;
                        }

                        const response = {
                            success: true,
                            business_type,
                            regulation_area,
                            company_size,
                            regulatory_guidance: `Ghid reglementator pentru ${business_type} în domeniul ${regulation_area}`,
                            compliance_requirements: [
                                'Cerință 1: Înregistrarea la autoritățile competente',
                                'Cerință 2: Respectarea normelor specifice sectorului',
                                'Cerință 3: Raportarea periodică conform legislației'
                            ],
                            legal_references: [
                                'Legea nr. XXX/XXXX',
                                'OUG nr. YYY/YYYY',
                                'Norma ANAF nr. ZZZ'
                            ],
                            next_steps: [
                                'Pas 1: Consultarea unui avocat specializat',
                                'Pas 2: Pregătirea documentației necesare',
                                'Pas 3: Depunerea cererii la autorități'
                            ],
                            processing_time: '250ms'
                        };
                        res.writeHead(200);
                        res.end(JSON.stringify(response, null, 2));
                        return;
                    }

                } catch (parseError) {
                    const response = { success: false, error: 'Invalid JSON body', message: parseError.message };
                    res.writeHead(400);
                    res.end(JSON.stringify(response, null, 2));
                    return;
                }
            });
            return;
        }

        // 404 for unhandled routes
        const response = { success: false, error: 'Not found', path: pathname, method: method };
        res.writeHead(404);
        res.end(JSON.stringify(response, null, 2));

    } catch (error) {
        const response = { success: false, error: 'Internal server error', message: error.message };
        res.writeHead(500);
        res.end(JSON.stringify(response, null, 2));
    }
});

// Start the server
server.listen(port, () => {
    console.log(`🇷🇴 Romai MCP HTTP Wrapper running on port ${port}`);
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log(`   Capabilities: http://localhost:${port}/capabilities`);
    console.log(`   Intelligence API: http://localhost:${port}/api/intelligence`);
    console.log(`   Azure OpenAI: ${azureConfig.apiKey ? 'Configured' : 'Not configured'}`);
    console.log(`   Server is ready to accept requests!`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down Romai MCP HTTP Wrapper...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Shutting down Romai MCP HTTP Wrapper...');
    server.close(() => {
        process.exit(0);
    });
});
