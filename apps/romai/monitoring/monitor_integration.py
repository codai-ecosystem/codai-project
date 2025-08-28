#!/usr/bin/env python3
"""
RomAI Production Monitoring Integration
Integrates monitoring, optimization, and dashboard with main RomAI server
"""

import asyncio
import logging
import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Add RomAI source to path
current_dir = Path(__file__).parent.parent
src_dir = current_dir / "src"
sys.path.insert(0, str(src_dir))
sys.path.insert(0, str(current_dir))

try:
    from monitoring.production_monitor import RomAIMonitor
    from optimization.performance_optimizer import PerformanceOptimizer
    from monitoring.dashboard import DashboardMonitor
except ImportError as e:
    logging.error(f"Failed to import monitoring components: {e}")
    sys.exit(1)

class RomAIMonitoringIntegration:
    """
    Main integration class that coordinates monitoring, optimization, and dashboard
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.monitor: Optional[RomAIMonitor] = None
        self.optimizer: Optional[PerformanceOptimizer] = None
        self.dashboard: Optional[DashboardMonitor] = None
        self.app = FastAPI(title="RomAI Monitoring Integration")
        
        # Configure CORS
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        self._setup_routes()
    
    def _setup_routes(self):
        """Setup integration routes"""
        
        @self.app.get("/integration/health")
        async def integration_health():
            """Integration health check"""
            try:
                status = {
                    "status": "healthy",
                    "components": {
                        "monitor": self.monitor is not None,
                        "optimizer": self.optimizer is not None,
                        "dashboard": self.dashboard is not None,
                    },
                    "romai_server": await self._check_romai_server()
                }
                
                if self.monitor:
                    monitor_health = await self.monitor.check_system_health()
                    status["romai_health"] = monitor_health
                
                return status
            except Exception as e:
                self.logger.error(f"Integration health check failed: {e}")
                return {"status": "error", "error": str(e)}
        
        @self.app.get("/integration/metrics")
        async def integration_metrics():
            """Get comprehensive metrics from all components"""
            try:
                metrics = {
                    "timestamp": asyncio.get_event_loop().time(),
                    "integration_status": "active"
                }
                
                if self.monitor:
                    health = await self.monitor.check_system_health()
                    performance = await self.monitor.collect_performance_metrics()
                    metrics.update({
                        "health_status": health,
                        "performance_metrics": performance
                    })
                
                if self.optimizer:
                    opt_stats = await self.optimizer.get_cache_stats()
                    metrics["optimization_stats"] = opt_stats
                
                return metrics
            except Exception as e:
                self.logger.error(f"Failed to collect integration metrics: {e}")
                return {"error": str(e)}
        
        @self.app.post("/integration/optimize")
        async def trigger_optimization():
            """Trigger performance optimization"""
            try:
                if not self.optimizer:
                    return {"status": "error", "message": "Optimizer not initialized"}
                
                # Trigger cache optimization
                await self.optimizer.optimize_cache()
                
                return {"status": "success", "message": "Optimization triggered"}
            except Exception as e:
                self.logger.error(f"Optimization failed: {e}")
                return {"status": "error", "error": str(e)}
    
    async def _check_romai_server(self) -> Dict[str, Any]:
        """Check if main RomAI server is running"""
        import aiohttp
        
        try:
            async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=5)) as session:
                async with session.get("http://localhost:6101/health") as response:
                    if response.status == 200:
                        data = await response.json()
                        return {
                            "status": "healthy",
                            "response_status": response.status,
                            "data": data
                        }
                    else:
                        return {
                            "status": "unhealthy",
                            "response_status": response.status
                        }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    async def initialize_components(self):
        """Initialize all monitoring components"""
        try:
            self.logger.info("Initializing monitoring components...")
            
            # Initialize monitor
            self.monitor = RomAIMonitor()
            await self.monitor.start_monitoring()
            self.logger.info("✅ Production monitor initialized")
            
            # Initialize optimizer
            self.optimizer = PerformanceOptimizer()
            await self.optimizer.initialize()
            self.logger.info("✅ Performance optimizer initialized")
            
            # Initialize dashboard
            self.dashboard = DashboardMonitor()
            
            # Mount dashboard app
            dashboard_app = self.dashboard.app
            self.app.mount("/dashboard", dashboard_app)
            
            # Mount static files for dashboard templates
            templates_dir = Path(__file__).parent / "templates"
            if templates_dir.exists():
                # Create static directory if it doesn't exist
                static_dir = Path(__file__).parent / "static"
                static_dir.mkdir(exist_ok=True)
                
                # Copy HTML template to static directory if needed
                dashboard_html = templates_dir / "dashboard.html"
                if dashboard_html.exists():
                    import shutil
                    shutil.copy2(dashboard_html, static_dir / "dashboard.html")
                
                self.app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
            
            self.logger.info("✅ Dashboard monitor initialized")
            
            # Start background tasks
            asyncio.create_task(self._monitoring_loop())
            asyncio.create_task(self._optimization_loop())
            
            self.logger.info("🚀 All monitoring components initialized successfully!")
            
        except Exception as e:
            self.logger.error(f"Failed to initialize components: {e}")
            raise
    
    async def _monitoring_loop(self):
        """Background monitoring loop"""
        while True:
            try:
                if self.monitor:
                    # Collect system health and performance metrics
                    health = await self.monitor.check_system_health()
                    performance = await self.monitor.collect_performance_metrics()
                    
                    # Check for alerts
                    alerts = await self.monitor.check_alerts()
                    
                    # Broadcast to dashboard if available
                    if self.dashboard:
                        await self.dashboard.broadcast_update({
                            "health_status": health,
                            "performance_metrics": performance,
                            "alerts": alerts,
                            "timestamp": asyncio.get_event_loop().time()
                        })
                
                # Wait 30 seconds before next check
                await asyncio.sleep(30)
                
            except Exception as e:
                self.logger.error(f"Monitoring loop error: {e}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _optimization_loop(self):
        """Background optimization loop"""
        while True:
            try:
                if self.optimizer:
                    # Run periodic cache optimization
                    await self.optimizer.optimize_cache()
                    
                    # Log optimization stats
                    stats = await self.optimizer.get_cache_stats()
                    self.logger.info(f"Cache optimization: {stats}")
                
                # Wait 5 minutes before next optimization
                await asyncio.sleep(300)
                
            except Exception as e:
                self.logger.error(f"Optimization loop error: {e}")
                await asyncio.sleep(600)  # Wait longer on error
    
    async def shutdown(self):
        """Graceful shutdown"""
        try:
            self.logger.info("Shutting down monitoring integration...")
            
            if self.monitor:
                await self.monitor.stop_monitoring()
            
            if self.optimizer:
                await self.optimizer.close()
            
            self.logger.info("✅ Monitoring integration shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Shutdown error: {e}")

async def main():
    """Main entry point"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    logger = logging.getLogger(__name__)
    
    try:
        # Create integration instance
        integration = RomAIMonitoringIntegration()
        
        # Initialize components
        await integration.initialize_components()
        
        # Start the integration server
        logger.info("🚀 Starting RomAI Monitoring Integration Server on port 6102...")
        
        # Run with uvicorn
        config = uvicorn.Config(
            app=integration.app,
            host="0.0.0.0",
            port=6102,
            log_level="info",
            reload=False
        )
        server = uvicorn.Server(config)
        
        # Handle shutdown gracefully
        import signal
        
        def signal_handler(signum, frame):
            logger.info(f"Received signal {signum}, shutting down...")
            asyncio.create_task(integration.shutdown())
            server.should_exit = True
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        await server.serve()
        
    except KeyboardInterrupt:
        logger.info("Shutdown requested by user")
    except Exception as e:
        logger.error(f"Integration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())