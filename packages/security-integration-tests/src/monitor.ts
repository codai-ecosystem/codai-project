/**
 * Security Monitor
 * Real-time monitoring and dashboard for security test results
 */

import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { TestExecution } from './types';

export class SecurityMonitor {
  private server: FastifyInstance = Fastify();
  private testResults: TestExecution[] = [];

  constructor() {
    this.setupRoutes();
  }

  /**
   * Start monitoring dashboard
   */
  async startDashboard(port: number = 4444): Promise<void> {
    try {
      await this.server.listen({ port, host: '0.0.0.0' });
      console.log(`Security monitoring dashboard running on http://localhost:${port}`);
    } catch (error) {
      console.error('Failed to start monitoring dashboard:', error);
      throw error;
    }
  }

  /**
   * Setup dashboard routes
   */
  private setupRoutes(): void {
    // Dashboard home
    this.server.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.type('text/html').send(this.getDashboardHTML());
    });

    // API endpoints
    this.server.get('/api/status', async (request: FastifyRequest, reply: FastifyReply) => {
      return {
        status: 'healthy',
        uptime: process.uptime(),
        testResults: this.testResults.length
      };
    });

    this.server.get('/api/results', async (request: FastifyRequest, reply: FastifyReply) => {
      return this.testResults;
    });

    this.server.post('/webhook/security', async (request: FastifyRequest, reply: FastifyReply) => {
      // Handle security test webhooks
      const data = request.body as any;

      if (data.type === 'test-completed' && data.execution) {
        this.testResults.push(data.execution);
      }

      return { received: true };
    });
  }

  /**
   * Generate dashboard HTML
   */
  private getDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Security Monitoring Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .dashboard { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #333; }
        .metric .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .status { margin: 20px 0; }
        .status-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .success { border-left: 5px solid #28a745; }
        .warning { border-left: 5px solid #ffc107; }
        .danger { border-left: 5px solid #dc3545; }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>🔐 Security Monitoring Dashboard</h1>
            <p>Real-time monitoring for Essential CodAI Services security testing</p>
        </div>

        <div class="metrics">
            <div class="metric">
                <h3>Active Tests</h3>
                <div class="value" id="activeTests">0</div>
            </div>
            <div class="metric">
                <h3>Total Results</h3>
                <div class="value" id="totalResults">${this.testResults.length}</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value" id="successRate">0%</div>
            </div>
            <div class="metric">
                <h3>Security Score</h3>
                <div class="value" id="securityScore">N/A</div>
            </div>
        </div>

        <div class="status">
            <h3>📊 Recent Test Results</h3>
            <div id="testResults">
                <div class="status-item">No test results available yet.</div>
            </div>
        </div>
    </div>

    <script>
        // Auto-refresh data every 5 seconds
        setInterval(refreshData, 5000);
        
        async function refreshData() {
            try {
                const response = await fetch('/api/results');
                const results = await response.json();
                
                updateMetrics(results);
                updateResults(results);
            } catch (error) {
                console.error('Failed to refresh data:', error);
            }
        }
        
        function updateMetrics(results) {
            const totalResults = results.length;
            const passedResults = results.filter(r => r.status === 'passed').length;
            const successRate = totalResults > 0 ? Math.round((passedResults / totalResults) * 100) : 0;
            
            document.getElementById('totalResults').textContent = totalResults;
            document.getElementById('successRate').textContent = successRate + '%';
        }
        
        function updateResults(results) {
            const container = document.getElementById('testResults');
            
            if (results.length === 0) {
                container.innerHTML = '<div class="status-item">No test results available yet.</div>';
                return;
            }
            
            const recentResults = results.slice(-10).reverse();
            
            container.innerHTML = recentResults.map(result => {
                const statusClass = result.status === 'passed' ? 'success' : 
                                  result.status === 'failed' ? 'danger' : 'warning';
                
                return \`<div class="status-item \${statusClass}">
                    <strong>\${result.serviceId}</strong> - \${result.scenarioId}
                    <span style="float: right;">\${result.status.toUpperCase()}</span>
                    <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
                        Duration: \${result.endTime ? new Date(result.endTime).getTime() - new Date(result.startTime).getTime() : 0}ms
                    </div>
                </div>\`;
            }).join('');
        }
        
        // Initial load
        refreshData();
    </script>
</body>
</html>`;
  }
}