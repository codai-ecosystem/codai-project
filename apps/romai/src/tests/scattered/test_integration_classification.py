#!/usr/bin/env python3
"""
🚀 Integration Engine Classification Test

Testing the revolutionary intelligent task classification for logical reasoning routing.
"""

import asyncio
from core.integration.integration_engine import IntegrationEngine

async def test_integration_classification():
    print('🚀 INTEGRATION ENGINE CLASSIFICATION TEST')
    print('Testing intelligent task routing for logical reasoning...')
    
    engine = IntegrationEngine()
    
    # Test logical reasoning classification
    logical_task = 'If all cats are mammals and Fluffy is a cat, what can we conclude about Fluffy?'
    
    print(f'\n📋 Test Task: {logical_task}')
    
    # Test the task classification
    task_type = engine._classify_task_type(logical_task)
    print(f'🎯 Classified as: {task_type.value}')
    
    # Test the complete integration pipeline
    result = engine.process_integration_task(logical_task)
    
    print(f'\n🔍 INTEGRATION RESULTS:')
    print(f'Success: {result.success}')
    print(f'Solution: {result.solution}')
    print(f'Confidence: {result.confidence:.1%}')
    print(f'Components Used: {len(result.component_results)}')
    
    if hasattr(result, 'component_results'):
        for cr in result.component_results:
            print(f'  - {cr.component_name}: {cr.confidence:.1%} confidence')
    
    # Expected: High confidence with proper logical reasoning routing
    if result.confidence >= 0.90:
        print(f'\n🏆 WORLD-CLASS INTEGRATION! Confidence ≥90%')
        print(f'✨ Logical reasoning routing successful!')
    elif result.confidence >= 0.75:
        print(f'\n⭐ EXCELLENT INTEGRATION! Confidence ≥75%')
        print(f'📈 Major improvement in routing!')
    else:
        print(f'\n⚠️ Need further routing optimization')
    
    return result.confidence

confidence = asyncio.run(test_integration_classification())
print(f'\n🏆 INTEGRATION CONFIDENCE: {confidence:.1%}')

if confidence >= 0.90:
    print('🎯 Ready for world-class AGI test!')
