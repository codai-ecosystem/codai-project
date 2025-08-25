#!/usr/bin/env python3
"""
🚀 RUAGA-NOVA Development Configuration
Scaled-down version for development and testing
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ruaga_nova_architecture import RuagaNovaConfig, ProcessingMode

# Development configuration (smaller for testing)
RUAGA_NOVA_DEV_CONFIG = RuagaNovaConfig(
    d_model=1024,                    # Smaller model dimension for dev
    num_layers=12,                   # Fewer layers for development
    num_attention_heads=16,          # Fewer heads
    d_ff=4096,                       # Smaller feed-forward
    num_experts=32,                  # Fewer experts for dev
    num_active_experts=4,            # Fewer active experts
    expert_dim=512,                  # Smaller expert networks
    use_mla=True,                    # Keep efficiency features
    mla_compression_ratio=0.125,     # Keep memory savings
    base_context_length=4096,        # Smaller context for dev
    max_context_length=16384,        # Smaller max context
    enable_mtp=True,                 # Keep speed improvements
    mtp_lookahead=2,                 # Fewer lookahead tokens
    use_mamba_layers=True,           # Keep hybrid architecture
    mamba_layer_ratio=0.25,          # Fewer Mamba layers
    cultural_embedding_dim=256,      # Smaller cultural context
    romanian_vocab_size=50000,       # Smaller vocabulary
    cultural_memory_slots=1000,      # Fewer cultural slots
    max_tools=10,                    # Fewer tools for dev
    gradient_checkpointing=False,    # Disable for dev speed
    fp8_precision=False,             # Standard precision for dev
    fast_mode_latency_ms=50.0,       # Faster target for dev
    inference_cost_per_1m_tokens=0.10  # Lower cost target for dev
)

def create_dev_model():
    """Create development version of RUAGA-NOVA"""
    from ruaga_nova_architecture import RuagaNovaArchitecture
    return RuagaNovaArchitecture(RUAGA_NOVA_DEV_CONFIG, vocab_size=50000)

if __name__ == "__main__":
    import torch
    import time
    
    print("🧪 RUAGA-NOVA Development Configuration Test")
    print("=" * 60)
    
    # Create development model
    model = create_dev_model()
    info = model.get_model_info()
    
    print(f"🏗️  Architecture: {info['architecture']}")
    print(f"📊 Scale: {info['total_parameters']} total, {info['activated_parameters']} activated")
    print(f"⚡ Efficiency: {info['activation_ratio']} activation ratio")
    
    # Test forward pass
    batch_size, seq_len = 1, 32
    input_ids = torch.randint(0, 1000, (batch_size, seq_len))
    
    print("\n🔬 Testing forward pass...")
    start_time = time.time()
    
    with torch.no_grad():
        outputs = model(input_ids, cultural_mode=True, action_mode=True)
    
    forward_time = (time.time() - start_time) * 1000
    
    print(f"✅ Forward pass successful!")
    print(f"⚡ Inference time: {forward_time:.2f}ms")
    print(f"🧠 Processing mode: {outputs['processing_mode'].value}")
    print(f"🎯 Routing confidence: {outputs['routing_confidence']:.3f}")
    
    if 'mtp_predictions' in outputs:
        print(f"⚡ MTP predictions: {len(outputs['mtp_predictions'])} future tokens")
    
    print("\n✅ RUAGA-NOVA Development Configuration Working!")