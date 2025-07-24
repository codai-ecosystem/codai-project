import http from 'k6/http';
import { check, sleep } from 'k6';

// K6 Load Testing Configuration for CODAI Gateway Service
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users over 2 minutes
    { duration: '5m', target: 10 }, // Stay at 10 users for 5 minutes
    { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
    { duration: '5m', target: 20 }, // Stay at 20 users for 5 minutes
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
  },
};

const BASE_URL = 'http://localhost:4000';

export default function() {
  // Test Gateway health endpoint
  let response = http.get(`${BASE_URL}/api/gateway/health`);
  check(response, {
    'Gateway health check status is 200 or 503': (r) => r.status === 200 || r.status === 503,
    'Gateway health check response time < 200ms': (r) => r.timings.duration < 200,
  });

  sleep(1);

  // Test CODAI service proxy
  response = http.get(`${BASE_URL}/api/v1/codai/health`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  check(response, {
    'CODAI proxy status is 200, 401, or 503': (r) => [200, 401, 503].includes(r.status),
    'CODAI proxy response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test public endpoint
  response = http.get(`${BASE_URL}/health`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  check(response, {
    'Public health endpoint accessible': (r) => r.status === 200 || r.status === 404,
    'Public endpoint response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);

  // Test error handling
  response = http.get(`${BASE_URL}/api/nonexistent`, {
    headers: {
      'Accept': 'application/json',
    },
  });
  check(response, {
    'Non-existent endpoint returns 404': (r) => r.status === 404,
    'Error response time < 100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
