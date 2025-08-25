"""
🧠 RomAI Analytics Module
=========================

Phase 2.5: Advanced Analytics & Reporting - Module Integration
Week 9 (Days 155-161) - Analytics module initialization and coordination

This module provides the main entry point for the RomAI analytics platform,
coordinating all analytics components and providing unified access to:
- Advanced Analytics Engine
- Real-time Dashboard
- Custom Reporting Engine  
- Business Intelligence Integration
- Analytics API Endpoints

Author: RomAI Development Team
Date: August 12, 2025
License: Proprietary
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from pathlib import Path

# Analytics component imports
try:
    from .advanced_analytics_engine import AdvancedAnalyticsEngine
    from .realtime_dashboard import RealTimeDashboard
    from .custom_reporting_engine import CustomReportingEngine
    from .business_intelligence_integration import BusinessIntelligenceIntegration
    from .analytics_api_endpoints import RomAIAnalyticsAPI, create_analytics_api
    ANALYTICS_AVAILABLE = True
except ImportError as e:
    ANALYTICS_AVAILABLE = False
    logging.warning(f"Analytics components not available: {e}")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RomAIAnalyticsPlatform:
    """
    RomAI Analytics Platform
    
    Main coordination class for the comprehensive analytics platform,
    providing unified access to all analytics components and capabilities.
    """
    
    def __init__(self, 
                 analytics_db_path: str = "romai_analytics.db",
                 dashboard_port: int = 8003,
                 api_port: int = 8002,
                 auto_start: bool = False):
        """
        Initialize RomAI Analytics Platform
        
        Args:
            analytics_db_path: Path to analytics database
            dashboard_port: Port for real-time dashboard
            api_port: Port for analytics API
            auto_start: Whether to automatically start services
        """
        if not ANALYTICS_AVAILABLE:
            raise ImportError("Analytics components not available")
        
        self.analytics_db_path = analytics_db_path
        self.dashboard_port = dashboard_port
        self.api_port = api_port
        
        # Initialize core components
        self.analytics_engine = AdvancedAnalyticsEngine(analytics_db_path)
        self.dashboard = RealTimeDashboard(self.analytics_engine, port=dashboard_port)
        self.reporting_engine = CustomReportingEngine(self.analytics_engine)
        self.bi_integration = BusinessIntelligenceIntegration(self.analytics_engine)
        self.api = RomAIAnalyticsAPI(
            analytics_engine=self.analytics_engine,
            dashboard=self.dashboard,
            reporting_engine=self.reporting_engine,
            bi_integration=self.bi_integration,
            port=api_port
        )
        
        # Platform status
        self.is_running = False
        self.services_status = {
            "analytics_engine": False,
            "dashboard": False,
            "reporting_engine": False,
            "bi_integration": False,
            "api": False
        }
        
        if auto_start:
            asyncio.create_task(self.start_platform())
        
        logger.info("RomAI Analytics Platform initialized successfully")

    async def start_platform(self):
        """Start all analytics platform services"""
        try:
            logger.info("Starting RomAI Analytics Platform...")
            
            # Start analytics engine
            await self.analytics_engine.start()
            self.services_status["analytics_engine"] = True
            logger.info("✅ Analytics Engine started")
            
            # Start dashboard
            await self.dashboard.start()
            self.services_status["dashboard"] = True
            logger.info(f"✅ Real-time Dashboard started on port {self.dashboard_port}")
            
            # Initialize reporting engine
            await self.reporting_engine.initialize()
            self.services_status["reporting_engine"] = True
            logger.info("✅ Custom Reporting Engine initialized")
            
            # Initialize business intelligence
            self.services_status["bi_integration"] = True
            logger.info("✅ Business Intelligence Integration ready")
            
            # Start API server (in background)
            asyncio.create_task(self.api.start_server())
            self.services_status["api"] = True
            logger.info(f"✅ Analytics API started on port {self.api_port}")
            
            self.is_running = True
            logger.info("🎉 RomAI Analytics Platform started successfully!")
            
            # Log access URLs
            logger.info(f"📊 Analytics API: http://localhost:{self.api_port}")
            logger.info(f"📱 Dashboard: http://localhost:{self.api_port}/dashboard")
            logger.info(f"📖 API Docs: http://localhost:{self.api_port}/docs")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to start Analytics Platform: {e}")
            await self.stop_platform()
            return False

    async def stop_platform(self):
        """Stop all analytics platform services"""
        try:
            logger.info("Stopping RomAI Analytics Platform...")
            
            # Stop services in reverse order
            self.services_status["api"] = False
            self.services_status["bi_integration"] = False
            self.services_status["reporting_engine"] = False
            
            if hasattr(self.dashboard, 'stop'):
                await self.dashboard.stop()
            self.services_status["dashboard"] = False
            
            if hasattr(self.analytics_engine, 'stop'):
                await self.analytics_engine.stop()
            self.services_status["analytics_engine"] = False
            
            self.is_running = False
            logger.info("✅ RomAI Analytics Platform stopped successfully")
            
        except Exception as e:
            logger.error(f"Error stopping Analytics Platform: {e}")

    def get_platform_status(self) -> Dict[str, Any]:
        """Get comprehensive platform status"""
        return {
            "platform_running": self.is_running,
            "services": self.services_status.copy(),
            "configuration": {
                "analytics_db_path": self.analytics_db_path,
                "dashboard_port": self.dashboard_port,
                "api_port": self.api_port
            },
            "access_urls": {
                "api": f"http://localhost:{self.api_port}",
                "dashboard": f"http://localhost:{self.api_port}/dashboard",
                "docs": f"http://localhost:{self.api_port}/docs"
            },
            "timestamp": datetime.now().isoformat()
        }

    async def get_comprehensive_analytics(self) -> Dict[str, Any]:
        """Get comprehensive analytics data from all components"""
        try:
            # Get data from all components
            analytics_stats = self.analytics_engine.get_analytics_statistics()
            dashboard_data = await self.dashboard.get_dashboard_data()
            kpi_dashboard = await self.bi_integration.generate_kpi_dashboard()
            executive_summary = await self.bi_integration.generate_executive_summary()
            reporting_stats = self.reporting_engine.get_engine_statistics()
            
            return {
                "platform_status": self.get_platform_status(),
                "analytics_engine": analytics_stats,
                "dashboard": dashboard_data,
                "kpi_dashboard": kpi_dashboard,
                "executive_summary": {
                    "period": executive_summary.period,
                    "key_achievements": executive_summary.key_achievements[:3],  # Top 3
                    "performance_highlights": executive_summary.performance_highlights,
                    "financial_summary": executive_summary.financial_summary,
                    "risk_indicators_count": len(executive_summary.risk_indicators)
                },
                "reporting_engine": reporting_stats,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting comprehensive analytics: {e}")
            return {"error": str(e), "timestamp": datetime.now().isoformat()}

    # Convenience methods for direct component access
    async def record_metric(self, name: str, value: float, metric_type: str = "SYSTEM", **kwargs):
        """Record metric via analytics engine"""
        from .advanced_analytics_engine import AnalyticsMetric, AnalyticsMetricType
        
        metric = AnalyticsMetric(
            name=name,
            value=value,
            metric_type=AnalyticsMetricType(metric_type.upper()),
            timestamp=datetime.now(),
            tags=kwargs.get("tags", {}),
            metadata=kwargs.get("metadata", {})
        )
        
        return await self.analytics_engine.record_metric(metric)

    async def track_kpi(self, kpi_id: str, value: float, period: Optional[str] = None):
        """Track KPI via business intelligence"""
        return await self.bi_integration.track_kpi(kpi_id, value, period)

    async def generate_report(self, template_name: str, format: str = "html", **parameters):
        """Generate report via reporting engine"""
        from .custom_reporting_engine import ReportFormat
        
        report_format = ReportFormat(format.upper())
        return await self.reporting_engine.generate_report(
            template_name, parameters, report_format
        )

    async def get_kpi_dashboard(self):
        """Get KPI dashboard from business intelligence"""
        return await self.bi_integration.generate_kpi_dashboard()

# Global platform instance
_platform_instance: Optional[RomAIAnalyticsPlatform] = None

def get_analytics_platform(
    analytics_db_path: str = "romai_analytics.db",
    dashboard_port: int = 8003,
    api_port: int = 8002,
    auto_start: bool = False
) -> RomAIAnalyticsPlatform:
    """
    Get or create global analytics platform instance
    
    Args:
        analytics_db_path: Path to analytics database
        dashboard_port: Port for real-time dashboard
        api_port: Port for analytics API
        auto_start: Whether to automatically start services
        
    Returns:
        RomAIAnalyticsPlatform instance
    """
    global _platform_instance
    
    if _platform_instance is None:
        _platform_instance = RomAIAnalyticsPlatform(
            analytics_db_path=analytics_db_path,
            dashboard_port=dashboard_port,
            api_port=api_port,
            auto_start=auto_start
        )
    
    return _platform_instance

# Convenience functions for quick access
async def start_analytics():
    """Start analytics platform with default configuration"""
    platform = get_analytics_platform(auto_start=True)
    return await platform.start_platform()

async def stop_analytics():
    """Stop analytics platform"""
    global _platform_instance
    if _platform_instance:
        await _platform_instance.stop_platform()
        _platform_instance = None

def get_platform_status():
    """Get analytics platform status"""
    global _platform_instance
    if _platform_instance:
        return _platform_instance.get_platform_status()
    return {"platform_running": False, "error": "Platform not initialized"}

# Export main classes and functions
__all__ = [
    "RomAIAnalyticsPlatform",
    "get_analytics_platform", 
    "start_analytics",
    "stop_analytics",
    "get_platform_status",
    "AdvancedAnalyticsEngine",
    "RealTimeDashboard", 
    "CustomReportingEngine",
    "BusinessIntelligenceIntegration",
    "RomAIAnalyticsAPI",
    "create_analytics_api"
]

# Module information
__version__ = "1.0.0"
__author__ = "RomAI Development Team"
__description__ = "Comprehensive analytics and business intelligence platform for RomAI AGI"

# Example usage and testing
async def main():
    """Example usage of Analytics Platform"""
    print("🧠 RomAI Analytics Platform - Testing")
    print("=" * 50)
    
    if not ANALYTICS_AVAILABLE:
        print("❌ Analytics components not available")
        return
    
    # Create platform
    platform = get_analytics_platform(
        analytics_db_path="test_platform_analytics.db",
        dashboard_port=8203,
        api_port=8202,
        auto_start=False
    )
    
    print("✅ Analytics Platform created")
    
    # Get initial status
    status = platform.get_platform_status()
    print(f"📊 Platform running: {status['platform_running']}")
    
    # Start platform
    print("\n🚀 Starting Analytics Platform...")
    success = await platform.start_platform()
    
    if success:
        print("✅ Platform started successfully!")
        
        # Test basic functionality
        print("\n🧪 Testing platform functionality...")
        
        # Record some test metrics
        await platform.record_metric("test_cpu_usage", 45.2, "SYSTEM")
        await platform.record_metric("test_accuracy", 85.8, "AI_PERFORMANCE")
        await platform.track_kpi("ai_model_accuracy", 85.8)
        
        print("✅ Metrics recorded successfully")
        
        # Get comprehensive analytics
        analytics_data = await platform.get_comprehensive_analytics()
        print(f"✅ Analytics data generated: {len(analytics_data)} sections")
        
        # Get platform status
        final_status = platform.get_platform_status()
        print(f"📊 Services running: {sum(final_status['services'].values())}/5")
        
        print("\n🌐 Access URLs:")
        for name, url in final_status['access_urls'].items():
            print(f"  {name.title()}: {url}")
        
    else:
        print("❌ Failed to start platform")
    
    print("\n🎉 Platform test completed!")

if __name__ == "__main__":
    asyncio.run(main())
