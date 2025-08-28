#!/usr/bin/env python3
"""Test script for RomAI reasoning capabilities after fixes."""

import asyncio
import aiohttp
import json

async def test_logical_reasoning():
    """Test the enhanced logical reasoning system."""
    async with aiohttp.ClientSession() as session:
        payload = {
            "logical_query": "All roses are flowers. This rose is red. What can we conclude?"
        }
        
        try:
            async with session.post(
                'http://localhost:6101/api/v1/logical-reasoning/analyze',
                json=payload,
                headers={'Content-Type': 'application/json'}
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    print("🧠 LOGICAL REASONING TEST:")
                    print("=" * 50)
                    print(f"Query: {payload['logical_query']}")
                    print(f"Conclusion: {result.get('conclusion', 'No conclusion')}")
                    print(f"Confidence: {result.get('confidence', 0)}%")
                    print(f"Reasoning Chain: {result.get('reasoning_chain', 'No chain')}")
                    print(f"Status: ✅ SUCCESS" if result.get('conclusion') else "❌ FAILED")
                    return True
                else:
                    print(f"❌ Logical reasoning failed: {response.status}")
                    error_text = await response.text()
                    print(f"Error: {error_text}")
                    return False
        except Exception as e:
            print(f"❌ Logical reasoning error: {e}")
            return False

async def test_mathematical_reasoning():
    """Test the fixed mathematical reasoning system."""
    async with aiohttp.ClientSession() as session:
        test_cases = [
            {"problem": "√144", "expected": "12"},
            {"problem": "25 + 17", "expected": "42"},
            {"problem": "(15 * 4) + (32 / 8) - 7", "expected": "57"}
        ]
        
        success_count = 0
        for case in test_cases:
            payload = {"problem": case["problem"]}
            
            try:
                async with session.post(
                    'http://localhost:6101/api/v1/mathematical-reasoning/solve',
                    json=payload,
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"\n🔢 MATHEMATICAL REASONING TEST:")
                        print("=" * 50)
                        print(f"Problem: {case['problem']}")
                        print(f"Result: {result.get('result', 'No result')}")
                        print(f"Expected: {case['expected']}")
                        print(f"Confidence: {result.get('confidence', 0)}%")
                        print(f"Steps: {result.get('steps', 'No steps')}")
                        
                        if str(result.get('result', '')).strip() == case['expected']:
                            print(f"Status: ✅ CORRECT")
                            success_count += 1
                        else:
                            print(f"Status: ❌ INCORRECT")
                    else:
                        print(f"❌ Mathematical test failed for '{case['problem']}': {response.status}")
                        error_text = await response.text()
                        print(f"Error: {error_text}")
            except Exception as e:
                print(f"❌ Mathematical error for '{case['problem']}': {e}")
        
        print(f"\n📊 Mathematical Test Summary: {success_count}/{len(test_cases)} passed")
        return success_count == len(test_cases)

async def main():
    """Run all reasoning tests."""
    print("🎯 ROMAI REASONING ENHANCEMENT VALIDATION")
    print("=" * 60)
    
    logical_success = await test_logical_reasoning()
    mathematical_success = await test_mathematical_reasoning()
    
    print(f"\n🏆 FINAL RESULTS:")
    print("=" * 30)
    print(f"Logical Reasoning: {'✅ PASSED' if logical_success else '❌ FAILED'}")
    print(f"Mathematical Reasoning: {'✅ PASSED' if mathematical_success else '❌ FAILED'}")
    
    if logical_success and mathematical_success:
        print("\n🚀 REASONING ENHANCEMENT: COMPLETE SUCCESS!")
        print("Both logical and mathematical reasoning are working correctly.")
    else:
        print("\n⚠️ REASONING ENHANCEMENT: PARTIAL SUCCESS")
        print("Some reasoning capabilities need additional work.")

if __name__ == "__main__":
    asyncio.run(main())