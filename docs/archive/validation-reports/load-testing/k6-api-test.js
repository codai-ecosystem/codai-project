import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 1000 }, // Normal load
    { duration: '2m', target: 5000 }, // Peak load
    { duration: '5m', target: 5000 }, // Sustain peak
    { duration: '2m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'], // 95% of requests under 100ms
    http_req_failed: ['rate<0.05'], // Error rate under 5%
  },
};

export default function() {
  // Test CBD Engine health
  let cbdResponse = http.get('http://localhost:8080/health');
  check(cbdResponse, {
    'CBD Engine is healthy': (r) => r.status === 200,
  });
  
  // Test MemoraiMCP API
  let memoraiResponse = http.get('http://localhost:3000/health');
  check(memoraiResponse, {
    'MemoraiMCP is healthy': (r) => r.status === 200,
  });
  
  // Test memory operations
  let memoryPayload = {
    agentId: `test-agent-${Math.random()}`,
    content: `Load test memory ${Date.now()}`,
    metadata: { testRun: true }
  };
  
  let storeResponse = http.post('http://localhost:3000/api/v1/memories', 
    JSON.stringify(memoryPayload), 
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(storeResponse, {
    'Memory store successful': (r) => r.status === 200,
    'Response time acceptable': (r) => r.timings.duration < 100,
  });
  
  sleep(1);
}
