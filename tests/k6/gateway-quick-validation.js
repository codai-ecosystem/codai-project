import http from 'k6/http';
import { check, sleep } from 'k6';

// Quick K6 Validation Test for Gateway Service
export const options = {
  duration: '30s',
  vus: 5,  // 5 virtual users
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

  // Test CODAI service proxy - THIS WAS THE MAIN ISSUE
  response = http.get(`${BASE_URL}/api/v1/codai/health`);
  check(response, {
    'CODAI proxy status is 200': (r) => r.status === 200,
    'CODAI proxy response has JSON': (r) => r.headers['Content-Type'].includes('application/json'),
    'CODAI proxy response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
