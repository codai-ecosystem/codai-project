"""
Enhanced Memory Architecture Neural Network
Production-grade transformer specialized for memory operations with Romanian cultural context

This implementation replaces the mock Enhanced Memory Architecture with a real neural network
capable of sophisticated memory storage, retrieval, and cultural context awareness.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Dict, List, Optional, Tuple, Any, Union
import logging
from dataclasses import dataclass
import json
from collections import defaultdict
import time

from .base_transformer import (
    RomAIBaseTransformer, 
    TransformerConfig, 
    create_romanian_config
)

logger = logging.getLogger(__name__)

@dataclass
class MemoryConfig:
    """Configuration for Enhanced Memory Architecture"""
    # Base transformer config
    transformer_config: TransformerConfig
    
    # Memory-specific parameters
    memory_bank_size: int = 100000
    memory_dim: int = 1024
    cultural_memory_dim: int = 256
    episodic_memory_layers: int = 4
    semantic_memory_layers: int = 6
    
    # Attention mechanisms
    memory_attention_heads: int = 16
    cross_modal_attention: bool = True
    temporal_attention: bool = True
    
    # Cultural consciousness
    cultural_weight: float = 0.3
    romanian_memory_boost: float = 1.2
    cultural_context_layers: int = 3
    
    # Memory operations
    memory_consolidation_threshold: float = 0.7
    forgetting_rate: float = 0.01
    cultural_preservation_rate: float = 0.95
    
    # Performance optimization
    use_memory_compression: bool = True
    batch_memory_operations: bool = True
    memory_cache_size: int = 10000


class CulturalMemoryBank(nn.Module):
    """Neural memory bank with Romanian cultural consciousness"""
    
    def __init__(self, config: MemoryConfig):
        super().__init__()
        self.config = config
        
        # Memory storage matrices
        self.semantic_memory = nn.Parameter(
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
        )
        self.episodic_memory = nn.Parameter(
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
        )
        self.cultural_memory = nn.Parameter(
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
        )
        
        # Memory access mechanisms
        self.semantic_query_proj = nn.Linear(config.memory_dim, config.memory_dim)
        self.episodic_query_proj = nn.Linear(config.memory_dim, config.memory_dim)
        self.cultural_query_proj = nn.Linear(config.memory_dim, config.cultural_memory_dim)
        
        # Memory writing mechanisms
        self.memory_gate = nn.Sequential(
            nn.Linear(config.memory_dim * 2, config.memory_dim),
            nn.Tanh(),
            nn.Linear(config.memory_dim, 1),
            nn.Sigmoid()
        )
        
        # Cultural enhancement
        self.cultural_enhancement = nn.Sequential(
            nn.Linear(config.cultural_memory_dim, config.memory_dim),
            nn.GELU(),
            nn.Linear(config.memory_dim, config.memory_dim)
        )
        
        # Memory consolidation
        self.consolidation_network = nn.Sequential(
            nn.Linear(config.memory_dim * 3, config.memory_dim * 2),
            nn.GELU(),
            nn.Linear(config.memory_dim * 2, config.memory_dim),
            nn.LayerNorm(config.memory_dim)
        )
        
        # Initialize memory slots usage tracking
        self.register_buffer('memory_usage', torch.zeros(config.memory_bank_size))
        self.register_buffer('cultural_importance', torch.zeros(config.memory_bank_size))
        self.register_buffer('last_access_time', torch.zeros(config.memory_bank_size))
        
        logger.info(f"🧠 Cultural Memory Bank initialized with {config.memory_bank_size:,} slots")
    
    def store_memory(self, content: torch.Tensor, memory_type: str = "semantic", 
                     cultural_context: Optional[torch.Tensor] = None, 
                     importance: float = 1.0) -> int:
        """Store new memory with cultural context awareness"""
        batch_size, seq_len, dim = content.shape
        
        # Aggregate content representation
        memory_repr = torch.mean(content, dim=1)  # [batch, dim]
        
        # Find available memory slots
        available_slots = (self.memory_usage == 0).nonzero(as_tuple=True)[0]
        
        if len(available_slots) == 0:
            # Memory full - implement forgetting mechanism
            available_slots = self._forget_least_important_memories(batch_size)
        
        # Store memories
        stored_indices = []
        for i in range(min(batch_size, len(available_slots))):
            slot_idx = available_slots[i].item()
            
            if memory_type == "semantic":
                self.semantic_memory.data[slot_idx] = memory_repr[i]
            elif memory_type == "episodic":
                self.episodic_memory.data[slot_idx] = memory_repr[i]
            
            # Store cultural context if provided
            if cultural_context is not None:
                cultural_repr = torch.mean(cultural_context[i], dim=0) if cultural_context[i].dim() > 1 else cultural_context[i]
                if cultural_repr.shape[0] == self.config.cultural_memory_dim:
                    self.cultural_memory.data[slot_idx] = cultural_repr
                else:
                    # Project to correct dimension
                    projected = F.linear(cultural_repr.unsqueeze(0), 
                                       self.cultural_query_proj.weight[:self.config.cultural_memory_dim])
                    self.cultural_memory.data[slot_idx] = projected.squeeze(0)
            
            # Update metadata
            self.memory_usage.data[slot_idx] = 1.0
            cultural_boost = self.config.romanian_memory_boost if cultural_context is not None else 1.0
            self.cultural_importance.data[slot_idx] = importance * cultural_boost
            self.last_access_time.data[slot_idx] = time.time()
            
            stored_indices.append(slot_idx)
        
        return stored_indices
    
    def retrieve_memory(self, query: torch.Tensor, memory_type: str = "semantic", 
                       top_k: int = 5, cultural_weight: float = None) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """Retrieve memories based on query with cultural awareness"""
        if cultural_weight is None:
            cultural_weight = self.config.cultural_weight
        
        batch_size, query_dim = query.shape
        
        # Project query
        if memory_type == "semantic":
            query_proj = self.semantic_query_proj(query)
            memory_bank = self.semantic_memory
        elif memory_type == "episodic":
            query_proj = self.episodic_query_proj(query)
            memory_bank = self.episodic_memory
        else:
            query_proj = query
            memory_bank = self.semantic_memory
        
        # Compute similarity scores
        similarity_scores = torch.matmul(query_proj, memory_bank.T)  # [batch, memory_bank_size]
        
        # Apply cultural enhancement
        if cultural_weight > 0:
            cultural_proj = self.cultural_query_proj(query)  # [batch, cultural_dim]
            cultural_sim = torch.matmul(cultural_proj, self.cultural_memory.T)  # [batch, memory_bank_size]
            similarity_scores = similarity_scores + cultural_weight * cultural_sim
        
        # Apply importance weighting
        importance_weight = self.cultural_importance.unsqueeze(0).expand(batch_size, -1)
        weighted_scores = similarity_scores * importance_weight
        
        # Get top-k memories
        top_k_scores, top_k_indices = torch.topk(weighted_scores, k=min(top_k, self.config.memory_bank_size), dim=1)
        
        # Retrieve memory contents
        retrieved_memories = []
        retrieved_cultural = []
        
        for batch_idx in range(batch_size):
            batch_memories = memory_bank[top_k_indices[batch_idx]]  # [top_k, memory_dim]
            batch_cultural = self.cultural_memory[top_k_indices[batch_idx]]  # [top_k, cultural_dim]
            
            retrieved_memories.append(batch_memories)
            retrieved_cultural.append(batch_cultural)
        
        retrieved_memories = torch.stack(retrieved_memories)  # [batch, top_k, memory_dim]
        retrieved_cultural = torch.stack(retrieved_cultural)  # [batch, top_k, cultural_dim]
        
        # Update access times
        current_time = time.time()
        for batch_idx in range(batch_size):
            self.last_access_time.data[top_k_indices[batch_idx]] = current_time
        
        return retrieved_memories, retrieved_cultural, top_k_scores
    
    def _forget_least_important_memories(self, num_slots_needed: int) -> torch.Tensor:
        """Implement forgetting mechanism to free memory slots"""
        # Calculate forgetting scores (lower = more likely to forget)
        time_decay = torch.exp(-self.config.forgetting_rate * (time.time() - self.last_access_time))
        cultural_preservation = self.cultural_importance * self.config.cultural_preservation_rate
        
        forgetting_resistance = time_decay + cultural_preservation
        
        # Find slots with lowest resistance (most likely to forget)
        _, forget_indices = torch.topk(forgetting_resistance, k=num_slots_needed, largest=False)
        
        # Clear these memory slots
        for idx in forget_indices:
            self.memory_usage.data[idx] = 0.0
            self.cultural_importance.data[idx] = 0.0
            self.last_access_time.data[idx] = 0.0
        
        logger.info(f"🧠 Forgot {num_slots_needed} memories to make room for new ones")
        return forget_indices
    
    def consolidate_memories(self) -> Dict[str, float]:
        """Consolidate similar memories to optimize storage"""
        used_slots = (self.memory_usage > 0).nonzero(as_tuple=True)[0]
        
        if len(used_slots) < 2:
            return {"consolidated": 0, "freed_slots": 0}
        
        # Compute pairwise similarities between memories
        used_semantic = self.semantic_memory[used_slots]
        similarities = torch.matmul(used_semantic, used_semantic.T)
        
        # Find pairs with high similarity above threshold
        consolidation_pairs = []
        threshold = self.config.memory_consolidation_threshold
        
        for i in range(len(used_slots)):
            for j in range(i + 1, len(used_slots)):
                if similarities[i, j] > threshold:
                    consolidation_pairs.append((i, j))
        
        # Consolidate similar memories
        consolidated_count = 0
        for i, j in consolidation_pairs:
            slot_i, slot_j = used_slots[i], used_slots[j]
            
            # Combine memories (weighted by importance)
            importance_i = self.cultural_importance[slot_i]
            importance_j = self.cultural_importance[slot_j]
            total_importance = importance_i + importance_j
            
            if total_importance > 0:
                weight_i = importance_i / total_importance
                weight_j = importance_j / total_importance
                
                # Weighted combination
                consolidated_semantic = weight_i * self.semantic_memory[slot_i] + weight_j * self.semantic_memory[slot_j]
                consolidated_cultural = weight_i * self.cultural_memory[slot_i] + weight_j * self.cultural_memory[slot_j]
                
                # Store in first slot, free second slot
                self.semantic_memory.data[slot_i] = consolidated_semantic
                self.cultural_memory.data[slot_i] = consolidated_cultural
                self.cultural_importance.data[slot_i] = total_importance
                
                # Free second slot
                self.memory_usage.data[slot_j] = 0.0
                self.cultural_importance.data[slot_j] = 0.0
                
                consolidated_count += 1
        
        return {"consolidated": consolidated_count, "freed_slots": consolidated_count}


class MemoryAttentionLayer(nn.Module):
    """Specialized attention layer for memory operations"""
    
    def __init__(self, config: MemoryConfig):
        super().__init__()
        self.config = config
        self.d_model = config.transformer_config.d_model
        self.n_heads = config.memory_attention_heads
        self.d_k = self.d_model // self.n_heads
        
        # Memory-specific attention projections
        self.w_q_memory = nn.Linear(self.d_model, self.d_model)
        self.w_k_memory = nn.Linear(self.d_model, self.d_model)
        self.w_v_memory = nn.Linear(self.d_model, self.d_model)
        
        # Cross-modal attention for cultural context
        if config.cross_modal_attention:
            self.w_q_cultural = nn.Linear(config.cultural_memory_dim, self.d_model)
            self.cultural_fusion = nn.Linear(self.d_model * 2, self.d_model)
        
        # Temporal attention for episodic memories
        if config.temporal_attention:
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
            self.temporal_attention = nn.MultiheadAttention(self.d_model, self.n_heads, batch_first=True)
        
        self.output_projection = nn.Linear(self.d_model, self.d_model)
        self.dropout = nn.Dropout(config.transformer_config.dropout)
        
    def forward(self, query: torch.Tensor, memory: torch.Tensor, 
                cultural_context: Optional[torch.Tensor] = None,
                temporal_ids: Optional[torch.Tensor] = None) -> torch.Tensor:
        
        batch_size, seq_len, d_model = query.shape
        memory_size = memory.shape[1]
        
        # Standard memory attention
        Q = self.w_q_memory(query).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        K = self.w_k_memory(memory).view(batch_size, memory_size, self.n_heads, self.d_k).transpose(1, 2)
        V = self.w_v_memory(memory).view(batch_size, memory_size, self.n_heads, self.d_k).transpose(1, 2)
        
        # Compute attention scores
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / math.sqrt(self.d_k)
        attention_weights = F.softmax(attention_scores, dim=-1)
        attention_weights = self.dropout(attention_weights)
        
        # Apply attention
        memory_output = torch.matmul(attention_weights, V)
        memory_output = memory_output.transpose(1, 2).contiguous().view(batch_size, seq_len, d_model)
        
        # Cross-modal cultural attention
        if self.config.cross_modal_attention and cultural_context is not None:
            cultural_q = self.w_q_cultural(cultural_context).unsqueeze(1).expand(-1, seq_len, -1)
            cultural_attended, _ = torch.nn.functional.scaled_dot_product_attention(
                cultural_q, memory_output, memory_output
            )
            memory_output = self.cultural_fusion(torch.cat([memory_output, cultural_attended], dim=-1))
        
        # Temporal attention for episodic memories
        if self.config.temporal_attention and temporal_ids is not None:
            temporal_embeds = self.temporal_encoding[temporal_ids]
            temporal_memory = memory_output + temporal_embeds
            temporal_output, _ = self.temporal_attention(query, temporal_memory, temporal_memory)
            memory_output = memory_output + temporal_output
        
        # Final projection
        output = self.output_projection(memory_output)
        
        return output


class EnhancedMemoryArchitecture(nn.Module):
    """
    Production-grade Enhanced Memory Architecture
    Replaces mock implementation with real neural networks for sophisticated memory operations
    """
    
    def __init__(self, config: MemoryConfig):
        super().__init__()
        self.config = config
        
        # Base transformer for text understanding
        self.base_transformer = RomAIBaseTransformer(config.transformer_config)
        
        # Memory components
        self.memory_bank = CulturalMemoryBank(config)
        
        # Specialized memory layers
        self.semantic_memory_layers = nn.ModuleList([
            MemoryAttentionLayer(config) for _ in range(config.semantic_memory_layers)
        ])
        
        self.episodic_memory_layers = nn.ModuleList([
            MemoryAttentionLayer(config) for _ in range(config.episodic_memory_layers)
        ])
        
        # Cultural context processing
        self.cultural_processor = nn.ModuleList([
            nn.TransformerEncoderLayer(
                d_model=config.transformer_config.d_model,
                nhead=config.transformer_config.n_heads,
                dim_feedforward=config.transformer_config.d_ff,
                dropout=config.transformer_config.dropout,
                batch_first=True
            ) for _ in range(config.cultural_context_layers)
        ])
        
        # Memory operation heads
        self.memory_classifier = nn.Linear(config.transformer_config.d_model, 4)  # store/retrieve/update/forget
        self.importance_predictor = nn.Linear(config.transformer_config.d_model, 1)
        self.cultural_relevance_predictor = nn.Linear(config.transformer_config.d_model, 1)
        
        # Output projection
        self.output_projection = nn.Linear(config.transformer_config.d_model * 2, config.transformer_config.d_model)
        
        logger.info("🧠 Enhanced Memory Architecture initialized")
        logger.info(f"   Memory bank size: {config.memory_bank_size:,} slots")
        logger.info(f"   Semantic layers: {config.semantic_memory_layers}")
        logger.info(f"   Episodic layers: {config.episodic_memory_layers}")
        logger.info(f"   Cultural processing: {'✅ Enabled' if config.cultural_weight > 0 else '❌ Disabled'}")
    
    def forward(self, input_ids: torch.Tensor, 
                operation: str = "retrieve",
                memory_type: str = "semantic",
                cultural_context_ids: Optional[torch.Tensor] = None,
                importance: float = 1.0) -> Dict[str, torch.Tensor]:
        
        # Base text understanding
        base_outputs = self.base_transformer(input_ids, cultural_context_ids=cultural_context_ids)
        hidden_states = base_outputs['last_hidden_state']
        
        # Process cultural context if provided
        cultural_representation = None
        if cultural_context_ids is not None:
            cultural_representation = self.base_transformer.get_cultural_representation(hidden_states)
            
            for cultural_layer in self.cultural_processor:
                cultural_representation = cultural_layer(cultural_representation.unsqueeze(1)).squeeze(1)
        
        # Determine memory operation
        operation_logits = self.memory_classifier(torch.mean(hidden_states, dim=1))
        predicted_operation = torch.argmax(operation_logits, dim=-1)
        
        # Predict importance and cultural relevance
        importance_pred = torch.sigmoid(self.importance_predictor(torch.mean(hidden_states, dim=1)))
        cultural_relevance = torch.sigmoid(self.cultural_relevance_predictor(torch.mean(hidden_states, dim=1)))
        
        # Execute memory operation
        memory_output = None
        operation_results = {}
        
        if operation == "store" or predicted_operation[0] == 0:
            # Store new memory
            stored_indices = self.memory_bank.store_memory(
                hidden_states, 
                memory_type=memory_type,
                cultural_context=cultural_representation,
                importance=importance * importance_pred[0].item()
            )
            operation_results['stored_indices'] = stored_indices
            memory_output = hidden_states
        
        elif operation == "retrieve" or predicted_operation[0] == 1:
            # Retrieve relevant memories
            query = torch.mean(hidden_states, dim=1)
            retrieved_memories, retrieved_cultural, retrieval_scores = self.memory_bank.retrieve_memory(
                query, 
                memory_type=memory_type,
                cultural_weight=self.config.cultural_weight * cultural_relevance[0].item()
            )
            
            # Process retrieved memories
            batch_size, top_k, memory_dim = retrieved_memories.shape
            retrieved_flat = retrieved_memories.view(batch_size, top_k, memory_dim)
            
            # Apply appropriate memory layers
            if memory_type == "semantic":
                for layer in self.semantic_memory_layers:
                    retrieved_flat = layer(hidden_states, retrieved_flat, retrieved_cultural)
            else:
                for layer in self.episodic_memory_layers:
                    retrieved_flat = layer(hidden_states, retrieved_flat, retrieved_cultural)
            
            memory_output = retrieved_flat
            operation_results['retrieval_scores'] = retrieval_scores
            operation_results['retrieved_memories'] = retrieved_memories
        
        # Combine original representation with memory
        if memory_output is not None:
            if memory_output.dim() == 3 and memory_output.shape[1] > 1:
                memory_output = torch.mean(memory_output, dim=1, keepdim=True).expand(-1, hidden_states.shape[1], -1)
            elif memory_output.dim() == 2:
                memory_output = memory_output.unsqueeze(1).expand(-1, hidden_states.shape[1], -1)
            
            combined = torch.cat([hidden_states, memory_output], dim=-1)
            final_output = self.output_projection(combined)
        else:
            final_output = hidden_states
        
        return {
            'hidden_states': final_output,
            'memory_operation': predicted_operation,
            'importance_score': importance_pred,
            'cultural_relevance': cultural_relevance,
            'operation_results': operation_results,
            'cultural_representation': cultural_representation
        }
    
    def consolidate_memories(self) -> Dict[str, Any]:
        """Trigger memory consolidation process"""
        return self.memory_bank.consolidate_memories()
    
    def get_memory_statistics(self) -> Dict[str, Any]:
        """Get comprehensive memory usage statistics"""
        used_slots = (self.memory_bank.memory_usage > 0).sum().item()
        total_slots = self.config.memory_bank_size
        
        cultural_memories = (self.memory_bank.cultural_importance > 0).sum().item()
        avg_importance = self.memory_bank.cultural_importance[self.memory_bank.memory_usage > 0].mean().item()
        
        return {
            'used_memory_slots': used_slots,
            'total_memory_slots': total_slots,
            'memory_utilization': used_slots / total_slots,
            'cultural_memories': cultural_memories,
            'average_importance': avg_importance,
            'cultural_memory_ratio': cultural_memories / max(used_slots, 1)
        }


def create_enhanced_memory_config() -> MemoryConfig:
    """Create optimized configuration for Enhanced Memory Architecture"""
    transformer_config = create_romanian_config("memory")
    
    return MemoryConfig(
        transformer_config=transformer_config,
        memory_bank_size=100000,
        memory_dim=transformer_config.d_model,
        cultural_memory_dim=256,
        episodic_memory_layers=4,
        semantic_memory_layers=6,
        memory_attention_heads=16,
        cultural_weight=0.3,
        romanian_memory_boost=1.2,
        memory_consolidation_threshold=0.7,
        cultural_preservation_rate=0.95
    )


# Example usage and testing
if __name__ == "__main__":
    # Test Enhanced Memory Architecture
    config = create_enhanced_memory_config()
    memory_model = EnhancedMemoryArchitecture(config)
    
    # Test memory operations
    batch_size, seq_len = 2, 128
    input_ids = torch.randint(0, config.transformer_config.vocab_size, (batch_size, seq_len))
    cultural_context_ids = torch.randint(0, 100, (batch_size,))
    
    print("🧠 Testing Enhanced Memory Architecture...")
    
    # Test store operation
    with torch.no_grad():
        store_outputs = memory_model(input_ids, operation="store", cultural_context_ids=cultural_context_ids)
    
    # Test retrieve operation
    with torch.no_grad():
        retrieve_outputs = memory_model(input_ids, operation="retrieve", cultural_context_ids=cultural_context_ids)
    
    # Get memory statistics
    memory_stats = memory_model.get_memory_statistics()
    
    print(f"✅ Store operation completed:")
    print(f"   Stored indices: {len(store_outputs['operation_results'].get('stored_indices', []))}")
    print(f"   Importance score: {store_outputs['importance_score'][0].item():.3f}")
    print(f"   Cultural relevance: {store_outputs['cultural_relevance'][0].item():.3f}")
    
    print(f"✅ Retrieve operation completed:")
    print(f"   Retrieved memories shape: {retrieve_outputs['operation_results'].get('retrieved_memories', torch.empty(0)).shape}")
    print(f"   Retrieval scores: {retrieve_outputs['operation_results'].get('retrieval_scores', torch.empty(0)).shape}")
    
    print(f"📊 Memory Statistics:")
    print(f"   Used slots: {memory_stats['used_memory_slots']}/{memory_stats['total_memory_slots']}")
    print(f"   Memory utilization: {memory_stats['memory_utilization']:.1%}")
    print(f"   Cultural memories: {memory_stats['cultural_memories']}")
    print(f"   Cultural memory ratio: {memory_stats['cultural_memory_ratio']:.1%}")
    
    print("🎉 Enhanced Memory Architecture test completed successfully!")