#!/usr/bin/env python3
"""
Test Enhanced Inference Engine with Chain-of-Thought Integration
Comprehensive validation of CoT integration in the enhanced inference system
"""

import sys
import os
import asyncio
sys.path.append(os.path.join(os.path.dirname(__file__), 'apps', 'romai', 'src'))

async def test_enhanced_inference_with_cot():
    print("🚀 Testing Enhanced Inference Engine with Chain-of-Thought")
    print("=" * 60)
    
    try:
        from ml.reasoning.enhanced_inference_engine import enhanced_inference_engine
        from ml.reasoning.enhanced_inference_engine import EnhancedInferenceRequest
        print("✅ Enhanced Inference Engine imported successfully")
        
        # Test 1: Mathematical reasoning with CoT
        print("\n🔢 Test 1: Mathematical Problem with CoT Integration")
        math_request = EnhancedInferenceRequest(
            prompt="Calculate the area of a circle with radius 7 meters. Show your reasoning step by step.",
            context="Mathematical problem requiring formula application and calculation",
            domain="mathematics",
            use_enhanced_reasoning=True
        )
        
        math_response = await enhanced_inference_engine.enhanced_inference(math_request)
        print(f"📊 Mathematical CoT Integration:")
        print(f"  Enhancement Applied: {math_response.enhancement_applied}")
        print(f"  Confidence Score: {math_response.confidence_score:.3f}")
        print(f"  Processing Time: {math_response.processing_time:.2f}s")
        print(f"  Reasoning Steps: {len(math_response.reasoning_chain)}")
        
        # Check if CoT was used
        cot_found = any('CoT' in step.get('description', '') for step in math_response.reasoning_chain)
        print(f"  CoT Integration: {'✅ ACTIVE' if cot_found else '❌ MISSING'}")
        
        # Test 2: Logical reasoning with CoT
        print("\n🧠 Test 2: Logical Problem with CoT Integration")
        logic_request = EnhancedInferenceRequest(
            prompt="If all birds can fly, and penguins are birds, but penguins cannot fly, what logical issue exists here?",
            context="Logical reasoning problem with contradiction",
            domain="logic",
            use_enhanced_reasoning=True
        )
        
        logic_response = await enhanced_inference_engine.enhanced_inference(logic_request)
        print(f"📊 Logical CoT Integration:")
        print(f"  Enhancement Applied: {logic_response.enhancement_applied}")
        print(f"  Confidence Score: {logic_response.confidence_score:.3f}")
        print(f"  Reasoning Steps: {len(logic_response.reasoning_chain)}")
        
        cot_found = any('CoT' in step.get('description', '') for step in logic_response.reasoning_chain)
        print(f"  CoT Integration: {'✅ ACTIVE' if cot_found else '❌ MISSING'}")
        
        # Test 3: Abstract pattern reasoning (ARC-AGI like)
        print("\n🎯 Test 3: Abstract Pattern Recognition with CoT")
        pattern_request = EnhancedInferenceRequest(
            prompt="Analyze this pattern: ○□○□○. What comes next in the sequence?",
            context="Pattern recognition and sequence analysis",
            domain="pattern_recognition", 
            use_enhanced_reasoning=True
        )
        
        pattern_response = await enhanced_inference_engine.enhanced_inference(pattern_request)
        print(f"📊 Pattern CoT Integration:")
        print(f"  Enhancement Applied: {pattern_response.enhancement_applied}")
        print(f"  Confidence Score: {pattern_response.confidence_score:.3f}")
        print(f"  Reasoning Steps: {len(pattern_response.reasoning_chain)}")
        
        cot_found = any('CoT' in step.get('description', '') for step in pattern_response.reasoning_chain)
        print(f"  CoT Integration: {'✅ ACTIVE' if cot_found else '❌ MISSING'}")
        
        # Test 4: Complex multi-step problem
        print("\n🔄 Test 4: Complex Multi-Step Problem")
        complex_request = EnhancedInferenceRequest(
            prompt="A company has 1000 employees. 60% work remotely, 25% work hybrid, and the rest work in office. If remote workers increase by 15% next year, what will be the new distribution?",
            context="Complex business calculation with multiple steps",
            domain="business_analysis",
            use_enhanced_reasoning=True
        )
        
        complex_response = await enhanced_inference_engine.enhanced_inference(complex_request)
        print(f"📊 Complex Problem CoT Integration:")
        print(f"  Enhancement Applied: {complex_response.enhancement_applied}")
        print(f"  Confidence Score: {complex_response.confidence_score:.3f}")
        print(f"  Processing Time: {complex_response.processing_time:.2f}s")
        print(f"  Reasoning Steps: {len(complex_response.reasoning_chain)}")
        
        cot_found = any('CoT' in step.get('description', '') for step in complex_response.reasoning_chain)
        print(f"  CoT Integration: {'✅ ACTIVE' if cot_found else '❌ MISSING'}")
        
        # Analyze overall CoT integration success
        total_tests = 4
        cot_active_tests = 0
        high_confidence_tests = 0
        
        for test_name, response in [
            ("Math", math_response), 
            ("Logic", logic_response), 
            ("Pattern", pattern_response), 
            ("Complex", complex_response)
        ]:
            if any('CoT' in step.get('description', '') for step in response.reasoning_chain):
                cot_active_tests += 1
            if response.confidence_score > 0.7:
                high_confidence_tests += 1
        
        print(f"\n📈 Overall CoT Integration Results:")
        print(f"  Tests with CoT Active: {cot_active_tests}/{total_tests} ({cot_active_tests/total_tests*100:.0f}%)")
        print(f"  High Confidence Results: {high_confidence_tests}/{total_tests} ({high_confidence_tests/total_tests*100:.0f}%)")
        print(f"  CoT Integration Success: {'🎉 EXCELLENT' if cot_active_tests >= 3 else '⚠️ PARTIAL' if cot_active_tests >= 2 else '❌ FAILED'}")
        
        # Get engine statistics
        stats = enhanced_inference_engine.get_enhancement_statistics()
        print(f"\n📊 Enhanced Inference Engine Stats:")
        print(f"  Total Requests: {stats['total_requests']}")
        print(f"  Enhanced Requests: {stats['enhanced_requests']}")
        print(f"  Enhancement Rate: {stats['enhancement_rate']}")
        print(f"  Status: {stats['status']}")
        
        success = cot_active_tests >= 3 and high_confidence_tests >= 2
        print(f"\n{'🎉 CoT INTEGRATION: SUCCESS!' if success else '❌ CoT INTEGRATION: NEEDS IMPROVEMENT'}")
        
        return success
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"❌ Test Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_enhanced_inference_with_cot())
    exit(0 if success else 1)