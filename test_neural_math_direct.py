#!/usr/bin/env python3
"""
Direct Neural Engine Mathematical Reasoning Test
Test the mathematical reasoning without server routing
"""

import sys
import os
sys.path.append('e:/GitHub/codai-project/apps/romai/src')

import asyncio
import json
from ml.inference.real_neural_engine import neural_engine

async def test_neural_math():
    """Test mathematical reasoning directly"""
    print("🧠 Testing Neural Engine Mathematical Reasoning...")
    
    try:
        # Initialize neural engine
        print("Initializing neural engine...")
        success = await neural_engine.initialize()
        print(f"Initialization successful: {success}")
        
        # Test simple math
        print("\n1. Testing simple addition: 2+3")
        response = await neural_engine.generate_response(
            'what is 2+3?', 
            {'request_context': '2+3', 'domain': 'mathematical'}, 
            'mathematical_reasoning'
        )
        print(f"Response: {response.text}")
        print(f"Confidence: {response.confidence}")
        print(f"Model: {response.model_used}")
        print(f"Method: {response.generation_method}")
        print(f"Reasoning: {response.reasoning_trace[:2]}")  # First 2 steps
        
        # Test square root
        print("\n2. Testing square root: sqrt(16)")
        response = await neural_engine.generate_response(
            'what is sqrt(16)?', 
            {'request_context': 'sqrt(16)', 'domain': 'mathematical'}, 
            'mathematical_reasoning'
        )
        print(f"Response: {response.text}")
        print(f"Confidence: {response.confidence}")
        
        # Test equation solving
        print("\n3. Testing equation: x^2 = 4")
        response = await neural_engine.generate_response(
            'solve x^2 = 4', 
            {'request_context': 'x^2 = 4', 'domain': 'mathematical'}, 
            'mathematical_reasoning'
        )
        print(f"Response: {response.text}")
        print(f"Confidence: {response.confidence}")
        
        # Test derivation
        print("\n4. Testing derivative: d/dx x^2")
        response = await neural_engine.generate_response(
            'what is the derivative of x^2?', 
            {'request_context': 'derivative of x^2', 'domain': 'mathematical'}, 
            'mathematical_reasoning'
        )
        print(f"Response: {response.text}")
        print(f"Confidence: {response.confidence}")
        
    except Exception as e:
        print(f"❌ Neural engine test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_neural_math())