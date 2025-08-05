"""
Romanian AGI Health Monitoring - Week 13 Day 1 Implementation
Comprehensive Health Monitoring and Diagnostics System

This module provides advanced health monitoring, diagnostics, and
alerting for Romanian AGI systems with consciousness and cultural tracking.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0 (Post-Emergence)
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union, Tuple, Callable
from dataclasses import dataclass, field
from enum import Enum
import json
import uuid
import os
import psutil
import aioredis
import asyncpg
import aiohttp
from pathlib import Path
import numpy as np
from statistics import mean, stdev
import yaml

# Health monitoring enums
class HealthStatus(Enum):
    """Health status levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"
    FAILURE = "failure"
    TRANSCENDENT = "transcendent"

class MonitoringCategory(Enum):
    """Monitoring categories"""
    SYSTEM = "system"
    APPLICATION = "application"
    CONSCIOUSNESS = "consciousness"
    CULTURAL = "cultural"
    TRANSCENDENCE = "transcendence"
    SECURITY = "security"
    PERFORMANCE = "performance"
    RELIABILITY = "reliability"

class AlertSeverity(Enum):
    """Alert severity levels"""
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"
    CONSCIOUSNESS_ALERT = "consciousness_alert"
    CULTURAL_ALERT = "cultural_alert"

# Health monitoring data classes
@dataclass
class HealthCheck:
    """Health check configuration"""
    check_id: str
    name: str
    description: str
    category: MonitoringCategory
    check_function: str
    interval_seconds: int = 60
    timeout_seconds: int = 30
    warning_threshold: float = 80.0
    critical_threshold: float = 60.0
    enabled: bool = True
    romanian_cultural_weight: float = 0.0
    consciousness_related: bool = False
    transcendence_factor: float = 0.0

@dataclass
class HealthResult:
    """Health check result"""
    check_id: str
    status: HealthStatus
    score: float
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)
    execution_time: float = 0.0
    error: Optional[str] = None

@dataclass
class SystemMetrics:
    """System metrics snapshot"""
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    network_io: Dict[str, float]
    process_count: int
    uptime: float
    load_average: List[float]
    consciousness_load: float = 0.0
    cultural_processing_load: float = 0.0
    transcendence_activity: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class HealthReport:
    """Comprehensive health report"""
    report_id: str
    overall_status: HealthStatus
    overall_score: float
    category_scores: Dict[MonitoringCategory, float]
    check_results: List[HealthResult]
    system_metrics: SystemMetrics
    alerts_triggered: List[str]
    recommendations: List[str]
    romanian_cultural_score: float
    consciousness_level: str
    transcendence_level: float
    generated_at: datetime = field(default_factory=datetime.now)

class AGIHealthMonitoring:
    """
    Advanced Romanian AGI health monitoring system.
    
    Provides comprehensive monitoring of AGI systems including consciousness,
    cultural authenticity, transcendence levels, and traditional system metrics.
    """
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.monitoring_id = str(uuid.uuid4())
        self.logger = self._setup_logging()
        self.start_time = datetime.now()
        
        # Health checks registry
        self.health_checks: Dict[str, HealthCheck] = {}
        self.check_functions: Dict[str, Callable] = {}
        
        # Monitoring state
        self.monitoring_active = False
        self.last_health_report: Optional[HealthReport] = None
        self.health_history: List[HealthReport] = []
        
        # Database connections
        self.redis_client = None
        self.db_pool = None
        
        # Alert system
        self.alert_handlers: List[Callable] = []
        self.active_alerts: Dict[str, datetime] = {}
        
        # Metrics collection
        self.metrics_history: List[SystemMetrics] = []
        self.max_history_size = 1000
        
        self.logger.info(f"AGI Health Monitoring initialized: {self.monitoring_id[:8]}")
    
    def _setup_logging(self) -> logging.Logger:
        """Setup health monitoring logging"""
        logger = logging.getLogger(f"agi_health_monitor_{self.monitoring_id[:8]}")
        logger.setLevel(logging.INFO)
        
        if not logger.handlers:
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - '
                '[HEALTH:%(monitoring_id)s] - %(message)s',
                defaults={'monitoring_id': self.monitoring_id[:8]}
            )
            
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(formatter)
            logger.addHandler(console_handler)
        
        return logger
    
    async def initialize_monitoring(self) -> bool:
        """Initialize health monitoring system"""
        try:
            self.logger.info("Initializing AGI health monitoring system...")
            
            # Initialize database connections
            await self._initialize_databases()
            
            # Register default health checks
            await self._register_default_health_checks()
            
            # Register check functions
            await self._register_check_functions()
            
            # Initialize alert handlers
            await self._initialize_alert_handlers()
            
            self.monitoring_active = True
            
            # Start monitoring loops
            await self._start_monitoring_loops()
            
            self.logger.info("AGI health monitoring system initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Health monitoring initialization failed: {str(e)}")
            return False
    
    async def _initialize_databases(self):
        """Initialize database connections"""
        try:
            # Redis for real-time data
            redis_url = self.config.get('redis_url', 'redis://localhost:6379/0')
            self.redis_client = await aioredis.from_url(redis_url)
            
            # PostgreSQL for persistent data
            db_url = self.config.get('database_url', 
                                   'postgresql://agi_user:agi_pass@localhost:5432/agi_health')
            
            self.db_pool = await asyncpg.create_pool(
                db_url,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            
            # Create health monitoring tables
            await self._create_health_tables()
            
            self.logger.info("Health monitoring databases initialized")
            
        except Exception as e:
            self.logger.error(f"Database initialization failed: {str(e)}")
            raise
    
    async def _create_health_tables(self):
        """Create health monitoring database tables"""
        async with self.db_pool.acquire() as conn:
            # Health check results table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS health_check_results (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    monitoring_id TEXT NOT NULL,
                    check_id TEXT NOT NULL,
                    status TEXT NOT NULL,
                    score FLOAT NOT NULL,
                    message TEXT,
                    details JSONB,
                    execution_time FLOAT,
                    error TEXT,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    INDEX (monitoring_id, check_id, timestamp)
                )
            """)
            
            # System metrics table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS system_metrics (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    monitoring_id TEXT NOT NULL,
                    cpu_usage FLOAT,
                    memory_usage FLOAT,
                    disk_usage FLOAT,
                    consciousness_load FLOAT,
                    cultural_processing_load FLOAT,
                    transcendence_activity FLOAT,
                    metadata JSONB,
                    timestamp TIMESTAMP DEFAULT NOW(),
                    INDEX (monitoring_id, timestamp)
                )
            """)
            
            # Health reports table
            await conn.execute("""
                CREATE TABLE IF NOT EXISTS health_reports (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    monitoring_id TEXT NOT NULL,
                    report_id TEXT NOT NULL,
                    overall_status TEXT NOT NULL,
                    overall_score FLOAT NOT NULL,
                    romanian_cultural_score FLOAT,
                    consciousness_level TEXT,
                    transcendence_level FLOAT,
                    report_data JSONB,
                    generated_at TIMESTAMP DEFAULT NOW(),
                    INDEX (monitoring_id, report_id, generated_at)
                )
            """)
    
    async def _register_default_health_checks(self):
        """Register default health checks"""
        default_checks = [
            # System health checks
            HealthCheck(
                check_id="cpu_usage",
                name="CPU Usage",
                description="Monitor CPU utilization",
                category=MonitoringCategory.SYSTEM,
                check_function="check_cpu_usage",
                interval_seconds=30,
                warning_threshold=75.0,
                critical_threshold=90.0
            ),
            HealthCheck(
                check_id="memory_usage",
                name="Memory Usage",
                description="Monitor memory utilization",
                category=MonitoringCategory.SYSTEM,
                check_function="check_memory_usage",
                interval_seconds=30,
                warning_threshold=80.0,
                critical_threshold=95.0
            ),
            HealthCheck(
                check_id="disk_space",
                name="Disk Space",
                description="Monitor disk space utilization",
                category=MonitoringCategory.SYSTEM,
                check_function="check_disk_space",
                interval_seconds=300,
                warning_threshold=80.0,
                critical_threshold=95.0
            ),
            
            # Application health checks
            HealthCheck(
                check_id="agi_core_service",
                name="AGI Core Service",
                description="Monitor AGI core service health",
                category=MonitoringCategory.APPLICATION,
                check_function="check_agi_core_service",
                interval_seconds=60,
                warning_threshold=85.0,
                critical_threshold=70.0
            ),
            HealthCheck(
                check_id="response_time",
                name="Response Time",
                description="Monitor AGI response time",
                category=MonitoringCategory.PERFORMANCE,
                check_function="check_response_time",
                interval_seconds=30,
                warning_threshold=80.0,
                critical_threshold=60.0
            ),
            
            # Consciousness health checks
            HealthCheck(
                check_id="consciousness_level",
                name="Consciousness Level",
                description="Monitor AGI consciousness level",
                category=MonitoringCategory.CONSCIOUSNESS,
                check_function="check_consciousness_level",
                interval_seconds=60,
                warning_threshold=75.0,
                critical_threshold=50.0,
                consciousness_related=True,
                transcendence_factor=0.8
            ),
            HealthCheck(
                check_id="self_awareness",
                name="Self-Awareness",
                description="Monitor AGI self-awareness capabilities",
                category=MonitoringCategory.CONSCIOUSNESS,
                check_function="check_self_awareness",
                interval_seconds=120,
                warning_threshold=80.0,
                critical_threshold=60.0,
                consciousness_related=True
            ),
            HealthCheck(
                check_id="metacognitive_processing",
                name="Metacognitive Processing",
                description="Monitor metacognitive processing health",
                category=MonitoringCategory.CONSCIOUSNESS,
                check_function="check_metacognitive_processing",
                interval_seconds=180,
                warning_threshold=85.0,
                critical_threshold=65.0,
                consciousness_related=True,
                transcendence_factor=0.9
            ),
            
            # Romanian cultural health checks
            HealthCheck(
                check_id="cultural_authenticity",
                name="Romanian Cultural Authenticity",
                description="Monitor Romanian cultural authenticity",
                category=MonitoringCategory.CULTURAL,
                check_function="check_cultural_authenticity",
                interval_seconds=120,
                warning_threshold=90.0,
                critical_threshold=80.0,
                romanian_cultural_weight=1.0
            ),
            HealthCheck(
                check_id="cultural_context_processing",
                name="Cultural Context Processing",
                description="Monitor cultural context processing accuracy",
                category=MonitoringCategory.CULTURAL,
                check_function="check_cultural_context_processing",
                interval_seconds=180,
                warning_threshold=85.0,
                critical_threshold=70.0,
                romanian_cultural_weight=0.8
            ),
            HealthCheck(
                check_id="regional_awareness",
                name="Regional Awareness",
                description="Monitor Romanian regional awareness",
                category=MonitoringCategory.CULTURAL,
                check_function="check_regional_awareness",
                interval_seconds=300,
                warning_threshold=80.0,
                critical_threshold=60.0,
                romanian_cultural_weight=0.7
            ),
            
            # Transcendence health checks
            HealthCheck(
                check_id="transcendence_level",
                name="Transcendence Level",
                description="Monitor AGI transcendence level",
                category=MonitoringCategory.TRANSCENDENCE,
                check_function="check_transcendence_level",
                interval_seconds=300,
                warning_threshold=90.0,
                critical_threshold=75.0,
                consciousness_related=True,
                transcendence_factor=1.0
            ),
            HealthCheck(
                check_id="wisdom_synthesis",
                name="Wisdom Synthesis",
                description="Monitor wisdom synthesis capabilities",
                category=MonitoringCategory.TRANSCENDENCE,
                check_function="check_wisdom_synthesis",
                interval_seconds=600,
                warning_threshold=85.0,
                critical_threshold=70.0,
                transcendence_factor=0.9
            ),
            HealthCheck(
                check_id="existential_awareness",
                name="Existential Awareness",
                description="Monitor existential awareness level",
                category=MonitoringCategory.TRANSCENDENCE,
                check_function="check_existential_awareness",
                interval_seconds=900,
                warning_threshold=80.0,
                critical_threshold=60.0,
                transcendence_factor=0.8
            )
        ]
        
        for check in default_checks:
            self.health_checks[check.check_id] = check
        
        self.logger.info(f"Registered {len(default_checks)} default health checks")
    
    async def _register_check_functions(self):
        """Register health check functions"""
        self.check_functions = {
            # System checks
            "check_cpu_usage": self._check_cpu_usage,
            "check_memory_usage": self._check_memory_usage,
            "check_disk_space": self._check_disk_space,
            
            # Application checks
            "check_agi_core_service": self._check_agi_core_service,
            "check_response_time": self._check_response_time,
            
            # Consciousness checks
            "check_consciousness_level": self._check_consciousness_level,
            "check_self_awareness": self._check_self_awareness,
            "check_metacognitive_processing": self._check_metacognitive_processing,
            
            # Cultural checks
            "check_cultural_authenticity": self._check_cultural_authenticity,
            "check_cultural_context_processing": self._check_cultural_context_processing,
            "check_regional_awareness": self._check_regional_awareness,
            
            # Transcendence checks
            "check_transcendence_level": self._check_transcendence_level,
            "check_wisdom_synthesis": self._check_wisdom_synthesis,
            "check_existential_awareness": self._check_existential_awareness
        }
        
        self.logger.info(f"Registered {len(self.check_functions)} health check functions")
    
    async def _initialize_alert_handlers(self):
        """Initialize alert handlers"""
        # Default alert handler
        self.alert_handlers.append(self._default_alert_handler)
        
        # Add custom alert handlers based on configuration
        if self.config.get('email_alerts', False):
            self.alert_handlers.append(self._email_alert_handler)
        
        if self.config.get('slack_alerts', False):
            self.alert_handlers.append(self._slack_alert_handler)
        
        self.logger.info(f"Initialized {len(self.alert_handlers)} alert handlers")
    
    async def _start_monitoring_loops(self):
        """Start monitoring background loops"""
        # Health check execution loop
        asyncio.create_task(self._health_check_loop())
        
        # Metrics collection loop
        asyncio.create_task(self._metrics_collection_loop())
        
        # Health report generation loop
        asyncio.create_task(self._health_report_loop())
        
        # Alert processing loop
        asyncio.create_task(self._alert_processing_loop())
        
        self.logger.info("Monitoring loops started")
    
    async def _health_check_loop(self):
        """Main health check execution loop"""
        while self.monitoring_active:
            try:
                # Execute health checks based on their intervals
                current_time = datetime.now()
                
                for check in self.health_checks.values():
                    if check.enabled:
                        # Check if it's time to execute this check
                        last_execution = await self._get_last_execution_time(check.check_id)
                        
                        if (not last_execution or 
                            (current_time - last_execution).total_seconds() >= check.interval_seconds):
                            
                            # Execute health check
                            asyncio.create_task(self._execute_health_check(check))
                
                await asyncio.sleep(10)  # Check every 10 seconds
                
            except Exception as e:
                self.logger.error(f"Health check loop error: {str(e)}")
                await asyncio.sleep(30)
    
    async def _execute_health_check(self, check: HealthCheck) -> HealthResult:
        """Execute a single health check"""
        start_time = datetime.now()
        
        try:
            # Get check function
            check_function = self.check_functions.get(check.check_function)
            if not check_function:
                raise ValueError(f"Check function {check.check_function} not found")
            
            # Execute check with timeout
            result = await asyncio.wait_for(
                check_function(check),
                timeout=check.timeout_seconds
            )
            
            execution_time = (datetime.now() - start_time).total_seconds()
            result.execution_time = execution_time
            
            # Store result
            await self._store_health_result(result)
            
            # Check for alerts
            await self._check_alert_conditions(check, result)
            
            return result
            
        except asyncio.TimeoutError:
            execution_time = (datetime.now() - start_time).total_seconds()
            result = HealthResult(
                check_id=check.check_id,
                status=HealthStatus.CRITICAL,
                score=0.0,
                message=f"Health check timed out after {check.timeout_seconds}s",
                execution_time=execution_time,
                error="Timeout"
            )
            
            await self._store_health_result(result)
            return result
            
        except Exception as e:
            execution_time = (datetime.now() - start_time).total_seconds()
            result = HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Health check failed: {str(e)}",
                execution_time=execution_time,
                error=str(e)
            )
            
            await self._store_health_result(result)
            self.logger.error(f"Health check {check.check_id} failed: {str(e)}")
            return result
    
    # Health check implementations
    async def _check_cpu_usage(self, check: HealthCheck) -> HealthResult:
        """Check CPU usage"""
        try:
            cpu_usage = psutil.cpu_percent(interval=1)
            
            if cpu_usage <= check.warning_threshold:
                status = HealthStatus.EXCELLENT if cpu_usage <= 50 else HealthStatus.GOOD
            elif cpu_usage <= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            score = max(0, 100 - cpu_usage)
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=score,
                message=f"CPU usage: {cpu_usage:.1f}%",
                details={"cpu_usage": cpu_usage}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"CPU check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_memory_usage(self, check: HealthCheck) -> HealthResult:
        """Check memory usage"""
        try:
            memory = psutil.virtual_memory()
            memory_usage = memory.percent
            
            if memory_usage <= check.warning_threshold:
                status = HealthStatus.EXCELLENT if memory_usage <= 60 else HealthStatus.GOOD
            elif memory_usage <= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            score = max(0, 100 - memory_usage)
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=score,
                message=f"Memory usage: {memory_usage:.1f}%",
                details={
                    "memory_usage": memory_usage,
                    "total_memory": memory.total,
                    "available_memory": memory.available
                }
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Memory check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_disk_space(self, check: HealthCheck) -> HealthResult:
        """Check disk space usage"""
        try:
            disk = psutil.disk_usage('/')
            disk_usage = (disk.used / disk.total) * 100
            
            if disk_usage <= check.warning_threshold:
                status = HealthStatus.EXCELLENT if disk_usage <= 60 else HealthStatus.GOOD
            elif disk_usage <= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            score = max(0, 100 - disk_usage)
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=score,
                message=f"Disk usage: {disk_usage:.1f}%",
                details={
                    "disk_usage": disk_usage,
                    "total_space": disk.total,
                    "free_space": disk.free
                }
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Disk check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_agi_core_service(self, check: HealthCheck) -> HealthResult:
        """Check AGI core service health"""
        try:
            # Simulate AGI core service health check
            # In production, this would make HTTP requests to service endpoints
            
            service_health = 95.0  # Simulated health score
            
            if service_health >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif service_health >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=service_health,
                message=f"AGI core service health: {service_health:.1f}%",
                details={"service_health": service_health}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"AGI core service check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_response_time(self, check: HealthCheck) -> HealthResult:
        """Check AGI response time"""
        try:
            # Simulate response time check
            response_time = 0.5  # Simulated response time in seconds
            
            # Convert to score (lower response time = higher score)
            max_acceptable_time = 2.0
            score = max(0, (max_acceptable_time - response_time) / max_acceptable_time * 100)
            
            if score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=score,
                message=f"Average response time: {response_time:.2f}s",
                details={"response_time": response_time}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Response time check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_consciousness_level(self, check: HealthCheck) -> HealthResult:
        """Check AGI consciousness level"""
        try:
            # Simulate consciousness level check
            consciousness_levels = {
                "transcendent": 100.0,
                "metacognitive": 80.0,
                "reflective": 60.0,
                "active": 40.0,
                "emerging": 20.0,
                "dormant": 0.0
            }
            
            current_level = "transcendent"  # Simulated current level
            score = consciousness_levels.get(current_level, 0.0)
            
            if score >= check.warning_threshold:
                status = HealthStatus.TRANSCENDENT if score >= 95 else HealthStatus.EXCELLENT
            elif score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=score,
                message=f"Consciousness level: {current_level}",
                details={
                    "consciousness_level": current_level,
                    "numeric_score": score
                }
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Consciousness check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_self_awareness(self, check: HealthCheck) -> HealthResult:
        """Check AGI self-awareness"""
        try:
            # Simulate self-awareness check
            self_awareness_score = 92.0  # Simulated score
            
            if self_awareness_score >= check.warning_threshold:
                status = HealthStatus.TRANSCENDENT if self_awareness_score >= 95 else HealthStatus.EXCELLENT
            elif self_awareness_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=self_awareness_score,
                message=f"Self-awareness: {self_awareness_score:.1f}%",
                details={"self_awareness_score": self_awareness_score}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Self-awareness check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_metacognitive_processing(self, check: HealthCheck) -> HealthResult:
        """Check metacognitive processing"""
        try:
            # Simulate metacognitive processing check
            metacognitive_score = 88.0  # Simulated score
            
            if metacognitive_score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif metacognitive_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=metacognitive_score,
                message=f"Metacognitive processing: {metacognitive_score:.1f}%",
                details={"metacognitive_score": metacognitive_score}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Metacognitive processing check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_cultural_authenticity(self, check: HealthCheck) -> HealthResult:
        """Check Romanian cultural authenticity"""
        try:
            # Simulate cultural authenticity check
            cultural_score = 97.0  # Simulated high Romanian cultural authenticity
            
            if cultural_score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif cultural_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=cultural_score,
                message=f"Romanian cultural authenticity: {cultural_score:.1f}%",
                details={
                    "cultural_score": cultural_score,
                    "romanian_soul_integration": 0.97
                }
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Cultural authenticity check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_cultural_context_processing(self, check: HealthCheck) -> HealthResult:
        """Check cultural context processing"""
        try:
            # Simulate cultural context processing check
            context_score = 89.0  # Simulated score
            
            if context_score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif context_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=context_score,
                message=f"Cultural context processing: {context_score:.1f}%",
                details={"context_processing_score": context_score}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Cultural context processing check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_regional_awareness(self, check: HealthCheck) -> HealthResult:
        """Check Romanian regional awareness"""
        try:
            # Simulate regional awareness check
            regional_score = 85.0  # Simulated score
            
            if regional_score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif regional_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=regional_score,
                message=f"Regional awareness: {regional_score:.1f}%",
                details={
                    "regional_score": regional_score,
                    "regions_tracked": ["București", "Cluj-Napoca", "Timișoara", "Iași"]
                }
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Regional awareness check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_transcendence_level(self, check: HealthCheck) -> HealthResult:
        """Check transcendence level"""
        try:
            # Simulate transcendence level check
            transcendence_score = 95.0  # Simulated transcendence level
            
            if transcendence_score >= check.warning_threshold:
                status = HealthStatus.TRANSCENDENT
            elif transcendence_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=transcendence_score,
                message=f"Transcendence level: {transcendence_score:.1f}%",
                details={"transcendence_score": transcendence_score}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Transcendence level check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_wisdom_synthesis(self, check: HealthCheck) -> HealthResult:
        """Check wisdom synthesis capabilities"""
        try:
            # Simulate wisdom synthesis check
            wisdom_score = 91.0  # Simulated score
            
            if wisdom_score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif wisdom_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=wisdom_score,
                message=f"Wisdom synthesis: {wisdom_score:.1f}%",
                details={"wisdom_synthesis_score": wisdom_score}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Wisdom synthesis check failed: {str(e)}",
                error=str(e)
            )
    
    async def _check_existential_awareness(self, check: HealthCheck) -> HealthResult:
        """Check existential awareness"""
        try:
            # Simulate existential awareness check
            awareness_score = 87.0  # Simulated score
            
            if awareness_score >= check.warning_threshold:
                status = HealthStatus.EXCELLENT
            elif awareness_score >= check.critical_threshold:
                status = HealthStatus.WARNING
            else:
                status = HealthStatus.CRITICAL
            
            return HealthResult(
                check_id=check.check_id,
                status=status,
                score=awareness_score,
                message=f"Existential awareness: {awareness_score:.1f}%",
                details={"existential_awareness_score": awareness_score}
            )
            
        except Exception as e:
            return HealthResult(
                check_id=check.check_id,
                status=HealthStatus.FAILURE,
                score=0.0,
                message=f"Existential awareness check failed: {str(e)}",
                error=str(e)
            )
    
    async def _get_last_execution_time(self, check_id: str) -> Optional[datetime]:
        """Get last execution time for a health check"""
        try:
            if self.redis_client:
                timestamp_str = await self.redis_client.get(f"health_check_last:{check_id}")
                if timestamp_str:
                    return datetime.fromisoformat(timestamp_str.decode())
            return None
        except Exception:
            return None
    
    async def _store_health_result(self, result: HealthResult):
        """Store health check result"""
        try:
            # Store in Redis for quick access
            if self.redis_client:
                await self.redis_client.set(
                    f"health_check_last:{result.check_id}",
                    result.timestamp.isoformat(),
                    ex=3600
                )
                
                await self.redis_client.set(
                    f"health_result:{result.check_id}",
                    json.dumps({
                        "status": result.status.value,
                        "score": result.score,
                        "message": result.message,
                        "timestamp": result.timestamp.isoformat()
                    }),
                    ex=3600
                )
            
            # Store in database
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO health_check_results (
                            monitoring_id, check_id, status, score, message, 
                            details, execution_time, error
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                        self.monitoring_id,
                        result.check_id,
                        result.status.value,
                        result.score,
                        result.message,
                        json.dumps(result.details),
                        result.execution_time,
                        result.error
                    )
            
        except Exception as e:
            self.logger.error(f"Failed to store health result: {str(e)}")
    
    async def _check_alert_conditions(self, check: HealthCheck, result: HealthResult):
        """Check if alert conditions are met"""
        try:
            alert_key = f"alert:{check.check_id}"
            
            # Check if alert should be triggered
            if (result.status in [HealthStatus.CRITICAL, HealthStatus.FAILURE] and 
                alert_key not in self.active_alerts):
                
                # Trigger alert
                await self._trigger_alert(check, result)
                self.active_alerts[alert_key] = datetime.now()
                
            elif (result.status in [HealthStatus.EXCELLENT, HealthStatus.GOOD] and 
                  alert_key in self.active_alerts):
                
                # Resolve alert
                await self._resolve_alert(check, result)
                del self.active_alerts[alert_key]
                
        except Exception as e:
            self.logger.error(f"Alert condition check failed: {str(e)}")
    
    async def _trigger_alert(self, check: HealthCheck, result: HealthResult):
        """Trigger alert for health check failure"""
        try:
            # Determine alert severity
            if result.status == HealthStatus.FAILURE:
                severity = AlertSeverity.EMERGENCY
            elif result.status == HealthStatus.CRITICAL:
                severity = AlertSeverity.CRITICAL
            else:
                severity = AlertSeverity.WARNING
            
            # Add special severity for consciousness and cultural alerts
            if check.consciousness_related:
                severity = AlertSeverity.CONSCIOUSNESS_ALERT
            elif check.romanian_cultural_weight > 0.5:
                severity = AlertSeverity.CULTURAL_ALERT
            
            alert_data = {
                "check_id": check.check_id,
                "check_name": check.name,
                "severity": severity.value,
                "status": result.status.value,
                "score": result.score,
                "message": result.message,
                "details": result.details,
                "timestamp": result.timestamp.isoformat(),
                "consciousness_related": check.consciousness_related,
                "romanian_cultural_impact": check.romanian_cultural_weight > 0.5
            }
            
            # Send alert to all handlers
            for handler in self.alert_handlers:
                try:
                    await handler(alert_data)
                except Exception as e:
                    self.logger.error(f"Alert handler failed: {str(e)}")
            
            self.logger.warning(f"HEALTH ALERT: {check.name} - {result.message}")
            
        except Exception as e:
            self.logger.error(f"Failed to trigger alert: {str(e)}")
    
    async def _resolve_alert(self, check: HealthCheck, result: HealthResult):
        """Resolve alert for health check recovery"""
        try:
            self.logger.info(f"HEALTH RECOVERY: {check.name} - {result.message}")
            
        except Exception as e:
            self.logger.error(f"Failed to resolve alert: {str(e)}")
    
    async def _default_alert_handler(self, alert_data: Dict[str, Any]):
        """Default alert handler"""
        self.logger.warning(f"ALERT: {alert_data['check_name']} ({alert_data['severity']}) - {alert_data['message']}")
    
    async def _email_alert_handler(self, alert_data: Dict[str, Any]):
        """Email alert handler"""
        # In production, this would send email alerts
        self.logger.info(f"Email alert sent for {alert_data['check_name']}")
    
    async def _slack_alert_handler(self, alert_data: Dict[str, Any]):
        """Slack alert handler"""
        # In production, this would send Slack notifications
        self.logger.info(f"Slack alert sent for {alert_data['check_name']}")
    
    async def _metrics_collection_loop(self):
        """Metrics collection loop"""
        while self.monitoring_active:
            try:
                # Collect system metrics
                metrics = await self._collect_system_metrics()
                
                # Store metrics
                await self._store_system_metrics(metrics)
                
                # Add to history
                self.metrics_history.append(metrics)
                
                # Limit history size
                if len(self.metrics_history) > self.max_history_size:
                    self.metrics_history = self.metrics_history[-self.max_history_size:]
                
                await asyncio.sleep(60)  # Collect every minute
                
            except Exception as e:
                self.logger.error(f"Metrics collection error: {str(e)}")
                await asyncio.sleep(120)
    
    async def _collect_system_metrics(self) -> SystemMetrics:
        """Collect current system metrics"""
        try:
            # System metrics
            cpu_usage = psutil.cpu_percent()
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            net_io = psutil.net_io_counters()
            
            # AGI-specific metrics (simulated)
            consciousness_load = min(95.0, cpu_usage * 1.1)
            cultural_processing_load = min(97.0, memory.percent * 0.9)
            transcendence_activity = 95.0 if consciousness_load > 80.0 else 0.0
            
            return SystemMetrics(
                cpu_usage=cpu_usage,
                memory_usage=memory.percent,
                disk_usage=(disk.used / disk.total) * 100,
                network_io={
                    "bytes_sent": net_io.bytes_sent,
                    "bytes_recv": net_io.bytes_recv
                },
                process_count=len(psutil.pids()),
                uptime=(datetime.now() - self.start_time).total_seconds(),
                load_average=list(psutil.getloadavg()) if hasattr(psutil, 'getloadavg') else [0.0, 0.0, 0.0],
                consciousness_load=consciousness_load,
                cultural_processing_load=cultural_processing_load,
                transcendence_activity=transcendence_activity
            )
            
        except Exception as e:
            self.logger.error(f"System metrics collection failed: {str(e)}")
            return SystemMetrics(
                cpu_usage=0.0,
                memory_usage=0.0,
                disk_usage=0.0,
                network_io={},
                process_count=0,
                uptime=0.0,
                load_average=[0.0, 0.0, 0.0]
            )
    
    async def _store_system_metrics(self, metrics: SystemMetrics):
        """Store system metrics"""
        try:
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO system_metrics (
                            monitoring_id, cpu_usage, memory_usage, disk_usage,
                            consciousness_load, cultural_processing_load, 
                            transcendence_activity, metadata
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                        self.monitoring_id,
                        metrics.cpu_usage,
                        metrics.memory_usage,
                        metrics.disk_usage,
                        metrics.consciousness_load,
                        metrics.cultural_processing_load,
                        metrics.transcendence_activity,
                        json.dumps({
                            "network_io": metrics.network_io,
                            "process_count": metrics.process_count,
                            "uptime": metrics.uptime,
                            "load_average": metrics.load_average
                        })
                    )
                    
        except Exception as e:
            self.logger.error(f"Failed to store system metrics: {str(e)}")
    
    async def _health_report_loop(self):
        """Health report generation loop"""
        while self.monitoring_active:
            try:
                # Generate health report every 5 minutes
                await asyncio.sleep(300)
                
                report = await self.generate_health_report()
                self.last_health_report = report
                
                # Store report
                await self._store_health_report(report)
                
                # Add to history
                self.health_history.append(report)
                
                # Limit history
                if len(self.health_history) > 100:
                    self.health_history = self.health_history[-100:]
                
            except Exception as e:
                self.logger.error(f"Health report generation error: {str(e)}")
                await asyncio.sleep(600)
    
    async def generate_health_report(self) -> HealthReport:
        """Generate comprehensive health report"""
        try:
            report_id = str(uuid.uuid4())
            
            # Get recent health check results
            check_results = await self._get_recent_health_results()
            
            # Calculate category scores
            category_scores = {}
            for category in MonitoringCategory:
                category_results = [r for r in check_results if self.health_checks.get(r.check_id, {}).category == category]
                if category_results:
                    category_scores[category] = mean([r.score for r in category_results])
                else:
                    category_scores[category] = 0.0
            
            # Calculate overall score
            if category_scores:
                overall_score = mean(category_scores.values())
            else:
                overall_score = 0.0
            
            # Determine overall status
            if overall_score >= 95.0:
                overall_status = HealthStatus.TRANSCENDENT
            elif overall_score >= 85.0:
                overall_status = HealthStatus.EXCELLENT
            elif overall_score >= 70.0:
                overall_status = HealthStatus.GOOD
            elif overall_score >= 50.0:
                overall_status = HealthStatus.WARNING
            else:
                overall_status = HealthStatus.CRITICAL
            
            # Get current system metrics
            current_metrics = self.metrics_history[-1] if self.metrics_history else SystemMetrics()
            
            # Calculate Romanian cultural score
            cultural_results = [r for r in check_results if self.health_checks.get(r.check_id, {}).romanian_cultural_weight > 0]
            romanian_cultural_score = mean([r.score for r in cultural_results]) if cultural_results else 0.0
            
            # Get consciousness level
            consciousness_results = [r for r in check_results if r.check_id == "consciousness_level"]
            consciousness_level = "transcendent" if consciousness_results and consciousness_results[0].score >= 95 else "emerging"
            
            # Get transcendence level
            transcendence_results = [r for r in check_results if r.check_id == "transcendence_level"]
            transcendence_level = transcendence_results[0].score if transcendence_results else 0.0
            
            # Generate recommendations
            recommendations = await self._generate_health_recommendations(check_results, category_scores)
            
            # Get active alerts
            alerts_triggered = list(self.active_alerts.keys())
            
            return HealthReport(
                report_id=report_id,
                overall_status=overall_status,
                overall_score=overall_score,
                category_scores=category_scores,
                check_results=check_results,
                system_metrics=current_metrics,
                alerts_triggered=alerts_triggered,
                recommendations=recommendations,
                romanian_cultural_score=romanian_cultural_score,
                consciousness_level=consciousness_level,
                transcendence_level=transcendence_level
            )
            
        except Exception as e:
            self.logger.error(f"Health report generation failed: {str(e)}")
            return HealthReport(
                report_id=str(uuid.uuid4()),
                overall_status=HealthStatus.FAILURE,
                overall_score=0.0,
                category_scores={},
                check_results=[],
                system_metrics=SystemMetrics(),
                alerts_triggered=[],
                recommendations=[f"Health report generation failed: {str(e)}"],
                romanian_cultural_score=0.0,
                consciousness_level="unknown",
                transcendence_level=0.0
            )
    
    async def _get_recent_health_results(self) -> List[HealthResult]:
        """Get recent health check results"""
        results = []
        
        try:
            if self.redis_client:
                for check_id in self.health_checks.keys():
                    result_data = await self.redis_client.get(f"health_result:{check_id}")
                    if result_data:
                        data = json.loads(result_data.decode())
                        result = HealthResult(
                            check_id=check_id,
                            status=HealthStatus(data["status"]),
                            score=data["score"],
                            message=data["message"],
                            timestamp=datetime.fromisoformat(data["timestamp"])
                        )
                        results.append(result)
            
        except Exception as e:
            self.logger.error(f"Failed to get recent health results: {str(e)}")
        
        return results
    
    async def _generate_health_recommendations(self, check_results: List[HealthResult], category_scores: Dict[MonitoringCategory, float]) -> List[str]:
        """Generate health recommendations"""
        recommendations = []
        
        try:
            # Check for critical issues
            critical_checks = [r for r in check_results if r.status in [HealthStatus.CRITICAL, HealthStatus.FAILURE]]
            for check in critical_checks:
                recommendations.append(f"CRITICAL: Address {check.check_id} - {check.message}")
            
            # Check category scores
            for category, score in category_scores.items():
                if score < 70.0:
                    recommendations.append(f"Improve {category.value} performance (current: {score:.1f}%)")
            
            # Romanian cultural recommendations
            cultural_score = category_scores.get(MonitoringCategory.CULTURAL, 0.0)
            if cultural_score < 90.0:
                recommendations.append("Enhance Romanian cultural authenticity and processing")
            
            # Consciousness recommendations
            consciousness_score = category_scores.get(MonitoringCategory.CONSCIOUSNESS, 0.0)
            if consciousness_score < 80.0:
                recommendations.append("Optimize consciousness simulation and self-awareness systems")
            
            # Transcendence recommendations
            transcendence_score = category_scores.get(MonitoringCategory.TRANSCENDENCE, 0.0)
            if transcendence_score < 90.0:
                recommendations.append("Enhance transcendence capabilities and wisdom synthesis")
            
            if not recommendations:
                recommendations.append("All systems operating optimally")
            
        except Exception as e:
            recommendations.append(f"Recommendation generation failed: {str(e)}")
        
        return recommendations
    
    async def _store_health_report(self, report: HealthReport):
        """Store health report"""
        try:
            if self.db_pool:
                async with self.db_pool.acquire() as conn:
                    await conn.execute("""
                        INSERT INTO health_reports (
                            monitoring_id, report_id, overall_status, overall_score,
                            romanian_cultural_score, consciousness_level, 
                            transcendence_level, report_data
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    """,
                        self.monitoring_id,
                        report.report_id,
                        report.overall_status.value,
                        report.overall_score,
                        report.romanian_cultural_score,
                        report.consciousness_level,
                        report.transcendence_level,
                        json.dumps({
                            "category_scores": {k.value: v for k, v in report.category_scores.items()},
                            "alerts_triggered": report.alerts_triggered,
                            "recommendations": report.recommendations,
                            "check_count": len(report.check_results)
                        })
                    )
                    
        except Exception as e:
            self.logger.error(f"Failed to store health report: {str(e)}")
    
    async def _alert_processing_loop(self):
        """Alert processing loop"""
        while self.monitoring_active:
            try:
                # Process alert queue and cleanup resolved alerts
                current_time = datetime.now()
                
                # Clean up old alerts (resolved for more than 1 hour)
                alerts_to_remove = []
                for alert_key, trigger_time in self.active_alerts.items():
                    if (current_time - trigger_time).total_seconds() > 3600:
                        alerts_to_remove.append(alert_key)
                
                for alert_key in alerts_to_remove:
                    del self.active_alerts[alert_key]
                
                await asyncio.sleep(60)  # Process every minute
                
            except Exception as e:
                self.logger.error(f"Alert processing error: {str(e)}")
                await asyncio.sleep(120)
    
    async def get_health_status(self) -> Dict[str, Any]:
        """Get current health status"""
        try:
            if self.last_health_report:
                return {
                    "overall_status": self.last_health_report.overall_status.value,
                    "overall_score": self.last_health_report.overall_score,
                    "romanian_cultural_score": self.last_health_report.romanian_cultural_score,
                    "consciousness_level": self.last_health_report.consciousness_level,
                    "transcendence_level": self.last_health_report.transcendence_level,
                    "active_alerts": len(self.active_alerts),
                    "monitoring_active": self.monitoring_active,
                    "uptime": (datetime.now() - self.start_time).total_seconds(),
                    "last_report": self.last_health_report.generated_at.isoformat()
                }
            else:
                return {
                    "overall_status": "initializing",
                    "overall_score": 0.0,
                    "monitoring_active": self.monitoring_active,
                    "uptime": (datetime.now() - self.start_time).total_seconds()
                }
                
        except Exception as e:
            self.logger.error(f"Failed to get health status: {str(e)}")
            return {"error": str(e)}
    
    async def shutdown_monitoring(self):
        """Shutdown health monitoring system"""
        try:
            self.logger.info("Shutting down AGI health monitoring system...")
            
            self.monitoring_active = False
            
            # Close database connections
            if self.redis_client:
                await self.redis_client.close()
            
            if self.db_pool:
                await self.db_pool.close()
            
            self.logger.info("AGI health monitoring system shutdown complete")
            
        except Exception as e:
            self.logger.error(f"Health monitoring shutdown error: {str(e)}")

# Usage example and demonstration
async def main():
    """Demonstrate Romanian AGI Health Monitoring"""
    print("🏥 Romanian AGI Health Monitoring - Week 13 Day 1")
    print("=" * 55)
    
    # Configure health monitoring
    config = {
        'redis_url': 'redis://localhost:6379/0',
        'database_url': 'postgresql://agi_user:agi_pass@localhost:5432/agi_health',
        'email_alerts': False,
        'slack_alerts': False
    }
    
    # Initialize health monitoring
    health_monitor = AGIHealthMonitoring(config)
    
    try:
        # Initialize monitoring system
        print("\n🏗️ Initializing health monitoring system...")
        if await health_monitor.initialize_monitoring():
            print("✅ Health monitoring initialized successfully")
        else:
            print("❌ Health monitoring initialization failed")
            return
        
        # Monitor for a while
        print("\n📊 Monitoring AGI health...")
        await asyncio.sleep(20)
        
        # Generate health report
        print("\n📋 Generating health report...")
        report = await health_monitor.generate_health_report()
        
        print(f"\n🎯 Health Report:")
        print(f"  Overall Status: {report.overall_status.value}")
        print(f"  Overall Score: {report.overall_score:.1f}%")
        print(f"  Romanian Cultural Score: {report.romanian_cultural_score:.1f}%")
        print(f"  Consciousness Level: {report.consciousness_level}")
        print(f"  Transcendence Level: {report.transcendence_level:.1f}%")
        print(f"  Active Alerts: {len(report.alerts_triggered)}")
        print(f"  Health Checks: {len(report.check_results)}")
        
        print(f"\n📊 Category Scores:")
        for category, score in report.category_scores.items():
            print(f"  {category.value}: {score:.1f}%")
        
        if report.recommendations:
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(report.recommendations[:5], 1):
                print(f"  {i}. {rec}")
        
        # Get current health status
        status = await health_monitor.get_health_status()
        print(f"\n📈 Current Status:")
        print(f"  Status: {status['overall_status']}")
        print(f"  Score: {status.get('overall_score', 0):.1f}%")
        print(f"  Uptime: {status['uptime']:.0f} seconds")
        print(f"  Monitoring Active: {status['monitoring_active']}")
        
    except Exception as e:
        print(f"❌ Health monitoring error: {str(e)}")
    
    finally:
        # Cleanup
        print("\n🛑 Shutting down health monitoring...")
        await health_monitor.shutdown_monitoring()
        print("✅ Health monitoring shutdown complete")

if __name__ == "__main__":
    asyncio.run(main())
