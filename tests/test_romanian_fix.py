#!/usr/bin/env python3
"""
Quick test to validate Romanian engine compatibility after fixes.
"""

import sys
sys.path.insert(0, 'apps/romai/src')

import asyncio
from ml.reasoning.azure_enhanced_reasoning import AzureEnhancedReasoningEngine, AzureReasoningRequest

async def test_romanian_compatibility():
    print("🇷🇴 Testing Romanian Engine Compatibility...")
    
    try:
        engine = AzureEnhancedReasoningEngine()
        result = await engine.reason(
            AzureReasoningRequest(
                query='Bună ziua! Cum vă simțiți?',
                reasoning_type='romanian'
            )
        )
        
        print(f"✅ Romanian test successful!")
        print(f"📝 Result: {result.result[:100]}...")
        print(f"🔧 Method: {result.method}")
        print(f"🎯 Confidence: {result.confidence:.2f}")
        print(f"⏱️ Time: {result.processing_time:.2f}s")
        
        return True
        
    except Exception as e:
        print(f"❌ Romanian test failed: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_romanian_compatibility())
    if success:
        print("✅ Romanian compatibility test PASSED")
    else:
        print("❌ Romanian compatibility test FAILED")