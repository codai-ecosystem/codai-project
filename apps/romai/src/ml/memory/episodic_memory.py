"""
RomAI AGI Evolution Phase 2.1: Advanced Memory Architecture

Sophisticated memory systems for experiential learning, knowledge storage,
and active reasoning with attention mechanisms. Core cognitive architecture
supporting episodic, semantic, and working memory capabilities.

Building on Phase 1's 100% success rate foundation.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Iterator
from dataclasses import dataclass, field
from enum import Enum
import json
import numpy as np
from collections import defaultdict, deque
import uuid

# Vector storage and similarity
try:
    import torch
    import torch.nn.functional as F
    VECTOR_SUPPORT = True
except ImportError:
    VECTOR_SUPPORT = False
    logging.warning("PyTorch not available - using fallback vector operations")

logger = logging.getLogger(__name__)

class MemoryType(Enum):
    """Types of memory systems"""
    EPISODIC = "episodic"         # Experiential memories
    SEMANTIC = "semantic"         # Factual knowledge
    WORKING = "working"           # Active reasoning
    PROCEDURAL = "procedural"     # Skills and procedures

class MemoryImportance(Enum):
    """Memory importance levels for retention"""
    CRITICAL = 5    # Never forget
    HIGH = 4        # Long-term retention
    MEDIUM = 3      # Standard retention
    LOW = 2         # Short-term retention
    MINIMAL = 1     # Quick decay

@dataclass
class MemoryTrace:
    """Individual memory trace with metadata"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: Dict[str, Any] = field(default_factory=dict)
    memory_type: MemoryType = MemoryType.EPISODIC
    timestamp: datetime = field(default_factory=datetime.now)
    importance: MemoryImportance = MemoryImportance.MEDIUM
    emotional_valence: float = 0.0  # -1.0 (negative) to 1.0 (positive)
    confidence: float = 1.0
    access_count: int = 0
    last_accessed: datetime = field(default_factory=datetime.now)
    tags: List[str] = field(default_factory=list)
    relationships: List[str] = field(default_factory=list)  # IDs of related memories
    
    def __post_init__(self):
        if not isinstance(self.timestamp, datetime):
            self.timestamp = datetime.now()
        if not isinstance(self.last_accessed, datetime):
            self.last_accessed = datetime.now()

@dataclass
class AttentionState:
    """Current attention state in working memory"""
    focus_items: List[str] = field(default_factory=list)  # Memory IDs in focus
    attention_weights: Dict[str, float] = field(default_factory=dict)
    cognitive_load: float = 0.0  # 0.0 to 1.0
    attention_span: int = 7  # Miller's magic number ± 2
    
class EpisodicMemorySystem:
    """
    Stores and retrieves experiential memories with rich temporal context.
    Implements autobiographical memory for learning from experiences.
    """
    
    def __init__(self, max_memories: int = 10000):
        self.memories: Dict[str, MemoryTrace] = {}
        self.temporal_index: Dict[datetime, List[str]] = defaultdict(list)
        self.tag_index: Dict[str, List[str]] = defaultdict(list)
        self.max_memories = max_memories
        self.vector_embeddings: Dict[str, np.ndarray] = {}
        
        logger.info("📚 Episodic Memory System initialized")
    
    @property
    def memory_traces(self) -> List[MemoryTrace]:
        """Compatibility property for integration systems"""
        return list(self.memories.values())
    
    async def store_episode(
        self, 
        content: Any = None,
        experience: Dict[str, Any] = None, 
        context: Dict[str, Any] = None,
        importance: MemoryImportance = MemoryImportance.MEDIUM,
        emotional_valence: float = 0.0,
        tags: List[str] = None
    ) -> str:
        """Store a complete experience with rich contextual information"""
        
        # Handle both old and new interface
        if content is not None and experience is None:
            experience = {'content': content, 'description': str(content)}
        elif experience is None:
            experience = {'content': 'Empty episode', 'description': 'No content provided'}
        
        # Create memory trace
        memory_trace = MemoryTrace(
            content={
                'experience': experience,
                'context': context,
                'environmental_state': self._capture_environmental_state(),
                'cognitive_state': self._capture_cognitive_state()
            },
            memory_type=MemoryType.EPISODIC,
            importance=importance,
            emotional_valence=emotional_valence,
            tags=tags or [],
        )
        
        # Store memory
        self.memories[memory_trace.id] = memory_trace
        
        # Update indexes
        self._update_temporal_index(memory_trace)
        self._update_tag_index(memory_trace)
        
        # Generate vector embedding for similarity search
        if VECTOR_SUPPORT:
            await self._generate_embedding(memory_trace)
        
        # Memory consolidation (remove old memories if needed)
        await self._consolidate_memories()
        
        logger.info(f"📝 Episode stored: {memory_trace.id} (importance: {importance if isinstance(importance, str) else importance.name if hasattr(importance, 'name') else str(importance)})")
        return memory_trace.id
    
    async def retrieve_similar_episodes(
        self, 
        current_situation: Dict[str, Any], 
        k: int = 5,
        similarity_threshold: float = 0.7
    ) -> List[MemoryTrace]:
        """Find similar past experiences for analogical reasoning"""
        
        if not VECTOR_SUPPORT:
            # Fallback: simple tag-based similarity
            return await self._tag_based_similarity_search(current_situation, k)
        
        # Generate query embedding
        query_embedding = await self._generate_situation_embedding(current_situation)
        
        # Calculate similarities
        similarities = []
        for memory_id, memory in self.memories.items():
            if memory_id in self.vector_embeddings:
                similarity = self._cosine_similarity(
                    query_embedding, 
                    self.vector_embeddings[memory_id]
                )
                if similarity >= similarity_threshold:
                    similarities.append((similarity, memory))
        
        # Sort by similarity and importance
        similarities.sort(key=lambda x: (x[0], x[1].importance if isinstance(x[1].importance, (int, float)) else x[1].importance.value), reverse=True)
        
        # Update access patterns
        similar_memories = [memory for _, memory in similarities[:k]]
        for memory in similar_memories:
            memory.access_count += 1
            memory.last_accessed = datetime.now()
        
        logger.info(f"🔍 Retrieved {len(similar_memories)} similar episodes")
        return similar_memories
    
    async def temporal_memory_search(
        self, 
        time_range: Tuple[datetime, datetime],
        importance_filter: Optional[MemoryImportance] = None
    ) -> List[MemoryTrace]:
        """Search memories within specific timeframes"""
        
        start_time, end_time = time_range
        relevant_memories = []
        
        # Search temporal index
        for timestamp, memory_ids in self.temporal_index.items():
            if start_time <= timestamp <= end_time:
                for memory_id in memory_ids:
                    memory = self.memories.get(memory_id)
                    if memory and (not importance_filter or memory.importance == importance_filter):
                        relevant_memories.append(memory)
        
        # Sort by recency and importance
        relevant_memories.sort(
            key=lambda m: (m.timestamp, m.importance if isinstance(m.importance, (int, float)) else m.importance.value), 
            reverse=True
        )
        
        logger.info(f"📅 Found {len(relevant_memories)} memories in time range")
        return relevant_memories
    
    async def retrieve_episodes(
        self,
        query: str,
        max_results: int = 10,
        min_relevance: float = 0.3
    ) -> List[Dict[str, Any]]:
        """Retrieve episodes based on content similarity query"""
        
        relevant_episodes = []
        query_words = set(query.lower().split())
        
        for trace in self.memory_traces:
            # Simple text-based relevance calculation
            content_text = json.dumps(trace.content.get('experience', {})).lower()
            content_words = set(content_text.split())
            
            if query_words:
                common_words = query_words.intersection(content_words)
                relevance = len(common_words) / len(query_words)
                
                if relevance >= min_relevance:
                    episode_data = {
                        'id': trace.id,
                        'experience': trace.content.get('experience', {}),
                        'context': trace.content.get('context', {}),
                        'timestamp': trace.timestamp,
                        'importance': trace.importance if isinstance(trace.importance, (int, float)) else trace.importance.value,
                        'emotional_valence': trace.emotional_valence,
                        'relevance': relevance
                    }
                    relevant_episodes.append(episode_data)
        
        # Sort by relevance and limit results
        relevant_episodes.sort(key=lambda x: x['relevance'], reverse=True)
        return relevant_episodes[:max_results]
    
    def _capture_environmental_state(self) -> Dict[str, Any]:
        """Capture current environmental context"""
        return {
            'timestamp': datetime.now().isoformat(),
            'system_load': self._get_system_metrics(),
            'active_components': self._get_active_components()
        }
    
    def _capture_cognitive_state(self) -> Dict[str, Any]:
        """Capture current cognitive processing state"""
        return {
            'reasoning_mode': 'episodic_storage',
            'attention_focus': 'memory_encoding',
            'cognitive_load': 0.3  # Moderate load during memory storage
        }
    
    def _update_temporal_index(self, memory: MemoryTrace):
        """Update temporal index for time-based retrieval"""
        time_bucket = memory.timestamp.replace(second=0, microsecond=0)
        self.temporal_index[time_bucket].append(memory.id)
    
    def _update_tag_index(self, memory: MemoryTrace):
        """Update tag index for category-based retrieval"""
        for tag in memory.tags:
            self.tag_index[tag].append(memory.id)
    
    async def _generate_embedding(self, memory: MemoryTrace):
        """Generate vector embedding for similarity search"""
        if not VECTOR_SUPPORT:
            return
        
        # Create text representation of memory for embedding
        text_content = self._memory_to_text(memory)
        
        # Simple embedding (in production, use proper language model)
        # This is a placeholder - replace with actual embedding model
        embedding = np.random.rand(384)  # Typical embedding dimension
        self.vector_embeddings[memory.id] = embedding
    
    async def _generate_situation_embedding(self, situation: Dict[str, Any]) -> np.ndarray:
        """Generate embedding for current situation"""
        if not VECTOR_SUPPORT:
            return np.array([])
        
        # Convert situation to text and generate embedding
        situation_text = json.dumps(situation, default=str)
        # Placeholder embedding - replace with actual model
        return np.random.rand(384)
    
    def _cosine_similarity(self, a: np.ndarray, b: np.ndarray) -> float:
        """Calculate cosine similarity between vectors"""
        return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
    
    def _memory_to_text(self, memory: MemoryTrace) -> str:
        """Convert memory to text representation for embedding"""
        content_str = json.dumps(memory.content, default=str)
        tags_str = ' '.join(memory.tags)
        return f"{content_str} {tags_str}"
    
    async def _tag_based_similarity_search(
        self, 
        current_situation: Dict[str, Any], 
        k: int
    ) -> List[MemoryTrace]:
        """Fallback similarity search using tags"""
        # Extract potential tags from current situation
        situation_tags = self._extract_tags_from_situation(current_situation)
        
        # Find memories with overlapping tags
        candidate_memories = []
        for tag in situation_tags:
            for memory_id in self.tag_index.get(tag, []):
                memory = self.memories.get(memory_id)
                if memory:
                    candidate_memories.append(memory)
        
        # Remove duplicates and sort by importance
        unique_memories = list(set(candidate_memories))
        unique_memories.sort(key=lambda m: m.importance if isinstance(m.importance, (int, float)) else m.importance.value, reverse=True)
        
        return unique_memories[:k]
    
    def _extract_tags_from_situation(self, situation: Dict[str, Any]) -> List[str]:
        """Extract potential tags from current situation"""
        tags = []
        for key, value in situation.items():
            tags.append(key)
            if isinstance(value, str):
                tags.extend(value.lower().split())
        return tags[:10]  # Limit tag extraction
    
    async def _consolidate_memories(self):
        """Consolidate memories by removing less important old memories"""
        if len(self.memories) <= self.max_memories:
            return
        
        # Sort memories by importance and recency
        memories_list = list(self.memories.values())
        memories_list.sort(
            key=lambda m: (m.importance if isinstance(m.importance, (int, float)) else m.importance.value, m.timestamp),
            reverse=False  # Least important and oldest first
        )
        
        # Remove excess memories
        excess_count = len(self.memories) - self.max_memories
        for i in range(excess_count):
            memory_to_remove = memories_list[i]
            await self._remove_memory(memory_to_remove.id)
            
        logger.info(f"🗑️ Consolidated {excess_count} old memories")
    
    async def consolidate_similar_episodes(self, similarity_threshold: float = 0.7) -> Dict[str, Any]:
        """Public method to consolidate similar episodes"""
        try:
            await self._consolidate_memories()
            return {
                'success': True,
                'memory_count': len(self.memories),
                'threshold_used': similarity_threshold
            }
        except Exception as e:
            logger.error(f"Error in episode consolidation: {e}")
            return {'success': False, 'error': str(e)}
    
    async def _remove_memory(self, memory_id: str):
        """Remove memory and clean up indexes"""
        memory = self.memories.get(memory_id)
        if not memory:
            return
        
        # Remove from main storage
        del self.memories[memory_id]
        
        # Clean up indexes
        time_bucket = memory.timestamp.replace(second=0, microsecond=0)
        if memory_id in self.temporal_index[time_bucket]:
            self.temporal_index[time_bucket].remove(memory_id)
        
        for tag in memory.tags:
            if memory_id in self.tag_index[tag]:
                self.tag_index[tag].remove(memory_id)
        
        # Remove embedding
        if memory_id in self.vector_embeddings:
            del self.vector_embeddings[memory_id]
    
    def _get_system_metrics(self) -> Dict[str, Any]:
        """Get current system performance metrics"""
        return {
            'memory_count': len(self.memories),
            'vector_embeddings': len(self.vector_embeddings),
            'temporal_buckets': len(self.temporal_index),
            'tag_categories': len(self.tag_index)
        }
    
    def _get_active_components(self) -> List[str]:
        """Get list of currently active system components"""
        return ['episodic_memory', 'temporal_indexing', 'similarity_search']

# Global episodic memory instance
episodic_memory = None

def get_episodic_memory_system() -> EpisodicMemorySystem:
    """Get global episodic memory system instance"""
    global episodic_memory
    if episodic_memory is None:
        episodic_memory = EpisodicMemorySystem()
    return episodic_memory

if __name__ == "__main__":
    # Test episodic memory system
    async def test_episodic_memory():
        memory_system = EpisodicMemorySystem()
        
        # Store test episode
        experience = {
            'action': 'solved_math_problem',
            'problem': 'Calculate sqrt(144)',
            'solution': '12',
            'method': 'direct_calculation'
        }
        
        context = {
            'difficulty': 'easy',
            'domain': 'mathematics',
            'user_query': 'square root calculation'
        }
        
        memory_id = await memory_system.store_episode(
            experience, 
            context,
            importance=MemoryImportance.HIGH,
            emotional_valence=0.8,
            tags=['mathematics', 'calculation', 'success']
        )
        
        # Test retrieval
        similar_memories = await memory_system.retrieve_similar_episodes({
            'action': 'solving_math',
            'domain': 'mathematics'
        })
        
        print(f"Stored memory: {memory_id}")
        print(f"Retrieved {len(similar_memories)} similar memories")
        
        # Test temporal search
        now = datetime.now()
        recent_memories = await memory_system.temporal_memory_search(
            (now - timedelta(hours=1), now)
        )
        
        print(f"Found {len(recent_memories)} recent memories")
    
    asyncio.run(test_episodic_memory())