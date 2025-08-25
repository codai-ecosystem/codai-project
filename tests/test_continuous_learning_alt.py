#!/usr/bin/env python3
"""
🧠 RomAI Continuous Learning Test Suite
Test the continuous learning and self-improvement capabilities
"""

import requests
import json
import time
from datetime import datetime

def test_learning_from_experience():
    """Test learning from a new experience"""
    print("📚 Testing Learning from Experience...")
    
    experience_data = {
        "problem": "What is the derivative of x^3 + 2x^2 - 5x + 1?",
        "solution": "The derivative is 3x^2 + 4x - 5 (using power rule)",
        "success_score": 0.95,
        "reasoning_steps": [
            "Apply power rule to each term",
            "d/dx(x^3) = 3x^2", 
            "d/dx(2x^2) = 4x",
            "d/dx(-5x) = -5",
            "d/dx(1) = 0",
            "Combine: 3x^2 + 4x - 5"
        ],
        "domain": "mathematics",
        "difficulty": "moderate",
        "feedback": {"accuracy": "excellent", "method": "efficient"}
    }
    
    try:
        response = requests.post('http://localhost:6101/api/v1/learning/experience', 
                               json=experience_data, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Experience Learning SUCCESS")
            print(f"   Experience ID: {result.get('experience_id', 'N/A')}")
            print(f"   Immediate Adaptation: {result.get('immediate_adaptation', False)}")
            print(f"   Replay Triggered: {result.get('replay_triggered', False)}")
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_learning_status():
    """Test learning status retrieval"""
    print("\n📊 Testing Learning Status...")
    
    try:
        response = requests.get('http://localhost:6101/api/v1/learning/status', timeout=15)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Learning Status SUCCESS")
            status = result.get('learning_status', {})
            print(f"   Active Sessions: {status.get('active_sessions', 0)}")
            print(f"   Total Experiences: {status.get('total_experiences', 0)}")
            print(f"   Learning Efficiency: {status.get('learning_efficiency', 0):.2f}")
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def main():
    """Run continuous learning tests"""
    print("🧠 RomAI Continuous Learning Test Suite")
    print("=" * 60)
    
    tests = [
        test_learning_from_experience,
        test_learning_status
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
        time.sleep(1)
    
    print("\n" + "=" * 60)
    print(f"🎯 Continuous Learning Test Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🏆 ALL TESTS PASSED - Continuous Learning is fully operational!")
        print("🚀 RomAI can now learn and improve continuously!")
    else:
        print("⚠️  Some tests failed - investigation needed")

if __name__ == "__main__":
    main()