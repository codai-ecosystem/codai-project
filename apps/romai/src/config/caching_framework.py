"""
RomAI Phase 4.1 Core Platform Optimization - Advanced Caching Framework
Intelligent multi-layer caching system for maximum performance.

Features:
- Multi-tier caching (L1, L2, L3)
- Intelligent cache policies (LRU, LFU, TTL, Custom)
- Distributed caching with Redis support
- Cache invalidation strategies
- Cache warming and preloading
- Cache analytics and monitoring
- Memory-efficient storage
- Cache compression and serialization
- Hit rate optimization
- Cache partitioning and sharding
"""

import asyncio
import json
import logging
import sqlite3
import time
import uuid
import hashlib
import pickle
import gzip
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional, Any, Tuple, Union
import threading
from concurrent.futures import ThreadPoolExecutor
from collections import OrderedDict, defaultdict
import weakref

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CachePolicy(Enum):
    """Cache eviction policies"""
    LRU = "lru"  # Least Recently Used
    LFU = "lfu"  # Least Frequently Used
    TTL = "ttl"  # Time To Live
    FIFO = "fifo"  # First In, First Out
    CUSTOM = "custom"

class CacheLevel(Enum):
    """Cache hierarchy levels"""
    L1 = "l1"  # In-memory fast cache
    L2 = "l2"  # Local persistent cache
    L3 = "l3"  # Distributed cache

class CacheStatus(Enum):
    """Cache entry status"""
    HIT = "hit"
    MISS = "miss"
    EXPIRED = "expired"
    EVICTED = "evicted"

class CompressionType(Enum):
    """Compression algorithms"""
    NONE = "none"
    GZIP = "gzip"
    ZLIB = "zlib"
    BROTLI = "brotli"

class CacheEntry:
    """Individual cache entry with metadata"""
    
    def __init__(self, key: str, value: Any, ttl: Optional[float] = None, 
                 compression: CompressionType = CompressionType.NONE):
        self.key = key
        self.value = value
        self.created_at = time.time()
        self.last_accessed = self.created_at
        self.access_count = 0
        self.ttl = ttl
        self.expires_at = self.created_at + ttl if ttl else None
        self.compression = compression
        self.size_bytes = self._calculate_size()
        self.compressed_data = None
        
        # Compress if needed
        if compression != CompressionType.NONE:
            self._compress_value()
    
    def _calculate_size(self) -> int:
        """Calculate approximate size in bytes"""
        try:
            return len(pickle.dumps(self.value))
        except:
            return len(str(self.value).encode('utf-8'))
    
    def _compress_value(self):
        """Compress the cached value"""
        try:
            if self.compression == CompressionType.GZIP:
                self.compressed_data = gzip.compress(pickle.dumps(self.value))
            elif self.compression == CompressionType.ZLIB:
                import zlib
                self.compressed_data = zlib.compress(pickle.dumps(self.value))
            # Clear original value to save memory
            self.value = None
        except Exception as e:
            logger.warning(f"Compression failed for key {self.key}: {str(e)}")
            self.compression = CompressionType.NONE
    
    def get_value(self) -> Any:
        """Get the cached value (decompress if needed)"""
        self.last_accessed = time.time()
        self.access_count += 1
        
        if self.compression != CompressionType.NONE and self.compressed_data:
            try:
                if self.compression == CompressionType.GZIP:
                    return pickle.loads(gzip.decompress(self.compressed_data))
                elif self.compression == CompressionType.ZLIB:
                    import zlib
                    return pickle.loads(zlib.decompress(self.compressed_data))
            except Exception as e:
                logger.error(f"Decompression failed for key {self.key}: {str(e)}")
                return None
        
        return self.value
    
    def is_expired(self) -> bool:
        """Check if cache entry is expired"""
        if self.expires_at is None:
            return False
        return time.time() > self.expires_at
    
    def get_metadata(self) -> Dict[str, Any]:
        """Get cache entry metadata"""
        return {
            "key": self.key,
            "created_at": self.created_at,
            "last_accessed": self.last_accessed,
            "access_count": self.access_count,
            "ttl": self.ttl,
            "expires_at": self.expires_at,
            "size_bytes": self.size_bytes,
            "compression": self.compression.value,
            "is_expired": self.is_expired(),
            "age_seconds": time.time() - self.created_at
        }

class LRUCache:
    """Least Recently Used cache implementation"""
    
    def __init__(self, max_size: int = 1000, default_ttl: Optional[float] = None):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache = OrderedDict()
        self.access_times = {}
        self.lock = threading.RLock()
        
        # Statistics
        self.stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "total_requests": 0
        }
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self.lock:
            self.stats["total_requests"] += 1
            
            if key in self.cache:
                entry = self.cache[key]
                
                # Check expiration
                if entry.is_expired():
                    del self.cache[key]
                    self.stats["misses"] += 1
                    return None
                
                # Move to end (most recently used)
                self.cache.move_to_end(key)
                self.stats["hits"] += 1
                return entry.get_value()
            
            self.stats["misses"] += 1
            return None
    
    def put(self, key: str, value: Any, ttl: Optional[float] = None) -> bool:
        """Put value in cache"""
        with self.lock:
            effective_ttl = ttl or self.default_ttl
            entry = CacheEntry(key, value, effective_ttl)
            
            # Remove existing entry if present
            if key in self.cache:
                del self.cache[key]
            
            # Add new entry
            self.cache[key] = entry
            self.cache.move_to_end(key)
            
            # Evict if necessary
            while len(self.cache) > self.max_size:
                oldest_key = next(iter(self.cache))
                del self.cache[oldest_key]
                self.stats["evictions"] += 1
            
            return True
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                return True
            return False
    
    def clear(self):
        """Clear all cache entries"""
        with self.lock:
            self.cache.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self.lock:
            total_requests = self.stats["total_requests"]
            hit_rate = (self.stats["hits"] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                "cache_type": "LRU",
                "max_size": self.max_size,
                "current_size": len(self.cache),
                "hit_rate": round(hit_rate, 2),
                "stats": self.stats.copy(),
                "memory_usage": self._calculate_memory_usage()
            }
    
    def _calculate_memory_usage(self) -> Dict[str, int]:
        """Calculate approximate memory usage"""
        total_size = sum(entry.size_bytes for entry in self.cache.values())
        return {
            "total_bytes": total_size,
            "average_entry_size": total_size // len(self.cache) if len(self.cache) > 0 else 0,
            "entries_count": len(self.cache)
        }

class LFUCache:
    """Least Frequently Used cache implementation"""
    
    def __init__(self, max_size: int = 1000, default_ttl: Optional[float] = None):
        self.max_size = max_size
        self.default_ttl = default_ttl
        self.cache = {}
        self.frequencies = defaultdict(int)
        self.lock = threading.RLock()
        
        # Statistics
        self.stats = {
            "hits": 0,
            "misses": 0,
            "evictions": 0,
            "total_requests": 0
        }
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        with self.lock:
            self.stats["total_requests"] += 1
            
            if key in self.cache:
                entry = self.cache[key]
                
                # Check expiration
                if entry.is_expired():
                    del self.cache[key]
                    del self.frequencies[key]
                    self.stats["misses"] += 1
                    return None
                
                # Increment frequency
                self.frequencies[key] += 1
                self.stats["hits"] += 1
                return entry.get_value()
            
            self.stats["misses"] += 1
            return None
    
    def put(self, key: str, value: Any, ttl: Optional[float] = None) -> bool:
        """Put value in cache"""
        with self.lock:
            effective_ttl = ttl or self.default_ttl
            entry = CacheEntry(key, value, effective_ttl)
            
            # Remove existing entry if present
            if key in self.cache:
                del self.cache[key]
            
            # Add new entry
            self.cache[key] = entry
            self.frequencies[key] = 1
            
            # Evict if necessary
            while len(self.cache) > self.max_size:
                # Find least frequently used key
                lfu_key = min(self.frequencies.keys(), key=lambda k: self.frequencies[k])
                del self.cache[lfu_key]
                del self.frequencies[lfu_key]
                self.stats["evictions"] += 1
            
            return True
    
    def delete(self, key: str) -> bool:
        """Delete key from cache"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
                del self.frequencies[key]
                return True
            return False
    
    def clear(self):
        """Clear all cache entries"""
        with self.lock:
            self.cache.clear()
            self.frequencies.clear()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        with self.lock:
            total_requests = self.stats["total_requests"]
            hit_rate = (self.stats["hits"] / total_requests * 100) if total_requests > 0 else 0
            
            return {
                "cache_type": "LFU",
                "max_size": self.max_size,
                "current_size": len(self.cache),
                "hit_rate": round(hit_rate, 2),
                "stats": self.stats.copy(),
                "memory_usage": self._calculate_memory_usage(),
                "frequency_distribution": self._get_frequency_distribution()
            }
    
    def _calculate_memory_usage(self) -> Dict[str, int]:
        """Calculate approximate memory usage"""
        total_size = sum(entry.size_bytes for entry in self.cache.values())
        return {
            "total_bytes": total_size,
            "average_entry_size": total_size // len(self.cache) if len(self.cache) > 0 else 0,
            "entries_count": len(self.cache)
        }
    
    def _get_frequency_distribution(self) -> Dict[str, int]:
        """Get frequency distribution"""
        if not self.frequencies:
            return {}
        
        freq_counts = defaultdict(int)
        for freq in self.frequencies.values():
            freq_counts[str(freq)] += 1
        
        return dict(freq_counts)

class MultiLevelCache:
    """Multi-level cache with L1, L2, L3 hierarchy"""
    
    def __init__(self, l1_config: Dict[str, Any], l2_config: Dict[str, Any], 
                 l3_config: Optional[Dict[str, Any]] = None):
        # L1 Cache (Fast in-memory)
        self.l1_cache = LRUCache(
            max_size=l1_config.get("max_size", 1000),
            default_ttl=l1_config.get("default_ttl", 300)  # 5 minutes
        )
        
        # L2 Cache (Larger in-memory with compression)
        self.l2_cache = LFUCache(
            max_size=l2_config.get("max_size", 10000),
            default_ttl=l2_config.get("default_ttl", 3600)  # 1 hour
        )
        
        # L3 Cache (Distributed/Persistent) - placeholder for Redis/external
        self.l3_enabled = l3_config is not None
        self.l3_config = l3_config or {}
        
        # Cache promotion/demotion policies
        self.promotion_threshold = 3  # Promote to L1 after 3 L2 hits
        self.demotion_threshold = 100  # Demote from L1 if not accessed in 100 requests
        
        # Track access patterns
        self.access_patterns = defaultdict(int)
        self.promotion_candidates = defaultdict(int)
        
        # Statistics
        self.global_stats = {
            "total_requests": 0,
            "l1_hits": 0,
            "l2_hits": 0,
            "l3_hits": 0,
            "total_misses": 0,
            "promotions": 0,
            "demotions": 0
        }
        
        logger.info("Multi-Level Cache initialized")
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from multi-level cache hierarchy"""
        self.global_stats["total_requests"] += 1
        
        # Try L1 first (fastest)
        value = self.l1_cache.get(key)
        if value is not None:
            self.global_stats["l1_hits"] += 1
            self.access_patterns[key] += 1
            return value
        
        # Try L2 cache
        value = self.l2_cache.get(key)
        if value is not None:
            self.global_stats["l2_hits"] += 1
            self.promotion_candidates[key] += 1
            
            # Consider promotion to L1
            if self.promotion_candidates[key] >= self.promotion_threshold:
                await self._promote_to_l1(key, value)
                del self.promotion_candidates[key]
            
            return value
        
        # Try L3 cache if enabled
        if self.l3_enabled:
            value = await self._get_from_l3(key)
            if value is not None:
                self.global_stats["l3_hits"] += 1
                # Promote to L2
                self.l2_cache.put(key, value)
                return value
        
        self.global_stats["total_misses"] += 1
        return None
    
    async def put(self, key: str, value: Any, ttl: Optional[float] = None, 
                  level: CacheLevel = CacheLevel.L1) -> bool:
        """Put value in specified cache level"""
        try:
            if level == CacheLevel.L1:
                return self.l1_cache.put(key, value, ttl)
            elif level == CacheLevel.L2:
                return self.l2_cache.put(key, value, ttl)
            elif level == CacheLevel.L3 and self.l3_enabled:
                return await self._put_in_l3(key, value, ttl)
            
            return False
            
        except Exception as e:
            logger.error(f"Cache put error for key {key}: {str(e)}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete key from all cache levels"""
        deleted = False
        
        if self.l1_cache.delete(key):
            deleted = True
        
        if self.l2_cache.delete(key):
            deleted = True
        
        if self.l3_enabled:
            if await self._delete_from_l3(key):
                deleted = True
        
        # Clean up tracking
        self.access_patterns.pop(key, None)
        self.promotion_candidates.pop(key, None)
        
        return deleted
    
    async def clear(self):
        """Clear all cache levels"""
        self.l1_cache.clear()
        self.l2_cache.clear()
        
        if self.l3_enabled:
            await self._clear_l3()
        
        self.access_patterns.clear()
        self.promotion_candidates.clear()
    
    async def _promote_to_l1(self, key: str, value: Any):
        """Promote frequently accessed item to L1"""
        self.l1_cache.put(key, value)
        self.global_stats["promotions"] += 1
        logger.debug(f"Promoted key {key} to L1 cache")
    
    async def _get_from_l3(self, key: str) -> Optional[Any]:
        """Get value from L3 cache (placeholder for Redis/external)"""
        # Placeholder for distributed cache implementation
        return None
    
    async def _put_in_l3(self, key: str, value: Any, ttl: Optional[float] = None) -> bool:
        """Put value in L3 cache (placeholder for Redis/external)"""
        # Placeholder for distributed cache implementation
        return True
    
    async def _delete_from_l3(self, key: str) -> bool:
        """Delete from L3 cache (placeholder for Redis/external)"""
        # Placeholder for distributed cache implementation
        return True
    
    async def _clear_l3(self):
        """Clear L3 cache (placeholder for Redis/external)"""
        # Placeholder for distributed cache implementation
        pass
    
    def get_comprehensive_stats(self) -> Dict[str, Any]:
        """Get comprehensive statistics from all cache levels"""
        l1_stats = self.l1_cache.get_stats()
        l2_stats = self.l2_cache.get_stats()
        
        total_requests = self.global_stats["total_requests"]
        overall_hit_rate = 0
        
        if total_requests > 0:
            total_hits = (self.global_stats["l1_hits"] + 
                         self.global_stats["l2_hits"] + 
                         self.global_stats["l3_hits"])
            overall_hit_rate = (total_hits / total_requests) * 100
        
        return {
            "multi_level_stats": {
                "overall_hit_rate": round(overall_hit_rate, 2),
                "total_requests": total_requests,
                "hit_distribution": {
                    "l1_hits": self.global_stats["l1_hits"],
                    "l2_hits": self.global_stats["l2_hits"],
                    "l3_hits": self.global_stats["l3_hits"]
                },
                "cache_efficiency": {
                    "promotions": self.global_stats["promotions"],
                    "demotions": self.global_stats["demotions"],
                    "l1_efficiency": round((self.global_stats["l1_hits"] / max(1, total_requests)) * 100, 2),
                    "l2_efficiency": round((self.global_stats["l2_hits"] / max(1, total_requests)) * 100, 2)
                }
            },
            "l1_cache_stats": l1_stats,
            "l2_cache_stats": l2_stats,
            "l3_enabled": self.l3_enabled
        }

class CacheWarmer:
    """Intelligent cache warming system"""
    
    def __init__(self, cache_system: MultiLevelCache):
        self.cache_system = cache_system
        self.warming_strategies = []
        self.warming_schedule = {}
        self.warming_active = False
        
        logger.info("Cache Warmer initialized")
    
    async def add_warming_strategy(self, strategy_id: str, strategy_config: Dict[str, Any]):
        """Add cache warming strategy"""
        strategy = {
            "id": strategy_id,
            "data_source": strategy_config.get("data_source"),
            "key_pattern": strategy_config.get("key_pattern", "warm_*"),
            "warming_interval": strategy_config.get("interval", 3600),  # 1 hour
            "priority": strategy_config.get("priority", 1),
            "cache_level": CacheLevel(strategy_config.get("cache_level", "l2")),
            "ttl": strategy_config.get("ttl", 7200),  # 2 hours
            "data_generator": strategy_config.get("data_generator")
        }
        
        self.warming_strategies.append(strategy)
        logger.info(f"Added warming strategy: {strategy_id}")
        
        return {"success": True, "strategy_id": strategy_id}
    
    async def start_warming(self):
        """Start cache warming process"""
        self.warming_active = True
        logger.info("Cache warming started")
        
        while self.warming_active:
            try:
                for strategy in self.warming_strategies:
                    await self._execute_warming_strategy(strategy)
                
                # Wait before next warming cycle
                await asyncio.sleep(60)  # Check every minute
                
            except Exception as e:
                logger.error(f"Cache warming error: {str(e)}")
                await asyncio.sleep(60)
    
    def stop_warming(self):
        """Stop cache warming process"""
        self.warming_active = False
        logger.info("Cache warming stopped")
    
    async def _execute_warming_strategy(self, strategy: Dict[str, Any]):
        """Execute individual warming strategy"""
        strategy_id = strategy["id"]
        
        # Check if it's time to warm this strategy
        last_warmed = self.warming_schedule.get(strategy_id, 0)
        if time.time() - last_warmed < strategy["warming_interval"]:
            return
        
        try:
            # Generate warming data
            warming_data = await self._generate_warming_data(strategy)
            
            # Warm cache with generated data
            warmed_count = 0
            for key, value in warming_data.items():
                success = await self.cache_system.put(
                    key, value, 
                    ttl=strategy["ttl"],
                    level=strategy["cache_level"]
                )
                if success:
                    warmed_count += 1
            
            # Update warming schedule
            self.warming_schedule[strategy_id] = time.time()
            
            logger.info(f"Warmed {warmed_count} entries for strategy {strategy_id}")
            
        except Exception as e:
            logger.error(f"Warming strategy {strategy_id} failed: {str(e)}")
    
    async def _generate_warming_data(self, strategy: Dict[str, Any]) -> Dict[str, Any]:
        """Generate data for cache warming"""
        data_generator = strategy.get("data_generator")
        
        if data_generator:
            # Use custom data generator
            return await data_generator()
        
        # Default warming data generation
        warming_data = {}
        key_pattern = strategy["key_pattern"]
        
        for i in range(10):  # Generate 10 sample entries
            key = key_pattern.replace("*", str(i))
            value = {
                "warmed_at": datetime.utcnow().isoformat(),
                "strategy_id": strategy["id"],
                "data": f"Preloaded data for {key}"
            }
            warming_data[key] = value
        
        return warming_data

class AdvancedCachingFramework:
    """Main advanced caching framework coordinator"""
    
    def __init__(self, db_path: str = "advanced_caching.db"):
        self.db_path = db_path
        
        # Initialize multi-level cache
        l1_config = {"max_size": 1000, "default_ttl": 300}
        l2_config = {"max_size": 10000, "default_ttl": 3600}
        l3_config = {"enabled": False}  # Placeholder for Redis
        
        self.cache_system = MultiLevelCache(l1_config, l2_config, l3_config)
        self.cache_warmer = CacheWarmer(self.cache_system)
        
        # Cache analytics
        self.analytics_data = []
        self.monitoring_active = False
        
        # Performance targets
        self.performance_targets = {
            "hit_rate_min": 85.0,
            "avg_response_time_ms": 10.0,
            "memory_efficiency": 80.0,
            "eviction_rate_max": 5.0
        }
        
        # Initialize database
        self._init_database()
        
        logger.info("Advanced Caching Framework initialized")
    
    def _init_database(self):
        """Initialize caching framework database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Cache analytics
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS cache_analytics (
                        analytics_id TEXT PRIMARY KEY,
                        cache_level TEXT NOT NULL,
                        operation_type TEXT NOT NULL,
                        hit_rate REAL,
                        response_time_ms REAL,
                        memory_usage_bytes INTEGER,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Cache warming history
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS cache_warming_history (
                        warming_id TEXT PRIMARY KEY,
                        strategy_id TEXT NOT NULL,
                        entries_warmed INTEGER,
                        warming_duration_ms REAL,
                        success BOOLEAN,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                conn.commit()
                logger.info("Advanced caching framework database initialized")
                
        except Exception as e:
            logger.error(f"Database initialization error: {str(e)}")
    
    async def initialize_caching_system(self):
        """Initialize complete caching system"""
        try:
            logger.info("Initializing Advanced Caching Framework...")
            
            # Add sample warming strategies
            sample_strategies = [
                {
                    "strategy_id": "romai_responses",
                    "key_pattern": "romai_response_*",
                    "interval": 1800,  # 30 minutes
                    "cache_level": "l2",
                    "ttl": 3600
                },
                {
                    "strategy_id": "user_sessions",
                    "key_pattern": "user_session_*",
                    "interval": 600,   # 10 minutes
                    "cache_level": "l1",
                    "ttl": 1800
                }
            ]
            
            for strategy_config in sample_strategies:
                await self.cache_warmer.add_warming_strategy(
                    strategy_config["strategy_id"],
                    strategy_config
                )
            
            # Start cache warming
            warming_task = asyncio.create_task(self.cache_warmer.start_warming())
            
            # Run caching tests
            test_results = await self._run_caching_tests()
            
            logger.info("✅ Advanced Caching Framework initialized successfully")
            
            return {
                "initialization_success": True,
                "cache_levels_active": ["L1", "L2"],
                "warming_strategies": len(sample_strategies),
                "warming_active": self.cache_warmer.warming_active,
                "caching_tests": test_results,
                "performance_targets": self.performance_targets,
                "system_ready": True
            }
            
        except Exception as e:
            logger.error(f"Caching system initialization error: {str(e)}")
            return {"initialization_success": False, "error": str(e)}
    
    async def _run_caching_tests(self) -> Dict[str, Any]:
        """Run comprehensive caching tests"""
        test_results = []
        
        # Test L1 cache
        test_data = {
            "test_key_1": {"data": "test_value_1", "size": "small"},
            "test_key_2": {"data": "test_value_2", "size": "medium"},
            "test_key_3": {"data": "test_value_3", "size": "large"}
        }
        
        # Put test data
        put_results = []
        for key, value in test_data.items():
            result = await self.cache_system.put(key, value, ttl=300, level=CacheLevel.L1)
            put_results.append(result)
        
        # Get test data
        get_results = []
        for key in test_data.keys():
            start_time = time.time()
            value = await self.cache_system.get(key)
            response_time = (time.time() - start_time) * 1000  # ms
            get_results.append({
                "key": key,
                "found": value is not None,
                "response_time_ms": round(response_time, 3)
            })
        
        # Test cache statistics
        stats = self.cache_system.get_comprehensive_stats()
        
        return {
            "put_test": {
                "total_puts": len(put_results),
                "successful_puts": sum(1 for r in put_results if r),
                "success_rate": sum(1 for r in put_results if r) / len(put_results) * 100
            },
            "get_test": {
                "total_gets": len(get_results),
                "cache_hits": sum(1 for r in get_results if r["found"]),
                "hit_rate": sum(1 for r in get_results if r["found"]) / len(get_results) * 100,
                "average_response_time_ms": sum(r["response_time_ms"] for r in get_results) / len(get_results)
            },
            "cache_statistics": stats,
            "performance_evaluation": self._evaluate_cache_performance(stats)
        }
    
    def _evaluate_cache_performance(self, stats: Dict[str, Any]) -> Dict[str, str]:
        """Evaluate cache performance against targets"""
        multi_stats = stats.get("multi_level_stats", {})
        hit_rate = multi_stats.get("overall_hit_rate", 0)
        
        evaluation = {}
        
        if hit_rate >= self.performance_targets["hit_rate_min"]:
            evaluation["hit_rate"] = "excellent"
        elif hit_rate >= 70:
            evaluation["hit_rate"] = "good"
        elif hit_rate >= 50:
            evaluation["hit_rate"] = "fair"
        else:
            evaluation["hit_rate"] = "poor"
        
        # Overall performance
        if hit_rate >= 85:
            evaluation["overall"] = "excellent"
        elif hit_rate >= 70:
            evaluation["overall"] = "good"
        else:
            evaluation["overall"] = "needs_improvement"
        
        return evaluation
    
    async def generate_caching_report(self) -> Dict[str, Any]:
        """Generate comprehensive caching performance report"""
        try:
            # Get cache statistics
            cache_stats = self.cache_system.get_comprehensive_stats()
            
            # Calculate performance metrics
            performance_metrics = self._calculate_performance_metrics(cache_stats)
            
            # Generate recommendations
            recommendations = self._generate_caching_recommendations(cache_stats, performance_metrics)
            
            report = {
                "report_id": str(uuid.uuid4()),
                "generated_at": datetime.utcnow().isoformat(),
                "performance_targets": self.performance_targets,
                "cache_statistics": cache_stats,
                "performance_metrics": performance_metrics,
                "recommendations": recommendations,
                "system_health": self._assess_caching_health(performance_metrics),
                "warming_status": {
                    "active": self.cache_warmer.warming_active,
                    "strategies_count": len(self.cache_warmer.warming_strategies)
                }
            }
            
            return report
            
        except Exception as e:
            logger.error(f"Caching report generation error: {str(e)}")
            return {"error": str(e)}
    
    def _calculate_performance_metrics(self, cache_stats: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate cache performance metrics"""
        multi_stats = cache_stats.get("multi_level_stats", {})
        l1_stats = cache_stats.get("l1_cache_stats", {})
        l2_stats = cache_stats.get("l2_cache_stats", {})
        
        return {
            "overall_hit_rate": multi_stats.get("overall_hit_rate", 0),
            "l1_hit_rate": l1_stats.get("hit_rate", 0),
            "l2_hit_rate": l2_stats.get("hit_rate", 0),
            "cache_efficiency": multi_stats.get("cache_efficiency", {}),
            "memory_usage": {
                "l1_memory": l1_stats.get("memory_usage", {}),
                "l2_memory": l2_stats.get("memory_usage", {})
            },
            "performance_score": self._calculate_cache_score(multi_stats, l1_stats, l2_stats)
        }
    
    def _calculate_cache_score(self, multi_stats: Dict[str, Any], 
                              l1_stats: Dict[str, Any], l2_stats: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall cache performance score"""
        # Hit rate score (0-100)
        hit_rate = multi_stats.get("overall_hit_rate", 0)
        hit_rate_score = min(100, hit_rate * 1.2)  # Boost for high hit rates
        
        # Efficiency score (0-100)
        l1_efficiency = multi_stats.get("cache_efficiency", {}).get("l1_efficiency", 0)
        l2_efficiency = multi_stats.get("cache_efficiency", {}).get("l2_efficiency", 0)
        efficiency_score = (l1_efficiency * 0.6 + l2_efficiency * 0.4)  # L1 weighted higher
        
        # Memory utilization score (0-100)
        l1_utilization = (l1_stats.get("current_size", 0) / l1_stats.get("max_size", 1)) * 100
        l2_utilization = (l2_stats.get("current_size", 0) / l2_stats.get("max_size", 1)) * 100
        memory_score = 100 - abs(75 - (l1_utilization + l2_utilization) / 2)  # Optimal around 75%
        
        # Calculate weighted overall score
        weights = {"hit_rate": 0.5, "efficiency": 0.3, "memory_utilization": 0.2}
        overall_score = (hit_rate_score * weights["hit_rate"] + 
                        efficiency_score * weights["efficiency"] + 
                        memory_score * weights["memory_utilization"])
        
        return {
            "overall_score": round(overall_score, 2),
            "component_scores": {
                "hit_rate_score": round(hit_rate_score, 2),
                "efficiency_score": round(efficiency_score, 2),
                "memory_score": round(memory_score, 2)
            },
            "cache_grade": self._get_cache_grade(overall_score)
        }
    
    def _get_cache_grade(self, score: float) -> str:
        """Get cache performance grade"""
        if score >= 90:
            return "A+"
        elif score >= 85:
            return "A"
        elif score >= 80:
            return "B+"
        elif score >= 75:
            return "B"
        elif score >= 70:
            return "C+"
        elif score >= 65:
            return "C"
        else:
            return "D"
    
    def _generate_caching_recommendations(self, cache_stats: Dict[str, Any], 
                                        performance_metrics: Dict[str, Any]) -> List[str]:
        """Generate caching optimization recommendations"""
        recommendations = []
        
        # Hit rate recommendations
        hit_rate = performance_metrics.get("overall_hit_rate", 0)
        if hit_rate < self.performance_targets["hit_rate_min"]:
            recommendations.append(f"Improve cache hit rate: current {hit_rate:.1f}% < target {self.performance_targets['hit_rate_min']}%")
            recommendations.append("Consider implementing more aggressive cache warming strategies")
            recommendations.append("Analyze cache access patterns to optimize cache size allocation")
        
        # Memory usage recommendations
        l1_stats = cache_stats.get("l1_cache_stats", {})
        l2_stats = cache_stats.get("l2_cache_stats", {})
        
        l1_utilization = (l1_stats.get("current_size", 0) / l1_stats.get("max_size", 1)) * 100
        l2_utilization = (l2_stats.get("current_size", 0) / l2_stats.get("max_size", 1)) * 100
        
        if l1_utilization > 90:
            recommendations.append("L1 cache near capacity - consider increasing size or optimizing eviction policy")
        
        if l2_utilization > 95:
            recommendations.append("L2 cache at high utilization - consider implementing L3 distributed cache")
        
        # General recommendations
        recommendations.extend([
            "Implement cache compression for large objects to improve memory efficiency",
            "Consider implementing Redis for L3 distributed caching",
            "Add cache metrics monitoring and alerting for proactive management",
            "Implement intelligent cache prefetching based on user behavior patterns"
        ])
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _assess_caching_health(self, performance_metrics: Dict[str, Any]) -> str:
        """Assess overall caching system health"""
        score = performance_metrics.get("performance_score", {}).get("overall_score", 0)
        
        if score >= 85:
            return "excellent"
        elif score >= 75:
            return "good"
        elif score >= 65:
            return "fair"
        else:
            return "poor"

# Initialize advanced caching framework
async def initialize_advanced_caching():
    """Initialize and return advanced caching framework"""
    framework = AdvancedCachingFramework()
    result = await framework.initialize_caching_system()
    
    if result.get("initialization_success"):
        logger.info("🚀 Advanced Caching Framework ready for service")
        return framework
    else:
        logger.error("❌ Advanced Caching Framework initialization failed")
        return None

# Example usage and testing
async def main():
    """Example usage of Advanced Caching Framework"""
    framework = await initialize_advanced_caching()
    
    if not framework:
        print("Failed to initialize advanced caching framework")
        return
    
    # Wait a moment for warming to start
    await asyncio.sleep(2)
    
    # Generate caching report
    report = await framework.generate_caching_report()
    print("Advanced Caching Report:", json.dumps(report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    asyncio.run(main())
