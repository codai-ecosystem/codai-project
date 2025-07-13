// ROMAI Ultimate MCP Server - K6 Performance Testing Suite
// Comprehensive load testing and performance benchmarking

import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// Custom metrics
const mcpCallsCounter = new Counter('mcp_calls_total');
const mcpErrorRate = new Rate('mcp_error_rate');
const mcpResponseTime = new Trend('mcp_response_time');

// Test configuration
export const options = {
  scenarios: {
    // Baseline load test
    baseline_load: {
      executor: 'constant-vus',
      vus: 10,
      duration: '2m',
      tags: { test_type: 'baseline' },
    },

    // Stress testing
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },   // Ramp up
        { duration: '2m', target: 50 },   // Normal load
        { duration: '1m', target: 100 },  // High load
        { duration: '2m', target: 100 },  // Sustain high load
        { duration: '1m', target: 200 },  // Stress load
        { duration: '1m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'stress' },
    },

    // Spike testing
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },  // Normal load
        { duration: '10s', target: 100 }, // Sudden spike
        { duration: '30s', target: 10 },  // Back to normal
        { duration: '10s', target: 200 }, // Massive spike
        { duration: '30s', target: 10 },  // Back to normal
      ],
      tags: { test_type: 'spike' },
    },

    // Soak testing (long duration)
    soak_test: {
      executor: 'constant-vus',
      vus: 20,
      duration: '10m',
      tags: { test_type: 'soak' },
    },
  },

  thresholds: {
    // Overall performance requirements
    http_req_duration: [
      'p(95)<200',     // 95% of requests under 200ms
      'p(99)<500',     // 99% of requests under 500ms
    ],
    http_req_failed: ['rate<0.01'],  // Error rate under 1%

    // MCP-specific thresholds
    mcp_response_time: [
      'p(95)<300',     // MCP calls under 300ms
      'p(99)<800',     // 99% under 800ms
    ],
    mcp_error_rate: ['rate<0.005'],  // MCP error rate under 0.5%

    // Scenario-specific thresholds
    'http_req_duration{test_type:baseline}': ['p(95)<150'],
    'http_req_duration{test_type:stress}': ['p(95)<400'],
    'http_req_duration{test_type:spike}': ['p(95)<600'],
    'http_req_duration{test_type:soak}': ['p(95)<200'],
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || '';

// Test data
const testQueries = [
  { query: 'What is artificial intelligence?', language: 'en' },
  { query: 'Explain machine learning concepts', language: 'en' },
  { query: 'Create a REST API in TypeScript', language: 'typescript' },
  { query: 'Optimize database performance', language: 'sql' },
  { query: 'Implement authentication system', language: 'javascript' },
  { query: 'Ce este inteligența artificială?', language: 'ro' },
  { query: 'Design microservices architecture', language: 'en' },
  { query: 'Debug memory leaks in Node.js', language: 'javascript' },
];

const codeProblems = [
  'Scale application to handle 1M users',
  'Implement real-time notifications',
  'Optimize API response times',
  'Design fault-tolerant system',
  'Create automated testing strategy',
  'Implement security best practices',
];

// Helper functions
function getRandomQuery() {
  return testQueries[Math.floor(Math.random() * testQueries.length)];
}

function getRandomProblem() {
  return codeProblems[Math.floor(Math.random() * codeProblems.length)];
}

function makeAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'K6-Performance-Test/1.0',
  };

  if (API_KEY) {
    headers['Authorization'] = `Bearer ${API_KEY}`;
  }

  return headers;
}

// Setup function
export function setup() {
  console.log('🚀 Starting ROMAI Ultimate MCP Server Performance Tests');
  console.log(`📍 Base URL: ${BASE_URL}`);

  // Health check
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    fail('Health check failed - server not ready');
  }

  console.log('✅ Server health check passed');
  return { baseUrl: BASE_URL };
}

// Main test function
export default function (data) {
  const headers = makeAuthHeaders();

  group('Health Check', () => {
    const response = http.get(`${data.baseUrl}/health`, { headers });

    check(response, {
      'health check status is 200': (r) => r.status === 200,
      'health check response time < 50ms': (r) => r.timings.duration < 50,
      'health check has status field': (r) => JSON.parse(r.body).status === 'ok',
    });
  });

  group('MCP Tools Discovery', () => {
    const response = http.get(`${data.baseUrl}/mcp/tools`, { headers });

    check(response, {
      'tools discovery status is 200': (r) => r.status === 200,
      'tools discovery response time < 100ms': (r) => r.timings.duration < 100,
      'tools list contains romai tools': (r) => {
        const tools = JSON.parse(r.body);
        return tools.some(tool => tool.name.includes('romai'));
      },
    });
  });

  group('ROMAI Intelligence API', () => {
    const query = getRandomQuery();
    const payload = JSON.stringify({
      tool: 'romai_intelligence',
      arguments: {
        query: query.query,
        language: query.language,
        domain: 'technology',
      },
    });

    const start = Date.now();
    const response = http.post(`${data.baseUrl}/mcp/call`, payload, { headers });
    const duration = Date.now() - start;

    mcpCallsCounter.add(1);
    mcpResponseTime.add(duration);

    const success = check(response, {
      'intelligence API status is 200': (r) => r.status === 200,
      'intelligence API response time < 2000ms': (r) => r.timings.duration < 2000,
      'intelligence API returns valid response': (r) => {
        try {
          const result = JSON.parse(r.body);
          return result.success === true && result.data;
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      mcpErrorRate.add(1);
    }
  });

  group('ROMAI Code Assistant API', () => {
    const payload = JSON.stringify({
      tool: 'romai_code_assistant',
      arguments: {
        request: 'Create a performant REST API endpoint',
        language: 'typescript',
        framework: 'express',
      },
    });

    const start = Date.now();
    const response = http.post(`${data.baseUrl}/mcp/call`, payload, { headers });
    const duration = Date.now() - start;

    mcpCallsCounter.add(1);
    mcpResponseTime.add(duration);

    const success = check(response, {
      'code assistant status is 200': (r) => r.status === 200,
      'code assistant response time < 3000ms': (r) => r.timings.duration < 3000,
      'code assistant returns code': (r) => {
        try {
          const result = JSON.parse(r.body);
          return result.success === true && result.data.includes('function');
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      mcpErrorRate.add(1);
    }
  });

  group('ROMAI Problem Solver API', () => {
    const problem = getRandomProblem();
    const payload = JSON.stringify({
      tool: 'romai_problem_solver',
      arguments: {
        problem: problem,
        constraints: 'High performance, scalable solution',
        goals: 'Optimal performance and maintainability',
      },
    });

    const start = Date.now();
    const response = http.post(`${data.baseUrl}/mcp/call`, payload, { headers });
    const duration = Date.now() - start;

    mcpCallsCounter.add(1);
    mcpResponseTime.add(duration);

    const success = check(response, {
      'problem solver status is 200': (r) => r.status === 200,
      'problem solver response time < 2500ms': (r) => r.timings.duration < 2500,
      'problem solver returns solution': (r) => {
        try {
          const result = JSON.parse(r.body);
          return result.success === true && result.data.length > 100;
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      mcpErrorRate.add(1);
    }
  });

  group('ROMAI Romanian Expert API', () => {
    const payload = JSON.stringify({
      tool: 'romai_romanian_expert',
      arguments: {
        query: 'Sfaturi pentru dezvoltarea unei afaceri în România',
        category: 'business',
      },
    });

    const start = Date.now();
    const response = http.post(`${data.baseUrl}/mcp/call`, payload, { headers });
    const duration = Date.now() - start;

    mcpCallsCounter.add(1);
    mcpResponseTime.add(duration);

    const success = check(response, {
      'romanian expert status is 200': (r) => r.status === 200,
      'romanian expert response time < 2000ms': (r) => r.timings.duration < 2000,
      'romanian expert returns advice': (r) => {
        try {
          const result = JSON.parse(r.body);
          return result.success === true && result.data.length > 50;
        } catch {
          return false;
        }
      },
    });

    if (!success) {
      mcpErrorRate.add(1);
    }
  });

  group('Concurrent API Calls', () => {
    // Test concurrent requests to simulate real-world usage
    const requests = [
      ['GET', `${data.baseUrl}/health`, null, { headers }],
      ['GET', `${data.baseUrl}/mcp/tools`, null, { headers }],
      ['POST', `${data.baseUrl}/mcp/call`, JSON.stringify({
        tool: 'romai_health_check',
        arguments: {},
      }), { headers }],
    ];

    const responses = http.batch(requests);

    check(responses[0], {
      'concurrent health check success': (r) => r.status === 200,
    });

    check(responses[1], {
      'concurrent tools discovery success': (r) => r.status === 200,
    });

    check(responses[2], {
      'concurrent health check call success': (r) => r.status === 200,
    });
  });

  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
}

// Teardown function
export function teardown(data) {
  console.log('📊 Performance test completed');
  console.log(`🎯 Base URL tested: ${data.baseUrl}`);
}

// Handle summary for custom reporting
export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    test_duration: data.state.testRunDurationMs / 1000,
    scenarios: Object.keys(options.scenarios),
    metrics: {
      http_reqs: data.metrics.http_reqs.values.count,
      http_req_duration_p95: data.metrics.http_req_duration.values['p(95)'],
      http_req_duration_p99: data.metrics.http_req_duration.values['p(99)'],
      http_req_failed: data.metrics.http_req_failed.values.rate,
      mcp_calls_total: data.metrics.mcp_calls_total?.values.count || 0,
      mcp_error_rate: data.metrics.mcp_error_rate?.values.rate || 0,
      mcp_response_time_p95: data.metrics.mcp_response_time?.values['p(95)'] || 0,
    },
    thresholds: data.thresholds,
  };

  // Performance score calculation
  const p95_score = summary.metrics.http_req_duration_p95 < 200 ? 100 :
    summary.metrics.http_req_duration_p95 < 400 ? 80 :
      summary.metrics.http_req_duration_p95 < 800 ? 60 : 40;

  const error_score = summary.metrics.http_req_failed < 0.01 ? 100 :
    summary.metrics.http_req_failed < 0.05 ? 80 :
      summary.metrics.http_req_failed < 0.1 ? 60 : 40;

  summary.performance_score = Math.round((p95_score + error_score) / 2);

  return {
    'performance-summary.json': JSON.stringify(summary, null, 2),
    stdout: `
🎯 ROMAI Ultimate MCP Server Performance Test Results
=====================================================

📊 Test Summary:
  Duration: ${summary.test_duration}s
  Total Requests: ${summary.metrics.http_reqs}
  
⚡ Performance Metrics:
  P95 Response Time: ${summary.metrics.http_req_duration_p95.toFixed(2)}ms
  P99 Response Time: ${summary.metrics.http_req_duration_p99.toFixed(2)}ms
  Error Rate: ${(summary.metrics.http_req_failed * 100).toFixed(3)}%
  
🔧 MCP-Specific Metrics:
  MCP Calls: ${summary.metrics.mcp_calls_total}
  MCP Error Rate: ${(summary.metrics.mcp_error_rate * 100).toFixed(3)}%
  MCP P95 Response: ${summary.metrics.mcp_response_time_p95.toFixed(2)}ms
  
🏆 Performance Score: ${summary.performance_score}/100
    `,
  };
}
