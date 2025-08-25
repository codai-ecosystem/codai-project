"""
RomAI Base Transformer Architecture
Production-grade transformer implementation optimized for Romanian cultural consciousness

This module provides the foundational transformer architecture that will be specialized
for each of the 8 core RomAI engines with Romanian cultural awareness integrated at the
neural architecture level.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import math
from typing import Optional, Tuple, Union, Dict, Any
import logging
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class TransformerConfig:
    """Configuration for RomAI Transformer architectures"""
    # Model dimensions
    vocab_size: int = 50000  # Extended for Romanian diacritics
    d_model: int = 768
    n_heads: int = 12
    n_layers: int = 12
    d_ff: int = 3072
    max_seq_len: int = 2048
    
    # Romanian-specific parameters
    cultural_embedding_dim: int = 128
    enable_cultural_attention: bool = True
    romanian_token_boost: float = 1.1
    
    # Training parameters
    dropout: float = 0.1
    attention_dropout: float = 0.1
    activation: str = 'gelu'
    layer_norm_eps: float = 1e-5
    
    # Optimization
    use_flash_attention: bool = True
    gradient_checkpointing: bool = False
    mixed_precision: bool = True
    
    def __post_init__(self):
        assert self.d_model % self.n_heads == 0, "d_model must be divisible by n_heads"


class CulturallyAwareEmbedding(nn.Module):
    """Romanian culturally-aware token embeddings"""
    
    def __init__(self, config: TransformerConfig):
        super().__init__()
        self.config = config
        
        # Base token embeddings
        self.token_embedding = nn.Embedding(config.vocab_size, config.d_model)
        
        # Position embeddings
        self.position_embedding = nn.Embedding(config.max_seq_len, config.d_model)
        
        # Cultural context embeddings
        self.cultural_embedding = nn.Embedding(1000, config.cultural_embedding_dim)
        self.cultural_projection = nn.Linear(config.cultural_embedding_dim, config.d_model)
        
        # Romanian diacritic boost
        self.romanian_diacritics = {
            'ă': 1, 'â': 2, 'î': 3, 'ș': 4, 'ț': 5
        }
        
        # Layer norm and dropout
        self.layer_norm = nn.LayerNorm(config.d_model, eps=config.layer_norm_eps)
        self.dropout = nn.Dropout(config.dropout)
        
        logger.info("✅ Culturally-aware embeddings initialized")
    
    def forward(self, input_ids: torch.Tensor, cultural_context_ids: Optional[torch.Tensor] = None) -> torch.Tensor:
        batch_size, seq_len = input_ids.shape
        device = input_ids.device
        
        # Base embeddings
        token_embeds = self.token_embedding(input_ids)
        
        # Position embeddings
        position_ids = torch.arange(seq_len, device=device).unsqueeze(0).expand(batch_size, seq_len)
        position_embeds = self.position_embedding(position_ids)
        
        # Cultural context enhancement
        cultural_embeds = torch.zeros_like(token_embeds)
        if cultural_context_ids is not None:
            cultural_raw = self.cultural_embedding(cultural_context_ids)
            cultural_embeds = self.cultural_projection(cultural_raw).unsqueeze(1).expand(-1, seq_len, -1)
        
        # Romanian diacritic boost
        if self.config.romanian_token_boost > 1.0:
            # This would require tokenizer integration in practice
            token_embeds = token_embeds * self.config.romanian_token_boost
        
        # Combine embeddings
        embeddings = token_embeds + position_embeds + cultural_embeds
        embeddings = self.layer_norm(embeddings)
        embeddings = self.dropout(embeddings)
        
        return embeddings


class RomanianMultiHeadAttention(nn.Module):
    """Multi-head attention with Romanian cultural consciousness"""
    
    def __init__(self, config: TransformerConfig):
        super().__init__()
        self.config = config
        self.n_heads = config.n_heads
        self.d_model = config.d_model
        self.d_k = config.d_model // config.n_heads
        
        # Linear projections
        self.w_q = nn.Linear(config.d_model, config.d_model)
        self.w_k = nn.Linear(config.d_model, config.d_model)
        self.w_v = nn.Linear(config.d_model, config.d_model)
        self.w_o = nn.Linear(config.d_model, config.d_model)
        
        # Cultural attention mechanism
        if config.enable_cultural_attention:
            self.cultural_attention_gate = nn.Linear(config.d_model, config.n_heads)
            self.cultural_bias = nn.Parameter(torch.zeros(config.n_heads, config.max_seq_len, config.max_seq_len))
        
        self.attention_dropout = nn.Dropout(config.attention_dropout)
        self.scale = math.sqrt(self.d_k)
        
        logger.info("✅ Romanian multi-head attention initialized")
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None, 
                cultural_attention_bias: Optional[torch.Tensor] = None) -> Tuple[torch.Tensor, torch.Tensor]:
        batch_size, seq_len, d_model = x.shape
        
        # Project to Q, K, V
        Q = self.w_q(x).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        K = self.w_k(x).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        V = self.w_v(x).view(batch_size, seq_len, self.n_heads, self.d_k).transpose(1, 2)
        
        # Scaled dot-product attention
        attention_scores = torch.matmul(Q, K.transpose(-2, -1)) / self.scale
        
        # Apply cultural attention enhancement
        if self.config.enable_cultural_attention and hasattr(self, 'cultural_attention_gate'):
            cultural_gate = torch.sigmoid(self.cultural_attention_gate(x))  # [batch, seq, heads]
            cultural_gate = cultural_gate.transpose(1, 2).unsqueeze(-1)  # [batch, heads, seq, 1]
            
            # Add cultural bias
            cultural_bias_expanded = self.cultural_bias[:, :seq_len, :seq_len].unsqueeze(0)
            attention_scores = attention_scores + cultural_gate * cultural_bias_expanded
        
        # Apply mask if provided
        if mask is not None:
            attention_scores = attention_scores.masked_fill(mask == 0, float('-inf'))
        
        # Softmax and dropout
        attention_weights = F.softmax(attention_scores, dim=-1)
        attention_weights = self.attention_dropout(attention_weights)
        
        # Apply attention to values
        attention_output = torch.matmul(attention_weights, V)
        attention_output = attention_output.transpose(1, 2).contiguous().view(batch_size, seq_len, d_model)
        
        # Final projection
        output = self.w_o(attention_output)
        
        return output, attention_weights


class RomanianTransformerBlock(nn.Module):
    """Transformer block optimized for Romanian processing"""
    
    def __init__(self, config: TransformerConfig):
        super().__init__()
        self.config = config
        
        # Multi-head attention
        self.attention = RomanianMultiHeadAttention(config)
        self.attention_norm = nn.LayerNorm(config.d_model, eps=config.layer_norm_eps)
        
        # Feed-forward network
        self.ff1 = nn.Linear(config.d_model, config.d_ff)
        self.ff2 = nn.Linear(config.d_ff, config.d_model)
        self.ff_norm = nn.LayerNorm(config.d_model, eps=config.layer_norm_eps)
        
        # Activation function
        if config.activation == 'gelu':
            self.activation = nn.GELU()
        elif config.activation == 'relu':
            self.activation = nn.ReLU()
        else:
            self.activation = nn.SiLU()  # Swish
        
        self.dropout = nn.Dropout(config.dropout)
        
        # Cultural enhancement layer
        self.cultural_enhancement = nn.Sequential(
            nn.Linear(config.d_model, config.d_model // 2),
            nn.GELU(),
            nn.Linear(config.d_model // 2, config.d_model),
            nn.Sigmoid()
        )
        
        logger.info("✅ Romanian transformer block initialized")
    
    def forward(self, x: torch.Tensor, mask: Optional[torch.Tensor] = None) -> torch.Tensor:
        # Multi-head attention with residual connection
        attention_output, attention_weights = self.attention(x, mask)
        x = self.attention_norm(x + self.dropout(attention_output))
        
        # Feed-forward with residual connection
        ff_output = self.ff2(self.dropout(self.activation(self.ff1(x))))
        x = self.ff_norm(x + self.dropout(ff_output))
        
        # Cultural enhancement
        if self.config.enable_cultural_attention:
            cultural_gate = self.cultural_enhancement(x)
            x = x * (1 + cultural_gate * 0.1)  # Subtle enhancement
        
        return x


class RomAIBaseTransformer(nn.Module):
    """
    Production-grade base transformer for RomAI engines
    Optimized for Romanian cultural consciousness and high performance
    """
    
    def __init__(self, config: TransformerConfig):
        super().__init__()
        self.config = config
        
        # Embeddings
        self.embeddings = CulturallyAwareEmbedding(config)
        
        # Transformer layers
        self.layers = nn.ModuleList([
            RomanianTransformerBlock(config) for _ in range(config.n_layers)
        ])
        
        # Final layer norm
        self.final_norm = nn.LayerNorm(config.d_model, eps=config.layer_norm_eps)
        
        # Initialize weights
        self.apply(self._init_weights)
        
        # Calculate model parameters
        self.num_parameters = sum(p.numel() for p in self.parameters() if p.requires_grad)
        
        logger.info(f"🧠 RomAI Base Transformer initialized")
        logger.info(f"   Model parameters: {self.num_parameters:,}")
        logger.info(f"   Cultural awareness: {'✅ Enabled' if config.enable_cultural_attention else '❌ Disabled'}")
        logger.info(f"   Romanian optimization: {'✅ Enabled' if config.romanian_token_boost > 1.0 else '❌ Disabled'}")
    
    def _init_weights(self, module):
        """Initialize weights using best practices for transformers"""
        if isinstance(module, nn.Linear):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
            if module.bias is not None:
                torch.nn.init.zeros_(module.bias)
        elif isinstance(module, nn.Embedding):
            torch.nn.init.normal_(module.weight, mean=0.0, std=0.02)
        elif isinstance(module, nn.LayerNorm):
            torch.nn.init.zeros_(module.bias)
            torch.nn.init.ones_(module.weight)
    
    def forward(self, input_ids: torch.Tensor, 
                attention_mask: Optional[torch.Tensor] = None,
                cultural_context_ids: Optional[torch.Tensor] = None) -> Dict[str, torch.Tensor]:
        
        # Input embeddings
        hidden_states = self.embeddings(input_ids, cultural_context_ids)
        
        # Process through transformer layers
        all_hidden_states = []
        for layer in self.layers:
            if self.config.gradient_checkpointing and self.training:
                hidden_states = torch.utils.checkpoint.checkpoint(layer, hidden_states, attention_mask)
            else:
                hidden_states = layer(hidden_states, attention_mask)
            all_hidden_states.append(hidden_states)
        
        # Final normalization
        hidden_states = self.final_norm(hidden_states)
        
        return {
            'last_hidden_state': hidden_states,
            'hidden_states': all_hidden_states if len(all_hidden_states) > 1 else None,
            'embeddings': self.embeddings.token_embedding.weight
        }
    
    def get_cultural_representation(self, text_representation: torch.Tensor) -> torch.Tensor:
        """Extract cultural representation from text representation"""
        # This can be used by specialized engines to understand cultural context
        cultural_features = torch.mean(text_representation, dim=1)  # Global pooling
        return cultural_features
    
    def resize_token_embeddings(self, new_vocab_size: int):
        """Resize token embeddings for different vocabularies"""
        old_embeddings = self.embeddings.token_embedding
        new_embeddings = nn.Embedding(new_vocab_size, self.config.d_model)
        
        # Copy existing weights
        min_vocab_size = min(self.config.vocab_size, new_vocab_size)
        new_embeddings.weight.data[:min_vocab_size] = old_embeddings.weight.data[:min_vocab_size]
        
        self.embeddings.token_embedding = new_embeddings
        self.config.vocab_size = new_vocab_size
        
        logger.info(f"🔄 Token embeddings resized to {new_vocab_size}")
    
    def get_memory_usage(self) -> Dict[str, float]:
        """Calculate memory usage statistics"""
        param_memory = sum(p.numel() * p.element_size() for p in self.parameters()) / (1024**2)
        buffer_memory = sum(b.numel() * b.element_size() for b in self.buffers()) / (1024**2)
        
        return {
            'parameter_memory_mb': param_memory,
            'buffer_memory_mb': buffer_memory,
            'total_memory_mb': param_memory + buffer_memory,
            'num_parameters': self.num_parameters
        }


def create_attention_mask(seq_len: int, device: torch.device) -> torch.Tensor:
    """Create causal attention mask for transformer"""
    mask = torch.tril(torch.ones((seq_len, seq_len), device=device))
    return mask.unsqueeze(0).unsqueeze(0)


def create_romanian_config(engine_type: str = "base") -> TransformerConfig:
    """Create optimized configuration for different RomAI engines"""
    
    base_config = TransformerConfig(
        vocab_size=50000,
        d_model=768,
        n_heads=12,
        n_layers=12,
        enable_cultural_attention=True,
        romanian_token_boost=1.1
    )
    
    # Engine-specific optimizations
    if engine_type == "memory":
        base_config.d_model = 1024
        base_config.n_layers = 16
        base_config.max_seq_len = 4096
        base_config.cultural_embedding_dim = 256
    elif engine_type == "reasoning":
        base_config.d_model = 1024
        base_config.n_layers = 24
        base_config.d_ff = 4096
        base_config.attention_dropout = 0.05
    elif engine_type == "learning":
        base_config.gradient_checkpointing = True
        base_config.mixed_precision = True
        base_config.dropout = 0.15
    elif engine_type == "emotional":
        base_config.cultural_embedding_dim = 512
        base_config.enable_cultural_attention = True
        base_config.romanian_token_boost = 1.2
    elif engine_type == "code_generation":
        base_config.vocab_size = 60000  # Extended for code tokens
        base_config.max_seq_len = 8192
        base_config.d_model = 1024
    elif engine_type == "multimodal":
        base_config.d_model = 1536  # Larger for multi-modal fusion
        base_config.n_heads = 24
        base_config.cultural_embedding_dim = 384
    elif engine_type == "neural_symbolic":
        base_config.n_layers = 18
        base_config.d_ff = 4096
        base_config.max_seq_len = 3072
    
    return base_config


# Example usage and testing
if __name__ == "__main__":
    # Test basic functionality
    config = create_romanian_config("base")
    model = RomAIBaseTransformer(config)
    
    # Test forward pass
    batch_size, seq_len = 2, 128
    input_ids = torch.randint(0, config.vocab_size, (batch_size, seq_len))
    cultural_context_ids = torch.randint(0, 100, (batch_size,))
    
    with torch.no_grad():
        outputs = model(input_ids, cultural_context_ids=cultural_context_ids)
    
    memory_stats = model.get_memory_usage()
    
    print("🧠 RomAI Base Transformer Test Results:")
    print(f"   Input shape: {input_ids.shape}")
    print(f"   Output shape: {outputs['last_hidden_state'].shape}")
    print(f"   Memory usage: {memory_stats['total_memory_mb']:.2f} MB")
    print(f"   Parameters: {memory_stats['num_parameters']:,}")
    print("✅ Base transformer test completed successfully!")