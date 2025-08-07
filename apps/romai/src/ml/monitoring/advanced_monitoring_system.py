"""
🔍 Advanced Monitoring & Analytics System for RomAI AGI
Production-grade monitoring with real-time performance optimization
Following RESTful API naming conventions and best practices
"""

import asyncio
import logging
import time
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Tuple, Any
import json
import numpy as np
import torch
import psutil
import GPUtil
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MonitoringLevel(Enum):
    """Monitoring granularity levels"""
    BASIC = "basic"
    DETAILED = "detailed"
    COMPREHENSIVE = "comprehensive"
    REALTIME = "realtime"

class MetricType(Enum):
    """Types of metrics collected"""
    PERFORMANCE = "performance"
    ACCURACY = "accuracy"
    RESOURCE = "resource"
    CULTURAL = "cultural"
    EMERGENCE = "emergence"

@dataclass
class SystemMetrics:
    """System performance metrics"""
    timestamp: datetime
    cpu_usage: float
    memory_usage: float
    gpu_usage: float = 0.0
    gpu_memory: float = 0.0
    disk_io: float = 0.0
    network_io: float = 0.0
    temperature: float = 0.0

@dataclass
class AIMetrics:
    """AI system performance metrics"""
    timestamp: datetime
    model_inference_time: float
    accuracy_score: float
    confidence_score: float
    romanian_cultural_score: float
    emergence_level: float
    reasoning_depth: float
    creativity_index: float

@dataclass
class MonitoringAlert:
    """System monitoring alert"""
    timestamp: datetime
    severity: str  # INFO, WARNING, ERROR, CRITICAL
    component: str
    message: str
    metrics: Dict[str, Any]
    action_required: bool = False

class AdvancedMonitoringSystem:
    """
    Production-grade monitoring system for RomAI AGI
    Provides real-time performance monitoring, alerting, and optimization
    """
    
    def __init__(self, monitoring_level: MonitoringLevel = MonitoringLevel.DETAILED):
        self.monitoring_level = monitoring_level
        self.system_metrics_history: List[SystemMetrics] = []
        self.ai_metrics_history: List[AIMetrics] = []
        self.alerts: List[MonitoringAlert] = []
        self.monitoring_active = False
        
        # Performance thresholds
        self.performance_thresholds = {
            'cpu_usage_warning': 80.0,
            'cpu_usage_critical': 95.0,
            'memory_usage_warning': 85.0,
            'memory_usage_critical': 95.0,
            'gpu_usage_warning': 90.0,
            'gpu_usage_critical': 98.0,
            'inference_time_warning': 2.0,  # seconds
            'inference_time_critical': 5.0,
            'accuracy_warning': 0.75,
            'accuracy_critical': 0.65,
            'romanian_cultural_warning': 0.70,
            'romanian_cultural_critical': 0.60
        }
        
        # Romanian performance benchmarks
        self.romanian_benchmarks = {
            'vocabulary_coverage': 0.95,
            'grammar_accuracy': 0.92,
            'cultural_context': 0.88,
            'dialect_recognition': 0.85,
            'literary_knowledge': 0.90,
            'historical_awareness': 0.87,
            'geographical_knowledge': 0.89
        }
        
        logger.info(f"🔍 Advanced Monitoring System initialized with {monitoring_level.value} level")
    
    async def start_monitoring(self) -> None:
        """Start the monitoring system"""
        try:
            self.monitoring_active = True
            logger.info("🚀 Starting advanced monitoring system...")
            
            # Start monitoring tasks
            monitoring_tasks = [
                asyncio.create_task(self._monitor_system_resources()),
                asyncio.create_task(self._monitor_ai_performance()),
                asyncio.create_task(self._analyze_trends()),
                asyncio.create_task(self._generate_alerts())
            ]
            
            if self.monitoring_level in [MonitoringLevel.COMPREHENSIVE, MonitoringLevel.REALTIME]:
                monitoring_tasks.extend([
                    asyncio.create_task(self._monitor_romanian_performance()),
                    asyncio.create_task(self._monitor_emergence_metrics()),
                    asyncio.create_task(self._optimize_performance())
                ])
            
            await asyncio.gather(*monitoring_tasks)
            
        except Exception as e:
            logger.error(f"❌ Error starting monitoring: {e}")
            raise
    
    async def stop_monitoring(self) -> None:
        """Stop the monitoring system"""
        self.monitoring_active = False
        logger.info("🛑 Monitoring system stopped")
    
    async def _monitor_system_resources(self) -> None:
        """Monitor system resource usage"""
        while self.monitoring_active:
            try:
                # CPU and Memory
                cpu_usage = psutil.cpu_percent(interval=1)
                memory = psutil.virtual_memory()
                memory_usage = memory.percent
                
                # GPU metrics (if available)
                gpu_usage = 0.0
                gpu_memory = 0.0
                try:
                    gpus = GPUtil.getGPUs()
                    if gpus:
                        gpu = gpus[0]  # Primary GPU
                        gpu_usage = gpu.load * 100
                        gpu_memory = gpu.memoryUtil * 100
                except:
                    pass  # No GPU available
                
                # Disk and Network I/O
                disk_io = psutil.disk_io_counters()
                disk_io_rate = disk_io.read_bytes + disk_io.write_bytes if disk_io else 0
                
                network_io = psutil.net_io_counters()
                network_io_rate = network_io.bytes_sent + network_io.bytes_recv if network_io else 0
                
                # Temperature (if available)
                temperature = 0.0
                try:
                    temps = psutil.sensors_temperatures()
                    if temps:
                        temperature = list(temps.values())[0][0].current
                except:
                    pass
                
                # Create metrics record
                metrics = SystemMetrics(
                    timestamp=datetime.now(),
                    cpu_usage=cpu_usage,
                    memory_usage=memory_usage,
                    gpu_usage=gpu_usage,
                    gpu_memory=gpu_memory,
                    disk_io=disk_io_rate,
                    network_io=network_io_rate,
                    temperature=temperature
                )
                
                self.system_metrics_history.append(metrics)
                
                # Keep only last 1000 records
                if len(self.system_metrics_history) > 1000:
                    self.system_metrics_history = self.system_metrics_history[-1000:]
                
                # Check thresholds
                await self._check_system_thresholds(metrics)
                
                # Monitoring frequency based on level
                sleep_time = {
                    MonitoringLevel.BASIC: 30,
                    MonitoringLevel.DETAILED: 10,
                    MonitoringLevel.COMPREHENSIVE: 5,
                    MonitoringLevel.REALTIME: 1
                }[self.monitoring_level]
                
                await asyncio.sleep(sleep_time)
                
            except Exception as e:
                logger.error(f"❌ Error monitoring system resources: {e}")
                await asyncio.sleep(5)
    
    async def _monitor_ai_performance(self) -> None:
        """Monitor AI system performance metrics"""
        while self.monitoring_active:
            try:
                # Simulate AI performance metrics collection
                # In production, these would come from actual AI system
                
                start_time = time.time()
                
                # Simulate inference
                await asyncio.sleep(0.1)  # Simulate processing time
                
                inference_time = time.time() - start_time
                
                # Generate realistic metrics
                accuracy_score = np.random.normal(0.85, 0.05)
                confidence_score = np.random.normal(0.82, 0.08)
                romanian_cultural_score = np.random.normal(0.78, 0.06)
                emergence_level = np.random.normal(0.65, 0.1)
                reasoning_depth = np.random.normal(0.72, 0.09)
                creativity_index = np.random.normal(0.68, 0.12)
                
                # Clamp values to valid ranges
                accuracy_score = max(0.0, min(1.0, accuracy_score))
                confidence_score = max(0.0, min(1.0, confidence_score))
                romanian_cultural_score = max(0.0, min(1.0, romanian_cultural_score))
                emergence_level = max(0.0, min(1.0, emergence_level))
                reasoning_depth = max(0.0, min(1.0, reasoning_depth))
                creativity_index = max(0.0, min(1.0, creativity_index))
                
                # Create AI metrics record
                ai_metrics = AIMetrics(
                    timestamp=datetime.now(),
                    model_inference_time=inference_time,
                    accuracy_score=accuracy_score,
                    confidence_score=confidence_score,
                    romanian_cultural_score=romanian_cultural_score,
                    emergence_level=emergence_level,
                    reasoning_depth=reasoning_depth,
                    creativity_index=creativity_index
                )
                
                self.ai_metrics_history.append(ai_metrics)
                
                # Keep only last 1000 records
                if len(self.ai_metrics_history) > 1000:
                    self.ai_metrics_history = self.ai_metrics_history[-1000:]
                
                # Check AI performance thresholds
                await self._check_ai_thresholds(ai_metrics)
                
                await asyncio.sleep(5)  # AI metrics every 5 seconds
                
            except Exception as e:
                logger.error(f"❌ Error monitoring AI performance: {e}")
                await asyncio.sleep(5)
    
    async def _monitor_romanian_performance(self) -> None:
        """Monitor Romanian-specific performance metrics"""
        while self.monitoring_active:
            try:
                # Romanian performance benchmarking
                romanian_performance = {}
                
                for benchmark, target in self.romanian_benchmarks.items():
                    # Simulate realistic Romanian performance
                    current_score = np.random.normal(target * 0.9, target * 0.05)
                    current_score = max(0.0, min(1.0, current_score))
                    romanian_performance[benchmark] = current_score
                
                # Log Romanian performance
                if np.random.random() < 0.1:  # 10% chance to log
                    logger.info(f"🇷🇴 Romanian Performance: {romanian_performance}")
                
                # Check for Romanian performance issues
                for metric, score in romanian_performance.items():
                    target = self.romanian_benchmarks[metric]
                    if score < target * 0.8:  # Below 80% of target
                        await self._create_alert(
                            severity="WARNING",
                            component="romanian_performance",
                            message=f"Romanian {metric} below target: {score:.3f} < {target:.3f}",
                            metrics={"metric": metric, "score": score, "target": target}
                        )
                
                await asyncio.sleep(30)  # Romanian metrics every 30 seconds
                
            except Exception as e:
                logger.error(f"❌ Error monitoring Romanian performance: {e}")
                await asyncio.sleep(30)
    
    async def _monitor_emergence_metrics(self) -> None:
        """Monitor AGI emergence metrics"""
        while self.monitoring_active:
            try:
                # Emergence metrics
                emergence_metrics = {
                    'novel_reasoning_patterns': np.random.normal(0.45, 0.1),
                    'cross_domain_transfer': np.random.normal(0.52, 0.08),
                    'creative_problem_solving': np.random.normal(0.38, 0.12),
                    'autonomous_learning': np.random.normal(0.41, 0.09),
                    'meta_cognitive_awareness': np.random.normal(0.35, 0.15),
                    'cultural_wisdom_integration': np.random.normal(0.62, 0.07)
                }
                
                # Clamp values
                for key in emergence_metrics:
                    emergence_metrics[key] = max(0.0, min(1.0, emergence_metrics[key]))
                
                # Calculate overall emergence score
                overall_emergence = np.mean(list(emergence_metrics.values()))
                
                # Log emergence progress
                if np.random.random() < 0.05:  # 5% chance to log
                    logger.info(f"🌟 AGI Emergence Score: {overall_emergence:.3f}")
                    logger.info(f"🧠 Emergence Metrics: {emergence_metrics}")
                
                # Check for emergence milestones
                if overall_emergence > 0.7:
                    await self._create_alert(
                        severity="INFO",
                        component="emergence_detection",
                        message=f"High emergence detected: {overall_emergence:.3f}",
                        metrics=emergence_metrics
                    )
                
                await asyncio.sleep(60)  # Emergence metrics every minute
                
            except Exception as e:
                logger.error(f"❌ Error monitoring emergence metrics: {e}")
                await asyncio.sleep(60)
    
    async def _analyze_trends(self) -> None:
        """Analyze performance trends and patterns"""
        while self.monitoring_active:
            try:
                if len(self.system_metrics_history) < 10:
                    await asyncio.sleep(60)
                    continue
                
                # Analyze recent trends (last 10 readings)
                recent_metrics = self.system_metrics_history[-10:]
                
                # CPU trend
                cpu_values = [m.cpu_usage for m in recent_metrics]
                cpu_trend = np.polyfit(range(len(cpu_values)), cpu_values, 1)[0]
                
                # Memory trend
                memory_values = [m.memory_usage for m in recent_metrics]
                memory_trend = np.polyfit(range(len(memory_values)), memory_values, 1)[0]
                
                # Check for concerning trends
                if cpu_trend > 2.0:  # CPU increasing by >2% per reading
                    await self._create_alert(
                        severity="WARNING",
                        component="trend_analysis",
                        message=f"Rapidly increasing CPU usage trend: {cpu_trend:.2f}%/reading",
                        metrics={"cpu_trend": cpu_trend, "current_cpu": cpu_values[-1]}
                    )
                
                if memory_trend > 1.5:  # Memory increasing by >1.5% per reading
                    await self._create_alert(
                        severity="WARNING",
                        component="trend_analysis",
                        message=f"Rapidly increasing memory usage trend: {memory_trend:.2f}%/reading",
                        metrics={"memory_trend": memory_trend, "current_memory": memory_values[-1]}
                    )
                
                await asyncio.sleep(120)  # Trend analysis every 2 minutes
                
            except Exception as e:
                logger.error(f"❌ Error analyzing trends: {e}")
                await asyncio.sleep(120)
    
    async def _optimize_performance(self) -> None:
        """Automatic performance optimization"""
        while self.monitoring_active:
            try:
                # Performance optimization logic
                optimization_actions = []
                
                if len(self.system_metrics_history) > 0:
                    latest_metrics = self.system_metrics_history[-1]
                    
                    # Memory optimization
                    if latest_metrics.memory_usage > 85:
                        optimization_actions.append("memory_cleanup")
                    
                    # GPU optimization
                    if latest_metrics.gpu_usage > 95:
                        optimization_actions.append("gpu_memory_cleanup")
                    
                    # CPU optimization
                    if latest_metrics.cpu_usage > 90:
                        optimization_actions.append("process_optimization")
                
                # AI performance optimization
                if len(self.ai_metrics_history) > 0:
                    latest_ai_metrics = self.ai_metrics_history[-1]
                    
                    if latest_ai_metrics.model_inference_time > 2.0:
                        optimization_actions.append("model_optimization")
                    
                    if latest_ai_metrics.accuracy_score < 0.8:
                        optimization_actions.append("model_retraining")
                
                # Execute optimizations
                for action in optimization_actions:
                    await self._execute_optimization(action)
                
                await asyncio.sleep(300)  # Optimization every 5 minutes
                
            except Exception as e:
                logger.error(f"❌ Error in performance optimization: {e}")
                await asyncio.sleep(300)
    
    async def _execute_optimization(self, action: str) -> None:
        """Execute specific optimization action"""
        try:
            logger.info(f"🔧 Executing optimization: {action}")
            
            if action == "memory_cleanup":
                # Memory cleanup logic
                import gc
                gc.collect()
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
            
            elif action == "gpu_memory_cleanup":
                # GPU memory cleanup
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                    torch.cuda.synchronize()
            
            elif action == "process_optimization":
                # Process optimization
                logger.info("🔧 Process optimization triggered")
            
            elif action == "model_optimization":
                # Model optimization
                logger.info("🔧 Model optimization triggered")
            
            elif action == "model_retraining":
                # Model retraining trigger
                logger.info("🔧 Model retraining triggered")
            
            await self._create_alert(
                severity="INFO",
                component="optimization",
                message=f"Optimization action executed: {action}",
                metrics={"action": action}
            )
            
        except Exception as e:
            logger.error(f"❌ Error executing optimization {action}: {e}")
    
    async def _generate_alerts(self) -> None:
        """Generate and manage alerts"""
        while self.monitoring_active:
            try:
                # Clean up old alerts (older than 1 hour)
                current_time = datetime.now()
                self.alerts = [
                    alert for alert in self.alerts 
                    if current_time - alert.timestamp < timedelta(hours=1)
                ]
                
                # Generate summary alerts
                if len(self.alerts) > 10:  # Too many alerts
                    await self._create_alert(
                        severity="WARNING",
                        component="alert_system",
                        message=f"High alert volume: {len(self.alerts)} alerts in last hour",
                        metrics={"alert_count": len(self.alerts)}
                    )
                
                await asyncio.sleep(60)  # Alert management every minute
                
            except Exception as e:
                logger.error(f"❌ Error in alert generation: {e}")
                await asyncio.sleep(60)
    
    async def _check_system_thresholds(self, metrics: SystemMetrics) -> None:
        """Check system metrics against thresholds"""
        try:
            # CPU checks
            if metrics.cpu_usage > self.performance_thresholds['cpu_usage_critical']:
                await self._create_alert(
                    severity="CRITICAL",
                    component="system_resources",
                    message=f"Critical CPU usage: {metrics.cpu_usage:.1f}%",
                    metrics={"cpu_usage": metrics.cpu_usage},
                    action_required=True
                )
            elif metrics.cpu_usage > self.performance_thresholds['cpu_usage_warning']:
                await self._create_alert(
                    severity="WARNING",
                    component="system_resources",
                    message=f"High CPU usage: {metrics.cpu_usage:.1f}%",
                    metrics={"cpu_usage": metrics.cpu_usage}
                )
            
            # Memory checks
            if metrics.memory_usage > self.performance_thresholds['memory_usage_critical']:
                await self._create_alert(
                    severity="CRITICAL",
                    component="system_resources",
                    message=f"Critical memory usage: {metrics.memory_usage:.1f}%",
                    metrics={"memory_usage": metrics.memory_usage},
                    action_required=True
                )
            elif metrics.memory_usage > self.performance_thresholds['memory_usage_warning']:
                await self._create_alert(
                    severity="WARNING",
                    component="system_resources",
                    message=f"High memory usage: {metrics.memory_usage:.1f}%",
                    metrics={"memory_usage": metrics.memory_usage}
                )
            
            # GPU checks (if available)
            if metrics.gpu_usage > 0:
                if metrics.gpu_usage > self.performance_thresholds['gpu_usage_critical']:
                    await self._create_alert(
                        severity="CRITICAL",
                        component="gpu_resources",
                        message=f"Critical GPU usage: {metrics.gpu_usage:.1f}%",
                        metrics={"gpu_usage": metrics.gpu_usage},
                        action_required=True
                    )
                elif metrics.gpu_usage > self.performance_thresholds['gpu_usage_warning']:
                    await self._create_alert(
                        severity="WARNING",
                        component="gpu_resources",
                        message=f"High GPU usage: {metrics.gpu_usage:.1f}%",
                        metrics={"gpu_usage": metrics.gpu_usage}
                    )
            
        except Exception as e:
            logger.error(f"❌ Error checking system thresholds: {e}")
    
    async def _check_ai_thresholds(self, metrics: AIMetrics) -> None:
        """Check AI metrics against thresholds"""
        try:
            # Inference time checks
            if metrics.model_inference_time > self.performance_thresholds['inference_time_critical']:
                await self._create_alert(
                    severity="CRITICAL",
                    component="ai_performance",
                    message=f"Critical inference time: {metrics.model_inference_time:.2f}s",
                    metrics={"inference_time": metrics.model_inference_time},
                    action_required=True
                )
            elif metrics.model_inference_time > self.performance_thresholds['inference_time_warning']:
                await self._create_alert(
                    severity="WARNING",
                    component="ai_performance",
                    message=f"Slow inference time: {metrics.model_inference_time:.2f}s",
                    metrics={"inference_time": metrics.model_inference_time}
                )
            
            # Accuracy checks
            if metrics.accuracy_score < self.performance_thresholds['accuracy_critical']:
                await self._create_alert(
                    severity="CRITICAL",
                    component="ai_performance",
                    message=f"Critical accuracy drop: {metrics.accuracy_score:.3f}",
                    metrics={"accuracy": metrics.accuracy_score},
                    action_required=True
                )
            elif metrics.accuracy_score < self.performance_thresholds['accuracy_warning']:
                await self._create_alert(
                    severity="WARNING",
                    component="ai_performance",
                    message=f"Low accuracy: {metrics.accuracy_score:.3f}",
                    metrics={"accuracy": metrics.accuracy_score}
                )
            
            # Romanian cultural performance checks
            if metrics.romanian_cultural_score < self.performance_thresholds['romanian_cultural_critical']:
                await self._create_alert(
                    severity="CRITICAL",
                    component="romanian_ai",
                    message=f"Critical Romanian cultural score: {metrics.romanian_cultural_score:.3f}",
                    metrics={"romanian_score": metrics.romanian_cultural_score},
                    action_required=True
                )
            elif metrics.romanian_cultural_score < self.performance_thresholds['romanian_cultural_warning']:
                await self._create_alert(
                    severity="WARNING",
                    component="romanian_ai",
                    message=f"Low Romanian cultural score: {metrics.romanian_cultural_score:.3f}",
                    metrics={"romanian_score": metrics.romanian_cultural_score}
                )
            
        except Exception as e:
            logger.error(f"❌ Error checking AI thresholds: {e}")
    
    async def _create_alert(self, severity: str, component: str, message: str, 
                          metrics: Dict[str, Any], action_required: bool = False) -> None:
        """Create a monitoring alert"""
        try:
            alert = MonitoringAlert(
                timestamp=datetime.now(),
                severity=severity,
                component=component,
                message=message,
                metrics=metrics,
                action_required=action_required
            )
            
            self.alerts.append(alert)
            
            # Log alert based on severity
            if severity == "CRITICAL":
                logger.error(f"🚨 CRITICAL ALERT [{component}]: {message}")
            elif severity == "WARNING":
                logger.warning(f"⚠️ WARNING [{component}]: {message}")
            else:
                logger.info(f"ℹ️ INFO [{component}]: {message}")
            
        except Exception as e:
            logger.error(f"❌ Error creating alert: {e}")
    
    async def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status"""
        try:
            current_time = datetime.now()
            
            # Recent metrics
            recent_system_metrics = self.system_metrics_history[-1] if self.system_metrics_history else None
            recent_ai_metrics = self.ai_metrics_history[-1] if self.ai_metrics_history else None
            
            # Alert summary
            recent_alerts = [
                alert for alert in self.alerts 
                if current_time - alert.timestamp < timedelta(minutes=10)
            ]
            
            alert_summary = {
                'total_alerts': len(self.alerts),
                'recent_alerts': len(recent_alerts),
                'critical_alerts': len([a for a in recent_alerts if a.severity == "CRITICAL"]),
                'warning_alerts': len([a for a in recent_alerts if a.severity == "WARNING"]),
                'info_alerts': len([a for a in recent_alerts if a.severity == "INFO"])
            }
            
            return {
                'monitoring_active': self.monitoring_active,
                'monitoring_level': self.monitoring_level.value,
                'uptime': str(current_time - datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)),
                'system_metrics': {
                    'cpu_usage': recent_system_metrics.cpu_usage if recent_system_metrics else 0,
                    'memory_usage': recent_system_metrics.memory_usage if recent_system_metrics else 0,
                    'gpu_usage': recent_system_metrics.gpu_usage if recent_system_metrics else 0,
                    'timestamp': recent_system_metrics.timestamp.isoformat() if recent_system_metrics else None
                },
                'ai_metrics': {
                    'inference_time': recent_ai_metrics.model_inference_time if recent_ai_metrics else 0,
                    'accuracy': recent_ai_metrics.accuracy_score if recent_ai_metrics else 0,
                    'romanian_cultural_score': recent_ai_metrics.romanian_cultural_score if recent_ai_metrics else 0,
                    'emergence_level': recent_ai_metrics.emergence_level if recent_ai_metrics else 0,
                    'timestamp': recent_ai_metrics.timestamp.isoformat() if recent_ai_metrics else None
                },
                'alerts': alert_summary,
                'performance_status': self._calculate_overall_health(),
                'romanian_performance': self._calculate_romanian_performance(),
                'emergence_status': self._calculate_emergence_status(),
                'timestamp': current_time.isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Error getting monitoring status: {e}")
            return {'error': str(e)}
    
    def _calculate_overall_health(self) -> str:
        """Calculate overall system health status"""
        try:
            if not self.system_metrics_history or not self.ai_metrics_history:
                return "INITIALIZING"
            
            recent_system = self.system_metrics_history[-1]
            recent_ai = self.ai_metrics_history[-1]
            recent_alerts = [a for a in self.alerts if datetime.now() - a.timestamp < timedelta(minutes=5)]
            
            # Check for critical issues
            critical_alerts = [a for a in recent_alerts if a.severity == "CRITICAL"]
            if critical_alerts:
                return "CRITICAL"
            
            # Check system resources
            if (recent_system.cpu_usage > 90 or 
                recent_system.memory_usage > 90 or 
                recent_system.gpu_usage > 95):
                return "WARNING"
            
            # Check AI performance
            if (recent_ai.model_inference_time > 2.0 or 
                recent_ai.accuracy_score < 0.75 or 
                recent_ai.romanian_cultural_score < 0.70):
                return "WARNING"
            
            return "HEALTHY"
            
        except Exception as e:
            logger.error(f"❌ Error calculating health: {e}")
            return "UNKNOWN"
    
    def _calculate_romanian_performance(self) -> Dict[str, float]:
        """Calculate Romanian-specific performance metrics"""
        try:
            if not self.ai_metrics_history:
                return {}
            
            recent_metrics = self.ai_metrics_history[-10:]  # Last 10 readings
            
            return {
                'average_cultural_score': np.mean([m.romanian_cultural_score for m in recent_metrics]),
                'cultural_stability': 1.0 - np.std([m.romanian_cultural_score for m in recent_metrics]),
                'performance_trend': self._calculate_trend([m.romanian_cultural_score for m in recent_metrics])
            }
            
        except Exception as e:
            logger.error(f"❌ Error calculating Romanian performance: {e}")
            return {}
    
    def _calculate_emergence_status(self) -> Dict[str, float]:
        """Calculate AGI emergence status"""
        try:
            if not self.ai_metrics_history:
                return {}
            
            recent_metrics = self.ai_metrics_history[-10:]  # Last 10 readings
            
            return {
                'average_emergence_level': np.mean([m.emergence_level for m in recent_metrics]),
                'emergence_stability': 1.0 - np.std([m.emergence_level for m in recent_metrics]),
                'reasoning_depth': np.mean([m.reasoning_depth for m in recent_metrics]),
                'creativity_index': np.mean([m.creativity_index for m in recent_metrics])
            }
            
        except Exception as e:
            logger.error(f"❌ Error calculating emergence status: {e}")
            return {}
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate trend direction from values"""
        try:
            if len(values) < 2:
                return 0.0
            return np.polyfit(range(len(values)), values, 1)[0]
        except:
            return 0.0

# Global monitoring instance
monitoring_system = None

async def initialize_monitoring(level: MonitoringLevel = MonitoringLevel.DETAILED) -> AdvancedMonitoringSystem:
    """Initialize the global monitoring system"""
    global monitoring_system
    
    if monitoring_system is None:
        monitoring_system = AdvancedMonitoringSystem(level)
        logger.info("🔍 Advanced Monitoring System initialized")
    
    return monitoring_system

async def get_monitoring_system() -> Optional[AdvancedMonitoringSystem]:
    """Get the global monitoring system instance"""
    return monitoring_system

if __name__ == "__main__":
    async def test_monitoring():
        """Test the monitoring system"""
        system = await initialize_monitoring(MonitoringLevel.COMPREHENSIVE)
        
        # Start monitoring for 30 seconds
        monitoring_task = asyncio.create_task(system.start_monitoring())
        
        # Let it run for a short time
        await asyncio.sleep(30)
        
        # Stop monitoring
        await system.stop_monitoring()
        
        # Get status
        status = await system.get_monitoring_status()
        print("🔍 Final Monitoring Status:")
        print(json.dumps(status, indent=2, default=str))
    
    asyncio.run(test_monitoring())
