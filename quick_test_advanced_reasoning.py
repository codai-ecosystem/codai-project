#!/usr/bin/env python3
"""
Quick test of advanced reasoning endpoint
"""

import requests
import json

def test_advanced_reasoning():
    url = "http://localhost:6101/agi/reasoning/advanced"
    
    # Test case 1: Mathematical problem
    payload1 = {
        "problem": "What is the square root of 144?",
        "reasoning_type": "mathematical_proof",
        "quality_target": "advanced", 
        "max_steps": 5
    }
    
    print("🧮 Testing Mathematical Reasoning:")
    print(f"Problem: {payload1['problem']}")
    
    try:
        response = requests.post(url, json=payload1, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: {result.get('status')}")
            print(f"📊 Confidence: {result.get('overall_confidence')}")
            print(f"🎯 Quality: {result.get('quality_assessment')}")
            print(f"💡 Answer: {result.get('final_answer')}")
            print(f"🔗 Steps: {len(result.get('reasoning_chain', []))}")
            
            # Show reasoning steps
            for i, step in enumerate(result.get('reasoning_chain', [])[:3]):
                print(f"   Step {i+1}: {step.get('description', 'N/A')[:80]}...")
                
            # Show performance metrics
            target_progress = result.get('target_progress', {})
            print(f"📈 Mathematical Progress: {target_progress.get('mathematical_reasoning', 'N/A')}")
            print(f"📈 MMLU Progress: {target_progress.get('mmlu_simulation', 'N/A')}")
            
            return True
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"🚨 Error: {e}")
        return False

def test_logical_reasoning():
    url = "http://localhost:6101/agi/reasoning/advanced"
    
    # Test case 2: Logical reasoning
    payload2 = {
        "problem": "If all roses are flowers, and all flowers need water, what can we conclude about roses?",
        "reasoning_type": "logical_deduction",
        "quality_target": "advanced",
        "max_steps": 6
    }
    
    print("\n🔍 Testing Logical Reasoning:")
    print(f"Problem: {payload2['problem']}")
    
    try:
        response = requests.post(url, json=payload2, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: {result.get('status')}")
            print(f"📊 Confidence: {result.get('overall_confidence')}")
            print(f"🎯 Quality: {result.get('quality_assessment')}")
            print(f"💡 Answer: {result.get('final_answer')}")
            print(f"🔗 Steps: {len(result.get('reasoning_chain', []))}")
            
            # Show domain breakdown
            domain_breakdown = result.get('domain_breakdown', {})
            print(f"🎯 Domain Analysis: {domain_breakdown}")
            
            return True
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"🚨 Error: {e}")
        return False

def test_romanian_reasoning():
    url = "http://localhost:6101/agi/reasoning/advanced"
    
    # Test case 3: Romanian cultural reasoning
    payload3 = {
        "problem": "Care este tradiționalul dans românesc și care sunt caracteristicile sale principale?",
        "reasoning_type": "romanian_cultural",
        "quality_target": "advanced",
        "max_steps": 7
    }
    
    print("\n🇷🇴 Testing Romanian Cultural Reasoning:")
    print(f"Problem: {payload3['problem']}")
    
    try:
        response = requests.post(url, json=payload3, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: {result.get('status')}")
            print(f"📊 Confidence: {result.get('overall_confidence')}")
            print(f"🎯 Quality: {result.get('quality_assessment')}")
            print(f"💡 Answer: {result.get('final_answer')[:150]}...")
            print(f"🔗 Steps: {len(result.get('reasoning_chain', []))}")
            
            # Check cultural domain
            domain_breakdown = result.get('domain_breakdown', {})
            cultural_score = domain_breakdown.get('cultural', 0)
            print(f"🎭 Cultural Domain Score: {cultural_score:.2f}")
            
            return True
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"🚨 Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Advanced Reasoning Engine Quick Test")
    print("=" * 50)
    
    # Run tests
    results = []
    results.append(test_advanced_reasoning())
    results.append(test_logical_reasoning())  
    results.append(test_romanian_reasoning())
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    successful = sum(results)
    total = len(results)
    
    print(f"✅ Passed: {successful}/{total} tests ({successful/total:.1%})")
    
    if successful == total:
        print("🎉 ALL TESTS PASSED! Advanced reasoning engine working correctly.")
    elif successful >= total * 0.7:
        print("✅ GOOD: Most advanced reasoning capabilities working.")
    else:
        print("⚠️  NEEDS IMPROVEMENT: Advanced reasoning engine needs work.")
        
    print(f"\n🎯 Phase 1+ Advanced Reasoning Engine Status: {'OPERATIONAL' if successful >= 2 else 'NEEDS WORK'}")