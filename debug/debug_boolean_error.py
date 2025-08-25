#!/usr/bin/env python3
"""
Debug script to isolate the Boolean tensor error in cross-modal fusion
"""

import torch
import sys
import traceback

# Add the project root to Python path
sys.path.insert(0, 'apps/romai/src')

try:
    from ml.multimodal.cross_modal_fusion import (
        RomAICrossModalFusion, 
        create_multimodal_config
    )
    print("✅ Successfully imported cross-modal fusion components")
except Exception as e:
    print(f"❌ Import failed: {e}")
    sys.exit(1)

def test_minimal_forward_pass():
    """Test a minimal forward pass to isolate the boolean error"""
    
    print("\n🔍 Testing minimal forward pass...")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🔧 Using device: {device}")
    
    try:
        # Create minimal config
        config = create_multimodal_config(
            hidden_dim=512,
            use_mamba=False,  # Disable Mamba to isolate
            use_rwkv=False,   # Disable RWKV to isolate
            cultural_enabled=False,  # Disable cultural to isolate
            fusion_strategy="early_fusion"
        )
        print("✅ Config created successfully")
        
        # Create model
        model = RomAICrossModalFusion(config).to(device)
        print(f"✅ Model created with {sum(p.numel() for p in model.parameters()):,} parameters")
        
        # Test with minimal inputs
        print("\n🧪 Testing with text only...")
        with torch.no_grad():
            try:
                outputs = model(
                    text_input=["Test text"],
                    image_input=None,
                    audio_input=None,
                    cultural_context=None,
                    task="multimodal_understanding"
                )
                print("✅ Text-only forward pass succeeded")
                print(f"Output keys: {list(outputs.keys())}")
            except Exception as e:
                print(f"❌ Text-only forward pass failed: {e}")
                traceback.print_exc()
                return False
        
        print("\n🧪 Testing with image only...")
        with torch.no_grad():
            try:
                dummy_image = [torch.randn(3, 224, 224).to(device)]
                outputs = model(
                    text_input=None,
                    image_input=dummy_image,
                    audio_input=None,
                    cultural_context=None,
                    task="multimodal_understanding"
                )
                print("✅ Image-only forward pass succeeded")
                print(f"Output keys: {list(outputs.keys())}")
            except Exception as e:
                print(f"❌ Image-only forward pass failed: {e}")
                traceback.print_exc()
                return False
        
        print("\n🧪 Testing with audio only...")
        with torch.no_grad():
            try:
                dummy_audio = torch.randn(22050).to(device)
                outputs = model(
                    text_input=None,
                    image_input=None,
                    audio_input=dummy_audio,
                    cultural_context=None,
                    task="multimodal_understanding"
                )
                print("✅ Audio-only forward pass succeeded")
                print(f"Output keys: {list(outputs.keys())}")
            except Exception as e:
                print(f"❌ Audio-only forward pass failed: {e}")
                traceback.print_exc()
                return False
        
        print("\n🧪 Testing with all modalities...")
        with torch.no_grad():
            try:
                dummy_image = [torch.randn(3, 224, 224).to(device)]
                dummy_audio = torch.randn(22050).to(device)
                
                outputs = model(
                    text_input=["Test multimodal integration"],
                    image_input=dummy_image,
                    audio_input=dummy_audio,
                    cultural_context=None,
                    task="multimodal_understanding"
                )
                print("✅ Multi-modal forward pass succeeded")
                print(f"Output keys: {list(outputs.keys())}")
                return True
            except Exception as e:
                print(f"❌ Multi-modal forward pass failed: {e}")
                traceback.print_exc()
                return False
                
    except Exception as e:
        print(f"❌ Model creation failed: {e}")
        traceback.print_exc()
        return False

def test_with_cultural_enabled():
    """Test with cultural integration enabled"""
    
    print("\n🇷🇴 Testing with cultural integration...")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    
    try:
        # Create config with cultural enabled
        config = create_multimodal_config(
            hidden_dim=512,
            use_mamba=False,
            use_rwkv=False,
            cultural_enabled=True,  # Enable cultural
            fusion_strategy="cultural_guided"
        )
        print("✅ Cultural config created successfully")
        
        # Create model
        model = RomAICrossModalFusion(config).to(device)
        print(f"✅ Cultural model created with {sum(p.numel() for p in model.parameters()):,} parameters")
        
        # Test with cultural context
        cultural_context = {
            "hospitality": 0.8,
            "tradition": 0.6,
            "innovation": 0.9
        }
        
        with torch.no_grad():
            try:
                outputs = model(
                    text_input=["Romanian cultural traditions are important"],
                    image_input=None,
                    audio_input=None,
                    cultural_context=cultural_context,
                    task="cultural_understanding"
                )
                print("✅ Cultural forward pass succeeded")
                print(f"Output keys: {list(outputs.keys())}")
                return True
            except Exception as e:
                print(f"❌ Cultural forward pass failed: {e}")
                traceback.print_exc()
                return False
                
    except Exception as e:
        print(f"❌ Cultural model creation failed: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 DEBUG: Boolean Tensor Error Investigation")
    print("=" * 60)
    
    # Test minimal case first
    success1 = test_minimal_forward_pass()
    
    # Test with cultural integration if minimal passes
    if success1:
        success2 = test_with_cultural_enabled()
    else:
        success2 = False
    
    print("\n" + "=" * 60)
    if success1 and success2:
        print("🎉 All tests passed! The Boolean error is likely in validation suite.")
    elif success1:
        print("⚠️ Basic tests pass, but cultural integration fails.")
    else:
        print("❌ Basic forward pass fails - Boolean error is in core model.")