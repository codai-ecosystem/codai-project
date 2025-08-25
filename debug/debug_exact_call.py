import sys
import asyncio
sys.path.append('apps/romai/src')

from ml.reasoning.self_supervised_reasoning_system import SelfSupervisedReasoningSystem, ReasoningMode

async def main():
    print("🔍 Testing exact server endpoint parameters...")
    
    system = SelfSupervisedReasoningSystem()
    print(f"✅ System created: {type(system)}")
    
    # Test the exact same call as the server endpoint
    try:
        result = await system.reason_through_problem(
            problem="Test problem from business meeting context",
            mode=ReasoningMode.ROMANIAN_CULTURAL,
            context={"cultural_context": "Romanian business meeting"},
            romanian_emphasis=0.9
        )
        print(f"✅ Method call successful!")
        print(f"🎯 Result type: {type(result)}")
        print(f"🎯 Result has to_dict: {hasattr(result, 'to_dict')}")
        
        if hasattr(result, 'to_dict'):
            result_dict = result.to_dict()
            print(f"🎯 Result dict keys: {list(result_dict.keys())}")
        else:
            print(f"🎯 Result content: {result}")
            
    except Exception as e:
        print(f"❌ Method call failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())