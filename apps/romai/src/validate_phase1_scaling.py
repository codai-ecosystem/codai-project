#!/usr/bin/env python3
"""
Phase 1 Scaling Validation - RomAI Parameter Scaling
===================================================

Validates the Phase 1 scaling from 958M to 5B parameters (5.2x increase)
and ensures the configuration meets world-class AGI requirements.

Author: GitHub Copilot Agent
Date: August 25, 2025
Status: Phase 1 Implementation
"""

import sys
import os
sys.path.append('.')

from ml.models.simple_transformer import SimpleTransformerConfig, ModelScale
import json

def validate_phase1_scaling():
    """Validate Phase 1 parameter scaling"""
    print("🚀 RomAI Phase 1 Scaling Validation")
    print("=" * 50)
    
    # Current configuration (MEDIUM scale)
    current_config = SimpleTransformerConfig(scale=ModelScale.MEDIUM)
    current_params = current_config.calculate_parameters()
    
    # Phase 1 configuration (5B parameters target)
    phase1_config = SimpleTransformerConfig(scale=ModelScale.PHASE1)
    phase1_params = phase1_config.calculate_parameters()
    
    # Calculate scaling factor
    scaling_factor = phase1_params['total_parameters'] / current_params['total_parameters']
    
    print(f"📊 Current Configuration (MEDIUM):")
    print(f"   Parameters: {current_params['total_parameters']:,}")
    print(f"   Model Dimension: {current_config.d_model}")
    print(f"   Layers: {current_config.n_layers}")
    print(f"   Attention Heads: {current_config.n_heads}")
    print(f"   Feed-Forward Size: {current_config.d_ff}")
    print(f"   MoE Experts: {current_config.num_experts}")
    
    print(f"\n🎯 Phase 1 Configuration (PHASE1):")
    print(f"   Parameters: {phase1_params['total_parameters']:,}")
    print(f"   Model Dimension: {phase1_config.d_model}")
    print(f"   Layers: {phase1_config.n_layers}")
    print(f"   Attention Heads: {phase1_config.n_heads}")
    print(f"   Feed-Forward Size: {phase1_config.d_ff}")
    print(f"   MoE Experts: {phase1_config.num_experts}")
    print(f"   Context Length: {phase1_config.max_seq_length}")
    
    print(f"\n📈 Scaling Analysis:")
    print(f"   Scaling Factor: {scaling_factor:.2f}x")
    print(f"   Target Factor: 5.2x")
    print(f"   Parameters Added: {(phase1_params['total_parameters'] - current_params['total_parameters']):,}")
    
    # Check if we hit the 5B target
    billion_params = phase1_params['total_parameters'] / 1_000_000_000
    print(f"   Total Size: {billion_params:.2f}B parameters")
    
    # Validation
    target_5b = 5_000_000_000
    if abs(phase1_params['total_parameters'] - target_5b) / target_5b < 0.1:  # Within 10%
        print(f"✅ SUCCESS: Phase 1 scaling achieves ~5B parameter target!")
    else:
        print(f"⚠️  WARNING: Parameter count {billion_params:.2f}B differs from 5B target")
    
    # Memory estimation
    # Assuming FP16 (2 bytes per parameter)
    memory_gb = (phase1_params['total_parameters'] * 2) / (1024**3)
    print(f"\n💾 Memory Requirements:")
    print(f"   Model Size (FP16): {memory_gb:.2f} GB")
    print(f"   With Gradients/Optimizer: {memory_gb * 4:.2f} GB")
    print(f"   RTX 3060 Ti (8GB): {'✅ Sufficient' if memory_gb < 8 else '❌ Insufficient - Need cloud GPU'}")
    
    # Detailed parameter breakdown
    print(f"\n🔍 Detailed Parameter Breakdown (Phase 1):")
    for key, value in phase1_params.items():
        if isinstance(value, int) and key != 'scale':
            print(f"   {key.replace('_', ' ').title()}: {value:,}")
    
    # Export configuration for use
    config_export = {
        'phase1_config': {
            'scale': phase1_config.scale.value,
            'd_model': phase1_config.d_model,
            'n_layers': phase1_config.n_layers,
            'n_heads': phase1_config.n_heads,
            'd_ff': phase1_config.d_ff,
            'num_experts': phase1_config.num_experts,
            'max_seq_length': phase1_config.max_seq_length,
            'vocab_size': phase1_config.vocab_size,
        },
        'parameters': phase1_params,
        'scaling_factor': scaling_factor,
        'memory_requirements_gb': memory_gb
    }
    
    with open('phase1_scaling_config.json', 'w') as f:
        json.dump(config_export, f, indent=2)
    
    print(f"\n💾 Configuration exported to: phase1_scaling_config.json")
    
    return phase1_config, phase1_params

if __name__ == "__main__":
    validate_phase1_scaling()