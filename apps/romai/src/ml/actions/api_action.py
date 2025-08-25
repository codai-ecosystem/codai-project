"""
API Action Controller Module

Specialized controller for API integration and external service interaction.
Provides comprehensive REST API handling, authentication management, request/response
processing, and service integration for RUAGA's action-taking capabilities.

Key Capabilities:
- REST API client with comprehensive error handling
- Multiple authentication methods (API key, OAuth, JWT)
- Request/response transformation and validation
- Rate limiting and retry logic
- Service integration templates
- API monitoring and performance tracking
"""

import time
import json
import logging
import asyncio
import aiohttp
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from urllib.parse import urljoin, urlparse
from abc import ABC, abstractmethod


logger = logging.getLogger(__name__)


class HTTPMethod(Enum):
    """HTTP methods for API requests."""
    GET = "GET"
    POST = "POST"
    PUT = "PUT"
    PATCH = "PATCH"
    DELETE = "DELETE"
    HEAD = "HEAD"
    OPTIONS = "OPTIONS"


class AuthType(Enum):
    """Authentication types for API requests."""
    NONE = "none"
    API_KEY = "api_key"
    BEARER_TOKEN = "bearer_token"
    BASIC_AUTH = "basic_auth"
    OAUTH2 = "oauth2"
    JWT = "jwt"
    CUSTOM_HEADER = "custom_header"


class ResponseFormat(Enum):
    """Expected response formats."""
    JSON = "json"
    XML = "xml"
    TEXT = "text"
    BINARY = "binary"
    HTML = "html"


class APIActionStatus(Enum):
    """Status of API action execution."""
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    AUTH_ERROR = "auth_error"
    RATE_LIMITED = "rate_limited"
    SERVER_ERROR = "server_error"
    CLIENT_ERROR = "client_error"
    NETWORK_ERROR = "network_error"


@dataclass
class AuthConfig:
    """Authentication configuration."""
    auth_type: AuthType
    credentials: Dict[str, str] = field(default_factory=dict)
    headers: Dict[str, str] = field(default_factory=dict)
    token_refresh_endpoint: Optional[str] = None
    token_expiry: Optional[float] = None


@dataclass
class APIEndpoint:
    """API endpoint configuration."""
    url: str
    method: HTTPMethod = HTTPMethod.GET
    headers: Dict[str, str] = field(default_factory=dict)
    query_params: Dict[str, Any] = field(default_factory=dict)
    path_params: Dict[str, str] = field(default_factory=dict)
    expected_status_codes: List[int] = field(default_factory=lambda: [200])
    response_format: ResponseFormat = ResponseFormat.JSON
    timeout: float = 30.0
    rate_limit: Optional[Tuple[int, float]] = None  # (requests, per_seconds)


@dataclass
class APIActionRequest:
    """API action request specification."""
    endpoint: APIEndpoint
    payload: Optional[Dict[str, Any]] = None
    files: Optional[Dict[str, Any]] = None
    auth_config: Optional[AuthConfig] = None
    retry_attempts: int = 3
    retry_delay: float = 1.0
    validation_schema: Optional[Dict[str, Any]] = None
    transform_response: bool = False
    response_mapping: Optional[Dict[str, str]] = None


@dataclass
class APIActionResult:
    """Result of API action execution."""
    success: bool
    status: APIActionStatus
    status_code: Optional[int] = None
    response_data: Optional[Any] = None
    response_headers: Optional[Dict[str, str]] = None
    execution_time: float = 0.0
    request_id: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    rate_limit_info: Optional[Dict[str, Any]] = None


class APIClient(ABC):
    """Abstract base class for API clients."""
    
    @abstractmethod
    async def make_request(self, request: APIActionRequest) -> APIActionResult:
        """Make API request."""
        pass
    
    @abstractmethod
    async def authenticate(self, auth_config: AuthConfig) -> bool:
        """Authenticate with the API."""
        pass
    
    @abstractmethod
    def set_rate_limit(self, requests_per_second: float):
        """Set rate limiting."""
        pass


class HTTPAPIClient(APIClient):
    """
    HTTP API client with comprehensive request handling and error management.
    """
    
    def __init__(self, base_url: str = None, default_headers: Dict[str, str] = None):
        self.base_url = base_url
        self.default_headers = default_headers or {}
        self.session = None
        self.logger = logging.getLogger(__name__)
        
        # Rate limiting
        self.rate_limiter = None
        self.last_request_time = 0.0
        self.min_request_interval = 0.0
        
        # Authentication state
        self.current_auth = None
        self.auth_token = None
        self.token_expiry = None
        
        # Performance tracking
        self.request_history = []
        self.metrics = {
            'total_requests': 0,
            'successful_requests': 0,
            'failed_requests': 0,
            'average_response_time': 0.0,
            'auth_refreshes': 0
        }
    
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            headers=self.default_headers,
            timeout=aiohttp.ClientTimeout(total=60.0)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    async def make_request(self, request: APIActionRequest) -> APIActionResult:
        """
        Make HTTP API request with comprehensive error handling.
        
        Args:
            request: API action request specification
            
        Returns:
            APIActionResult with response data and status
        """
        start_time = time.time()
        
        if not self.session:
            self.session = aiohttp.ClientSession(
                headers=self.default_headers,
                timeout=aiohttp.ClientTimeout(total=60.0)
            )
        
        try:
            # Handle authentication
            if request.auth_config:
                auth_success = await self.authenticate(request.auth_config)
                if not auth_success:
                    return APIActionResult(
                        success=False,
                        status=APIActionStatus.AUTH_ERROR,
                        error_message="Authentication failed",
                        execution_time=time.time() - start_time
                    )
            
            # Apply rate limiting
            await self._apply_rate_limiting()
            
            # Make request with retry logic
            result = await self._make_request_with_retry(request)
            
            # Update metrics
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self._update_metrics(result)
            
            # Store in history
            self._store_request_history(request, result)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"API request failed: {str(e)}")
            
            self._update_metrics(None, failed=True)
            
            return APIActionResult(
                success=False,
                status=APIActionStatus.NETWORK_ERROR,
                error_message=f"Request failed: {str(e)}",
                execution_time=execution_time
            )
    
    async def authenticate(self, auth_config: AuthConfig) -> bool:
        """Handle various authentication methods."""
        
        try:
            if auth_config.auth_type == AuthType.NONE:
                return True
            
            elif auth_config.auth_type == AuthType.API_KEY:
                api_key = auth_config.credentials.get('api_key')
                key_header = auth_config.credentials.get('header_name', 'X-API-Key')
                
                if api_key:
                    self.default_headers[key_header] = api_key
                    self.current_auth = auth_config
                    return True
            
            elif auth_config.auth_type == AuthType.BEARER_TOKEN:
                token = auth_config.credentials.get('token')
                
                if token:
                    self.default_headers['Authorization'] = f'Bearer {token}'
                    self.auth_token = token
                    self.current_auth = auth_config
                    
                    if auth_config.token_expiry:
                        self.token_expiry = time.time() + auth_config.token_expiry
                    
                    return True
            
            elif auth_config.auth_type == AuthType.BASIC_AUTH:
                username = auth_config.credentials.get('username')
                password = auth_config.credentials.get('password')
                
                if username and password:
                    import base64
                    credentials = f"{username}:{password}"
                    encoded_credentials = base64.b64encode(credentials.encode()).decode()
                    self.default_headers['Authorization'] = f'Basic {encoded_credentials}'
                    self.current_auth = auth_config
                    return True
            
            elif auth_config.auth_type == AuthType.JWT:
                jwt_token = auth_config.credentials.get('jwt_token')
                
                if jwt_token:
                    self.default_headers['Authorization'] = f'Bearer {jwt_token}'
                    self.current_auth = auth_config
                    return True
            
            elif auth_config.auth_type == AuthType.CUSTOM_HEADER:
                for header, value in auth_config.headers.items():
                    self.default_headers[header] = value
                self.current_auth = auth_config
                return True
            
            elif auth_config.auth_type == AuthType.OAUTH2:
                # OAuth2 flow - simplified implementation
                return await self._handle_oauth2(auth_config)
            
            return False
            
        except Exception as e:
            self.logger.error(f"Authentication failed: {str(e)}")
            return False
    
    async def _handle_oauth2(self, auth_config: AuthConfig) -> bool:
        """Handle OAuth2 authentication flow."""
        
        try:
            # This is a simplified OAuth2 implementation
            # In practice, would implement full OAuth2 flow
            
            client_id = auth_config.credentials.get('client_id')
            client_secret = auth_config.credentials.get('client_secret')
            token_url = auth_config.credentials.get('token_url')
            
            if not all([client_id, client_secret, token_url]):
                return False
            
            # Make token request
            token_data = {
                'grant_type': 'client_credentials',
                'client_id': client_id,
                'client_secret': client_secret
            }
            
            async with self.session.post(token_url, data=token_data) as response:
                if response.status == 200:
                    token_response = await response.json()
                    access_token = token_response.get('access_token')
                    
                    if access_token:
                        self.default_headers['Authorization'] = f'Bearer {access_token}'
                        self.auth_token = access_token
                        
                        # Handle token expiry
                        expires_in = token_response.get('expires_in')
                        if expires_in:
                            self.token_expiry = time.time() + expires_in - 60  # 60s buffer
                        
                        self.current_auth = auth_config
                        self.metrics['auth_refreshes'] += 1
                        return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"OAuth2 authentication failed: {str(e)}")
            return False
    
    async def _apply_rate_limiting(self):
        """Apply rate limiting before making request."""
        
        if self.min_request_interval > 0:
            elapsed = time.time() - self.last_request_time
            if elapsed < self.min_request_interval:
                wait_time = self.min_request_interval - elapsed
                await asyncio.sleep(wait_time)
        
        self.last_request_time = time.time()
    
    async def _make_request_with_retry(self, request: APIActionRequest) -> APIActionResult:
        """Make request with retry logic."""
        
        last_error = None
        
        for attempt in range(request.retry_attempts):
            try:
                if attempt > 0:
                    self.logger.info(f"Retry attempt {attempt + 1}/{request.retry_attempts}")
                    await asyncio.sleep(request.retry_delay * attempt)
                
                # Check token expiry
                if self._is_token_expired():
                    await self._refresh_token()
                
                # Build request
                url = self._build_url(request.endpoint)
                headers = self._build_headers(request.endpoint)
                
                # Make HTTP request
                async with self.session.request(
                    method=request.endpoint.method.value,
                    url=url,
                    json=request.payload,
                    headers=headers,
                    params=request.endpoint.query_params,
                    timeout=aiohttp.ClientTimeout(total=request.endpoint.timeout)
                ) as response:
                    
                    result = await self._process_response(response, request.endpoint)
                    result.retry_count = attempt
                    
                    # Check if response is successful
                    if result.success:
                        return result
                    
                    # Handle specific error types
                    if result.status in [APIActionStatus.AUTH_ERROR]:
                        # Don't retry auth errors without fixing auth
                        return result
                    elif result.status == APIActionStatus.RATE_LIMITED:
                        # Wait longer for rate limiting
                        await asyncio.sleep(min(request.retry_delay * (attempt + 1) * 2, 60))
                    
                    last_error = result.error_message
                    
            except Exception as e:
                last_error = str(e)
                self.logger.warning(f"Request attempt {attempt + 1} failed: {str(e)}")
        
        # All attempts failed
        return APIActionResult(
            success=False,
            status=APIActionStatus.FAILED,
            error_message=f"Request failed after {request.retry_attempts} attempts: {last_error}",
            retry_count=request.retry_attempts
        )
    
    def _build_url(self, endpoint: APIEndpoint) -> str:
        """Build complete URL from endpoint configuration."""
        
        url = endpoint.url
        
        # Apply path parameters
        if endpoint.path_params:
            for param, value in endpoint.path_params.items():
                url = url.replace(f'{{{param}}}', str(value))
        
        # Handle base URL
        if self.base_url and not url.startswith('http'):
            url = urljoin(self.base_url, url)
        
        return url
    
    def _build_headers(self, endpoint: APIEndpoint) -> Dict[str, str]:
        """Build request headers."""
        
        headers = self.default_headers.copy()
        headers.update(endpoint.headers)
        
        return headers
    
    async def _process_response(self, response: aiohttp.ClientResponse, 
                              endpoint: APIEndpoint) -> APIActionResult:
        """Process HTTP response."""
        
        try:
            # Extract response data based on format
            response_data = None
            
            if endpoint.response_format == ResponseFormat.JSON:
                try:
                    response_data = await response.json()
                except:
                    response_data = await response.text()
            elif endpoint.response_format == ResponseFormat.XML:
                response_data = await response.text()
            elif endpoint.response_format == ResponseFormat.TEXT:
                response_data = await response.text()
            elif endpoint.response_format == ResponseFormat.BINARY:
                response_data = await response.read()
            else:
                response_data = await response.text()
            
            # Check status code
            status_success = response.status in endpoint.expected_status_codes
            
            # Determine API action status
            if status_success:
                api_status = APIActionStatus.SUCCESS
                error_message = None
            elif response.status == 401:
                api_status = APIActionStatus.AUTH_ERROR
                error_message = "Authentication failed"
            elif response.status == 429:
                api_status = APIActionStatus.RATE_LIMITED
                error_message = "Rate limit exceeded"
            elif 400 <= response.status < 500:
                api_status = APIActionStatus.CLIENT_ERROR
                error_message = f"Client error: {response.status}"
            elif 500 <= response.status < 600:
                api_status = APIActionStatus.SERVER_ERROR
                error_message = f"Server error: {response.status}"
            else:
                api_status = APIActionStatus.FAILED
                error_message = f"Unexpected status: {response.status}"
            
            # Extract rate limit info
            rate_limit_info = self._extract_rate_limit_info(response.headers)
            
            return APIActionResult(
                success=status_success,
                status=api_status,
                status_code=response.status,
                response_data=response_data,
                response_headers=dict(response.headers),
                error_message=error_message,
                rate_limit_info=rate_limit_info
            )
            
        except Exception as e:
            return APIActionResult(
                success=False,
                status=APIActionStatus.FAILED,
                status_code=response.status,
                error_message=f"Response processing failed: {str(e)}"
            )
    
    def _extract_rate_limit_info(self, headers: Dict[str, str]) -> Dict[str, Any]:
        """Extract rate limiting information from response headers."""
        
        rate_limit_info = {}
        
        # Common rate limit headers
        rate_limit_headers = {
            'x-ratelimit-limit': 'limit',
            'x-ratelimit-remaining': 'remaining',
            'x-ratelimit-reset': 'reset',
            'retry-after': 'retry_after'
        }
        
        for header, key in rate_limit_headers.items():
            if header in headers:
                try:
                    rate_limit_info[key] = int(headers[header])
                except ValueError:
                    rate_limit_info[key] = headers[header]
        
        return rate_limit_info
    
    def _is_token_expired(self) -> bool:
        """Check if authentication token is expired."""
        
        if not self.token_expiry:
            return False
        
        return time.time() >= self.token_expiry
    
    async def _refresh_token(self):
        """Refresh authentication token."""
        
        if not self.current_auth or not self.current_auth.token_refresh_endpoint:
            return False
        
        try:
            # Attempt token refresh
            if self.current_auth.auth_type == AuthType.OAUTH2:
                return await self._handle_oauth2(self.current_auth)
            
            return False
            
        except Exception as e:
            self.logger.error(f"Token refresh failed: {str(e)}")
            return False
    
    def set_rate_limit(self, requests_per_second: float):
        """Set rate limiting."""
        
        if requests_per_second > 0:
            self.min_request_interval = 1.0 / requests_per_second
        else:
            self.min_request_interval = 0.0
    
    def _update_metrics(self, result: APIActionResult = None, failed: bool = False):
        """Update performance metrics."""
        
        self.metrics['total_requests'] += 1
        
        if failed or (result and not result.success):
            self.metrics['failed_requests'] += 1
        else:
            self.metrics['successful_requests'] += 1
        
        if result and result.execution_time > 0:
            current_avg = self.metrics['average_response_time']
            total_requests = self.metrics['total_requests']
            self.metrics['average_response_time'] = (
                (current_avg * (total_requests - 1) + result.execution_time) / total_requests
            )
    
    def _store_request_history(self, request: APIActionRequest, result: APIActionResult):
        """Store request in history for debugging."""
        
        self.request_history.append({
            'timestamp': time.time(),
            'url': self._build_url(request.endpoint),
            'method': request.endpoint.method.value,
            'status_code': result.status_code,
            'success': result.success,
            'execution_time': result.execution_time
        })
        
        # Keep only recent history
        if len(self.request_history) > 100:
            self.request_history = self.request_history[-50:]


class APIActionController:
    """
    Comprehensive API action controller for external service integration.
    Provides high-level interface for API operations with service templates,
    authentication management, and performance monitoring.
    """
    
    def __init__(self, default_client: APIClient = None):
        self.default_client = default_client or HTTPAPIClient()
        self.service_clients = {}
        self.logger = logging.getLogger(__name__)
        
        # Service templates for common APIs
        self.service_templates = self._initialize_service_templates()
        
        # Performance tracking
        self.metrics = {
            'actions_executed': 0,
            'successful_actions': 0,
            'failed_actions': 0,
            'average_execution_time': 0.0,
            'service_distribution': {},
            'auth_failures': 0
        }
        
        self.logger.info("API Action Controller initialized")
    
    def _initialize_service_templates(self) -> Dict[str, Dict[str, Any]]:
        """Initialize common API service templates."""
        
        return {
            'github': {
                'base_url': 'https://api.github.com',
                'auth_type': AuthType.BEARER_TOKEN,
                'rate_limit': (5000, 3600),  # 5000 requests per hour
                'common_endpoints': {
                    'user_info': {
                        'url': '/user',
                        'method': HTTPMethod.GET
                    },
                    'repositories': {
                        'url': '/user/repos',
                        'method': HTTPMethod.GET
                    }
                }
            },
            'openai': {
                'base_url': 'https://api.openai.com/v1',
                'auth_type': AuthType.BEARER_TOKEN,
                'rate_limit': (60, 60),  # 60 requests per minute
                'common_endpoints': {
                    'chat_completions': {
                        'url': '/chat/completions',
                        'method': HTTPMethod.POST
                    },
                    'embeddings': {
                        'url': '/embeddings',
                        'method': HTTPMethod.POST
                    }
                }
            },
            'slack': {
                'base_url': 'https://slack.com/api',
                'auth_type': AuthType.BEARER_TOKEN,
                'rate_limit': (50, 60),  # 50 requests per minute
                'common_endpoints': {
                    'send_message': {
                        'url': '/chat.postMessage',
                        'method': HTTPMethod.POST
                    },
                    'channel_list': {
                        'url': '/conversations.list',
                        'method': HTTPMethod.GET
                    }
                }
            }
        }
    
    async def execute_api_action(self, request: APIActionRequest, 
                               client_name: str = None) -> APIActionResult:
        """
        Execute API action with specified or default client.
        
        Args:
            request: API action request specification
            client_name: Optional specific client to use
            
        Returns:
            APIActionResult with response data and status
        """
        start_time = time.time()
        
        try:
            # Select client
            client = self._get_client(client_name)
            
            # Execute request
            if hasattr(client, '__aenter__'):
                async with client as api_client:
                    result = await api_client.make_request(request)
            else:
                result = await client.make_request(request)
            
            # Update metrics
            execution_time = time.time() - start_time
            result.execution_time = execution_time
            self._update_metrics(result, client_name)
            
            return result
            
        except Exception as e:
            execution_time = time.time() - start_time
            self.logger.error(f"API action execution failed: {str(e)}")
            
            self._update_metrics(None, client_name, failed=True)
            
            return APIActionResult(
                success=False,
                status=APIActionStatus.NETWORK_ERROR,
                error_message=f"API action failed: {str(e)}",
                execution_time=execution_time
            )
    
    async def create_service_client(self, service_name: str, 
                                  credentials: Dict[str, str]) -> bool:
        """
        Create specialized client for a service.
        
        Args:
            service_name: Name of the service (e.g., 'github', 'openai')
            credentials: Authentication credentials
            
        Returns:
            True if client created successfully
        """
        try:
            if service_name not in self.service_templates:
                self.logger.error(f"Unknown service template: {service_name}")
                return False
            
            template = self.service_templates[service_name]
            
            # Create client
            client = HTTPAPIClient(
                base_url=template['base_url'],
                default_headers={'User-Agent': 'RomAI-API-Client/1.0'}
            )
            
            # Configure rate limiting
            if 'rate_limit' in template:
                requests, per_seconds = template['rate_limit']
                client.set_rate_limit(requests / per_seconds)
            
            # Set up authentication
            auth_config = AuthConfig(
                auth_type=template['auth_type'],
                credentials=credentials
            )
            
            # Test authentication
            async with client as api_client:
                auth_success = await api_client.authenticate(auth_config)
                if not auth_success:
                    return False
            
            self.service_clients[service_name] = client
            self.logger.info(f"Created service client for: {service_name}")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to create service client: {str(e)}")
            return False
    
    def create_service_request(self, service_name: str, endpoint_name: str,
                             payload: Dict[str, Any] = None,
                             **kwargs) -> APIActionRequest:
        """
        Create API request using service template.
        
        Args:
            service_name: Name of the service
            endpoint_name: Name of the endpoint in template
            payload: Request payload
            **kwargs: Additional parameters
            
        Returns:
            APIActionRequest configured for the service
        """
        if service_name not in self.service_templates:
            raise ValueError(f"Unknown service template: {service_name}")
        
        template = self.service_templates[service_name]
        
        if endpoint_name not in template['common_endpoints']:
            raise ValueError(f"Unknown endpoint: {endpoint_name}")
        
        endpoint_config = template['common_endpoints'][endpoint_name]
        
        # Create endpoint
        endpoint = APIEndpoint(
            url=endpoint_config['url'],
            method=endpoint_config['method'],
            **kwargs
        )
        
        # Create auth config if credentials provided
        auth_config = None
        if 'credentials' in kwargs:
            auth_config = AuthConfig(
                auth_type=template['auth_type'],
                credentials=kwargs['credentials']
            )
        
        return APIActionRequest(
            endpoint=endpoint,
            payload=payload,
            auth_config=auth_config
        )
    
    def _get_client(self, client_name: str = None) -> APIClient:
        """Get API client by name or return default."""
        
        if client_name and client_name in self.service_clients:
            return self.service_clients[client_name]
        
        return self.default_client
    
    def _update_metrics(self, result: APIActionResult = None, 
                       client_name: str = None, failed: bool = False):
        """Update performance metrics."""
        
        self.metrics['actions_executed'] += 1
        
        # Update service distribution
        service = client_name or 'default'
        if service not in self.metrics['service_distribution']:
            self.metrics['service_distribution'][service] = 0
        self.metrics['service_distribution'][service] += 1
        
        if failed or (result and not result.success):
            self.metrics['failed_actions'] += 1
            
            if result and result.status == APIActionStatus.AUTH_ERROR:
                self.metrics['auth_failures'] += 1
        else:
            self.metrics['successful_actions'] += 1
        
        if result and result.execution_time > 0:
            current_avg = self.metrics['average_execution_time']
            total_actions = self.metrics['actions_executed']
            self.metrics['average_execution_time'] = (
                (current_avg * (total_actions - 1) + result.execution_time) / total_actions
            )
    
    def get_performance_metrics(self) -> Dict[str, Any]:
        """Get API action performance metrics."""
        
        total_actions = self.metrics['actions_executed']
        
        if total_actions == 0:
            return {'message': 'No API actions executed yet'}
        
        success_rate = self.metrics['successful_actions'] / total_actions
        
        return {
            'performance_summary': {
                'total_actions': total_actions,
                'successful_actions': self.metrics['successful_actions'],
                'failed_actions': self.metrics['failed_actions'],
                'success_rate': success_rate,
                'average_execution_time': self.metrics['average_execution_time'],
                'auth_failures': self.metrics['auth_failures']
            },
            'service_distribution': self.metrics['service_distribution'],
            'available_services': list(self.service_templates.keys()),
            'active_clients': list(self.service_clients.keys()),
            'supported_auth_types': [auth.value for auth in AuthType],
            'supported_methods': [method.value for method in HTTPMethod]
        }
    
    def get_service_info(self, service_name: str) -> Dict[str, Any]:
        """Get information about a service template."""
        
        if service_name not in self.service_templates:
            return {'error': f'Unknown service: {service_name}'}
        
        template = self.service_templates[service_name]
        
        return {
            'service_name': service_name,
            'base_url': template.get('base_url'),
            'auth_type': template.get('auth_type', {}).value if template.get('auth_type') else None,
            'rate_limit': template.get('rate_limit'),
            'available_endpoints': list(template.get('common_endpoints', {}).keys()),
            'client_active': service_name in self.service_clients
        }