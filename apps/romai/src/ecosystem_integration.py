"""
Complete Codai Ecosystem Integration System
Deep integration with all Codai services for unified AGI experience
"""

import asyncio
import aiohttp
import jwt
from typing import Dict, List, Optional, Any, Union, Callable
import logging
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import json
import hashlib
import os
from pathlib import Path

logger = logging.getLogger(__name__)

class ServiceType(Enum):
    """Types of Codai services"""
    IDENTITY = "identity"           # ID Service - Authentication & Authorization
    HUB = "hub"                    # Hub Service - Central Coordination
    GATEWAY = "gateway"            # Gateway Service - API Orchestration
    MEMORAI = "memorai"            # MemorAI - AI Memory & Database
    BANCAI = "bancai"              # BancAI - Financial Services
    ROMAI = "romai"                # RomAI - AGI/ML Backend
    ADMIN = "admin"                # Admin Service - Administration
    EXPLORER = "explorer"          # Explorer - Blockchain Explorer
    CONTROLAI = "controlai"        # ControlAI Dashboard - AI Control Center
    KODEX = "kodex"                # Kodex - Code Analysis & Documentation
    CONVERSAI = "conversai"        # ConversAI - Conversation AI
    DOCS = "docs"                  # Documentation Service
    WALLET = "wallet"              # Wallet Service

class IntegrationType(Enum):
    """Types of service integration"""
    API_GATEWAY = "api_gateway"
    DIRECT_API = "direct_api"
    WEBSOCKET = "websocket"
    EVENT_STREAM = "event_stream"
    MESSAGE_QUEUE = "message_queue"

@dataclass
class ServiceConfig:
    """Configuration for a Codai service"""
    name: str
    service_type: ServiceType
    base_url: str
    port: int
    health_endpoint: str = "/health"
    api_prefix: str = "/api"
    auth_required: bool = True
    integration_types: List[IntegrationType] = None
    capabilities: List[str] = None

@dataclass
class UnifiedUserContext:
    """Unified user context across all services"""
    user_id: str
    session_id: str
    auth_token: str
    permissions: List[str]
    service_tokens: Dict[str, str]
    preferences: Dict[str, Any]
    active_services: List[ServiceType]
    context_data: Dict[str, Any]
    created_at: datetime
    last_updated: datetime

@dataclass
class CrossServiceRequest:
    """Request that spans multiple services"""
    request_id: str
    user_context: UnifiedUserContext
    source_service: ServiceType
    target_services: List[ServiceType]
    operation: str
    payload: Dict[str, Any]
    response_format: str = "json"
    timeout: int = 30

@dataclass
class ServiceResponse:
    """Response from a service"""
    service_type: ServiceType
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None
    response_time_ms: float = 0.0
    metadata: Dict[str, Any] = None

class UnifiedAuthenticationManager:
    """Manages unified authentication across all services"""
    
    def __init__(self, jwt_secret: str = "codai_ecosystem_jwt_2025"):
        self.jwt_secret = jwt_secret
        self.service_tokens = {}
        self.user_sessions = {}
    
    async def create_unified_session(self, user_credentials: Dict[str, str]) -> UnifiedUserContext:
        """Create a unified user session across all services"""
        try:
            # Authenticate with Identity Service
            auth_result = await self._authenticate_with_identity_service(user_credentials)
            
            if not auth_result.get("success"):
                raise Exception(f"Authentication failed: {auth_result.get('error')}")
            
            user_id = auth_result["user_id"]
            session_id = self._generate_session_id(user_id)
            
            # Generate unified JWT token
            auth_token = self._generate_jwt_token(user_id, session_id)
            
            # Get user permissions from Identity Service
            permissions = await self._get_user_permissions(user_id, auth_token)
            
            # Generate service-specific tokens
            service_tokens = await self._generate_service_tokens(user_id, permissions)
            
            # Get user preferences from MemorAI
            preferences = await self._get_user_preferences(user_id, service_tokens.get("memorai"))
            
            # Create unified context
            context = UnifiedUserContext(
                user_id=user_id,
                session_id=session_id,
                auth_token=auth_token,
                permissions=permissions,
                service_tokens=service_tokens,
                preferences=preferences,
                active_services=[],
                context_data={},
                created_at=datetime.utcnow(),
                last_updated=datetime.utcnow()
            )
            
            # Store session
            self.user_sessions[session_id] = context
            
            logger.info(f"✅ Unified session created for user {user_id}")
            return context
            
        except Exception as e:
            logger.error(f"Failed to create unified session: {e}")
            raise
    
    async def _authenticate_with_identity_service(self, credentials: Dict[str, str]) -> Dict[str, Any]:
        """Authenticate user with Identity Service"""
        # Mock implementation - replace with actual Identity Service API call
        return {
            "success": True,
            "user_id": "unified_user_123",
            "email": credentials.get("email", "user@codai.com"),
            "roles": ["user", "developer"]
        }
    
    async def _get_user_permissions(self, user_id: str, auth_token: str) -> List[str]:
        """Get user permissions from Identity Service"""
        # Mock implementation
        return [
            "codai:read", "codai:write",
            "memorai:read", "memorai:write",
            "bancai:read", "bancai:transaction",
            "romai:inference", "romai:training",
            "admin:read", "controlai:monitor"
        ]
    
    async def _generate_service_tokens(self, user_id: str, permissions: List[str]) -> Dict[str, str]:
        """Generate service-specific authentication tokens"""
        tokens = {}
        
        for service_type in ServiceType:
            service_permissions = [p for p in permissions if p.startswith(f"{service_type.value}:")]
            if service_permissions:
                token = self._generate_service_jwt(user_id, service_type.value, service_permissions)
                tokens[service_type.value] = token
        
        return tokens
    
    async def _get_user_preferences(self, user_id: str, memorai_token: str) -> Dict[str, Any]:
        """Get user preferences from MemorAI"""
        # Mock implementation - replace with actual MemorAI API call
        return {
            "theme": "dark",
            "language": "en",
            "ai_assistance_level": "advanced",
            "notification_preferences": {
                "email": True,
                "push": False,
                "sms": False
            },
            "service_integrations": {
                "romai": {"auto_optimize": True},
                "bancai": {"auto_categorize": True},
                "memorai": {"auto_backup": True}
            }
        }
    
    def _generate_session_id(self, user_id: str) -> str:
        """Generate unique session ID"""
        timestamp = str(int(datetime.utcnow().timestamp()))
        return hashlib.sha256(f"{user_id}_{timestamp}".encode()).hexdigest()[:16]
    
    def _generate_jwt_token(self, user_id: str, session_id: str, expires_hours: int = 24) -> str:
        """Generate JWT token for unified authentication"""
        payload = {
            "user_id": user_id,
            "session_id": session_id,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=expires_hours),
            "iss": "codai_ecosystem",
            "aud": "all_services"
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    
    def _generate_service_jwt(self, user_id: str, service: str, permissions: List[str]) -> str:
        """Generate service-specific JWT token"""
        payload = {
            "user_id": user_id,
            "service": service,
            "permissions": permissions,
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=24),
            "iss": "codai_ecosystem",
            "aud": service
        }
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")

class ServiceRegistry:
    """Registry of all Codai services with their configurations"""
    
    def __init__(self):
        self.services = self._initialize_service_configs()
        self.health_status = {}
        self.service_capabilities = {}
    
    def _initialize_service_configs(self) -> Dict[ServiceType, ServiceConfig]:
        """Initialize configurations for all Codai services"""
        return {
            ServiceType.IDENTITY: ServiceConfig(
                name="Identity Service",
                service_type=ServiceType.IDENTITY,
                base_url="http://localhost:4100",
                port=4100,
                health_endpoint="/api/health",
                auth_required=False,  # Identity service handles auth
                capabilities=["authentication", "authorization", "user_management"]
            ),
            ServiceType.HUB: ServiceConfig(
                name="Hub Service",
                service_type=ServiceType.HUB,
                base_url="http://localhost:4110",
                port=4110,
                capabilities=["service_discovery", "load_balancing", "health_monitoring"]
            ),
            ServiceType.GATEWAY: ServiceConfig(
                name="Gateway Service",
                service_type=ServiceType.GATEWAY,
                base_url="http://localhost:4010",
                port=4010,
                capabilities=["api_routing", "rate_limiting", "request_transformation"]
            ),
            ServiceType.MEMORAI: ServiceConfig(
                name="MemorAI Service",
                service_type=ServiceType.MEMORAI,
                base_url="http://localhost:4006",
                port=4006,
                capabilities=["memory_storage", "context_management", "ai_memory", "graphql_api"]
            ),
            ServiceType.BANCAI: ServiceConfig(
                name="BancAI Service",
                service_type=ServiceType.BANCAI,
                base_url="http://localhost:4120",
                port=4120,
                capabilities=["financial_services", "payment_processing", "transaction_analysis"]
            ),
            ServiceType.ROMAI: ServiceConfig(
                name="RomAI AGI Service",
                service_type=ServiceType.ROMAI,
                base_url="http://localhost:6101",
                port=6101,
                capabilities=["agi_inference", "ml_training", "reasoning", "consciousness", "romanian_processing"]
            ),
            ServiceType.ADMIN: ServiceConfig(
                name="Admin Service",
                service_type=ServiceType.ADMIN,
                base_url="http://localhost:4007",
                port=4007,
                capabilities=["system_administration", "user_management", "analytics", "monitoring"]
            ),
            ServiceType.EXPLORER: ServiceConfig(
                name="Explorer Service",
                service_type=ServiceType.EXPLORER,
                base_url="http://localhost:4400",
                port=4400,
                capabilities=["blockchain_exploration", "transaction_analysis", "data_visualization"]
            ),
            ServiceType.CONTROLAI: ServiceConfig(
                name="ControlAI Dashboard",
                service_type=ServiceType.CONTROLAI,
                base_url="http://localhost:4200",
                port=4200,
                capabilities=["ai_control", "model_monitoring", "performance_tracking", "ai_orchestration"]
            ),
            ServiceType.KODEX: ServiceConfig(
                name="Kodex Service",
                service_type=ServiceType.KODEX,
                base_url="http://localhost:5000",
                port=5000,
                capabilities=["code_analysis", "documentation_generation", "code_quality", "refactoring"]
            )
        }
    
    def get_service_config(self, service_type: ServiceType) -> ServiceConfig:
        """Get configuration for a specific service"""
        return self.services.get(service_type)
    
    def get_services_by_capability(self, capability: str) -> List[ServiceConfig]:
        """Get all services that have a specific capability"""
        return [
            config for config in self.services.values()
            if config.capabilities and capability in config.capabilities
        ]

class CrossServiceDataManager:
    """Manages data sharing and synchronization across services"""
    
    def __init__(self, auth_manager: UnifiedAuthenticationManager):
        self.auth_manager = auth_manager
        self.data_cache = {}
        self.sync_strategies = {}
    
    async def share_context_across_services(self, 
                                          user_context: UnifiedUserContext,
                                          source_data: Dict[str, Any],
                                          target_services: List[ServiceType]) -> Dict[ServiceType, ServiceResponse]:
        """Share context data across multiple services"""
        responses = {}
        
        for service_type in target_services:
            try:
                response = await self._send_context_to_service(
                    service_type, user_context, source_data
                )
                responses[service_type] = response
                
            except Exception as e:
                logger.error(f"Failed to share context with {service_type.value}: {e}")
                responses[service_type] = ServiceResponse(
                    service_type=service_type,
                    success=False,
                    data={},
                    error=str(e)
                )
        
        return responses
    
    async def _send_context_to_service(self, 
                                     service_type: ServiceType,
                                     user_context: UnifiedUserContext,
                                     data: Dict[str, Any]) -> ServiceResponse:
        """Send context data to a specific service"""
        service_registry = ServiceRegistry()
        config = service_registry.get_service_config(service_type)
        
        if not config:
            raise Exception(f"Service configuration not found for {service_type.value}")
        
        # Prepare service-specific payload
        payload = self._prepare_service_payload(service_type, data)
        
        # Get service token
        service_token = user_context.service_tokens.get(service_type.value)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {service_token}",
            "X-User-ID": user_context.user_id,
            "X-Session-ID": user_context.session_id
        }
        
        start_time = asyncio.get_event_loop().time()
        
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{config.base_url}{config.api_prefix}/context",
                    json=payload,
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    response_data = await response.json()
                    response_time = (asyncio.get_event_loop().time() - start_time) * 1000
                    
                    return ServiceResponse(
                        service_type=service_type,
                        success=response.status == 200,
                        data=response_data,
                        response_time_ms=response_time,
                        metadata={"status_code": response.status}
                    )
                    
        except Exception as e:
            response_time = (asyncio.get_event_loop().time() - start_time) * 1000
            return ServiceResponse(
                service_type=service_type,
                success=False,
                data={},
                error=str(e),
                response_time_ms=response_time
            )
    
    def _prepare_service_payload(self, service_type: ServiceType, data: Dict[str, Any]) -> Dict[str, Any]:
        """Prepare service-specific payload"""
        base_payload = {
            "timestamp": datetime.utcnow().isoformat(),
            "source": "romai_agi",
            "data": data
        }
        
        # Service-specific payload customization
        if service_type == ServiceType.MEMORAI:
            base_payload["operation"] = "context_update"
            base_payload["memory_type"] = "user_context"
            
        elif service_type == ServiceType.BANCAI:
            base_payload["operation"] = "profile_update"
            base_payload["financial_context"] = True
            
        elif service_type == ServiceType.CONTROLAI:
            base_payload["operation"] = "ai_context_sync"
            base_payload["monitoring_enabled"] = True
        
        return base_payload

class AIOrchestrationEngine:
    """Orchestrates AI-powered features across the entire platform"""
    
    def __init__(self, 
                 auth_manager: UnifiedAuthenticationManager,
                 data_manager: CrossServiceDataManager):
        self.auth_manager = auth_manager
        self.data_manager = data_manager
        self.orchestration_strategies = {}
        self.active_workflows = {}
    
    async def orchestrate_cross_service_ai_workflow(self,
                                                   user_context: UnifiedUserContext,
                                                   workflow_type: str,
                                                   input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Orchestrate AI workflow across multiple services"""
        workflow_id = f"{workflow_type}_{user_context.session_id}_{int(datetime.utcnow().timestamp())}"
        
        try:
            logger.info(f"🚀 Starting cross-service AI workflow: {workflow_type}")
            
            # Select appropriate workflow strategy
            if workflow_type == "intelligent_financial_analysis":
                return await self._orchestrate_financial_analysis(user_context, input_data, workflow_id)
            
            elif workflow_type == "comprehensive_code_analysis":
                return await self._orchestrate_code_analysis(user_context, input_data, workflow_id)
            
            elif workflow_type == "unified_memory_intelligence":
                return await self._orchestrate_memory_intelligence(user_context, input_data, workflow_id)
            
            elif workflow_type == "multi_service_reasoning":
                return await self._orchestrate_multi_service_reasoning(user_context, input_data, workflow_id)
            
            else:
                raise Exception(f"Unknown workflow type: {workflow_type}")
                
        except Exception as e:
            logger.error(f"AI workflow orchestration failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "workflow_id": workflow_id
            }
    
    async def _orchestrate_financial_analysis(self,
                                            user_context: UnifiedUserContext,
                                            input_data: Dict[str, Any],
                                            workflow_id: str) -> Dict[str, Any]:
        """Orchestrate intelligent financial analysis across BancAI and RomAI"""
        
        # Step 1: Get financial data from BancAI
        bancai_response = await self._call_service_api(
            ServiceType.BANCAI, user_context, "GET", "/api/financial/analysis", input_data
        )
        
        # Step 2: Enhance with RomAI intelligence
        romai_input = {
            "financial_data": bancai_response.data if bancai_response.success else {},
            "analysis_type": "comprehensive_financial_intelligence",
            "romanian_context": user_context.preferences.get("romanian_context", False)
        }
        
        romai_response = await self._call_service_api(
            ServiceType.ROMAI, user_context, "POST", "/api/v1/reasoning/financial", romai_input
        )
        
        # Step 3: Store insights in MemorAI
        memorai_input = {
            "user_id": user_context.user_id,
            "analysis_results": romai_response.data if romai_response.success else {},
            "context_type": "financial_intelligence"
        }
        
        memorai_response = await self._call_service_api(
            ServiceType.MEMORAI, user_context, "POST", "/api/memory/store", memorai_input
        )
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "results": {
                "bancai_analysis": bancai_response.data if bancai_response.success else {},
                "romai_intelligence": romai_response.data if romai_response.success else {},
                "memory_stored": memorai_response.success
            },
            "performance": {
                "bancai_response_time": bancai_response.response_time_ms,
                "romai_response_time": romai_response.response_time_ms,
                "memorai_response_time": memorai_response.response_time_ms
            }
        }
    
    async def _orchestrate_code_analysis(self,
                                       user_context: UnifiedUserContext,
                                       input_data: Dict[str, Any],
                                       workflow_id: str) -> Dict[str, Any]:
        """Orchestrate comprehensive code analysis across Kodex and RomAI"""
        
        # Step 1: Perform code analysis with Kodex
        kodex_response = await self._call_service_api(
            ServiceType.KODEX, user_context, "POST", "/api/analysis/comprehensive", input_data
        )
        
        # Step 2: Enhance with RomAI reasoning
        romai_input = {
            "code_analysis": kodex_response.data if kodex_response.success else {},
            "reasoning_type": "code_quality_intelligence",
            "optimization_suggestions": True
        }
        
        romai_response = await self._call_service_api(
            ServiceType.ROMAI, user_context, "POST", "/api/v1/reasoning/code", romai_input
        )
        
        # Step 3: Update ControlAI dashboard
        controlai_input = {
            "analysis_id": workflow_id,
            "code_metrics": romai_response.data if romai_response.success else {},
            "dashboard_update": True
        }
        
        controlai_response = await self._call_service_api(
            ServiceType.CONTROLAI, user_context, "POST", "/api/metrics/update", controlai_input
        )
        
        return {
            "success": True,
            "workflow_id": workflow_id,
            "results": {
                "kodex_analysis": kodex_response.data if kodex_response.success else {},
                "romai_enhancements": romai_response.data if romai_response.success else {},
                "controlai_updated": controlai_response.success
            }
        }
    
    async def _call_service_api(self,
                              service_type: ServiceType,
                              user_context: UnifiedUserContext,
                              method: str,
                              endpoint: str,
                              data: Dict[str, Any]) -> ServiceResponse:
        """Call API on a specific service"""
        service_registry = ServiceRegistry()
        config = service_registry.get_service_config(service_type)
        
        if not config:
            return ServiceResponse(
                service_type=service_type,
                success=False,
                data={},
                error=f"Service configuration not found for {service_type.value}"
            )
        
        service_token = user_context.service_tokens.get(service_type.value)
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {service_token}",
            "X-User-ID": user_context.user_id,
            "X-Session-ID": user_context.session_id
        }
        
        url = f"{config.base_url}{endpoint}"
        start_time = asyncio.get_event_loop().time()
        
        try:
            async with aiohttp.ClientSession() as session:
                if method.upper() == "GET":
                    async with session.get(url, headers=headers, params=data) as response:
                        response_data = await response.json()
                else:
                    async with session.request(method.upper(), url, json=data, headers=headers) as response:
                        response_data = await response.json()
                
                response_time = (asyncio.get_event_loop().time() - start_time) * 1000
                
                return ServiceResponse(
                    service_type=service_type,
                    success=response.status == 200,
                    data=response_data,
                    response_time_ms=response_time,
                    metadata={"status_code": response.status, "url": url}
                )
                
        except Exception as e:
            response_time = (asyncio.get_event_loop().time() - start_time) * 1000
            return ServiceResponse(
                service_type=service_type,
                success=False,
                data={},
                error=str(e),
                response_time_ms=response_time
            )

class EcosystemIntegrationOrchestrator:
    """
    Main orchestrator for complete Codai ecosystem integration
    
    Features:
    - Unified authentication across all services
    - Cross-service data sharing and synchronization
    - AI-powered workflows spanning multiple services
    - Real-time service health monitoring
    - Intelligent load balancing and failover
    - Event-driven service communication
    """
    
    def __init__(self):
        self.auth_manager = UnifiedAuthenticationManager()
        self.service_registry = ServiceRegistry()
        self.data_manager = CrossServiceDataManager(self.auth_manager)
        self.ai_orchestrator = AIOrchestrationEngine(self.auth_manager, self.data_manager)
        self.health_monitor = ServiceHealthMonitor(self.service_registry)
        
        self.active_sessions = {}
        self.cross_service_workflows = {}
        self.integration_metrics = {
            "total_requests": 0,
            "successful_integrations": 0,
            "failed_integrations": 0,
            "average_response_time": 0.0
        }
        
        logger.info("🌟 Codai Ecosystem Integration Orchestrator initialized")
    
    async def initialize_unified_session(self, credentials: Dict[str, str]) -> UnifiedUserContext:
        """Initialize a unified user session across all Codai services"""
        try:
            # Create unified session
            user_context = await self.auth_manager.create_unified_session(credentials)
            
            # Test connectivity to all services
            connectivity_results = await self.health_monitor.test_all_services_connectivity(user_context)
            
            # Update user context with available services
            available_services = [
                service_type for service_type, result in connectivity_results.items()
                if result["available"]
            ]
            user_context.active_services = available_services
            
            # Store session
            self.active_sessions[user_context.session_id] = user_context
            
            logger.info(f"✅ Unified session initialized with {len(available_services)} active services")
            return user_context
            
        except Exception as e:
            logger.error(f"Failed to initialize unified session: {e}")
            raise
    
    async def execute_cross_service_workflow(self,
                                           session_id: str,
                                           workflow_type: str,
                                           input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a workflow that spans multiple Codai services"""
        user_context = self.active_sessions.get(session_id)
        if not user_context:
            raise Exception("Invalid session ID")
        
        self.integration_metrics["total_requests"] += 1
        start_time = asyncio.get_event_loop().time()
        
        try:
            # Execute AI-powered cross-service workflow
            result = await self.ai_orchestrator.orchestrate_cross_service_ai_workflow(
                user_context, workflow_type, input_data
            )
            
            # Calculate performance metrics
            execution_time = (asyncio.get_event_loop().time() - start_time) * 1000
            self.integration_metrics["average_response_time"] = (
                (self.integration_metrics["average_response_time"] + execution_time) / 2
            )
            
            if result.get("success"):
                self.integration_metrics["successful_integrations"] += 1
            else:
                self.integration_metrics["failed_integrations"] += 1
            
            return result
            
        except Exception as e:
            self.integration_metrics["failed_integrations"] += 1
            logger.error(f"Cross-service workflow failed: {e}")
            raise
    
    async def get_ecosystem_status(self) -> Dict[str, Any]:
        """Get comprehensive status of the entire Codai ecosystem"""
        
        # Get service health status
        service_health = await self.health_monitor.get_all_services_health()
        
        # Calculate ecosystem health score
        healthy_services = sum(1 for status in service_health.values() if status["healthy"])
        total_services = len(service_health)
        health_score = (healthy_services / total_services) * 100 if total_services > 0 else 0
        
        return {
            "ecosystem_health": {
                "overall_score": health_score,
                "healthy_services": healthy_services,
                "total_services": total_services,
                "services": service_health
            },
            "active_sessions": len(self.active_sessions),
            "integration_metrics": self.integration_metrics,
            "capabilities": {
                "unified_authentication": True,
                "cross_service_workflows": True,
                "ai_orchestration": True,
                "real_time_monitoring": True,
                "intelligent_routing": True
            },
            "timestamp": datetime.utcnow().isoformat()
        }

class ServiceHealthMonitor:
    """Monitors health and availability of all Codai services"""
    
    def __init__(self, service_registry: ServiceRegistry):
        self.service_registry = service_registry
        self.health_cache = {}
        self.last_health_check = {}
    
    async def get_all_services_health(self) -> Dict[ServiceType, Dict[str, Any]]:
        """Get health status of all services"""
        health_results = {}
        
        for service_type, config in self.service_registry.services.items():
            health_results[service_type] = await self._check_service_health(config)
        
        return health_results
    
    async def test_all_services_connectivity(self, user_context: UnifiedUserContext) -> Dict[ServiceType, Dict[str, Any]]:
        """Test connectivity to all services with user authentication"""
        connectivity_results = {}
        
        for service_type, config in self.service_registry.services.items():
            connectivity_results[service_type] = await self._test_service_connectivity(config, user_context)
        
        return connectivity_results
    
    async def _check_service_health(self, config: ServiceConfig) -> Dict[str, Any]:
        """Check health of a specific service"""
        try:
            start_time = asyncio.get_event_loop().time()
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{config.base_url}{config.health_endpoint}",
                    timeout=aiohttp.ClientTimeout(total=10)
                ) as response:
                    response_time = (asyncio.get_event_loop().time() - start_time) * 1000
                    
                    return {
                        "healthy": response.status == 200,
                        "status_code": response.status,
                        "response_time_ms": response_time,
                        "last_check": datetime.utcnow().isoformat()
                    }
                    
        except Exception as e:
            return {
                "healthy": False,
                "error": str(e),
                "response_time_ms": 0,
                "last_check": datetime.utcnow().isoformat()
            }
    
    async def _test_service_connectivity(self, 
                                       config: ServiceConfig, 
                                       user_context: UnifiedUserContext) -> Dict[str, Any]:
        """Test connectivity to a service with user authentication"""
        try:
            service_token = user_context.service_tokens.get(config.service_type.value)
            
            headers = {}
            if config.auth_required and service_token:
                headers["Authorization"] = f"Bearer {service_token}"
            
            async with aiohttp.ClientSession() as session:
                async with session.get(
                    f"{config.base_url}{config.health_endpoint}",
                    headers=headers,
                    timeout=aiohttp.ClientTimeout(total=5)
                ) as response:
                    return {
                        "available": response.status == 200,
                        "authenticated": config.auth_required and service_token is not None,
                        "capabilities": config.capabilities or []
                    }
                    
        except Exception as e:
            return {
                "available": False,
                "authenticated": False,
                "error": str(e),
                "capabilities": []
            }


# Global orchestrator instance
ecosystem_orchestrator = None

def get_ecosystem_orchestrator() -> EcosystemIntegrationOrchestrator:
    """Get global ecosystem orchestrator instance"""
    global ecosystem_orchestrator
    if ecosystem_orchestrator is None:
        ecosystem_orchestrator = EcosystemIntegrationOrchestrator()
    return ecosystem_orchestrator


# Convenience functions for ecosystem integration
async def initialize_codai_session(credentials: Dict[str, str]) -> UnifiedUserContext:
    """Initialize a unified Codai ecosystem session"""
    orchestrator = get_ecosystem_orchestrator()
    return await orchestrator.initialize_unified_session(credentials)

async def execute_ai_workflow(session_id: str, workflow_type: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Execute AI-powered workflow across Codai services"""
    orchestrator = get_ecosystem_orchestrator()
    return await orchestrator.execute_cross_service_workflow(session_id, workflow_type, data)

async def get_codai_ecosystem_status() -> Dict[str, Any]:
    """Get comprehensive Codai ecosystem status"""
    orchestrator = get_ecosystem_orchestrator()
    return await orchestrator.get_ecosystem_status()


# Example usage and testing
if __name__ == "__main__":
    async def test_ecosystem_integration():
        """Test the complete ecosystem integration"""
        print("🚀 Testing Codai Ecosystem Integration")
        
        # Initialize session
        credentials = {"email": "test@codai.com", "password": "secure_password"}
        user_context = await initialize_codai_session(credentials)
        print(f"✅ Session initialized: {user_context.session_id}")
        
        # Test cross-service workflow
        workflow_result = await execute_ai_workflow(
            user_context.session_id,
            "multi_service_reasoning",
            {"query": "Analyze my financial patterns using AI"}
        )
        print(f"✅ Workflow executed: {workflow_result.get('success')}")
        
        # Get ecosystem status
        status = await get_codai_ecosystem_status()
        print(f"✅ Ecosystem health: {status['ecosystem_health']['overall_score']}%")
    
    # Run test
    asyncio.run(test_ecosystem_integration())