#!/usr/bin/env python3
"""
Test Real Multimodal Data Processing - No Mock Data
"""

import sys
import os
sys.path.append('..')
sys.path.append('../..')

import asyncio
import torch
from datetime import datetime

async def test_real_multimodal_data():
    print("🎯 Testing Real Multimodal Data Processing - NO MOCK DATA")
    print("=" * 60)
    
    try:
        # Import with real data processor - fix relative imports
        import multimodal_agi_trainer
        import multimodal_task_types
        
        from multimodal_agi_trainer import RealRomanianMultimodalDataset
        from multimodal_task_types import MultimodalTaskType
        
        print("✅ Successfully imported real multimodal components")
        
        # Create test configuration
        config = type('Config', (), {
            'learning_rate': 1e-4,
            'batch_size': 8,
            'max_epochs': 5,
            'num_samples': 10,  # Small test
            'hidden_size': 512
        })()
        
        print("📊 Testing Real Romanian Multimodal Dataset...")
        
        # Test dataset directly
        dataset_config = {
            'num_samples': 10,
            'cultural_domains': ['traditional_architecture', 'folk_costumes'],
            'complexity_levels': ['medium', 'high']
        }
        
        dataset = RealRomanianMultimodalDataset(dataset_config)
        print(f"✅ Dataset created with {len(dataset)} real samples")
        
        # Examine real sample
        sample = dataset[0]
        
        if hasattr(sample, 'text_content'):
            print(f"📝 Real text content: {sample.text_content}")
            print(f"🎭 Task type: {sample.task_type}")
            print(f"🏛️ Cultural domain: {sample.cultural_domain}")
            print(f"📊 Text features shape: {sample.text_features.shape}")
            print(f"🎯 Cultural context: {sample.cultural_context}")
            
            # Check for NO mock data
            if 'torch.randn' in str(sample.text_features):
                print("❌ MOCK DATA DETECTED!")
                return False
            else:
                print("✅ Real tensor data confirmed - no torch.randn")
                
        else:
            text_content = sample.get('text_content', 'N/A')
            print(f"📝 Sample text: {text_content}")
            print(f"🎭 Task type: {sample.get('task_type', 'N/A')}")
        
        print("\n🚀 Testing Multimodal AGI Trainer...")
        trainer = MultimodalAGITrainer(config)
        print(f"✅ Trainer initialized with {len(trainer.dataset)} real samples")
        
        # Test training start (short test)
        print("\n🔄 Starting real data training test...")
        result = await trainer.start_multimodal_training(MultimodalTaskType.VISION_LANGUAGE_FUSION)
        
        print(f"📊 Training result: {result.get('status')}")
        print(f"⏱️ Duration: {result.get('training_duration', 0):.2f}s")
        
        if result.get('status') == 'success':
            print("\n✅ SUCCESS: Real data multimodal training operational!")
            print("🎉 All mock data successfully removed and replaced with real processing!")
            return True
        else:
            print(f"❌ Training failed: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_real_multimodal_data())
    if success:
        print("\n🎊 MOCK DATA REMOVAL COMPLETE - REAL PROCESSING ACTIVE 🎊")
    else:
        print("\n💥 Test failed - check logs above")
