"""
📊 Performance Monitoring System
===============================

Real-time performance monitoring and analytics for neural architectures
with Romanian AI specialization tracking and optimization insights.

This module provides:
- Real-time performance tracking
- Romanian AI quality monitoring
- Resource utilization analysis
- Performance trend analysis
- Automated optimization triggers

Author: RomAI AGI Development Team
Date: August 4, 2025
Version: 1.0.0
"""

import asyncio
import time
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable, NamedTuple
from dataclasses import dataclass, field
from enum import Enum
from collections import deque, defaultdict
import json
import logging
import psutil
import torch
import numpy as np
from pathlib import Path
import sqlite3
import statistics


class MetricType(Enum):
    """Types of metrics to monitor"""
    PERFORMANCE = "performance"
    MEMORY = "memory"
    THROUGHPUT = "throughput"
    LATENCY = "latency"
    ACCURACY = "accuracy"
    CULTURAL_AUTHENTICITY = "cultural_authenticity"
    ROMANIAN_QUALITY = "romanian_quality"
    RESOURCE_UTILIZATION = "resource_utilization"
    OPTIMIZATION_STATUS = "optimization_status"


class AlertLevel(Enum):
    """Alert levels for monitoring"""
    INFO = "info"
    WARNING = "warning" 
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class MonitoringInterval(Enum):
    """Monitoring intervals"""
    REALTIME = 1        # 1 second
    FREQUENT = 5        # 5 seconds  
    NORMAL = 30         # 30 seconds
    PERIODIC = 300      # 5 minutes
    HOURLY = 3600       # 1 hour


@dataclass
class MetricPoint:
    """Single metric measurement point"""
    timestamp: datetime
    metric_type: MetricType
    value: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    tags: List[str] = field(default_factory=list)


@dataclass
class PerformanceSnapshot:
    """Comprehensive performance snapshot"""
    timestamp: datetime
    accuracy: float
    inference_latency_ms: float
    throughput_tokens_per_sec: float
    memory_usage_gb: float
    gpu_utilization: float
    cpu_utilization: float
    cultural_authenticity: float
    romanian_quality_score: float
    efficiency_score: float
    model_load: float
    optimization_level: str
    active_optimizations: List[str]


@dataclass
class Alert:
    """Performance alert"""
    alert_id: str
    timestamp: datetime
    level: AlertLevel
    metric_type: MetricType
    message: str
    current_value: float
    threshold_value: float
    suggestions: List[str]
    acknowledged: bool = False


@dataclass
class TrendAnalysis:
    """Performance trend analysis results"""
    metric_type: MetricType
    time_period: timedelta
    trend_direction: str  # "improving", "degrading", "stable"
    change_rate: float
    statistical_confidence: float
    predictions: Dict[str, float]
    recommendations: List[str]


class RomanianQualityTracker:
    """
    Specialized tracker for Romanian AI quality metrics
    """
    
    def __init__(self):
        self.cultural_indicators = {
            'diacritics_accuracy': 0.0,
            'regional_awareness': 0.0,
            'cultural_context_relevance': 0.0,
            'linguistic_pattern_adherence': 0.0,
            'authentic_expression_quality': 0.0
        }
        
        self.quality_history = deque(maxlen=1000)
        self.regional_performance = defaultdict(list)
        
        # Romanian-specific quality thresholds
        self.quality_thresholds = {
            'excellent': 0.95,
            'good': 0.90,
            'acceptable': 0.85,
            'needs_improvement': 0.80
        }
    
    def measure_romanian_quality(self, model_output: Dict[str, Any]) -> Dict[str, float]:
        """Measure Romanian-specific quality metrics"""
        
        # Mock Romanian quality assessment (in real implementation, this would
        # analyze actual Romanian language output quality)
        quality_metrics = {
            'diacritics_accuracy': min(0.98, 0.92 + np.random.normal(0, 0.02)),
            'regional_awareness': min(0.97, 0.88 + np.random.normal(0, 0.03)),
            'cultural_context_relevance': min(0.96, 0.90 + np.random.normal(0, 0.025)),
            'linguistic_pattern_adherence': min(0.95, 0.87 + np.random.normal(0, 0.035)),
            'authentic_expression_quality': min(0.97, 0.89 + np.random.normal(0, 0.028))
        }
        
        # Calculate overall Romanian quality score
        weights = {
            'diacritics_accuracy': 0.25,
            'regional_awareness': 0.20,
            'cultural_context_relevance': 0.25,
            'linguistic_pattern_adherence': 0.15,
            'authentic_expression_quality': 0.15
        }
        
        overall_score = sum(
            quality_metrics[metric] * weight 
            for metric, weight in weights.items()
        )
        
        quality_metrics['overall_romanian_quality'] = overall_score
        
        # Update tracking
        self.cultural_indicators.update(quality_metrics)
        self.quality_history.append({
            'timestamp': datetime.now(),
            'metrics': quality_metrics.copy()
        })
        
        return quality_metrics
    
    def get_quality_trends(self, hours: int = 24) -> Dict[str, Any]:
        """Get Romanian quality trends over time period"""
        if not self.quality_history:
            return {}
        
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_measurements = [
            measurement for measurement in self.quality_history
            if measurement['timestamp'] >= cutoff_time
        ]
        
        if len(recent_measurements) < 2:
            return {}
        
        trends = {}
        for metric in self.cultural_indicators.keys():
            values = [m['metrics'].get(metric, 0) for m in recent_measurements]
            if values:
                trends[metric] = {
                    'current': values[-1],
                    'average': statistics.mean(values),
                    'trend': 'improving' if values[-1] > values[0] else 'degrading',
                    'change_rate': (values[-1] - values[0]) / len(values)
                }
        
        return trends
    
    def assess_regional_performance(self, region: str, score: float):
        """Track performance by Romanian region"""
        self.regional_performance[region].append({
            'timestamp': datetime.now(),
            'score': score
        })
        
        # Keep only last 100 measurements per region
        if len(self.regional_performance[region]) > 100:
            self.regional_performance[region] = self.regional_performance[region][-100:]


class ResourceMonitor:
    """
    System resource monitoring for neural model performance
    """
    
    def __init__(self):
        self.cpu_history = deque(maxlen=1000)
        self.memory_history = deque(maxlen=1000)
        self.gpu_history = deque(maxlen=1000)
        
    def get_system_metrics(self) -> Dict[str, float]:
        """Get current system resource metrics"""
        metrics = {}
        
        # CPU metrics
        metrics['cpu_percent'] = psutil.cpu_percent(interval=0.1)
        metrics['cpu_count'] = psutil.cpu_count()
        metrics['load_average'] = psutil.getloadavg()[0] if hasattr(psutil, 'getloadavg') else 0.0
        
        # Memory metrics
        memory = psutil.virtual_memory()
        metrics['memory_percent'] = memory.percent
        metrics['memory_available_gb'] = memory.available / 1e9
        metrics['memory_used_gb'] = memory.used / 1e9
        metrics['memory_total_gb'] = memory.total / 1e9
        
        # GPU metrics (if available)
        if torch.cuda.is_available():
            metrics['gpu_memory_allocated_gb'] = torch.cuda.memory_allocated() / 1e9
            metrics['gpu_memory_reserved_gb'] = torch.cuda.memory_reserved() / 1e9
            metrics['gpu_memory_max_allocated_gb'] = torch.cuda.max_memory_allocated() / 1e9
            # Use GPUtil for real GPU utilization
            try:
                import GPUtil
                gpus = GPUtil.getGPUs()
                metrics['gpu_utilization'] = gpus[0].load * 100.0 if gpus else 0.0
            except Exception:
                metrics['gpu_utilization'] = 0.0
        else:
            metrics['gpu_memory_allocated_gb'] = 0.0
            metrics['gpu_memory_reserved_gb'] = 0.0
            metrics['gpu_memory_max_allocated_gb'] = 0.0
            metrics['gpu_utilization'] = 0.0
        
        # Update histories
        timestamp = datetime.now()
        self.cpu_history.append({'timestamp': timestamp, 'value': metrics['cpu_percent']})
        self.memory_history.append({'timestamp': timestamp, 'value': metrics['memory_percent']})
        self.gpu_history.append({'timestamp': timestamp, 'value': metrics['gpu_utilization']})
        
        return metrics
    
    def get_resource_trends(self, minutes: int = 60) -> Dict[str, Any]:
        """Get resource utilization trends"""
        cutoff_time = datetime.now() - timedelta(minutes=minutes)
        
        trends = {}
        
        # CPU trends
        recent_cpu = [h for h in self.cpu_history if h['timestamp'] >= cutoff_time]
        if recent_cpu:
            cpu_values = [h['value'] for h in recent_cpu]
            trends['cpu'] = {
                'current': cpu_values[-1],
                'average': statistics.mean(cpu_values),
                'max': max(cpu_values),
                'min': min(cpu_values),
                'trend': 'increasing' if cpu_values[-1] > cpu_values[0] else 'decreasing'
            }
        
        # Memory trends
        recent_memory = [h for h in self.memory_history if h['timestamp'] >= cutoff_time]
        if recent_memory:
            memory_values = [h['value'] for h in recent_memory]
            trends['memory'] = {
                'current': memory_values[-1],
                'average': statistics.mean(memory_values),
                'max': max(memory_values),
                'min': min(memory_values),
                'trend': 'increasing' if memory_values[-1] > memory_values[0] else 'decreasing'
            }
        
        # GPU trends
        recent_gpu = [h for h in self.gpu_history if h['timestamp'] >= cutoff_time]
        if recent_gpu:
            gpu_values = [h['value'] for h in recent_gpu]
            trends['gpu'] = {
                'current': gpu_values[-1],
                'average': statistics.mean(gpu_values),
                'max': max(gpu_values),
                'min': min(gpu_values),
                'trend': 'increasing' if gpu_values[-1] > gpu_values[0] else 'decreasing'
            }
        
        return trends


class PerformanceMonitor:
    """
    Comprehensive performance monitoring system for neural architectures
    """
    
    def __init__(
        self,
        model_name: str = "RomAI",
        monitoring_interval: MonitoringInterval = MonitoringInterval.NORMAL,
        enable_alerts: bool = True,
        storage_path: Optional[str] = None
    ):
        self.model_name = model_name
        self.monitoring_interval = monitoring_interval
        self.enable_alerts = enable_alerts
        
        # Initialize components
        self.romanian_tracker = RomanianQualityTracker()
        self.resource_monitor = ResourceMonitor()
        
        # Monitoring state
        self.monitoring_active = False
        self.monitor_thread = None
        
        # Data storage
        self.performance_history = deque(maxlen=10000)
        self.metric_history = defaultdict(lambda: deque(maxlen=1000))
        self.alerts = deque(maxlen=1000)
        
        # Storage
        self.storage_path = storage_path
        if storage_path:
            self.db_connection = self._init_database()
        else:
            self.db_connection = None
        
        # Alert thresholds
        self.alert_thresholds = {
            MetricType.PERFORMANCE: {'warning': 0.85, 'critical': 0.80},
            MetricType.MEMORY: {'warning': 80.0, 'critical': 90.0},
            MetricType.LATENCY: {'warning': 100.0, 'critical': 200.0},
            MetricType.CULTURAL_AUTHENTICITY: {'warning': 0.90, 'critical': 0.85},
            MetricType.ROMANIAN_QUALITY: {'warning': 0.88, 'critical': 0.82}
        }
        
        # Event handlers
        self.alert_handlers: List[Callable[[Alert], None]] = []
        self.metric_handlers: Dict[MetricType, List[Callable]] = defaultdict(list)
        
        # Setup logging
        self.logger = self._setup_logging()
    
    def _setup_logging(self) -> logging.Logger:
        """Setup logging for performance monitor"""
        logger = logging.getLogger(f"performance_monitor_{self.model_name}")
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            handler = logging.StreamHandler()
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
            handler.setFormatter(formatter)
            logger.addHandler(handler)
        
        return logger
    
    def _init_database(self) -> sqlite3.Connection:
        """Initialize SQLite database for metrics storage"""
        db_path = Path(self.storage_path) / f"{self.model_name}_metrics.db"
        db_path.parent.mkdir(parents=True, exist_ok=True)
        
        conn = sqlite3.connect(str(db_path), check_same_thread=False)
        
        # Create tables
        conn.execute('''
            CREATE TABLE IF NOT EXISTS performance_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                accuracy REAL,
                inference_latency_ms REAL,
                throughput_tokens_per_sec REAL,
                memory_usage_gb REAL,
                gpu_utilization REAL,
                cpu_utilization REAL,
                cultural_authenticity REAL,
                romanian_quality_score REAL,
                efficiency_score REAL
            )
        ''')
        
        conn.execute('''
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                alert_id TEXT UNIQUE,
                timestamp TEXT NOT NULL,
                level TEXT,
                metric_type TEXT,
                message TEXT,
                current_value REAL,
                threshold_value REAL
            )
        ''')
        
        conn.commit()
        return conn
    
    def start_monitoring(self):
        """Start performance monitoring"""
        if self.monitoring_active:
            self.logger.warning("Monitoring already active")
            return
        
        self.monitoring_active = True
        self.monitor_thread = threading.Thread(
            target=self._monitoring_loop,
            daemon=True
        )
        self.monitor_thread.start()
        
        self.logger.info(f"Performance monitoring started with {self.monitoring_interval.value}s interval")
    
    def stop_monitoring(self):
        """Stop performance monitoring"""
        if not self.monitoring_active:
            return
        
        self.monitoring_active = False
        if self.monitor_thread:
            self.monitor_thread.join()
        
        if self.db_connection:
            self.db_connection.close()
        
        self.logger.info("Performance monitoring stopped")
    
    def _monitoring_loop(self):
        """Main monitoring loop"""
        while self.monitoring_active:
            try:
                # Collect performance snapshot
                snapshot = self._collect_performance_snapshot()
                
                # Store snapshot
                self.performance_history.append(snapshot)
                
                # Update metric histories
                self._update_metric_histories(snapshot)
                
                # Check for alerts
                if self.enable_alerts:
                    self._check_alerts(snapshot)
                
                # Store to database if enabled
                if self.db_connection:
                    self._store_snapshot_to_db(snapshot)
                
                # Trigger metric handlers
                self._trigger_metric_handlers(snapshot)
                
            except Exception as e:
                self.logger.error(f"Monitoring error: {e}")
            
            time.sleep(self.monitoring_interval.value)
    
    def _collect_performance_snapshot(self) -> PerformanceSnapshot:
        """Collect comprehensive performance snapshot"""
        
        # Get resource metrics
        resource_metrics = self.resource_monitor.get_system_metrics()
        
        # Get Romanian quality metrics (mock measurement)
        romanian_metrics = self.romanian_tracker.measure_romanian_quality({})
        
        # Mock other performance metrics (in real implementation, 
        # these would come from actual model inference)
        snapshot = PerformanceSnapshot(
            timestamp=datetime.now(),
            accuracy=min(0.95, 0.90 + np.random.normal(0, 0.02)),
            inference_latency_ms=max(20.0, 85.0 + np.random.normal(0, 15.0)),
            throughput_tokens_per_sec=max(800.0, 1500.0 + np.random.normal(0, 200.0)),
            memory_usage_gb=resource_metrics['memory_used_gb'],
            gpu_utilization=resource_metrics['gpu_utilization'],
            cpu_utilization=resource_metrics['cpu_percent'],
            cultural_authenticity=romanian_metrics['cultural_context_relevance'],
            romanian_quality_score=romanian_metrics['overall_romanian_quality'],
            efficiency_score=min(0.95, 0.88 + np.random.normal(0, 0.025)),
            model_load=min(100.0, resource_metrics['cpu_percent'] + resource_metrics['gpu_utilization']) / 2,
            optimization_level="standard",
            active_optimizations=["mixed_precision", "gradient_checkpointing"]
        )
        
        return snapshot
    
    def _update_metric_histories(self, snapshot: PerformanceSnapshot):
        """Update individual metric histories"""
        timestamp = snapshot.timestamp
        
        metrics_to_track = {
            MetricType.PERFORMANCE: snapshot.accuracy,
            MetricType.MEMORY: snapshot.memory_usage_gb,
            MetricType.LATENCY: snapshot.inference_latency_ms,
            MetricType.THROUGHPUT: snapshot.throughput_tokens_per_sec,
            MetricType.CULTURAL_AUTHENTICITY: snapshot.cultural_authenticity,
            MetricType.ROMANIAN_QUALITY: snapshot.romanian_quality_score,
            MetricType.RESOURCE_UTILIZATION: (snapshot.cpu_utilization + snapshot.gpu_utilization) / 2
        }
        
        for metric_type, value in metrics_to_track.items():
            metric_point = MetricPoint(
                timestamp=timestamp,
                metric_type=metric_type,
                value=value,
                metadata={'model': self.model_name}
            )
            self.metric_history[metric_type].append(metric_point)
    
    def _check_alerts(self, snapshot: PerformanceSnapshot):
        """Check for performance alerts"""
        alerts_to_generate = []
        
        # Performance alert
        if snapshot.accuracy < self.alert_thresholds[MetricType.PERFORMANCE]['critical']:
            alerts_to_generate.append(self._create_alert(
                AlertLevel.CRITICAL, MetricType.PERFORMANCE,
                f"Model accuracy critically low: {snapshot.accuracy:.3f}",
                snapshot.accuracy, self.alert_thresholds[MetricType.PERFORMANCE]['critical']
            ))
        elif snapshot.accuracy < self.alert_thresholds[MetricType.PERFORMANCE]['warning']:
            alerts_to_generate.append(self._create_alert(
                AlertLevel.WARNING, MetricType.PERFORMANCE,
                f"Model accuracy below warning threshold: {snapshot.accuracy:.3f}",
                snapshot.accuracy, self.alert_thresholds[MetricType.PERFORMANCE]['warning']
            ))
        
        # Memory alert
        memory_percent = (snapshot.memory_usage_gb / 64.0) * 100  # Assume 64GB total
        if memory_percent > self.alert_thresholds[MetricType.MEMORY]['critical']:
            alerts_to_generate.append(self._create_alert(
                AlertLevel.CRITICAL, MetricType.MEMORY,
                f"Memory usage critically high: {memory_percent:.1f}%",
                memory_percent, self.alert_thresholds[MetricType.MEMORY]['critical']
            ))
        
        # Latency alert
        if snapshot.inference_latency_ms > self.alert_thresholds[MetricType.LATENCY]['critical']:
            alerts_to_generate.append(self._create_alert(
                AlertLevel.CRITICAL, MetricType.LATENCY,
                f"Inference latency critically high: {snapshot.inference_latency_ms:.1f}ms",
                snapshot.inference_latency_ms, self.alert_thresholds[MetricType.LATENCY]['critical']
            ))
        
        # Romanian quality alert
        if snapshot.romanian_quality_score < self.alert_thresholds[MetricType.ROMANIAN_QUALITY]['warning']:
            alerts_to_generate.append(self._create_alert(
                AlertLevel.WARNING, MetricType.ROMANIAN_QUALITY,
                f"Romanian quality below threshold: {snapshot.romanian_quality_score:.3f}",
                snapshot.romanian_quality_score, self.alert_thresholds[MetricType.ROMANIAN_QUALITY]['warning']
            ))
        
        # Store and handle alerts
        for alert in alerts_to_generate:
            self.alerts.append(alert)
            self._handle_alert(alert)
    
    def _create_alert(
        self, 
        level: AlertLevel, 
        metric_type: MetricType, 
        message: str,
        current_value: float,
        threshold_value: float
    ) -> Alert:
        """Create a performance alert"""
        alert = Alert(
            alert_id=f"alert_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{metric_type.value}",
            timestamp=datetime.now(),
            level=level,
            metric_type=metric_type,
            message=message,
            current_value=current_value,
            threshold_value=threshold_value,
            suggestions=self._get_optimization_suggestions(metric_type, level)
        )
        
        return alert
    
    def _get_optimization_suggestions(self, metric_type: MetricType, level: AlertLevel) -> List[str]:
        """Get optimization suggestions for alerts"""
        suggestions = {
            MetricType.PERFORMANCE: [
                "Apply performance optimizations",
                "Check model configuration",
                "Verify training data quality"
            ],
            MetricType.MEMORY: [
                "Enable gradient checkpointing",
                "Use mixed precision training",
                "Reduce batch size"
            ],
            MetricType.LATENCY: [
                "Optimize inference pipeline",
                "Enable model quantization",
                "Use faster attention mechanisms"
            ],
            MetricType.ROMANIAN_QUALITY: [
                "Enhance cultural embeddings",
                "Improve diacritics processing",
                "Expand regional adaptations"
            ]
        }
        
        return suggestions.get(metric_type, ["Review model configuration"])
    
    def _handle_alert(self, alert: Alert):
        """Handle generated alert"""
        self.logger.log(
            logging.CRITICAL if alert.level == AlertLevel.CRITICAL else logging.WARNING,
            f"ALERT [{alert.level.value.upper()}]: {alert.message}"
        )
        
        # Trigger alert handlers
        for handler in self.alert_handlers:
            try:
                handler(alert)
            except Exception as e:
                self.logger.error(f"Alert handler error: {e}")
        
        # Store to database
        if self.db_connection:
            try:
                self.db_connection.execute('''
                    INSERT OR REPLACE INTO alerts 
                    (alert_id, timestamp, level, metric_type, message, current_value, threshold_value)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    alert.alert_id, alert.timestamp.isoformat(), alert.level.value,
                    alert.metric_type.value, alert.message, alert.current_value, alert.threshold_value
                ))
                self.db_connection.commit()
            except Exception as e:
                self.logger.error(f"Database alert storage error: {e}")
    
    def _store_snapshot_to_db(self, snapshot: PerformanceSnapshot):
        """Store performance snapshot to database"""
        try:
            self.db_connection.execute('''
                INSERT INTO performance_snapshots 
                (timestamp, accuracy, inference_latency_ms, throughput_tokens_per_sec,
                 memory_usage_gb, gpu_utilization, cpu_utilization, cultural_authenticity,
                 romanian_quality_score, efficiency_score)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                snapshot.timestamp.isoformat(), snapshot.accuracy, snapshot.inference_latency_ms,
                snapshot.throughput_tokens_per_sec, snapshot.memory_usage_gb, snapshot.gpu_utilization,
                snapshot.cpu_utilization, snapshot.cultural_authenticity, snapshot.romanian_quality_score,
                snapshot.efficiency_score
            ))
            self.db_connection.commit()
        except Exception as e:
            self.logger.error(f"Database storage error: {e}")
    
    def _trigger_metric_handlers(self, snapshot: PerformanceSnapshot):
        """Trigger registered metric handlers"""
        metric_values = {
            MetricType.PERFORMANCE: snapshot.accuracy,
            MetricType.MEMORY: snapshot.memory_usage_gb,
            MetricType.LATENCY: snapshot.inference_latency_ms,
            MetricType.THROUGHPUT: snapshot.throughput_tokens_per_sec,
            MetricType.CULTURAL_AUTHENTICITY: snapshot.cultural_authenticity,
            MetricType.ROMANIAN_QUALITY: snapshot.romanian_quality_score
        }
        
        for metric_type, value in metric_values.items():
            for handler in self.metric_handlers[metric_type]:
                try:
                    handler(value, snapshot.timestamp)
                except Exception as e:
                    self.logger.error(f"Metric handler error for {metric_type}: {e}")
    
    def register_alert_handler(self, handler: Callable[[Alert], None]):
        """Register alert handler function"""
        self.alert_handlers.append(handler)
    
    def register_metric_handler(self, metric_type: MetricType, handler: Callable):
        """Register metric handler function"""
        self.metric_handlers[metric_type].append(handler)
    
    def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary for specified time period"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        recent_snapshots = [
            s for s in self.performance_history 
            if s.timestamp >= cutoff_time
        ]
        
        if not recent_snapshots:
            return {"error": "No data available for specified period"}
        
        # Calculate statistics
        accuracies = [s.accuracy for s in recent_snapshots]
        latencies = [s.inference_latency_ms for s in recent_snapshots]
        throughputs = [s.throughput_tokens_per_sec for s in recent_snapshots]
        romanian_scores = [s.romanian_quality_score for s in recent_snapshots]
        
        summary = {
            "time_period_hours": hours,
            "snapshot_count": len(recent_snapshots),
            "performance": {
                "accuracy": {
                    "current": accuracies[-1],
                    "average": statistics.mean(accuracies),
                    "min": min(accuracies),
                    "max": max(accuracies),
                    "std": statistics.stdev(accuracies) if len(accuracies) > 1 else 0.0
                }
            },
            "latency": {
                "current_ms": latencies[-1],
                "average_ms": statistics.mean(latencies),
                "min_ms": min(latencies),
                "max_ms": max(latencies)
            },
            "throughput": {
                "current_tokens_per_sec": throughputs[-1],
                "average_tokens_per_sec": statistics.mean(throughputs),
                "min_tokens_per_sec": min(throughputs),
                "max_tokens_per_sec": max(throughputs)
            },
            "romanian_quality": {
                "current": romanian_scores[-1],
                "average": statistics.mean(romanian_scores),
                "min": min(romanian_scores),
                "max": max(romanian_scores)
            },
            "alerts": {
                "total_count": len(self.alerts),
                "critical_count": len([a for a in self.alerts if a.level == AlertLevel.CRITICAL]),
                "warning_count": len([a for a in self.alerts if a.level == AlertLevel.WARNING])
            }
        }
        
        return summary
    
    def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring system status"""
        return {
            "monitor_name": f"Performance Monitor - {self.model_name}",
            "version": "1.0.0",
            "monitoring_active": self.monitoring_active,
            "monitoring_interval_seconds": self.monitoring_interval.value,
            "alerts_enabled": self.enable_alerts,
            "storage_enabled": self.db_connection is not None,
            "performance_history_length": len(self.performance_history),
            "total_alerts": len(self.alerts),
            "alert_handlers_count": len(self.alert_handlers),
            "metric_handlers_count": sum(len(handlers) for handlers in self.metric_handlers.values()),
            "romanian_quality_tracking": True,
            "resource_monitoring": True,
            "status": "active" if self.monitoring_active else "inactive"
        }


# Export main classes and functions
__all__ = [
    "MetricType",
    "AlertLevel", 
    "MonitoringInterval",
    "MetricPoint",
    "PerformanceSnapshot",
    "Alert",
    "TrendAnalysis",
    "RomanianQualityTracker",
    "ResourceMonitor",
    "PerformanceMonitor"
]
