"""
Lightweight test for Real Multimodal Perception Engine
Using CPU-friendly approach for testing
"""

import sys
import asyncio
import torch
sys.path.insert(0, 'apps/romai/src')

# Force CPU for testing
import os
os.environ['CUDA_VISIBLE_DEVICES'] = ''

async def test_lightweight_perception():
    print("🔍 Testing RomAI Real Perception System (Lightweight)...")
    
    try:
        # Import with CPU device
        from ml.perception.real_multimodal_perception import RealMultimodalPerceptionEngine
        
        # Create CPU-only system
        perception_system = RealMultimodalPerceptionEngine(device='cpu')
        
        # Test text perception with simple text
        result = await perception_system.process_text('RomAI is testing real perception!')
        
        print(f"🧠 Perception confidence: {result.confidence:.3f}")
        print(f"🧠 Semantic concepts: {result.semantic_concepts}")
        print(f"🧠 Processing time: {result.processing_time:.3f}s")
        print(f"🧠 Feature shape: {result.features.shape}")
        print("✅ Real perception system working!")
        return True
        
    except Exception as e:
        print(f"❌ Perception system error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    asyncio.run(test_lightweight_perception())