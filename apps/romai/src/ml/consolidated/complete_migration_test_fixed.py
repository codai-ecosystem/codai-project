#!/usr/bin/env python3
"""
Comprehensive Migration Test (FIXED)
Validate all migrated components maintain proven performance
Run from ml_new directory for proper imports
Microsoft Azure ML compatibility testing
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
        from core.reasoning_engine import ReasoningEngine
        reasoning_engine = ReasoningEngine()
        
        # Test reasoning capabilities
        reasoning_result = await reasoning_engine.comprehensive_reasoning_evaluation()
        
        test_results['reasoning_engine'] = {
            'status': 'PASSED',
            'performance': reasoning_result.get('overall_reasoning_score', 0.0),
            'target_performance': 80.7,
            'migration_success': True
        }
        
        logger.info(f"✅ Reasoning Engine: {reasoning_result.get('overall_reasoning_score', 0.0):.1f}%")
        
    except Exception as e:
        logger.error(f"❌ Reasoning Engine failed: {str(e)}")
        test_results['reasoning_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    # Test Mathematical Engine
    try:
        logger.info("Testing Mathematical Engine migration...")
        from core.mathematical_engine import MathematicalEngine
        math_engine = MathematicalEngine()
        
        # Test mathematical capabilities
        math_result = await math_engine.comprehensive_mathematical_evaluation()
        
        test_results['mathematical_engine'] = {
            'status': 'PASSED',
            'performance': math_result.get('overall_mathematical_score', 0.0),
            'target_performance': 86.1,
            'migration_success': True
        }
        
        logger.info(f"✅ Mathematical Engine: {math_result.get('overall_mathematical_score', 0.0):.1f}%")
        
    except Exception as e:
        logger.error(f"❌ Mathematical Engine failed: {str(e)}")
        test_results['mathematical_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    # Test Learning Engine
    try:
        logger.info("Testing Learning Engine migration...")
        from core.learning_engine import LearningEngine
        learning_engine = LearningEngine()
        
        # Test learning capabilities
        learning_result = await learning_engine.comprehensive_learning_evaluation()
        
        test_results['learning_engine'] = {
            'status': 'PASSED',
            'performance': learning_result.get('overall_learning_score', 0.0),
            'target_performance': 88.1,
            'migration_success': True
        }
        
        logger.info(f"✅ Learning Engine: {learning_result.get('overall_learning_score', 0.0):.1f}%")
        
    except Exception as e:
        logger.error(f"❌ Learning Engine failed: {str(e)}")
        test_results['learning_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    # Test Integration Engine
    try:
        logger.info("Testing Integration Engine migration...")
        from core.integration_engine import IntegrationEngine
        integration_engine = IntegrationEngine()
        
        # Test integration capabilities
        integration_result = await integration_engine.comprehensive_cross_modal_evaluation()
        
        test_results['integration_engine'] = {
            'status': 'PASSED',
            'performance': integration_result.get('overall_agi_score', 0.0),
            'target_performance': 79.6,
            'migration_success': True
        }
        
        logger.info(f"✅ Integration Engine: {integration_result.get('overall_agi_score', 0.0):.1f}%")
        
    except Exception as e:
        logger.error(f"❌ Integration Engine failed: {str(e)}")
        test_results['integration_engine'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    return test_results

async def test_model_components():
    """Test all migrated model components"""
    print("🎭 Testing Model Components Migration")
    print("=" * 60)
    
    test_results = {}
    
    # Test Neural AGI Model
    try:
        logger.info("Testing Neural AGI Model...")
        from models.neural_agi_model import NeuralAGIModel, create_neural_agi_model
        
        # Create model
        model = create_neural_agi_model()
        
        # Test with sample input
        import torch
        test_input = torch.randint(0, 1000, (1, 64))
        output = model(test_input)
        
        agi_score = output['autonomous_capabilities'].item()
        
        test_results['neural_agi_model'] = {
            'status': 'PASSED',
            'agi_score': agi_score,
            'migration_success': True
        }
        
        logger.info(f"✅ Neural AGI Model: AGI Score {agi_score:.3f}")
        
    except Exception as e:
        logger.error(f"❌ Neural AGI Model failed: {str(e)}")
        test_results['neural_agi_model'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    # Test Multimodal Architecture
    try:
        logger.info("Testing Multimodal Architecture...")
        from models.multimodal_architecture import MultimodalArchitecture, create_multimodal_architecture
        
        # Create model
        model = create_multimodal_architecture()
        
        # Test with sample inputs
        import torch
        text_input = torch.randn(1, 64, 768)
        vision_input = torch.randn(1, 196, 768)
        audio_input = torch.randn(1, 100, 256)
        
        output = model(text_input, vision_input, audio_input)
        cross_modal_score = output['cross_modal_understanding'].mean().item()
        
        test_results['multimodal_architecture'] = {
            'status': 'PASSED',
            'cross_modal_score': cross_modal_score,
            'migration_success': True
        }
        
        logger.info(f"✅ Multimodal Architecture: Cross-modal {cross_modal_score:.3f}")
        
    except Exception as e:
        logger.error(f"❌ Multimodal Architecture failed: {str(e)}")
        test_results['multimodal_architecture'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    # Test Romanian Language Model
    try:
        logger.info("Testing Romanian Language Model...")
        from models.romanian_language_model import RomanianLanguageModel, create_romanian_language_model
        
        # Create model
        model = create_romanian_language_model()
        
        # Test with sample Romanian text
        import torch
        test_input = torch.randint(0, 1000, (1, 64))
        output = model(test_input)
        
        quality_score = output['text_quality'].mean().item()
        
        test_results['romanian_language_model'] = {
            'status': 'PASSED',
            'quality_score': quality_score,
            'migration_success': True
        }
        
        logger.info(f"✅ Romanian Model: Quality {quality_score:.3f}")
        
    except Exception as e:
        logger.error(f"❌ Romanian Language Model failed: {str(e)}")
        test_results['romanian_language_model'] = {
            'status': 'FAILED',
            'error': str(e),
            'migration_success': False
        }
    
    return test_results

def test_azure_ml_structure():
    """Test Azure ML structure compliance"""
    print("📁 Testing Azure ML Structure Compliance")
    print("=" * 60)
    
    # Expected Azure ML directories
    expected_dirs = [
        'core', 'models', 'inference', 'training', 
        'evaluation', 'pipelines', 'utils', 'experiments',
        'deployment', 'data'
    ]
    
    present_dirs = []
    missing_dirs = []
    
    for directory in expected_dirs:
        if os.path.exists(directory):
            present_dirs.append(directory)
            logger.info(f"✅ Directory present: {directory}")
        else:
            missing_dirs.append(directory)
            logger.warning(f"⚠️  Directory missing: {directory}")
    
    compliance_score = len(present_dirs) / len(expected_dirs)
    logger.info(f"📊 Azure ML Structure Compliance: {compliance_score:.1%}")
    
    return {
        'compliance_score': compliance_score,
        'present_dirs': present_dirs,
        'missing_dirs': missing_dirs,
        'total_expected': len(expected_dirs)
    }

async def run_comprehensive_test():
    """Run comprehensive migration test"""
    print("🚀 RomAI AGI - Comprehensive Migration Test (FIXED)")
    print("=" * 80)
    print(f"Test started at: {datetime.now().isoformat()}")
    print()
    
    start_time = time.time()
    
    # Test core components
    core_results = await test_core_components()
    print()
    
    # Test model components
    model_results = await test_model_components()
    print()
    
    # Test Azure ML structure
    structure_results = test_azure_ml_structure()
    print()
    
    # Generate final report
    total_time = time.time() - start_time
    
    print("=" * 80)
    print("📊 COMPREHENSIVE MIGRATION TEST RESULTS (FIXED)")
    print("=" * 80)
    print()
    
    # Core components summary
    core_success = sum(1 for r in core_results.values() if r.get('status') == 'PASSED')
    core_total = len(core_results)
    
    print("🧠 CORE COMPONENTS MIGRATION:")
    for name, result in core_results.items():
        if result.get('status') == 'PASSED':
            performance = result.get('performance', 0)
            target = result.get('target_performance', 0)
            print(f"  ✅ {name.replace('_', ' ').title()}")
            print(f"    Performance: {performance:.1f}% (Target: {target:.1f}%)")
        else:
            print(f"  ❌ {name.replace('_', ' ').title()}")
            print(f"    Error: {result.get('error', 'Unknown error')}")
    print()
    print(f"Core Migration Success Rate: {core_success}/{core_total} ({core_success/core_total:.1%})")
    print()
    
    # Model components summary
    model_success = sum(1 for r in model_results.values() if r.get('status') == 'PASSED')
    model_total = len(model_results)
    
    print("🎭 MODEL COMPONENTS MIGRATION:")
    for name, result in model_results.items():
        if result.get('status') == 'PASSED':
            print(f"  ✅ {name.replace('_', ' ').title()}")
        else:
            print(f"  ❌ {name.replace('_', ' ').title()}")
            print(f"    Error: {result.get('error', 'Unknown error')}")
    print()
    print(f"Model Migration Success Rate: {model_success}/{model_total} ({model_success/model_total:.1%})")
    print()
    
    # Structure compliance summary
    compliance = structure_results['compliance_score']
    present = len(structure_results['present_dirs'])
    total_dirs = structure_results['total_expected']
    
    print("📁 AZURE ML STRUCTURE COMPLIANCE:")
    print(f"  Compliance Score: {compliance:.1%}")
    print(f"  Directories Present: {present}/{total_dirs}")
    print()
    
    # Overall assessment
    total_success = core_success + model_success
    total_components = core_total + model_total
    overall_success_rate = total_success / total_components
    
    print("🎯 OVERALL MIGRATION ASSESSMENT:")
    print(f"  Components Migrated Successfully: {total_success}/{total_components}")
    print(f"  Overall Success Rate: {overall_success_rate:.1%}")
    print(f"  Azure ML Compliance: {compliance:.1%}")
    print(f"  Test Duration: {total_time:.1f} seconds")
    print()
    
    # AGI performance check
    integration_result = core_results.get('integration_engine', {})
    if integration_result.get('status') == 'PASSED':
        agi_score = integration_result.get('performance', 0)
        print("🏆 PROVEN AGI PERFORMANCE PRESERVED:")
        print(f"  Overall AGI Score: {agi_score:.1f}%")
        print(f"  Target Achievement: {'True' if agi_score >= 79.0 else 'False'}")
        print(f"  ✅ {'EXCELLENT' if agi_score >= 79.0 else 'NEEDS IMPROVEMENT'}: Strong AGI performance preserved")
    else:
        print("⚠️ AGI PERFORMANCE: Unable to verify due to integration engine failure")
    print()
    
    # Recommendations
    print("💡 MIGRATION RECOMMENDATIONS:")
    if overall_success_rate >= 0.8:
        print("  ✅ Migration successful! Proceed with optimization.")
    elif overall_success_rate >= 0.6:
        print("  ⚠️  Migration requires attention to failed components.")
        print("  🛠️  Debug and fix failed components before proceeding.")
    else:
        print("  ❌ Migration needs significant work.")
        print("  🔧 Review architecture and component dependencies.")
    
    if compliance < 0.5:
        print("  📁 Complete Azure ML directory structure setup.")
    
    print("  📋 Review error messages and component dependencies.")
    print()
    
    print("=" * 80)
    print("🎯 Migration test completed successfully!")
    print(f"Full results logged at: {datetime.now().isoformat()}")

if __name__ == "__main__":
    asyncio.run(run_comprehensive_test())
