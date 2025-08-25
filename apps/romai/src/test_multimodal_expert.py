#!/usr/bin/env python3
"""
Quick test for multimodal expert initialization
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

print("🔍 Testing RomAI Multimodal Expert Initialization")
print("=" * 50)

try:
    print("📦 Importing enhanced multimodal expert...")
    from ml.experts.enhanced_multimodal_expert import EnhancedMultimodalExpert
    print("✅ Import successful")
    
    print("🚀 Creating multimodal expert instance...")
    expert = EnhancedMultimodalExpert()
    print("✅ Expert created successfully")
    
    print("📊 Getting expert capabilities...")
    caps = expert.get_expert_capabilities()
    
    print(f"✅ Expert ready: {caps.get('expert_ready', False)}")
    print(f"📈 Processed requests: {caps.get('processed_requests', 0)}")
    print(f"🎯 Success rate: {caps.get('success_rate', 0.0):.2f}")
    
    available_models = caps.get('model_capabilities', {}).get('available_models', {})
    print("🤖 Available models:")
    for model_name, available in available_models.items():
        status = "✅" if available else "❌"
        print(f"   {status} {model_name}")
    
    supported_tasks = caps.get('supported_tasks', [])
    print(f"🎯 Supported tasks ({len(supported_tasks)}):")
    for task in supported_tasks:
        print(f"   • {task}")
    
    print("\n🎉 Multimodal expert test completed successfully!")
    
except Exception as e:
    print(f"❌ Error during multimodal expert test: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)