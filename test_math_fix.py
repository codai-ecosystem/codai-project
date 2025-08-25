#!/usr/bin/env python3
"""
Quick test to verify mathematical reasoning fix
"""
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/romai/src'))

import asyncio
from ml.inference.real_neural_engine import RealNeuralEngine

async def test_mathematical_reasoning():
    """Test the fixed mathematical reasoning"""
    print("🧪 Testing Mathematical Reasoning Fix...")
    
    # Create neural engine
    engine = RealNeuralEngine()
    
    try:
        # Test basic math
        result = await engine.generate_response(
            query="What is 2+2?", 
            context={"request_context": "What is 2+2?"}, 
            response_type="mathematical_reasoning"
        )
        
        print(f"✅ Test Result: {result.text}")
        print(f"📊 Confidence: {result.confidence}")
        print(f"🔧 Generation Method: {result.generation_method}")
        
        # Test if it actually calculates
        if "4" in result.text:
            print("🎉 SUCCESS: Mathematical calculation working!")
        else:
            print(f"⚠️  WARNING: Expected '4' in result, got: {result.text}")
            
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

async def test_square_root():
    """Test square root calculation"""
    print("\n🧪 Testing Square Root...")
    
    engine = RealNeuralEngine()
    
    try:
        result = await engine.generate_response(
            query="What is sqrt(16)?", 
            context={"request_context": "What is sqrt(16)?"}, 
            response_type="mathematical_reasoning"
        )
        
        print(f"✅ Square Root Result: {result.text}")
        
        if "4" in result.text:
            print("🎉 SUCCESS: Square root calculation working!")
        else:
            print(f"⚠️  WARNING: Expected '4' in result, got: {result.text}")
            
        return True
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Mathematical Reasoning Tests...")
    
    # Run tests
    loop = asyncio.get_event_loop()
    
    print("\n" + "="*50)
    print("TEST 1: Basic Addition (2+2)")
    print("="*50)
    success1 = loop.run_until_complete(test_mathematical_reasoning())
    
    print("\n" + "="*50)
    print("TEST 2: Square Root (sqrt(16))")
    print("="*50)  
    success2 = loop.run_until_complete(test_square_root())
    
    print("\n" + "="*50)
    print("SUMMARY")
    print("="*50)
    if success1 and success2:
        print("🎉 ALL TESTS PASSED - Mathematical reasoning is working!")
    else:
        print("⚠️  SOME TESTS FAILED - Need further debugging")
        
    loop.close()