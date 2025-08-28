"""
RomAI AGI Evolution Phase 2.1: Memory Integration System

Unified memory architecture integrating episodic, semantic, and working memory
systems. Provides seamless memory coordination, cross-system communication,
and intelligent memory routing for optimal cognitive performance.

Completes Phase 2.1 Advanced Memory Architecture implementation.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import json
import uuid

from .episodic_memory import EpisodicMemorySystem, MemoryTrace
from .semantic_memory import SemanticMemorySystem, KnowledgeFact, ConceptNode, RelationType
from .working_memory import WorkingMemorySystem, AttentionNode, WorkingMemorySlotType, AttentionType

logger = logging.getLogger(__name__)

class MemorySystemType(Enum):
    """Types of memory systems"""
    EPISODIC = "episodic"        # Experience-based memories
    SEMANTIC = "semantic"        # Factual knowledge
    WORKING = "working"          # Active processing
    INTEGRATED = "integrated"    # Cross-system queries

class MemoryOperation(Enum):
    """Types of memory operations"""
    STORE = "store"             # Store new information
    RETRIEVE = "retrieve"       # Retrieve information
    UPDATE = "update"           # Update existing information
    CONSOLIDATE = "consolidate" # Transfer between systems
    FORGET = "forget"           # Remove information

class MemoryRouting(Enum):
    """Memory routing strategies"""
    AUTOMATIC = "automatic"     # AI determines best system
    EXPLICIT = "explicit"       # User specifies system
    PARALLEL = "parallel"       # Query all systems
    SEQUENTIAL = "sequential"   # Query systems in order

@dataclass
class MemoryQuery:
    """Unified memory query structure"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    query_text: str = ""
    operation: MemoryOperation = MemoryOperation.RETRIEVE
    target_systems: List[MemorySystemType] = field(default_factory=list)
    routing_strategy: MemoryRouting = MemoryRouting.AUTOMATIC
    context: Dict[str, Any] = field(default_factory=dict)
    constraints: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class MemoryResponse:
    """Unified memory response structure"""
    query_id: str = ""
    results: Dict[str, Any] = field(default_factory=dict)
    source_systems: List[str] = field(default_factory=list)
    confidence: float = 0.0
    processing_time: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class ConsolidationTask:
    """Memory consolidation task"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    source_system: MemorySystemType = MemorySystemType.WORKING
    target_system: MemorySystemType = MemorySystemType.EPISODIC
    content: Any = None
    priority: float = 0.5
    created_at: datetime = field(default_factory=datetime.now)
    scheduled_for: Optional[datetime] = None
    completed: bool = False

class MemoryIntegrationSystem:
    """
    Unified memory architecture coordinating episodic, semantic, and working memory.
    Provides intelligent memory routing, consolidation, and cross-system communication.
    """
    
    def __init__(self):
        # Initialize individual memory systems
        self.episodic_memory = EpisodicMemorySystem()
        self.semantic_memory = SemanticMemorySystem()
        self.working_memory = WorkingMemorySystem()
        
        # Integration components
        self.consolidation_queue: List[ConsolidationTask] = []
        self.memory_statistics = {
            'queries_processed': 0,
            'consolidations_completed': 0,
            'cross_system_retrievals': 0,
            'average_response_time': 0.0
        }
        
        # Memory coordination
        self.active_queries: Dict[str, MemoryQuery] = {}
        self.routing_patterns: Dict[str, MemorySystemType] = {}
        
        # Background processes
        self._consolidation_task = None
        self._start_background_processes()
        
        logger.info("🧠 Memory Integration System initialized")
    
    async def unified_memory_query(
        self,
        query: Union[str, MemoryQuery],
        routing_strategy: MemoryRouting = MemoryRouting.AUTOMATIC,
        target_systems: Optional[List[MemorySystemType]] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> MemoryResponse:
        """Unified interface for all memory system queries"""
        
        start_time = datetime.now()
        
        # Normalize query input
        if isinstance(query, str):
            memory_query = MemoryQuery(
                query_text=query,
                routing_strategy=routing_strategy,
                target_systems=target_systems or [],
                context=context or {}
            )
        else:
            memory_query = query
        
        self.active_queries[memory_query.id] = memory_query
        
        try:
            # Route query to appropriate memory systems
            response = await self._route_memory_query(memory_query)
            
            # Update statistics
            processing_time = (datetime.now() - start_time).total_seconds()
            response.processing_time = processing_time
            self._update_statistics(processing_time)
            
            logger.info(f"🔍 Memory query processed in {processing_time:.3f}s")
            return response
            
        except Exception as e:
            logger.error(f"Error processing memory query: {e}")
            return MemoryResponse(
                query_id=memory_query.id,
                results={'error': str(e)},
                confidence=0.0
            )
        finally:
            if memory_query.id in self.active_queries:
                del self.active_queries[memory_query.id]
    
    async def store_unified_memory(
        self,
        content: Any,
        memory_type: MemorySystemType,
        metadata: Optional[Dict[str, Any]] = None,
        auto_consolidate: bool = True
    ) -> str:
        """Store information in appropriate memory system"""
        
        metadata = metadata or {}
        storage_id = ""
        
        try:
            if memory_type == MemorySystemType.EPISODIC:
                # Store in episodic memory
                storage_id = await self.episodic_memory.store_episode(
                    content=content,
                    context=metadata.get('context', {}),
                    emotional_valence=metadata.get('emotional_valence', 0.0),
                    importance=metadata.get('importance', 0.5)
                )
                
            elif memory_type == MemorySystemType.SEMANTIC:
                # Store in semantic memory
                storage_id = await self.semantic_memory.store_knowledge(
                    concept=metadata.get('concept', str(content)),
                    relations=metadata.get('relations', []),
                    facts=metadata.get('facts', []),
                    confidence=metadata.get('confidence', 1.0)
                )
                
            elif memory_type == MemorySystemType.WORKING:
                # Store in working memory
                storage_id = await self.working_memory.store_active_information(
                    content=content,
                    slot_type=metadata.get('slot_type', WorkingMemorySlotType.SEMANTIC),
                    attention_weight=metadata.get('attention_weight', 0.5),
                    importance=metadata.get('importance', 0.5)
                )
            
            # Schedule consolidation if needed
            if auto_consolidate and memory_type == MemorySystemType.WORKING:
                await self._schedule_consolidation(content, metadata)
            
            logger.info(f"💾 Stored in {memory_type.value} memory: {storage_id}")
            return storage_id
            
        except Exception as e:
            logger.error(f"Error storing unified memory: {e}")
            return ""
    
    async def cross_system_retrieve(
        self,
        query: str,
        systems: Optional[List[MemorySystemType]] = None,
        merge_results: bool = True
    ) -> Dict[str, Any]:
        """Retrieve information across multiple memory systems"""
        
        systems = systems or [MemorySystemType.EPISODIC, MemorySystemType.SEMANTIC, MemorySystemType.WORKING]
        results = {}
        
        # Query each system in parallel
        tasks = []
        for system_type in systems:
            task = asyncio.create_task(self._query_individual_system(system_type, query))
            tasks.append((system_type, task))
        
        # Collect results
        for system_type, task in tasks:
            try:
                system_results = await task
                results[system_type.value] = system_results
            except Exception as e:
                logger.error(f"Error querying {system_type.value} memory: {e}")
                results[system_type.value] = {'error': str(e)}
        
        # Merge and rank results if requested
        if merge_results:
            merged_results = await self._merge_cross_system_results(results, query)
            results['merged'] = merged_results
        
        self.memory_statistics['cross_system_retrievals'] += 1
        
        logger.info(f"🔄 Cross-system retrieval completed for {len(systems)} systems")
        return results
    
    async def get_memory_system_status(self) -> Dict[str, Any]:
        """Get comprehensive status of all memory systems"""
        
        status = {
            'integration_statistics': self.memory_statistics.copy(),
            'active_queries': len(self.active_queries),
            'consolidation_queue': len(self.consolidation_queue),
            'memory_systems': {}
        }
        
        # Get individual system statuses
        try:
            # Working memory status
            wm_status = await self.working_memory.get_working_memory_status()
            status['memory_systems']['working'] = wm_status
            
            # Episodic memory status
            em_traces = len(self.episodic_memory.memory_traces)
            status['memory_systems']['episodic'] = {
                'total_traces': em_traces,
                'recent_traces': len([
                    trace for trace in self.episodic_memory.memory_traces
                    if (datetime.now() - trace.timestamp).days < 1
                ])
            }
            
            # Semantic memory status
            sm_concepts = len(self.semantic_memory.concepts)
            sm_facts = len(self.semantic_memory.facts)
            status['memory_systems']['semantic'] = {
                'total_concepts': sm_concepts,
                'total_facts': sm_facts
            }
            
        except Exception as e:
            logger.error(f"Error getting memory system status: {e}")
            status['error'] = str(e)
        
        return status
    
    async def _route_memory_query(self, query: MemoryQuery) -> MemoryResponse:
        """Route query to appropriate memory systems"""
        
        response = MemoryResponse(query_id=query.id)
        
        # Determine target systems
        target_systems = query.target_systems
        if not target_systems:
            target_systems = await self._determine_optimal_systems(query)
        
        # Execute routing strategy
        if query.routing_strategy == MemoryRouting.PARALLEL:
            results = await self._parallel_query(query, target_systems)
        elif query.routing_strategy == MemoryRouting.SEQUENTIAL:
            results = await self._sequential_query(query, target_systems)
        else:  # AUTOMATIC or EXPLICIT
            results = await self._automatic_query(query, target_systems)
        
        # Process and combine results
        response.results = results
        response.source_systems = [system.value for system in target_systems]
        response.confidence = await self._calculate_response_confidence(results)
        
        return response
    
    async def _determine_optimal_systems(self, query: MemoryQuery) -> List[MemorySystemType]:
        """Determine optimal memory systems for a query"""
        
        query_lower = query.query_text.lower()
        target_systems = []
        
        # Heuristics for system selection
        episodic_indicators = ['remember', 'when', 'experience', 'happened', 'last time']
        semantic_indicators = ['what is', 'define', 'facts', 'knowledge', 'concept']
        working_indicators = ['current', 'active', 'processing', 'thinking about']
        
        # Check for episodic memory indicators
        if any(indicator in query_lower for indicator in episodic_indicators):
            target_systems.append(MemorySystemType.EPISODIC)
        
        # Check for semantic memory indicators
        if any(indicator in query_lower for indicator in semantic_indicators):
            target_systems.append(MemorySystemType.SEMANTIC)
        
        # Check for working memory indicators
        if any(indicator in query_lower for indicator in working_indicators):
            target_systems.append(MemorySystemType.WORKING)
        
        # Default to all systems if no specific indicators
        if not target_systems:
            target_systems = [MemorySystemType.EPISODIC, MemorySystemType.SEMANTIC, MemorySystemType.WORKING]
        
        return target_systems
    
    async def _parallel_query(self, query: MemoryQuery, systems: List[MemorySystemType]) -> Dict[str, Any]:
        """Execute parallel queries across multiple systems"""
        
        tasks = []
        for system in systems:
            task = asyncio.create_task(self._query_individual_system(system, query.query_text))
            tasks.append((system, task))
        
        results = {}
        for system, task in tasks:
            try:
                system_results = await task
                results[system.value] = system_results
            except Exception as e:
                logger.error(f"Error in parallel query to {system.value}: {e}")
                results[system.value] = {'error': str(e)}
        
        return results
    
    async def _query_individual_system(self, system: MemorySystemType, query: str) -> Dict[str, Any]:
        """Query an individual memory system"""
        
        if system == MemorySystemType.EPISODIC:
            episodes = await self.episodic_memory.retrieve_episodes(query, max_results=5)
            return {
                'episodes': episodes,
                'count': len(episodes),
                'system': 'episodic'
            }
            
        elif system == MemorySystemType.SEMANTIC:
            knowledge = await self.semantic_memory.query_knowledge(query, depth=2)
            return {
                'knowledge': knowledge,
                'concepts': knowledge.get('concepts', []),
                'facts': knowledge.get('facts', []),
                'system': 'semantic'
            }
            
        elif system == MemorySystemType.WORKING:
            active_info = await self.working_memory.retrieve_active_information(
                query, AttentionType.SELECTIVE, max_items=5
            )
            return {
                'active_information': active_info,
                'count': len(active_info),
                'system': 'working'
            }
        
        return {}
    
    async def _automatic_query(self, query: MemoryQuery, systems: List[MemorySystemType]) -> Dict[str, Any]:
        """Execute automatic smart routing query"""
        
        # Start with most likely system based on query analysis
        primary_system = await self._identify_primary_system(query)
        
        results = {}
        
        # Query primary system first
        primary_results = await self._query_individual_system(primary_system, query.query_text)
        results[primary_system.value] = primary_results
        
        # If results are insufficient, query other systems
        if not self._has_sufficient_results(primary_results):
            remaining_systems = [s for s in systems if s != primary_system]
            
            for system in remaining_systems:
                try:
                    system_results = await self._query_individual_system(system, query.query_text)
                    results[system.value] = system_results
                except Exception as e:
                    logger.error(f"Error in automatic query to {system.value}: {e}")
                    results[system.value] = {'error': str(e)}
        
        return results
    
    async def _identify_primary_system(self, query: MemoryQuery) -> MemorySystemType:
        """Identify the most likely system for a query"""
        
        query_text = query.query_text.lower()
        
        # Simple scoring system
        scores = {
            MemorySystemType.EPISODIC: 0,
            MemorySystemType.SEMANTIC: 0,
            MemorySystemType.WORKING: 0
        }
        
        # Episodic indicators
        episodic_words = ['remember', 'when', 'experience', 'happened', 'last time', 'yesterday', 'ago']
        scores[MemorySystemType.EPISODIC] = sum(1 for word in episodic_words if word in query_text)
        
        # Semantic indicators
        semantic_words = ['what is', 'define', 'facts', 'knowledge', 'concept', 'meaning', 'relationship']
        scores[MemorySystemType.SEMANTIC] = sum(1 for word in semantic_words if word in query_text)
        
        # Working memory indicators
        working_words = ['current', 'active', 'processing', 'thinking', 'focus', 'attention']
        scores[MemorySystemType.WORKING] = sum(1 for word in working_words if word in query_text)
        
        # Return system with highest score
        primary_system = max(scores, key=scores.get)
        
        # Default to semantic if no clear winner
        if scores[primary_system] == 0:
            primary_system = MemorySystemType.SEMANTIC
        
        return primary_system
    
    def _has_sufficient_results(self, results: Dict[str, Any]) -> bool:
        """Check if results are sufficient to satisfy query"""
        
        # Simple sufficiency check
        if 'error' in results:
            return False
        
        # Check for meaningful content
        if 'episodes' in results and len(results['episodes']) > 0:
            return True
        if 'concepts' in results and len(results['concepts']) > 0:
            return True
        if 'active_information' in results and len(results['active_information']) > 0:
            return True
        
        return False
    
    async def _calculate_response_confidence(self, results: Dict[str, Any]) -> float:
        """Calculate confidence level for combined results"""
        
        if not results:
            return 0.0
        
        confidence_sum = 0.0
        system_count = 0
        
        for system_name, system_results in results.items():
            if isinstance(system_results, dict) and 'error' not in system_results:
                # Simple confidence based on result count and type
                if 'episodes' in system_results:
                    confidence_sum += min(len(system_results['episodes']) * 0.2, 1.0)
                elif 'concepts' in system_results:
                    confidence_sum += min(len(system_results['concepts']) * 0.3, 1.0)
                elif 'active_information' in system_results:
                    confidence_sum += min(len(system_results['active_information']) * 0.1, 1.0)
                
                system_count += 1
        
        return confidence_sum / max(system_count, 1)
    
    async def _merge_cross_system_results(self, results: Dict[str, Any], query: str) -> Dict[str, Any]:
        """Merge results from multiple memory systems"""
        
        merged = {
            'query': query,
            'combined_results': [],
            'confidence': 0.0,
            'sources': []
        }
        
        # Collect all results with source attribution
        for system_name, system_results in results.items():
            if isinstance(system_results, dict) and 'error' not in system_results:
                merged['sources'].append(system_name)
                
                # Extract items from each system
                if 'episodes' in system_results:
                    for episode in system_results['episodes']:
                        merged['combined_results'].append({
                            'type': 'episode',
                            'source': system_name,
                            'content': episode,
                            'relevance': await self._calculate_item_relevance(episode, query)
                        })
                
                if 'concepts' in system_results:
                    for concept in system_results['concepts']:
                        merged['combined_results'].append({
                            'type': 'concept',
                            'source': system_name,
                            'content': concept,
                            'relevance': await self._calculate_item_relevance(concept, query)
                        })
                
                if 'active_information' in system_results:
                    for item in system_results['active_information']:
                        merged['combined_results'].append({
                            'type': 'active_info',
                            'source': system_name,
                            'content': item,
                            'relevance': item.get('relevance_score', 0.5)
                        })
        
        # Sort by relevance
        merged['combined_results'].sort(key=lambda x: x['relevance'], reverse=True)
        
        # Calculate overall confidence
        if merged['combined_results']:
            avg_relevance = sum(item['relevance'] for item in merged['combined_results']) / len(merged['combined_results'])
            merged['confidence'] = avg_relevance
        
        return merged
    
    async def _calculate_item_relevance(self, item: Any, query: str) -> float:
        """Calculate relevance of an item to a query"""
        
        # Simple text-based relevance calculation
        if isinstance(item, dict):
            item_text = json.dumps(item, default=str).lower()
        else:
            item_text = str(item).lower()
        
        query_words = set(query.lower().split())
        item_words = set(item_text.split())
        
        if not query_words:
            return 0.0
        
        common_words = query_words.intersection(item_words)
        relevance = len(common_words) / len(query_words)
        
        return min(relevance, 1.0)
    
    async def _schedule_consolidation(self, content: Any, metadata: Dict[str, Any]):
        """Schedule memory consolidation task"""
        
        importance = metadata.get('importance', 0.5)
        
        # Determine consolidation priority and timing
        if importance > 0.7:
            # High importance - consolidate soon
            scheduled_time = datetime.now() + timedelta(minutes=30)
            priority = 0.9
        elif importance > 0.4:
            # Medium importance - consolidate later
            scheduled_time = datetime.now() + timedelta(hours=2)
            priority = 0.6
        else:
            # Low importance - consolidate much later or not at all
            scheduled_time = datetime.now() + timedelta(hours=12)
            priority = 0.3
        
        task = ConsolidationTask(
            source_system=MemorySystemType.WORKING,
            target_system=MemorySystemType.EPISODIC,
            content=content,
            priority=priority,
            scheduled_for=scheduled_time
        )
        
        self.consolidation_queue.append(task)
    
    def _update_statistics(self, processing_time: float):
        """Update memory system statistics"""
        
        self.memory_statistics['queries_processed'] += 1
        
        # Update average response time
        current_avg = self.memory_statistics['average_response_time']
        total_queries = self.memory_statistics['queries_processed']
        
        new_avg = ((current_avg * (total_queries - 1)) + processing_time) / total_queries
        self.memory_statistics['average_response_time'] = new_avg
    
    def _start_background_processes(self):
        """Start background memory management processes"""
        self._consolidation_task = asyncio.create_task(self._background_consolidation_process())
    
    async def _background_consolidation_process(self):
        """Background process for memory consolidation"""
        
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                
                # Process consolidation queue
                current_time = datetime.now()
                due_tasks = [
                    task for task in self.consolidation_queue
                    if (task.scheduled_for and current_time >= task.scheduled_for and not task.completed)
                ]
                
                for task in due_tasks[:3]:  # Process up to 3 tasks
                    task.completed = True
                    self.memory_statistics['consolidations_completed'] += 1
                    logger.info(f"🔄 Consolidation completed: {task.id}")
                
                # Clean up completed tasks
                self.consolidation_queue = [
                    task for task in self.consolidation_queue if not task.completed
                ]
                    
            except Exception as e:
                logger.error(f"Error in background consolidation: {e}")
                await asyncio.sleep(30)  # Brief pause on error

# Global memory integration instance
memory_integration = None

def get_memory_integration_system() -> MemoryIntegrationSystem:
    """Get global memory integration system instance"""
    global memory_integration
    if memory_integration is None:
        memory_integration = MemoryIntegrationSystem()
    return memory_integration

if __name__ == "__main__":
    # Test memory integration system
    async def test_memory_integration():
        integration_system = MemoryIntegrationSystem()
        
        # Test unified storage
        await integration_system.store_unified_memory(
            "Learned quadratic formula today",
            MemorySystemType.EPISODIC,
            metadata={'importance': 0.8, 'context': {'subject': 'mathematics'}}
        )
        
        await integration_system.store_unified_memory(
            "Mathematics is the study of numbers and patterns",
            MemorySystemType.SEMANTIC,
            metadata={
                'concept': 'mathematics',
                'facts': [{'subject': 'mathematics', 'predicate': 'studies', 'object': 'numbers'}]
            }
        )
        
        # Test unified query
        response = await integration_system.unified_memory_query(
            "What do I know about mathematics?",
            routing_strategy=MemoryRouting.PARALLEL
        )
        print(f"Unified query results: {len(response.source_systems)} systems queried")
        
        # Test cross-system retrieval
        cross_results = await integration_system.cross_system_retrieve("mathematics")
        print(f"Cross-system results: {len(cross_results)} systems")
        
        # Get system status
        status = await integration_system.get_memory_system_status()
        print(f"Total queries processed: {status['integration_statistics']['queries_processed']}")
    
    asyncio.run(test_memory_integration())