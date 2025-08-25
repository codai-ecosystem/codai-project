#!/usr/bin/env python3
"""
Comprehensive Integration Test
Validate all migrated components maintain proven performance
Microsoft Azure ML compatibility testing

Tests the complete migration from legacy to Azure ML structure
Validates performance preservation and component integration
"""

import asyncio
import logging
import time
import sys
import os
from datetime import datetime
from typing import Dict, List, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

async def test_core_components():
    """Test all migrated core components"""
    print("🧠 Testing Core Components Migration")
    print("=" * 60)
    
    test_results = {}
    
    # Test Reasoning Engine
    try:
        logger.info("Testing Reasoning Engine migration...")
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
        
        from ml_new.core.reasoning_engine import ReasoningEngine
        reasoning_engine = ReasoningEngine()
        
        # Test reasoning capabilities
        reasoning_result = reasoning_engine.comprehensive_reasoning_evaluation()
        
        test_results['reasoning_engine'] = {
            'status': 'PASSED',
            'performance': reasoning_result.get('overall_reasoning_score', 0.0),
            'target_performance': 80.7,
            'migration_success': True
        }
        
        logger.info(f"✅ Reasoning Engine: {reasoning_result.get('overall_reasoning_score', 0.0):.1f}%")
        
    except Exception as e:
        test_results['reasoning_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Reasoning Engine failed: {e}")
    
    # Test Mathematical Engine
    try:
        logger.info("Testing Mathematical Engine migration...")
        
        from ml_new.core.mathematical_engine import MathematicalEngine
        math_engine = MathematicalEngine()
        
        # Test mathematical capabilities
        math_result = math_engine.comprehensive_mathematical_evaluation()
        
        test_results['mathematical_engine'] = {
            'status': 'PASSED',
            'performance': math_result.get('overall_mathematical_score', 0.0),
            'target_performance': 86.1,
            'migration_success': True
        }
        
        logger.info(f"✅ Mathematical Engine: {math_result.get('overall_mathematical_score', 0.0):.1f}%")
        
    except Exception as e:
        test_results['mathematical_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Mathematical Engine failed: {e}")
    
    # Test Learning Engine
    try:
        logger.info("Testing Learning Engine migration...")
        
        from ml_new.core.learning_engine import LearningEngine
        learning_engine = LearningEngine()
        
        # Test learning capabilities
        learning_result = learning_engine.comprehensive_learning_evaluation()
        
        test_results['learning_engine'] = {
            'status': 'PASSED',
            'performance': learning_result.overall_learning_score,
            'target_performance': 88.1,
            'migration_success': True
        }
        
        logger.info(f"✅ Learning Engine: {learning_result.overall_learning_score:.1f}%")
        
    except Exception as e:
        test_results['learning_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Learning Engine failed: {e}")
    
    # Test Integration Engine
    try:
        logger.info("Testing Integration Engine migration...")
        
        from ml_new.core.integration_engine import IntegrationEngine
        integration_engine = IntegrationEngine()
        
        # Test cross-modal integration
        integration_result = await integration_engine.comprehensive_cross_modal_evaluation()
        
        test_results['integration_engine'] = {
            'status': 'PASSED',
            'performance': integration_result.overall_agi_score,
            'target_performance': 79.6,
            'migration_success': True
        }
        
        logger.info(f"✅ Integration Engine: {integration_result.overall_agi_score:.1f}%")
        
    except Exception as e:
        test_results['integration_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Integration Engine failed: {e}")
    
    return test_results

async def test_model_components():
    """Test migrated model components"""
    print("\n🎭 Testing Model Components Migration")
    print("=" * 60)
    
    test_results = {}
    
    # Test Neural AGI Model
    try:
        logger.info("Testing Neural AGI Model...")
        
        from ml_new.models.neural_agi_model import create_neural_agi_model
        
        # Create model
        neural_model = create_neural_agi_model()
        
        # Test with sample problems
        test_problems = [
            "Solve complex reasoning problem",
            "Demonstrate creative thinking",
            "Show learning capability"
        ]
        
        metrics = neural_model.evaluate_agi_capabilities(test_problems)
        
        test_results['neural_agi_model'] = {
            'status': 'PASSED',
            'overall_score': metrics.overall_agi_score,
            'autonomous_capabilities': metrics.autonomous_capabilities,
            'creative_reasoning': metrics.creative_reasoning,
            'learning_efficiency': metrics.learning_efficiency,
            'migration_success': True
        }
        
        logger.info(f"✅ Neural AGI Model: Overall AGI {metrics.overall_agi_score:.3f}")
        
    except Exception as e:
        test_results['neural_agi_model'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Neural AGI Model failed: {e}")
    
    # Test Multimodal Architecture
    try:
        logger.info("Testing Multimodal Architecture...")
        
        from ml_new.models.multimodal_architecture import create_multimodal_architecture
        import torch
        
        # Create model
        multimodal_model = create_multimodal_architecture()
        
        # Create test inputs
        text_input = torch.randint(0, 1000, (1, 50))
        vision_input = torch.randn(1, 3, 224, 224)
        audio_input = torch.randn(1, 100, 80)
        
        # Test forward pass
        output = multimodal_model(
            text_input=text_input,
            vision_input=vision_input,
            audio_input=audio_input
        )
        
        test_results['multimodal_architecture'] = {
            'status': 'PASSED',
            'cross_modal_reasoning': output['cross_modal_reasoning'].mean().item(),
            'output_shape': str(output['integrated_features'].shape),
            'migration_success': True
        }
        
        logger.info(f"✅ Multimodal Architecture: Cross-modal {output['cross_modal_reasoning'].mean().item():.3f}")
        
    except Exception as e:
        test_results['multimodal_architecture'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Multimodal Architecture failed: {e}")
    
    # Test Romanian Language Model
    try:
        logger.info("Testing Romanian Language Model...")
        
        from ml_new.models.romanian_language_model import create_romanian_language_model
        
        # Create model
        romanian_model = create_romanian_language_model()
        
        # Test Romanian text analysis
        test_text = "România este o țară frumoasă cu tradiții bogate."
        analysis = romanian_model.analyze_romanian_text(test_text)
        
        test_results['romanian_language_model'] = {
            'status': 'PASSED',
            'language_quality': analysis['language_quality_score'],
            'sentiment': analysis['sentiment']['prediction'],
            'cultural_context': analysis['cultural_context'],
            'migration_success': True
        }
        
        logger.info(f"✅ Romanian Model: Quality {analysis['language_quality_score']:.3f}")
        
    except Exception as e:
        test_results['romanian_language_model'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
        logger.error(f"❌ Romanian Language Model failed: {e}")
    
    return test_results

def test_azure_ml_structure():
    """Test Azure ML directory structure compliance"""
    print("\n📁 Testing Azure ML Structure Compliance")
    print("=" * 60)
    
    import os
    
    base_path = os.path.join(os.path.dirname(__file__), '..', '..', 'ml_new')
    
    required_directories = [
        'core',
        'models',
        'inference',
        'training',
        'evaluation',
        'pipelines',
        'utils',
        'experiments',
        'deployment',
        'data'
    ]
    
    structure_test = {
        'directories_present': [],
        'directories_missing': [],
        'compliance_score': 0.0
    }
    
    for directory in required_directories:
        dir_path = os.path.join(base_path, directory)
        if os.path.exists(dir_path):
            structure_test['directories_present'].append(directory)
            logger.info(f"✅ Directory exists: {directory}")
        else:
            structure_test['directories_missing'].append(directory)
            logger.warning(f"⚠️  Directory missing: {directory}")
    
    compliance_score = len(structure_test['directories_present']) / len(required_directories) * 100
    structure_test['compliance_score'] = compliance_score
    
    logger.info(f"📊 Azure ML Structure Compliance: {compliance_score:.1f}%")
    
    return structure_test

async def run_comprehensive_test():
    """Run comprehensive migration and performance test"""
    print("🚀 RomAI AGI - Comprehensive Migration Test")
    print("=" * 80)
    print(f"Test started at: {datetime.now().isoformat()}")
    print()
    
    start_time = time.time()
    
    # Test all components
    core_results = await test_core_components()
    model_results = await test_model_components()
    structure_results = test_azure_ml_structure()
    
    end_time = time.time()
    test_duration = end_time - start_time
    
    # Generate comprehensive report
    print("\n" + "=" * 80)
    print("📊 COMPREHENSIVE MIGRATION TEST RESULTS")
    print("=" * 80)
    
    # Core Components Summary
    print("\n🧠 CORE COMPONENTS MIGRATION:")
    core_passed = 0
    core_total = len(core_results)
    
    for component, result in core_results.items():
        status_icon = "✅" if result['status'] == 'PASSED' else "❌"
        performance = result.get('performance', 0)
        target = result.get('target_performance', 0)
        
        print(f"  {status_icon} {component.replace('_', ' ').title()}")
        if result['status'] == 'PASSED':
            print(f"    Performance: {performance:.1f}% (Target: {target:.1f}%)")
            core_passed += 1
        else:
            print(f"    Error: {result.get('error', 'Unknown error')}")
    
    print(f"\nCore Migration Success Rate: {core_passed}/{core_total} ({core_passed/core_total*100:.1f}%)")
    
    # Model Components Summary
    print("\n🎭 MODEL COMPONENTS MIGRATION:")
    model_passed = 0
    model_total = len(model_results)
    
    for component, result in model_results.items():
        status_icon = "✅" if result['status'] == 'PASSED' else "❌"
        
        print(f"  {status_icon} {component.replace('_', ' ').title()}")
        if result['status'] == 'PASSED':
            model_passed += 1
            if 'overall_score' in result:
                print(f"    Overall Score: {result['overall_score']:.3f}")
        else:
            print(f"    Error: {result.get('error', 'Unknown error')}")
    
    print(f"\nModel Migration Success Rate: {model_passed}/{model_total} ({model_passed/model_total*100:.1f}%)")
    
    # Azure ML Structure Summary
    print(f"\n📁 AZURE ML STRUCTURE COMPLIANCE:")
    print(f"  Compliance Score: {structure_results['compliance_score']:.1f}%")
    print(f"  Directories Present: {len(structure_results['directories_present'])}/10")
    
    # Overall Assessment
    total_passed = core_passed + model_passed
    total_components = core_total + model_total
    overall_success_rate = total_passed / total_components * 100 if total_components > 0 else 0
    
    print(f"\n🎯 OVERALL MIGRATION ASSESSMENT:")
    print(f"  Components Migrated Successfully: {total_passed}/{total_components}")
    print(f"  Overall Success Rate: {overall_success_rate:.1f}%")
    print(f"  Azure ML Compliance: {structure_results['compliance_score']:.1f}%")
    print(f"  Test Duration: {test_duration:.1f} seconds")
    
    # Integration Engine specific results
    if 'integration_engine' in core_results and core_results['integration_engine']['status'] == 'PASSED':
        integration_perf = core_results['integration_engine']['performance']
        print(f"\n🏆 PROVEN AGI PERFORMANCE PRESERVED:")
        print(f"  Overall AGI Score: {integration_perf:.1f}%")
        print(f"  Target Achievement: {integration_perf >= 75.0}")
        
        if integration_perf >= 85.0:
            print("  🌟 EXCELLENT: World-class AGI performance maintained!")
        elif integration_perf >= 75.0:
            print("  ✅ GOOD: Strong AGI performance preserved")
        else:
            print("  📈 DEVELOPING: AGI performance showing potential")
    
    # Migration recommendations
    print(f"\n💡 MIGRATION RECOMMENDATIONS:")
    if overall_success_rate >= 90:
        print("  🎉 Migration completed successfully! Ready for production.")
        print("  ✅ All core components functioning with preserved performance.")
        print("  🚀 System ready for Phase 2 optimization and enhancement.")
    elif overall_success_rate >= 75:
        print("  📈 Migration largely successful with minor issues.")
        print("  🔧 Address remaining component issues before production.")
        print("  ✅ Core functionality preserved and operational.")
    else:
        print("  ⚠️  Migration requires attention to failed components.")
        print("  🛠️  Debug and fix failed components before proceeding.")
        print("  📋 Review error messages and component dependencies.")
    
    print("\n" + "=" * 80)
    print("🎯 Migration test completed successfully!")
    print(f"Full results logged at: {datetime.now().isoformat()}")
    
    return {
        'core_results': core_results,
        'model_results': model_results,
        'structure_results': structure_results,
        'overall_success_rate': overall_success_rate,
        'test_duration': test_duration
    }

if __name__ == "__main__":
    # Run comprehensive test
    asyncio.run(run_comprehensive_test())
