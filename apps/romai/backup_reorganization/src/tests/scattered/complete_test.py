#!/usr/bin/env python3
"""
RomAI Comprehensive System Evaluation
Tests all core components and advanced models to determine overall AGI performance
"""

import sys
import asyncio
sys.path.append('.')

async def comprehensive_romai_evaluation():
    print('🚀 RomAI COMPREHENSIVE SYSTEM EVALUATION')
    print('=' * 60)
    
    component_scores = {}
    
    try:
        # Test core components
        print('📊 CORE COMPONENTS:')
        
        # Mathematical Engine
        from ml_new.core.mathematical_engine import MathematicalEngine
        math_engine = MathematicalEngine()
        math_result = math_engine.comprehensive_mathematical_evaluation()
        component_scores['mathematical'] = math_result['overall_mathematical_score'] * 100
        print(f'✅ Mathematical Engine: {math_result["overall_mathematical_score"] * 100:.1f}%')
        
        # Reasoning Engine
        from ml_new.core.reasoning_engine import ReasoningEngine
        reasoning_engine = ReasoningEngine()
        reasoning_result = await reasoning_engine.comprehensive_reasoning_evaluation()
        component_scores['reasoning'] = reasoning_result.overall_agi_score
        print(f'✅ Reasoning Engine: {reasoning_result.overall_agi_score:.1f}%')
        
        # Learning Engine
        from ml_new.core.learning_engine import LearningEngine
        learning_engine = LearningEngine()
        learning_result = await learning_engine.comprehensive_learning_evaluation()
        component_scores['learning'] = learning_result.overall_agi_score
        print(f'✅ Learning Engine: {learning_result.overall_agi_score:.1f}%')
        
        # Integration Engine
        from ml_new.core.integration_engine import IntegrationEngine
        integration_engine = IntegrationEngine()
        integration_result = await integration_engine.comprehensive_cross_modal_evaluation()
        component_scores['integration'] = integration_result.overall_agi_score
        print(f'✅ Integration Engine: {integration_result.overall_agi_score:.1f}%')
        
        print()
        print('🧠 ADVANCED MODELS:')
        
        # Neural AGI Model
        from ml_new.models.neural_agi_model import NeuralAGIModel
        neural_model = NeuralAGIModel()
        neural_result = neural_model.evaluate_agi_capabilities(['Test complex reasoning'])
        component_scores['neural_agi'] = neural_result.overall_agi_score * 100
        print(f'✅ Neural AGI Model: {neural_result.overall_agi_score * 100:.1f}%')
        
        # Authentic AGI Engine
        from ml_new.models.authentic_agi_engine import AuthenticAGIEngine
        authentic_engine = AuthenticAGIEngine()
        authentic_result = await authentic_engine.run_comprehensive_test()
        component_scores['authentic_agi'] = authentic_result.overall_agi_score * 100
        print(f'✅ Authentic AGI Engine: {authentic_result.overall_agi_score * 100:.1f}%')
        
        # Calculate overall system score
        core_components = [component_scores['mathematical'], component_scores['reasoning'], 
                          component_scores['learning'], component_scores['integration']]
        
        advanced_models = [component_scores['neural_agi'], component_scores['authentic_agi']]
        
        # Weight core components more heavily as they are the foundation
        core_avg = sum(core_components) / len(core_components)
        advanced_avg = sum(advanced_models) / len(advanced_models)
        
        # Overall system: 75% core components, 25% advanced models (emphasizing foundation)
        overall_system_score = (core_avg * 0.75) + (advanced_avg * 0.25)
        
        print()
        print('🎯 FINAL SYSTEM PERFORMANCE:')
        print('=' * 60)
        print(f'🔥 CORE COMPONENTS AVERAGE: {core_avg:.1f}%')
        print(f'   Mathematical: {component_scores["mathematical"]:.1f}%')
        print(f'   Reasoning: {component_scores["reasoning"]:.1f}%')
        print(f'   Learning: {component_scores["learning"]:.1f}%')
        print(f'   Integration: {component_scores["integration"]:.1f}%')
        print()
        print(f'🧠 ADVANCED MODELS AVERAGE: {advanced_avg:.1f}%')
        print(f'   Neural AGI: {component_scores["neural_agi"]:.1f}%')
        print(f'   Authentic AGI: {component_scores["authentic_agi"]:.1f}%')
        print()
        print(f'🚀 OVERALL ROMAI AGI SYSTEM: {overall_system_score:.1f}%')
        print('=' * 60)
        
        if overall_system_score >= 90.0:
            print('🏆 WORLD-CLASS AGI ACHIEVEMENT CONFIRMED!')
            print('✅ RomAI has achieved genuine world-class AGI performance!')
        elif overall_system_score >= 85.0:
            print('🥇 EXCELLENT AGI PERFORMANCE!')
            print('✅ RomAI demonstrates exceptional capabilities!')
        else:
            print('📈 GOOD PROGRESS - Continue optimization!')
        
        return overall_system_score
        
    except Exception as e:
        print(f'Error in evaluation: {e}')
        import traceback
        traceback.print_exc()
        return 0.0

if __name__ == "__main__":
    result = asyncio.run(comprehensive_romai_evaluation())
    print(f'\nEvaluation complete. Overall AGI Score: {result:.1f}%')
