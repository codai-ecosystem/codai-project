import sys
import asyncio
sys.path.append('apps/romai/src')

# Import exactly as the server does
from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem as ActualReasoningSystem
from ml.reasoning.self_supervised_reasoning_system import ReasoningMode, ReasoningResult

# Simulate the server's import replacement pattern
SelfSupervisedReasoningSystem = ActualReasoningSystem

print("🔍 Testing server import pattern scenario...")
print(f"✅ SelfSupervisedReasoningSystem = {SelfSupervisedReasoningSystem}")
print(f"✅ ActualReasoningSystem = {ActualReasoningSystem}")
print(f"✅ Are they the same? {SelfSupervisedReasoningSystem == ActualReasoningSystem}")

# Create a models dictionary like the server
models = {}

async def test_server_scenario():
    """Test the exact server scenario"""
    try:
        # Initialize as server does
        self_supervised_reasoning_system = SelfSupervisedReasoningSystem()
        models['self_supervised_reasoning'] = self_supervised_reasoning_system
        print(f"✅ Stored in models dict: {type(models['self_supervised_reasoning'])}")
        
        # Test retrieval as server does
        reasoning_system = models.get('self_supervised_reasoning')
        print(f"✅ Retrieved from models dict: {type(reasoning_system)}")
        print(f"✅ Has reason_through_problem: {hasattr(reasoning_system, 'reason_through_problem')}")
        
        if hasattr(reasoning_system, 'reason_through_problem'):
            # Test exact server call
            result = await reasoning_system.reason_through_problem(
                problem="Test problem from business meeting context",
                mode=ReasoningMode.ROMANIAN_CULTURAL,
                context={"cultural_context": "Romanian business meeting"},
                romanian_emphasis=0.9
            )
            print(f"✅ Server scenario successful! Result: {type(result)}")
            print(f"✅ Result has to_dict: {hasattr(result, 'to_dict')}")
            return True
        else:
            print("❌ Method not found in server scenario")
            return False
            
    except Exception as e:
        print(f"❌ Server scenario failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    success = await test_server_scenario()
    print(f"\n🎯 Server scenario {'SUCCESS' if success else 'FAILED'}")

if __name__ == "__main__":
    asyncio.run(main())