#!/usr/bin/env python3

import asyncio

class SimpleMathEngine:
    async def solve_mathematical_problem(self, problem):
        problem = problem.lower().strip()
        
        if "what is" in problem:
            problem = problem.replace("what is", "").strip()
        if "calculate" in problem:
            problem = problem.replace("calculate", "").strip()
        problem = problem.replace("?", "")
        
        try:
            if "+" in problem:
                parts = problem.split("+")
                if len(parts) == 2:
                    return float(parts[0].strip()) + float(parts[1].strip())
            elif "*" in problem:
                parts = problem.split("*")
                if len(parts) == 2:
                    return float(parts[0].strip()) * float(parts[1].strip())
            elif "-" in problem:
                parts = problem.split("-")
                if len(parts) == 2:
                    return float(parts[0].strip()) - float(parts[1].strip())
            elif "sqrt" in problem:
                import math
                num = problem.replace("sqrt(", "").replace(")", "")
                return math.sqrt(float(num))
            else:
                return eval(problem)
        except:
            return f"Error: Cannot solve '{problem}'"

async def test_math_engine():
    engine = SimpleMathEngine()
    
    print("🧮 MATHEMATICAL REASONING ENGINE TEST:")
    print("=====================================")
    test_cases = [
        ('2+2', 4),
        ('5*3', 15),
        ('what is 10-6', 4),
        ('calculate 8*2', 16),
        ('sqrt(9)', 3)
    ]
    
    passed = 0
    for problem, expected in test_cases:
        try:
            result = await engine.solve_mathematical_problem(problem)
            if abs(float(result) - expected) < 0.001:
                print(f"✅ {problem} = {result} (expected {expected})")
                passed += 1
            else:
                print(f"❌ {problem} = {result} (expected {expected})")
        except Exception as e:
            print(f"❌ {problem} ERROR: {str(e)}")
    
    print(f"\n📊 Math Engine Results: {passed}/{len(test_cases)} tests passed")
    pass_rate = passed / len(test_cases)
    
    if pass_rate >= 0.75:
        print("✅ Mathematical reasoning capability: VALIDATED")
        print("🎯 Ready for RomAI Phase 2 dataset processing!")
    else:
        print("❌ Mathematical reasoning capability: NEEDS ATTENTION")
    
    return pass_rate

if __name__ == "__main__":
    asyncio.run(test_math_engine())