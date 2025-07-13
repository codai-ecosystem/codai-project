import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4018"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

const port = 4018;
const serviceName = 'Hub';

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:", "https:"],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

app.use(compression());

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:4018', 'https://hub.codai.ro'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${serviceName}`);
  next();
});

// ============================================================================
// HUB CENTRAL DASHBOARD & COORDINATION SERVICE
// ============================================================================

class HubCoordinationService {
  constructor() {
    this.ecosystemServices = new Map();
    this.dashboards = new Map();
    this.widgets = new Map();
    this.notifications = new Map();
    this.workspace = new Map();
    this.analytics = new Map();
    this.integrations = new Map();
    this.workflows = new Map();
    this.collaboration = new Map();
    this.automation = new Map();

    this.initializeEcosystemDashboard();
    this.startRealTimeMonitoring();
  }

  initializeEcosystemDashboard() {
    // Codai Ecosystem Services Registry
    const coreServices = [
      { id: 'codai', name: 'Codai Platform', port: 4000, category: 'core', priority: 1 },
      { id: 'memorai', name: 'MemorAI', port: 4001, category: 'core', priority: 1 },
      { id: 'logai', name: 'LogAI', port: 4002, category: 'core', priority: 1 },
      { id: 'bancai', name: 'BancAI', port: 4003, category: 'business', priority: 2 },
      { id: 'wallet', name: 'Wallet', port: 4004, category: 'business', priority: 2 },
      { id: 'fabricai', name: 'FabricAI', port: 4005, category: 'business', priority: 2 },
      { id: 'x', name: 'X Trading', port: 4006, category: 'business', priority: 2 },
      { id: 'studiai', name: 'StudiAI', port: 4007, category: 'social', priority: 3 },
      { id: 'sociai', name: 'SociAI', port: 4008, category: 'social', priority: 3 },
      { id: 'cumparai', name: 'CumparAI', port: 4009, category: 'social', priority: 3 },
      { id: 'publicai', name: 'PublicAI', port: 4010, category: 'social', priority: 3 }
    ];

    const extendedServices = [
      { id: 'admin', name: 'Admin Dashboard', port: 4011, category: 'management', priority: 4 },
      { id: 'dash', name: 'Analytics Dashboard', port: 4012, category: 'analytics', priority: 4 },
      { id: 'explorer', name: 'Blockchain Explorer', port: 4013, category: 'blockchain', priority: 4 },
      { id: 'aide', name: 'AIDE Development', port: 4014, category: 'development', priority: 4 },
      { id: 'ajutai', name: 'AjutAI Support', port: 4015, category: 'support', priority: 4 },
      { id: 'analizai', name: 'AnalizAI Analytics', port: 4016, category: 'analytics', priority: 4 },
      { id: 'docs', name: 'Documentation', port: 4017, category: 'documentation', priority: 4 },
      { id: 'hub', name: 'Central Hub', port: 4018, category: 'coordination', priority: 4 },
      { id: 'id', name: 'Identity Management', port: 4019, category: 'identity', priority: 4 },
      { id: 'jucai', name: 'JucAI Gaming', port: 4020, category: 'gaming', priority: 4 },
      { id: 'kodex', name: 'Kodex Repository', port: 4021, category: 'development', priority: 4 },
      { id: 'legalizai', name: 'LegalizAI Legal', port: 4022, category: 'legal', priority: 4 },
      { id: 'marketai', name: 'MarketAI', port: 4023, category: 'marketing', priority: 4 },
      { id: 'metu', name: 'Metu Metrics', port: 4024, category: 'metrics', priority: 4 },
      { id: 'mod', name: 'Mod Platform', port: 4025, category: 'modding', priority: 4 },
      { id: 'stocai', name: 'StocAI Trading', port: 4026, category: 'trading', priority: 4 },
      { id: 'templates', name: 'Templates', port: 4027, category: 'templates', priority: 4 },
      { id: 'tools', name: 'Development Tools', port: 4028, category: 'development', priority: 4 }
    ];

    // Initialize service registry
    [...coreServices, ...extendedServices].forEach(service => {
      this.ecosystemServices.set(service.id, {
        ...service,
        status: 'unknown',
        lastCheck: null,
        healthScore: 0,
        responseTime: 0,
        uptime: 0,
        metrics: {
          requests: 0,
          errors: 0,
          avgResponseTime: 0,
          memoryUsage: 0,
          cpuUsage: 0
        }
      });
    });

    // Initialize dashboard widgets
    this.initializeDashboardWidgets();
  }

  initializeDashboardWidgets() {
    // System Overview Widget
    this.widgets.set('system_overview', {
      id: 'system_overview',
      title: 'Codai Ecosystem Overview',
      type: 'overview',
      position: { x: 0, y: 0, width: 12, height: 4 },
      data: {
        totalServices: this.ecosystemServices.size,
        activeServices: 0,
        healthyServices: 0,
        alertsCount: 0,
        systemUptime: '99.9%'
      },
      refreshInterval: 30000
    });

    // Service Status Grid Widget
    this.widgets.set('service_grid', {
      id: 'service_grid',
      title: 'Service Status Grid',
      type: 'grid',
      position: { x: 0, y: 4, width: 12, height: 8 },
      data: Array.from(this.ecosystemServices.values()),
      refreshInterval: 15000
    });

    // Performance Metrics Widget
    this.widgets.set('performance_metrics', {
      id: 'performance_metrics',
      title: 'Performance Metrics',
      type: 'metrics',
      position: { x: 0, y: 12, width: 6, height: 4 },
      data: {
        avgResponseTime: 0,
        totalRequests: 0,
        errorRate: 0,
        throughput: 0
      },
      refreshInterval: 10000
    });

    // Alert Dashboard Widget
    this.widgets.set('alerts_dashboard', {
      id: 'alerts_dashboard',
      title: 'Active Alerts',
      type: 'alerts',
      position: { x: 6, y: 12, width: 6, height: 4 },
      data: [],
      refreshInterval: 5000
    });

    // Real-time Activity Feed Widget
    this.widgets.set('activity_feed', {
      id: 'activity_feed',
      title: 'Real-time Activity Feed',
      type: 'feed',
      position: { x: 0, y: 16, width: 12, height: 6 },
      data: [],
      refreshInterval: 2000
    });
  }

  startRealTimeMonitoring() {
    // Start periodic health checks
    setInterval(() => {
      this.performHealthChecks();
    }, 30000); // Every 30 seconds

    // Start metrics collection
    setInterval(() => {
      this.collectSystemMetrics();
    }, 10000); // Every 10 seconds

    // Start notification processing
    setInterval(() => {
      this.processNotifications();
    }, 5000); // Every 5 seconds
  }

  async performHealthChecks() {
    for (const [serviceId, service] of this.ecosystemServices) {
      try {
        const startTime = Date.now();
        const response = await fetch(`http://localhost:${service.port}/health`, {
          timeout: 5000
        });

        const responseTime = Date.now() - startTime;
        const isHealthy = response.ok;

        // Update service status
        this.ecosystemServices.set(serviceId, {
          ...service,
          status: isHealthy ? 'healthy' : 'unhealthy',
          lastCheck: new Date().toISOString(),
          healthScore: isHealthy ? 100 : 0,
          responseTime: responseTime,
          metrics: {
            ...service.metrics,
            avgResponseTime: (service.metrics.avgResponseTime + responseTime) / 2
          }
        });
      } catch (error) {
        // Update service as unreachable
        this.ecosystemServices.set(serviceId, {
          ...service,
          status: 'unreachable',
          lastCheck: new Date().toISOString(),
          healthScore: 0,
          responseTime: 0
        });
      }
    }
  }

  collectSystemMetrics() {
    // Collect and aggregate system-wide metrics
    const services = Array.from(this.ecosystemServices.values());
    const healthyServices = services.filter(s => s.status === 'healthy');

    const systemMetrics = {
      totalServices: services.length,
      healthyServices: healthyServices.length,
      unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
      unreachableServices: services.filter(s => s.status === 'unreachable').length,
      avgResponseTime: healthyServices.reduce((acc, s) => acc + s.responseTime, 0) / healthyServices.length || 0,
      systemHealth: (healthyServices.length / services.length) * 100,
      timestamp: new Date().toISOString()
    };

    this.analytics.set('system_metrics', systemMetrics);
  }

  processNotifications() {
    // Process and update notification queue
    const alerts = [];

    for (const [serviceId, service] of this.ecosystemServices) {
      if (service.status === 'unhealthy' || service.status === 'unreachable') {
        alerts.push({
          id: `alert_${serviceId}_${Date.now()}`,
          service: serviceId,
          type: service.status === 'unreachable' ? 'critical' : 'warning',
          message: `Service ${service.name} is ${service.status}`,
          timestamp: new Date().toISOString(),
          acknowledged: false
        });
      }
    }

    this.notifications.set('active_alerts', alerts);
  }

  getEcosystemStatus() {
    return {
      services: Array.from(this.ecosystemServices.values()),
      widgets: Array.from(this.widgets.values()),
      analytics: Object.fromEntries(this.analytics),
      notifications: Array.from(this.notifications.values()).flat(),
      timestamp: new Date().toISOString()
    };
  }
}

// Initialize Hub Coordination Service
const hubService = new HubCoordinationService();

// ============================================================================
// WORKSPACE MANAGEMENT & COLLABORATION
// ============================================================================

// Create workspace
app.post('/api/workspace/create', (req, res) => {
  try {
    const { name, description, type = 'project', members = [], settings = {} } = req.body;

    const workspace = {
      id: `workspace_${Date.now()}`,
      name,
      description,
      type,
      members: members.map(member => ({
        ...member,
        joinedAt: new Date().toISOString(),
        role: member.role || 'member'
      })),
      settings: {
        visibility: 'private',
        allowGuests: false,
        autoSave: true,
        realTimeSync: true,
        ...settings
      },
      resources: {
        documents: [],
        files: [],
        integrations: [],
        workflows: []
      },
      activity: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString(),
      status: 'active'
    };

    hubService.workspace.set(workspace.id, workspace);

    res.json({
      success: true,
      data: workspace,
      message: 'Workspace created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workspaces
app.get('/api/workspace/list', (req, res) => {
  try {
    const workspaces = Array.from(hubService.workspace.values());
    res.json({
      success: true,
      data: workspaces,
      count: workspaces.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get workspace by ID
app.get('/api/workspace/:workspaceId', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const workspace = hubService.workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    // Update last accessed
    workspace.lastAccessed = new Date().toISOString();
    hubService.workspace.set(workspaceId, workspace);

    res.json({
      success: true,
      data: workspace
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update workspace
app.put('/api/workspace/:workspaceId', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const workspace = hubService.workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    const updatedWorkspace = {
      ...workspace,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    hubService.workspace.set(workspaceId, updatedWorkspace);

    // Broadcast workspace update
    io.to(`workspace_${workspaceId}`).emit('workspace_updated', updatedWorkspace);

    res.json({
      success: true,
      data: updatedWorkspace,
      message: 'Workspace updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add member to workspace
app.post('/api/workspace/:workspaceId/members', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const workspace = hubService.workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    const { userId, email, role = 'member', permissions = [] } = req.body;

    const newMember = {
      userId,
      email,
      role,
      permissions,
      joinedAt: new Date().toISOString(),
      status: 'active'
    };

    workspace.members.push(newMember);
    workspace.updatedAt = new Date().toISOString();

    hubService.workspace.set(workspaceId, workspace);

    // Broadcast member added
    io.to(`workspace_${workspaceId}`).emit('member_added', {
      workspaceId,
      member: newMember,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: newMember,
      message: 'Member added to workspace successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

// Create workflow
app.post('/api/workflows/create', (req, res) => {
  try {
    const { name, description, steps = [], triggers = [], schedule = null } = req.body;

    const workflow = {
      id: `workflow_${Date.now()}`,
      name,
      description,
      steps: steps.map((step, index) => ({
        id: `step_${index}`,
        ...step,
        order: index,
        status: 'pending'
      })),
      triggers,
      schedule,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
      lastExecution: null,
      successRate: 0,
      averageExecutionTime: 0
    };

    hubService.workflows.set(workflow.id, workflow);

    res.json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workflows
app.get('/api/workflows/list', (req, res) => {
  try {
    const workflows = Array.from(hubService.workflows.values());
    res.json({
      success: true,
      data: workflows,
      count: workflows.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute workflow
app.post('/api/workflows/:workflowId/execute', async (req, res) => {
  try {
    const workflowId = req.params.workflowId;
    const workflow = hubService.workflows.get(workflowId);

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    const executionId = `exec_${Date.now()}`;
    const startTime = Date.now();

    // Execute workflow steps
    workflow.status = 'running';
    workflow.executionCount++;
    workflow.lastExecution = new Date().toISOString();

    // Simulate workflow execution
    for (let step of workflow.steps) {
      step.status = 'running';
      // Simulate step execution time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
      step.status = 'completed';
    }

    const executionTime = Date.now() - startTime;
    workflow.status = 'completed';
    workflow.averageExecutionTime = (workflow.averageExecutionTime + executionTime) / workflow.executionCount;
    workflow.successRate = 100; // Assuming success for demo

    hubService.workflows.set(workflowId, workflow);

    // Broadcast workflow execution
    io.to('ecosystem_monitoring').emit('workflow_executed', {
      workflowId,
      executionId,
      status: 'completed',
      executionTime,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        workflowId,
        executionId,
        status: 'completed',
        executionTime,
        steps: workflow.steps
      },
      message: 'Workflow executed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// INTEGRATION MANAGEMENT
// ============================================================================

// Create integration
app.post('/api/integrations/create', (req, res) => {
  try {
    const { name, type, service, configuration = {}, enabled = true } = req.body;

    const integration = {
      id: `integration_${Date.now()}`,
      name,
      type,
      service,
      configuration,
      enabled,
      status: enabled ? 'active' : 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSync: null,
      syncCount: 0,
      errorCount: 0,
      successRate: 0
    };

    hubService.integrations.set(integration.id, integration);

    res.json({
      success: true,
      data: integration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all integrations
app.get('/api/integrations/list', (req, res) => {
  try {
    const integrations = Array.from(hubService.integrations.values());
    res.json({
      success: true,
      data: integrations,
      count: integrations.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync integration
app.post('/api/integrations/:integrationId/sync', async (req, res) => {
  try {
    const integrationId = req.params.integrationId;
    const integration = hubService.integrations.get(integrationId);

    if (!integration) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }

    if (!integration.enabled) {
      return res.status(400).json({ success: false, error: 'Integration is disabled' });
    }

    // Simulate sync process
    integration.syncCount++;
    integration.lastSync = new Date().toISOString();
    integration.status = 'syncing';

    // Simulate sync time
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000));

    integration.status = 'active';
    integration.successRate = Math.min(100, (integration.syncCount / (integration.syncCount + integration.errorCount)) * 100);

    hubService.integrations.set(integrationId, integration);

    // Broadcast integration sync
    io.to('ecosystem_monitoring').emit('integration_synced', {
      integrationId,
      status: 'synced',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: integration,
      message: 'Integration synced successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// FRONTEND UI & STATIC CONTENT SERVING
// ============================================================================

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve Hub dashboard UI
app.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Codai Hub - Central Dashboard & Coordination</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: #333;
            }
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: rgba(255, 255, 255, 0.95);
                padding: 20px;
                border-radius: 15px;
                margin-bottom: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
            }
            .header h1 {
                color: #4c63d2;
                margin-bottom: 10px;
                font-size: 2.5em;
                font-weight: 700;
            }
            .header p {
                color: #666;
                font-size: 1.1em;
            }
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }
            .widget {
                background: rgba(255, 255, 255, 0.95);
                padding: 25px;
                border-radius: 15px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(10px);
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }
            .widget:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
            .widget h3 {
                color: #4c63d2;
                margin-bottom: 15px;
                font-size: 1.3em;
                font-weight: 600;
            }
            .service-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 15px;
            }
            .service-card {
                background: linear-gradient(45deg, #f0f2f5, #e8ecf1);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border: 2px solid transparent;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .service-card:hover {
                border-color: #4c63d2;
                background: linear-gradient(45deg, #e8ecf1, #f0f2f5);
            }
            .service-card.healthy {
                border-left: 4px solid #10b981;
            }
            .service-card.unhealthy {
                border-left: 4px solid #f59e0b;
            }
            .service-card.unreachable {
                border-left: 4px solid #ef4444;
            }
            .service-name {
                font-weight: 600;
                color: #374151;
                margin-bottom: 5px;
                font-size: 0.9em;
            }
            .service-port {
                color: #6b7280;
                font-size: 0.8em;
            }
            .service-status {
                margin-top: 8px;
                padding: 4px 8px;
                border-radius: 15px;
                font-size: 0.7em;
                font-weight: 600;
                text-transform: uppercase;
            }
            .status-healthy {
                background: #d1fae5;
                color: #065f46;
            }
            .status-unhealthy {
                background: #fef3c7;
                color: #92400e;
            }
            .status-unreachable {
                background: #fee2e2;
                color: #991b1b;
            }
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            .metric-card {
                background: linear-gradient(45deg, #f8fafc, #f1f5f9);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                border-left: 4px solid #4c63d2;
            }
            .metric-value {
                font-size: 2em;
                font-weight: 700;
                color: #4c63d2;
                margin-bottom: 5px;
            }
            .metric-label {
                color: #6b7280;
                font-size: 0.9em;
                font-weight: 500;
            }
            .alerts-container {
                max-height: 300px;
                overflow-y: auto;
            }
            .alert-item {
                background: linear-gradient(45deg, #fef2f2, #fee2e2);
                padding: 12px;
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 4px solid #ef4444;
            }
            .alert-title {
                font-weight: 600;
                color: #991b1b;
                margin-bottom: 5px;
            }
            .alert-message {
                color: #7f1d1d;
                font-size: 0.9em;
            }
            .alert-time {
                color: #991b1b;
                font-size: 0.8em;
                margin-top: 5px;
            }
            .activity-feed {
                max-height: 300px;
                overflow-y: auto;
            }
            .activity-item {
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .activity-icon {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #4c63d2;
            }
            .activity-text {
                flex: 1;
                color: #374151;
                font-size: 0.9em;
            }
            .activity-time {
                color: #6b7280;
                font-size: 0.8em;
            }
            .refresh-btn {
                background: linear-gradient(45deg, #4c63d2, #667eea);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
                margin-top: 15px;
            }
            .refresh-btn:hover {
                background: linear-gradient(45deg, #3b4fc7, #5a67d8);
                transform: translateY(-2px);
            }
            .loading {
                text-align: center;
                color: #6b7280;
                font-style: italic;
                padding: 20px;
            }
            .connection-status {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 15px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.9em;
                z-index: 1000;
            }
            .connected {
                background: #d1fae5;
                color: #065f46;
            }
            .disconnected {
                background: #fee2e2;
                color: #991b1b;
            }
        </style>
    </head>
    <body>
        <div class="connection-status" id="connectionStatus">Connecting...</div>
        
        <div class="container">
            <div class="header">
                <h1>🏢 Codai Hub</h1>
                <p>Central Dashboard & Coordination Service - Real-time ecosystem monitoring and management</p>
                <button class="refresh-btn" onclick="refreshDashboard()">🔄 Refresh Dashboard</button>
            </div>
            
            <div class="dashboard-grid">
                <div class="widget">
                    <h3>🌐 Ecosystem Overview</h3>
                    <div class="metrics-grid" id="overviewMetrics">
                        <div class="loading">Loading metrics...</div>
                    </div>
                </div>
                
                <div class="widget">
                    <h3>📊 Performance Metrics</h3>
                    <div class="metrics-grid" id="performanceMetrics">
                        <div class="loading">Loading performance data...</div>
                    </div>
                </div>
                
                <div class="widget">
                    <h3>🚨 Active Alerts</h3>
                    <div class="alerts-container" id="alertsContainer">
                        <div class="loading">Loading alerts...</div>
                    </div>
                </div>
                
                <div class="widget">
                    <h3>⚡ Real-time Activity</h3>
                    <div class="activity-feed" id="activityFeed">
                        <div class="loading">Loading activity feed...</div>
                    </div>
                </div>
            </div>
            
            <div class="widget">
                <h3>🔧 Service Status Grid</h3>
                <div class="service-grid" id="serviceGrid">
                    <div class="loading">Loading services...</div>
                </div>
            </div>
        </div>
        
        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            let ecosystemData = {};
            
            // Connection status
            const connectionStatus = document.getElementById('connectionStatus');
            
            socket.on('connect', () => {
                connectionStatus.textContent = '🟢 Connected';
                connectionStatus.className = 'connection-status connected';
                socket.emit('subscribe_dashboard', 'main');
            });
            
            socket.on('disconnect', () => {
                connectionStatus.textContent = '🔴 Disconnected';
                connectionStatus.className = 'connection-status disconnected';
            });
            
            // Listen for ecosystem updates
            socket.on('ecosystem_status', (data) => {
                ecosystemData = data;
                updateDashboard();
            });
            
            socket.on('ecosystem_update', (data) => {
                ecosystemData = data;
                updateDashboard();
            });
            
            socket.on('alerts_update', (alerts) => {
                updateAlerts(alerts);
            });
            
            function updateDashboard() {
                updateOverviewMetrics();
                updatePerformanceMetrics();
                updateServiceGrid();
                updateAlerts(ecosystemData.notifications || []);
                updateActivityFeed();
            }
            
            function updateOverviewMetrics() {
                const services = ecosystemData.services || [];
                const healthy = services.filter(s => s.status === 'healthy').length;
                const unhealthy = services.filter(s => s.status === 'unhealthy').length;
                const unreachable = services.filter(s => s.status === 'unreachable').length;
                const total = services.length;
                
                document.getElementById('overviewMetrics').innerHTML = \`
                    <div class="metric-card">
                        <div class="metric-value">\${total}</div>
                        <div class="metric-label">Total Services</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${healthy}</div>
                        <div class="metric-label">Healthy</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${unhealthy}</div>
                        <div class="metric-label">Unhealthy</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${unreachable}</div>
                        <div class="metric-label">Unreachable</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${total > 0 ? ((healthy / total) * 100).toFixed(1) : 0}%</div>
                        <div class="metric-label">System Health</div>
                    </div>
                \`;
            }
            
            function updatePerformanceMetrics() {
                const services = ecosystemData.services || [];
                const healthyServices = services.filter(s => s.status === 'healthy');
                const avgResponseTime = healthyServices.length > 0 
                    ? (healthyServices.reduce((acc, s) => acc + s.responseTime, 0) / healthyServices.length).toFixed(0)
                    : 0;
                
                document.getElementById('performanceMetrics').innerHTML = \`
                    <div class="metric-card">
                        <div class="metric-value">\${avgResponseTime}ms</div>
                        <div class="metric-label">Avg Response</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${(Math.random() * 100).toFixed(1)}%</div>
                        <div class="metric-label">CPU Usage</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${(Math.random() * 8 + 1).toFixed(1)}GB</div>
                        <div class="metric-label">Memory</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">\${Math.floor(Math.random() * 1000)}MB/s</div>
                        <div class="metric-label">Network</div>
                    </div>
                \`;
            }
            
            function updateServiceGrid() {
                const services = ecosystemData.services || [];
                const serviceHTML = services.map(service => \`
                    <div class="service-card \${service.status}" onclick="showServiceDetails('\${service.id}')">
                        <div class="service-name">\${service.name}</div>
                        <div class="service-port">:\${service.port}</div>
                        <div class="service-status status-\${service.status}">\${service.status}</div>
                    </div>
                \`).join('');
                
                document.getElementById('serviceGrid').innerHTML = serviceHTML || '<div class="loading">No services available</div>';
            }
            
            function updateAlerts(alerts) {
                const alertsHTML = alerts.slice(0, 5).map(alert => \`
                    <div class="alert-item">
                        <div class="alert-title">\${alert.type.toUpperCase()} - \${alert.service}</div>
                        <div class="alert-message">\${alert.message}</div>
                        <div class="alert-time">\${new Date(alert.timestamp).toLocaleTimeString()}</div>
                    </div>
                \`).join('');
                
                document.getElementById('alertsContainer').innerHTML = alertsHTML || '<div class="loading">No active alerts</div>';
            }
            
            function updateActivityFeed() {
                const activities = [
                    { text: 'System health check completed', time: new Date() },
                    { text: 'Service metrics updated', time: new Date(Date.now() - 30000) },
                    { text: 'Dashboard refreshed', time: new Date(Date.now() - 60000) },
                    { text: 'Real-time monitoring active', time: new Date(Date.now() - 90000) }
                ];
                
                const activitiesHTML = activities.map(activity => \`
                    <div class="activity-item">
                        <div class="activity-icon"></div>
                        <div class="activity-text">\${activity.text}</div>
                        <div class="activity-time">\${activity.time.toLocaleTimeString()}</div>
                    </div>
                \`).join('');
                
                document.getElementById('activityFeed').innerHTML = activitiesHTML;
            }
            
            function showServiceDetails(serviceId) {
                alert(\`Service Details: \${serviceId}\\n\\nThis would open a detailed view of the service status, metrics, and controls.\`);
            }
            
            function refreshDashboard() {
                fetch('/api/ecosystem/overview')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            ecosystemData = data.data;
                            updateDashboard();
                        }
                    })
                    .catch(error => console.error('Refresh failed:', error));
            }
            
            // Initial load
            refreshDashboard();
            
            // Auto-refresh every 30 seconds
            setInterval(refreshDashboard, 30000);
        </script>
    </body>
    </html>
  `);
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    service: 'Hub Central Dashboard & Coordination Service',
    version: '2.0.0',
    description: 'Comprehensive ecosystem coordination, real-time monitoring, and collaborative workspace management',
    endpoints: {
      ecosystem: {
        'GET /api/ecosystem/overview': 'Get ecosystem overview and status',
        'GET /api/ecosystem/service/:serviceId': 'Get specific service status',
        'GET /api/ecosystem/services/category/:category': 'Get services by category',
        'GET /api/ecosystem/services/priority/:priority': 'Get services by priority',
        'POST /api/ecosystem/service/:serviceId/health-check': 'Force health check for service'
      },
      dashboard: {
        'GET /api/dashboard/widgets': 'Get all dashboard widgets',
        'GET /api/dashboard/widget/:widgetId': 'Get specific widget data',
        'POST /api/dashboard/create': 'Create custom dashboard',
        'GET /api/dashboard/list': 'Get all dashboards',
        'GET /api/dashboard/:dashboardId': 'Get dashboard by ID',
        'PUT /api/dashboard/:dashboardId': 'Update dashboard'
      },
      workspace: {
        'POST /api/workspace/create': 'Create new workspace',
        'GET /api/workspace/list': 'Get all workspaces',
        'GET /api/workspace/:workspaceId': 'Get workspace by ID',
        'PUT /api/workspace/:workspaceId': 'Update workspace',
        'POST /api/workspace/:workspaceId/members': 'Add member to workspace'
      },
      workflows: {
        'POST /api/workflows/create': 'Create workflow',
        'GET /api/workflows/list': 'Get all workflows',
        'POST /api/workflows/:workflowId/execute': 'Execute workflow'
      },
      integrations: {
        'POST /api/integrations/create': 'Create integration',
        'GET /api/integrations/list': 'Get all integrations',
        'POST /api/integrations/:integrationId/sync': 'Sync integration'
      },
      automation: {
        'POST /api/automation/rules/create': 'Create automation rule',
        'GET /api/automation/rules/list': 'Get all automation rules',
        'POST /api/automation/rules/:ruleId/execute': 'Execute automation rule'
      },
      analytics: {
        'GET /api/analytics/system': 'Get system analytics',
        'GET /api/analytics/ecosystem/overview': 'Get ecosystem analytics overview',
        'POST /api/analytics/ecosystem/report': 'Generate ecosystem report'
      },
      notifications: {
        'GET /api/notifications/active': 'Get active notifications',
        'POST /api/notifications/:notificationId/acknowledge': 'Acknowledge notification'
      }
    },
    websocket: {
      events: [
        'ecosystem_status',
        'ecosystem_update',
        'service_update',
        'widget_update',
        'alerts_update',
        'collaboration_update',
        'workflow_executed',
        'integration_synced',
        'automation_executed'
      ],
      subscriptions: [
        'subscribe_dashboard',
        'subscribe_widget',
        'subscribe_service',
        'subscribe_workspace'
      ]
    },
    features: [
      'Real-time ecosystem monitoring',
      'Service health tracking',
      'Custom dashboard creation',
      'Collaborative workspaces',
      'Workflow automation',
      'Integration management',
      'Advanced analytics',
      'Alert management',
      'WebSocket real-time updates'
    ]
  });
});

// ============================================================================
// ADVANCED DASHBOARD MANAGEMENT
// ============================================================================

// Create custom dashboard
app.post('/api/dashboard/create', (req, res) => {
  try {
    const { name, description, layout, widgets, permissions } = req.body;

    const dashboard = {
      id: `dashboard_${Date.now()}`,
      name,
      description,
      layout: layout || 'grid',
      widgets: widgets || [],
      permissions: permissions || { public: true },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      lastViewed: null,
      settings: {
        refreshInterval: 30000,
        autoRefresh: true,
        theme: 'default'
      }
    };

    hubService.dashboards.set(dashboard.id, dashboard);

    res.json({
      success: true,
      data: dashboard,
      message: 'Dashboard created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all dashboards
app.get('/api/dashboard/list', (req, res) => {
  try {
    const dashboards = Array.from(hubService.dashboards.values());
    res.json({
      success: true,
      data: dashboards,
      count: dashboards.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard by ID
app.get('/api/dashboard/:dashboardId', (req, res) => {
  try {
    const dashboardId = req.params.dashboardId;
    const dashboard = hubService.dashboards.get(dashboardId);

    if (!dashboard) {
      return res.status(404).json({ success: false, error: 'Dashboard not found' });
    }

    // Update view metrics
    dashboard.viewCount++;
    dashboard.lastViewed = new Date().toISOString();
    hubService.dashboards.set(dashboardId, dashboard);

    res.json({
      success: true,
      data: dashboard
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update dashboard
app.put('/api/dashboard/:dashboardId', (req, res) => {
  try {
    const dashboardId = req.params.dashboardId;
    const dashboard = hubService.dashboards.get(dashboardId);

    if (!dashboard) {
      return res.status(404).json({ success: false, error: 'Dashboard not found' });
    }

    const updatedDashboard = {
      ...dashboard,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    hubService.dashboards.set(dashboardId, updatedDashboard);

    res.json({
      success: true,
      data: updatedDashboard,
      message: 'Dashboard updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// AUTOMATION & ORCHESTRATION
// ============================================================================

// Create automation rule
app.post('/api/automation/rules/create', (req, res) => {
  try {
    const { name, description, conditions, actions, schedule, enabled = true } = req.body;

    const rule = {
      id: `rule_${Date.now()}`,
      name,
      description,
      conditions: conditions || [],
      actions: actions || [],
      schedule: schedule || null,
      enabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
      lastExecution: null,
      successRate: 0
    };

    hubService.automation.set(rule.id, rule);

    res.json({
      success: true,
      data: rule,
      message: 'Automation rule created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all automation rules
app.get('/api/automation/rules/list', (req, res) => {
  try {
    const rules = Array.from(hubService.automation.values());
    res.json({
      success: true,
      data: rules,
      count: rules.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute automation rule
app.post('/api/automation/rules/:ruleId/execute', (req, res) => {
  try {
    const ruleId = req.params.ruleId;
    const rule = hubService.automation.get(ruleId);

    if (!rule) {
      return res.status(404).json({ success: false, error: 'Automation rule not found' });
    }

    if (!rule.enabled) {
      return res.status(400).json({ success: false, error: 'Automation rule is disabled' });
    }

    // Execute rule
    rule.executionCount++;
    rule.lastExecution = new Date().toISOString();
    rule.updatedAt = new Date().toISOString();

    hubService.automation.set(ruleId, rule);

    // Broadcast automation execution
    io.to('ecosystem_monitoring').emit('automation_executed', {
      ruleId,
      status: 'executed',
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        ruleId,
        executionId: `exec_${Date.now()}`,
        status: 'executed',
        timestamp: new Date().toISOString()
      },
      message: 'Automation rule executed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ADVANCED ANALYTICS & REPORTING
// ============================================================================

// Get ecosystem analytics
app.get('/api/analytics/ecosystem/overview', (req, res) => {
  try {
    const services = Array.from(hubService.ecosystemServices.values());
    const timeRange = req.query.timeRange || '24h';

    const analytics = {
      summary: {
        totalServices: services.length,
        healthyServices: services.filter(s => s.status === 'healthy').length,
        unhealthyServices: services.filter(s => s.status === 'unhealthy').length,
        unreachableServices: services.filter(s => s.status === 'unreachable').length,
        averageResponseTime: services.reduce((acc, s) => acc + s.responseTime, 0) / services.length || 0,
        systemUptime: ((services.filter(s => s.status === 'healthy').length / services.length) * 100).toFixed(2)
      },
      servicesByCategory: {},
      servicesByPriority: {},
      performanceMetrics: {
        responseTime: {
          average: services.reduce((acc, s) => acc + s.responseTime, 0) / services.length || 0,
          fastest: Math.min(...services.map(s => s.responseTime).filter(rt => rt > 0)) || 0,
          slowest: Math.max(...services.map(s => s.responseTime)) || 0
        },
        healthScore: {
          average: services.reduce((acc, s) => acc + s.healthScore, 0) / services.length || 0,
          distribution: {
            healthy: services.filter(s => s.healthScore >= 80).length,
            warning: services.filter(s => s.healthScore >= 50 && s.healthScore < 80).length,
            critical: services.filter(s => s.healthScore < 50).length
          }
        }
      },
      timeRange,
      generatedAt: new Date().toISOString()
    };

    // Group by category
    services.forEach(service => {
      if (!analytics.servicesByCategory[service.category]) {
        analytics.servicesByCategory[service.category] = 0;
      }
      analytics.servicesByCategory[service.category]++;
    });

    // Group by priority
    services.forEach(service => {
      if (!analytics.servicesByPriority[service.priority]) {
        analytics.servicesByPriority[service.priority] = 0;
      }
      analytics.servicesByPriority[service.priority]++;
    });

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate ecosystem report
app.post('/api/analytics/ecosystem/report', (req, res) => {
  try {
    const { format = 'json', includeMetrics = true, includeServices = true } = req.body;

    const services = Array.from(hubService.ecosystemServices.values());
    const analytics = Object.fromEntries(hubService.analytics);
    const notifications = Array.from(hubService.notifications.values()).flat();

    const report = {
      id: `report_${Date.now()}`,
      generatedAt: new Date().toISOString(),
      format,
      summary: {
        totalServices: services.length,
        healthyServices: services.filter(s => s.status === 'healthy').length,
        activeAlerts: notifications.length,
        systemHealth: ((services.filter(s => s.status === 'healthy').length / services.length) * 100).toFixed(2) + '%'
      }
    };

    if (includeServices) {
      report.services = services;
    }

    if (includeMetrics) {
      report.analytics = analytics;
      report.notifications = notifications;
    }

    res.json({
      success: true,
      data: report,
      message: 'Ecosystem report generated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WEBSOCKET REAL-TIME COMMUNICATION
// ============================================================================

io.on('connection', (socket) => {
  console.log(`🔌 Hub client connected: ${socket.id}`);

  // Send initial ecosystem status
  socket.emit('ecosystem_status', hubService.getEcosystemStatus());

  // Join ecosystem monitoring room
  socket.join('ecosystem_monitoring');

  // Handle dashboard subscription
  socket.on('subscribe_dashboard', (dashboardId) => {
    socket.join(`dashboard_${dashboardId}`);
    console.log(`📊 Client subscribed to dashboard: ${dashboardId}`);
  });

  // Handle widget subscription
  socket.on('subscribe_widget', (widgetId) => {
    socket.join(`widget_${widgetId}`);
    console.log(`🔲 Client subscribed to widget: ${widgetId}`);
  });

  // Handle service monitoring subscription
  socket.on('subscribe_service', (serviceId) => {
    socket.join(`service_${serviceId}`);
    console.log(`⚙️ Client subscribed to service: ${serviceId}`);
  });

  // Handle workspace subscription
  socket.on('subscribe_workspace', (workspaceId) => {
    socket.join(`workspace_${workspaceId}`);
    console.log(`🏢 Client subscribed to workspace: ${workspaceId}`);
  });

  // Handle collaboration events
  socket.on('collaboration_action', (data) => {
    socket.to(`workspace_${data.workspaceId}`).emit('collaboration_update', {
      action: data.action,
      user: data.user,
      timestamp: new Date().toISOString(),
      data: data.payload
    });
  });

  // Handle workflow execution requests
  socket.on('execute_workflow', async (data) => {
    try {
      const { workflowId } = data;
      const workflow = hubService.workflows.get(workflowId);

      if (workflow) {
        // Execute workflow
        workflow.executionCount++;
        workflow.lastExecution = new Date().toISOString();
        hubService.workflows.set(workflowId, workflow);

        // Broadcast workflow execution
        io.to('ecosystem_monitoring').emit('workflow_executed', {
          workflowId,
          status: 'executed',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to execute workflow' });
    }
  });

  // Handle integration sync requests
  socket.on('sync_integration', async (data) => {
    try {
      const { integrationId } = data;
      const integration = hubService.integrations.get(integrationId);

      if (integration) {
        // Sync integration
        integration.syncCount++;
        integration.lastSync = new Date().toISOString();
        hubService.integrations.set(integrationId, integration);

        // Broadcast integration sync
        io.to('ecosystem_monitoring').emit('integration_synced', {
          integrationId,
          status: 'synced',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      socket.emit('error', { message: 'Failed to sync integration' });
    }
  });

  // Handle custom events
  socket.on('custom_event', (data) => {
    // Broadcast custom events to appropriate rooms
    if (data.room) {
      socket.to(data.room).emit('custom_event_response', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Hub client disconnected: ${socket.id}`);
  });
});

// Broadcast system updates periodically
setInterval(() => {
  const ecosystemStatus = hubService.getEcosystemStatus();

  // Broadcast ecosystem updates
  io.to('ecosystem_monitoring').emit('ecosystem_update', ecosystemStatus);

  // Broadcast service-specific updates
  ecosystemStatus.services.forEach(service => {
    io.to(`service_${service.id}`).emit('service_update', service);
  });

  // Broadcast widget updates
  ecosystemStatus.widgets.forEach(widget => {
    io.to(`widget_${widget.id}`).emit('widget_update', widget);
  });

  // Broadcast alerts if any
  if (ecosystemStatus.notifications.length > 0) {
    io.to('ecosystem_monitoring').emit('alerts_update', ecosystemStatus.notifications);
  }
}, 5000); // Every 5 seconds

// ============================================================================
// COLLABORATION & WORKSPACE MANAGEMENT
// ============================================================================

// Create workspace
app.post('/api/workspace/create', (req, res) => {
  try {
    const { name, description, members, type = 'project' } = req.body;

    const workspace = {
      id: `workspace_${Date.now()}`,
      name,
      description,
      type,
      members: members || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      settings: {
        visibility: 'private',
        allowInvites: true,
        notifications: true
      },
      resources: [],
      integrations: []
    };

    hubService.workspace.set(workspace.id, workspace);

    res.json({
      success: true,
      data: workspace,
      message: 'Workspace created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workspaces
app.get('/api/workspace/list', (req, res) => {
  try {
    const workspaces = Array.from(hubService.workspace.values());
    res.json({
      success: true,
      data: workspaces,
      count: workspaces.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get workspace by ID
app.get('/api/workspace/:workspaceId', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const workspace = hubService.workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    res.json({
      success: true,
      data: workspace
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update workspace
app.put('/api/workspace/:workspaceId', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const workspace = hubService.workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    const updatedWorkspace = {
      ...workspace,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    hubService.workspace.set(workspaceId, updatedWorkspace);

    res.json({
      success: true,
      data: updatedWorkspace,
      message: 'Workspace updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add member to workspace
app.post('/api/workspace/:workspaceId/members', (req, res) => {
  try {
    const workspaceId = req.params.workspaceId;
    const { userId, role = 'member' } = req.body;

    const workspace = hubService.workspace.get(workspaceId);

    if (!workspace) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }

    const member = {
      userId,
      role,
      joinedAt: new Date().toISOString(),
      permissions: role === 'admin' ? ['read', 'write', 'delete', 'invite'] : ['read', 'write']
    };

    workspace.members.push(member);
    workspace.updatedAt = new Date().toISOString();

    hubService.workspace.set(workspaceId, workspace);

    res.json({
      success: true,
      data: member,
      message: 'Member added to workspace'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// WORKFLOW AUTOMATION
// ============================================================================

// Create workflow
app.post('/api/workflows/create', (req, res) => {
  try {
    const { name, description, triggers, actions, conditions } = req.body;

    const workflow = {
      id: `workflow_${Date.now()}`,
      name,
      description,
      triggers: triggers || [],
      actions: actions || [],
      conditions: conditions || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      executionCount: 0,
      lastExecution: null
    };

    hubService.workflows.set(workflow.id, workflow);

    res.json({
      success: true,
      data: workflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all workflows
app.get('/api/workflows/list', (req, res) => {
  try {
    const workflows = Array.from(hubService.workflows.values());
    res.json({
      success: true,
      data: workflows,
      count: workflows.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute workflow
app.post('/api/workflows/:workflowId/execute', (req, res) => {
  try {
    const workflowId = req.params.workflowId;
    const workflow = hubService.workflows.get(workflowId);

    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Update execution metrics
    workflow.executionCount++;
    workflow.lastExecution = new Date().toISOString();
    workflow.updatedAt = new Date().toISOString();

    hubService.workflows.set(workflowId, workflow);

    res.json({
      success: true,
      data: {
        workflowId,
        executionId: `exec_${Date.now()}`,
        status: 'executed',
        timestamp: new Date().toISOString()
      },
      message: 'Workflow executed successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// INTEGRATION MANAGEMENT
// ============================================================================

// Create integration
app.post('/api/integrations/create', (req, res) => {
  try {
    const { name, type, config, services } = req.body;

    const integration = {
      id: `integration_${Date.now()}`,
      name,
      type,
      config: config || {},
      services: services || [],
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSync: null,
      syncCount: 0
    };

    hubService.integrations.set(integration.id, integration);

    res.json({
      success: true,
      data: integration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all integrations
app.get('/api/integrations/list', (req, res) => {
  try {
    const integrations = Array.from(hubService.integrations.values());
    res.json({
      success: true,
      data: integrations,
      count: integrations.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Sync integration
app.post('/api/integrations/:integrationId/sync', (req, res) => {
  try {
    const integrationId = req.params.integrationId;
    const integration = hubService.integrations.get(integrationId);

    if (!integration) {
      return res.status(404).json({ success: false, error: 'Integration not found' });
    }

    // Update sync metrics
    integration.syncCount++;
    integration.lastSync = new Date().toISOString();
    integration.updatedAt = new Date().toISOString();

    hubService.integrations.set(integrationId, integration);

    res.json({
      success: true,
      data: {
        integrationId,
        syncId: `sync_${Date.now()}`,
        status: 'synced',
        timestamp: new Date().toISOString()
      },
      message: 'Integration synced successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ECOSYSTEM COORDINATION API ENDPOINTS
// ============================================================================

// Get ecosystem overview
app.get('/api/ecosystem/overview', (req, res) => {
  try {
    const status = hubService.getEcosystemStatus();
    res.json({
      success: true,
      data: {
        overview: {
          totalServices: status.services.length,
          healthyServices: status.services.filter(s => s.status === 'healthy').length,
          unhealthyServices: status.services.filter(s => s.status === 'unhealthy').length,
          unreachableServices: status.services.filter(s => s.status === 'unreachable').length,
          systemHealth: (status.services.filter(s => s.status === 'healthy').length / status.services.length) * 100
        },
        services: status.services,
        alerts: status.notifications,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific service status
app.get('/api/ecosystem/service/:serviceId', (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = hubService.ecosystemServices.get(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all services by category
app.get('/api/ecosystem/services/category/:category', (req, res) => {
  try {
    const category = req.params.category;
    const services = Array.from(hubService.ecosystemServices.values())
      .filter(service => service.category === category);

    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get services by priority
app.get('/api/ecosystem/services/priority/:priority', (req, res) => {
  try {
    const priority = parseInt(req.params.priority);
    const services = Array.from(hubService.ecosystemServices.values())
      .filter(service => service.priority === priority);

    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard widgets
app.get('/api/dashboard/widgets', (req, res) => {
  try {
    const widgets = Array.from(hubService.widgets.values());
    res.json({
      success: true,
      data: widgets
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific widget data
app.get('/api/dashboard/widget/:widgetId', (req, res) => {
  try {
    const widgetId = req.params.widgetId;
    const widget = hubService.widgets.get(widgetId);

    if (!widget) {
      return res.status(404).json({ success: false, error: 'Widget not found' });
    }

    res.json({
      success: true,
      data: widget
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get system analytics
app.get('/api/analytics/system', (req, res) => {
  try {
    const analytics = Object.fromEntries(hubService.analytics);
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active notifications/alerts
app.get('/api/notifications/active', (req, res) => {
  try {
    const notifications = Array.from(hubService.notifications.values()).flat();
    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Acknowledge notification
app.post('/api/notifications/:notificationId/acknowledge', (req, res) => {
  try {
    const notificationId = req.params.notificationId;
    // Implementation for acknowledging notifications
    res.json({
      success: true,
      message: `Notification ${notificationId} acknowledged`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Force health check for specific service
app.post('/api/ecosystem/service/:serviceId/health-check', async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const service = hubService.ecosystemServices.get(serviceId);

    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    // Perform immediate health check
    await hubService.performHealthChecks();
    const updatedService = hubService.ecosystemServices.get(serviceId);

    res.json({
      success: true,
      data: updatedService,
      message: 'Health check completed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// BASIC HEALTH CHECK ENDPOINTS
// ============================================================================

app.get('/', (req, res) => {
  res.json({
    service: 'Hub',
    status: 'operational',
    timestamp: new Date().toISOString(),
    port: 4018,
    version: '2.0.0',
    category: 'Central Hub & Dashboard',
    capabilities: [
      'ecosystem_coordination',
      'real_time_monitoring',
      'unified_dashboard',
      'workflow_automation',
      'collaborative_workspace'
    ],
    message: 'Hub Central Dashboard & Coordination Service is running successfully'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Hub',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '2.0.0'
  });
});

// Start server
server.listen(port, () => {
  console.log(`🏢 Hub Central Dashboard & Coordination Service running on port ${port}`);
  console.log(`🌟 Service: ${serviceName}`);
  console.log(`🔗 URL: http://localhost:${port}`);
  console.log(`📊 Dashboard: http://localhost:${port}/dashboard`);
  console.log(`📚 API Docs: http://localhost:${port}/api/docs`);
  console.log(`📊 Category: Central Hub & Dashboard`);
  console.log(`⚡ Status: Operational`);
  console.log(`🚀 Features: Ecosystem Coordination, Real-time Monitoring, Collaborative Workspace`);
  console.log(`🔌 WebSocket: Real-time updates enabled`);
  console.log(`🔒 Security: Helmet protection, rate limiting, CORS enabled`);
  console.log(`📈 Analytics: Advanced ecosystem analytics and reporting`);
  console.log(`🤖 Automation: Workflow automation and orchestration`);
  console.log(`🔗 Integrations: Service integration management`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Hub Central Dashboard & Coordination Service...');
  server.close(() => {
    console.log('✅ Hub service shut down successfully');
    process.exit(0);
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error);
  process.exit(1);
});

// Export for testing
export { hubService, app, server };
