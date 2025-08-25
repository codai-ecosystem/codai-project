"""
Quick test of Phase 1 critical fixes for RomAI
"""
import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
from ml.reasoning.autonomous_scientific_engine import AutonomousScientificEngine
from ml.reasoning.world_class_programming_engine import WorldClassProgrammingEngine

async def test_phase1_fixes():
    print("🔧 TESTING PHASE 1 CRITICAL FIXES")
    print("=" * 50)
    
    # Test Mathematical Engine Fixes
    print("\n🔢 Mathematical Engine Tests:")
    math_engine = AutonomousMathEngine()
    
    tests = [
        "Calculate factorial of 5",
        "Find derivative of x^3", 
        "Solve: 2x + 5 = 15",
        "Integrate x^2 dx"
    ]
    
    for test in tests:
        try:
            result = await math_engine.solve_mathematical_problem(test)
            print(f"✓ {test}: {result.result[:50]}...")
        except Exception as e:
            print(f"❌ {test}: ERROR - {str(e)[:50]}...")
    
    # Test Scientific Engine API Fix
    print("\n🔬 Scientific Engine API Test:")
    sci_engine = AutonomousScientificEngine()
    
    try:
        result = await sci_engine.analyze_scientific_problem("Calculate kinetic energy with mass=2kg, velocity=10m/s")
        print(f"✓ Scientific API: Method exists and returns result")
    except Exception as e:
        print(f"❌ Scientific API: ERROR - {str(e)}")
    
    # Test Programming Engine Quality Fix
    print("\n💻 Programming Engine Quality Test:")
    prog_engine = WorldClassProgrammingEngine()
    
    try:
        result = await prog_engine.solve_programming_problem("Implement quicksort algorithm")
        print(f"✓ Programming Quality: {result.quality} (has quality attribute)")
    except Exception as e:
        print(f"❌ Programming Quality: ERROR - {str(e)}")
    
    print("\n✅ Phase 1 Testing Complete!")

if __name__ == "__main__":
    asyncio.run(test_phase1_fixes())