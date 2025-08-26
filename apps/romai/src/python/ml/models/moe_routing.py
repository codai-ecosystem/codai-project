"""
Mixture of Experts (MoE) Implementation
Specialized expert routing for Romanian AGI

This module provides:
- Dynamic expert routing
- Task-specific expert specialization
- Romanian language domain experts
- Efficient sparse computation
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple, Union
import math
import numpy as np

class ExpertFFN(nn.Module):
    """
    Single expert feed-forward network
    """
    
    def __init__(
        self,
        d_model: int,
        d_ff: int,
        dropout: float = 0.1,
        activation: str = "gelu",
        expert_id: int = 0,
        specialty: str = "general"
    ):
        super().__init__()
        
        self.d_model = d_model
        self.d_ff = d_ff
        self.expert_id = expert_id
        self.specialty = specialty
        
        # Feed-forward layers
        self.w1 = nn.Linear(d_model, d_ff)
        self.w2 = nn.Linear(d_ff, d_model)
        self.dropout = nn.Dropout(dropout)
        
        # Activation function
        if activation == "gelu":
            self.activation = nn.GELU()
        elif activation == "relu":
            self.activation = nn.ReLU()
        elif activation == "swish":
            self.activation = nn.SiLU()
        else:
            self.activation = nn.GELU()
        
        # Expert statistics for monitoring
        self.register_buffer('usage_count', torch.zeros(1))
        self.register_buffer('total_tokens', torch.zeros(1))
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through expert
        
        Args:
            x: [batch_size, seq_len, d_model] or [num_tokens, d_model]
        """
        # Update usage statistics
        if self.training:
            self.usage_count += 1
            self.total_tokens += x.shape[0] if x.dim() == 2 else x.shape[0] * x.shape[1]
        
        # FFN computation
        hidden = self.w1(x)
        hidden = self.activation(hidden)
        hidden = self.dropout(hidden)
        output = self.w2(hidden)
        
        return output
    
    def get_usage_stats(self) -> Dict[str, float]:
        """Get expert usage statistics"""
        return {
            'expert_id': self.expert_id,
            'specialty': self.specialty,
            'usage_count': self.usage_count.item(),
            'total_tokens': self.total_tokens.item(),
            'avg_tokens_per_call': self.total_tokens.item() / max(1, self.usage_count.item())
        }

class RouterNetwork(nn.Module):
    """
    Router network for expert selection
    """
    
    def __init__(
        self,
        d_model: int,
        num_experts: int,
        top_k: int = 2,
        router_bias: bool = False,
        temperature: float = 1.0,
        add_noise: bool = True,
        noise_std: float = 0.1
    ):
        super().__init__()
        
        self.d_model = d_model
        self.num_experts = num_experts
        self.top_k = top_k
        self.temperature = temperature
        self.add_noise = add_noise
        self.noise_std = noise_std
        
        # Router linear layer
        self.router = nn.Linear(d_model, num_experts, bias=router_bias)
        
        # Initialize router weights
        nn.init.normal_(self.router.weight, mean=0.0, std=0.02)
        
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Route tokens to experts
        
        Args:
            x: [batch_size, seq_len, d_model] or [num_tokens, d_model]
            
        Returns:
            expert_weights: [num_tokens, top_k] - weights for selected experts
            expert_indices: [num_tokens, top_k] - indices of selected experts
            router_logits: [num_tokens, num_experts] - raw router logits
        """
        
        original_shape = x.shape
        if x.dim() == 3:
            x = x.view(-1, x.shape[-1])  # [batch_size * seq_len, d_model]
        
        # Compute router logits
        router_logits = self.router(x)  # [num_tokens, num_experts]
        
        # Add noise during training for better load balancing
        if self.training and self.add_noise:
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
            router_logits = router_logits + noise
        
        # Apply temperature scaling
        router_logits = router_logits / self.temperature
        
        # Get top-k experts
        top_k_logits, top_k_indices = torch.topk(router_logits, self.top_k, dim=-1)
        
        # Compute expert weights (softmax over top-k)
        expert_weights = F.softmax(top_k_logits, dim=-1)
        
        return expert_weights, top_k_indices, router_logits

class RomanianDomainExperts(nn.Module):
    """
    Romanian language domain-specific experts
    """
    
    def __init__(self, d_model: int, d_ff: int):
        super().__init__()
        
        # Define Romanian domain experts
        self.experts = nn.ModuleDict({
            'grammar': ExpertFFN(d_model, d_ff, expert_id=0, specialty='romanian_grammar'),
            'literature': ExpertFFN(d_model, d_ff, expert_id=1, specialty='romanian_literature'),
            'history': ExpertFFN(d_model, d_ff, expert_id=2, specialty='romanian_history'),
            'culture': ExpertFFN(d_model, d_ff, expert_id=3, specialty='romanian_culture'),
            'business': ExpertFFN(d_model, d_ff, expert_id=4, specialty='romanian_business'),
            'technical': ExpertFFN(d_model, d_ff, expert_id=5, specialty='technical_romanian'),
            'colloquial': ExpertFFN(d_model, d_ff, expert_id=6, specialty='colloquial_romanian'),
            'formal': ExpertFFN(d_model, d_ff, expert_id=7, specialty='formal_romanian')
        })
        
        self.expert_names = list(self.experts.keys())
        self.num_experts = len(self.experts)
    
    def forward(self, x: torch.Tensor, expert_indices: torch.Tensor) -> torch.Tensor:
        """
        Forward through selected experts
        
        Args:
            x: [num_tokens, d_model]
            expert_indices: [num_tokens, top_k]
        """
        outputs = []
        expert_list = list(self.experts.values())
        
        for i, expert in enumerate(expert_list):
            # Create mask for tokens assigned to this expert
            mask = (expert_indices == i).any(dim=-1)
            
            if mask.any():
                expert_input = x[mask]
                expert_output = expert(expert_input)
                outputs.append((mask, expert_output))
            else:
                outputs.append((mask, None))
        
        return outputs

class MixtureOfExperts(nn.Module):
    """
    Complete Mixture of Experts layer
    """
    
    def __init__(
        self,
        d_model: int,
        num_experts: int = 8,
        d_ff: int = None,
        top_k: int = 2,
        router_bias: bool = False,
        expert_dropout: float = 0.1,
        load_balancing_weight: float = 0.01,
        use_romanian_experts: bool = True
    ):
        super().__init__()
        
        self.d_model = d_model
        self.num_experts = num_experts
        self.d_ff = d_ff or 4 * d_model
        self.top_k = top_k
        self.load_balancing_weight = load_balancing_weight
        self.use_romanian_experts = use_romanian_experts
        
        # Router network
        self.router = RouterNetwork(
            d_model=d_model,
            num_experts=num_experts,
            top_k=top_k,
            router_bias=router_bias
        )
        
        # Experts
        if use_romanian_experts and num_experts == 8:
            self.experts = RomanianDomainExperts(d_model, self.d_ff)
        else:
            self.experts = nn.ModuleList([
                ExpertFFN(
                    d_model=d_model,
                    d_ff=self.d_ff,
                    dropout=expert_dropout,
                    expert_id=i,
                    specialty=f'expert_{i}'
                )
                for i in range(num_experts)
            ])
        
        # Layer normalization
        self.norm = nn.LayerNorm(d_model)
        
        # Load balancing loss tracking
        self.register_buffer('total_tokens_processed', torch.zeros(1))
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
        """
        Forward pass through MoE layer
        
        Args:
            x: [batch_size, seq_len, d_model]
            
        Returns:
            output: [batch_size, seq_len, d_model]
            aux_loss_dict: Dictionary containing auxiliary losses
        """
        
        original_shape = x.shape
        residual = x
        
        # Normalize input
        x = self.norm(x)
        
        # Flatten for expert routing
        x_flat = x.view(-1, x.shape[-1])  # [batch_size * seq_len, d_model]
        num_tokens = x_flat.shape[0]
        
        # Route to experts
        expert_weights, expert_indices, router_logits = self.router(x_flat)
        
        # Initialize output
        output = torch.zeros_like(x_flat)
        
        # Process through experts
        if self.use_romanian_experts and isinstance(self.experts, RomanianDomainExperts):
            expert_outputs = self.experts(x_flat, expert_indices)
            
            # Combine expert outputs
            for i, (mask, expert_output) in enumerate(expert_outputs):
                if expert_output is not None:
                    # Find tokens routed to this expert
                    expert_mask = (expert_indices == i)
                    weights = expert_weights[expert_mask]
                    
                    # Weighted combination
                    if weights.numel() > 0:
                        weighted_output = expert_output * weights.sum(dim=-1, keepdim=True)
                        output[mask] += weighted_output
        else:
            # Standard experts processing
            for i, expert in enumerate(self.experts):
                # Find tokens routed to this expert
                expert_mask = (expert_indices == i).any(dim=-1)
                
                if expert_mask.any():
                    expert_input = x_flat[expert_mask]
                    expert_output = expert(expert_input)
                    
                    # Get weights for this expert
                    token_expert_weights = expert_weights[expert_mask]
                    expert_weights_for_expert = token_expert_weights[expert_indices[expert_mask] == i]
                    
                    # Weighted combination
                    weighted_output = expert_output * expert_weights_for_expert.sum(dim=-1, keepdim=True)
                    output[expert_mask] += weighted_output
        
        # Reshape output
        output = output.view(original_shape)
        
        # Add residual connection
        output = residual + output
        
        # Compute auxiliary losses
        aux_losses = self._compute_auxiliary_losses(router_logits, expert_indices, num_tokens)
        
        # Update statistics
        if self.training:
            self.total_tokens_processed += num_tokens
        
        return output, aux_losses
    
    def _compute_auxiliary_losses(
        self,
        router_logits: torch.Tensor,
        expert_indices: torch.Tensor,
        num_tokens: int
    ) -> Dict[str, torch.Tensor]:
        """
        Compute auxiliary losses for load balancing
        """
        
        # Router probabilities
        router_probs = F.softmax(router_logits, dim=-1)
        
        # Expert usage frequency
        expert_usage = torch.zeros(self.num_experts, device=router_logits.device)
        for i in range(self.num_experts):
            expert_usage[i] = (expert_indices == i).float().sum()
        
        expert_usage = expert_usage / num_tokens
        
        # Mean router probability for each expert
        mean_router_probs = router_probs.mean(dim=0)
        
        # Load balancing loss (encourages uniform expert usage)
        load_balancing_loss = self.num_experts * torch.sum(mean_router_probs * expert_usage)
        
        # Router entropy (encourages diverse routing)
        router_entropy = -torch.sum(router_probs * torch.log(router_probs + 1e-8), dim=-1).mean()
        
        return {
            'load_balancing_loss': self.load_balancing_weight * load_balancing_loss,
            'router_entropy': router_entropy,
            'expert_usage': expert_usage,
            'mean_router_probs': mean_router_probs
        }
    
    def get_expert_stats(self) -> Dict[str, any]:
        """Get statistics for all experts"""
        stats = {
            'total_tokens_processed': self.total_tokens_processed.item(),
            'num_experts': self.num_experts,
            'top_k': self.top_k,
            'expert_details': []
        }
        
        if isinstance(self.experts, nn.ModuleList):
            for expert in self.experts:
                stats['expert_details'].append(expert.get_usage_stats())
        elif hasattr(self.experts, 'experts'):
            for expert_name, expert in self.experts.experts.items():
                expert_stats = expert.get_usage_stats()
                expert_stats['expert_name'] = expert_name
                stats['expert_details'].append(expert_stats)
        
        return stats

class SparseMoEBlock(nn.Module):
    """
    Complete sparse MoE block with attention and MoE
    """
    
    def __init__(
        self,
        d_model: int,
        num_experts: int = 8,
        d_ff: int = None,
        num_heads: int = 8,
        top_k: int = 2,
        dropout: float = 0.1,
        use_romanian_experts: bool = True
    ):
        super().__init__()
        
        # Multi-head attention
        self.attention = nn.MultiheadAttention(
            embed_dim=d_model,
            num_heads=num_heads,
            dropout=dropout,
            batch_first=True
        )
        self.attn_norm = nn.LayerNorm(d_model)
        
        # Mixture of Experts
        self.moe = MixtureOfExperts(
            d_model=d_model,
            num_experts=num_experts,
            d_ff=d_ff,
            top_k=top_k,
            expert_dropout=dropout,
            use_romanian_experts=use_romanian_experts
        )
        
        self.dropout = nn.Dropout(dropout)
    
    def forward(
        self,
        x: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Dict[str, torch.Tensor]]:
        """
        Forward pass through sparse MoE block
        
        Args:
            x: [batch_size, seq_len, d_model]
            attention_mask: [batch_size, seq_len]
        """
        
        # Self-attention
        residual = x
        x = self.attn_norm(x)
        
        attn_output, _ = self.attention(x, x, x, key_padding_mask=attention_mask)
        attn_output = self.dropout(attn_output)
        x = residual + attn_output
        
        # Mixture of Experts
        moe_output, aux_losses = self.moe(x)
        
        return moe_output, aux_losses

# Example usage and testing
if __name__ == "__main__":
    print("Testing Mixture of Experts implementation...")
    
    # Test parameters
    batch_size = 2
    seq_len = 10
    d_model = 128
    num_experts = 8
    top_k = 2
    
    # Create sample input
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
    
    # Test single expert
    expert = ExpertFFN(d_model, d_model * 4, expert_id=0, specialty='test')
    expert_out = expert(x)
    print(f"Expert output shape: {expert_out.shape}")
    
    # Test router
    router = RouterNetwork(d_model, num_experts, top_k)
    weights, indices, logits = router(x)
    print(f"Router weights shape: {weights.shape}")
    print(f"Router indices shape: {indices.shape}")
    
    # Test Romanian domain experts
    romanian_experts = RomanianDomainExperts(d_model, d_model * 4)
    print(f"Romanian experts: {romanian_experts.expert_names}")
    
    # Test complete MoE
    moe = MixtureOfExperts(
        d_model=d_model,
        num_experts=num_experts,
        top_k=top_k,
        use_romanian_experts=True
    )
    
    output, aux_losses = moe(x)
    print(f"MoE output shape: {output.shape}")
    print(f"Auxiliary losses: {list(aux_losses.keys())}")
    
    # Test sparse MoE block
    sparse_block = SparseMoEBlock(d_model, num_experts, use_romanian_experts=True)
    block_output, block_aux = sparse_block(x)
    print(f"Sparse MoE block output shape: {block_output.shape}")
    
    # Get expert statistics
    stats = moe.get_expert_stats()
    print(f"Expert stats: {stats['num_experts']} experts, {stats['top_k']} top-k")
    
    print("✅ Mixture of Experts implementation test passed!")
