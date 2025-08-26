import sys
import asyncio
sys.path.insert(0, 'apps/romai/src')

from ml.reasoning.autonomous_scientific_engine import AutonomousScientificEngine

async def test_chemistry():
    engine = AutonomousScientificEngine()
    result = await engine.analyze_scientific_problem('What is the chemical formula for water?')
    print(f'Result: {result.result}')
    print(f'All result properties: {dir(result)}')
    print(f'Has analysis: {hasattr(result, "analysis")}')
    if hasattr(result, 'analysis'):
        print(f'Analysis: {result.analysis}')
    print(f'Explanation: {result.explanation}')
    print(f'Has H2O in result: {"H2O" in str(result.result)}')
    print(f'Has H2O in explanation: {"H2O" in str(result.explanation)}')
    
asyncio.run(test_chemistry())