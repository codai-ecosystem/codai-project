# CODAI Business Intelligence & Analytics Module
# Advanced analytics for user behavior, business metrics, and insights

import sqlite3
import json
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import asyncio
import aiohttp
import logging

class CODAIBusinessIntelligence:
    """
    Comprehensive business intelligence and analytics system for CODAI ecosystem
    Tracks user behavior, application performance, and business metrics
    """
    
    def __init__(self, db_path: str = "analytics/codai_analytics.db"):
        self.db_path = db_path
        self.setup_database()
        self.logger = logging.getLogger(__name__)
        
    def setup_database(self):
        """Initialize analytics database with proper schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # User analytics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                application TEXT,
                event_type TEXT,
                event_data TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                session_id TEXT,
                ip_address TEXT,
                user_agent TEXT
            )
        """)
        
        # Application performance table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS app_performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application TEXT,
                metric_type TEXT,
                metric_value REAL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                additional_data TEXT
            )
        """)
        
        # Business metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS business_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_name TEXT,
                metric_value REAL,
                metric_category TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT
            )
        """)
        
        # Error tracking table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS error_tracking (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                application TEXT,
                error_type TEXT,
                error_message TEXT,
                stack_trace TEXT,
                user_id TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                severity TEXT,
                resolved BOOLEAN DEFAULT FALSE
            )
        """)
        
        # User sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                user_id TEXT,
                application TEXT,
                start_time DATETIME,
                end_time DATETIME,
                duration_seconds INTEGER,
                page_views INTEGER,
                actions_count INTEGER,
                conversion_events TEXT
            )
        """)
        
        conn.commit()
        conn.close()
        
    def track_user_event(self, user_id: str, application: str, event_type: str, 
                        event_data: Dict[str, Any], session_id: str = None, 
                        ip_address: str = None, user_agent: str = None):
        """Track user events for analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO user_analytics 
            (user_id, application, event_type, event_data, session_id, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, application, event_type, json.dumps(event_data),
            session_id, ip_address, user_agent
        ))
        
        conn.commit()
        conn.close()
        
    def track_performance_metric(self, application: str, metric_type: str, 
                                metric_value: float, additional_data: Dict[str, Any] = None):
        """Track application performance metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO app_performance 
            (application, metric_type, metric_value, additional_data)
            VALUES (?, ?, ?, ?)
        """, (
            application, metric_type, metric_value, 
            json.dumps(additional_data) if additional_data else None
        ))
        
        conn.commit()
        conn.close()
        
    def track_business_metric(self, metric_name: str, metric_value: float, 
                             metric_category: str, metadata: Dict[str, Any] = None):
        """Track business-related metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO business_metrics 
            (metric_name, metric_value, metric_category, metadata)
            VALUES (?, ?, ?, ?)
        """, (
            metric_name, metric_value, metric_category,
            json.dumps(metadata) if metadata else None
        ))
        
        conn.commit()
        conn.close()
        
    def track_error(self, application: str, error_type: str, error_message: str,
                   stack_trace: str = None, user_id: str = None, severity: str = "medium"):
        """Track application errors"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO error_tracking 
            (application, error_type, error_message, stack_trace, user_id, severity)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            application, error_type, error_message, stack_trace, user_id, severity
        ))
        
        conn.commit()
        conn.close()
        
    def get_user_analytics_summary(self, days: int = 7) -> Dict[str, Any]:
        """Get user analytics summary for the last N days"""
        conn = sqlite3.connect(self.db_path)
        
        # Get user activity
        df_users = pd.read_sql_query("""
            SELECT 
                application,
                COUNT(DISTINCT user_id) as unique_users,
                COUNT(*) as total_events,
                DATE(timestamp) as date
            FROM user_analytics 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY application, DATE(timestamp)
        """.format(days), conn)
        
        # Get popular events
        df_events = pd.read_sql_query("""
            SELECT 
                event_type,
                application,
                COUNT(*) as event_count
            FROM user_analytics 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY event_type, application
            ORDER BY event_count DESC
        """.format(days), conn)
        
        conn.close()
        
        return {
            "user_activity": df_users.to_dict('records') if not df_users.empty else [],
            "popular_events": df_events.to_dict('records') if not df_events.empty else [],
            "total_unique_users": len(df_users['unique_users'].unique()) if not df_users.empty else 0,
            "total_events": df_users['total_events'].sum() if not df_users.empty else 0
        }
        
    def get_performance_summary(self, days: int = 7) -> Dict[str, Any]:
        """Get performance analytics summary"""
        conn = sqlite3.connect(self.db_path)
        
        df_performance = pd.read_sql_query("""
            SELECT 
                application,
                metric_type,
                AVG(metric_value) as avg_value,
                MIN(metric_value) as min_value,
                MAX(metric_value) as max_value,
                COUNT(*) as measurements
            FROM app_performance 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY application, metric_type
        """.format(days), conn)
        
        conn.close()
        
        return {
            "performance_metrics": df_performance.to_dict('records') if not df_performance.empty else []
        }
        
    def get_business_summary(self, days: int = 30) -> Dict[str, Any]:
        """Get business metrics summary"""
        conn = sqlite3.connect(self.db_path)
        
        df_business = pd.read_sql_query("""
            SELECT 
                metric_category,
                metric_name,
                AVG(metric_value) as avg_value,
                SUM(metric_value) as total_value,
                COUNT(*) as records,
                DATE(timestamp) as date
            FROM business_metrics 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY metric_category, metric_name, DATE(timestamp)
            ORDER BY timestamp DESC
        """.format(days), conn)
        
        conn.close()
        
        return {
            "business_metrics": df_business.to_dict('records') if not df_business.empty else []
        }
        
    def get_error_summary(self, days: int = 7) -> Dict[str, Any]:
        """Get error tracking summary"""
        conn = sqlite3.connect(self.db_path)
        
        df_errors = pd.read_sql_query("""
            SELECT 
                application,
                error_type,
                severity,
                COUNT(*) as error_count,
                COUNT(CASE WHEN resolved = 1 THEN 1 END) as resolved_count
            FROM error_tracking 
            WHERE timestamp >= datetime('now', '-{} days')
            GROUP BY application, error_type, severity
            ORDER BY error_count DESC
        """.format(days), conn)
        
        conn.close()
        
        return {
            "error_summary": df_errors.to_dict('records') if not df_errors.empty else [],
            "total_errors": df_errors['error_count'].sum() if not df_errors.empty else 0,
            "total_resolved": df_errors['resolved_count'].sum() if not df_errors.empty else 0
        }
        
    async def collect_real_time_metrics(self):
        """Collect real-time metrics from all CODAI applications"""
        applications = [
            {"name": "MemorAI", "url": "https://memorai.codai.ro/api/metrics"},
            {"name": "Admin", "url": "https://admin.codai.ro/api/metrics"},
            {"name": "Hub", "url": "https://hub.codai.ro/api/metrics"},
            {"name": "Control", "url": "https://control.codai.ro/api/metrics"},
            {"name": "RomAI", "url": "https://romai.codai.ro/api/metrics"},
            {"name": "BancAI", "url": "https://bancai.codai.ro/api/metrics"},
            {"name": "ID", "url": "https://id.codai.ro/api/metrics"},
            {"name": "Apps", "url": "https://apps.codai.ro/api/metrics"},
            {"name": "Gateway", "url": "https://gateway.codai.ro/api/metrics"},
            {"name": "API", "url": "https://api.codai.ro/api/metrics"}
        ]
        
        async with aiohttp.ClientSession() as session:
            for app in applications:
                try:
                    async with session.get(app["url"], timeout=10) as response:
                        if response.status == 200:
                            metrics = await response.json()
                            await self.process_application_metrics(app["name"], metrics)
                        else:
                            self.track_error(
                                app["name"], 
                                "metrics_collection_failed", 
                                f"HTTP {response.status}",
                                severity="low"
                            )
                except Exception as e:
                    self.track_error(
                        app["name"], 
                        "metrics_collection_error", 
                        str(e),
                        severity="medium"
                    )
                    
    async def process_application_metrics(self, app_name: str, metrics: Dict[str, Any]):
        """Process metrics received from application"""
        if "performance" in metrics:
            perf = metrics["performance"]
            if "response_time" in perf:
                self.track_performance_metric(app_name, "response_time", perf["response_time"])
            if "memory_usage" in perf:
                self.track_performance_metric(app_name, "memory_usage", perf["memory_usage"])
            if "cpu_usage" in perf:
                self.track_performance_metric(app_name, "cpu_usage", perf["cpu_usage"])
                
        if "business" in metrics:
            business = metrics["business"]
            for metric_name, value in business.items():
                if isinstance(value, (int, float)):
                    self.track_business_metric(metric_name, value, "application_metrics", 
                                             {"application": app_name})
                    
    def generate_comprehensive_report(self, days: int = 7) -> Dict[str, Any]:
        """Generate comprehensive analytics report"""
        return {
            "report_period": f"Last {days} days",
            "generated_at": datetime.now().isoformat(),
            "user_analytics": self.get_user_analytics_summary(days),
            "performance_analytics": self.get_performance_summary(days),
            "business_analytics": self.get_business_summary(days),
            "error_analytics": self.get_error_summary(days),
            "recommendations": self.generate_recommendations()
        }
        
    def generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations based on analytics"""
        recommendations = []
        
        # Check error rates
        error_summary = self.get_error_summary(7)
        if error_summary["total_errors"] > 100:
            recommendations.append("High error rate detected. Consider implementing better error handling.")
            
        # Check performance
        perf_summary = self.get_performance_summary(7)
        if perf_summary["performance_metrics"]:
            avg_response_times = [
                m for m in perf_summary["performance_metrics"] 
                if m["metric_type"] == "response_time"
            ]
            if avg_response_times and any(m["avg_value"] > 1000 for m in avg_response_times):
                recommendations.append("Some applications have slow response times. Consider optimization.")
                
        # Check user engagement
        user_summary = self.get_user_analytics_summary(7)
        if user_summary["total_unique_users"] < 100:
            recommendations.append("Low user engagement. Consider marketing and user experience improvements.")
            
        if not recommendations:
            recommendations.append("All metrics look healthy. Continue monitoring for optimization opportunities.")
            
        return recommendations

# Analytics API endpoints for integration
class AnalyticsAPI:
    """REST API for analytics data"""
    
    def __init__(self, bi_system: CODAIBusinessIntelligence):
        self.bi = bi_system
        
    async def get_dashboard_data(self) -> Dict[str, Any]:
        """Get data for analytics dashboard"""
        return {
            "overview": self.bi.get_user_analytics_summary(7),
            "performance": self.bi.get_performance_summary(7),
            "business": self.bi.get_business_summary(30),
            "errors": self.bi.get_error_summary(7),
            "recommendations": self.bi.generate_recommendations()
        }
        
    async def get_user_insights(self, user_id: str) -> Dict[str, Any]:
        """Get insights for specific user"""
        conn = sqlite3.connect(self.bi.db_path)
        
        df_user = pd.read_sql_query("""
            SELECT 
                application,
                event_type,
                COUNT(*) as event_count,
                MIN(timestamp) as first_seen,
                MAX(timestamp) as last_seen
            FROM user_analytics 
            WHERE user_id = ?
            GROUP BY application, event_type
        """, conn, params=[user_id])
        
        conn.close()
        
        return {
            "user_id": user_id,
            "activity": df_user.to_dict('records') if not df_user.empty else [],
            "total_events": df_user['event_count'].sum() if not df_user.empty else 0,
            "applications_used": df_user['application'].nunique() if not df_user.empty else 0
        }

# Initialize business intelligence system
if __name__ == "__main__":
    # Example usage
    bi = CODAIBusinessIntelligence()
    
    # Track sample events
    bi.track_user_event("user123", "MemorAI", "page_view", {"page": "/dashboard"})
    bi.track_performance_metric("MemorAI", "response_time", 850.5)
    bi.track_business_metric("revenue", 1250.00, "sales")
    
    # Generate report
    report = bi.generate_comprehensive_report()
    print(json.dumps(report, indent=2, default=str))
