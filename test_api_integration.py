#!/usr/bin/env python3
"""
Full API Integration Test for Enhanced Mathematical Parser
Tests the complete pipeline from HTTP API to enhanced mathematical parsing
"""

import asyncio
import aiohttp
import json
import sys
from typing import Dict, Any

async def test_api_integration():
    """Test the enhanced mathematical parser through the full API pipeline"""
    print("🌐 Testing Enhanced Mathematical Parser - Full API Integration")
    print("=" * 70)
    
    # RomAI AGI server endpoint
    base_url = "http://localhost:6101"
    
    # Test if server is running
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{base_url}/health") as response:
                if response.status == 200:
                    health_data = await response.json()
                    print(f"✅ RomAI Server Health: {health_data.get('status', 'Unknown')}")
                else:
                    print(f"❌ Server health check failed: {response.status}")
                    return
    except Exception as e:
        print(f"❌ Cannot connect to RomAI server: {e}")
        print("💡 Make sure the RomAI AGI Model Server is running on localhost:6101")
        print("💡 Use VS Code task: 'Start RomAI AGI Model Server'")
        return
    
    # Test cases for enhanced mathematical parsing
    test_cases = [
        {
            "name": "Basic Addition Question",
            "input": "What is 2+2?",
            "expected_result": 4.0,
            "test_enhanced_parsing": True
        },
        {
            "name": "Multiplication Calculation",
            "input": "Calculate 8*2",
            "expected_result": 16.0,
            "test_enhanced_parsing": True
        },
        {
            "name": "Complex Question",
            "input": "What is the result of 15/3?",
            "expected_result": 5.0,
            "test_enhanced_parsing": True
        },
        {
            "name": "Romanian Question",
            "input": "Ce este 6+4?",
            "expected_result": 10.0,
            "test_enhanced_parsing": True
        },
        {
            "name": "Direct Expression",
            "input": "sqrt(16)",
            "expected_result": 4.0,
            "test_enhanced_parsing": True
        },
        {
            "name": "Complex Parentheses",
            "input": "(2+3)*4",
            "expected_result": 20.0,
            "test_enhanced_parsing": False  # This should work with existing patterns
        },
        {
            "name": "Power Operation",
            "input": "What is 5^2?",
            "expected_result": 25.0,
            "test_enhanced_parsing": True
        }
    ]
    
    print(f"\\n🧮 Testing {len(test_cases)} mathematical queries through API:")
    print("-" * 70)
    
    success_count = 0
    enhanced_parser_success_count = 0
    
    async with aiohttp.ClientSession() as session:
        for i, test_case in enumerate(test_cases, 1):
            try:
                print(f"\\n{i}. {test_case['name']}: '{test_case['input']}'")
                
                # Make API request to mathematical-reasoning endpoint
                payload = {
                    "problem": test_case["input"],
                    "method": "enhanced_reasoning"
                }
                
                async with session.post(
                    f"{base_url}/api/v1/mathematical-reasoning/solve",
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    if response.status == 200:
                        result_data = await response.json()
                        
                        # Extract the numerical result
                        actual_result = None
                        if "result" in result_data:
                            result_value = result_data["result"]
                            if isinstance(result_value, (int, float)):
                                actual_result = float(result_value)
                            elif isinstance(result_value, str):
                                # Try to extract number from string result
                                import re
                                numbers = re.findall(r'-?\\d+\\.?\\d*', result_value)
                                if numbers:
                                    actual_result = float(numbers[0])
                        
                        # Check if result matches expected
                        if actual_result is not None and abs(actual_result - test_case["expected_result"]) < 0.01:
                            print(f"   ✅ Result: {actual_result} (Expected: {test_case['expected_result']})")
                            success_count += 1
                            
                            # Check if enhanced parsing was used
                            method_used = result_data.get("method", "unknown")
                            if test_case["test_enhanced_parsing"] and "enhanced" in method_used.lower():
                                print(f"   🚀 Enhanced parser used: {method_used}")
                                enhanced_parser_success_count += 1
                            elif test_case["test_enhanced_parsing"]:
                                print(f"   ⚠️ Enhanced parser not used: {method_used}")
                        else:
                            print(f"   ❌ Result mismatch: {actual_result} (Expected: {test_case['expected_result']})")
                            print(f"   📄 Full response: {json.dumps(result_data, indent=2)}")
                            
                    else:
                        error_text = await response.text()
                        print(f"   ❌ API Error {response.status}: {error_text}")
                        
            except asyncio.TimeoutError:
                print(f"   ❌ Timeout: Request took longer than 30 seconds")
            except Exception as e:
                print(f"   ❌ Error: {e}")
    
    print("\\n" + "=" * 70)
    print(f"📊 API Integration Test Summary:")
    print(f"✅ Successful API calls: {success_count}/{len(test_cases)} ({success_count/len(test_cases)*100:.1f}%)")
    
    enhanced_test_count = sum(1 for tc in test_cases if tc["test_enhanced_parsing"])
    print(f"🚀 Enhanced parser usage: {enhanced_parser_success_count}/{enhanced_test_count} ({enhanced_parser_success_count/enhanced_test_count*100:.1f}%)")
    
    if success_count >= len(test_cases) * 0.8:
        print("🎉 API INTEGRATION SUCCESS: Enhanced parser working through full pipeline!")
        
        if enhanced_parser_success_count >= enhanced_test_count * 0.7:
            print("🚀 ENHANCED PARSING SUCCESS: Most queries using enhanced parser!")
        else:
            print("⚠️ Enhanced parser could be used more frequently")
    else:
        print("⚠️ API INTEGRATION ISSUES: Multiple test cases failed")
        print("💡 Check server logs and mathematical engine configuration")
    
    return success_count >= len(test_cases) * 0.8

if __name__ == "__main__":
    success = asyncio.run(test_api_integration())
    sys.exit(0 if success else 1)