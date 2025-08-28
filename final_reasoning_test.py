#!/usr/bin/env python3
"""Final comprehensive test for both reasoning systems."""

import asyncio
import aiohttp
import json

async def test_comprehensive_reasoning():
    """Test both reasoning systems comprehensively"""
    async with aiohttp.ClientSession() as session:
        print("🎯 COMPREHENSIVE REASONING SYSTEM VALIDATION")
        print("=" * 60)
        
        # Test logical reasoning
        logical_tests = [
            {
                "query": "All roses are flowers. This rose is red. What can we conclude?",
                "expected_concept": "flower"
            },
            {
                "query": "All birds can fly. Penguin is a bird. Can penguin fly?",
                "expected_concept": "fly"
            }
        ]
        
        logical_passed = 0
        print("\n🧠 LOGICAL REASONING TESTS:")
        print("=" * 40)
        
        for i, test in enumerate(logical_tests, 1):
            try:
                async with session.post(
                    'http://localhost:6101/api/v1/logical-reasoning/analyze',
                    json={"logical_query": test["query"]},
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        print(f"\n{i}. Query: {test['query']}")
                        print(f"   Conclusion: {result.get('conclusion', 'No conclusion')}")
                        print(f"   Confidence: {result.get('confidence', 0)*100:.1f}%")
                        print(f"   Reasoning Type: {result.get('reasoning_type', 'Unknown')}")
                        
                        if result.get('success') and result.get('conclusion'):
                            print(f"   Status: ✅ SUCCESS")
                            logical_passed += 1
                        else:
                            print(f"   Status: ❌ FAILED")
                    else:
                        print(f"{i}. ❌ HTTP Error: {response.status}")
            except Exception as e:
                print(f"{i}. ❌ Error: {e}")
        
        # Test mathematical reasoning  
        math_tests = [
            {"problem": "√144", "expected": 12},
            {"problem": "25 + 17", "expected": 42},
            {"problem": "(15 * 4) + (32 / 8) - 7", "expected": 57},
            {"problem": "7 * 8", "expected": 56},
            {"problem": "100 - 45", "expected": 55}
        ]
        
        math_passed = 0
        print(f"\n🔢 MATHEMATICAL REASONING TESTS:")
        print("=" * 40)
        
        for i, test in enumerate(math_tests, 1):
            try:
                async with session.post(
                    'http://localhost:6101/api/v1/mathematical-reasoning/solve',
                    json={"problem": test["problem"]},
                    headers={'Content-Type': 'application/json'}
                ) as response:
                    if response.status == 200:
                        result = await response.json()
                        actual_result = result.get('result', 'No result')
                        
                        print(f"\n{i}. Problem: {test['problem']}")
                        print(f"   Result: {actual_result}")
                        print(f"   Expected: {test['expected']}")
                        print(f"   Confidence: {result.get('confidence', 0)*100:.1f}%")
                        print(f"   Method: {result.get('method_used', 'Unknown')}")
                        
                        # Check if result matches (handle float comparison)
                        try:
                            actual_num = float(actual_result)
                            expected_num = float(test['expected'])
                            if abs(actual_num - expected_num) < 0.001:
                                print(f"   Status: ✅ CORRECT")
                                math_passed += 1
                            else:
                                print(f"   Status: ❌ INCORRECT")
                        except (ValueError, TypeError):
                            if str(actual_result).strip() == str(test['expected']):
                                print(f"   Status: ✅ CORRECT")
                                math_passed += 1
                            else:
                                print(f"   Status: ❌ INCORRECT")
                    else:
                        print(f"{i}. ❌ HTTP Error: {response.status}")
            except Exception as e:
                print(f"{i}. ❌ Error: {e}")
        
        # Summary
        print(f"\n🏆 FINAL REASONING ENHANCEMENT RESULTS:")
        print("=" * 50)
        print(f"🧠 Logical Reasoning: {logical_passed}/{len(logical_tests)} tests passed ({logical_passed/len(logical_tests)*100:.1f}%)")
        print(f"🔢 Mathematical Reasoning: {math_passed}/{len(math_tests)} tests passed ({math_passed/len(math_tests)*100:.1f}%)")
        
        total_passed = logical_passed + math_passed
        total_tests = len(logical_tests) + len(math_tests)
        overall_success = total_passed / total_tests * 100
        
        print(f"📊 Overall Success Rate: {total_passed}/{total_tests} ({overall_success:.1f}%)")
        
        if overall_success >= 90:
            print(f"🎉 REASONING ENHANCEMENT: COMPLETE SUCCESS! 🚀")
            print("Both logical and mathematical reasoning systems are working excellently.")
        elif overall_success >= 70:
            print(f"✅ REASONING ENHANCEMENT: SUCCESS! 🎯")
            print("Reasoning systems are working well with minor optimization potential.")
        elif overall_success >= 50:
            print(f"⚠️ REASONING ENHANCEMENT: PARTIAL SUCCESS")
            print("Most reasoning capabilities are working, some improvements needed.")
        else:
            print(f"❌ REASONING ENHANCEMENT: NEEDS WORK")
            print("Significant improvements required in reasoning capabilities.")
        
        return overall_success

if __name__ == "__main__":
    asyncio.run(test_comprehensive_reasoning())