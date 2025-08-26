#!/usr/bin/env python3
"""
MoE System Debug and Fix
Diagnose and fix the MoE system integration issues
"""

import sys
import os

# Add the RomAI source to path
sys.path.insert(0, 'apps/romai/src')

def test_moe_imports():
    """Test MoE module imports"""
    print("🔍 Testing MoE System Imports...")
    
    try:
        print("  📦 Testing moe_architecture import...")
        from ml.mixture_of_experts.moe_architecture import (
            create_romai_moe_model,
            RomAIMoETransformer,
            MoEConfig
        )
        print("  ✅ moe_architecture import successful")
        
        print("  📦 Testing moe_integration import...")
        from ml.mixture_of_experts.moe_integration import (
            create_moe_inference_engine,
            RomAIMoEInferenceEngine
        )
        print("  ✅ moe_integration import successful")
        
        print("  📦 Testing moe_server_integration import...")
        from ml.mixture_of_experts.moe_server_integration import (
            integrate_moe_with_server,
            verify_moe_integration
        )
        print("  ✅ moe_server_integration import successful")
        
        return True
        
    except Exception as e:
        print(f"  ❌ MoE import failed: {e}")
        return False

def test_moe_initialization():
    """Test MoE system initialization"""
    print("\n🧠 Testing MoE System Initialization...")
    
    try:
        from ml.mixture_of_experts.moe_architecture import create_romai_moe_model
        
        print("  🔄 Creating small MoE model...")
        model = create_romai_moe_model("small")
        print("  ✅ MoE model created successfully")
        
        # Test basic functionality
        import torch
        batch_size, seq_len, hidden_size = 2, 10, 1024  # Match model's hidden size
        
        # Create dummy embeddings instead of token IDs
        hidden_states = torch.randn(batch_size, seq_len, hidden_size)
        
        print(f"  🔄 Testing forward pass with embeddings shape: {hidden_states.shape}")
        
        with torch.no_grad():
            outputs = model(hidden_states)
            print(f"  ✅ Forward pass successful, output shape: {outputs[0].shape}")
            if len(outputs) > 1:
                print(f"  📊 Auxiliary info available: {type(outputs[1])}")
        
        # Get model statistics
        stats = model.get_romanian_performance_metrics()
        print(f"  📈 Model Statistics:")
        print(f"    • Total parameters: {model.get_total_parameters()}")
        print(f"    • Active parameters: {model.get_active_parameters()}")
        print(f"    • Romanian performance: {stats}")
        
        return True
        
    except Exception as e:
        print(f"  ❌ MoE initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_moe_integration():
    """Test MoE server integration"""
    print("\n🔗 Testing MoE Server Integration...")
    
    try:
        from ml.mixture_of_experts.moe_integration import create_moe_inference_engine
        
        print("  🔄 Creating MoE inference engine...")
        config = {
            'hidden_size': 1024,
            'intermediate_size': 4096,
            'experts_per_token': 2,
            'device': 'cpu',
            'enable_performance_tracking': True
        }
        
        engine = create_moe_inference_engine(config)
        print("  ✅ MoE inference engine created successfully")
        
        return True
        
    except Exception as e:
        print(f"  ❌ MoE integration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def fix_moe_system():
    """Attempt to fix common MoE issues"""
    print("\n🔧 Attempting to Fix MoE System Issues...")
    
    # Check if __init__.py files exist
    init_files = [
        'apps/romai/src/ml/__init__.py',
        'apps/romai/src/ml/mixture_of_experts/__init__.py'
    ]
    
    for init_file in init_files:
        if not os.path.exists(init_file):
            print(f"  📝 Creating missing {init_file}...")
            os.makedirs(os.path.dirname(init_file), exist_ok=True)
            with open(init_file, 'w') as f:
                f.write("# Module initialization\n")
            print(f"  ✅ Created {init_file}")
        else:
            print(f"  ✅ {init_file} exists")
    
    return True

def main():
    """Main debug and fix routine"""
    print("🧠 RomAI MoE System Debug and Fix Tool")
    print("=" * 50)
    
    # Change to project directory
    if not os.getcwd().endswith('codai-project'):
        try:
            os.chdir('e:/GitHub/codai-project')
            print(f"📂 Changed directory to: {os.getcwd()}")
        except:
            print("❌ Could not change to project directory")
            return False
    
    success_count = 0
    total_tests = 4
    
    # Test 1: Fix common issues
    if fix_moe_system():
        success_count += 1
    
    # Test 2: Test imports
    if test_moe_imports():
        success_count += 1
    
    # Test 3: Test initialization
    if test_moe_initialization():
        success_count += 1
    
    # Test 4: Test integration
    if test_moe_integration():
        success_count += 1
    
    print(f"\n📊 Debug Results: {success_count}/{total_tests} tests passed")
    
    if success_count == total_tests:
        print("🎉 ALL TESTS PASSED - MoE system is working!")
        print("💡 The MoE system should now integrate successfully with the server")
        return True
    else:
        print("⚠️ Some tests failed - MoE system needs attention")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)