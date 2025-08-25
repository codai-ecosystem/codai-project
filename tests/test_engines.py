#!/usr/bin/env python3
"""
Quick Test Script for RomAI Autonomous Engines
============================================
"""

import sys
import asyncio
import time

# Add the RomAI source path
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine 
from ml.reasoning.autonomous_romanian_engine import AutonomousRomanianEngine

async def test_all_engines():
    print('🧠 RomAI Autonomous Engine Test Suite')
    print('=' * 50)
    
    # Test Mathematical Engine
    print('🔢 Testing Mathematical Engine...')
    math_engine = AutonomousMathEngine()
    start = time.time()
    result1 = await math_engine.solve_mathematical_problem('What is the square root of 144?')
    end = time.time()
    print(f'   ✅ Result: {result1.result}')
    print(f'   ⏱️ Performance: {(end-start)*1000:.2f}ms')
    print(f'   🎯 Confidence: {result1.confidence}')
    print()
    
    # Test Logical Engine  
    print('🎓 Testing Logical Engine...')
    logic_engine = AutonomousLogicalEngine()
    start = time.time()
    try:
        result2 = await logic_engine.perform_logical_reasoning('All humans are mortal. Socrates is a human. Therefore?')
        end = time.time()
        print(f'   ✅ Result: {result2.conclusion}')
        print(f'   ⏱️ Performance: {(end-start)*1000:.2f}ms')
        print(f'   🎯 Confidence: {result2.confidence}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
    print()
    
    # Test Romanian Engine
    print('🏛️ Testing Romanian Cultural Engine...')
    romanian_engine = AutonomousRomanianEngine()
    start = time.time()
    try:
        result3 = await romanian_engine.process_romanian_context('Tell me about Romanian culture')
        end = time.time()
        print(f'   ✅ Result: {result3.response[:100]}...')
        print(f'   ⏱️ Performance: {(end-start)*1000:.2f}ms')
        print(f'   🎯 Confidence: {result3.confidence}')
    except Exception as e:
        print(f'   ❌ Error: {e}')
    print()
    
    print('🏆 Test Suite Complete!')

if __name__ == '__main__':
    asyncio.run(test_all_engines())