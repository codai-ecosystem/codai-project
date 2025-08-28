"""
MemorAI MCP Client - Python SDK

Official Python client library for the MemorAI MCP Server.
Provides a comprehensive, type-safe interface for all memory operations
with both synchronous and asynchronous support.

Author: MemorAI Team
Version: 1.5.0
License: MIT
"""

import asyncio
import json
import logging
from dataclasses import dataclass, asdict, field
from datetime import datetime
from typing import Dict, List, Optional, Any, Union, AsyncIterator
from urllib.parse import urljoin
import requests
import aiohttp
import websockets
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ============================================================================
# Configuration and Types
# ============================================================================

@dataclass
class MemorAIClientConfig:
    """Configuration for the MemorAI client."""
    api_key: str
    base_url: str = "https://api.memorai.com/v1"
    timeout: int = 30
    max_retries: int = 3
    debug: bool = False
    headers: Dict[str, str] = field(default_factory=dict)

@dataclass
class MemoryMetadata:
    """Metadata associated with a memory."""
    importance: Optional[int] = None
    tags: Optional[List[str]] = None
    project: Optional[str] = None
    session: Optional[str] = None
    entity_type: Optional[str] = None
    priority: Optional[str] = None  # 'low', 'medium', 'high', 'critical'
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary, filtering out None values."""
        return {k: v for k, v in asdict(self).items() if v is not None}

@dataclass
class Memory:
    """Represents a stored memory."""
    memory_id: str
    structured_key: str
    content: str
    metadata: MemoryMetadata
    relevance_score: Optional[float] = None
    timestamp: str = ""

@dataclass
class RememberRequest:
    """Request to store a new memory."""
    agent_id: str
    content: str
    metadata: Optional[MemoryMetadata] = None

@dataclass
class RememberResponse:
    """Response from storing a memory."""
    success: bool
    memory_id: str
    structured_key: str
    importance: int
    embeddings_generated: bool
    entities_extracted: List[str]
    timestamp: str

@dataclass
class RecallRequest:
    """Request to search for memories."""
    agent_id: str
    query: str
    limit: Optional[int] = None
    min_importance: Optional[int] = None
    project: Optional[str] = None
    session: Optional[str] = None
    include_other_agents: Optional[bool] = None

@dataclass
class RecallResponse:
    """Response from searching memories."""
    success: bool
    memories: List[Memory]
    total_results: int
    search_time: float
    query: str

@dataclass
class ContextResponse:
    """Recent context for an agent."""
    agent_id: str
    context_size: int
    memories: List[Memory]
    summary: Optional[str] = None
    timestamp: str = ""

@dataclass
class HealthResponse:
    """Health check response."""
    status: str  # 'healthy', 'degraded', 'unhealthy'
    service: str
    version: str
    uptime: int
    timestamp: str
    dependencies: Dict[str, str]

@dataclass
class AnalyticsDashboard:
    """Analytics dashboard data."""
    agent_id: str
    total_memories: int
    memory_growth_rate: float
    average_importance: float
    top_tags: List[str]
    temporal_patterns: Dict[str, List[float]]
    search_patterns: Dict[str, Any]
    performance_metrics: Dict[str, float]

class MemorAIError(Exception):
    """Custom exception for MemorAI API errors."""
    
    def __init__(self, code: str, message: str, status_code: Optional[int] = None, 
                 request_id: Optional[str] = None, details: Optional[Any] = None):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.request_id = request_id
        self.details = details

# ============================================================================
# Synchronous Client
# ============================================================================

class MemorAIClient:
    """
    Synchronous client for the MemorAI MCP Server.
    
    This client provides a comprehensive interface for interacting with
    the MemorAI API using requests.
    """
    
    def __init__(self, config: MemorAIClientConfig):
        """Initialize the client with configuration."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Configure logging
        if config.debug:
            logging.basicConfig(level=logging.DEBUG)
            
        # Setup session with retries
        self.session = requests.Session()
        
        # Configure retry strategy
        retry_strategy = Retry(
            total=config.max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set default headers
        self.session.headers.update({
            'Authorization': f'Bearer {config.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'MemorAI-Python-Client/1.5.0',
            **config.headers
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make an HTTP request with error handling."""
        url = urljoin(self.config.base_url, endpoint)
        
        try:
            if self.config.debug:
                self.logger.debug(f"🚀 {method.upper()} {url}")
                if 'json' in kwargs:
                    self.logger.debug(f"📤 Request body: {kwargs['json']}")
            
            response = self.session.request(
                method=method,
                url=url,
                timeout=self.config.timeout,
                **kwargs
            )
            
            if self.config.debug:
                self.logger.debug(f"✅ {response.status_code} {response.reason}")
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.HTTPError as e:
            try:
                error_data = e.response.json() if e.response else {}
                if 'error' in error_data:
                    error_info = error_data['error']
                    raise MemorAIError(
                        code=error_info.get('code', 'HTTP_ERROR'),
                        message=error_info.get('message', str(e)),
                        status_code=e.response.status_code if e.response else None,
                        request_id=error_info.get('request_id'),
                        details=error_info.get('details')
                    )
            except (ValueError, KeyError):
                pass
            
            # Fallback error handling
            raise MemorAIError(
                code='HTTP_ERROR',
                message=f"HTTP {e.response.status_code}: {e.response.reason}" if e.response else str(e),
                status_code=e.response.status_code if e.response else None
            )
            
        except requests.exceptions.RequestException as e:
            raise MemorAIError(
                code='REQUEST_ERROR',
                message=str(e)
            )

    # System Operations
    
    def health_check(self) -> HealthResponse:
        """Check the health status of the MemorAI MCP Server."""
        response_data = self._make_request('GET', '/health')
        return HealthResponse(**response_data)

    # Memory Management Operations
    
    def remember_memory(self, request: RememberRequest) -> RememberResponse:
        """Store a new memory with content and metadata."""
        request_data = {
            'agentId': request.agent_id,
            'content': request.content,
            'metadata': request.metadata.to_dict() if request.metadata else {}
        }
        
        response_data = self._make_request('POST', '/api/memory/remember', json=request_data)
        return RememberResponse(**response_data)
    
    def recall_memories(self, request: RecallRequest) -> RecallResponse:
        """Search and retrieve memories using advanced hybrid search."""
        params = {
            'agentId': request.agent_id,
            'query': request.query
        }
        
        # Add optional parameters
        if request.limit is not None:
            params['limit'] = request.limit
        if request.min_importance is not None:
            params['minImportance'] = request.min_importance
        if request.project is not None:
            params['project'] = request.project
        if request.session is not None:
            params['session'] = request.session
        if request.include_other_agents is not None:
            params['includeOtherAgents'] = request.include_other_agents
        
        response_data = self._make_request('GET', '/api/memory/recall', params=params)
        
        # Convert memories to Memory objects
        memories = [
            Memory(
                memory_id=m['memoryId'],
                structured_key=m['structuredKey'],
                content=m['content'],
                metadata=MemoryMetadata(**m['metadata']),
                relevance_score=m.get('relevanceScore'),
                timestamp=m['timestamp']
            )
            for m in response_data['memories']
        ]
        
        return RecallResponse(
            success=response_data['success'],
            memories=memories,
            total_results=response_data['totalResults'],
            search_time=response_data['searchTime'],
            query=response_data['query']
        )
    
    def get_context(self, agent_id: str, context_size: int = 5) -> ContextResponse:
        """Get recent context for an agent."""
        params = {'agentId': agent_id, 'contextSize': context_size}
        response_data = self._make_request('GET', '/api/memory/context', params=params)
        
        # Convert memories to Memory objects
        memories = [
            Memory(
                memory_id=m['memoryId'],
                structured_key=m['structuredKey'],
                content=m['content'],
                metadata=MemoryMetadata(**m['metadata']),
                timestamp=m['timestamp']
            )
            for m in response_data['memories']
        ]
        
        return ContextResponse(
            agent_id=response_data['agentId'],
            context_size=response_data['contextSize'],
            memories=memories,
            summary=response_data.get('summary'),
            timestamp=response_data['timestamp']
        )
    
    def forget_memory(self, agent_id: str, structured_key: str) -> bool:
        """Delete a memory by structured key."""
        params = {'agentId': agent_id, 'structuredKey': structured_key}
        response_data = self._make_request('DELETE', '/api/memory/forget', params=params)
        return response_data['success']

    # Analytics Operations
    
    def get_analytics_dashboard(self, agent_id: str) -> AnalyticsDashboard:
        """Get comprehensive analytics dashboard for an agent."""
        params = {'agentId': agent_id}
        response_data = self._make_request('GET', '/api/analytics/dashboard', params=params)
        return AnalyticsDashboard(**response_data)
    
    def generate_insights(self, agent_id: str) -> Dict[str, Any]:
        """Generate intelligent insights about agent's memories."""
        params = {'agentId': agent_id}
        return self._make_request('GET', '/api/analytics/insights', params=params)
    
    def analyze_temporal_patterns(self, agent_id: str) -> Dict[str, Any]:
        """Analyze temporal patterns in agent's memory usage."""
        params = {'agentId': agent_id}
        return self._make_request('GET', '/api/analytics/temporal-patterns', params=params)

    # Utility Methods
    
    def batch_remember_memories(self, agent_id: str, 
                               memories: List[Dict[str, Any]]) -> List[Optional[RememberResponse]]:
        """Batch store multiple memories."""
        results = []
        
        for memory in memories:
            try:
                metadata = MemoryMetadata(**memory.get('metadata', {}))
                request = RememberRequest(
                    agent_id=agent_id,
                    content=memory['content'],
                    metadata=metadata
                )
                result = self.remember_memory(request)
                results.append(result)
            except Exception as e:
                self.logger.error(f"Failed to store memory: {e}")
                results.append(None)
        
        return results
    
    def get_memory_stats(self, agent_id: str) -> Dict[str, Any]:
        """Get memory statistics for an agent."""
        dashboard = self.get_analytics_dashboard(agent_id)
        
        # Get memory timestamps for oldest/newest calculation
        recall_request = RecallRequest(agent_id=agent_id, query='', limit=1000)
        recall_response = self.recall_memories(recall_request)
        
        timestamps = [datetime.fromisoformat(m.timestamp.replace('Z', '+00:00')) 
                     for m in recall_response.memories]
        
        if timestamps:
            oldest_timestamp = min(timestamps)
            newest_timestamp = max(timestamps)
        else:
            oldest_timestamp = newest_timestamp = datetime.now()
        
        return {
            'total_memories': dashboard.total_memories,
            'average_importance': dashboard.average_importance,
            'most_used_tags': dashboard.top_tags,
            'oldest_memory': oldest_timestamp.isoformat(),
            'newest_memory': newest_timestamp.isoformat(),
        }

# ============================================================================
# Asynchronous Client
# ============================================================================

class AsyncMemorAIClient:
    """
    Asynchronous client for the MemorAI MCP Server.
    
    This client provides the same interface as the synchronous client
    but with async/await support for better performance in async applications.
    """
    
    def __init__(self, config: MemorAIClientConfig):
        """Initialize the async client with configuration."""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Configure logging
        if config.debug:
            logging.basicConfig(level=logging.DEBUG)

    async def _make_request(self, method: str, endpoint: str, session: aiohttp.ClientSession, 
                          **kwargs) -> Dict[str, Any]:
        """Make an async HTTP request with error handling."""
        url = urljoin(self.config.base_url, endpoint)
        
        try:
            if self.config.debug:
                self.logger.debug(f"🚀 {method.upper()} {url}")
                if 'json' in kwargs:
                    self.logger.debug(f"📤 Request body: {kwargs['json']}")
            
            async with session.request(
                method=method,
                url=url,
                timeout=aiohttp.ClientTimeout(total=self.config.timeout),
                **kwargs
            ) as response:
                
                if self.config.debug:
                    self.logger.debug(f"✅ {response.status} {response.reason}")
                
                response.raise_for_status()
                return await response.json()
                
        except aiohttp.ClientResponseError as e:
            try:
                error_data = await e.response.json() if e.response else {}
                if 'error' in error_data:
                    error_info = error_data['error']
                    raise MemorAIError(
                        code=error_info.get('code', 'HTTP_ERROR'),
                        message=error_info.get('message', str(e)),
                        status_code=e.status,
                        request_id=error_info.get('request_id'),
                        details=error_info.get('details')
                    )
            except (ValueError, KeyError):
                pass
            
            # Fallback error handling
            raise MemorAIError(
                code='HTTP_ERROR',
                message=f"HTTP {e.status}: {e.message}",
                status_code=e.status
            )
            
        except aiohttp.ClientError as e:
            raise MemorAIError(
                code='REQUEST_ERROR',
                message=str(e)
            )

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get a configured aiohttp session."""
        headers = {
            'Authorization': f'Bearer {self.config.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'MemorAI-Python-Client/1.5.0',
            **self.config.headers
        }
        
        return aiohttp.ClientSession(headers=headers)

    # System Operations
    
    async def health_check(self) -> HealthResponse:
        """Check the health status of the MemorAI MCP Server."""
        async with await self._get_session() as session:
            response_data = await self._make_request('GET', '/health', session)
            return HealthResponse(**response_data)

    # Memory Management Operations
    
    async def remember_memory(self, request: RememberRequest) -> RememberResponse:
        """Store a new memory with content and metadata."""
        request_data = {
            'agentId': request.agent_id,
            'content': request.content,
            'metadata': request.metadata.to_dict() if request.metadata else {}
        }
        
        async with await self._get_session() as session:
            response_data = await self._make_request('POST', '/api/memory/remember', session, json=request_data)
            return RememberResponse(**response_data)
    
    async def recall_memories(self, request: RecallRequest) -> RecallResponse:
        """Search and retrieve memories using advanced hybrid search."""
        params = {
            'agentId': request.agent_id,
            'query': request.query
        }
        
        # Add optional parameters
        if request.limit is not None:
            params['limit'] = request.limit
        if request.min_importance is not None:
            params['minImportance'] = request.min_importance
        if request.project is not None:
            params['project'] = request.project
        if request.session is not None:
            params['session'] = request.session
        if request.include_other_agents is not None:
            params['includeOtherAgents'] = request.include_other_agents
        
        async with await self._get_session() as session:
            response_data = await self._make_request('GET', '/api/memory/recall', session, params=params)
            
            # Convert memories to Memory objects
            memories = [
                Memory(
                    memory_id=m['memoryId'],
                    structured_key=m['structuredKey'],
                    content=m['content'],
                    metadata=MemoryMetadata(**m['metadata']),
                    relevance_score=m.get('relevanceScore'),
                    timestamp=m['timestamp']
                )
                for m in response_data['memories']
            ]
            
            return RecallResponse(
                success=response_data['success'],
                memories=memories,
                total_results=response_data['totalResults'],
                search_time=response_data['searchTime'],
                query=response_data['query']
            )
    
    # Additional async methods following the same pattern...
    # (Implementation abbreviated for brevity)

    # WebSocket Support
    
    async def create_websocket_connection(self, agent_id: str) -> AsyncIterator[Dict[str, Any]]:
        """Create WebSocket connection for real-time memory synchronization."""
        ws_url = self.config.base_url.replace('http', 'ws') + f'/ws/{agent_id}'
        headers = {'Authorization': f'Bearer {self.config.api_key}'}
        
        async with websockets.connect(ws_url, extra_headers=headers) as websocket:
            if self.config.debug:
                self.logger.debug(f"🔌 WebSocket connected for agent: {agent_id}")
            
            try:
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        if self.config.debug:
                            self.logger.debug(f"📨 WebSocket message: {data}")
                        yield data
                    except json.JSONDecodeError as e:
                        self.logger.error(f"Failed to parse WebSocket message: {e}")
            except websockets.exceptions.ConnectionClosed:
                if self.config.debug:
                    self.logger.debug("🔌 WebSocket connection closed")

# ============================================================================
# Convenience Functions
# ============================================================================

def create_client(api_key: str, **kwargs) -> MemorAIClient:
    """Create a synchronous MemorAI client with the given API key."""
    config = MemorAIClientConfig(api_key=api_key, **kwargs)
    return MemorAIClient(config)

def create_async_client(api_key: str, **kwargs) -> AsyncMemorAIClient:
    """Create an asynchronous MemorAI client with the given API key."""
    config = MemorAIClientConfig(api_key=api_key, **kwargs)
    return AsyncMemorAIClient(config)

# ============================================================================
# Exports
# ============================================================================

__all__ = [
    'MemorAIClient',
    'AsyncMemorAIClient',
    'MemorAIClientConfig',
    'Memory',
    'MemoryMetadata',
    'RememberRequest',
    'RememberResponse',
    'RecallRequest',
    'RecallResponse',
    'ContextResponse',
    'HealthResponse',
    'AnalyticsDashboard',
    'MemorAIError',
    'create_client',
    'create_async_client',
]