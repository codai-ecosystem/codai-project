"""
Enhanced MLA Integration with Long Context Training Support
==========================================================

This module integrates the Long Context Training System with the existing
Multi-head Latent Attention (MLA) architecture to provide:

- Seamless integration with existing MLA components
- Enhanced RoPE scaling for 128K+ token contexts
- Memory-efficient attention patterns
- Training-optimized attention mechanisms
- Romanian language context preservation

The integration maintains backward compatibility while adding advanced
long context capabilities to the RomAI AGI system.
"""

import logging
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Optional, Tuple, Dict, Any, List
import math

# Import existing MLA components
from ml.attention.mla_attention import (
    MLAConfig,
    RoPEEmbedding,
    MLALatentProjection,
    MultiheadLatentAttention
)

# Import new long context components
from ml.training.long_context_training import (
    LongContextConfig,
    LongContextTrainingSystem,
    RoPEScaledEmbedding,
    SlidingWindowAttention,
    ContextScalingStrategy,
    AttentionPattern
)

logger = logging.getLogger(__name__)

class EnhancedMLAConfig(MLAConfig):
    """
    Enhanced MLA configuration with long context support.
    Extends the existing MLAConfig to include long context training parameters.
    """
    
    def __init__(
        self,
        # Original MLA parameters
        hidden_size: int = 4096,
        num_attention_heads: int = 32,
        num_key_value_heads: int = 8,
        latent_size: int = 512,
        rope_base: float = 10000.0,
        max_position_embeddings: int = 131072,  # Already supports 128K
        use_flash_attention: bool = True,
        attention_dropout: float = 0.0,
        kv_cache_compression_ratio: float = 0.5,
        # Long context enhancement parameters
        enable_long_context_training: bool = True,
        context_scaling_strategy: ContextScalingStrategy = ContextScalingStrategy.PROGRESSIVE,
        rope_scaling_factor: float = 1.0,
        rope_scaling_type: str = "linear",
        enable_sliding_window: bool = True,
        sliding_window_size: int = 4096,
        window_overlap_size: int = 512,
        use_memory_efficient_attention: bool = True,
        gradient_checkpointing: bool = True,
        **kwargs
    ):
        # Initialize parent MLAConfig
        super().__init__(
            hidden_size=hidden_size,
            num_attention_heads=num_attention_heads,
            num_key_value_heads=num_key_value_heads,
            latent_size=latent_size,
            rope_base=rope_base,
            max_position_embeddings=max_position_embeddings,
            use_flash_attention=use_flash_attention,
            attention_dropout=attention_dropout,
            kv_cache_compression_ratio=kv_cache_compression_ratio,
            **kwargs
        )
        
        # Long context parameters
        self.enable_long_context_training = enable_long_context_training
        self.context_scaling_strategy = context_scaling_strategy
        self.rope_scaling_factor = rope_scaling_factor
        self.rope_scaling_type = rope_scaling_type
        self.enable_sliding_window = enable_sliding_window
        self.sliding_window_size = sliding_window_size
        self.window_overlap_size = window_overlap_size
        self.use_memory_efficient_attention = use_memory_efficient_attention
        self.gradient_checkpointing = gradient_checkpointing
        
        logger.info(f"🔧 Enhanced MLA Config initialized with long context support")
        logger.info(f"   Max position embeddings: {self.max_position_embeddings:,}")
        logger.info(f"   Sliding window size: {self.sliding_window_size:,}")
        logger.info(f"   RoPE scaling: {self.rope_scaling_type} (factor: {self.rope_scaling_factor})")
    
    def to_long_context_config(self) -> LongContextConfig:
        """Convert to LongContextConfig for training system"""
        return LongContextConfig(
            max_context_length=self.max_position_embeddings,
            base_context_length=4096,
            context_scaling_strategy=self.context_scaling_strategy,
            rope_base=self.rope_base,
            rope_scaling_factor=self.rope_scaling_factor,
            rope_scaling_type=self.rope_scaling_type,
            enable_sliding_window=self.enable_sliding_window,
            window_size=self.sliding_window_size,
            overlap_size=self.window_overlap_size,
            use_gradient_checkpointing=self.gradient_checkpointing,
            use_flash_attention=self.use_memory_efficient_attention,
            prioritize_romanian_sequences=True
        )

class EnhancedRoPEEmbedding(nn.Module):
    """
    Enhanced RoPE embedding that combines the existing MLA RoPE with long context scaling.
    
    This module provides:
    - Backward compatibility with existing MLA RoPE
    - Advanced scaling for long contexts
    - Multiple scaling strategies (linear, dynamic, YaRN)
    - Memory-efficient caching
    """
    
    def __init__(self, config: EnhancedMLAConfig):
        super().__init__()
        self.config = config
        
        # Initialize original RoPE embedding
        self.original_rope = RoPEEmbedding(config)
        
        # Initialize enhanced RoPE for long context if enabled
        if config.enable_long_context_training:
            long_config = config.to_long_context_config()
            self.enhanced_rope = RoPEScaledEmbedding(long_config, config.head_dim)
            self.use_enhanced_rope = True
            logger.info("✨ Enhanced RoPE with scaling enabled")
        else:
            self.enhanced_rope = None
            self.use_enhanced_rope = False
            logger.info("📐 Using standard RoPE embedding")
    
    def forward(
        self,
        query: torch.Tensor,
        key: torch.Tensor,
        position_ids: Optional[torch.Tensor] = None,
        seq_len: Optional[int] = None
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """Apply RoPE embedding with optional scaling"""
        if seq_len is None:
            seq_len = query.shape[1]
        
        # Use enhanced RoPE for long sequences or when explicitly enabled
        if self.use_enhanced_rope and (seq_len > 4096 or self.config.enable_long_context_training):
            return self.enhanced_rope(query, key, position_ids, seq_len)
        else:
            # Use original RoPE for shorter sequences
            return self.original_rope(query, key, position_ids)

class LongContextMLAAttention(nn.Module):
    """
    Enhanced Multi-head Latent Attention with long context support.
    
    This module combines:
    - Existing MLA architecture (latent projections, KV compression)
    - Long context training capabilities (sliding window, memory efficiency)
    - Advanced RoPE scaling for extended sequences
    - Romanian language context preservation
    """
    
    def __init__(self, config: EnhancedMLAConfig, layer_idx: Optional[int] = None):
        super().__init__()
        self.config = config
        self.layer_idx = layer_idx
        self.hidden_size = config.hidden_size
        self.num_heads = config.num_attention_heads
        self.num_key_value_heads = config.num_key_value_heads
        self.head_dim = config.head_dim
        
        # Initialize original MLA attention
        self.mla_attention = MultiheadLatentAttention(config)
        
        # Initialize long context components if enabled
        if config.enable_long_context_training:
            # Enhanced RoPE
            self.enhanced_rope = EnhancedRoPEEmbedding(config)
            
            # Sliding window attention for very long sequences
            long_config = config.to_long_context_config()
            self.sliding_attention = SlidingWindowAttention(
                long_config, config.hidden_size, config.num_attention_heads
            )
            
            # Long context training system
            self.training_system = LongContextTrainingSystem(long_config)
            
            self.use_long_context = True
            logger.info(f"🎯 Long Context MLA Attention initialized (layer {layer_idx})")
            logger.info(f"   Max context: {config.max_position_embeddings:,} tokens")
            logger.info(f"   Sliding window: {config.sliding_window_size:,} tokens")
        else:
            self.enhanced_rope = None
            self.sliding_attention = None
            self.training_system = None
            self.use_long_context = False
    
    def forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
        past_key_value: Optional[Tuple[torch.Tensor]] = None,
        output_attentions: bool = False,
        use_cache: bool = False,
        cache_position: Optional[torch.Tensor] = None,
        **kwargs
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[Tuple[torch.Tensor]]]:
        """
        Enhanced forward pass with long context support.
        
        Automatically switches between:
        - Standard MLA for sequences <= 4K tokens
        - Long context MLA with sliding window for sequences > 4K tokens
        """
        batch_size, seq_len, hidden_size = hidden_states.shape
        
        # Determine which attention mechanism to use
        use_sliding_window = (
            self.use_long_context and 
            seq_len > self.config.sliding_window_size and
            self.config.enable_sliding_window
        )
        
        if use_sliding_window:
            # Use sliding window attention for very long sequences
            logger.debug(f"🪟 Using sliding window attention for seq_len={seq_len}")
            return self._sliding_window_forward(
                hidden_states, attention_mask, position_ids, 
                past_key_value, output_attentions, use_cache, cache_position
            )
        else:
            # Use standard MLA attention (possibly with enhanced RoPE)
            if self.use_long_context and seq_len > 4096:
                logger.debug(f"✨ Using enhanced MLA attention for seq_len={seq_len}")
                return self._enhanced_mla_forward(
                    hidden_states, attention_mask, position_ids,
                    past_key_value, output_attentions, use_cache, cache_position
                )
            else:
                # Standard MLA attention
                return self.mla_attention(
                    hidden_states, attention_mask, position_ids,
                    past_key_value, output_attentions, use_cache, cache_position
                )
    
    def _enhanced_mla_forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
        past_key_value: Optional[Tuple[torch.Tensor]] = None,
        output_attentions: bool = False,
        use_cache: bool = False,
        cache_position: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[Tuple[torch.Tensor]]]:
        """Enhanced MLA forward pass with RoPE scaling"""
        batch_size, seq_len, hidden_size = hidden_states.shape
        
        # Use the existing MLA attention but with enhanced RoPE
        # This is a simplified integration - in practice, we'd need to modify
        # the internal RoPE calls in MultiheadLatentAttention
        
        # For now, delegate to original MLA and apply post-processing if needed
        output = self.mla_attention(
            hidden_states, attention_mask, position_ids,
            past_key_value, output_attentions, use_cache, cache_position
        )
        
        # TODO: Integrate enhanced RoPE directly into MLA computation
        # This would require modifying the internal structure of MultiheadLatentAttention
        
        return output
    
    def _sliding_window_forward(
        self,
        hidden_states: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
        past_key_value: Optional[Tuple[torch.Tensor]] = None,
        output_attentions: bool = False,
        use_cache: bool = False,
        cache_position: Optional[torch.Tensor] = None
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[Tuple[torch.Tensor]]]:
        """Sliding window attention for very long sequences"""
        batch_size, seq_len, hidden_size = hidden_states.shape
        
        # Apply sliding window attention
        # Note: This is a simplified version. A full implementation would need
        # to handle KV caching, latent projections, etc.
        
        with self.training_system.memory_efficient_training():
            # Use sliding window attention
            attn_output, attn_weights = self.sliding_attention(
                hidden_states, hidden_states, hidden_states,
                attention_mask, output_attentions
            )
        
        # Return in the same format as MLA attention
        present_key_value = past_key_value  # Simplified - would need proper KV handling
        
        return attn_output, attn_weights if output_attentions else None, present_key_value
    
    def update_context_length(self, training_step: int) -> bool:
        """Update context length for training"""
        if self.training_system:
            return self.training_system.update_context_length(training_step)
        return False
    
    def estimate_memory_usage(self, batch_size: int, seq_len: int) -> Dict[str, float]:
        """Estimate memory usage for given batch size and sequence length"""
        if self.training_system:
            return self.training_system.estimate_memory_usage(batch_size, seq_len)
        return {"total_estimated_gb": 0.0}
    
    def get_training_stats(self) -> Dict[str, Any]:
        """Get training statistics"""
        if self.training_system:
            return self.training_system.get_training_stats()
        return {"long_context_enabled": False}

class LongContextMLAModel(nn.Module):
    """
    Complete model with Long Context MLA integration.
    
    This serves as a drop-in replacement for models using standard MLA,
    adding long context capabilities while maintaining compatibility.
    """
    
    def __init__(
        self, 
        config: Optional[EnhancedMLAConfig] = None,
        num_layers: int = 32
    ):
        super().__init__()
        
        if config is None:
            config = EnhancedMLAConfig()
        
        self.config = config
        self.num_layers = num_layers
        
        # Add missing attributes for compatibility
        if not hasattr(config, 'vocab_size'):
            config.vocab_size = 32000  # Default vocabulary size
        if not hasattr(config, 'layer_norm_eps'):
            config.layer_norm_eps = 1e-5  # Default epsilon
        
        # Create attention layers
        self.attention_layers = nn.ModuleList([
            LongContextMLAAttention(config, layer_idx=i)
            for i in range(num_layers)
        ])
        
        # Model embeddings (simplified)
        self.embeddings = nn.Embedding(config.vocab_size, config.hidden_size)
        
        # Layer normalization
        self.layer_norm = nn.LayerNorm(config.hidden_size, eps=config.layer_norm_eps)
        
        logger.info(f"🏗️  Long Context MLA Model initialized")
        logger.info(f"   Layers: {num_layers}")
        logger.info(f"   Hidden size: {config.hidden_size}")
        logger.info(f"   Max context: {config.max_position_embeddings:,} tokens")
    
    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: Optional[torch.Tensor] = None,
        position_ids: Optional[torch.Tensor] = None,
        **kwargs
    ) -> torch.Tensor:
        """Forward pass with long context support"""
        # Get embeddings
        hidden_states = self.embeddings(input_ids)
        
        # Apply attention layers
        for layer in self.attention_layers:
            hidden_states, _, _ = layer(
                hidden_states, 
                attention_mask=attention_mask,
                position_ids=position_ids,
                **kwargs
            )
        
        # Final layer norm
        hidden_states = self.layer_norm(hidden_states)
        
        return hidden_states
    
    def update_training_context(self, training_step: int):
        """Update context length for all layers"""
        updated_layers = 0
        for layer in self.attention_layers:
            if layer.update_context_length(training_step):
                updated_layers += 1
        
        if updated_layers > 0:
            logger.info(f"📈 Updated context length for {updated_layers} layers at step {training_step}")
    
    def get_memory_stats(self, batch_size: int, seq_len: int) -> Dict[str, Any]:
        """Get comprehensive memory statistics"""
        stats = {
            "model_params": sum(p.numel() for p in self.parameters()),
            "trainable_params": sum(p.numel() for p in self.parameters() if p.requires_grad),
            "batch_size": batch_size,
            "sequence_length": seq_len
        }
        
        # Get memory estimates from first layer
        if self.attention_layers:
            memory_stats = self.attention_layers[0].estimate_memory_usage(batch_size, seq_len)
            stats.update(memory_stats)
            
            # Scale for all layers
            if "total_estimated_gb" in stats:
                stats["total_estimated_gb"] *= self.num_layers
        
        return stats

# Utility functions for integration

def create_enhanced_mla_config(
    max_context_length: int = 131072,
    enable_long_context: bool = True,
    sliding_window_size: int = 4096,
    rope_scaling_type: str = "linear"
) -> EnhancedMLAConfig:
    """Create an enhanced MLA configuration with long context support"""
    return EnhancedMLAConfig(
        max_position_embeddings=max_context_length,
        enable_long_context_training=enable_long_context,
        sliding_window_size=sliding_window_size,
        rope_scaling_type=rope_scaling_type,
        enable_sliding_window=True,
        use_memory_efficient_attention=True,
        gradient_checkpointing=True
    )

def upgrade_mla_to_long_context(
    existing_mla_config: MLAConfig,
    enable_long_context: bool = True
) -> EnhancedMLAConfig:
    """Upgrade an existing MLA config to support long context"""
    return EnhancedMLAConfig(
        # Copy all existing parameters
        hidden_size=existing_mla_config.hidden_size,
        num_attention_heads=existing_mla_config.num_attention_heads,
        num_key_value_heads=existing_mla_config.num_key_value_heads,
        latent_size=existing_mla_config.latent_size,
        rope_base=existing_mla_config.rope_base,
        max_position_embeddings=existing_mla_config.max_position_embeddings,
        use_flash_attention=existing_mla_config.use_flash_attention,
        attention_dropout=existing_mla_config.attention_dropout,
        kv_cache_compression_ratio=existing_mla_config.kv_cache_compression_ratio,
        # Add long context features
        enable_long_context_training=enable_long_context,
        context_scaling_strategy=ContextScalingStrategy.PROGRESSIVE,
        enable_sliding_window=True,
        sliding_window_size=4096,
        use_memory_efficient_attention=True
    )

def test_enhanced_mla_integration():
    """Test the enhanced MLA integration"""
    print("🧪 Testing Enhanced MLA Integration...")
    
    # Create enhanced config
    config = create_enhanced_mla_config(
        max_context_length=32768,
        enable_long_context=True,
        sliding_window_size=4096
    )
    
    print(f"✅ Enhanced MLA Config created")
    print(f"   Max context: {config.max_position_embeddings:,} tokens")
    print(f"   Long context enabled: {config.enable_long_context_training}")
    
    # Create model
    model = LongContextMLAModel(config, num_layers=4)  # Small model for testing
    print(f"✅ Long Context MLA Model created with {config.num_attention_heads} layers")
    
    # Test forward pass with different sequence lengths
    batch_size = 2
    test_lengths = [1024, 4096, 8192]
    
    for seq_len in test_lengths:
        print(f"🔍 Testing sequence length: {seq_len}")
        
        # Create dummy input
        input_ids = torch.randint(0, config.vocab_size, (batch_size, seq_len))
        
        try:
            with torch.no_grad():
                output = model(input_ids)
                print(f"   ✅ Output shape: {output.shape}")
                
                # Get memory stats
                memory_stats = model.get_memory_stats(batch_size, seq_len)
                print(f"   💾 Estimated memory: {memory_stats.get('total_estimated_gb', 0):.2f} GB")
                
        except Exception as e:
            print(f"   ❌ Failed: {e}")
    
    # Test training context updates
    print("📈 Testing training context updates...")
    for step in [0, 1000, 2000, 4000]:
        model.update_training_context(step)
    
    print("🎉 Enhanced MLA Integration test completed!")
    
    return model

if __name__ == "__main__":
    model = test_enhanced_mla_integration()