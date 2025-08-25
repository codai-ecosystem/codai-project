#!/usr/bin/env python3
"""
Direct test of standalone reasoning import to verify the function works
"""

import sys
import os

# Add path
sys.path.insert(0, r"e:\GitHub\codai-project\apps\romai\src")

def test_standalone_import():
    """Test standalone reasoning import"""
    
    try:
        print("🔧 Testing import of standalone reasoning...")
        from ml.reasoning.standalone_reasoning import standalone_reasoning_dispatch
        print("✅ SUCCESS: standalone_reasoning_dispatch imported successfully!")
        print(f"📝 Function type: {type(standalone_reasoning_dispatch)}")
        return standalone_reasoning_dispatch
    except Exception as e:
        print(f"❌ IMPORT FAILED: {e}")
        return None

def test_server_factory():
    """Test the server factory method"""
    try:
        print("🔧 Testing server factory method...")
        
        # Import the factory method like the server does
        from ml.reasoning.standalone_reasoning import standalone_reasoning_dispatch
        
        reasoning_system = standalone_reasoning_dispatch
        print(f"✅ Factory returned: {type(reasoning_system)}")
        return reasoning_system
        
    except Exception as e:
        print(f"❌ FACTORY FAILED: {e}")
        return None

if __name__ == "__main__":
    print("🧠 Standalone Reasoning Import Test")
    print("=" * 50)
    
    # Test direct import
    dispatch_func = test_standalone_import()
    if not dispatch_func:
        print("❌ Import test failed")
        sys.exit(1)
    
    print()  # blank line
    
    # Test server factory pattern
    factory_result = test_server_factory()
    if not factory_result:
        print("❌ Factory test failed")
        sys.exit(1)
    
    print()  # blank line
    print("🎉 ALL IMPORT TESTS PASSED!")
    print("The standalone reasoning system can be imported successfully.")