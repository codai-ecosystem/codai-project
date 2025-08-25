#!/usr/bin/env python3
"""Test the mathematical crisis fix"""
import asyncio
import sys
import os

# Add the mathematical domain to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src', 'domains', 'mathematical'))

try:
    from mathematical_reasoning_engine import solve_math_problem
    
    async def test_mathematical_crisis():
        print("=" * 60)
        print("RomAI Mathematical Crisis Test")
        print("=" * 60)
        print("Testing critical '2 + 2' query that previously returned philosophy...")
        
        # Test the critical case
        result = await solve_math_problem('2 + 2 = ?')
        
        print(f"Query: 2 + 2 = ?")
        print(f"Result: {result.get('answer', 'Error')}")
        print(f"Mathematical Score: {result.get('confidence', 0.0):.3f}")
        print(f"Method: {result.get('method', 'unknown')}")
        
        # Check if the crisis is fixed
        answer = result.get('answer', '')
        if '4' in str(answer) or answer == 4.0:
            print("✅ CRISIS RESOLVED: Mathematical reasoning returns correct numerical answer!")
        else:
            print("❌ CRISIS PERSISTS: Still returning non-numerical responses")
        
        return result

    if __name__ == "__main__":
        result = asyncio.run(test_mathematical_crisis())

except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Mathematical engine not found. Please check file structure.")
except Exception as e:
    print(f"❌ Test Error: {e}")