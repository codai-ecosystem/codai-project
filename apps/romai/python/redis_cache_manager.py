"""
RomAI AGI Advanced Caching System
Redis-based intelligent caching for Azure OpenAI responses and Romanian cultural data
Week 2 Day 1 Implementation

Features:
- Intelligent TTL based on content type
- Cache invalidation strategies
- Performance monitoring
- Romanian content-aware caching
- Cost optimization through cache hit analysis
"""

import redis
import json
import hashlib
import asyncio
import time
from typing import Any, Dict, Optional, Union, List
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CacheContentType(Enum):
    """Content types for intelligent TTL management"""
    AZURE_OPENAI_RESPONSE = "azure_openai"
    CULTURAL_ENTITY = "cultural_entity"
    QUERY_ROUTING = "query_routing"
    ROMANIAN_PROCESSING = "romanian_processing"
    ANALYTICS_DATA = "analytics"
    USER_SESSION = "user_session"

@dataclass
class CacheMetrics:
    """Cache performance metrics"""
    hits: int = 0
    misses: int = 0
    sets: int = 0
    invalidations: int = 0
    total_response_time_saved: float = 0.0
    total_cost_saved: float = 0.0
    
    @property
    def hit_rate(self) -> float:
        total = self.hits + self.misses
        return (self.hits / total * 100) if total > 0 else 0.0
    
    @property
    def average_time_saved(self) -> float:
        return (self.total_response_time_saved / self.hits) if self.hits > 0 else 0.0

@dataclass
class CacheEntry:
    """Cache entry with metadata"""
    data: Any
    content_type: CacheContentType
    created_at: datetime
    expires_at: datetime
    access_count: int = 0
    last_accessed: Optional[datetime] = None
    metadata: Dict[str, Any] = None
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'data': self.data,
            'content_type': self.content_type.value,
            'created_at': self.created_at.isoformat(),
            'expires_at': self.expires_at.isoformat(),
            'access_count': self.access_count,
            'last_accessed': self.last_accessed.isoformat() if self.last_accessed else None,
            'metadata': self.metadata or {}
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'CacheEntry':
        return cls(
            data=data['data'],
            content_type=CacheContentType(data['content_type']),
            created_at=datetime.fromisoformat(data['created_at']),
            expires_at=datetime.fromisoformat(data['expires_at']),
            access_count=data.get('access_count', 0),
            last_accessed=datetime.fromisoformat(data['last_accessed']) if data.get('last_accessed') else None,
            metadata=data.get('metadata', {})
        )

class RedisCacheManager:
    """
    Advanced Redis cache manager for RomAI AGI system
    Provides intelligent caching with content-aware TTL and performance monitoring
    """
    
    def __init__(
        self,
        redis_url: str = "redis://localhost:6379/0",
        key_prefix: str = "romai:cache:",
        default_ttl: int = 3600,  # 1 hour
        max_key_length: int = 250,
        enable_compression: bool = True
    ):
        """
        Initialize Redis cache manager
        
        Args:
            redis_url: Redis connection URL
            key_prefix: Prefix for all cache keys
            default_ttl: Default TTL in seconds
            max_key_length: Maximum cache key length
            enable_compression: Enable JSON compression for large objects
        """
        self.redis_url = redis_url
        self.key_prefix = key_prefix
        self.default_ttl = default_ttl
        self.max_key_length = max_key_length
        self.enable_compression = enable_compression
        
        # Initialize Redis client (mock mode for development without Redis)
        self.redis_client = None
        self.mock_mode = False
        self.mock_cache = {}  # In-memory cache for mock mode
        
        # Content-specific TTL settings
        self.ttl_config = {
            CacheContentType.AZURE_OPENAI_RESPONSE: 7200,  # 2 hours
            CacheContentType.CULTURAL_ENTITY: 86400,       # 24 hours (cultural data changes slowly)
            CacheContentType.QUERY_ROUTING: 3600,          # 1 hour
            CacheContentType.ROMANIAN_PROCESSING: 43200,   # 12 hours
            CacheContentType.ANALYTICS_DATA: 300,          # 5 minutes (frequent updates)
            CacheContentType.USER_SESSION: 1800            # 30 minutes
        }
        
        # Performance metrics
        self.metrics = CacheMetrics()
        
        # Initialize connection
        self._initialize_redis()
    
    def _initialize_redis(self):
        """Initialize Redis connection with fallback to mock mode"""
        try:
            import redis
            self.redis_client = redis.from_url(self.redis_url)
            # Test connection
            self.redis_client.ping()
            logger.info("Redis cache manager initialized successfully")
        except Exception as e:
            logger.warning(f"Redis not available, falling back to mock mode: {e}")
            self.mock_mode = True
            self.redis_client = None
    
    def _generate_cache_key(self, key: str, content_type: CacheContentType) -> str:
        """Generate cache key with prefix and content type"""
        # Create hash for long keys
        if len(key) > self.max_key_length:
            key_hash = hashlib.md5(key.encode()).hexdigest()
            key = f"{key[:50]}...{key_hash}"
        
        cache_key = f"{self.key_prefix}{content_type.value}:{key}"
        return cache_key
    
    def _serialize_data(self, data: Any) -> str:
        """Serialize data for caching with compression if enabled"""
        try:
            json_str = json.dumps(data, ensure_ascii=False, default=str)
            
            if self.enable_compression and len(json_str) > 1000:
                # Simple compression simulation (in production, use gzip)
                compressed_indicator = "COMPRESSED:"
                return compressed_indicator + json_str
            
            return json_str
        except Exception as e:
            logger.error(f"Serialization error: {e}")
            return "{}"
    
    def _deserialize_data(self, data_str: str) -> Any:
        """Deserialize cached data with decompression if needed"""
        try:
            if data_str.startswith("COMPRESSED:"):
                # Remove compression indicator (in production, use gzip.decompress)
                data_str = data_str[len("COMPRESSED:"):]
            
            return json.loads(data_str)
        except Exception as e:
            logger.error(f"Deserialization error: {e}")
            return None
    
    async def get(
        self, 
        key: str, 
        content_type: CacheContentType = CacheContentType.AZURE_OPENAI_RESPONSE
    ) -> Optional[Any]:
        """
        Get cached data
        
        Args:
            key: Cache key
            content_type: Type of content for appropriate TTL
            
        Returns:
            Cached data or None if not found/expired
        """
        cache_key = self._generate_cache_key(key, content_type)
        
        try:
            if self.mock_mode:
                # Mock mode - use in-memory cache
                if cache_key in self.mock_cache:
                    entry_data = self.mock_cache[cache_key]
                    entry = CacheEntry.from_dict(entry_data)
                    
                    # Check expiration
                    if datetime.now() > entry.expires_at:
                        del self.mock_cache[cache_key]
                        self.metrics.misses += 1
                        return None
                    
                    # Update access tracking
                    entry.access_count += 1
                    entry.last_accessed = datetime.now()
                    self.mock_cache[cache_key] = entry.to_dict()
                    
                    self.metrics.hits += 1
                    return entry.data
                else:
                    self.metrics.misses += 1
                    return None
            else:
                # Real Redis mode
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    entry_dict = self._deserialize_data(cached_data.decode())
                    if entry_dict:
                        entry = CacheEntry.from_dict(entry_dict)
                        
                        # Update access tracking
                        entry.access_count += 1
                        entry.last_accessed = datetime.now()
                        
                        # Update cache with access info
                        updated_data = self._serialize_data(entry.to_dict())
                        self.redis_client.set(cache_key, updated_data, ex=int((entry.expires_at - datetime.now()).total_seconds()))
                        
                        self.metrics.hits += 1
                        return entry.data
                
                self.metrics.misses += 1
                return None
                
        except Exception as e:
            logger.error(f"Cache get error: {e}")
            self.metrics.misses += 1
            return None
    
    async def set(
        self,
        key: str,
        data: Any,
        content_type: CacheContentType = CacheContentType.AZURE_OPENAI_RESPONSE,
        ttl: Optional[int] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Set cached data with intelligent TTL
        
        Args:
            key: Cache key
            data: Data to cache
            content_type: Type of content for appropriate TTL
            ttl: Custom TTL in seconds (overrides content type default)
            metadata: Additional metadata for the cache entry
            
        Returns:
            True if successful, False otherwise
        """
        cache_key = self._generate_cache_key(key, content_type)
        
        # Determine TTL
        effective_ttl = ttl or self.ttl_config.get(content_type, self.default_ttl)
        
        # Create cache entry
        entry = CacheEntry(
            data=data,
            content_type=content_type,
            created_at=datetime.now(),
            expires_at=datetime.now() + timedelta(seconds=effective_ttl),
            metadata=metadata or {}
        )
        
        try:
            if self.mock_mode:
                # Mock mode - use in-memory cache
                self.mock_cache[cache_key] = entry.to_dict()
                self.metrics.sets += 1
                return True
            else:
                # Real Redis mode
                serialized_entry = self._serialize_data(entry.to_dict())
                result = self.redis_client.set(cache_key, serialized_entry, ex=effective_ttl)
                
                if result:
                    self.metrics.sets += 1
                    return True
                
                return False
                
        except Exception as e:
            logger.error(f"Cache set error: {e}")
            return False
    
    async def delete(self, key: str, content_type: CacheContentType) -> bool:
        """Delete cache entry"""
        cache_key = self._generate_cache_key(key, content_type)
        
        try:
            if self.mock_mode:
                if cache_key in self.mock_cache:
                    del self.mock_cache[cache_key]
                    self.metrics.invalidations += 1
                    return True
                return False
            else:
                result = self.redis_client.delete(cache_key)
                if result:
                    self.metrics.invalidations += 1
                    return True
                return False
                
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
            return False
    
    async def invalidate_pattern(self, pattern: str, content_type: Optional[CacheContentType] = None) -> int:
        """
        Invalidate cache entries matching a pattern
        
        Args:
            pattern: Pattern to match (supports wildcards)
            content_type: Optional content type filter
            
        Returns:
            Number of invalidated entries
        """
        if content_type:
            search_pattern = f"{self.key_prefix}{content_type.value}:{pattern}"
        else:
            search_pattern = f"{self.key_prefix}*:{pattern}"
        
        invalidated_count = 0
        
        try:
            if self.mock_mode:
                # Mock mode pattern matching
                keys_to_delete = []
                for key in self.mock_cache.keys():
                    if self._pattern_match(key, search_pattern):
                        keys_to_delete.append(key)
                
                for key in keys_to_delete:
                    del self.mock_cache[key]
                    invalidated_count += 1
            else:
                # Real Redis mode
                keys = self.redis_client.keys(search_pattern)
                if keys:
                    invalidated_count = self.redis_client.delete(*keys)
            
            self.metrics.invalidations += invalidated_count
            return invalidated_count
            
        except Exception as e:
            logger.error(f"Cache pattern invalidation error: {e}")
            return 0
    
    def _pattern_match(self, key: str, pattern: str) -> bool:
        """Simple pattern matching for mock mode"""
        import fnmatch
        return fnmatch.fnmatch(key, pattern)
    
    async def get_cache_info(self) -> Dict[str, Any]:
        """Get cache information and metrics"""
        try:
            if self.mock_mode:
                total_keys = len(self.mock_cache)
                memory_usage = sum(len(str(v)) for v in self.mock_cache.values())
            else:
                info = self.redis_client.info()
                total_keys = info.get('db0', {}).get('keys', 0) if 'db0' in info else 0
                memory_usage = info.get('used_memory', 0)
            
            return {
                'mode': 'mock' if self.mock_mode else 'redis',
                'total_keys': total_keys,
                'memory_usage': memory_usage,
                'metrics': asdict(self.metrics),
                'ttl_config': {ct.value: ttl for ct, ttl in self.ttl_config.items()},
                'performance': {
                    'hit_rate_percentage': self.metrics.hit_rate,
                    'average_time_saved_ms': self.metrics.average_time_saved * 1000,
                    'total_cost_saved_usd': self.metrics.total_cost_saved
                }
            }
            
        except Exception as e:
            logger.error(f"Cache info error: {e}")
            return {'error': str(e)}
    
    async def clear_all(self) -> bool:
        """Clear all cache entries (use with caution!)"""
        try:
            if self.mock_mode:
                self.mock_cache.clear()
                return True
            else:
                # Delete all keys with our prefix
                keys = self.redis_client.keys(f"{self.key_prefix}*")
                if keys:
                    self.redis_client.delete(*keys)
                return True
                
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return False
    
    def record_performance_gain(self, response_time_saved: float, cost_saved: float = 0.0):
        """Record performance gains from cache hits"""
        self.metrics.total_response_time_saved += response_time_saved
        self.metrics.total_cost_saved += cost_saved
    
    async def cleanup_expired(self) -> int:
        """Clean up expired entries (mainly for mock mode)"""
        if not self.mock_mode:
            # Redis handles expiration automatically
            return 0
        
        current_time = datetime.now()
        expired_keys = []
        
        for key, entry_data in self.mock_cache.items():
            try:
                entry = CacheEntry.from_dict(entry_data)
                if current_time > entry.expires_at:
                    expired_keys.append(key)
            except Exception:
                # Invalid entry, mark for deletion
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.mock_cache[key]
        
        return len(expired_keys)

# Example usage and testing
async def test_cache_manager():
    """Test the Redis cache manager functionality"""
    print("🧪 Testing RomAI Redis Cache Manager...")
    
    cache = RedisCacheManager()
    
    # Test basic caching
    test_data = {
        "query": "Care sunt principalele orașe din România?",
        "response": "Principalele orașe din România sunt București (capitala), Cluj-Napoca, Timișoara, Iași, Constanța și Craiova.",
        "cultural_entities": ["București", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova"],
        "processing_time": 0.150,
        "cost": 0.004
    }
    
    # Set cache entry
    success = await cache.set(
        key="romanian_cities_query",
        data=test_data,
        content_type=CacheContentType.AZURE_OPENAI_RESPONSE,
        metadata={"language": "romanian", "complexity": "medium"}
    )
    print(f"✅ Cache set: {success}")
    
    # Get cache entry
    cached_data = await cache.get("romanian_cities_query", CacheContentType.AZURE_OPENAI_RESPONSE)
    print(f"✅ Cache get: {cached_data is not None}")
    
    if cached_data:
        print(f"📝 Cached response: {cached_data['response'][:50]}...")
    
    # Test cultural entity caching
    cultural_data = {
        "entity": "Mihai Eminescu",
        "type": "literary_figure",
        "description": "Poetul național al României",
        "birth_year": 1850,
        "works": ["Luceafărul", "Floare albastră", "Călin"]
    }
    
    await cache.set(
        key="eminescu_entity",
        data=cultural_data,
        content_type=CacheContentType.CULTURAL_ENTITY
    )
    
    # Test cache metrics
    cache_info = await cache.get_cache_info()
    print(f"📊 Cache info: {cache_info}")
    
    # Test performance gains
    cache.record_performance_gain(response_time_saved=0.120, cost_saved=0.003)
    
    updated_info = await cache.get_cache_info()
    print(f"📈 Updated metrics: {updated_info['performance']}")
    
    print("🎯 Redis Cache Manager test completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_cache_manager())
