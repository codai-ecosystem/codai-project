#!/usr/bin/env node

/**
 * Simple HTTP wrapper for Romai MCP
 * Exposes Romai MCP functionality via REST API
 */

const express = require('express');
const app = express();
const port = parseInt(process.env.ROMAI_MCP_PORT || '8003');

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'romai-mcp-http-wrapper',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        country: 'Romania 🇷🇴'
    });
});

// Capabilities endpoint
app.get('/capabilities', (req, res) => {
    res.json({
        transport: 'http-wrapper',
        tools: ['romai_intelligence', 'romai_code_assistant', 'romai_romanian_expert', 'romai_problem_solver', 'romai_market_intelligence', 'romai_regulatory_advisor'],
        features: ['romanian_language', 'business_intelligence', 'market_analysis', 'regulatory_compliance', 'ai_assistance'],
        specialization: 'Romanian Business & Culture AI Assistant',
        wrapper: true
    });
});

// Services info endpoint
app.get('/api/services', (req, res) => {
    res.json({
        intelligence: 'General AI intelligence with Romanian context',
        codeAssistant: 'Romanian-first coding assistance',
        romanianExpert: 'Deep Romanian cultural and business expertise',
        problemSolver: 'Step-by-step problem solving',
        marketIntelligence: 'Romanian market analysis',
        regulatoryAdvisor: 'Romanian legal and compliance guidance'
    });
});

// Intelligence endpoint
app.post('/api/intelligence', async (req, res) => {
    const { query, language = 'ro', domain = 'general', context } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = language === 'ro'
            ? `🇷🇴 ROMAI Analiză Inteligentă pentru: "${query}"\n\n` +
            `Domeniul: ${domain}\n` +
            `Context: ${context || 'General'}\n\n` +
            `Aceasta este o implementare de test. În producție, ar folosi Azure OpenAI pentru analiza avansată.\n\n` +
            `Răspunsul ar include:\n` +
            `• Analiză detaliată a cererii\n` +
            `• Soluții practice adaptate contextului românesc\n` +
            `• Recomandări bazate pe experiența locală\n` +
            `• Resurse și referințe relevante`
            : `🇷🇴 ROMAI Intelligence Analysis for: "${query}"\n\n` +
            `Domain: ${domain}\n` +
            `Context: ${context || 'General'}\n\n` +
            `This is a test implementation. In production, would use Azure OpenAI for advanced analysis.\n\n` +
            `Response would include:\n` +
            `• Detailed analysis of the request\n` +
            `• Practical solutions adapted to Romanian context\n` +
            `• Recommendations based on local experience\n` +
            `• Relevant resources and references`;

        res.json({
            success: true,
            response,
            query,
            language,
            domain,
            context,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Code assistant endpoint
app.post('/api/code-assistant', async (req, res) => {
    const { request, language, framework, explain_in = 'ro' } = req.body;

    if (!request) {
        return res.status(400).json({ error: 'Request is required' });
    }

    try {
        const response = explain_in === 'ro'
            ? `💻 ROMAI Asistent Programare\n\n` +
            `Cerere: ${request}\n` +
            `Limbaj de programare: ${language || 'Nu specificat'}\n` +
            `Framework: ${framework || 'Nu specificat'}\n\n` +
            `Aceasta este o implementare de test pentru asistentul de programare ROMAI.\n\n` +
            `În producție, ar oferi:\n` +
            `• Cod complet și funcțional\n` +
            `• Explicații în română\n` +
            `• Best practices pentru tehnologia specificată\n` +
            `• Exemple de utilizare\n` +
            `• Resurse de învățare în română`
            : `💻 ROMAI Code Assistant\n\n` +
            `Request: ${request}\n` +
            `Programming Language: ${language || 'Not specified'}\n` +
            `Framework: ${framework || 'Not specified'}\n\n` +
            `This is a test implementation for ROMAI code assistant.\n\n` +
            `In production, would provide:\n` +
            `• Complete and functional code\n` +
            `• Explanations in Romanian\n` +
            `• Best practices for specified technology\n` +
            `• Usage examples\n` +
            `• Learning resources in Romanian`;

        res.json({
            success: true,
            response,
            request,
            language,
            framework,
            explain_in,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Romanian expert endpoint
app.post('/api/romanian-expert', async (req, res) => {
    const { query, category = 'general' } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const response = `🇷🇴 ROMAI Expert Român\n\n` +
            `Întrebare: ${query}\n` +
            `Categoria: ${category}\n\n` +
            `Ca expert în cultura și afacerile românești, aceasta este o implementare de test.\n` +
            `În producție, ar oferi sfaturi detaliate despre:\n\n` +
            `• România - cultură, istorie și tradiții\n` +
            `• Mediul de afaceri românesc\n` +
            `• Legislația și reglementările locale\n` +
            `• Limbajul română - nuanțe și particularități\n` +
            `• Contextul economic și social\n` +
            `• Oportunități de investiții și dezvoltare\n\n` +
            `Răspunsul ar fi adaptat specificului românesc și ar include exemple concrete din realitatea locală.`;

        res.json({
            success: true,
            response,
            query,
            category,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Problem solver endpoint
app.post('/api/problem-solver', async (req, res) => {
    const { problem, goals, constraints, language = 'ro' } = req.body;

    if (!problem) {
        return res.status(400).json({ error: 'Problem is required' });
    }

    try {
        const response = language === 'ro'
            ? `🎯 ROMAI Rezolvitor de Probleme\n\n` +
            `Problemă: ${problem}\n` +
            `Obiective: ${goals || 'Nu specificate'}\n` +
            `Constrângeri: ${constraints || 'Nu specificate'}\n\n` +
            `Aceasta este o implementare de test pentru soluționarea de probleme.\n\n` +
            `În producție, ar oferi:\n` +
            `• Analiză pas cu pas a problemei\n` +
            `• Soluții creative și practice\n` +
            `• Planuri de acțiune detaliate\n` +
            `• Evaluarea riscurilor și oportunităților\n` +
            `• Resurse necesare pentru implementare`
            : `🎯 ROMAI Problem Solver\n\n` +
            `Problem: ${problem}\n` +
            `Goals: ${goals || 'Not specified'}\n` +
            `Constraints: ${constraints || 'Not specified'}\n\n` +
            `This is a test implementation for problem solving.\n\n` +
            `In production, would provide:\n` +
            `• Step-by-step problem analysis\n` +
            `• Creative and practical solutions\n` +
            `• Detailed action plans\n` +
            `• Risk and opportunity assessment\n` +
            `• Resources needed for implementation`;

        res.json({
            success: true,
            response,
            problem,
            goals,
            constraints,
            language,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Market intelligence endpoint
app.post('/api/market-intelligence', async (req, res) => {
    const { industry, analysis_type = 'comprehensive', region = 'nationwide', time_horizon = 'current' } = req.body;

    if (!industry) {
        return res.status(400).json({ error: 'Industry is required' });
    }

    try {
        const response = `📊 ROMAI Inteligența Pieței Românești\n\n` +
            `Industria: ${industry}\n` +
            `Tip analiză: ${analysis_type}\n` +
            `Regiune: ${region}\n` +
            `Orizont de timp: ${time_horizon}\n\n` +
            `Aceasta este o implementare de test pentru analiza pieței românești.\n\n` +
            `În producție, ar furniza:\n` +
            `• Analize detaliate de piață și competitive\n` +
            `• Date statistice și tendințe\n` +
            `• Profile ale competitorilor principali\n` +
            `• Oportunități de creștere și dezvoltare\n` +
            `• Riscuri și amenințări de pe piață\n` +
            `• Recomandări strategice specifice industriei\n` +
            `• Prognoze pe termen scurt și lung\n\n` +
            `Toate analizele ar fi focusate pe realitățile pieței românești.`;

        res.json({
            success: true,
            response,
            industry,
            analysis_type,
            region,
            time_horizon,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Regulatory advisor endpoint
app.post('/api/regulatory-advisor', async (req, res) => {
    const { business_type, regulation_area, company_size = 'sme' } = req.body;

    if (!business_type || !regulation_area) {
        return res.status(400).json({ error: 'Business type and regulation area are required' });
    }

    try {
        const response = `⚖️ ROMAI Consilier Reglementări Românești\n\n` +
            `Tip afacere: ${business_type}\n` +
            `Domeniu reglementări: ${regulation_area}\n` +
            `Mărimea companiei: ${company_size}\n\n` +
            `Aceasta este o implementare de test pentru consiliere juridică și de reglementări în România.\n\n` +
            `În producție, ar oferi:\n` +
            `• Ghiduri detaliate pentru înființarea companiilor\n` +
            `• Informații despre obligațiile fiscale\n` +
            `• Reglementări specifice industriei\n` +
            `• Proceduri administrative și formulare\n` +
            `• Termene legale și deadline-uri\n` +
            `• Actualizări legislative\n` +
            `• Consultanță pentru conformitatea GDPR\n` +
            `• Asistență pentru obținerea autorizațiilor\n\n` +
            `Toate informațiile ar fi actualizate conform legislației românești în vigoare.`;

        res.json({
            success: true,
            response,
            business_type,
            regulation_area,
            company_size,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`🇷🇴 Romai MCP HTTP Wrapper running on port ${port}`);
    console.log(`   Health check: http://localhost:${port}/health`);
    console.log(`   Capabilities: http://localhost:${port}/capabilities`);
    console.log(`   Romanian AI API: http://localhost:${port}/api/{service}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down Romai MCP HTTP Wrapper...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down Romai MCP HTTP Wrapper...');
    process.exit(0);
});
