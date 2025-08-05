#!/usr/bin/env python3
"""
📊 RomAI Live Performance Monitoring System
===============================================

Real-time performance monitoring and alerting system for Romanian AI applications in production.
Monitors performance, user interactions, and Romanian-specific metrics.

Week 4 Day 4: Production Deployment & Real-world Validation
Author: RomAI Development Team
Date: August 3, 2025
"""

import asyncio
import json
import sqlite3
import time
import datetime
import logging
import statistics
import threading
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any, Tuple, Union
from enum import Enum
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
import queue
import random
import psutil
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('live_performance_monitoring.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AlertLevel(Enum):
    """Alert severity levels"""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    INFO = "info"

class MetricType(Enum):
    """Types of metrics being monitored"""
    PERFORMANCE = "performance"
    ROMANIAN_PROCESSING = "romanian_processing"
    USER_EXPERIENCE = "user_experience"
    SYSTEM_HEALTH = "system_health"
    BUSINESS_METRICS = "business_metrics"
    SECURITY = "security"

@dataclass
class PerformanceMetric:
    """Performance metric data point"""
    metric_id: str
    metric_type: MetricType
    name: str
    value: float
    unit: str
    timestamp: datetime.datetime
    tags: Dict[str, str]
    threshold_critical: Optional[float] = None
    threshold_warning: Optional[float] = None

@dataclass
class Alert:
    """System alert"""
    alert_id: str
    level: AlertLevel
    title: str
    description: str
    metric_id: str
    current_value: float
    threshold_value: float
    timestamp: datetime.datetime
    resolved: bool = False
    resolved_at: Optional[datetime.datetime] = None

@dataclass
class RomanianUserSession:
    """Romanian user session tracking"""
    session_id: str
    user_id: str
    location: str
    language_preference: str
    start_time: datetime.datetime
    end_time: Optional[datetime.datetime]
    interactions_count: int
    satisfaction_score: Optional[float]
    cultural_context_accuracy: float
    diacritic_processing_accuracy: float

class SystemMetricsCollector:
    """Collects system-level performance metrics"""
    
    def __init__(self):
        self.collection_interval = 1.0  # seconds
        self.is_collecting = False
        self.metrics_queue = queue.Queue()
        
    async def collect_system_metrics(self) -> Dict[str, PerformanceMetric]:
        """Collect comprehensive system metrics"""
        timestamp = datetime.datetime.now()
        
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=0.1)
        cpu_count = psutil.cpu_count()
        
        # Memory metrics
        memory = psutil.virtual_memory()
        memory_percent = memory.percent
        memory_available_gb = memory.available / (1024**3)
        memory_used_gb = memory.used / (1024**3)
        
        # Disk metrics
        disk = psutil.disk_usage('/')
        disk_percent = (disk.used / disk.total) * 100
        disk_free_gb = disk.free / (1024**3)
        
        # Network metrics (simulated for Romanian traffic)
        network_io = psutil.net_io_counters()
        
        metrics = {
            "cpu_utilization": PerformanceMetric(
                metric_id="sys_cpu_util",
                metric_type=MetricType.SYSTEM_HEALTH,
                name="CPU Utilization",
                value=cpu_percent,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "system", "type": "cpu"},
                threshold_critical=90.0,
                threshold_warning=75.0
            ),
            "memory_utilization": PerformanceMetric(
                metric_id="sys_mem_util",
                metric_type=MetricType.SYSTEM_HEALTH,
                name="Memory Utilization",
                value=memory_percent,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "system", "type": "memory"},
                threshold_critical=85.0,
                threshold_warning=70.0
            ),
            "memory_available": PerformanceMetric(
                metric_id="sys_mem_avail",
                metric_type=MetricType.SYSTEM_HEALTH,
                name="Available Memory",
                value=memory_available_gb,
                unit="GB",
                timestamp=timestamp,
                tags={"component": "system", "type": "memory"}
            ),
            "disk_utilization": PerformanceMetric(
                metric_id="sys_disk_util",
                metric_type=MetricType.SYSTEM_HEALTH,
                name="Disk Utilization",
                value=disk_percent,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "system", "type": "disk"},
                threshold_critical=90.0,
                threshold_warning=80.0
            ),
            "disk_free_space": PerformanceMetric(
                metric_id="sys_disk_free",
                metric_type=MetricType.SYSTEM_HEALTH,
                name="Free Disk Space",
                value=disk_free_gb,
                unit="GB",
                timestamp=timestamp,
                tags={"component": "system", "type": "disk"}
            )
        }
        
        return metrics

class RomanianMetricsCollector:
    """Collects Romanian-specific AI performance metrics"""
    
    def __init__(self):
        self.romanian_sessions = {}
        self.processing_times = []
        self.cultural_accuracy_scores = []
        self.diacritic_accuracy_scores = []
        
    async def collect_romanian_metrics(self) -> Dict[str, PerformanceMetric]:
        """Collect Romanian AI processing metrics"""
        timestamp = datetime.datetime.now()
        
        # Simulate Romanian processing metrics
        current_users = len(self.romanian_sessions)
        avg_processing_time = statistics.mean(self.processing_times[-100:]) if self.processing_times else 0
        avg_cultural_accuracy = statistics.mean(self.cultural_accuracy_scores[-100:]) if self.cultural_accuracy_scores else 0
        avg_diacritic_accuracy = statistics.mean(self.diacritic_accuracy_scores[-100:]) if self.diacritic_accuracy_scores else 100
        
        # Generate realistic metrics with some randomness
        romanian_users_active = max(0, current_users + random.randint(-5, 15))
        romanian_processing_time = max(50, avg_processing_time + random.uniform(-20, 50))
        cultural_context_accuracy = max(60, min(100, avg_cultural_accuracy + random.uniform(-10, 15)))
        diacritic_preservation = max(90, min(100, avg_diacritic_accuracy + random.uniform(-5, 5)))
        romanian_satisfaction = max(70, min(100, cultural_context_accuracy + random.uniform(-10, 10)))
        
        # Update internal tracking
        self.processing_times.append(romanian_processing_time)
        self.cultural_accuracy_scores.append(cultural_context_accuracy)
        self.diacritic_accuracy_scores.append(diacritic_preservation)
        
        # Keep only recent data
        if len(self.processing_times) > 1000:
            self.processing_times = self.processing_times[-500:]
            self.cultural_accuracy_scores = self.cultural_accuracy_scores[-500:]
            self.diacritic_accuracy_scores = self.diacritic_accuracy_scores[-500:]
        
        metrics = {
            "romanian_active_users": PerformanceMetric(
                metric_id="ro_active_users",
                metric_type=MetricType.ROMANIAN_PROCESSING,
                name="Active Romanian Users",
                value=romanian_users_active,
                unit="users",
                timestamp=timestamp,
                tags={"language": "romanian", "type": "users"}
            ),
            "romanian_processing_time": PerformanceMetric(
                metric_id="ro_proc_time",
                metric_type=MetricType.ROMANIAN_PROCESSING,
                name="Romanian Processing Time",
                value=romanian_processing_time,
                unit="ms",
                timestamp=timestamp,
                tags={"language": "romanian", "type": "performance"},
                threshold_critical=1000.0,
                threshold_warning=500.0
            ),
            "cultural_context_accuracy": PerformanceMetric(
                metric_id="ro_cultural_acc",
                metric_type=MetricType.ROMANIAN_PROCESSING,
                name="Cultural Context Accuracy",
                value=cultural_context_accuracy,
                unit="percent",
                timestamp=timestamp,
                tags={"language": "romanian", "type": "accuracy"},
                threshold_critical=60.0,
                threshold_warning=75.0
            ),
            "diacritic_preservation": PerformanceMetric(
                metric_id="ro_diacritic_pres",
                metric_type=MetricType.ROMANIAN_PROCESSING,
                name="Diacritic Preservation",
                value=diacritic_preservation,
                unit="percent",
                timestamp=timestamp,
                tags={"language": "romanian", "type": "linguistics"},
                threshold_critical=90.0,
                threshold_warning=95.0
            ),
            "romanian_user_satisfaction": PerformanceMetric(
                metric_id="ro_user_sat",
                metric_type=MetricType.USER_EXPERIENCE,
                name="Romanian User Satisfaction",
                value=romanian_satisfaction,
                unit="percent",
                timestamp=timestamp,
                tags={"language": "romanian", "type": "satisfaction"},
                threshold_critical=70.0,
                threshold_warning=80.0
            )
        }
        
        return metrics
    
    def track_romanian_interaction(self, processing_time: float, cultural_accuracy: float, 
                                 diacritic_accuracy: float):
        """Track a Romanian interaction"""
        self.processing_times.append(processing_time)
        self.cultural_accuracy_scores.append(cultural_accuracy)
        self.diacritic_accuracy_scores.append(diacritic_accuracy)

class ApplicationMetricsCollector:
    """Collects application-level performance metrics"""
    
    def __init__(self):
        self.request_times = []
        self.error_counts = {"total": 0, "romanian": 0}
        self.throughput_data = []
        
    async def collect_application_metrics(self) -> Dict[str, PerformanceMetric]:
        """Collect application performance metrics"""
        timestamp = datetime.datetime.now()
        
        # Simulate application metrics
        avg_response_time = statistics.mean(self.request_times[-100:]) if self.request_times else 200
        current_throughput = len(self.request_times[-60:])  # requests in last minute
        error_rate = (self.error_counts["total"] / max(1, len(self.request_times))) * 100 if self.request_times else 0
        romanian_error_rate = (self.error_counts["romanian"] / max(1, len(self.request_times))) * 100 if self.request_times else 0
        
        # Add some realistic variation
        response_time = max(50, avg_response_time + random.uniform(-50, 100))
        throughput = max(0, current_throughput + random.randint(-10, 20))
        total_requests = len(self.request_times)
        
        # Update tracking
        self.request_times.append(response_time)
        self.throughput_data.append(throughput)
        
        # Simulate occasional errors
        if random.random() < 0.02:  # 2% chance of error
            self.error_counts["total"] += 1
            if random.random() < 0.3:  # 30% of errors are Romanian-related
                self.error_counts["romanian"] += 1
        
        # Keep only recent data
        if len(self.request_times) > 1000:
            self.request_times = self.request_times[-500:]
            self.throughput_data = self.throughput_data[-500:]
        
        metrics = {
            "response_time": PerformanceMetric(
                metric_id="app_response_time",
                metric_type=MetricType.PERFORMANCE,
                name="Average Response Time",
                value=response_time,
                unit="ms",
                timestamp=timestamp,
                tags={"component": "application", "type": "latency"},
                threshold_critical=2000.0,
                threshold_warning=1000.0
            ),
            "throughput": PerformanceMetric(
                metric_id="app_throughput",
                metric_type=MetricType.PERFORMANCE,
                name="Request Throughput",
                value=throughput,
                unit="req/min",
                timestamp=timestamp,
                tags={"component": "application", "type": "throughput"}
            ),
            "total_requests": PerformanceMetric(
                metric_id="app_total_req",
                metric_type=MetricType.PERFORMANCE,
                name="Total Requests",
                value=total_requests,
                unit="count",
                timestamp=timestamp,
                tags={"component": "application", "type": "counter"}
            ),
            "error_rate": PerformanceMetric(
                metric_id="app_error_rate",
                metric_type=MetricType.PERFORMANCE,
                name="Error Rate",
                value=error_rate,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "application", "type": "errors"},
                threshold_critical=5.0,
                threshold_warning=2.0
            ),
            "romanian_error_rate": PerformanceMetric(
                metric_id="app_ro_error_rate",
                metric_type=MetricType.ROMANIAN_PROCESSING,
                name="Romanian Error Rate",
                value=romanian_error_rate,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "application", "type": "errors", "language": "romanian"},
                threshold_critical=3.0,
                threshold_warning=1.0
            )
        }
        
        return metrics

class BusinessMetricsCollector:
    """Collects business and user engagement metrics"""
    
    def __init__(self):
        self.user_sessions = []
        self.romanian_regions = {
            "București": 0,
            "Cluj-Napoca": 0,
            "Timișoara": 0,
            "Iași": 0,
            "Constanța": 0,
            "Craiova": 0,
            "Other": 0
        }
        
    async def collect_business_metrics(self) -> Dict[str, PerformanceMetric]:
        """Collect business and engagement metrics"""
        timestamp = datetime.datetime.now()
        
        # Simulate business metrics
        daily_active_users = random.randint(450, 650)
        romanian_users_percentage = random.uniform(75, 95)
        average_session_duration = random.uniform(8, 25)  # minutes
        user_retention_rate = random.uniform(82, 94)
        conversion_rate = random.uniform(12, 28)  # percentage
        
        # Regional distribution (simulated)
        total_regional_users = sum(self.romanian_regions.values()) + random.randint(20, 80)
        
        # Update regional data with some variation
        for region in self.romanian_regions:
            change = random.randint(-5, 15)
            self.romanian_regions[region] = max(0, self.romanian_regions[region] + change)
        
        metrics = {
            "daily_active_users": PerformanceMetric(
                metric_id="biz_dau",
                metric_type=MetricType.BUSINESS_METRICS,
                name="Daily Active Users",
                value=daily_active_users,
                unit="users",
                timestamp=timestamp,
                tags={"component": "business", "type": "engagement"}
            ),
            "romanian_users_percentage": PerformanceMetric(
                metric_id="biz_ro_users_pct",
                metric_type=MetricType.BUSINESS_METRICS,
                name="Romanian Users Percentage",
                value=romanian_users_percentage,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "business", "type": "demographics", "language": "romanian"}
            ),
            "average_session_duration": PerformanceMetric(
                metric_id="biz_avg_session",
                metric_type=MetricType.BUSINESS_METRICS,
                name="Average Session Duration",
                value=average_session_duration,
                unit="minutes",
                timestamp=timestamp,
                tags={"component": "business", "type": "engagement"}
            ),
            "user_retention_rate": PerformanceMetric(
                metric_id="biz_retention",
                metric_type=MetricType.BUSINESS_METRICS,
                name="User Retention Rate",
                value=user_retention_rate,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "business", "type": "retention"},
                threshold_critical=70.0,
                threshold_warning=80.0
            ),
            "conversion_rate": PerformanceMetric(
                metric_id="biz_conversion",
                metric_type=MetricType.BUSINESS_METRICS,
                name="Conversion Rate",
                value=conversion_rate,
                unit="percent",
                timestamp=timestamp,
                tags={"component": "business", "type": "conversion"}
            ),
            "regional_users_total": PerformanceMetric(
                metric_id="biz_regional_total",
                metric_type=MetricType.BUSINESS_METRICS,
                name="Total Regional Users",
                value=total_regional_users,
                unit="users",
                timestamp=timestamp,
                tags={"component": "business", "type": "geography", "country": "romania"}
            )
        }
        
        return metrics

class AlertManager:
    """Manages alerts and notifications"""
    
    def __init__(self):
        self.active_alerts = {}
        self.alert_history = []
        self.db_path = "live_monitoring_alerts.db"
        self.init_database()
        
    def init_database(self):
        """Initialize alerts database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT UNIQUE NOT NULL,
                level TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                metric_id TEXT NOT NULL,
                current_value REAL NOT NULL,
                threshold_value REAL NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolved BOOLEAN DEFAULT FALSE,
                resolved_at TIMESTAMP
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metric_id TEXT NOT NULL,
                metric_type TEXT NOT NULL,
                name TEXT NOT NULL,
                value REAL NOT NULL,
                unit TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tags TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def check_thresholds(self, metrics: Dict[str, PerformanceMetric]) -> List[Alert]:
        """Check metrics against thresholds and generate alerts"""
        new_alerts = []
        
        for metric_id, metric in metrics.items():
            alert_level = None
            threshold_value = None
            
            # Check critical threshold
            if metric.threshold_critical is not None:
                if (metric.name in ["CPU Utilization", "Memory Utilization", "Disk Utilization", 
                                   "Error Rate", "Romanian Error Rate"]):
                    # Higher values are bad
                    if metric.value >= metric.threshold_critical:
                        alert_level = AlertLevel.CRITICAL
                        threshold_value = metric.threshold_critical
                    elif metric.threshold_warning and metric.value >= metric.threshold_warning:
                        alert_level = AlertLevel.HIGH
                        threshold_value = metric.threshold_warning
                else:
                    # Lower values are bad (like Cultural Context Accuracy)
                    if metric.value <= metric.threshold_critical:
                        alert_level = AlertLevel.CRITICAL
                        threshold_value = metric.threshold_critical
                    elif metric.threshold_warning and metric.value <= metric.threshold_warning:
                        alert_level = AlertLevel.HIGH
                        threshold_value = metric.threshold_warning
            
            # Generate alert if threshold exceeded
            if alert_level:
                alert_id = f"alert_{metric_id}_{int(time.time())}"
                
                # Check if similar alert already exists
                existing_alert = None
                for existing_id, existing in self.active_alerts.items():
                    if existing.metric_id == metric.metric_id and not existing.resolved:
                        existing_alert = existing
                        break
                
                if not existing_alert:
                    alert = Alert(
                        alert_id=alert_id,
                        level=alert_level,
                        title=f"{metric.name} {alert_level.value.title()} Alert",
                        description=f"{metric.name} is {metric.value:.2f} {metric.unit}, "
                                  f"{'above' if 'utilization' in metric.name.lower() or 'rate' in metric.name.lower() else 'below'} "
                                  f"{alert_level.value} threshold of {threshold_value:.2f} {metric.unit}",
                        metric_id=metric.metric_id,
                        current_value=metric.value,
                        threshold_value=threshold_value,
                        timestamp=datetime.datetime.now()
                    )
                    
                    self.active_alerts[alert_id] = alert
                    new_alerts.append(alert)
                    self._store_alert(alert)
        
        return new_alerts
    
    def _store_alert(self, alert: Alert):
        """Store alert in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO alerts 
            (alert_id, level, title, description, metric_id, current_value, threshold_value, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            alert.alert_id,
            alert.level.value,
            alert.title,
            alert.description,
            alert.metric_id,
            alert.current_value,
            alert.threshold_value,
            alert.timestamp.isoformat()
        ))
        
        conn.commit()
        conn.close()
    
    def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an active alert"""
        if alert_id in self.active_alerts:
            alert = self.active_alerts[alert_id]
            alert.resolved = True
            alert.resolved_at = datetime.datetime.now()
            
            # Update database
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE alerts SET resolved = TRUE, resolved_at = ? WHERE alert_id = ?
            ''', (alert.resolved_at.isoformat(), alert_id))
            conn.commit()
            conn.close()
            
            return True
        return False
    
    def get_active_alerts(self) -> List[Alert]:
        """Get all active alerts"""
        return [alert for alert in self.active_alerts.values() if not alert.resolved]
    
    def get_alert_summary(self) -> Dict[str, Any]:
        """Get alert summary statistics"""
        active_alerts = self.get_active_alerts()
        
        summary = {
            "total_active": len(active_alerts),
            "by_level": {level.value: 0 for level in AlertLevel},
            "romanian_specific": 0,
            "system_health": 0,
            "performance": 0
        }
        
        for alert in active_alerts:
            summary["by_level"][alert.level.value] += 1
            
            if "romanian" in alert.metric_id.lower() or "ro_" in alert.metric_id:
                summary["romanian_specific"] += 1
            
            if "sys_" in alert.metric_id:
                summary["system_health"] += 1
            elif "app_" in alert.metric_id:
                summary["performance"] += 1
        
        return summary

class LiveMonitoringDashboard:
    """Main live monitoring dashboard"""
    
    def __init__(self):
        self.system_collector = SystemMetricsCollector()
        self.romanian_collector = RomanianMetricsCollector()
        self.app_collector = ApplicationMetricsCollector()
        self.business_collector = BusinessMetricsCollector()
        self.alert_manager = AlertManager()
        
        self.is_monitoring = False
        self.monitoring_interval = 5.0  # seconds
        self.metrics_history = []
        
    async def start_monitoring(self):
        """Start live monitoring"""
        self.is_monitoring = True
        logger.info("Starting live performance monitoring...")
        
        while self.is_monitoring:
            try:
                # Collect all metrics
                all_metrics = {}
                
                system_metrics = await self.system_collector.collect_system_metrics()
                all_metrics.update(system_metrics)
                
                romanian_metrics = await self.romanian_collector.collect_romanian_metrics()
                all_metrics.update(romanian_metrics)
                
                app_metrics = await self.app_collector.collect_application_metrics()
                all_metrics.update(app_metrics)
                
                business_metrics = await self.business_collector.collect_business_metrics()
                all_metrics.update(business_metrics)
                
                # Store metrics
                await self._store_metrics(all_metrics)
                
                # Check for alerts
                new_alerts = self.alert_manager.check_thresholds(all_metrics)
                if new_alerts:
                    for alert in new_alerts:
                        logger.warning(f"NEW ALERT: {alert.title} - {alert.description}")
                
                # Keep metrics history
                self.metrics_history.append({
                    "timestamp": datetime.datetime.now(),
                    "metrics": all_metrics
                })
                
                # Keep only recent history
                if len(self.metrics_history) > 100:
                    self.metrics_history = self.metrics_history[-50:]
                
                await asyncio.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"Error in monitoring loop: {str(e)}")
                await asyncio.sleep(1.0)
    
    def stop_monitoring(self):
        """Stop live monitoring"""
        self.is_monitoring = False
        logger.info("Stopping live performance monitoring")
    
    async def _store_metrics(self, metrics: Dict[str, PerformanceMetric]):
        """Store metrics in database"""
        conn = sqlite3.connect(self.alert_manager.db_path)
        cursor = conn.cursor()
        
        for metric_id, metric in metrics.items():
            cursor.execute('''
                INSERT INTO metrics_history 
                (metric_id, metric_type, name, value, unit, tags)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                metric.metric_id,
                metric.metric_type.value,
                metric.name,
                metric.value,
                metric.unit,
                json.dumps(metric.tags)
            ))
        
        conn.commit()
        conn.close()
    
    def get_current_status(self) -> Dict[str, Any]:
        """Get current system status"""
        if not self.metrics_history:
            return {"status": "No data available"}
        
        latest_metrics = self.metrics_history[-1]["metrics"]
        alert_summary = self.alert_manager.get_alert_summary()
        
        # Calculate health scores
        system_health = self._calculate_system_health(latest_metrics)
        romanian_performance = self._calculate_romanian_performance(latest_metrics)
        user_experience = self._calculate_user_experience(latest_metrics)
        business_health = self._calculate_business_health(latest_metrics)
        
        status = {
            "timestamp": datetime.datetime.now().isoformat(),
            "monitoring_active": self.is_monitoring,
            "overall_health_score": (system_health + romanian_performance + user_experience + business_health) / 4,
            "component_health": {
                "system": system_health,
                "romanian_processing": romanian_performance,
                "user_experience": user_experience,
                "business_metrics": business_health
            },
            "key_metrics": {
                "active_romanian_users": latest_metrics.get("romanian_active_users", {}).value if "romanian_active_users" in latest_metrics else 0,
                "response_time_ms": latest_metrics.get("response_time", {}).value if "response_time" in latest_metrics else 0,
                "cultural_accuracy": latest_metrics.get("cultural_context_accuracy", {}).value if "cultural_context_accuracy" in latest_metrics else 0,
                "diacritic_preservation": latest_metrics.get("diacritic_preservation", {}).value if "diacritic_preservation" in latest_metrics else 0,
                "user_satisfaction": latest_metrics.get("romanian_user_satisfaction", {}).value if "romanian_user_satisfaction" in latest_metrics else 0
            },
            "alerts": alert_summary,
            "data_points_collected": len(self.metrics_history)
        }
        
        return status
    
    def _calculate_system_health(self, metrics: Dict[str, PerformanceMetric]) -> float:
        """Calculate system health score"""
        health_factors = []
        
        if "cpu_utilization" in metrics:
            cpu_score = max(0, 100 - metrics["cpu_utilization"].value)
            health_factors.append(cpu_score)
        
        if "memory_utilization" in metrics:
            memory_score = max(0, 100 - metrics["memory_utilization"].value)
            health_factors.append(memory_score)
        
        if "disk_utilization" in metrics:
            disk_score = max(0, 100 - metrics["disk_utilization"].value)
            health_factors.append(disk_score)
        
        return statistics.mean(health_factors) if health_factors else 50.0
    
    def _calculate_romanian_performance(self, metrics: Dict[str, PerformanceMetric]) -> float:
        """Calculate Romanian processing performance score"""
        performance_factors = []
        
        if "romanian_processing_time" in metrics:
            # Lower processing time is better (invert score)
            time_score = max(0, 100 - (metrics["romanian_processing_time"].value / 10))
            performance_factors.append(time_score)
        
        if "cultural_context_accuracy" in metrics:
            performance_factors.append(metrics["cultural_context_accuracy"].value)
        
        if "diacritic_preservation" in metrics:
            performance_factors.append(metrics["diacritic_preservation"].value)
        
        return statistics.mean(performance_factors) if performance_factors else 50.0
    
    def _calculate_user_experience(self, metrics: Dict[str, PerformanceMetric]) -> float:
        """Calculate user experience score"""
        ux_factors = []
        
        if "romanian_user_satisfaction" in metrics:
            ux_factors.append(metrics["romanian_user_satisfaction"].value)
        
        if "response_time" in metrics:
            # Lower response time is better
            response_score = max(0, 100 - (metrics["response_time"].value / 20))
            ux_factors.append(response_score)
        
        if "error_rate" in metrics:
            # Lower error rate is better
            error_score = max(0, 100 - (metrics["error_rate"].value * 10))
            ux_factors.append(error_score)
        
        return statistics.mean(ux_factors) if ux_factors else 50.0
    
    def _calculate_business_health(self, metrics: Dict[str, PerformanceMetric]) -> float:
        """Calculate business health score"""
        business_factors = []
        
        if "user_retention_rate" in metrics:
            business_factors.append(metrics["user_retention_rate"].value)
        
        if "romanian_users_percentage" in metrics:
            # High Romanian user percentage is good for our use case
            business_factors.append(metrics["romanian_users_percentage"].value)
        
        if "conversion_rate" in metrics:
            # Normalize conversion rate to 0-100 scale
            conversion_normalized = min(100, metrics["conversion_rate"].value * 3)
            business_factors.append(conversion_normalized)
        
        return statistics.mean(business_factors) if business_factors else 50.0
    
    def get_romanian_analytics(self) -> Dict[str, Any]:
        """Get Romanian-specific analytics"""
        if not self.metrics_history:
            return {"status": "No data available"}
        
        recent_metrics = [entry["metrics"] for entry in self.metrics_history[-10:]]
        
        # Calculate trends
        cultural_accuracy_trend = []
        diacritic_trend = []
        processing_time_trend = []
        user_satisfaction_trend = []
        
        for metrics in recent_metrics:
            if "cultural_context_accuracy" in metrics:
                cultural_accuracy_trend.append(metrics["cultural_context_accuracy"].value)
            if "diacritic_preservation" in metrics:
                diacritic_trend.append(metrics["diacritic_preservation"].value)
            if "romanian_processing_time" in metrics:
                processing_time_trend.append(metrics["romanian_processing_time"].value)
            if "romanian_user_satisfaction" in metrics:
                user_satisfaction_trend.append(metrics["romanian_user_satisfaction"].value)
        
        analytics = {
            "current_performance": {
                "cultural_accuracy": cultural_accuracy_trend[-1] if cultural_accuracy_trend else 0,
                "diacritic_preservation": diacritic_trend[-1] if diacritic_trend else 0,
                "processing_time_ms": processing_time_trend[-1] if processing_time_trend else 0,
                "user_satisfaction": user_satisfaction_trend[-1] if user_satisfaction_trend else 0
            },
            "trends": {
                "cultural_accuracy": {
                    "average": statistics.mean(cultural_accuracy_trend) if cultural_accuracy_trend else 0,
                    "min": min(cultural_accuracy_trend) if cultural_accuracy_trend else 0,
                    "max": max(cultural_accuracy_trend) if cultural_accuracy_trend else 0,
                    "trend": "improving" if len(cultural_accuracy_trend) >= 2 and cultural_accuracy_trend[-1] > cultural_accuracy_trend[0] else "stable"
                },
                "diacritic_preservation": {
                    "average": statistics.mean(diacritic_trend) if diacritic_trend else 0,
                    "min": min(diacritic_trend) if diacritic_trend else 0,
                    "max": max(diacritic_trend) if diacritic_trend else 0,
                    "trend": "stable"  # Diacritics should be consistently high
                },
                "processing_time": {
                    "average": statistics.mean(processing_time_trend) if processing_time_trend else 0,
                    "min": min(processing_time_trend) if processing_time_trend else 0,
                    "max": max(processing_time_trend) if processing_time_trend else 0,
                    "trend": "improving" if len(processing_time_trend) >= 2 and processing_time_trend[-1] < processing_time_trend[0] else "stable"
                }
            },
            "romanian_specific_alerts": len([alert for alert in self.alert_manager.get_active_alerts() 
                                           if "romanian" in alert.metric_id.lower()]),
            "data_quality_score": min(100, len(recent_metrics) * 10),  # Score based on data availability
            "timestamp": datetime.datetime.now().isoformat()
        }
        
        return analytics

# Test function
async def test_live_performance_monitoring():
    """Test the live performance monitoring system"""
    dashboard = LiveMonitoringDashboard()
    
    print("📊 Testing Live Performance Monitoring System")
    print("=" * 60)
    
    # Start monitoring
    print("\n🚀 Starting live monitoring (will run for 30 seconds)...")
    
    # Start monitoring task
    monitoring_task = asyncio.create_task(dashboard.start_monitoring())
    
    # Let it run for a while to collect data
    await asyncio.sleep(10)
    
    # Get current status
    print("\n📈 Current System Status:")
    status = dashboard.get_current_status()
    print(f"Overall health score: {status['overall_health_score']:.1f}%")
    print(f"Monitoring active: {status['monitoring_active']}")
    print(f"Data points collected: {status['data_points_collected']}")
    
    # Component health
    print(f"\n🏥 Component Health:")
    for component, health in status['component_health'].items():
        print(f"  {component}: {health:.1f}%")
    
    # Key metrics
    print(f"\n📊 Key Metrics:")
    for metric, value in status['key_metrics'].items():
        print(f"  {metric}: {value:.1f}")
    
    # Alert summary
    print(f"\n🚨 Alert Summary:")
    alerts = status['alerts']
    print(f"  Total active alerts: {alerts['total_active']}")
    if alerts['total_active'] > 0:
        for level, count in alerts['by_level'].items():
            if count > 0:
                print(f"    {level}: {count}")
    
    # Wait a bit more
    await asyncio.sleep(5)
    
    # Get Romanian analytics
    print(f"\n🇷🇴 Romanian Analytics:")
    romanian_analytics = dashboard.get_romanian_analytics()
    current_perf = romanian_analytics['current_performance']
    print(f"  Cultural accuracy: {current_perf['cultural_accuracy']:.1f}%")
    print(f"  Diacritic preservation: {current_perf['diacritic_preservation']:.1f}%")
    print(f"  Processing time: {current_perf['processing_time_ms']:.1f}ms")
    print(f"  User satisfaction: {current_perf['user_satisfaction']:.1f}%")
    
    # Trends
    trends = romanian_analytics['trends']
    print(f"\n📈 Romanian Performance Trends:")
    for metric, trend_data in trends.items():
        print(f"  {metric}: {trend_data['trend']} (avg: {trend_data['average']:.1f})")
    
    # Simulate some Romanian interactions to test metrics
    print(f"\n🔄 Simulating Romanian interactions...")
    for i in range(5):
        dashboard.romanian_collector.track_romanian_interaction(
            processing_time=random.uniform(100, 300),
            cultural_accuracy=random.uniform(70, 95),
            diacritic_accuracy=random.uniform(95, 100)
        )
        await asyncio.sleep(1)
    
    # Wait a bit more to see the effect
    await asyncio.sleep(5)
    
    # Final status
    final_status = dashboard.get_current_status()
    print(f"\n🎯 Final Monitoring Results:")
    print(f"Overall health score: {final_status['overall_health_score']:.1f}%")
    print(f"Total data points: {final_status['data_points_collected']}")
    print(f"Romanian processing health: {final_status['component_health']['romanian_processing']:.1f}%")
    
    # Stop monitoring
    dashboard.stop_monitoring()
    monitoring_task.cancel()
    
    try:
        await monitoring_task
    except asyncio.CancelledError:
        pass
    
    print(f"\n✅ Live Performance Monitoring test completed!")
    return {
        "final_status": final_status,
        "romanian_analytics": dashboard.get_romanian_analytics(),
        "monitoring_duration": "25 seconds",
        "system_health": final_status['overall_health_score']
    }

if __name__ == "__main__":
    asyncio.run(test_live_performance_monitoring())
