# RomAI AGI Real Model Integration - Redis Caching Layer
# Production caching system for model outputs and performance optimization

import redis.asyncio as redis
import json
import hashlib
import pickle
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import asyncio
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class CacheConfig:
    """Redis cache configuration for RomAI AGI"""
    host: str = "localhost"
    port: int = 6379
    db: int = 0
    password: Optional[str] = None
    socket_timeout: float = 5.0
    socket_connect_timeout: float = 5.0
    retry_on_timeout: bool = True
    max_connections: int = 20
    
    # Cache TTL settings (seconds)
    model_cache_ttl: int = 3600  # 1 hour for model outputs
    health_cache_ttl: int = 60   # 1 minute for health checks
    intelligence_cache_ttl: int = 1800  # 30 minutes for intelligence responses
    metrics_cache_ttl: int = 300  # 5 minutes for metrics

class RomAICacheManager:
    """Production Redis cache manager for RomAI AGI system"""
    
    def __init__(self, config: CacheConfig = None):
        self.config = config or CacheConfig()
        self.redis_client = None
        self.connection_pool = None
        self.stats = {
            "hits": 0,
            "misses": 0,
            "errors": 0,
            "total_requests": 0
        }
        
    async def initialize(self):
        """Initialize Redis connection with production settings"""
        try:
            # Create connection pool for better performance - Day 6 Enhanced
            self.connection_pool = redis.ConnectionPool(
                host=self.config.host,
                port=self.config.port,
                db=self.config.db,
                password=self.config.password,
                socket_timeout=self.config.socket_timeout,
                socket_connect_timeout=self.config.socket_connect_timeout,
                retry_on_timeout=self.config.retry_on_timeout,
                max_connections=self.config.max_connections,
                decode_responses=True
            )
            
            self.redis_client = redis.Redis(connection_pool=self.connection_pool)
            
            # Test connection
            await self.redis_client.ping()
            logger.info("✅ Redis cache connection established successfully")
            
            # Set up cache key prefixes
            self.prefixes = {
                "model": "romai:model:",
                "intelligence": "romai:intelligence:",
                "health": "romai:health:",
                "metrics": "romai:metrics:",
                "reasoning": "romai:reasoning:",
                "cultural": "romai:cultural:"
            }
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Redis connection failed: {str(e)}")
            # Graceful fallback - system works without cache
            self.redis_client = None
            return False
    
    def _generate_cache_key(self, prefix: str, data: Dict[str, Any]) -> str:
        """Generate consistent cache key from input data"""
        # Create deterministic hash from sorted data
        data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        hash_object = hashlib.sha256(data_str.encode('utf-8'))
        return f"{prefix}{hash_object.hexdigest()[:16]}"
    
    async def get_model_output(self, model_type: str, input_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get cached model output if available"""
        if not self.redis_client:
            return None
            
        try:
            self.stats["total_requests"] += 1
            
            cache_key = self._generate_cache_key(
                self.prefixes["model"] + f"{model_type}:",
                input_data
            )
            
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                self.stats["hits"] += 1
                result = json.loads(cached_data)
                result["from_cache"] = True
                result["cache_hit_time"] = datetime.now().isoformat()
                logger.debug(f"🎯 Cache HIT for {model_type}: {cache_key[:16]}...")
                return result
            else:
                self.stats["misses"] += 1
                logger.debug(f"❌ Cache MISS for {model_type}: {cache_key[:16]}...")
                return None
                
        except Exception as e:
            self.stats["errors"] += 1
            logger.warning(f"⚠️ Cache get error: {str(e)}")
            return None
    
    async def set_model_output(self, model_type: str, input_data: Dict[str, Any], output: Dict[str, Any]):
        """Cache model output with appropriate TTL"""
        if not self.redis_client:
            return
            
        try:
            cache_key = self._generate_cache_key(
                self.prefixes["model"] + f"{model_type}:",
                input_data
            )
            
            # Add cache metadata
            output_with_meta = {
                **output,
                "cached_at": datetime.now().isoformat(),
                "cache_key": cache_key[:16],
                "model_type": model_type
            }
            
            await self.redis_client.setex(
                cache_key,
                self.config.model_cache_ttl,
                json.dumps(output_with_meta, ensure_ascii=False)
            )
            
            logger.debug(f"💾 Cached {model_type} output: {cache_key[:16]}...")
            
        except Exception as e:
            self.stats["errors"] += 1
            logger.warning(f"⚠️ Cache set error: {str(e)}")
    
    async def get_intelligence_response(self, query: str, mode: str) -> Optional[Dict[str, Any]]:
        """Get cached intelligence processing response"""
        if not self.redis_client:
            return None
            
        try:
            cache_key = self._generate_cache_key(
                self.prefixes["intelligence"],
                {"query": query, "mode": mode}
            )
            
            cached_data = await self.redis_client.get(cache_key)
            if cached_data:
                self.stats["hits"] += 1
                result = json.loads(cached_data)
                result["from_cache"] = True
                logger.debug(f"🧠 Intelligence cache HIT: {query[:30]}...")
                return result
            else:
                self.stats["misses"] += 1
                return None
                
        except Exception as e:
            self.stats["errors"] += 1
            logger.warning(f"⚠️ Intelligence cache error: {str(e)}")
            return None
    
    async def set_intelligence_response(self, query: str, mode: str, response: Dict[str, Any]):
        """Cache intelligence processing response"""
        if not self.redis_client:
            return
            
        try:
            cache_key = self._generate_cache_key(
                self.prefixes["intelligence"],
                {"query": query, "mode": mode}
            )
            
            response_with_meta = {
                **response,
                "cached_at": datetime.now().isoformat(),
                "query_hash": cache_key[:16]
            }
            
            await self.redis_client.setex(
                cache_key,
                self.config.intelligence_cache_ttl,
                json.dumps(response_with_meta, ensure_ascii=False)
            )
            
            logger.debug(f"🧠 Cached intelligence response: {query[:30]}...")
            
        except Exception as e:
            self.stats["errors"] += 1
            logger.warning(f"⚠️ Intelligence cache set error: {str(e)}")
    
    async def invalidate_pattern(self, pattern: str):
        """Invalidate cache keys matching pattern"""
        if not self.redis_client:
            return
            
        try:
            keys = await self.redis_client.keys(pattern)
            if keys:
                await self.redis_client.delete(*keys)
                logger.info(f"🗑️ Invalidated {len(keys)} cache keys: {pattern}")
        except Exception as e:
            logger.warning(f"⚠️ Cache invalidation error: {str(e)}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get comprehensive cache performance statistics"""
        try:
            if not self.redis_client:
                return {"status": "disabled", "stats": self.stats}
            
            # Redis server info
            info = await self.redis_client.info()
            
            # Calculate hit rate
            total_cache_requests = self.stats["hits"] + self.stats["misses"]
            hit_rate = (self.stats["hits"] / total_cache_requests * 100) if total_cache_requests > 0 else 0
            
            # Get key counts by prefix
            key_counts = {}
            for prefix_name, prefix in self.prefixes.items():
                keys = await self.redis_client.keys(f"{prefix}*")
                key_counts[prefix_name] = len(keys)
            
            return {
                "status": "active",
                "connection": "healthy",
                "stats": {
                    **self.stats,
                    "hit_rate_percent": round(hit_rate, 2),
                    "total_cache_requests": total_cache_requests
                },
                "redis_info": {
                    "version": info.get("redis_version"),
                    "uptime_seconds": info.get("uptime_in_seconds"),
                    "connected_clients": info.get("connected_clients"),
                    "used_memory_human": info.get("used_memory_human"),
                    "keyspace_hits": info.get("keyspace_hits"),
                    "keyspace_misses": info.get("keyspace_misses")
                },
                "key_counts": key_counts,
                "config": {
                    "host": self.config.host,
                    "port": self.config.port,
                    "max_connections": self.config.max_connections,
                    "ttl_settings": {
                        "model_cache": self.config.model_cache_ttl,
                        "intelligence_cache": self.config.intelligence_cache_ttl,
                        "health_cache": self.config.health_cache_ttl,
                        "metrics_cache": self.config.metrics_cache_ttl
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Cache stats error: {str(e)}")
            return {"status": "error", "error": str(e), "stats": self.stats}
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive cache health check"""
        try:
            if not self.redis_client:
                return {"status": "disabled", "healthy": False}
            
            start_time = time.time()
            
            # Test basic operations
            test_key = "romai:health:test"
            test_value = {"test": True, "timestamp": datetime.now().isoformat()}
            
            # Set test
            await self.redis_client.setex(test_key, 60, json.dumps(test_value))
            
            # Get test
            retrieved = await self.redis_client.get(test_key)
            if not retrieved:
                raise Exception("Test key retrieval failed")
            
            # Delete test
            await self.redis_client.delete(test_key)
            
            latency = (time.time() - start_time) * 1000  # ms
            
            return {
                "status": "healthy",
                "healthy": True,
                "latency_ms": round(latency, 2),
                "operations_tested": ["set", "get", "delete"],
                "connection_pool_size": self.config.max_connections
            }
            
        except Exception as e:
            logger.error(f"❌ Cache health check failed: {str(e)}")
            return {"status": "unhealthy", "healthy": False, "error": str(e)}
    
    async def close(self):
        """Gracefully close Redis connections"""
        try:
            if self.redis_client:
                await self.redis_client.close()
            if self.connection_pool:
                await self.connection_pool.disconnect()
            logger.info("✅ Redis connections closed gracefully")
        except Exception as e:
            logger.warning(f"⚠️ Error closing Redis connections: {str(e)}")

# Global cache manager instance
cache_manager = RomAICacheManager()

# Cache decorators for easy use
def cache_model_output(model_type: str):
    """Decorator for caching model outputs"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            # Extract input data for cache key
            input_data = kwargs.copy()
            
            # Check cache first
            cached_result = await cache_manager.get_model_output(model_type, input_data)
            if cached_result:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set_model_output(model_type, input_data, result)
            return result
        return wrapper
    return decorator

def cache_intelligence_response():
    """Decorator for caching intelligence processing responses"""
    def decorator(func):
        async def wrapper(*args, **kwargs):
            query = kwargs.get('query', args[0] if args else '')
            mode = kwargs.get('mode', 'standard')
            
            # Check cache first
            cached_result = await cache_manager.get_intelligence_response(query, mode)
            if cached_result:
                return cached_result
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            await cache_manager.set_intelligence_response(query, mode, result)
            return result
        return wrapper
    return decorator

# Utility functions
async def warm_cache_on_startup():
    """Warm up cache with common queries on server startup"""
    try:
        logger.info("🔥 Warming up cache with common queries...")
        
        common_queries = [
            {"query": "Salut! Cum te numești?", "mode": "standard"},
            {"query": "Spune-mi despre România", "mode": "cultural"},
            {"query": "Analiza piața din România", "mode": "business"},
            {"query": "Care sunt capabilitățile tale?", "mode": "technical"}
        ]
        
        # Pre-populate cache with mock responses for instant responses
        for query_data in common_queries:
            cache_key = cache_manager._generate_cache_key(
                cache_manager.prefixes["intelligence"],
                query_data
            )
            
            mock_response = {
                "status": "warmed",
                "query": query_data["query"],
                "response": f"Răspuns precalculat pentru: {query_data['query']}",
                "warmed_at": datetime.now().isoformat(),
                "confidence": 0.95
            }
            
            await cache_manager.redis_client.setex(
                cache_key,
                cache_manager.config.intelligence_cache_ttl,
                json.dumps(mock_response, ensure_ascii=False)
            )
        
        logger.info(f"✅ Cache warmed with {len(common_queries)} common queries")
        
    except Exception as e:
        logger.warning(f"⚠️ Cache warming failed: {str(e)}")

# Export for use in model server
__all__ = [
    'RomAICacheManager',
    'CacheConfig', 
    'cache_manager',
    'cache_model_output',
    'cache_intelligence_response',
    'warm_cache_on_startup'
]
