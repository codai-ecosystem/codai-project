"""
Cache Manager for RomAI Model Server
Provides efficient caching for model inference and reasoning results
"""

import time
import json
import hashlib
import logging
from typing import Any, Optional, Dict, Set
from dataclasses import dataclass
from collections import OrderedDict
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class CacheEntry:
    """Cache entry with metadata"""
    value: Any
    timestamp: float
    access_count: int = 0
    ttl: Optional[float] = None
    
    @property
    def is_expired(self) -> bool:
        """Check if entry is expired"""
        if self.ttl is None:
            return False
        return time.time() - self.timestamp > self.ttl

class CacheManager:
    """High-performance cache manager for RomAI"""
    
    def __init__(self, max_size: int = 10000, default_ttl: Optional[float] = 3600):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self._cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self._lock = asyncio.Lock()
        
        logger.info(f"✅ Cache Manager initialized (max_size={max_size}, ttl={default_ttl}s)")
    
    def _generate_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        key_data = {
            'args': str(args),
            'kwargs': sorted(kwargs.items()) if kwargs else []
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        async with self._lock:
            if key not in self._cache:
                return None
            
            entry = self._cache[key]
            
            # Check if expired
            if entry.is_expired:
                del self._cache[key]
                return None
            
            # Update access info
            entry.access_count += 1
            # Move to end (most recently used)
            self._cache.move_to_end(key)
            
            return entry.value
    
    async def set(self, key: str, value: Any, ttl: Optional[float] = None) -> None:
        """Set value in cache"""
        async with self._lock:
            # Use default TTL if not specified
            if ttl is None:
                ttl = self.default_ttl
            
            # Create new entry
            entry = CacheEntry(
                value=value,
                timestamp=time.time(),
                ttl=ttl
            )
            
            # Add to cache
            self._cache[key] = entry
            self._cache.move_to_end(key)
            
            # Evict if over capacity
            while len(self._cache) > self.max_size:
                oldest_key = next(iter(self._cache))
                del self._cache[oldest_key]
    
    async def cache_result(self, func_name: str, *args, **kwargs):
        """Decorator-friendly cache result method"""
        key = f"{func_name}:{self._generate_key(*args, **kwargs)}"
        return await self.get(key), key
    
    async def store_result(self, key: str, result: Any, ttl: Optional[float] = None):
        """Store function result"""
        await self.set(key, result, ttl)
    
    async def clear(self) -> None:
        """Clear all cache entries"""
        async with self._lock:
            self._cache.clear()
            logger.info("🗑️ Cache cleared")
    
    async def cleanup_expired(self) -> int:
        """Remove expired entries"""
        async with self._lock:
            expired_keys = []
            for key, entry in self._cache.items():
                if entry.is_expired:
                    expired_keys.append(key)
            
            for key in expired_keys:
                del self._cache[key]
            
            logger.info(f"🧹 Cleaned up {len(expired_keys)} expired entries")
            return len(expired_keys)
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            'size': len(self._cache),
            'max_size': self.max_size,
            'hit_rate': self._calculate_hit_rate(),
            'memory_usage': self._estimate_memory_usage()
        }
    
    def _calculate_hit_rate(self) -> float:
        """Calculate cache hit rate"""
        if not self._cache:
            return 0.0
        
        total_access = sum(entry.access_count for entry in self._cache.values())
        if total_access == 0:
            return 0.0
        
        return len(self._cache) / total_access
    
    def _estimate_memory_usage(self) -> int:
        """Estimate memory usage in bytes"""
        # Rough estimation
        return len(self._cache) * 1024  # 1KB per entry estimate

# Global cache instance
cache_manager = CacheManager()

# Alias for compatibility with RomAI system
RomAICacheManager = CacheManager

# Convenience functions
async def get_cached(key: str) -> Optional[Any]:
    """Get cached value"""
    return await cache_manager.get(key)

async def set_cached(key: str, value: Any, ttl: Optional[float] = None) -> None:
    """Set cached value"""
    await cache_manager.set(key, value, ttl)

async def cache_function_result(func_name: str, result: Any, *args, **kwargs):
    """Cache function result"""
    key = f"{func_name}:{cache_manager._generate_key(*args, **kwargs)}"
    await cache_manager.set(key, result)

logger.info("✅ Cache Manager module loaded successfully")