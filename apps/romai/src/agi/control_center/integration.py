"""
AGI Integration Module - Component Coordination and Integration
===========================================================

Integrates all AGI control center components and provides unified
interface for the main AGI system. Handles component initialization,
coordination, and inter-component communication.

Key Features:
- Component lifecycle management and coordination
- Unified interface for AGI Control Center subsystems
- Inter-component communication and data flow
- System health monitoring and diagnostics
- Configuration management and validation
- Error handling and recovery coordination

Author: GitHub Copilot Agent
Date: August 27, 2025
Version: 1.0.0 - Phase 1 AGI Implementation
"""

import asyncio
import logging
import json
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from datetime import datetime
import traceback

# Import all control center components
from .agi_control_center import AGIControlCenter, ResourceType, TaskPriority
from .attention_allocation import AttentionAllocationSystem, AttentionMode, ResourceBudget
from .strategic_planning import StrategicPlanningEngine, Goal, Strategy, PlanHorizon, StrategyType
from .execution_monitor import TaskExecutionMonitor, ExecutionStatus, AlertSeverity, Alert

logger = logging.getLogger(__name__)

@dataclass
class ComponentStatus:
    """Status information for AGI components"""
    name: str
    initialized: bool = False
    active: bool = False
    health_score: float = 1.0
    last_error: Optional[str] = None
    last_updated: datetime = field(default_factory=datetime.now)
    metrics: Dict[str, Any] = field(default_factory=dict)

class AGIIntegration:
    """
    AGI Integration System
    
    Manages initialization, coordination, and communication between
    all AGI Control Center components for unified autonomous operation.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """Initialize AGI integration system"""
        self.config = config or {}
        
        # Component instances
        self.control_center: Optional[AGIControlCenter] = None
        self.attention_system: Optional[AttentionAllocationSystem] = None
        self.planning_engine: Optional[StrategicPlanningEngine] = None
        self.execution_monitor: Optional[TaskExecutionMonitor] = None
        
        # Component status tracking
        self.component_status: Dict[str, ComponentStatus] = {
            "control_center": ComponentStatus("AGI Control Center"),
            "attention_system": ComponentStatus("Attention Allocation System"),
            "planning_engine": ComponentStatus("Strategic Planning Engine"),
            "execution_monitor": ComponentStatus("Task Execution Monitor")
        }
        
        # Integration state
        self.system_initialized = False
        self.system_active = False
        self.integration_metrics = {
            "component_health": 0.0,
            "integration_efficiency": 0.0,
            "communication_latency": 0.0,
            "error_count": 0,
            "uptime": 0.0
        }
        
        # Event system for inter-component communication
        self.event_handlers: Dict[str, List[Callable]] = {}
        self.event_queue: asyncio.Queue = asyncio.Queue()
        self.event_processor_task: Optional[asyncio.Task] = None
        
        # System health monitoring
        self.health_check_interval = 30.0  # seconds
        self.health_monitor_task: Optional[asyncio.Task] = None
        
        logger.info("🔗 AGI Integration System initialized")
    
    async def initialize_system(self) -> bool:
        """
        Initialize all AGI components in proper order
        
        Returns:
            True if initialization successful, False otherwise
        """
        try:
            logger.info("🚀 Starting AGI system initialization...")
            
            # Initialize components in dependency order
            initialization_steps = [
                ("execution_monitor", self._initialize_execution_monitor),
                ("attention_system", self._initialize_attention_system),
                ("planning_engine", self._initialize_planning_engine),
                ("control_center", self._initialize_control_center)
            ]
            
            for component_name, init_func in initialization_steps:
                logger.info(f"⚙️ Initializing {component_name}...")
                
                try:
                    success = await init_func()
                    if success:
                        self.component_status[component_name].initialized = True
                        logger.info(f"✅ {component_name} initialized successfully")
                    else:
                        logger.error(f"❌ {component_name} initialization failed")
                        return False
                        
                except Exception as e:
                    error_msg = f"Initialization error: {str(e)}"
                    self.component_status[component_name].last_error = error_msg
                    logger.error(f"❌ {component_name} initialization failed: {e}")
                    logger.debug(traceback.format_exc())
                    return False
            
            # Set up inter-component connections
            await self._setup_component_connections()
            
            # Start event processing
            await self._start_event_processing()
            
            # Start health monitoring
            await self._start_health_monitoring()
            
            self.system_initialized = True
            logger.info("🎉 AGI system initialization completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ AGI system initialization failed: {e}")
            logger.debug(traceback.format_exc())
            return False
    
    async def _initialize_execution_monitor(self) -> bool:
        """Initialize task execution monitor"""
        config = self.config.get("execution_monitor", {})
        self.execution_monitor = TaskExecutionMonitor(config)
        
        # Set up alert callback for integration
        self.execution_monitor.add_alert_callback(self._handle_execution_alert)
        
        # Start monitoring
        await self.execution_monitor.start_monitoring()
        
        return True
    
    async def _initialize_attention_system(self) -> bool:
        """Initialize attention allocation system"""
        config = self.config.get("attention_system", {})
        self.attention_system = AttentionAllocationSystem(config)
        
        return True
    
    async def _initialize_planning_engine(self) -> bool:
        """Initialize strategic planning engine"""
        config = self.config.get("planning_engine", {})
        self.planning_engine = StrategicPlanningEngine(config)
        
        return True
    
    async def _initialize_control_center(self) -> bool:
        """Initialize AGI control center"""
        config = self.config.get("control_center", {})
        
        # Inject other components as dependencies
        self.control_center = AGIControlCenter(
            config=config,
            attention_system=self.attention_system,
            planning_engine=self.planning_engine,
            execution_monitor=self.execution_monitor
        )
        
        return True
    
    async def _setup_component_connections(self) -> None:
        """Set up connections between components"""
        # Connect control center to other components
        if self.control_center and self.attention_system:
            # Control center will use attention system for resource allocation
            pass  # Already connected via dependency injection
        
        if self.control_center and self.planning_engine:
            # Control center will use planning engine for goal management
            pass  # Already connected via dependency injection
        
        if self.control_center and self.execution_monitor:
            # Control center will use execution monitor for task tracking
            pass  # Already connected via dependency injection
        
        logger.info("🔗 Component connections established")
    
    async def _start_event_processing(self) -> None:
        """Start inter-component event processing"""
        self.event_processor_task = asyncio.create_task(self._event_processing_loop())
        logger.info("📡 Event processing started")
    
    async def _start_health_monitoring(self) -> None:
        """Start system health monitoring"""
        self.health_monitor_task = asyncio.create_task(self._health_monitoring_loop())
        logger.info("🩺 Health monitoring started")
    
    async def start_system(self) -> bool:
        """
        Start autonomous AGI operation
        
        Returns:
            True if system started successfully, False otherwise
        """
        try:
            if not self.system_initialized:
                logger.error("❌ Cannot start system - not initialized")
                return False
            
            logger.info("🚀 Starting AGI autonomous operation...")
            
            # Activate all components
            for component_name in self.component_status:
                try:
                    await self._activate_component(component_name)
                except Exception as e:
                    logger.error(f"❌ Failed to activate {component_name}: {e}")
                    return False
            
            # Start control center autonomous operation
            if self.control_center:
                success = await self.control_center.start_autonomous_operation()
                if not success:
                    logger.error("❌ Failed to start control center autonomous operation")
                    return False
            
            self.system_active = True
            logger.info("🎯 AGI system is now active and operating autonomously")
            
            # Emit system started event
            await self._emit_event("system_started", {"timestamp": datetime.now().isoformat()})
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to start AGI system: {e}")
            logger.debug(traceback.format_exc())
            return False
    
    async def _activate_component(self, component_name: str) -> None:
        """Activate a specific component"""
        status = self.component_status[component_name]
        
        if not status.initialized:
            raise RuntimeError(f"Component {component_name} not initialized")
        
        # Component-specific activation logic
        if component_name == "execution_monitor" and self.execution_monitor:
            # Already started during initialization
            pass
        elif component_name == "attention_system" and self.attention_system:
            # Attention system is stateless, no activation needed
            pass
        elif component_name == "planning_engine" and self.planning_engine:
            # Planning engine is stateless, no activation needed  
            pass
        elif component_name == "control_center" and self.control_center:
            # Will be activated separately
            pass
        
        status.active = True
        status.last_updated = datetime.now()
        
        logger.info(f"✅ Component activated: {component_name}")
    
    async def stop_system(self) -> None:
        """Stop AGI system gracefully"""
        logger.info("🛑 Stopping AGI system...")
        
        try:
            # Stop control center
            if self.control_center and self.system_active:
                await self.control_center.stop_autonomous_operation()
            
            # Stop execution monitor
            if self.execution_monitor:
                await self.execution_monitor.stop_monitoring()
            
            # Stop health monitoring
            if self.health_monitor_task:
                self.health_monitor_task.cancel()
                try:
                    await self.health_monitor_task
                except asyncio.CancelledError:
                    pass
            
            # Stop event processing
            if self.event_processor_task:
                self.event_processor_task.cancel()
                try:
                    await self.event_processor_task
                except asyncio.CancelledError:
                    pass
            
            # Update component status
            for status in self.component_status.values():
                status.active = False
                status.last_updated = datetime.now()
            
            self.system_active = False
            logger.info("✅ AGI system stopped gracefully")
            
        except Exception as e:
            logger.error(f"❌ Error stopping AGI system: {e}")
            logger.debug(traceback.format_exc())
    
    async def _event_processing_loop(self) -> None:
        """Process inter-component events"""
        logger.info("🔄 Event processing loop started")
        
        while True:
            try:
                # Get event from queue (wait up to 1 second)
                event = await asyncio.wait_for(self.event_queue.get(), timeout=1.0)
                
                event_type = event.get("type")
                event_data = event.get("data", {})
                
                # Process event based on type
                await self._handle_system_event(event_type, event_data)
                
                # Mark event as processed
                self.event_queue.task_done()
                
            except asyncio.TimeoutError:
                # No events to process, continue loop
                continue
            except asyncio.CancelledError:
                logger.info("🏁 Event processing loop cancelled")
                break
            except Exception as e:
                logger.error(f"❌ Error processing event: {e}")
                await asyncio.sleep(1.0)  # Brief pause on error
    
    async def _handle_system_event(self, event_type: str, event_data: Dict[str, Any]) -> None:
        """Handle system-wide events"""
        try:
            # Call registered event handlers
            handlers = self.event_handlers.get(event_type, [])
            for handler in handlers:
                try:
                    await handler(event_data)
                except Exception as e:
                    logger.error(f"❌ Event handler error for {event_type}: {e}")
            
            # Built-in event handling
            if event_type == "component_error":
                await self._handle_component_error(event_data)
            elif event_type == "performance_degradation":
                await self._handle_performance_degradation(event_data)
            elif event_type == "resource_shortage":
                await self._handle_resource_shortage(event_data)
            
        except Exception as e:
            logger.error(f"❌ Error handling system event {event_type}: {e}")
    
    async def _handle_component_error(self, event_data: Dict[str, Any]) -> None:
        """Handle component error events"""
        component_name = event_data.get("component")
        error_message = event_data.get("error")
        
        if component_name in self.component_status:
            self.component_status[component_name].last_error = error_message
            self.component_status[component_name].health_score *= 0.8  # Reduce health
        
        logger.warning(f"🚨 Component error in {component_name}: {error_message}")
    
    async def _handle_performance_degradation(self, event_data: Dict[str, Any]) -> None:
        """Handle performance degradation events"""
        logger.warning("📉 Performance degradation detected")
        
        # Could trigger optimization or resource reallocation
        if self.attention_system and self.control_center:
            # Request resource optimization
            pass
    
    async def _handle_resource_shortage(self, event_data: Dict[str, Any]) -> None:
        """Handle resource shortage events"""
        resource_type = event_data.get("resource_type")
        logger.warning(f"⚠️ Resource shortage detected: {resource_type}")
        
        # Could trigger resource reallocation or task prioritization
    
    async def _handle_execution_alert(self, alert: Alert) -> None:
        """Handle alerts from execution monitor"""
        # Convert to system event
        await self._emit_event("execution_alert", {
            "alert_id": alert.id,
            "severity": alert.severity.value,
            "message": alert.message,
            "task_id": alert.task_id,
            "timestamp": alert.created_at.isoformat()
        })
    
    async def _health_monitoring_loop(self) -> None:
        """Monitor system health continuously"""
        logger.info("🔄 Health monitoring loop started")
        
        while True:
            try:
                # Check component health
                await self._check_component_health()
                
                # Update integration metrics
                await self._update_integration_metrics()
                
                # Check for system-level issues
                await self._check_system_health()
                
                # Wait for next check
                await asyncio.sleep(self.health_check_interval)
                
            except asyncio.CancelledError:
                logger.info("🏁 Health monitoring loop cancelled")
                break
            except Exception as e:
                logger.error(f"❌ Health monitoring error: {e}")
                await asyncio.sleep(5.0)  # Brief pause on error
    
    async def _check_component_health(self) -> None:
        """Check health of all components"""
        for component_name, status in self.component_status.items():
            try:
                health_score = await self._get_component_health_score(component_name)
                status.health_score = health_score
                status.last_updated = datetime.now()
                
                # Check for unhealthy components
                if health_score < 0.5:
                    await self._emit_event("component_unhealthy", {
                        "component": component_name,
                        "health_score": health_score,
                        "last_error": status.last_error
                    })
                
            except Exception as e:
                logger.error(f"❌ Error checking {component_name} health: {e}")
                status.last_error = str(e)
                status.health_score *= 0.9
    
    async def _get_component_health_score(self, component_name: str) -> float:
        """Get health score for a specific component"""
        if component_name == "execution_monitor" and self.execution_monitor:
            monitor_status = await self.execution_monitor.get_monitoring_status()
            return min(1.0, monitor_status["performance_metrics"]["success_rate"])
            
        elif component_name == "attention_system" and self.attention_system:
            attention_status = await self.attention_system.get_allocation_status()
            return attention_status["performance_metrics"]["allocation_efficiency"]
            
        elif component_name == "planning_engine" and self.planning_engine:
            planning_status = await self.planning_engine.get_planning_status()
            return planning_status["goal_completion_rate"]
            
        elif component_name == "control_center" and self.control_center:
            center_status = await self.control_center.get_system_status()
            return center_status["overall_health"]
        
        return 1.0  # Default healthy score
    
    async def _update_integration_metrics(self) -> None:
        """Update integration-level metrics"""
        # Component health average
        health_scores = [status.health_score for status in self.component_status.values()]
        self.integration_metrics["component_health"] = sum(health_scores) / len(health_scores)
        
        # Integration efficiency (how well components work together)
        active_components = sum(1 for status in self.component_status.values() if status.active)
        total_components = len(self.component_status)
        self.integration_metrics["integration_efficiency"] = active_components / total_components
        
        # Error count
        error_count = sum(1 for status in self.component_status.values() if status.last_error)
        self.integration_metrics["error_count"] = error_count
    
    async def _check_system_health(self) -> None:
        """Check overall system health"""
        overall_health = self.integration_metrics["component_health"]
        
        if overall_health < 0.6:
            await self._emit_event("system_health_degraded", {
                "health_score": overall_health,
                "timestamp": datetime.now().isoformat()
            })
    
    async def _emit_event(self, event_type: str, data: Dict[str, Any]) -> None:
        """Emit system event"""
        event = {
            "type": event_type,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.event_queue.put(event)
    
    def register_event_handler(self, event_type: str, handler: Callable) -> None:
        """Register handler for specific event type"""
        if event_type not in self.event_handlers:
            self.event_handlers[event_type] = []
        
        self.event_handlers[event_type].append(handler)
        logger.info(f"📝 Event handler registered for: {event_type}")
    
    async def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        component_statuses = {}
        for name, status in self.component_status.items():
            component_statuses[name] = {
                "initialized": status.initialized,
                "active": status.active,
                "health_score": status.health_score,
                "last_error": status.last_error,
                "last_updated": status.last_updated.isoformat()
            }
        
        return {
            "system_initialized": self.system_initialized,
            "system_active": self.system_active,
            "component_status": component_statuses,
            "integration_metrics": self.integration_metrics.copy(),
            "event_queue_size": self.event_queue.qsize(),
            "uptime": self.integration_metrics["uptime"]
        }
    
    async def execute_high_level_command(self, command: str, 
                                       parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute high-level command through integrated system
        
        Args:
            command: High-level command to execute
            parameters: Optional command parameters
            
        Returns:
            Command execution result
        """
        try:
            if not self.control_center:
                return {"success": False, "error": "Control center not initialized"}
            
            # Delegate to control center
            result = await self.control_center.execute_high_level_command(command, parameters)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to execute command '{command}': {e}")
            return {"success": False, "error": str(e)}


# Convenience function for external integration
async def create_agi_system(config: Optional[Dict[str, Any]] = None) -> AGIIntegration:
    """
    Create and initialize complete AGI system
    
    Args:
        config: System configuration
        
    Returns:
        Initialized AGI integration system
    """
    agi_system = AGIIntegration(config)
    
    success = await agi_system.initialize_system()
    if not success:
        raise RuntimeError("Failed to initialize AGI system")
    
    return agi_system