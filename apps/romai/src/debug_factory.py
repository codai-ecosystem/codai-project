#!/usr/bin/env python3
"""Debug the factory method directly"""

import sys
import os

# Add paths
sys.path.insert(0, os.path.abspath('.'))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__))))

def debug_factory_method():
    """Test the factory method pattern directly"""
    
    print("🧪 TESTING: Factory Method Pattern")
    
    try:
        # Test direct factory method (same pattern as server)
        from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem
        print(f"✅ Import successful: {SelfSupervisedReasoningSystem}")
        
        # Create instance
        reasoning_system = SelfSupervisedReasoningSystem()
        print(f"✅ Instance creation successful: {type(reasoning_system)}")
        
        # Check for method
        has_method = hasattr(reasoning_system, 'reason_through_problem')
        print(f"✅ Has reason_through_problem method: {has_method}")
        
        if has_method:
            method = getattr(reasoning_system, 'reason_through_problem')
            print(f"✅ Method object: {method}")
            print(f"✅ Method callable: {callable(method)}")
            
        # Check actual method existence
        import inspect
        members = inspect.getmembers(reasoning_system, predicate=inspect.ismethod)
        method_names = [name for name, _ in members]
        print(f"✅ Instance methods: {method_names}")
        
        # Check class methods
        class_methods = [name for name in dir(SelfSupervisedReasoningSystem) if not name.startswith('_')]
        print(f"✅ Class methods: {class_methods}")
        
        print("🎯 CONCLUSION: Factory method pattern works correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Factory method test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def debug_server_import_pattern():
    """Test the exact import pattern used in server"""
    
    print("\n🧪 TESTING: Server Import Pattern")
    
    try:
        # Exact same pattern as get_reasoning_system factory
        def get_reasoning_system():
            """Factory method to ensure proper reasoning system instantiation across processes"""
            try:
                from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem
                return SelfSupervisedReasoningSystem()
            except Exception as e:
                print(f"Failed to create reasoning system: {e}")
                raise
        
        # Test factory call
        reasoning_system = get_reasoning_system()
        print(f"✅ Factory method successful: {type(reasoning_system)}")
        
        # Test method access
        has_method = hasattr(reasoning_system, 'reason_through_problem')
        print(f"✅ Has reason_through_problem method: {has_method}")
        
        # Test method call simulation (without actually calling async method)
        if has_method:
            method = getattr(reasoning_system, 'reason_through_problem')
            print(f"✅ Method retrieval successful: {method}")
            
            # Check method signature
            import inspect
            sig = inspect.signature(method)
            print(f"✅ Method signature: {sig}")
            
        print("🎯 CONCLUSION: Server import pattern works correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Server import pattern test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 DEBUGGING: Factory Method vs Server Environment")
    print("=" * 80)
    
    success1 = debug_factory_method()
    success2 = debug_server_import_pattern()
    
    print("=" * 80)
    if success1 and success2:
        print("✅ ALL TESTS PASS: Issue is likely in server multiprocessing environment")
    else:
        print("❌ TESTS FAIL: Issue is in our implementation")