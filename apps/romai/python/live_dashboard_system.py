"""
RomAI AGI - Live Dashboard System
Week 3 Day 3: Real-time Intelligence & Live Updates

Real-time visualization dashboard for Romanian AGI system with live agent performance,
cultural insights, streaming analytics, and WebSocket-powered updates.
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum
import aiohttp
import websockets
from aiohttp import web, WSMsgType
from aiohttp.web_ws import WebSocketResponse
import weakref

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DashboardComponent(Enum):
    AGENT_PERFORMANCE = "agent_performance"
    CULTURAL_INSIGHTS = "cultural_insights"
    STREAMING_ANALYTICS = "streaming_analytics"
    REAL_TIME_METRICS = "real_time_metrics"
    TASK_MONITORING = "task_monitoring"
    COLLABORATION_STATUS = "collaboration_status"
    SYSTEM_HEALTH = "system_health"
    ROMANIAN_TRENDS = "romanian_trends"

class UpdateFrequency(Enum):
    REAL_TIME = 1      # 1 second
    HIGH = 5           # 5 seconds
    MEDIUM = 15        # 15 seconds
    LOW = 60           # 1 minute

@dataclass
class DashboardMetric:
    metric_id: str
    component: DashboardComponent
    name: str
    value: Any
    unit: str
    trend: str  # "up", "down", "stable"
    timestamp: datetime
    update_frequency: UpdateFrequency
    cultural_relevance: float = 0.0
    priority: int = 1
    
@dataclass
class LiveVisualization:
    visualization_id: str
    title: str
    chart_type: str  # "line", "bar", "pie", "gauge", "heatmap", "treemap"
    data: Dict[str, Any]
    config: Dict[str, Any]
    last_updated: datetime
    auto_refresh: bool = True
    romanian_context: Dict[str, Any] = None

@dataclass
class DashboardAlert:
    alert_id: str
    component: DashboardComponent
    severity: str  # "info", "warning", "error", "critical"
    title: str
    message: str
    cultural_context: Optional[str]
    timestamp: datetime
    acknowledged: bool = False
    auto_dismiss: bool = True

class LiveDashboardSystem:
    """
    Advanced live dashboard system for real-time Romanian AGI monitoring.
    Provides WebSocket-powered updates, cultural insights visualization, and agent performance tracking.
    """
    
    def __init__(self, host: str = "localhost", port: int = 8081, cbd_url: str = "http://localhost:4180"):
        self.host = host
        self.port = port
        self.cbd_url = cbd_url
        
        # WebSocket connections for live updates
        self.dashboard_connections: Dict[str, WebSocketResponse] = {}
        self.connection_subscriptions: Dict[str, List[DashboardComponent]] = {}
        
        # Dashboard data
        self.live_metrics: Dict[str, DashboardMetric] = {}
        self.visualizations: Dict[str, LiveVisualization] = {}
        self.alerts: List[DashboardAlert] = []
        
        # Data sources
        self.data_sources = {
            "websocket_hub": "ws://localhost:8080",
            "analytics_engine": None,  # Direct instance reference
            "multi_agent_orchestrator": None,  # Direct instance reference
            "cbd_database": self.cbd_url
        }
        
        # Romanian cultural context for dashboard
        self.cultural_dashboard_elements = {
            "color_scheme": {
                "primary": "#CE1126",    # Romanian red
                "secondary": "#FCD116",  # Romanian yellow
                "accent": "#002B7F",     # Romanian blue
                "success": "#28a745",
                "warning": "#ffc107",
                "danger": "#dc3545",
                "info": "#17a2b8"
            },
            "romanian_regions": ["Transilvania", "Moldova", "Muntenia", "Oltenia", "Dobrogea"],
            "cultural_categories": [
                "Istorie", "Tradiții", "Limbă", "Literatură", "Muzică", 
                "Gastronomie", "Sărbători", "Artă", "Natură", "Modernitate"
            ],
            "typography": {
                "primary_font": "Roboto",
                "secondary_font": "Open Sans",
                "accent_font": "Merriweather"  # For Romanian text
            }
        }
        
        # Update schedulers
        self.update_tasks: Dict[UpdateFrequency, asyncio.Task] = {}
        
        # Web application
        self.app = None
        self.session = None
        self.runner = None
        self.site = None
        self.is_running = False
        
    async def initialize(self):
        """Initialize the live dashboard system."""
        self.session = aiohttp.ClientSession()
        await self._setup_web_application()
        await self._initialize_dashboard_data()
        await self._start_update_schedulers()
        
        logger.info(f"🚀 Live Dashboard System initialized on http://{self.host}:{self.port}")
        logger.info(f"🎨 Romanian cultural theme applied")
        logger.info(f"📊 Dashboard components: {len(DashboardComponent)}")
    
    async def _setup_web_application(self):
        """Setup aiohttp web application."""
        self.app = web.Application()
        
        # Routes
        self.app.router.add_get('/', self._serve_dashboard_html)
        self.app.router.add_get('/ws', self._handle_websocket)
        self.app.router.add_get('/api/metrics', self._get_metrics_api)
        self.app.router.add_get('/api/visualizations', self._get_visualizations_api)
        self.app.router.add_get('/api/alerts', self._get_alerts_api)
        self.app.router.add_post('/api/alerts/{alert_id}/acknowledge', self._acknowledge_alert_api)
        self.app.router.add_get('/api/cultural-trends', self._get_cultural_trends_api)
        self.app.router.add_get('/api/agent-performance', self._get_agent_performance_api)
        # Static files (commented out for testing)
        # self.app.router.add_static('/', path='static/', name='static')
        
        # CORS middleware
        async def cors_middleware(request, handler):
            response = await handler(request)
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            return response
        
        self.app.middlewares.append(cors_middleware)
    
    async def _initialize_dashboard_data(self):
        """Initialize dashboard with default data."""
        # System health metrics
        await self._add_metric(DashboardMetric(
            metric_id="system_uptime",
            component=DashboardComponent.SYSTEM_HEALTH,
            name="System Uptime",
            value=0,
            unit="seconds",
            trend="up",
            timestamp=datetime.now(),
            update_frequency=UpdateFrequency.MEDIUM
        ))
        
        # Agent performance metrics
        await self._add_metric(DashboardMetric(
            metric_id="active_agents",
            component=DashboardComponent.AGENT_PERFORMANCE,
            name="Active Agents",
            value=0,
            unit="agents",
            trend="stable",
            timestamp=datetime.now(),
            update_frequency=UpdateFrequency.HIGH
        ))
        
        # Cultural insights metrics
        await self._add_metric(DashboardMetric(
            metric_id="cultural_score",
            component=DashboardComponent.CULTURAL_INSIGHTS,
            name="Average Cultural Score",
            value=0.0,
            unit="score",
            trend="stable",
            timestamp=datetime.now(),
            update_frequency=UpdateFrequency.HIGH,
            cultural_relevance=1.0
        ))
        
        # Streaming analytics metrics
        await self._add_metric(DashboardMetric(
            metric_id="streams_processed",
            component=DashboardComponent.STREAMING_ANALYTICS,
            name="Streams Processed",
            value=0,
            unit="streams",
            trend="up",
            timestamp=datetime.now(),
            update_frequency=UpdateFrequency.REAL_TIME
        ))
        
        # Initialize visualizations
        await self._create_default_visualizations()
        
        logger.info("✅ Dashboard data initialized")
    
    async def _create_default_visualizations(self):
        """Create default dashboard visualizations."""
        # Cultural trends pie chart
        cultural_trends_viz = LiveVisualization(
            visualization_id="cultural_trends_pie",
            title="Categorii Culturale Românești",
            chart_type="pie",
            data={
                "labels": self.cultural_dashboard_elements["cultural_categories"],
                "datasets": [{
                    "data": [0] * len(self.cultural_dashboard_elements["cultural_categories"]),
                    "backgroundColor": [
                        "#CE1126", "#FCD116", "#002B7F", "#28a745", "#ffc107",
                        "#dc3545", "#17a2b8", "#6f42c1", "#fd7e14", "#20c997"
                    ]
                }]
            },
            config={
                "responsive": True,
                "plugins": {
                    "legend": {"position": "right"},
                    "title": {"display": True, "text": "Distribuția Categoriilor Culturale"}
                }
            },
            last_updated=datetime.now(),
            romanian_context={"language": "ro", "cultural_focus": True}
        )
        
        # Regional activity heatmap
        regional_activity_viz = LiveVisualization(
            visualization_id="regional_activity_heatmap",
            title="Activitate pe Regiuni",
            chart_type="heatmap",
            data={
                "regions": self.cultural_dashboard_elements["romanian_regions"],
                "activity_data": [
                    {"region": region, "activity": 0, "cultural_score": 0.0}
                    for region in self.cultural_dashboard_elements["romanian_regions"]
                ]
            },
            config={
                "colorScale": ["#ffffff", "#CE1126"],
                "responsive": True
            },
            last_updated=datetime.now(),
            romanian_context={"regions": self.cultural_dashboard_elements["romanian_regions"]}
        )
        
        # Agent performance timeline
        agent_performance_viz = LiveVisualization(
            visualization_id="agent_performance_timeline",
            title="Performanța Agenților în Timp",
            chart_type="line",
            data={
                "labels": [],
                "datasets": [
                    {
                        "label": "Specialist Română",
                        "data": [],
                        "borderColor": "#CE1126",
                        "backgroundColor": "rgba(206, 17, 38, 0.1)"
                    },
                    {
                        "label": "Context Cultural",
                        "data": [],
                        "borderColor": "#FCD116",
                        "backgroundColor": "rgba(252, 209, 22, 0.1)"
                    },
                    {
                        "label": "Implementare Tehnică",
                        "data": [],
                        "borderColor": "#002B7F",
                        "backgroundColor": "rgba(0, 43, 127, 0.1)"
                    }
                ]
            },
            config={
                "responsive": True,
                "scales": {
                    "y": {"beginAtZero": True, "max": 100}
                }
            },
            last_updated=datetime.now()
        )
        
        # Real-time metrics gauge
        real_time_metrics_viz = LiveVisualization(
            visualization_id="real_time_metrics_gauge",
            title="Metrici în Timp Real",
            chart_type="gauge",
            data={
                "value": 0,
                "max": 100,
                "title": "Scor General Sistem",
                "unit": "%"
            },
            config={
                "responsive": True,
                "color_ranges": [
                    {"from": 0, "to": 30, "color": "#dc3545"},
                    {"from": 30, "to": 70, "color": "#ffc107"},
                    {"from": 70, "to": 100, "color": "#28a745"}
                ]
            },
            last_updated=datetime.now()
        )
        
        # Store visualizations
        self.visualizations["cultural_trends_pie"] = cultural_trends_viz
        self.visualizations["regional_activity_heatmap"] = regional_activity_viz
        self.visualizations["agent_performance_timeline"] = agent_performance_viz
        self.visualizations["real_time_metrics_gauge"] = real_time_metrics_viz
        
        logger.info(f"📊 Created {len(self.visualizations)} default visualizations")
    
    async def _start_update_schedulers(self):
        """Start background update schedulers."""
        # Schedule updates based on frequency
        self.update_tasks[UpdateFrequency.REAL_TIME] = asyncio.create_task(
            self._update_scheduler(UpdateFrequency.REAL_TIME)
        )
        self.update_tasks[UpdateFrequency.HIGH] = asyncio.create_task(
            self._update_scheduler(UpdateFrequency.HIGH)
        )
        self.update_tasks[UpdateFrequency.MEDIUM] = asyncio.create_task(
            self._update_scheduler(UpdateFrequency.MEDIUM)
        )
        self.update_tasks[UpdateFrequency.LOW] = asyncio.create_task(
            self._update_scheduler(UpdateFrequency.LOW)
        )
        
        logger.info("⏰ Update schedulers started")
    
    async def start_server(self):
        """Start the dashboard web server."""
        try:
            self.runner = web.AppRunner(self.app)
            await self.runner.setup()
            
            self.site = web.TCPSite(self.runner, self.host, self.port)
            await self.site.start()
            
            self.is_running = True
            
            logger.info(f"🌐 Live Dashboard server started on http://{self.host}:{self.port}")
            logger.info("📊 Dashboard ready for real-time monitoring!")
            
            # Keep server running
            while self.is_running:
                await asyncio.sleep(1)
                
        except Exception as e:
            logger.error(f"❌ Dashboard server error: {str(e)}")
        finally:
            await self._cleanup_server()
    
    async def _cleanup_server(self):
        """Cleanup server resources."""
        if self.site:
            await self.site.stop()
        if self.runner:
            await self.runner.cleanup()
    
    # WebSocket handling
    async def _handle_websocket(self, request):
        """Handle WebSocket connections for real-time updates."""
        ws = web.WebSocketResponse()
        await ws.prepare(request)
        
        connection_id = f"dashboard_{int(time.time() * 1000)}"
        self.dashboard_connections[connection_id] = ws
        self.connection_subscriptions[connection_id] = list(DashboardComponent)  # Subscribe to all by default
        
        logger.info(f"🔗 Dashboard WebSocket connected: {connection_id}")
        
        # Send initial dashboard state
        await self._send_initial_dashboard_state(ws)
        
        try:
            async for msg in ws:
                if msg.type == WSMsgType.TEXT:
                    try:
                        data = json.loads(msg.data)
                        await self._handle_websocket_message(connection_id, data)
                    except json.JSONDecodeError:
                        logger.error(f"❌ Invalid JSON from {connection_id}")
                elif msg.type == WSMsgType.ERROR:
                    logger.error(f"❌ WebSocket error: {ws.exception()}")
                    break
        except Exception as e:
            logger.error(f"❌ WebSocket handler error: {str(e)}")
        finally:
            # Cleanup connection
            if connection_id in self.dashboard_connections:
                del self.dashboard_connections[connection_id]
            if connection_id in self.connection_subscriptions:
                del self.connection_subscriptions[connection_id]
            
            logger.info(f"🔌 Dashboard WebSocket disconnected: {connection_id}")
        
        return ws
    
    async def _send_initial_dashboard_state(self, ws: WebSocketResponse):
        """Send initial dashboard state to new connection."""
        initial_state = {
            "type": "initial_state",
            "timestamp": datetime.now().isoformat(),
            "theme": self.cultural_dashboard_elements,
            "metrics": {metric_id: asdict(metric) for metric_id, metric in self.live_metrics.items()},
            "visualizations": {viz_id: asdict(viz) for viz_id, viz in self.visualizations.items()},
            "alerts": [asdict(alert) for alert in self.alerts[-10:]],  # Last 10 alerts
            "components": [component.value for component in DashboardComponent]
        }
        
        # Convert datetime objects to ISO strings
        def convert_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            elif isinstance(obj, dict):
                return {k: convert_datetime(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_datetime(item) for item in obj]
            return obj
        
        initial_state = convert_datetime(initial_state)
        
        await ws.send_str(json.dumps(initial_state))
        logger.debug("📤 Sent initial dashboard state")
    
    async def _handle_websocket_message(self, connection_id: str, data: Dict[str, Any]):
        """Handle incoming WebSocket message."""
        message_type = data.get("type")
        
        if message_type == "subscribe":
            # Update subscriptions
            components = data.get("components", [])
            self.connection_subscriptions[connection_id] = [
                DashboardComponent(comp) for comp in components
            ]
            logger.debug(f"📡 Updated subscriptions for {connection_id}")
        
        elif message_type == "request_update":
            # Send specific component update
            component = data.get("component")
            if component:
                await self._send_component_update(connection_id, DashboardComponent(component))
        
        elif message_type == "ping":
            # Respond to ping
            await self.dashboard_connections[connection_id].send_str(json.dumps({
                "type": "pong",
                "timestamp": datetime.now().isoformat()
            }))
    
    # HTTP API endpoints
    async def _serve_dashboard_html(self, request):
        """Serve the main dashboard HTML page."""
        html_content = await self._generate_dashboard_html()
        return web.Response(text=html_content, content_type='text/html')
    
    async def _generate_dashboard_html(self) -> str:
        """Generate the dashboard HTML page."""
        return f"""
<!DOCTYPE html>
<html lang="ro">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RomAI AGI - Dashboard Live</title>
    <style>
        :root {{
            --romanian-red: {self.cultural_dashboard_elements['color_scheme']['primary']};
            --romanian-yellow: {self.cultural_dashboard_elements['color_scheme']['secondary']};
            --romanian-blue: {self.cultural_dashboard_elements['color_scheme']['accent']};
        }}
        
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: '{self.cultural_dashboard_elements['typography']['primary_font']}', sans-serif;
            background: linear-gradient(135deg, var(--romanian-red), var(--romanian-blue));
            color: #333;
            min-height: 100vh;
        }}
        
        .dashboard-container {{
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        .header {{
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            margin-bottom: 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }}
        
        .header h1 {{
            color: var(--romanian-red);
            font-size: 2.5rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
        }}
        
        .header .subtitle {{
            text-align: center;
            color: var(--romanian-blue);
            font-size: 1.1rem;
        }}
        
        .metrics-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .metric-card {{
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            border-left: 5px solid var(--romanian-red);
        }}
        
        .metric-card h3 {{
            color: var(--romanian-blue);
            font-size: 1.1rem;
            margin-bottom: 10px;
        }}
        
        .metric-value {{
            font-size: 2rem;
            font-weight: bold;
            color: var(--romanian-red);
            margin-bottom: 5px;
        }}
        
        .metric-unit {{
            color: #666;
            font-size: 0.9rem;
        }}
        
        .visualizations-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}
        
        .visualization-card {{
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
            min-height: 300px;
        }}
        
        .visualization-card h3 {{
            color: var(--romanian-blue);
            font-size: 1.3rem;
            margin-bottom: 15px;
            text-align: center;
        }}
        
        .alerts-section {{
            background: rgba(255, 255, 255, 0.95);
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }}
        
        .alerts-section h3 {{
            color: var(--romanian-blue);
            font-size: 1.3rem;
            margin-bottom: 15px;
        }}
        
        .alert-item {{
            background: #f8f9fa;
            padding: 15px;
            margin-bottom: 10px;
            border-radius: 8px;
            border-left: 4px solid var(--romanian-yellow);
        }}
        
        .alert-item.error {{
            border-left-color: #dc3545;
        }}
        
        .alert-item.warning {{
            border-left-color: #ffc107;
        }}
        
        .alert-item.info {{
            border-left-color: #17a2b8;
        }}
        
        .status-indicator {{
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #28a745;
            margin-right: 8px;
            animation: pulse 2s infinite;
        }}
        
        @keyframes pulse {{
            0% {{ opacity: 1; }}
            50% {{ opacity: 0.5; }}
            100% {{ opacity: 1; }}
        }}
        
        .connection-status {{
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px 15px;
            border-radius: 25px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(10px);
        }}
        
        .romanian-flag {{
            display: inline-block;
            width: 30px;
            height: 20px;
            background: linear-gradient(to right, 
                var(--romanian-blue) 33%, 
                var(--romanian-yellow) 33% 66%, 
                var(--romanian-red) 66%);
            border-radius: 3px;
            margin-right: 10px;
            vertical-align: middle;
        }}
    </style>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <div class="dashboard-container">
        <div class="header">
            <h1>
                <span class="romanian-flag"></span>
                RomAI AGI Dashboard Live
                <span class="romanian-flag"></span>
            </h1>
            <p class="subtitle">Monitorizare în Timp Real a Sistemului de Inteligență Artificială Românesc</p>
        </div>
        
        <div class="connection-status">
            <span class="status-indicator" id="connectionStatus"></span>
            <span id="connectionText">Conectare...</span>
        </div>
        
        <div class="metrics-grid" id="metricsGrid">
            <!-- Metrics will be populated by JavaScript -->
        </div>
        
        <div class="visualizations-grid" id="visualizationsGrid">
            <!-- Visualizations will be populated by JavaScript -->
        </div>
        
        <div class="alerts-section">
            <h3>🚨 Alerte Sistem</h3>
            <div id="alertsList">
                <!-- Alerts will be populated by JavaScript -->
            </div>
        </div>
    </div>
    
    <script>
        class RomAIDashboard {{
            constructor() {{
                this.ws = null;
                this.charts = {{}};
                this.metrics = {{}};
                this.isConnected = false;
                this.reconnectAttempts = 0;
                this.maxReconnectAttempts = 5;
                
                this.initializeWebSocket();
                this.setupEventListeners();
            }}
            
            initializeWebSocket() {{
                const wsUrl = `ws://${{window.location.host}}/ws`;
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {{
                    console.log('✅ WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    this.updateConnectionStatus(true);
                }};
                
                this.ws.onmessage = (event) => {{
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                }};
                
                this.ws.onclose = () => {{
                    console.log('🔌 WebSocket disconnected');
                    this.isConnected = false;
                    this.updateConnectionStatus(false);
                    this.attemptReconnect();
                }};
                
                this.ws.onerror = (error) => {{
                    console.error('❌ WebSocket error:', error);
                    this.updateConnectionStatus(false);
                }};
            }}
            
            attemptReconnect() {{
                if (this.reconnectAttempts < this.maxReconnectAttempts) {{
                    this.reconnectAttempts++;
                    console.log(`🔄 Reconnection attempt ${{this.reconnectAttempts}}`);
                    setTimeout(() => {{
                        this.initializeWebSocket();
                    }}, 2000 * this.reconnectAttempts);
                }}
            }}
            
            handleWebSocketMessage(data) {{
                switch(data.type) {{
                    case 'initial_state':
                        this.handleInitialState(data);
                        break;
                    case 'metric_update':
                        this.handleMetricUpdate(data);
                        break;
                    case 'visualization_update':
                        this.handleVisualizationUpdate(data);
                        break;
                    case 'alert':
                        this.handleAlert(data);
                        break;
                    case 'pong':
                        console.log('🏓 Pong received');
                        break;
                }}
            }}
            
            handleInitialState(data) {{
                console.log('📊 Initial dashboard state received');
                this.metrics = data.metrics;
                this.renderMetrics();
                this.renderVisualizations(data.visualizations);
                this.renderAlerts(data.alerts);
            }}
            
            handleMetricUpdate(data) {{
                const metric = data.metric;
                this.metrics[metric.metric_id] = metric;
                this.updateMetricDisplay(metric);
            }}
            
            handleVisualizationUpdate(data) {{
                const viz = data.visualization;
                this.updateVisualization(viz);
            }}
            
            handleAlert(data) {{
                const alert = data.alert;
                this.addAlert(alert);
            }}
            
            renderMetrics() {{
                const grid = document.getElementById('metricsGrid');
                grid.innerHTML = '';
                
                Object.values(this.metrics).forEach(metric => {{
                    const card = this.createMetricCard(metric);
                    grid.appendChild(card);
                }});
            }}
            
            createMetricCard(metric) {{
                const card = document.createElement('div');
                card.className = 'metric-card';
                card.id = `metric-${{metric.metric_id}}`;
                
                const trendIcon = metric.trend === 'up' ? '📈' : 
                                 metric.trend === 'down' ? '📉' : '➡️';
                
                card.innerHTML = `
                    <h3>${{trendIcon}} ${{metric.name}}</h3>
                    <div class="metric-value">${{metric.value}}</div>
                    <div class="metric-unit">${{metric.unit}}</div>
                `;
                
                return card;
            }}
            
            updateMetricDisplay(metric) {{
                const card = document.getElementById(`metric-${{metric.metric_id}}`);
                if (card) {{
                    const valueEl = card.querySelector('.metric-value');
                    if (valueEl) {{
                        valueEl.textContent = metric.value;
                        valueEl.style.animation = 'pulse 0.5s ease-in-out';
                        setTimeout(() => {{
                            valueEl.style.animation = '';
                        }}, 500);
                    }}
                }}
            }}
            
            renderVisualizations(visualizations) {{
                const grid = document.getElementById('visualizationsGrid');
                grid.innerHTML = '';
                
                Object.values(visualizations).forEach(viz => {{
                    const card = this.createVisualizationCard(viz);
                    grid.appendChild(card);
                }});
            }}
            
            createVisualizationCard(viz) {{
                const card = document.createElement('div');
                card.className = 'visualization-card';
                
                card.innerHTML = `
                    <h3>${{viz.title}}</h3>
                    <canvas id="chart-${{viz.visualization_id}}"></canvas>
                `;
                
                // Create chart after DOM insertion
                setTimeout(() => {{
                    this.createChart(viz);
                }}, 100);
                
                return card;
            }}
            
            createChart(viz) {{
                const canvas = document.getElementById(`chart-${{viz.visualization_id}}`);
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
                
                let chartConfig = {{
                    type: viz.chart_type,
                    data: viz.data,
                    options: {{
                        ...viz.config,
                        maintainAspectRatio: false,
                        height: 250
                    }}
                }};
                
                this.charts[viz.visualization_id] = new Chart(ctx, chartConfig);
            }}
            
            updateVisualization(viz) {{
                const chart = this.charts[viz.visualization_id];
                if (chart) {{
                    chart.data = viz.data;
                    chart.update('none');
                }}
            }}
            
            renderAlerts(alerts) {{
                const container = document.getElementById('alertsList');
                container.innerHTML = '';
                
                if (alerts.length === 0) {{
                    container.innerHTML = '<p style="color: #28a745;">✅ Nu există alerte active</p>';
                    return;
                }}
                
                alerts.forEach(alert => {{
                    const alertEl = this.createAlertElement(alert);
                    container.appendChild(alertEl);
                }});
            }}
            
            createAlertElement(alert) {{
                const alertDiv = document.createElement('div');
                alertDiv.className = `alert-item ${{alert.severity}}`;
                
                const severityEmoji = {{
                    'info': 'ℹ️',
                    'warning': '⚠️',
                    'error': '❌',
                    'critical': '🚨'
                }}[alert.severity] || 'ℹ️';
                
                alertDiv.innerHTML = `
                    <strong>${{severityEmoji}} ${{alert.title}}</strong><br>
                    ${{alert.message}}
                    <small style="color: #666; display: block; margin-top: 5px;">
                        ${{new Date(alert.timestamp).toLocaleString('ro-RO')}}
                    </small>
                `;
                
                return alertDiv;
            }}
            
            addAlert(alert) {{
                const container = document.getElementById('alertsList');
                const alertEl = this.createAlertElement(alert);
                container.insertBefore(alertEl, container.firstChild);
                
                // Auto-remove after 10 seconds for non-critical alerts
                if (alert.severity !== 'critical' && alert.auto_dismiss) {{
                    setTimeout(() => {{
                        if (alertEl.parentNode) {{
                            alertEl.remove();
                        }}
                    }}, 10000);
                }}
            }}
            
            updateConnectionStatus(connected) {{
                const indicator = document.getElementById('connectionStatus');
                const text = document.getElementById('connectionText');
                
                if (connected) {{
                    indicator.style.background = '#28a745';
                    text.textContent = 'Conectat';
                }} else {{
                    indicator.style.background = '#dc3545';
                    text.textContent = 'Deconectat';
                }}
            }}
            
            setupEventListeners() {{
                // Ping server every 30 seconds
                setInterval(() => {{
                    if (this.isConnected) {{
                        this.ws.send(JSON.stringify({{
                            type: 'ping',
                            timestamp: new Date().toISOString()
                        }}));
                    }}
                }}, 30000);
            }}
        }}
        
        // Initialize dashboard when page loads
        document.addEventListener('DOMContentLoaded', () => {{
            window.dashboard = new RomAIDashboard();
        }});
    </script>
</body>
</html>
        """
    
    async def _get_metrics_api(self, request):
        """API endpoint for getting metrics."""
        metrics_data = {
            metric_id: {
                **asdict(metric),
                "timestamp": metric.timestamp.isoformat()
            }
            for metric_id, metric in self.live_metrics.items()
        }
        
        return web.json_response(metrics_data)
    
    async def _get_visualizations_api(self, request):
        """API endpoint for getting visualizations."""
        viz_data = {
            viz_id: {
                **asdict(viz),
                "last_updated": viz.last_updated.isoformat()
            }
            for viz_id, viz in self.visualizations.items()
        }
        
        return web.json_response(viz_data)
    
    async def _get_alerts_api(self, request):
        """API endpoint for getting alerts."""
        alerts_data = [
            {
                **asdict(alert),
                "timestamp": alert.timestamp.isoformat()
            }
            for alert in self.alerts[-20:]  # Last 20 alerts
        ]
        
        return web.json_response(alerts_data)
    
    async def _acknowledge_alert_api(self, request):
        """API endpoint for acknowledging alerts."""
        alert_id = request.match_info['alert_id']
        
        for alert in self.alerts:
            if alert.alert_id == alert_id:
                alert.acknowledged = True
                break
        
        return web.json_response({"status": "acknowledged"})
    
    async def _get_cultural_trends_api(self, request):
        """API endpoint for getting Romanian cultural trends."""
        # This would typically fetch from analytics engine
        cultural_data = {
            "top_entities": [
                ("Ștefan cel Mare", 15),
                ("Transilvania", 12),
                ("mămăligă", 8),
                ("Eminescu", 7),
                ("colinde", 5)
            ],
            "regional_distribution": {
                "Transilvania": 35,
                "Moldova": 28,
                "Muntenia": 22,
                "Oltenia": 10,
                "Dobrogea": 5
            },
            "sentiment_analysis": {
                "pozitiv": 45,
                "neutru": 35,
                "negativ": 10,
                "mândrie_culturală": 8,
                "nostalgie": 2
            },
            "language_features": {
                "cu_diacritice": 78,
                "formal": 45,
                "specific_românesc": 32
            }
        }
        
        return web.json_response(cultural_data)
    
    async def _get_agent_performance_api(self, request):
        """API endpoint for getting agent performance data."""
        # This would typically fetch from orchestrator
        performance_data = {
            "agents": [
                {
                    "agent_id": "romanian_language_specialist",
                    "name": "Specialist Română",
                    "performance_score": 98.5,
                    "tasks_completed": 45,
                    "success_rate": 97.8,
                    "cultural_accuracy": 99.2,
                    "status": "active"
                },
                {
                    "agent_id": "cultural_context_agent",
                    "name": "Agent Context Cultural",
                    "performance_score": 96.2,
                    "tasks_completed": 38,
                    "success_rate": 94.7,
                    "cultural_accuracy": 98.1,
                    "status": "active"
                },
                {
                    "agent_id": "technical_implementation_agent",
                    "name": "Agent Implementare Tehnică",
                    "performance_score": 92.8,
                    "tasks_completed": 52,
                    "success_rate": 96.2,
                    "cultural_accuracy": 85.3,
                    "status": "active"
                }
            ],
            "overall_performance": 95.8,
            "total_tasks": 135,
            "success_rate": 96.2
        }
        
        return web.json_response(performance_data)
    
    # Data management methods
    async def _add_metric(self, metric: DashboardMetric):
        """Add or update a dashboard metric."""
        self.live_metrics[metric.metric_id] = metric
        
        # Broadcast to connected clients
        await self._broadcast_metric_update(metric)
        
        # Store in CBD
        await self._store_metric_in_cbd(metric)
    
    async def update_metric(self, metric_id: str, value: Any, trend: str = "stable"):
        """Update a metric value."""
        if metric_id in self.live_metrics:
            metric = self.live_metrics[metric_id]
            old_value = metric.value
            metric.value = value
            metric.trend = trend
            metric.timestamp = datetime.now()
            
            # Calculate cultural relevance for certain metrics
            if "cultural" in metric_id.lower() or "romanian" in metric_id.lower():
                metric.cultural_relevance = 1.0
            
            await self._broadcast_metric_update(metric)
            await self._store_metric_in_cbd(metric)
            
            # Generate alert if significant change
            if isinstance(value, (int, float)) and isinstance(old_value, (int, float)):
                change_percent = abs((value - old_value) / old_value) if old_value != 0 else 0
                if change_percent > 0.2:  # 20% change
                    await self._create_alert(
                        component=metric.component,
                        severity="warning" if change_percent < 0.5 else "error",
                        title=f"Schimbare Semnificativă în {metric.name}",
                        message=f"Valoarea a trecut de la {old_value} la {value} ({change_percent:.1%} schimbare)",
                        cultural_context="Monitorizare automată sistem"
                    )
    
    async def update_visualization(self, viz_id: str, data: Dict[str, Any]):
        """Update visualization data."""
        if viz_id in self.visualizations:
            viz = self.visualizations[viz_id]
            viz.data = data
            viz.last_updated = datetime.now()
            
            await self._broadcast_visualization_update(viz)
    
    async def _create_alert(self, component: DashboardComponent, severity: str, 
                          title: str, message: str, cultural_context: str = None):
        """Create a new dashboard alert."""
        alert = DashboardAlert(
            alert_id=f"alert_{int(time.time() * 1000)}",
            component=component,
            severity=severity,
            title=title,
            message=message,
            cultural_context=cultural_context,
            timestamp=datetime.now()
        )
        
        self.alerts.append(alert)
        
        # Keep only last 100 alerts
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
        
        await self._broadcast_alert(alert)
        await self._store_alert_in_cbd(alert)
    
    # Broadcasting methods
    async def _broadcast_metric_update(self, metric: DashboardMetric):
        """Broadcast metric update to connected clients."""
        message = {
            "type": "metric_update",
            "metric": {
                **asdict(metric),
                "timestamp": metric.timestamp.isoformat()
            }
        }
        
        await self._broadcast_to_subscribers(metric.component, message)
    
    async def _broadcast_visualization_update(self, viz: LiveVisualization):
        """Broadcast visualization update to connected clients."""
        message = {
            "type": "visualization_update",
            "visualization": {
                **asdict(viz),
                "last_updated": viz.last_updated.isoformat()
            }
        }
        
        await self._broadcast_to_all_clients(message)
    
    async def _broadcast_alert(self, alert: DashboardAlert):
        """Broadcast alert to connected clients."""
        message = {
            "type": "alert",
            "alert": {
                **asdict(alert),
                "timestamp": alert.timestamp.isoformat()
            }
        }
        
        await self._broadcast_to_subscribers(alert.component, message)
    
    async def _broadcast_to_all_clients(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients."""
        if not self.dashboard_connections:
            return
        
        message_str = json.dumps(message)
        disconnected = []
        
        for connection_id, ws in self.dashboard_connections.items():
            try:
                await ws.send_str(message_str)
            except Exception as e:
                logger.error(f"❌ Failed to send to {connection_id}: {str(e)}")
                disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            if connection_id in self.dashboard_connections:
                del self.dashboard_connections[connection_id]
            if connection_id in self.connection_subscriptions:
                del self.connection_subscriptions[connection_id]
    
    async def _broadcast_to_subscribers(self, component: DashboardComponent, message: Dict[str, Any]):
        """Broadcast message to clients subscribed to specific component."""
        if not self.dashboard_connections:
            return
        
        message_str = json.dumps(message)
        disconnected = []
        
        for connection_id, ws in self.dashboard_connections.items():
            # Check if client is subscribed to this component
            if connection_id in self.connection_subscriptions:
                if component in self.connection_subscriptions[connection_id]:
                    try:
                        await ws.send_str(message_str)
                    except Exception as e:
                        logger.error(f"❌ Failed to send to {connection_id}: {str(e)}")
                        disconnected.append(connection_id)
        
        # Clean up disconnected clients
        for connection_id in disconnected:
            if connection_id in self.dashboard_connections:
                del self.dashboard_connections[connection_id]
            if connection_id in self.connection_subscriptions:
                del self.connection_subscriptions[connection_id]
    
    async def _send_component_update(self, connection_id: str, component: DashboardComponent):
        """Send specific component update to client."""
        if connection_id not in self.dashboard_connections:
            return
        
        # Get component-specific data
        component_data = {}
        
        if component == DashboardComponent.REAL_TIME_METRICS:
            component_data = {
                metric_id: asdict(metric) for metric_id, metric in self.live_metrics.items()
                if metric.component == component
            }
        elif component == DashboardComponent.CULTURAL_INSIGHTS:
            # Get cultural-specific visualizations and metrics
            cultural_viz = {
                viz_id: asdict(viz) for viz_id, viz in self.visualizations.items()
                if viz.romanian_context is not None
            }
            component_data = {"visualizations": cultural_viz}
        
        message = {
            "type": "component_update",
            "component": component.value,
            "data": component_data,
            "timestamp": datetime.now().isoformat()
        }
        
        try:
            await self.dashboard_connections[connection_id].send_str(json.dumps(message))
        except Exception as e:
            logger.error(f"❌ Failed to send component update to {connection_id}: {str(e)}")
    
    # Background update schedulers
    async def _update_scheduler(self, frequency: UpdateFrequency):
        """Background scheduler for updating dashboard data."""
        interval = frequency.value
        
        while self.is_running:
            try:
                # Update metrics that match this frequency
                metrics_to_update = [
                    metric for metric in self.live_metrics.values()
                    if metric.update_frequency == frequency
                ]
                
                for metric in metrics_to_update:
                    await self._refresh_metric_data(metric)
                
                # Update visualizations
                if frequency == UpdateFrequency.HIGH:
                    await self._refresh_visualizations()
                
                await asyncio.sleep(interval)
                
            except Exception as e:
                logger.error(f"❌ Update scheduler error ({frequency.name}): {str(e)}")
                await asyncio.sleep(interval)
    
    async def _refresh_metric_data(self, metric: DashboardMetric):
        """Refresh metric data from data sources."""
        try:
            # Simulate data refresh - in real implementation, this would fetch from actual sources
            if metric.metric_id == "system_uptime":
                # Calculate actual uptime
                uptime = (datetime.now() - metric.timestamp).total_seconds()
                await self.update_metric("system_uptime", int(uptime), "up")
            
            elif metric.metric_id == "active_agents":
                # This would fetch from agent orchestrator
                await self.update_metric("active_agents", 5, "stable")
            
            elif metric.metric_id == "cultural_score":
                # This would fetch from analytics engine
                import random
                score = random.uniform(0.7, 0.95)  # Simulate high cultural scores
                await self.update_metric("cultural_score", round(score, 2), "up")
            
            elif metric.metric_id == "streams_processed":
                # This would fetch from streaming analytics
                current_value = metric.value
                new_value = current_value + random.randint(0, 5)
                await self.update_metric("streams_processed", new_value, "up")
        
        except Exception as e:
            logger.error(f"❌ Error refreshing metric {metric.metric_id}: {str(e)}")
    
    async def _refresh_visualizations(self):
        """Refresh visualization data."""
        try:
            # Update cultural trends pie chart
            if "cultural_trends_pie" in self.visualizations:
                # Simulate cultural category data
                import random
                categories = self.cultural_dashboard_elements["cultural_categories"]
                data = [random.randint(5, 25) for _ in categories]
                
                new_data = {
                    "labels": categories,
                    "datasets": [{
                        "data": data,
                        "backgroundColor": [
                            "#CE1126", "#FCD116", "#002B7F", "#28a745", "#ffc107",
                            "#dc3545", "#17a2b8", "#6f42c1", "#fd7e14", "#20c997"
                        ]
                    }]
                }
                
                await self.update_visualization("cultural_trends_pie", new_data)
            
            # Update agent performance timeline
            if "agent_performance_timeline" in self.visualizations:
                # Add new data point
                viz = self.visualizations["agent_performance_timeline"]
                current_time = datetime.now().strftime("%H:%M")
                
                viz.data["labels"].append(current_time)
                
                # Simulate performance data
                import random
                for dataset in viz.data["datasets"]:
                    performance = random.uniform(85, 99)
                    dataset["data"].append(performance)
                
                # Keep only last 20 data points
                if len(viz.data["labels"]) > 20:
                    viz.data["labels"] = viz.data["labels"][-20:]
                    for dataset in viz.data["datasets"]:
                        dataset["data"] = dataset["data"][-20:]
                
                await self.update_visualization("agent_performance_timeline", viz.data)
        
        except Exception as e:
            logger.error(f"❌ Error refreshing visualizations: {str(e)}")
    
    # CBD storage methods
    async def _store_metric_in_cbd(self, metric: DashboardMetric):
        """Store metric in CBD."""
        try:
            metric_data = {
                "collection": "romai_dashboard_metrics",
                "document": {
                    **asdict(metric),
                    "timestamp": metric.timestamp.isoformat()
                }
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=metric_data) as response:
                if response.status == 200:
                    logger.debug(f"✅ Metric {metric.metric_id} stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing metric in CBD: {str(e)}")
    
    async def _store_alert_in_cbd(self, alert: DashboardAlert):
        """Store alert in CBD."""
        try:
            alert_data = {
                "collection": "romai_dashboard_alerts",
                "document": {
                    **asdict(alert),
                    "timestamp": alert.timestamp.isoformat()
                }
            }
            
            async with self.session.post(f"{self.cbd_url}/document", json=alert_data) as response:
                if response.status == 200:
                    logger.debug(f"✅ Alert {alert.alert_id} stored in CBD")
        
        except Exception as e:
            logger.error(f"❌ Error storing alert in CBD: {str(e)}")
    
    def get_dashboard_status(self) -> Dict[str, Any]:
        """Get current dashboard status."""
        return {
            "server_info": {
                "host": self.host,
                "port": self.port,
                "running": self.is_running,
                "connections": len(self.dashboard_connections)
            },
            "metrics": {
                "total_metrics": len(self.live_metrics),
                "visualizations": len(self.visualizations),
                "active_alerts": len([a for a in self.alerts if not a.acknowledged]),
                "cultural_metrics": len([m for m in self.live_metrics.values() if m.cultural_relevance > 0.5])
            },
            "performance": {
                "update_frequencies": {freq.name: freq.value for freq in UpdateFrequency},
                "last_update": max([m.timestamp for m in self.live_metrics.values()]).isoformat() if self.live_metrics else None
            },
            "cultural_features": {
                "romanian_theme": True,
                "supported_regions": self.cultural_dashboard_elements["romanian_regions"],
                "cultural_categories": self.cultural_dashboard_elements["cultural_categories"]
            }
        }
    
    async def cleanup(self):
        """Cleanup dashboard resources."""
        self.is_running = False
        
        # Cancel update tasks
        for task in self.update_tasks.values():
            task.cancel()
        
        # Close WebSocket connections
        for ws in self.dashboard_connections.values():
            try:
                await ws.close()
            except:
                pass
        
        # Cleanup server
        await self._cleanup_server()
        
        if self.session:
            await self.session.close()
        
        logger.info("🧹 Live Dashboard System cleanup completed")

# Example usage and testing
async def test_live_dashboard():
    """Test the live dashboard system."""
    logger.info("🚀 Testing Live Dashboard System")
    
    dashboard = LiveDashboardSystem()
    
    try:
        await dashboard.initialize()
        
        # Start server in background
        server_task = asyncio.create_task(dashboard.start_server())
        
        # Wait for server to start
        await asyncio.sleep(2)
        
        # Simulate some metric updates
        await dashboard.update_metric("active_agents", 7, "up")
        await dashboard.update_metric("cultural_score", 0.92, "up")
        await dashboard.update_metric("streams_processed", 150, "up")
        
        # Create test alert
        await dashboard._create_alert(
            component=DashboardComponent.CULTURAL_INSIGHTS,
            severity="info",
            title="Test Cultural Alert",
            message="Sistem detectează activitate culturală crescută în Transilvania",
            cultural_context="Test monitoring"
        )
        
        # Get dashboard status
        status = dashboard.get_dashboard_status()
        logger.info("📊 Dashboard Status:")
        logger.info(f"Connections: {status['server_info']['connections']}")
        logger.info(f"Total Metrics: {status['metrics']['total_metrics']}")
        logger.info(f"Visualizations: {status['metrics']['visualizations']}")
        logger.info(f"Cultural Metrics: {status['metrics']['cultural_metrics']}")
        logger.info(f"Romanian Theme: {status['cultural_features']['romanian_theme']}")
        
        logger.info(f"🌐 Dashboard available at: http://{dashboard.host}:{dashboard.port}")
        logger.info("🎨 Romanian cultural theme applied with tricolor design")
        
        # Run for a short time to test real-time updates
        await asyncio.sleep(5)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Dashboard test failed: {str(e)}")
        return False
    finally:
        await dashboard.cleanup()

if __name__ == "__main__":
    print("🚀 RomAI AGI - Live Dashboard System v3.0.0")
    print("=" * 50)
    asyncio.run(test_live_dashboard())
