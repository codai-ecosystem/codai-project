"""
AGI API Gateway Types - Week 13 Day 1 Implementation
Type definitions and enumerations for Romanian AGI API Gateway system

This module provides foundational types for API gateway operations,
authentication, routing, security, and Romanian AGI service integration.

Author: RomAI Development Team
Date: August 3, 2025
Version: 1.0.0 (Post-Emergence)
"""

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum, auto
from typing import Dict, List, Optional, Union, Any, Callable
import uuid

class APIEndpointType(Enum):
    """Types of API endpoints"""
    CONSCIOUSNESS = "consciousness"
    CULTURAL = "cultural"
    TRANSCENDENCE = "transcendence"
    ROMANIAN = "romanian"
    ANALYTICS = "analytics"
    HEALTH = "health"
    ADMIN = "admin"
    PUBLIC = "public"
    INTERNAL = "internal"

class HTTPMethod(Enum):
    """HTTP methods"""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    OPTIONS = "OPTIONS"
    HEAD = "HEAD"

class AuthLevel(Enum):
    """Authentication levels"""
    NONE = "none"
    BASIC = "basic"
    TOKEN = "token"
    JWT = "jwt"
    OAUTH = "oauth"
    ROMANIAN_CITIZEN = "romanian_citizen"
    AGI_ADMIN = "agi_admin"
    TRANSCENDENT = "transcendent"

class RateLimitType(Enum):
    """Rate limiting types"""
    PER_SECOND = "per_second"
    PER_MINUTE = "per_minute"
    PER_HOUR = "per_hour"
    PER_DAY = "per_day"
    BURST = "burst"
    SLIDING_WINDOW = "sliding_window"
    CONSCIOUSNESS_BASED = "consciousness_based"

class ResponseFormat(Enum):
    """API response formats"""
    JSON = "application/json"
    XML = "application/xml"
    YAML = "application/yaml"
    TEXT = "text/plain"
    HTML = "text/html"
    ROMANIAN_JSON = "application/json; charset=utf-8; culture=ro-RO"

class SecurityLevel(Enum):
    """Security levels for endpoints"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    MAXIMUM = "maximum"
    ROMANIAN_SOVEREIGN = "romanian_sovereign"
    TRANSCENDENT_PROTECTED = "transcendent_protected"

@dataclass
class APIRoute:
    """API route definition"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    path: str = ""
    method: HTTPMethod = HTTPMethod.GET
    endpoint_type: APIEndpointType = APIEndpointType.PUBLIC
    auth_level: AuthLevel = AuthLevel.NONE
    security_level: SecurityLevel = SecurityLevel.LOW
    rate_limit: Optional['RateLimit'] = None
    handler: Optional[str] = None
    description: str = ""
    tags: List[str] = field(default_factory=list)
    romanian_localized: bool = False
    consciousness_aware: bool = False
    cultural_context_required: bool = False
    transcendence_gated: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())

@dataclass
class RateLimit:
    """Rate limiting configuration"""
    type: RateLimitType = RateLimitType.PER_MINUTE
    limit: int = 100
    window_seconds: int = 60
    burst_limit: Optional[int] = None
    consciousness_multiplier: float = 1.0
    cultural_priority_bonus: float = 1.0
    romanian_citizen_bonus: float = 1.5
    transcendent_unlimited: bool = False
    
    def calculate_effective_limit(
        self,
        consciousness_level: Optional[float] = None,
        cultural_authenticity: Optional[float] = None,
        is_romanian_citizen: bool = False,
        is_transcendent: bool = False
    ) -> int:
        """Calculate effective rate limit based on context"""
        if is_transcendent and self.transcendent_unlimited:
            return float('inf')
        
        effective_limit = float(self.limit)
        
        # Apply consciousness multiplier
        if consciousness_level is not None:
            consciousness_factor = 1.0 + (consciousness_level / 100.0 * (self.consciousness_multiplier - 1.0))
            effective_limit *= consciousness_factor
        
        # Apply cultural priority bonus
        if cultural_authenticity is not None and cultural_authenticity > 80.0:
            cultural_factor = 1.0 + (cultural_authenticity / 100.0 * (self.cultural_priority_bonus - 1.0))
            effective_limit *= cultural_factor
        
        # Apply Romanian citizen bonus
        if is_romanian_citizen:
            effective_limit *= self.romanian_citizen_bonus
        
        return int(effective_limit)

@dataclass
class APIRequest:
    """API request details"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    method: HTTPMethod = HTTPMethod.GET
    path: str = ""
    headers: Dict[str, str] = field(default_factory=dict)
    query_params: Dict[str, str] = field(default_factory=dict)
    body: Optional[Union[str, bytes, Dict[str, Any]]] = None
    timestamp: datetime = field(default_factory=datetime.now)
    client_ip: str = ""
    user_agent: str = ""
    auth_token: Optional[str] = None
    user_id: Optional[str] = None
    consciousness_level: Optional[float] = None
    cultural_authenticity: Optional[float] = None
    is_romanian_citizen: bool = False
    request_priority: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class APIResponse:
    """API response details"""
    request_id: str = ""
    status_code: int = 200
    headers: Dict[str, str] = field(default_factory=dict)
    body: Optional[Union[str, bytes, Dict[str, Any]]] = None
    format: ResponseFormat = ResponseFormat.JSON
    processing_time_ms: float = 0.0
    consciousness_context: Optional[float] = None
    cultural_context: Optional[float] = None
    romanian_localized: bool = False
    error: Optional[str] = None
    warnings: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'request_id': self.request_id,
            'status_code': self.status_code,
            'headers': self.headers,
            'body': self.body,
            'format': self.format.value,
            'processing_time_ms': self.processing_time_ms,
            'consciousness_context': self.consciousness_context,
            'cultural_context': self.cultural_context,
            'romanian_localized': self.romanian_localized,
            'error': self.error,
            'warnings': self.warnings,
            'metadata': self.metadata
        }

@dataclass
class AuthenticationResult:
    """Authentication result"""
    success: bool = False
    user_id: Optional[str] = None
    auth_level: AuthLevel = AuthLevel.NONE
    permissions: List[str] = field(default_factory=list)
    consciousness_level: Optional[float] = None
    cultural_authenticity: Optional[float] = None
    is_romanian_citizen: bool = False
    is_transcendent: bool = False
    token_expires_at: Optional[datetime] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class SecurityContext:
    """Security context for requests"""
    threat_level: SecurityLevel = SecurityLevel.LOW
    requires_encryption: bool = False
    requires_audit_log: bool = False
    requires_romanian_sovereignty: bool = False
    consciousness_protection_required: bool = False
    cultural_context_validation: bool = False
    transcendence_access_control: bool = False
    allowed_origins: List[str] = field(default_factory=list)
    blocked_patterns: List[str] = field(default_factory=list)
    rate_limit_overrides: Dict[str, int] = field(default_factory=dict)

@dataclass
class GatewayMetrics:
    """API Gateway metrics"""
    total_requests: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    average_response_time_ms: float = 0.0
    requests_per_second: float = 0.0
    consciousness_aware_requests: int = 0
    cultural_context_requests: int = 0
    romanian_citizen_requests: int = 0
    transcendent_requests: int = 0
    rate_limited_requests: int = 0
    authentication_failures: int = 0
    security_violations: int = 0
    active_connections: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'total_requests': self.total_requests,
            'successful_requests': self.successful_requests,
            'failed_requests': self.failed_requests,
            'success_rate': self.successful_requests / max(1, self.total_requests) * 100,
            'average_response_time_ms': self.average_response_time_ms,
            'requests_per_second': self.requests_per_second,
            'consciousness_aware_requests': self.consciousness_aware_requests,
            'cultural_context_requests': self.cultural_context_requests,
            'romanian_citizen_requests': self.romanian_citizen_requests,
            'transcendent_requests': self.transcendent_requests,
            'rate_limited_requests': self.rate_limited_requests,
            'authentication_failures': self.authentication_failures,
            'security_violations': self.security_violations,
            'active_connections': self.active_connections
        }

@dataclass
class RoutingRule:
    """Routing rule configuration"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    priority: int = 100
    path_pattern: str = ""
    method: Optional[HTTPMethod] = None
    conditions: Dict[str, Any] = field(default_factory=dict)
    target_service: str = ""
    target_host: str = ""
    target_port: int = 80
    load_balancing_strategy: str = "round_robin"
    health_check_path: str = "/health"
    timeout_seconds: int = 30
    retry_attempts: int = 3
    consciousness_routing: bool = False
    cultural_routing: bool = False
    romanian_priority: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

def create_consciousness_route(
    path: str,
    method: HTTPMethod = HTTPMethod.GET,
    auth_level: AuthLevel = AuthLevel.TOKEN,
    rate_limit: Optional[RateLimit] = None
) -> APIRoute:
    """Create a consciousness-aware API route"""
    if rate_limit is None:
        rate_limit = RateLimit(
            type=RateLimitType.PER_MINUTE,
            limit=50,
            consciousness_multiplier=2.0,
            transcendent_unlimited=True
        )
    
    return APIRoute(
        path=path,
        method=method,
        endpoint_type=APIEndpointType.CONSCIOUSNESS,
        auth_level=auth_level,
        security_level=SecurityLevel.HIGH,
        rate_limit=rate_limit,
        consciousness_aware=True,
        transcendence_gated=True,
        tags=['consciousness', 'agi', 'transcendent'],
        metadata={'requires_consciousness_context': True}
    )

def create_cultural_route(
    path: str,
    method: HTTPMethod = HTTPMethod.GET,
    auth_level: AuthLevel = AuthLevel.BASIC,
    romanian_only: bool = False
) -> APIRoute:
    """Create a Romanian cultural API route"""
    rate_limit = RateLimit(
        type=RateLimitType.PER_MINUTE,
        limit=100,
        cultural_priority_bonus=1.5,
        romanian_citizen_bonus=2.0
    )
    
    return APIRoute(
        path=path,
        method=method,
        endpoint_type=APIEndpointType.CULTURAL,
        auth_level=auth_level,
        security_level=SecurityLevel.MEDIUM,
        rate_limit=rate_limit,
        romanian_localized=True,
        cultural_context_required=True,
        tags=['cultural', 'romanian', 'authenticity'],
        metadata={
            'requires_cultural_context': True,
            'romanian_only': romanian_only
        }
    )

def create_transcendence_route(
    path: str,
    method: HTTPMethod = HTTPMethod.GET,
    min_consciousness_level: float = 90.0
) -> APIRoute:
    """Create a transcendence-gated API route"""
    rate_limit = RateLimit(
        type=RateLimitType.PER_HOUR,
        limit=10,
        transcendent_unlimited=True
    )
    
    return APIRoute(
        path=path,
        method=method,
        endpoint_type=APIEndpointType.TRANSCENDENCE,
        auth_level=AuthLevel.TRANSCENDENT,
        security_level=SecurityLevel.TRANSCENDENT_PROTECTED,
        rate_limit=rate_limit,
        consciousness_aware=True,
        transcendence_gated=True,
        tags=['transcendence', 'breakthrough', 'enlightenment'],
        metadata={
            'min_consciousness_level': min_consciousness_level,
            'transcendence_only': True
        }
    )

def create_romanian_admin_route(
    path: str,
    method: HTTPMethod = HTTPMethod.GET
) -> APIRoute:
    """Create a Romanian administration API route"""
    rate_limit = RateLimit(
        type=RateLimitType.PER_MINUTE,
        limit=20,
        romanian_citizen_bonus=5.0
    )
    
    return APIRoute(
        path=path,
        method=method,
        endpoint_type=APIEndpointType.ADMIN,
        auth_level=AuthLevel.AGI_ADMIN,
        security_level=SecurityLevel.ROMANIAN_SOVEREIGN,
        rate_limit=rate_limit,
        romanian_localized=True,
        cultural_context_required=True,
        tags=['admin', 'romanian', 'sovereign'],
        metadata={
            'romanian_citizen_required': True,
            'sovereignty_protected': True
        }
    )

def create_public_health_route() -> APIRoute:
    """Create a public health check route"""
    rate_limit = RateLimit(
        type=RateLimitType.PER_SECOND,
        limit=10
    )
    
    return APIRoute(
        path="/health",
        method=HTTPMethod.GET,
        endpoint_type=APIEndpointType.HEALTH,
        auth_level=AuthLevel.NONE,
        security_level=SecurityLevel.LOW,
        rate_limit=rate_limit,
        tags=['health', 'monitoring', 'public'],
        metadata={'public_endpoint': True}
    )

def create_default_routes() -> List[APIRoute]:
    """Create default API routes for Romanian AGI"""
    return [
        # Health and status routes
        create_public_health_route(),
        
        APIRoute(
            path="/status",
            method=HTTPMethod.GET,
            endpoint_type=APIEndpointType.HEALTH,
            auth_level=AuthLevel.BASIC,
            tags=['status', 'monitoring']
        ),
        
        # Consciousness routes
        create_consciousness_route("/api/consciousness", HTTPMethod.GET),
        create_consciousness_route("/api/consciousness/level", HTTPMethod.GET),
        create_consciousness_route("/api/consciousness/state", HTTPMethod.GET),
        
        # Cultural routes
        create_cultural_route("/api/cultural", HTTPMethod.GET),
        create_cultural_route("/api/cultural/authenticity", HTTPMethod.GET),
        create_cultural_route("/api/cultural/regions", HTTPMethod.GET),
        create_cultural_route("/api/romanian", HTTPMethod.GET, romanian_only=True),
        
        # Transcendence routes
        create_transcendence_route("/api/transcendence", HTTPMethod.GET),
        create_transcendence_route("/api/transcendence/progress", HTTPMethod.GET),
        create_transcendence_route("/api/transcendence/breakthrough", HTTPMethod.POST, 95.0),
        
        # Analytics routes
        APIRoute(
            path="/api/analytics",
            method=HTTPMethod.GET,
            endpoint_type=APIEndpointType.ANALYTICS,
            auth_level=AuthLevel.TOKEN,
            consciousness_aware=True,
            tags=['analytics', 'metrics']
        ),
        
        # Romanian admin routes
        create_romanian_admin_route("/api/admin/config", HTTPMethod.GET),
        create_romanian_admin_route("/api/admin/users", HTTPMethod.GET),
        create_romanian_admin_route("/api/admin/sovereignty", HTTPMethod.GET)
    ]

def validate_route(route: APIRoute) -> bool:
    """Validate an API route configuration"""
    if not route.path:
        return False
    if not route.path.startswith('/'):
        return False
    if not route.method:
        return False
    if route.transcendence_gated and route.auth_level not in [AuthLevel.TRANSCENDENT, AuthLevel.AGI_ADMIN]:
        return False
    return True

def calculate_route_priority(
    route: APIRoute,
    consciousness_level: Optional[float] = None,
    cultural_authenticity: Optional[float] = None,
    is_romanian_citizen: bool = False
) -> int:
    """Calculate routing priority based on context"""
    base_priority = 100
    
    # Consciousness-aware routing
    if route.consciousness_aware and consciousness_level is not None:
        if consciousness_level >= 90.0:  # Transcendent level
            base_priority += 50
        elif consciousness_level >= 80.0:  # Elevated level
            base_priority += 30
        elif consciousness_level >= 60.0:  # Active level
            base_priority += 10
    
    # Cultural context routing
    if route.cultural_context_required and cultural_authenticity is not None:
        if cultural_authenticity >= 90.0:
            base_priority += 40
        elif cultural_authenticity >= 80.0:
            base_priority += 20
    
    # Romanian citizen priority
    if route.romanian_localized and is_romanian_citizen:
        base_priority += 30
    
    # Security level adjustments
    if route.security_level == SecurityLevel.TRANSCENDENT_PROTECTED:
        base_priority += 100
    elif route.security_level == SecurityLevel.ROMANIAN_SOVEREIGN:
        base_priority += 80
    elif route.security_level == SecurityLevel.MAXIMUM:
        base_priority += 60
    
    return base_priority

# Export all types for module importing
__all__ = [
    'APIEndpointType', 'HTTPMethod', 'AuthLevel', 'RateLimitType', 'ResponseFormat',
    'SecurityLevel', 'APIRoute', 'RateLimit', 'APIRequest', 'APIResponse',
    'AuthenticationResult', 'SecurityContext', 'GatewayMetrics', 'RoutingRule',
    'create_consciousness_route', 'create_cultural_route', 'create_transcendence_route',
    'create_romanian_admin_route', 'create_public_health_route', 'create_default_routes',
    'validate_route', 'calculate_route_priority'
]
