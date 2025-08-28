"""
Task Execution Monitor - Autonomous Operation Tracking
====================================================

Monitors task execution, tracks performance, and provides real-time
feedback for the AGI system's autonomous operations.

Key Features:
- Real-time task execution tracking and monitoring
- Performance metrics collection and analysis  
- Anomaly detection and failure prediction
- Resource utilization monitoring
- Automated intervention triggers
- Execution history and pattern analysis

Author: GitHub Copilot Agent
Date: August 27, 2025
Version: 1.0.0 - Phase 1 AGI Implementation
"""

import asyncio
import logging
import time
import json
import threading
from typing import Dict, List, Any, Optional, Callable, Tuple
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta
from collections import deque, defaultdict
import statistics

logger = logging.getLogger(__name__)

class ExecutionStatus(Enum):
    """Task execution status"""
    QUEUED = "queued"
    STARTING = "starting"
    RUNNING = "running"
    COMPLETING = "completing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    PAUSED = "paused"
    RETRYING = "retrying"

class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning" 
    ERROR = "error"
    CRITICAL = "critical"

class InterventionType(Enum):
    """Types of automated interventions"""
    RESOURCE_REALLOCATION = "resource_reallocation"
    TASK_RETRY = "task_retry"
    TASK_CANCELLATION = "task_cancellation"
    PERFORMANCE_OPTIMIZATION = "performance_optimization"
    EMERGENCY_SHUTDOWN = "emergency_shutdown"

@dataclass
class TaskExecution:
    """Task execution tracking data"""
    task_id: str
    goal_id: str
    description: str
    status: ExecutionStatus
    
    # Timing information
    queued_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_duration: float = 0.0
    actual_duration: float = 0.0
    
    # Performance metrics
    progress_percentage: float = 0.0
    resource_usage: Dict[str, float] = field(default_factory=dict)
    performance_score: float = 0.0
    
    # Error tracking
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)
    retry_count: int = 0
    max_retries: int = 3
    
    # Context and metadata
    context: Dict[str, Any] = field(default_factory=dict)
    checkpoints: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_checkpoint(self, name: str, data: Dict[str, Any]) -> None:
        """Add execution checkpoint"""
        checkpoint = {
            "name": name,
            "timestamp": datetime.now().isoformat(),
            "progress": self.progress_percentage,
            "data": data
        }
        self.checkpoints.append(checkpoint)
    
    def update_progress(self, percentage: float, context: Optional[Dict[str, Any]] = None) -> None:
        """Update task progress"""
        self.progress_percentage = max(0.0, min(100.0, percentage))
        if context:
            self.context.update(context)

@dataclass
class PerformanceMetrics:
    """Performance metrics for monitoring"""
    avg_completion_time: float = 0.0
    success_rate: float = 0.0
    error_rate: float = 0.0
    resource_efficiency: float = 0.0
    throughput: float = 0.0
    
    # Trend indicators
    completion_time_trend: str = "stable"  # improving, stable, degrading
    success_rate_trend: str = "stable"
    resource_usage_trend: str = "stable"
    
    def update_trends(self, historical_data: List[float], current_value: float) -> str:
        """Update trend indicators based on historical data"""
        if len(historical_data) < 3:
            return "stable"
        
        recent_avg = statistics.mean(historical_data[-3:])
        older_avg = statistics.mean(historical_data[:-3]) if len(historical_data) > 3 else recent_avg
        
        if recent_avg > older_avg * 1.1:
            return "improving"
        elif recent_avg < older_avg * 0.9:
            return "degrading"
        else:
            return "stable"

@dataclass
class Alert:
    """System alert for monitoring events"""
    id: str
    severity: AlertSeverity
    message: str
    task_id: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    resolved: bool = False
    intervention_applied: Optional[InterventionType] = None

class TaskExecutionMonitor:
    """
    Task Execution Monitor for AGI System
    
    Provides comprehensive monitoring of task execution with real-time
    tracking, performance analysis, and automated intervention capabilities.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize task execution monitor"""
        self.config = config or {}
        
        # Task tracking
        self.active_executions: Dict[str, TaskExecution] = {}
        self.completed_executions: Dict[str, TaskExecution] = {}
        self.execution_history: deque = deque(maxlen=1000)
        
        # Performance tracking
        self.performance_metrics = PerformanceMetrics()
        self.metrics_history: Dict[str, deque] = {
            "completion_times": deque(maxlen=100),
            "success_rates": deque(maxlen=100),
            "resource_usage": deque(maxlen=100),
            "throughput": deque(maxlen=100)
        }
        
        # Monitoring configuration
        self.monitoring_interval = 1.0  # seconds
        self.performance_threshold = {
            "min_success_rate": 0.7,
            "max_avg_completion_time": 300.0,
            "max_error_rate": 0.2,
            "min_resource_efficiency": 0.6
        }
        
        # Alert system
        self.alerts: deque = deque(maxlen=500)
        self.alert_callbacks: List[Callable] = []
        
        # Intervention system
        self.auto_intervention_enabled = True
        self.intervention_history: List[Dict[str, Any]] = []
        
        # Monitoring control
        self._monitoring_active = False
        self._monitor_task: Optional[asyncio.Task] = None
        self._shutdown_event = asyncio.Event()
        
        logger.info("📊 Task Execution Monitor initialized")
        logger.info(f"🔍 Monitoring interval: {self.monitoring_interval}s")
    
    async def start_monitoring(self) -> None:
        """Start monitoring task execution"""
        if self._monitoring_active:
            logger.warning("⚠️ Monitoring already active")
            return
        
        self._monitoring_active = True
        self._shutdown_event.clear()
        
        # Start monitoring loop
        self._monitor_task = asyncio.create_task(self._monitoring_loop())
        
        logger.info("🚀 Task execution monitoring started")
    
    async def stop_monitoring(self) -> None:
        """Stop monitoring task execution"""
        if not self._monitoring_active:
            return
        
        self._monitoring_active = False
        self._shutdown_event.set()
        
        if self._monitor_task:
            try:
                await asyncio.wait_for(self._monitor_task, timeout=5.0)
            except asyncio.TimeoutError:
                self._monitor_task.cancel()
        
        logger.info("🛑 Task execution monitoring stopped")
    
    async def register_task_execution(self, task_id: str, goal_id: str, 
                                    description: str, estimated_duration: float = 0.0,
                                    context: Optional[Dict[str, Any]] = None) -> TaskExecution:
        """
        Register new task execution for monitoring
        
        Args:
            task_id: Unique task identifier
            goal_id: Associated goal identifier
            description: Task description
            estimated_duration: Expected execution time in seconds
            context: Additional task context
            
        Returns:
            TaskExecution object for tracking
        """
        execution = TaskExecution(
            task_id=task_id,
            goal_id=goal_id,
            description=description,
            status=ExecutionStatus.QUEUED,
            queued_at=datetime.now(),
            estimated_duration=estimated_duration,
            context=context or {}
        )
        
        self.active_executions[task_id] = execution
        
        logger.info(f"📝 Registered task execution: {task_id}")
        return execution
    
    async def update_task_status(self, task_id: str, status: ExecutionStatus,
                               progress: Optional[float] = None,
                               context: Optional[Dict[str, Any]] = None) -> bool:
        """
        Update task execution status
        
        Args:
            task_id: Task identifier
            status: New execution status
            progress: Progress percentage (0-100)
            context: Additional context data
            
        Returns:
            True if update successful, False otherwise
        """
        try:
            if task_id not in self.active_executions:
                logger.warning(f"⚠️ Task not found for status update: {task_id}")
                return False
            
            execution = self.active_executions[task_id]
            old_status = execution.status
            execution.status = status
            
            # Update timing
            current_time = datetime.now()
            if status == ExecutionStatus.RUNNING and execution.started_at is None:
                execution.started_at = current_time
            elif status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED]:
                execution.completed_at = current_time
                if execution.started_at:
                    execution.actual_duration = (current_time - execution.started_at).total_seconds()
            
            # Update progress
            if progress is not None:
                execution.update_progress(progress, context)
            
            # Add checkpoint for status changes
            execution.add_checkpoint(f"status_change", {
                "old_status": old_status.value,
                "new_status": status.value,
                "progress": execution.progress_percentage
            })
            
            # Handle completion
            if status in [ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED]:
                await self._handle_task_completion(execution)
            
            # Check for performance issues
            await self._check_performance_anomalies(execution)
            
            logger.debug(f"📊 Updated task {task_id}: {old_status.value} → {status.value}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to update task status: {e}")
            return False
    
    async def _monitoring_loop(self) -> None:
        """Main monitoring loop"""
        logger.info("🔄 Starting monitoring loop")
        
        while self._monitoring_active and not self._shutdown_event.is_set():
            try:
                # Monitor active tasks
                await self._monitor_active_tasks()
                
                # Update performance metrics
                await self._update_performance_metrics()
                
                # Check for interventions
                if self.auto_intervention_enabled:
                    await self._check_intervention_triggers()
                
                # Clean up old data
                await self._cleanup_old_data()
                
                # Wait for next cycle
                await asyncio.sleep(self.monitoring_interval)
                
            except Exception as e:
                logger.error(f"❌ Monitoring loop error: {e}")
                await asyncio.sleep(1.0)  # Brief pause on error
        
        logger.info("🏁 Monitoring loop completed")
    
    async def _monitor_active_tasks(self) -> None:
        """Monitor all active task executions"""
        current_time = datetime.now()
        
        for task_id, execution in list(self.active_executions.items()):
            try:
                # Check for stuck tasks
                if execution.status == ExecutionStatus.RUNNING and execution.started_at:
                    runtime = (current_time - execution.started_at).total_seconds()
                    if runtime > execution.estimated_duration * 2 and execution.estimated_duration > 0:
                        await self._handle_stuck_task(execution)
                
                # Check for resource anomalies
                await self._check_resource_anomalies(execution)
                
                # Update resource usage tracking
                await self._update_resource_tracking(execution)
                
            except Exception as e:
                logger.error(f"❌ Error monitoring task {task_id}: {e}")
    
    async def _check_resource_anomalies(self, execution: TaskExecution) -> None:
        """Check for resource usage anomalies"""
        # Check for excessive resource usage
        for resource, usage in execution.resource_usage.items():
            if usage > 0.9:  # 90% usage threshold
                await self._create_alert(
                    AlertSeverity.WARNING,
                    f"High {resource} usage ({usage:.1%}) for task {execution.task_id}",
                    execution.task_id
                )
    
    async def _update_resource_tracking(self, execution: TaskExecution) -> None:
        """Update resource usage tracking for task"""
        # Simulate resource usage tracking (would connect to actual monitors)
        if execution.status == ExecutionStatus.RUNNING:
            # Example resource usage simulation
            execution.resource_usage = {
                "cpu": min(1.0, execution.progress_percentage / 100.0 * 0.8),
                "memory": min(1.0, execution.progress_percentage / 100.0 * 0.6),
                "attention": min(1.0, execution.progress_percentage / 100.0 * 0.7)
            }
    
    async def _handle_stuck_task(self, execution: TaskExecution) -> None:
        """Handle potentially stuck task"""
        await self._create_alert(
            AlertSeverity.WARNING,
            f"Task {execution.task_id} appears stuck (runtime: {execution.actual_duration:.1f}s)",
            execution.task_id
        )
        
        # Consider intervention
        if self.auto_intervention_enabled:
            await self._apply_intervention(execution, InterventionType.TASK_RETRY)
    
    async def _handle_task_completion(self, execution: TaskExecution) -> None:
        """Handle task completion"""
        # Move to completed executions
        if execution.task_id in self.active_executions:
            del self.active_executions[execution.task_id]
            self.completed_executions[execution.task_id] = execution
            self.execution_history.append(execution)
        
        # Calculate performance score
        execution.performance_score = await self._calculate_performance_score(execution)
        
        # Log completion
        if execution.status == ExecutionStatus.COMPLETED:
            logger.info(f"✅ Task completed: {execution.task_id} "
                       f"(Score: {execution.performance_score:.2f})")
        elif execution.status == ExecutionStatus.FAILED:
            logger.warning(f"❌ Task failed: {execution.task_id} "
                          f"(Errors: {len(execution.errors)})")
    
    async def _calculate_performance_score(self, execution: TaskExecution) -> float:
        """Calculate performance score for completed task"""
        score = 1.0
        
        # Time performance (better if completed faster than estimated)
        if execution.estimated_duration > 0:
            time_ratio = execution.actual_duration / execution.estimated_duration
            if time_ratio <= 1.0:
                score *= 1.0  # On time or early
            else:
                score *= max(0.1, 1.0 / time_ratio)  # Penalty for overtime
        
        # Success bonus/penalty
        if execution.status == ExecutionStatus.COMPLETED:
            score *= 1.2  # Success bonus
        elif execution.status == ExecutionStatus.FAILED:
            score *= 0.3  # Failure penalty
        
        # Error penalty
        error_penalty = len(execution.errors) * 0.1
        score = max(0.0, score - error_penalty)
        
        # Retry penalty
        retry_penalty = execution.retry_count * 0.05
        score = max(0.0, score - retry_penalty)
        
        return min(1.0, score)
    
    async def _update_performance_metrics(self) -> None:
        """Update overall performance metrics"""
        if not self.execution_history:
            return
        
        # Recent executions (last 50)
        recent_executions = list(self.execution_history)[-50:]
        
        # Calculate metrics
        completed_tasks = [e for e in recent_executions if e.status == ExecutionStatus.COMPLETED]
        failed_tasks = [e for e in recent_executions if e.status == ExecutionStatus.FAILED]
        
        # Success rate
        total_tasks = len(completed_tasks) + len(failed_tasks)
        if total_tasks > 0:
            success_rate = len(completed_tasks) / total_tasks
            self.performance_metrics.success_rate = success_rate
            self.metrics_history["success_rates"].append(success_rate)
        
        # Average completion time
        if completed_tasks:
            avg_time = statistics.mean([e.actual_duration for e in completed_tasks])
            self.performance_metrics.avg_completion_time = avg_time
            self.metrics_history["completion_times"].append(avg_time)
        
        # Error rate
        if recent_executions:
            error_rate = len(failed_tasks) / len(recent_executions)
            self.performance_metrics.error_rate = error_rate
        
        # Resource efficiency
        if recent_executions:
            efficiency_scores = [e.performance_score for e in recent_executions if e.performance_score > 0]
            if efficiency_scores:
                self.performance_metrics.resource_efficiency = statistics.mean(efficiency_scores)
        
        # Update trends
        self._update_performance_trends()
    
    def _update_performance_trends(self) -> None:
        """Update performance trend indicators"""
        # Update completion time trend
        completion_times = list(self.metrics_history["completion_times"])
        if completion_times:
            self.performance_metrics.completion_time_trend = \
                self.performance_metrics.update_trends(completion_times, completion_times[-1])
        
        # Update success rate trend
        success_rates = list(self.metrics_history["success_rates"])
        if success_rates:
            self.performance_metrics.success_rate_trend = \
                self.performance_metrics.update_trends(success_rates, success_rates[-1])
    
    async def _check_intervention_triggers(self) -> None:
        """Check if automated intervention is needed"""
        metrics = self.performance_metrics
        
        # Low success rate intervention
        if metrics.success_rate < self.performance_threshold["min_success_rate"]:
            await self._create_alert(
                AlertSeverity.ERROR,
                f"Low success rate: {metrics.success_rate:.1%}"
            )
        
        # High completion time intervention
        if metrics.avg_completion_time > self.performance_threshold["max_avg_completion_time"]:
            await self._create_alert(
                AlertSeverity.WARNING,
                f"High average completion time: {metrics.avg_completion_time:.1f}s"
            )
        
        # High error rate intervention
        if metrics.error_rate > self.performance_threshold["max_error_rate"]:
            await self._create_alert(
                AlertSeverity.ERROR,
                f"High error rate: {metrics.error_rate:.1%}"
            )
    
    async def _apply_intervention(self, execution: TaskExecution, 
                                intervention_type: InterventionType) -> bool:
        """Apply automated intervention"""
        try:
            intervention_record = {
                "task_id": execution.task_id,
                "intervention_type": intervention_type.value,
                "timestamp": datetime.now().isoformat(),
                "context": execution.context.copy()
            }
            
            if intervention_type == InterventionType.TASK_RETRY:
                if execution.retry_count < execution.max_retries:
                    execution.retry_count += 1
                    execution.status = ExecutionStatus.RETRYING
                    intervention_record["action"] = "Task retry initiated"
                    logger.info(f"🔄 Retrying task: {execution.task_id} (attempt {execution.retry_count})")
                else:
                    execution.status = ExecutionStatus.FAILED
                    execution.errors.append("Maximum retry attempts exceeded")
                    intervention_record["action"] = "Task failed - max retries exceeded"
            
            elif intervention_type == InterventionType.TASK_CANCELLATION:
                execution.status = ExecutionStatus.CANCELLED
                intervention_record["action"] = "Task cancelled"
                logger.warning(f"🚫 Cancelled task: {execution.task_id}")
            
            elif intervention_type == InterventionType.RESOURCE_REALLOCATION:
                # Signal need for resource reallocation (handled by attention system)
                intervention_record["action"] = "Resource reallocation requested"
                logger.info(f"📊 Requesting resource reallocation for task: {execution.task_id}")
            
            self.intervention_history.append(intervention_record)
            
            await self._create_alert(
                AlertSeverity.INFO,
                f"Intervention applied: {intervention_type.value} for task {execution.task_id}",
                execution.task_id
            )
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to apply intervention: {e}")
            return False
    
    async def _create_alert(self, severity: AlertSeverity, message: str,
                          task_id: Optional[str] = None) -> None:
        """Create system alert"""
        alert = Alert(
            id=f"alert_{int(time.time() * 1000)}",
            severity=severity,
            message=message,
            task_id=task_id
        )
        
        self.alerts.append(alert)
        
        # Call alert callbacks
        for callback in self.alert_callbacks:
            try:
                await callback(alert)
            except Exception as e:
                logger.error(f"❌ Alert callback failed: {e}")
        
        # Log alert
        log_level = {
            AlertSeverity.INFO: logger.info,
            AlertSeverity.WARNING: logger.warning,
            AlertSeverity.ERROR: logger.error,
            AlertSeverity.CRITICAL: logger.critical
        }.get(severity, logger.info)
        
        log_level(f"🚨 {severity.value.upper()}: {message}")
    
    async def _cleanup_old_data(self) -> None:
        """Clean up old monitoring data"""
        current_time = datetime.now()
        cleanup_age = timedelta(hours=24)
        
        # Clean up old completed executions
        old_executions = []
        for task_id, execution in self.completed_executions.items():
            if execution.completed_at and (current_time - execution.completed_at) > cleanup_age:
                old_executions.append(task_id)
        
        for task_id in old_executions:
            del self.completed_executions[task_id]
        
        if old_executions:
            logger.debug(f"🧹 Cleaned up {len(old_executions)} old executions")
    
    async def get_monitoring_status(self) -> Dict[str, Any]:
        """Get current monitoring status"""
        return {
            "monitoring_active": self._monitoring_active,
            "active_tasks": len(self.active_executions),
            "completed_tasks": len(self.completed_executions),
            "recent_alerts": len([a for a in self.alerts if not a.resolved]),
            "performance_metrics": {
                "success_rate": self.performance_metrics.success_rate,
                "avg_completion_time": self.performance_metrics.avg_completion_time,
                "error_rate": self.performance_metrics.error_rate,
                "resource_efficiency": self.performance_metrics.resource_efficiency,
                "success_rate_trend": self.performance_metrics.success_rate_trend,
                "completion_time_trend": self.performance_metrics.completion_time_trend
            },
            "intervention_count": len(self.intervention_history),
            "auto_intervention_enabled": self.auto_intervention_enabled
        }
    
    async def get_task_details(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get detailed information about a specific task"""
        execution = (self.active_executions.get(task_id) or 
                    self.completed_executions.get(task_id))
        
        if not execution:
            return None
        
        return {
            "task_id": execution.task_id,
            "goal_id": execution.goal_id,
            "description": execution.description,
            "status": execution.status.value,
            "progress": execution.progress_percentage,
            "queued_at": execution.queued_at.isoformat(),
            "started_at": execution.started_at.isoformat() if execution.started_at else None,
            "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
            "estimated_duration": execution.estimated_duration,
            "actual_duration": execution.actual_duration,
            "performance_score": execution.performance_score,
            "resource_usage": execution.resource_usage,
            "errors": execution.errors,
            "warnings": execution.warnings,
            "retry_count": execution.retry_count,
            "checkpoints": execution.checkpoints[-10:]  # Last 10 checkpoints
        }
    
    def add_alert_callback(self, callback: Callable[[Alert], None]) -> None:
        """Add callback for alert notifications"""
        self.alert_callbacks.append(callback)
        logger.info("📞 Alert callback registered")
    
    async def resolve_alert(self, alert_id: str) -> bool:
        """Resolve an alert"""
        for alert in self.alerts:
            if alert.id == alert_id:
                alert.resolved = True
                logger.info(f"✅ Alert resolved: {alert_id}")
                return True
        
        return False