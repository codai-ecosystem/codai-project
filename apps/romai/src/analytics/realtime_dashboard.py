"""
🧠 RomAI Real-Time Performance Dashboard
=======================================

Phase 2.5: Advanced Analytics & Reporting - Real-Time Dashboard Component
Week 9 (Days 155-161) - Real-time performance analytics dashboard

This module provides a real-time performance dashboard for monitoring RomAI AGI platform
metrics, system health, AI performance, and business intelligence in real-time.

Features:
- Real-time metrics visualization
- Interactive dashboard interface
- WebSocket-based live updates
- Custom metric filtering and analysis
- Alert notifications and monitoring
- Performance trending and forecasting
- System health monitoring
- Business intelligence dashboards

Author: RomAI Development Team
Date: August 12, 2025
License: Proprietary
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import websockets
import threading
from concurrent.futures import ThreadPoolExecutor

# Dashboard and visualization imports
try:
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.responses import HTMLResponse, JSONResponse
    from fastapi.staticfiles import StaticFiles
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    logging.warning("FastAPI not available - web dashboard will be disabled")

try:
    import plotly.graph_objects as go
    import plotly.express as px
    from plotly.utils import PlotlyJSONEncoder
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    logging.warning("Plotly not available - advanced visualizations will be disabled")

from .advanced_analytics_engine import (
    AdvancedAnalyticsEngine, 
    SystemHealthMetrics, 
    AIPerformanceMetrics, 
    BusinessMetrics,
    AnalyticsMetric,
    AnalyticsMetricType
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DashboardUpdate(Enum):
    """Types of dashboard updates"""
    METRICS = "metrics"
    HEALTH = "health"
    AI_PERFORMANCE = "ai_performance"
    BUSINESS = "business"
    ALERTS = "alerts"
    SYSTEM_STATUS = "system_status"

@dataclass
class DashboardWidget:
    """Dashboard widget configuration"""
    id: str
    title: str
    widget_type: str  # "metric", "chart", "table", "status"
    data_source: str
    refresh_interval: int  # seconds
    config: Dict[str, Any]
    position: Dict[str, int]  # x, y, width, height

@dataclass
class WebSocketConnection:
    """WebSocket connection tracking"""
    websocket: Any
    user_id: str
    connected_at: datetime
    subscriptions: List[str]
    last_ping: datetime

class RealTimeDashboard:
    """
    Real-Time Performance Dashboard for RomAI AGI Platform
    
    Provides real-time monitoring capabilities including:
    - Live metrics streaming via WebSocket
    - Interactive web dashboard interface
    - Customizable widgets and layouts
    - Alert notifications and monitoring
    - Performance trending and analysis
    """
    
    def __init__(self, 
                 analytics_engine: AdvancedAnalyticsEngine,
                 port: int = 8002,
                 host: str = "localhost"):
        """
        Initialize the Real-Time Dashboard
        
        Args:
            analytics_engine: Instance of AdvancedAnalyticsEngine
            port: Port number for the web dashboard
            host: Host address for the web dashboard
        """
        self.analytics_engine = analytics_engine
        self.port = port
        self.host = host
        
        # WebSocket connection management
        self.active_connections: Dict[str, WebSocketConnection] = {}
        self.connection_lock = threading.Lock()
        
        # Dashboard configuration
        self.widgets: Dict[str, DashboardWidget] = {}
        self.update_subscriptions: Dict[str, List[str]] = {}
        
        # Performance tracking
        self.update_stats = {
            "total_updates": 0,
            "last_update": None,
            "average_update_time": 0.0,
            "active_subscriptions": 0
        }
        
        # Initialize FastAPI app if available
        if FASTAPI_AVAILABLE:
            self.app = self._create_fastapi_app()
        else:
            self.app = None
            logger.warning("FastAPI not available - web dashboard disabled")
        
        # Load default widgets
        self._load_default_widgets()
        
        logger.info(f"Real-Time Dashboard initialized on {host}:{port}")

    def _create_fastapi_app(self) -> FastAPI:
        """Create and configure FastAPI application"""
        app = FastAPI(
            title="RomAI Real-Time Dashboard",
            description="Advanced Analytics & Performance Monitoring Dashboard",
            version="2.5.0"
        )
        
        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Add dashboard routes
        self._add_dashboard_routes(app)
        
        return app

    def _add_dashboard_routes(self, app: FastAPI):
        """Add dashboard API routes"""
        
        @app.get("/", response_class=HTMLResponse)
        async def dashboard_home():
            """Main dashboard page"""
            return self._generate_dashboard_html()
        
        @app.get("/api/dashboard/status")
        async def get_dashboard_status():
            """Get dashboard status and statistics"""
            return {
                "status": "operational",
                "active_connections": len(self.active_connections),
                "total_widgets": len(self.widgets),
                "update_stats": self.update_stats,
                "timestamp": datetime.now().isoformat()
            }
        
        @app.get("/api/dashboard/data")
        async def get_dashboard_data():
            """Get current dashboard data"""
            return await self.analytics_engine.get_dashboard_data()
        
        @app.get("/api/dashboard/widgets")
        async def get_widgets():
            """Get dashboard widget configurations"""
            return {
                "widgets": [asdict(widget) for widget in self.widgets.values()],
                "count": len(self.widgets)
            }
        
        @app.post("/api/dashboard/widgets")
        async def create_widget(widget_data: dict):
            """Create new dashboard widget"""
            widget = DashboardWidget(**widget_data)
            self.widgets[widget.id] = widget
            return {"status": "created", "widget_id": widget.id}
        
        @app.get("/api/metrics/recent")
        async def get_recent_metrics(limit: int = 100):
            """Get recent analytics metrics"""
            metrics = await self.analytics_engine.get_metrics(limit=limit)
            return {
                "metrics": [metric.to_dict() for metric in metrics],
                "count": len(metrics)
            }
        
        @app.get("/api/health/system")
        async def get_system_health():
            """Get current system health metrics"""
            health = SystemHealthMetrics.collect_current_metrics()
            return asdict(health)
        
        @app.get("/api/reports/generate/{report_type}")
        async def generate_report_endpoint(report_type: str, format: str = "json"):
            """Generate analytics report"""
            from .advanced_analytics_engine import ReportFormat
            
            try:
                report_format = ReportFormat(format.lower())
                report = await self.analytics_engine.generate_report(report_type, report_format)
                return report
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid format: {format}")
        
        @app.websocket("/ws/dashboard/{user_id}")
        async def websocket_endpoint(websocket: WebSocket, user_id: str):
            """WebSocket endpoint for real-time updates"""
            await self._handle_websocket_connection(websocket, user_id)

    def _load_default_widgets(self):
        """Load default dashboard widgets"""
        default_widgets = [
            DashboardWidget(
                id="system_health_overview",
                title="System Health Overview",
                widget_type="metric",
                data_source="system_health",
                refresh_interval=5,
                config={
                    "metrics": ["cpu_usage", "memory_usage", "disk_usage"],
                    "display_type": "gauge",
                    "alert_thresholds": {"cpu_usage": 80, "memory_usage": 85, "disk_usage": 90}
                },
                position={"x": 0, "y": 0, "width": 4, "height": 2}
            ),
            
            DashboardWidget(
                id="ai_performance_metrics",
                title="AI Performance Metrics",
                widget_type="chart",
                data_source="ai_performance",
                refresh_interval=10,
                config={
                    "chart_type": "line",
                    "metrics": ["model_accuracy", "romanian_cultural_score", "response_quality"],
                    "time_window": "1h"
                },
                position={"x": 4, "y": 0, "width": 8, "height": 4}
            ),
            
            DashboardWidget(
                id="business_intelligence",
                title="Business Intelligence",
                widget_type="table",
                data_source="business_metrics",
                refresh_interval=30,
                config={
                    "metrics": ["daily_active_users", "api_requests_count", "revenue_eur", "customer_satisfaction"],
                    "display_format": "summary"
                },
                position={"x": 0, "y": 2, "width": 4, "height": 2}
            ),
            
            DashboardWidget(
                id="real_time_alerts",
                title="Real-Time Alerts",
                widget_type="status",
                data_source="alerts",
                refresh_interval=1,
                config={
                    "severity_levels": ["critical", "high", "medium", "low"],
                    "max_alerts": 10,
                    "auto_clear": True
                },
                position={"x": 8, "y": 4, "width": 4, "height": 2}
            )
        ]
        
        for widget in default_widgets:
            self.widgets[widget.id] = widget

    def _generate_dashboard_html(self) -> str:
        """Generate HTML for the dashboard interface"""
        return """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>RomAI Real-Time Dashboard</title>
            <script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    gap: 1rem;
                    padding: 1rem;
                }
                .widget {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 12px;
                    padding: 1rem;
                    color: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .metric-value {
                    font-size: 2rem;
                    font-weight: bold;
                    margin: 0.5rem 0;
                }
                .metric-label {
                    font-size: 0.875rem;
                    opacity: 0.8;
                }
                .status-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    display: inline-block;
                    margin-right: 8px;
                }
                .status-online { background-color: #10b981; }
                .status-warning { background-color: #f59e0b; }
                .status-error { background-color: #ef4444; }
                .connection-status {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                .connected { background-color: #10b981; color: white; }
                .disconnected { background-color: #ef4444; color: white; }
            </style>
        </head>
        <body class="bg-gray-100">
            <!-- Header -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center h-16">
                        <div class="flex items-center">
                            <h1 class="text-2xl font-bold text-gray-900">🧠 RomAI Dashboard</h1>
                            <span class="ml-4 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">v2.5</span>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div id="connection-status" class="connection-status disconnected">Connecting...</div>
                            <button onclick="refreshDashboard()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Dashboard Grid -->
            <main class="dashboard-grid">
                <!-- System Health Widget -->
                <div class="widget" style="grid-column: span 4; grid-row: span 2;">
                    <h3 class="text-lg font-semibold mb-4">🖥️ System Health</h3>
                    <div id="system-health-content">
                        <div class="grid grid-cols-3 gap-4">
                            <div class="text-center">
                                <div class="metric-value" id="cpu-usage">--</div>
                                <div class="metric-label">CPU Usage</div>
                            </div>
                            <div class="text-center">
                                <div class="metric-value" id="memory-usage">--</div>
                                <div class="metric-label">Memory</div>
                            </div>
                            <div class="text-center">
                                <div class="metric-value" id="disk-usage">--</div>
                                <div class="metric-label">Disk</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AI Performance Widget -->
                <div class="widget" style="grid-column: span 8; grid-row: span 4;">
                    <h3 class="text-lg font-semibold mb-4">🤖 AI Performance</h3>
                    <div id="ai-performance-chart" style="height: 300px;"></div>
                </div>

                <!-- Business Metrics Widget -->
                <div class="widget" style="grid-column: span 4; grid-row: span 2;">
                    <h3 class="text-lg font-semibold mb-4">💼 Business Metrics</h3>
                    <div id="business-metrics-content">
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span>Daily Active Users:</span>
                                <span id="daily-users" class="font-semibold">--</span>
                            </div>
                            <div class="flex justify-between">
                                <span>API Requests:</span>
                                <span id="api-requests" class="font-semibold">--</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Revenue (EUR):</span>
                                <span id="revenue" class="font-semibold">--</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Satisfaction:</span>
                                <span id="satisfaction" class="font-semibold">--</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Real-Time Alerts Widget -->
                <div class="widget" style="grid-column: span 4; grid-row: span 2;">
                    <h3 class="text-lg font-semibold mb-4">🚨 Real-Time Alerts</h3>
                    <div id="alerts-content">
                        <div class="space-y-2">
                            <div class="text-sm opacity-80">No active alerts</div>
                        </div>
                    </div>
                </div>
            </main>

            <script>
                // WebSocket connection
                let ws = null;
                let reconnectInterval = null;

                function connectWebSocket() {
                    const userId = 'dashboard_' + Math.random().toString(36).substr(2, 9);
                    const wsUrl = `ws://${window.location.host}/ws/dashboard/${userId}`;
                    
                    ws = new WebSocket(wsUrl);
                    
                    ws.onopen = function(event) {
                        console.log('Connected to WebSocket');
                        updateConnectionStatus(true);
                        if (reconnectInterval) {
                            clearInterval(reconnectInterval);
                            reconnectInterval = null;
                        }
                    };
                    
                    ws.onmessage = function(event) {
                        const data = JSON.parse(event.data);
                        handleRealtimeUpdate(data);
                    };
                    
                    ws.onclose = function(event) {
                        console.log('WebSocket connection closed');
                        updateConnectionStatus(false);
                        // Attempt to reconnect
                        if (!reconnectInterval) {
                            reconnectInterval = setInterval(connectWebSocket, 5000);
                        }
                    };
                    
                    ws.onerror = function(error) {
                        console.error('WebSocket error:', error);
                        updateConnectionStatus(false);
                    };
                }

                function updateConnectionStatus(connected) {
                    const statusElement = document.getElementById('connection-status');
                    if (connected) {
                        statusElement.textContent = '● Connected';
                        statusElement.className = 'connection-status connected';
                    } else {
                        statusElement.textContent = '● Disconnected';
                        statusElement.className = 'connection-status disconnected';
                    }
                }

                function handleRealtimeUpdate(data) {
                    console.log('Received update:', data);
                    
                    if (data.type === 'dashboard_data') {
                        updateDashboardWidgets(data.payload);
                    } else if (data.type === 'system_health') {
                        updateSystemHealth(data.payload);
                    } else if (data.type === 'ai_performance') {
                        updateAIPerformance(data.payload);
                    } else if (data.type === 'business_metrics') {
                        updateBusinessMetrics(data.payload);
                    }
                }

                function updateSystemHealth(data) {
                    document.getElementById('cpu-usage').textContent = `${data.cpu_usage.toFixed(1)}%`;
                    document.getElementById('memory-usage').textContent = `${data.memory_usage.toFixed(1)}%`;
                    document.getElementById('disk-usage').textContent = `${data.disk_usage.toFixed(1)}%`;
                }

                function updateAIPerformance(data) {
                    // Create sample performance chart
                    const trace1 = {
                        x: ['Accuracy', 'Cultural Score', 'Quality', 'Speed'],
                        y: [data.model_accuracy, data.romanian_cultural_score, data.response_quality * 20, data.tokens_per_second / 2],
                        type: 'bar',
                        marker: { color: ['#667eea', '#764ba2', '#f093fb', '#f5576c'] }
                    };
                    
                    const layout = {
                        title: 'AI Performance Metrics',
                        paper_bgcolor: 'rgba(0,0,0,0)',
                        plot_bgcolor: 'rgba(0,0,0,0)',
                        font: { color: 'white' },
                        showlegend: false
                    };
                    
                    Plotly.newPlot('ai-performance-chart', [trace1], layout, {responsive: true});
                }

                function updateBusinessMetrics(data) {
                    document.getElementById('daily-users').textContent = data.daily_active_users.toLocaleString();
                    document.getElementById('api-requests').textContent = data.api_requests_count.toLocaleString();
                    document.getElementById('revenue').textContent = `€${data.revenue_eur.toLocaleString()}`;
                    document.getElementById('satisfaction').textContent = `${data.customer_satisfaction.toFixed(1)}/5.0`;
                }

                function updateDashboardWidgets(data) {
                    if (data.system_health) {
                        updateSystemHealth(data.system_health);
                    }
                    if (data.ai_performance) {
                        updateAIPerformance(data.ai_performance);
                    }
                    if (data.business_metrics) {
                        updateBusinessMetrics(data.business_metrics);
                    }
                }

                function refreshDashboard() {
                    fetch('/api/dashboard/data')
                        .then(response => response.json())
                        .then(data => updateDashboardWidgets(data))
                        .catch(error => console.error('Error refreshing dashboard:', error));
                }

                // Initialize dashboard
                document.addEventListener('DOMContentLoaded', function() {
                    connectWebSocket();
                    refreshDashboard();
                    
                    // Refresh every 30 seconds as fallback
                    setInterval(refreshDashboard, 30000);
                });
            </script>
        </body>
        </html>
        """

    async def _handle_websocket_connection(self, websocket: WebSocket, user_id: str):
        """Handle WebSocket connection for real-time updates"""
        await websocket.accept()
        
        # Create connection tracking
        connection = WebSocketConnection(
            websocket=websocket,
            user_id=user_id,
            connected_at=datetime.now(),
            subscriptions=["dashboard_data", "system_health", "ai_performance", "business_metrics"],
            last_ping=datetime.now()
        )
        
        with self.connection_lock:
            self.active_connections[user_id] = connection
        
        logger.info(f"WebSocket connection established: {user_id}")
        
        try:
            # Send initial dashboard data
            dashboard_data = await self.analytics_engine.get_dashboard_data()
            await websocket.send_text(json.dumps({
                "type": "dashboard_data",
                "payload": dashboard_data,
                "timestamp": datetime.now().isoformat()
            }))
            
            # Keep connection alive and handle messages
            while True:
                try:
                    # Wait for messages with timeout
                    message = await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                    data = json.loads(message)
                    
                    # Handle ping/pong for connection keepalive
                    if data.get("type") == "ping":
                        connection.last_ping = datetime.now()
                        await websocket.send_text(json.dumps({"type": "pong"}))
                    
                    # Handle subscription updates
                    elif data.get("type") == "subscribe":
                        subscriptions = data.get("subscriptions", [])
                        connection.subscriptions = subscriptions
                        logger.debug(f"Updated subscriptions for {user_id}: {subscriptions}")
                    
                except asyncio.TimeoutError:
                    # Send ping to check if connection is still alive
                    await websocket.send_text(json.dumps({"type": "ping"}))
                
        except WebSocketDisconnect:
            logger.info(f"WebSocket connection closed: {user_id}")
        except Exception as e:
            logger.error(f"WebSocket error for {user_id}: {e}")
        finally:
            with self.connection_lock:
                if user_id in self.active_connections:
                    del self.active_connections[user_id]

    async def broadcast_update(self, update_type: DashboardUpdate, data: Any):
        """Broadcast update to all connected WebSocket clients"""
        if not self.active_connections:
            return
        
        message = {
            "type": update_type.value,
            "payload": data,
            "timestamp": datetime.now().isoformat()
        }
        
        message_text = json.dumps(message)
        disconnected_connections = []
        
        with self.connection_lock:
            connections = list(self.active_connections.items())
        
        for user_id, connection in connections:
            try:
                if update_type.value in connection.subscriptions:
                    await connection.websocket.send_text(message_text)
            except Exception as e:
                logger.warning(f"Failed to send update to {user_id}: {e}")
                disconnected_connections.append(user_id)
        
        # Clean up disconnected connections
        if disconnected_connections:
            with self.connection_lock:
                for user_id in disconnected_connections:
                    if user_id in self.active_connections:
                        del self.active_connections[user_id]
        
        # Update statistics
        self.update_stats["total_updates"] += 1
        self.update_stats["last_update"] = datetime.now().isoformat()
        self.update_stats["active_subscriptions"] = len(self.active_connections)

    async def start_real_time_updates(self, interval_seconds: int = 5):
        """Start real-time update broadcasting"""
        logger.info(f"Starting real-time dashboard updates (interval: {interval_seconds}s)")
        
        while True:
            try:
                # Get current dashboard data
                dashboard_data = await self.analytics_engine.get_dashboard_data()
                
                # Broadcast to all connected clients
                await self.broadcast_update(DashboardUpdate.METRICS, dashboard_data)
                
                # Send specific metric updates
                if "system_health" in dashboard_data:
                    await self.broadcast_update(DashboardUpdate.HEALTH, dashboard_data["system_health"])
                
                if "ai_performance" in dashboard_data:
                    await self.broadcast_update(DashboardUpdate.AI_PERFORMANCE, dashboard_data["ai_performance"])
                
                if "business_metrics" in dashboard_data:
                    await self.broadcast_update(DashboardUpdate.BUSINESS, dashboard_data["business_metrics"])
                
            except Exception as e:
                logger.error(f"Error in real-time updates: {e}")
            
            await asyncio.sleep(interval_seconds)

    async def start_dashboard_server(self):
        """Start the dashboard web server"""
        if not FASTAPI_AVAILABLE:
            logger.error("FastAPI not available - cannot start dashboard server")
            return
        
        logger.info(f"Starting RomAI Real-Time Dashboard server on {self.host}:{self.port}")
        
        # Start real-time updates in background
        update_task = asyncio.create_task(self.start_real_time_updates())
        
        try:
            # Start the FastAPI server
            config = uvicorn.Config(
                app=self.app,
                host=self.host,
                port=self.port,
                log_level="info"
            )
            server = uvicorn.Server(config)
            await server.serve()
        except Exception as e:
            logger.error(f"Error starting dashboard server: {e}")
        finally:
            update_task.cancel()

    def run_dashboard(self):
        """Run the dashboard server (blocking)"""
        if not FASTAPI_AVAILABLE:
            logger.error("FastAPI not available - cannot run dashboard")
            return
        
        try:
            asyncio.run(self.start_dashboard_server())
        except KeyboardInterrupt:
            logger.info("Dashboard server stopped by user")
        except Exception as e:
            logger.error(f"Dashboard server error: {e}")

    async def add_custom_widget(self, widget: DashboardWidget):
        """Add custom widget to dashboard"""
        self.widgets[widget.id] = widget
        
        # Notify connected clients about new widget
        await self.broadcast_update(DashboardUpdate.SYSTEM_STATUS, {
            "message": f"New widget added: {widget.title}",
            "widget_id": widget.id,
            "action": "widget_added"
        })
        
        logger.info(f"Added custom widget: {widget.id}")

    def get_dashboard_statistics(self) -> Dict[str, Any]:
        """Get dashboard performance statistics"""
        with self.connection_lock:
            active_connections = len(self.active_connections)
        
        return {
            "active_connections": active_connections,
            "total_widgets": len(self.widgets),
            "update_stats": self.update_stats,
            "server_info": {
                "host": self.host,
                "port": self.port,
                "fastapi_available": FASTAPI_AVAILABLE,
                "plotly_available": PLOTLY_AVAILABLE
            },
            "uptime": "calculated_uptime",  # This would be calculated from start time
            "memory_usage": "calculated_memory",  # This would be calculated from system metrics
            "timestamp": datetime.now().isoformat()
        }

# Example usage and testing
async def main():
    """Example usage of the Real-Time Dashboard"""
    print("🧠 RomAI Real-Time Performance Dashboard - Testing")
    print("=" * 60)
    
    # Initialize analytics engine
    from .advanced_analytics_engine import AdvancedAnalyticsEngine
    analytics_engine = AdvancedAnalyticsEngine("romai_analytics.db")
    
    # Initialize dashboard
    dashboard = RealTimeDashboard(analytics_engine, port=8002)
    
    print("\n📊 Dashboard Statistics:")
    stats = dashboard.get_dashboard_statistics()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\n🚀 Starting dashboard server...")
    print(f"Dashboard URL: http://localhost:8002")
    print("Press Ctrl+C to stop the server")
    
    # Start the dashboard server
    await dashboard.start_dashboard_server()

if __name__ == "__main__":
    asyncio.run(main())
