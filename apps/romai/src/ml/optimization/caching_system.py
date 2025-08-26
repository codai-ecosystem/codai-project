"""
Advanced Caching System
Intelligent caching for RomAI models with cultural context awareness
"""

import torch
import hashlib
import pickle
import logging
from typing import Dict, Any, List, Tuple, Optional, Union, Callable
from dataclasses import dataclass, field
from enum import Enum
import time
import json
import asyncio
from pathlib import Path
from collections import OrderedDict, defaultdict
import threading
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import functools
import redis
import sqlite3

logger = logging.getLogger(__name__)

class CacheType(Enum):
    """Types of caching strategies"""
    MEMORY = "memory"                     # In-memory caching
    DISK = "disk"                        # Disk-based caching  
    REDIS = "redis"                      # Redis-based caching
    HYBRID = "hybrid"                    # Hybrid memory+disk caching
    DISTRIBUTED = "distributed"         # Distributed caching
    CULTURAL_AWARE = "cultural_aware"    # Romanian cultural context caching

class CacheStrategy(Enum):
    """Cache replacement strategies"""
    LRU = "lru"                          # Least Recently Used
    LFU = "lfu"                          # Least Frequently Used
    FIFO = "fifo"                        # First In, First Out
    CULTURAL_PRIORITY = "cultural_priority" # Romanian cultural content priority
    ADAPTIVE = "adaptive"                # Adaptive based on usage patterns

@dataclass
class CacheConfig:
    """Configuration for caching system"""
    cache_type: CacheType
    cache_strategy: CacheStrategy
    max_memory_size: int = 1024          # MB
    max_disk_size: int = 10240          # MB
    ttl: int = 3600                     # Time to live in seconds
    
    # Cultural caching settings
    cultural_priority_weight: float = 2.0  # Priority multiplier for cultural content
    romanian_content_boost: float = 1.5    # Boost factor for Romanian content
    preserve_cultural_cache: bool = True    # Never evict cultural content
    
    # Performance settings
    compression_enabled: bool = True        # Enable cache compression
    async_write: bool = True               # Asynchronous cache writes
    prefetch_enabled: bool = True          # Enable prefetching
    
    # Redis settings (if applicable)
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'cache_type': self.cache_type.value,
            'cache_strategy': self.cache_strategy.value,
            'max_memory_size': self.max_memory_size,
            'max_disk_size': self.max_disk_size,
            'ttl': self.ttl,
            'cultural_priority_weight': self.cultural_priority_weight,
            'romanian_content_boost': self.romanian_content_boost,
            'preserve_cultural_cache': self.preserve_cultural_cache,
            'compression_enabled': self.compression_enabled,
            'async_write': self.async_write,
            'prefetch_enabled': self.prefetch_enabled,
            'redis_host': self.redis_host,
            'redis_port': self.redis_port,
            'redis_db': self.redis_db
        }

@dataclass
class CacheEntry:
    """Cache entry with metadata"""
    key: str
    value: Any
    size: int                           # Size in bytes
    created_time: float                 # Creation timestamp
    last_accessed: float                # Last access timestamp
    access_count: int = 0               # Number of accesses
    
    # Cultural metadata
    is_cultural_content: bool = False   # Whether content is culturally significant
    cultural_type: Optional[str] = None # Type of cultural content
    romanian_relevance: float = 0.0     # Romanian cultural relevance score
    
    # Performance metadata
    computation_cost: float = 0.0       # Cost to recompute (ms)
    cache_hit_value: float = 0.0        # Value of cache hit
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'key': self.key,
            'size': self.size,
            'created_time': self.created_time,
            'last_accessed': self.last_accessed,
            'access_count': self.access_count,
            'is_cultural_content': self.is_cultural_content,
            'cultural_type': self.cultural_type,
            'romanian_relevance': self.romanian_relevance,
            'computation_cost': self.computation_cost,
            'cache_hit_value': self.cache_hit_value
        }

@dataclass
class CacheMetrics:
    """Cache performance metrics"""
    hit_rate: float                     # Cache hit rate
    miss_rate: float                    # Cache miss rate
    memory_usage: float                 # Memory usage in MB
    disk_usage: float                   # Disk usage in MB
    avg_lookup_time: float              # Average lookup time in ms
    
    # Cultural metrics
    cultural_hit_rate: float            # Hit rate for cultural content
    romanian_content_percentage: float  # Percentage of Romanian content
    cultural_preservation_rate: float   # Rate of cultural content preservation
    
    total_hits: int = 0
    total_misses: int = 0
    total_requests: int = 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary"""
        return {
            'hit_rate': self.hit_rate,
            'miss_rate': self.miss_rate,
            'memory_usage': self.memory_usage,
            'disk_usage': self.disk_usage,
            'avg_lookup_time': self.avg_lookup_time,
            'cultural_hit_rate': self.cultural_hit_rate,
            'romanian_content_percentage': self.romanian_content_percentage,
            'cultural_preservation_rate': self.cultural_preservation_rate,
            'total_hits': self.total_hits,
            'total_misses': self.total_misses,
            'total_requests': self.total_requests
        }

class CulturalContentDetector:
    """Detect and classify Romanian cultural content"""
    
    def __init__(self):
        # Cultural keywords and patterns
        self.cultural_keywords = {
            'literature': ['eminescu', 'blaga', 'creangă', 'coșbuc', 'arghezi', 'luceafărul', 'miorița'],
            'folklore': ['mioritic', 'doină', 'baladă', 'colind', 'sânziene', 'mărțișor', 'dragobete'],
            'history': ['mihai viteazul', 'ștefan cel mare', 'vlad țepeș', 'decebal', 'voievod'],
            'traditions': ['horă', 'călușari', 'paști', 'crăciun', 'bobotează', 'sf. gheorghe'],
            'language': ['diacritice', 'română', 'românește', 'românesc', 'țară', 'neam']
        }
        
        # Compile patterns for efficient matching
        self._compile_patterns()
    
    def _compile_patterns(self):
        """Compile cultural detection patterns"""
        import re
        self.cultural_patterns = {}
        
        for category, keywords in self.cultural_keywords.items():
            patterns = [re.compile(rf'\b{keyword}\b', re.IGNORECASE) for keyword in keywords]
            self.cultural_patterns[category] = patterns
    
    def detect_cultural_content(self, content: Any) -> Tuple[bool, Optional[str], float]:
        """Detect if content has Romanian cultural significance"""
        
        # Convert content to searchable string
        if isinstance(content, torch.Tensor):
            # For tensors, we can't directly analyze content
            return False, None, 0.0
        
        content_str = str(content).lower()
        
        # Check for cultural patterns
        cultural_score = 0.0
        detected_categories = []
        
        for category, patterns in self.cultural_patterns.items():
            category_matches = 0
            for pattern in patterns:
                matches = len(pattern.findall(content_str))
                if matches > 0:
                    category_matches += matches
                    cultural_score += matches
            
            if category_matches > 0:
                detected_categories.append(category)
        
        # Check for Romanian diacritics
        romanian_chars = 'ăâîșțĂÂÎȘȚ'
        diacritic_count = sum(content_str.count(char) for char in romanian_chars)
        if diacritic_count > 0:
            cultural_score += diacritic_count * 0.5
            if 'language' not in detected_categories:
                detected_categories.append('language')
        
        # Normalize score
        cultural_relevance = min(cultural_score / len(content_str) * 1000, 1.0) if content_str else 0.0
        
        is_cultural = cultural_score > 0
        cultural_type = ','.join(detected_categories) if detected_categories else None
        
        return is_cultural, cultural_type, cultural_relevance

class AdvancedCacheSystem:
    """Advanced caching system with Romanian cultural awareness"""
    
    def __init__(self, config: CacheConfig, cache_dir: str = "cache/advanced"):
        self.config = config
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize cache storage
        self.memory_cache: OrderedDict[str, CacheEntry] = OrderedDict()
        self.access_frequencies: Dict[str, int] = defaultdict(int)
        self.cultural_detector = CulturalContentDetector()
        
        # Performance tracking
        self.metrics = CacheMetrics(
            hit_rate=0.0, miss_rate=0.0, memory_usage=0.0, disk_usage=0.0,
            avg_lookup_time=0.0, cultural_hit_rate=0.0, romanian_content_percentage=0.0,
            cultural_preservation_rate=0.0
        )
        
        # Thread safety
        self._lock = threading.Lock()
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        
        # Initialize storage backends
        self._initialize_storage()
        
        logger.info(f"Advanced cache system initialized: {config.cache_type.value}")
    
    def _initialize_storage(self):
        """Initialize storage backends based on configuration"""
        
        if self.config.cache_type in [CacheType.REDIS, CacheType.DISTRIBUTED]:
            try:
                self.redis_client = redis.Redis(
                    host=self.config.redis_host,
                    port=self.config.redis_port,
                    db=self.config.redis_db,
                    decode_responses=False
                )
                self.redis_client.ping()  # Test connection
                logger.info("Redis cache backend initialized")
            except Exception as e:
                logger.warning(f"Redis initialization failed: {str(e)}")
                self.redis_client = None
        else:
            self.redis_client = None
        
        if self.config.cache_type in [CacheType.DISK, CacheType.HYBRID]:
            # Initialize SQLite database for metadata
            self.db_path = self.cache_dir / "cache_metadata.db"
            self._init_database()
        
        # Memory usage tracking
        self._current_memory_usage = 0
    
    def _init_database(self):
        """Initialize SQLite database for cache metadata"""
        
        with sqlite3.connect(self.db_path) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS cache_entries (
                    key TEXT PRIMARY KEY,
                    file_path TEXT,
                    size INTEGER,
                    created_time REAL,
                    last_accessed REAL,
                    access_count INTEGER,
                    is_cultural_content BOOLEAN,
                    cultural_type TEXT,
                    romanian_relevance REAL,
                    computation_cost REAL
                )
            ''')
            conn.commit()
    
    def _generate_cache_key(self, *args, **kwargs) -> str:
        """Generate cache key from function arguments"""
        
        # Create a hash of the arguments
        key_data = {
            'args': str(args),
            'kwargs': sorted(kwargs.items()) if kwargs else {}
        }
        
        key_string = json.dumps(key_data, sort_keys=True)
        return hashlib.sha256(key_string.encode()).hexdigest()
    
    def _get_entry_size(self, value: Any) -> int:
        """Calculate the size of a cache entry"""
        
        try:
            if isinstance(value, torch.Tensor):
                return value.nelement() * value.element_size()
            else:
                return len(pickle.dumps(value))
        except Exception:
            return len(str(value).encode('utf-8'))
    
    def _calculate_priority(self, entry: CacheEntry) -> float:
        """Calculate cache entry priority for eviction"""
        
        current_time = time.time()
        age = current_time - entry.created_time
        time_since_access = current_time - entry.last_accessed
        
        # Base priority calculation
        if self.config.cache_strategy == CacheStrategy.LRU:
            priority = -time_since_access  # More recent = higher priority
        elif self.config.cache_strategy == CacheStrategy.LFU:
            priority = entry.access_count   # More frequent = higher priority
        elif self.config.cache_strategy == CacheStrategy.FIFO:
            priority = -age                # Older = lower priority
        else:
            # Adaptive strategy
            frequency_score = entry.access_count / max(age / 3600, 1)  # Accesses per hour
            recency_score = 1 / (time_since_access + 1)
            priority = frequency_score + recency_score
        
        # Apply cultural bonuses
        if self.config.cache_strategy == CacheStrategy.CULTURAL_PRIORITY or entry.is_cultural_content:
            if entry.is_cultural_content:
                priority *= self.config.cultural_priority_weight
            
            if entry.romanian_relevance > 0:
                priority *= (1 + entry.romanian_relevance * self.config.romanian_content_boost)
            
            # Never evict high-priority cultural content
            if (entry.is_cultural_content and 
                entry.romanian_relevance > 0.7 and 
                self.config.preserve_cultural_cache):
                priority = float('inf')
        
        return priority
    
    def _evict_entries(self, required_space: int) -> None:
        """Evict cache entries to make space"""
        
        if not self.memory_cache:
            return
        
        # Calculate priorities for all entries
        entries_with_priority = [
            (key, entry, self._calculate_priority(entry))
            for key, entry in self.memory_cache.items()
        ]
        
        # Sort by priority (lowest first for eviction)
        entries_with_priority.sort(key=lambda x: x[2])
        
        freed_space = 0
        evicted_keys = []
        
        for key, entry, priority in entries_with_priority:
            # Don't evict infinite priority entries (preserved cultural content)
            if priority == float('inf'):
                continue
            
            freed_space += entry.size
            evicted_keys.append(key)
            
            # Move to disk if hybrid caching
            if self.config.cache_type == CacheType.HYBRID:
                self._move_to_disk(key, entry)
            
            if freed_space >= required_space:
                break
        
        # Remove evicted entries from memory
        for key in evicted_keys:
            if key in self.memory_cache:
                self._current_memory_usage -= self.memory_cache[key].size
                del self.memory_cache[key]
        
        logger.debug(f"Evicted {len(evicted_keys)} entries, freed {freed_space} bytes")
    
    def _move_to_disk(self, key: str, entry: CacheEntry) -> None:
        """Move cache entry to disk storage"""
        
        try:
            disk_path = self.cache_dir / f"{key}.pkl"
            
            # Save value to disk
            with open(disk_path, 'wb') as f:
                if self.config.compression_enabled:
                    import gzip
                    with gzip.open(disk_path.with_suffix('.pkl.gz'), 'wb') as gz_f:
                        pickle.dump(entry.value, gz_f)
                else:
                    pickle.dump(entry.value, f)
            
            # Update metadata in database
            with sqlite3.connect(self.db_path) as conn:
                conn.execute('''
                    INSERT OR REPLACE INTO cache_entries 
                    (key, file_path, size, created_time, last_accessed, access_count,
                     is_cultural_content, cultural_type, romanian_relevance, computation_cost)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    key, str(disk_path), entry.size, entry.created_time,
                    entry.last_accessed, entry.access_count, entry.is_cultural_content,
                    entry.cultural_type, entry.romanian_relevance, entry.computation_cost
                ))
                conn.commit()
            
        except Exception as e:
            logger.error(f"Failed to move entry to disk: {str(e)}")
    
    def _load_from_disk(self, key: str) -> Optional[CacheEntry]:
        """Load cache entry from disk storage"""
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.execute(
                    'SELECT * FROM cache_entries WHERE key = ?', (key,)
                )
                row = cursor.fetchone()
                
                if not row:
                    return None
                
                # Load value from disk
                file_path = Path(row[1])
                if file_path.exists():
                    if file_path.suffix == '.gz':
                        import gzip
                        with gzip.open(file_path, 'rb') as f:
                            value = pickle.load(f)
                    else:
                        with open(file_path, 'rb') as f:
                            value = pickle.load(f)
                    
                    # Create cache entry
                    entry = CacheEntry(
                        key=row[0],
                        value=value,
                        size=row[2],
                        created_time=row[3],
                        last_accessed=time.time(),  # Update access time
                        access_count=row[5] + 1,    # Increment access count
                        is_cultural_content=bool(row[6]),
                        cultural_type=row[7],
                        romanian_relevance=row[8],
                        computation_cost=row[9]
                    )
                    
                    return entry
                
        except Exception as e:
            logger.error(f"Failed to load entry from disk: {str(e)}")
        
        return None
    
    def _store_in_redis(self, key: str, entry: CacheEntry) -> None:
        """Store cache entry in Redis"""
        
        if not self.redis_client:
            return
        
        try:
            # Serialize entry
            serialized = pickle.dumps({
                'value': entry.value,
                'metadata': entry.to_dict()
            })
            
            # Store with TTL
            self.redis_client.setex(
                f"romai_cache:{key}",
                self.config.ttl,
                serialized
            )
            
        except Exception as e:
            logger.error(f"Failed to store in Redis: {str(e)}")
    
    def _load_from_redis(self, key: str) -> Optional[CacheEntry]:
        """Load cache entry from Redis"""
        
        if not self.redis_client:
            return None
        
        try:
            serialized = self.redis_client.get(f"romai_cache:{key}")
            if serialized:
                data = pickle.loads(serialized)
                
                # Recreate cache entry
                metadata = data['metadata']
                entry = CacheEntry(
                    key=key,
                    value=data['value'],
                    size=metadata['size'],
                    created_time=metadata['created_time'],
                    last_accessed=time.time(),
                    access_count=metadata['access_count'] + 1,
                    is_cultural_content=metadata['is_cultural_content'],
                    cultural_type=metadata['cultural_type'],
                    romanian_relevance=metadata['romanian_relevance'],
                    computation_cost=metadata['computation_cost']
                )
                
                return entry
                
        except Exception as e:
            logger.error(f"Failed to load from Redis: {str(e)}")
        
        return None
    
    def put(self, key: str, value: Any, computation_cost: float = 0.0) -> None:
        """Store value in cache"""
        
        with self._lock:
            start_time = time.time()
            
            # Detect cultural content
            is_cultural, cultural_type, romanian_relevance = self.cultural_detector.detect_cultural_content(value)
            
            # Calculate entry size
            entry_size = self._get_entry_size(value)
            
            # Create cache entry
            entry = CacheEntry(
                key=key,
                value=value,
                size=entry_size,
                created_time=start_time,
                last_accessed=start_time,
                access_count=1,
                is_cultural_content=is_cultural,
                cultural_type=cultural_type,
                romanian_relevance=romanian_relevance,
                computation_cost=computation_cost
            )
            
            # Check if we need to evict entries
            max_memory_bytes = self.config.max_memory_size * 1024 * 1024
            if self._current_memory_usage + entry_size > max_memory_bytes:
                required_space = entry_size - (max_memory_bytes - self._current_memory_usage)
                self._evict_entries(required_space)
            
            # Store in appropriate backend(s)
            if self.config.cache_type in [CacheType.MEMORY, CacheType.HYBRID, CacheType.CULTURAL_AWARE]:
                self.memory_cache[key] = entry
                self._current_memory_usage += entry_size
            
            if self.config.cache_type in [CacheType.REDIS, CacheType.DISTRIBUTED]:
                if self.config.async_write:
                    self.thread_pool.submit(self._store_in_redis, key, entry)
                else:
                    self._store_in_redis(key, entry)
            
            if self.config.cache_type == CacheType.DISK:
                if self.config.async_write:
                    self.thread_pool.submit(self._move_to_disk, key, entry)
                else:
                    self._move_to_disk(key, entry)
            
            logger.debug(f"Cached entry: {key}, size: {entry_size}, cultural: {is_cultural}")
    
    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache"""
        
        with self._lock:
            start_time = time.time()
            self.metrics.total_requests += 1
            
            # Try memory cache first
            if key in self.memory_cache:
                entry = self.memory_cache[key]
                entry.last_accessed = start_time
                entry.access_count += 1
                
                # Move to end (for LRU)
                self.memory_cache.move_to_end(key)
                
                self.metrics.total_hits += 1
                if entry.is_cultural_content:
                    # Track cultural hits separately
                    pass
                
                lookup_time = (time.time() - start_time) * 1000
                self._update_metrics(True, lookup_time)
                
                return entry.value
            
            # Try disk cache (for hybrid or disk caching)
            if self.config.cache_type in [CacheType.DISK, CacheType.HYBRID]:
                entry = self._load_from_disk(key)
                if entry:
                    # Move back to memory if space allows
                    if self.config.cache_type == CacheType.HYBRID:
                        self.put(key, entry.value, entry.computation_cost)
                    
                    self.metrics.total_hits += 1
                    lookup_time = (time.time() - start_time) * 1000
                    self._update_metrics(True, lookup_time)
                    
                    return entry.value
            
            # Try Redis cache
            if self.config.cache_type in [CacheType.REDIS, CacheType.DISTRIBUTED]:
                entry = self._load_from_redis(key)
                if entry:
                    # Cache in memory for faster future access
                    if self.config.cache_type != CacheType.REDIS:
                        self.put(key, entry.value, entry.computation_cost)
                    
                    self.metrics.total_hits += 1
                    lookup_time = (time.time() - start_time) * 1000
                    self._update_metrics(True, lookup_time)
                    
                    return entry.value
            
            # Cache miss
            self.metrics.total_misses += 1
            lookup_time = (time.time() - start_time) * 1000
            self._update_metrics(False, lookup_time)
            
            return None
    
    def _update_metrics(self, is_hit: bool, lookup_time: float) -> None:
        """Update cache performance metrics"""
        
        total_requests = self.metrics.total_requests
        
        self.metrics.hit_rate = self.metrics.total_hits / total_requests
        self.metrics.miss_rate = self.metrics.total_misses / total_requests
        self.metrics.memory_usage = self._current_memory_usage / (1024 * 1024)  # MB
        
        # Update average lookup time
        if not hasattr(self, '_total_lookup_time'):
            self._total_lookup_time = 0
        
        self._total_lookup_time += lookup_time
        self.metrics.avg_lookup_time = self._total_lookup_time / total_requests
        
        # Calculate cultural metrics
        cultural_entries = sum(1 for entry in self.memory_cache.values() if entry.is_cultural_content)
        total_entries = len(self.memory_cache)
        
        if total_entries > 0:
            self.metrics.romanian_content_percentage = cultural_entries / total_entries
    
    def cached_function(self, computation_cost: float = 0.0):
        """Decorator for caching function results"""
        
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = self._generate_cache_key(func.__name__, *args, **kwargs)
                
                # Try to get from cache
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Compute result
                result = func(*args, **kwargs)
                
                # Store in cache
                self.put(cache_key, result, computation_cost)
                
                return result
            
            return wrapper
        
        return decorator
    
    def cached_async_function(self, computation_cost: float = 0.0):
        """Decorator for caching async function results"""
        
        def decorator(func: Callable) -> Callable:
            @functools.wraps(func)
            async def wrapper(*args, **kwargs):
                # Generate cache key
                cache_key = self._generate_cache_key(func.__name__, *args, **kwargs)
                
                # Try to get from cache
                cached_result = self.get(cache_key)
                if cached_result is not None:
                    return cached_result
                
                # Compute result
                result = await func(*args, **kwargs)
                
                # Store in cache
                self.put(cache_key, result, computation_cost)
                
                return result
            
            return wrapper
        
        return decorator
    
    def clear(self) -> None:
        """Clear all cache entries"""
        
        with self._lock:
            self.memory_cache.clear()
            self._current_memory_usage = 0
            
            if self.redis_client:
                try:
                    # Clear Redis keys
                    keys = self.redis_client.keys("romai_cache:*")
                    if keys:
                        self.redis_client.delete(*keys)
                except Exception as e:
                    logger.error(f"Failed to clear Redis cache: {str(e)}")
            
            # Clear disk cache
            if self.config.cache_type in [CacheType.DISK, CacheType.HYBRID]:
                try:
                    for file_path in self.cache_dir.glob("*.pkl*"):
                        file_path.unlink()
                    
                    # Clear database
                    with sqlite3.connect(self.db_path) as conn:
                        conn.execute('DELETE FROM cache_entries')
                        conn.commit()
                        
                except Exception as e:
                    logger.error(f"Failed to clear disk cache: {str(e)}")
            
            logger.info("Cache cleared")
    
    def get_metrics(self) -> CacheMetrics:
        """Get current cache metrics"""
        return self.metrics
    
    def get_cache_info(self) -> Dict[str, Any]:
        """Get detailed cache information"""
        
        with self._lock:
            cultural_entries = [entry for entry in self.memory_cache.values() if entry.is_cultural_content]
            
            info = {
                'total_entries': len(self.memory_cache),
                'cultural_entries': len(cultural_entries),
                'memory_usage_mb': self._current_memory_usage / (1024 * 1024),
                'hit_rate': self.metrics.hit_rate,
                'miss_rate': self.metrics.miss_rate,
                'avg_lookup_time_ms': self.metrics.avg_lookup_time,
                'config': self.config.to_dict(),
                'top_cultural_entries': [
                    {
                        'key': entry.key[:50] + '...' if len(entry.key) > 50 else entry.key,
                        'cultural_type': entry.cultural_type,
                        'romanian_relevance': entry.romanian_relevance,
                        'access_count': entry.access_count
                    }
                    for entry in sorted(cultural_entries, key=lambda x: x.romanian_relevance, reverse=True)[:10]
                ]
            }
            
            return info


# Example usage and testing
if __name__ == "__main__":
    # Create cache configuration
    config = CacheConfig(
        cache_type=CacheType.HYBRID,
        cache_strategy=CacheStrategy.CULTURAL_PRIORITY,
        max_memory_size=256,  # 256 MB
        cultural_priority_weight=2.0,
        preserve_cultural_cache=True
    )
    
    # Initialize cache system
    cache = AdvancedCacheSystem(config)
    
    print("🗄️ RomAI Advanced Caching System Test")
    print("="*50)
    
    # Test data with cultural content
    test_data = [
        ("regular_data", "This is some regular English text data", 10),
        ("romanian_cultural", "Mihai Eminescu a scris Luceafărul, o capodoperă a literaturii românești", 50),
        ("folklore_data", "Miorița este o baladă populară românească despre spațiul mioritic", 30),
        ("mixed_content", "The poem Luceafărul by Eminescu is about love și destiny", 25),
        # RomAI General Expert - Authentic Neural Inference
                try:
                    # Route to appropriate expert based on input analysis
                    expert_input = self._prepare_expert_input(input_data)

                    # Automatic expert selection
                    selected_expert = self.model.router.select_optimal_expert(expert_input)

                    # Process with selected expert
                    with torch.no_grad():
                        expert_outputs = self.model.route_to_expert(
                            expert_input,
                            expert_type=selected_expert,
                            use_mla_attention=True
                        )

                        # Generate response
                        response = self.model.generate_response(expert_outputs)

                        return {
                            "response": response["response"],
                            "reasoning": response["reasoning"],
                            "confidence": response["confidence"],
                            "expert_used": selected_expert,
                            "method": "neural_general_reasoning",
                            "quality_score": response["quality_score"]
                        }

                except Exception as e:
                    logger.error(f"General expert error: {e}")
                    # Ultimate fallback
                    return {"error": f"Neural inference failed: {e}", "fallback": True}
        ("diacritics_text", "Această poveste vorbește despre tradițiile românești", 40)
    ]
    
    print("\n💾 Testing cache storage and retrieval:")
    
    # Store test data
    for key, data, cost in test_data:
        cache.put(key, data, computation_cost=cost)
        print(f"   ✅ Stored: {key}")
    
    # Test retrieval
    print(f"\n🔍 Testing cache retrieval:")
    
    for key, _, _ in test_data:
        result = cache.get(key)
        if result is not None:
            print(f"   ✅ Retrieved: {key} (hit)")
        else:
            print(f"   ❌ Missing: {key} (miss)")
    
    # Test function caching
    print(f"\n🎯 Testing function caching:")
    
    @cache.cached_function(computation_cost=100)
    def expensive_romanian_analysis(text: str) -> str:
        """Simulate expensive Romanian text analysis"""
        time.sleep(0.01)  # Simulate computation
        if 'eminescu' in text.lower():
            return f"Analysis: {text} contains references to Eminescu - Romanian romantic poet"
        elif 'mioritic' in text.lower():
            return f"Analysis: {text} relates to mioritic space - Romanian cultural concept"
        else:
            return f"Analysis: {text} - general content"
    
    # Test function calls (first should compute, second should hit cache)
    test_texts = [
        "Eminescu wrote beautiful poetry",
        "The mioritic space represents acceptance",
        "Regular English text"
    ]
    
    for text in test_texts:
        print(f"   📝 Testing: {text[:30]}...")
        
        # First call (should compute)
        start_time = time.time()
        result1 = expensive_romanian_analysis(text)
        time1 = (time.time() - start_time) * 1000
        
        # Second call (should hit cache)
        start_time = time.time()
        result2 = expensive_romanian_analysis(text)
        time2 = (time.time() - start_time) * 1000
        
        print(f"      First call: {time1:.2f}ms")
        print(f"      Second call: {time2:.2f}ms ({time1/time2:.1f}x speedup)")
        print(f"      Results match: {'✅' if result1 == result2 else '❌'}")
    
    # Get cache metrics
    print(f"\n📊 Cache Performance Metrics:")
    metrics = cache.get_metrics()
    
    print(f"   Hit rate: {metrics.hit_rate:.1%}")
    print(f"   Miss rate: {metrics.miss_rate:.1%}")
    print(f"   Memory usage: {metrics.memory_usage:.1f} MB")
    print(f"   Average lookup time: {metrics.avg_lookup_time:.2f} ms")
    print(f"   Romanian content: {metrics.romanian_content_percentage:.1%}")
    
    # Get detailed cache info
    print(f"\n🔍 Cache Information:")
    info = cache.get_cache_info()
    
    print(f"   Total entries: {info['total_entries']}")
    print(f"   Cultural entries: {info['cultural_entries']}")
    print(f"   Memory usage: {info['memory_usage_mb']:.1f} MB")
    
    if info['top_cultural_entries']:
        print(f"   🏛️ Top cultural entries:")
        for entry in info['top_cultural_entries'][:3]:
            print(f"      • {entry['key']} [{entry['cultural_type']}] "
                  f"(relevance: {entry['romanian_relevance']:.2f})")
    
    # Test async caching
    print(f"\n🔄 Testing async function caching:")
    
    @cache.cached_async_function(computation_cost=200)
    async def async_cultural_processing(text: str) -> Dict[str, Any]:
        """Simulate async cultural text processing"""
        await asyncio.sleep(0.01)  # Simulate async computation
        
        cultural_score = 0
        if 'romanian' in text.lower() or 'român' in text.lower():
            cultural_score += 0.5
        if any(char in text for char in 'ăâîșț'):
            cultural_score += 0.3
        
        return {
            'text': text,
            'cultural_score': cultural_score,
            'processing_time': 0.01
        }
    
    async def test_async_caching():
        test_text = "Această analiză culturală românească este complexă"
        
        # First async call
        start_time = time.time()
        result1 = await async_cultural_processing(test_text)
        time1 = (time.time() - start_time) * 1000
        
        # Second async call (should hit cache)
        start_time = time.time()
        result2 = await async_cultural_processing(test_text)
        time2 = (time.time() - start_time) * 1000
        
        print(f"   📝 Async test: {test_text[:30]}...")
        print(f"      First call: {time1:.2f}ms")
        print(f"      Second call: {time2:.2f}ms ({time1/time2:.1f}x speedup)")
        print(f"      Cultural score: {result1['cultural_score']:.2f}")
    
    # Run async test
    asyncio.run(test_async_caching())
    
    print(f"\n✨ Advanced caching system testing completed!")
    print(f"Romanian cultural content prioritization and intelligent caching ready")