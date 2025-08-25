"""
🧠 RomAI Analytics API Endpoints
===============================

Phase 2.5: Advanced Analytics & Reporting - API Integration
Week 9 (Days 155-161) - Analytics API endpoints for enterprise platform

This module provides FastAPI endpoints for the RomAI analytics platform,
integrating with the advanced analytics engine, real-time dashboard,
custom reporting engine, and business intelligence system.

Features:
- Analytics data access endpoints
- Real-time dashboard API
- Custom report generation endpoints
- Business intelligence dashboard API
- KPI tracking and monitoring endpoints
- Forecast generation and access
- Executive summary generation
- Market intelligence endpoints

Author: RomAI Development Team
Date: August 12, 2025
License: Proprietary
"""

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from pathlib import Path
import os

# FastAPI and web framework imports
try:
    from fastapi import FastAPI, HTTPException, Depends, Query, Path as PathParam
    from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
    from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
    from pydantic import BaseModel, Field
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False
    logging.warning("FastAPI not available - analytics API disabled")

# Analytics modules
try:
    from .advanced_analytics_engine import (
        AdvancedAnalyticsEngine, 
        AnalyticsMetric, 
        AnalyticsMetricType,
        SystemHealthMetrics,
        AIPerformanceMetrics,
        BusinessMetrics,
        ReportFormat
    )
    from .realtime_dashboard import RealTimeDashboard
    from .custom_reporting_engine import CustomReportingEngine
    from .business_intelligence_integration import (
        BusinessIntelligenceIntegration,
        KPICategory,
        ForecastMethod,
        BusinessSegment
    )
    ANALYTICS_MODULES_AVAILABLE = True
except ImportError:
    ANALYTICS_MODULES_AVAILABLE = False
    logging.warning("Analytics modules not available")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Security configuration
security = HTTPBearer() if FASTAPI_AVAILABLE else None

# API Models
if FASTAPI_AVAILABLE:
    class AnalyticsMetricRequest(BaseModel):
        """Request model for analytics metric submission"""
        name: str = Field(..., description="Metric name")
        value: float = Field(..., description="Metric value")
        metric_type: str = Field(..., description="Metric type (system, ai_performance, business)")
        tags: Optional[Dict[str, Any]] = Field(default=None, description="Optional tags")
        metadata: Optional[Dict[str, Any]] = Field(default=None, description="Optional metadata")

    class SystemHealthRequest(BaseModel):
        """Request model for system health metrics"""
        cpu_usage: float = Field(..., ge=0, le=100, description="CPU usage percentage")
        memory_usage: float = Field(..., ge=0, le=100, description="Memory usage percentage")
        disk_usage: float = Field(..., ge=0, le=100, description="Disk usage percentage")
        network_io: Dict[str, float] = Field(..., description="Network I/O statistics")
        process_count: int = Field(..., ge=0, description="Number of processes")
        uptime_seconds: float = Field(..., ge=0, description="System uptime in seconds")

    class AIPerformanceRequest(BaseModel):
        """Request model for AI performance metrics"""
        model_accuracy: float = Field(..., ge=0, le=100, description="Model accuracy percentage")
        inference_time: float = Field(..., ge=0, description="Inference time in milliseconds")
        throughput: float = Field(..., ge=0, description="Requests per second")
        error_rate: float = Field(..., ge=0, le=100, description="Error rate percentage")
        confidence_score: float = Field(..., ge=0, le=1, description="Average confidence score")
        romanian_cultural_accuracy: Optional[float] = Field(default=None, ge=0, le=100, description="Romanian cultural accuracy")

    class BusinessMetricsRequest(BaseModel):
        """Request model for business metrics"""
        revenue: float = Field(..., ge=0, description="Revenue amount")
        customers: int = Field(..., ge=0, description="Number of customers")
        conversion_rate: float = Field(..., ge=0, le=100, description="Conversion rate percentage")
        customer_satisfaction: float = Field(..., ge=0, le=5, description="Customer satisfaction score")
        market_share: float = Field(..., ge=0, le=100, description="Market share percentage")

    class KPITrackingRequest(BaseModel):
        """Request model for KPI tracking"""
        kpi_id: str = Field(..., description="KPI identifier")
        value: float = Field(..., description="KPI value")
        period: Optional[str] = Field(default=None, description="Period identifier")

    class ForecastRequest(BaseModel):
        """Request model for business forecast generation"""
        metric_name: str = Field(..., description="Metric name to forecast")
        forecast_days: int = Field(default=30, ge=1, le=365, description="Number of days to forecast")
        method: str = Field(default="linear_regression", description="Forecasting method")

    class ReportGenerationRequest(BaseModel):
        """Request model for custom report generation"""
        template_name: str = Field(..., description="Report template name")
        format: str = Field(default="html", description="Report format (html, pdf, json, excel)")
        parameters: Optional[Dict[str, Any]] = Field(default=None, description="Report parameters")
        include_visualizations: bool = Field(default=True, description="Include visualizations")

    class AnalyticsResponse(BaseModel):
        """Standard analytics API response"""
        success: bool = Field(..., description="Operation success status")
        message: str = Field(..., description="Response message")
        data: Optional[Dict[str, Any]] = Field(default=None, description="Response data")
        timestamp: str = Field(..., description="Response timestamp")

class RomAIAnalyticsAPI:
    """
    RomAI Analytics API Server
    
    Provides REST API endpoints for the comprehensive analytics platform,
    enabling enterprise integration and programmatic access to analytics capabilities.
    """
    
    def __init__(self, 
                 analytics_engine: Optional[AdvancedAnalyticsEngine] = None,
                 dashboard: Optional[RealTimeDashboard] = None,
                 reporting_engine: Optional[CustomReportingEngine] = None,
                 bi_integration: Optional[BusinessIntelligenceIntegration] = None,
                 host: str = "0.0.0.0",
                 port: int = 8002):
        """
        Initialize RomAI Analytics API
        
        Args:
            analytics_engine: Instance of AdvancedAnalyticsEngine
            dashboard: Instance of RealTimeDashboard
            reporting_engine: Instance of CustomReportingEngine
            bi_integration: Instance of BusinessIntelligenceIntegration
            host: API host address
            port: API port number
        """
        if not FASTAPI_AVAILABLE:
            raise ImportError("FastAPI not available - cannot initialize analytics API")
        
        self.host = host
        self.port = port
        
        # Initialize analytics components
        if not analytics_engine:
            self.analytics_engine = AdvancedAnalyticsEngine("romai_analytics.db")
        else:
            self.analytics_engine = analytics_engine
        
        if not dashboard:
            self.dashboard = RealTimeDashboard(self.analytics_engine, port=8003)
        else:
            self.dashboard = dashboard
        
        if not reporting_engine:
            self.reporting_engine = CustomReportingEngine(self.analytics_engine)
        else:
            self.reporting_engine = reporting_engine
        
        if not bi_integration:
            self.bi_integration = BusinessIntelligenceIntegration(self.analytics_engine)
        else:
            self.bi_integration = bi_integration
        
        # Initialize FastAPI app
        self.app = FastAPI(
            title="RomAI Analytics API",
            description="Comprehensive analytics and business intelligence API for RomAI AGI Platform",
            version="1.0.0",
            docs_url="/docs",
            redoc_url="/redoc"
        )
        
        self._setup_routes()
        
        logger.info("RomAI Analytics API initialized successfully")

    def _setup_routes(self):
        """Setup FastAPI routes"""
        
        # Health and status endpoints
        @self.app.get("/health", response_model=AnalyticsResponse)
        async def health_check():
            """Health check endpoint"""
            return AnalyticsResponse(
                success=True,
                message="Analytics API is healthy",
                data={
                    "status": "healthy",
                    "version": "1.0.0",
                    "components": {
                        "analytics_engine": True,
                        "dashboard": True,
                        "reporting_engine": True,
                        "bi_integration": True
                    }
                },
                timestamp=datetime.now().isoformat()
            )
        
        @self.app.get("/status", response_model=AnalyticsResponse)
        async def get_status():
            """Get detailed system status"""
            try:
                # Get analytics statistics
                analytics_stats = self.analytics_engine.get_analytics_statistics()
                dashboard_stats = await self.dashboard.get_dashboard_statistics()
                reporting_stats = self.reporting_engine.get_engine_statistics()
                bi_stats = self.bi_integration.get_bi_statistics()
                
                return AnalyticsResponse(
                    success=True,
                    message="System status retrieved successfully",
                    data={
                        "analytics_engine": analytics_stats,
                        "dashboard": dashboard_stats,
                        "reporting_engine": reporting_stats,
                        "business_intelligence": bi_stats,
                        "server": {
                            "host": self.host,
                            "port": self.port,
                            "uptime": analytics_stats.get("uptime", "unknown")
                        }
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error getting system status: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # Analytics metrics endpoints
        @self.app.post("/api/v1/analytics/metrics", response_model=AnalyticsResponse)
        async def record_metric(request: AnalyticsMetricRequest):
            """Record analytics metric"""
            try:
                metric_type = AnalyticsMetricType(request.metric_type.upper())
                
                metric = AnalyticsMetric(
                    name=request.name,
                    value=request.value,
                    metric_type=metric_type,
                    timestamp=datetime.now(),
                    tags=request.tags or {},
                    metadata=request.metadata or {}
                )
                
                success = await self.analytics_engine.record_metric(metric)
                
                return AnalyticsResponse(
                    success=success,
                    message=f"Metric {request.name} recorded successfully" if success else "Failed to record metric",
                    data={"metric_id": f"{request.name}_{datetime.now().isoformat()}"},
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error recording metric: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.post("/api/v1/analytics/system-health", response_model=AnalyticsResponse)
        async def record_system_health(request: SystemHealthRequest):
            """Record system health metrics"""
            try:
                health_metrics = SystemHealthMetrics(
                    cpu_usage=request.cpu_usage,
                    memory_usage=request.memory_usage,
                    disk_usage=request.disk_usage,
                    network_io=request.network_io,
                    process_count=request.process_count,
                    uptime_seconds=request.uptime_seconds,
                    timestamp=datetime.now()
                )
                
                success = await self.analytics_engine.record_system_health(health_metrics)
                
                return AnalyticsResponse(
                    success=success,
                    message="System health metrics recorded successfully" if success else "Failed to record system health",
                    data={"health_score": (100 - max(request.cpu_usage, request.memory_usage, request.disk_usage))},
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error recording system health: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.post("/api/v1/analytics/ai-performance", response_model=AnalyticsResponse)
        async def record_ai_performance(request: AIPerformanceRequest):
            """Record AI performance metrics"""
            try:
                ai_metrics = AIPerformanceMetrics(
                    model_accuracy=request.model_accuracy,
                    inference_time=request.inference_time,
                    throughput=request.throughput,
                    error_rate=request.error_rate,
                    confidence_score=request.confidence_score,
                    timestamp=datetime.now()
                )
                
                success = await self.analytics_engine.record_ai_performance(ai_metrics)
                
                # Also track Romanian cultural accuracy if provided
                if request.romanian_cultural_accuracy is not None:
                    await self.bi_integration.track_kpi(
                        "romanian_cultural_accuracy", 
                        request.romanian_cultural_accuracy
                    )
                
                return AnalyticsResponse(
                    success=success,
                    message="AI performance metrics recorded successfully" if success else "Failed to record AI performance",
                    data={
                        "performance_score": request.model_accuracy,
                        "cultural_accuracy": request.romanian_cultural_accuracy
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error recording AI performance: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.post("/api/v1/analytics/business-metrics", response_model=AnalyticsResponse)
        async def record_business_metrics(request: BusinessMetricsRequest):
            """Record business metrics"""
            try:
                business_metrics = BusinessMetrics(
                    revenue=request.revenue,
                    customers=request.customers,
                    conversion_rate=request.conversion_rate,
                    customer_satisfaction=request.customer_satisfaction,
                    market_share=request.market_share,
                    timestamp=datetime.now()
                )
                
                success = await self.analytics_engine.record_business_metrics(business_metrics)
                
                return AnalyticsResponse(
                    success=success,
                    message="Business metrics recorded successfully" if success else "Failed to record business metrics",
                    data={
                        "revenue_growth": ((request.revenue - 80000) / 80000) * 100 if request.revenue > 0 else 0,
                        "customer_growth": ((request.customers - 100) / 100) * 100 if request.customers > 0 else 0
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error recording business metrics: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        # Dashboard endpoints
        @self.app.get("/api/v1/dashboard/data", response_model=AnalyticsResponse)
        async def get_dashboard_data():
            """Get real-time dashboard data"""
            try:
                dashboard_data = await self.dashboard.get_dashboard_data()
                
                return AnalyticsResponse(
                    success=True,
                    message="Dashboard data retrieved successfully",
                    data=dashboard_data,
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error getting dashboard data: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/dashboard", response_class=HTMLResponse)
        async def get_dashboard_html():
            """Get dashboard HTML interface"""
            try:
                html_content = await self.dashboard.generate_dashboard_html()
                return HTMLResponse(content=html_content)
            except Exception as e:
                logger.error(f"Error generating dashboard HTML: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # Business Intelligence endpoints
        @self.app.get("/api/v1/bi/kpi-dashboard", response_model=AnalyticsResponse)
        async def get_kpi_dashboard():
            """Get KPI dashboard data"""
            try:
                kpi_dashboard = await self.bi_integration.generate_kpi_dashboard()
                
                return AnalyticsResponse(
                    success=True,
                    message="KPI dashboard generated successfully",
                    data=kpi_dashboard,
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error generating KPI dashboard: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/api/v1/bi/track-kpi", response_model=AnalyticsResponse)
        async def track_kpi(request: KPITrackingRequest):
            """Track KPI value"""
            try:
                success = await self.bi_integration.track_kpi(
                    request.kpi_id, request.value, request.period
                )
                
                return AnalyticsResponse(
                    success=success,
                    message=f"KPI {request.kpi_id} tracked successfully" if success else "Failed to track KPI",
                    data={"kpi_id": request.kpi_id, "value": request.value},
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error tracking KPI: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.get("/api/v1/bi/kpis", response_model=AnalyticsResponse)
        async def get_all_kpis():
            """Get all KPI definitions"""
            try:
                kpis = self.bi_integration.get_all_kpis()
                current_values = self.bi_integration.get_current_kpi_values()
                
                kpi_data = {}
                for kpi_id, kpi_def in kpis.items():
                    kpi_data[kpi_id] = {
                        "definition": {
                            "name": kpi_def.name,
                            "description": kpi_def.description,
                            "category": kpi_def.category.value,
                            "unit": kpi_def.unit,
                            "target_value": kpi_def.target_value,
                            "owner": kpi_def.owner
                        },
                        "current_value": current_values.get(kpi_id)
                    }
                
                return AnalyticsResponse(
                    success=True,
                    message="KPI definitions retrieved successfully",
                    data={"kpis": kpi_data, "total_count": len(kpis)},
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error getting KPIs: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.post("/api/v1/bi/forecast", response_model=AnalyticsResponse)
        async def generate_forecast(request: ForecastRequest):
            """Generate business forecast"""
            try:
                forecast_method = ForecastMethod(request.method.upper())
                
                forecast = await self.bi_integration.generate_business_forecast(
                    request.metric_name, request.forecast_days, forecast_method
                )
                
                return AnalyticsResponse(
                    success=True,
                    message="Business forecast generated successfully",
                    data={
                        "forecast_id": forecast.id,
                        "metric_name": forecast.metric_name,
                        "forecast_period": forecast.forecast_period,
                        "forecast_values": forecast.forecast_values[:10],  # First 10 values
                        "accuracy_metrics": forecast.accuracy_metrics,
                        "valid_until": forecast.valid_until.isoformat()
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error generating forecast: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.get("/api/v1/bi/executive-summary", response_model=AnalyticsResponse)
        async def get_executive_summary():
            """Get executive summary"""
            try:
                summary = await self.bi_integration.generate_executive_summary()
                
                return AnalyticsResponse(
                    success=True,
                    message="Executive summary generated successfully",
                    data={
                        "period": summary.period,
                        "key_achievements": summary.key_achievements,
                        "performance_highlights": summary.performance_highlights,
                        "financial_summary": summary.financial_summary,
                        "growth_metrics": summary.growth_metrics,
                        "risk_indicators": summary.risk_indicators,
                        "strategic_recommendations": summary.strategic_recommendations
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error generating executive summary: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        @self.app.get("/api/v1/bi/market-intelligence", response_model=AnalyticsResponse)
        async def get_market_intelligence(segment: str = Query(default="romanian_ai", description="Market segment")):
            """Get market intelligence data"""
            try:
                market_intel = self.bi_integration.get_market_intelligence(segment)
                
                if not market_intel:
                    raise HTTPException(status_code=404, detail=f"Market intelligence for segment '{segment}' not found")
                
                return AnalyticsResponse(
                    success=True,
                    message="Market intelligence retrieved successfully",
                    data={
                        "market_segment": market_intel.market_segment,
                        "total_addressable_market": market_intel.total_addressable_market,
                        "serviceable_addressable_market": market_intel.serviceable_addressable_market,
                        "market_growth_rate": market_intel.market_growth_rate,
                        "competitive_landscape": market_intel.competitive_landscape,
                        "market_trends": market_intel.market_trends,
                        "opportunities": market_intel.opportunities,
                        "threats": market_intel.threats,
                        "updated_at": market_intel.updated_at.isoformat()
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error getting market intelligence: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # Reporting endpoints
        @self.app.post("/api/v1/reports/generate", response_model=AnalyticsResponse)
        async def generate_report(request: ReportGenerationRequest):
            """Generate custom report"""
            try:
                report_format = ReportFormat(request.format.upper())
                
                # Create report template if it doesn't exist
                if request.template_name not in self.reporting_engine.templates:
                    await self.reporting_engine.create_template(
                        request.template_name,
                        "Analytics Report",
                        "Comprehensive analytics report with performance metrics and insights."
                    )
                
                report = await self.reporting_engine.generate_report(
                    request.template_name,
                    request.parameters or {},
                    report_format,
                    request.include_visualizations
                )
                
                return AnalyticsResponse(
                    success=True,
                    message="Report generated successfully",
                    data={
                        "report_id": report["id"],
                        "template": request.template_name,
                        "format": request.format,
                        "size": len(report.get("content", "")),
                        "generated_at": report["generated_at"]
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error generating report: {e}")
                raise HTTPException(status_code=400, detail=str(e))
        
        @self.app.get("/api/v1/reports/templates", response_model=AnalyticsResponse)
        async def get_report_templates():
            """Get available report templates"""
            try:
                templates = self.reporting_engine.list_templates()
                
                return AnalyticsResponse(
                    success=True,
                    message="Report templates retrieved successfully",
                    data={"templates": templates, "total_count": len(templates)},
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error getting report templates: {e}")
                raise HTTPException(status_code=500, detail=str(e))
        
        # Analytics query endpoints
        @self.app.get("/api/v1/analytics/metrics/{metric_name}", response_model=AnalyticsResponse)
        async def get_metric_history(
            metric_name: str = PathParam(..., description="Metric name"),
            days: int = Query(default=7, ge=1, le=365, description="Number of days of history"),
            aggregation: str = Query(default="hourly", description="Aggregation level (hourly, daily, weekly)")
        ):
            """Get metric history"""
            try:
                # Get metric history from analytics engine
                end_time = datetime.now()
                start_time = end_time - timedelta(days=days)
                
                history = await self.analytics_engine.get_metric_history(
                    metric_name, start_time, end_time, aggregation
                )
                
                return AnalyticsResponse(
                    success=True,
                    message=f"Metric history for {metric_name} retrieved successfully",
                    data={
                        "metric_name": metric_name,
                        "period": f"last_{days}_days",
                        "aggregation": aggregation,
                        "data_points": len(history),
                        "history": history[:100]  # Limit to 100 points
                    },
                    timestamp=datetime.now().isoformat()
                )
            except Exception as e:
                logger.error(f"Error getting metric history: {e}")
                raise HTTPException(status_code=500, detail=str(e))

    async def start_server(self):
        """Start the analytics API server"""
        if not FASTAPI_AVAILABLE:
            logger.error("FastAPI not available - cannot start server")
            return
        
        logger.info(f"Starting RomAI Analytics API server on {self.host}:{self.port}")
        
        config = uvicorn.Config(
            app=self.app,
            host=self.host,
            port=self.port,
            log_level="info",
            access_log=True
        )
        
        server = uvicorn.Server(config)
        await server.serve()

    def run_server(self):
        """Run the analytics API server synchronously"""
        asyncio.run(self.start_server())

# Factory function for easy initialization
def create_analytics_api(
    analytics_db_path: str = "romai_analytics.db",
    dashboard_port: int = 8003,
    api_host: str = "0.0.0.0",
    api_port: int = 8002
) -> RomAIAnalyticsAPI:
    """
    Factory function to create RomAI Analytics API with all components
    
    Args:
        analytics_db_path: Path to analytics database
        dashboard_port: Port for real-time dashboard
        api_host: API host address
        api_port: API port number
        
    Returns:
        Configured RomAIAnalyticsAPI instance
    """
    # Initialize analytics engine
    analytics_engine = AdvancedAnalyticsEngine(analytics_db_path)
    
    # Initialize dashboard
    dashboard = RealTimeDashboard(analytics_engine, port=dashboard_port)
    
    # Initialize reporting engine
    reporting_engine = CustomReportingEngine(analytics_engine)
    
    # Initialize business intelligence
    bi_integration = BusinessIntelligenceIntegration(analytics_engine)
    
    # Create API
    api = RomAIAnalyticsAPI(
        analytics_engine=analytics_engine,
        dashboard=dashboard,
        reporting_engine=reporting_engine,
        bi_integration=bi_integration,
        host=api_host,
        port=api_port
    )
    
    return api

# Example usage and testing
async def main():
    """Example usage of Analytics API"""
    print("🧠 RomAI Analytics API - Testing")
    print("=" * 50)
    
    if not FASTAPI_AVAILABLE:
        print("❌ FastAPI not available - skipping API tests")
        return
    
    if not ANALYTICS_MODULES_AVAILABLE:
        print("❌ Analytics modules not available - skipping tests")
        return
    
    # Create analytics API
    api = create_analytics_api(
        analytics_db_path="test_analytics.db",
        dashboard_port=8103,
        api_host="127.0.0.1",
        api_port=8102
    )
    
    print("✅ Analytics API created successfully")
    print(f"📊 API endpoints available at: http://{api.host}:{api.port}")
    print(f"📱 Dashboard available at: http://{api.host}:{api.port}/dashboard")
    print(f"📖 API documentation: http://{api.host}:{api.port}/docs")
    
    # Test API components
    print("\n🧪 Testing API components...")
    
    try:
        # Test analytics engine
        await api.analytics_engine.record_metric(AnalyticsMetric(
            name="test_metric",
            value=42.0,
            metric_type=AnalyticsMetricType.SYSTEM,
            timestamp=datetime.now(),
            tags={"test": True},
            metadata={"source": "api_test"}
        ))
        print("✅ Analytics engine test passed")
        
        # Test BI integration
        await api.bi_integration.track_kpi("ai_model_accuracy", 85.2)
        print("✅ Business intelligence test passed")
        
        # Test dashboard data
        dashboard_data = await api.dashboard.get_dashboard_data()
        print(f"✅ Dashboard test passed - {len(dashboard_data.get('widgets', []))} widgets")
        
        # Test reporting engine
        await api.reporting_engine.create_template(
            "test_report",
            "Test Report",
            "This is a test report template."
        )
        print("✅ Reporting engine test passed")
        
    except Exception as e:
        print(f"❌ Component test failed: {e}")
    
    print("\n🎉 All tests completed!")
    print(f"🚀 Run with: python -m apps.romai.src.analytics.analytics_api_endpoints")

if __name__ == "__main__":
    asyncio.run(main())
