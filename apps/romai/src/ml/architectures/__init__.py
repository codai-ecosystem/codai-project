"""
RomAI Ultimate AGI Architecture (RUAGA) Module

This module implements the revolutionary hybrid architecture combining:
- Mamba-2 State Space Models for 2-8x faster training
- Strategic Transformer layers for long-range dependencies
- DeepSeek-V3 style Multi-Head Latent Attention (MLA)
- Multi-Token Prediction for enhanced reasoning
- Mixture of Experts (MoE) for domain specialization

Core Components:
- HybridArchitecture: Main RUAGA implementation
- MambaBlock: State Space Model implementation
- TransformerBlock: Strategic attention layers
- MoERouter: Expert routing system
- MultiTokenPredictor: Enhanced generation system
"""

from .hybrid_architecture import (
    RUAGAModel,
    HybridArchitecture,
    MambaBlock,
    TransformerBlock,
    MoERouter,
    MultiTokenPredictor
)

from .config import (
    RUAGAConfig,
    MambaConfig,
    TransformerConfig,
    MoEConfig
)

__all__ = [
    'RUAGAModel',
    'HybridArchitecture', 
    'MambaBlock',
    'TransformerBlock',
    'MoERouter',
    'MultiTokenPredictor',
    'RUAGAConfig',
    'MambaConfig',
    'TransformerConfig',
    'MoEConfig'
]