"""
Cross-Service API Integration System
Seamless API integration and data flow between Codai services
"""

import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Union, Callable, Tuple
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import uuid
from contextlib import asynccontextmanager

logger = logging.getLogger(__name__)

class APIMethod(Enum):
    """HTTP methods for API calls"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"

class ResponseFormat(Enum):
    """Response format types"""
    JSON = "json"
    TEXT = "text"
    BINARY = "binary"
    STREAM = "stream"

@dataclass
class APIEndpoint:
    """API endpoint configuration"""
    service: str
    path: str
    method: APIMethod
    requires_auth: bool = True
    timeout: int = 30
    retry_attempts: int = 3
    response_format: ResponseFormat = ResponseFormat.JSON
    rate_limit: Optional[int] = None
    cache_duration: Optional[int] = None

@dataclass
class APIRequest:
    """API request configuration"""
    endpoint: APIEndpoint
    headers: Dict[str, str]
    params: Optional[Dict[str, Any]] = None
    data: Optional[Dict[str, Any]] = None
    files: Optional[Dict[str, Any]] = None
    timeout: Optional[int] = None

@dataclass
class APIResponse:
    """API response with metadata"""
    success: bool
    status_code: int
    data: Any
    headers: Dict[str, str]
    response_time_ms: float
    service: str
    endpoint: str
    error: Optional[str] = None
    cached: bool = False
    retry_count: int = 0

@dataclass
class CrossServiceWorkflow:
    """Cross-service workflow configuration"""
    workflow_id: str
    name: str
    description: str
    services: List[str]
    steps: List[Dict[str, Any]]
    dependencies: Dict[str, List[str]]
    rollback_strategy: Optional[str] = None
    timeout: int = 300

class ServiceAPIRegistry:
    """Registry of all Codai service APIs"""
    
    def __init__(self):
        self.endpoints = self._initialize_service_endpoints()
        self.service_configs = self._initialize_service_configs()
    
    def _initialize_service_configs(self) -> Dict[str, Dict[str, Any]]:
        """Initialize service configurations"""
        return {
            "identity": {
                "base_url": "http://localhost:4100",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 1000,  # requests per minute
                "timeout": 30
            },
            "hub": {
                "base_url": "http://localhost:4110",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 2000,
                "timeout": 30
            },
            "gateway": {
                "base_url": "http://localhost:4010",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 5000,
                "timeout": 30
            },
            "memorai": {
                "base_url": "http://localhost:4006",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 1000,
                "timeout": 60,
                "special_endpoints": {
                    "mcp": "http://localhost:4950",
                    "graphql": "http://localhost:4500"
                }
            },
            "bancai": {
                "base_url": "http://localhost:4120",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 500,  # Lower for financial operations
                "timeout": 45
            },
            "romai": {
                "base_url": "http://localhost:6101",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 100,  # Lower for AI operations
                "timeout": 120,
                "special_endpoints": {
                    "compliance": "http://localhost:8001"
                }
            },
            "admin": {
                "base_url": "http://localhost:4007",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 200,
                "timeout": 30
            },
            "explorer": {
                "base_url": "http://localhost:4400",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 500,
                "timeout": 60
            },
            "controlai": {
                "base_url": "http://localhost:4200",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 300,
                "timeout": 45
            },
            "kodex": {
                "base_url": "http://localhost:5000",
                "api_prefix": "/api/v1",
                "auth_header": "Authorization",
                "rate_limit": 200,
                "timeout": 90
            }
        }
    
    def _initialize_service_endpoints(self) -> Dict[str, List[APIEndpoint]]:
        """Initialize all service endpoints"""
        return {
            "identity": [
                APIEndpoint("identity", "/auth/login", APIMethod.POST, False),
                APIEndpoint("identity", "/auth/register", APIMethod.POST, False),
                APIEndpoint("identity", "/auth/refresh", APIMethod.POST, True),
                APIEndpoint("identity", "/auth/logout", APIMethod.POST, True),
                APIEndpoint("identity", "/users/profile", APIMethod.GET, True),
                APIEndpoint("identity", "/users/profile", APIMethod.PUT, True),
                APIEndpoint("identity", "/users/permissions", APIMethod.GET, True),
            ],
            "memorai": [
                APIEndpoint("memorai", "/memory/store", APIMethod.POST, True),
                APIEndpoint("memorai", "/memory/retrieve", APIMethod.GET, True),
                APIEndpoint("memorai", "/memory/search", APIMethod.POST, True),
                APIEndpoint("memorai", "/memory/delete", APIMethod.DELETE, True),
                APIEndpoint("memorai", "/context/create", APIMethod.POST, True),
                APIEndpoint("memorai", "/context/update", APIMethod.PUT, True),
                APIEndpoint("memorai", "/graph/query", APIMethod.POST, True),
            ],
            "bancai": [
                APIEndpoint("bancai", "/accounts/list", APIMethod.GET, True),
                APIEndpoint("bancai", "/accounts/balance", APIMethod.GET, True),
                APIEndpoint("bancai", "/transactions/create", APIMethod.POST, True),
                APIEndpoint("bancai", "/transactions/list", APIMethod.GET, True),
                APIEndpoint("bancai", "/payments/process", APIMethod.POST, True),
                APIEndpoint("bancai", "/analysis/financial", APIMethod.POST, True),
            ],
            "romai": [
                APIEndpoint("romai", "/inference/text", APIMethod.POST, True, timeout=120),
                APIEndpoint("romai", "/inference/reasoning", APIMethod.POST, True, timeout=180),
                APIEndpoint("romai", "/inference/romanian", APIMethod.POST, True, timeout=90),
                APIEndpoint("romai", "/models/status", APIMethod.GET, True),
                APIEndpoint("romai", "/training/start", APIMethod.POST, True, timeout=300),
                APIEndpoint("romai", "/consciousness/analyze", APIMethod.POST, True, timeout=150),
            ],
            "admin": [
                APIEndpoint("admin", "/system/status", APIMethod.GET, True),
                APIEndpoint("admin", "/users/manage", APIMethod.GET, True),
                APIEndpoint("admin", "/analytics/data", APIMethod.GET, True),
                APIEndpoint("admin", "/logs/query", APIMethod.POST, True),
                APIEndpoint("admin", "/config/update", APIMethod.PUT, True),
            ],
            "controlai": [
                APIEndpoint("controlai", "/ai/status", APIMethod.GET, True),
                APIEndpoint("controlai", "/models/monitor", APIMethod.GET, True),
                APIEndpoint("controlai", "/metrics/collect", APIMethod.POST, True),
                APIEndpoint("controlai", "/dashboard/data", APIMethod.GET, True),
                APIEndpoint("controlai", "/alerts/manage", APIMethod.POST, True),
            ],
            "kodex": [
                APIEndpoint("kodex", "/analyze/code", APIMethod.POST, True, timeout=120),
                APIEndpoint("kodex", "/document/generate", APIMethod.POST, True, timeout=180),
                APIEndpoint("kodex", "/quality/assess", APIMethod.POST, True, timeout=90),
                APIEndpoint("kodex", "/refactor/suggest", APIMethod.POST, True, timeout=150),
            ],
            "explorer": [
                APIEndpoint("explorer", "/blockchain/status", APIMethod.GET, True),
                APIEndpoint("explorer", "/transactions/analyze", APIMethod.POST, True),
                APIEndpoint("explorer", "/data/visualize", APIMethod.POST, True),
                APIEndpoint("explorer", "/search/query", APIMethod.POST, True),
            ]
        }
    
    def get_endpoint(self, service: str, path: str, method: APIMethod) -> Optional[APIEndpoint]:
        """Get specific endpoint configuration"""
        service_endpoints = self.endpoints.get(service, [])
        for endpoint in service_endpoints:
            if endpoint.path == path and endpoint.method == method:
                return endpoint
        return None
    
    def get_service_endpoints(self, service: str) -> List[APIEndpoint]:
        """Get all endpoints for a service"""
        return self.endpoints.get(service, [])
    
    def get_service_config(self, service: str) -> Dict[str, Any]:
        """Get service configuration"""
        return self.service_configs.get(service, {})

class APIClient:
    """HTTP client for making API requests with advanced features"""
    
    def __init__(self):
        self.session = None
        self.response_cache = {}
        self.rate_limiters = {}
        self.circuit_breakers = {}
        self.retry_strategies = {}
    
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def make_request(self, request: APIRequest) -> APIResponse:
        """Make HTTP request with retry logic and error handling"""
        start_time = asyncio.get_event_loop().time()
        retry_count = 0
        
        while retry_count <= request.endpoint.retry_attempts:
            try:
                # Check circuit breaker
                if self._is_circuit_open(request.endpoint.service):
                    raise Exception(f"Circuit breaker open for {request.endpoint.service}")
                
                # Check rate limit
                if not await self._check_rate_limit(request.endpoint.service):
                    await asyncio.sleep(0.1)  # Brief delay for rate limiting
                    continue
                
                # Make the actual request
                response = await self._execute_request(request)
                
                # Calculate response time
                response_time = (asyncio.get_event_loop().time() - start_time) * 1000
                response.response_time_ms = response_time
                response.retry_count = retry_count
                
                # Update circuit breaker on success
                self._record_success(request.endpoint.service)
                
                return response
                
            except Exception as e:
                retry_count += 1
                logger.warning(f"Request failed (attempt {retry_count}): {e}")
                
                # Record failure for circuit breaker
                self._record_failure(request.endpoint.service)
                
                if retry_count > request.endpoint.retry_attempts:
                    response_time = (asyncio.get_event_loop().time() - start_time) * 1000
                    return APIResponse(
                        success=False,
                        status_code=0,
                        data={},
                        headers={},
                        response_time_ms=response_time,
                        service=request.endpoint.service,
                        endpoint=request.endpoint.path,
                        error=str(e),
                        retry_count=retry_count - 1
                    )
                
                # Exponential backoff
                await asyncio.sleep(2 ** retry_count)
        
        # This shouldn't be reached, but just in case
        response_time = (asyncio.get_event_loop().time() - start_time) * 1000
        return APIResponse(
            success=False,
            status_code=0,
            data={},
            headers={},
            response_time_ms=response_time,
            service=request.endpoint.service,
            endpoint=request.endpoint.path,
            error="Max retries exceeded",
            retry_count=retry_count
        )
    
    async def _execute_request(self, request: APIRequest) -> APIResponse:
        """Execute the actual HTTP request"""
        if not self.session:
            raise Exception("APIClient not initialized. Use async context manager.")
        
        # Prepare URL
        registry = ServiceAPIRegistry()
        service_config = registry.get_service_config(request.endpoint.service)
        base_url = service_config.get("base_url", "")
        api_prefix = service_config.get("api_prefix", "")
        url = f"{base_url}{api_prefix}{request.endpoint.path}"
        
        # Prepare timeout
        timeout = request.timeout or request.endpoint.timeout
        
        # Execute request
        async with self.session.request(
            method=request.endpoint.method.value,
            url=url,
            headers=request.headers,
            params=request.params,
            json=request.data,
            data=request.files,
            timeout=aiohttp.ClientTimeout(total=timeout)
        ) as response:
            
            # Parse response based on format
            if request.endpoint.response_format == ResponseFormat.JSON:
                try:
                    data = await response.json()
                except:
                    data = await response.text()
            elif request.endpoint.response_format == ResponseFormat.TEXT:
                data = await response.text()
            else:
                data = await response.read()
            
            return APIResponse(
                success=response.status < 400,
                status_code=response.status,
                data=data,
                headers=dict(response.headers),
                response_time_ms=0,  # Will be set by caller
                service=request.endpoint.service,
                endpoint=request.endpoint.path
            )
    
    def _is_circuit_open(self, service: str) -> bool:
        """Check if circuit breaker is open for a service"""
        breaker = self.circuit_breakers.get(service)
        if not breaker:
            return False
        
        # Simple circuit breaker logic
        failure_rate = breaker.get("failure_count", 0) / max(breaker.get("total_count", 1), 1)
        if failure_rate > 0.5 and breaker.get("total_count", 0) >= 10:
            last_failure = breaker.get("last_failure", datetime.min)
            if datetime.utcnow() - last_failure < timedelta(minutes=5):
                return True
        
        return False
    
    async def _check_rate_limit(self, service: str) -> bool:
        """Check if request is within rate limits"""
        # Simple rate limiting - in production use more sophisticated implementation
        limiter = self.rate_limiters.get(service)
        if not limiter:
            self.rate_limiters[service] = {"count": 0, "reset_time": datetime.utcnow() + timedelta(minutes=1)}
            return True
        
        current_time = datetime.utcnow()
        if current_time > limiter["reset_time"]:
            limiter["count"] = 0
            limiter["reset_time"] = current_time + timedelta(minutes=1)
        
        registry = ServiceAPIRegistry()
        service_config = registry.get_service_config(service)
        rate_limit = service_config.get("rate_limit", 1000)
        
        if limiter["count"] < rate_limit:
            limiter["count"] += 1
            return True
        
        return False
    
    def _record_success(self, service: str):
        """Record successful request for circuit breaker"""
        if service not in self.circuit_breakers:
            self.circuit_breakers[service] = {"failure_count": 0, "total_count": 0}
        
        self.circuit_breakers[service]["total_count"] += 1
    
    def _record_failure(self, service: str):
        """Record failed request for circuit breaker"""
        if service not in self.circuit_breakers:
            self.circuit_breakers[service] = {"failure_count": 0, "total_count": 0}
        
        self.circuit_breakers[service]["failure_count"] += 1
        self.circuit_breakers[service]["total_count"] += 1
        self.circuit_breakers[service]["last_failure"] = datetime.utcnow()

class CrossServiceAPIManager:
    """
    Manages API integration across all Codai services
    
    Features:
    - Unified API client with retry logic
    - Circuit breakers for fault tolerance
    - Rate limiting and request throttling
    - Response caching for performance
    - Cross-service workflow orchestration
    - Real-time API monitoring
    """
    
    def __init__(self):
        self.registry = ServiceAPIRegistry()
        self.workflows = {}
        self.api_metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_response_time": 0.0,
            "service_metrics": {}
        }
    
    async def call_service_api(self,
                             service: str,
                             path: str,
                             method: APIMethod,
                             auth_token: str,
                             data: Optional[Dict[str, Any]] = None,
                             params: Optional[Dict[str, Any]] = None) -> APIResponse:
        """Call API on a specific service"""
        
        # Get endpoint configuration
        endpoint = self.registry.get_endpoint(service, path, method)
        if not endpoint:
            return APIResponse(
                success=False,
                status_code=404,
                data={},
                headers={},
                response_time_ms=0,
                service=service,
                endpoint=path,
                error=f"Endpoint not found: {method.value} {path}"
            )
        
        # Prepare headers
        headers = {"Content-Type": "application/json"}
        if endpoint.requires_auth and auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
        
        # Create request
        request = APIRequest(
            endpoint=endpoint,
            headers=headers,
            params=params,
            data=data
        )
        
        # Execute request
        async with APIClient() as client:
            response = await client.make_request(request)
        
        # Update metrics
        self._update_metrics(response)
        
        return response
    
    async def execute_workflow(self, workflow: CrossServiceWorkflow, 
                             auth_tokens: Dict[str, str],
                             context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a cross-service workflow"""
        
        workflow_results = {
            "workflow_id": workflow.workflow_id,
            "name": workflow.name,
            "started_at": datetime.utcnow().isoformat(),
            "steps": [],
            "success": True,
            "error": None
        }
        
        try:
            logger.info(f"🚀 Executing workflow: {workflow.name}")
            
            # Execute steps in order, respecting dependencies
            executed_steps = set()
            
            for step in workflow.steps:
                step_id = step["id"]
                dependencies = workflow.dependencies.get(step_id, [])
                
                # Check if dependencies are satisfied
                if not all(dep in executed_steps for dep in dependencies):
                    raise Exception(f"Dependencies not satisfied for step {step_id}")
                
                # Execute step
                step_result = await self._execute_workflow_step(step, auth_tokens, context_data)
                workflow_results["steps"].append(step_result)
                
                if not step_result["success"]:
                    workflow_results["success"] = False
                    workflow_results["error"] = f"Step {step_id} failed: {step_result.get('error')}"
                    
                    # Handle rollback if configured
                    if workflow.rollback_strategy:
                        await self._execute_rollback(workflow, executed_steps, auth_tokens)
                    break
                
                executed_steps.add(step_id)
                
                # Update context with step results
                context_data.update(step_result.get("output_data", {}))
            
            workflow_results["completed_at"] = datetime.utcnow().isoformat()
            logger.info(f"✅ Workflow completed: {workflow.name}")
            
        except Exception as e:
            workflow_results["success"] = False
            workflow_results["error"] = str(e)
            workflow_results["completed_at"] = datetime.utcnow().isoformat()
            logger.error(f"❌ Workflow failed: {workflow.name} - {e}")
        
        return workflow_results
    
    async def _execute_workflow_step(self,
                                   step: Dict[str, Any],
                                   auth_tokens: Dict[str, str],
                                   context_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a single workflow step"""
        
        step_id = step["id"]
        service = step["service"]
        operation = step["operation"]
        
        try:
            logger.info(f"🔄 Executing step: {step_id} ({service}.{operation})")
            
            # Prepare step data by combining step config with context
            step_data = step.get("data", {}).copy()
            
            # Replace context variables in step data
            step_data = self._replace_context_variables(step_data, context_data)
            
            # Get auth token for service
            auth_token = auth_tokens.get(service)
            
            # Execute the API call
            if operation == "api_call":
                response = await self.call_service_api(
                    service=service,
                    path=step["path"],
                    method=APIMethod(step["method"]),
                    auth_token=auth_token,
                    data=step_data
                )
                
                return {
                    "step_id": step_id,
                    "success": response.success,
                    "response_time_ms": response.response_time_ms,
                    "output_data": response.data if response.success else {},
                    "error": response.error
                }
            
            else:
                raise Exception(f"Unknown operation: {operation}")
                
        except Exception as e:
            return {
                "step_id": step_id,
                "success": False,
                "error": str(e),
                "output_data": {}
            }
    
    def _replace_context_variables(self, data: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
        """Replace context variables in step data"""
        
        def replace_value(value):
            if isinstance(value, str) and value.startswith("${") and value.endswith("}"):
                var_name = value[2:-1]
                return context.get(var_name, value)
            elif isinstance(value, dict):
                return {k: replace_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [replace_value(item) for item in value]
            else:
                return value
        
        return replace_value(data)
    
    async def _execute_rollback(self,
                              workflow: CrossServiceWorkflow,
                              executed_steps: set,
                              auth_tokens: Dict[str, str]):
        """Execute rollback strategy for failed workflow"""
        
        logger.warning(f"🔄 Executing rollback for workflow: {workflow.name}")
        
        # Simple rollback - reverse order of executed steps
        for step in reversed(workflow.steps):
            step_id = step["id"]
            if step_id in executed_steps and "rollback" in step:
                try:
                    rollback_config = step["rollback"]
                    await self._execute_workflow_step(rollback_config, auth_tokens, {})
                    logger.info(f"✅ Rolled back step: {step_id}")
                except Exception as e:
                    logger.error(f"❌ Rollback failed for step {step_id}: {e}")
    
    def _update_metrics(self, response: APIResponse):
        """Update API metrics"""
        
        self.api_metrics["total_requests"] += 1
        
        if response.success:
            self.api_metrics["successful_requests"] += 1
        else:
            self.api_metrics["failed_requests"] += 1
        
        # Update average response time
        current_avg = self.api_metrics["average_response_time"]
        total_requests = self.api_metrics["total_requests"]
        self.api_metrics["average_response_time"] = (
            (current_avg * (total_requests - 1) + response.response_time_ms) / total_requests
        )
        
        # Update service-specific metrics
        service = response.service
        if service not in self.api_metrics["service_metrics"]:
            self.api_metrics["service_metrics"][service] = {
                "requests": 0,
                "successes": 0,
                "failures": 0,
                "avg_response_time": 0.0
            }
        
        service_metrics = self.api_metrics["service_metrics"][service]
        service_metrics["requests"] += 1
        
        if response.success:
            service_metrics["successes"] += 1
        else:
            service_metrics["failures"] += 1
        
        # Update service average response time
        service_avg = service_metrics["avg_response_time"]
        service_requests = service_metrics["requests"]
        service_metrics["avg_response_time"] = (
            (service_avg * (service_requests - 1) + response.response_time_ms) / service_requests
        )
    
    def create_workflow(self, name: str, description: str, steps: List[Dict[str, Any]]) -> CrossServiceWorkflow:
        """Create a new cross-service workflow"""
        
        workflow_id = str(uuid.uuid4())
        services = list(set(step["service"] for step in steps))
        
        # Simple dependency resolution - sequential by default
        dependencies = {}
        for i, step in enumerate(steps):
            if i > 0:
                dependencies[step["id"]] = [steps[i-1]["id"]]
        
        workflow = CrossServiceWorkflow(
            workflow_id=workflow_id,
            name=name,
            description=description,
            services=services,
            steps=steps,
            dependencies=dependencies
        )
        
        self.workflows[workflow_id] = workflow
        return workflow
    
    def get_api_metrics(self) -> Dict[str, Any]:
        """Get comprehensive API metrics"""
        return self.api_metrics.copy()
    
    def get_service_health(self) -> Dict[str, Any]:
        """Get health status based on API metrics"""
        
        health_status = {}
        
        for service, metrics in self.api_metrics["service_metrics"].items():
            if metrics["requests"] == 0:
                health_status[service] = {"status": "unknown", "score": 0}
            else:
                success_rate = metrics["successes"] / metrics["requests"]
                avg_response_time = metrics["avg_response_time"]
                
                # Calculate health score (0-100)
                time_score = max(0, 100 - (avg_response_time / 10))  # Penalty for slow responses
                success_score = success_rate * 100
                health_score = (time_score + success_score) / 2
                
                status = "healthy" if health_score >= 80 else "degraded" if health_score >= 60 else "unhealthy"
                
                health_status[service] = {
                    "status": status,
                    "score": health_score,
                    "success_rate": success_rate,
                    "avg_response_time": avg_response_time
                }
        
        return health_status


# Global API manager instance
cross_service_api_manager = None

def get_cross_service_api_manager() -> CrossServiceAPIManager:
    """Get global cross-service API manager instance"""
    global cross_service_api_manager
    if cross_service_api_manager is None:
        cross_service_api_manager = CrossServiceAPIManager()
    return cross_service_api_manager


# Convenience functions
async def call_codai_service(service: str, path: str, method: str, auth_token: str, **kwargs) -> APIResponse:
    """Call a Codai service API"""
    manager = get_cross_service_api_manager()
    return await manager.call_service_api(service, path, APIMethod(method.upper()), auth_token, **kwargs)

def create_codai_workflow(name: str, description: str, steps: List[Dict[str, Any]]) -> CrossServiceWorkflow:
    """Create a cross-service workflow"""
    manager = get_cross_service_api_manager()
    return manager.create_workflow(name, description, steps)

async def execute_codai_workflow(workflow: CrossServiceWorkflow, auth_tokens: Dict[str, str], context: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a cross-service workflow"""
    manager = get_cross_service_api_manager()
    return await manager.execute_workflow(workflow, auth_tokens, context)


# Example usage
if __name__ == "__main__":
    async def test_cross_service_apis():
        """Test cross-service API integration"""
        print("🌐 Testing Cross-Service API Integration")
        
        manager = get_cross_service_api_manager()
        
        # Create a sample workflow
        workflow_steps = [
            {
                "id": "get_user_profile",
                "service": "identity",
                "operation": "api_call",
                "path": "/users/profile",
                "method": "GET",
                "data": {}
            },
            {
                "id": "store_memory",
                "service": "memorai",
                "operation": "api_call", 
                "path": "/memory/store",
                "method": "POST",
                "data": {
                    "content": "User profile accessed",
                    "context": "${user_profile}"
                }
            },
            {
                "id": "ai_analysis",
                "service": "romai",
                "operation": "api_call",
                "path": "/inference/reasoning",
                "method": "POST",
                "data": {
                    "query": "Analyze user profile: ${user_profile}",
                    "reasoning_type": "profile_analysis"
                }
            }
        ]
        
        workflow = manager.create_workflow(
            name="User Profile Analysis Workflow",
            description="Analyze user profile using AI and store insights",
            steps=workflow_steps
        )
        
        print(f"✅ Created workflow: {workflow.workflow_id}")
        
        # Test single API call (mock)
        mock_auth_token = "mock_token_123"
        response = await manager.call_service_api(
            service="identity",
            path="/users/profile", 
            method=APIMethod.GET,
            auth_token=mock_auth_token
        )
        
        print(f"✅ API call completed: {response.success}")
        print(f"📊 API Metrics: {manager.get_api_metrics()}")
    
    # Run test
    asyncio.run(test_cross_service_apis())