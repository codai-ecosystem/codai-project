"""
RUAGA Configuration Module

Defines configuration classes for the RomAI Ultimate AGI Architecture components.
"""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
import torch


@dataclass
class MambaConfig:
    """Configuration for Mamba-2 State Space Model blocks."""
    
    # Model dimensions
    d_model: int = 2048  # Hidden dimension
    d_state: int = 64    # State space dimension
    d_conv: int = 4      # Convolution width
    expand: int = 2      # Expansion factor
    
    # Performance optimizations
    use_fast_path: bool = True
    dt_rank: Optional[int] = None  # Delta parameter rank
    dt_min: float = 0.001
    dt_max: float = 0.1
    dt_init: str = "random"
    dt_scale: float = 1.0
    
    # Initialization
    bias: bool = False
    conv_bias: bool = True
    pscan: bool = True  # Parallel scan for efficiency
    
    # Layer normalization
    norm_epsilon: float = 1e-5


@dataclass 
class TransformerConfig:
    """Configuration for strategic Transformer layers."""
    
    # Attention configuration
    d_model: int = 2048
    n_heads: int = 32
    n_kv_heads: int = 8  # For grouped-query attention
    d_head: int = 64
    
    # MLA (Multi-Head Latent Attention) configuration
    use_mla: bool = True
    mla_dim: int = 512   # Latent attention dimension
    qk_rope_head_dim: int = 64
    v_head_dim: int = 128
    qk_nope_head_dim: int = 128
    
    # Feed-forward network
    d_ff: int = 8192
    activation: str = "silu"  # SiLU activation
    
    # Regularization
    dropout: float = 0.1
    attention_dropout: float = 0.1
    
    # RoPE (Rotary Position Embedding)
    use_rope: bool = True
    rope_theta: float = 10000.0
    rope_scaling: Optional[Dict[str, Any]] = None


@dataclass
class MoEConfig:
    """Configuration for DeepSeek-style Mixture of Experts system."""
    
    # DeepSeek-style MoE configuration for 671B total parameters
    num_experts: int = 32  # Scaled up from 8 to 32 for DeepSeek-style
    num_experts_per_tok: int = 2  # Keep efficient 2-expert routing
    expert_capacity_tokens: int = 4096  # Increased capacity
    
    # Expert specializations (32 specialized experts)
    expert_types: List[str] = field(default_factory=lambda: [
        # Mathematical & Scientific (8 experts - 25%)
        "advanced_mathematics", "pure_mathematics", "applied_mathematics", "statistical_reasoning",
        "physics_quantum", "chemistry_molecular", "biology_computational", "scientific_computation",
        
        # Programming & Computer Science (8 experts - 25%)
        "systems_programming", "algorithmic_optimization", "web_development", "ml_engineering", 
        "database_systems", "distributed_computing", "cybersecurity", "formal_verification",
        
        # Language & Communication (6 experts - 18.75%)
        "natural_language_processing", "multilingual_translation", "romanian_cultural",
        "creative_writing", "technical_documentation", "conversational_ai",
        
        # Specialized Intelligence (6 experts - 18.75%)
        "multimodal_vision", "audio_processing", "action_planning", "reasoning_logic",
        "knowledge_synthesis", "meta_learning",
        
        # Domain Expertise (4 experts - 12.5%)
        "business_strategy", "legal_analysis", "medical_diagnostics", "general_knowledge"
    ])
    
    # DeepSeek-style routing configuration
    router_jitter_noise: float = 0.001  # Reduced noise for stability
    router_ignore_padding_tokens: bool = True
    router_z_loss_coef: float = 1e-3  # Z-loss for router stability
    
    # Load balancing (critical for 32 experts)
    aux_loss_coef: float = 0.01  # Balanced auxiliary loss
    expert_dropout: float = 0.1  # Dropout for generalization
    
    # Massive expert dimensions for 671B total parameters
    # Each expert ~21B parameters (671B / 32 experts ≈ 21B per expert)
    # NOTE: Scaled down for development/testing - scale up for production
    expert_d_ff: int = 16384      # Scaled down from 32768 for testing
    expert_d_model: int = 4096    # Keep model dimension
    expert_intermediate_size: int = 32768  # Scaled down from 131072 for testing
    expert_activation: str = "swiglu"  # SwiGLU activation for better performance
    
    # Advanced routing strategy
    router_top_k_training: int = 2  # Training time top-k
    router_top_k_inference: int = 2  # Inference time top-k  
    router_capacity_factor: float = 1.25  # Capacity factor for load balancing
    
    # Memory optimization for massive scale
    use_expert_parallelism: bool = True  # Enable expert parallelism
    expert_parallel_size: int = 8  # Parallel experts per GPU
    use_gradient_checkpointing: bool = True  # Memory optimization


@dataclass
class RUAGAConfig:
    """Main configuration for RomAI Ultimate AGI Architecture with DeepSeek-style MoE."""
    
    # DeepSeek-style massive model architecture (671B parameters)
    vocab_size: int = 128000
    d_model: int = 4096  # Increased from 2048 to 4096 for massive scale
    n_layers: int = 64   # Increased from 48 to 64 layers
    max_position_embeddings: int = 131072  # 128k context
    
    # Hybrid layer configuration for massive scale
    mamba_layers: List[int] = field(default_factory=lambda: list(range(0, 64, 3)))  # Every 3rd layer
    transformer_layers: List[int] = field(default_factory=lambda: list(range(1, 64, 3)))  # Every 3rd layer offset
    moe_layers: List[int] = field(default_factory=lambda: list(range(2, 64, 3)))  # Every 3rd layer for MoE
    
    # Component configurations
    mamba: MambaConfig = field(default_factory=lambda: MambaConfig(d_model=4096))
    transformer: TransformerConfig = field(default_factory=lambda: TransformerConfig(d_model=4096))
    moe: MoEConfig = field(default_factory=MoEConfig)
    
    # Multi-token prediction (DeepSeek-V3 style)
    use_multi_token_prediction: bool = True
    num_predict_tokens: int = 4  # Predict 4 tokens ahead
    mtp_loss_weight: float = 0.3
    
    # DeepSeek-style training optimizations
    gradient_checkpointing: bool = True
    use_flash_attention: bool = True
    use_kv_cache: bool = True
    sequence_parallel: bool = True  # For massive sequences
    tensor_parallel: bool = True    # For massive models
    
    # Precision and memory optimization
    torch_dtype: str = "bfloat16"
    attn_implementation: str = "flash_attention_2" 
    use_fused_rmsnorm: bool = True
    use_rotary_pos_emb: bool = True
    
    # DeepSeek-style performance targets (671B parameters)
    target_math_500_score: float = 0.973    # 97.3% MATH-500 (DeepSeek R1 level)
    target_humaneval_score: float = 0.95    # >95% HumanEval
    target_mmlu_score: float = 0.95         # >95% MMLU Pro
    target_gsm8k_score: float = 0.98        # >98% GSM8K
    
    # Romanian cultural enhancement
    romanian_vocab_boost: int = 10000  # Additional Romanian tokens
    cultural_context_weight: float = 1.2
    
    # Infrastructure requirements for 671B parameters
    min_gpu_memory_gb: int = 80      # Minimum A100 80GB
    recommended_gpus: int = 8        # 8x A100 recommended
    estimated_training_tokens: int = 5_000_000_000_000  # 5T tokens
    
    def __post_init__(self):
        """Validate configuration after initialization."""
        # Ensure model dimensions are consistent
        assert self.mamba.d_model == self.d_model
        assert self.transformer.d_model == self.d_model
        
        # Validate layer assignments
        all_layers = set(self.mamba_layers + self.transformer_layers)
        expected_layers = set(range(self.n_layers))
        assert all_layers == expected_layers, "All layers must be assigned to either Mamba or Transformer"
        
        # Validate expert configuration
        assert len(self.moe.expert_types) == self.moe.num_experts
        
        # Set derived values
        if self.transformer.d_head is None:
            self.transformer.d_head = self.d_model // self.transformer.n_heads


# Predefined configurations for different scales
@dataclass
class RUAGAConfigSmall(RUAGAConfig):
    """Small-scale RUAGA configuration for development and testing."""
    
    vocab_size: int = 32000
    d_model: int = 1024
    n_layers: int = 24
    max_position_embeddings: int = 8192
    
    def __post_init__(self):
        # Update component configurations
        self.mamba = MambaConfig(d_model=1024, d_state=32)
        self.transformer = TransformerConfig(d_model=1024, n_heads=16, d_ff=4096)
        self.moe = MoEConfig(num_experts=4, expert_d_ff=4096)
        super().__post_init__()


@dataclass  
class RUAGAConfigLarge(RUAGAConfig):
    """Large-scale RUAGA configuration for production deployment."""
    
    vocab_size: int = 256000
    d_model: int = 4096
    n_layers: int = 96
    max_position_embeddings: int = 1048576  # 1M context
    
    def __post_init__(self):
        # Update component configurations
        self.mamba = MambaConfig(d_model=4096, d_state=128)
        self.transformer = TransformerConfig(d_model=4096, n_heads=64, d_ff=16384)
        self.moe = MoEConfig(num_experts=16, expert_d_ff=16384)
        super().__post_init__()


# Configuration factory
def get_ruaga_config(scale: str = "base") -> RUAGAConfig:
    """Get RUAGA configuration by scale."""
    
    configs = {
        "small": RUAGAConfigSmall(),
        "base": RUAGAConfig(),
        "large": RUAGAConfigLarge()
    }
    
    if scale not in configs:
        raise ValueError(f"Unknown scale: {scale}. Available: {list(configs.keys())}")
    
    return configs[scale]