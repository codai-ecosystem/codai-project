#!/usr/bin/env python3
"""
Phase 3A Advanced Reasoning Endpoint Testing Script
Tests the newly implemented advanced reasoning capabilities of RomAI AGI
"""

import requests
import json
import sys

def test_advanced_reasoning():
    """Test the Phase 3A advanced reasoning endpoint"""
    print("🧠 Phase 3A Advanced Reasoning Endpoint Testing")
    print("=" * 60)
    
    # Test cases for different reasoning types
    test_cases = [
        {
            "name": "Mathematical Romanian Problem",
            "problem": "Analyze this mathematical problem step by step: Ion has 3 apples. Maria gives him 2 more apples, then he eats 1 apple. How many apples does Ion have now?"
        },
        {
            "name": "Logical Reasoning", 
            "problem": "If all roses are flowers, and this object is a rose, what can we conclude about this object?"
        },
        {
            "name": "Programming Problem",
            "problem": "Explain how to implement a function that finds the factorial of a number recursively."
        }
    ]
    
    successful_tests = 0
    total_tests = len(test_cases)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 Test {i}/{total_tests}: {test_case['name']}")
        print("-" * 40)
        
        try:
            response = requests.post(
                'http://localhost:6101/api/v1/advanced-reasoning/analyze',
                json={'problem': test_case['problem']},
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Test PASSED")
                print(f"Solution: {result.get('solution', 'N/A')}")
                print(f"Reasoning Type: {result.get('reasoning_type', 'N/A')}")
                print(f"Confidence: {result.get('confidence_score', 'N/A')}")
                
                reasoning_chain = result.get('reasoning_chain', [])
                print(f"Reasoning Steps: {len(reasoning_chain)}")
                
                if reasoning_chain:
                    print("Chain Summary:")
                    for j, step in enumerate(reasoning_chain[:3]):  # Show first 3 steps
                        step_type = step.get('step_type', 'unknown')
                        step_desc = step.get('description', 'N/A')[:50] + '...'
                        print(f"  {j+1}. {step_type}: {step_desc}")
                
                successful_tests += 1
                
            elif response.status_code == 404:
                print("❌ Endpoint NOT FOUND - Advanced reasoning not yet deployed")
                print("Response:", response.text)
                
            else:
                print(f"❌ Test FAILED - Status {response.status_code}")
                print("Response:", response.text)
                
        except requests.exceptions.ConnectionError:
            print("❌ Connection Error - Server not running or endpoint unavailable")
        except requests.exceptions.Timeout:
            print("❌ Timeout Error - Request took too long")
        except Exception as e:
            print(f"❌ Error: {e}")
    
    print(f"\n📊 Phase 3A Test Results Summary:")
    print("=" * 60)
    print(f"✅ Successful Tests: {successful_tests}/{total_tests}")
    print(f"❌ Failed Tests: {total_tests - successful_tests}/{total_tests}")
    success_rate = (successful_tests / total_tests) * 100
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if successful_tests == total_tests:
        print("🎉 PHASE 3A VALIDATION: COMPLETE SUCCESS!")
        print("🚀 Advanced reasoning capabilities are fully operational")
    elif successful_tests > 0:
        print("⚠️ PHASE 3A VALIDATION: PARTIAL SUCCESS") 
        print("🔧 Some advanced reasoning features need debugging")
    else:
        print("🚨 PHASE 3A VALIDATION: FAILED")
        print("🛠️ Advanced reasoning endpoint requires implementation/deployment")
    
    return successful_tests == total_tests

if __name__ == "__main__":
    test_advanced_reasoning()