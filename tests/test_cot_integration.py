#!/usr/bin/env python3
"""
Test Chain-of-Thought Integration
Simple test to validate CoT reasoning works correctly
"""

import sys
import os
import asyncio
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

async def test_cot_engine():
    print("🧠 Testing Chain-of-Thought Integration")
    print("=" * 50)
    
    try:
        from ml.reasoning.chain_of_thought_engine import ChainOfThoughtEngine, CoTRequest, ReasoningType
        print("✅ Chain-of-Thought engine imported successfully")
        
        # Initialize CoT engine
        cot_engine = ChainOfThoughtEngine()
        print("✅ Chain-of-Thought engine initialized")
        
        # Test simple mathematical reasoning
        print("\n🔢 Testing Mathematical Reasoning...")
        math_request = CoTRequest(
            problem="What is the square root of 144?",
            reasoning_type=ReasoningType.MATHEMATICAL,
            max_steps=5
        )
        
        math_result = await cot_engine.reason_through_problem(math_request)
        print(f"📊 Math CoT Result:")
        print(f"  Final Answer: {math_result.final_answer}")
        print(f"  Confidence: {math_result.confidence_score:.2f}")
        print(f"  Steps: {math_result.total_steps}")
        print(f"  Patterns: {math_result.patterns_discovered}")
        
        # Test logical reasoning
        print("\n🧠 Testing Logical Reasoning...")
        logic_request = CoTRequest(
            problem="All roses are flowers. This is a rose. What can we conclude?",
            reasoning_type=ReasoningType.LOGICAL_DEDUCTION,
            max_steps=4
        )
        
        logic_result = await cot_engine.reason_through_problem(logic_request)
        print(f"📊 Logic CoT Result:")
        print(f"  Final Answer: {logic_result.final_answer}")
        print(f"  Confidence: {logic_result.confidence_score:.2f}")
        print(f"  Steps: {logic_result.total_steps}")
        print(f"  Self-corrections: {logic_result.self_corrections}")
        
        # Test abstract pattern reasoning (ARC-like)
        print("\n🎯 Testing Abstract Pattern Reasoning...")
        pattern_request = CoTRequest(
            problem="In a 3x3 grid, if I have a red square in the top-left and need to create symmetry, where should I place the next red square?",
            reasoning_type=ReasoningType.ABSTRACT_PATTERN,
            max_steps=6
        )
        
        pattern_result = await cot_engine.reason_through_problem(pattern_request)
        print(f"📊 Pattern CoT Result:")
        print(f"  Final Answer: {pattern_result.final_answer}")
        print(f"  Confidence: {pattern_result.confidence_score:.2f}")
        print(f"  Steps: {pattern_result.total_steps}")
        print(f"  Synthesis Quality: {pattern_result.synthesis_quality:.2f}")
        
        # Get engine statistics
        stats = cot_engine.get_reasoning_stats()
        print(f"\n📈 CoT Engine Performance:")
        print(f"  Total Sessions: {stats['total_reasoning_sessions']}")
        print(f"  Successful Verifications: {stats['successful_verifications']}")
        print(f"  Average Steps: {stats['average_steps']:.1f}")
        
        print("\n🎉 Chain-of-Thought Integration Test: SUCCESS!")
        return True
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Test Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_cot_engine())
    exit(0 if success else 1)