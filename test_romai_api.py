#!/usr/bin/env python3
"""
RomAI AGI API Test Suite
Tests the RomAI model server endpoints for mathematical, logical, and cultural reasoning
"""

import requests
import json
import sys
from typing import Dict, Any

def test_server_health() -> bool:
    """Test if RomAI server is healthy"""
    try:
        response = requests.get("http://localhost:6101/health", timeout=5)
        health = response.json()
        print(f"✅ Server Health: {health['status']}")
        print(f"📊 Models Loaded: {health['models_loaded']}")
        print(f"🔧 MoE System: {health['moe_system_status']}")
        return health['status'] == 'healthy'
    except Exception as e:
        print(f"❌ Health Check Failed: {e}")
        return False

def test_mathematical_reasoning() -> bool:
    """Test mathematical reasoning capabilities"""
    try:
        test_data = {
            "problem": "What is the square root of 144?",
            "type": "mathematical"
        }
        
        response = requests.post(
            "http://localhost:6101/reason",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Math Test: {result.get('result', 'No result')}")
            print(f"📊 Confidence: {result.get('confidence', 'Unknown')}")
            return True
        else:
            print(f"❌ Math Test Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Math Test Error: {e}")
        return False

def test_logical_reasoning() -> bool:
    """Test logical reasoning capabilities"""
    try:
        test_data = {
            "problem": "All roses are flowers. This is a rose. What can we conclude?",
            "type": "logical"
        }
        
        response = requests.post(
            "http://localhost:6101/reason",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Logic Test: {result.get('conclusion', 'No conclusion')}")
            print(f"📊 Reasoning: {result.get('reasoning_chain', 'No reasoning')}")
            return True
        else:
            print(f"❌ Logic Test Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Logic Test Error: {e}")
        return False

def test_romanian_cultural_analysis() -> bool:
    """Test Romanian cultural intelligence"""
    try:
        test_data = {
            "problem": "Analyze the cultural significance of Romanian traditions",
            "type": "cultural"
        }
        
        response = requests.post(
            "http://localhost:6101/reason",
            json=test_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Cultural Test: {result.get('cultural_analysis', 'No analysis')}")
            return True
        else:
            print(f"❌ Cultural Test Failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Cultural Test Error: {e}")
        return False

def run_comprehensive_test():
    """Run all RomAI tests"""
    print("🧠 RomAI AGI Comprehensive Test Suite")
    print("=" * 50)
    
    tests_passed = 0
    total_tests = 4
    
    # Test 1: Server Health
    print("\n🏥 Testing Server Health...")
    if test_server_health():
        tests_passed += 1
    
    # Test 2: Mathematical Reasoning
    print("\n🔢 Testing Mathematical Reasoning...")
    if test_mathematical_reasoning():
        tests_passed += 1
    
    # Test 3: Logical Reasoning  
    print("\n🧮 Testing Logical Reasoning...")
    if test_logical_reasoning():
        tests_passed += 1
    
    # Test 4: Romanian Cultural Analysis
    print("\n🏛️ Testing Romanian Cultural Intelligence...")
    if test_romanian_cultural_analysis():
        tests_passed += 1
    
    # Results Summary
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tests_passed}/{total_tests} passed")
    success_rate = (tests_passed / total_tests) * 100
    print(f"🎯 Success Rate: {success_rate:.1f}%")
    
    if tests_passed == total_tests:
        print("🏆 ALL TESTS PASSED - RomAI is functioning correctly!")
        return True
    else:
        print("⚠️ SOME TESTS FAILED - RomAI needs improvement")
        return False

if __name__ == "__main__":
    success = run_comprehensive_test()
    sys.exit(0 if success else 1)