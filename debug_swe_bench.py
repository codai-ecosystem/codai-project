#!/usr/bin/env python3
"""
SWE-bench Specific Debug
======================

Debug the specific SWE-bench tests that are failing in comprehensive benchmark.
"""

import requests
import json
import sys

def test_swe_bench():
    """Test specific SWE-bench problems"""
    print("🔍 SWE-bench Debug Test")
    print("=" * 50)
    
    BASE_URL = "http://localhost:6101"
    
    swe_problems = [
        {
            "problem": "Write a Python function that finds the maximum element in a list. Handle edge cases like empty lists.",
            "expected_concepts": ["function", "max", "edge cases"],
            "category": "basic_programming"
        },
        {
            "problem": "Debug this code: def fibonacci(n): if n <= 1: return n; else: return fibonacci(n-1) + fibonacci(n-2). What's the time complexity and how can you optimize it?",
            "expected_concepts": ["debugging", "recursion", "optimization", "memoization"],
            "category": "algorithm_optimization"
        }
    ]
    
    for i, problem in enumerate(swe_problems, 1):
        print(f"\n🧪 SWE Test {i}: {problem['category']}")
        print("-" * 40)
        print(f"Problem: {problem['problem'][:80]}...")
        
        try:
            payload = {
                "problem": problem["problem"],
                "reasoning_type": "programming_logic",
                "quality_target": "advanced",
                "max_steps": 10
            }
            
            response = requests.post(f"{BASE_URL}/agi/reasoning/advanced", json=payload, timeout=60)
            
            if response.status_code == 200:
                result = response.json()
                final_answer = result.get("final_answer", "")
                confidence = result.get("overall_confidence", 0)
                domain_breakdown = result.get("domain_breakdown", {})
                programming_score = domain_breakdown.get("programming", 0)
                
                print(f"✅ Response received:")
                print(f"   Confidence: {confidence}")
                print(f"   Programming Score: {programming_score:.3f}")
                print(f"   Answer Length: {len(final_answer)} chars")
                print(f"   Answer Preview: {final_answer[:200]}...")
                
                # SWE-bench criteria
                is_programming_competent = (
                    confidence >= 0.4 and 
                    programming_score >= 0.3 and
                    len(final_answer) > 50
                )
                
                print(f"   SWE-bench Criteria:")
                print(f"     Confidence >= 0.4: {'✅' if confidence >= 0.4 else '❌'} ({confidence:.3f})")
                print(f"     Programming >= 0.3: {'✅' if programming_score >= 0.3 else '❌'} ({programming_score:.3f})")
                print(f"     Answer Length > 50: {'✅' if len(final_answer) > 50 else '❌'} ({len(final_answer)})")
                print(f"   Overall SWE-bench Pass: {'✅' if is_programming_competent else '❌'}")
                
                # Check for expected concepts
                answer_lower = final_answer.lower()
                concept_matches = []
                for concept in problem["expected_concepts"]:
                    if concept.lower() in answer_lower:
                        concept_matches.append(concept)
                
                print(f"   Expected Concepts: {problem['expected_concepts']}")
                print(f"   Concepts Found: {concept_matches}")
                print(f"   Concept Coverage: {len(concept_matches)}/{len(problem['expected_concepts'])}")
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_swe_bench()