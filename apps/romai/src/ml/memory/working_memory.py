"""
RomAI AGI Evolution Phase 2.1: Working Memory System

Short-term working memory with attention mechanisms for active information
processing. Manages cognitive load, attention allocation, and temporary
storage of processing-relevant information.

Part of Advanced Memory Architecture with Phase 1 integration.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
import json
import uuid
from collections import deque, defaultdict
import heapq

logger = logging.getLogger(__name__)

class AttentionType(Enum):
    """Types of attention mechanisms"""
    FOCUSED = "focused"          # Single-target focus
    DIVIDED = "divided"          # Multi-target attention  
    SELECTIVE = "selective"      # Filter-based attention
    SUSTAINED = "sustained"      # Long-term focus
    EXECUTIVE = "executive"      # High-level control

class WorkingMemorySlotType(Enum):
    """Types of working memory slots"""
    PHONOLOGICAL = "phonological"    # Language processing
    VISUOSPATIAL = "visuospatial"   # Spatial/visual info
    EPISODIC = "episodic"           # Temporary episode buffer
    SEMANTIC = "semantic"           # Active semantic info
    EXECUTIVE = "executive"         # Control information

class CognitiveLoad(Enum):
    """Cognitive load levels"""
    MINIMAL = 0.1      # Very light processing
    LOW = 0.3          # Light processing
    MODERATE = 0.5     # Normal processing
    HIGH = 0.7         # Heavy processing
    OVERLOAD = 0.9     # Near capacity limit

@dataclass
class AttentionNode:
    """Node in the attention network"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: Any = None
    attention_weight: float = 0.0
    attention_type: AttentionType = AttentionType.FOCUSED
    creation_time: datetime = field(default_factory=datetime.now)
    last_accessed: datetime = field(default_factory=datetime.now)
    access_count: int = 0
    decay_rate: float = 0.1
    importance: float = 0.5
    
@dataclass  
class WorkingMemorySlot:
    """Individual working memory slot"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    slot_type: WorkingMemorySlotType = WorkingMemorySlotType.SEMANTIC
    content: Any = None
    capacity: int = 7  # Miller's magical number 7±2
    current_load: float = 0.0
    items: deque = field(default_factory=lambda: deque(maxlen=7))
    attention_nodes: List[str] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.now)
    active: bool = True

@dataclass
class CognitiveState:
    """Current cognitive processing state"""
    global_load: float = 0.0
    attention_focus: List[str] = field(default_factory=list)  # Active attention node IDs
    processing_goals: List[str] = field(default_factory=list)
    interference_level: float = 0.0
    context_switching_cost: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)

class WorkingMemorySystem:
    """
    Short-term working memory with attention mechanisms.
    Manages active information processing, cognitive load, and attention allocation.
    """
    
    def __init__(
        self, 
        capacity: int = 7, 
        attention_threshold: float = 0.3,
        decay_interval: float = 30.0  # seconds
    ):
        self.slots: Dict[WorkingMemorySlotType, WorkingMemorySlot] = {}
        self.attention_network: Dict[str, AttentionNode] = {}
        self.cognitive_state = CognitiveState()
        
        self.capacity = capacity
        self.attention_threshold = attention_threshold
        self.decay_interval = decay_interval
        
        # Initialize memory slots
        for slot_type in WorkingMemorySlotType:
            self.slots[slot_type] = WorkingMemorySlot(
                slot_type=slot_type,
                capacity=capacity
            )
        
        # Attention management
        self.attention_queue: List[Tuple[float, str]] = []  # Priority queue for attention
        self.context_stack: deque = deque(maxlen=10)  # Context switching stack
        
        # Start background processes
        self._decay_task = None
        self._start_background_processes()
        
        logger.info("🧠 Working Memory System initialized")
    
    async def store_active_information(
        self, 
        content: Any, 
        slot_type: WorkingMemorySlotType = WorkingMemorySlotType.SEMANTIC,
        attention_weight: float = 0.5,
        importance: float = 0.5
    ) -> str:
        """Store information in active working memory"""
        
        slot = self.slots[slot_type]
        
        # Check capacity and manage if needed
        if len(slot.items) >= slot.capacity:
            await self._manage_capacity(slot)
        
        # Create attention node
        attention_node = AttentionNode(
            content=content,
            attention_weight=attention_weight,
            importance=importance
        )
        
        self.attention_network[attention_node.id] = attention_node
        
        # Add to slot
        slot.items.append(attention_node.id)
        slot.attention_nodes.append(attention_node.id)
        slot.current_load = len(slot.items) / slot.capacity
        slot.last_updated = datetime.now()
        
        # Update attention queue
        heapq.heappush(self.attention_queue, (-attention_weight, attention_node.id))
        
        # Update cognitive state
        await self._update_cognitive_state()
        
        logger.info(f"📝 Information stored in {slot_type.value} working memory")
        return attention_node.id
    
    async def retrieve_active_information(
        self, 
        query: str,
        attention_type: AttentionType = AttentionType.SELECTIVE,
        max_items: int = 5
    ) -> List[Dict[str, Any]]:
        """Retrieve information from working memory with attention filtering"""
        
        relevant_items = []
        
        # Apply attention mechanisms
        attention_filtered_nodes = await self._apply_attention_filter(
            query, attention_type, max_items
        )
        
        for node_id in attention_filtered_nodes:
            node = self.attention_network.get(node_id)
            if node:
                # Update access patterns
                node.access_count += 1
                node.last_accessed = datetime.now()
                
                relevant_items.append({
                    'id': node.id,
                    'content': node.content,
                    'attention_weight': node.attention_weight,
                    'importance': node.importance,
                    'access_count': node.access_count,
                    'relevance_score': await self._calculate_relevance(node, query)
                })
        
        # Sort by relevance
        relevant_items.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Update cognitive state
        await self._update_cognitive_state()
        
        logger.info(f"🔍 Retrieved {len(relevant_items)} items from working memory")
        return relevant_items
    
    async def focus_attention(
        self, 
        target_content: str, 
        attention_type: AttentionType = AttentionType.FOCUSED,
        duration: Optional[float] = None
    ) -> bool:
        """Focus attention on specific content"""
        
        # Find matching attention nodes
        matching_nodes = []
        for node_id, node in self.attention_network.items():
            if isinstance(node.content, str) and target_content.lower() in node.content.lower():
                matching_nodes.append(node_id)
            elif str(node.content).lower().find(target_content.lower()) != -1:
                matching_nodes.append(node_id)
        
        if not matching_nodes:
            logger.warning(f"⚠️ No matching content found for attention focus: {target_content}")
            return False
        
        # Apply attention focus
        focus_success = await self._apply_attention_focus(
            matching_nodes, attention_type, duration
        )
        
        if focus_success:
            # Update cognitive state
            self.cognitive_state.attention_focus = matching_nodes
            self.cognitive_state.timestamp = datetime.now()
            
            logger.info(f"🎯 Attention focused on {len(matching_nodes)} nodes")
        
        return focus_success
    
    async def manage_cognitive_load(self, target_load: float = 0.7) -> Dict[str, Any]:
        """Manage cognitive load to maintain optimal performance"""
        
        current_load = self.cognitive_state.global_load
        
        load_management = {
            'initial_load': current_load,
            'target_load': target_load,
            'actions_taken': [],
            'final_load': current_load,
            'success': False
        }
        
        if current_load <= target_load:
            load_management['success'] = True
            return load_management
        
        # Strategies to reduce cognitive load
        if current_load > target_load:
            # 1. Remove low-importance, low-attention items
            removed_count = await self._remove_low_priority_items()
            if removed_count > 0:
                load_management['actions_taken'].append(f"Removed {removed_count} low-priority items")
            
            # 2. Consolidate similar items
            consolidated_count = await self._consolidate_similar_items()
            if consolidated_count > 0:
                load_management['actions_taken'].append(f"Consolidated {consolidated_count} items")
            
            # 3. Transfer to long-term memory
            transferred_count = await self._transfer_to_long_term_memory()
            if transferred_count > 0:
                load_management['actions_taken'].append(f"Transferred {transferred_count} items to LTM")
        
        # Update cognitive state and check final load
        await self._update_cognitive_state()
        load_management['final_load'] = self.cognitive_state.global_load
        load_management['success'] = self.cognitive_state.global_load <= target_load
        
        logger.info(f"🧠 Cognitive load managed: {current_load:.2f} → {load_management['final_load']:.2f}")
        return load_management
    
    async def switch_context(self, new_context: Dict[str, Any]) -> bool:
        """Switch processing context with minimal interference"""
        
        # Save current context
        current_context = {
            'attention_focus': self.cognitive_state.attention_focus.copy(),
            'processing_goals': self.cognitive_state.processing_goals.copy(),
            'timestamp': datetime.now(),
            'cognitive_load': self.cognitive_state.global_load
        }
        
        self.context_stack.append(current_context)
        
        # Calculate context switching cost
        switching_cost = await self._calculate_context_switching_cost(current_context, new_context)
        self.cognitive_state.context_switching_cost = switching_cost
        
        # Apply new context
        self.cognitive_state.attention_focus = new_context.get('attention_focus', [])
        self.cognitive_state.processing_goals = new_context.get('processing_goals', [])
        
        # Update attention weights based on new context
        await self._update_attention_for_context(new_context)
        
        logger.info(f"🔄 Context switched (cost: {switching_cost:.2f})")
        return True
    
    async def get_working_memory_status(self) -> Dict[str, Any]:
        """Get comprehensive working memory status"""
        
        status = {
            'cognitive_state': {
                'global_load': self.cognitive_state.global_load,
                'attention_focus_count': len(self.cognitive_state.attention_focus),
                'processing_goals_count': len(self.cognitive_state.processing_goals),
                'interference_level': self.cognitive_state.interference_level,
                'context_switching_cost': self.cognitive_state.context_switching_cost
            },
            'memory_slots': {},
            'attention_network': {
                'total_nodes': len(self.attention_network),
                'active_nodes': 0,
                'average_attention_weight': 0.0
            },
            'performance_metrics': {}
        }
        
        # Analyze memory slots
        for slot_type, slot in self.slots.items():
            status['memory_slots'][slot_type.value] = {
                'current_load': slot.current_load,
                'item_count': len(slot.items),
                'capacity': slot.capacity,
                'utilization': len(slot.items) / slot.capacity,
                'active': slot.active
            }
        
        # Analyze attention network
        if self.attention_network:
            total_weight = sum(node.attention_weight for node in self.attention_network.values())
            status['attention_network']['average_attention_weight'] = total_weight / len(self.attention_network)
            status['attention_network']['active_nodes'] = sum(
                1 for node in self.attention_network.values() 
                if node.attention_weight >= self.attention_threshold
            )
        
        # Calculate performance metrics
        status['performance_metrics'] = await self._calculate_performance_metrics()
        
        return status
    
    async def _manage_capacity(self, slot: WorkingMemorySlot):
        """Manage slot capacity when full"""
        
        if len(slot.items) < slot.capacity:
            return
        
        # Find least important/least recently used item
        removal_candidates = []
        for item_id in slot.items:
            node = self.attention_network.get(item_id)
            if node:
                # Score based on importance, attention weight, and recency
                recency_score = (datetime.now() - node.last_accessed).total_seconds() / 3600  # hours
                removal_score = recency_score - (node.importance * node.attention_weight)
                removal_candidates.append((removal_score, item_id))
        
        if removal_candidates:
            # Remove highest scoring (least valuable) item
            removal_candidates.sort(reverse=True)
            item_to_remove = removal_candidates[0][1]
            
            slot.items.remove(item_to_remove)
            if item_to_remove in slot.attention_nodes:
                slot.attention_nodes.remove(item_to_remove)
            
            # Optionally transfer to long-term memory
            node = self.attention_network.get(item_to_remove)
            if node and node.importance > 0.3:
                await self._transfer_item_to_ltm(node)
            
            # Remove from attention network
            if item_to_remove in self.attention_network:
                del self.attention_network[item_to_remove]
    
    async def _apply_attention_filter(
        self, 
        query: str, 
        attention_type: AttentionType, 
        max_items: int
    ) -> List[str]:
        """Apply attention mechanisms to filter relevant information"""
        
        filtered_nodes = []
        
        if attention_type == AttentionType.FOCUSED:
            # Single highest-weight item matching query
            best_match = None
            best_score = 0
            
            for node_id, node in self.attention_network.items():
                relevance = await self._calculate_relevance(node, query)
                if relevance > best_score:
                    best_score = relevance
                    best_match = node_id
            
            if best_match:
                filtered_nodes.append(best_match)
        
        elif attention_type == AttentionType.SELECTIVE:
            # Filter by relevance threshold
            candidates = []
            for node_id, node in self.attention_network.items():
                relevance = await self._calculate_relevance(node, query)
                if relevance > 0.1:  # Lower threshold for better retrieval
                    candidates.append((relevance, node_id))
            
            candidates.sort(reverse=True)
            filtered_nodes = [node_id for _, node_id in candidates[:max_items]]
        
        elif attention_type == AttentionType.DIVIDED:
            # Multiple high-attention items
            attention_sorted = sorted(
                self.attention_network.items(),
                key=lambda x: x[1].attention_weight,
                reverse=True
            )
            filtered_nodes = [node_id for node_id, _ in attention_sorted[:max_items]]
        
        return filtered_nodes
    
    async def _calculate_relevance(self, node: AttentionNode, query: str) -> float:
        """Calculate relevance of a node to a query"""
        
        if not node.content:
            return 0.0
        
        # Simple text-based relevance (enhance with semantic similarity)
        content_text = str(node.content).lower()
        query_text = query.lower()
        
        # Clean text - remove punctuation for better matching
        import string
        content_clean = content_text.translate(str.maketrans('', '', string.punctuation))
        query_clean = query_text.translate(str.maketrans('', '', string.punctuation))
        
        # Word overlap scoring
        content_words = set(content_clean.split())
        query_words = set(query_clean.split())
        
        if not query_words:
            return 0.0
        
        overlap = len(content_words.intersection(query_words))
        relevance = overlap / len(query_words)
        
        # Boost by attention weight and importance
        relevance = relevance * (0.5 + 0.3 * node.attention_weight + 0.2 * node.importance)
        
        return min(relevance, 1.0)
    
    async def _apply_attention_focus(
        self, 
        node_ids: List[str], 
        attention_type: AttentionType, 
        duration: Optional[float]
    ) -> bool:
        """Apply attention focus to specific nodes"""
        
        try:
            # Increase attention weights for focused nodes
            boost_factor = 2.0 if attention_type == AttentionType.FOCUSED else 1.5
            
            for node_id in node_ids:
                node = self.attention_network.get(node_id)
                if node:
                    node.attention_weight = min(node.attention_weight * boost_factor, 1.0)
                    node.attention_type = attention_type
            
            # If duration specified, schedule attention decay
            if duration:
                asyncio.create_task(self._scheduled_attention_decay(node_ids, duration))
            
            return True
            
        except Exception as e:
            logger.error(f"Error applying attention focus: {e}")
            return False
    
    async def _update_cognitive_state(self):
        """Update global cognitive state"""
        
        # Calculate global cognitive load
        total_load = 0
        total_capacity = 0
        
        for slot in self.slots.values():
            total_load += len(slot.items)
            total_capacity += slot.capacity
        
        self.cognitive_state.global_load = total_load / total_capacity if total_capacity > 0 else 0
        
        # Calculate interference level
        attention_conflicts = 0
        high_attention_nodes = [
            node for node in self.attention_network.values()
            if node.attention_weight > 0.7
        ]
        
        if len(high_attention_nodes) > 3:  # Too many high-attention items
            attention_conflicts = (len(high_attention_nodes) - 3) / len(high_attention_nodes)
        
        self.cognitive_state.interference_level = attention_conflicts
        self.cognitive_state.timestamp = datetime.now()
    
    async def _remove_low_priority_items(self) -> int:
        """Remove low-priority items to reduce cognitive load"""
        
        removed_count = 0
        removal_candidates = []
        
        for node_id, node in self.attention_network.items():
            # Score for removal (higher = more likely to remove)
            age_hours = (datetime.now() - node.creation_time).total_seconds() / 3600
            removal_score = age_hours + (1.0 - node.importance) + (1.0 - node.attention_weight) - node.access_count * 0.1
            
            if removal_score > 2.0:  # Threshold for removal
                removal_candidates.append((removal_score, node_id))
        
        # Remove top candidates
        removal_candidates.sort(reverse=True)
        for _, node_id in removal_candidates[:3]:  # Remove up to 3 items
            await self._remove_node_from_memory(node_id)
            removed_count += 1
        
        return removed_count
    
    async def _consolidate_similar_items(self) -> int:
        """Consolidate similar items to reduce memory load"""
        
        consolidated_count = 0
        processed_nodes = set()
        
        for node_id, node in list(self.attention_network.items()):
            if node_id in processed_nodes:
                continue
            
            # Find similar nodes
            similar_nodes = []
            for other_id, other_node in self.attention_network.items():
                if other_id != node_id and other_id not in processed_nodes:
                    similarity = await self._calculate_node_similarity(node, other_node)
                    if similarity > 0.8:  # High similarity threshold
                        similar_nodes.append(other_id)
            
            # Consolidate if similar nodes found
            if similar_nodes:
                consolidated_node = await self._merge_similar_nodes(node_id, similar_nodes)
                if consolidated_node:
                    consolidated_count += len(similar_nodes)
                    processed_nodes.update(similar_nodes)
        
        return consolidated_count
    
    async def _transfer_to_long_term_memory(self) -> int:
        """Transfer items to long-term memory systems"""
        
        transferred_count = 0
        
        # Find items suitable for LTM transfer
        transfer_candidates = []
        for node_id, node in self.attention_network.items():
            # High importance but low current attention
            if node.importance > 0.6 and node.attention_weight < 0.3:
                age_hours = (datetime.now() - node.last_accessed).total_seconds() / 3600
                if age_hours > 1.0:  # Not accessed recently
                    transfer_candidates.append(node_id)
        
        # Transfer candidates
        for node_id in transfer_candidates[:3]:  # Transfer up to 3 items
            success = await self._transfer_item_to_ltm(self.attention_network[node_id])
            if success:
                await self._remove_node_from_memory(node_id)
                transferred_count += 1
        
        return transferred_count
    
    async def _remove_node_from_memory(self, node_id: str):
        """Remove a node from working memory"""
        
        # Remove from all slots
        for slot in self.slots.values():
            if node_id in slot.items:
                slot.items.remove(node_id)
            if node_id in slot.attention_nodes:
                slot.attention_nodes.remove(node_id)
        
        # Remove from attention network
        if node_id in self.attention_network:
            del self.attention_network[node_id]
        
        # Remove from attention queue
        self.attention_queue = [
            (priority, nid) for priority, nid in self.attention_queue 
            if nid != node_id
        ]
        heapq.heapify(self.attention_queue)
        
        # Update cognitive state
        if node_id in self.cognitive_state.attention_focus:
            self.cognitive_state.attention_focus.remove(node_id)
    
    async def _calculate_node_similarity(self, node1: AttentionNode, node2: AttentionNode) -> float:
        """Calculate similarity between two attention nodes"""
        
        if not node1.content or not node2.content:
            return 0.0
        
        # Simple text similarity (enhance with semantic embeddings)
        content1 = str(node1.content).lower().split()
        content2 = str(node2.content).lower().split()
        
        if not content1 or not content2:
            return 0.0
        
        common_words = set(content1).intersection(set(content2))
        total_words = set(content1).union(set(content2))
        
        if not total_words:
            return 0.0
        
        similarity = len(common_words) / len(total_words)
        return similarity
    
    async def _merge_similar_nodes(self, primary_node_id: str, similar_node_ids: List[str]) -> Optional[str]:
        """Merge similar nodes into a single consolidated node"""
        
        primary_node = self.attention_network.get(primary_node_id)
        if not primary_node:
            return None
        
        try:
            # Combine content and properties
            combined_importance = primary_node.importance
            combined_attention = primary_node.attention_weight
            combined_access_count = primary_node.access_count
            
            for node_id in similar_node_ids:
                node = self.attention_network.get(node_id)
                if node:
                    combined_importance = max(combined_importance, node.importance)
                    combined_attention = max(combined_attention, node.attention_weight)
                    combined_access_count += node.access_count
                    
                    # Remove the similar node
                    await self._remove_node_from_memory(node_id)
            
            # Update primary node with combined properties
            primary_node.importance = min(combined_importance, 1.0)
            primary_node.attention_weight = min(combined_attention, 1.0)
            primary_node.access_count = combined_access_count
            
            return primary_node_id
            
        except Exception as e:
            logger.error(f"Error merging similar nodes: {e}")
            return None
    
    async def _transfer_item_to_ltm(self, node: AttentionNode) -> bool:
        """Transfer item to long-term memory (placeholder for integration)"""
        
        # Placeholder for integration with episodic/semantic memory
        logger.info(f"📚 Transferred item to LTM: {str(node.content)[:50]}...")
        return True
    
    async def _calculate_context_switching_cost(
        self, 
        old_context: Dict[str, Any], 
        new_context: Dict[str, Any]
    ) -> float:
        """Calculate cognitive cost of context switching"""
        
        # Simple cost calculation based on context differences
        old_focus = set(old_context.get('attention_focus', []))
        new_focus = set(new_context.get('attention_focus', []))
        
        focus_difference = len(old_focus.symmetric_difference(new_focus))
        total_focus_items = len(old_focus.union(new_focus))
        
        if total_focus_items == 0:
            return 0.0
        
        # Cost increases with the proportion of attention that changes
        switching_cost = focus_difference / total_focus_items
        
        # Additional cost for cognitive load
        load_difference = abs(
            old_context.get('cognitive_load', 0) - 
            new_context.get('cognitive_load', 0)
        )
        
        switching_cost += load_difference * 0.5
        
        return min(switching_cost, 1.0)
    
    async def _update_attention_for_context(self, new_context: Dict[str, Any]):
        """Update attention weights based on new context"""
        
        context_relevant_terms = new_context.get('relevant_terms', [])
        if not context_relevant_terms:
            return
        
        # Boost attention for context-relevant items
        for node_id, node in self.attention_network.items():
            if isinstance(node.content, str):
                content_lower = node.content.lower()
                relevance_boost = sum(
                    0.1 for term in context_relevant_terms
                    if term.lower() in content_lower
                )
                node.attention_weight = min(node.attention_weight + relevance_boost, 1.0)
    
    async def _calculate_performance_metrics(self) -> Dict[str, float]:
        """Calculate working memory performance metrics"""
        
        if not self.attention_network:
            return {}
        
        # Access efficiency
        total_accesses = sum(node.access_count for node in self.attention_network.values())
        active_nodes = len([n for n in self.attention_network.values() if n.access_count > 0])
        access_efficiency = total_accesses / max(active_nodes, 1)
        
        # Attention distribution
        attention_weights = [node.attention_weight for node in self.attention_network.values()]
        attention_variance = sum((w - sum(attention_weights)/len(attention_weights))**2 for w in attention_weights) / len(attention_weights)
        
        # Memory utilization
        total_capacity = sum(slot.capacity for slot in self.slots.values())
        total_usage = sum(len(slot.items) for slot in self.slots.values())
        memory_utilization = total_usage / total_capacity
        
        return {
            'access_efficiency': access_efficiency,
            'attention_variance': attention_variance,
            'memory_utilization': memory_utilization,
            'cognitive_load': self.cognitive_state.global_load,
            'interference_level': self.cognitive_state.interference_level
        }
    
    async def _scheduled_attention_decay(self, node_ids: List[str], duration: float):
        """Scheduled attention decay after specified duration"""
        
        await asyncio.sleep(duration)
        
        decay_factor = 0.7
        for node_id in node_ids:
            node = self.attention_network.get(node_id)
            if node:
                node.attention_weight *= decay_factor
                logger.info(f"⏰ Attention decayed for node {node_id}")
    
    def _start_background_processes(self):
        """Start background maintenance processes"""
        self._decay_task = asyncio.create_task(self._background_decay_process())
    
    async def _background_decay_process(self):
        """Background process for attention decay"""
        
        while True:
            try:
                await asyncio.sleep(self.decay_interval)
                
                current_time = datetime.now()
                for node in self.attention_network.values():
                    # Natural attention decay over time
                    time_since_access = (current_time - node.last_accessed).total_seconds()
                    if time_since_access > self.decay_interval:
                        decay_amount = node.decay_rate * (time_since_access / 3600)  # hourly decay
                        node.attention_weight = max(0, node.attention_weight - decay_amount)
                
                # Update cognitive state
                await self._update_cognitive_state()
                
            except Exception as e:
                logger.error(f"Error in background decay process: {e}")
                await asyncio.sleep(10)  # Brief pause before retrying

# Global working memory instance
working_memory = None

def get_working_memory_system() -> WorkingMemorySystem:
    """Get global working memory system instance"""
    global working_memory
    if working_memory is None:
        working_memory = WorkingMemorySystem()
    return working_memory

if __name__ == "__main__":
    # Test working memory system
    async def test_working_memory():
        memory_system = WorkingMemorySystem()
        
        # Store test information
        item1_id = await memory_system.store_active_information(
            "Solve the equation x^2 + 5x + 6 = 0",
            WorkingMemorySlotType.SEMANTIC,
            attention_weight=0.8,
            importance=0.9
        )
        
        item2_id = await memory_system.store_active_information(
            "Remember to buy milk and bread",
            WorkingMemorySlotType.EPISODIC,
            attention_weight=0.3,
            importance=0.4
        )
        
        # Focus attention
        await memory_system.focus_attention("equation", AttentionType.FOCUSED)
        
        # Query information
        results = await memory_system.retrieve_active_information(
            "mathematical problem", AttentionType.SELECTIVE
        )
        print(f"Query results: {len(results)} items")
        
        # Check status
        status = await memory_system.get_working_memory_status()
        print(f"Cognitive load: {status['cognitive_state']['global_load']:.2f}")
        
        # Manage cognitive load
        load_result = await memory_system.manage_cognitive_load(0.5)
        print(f"Load management: {load_result['success']}")
    
    asyncio.run(test_working_memory())