#!/usr/bin/env python3
"""Debug script to understand logical benchmark failures"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps/romai/src'))

from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine
import asyncio

async def debug_logical_tests():
    """Debug the specific logical tests that are failing"""
    
    print("🧠 DEBUGGING LOGICAL REASONING BENCHMARKS")
    print("=" * 60)
    
    engine = AutonomousLogicalEngine()
    
    # These are the exact benchmark tests from comprehensive_ai_benchmark.py
    benchmark_tests = [
        {
            "name": "Deduction",
            "problem": "All birds can fly. Penguins are birds. Can penguins fly?",
            "expected_contains": "logical analysis"  # What benchmark looks for
        },
        {
            "name": "Induction", 
            "problem": "Pattern: 2,4,6,8. What comes next?",
            "expected_contains": "10"  # What benchmark looks for
        },
        {
            "name": "Syllogism",
            "problem": "All roses are flowers. This is a rose. What is it?",
            "expected_contains": "flower"  # What benchmark looks for
        },
        {
            "name": "Contradiction",
            "problem": "Statement: This statement is false. Analyze the contradiction.",
            "expected_contains": "paradox"  # What benchmark looks for
        },
        {
            "name": "Inference",
            "problem": "If it rains, the ground gets wet. The ground is wet. Did it rain?",
            "expected_contains": "possible"  # What benchmark looks for  
        }
    ]
    
    for test in benchmark_tests:
        print(f"\n🔍 Testing: {test['name']}")
        print(f"Problem: {test['problem']}")
        print(f"Expected to contain: '{test['expected_contains']}'")
        
        try:
            result = await engine.reason(test["problem"])
            
            print(f"Got conclusion: '{result.conclusion}'")
            print(f"Contains expected? {test['expected_contains'].lower() in result.conclusion.lower()}")
            print(f"Reasoning steps: {result.reasoning_steps}")
            print(f"Confidence: {result.confidence}")
            print(f"Validity: {result.validity}")
            
            # Check if it would pass the benchmark
            would_pass = test['expected_contains'].lower() in result.conclusion.lower()
            print(f"Would pass benchmark: {'✅ YES' if would_pass else '❌ NO'}")
            
        except Exception as e:
            print(f"❌ ERROR: {e}")
        
        print("-" * 50)

if __name__ == "__main__":
    asyncio.run(debug_logical_tests())