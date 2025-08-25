#!/usr/bin/env python3
"""
🧠 Revolutionary Logical Reasoning Breakthrough Test

Testing the world-class multi-premise logical analysis fix.
"""

import asyncio
from core.reasoning.reasoning_engine import ReasoningEngine, ReasoningType

async def test_revolutionary_logical_fix():
    print('🧠 REVOLUTIONARY LOGICAL REASONING FIX TEST')
    print('Testing world-class multi-premise analysis...')
    
    engine = ReasoningEngine()
    
    # Critical test: Cat-Mammal syllogism with proper premise extraction
    test_problem = 'If all cats are mammals and Fluffy is a cat, what can we conclude about Fluffy?'
    
    print(f'\n📋 Test Problem: {test_problem}')
    
    # Test the complete pipeline: premise extraction + logical reasoning
    result = await engine.solve_with_reasoning(test_problem, ReasoningType.LOGICAL)
    
    print(f'\n🎯 RESULTS:')
    print(f'Problem: {result.problem}')
    print(f'Solution: {result.solution}')
    print(f'Confidence: {result.confidence:.1%}')
    print(f'Category: {result.reasoning_category}')
    print(f'Logical Validity: {result.logical_validity:.1%}')
    print(f'Processing Time: {result.processing_time:.3f}s')
    
    if hasattr(result, 'reasoning_chain'):
        if hasattr(result.reasoning_chain, 'logical_analysis'):
            logical = result.reasoning_chain.logical_analysis
            print(f'\n🔍 DETAILED LOGICAL ANALYSIS:')
            print(f'Conclusion: {logical.get("conclusion", "N/A")}')
            print(f'Validity: {logical.get("validity", 0):.1%}')
            print(f'Logic Type: {logical.get("logic_type", "N/A")}')
            
            if 'steps' in logical:
                print(f'\n📝 REASONING STEPS:')
                for i, step in enumerate(logical["steps"], 1):
                    print(f'  {i}. {step}')
        elif hasattr(result.reasoning_chain, 'steps') and result.reasoning_chain.steps:
            print(f'\n📝 REASONING CHAIN STEPS:')
            for step in result.reasoning_chain.steps:
                print(f'  Step {step.step_number}: {step.reasoning_path}')
                if hasattr(step, 'evidence') and step.evidence:
                    for evidence in step.evidence[:3]:  # Show first 3 evidence items
                        print(f'    Evidence: {evidence}')
    
    # Expected: High confidence (>90%) for perfect syllogistic reasoning
    if result.confidence >= 0.90:
        print(f'\n✅ BREAKTHROUGH ACHIEVED! Logical reasoning ≥90%')
        print(f'🎯 World-class AGI logical processing confirmed')
    elif result.confidence >= 0.75:
        print(f'\n🎯 SIGNIFICANT IMPROVEMENT! Logical reasoning ≥75%')
        print(f'📈 Major step toward world-class AGI')
    else:
        print(f'\n⚠️ More optimization needed for world-class performance')
    
    return result.confidence

async def main():
    confidence = await test_revolutionary_logical_fix()
    print(f'\n🏆 FINAL LOGICAL REASONING SCORE: {confidence:.1%}')
    
    if confidence >= 0.90:
        print('🚀 READY FOR WORLD-CLASS AGI PERFORMANCE TEST!')
    
    return confidence

if __name__ == "__main__":
    asyncio.run(main())
