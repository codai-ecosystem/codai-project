#!/usr/bin/env node

/**
 * CBD AI Analytics Engine - Simple Test Client
 * Phase 4.3.2 - Quick Functionality Validation
 */

const https = require('http');

const BASE_URL = 'http://localhost:4700';

async function makeRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(endpoint, BASE_URL);

        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
                responseData += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        success: true,
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (error) {
                    resolve({
                        success: false,
                        error: 'JSON Parse Error: ' + error.message,
                        rawData: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject({
                success: false,
                error: error.message
            });
        });

        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    console.log('\n🧠 CBD AI Analytics Engine - Quick Test Suite');
    console.log('=' * 50);

    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Health Check
    totalTests++;
    console.log('\n📊 Testing Health Check...');
    try {
        const healthResult = await makeRequest('/health');
        if (healthResult.success && healthResult.data.status === 'healthy') {
            console.log('✅ Health Check: PASSED');
            console.log(`   Status: ${healthResult.data.status}`);
            console.log(`   Version: ${healthResult.data.version}`);
            console.log(`   Features: ${Object.keys(healthResult.data.features).length}`);
            console.log(`   Models: ${healthResult.data.models.statistical_models}`);
            passedTests++;
        } else {
            console.log('❌ Health Check: FAILED');
            console.log('   Error:', healthResult.error || 'Invalid response');
        }
    } catch (error) {
        console.log('❌ Health Check: ERROR');
        console.log('   Error:', error.error || error.message);
    }

    // Test 2: Dashboard
    totalTests++;
    console.log('\n📈 Testing Analytics Dashboard...');
    try {
        const dashboardResult = await makeRequest('/api/analytics/dashboard');
        if (dashboardResult.success && dashboardResult.data.overview) {
            console.log('✅ Dashboard: PASSED');
            console.log(`   Models Active: ${dashboardResult.data.overview.models_active}`);
            console.log(`   Predictions: ${dashboardResult.data.overview.predictions_today}`);
            passedTests++;
        } else {
            console.log('❌ Dashboard: FAILED');
            console.log('   Error:', dashboardResult.error || 'Invalid response');
        }
    } catch (error) {
        console.log('❌ Dashboard: ERROR');
        console.log('   Error:', error.error || error.message);
    }

    // Test 3: NLP Analysis
    totalTests++;
    console.log('\n📝 Testing NLP Analysis...');
    try {
        const nlpData = {
            text: "I love this amazing product! It works perfectly.",
            analysis_type: "comprehensive"
        };

        const nlpResult = await makeRequest('/api/nlp/analyze', 'POST', nlpData);
        if (nlpResult.success && nlpResult.data.tokens) {
            console.log('✅ NLP Analysis: PASSED');
            console.log(`   Tokens: ${nlpResult.data.tokens.length}`);
            console.log(`   Sentiment: ${nlpResult.data.sentiment_classification} (${nlpResult.data.sentiment_score})`);
            console.log(`   Intent: ${nlpResult.data.intent}`);
            passedTests++;
        } else {
            console.log('❌ NLP Analysis: FAILED');
            console.log('   Error:', nlpResult.error || 'Invalid response');
        }
    } catch (error) {
        console.log('❌ NLP Analysis: ERROR');
        console.log('   Error:', error.error || error.message);
    }

    // Test 4: Statistical Prediction
    totalTests++;
    console.log('\n🔮 Testing Statistical Prediction...');
    try {
        const predictionData = {
            data: [10, 15, 20, 25, 30, 35, 40],
            method: "linear_regression",
            options: { forecast_length: 3 }
        };

        const predictionResult = await makeRequest('/api/analytics/predict', 'POST', predictionData);
        if (predictionResult.success && predictionResult.data.predictions) {
            console.log('✅ Statistical Prediction: PASSED');
            console.log(`   Predictions: ${predictionResult.data.predictions.length}`);
            console.log(`   Confidence: ${predictionResult.data.confidence}`);
            console.log(`   Method: ${predictionResult.data.method}`);
            passedTests++;
        } else {
            console.log('❌ Statistical Prediction: FAILED');
            console.log('   Error:', predictionResult.error || 'Invalid response');
        }
    } catch (error) {
        console.log('❌ Statistical Prediction: ERROR');
        console.log('   Error:', error.error || error.message);
    }

    // Test 5: Anomaly Detection
    totalTests++;
    console.log('\n🚨 Testing Anomaly Detection...');
    try {
        const anomalyData = {
            data: [10, 12, 11, 13, 50, 12, 11, 85, 13], // Contains obvious anomalies
            sensitivity: 0.95,
            realTime: false
        };

        const anomalyResult = await makeRequest('/api/analytics/anomaly-detection', 'POST', anomalyData);
        if (anomalyResult.success && anomalyResult.data.data_points_analyzed) {
            console.log('✅ Anomaly Detection: PASSED');
            console.log(`   Data Points: ${anomalyResult.data.data_points_analyzed}`);
            console.log(`   Anomalies: ${anomalyResult.data.anomalies_detected}`);
            console.log(`   Methods: ${Object.keys(anomalyResult.data.individual_methods).join(', ')}`);
            passedTests++;
        } else {
            console.log('❌ Anomaly Detection: FAILED');
            console.log('   Error:', anomalyResult.error || 'Invalid response');
        }
    } catch (error) {
        console.log('❌ Anomaly Detection: ERROR');
        console.log('   Error:', error.error || error.message);
    }

    // Test 6: Sentiment Analysis
    totalTests++;
    console.log('\n💭 Testing Sentiment Analysis...');
    try {
        const sentimentData = {
            text: "This is terrible! I hate this service. Very disappointing.",
            detailed: true
        };

        const sentimentResult = await makeRequest('/api/nlp/sentiment', 'POST', sentimentData);
        if (sentimentResult.success && sentimentResult.data.sentiment_classification) {
            console.log('✅ Sentiment Analysis: PASSED');
            console.log(`   Classification: ${sentimentResult.data.sentiment_classification}`);
            console.log(`   Score: ${sentimentResult.data.sentiment_score}`);
            passedTests++;
        } else {
            console.log('❌ Sentiment Analysis: FAILED');
            console.log('   Error:', sentimentResult.error || 'Invalid response');
        }
    } catch (error) {
        console.log('❌ Sentiment Analysis: ERROR');
        console.log('   Error:', error.error || error.message);
    }

    // Results Summary
    console.log('\n' + '=' * 50);
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('=' * 50);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! AI Analytics Engine is fully operational.');
    } else {
        console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Please review the results above.`);
    }

    console.log('\n🧠 AI Analytics Engine testing complete!');
}

// Run the tests
runTests().catch(console.error);
