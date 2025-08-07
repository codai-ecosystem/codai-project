"""
MemorAI Python SDK
Official Python client library for the MemorAI REST API

Usage:
    from memorai_sdk import MemorAI, Memory
    
    client = MemorAI(
        api_key="your-api-key",
        base_url="https://api.memorai.ro"
    )
    
    # Create a memory
    memory = client.create_memory(
        content="Your memory content",
        agent_id="your-agent-id",
        tags=["ai", "memory"]
    )
    
    # Search memories
    results = client.search_memories(
        query="search term",
        limit=10
    )
"""

import json
import time
from datetime import datetime
from typing import Dict, List, Optional, Union, Any, BinaryIO
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

__version__ = "1.0.0"
__author__ = "MemorAI Team"
__email__ = "support@memorai.ro"


class MemorAIError(Exception):
    """Base exception for MemorAI SDK errors"""
    
    def __init__(self, message: str, code: str = None, details: Any = None):
        super().__init__(message)
        self.code = code
        self.details = details


class MemorAIAPIError(MemorAIError):
    """Exception for API-related errors"""
    
    def __init__(self, message: str, status_code: int, code: str = None, details: Any = None):
        super().__init__(message, code, details)
        self.status_code = status_code


class MemorAIAuthError(MemorAIAPIError):
    """Exception for authentication errors"""
    pass


class MemorAIRateLimitError(MemorAIAPIError):
    """Exception for rate limit errors"""
    pass


class Memory:
    """Represents a memory object"""
    
    def __init__(self, **kwargs):
        self.id: Optional[str] = kwargs.get('id')
        self.structured_key: Optional[str] = kwargs.get('structuredKey')
        self.content: str = kwargs.get('content', '')
        self.agent_id: str = kwargs.get('agentId', '')
        self.importance: Optional[int] = kwargs.get('importance')
        self.project: Optional[str] = kwargs.get('project')
        self.tags: List[str] = kwargs.get('tags', [])
        self.created_at: Optional[str] = kwargs.get('createdAt')
        self.updated_at: Optional[str] = kwargs.get('updatedAt')
        self.metadata: Dict[str, Any] = kwargs.get('metadata', {})
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert memory to dictionary"""
        return {
            'id': self.id,
            'structuredKey': self.structured_key,
            'content': self.content,
            'agentId': self.agent_id,
            'importance': self.importance,
            'project': self.project,
            'tags': self.tags,
            'createdAt': self.created_at,
            'updatedAt': self.updated_at,
            'metadata': self.metadata
        }
    
    def __repr__(self):
        return f"Memory(id='{self.id}', content='{self.content[:50]}...', agent_id='{self.agent_id}')"


class MemorAI:
    """Official Python client for MemorAI REST API"""
    
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://api.memorai.ro",
        timeout: int = 30,
        max_retries: int = 3,
        user_agent: str = None
    ):
        """
        Initialize MemorAI client
        
        Args:
            api_key: Your MemorAI API key
            base_url: Base URL for the API
            timeout: Request timeout in seconds
            max_retries: Maximum number of retries for failed requests
            user_agent: Custom user agent string
        """
        if not api_key:
            raise MemorAIError("API key is required", "MISSING_API_KEY")
        
        self.api_key = api_key
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.user_agent = user_agent or f"MemorAI-Python-SDK/{__version__}"
        
        # Setup session with retries
        self.session = requests.Session()
        
        retry_strategy = Retry(
            total=max_retries,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "OPTIONS", "POST", "PUT", "DELETE"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        # Set default headers
        self.session.headers.update({
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'User-Agent': self.user_agent
        })
    
    def _request(
        self,
        method: str,
        endpoint: str,
        params: Dict[str, Any] = None,
        data: Any = None,
        files: Dict[str, Any] = None,
        stream: bool = False
    ) -> requests.Response:
        """Make HTTP request to API"""
        url = f"{self.base_url}{endpoint}"
        
        kwargs = {
            'timeout': self.timeout,
            'params': params,
            'stream': stream
        }
        
        if files:
            kwargs['files'] = files
            if data:
                kwargs['data'] = data
        elif data is not None:
            kwargs['json'] = data
        
        try:
            response = self.session.request(method, url, **kwargs)
            
            # Handle authentication errors
            if response.status_code == 401:
                raise MemorAIAuthError(
                    "Authentication failed. Check your API key.",
                    response.status_code,
                    "AUTH_FAILED"
                )
            
            # Handle rate limiting
            if response.status_code == 429:
                raise MemorAIRateLimitError(
                    "Rate limit exceeded. Please retry later.",
                    response.status_code,
                    "RATE_LIMIT_EXCEEDED"
                )
            
            # Handle other HTTP errors
            if not response.ok:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('error', {}).get('message', f'HTTP {response.status_code}')
                    error_code = error_data.get('error', {}).get('code', 'API_ERROR')
                    error_details = error_data.get('error', {}).get('details')
                except (json.JSONDecodeError, KeyError):
                    error_msg = f'HTTP {response.status_code}: {response.reason}'
                    error_code = 'HTTP_ERROR'
                    error_details = None
                
                raise MemorAIAPIError(error_msg, response.status_code, error_code, error_details)
            
            return response
            
        except requests.exceptions.RequestException as e:
            raise MemorAIError(f"Request failed: {str(e)}", "NETWORK_ERROR", {"original_error": str(e)})
    
    def create_memory(
        self,
        content: str,
        agent_id: str,
        importance: Optional[int] = None,
        project: Optional[str] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Memory:
        """
        Create a new memory
        
        Args:
            content: Memory content
            agent_id: Agent identifier
            importance: Importance score (0-10)
            project: Project name
            tags: List of tags
            metadata: Additional metadata
            
        Returns:
            Created Memory object
        """
        data = {
            'content': content,
            'agentId': agent_id,
            'importance': importance,
            'project': project,
            'tags': tags or [],
            'metadata': metadata or {}
        }
        
        response = self._request('POST', '/api/memories', data=data)
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to create memory'), error.get('code'))
        
        return Memory(**result['data'])
    
    def get_memories(
        self,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: Optional[int] = None
    ) -> List[Memory]:
        """
        Get all memories with optional filtering
        
        Args:
            category: Filter by category
            tags: Filter by tags
            limit: Maximum number of memories to return
            
        Returns:
            List of Memory objects
        """
        params = {}
        if category:
            params['category'] = category
        if tags:
            params['tags'] = ','.join(tags)
        if limit:
            params['limit'] = str(limit)
        
        response = self._request('GET', '/api/memories', params=params)
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to fetch memories'), error.get('code'))
        
        return [Memory(**memory) for memory in result['data']]
    
    def get_memory(self, memory_id: str) -> Memory:
        """
        Get a specific memory by ID
        
        Args:
            memory_id: Memory ID
            
        Returns:
            Memory object
        """
        response = self._request('GET', f'/api/memories/{memory_id}')
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to fetch memory'), error.get('code'))
        
        return Memory(**result['data'])
    
    def update_memory(
        self,
        memory_id: str,
        content: Optional[str] = None,
        importance: Optional[int] = None,
        project: Optional[str] = None,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Memory:
        """
        Update a memory
        
        Args:
            memory_id: Memory ID
            content: Updated content
            importance: Updated importance score
            project: Updated project name
            tags: Updated tags
            metadata: Updated metadata
            
        Returns:
            Updated Memory object
        """
        data = {}
        if content is not None:
            data['content'] = content
        if importance is not None:
            data['importance'] = importance
        if project is not None:
            data['project'] = project
        if tags is not None:
            data['tags'] = tags
        if metadata is not None:
            data['metadata'] = metadata
        
        response = self._request('PUT', f'/api/memories/{memory_id}', data=data)
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to update memory'), error.get('code'))
        
        return Memory(**result['data'])
    
    def delete_memory(self, memory_id: str) -> bool:
        """
        Delete a memory
        
        Args:
            memory_id: Memory ID
            
        Returns:
            True if deletion was successful
        """
        response = self._request('DELETE', f'/api/memories/{memory_id}')
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to delete memory'), error.get('code'))
        
        return result['data'].get('deleted', False)
    
    def search_memories(
        self,
        query: str,
        limit: Optional[int] = None,
        project: Optional[str] = None,
        tags: Optional[List[str]] = None,
        importance_min: Optional[int] = None,
        importance_max: Optional[int] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> List[Memory]:
        """
        Search memories
        
        Args:
            query: Search query
            limit: Maximum number of results
            project: Filter by project
            tags: Filter by tags
            importance_min: Minimum importance score
            importance_max: Maximum importance score
            date_from: Start date (ISO format)
            date_to: End date (ISO format)
            
        Returns:
            List of Memory objects
        """
        params = {'q': query}
        if limit:
            params['limit'] = str(limit)
        if project:
            params['project'] = project
        if tags:
            params['tags'] = ','.join(tags)
        if importance_min is not None:
            params['importanceMin'] = str(importance_min)
        if importance_max is not None:
            params['importanceMax'] = str(importance_max)
        if date_from:
            params['dateFrom'] = date_from
        if date_to:
            params['dateTo'] = date_to
        
        response = self._request('GET', '/api/search', params=params)
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to search memories'), error.get('code'))
        
        return [Memory(**memory) for memory in result['data']]
    
    def export_memories(
        self,
        format: str = 'json',
        project: Optional[str] = None,
        tags: Optional[List[str]] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> bytes:
        """
        Export memories
        
        Args:
            format: Export format ('json' or 'csv')
            project: Filter by project
            tags: Filter by tags
            date_from: Start date (ISO format)
            date_to: End date (ISO format)
            
        Returns:
            Export data as bytes
        """
        params = {'format': format}
        if project:
            params['project'] = project
        if tags:
            params['tags'] = ','.join(tags)
        if date_from:
            params['dateFrom'] = date_from
        if date_to:
            params['dateTo'] = date_to
        
        response = self._request('GET', '/api/memories/export', params=params, stream=True)
        return response.content
    
    def import_memories(
        self,
        memories: List[Dict[str, Any]],
        skip_duplicates: bool = True,
        update_existing: bool = False,
        preserve_timestamps: bool = False
    ) -> Dict[str, Any]:
        """
        Import memories
        
        Args:
            memories: List of memory dictionaries
            skip_duplicates: Skip duplicate memories
            update_existing: Update existing memories
            preserve_timestamps: Preserve original timestamps
            
        Returns:
            Import summary dictionary
        """
        data = {
            'memories': memories,
            'options': {
                'skipDuplicates': skip_duplicates,
                'updateExisting': update_existing,
                'preserveTimestamps': preserve_timestamps
            }
        }
        
        response = self._request('POST', '/api/memories/import', data=data)
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to import memories'), error.get('code'))
        
        return result['data']
    
    def get_health(self) -> Dict[str, Any]:
        """
        Get API health status
        
        Returns:
            Health status dictionary
        """
        response = self._request('GET', '/api/health')
        result = response.json()
        
        if not result.get('success'):
            error = result.get('error', {})
            raise MemorAIError(error.get('message', 'Failed to get health status'), error.get('code'))
        
        return result['data']
    
    def close(self):
        """Close the session"""
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# Convenience functions
def create_client(api_key: str, **kwargs) -> MemorAI:
    """Create a MemorAI client instance"""
    return MemorAI(api_key=api_key, **kwargs)


# Export main classes
__all__ = [
    'MemorAI',
    'Memory',
    'MemorAIError',
    'MemorAIAPIError',
    'MemorAIAuthError',
    'MemorAIRateLimitError',
    'create_client'
]
