"""
RomAI Real-Time Monitoring Dashboard
FastAPI-based dashboard for monitoring RomAI AGI system performance
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import asyncio
import json
import time
from datetime import datetime
from typing import List, Dict, Any
import aiohttp
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RomAI Monitoring Dashboard", version="1.0.0")

# Setup templates and static files
dashboard_dir = Path(__file__).parent
templates = Jinja2Templates(directory=dashboard_dir / "templates")
app.mount("/static", StaticFiles(directory=dashboard_dir / "static"), name="static")

# WebSocket connections for real-time updates
active_connections: List[WebSocket] = []

class DashboardMonitor:
    def __init__(self):
        self.monitoring_data = {
            'health_status': {},
            'performance_metrics': {},
            'system_metrics': {},
            'alerts': [],
            'last_update': None
        }
        
        # RomAI endpoints to monitor
        self.endpoints = {
            'romai_server': 'http://localhost:6101/health',
            'moe_status': 'http://localhost:6101/api/v1/moe/status',
            'enterprise_api': 'http://localhost:8001/api/v1/health',
            'memorai_mcp': 'http://localhost:4950/health'
        }
        
        self.performance_endpoints = {
            'math_reasoning': 'http://localhost:6101/api/v1/mathematical-reasoning/solve',
            'logic_reasoning': 'http://localhost:6101/api/v1/logical-reasoning/analyze',
            'romanian_intelligence': 'http://localhost:6101/api/v1/romanian-intelligence/chat'
        }

    async def check_endpoint_health(self, name: str, url: str) -> Dict[str, Any]:
        """Check health of a single endpoint"""
        start_time = time.time()
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    response_time = (time.time() - start_time) * 1000
                    data = await response.json()
                    
                    return {
                        'name': name,
                        'status': 'healthy' if response.status == 200 else 'unhealthy',
                        'response_time_ms': round(response_time, 2),
                        'data': data,
                        'timestamp': datetime.now().isoformat()
                    }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                'name': name,
                'status': 'error',
                'response_time_ms': round(response_time, 2),
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    async def test_performance_endpoint(self, name: str, url: str) -> Dict[str, Any]:
        """Test performance of an endpoint"""
        test_payloads = {
            'math_reasoning': {'problem': 'What is 12 + 8?', 'context': 'basic_arithmetic'},
            'logic_reasoning': {'query': 'All cats are animals. Fluffy is a cat. Is Fluffy an animal?'},
            'romanian_intelligence': {'message': 'Salut!', 'context': 'romanian'}
        }
        
        payload = test_payloads.get(name, {})
        start_time = time.time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, 
                    json=payload,
                    headers={'Content-Type': 'application/json'},
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time = (time.time() - start_time) * 1000
                    data = await response.json()
                    
                    return {
                        'name': name,
                        'success': response.status == 200,
                        'response_time_ms': round(response_time, 2),
                        'confidence': data.get('confidence', 0) if isinstance(data, dict) else 0,
                        'timestamp': datetime.now().isoformat()
                    }
        except Exception as e:
            response_time = (time.time() - start_time) * 1000
            return {
                'name': name,
                'success': False,
                'response_time_ms': round(response_time, 2),
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }

    async def collect_monitoring_data(self):
        """Collect all monitoring data"""
        # Health checks
        health_tasks = [
            self.check_endpoint_health(name, url) 
            for name, url in self.endpoints.items()
        ]
        health_results = await asyncio.gather(*health_tasks, return_exceptions=True)
        
        # Performance tests
        perf_tasks = [
            self.test_performance_endpoint(name, url)
            for name, url in self.performance_endpoints.items()
        ]
        perf_results = await asyncio.gather(*perf_tasks, return_exceptions=True)
        
        # Update monitoring data
        self.monitoring_data['health_status'] = {
            result['name']: result for result in health_results 
            if isinstance(result, dict)
        }
        
        self.monitoring_data['performance_metrics'] = {
            result['name']: result for result in perf_results 
            if isinstance(result, dict)
        }
        
        # Calculate system status
        healthy_services = sum(
            1 for status in self.monitoring_data['health_status'].values() 
            if status['status'] == 'healthy'
        )
        total_services = len(self.monitoring_data['health_status'])
        
        self.monitoring_data['system_status'] = {
            'overall_health': 'healthy' if healthy_services == total_services else 'degraded',
            'healthy_services': healthy_services,
            'total_services': total_services,
            'success_rate': round((healthy_services / total_services) * 100, 1) if total_services > 0 else 0
        }
        
        # Performance summary
        successful_tests = sum(
            1 for perf in self.monitoring_data['performance_metrics'].values()
            if perf.get('success', False)
        )
        total_tests = len(self.monitoring_data['performance_metrics'])
        avg_response_time = sum(
            perf.get('response_time_ms', 0) 
            for perf in self.monitoring_data['performance_metrics'].values()
        ) / total_tests if total_tests > 0 else 0
        
        self.monitoring_data['performance_summary'] = {
            'success_rate': round((successful_tests / total_tests) * 100, 1) if total_tests > 0 else 0,
            'avg_response_time_ms': round(avg_response_time, 2),
            'target_met': avg_response_time < 500,
            'total_tests': total_tests
        }
        
        self.monitoring_data['last_update'] = datetime.now().isoformat()
        
        # Check for alerts
        alerts = []
        for name, health in self.monitoring_data['health_status'].items():
            if health['status'] != 'healthy':
                alerts.append({
                    'type': 'health',
                    'severity': 'critical',
                    'message': f"{name} is {health['status']}",
                    'timestamp': health['timestamp']
                })
            elif health.get('response_time_ms', 0) > 2000:
                alerts.append({
                    'type': 'performance',
                    'severity': 'warning',
                    'message': f"{name} response time {health['response_time_ms']}ms exceeds threshold",
                    'timestamp': health['timestamp']
                })
        
        self.monitoring_data['alerts'] = alerts[-10:]  # Keep last 10 alerts

dashboard_monitor = DashboardMonitor()

async def broadcast_updates():
    """Broadcast updates to all connected WebSocket clients"""
    if active_connections:
        message = json.dumps(dashboard_monitor.monitoring_data, default=str)
        disconnected = []
        
        for connection in active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            active_connections.remove(connection)

@app.on_event("startup")
async def startup_event():
    """Start monitoring on startup"""
    asyncio.create_task(monitoring_loop())

async def monitoring_loop():
    """Main monitoring loop"""
    while True:
        try:
            await dashboard_monitor.collect_monitoring_data()
            await broadcast_updates()
            await asyncio.sleep(15)  # Update every 15 seconds
        except Exception as e:
            logger.error(f"Monitoring error: {e}")
            await asyncio.sleep(30)

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard page"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/api/health")
async def health_status():
    """Get current health status"""
    return dashboard_monitor.monitoring_data['health_status']

@app.get("/api/performance")
async def performance_metrics():
    """Get current performance metrics"""
    return dashboard_monitor.monitoring_data['performance_metrics']

@app.get("/api/alerts")
async def get_alerts():
    """Get current alerts"""
    return dashboard_monitor.monitoring_data['alerts']

@app.get("/api/dashboard")
async def get_dashboard_data():
    """Get complete dashboard data"""
    return dashboard_monitor.monitoring_data

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        # Send initial data
        await websocket.send_text(json.dumps(dashboard_monitor.monitoring_data, default=str))
        
        # Keep connection alive
        while True:
            await websocket.receive_text()  # Wait for client messages
    except WebSocketDisconnect:
        active_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)