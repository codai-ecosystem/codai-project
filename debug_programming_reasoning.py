#!/usr/bin/env python3
"""
Programming Reasoning Diagnostic
===============================

Debug why SWE-bench reasoning is scoring 0% despite good overall performance.
Test specific programming queries to understand the failure mode.
"""

import requests
import json
import sys
import os

def test_programming_reasoning():
    """Test programming reasoning capabilities"""
    print("🔍 Programming Reasoning Diagnostic")
    print("=" * 50)
    
    # Test cases that failed in SWE-bench
    programming_tests = [
        {
            "name": "Basic Programming",
            "problem": "Write a Python function that finds the maximum element in a list. Handle edge cases like empty lists.",
            "expected_keywords": ["function", "def", "max", "empty", "list"],
            "domain_expected": "programming"
        },
        {
            "name": "Algorithm Optimization", 
            "problem": "Debug this code: def fibonacci(n): if n <= 1: return n; else: return fibonacci(n-1) + fibonacci(n-2). What's the time complexity and how can you optimize it?",
            "expected_keywords": ["recursion", "O(n)", "memoization", "dynamic", "optimization"],
            "domain_expected": "programming"
        },
        {
            "name": "System Design",
            "problem": "Design a RESTful API for a simple todo application. Include endpoints for CRUD operations.",
            "expected_keywords": ["REST", "API", "GET", "POST", "PUT", "DELETE", "endpoints"],
            "domain_expected": "programming"
        }
    ]
    
    BASE_URL = "http://localhost:6101"
    
    for i, test in enumerate(programming_tests, 1):
        print(f"\n🧪 Test {i}: {test['name']}")
        print("-" * 40)
        print(f"Problem: {test['problem'][:100]}...")
        
        try:
            payload = {
                "problem": test["problem"],
                "reasoning_type": "programming_logic",
                "quality_target": "advanced",
                "max_steps": 5
            }
            
            response = requests.post(f"{BASE_URL}/agi/reasoning/advanced", json=payload, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract key metrics
                confidence = result.get("overall_confidence", 0)
                quality = result.get("quality_assessment", "unknown")
                domain_breakdown = result.get("domain_breakdown", {})
                reasoning_chain = result.get("reasoning_chain", [])
                final_answer = result.get("final_answer", "")
                
                print(f"✅ Response received:")
                print(f"   Confidence: {confidence}")
                print(f"   Quality: {quality}")
                print(f"   Domain Breakdown: {domain_breakdown}")
                print(f"   Programming Score: {domain_breakdown.get('programming', 0):.3f}")
                print(f"   Reasoning Steps: {len(reasoning_chain)}")
                
                # Check for programming content
                answer_lower = final_answer.lower()
                has_programming_keywords = any(keyword.lower() in answer_lower 
                                             for keyword in test["expected_keywords"])
                
                print(f"   Contains programming keywords: {has_programming_keywords}")
                print(f"   Answer length: {len(final_answer)} chars")
                print(f"   Answer preview: {final_answer[:150]}...")
                
                # Analyze reasoning steps for programming content
                programming_steps = 0
                for step in reasoning_chain:
                    step_text = step.get("reasoning", "").lower()
                    if any(keyword.lower() in step_text for keyword in ["cod", "program", "algoritm", "funcție"]):
                        programming_steps += 1
                
                print(f"   Programming-focused steps: {programming_steps}/{len(reasoning_chain)}")
                
                # Identify issues
                issues = []
                if domain_breakdown.get('programming', 0) < 0.3:
                    issues.append(f"LOW PROGRAMMING DOMAIN: {domain_breakdown.get('programming', 0):.3f}")
                if not has_programming_keywords:
                    issues.append("MISSING PROGRAMMING KEYWORDS")
                if programming_steps == 0:
                    issues.append("NO PROGRAMMING REASONING STEPS")
                if confidence < 0.5:
                    issues.append(f"LOW CONFIDENCE: {confidence}")
                
                if issues:
                    print(f"❌ Issues detected:")
                    for issue in issues:
                        print(f"      {issue}")
                else:
                    print(f"✅ No issues detected")
                    
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    print(f"\n" + "=" * 50)
    print("🔍 PROGRAMMING DIAGNOSTIC SUMMARY")
    print("=" * 50)
    print("Common issues that prevent SWE-bench success:")
    print("1. Domain classification not recognizing programming content")
    print("2. Neural responses too generic, lacking technical specificity")
    print("3. Missing programming vocabulary in reasoning steps")
    print("4. Insufficient code analysis and algorithm understanding")
    print("5. Lack of software engineering pattern recognition")

if __name__ == "__main__":
    test_programming_reasoning()