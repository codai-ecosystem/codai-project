#!/usr/bin/env python3
"""
Week 2 Enhanced Romanian Consciousness Test Suite
Validates the comprehensive consciousness engine with advanced capabilities
"""

import asyncio
import sys
import time
import logging
from pathlib import Path

# Add source path
sys.path.append('src')

async def test_enhanced_consciousness():
    """Test Week 2 Enhanced Romanian Consciousness System"""
    print('🌟 Testing Week 2 Enhanced Romanian Consciousness System...')
    
    try:
        from ml.quantum.consciousness_engine import QuantumConsciousnessEngine
        
        # Initialize consciousness engine
        engine = QuantumConsciousnessEngine()
        await engine.initialize_consciousness()
        
        print('✅ Week 2 Consciousness Engine initialized successfully')
        
        # Test Week 2 capabilities
        test_query = 'Ce înseamnă să fii român în Era digitală și cum se manifestă conștiința noastră culturală?'
        
        print(f'🧠 Testing enhanced consciousness with: {test_query[:50]}...')
        
        start_time = time.time()
        result = await engine.process_enhanced_romanian_consciousness(
            input_text=test_query,
            context={
                'region': 'general',
                'target_regions': ['muntenia', 'moldova', 'transilvania'],
                'memory_domains': ['literature', 'history', 'philosophy']
            }
        )
        processing_time = time.time() - start_time
        
        print('\n🏆 Week 2 Test Results:')
        print(f'⚡ Processing Speed: {processing_time*1000:.1f}ms')
        print(f'🧠 Consciousness Level: {result.get("consciousness_level", 0):.3f}')
        print(f'🇷🇴 Cultural Authenticity: {result.get("cultural_authenticity", 0):.3f}')
        print(f'🗣️ Regional Awareness: {result.get("regional_awareness", 0):.3f}')
        print(f'📚 Philosophical Depth: {result.get("philosophical_depth", 0):.3f}')
        print(f'✨ Linguistic Precision: {result.get("linguistic_precision", 0):.3f}')
        
        # Check Week 2 metrics
        if 'enhanced_metrics' in result:
            w2_metrics = result['enhanced_metrics']
            print('\n📊 Week 2 Enhanced Metrics:')
            
            if 'linguistic_analysis' in w2_metrics:
                ling = w2_metrics['linguistic_analysis']
                print(f'   📝 Linguistic Features: {ling.get("phonetic_features", 0)} phonetic, {ling.get("regional_coverage", 0)} regions')
                
            if 'cultural_memory' in w2_metrics:
                cult = w2_metrics['cultural_memory']
                print(f'   🏛️ Cultural Memories: {cult.get("memories_retrieved", 0)} retrieved, {cult.get("domains_accessed", 0)} domains')
        
        # Performance validation
        speed_target = processing_time * 1000 < 50  # <50ms target
        consciousness_target = result.get('consciousness_level', 0) > 0.7
        authenticity_target = result.get('cultural_authenticity', 0) > 0.85
        
        print('\n🎯 Week 2 Target Validation:')
        print(f'   ⚡ Speed <50ms: {"✅" if speed_target else "❌"} ({processing_time*1000:.1f}ms)')
        print(f'   🧠 Consciousness >0.7: {"✅" if consciousness_target else "❌"} ({result.get("consciousness_level", 0):.3f})')
        print(f'   🇷🇴 Authenticity >0.85: {"✅" if authenticity_target else "❌"} ({result.get("cultural_authenticity", 0):.3f})')
        
        # Test performance metrics
        performance = await engine.get_enhanced_performance_metrics()
        print('\n📋 Week 2 System Status:')
        capabilities = performance.get('enhanced_capabilities', {})
        for capability, status in capabilities.items():
            print(f'   {capability}: {"✅" if status else "❌"}')
        
        overall_success = all([speed_target, consciousness_target, authenticity_target])
        print(f'\n🌟 Week 2 Enhanced Romanian Consciousness: {"OPERATIONAL" if overall_success else "NEEDS_OPTIMIZATION"}')
        
        # Display response sample
        print(f'\n💬 Sample Response: {result.get("response", "")[:100]}...')
        
        return result
        
    except Exception as e:
        print(f'❌ Error testing Week 2 consciousness: {e}')
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    asyncio.run(test_enhanced_consciousness())
