# 🎨 Frontend Testing Framework Setup
## React Component Testing with Jest + React Testing Library

### Installation Dependencies
```json
{
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "jest": "^29.5.0",
    "jest-environment-jsdom": "^29.5.0",
    "@babel/preset-react": "^7.18.6",
    "@babel/preset-env": "^7.20.2"
  }
}
```

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.js',
    '!src/serviceWorker.js'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
```

### Setup Test Environment (src/setupTests.js)
```javascript
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
```

### Component Test Template
```javascript
// Example: Component.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Test 1: Component renders correctly
  test('renders without crashing', () => {
    render(<ComponentName />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  // Test 2: Props are handled correctly
  test('displays correct content with props', () => {
    const props = { title: 'Test Title', content: 'Test Content' };
    render(<ComponentName {...props} />);
    
    expect(screen.getByText(props.title)).toBeInTheDocument();
    expect(screen.getByText(props.content)).toBeInTheDocument();
  });

  // Test 3: User interactions work
  test('handles user interactions', async () => {
    const user = userEvent.setup();
    const mockHandler = jest.fn();
    
    render(<ComponentName onSubmit={mockHandler} />);
    
    const button = screen.getByRole('button', { name: /submit/i });
    await user.click(button);
    
    expect(mockHandler).toHaveBeenCalledTimes(1);
  });

  // Test 4: State changes work correctly
  test('updates state correctly', async () => {
    render(<ComponentName />);
    
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    
    expect(input).toHaveValue('Test input');
  });

  // Test 5: Error handling
  test('handles errors gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<ComponentName invalidProp={null} />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
```

---

## 🎯 Phase 2A: CODAI Service Frontend Testing

### Component Inventory for CODAI Service
```yaml
Core Components:
  - Dashboard.jsx: Main dashboard interface
  - ProjectManager.jsx: Project management panel
  - AIChat.jsx: AI interaction component
  - CodeEditor.jsx: Code generation interface
  - FileTree.jsx: File explorer component
  - Terminal.jsx: Integrated terminal
  - SettingsPanel.jsx: Configuration panel

Form Components:
  - LoginForm.jsx: User authentication
  - ProjectForm.jsx: New project creation
  - ConfigForm.jsx: Settings configuration
  - PromptForm.jsx: AI prompt input

UI Components:
  - Header.jsx: Navigation header
  - Sidebar.jsx: Side navigation
  - Modal.jsx: Popup dialogs
  - Toast.jsx: Notification system
  - LoadingSpinner.jsx: Loading indicators
  - Button.jsx: Reusable button component
  - Input.jsx: Form input component
```

### Test Implementation for Critical Components
```javascript
// tests/components/Dashboard.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../../src/components/Dashboard';

describe('Dashboard Component', () => {
  test('renders dashboard with all sections', async () => {
    render(<Dashboard />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByText(/welcome to codai/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/recent projects/i)).toBeInTheDocument();
    });
  });

  test('displays project statistics', async () => {
    const mockStats = {
      totalProjects: 5,
      activeProjects: 2,
      linesOfCode: 10000
    };
    
    render(<Dashboard stats={mockStats} />);
    
    expect(screen.getByText(mockStats.totalProjects.toString())).toBeInTheDocument();
    expect(screen.getByText(mockStats.activeProjects.toString())).toBeInTheDocument();
  });

  test('handles loading state', () => {
    render(<Dashboard loading={true} />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

---

## 🎯 Phase 2B: Admin Service Frontend Testing

### Admin Component Inventory
```yaml
User Management:
  - UserList.jsx: User directory
  - UserDetail.jsx: User profile editor
  - UserPermissions.jsx: Permission management
  - RoleManager.jsx: Role assignment

System Management:
  - SystemStats.jsx: System metrics
  - ServiceMonitor.jsx: Service health display
  - ConfigEditor.jsx: System configuration
  - LogViewer.jsx: System logs

Analytics:
  - AnalyticsDashboard.jsx: Main analytics
  - UsageCharts.jsx: Usage statistics
  - PerformanceMetrics.jsx: Performance data
  - ReportGenerator.jsx: Report creation
```

### Test Implementation Example
```javascript
// tests/components/admin/UserList.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserList } from '../../src/components/admin/UserList';

const mockUsers = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' }
];

describe('UserList Component', () => {
  test('renders user list correctly', () => {
    render(<UserList users={mockUsers} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  test('filters users by search term', async () => {
    const user = userEvent.setup();
    render(<UserList users={mockUsers} />);
    
    const searchInput = screen.getByPlaceholderText(/search users/i);
    await user.type(searchInput, 'John');
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });
  });

  test('handles user selection', async () => {
    const mockOnSelect = jest.fn();
    const user = userEvent.setup();
    
    render(<UserList users={mockUsers} onUserSelect={mockOnSelect} />);
    
    const userRow = screen.getByText('John Doe').closest('tr');
    await user.click(userRow);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockUsers[0]);
  });
});
```

---

## 🎯 Phase 2C: Hub Service Frontend Testing

### Hub Component Inventory
```yaml
Service Discovery:
  - ServiceGrid.jsx: Service overview
  - ServiceDetail.jsx: Individual service info
  - HealthStatus.jsx: Health indicators
  - ServiceMetrics.jsx: Performance metrics

Configuration:
  - ConfigPanel.jsx: Service configuration
  - RoutingRules.jsx: Traffic routing
  - LoadBalancer.jsx: Load balancing config
  - SecuritySettings.jsx: Security configuration

Monitoring:
  - MonitoringDashboard.jsx: Main monitoring
  - AlertPanel.jsx: Alert management
  - LogAggregator.jsx: Centralized logging
  - MetricsViewer.jsx: Metrics visualization
```

---

## 🎯 Phase 3: Integration Testing Implementation

Let me create comprehensive integration tests:

<function_calls>
<invoke name="create_file">
<parameter name="content">/**
 * 🔗 CODAI Integration Testing Suite
 * Complete service-to-service communication validation
 */

const http = require('http');
const { expect } = require('chai');

// Test Configuration
const INTEGRATION_CONFIG = {
    services: {
        gateway: { port: 4000, baseUrl: 'http://localhost:4000' },
        codai: { port: 4001, baseUrl: 'http://localhost:4001' },
        admin: { port: 4007, baseUrl: 'http://localhost:4007' },
        hub: { port: 4008, baseUrl: 'http://localhost:4008' },
        id: { port: 4004, baseUrl: 'http://localhost:4004' },
        bancai: { port: 4005, baseUrl: 'http://localhost:4005' },
        memorai: { port: 4006, baseUrl: 'http://localhost:4006' }
    },
    timeout: 10000,
    retries: 3
};

// HTTP Request Helper
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const request = http.request(url, {
            method: options.method || 'GET',
            headers: options.headers || {},
            timeout: INTEGRATION_CONFIG.timeout
        }, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const json = data ? JSON.parse(data) : {};
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        data: json,
                        raw: data
                    });
                } catch (e) {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        data: null,
                        raw: data
                    });
                }
            });
        });

        request.on('error', reject);
        request.on('timeout', () => reject(new Error('Request timeout')));
        
        if (options.body) {
            request.write(JSON.stringify(options.body));
        }
        
        request.end();
    });
}

// Integration Test Suite
class IntegrationTestSuite {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
    }

    async runTest(testName, testFunction) {
        this.results.total++;
        console.log(`🧪 Running: ${testName}`);
        
        try {
            await testFunction();
            this.results.passed++;
            console.log(`✅ PASS: ${testName}`);
            this.results.details.push({ name: testName, status: 'PASS' });
        } catch (error) {
            this.results.failed++;
            console.log(`❌ FAIL: ${testName} - ${error.message}`);
            this.results.details.push({ 
                name: testName, 
                status: 'FAIL', 
                error: error.message 
            });
        }
    }

    // Gateway Integration Tests
    async testGatewayToCODAIRouting() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/v1/codai/health`);
        
        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }
        
        if (!response.data || response.data.service !== 'codai') {
            throw new Error('Invalid CODAI service response through gateway');
        }
    }

    async testGatewayToAdminRouting() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/v1/admin/health`);
        
        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }
        
        if (!response.data || response.data.service !== 'admin') {
            throw new Error('Invalid Admin service response through gateway');
        }
    }

    async testGatewayToHubRouting() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/v1/hub/health`);
        
        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }
        
        if (!response.data || response.data.service !== 'hub') {
            throw new Error('Invalid Hub service response through gateway');
        }
    }

    async testGatewayToIDRouting() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/v1/id/health`);
        
        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }
        
        if (!response.data || response.data.service !== 'id') {
            throw new Error('Invalid ID service response through gateway');
        }
    }

    async testGatewayToBancAIRouting() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/v1/bancai/health`);
        
        if (response.statusCode !== 200) {
            throw new Error(`Expected 200, got ${response.statusCode}`);
        }
        
        if (!response.data || response.data.service !== 'bancai') {
            throw new Error('Invalid BancAI service response through gateway');
        }
    }

    // Authentication Flow Integration
    async testAuthenticationFlow() {
        // Test login request through gateway to ID service
        const loginResponse = await makeRequest(
            `${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/v1/auth/login`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    username: 'test@example.com',
                    password: 'testpassword'
                }
            }
        );

        if (loginResponse.statusCode !== 200 && loginResponse.statusCode !== 401) {
            throw new Error(`Authentication endpoint not responding correctly: ${loginResponse.statusCode}`);
        }
    }

    // Service Discovery Integration
    async testServiceDiscovery() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.hub.baseUrl}/api/services`);
        
        if (response.statusCode !== 200) {
            throw new Error(`Service discovery failed: ${response.statusCode}`);
        }
        
        if (!response.data || !Array.isArray(response.data)) {
            throw new Error('Invalid service discovery response format');
        }
    }

    // Cross-Service Communication
    async testCrossServiceCommunication() {
        // Test CODAI → MemorAI communication
        const response = await makeRequest(
            `${INTEGRATION_CONFIG.services.codai.baseUrl}/api/memory/store`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: {
                    key: 'test-integration',
                    value: 'integration test data'
                }
            }
        );

        // Should handle the request even if MemorAI is not available
        if (response.statusCode >= 500) {
            throw new Error(`Cross-service communication failed: ${response.statusCode}`);
        }
    }

    // Load Balancing and Health Check Integration
    async testLoadBalancingIntegration() {
        const responses = [];
        
        // Make multiple requests to test load balancing
        for (let i = 0; i < 5; i++) {
            const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/gateway/health`);
            responses.push(response);
        }
        
        // All requests should succeed
        const failedRequests = responses.filter(r => r.statusCode !== 200);
        if (failedRequests.length > 0) {
            throw new Error(`Load balancing failed: ${failedRequests.length} failed requests`);
        }
    }

    // Security Integration
    async testSecurityHeaders() {
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/gateway/health`);
        
        const requiredHeaders = ['x-content-type-options', 'x-frame-options', 'x-xss-protection'];
        const missingHeaders = requiredHeaders.filter(header => !response.headers[header]);
        
        if (missingHeaders.length > 0) {
            throw new Error(`Missing security headers: ${missingHeaders.join(', ')}`);
        }
    }

    // Performance Integration
    async testPerformanceIntegration() {
        const startTime = Date.now();
        
        const response = await makeRequest(`${INTEGRATION_CONFIG.services.gateway.baseUrl}/api/gateway/health`);
        
        const responseTime = Date.now() - startTime;
        
        if (responseTime > 5000) {
            throw new Error(`Response time too slow: ${responseTime}ms`);
        }
        
        if (response.statusCode !== 200) {
            throw new Error(`Performance test failed: ${response.statusCode}`);
        }
    }

    // Run All Integration Tests
    async runAllTests() {
        console.log('🚀 Starting CODAI Integration Test Suite');
        console.log('==========================================');
        
        // Gateway Routing Tests
        await this.runTest('Gateway → CODAI Routing', () => this.testGatewayToCODAIRouting());
        await this.runTest('Gateway → Admin Routing', () => this.testGatewayToAdminRouting());
        await this.runTest('Gateway → Hub Routing', () => this.testGatewayToHubRouting());
        await this.runTest('Gateway → ID Routing', () => this.testGatewayToIDRouting());
        await this.runTest('Gateway → BancAI Routing', () => this.testGatewayToBancAIRouting());
        
        // Authentication Integration
        await this.runTest('Authentication Flow', () => this.testAuthenticationFlow());
        
        // Service Discovery
        await this.runTest('Service Discovery', () => this.testServiceDiscovery());
        
        // Cross-Service Communication
        await this.runTest('Cross-Service Communication', () => this.testCrossServiceCommunication());
        
        // Load Balancing
        await this.runTest('Load Balancing Integration', () => this.testLoadBalancingIntegration());
        
        // Security
        await this.runTest('Security Headers', () => this.testSecurityHeaders());
        
        // Performance
        await this.runTest('Performance Integration', () => this.testPerformanceIntegration());
        
        // Results Summary
        console.log('\n📊 Integration Test Results');
        console.log('===========================');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${Math.round((this.results.passed / this.results.total) * 100)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n💥 Failed Tests:');
            this.results.details
                .filter(test => test.status === 'FAIL')
                .forEach(test => {
                    console.log(`   ❌ ${test.name}: ${test.error}`);
                });
        }
        
        return this.results;
    }
}

// Export for use in other modules
module.exports = IntegrationTestSuite;

// Run tests if called directly
if (require.main === module) {
    const testSuite = new IntegrationTestSuite();
    testSuite.runAllTests()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('Integration test suite failed:', error);
            process.exit(1);
        });
}
