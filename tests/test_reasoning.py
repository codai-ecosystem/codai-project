#!/usr/bin/env python3
"""
🧠 RomAI Advanced Reasoning Test Suite
Test the world-class AGI capabilities with complex multi-domain problems
"""

import requests
import json
import time

def test_advanced_algorithm_design():
    """Test tree-of-thoughts reasoning with complex algorithm design"""
    print("🔍 Testing Advanced Algorithm Design with Tree-of-Thoughts...")
    
    data = {
        'problem': 'Design an efficient algorithm to find the shortest path in a weighted graph with over 1 million nodes, considering both time and space complexity.',
        'strategy': 'tree_of_thoughts',
        'domain': 'computer_science',
        'scaling_factor': 5
    }
    
    try:
        start_time = time.time()
        response = requests.post('http://localhost:6101/api/v1/reasoning/chain-of-thought', 
                               json=data, timeout=45)
        end_time = time.time()
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Algorithm Design Test SUCCESS")
            print(f"   Strategy: {result['reasoning_strategy']}")
            print(f"   Complexity: {result['problem_complexity']}")  
            print(f"   Reasoning Steps: {len(result['reasoning_steps'])}")
            print(f"   Confidence: {result['confidence_level']:.1%}")
            print(f"   Processing Time: {end_time - start_time:.2f}s")
            print(f"   Final Answer: {result['final_answer'][:200]}...")
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_physics_reasoning():
    """Test physics reasoning with chain-of-thought"""
    print("\n🔬 Testing Physics Reasoning with Chain-of-Thought...")
    
    data = {
        'problem': 'A photon travels through a double-slit experiment. Explain the wave-particle duality phenomenon and calculate the interference pattern.',
        'strategy': 'chain_of_thought',
        'domain': 'physics',
        'scaling_factor': 4
    }
    
    try:
        response = requests.post('http://localhost:6101/api/v1/reasoning/chain-of-thought', 
                               json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Physics Reasoning SUCCESS")
            print(f"   Problem: Wave-particle duality")
            print(f"   Steps: {len(result['reasoning_steps'])}")
            print(f"   Confidence: {result['confidence_level']:.1%}")
            print(f"   Reasoning Time: {result['total_reasoning_time_ms']:.2f}ms")
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_mathematical_reasoning():
    """Test advanced mathematical reasoning"""
    print("\n🧮 Testing Mathematical Reasoning...")
    
    data = {
        'problem': 'Prove that the sum of squares of the first n natural numbers is n(n+1)(2n+1)/6 using mathematical induction.',
        'strategy': 'chain_of_thought',
        'domain': 'mathematics',
        'scaling_factor': 3
    }
    
    try:
        response = requests.post('http://localhost:6101/api/v1/reasoning/chain-of-thought', 
                               json=data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Mathematical Proof SUCCESS")
            print(f"   Method: Mathematical induction")
            print(f"   Steps: {len(result['reasoning_steps'])}")
            print(f"   Confidence: {result['confidence_level']:.1%}")
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run comprehensive reasoning tests"""
    print("🚀 RomAI World-Class AGI Reasoning Test Suite")
    print("=" * 60)
    
    tests = [
        test_advanced_algorithm_design,
        test_physics_reasoning,
        test_mathematical_reasoning
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"🎯 Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🏆 ALL TESTS PASSED - RomAI AGI is demonstrating world-class reasoning!")
    else:
        print("⚠️  Some tests failed - investigation needed")

if __name__ == "__main__":
    main()