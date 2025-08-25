"""
Working Memory Processor - Phase 5 Component
Specialized system for managing active, temporary memory processing
"""

import asyncio
import time
import json
import uuid
from typing import Dict, List, Optional, Any, Union, Tuple, Set
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
from enum import Enum
import logging
import heapq
from collections import deque

# Import our existing components
from romai_api_client import RomAIAPIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WorkingMemoryPriority(Enum):
    CRITICAL = "critical"       # 1 - Immediate processing required
    HIGH = "high"              # 2 - Important for current task
    MEDIUM = "medium"          # 3 - Supporting information
    LOW = "low"                # 4 - Background context
    ARCHIVAL = "archival"      # 5 - Ready for long-term storage

class ProcessingState(Enum):
    ACTIVE = "active"              # Currently being processed
    STANDBY = "standby"           # Ready for processing
    COOLING = "cooling"           # Recently processed, cooling down
    CONSOLIDATING = "consolidating"  # Being prepared for long-term storage
    EXPIRED = "expired"           # Exceeded time limit, ready for cleanup

class MemoryChunkType(Enum):
    INSTRUCTION = "instruction"    # Task instructions
    DATA = "data"                 # Raw data for processing
    INTERMEDIATE = "intermediate"  # Intermediate processing results
    CONTEXT = "context"           # Contextual information
    GOAL = "goal"                 # Goal states and objectives
    FEEDBACK = "feedback"         # Feedback and corrections
    ASSOCIATION = "association"    # Associative links to long-term memory

@dataclass
class WorkingMemoryChunk:
    chunk_id: str
    content: Any
    chunk_type: MemoryChunkType
    priority: WorkingMemoryPriority
    processing_state: ProcessingState
    activation_level: float        # 0.0 to 1.0
    created_timestamp: datetime
    last_accessed: datetime
    last_updated: datetime
    access_count: int
    processing_duration: float     # Seconds spent processing
    decay_rate: float             # Rate at which activation decays
    associations: List[str]       # Links to other chunks
    parent_task_id: Optional[str] # Task that created this chunk
    metadata: Dict[str, Any]
    expiration_time: Optional[datetime]  # When chunk should expire

@dataclass
class WorkingMemorySlot:
    slot_id: str
    chunk: Optional[WorkingMemoryChunk]
    capacity: float               # Maximum activation this slot can handle
    current_load: float          # Current activation load
    slot_type: str               # Type of slot (general, specialized)
    last_cleanup: datetime
    utilization_history: List[float]  # Historical utilization levels

@dataclass
class ProcessingTask:
    task_id: str
    description: str
    priority: WorkingMemoryPriority
    required_chunks: List[str]    # Chunk IDs needed for this task
    processing_function: Optional[callable]
    created_time: datetime
    deadline: Optional[datetime]
    progress: float               # 0.0 to 1.0
    intermediate_results: List[Any]
    status: str

@dataclass
class WorkingMemoryMetrics:
    total_slots: int
    occupied_slots: int
    utilization_percentage: float
    average_activation: float
    chunks_processed: int
    chunks_expired: int
    consolidations_performed: int
    processing_efficiency: float
    memory_pressure: float       # How full the system is
    throughput_rate: float       # Chunks processed per second

class WorkingMemoryProcessor:
    """Advanced working memory system for active, temporary processing"""
    
    def __init__(self, capacity: int = 7, specialized_slots: int = 2):
        self.romai_client = RomAIAPIClient()
        
        # Core working memory configuration
        self.total_capacity = capacity  # Miller's magic number
        self.specialized_slots = specialized_slots  # For high-priority items
        self.general_slots = capacity - specialized_slots
        
        # Memory storage
        self.memory_slots: Dict[str, WorkingMemorySlot] = {}
        self.chunk_registry: Dict[str, WorkingMemoryChunk] = {}
        self.processing_queue: List[ProcessingTask] = []  # Priority queue
        self.consolidation_buffer: deque = deque(maxlen=20)  # Buffer for consolidation
        
        # Processing settings
        self.default_decay_rate = 0.95  # Activation decay per minute
        self.activation_threshold = 0.1  # Below this, chunk is inactive
        self.consolidation_threshold = 0.6  # Above this, consider for consolidation
        self.max_processing_time = 300.0  # 5 minutes max per chunk
        self.cooling_period = 60.0  # Seconds to cool after processing
        
        # Performance tracking
        self.metrics = WorkingMemoryMetrics(
            total_slots=capacity,
            occupied_slots=0,
            utilization_percentage=0.0,
            average_activation=0.0,
            chunks_processed=0,
            chunks_expired=0,
            consolidations_performed=0,
            processing_efficiency=0.0,
            memory_pressure=0.0,
            throughput_rate=0.0
        )
        
        self.performance_history = deque(maxlen=1000)  # Track performance over time
        
        # Initialize memory slots
        self._initialize_memory_slots()
        
        logger.info(f"Working Memory Processor initialized with {capacity} slots")
    
    def _initialize_memory_slots(self) -> None:
        """Initialize memory slots with different capacities and types"""
        try:
            current_time = datetime.now()
            
            # Create specialized high-priority slots
            for i in range(self.specialized_slots):
                slot_id = f"SPEC_{i:02d}"
                slot = WorkingMemorySlot(
                    slot_id=slot_id,
                    chunk=None,
                    capacity=1.5,  # Higher capacity for important items
                    current_load=0.0,
                    slot_type="specialized",
                    last_cleanup=current_time,
                    utilization_history=[]
                )
                self.memory_slots[slot_id] = slot
            
            # Create general-purpose slots
            for i in range(self.general_slots):
                slot_id = f"GEN_{i:02d}"
                slot = WorkingMemorySlot(
                    slot_id=slot_id,
                    chunk=None,
                    capacity=1.0,
                    current_load=0.0,
                    slot_type="general",
                    last_cleanup=current_time,
                    utilization_history=[]
                )
                self.memory_slots[slot_id] = slot
                
        except Exception as e:
            logger.error(f"Error initializing memory slots: {str(e)}")
            raise
    
    def generate_chunk_id(self, chunk_type: MemoryChunkType) -> str:
        """Generate unique chunk ID"""
        prefix = f"WM_{chunk_type.value[:3].upper()}"
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        return f"{prefix}_{timestamp}_{unique_id}"
    
    async def load_chunk(self, content: Any, chunk_type: MemoryChunkType,
                        priority: WorkingMemoryPriority = WorkingMemoryPriority.MEDIUM,
                        parent_task_id: Optional[str] = None,
                        expiration_minutes: Optional[int] = None,
                        metadata: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Load content into working memory"""
        try:
            # Check if we have available slots
            available_slot = await self._find_available_slot(priority)
            
            if not available_slot:
                # Try to make space by consolidating or expiring chunks
                made_space = await self._make_space(priority)
                if not made_space:
                    logger.warning("No working memory slots available and couldn't make space")
                    return None
                available_slot = await self._find_available_slot(priority)
            
            if not available_slot:
                return None
            
            # Create memory chunk
            chunk_id = self.generate_chunk_id(chunk_type)
            current_time = datetime.now()
            
            # Calculate initial activation based on priority and content
            initial_activation = self._calculate_initial_activation(priority, content, chunk_type)
            
            # Set expiration time if specified
            expiration_time = None
            if expiration_minutes:
                expiration_time = current_time + timedelta(minutes=expiration_minutes)
            
            chunk = WorkingMemoryChunk(
                chunk_id=chunk_id,
                content=content,
                chunk_type=chunk_type,
                priority=priority,
                processing_state=ProcessingState.STANDBY,
                activation_level=initial_activation,
                created_timestamp=current_time,
                last_accessed=current_time,
                last_updated=current_time,
                access_count=0,
                processing_duration=0.0,
                decay_rate=self._calculate_decay_rate(priority, chunk_type),
                associations=[],
                parent_task_id=parent_task_id,
                metadata=metadata or {},
                expiration_time=expiration_time
            )
            
            # Store chunk in registry and slot
            self.chunk_registry[chunk_id] = chunk
            available_slot.chunk = chunk
            available_slot.current_load = initial_activation
            
            # Update metrics
            self.metrics.occupied_slots += 1
            self._update_utilization_metrics()
            
            logger.info(f"Loaded chunk {chunk_id} into slot {available_slot.slot_id}")
            
            return chunk_id
            
        except Exception as e:
            logger.error(f"Error loading chunk into working memory: {str(e)}")
            return None
    
    async def _find_available_slot(self, priority: WorkingMemoryPriority) -> Optional[WorkingMemorySlot]:
        """Find an available slot for the given priority"""
        try:
            # For critical and high priority, try specialized slots first
            if priority in [WorkingMemoryPriority.CRITICAL, WorkingMemoryPriority.HIGH]:
                for slot in self.memory_slots.values():
                    if slot.slot_type == "specialized" and slot.chunk is None:
                        return slot
            
            # Try general slots
            for slot in self.memory_slots.values():
                if slot.chunk is None:
                    return slot
            
            return None
            
        except Exception as e:
            logger.error(f"Error finding available slot: {str(e)}")
            return None
    
    async def _make_space(self, new_priority: WorkingMemoryPriority) -> bool:
        """Try to make space by evicting lower priority chunks"""
        try:
            # Find chunks that can be evicted
            eviction_candidates = []
            
            for slot in self.memory_slots.values():
                if slot.chunk is not None:
                    chunk = slot.chunk
                    
                    # Calculate eviction score (lower is better for eviction)
                    eviction_score = self._calculate_eviction_score(chunk, new_priority)
                    eviction_candidates.append((eviction_score, chunk, slot))
            
            if not eviction_candidates:
                return False
            
            # Sort by eviction score (lowest first)
            eviction_candidates.sort(key=lambda x: x[0])
            
            # Try to evict the best candidate
            eviction_score, chunk_to_evict, slot_to_free = eviction_candidates[0]
            
            # Only evict if the new priority is higher or chunk is ready for consolidation
            if eviction_score < 0 or chunk_to_evict.activation_level > self.consolidation_threshold:
                # Attempt consolidation instead of just evicting
                success = await self._consolidate_chunk(chunk_to_evict)
                
                if success:
                    # Remove from slot and registry
                    slot_to_free.chunk = None
                    slot_to_free.current_load = 0.0
                    del self.chunk_registry[chunk_to_evict.chunk_id]
                    
                    self.metrics.occupied_slots -= 1
                    self.metrics.consolidations_performed += 1
                    
                    logger.info(f"Made space by consolidating chunk {chunk_to_evict.chunk_id}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error making space: {str(e)}")
            return False
    
    def _calculate_initial_activation(self, priority: WorkingMemoryPriority, 
                                    content: Any, chunk_type: MemoryChunkType) -> float:
        """Calculate initial activation level for new chunk"""
        try:
            # Base activation by priority
            priority_activation = {
                WorkingMemoryPriority.CRITICAL: 0.95,
                WorkingMemoryPriority.HIGH: 0.8,
                WorkingMemoryPriority.MEDIUM: 0.6,
                WorkingMemoryPriority.LOW: 0.4,
                WorkingMemoryPriority.ARCHIVAL: 0.2
            }.get(priority, 0.5)
            
            # Type-based adjustment
            type_multiplier = {
                MemoryChunkType.INSTRUCTION: 1.2,
                MemoryChunkType.GOAL: 1.1,
                MemoryChunkType.DATA: 1.0,
                MemoryChunkType.CONTEXT: 0.9,
                MemoryChunkType.INTERMEDIATE: 0.8,
                MemoryChunkType.FEEDBACK: 0.7,
                MemoryChunkType.ASSOCIATION: 0.6
            }.get(chunk_type, 1.0)
            
            # Content-based adjustment (simple heuristic)
            content_boost = 0.0
            if isinstance(content, str):
                content_length = len(content)
                if content_length > 500:
                    content_boost = 0.1
                elif content_length > 100:
                    content_boost = 0.05
            
            final_activation = min(priority_activation * type_multiplier + content_boost, 1.0)
            
            return final_activation
            
        except Exception:
            return 0.5  # Default moderate activation
    
    def _calculate_decay_rate(self, priority: WorkingMemoryPriority, 
                            chunk_type: MemoryChunkType) -> float:
        """Calculate decay rate based on priority and type"""
        try:
            # Base decay rate by priority
            base_decay = {
                WorkingMemoryPriority.CRITICAL: 0.99,  # Decays very slowly
                WorkingMemoryPriority.HIGH: 0.97,
                WorkingMemoryPriority.MEDIUM: 0.95,
                WorkingMemoryPriority.LOW: 0.92,
                WorkingMemoryPriority.ARCHIVAL: 0.85
            }.get(priority, 0.95)
            
            # Type-based adjustment
            type_adjustment = {
                MemoryChunkType.INSTRUCTION: 0.02,    # Instructions decay slower
                MemoryChunkType.GOAL: 0.02,
                MemoryChunkType.DATA: 0.0,
                MemoryChunkType.CONTEXT: -0.01,      # Context decays faster
                MemoryChunkType.INTERMEDIATE: -0.02,
                MemoryChunkType.FEEDBACK: -0.01,
                MemoryChunkType.ASSOCIATION: -0.02
            }.get(chunk_type, 0.0)
            
            return max(base_decay + type_adjustment, 0.8)  # Minimum decay rate
            
        except Exception:
            return 0.95  # Default decay rate
    
    def _calculate_eviction_score(self, chunk: WorkingMemoryChunk, 
                                new_priority: WorkingMemoryPriority) -> float:
        """Calculate eviction score (lower means better candidate for eviction)"""
        try:
            score = 0.0
            
            # Priority comparison
            priority_values = {
                WorkingMemoryPriority.CRITICAL: 5,
                WorkingMemoryPriority.HIGH: 4,
                WorkingMemoryPriority.MEDIUM: 3,
                WorkingMemoryPriority.LOW: 2,
                WorkingMemoryPriority.ARCHIVAL: 1
            }
            
            chunk_priority_value = priority_values.get(chunk.priority, 3)
            new_priority_value = priority_values.get(new_priority, 3)
            
            # If new item has higher priority, existing chunk is more evictable
            score -= (new_priority_value - chunk_priority_value) * 2.0
            
            # Activation level (lower activation = more evictable)
            score += chunk.activation_level * 3.0
            
            # Processing state consideration
            state_penalties = {
                ProcessingState.ACTIVE: 10.0,      # Never evict active chunks
                ProcessingState.STANDBY: 0.0,
                ProcessingState.COOLING: -1.0,     # Cooling chunks are good candidates
                ProcessingState.CONSOLIDATING: -2.0,  # Even better candidates
                ProcessingState.EXPIRED: -5.0      # Best candidates
            }
            score += state_penalties.get(chunk.processing_state, 0.0)
            
            # Age factor (older chunks in working memory are more evictable)
            age_minutes = (datetime.now() - chunk.created_timestamp).total_seconds() / 60
            score -= min(age_minutes / 60, 2.0)  # Up to -2 points for age
            
            # Access frequency (less accessed = more evictable)
            score += min(chunk.access_count * 0.5, 3.0)
            
            return score
            
        except Exception:
            return 0.0  # Neutral eviction score
    
    async def _consolidate_chunk(self, chunk: WorkingMemoryChunk) -> bool:
        """Attempt to consolidate chunk to long-term memory"""
        try:
            # Add to consolidation buffer
            consolidation_data = {
                "chunk_id": chunk.chunk_id,
                "content": chunk.content,
                "chunk_type": chunk.chunk_type.value,
                "priority": chunk.priority.value,
                "final_activation": chunk.activation_level,
                "processing_duration": chunk.processing_duration,
                "access_count": chunk.access_count,
                "created_timestamp": chunk.created_timestamp.isoformat(),
                "consolidation_timestamp": datetime.now().isoformat(),
                "metadata": chunk.metadata
            }
            
            self.consolidation_buffer.append(consolidation_data)
            
            logger.debug(f"Consolidated chunk {chunk.chunk_id} to buffer")
            
            # In a full implementation, this would integrate with the long-term memory system
            # For now, we consider consolidation successful if we can buffer it
            return True
            
        except Exception as e:
            logger.error(f"Error consolidating chunk {chunk.chunk_id}: {str(e)}")
            return False
    
    async def access_chunk(self, chunk_id: str) -> Optional[Any]:
        """Access a chunk and update its activation"""
        try:
            if chunk_id not in self.chunk_registry:
                logger.warning(f"Chunk {chunk_id} not found in working memory")
                return None
            
            chunk = self.chunk_registry[chunk_id]
            current_time = datetime.now()
            
            # Update access statistics
            chunk.access_count += 1
            chunk.last_accessed = current_time
            
            # Boost activation due to access
            activation_boost = 0.1 * (1.0 - chunk.activation_level)  # Diminishing returns
            chunk.activation_level = min(chunk.activation_level + activation_boost, 1.0)
            
            # Update processing state if appropriate
            if chunk.processing_state == ProcessingState.STANDBY:
                chunk.processing_state = ProcessingState.ACTIVE
            
            logger.debug(f"Accessed chunk {chunk_id}, new activation: {chunk.activation_level:.3f}")
            
            return chunk.content
            
        except Exception as e:
            logger.error(f"Error accessing chunk {chunk_id}: {str(e)}")
            return None
    
    async def update_chunk(self, chunk_id: str, new_content: Any, 
                          processing_note: Optional[str] = None) -> bool:
        """Update chunk content and metadata"""
        try:
            if chunk_id not in self.chunk_registry:
                return False
            
            chunk = self.chunk_registry[chunk_id]
            current_time = datetime.now()
            
            # Update content and timestamp
            chunk.content = new_content
            chunk.last_updated = current_time
            
            # Add processing note to metadata
            if processing_note:
                if "processing_notes" not in chunk.metadata:
                    chunk.metadata["processing_notes"] = []
                chunk.metadata["processing_notes"].append({
                    "timestamp": current_time.isoformat(),
                    "note": processing_note
                })
            
            # Boost activation for updated content
            chunk.activation_level = min(chunk.activation_level + 0.15, 1.0)
            
            logger.debug(f"Updated chunk {chunk_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error updating chunk {chunk_id}: {str(e)}")
            return False
    
    async def create_association(self, chunk_id_1: str, chunk_id_2: str, 
                               association_strength: float = 0.5) -> bool:
        """Create association between two chunks in working memory"""
        try:
            chunk1 = self.chunk_registry.get(chunk_id_1)
            chunk2 = self.chunk_registry.get(chunk_id_2)
            
            if not chunk1 or not chunk2:
                return False
            
            # Add bidirectional associations
            if chunk_id_2 not in chunk1.associations:
                chunk1.associations.append(chunk_id_2)
            
            if chunk_id_1 not in chunk2.associations:
                chunk2.associations.append(chunk_id_1)
            
            # Boost activation for associated chunks
            activation_boost = association_strength * 0.05
            chunk1.activation_level = min(chunk1.activation_level + activation_boost, 1.0)
            chunk2.activation_level = min(chunk2.activation_level + activation_boost, 1.0)
            
            logger.debug(f"Created association between {chunk_id_1} and {chunk_id_2}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error creating association: {str(e)}")
            return False
    
    async def process_decay(self) -> Dict[str, Any]:
        """Process activation decay for all chunks"""
        decay_start = time.time()
        
        try:
            chunks_decayed = 0
            chunks_expired = 0
            chunks_state_changed = 0
            current_time = datetime.now()
            
            expired_chunks = []
            
            for chunk in list(self.chunk_registry.values()):
                # Calculate time since last access
                time_since_access = (current_time - chunk.last_accessed).total_seconds() / 60  # minutes
                
                # Apply decay
                decay_factor = chunk.decay_rate ** time_since_access
                old_activation = chunk.activation_level
                chunk.activation_level *= decay_factor
                
                chunks_decayed += 1
                
                # Check for expiration
                expired = False
                
                # Time-based expiration
                if chunk.expiration_time and current_time > chunk.expiration_time:
                    expired = True
                
                # Activation-based expiration
                if chunk.activation_level < self.activation_threshold:
                    expired = True
                
                if expired:
                    expired_chunks.append(chunk.chunk_id)
                    chunks_expired += 1
                    continue
                
                # Update processing state based on activation and time
                old_state = chunk.processing_state
                
                if chunk.processing_state == ProcessingState.ACTIVE:
                    # Check if chunk should cool down
                    time_since_update = (current_time - chunk.last_updated).total_seconds()
                    if time_since_update > self.cooling_period:
                        chunk.processing_state = ProcessingState.COOLING
                        chunks_state_changed += 1
                
                elif chunk.processing_state == ProcessingState.COOLING:
                    # Move to standby or consolidating
                    if chunk.activation_level > self.consolidation_threshold:
                        chunk.processing_state = ProcessingState.CONSOLIDATING
                        chunks_state_changed += 1
                    elif chunk.activation_level > self.activation_threshold * 2:
                        chunk.processing_state = ProcessingState.STANDBY
                        chunks_state_changed += 1
            
            # Clean up expired chunks
            for chunk_id in expired_chunks:
                await self._expire_chunk(chunk_id)
            
            # Update metrics
            self.metrics.chunks_expired += chunks_expired
            self._update_utilization_metrics()
            
            processing_time = time.time() - decay_start
            
            decay_result = {
                "chunks_processed": chunks_decayed,
                "chunks_expired": chunks_expired,
                "state_changes": chunks_state_changed,
                "processing_time": processing_time,
                "remaining_active_chunks": len(self.chunk_registry)
            }
            
            logger.debug(f"Decay processing: {chunks_decayed} chunks, {chunks_expired} expired")
            
            return decay_result
            
        except Exception as e:
            logger.error(f"Error processing decay: {str(e)}")
            return {"error": str(e)}
    
    async def _expire_chunk(self, chunk_id: str) -> bool:
        """Expire a chunk and clean up its resources"""
        try:
            if chunk_id not in self.chunk_registry:
                return False
            
            chunk = self.chunk_registry[chunk_id]
            
            # Find and clear the slot
            for slot in self.memory_slots.values():
                if slot.chunk and slot.chunk.chunk_id == chunk_id:
                    slot.chunk = None
                    slot.current_load = 0.0
                    break
            
            # Attempt consolidation for valuable chunks before expiry
            if chunk.activation_level > 0.3 or chunk.access_count > 3:
                await self._consolidate_chunk(chunk)
            
            # Remove from registry
            del self.chunk_registry[chunk_id]
            
            # Update metrics
            self.metrics.occupied_slots -= 1
            
            logger.debug(f"Expired chunk {chunk_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Error expiring chunk {chunk_id}: {str(e)}")
            return False
    
    def _update_utilization_metrics(self) -> None:
        """Update system utilization metrics"""
        try:
            # Calculate basic utilization
            self.metrics.occupied_slots = len(self.chunk_registry)
            self.metrics.utilization_percentage = (self.metrics.occupied_slots / self.metrics.total_slots) * 100
            
            # Calculate average activation
            if self.chunk_registry:
                total_activation = sum(chunk.activation_level for chunk in self.chunk_registry.values())
                self.metrics.average_activation = total_activation / len(self.chunk_registry)
            else:
                self.metrics.average_activation = 0.0
            
            # Calculate memory pressure (how constrained we are)
            active_chunks = sum(1 for chunk in self.chunk_registry.values() 
                              if chunk.processing_state == ProcessingState.ACTIVE)
            self.metrics.memory_pressure = min(active_chunks / max(self.specialized_slots, 1), 1.0)
            
            # Update slot utilization history
            current_time = datetime.now()
            for slot in self.memory_slots.values():
                utilization = slot.current_load / slot.capacity if slot.capacity > 0 else 0.0
                slot.utilization_history.append(utilization)
                
                # Keep only recent history
                if len(slot.utilization_history) > 100:
                    slot.utilization_history.pop(0)
            
        except Exception as e:
            logger.error(f"Error updating utilization metrics: {str(e)}")
    
    def get_memory_state(self) -> Dict[str, Any]:
        """Get current state of working memory system"""
        try:
            current_time = datetime.now()
            
            # Chunk distribution by state
            state_distribution = {}
            type_distribution = {}
            priority_distribution = {}
            
            for chunk in self.chunk_registry.values():
                # State distribution
                state = chunk.processing_state.value
                state_distribution[state] = state_distribution.get(state, 0) + 1
                
                # Type distribution
                chunk_type = chunk.chunk_type.value
                type_distribution[chunk_type] = type_distribution.get(chunk_type, 0) + 1
                
                # Priority distribution
                priority = chunk.priority.value
                priority_distribution[priority] = priority_distribution.get(priority, 0) + 1
            
            # Slot efficiency
            slot_efficiency = {}
            for slot_id, slot in self.memory_slots.items():
                if slot.utilization_history:
                    avg_utilization = sum(slot.utilization_history) / len(slot.utilization_history)
                    slot_efficiency[slot_id] = {
                        "type": slot.slot_type,
                        "current_load": slot.current_load,
                        "capacity": slot.capacity,
                        "average_utilization": round(avg_utilization, 3),
                        "occupied": slot.chunk is not None
                    }
            
            # System health indicators
            health_indicators = {
                "memory_pressure": self.metrics.memory_pressure,
                "utilization_healthy": self.metrics.utilization_percentage < 85,
                "activation_healthy": self.metrics.average_activation > 0.3,
                "no_overload": all(slot.current_load <= slot.capacity for slot in self.memory_slots.values())
            }
            
            return {
                "timestamp": current_time.isoformat(),
                "metrics": asdict(self.metrics),
                "distributions": {
                    "processing_states": state_distribution,
                    "chunk_types": type_distribution,
                    "priorities": priority_distribution
                },
                "slot_efficiency": slot_efficiency,
                "consolidation_buffer_size": len(self.consolidation_buffer),
                "health_indicators": health_indicators,
                "active_chunks": [
                    {
                        "chunk_id": chunk.chunk_id[:16] + "...",
                        "type": chunk.chunk_type.value,
                        "priority": chunk.priority.value,
                        "activation": round(chunk.activation_level, 3),
                        "state": chunk.processing_state.value,
                        "age_minutes": round((current_time - chunk.created_timestamp).total_seconds() / 60, 1)
                    }
                    for chunk in sorted(self.chunk_registry.values(), 
                                      key=lambda x: x.activation_level, reverse=True)[:10]
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting memory state: {str(e)}")
            return {"error": str(e)}

# Test function
async def test_working_memory_processor():
    """Test the working memory processor"""
    print("⚡ Testing Working Memory Processor")
    print("=" * 50)
    
    processor = WorkingMemoryProcessor(capacity=5, specialized_slots=2)
    
    # Test 1: Load various types of chunks
    print("\n💾 Test 1: Loading Memory Chunks")
    
    chunk_data = [
        {
            "content": "Complete Phase 5 advanced memory system implementation with comprehensive testing",
            "type": MemoryChunkType.INSTRUCTION,
            "priority": WorkingMemoryPriority.CRITICAL,
            "metadata": {"phase": 5, "task": "implementation"}
        },
        {
            "content": "Multi-modal intelligence achieved 92% performance in Phase 4 with Grade A+ results",
            "type": MemoryChunkType.DATA,
            "priority": WorkingMemoryPriority.HIGH,
            "metadata": {"phase": 4, "performance": 0.92}
        },
        {
            "content": "Current system needs episodic memory, working memory, and long-term storage integration",
            "type": MemoryChunkType.CONTEXT,
            "priority": WorkingMemoryPriority.MEDIUM,
            "metadata": {"system_requirement": True}
        },
        {
            "content": "Working memory capacity: 7±2 chunks (Miller's Law)",
            "type": MemoryChunkType.DATA,
            "priority": WorkingMemoryPriority.LOW,
            "metadata": {"reference": "Miller 1956"}
        },
        {
            "content": "Intermediate processing result: activation levels calculated",
            "type": MemoryChunkType.INTERMEDIATE,
            "priority": WorkingMemoryPriority.MEDIUM,
            "metadata": {"processing_stage": "activation_calculation"}
        },
        {
            "content": "User feedback: Excellent progress on memory system development",
            "type": MemoryChunkType.FEEDBACK,
            "priority": WorkingMemoryPriority.HIGH,
            "metadata": {"sentiment": "positive"}
        }
    ]
    
    loaded_chunks = []
    for i, data in enumerate(chunk_data):
        chunk_id = await processor.load_chunk(
            content=data["content"],
            chunk_type=data["type"],
            priority=data["priority"],
            parent_task_id=f"TASK_{i:02d}",
            expiration_minutes=30 if data["priority"] == WorkingMemoryPriority.LOW else None,
            metadata=data["metadata"]
        )
        
        if chunk_id:
            loaded_chunks.append(chunk_id)
            print(f"   ✅ Loaded {data['type'].value} chunk: {chunk_id[:16]}...")
        else:
            print(f"   ❌ Failed to load {data['type'].value} chunk")
    
    print(f"   📊 Successfully loaded: {len(loaded_chunks)}/{len(chunk_data)} chunks")
    
    # Test 2: Access and update chunks
    print("\n🔍 Test 2: Chunk Access and Updates")
    
    if loaded_chunks:
        # Access first chunk
        first_chunk_content = await processor.access_chunk(loaded_chunks[0])
        print(f"   ✅ Accessed chunk: {first_chunk_content[:50]}...")
        
        # Update chunk with processing result
        updated = await processor.update_chunk(
            loaded_chunks[0],
            first_chunk_content + " [PROCESSED]",
            "Added processing marker"
        )
        print(f"   ✅ Updated chunk: {updated}")
        
        # Create association between chunks
        if len(loaded_chunks) >= 2:
            association_created = await processor.create_association(
                loaded_chunks[0], loaded_chunks[1], 0.8
            )
            print(f"   ✅ Created association: {association_created}")
    
    # Test 3: Memory state analysis
    print("\n📊 Test 3: Memory State Analysis")
    
    memory_state = processor.get_memory_state()
    
    print(f"   📈 System Overview:")
    print(f"      Utilization: {memory_state['metrics']['utilization_percentage']:.1f}%")
    print(f"      Occupied slots: {memory_state['metrics']['occupied_slots']}/{memory_state['metrics']['total_slots']}")
    print(f"      Average activation: {memory_state['metrics']['average_activation']:.3f}")
    print(f"      Memory pressure: {memory_state['metrics']['memory_pressure']:.3f}")
    
    print(f"   📂 Chunk Distribution:")
    for state, count in memory_state['distributions']['processing_states'].items():
        print(f"      - {state}: {count}")
    
    print(f"   🏆 Top Active Chunks:")
    for chunk in memory_state['active_chunks'][:3]:
        print(f"      - {chunk['type']} (activation: {chunk['activation']})")
    
    # Test 4: Memory decay simulation
    print("\n🔄 Test 4: Memory Decay Simulation")
    
    # Simulate time passage and decay
    decay_result = await processor.process_decay()
    
    print(f"   ✅ Decay processing completed:")
    print(f"      Chunks processed: {decay_result['chunks_processed']}")
    print(f"      Chunks expired: {decay_result['chunks_expired']}")
    print(f"      State changes: {decay_result['state_changes']}")
    print(f"      Processing time: {decay_result['processing_time']:.3f}s")
    print(f"      Remaining chunks: {decay_result['remaining_active_chunks']}")
    
    # Test 5: Capacity stress test
    print("\n💪 Test 5: Capacity Stress Test")
    
    # Try to load more chunks than capacity
    stress_chunks = []
    for i in range(10):  # More than our capacity of 5
        chunk_id = await processor.load_chunk(
            content=f"Stress test chunk {i + 1}",
            chunk_type=MemoryChunkType.DATA,
            priority=WorkingMemoryPriority.LOW,
            metadata={"stress_test": True, "index": i}
        )
        if chunk_id:
            stress_chunks.append(chunk_id)
    
    print(f"   📊 Stress test results:")
    print(f"      Attempted to load: 10 chunks")
    print(f"      Successfully loaded: {len(stress_chunks)} chunks")
    print(f"      System handled overload: {'✅' if len(stress_chunks) <= 5 else '❌'}")
    
    # Final metrics
    final_state = processor.get_memory_state()
    
    print(f"\n🎯 Final Performance Summary:")
    success_rate = len(loaded_chunks) / len(chunk_data) if chunk_data else 0
    print(f"   Success Rate: {success_rate:.1%}")
    print(f"   System Efficiency: {final_state['metrics']['utilization_percentage']:.1f}%")
    print(f"   Health Status: {'✅ Healthy' if all(final_state['health_indicators'].values()) else '⚠️ Needs attention'}")
    print(f"   Consolidations: {final_state['metrics']['consolidations_performed']}")
    
    return {
        "success_rate": success_rate,
        "utilization": final_state['metrics']['utilization_percentage'],
        "chunks_loaded": len(loaded_chunks),
        "consolidations": final_state['metrics']['consolidations_performed'],
        "system_healthy": all(final_state['health_indicators'].values())
    }

if __name__ == "__main__":
    asyncio.run(test_working_memory_processor())