"""
Quick validation test for Advanced Transformer Architecture
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import torch
import torch.nn as nn
from advanced_transformer_architecture import create_advanced_transformer, ModelScale

def test_basic_functionality():
    """Test basic functionality of the Advanced Transformer"""
    print("🔍 Testing Advanced Transformer Architecture")
    print("=" * 50)
    
    try:
        # Test Small model first
        print("🧠 Creating SMALL model...")
        model = create_advanced_transformer(scale=ModelScale.SMALL)
        
        # Test forward pass
        print("🔄 Testing forward pass...")
        batch_size, seq_len = 1, 16  # Small test
        input_ids = torch.randint(0, 1000, (batch_size, seq_len))
        
        with torch.no_grad():
            outputs = model(input_ids)
            
            print(f"✅ Forward pass successful")
            print(f"   Input shape: {input_ids.shape}")
            print(f"   Output logits shape: {outputs['logits'].shape}")
            print(f"   Parameters: {outputs['parameter_count']:,}")
            print(f"   Aux loss: {outputs['aux_loss'].item():.6f}")
        
        # Test model info
        info = model.get_model_info()
        print(f"✅ Model info retrieved:")
        print(f"   Architecture: {info['architecture']}")
        print(f"   Scale: {info['scale']}")
        print(f"   Parameters: {info['total_parameters']}")
        print(f"   Memory: {info['parameter_size_gb']} GB")
        
        print("\n🎯 Basic validation PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ Validation failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_basic_functionality()
    if success:
        print("\n✨ Advanced Transformer Architecture validation complete!")
    else:
        print("\n❌ Validation failed - needs fixes")