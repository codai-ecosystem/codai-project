"""
Simplified Advanced Transformer Architecture for immediate validation
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class ModelScale(Enum):
    """Model scale configurations"""
    SMALL = "small"
    MEDIUM = "medium"    
    LARGE = "large"
    PHASE1 = "phase1"  # 5B parameters for Phase 1 scaling

@dataclass
class SimpleTransformerConfig:
    """Simplified configuration for validation"""
    
    scale: ModelScale = ModelScale.SMALL
    vocab_size: int = 50000
    d_model: int = 1024
    n_layers: int = 12
    n_heads: int = 16
    d_ff: int = 4096
    max_seq_length: int = 2048
    dropout: float = 0.1
    use_moe: bool = True
    num_experts: int = 8
    num_experts_per_tok: int = 2
    
    def __post_init__(self):
        if self.scale == ModelScale.SMALL:
            self.d_model = 512
            self.n_layers = 6
            self.n_heads = 8
            self.d_ff = 2048
            self.num_experts = 4
        elif self.scale == ModelScale.MEDIUM:
            self.d_model = 1024
            self.n_layers = 12
            self.n_heads = 16
            self.d_ff = 4096
            self.num_experts = 8
        elif self.scale == ModelScale.LARGE:
            self.d_model = 2048
            self.n_layers = 24
            self.n_heads = 32
            self.d_ff = 8192
            self.num_experts = 16
        elif self.scale == ModelScale.PHASE1:
            # Phase 1: 5B parameter configuration (5.2x scaling from 958M)
            self.d_model = 1280   # Balanced model dimension for 5B target
            self.n_layers = 18    # Optimal layer count
            self.n_heads = 20     # More attention heads 
            self.d_ff = 5120      # Balanced feed-forward
            self.num_experts = 10 # Balanced expert count
            self.max_seq_length = 4096  # Longer context
        
        assert self.d_model % self.n_heads == 0
        self.head_dim = self.d_model // self.n_heads
    
    def calculate_parameters(self) -> Dict[str, int]:
        """Calculate total parameters for this configuration"""
        # Embedding layers
        token_embed = self.vocab_size * self.d_model
        pos_embed = self.max_seq_length * self.d_model
        
        # Attention parameters per layer
        attention_per_layer = 4 * (self.d_model * self.d_model)  # Q, K, V, O projections
        
        # Feed-forward parameters per layer (with MoE)
        if self.use_moe:
            # Each expert has 2 linear layers
            ff_per_expert = 2 * (self.d_model * self.d_ff + self.d_ff * self.d_model)
            ff_per_layer = ff_per_expert * self.num_experts
            # Add gating network
            ff_per_layer += self.d_model * self.num_experts
        else:
            ff_per_layer = 2 * (self.d_model * self.d_ff + self.d_ff * self.d_model)
        
        # Layer norm parameters per layer (2 layer norms per transformer layer)
        ln_per_layer = 2 * self.d_model
        
        # Total per layer
        params_per_layer = attention_per_layer + ff_per_layer + ln_per_layer
        
        # Total parameters
        total_layers_params = params_per_layer * self.n_layers
        total_embed_params = token_embed + pos_embed
        
        # Output projection (typically tied with token embedding, but count separately)
        output_proj = self.vocab_size * self.d_model
        
        total_params = total_embed_params + total_layers_params + output_proj
        
        return {
            'total_parameters': total_params,
            'embedding_parameters': total_embed_params,
            'layer_parameters': total_layers_params,
            'parameters_per_layer': params_per_layer,
            'attention_per_layer': attention_per_layer,
            'feedforward_per_layer': ff_per_layer,
            'scale': self.scale.value
        }

class SimpleAttention(nn.Module):
    """Simplified multi-head attention without RoPE"""
    
    def __init__(self, config: SimpleTransformerConfig):
        super().__init__()
        self.config = config
        self.n_heads = config.n_heads
        self.head_dim = config.head_dim
        
        self.q_proj = nn.Linear(config.d_model, config.d_model, bias=False)
        self.k_proj = nn.Linear(config.d_model, config.d_model, bias=False)
        self.v_proj = nn.Linear(config.d_model, config.d_model, bias=False)
        self.o_proj = nn.Linear(config.d_model, config.d_model, bias=False)
        
        self.dropout = nn.Dropout(config.dropout)
        self.scale = 1.0 / math.sqrt(config.head_dim)
    
    def forward(self, x: torch.Tensor, attention_mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        batch_size, seq_len, d_model = x.shape
        
        # Project to Q, K, V
        q = self.q_proj(x).view(batch_size, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        k = self.k_proj(x).view(batch_size, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        v = self.v_proj(x).view(batch_size, seq_len, self.n_heads, self.head_dim).transpose(1, 2)
        
        # Attention computation
        attn_weights = torch.matmul(q, k.transpose(-2, -1)) * self.scale
        
        if attention_mask is not None:
            attn_weights = attn_weights + attention_mask
        
        attn_weights = F.softmax(attn_weights, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        # Apply attention to values
        attn_output = torch.matmul(attn_weights, v)
        attn_output = attn_output.transpose(1, 2).contiguous().view(batch_size, seq_len, d_model)
        
        return self.o_proj(attn_output)

class SimpleMoE(nn.Module):
    """Simplified Mixture of Experts"""
    
    def __init__(self, config: SimpleTransformerConfig):
        super().__init__()
        self.config = config
        self.num_experts = config.num_experts
        self.num_experts_per_tok = config.num_experts_per_tok
        
        # Router
        self.gate = nn.Linear(config.d_model, config.num_experts, bias=False)
        
        # Experts
        self.experts = nn.ModuleList([
            nn.Sequential(
                nn.Linear(config.d_model, config.d_ff),
                nn.ReLU(),
                nn.Linear(config.d_ff, config.d_model)
            ) for _ in range(config.num_experts)
        ])
    
    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        batch_size, seq_len, d_model = x.shape
        x_flat = x.view(-1, d_model)
        
        # Router
        router_logits = self.gate(x_flat)
        router_probs = F.softmax(router_logits, dim=-1)
        
        # Top-k selection
        top_k_probs, top_k_indices = torch.topk(router_probs, self.num_experts_per_tok, dim=-1)
        top_k_probs = top_k_probs / top_k_probs.sum(dim=-1, keepdim=True)
        
        # Expert computation (simplified)
        output = torch.zeros_like(x_flat)
        for i in range(self.num_experts_per_tok):
            expert_idx = top_k_indices[:, i]
            prob = top_k_probs[:, i:i+1]
            
            for expert_id in range(self.num_experts):
                mask = (expert_idx == expert_id)
                if mask.any():
                    expert_input = x_flat[mask]
                    expert_output = self.experts[expert_id](expert_input)
                    output[mask] += prob[mask] * expert_output
        
        aux_loss = torch.tensor(0.0, device=x.device)  # Simplified
        return output.view(batch_size, seq_len, d_model), aux_loss

class SimpleTransformerLayer(nn.Module):
    """Simplified Transformer Layer"""
    
    def __init__(self, config: SimpleTransformerConfig):
        super().__init__()
        self.config = config
        
        # Normalization
        self.input_layernorm = nn.LayerNorm(config.d_model)
        self.post_attention_layernorm = nn.LayerNorm(config.d_model)
        
        # Attention
        self.self_attn = SimpleAttention(config)
        
        # MLP/MoE
        if config.use_moe:
            self.mlp = SimpleMoE(config)
        else:
            self.mlp = nn.Sequential(
                nn.Linear(config.d_model, config.d_ff),
                nn.ReLU(),
                nn.Linear(config.d_ff, config.d_model)
            )
        
        self.dropout = nn.Dropout(config.dropout)
    
    def forward(self, hidden_states: torch.Tensor, attention_mask: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        # Self-attention with residual
        residual = hidden_states
        hidden_states = self.input_layernorm(hidden_states)
        attn_output = self.self_attn(hidden_states, attention_mask)
        hidden_states = residual + self.dropout(attn_output)
        
        # MLP/MoE with residual
        residual = hidden_states
        hidden_states = self.post_attention_layernorm(hidden_states)
        
        if self.config.use_moe:
            mlp_output, aux_loss = self.mlp(hidden_states)
        else:
            mlp_output = self.mlp(hidden_states)
            aux_loss = torch.tensor(0.0, device=hidden_states.device)
        
        hidden_states = residual + self.dropout(mlp_output)
        
        return hidden_states, aux_loss

class SimpleAdvancedTransformer(nn.Module):
    """Simplified Advanced Transformer for validation"""
    
    def __init__(self, config: SimpleTransformerConfig):
        super().__init__()
        self.config = config
        
        # Embeddings
        self.embed_tokens = nn.Embedding(config.vocab_size, config.d_model)
        
        # Layers
        self.layers = nn.ModuleList([
            SimpleTransformerLayer(config) for _ in range(config.n_layers)
        ])
        
        # Final norm and head
        self.norm = nn.LayerNorm(config.d_model)
        self.lm_head = nn.Linear(config.d_model, config.vocab_size, bias=False)
        
        # Parameter count
        self.param_count = sum(p.numel() for p in self.parameters())
        
        self.apply(self._init_weights)
        logger.info(f"🧠 Simple Advanced Transformer initialized with {self.param_count:,} parameters")
    
    def _init_weights(self, module):
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
    
    def forward(self, input_ids: torch.Tensor, attention_mask: Optional[torch.Tensor] = None) -> Dict[str, Any]:
        # Embeddings
        hidden_states = self.embed_tokens(input_ids)
        
        # Process through layers
        total_aux_loss = torch.tensor(0.0, device=hidden_states.device)
        
        for layer in self.layers:
            hidden_states, aux_loss = layer(hidden_states, attention_mask)
            total_aux_loss += aux_loss
        
        # Final processing
        hidden_states = self.norm(hidden_states)
        logits = self.lm_head(hidden_states)
        
        return {
            'logits': logits,
            'hidden_states': hidden_states,
            'aux_loss': total_aux_loss,
            'parameter_count': self.param_count
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            'architecture': 'Simple Advanced Transformer',
            'scale': self.config.scale.value,
            'total_parameters': f"{self.param_count:,}",
            'parameter_size_gb': f"{self.param_count * 4 / 1e9:.2f}",
            'layers': self.config.n_layers,
            'attention_heads': self.config.n_heads,
            'hidden_size': self.config.d_model,
            'intermediate_size': self.config.d_ff,
            'vocab_size': self.config.vocab_size,
            'features': {
                'mixture_of_experts': self.config.use_moe,
                'num_experts': self.config.num_experts if self.config.use_moe else 0
            }
        }

def create_simple_advanced_transformer(scale: ModelScale = ModelScale.SMALL) -> SimpleAdvancedTransformer:
    """Create a simplified advanced transformer for validation"""
    config = SimpleTransformerConfig(scale=scale)
    return SimpleAdvancedTransformer(config)

def test_simple_transformer():
    """Test the simplified advanced transformer"""
    print("🔍 Testing Simple Advanced Transformer")
    print("=" * 50)
    
    try:
        # Test different scales
        for scale in [ModelScale.SMALL, ModelScale.MEDIUM]:
            print(f"\n🧠 Testing {scale.value.upper()} model...")
            
            model = create_simple_advanced_transformer(scale=scale)
            
            # Forward pass test
            batch_size, seq_len = 2, 32
            input_ids = torch.randint(0, 1000, (batch_size, seq_len))
            
            with torch.no_grad():
                outputs = model(input_ids)
                
                print(f"✅ Forward pass successful")
                print(f"   Parameters: {outputs['parameter_count']:,}")
                print(f"   Input shape: {input_ids.shape}")
                print(f"   Output shape: {outputs['logits'].shape}")
                print(f"   Aux loss: {outputs['aux_loss'].item():.6f}")
            
            # Model info test
            info = model.get_model_info()
            print(f"✅ Model info: {info['total_parameters']} parameters, {info['parameter_size_gb']} GB")
        
        print("\n🎯 All tests PASSED!")
        print("✅ Simple Advanced Transformer validation successful!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    test_simple_transformer()