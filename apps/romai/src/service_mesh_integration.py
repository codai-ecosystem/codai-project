"""
Service Mesh Integration System
Advanced service mesh architecture for Codai ecosystem
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Union, Callable, Set
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
import hashlib
from collections import defaultdict, deque
import time
import statistics

logger = logging.getLogger(__name__)

class LoadBalancingStrategy(Enum):
    """Load balancing strategies"""
    ROUND_ROBIN = "round_robin"
    LEAST_CONNECTIONS = "least_connections"
    WEIGHTED_ROUND_ROBIN = "weighted_round_robin"
    HEALTH_BASED = "health_based"
    LATENCY_BASED = "latency_based"
    RESOURCE_BASED = "resource_based"

class ServiceDiscoveryMethod(Enum):
    """Service discovery methods"""
    STATIC = "static"
    DNS = "dns"
    CONSUL = "consul"
    EUREKA = "eureka"
    KUBERNETES = "kubernetes"
    ZOOKEEPER = "zookeeper"

@dataclass
class ServiceInstance:
    """Service instance information"""
    service_id: str
    service_name: str
    host: str
    port: int
    version: str
    health_status: str = "healthy"
    metadata: Dict[str, Any] = None
    last_health_check: datetime = None
    connection_count: int = 0
    response_time_ms: float = 0.0
    resource_usage: Dict[str, float] = None
    weight: int = 100
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}
        if self.last_health_check is None:
            self.last_health_check = datetime.utcnow()
        if self.resource_usage is None:
            self.resource_usage = {"cpu": 0.0, "memory": 0.0, "disk": 0.0}

@dataclass 
class ServiceRoute:
    """Service routing configuration"""
    service_name: str
    path_pattern: str
    target_instances: List[str]
    load_balancing: LoadBalancingStrategy
    timeout_seconds: int = 30
    retry_attempts: int = 3
    circuit_breaker_enabled: bool = True
    rate_limit_per_minute: Optional[int] = None
    auth_required: bool = True
    middleware: List[str] = None
    
    def __post_init__(self):
        if self.middleware is None:
            self.middleware = []

@dataclass
class CircuitBreakerConfig:
    """Circuit breaker configuration"""
    failure_threshold: int = 5
    recovery_timeout_seconds: int = 60
    half_open_max_calls: int = 3
    minimum_throughput: int = 10

@dataclass
class CircuitBreakerState:
    """Circuit breaker state tracking"""
    state: str = "closed"  # closed, open, half-open
    failure_count: int = 0
    last_failure_time: datetime = None
    success_count: int = 0
    total_count: int = 0
    
    def __post_init__(self):
        if self.last_failure_time is None:
            self.last_failure_time = datetime.utcnow()

class ServiceRegistry:
    """Service registry for dynamic service discovery"""
    
    def __init__(self):
        self.services: Dict[str, List[ServiceInstance]] = defaultdict(list)
        self.service_routes: Dict[str, ServiceRoute] = {}
        self.health_check_interval = 30  # seconds
        self.last_health_checks: Dict[str, datetime] = {}
    
    def register_service(self, instance: ServiceInstance):
        """Register a service instance"""
        service_instances = self.services[instance.service_name]
        
        # Remove existing instance if present
        service_instances[:] = [s for s in service_instances if s.service_id != instance.service_id]
        
        # Add new instance
        service_instances.append(instance)
        logger.info(f"🔗 Registered service: {instance.service_name} ({instance.host}:{instance.port})")
    
    def deregister_service(self, service_name: str, service_id: str):
        """Deregister a service instance"""
        if service_name in self.services:
            self.services[service_name][:] = [
                s for s in self.services[service_name] if s.service_id != service_id
            ]
            logger.info(f"❌ Deregistered service: {service_name} ({service_id})")
    
    def get_service_instances(self, service_name: str) -> List[ServiceInstance]:
        """Get all instances of a service"""
        return [s for s in self.services.get(service_name, []) if s.health_status == "healthy"]
    
    def get_all_services(self) -> Dict[str, List[ServiceInstance]]:
        """Get all registered services"""
        return dict(self.services)
    
    def update_service_health(self, service_name: str, service_id: str, health_status: str, 
                            response_time_ms: float = 0.0, resource_usage: Dict[str, float] = None):
        """Update service health status"""
        for instance in self.services.get(service_name, []):
            if instance.service_id == service_id:
                instance.health_status = health_status
                instance.last_health_check = datetime.utcnow()
                instance.response_time_ms = response_time_ms
                if resource_usage:
                    instance.resource_usage.update(resource_usage)
                break
    
    def add_service_route(self, route: ServiceRoute):
        """Add service routing configuration"""
        self.service_routes[route.service_name] = route
        logger.info(f"🛣️ Added route for service: {route.service_name}")
    
    def get_service_route(self, service_name: str) -> Optional[ServiceRoute]:
        """Get routing configuration for a service"""
        return self.service_routes.get(service_name)

class LoadBalancer:
    """Advanced load balancer with multiple strategies"""
    
    def __init__(self):
        self.round_robin_counters: Dict[str, int] = defaultdict(int)
        self.connection_counts: Dict[str, int] = defaultdict(int)
        self.response_time_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
    
    def select_instance(self, instances: List[ServiceInstance], 
                       strategy: LoadBalancingStrategy) -> Optional[ServiceInstance]:
        """Select service instance based on load balancing strategy"""
        
        if not instances:
            return None
        
        healthy_instances = [i for i in instances if i.health_status == "healthy"]
        if not healthy_instances:
            return None
        
        if strategy == LoadBalancingStrategy.ROUND_ROBIN:
            return self._round_robin_selection(healthy_instances)
        elif strategy == LoadBalancingStrategy.LEAST_CONNECTIONS:
            return self._least_connections_selection(healthy_instances)
        elif strategy == LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
            return self._weighted_round_robin_selection(healthy_instances)
        elif strategy == LoadBalancingStrategy.HEALTH_BASED:
            return self._health_based_selection(healthy_instances)
        elif strategy == LoadBalancingStrategy.LATENCY_BASED:
            return self._latency_based_selection(healthy_instances)
        elif strategy == LoadBalancingStrategy.RESOURCE_BASED:
            return self._resource_based_selection(healthy_instances)
        else:
            return healthy_instances[0]  # Default fallback
    
    def _round_robin_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Round robin selection"""
        service_key = instances[0].service_name
        index = self.round_robin_counters[service_key] % len(instances)
        self.round_robin_counters[service_key] += 1
        return instances[index]
    
    def _least_connections_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Least connections selection"""
        return min(instances, key=lambda i: i.connection_count)
    
    def _weighted_round_robin_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Weighted round robin selection"""
        total_weight = sum(i.weight for i in instances)
        if total_weight == 0:
            return instances[0]
        
        # Simple weighted selection
        import random
        rand_weight = random.randint(1, total_weight)
        current_weight = 0
        
        for instance in instances:
            current_weight += instance.weight
            if rand_weight <= current_weight:
                return instance
        
        return instances[-1]  # Fallback
    
    def _health_based_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Health-based selection favoring recently healthy instances"""
        current_time = datetime.utcnow()
        
        def health_score(instance):
            time_since_check = (current_time - instance.last_health_check).total_seconds()
            recency_score = max(0, 1 - (time_since_check / 300))  # 5 minute decay
            return recency_score
        
        return max(instances, key=health_score)
    
    def _latency_based_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Latency-based selection favoring fast-responding instances"""
        return min(instances, key=lambda i: i.response_time_ms)
    
    def _resource_based_selection(self, instances: List[ServiceInstance]) -> ServiceInstance:
        """Resource-based selection favoring instances with lower resource usage"""
        def resource_score(instance):
            cpu_score = 1 - instance.resource_usage.get("cpu", 0)
            memory_score = 1 - instance.resource_usage.get("memory", 0)
            return (cpu_score + memory_score) / 2
        
        return max(instances, key=resource_score)
    
    def update_connection_count(self, instance: ServiceInstance, delta: int):
        """Update connection count for an instance"""
        instance.connection_count = max(0, instance.connection_count + delta)
    
    def record_response_time(self, instance: ServiceInstance, response_time_ms: float):
        """Record response time for latency-based routing"""
        instance_key = f"{instance.service_name}:{instance.service_id}"
        self.response_time_history[instance_key].append(response_time_ms)
        
        # Update instance average response time
        history = self.response_time_history[instance_key]
        if history:
            instance.response_time_ms = statistics.mean(history)

class CircuitBreaker:
    """Circuit breaker implementation for fault tolerance"""
    
    def __init__(self, config: CircuitBreakerConfig):
        self.config = config
        self.states: Dict[str, CircuitBreakerState] = defaultdict(CircuitBreakerState)
    
    def can_execute(self, service_name: str) -> bool:
        """Check if request can be executed based on circuit breaker state"""
        state = self.states[service_name]
        current_time = datetime.utcnow()
        
        if state.state == "closed":
            return True
        elif state.state == "open":
            # Check if recovery timeout has passed
            time_since_failure = (current_time - state.last_failure_time).total_seconds()
            if time_since_failure >= self.config.recovery_timeout_seconds:
                state.state = "half-open"
                state.success_count = 0
                logger.info(f"🔄 Circuit breaker half-open for {service_name}")
                return True
            return False
        elif state.state == "half-open":
            return state.success_count < self.config.half_open_max_calls
        
        return False
    
    def record_success(self, service_name: str):
        """Record successful request"""
        state = self.states[service_name]
        state.success_count += 1
        state.total_count += 1
        
        if state.state == "half-open":
            if state.success_count >= self.config.half_open_max_calls:
                state.state = "closed"
                state.failure_count = 0
                logger.info(f"✅ Circuit breaker closed for {service_name}")
    
    def record_failure(self, service_name: str):
        """Record failed request"""
        state = self.states[service_name]
        state.failure_count += 1
        state.total_count += 1
        state.last_failure_time = datetime.utcnow()
        
        if state.state == "closed" and state.failure_count >= self.config.failure_threshold:
            if state.total_count >= self.config.minimum_throughput:
                state.state = "open"
                logger.warning(f"⚠️ Circuit breaker open for {service_name}")
        elif state.state == "half-open":
            state.state = "open"
            logger.warning(f"⚠️ Circuit breaker open for {service_name} (half-open failed)")
    
    def get_state(self, service_name: str) -> str:
        """Get circuit breaker state for a service"""
        return self.states[service_name].state

class ServiceMeshProxy:
    """Service mesh proxy handling routing, load balancing, and fault tolerance"""
    
    def __init__(self):
        self.registry = ServiceRegistry()
        self.load_balancer = LoadBalancer()
        self.circuit_breaker = CircuitBreaker(CircuitBreakerConfig())
        self.middleware_handlers: Dict[str, Callable] = {}
        self.request_metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "avg_response_time": 0.0,
            "service_metrics": defaultdict(lambda: {
                "requests": 0,
                "successes": 0,
                "failures": 0,
                "avg_response_time": 0.0
            })
        }
    
    def register_middleware(self, name: str, handler: Callable):
        """Register middleware handler"""
        self.middleware_handlers[name] = handler
        logger.info(f"🔧 Registered middleware: {name}")
    
    async def route_request(self, service_name: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Route request through service mesh"""
        
        start_time = time.time()
        
        try:
            # Check circuit breaker
            if not self.circuit_breaker.can_execute(service_name):
                return {
                    "success": False,
                    "error": f"Circuit breaker open for {service_name}",
                    "status_code": 503
                }
            
            # Get service instances
            instances = self.registry.get_service_instances(service_name)
            if not instances:
                return {
                    "success": False,
                    "error": f"No healthy instances available for {service_name}",
                    "status_code": 503
                }
            
            # Get routing configuration
            route = self.registry.get_service_route(service_name)
            if not route:
                # Default routing
                route = ServiceRoute(
                    service_name=service_name,
                    path_pattern="/*",
                    target_instances=[],
                    load_balancing=LoadBalancingStrategy.ROUND_ROBIN
                )
            
            # Select target instance
            selected_instance = self.load_balancer.select_instance(instances, route.load_balancing)
            if not selected_instance:
                return {
                    "success": False,
                    "error": f"No suitable instance found for {service_name}",
                    "status_code": 503
                }
            
            # Execute middleware
            for middleware_name in route.middleware:
                if middleware_name in self.middleware_handlers:
                    request_data = await self.middleware_handlers[middleware_name](request_data)
            
            # Update connection count
            self.load_balancer.update_connection_count(selected_instance, 1)
            
            try:
                # Execute the actual request (mock for now)
                response = await self._execute_service_request(selected_instance, request_data)
                
                # Record success
                self.circuit_breaker.record_success(service_name)
                
                # Update metrics
                response_time = (time.time() - start_time) * 1000
                self.load_balancer.record_response_time(selected_instance, response_time)
                self._update_metrics(service_name, True, response_time)
                
                return response
                
            finally:
                # Update connection count
                self.load_balancer.update_connection_count(selected_instance, -1)
                
        except Exception as e:
            # Record failure
            self.circuit_breaker.record_failure(service_name)
            
            # Update metrics
            response_time = (time.time() - start_time) * 1000
            self._update_metrics(service_name, False, response_time)
            
            logger.error(f"❌ Service request failed for {service_name}: {e}")
            return {
                "success": False,
                "error": str(e),
                "status_code": 500
            }
    
    async def _execute_service_request(self, instance: ServiceInstance, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute actual service request"""
        
        # Mock implementation - in real scenario, this would make HTTP request
        url = f"http://{instance.host}:{instance.port}"
        
        # Simulate request processing
        await asyncio.sleep(0.1)  # Simulate network latency
        
        # Mock successful response
        return {
            "success": True,
            "data": {
                "service": instance.service_name,
                "instance_id": instance.service_id,
                "timestamp": datetime.utcnow().isoformat(),
                "processed_data": request_data
            },
            "status_code": 200
        }
    
    def _update_metrics(self, service_name: str, success: bool, response_time_ms: float):
        """Update request metrics"""
        
        # Global metrics
        self.request_metrics["total_requests"] += 1
        if success:
            self.request_metrics["successful_requests"] += 1
        else:
            self.request_metrics["failed_requests"] += 1
        
        # Update average response time
        total_requests = self.request_metrics["total_requests"]
        current_avg = self.request_metrics["avg_response_time"]
        self.request_metrics["avg_response_time"] = (
            (current_avg * (total_requests - 1) + response_time_ms) / total_requests
        )
        
        # Service-specific metrics
        service_metrics = self.request_metrics["service_metrics"][service_name]
        service_metrics["requests"] += 1
        if success:
            service_metrics["successes"] += 1
        else:
            service_metrics["failures"] += 1
        
        # Update service average response time
        service_requests = service_metrics["requests"]
        service_avg = service_metrics["avg_response_time"]
        service_metrics["avg_response_time"] = (
            (service_avg * (service_requests - 1) + response_time_ms) / service_requests
        )
    
    def get_service_topology(self) -> Dict[str, Any]:
        """Get service mesh topology"""
        
        topology = {
            "services": {},
            "total_instances": 0,
            "healthy_instances": 0,
            "circuit_breaker_states": {}
        }
        
        for service_name, instances in self.registry.get_all_services().items():
            healthy_count = sum(1 for i in instances if i.health_status == "healthy")
            
            topology["services"][service_name] = {
                "total_instances": len(instances),
                "healthy_instances": healthy_count,
                "instances": [
                    {
                        "id": i.service_id,
                        "host": i.host,
                        "port": i.port,
                        "status": i.health_status,
                        "connections": i.connection_count,
                        "response_time": i.response_time_ms,
                        "weight": i.weight
                    }
                    for i in instances
                ]
            }
            
            topology["total_instances"] += len(instances)
            topology["healthy_instances"] += healthy_count
            topology["circuit_breaker_states"][service_name] = self.circuit_breaker.get_state(service_name)
        
        return topology
    
    def get_metrics(self) -> Dict[str, Any]:
        """Get comprehensive service mesh metrics"""
        return {
            "request_metrics": self.request_metrics.copy(),
            "service_topology": self.get_service_topology(),
            "circuit_breaker_states": {
                service: self.circuit_breaker.get_state(service)
                for service in self.registry.get_all_services().keys()
            }
        }

class ServiceMeshOrchestrator:
    """
    Service Mesh Orchestrator for Codai Ecosystem
    
    Advanced service mesh implementation with:
    - Dynamic service discovery and registration
    - Intelligent load balancing with multiple strategies  
    - Circuit breaker patterns for fault tolerance
    - Real-time health monitoring and metrics
    - Middleware pipeline for cross-cutting concerns
    - Service topology visualization and management
    """
    
    def __init__(self):
        self.proxy = ServiceMeshProxy()
        self.health_monitor_task = None
        self.metrics_collection_task = None
        self.running = False
    
    async def start(self):
        """Start service mesh orchestrator"""
        
        if self.running:
            return
        
        self.running = True
        logger.info("🚀 Starting Service Mesh Orchestrator")
        
        # Initialize Codai services
        await self._initialize_codai_services()
        
        # Register default middleware
        self._register_default_middleware()
        
        # Start background tasks
        self.health_monitor_task = asyncio.create_task(self._health_monitoring_loop())
        self.metrics_collection_task = asyncio.create_task(self._metrics_collection_loop())
        
        logger.info("✅ Service Mesh Orchestrator started successfully")
    
    async def stop(self):
        """Stop service mesh orchestrator"""
        
        if not self.running:
            return
        
        self.running = False
        logger.info("🛑 Stopping Service Mesh Orchestrator")
        
        # Cancel background tasks
        if self.health_monitor_task:
            self.health_monitor_task.cancel()
        if self.metrics_collection_task:
            self.metrics_collection_task.cancel()
        
        logger.info("✅ Service Mesh Orchestrator stopped")
    
    async def _initialize_codai_services(self):
        """Initialize all Codai services in the mesh"""
        
        codai_services = [
            # Core Infrastructure
            ServiceInstance("nginx-lb", "nginx", "localhost", 4000, "1.0.0", metadata={"type": "load_balancer"}),
            ServiceInstance("api-gateway", "gateway", "localhost", 4010, "1.0.0", metadata={"type": "gateway"}),
            
            # Identity & Authentication
            ServiceInstance("identity-api", "identity", "localhost", 4100, "1.0.0", metadata={"type": "auth"}),
            
            # Core Services
            ServiceInstance("hub-api", "hub", "localhost", 4110, "1.0.0", metadata={"type": "core"}),
            ServiceInstance("memorai-frontend", "memorai", "localhost", 4006, "1.0.0", metadata={"type": "frontend"}),
            ServiceInstance("memorai-mcp", "memorai-mcp", "localhost", 4950, "1.0.0", metadata={"type": "mcp"}),
            ServiceInstance("memorai-graphql", "memorai-graphql", "localhost", 4500, "1.0.0", metadata={"type": "graphql"}),
            
            # AI Services  
            ServiceInstance("romai-ml", "romai", "localhost", 6101, "1.0.0", metadata={"type": "ml"}),
            ServiceInstance("romai-compliance", "romai-compliance", "localhost", 8001, "1.0.0", metadata={"type": "compliance"}),
            ServiceInstance("romai-frontend", "romai-frontend", "localhost", 6100, "1.0.0", metadata={"type": "frontend"}),
            
            # Business Services
            ServiceInstance("bancai-api", "bancai", "localhost", 4120, "1.0.0", metadata={"type": "financial"}),
            ServiceInstance("admin-dashboard", "admin", "localhost", 4007, "1.0.0", metadata={"type": "admin"}),
            ServiceInstance("explorer-app", "explorer", "localhost", 4400, "1.0.0", metadata={"type": "explorer"}),
            ServiceInstance("controlai-dashboard", "controlai", "localhost", 4200, "1.0.0", metadata={"type": "control"}),
            ServiceInstance("kodex-app", "kodex", "localhost", 5000, "1.0.0", metadata={"type": "development"}),
            
            # Data Services
            ServiceInstance("postgresql", "database", "localhost", 5432, "14.0", metadata={"type": "database"}),
            ServiceInstance("redis", "cache", "localhost", 6379, "7.0", metadata={"type": "cache"}),
            ServiceInstance("cbd-database", "cbd", "localhost", 4180, "1.0.0", metadata={"type": "graph_db"}),
        ]
        
        # Register all services
        for service in codai_services:
            self.proxy.registry.register_service(service)
            
            # Add routing configuration
            route = ServiceRoute(
                service_name=service.service_name,
                path_pattern="/*",
                target_instances=[service.service_id],
                load_balancing=LoadBalancingStrategy.ROUND_ROBIN,
                timeout_seconds=60 if service.metadata.get("type") == "ml" else 30,
                retry_attempts=3,
                circuit_breaker_enabled=True,
                rate_limit_per_minute=100 if service.metadata.get("type") == "ml" else 1000,
                middleware=["auth", "logging", "metrics"] if service.metadata.get("type") != "auth" else ["logging", "metrics"]
            )
            
            self.proxy.registry.add_service_route(route)
        
        logger.info(f"✅ Initialized {len(codai_services)} services in mesh")
    
    def _register_default_middleware(self):
        """Register default middleware handlers"""
        
        async def auth_middleware(request_data: Dict[str, Any]) -> Dict[str, Any]:
            """Authentication middleware"""
            # Mock auth check - in real implementation, validate JWT tokens
            if "auth_token" not in request_data.get("headers", {}):
                request_data["auth_status"] = "unauthenticated"
            else:
                request_data["auth_status"] = "authenticated"
            return request_data
        
        async def logging_middleware(request_data: Dict[str, Any]) -> Dict[str, Any]:
            """Request logging middleware"""
            request_id = str(uuid.uuid4())[:8]
            request_data["request_id"] = request_id
            logger.info(f"📝 Request {request_id}: {request_data.get('method', 'UNKNOWN')} {request_data.get('path', '/')}")
            return request_data
        
        async def metrics_middleware(request_data: Dict[str, Any]) -> Dict[str, Any]:
            """Metrics collection middleware"""
            request_data["metrics"] = {
                "start_time": time.time(),
                "request_size": len(json.dumps(request_data))
            }
            return request_data
        
        # Register middleware
        self.proxy.register_middleware("auth", auth_middleware)
        self.proxy.register_middleware("logging", logging_middleware) 
        self.proxy.register_middleware("metrics", metrics_middleware)
    
    async def _health_monitoring_loop(self):
        """Background health monitoring loop"""
        
        while self.running:
            try:
                await self._perform_health_checks()
                await asyncio.sleep(30)  # Health check every 30 seconds
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ Health monitoring error: {e}")
                await asyncio.sleep(5)
    
    async def _perform_health_checks(self):
        """Perform health checks on all registered services"""
        
        for service_name, instances in self.proxy.registry.get_all_services().items():
            for instance in instances:
                try:
                    # Mock health check - in real implementation, make HTTP health check
                    health_status = "healthy"  # Assume healthy for mock
                    response_time = 50.0 + (hash(instance.service_id) % 100)  # Mock response time
                    resource_usage = {
                        "cpu": (hash(instance.service_id) % 50) / 100.0,
                        "memory": (hash(instance.service_id) % 80) / 100.0,
                        "disk": (hash(instance.service_id) % 30) / 100.0
                    }
                    
                    self.proxy.registry.update_service_health(
                        service_name=service_name,
                        service_id=instance.service_id,
                        health_status=health_status,
                        response_time_ms=response_time,
                        resource_usage=resource_usage
                    )
                    
                except Exception as e:
                    logger.warning(f"⚠️ Health check failed for {service_name}:{instance.service_id}: {e}")
                    self.proxy.registry.update_service_health(
                        service_name=service_name,
                        service_id=instance.service_id,
                        health_status="unhealthy"
                    )
    
    async def _metrics_collection_loop(self):
        """Background metrics collection loop"""
        
        while self.running:
            try:
                metrics = self.proxy.get_metrics()
                
                # Log key metrics every minute
                logger.info(f"📊 Mesh Metrics - Requests: {metrics['request_metrics']['total_requests']}, "
                           f"Success Rate: {self._calculate_success_rate(metrics)}%, "
                           f"Avg Response Time: {metrics['request_metrics']['avg_response_time']:.1f}ms")
                
                await asyncio.sleep(60)  # Collect metrics every minute
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"❌ Metrics collection error: {e}")
                await asyncio.sleep(30)
    
    def _calculate_success_rate(self, metrics: Dict[str, Any]) -> float:
        """Calculate overall success rate"""
        request_metrics = metrics["request_metrics"]
        total = request_metrics["total_requests"]
        if total == 0:
            return 100.0
        successful = request_metrics["successful_requests"]
        return (successful / total) * 100
    
    async def route_request(self, service_name: str, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Route request through service mesh"""
        return await self.proxy.route_request(service_name, request_data)
    
    def get_service_topology(self) -> Dict[str, Any]:
        """Get current service mesh topology"""
        return self.proxy.get_service_topology()
    
    def get_comprehensive_metrics(self) -> Dict[str, Any]:
        """Get comprehensive service mesh metrics"""
        base_metrics = self.proxy.get_metrics()
        
        # Add additional orchestrator metrics
        base_metrics["orchestrator"] = {
            "running": self.running,
            "services_registered": len(self.proxy.registry.get_all_services()),
            "total_instances": sum(len(instances) for instances in self.proxy.registry.get_all_services().values()),
            "middleware_handlers": list(self.proxy.middleware_handlers.keys())
        }
        
        return base_metrics


# Global service mesh instance
service_mesh_orchestrator = None

def get_service_mesh() -> ServiceMeshOrchestrator:
    """Get global service mesh orchestrator"""
    global service_mesh_orchestrator
    if service_mesh_orchestrator is None:
        service_mesh_orchestrator = ServiceMeshOrchestrator()
    return service_mesh_orchestrator


# Example usage
if __name__ == "__main__":
    async def test_service_mesh():
        """Test service mesh functionality"""
        print("🌐 Testing Service Mesh Integration")
        
        mesh = get_service_mesh()
        await mesh.start()
        
        # Test request routing
        test_request = {
            "method": "GET",
            "path": "/api/v1/status", 
            "headers": {"auth_token": "test_token_123"},
            "data": {"test": "data"}
        }
        
        response = await mesh.route_request("identity", test_request)
        print(f"✅ Test request completed: {response['success']}")
        
        # Get metrics
        metrics = mesh.get_comprehensive_metrics()
        print(f"📊 Total Services: {metrics['orchestrator']['services_registered']}")
        print(f"📊 Total Instances: {metrics['orchestrator']['total_instances']}")
        
        # Get topology
        topology = mesh.get_service_topology()
        print(f"🗺️ Service Topology: {len(topology['services'])} services")
        
        await mesh.stop()
    
    # Run test
    asyncio.run(test_service_mesh())