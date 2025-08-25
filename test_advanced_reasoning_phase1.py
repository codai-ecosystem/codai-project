#!/usr/bin/env python3
"""
Test Advanced Reasoning Engine - Phase 1+
=======================================

Test suite to validate the advanced reasoning engine implementation
Target: Mathematical reasoning 20% → 85%, MMLU 0% → 50%
"""

import asyncio
import sys
import os
import time
import json
from datetime import datetime

# Add the source directory to the path
current_dir = os.path.dirname(os.path.abspath(__file__))
src_dir = os.path.join(current_dir, "src")
sys.path.insert(0, src_dir)

async def test_advanced_reasoning_engine():
    """Test the advanced reasoning engine"""
    print("🧠 Testing Phase 1+ Advanced Reasoning Engine")
    print("=" * 60)
    
    try:
        # Import the advanced reasoning engine
        from ml.reasoning.advanced_reasoning_engine import (
            AdvancedReasoningEngine, AdvancedReasoningRequest, 
            AdvancedReasoningType, ReasoningQuality
        )
        print("✅ Advanced Reasoning Engine imported successfully")
        
        # Initialize the engine
        engine = AdvancedReasoningEngine()
        print("✅ Advanced Reasoning Engine initialized")
        
        # Test cases for different reasoning types
        test_cases = [
            {
                "name": "Mathematical Reasoning Test",
                "problem": "If a train travels 120 km in 2 hours, and then 180 km in 3 hours, what is the average speed for the entire journey?",
                "reasoning_type": AdvancedReasoningType.MATHEMATICAL_PROOF,
                "expected_domain": "mathematical",
                "target_confidence": 0.8
            },
            {
                "name": "Logical Deduction Test", 
                "problem": "All cats are mammals. Fluffy is a cat. Therefore, what can we conclude about Fluffy?",
                "reasoning_type": AdvancedReasoningType.LOGICAL_DEDUCTION_CHAIN,
                "expected_domain": "logical",
                "target_confidence": 0.75
            },
            {
                "name": "Romanian Cultural Reasoning Test",
                "problem": "Care sunt principalele tradiții românești de Crăciun și care este semnificația lor culturală?",
                "reasoning_type": AdvancedReasoningType.ROMANIAN_CULTURAL_REASONING,
                "expected_domain": "cultural",
                "target_confidence": 0.7
            },
            {
                "name": "Scientific Hypothesis Test",
                "problem": "Why do plants grow taller when placed near a window compared to those in the center of a room?",
                "reasoning_type": AdvancedReasoningType.SCIENTIFIC_HYPOTHESIS,
                "expected_domain": "scientific",
                "target_confidence": 0.75
            },
            {
                "name": "Programming Logic Test",
                "problem": "What is the time complexity of a binary search algorithm and why?",
                "reasoning_type": AdvancedReasoningType.PROGRAMMING_LOGIC,
                "expected_domain": "programming",
                "target_confidence": 0.8
            }
        ]
        
        results = []
        
        print(f"\n🔍 Running {len(test_cases)} test cases...")
        print("-" * 60)
        
        for i, test_case in enumerate(test_cases, 1):
            print(f"\n🧪 Test {i}/{len(test_cases)}: {test_case['name']}")
            print(f"Problem: {test_case['problem'][:80]}...")
            
            try:
                # Create reasoning request
                request = AdvancedReasoningRequest(
                    problem=test_case["problem"],
                    reasoning_type=test_case["reasoning_type"],
                    quality_target=ReasoningQuality.ADVANCED,
                    max_steps=10,
                    enable_neural_verification=True,
                    enable_self_correction=True,
                    enable_knowledge_integration=True,
                    cultural_context="romanian"
                )
                
                # Execute reasoning
                start_time = time.time()
                result = await engine.reason_through_problem(request)
                execution_time = time.time() - start_time
                
                # Evaluate results
                success = result.overall_confidence >= test_case["target_confidence"]
                quality_level = result.quality_assessment.value
                
                print(f"   ✅ Final Answer: {result.final_answer[:100]}...")
                print(f"   📊 Confidence: {result.overall_confidence:.2f} (target: {test_case['target_confidence']:.2f})")
                print(f"   🎯 Quality: {quality_level}")
                print(f"   ⏱️  Time: {execution_time:.2f}s")
                print(f"   🔗 Steps: {len(result.reasoning_chain)}")
                print(f"   🧠 Neural Verification: {result.neural_verification_score:.2f}")
                print(f"   🔄 Self-Corrections: {result.self_corrections_count}")
                print(f"   📚 Knowledge Integration: {result.knowledge_integration_score:.2f}")
                
                # Check domain analysis
                expected_domain = test_case["expected_domain"]
                if expected_domain in result.domain_breakdown:
                    domain_score = result.domain_breakdown[expected_domain]
                    print(f"   🎯 Domain Match ({expected_domain}): {domain_score:.2f}")
                else:
                    print(f"   ⚠️  Domain '{expected_domain}' not detected")
                
                # Record result
                results.append({
                    "test_name": test_case["name"],
                    "success": success,
                    "confidence": result.overall_confidence,
                    "quality": quality_level,
                    "execution_time": execution_time,
                    "steps": len(result.reasoning_chain),
                    "neural_score": result.neural_verification_score,
                    "corrections": result.self_corrections_count,
                    "knowledge_score": result.knowledge_integration_score,
                    "domain_breakdown": result.domain_breakdown,
                    "patterns": result.pattern_synthesis
                })
                
                if success:
                    print(f"   🎉 TEST PASSED")
                else:
                    print(f"   ❌ TEST FAILED (confidence below target)")
                    
            except Exception as e:
                print(f"   🚨 TEST ERROR: {e}")
                results.append({
                    "test_name": test_case["name"],
                    "success": False,
                    "error": str(e)
                })
        
        # Overall results
        print("\n" + "=" * 60)
        print("📊 OVERALL TEST RESULTS")
        print("=" * 60)
        
        successful_tests = sum(1 for r in results if r.get("success", False))
        total_tests = len(results)
        success_rate = successful_tests / total_tests if total_tests > 0 else 0
        
        print(f"✅ Successful Tests: {successful_tests}/{total_tests} ({success_rate:.1%})")
        
        if successful_tests > 0:
            # Calculate averages for successful tests
            successful_results = [r for r in results if r.get("success", False)]
            
            avg_confidence = sum(r.get("confidence", 0) for r in successful_results) / len(successful_results)
            avg_execution_time = sum(r.get("execution_time", 0) for r in successful_results) / len(successful_results)
            avg_steps = sum(r.get("steps", 0) for r in successful_results) / len(successful_results)
            avg_neural_score = sum(r.get("neural_score", 0) for r in successful_results) / len(successful_results)
            total_corrections = sum(r.get("corrections", 0) for r in successful_results)
            avg_knowledge_score = sum(r.get("knowledge_score", 0) for r in successful_results) / len(successful_results)
            
            print(f"📈 Average Confidence: {avg_confidence:.2f}")
            print(f"⏱️  Average Execution Time: {avg_execution_time:.2f}s")
            print(f"🔗 Average Steps: {avg_steps:.1f}")
            print(f"🧠 Average Neural Score: {avg_neural_score:.2f}")
            print(f"🔄 Total Self-Corrections: {total_corrections}")
            print(f"📚 Average Knowledge Score: {avg_knowledge_score:.2f}")
            
            # Quality distribution
            quality_counts = {}
            for r in successful_results:
                quality = r.get("quality", "unknown")
                quality_counts[quality] = quality_counts.get(quality, 0) + 1
            
            print(f"\n🎯 Quality Distribution:")
            for quality, count in quality_counts.items():
                print(f"   {quality}: {count} tests")
        
        # Performance summary from engine
        performance_summary = engine.get_performance_summary()
        
        print(f"\n🚀 ENGINE PERFORMANCE SUMMARY")
        print("-" * 60)
        print(f"Status: {performance_summary['advanced_reasoning_engine']}")
        print(f"Phase 1 Integration: {performance_summary['phase1_integration']}")
        
        metrics = performance_summary['metrics']
        print(f"Total Requests: {metrics['total_requests']}")
        print(f"Average Confidence: {metrics['average_confidence']:.2f}")
        print(f"Success Rate: {metrics['success_rate']:.1%}")
        print(f"Mathematical Accuracy: {metrics['mathematical_accuracy']:.1%}")
        print(f"MMLU Simulation: {metrics['mmlu_simulation_score']:.1%}")
        
        target_progress = performance_summary['target_progress']
        print(f"\n🎯 TARGET PROGRESS")
        print("-" * 60)
        for key, value in target_progress.items():
            print(f"{key}: {value}")
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"advanced_reasoning_test_results_{timestamp}.json"
        
        test_summary = {
            "timestamp": datetime.now().isoformat(),
            "total_tests": total_tests,
            "successful_tests": successful_tests,
            "success_rate": success_rate,
            "test_results": results,
            "performance_summary": performance_summary,
            "phase1_status": "Enhanced reasoning engine operational"
        }
        
        with open(results_file, 'w', encoding='utf-8') as f:
            json.dump(test_summary, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Results saved to: {results_file}")
        
        # Final assessment
        print(f"\n🎉 PHASE 1+ ADVANCED REASONING ENGINE TEST COMPLETE")
        
        if success_rate >= 0.8:
            print("🏆 EXCELLENT: Advanced reasoning engine performing at high level!")
        elif success_rate >= 0.6:
            print("✅ GOOD: Advanced reasoning engine performing adequately")
        elif success_rate >= 0.4:
            print("⚠️  NEEDS IMPROVEMENT: Some reasoning capabilities working")
        else:
            print("❌ CRITICAL: Advanced reasoning engine needs significant work")
        
        return test_summary
        
    except ImportError as e:
        print(f"❌ Failed to import advanced reasoning engine: {e}")
        print("Make sure the advanced_reasoning_engine.py is properly created")
        return None
    
    except Exception as e:
        print(f"🚨 Unexpected error during testing: {e}")
        import traceback
        print(traceback.format_exc())
        return None

async def test_server_integration():
    """Test server integration"""
    print("\n🌐 Testing Server Integration")
    print("-" * 60)
    
    try:
        import requests
        
        # Test advanced reasoning endpoint
        test_url = "http://localhost:6101/agi/reasoning/advanced"
        
        test_payload = {
            "problem": "What is 15 × 24 and explain the calculation step by step?",
            "reasoning_type": "mathematical_proof",
            "quality_target": "advanced",
            "max_steps": 8
        }
        
        print(f"🔍 Testing endpoint: {test_url}")
        print(f"📝 Payload: {test_payload}")
        
        response = requests.post(test_url, json=test_payload, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Server integration successful!")
            print(f"📊 Status: {result.get('status')}")
            print(f"🎯 Confidence: {result.get('overall_confidence', 'N/A')}")
            print(f"🔗 Steps: {len(result.get('reasoning_chain', []))}")
            print(f"💡 Final Answer: {result.get('final_answer', 'N/A')[:100]}...")
            return True
        else:
            print(f"❌ Server integration failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("⚠️  Server not running - skipping server integration test")
        print("💡 To test server integration, start the server with:")
        print("   python apps/romai/src/ml/serving/model_server.py")
        return None
        
    except Exception as e:
        print(f"🚨 Server integration test error: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Phase 1+ Advanced Reasoning Engine Test Suite")
    print("=" * 80)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test advanced reasoning engine
    engine_results = await test_advanced_reasoning_engine()
    
    # Test server integration
    server_results = await test_server_integration()
    
    print("\n" + "=" * 80)
    print("🏁 ALL TESTS COMPLETE")
    print("=" * 80)
    
    if engine_results:
        engine_success_rate = engine_results.get("success_rate", 0)
        print(f"🧠 Advanced Reasoning Engine: {engine_success_rate:.1%} success rate")
        
        if engine_success_rate >= 0.8:
            print("🎯 TARGET ACHIEVED: Mathematical reasoning improvements on track!")
            print("📈 Progress toward 85% mathematical reasoning and 50% MMLU targets")
        else:
            print("🔄 IMPROVEMENT NEEDED: Continue enhancing reasoning capabilities")
    
    if server_results is True:
        print("🌐 Server Integration: ✅ Working")
    elif server_results is False:
        print("🌐 Server Integration: ❌ Failed")
    else:
        print("🌐 Server Integration: ⚠️  Not tested (server not running)")
    
    print(f"\n⏰ Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    # Change to the correct working directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run the async main function
    asyncio.run(main())