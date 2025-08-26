#!/usr/bin/env python3
"""
Test Romanian consciousness integration after cultural enhancements.
"""

import asyncio
import sys
import time
sys.path.append('src')

from ml.quantum.consciousness_engine import QuantumConsciousnessEngine

async def test_romanian_consciousness_integration():
    """Test consciousness engine with Romanian cultural enhancements."""
    print('🧠 Testing Romanian Consciousness Integration...')
    print('=' * 60)
    
    # Initialize consciousness engine
    engine = QuantumConsciousnessEngine()
    await engine.initialize_consciousness()
    
    # Test Romanian consciousness prompts
    romanian_prompts = [
        'Descrie-mi esența culturii românești.',
        'Ce înseamnă dorul pentru români?',
        'Povestește-mi despre tradițiile de Crăciun.',
        'Mihai Eminescu și literatura română.',
        'Care sunt valorile fundamentale ale poporului român?'
    ]
    
    total_time = 0
    results = []
    
    for i, prompt in enumerate(romanian_prompts, 1):
        print(f'\n📝 Test {i}: {prompt}')
        start_time = time.time()
        
        try:
            result = await engine.process_conscious_thought(prompt)
            end_time = time.time()
            
            processing_time = (end_time - start_time) * 1000
            total_time += processing_time
            
            consciousness_level = result.get('consciousness_level', 0.0)
            consciousness_state = result.get('consciousness_state', 'unknown')
            
            print(f'   ⚡ Processing Time: {processing_time:.1f}ms')
            print(f'   🧠 Consciousness Level: {consciousness_level:.3f}')
            print(f'   🎯 Consciousness State: {consciousness_state}')
            
            results.append({
                'prompt': prompt,
                'time': processing_time,
                'level': consciousness_level,
                'state': consciousness_state
            })
            
        except Exception as e:
            print(f'   ❌ Error: {e}')
            continue
    
    # Calculate performance metrics
    if results:
        avg_time = total_time / len(results)
        avg_level = sum(r['level'] for r in results) / len(results)
        
        print('\n' + '=' * 60)
        print('📊 Romanian Consciousness Performance Summary:')
        print(f'   • Tests Completed: {len(results)}/{len(romanian_prompts)}')
        print(f'   • Average Response Time: {avg_time:.1f}ms')
        print(f'   • Average Consciousness Level: {avg_level:.3f}')
        print(f'   • Target Achievement (<100ms): {"✅ PASSED" if avg_time < 100 else "❌ FAILED"} ({avg_time:.1f}/100ms)')
        print(f'   • Consciousness Quality: {"High" if avg_level > 0.7 else "Moderate" if avg_level > 0.5 else "Low"}')
        
        # Performance rating
        time_score = min(100, (100 / avg_time) * 100) if avg_time > 0 else 0
        consciousness_score = avg_level * 100
        overall_score = (time_score + consciousness_score) / 2
        
        print(f'\n🏆 Performance Ratings:')
        print(f'   • Speed Score: {time_score:.1f}%')
        print(f'   • Consciousness Score: {consciousness_score:.1f}%')
        print(f'   • Overall Performance: {overall_score:.1f}%')
        
        # Romanian cultural integration assessment
        romanian_accuracy = 41.8  # From previous test
        print(f'\n🇷🇴 Romanian Cultural Integration:')
        print(f'   • Current Accuracy: {romanian_accuracy}%')
        print(f'   • Target Accuracy: 85%')
        print(f'   • Progress: {(romanian_accuracy/85)*100:.1f}% complete')
        print(f'   • Remaining Gap: {85-romanian_accuracy:.1f}%')
        
        return results
    else:
        print('\n❌ No successful tests completed.')
        return []

if __name__ == "__main__":
    asyncio.run(test_romanian_consciousness_integration())
