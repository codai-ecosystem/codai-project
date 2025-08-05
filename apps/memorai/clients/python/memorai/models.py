"""
MemorAI Python Client - Data Models
Pydantic models for type safety and validation
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict
from enum import Enum


class SearchAlgorithm(str, Enum):
    """Supported search algorithms"""
    EXACT = "exact"
    SEMANTIC = "semantic"
    FULLTEXT = "fulltext"
    FUZZY = "fuzzy"
    HYBRID = "hybrid"


class MemoryStatus(str, Enum):
    """Memory status types"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"


class Memory(BaseModel):
    """MemorAI Memory model"""
    model_config = ConfigDict(
        str_strip_whitespace=True,
        json_encoders={
            datetime: lambda dt: dt.isoformat() if dt else None
        }
    )

    id: Optional[str] = None
    content: str = Field(..., min_length=1, max_length=10000)
    title: Optional[str] = Field(None, max_length=500)
    category: Optional[str] = Field(None, max_length=100)
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    user_id: Optional[str] = None
    collection_id: Optional[str] = None
    status: MemoryStatus = MemoryStatus.ACTIVE
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    embedding: Optional[List[float]] = None
    similarity_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class SearchOptions(BaseModel):
    """Search configuration options"""
    algorithm: SearchAlgorithm = SearchAlgorithm.SEMANTIC
    limit: int = Field(default=20, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    categories: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    user_id: Optional[str] = None
    collection_id: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    min_similarity: Optional[float] = Field(None, ge=0.0, le=1.0)
    include_metadata: bool = True
    include_embeddings: bool = False


class SearchResult(BaseModel):
    """Search results container"""
    memories: List[Memory]
    total_count: int = Field(ge=0)
    query: str
    algorithm: SearchAlgorithm
    execution_time_ms: float = Field(ge=0)
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
    has_more: bool = False


class BatchOperation(BaseModel):
    """Batch operation definition"""
    operation: str = Field(..., pattern="^(create|update|delete)$")
    data: Union[Memory, Dict[str, Any]]
    id: Optional[str] = None


class BatchResult(BaseModel):
    """Batch operation results"""
    successful: List[Memory]
    failed: List[Dict[str, Any]]
    total_processed: int = Field(ge=0)
    success_count: int = Field(ge=0)
    failure_count: int = Field(ge=0)
    execution_time_ms: float = Field(ge=0)


class AnalyticsData(BaseModel):
    """Analytics data model"""
    total_memories: int = Field(ge=0)
    memories_by_category: Dict[str, int] = Field(default_factory=dict)
    memories_by_tag: Dict[str, int] = Field(default_factory=dict)
    search_analytics: Dict[str, Any] = Field(default_factory=dict)
    performance_metrics: Dict[str, float] = Field(default_factory=dict)
    user_activity: Dict[str, Any] = Field(default_factory=dict)
    storage_usage: Dict[str, Any] = Field(default_factory=dict)
    generated_at: datetime = Field(default_factory=datetime.now)


class SystemHealth(BaseModel):
    """System health status"""
    status: str
    timestamp: datetime = Field(default_factory=datetime.now)
    services: Dict[str, Any] = Field(default_factory=dict)
    performance: Dict[str, float] = Field(default_factory=dict)
    version: Optional[str] = None


class APIResponse(BaseModel):
    """Generic API response wrapper"""
    success: bool
    data: Optional[Any] = None
    message: Optional[str] = None
    error: Optional[Dict[str, Any]] = None
    timestamp: datetime = Field(default_factory=datetime.now)


class WebSocketMessage(BaseModel):  
    """WebSocket message format"""
    type: str
    event: str
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.now)


class RateLimitInfo(BaseModel):
    """Rate limiting information"""
    limit: int = Field(ge=0)
    remaining: int = Field(ge=0)  
    reset_at: datetime
    retry_after: Optional[int] = Field(None, ge=0)


class ClientConfig(BaseModel):
    """Client configuration"""
    api_key: Optional[str] = None
    base_url: str = "https://api.memorai.ro"
    timeout: float = Field(default=30.0, gt=0)
    max_retries: int = Field(default=3, ge=0, le=10)
    retry_delay: float = Field(default=1.0, gt=0)
    enable_websocket: bool = True
    websocket_url: Optional[str] = None
    user_agent: str = "MemorAI-Python-Client/1.0.0"
    debug: bool = False
