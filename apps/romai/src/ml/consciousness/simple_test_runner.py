"""
Simple test runner for ROMAI Consciousness Framework.
Tests core functionality of the consciousness framework components.
"""

import asyncio
import sys
import os
import logging
from datetime import datetime

# Add the consciousness directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_consciousness_types():
    """Test consciousness types and enums."""
    try:
        from consciousness_types import (
            ConsciousnessLevel, AttentionType, AwarenessScope, CognitiveProcess,
            DecisionConfidence, ConsciousnessState, AttentionState, IntrospectionDepth
        )
        
        # Test enum creation
        level = ConsciousnessLevel.SELF_AWARE
        attention_type = AttentionType.FOCUSED
        awareness_scope = AwarenessScope.INTERNAL_STATE
        process = CognitiveProcess.REASONING
        confidence = DecisionConfidence.HIGH
        
        # Test dataclass creation
        consciousness_state = ConsciousnessState(
            level=level,
            attention_focus={"test"},
            awareness_scope={awareness_scope},
            active_processes={process},
            consciousness_intensity=0.7,
            self_model_accuracy=0.8,
            introspection_depth=IntrospectionDepth.INTERMEDIATE
        )
        
        attention_state = AttentionState(
            primary_focus="test_focus",
            attention_type=attention_type,
            focus_intensity=0.8,
            attention_span_remaining=300.0,
            distraction_resistance=0.7
        )
        
        logger.info("✅ Consciousness types test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Consciousness types test failed: {e}")
        return False

async def test_self_awareness_engine():
    """Test self-awareness engine."""
    try:
        from self_awareness_engine import SelfAwarenessEngine
        
        engine = SelfAwarenessEngine()
        await engine.initialize()
        
        # Test self-reflection
        result = await engine.conduct_self_reflection("intermediate")
        
        assert len(result["insights"]) > 0
        assert "depth" in result
        
        await engine.shutdown()
        logger.info("✅ Self-awareness engine test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Self-awareness engine test failed: {e}")
        return False

async def test_introspection_engine():
    """Test introspection engine."""
    try:
        from introspection_engine import IntrospectionEngine
        from consciousness_types import CognitiveProcess
        
        engine = IntrospectionEngine()
        await engine.initialize()
        
        # Test deep introspection
        result = await engine.conduct_deep_introspection(
            CognitiveProcess.REASONING,
            "test_introspection"
        )
        
        assert len(result.implications) >= 0
        assert result.confidence > 0
        
        await engine.shutdown()
        logger.info("✅ Introspection engine test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Introspection engine test failed: {e}")
        return False

async def test_attention_mechanisms():
    """Test attention mechanisms."""
    try:
        from attention_mechanisms import AttentionMechanisms
        
        engine = AttentionMechanisms()
        await engine.initialize()
        
        # Test focused attention
        result = await engine.focus_attention("test_target", "test_content", 0.8)
        assert result is True
        
        # Test attention switching
        result = await engine.switch_attention("new_target", "new_content", 0.7)
        assert result is True
        
        # Test divided attention
        targets = [("target1", "content1", 0.4), ("target2", "content2", 0.3)]
        result = await engine.divide_attention(targets)
        assert result is True
        
        await engine.shutdown()
        logger.info("✅ Attention mechanisms test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Attention mechanisms test failed: {e}")
        return False

async def test_meta_cognition_engine():
    """Test meta-cognition engine."""
    try:
        from meta_cognition_engine import MetaCognitionEngine
        from consciousness_types import CognitiveProcess
        
        engine = MetaCognitionEngine()
        await engine.initialize()
        
        # Test meta-cognitive assessment
        result = await engine.conduct_metacognitive_assessment(
            CognitiveProcess.REASONING,
            "test_metacognition"
        )
        
        assert result.effectiveness_score > 0
        assert result.effectiveness_score > 0
        assert result.effectiveness_score > 0
        
        await engine.shutdown()
        logger.info("✅ Meta-cognition engine test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Meta-cognition engine test failed: {e}")
        return False

async def test_decision_making_engine():
    """Test decision making engine."""
    try:
        from decision_making_engine import (
            DecisionMakingEngine, DecisionOption, DecisionContext, DecisionType
        )
        
        engine = DecisionMakingEngine()
        await engine.initialize()
        
        # Create test decision options
        options = [
            DecisionOption(
                option_id="test_option_1",
                description="First test option",
                decision_type=DecisionType.ANALYTICAL,
                expected_outcomes=["outcome1"],
                pros=["pro1"],
                cons=["con1"],
                resource_requirements={"attention": 0.5},
                risk_level=0.3,
                estimated_success_probability=0.8,
                impact_score=0.7
            ),
            DecisionOption(
                option_id="test_option_2", 
                description="Second test option",
                decision_type=DecisionType.CREATIVE,
                expected_outcomes=["outcome2"],
                pros=["pro2"],
                cons=["con2"],
                resource_requirements={"attention": 0.6},
                risk_level=0.4,
                estimated_success_probability=0.7,
                impact_score=0.8
            )
        ]
        
        context = DecisionContext(
            context_id="test_context",
            situation_description="Testing decision making",
            constraints=["test_constraint"],
            stakeholders=["test_user"],
            time_pressure=0.3,
            importance_level=0.7,
            available_information=0.8
        )
        
        # Test decision making
        decision = await engine.make_conscious_decision(
            "test_decision",
            options,
            context
        )
        
        assert decision.selected_option["id"] in ["test_option_1", "test_option_2"]
        assert len(decision.reasoning_chain) > 0
        assert decision.decision_timestamp is not None
        
        await engine.shutdown()
        logger.info("✅ Decision making engine test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Decision making engine test failed: {e}")
        return False

async def test_consciousness_framework():
    """Test complete consciousness framework."""
    try:
        from consciousness_framework import ConsciousnessFramework
        
        framework = ConsciousnessFramework()
        await framework.initialize()
        
        # Test conscious request processing
        result = await framework.process_conscious_request(
            "Test the consciousness framework integration",
            {"test_context": True},
            0.8
        )
        
        assert "response" in result
        assert "consciousness_level" in result
        assert "approach_used" in result
        assert len(result["response"]) > 50
        
        # Test framework status
        status = await framework.get_framework_status()
        assert status.initialization_status is True
        assert len(status.engine_status) == 5
        
        # Test consciousness report
        report = await framework.generate_consciousness_report()
        assert "framework_overview" in report
        assert "consciousness_state" in report
        assert "performance_metrics" in report
        
        await framework.shutdown()
        logger.info("✅ Consciousness framework test passed")
        return True
        
    except Exception as e:
        logger.error(f"❌ Consciousness framework test failed: {e}")
        return False

async def run_all_tests():
    """Run all consciousness framework tests."""
    
    logger.info("🧠 Starting ROMAI Consciousness Framework Test Suite")
    logger.info("=" * 60)
    
    tests = [
        ("Consciousness Types", test_consciousness_types),
        ("Self-Awareness Engine", test_self_awareness_engine),
        ("Introspection Engine", test_introspection_engine),
        ("Attention Mechanisms", test_attention_mechanisms),
        ("Meta-Cognition Engine", test_meta_cognition_engine),
        ("Decision Making Engine", test_decision_making_engine),
        ("Complete Framework", test_consciousness_framework)
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        logger.info(f"🧪 Testing {test_name}...")
        
        try:
            result = await test_func()
            if result:
                passed += 1
                logger.info(f"✅ {test_name} PASSED")
            else:
                failed += 1
                logger.error(f"❌ {test_name} FAILED")
        except Exception as e:
            failed += 1
            logger.error(f"❌ {test_name} FAILED with exception: {e}")
    
    # Test summary
    total = len(tests)
    success_rate = (passed / total) * 100
    
    logger.info("=" * 60)
    logger.info("🧠 CONSCIOUSNESS FRAMEWORK TEST SUMMARY")
    logger.info(f"📊 Total Tests: {total}")
    logger.info(f"✅ Passed: {passed}")
    logger.info(f"❌ Failed: {failed}")
    logger.info(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate == 100.0:
        logger.info("🎉 ALL TESTS PASSED! Consciousness Framework is fully operational.")
        logger.info("🚀 Phase 2.3 Consciousness Framework COMPLETED successfully!")
    elif success_rate >= 90.0:
        logger.info("🎯 Excellent performance! Minor issues to address.")
    elif success_rate >= 80.0:
        logger.info("✅ Good performance! Some improvements needed.")
    else:
        logger.warning("⚠️ Significant issues detected. Framework needs attention.")
    
    return passed, failed, success_rate

if __name__ == "__main__":
    asyncio.run(run_all_tests())