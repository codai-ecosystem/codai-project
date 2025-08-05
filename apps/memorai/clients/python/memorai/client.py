"""
MemorAI Python Client - Main Client Class
Official Python client for the MemorAI platform
"""

import json
import time
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union, AsyncIterator
from urllib.parse import urljoin, quote

import requests
import backoff
from websocket import WebSocketApp

from .models import (
    Memory, SearchResult, SearchOptions, AnalyticsData, 
    SystemHealth, BatchOperation, BatchResult, ClientConfig,
    WebSocketMessage, RateLimitInfo, APIResponse, SearchAlgorithm
)
from .exceptions import (
    MemorAIError, MemorAIAPIError, MemorAIAuthError, MemorAIRateLimitError,
    MemorAIConnectionError, MemorAITimeoutError, MemorAIWebSocketError
)


class MemorAI:
    """
    Official MemorAI Python Client
    
    Provides comprehensive access to the MemorAI platform including:
    - Memory management (CRUD operations)
    - Advanced search capabilities
    - Real-time updates via WebSocket
    - Analytics and insights
    - Batch operations
    """
    
    def __init__(self, 
                 api_key: Optional[str] = None,
                 base_url: str = "http://localhost:4006",
                 timeout: float = 30.0,
                 max_retries: int = 3,
                 retry_delay: float = 1.0,
                 enable_websocket: bool = True,
                 websocket_url: Optional[str] = None,
                 user_agent: str = "MemorAI-Python-Client/1.0.0",
                 debug: bool = False):
        """
        Initialize MemorAI client
        
        Args:
            api_key: API key for authentication
            base_url: Base URL for the MemorAI API
            timeout: Request timeout in seconds
            max_retries: Maximum number of request retries
            retry_delay: Delay between retries in seconds
            enable_websocket: Enable WebSocket real-time features
            websocket_url: WebSocket URL (auto-generated if None)
            user_agent: Custom user agent string
            debug: Enable debug logging
        """
        self.config = ClientConfig(
            api_key=api_key,
            base_url=base_url.rstrip('/'),
            timeout=timeout,
            max_retries=max_retries,
            retry_delay=retry_delay,
            enable_websocket=enable_websocket,
            websocket_url=websocket_url or base_url.replace('http', 'ws'),
            user_agent=user_agent,
            debug=debug
        )
        
        # Setup logging
        self.logger = logging.getLogger(__name__)
        if debug:
            logging.basicConfig(level=logging.DEBUG)
        
        # HTTP session
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': self.config.user_agent,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        
        if self.config.api_key:
            self.session.headers['Authorization'] = f'Bearer {self.config.api_key}'
        
        # WebSocket connection
        self._ws = None
        self._ws_callbacks = {}
        
        # Rate limiting info
        self._rate_limit_info = None
        
        # Performance tracking
        self._performance_metrics = []
        
        # Initialize API sections
        self.memories = MemoryAPI(self)
        self.search = SearchAPI(self)
        self.analytics = AnalyticsAPI(self)
        self.system = SystemAPI(self)
        
        if self.config.enable_websocket:
            self._connect_websocket()
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with retry logic and error handling"""
        url = urljoin(self.config.base_url, endpoint.lstrip('/'))
        
        @backoff.on_exception(
            backoff.expo,
            (requests.exceptions.ConnectionError, requests.exceptions.Timeout),
            max_tries=self.config.max_retries + 1,
            base=self.config.retry_delay
        )
        def _request():
            start_time = time.time()
            
            try:
                response = self.session.request(
                    method, url, timeout=self.config.timeout, **kwargs
                )
                
                # Track performance
                execution_time = (time.time() - start_time) * 1000
                self._track_performance(method, endpoint, execution_time, response.status_code)
                
                # Update rate limit info
                self._update_rate_limit_info(response)
                
                # Handle errors
                if response.status_code >= 400:
                    self._handle_error_response(response)
                
                return response
                
            except requests.exceptions.Timeout as e:
                raise MemorAITimeoutError(f"Request timed out after {self.config.timeout}s", self.config.timeout)
            except requests.exceptions.ConnectionError as e:
                raise MemorAIConnectionError("Failed to connect to MemorAI API", e)
        
        return _request()
    
    def _handle_error_response(self, response: requests.Response):
        """Handle HTTP error responses"""
        try:
            error_data = response.json()
        except json.JSONDecodeError:
            error_data = {"message": response.text or "Unknown error"}
        
        message = error_data.get('message', f'HTTP {response.status_code} error')
        
        if response.status_code == 401:
            raise MemorAIAuthError(message)
        elif response.status_code == 429:
            retry_after = response.headers.get('Retry-After')
            raise MemorAIRateLimitError(message, int(retry_after) if retry_after else None)
        else:
            raise MemorAIAPIError(message, response.status_code, error_data)
    
    def _update_rate_limit_info(self, response: requests.Response):
        """Update rate limit information from response headers"""
        if 'X-RateLimit-Limit' in response.headers:
            self._rate_limit_info = RateLimitInfo(
                limit=int(response.headers['X-RateLimit-Limit']),
                remaining=int(response.headers.get('X-RateLimit-Remaining', 0)),
                reset_at=datetime.fromtimestamp(int(response.headers.get('X-RateLimit-Reset', time.time()))),
                retry_after=int(response.headers.get('Retry-After', 0)) or None
            )
    
    def _track_performance(self, method: str, endpoint: str, execution_time: float, status_code: int):
        """Track API performance metrics"""
        metric = {
            'method': method,
            'endpoint': endpoint,
            'execution_time_ms': execution_time,
            'status_code': status_code,
            'timestamp': datetime.now()
        }
        
        self._performance_metrics.append(metric)
        
        # Keep only last 100 metrics
        if len(self._performance_metrics) > 100:
            self._performance_metrics = self._performance_metrics[-100:]
        
        if self.config.debug:
            self.logger.debug(f"API Request: {method} {endpoint} - {execution_time:.1f}ms - {status_code}")
    
    def _connect_websocket(self):
        """Connect to WebSocket for real-time updates"""
        if not self.config.websocket_url:
            return
        
        def on_message(ws, message):
            try:
                data = json.loads(message)
                ws_message = WebSocketMessage(**data)
                self._handle_websocket_message(ws_message)
            except Exception as e:
                self.logger.error(f"WebSocket message error: {e}")
        
        def on_error(ws, error):
            self.logger.error(f"WebSocket error: {error}")
        
        def on_close(ws, close_status_code, close_msg):
            self.logger.info("WebSocket connection closed")
        
        def on_open(ws):
            self.logger.info("WebSocket connection established")
        
        try:
            self._ws = WebSocketApp(
                self.config.websocket_url,
                on_message=on_message,
                on_error=on_error,
                on_close=on_close,
                on_open=on_open
            )
        except Exception as e:
            self.logger.warning(f"WebSocket connection failed: {e}")
    
    def _handle_websocket_message(self, message: WebSocketMessage):
        """Handle incoming WebSocket messages"""
        event_key = f"{message.type}:{message.event}"
        if event_key in self._ws_callbacks:
            for callback in self._ws_callbacks[event_key]:
                try:
                    callback(message.data)
                except Exception as e:
                    self.logger.error(f"WebSocket callback error: {e}")
    
    def on(self, event: str, callback):
        """Register WebSocket event callback"""
        if event not in self._ws_callbacks:
            self._ws_callbacks[event] = []
        self._ws_callbacks[event].append(callback)
    
    def off(self, event: str, callback=None):
        """Unregister WebSocket event callback"""
        if event in self._ws_callbacks:
            if callback:
                self._ws_callbacks[event].remove(callback)
            else:
                del self._ws_callbacks[event]
    
    def get_rate_limit_info(self) -> Optional[RateLimitInfo]:
        """Get current rate limit information"""
        return self._rate_limit_info
    
    def get_performance_metrics(self) -> List[Dict[str, Any]]:
        """Get performance metrics"""
        return [metric for metric in self._performance_metrics]
    
    def close(self):
        """Close connections and cleanup"""
        if self._ws:
            self._ws.close()
        self.session.close()


class MemoryAPI:
    """Memory management API"""
    
    def __init__(self, client: MemorAI):
        self.client = client
    
    def create(self, content: str, title: str = None, category: str = None, 
               tags: List[str] = None, metadata: Dict[str, Any] = None) -> Memory:
        """Create a new memory"""
        data = {
            'content': content,
            'title': title,
            'category': category,
            'tags': tags or [],
            'metadata': metadata or {}
        }
        
        response = self.client._make_request('POST', '/api/memories', json=data)
        return Memory(**response.json()['data'])
    
    def get(self, memory_id: str) -> Memory:
        """Get memory by ID"""
        response = self.client._make_request('GET', f'/api/memories/{memory_id}')
        return Memory(**response.json()['data'])
    
    def update(self, memory_id: str, **updates) -> Memory:
        """Update existing memory"""
        response = self.client._make_request('PUT', f'/api/memories/{memory_id}', json=updates)
        return Memory(**response.json()['data'])
    
    def delete(self, memory_id: str) -> bool:
        """Delete memory"""
        response = self.client._make_request('DELETE', f'/api/memories/{memory_id}')
        return response.json()['success']
    
    def list(self, limit: int = 20, offset: int = 0, category: str = None, 
             tags: List[str] = None) -> List[Memory]:
        """List memories with optional filtering"""
        params = {'limit': limit, 'offset': offset}
        if category:
            params['category'] = category
        if tags:
            params['tags'] = ','.join(tags)
        
        response = self.client._make_request('GET', '/api/memories', params=params)
        return [Memory(**mem) for mem in response.json()['data']['memories']]
    
    def batch(self, operations: List[BatchOperation]) -> BatchResult:
        """Perform batch operations"""
        data = {'operations': [op.dict() for op in operations]}
        response = self.client._make_request('POST', '/api/memories/batch', json=data)
        return BatchResult(**response.json()['data'])


class SearchAPI:
    """Search API"""
    
    def __init__(self, client: MemorAI):
        self.client = client
    
    def query(self, query: str, algorithm: SearchAlgorithm = SearchAlgorithm.SEMANTIC,
              limit: int = 20, **options) -> SearchResult:
        """Search memories"""
        search_options = SearchOptions(
            algorithm=algorithm,
            limit=limit,
            **options
        )
        
        data = {
            'query': query,
            **search_options.dict(exclude_none=True)
        }
        
        response = self.client._make_request('POST', '/api/search', json=data)
        return SearchResult(**response.json()['data'])
    
    def similar(self, memory_id: str, limit: int = 10) -> List[Memory]:
        """Find similar memories"""
        params = {'limit': limit}
        response = self.client._make_request('GET', f'/api/memories/{memory_id}/similar', params=params)
        return [Memory(**mem) for mem in response.json()['data']['memories']]


class AnalyticsAPI:
    """Analytics API"""
    
    def __init__(self, client: MemorAI):
        self.client = client
    
    def get(self) -> AnalyticsData:
        """Get analytics data"""
        response = self.client._make_request('GET', '/api/analytics')
        return AnalyticsData(**response.json()['data'])


class SystemAPI:
    """System API"""
    
    def __init__(self, client: MemorAI):
        self.client = client
    
    def health(self) -> SystemHealth:
        """Get system health status"""
        response = self.client._make_request('GET', '/api/health')
        return SystemHealth(**response.json()['data'])
    
    def version(self) -> Dict[str, str]:
        """Get API version info"""
        response = self.client._make_request('GET', '/api/version')
        return response.json()['data']
