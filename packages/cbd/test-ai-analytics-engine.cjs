#!/usr/bin/env node

/**
 * CBD AI Analytics Engine - Test Script
 * Phase 4.3.2 Implementation Verification
 * 
 * Tests all AI analytics functionalities including:
 * - Predictive Analytics
 * - Anomaly Detection  
 * - Pattern Recognition
 * - NLP Analysis
 * - Recommendations
 * - Comprehensive Analysis
 */

const http = require('http');

const AI_ANALYTICS_URL = 'http://localhost:4700';

/**
 * Test runner for AI Analytics Engine
 */
class AIAnalyticsTestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    async runAllTests() {
        console.log('🧠 CBD AI Analytics Engine - Comprehensive Test Suite');
        console.log('='.repeat(60));

        // Test service health
        await this.testHealthCheck();

        // Test predictive analytics
        await this.testPredictiveAnalytics();

        // Test anomaly detection
        await this.testAnomalyDetection();

        // Test pattern recognition
        await this.testPatternRecognition();

        // Test NLP analysis
        await this.testNLPAnalysis();

        // Test recommendations
        await this.testRecommendations();

        // Test comprehensive analysis
        await this.testComprehensiveAnalysis();

        // Test model management
        await this.testModelManagement();

        // Show final results
        this.showResults();
    }

    async testHealthCheck() {
        try {
            console.log('\\n🔍 Testing Health Check...');
            const response = await this.makeRequest('/health', 'GET');

            if (response.status === 'healthy' && response.service === 'CBD AI Analytics Engine') {
                this.pass('Health check successful');
                console.log(`   ✅ Service: ${response.service}`);
                console.log(`   ✅ Version: ${response.version}`);
                console.log(`   ✅ AI Capabilities: TensorFlow=${response.aiCapabilities?.tensorFlow}, NLP=${response.aiCapabilities?.naturalLanguage}`);
            } else {
                this.fail('Health check failed - invalid response');
            }
        } catch (error) {
            this.fail(`Health check failed: ${error.message}`);
        }
    }

    async testPredictiveAnalytics() {
        try {
            console.log('\\n📈 Testing Predictive Analytics...');

            const testData = [10, 12, 15, 18, 22, 25, 30, 35, 40, 45];
            const response = await this.makeRequest('/analyze/predict', 'POST', {
                data: testData,
                modelType: 'timeseries',
                horizon: 5,
                confidence: 0.95
            });

            if (response.success && response.predictions && response.predictions.forecast) {
                this.pass('Predictive analytics successful');
                console.log(`   ✅ Generated ${response.predictions.forecast.length} predictions`);
                console.log(`   ✅ Detected trend: ${response.predictions.trend}`);
                console.log(`   ✅ Processing time: ${response.metadata.processingTime}ms`);
            } else {
                this.fail('Predictive analytics failed - invalid response');
            }
        } catch (error) {
            this.fail(`Predictive analytics failed: ${error.message}`);
        }
    }

    async testAnomalyDetection() {
        try {
            console.log('\\n🚨 Testing Anomaly Detection...');

            // Data with obvious anomalies
            const testData = [10, 12, 11, 13, 100, 14, 12, 11, 200, 13, 12];
            const response = await this.makeRequest('/analyze/anomaly', 'POST', {
                data: testData,
                threshold: 2.0,
                method: 'statistical'
            });

            if (response.success && response.anomalies) {
                this.pass('Anomaly detection successful');
                console.log(`   ✅ Detected ${response.anomalies.detected.length} anomalies`);
                console.log(`   ✅ Method: ${response.anomalies.method}`);
                console.log(`   ✅ Statistics available: ${!!response.anomalies.statistics}`);
            } else {
                this.fail('Anomaly detection failed - invalid response');
            }
        } catch (error) {
            this.fail(`Anomaly detection failed: ${error.message}`);
        }
    }

    async testPatternRecognition() {
        try {
            console.log('\\n🔍 Testing Pattern Recognition...');

            const testData = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5, 1, 2, 3, 4, 5];
            const response = await this.makeRequest('/analyze/pattern', 'POST', {
                data: testData,
                patternType: 'temporal',
                minSupport: 0.1
            });

            if (response.success && response.patterns) {
                this.pass('Pattern recognition successful');
                console.log(`   ✅ Discovered ${response.patterns.discovered.length} patterns`);
                console.log(`   ✅ Pattern type: ${response.patterns.type}`);
                console.log(`   ✅ Confidence: ${response.patterns.confidence}`);
            } else {
                this.fail('Pattern recognition failed - invalid response');
            }
        } catch (error) {
            this.fail(`Pattern recognition failed: ${error.message}`);
        }
    }

    async testNLPAnalysis() {
        try {
            console.log('\\n🗣️  Testing NLP Analysis...');

            const testText = "This is a great product! I love using it every day. The quality is excellent and the price is reasonable. However, the delivery was a bit slow.";
            const response = await this.makeRequest('/analyze/nlp', 'POST', {
                text: testText,
                tasks: ['sentiment', 'entities', 'keywords']
            });

            if (response.success && response.analysis) {
                this.pass('NLP analysis successful');
                console.log(`   ✅ Sentiment: ${response.analysis.sentiment?.label} (${response.analysis.sentiment?.score})`);
                console.log(`   ✅ Entities found: ${response.analysis.entities?.length || 0}`);
                console.log(`   ✅ Keywords found: ${response.analysis.keywords?.length || 0}`);
                console.log(`   ✅ Word count: ${response.analysis.statistics?.wordCount}`);
            } else {
                this.fail('NLP analysis failed - invalid response');
            }
        } catch (error) {
            this.fail(`NLP analysis failed: ${error.message}`);
        }
    }

    async testRecommendations() {
        try {
            console.log('\\n💡 Testing Recommendations...');

            const response = await this.makeRequest('/analyze/recommend', 'POST', {
                userId: 'test_user_123',
                context: { category: 'electronics', previousViews: ['laptop', 'mouse'] },
                itemCount: 5,
                algorithm: 'collaborative'
            });

            if (response.success && response.recommendations && response.recommendations.items) {
                this.pass('Recommendations successful');
                console.log(`   ✅ Generated ${response.recommendations.items.length} recommendations`);
                console.log(`   ✅ Algorithm: ${response.recommendations.algorithm}`);
                console.log(`   ✅ Confidence: ${response.recommendations.confidence}`);
            } else {
                this.fail('Recommendations failed - invalid response');
            }
        } catch (error) {
            this.fail(`Recommendations failed: ${error.message}`);
        }
    }

    async testComprehensiveAnalysis() {
        try {
            console.log('\\n📊 Testing Comprehensive Analysis...');

            const testData = [10, 15, 12, 18, 25, 22, 30, 28, 35, 100, 32, 38];
            const response = await this.makeRequest('/analyze/comprehensive', 'POST', {
                data: testData,
                options: {
                    prediction: { horizon: 3 },
                    anomaly: { threshold: 2.5 },
                    pattern: { minSupport: 0.2 }
                }
            });

            if (response.success && response.results) {
                this.pass('Comprehensive analysis successful');
                console.log(`   ✅ Predictions: ${!!response.results.predictions}`);
                console.log(`   ✅ Anomalies: ${!!response.results.anomalies}`);
                console.log(`   ✅ Patterns: ${!!response.results.patterns}`);
                console.log(`   ✅ Insights: ${!!response.results.insights}`);
                console.log(`   ✅ Tasks completed: ${response.metadata.tasksCompleted}`);
            } else {
                this.fail('Comprehensive analysis failed - invalid response');
            }
        } catch (error) {
            this.fail(`Comprehensive analysis failed: ${error.message}`);
        }
    }

    async testModelManagement() {
        try {
            console.log('\\n🤖 Testing Model Management...');

            // List models
            const listResponse = await this.makeRequest('/models/list', 'GET');

            if (listResponse.success && Array.isArray(listResponse.models)) {
                this.pass('Model listing successful');
                console.log(`   ✅ Found ${listResponse.models.length} models`);

                // Train a new model
                const trainResponse = await this.makeRequest('/models/train', 'POST', {
                    modelType: 'regression',
                    trainingData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    modelConfig: { epochs: 10, learningRate: 0.01 }
                });

                if (trainResponse.success && trainResponse.modelId) {
                    this.pass('Model training successful');
                    console.log(`   ✅ Trained model: ${trainResponse.modelId}`);
                    console.log(`   ✅ Accuracy: ${trainResponse.trainingResult.accuracy}`);
                } else {
                    this.fail('Model training failed');
                }

            } else {
                this.fail('Model listing failed - invalid response');
            }
        } catch (error) {
            this.fail(`Model management failed: ${error.message}`);
        }
    }

    async makeRequest(path, method = 'GET', data = null) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'localhost',
                port: 4700,
                path: path,
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const req = http.request(options, (res) => {
                let responseData = '';

                res.on('data', (chunk) => {
                    responseData += chunk;
                });

                res.on('end', () => {
                    try {
                        const response = JSON.parse(responseData);
                        resolve(response);
                    } catch (error) {
                        reject(new Error(`Invalid JSON response: ${responseData}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        });
    }

    pass(message) {
        console.log(`   ✅ ${message}`);
        this.results.passed++;
        this.results.total++;
    }

    fail(message) {
        console.log(`   ❌ ${message}`);
        this.results.failed++;
        this.results.total++;
    }

    showResults() {
        console.log('\\n' + '='.repeat(60));
        console.log('🧠 CBD AI Analytics Engine - Test Results');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📊 Total:  ${this.results.total}`);
        console.log(`🎯 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

        if (this.results.failed === 0) {
            console.log('\\n🎉 All tests passed! AI Analytics Engine is fully operational.');
        } else {
            console.log(`\\n⚠️  ${this.results.failed} test(s) failed. Please check the AI Analytics Engine.`);
        }

        console.log('\\n📊 Service URL: http://localhost:4700');
        console.log('🔍 Health Check: http://localhost:4700/health');
        console.log('📈 Statistics: http://localhost:4700/stats');
    }
}

// Run tests if executed directly
if (require.main === module) {
    const testRunner = new AIAnalyticsTestRunner();

    // Wait for service to be ready
    setTimeout(async () => {
        try {
            await testRunner.runAllTests();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            process.exit(1);
        }
    }, 2000);
}

module.exports = AIAnalyticsTestRunner;
