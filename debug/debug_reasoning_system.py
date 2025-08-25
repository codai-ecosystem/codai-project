#!/usr/bin/env python3
"""
Debug script to verify SelfSupervisedReasoningSystem integration
"""

import sys
import os
import traceback

# Add the proper path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

def main():
    print("🔍 Debugging SelfSupervisedReasoningSystem Integration...")
    
    try:
        # Import the class
        from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem, ReasoningMode, ReasoningResult
        print("✅ Successfully imported SelfSupervisedReasoningSystem")
        
        # Create an instance
        reasoning_system = SelfSupervisedReasoningSystem()
        print(f"✅ Successfully created instance: {type(reasoning_system)}")
        
        # Check if the method exists
        has_method = hasattr(reasoning_system, 'reason_through_problem')
        print(f"✅ Has reason_through_problem method: {has_method}")
        
        if has_method:
            method = getattr(reasoning_system, 'reason_through_problem')
            print(f"✅ Method type: {type(method)}")
            print(f"✅ Method signature: {method.__doc__ if hasattr(method, '__doc__') else 'No docstring'}")
            
        # List all methods
        methods = [m for m in dir(reasoning_system) if not m.startswith('_')]
        print(f"✅ Available methods: {methods[:10]}...")  # Show first 10
        
        # Try to call the method
        print("🧪 Testing method call...")
        import asyncio
        
        async def test_call():
            try:
                result = await reasoning_system.reason_through_problem(
                    problem="Test problem",
                    mode=ReasoningMode.CHAIN_OF_THOUGHT
                )
                print(f"✅ Method call successful: {type(result)}")
                return True
            except Exception as e:
                print(f"❌ Method call failed: {e}")
                traceback.print_exc()
                return False
        
        success = asyncio.run(test_call())
        return success
        
    except Exception as e:
        print(f"❌ Failed to debug reasoning system: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)