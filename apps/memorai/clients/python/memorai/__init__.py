"""
MemorAI Python Client Library
Official Python client for the MemorAI platform

Usage:
    from memorai import MemorAI
    
    client = MemorAI(
        api_key="your-api-key",
        base_url="https://api.memorai.ro"
    )
    
    # Create a memory
    memory = client.memories.create(
        content="Your memory content",
        title="Memory Title",
        tags=["ai", "memory"]
    )
    
    # Search memories
    results = client.search.query(
        query="search term",
        algorithm="semantic",
        limit=10
    )
"""

__version__ = "1.0.0"
__author__ = "MemorAI Team"
__email__ = "support@memorai.ro"

from .client import MemorAI
from .models import Memory, SearchResult, AnalyticsData
from .exceptions import (
    MemorAIError,
    MemorAIAPIError,
    MemorAIAuthError,
    MemorAIRateLimitError,
    MemorAIConnectionError
)

__all__ = [
    # Main client
    'MemorAI',
    
    # Models
    'Memory',
    'SearchResult', 
    'AnalyticsData',
    
    # Exceptions
    'MemorAIError',
    'MemorAIAPIError',
    'MemorAIAuthError',
    'MemorAIRateLimitError',
    'MemorAIConnectionError',
]
