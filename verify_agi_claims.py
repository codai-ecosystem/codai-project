import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

async def test_real_intelligence():
    print("🔍 INDEPENDENT VERIFICATION OF ROMAI INTELLIGENCE")
    print("="*60)
    
    # Test 1: Mathematical reasoning with novel problem
    print("\n📊 1. MATHEMATICAL REASONING - NOVEL PROBLEM")
    try:
        from ml.reasoning.autonomous_math_engine import AutonomousMathEngine
        math_engine = AutonomousMathEngine()
        
        # Test with a problem NOT in the benchmark
        result = await math_engine.solve_mathematical_problem("If I have 3 apples and buy 7 more, then give away 4, how many do I have?")
        print(f"Novel math problem: {result.result}")
        print(f"Expected: 6, Got: {result.result}")
        print(f"Correct: {str(result.result) == '6'}")
    except Exception as e:
        print(f"Math engine error: {e}")
    
    # Test 2: Programming with novel problem
    print("\n💻 2. PROGRAMMING - NOVEL PROBLEM")
    try:
        from ml.reasoning.modern_code_generation_engine import ModernCodeGenerationEngine
        prog_engine = ModernCodeGenerationEngine()
        
        # Test with a problem NOT in the benchmark
        result = await prog_engine.generate_code("Create a function to calculate compound interest")
        print(f"Generated code contains 'def': {'def' in result.generated_code}")
        print(f"Generated code contains 'interest': {'interest' in result.generated_code.lower()}")
        print(f"Code preview: {result.generated_code[:100]}...")
    except Exception as e:
        print(f"Programming engine error: {e}")
    
    # Test 3: Scientific reasoning with novel problem  
    print("\n🔬 3. SCIENTIFIC - NOVEL PROBLEM")
    try:
        from ml.reasoning.autonomous_scientific_engine import AutonomousScientificEngine
        sci_engine = AutonomousScientificEngine()
        
        # Test with a problem NOT in the benchmark
        result = await sci_engine.analyze_scientific_problem("What gas do plants produce during photosynthesis?")
        print(f"Scientific result: {result.result}")
        print(f"Contains oxygen: {'oxygen' in str(result.result).lower() or 'o2' in str(result.result).lower()}")
    except Exception as e:
        print(f"Scientific engine error: {e}")
    
    # Test 4: Logical reasoning with novel problem
    print("\n🧠 4. LOGICAL - NOVEL PROBLEM")
    try:
        from ml.reasoning.autonomous_logical_engine import AutonomousLogicalEngine
        logic_engine = AutonomousLogicalEngine()
        
        # Test with a problem NOT in the benchmark
        result = await logic_engine.solve_logical_problem("All cats are mammals. Fluffy is a cat. What can we conclude about Fluffy?")
        print(f"Logical result: {result.conclusion}")
        print(f"Contains mammal: {'mammal' in str(result.conclusion).lower()}")
    except Exception as e:
        print(f"Logical engine error: {e}")

    print("\n🎯 CRITICAL ANALYSIS:")
    print("- Are these genuine AI responses or keyword matching?")
    print("- Do the engines understand context or just match patterns?") 
    print("- Is this truly AGI or sophisticated pattern recognition?")

asyncio.run(test_real_intelligence())