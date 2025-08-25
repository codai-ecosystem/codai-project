#!/usr/bin/env python3
"""Test the standalone reasoning function directly"""

import asyncio
import sys
import os

# Add paths
sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

async def test_standalone_function():
    """Test the standalone reasoning function directly"""
    
    print("🧪 TESTING: Standalone Romanian Cultural Reasoning")
    print("=" * 60)
    
    try:
        from ml.reasoning.standalone_reasoning import standalone_romanian_cultural_reasoning
        
        result = await standalone_romanian_cultural_reasoning(
            problem="How can Romanian values improve business decision-making?",
            cultural_context={"domain": "business", "emphasis": "cultural_wisdom"},
            romanian_emphasis=0.9
        )
        
        print(f"✅ SUCCESS! Result type: {type(result)}")
        print(f"📋 Status: {result.get('status', 'unknown')}")
        print(f"🎯 Reasoning Mode: {result.get('reasoning_mode', 'unknown')}")
        print(f"🔍 Keys: {list(result.keys())}")
        
        if result.get('status') == 'success':
            print(f"🇷🇴 Cultural Analysis: {result.get('cultural_analysis', {}).get('main_insight', 'N/A')}")
            print(f"💡 Conclusion: {result.get('conclusion', {}).get('main_insight', 'N/A')[:100]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED! Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_standalone_dispatcher():
    """Test the standalone reasoning dispatcher"""
    
    print("\n🧪 TESTING: Standalone Reasoning Dispatcher")
    print("=" * 60)
    
    try:
        from ml.reasoning.standalone_reasoning import standalone_reasoning_dispatch
        
        result = await standalone_reasoning_dispatch(
            problem="How can Romanian values improve business decision-making?",
            mode="romanian_cultural",
            context={"domain": "business", "emphasis": "cultural_wisdom"},
            romanian_emphasis=0.9
        )
        
        print(f"✅ SUCCESS! Result type: {type(result)}")
        print(f"📋 Status: {result.get('status', 'unknown')}")
        print(f"🎯 Mode: {result.get('reasoning_mode', result.get('mode', 'unknown'))}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED! Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_factory_method():
    """Test the factory method pattern"""
    
    print("\n🧪 TESTING: Factory Method Pattern")
    print("=" * 60)
    
    try:
        # Import the actual factory method from server
        import sys
        sys.path.append('ml/serving')
        
        # Simulate the factory method
        def get_reasoning_system():
            try:
                from ml.reasoning.standalone_reasoning import standalone_reasoning_dispatch
                return standalone_reasoning_dispatch
            except Exception as e:
                print(f"Failed to get standalone reasoning system: {e}")
                # Fallback to class-based approach
                try:
                    from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem
                    return SelfSupervisedReasoningSystem()
                except Exception as e2:
                    print(f"Fallback also failed: {e2}")
                    raise
        
        reasoning_dispatch = get_reasoning_system()
        print(f"✅ Factory method returned: {type(reasoning_dispatch)}")
        
        # Test the dispatcher
        if callable(reasoning_dispatch):
            result = await reasoning_dispatch(
                problem="Test problem",
                mode="romanian_cultural",
                context={},
                romanian_emphasis=0.9
            )
            print(f"✅ Dispatch call successful! Status: {result.get('status', 'unknown')}")
            return True
        else:
            print(f"❌ Factory returned non-callable: {reasoning_dispatch}")
            return False
        
    except Exception as e:
        print(f"❌ FAILED! Error: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    print("🔍 DEBUGGING: Standalone Reasoning System")
    print("=" * 80)
    
    success1 = await test_standalone_function()
    success2 = await test_standalone_dispatcher()
    success3 = await test_factory_method()
    
    print("=" * 80)
    if all([success1, success2, success3]):
        print("✅ ALL TESTS PASS: Standalone reasoning system works correctly!")
        print("🤔 Issue might be in server multiprocessing environment or endpoint routing")
    else:
        print("❌ SOME TESTS FAIL: Issue is in our standalone implementation")

if __name__ == "__main__":
    asyncio.run(main())