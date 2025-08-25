#!/usr/bin/env python3
"""
Direct Neural Engine Test
========================

Test the neural engine directly to see where the 0.3 confidence is coming from.
"""

import sys
import os
import asyncio
import logging

# Add the source directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, "apps", "romai", "src")
sys.path.insert(0, src_dir)

logging.basicConfig(level=logging.INFO)

async def test_neural_engine_directly():
    """Test neural engine directly"""
    print("🔍 Testing Neural Engine Directly")
    print("=" * 50)
    
    try:
        # Import the neural engine
        from ml.inference.real_neural_engine import get_neural_response, neural_engine
        
        print(f"✅ Neural engine imported successfully")
        print(f"Device: {neural_engine.device}")
        print(f"Initialized: {neural_engine.initialized}")
        
        # Test simple query
        print(f"\n🧪 Test 1: Simple mathematical query")
        print("-" * 30)
        
        result = await get_neural_response(
            query="What is 2 + 2?",
            context={"domain": "mathematical"},
            response_type="reasoning"
        )
        
        print(f"Response: {result.text[:100]}...")
        print(f"Confidence: {result.confidence}")
        print(f"Model used: {result.model_used}")
        print(f"Generation method: {result.generation_method}")
        print(f"Reasoning trace: {result.reasoning_trace}")
        print(f"Metadata: {result.metadata}")
        
        # Test Romanian cultural query
        print(f"\n🧪 Test 2: Romanian cultural query")
        print("-" * 30)
        
        result2 = await get_neural_response(
            query="Care este capitala României?",
            context={"domain": "cultural"},
            response_type="romanian_cultural"
        )
        
        print(f"Response: {result2.text[:100]}...")
        print(f"Confidence: {result2.confidence}")
        print(f"Model used: {result2.model_used}")
        print(f"Generation method: {result2.generation_method}")
        
        # Test with error trigger
        print(f"\n🧪 Test 3: Error path test")
        print("-" * 30)
        
        # Create a scenario that might trigger the error path
        result3 = await get_neural_response(
            query="",  # Empty query
            context={},
            response_type="invalid_type"
        )
        
        print(f"Response: {result3.text[:100]}...")
        print(f"Confidence: {result3.confidence}")
        print(f"Model used: {result3.model_used}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_neural_engine_directly())