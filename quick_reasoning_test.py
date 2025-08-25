#!/usr/bin/env python3
"""
Quick Advanced Reasoning Test
=============================

Test just one simple query to see if the reasoning chains work now.
"""

import requests
import json

def test_simple_reasoning():
    """Test simple advanced reasoning"""
    print("🔍 Quick Advanced Reasoning Test")
    print("=" * 40)
    
    try:
        payload = {
            "problem": "What is 1 + 1?",
            "reasoning_type": "mathematical_proof",
            "quality_target": "advanced",
            "max_steps": 3
        }
        
        print(f"Problem: {payload['problem']}")
        print(f"Max steps: {payload['max_steps']}")
        print("\nSending request...")
        
        response = requests.post(
            "http://localhost:6101/agi/reasoning/advanced", 
            json=payload, 
            timeout=20
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            print(f"✅ SUCCESS:")
            print(f"   Final Answer: {result.get('final_answer', 'N/A')[:100]}...")
            print(f"   Confidence: {result.get('overall_confidence', 'N/A')}")
            print(f"   Quality: {result.get('quality_assessment', 'N/A')}")
            print(f"   Reasoning Steps: {len(result.get('reasoning_chain', []))}")
            print(f"   Domain Breakdown: {result.get('domain_breakdown', {})}")
            
            # Show reasoning chain
            chain = result.get('reasoning_chain', [])
            print(f"\n🔍 Reasoning Chain ({len(chain)} steps):")
            for i, step in enumerate(chain):
                print(f"   Step {i+1}: {step.get('reasoning', 'N/A')[:80]}...")
                print(f"           Confidence: {step.get('confidence', 'N/A')}")
                
        else:
            print(f"❌ Failed: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    test_simple_reasoning()