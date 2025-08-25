#!/usr/bin/env python3
"""
Debug Advanced Reasoning Endpoint - Critical Issue Investigation
================================================================

The benchmark suite revealed that all responses have:
- Fixed confidence = 0.3
- Quality = "basic" 
- Domain scores near 0

This suggests the advanced reasoning engine is not properly integrated.
"""

import requests
import json
import sys

def test_advanced_reasoning_endpoint():
    """Test the advanced reasoning endpoint directly"""
    print("🔍 Debugging Advanced Reasoning Endpoint Integration")
    print("=" * 60)
    
    # Test cases with expected behavior
    test_cases = [
        {
            "name": "Simple Math",
            "payload": {
                "problem": "What is 2 + 2?",
                "reasoning_type": "mathematical_proof",
                "quality_target": "advanced",
                "max_steps": 3
            },
            "expected_confidence": "> 0.8",
            "expected_quality": "advanced or expert"
        },
        {
            "name": "Romanian Cultural",
            "payload": {
                "problem": "Care este capitala României?",
                "reasoning_type": "romanian_cultural",
                "quality_target": "expert",
                "max_steps": 2
            },
            "expected_confidence": "> 0.9",
            "expected_quality": "expert"
        }
    ]
    
    server_url = "http://localhost:6101"
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['name']}")
        print("-" * 30)
        print(f"Problem: {test_case['payload']['problem']}")
        print(f"Expected Confidence: {test_case['expected_confidence']}")
        print(f"Expected Quality: {test_case['expected_quality']}")
        
        try:
            response = requests.post(
                f"{server_url}/agi/reasoning/advanced", 
                json=test_case['payload'], 
                timeout=30
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                
                # Extract key metrics
                confidence = result.get("overall_confidence", 0)
                quality = result.get("quality_assessment", "unknown")
                domain_breakdown = result.get("domain_breakdown", {})
                reasoning_chain = result.get("reasoning_chain", [])
                final_answer = result.get("final_answer", "")
                
                print(f"✅ Response received:")
                print(f"   Confidence: {confidence} (Expected: {test_case['expected_confidence']})")
                print(f"   Quality: {quality} (Expected: {test_case['expected_quality']})")
                print(f"   Reasoning Steps: {len(reasoning_chain)}")
                print(f"   Domain Breakdown: {domain_breakdown}")
                print(f"   Answer Length: {len(final_answer)} chars")
                
                # Check for issues
                issues = []
                if confidence <= 0.3:
                    issues.append(f"⚠️  LOW CONFIDENCE: {confidence} (should be > 0.5)")
                if quality == "basic" and test_case['payload']['quality_target'] in ['advanced', 'expert']:
                    issues.append(f"⚠️  LOW QUALITY: {quality} (should be {test_case['payload']['quality_target']})")
                if len(reasoning_chain) < 2:
                    issues.append(f"⚠️  SHORT REASONING: {len(reasoning_chain)} steps (should be > 2)")
                if sum(domain_breakdown.values()) < 0.1:
                    issues.append(f"⚠️  NO DOMAIN EXPERTISE: {sum(domain_breakdown.values()):.3f}")
                
                if issues:
                    print(f"❌ ISSUES DETECTED:")
                    for issue in issues:
                        print(f"   {issue}")
                else:
                    print(f"✅ Test passed - no issues detected")
                
            else:
                print(f"❌ Request failed: {response.status_code}")
                print(f"Error: {response.text}")
                
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    print(f"\n" + "=" * 60)
    print("🔍 DIAGNOSTIC SUMMARY")
    print("=" * 60)
    print("If all tests show:")
    print("- Fixed confidence = 0.3")
    print("- Quality = 'basic'")  
    print("- Domain scores near 0")
    print("- Short reasoning chains")
    print("")
    print("Then the issue is likely:")
    print("1. Advanced reasoning engine not called by endpoint")
    print("2. Fallback to mock/default responses")
    print("3. Integration bug in model_server.py")
    print("4. Real Neural Inference Engine misconfiguration")

if __name__ == "__main__":
    test_advanced_reasoning_endpoint()