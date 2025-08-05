
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom Metrics
export let errorRate = new Rate('errors');
export let responseTimeTrend = new Trend('response_time');
export let requestCounter = new Counter('requests_total');

// Test Configuration
export let options = {
  scenarios: {
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 100 },
        { duration: '1m', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.01'],
    http_reqs: ['rate>100'],
  },
};

// Test Data
const testData = {
  users: [
    { email: 'test1@memorai.com', password: 'TestPassword123!' },
    { email: 'test2@memorai.com', password: 'TestPassword123!' },
    { email: 'test3@memorai.com', password: 'TestPassword123!' },
  ],
  memories: [
    { title: 'Test Memory 1', content: 'This is a test memory for load testing', tags: ['test', 'performance'] },
    { title: 'Performance Test', content: 'Memory creation performance testing content', tags: ['load', 'test'] },
    { title: 'Load Testing Memory', content: 'Testing memory creation under load conditions', tags: ['stress'] },
  ]
};

// Authentication Helper
function authenticate() {
  const loginPayload = {
    email: testData.users[Math.floor(Math.random() * testData.users.length)].email,
    password: 'TestPassword123!',
  };

  const loginResponse = http.post('https://api.memorai.com/auth/login', JSON.stringify(loginPayload), {
    headers: { 'Content-Type': 'application/json' },
  });

  const authSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response time < 2s': (r) => r.timings.duration < 2000,
  });

  if (authSuccess && loginResponse.json('token')) {
    return loginResponse.json('token');
  }
  return null;
}

// Main Test Function
export default function () {
  requestCounter.add(1);
  
  // Homepage Load Test
  const homepageResponse = http.get('https://memorai.com');
  responseTimeTrend.add(homepageResponse.timings.duration);
  
  const homepageSuccess = check(homepageResponse, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage response time < 2s': (r) => r.timings.duration < 2000,
    'homepage contains title': (r) => r.body.includes('MemorAI'),
  });
  
  if (!homepageSuccess) {
    errorRate.add(1);
  }

  // API Health Check
  const healthResponse = http.get('https://api.memorai.com/health');
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Authentication Flow (30% of users)
  if (Math.random() < 0.3) {
    const token = authenticate();
    
    if (token) {
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Dashboard Load
      const dashboardResponse = http.get('https://memorai.com/dashboard', { headers });
      check(dashboardResponse, {
        'dashboard status is 200': (r) => r.status === 200,
        'dashboard response time < 3s': (r) => r.timings.duration < 3000,
      });

      // Memory Creation (20% of authenticated users)
      if (Math.random() < 0.2) {
        const memoryData = testData.memories[Math.floor(Math.random() * testData.memories.length)];
        const createMemoryResponse = http.post('https://api.memorai.com/memories', JSON.stringify(memoryData), { headers });
        
        check(createMemoryResponse, {
          'memory creation status is 201': (r) => r.status === 201,
          'memory creation response time < 3s': (r) => r.timings.duration < 3000,
        });
      }

      // Memory Search (40% of authenticated users)
      if (Math.random() < 0.4) {
        const searchQuery = 'test';
        const searchResponse = http.get(`https://api.memorai.com/memories/search?q=${searchQuery}`, { headers });
        
        check(searchResponse, {
          'search status is 200': (r) => r.status === 200,
          'search response time < 1s': (r) => r.timings.duration < 1000,
        });
      }
    }
  }

  // Static Asset Load Test
  const staticAssets = [
    '/_next/static/css/app.css',
    '/_next/static/js/app.js',
    '/favicon.ico',
  ];

  staticAssets.forEach(asset => {
    const assetResponse = http.get(`https://memorai.com${asset}`);
    check(assetResponse, {
      [`${asset} loads successfully`]: (r) => r.status === 200,
      [`${asset} response time < 1s`]: (r) => r.timings.duration < 1000,
    });
  });

  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds
}

// Setup Function
export function setup() {
  // Pre-test validation
  console.log('Setting up performance tests...');
  
  const healthCheck = http.get('https://api.memorai.com/health');
  if (healthCheck.status !== 200) {
    throw new Error('Service health check failed - aborting tests');
  }
  
  console.log('Service health check passed - proceeding with tests');
  return { timestamp: new Date().toISOString() };
}

// Teardown Function
export function teardown(data) {
  console.log(`Performance test completed at: ${new Date().toISOString()}`);
  console.log(`Test started at: ${data.timestamp}`);
}
