#!/usr/bin/env python3
"""
Simple ReAct Framework Test

Tests the basic functionality of the ReAct framework with various problem types.
"""

import sys
import os
import asyncio
import time

# Add paths
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..'))
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

async def test_react_framework():
    """Test ReAct framework functionality"""
    
    print("🧠 ReAct Framework - Quick Test Suite")
    print("=" * 50)
    
    try:
        # Import components - using absolute imports
        import react_types
        import react_framework
        from react_types import ReActConfig, ReActActionType
        from react_framework import ReActAgent
        print("✅ Successfully imported ReAct components")
        
        # Initialize agent
        config = ReActConfig(
            max_steps=5,
            overall_timeout=20.0,
            verbose_logging=False
        )
        agent = ReActAgent(config=config)
        print(f"✅ Agent initialized with {len(agent.action_executors)} action types")
        
        # Test problems
        test_cases = [
            {
                "name": "Simple Math",
                "problem": "What is 12 + 8?",
                "expected": "20"
            },
            {
                "name": "Word Problem", 
                "problem": "If I have 5 apples and buy 3 more, how many apples do I have?",
                "expected": "8"
            },
            {
                "name": "Logic Problem",
                "problem": "If it's raining, the ground is wet. It is raining. Is the ground wet?",
                "expected": "yes"
            }
        ]
        
        successful_tests = 0
        
        for i, test in enumerate(test_cases, 1):
            print(f"\n🔍 Test {i}: {test['name']}")
            print(f"❓ Problem: {test['problem']}")
            
            try:
                start_time = time.time()
                result = await agent.solve(test['problem'])
                execution_time = time.time() - start_time
                
                print(f"⏱️  Time: {execution_time:.2f}s")
                print(f"📊 Steps: {result.total_steps}")
                print(f"🎯 Confidence: {result.overall_confidence:.2f}")
                print(f"✅ Success: {result.success}")
                
                if result.actions_taken:
                    print(f"🔧 Actions: {[action.value for action in result.actions_taken]}")
                
                print(f"💬 Answer: {result.final_answer}")
                
                # Check if expected answer is present
                if test['expected'].lower() in result.final_answer.lower():
                    print(f"✅ Contains expected answer '{test['expected']}'")
                    successful_tests += 1
                elif result.success:
                    print(f"⚠️ Success but no expected answer '{test['expected']}'")
                    successful_tests += 0.5
                else:
                    print(f"❌ Test failed")
                    
            except Exception as e:
                print(f"❌ Error: {e}")
        
        # Summary
        print(f"\n📊 TEST SUMMARY")
        print("=" * 30)
        print(f"✅ Successful: {successful_tests}/{len(test_cases)}")
        print(f"📈 Success Rate: {successful_tests/len(test_cases)*100:.1f}%")
        
        if successful_tests >= len(test_cases) * 0.8:
            print("\n🎉 ReAct Framework is working correctly!")
            return True
        else:
            print("\n⚠️ ReAct Framework needs improvement")
            return False
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_react_framework())
    exit(0 if success else 1)