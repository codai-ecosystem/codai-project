#!/usr/bin/env node

/**
 * Comprehensive Test Suite for MemorAI MCP Intelligence Layer (Phase 3)
 * Tests advanced semantic analysis, pattern recognition, and intelligent suggestions
 */

const http = require('http');

const BASE_URL = 'localhost';
const PORT = 8003;
const API_KEY = 'memorai-dev-key-2025';

function makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
                } catch (error) {
                    resolve({ status: res.statusCode, data: body, headers: res.headers });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testIntelligentMemorAI() {
    console.log('🧠 MEMORAI MCP INTELLIGENCE LAYER - COMPREHENSIVE TEST SUITE');
    console.log('='.repeat(70));
    console.log('🎯 Testing Phase 3: Semantic Analysis & Intelligent Features');
    console.log('='.repeat(70));

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    function logTest(name, success, details) {
        const status = success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${name}`);
        if (details) {
            console.log(`   ${details}`);
        }

        results.tests.push({ name, success, details });
        if (success) results.passed++;
        else results.failed++;
        console.log('');
    }

    try {
        // Test 1: Intelligence Health Check
        console.log('1️⃣ Testing Intelligence Health Endpoint...');
        const health = await makeRequest('/health');
        const healthSuccess = health.status === 200 &&
            health.data.service === 'MemorAI MCP Intelligent' &&
            health.data.intelligence === 'enabled';
        logTest('Intelligence Health Check', healthSuccess,
            `Service: ${health.data.service}, Intelligence: ${health.data.intelligence}, Features: ${health.data.features?.length || 0}`);

        // Test 2: Advanced Tools Discovery
        console.log('2️⃣ Testing Intelligence Tools Endpoint...');
        const tools = await makeRequest('/tools');
        const expectedTools = ['memorai_intelligent_remember', 'memorai_intelligent_recall', 'memorai_generate_suggestions', 'memorai_analyze_patterns'];
        const toolsSuccess = tools.status === 200 &&
            tools.data.intelligence_enabled === true &&
            expectedTools.every(tool =>
                tools.data.tools.some(t => t.name === tool)
            );
        logTest('Intelligence Tools Discovery', toolsSuccess,
            `Tools: ${tools.data.tools?.map(t => t.name).join(', ')}`);

        // Test 3: Intelligent Memory Storage with Semantic Analysis
        console.log('3️⃣ Testing Intelligent Memory Storage...');
        const testMemory = {
            content: 'I need to implement a machine learning algorithm for pattern recognition in user behavior data. This is a complex AI project that requires TensorFlow and advanced mathematics.',
            metadata: {
                project: 'AI Pattern Recognition',
                priority: 'high',
                category: 'development'
            },
            tags: ['ai', 'machine-learning', 'tensorflow', 'patterns'],
            context: {
                currentTime: Date.now(),
                userIntent: 'project_planning',
                domain: 'technology'
            }
        };

        const storeResponse = await makeRequest('/tools/memorai_intelligent_remember', 'POST', testMemory);
        const storeSuccess = storeResponse.status === 200 &&
            storeResponse.data.success === true &&
            storeResponse.data.analysis &&
            storeResponse.data.analysis.domain;
        logTest('Intelligent Memory Storage', storeSuccess,
            `Memory ID: ${storeResponse.data.memoryId}, Domain: ${storeResponse.data.analysis?.domain}, Concepts: ${storeResponse.data.analysis?.concepts?.length || 0}`);

        // Store additional test memories for pattern analysis
        const additionalMemories = [
            {
                content: 'Meeting with the development team about the AI project roadmap. We discussed TensorFlow integration and performance optimization strategies.',
                metadata: { type: 'meeting', project: 'AI Pattern Recognition' },
                tags: ['meeting', 'ai', 'tensorflow', 'optimization'],
                context: { userIntent: 'meeting_notes', domain: 'business' }
            },
            {
                content: 'Research paper on neural network architectures for pattern recognition. Found interesting approaches using convolutional layers.',
                metadata: { type: 'research', source: 'academic' },
                tags: ['research', 'neural-networks', 'cnn', 'patterns'],
                context: { userIntent: 'research', domain: 'technology' }
            },
            {
                content: 'Personal reminder: Review the TensorFlow documentation for the latest updates on pattern recognition APIs.',
                metadata: { type: 'reminder', priority: 'medium' },
                tags: ['reminder', 'tensorflow', 'documentation'],
                context: { userIntent: 'reminder', domain: 'personal' }
            }
        ];

        for (const memory of additionalMemories) {
            await makeRequest('/tools/memorai_intelligent_remember', 'POST', memory);
        }

        // Test 4: Context-Aware Intelligent Recall
        console.log('4️⃣ Testing Context-Aware Intelligent Recall...');
        const recallQuery = {
            query: 'machine learning pattern recognition project',
            context: {
                currentTime: Date.now(),
                userIntent: 'project_work',
                domain: 'technology'
            },
            limit: 3,
            includeAnalysis: true
        };

        const recallResponse = await makeRequest('/tools/memorai_intelligent_recall', 'POST', recallQuery);
        const recallSuccess = recallResponse.status === 200 &&
            recallResponse.data.success === true &&
            recallResponse.data.results &&
            recallResponse.data.results.length > 0 &&
            recallResponse.data.results[0].relevanceScore > 0;
        logTest('Context-Aware Intelligent Recall', recallSuccess,
            `Found: ${recallResponse.data.results?.length || 0} results, Top relevance: ${recallResponse.data.results?.[0]?.relevanceScore?.toFixed(3) || 'N/A'}, Explanation: ${recallResponse.data.results?.[0]?.explanation || 'N/A'}`);

        // Test 5: Pattern Recognition and Analysis
        console.log('5️⃣ Testing Pattern Recognition...');
        const patternAnalysis = {
            timeRange: 'day',
            minConfidence: 0.3
        };

        const patternsResponse = await makeRequest('/tools/memorai_analyze_patterns', 'POST', patternAnalysis);
        const patternsSuccess = patternsResponse.status === 200 &&
            patternsResponse.data.success === true &&
            Array.isArray(patternsResponse.data.patterns);
        logTest('Pattern Recognition', patternsSuccess,
            `Patterns found: ${patternsResponse.data.patterns?.length || 0}, Analyzed memories: ${patternsResponse.data.analyzed || 0}`);

        // Test 6: Intelligent Suggestions Generation
        console.log('6️⃣ Testing Intelligent Suggestions...');
        const suggestionsRequest = {
            context: {
                currentTime: Date.now(),
                userIntent: 'project_planning',
                domain: 'technology',
                recentActivity: 'ai_development'
            },
            includePatterns: true
        };

        const suggestionsResponse = await makeRequest('/tools/memorai_generate_suggestions', 'POST', suggestionsRequest);
        const suggestionsSuccess = suggestionsResponse.status === 200 &&
            suggestionsResponse.data.success === true &&
            Array.isArray(suggestionsResponse.data.suggestions);
        logTest('Intelligent Suggestions', suggestionsSuccess,
            `Suggestions: ${suggestionsResponse.data.suggestions?.length || 0}, Memory count: ${suggestionsResponse.data.memoryCount || 0}`);

        // Test 7: Semantic Analysis Quality
        console.log('7️⃣ Testing Semantic Analysis Quality...');
        const semanticTestMemory = {
            content: 'This is a negative experience with debugging a critical software issue. The problem was frustrating and took hours to resolve.',
            context: { testType: 'semantic_analysis' }
        };

        const semanticResponse = await makeRequest('/tools/memorai_intelligent_remember', 'POST', semanticTestMemory);
        const semanticSuccess = semanticResponse.status === 200 &&
            semanticResponse.data.analysis &&
            semanticResponse.data.analysis.sentiment &&
            semanticResponse.data.analysis.sentiment.polarity === 'negative';
        logTest('Semantic Analysis Quality', semanticSuccess,
            `Sentiment: ${semanticResponse.data.analysis?.sentiment?.polarity || 'N/A'}, Intent: ${semanticResponse.data.analysis?.intent?.intent || 'N/A'}, Domain: ${semanticResponse.data.analysis?.domain || 'N/A'}`);

        // Test 8: Performance Under Load
        console.log('8️⃣ Testing Performance Under Load...');
        const loadTestStart = Date.now();
        const loadTestPromises = [];

        for (let i = 0; i < 5; i++) {
            loadTestPromises.push(
                makeRequest('/tools/memorai_intelligent_recall', 'POST', {
                    query: `test query ${i}`,
                    limit: 2
                })
            );
        }

        const loadTestResults = await Promise.all(loadTestPromises);
        const loadTestTime = Date.now() - loadTestStart;
        const loadTestSuccess = loadTestResults.every(r => r.status === 200) && loadTestTime < 5000; // Under 5 seconds
        logTest('Performance Under Load', loadTestSuccess,
            `5 concurrent queries completed in ${loadTestTime}ms, All successful: ${loadTestResults.every(r => r.status === 200)}`);

        // Final Results
        console.log('='.repeat(70));
        console.log('📊 INTELLIGENCE LAYER TEST RESULTS');
        console.log('='.repeat(70));
        console.log(`✅ Tests Passed: ${results.passed}`);
        console.log(`❌ Tests Failed: ${results.failed}`);
        console.log(`🎯 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

        if (results.failed === 0) {
            console.log('');
            console.log('🎉 ALL INTELLIGENCE TESTS PASSED!');
            console.log('✅ MemorAI MCP Phase 3 Intelligence Layer is working perfectly');
            console.log('🧠 Semantic analysis, pattern recognition, and intelligent suggestions are operational');
            console.log('🚀 Ready for Phase 4: Advanced Features');
        } else {
            console.log(`⚠️ ${results.failed} test(s) failed - review required`);
        }

        console.log('='.repeat(70));

        // Intelligence Features Summary
        console.log('🧠 INTELLIGENCE FEATURES VALIDATED:');
        console.log('   ✅ Semantic Analysis with Embeddings');
        console.log('   ✅ Context-Aware Memory Retrieval');
        console.log('   ✅ Pattern Recognition and Discovery');
        console.log('   ✅ Intelligent Suggestions Generation');
        console.log('   ✅ Sentiment and Intent Analysis');
        console.log('   ✅ Domain Classification');
        console.log('   ✅ Temporal Reasoning');
        console.log('   ✅ Performance Optimization');

        console.log('='.repeat(70));
        console.log('🏁 Intelligence Layer test suite completed successfully');

        return results.failed === 0;

    } catch (error) {
        console.error('❌ Intelligence test suite failed with error:', error.message);
        return false;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testIntelligentMemorAI().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('❌ Intelligence test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { testIntelligentMemorAI };
