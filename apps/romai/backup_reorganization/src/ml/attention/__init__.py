"""
Multi-head Latent Attention module for RomAI AGI
Based on DeepSeek-V3 architecture with advanced attention mechanisms.

This module provides:
- Multi-head Latent Attention (MLA) with KV cache compression
- FlashAttention integration for GPU optimization
- Romanian cultural context integration
- Performance benchmarking and optimization tools
"""

from .mla_attention import (
    MLAConfig,
    MLAOutput,
    MultiheadLatentAttention,
    MLABlock,
    RoPEEmbedding,
    MLALatentProjection,
    create_mla_config,
    benchmark_mla_performance,
)

from .mla_integration import (
    RomAIMLA,
    MLAIntegrationManager,
    MLAIntegrationConfig,
    create_romai_mla_config,
    test_mla_integration,
)

__all__ = [
    # Core MLA components
    'MLAConfig',
    'MLAOutput', 
    'MultiheadLatentAttention',
    'MLABlock',
    'RoPEEmbedding',
    'MLALatentProjection',
    'create_mla_config',
    'benchmark_mla_performance',
    
    # RomAI integration
    'RomAIMLA',
    'MLAIntegrationManager',
    'MLAIntegrationConfig', 
    'create_romai_mla_config',
    'test_mla_integration',
]