import sys
import asyncio
import inspect
sys.path.append('apps/romai/src')

from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem

async def main():
    print("🔍 Deep inspection of SelfSupervisedReasoningSystem...")
    
    # Create instance
    system = SelfSupervisedReasoningSystem()
    print(f"✅ Instance created: {type(system)}")
    print(f"🔍 Instance module: {system.__class__.__module__}")
    print(f"🔍 Instance file: {inspect.getfile(system.__class__)}")
    
    # Check all methods
    methods = [method for method in dir(system) if not method.startswith('_')]
    print(f"\n📋 Available methods ({len(methods)}):")
    for method in methods:
        print(f"   - {method}")
    
    # Specifically check reason_through_problem
    has_method = hasattr(system, 'reason_through_problem')
    print(f"\n🎯 Has reason_through_problem: {has_method}")
    
    if has_method:
        method_obj = getattr(system, 'reason_through_problem')
        print(f"🔍 Method type: {type(method_obj)}")
        print(f"🔍 Method callable: {callable(method_obj)}")
        print(f"🔍 Method signature: {inspect.signature(method_obj)}")
        
        # Try to call it
        try:
            result = await method_obj(
                problem="Test problem",
                reasoning_mode="SYSTEMATIC_ANALYSIS", 
                cultural_context=""
            )
            print(f"✅ Method call successful: {type(result)}")
            print(f"✅ Result: {result}")
        except Exception as e:
            print(f"❌ Method call failed: {e}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    asyncio.run(main())