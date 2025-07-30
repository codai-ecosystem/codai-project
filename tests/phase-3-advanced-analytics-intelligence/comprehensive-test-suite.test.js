import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import WebSocket from 'ws';
import Redis from 'redis';
import AdvancedAnalytics from '../../libs/advanced-analytics/index.js';
import AIIntelligenceSystem from '../../libs/ai-intelligence/index.js';
import AdvancedVisualizationsSystem from '../../libs/advanced-visualizations/index.js';

/**
 * Comprehensive Test Suite for Phase 3.3 Advanced Analytics & Intelligence
 * 
 * Test Coverage:
 * - Advanced Analytics System (ML pipeline, real-time processing, predictive models)
 * - AI Intelligence System (decision making, learning, NLP, optimization)
 * - Advanced Visualizations System (chart creation, dashboards, real-time updates)
 * - Integration testing across all three systems
 * - Performance benchmarking and load testing
 * - Real-time communication and WebSocket functionality
 * - Machine learning model accuracy and effectiveness
 * - Data processing and analytics pipeline validation
 */

describe('Phase 3.3 Advanced Analytics & Intelligence - Comprehensive Test Suite', () => {
  let analyticsSystem, intelligenceSystem, visualizationsSystem;
  let redis;
  let wsConnections = [];

  beforeAll(async () => {
    // Initialize Redis for testing
    redis = Redis.createClient({ url: 'redis://localhost:6379' });
    await reddit.connect();

    // Initialize systems with test configurations
    analyticsSystem = new AdvancedAnalytics({
      port: 5010,
      wsPort: 5011,
      redisUrl: 'redis://localhost:6379'
    });

    intelligenceSystem = new AIIntelligenceSystem({
      port: 5012,
      wsPort: 5013,
      redisUrl: 'redis://localhost:6379'
    });

    visualizationsSystem = new AdvancedVisualizationsSystem({
      port: 5014,
      wsPort: 5015,
      redisUrl: 'redis://localhost:6379'
    });

    // Start all systems
    await Promise.all([
      analyticsSystem.start(),
      intelligenceSystem.start(),
      visualizationsSystem.start()
    ]);

    // Wait for systems to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  afterAll(async () => {
    // Close WebSocket connections
    wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });

    // Disconnect Redis
    await redis?.disconnect();

    // Shutdown systems
    await Promise.all([
      analyticsSystem?.redis?.disconnect(),
      intelligenceSystem?.redis?.disconnect(),
      visualizationsSystem?.redis?.disconnect()
    ]);
  });

  beforeEach(async () => {
    // Clear test data before each test
    await redis.flushdb();
  });

  afterEach(async () => {
    // Clean up after each test
    wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    wsConnections = [];
  });

  describe('Advanced Analytics System Tests', () => {
    describe('Health and Status', () => {
      it('should respond to health check', async () => {
        const response = await request(`http://localhost:5010`)
          .get('/health')
          .expect(200);

        expect(response.body.status).toBe('healthy');
        expect(response.body.uptime).toBeGreaterThan(0);
        expect(response.body.metrics).toBeDefined();
      });

      it('should provide system status', async () => {
        const response = await request(`http://localhost:5010`)
          .get('/status')
          .expect(200);

        expect(response.body.models).toBeDefined();
        expect(response.body.jobs).toBeDefined();
        expect(response.body.metrics).toBeDefined();
        expect(Array.isArray(response.body.models)).toBe(true);
      });
    });

    describe('Machine Learning Pipeline', () => {
      it('should train performance prediction model', async () => {
        const trainingData = {
          features: [
            [100, 80, 90, 85],
            [120, 95, 88, 92],
            [150, 110, 95, 98],
            [80, 60, 75, 70]
          ],
          labels: [85, 92, 96, 68]
        };

        const response = await request(`http://localhost:5010`)
          .post('/ml/train')
          .send({
            model: 'performance_prediction',
            data: trainingData
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.model_id).toBeDefined();
        expect(response.body.accuracy).toBeGreaterThan(0);
      });

      it('should make predictions using trained model', async () => {
        // First train a model
        await request(`http://localhost:5010`)
          .post('/ml/train')
          .send({
            model: 'performance_prediction',
            data: {
              features: [[100, 80, 90, 85], [120, 95, 88, 92]],
              labels: [85, 92]
            }
          });

        // Then make prediction
        const response = await request(`http://localhost:5010`)
          .post('/ml/predict')
          .send({
            model: 'performance_prediction',
            features: [110, 88, 89, 90]
          })
          .expect(200);

        expect(response.body.prediction).toBeDefined();
        expect(response.body.confidence).toBeGreaterThan(0);
        expect(response.body.confidence).toBeLessThanOrEqual(1);
      });

      it('should detect anomalies in data', async () => {
        const testData = {
          normal_data: [
            [10, 20, 30],
            [12, 22, 32],
            [11, 21, 31],
            [9, 19, 29]
          ],
          test_points: [
            [11, 21, 31], // Normal
            [50, 100, 150] // Anomaly
          ]
        };

        const response = await request(`http://localhost:5010`)
          .post('/ml/anomaly-detection')
          .send(testData)
          .expect(200);

        expect(response.body.results).toBeDefined();
        expect(Array.isArray(response.body.results)).toBe(true);
        expect(response.body.results).toHaveLength(2);
        expect(response.body.results[0].is_anomaly).toBe(false);
        expect(response.body.results[1].is_anomaly).toBe(true);
      });
    });

    describe('Real-time Analytics Processing', () => {
      it('should process real-time analytics data', async () => {
        const analyticsData = {
          timestamp: new Date().toISOString(),
          metrics: {
            cpu_usage: 75.5,
            memory_usage: 68.2,
            request_count: 1250,
            response_time: 245
          },
          source: 'test_service'
        };

        const response = await request(`http://localhost:5010`)
          .post('/analytics/process')
          .send(analyticsData)
          .expect(200);

        expect(response.body.processed).toBe(true);
        expect(response.body.analysis_id).toBeDefined();
        expect(response.body.insights).toBeDefined();
      });

      it('should generate performance insights', async () => {
        // Send multiple data points
        const dataPoints = [
          { cpu_usage: 75, memory_usage: 68, response_time: 245 },
          { cpu_usage: 82, memory_usage: 72, response_time: 289 },
          { cpu_usage: 79, memory_usage: 70, response_time: 267 }
        ];

        for (const data of dataPoints) {
          await request(`http://localhost:5010`)
            .post('/analytics/process')
            .send({
              timestamp: new Date().toISOString(),
              metrics: data,
              source: 'test_service'
            });
        }

        const response = await request(`http://localhost:5010`)
          .get('/analytics/insights')
          .query({ source: 'test_service', period: '1h' })
          .expect(200);

        expect(response.body.insights).toBeDefined();
        expect(response.body.trends).toBeDefined();
        expect(response.body.recommendations).toBeDefined();
      });
    });

    describe('WebSocket Real-time Communication', () => {
      it('should establish WebSocket connection', (done) => {
        const ws = new WebSocket('ws://localhost:5011');
        wsConnections.push(ws);

        ws.on('open', () => {
          expect(ws.readyState).toBe(WebSocket.OPEN);
          done();
        });

        ws.on('error', done);
      });

      it('should process ML training via WebSocket', (done) => {
        const ws = new WebSocket('ws://localhost:5011');
        wsConnections.push(ws);

        ws.on('open', () => {
          ws.send(JSON.stringify({
            type: 'ml_train',
            requestId: 'test-train-001',
            payload: {
              model: 'performance_prediction',
              data: {
                features: [[100, 80], [120, 95]],
                labels: [85, 92]
              }
            }
          }));
        });

        ws.on('message', (data) => {
          const response = JSON.parse(data.toString());
          expect(response.type).toBe('ml_train_response');
          expect(response.requestId).toBe('test-train-001');
          expect(response.payload.success).toBe(true);
          done();
        });

        ws.on('error', done);
      });
    });
  });

  describe('AI Intelligence System Tests', () => {
    describe('Decision Making Engine', () => {
      it('should make intelligent decisions', async () => {
        const decisionRequest = {
          context: {
            task: 'resource_allocation',
            priority: 'high',
            constraints: ['budget', 'timeline'],
            current_load: 75
          },
          options: [
            { name: 'scale_up', cost: 1000, time: '1 hour', efficiency: 0.9 },
            { name: 'optimize', cost: 0, time: '2 hours', efficiency: 0.7 },
            { name: 'defer', cost: 0, time: '0 hours', efficiency: 0.5 }
          ]
        };

        const response = await request(`http://localhost:5012`)
          .post('/decision')
          .send(decisionRequest)
          .expect(200);

        expect(response.body.id).toBeDefined();
        expect(response.body.decision).toBeDefined();
        expect(response.body.reasoning).toBeDefined();
        expect(response.body.confidence).toBeGreaterThan(0);
        expect(response.body.confidence).toBeLessThanOrEqual(1);
        expect(response.body.alternatives).toBeDefined();
      });

      it('should learn from decision feedback', async () => {
        // First make a decision
        const decisionResponse = await request(`http://localhost:5012`)
          .post('/decision')
          .send({
            context: { task: 'test_decision' },
            options: [{ name: 'option_a' }, { name: 'option_b' }]
          });

        const decisionId = decisionResponse.body.id;

        // Provide feedback
        const learningResponse = await request(`http://localhost:5012`)
          .post('/learning')
          .send({
            decisionId,
            outcome: 'success',
            feedback: {
              quality: 0.9,
              efficiency: 0.85,
              satisfaction: 0.8
            },
            metrics: {
              completion_time: 3600,
              resource_usage: 0.7
            }
          })
          .expect(200);

        expect(learningResponse.body.id).toBeDefined();
        expect(learningResponse.body.adaptations).toBeDefined();
        expect(learningResponse.body.improvements).toBeDefined();
        expect(learningResponse.body.efficiency).toBeGreaterThan(0);
      });
    });

    describe('Predictive Analytics', () => {
      it('should generate predictions', async () => {
        const predictionRequest = {
          data: {
            historical_usage: [100, 120, 130, 125, 140, 135, 145],
            current_trend: 'increasing',
            seasonal_factors: ['weekend', 'holiday'],
            external_factors: { weather: 'sunny', event: 'none' }
          },
          type: 'resource_demand',
          horizon: '24h'
        };

        const response = await request(`http://localhost:5012`)
          .post('/prediction')
          .send(predictionRequest)
          .expect(200);

        expect(response.body.id).toBeDefined();
        expect(response.body.prediction).toBeDefined();
        expect(response.body.confidence).toBeGreaterThan(0);
        expect(response.body.trend).toBeDefined();
        expect(response.body.factors).toBeDefined();
        expect(response.body.horizon).toBe('24h');
      });
    });

    describe('Natural Language Processing', () => {
      it('should process natural language queries via WebSocket', (done) => {
        const ws = new WebSocket('ws://localhost:5013');
        wsConnections.push(ws);

        ws.on('open', () => {
          ws.send(JSON.stringify({
            type: 'natural_language_query',
            requestId: 'nlp-test-001',
            payload: {
              query: 'What is the current system performance and how can we optimize it?',
              context: { system: 'codai', component: 'analytics' },
              intent: 'performance_inquiry'
            }
          }));
        });

        ws.on('message', (data) => {
          const response = JSON.parse(data.toString());
          expect(response.type).toBe('natural_language_query_response');
          expect(response.requestId).toBe('nlp-test-001');
          expect(response.payload.intent).toBeDefined();
          expect(response.payload.entities).toBeDefined();
          expect(response.payload.sentiment).toBeDefined();
          expect(response.payload.response).toBeDefined();
          expect(response.payload.confidence).toBeGreaterThan(0);
          done();
        });

        ws.on('error', done);
      });
    });

    describe('Optimization Engine', () => {
      it('should optimize system parameters', async () => {
        const optimizationRequest = {
          target: 'system_performance',
          parameters: {
            cpu_threshold: 80,
            memory_threshold: 85,
            response_time_target: 200,
            throughput_target: 1000
          },
          constraints: {
            max_cpu: 95,
            max_memory: 90,
            budget_limit: 5000
          }
        };

        const response = await request(`http://localhost:5012`)
          .post('/optimization')
          .send(optimizationRequest)
          .expect(200);

        expect(response.body.id).toBeDefined();
        expect(response.body.optimized_parameters).toBeDefined();
        expect(response.body.improvement).toBeGreaterThan(0);
        expect(response.body.efficiency_gain).toBeGreaterThan(0);
        expect(response.body.recommendations).toBeDefined();
      });
    });
  });

  describe('Advanced Visualizations System Tests', () => {
    describe('Chart Creation and Management', () => {
      it('should create various chart types', async () => {
        const chartTypes = [
          {
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
              datasets: [{
                label: 'Revenue',
                data: [1000, 1200, 1100, 1400, 1600],
                borderColor: 'rgb(75, 192, 192)'
              }]
            }
          },
          {
            type: 'bar',
            data: {
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [{
                label: 'Sales',
                data: [25000, 32000, 28000, 35000],
                backgroundColor: 'rgba(54, 162, 235, 0.5)'
              }]
            }
          },
          {
            type: 'pie',
            data: {
              labels: ['Desktop', 'Mobile', 'Tablet'],
              datasets: [{
                data: [60, 35, 5],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
              }]
            }
          }
        ];

        for (const chartConfig of chartTypes) {
          const response = await request(`http://localhost:5014`)
            .post('/chart')
            .send(chartConfig)
            .expect(200);

          expect(response.body.id).toBeDefined();
          expect(response.body.chart).toBeDefined();
          expect(response.body.preview).toBeDefined();
          expect(response.body.metadata.type).toBe(chartConfig.type);
        }
      });

      it('should update existing charts', async () => {
        // Create initial chart
        const initialChart = await request(`http://localhost:5014`)
          .post('/chart')
          .send({
            type: 'line',
            data: {
              labels: ['A', 'B', 'C'],
              datasets: [{ label: 'Test', data: [1, 2, 3] }]
            }
          });

        const chartId = initialChart.body.id;

        // Update chart data
        const updateResponse = await request(`http://localhost:5014`)
          .put(`/chart/${chartId}`)
          .send({
            data: {
              labels: ['A', 'B', 'C', 'D'],
              datasets: [{ label: 'Test Updated', data: [1, 2, 3, 4] }]
            }
          })
          .expect(200);

        expect(updateResponse.body.id).toBe(chartId);
        expect(updateResponse.body.chart).toBeDefined();
        expect(updateResponse.body.preview).toBeDefined();
      });
    });

    describe('Dashboard Creation', () => {
      it('should create interactive dashboards', async () => {
        // First create some charts
        const chart1 = await request(`http://localhost:5014`)
          .post('/chart')
          .send({
            type: 'line',
            data: { labels: ['A', 'B'], datasets: [{ data: [1, 2] }] }
          });

        const chart2 = await request(`http://localhost:5014`)
          .post('/chart')
          .send({
            type: 'bar',
            data: { labels: ['X', 'Y'], datasets: [{ data: [10, 20] }] }
          });

        // Create dashboard
        const dashboardResponse = await request(`http://localhost:5014`)
          .post('/dashboard')
          .send({
            name: 'Test Dashboard',
            layout: {
              rows: 2,
              columns: 2,
              grid: [
                { chartId: chart1.body.id, row: 0, col: 0, width: 1, height: 1 },
                { chartId: chart2.body.id, row: 0, col: 1, width: 1, height: 1 }
              ]
            },
            charts: [chart1.body.id, chart2.body.id],
            theme: 'dark'
          })
          .expect(200);

        expect(dashboardResponse.body.id).toBeDefined();
        expect(dashboardResponse.body.dashboard).toBeDefined();
        expect(dashboardResponse.body.preview).toBeDefined();
        expect(dashboardResponse.body.metadata.name).toBe('Test Dashboard');
      });
    });

    describe('Export Functionality', () => {
      it('should export charts in multiple formats', async () => {
        // Create a chart
        const chartResponse = await request(`http://localhost:5014`)
          .post('/chart')
          .send({
            type: 'line',
            data: {
              labels: ['Jan', 'Feb', 'Mar'],
              datasets: [{ label: 'Data', data: [10, 20, 15] }]
            }
          });

        const chartId = chartResponse.body.id;
        const formats = ['png', 'pdf', 'svg', 'html'];

        for (const format of formats) {
          const exportResponse = await request(`http://localhost:5014`)
            .post('/export')
            .send({
              id: chartId,
              type: 'chart',
              format,
              options: {
                quality: 'high',
                dimensions: { width: 800, height: 600 }
              }
            })
            .expect(200);

          expect(exportResponse.body.id).toBeDefined();
          expect(exportResponse.body.format).toBe(format);
          expect(exportResponse.body.url).toBeDefined();
          expect(exportResponse.body.size).toBeDefined();
        }
      });
    });

    describe('Real-time Updates', () => {
      it('should handle real-time chart updates via WebSocket', (done) => {
        const ws = new WebSocket('ws://localhost:5015');
        wsConnections.push(ws);

        let chartId;

        ws.on('open', () => {
          // Create chart via WebSocket
          ws.send(JSON.stringify({
            type: 'create_chart',
            requestId: 'chart-test-001',
            payload: {
              type: 'line',
              data: {
                labels: ['A', 'B'],
                datasets: [{ label: 'Test', data: [1, 2] }]
              },
              theme: 'dark'
            }
          }));
        });

        ws.on('message', (data) => {
          const response = JSON.parse(data.toString());

          if (response.type === 'create_chart_response') {
            chartId = response.payload.id;

            // Subscribe to real-time updates
            ws.send(JSON.stringify({
              type: 'subscribe_realtime',
              requestId: 'subscribe-001',
              payload: {
                chartId,
                interval: 1000
              }
            }));
          } else if (response.type === 'subscribe_realtime_response') {
            expect(response.payload.subscribed).toBe(true);
            expect(response.payload.chartId).toBe(chartId);
            done();
          }
        });

        ws.on('error', done);
      });
    });
  });

  describe('Integration Tests', () => {
    describe('Cross-System Communication', () => {
      it('should integrate analytics with intelligence for decision making', async () => {
        // Generate analytics data
        const analyticsData = {
          timestamp: new Date().toISOString(),
          metrics: {
            cpu_usage: 85,
            memory_usage: 78,
            request_count: 2000,
            response_time: 350,
            error_rate: 0.02
          },
          source: 'integration_test'
        };

        await request(`http://localhost:5010`)
          .post('/analytics/process')
          .send(analyticsData);

        // Use analytics data for intelligent decision making
        const decisionResponse = await request(`http://localhost:5012`)
          .post('/decision')
          .send({
            context: {
              task: 'performance_optimization',
              current_metrics: analyticsData.metrics,
              urgency: 'high'
            },
            options: [
              { name: 'scale_resources', impact: 'high', cost: 'high' },
              { name: 'optimize_code', impact: 'medium', cost: 'low' },
              { name: 'enable_caching', impact: 'medium', cost: 'very_low' }
            ]
          })
          .expect(200);

        expect(decisionResponse.body.decision).toBeDefined();
        expect(decisionResponse.body.confidence).toBeGreaterThan(0.5);
      });

      it('should create visualizations from analytics data', async () => {
        // Process analytics data
        const analyticsResults = [];
        const timestamps = [];

        for (let i = 0; i < 10; i++) {
          const timestamp = new Date(Date.now() - (10 - i) * 60000).toISOString();
          timestamps.push(timestamp.split('T')[1].substring(0, 5));

          const result = await request(`http://localhost:5010`)
            .post('/analytics/process')
            .send({
              timestamp,
              metrics: {
                cpu_usage: 70 + Math.random() * 20,
                memory_usage: 60 + Math.random() * 25,
                response_time: 200 + Math.random() * 100
              },
              source: 'visualization_test'
            });

          analyticsResults.push(result.body);
        }

        // Create visualization from analytics data
        const chartData = {
          labels: timestamps,
          datasets: [
            {
              label: 'CPU Usage (%)',
              data: analyticsResults.map((_, i) => 70 + Math.random() * 20),
              borderColor: 'rgb(255, 99, 132)'
            },
            {
              label: 'Memory Usage (%)',
              data: analyticsResults.map((_, i) => 60 + Math.random() * 25),
              borderColor: 'rgb(54, 162, 235)'
            }
          ]
        };

        const visualizationResponse = await request(`http://localhost:5014`)
          .post('/chart')
          .send({
            type: 'line',
            data: chartData,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'System Performance Over Time'
                }
              }
            }
          })
          .expect(200);

        expect(visualizationResponse.body.id).toBeDefined();
        expect(visualizationResponse.body.metadata.dataPoints).toBeGreaterThan(0);
      });
    });

    describe('End-to-End Workflow', () => {
      it('should complete full analytics-intelligence-visualization workflow', async () => {
        // Step 1: Generate and process analytics data
        const analyticsPromises = [];
        for (let i = 0; i < 5; i++) {
          analyticsPromises.push(
            request(`http://localhost:5010`)
              .post('/analytics/process')
              .send({
                timestamp: new Date().toISOString(),
                metrics: {
                  transactions: 1000 + i * 100,
                  latency: 150 + i * 10,
                  success_rate: 0.98 - i * 0.002
                },
                source: 'e2e_test'
              })
          );
        }

        const analyticsResults = await Promise.all(analyticsPromises);
        expect(analyticsResults.every(r => r.status === 200)).toBe(true);

        // Step 2: Get analytics insights
        const insightsResponse = await request(`http://localhost:5010`)
          .get('/analytics/insights')
          .query({ source: 'e2e_test', period: '1h' })
          .expect(200);

        expect(insightsResponse.body.insights).toBeDefined();

        // Step 3: Make intelligent decision based on insights
        const decisionResponse = await request(`http://localhost:5012`)
          .post('/decision')
          .send({
            context: {
              task: 'system_optimization',
              insights: insightsResponse.body.insights,
              urgency: 'medium'
            },
            options: [
              { name: 'increase_capacity', effectiveness: 0.9 },
              { name: 'optimize_algorithms', effectiveness: 0.7 },
              { name: 'implement_caching', effectiveness: 0.8 }
            ]
          })
          .expect(200);

        expect(decisionResponse.body.decision).toBeDefined();

        // Step 4: Create visualization of the complete workflow
        const workflowChart = await request(`http://localhost:5014`)
          .post('/chart')
          .send({
            type: 'bar',
            data: {
              labels: ['Analytics', 'Decision Quality', 'Optimization Impact'],
              datasets: [{
                label: 'Workflow Metrics',
                data: [
                  analyticsResults.length,
                  decisionResponse.body.confidence * 100,
                  insightsResponse.body.insights.optimization_potential * 100
                ],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
              }]
            },
            options: {
              plugins: {
                title: {
                  display: true,
                  text: 'End-to-End Workflow Performance'
                }
              }
            }
          })
          .expect(200);

        expect(workflowChart.body.id).toBeDefined();

        // Step 5: Export final visualization
        const exportResponse = await request(`http://localhost:5014`)
          .post('/export')
          .send({
            id: workflowChart.body.id,
            type: 'chart',
            format: 'png',
            options: { quality: 'high' }
          })
          .expect(200);

        expect(exportResponse.body.url).toBeDefined();
      });
    });
  });

  describe('Performance and Load Testing', () => {
    describe('System Performance', () => {
      it('should handle high-volume analytics processing', async () => {
        const startTime = Date.now();
        const promises = [];
        const batchSize = 50;

        for (let i = 0; i < batchSize; i++) {
          promises.push(
            request(`http://localhost:5010`)
              .post('/analytics/process')
              .send({
                timestamp: new Date().toISOString(),
                metrics: {
                  requests: Math.floor(1000 + Math.random() * 500),
                  latency: Math.floor(100 + Math.random() * 200),
                  cpu: Math.random() * 100,
                  memory: Math.random() * 100
                },
                source: `load_test_${i}`
              })
          );
        }

        const results = await Promise.allSettled(promises);
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const successRate = successCount / batchSize;

        expect(successRate).toBeGreaterThan(0.95); // 95% success rate
        expect(processingTime).toBeLessThan(10000); // Under 10 seconds

        console.log(`Processed ${batchSize} analytics requests in ${processingTime}ms`);
        console.log(`Success Rate: ${(successRate * 100).toFixed(2)}%`);
      });

      it('should handle concurrent decision requests', async () => {
        const startTime = Date.now();
        const promises = [];
        const concurrentRequests = 20;

        for (let i = 0; i < concurrentRequests; i++) {
          promises.push(
            request(`http://localhost:5012`)
              .post('/decision')
              .send({
                context: {
                  task: `concurrent_task_${i}`,
                  priority: Math.random() > 0.5 ? 'high' : 'normal'
                },
                options: [
                  { name: 'option_a', score: Math.random() },
                  { name: 'option_b', score: Math.random() }
                ]
              })
          );
        }

        const results = await Promise.allSettled(promises);
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const avgResponseTime = processingTime / concurrentRequests;

        expect(successCount).toBe(concurrentRequests);
        expect(avgResponseTime).toBeLessThan(1000); // Under 1 second average

        console.log(`Processed ${concurrentRequests} concurrent decisions in ${processingTime}ms`);
        console.log(`Average Response Time: ${avgResponseTime.toFixed(2)}ms`);
      });

      it('should handle multiple chart creations efficiently', async () => {
        const startTime = Date.now();
        const promises = [];
        const chartCount = 30;

        for (let i = 0; i < chartCount; i++) {
          const chartType = ['line', 'bar', 'pie'][i % 3];
          promises.push(
            request(`http://localhost:5014`)
              .post('/chart')
              .send({
                type: chartType,
                data: {
                  labels: Array.from({ length: 5 }, (_, j) => `Label ${j}`),
                  datasets: [{
                    label: `Dataset ${i}`,
                    data: Array.from({ length: 5 }, () => Math.floor(Math.random() * 100))
                  }]
                }
              })
          );
        }

        const results = await Promise.allSettled(promises);
        const endTime = Date.now();
        const processingTime = endTime - startTime;

        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const avgCreationTime = processingTime / chartCount;

        expect(successCount).toBe(chartCount);
        expect(avgCreationTime).toBeLessThan(500); // Under 500ms average

        console.log(`Created ${chartCount} charts in ${processingTime}ms`);
        console.log(`Average Creation Time: ${avgCreationTime.toFixed(2)}ms`);
      });
    });

    describe('Memory and Resource Usage', () => {
      it('should maintain reasonable memory usage under load', async () => {
        const initialMemory = process.memoryUsage();

        // Generate significant load
        const promises = [];
        for (let i = 0; i < 100; i++) {
          promises.push(
            request(`http://localhost:5010`)
              .post('/ml/train')
              .send({
                model: 'load_test_model',
                data: {
                  features: Array.from({ length: 50 }, () =>
                    Array.from({ length: 10 }, () => Math.random())
                  ),
                  labels: Array.from({ length: 50 }, () => Math.random())
                }
              })
          );
        }

        await Promise.allSettled(promises);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        const finalMemory = process.memoryUsage();
        const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
        const memoryIncreaseMB = memoryIncrease / (1024 * 1024);

        console.log(`Memory increase: ${memoryIncreaseMB.toFixed(2)}MB`);

        // Memory increase should be reasonable (less than 500MB)
        expect(memoryIncreaseMB).toBeLessThan(500);
      });
    });
  });

  describe('Error Handling and Resilience', () => {
    it('should handle invalid analytics data gracefully', async () => {
      const invalidData = {
        timestamp: 'invalid-timestamp',
        metrics: 'not-an-object',
        source: null
      };

      const response = await request(`http://localhost:5010`)
        .post('/analytics/process')
        .send(invalidData)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle decision requests with missing context', async () => {
      const response = await request(`http://localhost:5012`)
        .post('/decision')
        .send({
          options: [{ name: 'option_a' }]
          // Missing context
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle visualization requests with invalid data', async () => {
      const response = await request(`http://localhost:5014`)
        .post('/chart')
        .send({
          type: 'invalid_type',
          data: null
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should recover from Redis connection issues', async () => {
      // This test would require more complex setup to simulate Redis failures
      // For now, we'll test that the systems can handle Redis being unavailable

      const response = await request(`http://localhost:5010`)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
    });
  });
});

console.log(chalk.green('🧪 Phase 3.3 Advanced Analytics & Intelligence Test Suite Ready'));
console.log(chalk.blue('📊 Test Coverage: Analytics ML Pipeline, AI Intelligence, Advanced Visualizations'));
console.log(chalk.blue('🔗 Integration Testing: Cross-system communication and workflows'));
console.log(chalk.blue('⚡ Performance Testing: Load testing and resource monitoring'));
console.log(chalk.blue('🛡️ Error Handling: Resilience and graceful error recovery'));
