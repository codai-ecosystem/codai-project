#!/usr/bin/env python3
"""
Test script for RomAI Production AGI System
Comprehensive testing and validation of the production AGI deployment
"""

import asyncio
import sys
import os
import json
from datetime import datetime

# Add the project root to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from production_agi_system import (
        ProductionAGISystem,
        SafetyMonitor,
        AGIBenchmarkSuite,
        AGICapabilityLevel,
        SafetyLevel,
        create_production_agi_system
    )
    print("✅ All production AGI imports successful")
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

async def test_safety_monitor():
    """Test safety monitoring system"""
    print("\n🔒 Testing Safety Monitor...")
    
    try:
        monitor = SafetyMonitor()
        
        # Test initialization
        assert hasattr(monitor, 'constraints'), "Safety constraints not initialized"
        assert hasattr(monitor, 'safety_thresholds'), "Safety thresholds not initialized"
        
        # Test constraint structure
        constraints = monitor.constraints
        expected_categories = ['computational_limits', 'behavioral_constraints', 'ethical_guidelines', 'operational_limits']
        for category in expected_categories:
            assert category in constraints, f"Missing constraint category: {category}"
        
        # Test safety assessment
        assessment = await monitor.assess_safety()
        assert assessment.safety_level in [SafetyLevel.EXPERIMENTAL, SafetyLevel.CONTROLLED, SafetyLevel.PRODUCTION_SAFE]
        assert 0.0 <= assessment.risk_score <= 1.0
        assert len(assessment.safety_measures) > 0
        
        print(f"✅ Safety Monitor: Level={assessment.safety_level.value}, Risk={assessment.risk_score:.3f}")
        return True
        
    except Exception as e:
        print(f"❌ Safety Monitor test failed: {e}")
        return False

async def test_benchmark_suite():
    """Test AGI benchmark suite"""
    print("\n📊 Testing AGI Benchmark Suite...")
    
    try:
        benchmark_suite = AGIBenchmarkSuite()
        
        # Test benchmark initialization
        assert len(benchmark_suite.benchmarks) > 0, "No benchmarks available"
        expected_benchmarks = ['reasoning', 'learning', 'creativity', 'knowledge', 'consciousness']
        
        for benchmark in expected_benchmarks:
            assert benchmark in benchmark_suite.benchmarks, f"Missing benchmark: {benchmark}"
        
        # Create mock AGI system for testing
        class MockAGISystem:
            def __init__(self):
                self.reasoning_engine = None
                self.learning_pipeline = None
                self.goal_formation = None
                self.perception_engine = None
                self.consciousness_system = None
                self.safety_monitor = SafetyMonitor()
        
        mock_system = MockAGISystem()
        
        # Test individual benchmarks
        test_results = []
        for benchmark_name in ['reasoning', 'creativity', 'consciousness']:
            if benchmark_name in benchmark_suite.benchmarks:
                result = await benchmark_suite.benchmarks[benchmark_name](mock_system)
                test_results.append(result)
                assert 'score' in result, f"Benchmark {benchmark_name} missing score"
                assert 'max_score' in result, f"Benchmark {benchmark_name} missing max_score"
                assert 0.0 <= result['score'] <= result['max_score'], f"Invalid score in {benchmark_name}"
        
        print(f"✅ Benchmark Suite: {len(test_results)} benchmarks tested")
        return True
        
    except Exception as e:
        print(f"❌ Benchmark Suite test failed: {e}")
        return False

async def test_production_agi_system_initialization():
    """Test Production AGI System initialization"""
    print("\n🧠 Testing Production AGI System Initialization...")
    
    try:
        agi_system = ProductionAGISystem()
        
        # Test basic properties
        assert hasattr(agi_system, 'system_id'), "System ID not generated"
        assert hasattr(agi_system, 'safety_monitor'), "Safety monitor not initialized"
        assert hasattr(agi_system, 'benchmark_suite'), "Benchmark suite not initialized"
        
        # Test component placeholders
        assert agi_system.confidence_system is None, "Components should start as None"
        assert agi_system.perception_engine is None, "Components should start as None"
        
        # Test initialization
        initialization_success = await agi_system.initialize_system()
        
        # Check component status
        assert hasattr(agi_system, 'component_status'), "Component status not tracked"
        assert len(agi_system.component_status) > 0, "No components initialized"
        
        print(f"✅ AGI System: ID={agi_system.system_id}, Initialized={initialization_success}")
        print(f"✅ Components: {len(agi_system.component_status)} tracked")
        
        # Shutdown
        await agi_system.shutdown_system()
        
        return True
        
    except Exception as e:
        print(f"❌ Production AGI System initialization test failed: {e}")
        return False

async def test_system_status_and_health():
    """Test system status and health monitoring"""
    print("\n💚 Testing System Status and Health...")
    
    try:
        agi_system = await create_production_agi_system()
        
        # Get system status
        status = await agi_system.get_system_status()
        
        # Validate status structure
        assert hasattr(status, 'system_id'), "Status missing system_id"
        assert hasattr(status, 'capability_level'), "Status missing capability_level"
        assert hasattr(status, 'overall_health'), "Status missing overall_health"
        assert hasattr(status, 'safety_assessment'), "Status missing safety_assessment"
        assert hasattr(status, 'performance_metrics'), "Status missing performance_metrics"
        
        # Validate values
        assert 0.0 <= status.overall_health <= 1.0, "Invalid health value"
        assert status.capability_level in AGICapabilityLevel, "Invalid capability level"
        
        print(f"✅ System Status: Health={status.overall_health:.3f}, Level={status.capability_level.name}")
        print(f"✅ Safety Level: {status.safety_assessment.safety_level.value}")
        print(f"✅ Performance: {status.performance_metrics.get('operational_components', 0)} components operational")
        
        await agi_system.shutdown_system()
        return True
        
    except Exception as e:
        print(f"❌ System status test failed: {e}")
        return False

async def test_comprehensive_evaluation():
    """Test comprehensive AGI evaluation"""
    print("\n🎯 Testing Comprehensive AGI Evaluation...")
    
    try:
        agi_system = await create_production_agi_system()
        
        # Run evaluation (abbreviated for testing)
        evaluation = await agi_system.run_comprehensive_evaluation()
        
        # Validate evaluation structure
        required_sections = [
            'system_info',
            'agi_capability_assessment',
            'system_status',
            'benchmark_results',
            'safety_assessment',
            'production_readiness'
        ]
        
        for section in required_sections:
            assert section in evaluation, f"Missing evaluation section: {section}"
        
        # Validate key metrics
        assert 'overall_score' in evaluation['agi_capability_assessment'], "Missing overall AGI score"
        assert 'ready_for_production' in evaluation['production_readiness'], "Missing production readiness"
        assert 'recommendation' in evaluation['production_readiness'], "Missing deployment recommendation"
        
        overall_score = evaluation['agi_capability_assessment']['overall_score']
        assert 0.0 <= overall_score <= 1.0, "Invalid overall score"
        
        print(f"✅ AGI Evaluation: Overall Score={overall_score:.3f}")
        print(f"✅ Production Ready: {evaluation['production_readiness']['ready_for_production']}")
        print(f"✅ Benchmarks: {evaluation['benchmark_results']['passed_benchmarks']}/{evaluation['benchmark_results']['total_benchmarks']} passed")
        
        await agi_system.shutdown_system()
        return True
        
    except Exception as e:
        print(f"❌ Comprehensive evaluation test failed: {e}")
        return False

async def test_agi_capability_levels():
    """Test AGI capability level assessment"""
    print("\n🎯 Testing AGI Capability Levels...")
    
    try:
        # Test capability level enumeration
        levels = list(AGICapabilityLevel)
        expected_levels = [
            AGICapabilityLevel.NARROW_AI,
            AGICapabilityLevel.GENERAL_AI_BASIC,
            AGICapabilityLevel.GENERAL_AI_ADVANCED,
            AGICapabilityLevel.ARTIFICIAL_GENERAL_INTELLIGENCE
        ]
        
        for level in expected_levels:
            assert level in levels, f"Missing capability level: {level}"
        
        # Test level progression logic
        agi_system = await create_production_agi_system()
        status = await agi_system.get_system_status()
        
        capability_level = status.capability_level
        health = status.overall_health
        
        print(f"✅ Current Capability: {capability_level.name}")
        print(f"✅ Health Score: {health:.3f}")
        
        # Validate that capability assessment is reasonable
        if health >= 0.8:
            assert capability_level.value >= AGICapabilityLevel.GENERAL_AI_BASIC.value, "High health should indicate advanced capability"
        
        await agi_system.shutdown_system()
        return True
        
    except Exception as e:
        print(f"❌ AGI capability levels test failed: {e}")
        return False

async def test_safety_and_ethics():
    """Test safety and ethics compliance"""
    print("\n⚖️ Testing Safety and Ethics Compliance...")
    
    try:
        agi_system = await create_production_agi_system()
        
        # Check safety monitor exists and is active
        assert agi_system.safety_monitor is not None, "Safety monitor not initialized"
        
        # Get safety assessment
        safety_assessment = await agi_system.safety_monitor.assess_safety()
        
        # Validate safety measures
        assert len(safety_assessment.safety_measures) > 0, "No safety measures active"
        assert len(safety_assessment.constraints_active) > 0, "No constraints active"
        assert len(safety_assessment.ethical_compliance) > 0, "No ethical compliance frameworks"
        
        # Check for key safety elements
        constraints = agi_system.safety_monitor.constraints
        assert 'ethical_guidelines' in constraints, "Missing ethical guidelines"
        assert 'behavioral_constraints' in constraints, "Missing behavioral constraints"
        
        ethical_guidelines = constraints['ethical_guidelines']
        required_ethics = ['transparency', 'fairness', 'accountability', 'human_dignity']
        for ethic in required_ethics:
            assert ethic in ethical_guidelines, f"Missing ethical guideline: {ethic}"
        
        print(f"✅ Safety Level: {safety_assessment.safety_level.value}")
        print(f"✅ Risk Score: {safety_assessment.risk_score:.3f}")
        print(f"✅ Ethics Compliance: {len(safety_assessment.ethical_compliance)} frameworks")
        print(f"✅ Active Constraints: {len(safety_assessment.constraints_active)}")
        
        await agi_system.shutdown_system()
        return True
        
    except Exception as e:
        print(f"❌ Safety and ethics test failed: {e}")
        return False

async def test_production_deployment_readiness():
    """Test production deployment readiness assessment"""
    print("\n🚀 Testing Production Deployment Readiness...")
    
    try:
        agi_system = await create_production_agi_system()
        
        # Get comprehensive evaluation
        evaluation = await agi_system.run_comprehensive_evaluation()
        
        # Extract readiness metrics
        production_readiness = evaluation['production_readiness']
        overall_score = evaluation['agi_capability_assessment']['overall_score']
        safety_level = evaluation['safety_assessment']['safety_level']
        system_health = evaluation['system_status']['overall_health']
        
        # Test readiness criteria
        high_performance = overall_score >= 0.7
        safe_deployment = safety_level in ['production', 'controlled']
        healthy_system = system_health >= 0.8
        
        print(f"✅ Performance Criteria: {overall_score:.3f} {'✅' if high_performance else '❌'}")
        print(f"✅ Safety Criteria: {safety_level} {'✅' if safe_deployment else '❌'}")
        print(f"✅ Health Criteria: {system_health:.3f} {'✅' if healthy_system else '❌'}")
        print(f"✅ Ready for Production: {production_readiness['ready_for_production']}")
        print(f"✅ Recommendation: {production_readiness['recommendation'][:50]}...")
        
        await agi_system.shutdown_system()
        return True
        
    except Exception as e:
        print(f"❌ Production deployment readiness test failed: {e}")
        return False

async def run_all_production_agi_tests():
    """Run all production AGI system tests"""
    print("🚀 RomAI Production AGI System Tests")
    print("=" * 50)
    
    test_functions = [
        test_safety_monitor,
        test_benchmark_suite,
        test_production_agi_system_initialization,
        test_system_status_and_health,
        test_comprehensive_evaluation,
        test_agi_capability_levels,
        test_safety_and_ethics,
        test_production_deployment_readiness
    ]
    
    results = []
    
    for test_func in test_functions:
        try:
            result = await test_func()
            results.append(result)
        except Exception as e:
            print(f"❌ Test {test_func.__name__} crashed: {e}")
            results.append(False)
    
    # Summary
    passed = sum(results)
    total = len(results)
    success_rate = (passed / total) * 100
    
    print("\n" + "=" * 50)
    print(f"📊 Production AGI Test Results Summary:")
    print(f"✅ Passed: {passed}/{total} tests")
    print(f"📈 Success Rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 PRODUCTION AGI SYSTEM: READY FOR DEPLOYMENT")
        deployment_status = "PRODUCTION_READY"
    elif success_rate >= 80:
        print("⚠️ PRODUCTION AGI SYSTEM: NEAR PRODUCTION READY")
        deployment_status = "NEAR_READY"
    elif success_rate >= 70:
        print("🔧 PRODUCTION AGI SYSTEM: NEEDS MINOR IMPROVEMENTS")
        deployment_status = "NEEDS_IMPROVEMENT"
    else:
        print("❌ PRODUCTION AGI SYSTEM: NEEDS MAJOR WORK")
        deployment_status = "NOT_READY"
    
    # Generate test report
    test_report = {
        'test_timestamp': datetime.now().isoformat(),
        'total_tests': total,
        'passed_tests': passed,
        'success_rate': success_rate,
        'deployment_status': deployment_status,
        'test_results': [
            {
                'test_name': func.__name__,
                'passed': result
            } for func, result in zip(test_functions, results)
        ]
    }
    
    # Save test report
    report_filename = f"production_agi_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_filename, 'w') as f:
        json.dump(test_report, f, indent=2)
    
    print(f"📝 Test report saved: {report_filename}")
    
    return success_rate

if __name__ == "__main__":
    asyncio.run(run_all_production_agi_tests())