"""
Performance Monitoring Dashboard - Phase 1 AGI Evolution
Real-time monitoring and visualization of AGI system performance
"""

import logging
import asyncio
import time
import json
import psutil
import torch
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
from collections import defaultdict, deque
import statistics
import numpy as np

logger = logging.getLogger(__name__)

class MetricType(Enum):
    """Types of performance metrics"""
    COUNTER = "counter"          # Monotonic increasing value
    GAUGE = "gauge"             # Current value that can go up/down
    HISTOGRAM = "histogram"      # Distribution of values
    TIMER = "timer"             # Duration measurements
    RATE = "rate"               # Events per time unit

class AlertLevel(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class SystemComponent(Enum):
    """System components being monitored"""
    COGNITIVE_CONTROLLER = "cognitive_controller"
    TASK_DECOMPOSER = "task_decomposer"
    RESOURCE_MANAGER = "resource_manager"
    COMMUNICATION_BUS = "communication_bus"
    MEMORY_SYSTEM = "memory_system"
    CONSCIOUSNESS = "consciousness"
    REASONING_ENGINES = "reasoning_engines"
    LEARNING_SYSTEM = "learning_system"
    HARDWARE = "hardware"

@dataclass
class MetricSample:
    """Individual metric sample"""
    timestamp: datetime
    value: float
    tags: Dict[str, str] = field(default_factory=dict)
    
@dataclass
class PerformanceMetric:
    """Performance metric definition and data"""
    name: str
    metric_type: MetricType
    component: SystemComponent
    unit: str
    description: str
    
    # Current state
    current_value: float = 0.0
    last_updated: datetime = field(default_factory=datetime.now)
    
    # Historical data
    samples: deque = field(default_factory=lambda: deque(maxlen=1000))
    
    # Statistics
    min_value: float = float('inf')
    max_value: float = float('-inf')
    avg_value: float = 0.0
    p95_value: float = 0.0
    p99_value: float = 0.0
    
    # Alerting
    warning_threshold: Optional[float] = None
    critical_threshold: Optional[float] = None
    
    def add_sample(self, value: float, timestamp: datetime = None, tags: Dict[str, str] = None):
        """Add a new sample to the metric"""
        if timestamp is None:
            timestamp = datetime.now()
        
        sample = MetricSample(timestamp=timestamp, value=value, tags=tags or {})
        self.samples.append(sample)
        
        # Update current state
        self.current_value = value
        self.last_updated = timestamp
        
        # Update statistics
        self.min_value = min(self.min_value, value)
        self.max_value = max(self.max_value, value)
        
        # Calculate average and percentiles from recent samples
        if len(self.samples) > 0:
            recent_values = [s.value for s in list(self.samples)[-100:]]  # Last 100 samples
            self.avg_value = statistics.mean(recent_values)
            
            if len(recent_values) >= 20:  # Need minimum samples for percentiles
                sorted_values = sorted(recent_values)
                self.p95_value = np.percentile(sorted_values, 95)
                self.p99_value = np.percentile(sorted_values, 99)

@dataclass
class Alert:
    """Performance alert"""
    id: str
    level: AlertLevel
    component: SystemComponent
    metric_name: str
    message: str
    value: float
    threshold: float
    timestamp: datetime = field(default_factory=datetime.now)
    acknowledged: bool = False
    resolved: bool = False

class PerformanceMonitoringDashboard:
    """
    Performance Monitoring Dashboard - Phase 1 AGI Evolution
    
    This dashboard provides comprehensive monitoring of AGI system performance:
    1. Real-time metrics collection from all components
    2. Performance visualization and trending
    3. Intelligent alerting and anomaly detection
    4. Resource utilization optimization recommendations
    5. System health scoring and reporting
    """
    
    def __init__(self):
        # Metrics registry
        self.metrics = {}  # metric_name -> PerformanceMetric
        self.component_metrics = defaultdict(list)  # component -> list of metric names
        
        # Alerting system
        self.alerts = []
        self.alert_handlers = []
        self.alert_counter = 0
        
        # Data collection
        self.collection_interval = 5.0  # seconds
        self.is_monitoring = False
        self.collection_tasks = []
        
        # Dashboard state
        self.dashboard_data = {
            'system_health_score': 100.0,
            'component_health': {},
            'performance_summary': {},
            'resource_utilization': {},
            'recent_alerts': [],
            'recommendations': []
        }
        
        # Initialize core metrics
        self._initialize_core_metrics()
        
        logger.info("📊 Performance Monitoring Dashboard initialized - Phase 1 AGI Evolution")
    
    def _initialize_core_metrics(self):
        """Initialize core system performance metrics"""
        
        # System-wide metrics
        self.register_metric(
            "system.tasks_processed",
            MetricType.COUNTER,
            SystemComponent.COGNITIVE_CONTROLLER,
            "count",
            "Total number of cognitive tasks processed"
        )
        
        self.register_metric(
            "system.avg_response_time",
            MetricType.GAUGE,
            SystemComponent.COGNITIVE_CONTROLLER,
            "seconds",
            "Average task response time",
            warning_threshold=5.0,
            critical_threshold=10.0
        )
        
        self.register_metric(
            "system.success_rate",
            MetricType.GAUGE,
            SystemComponent.COGNITIVE_CONTROLLER,
            "percent",
            "Task success rate percentage",
            warning_threshold=90.0,
            critical_threshold=80.0
        )
        
        # Resource metrics
        self.register_metric(
            "resources.cpu_utilization",
            MetricType.GAUGE,
            SystemComponent.HARDWARE,
            "percent",
            "CPU utilization percentage",
            warning_threshold=80.0,
            critical_threshold=95.0
        )
        
        self.register_metric(
            "resources.ram_utilization",
            MetricType.GAUGE,
            SystemComponent.HARDWARE,
            "percent",
            "RAM utilization percentage",
            warning_threshold=85.0,
            critical_threshold=95.0
        )
        
        self.register_metric(
            "resources.gpu_vram_utilization",
            MetricType.GAUGE,
            SystemComponent.HARDWARE,
            "percent",
            "GPU VRAM utilization percentage",
            warning_threshold=80.0,
            critical_threshold=90.0
        )
        
        # Component-specific metrics
        self.register_metric(
            "task_decomposer.plans_created",
            MetricType.COUNTER,
            SystemComponent.TASK_DECOMPOSER,
            "count",
            "Number of task decomposition plans created"
        )
        
        self.register_metric(
            "task_decomposer.avg_decomposition_time",
            MetricType.GAUGE,
            SystemComponent.TASK_DECOMPOSER,
            "seconds",
            "Average time to decompose a task",
            warning_threshold=2.0,
            critical_threshold=5.0
        )
        
        self.register_metric(
            "communication.messages_sent",
            MetricType.COUNTER,
            SystemComponent.COMMUNICATION_BUS,
            "count",
            "Total messages sent through communication bus"
        )
        
        self.register_metric(
            "communication.avg_delivery_time",
            MetricType.GAUGE,
            SystemComponent.COMMUNICATION_BUS,
            "seconds",
            "Average message delivery time",
            warning_threshold=1.0,
            critical_threshold=2.0
        )
        
        self.register_metric(
            "memory.operations_count",
            MetricType.COUNTER,
            SystemComponent.MEMORY_SYSTEM,
            "count",
            "Total memory operations performed"
        )
        
        self.register_metric(
            "consciousness.attention_switches",
            MetricType.COUNTER,
            SystemComponent.CONSCIOUSNESS,
            "count",
            "Number of attention switches"
        )
        
        # Reasoning engine metrics
        engines = ['math', 'logic', 'creative', 'cultural']
        for engine in engines:
            self.register_metric(
                f"reasoning.{engine}_engine.requests",
                MetricType.COUNTER,
                SystemComponent.REASONING_ENGINES,
                "count",
                f"Requests processed by {engine} reasoning engine"
            )
            
            self.register_metric(
                f"reasoning.{engine}_engine.avg_time",
                MetricType.GAUGE,
                SystemComponent.REASONING_ENGINES,
                "seconds",
                f"Average processing time for {engine} engine",
                warning_threshold=3.0,
                critical_threshold=8.0
            )
    
    def register_metric(self, 
                       name: str, 
                       metric_type: MetricType, 
                       component: SystemComponent,
                       unit: str,
                       description: str,
                       warning_threshold: Optional[float] = None,
                       critical_threshold: Optional[float] = None) -> bool:
        """Register a new performance metric"""
        
        if name in self.metrics:
            logger.warning(f"⚠️ Metric already exists: {name}")
            return False
        
        metric = PerformanceMetric(
            name=name,
            metric_type=metric_type,
            component=component,
            unit=unit,
            description=description,
            warning_threshold=warning_threshold,
            critical_threshold=critical_threshold
        )
        
        self.metrics[name] = metric
        self.component_metrics[component].append(name)
        
        logger.info(f"📈 Metric registered: {name} ({component.value})")
        return True
    
    def record_metric(self, name: str, value: float, tags: Dict[str, str] = None):
        """Record a metric value"""
        if name not in self.metrics:
            logger.warning(f"⚠️ Unknown metric: {name}")
            return
        
        metric = self.metrics[name]
        metric.add_sample(value, tags=tags)
        
        # Check for threshold violations
        self._check_thresholds(metric, value)
        
        logger.debug(f"📊 Metric recorded: {name} = {value}")
    
    def _check_thresholds(self, metric: PerformanceMetric, value: float):
        """Check if metric value violates thresholds"""
        alert_level = None
        threshold = None
        
        if metric.critical_threshold is not None and value >= metric.critical_threshold:
            alert_level = AlertLevel.CRITICAL
            threshold = metric.critical_threshold
        elif metric.warning_threshold is not None and value >= metric.warning_threshold:
            alert_level = AlertLevel.WARNING
            threshold = metric.warning_threshold
        
        if alert_level:
            self._create_alert(
                level=alert_level,
                component=metric.component,
                metric_name=metric.name,
                message=f"{metric.name} value {value} exceeded {alert_level.value} threshold {threshold}",
                value=value,
                threshold=threshold
            )
    
    def _create_alert(self, 
                     level: AlertLevel,
                     component: SystemComponent,
                     metric_name: str,
                     message: str,
                     value: float,
                     threshold: float):
        """Create a new alert"""
        
        self.alert_counter += 1
        alert = Alert(
            id=f"alert_{self.alert_counter:06d}",
            level=level,
            component=component,
            metric_name=metric_name,
            message=message,
            value=value,
            threshold=threshold
        )
        
        self.alerts.append(alert)
        
        # Keep only recent alerts (last 1000)
        if len(self.alerts) > 1000:
            self.alerts = self.alerts[-1000:]
        
        logger.warning(f"🚨 {level.value.upper()}: {message}")
        
        # Call alert handlers
        for handler in self.alert_handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    asyncio.create_task(handler(alert))
                else:
                    handler(alert)
            except Exception as e:
                logger.error(f"❌ Alert handler error: {e}")
    
    def register_alert_handler(self, handler: callable):
        """Register an alert handler"""
        self.alert_handlers.append(handler)
        logger.info("🔔 Alert handler registered")
    
    async def start_monitoring(self):
        """Start performance monitoring"""
        if self.is_monitoring:
            logger.warning("⚠️ Monitoring already active")
            return
        
        self.is_monitoring = True
        logger.info("🔍 Starting performance monitoring...")
        
        # Start collection tasks
        self.collection_tasks = [
            asyncio.create_task(self._system_metrics_collector()),
            asyncio.create_task(self._hardware_metrics_collector()),
            asyncio.create_task(self._component_metrics_collector()),
            asyncio.create_task(self._health_calculator()),
            asyncio.create_task(self._dashboard_updater())
        ]
        
        logger.info("✅ Performance monitoring started")
    
    async def _system_metrics_collector(self):
        """Collect system-wide performance metrics"""
        logger.info("📊 System metrics collector started")
        
        while self.is_monitoring:
            try:
                # Example system metrics (would connect to actual systems)
                self.record_metric("system.tasks_processed", 
                                 self.metrics["system.tasks_processed"].current_value + 1)
                
                # Simulate response time (would come from actual cognitive controller)
                import random
                response_time = random.uniform(0.5, 3.0)
                self.record_metric("system.avg_response_time", response_time)
                
                # Simulate success rate
                success_rate = random.uniform(92, 99)
                self.record_metric("system.success_rate", success_rate)
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"❌ System metrics collection error: {e}")
                await asyncio.sleep(self.collection_interval * 2)
    
    async def _hardware_metrics_collector(self):
        """Collect hardware performance metrics"""
        logger.info("🖥️ Hardware metrics collector started")
        
        while self.is_monitoring:
            try:
                # CPU utilization
                cpu_percent = psutil.cpu_percent(interval=1.0)
                self.record_metric("resources.cpu_utilization", cpu_percent)
                
                # RAM utilization
                memory = psutil.virtual_memory()
                ram_percent = memory.percent
                self.record_metric("resources.ram_utilization", ram_percent)
                
                # GPU VRAM utilization (if available)
                if torch.cuda.is_available():
                    try:
                        vram_used, vram_total = torch.cuda.mem_get_info()
                        vram_percent = ((vram_total - vram_used) / vram_total) * 100
                        self.record_metric("resources.gpu_vram_utilization", vram_percent)
                    except:
                        pass  # Skip if can't read GPU memory
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"❌ Hardware metrics collection error: {e}")
                await asyncio.sleep(self.collection_interval * 2)
    
    async def _component_metrics_collector(self):
        """Collect component-specific metrics"""
        logger.info("🧩 Component metrics collector started")
        
        while self.is_monitoring:
            try:
                # Task decomposer metrics (simulated - would connect to actual component)
                self.record_metric("task_decomposer.plans_created",
                                 self.metrics["task_decomposer.plans_created"].current_value + 1)
                
                import random
                decomp_time = random.uniform(0.1, 1.5)
                self.record_metric("task_decomposer.avg_decomposition_time", decomp_time)
                
                # Communication bus metrics
                self.record_metric("communication.messages_sent",
                                 self.metrics["communication.messages_sent"].current_value + random.randint(5, 20))
                
                delivery_time = random.uniform(0.01, 0.5)
                self.record_metric("communication.avg_delivery_time", delivery_time)
                
                # Memory system metrics
                self.record_metric("memory.operations_count",
                                 self.metrics["memory.operations_count"].current_value + random.randint(1, 5))
                
                # Consciousness metrics
                attention_switches = random.randint(0, 3)
                if attention_switches > 0:
                    self.record_metric("consciousness.attention_switches",
                                     self.metrics["consciousness.attention_switches"].current_value + attention_switches)
                
                # Reasoning engine metrics
                engines = ['math', 'logic', 'creative', 'cultural']
                for engine in engines:
                    requests = random.randint(0, 2)
                    if requests > 0:
                        self.record_metric(f"reasoning.{engine}_engine.requests",
                                         self.metrics[f"reasoning.{engine}_engine.requests"].current_value + requests)
                    
                    processing_time = random.uniform(0.2, 2.0)
                    self.record_metric(f"reasoning.{engine}_engine.avg_time", processing_time)
                
                await asyncio.sleep(self.collection_interval)
                
            except Exception as e:
                logger.error(f"❌ Component metrics collection error: {e}")
                await asyncio.sleep(self.collection_interval * 2)
    
    async def _health_calculator(self):
        """Calculate system and component health scores"""
        while self.is_monitoring:
            try:
                # Calculate component health scores
                component_health = {}
                
                for component in SystemComponent:
                    health_score = self._calculate_component_health(component)
                    component_health[component.value] = health_score
                
                self.dashboard_data['component_health'] = component_health
                
                # Calculate overall system health
                if component_health:
                    self.dashboard_data['system_health_score'] = statistics.mean(component_health.values())
                
                await asyncio.sleep(30.0)  # Update every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Health calculation error: {e}")
                await asyncio.sleep(30.0)
    
    def _calculate_component_health(self, component: SystemComponent) -> float:
        """Calculate health score for a component"""
        component_metric_names = self.component_metrics[component]
        if not component_metric_names:
            return 100.0  # Perfect health if no metrics defined
        
        health_factors = []
        
        for metric_name in component_metric_names:
            metric = self.metrics[metric_name]
            
            # Skip counters for health calculation
            if metric.metric_type == MetricType.COUNTER:
                continue
            
            factor = 100.0  # Start with perfect score
            
            # Check thresholds
            if metric.critical_threshold is not None and metric.current_value >= metric.critical_threshold:
                factor = 0.0  # Critical failure
            elif metric.warning_threshold is not None and metric.current_value >= metric.warning_threshold:
                # Linear degradation from warning to critical
                if metric.critical_threshold:
                    ratio = ((metric.current_value - metric.warning_threshold) / 
                           (metric.critical_threshold - metric.warning_threshold))
                    factor = max(0.0, 70.0 - (ratio * 70.0))  # 70% to 0%
                else:
                    factor = 70.0  # Warning level
            
            health_factors.append(factor)
        
        return statistics.mean(health_factors) if health_factors else 100.0
    
    async def _dashboard_updater(self):
        """Update dashboard data"""
        while self.is_monitoring:
            try:
                # Performance summary
                self.dashboard_data['performance_summary'] = self._create_performance_summary()
                
                # Resource utilization
                self.dashboard_data['resource_utilization'] = self._create_resource_summary()
                
                # Recent alerts
                self.dashboard_data['recent_alerts'] = [
                    {
                        'id': alert.id,
                        'level': alert.level.value,
                        'component': alert.component.value,
                        'message': alert.message,
                        'timestamp': alert.timestamp.isoformat(),
                        'acknowledged': alert.acknowledged
                    }
                    for alert in sorted(self.alerts, key=lambda a: a.timestamp, reverse=True)[:10]
                ]
                
                # Performance recommendations
                self.dashboard_data['recommendations'] = self._generate_recommendations()
                
                await asyncio.sleep(10.0)  # Update every 10 seconds
                
            except Exception as e:
                logger.error(f"❌ Dashboard update error: {e}")
                await asyncio.sleep(10.0)
    
    def _create_performance_summary(self) -> Dict[str, Any]:
        """Create performance summary data"""
        summary = {}
        
        key_metrics = [
            'system.tasks_processed',
            'system.avg_response_time', 
            'system.success_rate',
            'communication.messages_sent',
            'task_decomposer.plans_created'
        ]
        
        for metric_name in key_metrics:
            if metric_name in self.metrics:
                metric = self.metrics[metric_name]
                summary[metric_name] = {
                    'current': metric.current_value,
                    'avg': metric.avg_value,
                    'min': metric.min_value if metric.min_value != float('inf') else 0,
                    'max': metric.max_value if metric.max_value != float('-inf') else 0,
                    'unit': metric.unit
                }
        
        return summary
    
    def _create_resource_summary(self) -> Dict[str, Any]:
        """Create resource utilization summary"""
        resource_metrics = [
            'resources.cpu_utilization',
            'resources.ram_utilization', 
            'resources.gpu_vram_utilization'
        ]
        
        summary = {}
        for metric_name in resource_metrics:
            if metric_name in self.metrics:
                metric = self.metrics[metric_name]
                summary[metric_name] = {
                    'current': metric.current_value,
                    'avg': metric.avg_value,
                    'peak': metric.max_value if metric.max_value != float('-inf') else 0,
                    'warning_threshold': metric.warning_threshold,
                    'critical_threshold': metric.critical_threshold
                }
        
        return summary
    
    def _generate_recommendations(self) -> List[Dict[str, Any]]:
        """Generate performance optimization recommendations"""
        recommendations = []
        
        # CPU utilization recommendations
        cpu_metric = self.metrics.get('resources.cpu_utilization')
        if cpu_metric and cpu_metric.avg_value > 80:
            recommendations.append({
                'type': 'resource_optimization',
                'priority': 'high',
                'title': 'High CPU Utilization',
                'description': f'Average CPU usage is {cpu_metric.avg_value:.1f}%. Consider optimizing algorithms or scaling resources.',
                'action': 'Scale CPU resources or optimize processing algorithms'
            })
        
        # Memory utilization recommendations
        ram_metric = self.metrics.get('resources.ram_utilization')
        if ram_metric and ram_metric.avg_value > 85:
            recommendations.append({
                'type': 'resource_optimization',
                'priority': 'high', 
                'title': 'High Memory Utilization',
                'description': f'Average RAM usage is {ram_metric.avg_value:.1f}%. Memory optimization recommended.',
                'action': 'Implement memory cleanup routines or increase available RAM'
            })
        
        # Response time recommendations
        response_metric = self.metrics.get('system.avg_response_time')
        if response_metric and response_metric.avg_value > 2.0:
            recommendations.append({
                'type': 'performance_optimization',
                'priority': 'medium',
                'title': 'Slow Response Times',
                'description': f'Average response time is {response_metric.avg_value:.2f}s. Performance optimization needed.',
                'action': 'Profile task processing pipeline and optimize bottlenecks'
            })
        
        # Communication latency recommendations
        comm_metric = self.metrics.get('communication.avg_delivery_time')
        if comm_metric and comm_metric.avg_value > 0.1:
            recommendations.append({
                'type': 'communication_optimization',
                'priority': 'low',
                'title': 'Communication Latency',
                'description': f'Message delivery time is {comm_metric.avg_value:.3f}s. Consider optimizing message routing.',
                'action': 'Optimize message queuing and routing algorithms'
            })
        
        return recommendations
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get current dashboard data"""
        return self.dashboard_data.copy()
    
    def get_metric_data(self, metric_name: str, time_range_minutes: int = 60) -> Optional[Dict[str, Any]]:
        """Get detailed data for a specific metric"""
        if metric_name not in self.metrics:
            return None
        
        metric = self.metrics[metric_name]
        cutoff_time = datetime.now() - timedelta(minutes=time_range_minutes)
        
        # Filter samples to time range
        recent_samples = [
            {
                'timestamp': sample.timestamp.isoformat(),
                'value': sample.value,
                'tags': sample.tags
            }
            for sample in metric.samples
            if sample.timestamp > cutoff_time
        ]
        
        return {
            'name': metric.name,
            'type': metric.metric_type.value,
            'component': metric.component.value,
            'unit': metric.unit,
            'description': metric.description,
            'current_value': metric.current_value,
            'statistics': {
                'min': metric.min_value if metric.min_value != float('inf') else None,
                'max': metric.max_value if metric.max_value != float('-inf') else None,
                'avg': metric.avg_value,
                'p95': metric.p95_value,
                'p99': metric.p99_value
            },
            'thresholds': {
                'warning': metric.warning_threshold,
                'critical': metric.critical_threshold
            },
            'samples': recent_samples
        }
    
    def get_alerts(self, level: Optional[AlertLevel] = None, limit: int = 50) -> List[Dict[str, Any]]:
        """Get recent alerts"""
        alerts = self.alerts
        
        if level:
            alerts = [alert for alert in alerts if alert.level == level]
        
        # Sort by timestamp (most recent first) and limit
        alerts = sorted(alerts, key=lambda a: a.timestamp, reverse=True)[:limit]
        
        return [
            {
                'id': alert.id,
                'level': alert.level.value,
                'component': alert.component.value,
                'metric_name': alert.metric_name,
                'message': alert.message,
                'value': alert.value,
                'threshold': alert.threshold,
                'timestamp': alert.timestamp.isoformat(),
                'acknowledged': alert.acknowledged,
                'resolved': alert.resolved
            }
            for alert in alerts
        ]
    
    def acknowledge_alert(self, alert_id: str) -> bool:
        """Acknowledge an alert"""
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.acknowledged = True
                logger.info(f"✅ Alert acknowledged: {alert_id}")
                return True
        return False
    
    async def stop_monitoring(self):
        """Stop performance monitoring"""
        logger.info("🛑 Stopping performance monitoring...")
        
        self.is_monitoring = False
        
        # Wait for collection tasks to complete
        if self.collection_tasks:
            await asyncio.gather(*self.collection_tasks, return_exceptions=True)
        
        logger.info("✅ Performance monitoring stopped")

# Global instance for Phase 1 AGI Evolution
performance_dashboard = PerformanceMonitoringDashboard()

# Convenience functions for metric recording
def record_task_completion(task_id: str, processing_time: float, success: bool):
    """Record task completion metrics"""
    performance_dashboard.record_metric("system.tasks_processed", 
                                       performance_dashboard.metrics["system.tasks_processed"].current_value + 1)
    performance_dashboard.record_metric("system.avg_response_time", processing_time)
    
    # Update success rate (simplified calculation)
    current_rate = performance_dashboard.metrics["system.success_rate"].current_value
    if success:
        new_rate = min(100.0, current_rate + 0.1)
    else:
        new_rate = max(0.0, current_rate - 1.0)
    performance_dashboard.record_metric("system.success_rate", new_rate)

def record_resource_allocation(resource_type: str, amount: float):
    """Record resource allocation event"""
    # This would integrate with the actual resource management system
    pass

def record_communication_event(message_type: str, delivery_time: float):
    """Record communication bus event"""
    performance_dashboard.record_metric("communication.messages_sent",
                                       performance_dashboard.metrics["communication.messages_sent"].current_value + 1)
    performance_dashboard.record_metric("communication.avg_delivery_time", delivery_time)

logger.info("✅ Performance Monitoring Dashboard module loaded - AGI Evolution Phase 1 ready!")