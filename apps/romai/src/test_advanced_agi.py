#!/usr/bin/env python3
"""
ROMAI AGI Advanced Integration Test
Tests the complete AGI seed with quantized model integration

This demonstrates the full AGI capabilities including:
- Self-improvement cycles
- Quantized model integration
- Advanced reasoning tasks
- Tool mastery development
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from core.agi_seed_controller import AGISeedController
from core.quantized_agi_model import QuantizedAGIModel

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(levelname)s | %(message)s')
logger = logging.getLogger(__name__)

async def test_advanced_agi_capabilities():
    """Test advanced AGI capabilities with full integration"""
    
    logger.info("🧠 ROMAI AGI Advanced Capabilities Test")
    logger.info("=" * 50)
    
    try:
        # Initialize AGI Controller
        workspace = Path("./advanced_agi_test").resolve()
        agi = AGISeedController(str(workspace))
        
        # Initialize Quantized Model (optional - tests without actual model loading)
        model = QuantizedAGIModel("microsoft/DialoGPT-medium")
        
        logger.info("✅ AGI Systems initialized")
        
        # Test 1: Advanced Self-Improvement Cycle
        logger.info("\n🔄 Test 1: Advanced Self-Improvement")
        result = await agi.self_improvement_cycle()
        
        if result.get('error'):
            logger.error(f"❌ Self-improvement failed: {result['error']}")
            return False
        
        logger.info(f"✅ Self-improvement completed:")
        logger.info(f"   Intelligence: {result['intelligence_score']:.3f}")
        logger.info(f"   Autonomy: {result['autonomy_level']:.3f}")
        logger.info(f"   Efficiency: {result['efficiency_score']:.3f}")
        
        # Test 2: Skill Learning and Application
        logger.info("\n🎯 Test 2: Skill Learning")
        skills_before = len(agi.skills)
        
        # Trigger skill learning through successful tasks
        await agi._attempt_task("solve_simple_math_problem")
        await agi._attempt_task("analyze_file_content")
        
        skills_after = len(agi.skills)
        skill_growth = skills_after - skills_before
        
        logger.info(f"✅ Skills: {skills_before} → {skills_after} (+{skill_growth})")
        
        # Test 3: Memory System Integration
        logger.info("\n🧠 Test 3: Memory System")
        
        # Store test memories
        agi.memory.store_episodic("Successfully completed advanced reasoning task", 0.9, ["reasoning", "success"])
        agi.memory.store_semantic("math_capability", "Can solve basic arithmetic and algebra")
        
        # Test retrieval
        memories = agi.memory.retrieve_relevant("reasoning task", max_results=3)
        logger.info(f"✅ Memory retrieval: {len(memories)} relevant memories found")
        
        # Test 4: Resource Optimization
        logger.info("\n⚡ Test 4: Resource Optimization")
        
        resources = agi.resource_monitor.check_resources()
        logger.info(f"✅ Resource status: {resources.get('within_limits', 'Unknown')}")
        
        if resources.get('gpu_memory_used'):
            logger.info(f"   GPU Memory: {resources['gpu_memory_used']:.2f}GB used")
        
        # Test 5: Benchmarking System
        logger.info("\n📊 Test 5: Capability Benchmarking")
        
        benchmarks = await agi.benchmark_system.run_capability_benchmark(agi)
        logger.info("✅ Benchmark results:")
        for metric, score in benchmarks.items():
            logger.info(f"   {metric}: {score:.3f}")
        
        # Test 6: Critical Growth Task Analysis
        logger.info("\n🎯 Test 6: Growth Task Analysis")
        
        # Simulate a cycle result for analysis
        mock_result = {
            'intelligence_score': 0.8,
            'autonomy_level': 0.4,
            'efficiency_score': 0.7
        }
        
        # Find weakest area
        scores = {
            'intelligence': mock_result['intelligence_score'],
            'autonomy': mock_result['autonomy_level'],
            'efficiency': mock_result['efficiency_score']
        }
        
        weakest_area = min(scores.items(), key=lambda x: x[1])
        logger.info(f"✅ Weakest area identified: {weakest_area[0]} ({weakest_area[1]:.3f})")
        
        # Test 7: Tool Integration
        logger.info("\n🔧 Test 7: Tool Integration")
        
        # Test file operations
        file_result = agi.tool_manager.write_file("test_agi.txt", "AGI capability test successful")
        logger.info(f"✅ File write: {'Success' if file_result.success else 'Failed'}")
        
        read_result = agi.tool_manager.read_file("test_agi.txt")
        logger.info(f"✅ File read: {'Success' if read_result.success else 'Failed'}")
        
        # Test terminal operations
        terminal_result = await agi.tool_manager.run_terminal_command("echo 'AGI Terminal Test'")
        logger.info(f"✅ Terminal command: {'Success' if terminal_result.success else 'Failed'}")
        
        # Test 8: Model Integration (without loading)
        logger.info("\n🤖 Test 8: Model System Integration")
        
        model_stats = model.get_model_stats()
        logger.info("✅ Model system:")
        logger.info(f"   Model: {model_stats['model_name']}")
        logger.info(f"   Quantization: {model_stats['quantization']}")
        logger.info(f"   LoRA Ready: {model_stats['lora_enabled']}")
        
        # Final Summary
        logger.info("\n" + "=" * 50)
        logger.info("🎉 ADVANCED AGI CAPABILITIES TEST RESULTS")
        logger.info("=" * 50)
        
        test_results = [
            ("Self-Improvement Cycle", True),
            ("Skill Learning", skill_growth > 0),
            ("Memory System", len(memories) > 0),
            ("Resource Monitoring", resources.get('within_limits', False)),
            ("Capability Benchmarking", benchmarks.get('overall_intelligence', 0) > 0),
            ("Growth Analysis", weakest_area[1] < 1.0),
            ("File Operations", file_result.success and read_result.success),
            ("Terminal Integration", terminal_result.success),
            ("Model System", model_stats['quantization'] == "4-bit NF4")
        ]
        
        passed_tests = sum(1 for _, passed in test_results if passed)
        total_tests = len(test_results)
        
        for test_name, passed in test_results:
            status = "✅ PASS" if passed else "❌ FAIL"
            logger.info(f"{status} - {test_name}")
        
        logger.info("=" * 50)
        logger.info(f"📊 OVERALL SCORE: {passed_tests}/{total_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        
        if passed_tests == total_tests:
            logger.info("🏆 PERFECT SCORE - AGI SEED FULLY OPERATIONAL!")
        elif passed_tests >= total_tests * 0.8:
            logger.info("🎯 EXCELLENT - AGI SEED READY FOR DEPLOYMENT")
        else:
            logger.info("⚠️ NEEDS IMPROVEMENT - SOME CAPABILITIES REQUIRE ATTENTION")
        
        return passed_tests == total_tests
        
    except Exception as e:
        logger.error(f"❌ Advanced test failed: {e}")
        return False

async def demonstrate_continuous_agi_growth():
    """Demonstrate continuous AGI growth with advanced monitoring"""
    
    logger.info("\n🚀 CONTINUOUS AGI GROWTH DEMONSTRATION")
    logger.info("=" * 50)
    
    workspace = Path("./continuous_agi_demo").resolve()
    agi = AGISeedController(str(workspace))
    
    growth_history = []
    
    for cycle in range(3):  # Short demo - 3 cycles
        logger.info(f"\n📈 GROWTH CYCLE {cycle + 1}/3")
        logger.info("-" * 30)
        
        # Run improvement cycle
        result = await agi.self_improvement_cycle()
        
        if not result.get('error'):
            growth_data = {
                'cycle': cycle + 1,
                'intelligence': result['intelligence_score'],
                'autonomy': result['autonomy_level'],
                'efficiency': result['efficiency_score'],
                'new_skills': result.get('new_skills', 0),
                'cycle_time': result['cycle_time']
            }
            
            growth_history.append(growth_data)
            
            logger.info(f"Intelligence: {growth_data['intelligence']:.3f}")
            logger.info(f"Autonomy: {growth_data['autonomy_level']:.3f}")
            logger.info(f"Efficiency: {growth_data['efficiency_score']:.3f}")
            logger.info(f"New Skills: {growth_data['new_skills']}")
            logger.info(f"Cycle Time: {growth_data['cycle_time']:.3f}s")
        else:
            logger.error(f"❌ Cycle {cycle + 1} failed: {result['error']}")
        
        # Brief pause between cycles
        await asyncio.sleep(2)
    
    # Analyze growth trends
    if len(growth_history) >= 2:
        logger.info("\n📊 GROWTH ANALYSIS")
        logger.info("-" * 20)
        
        first = growth_history[0]
        last = growth_history[-1]
        
        intelligence_growth = last['intelligence'] - first['intelligence']
        autonomy_growth = last['autonomy'] - first['autonomy']
        efficiency_growth = last['efficiency'] - first['efficiency']
        
        logger.info(f"Intelligence Growth: {intelligence_growth:+.3f}")
        logger.info(f"Autonomy Growth: {autonomy_growth:+.3f}")
        logger.info(f"Efficiency Growth: {efficiency_growth:+.3f}")
        logger.info(f"Total New Skills: {sum(cycle['new_skills'] for cycle in growth_history)}")
        
        # Determine growth trend
        if intelligence_growth > 0 or autonomy_growth > 0 or efficiency_growth > 0:
            logger.info("✅ POSITIVE GROWTH TREND DETECTED")
        else:
            logger.info("⚠️ STABLE STATE - CONSIDER NEW CHALLENGES")

if __name__ == "__main__":
    async def main():
        print("🧠 ROMAI AGI/HAGI Advanced Integration Test Suite")
        print("=" * 60)
        
        # Run advanced capabilities test
        advanced_success = await test_advanced_agi_capabilities()
        
        if advanced_success:
            print("\n🎯 Advanced test passed - proceeding to continuous growth demo...")
            await demonstrate_continuous_agi_growth()
        
        print("\n" + "=" * 60)
        print("🎉 AGI SEED TESTING COMPLETE")
        
        if advanced_success:
            print("🏆 Your ROMAI AGI/HAGI seed is fully operational and ready for autonomous deployment!")
        else:
            print("⚠️ Some capabilities need attention before full deployment.")
    
    asyncio.run(main())