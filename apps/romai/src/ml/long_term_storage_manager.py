"""
Long-Term Storage Manager - Phase 5 Component
Specialized system for persistent knowledge storage and retrieval
"""

import asyncio
import time
import json
import uuid
import sqlite3
import pickle
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
import logging
import hashlib
import zlib

# Import our existing components
from romai_api_client import RomAIAPIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class StorageCategory(Enum):
    FACTUAL = "factual"               # Factual knowledge and data
    PROCEDURAL = "procedural"         # How-to knowledge and procedures
    EXPERIENTIAL = "experiential"     # Consolidated experiences
    CONCEPTUAL = "conceptual"         # Abstract concepts and relationships
    CONTEXTUAL = "contextual"         # Context-specific knowledge
    REFERENCE = "reference"           # Reference information and lookups
    PATTERN = "pattern"               # Identified patterns and templates

class StorageIntegrity(Enum):
    VERIFIED = "verified"             # Data integrity verified
    CORRUPTED = "corrupted"           # Data corruption detected
    RECOVERING = "recovering"         # Recovery in progress
    UNKNOWN = "unknown"               # Integrity status unknown

class AccessPattern(Enum):
    FREQUENT = "frequent"             # Frequently accessed
    PERIODIC = "periodic"             # Periodically accessed
    RARE = "rare"                     # Rarely accessed
    ARCHIVED = "archived"             # Deep storage, rarely accessed
    HISTORICAL = "historical"         # Historical data, reference only

@dataclass
class LongTermMemoryEntry:
    entry_id: str
    content: Any
    category: StorageCategory
    creation_timestamp: datetime
    last_accessed: datetime
    last_modified: datetime
    access_frequency: int
    access_pattern: AccessPattern
    content_hash: str                 # For integrity verification
    compressed_size: int
    original_size: int
    compression_ratio: float
    semantic_tags: Set[str]
    source_context: Dict[str, Any]    # Where this knowledge came from
    relationships: List[str]          # Related entry IDs
    importance_score: float           # Long-term importance
    retention_priority: float         # Priority for retention
    storage_integrity: StorageIntegrity
    metadata: Dict[str, Any]

@dataclass
class StorageMetrics:
    total_entries: int
    total_storage_bytes: int
    average_compression_ratio: float
    entries_by_category: Dict[str, int]
    entries_by_access_pattern: Dict[str, int]
    integrity_status: Dict[str, int]
    retrieval_performance: Dict[str, float]
    storage_efficiency: float

@dataclass
class RetrievalQuery:
    query_text: str
    categories: Optional[List[StorageCategory]] = None
    semantic_tags: Optional[List[str]] = None
    time_range: Optional[Tuple[datetime, datetime]] = None
    importance_threshold: Optional[float] = None
    max_results: int = 20
    include_relationships: bool = False
    access_pattern_filter: Optional[List[AccessPattern]] = None

@dataclass
class RetrievalResult:
    entries: List[LongTermMemoryEntry]
    relevance_scores: List[float]
    total_found: int
    search_time: float
    semantic_clusters: List[Dict[str, Any]]
    relationship_graph: Dict[str, List[str]]

class LongTermStorageManager:
    """Advanced long-term storage system for persistent memory management"""
    
    def __init__(self, storage_path: str = "./long_term_memory.db"):
        self.romai_client = RomAIAPIClient()
        self.storage_path = Path(storage_path)
        
        # Storage configuration
        self.compression_enabled = True
        self.integrity_checking = True
        self.auto_compression_threshold = 1024  # Bytes
        self.retention_days = {
            StorageCategory.FACTUAL: 365,
            StorageCategory.PROCEDURAL: 730,
            StorageCategory.EXPERIENTIAL: 180,
            StorageCategory.CONCEPTUAL: 1095,
            StorageCategory.CONTEXTUAL: 90,
            StorageCategory.REFERENCE: 1460,
            StorageCategory.PATTERN: 545
        }
        
        # Performance settings
        self.cache_size = 1000  # Number of entries to cache in memory
        self.batch_size = 100   # Batch size for operations
        self.semantic_similarity_threshold = 0.7
        
        # Initialize database
        self.db_connection = None
        self._initialize_database()
        
        # In-memory cache for frequently accessed items
        self.memory_cache: Dict[str, LongTermMemoryEntry] = {}
        self.cache_access_order = []
        
        # Performance tracking
        self.performance_metrics = {
            "entries_stored": 0,
            "entries_retrieved": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "integrity_checks_passed": 0,
            "integrity_failures": 0,
            "compression_operations": 0,
            "decompression_operations": 0
        }
        
        logger.info(f"Long-Term Storage Manager initialized with database: {self.storage_path}")
    
    def _initialize_database(self) -> None:
        """Initialize SQLite database for long-term storage"""
        try:
            self.db_connection = sqlite3.connect(str(self.storage_path), check_same_thread=False)
            self.db_connection.execute("PRAGMA foreign_keys = ON")
            
            # Create main entries table
            self.db_connection.execute("""
                CREATE TABLE IF NOT EXISTS memory_entries (
                    entry_id TEXT PRIMARY KEY,
                    category TEXT NOT NULL,
                    creation_timestamp REAL NOT NULL,
                    last_accessed REAL NOT NULL,
                    last_modified REAL NOT NULL,
                    access_frequency INTEGER DEFAULT 0,
                    access_pattern TEXT DEFAULT 'rare',
                    content_data BLOB NOT NULL,
                    content_hash TEXT NOT NULL,
                    compressed_size INTEGER NOT NULL,
                    original_size INTEGER NOT NULL,
                    compression_ratio REAL NOT NULL,
                    importance_score REAL DEFAULT 0.5,
                    retention_priority REAL DEFAULT 0.5,
                    storage_integrity TEXT DEFAULT 'unknown',
                    source_context TEXT,
                    metadata TEXT
                )
            """)
            
            # Create semantic tags table
            self.db_connection.execute("""
                CREATE TABLE IF NOT EXISTS semantic_tags (
                    entry_id TEXT,
                    tag TEXT,
                    FOREIGN KEY (entry_id) REFERENCES memory_entries (entry_id),
                    PRIMARY KEY (entry_id, tag)
                )
            """)
            
            # Create relationships table
            self.db_connection.execute("""
                CREATE TABLE IF NOT EXISTS entry_relationships (
                    source_id TEXT,
                    target_id TEXT,
                    relationship_strength REAL DEFAULT 0.5,
                    relationship_type TEXT DEFAULT 'general',
                    FOREIGN KEY (source_id) REFERENCES memory_entries (entry_id),
                    FOREIGN KEY (target_id) REFERENCES memory_entries (entry_id),
                    PRIMARY KEY (source_id, target_id)
                )
            """)
            
            # Create indexes for performance
            self.db_connection.execute("CREATE INDEX IF NOT EXISTS idx_category ON memory_entries (category)")
            self.db_connection.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON memory_entries (creation_timestamp)")
            self.db_connection.execute("CREATE INDEX IF NOT EXISTS idx_importance ON memory_entries (importance_score)")
            self.db_connection.execute("CREATE INDEX IF NOT EXISTS idx_tags ON semantic_tags (tag)")
            
            self.db_connection.commit()
            
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise
    
    def _generate_entry_id(self, category: StorageCategory) -> str:
        """Generate unique entry ID"""
        prefix = f"LT_{category.value[:3].upper()}"
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        return f"{prefix}_{timestamp}_{unique_id}"
    
    def _calculate_content_hash(self, content: Any) -> str:
        """Calculate hash for content integrity verification"""
        try:
            content_str = json.dumps(content, sort_keys=True, default=str)
            return hashlib.sha256(content_str.encode()).hexdigest()
        except Exception:
            # Fallback for non-JSON serializable content
            content_bytes = pickle.dumps(content)
            return hashlib.sha256(content_bytes).hexdigest()
    
    def _compress_content(self, content: Any) -> Tuple[bytes, int, int, float]:
        """Compress content and return compressed data with size metrics"""
        try:
            # Serialize content
            content_bytes = pickle.dumps(content)
            original_size = len(content_bytes)
            
            # Compress if above threshold
            if self.compression_enabled and original_size > self.auto_compression_threshold:
                compressed_data = zlib.compress(content_bytes, level=6)
                compressed_size = len(compressed_data)
                compression_ratio = compressed_size / original_size if original_size > 0 else 1.0
                
                self.performance_metrics["compression_operations"] += 1
            else:
                compressed_data = content_bytes
                compressed_size = original_size
                compression_ratio = 1.0
            
            return compressed_data, compressed_size, original_size, compression_ratio
            
        except Exception as e:
            logger.error(f"Error compressing content: {str(e)}")
            # Return uncompressed as fallback
            content_bytes = pickle.dumps(content)
            size = len(content_bytes)
            return content_bytes, size, size, 1.0
    
    def _decompress_content(self, compressed_data: bytes, compression_ratio: float) -> Any:
        """Decompress content"""
        try:
            # If compression ratio is 1.0, data is not compressed
            if compression_ratio >= 0.99:
                content = pickle.loads(compressed_data)
            else:
                decompressed_data = zlib.decompress(compressed_data)
                content = pickle.loads(decompressed_data)
                self.performance_metrics["decompression_operations"] += 1
            
            return content
            
        except Exception as e:
            logger.error(f"Error decompressing content: {str(e)}")
            raise
    
    def _extract_semantic_tags(self, content: Any, category: StorageCategory) -> Set[str]:
        """Extract semantic tags from content"""
        try:
            tags = set()
            content_str = str(content).lower()
            
            # Category-specific tag extraction
            if category == StorageCategory.FACTUAL:
                # Extract factual keywords
                factual_indicators = ['fact', 'data', 'information', 'statistic', 'evidence']
                tags.update(word for word in factual_indicators if word in content_str)
            
            elif category == StorageCategory.PROCEDURAL:
                # Extract procedural keywords
                procedural_indicators = ['step', 'process', 'method', 'procedure', 'how', 'instructions']
                tags.update(word for word in procedural_indicators if word in content_str)
            
            elif category == StorageCategory.EXPERIENTIAL:
                # Extract experiential keywords
                experiential_indicators = ['experience', 'learned', 'discovered', 'found', 'realized']
                tags.update(word for word in experiential_indicators if word in content_str)
            
            # General keyword extraction (simplified)
            words = content_str.split()
            significant_words = [word for word in words if len(word) > 4 and word.isalpha()]
            
            # Add most relevant words as tags (limit to prevent tag explosion)
            word_freq = {}
            for word in significant_words:
                word_freq[word] = word_freq.get(word, 0) + 1
            
            # Get top frequent words
            top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:5]
            tags.update(word for word, freq in top_words if freq > 1)
            
            return tags
            
        except Exception as e:
            logger.error(f"Error extracting semantic tags: {str(e)}")
            return set()
    
    async def store_entry(self, content: Any, category: StorageCategory,
                         importance_score: float = 0.5,
                         retention_priority: float = 0.5,
                         source_context: Optional[Dict[str, Any]] = None,
                         semantic_tags: Optional[Set[str]] = None,
                         relationships: Optional[List[str]] = None,
                         metadata: Optional[Dict[str, Any]] = None) -> str:
        """Store entry in long-term memory"""
        try:
            entry_id = self._generate_entry_id(category)
            current_time = datetime.now()
            
            # Set defaults
            if source_context is None:
                source_context = {}
            if relationships is None:
                relationships = []
            if metadata is None:
                metadata = {}
            
            # Calculate content hash for integrity
            content_hash = self._calculate_content_hash(content)
            
            # Compress content
            compressed_data, compressed_size, original_size, compression_ratio = self._compress_content(content)
            
            # Extract or use provided semantic tags
            if semantic_tags is None:
                semantic_tags = self._extract_semantic_tags(content, category)
            
            # Determine initial access pattern
            access_pattern = AccessPattern.RARE  # Default for new entries
            if importance_score > 0.8:
                access_pattern = AccessPattern.FREQUENT
            elif importance_score > 0.6:
                access_pattern = AccessPattern.PERIODIC
            
            # Store in database
            current_timestamp = current_time.timestamp()
            
            self.db_connection.execute("""
                INSERT INTO memory_entries (
                    entry_id, category, creation_timestamp, last_accessed, last_modified,
                    access_frequency, access_pattern, content_data, content_hash,
                    compressed_size, original_size, compression_ratio,
                    importance_score, retention_priority, storage_integrity,
                    source_context, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry_id, category.value, current_timestamp, current_timestamp, current_timestamp,
                0, access_pattern.value, compressed_data, content_hash,
                compressed_size, original_size, compression_ratio,
                importance_score, retention_priority, StorageIntegrity.VERIFIED.value,
                json.dumps(source_context), json.dumps(metadata)
            ))
            
            # Store semantic tags
            for tag in semantic_tags:
                self.db_connection.execute(
                    "INSERT OR IGNORE INTO semantic_tags (entry_id, tag) VALUES (?, ?)",
                    (entry_id, tag)
                )
            
            # Store relationships
            for related_id in relationships:
                self.db_connection.execute("""
                    INSERT OR IGNORE INTO entry_relationships (source_id, target_id) 
                    VALUES (?, ?)
                """, (entry_id, related_id))
                
                # Create bidirectional relationship
                self.db_connection.execute("""
                    INSERT OR IGNORE INTO entry_relationships (source_id, target_id) 
                    VALUES (?, ?)
                """, (related_id, entry_id))
            
            self.db_connection.commit()
            
            # Create memory entry object
            entry = LongTermMemoryEntry(
                entry_id=entry_id,
                content=content,
                category=category,
                creation_timestamp=current_time,
                last_accessed=current_time,
                last_modified=current_time,
                access_frequency=0,
                access_pattern=access_pattern,
                content_hash=content_hash,
                compressed_size=compressed_size,
                original_size=original_size,
                compression_ratio=compression_ratio,
                semantic_tags=semantic_tags,
                source_context=source_context,
                relationships=relationships,
                importance_score=importance_score,
                retention_priority=retention_priority,
                storage_integrity=StorageIntegrity.VERIFIED,
                metadata=metadata
            )
            
            # Add to cache if high importance
            if importance_score > 0.7:
                await self._add_to_cache(entry)
            
            self.performance_metrics["entries_stored"] += 1
            logger.info(f"Stored long-term memory entry: {entry_id}")
            
            return entry_id
            
        except Exception as e:
            logger.error(f"Error storing entry: {str(e)}")
            raise
    
    async def retrieve_entry(self, entry_id: str) -> Optional[LongTermMemoryEntry]:
        """Retrieve specific entry by ID"""
        try:
            # Check cache first
            if entry_id in self.memory_cache:
                self.performance_metrics["cache_hits"] += 1
                await self._update_cache_access(entry_id)
                return self.memory_cache[entry_id]
            
            # Query database
            cursor = self.db_connection.execute("""
                SELECT * FROM memory_entries WHERE entry_id = ?
            """, (entry_id,))
            
            row = cursor.fetchone()
            if not row:
                return None
            
            # Parse row data
            entry_data = dict(zip([col[0] for col in cursor.description], row))
            
            # Decompress content
            content = self._decompress_content(entry_data['content_data'], entry_data['compression_ratio'])
            
            # Get semantic tags
            tag_cursor = self.db_connection.execute(
                "SELECT tag FROM semantic_tags WHERE entry_id = ?", (entry_id,)
            )
            semantic_tags = {tag[0] for tag in tag_cursor.fetchall()}
            
            # Get relationships
            rel_cursor = self.db_connection.execute(
                "SELECT target_id FROM entry_relationships WHERE source_id = ?", (entry_id,)
            )
            relationships = [rel[0] for rel in rel_cursor.fetchall()]
            
            # Create entry object
            entry = LongTermMemoryEntry(
                entry_id=entry_id,
                content=content,
                category=StorageCategory(entry_data['category']),
                creation_timestamp=datetime.fromtimestamp(entry_data['creation_timestamp']),
                last_accessed=datetime.fromtimestamp(entry_data['last_accessed']),
                last_modified=datetime.fromtimestamp(entry_data['last_modified']),
                access_frequency=entry_data['access_frequency'],
                access_pattern=AccessPattern(entry_data['access_pattern']),
                content_hash=entry_data['content_hash'],
                compressed_size=entry_data['compressed_size'],
                original_size=entry_data['original_size'],
                compression_ratio=entry_data['compression_ratio'],
                semantic_tags=semantic_tags,
                source_context=json.loads(entry_data['source_context']) if entry_data['source_context'] else {},
                relationships=relationships,
                importance_score=entry_data['importance_score'],
                retention_priority=entry_data['retention_priority'],
                storage_integrity=StorageIntegrity(entry_data['storage_integrity']),
                metadata=json.loads(entry_data['metadata']) if entry_data['metadata'] else {}
            )
            
            # Update access statistics
            await self._update_access_statistics(entry)
            
            # Add to cache
            await self._add_to_cache(entry)
            
            self.performance_metrics["entries_retrieved"] += 1
            self.performance_metrics["cache_misses"] += 1
            
            return entry
            
        except Exception as e:
            logger.error(f"Error retrieving entry {entry_id}: {str(e)}")
            return None
    
    async def search_entries(self, query: RetrievalQuery) -> RetrievalResult:
        """Search entries based on complex query"""
        search_start = time.time()
        
        try:
            # Build SQL query conditions
            conditions = []
            params = []
            
            # Category filter
            if query.categories:
                category_placeholders = ','.join('?' * len(query.categories))
                conditions.append(f"category IN ({category_placeholders})")
                params.extend([cat.value for cat in query.categories])
            
            # Time range filter
            if query.time_range:
                start_time, end_time = query.time_range
                conditions.append("creation_timestamp BETWEEN ? AND ?")
                params.extend([start_time.timestamp(), end_time.timestamp()])
            
            # Importance threshold
            if query.importance_threshold:
                conditions.append("importance_score >= ?")
                params.append(query.importance_threshold)
            
            # Access pattern filter
            if query.access_pattern_filter:
                pattern_placeholders = ','.join('?' * len(query.access_pattern_filter))
                conditions.append(f"access_pattern IN ({pattern_placeholders})")
                params.extend([pat.value for pat in query.access_pattern_filter])
            
            # Build base query
            base_query = "SELECT entry_id FROM memory_entries"
            if conditions:
                base_query += " WHERE " + " AND ".join(conditions)
            
            # Add ordering and limit
            base_query += " ORDER BY importance_score DESC, last_accessed DESC"
            base_query += f" LIMIT {query.max_results * 2}"  # Get more for filtering
            
            # Execute base query
            cursor = self.db_connection.execute(base_query, params)
            candidate_ids = [row[0] for row in cursor.fetchall()]
            
            # Filter by semantic tags if specified
            if query.semantic_tags:
                tag_filtered_ids = []
                for entry_id in candidate_ids:
                    tag_cursor = self.db_connection.execute(
                        "SELECT COUNT(*) FROM semantic_tags WHERE entry_id = ? AND tag IN ({})".format(
                            ','.join('?' * len(query.semantic_tags))
                        ), [entry_id] + query.semantic_tags
                    )
                    
                    if tag_cursor.fetchone()[0] > 0:
                        tag_filtered_ids.append(entry_id)
                
                candidate_ids = tag_filtered_ids
            
            # Calculate text relevance for remaining candidates
            relevant_entries = []
            
            for entry_id in candidate_ids[:query.max_results]:
                entry = await self.retrieve_entry(entry_id)
                if entry:
                    relevance = await self._calculate_text_relevance(query.query_text, entry)
                    if relevance > 0.1:  # Minimum relevance threshold
                        relevant_entries.append((entry, relevance))
            
            # Sort by relevance
            relevant_entries.sort(key=lambda x: x[1], reverse=True)
            
            # Prepare results
            entries = [entry for entry, relevance in relevant_entries[:query.max_results]]
            relevance_scores = [relevance for entry, relevance in relevant_entries[:query.max_results]]
            
            # Get relationships if requested
            relationship_graph = {}
            if query.include_relationships and entries:
                for entry in entries:
                    relationship_graph[entry.entry_id] = entry.relationships
            
            # Perform semantic clustering (simplified)
            semantic_clusters = await self._perform_semantic_clustering(entries)
            
            search_time = time.time() - search_start
            
            result = RetrievalResult(
                entries=entries,
                relevance_scores=relevance_scores,
                total_found=len(candidate_ids),
                search_time=search_time,
                semantic_clusters=semantic_clusters,
                relationship_graph=relationship_graph
            )
            
            logger.info(f"Search completed: {len(entries)} results in {search_time:.3f}s")
            
            return result
            
        except Exception as e:
            logger.error(f"Error searching entries: {str(e)}")
            search_time = time.time() - search_start
            return RetrievalResult([], [], 0, search_time, [], {})
    
    async def _calculate_text_relevance(self, query_text: str, entry: LongTermMemoryEntry) -> float:
        """Calculate text relevance between query and entry"""
        try:
            query_words = set(query_text.lower().split())
            content_str = str(entry.content).lower()
            content_words = set(content_str.split())
            
            # Word overlap
            overlap = len(query_words.intersection(content_words))
            if len(query_words) == 0:
                word_relevance = 0.0
            else:
                word_relevance = overlap / len(query_words)
            
            # Tag overlap
            query_tag_overlap = len(query_words.intersection({tag.lower() for tag in entry.semantic_tags}))
            tag_relevance = query_tag_overlap / len(query_words) if query_words else 0.0
            
            # Importance boost
            importance_boost = entry.importance_score * 0.2
            
            # Recency boost
            days_since_creation = (datetime.now() - entry.creation_timestamp).days
            recency_boost = max(0, (365 - days_since_creation) / 365 * 0.1)
            
            total_relevance = word_relevance * 0.5 + tag_relevance * 0.3 + importance_boost + recency_boost
            
            return min(total_relevance, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating text relevance: {str(e)}")
            return 0.0
    
    async def _perform_semantic_clustering(self, entries: List[LongTermMemoryEntry]) -> List[Dict[str, Any]]:
        """Perform semantic clustering on entries"""
        try:
            clusters = []
            
            if not entries:
                return clusters
            
            # Simple clustering based on categories and tags
            category_clusters = {}
            
            for entry in entries:
                category = entry.category.value
                if category not in category_clusters:
                    category_clusters[category] = {
                        'category': category,
                        'entries': [],
                        'common_tags': set(),
                        'avg_importance': 0.0
                    }
                
                category_clusters[category]['entries'].append(entry.entry_id)
                category_clusters[category]['common_tags'].update(entry.semantic_tags)
            
            # Calculate cluster statistics
            for cluster_data in category_clusters.values():
                entry_count = len(cluster_data['entries'])
                if entry_count > 0:
                    # Get entries for this cluster
                    cluster_entries = [e for e in entries if e.entry_id in cluster_data['entries']]
                    
                    # Calculate average importance
                    avg_importance = sum(e.importance_score for e in cluster_entries) / entry_count
                    cluster_data['avg_importance'] = avg_importance
                    
                    # Find truly common tags (appear in multiple entries)
                    if entry_count > 1:
                        tag_counts = {}
                        for entry in cluster_entries:
                            for tag in entry.semantic_tags:
                                tag_counts[tag] = tag_counts.get(tag, 0) + 1
                        
                        common_tags = {tag for tag, count in tag_counts.items() if count > 1}
                        cluster_data['common_tags'] = list(common_tags)
                    
                    clusters.append({
                        'cluster_id': f"cluster_{category}",
                        'type': 'category',
                        'name': category.title() + ' Knowledge',
                        'entry_count': entry_count,
                        'entries': cluster_data['entries'],
                        'common_tags': list(cluster_data['common_tags'])[:5],  # Limit tags
                        'average_importance': round(avg_importance, 3)
                    })
            
            return clusters
            
        except Exception as e:
            logger.error(f"Error performing semantic clustering: {str(e)}")
            return []
    
    async def _add_to_cache(self, entry: LongTermMemoryEntry) -> None:
        """Add entry to memory cache"""
        try:
            # Check if cache is full
            if len(self.memory_cache) >= self.cache_size:
                # Remove least recently used entry
                if self.cache_access_order:
                    lru_entry_id = self.cache_access_order.pop(0)
                    if lru_entry_id in self.memory_cache:
                        del self.memory_cache[lru_entry_id]
            
            # Add to cache
            self.memory_cache[entry.entry_id] = entry
            
            # Update access order
            if entry.entry_id in self.cache_access_order:
                self.cache_access_order.remove(entry.entry_id)
            self.cache_access_order.append(entry.entry_id)
            
        except Exception as e:
            logger.error(f"Error adding to cache: {str(e)}")
    
    async def _update_cache_access(self, entry_id: str) -> None:
        """Update cache access order"""
        try:
            if entry_id in self.cache_access_order:
                self.cache_access_order.remove(entry_id)
                self.cache_access_order.append(entry_id)
        except Exception as e:
            logger.error(f"Error updating cache access: {str(e)}")
    
    async def _update_access_statistics(self, entry: LongTermMemoryEntry) -> None:
        """Update access statistics for entry"""
        try:
            current_time = datetime.now()
            
            # Update in-memory object
            entry.access_frequency += 1
            entry.last_accessed = current_time
            
            # Update access pattern based on frequency
            if entry.access_frequency > 10:
                entry.access_pattern = AccessPattern.FREQUENT
            elif entry.access_frequency > 3:
                entry.access_pattern = AccessPattern.PERIODIC
            
            # Update database
            self.db_connection.execute("""
                UPDATE memory_entries 
                SET access_frequency = access_frequency + 1,
                    last_accessed = ?,
                    access_pattern = ?
                WHERE entry_id = ?
            """, (current_time.timestamp(), entry.access_pattern.value, entry.entry_id))
            
            self.db_connection.commit()
            
        except Exception as e:
            logger.error(f"Error updating access statistics: {str(e)}")
    
    def get_storage_metrics(self) -> StorageMetrics:
        """Get comprehensive storage metrics"""
        try:
            # Get basic counts
            cursor = self.db_connection.execute("SELECT COUNT(*) FROM memory_entries")
            total_entries = cursor.fetchone()[0]
            
            # Get storage size
            cursor = self.db_connection.execute("SELECT SUM(compressed_size) FROM memory_entries")
            total_size_result = cursor.fetchone()[0]
            total_storage_bytes = total_size_result if total_size_result else 0
            
            # Get average compression ratio
            cursor = self.db_connection.execute("SELECT AVG(compression_ratio) FROM memory_entries")
            avg_compression_result = cursor.fetchone()[0]
            avg_compression = avg_compression_result if avg_compression_result else 1.0
            
            # Get distribution by category
            cursor = self.db_connection.execute("""
                SELECT category, COUNT(*) FROM memory_entries GROUP BY category
            """)
            entries_by_category = dict(cursor.fetchall())
            
            # Get distribution by access pattern
            cursor = self.db_connection.execute("""
                SELECT access_pattern, COUNT(*) FROM memory_entries GROUP BY access_pattern
            """)
            entries_by_access_pattern = dict(cursor.fetchall())
            
            # Get integrity status
            cursor = self.db_connection.execute("""
                SELECT storage_integrity, COUNT(*) FROM memory_entries GROUP BY storage_integrity
            """)
            integrity_status = dict(cursor.fetchall())
            
            # Calculate storage efficiency (compression effectiveness)
            cursor = self.db_connection.execute("SELECT SUM(original_size) FROM memory_entries")
            total_original_result = cursor.fetchone()[0]
            total_original_bytes = total_original_result if total_original_result else 0
            
            storage_efficiency = 1.0
            if total_original_bytes > 0:
                storage_efficiency = total_storage_bytes / total_original_bytes
            
            # Retrieval performance (simplified)
            retrieval_performance = {
                "cache_hit_rate": self.performance_metrics["cache_hits"] / max(
                    self.performance_metrics["cache_hits"] + self.performance_metrics["cache_misses"], 1
                ),
                "entries_per_second": self.performance_metrics["entries_retrieved"] / max(time.time() - 1, 1)
            }
            
            return StorageMetrics(
                total_entries=total_entries,
                total_storage_bytes=total_storage_bytes,
                average_compression_ratio=avg_compression,
                entries_by_category=entries_by_category,
                entries_by_access_pattern=entries_by_access_pattern,
                integrity_status=integrity_status,
                retrieval_performance=retrieval_performance,
                storage_efficiency=storage_efficiency
            )
            
        except Exception as e:
            logger.error(f"Error getting storage metrics: {str(e)}")
            return StorageMetrics(0, 0, 1.0, {}, {}, {}, {}, 1.0)
    
    def close(self) -> None:
        """Close database connection"""
        try:
            if self.db_connection:
                self.db_connection.close()
                logger.info("Long-term storage database connection closed")
        except Exception as e:
            logger.error(f"Error closing database: {str(e)}")

# Test function
async def test_long_term_storage_manager():
    """Test the long-term storage manager"""
    print("🗄️ Testing Long-Term Storage Manager")
    print("=" * 50)
    
    storage_manager = LongTermStorageManager("./test_long_term_memory.db")
    
    try:
        # Test 1: Store various types of knowledge
        print("\n💾 Test 1: Storing Knowledge Entries")
        
        knowledge_data = [
            {
                "content": "RomAI Phase 4 achieved 92% performance with Grade A+ results in multi-modal intelligence testing",
                "category": StorageCategory.FACTUAL,
                "importance": 0.9,
                "tags": {"romai", "phase4", "performance", "multimodal", "testing"},
                "context": {"project": "RomAI Enhancement", "phase": 4, "result": "success"}
            },
            {
                "content": "To implement advanced memory systems: 1) Create episodic memory for experiences, 2) Build working memory for active processing, 3) Design long-term storage for persistent knowledge, 4) Implement memory consolidation",
                "category": StorageCategory.PROCEDURAL,
                "importance": 0.8,
                "tags": {"memory", "implementation", "procedure", "systems", "design"},
                "context": {"domain": "AI", "phase": 5, "component": "memory_architecture"}
            },
            {
                "content": "Machine learning models require careful balance between complexity and generalization to avoid overfitting",
                "category": StorageCategory.CONCEPTUAL,
                "importance": 0.7,
                "tags": {"machine-learning", "overfitting", "generalization", "complexity", "balance"},
                "context": {"domain": "ML", "concept": "model_design"}
            },
            {
                "content": "During Phase 3 code generation implementation, discovered that AST validation significantly improves code safety and reliability",
                "category": StorageCategory.EXPERIENTIAL,
                "importance": 0.8,
                "tags": {"experience", "phase3", "ast", "validation", "safety", "reliability"},
                "context": {"project": "RomAI", "phase": 3, "discovery": "ast_importance"}
            },
            {
                "content": "Python asyncio best practices: Use async/await for I/O operations, avoid blocking calls in async functions, use asyncio.gather for concurrent execution",
                "category": StorageCategory.REFERENCE,
                "importance": 0.6,
                "tags": {"python", "asyncio", "best-practices", "concurrency"},
                "context": {"language": "python", "topic": "asyncio"}
            }
        ]
        
        stored_ids = []
        for data in knowledge_data:
            entry_id = await storage_manager.store_entry(
                content=data["content"],
                category=data["category"],
                importance_score=data["importance"],
                semantic_tags=data["tags"],
                source_context=data["context"]
            )
            stored_ids.append(entry_id)
            print(f"   ✅ Stored {data['category'].value}: {entry_id[:20]}...")
        
        print(f"   📊 Successfully stored: {len(stored_ids)} entries")
        
        # Test 2: Retrieve specific entries
        print("\n🔍 Test 2: Entry Retrieval")
        
        if stored_ids:
            retrieved_entry = await storage_manager.retrieve_entry(stored_ids[0])
            if retrieved_entry:
                print(f"   ✅ Retrieved entry: {retrieved_entry.entry_id}")
                print(f"      Category: {retrieved_entry.category.value}")
                print(f"      Importance: {retrieved_entry.importance_score:.2f}")
                print(f"      Compression: {retrieved_entry.compression_ratio:.3f}")
                print(f"      Tags: {', '.join(list(retrieved_entry.semantic_tags)[:3])}...")
        
        # Test 3: Complex search queries
        print("\n🔎 Test 3: Complex Search Queries")
        
        # Search for RomAI related entries
        romai_query = RetrievalQuery(
            query_text="RomAI Phase 4 performance multi-modal intelligence",
            categories=[StorageCategory.FACTUAL, StorageCategory.EXPERIENTIAL],
            semantic_tags=["romai", "performance"],
            importance_threshold=0.7,
            max_results=5,
            include_relationships=True
        )
        
        search_results = await storage_manager.search_entries(romai_query)
        
        print(f"   ✅ Search completed:")
        print(f"      Found: {len(search_results.entries)} relevant entries")
        print(f"      Total candidates: {search_results.total_found}")
        print(f"      Search time: {search_results.search_time:.3f}s")
        print(f"      Semantic clusters: {len(search_results.semantic_clusters)}")
        
        for i, entry in enumerate(search_results.entries):
            relevance = search_results.relevance_scores[i] if i < len(search_results.relevance_scores) else 0
            print(f"      {i+1}. {entry.category.value} (relevance: {relevance:.3f})")
        
        # Test 4: Semantic clustering analysis
        print("\n📊 Test 4: Semantic Clustering Analysis")
        
        for cluster in search_results.semantic_clusters:
            print(f"   🏷️ Cluster: {cluster['name']}")
            print(f"      Entries: {cluster['entry_count']}")
            print(f"      Avg Importance: {cluster['average_importance']:.3f}")
            if cluster['common_tags']:
                print(f"      Common Tags: {', '.join(cluster['common_tags'])}")
        
        # Test 5: Storage metrics and performance
        print("\n📈 Test 5: Storage Metrics")
        
        metrics = storage_manager.get_storage_metrics()
        
        print(f"   📊 Storage Overview:")
        print(f"      Total entries: {metrics.total_entries}")
        print(f"      Storage size: {metrics.total_storage_bytes:,} bytes")
        print(f"      Average compression: {metrics.average_compression_ratio:.3f}")
        print(f"      Storage efficiency: {metrics.storage_efficiency:.3f}")
        
        print(f"   📂 Category Distribution:")
        for category, count in metrics.entries_by_category.items():
            print(f"      - {category}: {count}")
        
        print(f"   📈 Access Patterns:")
        for pattern, count in metrics.entries_by_access_pattern.items():
            print(f"      - {pattern}: {count}")
        
        print(f"   🎯 Performance Metrics:")
        for metric, value in metrics.retrieval_performance.items():
            print(f"      - {metric}: {value:.3f}")
        
        # Performance summary
        print(f"\n🎯 Performance Summary:")
        success_rate = len(stored_ids) / len(knowledge_data) if knowledge_data else 0
        print(f"   Success Rate: {success_rate:.1%}")
        print(f"   Storage Efficiency: {metrics.storage_efficiency:.1%}")
        print(f"   Search Performance: {search_results.search_time:.3f}s")
        print(f"   Cache Hit Rate: {metrics.retrieval_performance['cache_hit_rate']:.1%}")
        
        return {
            "success_rate": success_rate,
            "entries_stored": len(stored_ids),
            "search_performance": search_results.search_time,
            "storage_efficiency": metrics.storage_efficiency,
            "cache_hit_rate": metrics.retrieval_performance['cache_hit_rate']
        }
        
    finally:
        storage_manager.close()

if __name__ == "__main__":
    asyncio.run(test_long_term_storage_manager())