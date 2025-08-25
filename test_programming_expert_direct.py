#!/usr/bin/env python3
"""
Test Programming Expert Direct Integration
"""
import sys
import os
sys.path.append('E:/GitHub/codai-project/apps/romai/src')

from ml.inference.real_neural_engine import RealNeuralEngine

async def test_programming_expert():
    """Test programming expert integration directly"""
    print("🧠 Testing Programming Expert Direct Integration...")
    
    # Initialize the neural engine
    engine = RealNeuralEngine()
    await engine.initialize()
    
    # Test programming query
    query = "Write a Python function to find the maximum value in a list"
    context = {
        'original_query': query,
        'problem_type': 'technical'
    }
    
    analysis = {
        'requirements': ['function', 'maximum', 'list'],
        'constraints': []
    }
    
    # Call the programming synthesis method directly
    try:
        result = await engine._generate_programming_synthesis_neural(analysis, context)
        print(f"✅ SUCCESS: Programming Expert Response:")
        print(result)
        return True
    except Exception as e:
        print(f"❌ FAILED: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_programming_expert())