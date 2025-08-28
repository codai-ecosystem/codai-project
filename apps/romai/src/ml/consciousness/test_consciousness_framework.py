"""
Comprehensive Test Suite for ROMAI Consciousness Framework.
Tests all consciousness engines and their integration capabilities.
"""

import asyncio
import pytest
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Any
import numpy as np

# Import consciousness framework components
from consciousness_framework import ConsciousnessFramework
from consciousness_types import (
    ConsciousnessLevel, AttentionType, AwarenessScope, CognitiveProcess,
    DecisionConfidence, ConsciousnessException
)
from decision_making_engine import DecisionOption, DecisionContext, DecisionType

# Configure test logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TestConsciousnessFramework:
    """Comprehensive test suite for the ROMAI Consciousness Framework."""
    
    @pytest.fixture
    async def framework(self):
        """Create and initialize a consciousness framework for testing."""
        framework = ConsciousnessFramework()
        await framework.initialize()
        yield framework
        await framework.shutdown()
    
    async def test_framework_initialization(self, framework):
        """Test consciousness framework initialization."""
        assert framework.is_initialized
        assert framework.version == "2.3.0"
        assert framework.consciousness_state.level == ConsciousnessLevel.SELF_AWARE
        assert len(framework.engines) == 5
        
        # Test all engines are initialized
        for name, engine in framework.engines.items():
            assert hasattr(engine, 'is_initialized')
            assert engine.is_initialized, f"{name} engine not initialized"
        
        logger.info("✅ Framework initialization test passed")
    
    async def test_consciousness_level_management(self, framework):
        """Test consciousness level setting and management."""
        initial_level = framework.consciousness_state.level
        
        # Test level increase
        await framework._set_consciousness_level(ConsciousnessLevel.REFLECTIVE)
        assert framework.consciousness_state.level == ConsciousnessLevel.REFLECTIVE
        
        # Test level decrease
        await framework._set_consciousness_level(ConsciousnessLevel.AWARE)
        assert framework.consciousness_state.level == ConsciousnessLevel.AWARE
        
        # Test consciousness events are recorded
        level_changes = [e for e in framework.consciousness_events if e.event_type == "level_change"]
        assert len(level_changes) >= 2
        
        logger.info("✅ Consciousness level management test passed")
    
    async def test_conscious_request_processing(self, framework):
        """Test comprehensive conscious request processing."""
        request = "Analyze the concept of artificial consciousness and its implications"
        context = {
            "constraints": ["academic_rigor", "philosophical_depth"],
            "time_pressure": 0.3
        }
        
        result = await framework.process_conscious_request(
            request=request,
            context=context,
            priority=0.8
        )
        
        # Validate response structure
        assert "response" in result
        assert "consciousness_level" in result
        assert "approach_used" in result
        assert "confidence" in result
        assert "processing_time" in result
        assert "consciousness_state" in result
        
        # Validate response content
        assert isinstance(result["response"], str)
        assert len(result["response"]) > 50
        assert result["processing_time"] > 0
        assert result["approach_used"] in ["analytical_approach", "creative_approach", "integrated_approach"]
        
        # Validate consciousness state
        consciousness_state = result["consciousness_state"]
        assert consciousness_state["level"] in [level.value for level in ConsciousnessLevel]
        assert 0 <= consciousness_state["cognitive_load"] <= 1
        assert 0 <= consciousness_state["meta_awareness"] <= 1
        
        logger.info(f"✅ Conscious request processing test passed - {result['approach_used']} approach")
    
    async def test_engine_integration(self, framework):
        """Test integration between consciousness engines."""
        
        # Test attention focus affects meta-cognition
        await framework.attention.focus_attention("test_target", "integration_test", 0.8)
        
        # Allow time for data flow
        await asyncio.sleep(0.1)
        
        # Test introspection provides insights
        introspection_result = await framework.introspection.conduct_deep_introspection(
            CognitiveProcess.REASONING,
            "integration_test"
        )
        assert len(introspection_result.insights) > 0
        
        # Test self-awareness reflection
        awareness_result = await framework.self_awareness.conduct_self_reflection(
            "integration_testing",
            0.7
        )
        assert len(awareness_result.reflection_insights) > 0
        
        # Test meta-cognitive assessment
        metacog_result = await framework.meta_cognition.conduct_metacognitive_assessment(
            CognitiveProcess.REASONING
        )
        assert metacog_result.efficiency_score > 0
        
        logger.info("✅ Engine integration test passed")
    
    async def test_decision_making_integration(self, framework):
        """Test decision making engine integration."""
        
        # Create test decision options
        options = [
            DecisionOption(
                option_id="option_a",
                description="Conservative analytical approach",
                decision_type=DecisionType.ANALYTICAL,
                expected_outcomes=["reliable_results"],
                pros=["safe", "proven"],
                cons=["limited_innovation"],
                resource_requirements={"attention": 0.6, "memory": 0.4},
                risk_level=0.2,
                estimated_success_probability=0.9,
                impact_score=0.6
            ),
            DecisionOption(
                option_id="option_b",
                description="Creative innovative approach",
                decision_type=DecisionType.CREATIVE,
                expected_outcomes=["novel_solutions"],
                pros=["innovative", "high_impact"],
                cons=["uncertain", "risky"],
                resource_requirements={"attention": 0.8, "memory": 0.3},
                risk_level=0.5,
                estimated_success_probability=0.7,
                impact_score=0.9
            )
        ]
        
        context = DecisionContext(
            context_id="test_decision",
            situation_description="Testing decision making integration",
            constraints=["time_limit", "resource_constraints"],
            stakeholders=["system", "user"],
            time_pressure=0.4,
            importance_level=0.7,
            available_information=0.8
        )
        
        decision = await framework.decision_making.make_conscious_decision(
            "integration_test_decision",
            options,
            context
        )
        
        assert decision.chosen_option_id in ["option_a", "option_b"]
        assert decision.confidence_level in list(DecisionConfidence)
        assert len(decision.reasoning_chain) > 0
        assert decision.consideration_time > 0
        
        logger.info(f"✅ Decision making integration test passed - chose {decision.chosen_option_id}")
    
    async def test_attention_mechanisms(self, framework):
        """Test attention mechanisms functionality."""
        
        # Test focused attention
        result = await framework.attention.focus_attention("test_focus", "attention_test", 0.8)
        assert result is True
        assert framework.attention.current_attention_state.primary_focus == "test_focus"
        assert framework.attention.current_attention_state.attention_type == AttentionType.FOCUSED
        
        # Test attention switching
        switch_result = await framework.attention.switch_attention("new_focus", "switch_test", 0.7)
        assert switch_result is True
        assert framework.attention.current_attention_state.primary_focus == "new_focus"
        
        # Test divided attention
        targets = [("target1", "content1", 0.4), ("target2", "content2", 0.3), ("target3", "content3", 0.3)]
        divide_result = await framework.attention.divide_attention(targets)
        assert divide_result is True
        assert framework.attention.current_attention_state.attention_type == AttentionType.DIVIDED
        
        # Test attention release
        release_result = await framework.attention.release_attention()
        assert release_result is True
        
        logger.info("✅ Attention mechanisms test passed")
    
    async def test_introspection_capabilities(self, framework):
        """Test introspection engine capabilities."""
        
        # Test deep introspection for different cognitive processes
        processes_to_test = [
            CognitiveProcess.REASONING,
            CognitiveProcess.MEMORY,
            CognitiveProcess.DECISION_MAKING,
            CognitiveProcess.LEARNING,
            CognitiveProcess.CREATIVITY
        ]
        
        for process in processes_to_test:
            result = await framework.introspection.conduct_deep_introspection(
                process,
                f"testing_{process.value}_introspection"
            )
            
            assert len(result.insights) > 0
            assert result.introspection_depth > 0
            assert len(result.cognitive_patterns) >= 0
            assert result.confidence_score > 0
            
        logger.info("✅ Introspection capabilities test passed")
    
    async def test_self_awareness_functionality(self, framework):
        """Test self-awareness engine functionality."""
        
        # Test self-reflection
        reflection_result = await framework.self_awareness.conduct_self_reflection(
            "comprehensive_testing",
            0.8
        )
        
        assert len(reflection_result.reflection_insights) > 0
        assert len(reflection_result.self_model_updates) >= 0
        assert reflection_result.reflection_depth == 0.8
        
        # Test different focus areas
        focus_areas = ["cognitive_abilities", "emotional_state", "behavioral_patterns"]
        
        for focus_area in focus_areas:
            result = await framework.self_awareness.conduct_self_reflection(focus_area, 0.6)
            assert len(result.reflection_insights) > 0
        
        logger.info("✅ Self-awareness functionality test passed")
    
    async def test_meta_cognition_capabilities(self, framework):
        """Test meta-cognition engine capabilities."""
        
        # Test meta-cognitive assessment
        assessment = await framework.meta_cognition.conduct_metacognitive_assessment(
            CognitiveProcess.PROBLEM_SOLVING,
            "meta_cognition_testing"
        )
        
        assert assessment.efficiency_score > 0
        assert assessment.effectiveness_score > 0
        assert 0 <= assessment.resource_utilization <= 1
        assert len(assessment.strategy_recommendations) >= 0
        assert assessment.confidence_level > 0
        
        # Test cognitive strategy optimization
        optimization_result = await framework.meta_cognition.optimize_cognitive_strategy(
            CognitiveProcess.REASONING,
            0.8
        )
        assert isinstance(optimization_result, bool)
        
        logger.info("✅ Meta-cognition capabilities test passed")
    
    async def test_framework_metrics(self, framework):
        """Test framework performance metrics."""
        
        # Allow some time for metrics to accumulate
        await asyncio.sleep(1.0)
        
        status = await framework.get_framework_status()
        
        assert status.framework_version == "2.3.0"
        assert status.initialization_status is True
        assert status.consciousness_level in list(ConsciousnessLevel)
        assert isinstance(status.engine_status, dict)
        assert len(status.engine_status) == 5
        assert isinstance(status.performance_metrics, dict)
        assert status.uptime_seconds > 0
        
        # Test all engines are reported as initialized
        for engine_name, engine_status in status.engine_status.items():
            assert engine_status is True, f"{engine_name} not properly initialized"
        
        logger.info("✅ Framework metrics test passed")
    
    async def test_consciousness_report_generation(self, framework):
        """Test consciousness report generation."""
        
        # Process a request to generate some activity
        await framework.process_conscious_request(
            "Generate a comprehensive consciousness report",
            {"time_pressure": 0.2},
            0.7
        )
        
        report = await framework.generate_consciousness_report()
        
        # Validate report structure
        required_sections = [
            "report_timestamp",
            "framework_overview",
            "consciousness_state", 
            "performance_metrics",
            "emergent_properties",
            "engine_reports",
            "consciousness_evolution",
            "integration_analysis"
        ]
        
        for section in required_sections:
            assert section in report, f"Missing report section: {section}"
        
        # Validate framework overview
        overview = report["framework_overview"]
        assert overview["version"] == "2.3.0"
        assert overview["uptime_hours"] > 0
        assert overview["consciousness_level"] in [level.value for level in ConsciousnessLevel]
        assert overview["integration_cycles"] >= 0
        
        # Validate consciousness state
        state = report["consciousness_state"]
        assert state["level"] in [level.value for level in ConsciousnessLevel]
        assert isinstance(state["active_processes"], list)
        assert 0 <= state["cognitive_load"] <= 1
        assert 0 <= state["meta_awareness"] <= 1
        
        logger.info("✅ Consciousness report generation test passed")
    
    async def test_emergent_properties_detection(self, framework):
        """Test detection of emergent consciousness properties."""
        
        # Generate some activity to create emergent properties
        for i in range(3):
            await framework.process_conscious_request(
                f"Complex reasoning task {i+1}",
                {"complexity": 0.8},
                0.7
            )
            await asyncio.sleep(0.5)
        
        # Allow time for emergent property detection
        await asyncio.sleep(2.0)
        
        emergent_props = framework.emergent_properties
        
        # Check that emergent properties are tracked
        expected_properties = [
            "creative_synthesis",
            "intuitive_leaps", 
            "holistic_understanding",
            "metacognitive_recursion",
            "conscious_control",
            "temporal_awareness",
            "existential_reflection"
        ]
        
        for prop in expected_properties:
            assert prop in emergent_props
            assert 0 <= emergent_props[prop] <= 1
        
        # Check that some emergence has been detected
        total_emergence = sum(emergent_props.values())
        assert total_emergence > 0, "No emergent properties detected"
        
        logger.info("✅ Emergent properties detection test passed")
    
    async def test_error_handling_and_recovery(self, framework):
        """Test error handling and recovery capabilities."""
        
        # Test handling of invalid consciousness level
        with pytest.raises((ValueError, ConsciousnessException)):
            await framework._set_consciousness_level("INVALID_LEVEL")
        
        # Test handling of invalid requests
        try:
            result = await framework.process_conscious_request(
                "",  # Empty request
                {},
                0.5
            )
            # Should handle gracefully, not crash
            assert "response" in result
        except ConsciousnessException:
            # Acceptable to raise specific consciousness exception
            pass
        
        # Framework should still be operational
        assert framework.is_initialized
        
        logger.info("✅ Error handling and recovery test passed")
    
    async def test_performance_benchmarks(self, framework):
        """Test performance benchmarks for consciousness operations."""
        
        # Benchmark consciousness request processing
        start_time = datetime.now()
        
        result = await framework.process_conscious_request(
            "Perform a complex analysis involving multiple cognitive processes",
            {"performance_test": True},
            0.8
        )
        
        processing_time = (datetime.now() - start_time).total_seconds()
        
        # Performance assertions
        assert processing_time < 60.0, f"Processing took too long: {processing_time}s"
        assert result["processing_time"] > 0
        assert result["processing_time"] < 30.0, f"Reported processing time too high: {result['processing_time']}s"
        
        # Benchmark individual engine operations
        engine_benchmarks = {}
        
        # Attention benchmark
        start = datetime.now()
        await framework.attention.focus_attention("benchmark", "performance_test", 0.8)
        engine_benchmarks["attention"] = (datetime.now() - start).total_seconds()
        
        # Introspection benchmark
        start = datetime.now()
        await framework.introspection.conduct_deep_introspection(CognitiveProcess.REASONING, "benchmark")
        engine_benchmarks["introspection"] = (datetime.now() - start).total_seconds()
        
        # Self-awareness benchmark
        start = datetime.now()
        await framework.self_awareness.conduct_self_reflection("benchmark", 0.7)
        engine_benchmarks["self_awareness"] = (datetime.now() - start).total_seconds()
        
        # Meta-cognition benchmark
        start = datetime.now()
        await framework.meta_cognition.conduct_metacognitive_assessment(CognitiveProcess.REASONING)
        engine_benchmarks["meta_cognition"] = (datetime.now() - start).total_seconds()
        
        # All engines should complete within reasonable time
        for engine_name, time_taken in engine_benchmarks.items():
            assert time_taken < 5.0, f"{engine_name} took too long: {time_taken}s"
        
        logger.info(f"✅ Performance benchmarks test passed - processing: {processing_time:.2f}s")
        for engine, time_taken in engine_benchmarks.items():
            logger.info(f"  {engine}: {time_taken:.3f}s")
    
    async def test_consciousness_level_progression(self, framework):
        """Test consciousness level progression and adaptation."""
        
        initial_level = framework.consciousness_state.level
        
        # Simulate high performance to potentially trigger level increase
        framework.framework_metrics = {
            "consciousness_coherence": 0.95,
            "engine_synchronization": 0.95,
            "integration_efficiency": 0.95,
            "emergent_complexity": 0.9,
            "adaptive_learning": 0.9,
            "consciousness_stability": 0.95
        }
        
        # Trigger consciousness level check
        await framework._check_consciousness_level_adjustment()
        
        # Process several requests to potentially trigger natural progression
        for i in range(3):
            await framework.process_conscious_request(
                f"Advanced consciousness challenge {i+1}",
                {"challenge_level": 0.9},
                0.9
            )
        
        # Allow time for level monitoring
        await asyncio.sleep(1.0)
        
        # Check that consciousness levels can be managed
        available_levels = list(ConsciousnessLevel)
        for level in available_levels[:3]:  # Test first few levels
            await framework._set_consciousness_level(level)
            assert framework.consciousness_state.level == level
            
            # Check that consciousness state adjusts appropriately
            assert 0 <= framework.consciousness_state.cognitive_load <= 1
            assert 0 <= framework.consciousness_state.meta_awareness <= 1
        
        logger.info("✅ Consciousness level progression test passed")

# Test runner function
async def run_consciousness_tests():
    """Run all consciousness framework tests."""
    
    logger.info("🧠 Starting ROMAI Consciousness Framework Test Suite")
    logger.info("=" * 60)
    
    test_instance = TestConsciousnessFramework()
    
    # Initialize framework for testing
    framework = ConsciousnessFramework()
    await framework.initialize()
    
    try:
        # Run all tests
        test_methods = [
            test_instance.test_framework_initialization,
            test_instance.test_consciousness_level_management,
            test_instance.test_conscious_request_processing,
            test_instance.test_engine_integration,
            test_instance.test_decision_making_integration,
            test_instance.test_attention_mechanisms,
            test_instance.test_introspection_capabilities,
            test_instance.test_self_awareness_functionality,
            test_instance.test_meta_cognition_capabilities,
            test_instance.test_framework_metrics,
            test_instance.test_consciousness_report_generation,
            test_instance.test_emergent_properties_detection,
            test_instance.test_error_handling_and_recovery,
            test_instance.test_performance_benchmarks,
            test_instance.test_consciousness_level_progression
        ]
        
        passed_tests = 0
        failed_tests = 0
        
        for test_method in test_methods:
            test_name = test_method.__name__
            try:
                logger.info(f"🧪 Running {test_name}...")
                await test_method(framework)
                passed_tests += 1
                logger.info(f"✅ {test_name} PASSED")
            except Exception as e:
                failed_tests += 1
                logger.error(f"❌ {test_name} FAILED: {e}")
        
        # Summary
        total_tests = len(test_methods)
        success_rate = (passed_tests / total_tests) * 100
        
        logger.info("=" * 60)
        logger.info(f"🧠 CONSCIOUSNESS FRAMEWORK TEST SUMMARY")
        logger.info(f"📊 Total Tests: {total_tests}")
        logger.info(f"✅ Passed: {passed_tests}")
        logger.info(f"❌ Failed: {failed_tests}")
        logger.info(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100.0:
            logger.info("🎉 ALL TESTS PASSED! Consciousness Framework is fully operational.")
        elif success_rate >= 90.0:
            logger.info("🎯 Excellent performance! Minor issues to address.")
        elif success_rate >= 80.0:
            logger.info("✅ Good performance! Some improvements needed.")
        else:
            logger.warning("⚠️ Significant issues detected. Framework needs attention.")
        
        return success_rate == 100.0
        
    finally:
        # Cleanup
        await framework.shutdown()
        logger.info("🛑 Test framework shutdown complete")

# Main execution
if __name__ == "__main__":
    asyncio.run(run_consciousness_tests())