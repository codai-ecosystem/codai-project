#!/usr/bin/env python3
"""
Enhanced Memory Architecture - Real Implementation
==================================================

Production-grade memory system with:
- Vector-based semantic memory
- Graph-based knowledge representation
- Episodic memory with temporal organization
- Working memory for active processing
- Romanian cultural memory specialization
- Efficient storage and retrieval mechanisms

This replaces the mock memory architecture with a fully functional system.
"""

import asyncio
import json
import logging
import numpy as np
import time
import uuid
from collections import deque, defaultdict
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Any, Optional, Tuple, Set
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F
from sentence_transformers import SentenceTransformer
import networkx as nx
import sqlite3
import pickle

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class MemoryItem:
    """Individual memory item with metadata"""
    id: str
    content: str
    memory_type: str
    embedding: Optional[np.ndarray] = None
    timestamp: datetime = None
    importance: float = 0.5
    cultural_relevance: float = 0.0
    access_count: int = 0
    last_accessed: datetime = None
    related_items: List[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now()
        if self.last_accessed is None:
            self.last_accessed = datetime.now()
        if self.related_items is None:
            self.related_items = []

@dataclass
class EpisodicMemory:
    """Episodic memory with temporal and contextual information"""
    id: str
    event: str
    context: Dict[str, Any]
    timestamp: datetime
    participants: List[str]
    emotions: Dict[str, float]
    cultural_context: Dict[str, Any]
    importance: float = 0.5
    
class MemoryType(Enum):
    SEMANTIC = "semantic"
    EPISODIC = "episodic"
    WORKING = "working"
    CULTURAL = "cultural"
    PROCEDURAL = "procedural"

class VectorMemoryStore:
    """High-performance vector-based memory store"""
    
    def __init__(self, embedding_dim: int = 384):
        self.embedding_dim = embedding_dim
        self.embeddings = []
        self.items = []
        self.index_to_id = {}
        self.id_to_index = {}
        
        # Initialize sentence transformer for embeddings
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        logger.info("✅ Vector Memory Store initialized with SentenceTransformers")
    
    async def store_memory(self, memory_item: MemoryItem) -> str:
        """Store memory item with vector embedding"""
        try:
            # Generate embedding if not provided
            if memory_item.embedding is None:
                memory_item.embedding = self.encoder.encode([memory_item.content])[0]
            
            # Add to stores
            index = len(self.embeddings)
            self.embeddings.append(memory_item.embedding)
            self.items.append(memory_item)
            self.index_to_id[index] = memory_item.id
            self.id_to_index[memory_item.id] = index
            
            logger.info(f"📝 Stored memory: {memory_item.id}")
            return memory_item.id
            
        except Exception as e:
            logger.error(f"❌ Failed to store memory: {e}")
            raise
    
    async def retrieve_similar(self, query: str, top_k: int = 5) -> List[MemoryItem]:
        """Retrieve similar memories using vector similarity"""
        try:
            if not self.embeddings:
                return []
            
            # Encode query
            query_embedding = self.encoder.encode([query])[0]
            
            # Calculate similarities
            embeddings_matrix = np.array(self.embeddings)
            similarities = np.dot(embeddings_matrix, query_embedding) / (
                np.linalg.norm(embeddings_matrix, axis=1) * np.linalg.norm(query_embedding)
            )
            
            # Get top-k most similar
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                memory_item = self.items[idx]
                memory_item.access_count += 1
                memory_item.last_accessed = datetime.now()
                results.append(memory_item)
            
            logger.info(f"🔍 Retrieved {len(results)} similar memories for query")
            return results
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve memories: {e}")
            return []

class KnowledgeGraph:
    """Graph-based knowledge representation"""
    
    def __init__(self):
        self.graph = nx.DiGraph()
        self.entity_embeddings = {}
        self.relation_types = set()
        logger.info("✅ Knowledge Graph initialized")
    
    async def add_entity(self, entity_id: str, properties: Dict[str, Any]):
        """Add entity to knowledge graph"""
        self.graph.add_node(entity_id, **properties)
        logger.info(f"➕ Added entity: {entity_id}")
    
    async def add_relation(self, source: str, target: str, relation_type: str, properties: Dict[str, Any] = None):
        """Add relation between entities"""
        if properties is None:
            properties = {}
        
        self.graph.add_edge(source, target, relation_type=relation_type, **properties)
        self.relation_types.add(relation_type)
        logger.info(f"🔗 Added relation: {source} --{relation_type}--> {target}")
    
    async def find_related(self, entity_id: str, relation_types: List[str] = None, max_depth: int = 2) -> List[str]:
        """Find related entities"""
        try:
            related = []
            if entity_id not in self.graph:
                return related
            
            # BFS to find related entities
            visited = set()
            queue = deque([(entity_id, 0)])
            
            while queue:
                current, depth = queue.popleft()
                if depth >= max_depth or current in visited:
                    continue
                
                visited.add(current)
                if current != entity_id:
                    related.append(current)
                
                # Add neighbors
                for neighbor in self.graph.neighbors(current):
                    edge_data = self.graph.get_edge_data(current, neighbor)
                    if relation_types is None or edge_data.get('relation_type') in relation_types:
                        queue.append((neighbor, depth + 1))
            
            return related
            
        except Exception as e:
            logger.error(f"❌ Failed to find related entities: {e}")
            return []

class WorkingMemory:
    """Working memory for active processing"""
    
    def __init__(self, capacity: int = 7):
        self.capacity = capacity
        self.items = deque(maxlen=capacity)
        self.attention_weights = {}
        logger.info(f"✅ Working Memory initialized (capacity: {capacity})")
    
    async def add_to_working_memory(self, item: MemoryItem, attention_weight: float = 1.0):
        """Add item to working memory"""
        self.items.append(item)
        self.attention_weights[item.id] = attention_weight
        
        # Remove old attention weights if item was evicted
        if len(self.items) == self.capacity and len(self.attention_weights) > self.capacity:
            # Remove oldest entries
            current_ids = {item.id for item in self.items}
            old_ids = set(self.attention_weights.keys()) - current_ids
            for old_id in old_ids:
                del self.attention_weights[old_id]
        
        logger.info(f"🧠 Added to working memory: {item.id}")
    
    async def get_active_items(self) -> List[MemoryItem]:
        """Get currently active items in working memory"""
        return list(self.items)
    
    async def focus_attention(self, item_id: str, weight: float):
        """Adjust attention weight for specific item"""
        if item_id in self.attention_weights:
            self.attention_weights[item_id] = weight
            logger.info(f"🎯 Focused attention on: {item_id} (weight: {weight})")

class CulturalMemoryProcessor:
    """Specialized processor for Romanian cultural memories"""
    
    def __init__(self):
        self.cultural_categories = {
            'literature': ['eminescu', 'creanga', 'rebreanu', 'eliade', 'cioran'],
            'history': ['dacia', 'romania', 'vlad', 'mihai_viteazul', 'cuza'],
            'traditions': ['martisor', 'dragobete', 'paparudia', 'colinde'],
            'values': ['ospitalitate', 'dor', 'familie', 'respect', 'traditie']
        }
        self.cultural_keywords = set()
        for category in self.cultural_categories.values():
            self.cultural_keywords.update(category)
        
        logger.info("✅ Cultural Memory Processor initialized")
    
    async def assess_cultural_relevance(self, content: str) -> Tuple[float, Dict[str, float]]:
        """Assess Romanian cultural relevance of content"""
        content_lower = content.lower()
        category_scores = {}
        
        for category, keywords in self.cultural_categories.items():
            matches = sum(1 for keyword in keywords if keyword in content_lower)
            category_scores[category] = min(matches / len(keywords), 1.0)
        
        overall_relevance = sum(category_scores.values()) / len(category_scores)
        
        return overall_relevance, category_scores

class EnhancedMemoryArchitecture:
    """Production-grade memory architecture with comprehensive capabilities"""
    
    def __init__(self, memory_dir: str = "./memory_storage"):
        self.memory_dir = Path(memory_dir)
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize components
        self.vector_store = VectorMemoryStore()
        self.knowledge_graph = KnowledgeGraph()
        self.working_memory = WorkingMemory()
        self.cultural_processor = CulturalMemoryProcessor()
        
        # Memory stores by type
        self.semantic_memory = {}
        self.episodic_memories = []
        self.procedural_memory = {}
        
        # Performance tracking
        self.total_memories = 0
        self.retrieval_count = 0
        self.start_time = time.time()
        
        # Initialize database
        self.db_path = self.memory_dir / "memories.db"
        self._init_database()
        
        logger.info("✅ Enhanced Memory Architecture initialized")
        logger.info(f"📁 Memory storage: {self.memory_dir}")
    
    def _init_database(self):
        """Initialize SQLite database for persistent storage"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS memories (
                    id TEXT PRIMARY KEY,
                    content TEXT NOT NULL,
                    memory_type TEXT NOT NULL,
                    embedding BLOB,
                    timestamp TEXT NOT NULL,
                    importance REAL DEFAULT 0.5,
                    cultural_relevance REAL DEFAULT 0.0,
                    access_count INTEGER DEFAULT 0,
                    last_accessed TEXT,
                    metadata TEXT
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS episodic_memories (
                    id TEXT PRIMARY KEY,
                    event TEXT NOT NULL,
                    context TEXT,
                    timestamp TEXT NOT NULL,
                    participants TEXT,
                    emotions TEXT,
                    cultural_context TEXT,
                    importance REAL DEFAULT 0.5
                )
            ''')
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Database initialized")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise
    
    async def store_memory(self, content: str, memory_type: MemoryType, importance: float = 0.5) -> str:
        """Store memory with comprehensive processing"""
        try:
            # Create memory item
            memory_id = str(uuid.uuid4())
            
            # Assess cultural relevance
            cultural_relevance, cultural_categories = await self.cultural_processor.assess_cultural_relevance(content)
            
            memory_item = MemoryItem(
                id=memory_id,
                content=content,
                memory_type=memory_type.value,
                importance=importance,
                cultural_relevance=cultural_relevance
            )
            
            # Store in vector database
            await self.vector_store.store_memory(memory_item)
            
            # Store in appropriate memory store
            if memory_type == MemoryType.SEMANTIC:
                self.semantic_memory[memory_id] = memory_item
            elif memory_type == MemoryType.CULTURAL:
                self.semantic_memory[memory_id] = memory_item
                # Also add to knowledge graph if highly relevant
                if cultural_relevance > 0.5:
                    await self.knowledge_graph.add_entity(memory_id, {
                        'content': content,
                        'cultural_relevance': cultural_relevance,
                        'categories': cultural_categories
                    })
            
            # Add to working memory if important
            if importance > 0.7:
                await self.working_memory.add_to_working_memory(memory_item, importance)
            
            # Persist to database
            await self._persist_memory(memory_item)
            
            self.total_memories += 1
            logger.info(f"💾 Stored memory: {memory_id} (type: {memory_type.value}, cultural: {cultural_relevance:.2f})")
            
            return memory_id
            
        except Exception as e:
            logger.error(f"❌ Failed to store memory: {e}")
            raise
    
    async def store_episodic_memory(self, event: str, context: Dict[str, Any], emotions: Dict[str, float] = None) -> str:
        """Store episodic memory with contextual information"""
        try:
            memory_id = str(uuid.uuid4())
            
            if emotions is None:
                emotions = {}
            
            # Assess cultural context
            cultural_relevance, cultural_categories = await self.cultural_processor.assess_cultural_relevance(event)
            
            episodic_memory = EpisodicMemory(
                id=memory_id,
                event=event,
                context=context,
                timestamp=datetime.now(),
                participants=context.get('participants', []),
                emotions=emotions,
                cultural_context=cultural_categories,
                importance=context.get('importance', 0.5)
            )
            
            self.episodic_memories.append(episodic_memory)
            
            # Also create a memory item for vector storage
            content = f"Event: {event}. Context: {json.dumps(context)}"
            memory_item = MemoryItem(
                id=memory_id,
                content=content,
                memory_type=MemoryType.EPISODIC.value,
                importance=episodic_memory.importance,
                cultural_relevance=cultural_relevance
            )
            
            await self.vector_store.store_memory(memory_item)
            await self._persist_episodic_memory(episodic_memory)
            
            logger.info(f"📅 Stored episodic memory: {memory_id}")
            return memory_id
            
        except Exception as e:
            logger.error(f"❌ Failed to store episodic memory: {e}")
            raise
    
    async def retrieve_memories(self, query: str, memory_types: List[MemoryType] = None, 
                              cultural_focus: bool = True, top_k: int = 5) -> List[MemoryItem]:
        """Comprehensive memory retrieval"""
        try:
            self.retrieval_count += 1
            
            # Vector-based retrieval
            similar_memories = await self.vector_store.retrieve_similar(query, top_k * 2)
            
            # Filter by memory type if specified
            if memory_types:
                type_names = [mt.value for mt in memory_types]
                similar_memories = [m for m in similar_memories if m.memory_type in type_names]
            
            # Boost cultural memories if cultural focus is enabled
            if cultural_focus:
                for memory in similar_memories:
                    if memory.cultural_relevance > 0.3:
                        memory.importance *= (1 + memory.cultural_relevance)
            
            # Sort by importance and take top-k
            similar_memories.sort(key=lambda m: m.importance, reverse=True)
            results = similar_memories[:top_k]
            
            # Add to working memory
            for memory in results[:3]:  # Add top 3 to working memory
                await self.working_memory.add_to_working_memory(memory, memory.importance)
            
            logger.info(f"🔍 Retrieved {len(results)} memories for query: {query[:50]}...")
            return results
            
        except Exception as e:
            logger.error(f"❌ Failed to retrieve memories: {e}")
            return []
    
    async def get_working_memory_state(self) -> Dict[str, Any]:
        """Get current working memory state"""
        active_items = await self.working_memory.get_active_items()
        
        return {
            'active_memories': [
                {
                    'id': item.id,
                    'content': item.content[:100] + '...' if len(item.content) > 100 else item.content,
                    'importance': item.importance,
                    'cultural_relevance': item.cultural_relevance
                }
                for item in active_items
            ],
            'capacity': self.working_memory.capacity,
            'current_size': len(active_items)
        }
    
    async def get_cultural_insights(self) -> Dict[str, Any]:
        """Get insights about cultural memory content"""
        try:
            cultural_memories = [m for m in self.semantic_memory.values() if m.cultural_relevance > 0.3]
            
            if not cultural_memories:
                return {'total_cultural_memories': 0}
            
            # Analyze cultural categories
            category_counts = defaultdict(int)
            for memory in cultural_memories:
                content_lower = memory.content.lower()
                for category, keywords in self.cultural_processor.cultural_categories.items():
                    if any(keyword in content_lower for keyword in keywords):
                        category_counts[category] += 1
            
            return {
                'total_cultural_memories': len(cultural_memories),
                'category_distribution': dict(category_counts),
                'average_cultural_relevance': sum(m.cultural_relevance for m in cultural_memories) / len(cultural_memories),
                'high_relevance_count': len([m for m in cultural_memories if m.cultural_relevance > 0.7])
            }
            
        except Exception as e:
            logger.error(f"❌ Failed to get cultural insights: {e}")
            return {'error': str(e)}
    
    async def consolidate_memories(self, similarity_threshold: float = 0.9):
        """Consolidate similar memories to reduce redundancy"""
        try:
            consolidated_count = 0
            
            # Get all memory embeddings
            if len(self.vector_store.embeddings) < 2:
                return consolidated_count
            
            embeddings = np.array(self.vector_store.embeddings)
            
            # Calculate similarity matrix
            similarity_matrix = np.dot(embeddings, embeddings.T) / (
                np.linalg.norm(embeddings, axis=1)[:, np.newaxis] * 
                np.linalg.norm(embeddings, axis=1)[np.newaxis, :]
            )
            
            # Find highly similar pairs
            similar_pairs = []
            for i in range(len(embeddings)):
                for j in range(i + 1, len(embeddings)):
                    if similarity_matrix[i][j] > similarity_threshold:
                        similar_pairs.append((i, j, similarity_matrix[i][j]))
            
            # Consolidate similar memories
            for i, j, similarity in similar_pairs:
                memory1 = self.vector_store.items[i]
                memory2 = self.vector_store.items[j]
                
                # Merge memories (keep the more important one, update content)
                if memory1.importance >= memory2.importance:
                    primary, secondary = memory1, memory2
                else:
                    primary, secondary = memory2, memory1
                
                # Update primary memory
                primary.content = f"{primary.content}\n\nRelated: {secondary.content}"
                primary.importance = max(primary.importance, secondary.importance)
                primary.cultural_relevance = max(primary.cultural_relevance, secondary.cultural_relevance)
                
                consolidated_count += 1
            
            logger.info(f"🔄 Consolidated {consolidated_count} similar memories")
            return consolidated_count
            
        except Exception as e:
            logger.error(f"❌ Memory consolidation failed: {e}")
            return 0
    
    async def _persist_memory(self, memory_item: MemoryItem):
        """Persist memory to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO memories 
                (id, content, memory_type, embedding, timestamp, importance, cultural_relevance, 
                 access_count, last_accessed, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                memory_item.id,
                memory_item.content,
                memory_item.memory_type,
                pickle.dumps(memory_item.embedding) if memory_item.embedding is not None else None,
                memory_item.timestamp.isoformat(),
                memory_item.importance,
                memory_item.cultural_relevance,
                memory_item.access_count,
                memory_item.last_accessed.isoformat(),
                json.dumps({'related_items': memory_item.related_items})
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to persist memory: {e}")
    
    async def _persist_episodic_memory(self, episodic_memory: EpisodicMemory):
        """Persist episodic memory to database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO episodic_memories 
                (id, event, context, timestamp, participants, emotions, cultural_context, importance)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                episodic_memory.id,
                episodic_memory.event,
                json.dumps(episodic_memory.context),
                episodic_memory.timestamp.isoformat(),
                json.dumps(episodic_memory.participants),
                json.dumps(episodic_memory.emotions),
                json.dumps(episodic_memory.cultural_context),
                episodic_memory.importance
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to persist episodic memory: {e}")
    
    async def get_performance_metrics(self) -> Dict[str, Any]:
        """Get memory system performance metrics"""
        uptime = time.time() - self.start_time
        
        return {
            'total_memories': self.total_memories,
            'semantic_memories': len(self.semantic_memory),
            'episodic_memories': len(self.episodic_memories),
            'vector_store_size': len(self.vector_store.embeddings),
            'knowledge_graph_nodes': self.knowledge_graph.graph.number_of_nodes(),
            'knowledge_graph_edges': self.knowledge_graph.graph.number_of_edges(),
            'working_memory_size': len(self.working_memory.items),
            'retrieval_count': self.retrieval_count,
            'uptime_seconds': uptime,
            'retrieval_rate': self.retrieval_count / max(uptime, 1) * 60  # per minute
        }

# Demonstration and testing
async def demonstrate_enhanced_memory():
    """Demonstrate enhanced memory architecture capabilities"""
    logger.info("🧠 Demonstrating Enhanced Memory Architecture")
    logger.info("=" * 60)
    
    memory_system = EnhancedMemoryArchitecture()
    
    # Store various types of memories
    test_memories = [
        ("Mihai Eminescu was Romania's national poet, known for his profound romantic poetry.", MemoryType.CULTURAL, 0.9),
        ("The concept of 'dor' represents a uniquely Romanian emotional state of longing.", MemoryType.CULTURAL, 0.8),
        ("Machine learning algorithms require large datasets for training.", MemoryType.SEMANTIC, 0.6),
        ("Neural networks use backpropagation for learning.", MemoryType.SEMANTIC, 0.7),
        ("Romanian folk traditions include the celebration of Mărțișor on March 1st.", MemoryType.CULTURAL, 0.85)
    ]
    
    logger.info("📝 Storing test memories...")
    stored_ids = []
    for content, mem_type, importance in test_memories:
        memory_id = await memory_system.store_memory(content, mem_type, importance)
        stored_ids.append(memory_id)
    
    # Store episodic memory
    logger.info("📅 Storing episodic memory...")
    episodic_id = await memory_system.store_episodic_memory(
        "Attended a Romanian cultural festival with traditional music and dancing",
        {
            'location': 'Bucharest',
            'participants': ['local artists', 'cultural enthusiasts'],
            'importance': 0.8
        },
        {'joy': 0.9, 'nostalgia': 0.7}
    )
    
    # Test retrieval
    logger.info("🔍 Testing memory retrieval...")
    results = await memory_system.retrieve_memories("Romanian poetry and literature", cultural_focus=True)
    
    logger.info(f"Retrieved {len(results)} memories:")
    for memory in results:
        logger.info(f"  - {memory.content[:80]}... (relevance: {memory.cultural_relevance:.2f})")
    
    # Get working memory state
    working_state = await memory_system.get_working_memory_state()
    logger.info(f"🧠 Working memory: {working_state['current_size']}/{working_state['capacity']} items")
    
    # Cultural insights
    cultural_insights = await memory_system.get_cultural_insights()
    logger.info(f"🇷🇴 Cultural insights: {cultural_insights}")
    
    # Performance metrics
    metrics = await memory_system.get_performance_metrics()
    logger.info(f"📊 Performance metrics: {metrics}")
    
    # Test memory consolidation
    logger.info("🔄 Testing memory consolidation...")
    consolidated = await memory_system.consolidate_memories()
    logger.info(f"Consolidated {consolidated} similar memories")
    
    logger.info("✅ Enhanced Memory Architecture demonstration completed!")
    return memory_system

if __name__ == "__main__":
    asyncio.run(demonstrate_enhanced_memory())